package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.TextControl;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.functions.HeaderFunctions;
	import com.theplatform.pdk.functions.MenuFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	
	import flash.errors.IllegalOperationError;

	public class RelatedItemsTitleMediator extends Mediator
	{
		public static const DEFAULT_TITLE:String = "Related Items";
		private var _textControl:TextControl;
		private var _text:String = DEFAULT_TITLE;
		
		public function RelatedItemsTitleMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
		

			if (metadata.display["titleText"])
				_text = metadata.display["titleText"];		
		}

		override protected function setItem(item:Item):void
		{
			_textControl = item as TextControl;
			if (!_textControl) throw new IllegalOperationError("The RelatedItemsTitleMediator must have a text control");
			
			super.setItem(item);
				
			_textControl.text = _text;
			//	_title.fontStyle = "PlayerTitleFont"
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
			card.registerFunction(MenuFormFunctions.setRelatedItemsHeaderTitle, this, setTitle);
		}
		
		private function setTitle(title:String):void
		{
			_text = title;
			_textControl.text = _text;
		}
		
		override public function destroy():void
		{
			if (card)
			{
				card.unRegisterFunction(MenuFormFunctions.setRelatedItemsHeaderTitle);
			}
			
			super.destroy();
		}
		
	}
}