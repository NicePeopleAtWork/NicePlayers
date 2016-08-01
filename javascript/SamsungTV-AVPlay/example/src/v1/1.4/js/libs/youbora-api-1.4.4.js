/*
 * YouboraCommunication
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Miguel Angel Zambrana & Biel Conde
 * Contributor: Jordi Aguilar
 * Version: 1.4.4
 */

//ie console.log hack
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

function YouboraCommunication(system, service, bandwidth, pluginVersion, targetDevice, playerId) {
	try {

		this.version = "1.4.4";

		// user
		this.system = system;
		this.service = service;
		this.bandwidth = bandwidth;

		// configuration
		this.pluginVersion = pluginVersion;
		this.targetDevice = targetDevice;
		this.outputFormat = "xml";
		this.xmlHttp = null;
		this.isXMLReceived = false;

		// multi
		this.playerId = playerId;

		// urls
		this.pamBufferUnderrunUrl = "";
		this.pamSeekUrl = "";
		this.pamJoinTimeUrl = "";
		this.pamStartUrl = "";
		this.pamStopUrl = "";
		this.pamPauseUrl = "";
		this.pamResumeUrl = "";
		this.pamPingUrl = "";
		this.pamErrorUrl = "";
		this.pamAdsUrl = "";

		// code7
		this.pamCode = "";
		this.pamCodeOrig = "";
		this.pamCodeCounter = 0;

		// ping
		this.pamPingTime = 5000;
		this.lastPingTime = 0;
		this.diffTime = 0;

		// queue events
		this.canSendEvents = false;
		this.eventQueue = [];
		this.startSent = false;
		this.eventsQueueSent = false;

		// fast data
		this.fastDataValid = false;

		// debug
		this.debug = this.getYouboraData().getDebug();
		this.debugHost = "";

		// concurrency timer
		var self = this;
		this.concurrencyTimer = "";

		// resume timer
		this.resumeInterval = "";
		this.currentTime = 0;
		this.wasResumed = 0;

		// balance callback
		this.balancedUrlsCallback = function () {};
		this.balancedCallback = function () {};

		this.cdnNodeDataSendRequest = false;
		this.cdnNodeDataRequestFinished = false;
		this.checkM3U8 = false;

		// Node Host data
		this.nodeHostDataStart = {
			host: "",
			type: ""
		};

		this.cdnTypes = {
			UNKNOWN: 0,
			TCP_HIT: 1,
			TCP_MISS: 2,
			TCP_MEM_HIT: 3,
			TCP_IMS_HIT: 4,
			ORIGIN_PULL: 5,
			CACHED_DELIVERY: 6
		};

		this.l3IsNodeSend = false;
		this.resourcePath = "";
		this.protocol = "http://";



		this.createXMLHttpRequest = function () {
			if (window.XMLHttpRequest) {
				//Firefox, Opera, IE7, and other browsers will use the native object
				return new XMLHttpRequest();
			} else {
				//IE 5 and 6 will use the ActiveX control
				return new ActiveXObject("Microsoft.XMLHTTP");
			}
		};

		this.getRealResourceHLS = function (resource, callback) {
			try {
				var that = this;
				var extension = null;
				try {
					extension = /\.([0-9a-zA-Z]+)(?:[\?#]|$)/.exec(resource)[1].toLowerCase();
				} catch (e) {}

				if (extension == 'm3u8' && this.getYouboraData().getParseHLS()) {
					this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
					this.xmlHttp.context = this;
					this.xmlHttp.open("GET", resource, true);

					arrayURL = resource.split('/');
					absoluteURL = resource.replace(arrayURL[arrayURL.length - 1], '');

					this.xmlHttp.onreadystatechange = function () {
						if (this.readyState == 4 && this.status == 200) {
							var file = this.responseText.split('\n');
							var newUrl = resource;
							for (var key in file) {
								var matches = /^https*:\/\/.*((\.m3u8|\.ts|\.mp4))/i.exec(file[key]);

								if (matches !== null) {
									newUrl = file[key];
									break;
								}
							}

							if (/^https*:\/\/.*((\.ts|\.mp4))/i.exec(newUrl) !== null) {
								that.getRealResourceHLS(newUrl, callback);
							} else {
								if (/^https*:\/\//i.exec(newUrl) === null)
									newUrl = absoluteURL + newUrl;

								that.getRealResourceHLS(newUrl, callback);
							}
						}
					}

					this.xmlHttp.send();

				} else {
					this.getYouboraData().setCDNNodeDataObtained(true);
					this.getYouboraData().setMediaResource(resource);
					this.checkM3U8 = true;
					callback();
				}
			} catch (err) {
				if (this.debug) {
					console.log("YouboraCommunication :: Error: HLSParser :: " + err)
				}
			}
		};

		if (this.getYouboraData().getHttpSecure() == true) {
			this.protocol = "https://";
		}

		if (typeof this.getYouboraData() != "undefined") {
			if (this.getYouboraData().concurrencyProperties.enabled) {
				this.concurrencyTimer = setInterval(function () {
					self.checkConcurrencyWork();
				}, 10000);
				if(this.debug) { console.log("YouboraCommunication :: Concurrency :: Enabled"); }
			} else {
				if(this.debug) { console.log("YouboraCommunication :: Concurrency :: Disabled"); }
			}
			if (this.getYouboraData().resumeProperties.resumeEnabled) {
				this.checkResumeState();
				if(this.debug) { console.log("YouboraCommunication :: Resume :: Enabled"); }
			} else {
				if(this.debug) { console.log("YouboraCommunication :: Resume :: Disabled"); }
			}
			if (this.getYouboraData().cdn_node_data == true) {
				if(this.debug) { console.log("YouboraCommunication :: Level3 :: Enabled"); }
			} else {
				if(this.debug) { console.log("YouboraCommunication :: Level3 :: Disabled"); }
			}
			if (this.getYouboraData().getBalanceEnabled()) {
				if(this.debug) { console.log("YouboraCommunication :: Balancer :: Enabled"); }
			} else {
				if(this.debug) { console.log("YouboraCommunication :: Balancer :: Disabled"); }

			}
		} else {
			if(this.debug) { console.log("YouboraCommunication :: Unable to reach this.getYouboraData() :: Concurrency / Resume / Level3 :: Disabled"); }
		}

		if (this.getYouboraData().getHttpSecure() == true) {
			this.protocol = "https://";
		}

		this.init();

	} catch (error) {
		if(this.debug) { console.log("YouboraCommunication :: Error: " + error); }
	}
}

YouboraCommunication.prototype.init = function () {
	try {
		var context = this;
		this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
		this.xmlHttp.context = this;
		this.xmlHttp.addEventListener("load", function (httpEvent) {
			this.context.loadAnalytics(httpEvent);
		}, false);
		if (this.getYouboraData().getHttpSecure() == true) {
			this.service = this.protocol + this.service.split("//")[1];
		}
		var urlDataWithCode = this.service + "/data?system=" + this.system + "&pluginVersion=" + this.pluginVersion + "&targetDevice=" + this.targetDevice + "&outputformat=" + this.outputFormat;
		if (this.getYouboraData().getNqsDebugServiceEnabled() == true) {
			urlDataWithCode = urlDataWithCode + "&nqsDebugServiceEnabled=true";
		}
		this.xmlHttp.open("GET", urlDataWithCode, true);
		this.xmlHttp.send();

		// Get Original chunk from HLS, or get NodeHost/NodeType
		this.resourceTreatment();

		if(this.debug) { console.log("YouboraCommunication :: HTTP Fastdata Request :: " + urlDataWithCode); }
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
	}
};

YouboraCommunication.prototype.resourceTreatment = function () {
	try {
		var that = this;
		if (this.getYouboraData().getMediaResource() !== undefined && this.getYouboraData().getMediaResource() !== "") {
			this.getRealResourceHLS(this.getYouboraData().getMediaResource(), function () {
				if (that.getYouboraData().getCDNNodeData()) {
					that.getLevel3Header();
				} else {
					that.cdnNodeDataSendRequest = true;
					that.cdnNodeDataRequestFinished = true;
					that.sendEventsFromQueue();
				}
			});
		}
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: resourceTratment " + err); }
	}
};

YouboraCommunication.prototype.cdnNodeHostReady = function () {
	if (this.getYouboraData().cdn_node_data == false) {
		if (this.getYouboraData().parseHLS == false) {
			return true;
		}
	}
	if (this.cdnNodeDataSendRequest && this.cdnNodeDataRequestFinished)
		return true;

	return false;
};

YouboraCommunication.prototype.cleanResource = function (originalResource) {
	return originalResource.split("?")[0];
};

YouboraCommunication.prototype.getLevel3Header = function () {
	if (typeof this.getYouboraData() != "undefined") {
		var context = this;

		if (this.getYouboraData().cdn_node_data == false) return;

		if (this.cdnNodeDataSendRequest) return;

		if (this.getYouboraData().getMediaResource().length > 0) {
			try {
				this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
				this.xmlHttp.context = this;
				this.xmlHttp.addEventListener("load", function (httpEvent) {
					try {
						var header = httpEvent.target.getResponseHeader('X-WR-DIAG').toString();
						this.context.parseL3Header(header, 1);
					} catch (e) {
						if(this.debug) { console.log("YouboraCommunication :: Level3 :: Error parsing header" + e); }
						this.context.getAkamaiHeader();
					}
				}, true);

				this.xmlHttp.addEventListener("error", function (httpEvent) {
					this.context.getAkamaiHeader();
				}, true);

				this.xmlHttp.open("head", this.cleanResource(this.getYouboraData().getMediaResource()), true);
				this.xmlHttp.setRequestHeader('X-WR-Diag', 'host');
				this.xmlHttp.send();

				// Sent Request Flag
				this.cdnNodeDataSendRequest = true;

				if(this.debug) { console.log("YouboraCommunication :: HTTP LEVEL3 Header Request :: " + this.getYouboraData().getMediaResource()); }
			} catch (error) {
				if(this.debug) { console.log("YouboraCommunication :: Level3 :: Error with header, disabling header check"); }
				this.context.getAkamaiHeader();
			}
		}
	}
};

YouboraCommunication.prototype.parseL3Header = function (header, typeCall) {
	try {
		var l3Response = header;
		l3Response = l3Response.split(" ");
		l3Response.host = l3Response[0].replace("Host:", "");
		l3Response.type = l3Response[1].replace("Type:", "");

		if (l3Response.type == "TCP_HIT") {
			l3Response.type = this.cdnTypes.TCP_HIT;
		} else if (l3Response.type == "TCP_MISS") {
			l3Response.type = this.cdnTypes.TCP_MISS;
		} else if (l3Response.type == "TCP_MEM_HIT") {
			l3Response.type = this.cdnTypes.TCP_MEM_HIT;
		} else if (l3Response.type == "TCP_IMS_HIT") {
			l3Response.type = this.cdnTypes.TCP_IMS_HIT;
		} else {
			if(this.debug) { console.log("YouboraCommunication :: Level3 :: Unknown type received: " + l3Response.type); }
			l3Response.type = this.cdnTypes.UNKNOWN;
		}

		this.nodeHostDataStart.host = l3Response.host;
		this.nodeHostDataStart.type = l3Response.type;

		if(this.debug) { console.log("YouboraCommunication :: Level3 :: onLoad :: Host: " + this.nodeHostDataStart.host + " :: Type: " + this.nodeHostDataStart.type); }
		this.getYouboraData().setCDNNodeDataObtained(true);

		this.cdnNodeDataRequestFinished = true;
		this.sendEventsFromQueue();

		return true;
	} catch (error) {
		this.getYouboraData().setCDNNodeData(false);
		if(this.debug) { console.log("YouboraCommunication :: Level3 :: Error with header, disabling header check" + error); }

		this.cdnNodeDataRequestFinished = true;
		this.sendEventsFromQueue();

		return false;
	}
};

YouboraCommunication.prototype.parseHighwindsHeader = function (header, typeCall) {
	try {
		var response = /.+,[0-9]+.(.+).(.+)/.exec(header);
		response.host = response[1];
		response.type = response[2];

		if (response.type == "p") {
			response.type = this.cdnTypes.ORIGIN_PULL;
		} else if (response.type == "c") {
			response.type = this.cdnTypes.CACHED_DELIVERY;
		} else {
			if(this.debug) { console.log("YouboraCommunication :: Highwinds :: Unknown type received: " + response.type); }
			response.type = this.cdnTypes.UNKNOWN;
		}		

		this.nodeHostDataStart.host = response.host;
		this.nodeHostDataStart.type = response.type;

		if(this.debug) { console.log("YouboraCommunication :: Highwinds :: onLoad :: Host: " + this.nodeHostDataStart.host + " :: Type: " + this.nodeHostDataStart.type); }
		this.getYouboraData().setCDNNodeDataObtained(true);

		this.cdnNodeDataRequestFinished = true;
		this.sendEventsFromQueue();

		return true;		
	} catch (error) {
		this.getYouboraData().setCDNNodeData(false);
		if(this.debug) { console.log("YouboraCommunication :: Highwinds :: Error with header, disabling header check" + error); }

		this.cdnNodeDataRequestFinished = true;
		this.sendEventsFromQueue();

		return false;
	}
};

YouboraCommunication.prototype.getAkamaiHeader = function () {
	try {
		var context = this;
		if (this.getYouboraData().cdn_node_data == false) return;

		if (this.getYouboraData().getMediaResource().length > 0) {
			this.xmlHttp = this.createXMLHttpRequest(); //new XMLHttpRequest();
			this.xmlHttp.context = this;

			this.xmlHttp.addEventListener("load", function (httpEvent) {
				var header;
				try {
					header = httpEvent.target.getResponseHeader('X-HW');
					this.context.parseHighwindsHeader(header);
				} catch (e) {
					if(this.debug) { console.log("YouboraCommunication :: Highwinds :: Error parsing header" + e); }
				}

				if(header == undefined) {
					try {
						header = httpEvent.target.getResponseHeader('X-Cache');
						this.context.parseAkamaiHeader(header);
					} catch (e) {
						if(this.debug) { console.log("YouboraCommunication :: Akamai :: Error parsing header" + e); }
						this.getYouboraData().setCDNNodeData(false);

						this.cdnNodeDataRequestFinished = true;
						this.context.sendEventsFromQueue();
					}					
				}
			}, true);

			this.xmlHttp.addEventListener("error", function (httpEvent) {
				this.context.cdnNodeDataSendRequest = true;
				this.context.cdnNodeDataRequestFinished = true;
				this.context.sendEventsFromQueue();
			}, true);

			this.xmlHttp.open("head", this.cleanResource(this.getYouboraData().getMediaResource()), true);
			this.xmlHttp.send();

			// Sent Request Flag
			this.cdnNodeDataSendRequest = true;
		}
	} catch (err) {
		this.cdnNodeDataRequestFinished = true;
		this.sendEventsFromQueue();
		this.getYouboraData().setCDNNodeData(false);
		if(this.debug) { console.log("YouboraCommunication :: Akamai :: Error with header, disabling header check"); }
	}

};

YouboraCommunication.prototype.parseAkamaiHeader = function (header) {
	try {
		var l3Response = header;
		l3Response = l3Response.split(" ");
		l3Response.type = l3Response[0].replace("Type:", "");
		l3Response.host = l3Response[3].split("/")[1].replace(")", "");

		if (l3Response.type == "TCP_HIT") {
			l3Response.type = this.cdnTypes.TCP_HIT;
		} else if (l3Response.type == "TCP_MISS") {
			l3Response.type = this.cdnTypes.TCP_MISS;
		} else if (l3Response.type == "TCP_MEM_HIT") {
			l3Response.type = this.cdnTypes.TCP_MEM_HIT;
		} else if (l3Response.type == "TCP_IMS_HIT") {
			l3Response.type = this.cdnTypes.TCP_IMS_HIT;
		} else {
			//if (this.debug) {
			if(this.debug) { console.log("YouboraCommunication :: Akamai :: Unknown type received: " + l3Response.type); }
			//}
			l3Response.type = this.cdnTypes.UNKNOWN;
		}

		this.nodeHostDataStart.host = l3Response.host;
		this.nodeHostDataStart.type = l3Response.type;

		if(this.debug) { console.log("YouboraCommunication :: Akamai :: onLoad :: Host: " + this.nodeHostDataStart.host + " :: Type: " + this.nodeHostDataStart.type); }

		this.cdnNodeDataRequestFinished = true;
		this.sendEventsFromQueue();

		return true;
	} catch (error) {
		this.getYouboraData().setCDNNodeData(false);

		this.cdnNodeDataRequestFinished = true;
		this.sendEventsFromQueue();

		if(this.debug) { console.log("YouboraCommunication :: Akamai :: Error with header, disabling header check" + error); }

		return false;
	}
};

YouboraCommunication.prototype.checkResumeState = function () {
	var resumeService = this.getYouboraData().getResumeService();
	var resumeContentId = this.getYouboraData().getContentId();
	var resumeUserid = this.getYouboraData().getUsername();
	var context = this;

	resumeService = this.protocol + resumeService.split("//")[1];

	if (this.getYouboraData().getResumeEnabled()) {
		if (resumeContentId.length > 0) {
			if (resumeUserid.length > 0) {
				try {
					this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
					this.xmlHttp.context = this;
					this.xmlHttp.addEventListener("load", function (httpEvent) {
						this.context.validateResumeStatus(httpEvent);
					}, false);
					var urlDataWithCode = resumeService + "?contentId=" + resumeContentId + "&userId=" + resumeUserid + "&random=" + Math.random();
					this.xmlHttp.send();
					if(this.debug) { console.log("YouboraCommunication :: checkResumeState :: HTTP Reusme Request :: " + urlDataWithCode); }
					if(this.debug) { console.log("YouboraCommunication :: checkResumeState :: Resume :: Enabled"); }
				} catch (error) {
					clearInterval(this.resumeInterval);
					if(this.debug) { console.log("YouboraCommunication :: checkResumeState :: Error while performig resume petition ::" + error); }
				}
			} else {
				if(this.debug) { console.log("YouboraCommunication :: checkResumeState :: Resume enabled without username defined :: Resume Disabled"); }
			}
		} else {
			if(this.debug) { console.log("YouboraCommunication :: checkResumeState :: Resume enabled without contentId defined :: Resume Disabled"); }
		}
	} else {
		if(this.debug) { console.log("YouboraCommunication :: checkResumeState :: Resume disabled in data. "); }
	}
};

YouboraCommunication.prototype.validateResumeStatus = function (httpEvent) {
	try {
		if (httpEvent.target.readyState == 4) {
			var response = httpEvent.target.response.toString();
			if (response > 0) {
				var resumeCallback = this.getYouboraData().getResumeCallback();
				if(this.debug) { console.log("YouboraCommunication :: Resume :: Available ::"); }
				if (typeof resumeCallback == "function") {
					this.wasResumed = 1;
					resumeCallback(response);
					if(this.debug) { console.log("YouboraCommunication :: Resume :: Executed Function"); }
				} else if (typeof resumeCallback == "string") {
					eval(resumeCallback);
				} else {
					if(this.debug) { console.log("YouboraCommunication :: Unable to determine callback type!"); }
				}
			} else if (response == "0") {
				if(this.debug) { console.log("YouboraCommunication :: Resume :: No previous state..."); }
			} else {
				clearInterval(this.resumeInterval);
				if(this.debug) { console.log("YouboraCommunication :: Resume :: Empty response... stoping rsume."); }
			}
		}
	} catch (error) {
		clearInterval(this.resumeInterval);
		if(this.debug) { console.log("YouboraCommunication :: validateResumeStatus :: Error: " + error); }
	}
};

YouboraCommunication.prototype.sendPlayTimeStatus = function () {
	var mainContext = this;
	var playTimeService = this.getYouboraData().getPlayTimeService();
	var resumeContentId = this.getYouboraData().getContentId();
	var resumeUserid = this.getYouboraData().getUsername();

	playTimeService = this.protocol + playTimeService.split("//")[1];
	try {
		if (this.getYouboraData().getResumeEnabled()) {
			this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
			this.xmlHttp.addEventListener("load", function (httpEvent) {}, false);
			var urlDataWithCode = playTimeService + "?contentId=" + resumeContentId + "&userId=" + resumeUserid + "&playTime=" + Math.round(this.currentTime) + "&random=" + Math.random();
			this.xmlHttp.open("GET", urlDataWithCode, true);
			this.xmlHttp.send();
			if(this.debug) { console.log("YouboraCommunication :: HTTP Resume Request :: " + urlDataWithCode); }
		} else {
			if(this.debug) { console.log("YouboraCommunication :: sendPlayTimeStatus :: Resume disabled in data."); }
		}
	} catch (error) {
		clearInterval(this.resumeInterval);
		if(this.debug) { console.log("YouboraCommunication :: sendPlayTimeStatus :: Error: " + error); }
	}
};

YouboraCommunication.prototype.enableResume = function () {
	try {
		this.getYouboraData().setResumeEnabled(true);
		var context = this;
		clearInterval(this.resumeInterval);
		this.resumeInterval = setInterval(function () {
			context.sendPlayTimeStatus();
		}, 6000);
		this.checkResumeState();
		if(this.debug) { console.log("YouboraCommunication :: enableResume :: Resume is now enabled"); }
	} catch (err) {
		clearInterval(this.resumeInterval);
		if(this.debug) { console.log("YouboraCommunication :: enableResume :: Error: " + err); }
	}
};

YouboraCommunication.prototype.disableResume = function () {
	try {
		this.getYouboraData().setResumeEnabled(false);
		clearInterval(this.resumeInterval);
		if(this.debug) { console.log("YouboraCommunication :: disableResume :: Resume is now disabled"); }
	} catch (err) {
		clearInterval(this.resumeInterval);
		if(this.debug) { console.log("YouboraCommunication :: disableResume :: Error: " + err); }
	}
};

YouboraCommunication.prototype.getPingTime = function () {
	return this.pamPingTime;
};

YouboraCommunication.prototype.sendStartL3 = function (totalBytes, referer, properties, isLive, resource, duration, transcode) {
	this.sendStart(totalBytes, referer, properties, isLive, resource, duration, transcode);
};

YouboraCommunication.prototype.sendStart = function (totalBytes, referer, properties, isLive, resource, duration, transcode) {
	try {
		if ((transcode == undefined) || (transcode == "undefined") || (transcode == "")) {
			transcode = this.getYouboraData().getTransaction();
		}
		if (duration == undefined || duration == "undefined") {
			duration = 0;
		}
		this.bandwidth.username = this.getYouboraData().getUsername();

		if (resource != undefined && resource != "") {
			// Get Original chunk from HLS, or get NodeHost/NodeType
			this.resourceTreatment();
		} else {
			this.getYouboraData().setCDNNodeData(false);
		}

		var d = new Date();
		var params = "?pluginVersion=" + this.pluginVersion +
			"&pingTime=" + (this.pamPingTime / 1000) +
			"&totalBytes=" + totalBytes +
			"&referer=" + encodeURIComponent(referer) +
			"&user=" + this.bandwidth.username +
			"&properties=" + encodeURIComponent(JSON.stringify(this.getYouboraData().getProperties())) +
			"&live=" + isLive +
			"&transcode=" + transcode +
			"&system=" + this.system +
			"&duration=" + duration;

		params += this.getExtraParamsUrl(this.getYouboraData().getExtraParams());
		if (this.getYouboraData().isBalanced) {
			params += "&isBalanced=1";
		} else {
			params += "&isBalanced=0";
		}
		if (this.getYouboraData().hashTitle) {
			params += "&hashTitle=true";
		} else {
			params += "&hashTitle=false";
		}
		if (this.getYouboraData().getCDN() != "") {
			params += "&cdn=" + this.getYouboraData().getCDN();
		}
		if (this.getYouboraData().getISP() != "") {
			params += "&isp=" + this.getYouboraData().getISP();
		}
		if (this.getYouboraData().getIP() != "") {
			params += "&ip=" + this.getYouboraData().getIP();
		}

		params += "&isResumed=" + this.wasResumed;

		if (this.canSendEvents && this.cdnNodeHostReady()) {
			this.sendAnalytics(this.pamStartUrl, params, false);
		} else {
			this.addEventToQueue(YouboraCommunicationEvents.START, params);
		}

		if (this.getYouboraData().getResumeEnabled()) {
			var context = this;
			if(this.debug) { console.log("YouboraCommunication :: Resume :: Enabled"); }
			this.sendPlayTimeStatus();
			this.resumeInterval = setInterval(function () {
				context.sendPlayTimeStatus();
			}, 6000);
		}

		this.startSent = true;
		this.lastPingTime = d.getTime();

	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: sendStart :: " + err); }
	}

};

YouboraCommunication.prototype.sendError = function (errorCode, message) {
	try {
		var params = "";

		if (typeof errorCode != "undefined" && parseInt(errorCode) >= 0) {
			params = "?errorCode=" + errorCode + "&msg=" + message;
		} else {
			params = "?errorCode=9000&msg=" + message;
		}

		if (this.canSendEvents && this.cdnNodeHostReady()) {
			this.sendAnalytics(this.pamErrorUrl, params, false);
		} else {
			this.addEventToQueue(YouboraCommunicationEvents.ERROR, params);
		}
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: sendError :: " + err); }
	}
};

YouboraCommunication.prototype.sendErrorWithParameters = function (errorCode, message, totalBytes, referer, properties, isLive, resource, duration, transcode) {
	try {
		if (typeof errorCode == "undefined" || parseInt(errorCode) < 0) {
			errorCode = 9000;
		}

		var params = "?errorCode=" + errorCode + "&msg=" + message;
		params += this.createParamsUrl(totalBytes, referer, isLive, resource, duration);

		if (this.canSendEvents && this.cdnNodeHostReady()) {
			this.sendAnalytics(this.pamErrorUrl, params, false);
		} else {
			this.addEventToQueue(YouboraCommunicationEvents.ERROR, params);
		}

	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
	}
};

//Same as error with parameters but with the player
YouboraCommunication.prototype.sendAdvancedError = function (errorCode, player, message, totalBytes, referer, properties, isLive, resource, duration, transcode) {
	try {
		var params = "?errorCode=" + encodeURIComponent(errorCode) + "&msg=" + encodeURIComponent(message);
		params += "&player=" + player;
		params += this.createParamsUrl(totalBytes, referer, isLive, resource, duration);

		if (this.canSendEvents && this.cdnNodeHostReady()) {
			this.sendAnalytics(this.pamErrorUrl, params, false);
		} else {
			this.addEventToQueue(YouboraCommunicationEvents.ERROR, params);
		}
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: sendAdvancedError :: " + err); }
	}
};

YouboraCommunication.prototype.createParamsUrl = function (totalBytes, referer, isLive, resource, duration) {
	try {
		var transcode = this.getYouboraData().getTransaction();
		if (duration == undefined || duration == "undefined") {
			duration = 0;
		}

		this.bandwidth.username = this.getYouboraData().getUsername();

		var d = new Date();

		var params = "&pluginVersion=" + this.pluginVersion +
			"&pingTime=" + (this.pamPingTime / 1000) +
			"&totalBytes=" + totalBytes +
			"&referer=" + encodeURIComponent(referer) +
			"&user=" + this.bandwidth.username +
			"&properties=" + encodeURIComponent(JSON.stringify(this.getYouboraData().getProperties())) +
			"&live=" + isLive +
			"&transcode=" + transcode +
			"&system=" + this.system +
			"&resource=" + encodeURIComponent(resource) +
			"&duration=" + duration;

		params = params + this.getExtraParamsUrl(this.getYouboraData().getExtraParams());

		if (this.getYouboraData().isBalanced) {
			params += "&isBalanced=1";
		} else {
			params += "&isBalanced=0";
		}
		if (this.getYouboraData().hashTitle) {
			params += "&hashTitle=true";
		} else {
			params += "&hashTitle=false";
		}
		if (this.getYouboraData().getCDN() != "") {
			params += "&cdn=" + this.getYouboraData().getCDN();
		}
		if (this.getYouboraData().getISP() != "") {
			params += "&isp=" + this.getYouboraData().getISP();
		}
		if (this.getYouboraData().getIP() != "") {
			params += "&ip=" + this.getYouboraData().getIP();
		}

		return params;
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
	}

	return "";
};

YouboraCommunication.prototype.sendPingTotalBytes = function (totalBytes, currentTime) {
	try {
		if (this.startSent == false) {
			return;
		}
		if (currentTime > 0) {
			this.currentTime = currentTime;
		}
		var d = new Date();

		if (this.lastPingTime != 0) {
			this.diffTime = d.getTime() - this.lastPingTime;
		}
		this.lastPingTime = d.getTime();

		var params = "?diffTime=" + this.diffTime +
			"&totalBytes=" + totalBytes +
			"&pingTime=" + (this.pamPingTime / 1000) +
			"&dataType=0" +
			"&time=" + currentTime;

		if (this.canSendEvents && this.cdnNodeHostReady()) {
			this.sendAnalytics(this.pamPingUrl, params, true);
		} else {
			this.addEventToQueue(YouboraCommunicationEvents.PING, params);
		}
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
	}
};

YouboraCommunication.prototype.sendPingTotalBitrate = function (bitrate, currentTime) {
	try {
		if (this.startSent == false) {
			return;
		}
		if (currentTime > 0) {
			this.currentTime = currentTime;
		}
		var d = new Date();

		if (this.lastPingTime != 0) {
			this.diffTime = d.getTime() - this.lastPingTime;
		}
		this.lastPingTime = d.getTime();

		var params = "?diffTime=" + this.diffTime +
			"&bitrate=" + bitrate +
			"&pingTime=" + (this.pamPingTime / 1000) +
			"&time=" + currentTime;

		if (this.canSendEvents && this.cdnNodeHostReady()) {
			this.sendAnalytics(this.pamPingUrl, params, true);
		} else {
			this.addEventToQueue(YouboraCommunicationEvents.PING, params);
		}
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
	}
};

YouboraCommunication.prototype.sendJoin = function (currentTime, joinTimeDuration) {
	try {
		if (currentTime > 0) {
			this.currentTime = currentTime;
		}

		var params = "?eventTime=" + currentTime + "&time=" + joinTimeDuration;

		if (this.canSendEvents && this.cdnNodeHostReady()) {
			this.sendEventsFromQueue();
			this.sendAnalytics(this.pamJoinTimeUrl, params, false);
		} else {
			this.addEventToQueue(YouboraCommunicationEvents.JOIN, params);
		}

	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
	}
};

YouboraCommunication.prototype.sendJoinWithMediaDuration = function (currentTime, joinTimeDuration, mediaDuration) {
	try {
		if (currentTime > 0) {
			this.currentTime = currentTime;
		}

		var params = "?eventTime=" + currentTime + "&time=" + joinTimeDuration + "&mediaDuration=" + mediaDuration;

		if (this.canSendEvents && this.cdnNodeHostReady()) {
			this.sendAnalytics(this.pamJoinTimeUrl, params, false);
		} else {
			this.addEventToQueue(YouboraCommunicationEvents.JOIN, params);
		}

	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
	}
};

YouboraCommunication.prototype.sendBuffer = function (currentTime, bufferTimeDuration) {
	try {
		if (this.startSent == false) {
			return;
		}
		if (currentTime > 0) {
			this.currentTime = currentTime;
		}
		try {
			if (currentTime < 10 && this.getYouboraData().getLive()) {
				currentTime = 10;
			}
		} catch (err) {

		}
		var params = null;
		params = "?time=" + currentTime + "&duration=" + bufferTimeDuration;
		if (this.canSendEvents && this.cdnNodeHostReady()) {
			this.sendAnalytics(this.pamBufferUnderrunUrl, params, false);
		} else {
			this.addEventToQueue(YouboraCommunicationEvents.BUFFER, params);
		}
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
	}
};

YouboraCommunication.prototype.sendAds = function (currentTime, adsTimeDuration) {
	try {
		if (this.startSent == false) {
			return;
		}
		if (currentTime > 0) {
			this.currentTime = currentTime;
		}

		var params = "?time=" + currentTime + "&duration=" + adsTimeDuration;
		if (this.canSendEvents && this.cdnNodeHostReady()) {
			this.sendAnalytics(this.pamAdsUrl, params, false);
		} else {
			this.addEventToQueue(YouboraCommunicationEvents.ADS, params);
		}
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
	}
};

YouboraCommunication.prototype.sendSeek = function (currentTime, seekTimeDuration) {
	try {
		if (this.startSent == false) {
			return;
		}
		if (currentTime > 0) {
			this.currentTime = currentTime;
		}
		try {
			if (currentTime < 10 && this.getYouboraData().getLive()) {
				currentTime = 10;
			}
		} catch (err) {

		}
		var params = null;
		params = "?time=" + currentTime + "&duration=" + seekTimeDuration;
		if (this.canSendEvents && this.cdnNodeHostReady()) {
			this.sendAnalytics(this.pamSeekUrl, params, false);
		} else {
			this.addEventToQueue(YouboraCommunicationEvents.SEEK, params);
		}
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
	}
};

YouboraCommunication.prototype.sendResume = function () {
	try {
		if (this.startSent == false) {
			return;
		}

		var params = "";
		if (this.canSendEvents && this.cdnNodeHostReady()) {
			this.sendAnalytics(this.pamResumeUrl, params, false);
		} else {
			this.addEventToQueue(YouboraCommunicationEvents.RESUME, params);
		}
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
	}
};

YouboraCommunication.prototype.sendPause = function () {
	try {
		if (this.startSent == false) {
			return;
		}

		var params = "";
		if (this.canSendEvents && this.cdnNodeHostReady()) {
			this.sendAnalytics(this.pamPauseUrl, params, false);
		} else {
			this.addEventToQueue(YouboraCommunicationEvents.PAUSE, params);
		}
		if (this.getYouboraData().getResumeEnabled()) {
			this.sendPlayTimeStatus();
		}
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
	}
};

YouboraCommunication.prototype.sendStop = function () {
	try {
		if (this.startSent == false) {
			return;
		}
		this.currentTime = 0;
		if (this.getYouboraData().getResumeEnabled()) {
			this.sendPlayTimeStatus();
		}
		clearInterval(this.resumeInterval);

		var params = "?diffTime=" + this.diffTime;
		if (this.canSendEvents && this.cdnNodeHostReady()) {
			this.sendAnalytics(this.pamStopUrl, params, false);
		} else {
			this.addEventToQueue(YouboraCommunicationEvents.STOP, params);
		}
		this.reset();
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
	}
};

//Sends stop without affecting the data in resume. This is done
//because in case we close the play exiting the page instead of reaching the
//end of the video, we want the resume to keep its previous status
YouboraCommunication.prototype.sendStopResumeSafe = function () {
	try {
		if (this.startSent == false) {
			return;
		}

		clearInterval(this.resumeInterval);

		var params = "?diffTime=" + this.diffTime;
		if (this.canSendEvents && this.cdnNodeHostReady()) {
			this.sendAnalytics(this.pamStopUrl, params, false);
		} else {
			this.addEventToQueue(YouboraCommunicationEvents.STOP, params);
		}
		this.reset();
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
	}
};

YouboraCommunication.prototype.addEventToQueue = function (eventType, params) {
	try {
		var niceCommunicationObject = new YouboraCommunicationURL(eventType, params);
		this.eventQueue.push(niceCommunicationObject);
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
	}
};

YouboraCommunication.prototype.checkConcurrencyWork = function () {
	try {
		var mainContext = this;
		var cCode = this.getYouboraData().getConcurrencyCode();
		var cAccount = this.getYouboraData().getAccountCode();
		var cService = this.getYouboraData().getConcurrencyService();
		var cSession = this.getYouboraData().getConcurrencySessionId();
		var cMaxCount = this.getYouboraData().getConcurrencyMaxCount();
		var cUseIP = this.getYouboraData().getConcurrencyIpMode();
		var urlDataWithCode = "";

		cService = this.protocol + cService.split("//")[1];

		if (this.getYouboraData().getConcurrencyEnabled()) {
			var context = this;
			if (cUseIP) {
				this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
				this.xmlHttp.addEventListener("load", function (httpEvent) {
					context.validateConcurrencyResponse(httpEvent);
				}, false);
				urlDataWithCode = cService + "?concurrencyCode=" + cCode +
					"&accountCode=" + cAccount +
					"&concurrencyMaxCount=" + cMaxCount +
					"&random=" + Math.random();
				this.xmlHttp.open("GET", urlDataWithCode, true);
				this.xmlHttp.send();
			} else {
				this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
				this.xmlHttp.addEventListener("load", function (httpEvent) {
					context.validateConcurrencyResponse(httpEvent);
				}, false);
				urlDataWithCode = cService + "?concurrencyCode=" + cCode +
					"&accountCode=" + cAccount +
					"&concurrencySessionId=" + cSession +
					"&concurrencyMaxCount=" + cMaxCount +
					"&random=" + Math.random();
				this.xmlHttp.open("GET", urlDataWithCode, true);
				this.xmlHttp.send();
			}
			if(this.debug) { console.log("YouboraCommunication :: HTTP Concurrency Request :: " + urlDataWithCode); }
		} else {
			if(this.debug) { console.log("YouboraCommunication :: HTTP Concurrency Request :: " + urlDataWithCode); }
		}

	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: startConcurrencyWork :: Disabled in data."); }
	}
};

YouboraCommunication.prototype.validateConcurrencyResponse = function (httpEvent) {
	try {
		if (httpEvent.target.readyState == 4) {
			var mainContext = this;
			var response = httpEvent.target.response;
			if (response == "1") {
				this.sendError(14000, "CC_KICK");
				var cRedirect = this.getYouboraData().getConcurrencyRedirectUrl();
				if (typeof cRedirect == "function") {
					if(this.debug) { console.log("YouboraCommunication :: Concurrency :: Executed function"); }
					cRedirect();
				} else {
					if(this.debug) { console.log("YouboraCommunication :: Concurrency :: 1 :: Redirecting to: " + cRedirect); }
					window.location = cRedirect;
				}
			} else if (response == "0") {
				if(this.debug) { console.log("YouboraCommunication :: Concurrency :: 0 :: Continue..."); }
			} else {
				if(this.debug) { console.log("YouboraCommunication :: Concurrency :: Empty response... stoping validation."); }
				clearInterval(this.concurrencyTimer);
			}
		}
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: validateConcurrencyResponse :: Error: " + err); }
	}
};

YouboraCommunication.prototype.enableConcurrency = function () {
	try {
		this.getYouboraData().setConcurrencyEnabled(true);
		var context = this;
		clearInterval(this.concurrencyTimer);
		this.concurrencyTimer = setInterval(function () {
			context.checkConcurrencyWork();
		}, 10000);
		this.checkConcurrencyWork();
		if(this.debug) { console.log("YouboraCommunication :: enableConcurrency :: Concurrency is now enabled"); }
	} catch (err) {
		clearInterval(this.resumeInterval);
		if(this.debug) { console.log("YouboraCommunication :: enableConcurrency :: Error: " + err); }
	}
};

YouboraCommunication.prototype.disableConcurrency = function () {
	try {
		this.getYouboraData().setConcurrencyEnabled(false);
		clearInterval(this.concurrencyTimer);
		if(this.debug) { console.log("YouboraCommunication :: disableConcurrency :: Concurrency is now disabled"); }
	} catch (err) {
		clearInterval(this.resumeInterval);
		if(this.debug) { console.log("YouboraCommunication :: disableConcurrency :: Error: " + err); }
	}
};

YouboraCommunication.prototype.loadAnalytics = function (httpEvent) {
	var mainContext = this;
	try {
		if (httpEvent.target.readyState == 4) {

			if(this.debug) { console.log("YouboraCommunication :: Loaded XML FastData"); }
			var response = httpEvent.target.responseXML;
			var pamUrl;
			try {
				pamUrl = response.getElementsByTagName("h")[0].childNodes[0].nodeValue;
			} catch (err) {
				if(this.debug) { console.log("YouboraCommunication :: loadAnalytics :: Invalid Fast-Data Response!"); }
			}

			if ((pamUrl != undefined) && (pamUrl != "")) {
				this.pamBufferUnderrunUrl = this.protocol + pamUrl + "/bufferUnderrun";
				this.pamSeekUrl = this.protocol + pamUrl + "/seek";
				this.pamJoinTimeUrl = this.protocol + pamUrl + "/joinTime";
				this.pamStartUrl = this.protocol + pamUrl + "/start";
				this.pamStopUrl = this.protocol + pamUrl + "/stop";
				this.pamPauseUrl = this.protocol + pamUrl + "/pause";
				this.pamResumeUrl = this.protocol + pamUrl + "/resume";
				this.pamPingUrl = this.protocol + pamUrl + "/ping";
				this.pamErrorUrl = this.protocol + pamUrl + "/error";
				this.pamAdsUrl = this.protocol + pamUrl + "/ads";
			}

			try {
				this.pamCode = response.getElementsByTagName("c")[0].childNodes[0].nodeValue;
				this.pamCodeOrig = this.pamCode;
				this.pamPingTime = response.getElementsByTagName("pt")[0].childNodes[0].nodeValue * 1000;
				this.isXMLReceived = true;
				this.enableAnalytics = true;
				if(this.debug) { console.log("YouboraCommunication :: Mandatory :: Analytics Enabled"); }
			} catch (err) {
				this.enableAnalytics = false;
				if(this.debug) { console.log("YouboraCommunication :: Mandatory :: Analytics Disabled"); }
			}

			// Balance Fastdata Override
			try {
				this.enableBalancer = response.getElementsByTagName("b")[0].childNodes[0].nodeValue;
				if (this.enableBalancer == 1) {
					this.enableBalancer = true;
					if(this.debug) { console.log("YouboraCommunication :: Mandatory :: Balancer Enabled"); }
				} else {
					this.enableBalancer = false;
					if(this.debug) { console.log("YouboraCommunication :: Mandatory :: Balancer Disabled"); }
				}
			} catch (err) {
				if(this.debug) { console.log("YouboraCommunication :: Mandatory :: Balancer Disabled"); }
				this.enableBalancer = false;
			}

			// Can send events
			if (this.getYouboraData().enableAnalytics) {
				this.canSendEvents = true;
			}

			if (((pamUrl != undefined) && (pamUrl != "")) && ((this.pamCode != undefined) && (this.pamCode != ""))) {
				this.fastDataValid = true;
			}

			this.sendEventsFromQueue();

			// Debug
			try {
				mainContext.debug = response.getElementsByTagName("db")[0].childNodes[0].nodeValue;
			} catch (err) {}

			try {
				mainContext.debugHost = response.getElementsByTagName("dh")[0].childNodes[0].nodeValue;
			} catch (err) {
				mainContext.debugHost = "";
			}

			if (mainContext.debugHost.length > 0) {
				if(this.debug) { console.log("YouboraCommunication :: replaceConsoleEvents :: Binding to: " + this.debugHost); }
				this.replaceConsoleEvents();
				this.getYouboraData().setDebug(true);
			}

			// Get Original chunk from HLS, or get NodeHost/NodeType
			this.resourceTreatment();

			if (this.getYouboraData().concurrencyProperties.enabled && this.fastDataValid) {
				this.checkConcurrencyWork();
			}
		}

	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: loadAnalytics :: Error: " + err); }
	}
};

YouboraCommunication.prototype.cPing = function () {
	try {
		var context = this;
		this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
		this.xmlHttp.context = this;
		this.xmlHttp.addEventListener("load", function (httpEvent) {
			this.context.loadAnalytics(httpEvent);
		}, false);
		var urlDataWithCode = this.service + "/data?system=" + this.system + "&pluginVersion=" + this.pluginVersion + "&targetDevice=" + this.targetDevice + "&outputformat=" + this.outputFormat;
		this.xmlHttp.open("GET", urlDataWithCode, true);
		this.xmlHttp.send();
		if(this.debug) { console.log("YouboraCommunication :: HTTP Request :: " + urlDataWithCode); }
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: cPing :: " + err); }
	}
};

YouboraCommunication.prototype.replaceConsoleEvents = function () {
	try {
		var classContext = this;
		console = {
			log: function (data) {
				try {
					var time = new Date();
					var timeStamp = "[" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + "]";
					var xmlhttp;
					xmlhttp = this.createXMLHttpRequest(); // new XMLHttpRequest();

					xmlhttp.open("GET", classContext.debugHost + encodeURIComponent(timeStamp) + " |> " + data);
					xmlhttp.send();
				} catch (err) {}
			}
		};
		if(this.debug) { console.log("YouboraCommunication :: replaceConsoleEvents :: Done ::"); }
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: replaceConsoleEvents :: Error: " + err); }
	}
};

YouboraCommunication.prototype.sendEventsFromQueue = function () {
	try {
		if (this.canSendEvents && this.cdnNodeHostReady() && this.eventsQueueSent == false) {
			this.eventsQueueSent = true;
			var niceCommunicationObject = this.eventQueue.shift();
			var eventURL;
			var eventType;
			var params;

			while (niceCommunicationObject != null) {
				eventType = niceCommunicationObject.getEventType();
				params = niceCommunicationObject.getParams();
				if (eventType == YouboraCommunicationEvents.START) {
					eventURL = this.pamStartUrl;
				} else if (eventType == YouboraCommunicationEvents.JOIN) {
					eventURL = this.pamJoinTimeUrl;
				} else if (eventType == YouboraCommunicationEvents.BUFFER) {
					eventURL = this.pamBufferUnderrunUrl;
				} else if (eventType == YouboraCommunicationEvents.SEEK) {
					eventURL = this.pamSeekUrl;
				} else if (eventType == YouboraCommunicationEvents.PAUSE) {
					eventURL = this.pamPauseUrl;
				} else if (eventType == YouboraCommunicationEvents.RESUME) {
					eventURL = this.pamResumeUrl;
				} else if (eventType == YouboraCommunicationEvents.PING) {
					eventURL = this.pamPingUrl;
				} else if (eventType == YouboraCommunicationEvents.STOP) {
					eventURL = this.pamStopUrl;
				} else if (eventType == YouboraCommunicationEvents.ERROR) {
					eventURL = this.pamErrorUrl;
				}
				if (eventURL != null) {
					this.sendAnalytics(eventURL, params, false);
				}
				niceCommunicationObject = this.eventQueue.shift();
			}
		}
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
	}
};

YouboraCommunication.prototype.getBalancerUrls = function (url, callback) {
	try {
		var mainContext = this;
		this.balancedUrlsCallback = callback;
		if (!this.getYouboraData().enableBalancer) {
			mainContext.balancedUrlsCallback(false);
		} else {

			if (typeof this.getYouboraData() != "undefined") {

				var service = this.getYouboraData().getBalanceService();
				var balanceType = this.getYouboraData().getBalanceType();
				var zoneCode = this.getYouboraData().getBalanceZoneCode();
				var originCode = this.getYouboraData().getBalanceOriginCode();
				var systemCode = this.getYouboraData().getAccountCode();
				var token = this.getYouboraData().getBalanceToken();
				var pluginVersion = this.pluginVersion;
				var niceNVA = this.getYouboraData().getBalanceNVA();
				var niceNVB = this.getYouboraData().getBalanceNVB();
				var isLive = this.getYouboraData().getLive();

				this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
				this.xmlHttp.context = this;
				var urlDataWithCode = service + "?type=" + balanceType +
					"&systemcode=" + systemCode +
					"&zonecode=" + zoneCode +
					"&session=" + this.pamCode +
					"&origincode=" + originCode +
					"&resource=" + encodeURIComponent(url) +
					"&niceNva=" + niceNVA +
					"&niceNvb=" + niceNVB +
					"&live=" + isLive +
					"&token=" + this.getYouboraData().getBalanceToken();

				try {
					if (isLive == true) {
						urlDataWithCode += "&live=true";
					}
				} catch (e) {}

				this.xmlHttp.addEventListener("load", function (httpEvent) {
					var obj = httpEvent.target.response.toString();
					var objJSON = "";
					var error = false;
					try {
						objJSON = JSON.parse(obj);
					} catch (e) {
						error = true;
					}
					if (error == false) {
						try {
							var returnArray = [];
							var indexCount = 0;
							for (varindex in obj) {
								try {
									indexCount++;
									returnArray[index] = objJSON[indexCount]['URL'];
								} catch (e) {}
							}
							mainContext.balancedUrlsCallback(returnArray);
						} catch (e) {
							mainContext.balancedUrlsCallback(false)
						}
					} else {
						mainContext.balancedUrlsCallback(false)
					}
				}, false);
				this.xmlHttp.open("GET", urlDataWithCode, true);
				this.xmlHttp.send();
				if(this.debug) { console.log("YouboraCommunication :: HTTP GetBalancerUrls Request :: " + urlDataWithCode); }
			}
		}
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: getBalancerUrls :: Error: " + err); }
	}
};

YouboraCommunication.prototype.getBalancedResource = function (path, callback, referer) {
	try {
		var mainContext = this;

		if (!mainContext.getYouboraData().getBalanceEnabled()) {
			mainContext.balancedCallback(false);
		} else {
			mainContext.balancedCallback = callback;
			var service = mainContext.getYouboraData().getBalanceService();
			var balanceType = mainContext.getYouboraData().getBalanceType();
			var zoneCode = mainContext.getYouboraData().getBalanceZoneCode();
			var originCode = mainContext.getYouboraData().getBalanceOriginCode();
			var systemCode = mainContext.getYouboraData().getAccountCode();
			var token = mainContext.getYouboraData().getBalanceToken();
			var pluginVersion = mainContext.pluginVersion;
			var niceNVA = mainContext.getYouboraData().getBalanceNVA();
			var niceNVB = mainContext.getYouboraData().getBalanceNVB();
			var isLive = mainContext.getYouboraData().getLive();
			this.resourcePath = path;

			this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
			this.xmlHttp.context = this;
			var urlDataWithCode = service + "?type=" + balanceType +
				"&systemcode=" + systemCode +
				"&session=" + this.pamCode +
				"&zonecode=" + zoneCode +
				"&origincode=" + originCode +
				"&resource=" + encodeURIComponent(path) +
				"&niceNva=" + niceNVA +
				"&niceNvb=" + niceNVB +
				"&token=" + mainContext.getYouboraData().getBalanceToken();

			try {
				if (isLive == true) {
					urlDataWithCode += "&live=true";
				}
			} catch (e) {}


			this.xmlHttp.addEventListener("load", function (httpEvent) {
				var obj = httpEvent.target.response.toString();
				var objJSON = "";
				var error = false;
				try {
					objJSON = JSON.parse(obj);
				} catch (err) {

					error = true;
				}
				if (error == false) {
					mainContext.getYouboraData().extraParams.param13 = true;
					mainContext.balancedCallback(objJSON);
				} else {
					mainContext.balancedCallback(false)
				}
			}, false);
			this.xmlHttp.open("GET", urlDataWithCode, true);
			this.xmlHttp.send();
			if(this.debug) { console.log("YouboraCommunication :: HTTP Balance Request :: " + urlDataWithCode); }
		}
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: getBalancedResource :: Error: " + err); }
	}

};

YouboraCommunication.prototype.validateBalanceResponse = function (httpEvent) {
	try {
		if (httpEvent.target.readyState == 4) {

		}
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: validateBalanceResponse :: Error: " + err); }
	}
};

YouboraCommunication.prototype.sendAnalytics = function (url, data, hasResponse) {
	var mainContext = this;
	try {
		if (this.canSendEvents && this.fastDataValid) {
			this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
			this.xmlHttp.context = this;

			if (hasResponse) {
				this.xmlHttp.addEventListener("load", function (httpEvent) {
					this.context.parseAnalyticsResponse(httpEvent);
				}, false);
				this.xmlHttp.addEventListener("error", function () {
					this.context.sendAnalyticsFailed();
				}, false);
			} else {
				this.xmlHttp.addEventListener("load", function (httpEvent) {
					this.context.parseAnalyticsResponse(httpEvent);
				}, false);
				this.xmlHttp.addEventListener("error", function () {
					this.context.sendAnalyticsFailed();
				}, false);
			}

			var urlDataWithCode = "";

			if (data != "") {
				urlDataWithCode = url + data + "&code=" + this.pamCode + "&random=" + Math.random();
			} else {
				urlDataWithCode = url + "?code=" + this.pamCode + "&random=" + Math.random();
			}

			if (url.indexOf(this.pamStartUrl) != -1) {
				urlDataWithCode += "&resource=" + encodeURIComponent(this.getYouboraData().getMediaResource());
			}
			if (url.indexOf(this.pamStartUrl) != -1 && this.nodeHostDataStart.host != "" && this.nodeHostDataStart.type != "") {
				urlDataWithCode += "&nodeHost=" + this.nodeHostDataStart.host + "&nodeType=" + this.nodeHostDataStart.type;
			}

			if(this.debug) { console.log("YouboraCommunication :: HTTP Request :: " + urlDataWithCode); }
			this.xmlHttp.open("GET", urlDataWithCode, true);
			this.xmlHttp.send();
		}
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
	}
};

YouboraCommunication.prototype.parseAnalyticsResponse = function (httpEvent) {
	try {
		if (httpEvent.target.readyState == 4) {

		}
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: parseAnalyticsResponse :: Error: " + err); }
	}
};

YouboraCommunication.prototype.sendAnalyticsFailed = function () {
	try {
		if(this.debug) { console.log("YouboraCommunication :: Failed communication with nQs Service"); }
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: sendAnalyticsFailed :: Error: " + err); }
	}
};

YouboraCommunication.prototype.updateCode = function () {
	try {
		this.pamCodeCounter++;
		this.pamCode = this.pamCodeOrig + "_" + this.pamCodeCounter;
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: updateCode :: Error: " + err); }
	}
};

YouboraCommunication.prototype.reset = function () {
	try {
		this.lastPingTime = 0;
		this.diffTime = 0;
		this.startSent = false;
		this.nodeHostDataStart.host = "";
		this.nodeHostDataStart.type = "";
		this.cdnNodeDataSendRequest = false;
		this.cdnNodeDataRequestFinished = false;
		this.checkM3U8 = false;
		this.eventsQueueSent = false;
		this.updateCode();
		this.getYouboraData().setMediaResource('');
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: reset Error: " + err); }
	}
};

YouboraCommunication.prototype.getResourcePath = function (href) {
	//Standard methos as getting the path name from an url
	//may not work with files with extension not http
	var pathWithDomain = href.split("//")[1];
	var startPathIndex = pathWithDomain.indexOf("/");
	var resourcePath = pathWithDomain.substring(startPathIndex, href.length);
	return resourcePath;

};

YouboraCommunication.prototype.getExtraParamsUrl = function (extraParams) {

	var params = "";

	if (extraParams != undefined) {
		if ((extraParams['extraparam1'] != undefined))
			params += "&param1=" + extraParams['extraparam1'];
		if ((extraParams['extraparam2'] != undefined))
			params += "&param2=" + extraParams['extraparam2'];
		if ((extraParams['extraparam3'] != undefined))
			params += "&param3=" + extraParams['extraparam3'];
		if ((extraParams['extraparam4'] != undefined))
			params += "&param4=" + extraParams['extraparam4'];
		if ((extraParams['extraparam5'] != undefined))
			params += "&param5=" + extraParams['extraparam5'];
		if ((extraParams['extraparam6'] != undefined))
			params += "&param6=" + extraParams['extraparam6'];
		if ((extraParams['extraparam7'] != undefined))
			params += "&param7=" + extraParams['extraparam7'];
		if ((extraParams['extraparam8'] != undefined))
			params += "&param8=" + extraParams['extraparam8'];
		if ((extraParams['extraparam9'] != undefined))
			params += "&param9=" + extraParams['extraparam9'];
		if ((extraParams['extraparam10'] != undefined))
			params += "&param10=" + extraParams['extraparam10'];
	}

	return params;
};

YouboraCommunication.prototype.informEvent = function (event) {
	var nqsDebugCall = "http://nqs5.pam.nice264.com:8991/playerEvent";
	time = new Date().getTime();
	code = this.pamCode;
	var parameters = "?code=" + code + "&time=" + time + "&eventType=" + event;
	var url = nqsDebugCall + parameters;


	this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
	this.xmlHttp.context = this;

	if(this.debug) { console.log("YouboraCommunication :: HTTP Request :: " + url); }
	this.xmlHttp.open("GET", url, true);
	this.xmlHttp.send();
}

YouboraCommunication.prototype.getYouboraData = function () {
	try {
		if (typeof youboraDataMap !== 'undefined') {
			if (typeof this.playerId === 'undefined') {
				this.playerId = 'yb_player';
			}
			return youboraDataMap.get(this.playerId);
		} else {
			return youboraData;
		}
	} catch (err) {
		if(this.debug) { console.log("YouboraCommunication :: getYouboraData :: " + err); }
	}
};

YouboraCommunicationURL.prototype.getParams = function () {
	return this.params;
};

YouboraCommunicationURL.prototype.getEventType = function () {
	return this.eventType;
};

function YouboraCommunicationURL(eventType, params) {
	this.params = params;
	this.eventType = eventType;
}

var YouboraCommunicationEvents = {
	START: 0,
	JOIN: 1,
	BUFFER: 2,
	PING: 3,
	PAUSE: 4,
	RESUME: 5,
	STOP: 6,
	ERROR: 7,
	SEEK: 8
};
