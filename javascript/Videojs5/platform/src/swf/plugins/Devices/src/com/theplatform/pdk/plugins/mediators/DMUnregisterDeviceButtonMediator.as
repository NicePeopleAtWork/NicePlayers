package com.theplatform.pdk.plugins.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.IconType;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.events.ButtonEvent;
	import com.theplatform.pdk.mediators.FormButtonControlMediator;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.plugins.functions.DeviceManagerFormFunctions;

	public class DMUnregisterDeviceButtonMediator extends FormButtonControlMediator
	{
		
		private static const DEFAULT_TOOLTIP:String = "Unregister this device";
		private static const DEFAULT_ICON:String    = IconType.NONE;
		
		public function DMUnregisterDeviceButtonMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
		}
		
		override protected function setItem(item:Item):void
		{
			super.setItem(item);
			
			//handle defaults
			if (_buttonControl.icon == undefined) _buttonControl.icon = DEFAULT_ICON;
			//if (_buttonControl.label == null) _buttonControl.label = DEFAULT_LABEL;
			if (_buttonControl.tooltip == null) _buttonControl.tooltip = DEFAULT_TOOLTIP;
			
			//TO DO: register function for unregister current device
			_buttonControl.addEventListener(ButtonEvent.OnButtonClick, unregisterCurrentDevice, false, 0, true);
		}
		
		override protected function setCard(card:Card):void
		{
			super.setCard(card);
			card.registerFunction(DeviceManagerFormFunctions.setCurrentDeviceControlsVisibility, this, setVisible);
		}
		
		protected function setVisible(visible:Boolean):void
		{
			_buttonControl.visible = visible;
		}
		
		private function unregisterCurrentDevice(e:ButtonEvent):void
		{
			card.call(DeviceManagerFormFunctions.unregisterCurrentDevice, []);
		}
		
		override public function destroy():void
		{
			if (_buttonControl)
			{
				_buttonControl.removeEventListener(ButtonEvent.OnButtonClick, unregisterCurrentDevice);
			}
			super.destroy();
		}
		
	}
}