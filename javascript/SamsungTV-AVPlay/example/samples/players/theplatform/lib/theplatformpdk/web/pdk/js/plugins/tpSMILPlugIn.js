SMILPlugIn = Class.extend({

	init: function() {
	},

	initialize: function(loadObj) {
		this.controller = loadObj.controller;
		this.controller.registerAdPlugIn(this);
		this.hostsArray = new Array();

		if (loadObj.vars && loadObj.vars["hosts"]) {
			this.hostsArray = loadObj.vars["hosts"].split(",");
		}
        tpDebug("*** tpSMILPlugIn plugin LOADED! ***");
	},

	isAd: function(clip) {

		var baseClip = clip.baseClip;

		if (baseClip.type == "text/xml" || baseClip.type == "application/smil" || baseClip.type == "application/smil+xml")
			return true;
		else if (baseClip.type == "video/mp4"||baseClip.type == "video/mpeg"||baseClip.type == "video/webm"||baseClip.type == "video/ogg"||baseClip.type == "video/x-flv"||baseClip.type == "video/m3u8")
			return false;
		else
			return this.isExternalSmilURL(clip.URL);
	},

	isExternalSmilURL: function(checkURL)
	{
		var EXTERNAL_FLAVORS = [	"247realmedia.com",
									"release.theplatform.com",
									"link.theplatform.com",
									"ad.doubleclick.net",
									"search.spotxchange.com",
									"view.atdmt.com"];

		var isExternal = false;

		for (var i=0; i<EXTERNAL_FLAVORS.length; i++) {
			if (checkURL.indexOf(EXTERNAL_FLAVORS[i]) >= 0)
				isExternal = true;
		}

		if (!isExternal && this.hostsArray.length > 0) {
			for (i=0; i<this.hostsArray.length; i++) {
				if (checkURL.indexOf(this.hostsArray[i]) >= 0)
					isExternal = true;
			}
		}

		return isExternal;
	},

	checkAd: function(clip) {
		if (!clip.URL)
			return false; // BAIL - we have no URL

		this.currentClip = clip;

		var baseClip = clip.baseClip;

		var isHandled = false;
		if (!this.isExternalSmilURL(clip.URL) && clip.baseClip.type != "text/xml")
		{
			// not SMIL! SMIL needs release.theplatform or a specified ad provider
//			_controller.trace("clip \"" + clip.URL + "\" of type \"" + clip.baseClip.type + "\" is not a registered SMIL reference", "SMIL", Debug.INFO);
		}
		else if (baseClip.type == "video/mp4"||baseClip.type == "video/mpeg"||baseClip.type == "video/webm"||baseClip.type == "video/ogg"||baseClip.type == "video/x-flv"||baseClip.type == "video/m3u8")
		{
			return false;
		}
		else
		{
			var url = this.findPOS(clip);
			var me = this;
			var loader = new XMLLoader();
			loader.init("application/xml");
			loader.load(url, function(xml) {me.smil(xml,clip);}, function(){me.onError();});
			isHandled = true;
		}
		return isHandled;
	},

	onError: function(){

		tpDebug("Error loading SMIL");

		this.currentClip.hasPlayed = true;

		 var pbe = { location:this.id, context:null,clip:this.currentClip,endRelease:!this.currentClip.baseClip.isAd,
                    message:"The ad SMIL cannot be loaded", friendlyMessage:"he ad SMIL cannot be loaded",
                    globalDataType:"com.theplatform.pdk.data::PlaybackError" };

		// this.controller.setAds(null);
		this.controller.sendError(pbe);

	},

	findPOS: function(clip)
	{
		var url = clip.URL;
		var posRegEx = /POS|<position>|{position}/;
		if (url.match(posRegEx))
		{
			var position = 1;
			if (clip.clipIndex > 0)//if the position == 0, then it must be the first, otherwise check
			{
				var pl = clip.playlistRef;
				for (var i = 0; i < clip.playlistRef.indexOf(clip); i++)
				{
					if (pl[i].isAd)
					{
						position++;
					}
				}
			}
			url = url.replace(posRegEx, position);
		}
		return url;
	},

	smil: function(xml, clip)
    {
		var parser = com.theplatform.pdk.SelectorExported.getInstance(this.controller.scopes.toString());
		var playlist = parser.parsePlaylist(xml,this.releaseUrl);

		var i=0;
		var len = playlist.clips.length;
		for (;i<len;i++)
		{
			playlist.clips[i].baseClip.isAd = clip.baseClip.isAd;
			playlist.clips[i].baseClip.noSkip = clip.baseClip.noSkip;
			this.controller.updateClip(playlist.clips[i]);
			clip.hasPlayed = true;
			this.controller.updateClip(clip);

		}

		this.controller.updatePlaylist(playlist);

		this.controller.setAds(playlist);
	}

});

$pdk.controller.plugInLoaded(new SMILPlugIn());
