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

public class LoginPasswordMediator extends DefaultTextAreaMediator
{


    private var _textArea:TextAreaControl;
    private var _input:Boolean = true;
    private var _password:String;

    public function LoginPasswordMediator(id:String, controller:IViewController, metadata:ItemMetaData = null, resources:Object = null)
    {

        super(id, controller, metadata, resources);

    }

    override protected function setItem(item:Item):void
    {
        _textArea = item as TextAreaControl;
        _textArea.displayAsPassword = true;
        _textArea.text = _password;

        if (!_textArea) throw new IllegalOperationError("The LoginPasswordMediator must be associated with a TextArea");

        super.setItem(item);
        _textArea.paddingTop = 1;
        _textArea.paddingLeft = 2;
        _textArea.textStyle = PlayerStyleFactory.PLAYER_FORM_INPUT_FONT;
        //_textArea.h

        //any interactions we need for the textArea?

        _textArea.addEventListener(KeyboardEvent.KEY_UP, handleKeyUp, false, 0, true);
    }


    private function handleKeyUp(e:KeyboardEvent):void
    {
        if (e.keyCode == Keyboard.ENTER)
            card.call("submitLogin",[]);
        else if (e.keyCode==Keyboard.TAB)
        {
           // card.call("tabNext",["username"]);
        }

    }

    override protected function setCard(card:Card):void
    {
        super.setCard(card);

        card.registerFunction("getPassword", this, getPassword);


        card.addEventListener("getFocus",getFocus);

        _password = card.initVars["password"];
        if (_textArea && _password)
            _textArea.text = _password;

        //			card.registerFunction(EmailFormFunctions.getEmailSendTo, this, getEmailSendTo);
        //			card.registerFunction(EmailFormFunctions.emailSendToAlert, this, alert);
        //
        //			card.addEventListener(EmailFormEvent.OnEmailSubmitted, formSubmitted);
    }

    private function getFocus(e:CardEvent):void
    {

        var id:String = e.data as String;

        if (id=="password"&&_textArea)
            _textArea.setFocus();

    }

    private function getPassword():String
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

        }
        super.destroy();
    }
}

}
