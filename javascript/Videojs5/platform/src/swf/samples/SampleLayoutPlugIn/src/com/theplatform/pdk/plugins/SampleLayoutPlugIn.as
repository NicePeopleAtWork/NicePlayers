package com.theplatform.pdk.plugins 
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.LoadObject;
	
	import flash.display.Sprite;
	import flash.events.TimerEvent;
	import flash.utils.Timer;

	public class SampleLayoutPlugIn extends Sprite implements IPlugIn
	{
		private var _controller:IPlayerController
		
		private var _newLayout:String;
		private var _newLayoutUrl:String;
		private var _oldLayout:String;
		private var _oldLayoutUrl:String;
		private var _transitionSecs:int;
		private var _timer:Timer;
		private var _isNewLayout:Boolean = false;
		
		public function SampleLayoutPlugIn()
		{
		}
		
		public function initialize(lo:LoadObject):void
		{
			_controller = lo.controller as IPlayerController;
			
			_newLayout = lo.vars.newLayout;
			_newLayoutUrl = lo.vars.newLayoutUrl;
			_transitionSecs = lo.vars.time ? int(lo.vars.time) : 3;
			if (!_transitionSecs) _transitionSecs = 3;//just to make sure
			
			if (_newLayout || _newLayoutUrl)
			{
				_timer = new Timer(_transitionSecs * 1000);//just one tick
				_timer.addEventListener(TimerEvent.TIMER, transitionTick, false, 0, true);
				_timer.start();
				
				//make sure we capture the old properties so we can toggle back and forth
				//these values must be set via flashVar or component property; unless one of these values is explicitly set
				//there's no way to get at the default layout in a way the would be useful here
				_oldLayout = _controller.getProperty("layout");
				_oldLayoutUrl = _controller.getProperty("layoutUrl");
			}
		}
		
		private function transitionTick(e:TimerEvent):void
		{
			if (_isNewLayout)
			{
				setLayout(_oldLayout, _oldLayoutUrl);
			}
			else
			{
				setLayout(_newLayout, _newLayoutUrl);
			}
			_isNewLayout = !_isNewLayout
		}
		
		private function setLayout(layout:String, layoutUrl:String):void
		{
			//setting the property will kick off the layout change
			if (layout)
			{
				_controller.setProperty("layout", layout);
			}
			else if (layoutUrl)
			{
				_controller.setProperty("layoutUrl", layoutUrl);
			}
		}
		
	}
}
