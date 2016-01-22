/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins.ad
{
	import com.google.ads.instream.api.VideoAdBandwidth;
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.PrimaryTrack;
	import com.theplatform.pdk.players.NoOpBridge;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	public class FlashLinearManager extends NoOpBridge
	{
		private var _controller:PlayerController;
		private var _clip:Clip;
		private var _durationTimer:Timer;
		private var _loadTimer:Timer;
		private var _sizeVideoTimer:Timer;
		private var _lengthTimer:Timer;
		private var _videoPlayback:IVideoPlayback;
		private var _soundLevel:Number;
		private var _isMuted:Boolean;
		private var _isStream:Boolean = false;
		private var _seeking:Boolean = false;

        private var _instreamFlashAd:InStreamFlashAd;
		
		private var _timeBeforeLastSeek:int = 0;
		private var _position:int = 0;
		
        public function FlashLinearManager(controller:IPlayerController, videoPlayback:IVideoPlayback, clip:Clip, container:Object=null)
		{
			super(controller as PlayerController);
			_controller = PlayerController(controller); // ... because we need to access video methods
			_videoPlayback = videoPlayback;
			_clip = clip;
			
			_isMuted = _controller.getMuteState();
			_soundLevel = _controller.getSoundLevel() / 100;
			var level:Number = _isMuted ? 0 : _soundLevel;


            _instreamFlashAd = (container as InStreamFlashAd);

			// need to apply volume to flash ad...

            setIgnoreClose(true);
			loadStartChecked(true);
/*			_isStream = _videoPlayback.isNetStreamPlayback();
			if (!_isStream)
			{
				_loadTimer = new Timer(300);
				_loadTimer.addEventListener(TimerEvent.TIMER, loadTick, false, 0, true);
				_loadTimer.start();
			}
*/
			_controller.trace("FlashLinearManager.play", "InStreamAd.FlashLinearManager", Debug.INFO);
			_videoPlayback.play(container);
		}
		
		public function startMediaPlaying():void
		{
			_durationTimer=new Timer(300);
			_durationTimer.addEventListener(TimerEvent.TIMER, sendMediaPlaying);
			_durationTimer.start();
		}
		
		public function stopMediaPlaying():void
		{
			if (_durationTimer)
			{
				_durationTimer.stop();
				_durationTimer = null; // needed?
			}
		}
		
		private function sendMediaPlaying(e:TimerEvent):void
		{
			if (_seeking) return;
			_position += 300;
			_controller.trace("media playing:" + _position, "InStreamAd.FlashLinearManager")
			mediaPlaying(_position);
		}
		
		public function cleanUp():void
		{
			_controller.trace("***** FlashLinearManager.cleanup() ******","InStreamAd.FlashLinearManager")
			if (_durationTimer)
			{
				_durationTimer.stop();
				_durationTimer.removeEventListener(TimerEvent.TIMER, sendMediaPlaying);
				_durationTimer = null;
			}
			if (_loadTimer)
			{
				_loadTimer.start();
				_loadTimer.removeEventListener(TimerEvent.TIMER, loadTick);
				_loadTimer = null;
			}
			if (_lengthTimer)
			{
				_lengthTimer.removeEventListener(TimerEvent.TIMER, lengthTick);
				_lengthTimer.stop();
				_lengthTimer = null;
			}
		}

		private function loadTick(e:TimerEvent):void
		{
			var percent:Number = _videoPlayback.getPercentLoaded();
			//_controller.trace("instream load: " + percent, "FlashLinearManager", Debug.DEBUG)
			var loaded:Number = percent * 100;
			var total:Number = 100;
			mediaLoading(loaded, total);
			
			if (percent == 100)
			{
				_loadTimer.stop();
				_loadTimer.removeEventListener(TimerEvent.TIMER, loadTick);
				_loadTimer = null;
			}
		}
		
			
		////////////////////////
		//	PDK -> Dart
		////////////////////////
		
		public function start():void 
		{ 	
			_controller.trace("start()", "InStreamAd.FlashLinearManager", Debug.INFO);
			if (_isStream)
			{
				mediaLoading(100, 100);
			}
			var len:int = Math.max(-1, _videoPlayback.getVideoLength() * 1000); 
			_controller.trace("setting mediaLength of ad: " + len + " plus one second to allow the media to stop" , "InStreamAd.FlashLinearManager", Debug.INFO);
			_clip.mediaLength = len;
			
			mediaLoading(100, 100);
			var mediaStartsTimer = new Timer(500, 1);

            var muteState:Boolean = _controller.getMuteState();
            var soundLevel:Number = _controller.getSoundLevel();
            _controller.trace("(ima2) current sound level at noop start: "+soundLevel, "InStreamAd.FlashLinearManager", Debug.DEBUG);
            _controller.trace("(ima2) current mute state at noop start: "+muteState, "InStreamAd.FlashLinearManager", Debug.DEBUG);
            mediaSoundLevelSet(soundLevel);
            mediaMuteSet(muteState);

			mediaStartsTimer.addEventListener(TimerEvent.TIMER, function():void
            {
				mediaStarts();//superclass
				startMediaPlaying();
			}, false, 0, true);
			
			mediaStartsTimer.start();
		}
		//called from within the plugin--the media has reached its end
		public function end():void
		{
			cleanUp();
			mediaEnds();// superclass. Tell noOp player that video has ended
		}
		public function error():void
		{
			mediaError();
		}
		
		private function startLengthTimer():void
		{
			if (!_lengthTimer)
			{
				_lengthTimer = new Timer(100, 20);//try only for 2 seconds, we don't want to spam the whole video
				_lengthTimer.addEventListener(TimerEvent.TIMER, lengthTick, false, 0, true);
			}
			_lengthTimer.start();
		}
		
		private function lengthTick(e:TimerEvent):void
		{
			var currentLength:Number = _clip.mediaLength;
			var vidLength:Number = _videoPlayback.getVideoLength() * 1000;
			if (vidLength != currentLength)
			{
				_controller.trace("the video changed it's total time to: " + vidLength, "InStreamAd.FlashLinearManager", Debug.INFO);
				//the video length updated itself.
				_clip.mediaLength = vidLength;
				_lengthTimer.removeEventListener(TimerEvent.TIMER, lengthTick);
				_lengthTimer.stop();
				_lengthTimer = null;
			}
		}
		
		override public function mediaEndSet():void
		{
			//the pdk has determined that the media must end (perhaps early)
			
			cleanUp();
			mediaEnds(); // Tell noOp player that video has ended
		}
		
		override public function mediaSoundLevelSet(level:Number):void
		{
			_soundLevel = Number(level / 100);
			if (!_isMuted)
			{
				// need to set sound on ad somehow...
			}
		}
		
		override public function mediaMuteSet(isMuted:Boolean):void
		{
			_isMuted = isMuted;

            //not sure if we can guarantee it'll always be an IFlashAd?

            var flashAd:IFlashAd = (_videoPlayback.ad as IFlashAd);

            if (flashAd)
            {
                if (isMuted)
                    flashAd.manager.volumeAd = 0;
                else
                    flashAd.manager.volumeAd = _soundLevel;

            }
           // _instreamFlashAd.mute(isMuted);

			// need to set sound on ad somehow...
		}
		
		override public function mediaSeekSet(position:int):void
		{
			// ignore...
		}
		
		private function seekFailed():void
		{
		}

		override public function mediaPauseSet(isPaused:Boolean):void
		{
			// ignore...
            _controller.trace("mediaPauseSet", "InStreamAd.FlashLinearManager", Debug.DEBUG);
		}
	}
}
