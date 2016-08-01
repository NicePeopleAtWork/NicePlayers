/*
 * Nice264 Nagra Plugin Package
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Miquel Fradera, Luis Miguel Lainez
 * Version: 3.0
 */

var Nice264AnalyticsEvents = {
    BUFFER_BEGIN: 1,
    BUFFER_END: 0,
    JOIN_SEND: 2
};

var Nice264PlayerEvents = new Array("durationchange", "seeked", "seeking", "canplaythrough", "playing", "waiting", "loadedmetadata", "emptied", "loadeddata", "loadstart", "progress", "canplay", "timeupdate", "ended", "play", "pause", "error", "abort");
var SmartSwitchParams = {
    player: null,
    jsonObject : "",
    originalResource :"",
    isChangingData : false,
    nextUrlIndexFromBalancer :1,
    hasBalanced : false
};
var Nice264PluginError = {
    1 : 'MEDIA_ERR_ABORTED',
    2 : 'MEDIA_ERR_NETWORK',
    3 : 'MEDIA_ERR_DECODE',
    4 : 'MEDIA_ERR_SRC_NOT_SUPPORTED'
};
var Nice264PluginErrorTranslator = {
    1 : '11200',
    2 : '11201',
    3 : '11202',
    4 : '11203'
};
/**
 * Plugin definition.
 * @param playerId
 * @param system
 * @param service
 * @param playInfo
 * @constructor
 */
function Nice264Analytics()
{
    /**
     * Attributes.
     */
    this.system;
    this.service;
    this.playInfo;

    // player reference
    this.player = null;
    this.communications={};

    // configuration
    this.pluginVersion = "3.2.1_Nagra";
    this.targetDevice = "Nagra_VideoPlayer";
    this.outputFormat = "xml";
    this.xmlHttp = null;
    this.isXMLReceived = false;

    // events queue
    this.resourcesQueue = [];
    this.eventsQueue = [];
    this.eventsTimer = null;

    // events
    this.isStartEventSent = false;
    this.isJoinEventSent = false;
    this.isStopEventSent = false;
    this.isBufferRunning = false;
    this.isPauseEventSent = false;
    this.isPaused=false;


    // properties
    this.assetMetadata = {};
    this.bufferTimeBegin = 0;
    this.joinTimeBegin = 0;
    this.joinTimeEnd = 0;
    this.currentBitrate=-1;

    // urls
    this.pamBufferUnderrunUrl = "";
    this.pamJoinTimeUrl = "";
    this.pamStartUrl = "";
    this.pamStopUrl = "";
    this.pamPauseUrl = "";
    this.pamResumeUrl = "";
    this.pamPingUrl = "";
    this.pamErrorUrl = "";

    // code
    this.pamCode = "";
    this.pamCodeOrig = "";
    this.pamCodeCounter = 0;

    // ping
    this.pamPingTime = 0;
    this.lastPingTime = 0;
    this.diffTime = 0;
    this.pingTimer = null;

    // buffer
    this.lastCurrentTime = 0;
    this.bufferTimer = null;
    this.bufferCounter = 0;
    this.seeking = false;

    this.player = null;

    //Balancer
    this.resourcePath = "";
    SmartSwitchParams.originalResource ="";
    this.isChangingData=false;

    //buffer Control
    this.previousTime=0;
    this.currentTime=0;
    this.bufferTimer={};
    this.bufferThreshold=0.05;

}

/**
 * Plugin setup.
 */

Nice264Analytics.prototype.init = function(player)
{
    var context = this;
    this.player = player;
    this.system = youboraData.getAccountCode();
    this.service = youboraData.getService();

    player.addEventListener("play", function(){context.play();}, false);
    player.addEventListener("pause", function(){context.paused();}, false);
    player.addEventListener("ended", function(){context.ended();}, false);
    player.addEventListener("progress", function(){context.progress();}, false);
    player.addEventListener("canplay", function(){context.canplay();}, false);
    player.addEventListener("timeupdate", function(){context.timeupdate();}, false);
    player.addEventListener("error", function(){context.errorHandler();}, false);
    player.addEventListener("waiting", function(){context.waiting();}, false);
    player.addEventListener("seeking", function(){context.seek();}, false);
    player.addEventListener("abort", function(){context.abort();}, false);
    player.addEventListener("playbackRequested", function(){context.playbackRequested();}, false);

    //player._videoTag.networkAgent.addEventListener("selectedBitrateChanged", function () { context.checkBitrate(); });
    window.networkAgent.addEventListener("selectedBitrateChanged", function () {
        context.checkBitrate();
    });
    SmartSwitchParams.originalResource = player.src;
    SmartSwitchParams.player= player;

    try{
        this.communications = new YouboraCommunication(this.system , this.service , youboraData, this.pluginVersion , this.targetDevice);
        this.pamPingTime = this.communications.getPingTime();
    }catch(err){
        console.log("Nice264 Error " + err);
    }

};

Nice264Analytics.prototype.callbackBalancer = function(jsonObject){

    try{
        var player = SmartSwitchParams.player;

        if(jsonObject != false){
            SmartSwitchParams.isChangingData =  true;
            SmartSwitchParams.jsonObject = jsonObject;
            if(SmartSwitchParams.nextUrlIndexFromBalancer > 6){
                return;
            }
            if(SmartSwitchParams.jsonObject[SmartSwitchParams.nextUrlIndexFromBalancer] !=  undefined){
                player.src = SmartSwitchParams.jsonObject[SmartSwitchParams.nextUrlIndexFromBalancer].URL;
            }else{
                player.src = SmartSwitchParams.originalResource;
            }
            SmartSwitchParams.nextUrlIndexFromBalancer ++;
        }
    }catch(err){
        console.log("Nice264 Error "+err);
    }
};

Nice264Analytics.prototype.isBalancerActive = function(){
    return (youboraData.enableBalancer);
};

Nice264Analytics.prototype.checkBitrate = function()
{
    //this.currentBitrate = this.player._videoTag.networkAgent.adaptiveStreaming.selectedBitrate;
    this.currentBitrate = window.networkAgent.adaptiveStreaming.selectedBitrate;
};

Nice264Analytics.prototype.play = function()
{

    if(SmartSwitchParams.originalResource == ""){
        SmartSwitchParams.originalResource = this.player.src;
    }
    var context = this;
    if(this.isBalancerActive() && !SmartSwitchParams.hasBalanced){
        SmartSwitchParams.hasBalanced = true;
        try{
            this.resourcePath= this.communications.getResourcePath(SmartSwitchParams.originalResource);
            this.communications.getBalancedResource(context.resourcePath, context.callbackBalancer);
        }catch(err){
        }
    }else if(this.isStartEventSent){
        this.checkPlayState("play");
    }
};
Nice264Analytics.prototype.paused = function(event)
{
    this.checkPlayState("pause");
    this.isPaused=true;
};
Nice264Analytics.prototype.errorHandler = function(event)
{
    this.checkPlayState("error");
};
Nice264Analytics.prototype.abort = function(event)
{
    this.checkPlayState("abort");
};
Nice264Analytics.prototype.playbackRequested = function(event)
{
    this.checkPlayState("playbackRequested");
};
Nice264Analytics.prototype.canplay = function(event)
{
    this.checkPlayState("play");
    this.checkPlayState("canplay");
};
Nice264Analytics.prototype.progress = function(event)
{
    this.checkPlayState("progress");
};
Nice264Analytics.prototype.timeupdate = function(event)
{
    this.checkPlayState("timeupdate");
};
Nice264Analytics.prototype.ended = function(event)
{
    this.checkPlayState("ended");
};
Nice264Analytics.prototype.seek = function(event)
{
    this.seeking = true;
    this.checkPlayState("seeking");
};

Nice264Analytics.prototype.waiting = function(event)
{

    if(!this.seeking){
        this.isBufferRunning = true;
        this.buffer(Nice264AnalyticsEvents.BUFFER_BEGIN);
    }
};

Nice264Analytics.prototype.getPlayer = function()
{
    return this.player;
};



Nice264Analytics.prototype.updateCode = function()
{
    this.pamCodeCounter++;
    this.pamCode = this.pamCodeOrig + "_" + this.pamCodeCounter;
};

Nice264Analytics.prototype.reset = function()
{

    this.isStopEventSent = false;
    this.isStartEventSent = false;
    this.isJoinEventSent = false;
    this.isBufferRunning = false;
    this.isPauseEventSent = false;
    this.seeking = false;

    this.bufferTimeBegin = 0;
    this.joinTimeBegin = 0;
    this.joinTimeEnd = 0;


    clearTimeout(this.pingTimer);
    this.pingTimer = null;
    this.lastPingTime = 0;
    this.diffTime = 0;

    clearTimeout(this.bufferTimer);
    clearTimeout(this.bufferCheckTimer);
    this.communications  = new YouboraCommunication(this.system , this.service , youboraData, this.pluginVersion , this.targetDevice);
    this.updateCode();
};

/**
 * Plugin methods. Getters and Setters.
 */
Nice264Analytics.prototype.setPlayerStateCallback = function(callback)
{
    // console.log("CALLBACK = " + callback);
};

Nice264Analytics.prototype.setPing = function()
{
    var context = this;

    this.pingTimer = setTimeout(function(){ context.ping(); context.setPing();}, this.pamPingTime);
};

Nice264Analytics.prototype.setUsername = function(username)
{
    this.playInfo.username = username;
};

Nice264Analytics.prototype.setTransactionCode = function(trans)
{
    this.playInfo.transaction = trans;
};

Nice264Analytics.prototype.setLive = function(value)
{
    youboraData.setLive(value);
};

Nice264Analytics.prototype.setMetadata = function(metadata)
{
    this.assetMetadata = metadata;
};

Nice264Analytics.prototype.getMetadata = function()
{
    var jsonObj = JSON.stringify(this.assetMetadata);
    var metadata = encodeURI(jsonObj);

    return metadata;
};

Nice264Analytics.prototype.getBitrate = function()
{
   return this.currentBitrate;
};

/**
 * Plugin events. Analytics.
 */
Nice264Analytics.prototype.start = function(){};

Nice264Analytics.prototype.playbackStarted = function()
{
    this.communications.sendStart("0",window.location.href , this.getMetadata(), youboraData.getLive(), this.player.src , this.player.duration , youboraData.transaction);
    this.setPing();
    this.setBufferChecker();
};

Nice264Analytics.prototype.ping = function()
{
    this.communications.sendPingTotalBitrate(this.getBitrate(), this.player.currentTime);
};

Nice264Analytics.prototype.join = function(bufferState)
{
    var d = new Date();
    var joinTimeTotal = 0;
    var params = null;

    if (bufferState == Nice264AnalyticsEvents.BUFFER_BEGIN)
    {
        this.joinTimeBegin = d.getTime();
    }
    else if (bufferState == Nice264AnalyticsEvents.BUFFER_END)
    {
        this.joinTimeEnd = d.getTime();

    } else if (bufferState == Nice264AnalyticsEvents.JOIN_SEND && !this.isJoinEventSent)
    {
        this.isJoinEventSent = true;

        joinTimeTotal = this.joinTimeEnd - this.joinTimeBegin;
        if (joinTimeTotal <= 10)
        {
            joinTimeTotal = 10;
        }

        this.communications.sendJoin(this.player.currentTime,joinTimeTotal);
    }
};

Nice264Analytics.prototype.buffer = function(bufferState)
{
    var d = new Date();
    var bufferTimeEnd = 0;
    var bufferTimeTotal = 0;
    var params = null;

    if (bufferState == Nice264AnalyticsEvents.BUFFER_BEGIN)
    {
        this.bufferTimeBegin = d.getTime();
    }
    else if (bufferState == Nice264AnalyticsEvents.BUFFER_END)
    {
        bufferTimeEnd = d.getTime();
        bufferTimeTotal = bufferTimeEnd - this.bufferTimeBegin;

        this.communications.sendBuffer(this.player.currentTime,bufferTimeTotal);
    }
};

Nice264Analytics.prototype.resume = function()
{
    this.communications.sendResume();
};

Nice264Analytics.prototype.pause = function()
{
    this.communications.sendPause();
};

Nice264Analytics.prototype.stop = function()
{
    try{
        clearTimeout(this.pingTimer);
        this.pingTimer = null;
        this.communications.sendStop();
        this.reset();
    }catch(err){
        console.log(err);
    }
};

Nice264Analytics.prototype.error = function()
{

    var errorMsg = "";
    var errorCode ="";
    if(this.player._video.error != null){
        errorCode = this.player._video.error.code;
        errorCode = Nice264PluginErrorTranslator[errorCode];
        if(errorCode==undefined){
            errorCode = this.player._video.error.code;
        }
        errorMsg =  Nice264PluginError[this.player._video.error.code];
    }
    if(SmartSwitchParams.isChangingData){
        errorCode = 13000+SmartSwitchParams.nextUrlIndexFromBalancer-1;
        this.communications.sendErrorWithParameters(errorCode.toString(), errorMsg, "0", window.location.href , this.getMetadata(), youboraData.getLive(), this.player.src , this.player.duration , youboraData.transaction);
        this.isChangingData=false;
        this.callbackBalancer(SmartSwitchParams.jsonObject);
    }else{
        this.communications.sendErrorWithParameters(errorCode, errorMsg, "0", window.location.href , this.getMetadata(), youboraData.getLive(), this.player.src , this.player.duration , youboraData.transaction);

    }
    clearTimeout(this.pingTimer);
    this.pingTimer = null;
};

Nice264Analytics.prototype.setBufferChecker = function()
{
    var context = this;
    this.bufferCheckTimer = setTimeout(function(){ context.bufferChecker(); }, 1000);

};

Nice264Analytics.prototype.bufferChecker = function(){

    try{
        if ( this.player.currentTime > 0 && !this.isBufferRunning && !this.isPaused && !this.seeking) {
            if(this.previousTime  == this.player.currentTime){
                this.buffer(Nice264AnalyticsEvents.BUFFER_BEGIN);
                this.isBufferRunning=true;
            }

        }
    }catch(e){
            console.log(e);
    }
    clearTimeout(this.bufferCheckTimer);

    this.previousTime =  this.player.currentTime;
    this.setBufferChecker();
};

/**
 * Plugin events. Player.
 */
Nice264Analytics.prototype.checkPlayState = function(e)
{
    //console.log("Nice264 checkPlayState  : "+ e );

    switch (e)
    {
        case "durationchange":
            break;
        case "seeked":
            break;
        case "seeking":
            break;
        case "canplaythrough":
            break;
        case "playing":
            break;
        case "waiting":
            break;
        case "loadedmetadata":
            break;
        case "emptied":
            break;
        case "loadeddata":
            break;
        case "loadstart":
            break;
        case "progress":
            break;
        case "play":

            if (this.isStartEventSent && this.isPauseEventSent)
            {
                this.isChangingData=false;
                this.resume();
            }
            else if (!this.isStartEventSent)
            {
                this.isStartEventSent = true;
                //Send start && start pings
                this.playbackStarted();
            }
            this.isPauseEventSent = false;
            //Join
            if (this.isStartEventSent && !this.isJoinEventSent && this.isBufferRunning)
            {
                this.isBufferRunning = false;
                this.join(Nice264AnalyticsEvents.BUFFER_END);
                this.join(Nice264AnalyticsEvents.JOIN_SEND);
            }
            break;
        case "pause":
            if (!this.isPauseEventSent)
            {
                this.isPauseEventSent = true;
                this.pause();
            }
            break;
        case "abort":
        case "ended":
            if (!this.isStopEventSent)
            {
                this.isStopEventSent = true;
                this.stop();
            }
            break;
        case "error":
            this.error();
            if (!this.isStopEventSent)
            {
                this.isStopEventSent = true;
                this.stop();
            }
            break;
        case "playbackRequested":
            // joinTime
            if (!this.isJoinEventSent)
            {

                this.isBufferRunning = true;
                this.join(Nice264AnalyticsEvents.BUFFER_BEGIN);
            }
            break;
        case "canplay":
            // joinTime
            if (!this.isJoinEventSent)
            {
                this.join(Nice264AnalyticsEvents.BUFFER_END);
                this.join(Nice264AnalyticsEvents.JOIN_SEND);
                this.isBufferRunning = false;
            }
            break;

        case "timeupdate":
            if (this.isJoinEventSent && !this.seeking)
            {
                if (this.isStartEventSent && this.isBufferRunning)
                {
                    if(this.previousTime  < this.player.currentTime){
                        this.buffer(Nice264AnalyticsEvents.BUFFER_END);
                        this.isBufferRunning = false;
                    }

                }
            }
            if(this.previousTime  < this.player.currentTime){
                this.seeking=false;
            }
            break;

        default:
            break;


    }
};