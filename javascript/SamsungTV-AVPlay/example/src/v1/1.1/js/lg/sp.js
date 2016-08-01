/**
 * Created for NicePeopleAtWork.
 * User: Miquel Fradera
 * User: Luis Miguel Lainez
 * Date: 03/04/14
 * Time: 16:48
 */

//We look for all the elements in the view.
//This is because there is no identifier for the video.
//And it can have the tag "object", so tag video doesn't
//work either.
//If the video is not found, we will looking for it 
var SmartPlugin = { 
    smartAnalytics: null,
    player: null,
    numResource : 1,
    originalResource :"",
    jsonObject :"",
        oldFunction : null,
        /**
         * Attributes.
         */
        playerId : "",
        system : youboraData.getAccountCode(),
        service : youboraData.getService(),

        // player reference
        player : null,
        playStateCallback : "",

        // configuration
        pluginVersion : "3.0.0_lgtv",
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

        // urls
        pamBufferUnderrunUrl : "",
        pamJoinTimeUrl : "",
        pamStartUrl : "",
        pamStopUrl : "",
        pamPauseUrl : "",
        pamResumeUrl : "",
        pamPingUrl : "",
        pamErrorUrl : "",

        // code
        pamCode : "",
        pamCodeOrig : "",
        pamCodeCounter : 0,

        // ping
        pamPingTime : 0,
        lastPingTime : 0,
        diffTime : 0,
        pingTimer : null,

        communications :{},

        //Variables for the balancer
        originalResource:"",
        resourcePath:"",
    Init: function() {  
        console.log("6 plugin");
        try{
            var all = document.getElementsByTagName("*");
            var found = false;
            var i=0;
            var element;
            while(i<all.length && !found){
                element = all[i];
                if(element.type != undefined){
                    if( element.type.indexOf("video") == 0){
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
            this.playerId = this.player.id;
            console.log("Player ID : " + this.player.id); 
            this.init();
             //var nice264Plugin = new Nice264Analytics(this.player.id);
        }else{
            console.log("Player is null");
            try{
                setTimeout(function(){ 
                    console.log("Repeat init");
                    console.log(SmartPlugin);
                    SmartPlugin.Init(); 
                }, 1000);
            }catch(err){
                console.log("Error in timeout");
            }
        }    
    },
    Nice264AnalyticsEvents : {
        BUFFER_BEGIN: 1,
        BUFFER_END: 0
    },

    Nice264AnalyticsError :  {
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

    /**
     * Plugin setup.
     */
    init : function()
    {
        try{
            var context = this;
            this.player = document.getElementById(this.playerId);
            this.oldFunction = this.player.onPlayStateChange;
            this.player.onPlayStateChange = function(){ context.myCheckPlayState(); context.oldFunction.call(this); };
            this.originalResource = this.player.data;
            SmartPlugin.originalResource= this.player.data;
            console.log("Original Resource : " + this.player.data);
        }catch(err){
            console.log("Error in 210 " + err);
        }
        try{
            this.communications = new YouboraCommunication(this.system, this.service , youboraData , this.pluginVersion , this.targetDevice);
            this.pamPingTime = this.communications.getPingTime();
            /*try{
                console.log(this.player);
                console.log("Cambio de video from : " + this.player.data );
                this.player.data ="http://nws.nice264.com/vod/encopa/widevine_mb_1/038e8a2e607578f63b91.wvm";
                console.log("Next data : " + this.player.data);
            }catch(err){
                console.log(err);
            }*/
            console.log("Is balancer Active : " + this.isBalancerActive());
            if(this.isBalancerActive()){
                try{
                    //this.resourcePath= this.communications.getResourcePath(this.originalResource);
                    this.resourcePath="/mp_series1/2012/09/10/00001.mp4";
                    console.log("Resource path : " + this.resourcePath) ;
                    this.communications.getBalancedResource(this.resourcePath, SmartPlugin.callbackBalancer);
                }catch(err){
                    console.log(err);
                }
            }

        }catch(err){
            console.log(err);
        }

        //If it is playing, send start and join time. Exceptional case for when the plugin is not
        //fast enough integrating itself to the player
        try{
            if(this.player.playState == 1){
                //console.log("Start event begin  in init");
                this.start();  
                console.log("Playing now. pre-start ") 
                this.buffer(this.Nice264AnalyticsEvents.BUFFER_BEGIN) ;
                console.log("After buffer");
                var self= this;
                try{
                    setTimeout(function(){ 
                        try{
                            console.log("In the timeout 2");
                            self.buffer(self.Nice264AnalyticsEvents.BUFFER_END) ;
                            console.log("after buffer");
                         }catch(err){
                            console.log(err);
                        }

                    }, 1000);
                }catch(err){
                    console.log("Err in 261 " + err);
                }
            }
        }catch(err){
            console.log(err);
        }

        try{
            console.log("The Callback is : " );
            console.log(youboraData.onInitCallback);
            youboraData.onInitCallback();
        }catch(err){
            console.log("Error in on init callback ");
            console.log(err);
        }

    },

    isBalancerActive : function(){
       //return false;
        return ((typeof youboraData.originCode != "undefined") || (youboraData.zoneCode!="" && (typeof youboraData.zoneCode != "undefined")));
    },

    callbackBalancer : function(jsonObject){
         try{
            console.log("Inside callback");
            console.log(jsonObject);
            SmartPlugin.jsonObject = jsonObject;
       
            if(jsonObject != false){
                console.log(this);
                console.log(SmartPlugin.player);
                if(jsonObject[SmartPlugin.numResource] !=  undefined){
                    console.log("Load :  " + jsonObject[SmartPlugin.numResource].URL);
                    SmartPlugin.player.data = jsonObject[SmartPlugin.numResource].URL;  
                }else{
                    SmartPlugin.player.data = SmartPlugin.originalResource;
                }
                SmartPlugin.numResource ++;
                console.log("Final data : " + SmartPlugin.player.data) ;
                //If player is not stopped, stop it
                if(SmartPlugin.player.playState!=0){
                    SmartPlugin.player.stop();
                }
                SmartPlugin.player.play(1);         
                // context.player.data = jsonObject[1].URL;
                //Next source to test: first one
                console.log(SmartPlugin.player);
                //console.log("PlayListAfter");
                //console.log(player.getPlaylist());    
            }   
        }catch(err){
            console.log(err);
        }
    },

   /* parseAnalyticsResponse : function(httpEvent)
    {
        if (httpEvent.target.readyState == 4)
        {
            var response = httpEvent.target.responseText;
            var d = new Date();

            if (response.length > 0 || response != "" || !typeof(undefined))
            {
                this.pamPingTime = response;
            }

            this.setPing();
            this.lastPingTime = d.getTime();
        }
    },*/

    updateCode : function()
    {
        try{
            this.pamCodeCounter++;
            this.pamCode = this.pamCodeOrig + "_" + this.pamCodeCounter;
        }catch(err){
            console.log("Error in 328 " + err);
        }
    },

    reset : function()
    {
        try{
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
        }catch(err){
            console.log("Error in 347 " + err);
        }

    },

    /**
     * Plugin methods. Getters and Setters.
     */
    setPlayerStateCallback : function(callback)
    {
        this.playStateCallback = callback;
    },

    setUsername : function(username)
    {
        youboraData.setUsername(username);
    },

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

    setLive : function(value)
    {
        this.isLive = value;
    },

    setTransactionCode : function(trans)
    {
        youboraData.setTransactionCode(trans);
    },

    getBitrate : function()
    {
        try
        {
            var playInfo = this.player.mediaPlayInfo();
        }
        catch (err)
        {
            return -1;
        }

        //console.log("DRM_TYPE="+$("#"+this.playerId).attr("drm_type"));

        if ($("#"+this.playerId).attr("drm_type") === undefined){
            //for NO DRM
            return playInfo.bitrateTarget;
        } else if ($("#"+this.playerId).attr("drm_type") == "widevine" || $("#"+this.playerId).attr("drm_type") == "wm-drm"){
            //for DRM
            return playInfo.bitrateInstant;
        }
            
        //return playInfo.bitrateInstant;
    },

    setPing : function()
    {
        var context = this;

        this.pingTimer = setTimeout(function(){ context.ping(); }, this.pamPingTime);
    },

    /**
     * Plugin events. Analytics.
     */
    start : function()
    {
        //console.log("Start event begin in start ");
        var d = new Date();
      
        try{
            this.communications.sendStart ("0" , window.location.href , this.getMetadata() , this.isLive , this.player.data , "0" , youboraData.getTransaction());
        
            this.isStartEventSent = true;
            this.setPing();
            this.lastPingTime = d.getTime();
        }catch(err){
            console.log(err);
        }
        //console.log("Start event sent ");
    },

    ping : function()
    {

        var d = new Date();

        clearTimeout(this.pingTimer);

        this.communications.sendPingTotalBitrate(this.getBitrate(),this.player.playPosition);

        this.setPing(); 

    },

    buffer : function(bufferState)
    {
        try{

            var d = new Date();
            var bufferTimeEnd = 0;
            var bufferTimeTotal = 0;

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

                    this.communications.sendJoin(this.player.playPosition,bufferTimeTotal);

                }
                else
                {
                    this.communications.sendBuffer( this.player.playPosition , bufferTimeTotal );
                }
            }
        }catch(err){
            console.log(err);
        }
    },

    resume : function()
    {

        this.communications.sendResume();
    },

    pause : function()
    {
        this.communications.sendPause();
       /* var params = "?code=" + this.pamCode;

        this.sendAnalytics(this.pamPauseUrl, params, false);*/
    },

    stop : function()
    {
        try{

            this.communications.sendStop();
            clearTimeout(this.pingTimer);
            this.pingTimer = null;

            console.log("Before call callback");
           // youboraData.onSetupCallback();
            console.log("After calling callback");

            this.reset();
        }catch(err){
            console.log("Error in 516 " + err);
        }
    },

    error : function()
    {

        try{
            var errorMessage =this.Nice264AnalyticsError[this.player.error].id + ": " + this.Nice264AnalyticsError[this.player.error].message;

            this.communications.sendError( this.player.error  , errorMessage , youboraData.transaction , encodeURIComponent(this.player.data) , this.system , this.isLive, this.getMetadata(), youboraData.getUsername(), encodeURIComponent(window.location.href), "0", this.pamPingTime , this.pluginVersion, this.duration);

          

            clearTimeout(this.pingTimer);
            this.pingTimer = null;


            if(this.isBalancerActive()){
                console.log("Before reload");
                console.log("SmartPlugin jsonObject");
                try{
                    this.callbackBalancer(SmartPlugin.jsonObject);
                }catch(err){
                    console.log(err);
                }
                console.log("after reload");
            }
        }catch(err){
            console.log("Error in 545 " + err);
        }
    },

    /**
     * Plugin events. Player.
     */
    myCheckPlayState : function()
    {
        console.log("Player state : " + this.player.playState);
        try{
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
                    console.log(!this.isJoinEventSent);
                    console.log( !this.isBufferRunning);
                    if (this.isStopEventSent)
                    {
                        this.isStopEventSent = false;
                    }

                    if (!this.isStartEventSent)
                    {
                        //this.isStartEventSent = true;
                        this.start();
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

                    console.log("This is an error");
                    this.error();
                    if (!this.isStopEventSent)
                    {
                        this.isStopEventSent = true;
                        this.stop();
                    }
                    break;
            }
        }catch(err){
            console.log(err);
        }
        
    }
};

