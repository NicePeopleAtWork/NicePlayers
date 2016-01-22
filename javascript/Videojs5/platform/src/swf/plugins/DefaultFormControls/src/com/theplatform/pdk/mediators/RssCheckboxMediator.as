package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.IconType;
	import com.theplatform.pdk.controls.ImageControl;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.functions.RssFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	
	import flash.errors.IllegalOperationError;

	public class RssCheckboxMediator extends DefaultCheckBoxMediator
	{
		public function RssCheckboxMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
		}
		override protected function setItem(item:Item):void
		{
			_checkBoxControl = item as ImageControl;
			if (!_checkBoxControl) 
				throw new IllegalOperationError("The RssCheckboxMediator must be associated with a ImageControl");
				
			super.setItem(item);
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
			card.registerFunction(RssFormFunctions.setChecked, this, setChecked);
		}
		
		override public function destroy():void
		{
			if (card)
				card.unRegisterFunction(RssFormFunctions.setChecked);
			super.destroy();
		}

	}
}
