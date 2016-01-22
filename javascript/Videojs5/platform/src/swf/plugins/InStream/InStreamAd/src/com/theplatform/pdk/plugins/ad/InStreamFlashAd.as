/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins.ad
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.data.TimeObject;
	import com.theplatform.pdk.data.StreamType;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.events.PlayerEvent;
	import com.theplatform.pdk.plugins.instream.InStreamBridge;
	import com.theplatform.pdk.utils.Debug;
  	import com.google.ads.instream.api.AdEvent;
	
	import flash.display.DisplayObject;
	import flash.display.Sprite;
	import flash.external.ExternalInterface;
	import flash.geom.Rectangle;
	
	public class InStreamFlashAd extends Sprite
	{
		private var _cleanupHandlers:Function = function():void {};
		private var _controller:IPlayerController;
		private var _instreamBridge:InStreamBridge;
		private var _inStreamVideo:InStreamVideoAd;
		private var _inStreamBannerFactory:InStreamBannerFactory;
		
		private var _overlaySize:String;
		private var _start:Number;			 // when the first overlay should appear (in seconds)
		private var _duration:Number;		 // how long to show the overlay (in seconds)
		private var _interval:Number;		 // how long after the previous overlay ends to show the next overlay (in seconds)
		private var _overlayCountMax:Number; // how many overlays to show
		private var _overlayURL:String;
		private var _isFirstResume:Boolean;
		
		private var _mainInStreamUrl:String;
		
		// optional call to rewrite InStream URL
		private var _adKit:String;
		
		// states
		private var _wasOverlayPassed:Boolean;
		private var _noSkip:Boolean;
		private var _isOverlayShowing:Boolean = false;
		private var _overlayCount:Number = 0;
		
		// exceptions for News Digital Media
		private var _closeOverlayOnClick:Boolean = true;
		private var _getBannersForOverlay:Boolean = true;
		private var _flashAd:IFlashAd = null;
		private var _flashLinearManager:FlashLinearManager = null;
		
		public function InStreamFlashAd(controller:IPlayerController, 
										instreamBridge:InStreamBridge, 
										adKit:String, 
										plugInVars:Object,
										inStreamVideo:InStreamVideoAd,
										inStreamBannerFactory:InStreamBannerFactory)
		{
			_controller = controller;
			_instreamBridge = instreamBridge;
			_inStreamVideo = inStreamVideo;
			_inStreamBannerFactory = inStreamBannerFactory;

			var overlaySize:String	= plugInVars["overlaySize"] as String;
			var start:Number 		= Number(plugInVars["start"]);		// when the first overlay should appear (in seconds)
			var duration:Number 	= Number(plugInVars["duration"]);	// how long to show the overlay (in seconds)
			var interval:Number 	= Number(plugInVars["interval"]);	// how long after the previous overlay ends to show the next overlay (in seconds)
			var count:Number 		= Number(plugInVars["count"]);		// how many overlays to show
			
			var closeOverlayOnClick:Boolean  = plugInVars["closeOverlayOnClick"] as Boolean;	// whether or not to close the overlay on click
			var getBannersForOverlay:Boolean = plugInVars["getBannersForOverlay"] as Boolean;	// whether or not to get banners for an overlay
			
			if (overlaySize && overlaySize.length)
				_overlaySize = overlaySize;
				
			// any overrides for default overlay behavior
			_closeOverlayOnClick = (!closeOverlayOnClick ? true : closeOverlayOnClick);
			_getBannersForOverlay = (!getBannersForOverlay ? true : getBannersForOverlay);
			
			// if missing, show overlay immediately and for the duration of the clip.
			// if less than zero or doesn't parse, we assume it's 0.
			if (start)
			{
				start = Number(start);
				if (start<0 || isNaN(start))
					_start = 0;
				else
					_start = start;
			}
			
			// if undefined or <=0, then once an overlay appears, it stays up
			duration = Number(duration);
			_duration = (duration>0) ? duration : 0;
			
			// if undefined or <=0, then show the next overlay immediately
			interval = Number(interval);
			_interval = (interval>0) ? interval : 0;
			
			// if undefined or <=0, then assume there's no limit; we'll keep showing overlays forever
			count = Number(count);
			_overlayCountMax = (count>0) ? count : 0;	
			
			_controller.trace("%%%% overlaySize=[" + _overlaySize + "]", "InStream");
			_controller.trace("%%%% start=[" + _start + "], duration=[" + _duration + "], interval=[" + _interval + "], count=[" + _overlayCountMax + "]", "InStream");
			_controller.trace("%%%% closeOverlayOnClick=[" + _closeOverlayOnClick + "], getBannersForOverlay=[" + _getBannersForOverlay + "]", "InStream");
			
		}
		
		public function start(ad:IFlashAd, mainInstreamUrl:String, mustSetAds:Boolean):void
		{
            _flashAd = ad;
				
			var handlers:Object = {
				"OnMediaPlaying" : function(e:PdkEvent):void {
					onMediaPlaying(ad, e);
				},

				"onMediaEnd" : function(e:PdkEvent):void {
					onMediaEnd(ad, e);
				},

				"onMediaComplete" : function(e:PdkEvent):void {
					onMediaComplete(ad, e);
				},

				"onAreaChanged" : function(e:PlayerEvent):void {
					onAreaChanged(ad, e);
				},

				"onReleaseEnd" : function(e:PdkEvent):void {
					onReleaseEnd(ad, e);
				}
			};


			_flashAd.addEventListener(AdEvent.CONTENT_PAUSE_REQUESTED, onPauseRequested, false, 0, true);
			_flashAd.addEventListener(AdEvent.CONTENT_RESUME_REQUESTED, onResumeRequested, false, 0, true);

			_mainInStreamUrl = mainInstreamUrl;

			_controller.trace("%%% onFlashAssetLoaded!", "instream", Debug.INFO);
			
			// figure out if it's an overlay or a take-over.  overlays allow the next clip to
			// play.  take-overs occupy the entire video region, and stay up until they close
			// this is now determined by ad.linear.  We got this added by Google. JL 1/5/2012
			ad.manager.x = 0; //Math.max(0, overlayArea.width/2 - ad.asset.getWidth()/2);
			ad.manager.y = 0; //Math.max(0, overlayArea.height - ad.asset.getHeight());
			repositionOverlay(ad);
			
			// add the listener to handle full-screen transitions
			_controller.addEventListener(PlayerEvent.OnMediaAreaChanged, handlers.onAreaChanged);
			_controller.addEventListener(PlayerEvent.OnOverlayAreaChanged, handlers.onAreaChanged);

			if (!mustSetAds && ad.linear) // TAKE-OVER
			{
				getCompanions(ad);

				_isFirstResume = true;
				
				_controller.addEventListener(PdkEvent.OnMediaLoadStart, onMediaLoadStart);
			}
			else // REGULAR OVERLAY
			{
				// if there's no instreamAd, we pair up the overlay with the next clip 
				if (mustSetAds)
				{
					if (!_wasOverlayPassed)
					{
						_overlayCount = 0;
						
						// 1st overlay
						_controller.trace("Passing overlay to next clip!","InStream");
						_wasOverlayPassed = true;
						//cleanUp();


						_controller.addEventListener(PdkEvent.OnMediaPlaying, handlers.OnMediaPlaying);
						_controller.addEventListener(PdkEvent.OnMediaEnd, handlers.onMediaEnd);
						_controller.addEventListener(PdkEvent.OnMediaComplete, handlers.onMediaComplete);
						_controller.addEventListener(PlayerEvent.OnMediaAreaChanged, handlers.onAreaChanged);
						_controller.addEventListener(PlayerEvent.OnOverlayAreaChanged, handlers.onAreaChanged);
						_controller.addEventListener(PdkEvent.OnReleaseEnd, handlers.onReleaseEnd);

						_cleanupHandlers = function():void {
							_controller.removeEventListener(PdkEvent.OnMediaPlaying, handlers.OnMediaPlaying);
							_controller.removeEventListener(PdkEvent.OnMediaEnd, handlers.onMediaEnd);
							_controller.removeEventListener(PdkEvent.OnMediaComplete, handlers.onMediaComplete);
							_controller.removeEventListener(PlayerEvent.OnMediaAreaChanged, handlers.onAreaChanged);
							_controller.removeEventListener(PlayerEvent.OnOverlayAreaChanged, handlers.onAreaChanged);
							_controller.removeEventListener(PdkEvent.OnReleaseEnd, handlers.onReleaseEnd);
						};

						_controller.setAds(new Playlist());
					}
					else // nth overlay
					{
						if (_getBannersForOverlay)
						{
							getCompanions(ad);
						}
						ad.play(this);
						_isOverlayShowing = true;
					}
				}
				else // show the overlay with the videoAd
				{
					_controller.trace("SHOWING OVERLAY","INSTREAM***")
					if (_getBannersForOverlay)
					{
						getCompanions(ad);
					}
					ad.play(this);
					_isOverlayShowing = true;
				}
			}
		}
		
		private function onPauseRequested(e:AdEvent):void
		{
			_controller.pause(true);
		}

		private function onResumeRequested(e:AdEvent):void
		{
			_controller.pause(false);
			if (_isFirstResume && _flashAd.linear)
			{
				_controller.disablePlayerControls(false);
				_isFirstResume = false;
				_flashLinearManager.end();
			}
		}

		public function createBaseClip(noSkip:Boolean):BaseClip
		{
			//_controller.trace("Preparing clip for ad ID [" + _videoAd.getDartId() + "]", "InStream");
			var bc:BaseClip = new BaseClip();
			
			bc.URL = "";
			bc.author = "";
			bc.title = "";
			bc.isAd = true;
			bc.noSkip = noSkip;
	   		
			return bc;
		}

		
		private function repositionOverlay(ad:IFlashAd):void
		{
			var overlayArea:Rectangle = _controller.getOverlayArea();
			var mediaArea:Rectangle = _controller.getMediaArea();

			this.graphics.clear();

			if (ad.linear)
			{
				// center align for takeovers
				this.x = 0;
				this.y = 0;
//				ad.asset.x = 0; //Math.max(0, overlayArea.width/2 - ad.asset.getWidth()/2);
//				ad.asset.y = 0; //Math.max(0, overlayArea.height/2 - ad.asset.getHeight()/2);
/*				this.graphics.beginFill(0x000000);
				this.graphics.drawRect(0, 0, mediaArea.width, mediaArea.height);
				this.graphics.endFill();
*/			}
			else
			{
				// bottom middle align for overlays
				// TODO: allow for more than bottom-middle alignment; would require new FlashVar
				// TODO: use a common function between this, OverlayView, and ClipInfo
				this.x = Math.max(0, overlayArea.width/2 - ad.asset.getWidth()/2);
				this.y = Math.max(0, overlayArea.height - ad.asset.getHeight());
				// ad.asset.x = Math.max(0, overlayArea.width/2 - ad.asset.getWidth()/2);
				// ad.asset.y = Math.max(0, overlayArea.height - ad.asset.getHeight());
			}
			_controller.trace("OVERLAY POSITIONED AT: " + ad.manager.x + "," + ad.manager.y, "InStreamFlashAd");
		}
		
		private function getCompanions(ad:IFlashAd):void
		{
			_controller.trace("Checking for companion banners for an F2F ad", "InStreamFlashAd");
			var clip:Clip = new Clip();
			clip.baseClip = new BaseClip();
			clip.baseClip.banners = _inStreamBannerFactory.getBanners(ad, _mainInStreamUrl);
			if (clip.baseClip.banners && clip.baseClip.banners.length > 0)
   			{
				_controller.trace("There are " + clip.baseClip.banners.length + " banners; calling setClipInfo", "InStreamFlashAd");
 				_controller.setClipInfo(clip);
			}
		}
		
		private function cleanUp():void
		{
			_cleanupHandlers();
		}
	
		///////////////////////////////////////////////////////////////////////////////////////
		// OVERLAY DISPLAY & RECURRENCE MANAGEMENT DEPT
		///////////////////////////////////////////////////////////////////////////////////////	
		private function checkOverlayRecurrence(ad:IFlashAd, curSeconds:Number):void
		{
			
			// if overlaySize not defined in canvas, we don't show overalys
			if (_overlaySize == null && !_wasOverlayPassed)
				return // BAIL!!!
	
			_controller.trace("_____checkOverlayRecurrence...", "InStream")
			_controller.trace("%%%% curSeconds=[" + curSeconds + 	"] getShowTime=[" + getShowTime() + 
				"] isShowTime=[" + isShowTime(curSeconds) + 
				"] getHideTime=[" + getHideTime() + 
				"] isHideTime=[" + isHideTime(curSeconds) + 
				"] _start=[" + _start +
				"] _isOverlayShowing=[" + _isOverlayShowing +
				"] _overlayCount=[" + _overlayCount + "]", "INSTREAM***")
															
			// if start is undefined, we skip all this recurrence logic, and 
			// just show the overlay immediately and for the duration of the clip.
			if (isNaN(_start))
			{
				if (_overlayCount<1)
				{
					_controller.trace("################### _start is undefined - getting overlay!","######")
					fetchOverlay(ad, false);
				}
				return; // BAIL!
			}
			
	
			// is it time to HIDE an overlay?
			if (isHideTime(curSeconds) && _isOverlayShowing)
				removeOverlay(ad);
			
			// is it time to SHOW an overlay?
			
			//Debug.trace("show at: " + getShowTime() + "  _overlayCount=" + _overlayCount)
			if (isShowTime(curSeconds))
			{
				// is this the first one?
				if (!_overlayCount)
				{
					if (!_isOverlayShowing)
						fetchOverlay(ad, false);
				}
				else // nth overlay
				{
					if (!isOverlayLimitReached() && !_isOverlayShowing)
						fetchOverlay(ad, true);
				}
			}
		}
		
		private function isShowTime(curSeconds:Number):Boolean { return (getShowTime() <= curSeconds) }
		private function isHideTime(curSeconds:Number):Boolean 
		{
			//Debug.trace("hideTime:" + getHideTime() + "  curSeconds:" + curSeconds + "  _duration:" + _duration,"InStream")
			return ( ( getHideTime() <= curSeconds) && _duration>0 ) 
		}
		private function getShowTime():Number 				   
		{
			//Debug.trace("getShowTime- _start=" + _start + "  _duration=" + _duration + "  _interval=" + _interval + "  _overlayCount=" + _overlayCount,"INSTREAM")
			return ( _start + (_duration + _interval) * _overlayCount) 
		}
		private function getHideTime():Number 				   
		{ 
			return ( (_start + (_duration + _interval) * (_overlayCount == 0 ? 0 : _overlayCount - 1)) + _duration) 
		}
		private function isOverlayLimitReached():Boolean 	   { return (_overlayCount >= _overlayCountMax && _overlayCountMax>0) }
		private function removeOverlay(ad:IFlashAd):void
		{
			_controller.trace("REMOVING overlay...","InStream")
			_isOverlayShowing = false;
			ad.unload();
		}
	
		private function fetchOverlay(ad:IFlashAd, isNthOverlay:Boolean):void
		{
			var request:PdkAdsRequest = new PdkAdsRequest();
			
			repositionOverlay(ad);

			_controller.trace("FETCHING OVERLAY - isNthOverlay=[" + isNthOverlay + ", " + _inStreamVideo.isPresent + "]","InStream");
			if (!_inStreamVideo.isPresent)
			{	
				if (!isNthOverlay)
				{
					if (_getBannersForOverlay)
					{
						getCompanions(ad);
					}

					ad.play(this);
					_isOverlayShowing = true;
				}
				else
				{
					request.adTagUrl = _overlayURL;
					_instreamBridge.loadFromIAdsRequest(request);
				}
			}
			else // videoAd overlay
			{
				if (!isNthOverlay)
				{
					var newSizeURL:String = InStreamUtils.updateSize(_mainInStreamUrl, _overlaySize);
					_overlayURL = _inStreamVideo.getRoadblockURL(newSizeURL);
					
					if (_adKit && _adKit.length)
					{
						_controller.trace("Calling JavaScript function " + _adKit + "(\"" + _overlayURL + "\")", "InStream");
						_overlayURL = String(ExternalInterface.call(_adKit, _overlayURL));
					}
				}
				_controller.trace("CALLING loadAdByURL(" + _overlayURL + ")","InStream");
				request.adTagUrl = _overlayURL;
				_instreamBridge.loadFromIAdsRequest(request);
			}
			_overlayCount++;
		}
		
		
		public function reset():void
		{
			_isOverlayShowing = false;
			_overlayCount = 0;			
		}
		
		// why is this not being used? is this dead code?	
		/*private function onMediaStart(event:PdkEvent) :void
		{
			_controller.trace("RECEIVED: onMediaStart  _overlaySize=[" + _overlaySize + "]  _start=[" + _start + "]", "InStream");

			// check if we need to display an overlay at the start
			//var playerTime:TimeObject = _controller.getPlayerTime();	
			//checkOverlayRecurrence(playerTime.currentTime/1000); 
			checkOverlayRecurrence(ad, 0); // REVIEW: shouldn't it always be zero at this point?
				
			// activate listeners
			_controller.addEventListener(PdkEvent.OnMediaPlaying, onMediaPlaying);
			_controller.addEventListener(PdkEvent.OnMediaEnd, onMediaEnd);
			_controller.addEventListener(PdkEvent.OnMediaComplete,onMediaComplete);
		}*/

		
		private function onMediaLoadStart(e:PdkEvent):void
		{
			var clip:Clip = e.data as Clip;

			_controller.trace("OnMediaLoadStart received: " + clip.title, "InStreamFlashAd");
			
			if (clip.streamType == StreamType.EMPTY)
			{
				_controller.removeEventListener(PdkEvent.OnMediaLoadStart, onMediaLoadStart);

				// start the video...	        
				_controller.trace("Starting the Ad", "InStreamFlashAd");
				var pdkFlashPlayback:PdkFlashPlayback = new PdkFlashPlayback(_flashAd);
				_flashLinearManager = new FlashLinearManager(_controller, pdkFlashPlayback, clip, this);
				_flashLinearManager.start();
				_controller.disablePlayerControls(true);
			}
		}

		private function onMediaPlaying(ad:IFlashAd, e:PdkEvent):void
		{
			var timeObj:TimeObject = e.data as TimeObject;
			if (_overlaySize != null || _wasOverlayPassed)
				checkOverlayRecurrence(ad, timeObj.currentTime/1000); // seconds
		}
		
		private function onMediaEnd(ad:IFlashAd, e:PdkEvent):void
		{
			if (_wasOverlayPassed)
			{
				_wasOverlayPassed = false;
				_controller.trace("checkAd - closing a passed overlay...", "InStream");
				removeOverlay(ad);
				cleanUp(); // remove listeners
			}

		}
		
		private function onMediaComplete(ad:IFlashAd, e:PdkEvent):void
		{	
		}
		
		private function onAreaChanged(ad:IFlashAd, e:PlayerEvent):void
		{
			repositionOverlay(ad);			
		}
		
		private function onReleaseEnd(ad:IFlashAd, e:PdkEvent):void
		{
			removeOverlay(ad);
			cleanUp();
		}
		
		private function onMediaError(e:PdkEvent) :void
		{
			// the player was unable to open the media...
			_controller.trace("*** ERROR: player couldn't open media", "InStream");
			cleanUp()
		}
		
	}
}
