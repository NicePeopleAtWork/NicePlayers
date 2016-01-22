package com.theplatform.pdk.plugins.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.IconType;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.events.ButtonEvent;
	import com.theplatform.pdk.mediators.FormButtonControlMediator;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.plugins.functions.DeviceManagerFormFunctions;

	public class DMUnregisterAllDevicesButtonMediator extends FormButtonControlMediator
	{
		
		private static const DEFAULT_TOOLTIP:String = "Copy RSS text to clipboard";
		//private static const DEFAULT_LABEL:String   = "Copy to clipboard";
		private static const DEFAULT_ICON:String    = IconType.NONE;
		
		public function DMUnregisterAllDevicesButtonMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
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
			_buttonControl.addEventListener(ButtonEvent.OnButtonClick, unregisterAllDevices, false, 0, true);
		}
		
		private function unregisterAllDevices(e:ButtonEvent):void
		{
			card.call(DeviceManagerFormFunctions.unregisterAllDevices, []);
		}
		
		override public function destroy():void
		{
			if (_buttonControl)
			{
				_buttonControl.removeEventListener(ButtonEvent.OnButtonClick, unregisterAllDevices);
			}
			super.destroy();
		}
		
	}
}