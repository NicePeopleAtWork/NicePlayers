package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.TextControl;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.styles.PlayerStyleFactory;
	
	import flash.errors.IllegalOperationError;

	public class ExcerptInstructionsMediator extends Mediator
	{
		protected var _text:TextControl;
		
		public function ExcerptInstructionsMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
		}
		
		override protected function setItem(item:Item):void
		{
			_text = item as TextControl;
			
			if (!_text) throw new IllegalOperationError("the Excerpt Instruction Mediator must have a text control")
			
			super.setItem(item);
			
			if (!_text.text) _text.text = "some instructions here";
			if (!_text.textStyle) _text.textStyle = PlayerStyleFactory.DEFAULT_FONT;
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
		}
	}
}
