/*
 * Nice264 Ooyala Plugins package
 * Copyright (c) 2013 NicePeopleAtWork
 * Author: Luis Miguel Lainez
 * Version: 3.2.0
 */

var nameSpace ={};

if(youboraData.ooyalaNameSpace!=undefined)
{
    if (typeof youboraData.getOoyalaNamespace() == "string")
    {
        nameSpace = eval(youboraData.getOoyalaNamespace());
    }
    else
    {
        nameSpace = youboraData.getOoyalaNamespace();
    }
}
else
{
    nameSpace = OO;
}

nameSpace.plugin("SmartPlugin", function (playerId) {

    var SmartPlugin = {};
    var player={};

    var SmartPluginAnalyticsEvents = {
        BUFFER_BEGIN: 1,
        BUFFER_END: 0,
        JOIN_SEND: 2
    };
    var playerId = playerId;

    var service = "";
    var communications=null;
    var system = "";
    var metadata = {};
    var username="";
          
    // active adsense
    var activeAdsense = false;
    var platform      = null;
    var isFlashPlugin = false;
                 
    //resource being played
    var resource      = "";

     // configuration
    var pluginVersion = "1.3.3.2.0_ooyala";
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
    var bitrate = 0;


    // code
    var pamCode = "";
    var pamCodeOrig = "";
    var pamCodeCounter = 0;

    // ping
    var pamPingTime = 0;
    var lastPingTime = 0;
    var diffTime = 0;
    var pingTimer = null;
    var lastBitrate = -1;

    // buffer
    var lastCurrentTime = 0;

    //seek status
    var seek1 = false;
    var playTime=0;
    var videoDuration=NaN;
    var playing=false;

    //convinience variable to set the username.Used for uniformity issue with the  Nice264Communications
    var bandwidth ={};

    //Mthod to control the buffering in html, by listening sequences of progress-timeUpdate
    var progressCount=0;

    var bufferCheckTimer={};
    var lastTime=0;

    var SmartPluginError =  {
        'network' : "4000",
        'generic' : "4001",
        'geo' : "4002",
        'domain' : "4003",
        'future' : "4004",
        'past' : "4005",
        'device' : "4006",
        'concurrentStreams' : "4007",
        'invalidHeartbeat' :"4008",
        'contentTree' : "4009",
        'metadata' : "4010",
        'generic' : "4011",
        'stream' : "4012",
        'livestream' : "4013",
        'network' : "4014",
        'unplayableContent' : "4015",
        'invalidExternalId' : "4016",
        'emptyChannel' : "4017",
        'emptyChannelSet' : "4018",
        'channelContent' : "4019",
        'streamPlayFailed' : "4020",
        'adobePassAuthenticate' : "4021",
        'adobePassToken' : "4022",
        'accountDisabled' : "4023",
        'adobePassAssetNotAuthenticated' : "4024",
        'adobePassLibraryNotDefined' : "4025",
        'adobePassRequireJavascript' : "4026",
        'adobePassUserNotAuthorized' : "4027",
        'afterFlightTime' : "4028",
        'apiDynamicAdSetIsNotEnabledForProvider' : "4029",
        'apiExpirationInPast' : "4030",
        'apiExpirationNotInWholeHours' : "4031",
        'apiExpirationTooFarInFuture' : "4032",
        'apiInvalidDynamicAdSetAssignment' : "4033",
        'apiInvalidAdSetCode' : "4034",
        'apiStandaloneAdSetIsEmpty': "4035",
        'badResponse': "4036",
        'badSecureStreamingResponse' : "4037",
        'beforeFlightTime' : "4038",
        'cannotContactSas' : "4039",
        'cannotContactServer' : "4040",
        'cannotDownloadThirdPartyModule' : "4041",
        'cannotFetchPayPerCiewStatus' : "4042",       
        'cannotFetchSecureStreamingToken' : "4043",
        'cannotParsePayPerViewStatusResponse' : "4044",
        'cannotRetrieveDomain' : "4045",
        'cannotSecurelyStreamVideo' : "4046",
        'contentOverCap' : "4047",
        'contentUnavailable' : "4048",
        'corruptedNetstream' : "4049",
        'apiDynamicAdSetIsNotEnabledForProvider' : "4050",
        'flashAccessLicenseUnavailable' : "4051",
        'internalError' : "4052",
        'internalPlayerError' : "4053",
        'invalidApiUsage' : "4054",
        'invalidContent' : "4055",
        'invalidCcontentSegment' : "4056",
        'invalidDynamicAdSetAssignment' : "4057",
        'invalidDynamicAdSetCode' : "4058",
        'invalidDynamicChannelUsage' : "4059",
        'invalidFlashAccessLicense' : "4060",
        'invalidResponse' : "4061",
        'invalidSasResponse' : "4062",
        'invalidServerResponse' : "4063",
        'invalidToken' : "4064",
        'liveStreamNotFound' : "4065",
        'liveStreamFinished' : "4066",
        'liveStreamFinishedTitle' : "4067",
        'liveStreamUnavailable' : "4068",
        'liveStreamUnavailableAfterPayment' : "4069",
        'longBeforeFlightTime' : "4070",
        'lostConnection' : "4071",
        'noConnectionPlayer' : "4072'",
        'noConnectionVideo' : "4073",
        'noMovieSpecifiedForLabels' : "4074",
        'noQueryStringCode' : "4075",
        'ppvAlreadyPaid' : "4076",
        'ppvCancelPurchase' : "4077",
        'ppvChangeMind' : "4078",
        'ppvCheckoutError' : "4079",
        'ppvDefaultMessage' : "4080",
        'ppvIsExpired' : "4081",
        'ppvNeedsToPay' : "4082",
        'ppvNeedsToPayAtStart' : "4083",
        'ppvNoMorePlaysToday' : "4084",
        'ppvPrepurchase' : "4085",
        'ppvPrepurchaseThankYou' : "4086",
        'ppvPurchaseInProgress' : "4087",
        'ppvSupportMessage' : "4088",
        'ppvViewUnauthorized' : "4089",
        'ppvWatchVideo' : "4090",
        'processingContent' : "4091",
        'proxyClassesDontWork' : "4092",
        'removedContent' : "4093",
        'sasAuthFailed' : "4094",
        'sasHeartbeatFailed' : "4095",
        'sasTooManyActiveStreams' : "4096",
        'secureStreamingAuthFailed' : "4097",
        'standaloneAdSetIsEmpty' : "4098",
        'streamFileNotFound' : "4099",
        'tokenExpired' : "4100",
        'unauthorizedDevice' : "4101",
        'unauthorizedDomain' : "4102",
        'unauthorizedDynamicChannel' : "4103",
        'unauthorizedLocation' : "4104",
        'unauthorizedParent' : "4105",
        'unauthorizedPayPerView' : "4106",
        'unauthorizedUsage' : "4107",
        'unknownAccount' : "4108",
        'unknownContent' : "4109",
        'unknownDomain' : "4110",
        'unknownSasContent' : "4111",
        'version' : "4112",
        'versionNotSupported' : "4113",
        'versionUpgradeLink' : "4114",
        'versionUpgradeText' : "4115"

    };

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
        init: function () 
        {

            // subscribe to relevant player events

           /* this.mb.subscribe("*", 'NiceAnalytics',
                this.eventDebug);*/
            
            try
            {
                platform = nameSpace.__internal.playerParams.platform;

                if ( platform.indexOf("flash") > -1 )
                {
                    isFlashPlugin = true;
                }
                else
                {
                    isFlashPlugin = false;
                }

                //youboraData.log ( " * Is Flash Plugin: " + isFlashPlugin );
            }
            catch(err)
            {
                youboraData.log(err);
            }

            try
            {

                this.mb.subscribe(nameSpace.EVENTS.PLAYER_CREATED, 'NiceAnalytics',
                    this.onPlayerCreate);

                this.mb.subscribe(nameSpace.EVENTS.PAUSED,
                    'NiceAnalytics',this.onPauseHandler, this);

                this.mb.subscribe(nameSpace.EVENTS.PLAYING,
                    'NiceAnalytics', this.onPlayingHandler, this);

                //This event is called only in HTML5
                this.mb.subscribe(nameSpace.EVENTS.AUTHORIZATION_FETCHED,
                    'NiceAnalytics', this.onAuthorizationFetched, this);

                this.mb.subscribe(nameSpace.EVENTS.PLAYED,
                    'NiceAnalytics', this.onStopHandler, this);

                this.mb.subscribe(nameSpace.EVENTS.ERROR,
                    'NiceAnalytics', this.onErrorHandler);

                this.mb.subscribe(nameSpace.EVENTS.PLAY,
                    'NiceAnalytics', this.onPlayHandler);

                this.mb.subscribe(nameSpace.EVENTS.PLAY_STREAM,
                    'NiceAnalytics', this.onPlayStreamHandler);

                this.mb.subscribe(nameSpace.EVENTS.BUFFERED,
                    'NiceAnalytics', this.onBufferedHandler);

                this.mb.subscribe(nameSpace.EVENTS.BUFFERING,
                    'NiceAnalytics', this.onBufferingHandler);

                this.mb.subscribe(nameSpace.EVENTS.PLAYBACK_READY,
                    'NiceAnalytics', this.onPlaybackReadyHandler);
                       
                this.mb.subscribe(nameSpace.EVENTS.PLAYHEAD_TIME_CHANGED,
                    'NiceAnalytics', this.onPlayheadChangedHandler);

                this.mb.subscribe(nameSpace.EVENTS.SEEK,
                    'NiceAnalytics', this.onSeekHandler);

                this.mb.subscribe(nameSpace.EVENTS.SCRUBBING,
                    'NiceAnalytics', this.onSeekHandler);

                this.mb.subscribe(nameSpace.EVENTS.SCRUBBED,
                    'NiceAnalytics', this.onSeekHandler);

                this.mb.subscribe(nameSpace.EVENTS.EMBED_CODE_CHANGED,
                    'NiceAnalytics', this.onEmbedCodeChanged, this); 

                //This event is jut called in flash
                this.mb.subscribe(nameSpace.EVENTS.BITRATE_CHANGED,
                   'NiceAnalytics', this.onBitrateChanged, this);    

                //This event is only called in HTML5
                this.mb.subscribe(nameSpace.EVENTS.PRELOAD_STREAM,
                    'NiceAnalytics', this.onPreloadStream); 

                this.mb.subscribe(nameSpace.EVENTS.DOWNLOADING,
                    'NiceAnalytics', this.onDownloading); 

                this.mb.subscribe("contentTreeFetched",
                    'NiceAnalytics', this.onContentTreeFetchedHandler);

                this.mb.subscribe(nameSpace.EVENTS.ADS_PLAYED,
                    'NiceAnalytics', this.adsPlayed);

                this.mb.subscribe(nameSpace.EVENTS.WILL_PLAY_ADS,
                    'NiceAnalytics', this.adsWillPlay);

                this.mb.subscribe(nameSpace.EVENTS.WILL_PLAY_SINGLE_AD,
                    'NiceAnalytics', this.adsWillPlay);

                this.mb.subscribe(nameSpace.EVENTS.WILL_PLAY,
                    'NiceAnalytics', this.videoWillPlay);

                

               // youboraData.log(SmartPlugin.player);
             
               // SmartPlugin.player.addEventListener("waiting",this.onBufferHTML5);
                //this.mb.subscribe("waiting","NiceAnalytics",this.onBufferHTML5);

            }catch(err){
                youboraData.log(err);
            }
         
        },

        
       /* onProgress : function(){

            progressCount ++;
            if(!isBufferRunning && progressCount > 2 && isJoinEventSent){
                SmartPlugin.SmartPluginAnalytics.prototype.onBufferingHandler(); 
                isBufferRunning=true;
                progressCount = 0 ;

            }
            if(isPauseEventSent){
                progressCount=0;
            }
          
            
        },*/
            // Handles the PLAYER_CREATED event
            // First parameter is the event name
            // Second parameter is the elementId of player container
            // Third parameter is the list of parameters which were passed into
            // player upon creation.
        onPlayerCreate: function (event, elementId, params) {       
            if(!isFlashPlugin){   
                player = document.getElementsByTagName('video')[0];
               /* SmartPlugin.player.addEventListener("progress", function (e) {                
                         SmartPlugin.SmartPluginAnalytics.prototype.onProgress();
                }, false); */
            }

        },

        onDownloading : function(event,arg1,arg2,arg3,arg4,mediaResource)
        {
            if(resource=="" || resource==undefined)
            {
                resource = mediaResource;
            }

            // Only for FLASH Plugin, because HTML5 load before play!!
            if ( isFlashPlugin )
            {
                readyForSendStart ();
            }
        },

        eventDebug : function (event, arg1,arg2,arg3,arg4,arg5){
            youboraData.log("       " +event + " : " );
            youboraData.log(arg1);
            youboraData.log(arg2);
            youboraData.log(arg3);
            youboraData.log(arg4);
            youboraData.log(arg5);
        },

        onContentTreeFetchedHandler : function(event, contentTree){  
            try{
                if(youboraData.properties.content_metadata.title==""){
                    youboraData.properties.content_metadata.title = contentTree.title;
                }

            }catch(err){
                youboraData.log(err);
            }
            try{
                if(!isFlashPlugin){
                    videoDuration = (contentTree.duration)/1000;
                }else{
                    videoDuration = contentTree.time;
                }
             }catch(err){
                youboraData.log(err);
             }
        },

        onBitrateChanged : function(event, bitrateObject){
            //Information available only for videoBitrate
            bitrate = bitrateObject.videoBitrate;
        },

        onBitrateChanged : function(event, bitrateInfo){
            try{
                bitrate= bitrateInfo.videoBitrate;
             
            }catch(err){
                youboraData.log(err);
            }
        },
        
        onAuthorizationFetched: function(event,mediaData){
            //The mediaData is different in HTML5 and Flash so we need
            //to be careful
            try{
                if(mediaData!=undefined){
                    if(mediaData.streams[0]!=undefined){
                        bitrate = mediaData.streams[0].video_bitrate ;//+ mediaData.streams[0].audio_bitrate;
                    }
                }
            }catch(err){};
        },
        //This event is only called in HTML5
        onPreloadStream : function(event,resourceUrl){
            resource = resourceUrl;
        },

        onPlayingHandler : function(event){
            if ( activeAdsense == false )
            {
                if (isStartEventSent)
                {
                    if(isPauseEventSent){
                        isPauseEventSent = false;
                        resume();
                    }
                }
                else
                {
                    isStartEventSent = true;
                    start();
                }           

                if (isStartEventSent && !isJoinEventSent && isBufferRunning && !activeAdsense)
                {
                    //sometimes the player won't call onBuffered, this is 
                    //a workaorund
                   
                    join(SmartPluginAnalyticsEvents.BUFFER_END);
                    isBufferRunning = false;
                    join(SmartPluginAnalyticsEvents.JOIN_SEND);
                }
                
                else if(isStartEventSent && isJoinEventSent && isBufferRunning && !seek1 && !activeAdsense){
                    buffer(SmartPluginAnalyticsEvents.BUFFER_END);   
                    seek1 = false;                 
                }
            }
        
            
            isBufferRunning = false;

        },
        onPauseHandler : function(event){
            if(isStartEventSent && !isPauseEventSent && !seek1){
                isPauseEventSent = true;
                communications.sendPause();
            }
        },
        onStopHandler : function(event){
            if (!isStopEventSent)
            {
                isStopEventSent = true;
                stop();
            }
        },
        onErrorHandler : function(event,errorCode){
            console.log(event);
            error(errorCode.code);
            if (!isStopEventSent)
            {
                isStopEventSent = true;
                stop();
            }
        },

        onPlayHandler: function (event)
        {

            if (!isJoinEventSent && !isBufferRunning)
            {
                isBufferRunning = true;
                join(SmartPluginAnalyticsEvents.BUFFER_BEGIN);
            }

        },
        onPlayStreamHandler: function (event)
        {
            if ( isFlashPlugin == false )
            {
                readyForSendStart();
            }
        },


        onBufferingHandler:function(event,arg1,arg2,ar3,arg4)
        {
            try{
                if (!isJoinEventSent && !isBufferRunning)
                {
                    isBufferRunning = true;
                    join(SmartPluginAnalyticsEvents.BUFFER_BEGIN);
                }

                else if ( isJoinEventSent && !isBufferRunning )
                {                        
                    if ( !seek1 )
                    {
                        isBufferRunning = true;
                        buffer(SmartPluginAnalyticsEvents.BUFFER_BEGIN);
                    }
                }
            }catch(e){
                youboraData.log(e);
            }
        },

        onBufferedHandler : function(event,streamUrl){
            if (!isJoinEventSent && isBufferRunning && !activeAdsense)
            {
                join(SmartPluginAnalyticsEvents.BUFFER_END);
            }
        },

        onPlaybackReadyHandler : function(event,errorCode){

            // Don't use in this version

        },

        onSeekHandler : function(event,secondsToSeek){
               seek1 = true;
        },
        onEmbedCodeChanged : function(event,embedCode,params){
            try{
                videoDuration = embedCode.time;
                system = youboraData.getAccountCode();
                username =   youboraData.getUsername();
                metadata =  youboraData.getProperties();
                service =    youboraData.getService();
                bandwidth.username = username;
                isLive = youboraData.getLive();
                communications = new YouboraCommunication(youboraData.getAccountCode() , service ,  bandwidth , pluginVersion , targetDevice );
                
                pamPingTime = communications.getPingTime();
                   
                if(pamPingTime == 0){
                    pamPingTime =5000;
                }
                reset();

            }
            catch(err){
                youboraData.log(err);
            }
        },
        onPlayheadChangedHandler: function (event, time, duration, bufferName) 
        {
           
            progressCount = 0 ;
            
            if((videoDuration == null || videoDuration == 'undefinded' || videoDuration == NaN) && activeAdsense == false)
            {
                videoDuration = duration;
            }
            playTime =  Math.round(time);
            if (!isJoinEventSent && isBufferRunning && !activeAdsense)
            {
                join(SmartPluginAnalyticsEvents.BUFFER_END);
                isBufferRunning = false;
                join(SmartPluginAnalyticsEvents.JOIN_SEND);
            }
            else if(isStartEventSent && isJoinEventSent && isBufferRunning && !seek1 && !activeAdsense){
                buffer(SmartPluginAnalyticsEvents.BUFFER_END);   
                seek1 = false;   
                isBufferRunning=false;              
            }
           
            

        },
        adsWillPlay: function ( event )
        {
            activeAdsense = true;

        },
        adsPlayed: function ( event )
        {
            activeAdsense = false;
        },
        videoWillPlay: function ( event )
        {

        },
        
        __end_marker: true
    };

    // Send Start if know resource
    function readyForSendStart ()
    {
        //youboraData.log ( "readyForSendStart: " + activeAdsense + " // " + isStartEventSent + " // " + resource );

        if ( activeAdsense == false )
        {
            if ( isStartEventSent == false )
            {
                if ( resource != "" )
                {
                    isStartEventSent = true;
                    start();
                }
            }   
        }
    }

    function reset()
    {
        isStopEventSent = false;
        isStartEventSent = false;
        isJoinEventSent = false;
        isBufferRunning = false;
        isPauseEventSent = false;
        bufferTimeBegin = 0;
        joinTimeBegin = 0;
        joinTimeEnd = 0;

        activeAdsense = false;

        resource = "";

        clearTimeout(pingTimer);
        pingTimer = null;
        lastPingTime = 0;
        diffTime = 0;

    }

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

        } 
        else if (bufferState == SmartPluginAnalyticsEvents.JOIN_SEND && !isJoinEventSent)
        {
            isJoinEventSent = true;

            joinTimeTotal = joinTimeEnd - joinTimeBegin;

            if (joinTimeTotal <= 0)
            {
                joinTimeTotal = 10;
            }
        
            if(playTime == undefined)
            {
                playTime=0;
            }

            communications.sendJoin( Math.round(playTime),joinTimeTotal);
        }
    };

    function start(){
        try{
            var d = new Date();
            communications.sendStart ( 0 , window.location.href , getMetadata() , isLive ,  resource, videoDuration,youboraData.getTransaction());
            setPing();
            if(!isFlashPlugin){
                setBufferCheck();
            }
            lastPingTime = d.getTime();

        }catch(err){
            youboraData.log(err);
        }

        
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
            if(activeAdsense){
                communications.sendPingTotalBitrate(lastBitrate, Math.round(lastPingTime));
            }else{
                communications.sendPingTotalBitrate(getBitrate(), Math.round(playTime));
                lastPingTime =   Math.round(playTime);
                lastBitrate = getBitrate();
            }
            setPing();
        }catch(err){
            youboraData.log(err);
        }
    };
    function getBitrate()
    {
        if(bitrate==0 || bitrate == undefined){
            return -1;
        }else{
            return bitrate * 1024;
        }
    };
    function getMetadata(){
        var jsonObj = JSON.stringify(youboraData.getProperties());
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

            communications.sendBuffer( Math.round(playTime) ,bufferTimeTotal );
        }
    };
    function error(errorCode)
    {
        var errorCodeYoubora = SmartPluginError[errorCode];
        if(errorCodeYoubora==undefined){
            errorCodeYoubora = errorCodeYoubora;
        }
        communications.sendErrorWithParameters(errorCodeYoubora, "", 0, window.location.href, getMetadata(), isLive, resource, videoDuration, youboraData.getTransaction());
        clearTimeout(pingTimer);
        pingTimer = null;
    };

    function setBufferCheck ()
    {
        bufferCheckTimer = setTimeout(function(){ bufferCheck(); }, 250);

    };
    function bufferCheck(){
        if(lastTime >= player.currentTime && !isPauseEventSent && !isBufferRunning && !seek1){
            buffer(SmartPluginAnalyticsEvents.BUFFER_BEGIN);
            isBufferRunning=true;
        }
        lastTime = player.currentTime;
       
        setBufferCheck();
    }

    // Return the constructor of the module class.
    // This is required so that Ooyala's player can instantiate the custom
    // module correctly.
    return SmartPlugin.SmartPluginAnalytics;
});
