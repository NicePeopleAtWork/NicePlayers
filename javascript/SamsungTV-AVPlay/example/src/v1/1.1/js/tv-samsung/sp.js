var SmartPlugin = {
   debug: true,
   videoPlayer: "",
   bandwidth: { username: youboraData.getUsername(), interval: 6000},
   headTimer: "",
   balancing: false,
   currentTime: 0,
   urlResource: "",
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
   balanceObject: "",
   balanceIndex: 1,
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
          if(!spLoaded) 
          {
           console.log ( "SmartPlugin :: SMAMSUNGTV :: Init" );           
           var allVideoPlayerObjects = document.getElementsByTagName("object");    
           for (var i=0;i<allVideoPlayerObjects.length;i++)
           {
               try {
                   var clsid = allVideoPlayerObjects[i].getAttribute('classid').replace('clsid:','');
                   if(clsid == "SAMSUNG-INFOLINK-PLAYER") {
                       console.log('SmartPlugin :: SAMSUNGTV :: Video Player Found :: '+ allVideoPlayerObjects[i].GetPlayerVersion());
                       SmartPlugin.videoPlayer = allVideoPlayerObjects[i];
                       if(typeof YouboraCommunication != "undefined")
                       {
                       	SmartPlugin.communicationClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, '2.0.0', 'SAMSUNGTV');
                         if(SmartPlugin.videoPlayersCount == -1) {
                             console.log('SmartPlugin :: SMAMSUNGTV :: No valid player was found...');
                         } else {
                             console.log('SmartPlugin :: SMAMSUNGTV :: Listening...');
                         }
                         spLoaded = true;
                       }
                       else
                       {
                       	console.log('SmartPlugin :: SAMSUNGTV :: youbora-api not present!');
                       	setTimeout(function(){ SmartPlugin.Init(); },200)
                       }
                   }
               }
               catch (e) {  console.log('SmartPlugin :: SMAMSUNGTV :: Error ::' + e);  }
           }
         }
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
                console.log('SmartPlugin :: SMAMSUNGTV :: Balancer :: Error :: End of mirrors'); 
            }
        } 
        catch (e)
        {
            console.log('SmartPlugin :: SMAMSUNGTV :: Balance Resource :: Error: '+ e); 
        }
    },
    setBalancedResource: function(obj) {  
        var indexCount = 0;
        for (index in obj) { indexCount++; } 
        SmartPlugin.balanceObject = obj;
        SmartPlugin.balanceObject[''+ (indexCount+1) +''] = new Object();
        SmartPlugin.balanceObject[''+ (indexCount+1) +'']['URL'] = youboraData.getMediaResource();
        if(obj != false)
        {
            if (typeof obj['1']['URL'] != "undefined") 
            { 
              console.log('SmartPlugin :: SMAMSUNGTV :: Balance Current Resource  :: ' + youboraData.getMediaResource());
              console.log('SmartPlugin :: SMAMSUNGTV :: Balance Priority Resource :: ' + obj['1']['URL']);

              if(obj['1']['URL'] != youboraData.getMediaResource())
              {
                console.log('SmartPlugin :: SMAMSUNGTV :: Balancing :: ' + obj['1']['URL']); 
                try {
                  SmartPlugin.videoPlayer.Play(obj['1']['URL']);  
                } catch(e) { console.log(e);}

              } 
              else {
                console.log('SmartPlugin :: SMAMSUNGTV :: Balancer :: Same Resource');  
              } 
           }
            else 
            {
               console.log('SmartPlugin :: SMAMSUNGTV :: Invalid balance object');
                SmartPlugin.balancingChk = true;
            }
        }
        else 
        {
          console.log('SmartPlugin :: SMAMSUNGTV :: Balance unavailable with current parameters');
          SmartPlugin.balancingChk = true;
        }
    },
    Play: function(url) { 
       try {
           youboraData.setMediaResource(url);
           SmartPlugin.urlResource = url;         
            if(SmartPlugin.isStartSent == false)
            {
                 SmartPlugin.communicationClass.sendStart( 0 , window.location.href , SmartPlugin.getMetadata() , youboraData.getLive() , SmartPlugin.urlResource , 0);
                 SmartPlugin.setPing();
                 SmartPlugin.isStartSent = true;    
            }
            if( SmartPlugin.paused )
            {  
                 if (SmartPlugin.isStartSent)    SmartPlugin.communicationClass.sendResume();
            }
            SmartPlugin.paused = false;
            SmartPlugin.balancingChk = false; 
           console.log('SmartPlugin :: SMAMSUNGTV :: Play ::');
           return true;
       }
       catch ( err )
       {
           console.log('SmartPlugin :: SMAMSUNGTV :: Play :: Error ::' + err);
       }
   },
   Pause: function() {
       SmartPlugin.checkBuffering();
       if (SmartPlugin.isStartSent)    SmartPlugin.communicationClass.sendPause();
       SmartPlugin.paused = true;
       console.log('SmartPlugin :: SMAMSUNGTV :: Pause ::');  
       return true;
   },
   Resume: function() {
       if (SmartPlugin.isStartSent)    SmartPlugin.communicationClass.sendResume();
       SmartPlugin.paused = false;
       console.log('SmartPlugin :: SMAMSUNGTV :: Resume ::');  
       return true;
   },
   Stop: function() {
       SmartPlugin.checkBuffering();            
       clearInterval(SmartPlugin.headTimer);
       if (SmartPlugin.isStartSent)    SmartPlugin.communicationClass.sendStop();
       SmartPlugin.reset();
       console.log('SmartPlugin :: SMAMSUNGTV :: Stop ::');  
       return true;
   },
   onStreamInfoReady: function(data) {
       console.log('SmartPlugin :: SMAMSUNGTV :: OnStreamInfoReady ::' + data);  
       SmartPlugin.duration = SmartPlugin.videoPlayer.GetDuration()

   },
   onConnectionFailed: function () {
       SmartPlugin.checkBuffering();            
       clearInterval(SmartPlugin.headTimer);
       SmartPlugin.communicationClass.sendError( 'CONNECTION FAILED', 'CONNECTION FAILED');
       SmartPlugin.communicationClass.sendStop();
       SmartPlugin.reset();
       console.log('SmartPlugin :: SMAMSUNGTV :: OnConnectionFailed ::');  
   },
   onAuthenticationFailed: function() {  
       SmartPlugin.checkBuffering();            
       clearInterval(SmartPlugin.headTimer);
       SmartPlugin.communicationClass.sendError( 'AUTHENTICATION FAILED', 'AUTHENTICATION FAILED');
       SmartPlugin.communicationClass.sendStop();
       SmartPlugin.reset();        
       console.log('SmartPlugin :: SMAMSUNGTV :: OnAuthenticationFailed ::');  
   },
   onStreamNotFound: function () {        
      if(SmartPlugin.balancing) 
      {
        SmartPlugin.balanceIndex++;
        SmartPlugin.refreshBalancedResource();
      }
      else
      {
       SmartPlugin.checkBuffering();            
       clearInterval(SmartPlugin.headTimer);
       SmartPlugin.communicationClass.sendError( 'STREAM NOT FOUND', 'STREAM NOT FOUND');
       SmartPlugin.communicationClass.sendStop();
       SmartPlugin.reset();        
       console.log('SmartPlugin :: SMAMSUNGTV :: OnStreamNotFound ::');  
     }
   },
   onNetworkDisconnected: function() {          
       SmartPlugin.checkBuffering();            
       clearInterval(SmartPlugin.headTimer);
       SmartPlugin.communicationClass.sendError( 'NETWORK DISCONNTECTED', 'NETWORK DISCONNTECTED');
       SmartPlugin.communicationClass.sendStop();
       SmartPlugin.reset();          
       console.log('SmartPlugin :: SMAMSUNGTV :: OnNetworkDisconnected ::');            
   },
   onRenderError: function() {                  
       SmartPlugin.checkBuffering();            
       clearInterval(SmartPlugin.headTimer);
       SmartPlugin.communicationClass.sendError( 'RENDER ERROR', 'RENDER ERROR');
       SmartPlugin.communicationClass.sendStop();
       SmartPlugin.reset();    
       console.log('SmartPlugin :: SMAMSUNGTV :: OnRenderError ::');  
   },
   onRenderingComplete: function() {        
       SmartPlugin.checkBuffering();            
       clearInterval(SmartPlugin.headTimer)
       if (SmartPlugin.isStartSent)    SmartPlugin.communicationClass.sendStop();
       SmartPlugin.reset();
       console.log('SmartPlugin :: SMAMSUNGTV :: OnRenderingComplete ::');
   },
   onBufferingStart: function() {    
       SmartPlugin.duration = Math.round(SmartPlugin.videoPlayer.GetDuration()/1000);
       SmartPlugin.checkBuffering();      
       SmartPlugin.setBufferEvent(SmartPlugin.SmartPluginsEvents.BUFFER_BEGIN);
       SmartPlugin.buffering = true;
       SmartPlugin.previousElapsedTime = 0;
       console.log('SmartPlugin :: SMAMSUNGTV :: OnBufferingStart ::');  
   },
   onBufferingComplete: function() {      
       SmartPlugin.setBufferEvent(SmartPlugin.SmartPluginsEvents.BUFFER_END);
       console.log('SmartPlugin :: SMAMSUNGTV :: OnBufferingComplete ::');
   },  
   onCurrentPlayTime: function(milliseconds) {
       milliseconds = Math.round(milliseconds/1000);
       if (SmartPlugin.previousElapsedTime != milliseconds) {
           SmartPlugin.checkBuffering();
           SmartPlugin.currentTime = milliseconds;
       }
       SmartPlugin.previousElapsedTime = milliseconds;
       console.log('SmartPlugin :: SMAMSUNGTV :: OnCurrentPlayTime :: ' + milliseconds);
   },
   setMetadata: function(metadata) {        
       SmartPlugin.metadata = metadata;
   },
   getMetadata: function () {
       var e = JSON.stringify(youboraData.getProperties);
       var t = encodeURI(e);
       return t;
   },
   setUsername: function(username) {
       SmartPlugin.bandwidth.username = username;
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
           console.log ( "SmartPlugin :: SMAMSUNGTV :: setBufferEvent :: Error " + e );
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
           
           if (SmartPlugin.isStartSent)    SmartPlugin.communicationClass.sendPingTotalBitrate( SmartPlugin.videoPlayer.GetCurrentBitrates() , SmartPlugin.currentTime );
       }
       catch(e)
       {
           console.log ( "SmartPlugin :: SMAMSUNGTV :: Ping :: Error " + e );
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
           console.log ( "SmartPlugin :: SMAMSUNGTV :: Reset :: Error: " + e );
       }  
   }
}   