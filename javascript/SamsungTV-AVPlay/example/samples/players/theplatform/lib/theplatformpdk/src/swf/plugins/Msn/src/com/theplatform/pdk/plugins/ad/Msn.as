/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins.ad 
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.data.Overlay;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.data.TimeObject;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.events.PlayerEvent;
	import com.theplatform.pdk.parsers.IParserMsn;
	import com.theplatform.pdk.parsers.ParserMpva;
	import com.theplatform.pdk.parsers.ParserMsnV3;
	import com.theplatform.pdk.plugins.IAdPlugIn;
	import com.theplatform.pdk.utils.Debug;
	import com.theplatform.pdk.utils.PdkStringUtils;
	
	import flash.display.Sprite;
	import flash.events.ErrorEvent;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.SecurityErrorEvent;
	import flash.external.ExternalInterface;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.xml.XMLNode;

	public class Msn extends Sprite implements IAdPlugIn
	{
		private var _controller:IPlayerController;
		private var _adType:String = "MSN";
		private var VERSION:String = "1.1";
		private var _priority:Number = 1;
		
		private var _playlist:Playlist;
		private var _bc:BaseClip;
		private var _checkedClip:Clip;
		private var _banners:Array;
		private var _trackingURLs:Object;
		private var _durationTrackSent:Boolean;
		private var _prevTime:Number;
		private var _noSkip:Boolean;
		private var _msnVersion:String; // "MSNv3" or "MPVA"
		private var _msnParser:IParserMsn;
		private var _hosts:Array = new Array();
		private var _loader:URLLoader;

		
		public function Msn()
		{
			
		}
		
		public function initialize(lo:LoadObject):void
		{
			_controller = lo.controller as IPlayerController;

			var priority:Number = lo.priority;
			if (priority) _priority = priority;
	
			var hosts:String = lo.vars["hosts"] as String; // could be array or string
			_controller.trace( "lo.vars['hosts']=" + lo.vars["hosts"], "Msn", Debug.INFO);
			if (hosts && hosts.length)
				_hosts = hosts.split(",");
			
			_controller.addEventListener(PdkEvent.OnPlugInsComplete, onLoadComplete);			
			_controller.trace("*** MSN plugIn LOADED! *** version:[" + VERSION + "]", "Msn", Debug.INFO);
		}
		
		///////////////////////////////////////////////////////////////////////////////////////	
		public function onLoadComplete(e:PdkEvent):void
		{
			_controller.removeEventListener(PdkEvent.OnPlugInsComplete, onLoadComplete);
			_controller.registerAdPlugIn(this, _adType, _priority);
		}
			
		///////////////////////////////////////////////////////////////////////////////////////	
		private function isMSNUrl(checkURL:String):Boolean 
		{
			var isFound:Boolean = ( checkURL.indexOf("rad.msn.com") >= 0 );
			if (!isFound && _hosts) 
				isFound = PdkStringUtils.contains(checkURL, _hosts, 0);
			return isFound;
		}
		
		///////////////////////////////////////////////////////////////////////////////////////	
		public function isAd(bc:BaseClip):Boolean 
		{
			//Added check: if the URL isn't relative, then checking the baseURL could get you a false positive, as it will be a value that is not used for this 
			return (isMSNUrl(bc.URL) || (PdkStringUtils.isRelative(bc.URL) && isMSNUrl(bc.baseURL)) ) 
		}
		public function checkAd(clip:Clip):Boolean
		{
			var isHandled:Boolean = isMSNUrl(clip.URL);
			if (isHandled)
			{
				_noSkip = clip.baseClip.noSkip;
				_checkedClip = clip;
				
				_bc = new BaseClip()
				_playlist = new Playlist();
				_banners = new Array();
				_trackingURLs = new Object();
				loadXML(clip.URL);
			}
			_controller.trace("checkAd - IS THIS AN MSN AD? " + isHandled, "Msn", Debug.INFO);
			return isHandled;
		}
	
		private function sendOnCheckAdFailed():void
		{
			_controller.trace("--- OnCheckAdFailed (sending) ---", "Msn", Debug.INFO);
			var evt:PlayerEvent = new PlayerEvent(PlayerEvent.OnCheckAdFailed, _checkedClip );
			_controller.dispatchEvent(evt);
		}
		
		///////////////////////////////////////////////////////////////////////////////////////	
		public function adParsed(bSuccess:Boolean):void
		{
			if (bSuccess)
			{
				if (!_bc.URL.length)
				{
					// empty ad, so go to next clip
					_controller.setAds(new Playlist());
					return; // BAIL!
				}
				//set the width and height of the overlay, assuming it will always be set to 400x300
				if (_bc.overlays && _bc.overlays.length > 0)
				{
					var overlay:Overlay = _bc.overlays[0] as Overlay;
					overlay.bannerHeight = 300;
					overlay.bannerWidth = 400;
					overlay.stretchToFit = true;
				}
				
				_bc.isAd = true;
				_bc.noSkip = _noSkip;
				var clip:Clip = _controller.createClipFromBaseClip(_bc);
				_playlist.addClip(clip);
					
				_controller.addEventListener(PdkEvent.OnMediaStart, onMediaStart);					
				_controller.setAds(_playlist);
			}
			else
				sendOnCheckAdFailed();
		}
	
		///////////////////////////////////////////////////////////////////////////////////////	
		// 									T R A C K I N G
		///////////////////////////////////////////////////////////////////////////////////////	
		
		private function resetTracking():void
		{ 
			_controller.trace("clearing trackingURLs","Msn", Debug.INFO);
			_trackingURLs = new Object() }
		
		///////////////////////////////////////////////////////////////////////////////////////	
		public function onMediaStart(event:PdkEvent):void
		{
			_controller.trace("--- onMediaStart (received) --- url=[" + _trackingURLs["onload"] + "]","Msn", Debug.INFO);
			
			_durationTrackSent = false;
					
			if (_trackingURLs["durationtrack"])
				_controller.addEventListener(PdkEvent.OnMediaPlaying, onMediaPlaying);					
				
				
			_controller.addEventListener(PdkEvent.OnMediaComplete, onMediaComplete);
	
			sendURL("tpsimage");
			sendURL("onload");		
		}
		
		///////////////////////////////////////////////////////////////////////////////////////	
		public function onMediaComplete(event:Event):void
		{
			_controller.trace("--- onMediaComplete (received) ---","Msn", Debug.INFO);
			
			_controller.removeEventListener(PdkEvent.OnMediaStart, onMediaStart);
			_controller.removeEventListener(PdkEvent.OnMediaPlaying, onMediaPlaying);
			_controller.removeEventListener(PdkEvent.OnMediaComplete, onMediaComplete);
			
			sendURL("endtrack");
			resetTracking();
		}
		
		///////////////////////////////////////////////////////////////////////////////////////	
		public function onMediaPlaying(event:PdkEvent):void
		{	
			var timeObj:TimeObject = TimeObject(event.data);
			if (timeObj.currentTime >= 7500 && !_durationTrackSent)
			{
				_controller.trace("durationtrack - seconds=[" + timeObj.currentTime/1000 + "]", "Msn", Debug.INFO);
				_durationTrackSent = true;
				sendURL("durationtrack");
			}
		}
			
		///////////////////////////////////////////////////////////////////////////////////////	
		private function sendURL(type:String):void
		{
			if (_trackingURLs[type] && _trackingURLs[type].length)
			{
				_controller.trace("MsnTracking: Sending [" + type + "] to [" + _trackingURLs[type] + "]", "Msn", Debug.INFO);
				ExternalInterface.call("tpCallTrackingUrl", encodeURI(_trackingURLs[type]));
			}
		}
		
		///////////////////////////////////////////////////////////////////////////////////////	
		//				 				X M L   P A R S I N G
		///////////////////////////////////////////////////////////////////////////////////////	
		
		private function loadXML(url:String):void
		{
			_controller.trace("loading XML from: " + url, "Msn", Debug.INFO);
			
			_loader = new URLLoader();
			_loader.addEventListener(Event.COMPLETE, parseXML, false, 0, true);
			_loader.addEventListener(IOErrorEvent.IO_ERROR, handleError, false, 0, true);
			_loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, handleError, false, 0, true);
            try
            {
                _loader.load(new URLRequest(url));
            }
			catch(e:Error)
            {
                _controller.trace("call to load url failed:" + e.toString(),"Msn", Debug.ERROR);
                adParsed(false);
            }
		}
		
		private function handleError(e:ErrorEvent):void
		{
			_controller.trace("call to load url failed:" + e.toString(),"Msn", Debug.ERROR);
			adParsed(false);
		}
		
		private function parseXML(e:Event):void
		{
			var xmlString:String = e.currentTarget.data
			if (!xmlString)
			{
				_controller.trace("*** ERROR: unable to load XML","Msn", Debug.ERROR);
				adParsed(false);
				return
			}
				
			try
			{
				var adInfo:XML = new XML(xmlString);
			}
			catch(err:Error)
			{
				_controller.trace("XML could not be parsed", "Msn", Debug.ERROR);
				adParsed(false);
				return;
			}
			_controller.trace("________PARSING MSN________ :" + xmlString, "Msn", Debug.INFO);
			
			_msnVersion = (adInfo.@comment == "MSN Video Ad V3") ? "MSNv3" : adInfo.VAST ? "vast" : "MPVA";
			_controller.trace("_msnVersion=[" + _msnVersion + "]", "Msn", Debug.INFO);
			
			switch(_msnVersion)
			{
				case "MSNv3":	_msnParser = new ParserMsnV3(this, _controller); break;
				case "MPVA":	_msnParser = new ParserMpva(this, _controller); break;
                default:
                    _controller.trace("We cannot currently parse this data for MSN: giving up", "Msn", Debug.WARN);
                    adParsed(false);
                    return;
			}
			
			if (_msnParser.isEmptyAd(adInfo))
			{
				_controller.trace("EMPTY AD","Msn", Debug.INFO)
				adParsed(false); // empty ad
			}
			
			var adList:XMLList = adInfo.ad;
            var parsed:Boolean = false;//catch if there wasn't any valid data
			for each (var ad:XML in adList)
			{
				if (_msnParser.isThirdPartyAd(ad))
				{
					// third party ad
					_controller.trace("3RD PARTY AD","Msn", Debug.INFO)
					_msnParser.parseThirdPartyAd(ad);
                    parsed = true;
				}
				else
				{
					// standard ad
					_controller.trace("STANDARD AD","Msn", Debug.INFO)
					var o:Object = _msnParser.parseStandardAd(ad); // returns clip and trackingURLs
					_trackingURLs = o.trackingURLs;
					_bc = o.clip;
					adParsed (Boolean(_bc));
                    parsed = true;
				}
			}
            if (!parsed)
            {
                adParsed(false);
            }
		}
		
		///////////////////////////////////////////////////////////////////////////////////////	
		public function reloadURL(url:String):void { loadXML(url) }
	}
}
