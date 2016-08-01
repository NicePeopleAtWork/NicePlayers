package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.TextControl;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.styles.PlayerStyleFactory;

	import flash.errors.IllegalOperationError;

	public class LoginErrorMediator extends Mediator
	{
		private var _txtControl:TextControl;

		public function LoginErrorMediator(id:String, controller:IViewController, metadata:ItemMetaData=null)
		{
			super(id, controller, metadata, resources);
		}

		override protected function setItem(item:Item):void
		{
			super.setItem(item);

			_txtControl = item as TextControl;
			if(!_txtControl)
			{
				throw new IllegalOperationError("item not set to textControl in LoginErrorMediator");
			}else
			{
				_txtControl.textStyle = PlayerStyleFactory.PLAYER_FORM_DESCRIPTION_FONT;
			}
		}

		override protected function setCard(card:Card):void
		{
			//register functions
			card.registerFunction("setLoginErrorMessage", this, setText);
		}

		private function setText(s:String):void
		{
			if(_txtControl)
			{
				_txtControl.text = s;
			}
		}

        //also need ability to set color

        override public function destroy():void
        {
            if (card)
            {
                card.unRegisterFunction("setLoginErrorMessage");
            }
        }
	}
}

