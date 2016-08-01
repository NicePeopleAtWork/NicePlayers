package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.TextAreaControl;
	import com.theplatform.pdk.mediators.EmailSenderMediator;
	import com.theplatform.pdk.metadata.ItemMetaData;

	import flash.errors.IllegalOperationError;

	public class EmailCaptchaSenderMediator extends EmailSenderMediator
	{
		private var _textArea:TextAreaControl;

		public function EmailCaptchaSenderMediator(id:String, controller:IViewController, metadata:ItemMetaData = null, resources:Object = null)
		{
			super(id, controller, metadata, resources);
		}

		override protected function setItem(item:Item):void
		{
			_textArea = item as TextAreaControl;
			if (!_textArea)
				throw new IllegalOperationError("The emailSendToMediator must be associated with a TextArea");

			super.setItem(item);
			_textArea.paddingLeft = 6;
		}
	}
}