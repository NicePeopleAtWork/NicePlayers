$pdk.ns("$pdk.plugin.AuthPlugin");
$pdk.plugin.AuthPlugin = $pdk.extend(function(){},
{
	COOKIE_REGEX : /^"?(?:([0-9]+)\|)(?:([0-9]{3})\|)(?:(.*)\|)(?:(.*))"?$/,

	constructor : function(cookies)
	{
		this._cookies = cookies;
	},

	initialize : function(loadObj)
	{
		this.priority = loadObj.priority;
		this._controller = loadObj.controller;
		this._token = loadObj.vars["token"];
		this._cookie = loadObj.vars["cookie"];
		this._paused = false;
		this.TIMEOUT = 5000;

		if (!this._token||this._token.length===0)
		{
		    if (this._cookie)
		        this._token = this._checkCookie(this._cookie);
		    else
		        this._token = this._checkCookie("tpUserToken");
		}

        var me = this;
        this.setTokenListener = function(e)
        {
            me.onSetToken(e);
        }
        this.showCardListener = function(e)
        {
        	if (me.timeoutId && e.data.card == "tpLoginCard" && e.data.deck == "forms")
        	{
        		// if there's a tpLoginCard up, wait indefinitely...
        		clearTimeout(me.timeoutId);
        	}
        }

        this._controller.addEventListener("OnSetToken", this.setTokenListener);
        this._controller.addEventListener("OnShowCard", this.showCardListener)

		try
		{
			this._controller.registerMetadataUrlPlugIn(this, this.priority);
            tpDebug("*** authentication plugin LOADED! ***");
		}
		catch(e)
		{
			tpDebug("WARN: " + e.message);
		}
	},

	onSetToken: function(e)
    {
        if (e.data && e.data.token)
 		{
			if (e.data.type.toLowerCase().indexOf("urn:theplatform:")===0)
			{
				// if we have a tp namespaced token, then make sure it's an auth token, not a CDN token or some other kind
				if (e.data.type.toLowerCase().indexOf("urn:theplatform:auth:")===0)
				{
					this._token = e.data.token;
				}
			}
			else
			{
				// if it's not namespaced to theplatform, then assume it's an auth token, since that was the original token type we supported.
				this._token = e.data.token;
			}

			if (this._paused && this._token)
			{
				this._paused = false;
				this._controller.setMetadataUrl([
					this.releaseUrl,
					this.releaseUrl.indexOf("?") >= 0 ? "&" : "?",
					"auth",
					"=",
                	this._token
				].join(""));				
			}
		}
       // tpDebug({token:e.data.token, type:e.data.type},this.controller.id,"resumePlayback",tpConsts.TEST);
    },

	rewriteMetadataUrl : function(releaseUrl, isPreview)
	{
		if (isPreview)
		{
			return;
		}

		var auth = null;
		cookieName = "tpUserToken";

		this.releaseUrl = releaseUrl;

		if(typeof(this._token) === "string" && this._token.length > 0) {
			auth = this._token;
		}

		if(auth === null)
		{
			auth = this._checkCookie(this._cookie);
			auth = auth === null ? this._checkCookie("tpUserToken") : auth;
		}

		if(auth !== null)
		{
			this._controller.setMetadataUrl([
				releaseUrl,
				releaseUrl.indexOf("?") >= 0 ? "&" : "?",
				"auth",
				"=",
                auth
			].join(""));
		}
		else
		{
			this._paused = true;
			var possible = this._controller.callFunction("getToken", []);

			if (!possible)
			{
				this.error();
			}
		}

		return true;
	},

	error : function()
	{
		// just continue and let PDK handle the error
		this._controller.setMetadataUrl(this.releaseUrl);
		this._paused = false;
	},

	_checkCookie : function(cookieName)
	{
		var cookie = null,
		cookieParsed;

		if(typeof(cookieName) === "string" && cookieName.length > 0)
		{
			cookie = this._cookies[cookieName];
			if(typeof(cookie) === "string")
			{
				cookieParsed = this.COOKIE_REGEX.exec(cookie);
				cookie = $pdk.isArray(cookieParsed) && cookieParsed.length >= 3 ? cookieParsed[3] : null;
			}
			else
			{
				cookie = null;
			}
		}

		return cookie;
	}
});

$pdk.controller.plugInLoaded(new $pdk.plugin.AuthPlugin($pdk.env.Detect.getInstance().getCookies()));
