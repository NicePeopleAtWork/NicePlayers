package com.theplatform.pdk.test 
{	
	import flash.display.DisplayObject;
	import flash.display.Loader;
	import flash.display.MovieClip;
	import flash.events.ErrorEvent;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.ProgressEvent;
	import flash.events.TimerEvent;
	import flash.events.MouseEvent;
	import flash.geom.Rectangle;
	import flash.net.URLRequest;
	import flash.utils.Timer;
	import flash.utils.setTimeout;
	import flash.system.Security;

	import flash.external.ExternalInterface;

	public class TestVpaidAd extends MovieClip // implements IVPAID
	{

		public static const AdLoaded : String         = "AdLoaded"; 
		public static const AdStarted : String        = "AdStarted"; 
		public static const AdStopped : String        = "AdStopped"; 
		public static const AdLinearChange : String   = "AdLinearChange"; 
		public static const AdExpandedChange : String = "AdExpandedChange"; 
		public static const AdRemainingTimeChange : String= "AdRemainingTimeChange"; 
		public static const AdVolumeChange : String   = "AdVolumeChange"; 
		public static const AdImpression : String     = "AdImpression"; 
		public static const AdVideoStart : String     = "AdVideoStart"; 
		public static const AdVideoFirstQuartile : String= "AdVideoFirstQuartile"; 
		public static const AdVideoMidpoint : String  = "AdVideoMidpoint"; 
		public static const AdVideoThirdQuartile : String= "AdVideoThirdQuartile"; 
		public static const AdVideoComplete : String  = "AdVideoComplete"; 
		public static const AdClickThru : String      = "AdClickThru"; 
		public static const AdUserAcceptInvitation : String= "AdUserAcceptInvitation"; 
		public static const AdUserMinimize : String   = "AdUserMinimize"; 
		public static const AdUserClose : String      = "AdUserClose"; 
		public static const AdPaused : String         = "AdPaused"; 
		public static const AdPlaying : String        = "AdPlaying"; 
		public static const AdLog : String            = "AdLog"; 
		public static const AdError : String          = "AdError"; 

		protected var _adStarted:Boolean = false;
		protected var _adComplete:Boolean = false;
		protected var _linear:Boolean = false;
		protected var _expanded:Boolean = false;
		protected var _duration:Number = 10;
		protected var _position:Number = 0;
		protected var _progressTimer:Timer;
		protected var _width:Number;
		protected var _height:Number;

		public function TestVpaidAd()
		{
			Security.allowDomain("*");
		}
	
		public function getVPAID():MovieClip
		{
			return this;
		}

		public function get adLinear() : Boolean
		{
			ExternalInterface.call("console.log", " ----------------------------------> adLinear: " + _linear);
			return _linear;
		} 

		public function get adExpanded() : Boolean
		{
			return _expanded;
		} 

		public function get adRemainingTime() : Number
		{
			return (_duration - _position);
		} 

		public function get adVolume() : Number
		{
			return 0;
		} 

		public function set adVolume(value : Number) : void
		{

		} 

		// Methods
		public function handshakeVersion(playerVPAIDVersion : String) : String
		{
			return "1.0";
		} 

		public function initAd(width : Number, height : Number, viewMode : String, desiredBitrate : Number, creativeData : 
						String, environmentVars : String) : void
		{
			_width = width;
			_height = height;
			_progressTimer = new Timer(333);
			_progressTimer.addEventListener(TimerEvent.TIMER, progressTick);
			
			var me = this;
			setTimeout(function()
			{
				ExternalInterface.call("console.log", " ----------------------------------> AdLoaded");
				me.dispatchEvent(new TestAdEvent(AdLoaded));
			}, 1000);
		} 

		protected function progressTick(e:TimerEvent):void
		{
			_position += (e.target as Timer).delay / 1000;
			this.dispatchEvent(new TestAdEvent(AdRemainingTimeChange));
			if (_position > _duration)
			{
				_progressTimer.stop();
				videoComplete();
				doDrawAd();
			}
		}

		protected function startLinear():void
		{
			_linear = true;
			_expanded = true;
			doStartVideo();			
		}

		protected function videoComplete():void
		{
			_linear = false;
			_expanded = false;
			this.dispatchEvent(new TestAdEvent(AdVideoComplete));
		}

		public function resizeAd(width : Number, height : Number, viewMode : String) : void
		{
			_width = width;
			_height = height;
			if (_adStarted)
			{
				doDrawAd();
			}
		} 

		public function startAd() : void
		{

		} 

		protected function doStartVideo():void
		{
			_progressTimer.start();
			doDrawAd();
			this.dispatchEvent(new TestAdEvent(AdVideoStart));
		}

		public function stopAd() : void
		{
			_adStarted = false;
			_adComplete = true;
			doDrawAd();
			this.dispatchEvent(new TestAdEvent(AdStopped));
		} 

		public function pauseAd() : void
		{
			_progressTimer.stop();
		} 

		public function resumeAd() : void
		{
			_progressTimer.stop();
		} 

		public function expandAd() : void
		{
			this.dispatchEvent(new TestAdEvent(AdExpandedChange));

		} 

		public function collapseAd() : void
		{
			this.dispatchEvent(new TestAdEvent(AdExpandedChange));
		} 

		protected function doDrawAd():void
		{
			var width = _width;
			var height = _height;

			this.graphics.clear();

			if (adLinear)
			{
				this.graphics.beginFill(0x993333);
				this.graphics.drawCircle(width/2, height/2, Math.min(width, height)/2);
			}
			else if (!_adComplete)
			{
				this.graphics.beginFill(0x339933);
				this.graphics.drawCircle(10, height-10, 10);
			}

			this.graphics.endFill();
		}
	}
}
