/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins.datasystem {
	import com.theplatform.pdk.controllers.IClipInfoController;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.managers.IBannerSystem;
	import com.theplatform.pdk.plugins.IDataSystemPlugIn;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.display.Sprite;

	public class InStreamDataSystem extends Sprite implements IDataSystemPlugIn
	{
		private var _controller:IClipInfoController;
		private var _bannerSystem:IBannerSystem;
		private var _priority:Number;
			
		public function InStreamDataSystem()
		{
		}
		
		public function initialize(lo:LoadObject):void
		{
			_controller = lo.controller as IClipInfoController;
			_controller.trace("initializing InStreamDataSystem...", "InStreamDataSystem", Debug.INFO);
			
			var priority:Number = lo.priority;
			if (priority) _priority = priority;
				var host:String = lo.vars["host"];
			
			_bannerSystem = new InStreamBanner(_controller, host);
			_controller.registerDataSystemPlugIn(this, _priority);
		}
		
		public function getBannerSystem(sBannerType:String):IBannerSystem
		{
			return _bannerSystem;
		}
	}
}
