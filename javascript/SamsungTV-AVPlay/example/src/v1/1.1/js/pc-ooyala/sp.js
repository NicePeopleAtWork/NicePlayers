/*
 * Nice264 Ooyala Plugins package
 * Copyright (c) 2013 NicePeopleAtWork
 * Author: Luis Miguel Lainez
 * Version: 2.2.1
 */


/**
 * Method to set up the plugin in the page. There is no reference to the player
 * until it is set up. We need to wait until the player is set and then 
 * instantiate it with the embed code and the rest of the needed information.
 * The setEmbedCode method triggers a method that initializes the entire plugin.
 * The embedCode is unique for each client and it has to be informed via URL
 **/
var SmartPlugin = { 
    smartAnalytics: null,
    player: null,
    Init: function() {  
        SmartPlugin.setUpOoyala(0);
    },
    setUpOoyala: function ( currentTry ) {
        try
        {
            //var embedCode   = youboraData.getOoyalaEmbeedCode();
            //embedCode='V1MjVuazpCoTGp0xk5pYDYtdeOHPCG-G';
            var maxTries    = 5;
            var tryInterval = 5;

            //console.log(" - Embed at init" + embedCode);

            //Try to get the player up to maxTries times
            //If it fails the plugin will not be loaded
            if(currentTry<maxTries)
            {
                try
                {
                    setTimeout(function(){ 
                        
                        var player = OO.__internal.players;
                        console.log(OO);                  
                        for (var key in OO.__internal.players) {
                            player = OO.__internal.players[key];
                        }
                        console.log("Player");
                        console.log(player);
                        player.setEmbedCode(player.embedCode, {
                            system:     youboraData.getAccountCode(),
                            username:   youboraData.getUsername(),
                            metadata :  youboraData.getProperties(),
                            service:    youboraData.getService()
                        });
                        

                    }, tryInterval);
                }
                catch(err)
                {
                    currentTry  = currentTry + 1;
                    SmartPlugin.setUpOoyala(currentTry);
                }
            }
        }
        catch(err)
        {
            alert ( "SmartPlugin :: Error while get video object" );
            console.log( "SmartPlugin :: Error while get video object" );
            console.log(err);
        }
    },
   
};

OO.plugin("SmartPlugin", function (playerId) {

    var SmartPlugin = {};

    var SmartPluginAnalyticsEvents = {
        BUFFER_BEGIN: 1,
        BUFFER_END: 0,
        JOIN_SEND: 2
    };
    var playerId = playerId;

    var service = "";
    var communications={};
    var system = "";
    var metadata = {};
    var username="";
                 
    //resource being played
    var resource="";

     // configuration
    var pluginVersion = "2.2.0_ooyala";
    var targetDevice = "HTML5_OoyalaPlayer";
    var outputFormat = "xml";
    var xmlHttp = null;
    var isXMLReceived = false;

    // events queue
    var resourcesQueue = [];
    var eventsQueue = [];
    var eventsTimer = null;

    // events
    var isStartEventSent = false;
    var isJoinEventSent = false;
    var isStopEventSent = false;
    var isBufferRunning = false;
    var isPauseEventSent = false;

    // properties
    var assetMetadata = {};
    var isLive = false;
    var bufferTimeBegin = 0;
    var joinTimeBegin = 0;
    var joinTimeEnd = 0;


    // code
    var pamCode = "";
    var pamCodeOrig = "";
    var pamCodeCounter = 0;

    // ping
    var pamPingTime = 0;
    var lastPingTime = 0;
    var diffTime = 0;
    var pingTimer = null;

    // buffer
    var lastCurrentTime = 0;
    var bufferTimer = null;
    var bufferCounter = 0;

    //seek status
    var seek1 = false;
    var playTime=0;
    var videoDuration=NaN;
    var playing=false;

    //convinience variable to set the username.Used for uniformity issue with the  Nice264Communications
    var bandwidth ={};

    // A constructor for the module class
    // will be called by the player to create an instance of the module
    // First parameter is a reference to a message bus object, which
    // is required to be able to pub/sub to player events.
    // Second parameter is a unique id assigned to the module for 
    // debugging purposes
    SmartPlugin.SmartPluginAnalytics = function (mb, id) {

        this.mb = mb; // save message bus reference for later use
        this.id = id;
        videoDuration = NaN;
        playing = false;
        this.init(); // subscribe to relevant events  
     
    };

    // public functions of the module object
    SmartPlugin.SmartPluginAnalytics.prototype = {
        init: function () {

        // subscribe to relevant player events

         /*this.mb.subscribe("*", 'NiceAnalytics',
            this.eventDebug);*/
            try{

            this.mb.subscribe(OO.EVENTS.PLAYER_CREATED, 'NiceAnalytics',
                this.onPlayerCreate);

            this.mb.subscribe(OO.EVENTS.PAUSED,
                'NiceAnalytics',this.onPauseHandler, this);

            this.mb.subscribe(OO.EVENTS.PLAYING,
                'NiceAnalytics', this.onPlayHandler, this);

            this.mb.subscribe(OO.EVENTS.PLAYED,
                'NiceAnalytics', this.onStopHandler, this);

            this.mb.subscribe(OO.EVENTS.ERROR,
                'NiceAnalytics', this.onErrorHandler);

            this.mb.subscribe(OO.EVENTS.BUFFERED,
                'NiceAnalytics', this.onBufferedHandler);

            this.mb.subscribe(OO.EVENTS.PLAYBACK_READY,
                'NiceAnalytics', this.onPlaybackReadyHandler);
                   
            this.mb.subscribe(OO.EVENTS.PLAYHEAD_TIME_CHANGED,
                'NiceAnalytics', this.onPlayheadChangedHandler);

            this.mb.subscribe(OO.EVENTS.SEEK,
                'NiceAnalytics', this.onSeekHandler);

            this.mb.subscribe(OO.EVENTS.EMBED_CODE_CHANGED,
                'NiceAnalytics', this.onEmbedCodeChanged, this);  

            /*this.mb.subscribe(OO.EVENTS.SET_EMBED_CODE,
                'NiceAnalytics', _.bind(this.onEmbedCodeChanged, this)); */

            //This event is only called in HTML5
            this.mb.subscribe(OO.EVENTS.PRELOAD_STREAM,
                'NiceAnalytics', this.onPreloadStream); 

        }catch(err){
            console.log(err);
        }
         
        },

           

            // Handles the PLAYER_CREATED event
            // First parameter is the event name
            // Second parameter is the elementId of player container
            // Third parameter is the list of parameters which were passed into
            // player upon creation.
        onPlayerCreate: function (event, elementId, params) {          
            //Nothing to do here
               
        },

        eventDebug : function (event, arg1,arg2,arg3,arg4,arg5){
            console.log("       " +event + " : " );
            console.log(arg1);
            console.log(arg2);
            console.log(arg3);
            console.log(arg4);
            console.log(arg5);
        },
        //This event is only called in HTML5
        onPreloadStream : function(event,resourceUrl){
            resource = resourceUrl;
        },

        onPlayHandler : function(event){

            if (isStartEventSent)
            {
                isPauseEventSent = false;
                resume();
            }
            else
            {
                isStartEventSent = true;
                start();
            }           

            if (isJoinEventSent)
            {               
                if (bufferCounter >= 1 && isStartEventSent && !isPauseEventSent && isBufferRunning)
                {
                    if ( !seek1 ){
                        buffer(SmartPluginAnalyticsEvents.BUFFER_END);
                    }
                }

                bufferCounter = 0;
                isBufferRunning = false;
            }

            if (isStartEventSent && !isJoinEventSent)
            {
                //sometimes the player won't call onBuffered, this is 
                //a workaorund
                if (!isJoinEventSent && isBufferRunning)
                {
                    join(SmartPluginAnalyticsEvents.BUFFER_END);
                }
                isBufferRunning = false;
                join(SmartPluginAnalyticsEvents.JOIN_SEND);
            }
            
            this.seek1 = false;

        },
        onPauseHandler : function(event){
            communications.sendPause();
        },
        onStopHandler : function(event){
            if (!isStopEventSent)
            {
                isStopEventSent = true;
                stop();
            }
        },
        onErrorHandler : function(event,errorCode){
            error(errorCode);
            if (!isStopEventSent)
            {
                isStopEventSent = true;
                stop();
            }
        },
        onBufferedHandler : function(event,streamUrl){
            if (!isJoinEventSent && isBufferRunning)
            {
                join(SmartPluginAnalyticsEvents.BUFFER_END);
            }
        },
        onPlaybackReadyHandler : function(event,errorCode){
            if (!isJoinEventSent && !isBufferRunning)
            {
                isBufferRunning = true;
                join(SmartPluginAnalyticsEvents.BUFFER_BEGIN);
            }
        },
        onSeekHandler : function(event,secondsToSeek){
            seek1 = true;
        },
        onEmbedCodeChanged : function(event,embedCode,params){

            try{
                videoDuration = embedCode.time;
                if(system==undefined || system =="" )
                    system = params["accountCode"];
                if(metadata==undefined || metadata =="")
                    metadata = params["metadata"];
                if(service==undefined || service =="" )
                    service = params["service"];
                if(username==undefined|| username =="")
                    username = params["username"];
                bandwidth.username = username
                communications = new YouboraCommunication(system , service ,  bandwidth , pluginVersion , targetDevice );
                pamPingTime = communications.getPingTime();
                   
                if(pamPingTime == 0){
                    pamPingTime =5000;
                }
            }
            catch(err){
                console.log(err);
            }
        },
        onPlayheadChangedHandler: function (event, time, duration, bufferName) {
            if(videoDuration == null || videoDuration == 'undefinded' || videoDuration == NaN){
                videoDuration = duration;
            }
            playTime = time;
            if (isJoinEventSent)
            {
                bufferCounter++;                  

                if (bufferCounter == 1 && isStartEventSent && !isPauseEventSent && !isBufferRunning)
                {
                    isBufferRunning = true;    
                        
                    if ( !seek1 ){
                        buffer(SmartPluginAnalyticsEvents.BUFFER_BEGIN);
                    }
                }
            }
        },
        reset : function()
        {
            isStopEventSent = false;
            isStartEventSent = false;
            isJoinEventSent = false;
            isBufferRunning = false;
            isPauseEventSent = false;
            bufferTimeBegin = 0;
            joinTimeBegin = 0;
            joinTimeEnd = 0;

            clearTimeout(pingTimer);
            pingTimer = null;
            lastPingTime = 0;
            diffTime = 0;

            clearTimeout(bufferTimer);

            //updateCode();
        },
        __end_marker: true
    };


    function join(bufferState)
    {
        var d = new Date();
        var joinTimeTotal = 0;
        if (bufferState == SmartPluginAnalyticsEvents.BUFFER_BEGIN)
        {
            joinTimeBegin = d.getTime();

        }
        else if (bufferState == SmartPluginAnalyticsEvents.BUFFER_END)
        {
            joinTimeEnd = d.getTime();

        } else if (bufferState == SmartPluginAnalyticsEvents.JOIN_SEND && !isJoinEventSent){
            isJoinEventSent = true;

            joinTimeTotal = joinTimeEnd - joinTimeBegin;
            if (joinTimeTotal <= 0)
            {
                joinTimeTotal = 0;
            }
            communications.sendJoin(playTime,joinTimeTotal);
        }
    };

    function start(){
        var d = new Date();

        try{
            communications.sendStart ( 0 , window.location.href , getMetadata() , isLive ,  resource, videoDuration);
        }catch(err){
            console.log(err);
        }

        setPing();
        lastPingTime = d.getTime();
    };
    function setPing ()
    {
        var context = this;
        pingTimer = setTimeout(function(){ ping(); }, pamPingTime);
    };
    function ping()
    {
        var d = new Date();

        clearTimeout(pingTimer);
        try{
            communications.sendPingTotalBitrate(getBitrate(),playTime);
            setPing();
        }catch(err){
            console.log(err);
        }
    };
    function getBitrate()
    {
        try
        {
            return -1;
        }
        catch (err)
        {
            return -1;
        }

        return -1;
    };
    function getMetadata(){
        var jsonObj = JSON.stringify(metadata);
        var metadata = encodeURI(jsonObj);

        return metadata;
    };

    function resume()
    {
        communications.sendResume();
    };
    function stop()
    {
        communications.sendStop();
        clearTimeout(pingTimer);
        pingTimer = null;

        reset();
    };
    function buffer(bufferState)
    {
        var d = new Date();
        var bufferTimeEnd = 0;
        var bufferTimeTotal = 0;

        if (bufferState == SmartPluginAnalyticsEvents.BUFFER_BEGIN)
        {
            bufferTimeBegin = d.getTime();
        }
        else if (bufferState == SmartPluginAnalyticsEvents.BUFFER_END)
        {
            bufferTimeEnd = d.getTime();
            bufferTimeTotal = bufferTimeEnd - bufferTimeBegin;

            communications.sendBuffer(playTime ,bufferTimeTotal/1000 );
        }
    };
    function error(errorCode)
    {
        communications.sendError("errorCode","");
        clearTimeout(pingTimer);
        pingTimer = null;
    };

    // Return the constructor of the module class.
    // This is required so that Ooyala's player can instantiate the custom
    // module correctly.
    return SmartPlugin.SmartPluginAnalytics;
});
