/* Nice264 TV Plugins package
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Victor A. Garcia Alvarez
 * Version: 2.1.1
 */

(function(jwplayer){

/*
 * JWPlayer(v6) Plugin
 */
var template = function(player, config, div){

    //////////////////////////////////
    // plugin definitions (analytics)
    //////////////////////////////////
    var pluginEnabled = false;
    var pluginVersion = "2.2.1_jwplayer6";
    var pamXML = null;
    var pamUrl = "";
    var pamSystem = "";
    var pamService="http://nqs.nice264.com";
    var pamUser = "";
    var transaction = "";
    var bandwidth ={};
    var mediaResource = "";
    var mediaAttributes = null;
    var mediaBitrate = 0;
    var windowLocation = "";

    var isStartEventSent = false;
    var isJoinEventSent = false;
    var continuityTimer = null;
    var joinTime = 0;
    var bufferTime = 0;

    var isGlobalLive = null;

    var pamCode = "";
    var pamCodeOriginal = "";
    var pamCodeCounter = 0;
    var pamPingTime = "";
    var pamBufferUnderRunUrl = "";
    var pamJoinTimeUrl = "";
    var pamStartUrl = "";
    var pamStopUrl = "";
    var pamPauseUrl = "";
    var pamResumeUrl = "";
    var pamContinuityUrl = "";
    var pamErrorUrl = "";
    var pamMediaProperties = {};

    //////////////////////////////////
    // plugin definitions (bandwidth)
    //////////////////////////////////
    var repeatTime = 0;
    var repeatEvent = null;
    var iterator = 0;
    var images = [];
    var total_latency = 9000;
    var total_band = 0;
    var testCounter = 0;
    var ip = "";
    var country = "";
    var city = "";
    var isp = "";
    var ping = "";
    var band = "";
    var imagesCounter = 0;
    var latencies = [];
    var bandwidths = [];
    var genericIndex = 0;
    var totalBandwidhtFiles = 0;
    var username = "";
    var system = "";
    var minutes = 0;
    var isPaused=false;
    //Set here to prevent null. Will be set in start again.
    var startDateTime = new Date().getTime()/1000;
    var resume = false;
    var contentId;

    //////////////////////////////////
    // Overlay variables
    //////////////////////////////////
    var overlayText="";
    var overlayEnabled =false;
    var overlayTime = 60000;
    var overlayDuration =6000;
    var isOverlayVisible =false;
    var overlayTimer = null;

    var communications={};
    ////////////////
    // plugin setup
    ////////////////
    function readyHandler(event)
    {
        //Config is YouboraData
        pamUser     = config.username;
        pamSystem   = config.accountCode;
        bandwidth.username = config.username;
        minutes     = config.bandwidth;
        transaction = config.transaction;
        mediaResource = encodeURIComponent(config.mediaResource)
        resume = config.resume;
        contentId =  config.contentId;

        if (config.service !== "" && typeof(config.service) != "undefined"){
            pamService = config.service;
        }
        console.log("Pam service : " + pamService);
        var jsonObj = JSON.stringify(config.properties);
        pamMediaProperties = encodeURIComponent(jsonObj);



        try{
            communications = new YouboraCommunication(pamSystem, pamService , bandwidth , pluginVersion , "jwplayer");
        }catch(err){
            console.log(err);
        }
        pamPingTime = communications.getPingTime();

       // init(); // analytics

        player.onBuffer(bufferHandler);
        player.onBeforePlay(beforePlayHandler);
        player.onPlay(playHandler);
        player.onPause(pauseHandler);
        player.onTime(timeHandler);
        player.onMeta(metaHandler);
        player.onError(errorHandler);

        //It is important to call set for the overlay text
        setOverlayText(config.jwplayerOverlayText);
        overlayEnabled = config.jwplayerOverlayEnabled;
        overlayTime = config.jwplayerOverlayTime;
        overlayDuration = config.jwplayerOverlayDuration;
        resetOverlayTimer();

    }
    player.onReady(readyHandler);

    this.resize = function(width, height) {};

    /////////////////
    // player events
    /////////////////
    function bufferHandler(event)
    {
        if (event.oldstate != "PAUSED"){
            var now = new Date();
            bufferTime = now.getTime();
        }
    }
    function beforePlayHandler(event)
    {
        if (!isJoinEventSent){
            var now = new Date();
            joinTime = now.getTime();
        }
    }
    function playHandler(event)
    {
        if (!isStartEventSent){
            startDateTime = new Date().getTime()/1000;
            isStartEventSent = true;
            sendAnalytics("start");
            setPing();
        }

        if (!isJoinEventSent){
            var now = new Date();
            var joinTimeNow = now.getTime();
            var joinTimeDiff = joinTimeNow - joinTime;

            isJoinEventSent = true;
            sendAnalytics("join", joinTimeDiff);
        }

        if (event.oldstate == "BUFFERING" && event.newstate == "PLAYING"){
            var now = new Date();
            var bufferTimeNow = now.getTime();
            var bufferTimeDiff = bufferTimeNow - bufferTime;

            sendAnalytics("buffer", bufferTimeDiff);
        }
        if (isPaused || (event.oldstate == "PAUSED" && event.newstate == "PLAYING")){
            sendAnalytics("resume");
            isPaused=false;
        }
    }
    function pauseHandler(event)
    {
        isPaused=true;
        sendAnalytics("pause");
    }
    function timeHandler(event)
    {
        //duration-1 to avoid precision errors
        if (event.position >= (event.duration-1)){
            sendAnalytics("stop");
            resetAnalytics();
        }
    }
    function metaHandler(event){
        mediaAttributes = event;
        //console.log(mediaAttributes);
    }
    function errorHandler(message){
        
        player.stop();
        sendAnalytics("error", "", message);
        sendAnalytics("stop");
        resetAnalytics();
    }

    function updateCode()
    {
        if (pamCodeCounter <= 0){
            pamCodeOriginal = pamCode;
        }
        pamCodeCounter++;
        pamCode = pamCodeOriginal + "_" + pamCodeCounter;
    }
    function resetAnalytics()
    {
        clearPing();
        updateCode();

        isStartEventSent = false;
        isJoinEventSent = false;
        continuityTimer = null;
        joinTime = 0;
        bufferTime = 0;
    }
    function loadAnalytics(response)
    {

        try {
            // analytics data
            pamCode = response.c;

            // bandwidth
            pamXML = response;
            //initBW();
            // enable plugin
            pluginEnabled = true;
        } catch (err) {

            pluginEnabled = false;
        }
    }
    function sendAnalytics(type, videoPlayTime, errorObj)
    {
        var request_url = "";

        switch (type)
        {
            case "buffer":
                var currentPosition = 0;
                try {
                    currentPosition = player.getPosition();
                } catch (err) {
                    currentPosition = 0;
                }
                //In live player.getPosition() is 0. We calculate the time if that happens
                if(currentPosition == 0){
                    currentPosition = (new Date().getTime()/1000) - startDateTime;
                }
                communications.sendBuffer(currentPosition,videoPlayTime);
                //request_url = pamBufferUnderRunUrl+"?time="+currentPosition+"&duration="+videoPlayTime+"&code="+pamCode;
                break;
            case "join":
                //review buffering timing
                communications.sendJoin(videoPlayTime,videoPlayTime);
                //request_url = pamJoinTimeUrl+"?time="+videoPlayTime+"&code="+pamCode;
                break;
            case "start":
                try{
                    var pingTimeInSeconds = pamPingTime / 1000;
                    var isLive = true;
                    var duration = 0 ;
                    if(mediaAttributes!=null){
                        duration = mediaAttributes.duration;
                    }
                    var resource = player.getPlaylistItem().file;
                    var resourceToPass = (mediaResource == "" || mediaResource == "undefined")?resource:mediaResource;

                    duration = duration==undefined?0:duration;
                    if ( duration > 0 )
                    {
                        isLive = false;
                    }

                    if( isGlobalLive!=null ){
                        isLive = isGlobalLive;
                    }
                    windowLocation = encodeURIComponent(window.location.href.toString());
                    communications.sendStart("0",windowLocation,pamMediaProperties,isLive,resourceToPass,duration,transaction);
                    //request_url = pamStartUrl+"?system="+pamSystem+"&user="+pamUser+"&transcode="+transaction+"&pluginVersion="+pluginVersion+"&pingTime="+pingTimeInSeconds+"&live="+isLive+"&totalBytes=0&duration="+duration+"&resource="+resourceToPass+"&referer="+windowLocation+"&properties="+pamMediaProperties+"&code="+pamCode;
                }catch(err){
                    console.log(err);
                }
                break;
            case "stop":
                communications.sendStop();
                break;
            case "pause":
                communications.sendPause();
                break;
            case "resume":
                communications.sendResume();
                break;
            case "continuity":
                // bitrate
                var qtys = null;
                var bitrate = 0;
                try {
                    qtys = player.getQualityLevels();
                    bitrate = qtys[player.getCurrentQuality()].bitrate;
                    if (typeof(bitrate) == "undefined" || typeof(bitrate) === null){
                        bitrate = -1;
                    }else{
                        bitrate = bitrate*1024;
                    }
                    //In case the bitrate has not been set yet, we get it from mediaAttributes
                    if (bitrate == 0 || bitrate == -1)
                    {
                        //Metdata is an object with the following structure:
                        //Object {currentLevel: “3 of 3 (1639kbps, 1280px)”, width: 480, droppedFrames: 0, bandwidth: 13549}
                        if(mediaAttributes != null && (mediaAttributes.metadata!=null && mediaAttributes.metadata!="undefined")){
                            if(mediaAttributes.metadata.currentLevel != null && mediaAttributes.metadata.currentLevel!="undefined"){
                                var currentLevel = mediaAttributes.metadata.currentLevel;
                                var regex = /(([0-9]+)kbps)/i;
                                //currentLevel.match returns 3 elements, we need the 3rd one which is the number alone
                                bitrate = currentLevel.match(regex)[2];
                                //convert bitRate from kbps to bps
                                bitrate = bitrate * 1024;
                            }
                        }
                    }
                    if(bitrate == 0){
                        bitrate= -1;
                    }

                } catch (err) {
                    bitrate = -1;
                    console.log(err);
                }
                // current video position
                var currentPosition = 0;
                try {
                    currentPosition = player.getPosition();
                } catch (err) {
                    currentPosition = 0;
                }
                var pingTimeInSeconds = pamPingTime / 1000;
                communications.sendPingTotalBitrate(bitrate,currentPosition);
                setPing();
                //request_url = pamContinuityUrl+"?time="+currentPosition+"&pingTime="+pingTimeInSeconds+"&bitrate="+bitrate+"&code="+pamCode;
                break;
            case "error":
                
                var pingTimeInSeconds = pamPingTime / 1000;
                //var isLive = true;
                if ( mediaAttributes.duration > 0 ){
                    isLive = false;
                }

                var resource = player.getPlaylistItem().file;
                var resourceToPass = (mediaResource == "")?resource:mediaResource;
                
                if( isGlobalLive!=null ){
                    isLive = isGlobalLive;
                }
                errorCode , message ,transcode,resource, system, isLive, properties, user, referer, totalBytes, pingTime, pluginVersion,
                                                        param1 , param2 , param3 , param4 , param5 , param6 , param7 , param8 , param9 , param10, duration 
                windowLocation = encodeURIComponent(window.location.href.toString());

                communications.sendError(parseError(errorObj),"",transaction,resourceToPass, pamSystem,isLive,pamMediaProperties,pamUser,windowLocation,"0",pingTimeInSeconds,pluginVersion );
               //request_url = pamErrorUrl+"?errorCode="+parseError(errorObj)+"&system="+pamSystem+"&user="+pamUser+"&pluginVersion="+pluginVersion+"&pingTime="+pingTimeInSeconds+"&live="+isLive+"&totalBytes=0&resource="+resourceToPass+"&referer="+windowLocation+"&properties="+pamMediaProperties+"&code="+pamCode+"&transcode="+transaction;
                break;
        }
    }
    this.setProperties = function(props_obj)
    {
        var jsonObj = JSON.stringify(props_obj);
        pamMediaProperties = encodeURIComponent(jsonObj);
    };
    this.setTransaction = function(trans){
        transaction = trans;
    };
    this.setLive = function( isLive )
    {
       isGlobalLive = isLive;
    };
    this.setMediaResource = function(resource_url)
    {
        mediaResource = encodeURIComponent(resource_url);
    };
    function setPing()
    {
        try{
            continuityTimer = setTimeout(function(){
                     sendAnalytics("continuity"); 
                 }, pamPingTime);
        }
        catch(err){
            console.log(err);
         }
    }
    function clearPing()
    {
        clearInterval(continuityTimer);
    }
    function parseError(error_obj)
    {
        var jsonObj = JSON.stringify(error_obj);
        return encodeURIComponent(jsonObj);
    }

    function setOverlayText(text){
        div.innerHTML = text;
        overlayText =text;
        hideOverlay();
    }

    this.setOverlayText = function(text){
        setOverlayText(text);
   }

    this.setOverlayEnabled =function(enabled){
        overlayEnabled = enabled;

    }
    this.setOverlayTime = function(time){
        overlayTime = time;
    }
    this.setOverlayDuration = function(time){
        overlayDuration = time;

    }
    function setStyleOverlay( object ) {
      for(var style in object) {
        div.style[ style ] = object[ style ];
      }
    }

    function showOverlay(){
        //console.log("Show Overlay : "  + overlayEnabled);
        createStyleOverlay ();
        isOverlayVisible=true;
        if(overlayEnabled){
            setStyleOverlay({
                opacity: 1,
            });
        }else{
            hideOverlay();
        }
    };
 
    function hideOverlay () {
        isOverlayVisible=false;
        setStyleOverlay({
            opacity: 0
        });
    };

    function resetOverlayTimer()
    {
        //console.log("resetOverlayTimer "  + isOverlayVisible);
        try{
            if(!isOverlayVisible){
                setTimeout(function() {
                    showOverlay();
                    resetOverlayTimer();
                }, overlayTime);
            }else{
                 setTimeout(function() {
                    hideOverlay();
                    resetOverlayTimer();
                }, overlayDuration);
            }
        }
        catch(err){
            console.log(err);
         }
    } 

    function createStyleOverlay ()
    {
        var widthValue  = player.getWidth();
        widthValue     -= 20;

        setStyleOverlay({
            position: 'absolute',
            margin: '0',
            padding: '5px 10px 5px',
            background: 'rgba( 0, 0, 0, .5 )',
            color: 'white',
            fontSize: '13px',
            width: widthValue + 'px'
        }); 
    }

    // Matches our text container to the size of the player instance
    this.resize = function( width, height ) {
        createStyleOverlay ();
    };
   

};

jwplayer().registerPlugin('sp', '6.0', template);

})(jwplayer);
