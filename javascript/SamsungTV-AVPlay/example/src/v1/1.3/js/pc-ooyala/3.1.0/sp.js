/*
 * Nice264 Ooyala Plugins package
 * Copyright (c) 2013 NicePeopleAtWork
 * Author: Luis Miguel Lainez
 * Version: 3.1.0
 */


OO.plugin("SmartPlugin", function (playerId) {

    var SmartPlugin = {};

    var SmartPluginAnalyticsEvents = {
        BUFFER_BEGIN: 1,
        BUFFER_END: 0,
        JOIN_SEND: 2
    };
    var playerId = playerId;
    var player={};
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
    var pluginVersion = "1.3.3.1.0_ooyala";
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
        'concurrent_streams' : "4007",
        'invalid_heartbeat' :"4008",
        'content_tree' : "4009",
        'metadata' : "4010",
        'generic' : "4011",
        'stream' : "4012",
        'livestream' : "4013",
        'network' : "4014",
        'unplayable_content' : "4015",
        'invalid_external_id' : "4016",
        'empty_channel' : "4017",
        'empty_channel_set' : "4018",
        'channel_content' : "4019",
        'stream_play_failed' : "4020",
        'adobe_pass_authenticate' : "4021",
        'adobe_pass_token' : "4022",
        'account_disabled' : "4023",
        'adobe_pass_asset_not_authenticated' : "4024",
        'adobe_pass_library_not_defined' : "4025",
        'adobe_pass_require_javascript' : "4026",
        'adobe_pass_user_not_authorized' : "4027",
        'after_flight_time' : "4028",
        'api_dynamic_ad_set_is_not_enabled_for_provider' : "4029",
        'api_expiration_in_past' : "4030",
        'api_expiration_not_in_whole_hours' : "4031",
        'api_expiration_too_far_in_future' : "4032",
        'api_invalid_dynamic_ad_set_assignment' : "4033",
        'api_invalid_ad_set_code' : "4034",
        'api_standalone_ad_set_is_empty': "4035",
        'bad_response': "4036",
        'bad_secure_streaming_response' : "4037",
        'before_flight_time' : "4038",
        'cannot_contact_sas' : "4039",
        'cannot_contact_server' : "4040",
        'cannot_download_third_party_module' : "4041",
        'cannot_fetch_pay_per_view_status' : "4042",       
        'cannot_fetch_secure_streaming_token' : "4043",
        'cannot_parse_pay_per_view_status_response' : "4044",
        'cannot_retrieve_domain' : "4045",
        'cannot_securely_stream_video' : "4046",
        'content_over_cap' : "4047",
        'content_unavailable' : "4048",
        'corrupted_netstream' : "4049",
        'api_dynamic_ad_set_is_not_enabled_for_provider' : "4050",
        'flash_access_license_unavailable' : "4051",
        'internal_error' : "4052",
        'internal_player_error' : "4053",
        'invalid_api_usage' : "4054",
        'invalid_content' : "4055",
        'invalid_content_segment' : "4056",
        'invalid_dynamic_ad_set_assignment' : "4057",
        'invalid_dynamic_ad_set_code' : "4058",
        'invalid_dynamic_channel_usage' : "4059",
        'invalid_flash_access_license' : "4060",
        'invalid_response' : "4061",
        'invalid_sas_response' : "4062",
        'invalid_server_response' : "4063",
        'invalid_token' : "4064",
        'live_stream_not_found' : "4065",
        'live_stream_finished' : "4066",
        'live_stream_finished_title' : "4067",
        'live_stream_unavailable' : "4068",
        'live_stream_unavailable_after_payment' : "4069",
        'long_before_flight_time' : "4070",
        'lost_connection' : "4071",
        'no_connection_player' : "4072'",
        'no_connection_video' : "4073",
        'no_movie_specified_for_labels' : "4074",
        'no_query_string_code' : "4075",
        'ppv_already_paid' : "4076",
        'ppv_cancel_purchase' : "4077",
        'ppv_change_mind' : "4078",
        'ppv_checkout_error' : "4079",
        'ppv_default_message' : "4080",
        'ppv_is_expired' : "4081",
        'ppv_needs_to_pay' : "4082",
        'ppv_needs_to_pay_at_start' : "4083",
        'ppv_no_more_plays_today' : "4084",
        'ppv_prepurchase' : "4085",
        'ppv_prepurchase_thank_you' : "4086",
        'ppv_purchase_in_progress' : "4087",
        'ppv_support_message' : "4088",
        'ppv_view_unauthorized' : "4089",
        'ppv_watch_video' : "4090",
        'processing_content' : "4091",
        'proxy_classes_dont_work' : "4092",
        'removed_content' : "4093",
        'sas_auth_failed' : "4094",
        'sas_heartbeat_failed' : "4095",
        'sas_too_many_active_streams' : "4096",
        'secure_streaming_auth_failed' : "4097",
        'standalone_ad_set_is_empty' : "4098",
        'stream_file_not_found' : "4099",
        'token_expired' : "4100",
        'unauthorized_device' : "4101",
        'unauthorized_domain' : "4102",
        'unauthorized_dynamic_channel' : "4103",
        'unauthorized_location' : "4104",
        'unauthorized_parent' : "4105",
        'unauthorized_pay_per_view' : "4106",
        'unauthorized_usage' : "4107",
        'unknown_account' : "4108",
        'unknown_content' : "4109",
        'unknown_domain' : "4110",
        'unknown_sas_content' : "4111",
        'version' : "4112",
        'version_not_supported' : "4113",
        'version_upgrade_link' : "4114",
        'version_upgrade_text' : "4115"

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

            /*this.mb.subscribe("*", 'NiceAnalytics',
                this.eventDebug);*/
            
            try
            {
                platform = OO.__internal.playerParams.platform;

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

                this.mb.subscribe(OO.EVENTS.PLAYER_CREATED, 'NiceAnalytics',
                    this.onPlayerCreate);

                this.mb.subscribe(OO.EVENTS.PAUSED,
                    'NiceAnalytics',this.onPauseHandler, this);

                this.mb.subscribe(OO.EVENTS.PLAYING,
                    'NiceAnalytics', this.onPlayingHandler, this);

                //This event is called only in HTML5
                this.mb.subscribe(OO.EVENTS.AUTHORIZATION_FETCHED,
                    'NiceAnalytics', this.onAuthorizationFetched, this);

                this.mb.subscribe(OO.EVENTS.PLAYED,
                    'NiceAnalytics', this.onStopHandler, this);

                this.mb.subscribe(OO.EVENTS.ERROR,
                    'NiceAnalytics', this.onErrorHandler);

                this.mb.subscribe(OO.EVENTS.PLAY,
                    'NiceAnalytics', this.onPlayHandler);

                this.mb.subscribe(OO.EVENTS.PLAY_STREAM,
                    'NiceAnalytics', this.onPlayStreamHandler);

                this.mb.subscribe(OO.EVENTS.BUFFERED,
                    'NiceAnalytics', this.onBufferedHandler);

                this.mb.subscribe(OO.EVENTS.BUFFERING,
                    'NiceAnalytics', this.onBufferingHandler);

                this.mb.subscribe(OO.EVENTS.PLAYBACK_READY,
                    'NiceAnalytics', this.onPlaybackReadyHandler);
                       
                this.mb.subscribe(OO.EVENTS.PLAYHEAD_TIME_CHANGED,
                    'NiceAnalytics', this.onPlayheadChangedHandler);

                this.mb.subscribe(OO.EVENTS.SEEK,
                    'NiceAnalytics', this.onSeekHandler);

                this.mb.subscribe(OO.EVENTS.SCRUBBING,
                    'NiceAnalytics', this.onSeekHandler);

                this.mb.subscribe(OO.EVENTS.SCRUBBED,
                    'NiceAnalytics', this.onSeekHandler);

                this.mb.subscribe(OO.EVENTS.EMBED_CODE_CHANGED,
                    'NiceAnalytics', this.onEmbedCodeChanged, this); 

                //This event is jut called in flash
                this.mb.subscribe(OO.EVENTS.BITRATE_CHANGED,
                   'NiceAnalytics', this.onBitrateChanged, this);    

                //This event is only called in HTML5
                this.mb.subscribe(OO.EVENTS.PRELOAD_STREAM,
                    'NiceAnalytics', this.onPreloadStream); 

                this.mb.subscribe(OO.EVENTS.DOWNLOADING,
                    'NiceAnalytics', this.onDownloading); 

                this.mb.subscribe("contentTreeFetched",
                    'NiceAnalytics', this.onContentTreeFetchedHandler);

                this.mb.subscribe(OO.EVENTS.ADS_PLAYED,
                    'NiceAnalytics', this.adsPlayed);

                this.mb.subscribe(OO.EVENTS.WILL_PLAY_ADS,
                    'NiceAnalytics', this.adsWillPlay);

                this.mb.subscribe(OO.EVENTS.WILL_PLAY_SINGLE_AD,
                    'NiceAnalytics', this.adsWillPlay);

                this.mb.subscribe(OO.EVENTS.WILL_PLAY,
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

                if (isStartEventSent && !isJoinEventSent && isBufferRunning)
                {
                    //sometimes the player won't call onBuffered, this is 
                    //a workaorund
                   
                    join(SmartPluginAnalyticsEvents.BUFFER_END);
                    isBufferRunning = false;
                    join(SmartPluginAnalyticsEvents.JOIN_SEND);
                }
                
                else if(isStartEventSent && isJoinEventSent && isBufferRunning && !seek1){
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
            if (!isJoinEventSent && isBufferRunning)
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
            if (!isJoinEventSent && isBufferRunning)
            {
                join(SmartPluginAnalyticsEvents.BUFFER_END);
                isBufferRunning = false;
                join(SmartPluginAnalyticsEvents.JOIN_SEND);
            }
            else if(isStartEventSent && isJoinEventSent && isBufferRunning && !seek1){
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
        errorCode = errorCode.toLowerCase();
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
        console.log("BufferCheck :  " + player.currentTime );
        if(lastTime >= player.currentTime && !isPauseEventSent && !isBufferRunning && !seek1){
            buffer(SmartPluginAnalyticsEvents.BUFFER_BEGIN);
            isBufferRunning=true;
        }
        lastTime = player.currentTime;
        //console.log(SmartPlugin.players[id]);
       
        setBufferCheck();
    }

    // Return the constructor of the module class.
    // This is required so that Ooyala's player can instantiate the custom
    // module correctly.
    return SmartPlugin.SmartPluginAnalytics;
});
