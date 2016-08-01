/*
 * Nice264 Ooyala Plugins package
 * Copyright (c) 2013 NicePeopleAtWork
 * Author: Luis Miguel Lainez
 * Version:  2.3.0
 */


/**
 * Method to set up the plugin in the page. There is no reference to the player
 * until it is set up. We need to wait until the player is set and then 
 * instantiate it with the embed code and the rest of the needed information.
 * The setEmbedCode method triggers a method that initializes the entire plugin.
 **/
var SmartPlugin = { 
    smartAnalytics: null,
    player: null,
     //Variable that translates (Plugin)id -> playerId. Used to get the
    //youboraData that is needed.
    nameMap : new Array(),
    players:new Array(),
    youboraCommunicationsMap : new YouboraCommunicationsMap(),
    Init: function() {  
        SmartPlugin.setUpOoyala(0);
    },   
};

OO.plugin("SmartPlugin", function (playerId) {

    //var SmartPlugin = {};

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
    var videoTitle="";
          
    // active adsense
    var activeAdsense = false;
                 
    //resource being played
    var resource="";

     // configuration
    var pluginVersion = "1.3.2.3.0_ooyala_multi";
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
    var isPauseEventSent = false;

    // properties
    var assetMetadata = {};
    var isLive = false;
    var bufferTimeBegin = 0;
    var joinTimeBegin = 0;
    var joinTimeEnd = 0;
    var isBufferRunning=0;
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
    var bufferTimer = null;
    var bufferCounter = 0;

    //seek status
    var seek1 = false;
    var playTime=0;
    var videoDuration=NaN;
    var playing=false;

    // active adsense
    var activeAdsense = false;
    var platform      = null;
    var isFlashPlugin = false;

    var messageBusMap = new Array();
    var bufferCheckTimer={};
    var lastTime=0;

    var SmartPluginError =  {
        'network' : "4000",
        'generic' : "4001",
        'geo' : "4003",
        'domain' : "4004",
        'future' : "4005",
        'past' : "4006",
        'device' : "4007",
        'concurrent_streams' : "4008",
        'invalid_heartbeat' :"4009",
        'content_tree' : "4010",
        'metadata' : "4011",
        'generic' : "4012",
        'stream' : "4013",
        'livestream' : "4014",
        'network' : "4015",
        'unplayable_content' : "4016",
        'invalid_external_id' : "4017",
        'empty_channel' : "4018",
        'empty_channel_set' : "4019",
        'channel_content' : "4020",
        'stream_play_failed' : "4021",
        'adobe_pass_authenticate' : "4022",
        'adobe_pass_token' : "4023",
        'account_disabled' : "4024",
        'adobe_pass_asset_not_authenticated' : "4025",
        'adobe_pass_library_not_defined' : "4026",
        'adobe_pass_require_javascript' : "4027",
        'adobe_pass_user_not_authorized' : "4028",
        'after_flight_time' : "4115",
        'api_dynamic_ad_set_is_not_enabled_for_provider' : "4116",
        'api_expiration_in_past' : "4029",
        'api_expiration_not_in_whole_hours' : "4030",
        'api_expiration_too_far_in_future' : "4031",
        'api_invalid_dynamic_ad_set_assignment' : "4032",
        'api_invalid_ad_set_code' : "4033",
        'api_standalone_ad_set_is_empty': "4034",
        'bad_response': "4035",
        'bad_secure_streaming_response' : "4036",
        'before_flight_time' : "4037",
        'cannot_contact_sas' : "4038",
        'cannot_contact_server' : "4117",
        'cannot_download_third_party_module' : "4039",
        'cannot_fetch_pay_per_view_status' : "4040",       
        'cannot_fetch_secure_streaming_token' : "4041",
        'cannot_parse_pay_per_view_status_response' : "4042",
        'cannot_retrieve_domain' : "4043",
        'cannot_securely_stream_video' : "4044",
        'content_over_cap' : "4045",
        'content_unavailable' : "4046",
        'corrupted_netstream' : "4047",
        'api_dynamic_ad_set_is_not_enabled_for_provider' : "4048",
        'flash_access_license_unavailable' : "4049",
        'internal_error' : "4050",
        'internal_player_error' : "4051",
        'invalid_api_usage' : "4052",
        'invalid_content' : "4053",
        'invalid_content_segment' : "4054",
        'invalid_dynamic_ad_set_assignment' : "4055",
        'invalid_dynamic_ad_set_code' : "4056",
        'invalid_dynamic_channel_usage' : "4057",
        'invalid_flash_access_license' : "4058",
        'invalid_response' : "4059",
        'invalid_sas_response' : "4060",
        'invalid_server_response' : "4061",
        'invalid_token' : "4062",
        'live_stream_not_found' : "4063",
        'live_stream_finished' : "4064",
        'live_stream_finished_title' : "4065",
        'live_stream_unavailable' : "4066",
        'live_stream_unavailable_after_payment' : "4067",
        'long_before_flight_time' : "4068",
        'lost_connection' : "4069",
        'no_connection_player' : "4070",
        'no_connection_video' : "4071",
        'no_movie_specified_for_labels' : "4072",
        'no_query_string_code' : "4073",
        'ppv_already_paid' : "4074",
        'ppv_cancel_purchase' : "4075",
        'ppv_change_mind' : "4076",
        'ppv_checkout_error' : "4077",
        'ppv_default_message' : "4078",
        'ppv_is_expired' : "4079",
        'ppv_needs_to_pay' : "4080",
        'ppv_needs_to_pay_at_start' : "4081",
        'ppv_no_more_plays_today' : "4082",
        'ppv_prepurchase' : "4083",
        'ppv_prepurchase_thank_you' : "4084",
        'ppv_purchase_in_progress' : "4085",
        'ppv_support_message' : "4086",
        'ppv_view_unauthorized' : "4087",
        'ppv_watch_video' : "4088",
        'processing_content' : "4089",
        'proxy_classes_dont_work' : "4090",
        'removed_content' : "4091",
        'sas_auth_failed' : "4092",
        'sas_heartbeat_failed' : "4093",
        'sas_too_many_active_streams' : "4094",
        'secure_streaming_auth_failed' : "4095",
        'standalone_ad_set_is_empty' : "4096",
        'stream_file_not_found' : "4098",
        'token_expired' : "4099",
        'unauthorized_device' : "4100",
        'unauthorized_domain' : "4101",
        'unauthorized_dynamic_channel' : "4102",
        'unauthorized_location' : "4103",
        'unauthorized_parent' : "4104",
        'unauthorized_pay_per_view' : "4105",
        'unauthorized_usage' : "4106",
        'unknown_account' : "4107",
        'unknown_content' : "4108",
        'unknown_domain' : "4109",
        'unknown_sas_content' : "4110",
        'version' : "4111",
        'version_not_supported' : "4112",
        'version_upgrade_link' : "4113",
        'version_upgrade_text' : "4114"

    };


   // var youboraCommunicationsMap = new YouboraCommunicationsMap();

    // A constructor for the module class
    // will be called by the player to create an instance of the module
    // First parameter is a reference to a message bus object, which
    // is required to be able to pub/sub to player events.
    // Second parameter is a unique id assigned to the module for 
    // debugging purposes
    SmartPlugin.SmartPluginAnalytics = function (mb, id) {

        
        messageBusMap[id] = mb;

        /*this.mb = mb; // save message bus reference for later use
        this.id = id;*/
        videoDuration = NaN;
        playing = false;
        mb.publish(OO.EVENTS.EMBED_CODE_CHANGED);
        this.init(id); // subscribe to relevant events  
     
    };

    playerList = new Array(),
    playerList.length=0;

    //Looks for players thta match one Id
    //if the video is already in the playerList, we have already
    //visited that video, this means that the video already has its
    //identifier set. When wefind a new video, we stop looking.
    SmartPlugin.setUpOoyala = function ( currentTry,id ) {
        try
        {
            var context = this;
            var maxTries    = 5;
            var tryInterval = 1;

            //Try to get the player up to maxTries times
            //If it fails the plugin will not be loaded
            if(currentTry<maxTries)
            {
                try
                {
                    setTimeout(function(){ 
                        
                        for (var key in OO.__internal.players) {

                            var playerId = OO.__internal.players[key].elementId;       
                            
                            if(playerList[playerId] == undefined){
                                playerList[playerId]=true;
                                playerList.length++;
                                SmartPlugin.nameMap[id] = playerId;
                                context.initializeYouboraCommunications(id);
                                break;
                            }                                 
                        }
                        if(playerList.length == 0){
                            currentTry  = currentTry + 1;
                            SmartPlugin.setUpOoyala(currentTry,id);
                        }
                       
                       
                        

                    }, tryInterval);
                }
                catch(err)
                {
                    console.log(err);
                    currentTry  = currentTry + 1;
                    SmartPlugin.setUpOoyala(currentTry,id);
                }
            }
        }
        catch(err)
        {
            console.log( "SmartPlugin :: Error while get video object" );
            console.log(err);
        }

    };

    SmartPlugin.initializeYouboraCommunications = function(id){
        try{
            var playerId =  SmartPlugin.nameMap[id];
            var youboraData = getYouboraData(id);
            //convinience variable to set the username.Used for uniformity issue with the  Nice264Communications
            var bandwidth ={};
            system = youboraData.getAccountCode();
            username =   youboraData.getUsername();
            metadata =  youboraData.getProperties();
            service =    youboraData.getService();
            bandwidth.username = username;
            isLive = youboraData.getLive();
            
            SmartPlugin.youboraCommunicationsMap[id] =  new YouboraCommunication(youboraData.getAccountCode() , service ,  bandwidth , pluginVersion , targetDevice,playerId);
                        //communications = new YouboraCommunication(youboraData.getAccountCode() , service ,  bandwidth , pluginVersion , targetDevice,playerId);

            pamPingTime = SmartPlugin.youboraCommunicationsMap[id].getPingTime();
                       
            if(pamPingTime == 0){
                pamPingTime =5000;
            }

    }catch(err){
        console.log(err);
    }


    };

    // public functions of the module object
    SmartPlugin.SmartPluginAnalytics.prototype = {

        init: function (id) {
            SmartPlugin.setUpOoyala(0,id); 
            var mb = messageBusMap[id];
            var context = this;

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

            }
            catch(err)
            {
                console.log(err);
            }

            // subscribe to relevant player events

         /* mb.subscribe("*", 
                id,
                function(eventName, arg1,arg2,arg3,arg4,arg5){
                    context.eventDebug(eventName, arg1,arg2,arg3,arg4,arg5,id);
                });
            */
             
                //this.eventDebug);
            try{


                mb.subscribe(OO.EVENTS.PLAYER_CREATED, 
                    id,
                    function(eventName,payload){
                        context.onPlayerCreate(eventName,payload,id);
                    });

                mb.subscribe(OO.EVENTS.PAUSED,
                    id,
                    function(eventName){
                        context.onPauseHandler(eventName,id);
                    });

                mb.subscribe(OO.EVENTS.PLAYING,
                    id, 
                    function(eventName){
                        context.onPlayingHandler(eventName,id);
                    });

                //This event is called only in HTML5
                mb.subscribe(OO.EVENTS.AUTHORIZATION_FETCHED,
                    id,
                    function(eventName,mediaData){
                        context.onAuthorizationFetched(eventName,mediaData,id);
                    });

                mb.subscribe(OO.EVENTS.PLAYED,
                    id, 
                    function(eventName){
                        context.onStopHandler(eventName,id);
                    });

                mb.subscribe(OO.EVENTS.ERROR,
                    id, 
                    function(eventName,errorCode){
                        context.onErrorHandler(eventName,errorCode,id);
                    });

                mb.subscribe(OO.EVENTS.PLAY,
                    id, 
                    function(eventName){
                        context.onPlayHandler(eventName,id);
                    });

                mb.subscribe(OO.EVENTS.BUFFERED,
                    id, 
                    function(eventName,streamUrl){
                        context.onBufferedHandler(eventName,streamUrl,id);
                    });

                mb.subscribe(OO.EVENTS.BUFFERING, 
                    id,
                    function(eventName){
                        context.onBufferingHandler(eventName,id);
                     });

                mb.subscribe(OO.EVENTS.PLAYBACK_READY,
                    id,
                    function(eventName,errorCode){
                        context.onPlaybackReadyHandler(eventName,errorCode,id);
                    });
                       
                mb.subscribe(OO.EVENTS.PLAYHEAD_TIME_CHANGED,
                    id, 
                    function(eventName, time, duration, bufferName){
                        context.onPlayheadChangedHandler(eventName,time,duration,bufferName,id);
                    });  

                mb.subscribe(OO.EVENTS.SEEK, 
                    id,
                    function(eventName, secondsToSeek){
                        context.onSeekHandler(eventName,secondsToSeek,id);
                    });

                mb.subscribe(OO.EVENTS.SCRUBBED, 
                    id,
                    function(eventName, secondsToSeek){
                        context.onSeekHandler(eventName,secondsToSeek,id);
                    });            

                mb.subscribe(OO.EVENTS.EMBED_CODE_CHANGED, 
                    id,
                    function(eventName,embedCode, params){
                        context.onEmbedCodeChanged(eventName, embedCode,params,id);
                    });

                //This event is jut called in flash
                mb.subscribe(OO.EVENTS.BITRATE_CHANGED,
                    id,
                    function(eventName, bitrateObject){
                        context.onBitrateChanged(eventName,bitrateObject,id);
                    });    

                //This event is only called in HTML5
                mb.subscribe(OO.EVENTS.PRELOAD_STREAM,
                    id,
                    function(eventName,resourceUrl){
                        context.onPreloadStream(eventName,resourceUrl,id);
                    });

                mb.subscribe(OO.EVENTS.DOWNLOADING, 
                    id,
                    function(eventName, arg1,arg2,arg3,arg4,mediaResource){
                        context.onDownloading(eventName, arg1,arg2,arg3,arg4,mediaResource,id);
                    });
                
                mb.subscribe(OO.EVENTS.CONTENT_TREE_FETCHED, 
                    id,
                    function(eventName, contentTree){
                        context.onContentTreeFetchedHandler(eventName, contentTree,id);
                     });

                mb.subscribe(OO.EVENTS.ADS_PLAYED, 
                    id,
                    function(eventName){
                        context.adsPlayed(eventName,id);
                     });

                mb.subscribe(OO.EVENTS.WILL_PLAY_ADS, 
                    id,
                    function(eventName){
                        context.adsWillPlay(eventName,id);
                     });

                mb.subscribe(OO.EVENTS.WILL_PLAY_SINGLE_AD, 
                    id,
                    function(eventName){
                        context.adsWillPlay(eventName,id);
                     });

                mb.subscribe(OO.EVENTS.WILL_PLAY, 
                    id,
                    function(eventName){
                        context.videoWillPlay(eventName,id);
                     });

                mb.subscribe(OO.EVENTS.ADS_PLAYED,
                    id, 
                    function(eventName){
                        context.adsPlayed(eventname,id);
                    });

                mb.subscribe(OO.EVENTS.WILL_PLAY_ADS,
                    id, 
                    function(eventName){
                        context.adsWillPlay(eventName,id);
                    });

                mb.subscribe(OO.EVENTS.WILL_PLAY_SINGLE_AD,
                    id,
                    function(eventName){
                        context.adsWillPlay(eventName,id);
                    });

                mb.subscribe(OO.EVENTS.WILL_PLAY,
                    id,
                    function(eventName){
                        context.videoWillPlay(eventName,id);
                    });

                 mb.subscribe(OO.EVENTS.PLAY_STREAM,
                    id,
                    function(eventName){
                        context.onPlayStreamHandler(eventName,id);
                    });

               /* this.mb.subscribe("playStream",
                    id,
                    function(eventName){
                        console.log("IN THE LISTENER!");
                        context.onPlayStreamHandler(id);
                    });
*/


            }catch(err){
                console.log(err);
            }
         
        },

       

        // Handles the PLAYER_CREATED event
        // First parameter is the event name
        // Second parameter is the elementId of player container
        // Third parameter is the list of parameters which were passed into
        // player upon creation.
        onPlayerCreate: function (event, playerName, id) {         
           
            //Nothing to do here
               
        },

        onDownloading : function(event,arg1,arg2,arg3,arg4,mediaResource,id){

            if(resource=="" || resource==undefined){
                resource = mediaResource;
            }

            // Only for FLASH Plugin, because HTML5 load before play!!
            if ( isFlashPlugin )
            {
                readyForSendStart (id);
            }

        },

        onPlayStreamHandler : function(event,id){
            if ( isFlashPlugin == false )
            {
                readyForSendStart(id);
            }
        },

        eventDebug : function (event, arg1,arg2,arg3,arg4,arg5,id){
            console.log("Nice264Debug       " +event + " : id " + id );
         /*   console.log(arg1);
            console.log(arg2);
            console.log(arg3);
            console.log(arg4);
            console.log(arg5);*/
        },

        onContentTreeFetchedHandler : function(event, contentTree , id){
            videoTitle =  contentTree.title;
            var youboraData = getYouboraData(id);  
            try{
                if(youboraData.properties.content_metadata.title=="" || youboraData.properties.content_metadata.title==undefined){
                    youboraData.properties.content_metadata.title = contentTree.title;
                }
            }catch(err){        
                console.log(err);
            }
            try{
                if(!isFlashPlugin){
                    videoDuration = (contentTree.duration)/1000;
                }else{
                    videoDuration = contentTree.time;
                }
             }catch(err){
                console.log(err);
             }
        },

        adsWillPlay: function ( event ,id)
        {
            activeAdsense = true;
        },

        adsPlayed: function ( event ,id )
        {
            activeAdsense = false;
        },

        videoWillPlay: function ( event, id )
        {

        },

        onBitrateChanged : function(event, bitrateObject,id){
            //Information available only for videoBitrate
            bitrate = bitrateObject.videoBitrate;
        },
        
        onAuthorizationFetched: function(event,mediaData,id){
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
        onPreloadStream : function(event,resourceUrl,id){
            resource = resourceUrl;
        },

        onPlayingHandler : function(event,id){
           
            if (!isJoinEventSent && !isBufferRunning)
             {
                 isBufferRunning = true;
                 join(SmartPluginAnalyticsEvents.BUFFER_BEGIN);
             }

          
            if ( activeAdsense == false )
            {
                if (isStartEventSent)
                {
                    if(isStartEventSent && isPauseEventSent){
                        isPauseEventSent = false;
                        resume(id);
                    }
                }
                else
                {
                    isStartEventSent = true;
                    start(id);
                }    

                if (isStartEventSent && !isJoinEventSent && isBufferRunning)
                {
                    //sometimes the player won't call onBuffered, this is 
                    //a workaorund
                   
                    join(SmartPluginAnalyticsEvents.BUFFER_END,id);
                    isBufferRunning = false;
                    join(SmartPluginAnalyticsEvents.JOIN_SEND,id);
                }
                
                else if(isStartEventSent && isJoinEventSent && isBufferRunning && !seek1){
                    buffer(SmartPluginAnalyticsEvents.BUFFER_END,id);   
                    seek1 = false;                 
                }
                
            }
            else
            {
                bufferCounter   = 0;
                isBufferRunning = false;
               
            }
            seek1 = false;

        },
        onPauseHandler : function(event,id){

            if(isStartEventSent && !isPauseEventSent){
                isPauseEventSent = true;
                SmartPlugin.youboraCommunicationsMap[id].sendPause();
            }
        },
        onStopHandler : function(event,id){
            if (!isStopEventSent)
            {
                isStopEventSent = true;
                stop(id);
            }
        },
        onErrorHandler : function(event,errorCode,id){
            error(errorCode.code,id);
           
            if (!isStopEventSent)
            {
                isStopEventSent = true;
                stop(id);
            }
        },

        onPlayHandler: function (event,id)
        {
           //  console.log(SmartPlugin.isBufferRunning)
            if (!isJoinEventSent && !isBufferRunning)
            {
                isBufferRunning = true;
                join(SmartPluginAnalyticsEvents.BUFFER_BEGIN,id);
            }

            // Event Play is only for HTML5 Player
          /* if ( isFlashPlugin == false )
            {
                readyForSendStart(id);
            }*/
        },

        onBufferingHandler:function(event,id)
        {
            if (!isJoinEventSent && !isBufferRunning)
            {
                isBufferRunning = true;
                join(SmartPluginAnalyticsEvents.BUFFER_BEGIN,id);
            }
            else if ( isJoinEventSent && !isBufferRunning )
            {                        
                if ( !seek1 )
                {
                    isBufferRunning = true;
                    buffer(SmartPluginAnalyticsEvents.BUFFER_BEGIN,id);
                }
            }
        },

        onBufferedHandler : function(event,streamUrl,id){
            if (!isJoinEventSent && isBufferRunning)
            {
                join(SmartPluginAnalyticsEvents.BUFFER_END,id);
                isBufferRunning=false;
            }
        },

        onPlaybackReadyHandler : function(event,errorCode,id){
            
             if(!isFlashPlugin){   
                for(var i=0; i< document.getElementsByTagName('video').length;i++){
                    var player = document.getElementsByTagName('video')[i];
                    
                    if(player.parentNode.parentNode.id == SmartPlugin.nameMap[id]){
                        //Not ads
                        if(player.className!="midroll"){
                            SmartPlugin.players[id] = player;
                        }                     
                    }
                }
            }

        },
        onSeekHandler : function(event,secondsToSeek,id){
            seek1 = true;
        },
        onEmbedCodeChanged : function(event,embedCode,params,id){
            try{
                videoDuration = embedCode.time;
            }
            catch(err){
                console.log(err);
            }
        },

        
        onPlayheadChangedHandler: function (event, time, duration, bufferName, id) 
        {

            if(videoDuration == null || videoDuration == undefined || videoDuration == NaN)
            {
                videoDuration = duration;
            }

            playTime =  Math.round(time);

            if (!isJoinEventSent && isBufferRunning)
            {
                join(SmartPluginAnalyticsEvents.BUFFER_END,id);
                isBufferRunning = false;
                join(SmartPluginAnalyticsEvents.JOIN_SEND,id);
            }
            if (isBufferRunning)
            {
                buffer(SmartPluginAnalyticsEvents.BUFFER_END,id);
                isBufferRunning = false;
             
            }
            

          
            
        },

        adsWillPlay: function ( event , id )
        {
            activeAdsense = true;
        },
        adsPlayed: function ( event , id )
        {
            activeAdsense = false;

        },
        videoWillPlay: function ( event , id )
        {

        },
        
        __end_marker: true
    };

    // Send Start if know resource
    function readyForSendStart (id)
    {

        if ( activeAdsense == false )
        {
            if ( isStartEventSent == false )
            {
                if ( resource != "" )
                {
                    isStartEventSent = true;
                    start(id);
                }
            }   
        }
    }


    function reset(){

            isStopEventSent = false;
            isStartEventSent = false;
            isJoinEventSent = false;
            isBufferRunning = false;
            isPauseEventSent = false;
            bufferTimeBegin = 0;
            joinTimeBegin = 0;
            joinTimeEnd = 0;

            activeAdsense = false;

            clearTimeout(pingTimer);
            pingTimer = null;
            lastPingTime = 0;
            diffTime = 0;

            clearTimeout(bufferTimer);

            //updateCode();
       
    }

    function join(bufferState,id)
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

            //This means it has been a mistake or no join event has ever happened

            if(joinTimeBegin == 0 )
            {
                joinTimeTotal = 10;
            }

            if(playTime == undefined)
            {
                playTime=0;
            }

            SmartPlugin.youboraCommunicationsMap[id].sendJoin(Math.round(playTime),joinTimeTotal);
        }
    };

    function start(id){
        var youboraData = getYouboraData(id);

        //If the title is not set in the metadata, get it from the player
        if(youboraData.properties.content_metadata.title=="" || youboraData.properties.content_metadata.title==undefined){
           youboraData.properties.content_metadata.title = videoTitle;
        }
        try{
            var d = new Date();
            isLive = youboraData.getLive();
            SmartPlugin.youboraCommunicationsMap[id].sendStart ( 0 , window.location.href , getMetadata(id) , isLive ,  resource, videoDuration, youboraData.getTransaction());
            pamPingTime = SmartPlugin.youboraCommunicationsMap[id].getPingTime();
            //communications.sendStart ( 0 , window.location.href , getMetadata(id) , isLive ,  resource, videoDuration, youboraData.getTransaction());
            setPing(id);
            if(!isFlashPlugin){
                setBufferCheck(id);
            }
            lastPingTime = d.getTime();

        }catch(err){
            console.log(err);
        }

        
    };
    function setBufferCheck (id)
    {
        bufferCheckTimer = setTimeout(function(){ bufferCheck(id); }, 250);

    };
    function bufferCheck(id){
        if(lastTime >= SmartPlugin.players[id].currentTime && !isPauseEventSent && !isBufferRunning && !seek1){
            buffer(SmartPluginAnalyticsEvents.BUFFER_BEGIN,id);
            isBufferRunning=true;
        }
        lastTime = SmartPlugin.players[id].currentTime;
        //console.log(SmartPlugin.players[id]);
       
        setBufferCheck(id);
    }
    function setPing (id)
    {
        pingTimer = setTimeout(function(){ ping(id); }, pamPingTime);
    };
    function ping(id)
    {
        var d = new Date();

        clearTimeout(pingTimer);
        try{

             if(activeAdsense){
                SmartPlugin.youboraCommunicationsMap[id].sendPingTotalBitrate(lastBitrate,lastPingTime);
              //  communications.sendPingTotalBitrate(lastBitrate,lastPingTime);
            }else{
                SmartPlugin.youboraCommunicationsMap[id].sendPingTotalBitrate(getBitrate(),Math.round(playTime));
                lastPingTime =  Math.round(playTime);
                lastBitrate = getBitrate();
            }


            setPing(id);
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
    function getMetadata(id){
        var youboraData = getYouboraData(id);
        var jsonObj = JSON.stringify(youboraData.getProperties());
        var metadata = encodeURI(jsonObj);

        return metadata;
    };

    function resume(id)
    {
        SmartPlugin.youboraCommunicationsMap[id].sendResume();
    };
    function stop(id)
    {
        SmartPlugin.youboraCommunicationsMap[id].sendStop();
        clearTimeout(pingTimer);
        pingTimer = null;

        reset();
    };
    function buffer(bufferState,id)
    {
       // console.log("INSIDE BUFFER , state : " + bufferState + " , " + id +" ,bufferTimeBegin " + SmartPlugin.bufferTimeBegin[id]);
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

            SmartPlugin.youboraCommunicationsMap[id].sendBuffer(Math.round(playTime) ,bufferTimeTotal );
        }
        //console.log("Leaving buffer :, SmartPlugin.bufferTimeBegin[id] " + SmartPlugin.bufferTimeBegin[id]);

    };
    function error(errorCode,id)
    {
        errorCode = errorCode.toLowerCase();
        var errorCodeYoubora = SmartPluginError[errorCode];
        if(errorCodeYoubora==undefined){
            errorCodeYoubora = errorCodeYoubora;
        }
        SmartPlugin.youboraCommunicationsMap[id].sendErrorWithParameters(errorCodeYoubora, "", 0, window.location.href, getMetadata(), isLive, resource, videoDuration, youboraData.getTransaction());
        clearTimeout(pingTimer);
        pingTimer = null;


        /*SmartPlugin.youboraCommunicationsMap[id].sendError(errorCode,"");
        clearTimeout(pingTimer);
        pingTimer = null;*/
    };

    function getYouboraData (id) {

        try {
             if ( typeof youboraDataMap == undefined){
                    return youboraData;
            }else{
                    return youboraDataMap.get(SmartPlugin.nameMap[id]);
            }
        } catch (err) {
            if (this.debug) { console.log("YouboraCommunication :: Error Msg: " + err);  }
        }
    }

    // Return the constructor of the module class.
    // This is required so that Ooyala's player can instantiate the custom
    // module correctly.
    return SmartPlugin.SmartPluginAnalytics;
});
