/*
 * SmartPlugin
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Biel Conde & Jordi Aguilar
 * Version: 2.0.0-yospace
 */

var SmartPlugin = function (params) {

	var debug = true,
		initDone = false,

		playerId = null,
		targetDevice = "YOSPACE",
		pluginName = "YOSPACE",
		pluginVersion = "2.0.0-yospace",
		mediaEvents = {
			BUFFER_BEGIN: 1,
			BUFFER_END: 0,
			JOIN_SEND: 2,
			ADS_BEGIN: 3,
			ADS_END: 4
		},
		options = params,
		pingTimer = null,
		apiClass = null,
		currentTime = 0,
		duration = 0,
		bufferCheckTimer = {},

		// Triggers
		isStartSent = false,
		isJoinSent = false,
		isPaused = false,
		isSeeking = false,
		joinTimeBegin = 0,
		joinTimeEnd = 0,
		bufferTimeBegin = 0;


	this.config = function (config) {
		if (yospace.BROWSER.IE && (yospace.BROWSER.IE < 8)) {
			if (SmartPlugin.debug) {
				yospace.log("Yoplayer Debug: IE too old");
			}
			return false;
		}
		return true;
	};

	this.init = function (container, config) {
		try {
			if (!this.config(config)) {
				// Config returned false, so do not do anything
				return;

			} else {

				/* Multi */
				playerId = container.getAttribute('id');

				/* Start config*/
				SmartPlugin.initDone = true;
				setProperties(options, config);

				// Extend Player functions (could interfere with multi)
				window.onState_old = window.onState;
				window.onState = this.onState;
				window.onError_old = window.onError;
				window.onError = this.onError;

				apiClass = new YouboraCommunication(getYouboraData().getAccountCode(), getYouboraData().getService(), {}, pluginVersion, targetDevice, container.getAttribute("id"));

				if (SmartPlugin.debug) {
					console.log("SmartPlugin :: " + pluginName + " :: Init ::");
				}
			}

		} catch (error) {

			if (SmartPlugin.debug) {
				console.log("SmartPlugin :: " + pluginName + " :: init :: Error: " + error);
			}

		}

	};

	this.html5init = function (container, player) {
		videoPlayer = player;
	};

	this.flashinit = function (container, flplayer, urlEncodedFlashVars) {
		videoPlayer = flplayer;
	};

	this.start = function (container) {
		try {
			if (!isStartSent) {
				apiClass.sendStart(0, window.location.href, "", getYouboraData().getLive(), getYouboraData().getMediaResource(), 0, getYouboraData().getTransaction());
				isStartSent = true;

				setPing();
			}
		} catch (error) {
			if (debug) {
				console.log("SmartPlugin :: " + pluginName + " :: startPlugin :: Error: " + error);
			}
		}
	};

	this.play = function (container) {
		try {
			if (isStartSent && !isJoinSent) {
				setBufferEvent(mediaEvents.BUFFER_END);
			}
		} catch (error) {
			if (debug) {
				console.log("SmartPlugin :: " + pluginName + " :: play :: Error: " + error);
			}
		}
	};

	this.pause = function (container) {
		try {
			if (isStartSent) {
				apiClass.sendPause();
				isPaused = true;
			}
		} catch (error) {
			if (debug) {
				console.log("SmartPlugin :: " + pluginName + " :: pause :: Error: " + error);
			}
		}
	};

	this.resume = function (container) {
		try {
			if (isStartSent) {
				setBufferEvent(mediaEvents.BUFFER_END);

				apiClass.sendResume();
				isPaused = false;
			}
		} catch (error) {
			if (debug) {
				console.log("SmartPlugin :: " + pluginName + " :: resume :: Error: " + error);
			}
		}
	};

	this.complete = function (container) {
		this.stop(container);
	};

	this.stop = function (container) {
		try {
			if (isStartSent) {
				apiClass.sendStop();
				reset();
			}
		} catch (error) {
			if (debug) {
				console.log("SmartPlugin :: " + pluginName + " :: stop :: Error: " + error);
			}
		}
	};

	this.onState = function (oid, state) {
		try {
			//call player function
			window.onState_old(oid, state);

			if (state === "buffering") {
				setBufferEvent(mediaEvents.BUFFER_BEGIN);

				if (!isStartSent && isPaused) {
					apiClass.sendStart(0, window.location.href, "", getYouboraData().getLive(), getYouboraData().getMediaResource(), 0, getYouboraData().getTransaction());
					isStartSent = true;

					setPing();
				}
			}
		} catch (error) {
			if (debug) {
				console.log("SmartPlugin :: " + pluginName + " :: onState :: Error: " + error);
			}
		}
	};

	this.onError = function (oid, err) {
		try {
			//call player function
			window.onError_old(oid, err);

			apiClass.sendAdvancedError(0, targetDevice, err, 0, window.location.href, getYouboraData().getProperties(), getYouboraData().getLive(), getYouboraData().getMediaResource(), 0, 0);
			clearTimeout(pingTimer)

			if (debug) {
				console.log("SmartPlugin :: " + pluginName + " :: onError :: Player Error: " + err);
			}
		} catch (error) {
			if (debug) {
				console.log("SmartPlugin :: " + pluginName + " :: onError :: Error: " + error);
			}
		}
	};

	/*
	this.timedMetadata = function (container, metadata) {
		try {
			console.log(metadata);
		} catch (error) {
			if (debug) {
				console.log("SmartPlugin :: " + pluginName + " :: timedMetadata :: Error: " + error);
			}
		}
	};
	*/

	this.destroy = function (container) {

	};

	this.logging = function (container, message) {

	};

	function getYouboraData() {
		if (typeof youboraDataMap !== 'undefined') {
			return youboraDataMap.get(playerId);
		} else {
			return youboraData;
		}
	}

	function reset() {
		isStartSent = false;
		isJoinSent = false;
		joinTimeBegin = 0;
		joinTimeEnd = 0;
		bufferTimeBegin = 0;
	}

	function setPing() {
		try {
			pingTimer = setTimeout(function () {
				ping();
			}, apiClass.getPingTime());
		} catch (error) {
			if (debug) {
				console.log("SmartPlugin :: " + pluginName + " :: setPing :: Error: " + error);
			}
		}
	}

	function ping() {
		try {
			clearTimeout(pingTimer);
			//var bitrate = this.getCurrentBitrate();
			//var bandwidth = this.getCurrentBandwidth();
			if (pingTimer !== null) {
				pingTimer = null;
				setPing();
			}
			if (isStartSent) {
				apiClass.sendPingTotalBitrate(-1, 0);
			}
		} catch (error) {
			if (debug) {
				console.log("SmartPlugin :: " + pluginName + " :: Ping :: Error: " + error);
			}
		}
	}

	function setBufferEvent(bufferState) {
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

				if (isJoinSent === false) {
					if (isStartSent) {
						apiClass.sendJoin(currentTime, bufferTimeTotal);
						isJoinSent = true;
					}
					if (debug) {
						console.log("SmartPlugin :: " + pluginName + " :: setBufferEvent :: sendJoin");
					}
				} else {
					if (getYouboraData().getLive()) {
						currentTime = 0;
					}

					if (isSeeking) {
						//apiClass.sendSeek(currentTime, bufferTimeTotal);
						if (debug) {
							console.log("SmartPlugin :: " + pluginName + " :: setBufferEvent :: sendSeek");
						}
					} else {
						if (isStartSent && !isPaused && bufferTimeTotal >= 100) {
							apiClass.sendBuffer(currentTime, bufferTimeTotal);
						}
						if (debug) {
							console.log("SmartPlugin :: " + pluginName + " :: setBufferEvent :: sendBuffer");
						}
					}
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
	}

	function setProperties(options, config) {
		try {
			if (options.accountCode) {
				getYouboraData().setAccountCode(options.accountCode);
			}

			if (options.username) {
				getYouboraData().setUsername(options.username);
				//bandwidth.username = options.username;
			}

			if (typeof options.isLive === "undefined") {
				getYouboraData().setLive(config.live);
			} else {
				getYouboraData().setLive(options.isLive);
			}

			if (options.debug) {
				getYouboraData().debug = options.debug;
				debug = options.debug;
			}

			if (typeof options.mediaResource == "undefined") {
				getYouboraData().setMediaResource(config.file);
			} else {
				getYouboraData().setMediaResource(options.mediaResource);
			}

			if (typeof options.properties === "undefined") {
				getYouboraData().setProperties({
					filename: config.file
				});
			} else {
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

		} catch (error) {
			if (debug) {
				console.log("SmartPlugin :: " + pluginName + " :: setProperties :: Error: " + error);
			}
		}
	}


}
