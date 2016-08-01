package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.TextAreaControl;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.functions.InfoFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.styles.PlayerStyleFactory;
	
	import flash.errors.IllegalOperationError;

	public class InfoDescriptionMediator extends Mediator
	{
		private var _textArea:TextAreaControl;
		
		public function InfoDescriptionMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
		}
		
		override protected function setItem(item:Item):void
		{
			_textArea = item as TextAreaControl;
			if (!_textArea) throw new IllegalOperationError("the info description mediator must be coupled with a textAreaControl");
				
			super.setItem(item);
			
			if (_textArea.textStyle == PlayerStyleFactory.DEFAULT_FONT)
				_textArea.textStyle = PlayerStyleFactory.PLAYER_FORM_MESSAGE_FONT;
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
			
			card.registerFunction(InfoFormFunctions.setInfoDescriptionText, this, setText);
		}
		
		private function setText(str:String):void
		{
			if (_textArea)
			{
				if (str)
				{
					_textArea.text = str;
				}
				else
				{
					_textArea.text = " ";//don't completely get rid of the description, it still needs to take up as much space as possible
				}
			}
		}
		
		override public function destroy():void
		{
			if (card)
				card.unRegisterFunction(InfoFormFunctions.setInfoDescriptionText);
			super.destroy();
		}
	}
}
