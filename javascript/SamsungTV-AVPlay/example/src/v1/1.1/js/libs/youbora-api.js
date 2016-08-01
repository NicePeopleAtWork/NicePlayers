
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
 *	 - Added level3 header support
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

		// balance callback
		this.balancedCallback 		= function() {};

		// level 3 data
		this.l3dataStart 			= { host: "", type: "" }
		this.l3dataPing 			= { host: "", type: "" }
		this.l3types 				= {
		  	UNKNOWN: 		0,
		    TCP_HIT: 		1,
		    TCP_MISS:		2,
		    TCP_MEM_HIT: 	3 
		}

		this.l3IsNodeSend 			= false;
		this.resourcePath;

		if(typeof youboraData != "undefined")
		{ 
			if(youboraData.concurrencyProperties.enabled) 
			{
				this.concurrencyTimer = setInterval(function() { self.checkConcurrencyWork() }, 10000);
				if(this.debug)
				{
					console.log ( "YouboraCommunication :: Concurrency :: Enabled" ); 
				}
			} 
			else 
			{
				if(this.debug)
				{
					console.log ( "YouboraCommunication :: Concurrency :: Disabled" ); 
				}
			}
			if(youboraData.resumeProperties.resumeEnabled) 
			{ 
				this.checkResumeState();
				if(this.debug)
				{
					console.log ( "YouboraCommunication :: Resume :: Enabled" );
				}
			} 
			else 
			{
				if(this.debug)
				{
					console.log ( "YouboraCommunication :: Resume :: Disabled" ); 
				}

			}
			if(youboraData.cdn_node_data == true) 
			{  
				if(this.debug)
				{
					console.log ( "YouboraCommunication :: Level3 :: Enabled" );
				}
			} 
			else 
			{
				if(this.debug)
				{
					console.log ( "YouboraCommunication :: Level3 :: Disabled" ); 
				}

			}
			if(youboraData.getBalanceEnabled()) 
			{  
				if(this.debug)
				{
					console.log ( "YouboraCommunication :: Balancer :: Enabled" );
				}
			} 
			else 
			{
				if(this.debug)
				{
					console.log ( "YouboraCommunication :: Balancer :: Disabled" ); 
				}

			}
		}
		else
		{
			if(this.debug)
			{
				console.log ( "YouboraCommunication :: Unable to reach youboraData :: Concurrency / Resume / Level3 :: Disabled" );
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

YouboraCommunication.prototype.getLevel3Header = function()
{ 
	if(typeof youboraData != "undefined"  && this.fastDataValid)
	{
		var context = this;
		if ( youboraData.getMediaResource().length > 0 )
		{ 
			try 
			{
			    this.xmlHttp = new XMLHttpRequest();   
				this.xmlHttp.context = this;    
				this.xmlHttp.addEventListener("load", function(httpEvent) {   
					try {
						var header = httpEvent.target.getResponseHeader('X-WR-DIAG').toString();
						if ( this.context.parseL3Header(header , 1) )
						{
							//all set
						}
						else 
						{
							if(this.context.debug)
							{
								console.log ( "YouboraCommunication :: Level3 :: Error parsing header"); 
							} 
						}  
					}
					catch (e)
					{
						if(this.context.debug)
						{
							console.log ( "YouboraCommunication :: Level3 :: Error parsing header"); 
						}  
					}
				}, true); 
			    this.xmlHttp.open("head", youboraData.getMediaResource(), true);  
			    this.xmlHttp.setRequestHeader('X-WR-Diag','host') 
			   	this.xmlHttp.send();  
				if(this.debug)
				{
 			    	console.log ( "YouboraCommunication :: HTTP LEVEL3 Header Request :: " + youboraData.getMediaResource() ); 
				}
			}
			catch (e)
			{   
				youboraData.setCDNNodeData(false);
		    	if ( this.debug )
		    	{
		    		console.log ( "YouboraCommunication :: Level3 :: Error with header, disabling header check"); 
		    	}
			}
		}
		else
		{   youboraData.setCDNNodeData(false);
	    	if ( this.debug )
	    	{
	    		console.log ( "YouboraCommunication :: Level3 :: Error with header, disabling header check"); 
	    	}
		}  
	}
} 

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

YouboraCommunication.prototype.parseL3Header = function ( header , obj )
{
	var l3Response = header;
	try 
	{
		l3Response = l3Response.split(" ");
        l3Response.host = l3Response[0].replace("Host:","");
        l3Response.type = l3Response[1].replace("Type:",""); 

        if 		( l3Response.type == "TCP_HIT" ) 		{ l3Response.type = this.l3types.TCP_HIT; }
        else if ( l3Response.type == "TCP_MISS" ) 		{ l3Response.type = this.l3types.TCP_MISS; }
        else if ( l3Response.type == "TCP_MEM_HIT" )	{ l3Response.type = this.l3types.TCP_MEM_HIT; }
        else 
        {
        	l3Response.type = this.l3types.UNKNOWN;
			if(this.debug)
			{
				console.log ( "YouboraCommunication :: Level3 :: Unknown type received: " +  l3Response.type ); 
			}
        }
        if(obj == 1)
        {
	        this.l3dataStart.host = l3Response.host;
	        this.l3dataStart.type = l3Response.type;
			if(this.debug)
			{
				console.log ( "YouboraCommunication :: Level3 :: onLoad :: Host: " +  this.l3dataStart.host + " :: Type: " + this.l3dataStart.type ); 
			}
    	}
    	else 
    	{
	        this.l3dataPing.host = l3Response.host;
	        this.l3dataPing.type = l3Response.type;
			if(this.debug)
			{
				console.log ( "YouboraCommunication :: Level3 :: beforeStart :: Host: " +  this.l3dataPing.host + " :: Type: " + this.l3dataPing.type ); 
			}
    	}
		return true;
	}
	catch (e)
	{
    	youboraData.setCDNNodeData(false);
    	if ( this.context.debug )
    	{
    		console.log ( "YouboraCommunication :: Level3 :: Error with header, disabling header check"); 
    	}
		return false;
	}

}

YouboraCommunication.prototype.sendStartL3 = function ( totalBytes , referer , properties , isLive , resource, duration , transcode ,
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

		if ( youboraData.cdn_node_data == true && this.fastDataValid ) 
		{ 
			if ( this.l3dataStart.host == this.l3dataPing.host )
			{ 
		    	 params += "&nodeHost=" + this.l3dataPing.host;
		    	 params += "&nodeType=" + this.l3dataStart.type; 
			}
			else 
			{ 
		    	 params += "&nodeHost=" + this.l3dataPing.host;
		    	 params += "&nodeType=" + this.l3dataPing.type; 
			}
		}

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

	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraCommunication :: Error Msg: " + err );
		}
	}
}

YouboraCommunication.prototype.sendStart = function ( totalBytes , referer , properties , isLive , resource, duration , transcode)
{

	if ( youboraData.cdn_node_data == true && this.fastDataValid ) 
	{ 

	    try
		{
		    this.xmlHttp = new XMLHttpRequest();   
			this.xmlHttp.context = this;    
			this.xmlHttp.addEventListener("load", function(httpEvent) {   
				try {
					var header = httpEvent.target.getResponseHeader('X-WR-DIAG').toString();
					if ( this.context.parseL3Header(header , 2) )
					{
						this.context.sendStartL3(totalBytes , referer , properties , isLive , resource, duration , transcode , param1 , param2 , param3 , param4 , param5 , param6 , param7 , param8 , param9 , param10);		
					}
					else 
					{
						if(this.context.debug)
						{
							console.log ( "YouboraCommunication :: Level3 :: Error parsing header"); 
						} 
					}  
				}
				catch (e)
				{
			    	youboraData.setCDNNodeData(false);
			    	if ( this.debug )
			    	{
			    		console.log ( "YouboraCommunication :: Level3 :: Error with header, disabling header check"); 
			    	}
				}
			}, true); 
		    this.xmlHttp.open("HEAD", resource, true);  
		    this.xmlHttp.setRequestHeader('X-WR-DIAG','host') 
		   	this.xmlHttp.send();  
	    }
	    catch(e)
	    { 
	    	youboraData.setCDNNodeData(false);
	    	if ( this.debug )
	    	{
	    		console.log ( "YouboraCommunication :: Level3 :: Error with header, disabling header check"); 
	    	}
	    }
	} 
	else 
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

			params = params + this.getExtraParamsUrl(youboraData.getExtraParams());
		 
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

		}
		catch ( err ) 
		{ 
			if(this.debug)
			{
				console.log ( "YouboraCommunication :: Error Msg: " + err );
			}
		}
	}
};

YouboraCommunication.prototype.sendError = function( errorCode , message ,transcode,resource, system, isLive, properties, user, referer, totalBytes, pingTime, pluginVersion,duration)
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



	 	params = params + this.getExtraParamsUrl(youboraData.getExtraParams());

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

		if ( youboraData.cdn_node_data == true && this.fastDataValid ) 
		{ 
			if(this.l3IsNodeSend == false)
			{
				if ( this.l3dataStart.host == this.l3dataPing.host )
				{ 
			    	 params += "&nodeHost=" + this.l3dataPing.host;
			    	 params += "&nodeType=" + this.l3dataStart.type; 
				}
				else 
				{ 
			    	 params += "&nodeHost=" + this.l3dataPing.host;
			    	 params += "&nodeType=" + this.l3dataPing.type; 
				}
				this.l3IsNodeSend = true;
			}
		} 

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

		if ( youboraData.cdn_node_data == true && this.fastDataValid ) 
		{ 
			if(this.l3IsNodeSend == false)
			{
				if ( this.l3dataStart.host == this.l3dataPing.host )
				{ 
			    	 params += "&nodeHost=" + this.l3dataPing.host;
			    	 params += "&nodeType=" + this.l3dataStart.type; 
				}
				else 
				{ 
			    	 params += "&nodeHost=" + this.l3dataPing.host;
			    	 params += "&nodeType=" + this.l3dataPing.type; 
				}
				this.l3IsNodeSend = true;
			}
		} 

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
				if(typeof cRedirect == "function")
				{
					if(mainContext.debug)
					{
		        		console.log("YouboraCommunication :: Concurrency :: Executed function");
		        	}
		    		cRedirect();

				}
				else
				{
					if(mainContext.debug)
					{
		        		console.log("YouboraCommunication :: Concurrency :: 1 :: Redirecting to: "+ cRedirect );
		        	}
		    		window.location = cRedirect;
		    	}
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
	        if(youboraData.enableAnalytics){
	        	this.canSendEvents			= true;
	        }
	        
	        if ( ( ( pamUrl != undefined ) && ( pamUrl != "" ) ) && 
	        	 ( ( this.pamCode != undefined ) && ( this.pamCode != "" ) ) )
	        {
	        	// Can send events because FastData response is OK
	        	this.fastDataValid		= true;
	        } 

	        this.sendEventsFromQueue ();

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

			if(youboraData.cdn_node_data && this.fastDataValid) 
			{
				this.getLevel3Header();
			} 
			if(youboraData.concurrencyProperties.enabled && this.fastDataValid)
			{
		    	this.checkConcurrencyWork();
		    }
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

YouboraCommunication.prototype.getBalancedResource = function( path , callback ,referer )
{ 
	var mainContext = this;

	this.balancedCallback = callback;
	if(!youboraData.enableBalancer){
		mainContext.balancedCallback(false);
	}else{
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

			
			this.resourcePath=path;
			try 
			{  
			    this.xmlHttp = new XMLHttpRequest();  
			    this.xmlHttp.context = this; 
			    //var nva = this.calculateNVA(niceNVA);
			    //var nvb =  this.calculateNVB(niceNVB);
			    var urlDataWithCode = service + "?type="  			+ balanceType +  
			    								"&systemcode=" 		+ systemCode +
			    								"&zonecode="		+ zoneCode +
			    								"&origincode="		+ originCode +
			    								"&resource="		+ encodeURIComponent(path) +						
			    								"&niceNva="			+ niceNVA +
			    								"&niceNvb="			+ niceNVB +	
			    								"&token="	   		+ youboraData.getBalanceToken();//this.generateToken(nva,nvb); 

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
						//console.log ( "YouboraCommunication :: HTTP Balance :: Error: " + e);
						error = true;
					}
					if(error == false){ 
						//objJSON['1']['URL'] = "http:/www.video.com/fake.mp4";
						//Param 13 = isBalanced
						youboraData.extraParams.param13 = true;
						mainContext.balancedCallback(objJSON);	
					} else {
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

};

YouboraCommunication.prototype.getExtraParamsUrl= function(extraParams){

	var params ="";

	if(extraParams!=undefined){

		if ( ( extraParams.param1 != undefined ))
			    	 params += "&param1=" + extraParams.param1;	    
		if ( ( extraParams.param2 != undefined ))
			params += "&param2=" + extraParams.param2;
	    if ( ( extraParams.param3 != undefined ))
			params += "&param3=" + extraParams.param3;
	    if ( ( extraParams.param4 != undefined ))
			params += "&param4=" + extraParams.param4;
	    if ( ( extraParams.param5 != undefined ))
			params += "&param5=" + extraParams.param5;
		if ( ( extraParams.param6 != undefined ))
			params += "&param6=" + extraParams.param6;
	    if ( ( extraParams.param7 != undefined ))
		   	params += "&param7=" + extraParams.param7;
	    if ( ( extraParams.param8 != undefined ))
			params += "&param8=" + extraParams.param8;
	    if ( ( extraParams.param9 != undefined ))
			params += "&param9=" + extraParams.param9;
	    if ( ( extraParams.param10 != undefined ))
			params += "&param10=" + extraParams.param10;
		if ( ( extraParams.param11 != undefined ))
			params += "&param11=" + extraParams.param11;
	    if ( ( extraParams.param12 != undefined ))
	  		params += "&param12=" + extraParams.param12;
	 	params += "&param13=" + extraParams.param13;
	}

 	return params;
};

YouboraCommunication.prototype.generateToken = function(nva,nvb)
{
	var service 		= youboraData.getBalanceService();
	var balanceType  	= youboraData.getBalanceType();
	var zoneCode		= youboraData.getBalanceZoneCode();
	var originCode		= youboraData.getBalanceOriginCode();
	var systemCode		= youboraData.getAccountCode();
	var pluginVersion   = this.pluginVersion;
	var niceNVA 		= youboraData.getBalanceNVA();
	var niceNVB 		= youboraData.getBalanceNVB(); 
	var secretWord 		= youboraData.getSecretWord();
	var niceTokenIp		= youboraData.getNiceTokenIp();

	/*console.log("Service : "  + service);
	console.log("balanceType : "  + balanceType);
	console.log("zoneCode : "  + zoneCode);
	console.log("originCode : "  + originCode);
	console.log("systemCode : "  + systemCode);
	console.log("pluginVersion : "  + pluginVersion);
	console.log("niceNVA : "  + niceNVA);
	console.log("niceNVB : "  + niceNVB);
	console.log("secretWord : "  + secretWord);
	console.log("niceTokenIp : "  + niceTokenIp);*/


	var notValidAfter = nva;
	var notValidBefore =  nvb;
	clearText = systemCode + zoneCode + originCode + this.resourcePath + notValidAfter + notValidBefore;

	this.notValidAfter = notValidAfter;
	this.notValidBefore = notValidBefore;

	if (niceTokenIp != null){
		clearText = clearText + niceTokenIp;
	}

	clearText = clearText + secretWord;
	var token = md5(clearText);
	return token;

};


YouboraCommunication.prototype.str2byteString = function(str)
{
	//var bytes = [];
	var byteString = "";

	for (var i = 0; i < str.length; ++i)
	{
	    //bytes.push(str.charCodeAt(i));
	    byteString = byteString + str.charCodeAt(i);
	    //console.log("char at  : " + str.charCodeAt(i));
	}
	return byteString;
};

YouboraCommunication.prototype.calculateNVA = function(niceNVA)
{
	var currentTime = this.calculateBaseTime();
	var notValidAfter = currentTime + (1000 * niceNVA);
	return notValidAfter;	
};

YouboraCommunication.prototype.calculateNVB = function(nvb)
{
	return this.calculateBaseTime();

};

YouboraCommunication.prototype.calculateBaseTime = function(){
	var d = new Date();
	var currentTime = new Date().getTime();
	/*console.log( "Date with no offset : " + d);
	console.log("Current Time no offset " + currentTime );
	console.log("Offset : "  +  d.getTimezoneOffset());*/

	/*currentTime = currentTime  + d.getTimezoneOffset() * 60000;
	currentTime = currentTime + (120 * 60000);*/
	return currentTime;
}

function YouboraCommunicationURL ( eventType , params )
{
	this.params 	= params;
	this.eventType	= eventType;
};

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



function md5(str) {
  // discuss at: http://phpjs.org/functions/md5/
  // original by: Webtoolkit.info (http://www.webtoolkit.info/)
  // improved by: Michael White (http://getsprink.com)
  // improved by: Jack
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // input by: Brett Zamir (http://brett-zamir.me)
  // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // depends on: utf8_encode
  // example 1: md5('Kevin van Zonneveld');
  // returns 1: '6e658d4bfcb59cc13f96c14450ac40b9'

  var xl;

  var rotateLeft = function (lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  };

  var addUnsigned = function (lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  };

  var _F = function (x, y, z) {
    return (x & y) | ((~x) & z);
  };
  var _G = function (x, y, z) {
    return (x & z) | (y & (~z));
  };
  var _H = function (x, y, z) {
    return (x ^ y ^ z);
  };
  var _I = function (x, y, z) {
    return (y ^ (x | (~z)));
  };

  var _FF = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var _GG = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var _HH = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var _II = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var convertToWordArray = function (str) {
    var lWordCount;
    var lMessageLength = str.length;
    var lNumberOfWords_temp1 = lMessageLength + 8;
    var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    var lWordArray = new Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  };

  var wordToHex = function (lValue) {
    var wordToHexValue = '',
      wordToHexValue_temp = '',
      lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValue_temp = '0' + lByte.toString(16);
      wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
    }
    return wordToHexValue;
  };

  var x = [],
    k, AA, BB, CC, DD, a, b, c, d, S11 = 7,
    S12 = 12,
    S13 = 17,
    S14 = 22,
    S21 = 5,
    S22 = 9,
    S23 = 14,
    S24 = 20,
    S31 = 4,
    S32 = 11,
    S33 = 16,
    S34 = 23,
    S41 = 6,
    S42 = 10,
    S43 = 15,
    S44 = 21;

  str = this.utf8_encode(str);
  x = convertToWordArray(str);
  a = 0x67452301;
  b = 0xEFCDAB89;
  c = 0x98BADCFE;
  d = 0x10325476;

  xl = x.length;
  for (k = 0; k < xl; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

  return temp.toLowerCase();
}

function utf8_encode(argString) {
  // discuss at: http://phpjs.org/functions/utf8_encode/
  // original by: Webtoolkit.info (http://www.webtoolkit.info/)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: sowberry
  // improved by: Jack
  // improved by: Yves Sucaet
  // improved by: kirilloid
  // bugfixed by: Onno Marsman
  // bugfixed by: Onno Marsman
  // bugfixed by: Ulrich
  // bugfixed by: Rafal Kukawski
  // bugfixed by: kirilloid
  // example 1: utf8_encode('Kevin van Zonneveld');
  // returns 1: 'Kevin van Zonneveld'

  if (argString === null || typeof argString === 'undefined') {
    return '';
  }

  // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  var string = (argString + '');
  var utftext = '',
    start, end, stringl = 0;

  start = end = 0;
  stringl = string.length;
  for (var n = 0; n < stringl; n++) {
    var c1 = string.charCodeAt(n);
    var enc = null;

    if (c1 < 128) {
      end++;
    } else if (c1 > 127 && c1 < 2048) {
      enc = String.fromCharCode(
        (c1 >> 6) | 192, (c1 & 63) | 128
      );
    } else if ((c1 & 0xF800) != 0xD800) {
      enc = String.fromCharCode(
        (c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
      );
    } else {
      // surrogate pairs
      if ((c1 & 0xFC00) != 0xD800) {
        throw new RangeError('Unmatched trail surrogate at ' + n);
      }
      var c2 = string.charCodeAt(++n);
      if ((c2 & 0xFC00) != 0xDC00) {
        throw new RangeError('Unmatched lead surrogate at ' + (n - 1));
      }
      c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
      enc = String.fromCharCode(
        (c1 >> 18) | 240, ((c1 >> 12) & 63) | 128, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
      );
    }
    if (enc !== null) {
      if (end > start) {
        utftext += string.slice(start, end);
      }
      utftext += enc;
      start = end = n + 1;
    }
  }

  if (end > start) {
    utftext += string.slice(start, stringl);
  }

  return utftext;
}
