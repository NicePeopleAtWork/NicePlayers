/*
 * YouboraPlugin
 * Copyright (c) 2015 NicePeopleAtWork
 */

function loadYouboraPlugin ( nameSpaces ) {

    for (currentNameSpace in nameSpaces) {

        var ooyalaCurrentNameSpace = eval(currentNameSpace);

        ooyalaCurrentNameSpace.plugin("YouboraPlugin", function (_OO, _, $, W) {

            var YouboraPlugin   = {};
            var player          = {};
            var youboraData     = null;
            var ooyalaEvents    = {};

            var YouboraPluginAnalyticsEvents = {
                BUFFER_BEGIN: 1,
                BUFFER_END: 0,
                JOIN_SEND: 2
            };

            var playerId        = "default";
            var pluginType      = "Ooyala";
            var thisOO          = _OO;
            var communications  = null;
            var nameSpace;
                  
            // active adsense
            var activeAdsense = false;
            var platform      = null;
            var isFlashPlugin = false;
            var isAndroidOrIOSPlugin = false;
                         
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

            // ping
            var pamPingTime = 0;
            var lastPingTime = 0;
            var diffTime = 0;
            var pingTimer = null;
            var lastBitrate = -1;

            // buffer
            var lastCurrentTime = 0;

            //seek status
            var seekEvent = false;
            var playTime=0;
            var videoDuration=NaN;
            var playing=false;

            //convinience variable to set the username.Used for uniformity issue with the  Nice264Communications
            var bandwidth ={};

            //Mthod to control the buffering in html, by listening sequences of progress-timeUpdate
            var progressCount=0;

            var bufferCheckTimer={};
            var lastTime=0;

            var YouboraPluginError =  {
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
            YouboraPlugin.SmartPluginAnalytics = function (mb, id) {
                this.mb = mb; // save message bus reference for later use
                this.id = id;

                videoDuration = NaN;
                playing = false;

                this.init(); // subscribe to relevant events              
            };

            // public functions of the module object
            YouboraPlugin.SmartPluginAnalytics.prototype = {
                init: function () 
                {
                    var nameSpace = "";

                    try {
                        nameSpace = eval(thisOO.playerParams.namespace);
                    } catch(err) {
                        nameSpace = OO;
                    }

                    try {
                        youboraData = new YouboraPlugin.YouboraData();
                    }
                    catch(err) { console.log(err); }

                    try {
                        platform = nameSpace.__internal.playerParams.platform;

                        if ( platform.indexOf("flash") > -1 ) {
                            isFlashPlugin = true;
                        } else {
                            isFlashPlugin = false;
                        }

                        var isAndroid   = ( nameSpace.__internal.isAndroid == true || 
                                            nameSpace.__internal.isAndroid4Plus == true );
                        var isIos       = ( nameSpace.__internal.isIos == true || 
                                            nameSpace.__internal.isIpad == true || 
                                            nameSpace.__internal.isIphone == true );

                        isAndroidOrIOSPlugin = isAndroid || isIos;
                    }
                    catch(err) { console.log(err); }

                    try {
                        //if ( youboraData.debug ) {
                            // subscribe to relevant player events
                            this.mb.subscribe("*", 'YouboraAnalytics',
                                this.eventDebug);
                        //}
                    }
                    catch(err) { console.log(err); }

                    try {
                        this.ooyalaEvents = nameSpace.EVENTS;
                    }
                    catch(err) { console.log(err); }

                    try {

                        this.mb.subscribe(nameSpace.EVENTS.PLAYER_CREATED, 
                            'YouboraAnalytics', this.onPlayerCreate);

                        this.mb.subscribe(nameSpace.EVENTS.PAUSED,
                            'YouboraAnalytics', this.onPauseHandler, this);

                        this.mb.subscribe(nameSpace.EVENTS.STREAM_PAUSED,
                            'YouboraAnalytics', this.onPauseHandler, this);

                        this.mb.subscribe(nameSpace.EVENTS.PLAYING,
                            'YouboraAnalytics', this.onPlayingHandler, this);

                        this.mb.subscribe(nameSpace.EVENTS.STREAM_PLAYING,
                            'YouboraAnalytics', this.onPlayingHandler, this);

                        //This event is called only in HTML5
                        this.mb.subscribe(nameSpace.EVENTS.AUTHORIZATION_FETCHED,
                            'YouboraAnalytics', this.onAuthorizationFetched, this);

                        this.mb.subscribe(nameSpace.EVENTS.PLAYED,
                            'YouboraAnalytics', this.onStopHandler, this);

                        this.mb.subscribe(nameSpace.EVENTS.STREAM_PLAYED,
                            'YouboraAnalytics', this.onStopHandler, this);

                        this.mb.subscribe(nameSpace.EVENTS.ERROR,
                            'YouboraAnalytics', this.onErrorHandler);

                        this.mb.subscribe(nameSpace.EVENTS.PLAY,
                            'YouboraAnalytics', this.onPlayHandler);

                        this.mb.subscribe(nameSpace.EVENTS.PLAY_STREAM,
                            'YouboraAnalytics', this.onPlayStreamHandler);

                        this.mb.subscribe(nameSpace.EVENTS.BUFFERED,
                            'YouboraAnalytics', this.onBufferedHandler);

                        this.mb.subscribe(nameSpace.EVENTS.BUFFERING,
                            'YouboraAnalytics', this.onBufferingHandler);

                        this.mb.subscribe(nameSpace.EVENTS.PLAYBACK_READY,
                            'YouboraAnalytics', this.onPlaybackReadyHandler);
                               
                        this.mb.subscribe(nameSpace.EVENTS.PLAYHEAD_TIME_CHANGED,
                            'YouboraAnalytics', this.onPlayheadChangedHandler);

                        this.mb.subscribe(nameSpace.EVENTS.SEEK,
                            'YouboraAnalytics', this.onSeekHandler);

                        this.mb.subscribe(nameSpace.EVENTS.SCRUBBING,
                            'YouboraAnalytics', this.onSeekHandler);

                        this.mb.subscribe(nameSpace.EVENTS.SCRUBBED,
                            'YouboraAnalytics', this.onSeekHandler);

                        this.mb.subscribe(nameSpace.EVENTS.EMBED_CODE_CHANGED,
                            'YouboraAnalytics', this.onEmbedCodeChanged, this); 

                        //This event is jut called in flash
                        this.mb.subscribe(nameSpace.EVENTS.BITRATE_CHANGED,
                           'YouboraAnalytics', this.onBitrateChanged, this);    

                        //This event is only called in HTML5
                        this.mb.subscribe(nameSpace.EVENTS.PRELOAD_STREAM,
                            'YouboraAnalytics', this.onPreloadStream); 

                        this.mb.subscribe(nameSpace.EVENTS.DOWNLOADING,
                            'YouboraAnalytics', this.onDownloading); 

                        this.mb.subscribe(nameSpace.EVENTS.CONTENT_TREE_FETCHED,
                            'YouboraAnalytics', this.onContentTreeFetchedHandler);

                        this.mb.subscribe(nameSpace.EVENTS.ADS_PLAYED,
                            'YouboraAnalytics', this.adsPlayed);

                        this.mb.subscribe(nameSpace.EVENTS.WILL_PLAY_ADS,
                            'YouboraAnalytics', this.adsWillPlay);

                        this.mb.subscribe(nameSpace.EVENTS.WILL_PLAY_SINGLE_AD,
                            'YouboraAnalytics', this.adsWillPlay);

                        this.mb.subscribe(nameSpace.EVENTS.WILL_PLAY,
                            'YouboraAnalytics', this.videoWillPlay);

                        this.mb.subscribe(nameSpace.EVENTS.METADATA_FETCHED,
                            'YouboraAnalytics', this.metadataFetched);

                        //SmartPlugin.player.addEventListener("waiting",this.onBufferHTML5);
                        //this.mb.subscribe("waiting","YouboraAnalytics",this.onBufferHTML5);

                    }
                    catch(err) { console.log(err); }
                },

                // Handles the PLAYER_CREATED event
                // First parameter is the event name
                // Second parameter is the elementId of player container
                // Third parameter is the list of parameters which were passed into
                // player upon creation.
                onPlayerCreate: function (event, elementId, params) {       
                    if(!isFlashPlugin){   
                        player = document.getElementsByTagName('video')[0];
                    }

                    // Get params
                    if ( params.playerID != undefined ) {
                        playerId = params.playerID;
                        youboraData.playerId = playerId;
                    } else {
                        playerId = "default";
                        youboraData.playerId = playerId;
                    }
                },

                metadataFetched : function(event, response) {
                    try{
                        // AccountCode set by Ooyala
                        if ( response.modules.npaw != undefined ) {
                             youboraData.accountCode = response.modules.npaw.metadata.npaw_account;
                        } else {
                             // TODO if we can't get npaw_account, don't set this param...
                             youboraData.accountCode = "ooyalaqa";
                        }

                        communications          = new YouboraCommunication ( youboraData.accountCode , youboraData.service , pluginVersion , targetDevice , youboraData );
     
                        pamPingTime             = communications.getPingTime();
                           
                        if (pamPingTime == 0) {
                            pamPingTime = 5000;
                        }

                        reset();
                    } catch(err) { console.log(err); }
                },

                onContentTreeFetchedHandler : function(event, contentTree) { 

                    try {
                        if ( youboraData.properties.content_metadata.title == "" ) {
                             youboraData.properties.content_metadata.title = contentTree.title;
                        }
                    } catch(err) { console.log(err); }
                    
                    try {
                        if(!isFlashPlugin) {
                            videoDuration = (contentTree.duration)/1000;
                        }else{
                            videoDuration = contentTree.time;
                        }
                        youboraData.properties.content_metadata.duration = videoDuration;
                    } catch(err) { console.log(err); }
                },
                
                onAuthorizationFetched: function(event,mediaData) {
                    //The mediaData is different in HTML5 and Flash so we need to be careful
                    isLive = false;

                    try { 
                        if(mediaData!=undefined) {
                            if(mediaData.streams[0] != undefined) {
                                bitrate                 = mediaData.streams[0].video_bitrate;

                                if ( mediaData.streams[0].is_live_stream != undefined ) {
                                    youboraData.live    = mediaData.streams[0].is_live_stream;
                                    isLive              = youboraData.live;
                                }
                            }
                        }
                    } catch(err) { console.log(err); }
                },

                onDownloading : function(event,arg1,arg2,arg3,arg4,mediaResource) {
                    if ( resource == "" || resource == undefined ) {
                        resource = mediaResource;
                    }

                    // Only for FLASH Plugin, because HTML5 load before play!!
                    if ( isFlashPlugin ) {
                        readyForSendStart ();
                    }
                },

                onBitrateChanged : function(event, bitrateObject) {
                    //Information available only for videoBitrate
                    try {
                        bitrate = bitrateObject.videoBitrate;
                    } catch(err) { console.log(err); }
                },

                onBitrateChanged : function(event, bitrateInfo) {
                    try {
                        bitrate = bitrateInfo.videoBitrate;
                    } catch(err) { console.log(err); }
                },

                onPreloadStream : function(event,resourceUrl) {
                    //This event is only called in HTML5
                    resource = resourceUrl;
                },

                onPlayingHandler : function(event) {

                    if ( activeAdsense == false )
                    {
                        if (isStartEventSent) {
                            if(isPauseEventSent) {
                                isPauseEventSent = false;
                                resume();
                            }
                        }
                        else {
                            isStartEventSent = true;
                            start();
                        }           

                        if (isStartEventSent && !isJoinEventSent && isBufferRunning && !activeAdsense) {
                            //sometimes the player won't call onBuffered, this is 
                            //a workaorund
                           
                            join(YouboraPluginAnalyticsEvents.BUFFER_END);
                            isBufferRunning = false;
                            join(YouboraPluginAnalyticsEvents.JOIN_SEND);
                        } 
                        else if(isStartEventSent && isJoinEventSent && isBufferRunning && !activeAdsense) {
                            isBufferRunning = false;
                            buffer(YouboraPluginAnalyticsEvents.BUFFER_END,seekEvent);   
                            seekEvent = false;                 
                        }
                    }
                
                    isBufferRunning = false;
                },

                onPlayHandler : function (event) {
                    if (activeAdsense == false ) {
                        if (isStartEventSent == false) {
                            isStartEventSent = true;
                            start();
                        } 
                    } 

                    if (!isJoinEventSent && !isBufferRunning) {
                        isBufferRunning = true;
                        join(YouboraPluginAnalyticsEvents.BUFFER_BEGIN);
                    }
                },

                onPlayStreamHandler : function (event) {
                    if ( isFlashPlugin == false )
                    {
                        if (activeAdsense == false ) {
                            if (isStartEventSent == false) {
                                isStartEventSent = true;
                                start();
                            }  
                        }

                        if (!isJoinEventSent && !isBufferRunning) {
                            isBufferRunning = true;
                            join(YouboraPluginAnalyticsEvents.BUFFER_BEGIN);
                        }

                        readyForSendStart();
                    }
                },

                onBufferingHandler : function(event,arg1,arg2,ar3,arg4) {
                    try{
                        if (!isJoinEventSent && !isBufferRunning)
                        {
                            isBufferRunning = true;
                            join(YouboraPluginAnalyticsEvents.BUFFER_BEGIN);
                        }
                        else if ( isJoinEventSent && !isBufferRunning )
                        {                        
                            if ( !seekEvent )
                            {
                                isBufferRunning = true;
                                buffer(YouboraPluginAnalyticsEvents.BUFFER_BEGIN,seekEvent);
                            }
                            else
                            {
                                isBufferRunning = true;
                                buffer(YouboraPluginAnalyticsEvents.BUFFER_BEGIN,seekEvent);
                            }
                        }
                    } catch(err) { console.log(err); }
                },

                onPlayheadChangedHandler: function (event, time, duration, bufferName) {
                    try {
                        progressCount = 0 ;
                        
                        if((videoDuration == null || videoDuration == 'undefinded' || videoDuration == NaN) && activeAdsense == false)
                        {
                            videoDuration = duration;
                        }

                        playTime = Math.round(time);

                        if (!isJoinEventSent && isBufferRunning && !activeAdsense)
                        {
                            join(YouboraPluginAnalyticsEvents.BUFFER_END);
                            isBufferRunning = false;
                            join(YouboraPluginAnalyticsEvents.JOIN_SEND);
                        }
                        else if(isStartEventSent && isJoinEventSent && isBufferRunning && !activeAdsense)
                        {
                            buffer(YouboraPluginAnalyticsEvents.BUFFER_END,seekEvent);   
                            seekEvent = false;   
                            isBufferRunning = false;       
                        }
                    } catch(err) { console.log(err); }
                },

                onBufferedHandler : function(event,streamUrl) {
                    if (!isJoinEventSent && isBufferRunning && !activeAdsense)
                    {
                        join(YouboraPluginAnalyticsEvents.BUFFER_END);
                    }
                },

                onSeekHandler : function(event,secondsToSeek) {
                    seekEvent = true;
                },

                onPauseHandler : function(event) {
                    if(isStartEventSent && !isPauseEventSent && !seekEvent) {
                        isPauseEventSent = true;
                        communications.sendPause();
                    }
                },

                onStopHandler : function(event) {
                    if (activeAdsense == false) {
                        if (!isStopEventSent) {
                            isStopEventSent = true;
                            stop();
                        }
                    }
                },

                onErrorHandler : function(event,errorCode) {
                    error(errorCode.code);
                    if (!isStopEventSent) {
                        isStopEventSent = true;
                        stop();
                    }
                },

                onPlaybackReadyHandler : function(event,errorCode) {
                    // Don't use in this version
                },

                onEmbedCodeChanged : function(event,embedCode,params) {
                    try{
                        if ( embedCode != undefined ) {
                            videoDuration = embedCode.time;
                            youboraData.properties.content_metadata.duration = videoDuration;
                            resource = "";
                        }

                        if ( isStartEventSent ) {
                            stop();
                        } else {
                            reset();
                        }
                    }
                    catch(err){ console.log(err); }
                },

                adsWillPlay: function ( event ) {
                    activeAdsense = true;
                },

                adsPlayed: function ( event ) {
                    activeAdsense = false;
                },

                videoWillPlay: function ( event ) {

                },

                replayOoyalaEvent: function (data) {
                    console.log("replayOoyalaEvent Event");
                    console.log(data);

                    var eventName   = data.arguments[0]
                    var arguments   = data.arguments;
                    var time        = data.time;
                },

                updateYouboraMetadataContent : function(metadata) {
                    try {
                        console.log(metadata);

                        if ( metadata != undefined ) {
                            if ( metadata.Youbora_accountCode  != undefined )   
                                 youboraData.accountCode = metadata.Youbora_accountCode;

                            if ( metadata.Youbora_username  != undefined )   
                                 youboraData.username    = metadata.Youbora_username;

                            if ( metadata.Youbora_transactionCode  != undefined )   
                                 youboraData.transaction = metadata.Youbora_transactionCode;

                            if ( metadata.Youbora_ip  != undefined )   
                                 youboraData.text_ip = metadata.Youbora_ip;

                            if ( metadata.Youbora_isp  != undefined )   
                                 youboraData.text_isp = metadata.Youbora_isp;

                            if ( metadata.Youbora_cdn  != undefined )   
                                 youboraData.text_cdn = metadata.Youbora_cdn;

                            if ( metadata.properties  != undefined )   
                                 youboraData.properties = metadata.properties;
                        }
                    } catch(err) { console.log(err); }
                },

                setYouboraExtraParams : function (params) {
                    try {
                        console.log(params);

                        if ( params != undefined ) {
                            if ( params.param1  != undefined )   youboraData.extraparams['extraparam1']  = params.param1;
                            if ( params.param2  != undefined )   youboraData.extraparams['extraparam2']  = params.param2;
                            if ( params.param3  != undefined )   youboraData.extraparams['extraparam3']  = params.param3;
                            if ( params.param4  != undefined )   youboraData.extraparams['extraparam4']  = params.param4;
                            if ( params.param5  != undefined )   youboraData.extraparams['extraparam5']  = params.param5;
                            if ( params.param6  != undefined )   youboraData.extraparams['extraparam6']  = params.param6;
                            if ( params.param7  != undefined )   youboraData.extraparams['extraparam7']  = params.param7;
                            if ( params.param8  != undefined )   youboraData.extraparams['extraparam8']  = params.param8;
                            if ( params.param9  != undefined )   youboraData.extraparams['extraparam9']  = params.param9;
                            if ( params.param10 != undefined )   youboraData.extraparams['extraparam10'] = params.param10;
                        }
                    } catch(err) { console.log(err); }
                },

                enableYouboraResume : function(params) {
                    try {
                        console.log(params);

                        youboraData.resumeProperties.resumeEnabled  = true;

                        if ( params.contentId != undefined )        
                             youboraData.contentId = params.contentId;

                        if ( params.resumeCallback != undefined )   
                             youboraData.resumeProperties.resumeCallback = params.resumeCallback; 

                        if ( communications != null )
                             communications.enableResume();
                    } catch(err) { console.log(err); }
                },

                disableYouboraResume : function() {
                    try {
                        youboraData.resumeProperties.resumeEnabled  = false;
                        
                        if ( communications != null )
                             communications.disableResume();
                    } catch(err) { console.log(err); }
                },

                enableYouboraConcurrency : function(params) {
                    try {
                        console.log(params);

                        youboraData.concurrencyProperties.enabled   = true;

                        if ( params.contentId != undefined )            
                             youboraData.contentId = params.contentId;

                        if ( params.concurrencyCode != undefined )      
                             youboraData.concurrencyProperties.contentId = params.concurrencyCode;

                        if ( params.concurrencyMaxCount != undefined )  
                             youboraData.concurrencyProperties.concurrencyMaxCount = params.concurrencyMaxCount;

                        if ( params.concurrencyRedirectUrl != undefined )  
                             youboraData.concurrencyProperties.concurrencyRedirectUrl = params.concurrencyRedirectUrl;

                        if ( params.concurrencyIpMode != undefined )  
                             youboraData.concurrencyProperties.concurrencyIpMode = params.concurrencyIpMode;

                        if ( communications != null )
                             communications.enableConcurrency();
                    } catch(err) { console.log(err); }
                },

                disableYouboraConcurrency : function() {
                    try {
                        youboraData.concurrencyProperties.enabled  = false;

                        if ( communications != null )
                             communications.disableConcurrency();
                    } catch(err) { console.log(err); }
                },

                eventDebug : function (event, arg1,arg2,arg3,arg4,arg5) {         
                    //if ( event != "playheadTimeChanged" && event != "downloading" ) {
                        var currentTime = new Date();
                        var hours = currentTime.getHours();
                        var minutes = currentTime.getMinutes();
                        var seconds = currentTime.getSeconds();
                        var milliseconds = currentTime.getMilliseconds();

                        if (minutes < 10)
                            minutes = "0" + minutes;

                        console.log( hours + ":" + minutes + ":" + seconds + "." + milliseconds + " => " + event  );
                        console.log( "            * " + arg1 + " | " + arg2 + " | " + arg3 + " | " + arg4 + " | " + arg5);
                    //}
                },

                __end_marker: true
            };

            YouboraPlugin.YouboraData = function () 
            {
                try {
                    this.debug = false; 
                    this.playerId = "";
                    this.accountCode = "";
                    this.service = "http://nqs.nice264.com"; 
                    this.username = "default";
                    this.mediaResource = "";
                    this.transaction = ""; 
                    this.live = false; 
                    this.contentId = "";
             
                    this.properties = { 
                        filename: "",
                        content_id: "",
                        content_metadata: {     
                            title: "",
                            genre: "",
                            language: "",
                            year: "",
                            cast: "",
                            director: "",
                            owner: "",
                            duration: "",
                            parental: "",
                            price: "",
                            rating: "",
                            audioType: "",
                            audioChannels: ""
                        },
                        transaction_type: "",
                        quality: "",
                        content_type: "",
                        device: {     
                            manufacturer: "", 
                            type: "",
                            year: "",
                            firmware: "" 
                    }}; 

                    this.concurrencySessionId = Math.random(); 
                    this.concurrencyProperties = { 
                        enabled: false,
                        concurrencyService: "http://pc.youbora.com/cping/",
                        concurrencyCode: "",
                        concurrencyMaxCount: 0,
                        concurrencyRedirectUrl: "",
                        concurrencyIpMode: false
                    };

                    this.resumeProperties = { 
                        resumeEnabled: false,
                        resumeService: "http://pc.youbora.com/resume/",
                        playTimeService: "http://pc.youbora.com/playTime/",
                        resumeCallback: function () {  console.log("YouboraData :: Default Resume Callback"); }
                    };

                    this.extraParams = { 
                        'extraparam1': undefined,
                        'extraparam2': undefined,
                        'extraparam3': undefined,
                        'extraparam4': undefined,
                        'extraparam5': undefined,
                        'extraparam6': undefined,
                        'extraparam7': undefined,
                        'extraparam8': undefined,
                        'extraparam9': undefined,
                        'extraparam10': undefined
                    };

                    this.silverlightMediaElementName = undefined;
                    this.silverlightPlayer = undefined;

                    this.enableAnalytics = true;
                    this.enableBalancer = true;
                    this.cdn_node_data = false;
                    this.hashTitle = true;

                    this.text_cdn = "";
                    this.text_ip = "";
                    this.text_isp = "";

                    this.nqsDebugServiceEnabled = false;
                    this.httpSecure = false;

                    this.init();
                } 
                catch (error) 
                {  
                    console.log("YouboraData :: Error [Function] :: " + err); 
                }
             
            };

            YouboraPlugin.YouboraData.prototype = {
                init: function () 
                {

                },
                redirectFunction: function(url) {
                    window.location = url;
                },
                log: function (message) {
                    if(this.debug == true) {
                        console.log ( "YouboraDataContainer [" + this.playerId + "] Log :: " + message );
                    }
                }
            };

            // Send Start if know resource
            function readyForSendStart ()
            {
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
                isStopEventSent     = false;
                isStartEventSent    = false;
                isJoinEventSent     = false;
                isBufferRunning     = false;
                isPauseEventSent    = false;
                bufferTimeBegin     = 0;
                joinTimeBegin       = 0;
                joinTimeEnd         = 0;

                activeAdsense       = false;

                clearTimeout(pingTimer);
                pingTimer = null;
                lastPingTime = 0;
                diffTime = 0;
            }
            function join(bufferState)
            {
                var d = new Date();
                var joinTimeTotal = 0;
                
                if (bufferState == YouboraPluginAnalyticsEvents.BUFFER_BEGIN)
                {
                    joinTimeBegin = d.getTime();

                }
                else if (bufferState == YouboraPluginAnalyticsEvents.BUFFER_END)
                {
                    joinTimeEnd = d.getTime();

                } 
                else if (bufferState == YouboraPluginAnalyticsEvents.JOIN_SEND && !isJoinEventSent)
                {
                    joinTimeTotal = joinTimeEnd - joinTimeBegin;

                    if ( joinTimeTotal <= 0 ) {
                        joinTimeTotal = 10;
                    }
                
                    if ( playTime == undefined ) {
                        playTime=0;
                    }

                    communications.sendJoin ( Math.round(playTime),joinTimeTotal );

                    isJoinEventSent = true;
                }
            }
            function buffer(bufferState,isSeekEvent)
            {
                var d = new Date();
                var bufferTimeEnd = 0;
                var bufferTimeTotal = 0;

                if (bufferState == YouboraPluginAnalyticsEvents.BUFFER_BEGIN)
                {
                    bufferTimeBegin = d.getTime();
                }
                else if (bufferState == YouboraPluginAnalyticsEvents.BUFFER_END)
                {
                    bufferTimeEnd   = d.getTime();
                    bufferTimeTotal = bufferTimeEnd - bufferTimeBegin;

                    if ( !isSeekEvent ) {
                        communications.sendBuffer ( Math.round(playTime) ,bufferTimeTotal );
                    } else {
                        communications.sendSeek ( Math.round(playTime) ,bufferTimeTotal );
                    }
                }
            }
            function start()
            {
                try{

                    var d = new Date();
                    communications.sendStart ( 0 , window.location.href , getMetadata() , isLive ,  resource, videoDuration, youboraData.transaction);
                    setPing();
                    if(!isFlashPlugin){
                        if(isAndroidOrIOSPlugin) {
                            // Now we can check every second if is Buffering (for Android and iOS devices)
                            setBufferCheck();
                        }
                    }
                    lastPingTime = d.getTime();

                }catch(err){
                    console.log(err);
                }
            }
            function setPing ()
            {
                var context = this;
                pingTimer = setTimeout(function(){ ping(); }, pamPingTime);
            }
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
                    console.log(err);
                }
            }
            function getBitrate()
            {
                if(bitrate==0 || bitrate == undefined){
                    return -1;
                }else{
                    return bitrate * 1024;
                }
            }
            function getMetadata(){

                var jsonObj = JSON.stringify(youboraData.properties);
                var metadata = encodeURI(jsonObj);

                return metadata;
            }
            function resume()
            {
                communications.sendResume();
            }
            function stop()
            {
                communications.sendStop();
                clearTimeout(pingTimer);
                pingTimer = null;

                reset();
            }
            function error(errorCode)
            {
                var errorCodeYoubora = YouboraPluginError[errorCode];
                if ( errorCodeYoubora == undefined ) {
                     errorCodeYoubora = errorCode;
                }
                communications.sendAdvancedError(errorCodeYoubora, pluginType, "", 0, window.location.href, getMetadata(), isLive, resource, videoDuration);
                clearTimeout(pingTimer);
                pingTimer = null;
            }
            function setBufferCheck ()
            {
                // Now we can check every second if is Buffering (for Android and iOS devices)
                bufferCheckTimer = setTimeout(function(){ bufferCheck(); }, 1000);
            }
            function bufferCheck(){
                if ( activeAdsense == false ) {
                    if(lastTime >= player.currentTime && !isPauseEventSent && !isBufferRunning && !seekEvent){
                        buffer(YouboraPluginAnalyticsEvents.BUFFER_BEGIN,false);
                        isBufferRunning = true;
                    }
                    lastTime = player.currentTime;
                }

                setBufferCheck();
            }

            // Return the constructor of the module class.
            // This is required so that Ooyala's player can instantiate the custom
            // module correctly.
            return YouboraPlugin.SmartPluginAnalytics;
        });

    }

}