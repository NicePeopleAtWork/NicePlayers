/*
 * YouboraPlugin
 * Copyright (c) 2015 NicePeopleAtWork
 */

// TODO: Don't recieve the Play event for FLASH
// TODO: Micro buffer inicial cuando se hace un seek (En HLS Flash)
// TODO: Need to know if is a PreAds, MidAds o PostAds
// TODO: New events like adsCompleted, adsPlay???? Is no in the EventList

function loadJavascriptFile(url, callback) {
	try {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		script.onreadystatechange = callback;
		script.onload = callback;
		head.appendChild(script);
	} catch (error) {
		if (this.youboraData.debug) {
			console.log(error);
		}
	}
}

var YouboraPluginAnalyticsEvents = {
	BUFFER_BEGIN: 1,
	BUFFER_END: 0,
	JOIN_SEND: 2,
	ADS_BEGIN: 3,
	ADS_END: 4
};

var YouboraPluginError = {
	'network': "4000",
	'generic': "4001",
	'geo': "4002",
	'domain': "4003",
	'future': "4004",
	'past': "4005",
	'device': "4006",
	'concurrentStreams': "4007",
	'invalidHeartbeat': "4008",
	'contentTree': "4009",
	'metadata': "4010",
	'generic': "4011",
	'stream': "4012",
	'livestream': "4013",
	'network': "4014",
	'unplayableContent': "4015",
	'invalidExternalId': "4016",
	'emptyChannel': "4017",
	'emptyChannelSet': "4018",
	'channelContent': "4019",
	'streamPlayFailed': "4020",
	'adobePassAuthenticate': "4021",
	'adobePassToken': "4022",
	'accountDisabled': "4023",
	'adobePassAssetNotAuthenticated': "4024",
	'adobePassLibraryNotDefined': "4025",
	'adobePassRequireJavascript': "4026",
	'adobePassUserNotAuthorized': "4027",
	'afterFlightTime': "4028",
	'apiDynamicAdSetIsNotEnabledForProvider': "4029",
	'apiExpirationInPast': "4030",
	'apiExpirationNotInWholeHours': "4031",
	'apiExpirationTooFarInFuture': "4032",
	'apiInvalidDynamicAdSetAssignment': "4033",
	'apiInvalidAdSetCode': "4034",
	'apiStandaloneAdSetIsEmpty': "4035",
	'badResponse': "4036",
	'badSecureStreamingResponse': "4037",
	'beforeFlightTime': "4038",
	'cannotContactSas': "4039",
	'cannotContactServer': "4040",
	'cannotDownloadThirdPartyModule': "4041",
	'cannotFetchPayPerCiewStatus': "4042",
	'cannotFetchSecureStreamingToken': "4043",
	'cannotParsePayPerViewStatusResponse': "4044",
	'cannotRetrieveDomain': "4045",
	'cannotSecurelyStreamVideo': "4046",
	'contentOverCap': "4047",
	'contentUnavailable': "4048",
	'corruptedNetstream': "4049",
	'apiDynamicAdSetIsNotEnabledForProvider': "4050",
	'flashAccessLicenseUnavailable': "4051",
	'internalError': "4052",
	'internalPlayerError': "4053",
	'invalidApiUsage': "4054",
	'invalidContent': "4055",
	'invalidCcontentSegment': "4056",
	'invalidDynamicAdSetAssignment': "4057",
	'invalidDynamicAdSetCode': "4058",
	'invalidDynamicChannelUsage': "4059",
	'invalidFlashAccessLicense': "4060",
	'invalidResponse': "4061",
	'invalidSasResponse': "4062",
	'invalidServerResponse': "4063",
	'invalidToken': "4064",
	'liveStreamNotFound': "4065",
	'liveStreamFinished': "4066",
	'liveStreamFinishedTitle': "4067",
	'liveStreamUnavailable': "4068",
	'liveStreamUnavailableAfterPayment': "4069",
	'longBeforeFlightTime': "4070",
	'lostConnection': "4071",
	'noConnectionPlayer': "4072'",
	'noConnectionVideo': "4073",
	'noMovieSpecifiedForLabels': "4074",
	'noQueryStringCode': "4075",
	'ppvAlreadyPaid': "4076",
	'ppvCancelPurchase': "4077",
	'ppvChangeMind': "4078",
	'ppvCheckoutError': "4079",
	'ppvDefaultMessage': "4080",
	'ppvIsExpired': "4081",
	'ppvNeedsToPay': "4082",
	'ppvNeedsToPayAtStart': "4083",
	'ppvNoMorePlaysToday': "4084",
	'ppvPrepurchase': "4085",
	'ppvPrepurchaseThankYou': "4086",
	'ppvPurchaseInProgress': "4087",
	'ppvSupportMessage': "4088",
	'ppvViewUnauthorized': "4089",
	'ppvWatchVideo': "4090",
	'processingContent': "4091",
	'proxyClassesDontWork': "4092",
	'removedContent': "4093",
	'sasAuthFailed': "4094",
	'sasHeartbeatFailed': "4095",
	'sasTooManyActiveStreams': "4096",
	'secureStreamingAuthFailed': "4097",
	'standaloneAdSetIsEmpty': "4098",
	'streamFileNotFound': "4099",
	'tokenExpired': "4100",
	'unauthorizedDevice': "4101",
	'unauthorizedDomain': "4102",
	'unauthorizedDynamicChannel': "4103",
	'unauthorizedLocation': "4104",
	'unauthorizedParent': "4105",
	'unauthorizedPayPerView': "4106",
	'unauthorizedUsage': "4107",
	'unknownAccount': "4108",
	'unknownContent': "4109",
	'unknownDomain': "4110",
	'unknownSasContent': "4111",
	'version': "4112",
	'versionNotSupported': "4113",
	'versionUpgradeLink': "4114",
	'versionUpgradeText': "4115",
	'unplayable_content': "4135",
	'sas': "4136"
};

YouboraData = function () {
	try {
		this.debug = false;
		this.playerId = "";
		this.accountCode = undefined;
		this.service = "//nqs.nice264.com";
		this.username = "default";
		this.mediaResource = "";
		this.transaction = "";
		this.live = false;
		this.contentId = "";

		this.properties = {
			filename: "",
			content_id: "",
			content_metadata: {
				title: "",
				genre: "",
				language: "",
				year: "",
				cast: "",
				director: "",
				owner: "",
				duration: "",
				parental: "",
				price: "",
				rating: "",
				audioType: "",
				audioChannels: ""
			},
			transaction_type: "",
			quality: "",
			content_type: "",
			device: {
				manufacturer: "",
				type: "",
				year: "",
				firmware: ""
			}
		};

		this.trackingAds = true;

		this.concurrencySessionId = Math.random();
		this.concurrencyProperties = {
			enabled: false,
			concurrencyService: "//pc.youbora.com/cping/",
			concurrencyCode: "",
			concurrencyMaxCount: 0,
			concurrencyRedirectUrl: "",
			concurrencyIpMode: false
		};

		this.resumeProperties = {
			resumeEnabled: false,
			resumeService: "//pc.youbora.com/resume/",
			playTimeService: "//pc.youbora.com/playTime/",
			resumeCallback: function () {
				console.log("YouboraData :: Default Resume Callback");
			}
		};

		this.extraParams = {
			'extraparam1': undefined,
			'extraparam2': undefined,
			'extraparam3': undefined,
			'extraparam4': undefined,
			'extraparam5': undefined,
			'extraparam6': undefined,
			'extraparam7': undefined,
			'extraparam8': undefined,
			'extraparam9': undefined,
			'extraparam10': undefined
		};

		this.silverlightMediaElementName = undefined;
		this.silverlightPlayer = undefined;

		this.enableAnalytics = true;
		this.enableBalancer = true;
		this.cdn_node_data = false;
		this.hashTitle = true;

		this.text_cdn = "";
		this.text_ip = "";
		this.text_isp = "";

		this.nqsDebugServiceEnabled = false;

		this.init();
	} catch (error) {
		if (this.youboraData.debug) {
			console.log(error);
		}
	}

};

YouboraData.prototype = {
	init: function () {

	},
	redirectFunction: function (url) {
		window.location = url;
	},
	log: function (message) {
		if (this.debug == true) {
			console.log("YouboraDataContainer [" + this.playerId + "] Log :: " + message);
		}
	}
};

YouboraAnalytics = function (playerId, mb, namespace) {

	this.mb = mb; // save message bus reference for later use
	this.id = playerId;
	this.youboraData = {};
	this.player = {};
	this.ooyalaEvents = {};

	this.pluginType = "Ooyala";
	this.thisOO = namespace;
	this.communications = null;

	// active Advertisment
	this.activeAdvertisment = false;
	this.platform = null;
	this.isFlashPlugin = false;
	this.isAndroidOrIOSPlugin = false;

	//resource being played
	this.resource = "";

	// configuration
	this.pluginVersion = "1.4.2.2.1_desktop_newooyala";
	this.targetDevice = "HTML5_OoyalaPlayer";
	this.outputFormat = "xml";
	this.xmlHttp = null;
	this.isXMLReceived = false;

	// events queue
	this.resourcesQueue = [];
	this.eventsQueue = [];
	this.eventsTimer = null;

	// error delay
	this.errorDelayTimer = null;
	this.errorDelayMillis = 3000;
	this.errorLastEvent = null;
	this.errorLastTime = 0;

	// start delay
	this.startDelayTimer = null;
	this.startDelayMillis = 1000;
	this.startLastTime = 0;

	// events
	this.isStartEventSent = false;
	this.isJoinEventSent = false;
	this.isStopEventSent = false;
	this.isBufferRunning = false;
	this.isPauseEventSent = false;
	this.isFixJoinTime = false;
	this.isAdsEventSent = false;

	// properties
	this.assetMetadata = {};
	this.isLive = false;
	this.bufferTimeBegin = 0;
	this.joinTimeBegin = 0;
	this.joinTimeEnd = 0;
	this.bitrate = 0;
	this.adsTimeBegin = 0;

	// ping
	this.pamPingTime = 0;
	this.lastPingTime = 0;
	this.diffTime = 0;
	this.pingTimer = null;
	this.lastBitrate = -1;

	// buffer
	this.lastCurrentTime = 0;

	//seek status
	this.seekEvent = false;
	this.replaySeekEvent = false;
	this.playTime = 0;
	this.videoDuration = NaN;
	this.playing = false;

	//convinience variable to set the username.Used for uniformity issue with the  Nice264Communications
	this.bandwidth = {};

	//Mthod to control the buffering in html, by listening sequences of progress-timeUpdate
	this.progressCount = 0;

	this.bufferCheckTimer = {};
	this.lastTime = 0;

	this.init(); // subscribe to relevant events              
};

YouboraAnalytics.prototype = {

	/***********************************************
	 Init method: subscribe to the relevant events
	***********************************************/

	init: function () {
		var nameSpace = "";

		try {
			nameSpace = eval(this.thisOO.playerParams.namespace);

			if (nameSpace == undefined) {
				nameSpace = this.thisOO;
			}
		} catch (err) {
			nameSpace = this.thisOO;
		}

		try {
			this.youboraData = new YouboraData();
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}

		try {

			var currentSpace;

			if (nameSpace.__internal != undefined) {
				currentSpace = nameSpace.__internal;
			} else {
				currentSpace = nameSpace;
			}

			var isAndroid = (currentSpace.isAndroid == true ||
				currentSpace.isAndroid4Plus == true);
			var isIos = (currentSpace.isIos == true ||
				currentSpace.isIpad == true ||
				currentSpace.isIphone == true);

			this.isAndroidOrIOSPlugin = isAndroid || isIos;
			this.isFlashPlugin = currentSpace.requiredInEnvironment('flash-playback');
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}

		try {
			this.ooyalaEvents = nameSpace.EVENTS;
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}

		try {

			this.mb.subscribe(nameSpace.EVENTS.PLAYER_CREATED,
				'YouboraAnalytics', this.thisOO._.bind(this.onPlayerCreate, this));

			this.mb.subscribe(nameSpace.EVENTS.PAUSED,
				'YouboraAnalytics', this.thisOO._.bind(this.onPauseHandler, this));

			this.mb.subscribe(nameSpace.EVENTS.STREAM_PAUSED,
				'YouboraAnalytics', this.thisOO._.bind(this.onPauseHandler, this));

			this.mb.subscribe(nameSpace.EVENTS.PLAYING,
				'YouboraAnalytics', this.thisOO._.bind(this.onPlayingHandler, this));

			this.mb.subscribe(nameSpace.EVENTS.STREAM_PLAYING,
				'YouboraAnalytics', this.thisOO._.bind(this.onPlayingHandler, this));

			//This event is called only in HTML5
			this.mb.subscribe(nameSpace.EVENTS.AUTHORIZATION_FETCHED,
				'YouboraAnalytics', this.thisOO._.bind(this.onAuthorizationFetched, this));

			this.mb.subscribe(nameSpace.EVENTS.PLAYED,
				'YouboraAnalytics', this.thisOO._.bind(this.onStopHandler, this));

			this.mb.subscribe(nameSpace.EVENTS.STREAM_PLAYED,
				'YouboraAnalytics', this.thisOO._.bind(this.onStopHandler, this));

			this.mb.subscribe(nameSpace.EVENTS.ERROR,
				'YouboraAnalytics', this.thisOO._.bind(this.onErrorHandler, this));

			this.mb.subscribe(nameSpace.EVENTS.ADS_ERROR,
				'YouboraAnalytics', this.thisOO._.bind(this.adsError, this));

			this.mb.subscribe(nameSpace.EVENTS.INITIAL_PLAY,
				'YouboraAnalytics', this.thisOO._.bind(this.onPlayHandler, this));

			this.mb.subscribe(nameSpace.EVENTS.PLAY,
				'YouboraAnalytics', this.thisOO._.bind(this.onPlayHandler, this));

			this.mb.subscribe(nameSpace.EVENTS.PLAY_STREAM,
				'YouboraAnalytics', this.thisOO._.bind(this.onPlayStreamHandler, this));

			this.mb.subscribe(nameSpace.EVENTS.BUFFERED,
				'YouboraAnalytics', this.thisOO._.bind(this.onBufferedHandler, this));

			this.mb.subscribe(nameSpace.EVENTS.BUFFERING,
				'YouboraAnalytics', this.thisOO._.bind(this.onBufferingHandler, this));

			this.mb.subscribe(nameSpace.EVENTS.PLAYBACK_READY,
				'YouboraAnalytics', this.thisOO._.bind(this.onPlaybackReadyHandler, this));

			this.mb.subscribe(nameSpace.EVENTS.PLAYHEAD_TIME_CHANGED,
				'YouboraAnalytics', this.thisOO._.bind(this.onPlayheadChangedHandler, this));

			this.mb.subscribe(nameSpace.EVENTS.SEEK,
				'YouboraAnalytics', this.thisOO._.bind(this.onSeekHandler, this));

			this.mb.subscribe(nameSpace.EVENTS.SCRUBBING,
				'YouboraAnalytics', this.thisOO._.bind(this.onSeekHandler, this));

			this.mb.subscribe(nameSpace.EVENTS.SCRUBBED,
				'YouboraAnalytics', this.thisOO._.bind(this.onSeekHandler, this));

			this.mb.subscribe(nameSpace.EVENTS.EMBED_CODE_CHANGED,
				'YouboraAnalytics', this.thisOO._.bind(this.onEmbedCodeChanged, this));

			//This event is jut called in flash
			this.mb.subscribe(nameSpace.EVENTS.BITRATE_CHANGED,
				'YouboraAnalytics', this.thisOO._.bind(this.onBitrateChanged, this));

			//This event is only called in HTML5
			this.mb.subscribe(nameSpace.EVENTS.PRELOAD_STREAM,
				'YouboraAnalytics', this.thisOO._.bind(this.onPreloadStream, this));

			this.mb.subscribe(nameSpace.EVENTS.DOWNLOADING,
				'YouboraAnalytics', this.thisOO._.bind(this.onDownloading, this));

			this.mb.subscribe(nameSpace.EVENTS.CONTENT_TREE_FETCHED,
				'YouboraAnalytics', this.thisOO._.bind(this.onContentTreeFetchedHandler, this));

			this.mb.subscribe(nameSpace.EVENTS.ADS_PLAYED,
				'YouboraAnalytics', this.thisOO._.bind(this.adsPlayed, this));

			this.mb.subscribe("adPlayCompleted",
				'YouboraAnalytics', this.thisOO._.bind(this.adsPlayed, this));

			this.mb.subscribe("adPlayStarted",
				'YouboraAnalytics', this.thisOO._.bind(this.adPlayStarted, this));

			this.mb.subscribe(nameSpace.EVENTS.WILL_PLAY_ADS,
				'YouboraAnalytics', this.thisOO._.bind(this.adsWillPlay, this));

			this.mb.subscribe(nameSpace.EVENTS.WILL_PLAY_SINGLE_AD,
				'YouboraAnalytics', this.thisOO._.bind(this.adsWillPlay, this));

			this.mb.subscribe(nameSpace.EVENTS.WILL_PLAY,
				'YouboraAnalytics', this.thisOO._.bind(this.videoWillPlay, this));

			this.mb.subscribe(nameSpace.EVENTS.METADATA_FETCHED,
				'YouboraAnalytics', this.thisOO._.bind(this.metadataFetched, this));

		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}

		try {
			if (this.youboraData.debug) {
				//subscribe to relevant player events
				this.mb.subscribe("*", 'YouboraAnalytics', this.thisOO._.bind(this.eventDebug, this));
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},



	/***********************************************
	 Public methods that Ooyala needs for set-up
	***********************************************/

	replayOoyalaEvent: function (data) {
		try {
			var eventName = data.args[0];
			var arguments = data.args;
			var eventTime = data.time;

			switch (eventName) {
			case this.ooyalaEvents.METADATA_FETCHED: // "metadataFetched":
				this.metadataFetched(arguments[0], arguments[1]);
				break;

			case this.ooyalaEvents.PLAYER_CREATED: // "playerCreated":
				this.onPlayerCreate(arguments[0], arguments[1], arguments[2]);
				break;

			case this.ooyalaEvents.EMBED_CODE_CHANGED: // "embedCodeChanged":
				this.onEmbedCodeChanged(arguments[0], arguments[1], arguments[2]);
				break;

			case this.ooyalaEvents.CONTENT_TREE_FETCHED: // "contentTreeFetched":
				this.onContentTreeFetchedHandler(arguments[0], arguments[1]);
				break;

			case this.ooyalaEvents.AUTHORIZATION_FETCHED: // "authorizationFetched":
				this.onAuthorizationFetched(arguments[0], arguments[1]);
				break;

			case this.ooyalaEvents.PRELOAD_STREAM: // "preloadStream":
				this.onPreloadStream(arguments[0], arguments[1]);
				break;

			case this.ooyalaEvents.ERROR: // "error":
				this.onErrorHandler(arguments[0], arguments[1]);
				break;

			case this.ooyalaEvents.PAUSED:
			case this.ooyalaEvents.STREAM_PAUSED:
				this.onPauseHandler(arguments[0]);
				break;

			case this.ooyalaEvents.PLAYING:
			case this.ooyalaEvents.STREAM_PLAYING:
				this.onPlayingHandler(arguments[0], eventTime);
				break;

			case this.ooyalaEvents.PLAYED:
			case this.ooyalaEvents.STREAM_PLAYED:
				this.onStopHandler(arguments[0]);
				break;

			case this.ooyalaEvents.PLAY:
			case this.ooyalaEvents.INITIAL_PLAY:
				this.onPlayHandler(arguments[0], eventTime);
				break;

			case this.ooyalaEvents.PLAY_STREAM:
				this.onPlayStreamHandler(arguments[0], eventTime);
				break;

			case this.ooyalaEvents.BUFFERED:
				this.onBufferedHandler(arguments[0], arguments[1], eventTime);
				break;

			case this.ooyalaEvents.BUFFERING:
				this.onBufferingHandler(arguments[0], eventTime);
				break;

			case this.ooyalaEvents.PLAYBACK_READY:
				this.onPlaybackReadyHandler(arguments[0], arguments[1]);
				break;

			case this.ooyalaEvents.PLAYHEAD_TIME_CHANGED:
				this.onPlayheadChangedHandler(arguments[0], arguments[1], arguments[2], arguments[3], eventTime);
				break;

			case this.ooyalaEvents.BITRATE_CHANGED:
				this.onBitrateChanged(arguments[0], arguments[1]);
				break;

			case this.ooyalaEvents.DOWNLOADING:
				this.onDownloading(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
				break;

			case this.ooyalaEvents.ADS_PLAYED:
			case "adPlayCompleted":
				this.adsPlayed(arguments[0], eventTime);
				break;

			case this.ooyalaEvents.WILL_PLAY_ADS:
			case this.ooyalaEvents.WILL_PLAY_SINGLE_AD:
				this.adsWillPlay(arguments[0], eventTime);
				break;

			case "adPlayStarted":
				this.adPlayStarted(arguments[0], arguments[1], eventTime);
				break;

			case this.ooyalaEvents.WILL_PLAY:
				this.videoWillPlay(arguments[0]);
				break;

			case this.ooyalaEvents.SEEK:
			case this.ooyalaEvents.SCRUBBING:
			case this.ooyalaEvents.SCRUBBED:
				this.onSeekHandler(arguments[0], arguments[1], eventTime);
				break;

			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	updateYouboraMetadataContent: function (metadata) {
		try {
			if (metadata != undefined) {
				if (metadata.Youbora_accountCode != undefined)
					this.youboraData.accountCode = metadata.Youbora_accountCode;

				if (metadata.Youbora_username != undefined)
					this.youboraData.username = metadata.Youbora_username;

				if (metadata.Youbora_transactionCode != undefined)
					this.youboraData.transaction = metadata.Youbora_transactionCode;

				if (metadata.Youbora_live != undefined) {
					this.youboraData.live = metadata.Youbora_live;
					this.isLive = metadata.Youbora_live;
				}

				if (metadata.Youbora_ip != undefined)
					this.youboraData.text_ip = metadata.Youbora_ip;

				if (metadata.Youbora_isp != undefined)
					this.youboraData.text_isp = metadata.Youbora_isp;

				if (metadata.Youbora_cdn != undefined)
					this.youboraData.text_cdn = metadata.Youbora_cdn;

				if (metadata.properties != undefined)
					this.youboraData.properties = metadata.properties;
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	setYouboraExtraParams: function (params) {
		try {
			if (params != undefined) {
				if (params.param1 != undefined) this.youboraData.extraParams.extraparam1 = params.param1;
				if (params.param2 != undefined) this.youboraData.extraParams.extraparam2 = params.param2;
				if (params.param3 != undefined) this.youboraData.extraParams.extraparam3 = params.param3;
				if (params.param4 != undefined) this.youboraData.extraParams.extraparam4 = params.param4;
				if (params.param5 != undefined) this.youboraData.extraParams.extraparam5 = params.param5;
				if (params.param6 != undefined) this.youboraData.extraParams.extraparam6 = params.param6;
				if (params.param7 != undefined) this.youboraData.extraParams.extraparam7 = params.param7;
				if (params.param8 != undefined) this.youboraData.extraParams.extraparam8 = params.param8;
				if (params.param9 != undefined) this.youboraData.extraParams.extraparam9 = params.param9;
				if (params.param10 != undefined) this.youboraData.extraParams.extraparam10 = params.param10;
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	enableAdsTracking: function () {
		this.youboraData.trackingAds = true;
	},

	disableAdsTracking: function () {
		this.youboraData.trackingAds = false;
	},

	enableYouboraResume: function (params) {
		try {
			this.youboraData.resumeProperties.resumeEnabled = true;

			if (params.contentId != undefined)
				this.youboraData.contentId = params.contentId;

			if (params.resumeCallback != undefined)
				this.youboraData.resumeProperties.resumeCallback = params.resumeCallback;

			if (this.communications != null)
				this.communications.enableResume();
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	disableYouboraResume: function () {
		try {
			this.youboraData.resumeProperties.resumeEnabled = false;

			if (this.communications != null)
				this.communications.disableResume();
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	enableYouboraConcurrency: function (params) {
		try {
			this.youboraData.concurrencyProperties.enabled = true;

			if (params.contentId != undefined)
				this.youboraData.contentId = params.contentId;

			if (params.concurrencyCode != undefined)
				this.youboraData.concurrencyProperties.contentId = params.concurrencyCode;

			if (params.concurrencyMaxCount != undefined)
				this.youboraData.concurrencyProperties.concurrencyMaxCount = params.concurrencyMaxCount;

			if (params.concurrencyRedirectUrl != undefined)
				this.youboraData.concurrencyProperties.concurrencyRedirectUrl = params.concurrencyRedirectUrl;

			if (params.concurrencyIpMode != undefined)
				this.youboraData.concurrencyProperties.concurrencyIpMode = params.concurrencyIpMode;

			if (this.communications != null)
				this.communications.enableConcurrency();
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	disableYouboraConcurrency: function () {
		try {
			this.youboraData.concurrencyProperties.enabled = false;

			if (this.communications != null)
				this.communications.disableConcurrency();
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	forceStopPlugin: function () {
		this.stop();
	},



	/***********************************************
	 Subscription methods
	***********************************************/

	onPlayerCreate: function (event, elementId, params) {
		try {
			if (!this.isFlashPlugin) {
				this.player = document.getElementsByTagName('video')[0];
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}

		try {
			// Get Extraparams
			if (params.npaw_extra_params != undefined) {
				if (params.npaw_extra_params.extraParam1 != undefined) this.youboraData.extraParams.extraparam1 = params.npaw_extra_params.extraParam1;
				if (params.npaw_extra_params.extraParam2 != undefined) this.youboraData.extraParams.extraparam2 = params.npaw_extra_params.extraParam2;
				if (params.npaw_extra_params.extraParam3 != undefined) this.youboraData.extraParams.extraparam3 = params.npaw_extra_params.extraParam3;
				if (params.npaw_extra_params.extraParam4 != undefined) this.youboraData.extraParams.extraparam4 = params.npaw_extra_params.extraParam4;
				if (params.npaw_extra_params.extraParam5 != undefined) this.youboraData.extraParams.extraparam5 = params.npaw_extra_params.extraParam5;
				if (params.npaw_extra_params.extraParam6 != undefined) this.youboraData.extraParams.extraparam6 = params.npaw_extra_params.extraParam6;
				if (params.npaw_extra_params.extraParam7 != undefined) this.youboraData.extraParams.extraparam7 = params.npaw_extra_params.extraParam7;
				if (params.npaw_extra_params.extraParam8 != undefined) this.youboraData.extraParams.extraparam8 = params.npaw_extra_params.extraParam8;
				if (params.npaw_extra_params.extraParam9 != undefined) this.youboraData.extraParams.extraparam9 = params.npaw_extra_params.extraParam9;
				if (params.npaw_extra_params.extraParam10 != undefined) this.youboraData.extraParams.extraparam10 = params.npaw_extra_params.extraParam10;
				if (params.npaw_extra_params.transaction != undefined) this.youboraData.transaction = params.npaw_extra_params.transaction;
				if (params.npaw_extra_params.username != undefined) this.youboraData.username = params.npaw_extra_params.username;
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	metadataFetched: function (event, response) {
		try {
			// AccountCode set by Ooyala
			if (response.modules != undefined) {
				if (response.modules.npaw != undefined) {
					this.youboraData.accountCode = response.modules.npaw.metadata.npaw_account;

					this.communications = new YouboraCommunication(this.youboraData.accountCode,
						this.youboraData.service, this.pluginVersion,
						this.targetDevice, this.youboraData);

					this.pamPingTime = this.communications.getPingTime();

					if (this.pamPingTime == 0) {
						this.pamPingTime = 5000;
					}

					this.reset();
				}
			}

			if (this.youboraData.accountCode == undefined || this.youboraData.accountCode == "") {
				this.youboraData.accountCode = "ooyalaqa";

				this.communications = new YouboraCommunication(this.youboraData.accountCode,
					this.youboraData.service, this.pluginVersion,
					this.targetDevice, this.youboraData);

				this.pamPingTime = this.communications.getPingTime();

				if (this.pamPingTime == 0) {
					this.pamPingTime = 5000;
				}

				this.reset();
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	onContentTreeFetchedHandler: function (event, contentTree) {
		try {
			//console.log("[EVENT][PLAYER] New title is: " + contentTree.title);
			if (contentTree.title != undefined) {
				this.youboraData.properties.content_metadata.title = contentTree.title;
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}

		try {
			//console.log("[EVENT][FLASH] Resource from " + this.resource + " to: " + contentTree.streamUrl);
			if (contentTree.streamUrl != undefined && (!this.resource || this.resource.indexOf("rtmp") === 0)) {
				this.resource = contentTree.streamUrl;
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}

		try {
			if (!this.isFlashPlugin) {
				this.videoDuration = (contentTree.duration) / 1000;
			} else {
				this.videoDuration = contentTree.time;
			}
			this.youboraData.properties.content_metadata.duration = this.videoDuration;
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}

		try {
			if (this.isFlashPlugin) {
				if (contentTree.isLiveStream != undefined) {
					this.youboraData.live = contentTree.isLiveStream;
					this.isLive = this.youboraData.live;
				}
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}

		try {
			if (contentTree.title != undefined && this.errorLastEvent != null) {
				// If we have an error pending, we send the error just now with the title
				this.forceSendError();
			} else if (contentTree.title != undefined && this.startLastTime > 0) {
				// If we have an error pending, we send the error just now with the title
				this.sendStartDelay();
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	onAuthorizationFetched: function (event, mediaData) {
		//The mediaData is different in HTML5 and Flash so we need to be careful
		this.isLive = false;

		try {
			if (mediaData != undefined) {
				if (this.isFlashPlugin) {
					// Get FlashMetadata
					if (mediaData.authorization_data != undefined) {
						if (mediaData.authorization_data.xzd294czqox5xG6QtulBzKPM1Vq8Vwkm != undefined) {
							if (mediaData.authorization_data.xzd294czqox5xG6QtulBzKPM1Vq8Vwkm.streams != undefined) {
								if (mediaData.authorization_data.xzd294czqox5xG6QtulBzKPM1Vq8Vwkm.streams[0] != undefined) {
									if (mediaData.authorization_data.xzd294czqox5xG6QtulBzKPM1Vq8Vwkm.streams[0].video_bitrate != undefined) {
										this.bitrate = mediaData.authorization_data.xzd294czqox5xG6QtulBzKPM1Vq8Vwkm.streams[0].video_bitrate;
									}
									if (mediaData.authorization_data.xzd294czqox5xG6QtulBzKPM1Vq8Vwkm.streams[0].is_live_stream != undefined) {
										this.youboraData.live = mediaData.authorization_data.xzd294czqox5xG6QtulBzKPM1Vq8Vwkm.streams[0].is_live_stream;
										this.isLive = this.youboraData.live;
									}
								}
							}
						}
					} else {
						// If don't have authorization_data object, analize like HTML5 metadata
						if (mediaData.streams != undefined) {
							if (mediaData.streams[0] != undefined) {
								if (mediaData.streams[0].video_bitrate != undefined) {
									this.bitrate = mediaData.streams[0].video_bitrate;
								}
								if (mediaData.streams[0].is_live_stream != undefined) {
									this.youboraData.live = mediaData.streams[0].is_live_stream;
									this.isLive = this.youboraData.live;
								}
							}
						}
					}
				} else {
					// Get HTML5 MetaData
					if (mediaData.streams != undefined) {
						if (mediaData.streams[0] != undefined) {
							if (mediaData.streams[0].video_bitrate != undefined) {
								this.bitrate = mediaData.streams[0].video_bitrate;
							}
							if (mediaData.streams[0].is_live_stream != undefined) {
								this.youboraData.live = mediaData.streams[0].is_live_stream;
								this.isLive = this.youboraData.live;
							}
						}
					}
				}
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	onDownloading: function (event, arg1, arg2, arg3, arg4, mediaResource) {
		if (this.resource == "" || this.resource == undefined) {
			this.resource = mediaResource;
			//console.log("[EVENT] " + mediaResource);
		}

		if (this.isFlashPlugin) {
			//console.log("[EVENT] JoinEventSent: " + this.isJoinEventSent + " // BufferingRunning: " + this.isBufferRunning);

			// If Donwloading, is buffering then...
			try {
				if (!this.isJoinEventSent && !this.isBufferRunning) {
					this.isBufferRunning = true;
					this.join(YouboraPluginAnalyticsEvents.BUFFER_BEGIN);

				} else if (this.isJoinEventSent && !this.isBufferRunning) {
					this.isBufferRunning = true;
					this.buffer(YouboraPluginAnalyticsEvents.BUFFER_BEGIN, this.seekEvent);
				}
			} catch (err) {
				if (this.youboraData.debug) {
					console.log(err);
				}
			}
		}

		// Only for FLASH Plugin, because HTML5 load before play!!
		if (this.isFlashPlugin) {
			this.readyForSendStart();
		}
	},

	onBitrateChanged: function (event, bitrateObject) {
		//Information available only for videoBitrate
		try {
			this.bitrate = bitrateObject.videoBitrate;
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	onPreloadStream: function (event, resourceUrl) {
		//This event is only called in HTML5
		this.resource = resourceUrl;
		//console.log("[EVENT] " + resourceUrl);
	},

	onPlayingHandler: function (event, eventTime) {
		if (this.activeAdvertisment == false) {
			if (this.isStartEventSent) {
				if (this.isPauseEventSent) {
					this.isPauseEventSent = false;
					this.resume();
				}

				this.trySendBuffer();
			} else {
				this.readyForSendStart();
			}
		}

		if (this.seekEvent) {
			this.buffer(YouboraPluginAnalyticsEvents.BUFFER_END, this.seekEvent, eventTime);
			if (this.replaySeekEvent == false) {
				this.seekEvent = false;
			} else {
				this.replaySeekEvent = false;
				this.seekEvent = true;
			}
		}
	},

	trySendJoin: function () {
		if (this.isStartEventSent && this.isBufferRunning && !this.activeAdvertisment) {
			//sometimes the player won't call onBuffered, this is
			//a workaorund
			this.join(YouboraPluginAnalyticsEvents.BUFFER_END);
			this.isBufferRunning = false;
			this.join(YouboraPluginAnalyticsEvents.JOIN_SEND);
		} else if (this.isStartEventSent && !this.isJoinEventSent && !this.activeAdvertisment) {
			// In flash sometimes don't recieve the buffer start event, so will send a small jointime
			this.isFixJoinTime = true;
			this.join(YouboraPluginAnalyticsEvents.BUFFER_END);
			this.isBufferRunning = false;
			this.join(YouboraPluginAnalyticsEvents.JOIN_SEND);
			this.isBufferRunning = false;
		}
	},

	trySendBuffer: function () {
		if (this.isStartEventSent && this.isJoinEventSent && this.isBufferRunning && !this.activeAdvertisment) {
			this.buffer(YouboraPluginAnalyticsEvents.BUFFER_END, this.seekEvent);
			this.seekEvent = false;
			this.isBufferRunning = false;
		}
	},

	onPlayHandler: function (event, eventTime) {
		if (this.activeAdvertisment == false) {
			if (this.isStartEventSent == false) {
				this.isStartEventSent = true;
				if (this.seekEvent) {
					this.seekEvent = false;
				}
				this.start();
			}
		}
		if (!this.isJoinEventSent && !this.isBufferRunning) {
			this.isBufferRunning = true;
			this.join(YouboraPluginAnalyticsEvents.BUFFER_BEGIN, eventTime);
		}
	},

	onPlayStreamHandler: function (event, eventTime) {
		if (this.isFlashPlugin == false) {
			if (this.activeAdvertisment == false) {
				if (this.isStartEventSent == false) {
					this.isStartEventSent = true;
					this.start();
				}
			}

			if (!this.isJoinEventSent && !this.isBufferRunning) {
				this.isBufferRunning = true;
				this.join(YouboraPluginAnalyticsEvents.BUFFER_BEGIN, eventTime);
			}

			this.readyForSendStart();
		}
	},

	onBufferingHandler: function (event, arg1, arg2, ar3, arg4, eventTime) {
		try {
			if (!this.isJoinEventSent && !this.isBufferRunning) {
				this.isBufferRunning = true;
				this.join(YouboraPluginAnalyticsEvents.BUFFER_BEGIN, eventTime);
			} else if (this.isJoinEventSent && !this.isBufferRunning) {
				this.isBufferRunning = true;
				this.buffer(YouboraPluginAnalyticsEvents.BUFFER_BEGIN, this.seekEvent, eventTime);
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	onPlayheadChangedHandler: function (event, time, duration, bufferName, eventTime) {
		try {
			this.progressCount = 0;

			if ((this.videoDuration == null || this.videoDuration == 'undefinded' ||
					isNaN(this.videoDuration)) && this.activeAdvertisment == false) {
				this.videoDuration = duration;
			}

			if (isNaN(time) == false) {
				this.playTime = Math.round(time);
			} else {
				this.playTime = 0;
			}

			if (!this.isJoinEventSent && time != undefined && time > 0) {
				this.trySendJoin();
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	onBufferedHandler: function (event, streamUrl, eventTime) {
		if (!this.isJoinEventSent && this.isBufferRunning && !this.activeAdvertisment) {
			this.join(YouboraPluginAnalyticsEvents.BUFFER_END, eventTime);
		}
	},

	onSeekHandler: function (event, secondsToSeek, eventTime) {
		this.seekEvent = true;
		this.buffer(YouboraPluginAnalyticsEvents.BUFFER_BEGIN, this.seekEvent, eventTime);
	},

	onPauseHandler: function (event) {
		if (this.isStartEventSent && !this.isPauseEventSent && !this.seekEvent) {
			this.isPauseEventSent = true;
			this.communications.sendPause();
		}
	},

	onStopHandler: function (event) {
		if (this.activeAdvertisment == false) {
			if (!this.isStopEventSent) {
				this.isStopEventSent = true;
				this.stop();
			}
		}
	},

	onErrorHandler: function (event, errorCode) {
		try {
			if (this.youboraData.properties.content_metadata.title == "") {
				this.errorLastEvent = errorCode;
				this.errorDelayTimer = setTimeout(this.forceSendError.bind(this, errorCode), this.errorDelayMillis);

				var d = new Date();
				this.errorLastTime = d.getTime();
			} else {
				this.error(errorCode.code);
				if (!this.isStopEventSent) {
					this.isStopEventSent = true;
					this.stop();
				}
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	forceSendError: function () {
		try {
			if ((this.errorLastEvent != null) && (this.errorLastTime > 0)) {
				this.error(this.errorLastEvent.code);
				this.errorLastEvent = null;
				this.errorLastTime = 0;
				if (!this.isStopEventSent) {
					this.isStopEventSent = true;
					this.stop();
				}
			}
			if (this.errorDelayTimer != undefined && this.errorDelayTimer != null) {
				clearTimeout(this.errorDelayTimer);
				this.errorDelayTimer = null;
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	onPlaybackReadyHandler: function (event, errorCode) {
		// Don't use in this version
	},

	onEmbedCodeChanged: function (event, embedCode, params) {
		try {
			// Check if have a pending error event
			if (this.errorLastEvent != null) {
				var d = new Date();
				var currentTime = d.getTime();
				var diffTime = currentTime - this.errorLastTime;

				if (diffTime > 1000) {
					// If diferente between embedCodeChange and error events is more than a second, is because the user change the video content
					this.forceSendError();
				}
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}

		try {
			if (embedCode != undefined) {
				this.videoDuration = embedCode.time;
				this.youboraData.properties.content_metadata.duration = this.videoDuration;
				this.youboraData.properties.content_metadata.title = "";
				this.resource = "";
			}

			if (this.isStartEventSent) {
				this.stop();
			} else {
				this.reset();
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	adPlayStarted: function (event, data, eventTime) {
		if (this.isStartEventSent == false) {
			this.isStartEventSent = true;
			this.start();
		}
		this.activeAdvertisment = true;
		this.adsEvent(YouboraPluginAnalyticsEvents.ADS_BEGIN, eventTime);
	},

	adsWillPlay: function (event, eventTime) {
		this.activeAdvertisment = true;
		this.isBufferRunning = false;
		this.adsEvent(YouboraPluginAnalyticsEvents.ADS_BEGIN, eventTime);
	},

	adsPlayed: function (event, eventTime) {
		this.activeAdvertisment = false;
		this.adsEvent(YouboraPluginAnalyticsEvents.ADS_END, eventTime);
	},

	adsError: function (event) {},

	videoWillPlay: function (event) {},



	/***********************************************
	 Private methods (Only plugin needs)
	***********************************************/

	eventDebug: function (event, arg1, arg2, arg3, arg4, arg5) {
		try {
			if (event != "playheadTimeChanged" && event != "downloading") {
				var currentTime = new Date();
				var hours = currentTime.getHours();
				var minutes = currentTime.getMinutes();
				var seconds = currentTime.getSeconds();
				var milliseconds = currentTime.getMilliseconds();

				if (minutes < 10)
					minutes = "0" + minutes;

				console.log("[LISTEN]" + hours + ": " + minutes + ": " + seconds + "." + milliseconds + " => " + event);
				console.log("            * " + arg1 + " | " + arg2 + " | " + arg3 + " | " + arg4 + " | " + arg5);
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	readyForSendStart: function () {
		try {
			if (this.activeAdvertisment == false) {
				if (this.isStartEventSent == false) {
					if (this.resource != "") {
						this.isStartEventSent = true;
						this.start();
					}
				}
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	reset: function () {
		try {
			this.isStopEventSent = false;
			this.isStartEventSent = false;
			this.isJoinEventSent = false;
			this.isBufferRunning = false;
			this.isPauseEventSent = false;
			this.isAdsEventSent = false;
			this.bufferTimeBegin = 0;
			this.adsTimeBegin = 0;
			this.joinTimeBegin = 0;
			this.joinTimeEnd = 0;

			this.activeAdvertisment = false;

			clearTimeout(this.pingTimer);
			clearTimeout(this.bufferCheckTimer);
			this.pingTimer = null;
			this.lastPingTime = 0;
			this.diffTime = 0;
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	join: function (bufferState, eventTime) {

		var d = new Date();
		var joinTimeTotal = 0;

		try {
			var curTime = d.getTime();

			if (eventTime != undefined && eventTime > 0) {
				curTime = eventTime;
			}

			if (bufferState == YouboraPluginAnalyticsEvents.BUFFER_BEGIN) {
				this.joinTimeBegin = curTime;
			} else if (bufferState == YouboraPluginAnalyticsEvents.BUFFER_END) {
				this.joinTimeEnd = curTime;
			} else if (bufferState == YouboraPluginAnalyticsEvents.JOIN_SEND && !this.isJoinEventSent) {
				if ((this.joinTimeBegin != 0) || this.isFixJoinTime) {
					if (this.isFixJoinTime == false) {
						joinTimeTotal = this.joinTimeEnd - this.joinTimeBegin;

						if (joinTimeTotal <= 0) {
							joinTimeTotal = 10;
						}
					} else {
						joinTimeTotal = 100;
						this.isFixJoinTime = false;
					}

					if (this.playTime == undefined || isNaN(this.playTime)) {
						this.playTime = 0;
					}
					this.communications.sendJoin(Math.round(this.playTime), joinTimeTotal);

					this.isJoinEventSent = true;
					this.joinTimeBegin = 0;

				}

				if (!this.isFlashPlugin) {
					this.setBufferCheck();
				}
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	buffer: function (bufferState, isSeekEvent, eventTime) {
		var d = new Date();
		var bufferTimeEnd = 0;
		var bufferTimeTotal = 0;

		try {
			var curTime = d.getTime();

			if (eventTime != undefined && eventTime > 0) {
				curTime = eventTime;
			}

			if (bufferState === YouboraPluginAnalyticsEvents.BUFFER_BEGIN) {
				this.bufferTimeBegin = curTime;

			} else if (bufferState === YouboraPluginAnalyticsEvents.BUFFER_END) {
				if (this.bufferTimeBegin !== 0) {
					bufferTimeEnd = curTime;
					bufferTimeTotal = bufferTimeEnd - this.bufferTimeBegin;
					this.bufferTimeBegin = 0;

					if (isSeekEvent) {
						this.communications.sendSeek(Math.round(this.playTime), bufferTimeTotal);
					} else {
						if (this.isFlashPlugin || bufferTimeTotal > 880) {
							this.communications.sendBuffer(Math.round(this.playTime), bufferTimeTotal);
						}
					}
				}
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	adsEvent: function (adsState, eventTime) {
		try {
			var d = new Date();

			var adsTimeEnd = 0;
			var adsTimeTotal = 0;
			var curTime = d.getTime();

			if (eventTime != undefined && eventTime > 0) {
				curTime = eventTime;
			}

			if (adsState == YouboraPluginAnalyticsEvents.ADS_BEGIN) {
				this.adsTimeBegin = curTime;
				this.isAdsEventSent = false;
			} else if (adsState == YouboraPluginAnalyticsEvents.ADS_END) {
				if (this.isJoinEventSent == false) {
					// Set Join Begin now, after Ads
					this.joinTimeBegin = curTime;
				} else {
					// Set Buffer Begin now, after Ads
					this.bufferTimeBegin = curTime;
				}

				if (this.isAdsEventSent == false) {
					if (this.adsTimeBegin != 0) {
						adsTimeEnd = curTime;
						adsTimeTotal = adsTimeEnd - this.adsTimeBegin;

						if (this.youboraData.trackingAds) {
							this.communications.sendAds(Math.round(this.playTime), adsTimeTotal);
						}

						this.adsTimeBegin = 0;
						this.isAdsEventSent = true;
					}
				}
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	start: function () {
		try {
			if ((this.resource != "") && (this.youboraData.properties.content_metadata.title != "")) {
				var d = new Date();
				this.communications.sendStart(0, window.location.href, this.getMetadata(), this.isLive,
					this.resource, this.videoDuration, this.youboraData.transaction);
				this.setPing();
				this.lastPingTime = d.getTime();
			} else {
				// TimeOut for send Start
				var context = this;
				var d = new Date();

				this.startDelayTimer = setTimeout(function () {
					context.sendStartDelay();
				}, this.startDelayMillis);
				this.startLastTime = d.getTime();

				this.setPing();
				this.lastPingTime = d.getTime();
			}

		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	sendStartDelay: function () {
		try {
			clearTimeout(this.startDelayTimer);
			this.startDelayTimer = null;

			this.communications.sendStart(0, window.location.href, this.getMetadata(), this.isLive,
				this.resource, this.videoDuration, this.youboraData.transaction);
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	setPing: function () {
		var context = this;
		this.pingTimer = setTimeout(function () {
			context.ping();
		}, this.pamPingTime);
	},

	ping: function () {
		var d = new Date();
		clearTimeout(this.pingTimer);
		try {
			if (!this.isJoinEventSent) {
				this.communications.sendPingTotalBitrate(this.getBitrate(), 0);
			} else if (this.activeAdvertisment) {
				this.communications.sendPingTotalBitrate(this.lastBitrate, Math.round(this.lastPingTime));
			} else {
				this.communications.sendPingTotalBitrate(this.getBitrate(), Math.round(this.playTime));
				this.lastPingTime = Math.round(this.playTime);
				this.lastBitrate = this.getBitrate();
			}
			this.setPing();
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	getBitrate: function () {
		try {
			if (this.bitrate == 0 || this.bitrate == undefined) {
				return -1;
			} else {
				return this.bitrate * 1024;
			}
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	getMetadata: function () {
		try {
			var jsonObj = JSON.stringify(this.youboraData.properties);
			var metadata = encodeURI(jsonObj);

			return metadata;
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	resume: function () {
		try {
			this.communications.sendResume();
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	stop: function () {
		try {
			this.communications.sendStop();
			clearTimeout(this.pingTimer);
			this.pingTimer = null;
			this.reset();
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	error: function (errorCode) {
		try {
			var errorCodeYoubora = errorCode; //YouboraPluginError[errorCode];
			if (errorCodeYoubora == undefined) {
				errorCodeYoubora = errorCode;
			}

			this.communications.sendAdvancedError(errorCodeYoubora, this.pluginType, errorCode, 0, window.location.href, this.getMetadata(), this.isLive, this.resource, this.videoDuration);
			clearTimeout(this.pingTimer);
			this.pingTimer = null;
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	errorAndContinue: function (errorCode) {
		try {
			var errorCodeYoubora = errorCode; //YouboraPluginError[errorCode];
			if (errorCodeYoubora == undefined) {
				errorCodeYoubora = errorCode;
			}
			this.communications.sendAdvancedError(errorCodeYoubora, this.pluginType, errorCode, 0, window.location.href, this.getMetadata(), this.isLive, this.resource, this.videoDuration);
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	setBufferCheck: function () {
		try {
			// Now we can check every 800ms if it's Buffering (for Android and iOS devices)
			var context = this;
			this.bufferCheckTimer = setTimeout(function () {
				context.bufferCheck();
			}, 800);
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	bufferCheck: function () {
		try {
			if (this.activeAdvertisment == false) {
				if (!this.isPauseEventSent && !this.seekEvent) {

					if (!this.isBufferRunning && (Math.abs((this.lastTime * 1000) - (this.player.currentTime * 1000)) < 600)) {
						this.buffer(YouboraPluginAnalyticsEvents.BUFFER_BEGIN, false);
						this.isBufferRunning = true;

					} else if (this.isBufferRunning && (Math.abs((this.lastTime * 1000) - (this.player.currentTime * 1000)) > 600)) {
						this.buffer(YouboraPluginAnalyticsEvents.BUFFER_END, this.seekEvent);
						this.isBufferRunning = false;
					}
				}
				this.lastTime = this.player.currentTime;
			}
			this.setBufferCheck();
		} catch (err) {
			if (this.youboraData.debug) {
				console.log(err);
			}
		}
	},

	__end_marker: true
};
