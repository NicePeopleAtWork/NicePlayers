package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.factory.ViewFactory;
	import com.theplatform.pdk.metadata.ItemMetaData;

	public class MenuCardMediator extends FormCardMediator
	{
		public function MenuCardMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
		}
		
		//// functions to interrogate the card xml
		public function checkAnyControlsVisible(fullScreen:Boolean):Boolean
		{
			if (!card) return true;//we can't know yet, we'll just assume yes
			
			var xml:XML = card.layout;
			
			for each (var node:XML in xml..control)
			{
				var id:String = node.@id;
				if (ViewFactory.isControlValid(id, _controller.id) && (!fullScreen || ViewFactory.isControlFullScreenValid(id, _controller.id)))
				{
					  return true;//there's at least one
				}
			}
			return false;
		}
		
	}
}