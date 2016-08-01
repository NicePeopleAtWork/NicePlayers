package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.events.ButtonEvent;
	import com.theplatform.pdk.events.CardEvent;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.functions.SingleSharingCardFunctions;
	
	public class SingleSharePostMediator extends FormButtonControlMediator
	{
		private static const DEFAULT_TOOLTIP:String = "Share";
		private static const DEFAULT_LABEL:String   = "Share";
		
		public function SingleSharePostMediator(id:String, controller:IViewController, metadata:ItemMetaData=null)
		{
			super(id, controller, metadata, resources);
		}
		
		override protected function setItem(item:Item):void
		{
			super.setItem(item);
			
			//handle defaults
			if (_buttonControl.label == null) _buttonControl.label = DEFAULT_LABEL;
			if (_buttonControl.tooltip == null) _buttonControl.tooltip = DEFAULT_TOOLTIP; 
			
			_buttonControl.addEventListener(ButtonEvent.OnButtonClick, sendClicked, false, 0, true);
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
		}
				
		private function sendClicked(e:ButtonEvent):void
		{
			card.call(SingleSharingCardFunctions.postSharingSite, []); //registered in DefaultSingleSharingCardMediator
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