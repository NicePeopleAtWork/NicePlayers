package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.IconType;
	import com.theplatform.pdk.controls.ImageControl;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.functions.HeaderFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	
	import flash.errors.IllegalOperationError;

	public class HeaderIconMediator extends Mediator
	{
		protected var _image:ImageControl;
		
		public function HeaderIconMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
		}
		
		override protected function setItem(item:Item):void
		{
			_image = item as ImageControl;
			_image.colorize = true;
			if (!_image) throw new IllegalOperationError("HeaderIconMediator must have an image control");
			
			super.setItem(item);
			
			//just hard code for now
			//_image.image = "ShareImage";
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
			
			card.registerFunction(HeaderFunctions.setHeaderIcon, this, setIcon);
		}
		
		private function setIcon(icon:*):void
		{
			_image.image = icon;
		}
		
		override public function destroy():void
		{
			if (card)
			{
				card.unRegisterFunction(HeaderFunctions.setHeaderIcon);
			}
			super.destroy();
		}
		
	}
}
