var jsReady = false;
window.pluginReady = function(x){
    SmartPlugin.kdp = document.getElementById(x);
    SmartPlugin.init();
    return jsReady;
}

if((typeof kWidget === "undefined" )==false){
    kWidget.addReadyCallback(function(playerId){
        console.log("kaltura.js player ready!")
        SmartPlugin.kdp = document.getElementById(playerId);
        SmartPlugin.init();
    });    
}

window.SmartPlugin = 
{
    /*debug: youboraData.getDebug(),
    isLive: youboraData.getLive(),*/
    debug: false,
    isLive: false,
    targetDevice: "PC-Kaltura",
    pluginVersion: "1.3.2.2.0",
    pluginName: "KALTURA",  
    initDone: 0,
    pingTimer: undefined,
    apiClass: undefined,
    currentTime: 0,
    duration: 0,    
    isStreamError: false,
    isBuffering: false,
    isStartSent: false,
    isJoinSent: false,
    isPaused: false,
    previousElapsedTime: 0,
    bufferTimeBegin: 0,
    joinTimeBegin: 0,
    joinTimeEnd: 0,
    originalCDN:"",
    seeking :false,
    playTime: 0,
    kdp: undefined,
    bitrate:0,
    isError: false,
    lastTimeSeek: 0,
    iframeWindow: undefined,
    html5fixPresent: false,
    vGreaterThan2 : false,
    totalBytesKDP : 0, //use it on KDP
    totalBytesHTML5 : 0, //use it on KDP
    urlResource: undefined,
    /*bandwidth: { username: youboraData.getUsername(), interval: 5000 },*/
    bandwidth: {},
    init: function () {

        if(typeof youboraData === 'undefined'){
            setTimeout(SmartPlugin.init,100);
        }else{

            SmartPlugin.debug = youboraData.getDebug();
            SmartPlugin.isLive = youboraData.getLive();
            SmartPlugin.bandwidth = { username: youboraData.getUsername(), interval: 5000 };

            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Init "); }       
            if(typeof mw === "undefined"){
                SmartPlugin.vGreaterThan2 = false;
            }else{
                SmartPlugin.vGreaterThan2 = mw.versionIsAtLeast("2");    
            }

            /* Bind a message event listener to a function */
            window.addEventListener("message", SmartPlugin.receiveMessage, false);
            /* Probe the existence of the html5fix component */
            if(SmartPlugin.kdp.children[0].tagName == 'IFRAME'){
                SmartPlugin.iframeWindow = SmartPlugin.kdp.children[0].contentWindow
                SmartPlugin.iframeWindow.postMessage('probe','*')
                //console.log("-------- Sent Probe! --------");
            }  
        
            SmartPlugin.initDone = true;
            SmartPlugin.startPlugin();        
        }
    },  
    receiveMessage: function(message){
        if(message.data=='ack'){
            //console.log("----------- received ack! ----------");
            if (SmartPlugin.debug) { console.log('html5fix confirmed!')   }
            SmartPlugin.html5fixPresent=true
        }
        
        if(message.data.type && message.data.time){
            if(message.data.type=='buffer_start'){
                SmartPlugin.kalturaHtml5BufferStart(message.data.time)
            }else if(message.data.type=='buffer_end'){
                SmartPlugin.kalturaHtml5BufferEnd(message.data.time)
            }else if(message.data.type=='seek_start'){
                SmartPlugin.kalturaSeekStart();
            }
        }

        if(message.data.type && message.data.type=='resource'){
            SmartPlugin.urlResource = message.data.url;
        }        

        if(message.data.type && message.data.type=='totalBytes'){
            SmartPlugin.totalBytesHTML5 = message.data.bytes
            /*console.log("HTML5 totalBytes = "+SmartPlugin.totalBytesHTML5)*/
        }
        if(message.data.type && message.data.type=='log'){
            console.log(message.data.log)
            /*console.log("HTML5 totalBytes = "+SmartPlugin.totalBytesHTML5)*/
        }
        
    },
    startPlugin: function () {
        try {
            try {
                if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: startPlugin start"); }
                SmartPlugin.apiClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, SmartPlugin.pluginVersion, SmartPlugin.targetDevice);
                SmartPlugin.bindEvents();
                try {
                    window.onunload = function () { SmartPlugin.unloadPlugin(); };
                } catch (error) {
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: startPlugin :: Unable to bind unload event!");console.log(error); }
                }
            } catch (error) {
                if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: startPlugin :: No <video> found!");console.log(error); }
                spLoaded = false;
            }
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: startPlugin :: Error: " + error); }
            spLoaded = false;
        }
    },   
    bindEvents: function () {
        try {


        console.log("bind events!")
        SmartPlugin.kdp.addJsListener("playerPlayed", "SmartPlugin.kalturaPlay")
        SmartPlugin.kdp.addJsListener("playerUpdatePlayhead", "SmartPlugin.kalturaUpdatePlayHead")
        SmartPlugin.kdp.addJsListener("playerStateChange", "SmartPlugin.kalturaPlayerStateChanged")            
        SmartPlugin.kdp.addJsListener("changeMedia", "SmartPlugin.kalturaChangeMedia")   
        SmartPlugin.kdp.addJsListener('SourceChange',"SmartPlugin.kalturaChangeMedia")         
        SmartPlugin.kdp.addJsListener("durationChange", "SmartPlugin.kalturaDurationChange")            
        SmartPlugin.kdp.addJsListener("metadataReceived", "SmartPlugin.kalturaMetadataReceived")
        
        SmartPlugin.kdp.addJsListener("playerPlayEnd", "SmartPlugin.kalturaPlayerEnd")
        SmartPlugin.kdp.addJsListener("mediaError", "SmartPlugin.kalturaMediaError")
        SmartPlugin.kdp.addJsListener("mediaLoadError", "SmartPlugin.kalturaLoadMediaError")
        SmartPlugin.kdp.addJsListener("entryFailed", "SmartPlugin.kalturaEntryFailed")
        SmartPlugin.kdp.addJsListener("embedPlayerError", "SmartPlugin.kalturaEmbedPlayerError")    
        SmartPlugin.kdp.addJsListener("embedUpdatePlayhead", "SmartPlugin.kalturaUpdatePlayHead")        
            
        SmartPlugin.kdp.addJsListener("playerSeekStart", "SmartPlugin.kalturaSeekStart")
        SmartPlugin.kdp.addJsListener("bytesDownloadedChange","SmartPlugin.kalturaTotalBytes")

        /*SmartPlugin.kdp.addJsListener("switchingChangeStarted","SmartPlugin.kalturaChangeStart")*/
        SmartPlugin.kdp.addJsListener("switchingChangeComplete","SmartPlugin.kalturaChangeEnd")


        /* Only bind this if v > 2.0 */
        if(SmartPlugin.vGreaterThan2==true){
            SmartPlugin.kdp.addJsListener("bufferStartEvent","SmartPlugin.kalturaBufferStart")
            SmartPlugin.kdp.addJsListener("bufferEndEvent","SmartPlugin.kalturaBufferEnd")            
        }
            

        if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: bindEvents :: success"); }
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: bindEvents :: Error: " + error); }
        }
    },  
    kalturaTotalBytes: function(x){
        /*console.log("KDP total bytes: "+x.newValue)*/
        SmartPlugin.totalBytesKDP = x.newValue;
    },
    kalturaChangeMedia: function(x){
    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: change Media :: "); }
        SmartPlugin.getMediaInfo();
        if(SmartPlugin.currentTime > 0){
            SmartPlugin.apiClass.sendStop()    
            SmartPlugin.reset()       
            if(typeof x === 'undefined'){
                SmartPlugin.apiClass.sendStart ( 0 , window.location.href , youboraData.getProperties , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration, youboraData.getTransaction());
                SmartPlugin.isStartSent = true;
                SmartPlugin.playTime = new Date().getTime()
                SmartPlugin.setPing()
                /*SmartPlugin.apiClass.enableResume()
                SmartPlugin.apiClass.enableConcurrency()    */
                SmartPlugin.html5fixPresent=true    /* this will only be called by html5 */                 
            }
        }
        
    },
    /*
    kalturaChangeStart: function(x){

    },*/
    kalturaChangeEnd: function(x){
        if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: kalturaChangeEnd ::  "); }        
        SmartPlugin.bitrate = x.newBitrate * 1000;
        console.log("******* bitrate = "+SmartPlugin.bitrate+" *****")
    },
    kalturaHtml5BufferStart: function(time){
        if(SmartPlugin.vGreaterThan2==false){//double check
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: kalturaHtml5BufferStart :: Start buffering "); }
            SmartPlugin.bufferTimeBegin=time
            SmartPlugin.isBuffering=true;            
        }

    },
    kalturaHtml5BufferEnd: function(time){
        if(SmartPlugin.vGreaterThan2==false){//double check
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: kalturaHtml5BufferEnd :: End buffering "); }
            SmartPlugin.isBuffering=false;
            bufferTime = time - SmartPlugin.bufferTimeBegin;
            diffBufferSeek = SmartPlugin.bufferTimeBegin - SmartPlugin.lastTimeSeek
            if(SmartPlugin.isStartSent && SmartPlugin.isJoinSent) {
                if(diffBufferSeek > 2000){
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: kalturaHtml5BufferEnd :: End buffering :: time = "+(bufferTime)+" ms "); }                    
                    SmartPlugin.apiClass.sendBuffer(SmartPlugin.currentTime, bufferTime);
                }else{
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: kalturaHtml5BufferEnd :: End buffering :: time = "+(bufferTime)+" ms but not reporting"); }                        
                }
            }        
        }
    },    
    kalturaBufferStart: function(){
        if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: kalturaBufferStart :: Start buffering "); }
        SmartPlugin.bufferTimeBegin=new Date().getTime()
        SmartPlugin.isBuffering=true;
    },
    kalturaBufferEnd: function(){
        SmartPlugin.isBuffering=false;

        bufferTime = new Date().getTime() - SmartPlugin.bufferTimeBegin
        diffBufferSeek = SmartPlugin.bufferTimeBegin - SmartPlugin.lastTimeSeek
        if(SmartPlugin.isStartSent && SmartPlugin.isJoinSent) {
            if(diffBufferSeek > 2000){
                if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: kalturaBufferEnd :: End buffering :: time = "+(bufferTime)+" ms "); }                    
                SmartPlugin.apiClass.sendBuffer(SmartPlugin.currentTime, bufferTime);
            }else{
                if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: End buffering :: time = "+(bufferTime)+" ms but not reporting"); }                        
            }
        }
    },    
    kalturaSeekStart: function(){
        if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: kalturaSeekStart :: seek detected"); }        
        SmartPlugin.lastTimeSeek = new Date().getTime()
    },
/*    kalturaSeekEnd: function(){
        console.log("seek end")
    },*/
    kalturaLoadMediaError: function(){
        code = 3001
        SmartPlugin.sendError(code)        
    },
    kalturaEntryFailed: function(){
        code = 3001
        SmartPlugin.sendError(code)
    },
    kalturaEmbedPlayerError: function(){
        /* only called when player is HTML5, no error code available, so 3001*/
        //console.log("kaltura embedPlayerError")
        code = 3001
        SmartPlugin.sendError(code)
    },
    sendError: function(code){
        if(SmartPlugin.isError==false){
            SmartPlugin.apiClass.sendErrorWithParameters(code, "PLAY_FAILURE", 0, window.location.href,  youboraData.getProperties, youboraData.getLive(), SmartPlugin.urlResource, SmartPlugin.duration, youboraData.getTransaction())        
            SmartPlugin.reset()
            SmartPlugin.isError=true;
        }
    },
    kalturaMediaError: function(error){
        /* only called when player is Flash, error code available, so try to get it!*/ 
        try{       
            code = parseInt(error.errorEvent.error.detail.split("Error #")[1])
        }catch(err){
            code = 3001
        }
        SmartPlugin.sendError(code)
    },
    kalturaPlayerEnd: function(){
        /*console.log("player end!");*/
        SmartPlugin.apiClass.sendStop()
        SmartPlugin.reset()
    },
    kalturaMetadataReceived: function(metadata){
        /*console.log("metadata received: "+metadata);*/
    },
    getMediaInfo: function(){
        media =  SmartPlugin.kdp.evaluate('{mediaProxy.entry}')
        /*console.log("getMediaInfo ")
        console.log(media);*/
        metadata = SmartPlugin.kdp.evaluate('{mediaProxy.entryMetadata}')
        /*console.log("getMediaInfo metadata: ")
        console.log(metadata);*/
        bitrate = SmartPlugin.kdp.evaluate('{mediaProxy.preferedFlavorBR}')
        /*console.log("getMediaInfo bitrate: "+bitrate)*/
        if(SmartPlugin.bitrate==0){ //Only get flavour bitrate if it is not already informed
            SmartPlugin.bitrate =  bitrate * 1000;
        }
        
        resource = SmartPlugin.kdp.evaluate('{mediaProxy.resource}');
        if(resource!=null){
            SmartPlugin.urlResource = resource.url;
        }
        if(media!=null){
            SmartPlugin.duration = media.duration;
            SmartPlugin.title = media.name;
            SmartPlugin.contentId = media.id;
        }

        SmartPlugin.isLive = SmartPlugin.kdp.evaluate('{mediaProxy.isLive}')


        youboraData.live = SmartPlugin.isLive;
        if(youboraData.getProperties().content_metadata.title=="" || youboraData.getProperties().content_metadata.title==null){
            youboraData.properties.content_metadata.title = SmartPlugin.title;
        }

        if(youboraData.contentId=="" || youboraData.contentId==null){
            youboraData.contentId=SmartPlugin.contentId;
        }


        return media
    },
    kalturaPlay: function() {

        if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: kalturaPlay "); }
        SmartPlugin.getMediaInfo()        
        /*if(SmartPlugin.playTime==0 && SmartPlugin.currentTime==0){*/
        if(SmartPlugin.playTime>=0 && SmartPlugin.isStartSent==false && SmartPlugin.html5fixPresent==false){
            if(SmartPlugin.urlResource==undefined){
                setTimeout(SmartPlugin.kalturaPlay, 100)
            }else{
            //send start
                SmartPlugin.apiClass.sendStart ( 0 , window.location.href , youboraData.getProperties() , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration, youboraData.getTransaction());
                SmartPlugin.isStartSent = true;
                SmartPlugin.playTime = new Date().getTime()
                SmartPlugin.setPing()
            }
            /*SmartPlugin.apiClass.enableResume()
            SmartPlugin.apiClass.enableConcurrency()*/
            //Start ping timer
        }else if(SmartPlugin.isStartSent==false && SmartPlugin.urlResource!=undefined && SmartPlugin.html5fixPresent==true){
            SmartPlugin.apiClass.sendStart ( 0 , window.location.href , youboraData.getProperties() , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration, youboraData.getTransaction());
            SmartPlugin.isStartSent = true;
            SmartPlugin.playTime = new Date().getTime()
            SmartPlugin.setPing()
            
            /*SmartPlugin.apiClass.enableResume()
            SmartPlugin.apiClass.enableConcurrency()*/
        }else if(SmartPlugin.isStartSent==false && SmartPlugin.urlResource==undefined && SmartPlugin.html5fixPresent==true){
            setTimeout(SmartPlugin.kalturaPlay,100)
        }


    }, 
    kalturaPlayerStateChanged: function(playerState) {
        /*console.log("player state change "+playerState)*/
        if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: kalturaPlayerStateChanged :"+playerState); }
        if(playerState=="buffering"){
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: kalturaPlayerStateChanged :: Start buffering "); }
            SmartPlugin.bufferTimeBegin=new Date().getTime()
            SmartPlugin.isBuffering=true;
        }
        if(playerState=="playing" && SmartPlugin.isBuffering==true){
            SmartPlugin.isBuffering=false;
            bufferTime = new Date().getTime() - SmartPlugin.bufferTimeBegin
            diffBufferSeek = SmartPlugin.bufferTimeBegin - SmartPlugin.lastTimeSeek
            if(SmartPlugin.isStartSent && SmartPlugin.isJoinSent) {
                if(diffBufferSeek > 2000){
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: kalturaPlayerStateChanged :: End buffering :: time = "+(bufferTime)+" ms "); }                    
                    SmartPlugin.apiClass.sendBuffer(SmartPlugin.currentTime, bufferTime);
                }else{
                    if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: End buffering :: time = "+(bufferTime)+" ms but not reporting"); }        
                }
            }
            
        }   

        if(playerState=="playing" && SmartPlugin.isPaused==true){
            //RESUME
            SmartPlugin.apiClass.sendResume();
            SmartPlugin.isPaused=false
        }   

        if(playerState=="paused"){
            //PAUSE
            SmartPlugin.apiClass.sendPause();
            SmartPlugin.isPaused=true
        }

        if(playerState=="playbackError"){
            /*console.log("kaltura playbackError state changed!!");*/
            code = 3001
            SmartPlugin.sendError(code)            
        }

        /*if(playerState=="ready"){
            SmartPlugin.getMediaInfo()        
            if(SmartPlugin.playTime==0 && SmartPlugin.currentTime==0 && SmartPlugin.html5fixPresent==false){
                //send start
                SmartPlugin.apiClass.sendStart ( 0 , window.location.href , youboraData.getProperties , youboraData.getLive() , SmartPlugin.urlResource , SmartPlugin.duration, youboraData.getTransaction());
                SmartPlugin.isStartSent = true;
                SmartPlugin.playTime = new Date().getTime()
                SmartPlugin.setPing()
                SmartPlugin.apiClass.enableResume()
                SmartPlugin.apiClass.enableConcurrency()
                //Start ping timer
            }            
        }*/
    },  
    kalturaUpdatePlayHead: function(data,id){
        //The first call to this function mean that the video has started playing.
        if(SmartPlugin.currentTime>0 && SmartPlugin.isJoinSent==false && SmartPlugin.isStartSent){
            //send join time
            now = new Date().getTime()
            joinTimeTotal = now - SmartPlugin.playTime;
            SmartPlugin.apiClass.sendJoin(data, joinTimeTotal);         
            SmartPlugin.isJoinSent=true;
            if(SmartPlugin.html5fixPresent==true){
                SmartPlugin.iframeWindow.postMessage('canbuffer','*')
            }
        }
        SmartPlugin.currentTime = data

    },  
    setPing: function () {
        try {
            SmartPlugin.pingTimer = setTimeout(function () { SmartPlugin.ping(); }, SmartPlugin.apiClass.getPingTime());
        } catch (error) {
            if(SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setPing :: Error: " + error); }
        }
    },
    ping: function () {
        try {
            clearTimeout(SmartPlugin.pingTimer);
            SmartPlugin.pingTimer = null;
            SmartPlugin.setPing();
            if (SmartPlugin.isStartSent) {
                
                if(SmartPlugin.html5fixPresent==false){
                    SmartPlugin.apiClass.sendPingTotalBitrate(SmartPlugin.bitrate, SmartPlugin.currentTime);
                    /*SmartPlugin.apiClass.sendPingTotalBytes(SmartPlugin.totalBytesKDP, SmartPlugin.currentTime)*/
                }else if(SmartPlugin.html5fixPresent==true){
                    SmartPlugin.apiClass.sendPingTotalBytes(SmartPlugin.totalBytesHTML5, SmartPlugin.currentTime)
                }
                
                /*SmartPlugin.apiClass.sendPingTotalBytes(SmartPlugin.totalBytes, SmartPlugin.currentTime)*/
                
            }
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: PÃ®ng :: Error: " + error); }
        }
    },    
    unloadPlugin: function () {
        try {
            /*
            SmartPlugin.checkBuffering();
            */
            SmartPlugin.reset();
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: unloadPlugin :: Error: " + error); }
        }
    },  
    reset: function () {
        try {
            clearTimeout(SmartPlugin.pingTimer);

            SmartPlugin.isLive= youboraData.getLive(),
            SmartPlugin.initDone= 0;
            SmartPlugin.pingTimer= undefined;
            SmartPlugin.currentTime= 0;
            SmartPlugin.duration= 0;    
            SmartPlugin.isStreamError= false;
            SmartPlugin.isBuffering= false;
            SmartPlugin.isStartSent= false;
            SmartPlugin.isJoinSent= false;
            SmartPlugin.isPaused= false;
            SmartPlugin.previousElapsedTime= 0;
            SmartPlugin.bufferTimeBegin= 0;
            SmartPlugin.joinTimeBegin= 0;
            SmartPlugin.joinTimeEnd= 0;
            SmartPlugin.originalCDN="";
            SmartPlugin.seeking =false;
            SmartPlugin.playTime= 0;
            SmartPlugin.bitrate=0;
            SmartPlugin.totalBytesHTML5=0;
            SmartPlugin.totalBytesKDP=0;
            SmartPlugin.isError= false;            
            SmartPlugin.lastTimeSeek = 0;
            SmartPlugin.iframeWindow= undefined,
            SmartPlugin.html5fixPresent= false,
            SmartPlugin.vGreaterThan2 = false,           
            SmartPlugin.apiClass.disableResume()
            SmartPlugin.apiClass.disableConcurrency()
            SmartPlugin.apiClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, SmartPlugin.pluginVersion, SmartPlugin.targetDevice);
        } catch (error) {
            if (SmartPlugin.debug) { console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: reset :: Error: " + error); }
        }
    } 
}
