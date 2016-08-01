/**
 * Created for NicePeopleAtWork.
 * User: Miquel Fradera
 * Date: 11/12/13
 * Time: 16:48
 */

//We look for all the elements in the view.
//This is because there is no identifier for the video.
//And it can have the tag "object", so tag video doesn't
//work either.
//If the video is not found, we will looking for it 
var SmartPlugin = { 

    oldFunction : null,
        /**
         * Attributes.
         */
    playerId : "",
    system : youboraData.getAccountCode(),
    service : youboraData.getService(),
    playInfo : youboraData,
    transactionCode : youboraData.transaction,
    username : youboraData.getUsername(),

    // player reference
    player : null,
    playStateCallback : "",

    // configuration
    pluginVersion : "1.3.3.0.0_lgtv",
    targetDevice : "LG_NetCast",
    outputFormat : "xml",
    xmlHttp : null,
    isXMLReceived : false,

    // events queue
    resourcesQueue : [],
    eventsQueue : [],
    eventsTimer : null,

    // events
    isStartEventSent : false,
    isJoinEventSent : false,
    isStopEventSent : false,
    isBufferRunning : false,
    isPauseEventSent : false,

    // properties
    assetMetadata : {},
    isLive : false,
    bufferTimeBegin : 0,

    // code
    pamCode : "",
    pamCodeOrig : "",
    pamCodeCounter : 0,

    // ping
    pamPingTime : 0,
    lastPingTime : 0,
    diffTime : 0,
    pingTimer : null,  

    //Variables used for balancing
    resourcePath:"",
    numResource : 1,
    originalResource :"",
    jsonObject :"",
    isChangingData :false,
    changeTimer : null,
    communications : {},
    smartAnalytics: null,
    player: null,
    Init: function() {

        //Reset default values as they can be set 
        //again through reload
        SmartPlugin.oldFunction = null;
        /**
         * Attributes.
         */
        SmartPlugin.playerId = "";
        SmartPlugin.system = youboraData.getAccountCode();
        SmartPlugin.service = youboraData.getService();
        SmartPlugin.playInfo = youboraData;
        SmartPlugin.transactionCode = youboraData.transaction;
        SmartPlugin.username = youboraData.getUsername();

        // player reference
        SmartPlugin.player = null;
        SmartPlugin.playStateCallback = "";

        // configuration
        SmartPlugin.pluginVersion = "3.0.0_lgtv";
        SmartPlugin.targetDevice = "LG_NetCast";
        SmartPlugin.outputFormat = "xml";
        SmartPlugin.xmlHttp = null;
        SmartPlugin.isXMLReceived = false;

        // events queue
        SmartPlugin.resourcesQueue = [];
        SmartPlugin.eventsQueue = [];
        SmartPlugin.eventsTimer = null;

        // events
        SmartPlugin.isStartEventSent = false;
        SmartPlugin.isJoinEventSent = false;
        SmartPlugin.isStopEventSent = false;
        SmartPlugin.isBufferRunning = false;
        SmartPlugin.isPauseEventSent = false;

        // properties
        SmartPlugin.assetMetadata = {};
        SmartPlugin.isLive = false;
        SmartPlugin.bufferTimeBegin = 0;

        // code
        SmartPlugin.pamCode = "";
        SmartPlugin.pamCodeOrig = "";
        SmartPlugin.pamCodeCounter = 0;

        // ping
        SmartPlugin.pamPingTime = 0;
        SmartPlugin.lastPingTime = 0;
        SmartPlugin.diffTime = 0;
        SmartPlugin.pingTimer = null;  

        //Variables used for balancing
        SmartPlugin.resourcePath="";
        SmartPlugin.numResource = 1;
        SmartPlugin.originalResource ="";
        SmartPlugin.jsonObject ="";
        SmartPlugin.isChangingData =false;
        SmartPlugin.changeTimer = null;
        SmartPlugin.communications = {};
        SmartPlugin.smartAnalytics= null;
        SmartPlugin.player= null;  
        SmartPlugin.findVideo();          
       
    }, 

    Nice264AnalyticsEvents : {
        BUFFER_BEGIN: 1,
        BUFFER_END: 0
    },

    Nice264AnalyticsError : {
        0: {
            id: "FORMAT_NOT_SUPPORTED",
            message: "A/V format not supported"
        },
        1: {
            id: "NETWORK_ERROR",
            message: "Cannot connect to server or connection lost"
        },
        2: {
            id: "UNKNOWN_ERROR",
            message: "Unidentified error"
        },
        1000: {
            id: "FILE_NOT_FOUND",
            message: "File is not found"
        },
        1001: {
            id: "INVALID_PROTOCOL",
            message: "Invalid protocol"
        },
        1002: {
            id: "DRM_FAILURE",
            message: "DRM failure"
        },
        1003: {
            id: "EMPTY_PLAYLIST",
            message: "Playlist is empty"
        },
        1004: {
            id: "INVALID_PLAYLIST",
            message: "Unrecognized playlist"
        },
        1005: {
            id: "INVALID_ASK",
            message: "Invalid ASX format"
        },
        1006: {
            id: "UNRECEIVED_PLAYLIST",
            message: "Error in downloading playlist"
        },
        1007: {
            id: "OUT_OF_MEMORY",
            message: "Out of memory"
        },
        1008: {
            id: "INVALID_URL",
            message: "Invalid url list format"
        },
        1009: {
            id: "NOT_PLAYABLE",
            message: "Not playable in playlist"
        },
        1100: {
            id: "UNKNOWN_DRM_ERROR",
            message: "Unidentified WM-DRM error"
        },
        1101: {
            id: "INVALID_LICENSE",
            message: "Incorrect license in local license store"
        },
        1102: {
            id: "UNRECEIVED_LICENSE",
            message: "Fail in receiving correct license from server"
        },
        1103: {
            id: "EXPIRED_LICENSE",
            message: "Stored license expired"
        }
    },

    findVideo : function(){
        try{
            var all = document.getElementsByTagName("*");
            var found = false;
            var i=0;
            var element;
            while(i<all.length && !found){
                element = all[i];
                if(element.type != undefined){
                    if( element.type.indexOf("video") == 0 
                        || element.type.indexOf("application/x-netcast-av") != -1 
                        || element.type.indexOf("application/vnd.ms-sstr+xml") != -1){
                                       
                                        console.log(element);

                        found =true;
                        this.player = element;
                    }
                }
                i++;
            }
        }catch(err){
            console.log(err);
        }
        if(this.player!= null){
           // console.log("Player ID : " + this.player.id);
            this.playerId = this.player.id;
            try{
                setTimeout(this.init(),2000);
            }catch(err){
                console.log("Error initializing plugin " );
                console.log(err);
            }
        }else{
            //console.log("Player is null");
            try{
                setTimeout(function(){ 
                   // console.log("Repeat init");
                    SmartPlugin.findVideo(); 
                }, 1000);
            }catch(err){
                //console.log("Error in timeout");
            }
        }
    },
    /**
     * Plugin setup.
     */
    init : function()
    {
        var context = this;
        SmartPlugin.player = document.getElementById(this.playerId);
        this.oldFunction = this.player.onPlayStateChange;
        SmartPlugin.originalResource = SmartPlugin.player.data;
        this.player.onPlayStateChange = function(){ context.myCheckPlayState(); context.oldFunction.call(this); };
        this.player.onError = SmartPlugin.error;
 
        this.communications = new YouboraCommunication(this.system, this.service , SmartPlugin.playInfo , this.pluginVersion , this.targetDevice);
        this.pamPingTime = this.communications.getPingTime(); 

        if(this.isBalancerActive()){
            try{
                this.resourcePath= this.communications.getResourcePath(this.originalResource);
                //this.resourcePath="%2FniceVodSecBalancer%2F31f13b240d6eaf5c2d4ef221810cceed%2F179b826007%2F81df075c8366169030ea_03a89c5f80a7c51e94aef839706a7d3a%2Fmp4%3A81df075c8366169030ea_03a89c5f80a7c51e94aef839706a7d3a.mp4";
                //"/mp_series1/2012/09/10/00001.mp4"; 
                this.communications.getBalancedResource(this.resourcePath, SmartPlugin.callbackBalancer);
            }catch(err){ 
            }
        }


        //If it is playing, send start and join time. Exceptional case for when the plugin is not
        //fast enough integrating itself to the player
        try{
            if(this.player.playState == 1){
                //console.log("Start event begin  in init");
                this.start();   
                this.buffer(this.Nice264AnalyticsEvents.BUFFER_BEGIN) ; 
                var self= this;
                try{
                    setTimeout(function(){ 
                        try{
                            self.buffer(self.Nice264AnalyticsEvents.BUFFER_END) ;
                         }catch(err){
                            console.log(err);
                        }

                    }, 1000);
                }catch(err){
                    console.log(err);
                }
            }
        }catch(err){
            console.log(err);
        }
        
    },

    isBalancerActive : function(){
       //return false;
        return ((typeof SmartPlugin.playInfo.originCode != "undefined") || (SmartPlugin.playInfo.zoneCode!="" && (typeof SmartPlugin.playInfo.zoneCode != "undefined")));
    },

    callbackBalancer : function(jsonObject){  
         try{ 
            
            if(jsonObject != false){ 
                SmartPlugin.isChangingData =  true;
                SmartPlugin.jsonObject = jsonObject; 
                if(jsonObject[SmartPlugin.numResource] !=  undefined){
                    //SmartPlugin.player.data = "http://nws.nice264.com/vod/encopa/widevine_mb_1/038e8a2e607578f63b91.wvm";
                    SmartPlugin.player.data = jsonObject[SmartPlugin.numResource].URL;  
                }else{
                    SmartPlugin.player.data = SmartPlugin.originalResource;
                }
                //Right here, the plugin goes to stop() because of a callback; 
                SmartPlugin.numResource ++; 
                //If player is not stopped, stop it 
                
                if((SmartPlugin.player.playState != 0) && (SmartPlugin.player.playState != undefined) ){
                    SmartPlugin.player.stop();
                }
                SmartPlugin.player.play(1); 
                SmartPlugin.isChangingData =  false;
         
            

            }   
        }catch(err){
            console.log(err);
        }
    },

    updateCode : function()
    {
        this.pamCodeCounter++;
        this.pamCode = this.pamCodeOrig + "_" + this.pamCodeCounter;
    },

    reset : function()
    {
       // console.log("Reset called!!!!!!!!!!");
        this.isStartEventSent = false;
        this.isJoinEventSent = false;
        this.isBufferRunning = false;
        this.isPauseEventSent = false;
        this.bufferTimeBegin = 0;

        clearTimeout(this.pingTimer);
        this.pingTimer = null;
        this.lastPingTime = 0;
        this.diffTime = 0;

        this.updateCode();
    },

    /**
     * Plugin methods. Getters and Setters.
     */

  
    setMetadata : function(metadata)
    {
        this.assetMetadata = metadata;
    },

    getMetadata : function()
    {
        var jsonObj = JSON.stringify(this.assetMetadata);
        var metadata = encodeURI(jsonObj);

        return metadata;
    }, 

    getBitrate : function()
    {
        try
        {
            var playInfo = this.player.mediaPlayInfo();
        }
        catch (err)
        {
            return 0;
        }

        return playInfo.bitrateInstant;
    },

    getDuration: function(){
        try{
            SmartPlugin.duration = SmartPlugin.player.playTime/1000;
        }catch(err){
            SmartPlugin.duration = 0;
        }
        return SmartPlugin.duration;
    },

    setPing : function()
    {
        try{
            var context = this;
            this.pingTimer = setTimeout(function(){ context.ping(); }, this.pamPingTime);
            //If it crashed, stop the plugin
            if(SmartPlugin.player.playState == undefined){
                SmartPlugin.isChangingData =  false;
                stop();
            }
        }catch(err){
            console.log(err);
        }

    },

    /**
     * Plugin events. Analytics.
     */
    start : function()
    {
        //console.log("Start event begin in start ");
        var d = new Date();
      
        try{
            this.communications.sendStart ("0" , window.location.href , this.getMetadata() , this.isLive , this.player.data , SmartPlugin.getDuration() , SmartPlugin.transactionCode);
        
            this.isStartEventSent = true;
            SmartPlugin.setPing();
            this.lastPingTime = d.getTime();
        }catch(err){
            console.log(err);
        }

    },

    ping : function()
    {
        try{
           
            var d = new Date();

            clearTimeout(this.pingTimer);
            this.pingTimer = null;

            if (this.lastPingTime != 0)
            {
                this.diffTime = d.getTime() - this.lastPingTime;
            }
            this.lastPingTime = d.getTime();
            this.communications.sendPingTotalBitrate(this.getBitrate(),this.player.playPosition/1000);
            SmartPlugin.setPing();
            // console.log("Before stop");
           /* if(this.player.playState == 1){
                this.player.pause();
            }else if(this.player.playState == 2){
                this.player.play();
            }*/
            //this.player.stop();
            //console.log("After stop");
           
        }catch(err){
            console.log(err);
        }
        //this.context.setPing(); 
    },

    buffer : function(bufferState)
    {
        var d = new Date();
        var bufferTimeEnd = 0;
        var bufferTimeTotal = 0;
        var params = null;

        if (bufferState == this.Nice264AnalyticsEvents.BUFFER_BEGIN)
        {
            this.bufferTimeBegin = d.getTime();
        }
        else if (bufferState == this.Nice264AnalyticsEvents.BUFFER_END)
        {
            bufferTimeEnd = d.getTime();
            bufferTimeTotal = bufferTimeEnd - this.bufferTimeBegin;

            if (!this.isJoinEventSent)
            {
                this.isJoinEventSent = true;
                //Minimum valid value for JoinTime
                if(bufferTimeTotal < 10 ){
                    bufferTimeTotal = 10;
                }
                this.communications.sendJoin(this.player.playPosition,bufferTimeTotal);
            }
            else
            {
                this.communications.sendBuffer( this.player.playPosition , bufferTimeTotal );

            }
        }
    },

    resume : function()
    {
        this.communications.sendResume();
    },

    pause : function()
    {
        this.communications.sendPause();
    },

    stop : function()
    {
        try{
            if(SmartPlugin.isChangingData && SmartPlugin.isBalancerActive()){
               // SmartPlugin.setPing();
               //SmartPlugin.checkChangeStatus();

            }
            else{
                this.communications.sendStop();
                clearTimeout(this.pingTimer);
                this.pingTimer = null;

                this.reset();
            }
            SmartPlugin.isChangingData =  false;
        }catch(err){
            console.log(err);
        }        
    },

    error : function()
    {
        //console.log("Error");
       // console.log("Errror  ;  is BalancerActive ? " + SmartPlugin.isChangingData);
        try{
            if(SmartPlugin.isBalancerActive()){    
                SmartPlugin.callbackBalancer(SmartPlugin.jsonObject);        
            }else{
                    var errorMessage =SmartPlugin.Nice264AnalyticsError[SmartPlugin.player.error].id + ": " + SmartPlugin.Nice264AnalyticsError[SmartPlugin.player.error].message;

                    SmartPlugin.communications.sendError( SmartPlugin.player.error  , errorMessage , SmartPlugin.transactionCode , encodeURIComponent(SmartPlugin.player.data) , SmartPlugin.system , SmartPlugin.isLive, SmartPlugin.getMetadata(), SmartPlugin.username , encodeURIComponent(window.location.href), "0", SmartPlugin.pamPingTime , SmartPlugin.pluginVersion, SmartPlugin.getDuration());

                    /*clearTimeout(this.pingTimer);
                    this.pingTimer = null;*/
                    SmartPlugin.reset();

            }
                
        }catch(err){
            console.log(err);
        }
    },

    /**
     * Plugin events. Player.
     */
    myCheckPlayState : function()
    {
        switch (this.player.playState)
        {
            case 0:     // stopped
                if (!this.isStopEventSent)
                {
                    this.isStopEventSent = true;
                    this.stop();
                }
                break;
            case 1:     // playing
                if (this.isStopEventSent)
                {
                    this.isStopEventSent = false;
                }
                if (!this.isStartEventSent)
                {
                    try{
                        this.isStartEventSent = true;
                        this.start();
                    }catch(err){
                        console.log(err);
                    }
                }
                else if (this.isPauseEventSent)
                {
                    this.isPauseEventSent = false;
                    this.resume();
                }

                if (!this.isJoinEventSent && !this.isBufferRunning)
                {
                    this.buffer(this.Nice264AnalyticsEvents.BUFFER_BEGIN);
                    this.buffer(this.Nice264AnalyticsEvents.BUFFER_END);
                }

                if (this.isBufferRunning)
                {
                    this.isBufferRunning = false;
                    this.buffer(this.Nice264AnalyticsEvents.BUFFER_END);
                }
                break;
            case 2:     // paused
                this.isPauseEventSent = true;
                this.pause();
                break;
            case 3:     // connecting
                break;
            case 4:     // buffering
                this.isBufferRunning = true;
                this.buffer(this.Nice264AnalyticsEvents.BUFFER_BEGIN);
                break;
            case 5:     // finished
                if (!this.isStopEventSent)
                {
                    this.isStopEventSent = true;
                    this.stop();
                }
                break;
            case 6:     // error
                if(this.isBalancerActive()){
                    SmartPlugin.callbackBalancer(SmartPlugin.jsonObject);
                }
                this.error();
                if (!this.isStopEventSent)
                {
                    this.isStopEventSent = true;
                    this.stop();
                }
                break;
        }
        
    }
};


// TODO: add events queue logic