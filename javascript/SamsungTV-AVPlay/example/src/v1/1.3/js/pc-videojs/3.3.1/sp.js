/*
 * YouboraCommunication 
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: LluÃ­s Campos Beltran
 * Version: 3.1.0 
 *  - Full Revision
 */
var SmartPlugin = { 
    // General
    debug: youboraData.getDebug(),
    isLive: youboraData.getLive(), 
    bandwidth: { username: youboraData.getUsername(), interval: 6000},
    targetDevice: "PC-VIDEOJS",
    pluginName: "VIDEOJS",
    pluginVersion: "1.3.3.3.1",
    initDone: 0, 
    // Balancer
    //balancing: youboraData.getBalanceEnabled(),
    balanceObject: "",
    balanceIndex: 1, 
    // Media
    mediaEvents: { BUFFER_BEGIN: 1, BUFFER_END: 0, JOIN_SEND: 2 },
    videoPlayer: undefined,
    urlResource: undefined, 
    pingTimer: undefined,
    apiClass: undefined,
    currentTime: 0,
    duration: 0,
    // Triggers
    isStreamError: false,
    isBuffering: false,
    isStartSent: false,
    isJoinSent: false, 
    isPaused: false,
    previousElapsedTime: 0, 
    bufferTimeBegin: 0,
    joinTimeBegin: 0,
    joinTimeEnd: 0, 
    originalResource:"",
    //In some devices time detection is a little rough so we give
    //the player a threshold to make transitions smoother. Only used
    //for buffering so far
    bufferTimeThreshold:0.1,
    //We will privide a window to prevent buffer after seek (0.5 sec)
    endSeekDate:0,
    endSeekThreshold:500,
    bufferCheckTimer:{},
    //Sometimes the timeUpdate event and buffer checker 'event' will happen at the same time and it will send a buffer
    //as lastTime = currentTime. To prevent this to happen, the equality will have to happpen at least twice
    bufferTryCount :0,
    errors: {
        //MEDIA_ERR_ABORTED , 'The video download was cancelled'
        '1': '11100' ,
        //MEDIA_ERR_NETWORK , 'The video connection was lost, please confirm you are connected to the internet'
        '2': '11101',
        // MEDIA_ERR_DECODE, 'The video is bad or in a format that cannot be played on your browser'
        '3': '11102',
        // MEDIA_ERR_SRC_NOT_SUPPORTED, 'This video is either unavailable or not supported in this browser'
        '4': '11103',
        // MEDIA_ERR_ENCRYPTED , 'The video you are trying to watch is encrypted and we do not know how to decrypt it'
        '5': '11104',
        // MEDIA_ERR_UNKNOWN ,  'An unanticipated problem was encountered, check back soon and try again'
        'unknown': '11105',
        //PLAYER_ERR_NO_SRC ,  'No video has been loaded'
        '-1': '11106',
        // PLAYER_ERR_TIMEOUT , 'Could not download the video'
        '-2': '11107'
    },
    Init: function ( )
    {  
        SmartPlugin.initDone++;
        try
        { 
            if ( SmartPlugin.initDone <= 5 ) 
            {
                if ( spYoubora.isYouboraApiLoaded () == false ) 
                {
                    if ( SmartPlugin.debug )
                    {
                        console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Init :: Api Not Ready..." );
                    } 
                    setTimeout("SmartPlugin.Init()",200);
                }
                else 
                {
                    if ( SmartPlugin.debug )
                    {
                        console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Init ::" );
                    }
                    //SmartPlugin.defineWatch();
                    SmartPlugin.initDone = true;
                    SmartPlugin.startPlugin();
                }
            }
            else 
            {
                if ( SmartPlugin.debug )
                {
                    console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Init Error :: Unable to reach Api..." ); 
                }
                spLoaded = false;
            }
        }
        catch ( error )
        { 
            if ( SmartPlugin.debug )
            {
                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Init :: Error: " + error );
            }
            spLoaded = false;
        }

        
    },
    startPlugin: function ( )
    {
        try
        { 
            try
            { 
               // SmartPlugin.videoPlayer = document.getElementsByTagName('video')[0]; 
                var player = document.getElementsByTagName('video')[0];
                if(player != undefined){
                    SmartPlugin.playerId = document.getElementsByTagName('video')[0].id;
                    //We get the duration in here because in some Android devices it wont work otherwise
                    SmartPlugin.duration = player.duration;
                }else{
                    var objects = document.getElementsByTagName('object');
                    for(var i=0; i<objects.length; i++){
                    if(objects[i].getAttribute('type')=='application/x-shockwave-flash'){
                      SmartPlugin.playerId = objects[i].parentNode.id;
                    }
                  }
                }
                SmartPlugin.videoPlayer = videojs(SmartPlugin.playerId);
                if(SmartPlugin){
                    if(SmartPlugin.duration == 0 || SmartPlugin.duration===NaN){
                        SmartPlugin.duration =  SmartPlugin.videoPlayer.duration();
                    }
                }
                            console.log("DURATION  : " + SmartPlugin.duration);

                if ( SmartPlugin.debug )
                {
                    console.log( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: startPlugin :: HTML5 <video> found!" );
                }  
                SmartPlugin.originalResource = SmartPlugin.videoPlayer.currentSrc();
                SmartPlugin.apiClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, SmartPlugin.pluginVersion, SmartPlugin.targetDevice);  
                SmartPlugin.bindEvents(); 

                if ( youboraData.getBalanceEnabled() && SmartPlugin.apiClass.enableBalancer )
                {
                                youboraData.setBalancedResource(true);
                                if ( !SmartPlugin.isJoinSent )
                                {
                                    SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
                                }  
                                if ( SmartPlugin.isPaused )
                                {
                                    SmartPlugin.apiClass.sendResume();
                                    SmartPlugin.isPaused = false;
                                }
                                if ( SmartPlugin.balanceObject == "")
                                {
                                    var path = SmartPlugin.apiClass.getResourcePath(SmartPlugin.originalResource);
                                    //SmartPlugin.videoPlayer.stop();
                                    SmartPlugin.apiClass.getBalancedResource(path , function(obj) { SmartPlugin.setBalancedResource(obj); });   
    
                                } 
                                
                } 
            }
            catch ( error )
            { 
                if ( SmartPlugin.debug )
                {
                    console.log(error);
                    console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: startPlugin :: No <video> found!" );
                }   
                spLoaded = false;
            }
           
        }
        catch ( error )
        { 
            if ( SmartPlugin.debug )
            {
                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: startPlugin :: Error: " + error );
            } 
            spLoaded = false;
        }
    },
    bindEvents: function ( ) 
    { 
        try
        {
            var playerEvents = [ "canplay" , "playing" , "waiting", "timeupdate", "ended", "play", "pause", "error", "abort","seeking","seeked","stalled","suspend","progress"];
            for ( elem in playerEvents ) 
            { 
                SmartPlugin.videoPlayer.on(playerEvents[elem],function ( e ) { SmartPlugin.checkPlayState(e); });
            }            
            if ( SmartPlugin.debug )
            {
                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: bindEvents :: Events atached correctly!" );
            } 
        }
        catch ( error )
        {
            if(SmartPlugin.debug)
            {
                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: bindEvents :: Error: " + error );
            }             
        }
    },
    getCurrentBitRate: function ( )
    { 

      return -1;
    },
    progressCount: 0,
    checkPlayState: function ( e ) 
    {
        if ( SmartPlugin.debug )
        {
            console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: checkPlayState :: " + e.type );
        }
        switch ( e.type )
        {
            case "timeupdate": 
                try
                {  
                   //console.log("Previous Time : " + SmartPlugin.previousElapsedTime + " , current : "+ SmartPlugin.videoPlayer.currentTime +" , isBuffering : " + SmartPlugin.isBuffering +" , previous+threshold : "+ (SmartPlugin.previousElapsedTime + SmartPlugin.bufferTimeThreshold )+" , diff : "+ (SmartPlugin.previousElapsedTime - SmartPlugin.videoPlayer.currentTime ));
                    SmartPlugin.bufferTryCount=0;
                    SmartPlugin.progressCount=0;
                    SmartPlugin.duration =  SmartPlugin.videoPlayer.duration();
                    SmartPlugin.urlResource = SmartPlugin.videoPlayer.currentSrc();
                    SmartPlugin.currentTime = SmartPlugin.videoPlayer.currentTime();

                    if ( SmartPlugin.currentTime > 0 ) {
                        //if previous+e < currentTime -->Playback re-started
                        if ( (SmartPlugin.previousElapsedTime +SmartPlugin.bufferTimeThreshold) < SmartPlugin.videoPlayer.currentTime() ) {
                            SmartPlugin.checkBuffering();
                        }                        
                        if ( !SmartPlugin.isJoinSent )
                        { 
                            SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
                            SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_END);
                        }

                        if ( !SmartPlugin.isStartSent )
                        {
                            if( (isNaN(SmartPlugin.duration) ) || (SmartPlugin.duration == "NaN") || SmartPlugin.suration == NaN ){ SmartPlugin.duration = 0; }
                            SmartPlugin.apiClass.sendStart ( 0 , window.location.href , "" , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration );
                            SmartPlugin.setBufferChecker();
                            SmartPlugin.setPing(); 
                            SmartPlugin.isStartSent = true;

                            
                        }

                       // SmartPlugin.previousElapsedTime = SmartPlugin.videoPlayer.currentTime;
                    }
                }
                catch ( error )
                {
                    if ( SmartPlugin.debug )
                    {
                        console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: timeupdate :: Error: " + error );
                    }
                }
            break;

            case "play":
                try 
                {
                    if(!SmartPlugin.seeking){
                        SmartPlugin.urlResource = SmartPlugin.videoPlayer.currentSrc(); 
                        SmartPlugin.duration =  SmartPlugin.videoPlayer.duration();
                     
                        if ( !(youboraData.getBalanceEnabled() || SmartPlugin.apiClass.enableBalancer) )
                        {
                            youboraData.setBalancedResource(false);
                            if ( !SmartPlugin.isJoinSent )
                            {
                                SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
                            }
                            if ( !SmartPlugin.isStartSent )
                            {
                                if( (isNaN(SmartPlugin.duration) ) || (SmartPlugin.duration == "NaN") || SmartPlugin.suration == NaN ){ SmartPlugin.duration = 0; }
                                SmartPlugin.apiClass.sendStart ( 0 , window.location.href , "" , youboraData.getLive() , SmartPlugin.videoPlayer.currentSrc() , SmartPlugin.duration,youboraData.getTransaction() );
                                SmartPlugin.setPing(); 
                                SmartPlugin.setBufferChecker();
                                SmartPlugin.isStartSent = true;
                            }
                           
                        }
                        if ( SmartPlugin.isPaused )
                        {
                            SmartPlugin.apiClass.sendResume();
                            SmartPlugin.isPaused = false;
                        }
                        
                    }
                }
                catch ( error )
                {
                    if ( SmartPlugin.debug )
                    {
                        console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: play :: Error: " + error );
                    }
                }
            break;

            case "canplay":
                try
                {
                    if ( !SmartPlugin.isJoinSent )
                    {
                        SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
                    }
                }
                catch ( error )
                {
                    if ( SmartPlugin.debug )
                    {
                        console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: canplay :: Error: " + error );
                    }
                }
            break;

            case "pause":
                try
                {

                    if(!SmartPlugin.seeking){
                        SmartPlugin.checkBuffering();
                        if ( SmartPlugin.isStartSent ) { SmartPlugin.apiClass.sendPause(); }
                        SmartPlugin.isPaused = true; 
                    }
                }
                catch ( error )
                {
                    if ( SmartPlugin.debug )
                    {
                        console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: pause :: Error: " + error );
                    }
                }
            break;

            case "ended":
                try
                {
                    SmartPlugin.checkBuffering();               
                    SmartPlugin.reset();
                }
                catch ( error )
                {
                    if ( SmartPlugin.debug )
                    {
                        console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: ended :: Error: " + error );
                    }
                }
            break;

            case "error":
                try 
                {
                     console.log(SmartPlugin.videoPlayer);
                    if ( youboraData.getBalanceEnabled() && SmartPlugin.apiClass.enableBalancer )
                    {
                        if ( SmartPlugin.debug )
                        {
                            console.log("SmartPlugin :: "+ SmartPlugin.pluginName  +" :: playerError :: Balancing..."); 
                        }
                        SmartPlugin.isStreamError = true;
                        SmartPlugin.apiClass.sendErrorWithParameters("131" + SmartPlugin.getBalancerErrorCount(), "CDN_PLAY_FAILURE", 0, window.location.href, "", youboraData.getLive(), SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['URL'], SmartPlugin.videoPlayer.duration());
                        SmartPlugin.balanceIndex++;
                        SmartPlugin.refreshBalancedResource();
                    }
                    else
                    {
                        console.log(e);
                        var error="3001";
                        var message="";
                        try{
                            error = SmartPlugin.videoPlayer.error().code;
                            message = SmartPlugin.videoPlayer.error().message;
                            if(error !=null || error!=undefined){
                                error = SmartPlugin.errors[error];
                            }
                            if(error ==undefined){
                                error ="3001";
                            }
                        }catch(e){
                            console.log(e);
                        }
                        SmartPlugin.isStreamError = true;
                        SmartPlugin.checkBuffering();             
                        clearInterval(SmartPlugin.pingTimer); 
                        SmartPlugin.apiClass.sendErrorWithParameters(error, message, 0, window.location.href, "", youboraData.getLive(), SmartPlugin.videoPlayer.currentSrc(),  SmartPlugin.videoPlayer.duration());
                        //SmartPlugin.apiClass.sendError( error , "PLAY_FAILURE");  
                        SmartPlugin.reset();
                    } 
                }
                catch ( error )
                {
                    if ( SmartPlugin.debug )
                    {
                        console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: error :: Error: " + error );
                    }
                }
            break;

            case "abort": 
                try 
                {
                   

                }
                catch ( error )
                {
                    if ( SmartPlugin.debug )
                    {
                        console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: abort :: Error: " + error );
                    }
                }
            break;

            
            case "progress":
                         
            break;

            case "waiting":  
                try
                { 
                    if(!SmartPlugin.seeking){ 
                        if(SmartPlugin.isBuffering == false) {
                            SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
                            SmartPlugin.isBuffering = true;  
                        }
                     } 
                }
                catch ( error )
                {
                    if ( SmartPlugin.debug )
                    {
                        console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: waiting :: Error: " + error );
                    }
                }
            break;

            case "playing": 
                try
                {
                    SmartPlugin.checkBuffering();
                    if ( !SmartPlugin.isJoinSent )
                    {
                        SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_END);
                    }
                }
                catch ( error )
                {
                    if ( SmartPlugin.debug )
                    {
                        console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: playing :: Error: " + error );
                    }
                }
            break; 

            case "seeking":
                SmartPlugin.seeking =true;
                SmartPlugin.isBuffering=false;
            break;

            case "seeked":
                SmartPlugin.seeking =false;
                SmartPlugin.isBuffering=false;
                SmartPlugin.endSeekDate = new Date().getTime();
            break;

            case "stalled":
               /*if ( SmartPlugin.currentTime > 0 & !SmartPlugin.isBuffering && !SmartPlugin.isPaused) {
                    if ( SmartPlugin.previousElapsedTime >= SmartPlugin.videoPlayer.currentTime ) {
                       SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
                       SmartPlugin.isBuffering=true;
                   }
                }*/
            break;
        }
    },
    setBufferChecker :function()
    {
        bufferCheckTimer = setTimeout(function(){ SmartPlugin.bufferChecker(); }, 300);

    },

    bufferChecker :function(){
        
        //console.log("PROGRESS : Previous Time : " + SmartPlugin.previousElapsedTime + " , current :  "+ SmartPlugin.videoPlayer.currentTime() +" , isBuffering : " + SmartPlugin.isBuffering + " ! is Paused : " + !SmartPlugin.isPaused + " ! is Seeking : " + !SmartPlugin.seeking );
        try{
         if ( SmartPlugin.videoPlayer.currentTime() > 0 && !SmartPlugin.isBuffering && !SmartPlugin.isPaused && !SmartPlugin.seeking) {
                    var now = new Date().getTime();
                      if ( (SmartPlugin.previousElapsedTime >= SmartPlugin.videoPlayer.currentTime()) && (SmartPlugin.videoPlayer.currentTime() < SmartPlugin.videoPlayer.duration())) {
                        SmartPlugin.bufferTryCount ++;
                        if (SmartPlugin.bufferTryCount >=2 ) {
                           SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
                           SmartPlugin.isBuffering=true;
                           SmartPlugin.bufferTryCount =0;
                        }
                    }
                }  
        }catch(e){
            console.log(e);
        }
        SmartPlugin.previousElapsedTime = SmartPlugin.videoPlayer.currentTime();
        SmartPlugin.setBufferChecker();
    },

    getBalancerErrorCount: function ( )
    {
        if      ( SmartPlugin.balanceIndex < 10 ) { return "0" + SmartPlugin.balanceIndex; }
        else if ( SmartPlugin.balanceIndex > 10 ) { return SmartPlugin.balanceIndex; }
        else    { return "00"; }
    },
    refreshBalancedResource: function ( ) 
    {    
        try 
        {
            if ( typeof SmartPlugin.balanceObject[SmartPlugin.balanceIndex] != "undefined" )
            {
                SmartPlugin.videoPlayer.src(SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['URL']);
                SmartPlugin.videoPlayer.load()
            }
            else
            {
                youboraData.setBalanceEnabled(false);
                console.log("ORIGINAL RESOURCE: " + SmartPlugin.originalResource);
                SmartPlugin.videoPlayer.src(SmartPlugin.originalResource);
                SmartPlugin.videoPlayer.load()
                
                if ( SmartPlugin.debug )
                {
                    console.log("SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Balancer :: Error :: End of mirrors"); 
                }   
            }
        } 
        catch ( error )
        {
            if ( SmartPlugin.debug )
             {
                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Balancer :: Error :: End of mirrors error:" + error ); 
            }
        }
    },
    setBalancedResource: function(obj) 
    {  
        try
        {

            if(obj != false)
            { 
                var indexCount = 0;
                for (index in obj) { indexCount++; } 

                SmartPlugin.balanceObject = obj;
                SmartPlugin.balanceObject[''+ (indexCount+1) +''] = new Object();
                SmartPlugin.balanceObject[''+ (indexCount+1) +'']['URL'] = youboraData.getMediaResource();

                if ( typeof obj['1']['URL'] != "undefined" ) 
                { 
                    if ( SmartPlugin.debug )
                    {
                        console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Balance Current Resource  :: " + SmartPlugin.urlResource );
                        console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Balance Priority Resource :: " + obj['1']['URL'] ); 
                    }
                    if(obj['1']['URL'] != SmartPlugin.originalResource)
                    {

                        if ( SmartPlugin.debug )
                        {
                            console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Balancing :: " + obj['1']['URL'] );  
                        }
                        try
                        {
                           
                            SmartPlugin.videoPlayer.src(obj['1']['URL']);
                            youboraData.setCDN(obj['1']['CDN_CODE']);
                            SmartPlugin.videoPlayer.pause();
                            SmartPlugin.videoPlayer.load();
                            //SmartPlugin.videoPlayer.play(); 
                        }
                        catch ( error )
                        {
                            if ( SmartPlugin.debug )
                            {
                                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Balancing :: Error While Changing Media: "+ error ); 
                            }
                            SmartPlugin.videoPlayer.src(obj['1']['URL']);
                            SmartPlugin.videoPlayer.load();
                        } 
                    } 
                    else 
                    {
                        if ( SmartPlugin.debug )
                        {
                            console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Balancer :: Same Resource" );   
                        }
                        youboraData.setBalanceEnabled(false);
                        SmartPlugin.videoPlayer.src(SmartPlugin.originalResource);
                        SmartPlugin.videoPlayer.load();

                    } 
                }
                else 
                {
                    if ( SmartPlugin.debug )
                    {
                        console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Invalid balance object" ); 
                    }
                    SmartPlugin.videoPlayer.load();
                }
            }
            else 
            {
                if ( SmartPlugin.debug )
                {
                    console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Balance unavailable with current parameters" ); 
                }
                SmartPlugin.balanceObject = "false";
                SmartPlugin.videoPlayer.load();
            }
        } 
        catch ( error ) 
        { 
            if ( SmartPlugin.debug )
            {
                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: setBalancedResource :: Error: " + error );
            }
        }
    }, 
    checkBuffering: function ( ) 
    { 
        try
        {
            if ( SmartPlugin.isBuffering ) 
            { 
               
                if ( SmartPlugin.isStartSent ) { SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_END); }
                SmartPlugin.isBuffering = false; 
                
            } 
        } 
        catch ( error ) 
        { 
            if ( SmartPlugin.debug )
            {
                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: checkBuffering :: Error: " + error );
            }
        }
    },
    setBufferEvent: function ( bufferState )
    {
        try {

            var d               = new Date();
            var bufferTimeEnd   = 0;
            var bufferTimeTotal = 0;

            switch ( bufferState )
            {
                case SmartPlugin.mediaEvents.BUFFER_BEGIN:
                
                    SmartPlugin.bufferTimeBegin = d.getTime();
                    if(SmartPlugin.joinTimeBegin == 0) { SmartPlugin.joinTimeBegin = d.getTime(); }

                break;
            
                case SmartPlugin.mediaEvents.BUFFER_END:
                
                    bufferTimeEnd           = d.getTime();
                    bufferTimeTotal         = bufferTimeEnd - SmartPlugin.bufferTimeBegin;
 
                    if ( SmartPlugin.isJoinSent == false )
                    {
                        var joinTimeTotal = d.getTime() - SmartPlugin.joinTimeBegin;
                        if ( SmartPlugin.isStartSent ) 
                        { 
                            SmartPlugin.apiClass.sendJoin( SmartPlugin.currentTime ,  joinTimeTotal ); 
                            SmartPlugin.isJoinSent  = true;
                        }
                        if ( SmartPlugin.debug )
                        {
                            console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: setBufferEvent :: sendJoin");
                        }
                    } 
                    else 
                    {
                        var currentTime = SmartPlugin.currentTime;
                        if(currentTime == 0 && SmartPlugin.isLive) { currentTime = 10; }                        
                        if (SmartPlugin.isStartSent && bufferTimeTotal >=100) { 
                            SmartPlugin.apiClass.sendBuffer( currentTime , bufferTimeTotal ); 
                            SmartPlugin.progressCount = 0;
                        }
                        if ( SmartPlugin.debug )
                        {
                            console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: setBufferEvent :: sendBuffer");
                        }
                    }

                break;
            }
        } 
        catch ( error ) 
        { 
            if ( SmartPlugin.debug )
            {
                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: setBufferEvent :: Error: " + error );
            }
        }
    },
    setPing: function()
    {  
        try 
        {
            SmartPlugin.pingTimer = setTimeout( function() { SmartPlugin.ping(); } , SmartPlugin.apiClass.getPingTime() ); 
        }
        catch ( error )
        {
            if ( SmartPlugin.debug )
            {
                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: setPing :: Error: " + error );
            }            
        }
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
                SmartPlugin.apiClass.sendPingTotalBitrate( "-1" , SmartPlugin.currentTime );
            }
        } 
        catch ( error ) 
        { 
            if ( SmartPlugin.debug )
            {
                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: PÃ®ng :: Error: " + error );
            }
        }
    },
    defineWatch: function ( )
    {
        try
        {
            if (!Object.prototype.watch) {
                Object.defineProperty(Object.prototype, "watch", {
                    enumerable: false , configurable: true , writable: false , 
                    value: function (prop, handler) { 
                    var oldval = this[prop] , newval = oldval, 
                    getter = function () { return newval; },
                    setter = function (val) { oldval = newval; return newval = handler.call(this, prop, oldval, val); };
                        if (delete this[prop]) { 
                            Object.defineProperty(this, prop, { get: getter , set: setter , enumerable: true , configurable: true });
                        }
                    }
                });
            }
            if (!Object.prototype.unwatch) {
                Object.defineProperty(Object.prototype, "unwatch", { enumerable: false , configurable: true , writable: false ,
                    value: function (prop) { var val = this[prop]; delete this[prop]; this[prop] = val; }
                });
            }
            SmartPlugin.setWatch();
        }
        catch ( error )
        {
            if ( SmartPlugin.debug )
            {
                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: defineWatch :: Error: " + error );
            }             
        }
    },
    setWatch: function ( )
    { 
        try
        {
            var varsToWatch = [ "balanceObject" , "balanceIndex", "videoPlayer", "urlResource", "currentTime", "isStreamError", "isBuffering", "isStartSent" , "isJoinSent" , "isPaused" , "bufferTimeBegin" , "joinTimeBegin" , "joinTimeEnd" ];
            for ( elem in varsToWatch ) 
            {
                if ( typeof varsToWatch[elem] != "function" )
                {
                    SmartPlugin.watch(varsToWatch[elem], function ( id , oldVal , newVal ) {  
                        console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Watcher :: ["  + id + "] From: [" + oldVal + "] To: [" + newVal + "]");
                        return newVal;
                    });    
                }
            } 
        }
        catch ( error )
        {
            if ( SmartPlugin.debug )
            {
                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: setWatch :: Error: " + error );
            }             
        }
    },
    reset: function ( )
    {
        try
        { 
           clearTimeout(SmartPlugin.pingTimer);
           clearTimeout(SmartPlugin.bufferCheckTimer);
           SmartPlugin.apiClass.sendStop(); 
           SmartPlugin.currentTime = 0; 
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
           SmartPlugin.balanceIndex = 1;
           SmartPlugin.balanceObject = "";
           SmartPlugin.apiClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, SmartPlugin.pluginVersion, SmartPlugin.targetDevice);  
        }
        catch ( error ) 
        {
            if ( SmartPlugin.debug )
            {
                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: reset :: Error: " + error );
            }
        }   
    },


}   