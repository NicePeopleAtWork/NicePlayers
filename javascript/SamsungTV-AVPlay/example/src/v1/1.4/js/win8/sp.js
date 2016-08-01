/*
 * YouboraCommunication
 * Copyright (c) 2015 NicePeopleAtWork
 * Author: Adrian Galera Egea
 * Version: 3.0.0
 */
var SmartPlugin = {
    // General
    debug: true,
    isLive: youboraData.getLive(),
    bandwidth: {
        username: youboraData.getUsername(),
        interval: 6000
    },
    targetDevice: "winjs",
    pluginName: "winjs",
    pluginVersion: "1.4.3.0.0_winjs",
    initDone: 0,
    videoPlayer: undefined,
    urlResource: undefined,
    pingTimer: undefined,
    apiClass: undefined,
    currentTime: 0,
    duration: 0,
    startTime: 0,
    bitrate: 0,
    // Triggers
    isStartSent: false,
    isJoinSent: false,
    isPaused: false,
    isBuffering: false,
    // Buffer checker:
    bufferLastTime: 1000,
    bufferRange: 800,
    bufferMilis: 1000,
    bufferInterval: undefined,
    bufferTimeBegin: 0,
    getCurrentBitRate: function () {
        return SmartPlugin.bitrate;
    },
    Init: function () {
        try {
            if (SmartPlugin.debug) {
                console.log("PLUGINS INIT !!");
                console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Init ::");
            }
            SmartPlugin.initDone = true;
            SmartPlugin.startPlugin();
        } catch (error) {
            if (SmartPlugin.debug) {
                console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Init :: Error: " + error);
            }
            spLoaded = false;
        }
    },
    startPlugin: function () {
        try {
            try {
                SmartPlugin.videoPlayer = document.getElementsByTagName('video')[0];
                if (SmartPlugin.debug) {
                    console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: startPlugin :: HTML5 <video> found!");
                }
                SmartPlugin.apiClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, SmartPlugin.pluginVersion, SmartPlugin.targetDevice);

                try {

                } catch (e) {
                    console.log(' ERROR TYPE: ' + e);
                }


                console.log("GOT RESOURCE => " + SmartPlugin.urlResource);
                SmartPlugin.bindEvents();

                /* GET Smooth Streaming SDK Events */
                try {
                    var adptSrcManager = Microsoft.Media.AdaptiveStreaming.AdaptiveSourceManager.getDefault();
                    var property = new Windows.Foundation.Collections.PropertySet();
                    property["{A5CE1DE8-1D00-427B-ACEF-FB9A3C93DE2D}"] = adptSrcManager;
                    adptSrcManager.addEventListener("adaptivesourcestatusupdatedevent", SmartPlugin.smoothEventHandler, false);
                    adptSrcManager.addEventListener("adaptivesourcefailedevent", SmartPlugin.smoothEventHandler, false);
                } catch (ssError) {
                    if (SmartPlugin.debug) {
                        console.log(ssError);
                    }
                }

            } catch (error) {
                if (SmartPlugin.debug) {
                    console.log(error);
                }
                spLoaded = false;
            }
        } catch (error) {
            if (SmartPlugin.debug) {
                console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: startPlugin :: Error: " + error);
            }
            spLoaded = false;
        }
    },
    smoothEventHandler: function (e) {
        /*if (e.type == "adaptivesourcefailedevent") { console.log("adaptive source failed event"); console.log(e); }*/
        if (e.type == "adaptivesourcestatusupdatedevent") {
            if (e.updateType == 4) {//bitrate changed
                try {
                    var newInfo = e.additionalInfo;
                    var info = newInfo.split(";");
                    var newBitrate = info[0].toString();
                    if (SmartPlugin.debug) {
                        console.log("BITRATE CHANGED => " + newBitrate);
                    }
                    SmartPlugin.bitrate = newBitrate;
                } catch (error) {
                    if (SmartPlugin.debug) {
                        console.log(error);
                    }
                }
            }
        }
    },
    bindEvents: function () {
        try {
            var playerEvents = ["canplay", "playing", "waiting", "timeupdate", "ended", "play", "pause", "error", "abort", "seeking", "seeked", "loadstart", "ratechange", "stalled", "durationchange", "mskeyadded", "mskeyerror", "mskeymessage", "onMSVideoFormatChanged"];

            for (elem in playerEvents) {
                SmartPlugin.videoPlayer.addEventListener(playerEvents[elem], function (e) {
                    SmartPlugin.checkPlayState(e);
                }, false);
            }

            if (SmartPlugin.debug) {
                console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: bindEvents :: Events atached correctly!");
            }
        } catch (error) {
            if (SmartPlugin.debug) {
                console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: bindEvents :: Error: " + error);
            }
        }
    },
    checkPlayState: function (e) {
        if (e.type != "timeupdate")
            console.log("checkPlayState => " + e.type);

        switch (e.type) {
            case "ratechange":
                console.log("ratechange");
                break;

            case "timeupdate":
                SmartPlugin.currentTime = SmartPlugin.videoPlayer.currentTime;
                if (SmartPlugin.currentTime > 0 && SmartPlugin.isJoinSent == false) {
                    SmartPlugin.join();
                }
                break;

            case "play":
                break;

            case "pause":
                if (SmartPlugin.isPaused == false && SmartPlugin.isStartSent == true) {
                    SmartPlugin.isPaused = true;
                    SmartPlugin.apiClass.sendPause();
                }
                break;

            case "ended":
                SmartPlugin.reset();
                break;

            case "error":

                //get resource from video player
                SmartPlugin.urlResource = SmartPlugin.videoPlayer.currentSrc;
                youboraData.setMediaResource(SmartPlugin.urlResource);

                SmartPlugin.error();
                break;

            case "loadstart":

                //get resource from video player
                SmartPlugin.urlResource = SmartPlugin.videoPlayer.currentSrc;
                youboraData.setMediaResource(SmartPlugin.urlResource);

                SmartPlugin.start();
                break;

            case "abort":
                break;

            case "waiting":
                //NOT THROWN, buffer is detected via checkBuffer interval
                break;

            case "playing":
                if (SmartPlugin.isPaused == true && SmartPlugin.isStartSent == true) {
                    SmartPlugin.isPaused = false;
                    SmartPlugin.apiClass.sendResume();
                }
                break;

            case "seeking":
                console.log("seeking!");
                SmartPlugin.seeking = true;
                SmartPlugin.lastSeekInitTime = new Date().getTime();
                //In case of replay of a video, seeking event is thrown
                SmartPlugin.start();
                break;

            case "seeked":
                console.log("seeked!");
                SmartPlugin.seeking = false;
                break;
        }
    },

    start: function () {
        try {
            if (!SmartPlugin.isStartSent) {
                SmartPlugin.startTime = new Date().getTime();
                SmartPlugin.duration = SmartPlugin.videoPlayer.duration;
                if (isNaN(SmartPlugin.duration)) {
                    SmartPlugin.duration = 0;
                } else {
                    SmartPlugin.duration = Math.floor(SmartPlugin.duration);
                }
                SmartPlugin.currentTime = SmartPlugin.videoPlayer.currentTime;
                SmartPlugin.apiClass.sendStart(0, window.location.href, "", youboraData.getLive(), SmartPlugin.urlResource, SmartPlugin.duration);
                SmartPlugin.setPing();
                SmartPlugin.isStartSent = true;

                SmartPlugin.bufferInterval = setInterval(function () {
                    SmartPlugin.bufferCheck();
                }, SmartPlugin.bufferMilis);
            }
        } catch (e) {
            if (SmartPlugin.debug) {
                console.log(e);
            }
        }
    },
    join: function () {
        if (!SmartPlugin.isJoinSent) {
            try {
                var now = new Date().getTime();
                var joinTime = now - SmartPlugin.startTime;
                if (joinTime == 0)
                    joinTime = 1;
                SmartPlugin.duration = SmartPlugin.videoPlayer.duration;
                if (isNaN(SmartPlugin.duration)) {
                    SmartPlugin.duration = 0;
                } else {
                    SmartPlugin.duration = Math.floor(SmartPlugin.duration);
                }
                SmartPlugin.apiClass.sendJoinWithMediaDuration(SmartPlugin.currentTime, joinTime, SmartPlugin.duration);
                SmartPlugin.isJoinSent = true;
            } catch (e) {
                console.log(e);
            }
        }
    },
    error: function () {
        try {
            SmartPlugin.duration = SmartPlugin.videoPlayer.duration;
            if (isNaN(SmartPlugin.duration)) {
                SmartPlugin.duration = 0;
            } else {
                SmartPlugin.duration = Math.floor(SmartPlugin.duration);
            }

            code = SmartPlugin.videoPlayer.error.code;
            msg = "";
            switch (code) {
                case SmartPlugin.videoPlayer.error.MEDIA_ERR_ABORTED:
                    msg = "MEDIA_ERR_ABORTED";
                    break;
                case SmartPlugin.videoPlayer.error.MEDIA_ERR_DECODE:
                    msg = "MEDIA_ERR_DECODE";
                    break;
                case SmartPlugin.videoPlayer.error.MEDIA_ERR_NETWORK:
                    msg = "MEDIA_ERR_NETWORK";
                    break;
                case SmartPlugin.videoPlayer.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    msg = "MEDIA_ERR_SRC_NOT_SUPPORTED";
                    break;
                default:
                    code = "3001";
                    msg = "PLAY_FAILURE";
                    break;
            }
            SmartPlugin.apiClass.sendAdvancedError(code, "winjs", msg, 0, window.location.href, youboraData.getProperties(), youboraData.getLive(), SmartPlugin.urlResource, SmartPlugin.duration, youboraData.getTransaction());
            SmartPlugin.reset();

        } catch (e) {
            console.log(e);
        }
    },
    setPing: function () {
        try {
            SmartPlugin.pingTimer = setTimeout(function () {
                SmartPlugin.ping();
            }, SmartPlugin.apiClass.getPingTime());
        } catch (error) {
            if (SmartPlugin.debug) {
                console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setPing :: Error: " + error);
            }
        }
    },
    ping: function () {
        try {
            clearTimeout(SmartPlugin.pingTimer);
            SmartPlugin.pingTimer = null;
            SmartPlugin.setPing();
            if (SmartPlugin.isStartSent) {
                SmartPlugin.apiClass.sendPingTotalBitrate(SmartPlugin.getCurrentBitRate(), SmartPlugin.currentTime);
            }
        } catch (error) {
            if (SmartPlugin.debug) {
                console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: PÃ®ng :: Error: " + error);
            }
        }
    },
    bufferCheck: function () {
        try {
            if (SmartPlugin.isJoinSent && SmartPlugin.isPaused == false) {
                var currentTime = SmartPlugin.currentTime * 1000;
                if (SmartPlugin.bufferLastTime !== currentTime) {
                    // Update the lastTime if the time has changed.
                    SmartPlugin.bufferLastTime = currentTime;
                    if (SmartPlugin.isBuffering) {
                        if (SmartPlugin.debug) {
                            console.log("*********** END BUFFER! ****************");
                        }
                        SmartPlugin.isBuffering = false;
                        if (SmartPlugin.bufferTimeBegin - SmartPlugin.lastSeekInitTime < 2000) {
                            if (SmartPlugin.debug) {
                                console.log("**** ignored buffer due to seek! ****");
                            }
                        } else {
                            var delta = new Date().getTime() - SmartPlugin.bufferTimeBegin;
                            SmartPlugin.apiClass.sendBuffer(SmartPlugin.currentTime, delta);
                        }
                    }
                } else if ((SmartPlugin.bufferLastTime - currentTime < SmartPlugin.bufferRange) && !SmartPlugin.isPaused) {
                    if (SmartPlugin.isBuffering == false) {
                        if (SmartPlugin.debug) {
                            console.log("*********** START BUFFER! ****************");
                        }
                        SmartPlugin.bufferTimeBegin = new Date().getTime();
                        SmartPlugin.isBuffering = true;

                    }
                }
            }
        } catch (error) {
            if (SmartPlugin.debug) {
                console.log("SmartPlugin :: " + this.pluginName + " :: watcher :: " + error);
            }
        }
    },
    reset: function () {
        try {
            clearTimeout(SmartPlugin.pingTimer);
            clearTimeout(SmartPlugin.bufferInterval);
            SmartPlugin.apiClass.sendStop();
            SmartPlugin.currentTime = 0;
            SmartPlugin.urlResource = "";
            SmartPlugin.isLive = youboraData.getLive();
            SmartPlugin.duration = 0;
            SmartPlugin.isPaused = false;
            SmartPlugin.isStartSent = false;
            SmartPlugin.bufferTimeBegin = 0;
            SmartPlugin.isJoinSent = false;
            SmartPlugin.pingTimer = "";
            SmartPlugin.lastSeekInitTime = 0;
            SmartPlugin.isBuffering = false;
            SmartPlugin.bufferLastTime = 1000;
            SmartPlugin.bufferRange = 800;
            SmartPlugin.bufferMilis = 1000;
            SmartPlugin.bufferInterval = undefined;
            SmartPlugin.apiClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, SmartPlugin.pluginVersion, SmartPlugin.targetDevice);
        } catch (error) {
            if (SmartPlugin.debug) {
                console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: reset :: Error: " + error);
            }
        }
    },
    sendError: function (msg, errorCode, resource) {
        try {
            SmartPlugin.apiClass.sendAdvancedError(errorCode, SmartPlugin.targetDevice, msg, 0, window.location.href, "", SmartPlugin.isLive, SmartPlugin.urlResource, SmartPlugin.duration, youboraData.getTransaction());
            SmartPlugin.reset();
        } catch (error) {
            if (SmartPlugin.debug) {
                console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: sendError :: Error: " + error);
            }
        }
    }
}