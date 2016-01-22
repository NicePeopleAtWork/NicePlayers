package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.events.ButtonEvent;
	import com.theplatform.pdk.functions.EmailFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	
	import flash.errors.IllegalOperationError;
	
	public class EmailSendMediator extends FormButtonControlMediator
	{
		public function EmailSendMediator(id:String, controller:IViewController, metadata:ItemMetaData = null, resources:Object = null)
		{
			super(id, controller, metadata, resources);
		}
		
		override protected function setItem(item:Item):void
		{
			super.setItem(item);
			
			//TO DO: register function for enable/disable
						
			_buttonControl.addEventListener(ButtonEvent.OnButtonClick, sendClicked, false, 0, true);
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
		}
		
		private function sendClicked(e:ButtonEvent):void
		{
			if (card)
			{
				card.call(EmailFormFunctions.submitEmail, []);//should be registered in the email card mediator
			}
			else
			{
				throw new IllegalOperationError("EmailSendMediator does not have a card");
			}
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
