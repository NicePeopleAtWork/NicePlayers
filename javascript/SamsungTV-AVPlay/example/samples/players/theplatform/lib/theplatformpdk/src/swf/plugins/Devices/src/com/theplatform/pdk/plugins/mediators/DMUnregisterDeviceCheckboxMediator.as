package com.theplatform.pdk.plugins.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.mediators.DefaultCheckBoxMediator;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.plugins.functions.DeviceManagerFormFunctions;

	public class DMUnregisterDeviceCheckboxMediator extends DefaultCheckBoxMediator
	{
		public function DMUnregisterDeviceCheckboxMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
		}
		
		override protected function setCard(card:Card):void
		{
			super.setCard(card);
			card.registerFunction(DeviceManagerFormFunctions.setDeviceChecked, this, setChecked);
			card.registerFunction(DeviceManagerFormFunctions.setCurrentDeviceControlsVisibility, this, setVisible);
		}
		
		protected function setVisible(visible:Boolean):void
		{
			_checkBoxControl.visible = visible;
		}
		
		override public function destroy():void
		{
			if (card)
				card.unRegisterFunction(DeviceManagerFormFunctions.setDeviceChecked);
			super.destroy();
		}
		
	}
}