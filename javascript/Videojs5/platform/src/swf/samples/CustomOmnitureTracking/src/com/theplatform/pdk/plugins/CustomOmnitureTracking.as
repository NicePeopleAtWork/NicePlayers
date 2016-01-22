package com.theplatform.pdk.plugins
{
	import com.omniture.AppMeasurement;
	import com.theplatform.pdk.controllers.IBaseController;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.data.SeekObject;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.display.Sprite;

	public class CustomOmnitureTracking extends Sprite implements IPlugIn
	{
		private var _controller:IBaseController;

		private var _playlist:Playlist;
		private var _clip:Clip;
		private var _host:String;
		private var _percent:Number;
		private var _totalTime:Number;

		public function CustomOmnitureTracking()
		{
		}

		public function initialize(lo:LoadObject):void {
			_controller = lo.controller;
			_controller.trace("initialize", "CustomOmnitureTracking", Debug.INFO);
			_controller.registerFunction("omnitureTrackingMonitor", this, omnitureTrackingMonitor);
			_controller.addEventListener(PdkEvent.OnReleaseStart, onReleaseStart);
			_controller.addEventListener(PdkEvent.OnMediaLoadStart, onMediaLoadStart);
			_controller.addEventListener(PdkEvent.OnMediaStart, onMediaStart);
			_controller.addEventListener(PdkEvent.OnMediaSeek, onMediaSeek);
			_controller.addEventListener(PdkEvent.OnMediaPlaying, onMediaPlaying);
		}
		
		private function onReleaseStart(e:PdkEvent):void {
			_playlist = e.data as Playlist;
			_controller.trace("OnReleaseStart: " + _playlist.currentClip.title, "CustomOmnitureTracking", Debug.INFO);
		}

		private function onMediaLoadStart(e:PdkEvent):void {
			_clip = (e.data as Clip);
			_controller.trace("OnMediaLoadStart: " + _clip.title, "CustomOmnitureTracking", Debug.INFO);
		}

		private function onMediaStart(e:PdkEvent):void {
			_clip = (e.data as Clip);
			_controller.trace("OnMediaStart: " + _clip.title, "CustomOmnitureTracking", Debug.INFO);
		}
		
		private function onMediaSeek(e:PdkEvent):void
		{
			var so:SeekObject = e.data as SeekObject;
			_controller.trace("onMediaSeek: " + _totalTime, "CustomOmnitureTracking", Debug.INFO);
		}
		
		private function onMediaPlaying(e:PdkEvent):void
		{
			if (_clip && !_clip.isAd) {
				_totalTime += 333;
				_percent = (e.data.isAggregate ? e.data.percentCompleteAggregate : e.data.percentComplete);
			}
		}

		private function omnitureTrackingMonitor(s:AppMeasurement, media:Object, clip:Clip=null):void
		{
			if (clip)
			{
				_clip = clip;				
			}
			
			if (!_host)
			{
				if (s.pageURL.indexOf("/", 9) == -1)
					_host = s.pageURL;
				else
					_host = s.pageURL.substr(0, s.pageURL.indexOf("/", 9)); // start at char 9 to avoid https://
			}
			
			var mins:Number = Math.floor(_clip.length / 60000);
			var secs:Number = Math.floor((_clip.length - mins * 60000) / 1000);

			if(media.event=="OPEN")
			{
				_controller.trace("media.event = OPEN, isAd = " + _clip.isAd, "CustomOmnitureTracking", Debug.INFO);
				// Clear out props and eVars here that are unused for this event type


				if (_clip.isAd)
				{
					// Assign props and eVars that are appropriate for ads and clear out those that are not.
				}
				else
				{
					// Assign props and eVars that are appropriate for content and clear out those that are not.
				}
			
			}
			if((media.event=="CLOSE"))
			{
				_controller.trace("media.event = CLOSE, isAd = " + _clip.isAd, "CustomOmnitureTracking", Debug.INFO);
				if (_clip.isAd)
				{
					// Assign props and eVars that are appropriate for ads and clear out those that are not.
				}
				else
				{
					// Assign props and eVars that are appropriate for content and clear out those that are not.
				}
			}
			// Clear out any props later (at the end of the function)
			for (var p:String in s) 
				if (p.substring(0,4).indexOf("prop") >= 0)
				{
					s[p] = "";
				}
			
		}
	}
}