/*
 * YouboraCommunication
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: LluÃ­s Campos Beltran
 * Version: 3.1.0
 *  - Full Revision
 */
var SmartPlugin = {
    // General
    debug: youboraData.getDebug(),
    isLive: youboraData.getLive(),
    bandwidth: { username: youboraData.getUsername(), interval: 6000 },
    targetDevice: "PC-HTML5-BRIGHTCOVE",
    pluginName: "BRIGHTCOVE",
    pluginVersion: "1.3.3.1.3",
    initDone: 0,
    // Balancer
    balancing: youboraData.getBalanceEnabled(),
    balanceObject: "",
    balanceIndex: 1,
    // Media
    mediaEvents: { BUFFER_BEGIN: 1, BUFFER_END: 0, JOIN_SEND: 2 },
    videoPlayer: undefined,
    urlResource: undefined,
    pingTimer: undefined,
    apiClass: undefined,
    currentTime: 0,
    duration: 0,
    // Triggers
    isStreamError: false,
    isBuffering: false,
    isStartSent: false,
    isJoinSent: false,
    isPaused: false,
    previousElapsedTime: 0,
    bufferTimeBegin: 0,
    joinTimeBegin: 0,
    joinTimeEnd: 0,
    // Plugin Customs
    videoPlayer: undefined,
    experience: undefined,
    bcvideoplayer: undefined,
    contentPlayer: undefined,
    errorCodes:{
        1 : 2011, //DOMAIN_RESTRICTED
        2 : 2012, //GEO_RESTRICTED
        3 : 2013, //INVALID_ID
        4 : 2014, //NO_CONTENT
        18: 2015, //PE_COMPONENT_CORRUPTED
        14: 2016, //PE_LIVE_UNPUBLISHED
        16: 2017, //PE_REQUIRED_COMPONENT
        17: 2018, //PE_REQUIRED_COMPONENT_CORRUPTED
        8 : 2019, //SERVICE_UNAVAILABLE
        5 : 2020, //UNAVAILABLE_CONTENT
        0 : 2021, //UNKNOWN
        7 : 2022, //UPGRADE_REQUIRED_FOR_PLAYER
        6 : 2023, //UPGRADE_REQUIRED_FOR_VIDEO
        9 : 2024, //VE_FMS_CONNECT_FAILED
        10: 2025, //VE_MOUUNT_NOT_FOUND
        11: 2026, //VE_PD_NOTFOUND
        12: 2027, //VS_RESTRICT_INACTIVE
        13: 2028, //VS_RESTRICT_SCHEDULED
        15: 2029, //VS_SECURITY_VID
        "DOMAIN_RESTRICTED" : 2011, //DOMAIN_RESTRICTED
        "GEO_RESTRICTED" : 2012, //GEO_RESTRICTED
        "INVALID_ID" : 2013, //INVALID_ID
        "NO_CONTENT" : 2014, //NO_CONTENT
        "PE_COMPONENT_CORRUPTED": 2015, //PE_COMPONENT_CORRUPTED
        "PE_LIVE_UNPUBLISHED": 2016, //PE_LIVE_UNPUBLISHED
        "PE_REQUIRED_COMPONENT": 2017, //PE_REQUIRED_COMPONENT
        "PE_REQUIRED_COMPONENT_CORRUPTED": 2018, //PE_REQUIRED_COMPONENT_CORRUPTED
        "SERVICE_UNAVAILABLE" : 2019, //SERVICE_UNAVAILABLE
        "UNAVAILABLE_CONTENT" : 2020, //UNAVAILABLE_CONTENT
        "UNKNOWN" : 2021, 
        "UPGRADE_REQUIRED_FOR_PLAYER" : 2022, //UPGRADE_REQUIRED_FOR_PLAYER
        "UPGRADE_REQUIRED_FOR_VIDEO" : 2023, //UPGRADE_REQUIRED_FOR_VIDEO
        "VE_FMS_CONNECT_FAILED" : 2024, //VE_FMS_CONNECT_FAILED
        "VE_MOUUNT_NOT_FOUND": 2025, //VE_MOUUNT_NOT_FOUND
        "VE_PD_NOTFOUND": 2026, //VE_PD_NOTFOUND
        "VS_RESTRICT_INACTIVE": 2027, //VS_RESTRICT_INACTIVE
        "VS_RESTRICT_SCHEDULED": 2028, //VS_RESTRICT_SCHEDULED
        "VS_SECURITY_VID": 2029  //VS_SECURITY_VID

    },
    Init: function () {
        SmartPlugin.initDone++;
        try {
            if (SmartPlugin.initDone <= 5) {
                if (spYoubora.isYouboraApiLoaded() == false) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Init :: Api Not Ready..."); }
                    setTimeout("SmartPlugin.Init()", 200);
                } else {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Init ::"); }
                    SmartPlugin.initDone = true;
                    SmartPlugin.startPlugin();
                }
            } else {
                if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Init Error :: Unable to reach Api..."); }
                spLoaded = false;
            }
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Init :: Error: " + error); }
            spLoaded = false;
        }
    },
    startPlugin: function () {
        SmartPlugin.initDone++;
        try {
            var test = brightcove.api.getExperience(document.getElementsByTagName('iframe')[0].id);
            if (SmartPlugin.initDone <= 5) { 
                if (test == undefined) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: startPlugin :: BrightCove experience not ready retryng..."); }
                    setTimeout("SmartPlugin.startPlugin()", 500);
                } else {
                    try {
                        SmartPlugin.player = brightcove.api.getExperience(document.getElementsByTagName('iframe')[0].id);
                        SmartPlugin.videoPlayer = SmartPlugin.player.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
                        SmartPlugin.experience = SmartPlugin.player.getModule(brightcove.api.modules.APIModules.EXPERIENCE);
                        SmartPlugin.contentPlayer = SmartPlugin.player.getModule(brightcove.api.modules.APIModules.CONTENT);
                        if (SmartPlugin.debug) {
                            console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: BrightCove HTML5 Player Found.");
                            console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Player attachment completed.");
                        }
                        SmartPlugin.apiClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, SmartPlugin.pluginVersion, SmartPlugin.targetDevice);
                        SmartPlugin.bindEvents();
                    } catch (error) {
                        if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Player Not Found: " + error); }
                    }
                }
            } else {
                if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: startPlugin Fatal Error :: Unable to reach BrightCove Experience..."); }
            }
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: startPlugin :: Error: " + error); }
        }
    },
    bindEvents: function () {
        try {

            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.CHANGE, SmartPlugin.checkPlayState); } 
            catch (error) { if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: bindEvents :: Failed to bind [MediaEvent.CHANGE] :: " + error); } }

            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.ERROR, SmartPlugin.checkPlayState); } 
            catch (error) { if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: bindEvents :: Failed to bind [MediaEvent.ERROR] :: " + error); } }

            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.PLAY, SmartPlugin.checkPlayState); } 
            catch (error) { if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: bindEvents :: Failed to bind [MediaEvent.PLAY] :: " + error); } }

            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.PROGRESS, SmartPlugin.checkPlayState); } 
            catch (error) { if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: bindEvents :: Failed to bind [MediaEvent.PROGRESS] :: " + error); } }

            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.STOP, SmartPlugin.checkPlayState); } 
            catch (error) { if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: bindEvents :: Failed to bind [MediaEvent.STOP] :: " + error); } }

            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.BEGIN, SmartPlugin.checkPlayState); }
            catch (error) { if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: bindEvents :: Failed to bind [MediaEvent.BEGIN] :: " + error); } }

            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.COMPLETE, SmartPlugin.checkPlayState); } 
            catch (error) { if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: bindEvents :: Failed to bind [MediaEvent.COMPLETE] :: " + error); } }

            

        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: bindEvents :: Error: " + error); }
        }
    },
    renditionHandler: function (rendition) {
        try {
            SmartPlugin.rendition = rendition;
            if (rendition != null && rendition.encodingRate > 0) { 
                SmartPlugin.currentBitrate = rendition.encodingRate;
            } else {
                SmartPlugin.currentBitrate = "-1";
            }
        } catch (error) {
            if (SmartPlugin.debug) {
                console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: renditionHandler :: Error: " + error);
            }
        }
    },
    sendStartHandler: function (video) {
        try {
            SmartPlugin.urlResource = video.defaultURL;
            SmartPlugin.bcvideoplayer = video;

            if (youboraData.properties.content_metadata.title == "") {
                if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Setting Title: " + video.displayName); }
                youboraData.setPropertyMetaTitle(video.displayName);
            }
            youboraData.setLive(video.isStreaming);

            if (SmartPlugin.urlResource != "") {
                if (SmartPlugin.balancing && SmartPlugin.apiClass.enableBalancer) {

                    if (SmartPlugin.balanceObject == "") {
                        youboraData.setBalancedResource(true);
                        var path = SmartPlugin.apiClass.getResourcePath(SmartPlugin.urlResource);
                        SmartPlugin.apiClass.getBalancedResource(path, function (obj) { SmartPlugin.setBalancedResource(obj); });
                    } else {
                        SmartPlugin.apiClass.sendError("130" + SmartPlugin.getBalancerErrorCount(), "CDN_PLAY_FAILURE_AND_TRY_NEXT");
                        SmartPlugin.balanceIndex++;
                        SmartPlugin.refreshBalancedResource();
                    }
                } else {
                    youboraData.setBalancedResource(false);
                    if (!SmartPlugin.isStartSent) {
                        SmartPlugin.apiClass.sendStart(0, window.location.href, "", youboraData.getLive(), SmartPlugin.urlResource, SmartPlugin.duration);
                        SmartPlugin.setPing();
                        SmartPlugin.isStartSent = true;
                    }
                }
            }
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: sendStartHandler :: Error: " + error); }
        }

    },
    checkPlayState: function (e) { 

       
       if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: checkPlayState :: " + e.type); }

        switch (e.type) {
            case "mediaProgress":
                try {
                    SmartPlugin.currentTime = e.position;
                    SmartPlugin.duration = e.duration;

                    if (SmartPlugin.previousElapsedTime != SmartPlugin.currentTime) {
                        SmartPlugin.checkBuffering();
                    }
                    if (!SmartPlugin.isJoinSent) {
                        SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_END);
                    }
                    SmartPlugin.previousElapsedTime = SmartPlugin.currentTime;
                } catch (error) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: mediaProgress :: Error: " + error); }
                }
            break;

            case "mediaPlay":
                try {
                    SmartPlugin.duration = e.duration;
                    if (!SmartPlugin.isJoinSent) {
                        SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
                    }
                    if (SmartPlugin.isStartSent == false) {
                        SmartPlugin.videoPlayer.getCurrentRendition(function (e) {
                            SmartPlugin.renditionHandler(e)
                        });
                        SmartPlugin.videoPlayer.getCurrentVideo(function (e) {
                            SmartPlugin.sendStartHandler(e);
                        });
                    } else {
                        if (SmartPlugin.balancing && SmartPlugin.apiClass.enableBalancer) {

                            if (SmartPlugin.balanceObject == "") {
                                var path = SmartPlugin.apiClass.getResourcePath(SmartPlugin.urlResource);
                                SmartPlugin.apiClass.getBalancedResource(path, function (obj) {
                                    SmartPlugin.setBalancedResource(obj);
                                });
                            } else {
                                SmartPlugin.apiClass.sendError("130" + SmartPlugin.getBalancerErrorCount(), "CDN_PLAY_FAILURE_AND_TRY_NEXT");
                                SmartPlugin.balanceIndex++;
                                SmartPlugin.refreshBalancedResource();
                            }
                        }
                        if (SmartPlugin.isPaused) {
                            SmartPlugin.apiClass.sendResume();
                            SmartPlugin.isPaused = false;
                        }
                    }
                } catch (error) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: mediaPlay :: Error: " + error); }
                }
            break;

            case "mediaStop":
                try {
                    console.log("Pos : " + e.position + " , " + SmartPlugin.duration + " , " + SmartPlugin.isStartSent);
                    if (e.position >= SmartPlugin.duration && SmartPlugin.isStartSent) {
                        SmartPlugin.checkBuffering();
                        clearInterval(SmartPlugin.pingTimer);
                        if (SmartPlugin.isStartSent) SmartPlugin.apiClass.sendStop();
                        SmartPlugin.reset();
                    } else {
                        if (SmartPlugin.isStartSent) {
                            SmartPlugin.isPaused = true;
                            SmartPlugin.checkBuffering();
                            SmartPlugin.apiClass.sendPause();
                            if (SmartPlugin.debug) { console.log('SmartPlugin :: BRIGHTCOVE :: mediaStop ::'); }
                        }
                    }

                } catch (error) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: mediaStop :: Error: " + error); }
                }
            break;

            case "mediaError":
                try {
                    if (SmartPlugin.balancing && SmartPlugin.apiClass.enableBalancer) {
                        if (SmartPlugin.debug) {
                            console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: playerError :: Balancing...");
                        }
                        SmartPlugin.isStreamError = true;
                        SmartPlugin.apiClass.sendError("130" + SmartPlugin.getBalancerErrorCount(), "CDN_PLAY_FAILURE_AND_TRY_NEXT");
                        SmartPlugin.balanceIndex++;
                        SmartPlugin.refreshBalancedResource();
                    } else {
                        SmartPlugin.isStreamError = true;
                        SmartPlugin.checkBuffering();
                        clearInterval(SmartPlugin.pingTimer);
                        var niceErrorCode;
                        try{
                            niceErrorCode =  SmartPlugin.errorCodes[playerEvent.code];
                            if(niceErrorCode == undefined){
                                niceErrorCode = playerEvent.code;
                            }
                        }catch(e){}
                        if(niceErrorCode == undefined){
                            niceErrorCode = "3001";
                        }
                        SmartPlugin.apiClass.sendError(niceErrorCode.toString, "PLAY_FAILURE");
                        SmartPlugin.reset();
                    }

                } catch (error) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: abort :: Error: " + error); }
                }
            break;

            case "mediaBufferComplete":
                try {
                    SmartPlugin.checkBuffering();
                } catch (error) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: mediaBufferComplete :: Error: " + error); }
                }

            break;

            case "mediaBufferBegin":
                try {
                    SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
                    SmartPlugin.isBuffering = true;
                } catch (error) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: mediaBufferBegin :: Error: " + error); }
                }
            break;

            case "mediaBegin":
                try {
                    SmartPlugin.checkBuffering();
                    if (!SmartPlugin.isJoinSent) {
                        SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_END);
                    }
                } catch (error) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: playing :: Error: " + error); }
                }
            break;

            case "mediaChange":
                // Unused
            break;
        }
    },
    getBalancerErrorCount: function () {
        if (SmartPlugin.balanceIndex < 10) {
            return "00" + SmartPlugin.balanceIndex;
        } else if (SmartPlugin.balanceIndex > 10) {
            return "0" + SmartPlugin.balanceIndex;
        } else { return "000"; }
    },
    setBrightCoveURL: function (url) {

        if (SmartPlugin.debug) { console.log("SmartPlugin :: BRIGHTCOVE :: setBrightCoveURL :: " + url); }
        try {
            SmartPlugin.bcvideoplayer.defaultURL = url;
            SmartPlugin.bcvideoplayer.FLVFullLengthURL = url;
            SmartPlugin.bcvideoplayer.videoStillURL = url;
            SmartPlugin.bcvideoplayer.linkURL = url;
            try { SmartPlugin.contentPlayer.updateMedia(SmartPlugin.bcvideoplayer); } catch (e) { }
            try { SmartPlugin.videoPlayer.loadVideoByID(SmartPlugin.bcvideoplayer.id); } catch (e) { }
            if (!SmartPlugin.isStartSent) {
                SmartPlugin.isStartSent = true;
                if(SmartPlugin.urlResource.indexOf("%")>0){
                     SmartPlugin.urlResource = decodeURIComponent(SmartPlugin.urlResource);
                }
                SmartPlugin.apiClass.sendStart(0, window.location.href, "", youboraData.getLive(), SmartPlugin.urlResource, SmartPlugin.duration, youboraData.getTransaction());
                SmartPlugin.setPing();
            }
        } catch (error) {
            if (SmartPlugin.debug) {
                console.log("SmartPlugin :: BRIGHTCOVE :: setBrightCoveURL :: Error: " + error);
            }
        }
    },
    refreshBalancedResource: function () {
        try {
            if (typeof SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['URL'] != "undefined") {
                SmartPlugin.videoPlayer.currentSrc = SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['URL'];
                SmartPlugin.setBrightCoveURL(SmartPlugin.urlResource);
            } else {
                SmartPlugin.balancing = false;
                if (SmartPlugin.debug) {
                    console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balancer :: Error :: End of mirrors");
                    SmartPlugin.apiClass.sendError("131" + SmartPlugin.getBalancerErrorCount(), "CDN_PLAY_FAILURE");
                }
            }
        } catch (error) {
            if (SmartPlugin.debug) {
                console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balancer :: Error :: End of mirrors error:" + error);
                SmartPlugin.apiClass.sendError("131" + SmartPlugin.getBalancerErrorCount(), "CDN_PLAY_FAILURE");
            }
        }
    },
    setBalancedResource: function (obj) {
        try {
            if (obj != false) {
                var indexCount = 0;
                for (index in obj) {
                    indexCount++;
                }
                SmartPlugin.balanceObject = obj;
                SmartPlugin.balanceObject['' + (indexCount + 1) + ''] = new Object();
                SmartPlugin.balanceObject['' + (indexCount + 1) + '']['URL'] = SmartPlugin.urlResource; 
                if (typeof obj['1']['URL'] != "undefined") {
                    if (SmartPlugin.debug) {
                        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balance Current Resource  :: " + SmartPlugin.urlResource);
                        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balance Priority Resource :: " + obj['1']['URL']);
                    }
                    if (obj['1']['URL'] != SmartPlugin.urlResource) {
                        if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balancing :: " + obj['1']['URL']); }
                        try {
                            SmartPlugin.videoPlayer.currentSrc = obj['1']['URL'];
                            SmartPlugin.setBrightCoveURL(SmartPlugin.urlResource);
                        } catch (error) {
                            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balancing :: Error While Changing Media: " + error); }
                            SmartPlugin.videoPlayer.currentSrc = SmartPlugin.urlResource;
                            SmartPlugin.setBrightCoveURL(SmartPlugin.urlResource);
                        }
                    } else {
                        if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balancer :: Same Resource"); }
                        SmartPlugin.setBrightCoveURL(SmartPlugin.urlResource);
                    }
                } else {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Invalid balance object"); }
                    SmartPlugin.setBrightCoveURL(SmartPlugin.urlResource);
                }
            } else {
                if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balance unavailable with current parameters"); }
                SmartPlugin.setBrightCoveURL(SmartPlugin.urlResource);
            }
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setBalancedResource :: Error: " + error); }
        }
    },
    checkBuffering: function () {
        try {
            if (SmartPlugin.isBuffering) {
                if (SmartPlugin.isStartSent) { SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_END); }
                SmartPlugin.isBuffering = false;
            }
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: checkBuffering :: Error: " + error); }
        }
    },
    setBufferEvent: function (bufferState) {
        try {

            var d = new Date();
            var bufferTimeEnd = 0;
            var bufferTimeTotal = 0;

            switch (bufferState) {
            case SmartPlugin.mediaEvents.BUFFER_BEGIN:
                SmartPlugin.bufferTimeBegin = d.getTime();
                if (SmartPlugin.joinTimeBegin == 0) { SmartPlugin.joinTimeBegin = d.getTime(); }
            break;

            case SmartPlugin.mediaEvents.BUFFER_END:
                bufferTimeEnd = d.getTime();
                bufferTimeTotal = bufferTimeEnd - SmartPlugin.bufferTimeBegin;
                if (SmartPlugin.isJoinSent == false) {
                    SmartPlugin.isJoinSent = true;
                    var joinTimeTotal = d.getTime() - SmartPlugin.joinTimeBegin;
                    if (SmartPlugin.isStartSent) { SmartPlugin.apiClass.sendJoin(SmartPlugin.currentTime, joinTimeTotal); }
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setBufferEvent :: sendJoin"); }
                } else {
                    var currentTime = SmartPlugin.currentTime;
                    if (currentTime == 0 && SmartPlugin.isLive) { currentTime = 10; }
                    if (SmartPlugin.isStartSent) { SmartPlugin.apiClass.sendBuffer(currentTime, bufferTimeTotal); }
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setBufferEvent :: sendBuffer"); }
                }
            break;

            }
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setBufferEvent :: Error: " + error); }
        }
    },
    setPing: function () {
        try {
            SmartPlugin.pingTimer = setTimeout(function () {
                SmartPlugin.ping();
            }, SmartPlugin.apiClass.getPingTime());
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setPing :: Error: " + error); }
        }
    },
    ping: function () {
        try {
            clearTimeout(SmartPlugin.pingTimer);
            SmartPlugin.pingTimer = null;
            SmartPlugin.setPing();
            if (SmartPlugin.isStartSent) { SmartPlugin.apiClass.sendPingTotalBitrate(SmartPlugin.currentBitrate, SmartPlugin.currentTime); }
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Ping :: Error: " + error); }
        }
    },
    reset: function () {
        try {
            clearTimeout(SmartPlugin.pingTimer);
            SmartPlugin.apiClass.sendStop();
            SmartPlugin.currentTime = 0;
            SmartPlugin.urlResource = "";
            SmartPlugin.isLive = youboraData.getLive();
            SmartPlugin.duration = 0;
            SmartPlugin.previousElapsedTime = 0;
            SmartPlugin.isPaused = false;
            SmartPlugin.isStartSent = false;
            SmartPlugin.bufferTimeBegin = 0;
            SmartPlugin.isJoinSent = false;
            SmartPlugin.joinTimeBegin = 0;
            SmartPlugin.joinTimeEnd = 0;
            SmartPlugin.pingTimer = "";
            SmartPlugin.balanceIndex = 1;
            SmartPlugin.balanceObject = "";
            SmartPlugin.apiClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, SmartPlugin.pluginVersion, SmartPlugin.targetDevice);
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: reset :: Error: " + error); }
        }
    }
}
