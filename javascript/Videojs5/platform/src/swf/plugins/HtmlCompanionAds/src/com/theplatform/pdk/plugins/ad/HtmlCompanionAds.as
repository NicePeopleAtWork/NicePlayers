package com.theplatform.pdk.plugins.ad 
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.data.Banner;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.parsers.HtmlCompanionAdParser;
	import com.theplatform.pdk.plugins.ICompanionAdPlugIn;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;

	public class HtmlCompanionAds extends Sprite implements ICompanionAdPlugIn
	{
		private var _controller:IViewController;
		private var _hosts:Array = ["ad.doubleclick.net/adi/"];
		private var _priority:Number = 1;
		private var _banner:Banner;
		private var _cancelled:Boolean = false;
		private var _busy:Boolean = false;
		
		public function HtmlCompanionAds()
		{
		}
		
		public function initialize(lo:LoadObject):void
		{
			_controller = lo.controller as IViewController;
			_controller.trace("COMPANION AD PLUGIN IS UP!", "HtmlCompanionAdPlugIn");
			
			var hosts:String = lo.vars["hosts"] as String; // could be array or string
			var priority:Number = lo.priority;

			if (priority) _priority = priority;
				
			if (!hosts || !hosts.length)
				_controller.trace("Using default \"hosts\" parameter:" + _hosts[0], "HtmlCompanionAdPlugIn", Debug.INFO);
			else
			{
				_hosts = hosts.split(",");
				var logStr:String = "HOSTS:"
				for each (var host:String in _hosts)
					logStr += ("[" + host + "]");
				_controller.trace(logStr,"HtmlCompanionAdPlugIn",Debug.INFO);
			}
				
			_controller.registerCompanionAdPlugIn(this, _priority);		
		}

		public function cancel():void {
			_controller.trace("Cancel called", "HtmlCompanionAdPlugIn");
			_cancelled = true;
		}

		public function formatCompanionAd(banner:Banner, clip:Clip):Boolean
		{
			_controller.trace("formatCompanionAd called on \"" + banner.baseURL + banner.src + "\" (" + banner.bannerWidth + "x" + banner.bannerHeight + ")", "HtmlCompanionAdPlugIn");
			if (_busy) {
				throw new Error("Attempted to call formatCompanionAd in parallel.  Must wait for previous call to finish.");
			}
			
			_cancelled = false;
			_busy = true;
			
			var oneOfOurs:Boolean = false;
			_banner = banner;
			
			for (var i:Number=0; i<_hosts.length; i++) {
				if ( (_banner.baseURL + _banner.src).indexOf(_hosts[i]) >= 0 ) {
					oneOfOurs = true;
					break;
				}
			}
			
			if (!oneOfOurs) {
				_busy = false;
				return false;
			}
			else {
				// Cancel Previous Unfinished Loads
				if (_loader) {
					removeListeners();
					_loader = null;
				}

				_loader = new URLLoader();
				_loader.addEventListener(Event.COMPLETE, onBannerLoadComplete);
				_loader.addEventListener(IOErrorEvent.IO_ERROR, onBannerLoadError);
				_loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onBannerLoadError);
				_controller.trace("About to load \"" + _banner.src + "\"", "HtmlCompanionAdPlugIn");
                try
                {
                    _loader.load(new URLRequest(_banner.src));
                }
				catch (e:Error) { onBannerLoadError(e);}
				return true;
			}
		}

		private function onBannerLoadError(e:Object):void {
			if (_loader) {
				removeListeners();
				_loader = null;
			}
			_controller.trace("Load error: " + e, "HtmlCompanionAdPlugIn", Debug.ERROR);
			_busy = false;
			if (!_cancelled)
				_controller.setCompanionAd(new Banner());//send in an empty banner
		}

		private var _loader:URLLoader;
		
		private function onBannerLoadComplete(e:Event):void {
			var data:String = (e.target as URLLoader).data;
			_controller.trace("Banner HTML was \"" + data + "\"", "HtmlCompanionAdPlugIn", Debug.INFO);
			if (data.toLowerCase().match(/\<iframe/)) {
				var regex:RegExp = /\<iframe[^\>]*src=\"(.+?)\"/i;
				var result:Object = regex.exec(data);
				var src:String = result[1];
			
				// Cancel Previous Loads
				if (_loader) {
					removeListeners();
					_loader = null;
				}
				
				_loader = new URLLoader();
				_loader.addEventListener(Event.COMPLETE, onBannerLoadComplete);
				_loader.addEventListener(IOErrorEvent.IO_ERROR, onBannerLoadError);
				_loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onBannerLoadError);
				_loader.load(new URLRequest(src));
			}
			else {
				_banner = HtmlCompanionAdParser.parseCompanionAd(data, _banner);
				_busy = false;
				if (!_cancelled)
					_controller.setCompanionAd(_banner);
			}
		}
		
		private function removeListeners():void {
			_loader.removeEventListener(Event.COMPLETE, onBannerLoadComplete);
			_loader.removeEventListener(IOErrorEvent.IO_ERROR, onBannerLoadError);
			_loader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, onBannerLoadError);
		}
		
	}
}
