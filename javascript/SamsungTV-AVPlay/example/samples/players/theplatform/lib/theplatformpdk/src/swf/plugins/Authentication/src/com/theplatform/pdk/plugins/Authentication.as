package com.theplatform.pdk.plugins
{
	import com.theplatform.pdk.controllers.GlobalController;
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.utils.Debug;
	import com.theplatform.pdk.events.PdkEvent;
import com.theplatform.pdk.utils.PdkStringUtils;

import flash.display.Sprite;
	import flash.external.ExternalInterface;

	public class Authentication extends Sprite implements IMetadataUrlPlugIn
	{
		public static const CONTROL_ID:String = "userAuth"				
		private static const DEFAULT_COOKIE_NAME:String = "tpUserToken";
		// good auth cookies are of the form:
		//     1|200|ZrdAGjNDJNtV9blNopflMXCC8DDwgIBz|
		// a.k.a.
		//     version number | status code | token | message
		// bad auth cookies look like this:
		//     "1|401||com.theplatform.authentication.idstore.exception.IdStoreException: Could not authenticate user F328D133-36FE-049E-42F6-436ED932EAC0."
		// note the quotes at the beginning and end
		private static const COOKIE_REGEXP:RegExp = /^"?(?:([0-9]+)\|)(?:([0-9]{3})\|)(?:(.*)\|)(?:(.*))"?$/;
		
		private static const COOKIE_LOAD_VAR_ID:String = "cookie";
		private static const TOKEN_LOAD_VAR_ID:String = "token";
		
		private var _controller:IPlayerController
		private var _cookieName:String = DEFAULT_COOKIE_NAME
        private var _authString:String = "auth";
		private var _async:Boolean = true;
		private var _ignoreCookie:Boolean = false;
			
		private var _token:String;
		private var _releaseUrl:String;
		
		public static const AUTHENTICATION_CONTEXT:String = "tpAuthenticationContext";
		
	
		public function Authentication()
		{
			super()
		}
		
		public function initialize(lo:LoadObject):void 
		{
			_controller = lo.controller as IPlayerController
			_controller.trace(" *** Authentication initialized ***","Authentication")
			
			var loadVars:Object = lo.vars
			// check for the cookie string in the loadvars
			if (loadVars.hasOwnProperty(COOKIE_LOAD_VAR_ID) && String(loadVars[COOKIE_LOAD_VAR_ID]).length > 0 ) 
			{
				_controller.trace("cookie loadVar value of \""+loadVars[COOKIE_LOAD_VAR_ID]+"\" overriding default", "Authentication");
				_cookieName = loadVars[COOKIE_LOAD_VAR_ID]
			}
			// check for the token string in the loadvars
			if (loadVars.hasOwnProperty(TOKEN_LOAD_VAR_ID) && String(loadVars[TOKEN_LOAD_VAR_ID]).length > 0 ) 
			{
				_controller.trace("token loadVar value of \""+loadVars[TOKEN_LOAD_VAR_ID]+"\" overriding default", "Authentication");
				_token = loadVars[TOKEN_LOAD_VAR_ID] ;
				_ignoreCookie = true;
			}
            if (loadVars["authString"])
            {
                _authString = loadVars["authString"];
                _controller.trace("authString loadVar value: " + _authString, "Authentication");
            }
            if (loadVars["async"])
            {
                _async = String(loadVars["async"]).toLowerCase() == "true";
                _controller.trace("async loadVar value: " + _async, "Authentication");
            }


			// if no token string then try to get from html page cookie		
			if(!_token) 
			{
				_controller.trace("No user token set: getting from cookie with \""+_cookieName+"\"", "Authentication");
				getUserTokenFromCookie()
			}
            //if there's still no token, put an event listener for OnSetToken
            if (!_token)
            {
                _controller.addEventListener(PdkEvent.OnSetToken, handleSetToken);
            }

	        (_controller as GlobalController).registerMetadataUrlPlugIn(this, lo.priority)
		}
 
        private function handleSetToken(e:PdkEvent):void
        {
	        if (e.data && e.data.token)
	 		{
				if (e.data.type.toLowerCase().indexOf("urn:theplatform:") == 0)
				{
					// if we have a tp namespaced token, then make sure it's an auth token, not a CDN token or some other kind
					if (e.data.type.toLowerCase().indexOf("urn:theplatform:auth:") == 0)
					{
						_token = e.data.token;
					}
				}
				else
				{
					// if it's not namespaced to theplatform, then assume it's an auth token, since that was the original token type we supported.
					_token = e.data.token;
				}
			}
        }
		
	    public function rewriteMetadataUrl(url:String, isPreview:Boolean):Boolean
		{
			// we don't need to do auth on warming
            //or if the auth has already been set
			if (isPreview ||
                    !url ||
                    url.indexOf("&" + _authString + "=") >= 0 ||
                    url.indexOf("?" + _authString + "=") >= 0)
            {
                return false;
            }
			
			_releaseUrl = url;
			
			if (!_ignoreCookie)
			{
				// check in case there was an AJAX-style cookie created since we last checked
				getUserTokenFromCookie()
			}

			if(_token && _token.length > 0)
			{
				doRewriteMetadataUrl();
			}
			else if (_async)
			{
	            _controller.addEventListener(PdkEvent.OnCredentialsAcquired, credentialsAcquired);
	            _controller.addEventListener(PdkEvent.OnCredentialAcquisitionFailed, credentialAcquisitionFailed);
				_controller.trace("no user token available, calling getCredentials", "Authentication", Debug.INFO);
				_controller.getCredentials(null, AUTHENTICATION_CONTEXT);
			}
			else {
				// there was no token, and async is turned off, so just give up
				return false;
			}
			return true;
		}

	    private function credentialsAcquired(e:PdkEvent):void
	    {
	        // ignore events from other stacks
	        if (e.data["context"] != AUTHENTICATION_CONTEXT) return;

	        _controller.trace("credentialsAcquired: " + e.data['context'], "Authentication", Debug.INFO);

	        _controller.removeEventListener(PdkEvent.OnCredentialsAcquired, credentialsAcquired);
	        _controller.removeEventListener(PdkEvent.OnCredentialAcquisitionFailed, credentialAcquisitionFailed);

	        _token = e.data["password"];
	        _controller.trace("credentialsAcquired: " + _token, "Authentication", Debug.INFO);

			doRewriteMetadataUrl();
	    }

	    private function credentialAcquisitionFailed(e:PdkEvent):void
	    {
	        // ignore events from other stacks
	        if (e.data["context"] != AUTHENTICATION_CONTEXT)
	            return;

	        _controller.removeEventListener(PdkEvent.OnCredentialsAcquired, credentialsAcquired);
	        _controller.removeEventListener(PdkEvent.OnCredentialAcquisitionFailed, credentialAcquisitionFailed);

			_controller.trace("still no user token available...", "Authentication", Debug.ERROR);

			// note this won't work but it will resume the PDK for other things.
            //this breaks the login card
			doRewriteMetadataUrl();
	    }

		protected function doRewriteMetadataUrl():void
		{
			if (_token && _token.length > 0)
			{
				_controller.trace("adding \"auth\" of \"" + _token + "\"", "Authentication", Debug.INFO);
				
				_releaseUrl = _releaseUrl + (_releaseUrl.indexOf("?") >= 0 ? "&" : "?") + _authString + "="+_token;
			}
	        (_controller as GlobalController).setMetadataUrl(_releaseUrl);
		}
		
		public function getUserTokenFromCookie():void
		{			
			// get the cookie from the document
            if (PdkStringUtils.isExternalInterfaceAvailable())
            {
                var cookie:String = ExternalInterface.call("eval", "document.cookie");
                // split into parts, cookies should be separated by semicolons
                var cookies:Array = cookie.split(";");
                _controller.trace("raw cookies: " + cookies, "Authentication");
                // split pairs and look for the _cookieName that we are using once found set the token
                for each (var c:String in cookies)
                {
                    var pair:Array = c.split("=");
                    if( pair.length > 1 && pair[0].replace(/^\s+|\s+$/g,'') == _cookieName)
                    {
                        var result:Array = COOKIE_REGEXP.exec(pair[1]);

                        // the first element is always the entire expression, so the token
                        // is in a +1 position
                        if (result != null && result.length > 3)
                        {
                            _token = result[3];
                            if (_token && _token.length > 0)
                            {
                                _controller.trace("_token set : "+_token, "Authentication");
                                return;
                            }
                        }
                    }
                }
            }

			_controller.trace("no valid userToken cookie; userToken not provided at initialization", "Authentication", Debug.WARN);
		}
	}
}
