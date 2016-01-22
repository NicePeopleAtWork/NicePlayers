package com.theplatform.pdk.plugins
{
import com.theplatform.pdk.communication.ScopeInfo;
import com.theplatform.pdk.controllers.IPlayerController;
import com.theplatform.pdk.data.CardActions;

import com.theplatform.pdk.data.Clip;
import com.theplatform.pdk.data.LoadObject;
import com.theplatform.pdk.events.PdkEvent;
import com.theplatform.pdk.events.PlayerEvent;
import com.theplatform.pdk.utils.Debug;

import fl.core.UIComponent;
import flash.display.Sprite;


public class SampleCredentialsPlugIn extends Sprite implements ICredentialsPlugIn, IDestroyablePlugIn
{
    private var _controller:IPlayerController;

    private var _username:String;
    private var _password:String;

    private var _promptImmediately:Boolean = false;

    private var _loginInstructions:String = "Please type a username and password to continue";
    private var _errorInstructions:String = "Invalid username or password, please try again";

    private var _errorColor:uint = 0xFF0000;
    private var _instructionsColor:uint = 0x010101;

	private var _contexts:Array;
	private var _context:String;
	private var _clip:Clip;

	private var _prompting:Boolean = false;

    private var _priority:int;

    public function SampleCredentialsPlugIn()
    {
        super();
    }

    public function initialize(lo:LoadObject):void
    {
        _controller = lo.controller as IPlayerController;

        _priority = lo.priority;

		if (lo.vars["contexts"])
		{
			_contexts = lo.vars["contexts"].split(",");
		}

        if (lo.vars["promptImmediately"])
            _promptImmediately = lo.vars["promptImmediately"].toString().toLowerCase() == "true";

        if (lo.vars["loginInstructions"])
            _loginInstructions = lo.vars["loginInstructions"] as String;

        if (lo.vars["errorInstructions"])
            _errorInstructions = lo.vars["errorInstructions"] as String;

        _controller.registerCredentialsPlugIn(this, _priority);

        _controller.addEventListener(PlayerEvent.OnLoginSubmitted, onLoginSubmitted);
		_controller.addEventListener(PlayerEvent.OnLoginCancelled, onLoginCancelled);

        // Set up the scope using the scope name and the global flag.
        var scopes:ScopeInfo = new ScopeInfo("default");
        scopes.isGlobal = true;

        // Add the listener with the method reference and the scope data
        _controller.addEventListener("OnResetLoginJs", OnCustomJsEventHandler, scopes);

        // We do this to make tabbing between text boxes work.
        var makeTabWork:UIComponent = new UIComponent();
        makeTabWork.visible=false;
        addChild(makeTabWork);        

        // Set we start right away, before anyone asks?
        if (_promptImmediately)
        {
            // This works for ff and Chrome
			_controller.addEventListener(PdkEvent.OnControlsRefreshed,prompt);
            // This works for IE and Safari
            _controller.addEventListener(PdkEvent.OnPlayerLoaded,prompt);
        }
    }

    private function setCredentials():void
    {
        // Once we've got the user login info, we send that back along the usual event chain. 
        _controller.trace("Sending credentials back for " + _context, "CredentialsPlugIn", Debug.DEBUG);
        _controller.setCredentials(_username, _password, _context);
    }

    private function onLoginSubmitted(e:PlayerEvent):void
    {
        _prompting = false;
        _username = e.data["username"];
        _password = e.data["password"];

        _controller.trace("User submitted login form, We have the credentials", "CredentialsPlugIn", Debug.DEBUG);

        // Tell the form to hide itself. 
        _controller.dispatchEvent(new PlayerEvent(PlayerEvent.OnCloseLogin));
        setCredentials();
    }

    private function onLoginCancelled(e:PlayerEvent):void
    {
        _prompting = false;
        _controller.trace("User cancelled login form. Send failed credentials.", "CredentialsPlugIn", Debug.DEBUG);

		setFailedCredentials("Login Cancelled");

        // Tell the form to hide itself.
        _controller.dispatchEvent(new PlayerEvent(PlayerEvent.OnCloseLogin));

		_prompting = false;
    }

    public function getCredentials(clip:Clip=null, context:String=null):Boolean
    {
        _controller.trace("getCredentials context= " + context , "CredentialsPlugIn", Debug.DEBUG);

        // If the form is already visible, just return false.
        if (_prompting) return false;
		// If we've been configured with context values and this request
		// doesn't match then decline to process.
		if (context != null && _contexts && _contexts.indexOf(context) == -1) return false;

		// Also, if there is no context specified and we are configured with
		// one or more, then decline to process.
		if (context == null && _contexts != null && _contexts.length > 0) return false;

		_context = context;

		_clip = clip;
		_context = context;

        // Look for a failed context to show the error message on the login retry.
		prompt(null, (context.indexOf("failed") > -1));

		return true;
    }

	protected function prompt(e:PdkEvent=null, doRetry:Boolean=false):void
	{
        // See if we're showing the card at load.
        if (e && e.type == PdkEvent.OnControlsRefreshed)
            _controller.removeEventListener(PdkEvent.OnControlsRefreshed, prompt);
        else if (e && e.type == PdkEvent.OnPlayerLoaded)
            _controller.removeEventListener(PdkEvent.OnPlayerLoaded, prompt);

		// If the card is already up, no need to show it again.
		if (_prompting)
            return;

        var initVars:Object;

        // Pass initialization vars to the login card. 
        if (doRetry)
            initVars = {username:_username,password:"",instructions:_errorInstructions,errorInstructions:_errorInstructions,instructionsColor:_errorColor,errorColor:_errorColor, context:_context};
        else
            initVars = {username:_username,password:"",instructions:_loginInstructions,errorInstructions:_errorInstructions,instructionsColor:_instructionsColor, errorColor:_errorColor, context:_context};

         _controller.trace("Requesting credentials from tpLoginCard", "CredentialsPlugIn", Debug.DEBUG);

        // Load up the Login card and hide any others that might be visible.
         _controller.showCard("forms", "tpLoginCard", CardActions.HIDE, null, null, initVars);
		 _prompting = true;
	}

    private function setFailedCredentials(errorMessage:String):void
    {
        _controller.setCredentials(_username, null, _context, errorMessage);
    }

    public function destroy():void
    {
        _controller.removeEventListener(PlayerEvent.OnLoginSubmitted,onLoginSubmitted);
        _controller.removeEventListener(PlayerEvent.OnLoginCancelled,onLoginCancelled);
    }

    private function OnCustomJsEventHandler(evt:PdkEvent):void
    {
        // Do whatever you need to do with the payload
        var payload:Object = evt.data;

        var context:String = payload["context"];

        _controller.getCredentials(null, context);
    }    
  }
}
