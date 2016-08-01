/* Nice264 TV Plugins package
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Victor A. Garcia Alvarez
 * Version: 2.1.1
 */

(function(jwplayer){

/*
 * JWPlayer(v6) Plugin
 */
var template = function(player, config, div){

    //////////////////////////////////
    // plugin definitions (analytics)
    //////////////////////////////////
    var pluginEnabled = false;
    //Change the version checking the fastData
    var pluginVersion = "1.3.3.1.3";
    var pamSystem = "";
    var pamService="http://nqs.nice264.com";

    var isStartEventSent = false;
    var isJoinEventSent = false;
    var continuityTimer = null;
    var joinTime = 0;
    var bufferTime = 0;

    var isGlobalLive = null;

    //////////////////////////////////
    // plugin definitions (bandwidth)
    //////////////////////////////////
    var repeatTime = 0;
    var repeatEvent = null;
    var iterator = 0;
    var images = [];
    var total_latency = 9000;
    var total_band = 0;
    var testCounter = 0;
    var ip = "";
    var country = "";
    var city = "";
    var isp = "";
    var ping = "";
    var band = "";
    var imagesCounter = 0;
    var latencies = [];
    var bandwidths = [];
    var genericIndex = 0;
    var totalBandwidhtFiles = 0;
    var username = "";
    var system = "";
    var minutes = 0;
    var isPaused=false;
    //Set here to prevent null. Will be set in start again.
    var startDateTime = new Date().getTime()/1000;
    var resume = false;
    var contentId;
    var streamModeStartDateTime = new Date().getTime();

    //////////////////////////////////
    // Overlay variables
    //////////////////////////////////
    var overlayText="";
    var overlayEnabled =false;
    var overlayTime = 60000;
    var overlayDuration =6000;
    var isOverlayVisible =false;
    var overlayTimer = null;
    var overlayTextColor = "black";
    //defaultColor : dark Green
    var overlayBackgroundColor = '#415825';

    var communications={};

    var resource;
    var resourceToPass;

    var resourcePath="";
    //Current index of the playlist that has been requested to the balancer.
    //It is used for avoiding the plugin to look for the same data more than once
    var playlistIndexRequested=NaN;
    //Current index in the balancer reponse. 
    //It starts in 1 due to the response format
    var nextUrlIndexFromBalancer = 1;
    //Response of the balancer. It is kept for the switching
    var balancerJson ={};
    //Original resource, set by the user as a playlistItem
    var originalResource="";
    //Flag to know if we already have the balancer data or not
    var playlistHasBeenUpdated = false;
    //Instant to go back if the play fails
    var seekTime =0;
    //var isBalancerActivated=false;
    var isOriginalVideoLoaded = false;
    var originalCdnCode = "";
    //Variable to know if the user has pressed play and we need to 
    //start playing the new video
    var isPlayPressed = false;
    //Variable to send the CDN from of the balancer info
    var cdnCode ="";
    var isSeeking = false;
    var lastBitrate=-1;
    var isBuffering=false;

    var abstractPlugin={};
    var SmartPluginError =  {
        'Could not connect to server' : "7000",
        'Unsupported Media Format' : "7001",
        'Unsupported Media Format' : "7002",
        'Cannot load M3U8: 404 not found' : "7003",
        'Cannot load M3U8: crossdomain access denied' : "7004",
        'Cannot load M3U8: No levels to play' : "7005",
        'Error loading player: Flash version must be 10.0 or greater' : "7006",
        'Error loading player: No media sources found' : "7007",
        'Error loading player: Offline playback not supported' : "7008",
        'Error loading skin: File not found' : "7009",
        'Error loading skin: Crossdomain loading denied' : "7010",
        'Error loading skin: Error loading file' : "7011",
        'Error loading skin: Invalid file type' : "7012",
        'Error loading skin: Skin formatting error' : "7013",
        'Error loading playlist: File not found' : "7014",
        'Error loading playlist: Crossdomain loading denied' : "7015",
        'Error loading playlist: Error loading file' : "7016",
        'Error loading playlist: Not a valid RSS feed' : "7017",
        'Error loading playlist: No playable sources found' : "7018",
        'Error drawing fallback: No downloadable media found' : "7019",
        'Error loading media: File not found' : "7020",
        'Error loading media: File could not be played' : "7021",
        'Error loading YouTube: Video ID is invalid' : "7022",
        'Error loading YouTube: Video removed or private' : "7023",
        'Error loading YouTube: Embedding not allowed' : "7024",
        'Error loading YouTube: API connection error' : "7025",
        'Error loading stream: Could not connect to server' : "7026",
        'Error loading stream: ID not found on server' : "7027",
        'Error loading stream: Manifest not found or invalid' : "7028",
        'Video stutters frequently': "7029",
        'Video is stretched or has black bars':"7030",
        'MP3 playback is too fast or too slow' : "7031",
        'FLV video seeking is not working' : "7032",
        'MP4 video seeking is not working' : "7033"       
    };


    ////////////////
    // plugin setup
    ////////////////

    player.onReady(readyHandler);
    function readyHandler(event)
    {

        //Config is YouboraData
       

        if (config.service !== "" && typeof(config.service) != "undefined"){
            pamService = config.service;
        }
        var jsonObj = JSON.stringify(config.properties);

        abstractPlugin = new NiceAbstractPlugin(youboraData);

        abstractPlugin.setPluginVersion(pluginVersion);
        abstractPlugin.setDuration (player.getDuration() < 0 ? 0 : player.getDuration());
        abstractPlugin.setCurrentTime(player.getPosition());
        abstractPlugin.setLive(youboraData.getLive());

        abstractPlugin.init();

        player.onBuffer(bufferHandler);
        player.onBeforePlay(beforePlayHandler);
        player.onPlay(playHandler);
        player.onPause(pauseHandler);
        player.onTime(timeHandler);
        player.onMeta(metaHandler);
        player.onPlaylistItem(playListItemHandler);
        player.onError(errorHandler);
        player.onSetupError(errorHandler);
        player.onIdle(idleHandler);
        player.onSeek(seekHandler);
        
        //It is important to call set for the overlay text
        if(config.jwplayerOverlayText != undefined){
            setOverlayText(config.jwplayerOverlayText);
        }else{
            setOverlayText(config.username);
        }
        overlayEnabled = config.jwplayerOverlayEnabled;
        overlayTime = config.jwplayerOverlayTime;
        if(overlayTime == undefined){
            overlayTime = 90000;
        }
        overlayDuration = config.jwplayerOverlayDuration;
        if(overlayDuration == undefined){
            overlayDuration = 5000;
        }

        resetOverlayTimer();
        //Balancer configuration 
        abstractPlugin.setResource(player.getPlaylistItem().file);
        isBalancerActivated = isBalancerActive();
        if(!isBalancerActive()){
            isOriginalVideoLoaded=true;
        }

    }

    //Balancer is active if originCode and zoneCode are not set
    function isBalancerActive(){
        return youboraData.getBalanceEnabled();
        //return ((youboraData.getBalanceOriginCode() != "") || (youboraData.getBalanceZoneCode() !="") && ( communications.enableBalancer ) && youboraData.enableBalancer);
    }
    function callbackBalancer(jsonObject){

        console.log(jsonObject);
        try{
            if(jsonObject != false){
                youboraData.isBalanced =true;
                balancerJson = jsonObject;
                updatePlayList(jsonObject);
            
                
            }else{
                isOriginalVideoLoaded=true;
                youboraData.setEnableBalancer(false);
            }   
        }catch(err){
            youboraData.log(err);
        }
    }

    function updatePlayList(jsonObject){

        var newPlayList  = new Array();
        playlistIndexRequested = player.getPlaylistIndex(); 
        for(var i=0; i<player.getPlaylist().length; i++){
            if(i == player.getPlaylistIndex()){
                console.log(this);
                console.log(abstractPlugin);
                var currentPlayingFile = player.getPlaylistItem();
                var nextUrl = abstractPlugin.getNextBalancerResource();
                if(typeof jsonObject[nextUrlIndexFromBalancer] == "undefined"){
                    currentPlayingFile = nextUrl;
                    isOriginalVideoLoaded = true;
                    
                }else{
                    
                    var balancerUrl = nextUrl;
                    currentPlayingFile.file = nextUrl;
                    currentPlayingFile.sources[0].file= nextUrl;


                    
                }
                newPlayList.push(currentPlayingFile);
            }else{
              
                newPlayList.push(player.getPlaylistItem(i));
            }
        }
        //Indicate that the data has been fetched and changes 
        playlistHasBeenUpdated=true;
        player.load(newPlayList);     
    }
    /////////////////
    // player events
    /////////////////
    function playListItemHandler(event)
    { 
        if(youboraData.jwplayerStreamMode ==false){
            abstractPlugin.reset();
        }
        if(isBalancerActive()){

            abstractPlugin.reset();
            seekTime=0;
            //If we come from a status of clicking another video, we need to download the data and get the 
            //video index we are at
            if(!playlistHasBeenUpdated){
                abstractPlugin.startBalancer(player.getPlaylistItem().file, callbackBalancer);
                playlistIndexRequested = player.getPlaylistIndex();    
            //If we come from the status of having already changed the playlist and we need to go back to the video we where at    
            }else{
                player.playlistItem(playlistIndexRequested); 
                //Clean flag for the next change of video    
                playlistHasBeenUpdated  =false;  

            }
        }
    }

    function idleHandler(event){
        if(youboraData.jwplayerStreamMode == false){
            var oldState = event.oldstate;
            if(oldState == "PLAYING" || oldState == "PAUSED"){
                abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.STOP);
            }
        }
    }

    function seekHandler(event){
        abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.SEEK_INIT);
    }
    function bufferHandler(event)
    {
        isPlayPressed = true;
        if (event.oldstate != "PAUSED" && event.oldstate != "IDLE"){
            abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.BUFFER_INI);
        }
    }
    function beforePlayHandler(event)
    {
        //When we are not balancing, we will send the start 
        //rigth before the video starts buffering and playing.
        //When we are balancing, we cannot do that because the video
        //the server provided might fail and we only know that when 
        //it starts playing.
        if (!isStartEventSent && !isBalancerActive()){
            abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.PLAY);
        }
        abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.BUFFER_INI);
        
    }
    function playHandler(event)
    {

        //When balancing, we will accept the start when the video starts playing.
        //Opposite case of beforePlayHandler
        if (!isStartEventSent){
            abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.PLAY);
        }

    }
    function pauseHandler(event)
    {
        isPaused=true;
        //endAnalytics("pause");
        abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.PAUSE);
    }
    function timeHandler(event)
    {   
        duration = event.duration;
        abstractPlugin.setDuration(duration);
        abstractPlugin.setCurrentTime(event.position);
        getBitrate();
        //duration-1 to avoid precision errors
        if(youboraData.jwplayerStreamMode == false){
            if(event.duration>0){
                if (event.position >= (event.duration-1)){
                    abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.STOP);
                }
            }
        }
    }
    function metaHandler(event){
        mediaAttributes = event;
        duration = event.metadata.duration;
        abstractPlugin.setDuration(duration);
    }
    function errorHandler(message){
        try{
            player.stop();
            console.log(message);
            abstractPlugin.setErrorCode(SmartPluginError[message.message]);
            abstractPlugin.setErrorMsg(parseError(message));
            abstractPlugin.dispatchEvent(NiceAbstractPluginEvents.ERROR);
       
            
        }catch(err){
            youboraData.log(err);
        }finally{
            if(isBalancerActive() && !isOriginalVideoLoaded){
                seekTime = player.getPosition();
                updatePlayList(balancerJson);
            }
        }
    }
    function parseError(error_obj)
    {
        var jsonObj = JSON.stringify(error_obj);
        return encodeURIComponent(jsonObj);
    }
    function getBitrate(){
        try {
                var qtys = player.getQualityLevels();
                var bitrate = qtys[player.getCurrentQuality()].bitrate;
                if (typeof(bitrate) == "undefined" || typeof(bitrate) === null){
                    bitrate = -1;
                }else{
                    bitrate = bitrate;
                }
                //In case the bitrate has not been set yet, we get it from mediaAttributes
                if (bitrate == 0 || bitrate == -1)
                {
                    //Metdata is an object with the following structure:
                    //Object {currentLevel: â€œ3 of 3 (1639kbps, 1280px)â€, width: 480, droppedFrames: 0, bandwidth: 13549}
                    if(mediaAttributes != null && (mediaAttributes.metadata!=null && mediaAttributes.metadata!="undefined")){
                        if(mediaAttributes.metadata.currentLevel != null && mediaAttributes.metadata.currentLevel!="undefined"){
                            var currentLevel = mediaAttributes.metadata.currentLevel;
                            var regex = /(([0-9]+)kbps)/i;
                            //currentLevel.match returns 3 elements, we need the 3rd one which is the number alone
                            bitrate = currentLevel.match(regex)[2];
                            //convert bitRate from kbps to bps
                            bitrate = bitrate * 1024;
                        }
                    }
                }
                if(bitrate == 0){
                    bitrate= -1;
                }
            } catch (err) {
                bitrate = -1;
                youboraData.log(err);
            }
            if(bitrate == -1){
                bitrate = lastBitrate;
            }else{
                lastBitrate = bitrate;
            }
        abstractPlugin.setBitrate(bitrate);
        return bitrate;
    }

    function setOverlayText(text){
        div.innerHTML = text;
        overlayText =text;
        hideOverlay();
    }

    this.setOverlayText = function(text){
        setOverlayText(text);
   }

    this.setOverlayEnabled =function(enabled){
        overlayEnabled = enabled;

    }
    this.setOverlayTime = function(time){
        overlayTime = time;
    }
    this.setOverlayDuration = function(time){
        overlayDuration = time;

    }
    function setStyleOverlay( object ) {
      for(var style in object) {
        div.style[ style ] = object[ style ];
      }
    }

    function showOverlay(){
        createStyleOverlay ();
        isOverlayVisible=true;
        if(overlayEnabled){
            setStyleOverlay({
                opacity: 1,
            });
        }else{
            hideOverlay();
        }
    };
 
    function hideOverlay () {
        isOverlayVisible=false;
        setStyleOverlay({
            opacity: 0
        });
    };

    function resetOverlayTimer()
    {
        try{
            if(!isOverlayVisible){
                setTimeout(function() {
                    showOverlay();
                    resetOverlayTimer();
                }, overlayTime);
            }else{
                 setTimeout(function() {
                    hideOverlay();
                    resetOverlayTimer();
                }, overlayDuration);
            }
        }
        catch(err){
            youboraData.log(err);
         }
    } 

    function createStyleOverlay ()
    {
        //Width value = length of overlayText. Using .length won't work
        //var widthValue  = overlayText.length;// player.getWidth();
        var yPosition = player.getHeight() - 0.25 * player.getHeight();
        // Offset to compensate the size of the text in the overlay when calculating the xPosition
        var textSize = 7;
        var xPosition =  Math.floor((Math.random()* (player.getWidth() - (overlayText.length*textSize))));
        
        //If the color is set, use them. Otherwise default
        if(config.jwplayerOverlayTextColor != undefined){
            overlayTextColor = config.jwplayerOverlayTextColor;
        }
        if(config.jwplayerOverlayBackgroundColor != undefined){
            overlayBackgroundColor = config.jwplayerOverlayBackgroundColor;
        }
        setStyleOverlay({
            position: 'absolute',
            left :  xPosition +'px',
            top : yPosition +'px',
            margin: '0',
            padding: '5px 10px 5px',
            background: overlayBackgroundColor,
            'font-weight': 'bold',
            color: overlayTextColor,
            fontSize: '13px',
        }); 
    }

    // Matches our text container to the size of the player instance
    this.resize = function( width, height ) {
        createStyleOverlay ();
    };

};

jwplayer().registerPlugin('sp', '6.0', template);

})(jwplayer);