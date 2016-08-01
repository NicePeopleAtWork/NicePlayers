/*
 * Nice264 HTML5 Plugins package
 * Copyright (c) 2013 NicePeopleAtWork
 * Author: Adrià Gil
 * Version: 2.0
 */

var SmartPlugin = {
    nice264Plugin:{},
    Init : function(){
        this.nice264Plugin = new Nice264Analytics();
    }
}
var Nice264AnalyticsEvents = {
    BUFFER_BEGIN: 1,
    BUFFER_END: 0,
    JOIN_SEND: 2
};

var Nice264PlayerEvents = new Array("buffering", "play", "pause", "ended", "error", "abort", "timeupdate", "canplaythrough", "progress");
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
    this.system = youboraData.getAccountCode();
    this.service = youboraData.getService();
    this.playInfo = youboraData;

    // player reference
    this.player = youboraData.getSilverlightPlayer();
    
    //Change the way you obtain the player
    this.assetUrl = this.player.options.sources[0].src;

    // configuration
    this.pluginVersion = "3.0.0";
    this.targetDevice = "Playready+Silverlight_VideoPlayer";
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

    // properties
    this.assetMetadata = {};
    this.isLive = youboraData.getLive();
    this.bufferTimeBegin = 0;
    this.joinTimeBegin = 0;
    this.joinTimeEnd = 0;

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

    this.communications;


    /**
     * Initialization.
     */
    this.init();
}

/**
 * Plugin setup.
 */
Nice264Analytics.prototype.init = function()
{
    var context = this;

    for (var i in Nice264PlayerEvents) {
        this.player.addEventListener(Nice264PlayerEvents[i], context.onPlayEvent);
    }

    this.communications =  new YouboraCommunication (this.system, this.service , youboraData ,  this.pluginVersion , this.targetDevice);
    this.pamPingTime = this.communications.getPingTime();

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
    this.bufferTimeBegin = 0;
    this.joinTimeBegin = 0;
    this.joinTimeEnd = 0;

    clearTimeout(this.pingTimer);
    this.pingTimer = null;
    this.lastPingTime = 0;
    this.diffTime = 0;

    clearTimeout(this.bufferTimer);

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

    this.pingTimer = setTimeout(function(){ context.ping(); }, this.pamPingTime);
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
    this.isLive = value;
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

Nice264Analytics.prototype.setVideoURL = function(url)
{
    this.assetUrl = url;
};

Nice264Analytics.prototype.getVideoURL = function()
{
    return this.assetUrl;
};

Nice264Analytics.prototype.getBitrate = function()
{
    return -1;
};

/**
 * Plugin events. Analytics.
 */
Nice264Analytics.prototype.start = function()
{
    var d = new Date();
   
    this.join(Nice264AnalyticsEvents.BUFFER_BEGIN);
    this.communications.sendStart("0",window.location.href,this.getMetadata(),this.isLive,this.getVideoURL(),this.player.duration(),youboraData.getTransaction());
    
    this.isStartEventSent = true;
    this.setPing();

    this.lastPingTime = d.getTime();

};

Nice264Analytics.prototype.ping = function()
{
    var d = new Date();

    clearTimeout(this.pingTimer);
    this.pingTimer = null;

    this.communications.sendPingTotalBitrate(this.getBitrate(),this.player.currentTime());
    this.setPing();

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

        if (joinTimeTotal <= 0)
        {
            joinTimeTotal = 0;
        }

        this.communications.sendJoin(this.player.currentTime(),joinTimeTotal);

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
        var currentTime = 10;
        try{
            currentTime = this.player.currentTime();
        }catch(err){

        }
        //The first parameter is not correct, but this.player.currentTime
        // will crash
        this.communications.sendBuffer( currentTime ,bufferTimeTotal);
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
    this.communications.sendStop();
    clearTimeout(this.pingTimer);
    this.pingTimer = null;

    this.reset();
};

Nice264Analytics.prototype.error = function()
{
    
    this.communications.sendErrorWithParameters("","","0",window.location.href,this.getMetadata(),this.isLive,this.getVideoURL(),"0",youboraData.getTransaction());
    
    clearTimeout(this.pingTimer);
    this.pingTimer = null;
};

/**
 * Plugin events. Player.
 */
Nice264Analytics.prototype.onPlayEvent = function(e) 
{
    console.log("INPLAYEEVENT " + e.type);
    switch (e.type) 
    {
        case "play":
            if (SmartPlugin.nice264Plugin.isStartEventSent)
            {   
                this.isPauseEventSent = false;
                SmartPlugin.nice264Plugin.resume();
            }
            else
            {   
                SmartPlugin.nice264Plugin.isStartEventSent = true;
                SmartPlugin.nice264Plugin.start();
            }

            if (SmartPlugin.nice264Plugin.isStartEventSent && !SmartPlugin.nice264Plugin.isJoinEventSent)
            {
                this.isBufferRunning = false;
                //SmartPlugin.nice264Plugin.join(Nice264AnalyticsEvents.JOIN_SEND);
            }
            break;
        case "pause":
            //if (!this.isPauseEventSent)
            //{ 
                //this.isPauseEventSent = true;
                SmartPlugin.nice264Plugin.pause();
            //}
            break;
        case "ended": //Stopped
            if (!SmartPlugin.nice264Plugin.isStopEventSent)
            {   
                SmartPlugin.nice264Plugin.isStopEventSent = true;
                SmartPlugin.nice264Plugin.stop();
            }
            break;
        case "error":
        case "abort":
            SmartPlugin.nice264Plugin.error();
            if (!SmartPlugin.nice264Plugin.isStopEventSent)
            {

                SmartPlugin.nice264Plugin.isStopEventSent = true;
                SmartPlugin.nice264Plugin.stop();
            }
            break;
        case "buffering":
            if (SmartPlugin.nice264Plugin.isJoinEventSent)
            {
                SmartPlugin.nice264Plugin.bufferCounter++;
                if (SmartPlugin.nice264Plugin.bufferCounter == 1 && SmartPlugin.nice264Plugin.isStartEventSent && !SmartPlugin.nice264Plugin.isPauseEventSent && !SmartPlugin.nice264Plugin.isBufferRunning)
                {
                    SmartPlugin.nice264Plugin.isBufferRunning = true;
                    SmartPlugin.nice264Plugin.buffer(Nice264AnalyticsEvents.BUFFER_BEGIN);
                }
            }

            // joinTime
            if (!SmartPlugin.nice264Plugin.isJoinEventSent && !SmartPlugin.nice264Plugin.isBufferRunning)
            {
                SmartPlugin.nice264Plugin.isBufferRunning = true;
                SmartPlugin.nice264Plugin.join(Nice264AnalyticsEvents.BUFFER_BEGIN);
            }

            break;
        case "canplaythrough":
            // joinTime
            
            if (!SmartPlugin.nice264Plugin.isJoinEventSent && SmartPlugin.nice264Plugin.isStartEventSent)
            {
                SmartPlugin.nice264Plugin.join(Nice264AnalyticsEvents.BUFFER_END);
                SmartPlugin.nice264Plugin.join(Nice264AnalyticsEvents.JOIN_SEND);
            }
            break;
        case "timeupdate":
            // buffer
            if (SmartPlugin.nice264Plugin.isJoinEventSent){
                if (SmartPlugin.nice264Plugin.bufferCounter > 1 && SmartPlugin.nice264Plugin.isStartEventSent && !SmartPlugin.nice264Plugin.isPauseEventSent && SmartPlugin.nice264Plugin.isBufferRunning)
                {
                    SmartPlugin.nice264Plugin.buffer(Nice264AnalyticsEvents.BUFFER_END);
                }
                SmartPlugin.nice264Plugin.bufferCounter = 0;
                SmartPlugin.nice264Plugin.isBufferRunning = false;
            }
            break;
    }
};

// TODO: add events queue logic
// TODO: plugin with AUTOPLAY
// TODO: plugin with PRELOAD
// TODO: multibitrate / multisource videos

// TODO: propagate user's + plugin events
// TODO: error handling
