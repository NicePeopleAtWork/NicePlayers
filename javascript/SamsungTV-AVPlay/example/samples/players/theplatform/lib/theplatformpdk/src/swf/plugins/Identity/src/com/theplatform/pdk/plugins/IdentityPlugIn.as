package com.theplatform.pdk.plugins
{
import com.serialization.json.JSON;
import com.theplatform.pdk.controllers.IPlayerController;
import com.theplatform.pdk.data.CardActions;
import com.theplatform.pdk.data.CardPriority;
import com.theplatform.pdk.data.Clip;
import com.theplatform.pdk.data.LoadObject;
import com.theplatform.pdk.events.PdkEvent;
import com.theplatform.pdk.events.PlayerEvent;
import com.theplatform.pdk.utils.Debug;
import com.theplatform.pdk.utils.PdkStringUtils;

import fl.controls.TileList;
import fl.core.UIComponent;

import flash.display.Sprite;
import flash.errors.IllegalOperationError;
import flash.events.Event;
import flash.events.IOErrorEvent;
import flash.events.SecurityErrorEvent;
import flash.external.ExternalInterface;
import flash.net.URLLoader;
import flash.net.URLRequest;

public class IdentityPlugIn extends Sprite implements ICredentialsPlugIn, IDestroyablePlugIn
{

  


    private static const RELEASE:String = "release";
    private static const SESSION:String = "session";

    private static const COOKIENAME:String = "tpIdentityTokens";
    private static const COOKIETIMEOUT:String = "tpIdentityTimeOut";

    private var _controller:IPlayerController
    //private var _hosts:Array;//may not be needed

    private var _username:String;
    private var _password:String;
    private var _token:String;
    private var _accountId:String;
    private var _directory:String;//TODO: is this necessary?
    private var _identityServiceUrl:String = "https://euid.theplatform.com";//default
    private var _authSigninPath:String = "/idm/web/Authentication/signIn";
    private var _promptImmediately:Boolean = false;
    private var _loginFormEnabled:Boolean = true;

    private var _tokenScope:String = RELEASE;
    private var _loginInstructions:String = "Please enter your username and password to continue";
    private var _errorInstructions:String = "Invalid username or password, please try again";
    private var _errorColor:uint = 0xFF0000;
    private var _instructionsColor:uint = 0xFFFFFF;
    
	private var _contexts:Array;
	private var _context:String;
	private var _clip:Clip;


    private var _loginHasFailed:Boolean=false;


    private var _cookie:String

    private var _isGettingToken:Boolean = false;
	private var _waitingForCredentials:Boolean = false;
	private var _prompting:Boolean = false;

    private var _loader:URLLoader;

    private var _priority:uint = 1;


    public function IdentityPlugIn()
    {
        super();
    }

    public function initialize(lo:LoadObject):void
    {




        _controller = lo.controller as IPlayerController;

        _username = lo.vars["username"] as String;
        _password = lo.vars["password"] as String;
        _directory = lo.vars["directory"] as String;
        _accountId = lo.vars["accountId"] as String;

		if (lo.vars["contexts"])
		{
			_contexts = lo.vars["contexts"].split(",");
		}
        if (lo.vars["promptImmediately"])
            _promptImmediately = lo.vars["promptImmediately"].toString().toLowerCase() =="true";
        if (lo.vars["loginFormEnabled"])
            _loginFormEnabled = lo.vars["loginFormEnabled"].toString().toLowerCase() =="true";

        _directory = lo.vars["directory"] as String;
        if (lo.vars["identityServiceUrl"])
            _identityServiceUrl = lo.vars["identityServiceUrl"] as String;
        if (lo.vars["tokenScope"])
            _tokenScope = lo.vars["tokenScope"] as String;
        if (lo.vars["loginInstructions"])
            _loginInstructions = lo.vars["loginInstructions"] as String;
        if (lo.vars["errorInstructions"])
            _errorInstructions = lo.vars["errorInstructions"] as String;

        _token = lo.vars["token"] as String;


        _controller.registerCredentialsPlugIn(this, _priority);

        _controller.addEventListener(PlayerEvent.OnLoginSubmitted, onLoginSubmitted);
		_controller.addEventListener(PlayerEvent.OnLoginCancelled, onLoginCancelled);

        _controller.addEventListener(PdkEvent.OnProtectedMediaAuthenticationFailed,mediaAuthFailed);

        _controller.addEventListener(PdkEvent.OnCredentialsAcquired,onCredentialsAcquired);
        _controller.addEventListener(PdkEvent.OnCredentialAcquisitionFailed,prompt);
        _controller.addEventListener(PdkEvent.OnPlayerLoaded, handlePlayerLoaded);
                                                                            


//        _controller.addCard("forms", "tpLoginCard", singleShareCard, CardPriority.CUSTOM);

        if (_loginFormEnabled)
        {

            //dont care about tabbing otherwise

            //this is hacktacular, the native Flash tabbing doesn't work unless we bring in a flex component
            var makeTabWork:UIComponent = new UIComponent();
            makeTabWork.visible=false;
            addChild(makeTabWork);

        }


         //we start right away             
        if (shouldPrompt)
        {
//            //this works for ff and chrome
			_controller.addEventListener(PdkEvent.OnControlsRefreshed,prompt);
////            //this works for IE and safari...
            _controller.addEventListener(PdkEvent.OnPlayerLoaded,prompt);
           // prompt();           
        }
        

    }


    private function get shouldPrompt():Boolean
    {
        return (_promptImmediately==true&&
                !(_username&&_password&&_username.length&&_password.length)&&!_token);
    }

    private function handlePlayerLoaded(e:PdkEvent):void
    {
        _controller.removeEventListener(PdkEvent.OnPlayerLoaded, handlePlayerLoaded);
        sendToken();
    }

    private function sendToken():void
    {
        if (_token)
        {
            //there's already a token, call setToken
            _controller.setToken(_token, "urn:theplatform:auth:token");
        }
    }


    public function destroy():void
    {

        _controller.removeEventListener(PlayerEvent.OnLoginSubmitted, onLoginSubmitted);
        _controller.removeEventListener(PlayerEvent.OnLoginCancelled, onLoginCancelled);
        _controller.removeEventListener(PdkEvent.OnProtectedMediaAuthenticationFailed, mediaAuthFailed);

        _controller.removeEventListener(PdkEvent.OnCredentialsAcquired,onCredentialsAcquired);
        _controller.removeEventListener(PdkEvent.OnCredentialAcquisitionFailed,prompt);

    }

    private function mediaAuthFailed(e:PdkEvent):void
    {
        //we don't care??
    }

    private function setCredentials():void
    {

        //we have credentials already, notify the pdk
        var to:String = getCookie(COOKIETIMEOUT);
        var now:Date = new Date();
        now.setTime(now.time+Number(to));

        storeCookie(_username,_token,now.toUTCString(),_directory);
		
        _controller.trace("Sending Credentials back for " + _context, "IdentityPlugIn", Debug.INFO);
        _controller.setCredentials(_accountId, _token, _context);
    }

    private function onLoginSubmitted(e:PlayerEvent):void
    {

        _username = e.data["username"];
        _password = e.data["password"];

        //should we call getCredentials?
		// yes, but only if getCredentials had been called
		// otherwise, just hang onto the un/pw for later use

        _controller.trace("user submitted login form, lets move on now...","IdentityPlugIn");

        //either way, if we showed a prompt we need to get credentials
        //if (_waitingForCredentials)

        getCredentials(_clip, _context);



    }

    private function onCredentialsAcquired(e:PdkEvent):void
    {
        _prompting = false;

        _controller.dispatchEvent(new PlayerEvent(PlayerEvent.OnCloseLogin));
    }

    private function onLoginCancelled(e:PlayerEvent):void
    {
        //should we call setCredentials?
		// yes, but only if getCredentials had been called
		// otherwise, just hang onto the un/pw for later use

        _controller.trace("user cancelled login form, lets move on now...","IdentityPlugIn");

        _controller.dispatchEvent(new PlayerEvent(PlayerEvent.OnCloseLogin));

        //i don't think _waitingForCredentials is relevant anymore
		//if (_waitingForCredentials)
			setFailedCredentials("Login Cancelled")

		_prompting = false;

    }

    public function getCredentials(clip:Clip=null, context:String=null):Boolean
    {                                                            
        _controller.trace("getCredentials(" + context + ")","IdentityPlugIn");
		// if we have contexts and this call doesn't match then ignore
		// if we don't have a contexts array or the calling context is null, we go ahead and process
		if (context != null && _contexts && _contexts.indexOf(context) == -1) return false;
		
		// if there's no context for the call and we are configured to care about context, then pass
		if (context == null && _contexts != null && _contexts.length > 0) return false;

		_context = context;

        if (_token &&_token.length&& _accountId )
        {
	        _controller.trace("already had them, sending back","IdentityPlugIn");

            setCredentials();
            //_controller.dispatchEvent(new PdkEvent(PdkEvent.OnCredentialsAcquired, {username:_accountId,token:_token}));
        }
        else if (_accountId && _identityServiceUrl && _authSigninPath)
        {
            if (_directory&&_directory.length)
                _token = checkCookieForToken(_directory+"/"+_username);
            else
                _token = checkCookieForToken(_username);

            //we're supposed to update the cookie again now with a new idletimeout..
            if (_token&&_token.length)
            {
                sendToken();
                _controller.trace("Got a token for "+_username+" from a cookie","IdentityPlugIn");
                setCredentials();
            }
            else
            {       
				if (_username && _password)
				{
	                _controller.trace("Requesting token from service","IdentityPlugIn");
	                getToken();
				}
				else {
					_clip = clip;
					_context = context;
					_waitingForCredentials = true;

					prompt();
				}
            }
        }
        else
        {
             _controller.trace("getCredentials needs an accoundId.","IdentityPlugIn",Debug.ERROR);
			return false;
        }   

		return true;
                                                        
    }

	protected function prompt(e:PdkEvent=null,doRetry:Boolean=false):void
	{

        if (!_loginFormEnabled)
        {
            setFailedCredentials("Authentication failed");
        }

        var isRetry:Boolean=doRetry;

        if (e&&e.type ==PdkEvent.OnControlsRefreshed)
            _controller.removeEventListener(PdkEvent.OnControlsRefreshed,prompt);
        else if (e&&e.type ==PdkEvent.OnPlayerLoaded)
            _controller.removeEventListener(PdkEvent.OnPlayerLoaded,prompt);
        else if (e&&e.type ==PdkEvent.OnCredentialAcquisitionFailed)
        {
            _controller.removeEventListener(PdkEvent.OnCredentialAcquisitionFailed,prompt);
            isRetry=true;
        }



		// if the card is already up, no need to show it again...
		if (_prompting&&!isRetry)
            return;
        else if (_prompting&&isRetry)
        {
            _controller.dispatchEvent(new PlayerEvent(PlayerEvent.OnRetryLogin));
            return;
        }

        var initVars:Object;

        if (isRetry)
            initVars = {username:_username,password:"",instructions:_errorInstructions,errorInstructions:_errorInstructions,instructionsColor:_errorColor,errorColor:_errorColor, context:_context};
        else
            initVars = {username:_username,password:"",instructions:_loginInstructions,errorInstructions:_errorInstructions,instructionsColor:_instructionsColor, errorColor:_errorColor, context:_context};
//        if (_loginHasFailed)
//        {
//            initVars.instructionsColor = 0xFF0000;//red
//                                                                
//            initVars.instructions = _errorInstructions;
//
//
//        }
		
         _controller.trace("Requesting token from tpLoginCard","IdentityPlugIn");

        //somehow, tabbing works on the sharecard
        //_controller.showCard("forms", "tpShareCard", CardActions.DISABLE, null, null, initVars);

      _controller.showCard("forms", "tpLoginCard", CardActions.HIDE, null, null, initVars);
		_prompting = true;
	}

    //here we check the cookies to see if there's already a token
    private function checkCookieForToken(username:String=null):String
    {
        _cookie = getCookie(COOKIENAME);

        if (_cookie==null||_cookie.length<=0)
            return null;

        var pairs:Array = _cookie.split(PdkStringUtils.urlEncode(","));

        for each (var item:String in pairs)
        {
            var pair:Array = item.split(PdkStringUtils.urlEncode(":"));
            if (username == null || pair[0]==PdkStringUtils.urlEncode(username))
                return pair[1];
        }

        return null;                 

    }


    private function storeCookie(username:String,token:String,expiryDate:String = "", directory:String=null):void
    {


        var newcookie:String;


        var name:String;

        if (directory)
        {
            name=PdkStringUtils.urlEncode(directory+"/"+username);
        }
        else
            name = PdkStringUtils.urlEncode(username);


        newcookie =  name+PdkStringUtils.urlEncode(":"+token+",");


        if (_cookie==null)
            _cookie="";

        var nameColon:String = name+PdkStringUtils.urlEncode(":");

        var index:int = _cookie.indexOf(nameColon);

        if (index!=-1)
        {
            //we need to replace
            var pairs:Array = _cookie.split(PdkStringUtils.urlEncode(","));

            _cookie="";

            for each(var item:String in pairs)
            {
                if (item.indexOf(nameColon)==-1)
                    _cookie+=item+PdkStringUtils.urlEncode(",");
            }

        }
        //otherwise //we can just append


        _cookie += newcookie;

        setCookie(COOKIENAME,_cookie,expiryDate);

    }

    private function setCookie(name:String,value:String,date:String=""):void
    {
        var fn:String="function(){document.cookie = '"+name+"="+value+"; expires="+date+"; path=/ ';}";
        trace(fn);
        if (PdkStringUtils.isExternalInterfaceAvailable())
            ExternalInterface.call(fn);

    }

    private function getCookie(name:String):String
    {
        if (PdkStringUtils.isExternalInterfaceAvailable())
            var cookies:Array =  ExternalInterface.call("function(){ return document.cookie.split(';');}");
        else
            return null;

        if (cookies==null||cookies.length<=0)
            return null;

        var ourcookie:String;

        var nameEQ:String=name+"=";

        //look for the substring

        for(var i:int=0;i < cookies.length;i++) {
            var c:String = cookies[i];
            while (c.charAt(0)==' ')
                c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0)
                return c.substring(nameEQ.length,c.length);
	    }

        return null;

    }




    //we could wrap this in it's own class (at some point there may be more than one identity algorithm
    private function getToken():void
    {
        _isGettingToken = true;


        _loader = new URLLoader();

        _loader.addEventListener(Event.COMPLETE, handleTokenData, false, 0, true);
        _loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, handleTokenDataErrorHandler, false, 0, true);
        _loader.addEventListener(IOErrorEvent.IO_ERROR, handleTokenDataErrorHandler, false, 0, true);

        var request:URLRequest = new URLRequest(_identityServiceUrl + _authSigninPath);

        var context:String = "";
        if (_directory && _directory.length > 0)
        {
            context = _directory + "/";
        }

        request.data = "username=" + context + _username
                + "&password=" + _password + "&form=json&schema=1.0";

        try
        {
            _loader.load(request);
        }
        catch (e:Error){ throw new IllegalOperationError("The loader couldn't handle the urlRequest:" + e.toString()); }


    }



    private function handleTokenData(e:Event):void
    {
        _controller.trace("Got response from identity service...","IdentityPlugIn");

        _loader.removeEventListener(Event.COMPLETE, handleTokenData);
        _loader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, handleTokenDataErrorHandler);
        _loader.removeEventListener(IOErrorEvent.IO_ERROR, handleTokenDataErrorHandler);


        var success:Boolean = false;
		if (e.target && e.target.data)
        {
	        _controller.trace("Identity Service JSON:\n" + e.target.data, "IdentityPlugIn", Debug.DEBUG);
	
            var json:Object = com.serialization.json.JSON.deserialize(e.target.data);

	        _controller.trace("Identity Service Response: " + json.signInResponse, "IdentityPlugIn", Debug.INFO);

            if (json && json.signInResponse && json.signInResponse.token)
            {
                _token = json.signInResponse.token;
		        _controller.trace("Identity Service token: " + _token, "IdentityPlugIn", Debug.DEBUG);

                _loader.removeEventListener(Event.COMPLETE, handleTokenData);
                _loader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, handleTokenDataErrorHandler);
                _loader.removeEventListener(IOErrorEvent.IO_ERROR, handleTokenDataErrorHandler);
                _loader = null;

                success = true;
                //we need to store the dir/username and token
                var expiry:Number = json.signInResponse.idleTimeout;
                if (!isNaN(expiry))
                {
                    setCookie(COOKIETIMEOUT,expiry.toString());
                }
                sendToken();

                setCredentials();
            }
        }
        if (!success)
        {
	        _controller.trace("Identity Service call did not succeed, reprompting...", "IdentityPlugIn", Debug.INFO);
            //fail
            prompt(null,true);
            //_controller.dispatchEvent(new PlayerEvent(PlayerEvent.OnRetryLogin));
            //setFailedCredentials("Authentication failed");
            //according to pdk-4033, we prompt
            //prompt();
        }


        _isGettingToken = false;

    }

    private function setFailedCredentials(errorMessage:String):void
    {
       // _loginHasFailed=true;

        _token=null;
        _password=null;



        //acording to Jeremy, we shouldn't do this and should re-prompt with the error instead
        _controller.setCredentials(_accountId, null, _context, errorMessage);

       //prompt(null,true);




    }


    private function handleTokenDataErrorHandler(e:Event):void
    {
        throw new IllegalOperationError("The server returned an error:" + e.toString());
    }


}
}
