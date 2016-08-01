
var SmartPlugin = { 
    debug: true, 
    player: "",
    videoPlayer: "", 
    bcvideoplayer: "",
    xperience: "",
    bandwidth: { username: youboraData.getUsername(), interval: 6000},
    headTimer: "",
    currentTime: 0,
    urlResource: "",
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
    includeAPI: function(){ 
        var allVideoPlayerObjects = document.getElementsByTagName("object");     
        for (var i=0;i<allVideoPlayerObjects.length;i++)
        {  
            try 
            { 
                    var LoaderParam = document.createElement('param');
                    LoaderParam.setAttribute('name', 'templateReadyHandler');
                    LoaderParam.setAttribute('value', 'SmartPlugin.playerCallback');
                    allVideoPlayerObjects[i].appendChild(LoaderParam);

                    var APIParam = document.createElement('param');
                    APIParam.setAttribute('name', 'includeAPI');
                    APIParam.setAttribute('value', 'true');
                    allVideoPlayerObjects[i].appendChild(APIParam);

             }
            catch (errror)
            {
                // Object without param
            }
        }   
        SmartPlugin.searchHTML5();
            
    },
    playerCallback: function(data){
        console.log(data)
        console.log('PLAYER CALLBACK!!!!!!!!!!!!!!!')
    },
    searchHTML5: function(){
        var found = false;
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
            }
            catch(e)
            {
                console.log('SmartPlugin :: HTML5 Error :: '+ e);                 
            }
        }
        else
        {
            console.log('SmartPlugin :: BRIGHTCOVE :: No HTML5 player found... searching flash...'); 
            SmartPlugin.searchFlash(); 
        }
    },

    searchFlash: function() {  
        SmartPlugin.chkNums++; 
        if(typeof APIModules == "undefined")
        {
            spYoubora.loadJavascriptFile('http://admin.brightcove.com/js/APIModules_all.js', function() {  SmartPlugin.APIReady(); } );
        }
        else 
        { 
            SmartPlugin.APIReady(); 
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
                        try {  SmartPlugin.player      = brightcove.getExperience(experienceID);  } catch(e) {console.log('1) '+e)} 
                        try {  SmartPlugin.videoPlayer = SmartPlugin.player.getModule('videoPlayer');  } catch(e) {console.log('2) '+e)}
                        try {  SmartPlugin.experience  = SmartPlugin.player.getModule('experience');    } catch(e) {console.log('3) '+e)}
                        console.log('SmartPlugin :: BRIGHTCOVE :: Player attachment completed.'); 

                        clearInterval(SmartPlugin.chkTimer);
                        SmartPlugin.bindEvents();
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
            SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.CHANGE,           SmartPlugin.mediaEventHandler);
            SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.ERROR,            SmartPlugin.mediaEventHandler);
            SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.PLAY,             SmartPlugin.mediaEventHandler);
            SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.PROGRESS,         SmartPlugin.mediaEventHandler);
            SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.STOP,             SmartPlugin.mediaEventHandler);
            SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.BUFFER_BEGIN,     SmartPlugin.mediaEventHandler);
            SmartPlugin.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.BUFFER_COMPLETE,  SmartPlugin.mediaEventHandler);

            console.log('SmartPlugin :: BRIGHTCOVE :: bindEvents :: Events attached correctly.'); 
        }
        catch(e)
        {
            console.log ( "SmartPlugin :: BRIGHTCOVE :: bindEvents :: Error : " + e ); 
        }
    },
    mediaEventHandler: function(playerEvent) {
        console.log ( "SmartPlugin :: BRIGHTCOVE :: Event :: " + playerEvent.type);  

        SmartPlugin.duration = playerEvent.duration; 
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
                    var currentData = SmartPlugin.videoPlayer.getCurrentVideo();
                    SmartPlugin.urlResource = currentData.FLVFullLengthURL;  
                    SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , SmartPlugin.isLive , SmartPlugin.urlResource , playerEvent.duration);
                    SmartPlugin.setPing();
                    SmartPlugin.isStartSent = true;     
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
    isLive: function(live) {
        SmartPlugin.isLive = live;
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
                        
                        if (SmartPlugin.isStartSent)    SmartPlugin.communicationClass.sendJoin( SmartPlugin.currentTime ,  joinTimeTotal );

                    } else {
                        var currentTime = SmartPlugin.currentTime;
                        if(currentTime == 0 && SmartPlugin.isLive) { 
                            currentTime = 10;
                        }
                        
                        if (SmartPlugin.isStartSent)    SmartPlugin.communicationClass.sendBuffer( currentTime , bufferTimeTotal );
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
            var currentRendition = SmartPlugin.videoPlayer.getCurrentRendition();
            clearTimeout(SmartPlugin.pingTimer);
            SmartPlugin.pingTimer = null;
            SmartPlugin.setPing();
            
            if (SmartPlugin.isStartSent)    SmartPlugin.communicationClass.sendPingTotalBitrate( currentRendition.encodingRate , SmartPlugin.currentTime );
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