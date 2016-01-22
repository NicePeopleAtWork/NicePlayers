package com.theplatform.pdk.plugins 
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.Banner;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.data.StreamType;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.events.PlayerEvent;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.display.DisplayObject;
	import flash.display.Loader;
	import flash.events.ErrorEvent;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.ProgressEvent;
	import flash.events.TimerEvent;
	import flash.geom.Rectangle;
	import flash.net.URLRequest;
	import flash.utils.Timer;
	import flash.utils.setTimeout;

	public class Vpaid extends NoOpPlugIn implements IAdPlugIn, IDestroyablePlugIn
	{
		public var controller:IPlayerController;
		protected var _scrubberTimer:Timer;
		protected var _soundLevel:Number;
		protected var _muted:Boolean;
		protected var _position:Number;
		protected var _pauseStateMachine:PauseStateMachine;
		protected var _currentAd:Clip;
		protected var _clip:Clip;
		protected var _mediaArea:Rectangle;
		protected const _class:String = "Vpaid";
		
		protected var _loader:Loader;
		protected var _loadTimer:Timer;
		protected var _loadPercentage:Number;
        protected var _useRemainingTime:Boolean = false;
        protected var _linearPending:Boolean = false;
        protected var _loadStartChecked:Boolean = false;
        protected var _waitingForPossibleIndecisiveLinearAd:Boolean = false;
        protected var _injectionPending:Boolean = false;
        protected var _adVideoStarted:Boolean = false;
        protected var _adVideoStarting:Boolean = false;
        protected var _adVideoComplete:Boolean = false;
        protected var _adStarted:Boolean = false;
        protected var _adStopped:Boolean = false;
        protected var _adLoading:Boolean = false;
		
		protected var _swf:DisplayObject;
		protected var _adWrapper:VPAIDWrapper;
		
		protected var _errorTimer:Timer;
		protected const LOAD_TIMEOUT:int = 5000;
		protected const INIT_TIMEOUT:int = 5000;
		protected const START_TIMEOUT:int = 5000;
		protected const RESUME_TIMEOUT:int = 5000;
		protected const LOAD:String = "load";
		protected const INIT:String = "init";
		protected const START:String = "start";
		protected const RESUME:String = "resume";
		protected const NONE:String = "none";
		protected var _errorStage:String = NONE;//"load","init","start","resume"
		
		public function Vpaid()
		{
		}
		
		override public function initialize(lo:LoadObject):void
		{
			super.initialize(lo);
			controller = lo.controller as IPlayerController;
			
			controller.addEventListener(PdkEvent.OnReleaseStart, handleReleaseStart);
			controller.addEventListener(PdkEvent.OnReleaseEnd, handleReleaseEnd)
			controller.addEventListener(PdkEvent.OnMediaLoadStart, handleMediaLoadStart);
			controller.addEventListener(PdkEvent.OnMediaEnd, handleMediaEnd);
			controller.trace("registering ad plugin with priority [" + lo.priority + "]", _class, Debug.INFO);
			controller.registerAdPlugIn(this, "VPAID", lo.priority);
			
			controller.setPlugInsAboveControls(false);
			
			var pauseOnExpand:Boolean = lo.vars["pauseOnExpand"] == "false" ? false : true;//default to true
			_pauseStateMachine = new PauseStateMachine(this, pauseOnExpand);
		}
		
		override public function destroy():void
		{
			controller.removeEventListener(PdkEvent.OnMediaLoadStart, handleMediaLoadStart);
			controller.removeEventListener(PdkEvent.OnMediaEnd, handleMediaEnd);
			
			cleanUp();
			
			if (_loader)
			{
				_loader.contentLoaderInfo.removeEventListener(Event.COMPLETE, onLoaderCompleteHandler);
				_loader.contentLoaderInfo.removeEventListener(IOErrorEvent.IO_ERROR, onLoaderErrorHandler);
				try
				{
					_loader.close();
				}
				catch (e:Error) {};
				_loader = null;
			}
			if (_loadTimer)
			{
				if (_loadTimer.running) _loadTimer.stop();
				_loadTimer.removeEventListener(TimerEvent.TIMER, loadTimeHandler);
				_loadTimer = null;
			}
			if (_errorTimer)
			{
				endErrorStage(_errorTimer, _errorStage);
				_errorTimer = null;
			}
			
			super.destroy();
		}
				
		// this is called by the controller on every clip
		public function isAd(bc:BaseClip):Boolean
		{
			var result:Boolean = false;
			
			if ((bc.type == "application/x-shockwave-flash" || bc.type == "swf") || (_clip && _clip.baseClip.URL == bc.URL))
			{
				result =  true;
			}
			else
			{
				result = false;
			}

			controller.trace("is this a VPAID ad? [" + bc.type + ": " + result + "]", _class, Debug.INFO);
			return result;
		}
		
		public function checkAd(clip:Clip):Boolean
		{
			if (isAd(clip.baseClip) && clip.streamType != StreamType.EMPTY)
			{
				_clip = clip;
				_adStopped = false;
				loadAd();

				controller.trace("loading the VPAID ad", _class, Debug.INFO);
				if (clip.baseClip.isOverlay)
				{
					// TODO move this logic into contentClip.overlays...
					// we don't want a clip here, kill the URL so it won't try to play...
					controller.trace("VPAID came from a NonLinear VAST element, skipping until injectPlaylist", _class, Debug.INFO);
					clip.baseClip.URL = "";
					clip.streamType = "empty";
					_linearPending = true;
					return false;
				}
				else
				{
					controller.trace("Signing up to play this ad", _class, Debug.INFO);
					_adLoading = true;
					return true;
				}
			}
			
			return false;
		}   
				
		protected function loadAd():void
		{
			// load clip.baseClip.url, which is a swf, here
			if (!_loader)
			{
				_loader = new Loader();
				_loader.contentLoaderInfo.addEventListener(Event.COMPLETE, onLoaderCompleteHandler, false, 0, true);
				_loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, onLoaderErrorHandler, false, 0, true);
			}
			if (!_errorTimer)
			{
				_errorTimer = new Timer(1000, 1);
			}
			
			var request:URLRequest = new URLRequest(_clip.baseClip.URL);
			try
			{
				_loader.load(request);
				startErrorStage(_errorTimer, LOAD);
				if (!_loadTimer)
				{
					_loadTimer = new Timer(300);
					_loadTimer.addEventListener(TimerEvent.TIMER, loadTimeHandler, false, 0, true);
				}
				_loadTimer.start();
			}
			catch (e:Error)
			{
				mediaError(e.toString());
			}			
		}
		
		protected function onLoaderCompleteHandler(e:Event):void
		{
			_loadTimer.stop();
			if (_loadTimer.running) _loadTimer.stop();
			_loadTimer.removeEventListener(TimerEvent.TIMER, loadTimeHandler);
			_loadTimer = null;
			
			endErrorStage(_errorTimer, LOAD);

			_swf = e.currentTarget.content as DisplayObject;

			_adWrapper = new VPAIDWrapper(_swf);
						
			var adVersion:String = _adWrapper.handshakeVersion("1.1");//TODO: what to do with adVersion?
			controller.trace("handshake version: " + adVersion, _class, Debug.INFO);
			if (adVersion == null)
			{
				//this ad doesn't have a valid interface
				mediaError("ad api has no handshake function; it's either not implemented correctly or implemented for a non-generalized framework that we don't understand");
				return;
			}

			addVPaidHandlers(_adWrapper);						
			this.addChild(_swf);
			doInitAd();
		}
		
		protected function onLoaderErrorHandler(e:ErrorEvent):void
		{
			mediaError(e.toString());
		}
		
		protected function loadTimeHandler(e:TimerEvent):void
		{
			_loadPercentage = _loader.contentLoaderInfo.bytesLoaded / _loader.contentLoaderInfo.bytesTotal;
			mediaLoading(_loadPercentage, 100); 
		}

		protected function handleReleaseStart(e:PdkEvent):void
		{
			cleanUp();	
		}

		protected function handleReleaseEnd(e:PdkEvent):void
		{
			cleanUp();	
		}

		protected function handleMediaLoadStart(e:PdkEvent):void
		{
			//controller.trace("OnMediaLoadStart called", _class, Debug.INFO);	
			var clip:Clip = e.data as Clip;

			if (!clip.isAd) return;

			else if (clip.streamType != StreamType.EMPTY)
			{
				//controller.trace("Not an empty stream type; ignore", _class, Debug.INFO);
			}
			else if (clip.baseClip.URL.indexOf(_clip.baseClip.URL) != 0)
			{
				controller.trace("Empty stream type, but not from this plug-in; ignore", _class, Debug.INFO);				
			}
			else if (_adWrapper && (_adWrapper.adLinear || _adVideoStarting))
			{
				controller.trace("ad is linear, starting playback...", _class, Debug.INFO);
				controller.trace("Opening NoOp Bridge", _class, Debug.INFO);				
				loadStartChecked(true);//we must tell the bridge that we've found the clip we want to play--this prevents us from getting events from other no-op clips that we may not want to hear from
				_loadStartChecked = true;

				// if there was a linear pending, the AdVideoStart event already happened, so we call doStartAdVideo() manually
				if (_linearPending)
				{
					_linearPending = false;
					setTimeout(function():void
					{
						doStartAdVideo();
					}, 1);
				}

				controller.trace("URL is \"" + clip.baseClip.URL + "\"; handle it", _class, Debug.INFO);
				playAd(clip);
			}
			else
			{
				controller.trace("ad is not linear, resuming content playback...", _class, Debug.INFO);
				loadStartChecked(true);//we must tell the bridge that we've found the clip we want to play--this prevents us from getting events from other no-op clips that we may not want to hear from
				_loadStartChecked = true;
				_waitingForPossibleIndecisiveLinearAd = true;
				setTimeout(function()
				{
					mediaStarts();
				}, 1);
			}
		}

		protected function handleMediaEnd(e:PdkEvent):void
		{
			// this is probably just a natural end, which is already handled, but it could be an outside interuption
			if (_adWrapper && _adWrapper.adLinear && _adVideoStarted && _adWrapper.adRemainingTime >= 1)
			{
				// note it would make more sense to call stopLinear or something, but that doesn't exist...
				controller.trace("ending linear media from outside", _class, Debug.INFO);
				_adWrapper.stopAd();
			}
			// TODO: _linear pending may not always be true when we need it here...
			else if (_adWrapper && _adStarted && !_adVideoStarting && !(e.data as Clip).isAd)
			{
				controller.trace("ending ad and moving on to next chapter", _class, Debug.INFO);
				_adWrapper.stopAd();				
			}
		}

		// play a no-op clip.  typically this is where an ad plug-in would bring up
		// its own ad SWF, and draw what it needs to draw.
		protected function playAd(clip:Clip):void
		{
			controller.trace("playAd", _class, Debug.INFO);
			_currentAd = clip;

            if (_adWrapper.adRemainingTime > 0)
            {
                var time:int = _adWrapper.adRemainingTime * 1000;
                _currentAd.mediaLength = time;
                _currentAd.length = time;
                _useRemainingTime = true;
            }
            else
            {
                _useRemainingTime = false;
            }

			controller.trace("Playing ad \"" + clip.baseClip.URL + "\" duration: " + _currentAd.mediaLength, _class, Debug.INFO);
			
			// register for changes in media area
			controller.addEventListener(PlayerEvent.OnMediaAreaChanged, mediaAreaChanged);
						
			// reset the scrubber and play/pause state
			_position = 0;
			_loadPercentage = 0;
						
			// get the current states of volume and mute
			_muted = controller.getMuteState();
			_soundLevel = controller.getSoundLevel();
			_pauseStateMachine.init();
		}

		protected function doInitAd():void
		{
			var parameters:String = _clip.baseClip.trackingData;
            var mediaArea:Rectangle = controller.getMediaArea();
            _swf.x = mediaArea.x;
            _swf.y = mediaArea.y;

			startErrorStage(_errorTimer, INIT);
			controller.trace("calling initAd(" + mediaArea.width + ", " + mediaArea.height + ", normal, 300, " + " ..." + ", env)", _class, Debug.INFO);
			_adWrapper.initAd(mediaArea.width, mediaArea.height, "normal", 300, parameters, null);
			//AdLoaded should now fire when everything is ready
		}
		
		protected function startAd():void
		{
			controller.trace("calling startAd()", _class, Debug.INFO);
			startErrorStage(_errorTimer, START);
			_adWrapper.startAd();
			//AdStarted should now fire when the ad is ready to be shown
		}
		
		protected function adStarted():void
		{
            positionPlayer(controller.getMediaArea());
            positionPlayer(controller.getMediaArea());
		}

		protected function scrubTick(e:TimerEvent):void
		{
			if (_useRemainingTime && _currentAd.mediaLength > 0)
            {
                _position = _currentAd.mediaLength - (_adWrapper.adRemainingTime * 1000) + 500;
            }
            else
            {
                _position += 300;
            }

			if (_currentAd.mediaLength > 0 && _position >= _currentAd.mediaLength)
			{
				controller.trace("Video portion of ad is done playing", _class, Debug.INFO);
//				linearComplete();
			}
			else
			{					
				controller.trace("Calling \"mediaPlaying(" + _position + ")\" timeRemaining:" + _adWrapper.adRemainingTime , _class, Debug.DEBUG);
				mediaPlaying(_position);
			}
		}
						
		protected function mediaAreaChanged(e:PlayerEvent):void
		{
			controller.trace("Received \"onMediaAreaChanged\"", _class, Debug.INFO);
			positionPlayer(e.data as Rectangle);
		}
		
		protected function positionPlayer(mediaArea:Rectangle):void
		{				
			// here's where you'd show your plug-in; this sample just draws a picture
			controller.trace("Positioning player at [" + mediaArea.x + ", " + mediaArea.y + "], " + mediaArea.width + "w x " + mediaArea.height + "h", _class, Debug.INFO);

			_swf.x = mediaArea.x;
			_swf.y = mediaArea.y;
			//_swf.width = mediaArea.width;
			//_swf.height = mediaArea.height;

			_adWrapper.resizeAd(mediaArea.width, mediaArea.height, "normal");

		}
		
		protected function linearComplete():void
		{
			controller.trace("linear portion of ad is complete", _class, Debug.DEBUG);

			mediaPlaying(_currentAd.mediaLength);
			mediaEnds();

			loadStartChecked(false);//turn off the bridge, no more messages to or from
			_loadStartChecked = false;

			_adVideoComplete = true;

			// unpause the main media, so it's not just sitting there...
			if (!_adWrapper || !_adWrapper.adExpanded)
				controller.pause(false);

			if (_scrubberTimer)
			{
				controller.trace("removing scrubber timer", _class, Debug.DEBUG);
				_scrubberTimer.stop();
				_scrubberTimer.removeEventListener(TimerEvent.TIMER, scrubTick);
				_scrubberTimer = null;
			}
			if (_loadTimer)
			{
				if (_loadTimer.running) _loadTimer.stop();
				_loadTimer.removeEventListener(TimerEvent.TIMER, loadTimeHandler);
				_loadTimer = null;
			}
		}	

		// ad is done
		protected function adComplete():void
		{
			// if the ad is comlete, but the video didn't end gracefully
			if ((_adVideoStarted || _adVideoStarting) && !_adVideoComplete)
			{
				mediaError("The VPAID ad ended unexpectedly, moving on.");
			}

			cleanUp();
		}
		
		protected function startErrorStage(timer:Timer, stage:String):void
		{
			_errorStage = stage;
			switch(stage)
			{
				case LOAD:
					timer.addEventListener(TimerEvent.TIMER_COMPLETE, loadError, false, 0, true);
					timer.delay = LOAD_TIMEOUT;
					break;
				case INIT:
					timer.addEventListener(TimerEvent.TIMER_COMPLETE, initError, false, 0, true);
					timer.delay = INIT_TIMEOUT;
					break;
				case START:
					timer.addEventListener(TimerEvent.TIMER_COMPLETE, startError, false, 0, true);
					timer.delay = START_TIMEOUT;
					break;
				case RESUME:
					timer.addEventListener(TimerEvent.TIMER_COMPLETE, resumeError, false, 0, true);
					timer.delay = RESUME_TIMEOUT;
					break;
			}
			timer.start();
		}
		
		protected function endErrorStage(timer:Timer, stage:String):void
		{
			_errorStage = NONE;
			switch(stage)
			{
				case LOAD:
					timer.removeEventListener(TimerEvent.TIMER_COMPLETE, loadError);
					break;
				case INIT:
					timer.removeEventListener(TimerEvent.TIMER_COMPLETE, initError);
					break;
				case START:
					timer.removeEventListener(TimerEvent.TIMER_COMPLETE, startError);
					break;
				case RESUME:
					timer.removeEventListener(TimerEvent.TIMER_COMPLETE, resumeError);
					break;
			}
			timer.reset();
		}
		
		protected function loadError(e:TimerEvent):void
		{
			//TODO: do a check v the actual loaded bytes to see if there is progress
			mediaError("The VPAID content failed to Load after ms:" + LOAD_TIMEOUT);
		}
		
		protected function initError(e:TimerEvent):void
		{
			mediaError("The VPAID content failed to INIT after ms:" + INIT_TIMEOUT);
		}
		
		protected function startError(e:TimerEvent):void
		{
			mediaError("The VPAID content failed to START after ms:" + START_TIMEOUT);
		}
		
		protected function resumeError(e:TimerEvent):void
		{
			mediaError("The VPAID content failed to RESUME after ms:" + RESUME_TIMEOUT);
		}
		
		///// Events from the ad Swf //////
		///////////////////////////////////
		
		protected function addVPaidHandlers(wrapper:VPAIDWrapper):void
		{
			if (!wrapper) return;
			wrapper.addEventListener(VPAIDEvent.AdClickThru, handleAdClickThru, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdError, handleAdError, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdExpandedChange, handleAdExpandedChange, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdImpression, handleAdImpression, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdLinearChange, handleAdLinearChange, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdLoaded, handleAdLoaded, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdLog, handleAdLog, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdPaused, handleAdPaused, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdPlaying, handleAdPlaying, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdRemainingTimeChange, handleAdRemainingTimeChange, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdStarted, handleAdStarted, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdStopped, handleAdStopped, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdUserAcceptInvitation, handleAdUserAcceptInvitation, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdUserClose, handleAdUserClose, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdUserMinimize, handleAdUserMinimize, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdVideoComplete, handleAdVideoComplete, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdVideoFirstQuartile, handleAdVideoFirstQuartile, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdVideoMidpoint, handleAdVideoMidpoint, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdVideoStart, handleAdVideoStart, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdVideoThirdQuartile, handleAdVideoThirdQuartile, false, 0, true);
			wrapper.addEventListener(VPAIDEvent.AdVolumeChange, handleAdVolumeChange, false, 0, true);
		}
		
		protected function removeVPaidHandlers(wrapper:VPAIDWrapper):void
		{
			if (!wrapper) return;
			wrapper.removeEventListener(VPAIDEvent.AdClickThru, handleAdClickThru);
			wrapper.removeEventListener(VPAIDEvent.AdError, handleAdError);
			wrapper.removeEventListener(VPAIDEvent.AdExpandedChange, handleAdExpandedChange);
			wrapper.removeEventListener(VPAIDEvent.AdImpression, handleAdImpression);
			wrapper.removeEventListener(VPAIDEvent.AdLinearChange, handleAdLinearChange);
			wrapper.removeEventListener(VPAIDEvent.AdLoaded, handleAdLoaded);
			wrapper.removeEventListener(VPAIDEvent.AdLog, handleAdLog);
			wrapper.removeEventListener(VPAIDEvent.AdPaused, handleAdPaused);
			wrapper.removeEventListener(VPAIDEvent.AdPlaying, handleAdPlaying);
			wrapper.removeEventListener(VPAIDEvent.AdRemainingTimeChange, handleAdRemainingTimeChange);
			wrapper.removeEventListener(VPAIDEvent.AdStarted, handleAdStarted);
			wrapper.removeEventListener(VPAIDEvent.AdStopped, handleAdStopped);
			wrapper.removeEventListener(VPAIDEvent.AdUserAcceptInvitation, handleAdUserAcceptInvitation);
			wrapper.removeEventListener(VPAIDEvent.AdUserClose, handleAdUserClose);
			wrapper.removeEventListener(VPAIDEvent.AdUserMinimize, handleAdUserMinimize);
			wrapper.removeEventListener(VPAIDEvent.AdVideoComplete, handleAdVideoComplete);
			wrapper.removeEventListener(VPAIDEvent.AdVideoFirstQuartile, handleAdVideoFirstQuartile);
			wrapper.removeEventListener(VPAIDEvent.AdVideoMidpoint, handleAdVideoMidpoint);
			wrapper.removeEventListener(VPAIDEvent.AdVideoStart, handleAdVideoStart);
			wrapper.removeEventListener(VPAIDEvent.AdVideoThirdQuartile, handleAdVideoThirdQuartile);
			wrapper.removeEventListener(VPAIDEvent.AdVolumeChange, handleAdVolumeChange);
		}
		
		protected function handleAdClickThru(e:*):void
		{
			var data:Object = null; //e.data;
			controller.trace("handleAdClickThru " + (data ? "url:" + data.url + " id:" + data.id + " playerHandles:" + data.playerHandles : "no data"), _class, Debug.INFO);
		}
		
		protected function handleAdError(e:*):void
		{
			var message:String = (e.hasOwnProperty('message') ? e['message'] as String : "null");
			controller.trace("handleAdError :" + message, _class, Debug.INFO);
			// TODO: other VPAID impls play ads with errors in them... should we?
			// mediaError(message);
			if (controller.getProperty("logLevel") == "debug")
			{
				throw new Error("AdError: " + message);				
			}
		}
		
		protected function handleAdExpandedChange(e:*):void
		{
			controller.trace("handleAdExpandedChange expanded:" + _adWrapper.adExpanded, _class, Debug.INFO);
			
			if (_adWrapper.adExpanded)
			{
				_pauseStateMachine.expand();
			}
			else
			{
				_pauseStateMachine.collapse();
				controller.pause(false);
			}
		}
		
		protected function handleAdImpression(e:*):void
		{
			controller.trace("handleAdImpression :" , _class, Debug.INFO);
		}
		
		protected function handleAdLinearChange(e:*):void
		{
			controller.trace("handleAdLinearChange : " + _adWrapper.adLinear, _class, Debug.INFO);

			if (!_adWrapper.adLinear)
			{
				linearComplete();
			}
		}
		
		protected function handleAdLoaded(e:*):void
		{
			controller.trace("handleAdLoaded: adLinear = " + _adWrapper.adLinear, _class, Debug.INFO);
			// if the ad starts out in the linear state, it should play immediately, however, we're using Clip objects to pass VPAID ads around, even if they're not linear...
			if (_adLoading)
			{
				if (_adWrapper.adLinear)
				{
					_adLoading = false;
					controller.trace("inserting VPAID ad. linear: " + _adWrapper.adLinear, _class, Debug.INFO);
					controller.setAds(createPlaylist(getNoOpClip(_clip.baseClip)));
				}
				else
				{
					controller.trace("Got a non-linear AdLoaded event but expecting a linear ad..." + _adWrapper.adLinear, _class, Debug.ERROR);
				}
			}
			else
			{
				if (_adWrapper.adLinear)
				{
					// TODO: inject?
					controller.trace("Got a linear AdLoaded event but not expecting one..." + _adWrapper.adLinear, _class, Debug.ERROR);
				}
				else
				{
					controller.trace("not inserting VPAID ad since it's an overlay. linear: " + _adWrapper.adLinear, _class, Debug.INFO);
				}
			}

			endErrorStage(_errorTimer, INIT);
			startAd();
		}
		
		protected function handleAdLog(e:*):void
		{
			controller.trace("handleAdLog", _class, Debug.INFO);
		}
		
		protected function handleAdPaused(e:*):void
		{
			controller.trace("handleAdPaused", _class, Debug.INFO);
			
			_pauseStateMachine.pauseInternal();
		}
		
		protected function handleAdPlaying(e:*):void
		{
			controller.trace("handleAdPlaying" , _class, Debug.INFO);
			endErrorStage(_errorTimer, RESUME);
			_pauseStateMachine.unpauseInternal();
		}
		
		protected function handleAdRemainingTimeChange(e:*):void
		{
			controller.trace("handleAdRemainingTimeChange :" + _adWrapper.adRemainingTime + " time remaining:" + _adWrapper.adRemainingTime, _class, Debug.INFO);
		}
		
		protected function handleAdStarted(e:*):void
		{
			controller.trace("handleAdStarted: adLinear = " + _adWrapper.adLinear, _class, Debug.INFO);
			endErrorStage(_errorTimer, START);
			adStarted();
			_adStarted = true;

			// if we might have a linear, let's wait 100 ms to see, because some VPAID ads are dumb.
			if (_waitingForPossibleIndecisiveLinearAd)
			{
				setTimeout(linearCheck, 100);
			}
		}

		protected function linearCheck():void
		{
			if (_adVideoStarting || _adVideoStarted)
			{
				// do nothing
			}
			else
			{
				controller.trace("closing out empty clip since no ad started.", _class, Debug.INFO);
				mediaEnds();
				loadStartChecked(false);
				_loadStartChecked = false;
			}
		}
		
		protected function handleAdStopped(e:*):void
		{
			controller.trace("handleAdStopped" , _class, Debug.INFO);
			_adStopped = true;
			adComplete();//end it now, this must have fired on its own
		}
		
		protected function handleAdUserAcceptInvitation(e:*):void
		{
			controller.trace("handleAdUserAcceptInvitation", _class, Debug.INFO);
		}
		
		protected function handleAdUserClose(e:*):void
		{
			controller.trace("handleAdUserClose", _class, Debug.INFO);
		}
		
		protected function handleAdUserMinimize(e:*):void
		{
			controller.trace("handleAdUserMinimize :", _class, Debug.INFO);
		}
		
		protected function handleAdVideoComplete(e:*):void
		{
			controller.trace("handleAdVideoComplete :", _class, Debug.INFO);
			linearComplete();
		}
		
		protected function handleAdVideoFirstQuartile(e:*):void
		{
			controller.trace("handleAdVideoFirstQuartile :", _class, Debug.INFO);
		}
		
		protected function handleAdVideoMidpoint(e:*):void
		{
			controller.trace("handleAdVideoMidpoint", _class, Debug.INFO);
		}
		
		protected function handleAdVideoStart(e:*):void
		{
			controller.trace("handleAdVideoStart", _class, Debug.INFO);

			if (_linearPending)
			{
				_adVideoStarting = true;
				controller.trace("handleAdVideoStart: injecting", _class, Debug.INFO);
				controller.injectPlaylist(createPlaylist(getNoOpClip(_clip.baseClip)));
			}
			else
			{
				controller.trace("handleAdVideoStart: starting", _class, Debug.INFO);
				doStartAdVideo();
			}
		}

		protected function doStartAdVideo():void
		{
			// tell the controller that the media has started
			controller.trace("Calling \"mediaStarts\"", _class, Debug.INFO);
			mediaStarts();

			_adVideoStarted = true;
			_adVideoStarting = false;
						
			// keep the scrubber chugging along
			startScrubberTimer();
		}
		
		protected function handleAdVideoThirdQuartile(e:*):void
		{
			controller.trace("handleAdVideoThirdQuartile :", _class, Debug.INFO);
		}
		
		protected function handleAdVolumeChange(e:*):void
		{
			controller.trace("handleAdVolumeChange :", _class, Debug.INFO);
		}
		
		
		///// Function calls from PDK via bridge //////
				
		// called when an external event ends playback
		override public function mediaEndSet():void
		{
			controller.trace("mediaEndSet(): " + _adStopped);
		}
		
		// called when the sound level is set externally
		override public function mediaSoundLevelSet(level:Number):void
		{
			controller.trace("mediaSoundLevelSet(" + level + ")", _class, Debug.INFO);
			_soundLevel = level;
			if (!_muted)
			{
				_adWrapper.adVolume = _soundLevel / 100;
			}
		}
		
		// called when mute/unmute is called externally
		override public function mediaMuteSet(isMuted:Boolean):void
		{
			controller.trace("mediaMuteSet(" + isMuted + ")", _class, Debug.INFO);
			_muted = isMuted;
			if (_muted)
			{
				_adWrapper.adVolume = 0;
			}
			else
			{
				_adWrapper.adVolume = _soundLevel;
			}
		}
		
		// called when seek is called externally
		override public function mediaSeekSet(position:int):void
		{
			controller.trace("mediaSeekSet(" + position + ")", _class, Debug.INFO);
			_position = position;
		}
		
		// called when play/pause is called externally
		override public function mediaPauseSet(isPaused:Boolean):void
		{
			controller.trace("mediaPauseSet(" + isPaused + ")", _class, Debug.INFO);
			if (isPaused)
			{
				if (_adWrapper && _adWrapper.adLinear)
				{
					_adWrapper.pauseAd();
				}
				_pauseStateMachine.pauseExternal();
			}
			else
			{
				if (_adWrapper && _adWrapper.adLinear)
				{
					_adWrapper.resumeAd();
				}
				_pauseStateMachine.unpauseExternal();
			}
		}
		
		public function setGlobalPause(isPaused:Boolean):void
		{
			controller.pause(isPaused);
		}
		
		public function setInternalPause(pause:Boolean):void
		{
			if (pause)
			{
				_adWrapper.pauseAd();
			}
			else
			{
				//startErrorStage(_errorTimer, RESUME);
				_adWrapper.resumeAd();
			}
		}
		
		public function startScrubberTimer():void
		{
			if (!_scrubberTimer)
			{
				_scrubberTimer = new Timer(300);
				_scrubberTimer.addEventListener(TimerEvent.TIMER, scrubTick, false, 0, true);
			}
			
			if (!_scrubberTimer.running)
			{
				_scrubberTimer.start();
			}
		}
		
		public function stopScrubberTimer():void
		{
			if (_scrubberTimer && _scrubberTimer.running)
			{
				_scrubberTimer.stop();
			}
		}
			
		
		// create a no-op clip
		private function getNoOpClip(bc:BaseClip):Clip
		{
			var baseClip:BaseClip = new BaseClip();
			baseClip.URL = bc.URL;
			baseClip.isAd = true;
			baseClip.noSkip = true;
			baseClip.releaseLength = bc.releaseLength;
			baseClip.impressionUrls = bc.impressionUrls;
			baseClip.type = "application/x-shockwave-flash"; // assume VPAID is flash... this is true for this implementation
			var clip:Clip = controller.createClipFromBaseClip(baseClip);//make sure the clip is set up correctly from the baseclip
			clip.streamType = StreamType.EMPTY;
			clip.hasOverlayLayer = true;
			clip.trackingURLs = _clip.trackingURLs;
			return clip;			
		}
		
		// return a simple playlist with a single clip
		private function createPlaylist(clip:Clip):Playlist
		{
			var playlist:Playlist = new Playlist();
			playlist.addClip(clip);
			return playlist;			
		}
		
		// clean up
		protected function cleanUp():void
		{
			controller.trace("cleanUp()", _class, Debug.INFO);

			if (_adWrapper)
			{
				removeVPaidHandlers(_adWrapper);
				if (!_adStopped)
				{
					controller.trace("calling stopAd()", _class, Debug.INFO);
					_adWrapper.stopAd();
				}
			}

			if (_loadStartChecked)
			{
				mediaEnds();
				loadStartChecked(false);
				_loadStartChecked = false;
			}

			if (_swf)
			{
				this.removeChild(_swf);
			}

			if (_scrubberTimer)
			{
				controller.trace("removing scrubber timer", _class, Debug.DEBUG);
				_scrubberTimer.stop();
				_scrubberTimer.removeEventListener(TimerEvent.TIMER, scrubTick);
				_scrubberTimer = null;
			}

			if (_loadTimer)
			{
				if (_loadTimer.running) _loadTimer.stop();
				_loadTimer.removeEventListener(TimerEvent.TIMER, loadTimeHandler);
				_loadTimer = null;
			}
			
			_linearPending = false;
			_waitingForPossibleIndecisiveLinearAd = false;
			_adStarted = false;
			_adStopped = false;
			_adVideoStarted = false;
			_adVideoStarting = false;
			_adVideoComplete = false;
			_adWrapper = null;
			_swf = null;
//			_clip = null;
			
			controller.removeEventListener(PlayerEvent.OnMediaAreaChanged, mediaAreaChanged);			
		}
	}
}
import com.theplatform.pdk.controllers.IPlayerController;
import com.theplatform.pdk.plugins.Vpaid;
import com.theplatform.pdk.utils.Debug;

import flash.utils.getQualifiedClassName;

internal interface VPAIDPauseState
{
	function pauseInternal():void;
	function unpauseInternal():void;
	function pauseExternal():void;
	function unpauseExternal():void;
	function expand():void;
	function collapse():void;
}

internal class PauseStateMachine implements VPAIDPauseState
{
	private var _currentState:VPAIDPauseState;
	public var vpaid:Vpaid;
	public var pauseOnExpand:Boolean;
	public var externalPause:Boolean = false;//start out assuming that we're playing externally
	
	/*
	 * NOTE: the pause/playing axis of the state machine should refer to whether the media itself is in a paused state
	*/
	
	public function PauseStateMachine(vpaid:Vpaid, pauseOnExpand:Boolean)
	{
		this.vpaid = vpaid;
		this.pauseOnExpand = pauseOnExpand;
		
		init();
	}
	public function setState(state:VPAIDPauseState):void
	{
		vpaid.controller.trace("setting state to: " + getQualifiedClassName(state), "VPAID PauseStateMachine", Debug.DEBUG);
		_currentState = state;
	}
	
	public function init():void
	{
		//set first state, we may do some work to have this switch dynamically depending on the ad, but for now assume always POE on or off
		if (pauseOnExpand)
		{
			setState(new POE_Playing_Collapsed(this));
		}
		else
		{
			setState(new Playing_Collapsed(this));
		}
	}
	
	public function pauseExternal():void
	{
		vpaid.controller.trace("pause external", "VPAID PauseStateMachine", Debug.DEBUG);
		_currentState.pauseExternal();
	}
	public function unpauseExternal():void
	{
		vpaid.controller.trace("unpause external", "VPAID PauseStateMachine", Debug.DEBUG);
		_currentState.unpauseExternal();
	}
	public function pauseInternal():void
	{
		vpaid.controller.trace("pause internal", "VPAID PauseStateMachine", Debug.DEBUG);
		_currentState.pauseInternal();
	}
	public function unpauseInternal():void
	{
		vpaid.controller.trace("unpause internal", "VPAID PauseStateMachine", Debug.DEBUG);
		_currentState.unpauseInternal();
	}
	public function expand():void
	{
		vpaid.controller.trace("expand", "VPAID PauseStateMachine", Debug.DEBUG);
		_currentState.expand();
	}
	public function collapse():void
	{
		vpaid.controller.trace("collapse", "VPAID PauseStateMachine", Debug.DEBUG);
		_currentState.collapse();
	}
}

internal class POE_Paused_Collapsed implements VPAIDPauseState
{
	private var _parent:PauseStateMachine;
	private var _unpausing:Boolean = false;
	
	public function POE_Paused_Collapsed(parent:PauseStateMachine)
	{
		_parent = parent;
	}
	public function pauseExternal():void 
	{
		_parent.externalPause = true;
	}
	public function unpauseExternal():void
	{
		if (!_unpausing)
		{
			_parent.externalPause = false;
			_unpausing = true;
			_parent.vpaid.startScrubberTimer();
			_parent.vpaid.setInternalPause(false);
			_parent.setState(new POE_Playing_Collapsed(_parent));
		}
	}
	public function pauseInternal():void 
	{
		//nil
	}
	public function unpauseInternal():void
	{
		if (!_unpausing && !_parent.externalPause)
		{
			_unpausing = true;
			_parent.vpaid.startScrubberTimer();
			_parent.vpaid.setGlobalPause(false);
			_parent.setState(new POE_Playing_Collapsed(_parent));
		}
	}
	public function expand():void
	{
		if (!_parent.externalPause)
		{
			_parent.vpaid.setGlobalPause(true);
			_parent.vpaid.stopScrubberTimer();
			_parent.externalPause = false;//we want to make sure that we don't lose the externalPause state
		}
		_parent.setState(new POE_Paused_Expanded(_parent));
	}
	public function collapse():void
	{
		//nil
	}
}
internal class POE_Paused_Expanded implements VPAIDPauseState
{
	private var _parent:PauseStateMachine;
	private var _unpausing:Boolean = false;
	
	public function POE_Paused_Expanded(parent:PauseStateMachine)
	{
		_parent = parent;
	}
	public function pauseExternal():void 
	{
		_parent.externalPause = true;
	}
	public function unpauseExternal():void
	{
		if (!_unpausing)
		{
			_parent.externalPause = false;
		}
	}
	public function pauseInternal():void 
	{
		if (!_parent.externalPause)
		{
			_parent.vpaid.setGlobalPause(true);
		}
	}
	public function unpauseInternal():void
	{
		if (!_unpausing)
		{
			_unpausing = true;
			_parent.vpaid.startScrubberTimer();
			_parent.vpaid.setGlobalPause(false);
			_parent.setState(new POE_Playing_Expanded(_parent));
		}
	}
	public function expand():void
	{
		//nil
	}
	public function collapse():void
	{
		if (_parent.externalPause)
		{
			_parent.vpaid.setInternalPause(true);//pause the video as it collapses
			_parent.setState(new POE_Paused_Collapsed(_parent));
		}
		else
		{
			_unpausing = true;
			_parent.vpaid.setGlobalPause(false);
			_parent.vpaid.setInternalPause(false);//unstick it sometimes
			_parent.vpaid.startScrubberTimer();
			_parent.setState(new POE_Playing_Collapsed(_parent));
		}
	}
}
internal class POE_Playing_Collapsed implements VPAIDPauseState
{
	private var _parent:PauseStateMachine;
	private var _pausing:Boolean = false;
	
	public function POE_Playing_Collapsed(parent:PauseStateMachine)
	{
		_parent = parent;
	}
	public function pauseExternal():void 
	{
		if (!_pausing)//prevent an infinite loop
		{
			_parent.externalPause = true;
			_pausing = true;
			_parent.vpaid.setInternalPause(true);
			_parent.vpaid.stopScrubberTimer();
			_parent.setState(new POE_Paused_Collapsed(_parent));
		}
	}
	public function unpauseExternal():void
	{
		_parent.externalPause = false;
	}
	public function pauseInternal():void 
	{
		if (!_pausing)
		{
			_pausing = true;
			//_parent.vpaid.setGlobalPause(true);
			_parent.vpaid.stopScrubberTimer();
			_parent.setState(new POE_Paused_Collapsed(_parent));
		}
	}
	public function unpauseInternal():void
	{
		//nil
	}
	public function expand():void
	{
		_pausing = true;
		_parent.vpaid.stopScrubberTimer();
		_parent.vpaid.setGlobalPause(true);
		_parent.setState(new POE_Paused_Expanded(_parent));
	}
	public function collapse():void
	{
		//nil
	}
}
internal class POE_Playing_Expanded implements VPAIDPauseState
{
	private var _parent:PauseStateMachine;
	private var _pausing:Boolean = false;
	
	public function POE_Playing_Expanded(parent:PauseStateMachine)
	{
		_parent = parent;
	}
	public function pauseExternal():void 
	{
		if (!_pausing)
		{
			_parent.externalPause = true;
			_pausing = true;
			_parent.vpaid.stopScrubberTimer();
			_parent.vpaid.setInternalPause(true);
			_parent.setState(new POE_Paused_Expanded(_parent));
		}
		
	}
	public function unpauseExternal():void
	{
		_parent.externalPause = false;
	}
	public function pauseInternal():void 
	{
		if (!_pausing)
		{
			_pausing = true;
			_parent.vpaid.stopScrubberTimer();
			_parent.vpaid.setGlobalPause(true);
			_parent.setState(new POE_Paused_Expanded(_parent));
		}
	}
	public function unpauseInternal():void
	{
		//nil
	}
	public function expand():void
	{
		//nil
	}
	public function collapse():void
	{
		_parent.setState(new POE_Playing_Collapsed(_parent));
	}
}
internal class Paused_Collapsed implements VPAIDPauseState
{
	private var _parent:PauseStateMachine;
	private var _unpausing:Boolean = false;
	
	public function Paused_Collapsed(parent:PauseStateMachine)
	{
		_parent = parent;
	}
	public function pauseExternal():void 
	{
		_parent.externalPause = true;
	}
	public function unpauseExternal():void
	{
		if (!_unpausing)
		{
			_parent.externalPause = false;
			_unpausing = true;
			_parent.vpaid.startScrubberTimer();
			_parent.vpaid.setInternalPause(false);
			_parent.setState(new Playing_Collapsed(_parent));
		}
	}
	public function pauseInternal():void 
	{
		//nil
	}
	public function unpauseInternal():void
	{
		if (!_unpausing)
		{
			_unpausing = true;
			_parent.vpaid.startScrubberTimer();
			_parent.vpaid.setGlobalPause(false);
			_parent.setState(new Playing_Collapsed(_parent));
		}
	}
	public function expand():void
	{
		_parent.setState(new Paused_Expanded(_parent));
	}
	public function collapse():void
	{
		//nil
	}
}
internal class Paused_Expanded implements VPAIDPauseState
{
	private var _parent:PauseStateMachine;
	private var _unpausing:Boolean = false;
	
	public function Paused_Expanded(parent:PauseStateMachine)
	{
		_parent = parent;
	}
	public function pauseExternal():void 
	{
		_parent.externalPause = true;
	}
	public function unpauseExternal():void
	{
		if (!_unpausing)
		{
			_parent.externalPause = false;
			_unpausing = true;
			_parent.vpaid.startScrubberTimer();
			_parent.vpaid.setInternalPause(false);
			_parent.setState(new Playing_Collapsed(_parent));
		}
	}
	public function pauseInternal():void 
	{
		//nil
	}
	public function unpauseInternal():void
	{
		if (!_unpausing)
		{
			_unpausing = true;
			_parent.vpaid.startScrubberTimer();
			_parent.vpaid.setGlobalPause(false);
			_parent.setState(new Playing_Collapsed(_parent));
		}
	}
	public function expand():void
	{
		//nil
	}
	public function collapse():void
	{
		_parent.setState(new Paused_Collapsed(_parent));
	}
}
internal class Playing_Collapsed implements VPAIDPauseState
{
	private var _parent:PauseStateMachine;
	private var _pausing:Boolean = false;
	
	public function Playing_Collapsed(parent:PauseStateMachine)
	{
		_parent = parent;
	}
	public function pauseExternal():void 
	{
		if (!_pausing)
		{
			_parent.externalPause = true;
			_pausing = true;
			_parent.vpaid.stopScrubberTimer();
			_parent.vpaid.setInternalPause(true);
			_parent.setState(new Paused_Collapsed(_parent));
		}
	}
	public function unpauseExternal():void
	{
		//nil
	}
	public function pauseInternal():void 
	{
		if (!_pausing)
		{
			_parent.externalPause = true;
			_pausing = true;
			_parent.vpaid.stopScrubberTimer();
			_parent.vpaid.setGlobalPause(true);
			_parent.setState(new Paused_Collapsed(_parent));
		}
	}
	public function unpauseInternal():void
	{
		//nil
	}
	public function expand():void
	{
		_parent.setState(new Playing_Expanded(_parent));
	}
	public function collapse():void
	{
		//nil
	}
}
internal class Playing_Expanded implements VPAIDPauseState
{
	private var _parent:PauseStateMachine;
	private var _pausing:Boolean = false;
	
	public function Playing_Expanded(parent:PauseStateMachine)
	{
		_parent = parent;
	}
	public function pauseExternal():void 
	{
		if (!_pausing)
		{
			_parent.externalPause = true;
			_pausing = true;
			_parent.vpaid.stopScrubberTimer();
			_parent.vpaid.setInternalPause(true);
			_parent.setState(new Paused_Collapsed(_parent));
		}
	}
	public function unpauseExternal():void
	{
		//nil
	}
	public function pauseInternal():void 
	{
		if (!_pausing)
		{
			_parent.externalPause = true;
			_pausing = true;
			_parent.vpaid.stopScrubberTimer();
			_parent.vpaid.setGlobalPause(true);
			_parent.setState(new Paused_Collapsed(_parent));
		}
	}
	public function unpauseInternal():void
	{
		//nil
	}
	public function expand():void
	{
		//nil
	}
	public function collapse():void
	{
		_parent.setState(new Playing_Collapsed(_parent));
	}
}
