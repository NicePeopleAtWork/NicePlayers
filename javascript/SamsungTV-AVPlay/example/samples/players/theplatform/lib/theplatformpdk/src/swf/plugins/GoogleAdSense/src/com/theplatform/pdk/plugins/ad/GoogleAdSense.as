/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins.ad
{
import flash.external.ExternalInterface;

	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.data.StreamType;
	import com.theplatform.pdk.data.TimeObject;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.events.PlayerEvent;
	import com.theplatform.pdk.plugins.IAdPlugIn;
	import com.theplatform.pdk.plugins.NoOpPlugIn;
	import com.theplatform.pdk.utils.Debug;

	import flash.display.Loader;
	import flash.display.MovieClip;
	import flash.events.Event;
    import flash.events.TimerEvent;
	import flash.external.ExternalInterface;
	import flash.geom.Rectangle;
	import flash.net.URLRequest;
	import flash.system.Security;
import flash.utils.Timer;

public class GoogleAdSense extends NoOpPlugIn implements IAdPlugIn
	{	
		private static const VIDEO:int = 0;
		private static const OVERLAY:int = 1;
		private static const FULL_SCREEN:int = 2;
		private static const UNKNOWN:int = 3;
		
		private var _controller:IPlayerController;
		
		private var _priority:Number = 1;
		private var _host:String = "google.com";
		private var _publisherId:String;
		private var _channels:Array;
		private var _adType:String = "video";
		private var _adTest:String;
		private var _adSafe:String;
		private var _defaultOverlayDelay:int = 10000;
		private var _enableCompanionAd:Boolean = false;
		private var _disabledControls:Boolean = false;
		
		private var _clip:Clip;
		private var _adSense:MovieClip;
		private var _pendingRequest:Object;
		private var _overlayDelay:int;
		private var _player:MovieClip;
		private var _loader:Loader;
		private const _adUrl:String = "urn:google:adsense";

       private var _errorTimer:Timer;
        private var _playerSizing:Boolean = false;
		
		public function GoogleAdSense()
		{	
		}
		
		override public function initialize(lo:LoadObject):void
		{
			super.initialize(lo);
			
			// get loadVars
			_controller = lo.controller as IPlayerController;
			
			_controller.registerAdPlugIn(this, "googleAdSense", _priority);
			
			if (lo.vars.priority) _priority = Number(lo.vars.priority);
			if (lo.vars.host) _host = lo.vars.host;
			if (lo.vars.publisherId) _publisherId = lo.vars.publisherId;
			if (lo.vars.channels) _channels = lo.vars.channels.split(",");
			if (lo.vars.adType) _adType = lo.vars.adType;
			if (lo.vars.adTest) _adTest = lo.vars.adTest;
			if (lo.vars.adSafe) _adSafe = lo.vars.adSafe;
			// note: in loadvars, the overlay delay is in seconds, so convert to milliseconds
			if (lo.vars.overlayDelay) _defaultOverlayDelay = Number(lo.vars.overlayDelay) * 1000;
			if (lo.vars.enableCompanionAd) _enableCompanionAd = Boolean(lo.vars.enableCompanionAd);
				
			// load ad sense plug-in
			_controller.trace("Requesting Google AdSense helper SWF", "GoogleAdSense", Debug.INFO);
			Security.allowDomain("pagead2.googlesyndication.com");
    		var request:URLRequest = new URLRequest("http://pagead2.googlesyndication.com/pagead/scache/googlevideoadslibraryas3.swf");
    		_loader = new Loader();
    		_loader.contentLoaderInfo.addEventListener(Event.COMPLETE, adSenseLoaded);
    		_loader.load(request);
    		addChild(_loader);
    		
    		// add listeners				
			_controller.addEventListener(PdkEvent.OnPlugInsComplete, loadComplete);
			_controller.addEventListener(PdkEvent.OnReleaseEnd, releaseEnd);
	
			_controller.trace("*** GoogleAdSense PLUGIN LOADED *** priority=[" + _priority + "] host=[" + _host + "]", "GoogleAdSense", Debug.INFO);
		}
		
		private function adSenseLoaded(e:Event):void
		{
			_adSense = e.target.content;
			_controller.trace("GoogleAdSense helper SWF loaded", "GoogleAdSense", Debug.INFO);
			if (_pendingRequest != null)
			{
				_controller.trace("Running pending ad", "GoogleAdSense", Debug.INFO);
				sendAdRequest(_pendingRequest);
			}
		}
		
		private function loadComplete(e:PdkEvent):void
		{
			_controller.removeEventListener(PdkEvent.OnPlugInsComplete, loadComplete);
			_controller.setPlugInsAboveControls(false);				
		}
		
		public function isAd(baseClip:BaseClip):Boolean 
		{
			var url:String = baseClip.computeUrl();
			return url != null && url.indexOf(_host) >= 0;
		}
		
		public function checkAd(clip:Clip):Boolean 
		{
			if (!isAd(clip.baseClip))
				return false;
			_clip = clip;
			var request:Object = getAdSenseRequest(clip);
			if (_adSense)
				sendAdRequest(request)
			else
				_pendingRequest = request;			
			return true;
		}
		
		private function sendAdRequest(request:Object):void
		{
			_controller.trace("Requesting ads", "GoogleAdSense", Debug.INFO);
            startErrorTimer();
			_adSense.requestAds(request, delegate(this, onAdsRequestResult));	
		}
		
		private function onAdsRequestResult(callbackObj:Object):void
		{
			endErrorTimer();
            _controller.trace("Ads received", "GoogleAdSense", Debug.INFO);
			if (callbackObj.success)
			{
			 	_loader.visible = true;
			 	_player = callbackObj.ads[0].getAdPlayerMovieClip();
			 	var rawAdType:String = _player.getType();
			 	_controller.trace("Ad is of type \"" + rawAdType + "\"", "GoogleAdSense", Debug.INFO);
			 	var adType:int = getAdType(_player.getType());
				connectPlayer();
			 	_player.load();
			 	if (adType == OVERLAY)
			 	{
			 		if (_overlayDelay <= 0)
			 		{
			 			playAd();	
			 		}
			 		else
			 		{
			 			_controller.addEventListener(PdkEvent.OnMediaPlaying, showOverlay);
			 		}
			 		_controller.setAds(new Playlist());
			 		return;
			 	}
			 	else if (adType == VIDEO || adType == FULL_SCREEN)
			 	{
				 	var playlist:Playlist = new Playlist();
				 	playlist.addClip(getNoOpClip());
				 	_controller.setAds(playlist);
				 	return;
			 	}
			 	else
			 	{
			 		doSendError("Unhandled ad type: \"" + adType + "\"", Debug.INFO);
			 	}
			}
			else
			{
				doSendError("Error requesting ads: " + callbackObj.errorMsg, Debug.ERROR);
			}
		}

        private function startErrorTimer():void
        {
            if (!_errorTimer)
            {
                _errorTimer = new Timer(3000, 1);
                _errorTimer.addEventListener(TimerEvent.TIMER, errorTick, false, 0, true)
            }
            _errorTimer.start();
        }

        private function endErrorTimer():void
        {
            if (_errorTimer)
            {
                _errorTimer.stop();
                _errorTimer.removeEventListener(TimerEvent.TIMER, errorTick);
                _errorTimer = null;
            }
        }

        private function errorTick(e:TimerEvent):void
        {
            doSendError("connection to google ad sense timed out", Debug.ERROR)
        }

        private function doSendError(msg:String, level:int):void
        {
            _controller.trace(msg, "GoogleAdSense", level);
            var evt:PlayerEvent = new PlayerEvent(PlayerEvent.OnCheckAdFailed, _clip);
			_controller.dispatchEvent(evt);
        }
		
		private function playAd():void
		{
			_controller.addEventListener(PdkEvent.OnControlsRefreshed, controlsReady);

			if (!_player)
			{
				_controller.trace("_player is null; cannot play ad", "GoogleAdSense", Debug.ERROR);	
			}
			else
			{
				sizePlayer();
			 	_player.playAds();
			 	// to give people a means to going past a full screen ad,
			 	// when it starts, switch the play state to paused, so that
			 	// when a user unpauses, we go to the next clip
			 	if (getAdType(_player.getType()) == FULL_SCREEN)
			 	{
			 		_controller.addEventListener(PdkEvent.OnMediaStart, pauseFullScreen);
			 	}
			}
		}
		
		private function pauseFullScreen(e:PdkEvent):void
		{
			_controller.trace("calling pause on a full-screen ad", "GoogleAdSense", Debug.INFO);
			_controller.removeEventListener(PdkEvent.OnMediaStart, pauseFullScreen);
			_controller.pause(true);
		}

		// PLAYER WIRING ----------------------------------------------------------
						
		private function connectPlayer():void
		{
			_controller.addEventListener(PlayerEvent.OnMediaAreaChanged, sizePlayer);
			_controller.addEventListener(PdkEvent.OnMediaLoadStart, mediaLoadStart);
			//_controller.addEventListener(PdkEvent.OnMediaEnd, destroyPlayer);
			_player.pauseContentVideo = delegate(this, pauseStream);
			_player.resumeContentVideo = delegate(this, resumeStream);
			_player.disableContentControls = delegate(this, disableContentControls);
			_player.enableContentControls = delegate(this, enableContentControls);
			_player.onAdEvent = delegate(this, onAdEvent);
			_player.onStateChange = delegate(this, onStateChange);
			_player.onError = delegate(this, onError);
			_player.onDestroy = delegate(this, destroyPlayer);
		}
		
		private function sizePlayer(e:PlayerEvent = null):void
		{
			if (!_playerSizing)
            {
                addEventListener(Event.ENTER_FRAME, sizeFrameHandler, false, 0, true);
                _playerSizing = true;
            }
		}

        //reduce churn by aggregating sizeplayer calls
        private function sizeFrameHandler(e:Event):void
        {
            _playerSizing = false;
            removeEventListener(Event.ENTER_FRAME, sizeFrameHandler)
            _controller.trace("OnMediaAreaChanged called", "GoogleAdSense", Debug.INFO);
			doSizePlayer(_controller.getMediaArea())
        }

        private function doSizePlayer(size:Rectangle):void
        {
            if (_player)
			{
				_player.setSize(size.width, size.height);
				_player.setX(size.x);
				_player.setY(size.y);
			}
        }

		private function mediaLoadStart(e:PdkEvent):void
		{
			_controller.trace("OnMediaLoadStart called", "GoogleAdSense", Debug.INFO);	
			var clip:Clip = e.data as Clip;
			if (clip.streamType == StreamType.EMPTY && clip.baseClip.URL.indexOf(_adUrl) == 0)
			{
				_controller.trace("Empty clip with URL of \"" + clip.baseClip.URL + "\"; handle it", "GoogleAdSense", Debug.INFO);
				loadStartChecked(true);
				playAd();
			}		
		}
		
		private function releaseEnd(e:PdkEvent):void
		{
			destroyPlayer();
			//make absolutely sure everything is gone
			_loader.visible = false;
		}	

		private function controlsReady(e:PdkEvent):void
		{
			if(_disabledControls)
			{
				_controller.disablePlayerControls(true, ["tpFullScreen"]);
			}
		}
										
		private function destroyPlayer(e:PdkEvent = null):void
		{
			if (e != null) _controller.trace("OnMediaEnd called", "GoogleAdSense", Debug.INFO);	
			if (_player != null)
			{
				if (getAdType(_player.getType) != OVERLAY) loadStartChecked(false);
				_player.destroy();
				_player = null;
			}
			_controller.removeEventListener(PlayerEvent.OnMediaAreaChanged, sizePlayer);
			_controller.removeEventListener(PdkEvent.OnMediaLoadStart, mediaLoadStart);
			_controller.removeEventListener(PdkEvent.OnMediaEnd, destroyPlayer);
			_controller.removeEventListener(PdkEvent.OnMediaPlaying, showOverlay);
                        _controller.removeEventListener(PdkEvent.OnControlsRefreshed, controlsReady);
		}
		
		private function showOverlay(e:PdkEvent):void
		{
			var time:TimeObject = e.data as TimeObject;
			if (time.currentTime >= _overlayDelay)
			{
				_controller.trace("Showing overlay", "GoogleAdSense", Debug.INFO);
				playAd();
				_controller.removeEventListener(PdkEvent.OnMediaPlaying, showOverlay);
			}
		}		
		
		// AD SENSE EVENTS ---------------------------------------------------------
		
		private function pauseStream():void
		{
			_controller.trace("\"pauseStream\" called", "GoogleAdSense", Debug.INFO);
			_controller.pause(true);
		}

		private function resumeStream():void
		{
			_controller.trace("\"resumeStream\" called", "GoogleAdSense", Debug.INFO);
			_controller.pause(false);
		}

		private function disableContentControls():void
		{
			_disabledControls = true;
			_controller.trace("\"disableContentControls\" called", "GoogleAdSense", Debug.INFO);
			_controller.disablePlayerControls(true, ["tpFullScreen"]);
		}

		private function enableContentControls():void
		{
			_disabledControls = false;
			_controller.trace("\"enableContentControls\" called", "GoogleAdSense", Debug.INFO);
			_controller.disablePlayerControls(false, []);
		}

		private function onAdEvent(event:String):void
		{
			_controller.trace("\"onAdEvent\" called with [" + event + "]", "GoogleAdSense", Debug.INFO);
			if (event == "started" && getAdType(_player.getType()) != OVERLAY)
			{
			 	_controller.trace("Calling \"mediaStarts\"", "GoogleAdSense", Debug.INFO);
				mediaStarts();
			}
			else if (event == "stopped" && getAdType(_player.getType()) != OVERLAY)
			{
				_controller.trace("Calling \"mediaEnds\"", "GoogleAdSense", Debug.INFO);
				mediaEnds();
				destroyPlayer();
			}
		}
		
		private function onStateChange(oldState:String, newState:String):void
		{
			_controller.trace("\"onStateChange\" called, from \"" + oldState + "\" to \"" + newState + "\"", "GoogleAdSense", Debug.INFO);
		}
		
		private function onError(error:String):void
		{
			_controller.trace("\"onError\" called: " + error, "GoogleAdSense", Debug.ERROR);
		}
		
		// NO OP PLUG IN ----------------------------------------------------------
		
		override public function destroy():void
		{
			_controller.trace("\"destroy\" called", "GoogleAdSense", Debug.INFO);
			super.destroy();
			destroyPlayer();
		}

		override public function mediaEndSet():void
		{
			_controller.trace("\"mediaEndSet\" called", "GoogleAdSense", Debug.INFO);
		}
		
		override public function mediaSoundLevelSet(level:Number):void
		{
			_controller.trace("\"mediaSoundLevelSet\" called", "GoogleAdSense", Debug.INFO);
		}
		
		override public function mediaMuteSet(isMuted:Boolean):void
		{
			_controller.trace("\"mediaMuteSet\" called", "GoogleAdSense", Debug.INFO);
		}
		
		override public function mediaSeekSet(position:int):void
		{
			_controller.trace("\"mediaSeekSet\" called", "GoogleAdSense", Debug.INFO);
		}

		override public function mediaPauseSet(isPaused:Boolean):void
		{
			_controller.trace("\"mediaPauseSet(" + isPaused + ")\" called", "GoogleAdSense", Debug.INFO);
			if (!isPaused && getAdType(_player.getType()) == FULL_SCREEN)
			{
				_controller.trace("Calling \"mediaEnds\"", "GoogleAdSense", Debug.INFO);
				//mediaEnds();
				//destroyPlayer();
			}
			// _player.play() doesn't seem to work to restart the video... so we don't support pause
			
			if (!isPaused)
				_player.pause();
			else
			{
				_player.play();
			}
		}

		// HELPERS ----------------------------------------------------------------
					
		private function getNoOpClip():Clip
		{
			var baseClip:BaseClip = new BaseClip();
			baseClip.noSkip = true;
			baseClip.isAd = true;
			baseClip.URL = _adUrl;
			var clip:Clip = _controller.createClipFromBaseClip(baseClip);
			clip.streamType = StreamType.EMPTY;
			clip.hasOverlayLayer = true;
			return clip;			
		}
		
		private function getAdType(adType:String):int
		{
			if (adType.indexOf("overlay") >= 0)
				return GoogleAdSense.OVERLAY;
			else if (adType.indexOf("video") >= 0)
				return GoogleAdSense.VIDEO;
			else if (adType.indexOf("fullscreen") >= 0)
				return GoogleAdSense.FULL_SCREEN;
			else
				return GoogleAdSense.UNKNOWN
		}
		
		private function getAdSenseRequest(clip:Clip):Object
		{
			// re-default any overlay delay
			_overlayDelay = _defaultOverlayDelay;
			
			// get the content base clip... we'll use it later
			var content:BaseClip = clip.baseClip.playlistRef.firstContentBaseClip;
			if (content == null) content = clip.baseClip;

			var request:Object = new Object();
			var url:String = clip.baseClip.computeUrl();
			_controller.trace("Parsing \"" + url + "\"", "GoogleAdSense", Debug.INFO);
			var queryStart:int = url.indexOf("?");
			if (queryStart != -1 && (queryStart + 1) < url.length)
			{
				var sParams:String = url.substring(queryStart + 1);
				var aParams:Array = sParams.split("&");
				for (var i:int = 0; i < aParams.length; i++)
				{
					var name:String = aParams[i].split("=")[0];
					var value:String = aParams[i].split("=")[1];
					_controller.trace("Found \"" + name + "\" parameter with a value of \"" + value + "\"", "GoogleAdSense", Debug.INFO);
					if (name == "channels")
					{
						request[name] = value.split(",");
					}
					else if (name == "overlayDelay")
					{
						_overlayDelay = int(value) * 1000;		
					}
					else
					{
						request[name] = value;
					}
				}
			}
			
			// required for all ads
			if (!request.publisherId)
			{
				if (_publisherId)
					request.publisherId = _publisherId;
				else
					_controller.trace("Missing \"publisherId\" parameter", "GoogleAdSense", Debug.ERROR);
			}
			if (!request.channels)
			{
				if (_channels)
					request.channels = _channels;
				else
					_controller.trace("Missing \"channels\" parameter", "GoogleAdSense", Debug.ERROR);
			}
			if (!request.adType)
			{
				request.adType = _adType;
				_controller.trace("Setting \"adType\" to " + request.adType, "GoogleAdSense", Debug.INFO);
			}
			if (!request.descriptionUrl)
			{
				try
				{
					request.descriptionUrl = ExternalInterface.call("eval", "window.location.href");
					_controller.trace("Setting \"descriptionUrl\" to " + request.descriptionUrl, "GoogleAdSense", Debug.INFO);	
				}
				catch (e:Error)
				{
					_controller.trace("\"descriptionUrl\" was not provided, and couldn't be fetched from page", "GoogleAdSense", Debug.WARN);
				}
			}
			if (!request.pubWidth)
			{
				request.pubWidth = _controller.getMediaArea().width;
				_controller.trace("Setting \"pubWidth\" to " + request.pubWidth, "GoogleAdSense", Debug.INFO);
			}
			if (!request.pubHeight)
			{
				request.pubHeight = _controller.getMediaArea().height;
				_controller.trace("Setting \"pubHeight\" to " + request.pubHeight, "GoogleAdSense", Debug.INFO);
			}
			if (!request.contentId)
			{
				request.contentId = content.contentID;
				_controller.trace("Setting \"contentId\" to " + request.contentId, "GoogleAdSense", Debug.INFO);
			}
			
			// optional for all ads
			if (!request.adTest && _adTest)
			{
				request.adTest = _adTest;
				_controller.trace("Setting \"adTest\" to " + request.adTest, "GoogleAdSense", Debug.INFO);				
			}
			if (!request.adSafe && _adSafe)
			{
				request.adSafe = _adSafe;
				_controller.trace("Setting \"adSafe\" to " + request.adSafe, "GoogleAdSense", Debug.INFO);				
			}
			if (!request.enableCompanionAd)
			{
				request.enableCompanionAd = _enableCompanionAd;
				_controller.trace("Setting \"enableCompanionAd\" to " + request.enableCompanionAd, "GoogleAdSense", Debug.INFO);
			}
			
			// required for video ads
			if (getAdType(request.adType) == VIDEO)
			{
				if (!request.adTimePosition)
				{
					request.adTimePosition = -1;
					_controller.trace("Setting \"adTimePosition\" to " + request.adTimePosition, "GoogleAdSense", Debug.INFO);
				}
				if (!request.maxTotalAdDuration)
				{
					request.maxTotalAdDuration = 30000;
					_controller.trace("Setting \"maxTotalAdDuration\" to " + request.maxTotalAdDuration, "GoogleAdSense", Debug.INFO);
				}
			}
			request.videoFlvUrl = content.computeUrl();
			
			_controller.trace("Setting \"videoFlvUrl\" to " + request.videoFlvUrl, "GoogleAdSense", Debug.INFO);
			return request;
		}
		
		public static function delegate(scope:Object, handler:Function):Function
		{
			var fn:Function = function():*
			{
				return handler.apply(scope, arguments);
			}
			return fn;
		}
	}
}
