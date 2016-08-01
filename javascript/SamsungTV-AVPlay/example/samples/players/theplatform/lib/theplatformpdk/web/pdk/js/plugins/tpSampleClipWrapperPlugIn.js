SampleClipWrapperPlugIn = Class.extend({

	init: function() {
		this.overlays = document.createElement("div");

	},

	initialize: function(loadObj) {
		var me = this;
		this.controller = loadObj.controller;
		this.controller.registerClipWrapperPlugIn(this);
		this.controller.addEventListener("OnMediaLoadStart", function(){ me.handleMediaLoadStart.apply(me, arguments);});
		this.controller.addEventListener("OnMediaStart", function(){ me.handleMediaStart.apply(me, arguments);});
		this.controller.addEventListener("OnMediaPlaying", function(){ me.handleMediaPlaying.apply(me, arguments);});
		this.controller.addEventListener("OnReleaseStart", function(e){ me.debug(e.data);});

        this.playListener = function() { me.onProxyPlay()};
		this.endListener = function() { me.onProxyEnd();};
        this.pausedListener = function() { me.onPaused(); };

		this.proxy = this.controller.getVideoProxy();
        tpDebug("*** tpSampleClipWrapperPlugIn plugin LOADED! ***");
	},

	wrapClip: function(wrapper) {

		var clip = wrapper.clip;

		this.debug("tpSampleClipWrapperPlugIn.wrapClip")

		if (clip.baseClip.isAd) return false;

		var baseClip = new Object();

		baseClip.URL = "http://www.sample.com/params/more/params/1";
		baseClip.id = "1";
		baseClip.isAd = true;
		baseClip.noSkip = true;
		baseClip.globalDataType = "com.theplatform.pdk.data::BaseClip";

		this.adClip = com.theplatform.pdk.SelectorExported.getInstance(this.controller.scopes.toString()).parseClip(baseClip);
		this.adClip.title = "Advertisement";
		this.adClip.streamType = "empty";

		var baseClip2 = new Object();

		baseClip2.URL = "http://www.sample.com/params/more/params/2";
		baseClip2.id = "2";
		baseClip2.isAd = true;
		baseClip2.noSkip = true;
		baseClip2.globalDataType = "com.theplatform.pdk.data::BaseClip";

		this.adClip2 = com.theplatform.pdk.SelectorExported.getInstance(this.controller.scopes.toString()).parseClip(baseClip2);
		this.adClip2.title = "Advertisement";
		this.adClip2.streamType = "empty";

		var baseClip3 = new Object();

		baseClip3.URL = "http://www.sample.com/params/more/params/3";
		baseClip3.id = "3";
		baseClip3.isAd = true;
		baseClip3.noSkip = true;
		baseClip3.globalDataType = "com.theplatform.pdk.data::BaseClip";

		this.adClip3 = com.theplatform.pdk.SelectorExported.getInstance(this.controller.scopes.toString()).parseClip(baseClip3);
		this.adClip3.title = "Advertisement";
		this.adClip3.streamType = "empty";

		var playlist = new Object();
		playlist.baseClips = new Array();
		playlist.baseClips.push(baseClip);
		playlist.baseClips.push(baseClip2);
		playlist.clips = new Array();
		playlist.clips.push(this.adClip);
		playlist.clips.push(this.adClip2);
		playlist.globalDataType = "com.theplatform.pdk.data::Playlist";

		var playlist2 = new Object();
		playlist2.baseClips = new Array();
		playlist2.baseClips.push(baseClip2);
		playlist2.clips = new Array();
		playlist2.clips.push(this.adClip2);
		playlist2.globalDataType = "com.theplatform.pdk.data::Playlist";

		this.controller.setClipWrapper({clip: clip, preRolls: playlist, postRolls: playlist2});
		return true;
	},

	handleMediaLoadStart: function(event) {
		this.debug("tpSampleClipWrapperPlugIn.handleMediaLoadStart: " + event.data);
		var clip = event.data;
		clearInterval(this.playbackInterval);
		if (clip.streamType == "empty" && clip.baseClip.URL.match(/www.sample.com/)) {
			this.currentClip = clip;
			// we need to tell the PDK we've started, or it will think something went wrong and skip us
			this.beginAdExperience();
		}
	},

	handleMediaStart: function(event) {
		this.debug("tpSampleClipWrapperPlugIn.handleMediaStart: " + event.data);
		var clip = event.data;
		this.currentClip = clip;

		this.hideOverlay();

		if (clip.streamType == "empty" && clip.baseClip.URL.match(/www.sample.com/)) {
			// our clip is starting... do any tracking, etc
		}
		else {
			// another clip is starting
		}
	},

    onPaused: function(e){


	if (isNaN(this.proxy.duration))//chrome will do this, and not always send an end event
	{
		this.onProxyEnd();
		return;
	}


    if (this.proxy.ended||Math.abs(this.proxy.currentTime-this.proxy.duration)<0.25)
        return;

    this.debug("tpSampleVideoProxyPlugIn.onPaused got paused event, sending OnMediaPause");
//        this.proxy.controls = true;
        this.controller.dispatchEvent("OnMediaPause", {globalDataType:"com.theplatform.pdk.data::MediaPause",clip:this.currentClip,userInitiated:false});

        if (!this.playListenerAdded)
        {
            this.proxy.addEventListener("play", this.playListener);
            this.playListenerAdded = true;
        }

        var me = this;
        setTimeout(function(){
            me.controller.dispatchEvent("OnShowPlayOverlay",true);
        },1);




    },

	handleMediaPlaying: function(event) {
		// we don't want to check for overlays on ads
		var clip = this.currentClip;

		if (clip.streamType == "empty" && clip.baseClip.URL.match(/www.sample.com/)) {
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
		this.debug("tpSampleClipWrapperPlugIn.beginAdExperience");
		// show the overlays layer
		this.overlays.style.display = "";

		var me = this;
		this.proxy.src = "http://test.theplatform.com.edgesuite.net/PDK_(VMS)/257/131/Midh264_720p11sec.mp4";

		//disables the controls because this is an ad
		this.proxy.controls = false;
		this.proxy.load();

		this.simulateClick(function() { me.proxy.play(); });
		this.addListeners(this.proxy);

        setTimeout(function(){

            if (!me.proxy.currentTime&&me.proxy.paused===false&&me.seekable&&me.seekable.length&&me.seekable.end(0))
            {
                me.debug("tpSampleClipWrapperPlugIn.beginAdExperience Video must have stalled out so we'll try to get it going again");
                me.proxy.load();
                me.proxy.play();
            }
            else if (me.proxy.error)
            {
                me.debug("tpSampleClipWrapperPlugIn.beginAdExperience Video tag has an error, let's move on");
                me.onProxyEnd();
            }
            else
            {
                me.debug("tpSampleClipWrapperPlugIn.beginAdExperience video must have started successfully");
            }
        },4000);

		// our sample has a hard coded duration of 3 seconds, so we'll call done then
		me.duration = 10000;
		me.currentTime = 0;
		//setTimeout(function() { me.done(); }, 10000);
	},

	onProxyPlay: function(e) {
		this.debug("tpSampleClipWrapperPlugIn.onProxyPlay");
		// NOTE: dispatching this is very important... otherwise the PDK will assume there's a problem with our clip and move on!
		this.proxy.removeEventListener("play", this.playListener);
        this.playListenerAdded = false;
		this.controller.dispatchEvent("OnMediaStart", this.currentClip);

        var me = this;
        setTimeout(function(){
            me.controller.dispatchEvent("OnShowPlayOverlay",false);
        },1);





		var me = this;
		// we want to initialize the time display to 0
		this.mediaPlaying();
		// and then update it every 1/3 of a second, so other components know how far we are into the ad.
	  	clearInterval(this.playbackInterval);
		this.playbackInterval = setInterval(function() {me.mediaPlaying();}, 333)
	},


	onProxyEnd: function(e) {
		this.debug("tpSampleClipWrapperPlugIn.onProxyEnd");
		this.proxy.removeEventListener("ended", this.endListener);
		//normally you'd call done() here, but we call it after 10 seconds in the sample, so the ads aren't too long.
		this.done();
	},

	mediaPlaying: function() {
		this.duration = this.proxy.duration * 1000;
		//don't do this anymore, pdk will dispatch it...
		this.controller.dispatchEvent("OnMediaPlaying", {currentTime: this.proxy.currentTime*1000, duration: this.duration});

		if (Math.abs(this.proxy.currentTime - this.proxy.duration)<0.05)
		{
			this.done();
		}

		this.currentTime+=333;
	},

	done: function() {
		this.debug("tpSampleClipWrapperPlugIn.done");
		clearInterval(this.playbackInterval);

		// IMPORTANT!!! if we don't do this things will break!
		this.removeListeners(this.proxy);

		this.overlays.style.display = "none";

		// NOTE: dispatching this is very important... otherwise the PDK will assume there's a problem with our clip and wait 10 seconds for us to recover!
		this.controller.endMedia();
//		this.proxy.pause();

	},

	addListeners: function(p) {
		this.debug("tpSampleClipWrapperPlugIn.addListeners");
		var me = this;
		p.addEventListener("play", this.playListener);
   		p.addEventListener("pause", this.pausedListener);
		p.addEventListener("ended", this.endListener);
		p.addEventListener("error", this.endListener);
	},

	removeListeners: function(p) {
		this.debug("tpSampleClipWrapperPlugIn.removeListeners");
		p.removeEventListener("play", this.playListener);
        p.removeEventListener("pause", this.pausedListener);
		p.removeEventListener("ended", this.endListener);
   		p.removeEventListener("error", this.endListener);
	},

	simulateClick: function(callback)
	{
		this.debug("tpSampleClipWraperPlugIn.simulateClick");
		var a = document.createElement("a");
		a.id = "clickSimulator";
		a.href="#";

		document.body.appendChild(a);

        a.addEventListener('click', function(e)
        {
			e.preventDefault();
			callback();
        }, false);

		var evt;

		if (document.createEvent) {
		    evt = document.createEvent("MouseEvents");
		    if (evt.initMouseEvent) {
		        evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		        a.dispatchEvent(evt);
		    }
		}

		document.body.removeChild(a)
	},

	debug: function(x) {
	    tpDebug(x);
        // if (self.console) console.log(x);
	}

});

// create an instance of teh plugin and tell the controller we're ready.
// optionally you can pass a second param to add to the plugin's overlay layer (any html element)
var clipWrapperPlugIn = new SampleClipWrapperPlugIn();
$pdk.controller.plugInLoaded(clipWrapperPlugIn, clipWrapperPlugIn.overlays);
