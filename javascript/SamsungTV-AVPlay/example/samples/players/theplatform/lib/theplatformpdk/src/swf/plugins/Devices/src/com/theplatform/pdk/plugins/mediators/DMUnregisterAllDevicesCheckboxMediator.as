package com.theplatform.pdk.plugins.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.mediators.DefaultCheckBoxMediator;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.plugins.functions.DeviceManagerFormFunctions;

	public class DMUnregisterAllDevicesCheckboxMediator extends DefaultCheckBoxMediator
	{
		public function DMUnregisterAllDevicesCheckboxMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
		}
		
		override protected function setCard(card:Card):void
		{
			super.setCard(card);
			card.registerFunction(DeviceManagerFormFunctions.setAllDevicesChecked, this, setChecked);
		}
		
		override public function destroy():void
		{
			if (card)
				card.unRegisterFunction(DeviceManagerFormFunctions.setAllDevicesChecked);
			super.destroy();
		}
		
	}
}