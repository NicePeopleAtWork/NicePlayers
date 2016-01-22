package com.theplatform.pdk.plugins 
{
	import com.theplatform.pdk.controllers.IClipInfoController;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.ClipInfoMetadata;
	import com.theplatform.pdk.data.LoadObject;
	
	import flash.display.Sprite;
	
	public class SampleClipInfoMetadata extends Sprite implements IClipInfoMetadataPlugIn
	{
		private var _controller:IClipInfoController;
		
		public function SampleClipInfoMetadata()
		{
		}
		
		public function initialize(lo:LoadObject):void
		{
			_controller = lo.controller as IClipInfoController;
			_controller.registerMetadataPlugIn(this, lo.priority);
		}
		
		public function formatMetadata(metadata:ClipInfoMetadata, clip:Clip):Boolean
		{
			//we're just going to add a - in front of every title
			if (metadata.title)
			{
				metadata.title = "- " + metadata.title;
				_controller.setMetadata(metadata);//this function can be called asynchronously if necessary
				return true;
			}
			//else we don't care about it
			return false;
			
			
			
		}
	}
}
