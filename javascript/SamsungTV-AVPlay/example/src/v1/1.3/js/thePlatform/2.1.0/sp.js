/*
 * NicePeopleAtWork Smartplugin
 * Copyright (c) 2013 NicePeopleAtWork
 * Author: Luis Miguel Lainez
 * Version: 1.3.2.1.0
 */
if ($pdk.plugin == null)
{
    $pdk.ns("$pdk.plugin");
}
/*
* Base Plugin
*/

$pdk.ns("$pdk.plugin.Smartplugin");
$pdk.plugin.Smartplugin = $pdk.extend(function(){},{

    constructor: function() {

        this.pluginVersion = "1.3.2.1.0_platHTML5",
        this.targetDevice = "thePlatform",
        this.communications = {},
        // Media
        this.mediaEvents = { BUFFER_BEGIN: 1, BUFFER_END: 0 },
        this.urlResource = undefined,
        this.pingTimer = undefined,
        this.currentTime = 0,
        this.duration = 0,
        // Triggers
        this.isBuffering = false,
        this.isStartSent = false,
        this.isJoinSent = false,
        this.isPaused = false,
        this.isSeeking = false,
        this.bufferTimeBegin = 0,
        this.joinTimeBegin = 0,
        this.player ={};
        //For buffer control purposes only
        this.lastCurrentTime=0;
        //The player in devices such as android, throws a mediaPlaying event even if
        //the time changed is around 0.01 s, so this leads to many microbuffers. with this threshold we will make sure that
        //the change in the playtime is representative
        this.bufferThreshold=0.09;
        this.bufferCheckTimer={};

        this.errorCodes = {
            
        };
        
    },
    initialize : function(lo)
    {
        var me = this;

        this.mediaPlayingListener = function(e)
        {
            me.onMediaPlaying(e);
        };
        this.mediaPauseListener = function(e)
        {
            me.onMediaPause(e);
        };
        this.mediaStartListener = function(e)
        {
            me.onMediaStart(e);
        };

        this.mediaEndListener = function(e)
        {
            me.onMediaEnd(e);
        };

        this.mediaErrorListener = function(e)
        {
            me.onMediaError(e);
        };
        this.releaseEndListener = function(e)
        {
            me.onReleaseEnd(e);
        };
        this.onClipInfoLoadedListener = function(e)
        {
            me.onClipInfoLoaded(e);
        };
        this.mediaBufferListener = function(e)
        {
            me.onMediaBuffer(e);
        };
        this.mediaPlayListener = function(e)
        {
            me.onMediaPlay(e);
        };
        this.mediaSeekListener = function(e)
        {
            me.onMediaSeek(e);
        };
        this.playButtonClickedListener = function(e)
        {
            me.onPlayButtonClicked(e);
        };
        this.streamSwitchedListener = function(e)
        {
            me.onStreamSwitched(e);
        };
        $pdk.controller.addEventListener("OnMediaPlaying", this.mediaPlayingListener);
        $pdk.controller.addEventListener("OnMediaPause", this.mediaPauseListener);
        $pdk.controller.addEventListener("OnClipInfoLoaded", this.onClipInfoLoaded);
        $pdk.controller.addEventListener("OnMediaBuffer", this.mediaBufferListener);
        $pdk.controller.addEventListener("OnMediaEnd", this.mediaEndListener);
        $pdk.controller.addEventListener("OnMediaError", this.mediaErrorListener);
        $pdk.controller.addEventListener("OnVersionError", this.mediaErrorListener);
        //Only after buffer
        $pdk.controller.addEventListener("OnMediaPlay", this.mediaPlayListener);
        $pdk.controller.addEventListener("OnMediaSeek", this.mediaSeekListener);
        //Send the start ? ->No data of resource
        $pdk.controller.addEventListener("OnPlayButtonClicked", this.playButtonClickedListener);
        //Send the join time
        $pdk.controller.addEventListener("OnMediaStart", this.mediaStartListener);
        $pdk.controller.addEventListener("OnStreamSwitched", this.streamSwitchedListener);
        
        this.communications = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), youboraData, this.pluginVersion, this.targetDevice);
        this.pingTime = this.communications.getPingTime();
        
    },
    onMediaPlaying :function(e){  
        this.currentTime = e.data.currentTime/1000;
        if(this.isPaused){
            this.communications.sendResume();
            this.isPaused=false;
        }
        if(this.isBuffering){
            if((this.lastCurrentTime + this.bufferThreshold) < this.currentTime){  
                this.buffer(this.mediaEvents.BUFFER_END);
            }
        }
        this.isSeeking = false;
        youboraData.log(e);
    },
    onMediaPause :function(e){
        this.communications.sendPause();
        this.isPaused = true;
        youboraData.log(e);
    },
    onClipInfoLoaded :function(e){
        youboraData.log(e);
    },
    onMediaBuffer :function(e){
        youboraData.log(e);
        if(!this.isStartSent){
            this.start(e);
        }else{
            this.buffer(this.mediaEvents.BUFFER_BEGIN);
        }   
    },
    onMediaEnd :function(e){
        youboraData.log(e);
        if(this.isStartSent){
            if(!e.data.baseClip.isAd /*&& this.isCloseToEnd(e.data.currentMediaTime)*/){
                this.communications.sendStop();
                this.reset();
            }
        }
    },
    onMediaError :function(e){
        youboraData.log(e);

        var clip = e.data;

        if ( e.data.clip != undefined ) {
            clip = e.data.clip;
        }

        // Get Duration
        try {
            this.duration = clip.mediaLength/1000;
            if(this.duration < 0 ){
                this.duration=0;
            }
        } catch (e) {}

        // Get resource from the OVP
        try {
            if ( clip.URL == undefined || clip.URL == "" ) {
                if ( clip.baseClip != undefined ) {
                    this.urlResource = clip.baseClip.URL;
                }
            } else {
                this.urlResource = clip.URL;
            }
        }catch (e) {
            this.urlResource = "";
        }

        //take the title from the OVP
        try {
            youboraData.properties.content_metadata.title = clip.title;
            
            if ( youboraData.properties.content_metadata.title == undefined || youboraData.properties.content_metadata.title == "" ) {
                if ( clip.baseClip != undefined ) {
                    youboraData.properties.content_metadata.title = clip.baseClip.title;
                }
            }
        }catch (e) {
            youboraData.properties.content_metadata.title= 'Undefined';
        }

        var resourceToSend = this.urlResource;

        try {
            if(youboraData.getMediaResource()!=""){
                resourceToSend = youboraData.getMediaResource();
            }
            this.isLive = clip.isLive;
            if(this.isLive == undefined){
                this.isLive = youboraData.getLive();
            }   
        }catch (e) {}

        this.communications.sendErrorWithParameters ("3001", "", 0, window.location.href, youboraData, this.isLive, resourceToSend, this.duration);
        this.reset();
        
    },
    onMediaPlay :function(e){

        youboraData.log(e);
        if(this.isBuffering){
            if((this.lastCurrentTime + this.bufferThreshold) < this.currentTime){  
                this.buffer(this.mediaEvents.BUFFER_END);
            }
        }
    },
    onMediaSeek :function(e){
        youboraData.log(e);
        this.isSeeking = true;
    },
    onPlayButtonClicked :function(e){
        youboraData.log(e);
        //For the JoinTime calculus
        this.buffer(this.mediaEvents.BUFFER_BEGIN);
    },
    onMediaStart :function(e){

        youboraData.log(e);
        //In case there has been a change of video without end or
        //stop is prevented because of possible Ad
        /*if(!e.data.baseClip.isAd && e.data.URL != this.urlResource){
            this.communications.sendStop();
            this.reset();
        }*/
        //Sometimes, if there is no buffer, start is not sent in buffer
        if(!this.isStartSent){
            this.start(e);
            this.buffer(this.mediaEvents.BUFFER_BEGIN);
        }
      
    },
    onStreamSwitched :function(){
        youboraData.log(e);
    },

    buffer:function(bufferState)
    {
        var d = new Date();
        var bufferTimeEnd = 0;
        var bufferTimeTotal = 0;

        if (bufferState == this.mediaEvents.BUFFER_BEGIN)
        {
            this.bufferTimeBegin = d.getTime();
            this.isBuffering=true;

        }
        else if (bufferState == this.mediaEvents.BUFFER_END)
        {
            var bufferTimeEnd = d.getTime();
            bufferTimeTotal = bufferTimeEnd - this.bufferTimeBegin;
            if(!this.isJoinSent){
                if(bufferTimeTotal<10){
                    bufferTimeTotal =10;
                }
                this.communications.sendJoin( 0 ,bufferTimeTotal );
                this.isJoinSent=true;

            }else{
                this.communications.sendBuffer( this.currentTime ,bufferTimeTotal );

            }
            this.isBuffering=false;
        }
    },
    setPing:function()
    {
        var context = this;
        try{
            this.pingTimer = setTimeout(function(){
                     context.ping(); 
            }, this.pingTime);
        }
        catch(err){
            youboraData.log(err);
         }
    },
    ping:function(){
        if(this.currentTime==undefined){
            this.currentTime=0;
        }
        this.communications.sendPingTotalBitrate(this.bitrate,this.currentTime);
        this.setPing();
    },
    reset : function(){
        this.urlResource = undefined;
        clearTimeout(this.pingTimer);
        clearTimeout( this.bufferCheckTimer);
        this.currentTime = 0;
        this.duration = 0;
        this.isBuffering = false;
        this.isStartSent = false;
        this.isJoinSent = false;
        this.isPaused = false;
        this.bufferTimeBegin = 0;
        this.joinTimeBegin = 0;

        this.communications = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), youboraData, this.pluginVersion, this.targetDevice);
    },
    start:function(e){
        this.duration=e.data.mediaLength/1000;
        if(this.duration<0){
            this.duration=0;
        }
 
        // Get resource from the OVP
        try {
            if ( e.data.URL == undefined || e.data.URL == "" ) {
                if ( e.data.baseClip != undefined ) {
                    this.urlResource = e.data.baseClip.URL;
                }
            } else {
                this.urlResource = e.data.URL;
            }
        }catch (e) {
            this.urlResource = "";
        }

        //if unset, take the title from the OVP
        try {
            youboraData.properties.content_metadata.title= e.data.title;
            
            if ( youboraData.properties.content_metadata.title == undefined || youboraData.properties.content_metadata.title == "" ) {
                if ( e.data.baseClip != undefined ) {
                    youboraData.properties.content_metadata.title = e.data.baseClip.title;
                }
            }
        }catch (e) {
            youboraData.properties.content_metadata.title= 'Undefined';
        }

        this.currentTime = e.data.currentTime;
        this.bitrate = e.data.baseClip.bitrate;
        this.isLive = e.data.isLive;
        if(this.isLive == undefined){
            this.isLive = youboraData.getLive();
        }
        var resourceToSend = this.urlResource;
        if(youboraData.getMediaResource()!=""){
            resourceToSend = youboraData.getMediaResource();
        }
        this.communications.sendStart(0, window.location.href, "", youboraData.getLive(), resourceToSend , this.duration);
        this.setPing();
        this.isStartSent =true;
        this.setBufferChecker();
    },
    //Convenient method to know if the currentTime is close to the end
    //of the video, it is used to make the plugin resistant to ads
    isCloseToEnd : function(currentTime){
        // 10 %
        var threshold = 0.1;
        return (currentTime +(threshold * (this.duration*1000))) >= (this.duration*1000) ;
      
    },
    setBufferChecker :function()
    {
        var context = this;
        this.bufferCheckTimer = setTimeout(function(){ context.bufferChecker(); }, 500);

    },
    bufferChecker :function(){
        //console.log("Buffer checker : lastTime :  " +  this.lastCurrentTime + " , currentTime : " + this.currentTime );
        if(this.lastCurrentTime == this.currentTime){
            if(!this.isBuffering && !this.isPaused && !this.isSeeking){
                //console.log("BUFFER BEGIN  ");
                this.buffer(this.mediaEvents.BUFFER_BEGIN);
            }
        }
        this.lastCurrentTime = this.currentTime;      
        this.setBufferChecker();
    }

});//

// Smartplugin.js
// create an instance of the plugin and tell the controller we're ready.
var plugin  = new $pdk.plugin.Smartplugin();
$pdk.controller.plugInLoaded(plugin);