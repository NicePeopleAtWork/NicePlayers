package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.TextAreaControl;
	import com.theplatform.pdk.controls.TextAreaSkin;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.data.TextDirection;
	import com.theplatform.pdk.functions.LinkFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.styles.PlayerStyleFactory;
	
	import flash.errors.IllegalOperationError;

	public class LinkTextMediator extends DefaultTextAreaMediator
	{
		private var _textArea:TextAreaControl;
		
		public function LinkTextMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
		}
		
		override protected function setItem(item:Item):void
		{
			_textArea = item as TextAreaControl;
			if (!_textArea) 
				throw new IllegalOperationError("The LinkTextMediator must be associated with a TextArea");
			
			if (_textArea.textStyle == PlayerStyleFactory.DEFAULT_FONT)
				_textArea.textStyle = PlayerStyleFactory.PLAYER_FORM_MESSAGE_FONT;
			
			_textArea.multiline = true;
			_textArea.autoSelect = true;
			_textArea.skin = TextAreaSkin.DEFAULT;	
			_textArea.alwaysShowSelection = true;			
			_textArea.paddingTop = 1;
			_textArea.paddingLeft = 2;
			_textArea.textDirection = TextDirection.LEFT_TO_RIGHT;
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
			
			card.registerFunction(LinkFormFunctions.setLinkText, this, setText);
			card.registerFunction(LinkFormFunctions.selectLinkText, this, selectText)
		}
		
		private function setText(str:String):void
		{
			if (_textArea)
			{
				if (str) {
					_textArea.text = str;
				} else
					_textArea.visible = false;
			}
		}

		private function selectText():String
		{			
			_textArea.setSelection(0, _textArea.text.length);
			return _textArea.text;
		}
		
		override public function destroy():void
		{
			if (card)
			{
				card.unRegisterFunction(LinkFormFunctions.selectLinkText);
				card.unRegisterFunction(LinkFormFunctions.setLinkText);
			}
			super.destroy();
		}		
	}
}
