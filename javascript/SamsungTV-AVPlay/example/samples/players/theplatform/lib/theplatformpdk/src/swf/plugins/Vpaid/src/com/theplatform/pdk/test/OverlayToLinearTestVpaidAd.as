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

	public class OverlayToLinearTestVpaidAd extends TestVpaidAd //implements IVPAID
	{

		public function OverlayToLinearTestVpaidAd()
		{
			super();
		}

		public override function startAd() : void
		{
			_adStarted = true;
			doDrawAd();
			this.addEventListener(MouseEvent.CLICK, handleClick);
			this.addEventListener(MouseEvent.ROLL_OVER, handleClick);
			this.addEventListener(MouseEvent.MOUSE_OVER, handleClick);
			
			var me = this;

			setTimeout(function()
			{
				ExternalInterface.call("console.log", " ----------------------------------> AdStarted");
				me.dispatchEvent(new TestAdEvent(AdStarted));
				ExternalInterface.call("console.log", " ----------------------------------> AdImpression");
				me.dispatchEvent(new TestAdEvent(AdImpression));
			}, 100);

			var linearTimer:Timer = new Timer(5000, 1);
			linearTimer.addEventListener(TimerEvent.TIMER, handleClick);
			linearTimer.start();

			ExternalInterface.call("console.log", " ----------------------------------> startAd");
		} 

		protected override function videoComplete():void
		{
			_adComplete = true;
			super.videoComplete();
			this.dispatchEvent(new TestAdEvent(AdExpandedChange));
			this.dispatchEvent(new TestAdEvent(AdStopped));
		}

		protected function handleClick(e:*=null):void
		{
			ExternalInterface.call("console.log", " ----------------------------------> handleClick: " + _linear);
			if (!_linear && !_expanded)
			{
				this.dispatchEvent(new TestAdEvent(AdLinearChange));
				this.dispatchEvent(new TestAdEvent(AdExpandedChange));

				startLinear();
			}
		}
	}
}