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
	import flash.system.Security;

	import flash.external.ExternalInterface;

	public class LinearToOverlayTestVpaidAd extends TestVpaidAd //implements IVPAID
	{

		public function LinearToOverlayTestVpaidAd()
		{
			super();
			_linear = true;
		}

		public override function startAd() : void
		{
			_adStarted = true;
			startLinear();
			doDrawAd();
			this.dispatchEvent(new TestAdEvent(AdStarted));
			this.dispatchEvent(new TestAdEvent(AdImpression));

			ExternalInterface.call("console.log", " ----------------------------------> startAd");
		} 

		protected override function videoComplete():void
		{
			super.videoComplete();
			this.dispatchEvent(new TestAdEvent(AdLinearChange));
			this.dispatchEvent(new TestAdEvent(AdExpandedChange));
		}
	}

}