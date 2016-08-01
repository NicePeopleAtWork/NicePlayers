
/*
 * YouboraCommunication 
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Miguel Angel Zambrana
 * Author: Lluís Campos Beltran
 * Version: 1.1.6
 *   - With Queue Events
 *   - Async Load FastData
 *	 - Added Duration & Transcode Support on start
 *   - Added Param1...Param10 into start event
 *   - Control about FastData response, and if StartEvent is sent
 *   - Added fastdata debug capability
 *	 - Added resume workflow
 */

/**
 * YouboraCommunication definition.
 * @param system
 * @param service
 * @param bandwidth
 * @param pluginVersion
 * @param targetDevice
 * @constructor
 */

function YouboraCommunication ( system, service, bandwidth , pluginVersion , targetDevice )
{
	try
	{
		// user		
	    this.system 				= system;
	    this.service 				= service;
	    this.bandwidth 				= bandwidth;

	    // configuration
	    this.pluginVersion 			= pluginVersion;
	    this.targetDevice 			= targetDevice;
	    this.outputFormat 			= "xml";
	    this.xmlHttp 				= null;
	    this.isXMLReceived 			= false;

	    // urls
	    this.pamBufferUnderrunUrl 	= "";
	    this.pamJoinTimeUrl 		= "";
	    this.pamStartUrl 			= "";
	    this.pamStopUrl 			= "";
	    this.pamPauseUrl 			= "";
	    this.pamResumeUrl 			= "";
	    this.pamPingUrl 			= "";
	    this.pamErrorUrl 			= "";

	    // code
	    this.pamCode 				= "";
	    this.pamCodeOrig 			= "";
	    this.pamCodeCounter 		= 0;

	    // ping
	    this.pamPingTime 			= 5000; 	// Default Ping time value (5 seconds)
	    this.lastPingTime 			= 0;
	    this.diffTime 				= 0;

	    // queue events
	    this.canSendEvents			= false;
	    this.eventQueue 			= [];
	    this.startSent				= false;

	    // fast data
	    this.fastDataValid			= false;

	    // debug
	    this.debug					= youboraData.getDebug(); 
	    this.debugHost				= "";

	    // concurrency timer
		var self = this; 
		this.concurrencyTimer 		= ""

	    // resume timer 
		this.resumeInterval  		= "";
		this.currentTime 	  		= 0;

		//Level3 node
		//this.verifyL3Node			= youboraData.getCDNNodeData();

		// balance callback
		this.balancedCallback 		= function() {};

		if(typeof youboraData != "undefined")
		{
			/*
			if(youboraData.getCDNNodeData && youboraData.getMediaResource().length > 0)
			{
				if(this.debug)
				{
					console.log ( "YouboraCommunication :: LEVEL3 :: Getting head for: " + youboraData.getMediaResource()); 
				}
				this.getFirstLevel3Head();

			} else {
				console.log ( "YouboraCommunication :: LEVEL3 :: Disabled ::"); 
			}
			*/
			
			if(youboraData.concurrencyProperties.enabled) 
			{
				this.concurrencyTimer = setInterval(function() { self.checkConcurrencyWork() }, 10000);
			}
			if(youboraData.resumeProperties.resumeEnabled) 
			{
				this.checkResumeState();
			}
			else 
			{
				if(this.debug)
				{
					console.log ( "YouboraCommunication :: Resume :: Disabled"); 
				}
			}
		}
		else
		{
			if(this.debug)
			{
				console.log ( "YouboraCommunication :: Unable to reach youboraData :: Concurrency / Resume :: Disabled" );
			}
		}
 		
 		// Init 
	    this.init();

	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraCommunication :: Error Msg: " + err ) 
		}
	}
}
/*
YouboraCommunication.prototype.getFirstLevel3Head = function( data )
{ 
	var resourceSrc = youboraData.getMediaResource();
	xmlHttp = new XMLHttpRequest();  
    xmlHttp.open("head", resourceSrc); 
    xmlHttp.setRequestHeader("X-WR-DIAG", "host");
    xmlHttp.setRequestHeader('Access-Control-Allow-Origin','*') 
    xmlHttp.send('?nva=20140402162446&transaction_code=80758836cc0ff9e013711994372d1f1cbcdb4493&token=06a0987356014bfcd7def');  
}
*/
YouboraCommunication.prototype.checkResumeState = function()
{ 
	if(typeof youboraData != "undefined")
	{ 
		var resumeService	=  youboraData.getResumeService();
		var resumeContentId	=  youboraData.getContentId();
		var resumeUserid	=  youboraData.getUsername(); 
		var context = this; 

		if ( resumeContentId.length > 0 )
		{
			if ( resumeUserid.length > 0 )
			{
				try 
				{  
				    this.xmlHttp = new XMLHttpRequest();  
				    this.xmlHttp.context = this;   
	    			this.xmlHttp.addEventListener("load", function(httpEvent) { this.context.validateResumeStatus(httpEvent); }, false);
				    var urlDataWithCode = resumeService + "?contentId=" + resumeContentId +  
				    									  "&userId=" 	+ resumeUserid + 
				    									  "&random="	+ Math.random(); 
				    this.xmlHttp.open("GET", urlDataWithCode , true); 
				    this.xmlHttp.send(); 
				    
				    if(context.debug)
					{
				    	console.log ( "YouboraCommunication :: HTTP Reusme Request :: " + urlDataWithCode ); 
				    	console.log ( "YouboraCommunication :: Resume :: Enabled"); 
					}
				}
				catch ( err )
				{
					clearInterval(this.resumeInterval);
					if(this.debug)
					{
						console.log ( "YouboraCommunication :: Error while performig resume petition ::" + err );
					}
				}
			}
			else
			{
				if(this.debug)
				{
					console.log ( "YouboraCommunication :: Resume enabled without username defined :: Resume Disabled" ); 			
				}
			}   
		}
		else
		{
			if(this.debug)
			{
				console.log ( "YouboraCommunication :: Resume enabled without contentId defined :: Resume Disabled" );		
			}
		}  
	}
}

YouboraCommunication.prototype.validateResumeStatus = function(httpEvent)
{ 
	try
	{
	    if ( httpEvent.target.readyState == 4 )
	    {
	        var response = httpEvent.target.response.toString();   
	        if ( response > 0) 
	        {
				var resumeCallback	=  youboraData.getResumeCallback();
				
				if(this.debug)
				{
	        		console.log("YouboraCommunication :: Resume :: Available ::");
	        	}
	        	if ( typeof resumeCallback == "function")
	        	{
	        		resumeCallback(response);
	        		if(this.debug)
					{
	        			console.log("YouboraCommunication :: Resume :: Executed Function");
	        		}
	        	} 
	        	else 
	        	{
	        		if(this.debug)
					{
	        			console.log("YouboraCommunication :: Unable to determine callback type ::");
	        		}
	        	}
	        } 
	        else if ( response == "0")
	        {
	        	if(this.debug)
				{
	    			console.log("YouboraCommunication :: Resume :: No previous state..." );
	    		}
	        }
	        else
	        {
	        	clearInterval(this.concurrencyTimer);
	        	if(this.debug)
				{
	    			console.log("YouboraCommunication :: Resume :: Empty response... stoping rsume." );
	    		}
	        }
	    } 

	}
	catch ( err ) { console.log(err); };   
};

YouboraCommunication.prototype.sendResumeStatus = function()
{ 
	var mainContext = this;
	if(typeof youboraData != "undefined")
	{ 

		var playTimeService	=  youboraData.getPlayTimeService();
		var resumeContentId	=  youboraData.getContentId();
		var resumeUserid	=  youboraData.getUsername();

		try 
		{  
		    this.xmlHttp = new XMLHttpRequest();   
			this.xmlHttp.addEventListener("load", function(httpEvent) {  }, false);
		    var urlDataWithCode = playTimeService + "?contentId="  + resumeContentId +  
		    									    "&userId=" 	   + resumeUserid +
		    									    "&playTime="   + Math.round(this.currentTime) +
		    									    "&random="	   + Math.random(); 
		    this.xmlHttp.open("GET", urlDataWithCode , true); 
		    this.xmlHttp.send(); 
		    if(mainContext.debug)
			{
		    	console.log ( "YouboraCommunication :: HTTP Resume Request :: " + urlDataWithCode );
		    }
		}
		catch ( err )
		{
			if(mainContext.debug)
			{
				console.log ( "YouboraCommunication :: sendResumeStatus :: Error: " + err );
			}
			clearInterval(this.resumeInterval);									
		}  
	}
}
 
YouboraCommunication.prototype.getPingTime = function()
{
	return this.pamPingTime;
};

YouboraCommunication.prototype.sendStart = function ( totalBytes , referer , properties , isLive , resource, duration , transcode ,
														param1 , param2 , param3 , param4 , param5 , param6 , param7 , param8 , param9 , param10 )
{
    try
	{
		if ( transcode == undefined )
			 transcode = "";

		if ( duration == undefined )
			 duration = 0;


		var d = new Date();

	    var params = "?pluginVersion=" + this.pluginVersion +
			         "&pingTime=" + this.pamPingTime +
			         "&totalBytes=" + totalBytes +
			         "&referer=" + encodeURIComponent(referer) +
			         "&user=" + this.bandwidth.username +
			         "&properties=" + properties +
			         "&live=" + isLive +
			         "&transcode=" + transcode +
			         "&system=" + this.system +
			         "&resource=" + encodeURIComponent(resource) +
			         "&duration=" + duration;

	    if ( ( param1 != undefined ) && ( param1 != "" ) )
	    	 params += "&param1=" + param1;
	    
	    if ( ( param2 != undefined ) && ( param2 != "" ) )
	    	 params += "&param2=" + param2;

	    if ( ( param3 != undefined ) && ( param3 != "" ) )
	    	 params += "&param3=" + param3;

	    if ( ( param4 != undefined ) && ( param4 != "" ) )
	    	 params += "&param4=" + param4;

	    if ( ( param5 != undefined ) && ( param5 != "" ) )
	    	 params += "&param5=" + param5;

	    if ( ( param6 != undefined ) && ( param6 != "" ) )
	    	 params += "&param6=" + param6;

	    if ( ( param7 != undefined ) && ( param7 != "" ) )
	    	 params += "&param7=" + param7;

	    if ( ( param8 != undefined ) && ( param8 != "" ) )
	    	 params += "&param8=" + param8;

	    if ( ( param9 != undefined ) && ( param9 != "" ) )
	    	 params += "&param9=" + param9;

	    if ( ( param10 != undefined ) && ( param10 != "" ) )
	    	 params += "&param10=" + param10;

	    if ( this.canSendEvents )
	    {
	    	this.sendAnalytics(this.pamStartUrl, params, false);
	    }
	    else
	    {
	    	this.addEventToQueue ( YouboraCommunicationEvents.START , params );
	    }


	    // Resume start
		if (youboraData.getResumeEnabled())
	    {
			var context = this; 
	    	if(context.debug)
			{
	    		console.log ( "YouboraCommunication :: Resume :: Enabled");
	    	}
			this.sendResumeStatus(); 
			this.resumeInterval = setInterval(function(){ context.sendResumeStatus(); }, 6000);
	    }


	    this.startSent = true;

	    this.lastPingTime = d.getTime();

	    //level3
	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		}
	}
};

YouboraCommunication.prototype.sendError = function( errorCode , message ,transcode,resource, system, isLive, properties, user, referer, totalBytes, pingTime, pluginVersion,duration,
														param1 , param2 , param3 , param4 , param5 , param6 , param7 , param8 , param9 , param10 )
{
	try
	{
		// Don't check if startSent, because sometimes error event is sent without start...

	    var params = "?errorCode=" + errorCode +
	       			 "&msg=" + message + 
	       			 "&transcode="+transcode;

	    if ( ( resource != undefined ) && ( resource != "" ) )
	    	 params += "&resource=" + resource;

	    if ( ( system != undefined ) && ( system != "" ) )
	    	 params += "&system=" + system;

	    if ( ( isLive != undefined ) && ( isLive != "" ) )
	    	 params += "&live=" + isLive;

	   	if ( ( properties != undefined ) && ( properties != "" ) )
	    	 params += "&properties=" + properties;

	    if ( ( user != undefined ) && ( user != "" ) )
	    	 params += "&user=" + user;

		if ( ( referer != undefined ) && ( referer != "" ) )
	    	params += "&referer=" + referer; 

	    if ( ( totalBytes != undefined ) && ( totalBytes != "" ) )
	    	 params += "&totalBytes=" + totalBytes;

	   	if ( ( pingTime != undefined ) && ( pingTime != "" ) )
	    	 params += "&pingTime=" + pingTime;

	    if ( ( pluginVersion != undefined ) && ( pluginVersion != "" ) )
	    	 params += "&pluginVersion=" + pluginVersion;

	    if ( ( param1 != undefined ) && ( param1 != "" ) )
	    	 params += "&param1=" + param1;

	    if ( ( param2 != undefined ) && ( param2 != "" ) )
	    	 params += "&param2=" + param2;

	    if ( ( param3 != undefined ) && ( param3 != "" ) )
	    	 params += "&param3=" + param3;

	    if ( ( param4 != undefined ) && ( param4 != "" ) )
	    	 params += "&param4=" + param4;

	    if ( ( param5 != undefined ) && ( param5 != "" ) )
	    	 params += "&param5=" + param5;

	    if ( ( param6 != undefined ) && ( param6 != "" ) )
	    	 params += "&param6=" + param6;

	    if ( ( param7 != undefined ) && ( param7 != "" ) )
	    	 params += "&param7=" + param7;

	    if ( ( param8 != undefined ) && ( param8 != "" ) )
	    	 params += "&param8=" + param8;

	    if ( ( param9 != undefined ) && ( param9 != "" ) )
	    	 params += "&param9=" + param9;

	    if ( ( param10 != undefined ) && ( param10 != "" ) )
	    	 params += "&param10=" + param10;

	    if ( ( duration != undefined ) && ( duration != "" ) )
	    	 params += "&duration=" + duration;

	    if ( this.canSendEvents )
	    {
	    	this.sendAnalytics(this.pamErrorUrl, params, false);
	    }
	    else
	    {
	    	this.addEventToQueue ( YouboraCommunicationEvents.ERROR , params );
	    }
	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		}
	}
};

YouboraCommunication.prototype.sendPingTotalBytes = function( totalBytes , currentTime )
{
	try
	{
		if ( this.startSent == false )
			 return;

		if (currentTime > 0) { this.currentTime = currentTime; }

	    var d = new Date();

	    if ( this.lastPingTime != 0 )
	    	 this.diffTime = d.getTime() - this.lastPingTime;

	    this.lastPingTime = d.getTime();

	    var params = "?diffTime=" + this.diffTime +
			         "&totalBytes=" + totalBytes +
			         "&pingTime=" + (this.pamPingTime / 1000) +
			         "&dataType=0" +
			         "&time=" + currentTime;

	    if ( this.canSendEvents )
	    {
	    	this.sendAnalytics(this.pamPingUrl, params, true);
	    }
	    else
	    {
	    	this.addEventToQueue ( YouboraCommunicationEvents.PING , params );
	    }
	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		} 
	} 
};

YouboraCommunication.prototype.sendPingTotalBitrate = function( bitrate , currentTime )
{
	try
	{
		if ( this.startSent == false )
			 return;

		if (currentTime > 0) { this.currentTime = currentTime; }

	    var d = new Date();

	    if ( this.lastPingTime != 0 )
	    	 this.diffTime = d.getTime() - this.lastPingTime;
	    
	    this.lastPingTime = d.getTime();

	    var params = "?diffTime=" + this.diffTime +
			         "&bitrate=" + bitrate +
			         "&pingTime=" + (this.pamPingTime / 1000) +
			         "&time=" + currentTime;

	    if ( this.canSendEvents )
	    {
	    	this.sendAnalytics(this.pamPingUrl, params, true);
	    }
	    else
	    {
	    	this.addEventToQueue ( YouboraCommunicationEvents.PING , params );
	    }
	}
	catch ( err ) 
	{
		if(this.debug)
		{
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		}
	} 
};

YouboraCommunication.prototype.sendJoin = function ( currentTime , joinTimeDuration )
{
	try
	{
		if (currentTime > 0) { this.currentTime = currentTime; }

	    var params = "?eventTime=" + currentTime +
	    			 "&time=" + joinTimeDuration;

	    if ( this.canSendEvents )
	    {
	    	this.sendAnalytics(this.pamJoinTimeUrl, params, false);
	    }
	    else
	    {
	    	this.addEventToQueue ( YouboraCommunicationEvents.JOIN , params );
	    }

	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		}
	}
};

YouboraCommunication.prototype.sendBuffer = function( currentTime , bufferTimeDuration )
{
	try
	{
		if ( this.startSent == false )
			 return;
		
		if (currentTime > 0) { this.currentTime = currentTime; }

	    var params = null;

	    var params = "?time=" + currentTime +
	       			 "&duration=" + bufferTimeDuration;

	    if ( this.canSendEvents )
	    {
	    	this.sendAnalytics(this.pamBufferUnderrunUrl, params, false);
	    }
	    else
	    {
	    	this.addEventToQueue ( YouboraCommunicationEvents.BUFFER , params );
	    }
	}
	catch ( err ) 
	{
		if(this.debug)
		{ 
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		}
	}
};

YouboraCommunication.prototype.sendResume = function()
{
	try
	{
		if ( this.startSent == false )
			 return;

	    var params = "";

	    if ( this.canSendEvents )
	    {
	    	this.sendAnalytics(this.pamResumeUrl, params, false);
	    }
	    else
	    {
	    	this.addEventToQueue ( YouboraCommunicationEvents.RESUME , params );
	    }
	}
	catch ( err ) 
	{
		if(this.debug)
		{ 
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		}
	}
};

YouboraCommunication.prototype.sendPause = function()
{
	try
	{
		if ( this.startSent == false )
			 return;

	    var params = "";

	    if ( this.canSendEvents )
	    {
	    	this.sendAnalytics(this.pamPauseUrl, params, false);
	    }
	    else
	    {
	    	this.addEventToQueue ( YouboraCommunicationEvents.PAUSE , params );
	    }
	    if ( youboraData.getResumeEnabled())
	    {
	    	this.sendResumeStatus()
	    }
	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		}
	}
};

YouboraCommunication.prototype.sendStop = function()
{
	try
	{
		if ( this.startSent == false )
			 return;
 
	    this.currentTime = 0;
	    if ( youboraData.getResumeEnabled())
	    {
	    	this.sendResumeStatus()
	    }
	    clearInterval(this.resumeInterval);

	    var params = "?diffTime=" + this.diffTime;

	    if ( this.canSendEvents )
	    {
	    	this.sendAnalytics(this.pamStopUrl, params, false);
	    }
	    else
	    {
	    	this.addEventToQueue ( YouboraCommunicationEvents.STOP , params );
	    }
	    
	    this.reset();
	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		}
	}
};

YouboraCommunication.prototype.addEventToQueue = function( eventType , params )
{
	try
	{
	    var niceCommunicationObject = new YouboraCommunicationURL ( eventType , params );
	    this.eventQueue.push(niceCommunicationObject);
	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		}
	}
};

/*
 *	Private methods
 */

YouboraCommunication.prototype.init = function()
{
	try
	{
	    var context = this;

	    this.xmlHttp = new XMLHttpRequest();
	    this.xmlHttp.context = this;
	    this.xmlHttp.addEventListener("load", function(httpEvent) { this.context.loadAnalytics(httpEvent); }, false);

	    var urlDataWithCode = this.service + "/data?system=" + this.system 
	    								   + "&pluginVersion=" + this.pluginVersion 
	    								   + "&targetDevice=" + this.targetDevice 
	    								   + "&outputformat=" + this.outputFormat;
	    this.xmlHttp.open("GET", urlDataWithCode, true);
	    this.xmlHttp.send(); 

		if(this.debug)
		{
			console.log ( "YouboraCommunication :: HTTP Fastdata Request :: " + urlDataWithCode );			
		}
	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		}
	 }    
};

YouboraCommunication.prototype.getLevel3Node = function ( resource )
{

	    this.xmlHttp = new XMLHttpRequest();
	    this.xmlHttp.context = this;
	    this.xmlHttp.addEventListener("load", function(httpEvent) { this.context.loadAnalytics(httpEvent); }, false);

	    var urlDataWithCode = this.service + "/data?system=" + this.system 
	    								   + "&pluginVersion=" + this.pluginVersion 
	    								   + "&targetDevice=" + this.targetDevice 
	    								   + "&outputformat=" + this.outputFormat;
	    this.xmlHttp.open("GET", urlDataWithCode, true);
	    this.xmlHttp.send(); 
};

YouboraCommunication.prototype.checkConcurrencyWork = function ()
{
	var mainContext = this;
	if(typeof youboraData != "undefined")
	{
		if(youboraData.concurrencyProperties.enabled) {
			
			var cCode 	  =  youboraData.getConcurrencyCode();
			var cService  =  youboraData.getConcurrencyService(); 
			var cSession  =  youboraData.getConcurrencySessionId();		
			var cMaxCount =  youboraData.getConcurrencyMaxCount();		
			var cUseIP 	  =  youboraData.getConcurrencyIpMode();
	 		var urlDataWithCode = "";

			try
			{
				if(cUseIP)
				{ 
				    var context = this;
				    this.xmlHttp = new XMLHttpRequest(); 
				    this.xmlHttp.addEventListener("load", function(httpEvent) { context.validateConcurrencyResponse(httpEvent); }, false);
				    urlDataWithCode = cService + "?concurrencyCode=" 	  + cCode +  
				    							 "&concurrencyMaxCount="  + cMaxCount +
				    							 "&random="				  + Math.random();
				    this.xmlHttp.open("GET", urlDataWithCode  , true);
				    this.xmlHttp.send();  
				}
				else 
				{
				    var context = this;
				    this.xmlHttp = new XMLHttpRequest(); 
				    this.xmlHttp.addEventListener("load", function(httpEvent) { context.validateConcurrencyResponse(httpEvent); }, false);
				    urlDataWithCode = cService + "?concurrencyCode=" 	  + cCode + 
				    						 	 "&concurrencySessionId=" + cSession +
				    							 "&concurrencyMaxCount="  + cMaxCount +
				    							 "&random="				  + Math.random();
				    this.xmlHttp.open("GET", urlDataWithCode  , true);
				    this.xmlHttp.send();  
				}

				if(mainContext.debug)
				{ 
					console.log( "YouboraCommunication :: HTTP Concurrency Request :: " + urlDataWithCode);
				}

			}
			catch ( err ) 
			{
				if(mainContext.debug)
				{ 
					console.log ( "YouboraCommunication :: startConcurrencyWork :: Error: " + err );
				}
			}  								
		}
		else
		{
			if(mainContext.debug)
			{
				console.log ( "YouboraCommunication :: Concurrency :: Disabled" );
			}
		}
	}
	else
	{
		if(this.debug)
		{
			console.log ("YouboraCommunication :: Concurrency :: Unable to reach youboraData"); 
		}
	}  
};

YouboraCommunication.prototype.validateConcurrencyResponse = function(httpEvent)
{ 
	var mainContext = this; 
	try
	{
	    if ( httpEvent.target.readyState == 4 )
	    {
	        var response 				= httpEvent.target.response;  

	        if ( response == "1") 
	        {
				var cRedirect =  youboraData.getConcurrencyRedirectUrl();
				if(mainContext.debug)
				{
	        		console.log("YouboraCommunication :: Concurrency :: 1 :: Redirecting to: "+ cRedirect );
	        	}
	    		window.location = cRedirect;
	        } 
	        else if ( response == "0")
	        {
				if(mainContext.debug)
				{
	    			console.log("YouboraCommunication :: Concurrency :: 0 :: Continue..." );
	    		}
	        }
	        else
	        {
				if(mainContext.debug)
				{
	    			console.log("YouboraCommunication :: Concurrency :: Empty response... stoping validation." );
	    		}
	        	clearInterval(this.concurrencyTimer);
	        }
	    } 

	}
	catch ( err ) { console.log(err); };   
};

 
YouboraCommunication.prototype.loadAnalytics = function(httpEvent)
{
	var mainContext = this;
	try
	{
	    if ( httpEvent.target.readyState == 4 )
	    {

			if(mainContext.debug)
			{
		    	console.log("YouboraCommunication :: Loaded XML FastData" );
		    }

	        var response 				= httpEvent.target.responseXML;
	        var pamUrl 					= response.getElementsByTagName("h")[0].childNodes[0].nodeValue;

	        if ( ( pamUrl != undefined ) && ( pamUrl != "" ) )
	        {
	        	this.pamBufferUnderrunUrl 	= "http://" + pamUrl + "/bufferUnderrun";
	        	this.pamJoinTimeUrl 		= "http://" + pamUrl + "/joinTime";
	        	this.pamStartUrl 			= "http://" + pamUrl + "/start";
	        	this.pamStopUrl 			= "http://" + pamUrl + "/stop";
	        	this.pamPauseUrl 			= "http://" + pamUrl + "/pause";
	        	this.pamResumeUrl 			= "http://" + pamUrl + "/resume";
	        	this.pamPingUrl 			= "http://" + pamUrl + "/ping";
	        	this.pamErrorUrl		 	= "http://" + pamUrl + "/error";
	        }
	        
	        this.pamCode 				= response.getElementsByTagName("c")[0].childNodes[0].nodeValue;
	        this.pamCodeOrig 			= this.pamCode;
	        this.pamPingTime 			= response.getElementsByTagName("pt")[0].childNodes[0].nodeValue * 1000;

	        this.isXMLReceived 			= true;

	        // Can send events
	        this.canSendEvents			= true;
	        this.sendEventsFromQueue ();

	        if ( ( ( pamUrl != undefined ) && ( pamUrl != "" ) ) && 
	        	 ( ( this.pamCode != undefined ) && ( this.pamCode != "" ) ) )
	        {
	        	// Can send events because FastData response is OK
	        	this.fastDataValid		= true;
	        } 

		    // Debug
		    try {
				mainContext.debug		= response.getElementsByTagName("db")[0].childNodes[0].nodeValue;
		    } catch(err) { }

		    try {
				mainContext.debugHost	= response.getElementsByTagName("dh")[0].childNodes[0].nodeValue; 
		    } catch(err) { 
		    	mainContext.debugHost	= "";
		   	} 

		    if(mainContext.debug && mainContext.debugHost.length > 0)
		    { 
    			console.log( "YouboraCommunication :: replaceConsoleEvents :: Binding to: "  + this.debugHost);  
		    	this.replaceConsoleEvents(); 
		    	youboraData.setDebug(true);
		    }  

		    this.checkConcurrencyWork();
	    }

	}
	catch ( error ) 
	{ 
		if(mainContext.debug)
		{
    		console.log( "YouboraCommunication :: loadAnalytics :: Error: "  + error );  
    	}
	}
};


YouboraCommunication.prototype.cPing = function()
{
	try
	{
	    var context = this;
	    this.xmlHttp = new XMLHttpRequest();
	    this.xmlHttp.context = this;
	    this.xmlHttp.addEventListener("load", function(httpEvent) { this.context.loadAnalytics(httpEvent); }, false);
	    var urlDataWithCode = this.service + "/data?system="   + this.system 
	     								   + "&pluginVersion=" + this.pluginVersion
	     								   + "&targetDevice="  + this.targetDevice 
	     								   + "&outputformat="  + this.outputFormat;
	    this.xmlHttp.open("GET", urlDataWithCode , true);
	    this.xmlHttp.send(); 
	    if(context.debug)
	    {
	    	console.log( "YouboraCommunication :: HTTP Request :: " + urlDataWithCode);
	    }
	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		}
	}    
};

YouboraCommunication.prototype.replaceConsoleEvents = function()
{
	var classContext = this;
	try
	{ 
		console = 
        { 
            log: function(data) 
            {
                try
                {
                    var time = new Date();
                    var timeStamp = "[" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() +"]";
                    var xmlhttp;
                    if (window.XMLHttpRequest) { xmlhttp = new XMLHttpRequest(); }
                    else { xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); }                    
                    xmlhttp.open( "GET", classContext.debugHost + encodeURIComponent(timeStamp) + " |> " + data);
                    xmlhttp.send();
                }
                catch (err) 
                {
                	// error
                }
            }
        }
		if(this.debug)
		{
        	console.log( "YouboraCommunication :: replaceConsoleEvents :: Done ::");
        }
	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log( "YouboraCommunication :: replaceConsoleEvents :: Error: " + err ); 
		}
	}    
};

YouboraCommunication.prototype.sendEventsFromQueue = function()
{
	try
	{
	    if ( this.canSendEvents == true )
	    {
	    	var niceCommunicationObject 	= this.eventQueue.pop();

	    	var eventURL;
	    	var eventType;

	    	while ( niceCommunicationObject != null )
	    	{
				eventType = niceCommunicationObject.getEventType();

				if 		( eventType == YouboraCommunicationEvents.START )
				{
					eventURL = this.pamStartUrl;
				}
				else if ( eventType == YouboraCommunicationEvents.JOIN )
				{ 
					eventURL = this.pamJoinTimeUrl;
				}
				else if ( eventType == YouboraCommunicationEvents.BUFFER )
				{ 
					eventURL = this.pamBufferUnderrunUrl;
				}
				else if ( eventType == YouboraCommunicationEvents.PAUSE )
				{ 
					eventURL = this.pamPauseUrl;
				}
				else if ( eventType == YouboraCommunicationEvents.RESUME )
				{ 
					eventURL = this.pamResumeUrl;
				}
				else if ( eventType == YouboraCommunicationEvents.PING )
				{ 
					eventURL = this.pamPingUrl;
				}
				else if ( eventType == YouboraCommunicationEvents.STOP )
				{ 
					eventURL = this.pamStopUrl;
				}
				else if ( eventType == YouboraCommunicationEvents.ERROR )
				{ 
					eventURL = this.pamErrorUrl;
				}

		    	if ( eventURL != null )
		    	{
	    			this.sendAnalytics ( eventURL , niceCommunicationObject.getParams() , false );
	    		}

	    		niceCommunicationObject 	= this.eventQueue.pop();
	    	}
	    }
	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		}
	}
} 

YouboraCommunication.prototype.getBalancedResource = function( path , callback )
{ 
	var mainContext = this;

	this.balancedCallback = callback;

	if(typeof youboraData != "undefined")
	{ 
		var service 		= youboraData.getBalanceService();
		var balanceType  	= youboraData.getBalanceType();
		var zoneCode		= youboraData.getBalanceZoneCode();
		var originCode		= youboraData.getBalanceOriginCode();
		var systemCode		= youboraData.getAccountCode();
		var token			= youboraData.getBalanceToken();
		var pluginVersion   = this.pluginVersion;
		var niceNVA 		= youboraData.getBalanceNVA();
		var niceNVB 		= youboraData.getBalanceNVB(); 

		try 
		{  
		    this.xmlHttp = new XMLHttpRequest();  
		    this.xmlHttp.context = this; 
		    var urlDataWithCode = service + "?type="  			+ balanceType +  
		    								"&systemcode=" 		+ systemCode +
		    								"&zonecode="		+ zoneCode +
		    								"&origincode="		+ originCode +
		    								"&resource="		+ path +
		    								"&niceNva="			+ niceNVA +
		    								"&niceNvb="			+ niceNVB +		    								
		    								"&pluginVersion="	+ pluginVersion +
		    								"&token="	   		+ token; 

			this.xmlHttp.addEventListener("load", function(httpEvent) { 
				var obj = httpEvent.target.response.toString();   
				var objJSON = "" ;
				var error = false;
				try 
				{
					objJSON = JSON.parse(obj);
				}
				catch (e)
				{
					error = true;
				}
				if(error == false){ 
					//objJSON['1']['URL'] = "http:/www.video.com/fake.mp4";
					mainContext.balancedCallback(objJSON);	
				} else {
		    		console.log ( "YouboraCommunication :: HTTP Balance :: Error: " + e);
					mainContext.balancedCallback(false)
				}
			}, false);

		    this.xmlHttp.open("GET", urlDataWithCode , true); 
		    this.xmlHttp.send(); 
		    if(mainContext.debug)
			{
		    	console.log ( "YouboraCommunication :: HTTP Balance Request :: " + urlDataWithCode );
		    } 
		}
		catch ( err )
		{
			if(mainContext.debug)
			{
				console.log ( "YouboraCommunication :: getBalancedResource :: Error: " + err );
			} 								
		}  
	}
}


YouboraCommunication.prototype.validateBalanceResponse = function( httpEvent )
{
    try
	{
		if ( httpEvent.target.readyState == 4 )
	    {
	    	
	    }
	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		}
	} 
};
YouboraCommunication.prototype.sendAnalytics = function(url, data, hasResponse)
{
	var mainContext = this;
    try
	{
		if ( this.canSendEvents && this.fastDataValid )
	    {
	    	this.xmlHttp = new XMLHttpRequest();
		    this.xmlHttp.context = this;

		    if (hasResponse)
		    {
		        this.xmlHttp.addEventListener("load",  function(httpEvent){ this.context.parseAnalyticsResponse(httpEvent); } , false);
		        this.xmlHttp.addEventListener("error", function(){ this.context.sendAnalyticsFailed(); } , false);
		    }
		    else
		    {
		    	this.xmlHttp.addEventListener("load",  function(httpEvent){ this.context.parseAnalyticsResponse(httpEvent); }, false);
		        this.xmlHttp.addEventListener("error", function(){ this.context.sendAnalyticsFailed(); } , false);
		    }

		    var urlDataWithCode = url + data + "&code=" + this.pamCode + "&random=" + Math.random();
		    
			if(mainContext.debug)
			{
		    	console.log ( "YouboraCommunication :: HTTP Request :: " + urlDataWithCode );
		    }
		    this.xmlHttp.open("GET", urlDataWithCode , true);
		    this.xmlHttp.send();
		}
	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		}
	}  
};

YouboraCommunication.prototype.parseAnalyticsResponse = function( httpEvent )
{
    try
	{
		if ( httpEvent.target.readyState == 4 )
	    {
	    	
	    }
	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		}
	} 
};

YouboraCommunication.prototype.sendAnalyticsFailed = function()
{
	try
	{
		if(this.debug)
		{
			console.log("YouboraCommunication :: Failed communication with nQs Service" );
		}
	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		}
	} 
};

YouboraCommunication.prototype.updateCode = function()
{
	try
	{
	    this.pamCodeCounter++;
	    this.pamCode = this.pamCodeOrig + "_" + this.pamCodeCounter;
	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		}
	} 
};

YouboraCommunication.prototype.reset = function()
{
	try
	{
	    this.lastPingTime 	= 0;
	    this.diffTime 		= 0;
	    this.startSent		= false;
	    this.updateCode();
	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		}
	} 
};

YouboraCommunication.prototype.getResourcePath = function(href)
{
    //Standard methos as getting the path name from an url
    //may not work with files with extension not http
    var pathWithDomain = href.split("//")[1];
    var startPathIndex = pathWithDomain.indexOf("/");
    var resourcePath = pathWithDomain.substring(startPathIndex,href.length);
    return resourcePath;

   }

function YouboraCommunicationURL ( eventType , params )
{
	this.params 	= params;
	this.eventType	= eventType;
}

YouboraCommunicationURL.prototype.getParams = function()
{
	return this.params;
};

YouboraCommunicationURL.prototype.getEventType = function()
{
	return this.eventType;
};


if (typeof console == "undefined") { var console = function () { } };

var YouboraCommunicationEvents = {
  	START: 	0,
    JOIN: 	1,
    BUFFER: 2,
    PING: 	3,
    PAUSE: 	4,
    RESUME: 5,
    STOP: 	6,
    ERROR: 	7
};
