var SmartPlugin = { 
    debug: youboraData.getDebug(),
    balancing: youboraData.getBalanceEnabled(),
    balanceObject: "",
    balanceIndex: 1,
    bandwidth: { username: youboraData.getUsername(), interval: 6000},
    headTimer: "",
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
            console.log ( "SmartPlugin :: PS3 :: Init function" );

            SmartPlugin.replaceFunctions();
            SmartPlugin.setAccessFunction();
            SmartPlugin.setMetadata(youboraData.getProperties()); 
            SmartPlugin.communicationClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, '2.0.0', 'PS3');
             
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
                console.log('SmartPlugin :: PS3 :: Balancer :: Error :: End of mirrors'); 
            }
        } 
        catch (e)
        {
            console.log('SmartPlugin :: PS3 :: Balance Resource :: Error: '+ e); 
        }
    },
    setBalancedResource: function(obj) {  
        if(obj != false)
        {
            SmartPlugin.balanceObject = obj;
            if (typeof obj['1']['URL'] != "undefined") 
            { 
              console.log('SmartPlugin :: PS3 :: Balance Current Resource  :: ' + youboraData.getMediaResource());
              console.log('SmartPlugin :: PS3 :: Balance Priority Resource :: ' + obj['1']['URL']); 
              if(obj['1']['URL'] != youboraData.getMediaResource())
              {
                console.log('SmartPlugin :: PS3 :: Balancing :: ' + obj['1']['URL']);  
                try
                {
                    var stringCall = '{"command":"load","contentUri":"'+ obj['1']['URL'] +'"}';
                    SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration );
                    SmartPlugin.setPing();
                    SmartPlugin.isStartSent = true; 
                    SmartPlugin.PS3CommandFunction(stringCall);
                }
                catch (err)
                {
                    console.log('SmartPlugin :: PS3 :: Balancing :: Error While Changing Media: '+ err); 
                    var stringCall = '{"command":"load","contentUri":"'+ SmartPlugin.urlResource +'"}';
                    SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration );
                    SmartPlugin.setPing();
                    SmartPlugin.isStartSent = true; 
                    SmartPlugin.PS3CommandFunction(stringCall);
                } 

              } 
              else {
                console.log('SmartPlugin :: PS3 :: Balancer :: Same Resource');  
                var stringCall = '{"command":"load","contentUri":"'+ SmartPlugin.urlResource +'"}'
                SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration );
                SmartPlugin.setPing();
                SmartPlugin.isStartSent = true; 
                SmartPlugin.PS3CommandFunction(stringCall);
              } 
           }
            else 
            {
               console.log('SmartPlugin :: PS3 :: Invalid balance object'); 
                var stringCall = '{"command":"load","contentUri":"'+ SmartPlugin.urlResource +'"}'
                SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration );
                SmartPlugin.setPing();
                SmartPlugin.isStartSent = true; 
                SmartPlugin.PS3CommandFunction(stringCall);
            }
        }
        else 
        {
          console.log('SmartPlugin :: PS3 :: Balance unavailable with current parameters'); 
            var stringCall = '{"command":"load","contentUri":"'+ SmartPlugin.urlResource +'"}'
            SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration );
            SmartPlugin.setPing();
            SmartPlugin.isStartSent = true; 
            SmartPlugin.PS3CommandFunction(stringCall);
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
    setAccessFunction: function() {
        SmartPlugin.accessfunction = window.accessfunction;
        try {
            window.accessfunction =  function (json) {
                
                var data = JSON.parse(json); 
                console.log('SmartPlugin :: PS3 :: accessfunction :: ' + json); 
                switch (data.command) 
                {
                  case 'playerError':   
                    if(SmartPlugin.balancing)
                    {
                        SmartPlugin.playerStreamingError = true;
                        console.log('SmartPlugin :: PS3 :: playerError :: Balancing...'); 
                        SmartPlugin.balanceIndex++;
                        SmartPlugin.refreshBalancedResource();
                    }
                    else
                    {
                        SmartPlugin.playerStreamingError = true;
                        SmartPlugin.checkBuffering();             
                        clearInterval(SmartPlugin.headTimer); 
                        SmartPlugin.communicationClass.sendError( data.error_code , data.error ); 
                        SmartPlugin.communicationClass.sendStop();
                        SmartPlugin.reset();
                    } 
                  break;
                  case 'playerStreamingError': 
                    if(SmartPlugin.balancing)
                    {
                        SmartPlugin.playerStreamingError = true;
                        console.log('SmartPlugin :: PS3 :: playerStreamingError :: Balancing...'); 
                        SmartPlugin.balanceIndex++;
                        SmartPlugin.refreshBalancedResource();
                    }
                    else
                    {
                        SmartPlugin.playerStreamingError = true;
                        SmartPlugin.checkBuffering();             
                        clearInterval(SmartPlugin.headTimer); 
                        SmartPlugin.communicationClass.sendError( data.error_code , data.error ); 
                        SmartPlugin.communicationClass.sendStop();
                        SmartPlugin.reset();
                    }
                  break;
                  case 'playerStatusChange': 
                    SmartPlugin.statusChange(data.playerState);
                  break;
                  case 'getPlaybackTime':  
                    if (SmartPlugin.previousElapsedTime != data.elapsedTime) {
                        SmartPlugin.checkBuffering();
                    }
                    SmartPlugin.previousElapsedTime = data.elapsedTime;
                  break;
                  case 'contentAvailable':
                    if(data.totalLength == "0") { SmartPlugin.isLive = true; }
                    SmartPlugin.duration = data.totalLength;
                    SmartPlugin.checkBuffering(); 

                  break;
                } 
                SmartPlugin.accessfunction(json);
            }

        } 
        catch(e) 
        { 
            console.log ( "SmartPlugin :: PS3 :: Error " + e );
        }

    },
    replaceFunctions: function () {

        SmartPlugin.PS3CommandFunction = window.external.user;

        try 
        {
            window.external.user = function (json) 
            {  
                console.log('SmartPlugin :: PS3 :: external :: ' + json); 
                var data = JSON.parse(json);   
                switch (data.command) 
                {
                    case 'load': 

                        if      (typeof data.fileName   != "undefined")  { SmartPlugin.urlResource = data.fileName; }
                        else if (typeof data.contentUri != "undefined")  { SmartPlugin.urlResource = data.contentUri; }  

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
                                SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration );
                                SmartPlugin.setPing();
                                SmartPlugin.isStartSent = true; 
                            }
                         }

                        break;
                }
                if ( SmartPlugin.isStartSent)
                {
                    SmartPlugin.PS3CommandFunction(json);
                }

            }

        } 
        catch(e) 
        { 
            console.log ( "SmartPlugin :: PS3 :: Error " + e );
        }
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
            console.log ( "SmartPlugin :: PS3 :: Error " + e );
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
            console.log ( "SmartPlugin :: PS3 :: Error: " + e );
        }
    },   
    statusChange: function (status)
    {
        try
        {
            console.log ( "SmartPlugin :: PS3 :: Status " + status );

            switch (status)  {
                case 'paused': 
                    SmartPlugin.checkBuffering(); 

                    if (SmartPlugin.isStartSent)    SmartPlugin.communicationClass.sendPause();

                    SmartPlugin.paused = true;
                break;
                case 'stopped':
                    if(SmartPlugin.isStartSent)
                    {
                        SmartPlugin.checkBuffering();             
                        clearInterval(SmartPlugin.headTimer);

                        if (SmartPlugin.isStartSent)    SmartPlugin.communicationClass.sendStop(); 

                        SmartPlugin.reset();
                    }
                break;
                case 'playing':
                    if( SmartPlugin.paused )
                    {   
                        if (SmartPlugin.isStartSent)    SmartPlugin.communicationClass.sendResume();
                    }
                    SmartPlugin.paused = false; 
                    SmartPlugin.playerStreamingError = false;
                break;
                case 'buffering':
                    SmartPlugin.setBufferEvent(SmartPlugin.SmartPluginsEvents.BUFFER_BEGIN);
                    SmartPlugin.buffering = true;
                break;
                case 'opening': 
                    if(SmartPlugin.playerStreamingError == false) {
                        SmartPlugin.setBufferEvent(SmartPlugin.SmartPluginsEvents.BUFFER_BEGIN);
                        SmartPlugin.buffering = true;
                        SmartPlugin.previousElapsedTime = 0; 
                        if(SmartPlugin.headTimer == "")
                        {
                          SmartPlugin.headTimer = setInterval(function() { window.external.user('{"command":"getPlaybackTime"}'); }, 500);
                        } 
                    }
                break;
                case 'endOfStream':  
                    SmartPlugin.checkBuffering();             
                    clearInterval(SmartPlugin.headTimer);
                    if (SmartPlugin.isStartSent) SmartPlugin.communicationClass.sendStop();
                    SmartPlugin.reset();
                break;
                default:  
                    if (SmartPlugin.isStartSent) SmartPlugin.communicationClass.sendError( 'UNKNOWN_ERROR', 'Player reports error but error type is not identified.' );
                    if (SmartPlugin.isStartSent) SmartPlugin.communicationClass.sendStop(); 
                break;
            }
        }
        catch(e) 
        { 
            console.log ( "SmartPlugin :: PS3 :: Error " + e ); 
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
            console.log ( "SmartPlugin :: PS3 :: Error " + e );
        }   
    }
}   