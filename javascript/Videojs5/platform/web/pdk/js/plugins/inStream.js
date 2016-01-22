$pdk.ns("$pdk.plugin.doubleclick");
$pdk.plugin.doubleclick = $pdk.extend(function(){},
{
	VERSION : "1.0",
	_callback : "tpDCLoaded",
	_dcUrl : null,
	_dcJavaScriptUrl : null,
	_adsLoader: null,
	_hosts: null,
	_type: null,
	_loaded: false,

	constructor : function()
	{
       	tpDebug("DoubleClick Plugin instantiated.", "-", "DoubleClick", tpConsts.INFO);
		this.overlays = document.createElement("div");
		this.overlays.style.display = "none";
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

		tpDebug("DoubleClick Plugin loading: " + this._controller.id, "DoubleClick", tpConsts.INFO);

        this._controller.registerAdPlugIn(this);

        var hosts = lo.vars["hosts"]; // could be array or string
        var host = lo.vars["host"];
        if (hosts && hosts.length)
        {
            this._hosts = hosts.split(",");
        }
		else if (host && host.length)
		{
			this._hosts = [host];
		}
        else
        {
            tpDebug("No hosts parameter, using mime-type for ad recognition", this._controller.id, "DoubleClick", tpConsts.INFO);
            //return;
        }

		if (lo.vars["jsUrl"])
		{
			this._dcJavaScriptUrl = lo.vars["jsUrl"];
		}
		else
		{
			// this url is ghetto... google updates it all the time...
			this._dcJavaScriptUrl = "http://www.google.com/uds/api/ima/1.8/84479ae78e2ae96fc191dae83ffb2033/default.IN.js";
		}

		if (lo.vars["type"])
		{
			this._type = lo.vars["type"];
		}

		var that = this;
		tpLoadScript(this._dcJavaScriptUrl, function(scriptFileName) { that.onIMASDKLoaded(); } );

		tpDebug("Derived javascript URL to be : " + this._dcJavaScriptUrl, this._controller.id, "DoubleClick", tpConsts.INFO);

		tpDebug("*** DoubleClick PLUGIN LOADED *** version:[" + this.VERSION + "]", this._controller.id, "DoubleClick", tpConsts.INFO);
	},

	onOverlayAreaChanged: function(e)
	{
 		this.overlays.style.position = "absolute";
 		this.overlays.style.zIndex = "1000";
 		this.overlays.style.borderStyle = "solid";
		this.overlays.style.borderColor = "transparent";
		this.overlays.style.borderTopWidth = (e.data.top) + "px";
		this.overlays.style.borderLeftWidth = (e.data.left) + "px";
		this.overlays.style.width = (e.data.width) + "px";
		this.overlays.style.height = (e.data.height) + "px";
		this.overlays.style['pointer-events']="none";
	},

	// onGoogleCommonLoader: function()
	// {
	// 	var me = this;
	// 	google.setOnLoadCallback(function() { me.onIMASDKLoaded(); });
	// 	google.load("ima", "1");
	// },

	onIMASDKLoaded: function()
	{
		this._loaded = true;

		var player = null;
		var that = this;

		this._controller.addEventListener("OnOverlayAreaChanged", function() { that.onOverlayAreaChanged.apply(that, arguments); });
		this._controller.addEventListener("OnMediaAreaChanged", function() { that.onOverlayAreaChanged.apply(that, arguments); });
		this._controller.addEventListener("OnLoadRelease", function() { that.onLoadRelease.apply(that, arguments); });
		this._controller.addEventListener("OnLoadReleaseUrl", function() { that.onLoadRelease.apply(that, arguments); });
		this.onOverlayAreaChanged({data: this._controller.getOverlayArea()});

		player = document.getElementById(this._controller.id);
		player.insertBefore(this.overlays, player.firstChild);

        this.playListener = function() { me.onProxyPlay()};
        this.endListener = function() { me.onProxyEnd()}
        this.pauseListener = function() { me.onProxyPause()}

		var me = this;

		this._controller.addEventListener("OnMediaLoadStart", function(){ me.onMediaLoadStart.apply(me, arguments);});
		this._controller.addEventListener("OnMediaStart", function(){ me.onMediaStart.apply(me, arguments);});
		this._controller.addEventListener("OnMediaEnd", function(){ me.onMediaEnd.apply(me, arguments);});
		this._controller.addEventListener("OnMediaPlaying", function(){ me.onMediaPlaying.apply(me, arguments);});

	   	this._adsLoader = new google.ima.AdsLoader();

		this._adsLoader.addEventListener(
		    	google.ima.AdsLoadedEvent.Type.ADS_LOADED,
		    	function() { me.onAdsLoaded.apply(me, arguments); },
		    	false);

		this._adsLoader.addEventListener(
		    	google.ima.AdErrorEvent.Type.AD_ERROR,
		    	function() { me.onAdError.apply(me,arguments);},
		    	false);

		if (this._currentClip)
		{
			this.onMediaLoadStart({data: this._currentClip});
		}
	},

	onAdsLoaded: function(e)
	{
		var me = this;

        tpDebug("onAdsLoaded", this._controller.id, "DoubleClick", tpConsts.INFO);

		this._adsManager = e.getAdsManager();

		this._adsManager.addEventListener(
		    	google.ima.AdErrorEvent.Type.AD_ERROR,
		    	function() { me.onAdError.apply(me,arguments);},
		    	false);

		if (this._adsManager.getType() == "video")
		{
			this.handleVideoAd();
		}
		else if (this._adsManager.getType() == "overlay")
		{
			this.handleOverlayAd();
		}
		else
		{
	        tpDebug("Unknown ad type: " + this._adsManager.getType(), this._controller.id, "DoubleClick", tpConsts.INFO);
		}
	},

	handleVideoAd: function()
	{
		var me = this;

		if (this.proxy)
		{
			this.removeListeners(this.proxy);
		}

		this.proxy = this._controller.getVideoProxy();
        this.proxy.controls = false;
		this.addListeners(this.proxy);

		this._adsManager.addEventListener(
		    	google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
		    	function() { me.onContentPauseRequested.apply(me, arguments); },
		    	false);

		this._adsManager.addEventListener(
		    	google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
		    	function() { me.onContentResumeRequested.apply(me, arguments); },
		    	false);

		// TODO: put video proxy in here
		this._adsManager.setClickTrackingElement(this.proxy.parentNode);

		try
		{
			this._adsManager.play(this.proxy, {restoreContentState: false});
		}
		catch (adError)
		{
	        tpDebug(adError.getError(), this._controller.id, "DoubleClick", tpConsts.ERROR);
		}
	},

	handleOverlayAd: function()
	{
		// resize the overlay area
		this.onOverlayAreaChanged({data: this._controller.getOverlayArea()});

		// stop the clip we created to get here...
		this._controller.endMedia();

		// Set the ad slot size.
	    this._adsManager.setAdSlotWidth(this._controller.getOverlayArea().width - 10);
	    this._adsManager.setAdSlotHeight(this._controller.getOverlayArea().height - 10);
	    // Set Alignment
	    this._adsManager.setHorizontalAlignment(google.ima.AdSlotAlignment.HorizontalAlignment.CENTER);
	    this._adsManager.setVerticalAlignment(google.ima.AdSlotAlignment.VerticalAlignment.BOTTOM);
		// show the overlay div...
		this.overlays.style.display = null;
	    this._adsManager.play(this.overlays);
	},

	onAdError: function(e)
	{
        tpDebug("Error: " + e, this._controller.id, "DoubleClick", tpConsts.INFO);
		this.done();
	},

	onContentPauseRequested: function(e)
	{
		// i think this doesn't need to do anything, because PDK rocks!
        tpDebug("onContentPauseRequested", this._controller.id, "DoubleClick", tpConsts.INFO);
	},

	onContentResumeRequested: function(e)
	{
		// i think this doesn't need to do anything, because PDK rocks!
        tpDebug("onContentResumeRequested", this._controller.id, "DoubleClick", tpConsts.INFO);
	},

    isAd:function(bc)
    {
        return (this.isDoubleClickUrl(bc.URL) || this.isDoubleClickUrl(bc.baseURL));
    },

    checkAd:function(clip)
    {
        var isHandled = (clip.streamType != "empty") && (!clip.mediaLength || clip.mediaLength <= 0) && (this.isDoubleClickUrl(clip.baseClip.URL) || clip.baseClip.type=="application/vast+xml");
		var me = this;

        if (isHandled)
        {
			setTimeout(function () { me.beginAdExperience(clip); }, 100);
		}

        tpDebug("checkAd: " + isHandled, this._controller.id, "DoubleClick", tpConsts.INFO);
        return isHandled;
    },

    isDoubleClickUrl:function(checkURL)
    {
        if (!checkURL||!this._hosts||this._hosts.length===0) return false;
        for (var i = 0; i < this._hosts.length; i++)
        {
            if (checkURL.match(this._hosts[i]))
            {
                return true;
            }
        }
        return false;
    },

	beginAdExperience: function(clip) {
		tpDebug("DoubleClick.beginAdExperience", this._controller.id, "DoubleClick", tpConsts.INFO);

		var playlist = {baseClips: [], clips: [], globalDataType:"com.theplatform.pdk.data::Playlist"};
		if (clip.baseClip.URL)
		{
			var bc = {}
	        bc.isAd = clip.baseClip.isAd;
	        bc.noSkip = clip.baseClip.noSkip;
	        bc.title = clip.baseClip.title;
			bc.URL = clip.baseClip.URL;
	//        bc.overlays = {}
			bc.globalDataType = "com.theplatform.pdk.data::BaseClip";
			//TODO: we should
			var clip2 = com.theplatform.pdk.SelectorExported.getInstance(this._controller.scopes.toString()).parseClip(bc);
	        clip2.streamType = "empty";
	        clip2.title = clip.title;

			playlist.clips.push(clip2);
	        playlist.baseClips.push(bc);
		}
        this._paused = false;
		this._controller.setAds(playlist);
	},

	onLoadRelease: function(e)
	{
		// hide the overlay div, so the play overlay is clickable
		this.overlays.style.display = "none";
	},

	onMediaLoadStart: function(e)
	{
		var clip = e.data;

		if (clip.streamType == "empty" && this.isDoubleClickUrl(clip.baseClip.URL))
		{
			this._currentClip = clip;
			if (this._loaded)
			{
				// Make request
				var adsRequest = {
				  adTagUrl: e.data.baseClip.URL,
				  adType: "video"
				};
				if (this._type)
				{
					this._adsLoader.requestAds(adsRequest, this._type);
				}
				else
				{
					this._adsLoader.requestAds(adsRequest);
				}
			}
		}
	},

	onMediaStart: function(e)
	{
	},

	onMediaPlaying: function(e)
	{
		var timeObj = e.data;
		var percentComplete = (timeObj.percentCompleteAggregate > 0) ? timeObj.percentCompleteAggregate : timeObj.percentComplete;
	},

	onMediaEnd: function(e)
	{
		this.overlays.innerHTML = "";
	},

	onProxyPause: function(e){

		this._paused = true;
		clearInterval(this._playbackInterval);
        var mediaPause = {globalDataType: "com.theplatform.pdk.data::MediaPause", clip: this._currentClip, userInitiated: true}
		this._controller.dispatchEvent("OnMediaPause", mediaPause);

		this.proxy.addEventListener("play", this.playListener);

	},

	onProxyPlay: function(e) {
		tpDebug("DoubleClick.onProxyPlay", this._controller.id, "DoubleClick", tpConsts.INFO);
		// NOTE: dispatching this is very important... otherwise the PDK will assume there's a problem with our clip and move on!
		this.proxy.removeEventListener("play", this.playListener);
		if (!this._paused)
			this._controller.dispatchEvent("OnMediaStart", this._currentClip);
		else
			this._controller.dispatchEvent("OnMediaUnPause", this._currentClip);

		this._paused = false;

		var me = this;
		// we want to initialize the time display to 0
		this.mediaPlaying();
		// and then update it every 1/3 of a second, so other components know how far we are into the ad.
		clearInterval(this._playbackInterval);
		this._playbackInterval = setInterval(function() {me.mediaPlaying();}, 333)
	},

	onProxyEnd: function(e) {
		tpDebug("DoubleClick.onProxyEnd", this._controller.id, "DoubleClick", tpConsts.INFO);
		this.proxy.removeEventListener("ended", this.endListener);
		//normally you'd call done() here, but we call it after 10 seconds in the sample, so the ads aren't too long.
		this.done();
	},

	mediaPlaying: function() {
   		this._currentTime=this.proxy.currentTime*1000;

		this._controller.dispatchEvent("OnMediaPlaying", {currentTime: this._currentTime, duration: this.proxy.duration*1000});
	},

	done: function() {
		tpDebug("DoubleClick.done", this._controller.id, "DoubleClick", tpConsts.INFO);
		clearInterval(this._playbackInterval);

		// IMPORTANT!!! if we don't do this things will break!
		if (this.proxy)
			this.removeListeners(this.proxy);

		// NOTE: dispatching this is very important... otherwise the PDK will assume there's a problem with our clip and wait 10 seconds for us to recover!
		this._controller.endMedia();

		//there's no need for this, as far as i'm aware...(why pause when it told us it's over already?)
		//this.proxy.pause();

	},

	addListeners: function(p) {
		var me = this;
		p.addEventListener("play", this.playListener);
		p.addEventListener("ended", this.endListener);
		p.addEventListener("pause", this.pauseListener);
	},

	removeListeners: function(p) {
		p.removeEventListener("play", this.playListener);
		p.removeEventListener("ended", this.endListener);
		p.removeEventListener("pause", this.pauseListener);
	}

});

$pdk.controller.plugInLoaded(new $pdk.plugin.doubleclick(), null); //doubleclickPlugIn.overlays);
