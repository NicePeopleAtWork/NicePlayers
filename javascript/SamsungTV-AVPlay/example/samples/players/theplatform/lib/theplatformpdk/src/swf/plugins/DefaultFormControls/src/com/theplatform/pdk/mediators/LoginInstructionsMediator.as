package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.TextControl;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.styles.PlayerStyleFactory;

	import flash.errors.IllegalOperationError;

	public class LoginInstructionsMediator extends Mediator
	{
		private var _txtControl:TextControl;
        private var _instructions:String = "Please enter your username and password to continue";
        private var _color:uint=0xFFFFFF;

		public function LoginInstructionsMediator(id:String, controller:IViewController, metadata:ItemMetaData=null)
		{
			super(id, controller, metadata, resources);
		}

		override protected function setItem(item:Item):void
		{
			super.setItem(item);

			_txtControl = item as TextControl;
            _txtControl.text=_instructions;
            _txtControl.textColor=_color;
			if(!_txtControl)
			{
				throw new IllegalOperationError("item not set to textControl in LoginInstructionsMediator");
			}else
			{
				_txtControl.textStyle = PlayerStyleFactory.PLAYER_FORM_DESCRIPTION_FONT;
			}
		}

		override protected function setCard(card:Card):void
		{
			//register functions
			card.registerFunction("setLoginInstructions", this, setText);
            card.registerFunction("setLoginInstructionsColor", this, setColor);

            if (card.initVars["instructionsColor"])
                _color = card.initVars["instructionsColor"] as uint;
            if (_instructions)
                _instructions = card.initVars["instructions"];

            if(_txtControl)
			{
                if (_instructions)
				    _txtControl.text=_instructions;
                if (_color)
                    _txtControl.textColor=_color;

			}

		}

		private function setText(s:String):void
		{
			if(_txtControl)
			{
				_txtControl.text=s;
			}
		}

        private function setColor(color:uint):void
        {

            if(_txtControl)
			{
				_txtControl.textColor = color;
			}


        }

        override public function destroy():void
        {
            if (card)
            {
                card.unRegisterFunction("setLoginInstructions");
            }
        }

	}
}
