/* Nice264 SmartPlugins
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Luis Miguel Lainez
 * Version: 1.0.0
 */

var NiceAbstractPluginEvents ={
    BUFFER_INI : "NiceBufferIni",
    BUFFER_END : "NiceBufferEnd",
    PLAY : "NicePlay",
    STOP : "NiceStop",
    PAUSE :"NicePause",
    RESUME :"NiceResume",
    SEEK_INIT :"NiceSeekInit",
    SEEK_END :"NiceSeekEnd",
    AD_START : "NiceAdStart",
    AD_END : "NiceAdEnd",
    ERROR : "NiceError"
};
function NiceAbstractPlugin(youboraData) {

    this.playProperties = { 
        totalBytes : 0,
        pluginVersion : "",
        targetDevice :"",
        duration: -1,
        currentTime:0,
        resource: "",
        bitrate: 0,
        errorCode: "",
        errorMsg: "",
        currentTime :"",
        live :false
    };

    this.youboraData = youboraData;

    this.isStartEventSent = false;
    this.isJoinEventSent =false;
    this.bufferInitTime=0;
    this.isPauseEventSent =false;
    this.isSeeking = false;
    this.isBuffering = false;
    this.isAdsPlaying = false;
    this.pingTime = 5;
    this.pingTimer={};
    this.timeBeforeAds=0;

    this.balancerProperties = {
        isBalancing : false,
        balancerCallback :"",
        originalResource : "",
        originalCDN : "",
        videoIndex : 1,
        balancerObject : false,
        isOriginalVideoLoaded:false
    };
    this.communications ={};

}

NiceAbstractPlugin.prototype.dispatchEvent = function(event){ 
    var event = new CustomEvent(event, { bubbles: true, cancelable: true });
    document.dispatchEvent(event);
}

NiceAbstractPlugin.prototype.init =function(){
    try{
        this.communications = new YouboraCommunication(this.youboraData.accountCode , this.youboraData.service ,  
                                                       this.youboraData , this.playProperties.pluginVersion , 
                                                       this.playProperties.targetDevice );
        var context = this;
        document.addEventListener(NiceAbstractPluginEvents.BUFFER_INI, function(){ context.bufferIni(context) });
        document.addEventListener(NiceAbstractPluginEvents.PLAY,function(){ context.play(context) });
        document.addEventListener(NiceAbstractPluginEvents.STOP, function(){ context.stop(context) });
        document.addEventListener(NiceAbstractPluginEvents.PAUSE, function(){ context.pause(context) });
        document.addEventListener(NiceAbstractPluginEvents.ERROR, function(){ context.error(context) });  
        document.addEventListener(NiceAbstractPluginEvents.SEEK_INIT, function(){ context.seekInit(context) });  
        document.addEventListener(NiceAbstractPluginEvents.SEEK_END, function(){ context.seekEnd(context) });  
        document.addEventListener(NiceAbstractPluginEvents.AD_START, function(){ context.adStart(context) });  
        document.addEventListener(NiceAbstractPluginEvents.AD_END, function(){ context.adEnd(context) });  

    }catch(e){
        if(youboraData.getDebug())
            console.log(e);
    }
}

NiceAbstractPlugin.prototype.bufferIni = function(context) {
    try{
        if(!context.isBuffering){
            context.isBuffering = true;
            context.bufferInitTime = new Date().getTime();
        }
    }catch(e){
        if(youboraData.getDebug())
            console.log("NiceAbstractPlugin :: Error in bufferIni : " + e);
    }
};

NiceAbstractPlugin.prototype.bufferEnd = function(context) {
    try{
        if(!context.isStartEventSent){
            return;
        }
        if(!context.isSeeking){
            var now = new Date();
            var joinTimeNow = now.getTime();
            var bufferTime = joinTimeNow - context.bufferInitTime;
            if (!context.isJoinEventSent){
                context.isJoinEventSent = true;
                context.communications.sendJoin(context.playProperties.currentTime,bufferTime);
            }else{
                context.communications.sendBuffer(context.playProperties.currentTime,bufferTime );
            }  
        } 
        if(!context.isBuffering){
            if(youboraData.getDebug())
                console.log("NiceAbstractPlugin :: Alert :: Buffer end triggered without bufferInit");
        }
    }catch(e){
        if(youboraData.getDebug())
            console.log("NiceAbstractPlugin :: Error in bufferEnd : " + e);
    }
    context.isBuffering = false;    
};

NiceAbstractPlugin.prototype.play = function(context) {
    try{
        console.log(context);
        if(!context.isStartEventSent && !context.isAdsPlaying ){
            context.communications.sendStart ( context.playProperties.totalBytes , 
                                            window.location.href , 
                                            "" ,  //Deprecated Parameter properties
                                            context.playProperties.live ,  
                                            context.playProperties.resource, 
                                            context.playProperties.duration,
                                            context.youboraData.transaction);
            context.pingTime = context.communications.getPingTime();
            context.setPing(context);
            context.isStartEventSent = true;
        }else if(context.isPauseEventSent){
             context.resume(context);
        }else if(context.isBuffering){
            context.bufferEnd(context);
        }else if(context.isSeeking){
            context.isSeeking = false;
        }
    }catch(e){
        if(youboraData.getDebug())
            console.log("NiceAbstractPlugin :: Error in start : " + e);
    }
};

NiceAbstractPlugin.prototype.stop = function(context) {

    context.communications.sendStop();
    context.reset(context);
};

NiceAbstractPlugin.prototype.pause = function(context) {

    if(context.isStartEventSent && !context.isPauseEventSent){
        context.isPauseEventSent =true;
        context.communications.sendPause();
    }
};

NiceAbstractPlugin.prototype.resume = function(context) {

    if(context.isStartEventSent){
        context.isPauseEventSent =false;
        context.communications.sendResume();
    }
};

NiceAbstractPlugin.prototype.error = function(context) {

    try{
        if(this.balancerProperties.isBalancing){
            var errorCode = "1300" + this.balancerProperties.videoIndex-1;
            var message = "BALANCER CDN PLAY FAILURE";
            if(this.isOriginalVideoLoaded){
                errorCode = "13100";
                message = "BALANCER ORIGINAL FILE ERROR"
            }
            context.communications.sendErrorWithParameters( errorCode, 
                                                        message,
                                                        context.playProperties.totalBytes, 
                                                        window.location.href, 
                                                        "" ,  //Deprecated Parameter properties
                                                        context.playProperties.live ,  
                                                        context.playProperties.resource, 
                                                        context.playProperties.duration,
                                                        context.youboraData.transaction);
        }else{
            context.communications.sendErrorWithParameters( context.playProperties.errorCode.toString(), 
                                                            context.playProperties.errorMsg,
                                                            context.playProperties.totalBytes, 
                                                            window.location.href, 
                                                            "" ,  //Deprecated Parameter properties
                                                            context.playProperties.live ,  
                                                            context.playProperties.resource, 
                                                            context.playProperties.duration,
                                                            context.youboraData.transaction);
        }
    }catch(e){
        console.log(e);
    }
};

NiceAbstractPlugin.prototype.setPing = function (context)
{  
    context.pingTimer = setTimeout(function(){ context.ping(context); }, context.pingTime);
};

NiceAbstractPlugin.prototype.ping = function(context)
{
    //If ads are playing, the pings that will follow will have the latter time of video recorded
    var currentTime = context.playProperties.currentTime;
    if(!context.isAdsPlaying){
        context.timeBeforeAds = currentTime;
    }else{
        currentTime = context.timeBeforeAds ;
    }
    clearTimeout(context.pingTimer);    
    context.communications.sendPingTotalBitrate(context.playProperties.bitrate, currentTime);
    context.setPing(context);
};

NiceAbstractPlugin.prototype.reset = function(context)
{

    context.isStartEventSent = false;
    context.isJoinEventSent =false;
    context.bufferInitTime=0;
    context.isPauseEventSent =false;
    context.pingTime = 5;
    context.pingTimer={};
    
};

NiceAbstractPlugin.prototype.seekInit = function(context) {

   context.isSeeking = true;
};

NiceAbstractPlugin.prototype.seekEnd = function (context)
{  
    context.isSeeking = false;
};

NiceAbstractPlugin.prototype.adStart = function(context) {

   context.isAdsPlaying = true;
   context.isBuffering = false;
   context.isPauseEventSent = false;
};

NiceAbstractPlugin.prototype.adEnd = function (context)
{  
    context.isAdsPlaying = false;
};

NiceAbstractPlugin.prototype.startBalancer = function(resource,callbackBalancer){

    try{
        this.balancerProperties.originalResource=resource;
        this.balancerProperties.originalCDN = youboraData.getCDN();
        this.balancerProperties.balancerCallback = callbackBalancer;
        var resourcePath = this.communications.getResourcePath(resource);
        this.communications.getBalancedResource(resourcePath,this.receiveBalancerObjectCallback,this);
        this.balancerProperties.isBalancing =true;
    }catch(e){
        console.log(e);
    }
}
//Get the object and call the plugin callback with the balancer object
NiceAbstractPlugin.prototype.receiveBalancerObjectCallback = function (balancerObject,context)
{  
    context.balancerProperties.balancerObject = balancerObject;
    context.balancerProperties.balancerCallback(balancerObject);
};
NiceAbstractPlugin.prototype.getNextBalancerResource = function ()
{  
    var resource ="";
    if(this.balancerProperties.balancerObject[this.balancerProperties.videoIndex] == undefined){
        resource = this.balancerProperties.originalResource;
        this.balancerProperties.isOriginalVideoLoaded = true;
    }else{
        resource = this.balancerProperties.balancerObject[this.balancerProperties.videoIndex].URL;
        youboraData.setCDN(this.balancerProperties.balancerObject[this.balancerProperties.videoIndex].CDN_CODE);
    }
    this.balancerProperties.videoIndex ++;
    return resource;
};
NiceAbstractPlugin.prototype.setTotalBytes = function (totalBytes)
{  
    this.playProperties.totalBytes = totalBytes;
}
NiceAbstractPlugin.prototype.setPluginVersion = function (pluginVersion)
{  
    this.playProperties.pluginVersion = pluginVersion;
}
NiceAbstractPlugin.prototype.setTargetDevice = function (targetDevice)
{  
    this.playProperties.targetDevice = targetDevice;
}
NiceAbstractPlugin.prototype.setDuration = function (duration)
{  
    this.playProperties.duration = duration;
}
NiceAbstractPlugin.prototype.setCurrentTime = function (currentTime)
{  
    this.playProperties.currentTime = currentTime;
}
NiceAbstractPlugin.prototype.setResource = function (resource)
{  
    this.playProperties.resource = resource;
}
NiceAbstractPlugin.prototype.setBitrate = function (bitrate)
{  
    this.playProperties.bitrate = bitrate;
}
NiceAbstractPlugin.prototype.setErrorCode = function (errorCode)
{  
    this.playProperties.errorCode = errorCode;
}
NiceAbstractPlugin.prototype.setErrorMsg = function (errorMsg)
{  
    this.playProperties.errorMsg = errorMsg;
}
NiceAbstractPlugin.prototype.setLive = function (live)
{  
    this.playProperties.live = live;
}
NiceAbstractPlugin.prototype.getTotalBytes = function ()
{  
    return this.playProperties.totalBytes;
}
NiceAbstractPlugin.prototype.getPluginVersion = function ()
{  
    return this.playProperties.pluginVersion;
}
NiceAbstractPlugin.prototype.setTargetDevice = function ()
{  
    return this.playProperties.targetDevice;
}
NiceAbstractPlugin.prototype.getDuration = function ()
{  
    return this.playProperties.duration ;
}
NiceAbstractPlugin.prototype.getCurrentTime = function ()
{  
    return this.playProperties.currentTime;
}
NiceAbstractPlugin.prototype.getResource = function ()
{  
    return this.playProperties.resource;
}
NiceAbstractPlugin.prototype.getBitrate = function ()
{  
    return this.playProperties.bitrate ;
}
NiceAbstractPlugin.prototype.getErrorCode = function ()
{  
    return this.playProperties.errorCode;
}
NiceAbstractPlugin.prototype.getErrorMsg = function ()
{  
    return this.playProperties.errorMsg ;
}
NiceAbstractPlugin.prototype.getLive = function ()
{  
    return this.playProperties.live;
}
NiceAbstractPlugin.prototype.getStatus = function() {
    var status={};
    status.playProperties = this.playProperties;
    var pluginStatus = {};
    pluginStatus.isStartEventSent =  this.isStartEventSent;
    pluginStatus.isJoinEventSent =this.isJoinEventSent;
    pluginStatus.bufferInitTime= this.bufferInitTime;
    pluginStatus.isPauseEventSent =this.isPauseEventSent;
    pluginStatus.isSeeking = this.isSeeking;
    pluginStatus.isBuffering = this.isBuffering ;
    pluginStatus.isAdsPlaying = this.isAdsPlaying;
    pluginStatus.pingTime = this.pingTime;
    pluginStatus.timeBeforeAds= this.timeBeforeAds;
    status.pluginStatus = pluginStatus;
    return status;
}

