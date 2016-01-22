package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.ButtonControl;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.events.ButtonEvent;
	import com.theplatform.pdk.functions.CaptchaFunctions;
	import com.theplatform.pdk.mediators.ControlMediator;
	import com.theplatform.pdk.metadata.ItemMetaData;

	import flash.errors.IllegalOperationError

	public class EmailCaptchaSendMediator extends ControlMediator
	{
		private var _buttonControl:ButtonControl;

		public function EmailCaptchaSendMediator(id:String, controller:IViewController, metadata:ItemMetaData, resources:Object)
		{
			super(id, controller, metadata, resources);
		}

		protected override function setItem(item:Item):void
		{
			_buttonControl = item as ButtonControl;

			super.setItem(item);
			_buttonControl.addEventListener(ButtonEvent.OnButtonClick, handleClick, false, 0, true);
		}

		protected function handleClick(e:ButtonEvent):void
		{
			if (card)
			{
				card.call(CaptchaFunctions.submit, []); //should be registered in the email card mediator         
			}
			else
			{
				throw new IllegalOperationError("EntitlementButtonMediator does not have a card");
			}
		}

		override public function destroy():void
		{
			if (_buttonControl)
			{
				_buttonControl.removeEventListener(ButtonEvent.OnButtonClick, handleClick);
			}
			super.destroy();
		}
	}
}