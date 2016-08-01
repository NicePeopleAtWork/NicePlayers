/*
 * YouboraCommunication
 * Copyright (c) 2014 NicePeopleAtWork 
 * Author: Lluís Campos i Beltran
 * Version: 3.1.0
 */

function YouboraCommunicationsMap() {

    this.map = new Array();
    this.length=0;

    YouboraCommunicationsMap.prototype.put = function (playerId,youboraCommunication){
        
        if(this.map[playerId]==undefined){
            this.length ++;
        }

        this.map[playerId] = youboraCommunication;
        

    }

    YouboraCommunicationsMap.prototype.get = function (playerId){
        return this.map[playerId];
    }
}

function YouboraCommunication(system, service, bandwidth, pluginVersion, targetDevice,playerId) {
    try {

        // user		
        this.playerId = playerId;
        this.system = system;
        this.service = service;
        this.bandwidth = bandwidth;

        // configuration
        this.pluginVersion = pluginVersion;
        this.targetDevice = targetDevice;
        this.outputFormat = "xml";
        this.xmlHttp = null;
        this.isXMLReceived = false;

        // urls
        this.pamBufferUnderrunUrl = "";
        this.pamJoinTimeUrl = "";
        this.pamStartUrl = "";
        this.pamStopUrl = "";
        this.pamPauseUrl = "";
        this.pamResumeUrl = "";
        this.pamPingUrl = "";
        this.pamErrorUrl = "";

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

        // fast data
        this.fastDataValid = false;

        // debug
        this.debug = this.getYouboraData().getDebug();
        this.debugHost = "";

        // concurrency timer
        var self = this;
        this.concurrencyTimer = ""

        // resume timer 
        this.resumeInterval = "";
        this.currentTime = 0;
        this.wasResumed = 0;

        // balance callback
        this.balancedUrlsCallback = function () {};
        this.balancedCallback = function () {};

        // level 3 data
        this.l3dataStart = { host: "", type: "" }
        this.l3dataPing = { host: "", type: "" }
        this.l3types = { UNKNOWN: 0, TCP_HIT: 1, TCP_MISS: 2, TCP_MEM_HIT: 3, TCP_IMS_HIT: 4 }

        this.l3IsNodeSend = false;
        this.resourcePath;


        if (typeof this.getYouboraData() != "undefined") {
            if (this.getYouboraData().concurrencyProperties.enabled) {
                this.concurrencyTimer = setInterval(function () {
                    self.checkConcurrencyWork()
                }, 10000);
                if (this.debug) { console.log("YouboraCommunication :: Concurrency :: Enabled"); }
            } else {
                if (this.debug) { console.log("YouboraCommunication :: Concurrency :: Disabled"); }
            }
            if (this.getYouboraData().resumeProperties.resumeEnabled) {
                this.checkResumeState();
                if (this.debug) { console.log("YouboraCommunication :: Resume :: Enabled"); }
            } else {
                if (this.debug) { console.log("YouboraCommunication :: Resume :: Disabled"); }

            }
            if (this.getYouboraData().cdn_node_data == true) {
                if (this.debug) { console.log("YouboraCommunication :: Level3 :: Enabled"); }
            } else {
                if (this.debug) { console.log("YouboraCommunication :: Level3 :: Disabled"); }

            }
            if (this.getYouboraData().getBalanceEnabled()) {
                if (this.debug) { console.log("YouboraCommunication :: Balancer :: Enabled"); }
            } else {
                if (this.debug) { console.log("YouboraCommunication :: Balancer :: Disabled"); }

            }
        } else {
            if (this.debug) { console.log("YouboraCommunication :: Unable to reach this.getYouboraData() :: Concurrency / Resume / Level3 :: Disabled"); }
        } 

        this.init();

    } catch (error) {
        if (this.debug) {
            console.log("YouboraCommunication :: Error: " + error)
        }
    }
}

YouboraCommunication.prototype.getLevel3Header = function () {
    if (typeof this.getYouboraData() != "undefined" && this.fastDataValid) {
        var context = this;
        if (this.getYouboraData().getMediaResource().length > 0) {
            try {
                this.xmlHttp = new XMLHttpRequest();
                this.xmlHttp.context = this;
                this.xmlHttp.addEventListener("load", function (httpEvent) {
                    try {
                        var header = httpEvent.target.getResponseHeader('X-WR-DIAG').toString();
                        this.context.parseL3Header(header, 1)
                    } catch (e) {
                        if (this.context.debug) { console.log("YouboraCommunication :: Level3 :: Error parsing header"); }
                    }
                }, true);
                this.xmlHttp.open("head", this.getYouboraData().getMediaResource(), true);
                this.xmlHttp.setRequestHeader('X-WR-Diag', 'host')
                this.xmlHttp.send();
                if (this.debug) { console.log("YouboraCommunication :: HTTP LEVEL3 Header Request :: " + this.getYouboraData().getMediaResource()); }
            } catch (error) {
                this.getYouboraData().setCDNNodeData(false);
                if (this.debug) { console.log("YouboraCommunication :: Level3 :: Error with header, disabling header check"); }
            }
        } else {
            this.getYouboraData().setCDNNodeData(false);
            if (this.debug) { console.log("YouboraCommunication :: Level3 :: No mediaResource specified, disabling first header check"); }
        }
    }
}

YouboraCommunication.prototype.checkResumeState = function () {
    var resumeService = this.getYouboraData().getResumeService();
    var resumeContentId = this.getYouboraData().getContentId();
    var resumeUserid = this.getYouboraData().getUsername();
    var context = this;

    if (this.getYouboraData().getResumeEnabled()) {
        if (resumeContentId.length > 0) {
            if (resumeUserid.length > 0) {
                try {
                    this.xmlHttp = new XMLHttpRequest();
                    this.xmlHttp.context = this;
                    this.xmlHttp.addEventListener("load", function (httpEvent) { this.context.validateResumeStatus(httpEvent); }, false);
                    var urlDataWithCode = resumeService + "?contentId=" + resumeContentId + "&userId=" + resumeUserid + "&random=" + Math.random();
                    this.xmlHttp.open("GET", urlDataWithCode, true);
                    this.xmlHttp.send();
                    if (context.debug) {
                        console.log("YouboraCommunication :: checkResumeState :: HTTP Reusme Request :: " + urlDataWithCode);
                        console.log("YouboraCommunication :: checkResumeState :: Resume :: Enabled");
                    }
                } catch (error) {
                    clearInterval(this.resumeInterval);
                    if (this.debug) { console.log("YouboraCommunication :: checkResumeState :: Error while performig resume petition ::" + error); }
                }
            } else {
                if (this.debug) { console.log("YouboraCommunication :: checkResumeState :: Resume enabled without username defined :: Resume Disabled"); }
            }
        } else {
            if (this.debug) { console.log("YouboraCommunication :: checkResumeState :: Resume enabled without contentId defined :: Resume Disabled"); }
        }
    } else {
        if (this.debug) { console.log("YouboraCommunication :: checkResumeState :: Resume disabled in data. "); }        
    }
}

YouboraCommunication.prototype.validateResumeStatus = function (httpEvent) {
    try {
        if (httpEvent.target.readyState == 4) {
            var response = httpEvent.target.response.toString();
            if (response > 0) {
                var resumeCallback = this.getYouboraData().getResumeCallback();
                if (this.debug) { console.log("YouboraCommunication :: Resume :: Available ::"); }
                if (typeof resumeCallback == "function") {
                    this.wasResumed = 1;
                    resumeCallback(response);
                    if (this.debug) { console.log("YouboraCommunication :: Resume :: Executed Function"); }
                } else {
                    if (this.debug) { console.log("YouboraCommunication :: Unable to determine callback type!"); }
                }
            } else if (response == "0") {
                if (this.debug) { console.log("YouboraCommunication :: Resume :: No previous state..."); }
            } else {
                clearInterval(this.resumeInterval);
                if (this.debug) { console.log("YouboraCommunication :: Resume :: Empty response... stoping rsume."); }
            }
        }
    } catch (error) {
        clearInterval(this.resumeInterval);
        if (this.debug) { console.log("YouboraCommunication :: validateResumeStatus :: Error: " + error); }
    };
};

YouboraCommunication.prototype.sendPlayTimeStatus = function () {
    var mainContext     = this;
    var playTimeService = this.getYouboraData().getPlayTimeService();
    var resumeContentId = this.getYouboraData().getContentId();
    var resumeUserid    = this.getYouboraData().getUsername();
    try {
        if (this.getYouboraData().getResumeEnabled()) {
            this.xmlHttp = new XMLHttpRequest();
            this.xmlHttp.addEventListener("load", function (httpEvent) {}, false);
            var urlDataWithCode = playTimeService + "?contentId=" + resumeContentId + "&userId=" + resumeUserid + "&playTime=" + Math.round(this.currentTime) + "&random=" + Math.random();
            this.xmlHttp.open("GET", urlDataWithCode, true);
            this.xmlHttp.send();
            if (mainContext.debug) { console.log("YouboraCommunication :: HTTP Resume Request :: " + urlDataWithCode); }
        } else {
            if (mainContext.debug) { console.log("YouboraCommunication :: sendPlayTimeStatus :: Resume disabled in data."); }
        }
    } catch (error) {
        clearInterval(this.resumeInterval);
        if (mainContext.debug) { console.log("YouboraCommunication :: sendPlayTimeStatus :: Error: " + error); }
    }
};

YouboraCommunication.prototype.enableResume = function () {
    try {
        this.getYouboraData().setResumeEnabled(true);
        var context = this;
        clearInterval(this.resumeInterval);
        this.resumeInterval = setInterval(function () { context.sendPlayTimeStatus(); }, 6000);
        this.checkResumeState();
        if (this.debug) { console.log("YouboraCommunication :: enableResume :: Resume is now enabled"); }
    } catch (err) {
        clearInterval(this.resumeInterval);
        if (this.debug) { console.log("YouboraCommunication :: enableResume :: Error: " + error); }
    }
};

YouboraCommunication.prototype.disableResume = function () {
    try {
        this.getYouboraData().setResumeEnabled(false); 
        clearInterval(this.resumeInterval); 
        if (this.debug) { console.log("YouboraCommunication :: disableResume :: Resume is now disabled"); }
    } catch (err) {
        clearInterval(this.resumeInterval);
        if (this.debug) { console.log("YouboraCommunication :: disableResume :: Error: " + error); }
    }
};
YouboraCommunication.prototype.getPingTime = function () {
    return this.pamPingTime;
};

YouboraCommunication.prototype.parseL3Header = function (header, obj) {
    try {
        var l3Response = header;
        l3Response = l3Response.split(" ");
        l3Response.host = l3Response[0].replace("Host:", "");
        l3Response.type = l3Response[1].replace("Type:", "");
        if (l3Response.type == "TCP_HIT") {
            l3Response.type = this.l3types.TCP_HIT;
        } else if (l3Response.type == "TCP_MISS") {
            l3Response.type = this.l3types.TCP_MISS;
        } else if (l3Response.type == "TCP_MEM_HIT") {
            l3Response.type = this.l3types.TCP_MEM_HIT;
        } else if (l3Response.type == "TCP_IMS_HIT") {
            l3Response.type = this.l3types.TCP_IMS_HIT;
        } else {
            if (this.debug) { console.log("YouboraCommunication :: Level3 :: Unknown type received: " + l3Response.type); }
            l3Response.type = this.l3types.UNKNOWN;
        }
        if (obj == 1) {
            this.l3dataStart.host = l3Response.host;
            this.l3dataStart.type = l3Response.type;
            if (this.debug) { console.log("YouboraCommunication :: Level3 :: onLoad :: Host: " + this.l3dataStart.host + " :: Type: " + this.l3dataStart.type); }
        } else {
            this.l3dataPing.host = l3Response.host;
            this.l3dataPing.type = l3Response.type;
            if (this.debug) { console.log("YouboraCommunication :: Level3 :: beforeStart :: Host: " + this.l3dataPing.host + " :: Type: " + this.l3dataPing.type); }
        }
        return true;
    } catch (error) {
        this.getYouboraData().setCDNNodeData(false);
        if (this.context.debug) {
            console.log("YouboraCommunication :: Level3 :: Error with header, disabling header check");
        }
        return false;
    } 
}

YouboraCommunication.prototype.sendStartL3 = function (totalBytes, referer, properties, isLive, resource, duration, transcode) {
    try {
        if ( (transcode == undefined) || (transcode == "undefined") || (transcode == "") )  { transcode = this.getYouboraData().getTransaction(); }
        if (duration == undefined || duration == "undefined")   { duration = 0; }
        var d = new Date();
        var params = "?pluginVersion=" + this.pluginVersion +
                     "&pingTime=" + (this.pamPingTime / 1000)  +
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

        if (this.getYouboraData().cdn_node_data == true && this.fastDataValid) {
            if (this.l3dataStart.host == this.l3dataPing.host) { 
                params += "&nodeHost=" + this.l3dataPing.host + "&nodeType=" + this.l3dataStart.type;
            } else { 
                params += "&nodeHost=" + this.l3dataPing.host + "&nodeType=" + this.l3dataPing.type; 
            }
        }

        if (this.getYouboraData().isBalanced) { params += "&isBalanced=1"; } else { params += "&isBalanced=0"; }
        if (this.getYouboraData().hashTitle) { params += "&hashTitle=true"; } else { params += "&hashTitle=false"; }
        if (this.getYouboraData().getCDN() != "") { params += "&cdn=" + this.getYouboraData().getCDN(); }
        if (this.getYouboraData().getISP() != "") { params += "&isp=" + this.getYouboraData().getISP(); }
        if (this.getYouboraData().getIP() != "") { params += "&ip=" + this.getYouboraData().getIP(); }

        params += "&isResumed=" + this.wasResumed;


        if (this.canSendEvents) {
            this.sendAnalytics(this.pamStartUrl, params, false);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.START, params);
        }

        if (this.getYouboraData().getResumeEnabled()) {
            var context = this;
            if (context.debug) {
                console.log("YouboraCommunication :: Resume :: Enabled");
            }
            this.sendPlayTimeStatus();
            this.resumeInterval = setInterval(function () {
                context.sendPlayTimeStatus();
            }, 6000);
        }

        this.startSent = true;
        this.lastPingTime = d.getTime();

    } catch (error) {
        if (this.debug) {
            console.log("YouboraCommunication :: sendStartL3 :: Error: " + error);
        }
    }
}

YouboraCommunication.prototype.sendStart = function (totalBytes, referer, properties, isLive, resource, duration, transcode) {
    if (this.getYouboraData().cdn_node_data == true && this.fastDataValid) {
        try {
            this.xmlHttp = new XMLHttpRequest();
            this.xmlHttp.context = this;
            this.xmlHttp.addEventListener("load", function (httpEvent) {
                try {
                    var header = httpEvent.target.getResponseHeader('X-WR-DIAG').toString();
                    if (this.context.parseL3Header(header, 2)) {
                        this.context.sendStartL3(totalBytes, referer, properties, isLive, resource, duration, transcode);
                    } else {
                        if (this.context.debug) { console.log("YouboraCommunication :: Level3 :: Error parsing header"); }
                        this.context.sendStartL3(totalBytes, referer, properties, isLive, resource, duration, transcode);
                    }
                } catch (error) {
                    this.getYouboraData().setCDNNodeData(false);
                    if (this.debug) { console.log("YouboraCommunication :: Level3 :: Error with header, disabling header check"); }
                }
            }, true);
            this.xmlHttp.open("HEAD", resource, true);
            this.xmlHttp.setRequestHeader('X-WR-DIAG', 'host')
            this.xmlHttp.send();
        } catch (error) {
            this.getYouboraData().setCDNNodeData(false);
            if (this.debug) { console.log("YouboraCommunication :: Level3 :: Error with header, disabling header check"); }
        }
    } else {
        try {
            if ( (transcode == undefined) || (transcode == "undefined") || (transcode == "") )  { transcode = this.getYouboraData().getTransaction(); }
            if (duration == undefined || duration == "undefined")   { duration = 0; }

            var d = new Date();
            var params = "?pluginVersion=" + this.pluginVersion +
                         "&pingTime=" + (this.pamPingTime / 1000)  +
                         "&totalBytes=" + totalBytes +
                         "&referer=" + encodeURIComponent(referer) +
                         "&user=" + this.bandwidth.username +
                         "&properties=" + encodeURIComponent(JSON.stringify(this.getYouboraData().getProperties())) +
                         "&live=" + isLive +
                         "&transcode=" + transcode +
                         "&system=" + this.system +
                         "&resource=" + encodeURIComponent(resource) +
                         "&duration=" + duration;

            params += this.getExtraParamsUrl(this.getYouboraData().getExtraParams());

            if (this.getYouboraData().isBalanced) { params += "&isBalanced=1"; } else { params += "&isBalanced=0"; }
            if (this.getYouboraData().hashTitle) { params += "&hashTitle=true"; } else { params += "&hashTitle=false"; }
            if (this.getYouboraData().getCDN() != "") { params += "&cdn=" + this.getYouboraData().getCDN(); }
            if (this.getYouboraData().getISP() != "") { params += "&isp=" + this.getYouboraData().getISP(); }
            if (this.getYouboraData().getIP() != "") { params += "&ip=" + this.getYouboraData().getIP(); }

            params += "&isResumed=" + this.wasResumed;

            if (this.canSendEvents) {
                this.sendAnalytics(this.pamStartUrl, params, false);
            } else {
                this.addEventToQueue(YouboraCommunicationEvents.START, params);
            }

            if (this.getYouboraData().getResumeEnabled()) {
                var context = this;
                if (context.debug) { console.log("YouboraCommunication :: Resume :: Enabled"); }
                this.sendPlayTimeStatus();
                this.resumeInterval = setInterval(function () {
                    context.sendPlayTimeStatus();
                }, 6000);
            }

            this.startSent = true;
            this.lastPingTime = d.getTime();

        } catch (error) {
            if (this.debug) { console.log("YouboraCommunication :: sendStart :: Error: " + error); }
        }
    }

};

YouboraCommunication.prototype.sendError = function (errorCode, message) {
    try {
        if (typeof errorCode != "undefined" && errorCode.length > 0 && parseInt(errorCode) >= 0) {
            var params = "?errorCode=" + errorCode + "&msg=" + message;
            this.sendAnalytics(this.pamErrorUrl, params, false);
        }
    } catch (err) {
        if (this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
    }
};

YouboraCommunication.prototype.sendErrorWithParameters = function (errorCode, message, totalBytes, referer, properties, isLive, resource, duration, transcode) {
    try {
        if (typeof errorCode != "undefined" && errorCode.length > 0 && parseInt(errorCode) >= 0) {

            var params = "?errorCode=" + errorCode + "&msg=" + message;
            if (transcode == undefined || transcode == "undefined") { transcode = this.getYouboraData().getTransaction(); }
            if (duration == undefined || duration == "undefined") { duration = 0; }
            var d = new Date();
            params += "&pluginVersion=" + this.pluginVersion +
                      "&pingTime=" + (this.pamPingTime / 1000)  +
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

            if (this.getYouboraData().cdn_node_data == true && this.fastDataValid) {
                if (this.l3dataStart.host == this.l3dataPing.host) { params += "&nodeHost=" + this.l3dataPing.host + "&nodeType=" + this.l3dataStart.type; } 
                else { params += "&nodeHost=" + this.l3dataPing.host + "&nodeType=" + this.l3dataPing.type; }
            }

            if (this.getYouboraData().isBalanced) { params += "&isBalanced=1"; } else { params += "&isBalanced=0"; }
            if (this.getYouboraData().hashTitle) { params += "&hashTitle=true"; } else { params += "&hashTitle=false"; }
            if (this.getYouboraData().getCDN() != "") { params += "&cdn=" + this.getYouboraData().getCDN(); }
            if (this.getYouboraData().getISP() != "") { params += "&isp=" + this.getYouboraData().getISP(); }
            if (this.getYouboraData().getIP() != "") { params += "&ip=" + this.getYouboraData().getIP(); }

            this.sendAnalytics(this.pamErrorUrl, params, false);
        }

    } catch (err) {
        if (this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
    }
};
YouboraCommunication.prototype.sendPingTotalBytes = function (totalBytes, currentTime) {
    try {
        if (this.startSent == false) { return; }
        if (currentTime > 0) { this.currentTime = currentTime; }
        var d = new Date();

        if (this.lastPingTime != 0) { this.diffTime = d.getTime() - this.lastPingTime; }
        this.lastPingTime = d.getTime();

        var params = "?diffTime=" + this.diffTime +
                     "&totalBytes=" + totalBytes +
                     "&pingTime=" + (this.pamPingTime / 1000) +
                     "&dataType=0" +
                     "&time=" + currentTime;

        if (this.getYouboraData().cdn_node_data == true && this.fastDataValid) {
            if (this.l3IsNodeSend == false) {
                if (this.l3dataStart.host == this.l3dataPing.host) { params += "&nodeHost=" + this.l3dataPing.host + "&nodeType=" + this.l3dataStart.type; }
                else { params += "&nodeHost=" + this.l3dataPing.host + "&nodeType=" + this.l3dataPing.type; }
                this.l3IsNodeSend = true;
            }
        }

        if (this.canSendEvents) {
            this.sendAnalytics(this.pamPingUrl, params, true);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.PING, params);
        }
    } catch (err) {
        if (this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
    }
};

YouboraCommunication.prototype.sendPingTotalBitrate = function (bitrate, currentTime) {
    try {
        if (this.startSent == false) { return; }
        if (currentTime > 0) { this.currentTime = currentTime; }
        var d = new Date();

        if (this.lastPingTime != 0) { this.diffTime = d.getTime() - this.lastPingTime; }
        this.lastPingTime = d.getTime();

        var params = "?diffTime=" + this.diffTime +
                     "&bitrate=" + bitrate +
                     "&pingTime=" + (this.pamPingTime / 1000) +
                     "&time=" + currentTime;

        if (this.getYouboraData().cdn_node_data == true && this.fastDataValid) {
            if (this.l3IsNodeSend == false) {
                if (this.l3dataStart.host == this.l3dataPing.host) { params += "&nodeHost=" + this.l3dataPing.host + "&nodeType=" + this.l3dataStart.type; } 
                else { params += "&nodeHost=" + this.l3dataPing.host + "&nodeType=" + this.l3dataPing.type; }
                this.l3IsNodeSend = true;
            }
        }

        if (this.canSendEvents) {
            this.sendAnalytics(this.pamPingUrl, params, true);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.PING, params);
        }
    } catch (err) {
        if (this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
    }
};

YouboraCommunication.prototype.sendJoin = function (currentTime, joinTimeDuration) {
    try {
        if (currentTime > 0) { this.currentTime = currentTime; }

        var params = "?eventTime=" + currentTime + "&time=" + joinTimeDuration;

        if (this.canSendEvents) {
            this.sendAnalytics(this.pamJoinTimeUrl, params, false);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.JOIN, params);
        }

    } catch (err) {
        if (this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
    }
};

YouboraCommunication.prototype.sendBuffer = function (currentTime, bufferTimeDuration) {
    try {
        if (this.startSent == false) { return; }
        if (currentTime > 0) { this.currentTime = currentTime; }
        var params = null;
        var params = "?time=" + currentTime + "&duration=" + bufferTimeDuration;
        if (this.canSendEvents) {
            this.sendAnalytics(this.pamBufferUnderrunUrl, params, false);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.BUFFER, params);
        }
    } catch (err) {
        if (this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
    }
};

YouboraCommunication.prototype.sendResume = function () {
    try {
        if (this.startSent == false) { return; }
        var params = "";
        if (this.canSendEvents) {
            this.sendAnalytics(this.pamResumeUrl, params, false);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.RESUME, params);
        }
    } catch (err) {
        if (this.debug) { console.log("YouboraCommunication :: Error Msg: " + err);  }
    }
};

YouboraCommunication.prototype.sendPause = function () {
    try {
        if (this.startSent == false) { return; }
        var params = "";
        if (this.canSendEvents) {
            this.sendAnalytics(this.pamPauseUrl, params, false);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.PAUSE, params);
        }
        if (this.getYouboraData().getResumeEnabled()) {
            this.sendPlayTimeStatus()
        }
    } catch (err) {
        if (this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
    }
};

YouboraCommunication.prototype.sendStop = function () {
    try {
        if (this.startSent == false) { return; }
        this.currentTime = 0;
        if (this.getYouboraData().getResumeEnabled()) { this.sendPlayTimeStatus() }
        clearInterval(this.resumeInterval);

        var params = "?diffTime=" + this.diffTime;
        if (this.canSendEvents) {
            this.sendAnalytics(this.pamStopUrl, params, false);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.STOP, params);
        }
        this.reset();
    } catch (err) {
        if (this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
    }
};

YouboraCommunication.prototype.addEventToQueue = function (eventType, params) {
    try {
        var niceCommunicationObject = new YouboraCommunicationURL(eventType, params);
        this.eventQueue.push(niceCommunicationObject);
    } catch (err) {
        if (this.debug) {
            console.log("YouboraCommunication :: Error Msg: " + err);
        }
    }
};
 
YouboraCommunication.prototype.init = function () {
    try {
        var context = this;
        this.xmlHttp = new XMLHttpRequest();
        this.xmlHttp.context = this;
        this.xmlHttp.addEventListener("load", function (httpEvent) { this.context.loadAnalytics(httpEvent); }, false);
        var urlDataWithCode = this.service + "/data?system=" + this.system + "&pluginVersion=" + this.pluginVersion + "&targetDevice=" + this.targetDevice + "&outputformat=" + this.outputFormat;
        this.xmlHttp.open("GET", urlDataWithCode, true);
        this.xmlHttp.send();
        if (this.debug) { console.log("YouboraCommunication :: HTTP Fastdata Request :: " + urlDataWithCode); }
    } catch (err) {
        if (this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
    }
};

YouboraCommunication.prototype.getLevel3Node = function (resource) {
    this.xmlHttp = new XMLHttpRequest();
    this.xmlHttp.context = this;
    this.xmlHttp.addEventListener("load", function (httpEvent) { this.context.loadAnalytics(httpEvent); }, false);
    var urlDataWithCode = this.service + "/data?system=" + this.system + "&pluginVersion=" + this.pluginVersion + "&targetDevice=" + this.targetDevice + "&outputformat=" + this.outputFormat;
    this.xmlHttp.open("GET", urlDataWithCode, true);
    this.xmlHttp.send();
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

        if (this.getYouboraData().getConcurrencyEnabled()) {
            if (cUseIP) {
                var context = this;
                this.xmlHttp = new XMLHttpRequest();
                this.xmlHttp.addEventListener("load", function (httpEvent) { context.validateConcurrencyResponse(httpEvent); }, false);
                urlDataWithCode = cService + "?concurrencyCode=" + cCode +
                                             "&accountCode=" + cAccount +
                                             "&concurrencyMaxCount=" + cMaxCount +
                                             "&random=" + Math.random();
                this.xmlHttp.open("GET", urlDataWithCode, true);
                this.xmlHttp.send();
            } else {
                var context = this;
                this.xmlHttp = new XMLHttpRequest();
                this.xmlHttp.addEventListener("load", function (httpEvent) { context.validateConcurrencyResponse(httpEvent); }, false);
                urlDataWithCode = cService + "?concurrencyCode=" + cCode +
                                             "&accountCode=" + cAccount +
                                             "&concurrencySessionId=" + cSession +
                                             "&concurrencyMaxCount=" + cMaxCount +
                                             "&random=" + Math.random();
                this.xmlHttp.open("GET", urlDataWithCode, true);
                this.xmlHttp.send();
            }
            if (mainContext.debug) { console.log("YouboraCommunication :: HTTP Concurrency Request :: " + urlDataWithCode); }
        } else  {
            if (mainContext.debug) { console.log("YouboraCommunication :: HTTP Concurrency Request :: " + urlDataWithCode); }            
        }

    } catch (err) {
        if (mainContext.debug) { console.log("YouboraCommunication :: startConcurrencyWork :: Disabled in data."); }
    } 
};

YouboraCommunication.prototype.validateConcurrencyResponse = function (httpEvent) {
    try {
        if (httpEvent.target.readyState == 4) {
            var mainContext = this;
            var response = httpEvent.target.response;
            if (response == "1") {
                this.sendError(14000, "CC_KICK")
                var cRedirect = this.getYouboraData().getConcurrencyRedirectUrl();
                if (typeof cRedirect == "function") {
                    if (mainContext.debug) { console.log("YouboraCommunication :: Concurrency :: Executed function"); }
                    cRedirect();
                } else {
                    if (mainContext.debug) { console.log("YouboraCommunication :: Concurrency :: 1 :: Redirecting to: " + cRedirect); }
                    window.location = cRedirect;
                }
            } else if (response == "0") {
                if (mainContext.debug) { console.log("YouboraCommunication :: Concurrency :: 0 :: Continue..."); }
            } else {
                if (mainContext.debug) { console.log("YouboraCommunication :: Concurrency :: Empty response... stoping validation."); }
                clearInterval(this.concurrencyTimer);
            }
        }
    } catch (err) {
        if (mainContext.debug) { console.log("YouboraCommunication :: validateConcurrencyResponse :: Error: " + err); } 
    };
};

YouboraCommunication.prototype.enableConcurrency = function () {
    try {
        this.getYouboraData().setConcurrencyEnabled(true);
        var context = this;
        clearInterval(this.concurrencyTimer);
        this.concurrencyTimer = setInterval(function () { context.checkConcurrencyWork() }, 10000);
        this.checkConcurrencyWork();
        if (this.debug) { console.log("YouboraCommunication :: enableConcurrency :: Concurrency is now enabled"); }
    } catch (err) {
        clearInterval(this.resumeInterval);
        if (this.debug) { console.log("YouboraCommunication :: enableConcurrency :: Error: " + error); }
    }
};

YouboraCommunication.prototype.disableConcurrency = function () {
    try {
        this.getYouboraData().setConcurrencyEnabled(false); 
        clearInterval(this.concurrencyTimer);
        if (this.debug) { console.log("YouboraCommunication :: disableConcurrency :: Concurrency is now disabled"); }
    } catch (err) {
        clearInterval(this.resumeInterval);
        if (this.debug) { console.log("YouboraCommunication :: disableConcurrency :: Error: " + error); }
    }
};

YouboraCommunication.prototype.loadAnalytics = function (httpEvent) {
    var mainContext = this;
    try {
        if (httpEvent.target.readyState == 4) {

            if (mainContext.debug) { console.log("YouboraCommunication :: Loaded XML FastData"); }
            var response = httpEvent.target.responseXML;

            try { 
                var pamUrl = response.getElementsByTagName("h")[0].childNodes[0].nodeValue; 
            } catch ( error ) { 
                if (this.debug) { console.log("YouboraCommunication :: loadAnalytics :: Invalid Fast-Data Response!"); }
            }

            if ((pamUrl != undefined) && (pamUrl != "")) {
                this.pamBufferUnderrunUrl = "http://" + pamUrl + "/bufferUnderrun";
                this.pamJoinTimeUrl = "http://" + pamUrl + "/joinTime";
                this.pamStartUrl = "http://" + pamUrl + "/start";
                this.pamStopUrl = "http://" + pamUrl + "/stop";
                this.pamPauseUrl = "http://" + pamUrl + "/pause";
                this.pamResumeUrl = "http://" + pamUrl + "/resume";
                this.pamPingUrl = "http://" + pamUrl + "/ping";
                this.pamErrorUrl = "http://" + pamUrl + "/error";
            }
 
            try {
                this.pamCode = response.getElementsByTagName("c")[0].childNodes[0].nodeValue;
                this.pamCodeOrig = this.pamCode;
                this.pamPingTime = response.getElementsByTagName("pt")[0].childNodes[0].nodeValue * 1000;
                this.isXMLReceived = true;
                this.enableAnalytics = true;
                if (mainContext.debug) { console.log("YouboraCommunication :: Mandatory :: Analytics Enabled"); }
            } catch (err) {
                this.enableAnalytics = false;
                if (mainContext.debug) { console.log("YouboraCommunication :: Mandatory :: Analytics Disabled"); }
            }

            // Balance Fastdata Override
            try {
                this.enableBalancer = response.getElementsByTagName("b")[0].childNodes[0].nodeValue;
                if (this.enableBalancer == 1) {
                    this.enableBalancer = true;
                    if (mainContext.debug) { console.log("YouboraCommunication :: Mandatory :: Balancer Enabled"); }
                } else {
                    this.enableBalancer = false;
                    if (mainContext.debug) { console.log("YouboraCommunication :: Mandatory :: Balancer Disabled"); }
                }
            } catch (err) {
                if (mainContext.debug) { console.log("YouboraCommunication :: Mandatory :: Balancer Disabled"); }
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
                if (mainContext.debug) { console.log("YouboraCommunication :: replaceConsoleEvents :: Binding to: " + this.debugHost); }
                this.replaceConsoleEvents();
                this.getYouboraData().setDebug(true);
            }

            if (this.getYouboraData().cdn_node_data && this.fastDataValid) { this.getLevel3Header(); }
            if (this.getYouboraData().concurrencyProperties.enabled && this.fastDataValid) { this.checkConcurrencyWork(); }
        }

    } catch (error) {
        if (mainContext.debug) { console.log("YouboraCommunication :: loadAnalytics :: Error: " + error); }
    }
};

YouboraCommunication.prototype.cPing = function () {
    try {
        var context = this;
        this.xmlHttp = new XMLHttpRequest();
        this.xmlHttp.context = this;
        this.xmlHttp.addEventListener("load", function (httpEvent) {
            this.context.loadAnalytics(httpEvent);
        }, false);
        var urlDataWithCode = this.service + "/data?system=" + this.system + "&pluginVersion=" + this.pluginVersion + "&targetDevice=" + this.targetDevice + "&outputformat=" + this.outputFormat;
        this.xmlHttp.open("GET", urlDataWithCode, true);
        this.xmlHttp.send();
        if (context.debug) { console.log("YouboraCommunication :: HTTP Request :: " + urlDataWithCode); }
    } catch (err) {
        if (this.debug) { console.log("YouboraCommunication :: cPing :: Erro: " + err); }
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
                    if (window.XMLHttpRequest) { xmlhttp = new XMLHttpRequest(); } else { xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); }
                    xmlhttp.open("GET", classContext.debugHost + encodeURIComponent(timeStamp) + " |> " + data);
                    xmlhttp.send();
                } catch (err) { }
            }
        }
        if (this.debug) { console.log("YouboraCommunication :: replaceConsoleEvents :: Done ::"); }
    } catch (err) {
        if (this.debug) { console.log("YouboraCommunication :: replaceConsoleEvents :: Error: " + err); }
    }
};

YouboraCommunication.prototype.sendEventsFromQueue = function () {
    try {
        if (this.canSendEvents == true) {
            var niceCommunicationObject = this.eventQueue.pop();
            var eventURL;
            var eventType;
            while (niceCommunicationObject != null) {
                eventType = niceCommunicationObject.getEventType();
                if (eventType == YouboraCommunicationEvents.START) {
                    eventURL = this.pamStartUrl;
                } else if (eventType == YouboraCommunicationEvents.JOIN) {
                    eventURL = this.pamJoinTimeUrl;
                } else if (eventType == YouboraCommunicationEvents.BUFFER) {
                    eventURL = this.pamBufferUnderrunUrl;
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
                if (eventURL != null) { this.sendAnalytics(eventURL, niceCommunicationObject.getParams(), false); }
                niceCommunicationObject = this.eventQueue.pop();
            }
        }
    } catch (err) {
        if (this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
    }
}

YouboraCommunication.prototype.getBalancerUrls = function (url, callback) {
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

            try {
                this.xmlHttp = new XMLHttpRequest();
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

                try {  if( isLive == true ) { urlDataWithCode += "&live=true"; } } catch(e) {}

                this.xmlHttp.addEventListener("load", function ( httpEvent ) {
                    var obj = httpEvent.target.response.toString();
                    var objJSON = "";
                    var error = false;
                    try { objJSON = JSON.parse(obj); } catch (e) { error = true; } 
                    if (error == false) {   
                        try { 
                            var returnArray = []
                            var indexCount = 0;
                            for (index in obj) { try { indexCount++; returnArray[index] = objJSON[indexCount]['URL']; } catch (e) { } } 
                            mainContext.balancedUrlsCallback(returnArray);
                        } catch (e) {  mainContext.balancedUrlsCallback(false) }
                    } else { mainContext.balancedUrlsCallback(false) }
                }, false);
                this.xmlHttp.open("GET", urlDataWithCode, true);
                this.xmlHttp.send();
                if (mainContext.debug) { console.log("YouboraCommunication :: HTTP GetBalancerUrls Request :: " + urlDataWithCode); }
            } catch (err) {
                if (mainContext.debug) { console.log("YouboraCommunication :: getBalancerUrls :: Error: " + err); }
            }
        }
    }
}

YouboraCommunication.prototype.getBalancedResource = function (path, callback, referer) {
    if (!this.getYouboraData().enableBalancer) {
        mainContext.balancedCallback(false);
    } else {
        this.balancedCallback = callback;
        var mainContext = this;   
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
        this.resourcePath = path;
        try {
            this.xmlHttp = new XMLHttpRequest();
            this.xmlHttp.context = this; 
            var urlDataWithCode = service + "?type=" + balanceType +
                                            "&systemcode=" + systemCode +
                                            "&session=" +this.pamCode +
                                            "&zonecode=" + zoneCode +
                                            "&origincode=" + originCode +
                                            "&resource=" + encodeURIComponent(path) +
                                            "&niceNva=" + niceNVA +
                                            "&niceNvb=" + niceNVB +
                                            "&token=" + this.getYouboraData().getBalanceToken(); 

            try {  if( isLive == true ) { urlDataWithCode += "&live=true"; } } catch(e) {}


            this.xmlHttp.addEventListener("load", function (httpEvent) {
                var obj = httpEvent.target.response.toString();
                var objJSON = "";
                var error = false;
                try {
                    objJSON = JSON.parse(obj);
                } catch (e) {
                    if (mainContext.debug) { console.log ( "YouboraCommunication :: HTTP Balance :: Error: " + e); }
                    error = true;
                }
                if (error == false) {
                    this.getYouboraData().extraParams.param13 = true;
                    mainContext.balancedCallback(objJSON);
                } else {
                    mainContext.balancedCallback(false)
                }
            }, false);
            this.xmlHttp.open("GET", urlDataWithCode, true);
            this.xmlHttp.send();
            if (mainContext.debug) { console.log("YouboraCommunication :: HTTP Balance Request :: " + urlDataWithCode); }
        } catch (err) {
            if (mainContext.debug) { console.log("YouboraCommunication :: getBalancedResource :: Error: " + err); }
        }
    }
}


YouboraCommunication.prototype.validateBalanceResponse = function (httpEvent) {
    try {
        if (httpEvent.target.readyState == 4) {
            // --
        }
    } catch (err) {
        if (this.debug) { console.log("YouboraCommunication :: validateBalanceResponse :: Error: " + err); }
    }
};

YouboraCommunication.prototype.sendAnalytics = function (url, data, hasResponse) {
    var mainContext = this;
    try {
        if (this.canSendEvents && this.fastDataValid) {
            this.xmlHttp = new XMLHttpRequest();
            this.xmlHttp.context = this;

            if (hasResponse) {
                this.xmlHttp.addEventListener("load", function (httpEvent) { this.context.parseAnalyticsResponse(httpEvent); }, false);
                this.xmlHttp.addEventListener("error", function () { this.context.sendAnalyticsFailed(); }, false);
            } else {
                this.xmlHttp.addEventListener("load", function (httpEvent) { this.context.parseAnalyticsResponse(httpEvent); }, false);
                this.xmlHttp.addEventListener("error", function () { this.context.sendAnalyticsFailed(); }, false);
            }

            var urlDataWithCode = url + data + "&code=" + this.pamCode + "&random=" + Math.random();
            if (mainContext.debug) { console.log("YouboraCommunication :: HTTP Request :: " + urlDataWithCode); }
            this.xmlHttp.open("GET", urlDataWithCode, true);
            this.xmlHttp.send();
        }
    } catch (err) {
        if (this.debug) { console.log("YouboraCommunication :: Error Msg: " + err); }
    }
};

YouboraCommunication.prototype.parseAnalyticsResponse = function (httpEvent) {
    try {
        if (httpEvent.target.readyState == 4) {

        }
    } catch (err) {
        if (this.debug) {
            console.log("YouboraCommunication :: parseAnalyticsResponse :: Error: " + err);
        }
    }
};

YouboraCommunication.prototype.sendAnalyticsFailed = function () {
    try {
        if (this.debug) {
            console.log("YouboraCommunication :: Failed communication with nQs Service");
        }
    } catch (err) {
        if (this.debug) { console.log("YouboraCommunication :: sendAnalyticsFailed :: Error: " + err); }
    }
};

YouboraCommunication.prototype.updateCode = function () {
    try {
        this.pamCodeCounter++;
        this.pamCode = this.pamCodeOrig + "_" + this.pamCodeCounter;
    } catch (err) {
        if (this.debug) { console.log("YouboraCommunication :: updateCode :: Error: " + err); }
    }
};

YouboraCommunication.prototype.reset = function () {
    try {
        this.lastPingTime = 0;
        this.diffTime = 0;
        this.startSent = false;
        this.updateCode();
    } catch (err) {
        if (this.debug) { console.log("YouboraCommunication :: reset Error: " + err); }
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

YouboraCommunication.prototype.getYouboraData = function () {
   
    try {
        if ( typeof youboraDataMap == undefined){
            return youboraData;
        }else{
            return youboraDataMap.get(this.playerId);
        }
    } catch (err) {
        if (this.debug) { console.log("YouboraCommunication :: Error Msg: " + err);  }
    }
};


function YouboraCommunicationURL(eventType, params) {
    this.params = params;
    this.eventType = eventType;
};

YouboraCommunicationURL.prototype.getParams = function () {
    return this.params;
};

YouboraCommunicationURL.prototype.getEventType = function () {
    return this.eventType;
};



if (typeof console == "undefined") {
    var console = function () {}
};

var YouboraCommunicationEvents = {
    START: 0,
    JOIN: 1,
    BUFFER: 2,
    PING: 3,
    PAUSE: 4,
    RESUME: 5,
    STOP: 6,
    ERROR: 7
};