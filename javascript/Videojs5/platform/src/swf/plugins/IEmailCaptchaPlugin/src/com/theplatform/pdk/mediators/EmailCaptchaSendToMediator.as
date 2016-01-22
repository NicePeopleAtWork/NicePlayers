package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.TextAreaControl;
	import com.theplatform.pdk.mediators.EmailSendToMediator;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.styles.PlayerStyleFactory;
	
	import flash.errors.IllegalOperationError;

	public class EmailCaptchaSendToMediator extends EmailSendToMediator
	{
		private var _textArea:TextAreaControl;
		
		public function EmailCaptchaSendToMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
		}
		
		
		override protected function setItem(item:Item):void
		{
			_textArea = item as TextAreaControl;
			if (!_textArea) throw new IllegalOperationError("The emailSendToMediator must be associated with a TextArea");
			
			super.setItem(item);	
			_textArea.paddingLeft = 6;		
		}
	}
}