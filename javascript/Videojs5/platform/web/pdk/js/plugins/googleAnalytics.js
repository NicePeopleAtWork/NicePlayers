$pdk.ns("$pdk.plugin.googleAnalytics");
$pdk.plugin.googleAnalytics = $pdk.extend(function(){},
{
	VERSION : "1.0",
	_callback : "tpGaLoaded",
	_histogramTag : "histogram",
	_pattern : null,
	_histograms : 0,
	_trackAds : false,
	_ID : null,
	_instanceID : 0,
	_checkPoints : null,
	_playlist : null,
	_pageTitle : null,
	_isAd : false,
	_gaUrl : null,
	_gaJavaScriptUrl : null,

	constructor : function()
	{
       	tpDebug("GoogleAnalytics Plugin instantiated.");
	},

	/**
	 * Initialize the plugin with the load object
	 * @param lo load object
	 */
	initialize:function(lo)
	{
		var that = this;

		this._lo = lo;
		this._controller = this._lo.controller;
		tpDebug("GoogleAnalytics Plugin loading: " + this._controller);

		this._ID = lo.vars["ID"];
		if (this._ID == null || this._ID.length == 0)
		{
			tpDebug("ERROR: the google analytics tracking ID (e.g., \"UA-4774730-2\") must be provided via an \"ID\" parameter.");
			return;
		}

		// create an instance ID, for multiple google analytics plugins running at the same time
		this._instanceID = Math.round(1000000 * Math.random());

		// get the pattern.  it needs to start with "/", and not end with "/", so massage the string as necessary
		this._pattern = lo.vars["pattern"];
		if (this._pattern == null || this._pattern.length == 0)
		{
			this._pattern = "/thePlatform/{playlist.player}/{isAd}/{title}/{" + this._histogramTag + "}";
		}
		// make sure the pattern starts with "/", for URL goodness
		if (this._pattern.charAt(0) != "/")
		{
			this._pattern = "/" + this._pattern;
		}

		// figure out the histogram count
		this._histograms = lo.vars["histograms"];
		if (isNaN(this._histograms) || this._histograms < 1)
		{
			this._histograms = 10;
		}

		// record whether to track ads
		this._trackAds = lo.vars["trackAds"];

		// get the page title; we might use this for a player name
		this._pageTitle = document.title;

		//First check if there is a loadvar: jsUrl, if so then use it.
		//Otherwise, try to figure out the url using the following
		//try plugInUrl.replace(“swf/*.swf”, “js/ga.js”);
		//if there was no match in #1 try replace(“*.swf”, “ga.js”)
		//if there was no match in #2 try using <currenthost>/js/ga.js

		if (lo.vars.hasOwnProperty("jsUrl")) {
			this._gaJavaScriptUrl = lo.vars["jsUrl"];
		}
		else if ($pdk.scriptRoot) {
			this._gaJavaScriptUrl = $pdk.scriptRoot + "/js/ga.js";
		}

		var that = this;
		tpLoadScript(this._gaJavaScriptUrl, function(scriptFileName) { that.loadComplete(scriptFileName)} );

		tpDebug("Derived javascript URL to be : " + this._gaJavaScriptUrl);

		tpDebug("[" + this._instanceID + "]: *** GoogleAnalytics PLUGIN LOADED *** version:[" + this.VERSION + "]");
		tpDebug("[" + this._instanceID + "]: pattern=[" + this._pattern + "], histograms=[" + this._histograms + "], trackAds=[" + this._trackAds + "], ID=[" + this._ID + "], pageTitle=[" + this._pageTitle + "]");
	},

	loadComplete: function(scriptFileName)
	{
		// get metadata events registered as quickly as possible
		var that = this;
		this._controller.addEventListener("OnMediaStart", function(e) { that.onMediaStart(e); });
		this._controller.addEventListener("OnReleaseStart", function(e) { that.onReleaseStart(e); });

		var that = this;
		this._controller.addEventListener("OnJavascriptLoaded", this._onJavaScriptLoadedListener = function(e) { that.onJavaScriptLoaded(e) });
		tpGaWrapperLoaded();
	},

	onJavaScriptLoaded: function(e)
	{
		if (e.data == "tpGaLoaded")
		{
			tpDebug(this, "GoogleAnalytics", tpConsts.INFO);
			this._controller.removeEventListener("OnJavascriptLoaded", this._onJavaScriptLoadedListener);

			tpDebug("[" + this._instanceID + "]: initializing analytics for \"" + this._ID + "\"");
			tpGaInit(this._instanceID, this._ID);

			// register listeners
			var that = this;
			this._controller.addEventListener("OnMediaPlaying", function(e) { that.onMediaPlaying(e); });
			this._controller.addEventListener("OnMediaEnd", function(e) { that.onMediaEnd(e); });
			tpDebug("[" + this._instanceID + "]: all listeners registered");
		}
	},

	onReleaseStart:function(e)
	{
		this._playlist = e.data;
	},

	onMediaStart: function(e)
	{
		// figure out if it's an ad
		this._isAd = e.data.baseClip.isAd;

		if (this.shouldTrack())
		{
			// do the basic url substitution
			this._gaUrl = this.substitutePattern(e.data);

			// set up the tracking URLs
			this.initTracking();
		}
	},

	onMediaPlaying: function(e)
	{
		if (this.shouldTrack())
		{
			var percentComplete;
			var currentTime;
			var timeObj;

			timeObj = e.data;

			percentComplete = (timeObj.percentCompleteAggregate > 0) ? timeObj.percentCompleteAggregate : timeObj.percentComplete;

			for (var i=0; i<this._checkPoints.length; i++)
			{
				// if tracking url hasn't fired then see if it's time
				if (!this._checkPoints[i].hasFired)
				{
					// tracking URL hasn't fired
					if (percentComplete >= this._checkPoints[i].triggerValue)
					{
						this._checkPoints[i].hasFired = true;
						this.gaCall(Number(this._checkPoints[i].triggerValue));
					}
				}
			}
		}
	},

	onMediaEnd: function(e)
	{
		if (this.shouldTrack())
		{
			this.gaCommit();
		}
	},

	shouldTrack: function()
	{
		return this._trackAds || !this._isAd;
	},

	substitutePattern: function(clip)
	{
		var inToken = false;
		var token = "";
		var result = "";
		for (var i=0; i<this._pattern.length; i++)
		{
			var chr = this._pattern.charAt(i);
			// start of a token
			if (chr == "{")
			{
				inToken = true;
			}
			// end of a token
			else if (chr == "}")
			{
				inToken = false;
				if (token == this._histogramTag)
				{
					result += "{" + this._histogramTag + "}";
				}
				else
				{
					result += this.gaEscape(this.getTokenValue(token, clip, this._playlist));
				}
				token = "";
			}
			else
			{
				if (inToken)
				{
					token += chr;
				}
				else
				{
					result += chr;
				}
			}
		}
		return result;
	},

	getTokenValue: function(token, clip, playlist)
	{
		var value;

		// special cases for playlist-level fields
		if (token == "playlist.player")
		{
			value = this.getPlayer(playlist);
		}
		// generic playlist-level handling
		else if (token.indexOf("playlist.") == 0)
		{
			value = playlist[token.split("\.")[1]];
		}
		// generic clip-level handling
		else if (token.indexOf("clip.") == 0)
		{
			value = clip[token.split("\.")[1]];
		}
		else if (token.indexOf("contentCustomData.") == 0 && clip.baseClip.contentCustomData)
		{
			value = clip.baseClip.contentCustomData[token.split("\.")[1]];
		}		
		// special cases for baseclip-level fields
		else if (token == "title")
		{
			value = this.getTitle(clip);
		}
		else if (token == "isAd")
		{
			value = (clip.baseClip.isAd ? "Ad" : "Content");
		}
		// general baseclip-level handling
		else
		{
			value = clip.baseClip[token];
		}

		// fix blanks
		if (!value || value.length == 0)
		{
			tpDebug("Couldn't find a substitution for \"" + token + "\"");
			value = "(blank)"
		}

		tpDebug("[" + this._instanceID + "]: replaced \"{" + token + "}\" with \"" + value + "\"");
		return value.toString();
	},

	getTitle: function(clip)
	{
		// try the metadata title
		var _clipTitle = clip.title;

		// if that's missing, try to get the file name, first from the immediate clip, and
		// then from the base clip
		if (_clipTitle == null || _clipTitle.length == 0)
		{
			_clipTitle = clip.URL;
			if (_clipTitle == null || _clipTitle.length == 0)
			{
				// there's always a URL, otherwise it wouldn't play
				_clipTitle = clip.baseClip.URL;
			}

			// try to slice down to the file name
			var fileStart = _clipTitle.lastIndexOf("/");
			if (fileStart >= 0)
			{
				_clipTitle = _clipTitle.substr(fileStart + 1, _clipTitle.length - fileStart);
			}
		}
		return _clipTitle
	},

	getPlayer: function(playlist)
	{
		// try to get it from the playlist
		var player = playlist.player;

		// if that fails, use the page title
		if (player == null || player.length == 0)
		{
			player = this._pageTitle;
		}

		return player;
	},

	/**
	 * get the label for the histogram bucket; e.g., "00-05", "05-10", "95-100", etc.
	 */
	getHistogram: function(percentComplete)
	{
		// add padding for sub 10 values, so things line up in order in the google
		// analytics UI
		var roundedPercentComplete = Math.round(percentComplete);
		var paddedPercentComplete = (roundedPercentComplete < 10 ? "0" : "") + roundedPercentComplete;
		var histogramEnd = Math.round(percentComplete + (100 / this._histograms));
		return paddedPercentComplete + "-" + (histogramEnd < 10 ? "0" : "") + histogramEnd;
	},

	/**
	 * call google analytics
	 */
	gaCall: function(percentComplete)
	{
		// replace any histogram tag
		var histogram = this.getHistogram(percentComplete);
		var gaEvent;
		if (this._gaUrl != null && this._gaUrl.indexOf("{" + this._histogramTag + "}") >= 0)
		{
			gaEvent = this._gaUrl.split("{" + this._histogramTag + "}").join(histogram);
		}
		else
		{
			gaEvent = this._gaUrl;
		}

		// track the URL
		tpDebug("[" + this._instanceID + "]: updating URL: " + gaEvent);
		tpGaUpdateTracking(this._instanceID, 0, gaEvent);
	},

	gaCommit: function()
	{
		tpDebug("[" + this._instanceID + "]: committing last URL");
		tpGaCommit(this._instanceID, 0);
	},

	/**
	 * escape any "/" characters using URI encoding
	 */
	gaEscape: function(s)
	{
		return s.split("/").join("%2F");
	},

	resetTracking: function()
	{
		this._checkPoints = [];
	},

	initTracking: function()
	{
		this.resetTracking();
		for (var i=0; i<this._histograms; i++)
		{
			var checkPoint = {};
			checkPoint.triggerType = 0;
			checkPoint.triggerValue = i * (100 / this._histograms);
			this._checkPoints.push(checkPoint);
		}
	}

});

$pdk.controller.plugInLoaded(new $pdk.plugin.googleAnalytics(), null);
