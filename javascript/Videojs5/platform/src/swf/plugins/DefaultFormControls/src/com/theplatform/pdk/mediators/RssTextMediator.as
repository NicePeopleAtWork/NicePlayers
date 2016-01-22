package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.TextAreaControl;
	import com.theplatform.pdk.controls.TextAreaSkin;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.functions.RssFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.styles.PlayerStyleFactory;
	
	import flash.errors.IllegalOperationError;

	public class RssTextMediator extends DefaultTextAreaMediator
	{
		private var _textArea:TextAreaControl;
		private var _marginLeft:String = "0";
		private var _marginRight:String = "0";
		private var _marginTop:String = "0";
		private var _marginBottom:String = "0";
		private var _verticalGap:String = "0";

		
		public function RssTextMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
		}
		
		override protected function setItem(item:Item):void
		{
			_textArea = item as TextAreaControl;
			if (!_textArea) 
				throw new IllegalOperationError("The RssTextMediator must be associated with a TextArea");
			
			if (_textArea.textStyle == PlayerStyleFactory.DEFAULT_FONT)
				_textArea.textStyle = PlayerStyleFactory.PLAYER_FORM_MESSAGE_FONT;
			
			_textArea.alwaysShowSelection = true;			
			_textArea.autoSelect = true;
			_textArea.skin = TextAreaSkin.DEFAULT;			
			_textArea.paddingTop = 1;
			_textArea.paddingLeft = 2;
			
		}

		override protected function setCard(card:Card):void
		{
			
			card.registerFunction(RssFormFunctions.setRssText, this, setText);
			card.registerFunction(RssFormFunctions.selectRssText, this, selectText);
		}
		
		private function setText(str:String):void
		{
			if (_textArea)
			{
				if (str)
					_textArea.text = str;
				else
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
				card.unRegisterFunction(RssFormFunctions.selectRssText);
				card.unRegisterFunction(RssFormFunctions.setRssText);
			}
			super.destroy();
		}
		
	}
}
