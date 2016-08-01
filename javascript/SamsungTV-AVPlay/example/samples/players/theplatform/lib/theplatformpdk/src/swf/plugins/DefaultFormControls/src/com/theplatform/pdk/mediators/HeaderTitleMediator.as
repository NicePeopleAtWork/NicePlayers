package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.TextControl;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.functions.HeaderFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.styles.PlayerStyleFactory;
	
	import flash.errors.IllegalOperationError;

	public class HeaderTitleMediator extends Mediator
	{
		private var _title:TextControl;
		
		public function HeaderTitleMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
		}
		
		override protected function setItem(item:Item):void
		{
			_title = item as TextControl;
			if (!_title) throw new IllegalOperationError("The HeaderTitleMediator must have a text control");
			
			super.setItem(item);
		
			if (_title.textStyle == PlayerStyleFactory.DEFAULT_FONT) 
				_title.textStyle = PlayerStyleFactory.PLAYER_FORM_TITLE_FONT;
		//	_title.text = "SHARE";//stub this out for now
		//	_title.fontStyle = "PlayerTitleFont"
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
			
			card.registerFunction(HeaderFunctions.setHeaderTitle, this, setTitle);
		}
		
		private function setTitle(title:String):void
		{
			_title.text = title;
		}
		
		override public function destroy():void
		{
			if (card)
			{
				card.unRegisterFunction(HeaderFunctions.setHeaderTitle);
			}
			
			super.destroy();
		}
		
	}
}
