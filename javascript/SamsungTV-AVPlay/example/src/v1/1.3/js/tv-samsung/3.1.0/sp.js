var SmartPlugin = {
  debug: true,
  videoPlayer: "",
  bandwidth: {
    username: youboraData.getUsername(),
    interval: 6000
  },
  headTimer: "",
  balancing: false,
  currentTime: 0,
  urlResource: "",
  isLive: youboraData.getLive(),
  duration: 0,
  communicationClass: "",
  previousElapsedTime: 0,
  service: youboraData.getService(),
  metadata: youboraData.getProperties(),
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
  pluginVersion: "1.3.3.1.0_Samsung",
  playerStreamingError: false,
  SmartPluginsEvents: {
    BUFFER_BEGIN: 1,
    BUFFER_END: 0,
    JOIN_SEND: 2
  },
  initDone: false,
  Init: function() {
    try {
      if (typeof spLoaded === "undefined" || !spLoaded) {
        console.log("SmartPlugin :: SMAMSUNGTV :: Init");
        var allVideoPlayerObjects = document.getElementsByTagName("object");
        for (var i = 0; i < allVideoPlayerObjects.length; i++) {
          try {
            var clsid = allVideoPlayerObjects[i].getAttribute('classid').replace('clsid:', '');
            if (clsid == "SAMSUNG-INFOLINK-PLAYER") {
              console.log('SmartPlugin :: SAMSUNGTV :: Video Player Found :: ' + allVideoPlayerObjects[i].GetPlayerVersion());
              SmartPlugin.videoPlayer = allVideoPlayerObjects[i];
              if (typeof YouboraCommunication != "undefined") {
                SmartPlugin.communicationClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, SmartPlugin.pluginVersion, 'SAMSUNGTV');
                SmartPlugin.checkEnableAnalytics();
                if (SmartPlugin.videoPlayersCount == -1) {
                  console.log('SmartPlugin :: SMAMSUNGTV :: No valid player was found...');
                } else {
                  console.log('SmartPlugin :: SMAMSUNGTV :: Listening...');
                }
                spLoaded = true;
              } else {
                console.log('SmartPlugin :: SAMSUNGTV :: youbora-api not present!');
                setTimeout(function() {
                  SmartPlugin.Init();
                }, 200)
              }
            }
          } catch (e) {
            console.log('SmartPlugin :: SMAMSUNGTV :: Error ::' + e);
          }
        }
      }
    } catch (error) {
      console.log(error);
      spLoaded = false;
    }
  },
  checkEnableAnalytics: function() {
    try{
    if (youboraData.enableAnalytics == true) {
      SmartPlugin.communicationClass.canSendEvents = true;
    } else {
      SmartPlugin.communicationClass.canSendEvents = false;
    }
    }catch(err){
      console.log(err);
    }
  },
  refreshBalancedResource: function() {
    try {
      if (typeof SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['URL'] != "undefined") {
        var stringCall = '{"command":"load","contentUri":"' + SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['URL'] + '"}'
        window.external.user(stringCall);
      } else {
        console.log('SmartPlugin :: SMAMSUNGTV :: Balancer :: Error :: End of mirrors');
      }
    } catch (e) {
      console.log('SmartPlugin :: SMAMSUNGTV :: Balance Resource :: Error: ' + e);
    }
  },
  setBalancedResource: function(obj) {
    try{
    var indexCount = 0;
    for (index in obj) {
      indexCount++;
    }
    SmartPlugin.balanceObject = obj;
    SmartPlugin.balanceObject['' + (indexCount + 1) + ''] = new Object();
    SmartPlugin.balanceObject['' + (indexCount + 1) + '']['URL'] = youboraData.getMediaResource();
    if (obj != false) {
      if (typeof obj['1']['URL'] != "undefined") {
        console.log('SmartPlugin :: SMAMSUNGTV :: Balance Current Resource  :: ' + youboraData.getMediaResource());
        console.log('SmartPlugin :: SMAMSUNGTV :: Balance Priority Resource :: ' + obj['1']['URL']);

        if (obj['1']['URL'] != youboraData.getMediaResource()) {
          console.log('SmartPlugin :: SMAMSUNGTV :: Balancing :: ' + obj['1']['URL']);
          try {
            SmartPlugin.videoPlayer.Play(obj['1']['URL']);
          } catch (e) {
            console.log(e);
          }

        } else {
          console.log('SmartPlugin :: SMAMSUNGTV :: Balancer :: Same Resource');
        }
      } else {
        console.log('SmartPlugin :: SMAMSUNGTV :: Invalid balance object');
        SmartPlugin.balancingChk = true;
      }
    } else {
      console.log('SmartPlugin :: SMAMSUNGTV :: Balance unavailable with current parameters');
      SmartPlugin.balancingChk = true;
    }
    }catch(err){
      console.log(err);
    }
  },
  Play: function(url) {
    SmartPlugin.checkEnableAnalytics();
    try {
      youboraData.setMediaResource(url);
      SmartPlugin.urlResource = url;
      if (SmartPlugin.isStartSent == false) {
        SmartPlugin.communicationClass.sendStart(0, window.location.href, SmartPlugin.getMetadata(), youboraData.getLive(), SmartPlugin.urlResource, 0, youboraData.getTransaction());
        SmartPlugin.setPing();
        SmartPlugin.isStartSent = true;
      }
      if (SmartPlugin.paused) {
        if (SmartPlugin.isStartSent) SmartPlugin.communicationClass.sendResume();
      }
      SmartPlugin.paused = false;
      SmartPlugin.balancingChk = false;
      console.log('SmartPlugin :: SMAMSUNGTV :: Play ::');
      return true;
    } catch (err) {
      console.log('SmartPlugin :: SMAMSUNGTV :: Play :: Error ::' + err);
    }
  },
  Pause: function() {
    try{
    SmartPlugin.checkEnableAnalytics();
    SmartPlugin.checkBuffering();
    if (SmartPlugin.isStartSent) SmartPlugin.communicationClass.sendPause();
    SmartPlugin.paused = true;
    console.log('SmartPlugin :: SMAMSUNGTV :: Pause ::');
    }catch(err){
      console.log(err);
    }
    return true;
  },
  Resume: function() {
    try{
    SmartPlugin.checkEnableAnalytics();
    if (SmartPlugin.isStartSent) SmartPlugin.communicationClass.sendResume();
    SmartPlugin.paused = false;
    console.log('SmartPlugin :: SMAMSUNGTV :: Resume ::');
    
    }catch(err){
      console.log(err);
    }
    return true;
  },
  Stop: function() {
    try{

    
    SmartPlugin.checkEnableAnalytics();
    SmartPlugin.checkBuffering();
    clearInterval(SmartPlugin.headTimer);
    if (SmartPlugin.isStartSent) SmartPlugin.communicationClass.sendStop();
    SmartPlugin.reset();
    console.log('SmartPlugin :: SMAMSUNGTV :: Stop ::');
    }catch(err){
      console.log(err);
    }
    return true;
  },
  onStreamInfoReady: function(data) {
    try{
    console.log('SmartPlugin :: SMAMSUNGTV :: OnStreamInfoReady ::' + data);
    SmartPlugin.duration = SmartPlugin.videoPlayer.GetDuration()
    }catch(err){
      console.log(err);
    }

  },
  onConnectionFailed: function() {
    try{

    SmartPlugin.checkEnableAnalytics();
    clearInterval(SmartPlugin.headTimer);
    SmartPlugin.checkBuffering();
    SmartPlugin.communicationClass.sendErrorWithParameters('CONNECTION FAILED','CONNECTION FAILED',0,window.location.href,SmartPlugin.getMetadata(),youboraData.getLive(),SmartPlugin.urlResource, 0, youboraData.getTransaction())
    SmartPlugin.communicationClass.sendStop();
    SmartPlugin.reset();
    console.log('SmartPlugin :: SMAMSUNGTV :: OnConnectionFailed ::');
    }catch(err){
      console.log(err);
    }
  },
  onAuthenticationFailed: function() {
    try{
    SmartPlugin.checkBuffering();
    clearInterval(SmartPlugin.headTimer);
    SmartPlugin.checkEnableAnalytics();
    SmartPlugin.communicationClass.sendErrorWithParameters('AUTHENTICATION FAILED','AUTHENTICATION FAILED',0,window.location.href,SmartPlugin.getMetadata(),youboraData.getLive(),SmartPlugin.urlResource, 0, youboraData.getTransaction())
    SmartPlugin.communicationClass.sendStop();
    SmartPlugin.reset();
    console.log('SmartPlugin :: SMAMSUNGTV :: OnAuthenticationFailed ::');
    }catch(err){
      console.log(err);
    }
  },
  onStreamNotFound: function() {
    try{
    if (SmartPlugin.balancing) {
      SmartPlugin.balanceIndex++;
      SmartPlugin.refreshBalancedResource();
    } else {
      SmartPlugin.checkBuffering();
      clearInterval(SmartPlugin.headTimer);
      SmartPlugin.checkEnableAnalytics();

      SmartPlugin.communicationClass.sendErrorWithParameters('STREAM NOT FOUND','STREAM NOT FOUND',0,window.location.href,SmartPlugin.getMetadata(),youboraData.getLive(),SmartPlugin.urlResource, 0, youboraData.getTransaction())

      SmartPlugin.communicationClass.sendStop();
      SmartPlugin.reset();
      console.log('SmartPlugin :: SMAMSUNGTV :: OnStreamNotFound ::');
    }
    }catch(err){
      console.log(err);
    }
  },
  onNetworkDisconnected: function() {
    try{
    SmartPlugin.checkBuffering();
    clearInterval(SmartPlugin.headTimer);
    SmartPlugin.checkEnableAnalytics();

    SmartPlugin.communicationClass.sendErrorWithParameters('NETWORK DISCONNTECTED','NETWORK DISCONNTECTED',0,window.location.href,SmartPlugin.getMetadata(),youboraData.getLive(),SmartPlugin.urlResource, 0, youboraData.getTransaction())

    SmartPlugin.communicationClass.sendStop();
    SmartPlugin.reset();
    console.log('SmartPlugin :: SMAMSUNGTV :: OnNetworkDisconnected ::');
    }catch(err){
      console.log(err);
    }
  },
  onRenderError: function() {
    try{
    SmartPlugin.checkBuffering();
    clearInterval(SmartPlugin.headTimer);
    SmartPlugin.checkEnableAnalytics();
    SmartPlugin.communicationClass.sendErrorWithParameters('RENDER ERROR','RENDER ERROR',0,window.location.href,SmartPlugin.getMetadata(),youboraData.getLive(),SmartPlugin.urlResource, 0, youboraData.getTransaction())
    SmartPlugin.communicationClass.sendStop();
    SmartPlugin.reset();
    console.log('SmartPlugin :: SMAMSUNGTV :: OnRenderError ::');
    }catch(err){
      console.log(err);
    }
  },
  onRenderingComplete: function() {
    try{
    SmartPlugin.checkBuffering();
    clearInterval(SmartPlugin.headTimer)
    SmartPlugin.checkEnableAnalytics();
    if (SmartPlugin.isStartSent) SmartPlugin.communicationClass.sendStop();
    SmartPlugin.reset();
    console.log('SmartPlugin :: SMAMSUNGTV :: OnRenderingComplete ::');
    }catch(err){
      console.log(err);
    }
  },
  onBufferingStart: function() {
    try{
    SmartPlugin.duration = Math.round(SmartPlugin.videoPlayer.GetDuration() / 1000);
    SmartPlugin.checkBuffering();
    SmartPlugin.setBufferEvent(SmartPlugin.SmartPluginsEvents.BUFFER_BEGIN);
    SmartPlugin.buffering = true;
    SmartPlugin.previousElapsedTime = 0;
    console.log('SmartPlugin :: SMAMSUNGTV :: OnBufferingStart ::');
    }catch(err){
      console.log(err);
    }
  },
  onBufferingComplete: function() {
    try{
    SmartPlugin.setBufferEvent(SmartPlugin.SmartPluginsEvents.BUFFER_END);
    console.log('SmartPlugin :: SMAMSUNGTV :: OnBufferingComplete ::');
    }catch(err){
      console.log(err);
    }
  },
  onCurrentPlayTime: function(milliseconds) {
    try{
    milliseconds = Math.round(milliseconds / 1000);
    if (SmartPlugin.previousElapsedTime != milliseconds) {
      SmartPlugin.checkBuffering();
      SmartPlugin.currentTime = milliseconds;
    }
    SmartPlugin.previousElapsedTime = milliseconds;
    console.log('SmartPlugin :: SMAMSUNGTV :: OnCurrentPlayTime :: ' + milliseconds);
    }catch(err){
      console.log(err);
    }
  },
  setMetadata: function(metadata) {
    try{
    SmartPlugin.metadata = metadata;
    }catch(err){
      console.log(err);
    }
  },
  getMetadata: function() {
    try{
    var e = JSON.stringify(SmartPlugin.metadata);
    var t = encodeURI(e);
    return t;
    }catch(err){
      console.log(err);
    }
  },
  setUsername: function(username) {
    try{
    SmartPlugin.bandwidth.username = username;
    }catch(err){
      console.log(err);
    }
  },
  checkBuffering: function() {
    try{
    if (SmartPlugin.buffering) {
      if (SmartPlugin.isStartSent) SmartPlugin.setBufferEvent(SmartPlugin.SmartPluginsEvents.BUFFER_END);
    }
    SmartPlugin.buffering = false;
    } catch(err){
      console.log(err);
    }
  },
  setBufferEvent: function(bufferState) {
    console.log("SmartPlugin :: setBufferEvent "+bufferState);
    SmartPlugin.checkEnableAnalytics();
    try {
      var d = new Date();
      var bufferTimeEnd = 0;
      var bufferTimeTotal = 0;

      switch (bufferState) {
        case SmartPlugin.SmartPluginsEvents.BUFFER_BEGIN:

          SmartPlugin.bufferTimeBegin = d.getTime();

          if (SmartPlugin.joinTimeBegin == 0) {
            SmartPlugin.joinTimeBegin = d.getTime();
          }

          break;

        case SmartPlugin.SmartPluginsEvents.BUFFER_END:
          if(SmartPlugin.buffering==true){
            bufferTimeEnd = d.getTime();
            bufferTimeTotal = bufferTimeEnd - SmartPlugin.bufferTimeBegin;

            if (SmartPlugin.isJoinEventSent == false) {
              SmartPlugin.isJoinEventSent = true;
              var joinTimeTotal = d.getTime() - SmartPlugin.joinTimeBegin;

              if (SmartPlugin.isStartSent) SmartPlugin.communicationClass.sendJoin(SmartPlugin.currentTime, joinTimeTotal);

            } else {
              var currentTime = SmartPlugin.currentTime;
              if (currentTime == 0 && SmartPlugin.isLive) {
                currentTime = 10;
              }

              if (SmartPlugin.isStartSent) SmartPlugin.communicationClass.sendBuffer(currentTime, bufferTimeTotal);
            }
          }
          SmartPlugin.buffering=false
          break;
      }
    } catch (e) {
      console.log("SmartPlugin :: SMAMSUNGTV :: setBufferEvent :: Error " + e);
    }
  },
  setPing: function() {
    try {
    SmartPlugin.checkEnableAnalytics();
    SmartPlugin.pingTimer = setTimeout(function() {
      SmartPlugin.ping();
    }, SmartPlugin.communicationClass.getPingTime());
    } catch(err){
      console.log(err);
    }
  },
  ping: function() {
    try {
      SmartPlugin.checkEnableAnalytics();
      clearTimeout(SmartPlugin.pingTimer);
      SmartPlugin.pingTimer = null;
      SmartPlugin.setPing();

      if (SmartPlugin.isStartSent) SmartPlugin.communicationClass.sendPingTotalBitrate(SmartPlugin.videoPlayer.GetCurrentBitrates(), SmartPlugin.currentTime);
    } catch (e) {
      console.log("SmartPlugin :: SMAMSUNGTV :: Ping :: Error " + e);
    }
  },
  reset: function() {
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
      SmartPlugin.checkEnableAnalytics();
    } catch (e) {
      console.log("SmartPlugin :: SMAMSUNGTV :: Reset :: Error: " + e);
    }
  }
}