/*
 * YouboraCommunication 
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Lluís Campos Beltran
 * Version: 3.1.0 
 *  - Full Revision
 */

var SmartPlugin = { 
    // General
    debug: true,
    isLive: youboraData.getLive(), 
    bandwidth: { username: youboraData.getUsername(), interval: 6000},
    targetDevice: "BrightCove-HTML5",
    pluginVersion: "2.2.3",
    initDone: 0,  
    // Media
    mediaEvents: { BUFFER_BEGIN: 1, BUFFER_END: 0, JOIN_SEND: 2 },
    videoPlayer: "",
    experience: "",
    bcvideoplayer: "",
    contentPlayer: "",
    currentTime: 0,
    urlResource: "", 
    duration: 0,
    pingTimer: "",
    apiClass: "",
    encodingRate: 0,
    // Triggers
    isBuffering: false,
    isStartSent: false,
    isPaused: false,
    isJoinSent: false, 
    isStreamError: false,
    bufferTimeBegin: 0,
    previousElapsedTime: 0, 
    joinTimeBegin: 0,
    joinTimeEnd: 0,  
    errorCodes:{
        1 : 2011, //DOMAIN_RESTRICTED
        2 : 2012, //GEO_RESTRICTED
        3 : 2013, //INVALID_ID
        4 : 2014, //NO_CONTENT
        18: 2015, //PE_COMPONENT_CORRUPTED
        14: 2016, //PE_LIVE_UNPUBLISHED
        16: 2017, //PE_REQUIRED_COMPONENT
        17: 2018, //PE_REQUIRED_COMPONENT_CORRUPTED
        8 : 2019, //SERVICE_UNAVAILABLE
        5 : 2020, //UNAVAILABLE_CONTENT
        0 : 2021, //UNKNOWN
        7 : 2022, //UPGRADE_REQUIRED_FOR_PLAYER
        6 : 2023, //UPGRADE_REQUIRED_FOR_VIDEO
        9 : 2024, //VE_FMS_CONNECT_FAILED
        10: 2025, //VE_MOUUNT_NOT_FOUND
        11: 2026, //VE_PD_NOTFOUND
        12: 2027, //VS_RESTRICT_INACTIVE
        13: 2028, //VS_RESTRICT_SCHEDULED
        15: 2029, //VS_SECURITY_VID
        "DOMAIN_RESTRICTED" : 2011, //DOMAIN_RESTRICTED
        "GEO_RESTRICTED" : 2012, //GEO_RESTRICTED
        "INVALID_ID" : 2013, //INVALID_ID
        "NO_CONTENT" : 2014, //NO_CONTENT
        "PE_COMPONENT_CORRUPTED": 2015, //PE_COMPONENT_CORRUPTED
        "PE_LIVE_UNPUBLISHED": 2016, //PE_LIVE_UNPUBLISHED
        "PE_REQUIRED_COMPONENT": 2017, //PE_REQUIRED_COMPONENT
        "PE_REQUIRED_COMPONENT_CORRUPTED": 2018, //PE_REQUIRED_COMPONENT_CORRUPTED
        "SERVICE_UNAVAILABLE" : 2019, //SERVICE_UNAVAILABLE
        "UNAVAILABLE_CONTENT" : 2020, //UNAVAILABLE_CONTENT
        "UNKNOWN" : 2021, 
        "UPGRADE_REQUIRED_FOR_PLAYER" : 2022, //UPGRADE_REQUIRED_FOR_PLAYER
        "UPGRADE_REQUIRED_FOR_VIDEO" : 2023, //UPGRADE_REQUIRED_FOR_VIDEO
        "VE_FMS_CONNECT_FAILED" : 2024, //VE_FMS_CONNECT_FAILED
        "VE_MOUUNT_NOT_FOUND": 2025, //VE_MOUUNT_NOT_FOUND
        "VE_PD_NOTFOUND": 2026, //VE_PD_NOTFOUND
        "VS_RESTRICT_INACTIVE": 2027, //VS_RESTRICT_INACTIVE
        "VS_RESTRICT_SCHEDULED": 2028, //VS_RESTRICT_SCHEDULED
        "VS_SECURITY_VID": 2029  //VS_SECURITY_VID 
    },
    Init: function()
    { 
        SmartPlugin.initDone++;
        try
        { 
            if(SmartPlugin.initDone <= 5) 
            {
                if ( spYoubora.isYouboraApiLoaded () == false ) 
                {
                    if(SmartPlugin.debug)
                    {
                        console.log( "SmartPlugin :: BRIGHTCOVE :: Init :: Api Not Ready...");
                    } 
                    setTimeout("SmartPlugin.Init()",200);
                }
                else 
                {
                    if(SmartPlugin.debug)
                    {
                        console.log( "SmartPlugin :: BRIGHTCOVE :: Init ::");
                    }
                    SmartPlugin.initDone = true;
                    SmartPlugin.getVariables();
                }
            }
            else 
            {
                if(SmartPlugin.debug)
                {
                    console.log( "SmartPlugin :: BRIGHTCOVE :: Init Error :: Unable to reach Api..."); 
                }
            }
        }
        catch(err)
        { 
            if(SmartPlugin.debug)
            {
                console.log( "SmartPlugin :: BRIGHTCOVE :: Init :: Error: " + err );
            }
            spLoaded = false;
        }
    },
    getVariables: function()
    { 
        var Pairs =  window.location.search.substring(1).split(/[;&]/);
 
        for ( var i = 0; i < Pairs.length; i++ ) {
            var KeyVal = Pairs[i].split('='); 
            if ( ! KeyVal || KeyVal.length != 2 ) continue;
            var key = unescape( KeyVal[0] );
            var val = unescape( KeyVal[1] );
            val = val.replace(/\+/g, ' ');  

            if (val == "true") { val = true; }
            if (val == "false") { val = false; }
            if (key == "debug") { youboraData.setDebug(val); }

            if (key == "accountCode") { youboraData.setAccountCode(val); }
            if (key == "service") { youboraData.setService(val); }
            if (key == "username") { youboraData.setUsername(val); }
            if (key == "mediaResource") { youboraData.setMediaResource(val); }
            if (key == "transaction") { youboraData.setTransaction(val); }
            if (key == "live") { youboraData.setLive(val); }
            if (key == "contentId") { youboraData.setContentId(val); }
            if (key == "hashTitle") { youboraData.setHashTitle(val); }
            if (key == "cdn") { youboraData.setCDN(val); }
            if (key == "isp") { youboraData.setISP(val); }
            if (key == "ip") { youboraData.setIP(val); }

            if (key == "properties") { youboraData.setProperties(val); }
            if (key == "propertyFileName") { youboraData.setPropertyFileName(val); }
            if (key == "propertyContentId") { youboraData.setPropertyContentId(val); }
            if (key == "propertyTransactionType") { youboraData.setPropertyTransactionType(val); }
            if (key == "propertyQuality") { youboraData.setPropertyQuality(val); }
            if (key == "propertyContentType") { youboraData.setPropertyContentType(val); }
            if (key == "propertyDeviceManufacturer") { youboraData.setPropertyDeviceManufacturer(val); }
            if (key == "propertyDeviceType") { youboraData.setPropertyDeviceType(val); }
            if (key == "propertyDeviceYear") { youboraData.setPropertyDeviceYear(val); }
            if (key == "propertyDeviceFirmware") { youboraData.setPropertyDeviceFirmware(val); }
            if (key == "propertyMetaTitle") { youboraData.setPropertyMetaTitle(val); }
            if (key == "propertyMetaGenre") { youboraData.setPropertyMetaGenre(val); }
            if (key == "propertyMetaLanguage") { youboraData.setPropertyMetaLanguage(val); }
            if (key == "propertyMetaYear") { youboraData.setPropertyMetaYear(val); }
            if (key == "propertyMetaCast") { youboraData.setPropertyMetaCast(val); }
            if (key == "propertyMetaDirector") { youboraData.setPropertyMetaDirector(val); }
            if (key == "propertyMetaOwner") { youboraData.setPropertyMetaOwner(val); }
            if (key == "propertyMetaDuration") { youboraData.setPropertyMetaDuration(val); }
            if (key == "propertyMetaParental") { youboraData.setPropertyMetaParental(val); }
            if (key == "propertyMetaPrice") { youboraData.setPropertyMetaPrice(val); }
            if (key == "propertyMetaRating") { youboraData.setPropertyMetaRating(val); }
            if (key == "propertyMetaAudioType") { youboraData.setPropertyMetaAudioType(val); }
            if (key == "propertyMetaAudioChannels") { youboraData.setPropertyMetaAudioChannels(val); }
 
            if (key == "concurrencyProperties") { youboraData.setConcurrencyProperties(val); }
            if (key == "concurrencyEnabled") { youboraData.setConcurrencyEnabled(val); }
            if (key == "concurrencyCode") { youboraData.setConcurrencyCode(val); }
            if (key == "concurrencyService") { youboraData.setConcurrencyService(val); }
            if (key == "concurrencyMaxCount") { youboraData.setConcurrencyMaxCount(val); }
            if (key == "concurrencyRedirectUrl") { youboraData.setConcurrencyRedirectUrl(val); }
            if (key == "concurrencyIpMode") { youboraData.setConcurrencyIpMode(val); }
 
            if (key == "resumeProperties") { youboraData.setResumeProperties(val); }
            if (key == "resumeEnabled") { youboraData.setResumeEnabled(val); }
            if (key == "resumeCallback") { youboraData.setResumeCallback(val); }
            if (key == "resumeService") { youboraData.setResumeService(val); }
            if (key == "playTimeService") { youboraData.setPlayTimeService(val); }
  
            if (key == "extraparam1") { youboraData.setExtraParam(1, val); }
            if (key == "extraparam2") { youboraData.setExtraParam(2, val); }
            if (key == "extraparam3") { youboraData.setExtraParam(3, val); }
            if (key == "extraparam4") { youboraData.setExtraParam(4, val); }
            if (key == "extraparam5") { youboraData.setExtraParam(5, val); }
            if (key == "extraparam6") { youboraData.setExtraParam(6, val); }
            if (key == "extraparam7") { youboraData.setExtraParam(7, val); }
            if (key == "extraparam8") { youboraData.setExtraParam(8, val); }
            if (key == "extraparam9") { youboraData.setExtraParam(9, val); }
            if (key == "extraparam10") { youboraData.setExtraParam(10, val); } 
 
            if (key == "cdnNodeData") { youboraData.setCDNNodeData(val); }
  
            if (this.debug) { console.log('SmartPlugin :: getVariables :: ' + key + ' = ' + val); } 

        }
        SmartPlugin.startPlugin();
 
    },
    startPlugin: function()
    {
        try
        {
            if (youboraData.getCDN() == "AKAMAI") {
                document.getElementsByTagName('video')[0].addEventListener("waiting", function ( e ) { SmartPlugin.mediaBufferBegin(e); }, false);
            }
            try{
                SmartPlugin.player = brightcove.getExperience();
            }catch(e){
                 SmartPlugin.player = brightcove.api.getExperience(); 
            }
            //SmartPlugin.player = brightcove.api.getExperience();  
            SmartPlugin.videoPlayer = SmartPlugin.player.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
            SmartPlugin.experience = SmartPlugin.player.getModule(brightcove.api.modules.APIModules.EXPERIENCE);
            SmartPlugin.contentPlayer = SmartPlugin.player.getModule(brightcove.api.modules.APIModules.CONTENT);
            if(SmartPlugin.debug)
            {
                console.log('SmartPlugin :: BRIGHTCOVE :: BrightCove HTML5 Player Found.');  
                console.log('SmartPlugin :: BRIGHTCOVE :: Player attachment completed.'); 
            }  
            SmartPlugin.apiClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, SmartPlugin.pluginVersion, SmartPlugin.targetDevice);  
            SmartPlugin.bindEvents();  
            spLoaded = true;    
            try
            {
                console.log(SmartPlugin.experience.getStage().loaderInfo.parameters);
            }
            catch ( e ) { }
        }
        catch(e)
        {
            if(SmartPlugin.debug)
            {
                console.log('SmartPlugin :: BRIGHTCOVE :: Player Not Found: '+ e);
            }
        } 
    },
    bindEvents: function() 
    {
        try 
        {
            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.CHANGE,    SmartPlugin.mediaEventHandler);} catch(e) { console.log(e) }
            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.ERROR,     SmartPlugin.mediaEventHandler);} catch(e) { console.log(e) }
            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.PLAY,      SmartPlugin.mediaEventHandler);} catch(e) { console.log(e) }
            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.PROGRESS,  SmartPlugin.mediaEventHandler);} catch(e) { console.log(e) }
            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.STOP,      SmartPlugin.mediaEventHandler);} catch(e) { console.log(e) }
            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.BEGIN,     SmartPlugin.mediaEventHandler);} catch(e) { console.log(e) }
            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.COMPLETE,  SmartPlugin.mediaEventHandler);} catch(e) { console.log(e) }  

            if(SmartPlugin.debug)
            {
                console.log('SmartPlugin :: BRIGHTCOVE :: bindEvents :: Events attached correctly.'); 
            }
        }
        catch(e)
        {
            if(SmartPlugin.debug)
            {
                console.log ( "SmartPlugin :: BRIGHTCOVE :: bindEvents :: Error : " + e ); 
            }
        }
    }, 
    renditionHandler: function (rendition) { 
        try {
            SmartPlugin.rendition = rendition;
            if (rendition != null) { 
                SmartPlugin.currentBitrate = rendition.encodingRate;
            } else {
                SmartPlugin.currentBitrate = "-1";
            }
        } catch (error) {
            if (SmartPlugin.debug) {
                console.log("SmartPlugin :: BRIGHTCOVE :: renditionHandler :: Error: " + error);
            }
        }
    }, 
    sendStartHandler: function(video) {
        SmartPlugin.urlResource = video.defaultURL;   
        SmartPlugin.bcvideoplayer = video;    
        SmartPlugin.isStartSent = true; 
        if (youboraData.getPropertyMetaTitle() == "") { youboraData.setPropertyMetaTitle(video.displayName);  }  
        try { var referer = parent.document.referrer; } catch (e) { referer = window.location.href; } 
        SmartPlugin.apiClass.sendStart( 0 ,referer , youboraData.properties , SmartPlugin.isLive , SmartPlugin.urlResource , SmartPlugin.duration );
        SmartPlugin.setPing();
    },
    mediaBufferBegin: function (e) {  
        if(SmartPlugin.isJoinSent)
        {
            SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
            SmartPlugin.isBuffering = true;
        } 
    }, 
    mediaEventHandler: function(playerEvent) {

        //console.log(playerEvent);

        if(SmartPlugin.debug)
        {
            console.log ( "SmartPlugin :: BRIGHTCOVE :: Event :: " + playerEvent.type);  
        }
        SmartPlugin.duration = playerEvent.duration; 
        SmartPlugin.currentPosition = playerEvent.position; 
        var currentPosition = playerEvent.position;
        var currentDuration = playerEvent.duration; 

        switch (playerEvent.type)
        {
            case "mediaBufferBegin": 
                if(SmartPlugin.isJoinSent)
                {
                    SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
                    SmartPlugin.isBuffering = true;
                }
            break;

            case "mediaBufferComplete":
                SmartPlugin.checkBuffering();
            break;           

            case "mediaBegin":
                if(!SmartPlugin.isJoinSent)
                {
                   SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_END);
                } 
            break;     

            case "mediaProgress":        
                try { SmartPlugin.currentBitrate = playerEvent.media.renditions[0].encodingRate; } catch (e) { SmartPlugin.currentBitrate = "-1"; }
                if(!SmartPlugin.isJoinSent)
                {
                    SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_END);
                } else {
                    SmartPlugin.checkBuffering();
                }         
                try
                {
                    SmartPlugin.videoPlayer.getCurrentRendition(function(rendition){ try { SmartPlugin.currentBitrate = rendition.encodingRate; } catch (e) {} });
                    if (SmartPlugin.previousElapsedTime != SmartPlugin.videoPlayer.currentTime) {
                        SmartPlugin.checkBuffering();
                    }
                    SmartPlugin.previousElapsedTime = SmartPlugin.videoPlayer.currentTime; 
                    SmartPlugin.currentTime = SmartPlugin.videoPlayer.src
                }
                catch ( err )
                {
                    if(SmartPlugin.debug)
                    {
                        console.log( "SmartPlugin :: BRIGHTCOVE :: mediaProgress :: Error: " + err);
                    }
                }
            break;

            case "mediaPlay":          
                if(!SmartPlugin.isJoinSent)
                {
                    SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
                } else {
                    SmartPlugin.checkBuffering();
                }
                if(SmartPlugin.isStartSent == false)
                {  
                    SmartPlugin.videoPlayer.getCurrentRendition(function(e) { SmartPlugin.renditionHandler(e) }); 
                    SmartPlugin.videoPlayer.getCurrentVideo(function(e) { SmartPlugin.sendStartHandler(e) });
                }
                if( SmartPlugin.isPaused )
                {   
                    if (SmartPlugin.isStartSent)    SmartPlugin.apiClass.sendResume();
                }
                SmartPlugin.isPaused = false; 
                if(SmartPlugin.debug)
                {
                    console.log('SmartPlugin :: BRIGHTCOVE :: mediaPlay ::'); 
                }
            break;

            case "mediaStop":

                if (SmartPlugin.isStartSent){
                    SmartPlugin.isPaused = true;                                
                    SmartPlugin.checkBuffering(); 
                    SmartPlugin.apiClass.sendPause();
                    if(SmartPlugin.debug)
                    {
                        console.log('SmartPlugin :: BRIGHTCOVE :: mediaStop ::');  
                    }
                }

                if (currentPosition >= currentDuration){
                    SmartPlugin.checkBuffering();             
                    clearInterval(SmartPlugin.pingTimer);
                    if (SmartPlugin.isStartSent) SmartPlugin.apiClass.sendStop();
                    SmartPlugin.reset();
                }
            break;

            case "mediaChange":
                if (SmartPlugin.isStartSent){
                    SmartPlugin.checkBuffering();             
                    clearInterval(SmartPlugin.headTimer); 
                    //SmartPlugin.apiClass.sendError( 'Media Change', 'Media Change'); 
                    SmartPlugin.apiClass.sendStop();
                    SmartPlugin.reset();          
                    if(SmartPlugin.debug)
                    {
                        console.log('SmartPlugin :: BRIGHTCOVE :: mediaChange ::');    
                    }
                }
            break;

            case "mediaError":
                SmartPlugin.isStreamError = true;
                SmartPlugin.checkBuffering();             
                clearInterval(SmartPlugin.pingTimer); 
                var niceErrorCode;
                try{
                    niceErrorCode =  SmartPlugin.errorCodes[playerEvent.code];
                    if(niceErrorCode == undefined){
                        niceErrorCode = playerEvent.code;
                    }
                }catch(e){}
                if(niceErrorCode == undefined){
                    niceErrorCode = "3001";
                }
                SmartPlugin.apiClass.sendError(niceErrorCode.toString(), "PLAY_FAILURE"); 
                SmartPlugin.apiClass.sendStop();
                SmartPlugin.reset(); 
            break;
        }

    }, 
    checkBuffering: function() 
    { 
        if (SmartPlugin.isBuffering) 
        { 
            if (SmartPlugin.isStartSent)    SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_END);
        } 
        SmartPlugin.isBuffering = false;
    },
    setBufferEvent: function(bufferState)
    {
        try {
            var d               = new Date();
            var bufferTimeEnd   = 0;
            var bufferTimeTotal = 0;

            switch ( bufferState )
            {
                case SmartPlugin.mediaEvents.BUFFER_BEGIN:
                
                    SmartPlugin.bufferTimeBegin    = d.getTime();

                    if(SmartPlugin.joinTimeBegin == 0)
                    {
                        if(SmartPlugin.debug)
                        {
                            console.log ( "SmartPlugin :: >> JOIN TIME START" );
                        }
                        SmartPlugin.joinTimeBegin    = d.getTime();
                    }

                break;
            
                case SmartPlugin.mediaEvents.BUFFER_END:
                
                    bufferTimeEnd           = d.getTime();
                    bufferTimeTotal         = bufferTimeEnd - SmartPlugin.bufferTimeBegin;
 
                    if ( SmartPlugin.isJoinSent == false ){
                        SmartPlugin.isJoinSent  = true;
                        var joinTimeTotal = d.getTime() - SmartPlugin.joinTimeBegin;
                        
                        if (SmartPlugin.isStartSent) SmartPlugin.apiClass.sendJoin( SmartPlugin.currentPosition ,  joinTimeTotal );
                        if(SmartPlugin.debug)
                        {
                            console.log ( "SmartPlugin :: >> JOIN TIME END" );
                        }

                    } else {
                        var currentTime = SmartPlugin.currentPosition;
                        if(currentTime == 0 && SmartPlugin.isLive) { 
                            currentTime = 10;
                        }
                        
                        if (SmartPlugin.isStartSent) SmartPlugin.apiClass.sendBuffer( currentTime , bufferTimeTotal );
                    } 
                break;
            }
        } 
        catch(e) 
        { 
            if(SmartPlugin.debug)
            {
                console.log ( "SmartPlugin :: BRIGHTCOVE :: Error " + e );
            }
        }
    },
    setPing: function()
    {  
        SmartPlugin.pingTimer = setTimeout( function() { SmartPlugin.ping(); } , SmartPlugin.apiClass.getPingTime() ); 
    },
    ping: function()
    {
        try 
        {
            clearTimeout(SmartPlugin.pingTimer);
            SmartPlugin.pingTimer = null;
            SmartPlugin.setPing();             
            if (SmartPlugin.isStartSent) 
            {
                SmartPlugin.apiClass.sendPingTotalBitrate( SmartPlugin.currentBitrate , SmartPlugin.currentPosition );
            }
        } 
        catch(e) 
        { 
            if(SmartPlugin.debug)
            {
                console.log ( "SmartPlugin :: BRIGHTCOVE :: Error: " + e );
            }
        }
    },
    reset: function()
    {
        try { 
           clearTimeout(SmartPlugin.pingTimer);
           SmartPlugin.currentPosition = 0; 
           SmartPlugin.urlResource = ""; 
           SmartPlugin.isLive = youboraData.getLive(); 
           SmartPlugin.duration = 0;  
           SmartPlugin.previousElapsedTime = 0; 
           SmartPlugin.isPaused = false;
           SmartPlugin.isStartSent = false;
           SmartPlugin.bufferTimeBegin = 0;
           SmartPlugin.isJoinSent = false;
           SmartPlugin.joinTimeBegin = 0;
           SmartPlugin.joinTimeEnd = 0;
           SmartPlugin.pingTimer = ""; 
           SmartPlugin.apiClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, SmartPlugin.pluginVersion, SmartPlugin.targetDevice);  
        }
        catch(error) 
        {
            if(SmartPlugin.debug)
            {
                console.log ( "SmartPlugin :: BRIGHTCOVE :: Error " + e );
            }
        }   
    }
}   