package com.theplatform.pdk.plugins {
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.data.SharingSite;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.display.DisplayObject;
	import flash.display.Loader;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.net.URLRequest;

	public class SampleSharingSitePlugIn extends Sprite implements IPlugIn
	{
		private var  _controller:IPlayerController;
		private var _site:Object;
		private var _loader:Loader;
		
		public function SampleSharingSitePlugIn()
		{
		}
		
		public function initialize(lo:LoadObject):void
		{
			_controller = lo.controller as IPlayerController;
			_controller.trace("*** SampleSharingSitePlugIn is UP!!! ***")
			
			_site = new Object();
			_site.id = "musicBook";
			_site.priority = 10;
			_site.title = "musicBook";
			_site.iconUrl = "images/icons/musicBook.png";
			_site.url = "http://www.google.com"
			
			var req:URLRequest = new URLRequest(_site.iconUrl);
			
			_loader = new Loader(); 
			_loader.contentLoaderInfo.addEventListener(Event.COMPLETE, loadComplete);
			_loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, loadError);
            try
            {
                _loader.load(req);
            }
            catch (e:Error)
            {
                _controller.trace("Unable to load icon: " + _site.id +  "  url=[" + _site.iconUrl + "]", "SampleSharingSitePlugIn", Debug.ERROR);
			    cleanUp();
            }
		}
		
		private function loadComplete(e:Event):void 
		{
			var icon:DisplayObject = _loader as DisplayObject;
			_controller.addSharingSite(_site.id, _site.priority, _site.title, icon, _site.url); 
			cleanUp(); 
		}
		
		private function loadError(e:Event):void 
		{
			_controller.trace("Unable to load icon: " + _site.id +  "  url=[" + _site.url + "]", "SampleSharingSitePlugIn", Debug.ERROR);
			cleanUp(); 
		}
		
		private function cleanUp():void
		{
			if (_loader)
			{
				_loader.contentLoaderInfo.removeEventListener(Event.COMPLETE, loadComplete);
				_loader.contentLoaderInfo.removeEventListener(IOErrorEvent.IO_ERROR, loadError);
			}			
			debug();
		}
		
		private function debug():void
		{
			
			var site:SharingSite = _controller.getSharingSite(_site.id) as SharingSite;
			if (site)
				_controller.trace("Added site:" + site.id, "SampleSharingSitePlugIn");
			else
				_controller.trace("Unable to add site:" + _site.id, "SampleSharingSitePlugIn");
		}
	}
}
