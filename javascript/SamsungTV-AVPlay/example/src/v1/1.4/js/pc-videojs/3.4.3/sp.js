/* 
 * YouboraCommunication
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Biel Conde & Jordi Aguilar
 * Version: 3.4.3
 * API version: 1.4+
 */

// When creating a plugin file for Video.js it is a best practice to enclose your 
// functions inside a closure. This allows all of code to be accessible without 
// cluttering up the global namespace, keeping everything nice and tidy.
videojs.plugin('youbora', function (params) {

	var player = this;
	var playerId = this.id();
	var _options = params;

	var debug = getYouboraData().getDebug();
	var isLive = getYouboraData().getLive();
	var bandwidth = {
		username: getYouboraData().getUsername(),
		interval: 6000
	};
	var targetDevice = "PC-VIDEOJS";
	var pluginName = "VIDEOJS";
	var pluginVersion = "3.4.3_videojs";
	//is bcove
	if (player.mediainfo) {
		targetDevice = "PC-VIDEOJS-BCOVE";
		pluginName = "BCOVE";
		pluginVersion = "3.4.3_bcove";
	}
	var initDone = 0;
	var balanceObject = "";
	var balanceIndex = 1;
	var mediaEvents = {
		BUFFER_BEGIN: 1,
		BUFFER_END: 0,
		JOIN_SEND: 2
	};
	var videoPlayer = this;
	var urlResource = undefined;
	var pingTimer = undefined;
	var apiClass = undefined;
	var currentTime = 0;
	var duration = 0;
	// Triggers
	var liveSetedClient = false;
	var isStreamError = false;
	var isBuffering = false;
	var isStartSent = false;
	var isJoinSent = false;
	var isPaused = false;
	var isAdvertisment = false;
	var isProgressFired = false;
	var isPlayingFired = false;
	var isCanplayFired = false;
	var isAdEndFired = false;
	var isStalledFired = false;
	var isLoadedDataFired = false;
	var previousElapsedTime = 0;
	var bufferTimeBegin = 0;
	var joinTimeBegin = 0;
	var joinTimeEnd = 0;
	var adsTimeBegin = 0;
	var adsTimeTotal = 0;
	var originalResource = "";
	var seeking = "";
	var seekingControlTrigger = false;
	var seekingControlTime = 0;
	//In some devices time detection is a little rough so we give
	//the player a threshold to make transitions smoother. Only used
	//for buffering so far
	var bufferTimeThreshold = 0.1;
	//We will privide a window to prevent buffer after seek (0.5 sec)
	var endSeekDate = 0;
	var endSeekThreshold = 500;
	var bufferCheckTimer = {};
	//Sometimes the timeUpdate event and buffer checker 'event' will happen at the same time and it will send a buffer
	//as lastTime = currentTime. To prevent this to happen, the equality will have to happpen at least twice
	var bufferTryCount = 0;
	var errors = {
		//MEDIA_ERR_ABORTED , 'The video download was cancelled'
		'1': '11100',
		//MEDIA_ERR_NETWORK , 'The video connection was lost, please confirm you are connected to the internet'
		'2': '11101',
		// MEDIA_ERR_DECODE, 'The video is bad or in a format that cannot be played on your browser'
		'3': '11102',
		// MEDIA_ERR_SRC_NOT_SUPPORTED, 'This video is either unavailable or not supported in this browser'
		'4': '11103',
		// MEDIA_ERR_ENCRYPTED , 'The video you are trying to watch is encrypted and we do not know how to decrypt it'
		'5': '11104',
		// MEDIA_ERR_UNKNOWN ,  'An unanticipated problem was encountered, check back soon and try again'
		'unknown': '11105',
		//PLAYER_ERR_NO_SRC ,  'No video has been loaded'
		'-1': '11106',
		// PLAYER_ERR_TIMEOUT , 'Could not download the video'
		'-2': '11107'
	};

	this.youbora = {

		Check: function () {
			console.log('i am ');
			console.log(player);
		},

		//auto-init at end of file
		Init: function () {
			initDone = true;
			player.youbora.startPlugin();
		},
		getYouboraData: function () {
			return getYouboraData();
		},
		setBcoveProperties: function (options) {
			try {
				if (!liveSetedClient && (duration === Infinity || duration < 0)) {
					getYouboraData().setLive(true);
				}
			} catch (e) {}

			try {
				if (player.mediainfo) {
					if (!options.properties) {
						options.properties = '';
					}
					if (!options.properties.content_metadata) {
						options.properties = {
							content_metadata: ''
						};
					}

					options.properties.content_metadata = {
						title: player.mediainfo.name,
						duration: player.mediainfo.duration
					};

				}
			} catch (e) {}
			return options;
		},

		setProperties: function (options) {

			getYouboraData().setAccountCode(options.accountCode);
			if (typeof options.username !== 'undefined') {
				getYouboraData().setUsername(options.username);
			}

			if (typeof options.isLive != "undefined") {
				liveSetedClient = true;
				getYouboraData().setLive(options.isLive);
			}

			// only for BC
			//options = player.youbora.setBcoveProperties(options);

			if (options.debug) {
				getYouboraData().debug = options.debug;
				debug = options.debug;
			}

			if (options.properties) {
				getYouboraData().setProperties(options.properties);
			}
			if (options.contentId) {
				getYouboraData().setContentId(options.contentId);
			}

			if (options.transaction) {
				getYouboraData().setTransaction(options.transaction);
			}
			if (options.httpSecure) {
				getYouboraData().setHttpSecure(options.httpSecure);
			}
			if (options.isp) {
				getYouboraData().setISP(options.isp);
			}
			if (options.cdn) {
				getYouboraData().setCDN(options.cdn);
			}
			if (options.ip) {
				getYouboraData().setIP(options.ip);
			}
			if (options.CDNNodeData) {
				getYouboraData().setCDNNodeData(options.CDNNodeData);
			}
			if (options.parseHLS) {
				getYouboraData().setParseHLS(options.parseHLS);
			}
			if (options.extraparam1) {
				getYouboraData().setExtraParam(1, options.extraparam1);
			}
			if (options.extraparam2) {
				getYouboraData().setExtraParam(2, options.extraparam2);
			}
			if (options.extraparam3) {
				getYouboraData().setExtraParam(3, options.extraparam3);
			}
			if (options.extraparam4) {
				getYouboraData().setExtraParam(4, options.extraparam4);
			}
			if (options.extraparam5) {
				getYouboraData().setExtraParam(5, options.extraparam5);
			}
			if (options.extraparam6) {
				getYouboraData().setExtraParam(6, options.extraparam6);
			}
			if (options.extraparam7) {
				getYouboraData().setExtraParam(7, options.extraparam7);
			}
			if (options.extraparam8) {
				getYouboraData().setExtraParam(8, options.extraparam8);
			}
			if (options.extraparam9) {
				getYouboraData().setExtraParam(9, options.extraparam9);
			}
			if (options.extraparam10) {
				getYouboraData().setExtraParam(10, options.extraparam10);
			}

			if (options.balanceProperties) {
				options.balanceProperties.enabled = false;
				getYouboraData().setBalanceProperties(options.balanceProperties);
			}

			if (options.concurrencyProperties) {
				getYouboraData().setConcurrencyProperties(options.concurrencyProperties);
			}

			if (options.resumeProperties) {
				getYouboraData().setResumeProperties(options.resumeProperties);
			}
			if (options.username) {
				bandwidth.username = options.username;
			}
		},

		startPlugin: function () {
			try {
				try {
					videoPlayer = player;
					duration = player.duration();
					if ((isNaN(duration)) || (duration == "NaN") || duration == NaN || duration == Infinity) {
						duration = 0;
					}

					if (debug) {
						console.log("SmartPlugin :: " + pluginName + " :: startPlugin :: HTML5 <video> found!");
					}

					originalResource = videoPlayer.currentSrc();

					getYouboraData().setMediaResource(originalResource);
					apiClass = new YouboraCommunication(getYouboraData().getAccountCode(), getYouboraData().getService(), bandwidth, pluginVersion, targetDevice, playerId);

					player.youbora.bindEvents();

					if (isPaused) {
						apiClass.sendResume();
						isPaused = false;
					}
					if (getYouboraData().getBalanceEnabled() && apiClass.enableBalancer) {
						getYouboraData().setBalancedResource(true);
						if (balanceObject === "") {
							var path = apiClass.getResourcePath(originalResource);
							apiClass.getBalancedResource(path, function (obj) {
								setBalancedResource(obj);
							});

						}
					}
				} catch (error) {
					if (debug) {
						console.log(error);
						console.log("SmartPlugin :: " + pluginName + " :: startPlugin :: No <video> found!");
					}
				}

			} catch (error) {
				if (debug) {
					console.log("SmartPlugin :: " + pluginName + " :: startPlugin :: Error: " + error);
				}
			}
		},

		bindEvents: function () {
			try {
				var playerEvents = ["canplay", "playing", "waiting", "timeupdate", "ended", "play", "pause", "error", "abort", "seeking", "seeked", "stalled", "suspend", "progress", "dispose", "loadeddata", "loadstart", "adstart", "adend"];

				for (var i = 0; i < playerEvents.length; i++) {
					videoPlayer.on(playerEvents[i], function (e) {
						player.youbora.checkPlayState(e);
					});
				}
				if (debug) {
					console.log("SmartPlugin :: " + pluginName + " :: bindEvents :: Events atached correctly!");
				}
			} catch (error) {
				if (debug) {
					console.log("SmartPlugin :: " + pluginName + " :: bindEvents :: Error: " + error);
				}
			}
		},

		unbindEvents: function () {
			try {
				var playerEvents = ["canplay", "playing", "waiting", "timeupdate", "ended", "play", "pause", "error", "abort", "seeking", "seeked", "stalled", "suspend", "progress", "dispose", "loadeddata", "loadstart", "adstart", "adend"];

				for (elem in playerEvents) {
					videoPlayer.off(playerEvents[elem], function (e) {});
				}
			} catch (error) {
				if (debug) {
					console.log("SmartPlugin :: " + pluginName + " :: bindEvents :: Error: " + error);
				}
			}
		},

		isAd: function (adPlaying) {
			if (debug) {
				console.log("SmartPlugin :: " + pluginName + " :: isAd :: " + adPlaying);
			}
			isAdvertisment = adPlaying;
		},

		checkPlayState: function (e) {
			if (debug) {
				console.log("DEBUG: SmartPlugin :: " + pluginName + " :: checkPlayState :: " + e.type);
			}

			//console.log(e.type);

			switch (e.type) {
			case "timeupdate":
				try {
					if (!isAdvertisment) {

						if (isStartSent && !isJoinSent && (isCanplayFired || isProgressFired) /*isPlayingFired && isLoadedDataFired && isProgressFired || isStalledFired)*/ ) {
							player.youbora.setBufferEvent(mediaEvents.BUFFER_END);
						}

						urlResource = videoPlayer.currentSrc();
						currentTime = videoPlayer.currentTime();

						if (currentTime > 0) {

							//if previous+e < currentTime -->Playback re-started
							if ((previousElapsedTime + bufferTimeThreshold) < videoPlayer.currentTime()) {
								player.youbora.checkBuffering();
							}

							/*if (!isJoinSent && player.playlist().length == 0) {
								player.youbora.setBufferEvent(mediaEvents.BUFFER_END);
							}*/
						}
					}
				} catch (error) {
					if (debug) {
						console.log("SmartPlugin :: " + pluginName + " :: timeupdate :: Error: " + error);
					}
				}
				break;

			case "play":
				try {
					if (!isJoinSent) {
						this.setBufferEvent(mediaEvents.BUFFER_BEGIN);
					}
					//seeked
					/*
					if (isJoinSent && !isAdvertisment && !isPaused && seeking) {
						player.youbora.setBufferEvent(mediaEvents.BUFFER_END);
						seeking = false;
						isBuffering = false;
						endSeekDate = new Date().getTime();
					}
					*/
					if (!isAdvertisment) {

						if (!seeking) {
							urlResource = videoPlayer.currentSrc();

							if (!isStartSent && videoPlayer.error() == null) {

								if (getYouboraData().getMediaResource() === "" || getYouboraData().getMediaResource() === null || ((typeof videoPlayer.playlist === 'function') && videoPlayer.playlist().length > 0)) {
									getYouboraData().setMediaResource(videoPlayer.currentSrc());
								}

								duration = videoPlayer.duration();

								if (!liveSetedClient && (duration == Infinity || duration < 0)) {
									getYouboraData().setLive(true);
								}

								if ((isNaN(duration)) || (duration == "NaN") || duration == NaN || duration == Infinity) {
									duration = 0;
								}
								// only for BC/*
								/*_options = player.youbora.setBcoveProperties(_options);
								player.youbora.setProperties(_options);*/

								apiClass.sendStart(0, window.location.href, "", getYouboraData().getLive(), getYouboraData().getMediaResource(), duration, getYouboraData().getTransaction());

								player.youbora.setPing();
								player.youbora.setBufferChecker();
								isStartSent = true;
							}

							if (isPaused) {
								apiClass.sendResume();
								isPaused = false;
							}

						}
					}
				} catch (error) {
					if (debug) {
						console.log("SmartPlugin :: " + pluginName + " :: play :: Error: " + error);
					}
				}
				break;

			case "playing":
				try {
					if (isStartSent && !isAdvertisment) {
						player.youbora.checkBuffering();

						if (isPaused) {
							apiClass.sendResume();
							isPaused = false;
						}


					}
					isPlayingFired = true;

				} catch (error) {
					if (debug) {
						console.log("SmartPlugin :: " + pluginName + " :: playing :: Error: " + error);
					}
				}
				break;

			case "canplay":
				try {
					if (isStartSent && !isAdvertisment) {
						isCanplayFired = true;
					}
				} catch (error) {
					if (debug) {
						console.log("SmartPlugin :: " + pluginName + " :: canplay :: Error: " + error);
					}
				}
				break;

			case "adstart":
				try {
					player.youbora.isAd(true);
					var d = new Date();
					adsTimeBegin = d.getTime();
				} catch (error) {
					if (debug) {
						console.log("SmartPlugin :: " + pluginName + " :: adstart :: Error: " + error);
					}
				}
				break;

			case "adend":
				try {
					isAdEndFired = true;
					player.youbora.isAd(false);
					var d = new Date();
					adsTimeTotal = d.getTime() - adsTimeBegin;
				} catch (error) {
					if (debug) {
						console.log("SmartPlugin :: " + pluginName + " :: adend :: Error: " + error);
					}
				}
				break;

			case "pause":
				try {
					if (!isAdvertisment) {
						if (!seeking) {
							if (isStartSent) {
								apiClass.sendPause();
							}
							isPaused = true;
						}
					}
				} catch (error) {
					if (debug) {
						console.log("SmartPlugin :: " + pluginName + " :: pause :: Error: " + error);
					}
				}
				break;

			case "ended":
				try {
					if (isStartSent && !isAdvertisment) {
						//player.youbora.checkBuffering();
						player.youbora.reset();
					}
				} catch (error) {
					if (debug) {
						console.log("SmartPlugin :: " + pluginName + " :: ended :: Error: " + error);
					}
				}
				break;

			case "abort":
				try {
					if (isStartSent && !isAdvertisment) {
						// Only for Android, no Desktop
						if (typeof window.orientation !== 'undefined') {
							//player.youbora.checkBuffering();
							player.youbora.reset();
						}
					}
				} catch (error) {
					if (debug) {
						console.log("SmartPlugin :: " + pluginName + " :: abort :: Error: " + error);
					}
				}
				break;

			case "error":
				try {
					// only for BC
					_options = player.youbora.setBcoveProperties(_options);

					if (getYouboraData().getBalanceEnabled() && apiClass.enableBalancer) {
						if (debug) {
							console.log("SmartPlugin :: " + pluginName + " :: playerError :: Balancing...");
						}
						isStreamError = true;
						apiClass.sendErrorWithParameters("131" + getBalancerErrorCount(), "CDN_PLAY_FAILURE", 0, window.location.href, _options, getYouboraData().getLive(), balanceObject[balanceIndex]['URL'], videoPlayer.duration());
						balanceIndex++;
						player.youbora.refreshBalancedResource();
					} else {
						var error = "3001";
						var message = "";
						try {
							error = videoPlayer.error().code;
							if (error !== null || error !== undefined) {
								error = errors[error];
							}
							if (error == undefined) {
								error = "3001";
							}

							message = videoPlayer.error().message;
							if (message === '' || message === null) {
								message = videoPlayer.error().type;
							}
						} catch (e) {
							console.log(e);
						}
						isStreamError = true;
						player.youbora.checkBuffering();
						clearInterval(pingTimer);
						if (getYouboraData().getMediaResource() === "" || getYouboraData().getMediaResource() === null) {
							getYouboraData().setMediaResource(videoPlayer.currentSrc());
						}

						apiClass.sendErrorWithParameters(error, message, 0, window.location.href, _options, getYouboraData().getLive(), youboraData.getMediaResource(), videoPlayer.duration());
						player.youbora.reset();
					}
				} catch (error) {
					if (debug) {
						console.log("SmartPlugin :: " + pluginName + " :: error :: Error: " + error);
					}
				}
				break;

				/*case "abort":
					/*
					try {


					} catch (error) {
						if (debug) {
							console.log("SmartPlugin :: " + pluginName + " :: abort :: Error: " + error);
						}
					}*/
				//break;


			case "progress":
				try {
					if (isStartSent) {
						isProgressFired = true;
					}
				} catch (error) {
					if (debug) {
						console.log("SmartPlugin :: " + pluginName + " :: progress :: Error: " + error);
					}
				}
				break;

			case "waiting":
				try {
					if (!isAdvertisment) {
						if (!seeking) {
							if (isBuffering === false) {
								player.youbora.setBufferEvent(mediaEvents.BUFFER_BEGIN);
								isBuffering = true;
							}
						}
					}
				} catch (error) {
					if (debug) {
						console.log("SmartPlugin :: " + pluginName + " :: waiting :: Error: " + error);
					}
				}
				break;

			case "seeking":
				if (!isAdvertisment && isStartSent) {
					seeking = true;
					isBuffering = false;
					seekingControlTrigger = true;
					seekingControlTime = new Date().getTime();
				}
				break;

			case "seeked":
				if (!isAdvertisment) {
					seeking = false;
					isBuffering = false;
					//endSeekDate = new Date().getTime();
				}
				break;

			case "stalled":
				try {
					isStalledFired = true;
				} catch (error) {
					if (debug) {
						console.log("SmartPlugin :: " + pluginName + " :: isStalledFired :: Error: " + error);
					}
				}
				break;

			case "dispose":
				player.youbora.unLoad();
				break;

			case "loadstart":
				try {
					if (isStartSent && !isAdvertisment /* && (typeof videoPlayer.playlist === 'function') && videoPlayer.playlist().length > 0*/ ) {
						// Only for Desktop, no Android
						if (typeof window.orientation === 'undefined') {
							player.youbora.reset();
						}

						if (!isJoinSent) {
							this.setBufferEvent(mediaEvents.BUFFER_BEGIN);
						}

					}
				} catch (error) {
					if (debug) {
						console.log("SmartPlugin :: " + pluginName + " :: playing :: Error: " + error);
					}
				}
				break;

			case "loadeddata":
				try {
					isLoadedDataFired = true;

					if (!isStartSent && !isJoinSent && player.playlist().length > 0) {

						player.youbora.setBufferEvent(mediaEvents.BUFFER_END);

						//sendStart for all reosurces in playlists
						if (!isStartSent && videoPlayer.error() == null) {

							if (getYouboraData().getMediaResource() === "" || getYouboraData().getMediaResource() === null || ((typeof videoPlayer.playlist === 'function') && videoPlayer.playlist().length > 0)) {
								getYouboraData().setMediaResource(videoPlayer.currentSrc());
							}

							duration = videoPlayer.duration();

							if (!liveSetedClient && (duration === Infinity || duration < 0)) {
								getYouboraData().setLive(true);
							}

							if ((isNaN(duration)) || (duration == "NaN") || duration == NaN || duration == Infinity) {
								duration = 0;
							}
							// only for BC
							//_options = player.youbora.setBcoveProperties(_options);
							//player.youbora.setProperties(_options);

							apiClass.sendStart(0, window.location.href, "", getYouboraData().getLive(), resource, duration, getYouboraData().getTransaction());

							player.youbora.setPing();
							player.youbora.setBufferChecker();
							isStartSent = true;
						}
					}
				} catch (error) {
					if (debug) {
						console.log("SmartPlugin :: " + pluginName + " :: loadeddata :: Error: " + error);
					}
				}
				break;

			case "buffered":
				break;

			case "bufferedEnd":
				break;

			default:
				break;
			}
		},

		setBufferChecker: function () {
			bufferCheckTimer = setTimeout(function () {
				player.youbora.bufferChecker();
			}, 300);
		},

		bufferChecker: function () {

			try {
				if (videoPlayer.currentTime() > 0 && !isBuffering && !isPaused && !seeking) {
					var now = new Date().getTime();
					if ((previousElapsedTime >= videoPlayer.currentTime()) && (videoPlayer.currentTime() < videoPlayer.duration())) {
						bufferTryCount++;

						if (bufferTryCount >= 2) {
							player.youbora.setBufferEvent(mediaEvents.BUFFER_BEGIN);
							isBuffering = true;
							bufferTryCount = 0;
						}
					}
				}
			} catch (e) {
				console.log(e);
			}
			clearTimeout(bufferCheckTimer);

			previousElapsedTime = videoPlayer.currentTime();
			player.youbora.setBufferChecker();
		},

		getBalancerErrorCount: function () {
			if (balanceIndex < 10) {
				return "0" + balanceIndex;
			} else if (balanceIndex > 10) {
				return balanceIndex;
			} else {
				return "00";
			}
		},

		refreshBalancedResource: function () {
			try {
				if (typeof balanceObject[balanceIndex] != "undefined") {
					videoPlayer.src(balanceObject[balanceIndex]['URL']);
					setTimeout(function () {
						videoPlayer.load();
					}, 50);
					videoPlayer.load();
				} else {
					getYouboraData().setBalanceEnabled(false);
					videoPlayer.src(originalResource);
					setTimeout(function () {
						videoPlayer.load();
					}, 50);


					if (debug) {
						console.log("SmartPlugin :: " + pluginName + " :: Balancer :: End of mirrors");
					}
				}
			} catch (error) {
				if (debug) {
					console.log("SmartPlugin :: " + pluginName + " :: Balancer :: Error :: End of mirrors error:" + error);
				}
			}
		},

		setBalancedResource: function (obj) {
			try {
				if (obj !== false) {
					var indexCount = 0;
					for (index in obj) {
						indexCount++;
					}
					balanceObject = obj;
					balanceObject['' + (indexCount + 1) + ''] = new Object();
					balanceObject['' + (indexCount + 1) + '']['URL'] = getYouboraData().getMediaResource();

					if (typeof obj['1']['URL'] != "undefined") {
						if (debug) {
							console.log("SmartPlugin :: " + pluginName + " :: Balance Current Resource  :: " + urlResource);
							console.log("SmartPlugin :: " + pluginName + " :: Balance Priority Resource :: " + obj['1']['URL']);
						}
						if (obj['1']['URL'] != originalResource) {

							if (debug) {
								console.log("SmartPlugin :: " + pluginName + " :: Balancing :: " + obj['1']['URL']);
							}
							try {
								videoPlayer.src(obj['1']['URL']);
								getYouboraData().setCDN(obj['1']['CDN_CODE']);
								videoPlayer.pause();
								videoPlayer.load();
								//SmartPlugin.videoPlayer.play();
							} catch (error) {
								if (debug) {
									console.log("SmartPlugin :: " + pluginName + " :: Balancing :: Error While Changing Media: " + error);
								}
								videoPlayer.src(obj['1']['URL']);
								videoPlayer.load();
							}
						} else {
							if (debug) {
								console.log("SmartPlugin :: " + pluginName + " :: Balancer :: Same Resource");
							}
							getYouboraData().setBalanceEnabled(false);
							videoPlayer.src(originalResource);
							videoPlayer.load();

						}
					} else {
						if (debug) {
							console.log("SmartPlugin :: " + pluginName + " :: Invalid balance object");
						}
						videoPlayer.load();
					}
				} else {
					if (debug) {
						console.log("SmartPlugin :: " + pluginName + " :: Balance unavailable with current parameters");
					}
					balanceObject = "false";
					videoPlayer.load();
				}
			} catch (error) {
				if (debug) {
					console.log("SmartPlugin :: " + pluginName + " :: setBalancedResource :: Error: " + error);
				}
			}
		},

		checkBuffering: function () {
			try {
				if (isBuffering && isStartSent && isJoinSent) {
					player.youbora.setBufferEvent(mediaEvents.BUFFER_END);
					bufferTryCount = 0;
					isBuffering = false;
				}
			} catch (error) {
				if (debug) {
					console.log("SmartPlugin :: " + pluginName + " :: checkBuffering :: Error: " + error);
				}
			}
		},

		setBufferEvent: function (bufferState) {
			try {

				var d = new Date();
				var bufferTimeEnd = 0;
				var bufferTimeTotal = 0;

				switch (bufferState) {
				case mediaEvents.BUFFER_BEGIN:

					bufferTimeBegin = d.getTime();
					if (joinTimeBegin === 0) {
						joinTimeBegin = d.getTime();
					}
					break;

				case mediaEvents.BUFFER_END:
					bufferTimeEnd = d.getTime();
					bufferTimeTotal = bufferTimeEnd - bufferTimeBegin;
					if (isJoinSent == false) {
						var joinTimeTotal = d.getTime() - joinTimeBegin - adsTimeTotal;

						if (isStartSent) {
							//apiClass.sendJoin(currentTime, joinTimeTotal);
							duration = videoPlayer.duration();
							if ((isNaN(duration)) || (duration == "NaN") || duration == NaN || duration == Infinity) {
								duration = 0;
							}

							apiClass.sendJoinWithMediaDuration(currentTime, joinTimeTotal, duration);
							isJoinSent = true;
						}
						if (debug) {
							console.log("SmartPlugin :: " + pluginName + " :: setBufferEvent :: sendJoin");
						}
					} else {
						var seekingControlTimeEnd = new Date().getTime();
						if (!seekingControlTrigger || (seekingControlTrigger && (seekingControlTimeEnd - seekingControlTime) > 10000)) {
							if (currentTime === 0 && isLive) {
								currentTime = 10;
							}
							if (seeking) {
								//apiClass.sendSeek(currentTime, bufferTimeTotal);
								if (debug) {
									console.log("SmartPlugin :: " + pluginName + " :: setBufferEvent :: sendSeek");
								}
							} else {
								if (isStartSent && bufferTimeTotal >= 100) {
									apiClass.sendBuffer(currentTime, bufferTimeTotal);
								}
								if (debug) {
									console.log("SmartPlugin :: " + pluginName + " :: setBufferEvent :: sendBuffer");
								}
							}
						}
						seekingControlTrigger = false;
						seekingControlTime = 0;
						seekingControlTimeEnd = 0;
					}
					isBuffering = false;
					break;

				default:
					break;
				}

			} catch (error) {
				if (debug) {
					console.log("SmartPlugin :: " + pluginName + " :: setBufferEvent :: Error: " + error);
				}
			}
		},

		setPing: function () {
			try {
				pingTimer = setTimeout(function () {
					player.youbora.ping();
				}, apiClass.getPingTime());
			} catch (error) {
				if (debug) {
					console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setPing :: Error: " + error);
				}
			}
		},

		ping: function () {
			try {
				clearTimeout(pingTimer);
				var bitrate = this.getCurrentBitrate();
				var bandwidth = this.getCurrentBandwidth();
				pingTimer = null;
				player.youbora.setPing();
				if (isStartSent) {
					apiClass.sendPingTotalBitrate(bitrate, currentTime);
				}
			} catch (error) {
				if (debug) {
					console.log("SmartPlugin :: " + pluginName + " :: Ping :: Error: " + error);
				}
			}
		},

		getCurrentBitrate: function () {
			try {
				if (player.hls) {
					return player.hls.playlists.media().attributes.BANDWIDTH;
				} else if (typeof player.getPlaybackStatistics == "function") {
					return player.getPlaybackStatistics().video.bandwidth;
				} else {
					return -1;
				}
			} catch (error) {
				if (debug) {
					console.log("SmartPlugin :: " + pluginName + " :: getCurrentBitrate :: Error: " + error);
				}
			}
		},

		getCurrentBandwidth: function () {
			try {
				if (player.hls) {
					return player.hls.bandwidth;
				} else {
					return -1;
				}
			} catch (error) {
				if (debug) {
					console.log("SmartPlugin :: " + pluginName + " :: getCurrentBandwidth :: Error: " + error);
				}
			}
		},

		defineWatch: function () {
			try {
				if (!Object.prototype.watch) {
					Object.defineProperty(Object.prototype, "watch", {
						enumerable: false,
						configurable: true,
						writable: false,
						value: function (prop, handler) {
							var oldval = this[prop],
								newval = oldval,
								getter = function () {
									return newval;
								},
								setter = function (val) {
									oldval = newval;
									return newval = handler.call(this, prop, oldval, val);
								};
							if (delete this[prop]) {
								Object.defineProperty(this, prop, {
									get: getter,
									set: setter,
									enumerable: true,
									configurable: true
								});
							}
						}
					});
				}
				if (!Object.prototype.unwatch) {
					Object.defineProperty(Object.prototype, "unwatch", {
						enumerable: false,
						configurable: true,
						writable: false,
						value: function (prop) {
							var val = this[prop];
							delete this[prop];
							this[prop] = val;
						}
					});
				}
				setWatch();
			} catch (error) {
				if (debug) {
					console.log("SmartPlugin :: " + pluginName + " :: defineWatch :: Error: " + error);
				}
			}
		},

		setWatch: function () {
			try {
				var varsToWatch = ["balanceObject", "balanceIndex", "videoPlayer", "urlResource", "currentTime", "isStreamError", "isBuffering", "isStartSent", "isJoinSent", "isPaused", "bufferTimeBegin", "joinTimeBegin", "joinTimeEnd"];
				for (elem in varsToWatch) {
					if (typeof varsToWatch[elem] != "function") {
						watch(varsToWatch[elem], function (id, oldVal, newVal) {
							console.log("SmartPlugin :: " + pluginName + " :: Watcher :: [" + id + "] From: [" + oldVal + "] To: [" + newVal + "]");
							return newVal;
						});
					}
				}
			} catch (error) {
				if (debug) {
					console.log("SmartPlugin :: " + pluginName + " :: setWatch :: Error: " + error);
				}
			}
		},

		reset: function () {
			try {
				isLoadedDataFired = false;
				isCanplayFired = false;
				isProgressFired = false;
				clearTimeout(pingTimer);
				clearTimeout(bufferCheckTimer);
				apiClass.sendStop();
				currentTime = 0;
				urlResource = "";
				isLive = getYouboraData().getLive();
				duration = 0;
				previousElapsedTime = 0;
				isPaused = false;
				isStartSent = false;
				seeking = false;
				bufferTimeBegin = 0;
				isJoinSent = false;
				joinTimeBegin = 0;
				joinTimeEnd = 0;
				adsTimeBegin = 0;
				adsTimeTotal = 0;
				pingTimer = "";
				balanceIndex = 1;
				balanceObject = "";
				isPlayingFired = false;
				isStalledFired = false;
				//apiClass = new YouboraCommunication(getYouboraData().getAccountCode(), getYouboraData().getService(), bandwidth, pluginVersion, targetDevice,playerId);
			} catch (error) {
				if (debug) {
					console.log("SmartPlugin :: " + pluginName + " :: reset :: Error: " + error);
				}
			}
		},

		unLoad: function () {
			try {
				clearTimeout(pingTimer);
				clearTimeout(bufferCheckTimer);
				apiClass.sendStop();
				currentTime = 0;
				urlResource = "";
				isLive = getYouboraData().getLive();
				duration = 0;
				previousElapsedTime = 0;
				isPaused = false;
				isStartSent = false;
				bufferTimeBegin = 0;
				isJoinSent = false;
				joinTimeBegin = 0;
				joinTimeEnd = 0;
				adsTimeBegin = 0;
				adsTimeTotal = 0;
				pingTimer = "";
				balanceIndex = 1;
				balanceObject = "";
				unbindEvents();
				seeking = "";
				delete apiClass;
			} catch (error) {
				if (debug) {
					console.log("SmartPlugin :: " + pluginName + " :: reset :: Error: " + error);
				}
			}
		}
	}

	player.youbora.setProperties(_options);
	player.youbora.Init();

});

function getYouboraData() {
	if (typeof (youboraDataMap) === 'undefined') {
		return youboraData;
	} else {
		return youboraDataMap.get(playerId);
	}
}
