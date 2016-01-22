package com.theplatform.pdk.plugins
{
	import com.theplatform.pdk.controllers.GlobalController;
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.utils.Debug;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.plugins.IUrlPlugin;
	import com.theplatform.pdk.utils.PdkStringUtils;

	import flash.display.Sprite;
	import flash.external.ExternalInterface;
	import flash.utils.setTimeout;

	public class Authorization extends Sprite implements IUrlPlugin
	{
		public static const CONTROL_ID:String = "userAuth"				
		
		private static const TOKEN_LOAD_VAR_ID:String = "token";
		
		private var _controller:IPlayerController
        private var _authString:String = "auth";
		private var _async:Boolean = true;
			
		private var _token:String;
		private var _clip:Clip;
		
		public static const AUTHORIZATION_CONTEXT:String = "tpAuthorizationContext";
		public static const CDN_TOKEN_NAMESPACE:String = "urn:theplatform:auth:cdn:";
		
	
		public function Authorization()
		{
			super()
		}
		
		public function initialize(lo:LoadObject):void 
		{
			_controller = lo.controller as IPlayerController
			_controller.trace(" *** Authorization initialized ***","Authorization")
			
			var loadVars:Object = lo.vars
			// check for the token string in the loadvars
			if (loadVars.hasOwnProperty(TOKEN_LOAD_VAR_ID) && String(loadVars[TOKEN_LOAD_VAR_ID]).length > 0 ) 
			{
				_controller.trace("token loadVar value of \""+loadVars[TOKEN_LOAD_VAR_ID]+"\" overriding default", "Authorization");
				_token = loadVars[TOKEN_LOAD_VAR_ID] ;
			}
            if (loadVars["authString"])
            {
                _authString = loadVars["authString"];
                _controller.trace("authString loadVar value: " + _authString, "Authorization");
            }
            if (loadVars["async"])
            {
                _async = String(loadVars["async"]).toLowerCase() == "true";
                _controller.trace("async loadVar value: " + _async, "Authorization");
            }

            // put an event listener for OnSetToken
            _controller.addEventListener(PdkEvent.OnSetToken, handleSetToken);


			(_controller as IPlayerController).registerUrlPlugIn(this, "authorization", lo.priority)
		}

        private function handleSetToken(e:PdkEvent):void
        {
            if (e.data &&
                e.data.token &&
                (e.data.type as String).toLowerCase().indexOf(CDN_TOKEN_NAMESPACE) == 0)
            {
                _token = e.data.token;
            }
        }
		
	    public function rewriteURL(clip:Clip):Boolean
		{
			_clip = clip;
			var url:String = clip.baseClip.URL;
			
			// we don't need to do auth on warming
            //or if the auth has already been set
			if (!url)
			{
                return false;
            }
						
			if(_token && _token.length > 0)
			{
				doRewriteUrl();
			}
			else if (_async)
			{
	            _controller.addEventListener(PdkEvent.OnCredentialsAcquired, credentialsAcquired);
	            _controller.addEventListener(PdkEvent.OnCredentialAcquisitionFailed, credentialAcquisitionFailed);
				_controller.trace("no user token available, calling getCredentials", "Authorization", Debug.INFO);
				_controller.getCredentials(null, AUTHORIZATION_CONTEXT);
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
	        if (e.data["context"] != AUTHORIZATION_CONTEXT) return;

	        _controller.trace("credentialsAcquired: " + e.data['context'], "Authorization", Debug.INFO);

	        _controller.removeEventListener(PdkEvent.OnCredentialsAcquired, credentialsAcquired);
	        _controller.removeEventListener(PdkEvent.OnCredentialAcquisitionFailed, credentialAcquisitionFailed);

	        _token = e.data["password"];
	        _controller.trace("credentialsAcquired: " + _token, "Authorization", Debug.INFO);

			doRewriteUrl();
	    }

	    private function credentialAcquisitionFailed(e:PdkEvent):void
	    {
	        // ignore events from other stacks
	        if (e.data["context"] != AUTHORIZATION_CONTEXT)
	            return;

	        _controller.removeEventListener(PdkEvent.OnCredentialsAcquired, credentialsAcquired);
	        _controller.removeEventListener(PdkEvent.OnCredentialAcquisitionFailed, credentialAcquisitionFailed);

			_controller.trace("still no user token available...", "Authorization", Debug.ERROR);

			// note this won't work but it will resume the PDK for other things.
            //this breaks the login card
			doRewriteUrl();
	    }

		protected function doRewriteUrl():void
		{
			_clip.baseClip.URL = updateUrl(_clip.baseClip.URL);

			if (_clip.baseClip.possibleFiles)
			{
				for (var i:Number=0; i<_clip.baseClip.possibleFiles.length; i++)
				{
					_clip.baseClip.possibleFiles[i].URL = updateUrl(_clip.baseClip.possibleFiles[i].URL);
				}
			}

	        (_controller as IPlayerController).setClip(_clip);
		}

		protected function updateUrl(url:String):String
		{
			var regex:RegExp = new RegExp("([\\?\\&])" + _authString + "\\=[^\\&]*", "");

			if (url.match(regex))
			{
				_controller.trace("replacing existing \"" + _authString + "\" parameter with \"" + _token + "\"", "Authorization", Debug.INFO);
				url = url.replace(regex, "$1" + _authString + "=" + _token);
			}
			else
			{					
				_controller.trace("adding \"auth\" of \"" + _token + "\"", "Authorization", Debug.INFO);					
				url += (_clip.baseClip.URL.indexOf("?") >= 0 ? "&" : "?") + _authString + "="+_token;
			}

			return url;
		}
	}
}
