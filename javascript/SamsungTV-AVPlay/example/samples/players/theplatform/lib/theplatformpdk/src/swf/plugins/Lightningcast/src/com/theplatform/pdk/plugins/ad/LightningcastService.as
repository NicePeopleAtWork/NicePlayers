/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins.ad 
{
	import LightningcastComponent.*;
	
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.Banner;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.HyperLink;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.data.TimeObject;
	import com.theplatform.pdk.data.TrackingUrl;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.events.PlayerEvent;
	import com.theplatform.pdk.plugins.IAdPlugIn;
	
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.external.ExternalInterface;
	import flash.utils.clearInterval;
	import flash.utils.setInterval;
	import LightningcastComponent.Lightningcast;
	import LightningcastComponent.PlaylistEntry;

	public class LightningcastService extends Sprite implements IAdPlugIn
	{
		private var _lo:LoadObject;
		private var _controller:IPlayerController;
		
		private var _adType:String = "LC";
		private var _priority:Number;
		
		// parsed from clip.URL
		private var _networkID:String;
		private var _level:String;
		private var _content:String;
		private var _contentLength:Number;
		private var _regions:String;
		private var _format:String;
		private var _attr:String;
		private var _lc:Lightningcast;
		private var _timeoutLC:Number // timeout for getting playlist from LC
		
		private var  _isContent:Boolean; // for testing
		private var _pdkPlaylist:Playlist; // ad-hoc playlist created with LC data
		private var _checkPoints:Array; // tracking
		private var _bannerRegions:Array;
		private var _beacons:Number;
			
		private var VERSION:String = "1.5";
		
		public function LightningcastService()
		{
			// default constructor
		}
		
		
		/**
		 * Initialize the lightningcast plugin
		 * @param lo loadObject
		 */
		public function initialize(lo:LoadObject):void
		{
			
			_lo = lo;
			// The LoadObject contains a reference to the controller.
			_controller = _lo.controller as IPlayerController;
		
			_priority = _lo.priority;
			 			
			 _controller.addEventListener(PdkEvent.OnPlugInsComplete, loadComplete);
	
			var beacons:Number = _lo.vars["beacons"];
			if (beacons >= 2 && beacons <= 10)
			{
				_beacons = beacons;
			}
			else 
			{
				_controller.trace("**** Error : invalid beacon value:[" + beacons + "] Using default beacon value instead:[3]", "LC");
				_beacons = 3;
			}
			
			var sBannerRegions:String = _lo.vars["bannerRegions"];
			if (sBannerRegions != null && sBannerRegions.length > 0)
			{
				_bannerRegions = sBannerRegions.split(",");	
			}
			else 
			{
				_bannerRegions = ["AU300x250","AU728x90","AU300x60","AU300x100","AU160x600","AU468x60","StandardBanner"];	
			}
			
			
			_controller.trace("*** LC PLUGIN LOADED *** version:[" + VERSION + "]", "LC");
		}	
		
		//all of the possible plugins have loaded
		private function loadComplete(e:PdkEvent):void
		{
			// Sends a message to the PDKTrace SWF included with this release. 
			// It's a good idea to remove event listeners and delegates when they aren't needed any more
			_controller.removeEventListener(PdkEvent.OnPlugInsComplete, loadComplete);
			
			_controller.registerAdPlugIn(this, _adType, _priority);
		}
		
		
		/** 
		 * is the url lightnincast
		 * @param checkURL url to check
		 * @returns true if it is, else false
		 */
		private function isLightningcastURL(checkURL:String):Boolean 
		{
			return (checkURL.indexOf("lightningcast.net") >= 0)
		}
		
		public function isAd(clip:BaseClip):Boolean 
		{
			var isLCAd:Boolean = isLightningcastURL(clip.computeUrl());
			_controller.trace("isAd=[" + isLCAd + "] url=[" + clip.computeUrl() + "]", "LC");
			 
			return isLCAd;
		}
		
		public function checkAd(clip:Clip):Boolean 
		{
			if (isLightningcastURL(clip.baseClip.computeUrl()) && parseURLParams(clip.baseClip.computeUrl()))
			{
				loadPlaylist();
				
				return true;
			}
			return false;
		}
		
		
		/**
		 * Load the LC playlist
		 */
		private function loadPlaylist():void
		{
			var me:LightningcastService = this;
			
			_lc = new Lightningcast();
			_lc.sendAuditsByDefault = false; // we'll handle the 0% and 100% audits ourselves
			_lc.networkId = _networkID;
			
			var currentPlayerPage:String = ExternalInterface.call("eval", "window.location.href");
			_lc.setPageURL(currentPlayerPage);
			
			if (_contentLength)
				_lc.setContentLength(_contentLength);
			
			_lc.setContentViewingTime(_controller.getTimeSinceLastAd());
			_lc.addEventListener("playlistLoaded", onLCPlaylistLoaded);
			
			_controller.trace("Created LC object - _networkID=[" + _networkID + "]  currentPlayerPage=[" + currentPlayerPage + "]  _contentLength=[" + _contentLength + "]", "LC");
			_controller.trace("Loading playlist - _content=[" + _content + "]  _level=[" + _level + "]  _regions=[" + _regions + "]  _format=[" + _format + "]  _attr=[" + _attr + "]", "LC");

			_lc.loadPlaylist(_content, _level, _regions, _format, _attr);
			_timeoutLC = setInterval(timeoutExpired,5000);
					
		}
		
		
		/**
		 * On lc playlist loaded 
		 * @param evt event
		 */
		private function onLCPlaylistLoaded(evt:Event):void 
		{
			clearInterval(_timeoutLC);
			_controller.trace("--- [" + evt.type + "] received from LC component ---","LC");
			onPlaylistLoaded(_lc);			
		}
		
		
		/**
		 * Time out expired
		 */
		private function timeoutExpired():void
		{
			_controller.trace("*** ERROR: Unable to load playlist","LC");
			
			_controller.trace("--- OnCheckAdFailed (sending) ---", "LC");
			
			var evt:PlayerEvent = new PlayerEvent(PlayerEvent.OnCheckAdFailed);
			
			_controller.dispatchEvent(evt);
		
			clearInterval(_timeoutLC);	
		}
		
		
		/**
		 * Parse url params
		 * @param url string of url to parse
		 * @returns Boolean true, false
		 */
		private function parseURLParams(url:String):Boolean
		{
			_networkID = "";
			_level = "";
			_contentLength = 0;
			_content = "CONTENT";
			_regions = "";
			_format = "";
			_attr = "";
			
			_controller.trace("PARSING " + url,"LC")
			var bSuccess:Boolean = true;
			var sParams:String = url.split("?")[1];
			var aParams:Array = sParams.split("&");
			for (var i:int = 0; i < aParams.length; i++)
			{
				var name:String = aParams[i].split("=")[0];
				var value:String = aParams[i].split("=")[1];
				
				switch(name)
				{
					case "nwid":	if (value.length) _networkID = value; break;
					case "level":	if (value.length) _level = value; break;					
					case "content":	if (value.length) _content = value; break;
					case "regions":	if (value.length) _regions = value; break;
					case "format":	if (value.length) _format = value;  break;
					case "attr":	if (value.length) _attr = value;    break;
					case "length":	if (!isNaN(parseInt(value))) _contentLength = parseInt(value); break;
				}
			}
			if (!_networkID.length)
			{
				_controller.trace("*** ERROR - 'nwid' is undefined.","LC");
				bSuccess = false;
			}
			if (!_level.length)
			{ 
				_controller.trace("*** ERROR - 'level' is undefined.","LC");
				bSuccess = false;
			}
			return bSuccess;
		}
		
		
		/**
		 * On playlist loaded - this method will interact with PBM and change clips
		 * @param lc lightningcast
		 */
		private function onPlaylistLoaded(lc:Lightningcast):void
		{
			_pdkPlaylist = new Playlist();
			var adClips:Array = new Array();
	
			var playlistEntry:PlaylistEntry = _lc.getNextVideo();
			
			while (playlistEntry != null)
			{
				if (playlistEntry.isAd())
				{
					var bc:BaseClip = parseEntry(playlistEntry);
					if (bc != null)
					{
						_pdkPlaylist.addBaseClip(bc);
					}
				}
				playlistEntry = null// DEBUGGING!!! _lc.getNextVideo();
			}
			
			// create the adClips to be merged into the PDK playlist
			for (var i:Number = 0; i < _pdkPlaylist.baseClips.length; i++) 
			{
				var baseClip:BaseClip = _pdkPlaylist.baseClips[i] as BaseClip;
				
				baseClip.isAd = true;
				var adClip:Clip = new Clip();
				adClip.baseClip = baseClip;
				adClip.URL = baseClip.computeUrl();
				adClip.mediaLength = 15000;//put in a default length: we're having timing issues

				_pdkPlaylist.addClip(adClip);
			}
			
			_controller.addEventListener(PdkEvent.OnMediaError, onMediaError);
			_controller.addEventListener(PdkEvent.OnMediaStart, onMediaStart);
					
			_controller.setAds(_pdkPlaylist); // set ads, which start playback
		}
		
	
		/**
		 * Parse the LC entry and turn it into a BaseClip
		 * @param playlistEntry
		 * @returns BaseClip base clip
		 */
		private function parseEntry(playlistEntry:PlaylistEntry):BaseClip
		{
			var bc:BaseClip;
		
			for (var i:int = 0; i < _bannerRegions.length; i++)
			{
				
				var bannerLC:DisplayRegion = playlistEntry.getDisplayRegion(_bannerRegions[i]);

				if (bannerLC != null)
				{
					var bannerPDK:Banner = new Banner();
					bannerPDK.src = bannerLC.href;
					bannerPDK.href = bannerLC.clickThru;
					bannerPDK.region = bannerLC.regionName;
					_pdkPlaylist.unattachedBanners.push(bannerPDK);
				}
			}
			
			if (playlistEntry.isAd() && !_isContent)
			{
				bc = new BaseClip();
				bc.author 	 = playlistEntry.author;
				bc.copyright = playlistEntry.copyright;
				bc.URL 		 = playlistEntry.href;
				bc.noSkip 	 = true;
				bc.title 	 = playlistEntry.title;
				bc.moreInfo  = new HyperLink();
				bc.moreInfo.href = playlistEntry.videoClickThru
			
				while (_pdkPlaylist.unattachedBanners.length)
				{
					var banner:Banner = _pdkPlaylist.unattachedBanners.shift();
					bc.banners.push(banner);
				}
			}
			return bc;
		}
		
		
		
		/**
		 * On media error fired
		 * @param event pdkEvent for media error
		 */
		private function onMediaError(event:PdkEvent):void 
		{
			// the player was unable to open the media...
			_controller.trace("--- OnMediaError (received) ---","LC");
			_controller.removeEventListener(PdkEvent.OnMediaError, onMediaError);
		}
		
		
		/**
		 * On media start fired
		 * @param event pdkEvent for media starting
		 */
		private function onMediaStart(event:PdkEvent):void 
		{
			_controller.trace("--- OnMediaStart (received) ---","LC");
			initTracking();
			postAudit(0,false);
			_controller.addEventListener(PdkEvent.OnMediaPlaying,  onMediaPlaying);
			_controller.addEventListener(PdkEvent.OnMediaComplete, onMediaComplete);
			
		}
		
		
		/**
		 * On media complete
		 * @param e pdkEvent for media completing
		 */
		private function onMediaComplete(e:PdkEvent):void
		{
			var clip:Clip = e.data as Clip
		
			_controller.trace("--- OnMediaComplete (received) Clip length played : " + clip.lengthPlayed + " and true length : " + clip.trueLength,"LC");
			
			try 
			{
				var pct:Number = Math.round( 100 * (clip.lengthPlayed/clip.trueLength))
				postAudit(pct,true);
			}
			catch (error:Error)
			{
				_controller.trace("Error on media complete inside LC plugin : " + error.toString(), "LC");
			}
			_controller.removeEventListener(PdkEvent.OnMediaError,    onMediaError);
			_controller.removeEventListener(PdkEvent.OnMediaStart,    onMediaStart);
			_controller.removeEventListener(PdkEvent.OnMediaPlaying,  onMediaPlaying);
			_controller.removeEventListener(PdkEvent.OnMediaComplete, onMediaComplete);
	
			resetTracking();
		}
		
		/**
		 * On media playing event
		 * @param event PdkEvent for media playing
		 */
		private function onMediaPlaying(event:PdkEvent):void 
		{
			var percentComplete:Number;
			var currentTime:Number;
			var timeObj:TimeObject;
			
			timeObj = event.data as TimeObject;
			
			percentComplete = (timeObj.percentCompleteAggregate > 0) ? timeObj.percentCompleteAggregate : timeObj.percentComplete;
			percentComplete = Math.round(percentComplete);
			
			for (var i:int=0; i<_checkPoints.length; i++)
			{
				// if tracking url hasn't fired then see if it's time
				if (!_checkPoints[i].hasFired)
				{
					// tracking URL hasn't fired
					if (percentComplete >= _checkPoints[i].triggerValue)
					{
						_checkPoints[i].hasFired = true;
						postAudit(percentComplete, false);
					}
				}
			}
		}
		
		
		/**
		 * Reset tracking
		 */
		private function resetTracking():void 
		{ 
			_checkPoints = new Array(); 
		}
		
		
		/**
		 * Init tracking
		 */
		private function initTracking():void
		{
			resetTracking();
			for (var i:int=0; i<_beacons; i++)
			{
				var checkPoint:TrackingUrl = new TrackingUrl();
				checkPoint.triggerType = TrackingUrl.TRIGGER_TYPE_PERCENTAGE;
				checkPoint.triggerValue = i * (100/(_beacons-1));
				_checkPoints.push(checkPoint);
			}
			
			_checkPoints.pop(); // 100%
			_checkPoints.splice(0,1); // 0%
			
		}
		
		/**
		 *
		 */
		private function postAudit(pct:Number, isLast:Boolean):void 
		{
			pct = Math.round(pct);
			_controller.trace("POSTING AUDIT at " + pct + "% COMPLETE  ( isLastAudit=" + isLast + "  beacons=" + _beacons + " )","LC");					
			_lc.postPctAudit( pct, isLast );
			
		}
	}
}
