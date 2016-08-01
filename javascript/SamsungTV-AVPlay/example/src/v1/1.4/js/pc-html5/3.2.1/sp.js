/*
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Biel Conde
 * Contributor: Jordi Aguilar
 * Version: 3.2.1
 */

var SmartPlugin = function (playerid) {
	// General
	this.playerId = playerid;
	this.debug = false;
	this.isLive = false;
	this.bandwidth = {
		username: "",
		interval: 5000
	};
	this.targetDevice = "PC-HTML5";
	this.pluginVersion = "3.2.1_HTML5";
	this.pluginName = "HTML5";
	this.initDone = 0;
	this.bufferMilis = 1000;
	this.bufferRange = 800;
	this.bufferLastTime = 1000;
	this.bufferTimeBegin = 0;
	this.bufferInterval = null;
	// Balancer
	this.balancing = false;
	this.balanceObject = "";
	this.balanceIndex = 1;
	// Media
	this.currentBitrate = 0;
	this.bitrateTimer = undefined;
	this.mediaEvents = {
		BUFFER_BEGIN: 1,
		BUFFER_END: 0,
		JOIN_SEND: 2
	};
	this.videoPlayer = undefined;
	this.urlResource = undefined;
	this.pingTimer = undefined;
	this.apiClass = undefined;
	this.currentTime = 0;
	this.duration = 0;
	this.watchCurrentTime = undefined;
	this.watchOldTime = undefined;
	this.isEmptied = true;
	// Triggers
	this.isStreamError = false;
	this.isBuffering = false;
	this.isStartSent = false;
	this.isJoinSent = false;
	this.isPaused = false;
	this.previousElapsedTime = 0;
	this.bufferTimeBegin = 0;
	this.joinTimeBegin = 0;
	this.joinTimeEnd = 0;
	this.originalCDN = "";
	this.seeking = false;
	this.progressCount = 0;
	// PauseTime
	this.intervalPauseTime = 0;
	this.initPauseTime = 0;
};

SmartPlugin.prototype.Init = function () {
	this.initDone++;
	try {
		this.debug = getYouboraData().getDebug();
		this.isLive = getYouboraData().getLive();
		this.bandwidth.username = getYouboraData().getUsername();
		this.balancing = getYouboraData().getBalanceEnabled();

		if (this.initDone <= 5) {
			if (this.debug) {
				console.log("SmartPlugin :: " + this.pluginName + " :: Init ::");
			}

			this.initDone = true;
			this.startPlugin();

			var sp = this;
			this.bufferInterval = setInterval(function () {
				sp.watcher()
			}, this.bufferMilis);
		} else {
			if (this.debug) {
				console.log("SmartPlugin :: " + this.pluginName + " :: Init Error :: Unable to reach Api...");
			}
			spLoaded = false;
		}
	} catch (error) {
		if (this.debug) {
			console.log("SmartPlugin :: " + this.pluginName + " :: Init :: Error: " + error);
		}
		spLoaded = false;
	}
};

SmartPlugin.prototype.startPlugin = function () {
	try {
		try {
			this.videoPlayer = document.getElementById(this.playerId);
			this.videoPlayer.SmartPlugin = this;

			this.duration = this.videoPlayer.duration;
			this.originalCDN = getYouboraData().getCDN();
			if (this.debug) {
				console.log("SmartPlugin :: " + this.pluginName + " :: startPlugin :: HTML5 <video> found!");
			}
			this.apiClass = new YouboraCommunication(getYouboraData().getAccountCode(), getYouboraData().getService(), this.bandwidth, this.pluginVersion, this.targetDevice, this.playerId);
			this.bindEvents();
			try {
				window.onunload = function () {
					this.unloadPlugin();
				};
			} catch (error) {
				if (this.debug) {
					console.log("SmartPlugin :: " + this.pluginName + " :: startPlugin :: Unable to bind unload event!");
				}
			}
		} catch (error) {
			if (this.debug) {
				console.log("SmartPlugin :: " + this.pluginName + " :: startPlugin :: No <video> found!");
			}
			spLoaded = false;
		}
	} catch (error) {
		if (this.debug) {
			console.log("SmartPlugin :: " + this.pluginName + " :: startPlugin :: Error: " + error);
		}
		spLoaded = false;
	}
};

SmartPlugin.prototype.bindEvents = function () {
	try {
		var that = this;
		var playerEvents = ["canplay", "playing", /*"waiting",*/ "timeupdate", "ended", "play", "pause", "error", "abort", "seeking", "seeked", "progress", "emptied"];
		for (elem in playerEvents) {
			this.videoPlayer.addEventListener(playerEvents[elem], function (e) {
				that.checkPlayState(e);
			}, false);
		}
		if (this.debug) {
			console.log("SmartPlugin :: " + this.pluginName + " :: bindEvents :: Events atached correctly!");
		}
		if (this.balancing) {
			this.firstBalancerCheck()
		}
	} catch (error) {
		if (this.debug) {
			console.log("SmartPlugin :: " + this.pluginName + " :: bindEvents :: Error: " + error);
		}
	}
};

SmartPlugin.prototype.firstBalancerCheck = function () {

	try {
		this.initDone++;
		if (this.initDone <= 5) {
			if (this.apiClass.enableBalancer == undefined) {
				if (this.debug) {
					console.log("SmartPlugin :: " + this.pluginName + " :: firstBalancerCheck :: Api Class Not Ready...");
				}
				setTimeout("this.firstBalancerCheck()", 200);
			} else {
				getYouboraData().setBalancedResource(true);
				this.urlResource = this.videoPlayer.currentSrc;
				var path = this.apiClass.getResourcePath(this.urlResource);
				this.apiClass.getBalancedResource(path, function (obj) {
					this.setBalancedResource(obj);
				});
				this.initDone = true;
			}
		} else {
			if (this.debug) {
				console.log("SmartPlugin :: " + this.pluginName + " :: firstBalancerCheck :: Unable to reach Api class...");
			}
		}
	} catch (error) {
		if (this.debug) {
			console.log("SmartPlugin :: " + this.pluginName + " :: firstBalancerCheck :: Error: " + error);
		}
	}
};

SmartPlugin.prototype.checkBitrateType = function () {
	if (typeof this.videoPlayer.webkitVideoDecodedByteCount != "undefined") {
		clearInterval(this.bitrateTimer);

		this.bitrateTimer = setInterval(function (sp) {
			sp.currentBitrate = sp.videoPlayer.webkitVideoDecodedByteCount;
		}, 1000, this);
	}
};

SmartPlugin.prototype.unloadPlugin = function () {
	try {
		this.checkBuffering();
		this.reset("unload");
	} catch (error) {
		if (this.debug) {
			console.log("SmartPlugin :: " + this.pluginName + " :: unloadPlugin :: Error: " + error);
		}
	}
};

SmartPlugin.prototype.checkPlayState = function (e) {

	if (this.debug) {
		console.log("SmartPlugin :: " + this.pluginName + " :: checkPlayState :: " + e.type);
	}

	//console.log('#'+e.type);

	switch (e.type) {
	case "timeupdate":
		try {
			if (this.isEmptied) {
				this.urlResource = this.videoPlayer.currentSrc;
				this.currentTime = this.videoPlayer.currentTime;
				this.duration = this.videoPlayer.duration;
				if (isNaN(parseFloat(this.duration)) || (this.duration < 0.1)) {
					this.duration = 0;
				}
				if (this.videoPlayer.currentTime > 0) {
					if (!this.isStartSent) {
						this.apiClass.sendStart(this.currentBitrate, window.location.href, "", getYouboraData().getLive(), this.urlResource, this.duration);
						this.setPing();
						this.isStartSent = true;
					}
					this.apiClass.currentTime = this.currentTime;
				}
			}
		} catch (error) {
			if (this.debug) {
				console.log("SmartPlugin :: " + this.pluginName + " :: " + e.type + " :: Error: " + error);
			}
		}
		break;

	case "play":
		try {
			if (this.isEmptied) {
				this.urlResource = this.videoPlayer.currentSrc;
				this.duration = this.videoPlayer.duration;
				if (isNaN(parseFloat(this.duration)) || (this.duration < 0.1)) {
					this.duration = 0;
				}
				if (this.balancing && this.apiClass.enableBalancer) {
					if (this.balanceObject == "") {
						var path = this.apiClass.getResourcePath(this.urlResource);
						this.apiClass.getBalancedResource(path, function (obj) {
							this.setBalancedResource(obj);
						});
					} else {
						if (!this.isJoinSent) {
							this.setBufferEvent(this.mediaEvents.BUFFER_BEGIN);
						}
						if (this.currentBitrate == 0) {
							this.checkBitrateType();
						}
						if (!this.isStartSent) {
							this.apiClass.sendStart(this.currentBitrate, window.location.href, "", getYouboraData().getLive(), this.urlResource, this.duration);
							this.setPing();
							this.isStartSent = true;
						}
						/*if (this.isPaused) {
						    this.apiClass.sendResume();
						    this.isPaused = false;
						    setTimeout(function() { this.isPausedDelay = false;  }, 100);
						}*/
					}
				} else {
					if (this.currentBitrate == 0) {
						this.checkBitrateType();
					}
					if (!this.isJoinSent) {
						this.setBufferEvent(this.mediaEvents.BUFFER_BEGIN);
					}
					if (!this.isStartSent) {
						this.apiClass.sendStart(this.currentBitrate, window.location.href, "", getYouboraData().getLive(), this.urlResource, this.duration, getYouboraData().getTransaction());
						this.setPing();
						this.isStartSent = true;
					}
				}
			}
		} catch (error) {
			if (this.debug) {
				console.log("SmartPlugin :: " + this.pluginName + " :: " + e.type + " :: Error: " + error);
			}
		}
		break;

	case "canplay":
		try {
			if (this.videoPlayer.autoplay) {
				this.videoPlayer.play()
			}
		} catch (error) {
			if (this.debug) {
				console.log("SmartPlugin :: " + this.pluginName + " :: " + e.type + " :: Error: " + error);
			}
		}
		break;

	case "pause":
		try {
			this.checkBuffering();
			if (this.isStartSent) {
				this.apiClass.sendPause();
			}
			this.isPaused = true;

			var d = new Date();
			this.initPauseTime = d.getTime();

		} catch (error) {
			if (this.debug) {
				console.log("SmartPlugin :: " + this.pluginName + " :: " + e.type + " :: Error: " + error);
			}
		}
		break;

	case "ended":
		try {
			this.checkBuffering();
			this.reset("ended");
		} catch (error) {
			if (this.debug) {
				console.log("SmartPlugin :: " + this.pluginName + " :: " + e.type + " :: Error: " + error);
			}
		}
		break;

	case "error":
		try {
			this.isEmptied = false;
			this.checkBuffering();
			if (this.urlResource == undefined && this.videoPlayer.currentSrc || this.isStartSent == false) {
				this.urlResource = this.videoPlayer.currentSrc;
			}
			if (this.balancing && this.apiClass.enableBalancer) {
				if (this.debug) {
					console.log("SmartPlugin :: " + this.pluginName + " :: Balancing to next resource due to error...");
				}
				this.isStreamError = true;
				this.apiClass.sendErrorWithParameters("130" + this.getBalancerErrorCount(), "CDN_PLAY_FAILURE_AND_TRY_NEXT", 0, window.location.href, "", getYouboraData().getLive(), this.urlResource, this.duration);
				this.balanceIndex++;
				this.refreshBalancedResource();
			} else {
				this.isStreamError = true;
				this.checkBuffering();
				clearInterval(this.pingTimer);
				this.apiClass.sendErrorWithParameters("3001", "PLAY_FAILURE", 0, window.location.href, "", getYouboraData().getLive(), this.urlResource, this.duration);
				this.reset("error");
			}
		} catch (error) {
			if (this.debug) {
				console.log("SmartPlugin :: " + this.pluginName + " :: " + e.type + " :: Error: " + error);
			}
		}
		break;

	case "abort":
		try {

		} catch (error) {
			if (this.debug) {
				console.log("SmartPlugin :: " + this.pluginName + " :: " + e.type + " :: Error: " + error);
			}
		}
		break;

	case "emptied":
		try {
			this.isEmptied = true;
			if (this.isStartSent) {
				this.checkBuffering();
				this.reset("ended");
			}
		} catch (error) {
			if (this.debug) {
				console.log("SmartPlugin :: " + this.pluginName + " :: " + e.type + " :: Error: " + error);
			}
		}
		break;

	case "playing":
		try {
			if (!this.isJoinSent) {
				this.isBuffering = false;
				this.setBufferEvent(this.mediaEvents.BUFFER_END, 0);
			}

			if (this.isPaused) {
				this.apiClass.sendResume();
				this.isPaused = false;

				var d = new Date();
				this.intervalPauseTime += (d.getTime() - this.initPauseTime);
			}
		} catch (error) {
			if (this.debug) {
				console.log("SmartPlugin :: " + this.pluginName + " :: " + e.type + " :: Error: " + error);
			}
		}
		break;

	case "seeking":
		this.seeking = true;
		break;

	case "seeked":
		this.seeking = false;
		break;

	}
};

SmartPlugin.prototype.getBalancerErrorCount = function () {
	if (this.balanceIndex < 10) {
		return "0" + this.balanceIndex;
	} else if (this.balanceIndex > 10) {
		return this.balanceIndex;
	} else {
		return "000";
	}
};

SmartPlugin.prototype.refreshBalancedResource = function () {
	try {
		if (typeof this.balanceObject[this.balanceIndex]['URL'] != "undefined") {
			if (this.debug) {
				console.log("SmartPlugin :: " + this.pluginName + " :: refreshBalancedResource :: Next URL (" + this.balanceIndex + "): " + this.balanceObject[this.balanceIndex]['URL']);
			}
			this.videoPlayer.src = this.balanceObject[this.balanceIndex]['URL'];
			if (this.balanceObject[this.balanceIndex]['CDN_CODE'] != undefined) {
				getYouboraData().setCDN(this.balanceObject[this.balanceIndex]['CDN_CODE']);
			} else {
				getYouboraData().setCDN(this.originalCDN);
			}
			if (this.videoPlayer.autoplay) {
				this.videoPlayer.play();
			}
		} else {
			this.balancing = false;
			if (this.debug) {
				console.log("SmartPlugin :: " + this.pluginName + " :: Balancer :: Error :: End of mirrors");
			}
		}
	} catch (error) {
		if (this.debug) {
			console.log("SmartPlugin :: " + this.pluginName + " :: Balancer :: Error :: End of mirrors");
		}
		this.balancing = false;
	}
};

SmartPlugin.prototype.setBalancedResource = function (obj) {
	try {
		if (obj != false) {
			var indexCount = 0;
			for (index in obj) {
				indexCount++;
			}
			this.balanceObject = obj;
			this.balanceObject['' + (indexCount + 1) + ''] = new Object();
			this.balanceObject['' + (indexCount + 1) + '']['URL'] = this.urlResource;
			if (typeof obj['1']['URL'] != "undefined") {
				if (this.debug) {
					console.log("SmartPlugin :: " + this.pluginName + " :: Balance Current Resource  :: " + this.urlResource);
					console.log("SmartPlugin :: " + this.pluginName + " :: Balance Priority Resource :: " + obj['1']['URL']);
				}
				if (obj['1']['URL'] != this.urlResource) {
					if (this.debug) {
						console.log("SmartPlugin :: " + this.pluginName + " :: Balancing :: " + obj['1']['URL']);
					}
					try {
						console.log("Balancer object : ");
						console.log(obj);
						this.urlResource = obj['1']['URL'];
						getYouboraData().setCDN(obj['1']['CDN_CODE']);
						if (obj['1']['CDN_CODE'] != undefined) {
							getYouboraData().setCDN(obj['1']['CDN_CODE']);
						} else {
							getYouboraData().setCDN(this.originalCDN);
						}
						this.videoPlayer.src = obj['1']['URL'];
					} catch (error) {
						if (this.debug) {
							console.log("SmartPlugin :: " + this.pluginName + " :: Balancing :: Error While Changing Media: " + error);
						}
					}
				} else {
					if (this.debug) {
						console.log("SmartPlugin :: " + this.pluginName + " :: Balancer :: Same Resource");
					}
				}
			} else {
				if (this.debug) {
					console.log("SmartPlugin :: " + this.pluginName + " :: Invalid balance object");
				}
				this.balancing = false;
			}
		} else {
			if (this.debug) {
				console.log("SmartPlugin :: " + this.pluginName + " :: Balance unavailable with current parameters");
			}
			this.balancing = false;
		}
	} catch (error) {
		if (this.debug) {
			console.log("SmartPlugin :: " + this.pluginName + " :: setBalancedResource :: Error: " + error);
		}
	}
};

SmartPlugin.prototype.checkBuffering = function () {
	try {
		/*
		if (this.isBuffering) {
		    if (this.isStartSent) { this.setBufferEvent(this.mediaEvents.BUFFER_END,0); }
		    this.isBuffering = false;
		}
		*/
	} catch (error) {
		if (this.debug) {
			console.log("SmartPlugin :: " + this.pluginName + " :: checkBuffering :: Error: " + error);
		}
	}
};

SmartPlugin.prototype.setBufferEvent = function (bufferState, diffTime) {
	try {
		var d = new Date();
		var bufferTimeEnd = 0;
		var bufferTimeTotal = 0;
		diffTime = diffTime || 0;

		switch (bufferState) {
		case this.mediaEvents.BUFFER_BEGIN:
			this.bufferTimeBegin = d.getTime();
			if (this.joinTimeBegin == 0) {
				this.joinTimeBegin = d.getTime();
			}
			break;

		case this.mediaEvents.BUFFER_END:
			bufferTimeEnd = d.getTime();
			bufferTimeTotal = bufferTimeEnd - this.bufferTimeBegin;
			if (bufferTimeTotal > diffTime) {
				bufferTimeTotal -= diffTime;
			}
			if (this.isJoinSent == false) {
				//workaround for jointime in replays
				if (this.joinTimeBegin === 0) {
					this.joinTimeBegin = d.getTime();
				}
				var joinTimeTotal = d.getTime() - this.joinTimeBegin;
				if (this.isStartSent) {
					this.isJoinSent = true;
					this.apiClass.sendJoin(this.currentTime, joinTimeTotal);
				}
				if (this.debug) {
					console.log("SmartPlugin :: " + this.pluginName + " :: setBufferEvent :: sendJoin");
				}
			} else {
				var currentTime = this.currentTime;
				if (currentTime == 0 && this.isLive) {
					currentTime = 10;
				}
				//We need to defend ourselves from micro buffer events
				if (bufferTimeTotal > 100) {
					if (this.isStartSent) {
						this.apiClass.sendBuffer(currentTime, bufferTimeTotal);
					}
					if (this.debug) {
						console.log("SmartPlugin :: " + this.pluginName + " :: setBufferEvent :: sendBuffer");
					}
				}
			}
			break;
		}
	} catch (error) {
		if (this.debug) {
			console.log("SmartPlugin :: " + this.pluginName + " :: setBufferEvent :: Error: " + error);
		}
	}
};

SmartPlugin.prototype.setPing = function () {
	try {
		var that = this;
		this.pingTimer = setTimeout(function () {
			that.ping();
		}, this.apiClass.getPingTime());
	} catch (error) {
		if (this.debug) {
			console.log("SmartPlugin :: " + this.pluginName + " :: setPing :: Error: " + error);
		}
	}
};

SmartPlugin.prototype.ping = function () {
	try {
		clearTimeout(this.pingTimer);
		this.pingTimer = null;
		this.setPing();
		if (this.currentBitrate == 0) {
			this.checkBitrateType();
		}
		if (this.isStartSent) {
			this.apiClass.sendPingTotalBytes(this.currentBitrate, this.currentTime);
		}
	} catch (error) {
		if (this.debug) {
			console.log("SmartPlugin :: " + this.pluginName + " :: Pîng :: Error: " + error);
		}
	}
};

SmartPlugin.prototype.defineWatch = function () {
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
		this.setWatch();
	} catch (error) {
		if (this.debug) {
			console.log("SmartPlugin :: " + this.pluginName + " :: defineWatch :: Error: " + error);
		}
	}
};

SmartPlugin.prototype.setWatch = function () {
	try {
		var varsToWatch = ["balancing", "balanceObject", "balanceIndex", "videoPlayer", "urlResource", "currentTime", "isStreamError", "isBuffering", "isStartSent", "isJoinSent", "isPaused", "bufferTimeBegin", "joinTimeBegin", "joinTimeEnd"];
		for (elem in varsToWatch) {
			if (typeof varsToWatch[elem] != "function") {
				this.watch(varsToWatch[elem], function (id, oldVal, newVal) {
					console.log("SmartPlugin :: " + this.pluginName + " :: Watcher :: [" + id + "] From: [" + oldVal + "] To: [" + newVal + "]");
					return newVal;
				});
			}
		}
	} catch (error) {
		if (this.debug) {
			console.log("SmartPlugin :: " + this.pluginName + " :: setWatch :: Error: " + error);
		}
	}
};

SmartPlugin.prototype.reset = function (origin) {
	try {
		clearTimeout(this.pingTimer);
		clearInterval(this.bitrateTimer)
		this.currentBitrate = 0;
		if (origin == "unload") {
			this.apiClass.sendStopResumeSafe();
		} else {
			this.apiClass.sendStop();
		}
		this.currentTime = 0;
		this.isLive = getYouboraData().getLive();
		this.duration = 0;
		this.previousElapsedTime = 0;
		this.isPaused = false;
		this.isStartSent = false;
		this.bufferTimeBegin = 0;
		this.isJoinSent = false;
		this.joinTimeBegin = 0;
		this.joinTimeEnd = 0;
		this.pingTimer = "";
		this.balanceIndex = 0;
		this.balanceObject = "";
		if (origin === 'error') {
			this.apiClass.reset();
		}
		//this.apiClass = new YouboraCommunication(getYouboraData().getAccountCode(), getYouboraData().getService(), this.bandwidth, this.pluginVersion, this.targetDevice);
	} catch (error) {
		if (this.debug) {
			console.log("SmartPlugin :: " + this.pluginName + " :: reset :: Error: " + error);
		}
	}
};

SmartPlugin.prototype.watcher = function () {
	try {
		if (this.isJoinSent && !this.isPaused) {
			var currentTime = this.currentTime * 1000;

			if (this.bufferLastTime !== currentTime) {
				// Update the lastTime if the time has changed.
				this.bufferLastTime = currentTime;

				if (this.isBuffering) {
					var delta = new Date().getTime() - this.bufferTimeBegin;
					this.isBuffering = false;
					this.apiClass.sendBuffer(this.currentTime, delta);

				}
			} else if (this.bufferLastTime - currentTime < this.bufferRange && !this.isPaused) {
				if (!this.isBuffering) {
					this.bufferTimeBegin = new Date().getTime();
					this.isBuffering = true;

				}
			}
		}
	} catch (error) {
		if (this.debug) {
			console.log("SmartPlugin :: " + this.pluginName + " :: watcher :: " + error);
		}
	}
}

function getYouboraData() {
	if (typeof youboraDataMap !== 'undefined') {
		return youboraDataMap.get(this.playerId);
	} else {
		return youboraData;
	}
}
