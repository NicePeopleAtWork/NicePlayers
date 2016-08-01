SampleVideoProxyPlugIn = Class.extend({

	init: function() {
		this.overlays = document.createElement("div");
 		var v = document.createElement("video");

		this.adUrl = null;

		if (v.canPlayType('video/mp4'))
		{
			this.adUrl = "http://test.theplatform.com.edgesuite.net/PDK_(VMS)/257/131/Midh264_720p11sec.mp4";
		}
		else if (v.canPlayType('video/ogg'))
		{
			this.adUrl = "http://test.theplatform.com.edgesuite.net/PDK_(VMS)/261/534/Ad_VidoProxyPlugIn.ogg";
		}
	},

	initialize: function(loadObj) {
		var me = this;
		this.controller = loadObj.controller;
        this.controller.registerAdPlugIn(this);
		this.controller.addEventListener("OnMediaLoadStart", function(){ me.handleMediaLoadStart.apply(me, arguments);});
		this.controller.addEventListener("OnMediaStart", function(){ me.handleMediaStart.apply(me, arguments);});
		this.controller.addEventListener("OnMediaEnd", function(){ me.handleMediaEnd.apply(me, arguments);});
		this.controller.addEventListener("OnMediaPlaying", function(){ me.handleMediaPlaying.apply(me, arguments);});
		this.controller.addEventListener("OnReleaseStart", function(e){ me.debug(e.data);});

        this.playListener = function() { me.onProxyPlay()};
        this.endListener = function() { me.onProxyEnd()}
        this.pauseListener = function() { me.onProxyPause()}

		this.proxy = this.controller.getVideoProxy();
		this.debug("proxy: " + this.proxy)
        tpDebug("*** tpSampleVideoProxyPlugIn plugin LOADED! ***");
	},

	isAd: function(baseClip) {
		this.debug("tpSampleVideoProxyPlugIn.isAd");
		return baseClip.URL.match(/ads.sample.com\/xml/);
	},

	checkAd: function(clip) {
		this.debug("tpSampleVideoProxyPlugIn.checkAd: " + clip.baseClip.URL);
		var me = this;

		clearInterval(this.playbackInterval);
		if (clip.baseClip.URL.match(/ads.sample.com\/xml/)) {
			// we need to set this to use the VideoProxy
			clip.streamType = "empty";
			this.currentClip = clip;



			// doing this asynchronously to simulate downloading some ad server payload...
			setTimeout(function () { me.beginAdExperience(); }, 100);

            this.debug("tpSampleVideoProxyPlugIn.checkAd: Returning true");
			return true;
		}

            this.debug("tpSampleVideoProxyPlugIn.checkAd: Returning false");
		return false;
	},

	handleMediaLoadStart: function(event) {
		var clip = event.data;

		this.debug("tpSampleVideoProxyPlugIn: handleMediaLoadStart");
		this.debug(event);
		if (clip.streamType == "empty" && clip.baseClip.URL.match(/ads.sample.com\/clip/))
		{
			var me = this;
			this.addListeners(this.proxy);

            this.debug("Setting src to "+this.adUrl);

			this.proxy.src = this.adUrl;
            this.proxy.controls = false;
            this.proxy.load();
			this.proxy.play();

			// our sample has a hard coded duration of 3 seconds, so we'll call done then
			me.duration = 4000;
			me.currentTime = 0;
		}
	},

	handleMediaStart: function(event) {
		this.debug("tpSampleVideoProxyPlugIn.handleMediaStart: " + event.data);
		var clip = event.data;
		this.currentClip = clip;

		this.hideOverlay();

		if (clip.streamType == "empty" && clip.baseClip.URL.match(/ads.sample.com/)) {
			// our clip is starting... do any tracking, etc
		}
		else {
			// another clip is starting
		}
	},

	handleMediaEnd: function(event) {
		this.debug("tpSampleVideoProxyPlugIn.handleMediaEnd: " + event.data.baseClip.URL);
	},

	handleMediaPlaying: function(event) {
		// we don't want to check for overlays on ads
		var clip = this.currentClip;

		if (clip.streamType == "empty" && clip.baseClip.URL.match(/ads.sample.com\/clip/)) {
			// our ad clip is playing...
		}
		else if (!clip.baseClip.isAd){
			// the content is playing...
			if (event.data.currentTime >= (event.data.duration/2)) {
				this.showOverlay();
			}
		}

	},

	showOverlay: function() {
		this.overlays.innerHTML = "Sample Ad Overlay";
		this.overlays.style.textAlign = "center";
		this.overlays.style.lineHeight = "100px";
		this.overlays.style.position = "absolute";
		this.overlays.style.top = "0px";
		this.overlays.style.left = "0px";
		this.overlays.style.width = "100%";
		this.overlays.style.height = "100%";
		this.overlays.style.background = "red";
		this.overlays.style.color = "white";
		this.overlays.style.display = "";
	},

	hideOverlay: function() {
		this.overlays.innerHTML = "";
		this.overlays.style.display = "none";
	},

	beginAdExperience: function() {
		this.debug("tpSampleVideoProxyPlugIn.beginAdExperience");
		// show the overlays layer
		this.overlays.style.display = "";

		var playlist = {baseClips: [], clips: [], globalDataType:"com.theplatform.pdk.data::Playlist"};
		if (this.adUrl)
		{
			var bc = {}
	        bc.isAd = true;
	        bc.noSkip = true;
			bc.URL = "http://ads.sample.com/clip/some/params/";
	//        bc.overlays = {}
			bc.globalDataType = "com.theplatform.pdk.data::BaseClip";
			//TODO: we should
			var clip = com.theplatform.pdk.SelectorExported.getInstance(this.controller.scopes.toString()).parseClip(bc);
	        clip.title = "Advertisement";
	        clip.streamType = "empty";

			playlist.clips.push(clip);
	        playlist.baseClips.push(bc);

	        this.proxy.controls = false;
		}

		this.controller.setAds(playlist);
	},

	onProxyPause: function(e){

		this.paused = true;
		clearInterval(this.playbackInterval);
        var mediaPause = {globalDataType: "com.theplatform.pdk.data::MediaPause", clip: this.currentClip, userInitiated: false}
		this.controller.dispatchEvent("OnMediaPause", mediaPause);

		this.proxy.addEventListener("play", this.playListener);

		if (isNaN(this.proxy.duration))//chrome will do this, and not always send an end event
			this.onProxyEnd();

	},

	onProxyPlay: function(e) {
		this.debug("tpSampleVideoProxyPlugIn.onProxyPlay");
		// NOTE: dispatching this is very important... otherwise the PDK will assume there's a problem with our clip and move on!
		this.proxy.removeEventListener("play", this.playListener);
		if (!this.paused)
			this.controller.dispatchEvent("OnMediaStart", this.currentClip);
		else
			this.controller.dispatchEvent("OnMediaUnPause", this.currentClip);

		this.paused = false;

		var me = this;
		// we want to initialize the time display to 0
		this.mediaPlaying();
		// and then update it every 1/3 of a second, so other components know how far we are into the ad.
		clearInterval(this.playbackInterval);
		this.playbackInterval = setInterval(function() {me.mediaPlaying();}, 333)
	},

	onProxyEnd: function(e) {
		this.debug("tpSampleVideoProxyPlugIn.onProxyEnd");
		this.proxy.removeEventListener("ended", this.endListener);
		this.paused = false;
		//normally you'd call done() here, but we call it after 10 seconds in the sample, so the ads aren't too long.
		this.done();
	},

	mediaPlaying: function() {
   		this.currentTime=this.proxy.currentTime*1000;

		this.controller.dispatchEvent("OnMediaPlaying", {currentTime: this.currentTime, duration: this.proxy.duration*1000});
	},

	done: function() {
		this.debug("tpSampleVideoProxyPlugIn.done");
		clearInterval(this.playbackInterval);

		// IMPORTANT!!! if we don't do this things will break!
		this.removeListeners(this.proxy);

		this.overlays.style.display = "none";

		// NOTE: dispatching this is very important... otherwise the PDK will assume there's a problem with our clip and wait 10 seconds for us to recover!
		this.controller.endMedia();

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
	},

	debug: function(x) {
		if (self.console) console.log(x);
	}

});

// create an instance of teh plugin and tell the controller we're ready.
// optionally you can pass a second param to add to the plugin's overlay layer (any html element)
var videoProxyPlugIn = new SampleVideoProxyPlugIn();
$pdk.controller.plugInLoaded(videoProxyPlugIn, videoProxyPlugIn.overlays);
