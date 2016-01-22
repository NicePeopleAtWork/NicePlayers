// Set the namespace for the new plug-in
$pdk.ns("$pdk.plugin.Identity");

$pdk.plugin.Identity = $pdk.extend(function(){},
{
    COOKIENAME: "tpIdentityTokens",
    COOKIETIMEOUT: "tpIdentityTimeOut",
    identityServiceUrl: "https://euid.theplatform.com",
    authSigninPath: "/idm/web/Authentication/signIn",
    loginFormEnabled: true,
    loginInstructions: "Please enter your username and password to continue",
    errorInstructions: "Invalid username or password, please try again",
    isGettingToken: false,
    paused: false,
    prompting: false,
    priority: 1,
    cancelLabel: "Cancel",
    loginLabel: "Login",
    usernameLabel: "Username",
    passwordLabel: "Password",
    clip: null,

    constructor : function(){
    },

    initialize : function(lo){
        this.controller = lo.controller;
        this.username = lo.vars["username"];
        this.password = lo.vars["password"];
        this.directory = lo.vars["directory"];
        this.priority = lo.priority;
        this.promptImmediately = false;

        if (lo.vars["loginFormEnabled"])
            this.loginFormEnabled = lo.vars["loginFormEnabled"].toString().toLowerCase() =="true";

        this.directory = lo.vars["directory"];
        if (lo.vars["identityServiceUrl"])
            this.identityServiceUrl = lo.vars["identityServiceUrl"];
        if (lo.vars["loginInstructions"])
            this.loginInstructions = lo.vars["loginInstructions"];
        if (lo.vars["errorInstructions"])
            this.errorInstructions = lo.vars["errorInstructions"];
        if (lo.vars["usernameLabel"])
            this.usernameLabel = lo.vars["usernameLabel"];
        if (lo.vars["passwordLabel"])
            this.passwordLabel = lo.vars["passwordLabel"];
        if (lo.vars["loginLabel"])
            this.loginLabel = lo.vars["loginLabel"];
        if (lo.vars["cancelLabel"])
            this.cancelLabel = lo.vars["cancelLabel"];
        if (lo.vars["promptImmediately"])
            this.promptImmediately = (lo.vars["promptImmediately"] == "true");

        this.token = lo.vars["token"];

        this.controller.registerURLPlugIn(this, lo.type, lo.priority);

        var me = this;
        this.controller.addEventListener("OnPlayerLoaded", function (e) { me.handlePlayerLoaded(e); });
        this.controller.addEventListener("OnLoginSubmit", function (e) { me.handleLoginSubmit(e); });
        this.controller.addEventListener("OnLoginCancel", function (e) { me.handleLoginCancel(e); });
        this.controller.addEventListener("OnShowCard", function (e) { me.handleShowCard(e); });
        this.controller.addEventListener("OnHideCard", function (e) { me.handleHideCard(e); });
        this.controller.addEventListener("OnSetToken", function (e) { me.handleSetToken(e); });

        this.controller.registerFunction("getToken", this, this.doGetToken)

        if (this.token)
        {
            this.doSetToken();
        }
    },

    rewriteURL: function(clip)
    {
        this.clip = clip;

        if (clip.baseClip.security)
        {
            if (this.token)
            {
                this.doSetToken();
            }
            else
            {
                if (this.loginFormEnabled && !this.prompting && !this.isGettingToken)
                {
                    this.paused = true;
                    this.doGetToken();
                    return true;
                }
                else if (this.prompting || this.isGettingToken)
                {
                    this.paused = true;
                    return true;
                }
            }
        }

        return false;
    },

    handlePlayerLoaded: function(e)
    {
        this.controller.removeEventListener("OnPlayerLoaded", this.handlePlayerLoaded);

        if (!this.token && this.username && this.password && this.directory)
        {
            this.doGetToken();
        }
        else if (!this.token && this.directory && this.promptImmediately)
        {
            this.doGetToken();
        }
    },

    handleSetToken: function(e)
    {

    },

    handleShowCard: function(e)
    {
        if (e.data.deck == "forms" && e.data.card == "tpLoginCard")
        {
            this.prompting = true;
        }
    },

    handleHideCard: function(e)
    {
        if (e.data.deck == "forms" && e.data.card == "tpLoginCard")
        {
            this.prompting = false;
        }
    },

    doSetToken: function()
    {
        tpDebug("doSetToken: " + this.token, "IdentityPlugIn");
        if (this.token)
        {
            this.controller.setToken(this.token, "urn:theplatform:auth:token")

            if (this.paused)
            {
                this.controller.setClip(this.clip);
            }
        }

        this.controller.hidePlayerCard("forms", "tpLoginCard");
    },

    doGetToken: function()
    {
        tpDebug("doGetToken()","IdentityPlugIn");

        if (this.token && this.token.length )
        {
            tpDebug("already had them, sending back","IdentityPlugIn");
            this.doSetToken();
        }
        else if (this.identityServiceUrl && this.authSigninPath)
        {
            if (this.directory&&this.directory.length)
                this.token = this.checkCookieForToken(this.directory);
            else
                this.token = this.checkCookieForToken(this.username);

            //we're supposed to update the cookie again now with a new idletimeout..
            if (this.token&&this.token.length)
            {
                tpDebug("Got a token for "+this.username+" from a cookie: " + this.token,"IdentityPlugIn");
                this.doSetToken();
            }
            else
            {
                if (this.username && this.password)
                {
                    tpDebug("Requesting token from service","IdentityPlugIn");
                    this.getToken();
                }
                else
                {
                    var me = this;
                    this.promptForLogin(false);
                }
            }
        }
        else
        {
             tpDebug("No Identity service configured.","IdentityPlugIn","error");
            return false;
        }

        return true;
    },

    promptForLogin: function(isRetry)
    {
        if (!this.loginFormEnabled)
        {
            return;
        }

        var initVars;

        if (isRetry)
        {
            initVars =
            {
                usernameLabel:  this.usernameLabel,
                passwordLabel:  this.passwordLabel,
                message:        this.errorInstructions,
                username:       this.username,
                password:       this.password
            };
        }
        else
        {
            initVars =
            {
                usernameLabel:  this.usernameLabel,
                passwordLabel:  this.passwordLabel,
                message:        this.loginInstructions,
                username:       this.username,
                password:       this.password
            };
        }

        tpDebug("Requesting token from tpLoginCard","IdentityPlugIn");

        this.controller.showPlayerCard('forms', 'tpLoginCard', null, initVars);
        this.prompting = true;
    },

    handleLoginSubmit: function(event)
    {
        this.username = event.data.username;
        this.password = event.data.password;
        this.getToken();
    },

    handleLoginCancel: function(event)
    {
        this.prompting = false;
    },

    checkCookieForToken: function(prefix)
    {
        tpDebug("Checking cookie for token", "IdentityPlugIn");

        this.cookie = this.getCookie(this.COOKIENAME);

        if (this.cookie==null||this.cookie.length<=0)
            return null;

        var pairs = this.cookie.split("%2C");

        var item;
        for (var i=0; i<pairs.length; i++)
        {
            item = pairs[i];
            var pair = item.split("%3A");

            if (prefix == null || pair[0].indexOf(encodeURIComponent(prefix + "/")) == 0)
                return pair[1];
        }

        return null;
    },

    storeCookie:function(username,token,expiryDate,directory)
    {
        tpDebug("Saving token to cookie","IdentityPlugIn");
        var newcookie;
        var name;

        if (directory)
        {
            name = encodeURIComponent(directory+"/"+username);
        }
        else
            name = encodeURIComponent(username);


        newcookie = name+encodeURIComponent(":"+token+",");

        if (this.cookie==null)
            this.cookie="";

        var nameColon = name+":";

        var index = this.cookie.indexOf(nameColon);

        if (index!=-1)
        {
            //we need to replace
            var pairs = this.cookie.split(",");

            this.cookie="";

            for (var item in pairs)
            {
                if (item.indexOf(nameColon)==-1)
                    this.cookie+=item+",";
            }
        }
        //otherwise //we can just append

        this.cookie += newcookie;

        this.setCookie(this.COOKIENAME,this.cookie, expiryDate);
    },

    setCookie: function(name,value,date)
    {
        document.cookie = name+"="+value+"; expires="+date+"; path=/";
    },

    getCookie: function(name)
    {
        var cookies = document.cookie.split(';');

        if (cookies==null||cookies.length<=0)
            return null;

        var ourcookie;

        var nameEQ = name+"=";

        //look for the substring

        for(var i=0;i<cookies.length;i++) {
            var c = cookies[i];

            while (c.charAt(0)==' ')
                c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0)
                return c.substring(nameEQ.length,c.length);
        }

        return null;
    },

    getToken: function()
    {
        this.isGettingToken = true;

        var request = this.identityServiceUrl + this.authSigninPath;

        var context = "";
        if (this.directory && this.directory.length > 0)
        {
            context = this.directory + "/";
        }

        request += "?username=" + context + this.username
                + "&password=" + this.password + "&form=json&schema=1.0";

        var me = this;

        $pdk.jQuery.ajax({
            url: request,

            dataType: 'jsonp json',

            beforeSend: function(jqXhr, settings) {
                return true;
            },

            success: function(json) {
                me.handleTokenData(json);
            },

            error: function(error) {
                tpDebug("JSON Error getting token", "IdentityPlugIn");
                me.prompting = false;
            }});
    },

    handleTokenData: function(json)
    {
        tpDebug("Got response from identity service...","IdentityPlugIn");

        var success = false;
        if (json)
        {
            tpDebug("Identity Service JSON:\n" + json, "IdentityPlugIn", "debug");

            tpDebug("Identity Service Response: " + json.signInResponse, "IdentityPlugIn");

            if (json && json.signInResponse && json.signInResponse.token)
            {
                this.token = json.signInResponse.token;
                tpDebug("Identity Service token: " + this.token, "IdentityPlugIn");

                success = true;
                //we need to store the dir/username and token
                var expiry = json.signInResponse.idleTimeout;
                var now = new Date();
                now.setTime(now.getTime()+parseInt(expiry));

                this.setCookie(this.COOKIETIMEOUT,expiry);
                this.storeCookie(this.username,this.token,now.toUTCString(),this.directory);
                this.doSetToken();
                this.prompting = false;
            }
        }
        if (!success)
        {
            tpDebug("Identity Service call did not succeed, reprompting...", "IdentityPlugIn");
            this.promptForLogin(true);
        }

        this.isGettingToken = false;
    }
});

$pdk.controller.plugInLoaded(new $pdk.plugin.Identity());