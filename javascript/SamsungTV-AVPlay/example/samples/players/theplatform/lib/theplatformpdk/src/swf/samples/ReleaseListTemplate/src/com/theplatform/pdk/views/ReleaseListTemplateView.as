// this is where you would implement the actual view

package com.theplatform.pdk.views
{
	import com.theplatform.pdk.controllers.ReleaseListController;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.display.Sprite;
	
	public class ReleaseListTemplateView
	{
		private var _controller:ReleaseListController;
		private var _sprite:Sprite;

		public function ReleaseListTemplateView(c:ReleaseListController, s:Sprite)
		{
			c.trace("Initializing ReleaseListTemplateView", null, Debug.INFO);
			_controller = c;
			_sprite = s;
		}
		
		// TODO all rendering
	}
}