
// This plug-in will handle AkamaiHD for iOS, by requesting manifest=m3u.
// You will need to have your server definition set up in MPX to use this.
AkamaiHDPlugIn = Class.extend({

	AKAMAI_LAYER: "tp:akamai-analytics",

	init: function() {

	},

	initialize: function(loadObj) {
		var me = this;
		this.controller = loadObj.controller;
		this.runtime = this.controller.getProperty("videoEngineRuntime") || "html5";
		// Grab the manifest type, in case we support more in the future
		// but default to m3u, which is the only one that makes sense currently
		var player = $pdk.getConfiguration(this.controller.componentId);
		var defaultFormat = player.videoengineruntime == "flash" ? "f4m" : "m3u";
		var defaultManifest = "true";

		this.manifest = (loadObj.vars['manifest'] ? loadObj.vars['manifest'] : defaultManifest);

		if (this.manifest && this.manifest !== "true" && this.manifest !== "false")
		{
			defaultFormat = this.manifest;
			this.manifest = "true";
		}

		this.format = (loadObj.vars['format'] ? loadObj.vars['format'] : defaultFormat);

		this.fallback = (loadObj.vars['fallback'] ? loadObj.vars['fallback'] : null);
		this.androidHLS = (loadObj.vars['androidhls'] == "true" ? true : false);
		this.iosHLS = (loadObj.vars['ioshls'] == "false" ? false : true);
		this.beacon = (loadObj.vars['analyticsBeacon'] ? loadObj.vars['analyticsBeacon'] : null);
		this.analyticsKeys = (loadObj.vars['analyticsKeys'] ? loadObj.vars['analyticsKeys'].split(",") : null);
		this.analyticsValueFields = (loadObj.vars['analyticsValueFields'] ? loadObj.vars['analyticsValueFields'].split(",") : null);
		this.videoLayer = (loadObj.vars['videoLayer'] ? loadObj.vars['videoLayer'] : "");

		// Finally, register the plug-in with the controller
		// to be able to accept URL rewriting requests.
		this.controller.registerMetadataUrlPlugIn(this,loadObj.type, loadObj.priority);

		// analytics only works in flash for now...
		if (this.runtime == "flash")
		{
			this.controller.registerURLPlugIn(this,loadObj.type,loadObj.priority);
		}

		this.formats = $pdk.env.Detect.getInstance().getSupportedRuntimes();
        tpDebug("*** akamaiHD plugin LOADED! ***");
	},

	// This method must be implemented on the class. It does the actual work
	// of inspecting the URL and making the necessary changes.
	rewriteMetadataUrl: function(url, isPreview) {

	    var me = this;

		// if this is a preview URL, we don't want to touch it.
		if (isPreview) return false;

		// let's be safe and check if there's even a URL.
		if (!url) return false;

		// Only iOS can handle M3U, at the moment, and maybe Android, so we'll try
		if (this.isManifestCompatible() && this.manifest === "true")
		{
			// if there'a already a manifest, replace it
		    if (url.match(/(\?|\&)manifest\=[^\&]*/i))
			{
				url = url.replace(/(\?|\&)manifest\=[^\&]*/i, "$1manifest=" + this.format);
			}
			// there's no manifest param, let's add one
			else if (url.indexOf("?") >= 0)
			{
				url += "&manifest=" + this.format;
			}
			else
			{
				url += "?manifest=" + this.format;
			}
		}
		// if it's not an m3u compatible device, strip off any manifest
		// Because the only other manifest is F4M which won't work in JS
		else
		{
			// if there'a already a manifest, replace it
		    if (url.match(/(\?|\&)manifest\=[^\&]*/i))
			{
				url = url.replace(/\?manifest\=[^\&]*\&/i, "?");
                url = url.replace(/\&manifest\=[^\&]*/i, "");
			}

			// and add our fallback parameters if they're defined
			if (this.fallback)
			{
				if (url.indexOf("?") >= 0)
				{
					url += "&" + unescape(this.fallback);
				}
				else
				{
					url += "?" + unescape(this.fallback);
				}
			}
		}

		this.controller.setMetadataUrl(url);

	    return true;
	},

	rewriteURL: function(clip){

	    var me = this;


		if (this.beacon)
		{
            this.controller.callLayerFunction(this.AKAMAI_LAYER, "setAnalyticsKeyValue", ["title", (clip.title ? clip.title : clip.baseClip.title)])
            if (this.analyticsKeys && this.analyticsValueFields && this.analyticsKeys.length == this.analyticsValueFields.length)
            {
                for (var i=0; i<this.analyticsKeys.length; i++)
                {
		            if (clip.baseClip.contentCustomData&&clip.baseClip.contentCustomData[this.analyticsKeys[i]])
		            	this.controller.callLayerFunction(this.AKAMAI_LAYER, "setAnalyticsKeyValue", [this.analyticsKeys[i], clip.baseClip.contentCustomData[this.analyticsValueFields[i]]]);
                }
            }
		}

        this.controller.setClip(clip);

	    return true;
	},

	isManifestCompatible: function()
	{
		if (tpIsAndroid() && !this.androidHLS)
			return false;

		if (tpIsIOS() && !this.iosHLS)
			return false;

		for (var i=0; i<this.formats.length; i++)
		{
			if (this.runtime == "html5" && this.format.toLowerCase() == "m3u" && this.formats[i].match(/html5\:m3u/i))
			{
				return true;
			}
			else if (this.runtime == "flash" && this.videoLayer.toLowerCase() == "osmf" && this.format.toLowerCase() == "m3u" && this.formats[i].match(/universal\:m3u/i))
			{
				return true;
			}
			if (this.runtime == "flash" && this.format.toLowerCase() == "f4m" && this.formats[i].match(/universal\:f4m/i))
			{
				return true;
			}
		}
		return false;
//		return (tpIsIOS() || tpIsAndroid());
	}

});

// Create an instance of the plug-in.
// And add it to the collection of plug-ins to be loaded.
$pdk.controller.plugInLoaded(new AkamaiHDPlugIn());
