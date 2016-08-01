package com.theplatform.pdk.plugins.views
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.events.PlayerEvent;
	import com.theplatform.pdk.utils.Debug;
	import com.theplatform.pdk.utils.Positioning;
	
	import flash.display.Sprite;
	import flash.geom.Rectangle;

	public class AuthenticatingIndicatorHolder extends Sprite
	{
		
		private static const DEFAULT_LOADING_SKIN:String  = "PlayerLoadingIndicatorSkin";
		private var _loadingIndicator:Sprite;
		protected var _controller:IPlayerController;
		private var _mediaArea:Rectangle;
		private var _visible:Boolean = false;
		
		public function AuthenticatingIndicatorHolder(controller:IPlayerController)
		{
			_controller = controller;
			init();
		}
		
		private function init():void
		{
//			_loadingIndicator = _controller.getAsset(DEFAULT_LOADING_SKIN) as Sprite;
			_mediaArea = _controller.getMediaArea();
			_controller.addEventListener(PlayerEvent.OnMediaAreaChanged, onMediaAreaChanged);	
			if(_visible)
				show();
		}
		
		private function onMediaAreaChanged(e:PlayerEvent):void
		{
			_mediaArea = e.data as Rectangle;
			setPosition(_loadingIndicator);
		}
		
		private function setPosition(skin:Sprite):void
		{
			if (skin) Positioning.alignDisplayObject(skin, _mediaArea, "MM");
		}
		
		public function show():void
		{
			_visible = true;
			if(_loadingIndicator) {
				 addChild(_loadingIndicator);
				 setPosition(_loadingIndicator);
				 _controller.trace("Showing the loading indicator","AuthenticatingIndicatorHolder", Debug.INFO);
			}
		}
		
		public function hide():void
		{
			_visible = false;
			if(_loadingIndicator && contains(_loadingIndicator)) {
				removeChild(_loadingIndicator);
				_controller.trace("Hiding the loading indicator","AuthenticatingIndicatorHolder", Debug.INFO);
			}
		}
			
	}
}