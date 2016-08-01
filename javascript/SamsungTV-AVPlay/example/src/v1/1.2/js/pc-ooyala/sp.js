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
            
            var maxTries    = 5;
            var tryInterval = 5;

            //Try to get the player up to maxTries times
            //If it fails the plugin will not be loaded
            if(currentTry<maxTries)
            {
                try
                {
                    setTimeout(function(){ 
                        
                        var player = OO.__internal.players;
                        for (var key in OO.__internal.players) {
                            player = OO.__internal.players[key];
                        }
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
          
    // active adsense
    var activeAdsense = false;
    var platform      = null;
    var isFlashPlugin = false;
                 
    //resource being played
    var resource      = "";

     // configuration
    var pluginVersion = "3.0.0_ooyala";
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

            //this.mb.subscribe("*", 'NiceAnalytics', this.eventDebug);

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

                //console.log ( " * Is Flash Plugin: " + isFlashPlugin );
            }
            catch(err)
            {
                console.log(err);
            }

            try{

                platform = OO.__internal.playerParams.platform;

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

            }
            catch(err)
            {
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

        //This event is only called in HTML5
        onPreloadStream : function(event,resourceUrl)
        {
            resource = resourceUrl;
        },

        eventDebug : function (event, arg1,arg2,arg3,arg4,arg5)
        {
            if ( event != "playheadTimeChanged" )
            {
                console.log(" >> ** >>      " +event + " : " );
                console.log("               * Resource: " + resource );

                //console.log(arg1);
                //console.log(arg2);
                //console.log(arg3);
                //console.log(arg4);
                //console.log(arg5);
            }
        },

        onContentTreeFetchedHandler : function(event, contentTree){  
            try{
                if(youboraData.properties.content_metadata.title==""){
                    youboraData.properties.content_metadata.title = contentTree.title;
                }
            }catch(err){
                console.log(err);
            }
        },
        
        onBitrateChanged : function(event, bitrateObject){
            //Information available only for videoBitrate
            bitrate = bitrateObject.videoBitrate;
        },

        onBitrateChanged : function(event, bitrateInfo){
            try{
                bitrate= bitrateInfo.videoBitrate;
               /* var targetBitrateQuality = bitrateInfo.targetBitrateQuality;
                if(targetBitrateQuality == "auto"){
                    bitrate = bitrateInfo.bitrates[0];
                }else{
                    bitrate = bitrateInfo.bitrates[targetBitrate];
                }
                //In case something happened
                if(bitrate == undefined){
                    bitrate = 0;
                }*/
            }catch(err){
                console.log(err);
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

                /*if (isJoinEventSent)
                {               
                    if (bufferCounter >= 1 && isStartEventSent && !isPauseEventSent && isBufferRunning)
                    {
                        if ( !seek1 )
                        {
                            buffer(SmartPluginAnalyticsEvents.BUFFER_END);
                        }
                    }

                    bufferCounter = 0;
                    isBufferRunning = false;
                }*/

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
            
            }
            else
            {
                bufferCounter   = 0;
                isBufferRunning = false;
                this.seek1      = false;
            }
            
        },
        onPauseHandler : function(event){
            if(isStartEventSent && !isPauseEventSent){
                communications.sendPause();
                isPauseEventSent=true;
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

            // Event Play is only for HTML5 Player
            if ( isFlashPlugin == false )
            {
                readyForSendStart();
            }
        },

        onBufferingHandler:function(event,arg1,arg2,ar3,arg4)
        {
            if ( !isJoinEventSent && !isBufferRunning )
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
        },

        onBufferedHandler : function(event,streamUrl)
        {
            if (!isJoinEventSent && isBufferRunning)
            {
                join(SmartPluginAnalyticsEvents.BUFFER_END);
            }
        },

        onPlaybackReadyHandler : function(event,errorCode){

            // Don't use in this version

        },

        onSeekHandler : function(event,secondsToSeek)
        {
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
                console.log(err);
            }
        },
        onPlayheadChangedHandler: function (event, time, duration, bufferName) 
        {
            if(videoDuration == null || videoDuration == 'undefinded' || videoDuration == NaN)
            {
                videoDuration = duration;
            }
            
            playTime = time;

            /*if (isJoinEventSent)
            {
                bufferCounter++; 
            }*/
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
        //console.log ( "readyForSendStart: " + activeAdsense + " // " + isStartEventSent + " // " + resource );

        if ( activeAdsense == false )
        {
            if ( isStartEventSent == false )
            {
                if ( resource != "" )
                {
                    //console.log("Send start after playing!");

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

        clearTimeout(bufferTimer);
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
	    
            if(playTime== undefined){
		      playTime=0;
	        }
            
            communications.sendJoin(playTime,joinTimeTotal);
        }
    };

    function start(){
        try{
            var d = new Date();
            communications.sendStart ( 0 , window.location.href , getMetadata() , isLive ,  resource, videoDuration,youboraData.getTransaction());
            setPing();
            lastPingTime = d.getTime();

        }catch(err){
            console.log(err);
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
            communications.sendPingTotalBitrate(getBitrate(),playTime);
            setPing();
        }catch(err){
            console.log(err);
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

            communications.sendBuffer(playTime ,bufferTimeTotal );
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
        /*.sendError("errorCode","");
        clearTimeout(pingTimer);
        pingTimer = null;*/
    };

    // Return the constructor of the module class.
    // This is required so that Ooyala's player can instantiate the custom
    // module correctly.
    return SmartPlugin.SmartPluginAnalytics;
});
