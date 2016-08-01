
var SmartPlugin = { 
    debug: youboraData.getDebug(), 
    player: "",
    videoPlayer: "", 
    bcvideoplayer: "",
    xperience: "", 
    bandwidth: { username: youboraData.getUsername(), interval: 6000},
    headTimer: "",
    currentTime: 0,
    urlResource: "",
    balancing: youboraData.getBalanceEnabled(),
    balanceObject: "",
    balanceIndex: 1,
    isLive: youboraData.getLive(),
    duration: 0,
    communicationClass: "",
    previousElapsedTime: 0, 
    service: youboraData.getService(),
    metadata: {}, 
    chkTimer: "",
    chkNums: 0,
    maxChkNums: 5,
    buffering: false,
    paused: false,
    streamError: false,
    isHTML: false,
    currentBitrate: 0,
    numLoads: 0,
    bufferTimeBegin: 0,
    isStartSent: false,
    isJoinEventSent: false,
    joinTimeBegin: 0,
    joinTimeEnd: 0,
    accessfunction: '',
    PS3CommandFunction: "",
    pingTimer: "", 
    playerStreamingError: false,
    SmartPluginsEvents: { 
        BUFFER_BEGIN: 1,
        BUFFER_END: 0,
        JOIN_SEND: 2
    },
    initDone: false,
    Init: function()  {   
        try
        {
            console.log('SmartPlugin :: BRIGHTCOVE :: Init ::');   
            SmartPlugin.communicationClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, '2.2.0', 'BCOVE');
            SmartPlugin.searchHTML5();
            spLoaded = true;
        }
        catch(error) 
        {
            spLoaded = false;
        }  
    },
    refreshBalancedResource: function () {  
        try 
        {
            if(typeof SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['URL'] != "undefined")
            {
                var stringCall = '{"command":"load","contentUri":"'+ SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['URL'] +'"}'
                window.external.user(stringCall); 
            }
            else
            {
                console.log('SmartPlugin :: BRIGHTCOVE :: Balancer :: Error :: End of mirrors'); 
            }
        } 
        catch (e)
        {
            console.log('SmartPlugin :: BRIGHTCOVE :: Balance Resource :: Error: '+ e); 
        }
    },
    setBalancedResource: function(obj) {  
        if(obj != false)
        {
            SmartPlugin.balanceObject = obj;
            if (typeof obj['1']['URL'] != "undefined") 
            { 
              console.log('SmartPlugin :: BRIGHTCOVE :: Balance Current Resource  :: ' + youboraData.getMediaResource());
              console.log('SmartPlugin :: BRIGHTCOVE :: Balance Priority Resource :: ' + obj['1']['URL']); 
              if(obj['1']['URL'] != youboraData.getMediaResource())
              {
                console.log('SmartPlugin :: BRIGHTCOVE :: Balancing :: ' + obj['1']['URL']);  
                try
                {
                    SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , SmartPlugin.isLive , SmartPlugin.urlResource , SmartPlugin.duration );
                    SmartPlugin.setPing();
                    SmartPlugin.isStartSent = true;     
                }
                catch (err)
                {
                    console.log('SmartPlugin :: BRIGHTCOVE :: Balancing :: Error While Changing Media: '+ err); 
                    SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , SmartPlugin.isLive , SmartPlugin.urlResource , SmartPlugin.duration );
                    SmartPlugin.setPing();
                    SmartPlugin.isStartSent = true;     
                } 

              } 
              else {
                console.log('SmartPlugin :: BRIGHTCOVE :: Balancer :: Same Resource');  
                SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , SmartPlugin.isLive , SmartPlugin.urlResource , SmartPlugin.duration );
                SmartPlugin.setPing();
                SmartPlugin.isStartSent = true;     
              } 
           }
            else 
            {
               console.log('SmartPlugin :: BRIGHTCOVE :: Invalid balance object'); 
                SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , SmartPlugin.isLive , SmartPlugin.urlResource , SmartPlugin.duration );
                SmartPlugin.setPing();
                SmartPlugin.isStartSent = true;     
            }
        }
        else 
        {
            console.log('SmartPlugin :: BRIGHTCOVE :: Balance unavailable with current parameters'); 
            SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , SmartPlugin.isLive , SmartPlugin.urlResource , SmartPlugin.duration );
            SmartPlugin.setPing();
            SmartPlugin.isStartSent = true;     
        }
    },
    searchHTML5: function(){
        var found = true;
        var allVideoPlayerObjects = document.getElementsByTagName("video");     
        for (var i=0;i<allVideoPlayerObjects.length;i++)
        {
            if(allVideoPlayerObjects[i].getAttribute('src').indexOf("rightcove") != -1) 
            {
                found = true ;
            }
        }
        if(found)
        {
            try
            {
                console.log('SmartPlugin :: BRIGHTCOVE :: HTML5 Player Found.');  
                SmartPlugin.player = brightcove.api.getExperience();  
                SmartPlugin.videoPlayer = SmartPlugin.player.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
                SmartPlugin.experience = SmartPlugin.player.getModule(brightcove.api.modules.APIModules.EXPERIENCE);
                console.log('SmartPlugin :: BRIGHTCOVE :: Player attachment completed.'); 
                SmartPlugin.bindEventsHTML5();
                SmartPlugin.isHTML = true;
            }
            catch(e)
            {
                console.log('SmartPlugin :: HTML5 Error :: '+ e);                 
            }
        }
        else
        {
            console.log('SmartPlugin :: BRIGHTCOVE :: No HTML5 player found...'); 
            //SmartPlugin.APIReady(); 
        }
    }, 
    APIReady: function() {
        brightcove.collectExperiences()
        SmartPlugin.chkNums++; 
        try 
        { 
            var found = false;
            var allVideoPlayerObjects = document.getElementsByTagName("object"); 
            for (var i=0;i<allVideoPlayerObjects.length;i++)
            { 
                if(allVideoPlayerObjects[i].getAttribute('data').indexOf("brightcove") != -1) 
                {
                    var experienceID = allVideoPlayerObjects[i].getAttribute('id');
                    try 
                    {  
                        console.log('SmartPlugin :: BRIGHTCOVE :: Flash Player Found.');    
                        SmartPlugin.player = brightcove.api.getExperience(experienceID);  
                        SmartPlugin.videoPlayer = SmartPlugin.player.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
                        SmartPlugin.experience = SmartPlugin.player.getModule(brightcove.api.modules.APIModules.EXPERIENCE);
                        console.log('SmartPlugin :: BRIGHTCOVE :: Player attachment completed.'); 

                        clearInterval(SmartPlugin.chkTimer);
                        SmartPlugin.bindEventsHTML5();
                    } 
                    catch (e) 
                    {  
                        console.log('SmartPlugin :: BRIGHTCOVE :: playerReady :: Error: ' + e);  
                    } 
                }

            }

        }
        catch(e)
        {
            console.log ( "SmartPlugin :: BRIGHTCOVE :: Unable to get instance of brightcove." + e ); 
        }
 
    },
    bindEvents: function() { 
        try 
        {
            SmartPlugin.videoPlayer.addEventListener(BCMediaEvent.CHANGE,           SmartPlugin.mediaEventHandler);
            SmartPlugin.videoPlayer.addEventListener(BCMediaEvent.ERROR,            SmartPlugin.mediaEventHandler);
            SmartPlugin.videoPlayer.addEventListener(BCMediaEvent.PLAY,             SmartPlugin.mediaEventHandler);
            SmartPlugin.videoPlayer.addEventListener(BCMediaEvent.PROGRESS,         SmartPlugin.mediaEventHandler);
            SmartPlugin.videoPlayer.addEventListener(BCMediaEvent.STOP,             SmartPlugin.mediaEventHandler);
            SmartPlugin.videoPlayer.addEventListener(BCMediaEvent.BUFFER_BEGIN,     SmartPlugin.mediaEventHandler);
            SmartPlugin.videoPlayer.addEventListener(BCMediaEvent.BUFFER_COMPLETE,  SmartPlugin.mediaEventHandler);

            console.log('SmartPlugin :: BRIGHTCOVE :: bindEvents :: Events attached correctly.'); 
        }
        catch(e)
        {
            console.log ( "SmartPlugin :: BRIGHTCOVE :: bindEvents :: Error : " + e ); 
        }
    },
    bindEventsHTML5: function(){ 
        try 
        {
            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.CHANGE,    SmartPlugin.mediaEventHandler);} catch(e) { console.log(e) }
            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.ERROR,     SmartPlugin.mediaEventHandler);} catch(e) { console.log(e) }
            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.PLAY,      SmartPlugin.mediaEventHandler);} catch(e) { console.log(e) }
            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.PROGRESS,  SmartPlugin.mediaEventHandler);} catch(e) { console.log(e) }
            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.STOP,      SmartPlugin.mediaEventHandler);} catch(e) { console.log(e) }
            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.BEGIN,     SmartPlugin.mediaEventHandler);} catch(e) { console.log(e) }
            try { SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.COMPLETE,  SmartPlugin.mediaEventHandler);} catch(e) { console.log(e) }

            console.log('SmartPlugin :: BRIGHTCOVE :: bindEvents :: Events attached correctly.'); 
        }
        catch(e)
        {
            console.log ( "SmartPlugin :: BRIGHTCOVE :: bindEvents :: Error : " + e ); 
        }
    },
    renditionHandler: function (rendition) { 
        if (rendition != null)
        {
            SmartPlugin.currentBitrate = rendition.encodingRate;
        }  
        else 
        {
            SmartPlugin.currentBitrate = 0;
        }
    }, 
    sendStartHandler: function(video) {
        SmartPlugin.urlResource = video.defaultURL;   
        if(SmartPlugin.balancing)
        {
            var path = SmartPlugin.urlResource.replace(/^.*\/\/[^\/]+/, '');
            SmartPlugin.communicationClass.getBalancedResource(path , function(obj) { SmartPlugin.setBalancedResource(obj); });
        }
        else 
        {
            SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , SmartPlugin.isLive , SmartPlugin.urlResource , SmartPlugin.duration );
            SmartPlugin.setPing();
            SmartPlugin.isStartSent = true;      
        }
    },
    mediaEventHandler: function(playerEvent) {
        console.log ( "SmartPlugin :: BRIGHTCOVE :: Event :: " + playerEvent.type);  

        SmartPlugin.duration = playerEvent.duration; 
        SmartPlugin.currentPosition = playerEvent.position;
        var currentPosition = playerEvent.position;
        var currentDuration = playerEvent.duration;

        switch (playerEvent.type)
        {
            case "mediaBufferBegin":
 
                SmartPlugin.checkBuffering();      
                SmartPlugin.setBufferEvent(SmartPlugin.SmartPluginsEvents.BUFFER_BEGIN);
                SmartPlugin.buffering = true;
                SmartPlugin.previousElapsedTime = 0; 
                console.log('SmartPlugin :: BRIGHTCOVE :: mediaBufferBegin ::');  

                break;

            case "mediaBufferComplete":
                console.log('SmartPlugin :: BRIGHTCOVE :: mediaBufferComplete ::');  
                break;                

            case "mediaProgress":
 
                if (SmartPlugin.previousElapsedTime != playerEvent.position) {
                    SmartPlugin.checkBuffering();
                    SmartPlugin.currentTime = playerEvent.position;
                }
                SmartPlugin.previousElapsedTime = playerEvent.position;
                console.log('SmartPlugin :: BRIGHTCOVE :: mediaProgress :: ' + playerEvent.position); 
                break;

            case "mediaPlay":                   
                if(SmartPlugin.isStartSent == false)
                {  
                    SmartPlugin.videoPlayer.getCurrentRendition(function(e) { SmartPlugin.renditionHandler(e) }); 
                    SmartPlugin.videoPlayer.getCurrentVideo(function(e) { SmartPlugin.sendStartHandler(e); });
                }
                if( SmartPlugin.paused )
                {   
                    if (SmartPlugin.isStartSent)    SmartPlugin.communicationClass.sendResume();
                }
                SmartPlugin.paused = false; 
                console.log('SmartPlugin :: BRIGHTCOVE :: Play ::'); 

                break;

            case "mediaStop":

                if (SmartPlugin.isStartEventSent){
                    SmartPlugin.paused = true;                                
                    SmartPlugin.checkBuffering(); 
                    SmartPlugin.communicationClass.sendPause();
                    console.log('SmartPlugin :: BRIGHTCOVE :: Pause ::');  
                }

                if (currentPosition >= currentDuration){
                    SmartPlugin.checkBuffering();             
                    clearInterval(SmartPlugin.headTimer);
                    if (SmartPlugin.isStartSent) 
                    {
                        SmartPlugin.communicationClass.sendStop(); 
                    }
                    SmartPlugin.reset();
                    console.log('SmartPlugin :: BRIGHTCOVE :: Stop ::');   
                }
                break;

            case "mediaChange":
                if (SmartPlugin.isStartEventSent){
                    SmartPlugin.checkBuffering();             
                    clearInterval(SmartPlugin.headTimer); 
                    SmartPlugin.communicationClass.sendError( 'Media Change', 'Media Change'); 
                    SmartPlugin.communicationClass.sendStop();
                    SmartPlugin.reset();          
                    console.log('SmartPlugin :: BRIGHTCOVE :: mediaChange ::');    
                }
                break;

            case "mediaError":
                SmartPlugin.checkBuffering();             
                clearInterval(SmartPlugin.headTimer); 
                SmartPlugin.communicationClass.sendError( 'MEDIA ERROR', 'MEDIA ERROR'); 
                SmartPlugin.communicationClass.sendStop();
                SmartPlugin.reset();          
                console.log('SmartPlugin :: BRIGHTCOVE :: mediaError ::');    
                
                break;
        }

    }, 
    setMetadata: function(metadata) {         
        SmartPlugin.metadata = metadata;
    },
    getMetadata: function () {
        var e = JSON.stringify(SmartPlugin.metadata);
        var t = encodeURI(e);
        return t;
    },
    setUsername: function(username) {
        SmartPlugin.bandwidth.username = username;
    }, 
    getTimeStamp: function() {
        var NewCurrentTime = new Date();
        return "["+ NewCurrentTime.getHours() + ":" + NewCurrentTime.getMinutes() +":" + NewCurrentTime.getSeconds() +"]";
    },
    checkBuffering: function() {
        if (SmartPlugin.buffering) 
        { 
            if (SmartPlugin.isStartSent) SmartPlugin.setBufferEvent(SmartPlugin.SmartPluginsEvents.BUFFER_END);
        }
        SmartPlugin.buffering = false;
    },
    setBufferEvent: function(bufferState)
    {
        try {
            var d               = new Date();
            var bufferTimeEnd   = 0;
            var bufferTimeTotal = 0;

            switch ( bufferState )
            {
                case SmartPlugin.SmartPluginsEvents.BUFFER_BEGIN:
                
                    SmartPlugin.bufferTimeBegin    = d.getTime();

                    if(SmartPlugin.joinTimeBegin == 0)
                    {
                        SmartPlugin.joinTimeBegin    = d.getTime();
                    }

                    break;
            
                case SmartPlugin.SmartPluginsEvents.BUFFER_END:
                
                    bufferTimeEnd           = d.getTime();
                    bufferTimeTotal         = bufferTimeEnd - SmartPlugin.bufferTimeBegin;
 
                    if ( SmartPlugin.isJoinEventSent == false ){
                        SmartPlugin.isJoinEventSent  = true;
                        var joinTimeTotal = d.getTime() - SmartPlugin.joinTimeBegin; 
                        if (SmartPlugin.isStartSent) SmartPlugin.communicationClass.sendJoin( SmartPlugin.currentTime ,  joinTimeTotal );

                    } else {
                        var currentTime = SmartPlugin.currentTime;
                        if(currentTime == 0 && SmartPlugin.isLive) { 
                            currentTime = 10;
                        } 
                        if (SmartPlugin.isStartSent) SmartPlugin.communicationClass.sendBuffer( currentTime , bufferTimeTotal );
                    }  
                    break;
            }
        } 
        catch(e) 
        { 
            console.log ( "SmartPlugin :: BRIGHTCOVE :: setBufferEvent :: Error: " + e );
        }
    },
    setPing: function()
    {  
        SmartPlugin.pingTimer = setTimeout( function() { SmartPlugin.ping(); } , SmartPlugin.communicationClass.getPingTime() ); 
    },
    ping: function()
    {
        try 
        { 
            SmartPlugin.videoPlayer.getCurrentRendition(function(e) { SmartPlugin.renditionHandler(e); });
            clearTimeout(SmartPlugin.pingTimer);
            SmartPlugin.pingTimer = null;
            SmartPlugin.setPing();
            
            if (SmartPlugin.isStartSent)    SmartPlugin.communicationClass.sendPingTotalBitrate( SmartPlugin.currentBitrate , SmartPlugin.currentTime );
        } 
        catch(e) 
        { 
            console.log ( "SmartPlugin :: BRIGHTCOVE :: PING :: Error; " + e );
        }
    }, 
    reset: function()
    {
        try {
           clearInterval(SmartPlugin.headTimer); 
           clearTimeout(SmartPlugin.pingTimer);
           SmartPlugin.communicationClass.sendStop(); 
           SmartPlugin.headTimer = "";
           SmartPlugin.currentTime = 0; 
           SmartPlugin.urlResource = ""; 
           SmartPlugin.isLive = youboraData.getLive(); 
           SmartPlugin.duration = 0; 
           SmartPlugin.communicationClass = "";
           SmartPlugin.previousElapsedTime = 0;
           SmartPlugin.buffering = false;
           SmartPlugin.paused = false;
           SmartPlugin.isStartSent = false;
           SmartPlugin.bufferTimeBegin = 0;
           SmartPlugin.isJoinEventSent = false;
           SmartPlugin.joinTimeBegin = 0;
           SmartPlugin.joinTimeEnd = 0;
           SmartPlugin.pingTimer = "";
           SmartPlugin.playerStreamingError = false;
        }
        catch(error) 
        {
            console.log ( "SmartPlugin :: BRIGHTCOVE :: RESET :: Error: " + error );
        }   
    }
}  

function onMediaBegin(event) {
    var video = videoPlayer.getCurrentVideo();
    updateView(video);
    console.log('LOL')
}