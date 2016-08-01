 /*
 * Nice264 Silverlight Plugins package
 * Copyright (c) 2013 NicePeopleAtWork
 * Author: Luis Miguel Lainez
 * Version: 3.0.0
 */

 var Player;
 function onPlayerReady(player) {
    SmartPlugin.setPlayer(player);
    Player = player;
       
}

 var SmartPlugin ={
    //The official documentation (http://msdn.microsoft.com/en-us/library/windows/desktop/dd564085(v=vs.85).aspx)
    //does not really match the events below. We demonstrated empirically that they are 
    //different
    PLAYER_STATE :{
        UNDEFINED :0,
        STOPPED :1,
        BUFFERING:2,
        PLAYING:3,
        PAUSED:4
    },
    AnalyticsEvents :{
        BUFFER_END :0,
        BUFFER_START :1,
        JOIN_SEND :2
        
    },
    system:"",
    service:"",
    username:"",
    metadata:"",
    duration:"",
    pamPingTime:"",
    player : null,
    pluginVersion: "1.3.3.0.0",
    targetDevice: "Silverlight",
    communications :{},
    isJoinEventSent:false,
    isStartEventSent:false,
    isBufferRunning:false,
    joinTimeBegin:0,
    joinTimeEnd:0,
    bufferTimeBegin:0,
    isBufferRunning: false,
    videoUrl:"",

    start:function(){
        SmartPlugin.communications.sendStart("0",window.location.href,SmartPlugin.getMetadata(),youboraData.getLive(),SmartPlugin.getVideoURL(),SmartPlugin.getDuration(),youboraData.getTransaction());
        SmartPlugin.isStartEventSent = true;
        SmartPlugin.setPing();

    },

    join : function(bufferState)
    {
        var d = new Date();
        var joinTimeTotal = 0;

        if (bufferState == SmartPlugin.AnalyticsEvents.BUFFER_START)
        {
            SmartPlugin.joinTimeBegin = d.getTime();
        }
        else if (bufferState == SmartPlugin.AnalyticsEvents.BUFFER_END)
        {
            SmartPlugin.joinTimeEnd = d.getTime();
            joinTimeTotal = SmartPlugin.joinTimeEnd - SmartPlugin.joinTimeBegin;
            if (joinTimeTotal <= 0 || isNaN(joinTimeTotal))
            {
                //Minimum valid value for a joinTime
                joinTimeTotal = 10;
            }           
            var currentTime = 10;
            try{
                currentTime = SmartPlugin.getCurrentTime();
            }catch(err){}
            SmartPlugin.communications.sendJoin(SmartPlugin.getCurrentTime(),joinTimeTotal);
        }
    },

    onPlayStateChanged: function(sender,args){
        switch (sender.PlayState)
        {
            case SmartPlugin.PLAYER_STATE.STOPPED:     
            case SmartPlugin.PLAYER_STATE.MEDIA_ENDED:    
                /*this.stop();*/
                break;
            case SmartPlugin.PLAYER_STATE.PLAYING:     
                if (SmartPlugin.isStopEventSent)
                {
                    SmartPlugin.isStopEventSent = false;
                }
                if (!SmartPlugin.isStartEventSent)
                {
                    SmartPlugin.isStartEventSent = true;
                    SmartPlugin.start();
                    SmartPlugin.join(SmartPlugin.AnalyticsEvents.BUFFER_START);
                }
                else if (SmartPlugin.isPauseEventSent)
                {
                    SmartPlugin.isPauseEventSent = false;
                    SmartPlugin.resume();
                }
                else if(!SmartPlugin.isJoinEventSent && SmartPlugin.isStartEventSent){
                    SmartPlugin.join(SmartPlugin.AnalyticsEvents.BUFFER_END);
                    SmartPlugin.isJoinEventSent = true;

                }
                else if (SmartPlugin.isJoinEventSent && !SmartPlugin.isBufferRunning)
                {
                    SmartPlugin.buffer(SmartPlugin.AnalyticsEvents.BUFFER_END);
                    SmartPlugin.isBufferRunning = false;
                }
                else if (SmartPlugin.isBufferRunning)
                {
                    SmartPlugin.isBufferRunning = false;
                    SmartPlugin.buffer(SmartPlugin.AnalyticsEvents.BUFFER_END);
                }
                break;
            case SmartPlugin.PLAYER_STATE.PAUSED: 
                SmartPlugin.isPauseEventSent = true;
                SmartPlugin.pause();
                break;
            case SmartPlugin.PLAYER_STATE.BUFFERING:   
                
                SmartPlugin.isBufferRunning = true;
                SmartPlugin.buffer(SmartPlugin.AnalyticsEvents.BUFFER_START);
                break;            
        }
    },

    pause :function(){
        SmartPlugin.communications.sendPause();
    },
    resume : function(){
        SmartPlugin.communications.sendResume();
    },
    setPing : function()
    {
        SmartPlugin.pingTimer = setTimeout(function(){ SmartPlugin.ping(); }, SmartPlugin.pamPingTime);
    },
    ping : function()
    {
        SmartPlugin.communications.sendPingTotalBitrate(SmartPlugin.getBitrate(),SmartPlugin.player.PlaybackPositionSeconds);
        this.setPing();
    },
    stop : function()
    {
        SmartPlugin.communications.sendPingTotalBitrate(SmartPlugin.getBitrate(),SmartPlugin.player.PlaybackPositionSeconds);
        this.setPing();
    },
    //No bitrate info yet
    getBitrate : function(){
        return -1;
    },
    setPlayer :function(player){
        if(youboraData.getMediaResource()==""){
            this.findVideo();
        }else{
            this.setVideoUrl(youboraData.getMediaResource());
        }
        this.player = player;
        this.player.PlayStateChanged = this.onPlayStateChanged;
        this.player.MediaFailed = SmartPlugin.error;
        this.player.MediaEnded = SmartPlugin.stop;
        //this.player.MediaOpened = SmartPlugin.mediaOpened;
        this.system =     youboraData.getAccountCode();
        this.username =   youboraData.getUsername();
        this.metadata =  youboraData.getProperties();
        this.service =    youboraData.getService();
        this.communications = new YouboraCommunication(youboraData.getAccountCode() , this.service ,  youboraData , this.pluginVersion , this.targetDevice );
        this.pamPingTime = this.communications.getPingTime();

    },
    buffer : function(bufferState)
    {
        var d = new Date();
        var bufferTimeEnd = 0;
        var bufferTimeTotal = 0;
        var params = null;            
        if (bufferState == SmartPlugin.AnalyticsEvents.BUFFER_START)
        {
            SmartPlugin.bufferTimeBegin = d.getTime();
        }
        else if (bufferState == SmartPlugin.AnalyticsEvents.BUFFER_END)
        {
            bufferTimeEnd = d.getTime();
            bufferTimeTotal = bufferTimeEnd - SmartPlugin.bufferTimeBegin;
           
            this.communications.sendBuffer(SmartPlugin.getCurrentTime() ,bufferTimeTotal);
            
        }
    },
    //Method that is sent directly listening to the player
    stop : function(sender, args){
        this.communications.sendStop();
        this.reset();
    },
    //Method that is sent directly listening to the player
    error : function(sender, args){
       

        var errorCode = args.ErrorCode;
        var errorType = args.ErrorType;

        var errMsg = "Unhandled Error in Silverlight Application " +  appSource + "\n" ;

        errMsg += "Code: "+ errorCode + "    \n";
        errMsg += "Category: " + errorType + "       \n";
        errMsg += "Message: " + args.ErrorMessage + "     \n";


        SmartPlugin.communications.sendErrorWithParameters(errorCode,errMsg,"0",window.location.href,SmartPlugin.getMetadata(),SmartPlugin.isLive,SmartPlugin.getVideoURL(),SmartPlugin.getDuration(),youboraData.getTransaction());
        this.reset();
    },

    reset : function()
    {
        SmartPlugin.isStopEventSent = false;
        SmartPlugin.isStartEventSent = false;
        SmartPlugin.isJoinEventSent = false;
        SmartPlugin.isBufferRunning = false;
        SmartPlugin.isPauseEventSent = false;
        SmartPlugin.bufferTimeBegin = 0;
        SmartPlugin.joinTimeBegin = 0;
        SmartPlugin.joinTimeEnd = 0;
        clearTimeout(SmartPlugin.pingTimer);
        SmartPlugin.pingTimer = null;
    },
    getCurrentTime : function(){
        return SmartPlugin.player.PlaybackPositionSeconds;
    },
    getDuration : function(){
        return SmartPlugin.player.PlaybackPositionSeconds
    },
    getVideoURL : function(){
        return SmartPlugin.videoUrl;
    },
    getMetadata: function(){
        var jsonObj = JSON.stringify(youboraData.getProperties());
        var metadata = encodeURI(jsonObj);
        return metadata;
    },
    setVideoUrl: function(videoUrl){
        SmartPlugin.videoUrl = videoUrl;
    },
    findVideo : function(){
        // We make sure that the structure is created. Once we know that,
        // we will get the resource from the structure
        try{
            var allItems = document.getElementsByTagName('object');
            var found = false;
            var i=0;
            var player=null;
            var element;
            while(i<allItems.length && !found){
                element = allItems[i];
                if(element.type != undefined){
                    if( element.type.indexOf("application/x-silverlight-2") != -1){
                        found =true;
                        player = element;
                    }
                }
                i++;
            }
             
            if(player == null){
                 setTimeout(this.findVideo,200);
               
            }else{
                var params = new Array();
                params = document.getElementsByName('InitParams')[0].value;
                var paramArray={};
                var paramArray = CSVToArray(params);
                for(var i=0; i<paramArray.length;i++){
                    var row = paramArray[i];
                    for(var j=0; j<row.length ; j++){
                        var paramRowArray = CSVToArray(row[j],"=");
                        switch (paramRowArray[0][0])
                        {
                            case "mediaUrl":
                            case "mediaurl":
                            case "mediaSource":
                            case "mediasource":  
                            case "mediaUri":    
                            case "mediauri":
                            SmartPlugin.setVideoUrl(paramRowArray[0][1]);
           
                        }   
                    }
                }
            }
        }catch(err){
            console.log(err);
        }  
    }
}

    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    function CSVToArray( strData, strDelimiter ){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");
 
        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
 
                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
 
                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            ); 
        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];
        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null; 
        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){
            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];
            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                (strMatchedDelimiter != strDelimiter)
                ){
 
                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push( [] );
 
            }
            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){
                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                var strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                    );
 
            } else {
 
                // We found a non-quoted value.
                var strMatchedValue = arrMatches[ 3 ];
 
            }
            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }
 
        // Return the parsed data.
        return( arrData );
    }