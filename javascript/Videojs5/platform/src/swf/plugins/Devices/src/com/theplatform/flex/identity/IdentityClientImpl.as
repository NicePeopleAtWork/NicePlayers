package com.theplatform.flex.identity
{
    import com.adobe.serialization.json.JSON;
    import com.theplatform.flex.ServiceUrl;
    import com.theplatform.flex.collections.ObjectMap;
    import com.theplatform.flex.configuration.ServiceConfiguration;
    import com.theplatform.flex.logger.PlatformLogger;
    import com.theplatform.flex.service.IInvoker;
    import com.theplatform.flex.service.JsonUriService;
    import com.theplatform.flex.service.response.GenericResponseHandler;

    import flash.net.URLRequestHeader;

    import mx.logging.ILogger;
    import mx.utils.Base64Encoder;

    /**
     * This class is used to interact with the Identity Service to get tokens which are needed
     * to make data and service calls
     **/
    public class IdentityClientImpl extends JsonUriService implements IIdentityClient, IInvoker
    {
        private static const AUTHORIZATION_HEADER:String = "Authorization";
        private static const AUTHORIZATION_HEADER_BASIC:String = "Basic ";
        private static const SCHEMA_PARAM:String = "schema";
        private static const FORM_PARAM:String = "form";
        private static const IDLETIMEOUT_PARAM:String = "_idleTimeout";
        private static const DURATION_PARAM:String = "_duration";
        private static const ACCOUNT_PARAM:String = "account";
        private static const USERNAME_PARAM:String = "username";
        private static const PASSWORD_PARAM:String = "password";
        private static const JSON_VALUE:String = "json";
        private static const ID:String = "id";
        private static const SIGN_IN_METHOD:String = "signIn";

        private var _context:IIdentityContext;

        private var _duration:int;
        private var _idleTimeout:int;
        private var _username:String;
        private var _oldUsername:String;
        private var _password:String;
        private var _oldPassword:String;
        private var _account:*;
        private var _schema:String = "1.0";
        private var _token:String;

        private var _log:ILogger = PlatformLogger.getLogger(IdentityClientImpl);

        /**
         * @inheritDoc
         */
        public function getContext(callback:Function, fail:Function = null, useAuthHeader:Boolean = false) : void
        {
            if (_context != null && _oldPassword == _password && _oldUsername == _username)
            {
                callback(_context);
            }
            else
            {
                var paramMap:ObjectMap = new ObjectMap();

                paramMap.add(SCHEMA_PARAM, _schema);

                var accountID:String = (_account == undefined || _account == null)
                        ? "" : _account[ID];

                if (accountID != null && accountID.length > 0)
                    paramMap.add(ACCOUNT_PARAM, accountID);

                // make the request, have to POST a blank string to work around FLEX bug that only sends headers
                //   on a POST.
                var localHandler:GenericResponseHandler
                        = new GenericResponseHandler(handleComplete, handleFailedToken, this);

                if (useAuthHeader)
                {
                    makeRequest(paramMap, localHandler, null, false
                            , null, createPostBody(), true, [createAuthorizationHeader()]);
                } else if (_token != null)
                {
                    //if token is set, shortcircut the auth call
                    _context = new IdentityContextImpl();
                    _context.serverUrl = ServiceUrl.combine(baseServiceUrl, urlPath);
                    _context.account = _account;
                    _context.token = _token;
                    callback(_context);
                }
                else
                {
                    // add the username/password onto the url
                    createGetParameters(paramMap);
                    makeRequest(paramMap, localHandler, SIGN_IN_METHOD, false);
                }

                function handleComplete(loaderData:*) : void
                {
                    _log.debug("...received data: {0}", loaderData);

                    if (!loaderData || loaderData == "" || loaderData.isException)
                    {
                        if (fail != null) fail(loaderData.message);
                    }
                    else
                    {
                        _context = new IdentityContextImpl();
                        _context.serverUrl = ServiceUrl.combine(baseServiceUrl, urlPath);
                        _context.account = _account;
                        _context.token = loaderData["token"];
                        _oldUsername = _username;
                        _oldPassword = _password;
                        callback(_context);
                    }
                }

                function handleFailedToken(dataServiceException:*):void
                {
                    _log.error("... error loading token: {0} {1}", dataServiceException.title, dataServiceException.description);
                    if (fail != null)
                        fail(dataServiceException);
                }
            }
        }

        /**
         * Create a JSON object representing the POST payload to signIn
         * @return
         */
        private function createPostBody():String
        {
            var postBody:Object = {};
            postBody["signIn"] = {};

            if (_duration > 0)
                postBody["signIn"][DURATION_PARAM] = _duration;

            if (_idleTimeout > 0)
                postBody["signIn"][IDLETIMEOUT_PARAM] = _idleTimeout;

            return com.adobe.serialization.json.JSON.encode(postBody);
        }

        private function createGetParameters(paramMap:ObjectMap):void
        {
            if (_duration > 0)
                paramMap.add(DURATION_PARAM, _duration);

            if (_idleTimeout > 0)
                paramMap.add(IDLETIMEOUT_PARAM, _idleTimeout);
            paramMap.add(USERNAME_PARAM, _username);
            paramMap.add(PASSWORD_PARAM, _password);
            paramMap.add(FORM_PARAM, JSON_VALUE);
        }

        private function createAuthorizationHeader():URLRequestHeader
        {
            var data:String = _username + ":" + _password;
            var encoder:Base64Encoder = new Base64Encoder();
            encoder.encode(data);

            return new URLRequestHeader(AUTHORIZATION_HEADER, AUTHORIZATION_HEADER_BASIC + encoder.toString());
        }


        /**
         * @inheritDoc
         */
        public function signOut(callback:Function = null):void
        {
            if (_context == null)
            {
                if (null != callback) callback();
            }
            else
            {
                var paramMap:ObjectMap = new ObjectMap();
                paramMap.add("_token", _context.token);
                paramMap.add(SCHEMA_PARAM, _schema);

                _log.debug("about to sign out token: {0}", _context.token);

                var localHandler:GenericResponseHandler
                        = new GenericResponseHandler(handleComplete, handleComplete, this);

                // ignore any errors
                try
                {
                    makeRequest(paramMap, localHandler, "signOut");
                }
                catch (e:Error)
                {
                    handleComplete(1);
                }

                function handleComplete(loader:*):void
                {
                    //Empty response on signOut for some reason...
                    //TODO: see if an exception can be genereated and catch it here.
                    _context.token = null;
                    if (null != callback) callback();
                }
            }
        }

        //        private function createServiceUrl(paramMap:ObjectMap, serviceMethod:String):ServiceUrl
        //        {
        //            //TODO: write a UrlUtility to join URLs
        //            var url:String = ServiceUrl.combine(_baseServiceUrl, _servicePath);
        //
        //            return new ServiceUrl(
        //                    url,
        //                    _baseProxyUrl,
        //                    serviceMethod, // "idm/JSON/Authentication/1.1/signIn",
        //                    null,
        //                    paramMap
        //                    );
        //        }

        /**
         * @inheritDoc
         */
        public function setUser(user:*):void
        {
            if (_context == null)
                _context = new IdentityContextImpl();

            _context.currentUser = user;
        }

        /**
         * @inheritDoc
         */
        public function set account(account:*):void
        {
            _account = account;

            if (_context != null)
                _context.account = _account;
        }

        /**
         * @inheritDoc
         */
        public function get account():*
        {
            return (_context != null) ? _context.account : _account;
        }

        /**
         * @inheritDoc
         */
        public function get username():String
        {
            return _username;
        }

        /**
         * @inheritDoc
         */
        public function set username(username:String):void
        {
            _username = username;
        }

        /**
         * @inheritDoc
         */
        public function set password(password:String):void
        {
            _password = password;
        }


        public function set token(value:String):void {
            _token = value;
        }

        /**
         * @inheritDoc
         */
        public override function set serviceConfiguration(config:ServiceConfiguration):void
        {
            super.serviceConfiguration = config;

            if (config)
            {
                _schema = config.version;

                _idleTimeout = config.findIntParameter("idleTimeout");
                _duration = config.findIntParameter("duration");
            }
        }
    }
}
