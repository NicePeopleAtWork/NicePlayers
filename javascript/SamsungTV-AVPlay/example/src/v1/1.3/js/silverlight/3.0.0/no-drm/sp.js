/**
 * Created for NicePeopleAtWork (c) 2013
 * Author: Adrià Gil Coronado
 * Date: 15/10/2013
 *
 * Nice264 Analytics Plugin for Silverlight
 * Uses Silverlight2Media JavaScript Library v0.1.0 developed by Tim Acheson
 * http://www.timacheson.com/
 */
//////////////////////
// Silverlight Bridge   
//////////////////////
var silverlight2Media = new Silverlight2Media();
var SmartPlugin={
    player : null,
    nice264Plugin:null,
    Init: function(){
        this.findVideo();
       
    },
    findVideo : function(){
        try{
            var allItems = document.getElementsByTagName('object');
            var found = false;
            var i=0;
            var element;
            while(i<allItems.length && !found){
                element = allItems[i];
                if(element.type != undefined){
                    if( element.type.indexOf("application/x-silverlight-2") != -1){
                        found =true;
                        this.player = element;
                    }
                }
                i++;
            }
        }catch(err){
            console.log(err);
        }       
        if(this.player == null){
             setTimeout(this.findVideo,200);
           
        }else{
            SmartPlugin.nice264Plugin = new Nice264Analytics(this.player.id);
            var silverlightMediaElementName = youboraData.getSilverlightMediaElementName(); // x:Name of MediaElement in Silverlight application (usually defined in the XAML).
            silverlight2Media.bindToSilverlight(this.player.id, silverlightMediaElementName);
        }
    }
}
var sinPause = false;

function Silverlight2Media()
{

    
    // Internal reference to Silverlight2Media namespace.
    var _this = this;
    // Configuration parameters to be set by the web developer.

    // ID of HTML "object" element embedding the Silverlight application (user-defined).
    this.HTMLObjectTagID = null;
    // Name of MediaElement defined within Silverlight application (user-defined).
    this.SilverlightMediaElementName = null;

    // Internal variables.

    // Instance of MediaElement within Silverlight application.
    this.mediaElement = null;

    // Identifiers for timers.
    this.mediaElementTimeoutID = null;
    this.progressIntervalID = null;
    this.fastSeekIntervalID = null;

    this.mediaBuffering = function(sender, args) {
        //console.log('mediaBuffering > ' + parseInt(_this.mediaElement.BufferingProgress * 100) + '%');
        SmartPlugin.nice264Plugin.buffer(Nice264AnalyticsEvents.BUFFER_BEGIN);
    };

    this.mediaCurrentStateChanged = function(sender, args) {
        
        //var media = sender.findName('media'); // TODO: previous > mediaElement1
        var media = sender.findName(silverlight2Media.SilverlightMediaElementName); // TODO: previous > mediaElement1
        SmartPlugin.nice264Plugin.mediaElement=media;
        var status = '' + media.CurrentState + '';      
        SmartPlugin.nice264Plugin.assetUrl = media.Source;
        switch (status)
        {
            case 'Opening':
                SmartPlugin.nice264Plugin.join(Nice264AnalyticsEvents.BUFFER_BEGIN);
                break;
            case 'Closed':
                SmartPlugin.nice264Plugin.stop();
                break;
            case 'Buffering':
                SmartPlugin.nice264Plugin.buffer(Nice264AnalyticsEvents.BUFFER_BEGIN);
                break;
            case 'Playing':
                if (sinPause == false)
                {
                                    
                    SmartPlugin.nice264Plugin.start();
                    sinPause = true;
                    
                    SmartPlugin.nice264Plugin.join(Nice264AnalyticsEvents.JOIN_SEND);

                }else{
                    sinPause = true;                    
                    SmartPlugin.nice264Plugin.resume();
                }
                break;
            case 'Stopped':
                SmartPlugin.nice264Plugin.stop();
                break;
            case 'Paused':
                SmartPlugin.nice264Plugin.join(Nice264AnalyticsEvents.BUFFER_END);
                SmartPlugin.nice264Plugin.pause();
                break;
            case 'Resume':
                SmartPlugin.nice264Plugin.buffer(Nice264AnalyticsEvents.BUFFER_END);
                SmartPlugin.nice264Plugin.resume();
                break;
            default:
                break;
        }
    };

    this.mediaEnded = function(sender, eventArgs) {
        //console.log('mediaEnded');
        SmartPlugin.nice264Plugin.stop();
    };

    this.mediaFailed = function(sender, eventArgs) {
        SmartPlugin.nice264Plugin.error();
    };

    this.rateChanged = function(sender, eventArgs) {

    };

    // Acquires the MediaElement from within the Silverlight application, and assign it to a JavaScript variable.
    this.setMediaElement = function() {
        

        // Note: the MediaElement within a Silverlight app isn't necessarily available when the web page has loaded.
        // The Silverlight application's MediaElement is available after a few milliseconds, when the has initialised.

        //console.log('Trying to get MediaElement from Silverlight... (_this.mediaElement=' + _this.mediaElement + ')');
        
        // Stop MediaElement being obtained more than once.
        // Note: Be careful to ensure events are bound as well as MediaElement obtained.
        if (_this.mediaElement == null) {
        
            var embeddedSilverlightControl = document.getElementById(_this.HTMLObjectTagID);
            if (embeddedSilverlightControl) {
                if (embeddedSilverlightControl.content) {
                
                    try {
                        _this.mediaElement = embeddedSilverlightControl.content.findName(_this.SilverlightMediaElementName);
                    }
                    catch(e) {
                        console.log('Failed to find the MediaElement: ' + e.message);
                    }
                    
                }
            }
        }
        
        if (_this.mediaElement != null) {
            //console.log('MediaElement obtained from Silverlight. (_this.mediaElement=' + _this.mediaElement + ')');
        }
        
        if (_this.mediaElement != null) {
            // If MediaElement has been acquired, bind events.
            try {

                // EVENTS
                // BufferingStarted - BufferingEnded
                // MediaFailed
                
                SmartPlugin.nice264Plugin.mediaElement = _this.mediaElement;
                SmartPlugin.nice264Plugin.init();
                _this.mediaElement.AddEventListener('BufferingProgressChanged', _this.mediaBuffering);
                _this.mediaElement.AddEventListener('CurrentStateChanged', _this.mediaCurrentStateChanged);
                _this.mediaElement.AddEventListener('MediaFailed', _this.mediaFailed);
                _this.mediaElement.AddEventListener('RateChanged', _this.rateChanged);
                _this.mediaElement.AddEventListener('MediaEnded', _this.mediaEnded);
              
                //console.log('MediaElement event listeners bound to JavaScript functions.');
            }
            catch(e) {
                //console.log('Failed to bind events to MediaElement: ' + e.message);
            }
        }
        
        if (_this.mediaElement == null) {
            if (_this.mediaElementTimeoutID != null) {
                clearTimeout(_this.mediaElementTimeoutID);
                _this.mediaElementTimeoutID = null;
            }
            _this.mediaElementTimeoutID = setTimeout(_this.setMediaElement, 500);
        }
        
    };

    // Main function, to be called by the implementor to initialise and configure Silverlight2Media. 
    this.bindToSilverlight = function(HTMLObjectTagID, SilverlightMediaElementName) {
        _this.HTMLObjectTagID = HTMLObjectTagID;
        _this.SilverlightMediaElementName = SilverlightMediaElementName;
        _this.setMediaElement();
    };

}



//////////////////
// Nice264 Plugin
//////////////////
var Nice264AnalyticsEvents = {
    BUFFER_BEGIN: 1,
    BUFFER_END: 0,
    JOIN_SEND: 2
};

function Nice264Analytics()
{

    this.mediaElement;
    /**
     * Attributes.
     */
   // this.playerId = playerId;
    this.system = youboraData.getAccountCode();
    this.service = youboraData.getService();
    //this.bandwidth = bandwidth;
    this.playInfo = youboraData;
    // player reference
  //  this.player = null;

    this.assetUrl;
    this.duration;

    // configuration
    this.pluginVersion = "1.3.3.0.0";
    this.targetDevice = "Silverlight_JavaScript";
    this.outputFormat = "xml";
    this.xmlHttp = null;
    this.isXMLReceived = false;

    // events queue
    this.resourcesQueue = [];
    this.eventsQueue = [];
    this.eventsTimer = null;

    // events
    this.isStartEventSent = false;
    this.isJoinEventSent = false;
    this.isStopEventSent = false;
    this.isBufferRunning = false;
    this.isPauseEventSent = false;

    // properties
    this.assetMetadata = youboraData.getProperties();
    this.isLive = youboraData.getLive();
    this.bufferTimeBegin = 0;

    // urls
    this.pamBufferUnderrunUrl = "";
    this.pamJoinTimeUrl = "";
    this.pamStartUrl = "";
    this.pamStopUrl = "";
    this.pamPauseUrl = "";
    this.pamResumeUrl = "";
    this.pamPingUrl = "";
    this.pamErrorUrl = "";

    // code
    this.pamCode = "";
    this.pamCodeOrig = "";
    this.pamCodeCounter = 0;

    // ping
    this.pamPingTime = 0;
    this.pingTimer = null;
    this.joinTimeBegin;
    this.joinTimeEnd;

    /**
     * Initialization.
     */
    //this.init();
    
    sinPause = false;

    this.communications =  new YouboraCommunication(this.system, this.service , youboraData ,  this.pluginVersion , this.targetDevice);
    this.pamPingTime = this.communications.getPingTime();
    
    //autoplay start to play
    //this.start();
};

/**
 * Plugin Setup.
 */
Nice264Analytics.prototype.init = function()
{
    //to obtain the this.player.data plugin
    var context = this;
    //this.player = document.getElementById(this.playerId);
    //this.assetUrl = this.mediaElement.Source;
    var assetUrl =this.mediaElement.Source;
    this.duration = this.mediaElement.NaturalDuration.seconds;
    console.log(this.mediaElement.RenderSize);
    var status = '' + this.mediaElement.CurrentState + ''; 
    if(status=='Playing'){
        SmartPlugin.nice264Plugin.start();
        sinPause = true;     
        //There has been no Join Time we could have measured, the value
        //will be the minimum one
        SmartPlugin.nice264Plugin.join(Nice264AnalyticsEvents.JOIN_SEND);
    }
    
};

/**
 * Plugin Methods.
 */


Nice264Analytics.prototype.updateCode = function()
{
    this.pamCodeCounter++;
    this.pamCode = this.pamCodeOrig + "_" + this.pamCodeCounter;
};

Nice264Analytics.prototype.reset = function()
{
    this.isStartEventSent = false;
    this.isJoinEventSent = false;
    this.isBufferRunning = false;
    this.isPauseEventSent = false;
    this.bufferTimeBegin = 0;

    clearTimeout(this.pingTimer);
    this.pingTimer = null;

    this.updateCode();
};

/**
 * Plugin Methods. Getters and Setters.
 */
Nice264Analytics.prototype.setUsername = function(username)
{
    this.playInfo.username = username;
};

Nice264Analytics.prototype.setTransactionCode = function(trans)
{
    this.playInfo.transaction = trans;
};

Nice264Analytics.prototype.setMetadata = function(metadata)
{
    this.assetMetadata = metadata;
};

Nice264Analytics.prototype.getMetadata = function()
{   
    var jsonObj = JSON.stringify(this.assetMetadata);
    var metadata = encodeURIComponent(jsonObj);
    return metadata;
};

Nice264Analytics.prototype.setVideoURL = function(url)
{
    this.assetUrl = url;
};

Nice264Analytics.prototype.getVideoURL = function()
{
    return this.assetUrl;
};

Nice264Analytics.prototype.setLive = function(value)
{
    this.isLive = value;
};

Nice264Analytics.prototype.getBitrate = function()
{
   //Bitrate is never informed
   return -1;

};

Nice264Analytics.prototype.setPing = function()
{
    var context = this;

    this.pingTimer = setTimeout(function(){ context.ping(); }, this.pamPingTime);
};

/**
 * Plugin Events. Analytics.
 */
Nice264Analytics.prototype.start = function()
{
    this.communications.sendStart("0",window.location.href, this.getMetadata(),this.isLive,this.getVideoURL(),this.duration ,youboraData.getTransaction());
    this.setPing();
};

Nice264Analytics.prototype.ping = function()
{
    //"0" is currentTime
    this.communications.sendPingTotalBitrate(this.getBitrate(),this.mediaElement.Position.seconds);
    this.setPing();

};

Nice264Analytics.prototype.join = function(bufferState)
{
    var d = new Date();
    var joinTimeTotal = 0;
    var params = null;

    

    if (bufferState == Nice264AnalyticsEvents.BUFFER_BEGIN)
    {
        this.joinTimeBegin = d.getTime();
    }
    else if (bufferState == Nice264AnalyticsEvents.BUFFER_END)
    {
        this.joinTimeEnd = d.getTime();

    } else if (bufferState == Nice264AnalyticsEvents.JOIN_SEND)
    {
        joinTimeTotal = this.joinTimeEnd - this.joinTimeBegin;
        if (joinTimeTotal <= 0 || isNaN(joinTimeTotal))
        {
            //Minimum valid value for a joinTime
            joinTimeTotal = 10;
        }

       
        this.communications.sendJoin(joinTimeTotal,joinTimeTotal);
    }
};


Nice264Analytics.prototype.buffer = function(bufferState)
{
    var d = new Date();
    var bufferTimeEnd = 0;
    var bufferTimeTotal = 0;
    var params = null;

    if (bufferState == Nice264AnalyticsEvents.BUFFER_BEGIN)
    {
        this.bufferTimeBegin = d.getTime();
    }
    else if (bufferState == Nice264AnalyticsEvents.BUFFER_END)
    {
        bufferTimeEnd = d.getTime();
        bufferTimeTotal = bufferTimeEnd - this.bufferTimeBegin;

        if (!this.isJoinEventSent)
        {
            this.isJoinEventSent = true;


            this.communications.sendJoin(bufferTimeTotal,bufferTimeTotal);

        }
        else
        {
            var currentTime = this.mediaElement.Position.seconds;
            if(currentTime==undefined || currentTime < 10){
                currentTime=10;
            }
            this.communications.sendBuffer( currentTime,bufferTimeTotal);
        }
    }
};

Nice264Analytics.prototype.resume = function()
{

    this.communications.sendResume();

};

Nice264Analytics.prototype.pause = function()
{

    this.communications.sendPause();
};

Nice264Analytics.prototype.stop = function()
{
    
    this.communications.sendStop();
    clearTimeout(this.pingTimer);
    this.pingTimer = null;

    this.reset();
};

Nice264Analytics.prototype.error = function()
{
    
    this.communications.sendErrorWithParameters("","","0",window.location.href,this.getMetadata(),this.isLive,this.getVideoURL(),this.mediaElement.NaturalDuration.seconds,youboraData.transcode);

    clearTimeout(this.pingTimer);
    this.pingTimer = null;
};

// TODO: delete redundant timers at class definition
// TODO: delete redundant functions
// TODO: add Nice264Analytics Plugin
// TODO: delete plugin attributes (variables) if not used
// TODO: delete all console.log
// TODO: plugin bitrate
// TODO: plugin error handling
// TODO: autoplay + refresh page issue (no events displayed)
