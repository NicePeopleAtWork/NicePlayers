/*
 *SmartPlugin
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Adrian Galera Egea
 * Version: 2.1.0
 */

var SmartPlugin = {
    // General
    debug: true,
    isLive: youboraData.getLive(),
    bandwidth: { username: youboraData.getUsername(), interval: 6000},
    targetDevice: "AKAMAI MEDIA PLAYER",
    pluginName: "AKAMAI MEDIA PLAYER",
    pluginVersion: "1.4.2.1.0_AMP",
    initDone: 0,
    // Balancer
    balancing: youboraData.enableBalancer,
    balanceObject: "",
    balanceIndex: 1,
    // Media
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
    isChangingVideo:false,
    lastCallToBufferCheck: 0,
    lastSeekInitTime :0,
    isSeeking: false,
    seekTimer: undefined,
    Init: function (player)
    {
        try
        {

            if ( SmartPlugin.debug )
            {
                console.log("PLUGINS INIT !!");
                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Init ::" );
                SmartPlugin.videoPlayer = player;
            }

            SmartPlugin.initDone = true;
            SmartPlugin.startPlugin();
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
                SmartPlugin.duration =  SmartPlugin.videoPlayer.getDuration;
                if ( SmartPlugin.debug )
                {
                    console.log( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: startPlugin :: player found!" );
                }
                SmartPlugin.apiClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, SmartPlugin.pluginVersion, SmartPlugin.targetDevice);

                try {
                  SmartPlugin.bindEvents();
                  SmartPlugin.checkSeek();
                } catch (e) { console.log( e); }


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
            var playerEvents = [ "canplaythrough" , "mediaLoadStateReady" , "playing", "play", "pause", "ended", "adComponentAdBegin", "adComponentAdComplete", "adComponentCompanion","adComponentError","mediaPlayerResumeOrPausePlayback","mediaPlayerElementEvent","seeking","seeked","mediaPlayerError","mediaPlayerDynamicStreamSwitchingChange","waiting" ];

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
    unbindEvents: function ( )
    {
        try
        {
            var playerEvents = [ "canplaythrough" , "mediaLoadStateReady" , "playing", "play", "pause", "ended", "adComponentAdBegin", "adComponentAdComplete", "adComponentCompanion","adComponentError","mediaPlayerResumeOrPausePlayback","mediaPlayerElementEvent","seeking","seeked","mediaPlayerError","mediaPlayerDynamicStreamSwitchingChange","waiting" ];

            for ( elem in playerEvents )
            {
                SmartPlugin.videoPlayer.removeEventListener( playerEvents[elem], function ( e ) { SmartPlugin.checkPlayState(e); }, false);
            }

            if ( SmartPlugin.debug )
            {
                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: bindEvents :: Events deattached correctly!" );
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
        var bitrate = -1;
        try{
            bitrate  = SmartPlugin.bitrate;
        }catch(e){
            if(SmartPlugin.debug)
            {
                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: Bitrate :: Error: " + error );
            }
        }
        if(bitrate===undefined || bitrate == -1){
            bitrate= -1;
        }else{
          bitrate = bitrate * 1000;
        }
        return bitrate;
    },

    checkSeek: function ()
    {
      var seek = SmartPlugin.videoPlayer.getSeeking();
      if(SmartPlugin.isSeeking==false && seek == true){
        SmartPlugin.lastSeekInitTime = new Date().getTime();
        if(SmartPlugin.debug){
          console.log("START SEEK @ "+SmartPlugin.lastSeekInitTime);
        }
      }
      if(SmartPlugin.isSeeking==true && seek == false){
        if(SmartPlugin.debug){
          console.log("END SEEK @ "+SmartPlugin.lastSeekInitTime);
        }
      }

      SmartPlugin.isSeeking = seek;
      SmartPlugin.seekTimer =  setTimeout(SmartPlugin.checkSeek,50);
    },

    checkPlayState: function ( e )
    {
        SmartPlugin.debug=true;
        if ( SmartPlugin.debug )
        {
          console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: checkPlayState :: " + e.type );
        }

        switch ( e.type )
        {
          case "mediaPlayerDynamicStreamSwitchingChange":
            SmartPlugin.bitrate=e.data.bitrate;
            if(SmartPlugin.debug){
              console.log("Dynamic stream change to bitrate: "+SmartPlugin.getCurrentBitRate());
            }
            break;
          case "mediaPlayerResumeOrPausePlayback":
            if(SmartPlugin.isStartSent==false){
              SmartPlugin.joinTimeBegin = new Date().getTime();
              SmartPlugin.urlResource=SmartPlugin.videoPlayer.getSrc();
              if(youboraData.properties.content_metadata.title==""){
                youboraData.properties.content_metadata.title = SmartPlugin.videoPlayer.feed.data.channel.item['media-group']['media-title'];
              }

              SmartPlugin.duration = SmartPlugin.videoPlayer.feed.data.channel.item['media-group']['media-content'][0]['@attributes'].duration;

              SmartPlugin.apiClass.sendStart ( 0 , window.location.href , "" , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration,youboraData.getTransaction() );
              SmartPlugin.setPing();
              SmartPlugin.isStartSent = true;
            }
            break;

          case "waiting":
            if(SmartPlugin.isJoinSent){
              if(SmartPlugin.debug){
                  console.log("Start buffering!");
              }
              SmartPlugin.isBuffering=true;
              SmartPlugin.bufferTimeBegin= new Date().getTime();
            }
            break;

          case "adComponentAdBegin":
            if(SmartPlugin.debug){
                console.log("Ad begin!");
            }
            break;
          case "adComponentAdComplete":
            if(SmartPlugin.debug){
                console.log("Ad end!");
            }
            if(SmartPlugin.isJoinSent==false)
              SmartPlugin.joinTimeBegin = new Date().getTime();
            break;
          case "play":
            if(SmartPlugin.isPaused==true){
              SmartPlugin.apiClass.sendResume();
              SmartPlugin.isPaused = false;
            }
            break;
          case "playing":
            if(SmartPlugin.isBuffering==true){
              if(SmartPlugin.debug){
                  console.log("buffering end");
              }
              SmartPlugin.isBuffering = false;
              SmartPlugin.bufferTimeEnd = new Date().getTime();
              bufferseek = SmartPlugin.bufferTimeBegin  - SmartPlugin.lastSeekInitTime;
              if(bufferseek > 2000){
                var bufferTimeTotal = SmartPlugin.bufferTimeEnd - SmartPlugin.bufferTimeBegin;
                SmartPlugin.currentTime=SmartPlugin.videoPlayer.getCurrentTime();
                SmartPlugin.apiClass.sendBuffer( SmartPlugin.currentTime , bufferTimeTotal );
              }else{
                if(SmartPlugin.debug){
                    console.log("do not report buffer due to seek");
                }
              }
            }
            if(SmartPlugin.isPaused==true){
              SmartPlugin.apiClass.sendResume();
              SmartPlugin.isPaused = false;
            }
            break;
          case "canplaythrough":
            var joinTimeTotal = new Date().getTime() - SmartPlugin.joinTimeBegin;
            if ( SmartPlugin.isStartSent )
            {
                SmartPlugin.currentTime = SmartPlugin.videoPlayer.getCurrentTime();
                SmartPlugin.apiClass.sendJoin( SmartPlugin.currentTime ,  joinTimeTotal );
                SmartPlugin.isJoinSent  = true;
            }
            break;
          case "ended":
            SmartPlugin.reset();
            break;
          case "pause":
            if ( SmartPlugin.isStartSent ) { SmartPlugin.apiClass.sendPause(); }
            SmartPlugin.isPaused = true;
            break;
          case "mediaPlayerError":
              if(SmartPlugin.isStartSent){
                SmartPlugin.urlResource=SmartPlugin.videoPlayer.getSrc();
                if(youboraData.properties.content_metadata.title==""){
                  youboraData.properties.content_metadata.title = SmartPlugin.videoPlayer.feed.data.channel.item['media-group']['media-title'];
                }
                var errorCode = e.data.id;
                var errorMsg = e.data.message;
                SmartPlugin.duration = SmartPlugin.videoPlayer.feed.data.channel.item['media-group']['media-content'][0]['@attributes'].duration;
                SmartPlugin.apiClass.sendAdvancedError(3001, SmartPlugin.targetDevice, "PLAY_FAILURE", 0, window.location.href , "", youboraData.getLive(), SmartPlugin.urlResource, SmartPlugin.duration, youboraData.getTransaction());
                clearInterval(SmartPlugin.pingTimer);
                SmartPlugin.reset();
              }
            break;

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
                SmartPlugin.currentTime = SmartPlugin.videoPlayer.getCurrentTime();
                SmartPlugin.apiClass.sendPingTotalBitrate( SmartPlugin.getCurrentBitRate() , SmartPlugin.currentTime );
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
           SmartPlugin.lastCallToBufferCheck=0;
           SmartPlugin.lastSeekInitTime=0;
           SmartPlugin.isSeeking=false;
           clearTimeout(SmartPlugin.seekTimer);
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
    sendError: function(msg,errorCode){
        try{
            SmartPlugin.isStreamError = true;
            SmartPlugin.checkBuffering();
            clearInterval(SmartPlugin.pingTimer);
            SmartPlugin.apiClass.sendAdvancedError(errorCode, SmartPlugin.targetDevice, msg, 0, window.location.href , "", SmartPlugin.isLive, SmartPlugin.urlResource, SmartPlugin.duration, youboraData.getTransaction());
            SmartPlugin.reset();
        } catch(error){
            if ( SmartPlugin.debug )
            {
                console.log ( "SmartPlugin :: "+ SmartPlugin.pluginName  +" :: sendError :: Error: " + error );
            }
        }
    },
    unLoad: function ( )
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
          SmartPlugin.lastCallToBufferCheck=0;
          SmartPlugin.lastSeekInitTime=0;
          SmartPlugin.isSeeking=false;
          clearTimeout(SmartPlugin.seekTimer);
          SmartPlugin.unbindEvents();
          delete SmartPlugin.apiClass;
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

SmartPlugin.Init(window.AK);
