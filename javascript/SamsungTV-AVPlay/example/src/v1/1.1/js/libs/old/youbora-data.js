
/*
 * YouboraData 
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Lluís Campos Beltran
 * Version: 1.1.0
 *	- Added handler for inline variables
 *  - Added concurrency workflow
 *  - Added resume workflow
 *  - Added debug control
 *  - Added balanced workflow
 */ 

function YouboraData ( )
{
	try
	{  
	    // General parameters
		this.accountCode = "demopam";								// Account Code
		this.service = "http://nqs.nice264.com/";					// Service URL
		this.username = "demopam";									// Username
		this.mediaResource = "";									// Resource
		this.transaction = "";										// Transaction code
		this.live = false;											// Live Content
		this.resume	= false;										// Can resume player about last connection
		this.contentId = "";										// ContentId (Replace hashId if contentId is informed)

	    // Debug
	    this.debug = true;											// Debug enabled

		// Metadata parameters
		this.properties = {
	        filename: "",											// File Name
	        content_id: "",											// Content Id 
	        content_metadata: { 
	            title: "", 											// Title
	            genre: "", 											// Genre
	            language: "", 										// Language
	            year: "",	 										// Year
	            cast: "",											// Cast 
	            director: "", 										// Director
	            owner: "",											// Owner 
	            duration: "", 										// Duration
	            parental: "", 										// Parental
	            price: "",											// Price
	            rating: "",											// Rating
	            audioType: "", 										// Audio Type
	            audioChannels: ""									// Audio Channels
	        },
	        transaction_type: "",				 					// Transaction Type
	        quality: "", 											// Quality
	        content_type: "",										// Content Type 
	        device: { 
	            manufacturer: "", 									// Manufacturer
	            type: "", 											// Type
	            year: "",                                		    // Year
	            firmware: "" 										// Firmware
	        }
	    } 

	    // Concurrency parameters
	    this.concurrencyProperties = {
	    	enabled: false,											// Is Enabled
	    	concurrencyService: "http://pc.youbora.com/cping/",		// Concurrency Service
	    	concurrencyCode: "",									// Concurrency Code
	    	concurrencySessionId: Math.random(),					// Concurrency Custom ID
	    	concurrencyMaxCount: 0,									// Concurrency Max connections count
	    	concurrencyRedirectUrl: "",								// Concurrency Max connections count
	    	concurrencyIpMode: false								// Use IP Limited Concurrency
	    }
 	    
	    // Overlay parameters for jwPlayer.DefaultValues
	    this.jwplayerOverlayText 	 = "";
	    this.jwplayerOverlayEnabled  = false;
	    this.jwplayerOverlayTime 	 = 60000;
	    this.jwplayerOverlayDuration = 6000;

	    // Resume parameters 
	    this.resumeProperties = {
	    	resumeEnabled:   false,									// Is resume enabled
	    	resumeService:   "http://pc.youbora.com/resume/",		// Resume Service
	    	playTimeService: "http://pc.youbora.com/playTime/",		// PlayTime Service
	    	resumeCallback:  function() { 							// Callback function
	    		console.log ( "YouboraData :: resumeCallback"); 
	    	}							
	    }
 	    
	    // Balanced Variables 
	    this.balanceProperties = {
	    	balanceType:"balanced", 
	    	enabled: 	false,
	    	service: 	"http://smartswitch.youbora.com/",
	    	zoneCode: 	"default",
	    	originCode: "bl3a3_b",
	    	niceNVA: 	"3600",
	    	niceNVB: 	"10",
	    	token: 		"07dc44a13f74b00d6be6b7a6c44d35c1",
	    	secretWord: "value",
	    	niceTokenIp: null,
	    }

	    //Extra params
	    this.extraParams = {
	    	param1: 	undefined, 
	    	param2: 	undefined, 
	    	param3: 	undefined, 
	    	param4: 	undefined, 
	    	param5: 	undefined, 
	    	param6: 	undefined, 
	    	param7: 	undefined, 
	    	param8: 	undefined, 
	    	param9: 	undefined, 
	    	param10: 	undefined, 
	    	param11: 	undefined, 
	    	param12: 	undefined, 
	    	param13: 	undefined, 
	    }

	    // Level 3 Node detect
	    this.cdn_node_data = false;


	    // Initialize
	    this.init();

	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraData :: Error [Function] :: " + err ) 
		}
	}
}

YouboraData.prototype.init = function()
{
	try
	{  
		this.collectParams();		
		if(this.debug)
		{
			console.log ( "YouboraData :: Initialized"); 
		}
		return true; 
	}
	catch ( err ) 
	{ 
		if(this.debug)
		{
			console.log ( "YouboraData :: Error [Init] :: " + err );
		}
	}    
};

YouboraData.prototype.collectParams = function()
{
	try 
	{
		var scripts			 = document.getElementsByTagName('script');
		var index 			 = 0;
	    for ( var i = 0; i < scripts.length; i++ ) { if(scripts[i].src.indexOf('youbora-data') != -1) {index=i;} } 
		var spYouboraScript  = scripts[index]; 
		var srcData			 = spYouboraScript.src.replace(/^[^\?]+\??/,'');
	    var Pairs 			 = srcData.split(/[;&]/);
 
	    for ( var i = 0; i < Pairs.length; i++ ) {
	        var KeyVal = Pairs[i].split('='); 
	        if ( ! KeyVal || KeyVal.length != 2 ) continue;
	        var key = unescape( KeyVal[0] );
	        var val = unescape( KeyVal[1] );
	        val = val.replace(/\+/g, ' '); 

			// Debug
			if ( key == "debug" )					{ this.setDebug(val) }

			// Common params
			if ( key == "accountCode" )				{ this.setAccountCode(val) }
			if ( key == "service" )					{ this.setService(val) }
			if ( key == "username" )				{ this.setUsername(val) }
			if ( key == "mediaResource" )			{ this.setMediaResource(val) }
			if ( key == "transaction" )				{ this.setTransaction(val) }
			if ( key == "live" )					{ this.setLive(val) }
			if ( key == "properties" )				{ this.setProperties(val) }
			if ( key == "resume" )					{ this.setResume(val) }
			if ( key == "contentId" )				{ this.setContentId(val) }

			// JWPlayer params
			if ( key == "jwplayerOverlayText" )		{ this.setJwplayerOverlayText(val) }
			if ( key == "jwplayerOverlayEnabled")	{ this.setJwplayerOverlayEnabled(val) }
			if ( key == "jwplayerOverlayTime" )		{ this.setJwplayerOverlayTime(val) }
			if ( key == "jwplayerOverlayDuration" )	{ this.setJwplayerOverlayDuration(val) }

			// Concurrency params
			if ( key == "concurrencyCode" )			{ this.setConcurrencyCode(val) }
			if ( key == "concurrencyService" )		{ this.setConcurrencyService(val) } 
			if ( key == "concurrencyMaxCount" )		{ this.setConcurrencyMaxCount(val) }
			if ( key == "concurrencyRedirectUrl" )	{ this.setConcurrencyRedirectUrl(val) }
			if ( key == "concurrencyIpMode" )		{ this.setConcurrencyIpMode(val) }
			
			// Resume params
			if ( key == "resumeProperties" )		{ this.setResumeProperties(val) }
			if ( key == "resumeEnabled" )			{ this.setResumeEnabled(val) } 
			if ( key == "resumeCallback" )			{ this.setResumeCallback(val) }
			if ( key == "resumeService" )			{ this.setResumeService(val) }
			if ( key == "playTimeService" )			{ this.setPlayTimeService(val) }
 
			// Balance params
			if ( key == "balanceProperties" )		{ this.setBalanceProperties(val) }
			if ( key == "balanceEnabled" )			{ this.setBalanceEnabled(val) } 
			if ( key == "balanceType" )				{ this.setBalanceType(val) } 
			if ( key == "balanceService" )			{ this.setBalanceService(val) }
			if ( key == "balanceZoneCode" )			{ this.setBalanceZoneCode(val) }
			if ( key == "balanceOriginCode" )		{ this.setBalanceOriginCode(val) }
			if ( key == "balanceNVA" )				{ this.setBalanceNVA(val) }
			if ( key == "balanceNVB" )				{ this.setBalanceNVB(val) }
			if ( key == "balanceToken" )			{ this.setBalanceToken(val) }
			if ( key == "secretWord" )				{ this.setSecretWord(val) }


 			if (this.debug)
 			{
 				console.log('YouboraData :: collectParams :: ' + key + ' :: ' + val);
 			}
	    }
	}
	catch(err)
	{ 
		if(this.debug)
		{
			console.log ( "YouboraData :: collectParams :: Error :: " + err); 	
		}
	}
};
  
YouboraData.prototype.setAccountCode = function( accountCode )
{
	try
	{ 
		if(typeof accountCode != "undefined" && accountCode.length > 1)
		{
			this.accountCode = accountCode;
		}   
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setAccountCode] :: " + err );
		}
	}    
};

YouboraData.prototype.getAccountCode = function ( )
{
	try
	{ 
		return this.accountCode; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getAccountCode] :: " + err );
		}
	}    
};

YouboraData.prototype.setService = function( service )
{
	try
	{ 
		if(typeof service != "undefined" && service.length > 1)
		{
			this.service = service;
		}   
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setService] :: " + err );
		}
	}    
};

YouboraData.prototype.getService = function ( )
{
	try
	{ 
		return this.service; 
	}
	catch ( err ) 
	{
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getService] :: " + err );
		}
	}    
};

YouboraData.prototype.setMediaResource = function( mediaResource )
{
	try
	{ 
		if(typeof mediaResource != "undefined" && mediaResource.length > 1)
		{
			this.mediaResource = mediaResource;
		}   
	}
	catch ( err ) { 
		
 		if (this.debug)
 		{
 			console.log ( "YouboraData :: Error [setMediaResource] :: " + err );
 		}
	}    
};

YouboraData.prototype.getMediaResource = function ( )
{
	try
	{ 
		return this.mediaResource; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getMediaResource] :: " + err );
		}
	}    
};

YouboraData.prototype.setTransaction = function( transaction )
{
	try
	{ 
		if(typeof transaction != "undefined" && transaction.length > 1)
		{
			this.transaction = transaction;
		}   
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setTransaction] :: " + err );
		}
	}
};

YouboraData.prototype.getTransaction = function ( )
{
	try
	{ 
		return this.transaction; 
	}
	catch ( err )
	{
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getTransaction] :: " + err );
		}
	}    

};

YouboraData.prototype.setUsername = function( username )
{
	try
	{ 
		if(typeof username != "undefined" && username.length > 1)
		{
			this.username = username;
		}  
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setUserName] :: " + err );
		}
	}    
};

YouboraData.prototype.getUsername = function( )
{
	try
	{ 
		return this.username; 
	}
	catch ( err )
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getUserName] :: " + err );
		}
	}    
};

YouboraData.prototype.setLive = function( bool )
{
	try
	{ 
		if ( typeof bool != "undefined" && (bool == true || bool == false) )
		{
			this.live = bool;
		}  
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setLive] :: " + err );
		}
	}    
};

YouboraData.prototype.getLive = function ( )
{
	try
	{ 
		return this.live; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getLive] :: " + err );
		}
	}
};
 
YouboraData.prototype.setResume = function( bool )
{
	try
	{ 
		if ( typeof bool != "undefined" && (bool == true || bool == false) )
		{
			this.resume = bool;
		}  
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setResume] :: " + err );
		}
	}    
};

YouboraData.prototype.getResume = function ( )
{
	try
	{ 
		return this.resume; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getResume] :: " + err );
		}
	}    
};

YouboraData.prototype.setContentId = function( contentId )
{
	try
	{ 
		if(typeof contentId != "undefined" && contentId.length > 1)
		{
			this.contentId = contentId;
		}  
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setContentId] :: " + err );
		}
	}    
};

YouboraData.prototype.getContentId = function( )
{
	try
	{ 
		return this.contentId; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getContentId] :: " + err );
		}
	}    

};

YouboraData.prototype.setProperties = function( propertiesObject )
{
	try
	{
		if( typeof propertiesObject == "string")
		{
			propertiesObject = JSON.parse(propertiesObject);
		}
		if(typeof propertiesObject != "undefined")
		{
			this.properties = propertiesObject;		
		}   
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setProperties] :: " + err );
		}
	}    
};

YouboraData.prototype.getProperties = function( )
{
	try
	{ 
		return this.properties;  
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getProperties] :: " + err );
		}
	}    
}; 

YouboraData.prototype.setJwplayerOverlayText = function(text)
{
	try
	{ 
		this.jwplayerOverlayText=text;
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setJwplayerOverlayText] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getJwplayerOverlayText = function()
{
	try
	{ 
		return this.jwplayerOverlayText;
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getJwplayerOverlayText] :: " + err );
		}
	}    
}; 

YouboraData.prototype.setJwplayerOverlayEnabled = function(enabled)
{
	try
	{ 
		if ( typeof enabled != "undefined" && (enabled == true || enabled == false) ){
			this.jwplayerOverlayEnabled =enabled;
		}
	}
	catch ( err ) 
	{ 
		console.log ( "YouboraData :: Error [setJwplayerOverlayEnabled] :: " + err ) 
	} 
};

YouboraData.prototype.getJwplayerOverlayEnabled = function()
{
	try
	{ 
		return this.jwplayerOverlayEnabled;
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getJwplayerOverlayEnabled] :: " + err );
		}
	}
};

YouboraData.prototype.setJwplayerOverlayTime = function(time)
{
	try
	{ 
		this.jwplayerOverlayTime = time;
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setJwplayerOverlayTime] :: " + err );
		}
	}    
};

YouboraData.prototype.getJwplayerOverlayTime = function()
{
	try
	{ 
		return this.jwplayerOverlayTime;
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getJwplayerOverlayTime] :: " + err );
		}
	}    
};

YouboraData.prototype.setJwplayerOverlayDuration = function(duration)
{
	try
	{ 
		this.jwplayerOverlayDuration =duration;
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setJwplayerOverlayDuration] :: " + err );
		}
	}    
};

YouboraData.prototype.getJwplayerOverlayDuration = function()
{
	try
	{ 
		return this.jwplayerOverlayDuration;
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getJwplayerOverlayDuration] :: " + err );
		}
	}    
};

YouboraData.prototype.setConcurrencyProperties = function( concurrencyPropertiesObject )
{
	try
	{
		if( typeof concurrencyPropertiesObject == "string")
		{
			concurrencyPropertiesObject = JSON.parse(concurrencyPropertiesObject);
		}
		if(typeof concurrencyPropertiesObject != "undefined")
		{
			this.concurrencyProperties.enabled = true;
			this.concurrencyProperties = concurrencyPropertiesObject;		
		}
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setConcurrencyProperties] :: " + err );
		}
	}    
};

YouboraData.prototype.getConcurrencyProperties = function( )
{
	try
	{ 
		return this.concurrencyProperties; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getConcurrencyProperties] :: " + err );
		}
	}    
}; 

YouboraData.prototype.setConcurrencyCode = function ( code )
{
	try
	{ 
		this.concurrencyProperties.enabled = true;
		this.concurrencyProperties.concurrencyCode = code; 
	}
	catch ( err )
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setConcurrencyCode] :: " + err );
		}
	}
}; 

YouboraData.prototype.getConcurrencyCode = function( )
{
	try
	{ 
		return this.concurrencyProperties.concurrencyCode; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getConcurrencyCode] :: " + err );
		}
	}    
};  	   

YouboraData.prototype.setConcurrencyService = function ( service )
{
	try
	{ 
		this.concurrencyProperties.enabled = true;
		this.concurrencyProperties.concurrencyService = service; 
	}
	catch ( err )
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setConcurrencyService] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getConcurrencyService = function( )
{
	try
	{ 
		return this.concurrencyProperties.concurrencyService; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getConcurrencyService] :: " + err );
		}
	}    
};  

YouboraData.prototype.getConcurrencySessionId = function( )
{
	try
	{ 
		return this.concurrencyProperties.concurrencySessionId; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getConcurrencySessionId] :: " + err );
		}
	}    
}; 

YouboraData.prototype.setConcurrencyMaxCount = function ( maxCount )
{
	try
	{ 
		this.concurrencyProperties.enabled = true;
		this.concurrencyProperties.concurrencyMaxCount = maxCount; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setConcurrencyMaxCount] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getConcurrencyMaxCount = function( )
{
	try
	{ 
		return this.concurrencyProperties.concurrencyMaxCount; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getConcurrencyMaxCount] :: " + err );
		}
	}    
};  	    

YouboraData.prototype.setConcurrencyRedirectUrl = function ( redirectUrl )
{
	try
	{ 
		this.concurrencyProperties.enabled = true;
		this.concurrencyProperties.concurrencyRedirectUrl = redirectUrl; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setConcurrencyRedirectUrl] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getConcurrencyRedirectUrl = function( )
{
	try
	{ 
		return this.concurrencyProperties.concurrencyRedirectUrl; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getConcurrencyRedirectUrl] :: " + err );
		}
	}    
};  	

YouboraData.prototype.setConcurrencyIpMode = function ( state )
{
	try
	{ 
		this.concurrencyProperties.enabled = true;
		this.concurrencyProperties.concurrencyIpMode = state; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setConcurrencyIpMode] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getConcurrencyIpMode = function( )
{
	try
	{ 
		return this.concurrencyProperties.concurrencyIpMode; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getConcurrencyIpMode] :: " + err );
		}
	}    
};  	 

YouboraData.prototype.setBalanceProperties = function( balancePropertiesObject )
{
	try
	{
		if( typeof balancePropertiesObject == "string")
		{
			balancePropertiesObject = JSON.parse(balancePropertiesObject);
		}

		if(typeof balancePropertiesObject != "undefined")
		{ 
			this.balanceProperties = balancePropertiesObject;		
		}   
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setBalanceProperties] :: " + err );
		}
	}    
};

YouboraData.prototype.getBalanceProperties = function( )
{
	try
	{ 
		return this.balanceProperties; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getBalanceProperties] :: " + err );
		}
	}    
}; 

YouboraData.prototype.setBalanceType = function ( type )
{
	try
	{  
		this.balanceProperties.balanceType = type; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setBalanceType] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getBalanceType = function( )
{
	try
	{ 
		return this.balanceProperties.balanceType; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getBalanceType] :: " + err );
		}
	}    
};  

YouboraData.prototype.setBalanceEnabled = function ( state )
{
	try
	{  
		this.balanceProperties.enabled = state; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setBalanceEnabled] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getBalanceEnabled = function( )
{
	try
	{ 
		return this.balanceProperties.enabled; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getBalanceEnabled] :: " + err );
		}
	}    
};  

YouboraData.prototype.setBalanceService = function ( serviceURL )
{
	try
	{  
		this.balanceProperties.service = serviceURL; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setBalanceService] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getBalanceService = function( )
{
	try
	{ 
		return this.balanceProperties.service; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getBalanceService] :: " + err );
		}
	}    
};  	

YouboraData.prototype.setBalanceZoneCode = function ( zoneCode )
{
	try
	{  
		this.balanceProperties.zoneCode = zoneCode; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setBalanceZoneCode] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getBalanceZoneCode = function( )
{
	try
	{ 
		return this.balanceProperties.zoneCode; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getBalanceZoneCode] :: " + err );
		}
	}    
};  	

YouboraData.prototype.setBalanceOriginCode = function ( originCode )
{
	try
	{  
		this.balanceProperties.originCode = originCode; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setBalanceOriginCode] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getBalanceOriginCode = function( )
{
	try
	{ 
		return this.balanceProperties.originCode; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getBalanceOriginCode] :: " + err );
		}
	}    
};  

YouboraData.prototype.setBalanceNVA = function ( NVA )
{
	try
	{  
		this.balanceProperties.niceNVA = NVA; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setBalanceNVA] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getBalanceNVA = function( )
{
	try
	{ 
		return this.balanceProperties.niceNVA; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getBalanceNVA] :: " + err );
		}
	}    
};  	

YouboraData.prototype.setBalanceNVB = function ( NVB )
{
	try
	{  
		this.balanceProperties.niceNVB = NVB; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setBalanceNVB] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getBalanceNVB = function( )
{
	try
	{ 
		return this.balanceProperties.niceNVB; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getBalanceNVB] :: " + err );
		}
	}    
};  	
YouboraData.prototype.setBalanceToken = function ( token )
{
	try
	{  
		this.balanceProperties.token = token; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setBalanceToken] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getBalanceToken = function( )
{
	try
	{ 
		return this.balanceProperties.token; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getBalanceToken] :: " + err );
		}
	}    
};   

YouboraData.prototype.setResumeProperties = function( resumePropertiesObject )
{
	try
	{
		if( typeof resumePropertiesObject == "string")
		{
			resumePropertiesObject = JSON.parse(resumePropertiesObject);
		}

		if(typeof resumePropertiesObject != "undefined")
		{ 
			this.resumeProperties = resumePropertiesObject;		
		}   
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setResumeProperties] :: " + err );
		}
	}    
};

YouboraData.prototype.getResumeProperties = function( )
{
	try
	{ 
		return this.resumeProperties; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getResumeProperties] :: " + err );
		}
	}    
}; 

YouboraData.prototype.setResumeEnabled = function ( state )
{
	try
	{  
		this.resumeProperties.resumeEnabled = state; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setResumeEnabled] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getResumeEnabled = function( )
{
	try
	{ 
		return this.resumeProperties.resumeEnabled; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getResumeEnabled] :: " + err );
		}
	}    
};  	 

YouboraData.prototype.setResumeCallback = function ( callback )
{
	try
	{  
		this.resumeProperties.resumeCallback = callback; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setResumeCallback] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getResumeCallback = function( )
{
	try
	{ 
		return this.resumeProperties.resumeCallback; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getResumeCallback] :: " + err );
		}
	}    
};  	

YouboraData.prototype.setResumeService = function ( serviceURL )
{
	try
	{  
		this.resumeProperties.resumeService = serviceURL; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setResumeService] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getResumeService = function( )
{
	try
	{ 
		return this.resumeProperties.resumeService; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getResumeService] :: " + err );
		}
	}    
};  	

YouboraData.prototype.setPlayTimeService = function ( serviceURL )
{
	try
	{  
		this.resumeProperties.playTimeService = serviceURL; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setPlayTimeService] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getPlayTimeService = function( )
{
	try
	{ 
		return this.resumeProperties.playTimeService; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getPlayTimeService] :: " + err );
		}
	}    
};  	

YouboraData.prototype.setDebug = function ( status ) 
{ 
	try
	{  
		this.debug = status; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setDebug] :: " + err );
		}
	}  
};

YouboraData.prototype.getDebug = function( )
{
	try
	{ 
		return this.debug; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getDebug] :: " + err );
		}
	}    
};  	

YouboraData.prototype.setZoneCode = function ( zoneCode ) 
{ 
	try
	{  
		this.zoneCode = zoneCode; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setZoneCode] :: " + err );
		}
	}  
};

YouboraData.prototype.getZoneCode = function( )
{
	try
	{ 
		return this.zoneCode; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getZoneCode] :: " + err );
		}
	}    
};  	

YouboraData.prototype.setOriginCode = function ( originCode ) 
{ 
	try
	{  
		this.originCode = originCode; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setOriginCode] :: " + err );
		}
	}  
};

YouboraData.prototype.getOriginCode = function( )
{
	try
	{ 
		return this.originCode; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getOriginCode] :: " + err );
		}
	}    
};  	 

YouboraData.prototype.setCDNNodeData = function ( value )
{
	try
	{  
		this.cdn_node_data = value; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setCDNNodeData] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getCDNNodeData = function( )
{
	try
	{ 
		return this.cdn_node_data; 
	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [getCDNNodeData] :: " + err );
		}
	}    
}; 

YouboraData.prototype.setSecretWord = function ( secretWord )
{
	try
	{  
		this.balanceProperties.secretWord = secretWord; 

	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [setSecretWord] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getSecretWord = function ( value )
{
	return this.balanceProperties.secretWord;
};  

YouboraData.prototype.setNiceTokenIp = function ( niceTokenIp )
{
	try
	{  
		this.balanceProperties.niceTokenIp = niceTokenIp; 

	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [niceTokenIp] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getNiceTokenIp = function ( value )
{
	return this.balanceProperties.niceTokenIp;
};  	

YouboraData.prototype.setExtraParams = function ( extraParams )
{
	try
	{  
		
		this.extraParams =  extraParams; 


	}
	catch ( err ) 
	{ 
 		if (this.debug)
 		{
			console.log ( "YouboraData :: Error [extraParams] :: " + err );
		}
	}    
}; 

YouboraData.prototype.getExtraParams = function ( value )
{
	return this.extraParams;
};


//---| YouboraData Variables |----------// 
var youboraData = new YouboraData();	
var spLoaded = false; 					
//--------------------------------------// 