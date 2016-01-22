package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.controls.IconType;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.events.ButtonEvent;
	import com.theplatform.pdk.events.ItemEvent;
	import com.theplatform.pdk.metadata.ItemMetaData;

	public class LoginSubmitMediator extends FormButtonControlMediator
	{

		public function LoginSubmitMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
		}

		override protected function setItem(item:Item):void
		{
			super.setItem(item);

			_buttonControl.addEventListener(ButtonEvent.OnButtonClick, buttonClicked, false, 0, true);
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);


            if (card)
            {

                card.registerFunction("enableLoginButton",this,enableLogin);
            }

		}

        private function enableLogin(enable:Boolean):void
        {
            if (_buttonControl)
            {
               _buttonControl.enabled=enable; 
            }
        }

		private function buttonClicked(e:ButtonEvent):void
		{

            if (card)
            {
                card.call("submitLogin",[])
            }

			//(_controller as PlayerController).hideCard("forms");
		}

	}
}
