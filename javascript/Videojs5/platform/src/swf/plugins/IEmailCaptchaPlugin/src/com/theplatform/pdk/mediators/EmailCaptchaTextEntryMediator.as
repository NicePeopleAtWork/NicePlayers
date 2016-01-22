package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.TextAreaControl;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.events.EmailFormEvent;
	import com.theplatform.pdk.functions.EmailFormFunctions;
	import com.theplatform.pdk.functions.CaptchaFunctions;
	import com.theplatform.pdk.mediators.Mediator;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.styles.PlayerStyleFactory;

	import flash.errors.IllegalOperationError;

	public class EmailCaptchaTextEntryMediator extends Mediator
	{

		private var _textArea:TextAreaControl;
		private var _input:Boolean = false;

		public function EmailCaptchaTextEntryMediator(id:String, controller:IViewController, metadata:ItemMetaData = null, resources:Object = null)
		{
			super(id, controller, metadata, resources);
		}

		override protected function setItem(item:Item):void
		{
			_textArea = item as TextAreaControl;
			if (!_textArea)
				throw new IllegalOperationError("The captchaTextEntryMediator must be associated with a TextArea");

			super.setItem(item);
			_textArea.paddingTop = 1;
			_textArea.paddingLeft = 5;
			_textArea.textStyle = PlayerStyleFactory.PLAYER_FORM_INPUT_FONT;
			//any interactions we need for the textArea?
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);

			card.registerFunction(CaptchaFunctions.getCaptchaText, this, getCaptchaText);
			card.registerFunction(CaptchaFunctions.addErrorMessage, this, addErrorMessage);

			card.addEventListener(EmailFormEvent.OnEmailSubmitted, formSubmitted);
		}

		private function getCaptchaText():String
		{
			return _textArea.text;
		}

		private function alert(value:Boolean):void
		{
			_textArea.alert = value;
		}

		private function addErrorMessage(txt:String):void
		{
			_textArea.text = txt;
			_textArea.alert = true;
		}

		private function formSubmitted(e:EmailFormEvent):void
		{
			_textArea.alert = false;
		}

		override public function destroy():void
		{
			if (card)
			{
				card.unRegisterFunction(CaptchaFunctions.addErrorMessage);
				card.removeEventListener(EmailFormEvent.OnEmailSubmitted, formSubmitted);
			}
			super.destroy();
		}

	}
}