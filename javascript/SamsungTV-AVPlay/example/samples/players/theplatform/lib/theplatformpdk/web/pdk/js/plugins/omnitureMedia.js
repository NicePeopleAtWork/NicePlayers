$pdk.ns("$pdk.plugin.OmniturePlugin");
$pdk.plugin.OmniturePlugin = $pdk.extend(function() {}, {
	OMNITURETRACKINGEVENT: "OnOmnitureTracking",

	//member var for player reference
	_player: null,

	_isPaused: false,

	constructor: function() {},

	initialize: function(loadObj) {


		this.controller = loadObj.controller;

		this._player = this.controller.component;
		this._position = 0;

		//according to spec, default is 25
		this.frequencyPercent = 0;
		//according to spec, default is 5
		this.frequencySeconds = 0;
		this.loadObj = loadObj;
		this.jsInstanceName = "s";

		var omnitureJsUrl = loadObj.vars.hasOwnProperty("omnitureJsUrl") ? loadObj.vars["omnitureJsUrl"] : $pdk.scriptRoot + "/js/omniture.sitecatalyst.js";

		if (loadObj.vars.hasOwnProperty("pageName")) {
			omPageName = loadObj.vars["pageName"];
		} else if (loadObj.vars.hasOwnProperty("pagename")) {
			omPageName = loadObj.vars["pagename"];
		}


		if (loadObj.vars.hasOwnProperty("pageUrl")) {
			omPageUrl = loadObj.vars["pageUrl"];
		} else if (loadObj.vars.hasOwnProperty("pageurl")) {
			omPageUrl = loadObj.vars["pageurl"];
		}
		if (loadObj.vars["host"]) {
			s_trackingServer = loadObj.vars["host"];
		}
		if (loadObj.vars["visitorNamespace"]) {
			s_visitorNamespace = loadObj.vars["visitorNamespace"];
		}
		if (loadObj.vars["monitor"]) {
			this.monitor = loadObj.vars["monitor"];
		}
		if (loadObj.vars["jsInstanceName"]) {
			this.jsInstanceName = loadObj.vars["jsInstanceName"];
		}

		this._useTrackLink = false;

		if (loadObj.vars["useTrackLink"] == "true") {
			this._useTrackLink = true;
		}

		if (eval("window." + this.jsInstanceName))
		{
			this.configureSiteCatalyst();
		}
		else
		{
			var me = this;

			if (loadObj.vars["account"])
			{
				window.s_account = loadObj.vars["account"];
			}

			tpLoadScript(omnitureJsUrl, function() {
				me.configureSiteCatalyst();
			});
		}

		tpDebug("*** omnitureMedia plugin LOADED! ***");
	},

	configureSiteCatalyst: function()
	{
		if (omniturescriptloaded) return;

		omniturescriptloaded = true;

		var me = this;
		this.siteCatalystInstance = eval(this.jsInstanceName);
		this._trackVars = "";
		var milestones = null;
		var milestoneEvents = null;

		var s = this.siteCatalystInstance ? this.siteCatalystInstance : window.s;
		this.siteCatalystInstance = s;

		//this shouldn't be needed, but sometimes IE9 screws up and s isn't defined yet
		if (s === undefined) s = {};
		else s.loadModule("Media");

		// universal actionSource settings
		s.pageName = omGetPageName();
		s.pageURL = omGetPageUrl();
		s.charSet = "UTF-8";
		s.currencyCode = "USD";
		s.trackClickMap = false;
		s.movieID = "";

		// if this is left on, all of our HTML5 click handlers break
		s.useForcedLinkTracking = false;

		s.Media.monitor = eval(this.monitor);

		// parse all properties
		var loadObj = me.loadObj;

		for (loadVar in loadObj.vars) {

			tpDebug(loadVar + "=[" + loadObj.vars[loadVar] + "]");

			switch (loadVar) {
			case "host":
				s.trackingServer = loadObj.vars[loadVar];
				break;

			case "secureHost":
				s.trackingServerSecure = loadObj.vars[loadVar];
				break;

			case "debug":
				s.debugTracking = loadObj.vars[loadVar] == "true";
				s.trackLocal = loadObj.vars[loadVar] == "true";
				break;

			case "trackVars":
				this._trackVars += (this._trackVars.length > 0 ? "," : "") + loadObj.vars[loadVar];
				break;

			case "trackEvents":
				s.Media.trackEvents = loadObj.vars[loadVar];
				break;

			case "trackMilestones":
				milestones = loadObj.vars[loadVar];
				break;

			case "a.media.milestones":
				milestoneEvents = loadObj.vars[loadVar]
				break;

			case "a.contenttype":
			case "a.contentType":
				if (!s.Media.contextDataMapping) s.Media.contextDataMapping = {};
				s.Media.trackUsingContextData = true;
				s.Media.contextDataMapping[loadVar] = loadObj.vars[loadVar]
				break;

			case "adViewEvent":
				this._adViewEvent = loadObj.vars[loadVar];
				tpDebug("setting ad view event: " + this._adViewEvent)
				break;
			case "adCompleteEvent":
				this._adCompleteEvent = loadObj.vars[loadVar];
				break;

			case "mediaIdVars":
				this._mediaIdVars = (loadObj.vars[loadVar]).toString().split(",");
				this._trackVars += (this._trackVars.length > 0 ? "," : "") + this._mediaIdVars;
				break;
			case "mediaGuidVars":
				this._mediaGuidVars = (loadObj.vars[loadVar]).toString().split(",");
				this._trackVars += (this._trackVars.length > 0 ? "," : "") + this._mediaGuidVars;
				break;
			case "categoriesVars":
				this._categoriesVars = (loadObj.vars[loadVar]).toString().split(",");
				this._trackVars += (this._trackVars.length > 0 ? "," : "") + this._categoriesVars;
				break;

			case "frequency":
				me.frequency = loadObj.vars[loadVar];
				if (typeof(me.frequency) === "string") {
					if (me.frequency.indexOf("%") == me.frequency.length - 1) {
						me.frequencyPercent = Number(me.frequency.substr(0, me.frequency.length - 1));
						if (isNaN(me.frequencyPercent)) {
							me.frequencyPercent = 25;
						}
					} else {
						me.frequencySeconds = Number(me.frequency);
						if (isNaN(me.frequencySeconds)) {
							me.frequencySeconds = 5;
						}
						if (me.frequencySeconds < 5) {
							tpDebug("Omniture doesn't support a frequency less than 5 seconds; snapping to 5");
						}
					}
				}
				break;

				// handles "dc", "account", "visitorNamespace", "Media.x", and any "eVarN" and "propN"
			default:
				if (loadVar.toLowerCase().indexOf("media.") == 0) {
					var subLoadVar = loadVar.substring(6);
					s.Media[subLoadVar] = loadObj.vars[loadVar];
				} else if (loadVar.toLowerCase().indexOf("a.media.") == 0) {
					if (!s.Media.contextDataMapping) s.Media.contextDataMapping = {};
					s.Media.contextDataMapping[loadVar] = loadObj.vars[loadVar]
					s.Media.trackUsingContextData = true;
				} else {
					s[loadVar] = loadObj.vars[loadVar];
				}
			}

			omPageName = s.pageName;
			omPageUrl = s.pageURL;
		}

		s.Media.trackVars = this._trackVars;

		// configure Omniture to send tracking information while playing,
		// to deal with cases where people end clips prematurely.
		if (milestones && milestones.length > 0) {
			s.Media.trackWhilePlaying = true;
			s.Media.trackMilestones = milestones;
			s.Media.segmentByMilestones = true;
		} else if (me.frequencyPercent != 0) {
			s.Media.trackWhilePlaying = true;
			var milestone = me.frequencyPercent;
			milestones = "";
			while (milestone < 100) {
				milestones += (milestones.length > 0 ? "," : "") + milestone.toString();
				milestone += me.frequencyPercent;
			}
			s.Media.trackMilestones = milestones;
			s.Media.segmentByMilestones = true;
		} else if (me.frequencySeconds != 0) {
			s.Media.trackWhilePlaying = true;
			s.Media.trackSeconds = me.frequencySeconds;
		}

		if (milestoneEvents && milestones && milestones.split(",").length == milestoneEvents.split(",").length) {
			if (!s.Media.contextDataMapping) s.Media.contextDataMapping = {};
			s.Media.trackUsingContextData = true;
			s.Media.contextDataMapping["a.media.milestones"] = {};
			var milestonesArray = milestones.split(",");
			var milestoneEventsArray = milestoneEvents.split(",");

			for (var i = 0; i < milestonesArray.length; i++) {
				s.Media.contextDataMapping["a.media.milestones"][parseInt(milestonesArray[i])] = milestoneEventsArray[i];
			}
		}

		var VERSION = "1.4";

		tpDebug("*** OmnitureMedia PLUGIN LOADED *** version:[" + VERSION + "]");
		tpDebug("account=[" + s.account + "] visitorNamespace=[" + s.visitorNamespace + "] dc=[" + s.dc + "] pageName=[" + s.pageName + "] pageURL=[" + s.pageURL + "] debug=[" + s.debugTracking + "] frequency=[" + me.frequency + "] host=[" + s.trackingServer + "]");


		// only send unfinished track records if we're not doing tracking while playing
		// note that this will register as a page view, which might overcount things

		// only send unfinished track records if we're not doing tracking while playing
		// note that this will register as a page view, which might overcount things
		if (!me.frequencyPercent && me.frequencySeconds <= 0) {
			tpDebug("Calling track() to send any unclosed sessions");
			s.t();
		}
		me.loadComplete();
	},


	loadComplete: function() {
		var me = this; //need to grab context
		$pdk.controller.addEventListener("OnReleaseStart", function(e) {
			me.onReleaseStart(e)
		});

		$pdk.controller.addEventListener("OnMediaStart", function(e) {
			me.onMediaStart(e)
		});

		$pdk.controller.addEventListener("OnMediaPause", function(e) {
			me.onMediaPause(e)
		});

		$pdk.controller.addEventListener("OnMediaUnpause", function(e) {
			me.onMediaUnpause(e)
		});

		$pdk.controller.addEventListener("OnMediaEnd", function(e) {
			me.onMediaEnd(e)
		});

		$pdk.controller.addEventListener("OnMediaSeek", function(e) {
			me.onMediaSeek(e)
		});

		$pdk.controller.addEventListener("OnMediaPlaying", function(e) {
			me.onMediaPlaying(e)
		});

		$pdk.controller.addEventListener("OnMediaBuffer", function(e) {
			me.onMediaPause(e)
		});

		$pdk.controller.addEventListener("OnMediaPlay", function(e) {
			me.onMediaUnpause(e)
		});

		$pdk.controller.addEventListener(this.OMNITURETRACKINGEVENT, function(e) {
			me.onOmnitureTrackingEvent(e);
		});
	},


	onReleaseStart: function(e) {
		var playlist = e.data;
		this._firstChapter = null;
		this._lastChapter = null;
		this._open = false;

		if (!this._firstChapter && playlist.clips)
		{
			tpDebug("OnReleaseStart: Finding first and last content chapters", "OmnitureMedia");
			for (var i=0; i<playlist.clips.length; i++)
			{
				test = playlist.clips[i];
				if (!test.baseClip.isAd)
				{
					if (!this._firstChapter)
					{
						tpDebug("OnReleaseStart: found first chapter", "OmnitureMedia");
						tpDebug("OnReleaseStart: found last chapter", "OmnitureMedia");
						this._firstChapter = (playlist.clips[i]);
					}
					this._lastChapter = (playlist.clips[i]);
				}
			}
		}

		this.setVars()
	},

	onMediaStart: function(e) {
		var clip = e.data,
			mediaLength = Math.floor((clip.baseClip.trueLength > 0 ? clip.baseClip.trueLength : clip.baseClip.releaseLength) / 1000),
			media = {
				name: this._clipTitle,
				timePlayed: 0,
				event: ""
			},
			test;

		this.setVars();

		this._position = clip.baseClip.clipBegin / 1000;

		if (clip.baseClip.isAd)
		{
			tpDebug("Switching to ad tracking config", "OmnitureMedia");
			this._isAd = true;
		}
		else
		{
			tpDebug("Switching to content tracking config", "OmnitureMedia");
			this._isAd = false;
		}

		this._clipTitle = "undefined";

		if (clip) {
			if (clip.title)
			{
				this._clipTitle = clip.title;
			}
			else if (clip.baseClip.title)
			{
				this._clipTitle = clip.baseClip.title;
			}
			else
			{
				this._clipTitle = (clip.baseClip.isAd ? "Untitled Advertisement" : "Untitled Content");
			}
		}

		if (mediaLength == 0) {
			tpDebug("Couldn't get clip media length");
		}

		if (this._isAd && this._adViewEvent)
		{
			tpDebug("Sending ad view events: " + this._adViewEvent);
			this.trackEvent(this._adViewEvent);
		}
		else if (clip.id == this._firstChapter.id && clip.URL == this._firstChapter.URL && this._open == false)
		{
			this._open = true;
			var mediaLength = Math.floor((clip.baseClip.trueLength > 0 ? clip.baseClip.trueLength : clip.baseClip.releaseLength) / 1000);
			tpDebug("Media.open: chapter=[" + clip.clipIndex + " / " + this._chapters + "] title=[" + this._clipTitle + "] length=[" + mediaLength + "] player=[" + this._player.id + "]", "OmnitureMedia");
			this.siteCatalystInstance.Media.open(this._clipTitle, mediaLength, this._player.id);
            this.siteCatalystInstance.Media.play(this._clipTitle, 0);
		}
		this.onMediaUnpause(e);
	},

	onMediaPlaying: function(e) {
		if (this._isAd) return;

		this.setVars();

		var timeobject = e.data;

		this._position = Math.floor(timeobject.currentTimeAggregate / 1000);
		var timeobject = e.data,
			media = {
				name: this._clipTitle,
				timePlayed: this._position,
				event: ""
			};

		tpDebug("Media.play: title=[" + this._clipTitle + "]  position=[" + this._position + "]");

		try {
			this.siteCatalystInstance.Media.play(this._clipTitle, this._position);
		} catch (e) {}
	},

	onMediaPause: function(e) {

		if (this._isAd) return;

		this.setVars();

		tpDebug("Media.stop: title=[" + this._clipTitle + "]  position=[" + this._position + "]");

		this.siteCatalystInstance.Media.stop(this._clipTitle, this._position);

		this._isPaused = true;

	},


	onMediaUnpause: function(e) {

		if (this._isAd) return;

		this.setVars();

		tpDebug("Media.play: title=[" + this._clipTitle + "]  position=[" + this._position + "]");

		try {
			this.siteCatalystInstance.Media.play(this._clipTitle, this._position);
		} catch (e) {}

		this._isPaused = false;

	},

	onMediaEnd: function(e) {

		this.setVars();

		if (this._isAd && this._adCompleteEvent)
		{
			tpDebug("Sending ad view events: " + this._adCompleteEvent);
			this.trackEvent(this._adCompleteEvent);
			this.clearEvents();
			return;
		}

		var clip = e.data;

		if (!clip || !clip.baseClip) return; // do nothing if we don't have a valid clip
		var clipTitle = !clip.title ? clip.baseClip.title : clip.title;

		if (!clipTitle) return;

		tpDebug("Media.stop: chapter=[" + clip.clipIndex + " / " + this._chapters + "] title=[" + this._clipTitle + "]");
		this.siteCatalystInstance.Media.stop(clipTitle, this._position);

		if (clip.id == this._lastChapter.id && clip.URL == this._lastChapter.URL)
		{
			tpDebug("Media.close: chapter=[" + clip.clipIndex + " / " + this._chapters + "] title=[" + this._clipTitle + "]");
			this.siteCatalystInstance.Media.close(clipTitle);
			this.siteCatalystInstance.Media.track(clipTitle);
		}
	},

	onMediaSeek: function(e) {

		if (this._isAd) return;

		this.setVars();

		var position;
		var seekObj = e.data;
		var clip = seekObj.clip;
		var clipTitle = !clip.title ? clip.baseClip.title : clip.title;

		if (!this._isPaused) {
			if (seekObj.start)
			{
				position = Math.floor(seekObj.start.currentTimeAggregate / 1000);
				tpDebug("Media.stop: (seek start) title=[" + clipTitle + "]  position=[" + position + "]");
				this.siteCatalystInstance.Media.stop(clipTitle, position);
			}

			if (seekObj.end)
			{
				position = Math.floor(seekObj.end.currentTimeAggregate / 1000);
				tpDebug("Media.play: (seek end) title=[" + clipTitle + "]  position=[" + position + "]");
				this.siteCatalystInstance.Media.play(clipTitle, position);
			}
		}

	},

    setVars: function()
	{
		var clip;

		if (this._firstChapter)
		{
			clip = this._firstChapter;
		}
		else
		{
			return;
		}

		this.siteCatalystInstance.Media.trackVars = this._trackVars;

		tpDebug("setting Media tracking vars", "OmnitureMedia");

		var i;

		//Media ID
		if (this._mediaIdVars)
		{
			for (i=0; i<this._mediaIdVars.length; i++)
			{
				tpDebug(" - setting " + this._mediaIdVars[i] + " to " + clip.baseClip.contentID, "OmnitureMedia");
				this.siteCatalystInstance[this._mediaIdVars[i]] = clip.baseClip.contentID;
			}
		}

		// Media GUID
		if (this._mediaGuidVars)
		{
			for (i=0; i<this._mediaGuidVars.length; i++)
			{
				tpDebug(" - setting " + this._mediaGuidVars[i] + " to " + clip.baseClip.guid, "OmnitureMedia");
				this.siteCatalystInstance[this._mediaGuidVars[i]] = clip.baseClip.guid;
			}
		}

		// Categories
		if (this._categoriesVars)
		{
			var cats = "";

			for (i=0; i<clip.baseClip.categories.length; i++)
			{
				cats += (cats.length > 0 ? "," : "") + clip.baseClip.categories[i].name;
			}

			for (i=0; i<this._categoriesVars.length; i++)
			{
				tpDebug(" - setting " + this._categoriesVars[i] + " to " + cats, "OmnitureMedia");
				this.siteCatalystInstance[this._categoriesVars[i]] = cats;
			}
		}
	},

	trackEvent: function(event)
	{
		this.addEvent(event);

		if (!this._useTrackLink)
			this.siteCatalystInstance.track();
		else
			this.siteCatalystInstance.trackLink(this, 'o', event);

		this.removeEvent(event);
	},

	addEvent: function(event)
	{
		this.siteCatalystInstance.events = (this.siteCatalystInstance.events ? this.siteCatalystInstance.events : "").split(",").concat(event).join(",");
	},

	removeEvent: function(event)
	{
		var events = (this.siteCatalystInstance.events ? this.siteCatalystInstance.events : "").split(",");
		var newEvents = [];

		for (var i=0; i<events.length; i++)
		{
			if (events[i] == event || events[i].indexOf(event+"=") == 0)
			{
				// do nothing
			}
			else
			{
				newEvents.push(events[i]);
			}
		}
		this.siteCatalystInstance.events = newEvents.join(",");
	},

	clearEvents: function()
	{
		this.siteCatalystInstance.events = "";
	},

	onOmnitureTrackingEvent: function(e) {
		var props = e.data;

		// copy eVars and props to AppMeasurement object
		for (var prop in props) {
			if (prop.toLowerCase().indexOf("evar") == 0 || prop.toLowerCase().indexOf("prop") == 0) {
				s[prop] = props[prop];
			}
		}

		// copy events
		s.events = props.events;
		tpDebug("Calling track() for custom OmnitureTrackingEvent");
		s.t();
	},

});

//Non-OO stuff

// create an instance of the plugin and tell the controller we're ready.
// optionally you can pass a second param to add to the plugin's layer (any html element)
var omOmniturePlugin;

var omIsPaused;

var omPageName;

var omPageUrl;

//here we dynmically load the script required by omniture (maybe it should be a js module?)
omInitPlugin();

var omniturescriptloaded = false;

function omInitPlugin() {

	//script exists
	if (self.Omniture && self.s) {
		// callBack(loadObj);
		return;
	}

	if (window['useFlashPlayer'] === undefined) {
		//it's gotta be false then..
		window.useFlashPlayer = function() {
			return false;
		};
	}


	//here we dynamically inject the omniture script tag
	if (navigator.appVersion.indexOf('MSIE') >= 0 && useFlashPlayer()) document.write(unescape('%3C') + '\!-' + '-');

	//we create an instance here, after the script is ready
	$pdk.controller.plugInLoaded(new $pdk.plugin.OmniturePlugin());
}


function omGetPageName() {

	if (omPageName) {

		return omPageName;

	} else {

		try {

			return document.title;

		} catch (e) {

			tpDebug("unable to determine page name, JS access not available.");

		}

		return "Unknown";

	}

}


function omGetPageUrl() {

	if (omPageUrl) {

		return omPageUrl;

	} else {

		try {

			return window.location.href;

		} catch (e) {

			tpDebug("unable to determine page url, JS access not available.");

		}

		return "Unknown";

	}

}
