package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.TextAreaControl;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.events.EmailFormEvent;
	import com.theplatform.pdk.functions.EmailFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.styles.PlayerStyleFactory;
	
	import flash.errors.IllegalOperationError;

	public class EmailSenderMediator extends DefaultTextAreaMediator
	{
		private var _textArea:TextAreaControl;
		
		public function EmailSenderMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
		}
		
		override protected function setItem(item:Item):void
		{
			_textArea = item as TextAreaControl;
			if (!_textArea) throw new IllegalOperationError("The emailSenderMediator must be associated with a TextArea");
			
			super.setItem(item);
			_textArea.paddingTop = 1;
			_textArea.paddingLeft = 2;
			_textArea.textStyle = PlayerStyleFactory.PLAYER_FORM_INPUT_FONT;
			
			//any interactions we need for the textArea?
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
			
			card.registerFunction(EmailFormFunctions.getEmailSender, this, getEmailSender);
			card.registerFunction(EmailFormFunctions.emailSenderAlert, this, alert);
			
			card.addEventListener(EmailFormEvent.OnEmailSubmitted, formSubmitted); 
		}
		
		private function getEmailSender():String
		{
			return _textArea.text;
		}
		
		private function alert(value:Boolean):void
		{						
			// set the state on the control that will change the skin
			_textArea.alert = value;
		}
		
		private function formSubmitted(e:EmailFormEvent):void
		{			
		}
		
		override public function destroy():void
		{
			if (card)
			{
				card.unRegisterFunction(EmailFormFunctions.getEmailSender);
				card.unRegisterFunction(EmailFormFunctions.emailSenderAlert);
				
				card.removeEventListener(EmailFormEvent.OnEmailSubmitted, formSubmitted);
			}
			super.destroy();
			
		}
		
	}
}
