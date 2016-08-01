$pdk.ns("$pdk.plugin.AuthorizationPlugin");
$pdk.plugin.AuthorizationPlugin = $pdk.extend(function(){},
{
	CDN_TOKEN_NAMESPACE : "urn:theplatform:auth:cdn:",

	constructor : function()
	{
	},

	initialize : function(loadObj)
	{
		this.priority = loadObj.priority;
		this._controller = loadObj.controller;
		this._token = loadObj.vars["token"];
		this._authString = "auth";

		if (loadObj.vars.hasOwnProperty("authString"))
		{
			this._authString = loadObj.vars["authString"];
		}

	    if (!this._token||this._token.length===0)
        {
            var me = this;
            this.setTokenListener = function(e)
            {
                me.onSetToken(e);
            }
            this._controller.addEventListener("OnSetToken", this.setTokenListener);
        }

		try
		{
			this._controller.registerURLPlugIn(this, "authorization", this.priority);
		}
		catch(e)
		{
			tpDebug("WARN: " + e.message);
		}
	},

	onSetToken: function(e)
    {
        if (e.data && e.data.token && (e.data.type.toLowerCase().indexOf(this.CDN_TOKEN_NAMESPACE) == 0)) this._token = e.data.token;
    },

	rewriteURL : function(clip)
	{
		var auth = null;

		if(typeof(this._token) === "string" && this._token.length > 0) {
			auth = this._token;
		}

		if(auth !== null)
		{
			var url = [
				clip.baseClip.URL,
				clip.baseClip.URL.indexOf("?") >= 0 ? "&" : "?",
				this._authString,
				"=",
                auth
			].join("");

			clip.baseClip.URL = url;
			clip.URL = url;

			this._controller.setClip(clip);
		}

		return auth !== null;
	}

});

$pdk.controller.plugInLoaded(new $pdk.plugin.AuthorizationPlugin());
