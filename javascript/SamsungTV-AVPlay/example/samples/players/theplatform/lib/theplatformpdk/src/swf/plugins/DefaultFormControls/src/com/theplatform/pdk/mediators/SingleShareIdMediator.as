package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.ImageControl;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.functions.SingleSharingCardFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	
	import flash.errors.IllegalOperationError;

	public class SingleShareIdMediator extends Mediator
	{
		private var _icon:*;
		private var _imgControl:ImageControl;

		public function SingleShareIdMediator(id:String, controller:IViewController, metadata:ItemMetaData=null)
		{
			super(id, controller, metadata, resources);
		}
		
		override protected function setCard(card:Card):void
		{
			card.registerFunction(SingleSharingCardFunctions.setSharingSiteIcon, this, setIcon);
		}

		override protected function setItem(item:Item):void
		{
			super.setItem(item);
			_imgControl = item as ImageControl;
			
			if(!_imgControl)
			{
				throw new IllegalOperationError("item is not cast as ImageControl in SingleShareIdMediator");
			}
			
			_imgControl.colorize = false;
		}

		override public function destroy():void
		{
			super.destroy();
		}

		public function setIcon(i:*):void
		{
			_icon = i;
			
			if(_imgControl)
			{
				_imgControl.colorize = false;
				_imgControl.image = _icon;
			}
		}
	}
}
