package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.IconType;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.events.ButtonEvent;
	import com.theplatform.pdk.functions.LinkFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	
	public class LinkCloseMediator extends FormButtonControlMediator
	{
		private static const DEFAULT_TOOLTIP:String = "Close form";
		private static const DEFAULT_LABEL:String   = "Close";
		private static const DEFAULT_ICON:String    = IconType.NONE;
		
		public function LinkCloseMediator(id:String, controller:IViewController, metadata:ItemMetaData = null, resources:Object = null)
		{
			super(id, controller, metadata, resources);
		}

		
		override protected function setItem(item:Item):void
		{
			super.setItem(item);
			
			//handle defaults
			if (_buttonControl.icon == undefined) _buttonControl.icon = DEFAULT_ICON;
			if (_buttonControl.label == null) _buttonControl.label = DEFAULT_LABEL;
			if (_buttonControl.tooltip == null) _buttonControl.tooltip = DEFAULT_TOOLTIP;
			
			//TO DO: register function for enable/disable
						
			_buttonControl.addEventListener(ButtonEvent.OnButtonClick, sendClicked, false, 0, true);
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
		}
		
		private function sendClicked(e:ButtonEvent):void
		{
			card.call(LinkFormFunctions.closeLink, []);//should be registered in the email card mediator
		}
		
		override public function destroy():void
		{
			if (_buttonControl)
			{
				_buttonControl.removeEventListener(ButtonEvent.OnButtonClick, sendClicked);
			}
			super.destroy();
		}
		
	}
}
