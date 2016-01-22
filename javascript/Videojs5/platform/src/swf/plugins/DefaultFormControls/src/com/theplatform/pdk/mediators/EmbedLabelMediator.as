package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.TextControl;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.events.CardEvent;
	import com.theplatform.pdk.functions.EmbedFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	
	import flash.errors.IllegalOperationError;

	public class EmbedLabelMediator extends Mediator
	{
		private var _textControl:TextControl;
		private var _text:String = "Embed:";
		
		public function EmbedLabelMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
			
		}
		
		override protected function setItem(item:Item):void
		{
			_textControl = item as TextControl;
			if (!_textControl) 
				throw new IllegalOperationError("The EmbedLabelMediator must be associated with a TextControl");
				
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
			card.addEventListener(CardEvent.OnDeckCreated, onDeckCreated, false, 0, true);			
		}
		
		private function onDeckCreated(e:CardEvent):void
		{
			if (card.call(EmbedFormFunctions.hasEmbedText, []))
			{
				_textControl.text = _text;
			}
			else
			{
				_textControl.visible = false;
			}
		}
	}
}
