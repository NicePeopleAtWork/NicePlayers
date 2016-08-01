package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.TextControl;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.functions.MenuFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	
	import flash.errors.IllegalOperationError;
	
	public class RelatedItemsRangeMediator extends Mediator 
	{
		private var _textControl:TextControl;
		
		public function RelatedItemsRangeMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
		}
		
		override protected function setItem(item:Item):void
		{
			_textControl = item as TextControl;
			if (!_textControl) throw new IllegalOperationError("The RelatedItemsRangeMediator must have a text control");
			
			super.setItem(item);
				
			//_textControl.text = "0 of 0";
			//	_title.fontStyle = "PlayerTitleFont"
		}

		
		override protected function setCard(card:Card):void
		{
			super.setCard(card);
			
			card.registerFunction(MenuFormFunctions.setRelatedItemsHeaderRange, this, setRange);
		}
		
		private function setRange(string:String):void
		{
			_textControl.text = string;
		}
		
		override public function destroy():void
		{
			if (card)
			{
				card.unRegisterFunction(MenuFormFunctions.setRelatedItemsHeaderRange);
			}
			
			super.destroy();
		}
	}
}