var SmartPlugin = { 
    debug: youboraData.getDebug(),
    balancing: youboraData.getBalanceEnabled(),
    balanceObject: "",
    balanceIndex: 1,
    bandwidth: { username: youboraData.getUsername(), interval: 6000},
    headTimer: "",
    videoPlayer: "",
    currentTime: 0,
    urlResource: "",
    originalResource: "",
    isLive: youboraData.getLive(),
    duration: 0,
    communicationClass: "",
    previousElapsedTime: 0, 
    service: youboraData.getService(),
    metadata: {}, 
    buffering: false,
    paused: false,
    streamError: false,
    bufferTimeBegin: 0,
    playerEvents: [ "canplay" , "playing" , "waiting", "timeupdate", "ended", "play", "pause", "error", "abort" ],
    isStartSent: false,
    isJoinEventSent: false, 
    joinTimeBegin: 0,
    joinTimeEnd: 0,
    accessfunction: '',
    isBufferRunning: false,
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
            if ( spYoubora.isYouboraApiLoaded () == false ) 
            {
                console.log( "SmartPlugin :: SONYTV :: Init :: Api Not Ready...");
                setTimeout("SmartPlugin.Init()",200);
            }
            else 
            {
                try
                {
                    if ( typeof document.getElementsByTagName("video")[0] != "undefined")
                    {
                        SmartPlugin.videoPlayer = document.getElementsByTagName("video")[0];
                        SmartPlugin.setMetadata(youboraData.getProperties()); 
                        SmartPlugin.communicationClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, '2.0.0', 'HTML5_VideoPlayer');  
                        SmartPlugin.bindEvents();
                        spLoaded = true;
                    }
                    else
                    {
                        console.log( "SmartPlugin :: SONYTV :: Init :: No <video> found.");
                        spLoaded = false;
                    };
                }
                catch(err)
                { 
                    console.log( "SmartPlugin :: SONYTV :: Init :: Error: " + err );
                    spLoaded = false;
                }
            } 
        }
        catch(err)
        { 
            console.log( "SmartPlugin :: SONYTV :: Init :: Error: " + err );
            spLoaded = false;
        }
    },
    bindEvents: function() {
        for ( var i in SmartPlugin.playerEvents ) 
        {
            SmartPlugin.videoPlayer.addEventListener(SmartPlugin.playerEvents[i], function(e){ SmartPlugin.checkPlayState(e); }, false);
        }
    },
    checkPlayState: function(e) {

        console.log( "SmartPlugin :: SONYTV :: checkPlayState :: " + e.type);

        switch (e.type)
        {
            case "timeupdate":
                try
                {
                    if (SmartPlugin.previousElapsedTime != SmartPlugin.videoPlayer.currentTime) {
                        SmartPlugin.checkBuffering();
                    }
                    SmartPlugin.previousElapsedTime = SmartPlugin.videoPlayer.currentTime;
                }
                 catch ( err )
                 {
                     console.log( "SmartPlugin :: SONYTV :: timeupdate :: Error: " + err);
                 }
                break;

            case "play":
                try 
                {
                    SmartPlugin.urlResource = SmartPlugin.videoPlayer.getElementsByTagName('source')[0].src; 
                    if ( SmartPlugin.urlResource != "" ) 
                    {
                        if(SmartPlugin.balancing)
                        {
                            var path = SmartPlugin.urlResource.replace(/^.*\/\/[^\/]+/, '');
                            if(SmartPlugin.isStartSent)
                            {
                                SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration );
                                SmartPlugin.setPing(); 
                            }
                            else
                            {
                              SmartPlugin.communicationClass.getBalancedResource(path , function(obj) { SmartPlugin.setBalancedResource(obj); });
                            }
                        } else {
                            console.log( "SmartPlugin :: SONYTV :: play :: Error getting SRC of video ");
                            SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration );
                            SmartPlugin.setPing();
                            SmartPlugin.isStartSent = true; 
                        }
                    }
                 }
                 catch ( err )
                 {
                    console.log( "SmartPlugin :: SONYTV :: play :: Error: " + err);
                 }
                break;

            case "canplay":
                if(SmartPlugin.playerStreamingError == false) {
                    SmartPlugin.setBufferEvent(SmartPlugin.SmartPluginsEvents.BUFFER_BEGIN);
                    SmartPlugin.buffering = true;
                    SmartPlugin.previousElapsedTime = 0;  
                }   
                break;

            case "pause":
                SmartPlugin.checkBuffering(); 
                if (SmartPlugin.isStartSent)  SmartPlugin.communicationClass.sendPause();
                SmartPlugin.paused = true; 
                break;

            case "ended":
                SmartPlugin.checkBuffering();             
                clearInterval(SmartPlugin.headTimer);
                if (SmartPlugin.isStartSent) SmartPlugin.communicationClass.sendStop();
                SmartPlugin.reset();
                break;

            case "error":
                if(SmartPlugin.balancing)
                {
                    SmartPlugin.playerStreamingError = true;
                    console.log('SmartPlugin :: SONYTV :: playerError :: Balancing...'); 
                    SmartPlugin.balanceIndex++;
                    SmartPlugin.refreshBalancedResource();
                }
                else
                {
                    SmartPlugin.playerStreamingError = true;
                    SmartPlugin.checkBuffering();             
                    clearInterval(SmartPlugin.headTimer); 
                    SmartPlugin.communicationClass.sendError( "error" , "error" ); 
                    SmartPlugin.communicationClass.sendStop();
                    SmartPlugin.reset();
                } 
                break;

            case "abort": 
                if(SmartPlugin.balancing)
                {
                    SmartPlugin.playerStreamingError = true;
                    console.log('SmartPlugin :: SONYTV :: playerError :: Balancing...'); 
                    SmartPlugin.balanceIndex++;
                    SmartPlugin.refreshBalancedResource();
                }
                else
                {
                    SmartPlugin.playerStreamingError = true;
                    SmartPlugin.checkBuffering();             
                    clearInterval(SmartPlugin.headTimer); 
                    SmartPlugin.communicationClass.sendError( "abort" , "abort" ); 
                    SmartPlugin.communicationClass.sendStop();
                    SmartPlugin.reset();
                } 
                break;

            case "waiting": 
                SmartPlugin.setBufferEvent(SmartPlugin.SmartPluginsEvents.BUFFER_BEGIN);
                SmartPlugin.buffering = true;
                break;

            case "playing": 


                if ( !this.isJoinEventSent && this.isBufferRunning )
                {
                    this.join(SmartPluginAnalyticsEvents.BUFFER_END);
                }
                else if ( this.bufferCounter > 0 && this.isStartEventSent && !this.isPauseEventSent && this.isBufferRunning )
                {
                    this.buffer(SmartPluginAnalyticsEvents.BUFFER_END);
                }

                if (this.isStartEventSent && !this.isJoinEventSent)
                {
                    this.isBufferRunning = false;
                    this.join(SmartPluginAnalyticsEvents.JOIN_SEND);
                }

                this.bufferCounter      = 0;
                this.isBufferRunning    = false;

                break; 
        }
    },
    refreshBalancedResource: function () {    
        try 
        {
            if(typeof SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['URL'] != "undefined")
            {
                SmartPlugin.videoPlayer.getElementsByTagName('source')[0].src = SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['URL'] ;
                SmartPlugin.videoPlayer.load()
                SmartPlugin.videoPlayer.play();
            }
            else
            {
                console.log('SmartPlugin :: SONYTV :: Balancer :: Error :: End of mirrors'); 
            }
        } 
        catch (e)
        {
            console.log('SmartPlugin :: SONYTV :: Balancer :: Error :: End of mirrors'); 
        }
    },
    setBalancedResource: function(obj) {  
        if(obj != false)
        {
            SmartPlugin.balanceObject = obj;
            if (typeof obj['1']['URL'] != "undefined") 
            { 
              console.log('SmartPlugin :: SONYTV :: Balance Current Resource  :: ' + youboraData.getMediaResource());
              console.log('SmartPlugin :: SONYTV :: Balance Priority Resource :: ' + obj['1']['URL']); 
              if(obj['1']['URL'] != youboraData.getMediaResource())
              {
                console.log('SmartPlugin :: SONYTV :: Balancing :: ' + obj['1']['URL']);  
                try
                {
                    SmartPlugin.videoPlayer.getElementsByTagName('source')[0].src = obj['1']['URL'];
                    SmartPlugin.videoPlayer.load()
                    SmartPlugin.videoPlayer.play();
                    SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration );
                    SmartPlugin.setPing();
                    SmartPlugin.isStartSent = true; 
                }
                catch (err)
                {
                    console.log('SmartPlugin :: SONYTV :: Balancing :: Error While Changing Media: '+ err); 
                    SmartPlugin.videoPlayer.getElementsByTagName('source')[0].src = SmartPlugin.urlResource;
                    SmartPlugin.videoPlayer.load()
                    SmartPlugin.videoPlayer.play();
                    SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration );
                    SmartPlugin.setPing();
                    SmartPlugin.isStartSent = true; 
                } 

              } 
              else {
                console.log('SmartPlugin :: SONYTV :: Balancer :: Same Resource');   
                SmartPlugin.videoPlayer.play();
                SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration );
                SmartPlugin.setPing();
                SmartPlugin.isStartSent = true;  
              } 
           }
            else 
            {
               console.log('SmartPlugin :: SONYTV :: Invalid balance object'); 
                SmartPlugin.videoPlayer.play();
                SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration );
                SmartPlugin.setPing();
                SmartPlugin.isStartSent = true;  
            }
        }
        else 
        {
          console.log('SmartPlugin :: SONYTV :: Balance unavailable with current parameters'); 
            SmartPlugin.videoPlayer.play();
            SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration );
            SmartPlugin.setPing();
            SmartPlugin.isStartSent = true; 
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
            if (SmartPlugin.isStartSent)    SmartPlugin.setBufferEvent(SmartPlugin.SmartPluginsEvents.BUFFER_END);
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
            console.log ( "SmartPlugin :: SONYTV :: Error " + e );
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
            clearTimeout(SmartPlugin.pingTimer);
            SmartPlugin.pingTimer = null;
            SmartPlugin.setPing();            
            if (SmartPlugin.isStartSent) 
            {
                SmartPlugin.communicationClass.sendPingTotalBytes( 0 , SmartPlugin.currentTime );
            }
        } 
        catch(e) 
        { 
            console.log ( "SmartPlugin :: SONYTV :: Error: " + e );
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
           SmartPlugin.balanceIndex = 1;
           SmartPlugin.balanceObject = "";
        }
        catch(error) 
        {
            console.log ( "SmartPlugin :: SONYTV :: Error " + e );
        }   
    }
}   