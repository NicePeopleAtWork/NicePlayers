package com.theplatform.pdk.plugins.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.events.ButtonEvent;
	import com.theplatform.pdk.mediators.PlayerButtonControlMediator;
	import com.theplatform.pdk.metadata.ItemMetaData;
	
	import flash.errors.IllegalOperationError;
import flash.events.Event;

public class DMMenuButtonMediator extends PlayerButtonControlMediator
	{
		
		
		private static const DEFAULT_TOOLTIP:String = "Devices";
		private static const DEFAULT_LABEL:String   = "Devices";
		
		private var _icons:Array;
		
		
		public function DMMenuButtonMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
			if(resources.hasOwnProperty("icons")) 
				_icons = resources['icons'];
				
		}
		
		override protected function setItem(item:Item):void
		{
			super.setItem(item);

			// check to make sure it works
			if (!_buttonControl) throw new IllegalOperationError("the type of control set on the DefaultInfoMediator was incorrect");

			//handle defaults
			if(_icons)
				_buttonControl.icon = _icons;
			if (_buttonControl.label == null) _buttonControl.label = DEFAULT_LABEL;
			if (_buttonControl.tooltip == null) _buttonControl.tooltip = DEFAULT_TOOLTIP;
			
			// add event listeners 	
			_buttonControl.addEventListener(ButtonEvent.OnButtonClick, handleClick);
		}
		
		protected function handleClick(e:ButtonEvent):void
		{

            //kinda quick/hackish
            dispatchEvent(new Event("showDeviceManagerCard"));

			//_controller.showCard("forms", "tpDeviceManagerCard");
		}
		
		override public function destroy():void
		{
			
			if (_buttonControl)
			{
				_buttonControl.removeEventListener(ButtonEvent.OnButtonClick, handleClick);
			}
			
		}
		

	}
}
