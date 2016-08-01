// Copyright (c) 2014 NicePeopleAtWork
// Author: Lluís Campos Beltran
// Version: 3.1.0
var SmartPlugin = {
    // General
    debug: youboraData.getDebug(),
    isLive: youboraData.getLive(),
    bandwidth: { username: youboraData.getUsername(), interval: 5000 },
    targetDevice: "PC-HTML5",
    pluginVersion: "1.3.3.1.0",
    pluginName: "HTML5",
    initDone: 0,
    // Balancer
    balancing: youboraData.getBalanceEnabled(),
    balanceObject: "",
    balanceIndex: 1,
    // Media
    currentBitrate: 0,
    bitrateTimer: undefined,
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
    originalCDN:"",
    seeking :false,
    progressCount:0,
    Init: function () {
        SmartPlugin.initDone++;
        try {
            if (SmartPlugin.initDone <= 5) {
                if (spYoubora.isYouboraApiLoaded() == false) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Init :: Api Not Ready..."); }
                    setTimeout("SmartPlugin.Init()", 200);
                } else {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Init ::"); }
                    //SmartPlugin.defineWatch(); 
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
        try {
            try {
                SmartPlugin.videoPlayer = document.getElementsByTagName('video')[0]; 
                SmartPlugin.duration =  SmartPlugin.videoPlayer.duration;
                SmartPlugin.originalCDN = youboraData.getCDN();
                if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: startPlugin :: HTML5 <video> found!"); }
                SmartPlugin.apiClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, SmartPlugin.pluginVersion, SmartPlugin.targetDevice);
                SmartPlugin.bindEvents();
                try {
                    window.onunload = function () { SmartPlugin.unloadPlugin(); };
                } catch (error) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: startPlugin :: Unable to bind unload event!"); }
                }
            } catch (error) {
                if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: startPlugin :: No <video> found!"); }
                spLoaded = false;
            }
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: startPlugin :: Error: " + error); }
            spLoaded = false;
        }
    },
    bindEvents: function () {
        try {
            var playerEvents = ["canplay", "playing", /*"waiting",*/ "timeupdate", "ended", "play", "pause", "error", "abort","seeking","seeked","progress"];
            for (elem in playerEvents) { SmartPlugin.videoPlayer.addEventListener(playerEvents[elem], function (e) { SmartPlugin.checkPlayState(e); }, false); }
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: bindEvents :: Events atached correctly!"); }
            if (SmartPlugin.balancing) { SmartPlugin.firstBalancerCheck() }
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: bindEvents :: Error: " + error); }
        }
    },
    firstBalancerCheck: function () {

        try {
            SmartPlugin.initDone++;
            if (SmartPlugin.initDone <= 5) {
                if (SmartPlugin.apiClass.enableBalancer == undefined) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: firstBalancerCheck :: Api Class Not Ready..."); }
                    setTimeout("SmartPlugin.firstBalancerCheck()", 200);
                } else {
                    youboraData.setBalancedResource(true);
                    SmartPlugin.urlResource = SmartPlugin.videoPlayer.currentSrc;
                    var path = SmartPlugin.apiClass.getResourcePath(SmartPlugin.urlResource);
                    SmartPlugin.apiClass.getBalancedResource(path, function (obj) { SmartPlugin.setBalancedResource(obj); });
                    SmartPlugin.initDone = true;
                }
            } else {
                if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: firstBalancerCheck :: Unable to reach Api class..."); }
            }
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: firstBalancerCheck :: Error: " + error); }
        }
    },
    checkBitrateType: function () {
       
        if (typeof SmartPlugin.videoPlayer.webkitVideoDecodedByteCount != "undefined") {
            clearInterval(SmartPlugin.bitrateTimer);
            SmartPlugin.bitrateTimer = setInterval(function () { SmartPlugin.currentBitrate = SmartPlugin.videoPlayer.webkitVideoDecodedByteCount; }, 1000);
        }
    },
    unloadPlugin: function () {
        try {
            SmartPlugin.checkBuffering();
            SmartPlugin.reset("unload");
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: unloadPlugin :: Error: " + error); }
        }
    },
    checkPlayState: function ( e ) {

        if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: checkPlayState :: " + e.type); }

        switch (e.type) {
            case "timeupdate":
                try {
                    SmartPlugin.urlResource = SmartPlugin.videoPlayer.currentSrc;
                    SmartPlugin.currentTime = SmartPlugin.videoPlayer.currentTime;
                    SmartPlugin.duration = SmartPlugin.videoPlayer.duration;
                    if ( SmartPlugin.videoPlayer.currentTime > 0 ) {
                        if ( !SmartPlugin.isStartSent ) {
                            SmartPlugin.apiClass.sendStart ( 0 , window.location.href , "" , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.videoPlayer.duration );
                            SmartPlugin.setPing(); 
                            SmartPlugin.isStartSent = true;
                        }                    
                        if (!SmartPlugin.isJoinSent || SmartPlugin.isBuffering) {
                            SmartPlugin.isBuffering = false;
                            SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_END);
                        }
                         SmartPlugin.progressCount=0;
                        SmartPlugin.apiClass.currentTime = SmartPlugin.currentTime;
                    }
                } catch (error) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: "+e.type+" :: Error: " + error); }
                }
            break;

            case "play":
                try {
                    SmartPlugin.urlResource = SmartPlugin.videoPlayer.currentSrc;
                    if ( SmartPlugin.balancing && SmartPlugin.apiClass.enableBalancer) {
                        if ( SmartPlugin.balanceObject == "") {
                            var path = SmartPlugin.apiClass.getResourcePath(SmartPlugin.urlResource);
                            SmartPlugin.apiClass.getBalancedResource(path , function(obj) { SmartPlugin.setBalancedResource(obj); });       
                        } else { 
                            if (!SmartPlugin.isJoinSent) { SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN); }
                            if (SmartPlugin.currentBitrate == 0) { SmartPlugin.checkBitrateType(); }
                            if (!SmartPlugin.isStartSent) {
                                SmartPlugin.duration = SmartPlugin.videoPlayer.duration;
                                SmartPlugin.apiClass.sendStart(0, window.location.href, "", youboraData.getLive(), SmartPlugin.urlResource, SmartPlugin.videoPlayer.duration);
                                SmartPlugin.setPing();
                                SmartPlugin.isStartSent = true;
                            }
                            if (SmartPlugin.isPaused) {
                                SmartPlugin.apiClass.sendResume();
                                SmartPlugin.isPaused = false;
                            }
                        }
                    } else { 
                        if (SmartPlugin.currentBitrate == 0) { SmartPlugin.checkBitrateType(); }
                        if (!SmartPlugin.isJoinSent) { SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN); }
                        if (!SmartPlugin.isStartSent) {
                            SmartPlugin.duration = SmartPlugin.videoPlayer.duration;
                            SmartPlugin.apiClass.sendStart(0, window.location.href, "", youboraData.getLive(), SmartPlugin.urlResource, SmartPlugin.videoPlayer.duration,youboraData.getTransaction());
                            SmartPlugin.setPing();
                            SmartPlugin.isStartSent = true;
                        }
                        if (SmartPlugin.isPaused) {
                            SmartPlugin.apiClass.sendResume();
                            SmartPlugin.isPaused = false;
                        } 
                    } 
                } catch (error) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: "+e.type+" :: Error: " + error); }
                }
            break;

            case "canplay":
                try { 
                    if (SmartPlugin.videoPlayer.autoplay) { SmartPlugin.videoPlayer.play() } 
                } catch (error) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: "+e.type+" :: Error: " + error); }
                }
            break;

            case "pause":
                try {
                    SmartPlugin.checkBuffering();
                    if (SmartPlugin.isStartSent) { SmartPlugin.apiClass.sendPause(); }
                    SmartPlugin.isPaused = true;
                } catch (error) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: "+e.type+" :: Error: " + error); }
                }
            break;

            case "ended":
                try {
                    SmartPlugin.checkBuffering();
                    SmartPlugin.reset("ended");
                } catch (error) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: "+e.type+" :: Error: " + error); }
                }
            break;

            case "error":
                try {
                    SmartPlugin.checkBuffering();
                    if (SmartPlugin.balancing && SmartPlugin.apiClass.enableBalancer) {
                        if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balancing to next resource due to error..."); }
                        SmartPlugin.isStreamError = true;
                        SmartPlugin.apiClass.sendErrorWithParameters("130" + SmartPlugin.getBalancerErrorCount(), "CDN_PLAY_FAILURE_AND_TRY_NEXT", 0, window.location.href, "", youboraData.getLive(), SmartPlugin.urlResource, SmartPlugin.duration);
                        SmartPlugin.balanceIndex++;
                        SmartPlugin.refreshBalancedResource();
                    } else {
                        SmartPlugin.isStreamError = true;
                        SmartPlugin.checkBuffering();             
                        clearInterval(SmartPlugin.pingTimer); 
                        SmartPlugin.apiClass.sendError( 3001 , "PLAY_FAILURE");  
                        SmartPlugin.reset("error");
                    } 
                } catch (error) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: "+e.type+" :: Error: " + error); }
                }
            break;

            case "abort":
                try {

                } catch (error) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: "+e.type+" :: Error: " + error); }
                }
            break;

            /*case "waiting":
                try {
                    if(!SmartPlugin.seeking){
                        SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
                        SmartPlugin.isBuffering = true;
                    }
                } catch (error) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: "+e.type+" :: Error: " + error); }
                }
            break;*/

            case "playing":
                try {
                    if (!SmartPlugin.isJoinSent || SmartPlugin.isBuffering) {
                        SmartPlugin.isBuffering = false;
                        SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_END);
                    }
                } catch (error) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: "+e.type+" :: Error: " + error); }
                }
            break;

            case "seeking":
                SmartPlugin.seeking =true;
            break;

            case "seeked":
                SmartPlugin.seeking =false;
            break;

            case "progress":
                SmartPlugin.progressCount++;
                 if(SmartPlugin.isPaused){
                    SmartPlugin.progressCount=0;
                }
                if(!SmartPlugin.isBuffering && SmartPlugin.progressCount > 9 && SmartPlugin.isJoinSent && !SmartPlugin.seeking){
                                    console.log("SmartPlugin.isBuffering : " + SmartPlugin.isBuffering + " , count : "+SmartPlugin.progressCount+ " ,  SmartPlugin.isJoinSent : "+  SmartPlugin.isJoinSent +" SmartPlugin.seeking "+ SmartPlugin.seeking)  ;

                    SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
                    SmartPlugin.isBuffering = true;
                    SmartPlugin.progressCount = 0 ;
                }   
               
            break;
        }
    },
    getBalancerErrorCount: function () {
        if (SmartPlugin.balanceIndex < 10) {
            return "0" + SmartPlugin.balanceIndex;
        } else if (SmartPlugin.balanceIndex > 10) {
            return SmartPlugin.balanceIndex;
        } else {
            return "000";
        }
    },
    refreshBalancedResource: function () {
        try {
            if (typeof SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['URL'] != "undefined") {
                if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: refreshBalancedResource :: Next URL (" + SmartPlugin.balanceIndex + "): " + SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['URL']); }
                SmartPlugin.videoPlayer.src = SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['URL'];
                if(SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['CDN_CODE'] != undefined){
                    youboraData.setCDN(SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['CDN_CODE']);
                }else{
                    youboraData.setCDN(SmartPlugin.originalCDN);
                }
                if (SmartPlugin.videoPlayer.autoplay) { SmartPlugin.videoPlayer.play(); }
            } else {
                SmartPlugin.balancing = false;
                if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balancer :: Error :: End of mirrors"); }
            }
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balancer :: Error :: End of mirrors"); }
            SmartPlugin.balancing = false;
        }
    },
    setBalancedResource: function (obj) {
        try {
            if (obj != false) {
                var indexCount = 0;
                for (index in obj) { indexCount++; }
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
                            console.log("Balancer object : ");
                            console.log(obj);
                            SmartPlugin.urlResource = obj['1']['URL'];
                            youboraData.setCDN(obj['1']['CDN_CODE']);
                            if(obj['1']['CDN_CODE'] != undefined){
                                youboraData.setCDN(obj['1']['CDN_CODE']);
                            }else{
                                youboraData.setCDN(SmartPlugin.originalCDN);
                            }
                            SmartPlugin.videoPlayer.src = obj['1']['URL'];
                        } catch (error) {
                            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balancing :: Error While Changing Media: " + error); }
                        }
                    } else {
                        if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balancer :: Same Resource"); }
                    }
                } else {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Invalid balance object"); }
                    SmartPlugin.balancing = false;
                }
            } else {
                if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balance unavailable with current parameters"); }
                SmartPlugin.balancing = false;
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
                        var joinTimeTotal = d.getTime() - SmartPlugin.joinTimeBegin;
                        if (SmartPlugin.isStartSent) {
                            SmartPlugin.isJoinSent = true;
                            SmartPlugin.apiClass.sendJoin(SmartPlugin.currentTime, joinTimeTotal);
                        }
                        if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setBufferEvent :: sendJoin"); }
                    } else {
                        var currentTime = SmartPlugin.currentTime;
                        if (currentTime == 0 && SmartPlugin.isLive) { currentTime = 10; }
                        //We need to defend ourselves from micro buffer events
                        if(bufferTimeTotal>100){
                            if (SmartPlugin.isStartSent) { SmartPlugin.apiClass.sendBuffer(currentTime, bufferTimeTotal); }
                            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setBufferEvent :: sendBuffer"); }
                        }
                    }
                break;
            }
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setBufferEvent :: Error: " + error); }
        }
    },
    setPing: function () {
        try {
            SmartPlugin.pingTimer = setTimeout(function () { SmartPlugin.ping(); }, SmartPlugin.apiClass.getPingTime());
        } catch (error) {
            if(SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setPing :: Error: " + error); }
        }
    },
    ping: function () {
        try {
            clearTimeout(SmartPlugin.pingTimer);
            SmartPlugin.pingTimer = null;
            SmartPlugin.setPing();
            if (SmartPlugin.currentBitrate == 0) { SmartPlugin.checkBitrateType(); }
            if (SmartPlugin.isStartSent) { SmartPlugin.apiClass.sendPingTotalBytes(SmartPlugin.currentBitrate, SmartPlugin.currentTime); }
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Pîng :: Error: " + error); }
        }
    },
    defineWatch: function () {
        try {
            if (!Object.prototype.watch) {
                Object.defineProperty(Object.prototype, "watch", {
                    enumerable: false, configurable: true, writable: false,
                    value: function (prop, handler) {
                        var oldval = this[prop],
                            newval = oldval,
                            getter = function () { return newval; },
                            setter = function (val) { oldval = newval; return newval = handler.call(this, prop, oldval, val); };
                        if (delete this[prop]) {
                            Object.defineProperty(this, prop, { get: getter, set: setter, enumerable: true, configurable: true });
                        }
                    }
                });
            }
            if (!Object.prototype.unwatch) {
                Object.defineProperty(Object.prototype, "unwatch", {
                    enumerable: false, configurable: true, writable: false,
                    value: function (prop) { var val = this[prop]; delete this[prop]; this[prop] = val; }
                });
            }
            SmartPlugin.setWatch();
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: defineWatch :: Error: " + error); }
        }
    },
    setWatch: function () {
        try {
            var varsToWatch = ["balancing", "balanceObject", "balanceIndex", "videoPlayer", "urlResource", "currentTime", "isStreamError", "isBuffering", "isStartSent", "isJoinSent", "isPaused", "bufferTimeBegin", "joinTimeBegin", "joinTimeEnd"];
            for (elem in varsToWatch) {
                if (typeof varsToWatch[elem] != "function") {
                    SmartPlugin.watch(varsToWatch[elem], function (id, oldVal, newVal) {
                        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Watcher :: [" + id + "] From: [" + oldVal + "] To: [" + newVal + "]");
                        return newVal;
                    });
                }
            }
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setWatch :: Error: " + error); }
        }
    },
    reset: function (origin) {
        try {
            clearTimeout(SmartPlugin.pingTimer);
            clearInterval(SmartPlugin.bitrateTimer)
            SmartPlugin.currentBitrate = 0;
            if(origin=="unload"){
                SmartPlugin.apiClass.sendStopResumeSafe();
            }else{
                SmartPlugin.apiClass.sendStop();
            }
            SmartPlugin.currentTime = 0;
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
            SmartPlugin.balanceIndex = 0;
            SmartPlugin.balanceObject = "";
            SmartPlugin.apiClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, SmartPlugin.pluginVersion, SmartPlugin.targetDevice);
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: reset :: Error: " + error); }
        }
    }
}