package com.theplatform.pdk.mediators
{
import com.theplatform.pdk.containers.ComponentArea;
import com.theplatform.pdk.controllers.IViewController;
import com.theplatform.pdk.controllers.PlayerController;
import com.theplatform.pdk.controls.IconType;
import com.theplatform.pdk.controls.Item;
import com.theplatform.pdk.data.Card;
import com.theplatform.pdk.events.CardEvent;
import com.theplatform.pdk.events.PdkEvent;
import com.theplatform.pdk.events.PlayerEvent;
import com.theplatform.pdk.functions.HeaderFunctions;
import com.theplatform.pdk.metadata.ItemMetaData;

import fl.core.UIComponent;

public class DefaultLoginCardMediator extends FormCardMediator
{

    protected var _isFullScreen:Boolean = false;
    private var _username:String;
    private var _password:String;
    

    private var _instructions:String = "Please enter your username and password to continue";
    private var _errorInstructions:String = "Invalid username or password, please try again";
    private var _errorColor:uint = 0xFF0000;
    private var _instructionsColor:uint = 0xFFFFF;
    private var _context:String;
	
	private var _submitted:Boolean = false;

    private var foo:UIComponent;


    public function DefaultLoginCardMediator(id:String, controller:IViewController, metadata:ItemMetaData = null, resources:Object = null)
    {

        super(id, controller, metadata, resources);

        if (!_title) _title = "Authenticate";

        
        
    }


    override protected function setItem(item:Item):void
    {
        super.setItem(item);

        _isFullScreen = (_controller as PlayerController).getFullScreenState();
    }

    override protected function setCard(card:Card):void
    {
        super.setCard(card);
    }

    override protected function cardCreated(componentArea:ComponentArea):void
    {
		if (card)
        {
            card.registerFunction("submitLogin",this,submitLogin);
            card.registerFunction("tabNext",this,tabNext);
        }

        super.cardCreated(componentArea);

        if (_card.initVars["instructions"])
            _instructions = _card.initVars["instructions"];
        if (_card.initVars["instructionsColor"])
            _instructionsColor = _card.initVars["instructionsColor"];
        if (_card.initVars["errorInstructions"])
            _errorInstructions=_card.initVars["errorInstructions"];
        if (_card.initVars["errorColor"])
            _errorColor=_card.initVars["errorColor"]
        if (_card.initVars["context"])
            _context=_card.initVars["context"];


    }
	
	override protected function deckCreated():void
	{
		card.call("setLoginInstructions",[_instructions]);
        card.call("setLoginInstructionsColor",[_instructionsColor]);
		
		if (card.parent)
		{
			card.call(HeaderFunctions.setHeaderIcon, [IconType.NONE]);
			card.call(HeaderFunctions.setHeaderTitle, [_title]);
		}
		
		super.deckCreated();
	}

    private function tabNext(id:String):void
    {

//        card.call("getFocus",[id]);
        card.dispatchEvent(new CardEvent("getFocus",id));

    }


    private function doClose(e:PlayerEvent = null):void
    {

        if (e && e.data && e.data['context'] !=_context)
                return;

		_controller.removeEventListener(PlayerEvent.OnRetryLogin,doRetry);
        _controller.removeEventListener(PlayerEvent.OnCloseLogin,doClose);


      	(_controller as PlayerController).hideCard("forms");
    }

    private function doRetry(e:PlayerEvent = null):void
    {

        if (e&&e.data&&e.data['context'] !=_context)
                return;

        _controller.removeEventListener(PlayerEvent.OnRetryLogin, doRetry);
        _controller.removeEventListener(PlayerEvent.OnCloseLogin, doClose);
		
		_submitted = false;

        card.call("enableLoginButton",[true]);

        card.call("setLoginInstructions",[_errorInstructions]);
        card.call("setLoginInstructionsColor",[_errorColor]);
    }
    

    private function submitLogin():void
    {
        card.call("enableLoginButton",[false]);

        _username=card.call("getUserName",[]);
        _password=card.call("getPassword",[]);


        _controller.addEventListener(PlayerEvent.OnRetryLogin, doRetry);
        _controller.addEventListener(PlayerEvent.OnCloseLogin, doClose);

		_submitted = true;

        (_controller as PlayerController).dispatchEvent(new PlayerEvent(PlayerEvent.OnLoginSubmitted,{username:_username, password:_password}));


    }

    override protected function cardDestroyed(card:Card):void
	{
		if (!_submitted)
		{
			(_controller as PlayerController).dispatchEvent(new PlayerEvent(PlayerEvent.OnLoginCancelled));
		}
		else
		{
			_controller.removeEventListener(PlayerEvent.OnRetryLogin,doRetry);
			_controller.removeEventListener(PlayerEvent.OnCloseLogin,doClose);
		}
		
        card.unRegisterFunction("closeLogin");
        card.unRegisterFunction("submitLogin");
        card.unRegisterFunction("tabNext");


		super.cardDestroyed(card);
	}


}
}
