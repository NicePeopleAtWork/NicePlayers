/*
 * YouboraCommunication 
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Lluís Campos Beltran
 * Version: 3.1.0 
 *  - Full Revision
 */
var SmartPlugin = { 
    // General
    debug: youboraData.getDebug(),
    isLive: youboraData.getLive(), 
    bandwidth: { username: youboraData.getUsername(), interval: 6000},
    targetDevice: "SONY-HTML5",
    pluginName: "SONYTV",
    pluginVersion: "3.1.0",
    initDone: 0, 
    // Balancer
    balancing: youboraData.getBalanceEnabled(),
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
    seeking:false,
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
                SmartPlugin.videoPlayer = document.getElementsByTagName('video')[0]; 
                SmartPlugin.duration =  SmartPlugin.videoPlayer.duration;
                if ( SmartPlugin.debug )
                {
                    console.log( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: startPlugin :: HTML5 <video> found!" );
                }  
                SmartPlugin.apiClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, SmartPlugin.pluginVersion, SmartPlugin.targetDevice);  
                SmartPlugin.bindEvents(); 
            }
            catch ( error )
            { 
                if ( SmartPlugin.debug )
                {
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
            var playerEvents = [ "canplay" , "playing" , "waiting", "timeupdate", "ended", "play", "pause", "error", "abort" ];

            for ( elem in playerEvents ) 
            { 
                SmartPlugin.videoPlayer.addEventListener( playerEvents[elem], function ( e ) { SmartPlugin.checkPlayState(e); }, false);
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

        if ( navigator.userAgent.toLowerCase().indexOf("firefox") > 0 )
        {
            console.log('Firefox BitRate');
            return "-1"; 
        }
        else if ( 1 == 2)
        {
            return "-1"; 

        }
        else 
        { 
            return "-1"; 
        }
    },
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
                    SmartPlugin.duration =  SmartPlugin.videoPlayer.duration;
                    SmartPlugin.urlResource = SmartPlugin.videoPlayer.currentSrc;
                    SmartPlugin.currentTime = SmartPlugin.videoPlayer.currentTime;

                    if ( SmartPlugin.currentTime > 0 ) {
                        if ( SmartPlugin.previousElapsedTime != SmartPlugin.videoPlayer.currentTime ) {
                            SmartPlugin.checkBuffering();
                        }

                        if ( !SmartPlugin.isStartSent )
                        {
                            SmartPlugin.apiClass.sendStart ( 0 , window.location.href , "" , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration );
                            SmartPlugin.setPing(); 
                            SmartPlugin.isStartSent = true;
                        }
                        
                        if ( !SmartPlugin.isJoinSent )
                        {
                            SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_END);
                        }
                        SmartPlugin.previousElapsedTime = SmartPlugin.videoPlayer.currentTime;
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
                    SmartPlugin.urlResource = SmartPlugin.videoPlayer.currentSrc; 
                    SmartPlugin.duration =  SmartPlugin.videoPlayer.duration;
                    if ( SmartPlugin.urlResource != "" ) 
                    {
                        if ( SmartPlugin.balancing && SmartPlugin.apiClass.enableBalancer )
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
                                var path = SmartPlugin.apiClass.getResourcePath(SmartPlugin.urlResource);
                                SmartPlugin.apiClass.getBalancedResource(path , function(obj) { SmartPlugin.setBalancedResource(obj); });       
                            } 
                            else
                            {
                                SmartPlugin.balanceIndex++;
                                SmartPlugin.refreshBalancedResource();
                            } 
                        } 
                        else 
                        {
                            youboraData.setBalancedResource(false);
                            if ( !SmartPlugin.isJoinSent )
                            {
                                SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
                            }
                            if ( !SmartPlugin.isStartSent )
                            {
                                SmartPlugin.apiClass.sendStart ( 0 , window.location.href , "" , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration,youboraData.getTransaction() );
                                SmartPlugin.setPing(); 
                                SmartPlugin.isStartSent = true;
                            }
                            if ( SmartPlugin.isPaused )
                            {
                                SmartPlugin.apiClass.sendResume();
                                SmartPlugin.isPaused = false;
                            }
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
                    SmartPlugin.checkBuffering(); 
                    if ( SmartPlugin.isStartSent ) { SmartPlugin.apiClass.sendPause(); }
                    SmartPlugin.isPaused = true; 
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
                    if ( youboraData.getBalanceEnabled() && SmartPlugin.apiClass.enableBalancer )
                    {
                        if ( SmartPlugin.debug )
                        {
                            console.log("SmartPlugin :: "+ SmartPlugin.pluginName  +" :: playerError :: Balancing..."); 
                        }
                        SmartPlugin.isStreamError = true;
                        SmartPlugin.apiClass.sendErrorWithParameters("131" + SmartPlugin.getBalancerErrorCount(), "CDN_PLAY_FAILURE", 0, window.location.href, "", youboraData.getLive(), SmartPlugin.urlResource, SmartPlugin.duration, SmartPlugin.transcode);
                        SmartPlugin.balanceIndex++;
                        SmartPlugin.refreshBalancedResource();
                    }
                    else
                    {
                        Sma.rtPlugin.isStreamError = true;
                        SmartPlugin.checkBuffering();             
                        clearInterval(SmartPlugin.pingTimer); 
                        SmartPlugin.apiClass.sendError( 3001 , "PLAY_FAILURE");  
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
                    if ( SmartPlugin.balancing && SmartPlugin.apiClass.enableBalancer )
                    {
                        SmartPlugin.isStreamError = true;
                        SmartPlugin.apiClass.sendErrorWithParameters("130" + SmartPlugin.getBalancerErrorCount(), "CDN_PLAY_FAILURE_AND_TRY_NEXT", 0, window.location.href, "", youboraData.getLive(), SmartPlugin.urlResource, SmartPlugin.duration);
                        SmartPlugin.balanceIndex++;
                        if ( SmartPlugin.debug )
                        {
                            console.log("SmartPlugin :: "+ SmartPlugin.pluginName  +" :: playerError :: Balancing..."); 
                        }
                        SmartPlugin.refreshBalancedResource();
                    }
                    else
                    {
                        SmartPlugin.isStreamError = true;
                        SmartPlugin.checkBuffering();             
                        clearInterval(SmartPlugin.pingTimer); 
                        SmartPlugin.apiClass.sendError( 3001 , "PLAY_FAILURE");  
                        SmartPlugin.reset();
                    } 

                }
                catch ( error )
                {
                    if ( SmartPlugin.debug )
                    {
                        console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: abort :: Error: " + error );
                    }
                }
            break;

            case "waiting": 
                try
                {
                    if(!SmartPlugin.seeking){
                        SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
                        SmartPlugin.isBuffering = true;  
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
            break;

            case "seeked":
                SmartPlugin.seeking =false;
            break;
        }
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
            if ( typeof SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['URL'] != "undefined" )
            {
                SmartPlugin.videoPlayer.currentSrc = SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['URL'] ;
                SmartPlugin.videoPlayer.load()
                SmartPlugin.videoPlayer.play();
            }
            else
            {
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
                    if(obj['1']['URL'] != SmartPlugin.urlResource)
                    {
                        if ( SmartPlugin.debug )
                        {
                            console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Balancing :: " + obj['1']['URL'] );  
                        }
                        try
                        {
                            SmartPlugin.videoPlayer.currentSrc = obj['1']['URL'];
                            SmartPlugin.videoPlayer.load();
                            SmartPlugin.videoPlayer.play(); 
                        }
                        catch ( error )
                        {
                            if ( SmartPlugin.debug )
                            {
                                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Balancing :: Error While Changing Media: "+ error ); 
                            }
                            SmartPlugin.videoPlayer.currentSrc = SmartPlugin.urlResource;
                            SmartPlugin.videoPlayer.load();
                            SmartPlugin.videoPlayer.play();
                        } 
                    } 
                    else 
                    {
                        if ( SmartPlugin.debug )
                        {
                            console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Balancer :: Same Resource" );   
                        }
                        SmartPlugin.videoPlayer.load();
                        SmartPlugin.videoPlayer.play(); 
                    } 
                }
                else 
                {
                    if ( SmartPlugin.debug )
                    {
                        console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Invalid balance object" ); 
                    }
                    SmartPlugin.videoPlayer.load();
                    SmartPlugin.videoPlayer.play();    
                }
            }
            else 
            {
                if ( SmartPlugin.debug )
                {
                    console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Balance unavailable with current parameters" ); 
                }
                SmartPlugin.videoPlayer.load();
                SmartPlugin.videoPlayer.play();
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
                
                    SmartPlugin.bufferTimeBegin    = d.getTime();
                    if(SmartPlugin.joinTimeBegin == 0) { SmartPlugin.joinTimeBegin    = d.getTime(); }

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
                        if (SmartPlugin.isStartSent) { SmartPlugin.apiClass.sendBuffer( currentTime , bufferTimeTotal ); }
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
                SmartPlugin.apiClass.sendPingTotalBytes( SmartPlugin.getCurrentBitRate() , SmartPlugin.currentTime );
            }
        } 
        catch ( error ) 
        { 
            if ( SmartPlugin.debug )
            {
                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Pîng :: Error: " + error );
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
    }
}   