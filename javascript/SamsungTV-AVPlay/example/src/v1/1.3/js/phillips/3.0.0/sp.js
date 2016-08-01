/**
 * Created for NicePeopleAtWork.
 * User: Miquel Fradera.
 * Date: 4/02/14
 * Time: 12:57
 */

var SmartPluginAnalyticsEvents = {
    BUFFER_BEGIN: 1,
    BUFFER_END: 0
};
var SmartPlugin = { 
    balancerJson :"",
    player : {},
    smartPlugin: {},
    originalResource  : "",
    //Variable to control if the user pressed play.
    //If so, when balancing, we will autoplay
    isPlayPressed : false,
    nextUrlIndexFromBalancer : 1,
     /**
     * Attributes.
     */
    playerId : "",
    system : "",
    service : "",
    playInfo : {},
    bandwidth : {},

    // player reference
    player : null,
    playStateCallback : "",

    // configuration
    pluginVersion : "1.3.3.0.0_philipstv",
    targetDevice : "Philips_InternetTV",

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

    //Communication interface
    communications : {},

    resourcePath : "",

    //Current index in the balancer reponse. 
    //It starts in 1 due to the response format
    nextUrlIndexFromBalancer : 1,
    //Response of the balancer. It is kept for the switching
    balancerJson  : {},
    //Original resource, set by the user as a playlistItem
    originalResource  : "",
    //Instant to go back if the play fails
    seekTime : 0,
    isBalancerActivated : false,
    Init: function()  {  
        try
        {                           
            var videoPlayer                   = document.videoPlayer.id;
            var bandwidth                     = {};
            SmartPlugin.player                = document.getElementById(document.videoPlayer.id);
  
            this.playerId = document.videoPlayer.id;
            this.system =youboraData.getAccountCode();
            this.service =youboraData.getService();
            this.playInfo = youboraData,
            this.initPlugin();
            //this.bandwidth = playInfo,
            //SmartPlugin.smartPlugin   = new SmartPluginAnalytics ( videoPlayer , youboraData.getAccountCode() , youboraData.getService() , bandwidth );
                               
            this.setPlayerStateCallback("checkPlayState");
            this.setLive( youboraData.getLive() );
            this.setUsername(youboraData.getUsername() );
        }
        catch(err)
        {
            console.log( "SmartPluginAnalytics :: Error while get video object" );
            console.log(err);
        }
    },

   
    /**
     * Plugin setup.
     */
    initPlugin : function()
    {

        var context = this;
        this.player = document.getElementById(this.playerId);
        this.player.onPlayStateChange = function(){ context.checkPlayState(); };
        this.communications = new YouboraCommunication(this.system , this.service ,  this.playInfo , this.pluginVersion , this.targetDevice );
        this.pamPingTime = this.communications.getPingTime();
        this.isBalancerActivated = this.isBalancerActive();
        this.originalResource = this.player.data;
        SmartPlugin.originalResource = this.player.data;
        if(this.isBalancerActivated){
            this.resourcePath= this.communications.getResourcePath(this.originalResource);
            this.communications.getBalancedResource(this.resourcePath,this.callbackBalancer);
        }
       
        
    },

    //Balancer is active if originCode and zoneCode are not set
    isBalancerActive : function(){   
        return ((typeof youboraData.originCode != "undefined") || (youboraData.zoneCode!="" && (typeof youboraData.zoneCode != "undefined")));
    },

    callbackBalancer : function(jsonObject){
        try{
            
            if(jsonObject != false){
              
                SmartPlugin.balancerJson = jsonObject;
               
                if(jsonObject[SmartPlugin.nextUrlIndexFromBalancer] !=  undefined){
                    SmartPlugin.player.data = jsonObject[SmartPlugin.nextUrlIndexFromBalancer].URL;  
                }else{
                    SmartPlugin.player.data = SmartPlugin.originalResource;
                }
                SmartPlugin.nextUrlIndexFromBalancer ++;     
                if(SmartPlugin.isPlayPressed){
                    SmartPlugin.player.play();
                }  
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
    setPlayerStateCallback : function(callback)
    {
        this.playStateCallback = callback;
    },

    setUsername : function(username)
    {
        this.playInfo.username = username;
    },

    setMetadata : function(metadata)
    {
        this.assetMetadata = metadata;
    },

    getMetadata : function()
    {
        var jsonObj = JSON.stringify(this.assetMetadata);
        var metadata = encodeURIComponent(jsonObj);

        return metadata;
    },

    setLive : function(value)
    {
        this.isLive = value;
    },

    setTransactionCode : function(trans)
    {
        this.playInfo.transaction = trans;
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
        var d = new Date();
        try{
            this.communications.sendStart ( 0 , window.location.href , this.getMetadata() , this.isLive ,  this.player.data, this.duration,youboraData.transaction);
        }catch(err){
            console.log(err);
        }

        this.setPing();
        this.lastPingTime = d.getTime();
    },

    ping : function()
    {
        clearTimeout(this.pingTimer);
        try{
            this.communications.sendPingTotalBitrate(this.getBitrate(),this.player.playPosition/1000);
            this.setPing();
        }catch(err){
            console.log(err);
        }
    },

    buffer : function(bufferState)
    {
        var d = new Date();
        var bufferTimeEnd = 0;
        var bufferTimeTotal = 0;
        var params = null;
        if (bufferState == SmartPluginAnalyticsEvents.BUFFER_BEGIN)
        {
            this.bufferTimeBegin = d.getTime();
        }
        else if (bufferState == SmartPluginAnalyticsEvents.BUFFER_END)
        {
            bufferTimeEnd = d.getTime();
            bufferTimeTotal = bufferTimeEnd - this.bufferTimeBegin;

            if (!this.isJoinEventSent)
            {
               
                this.isJoinEventSent = true;
                this.communications.sendJoin(this.player.playPosition/1000, bufferTimeTotal);
            }
            else
            {
                this.communications.sendBuffer(this.player.playPosition/1000 ,bufferTimeTotal );

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
        this.communications.sendStop();

        clearTimeout(this.pingTimer);
        this.pingTimer = null;

        this.reset();
    },

    error : function()
    {

        if (this.isStartEventSent){
            this.communications.sendError(this.player.error,"");
        }
        if(this.isBalancerActive()){  
            try{
                this.callbackBalancer(SmartPlugin.balancerJson);
            }catch(err){
                console.log(err);
            }
        }
        clearTimeout(this.pingTimer);
        this.pingTimer = null;

    },

    /**
     * Plugin events. Player.
     */
    checkPlayState : function()
    {   
        //console.log("Player play State : "  + this.player.playState);
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
                    this.isStartEventSent = true;
                    this.start();
                }
                else if (this.isPauseEventSent)
                {
                    this.isPauseEventSent = false;
                    this.resume();
                }

                if (!this.isJoinEventSent && !this.isBufferRunning)
                {
                    //this.buffer(SmartPluginAnalyticsEvents.BUFFER_BEGIN);
                    this.buffer(SmartPluginAnalyticsEvents.BUFFER_END);
                }

                if (this.isBufferRunning)
                {
                    this.isBufferRunning = false;
                    this.buffer(SmartPluginAnalyticsEvents.BUFFER_END);
                }
                break;
            case 2:     // paused
                this.isPauseEventSent = true;
                this.pause();
                break;
            case 3:     // connecting
                SmartPlugin.isPlayPressed = true;
    			if (!this.isJoinEventSent && !this.isBufferRunning)
                {
                    this.buffer(SmartPluginAnalyticsEvents.BUFFER_BEGIN);
                    //this.buffer(SmartPluginAnalyticsEvents.BUFFER_END);
                }
                break;
            case 4:     // buffering
                this.isBufferRunning = true;
                this.buffer(SmartPluginAnalyticsEvents.BUFFER_BEGIN);
                break;
            case 5:     // finished
                if (!this.isStopEventSent)
                {
                    this.isStopEventSent = true;
                    this.stop();
                }
                break;
            case 6:     // error
                this.error();
                if (!this.isStopEventSent)
                {
                    this.isStopEventSent = true;
                    this.stop();
                }
                break;
        }

        eval(this.playStateCallback + "()");
    }
};

// TODO: add events queue logic
