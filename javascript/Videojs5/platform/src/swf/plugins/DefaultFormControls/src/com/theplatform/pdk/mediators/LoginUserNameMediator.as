package com.theplatform.pdk.mediators
{
import com.theplatform.pdk.controllers.IViewController;
import com.theplatform.pdk.controls.Item;
import com.theplatform.pdk.controls.TextAreaControl;
import com.theplatform.pdk.data.Card;
import com.theplatform.pdk.events.CardEvent;
import com.theplatform.pdk.metadata.ItemMetaData;

import com.theplatform.pdk.styles.PlayerStyleFactory;

import flash.errors.IllegalOperationError;
import flash.events.KeyboardEvent;
import flash.ui.Keyboard;

public class LoginUserNameMediator extends DefaultTextAreaMediator
{


    private var _textArea:TextAreaControl;
    private var _input:Boolean = true;
    private var _username:String;

    public function LoginUserNameMediator(id:String, controller:IViewController, metadata:ItemMetaData = null, resources:Object = null)
    {

        super(id, controller, metadata, resources);

    }

    override protected function setItem(item:Item):void
    {
        _textArea = item as TextAreaControl;
        if (!_textArea) throw new IllegalOperationError("The LoginUserNameMediator must be associated with a TextArea");

        _textArea.text = _username;

        

        super.setItem(item);
        _textArea.paddingTop = 1;
        _textArea.paddingLeft = 2;
        _textArea.textStyle = PlayerStyleFactory.PLAYER_FORM_INPUT_FONT;

        //any interactions we need for the textArea?

        _textArea.addEventListener(KeyboardEvent.KEY_UP, handleKeyUp, false, 0, true);
    }


    private function handleKeyUp(e:KeyboardEvent):void
    {
        if (e.keyCode == Keyboard.ENTER)
            card.call("submitLogin",[]);
        else if (e.keyCode==Keyboard.TAB)
        {
           // card.call("tabNext",["password"]);
        }

    }

    private function getFocus(e:CardEvent):void
    {

        var id:String = e.data as String;

        if (id=="username"&&_textArea)
            _textArea.setFocus();

    }


    override protected function setCard(card:Card):void
    {
        super.setCard(card);

        card.registerFunction("getUserName", this, getUserName);
        //card.registerFunction("getFocus", this, getFocus);

        card.addEventListener("getFocus",getFocus);


        _username = card.initVars["username"];
        if (_textArea)
            _textArea.text = _username;


        //			card.registerFunction(EmailFormFunctions.getEmailSendTo, this, getEmailSendTo);
        //			card.registerFunction(EmailFormFunctions.emailSendToAlert, this, alert);
        //
        //			card.addEventListener(EmailFormEvent.OnEmailSubmitted, formSubmitted);
    }

    private function getUserName():String
    {
        return _textArea.text;
    }


    private function alert(value:Boolean):void
    {
        _textArea.alert = value;
    }

    //		private function formSubmitted(e:EmailFormEvent):void
    //		{
    //
    //		}

    override public function destroy():void
    {
        if (card)
        {
            card.unRegisterFunction("getUserName");

            card.removeEventListener("getFocus",getFocus);

        }
        super.destroy();
    }
}

}
