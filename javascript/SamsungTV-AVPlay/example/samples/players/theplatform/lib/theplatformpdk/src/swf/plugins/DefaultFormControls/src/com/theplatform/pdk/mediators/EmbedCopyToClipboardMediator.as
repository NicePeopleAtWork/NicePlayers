package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.IconType;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.events.ButtonEvent;
	import com.theplatform.pdk.functions.EmbedFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;

	public class EmbedCopyToClipboardMediator extends FormButtonControlMediator
	{
		private static const DEFAULT_TOOLTIP:String = "Copy Embed text to clipboard";
		private static const DEFAULT_LABEL:String   = "Copy to clipboard";
		private static const DEFAULT_ICON:String    = IconType.NONE;
		
		public function EmbedCopyToClipboardMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
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
			_buttonControl.showLabel = true;			
			_buttonControl.addEventListener(ButtonEvent.OnButtonClick, sendClicked, false, 0, true);
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
		}
		
		private function sendClicked(e:ButtonEvent):void
		{
			card.call(EmbedFormFunctions.copyToClipboard, []);
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
