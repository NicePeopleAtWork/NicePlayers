/*
 * Nice264 Ooyala Plugins package
 * Copyright (c) 2013 NicePeopleAtWork
 * Author: Luis Miguel Lainez
 * Version: 2.3.0
 */

OO.plugin("SmartPlugin", function (playerId) {

    var SmartPlugin = {};

    var player={};
    var service = "";
    var system = "";
    var metadata = {};
    var username="";
          
    // active adsense
    var activeAdsense = false;
    var platform      = null;
    var isFlashPlugin = false;
                 
    // configuration
   // var pluginVersion = "2.0.1.0_ooyala";
    var pluginVersion = "2.3.1.0_ooyala";
    var targetDevice = "HTML5_OoyalaPlayer";
   
    //seek status
    var videoDuration=NaN;


    var abstractPlugin = new NiceAbstractPlugin(youboraData);

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

                //console.log ( " * Is Flash Plugin: " + isFlashPlugin );
            }
            catch(err)
            {
                console.log(err);
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

        onDownloading : function(event,arg1,arg2,arg3,arg4,mediaResource)
        {
            if(abstractPlugin.getResource() =="" || abstractPlugin.getResource() ==undefined)
            {
               abstractPlugin.setResource( mediaResource);
            }

            // Only for FLASH Plugin, because HTML5 load before play!!
            if ( isFlashPlugin )
            {
                readyForSendStart ();
            }
        },

        eventDebug : function (event, arg1,arg2,arg3,arg4,arg5){
            console.log("       " +event + " : " );
            console.log(arg1);
            console.log(arg2);
            console.log(arg3);
            console.log(arg4);
            console.log(arg5);
        },

        onContentTreeFetchedHandler : function(event, contentTree){  
            try{
                if(youboraData.properties.content_metadata.title==""){
                    youboraData.properties.content_metadata.title = contentTree.title;
                }

            }catch(err){
                console.log(err);
            }
            try{
                if(!isFlashPlugin){
                    abstractPlugin.setDuration((contentTree.duration/1000));
                }else{
                    abstractPlugin.setDuration(contentTree.time);
                }
             }catch(err){
                console.log(err);
             }
        },

        onBitrateChanged : function(event, bitrateObject){
            //Information available only for videoBitrate
             abstractPlugin.setBitrate( bitrateObject.videoBitrate *1024);
        },

        onBitrateChanged : function(event, bitrateInfo){
            try{
                abstractPlugin.setBitrate(bitrateInfo.videoBitrate *1024);
             
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
                        abstractPlugin.setBitrate(mediaData.streams[0].video_bitrate *1024);
                    }
                }
            }catch(err){};
        },
        //This event is only called in HTML5
        onPreloadStream : function(event,resourceUrl){
            abstractPlugin.setResource(resourceUrl);
        },

        onPlayingHandler : function(event){
             abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.PLAY);
        },
   
        onPauseHandler : function(event){
            abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.PAUSE );
           
        },
        onStopHandler : function(event){
            abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.STOP );
           
        },
        onErrorHandler : function(event,errorCode){
            error(errorCode.code);
            abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.STOP );
        },

        onPlayHandler: function (event)
        {

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
            abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.BUFFER_INI );
           
        },

        onBufferedHandler : function(event,streamUrl){
              abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.BUFFER_END );
           
        },

        onPlaybackReadyHandler : function(event,errorCode){

            // Don't use in this version

        },

        onSeekHandler : function(event,secondsToSeek){
            abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.SEEK_INIT );
        },
 	    onEmbedCodeChanged : function(event,embedCode,params){
            try{
                
                videoDuration = embedCode.time;
		        abstractPlugin.setPluginVersion(pluginVersion);
                abstractPlugin.setTargetDevice(targetDevice);
                abstractPlugin.setDuration (embedCode.time);
                abstractPlugin.setCurrentTime(0);
                abstractPlugin.setLive(youboraData.getLive());

                abstractPlugin.init();
            }
            catch(err){
                console.log(err);
            }
        },
        onPlayheadChangedHandler: function (event, time, duration, bufferName) 
        {
           //   abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.PLAY );
            if((videoDuration == null || videoDuration == 'undefinded' || videoDuration == NaN) && activeAdsense == false)
            {
                abstractPlugin.setDuration(duration);
                videoDuration = duration;
            }
            playTime =  Math.round(time);
            abstractPlugin.setCurrentTime(playTime);
        },
        adsWillPlay: function ( event )
        {
            abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.AD_START );

        },
        adsPlayed: function ( event )
        {
            abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.AD_END );
        },
        videoWillPlay: function ( event )
        {

        }, 
      
    };

    // Send Start if know resource
    function readyForSendStart ()
    {
        if ( activeAdsense == false )
        {
            abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.PLAY );      
        }
    }

   
    function join(bufferState)
    {
       
    };

    function start(){
      
        
    };
   
   
    function getMetadata(){
        var jsonObj = JSON.stringify(youboraData.getProperties());
        var metadata = encodeURI(jsonObj);

        return metadata;
    };

  
    function error(errorCode)
    {
        errorCode = errorCode.toLowerCase();
        var errorCodeYoubora = SmartPluginError[errorCode];
        if(errorCodeYoubora==undefined){
            errorCodeYoubora = errorCode;
        }
        abstractPlugin.setErrorCode(errorCodeYoubora);
        abstractPlugin.setErrorMsg(errorCode);
        abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.ERROR );      

    };

    // Return the constructor of the module class.
    // This is required so that Ooyala's player can instantiate the custom
    // module correctly.
    return SmartPlugin.SmartPluginAnalytics;
});
