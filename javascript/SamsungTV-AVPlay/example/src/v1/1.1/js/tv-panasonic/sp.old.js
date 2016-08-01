
// TODO: add events queue logic
// TODO: plugin with AUTOPLAY
// TODO: plugin with PRELOAD
// TODO: multibitrate / multisource videos

// TODO: propagate user's + plugin events
// TODO: error handling
/*
 * SmartPlugin HTML5 Plugins package
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Miguel Angel Zambrana
 * Version: 1.2
 */

var SmartPlugin = { 
    smartAnalytics: null,
    Init: function()  {  
            console.log( "SmartPlugin :: Init :: Api Not Ready :: Waiting...");
        if ( spYoubora.isYouboraApiLoaded () == false ) 
        {
            console.log( "SmartPlugin :: Init :: Api Not Ready :: Waiting...");
            setTimeout("SmartPlugin.Init()",100);
        }
        else 
        {
            try
            {
                var video                   = document.getElementsByTagName("video")[0]
                var bandwidth               = {};

                SmartPlugin.smartAnalytics  = new SmartPluginAnalytics ( video , youboraData.getAccountCode() , youboraData.getService() , bandwidth );
                
                SmartPlugin.smartAnalytics.setPlayerStateCallback("checkPlayState");
                SmartPlugin.smartAnalytics.setLive( youboraData.getLive() );
                SmartPlugin.smartAnalytics.setUsername( youboraData.getUsername() );
            }
            catch(err)
            { 
                console.log( "SmartPlugin :: Init :: Error: " + err );
            }
        }
    }
};

/**
 * Plugin definition.
 * @param playerObj
 * @param system
 * @param service
 * @param bandwidth
 * @constructor
 */

function SmartPluginAnalytics ( playerObj , system, service, bandwidth )
{
    /**
     * Attributes.
     */
    this.system             = system;
    this.service            = service;
    this.bandwidth          = bandwidth;

    // player reference
    this.player             = playerObj;

    // configuration
    this.pluginVersion      = "2.0.0._panasonic_viera";
    this.targetDevice       = "PANASONIC_HTML5";

    // construct communication object
    this.communication      = new YouboraCommunication ( system , service , bandwidth , this.pluginVersion , this.targetDevice );

    // events
    this.isStartEventSent   = false;
    this.isJoinEventSent    = false;
    this.isStopEventSent    = false;
    this.isBufferRunning    = false;
    this.isPauseEventSent   = false;

    // properties
    this.assetMetadata      = {};
    this.isLive             = false;
    this.bufferTimeBegin    = 0;
    this.joinTimeBegin      = 0;
    this.joinTimeEnd        = 0;

    // ping
    this.pamPingTime        = 0;
    this.lastPingTime       = 0;
    this.diffTime           = 0;
    this.pingTimer          = null;

    // buffer
    this.lastCurrentTime    = 0;
    this.bufferCounter      = 0;

    /**
     * Initialization.
     */

    this.init();
}

/**
 * Plugin setup.
 */

SmartPluginAnalytics.prototype.init = function()
{
    var context = this;

    for ( var i in YouboraPlayerEvents ) 
    {
        this.player.addEventListener(YouboraPlayerEvents[i], function(e){ context.checkPlayState(e); }, false);
    }
}; 

/**
 * Plugin methods.
 */ 

SmartPluginAnalytics.prototype.reset = function()
{
    this.isStopEventSent    = false;
    this.isStartEventSent   = false;
    this.isJoinEventSent    = false;
    this.isBufferRunning    = false;
    this.isPauseEventSent   = false;
    this.bufferTimeBegin    = 0;
    this.joinTimeBegin      = 0;
    this.joinTimeEnd        = 0;

    clearTimeout(this.pingTimer);
    this.pingTimer          = null;
    this.lastPingTime       = 0;
    this.diffTime           = 0;
};

/**
 * Plugin methods. Getters and Setters.
 */

SmartPluginAnalytics.prototype.setPlayerStateCallback = function(callback)
{
    // console.log("CALLBACK = " + callback);
};

SmartPluginAnalytics.prototype.setPing = function()
{
    var context         = this;

    this.pingTimer      = setTimeout ( function() { context.ping(); } , this.communication.getPingTime () );
};

SmartPluginAnalytics.prototype.setUsername = function(username)
{
    this.bandwidth.username = username;
};

SmartPluginAnalytics.prototype.setLive = function(value)
{
    this.isLive = value;
};

SmartPluginAnalytics.prototype.setMetadata = function(metadata)
{
    this.assetMetadata = metadata;
};

SmartPluginAnalytics.prototype.getMetadata = function()
{
    var jsonObj     = JSON.stringify(this.assetMetadata);
    var metadata    = encodeURI(jsonObj);

    return metadata;
};

SmartPluginAnalytics.prototype.getBitrate = function()
{
    try         { return 0; }
    catch (err) { return 0; }

    return 0;
};

/**
 * Plugin events. Player.
 */

SmartPluginAnalytics.prototype.checkPlayState = function(e)
{
    // console.log(e.type);
    console.log('EVENT: '+ e.type)
    switch (e.type)
    {
        case "play":
 
            if ( !this.isJoinEventSent && !this.isBufferRunning )
            {
                this.isBufferRunning = true;
                this.join(SmartPluginAnalyticsEvents.BUFFER_BEGIN);
            }
 
            if (this.isStartEventSent)
            {
                this.isPauseEventSent = false;
                this.resume();
            }
            else
            {
                this.isStartEventSent = true;
                this.start();
            }

            break;

        case "pause":

            if (!this.isPauseEventSent)
            {
                this.isPauseEventSent = true;
                this.pause();
            }
            break;

        case "ended":

            if (!this.isStopEventSent)
            {
                this.isStopEventSent = true;
                this.stop();
            }
            break;

        case "error":
        case "abort":

            this.error();

            if (!this.isStopEventSent)
            {
                this.isStopEventSent = true;
                this.stop();
            }

            break;

        case "waiting":

            // Capture Buffer and JoinTime begin Event

            // capture waiting event when buffering start
            if ( this.isJoinEventSent )
            {
                this.bufferCounter++;

                if ( this.bufferCounter == 1 && this.isStartEventSent && !this.isPauseEventSent && !this.isBufferRunning )
                {
                    this.isBufferRunning = true;
                    this.buffer(SmartPluginAnalyticsEvents.BUFFER_BEGIN);
                }
            }

            // joinTime
            if ( !this.isJoinEventSent && !this.isBufferRunning )
            {
                this.isBufferRunning = true;
                this.join(SmartPluginAnalyticsEvents.BUFFER_BEGIN);
            }

            break;

        case "playing":

            // Capture Buffer and JoinTime end Event

            if ( !this.isJoinEventSent && this.isBufferRunning )
            {
                this.join(SmartPluginAnalyticsEvents.BUFFER_END);
            }
            else if ( this.bufferCounter > 0 && this.isStartEventSent && !this.isPauseEventSent && this.isBufferRunning )
            {
                this.buffer(SmartPluginAnalyticsEvents.BUFFER_END);
            }

            if (this.isStartEventSent && !this.isJoinEventSent)
            {
                this.isBufferRunning = false;
                this.join(SmartPluginAnalyticsEvents.JOIN_SEND);
            }

            this.bufferCounter      = 0;
            this.isBufferRunning    = false;

            break;

    }
};

/**
 * Plugin events. Analytics.
 */
 
SmartPluginAnalytics.prototype.start = function()
{
    this.communication.sendStart ( 0 , window.location.href , this.getMetadata() , this.isLive , this.player.currentSrc , this.player.duration );

    this.setPing ();
};

SmartPluginAnalytics.prototype.ping = function()
{
    clearTimeout(this.pingTimer);
    this.pingTimer = null;

    this.setPing ();

    this.communication.sendPingTotalBytes ( this.getBitrate() , this.player.currentTime );
};

SmartPluginAnalytics.prototype.join = function(bufferState)
{
    var d               = new Date();
    var joinTimeTotal   = 0;

    switch ( bufferState )
    {
        case SmartPluginAnalyticsEvents.BUFFER_BEGIN:
    
            this.joinTimeBegin  = d.getTime();

            break;
    
        case SmartPluginAnalyticsEvents.BUFFER_END:
    
            this.joinTimeEnd    = d.getTime();

            break;

        case SmartPluginAnalyticsEvents.JOIN_SEND: 

            if ( this.isJoinEventSent == false )
            {
                this.isJoinEventSent    = true;

                joinTimeTotal           = this.joinTimeEnd - this.joinTimeBegin;

                if ( joinTimeTotal <= 0 )
                     joinTimeTotal = 0;

                this.communication.sendJoin ( this.player.currentTime , joinTimeTotal );
            }

            break;
    }
};

SmartPluginAnalytics.prototype.buffer = function(bufferState)
{
    var d               = new Date();
    var bufferTimeEnd   = 0;
    var bufferTimeTotal = 0;

    switch ( bufferState )
    {
        case SmartPluginAnalyticsEvents.BUFFER_BEGIN:
        
            this.bufferTimeBegin    = d.getTime();

            break;
    
        case SmartPluginAnalyticsEvents.BUFFER_END:
        
            bufferTimeEnd           = d.getTime();
            bufferTimeTotal         = bufferTimeEnd - this.bufferTimeBegin;

            this.communication.sendBuffer ( this.player.currentTime , bufferTimeTotal );

            break;
    }
};

SmartPluginAnalytics.prototype.resume = function()
{
    this.communication.sendResume ();
};

SmartPluginAnalytics.prototype.pause = function()
{
    this.communication.sendPause ();
};

SmartPluginAnalytics.prototype.stop = function()
{
    this.communication.sendStop ();

    this.reset();
};

SmartPluginAnalytics.prototype.error = function()
{
    this.communication.sendError ( this.player.error , "" );

    clearTimeout(this.pingTimer);
    this.pingTimer = null;
};



var SmartPluginAnalyticsEvents = 
{
    BUFFER_BEGIN: 1,
    BUFFER_END: 0,
    JOIN_SEND: 2
};

var YouboraPlayerEvents = new Array( "playing" , "waiting", "timeupdate", "ended", "play", "pause", "error", "abort");
