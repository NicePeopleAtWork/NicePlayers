package com.theplatform.pdk.plugins.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.TextAreaControl;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.mediators.DefaultTextAreaMediator;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.plugins.functions.DeviceManagerFormFunctions;
	import com.theplatform.pdk.styles.PlayerStyleFactory;
	
	import flash.errors.IllegalOperationError;

	public class DMTextMediator extends DefaultTextAreaMediator
	{
		private var _textArea:TextAreaControl;
		private var _defaultMessage:String = "You currently have 6 out of 6 devices registered. If you have reached your limit, you'll need to remove one or more devices in order to use additional ones. What would you like to do?";
		
		public function DMTextMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
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

		}
		
		
		override protected function setCard(card:Card):void
		{
			card.registerFunction(DeviceManagerFormFunctions.setDeviceManagerFormText, this, setText);
		}
		
		
		private function setText(str:String):void
		{
			trace(this+" setText: "+str);
			if(_textArea)
				_textArea.text = str;
						
		}
		
		override public function destroy():void
		{
			if (card)
				card.unRegisterFunction(DeviceManagerFormFunctions.setDeviceManagerFormText);

			super.destroy();
		}
		
		
	}
}