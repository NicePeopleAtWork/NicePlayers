/*
 * Youbora Device & Player Detector
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Lluí­s Campos Beltran
 * Author: Miguel Angel Zambrana
 * Author: Ferran Guti
 * Version: 1.0
 * 			- Detect Devices and Tech (Support HTML5, JWPlayer, Ooyala, PlayStation 3 and PhillipsTV)
 * Version: 1.1
 *			- Detect Samsung SMARTTV and BrightCove
 */

var spYoubora = 
{
	debug: youboraData.getDebug(), 
	foundDevice: false,
	foundTechnology: "", 
	loadedLibs: false,
	userAgent: navigator.userAgent.toLowerCase(),
	isSPYouboraLodad: false,
	youboraVersion: "1.1",
	youboraServer: "http://smartplugin.youbora.com/",
	urlLibs: "/js/libs/",
	urlBaseJS: "/js/", 	
	init: function() 
	{
		if(!spYoubora.isSPYouboraLodad) {
			spYoubora.isSPYouboraLodad = true;
  			
  			spYoubora.urlLibs = spYoubora.youboraServer + spYoubora.youboraVersion + spYoubora.urlLibs;
  			spYoubora.urlBaseJS = spYoubora.youboraServer + spYoubora.youboraVersion + spYoubora.urlBaseJS;
  			
  			if(this.debug)
  			{
				console.log('spYoubora :: Init'); 
			} 

			if ( spYoubora.debug ) 
			{  
				console.log('spYoubora :: Current User-Agent: ' + spYoubora.userAgent);
				console.log('spYoubora :: Checking Device...');
			} 

			spYoubora.checkDevice();

			if ( spYoubora.debug ) 
			{  
				console.log('spYoubora :: Checking Technology...');
			}

			spYoubora.checkTechnology();

			if ( spYoubora.debug ) 
			{  
				console.log('spYoubora :: Checking Add libraries...');
			}

			spYoubora.addLibraries();
		} 
		else 
		{
			if ( spYoubora.debug ) 
			{ 
				console.log ( "spYoubora :: Already Initialized... ");
			}
		}
	}, 
	deviceNames: 
	{
	  	UNKNOWN: 	0,
	    IPHONE: 	1,
	    IPAD: 		2,
	    ANDROID2: 	3,
	    ANDROID4: 	4,
	    PS3: 		5,
	    PS4: 		6,
	    APPLETV: 	7,
	    LGTV: 		8,
	    SAMSUNGTV: 	9,
	    PHILIPSTV: 10,
	    ROKU: 	   11,
	    PC: 	   12,
	    MAC: 	   13,
	    PANASONIC: 14,
	    SONY: 	   15
	},
	checkDevice: function() 
	{
		if 		( spYoubora.userAgent.search("iphone")			>-1 ) { spYoubora.foundDevice = spYoubora.deviceNames.IPHONE; }
		else if ( spYoubora.userAgent.search("ipad")			>-1 ) { spYoubora.foundDevice = spYoubora.deviceNames.IPAD; }
		else if ( spYoubora.userAgent.search("android 2")		>-1 ) { spYoubora.foundDevice = spYoubora.deviceNames.ANDROID2; }
		else if ( spYoubora.userAgent.search("android 4")		>-1 ) { spYoubora.foundDevice = spYoubora.deviceNames.ANDROID4; }
		else if ( spYoubora.userAgent.search("playstation 3")	>-1 ) { spYoubora.foundDevice = spYoubora.deviceNames.PS3; }
		else if ( spYoubora.userAgent.search("playstation 4")	>-1 ) { spYoubora.foundDevice = spYoubora.deviceNames.PS4; } 
		else if ( spYoubora.userAgent.search("appletv")			>-1 ) { spYoubora.foundDevice = spYoubora.deviceNames.APPLETV; } 
		else if ( spYoubora.userAgent.search("lgtv")			>-1 ) { spYoubora.foundDevice = spYoubora.deviceNames.LGTV; } 
		else if ( spYoubora.userAgent.search("smarttv")			>-1 ) { spYoubora.foundDevice = spYoubora.deviceNames.SAMSUNGTV; } 
		else if ( spYoubora.userAgent.search("philipstv")		>-1 ) { spYoubora.foundDevice = spYoubora.deviceNames.PHILIPSTV; } 
		else if ( spYoubora.userAgent.search("philips")			>-1 ) { spYoubora.foundDevice = spYoubora.deviceNames.PHILIPSTV; }
		else if ( spYoubora.userAgent.search("roku")			>-1 ) { spYoubora.foundDevice = spYoubora.deviceNames.ROKU; } 
		else if ( spYoubora.userAgent.search("x86")				>-1 ) { spYoubora.foundDevice = spYoubora.deviceNames.PC; } 
		else if ( spYoubora.userAgent.search("x64")				>-1 ) { spYoubora.foundDevice = spYoubora.deviceNames.PC; } 
		else if ( spYoubora.userAgent.search("wow64")			>-1 ) { spYoubora.foundDevice = spYoubora.deviceNames.PC; } 
		else if ( spYoubora.userAgent.search("macintosh")		>-1 ) { spYoubora.foundDevice = spYoubora.deviceNames.MAC; } 
		else if ( spYoubora.userAgent.search("viera")			>-1 ) { spYoubora.foundDevice = spYoubora.deviceNames.PANASONIC; } 
		else if ( spYoubora.userAgent.search("sonydtv")			>-1 ) { spYoubora.foundDevice = spYoubora.deviceNames.SONYTV; } 
		else if	( spYoubora.foundDevice 				   == false ) { spYoubora.foundDevice = spYoubora.deviceNames.UNKNOWN; }
	},
	technologyNames: 
	{
		UNKNOWN: 	0,
		HTML5: 		1,
		JWPLAYER: 	2,
		OOYALA: 	3,
		BCOVER: 	4
	},
	checkTechnology: function() 
	{ 
		try
		{
			if ( spYoubora.foundDevice == spYoubora.deviceNames.PC || spYoubora.foundDevice == spYoubora.deviceNames.MAC ) 
			{ 
				spYoubora.foundTechnology = spYoubora.technologyNames.UNKNOWN; 
				var video = null;

				try
				{
					video = document.getElementsByTagName("video")[0];
				}
				catch ( error )
				{
					console.log ( "spYoubora :: Error Msg: " + error );
				}

				if ( typeof OO != "undefined")
				{
					spYoubora.foundTechnology = spYoubora.technologyNames.OOYALA;
				}
				else if ( typeof jwplayer != "undefined" )
				{
					spYoubora.foundTechnology = spYoubora.technologyNames.JWPLAYER; 
				}
				else if ( typeof brightcove != "undefined")
				{
					spYoubora.foundTechnology = spYoubora.technologyNames.BCOVER; 
				}
				else if ( video != null )
				{
					spYoubora.foundTechnology = spYoubora.technologyNames.HTML5;
				}
			}
			else
			{
				spYoubora.foundTechnology = spYoubora.technologyNames.UNKNOWN; 

				if ( typeof jwplayer != "undefined" )
				{
					spYoubora.foundTechnology = spYoubora.technologyNames.JWPLAYER; 
				}
				else if ( typeof brightcove != "undefined")
				{
					spYoubora.foundTechnology = spYoubora.technologyNames.BCOVER; 
				}
			}
 		}
 		catch ( err )
 		{
			if ( spYoubora.debug ) 
			{ 
 				console.log ( "spYoubora :: Error Msg: " + err );
 			}
 		}
	},
	addLibraries: function()
	{
		if ( spYoubora.debug )
		{ 
			console.log ( "spYoubora :: Found Device     :: " + spYoubora.foundDevice );
			console.log ( "spYoubora :: Found Technology :: " + spYoubora.foundTechnology ); 
		}

		if ( spYoubora.foundDevice == spYoubora.deviceNames.PC && spYoubora.foundTechnology == spYoubora.technologyNames.HTML5 )
		{
			if ( spYoubora.isYouboraApiLoaded () == false )
				 spYoubora.loadJavascriptFile ( spYoubora.urlLibs + 'youbora-api.js' , function () {} );

			if ( spYoubora.isSmartPluginLoaded () == false )
				 spYoubora.loadJavascriptFile ( spYoubora.urlBaseJS + 'pc-html5/sp.js' , function () { SmartPlugin.Init(); } );
			else
				 SmartPlugin.Init();
		}
		else if ( spYoubora.foundTechnology == spYoubora.technologyNames.HTML5 )
		{
			if ( spYoubora.isYouboraApiLoaded () == false )
				 spYoubora.loadJavascriptFile ( spYoubora.urlLibs + 'youbora-api.js' , function () {} );

			if ( spYoubora.isSmartPluginLoaded () == false )	
				 spYoubora.loadJavascriptFile ( spYoubora.urlBaseJS + 'pc-html5/sp.js' , function () { SmartPlugin.Init(); } );
			else
				 SmartPlugin.Init();
		}
		else if ( spYoubora.foundTechnology == spYoubora.technologyNames.JWPLAYER )
		{
			if ( spYoubora.isYouboraApiLoaded () == false ) 
				 spYoubora.loadJavascriptFile ( spYoubora.urlLibs + 'youbora-api.js', function () {}  );

			if ( spYoubora.isSmartPluginLoaded () == false )
				 spYoubora.loadJavascriptFile ( spYoubora.urlBaseJS + 'all-jwplayer/sp.js', function () {}  );
		} 
		else if ( spYoubora.foundTechnology == spYoubora.technologyNames.OOYALA )
		{

			if ( spYoubora.isYouboraApiLoaded () == false )
				 spYoubora.loadJavascriptFile ( spYoubora.urlLibs + 'youbora-api.js' , function () {} );
 
			if ( spYoubora.isSmartPluginLoaded () == false )
				 spYoubora.loadJavascriptFile ( spYoubora.urlBaseJS + 'pc-ooyala/sp.js' , function () { SmartPlugin.Init(); } );	 
			else
				 SmartPlugin.Init();
		}
		else if ( spYoubora.foundTechnology == spYoubora.technologyNames.BCOVER )
		{
			if ( spYoubora.isYouboraApiLoaded () == false )
				 spYoubora.loadJavascriptFile ( spYoubora.urlLibs + 'youbora-api.js' , function () {} );

			if ( spYoubora.isSmartPluginLoaded () == false )
				 spYoubora.loadJavascriptFile ( spYoubora.urlBaseJS + 'pc-bcove/sp.js' , function () { SmartPlugin.Init(); } );	 
		}
		else if ( spYoubora.foundDevice == spYoubora.deviceNames.PS3 )
		{
			if ( spYoubora.isYouboraApiLoaded () == false )
				 spYoubora.loadJavascriptFile ( spYoubora.urlLibs + 'youbora-api.js', function () {} );

			if ( spYoubora.isSmartPluginLoaded () == false )
				 spYoubora.loadJavascriptFile ( spYoubora.urlBaseJS + 'ps3-webmaf/sp.js', function () { SmartPlugin.Init(); } );
			else
				 SmartPlugin.Init();
		}

		else if ( spYoubora.foundDevice == spYoubora.deviceNames.PHILIPSTV )
		{
			if ( spYoubora.isYouboraApiLoaded () == false ) 
				 spYoubora.loadJavascriptFile ( spYoubora.urlLibs + 'youbora-api.js', function () {} );
			
			if ( spYoubora.isSmartPluginLoaded () == false )
				 spYoubora.loadJavascriptFile ( spYoubora.urlBaseJS + 'phillips/sp.js' , function () { SmartPlugin.Init();} ); 
			else
				 SmartPlugin.Init();

		}  
		else if ( spYoubora.foundDevice == spYoubora.deviceNames.SAMSUNGTV )
		{ 
			if ( spYoubora.isYouboraApiLoaded () == false )
				 spYoubora.loadJavascriptFile ( spYoubora.urlLibs + 'youbora-api.js', function () {} );
			
			if ( spYoubora.isSmartPluginLoaded () == false )
				 spYoubora.loadJavascriptFile ( spYoubora.urlBaseJS + 'tv-samsung/sp.js' , function () { SmartPlugin.Init();} );
			else
				 SmartPlugin.Init(); 
		} 
		else if ( spYoubora.foundDevice == spYoubora.deviceNames.PANASONIC )
		{ 
			if ( spYoubora.isYouboraApiLoaded () == false )
				 spYoubora.loadJavascriptFile ( spYoubora.urlLibs + 'youbora-api.js', function () {} );
			
			if ( spYoubora.isSmartPluginLoaded () == false )
				 spYoubora.loadJavascriptFile ( spYoubora.urlBaseJS + 'tv-panasonic/sp.js' , function () { SmartPlugin.Init();} );
			else
				 SmartPlugin.Init(); 
		} 
		else if ( spYoubora.foundDevice == spYoubora.deviceNames.SONYTV )
		{ 
			if ( spYoubora.isYouboraApiLoaded () == false )
				 spYoubora.loadJavascriptFile ( spYoubora.urlLibs + 'youbora-api.js', function () {} );
			
			if ( spYoubora.isSmartPluginLoaded () == false )
				 spYoubora.loadJavascriptFile ( spYoubora.urlBaseJS + 'tv-sony/sp.js' , function () { SmartPlugin.Init();} );
			else
				 SmartPlugin.Init(); 
		} 
		else
		{
			if ( spYoubora.debug ) 
			{ 
				console.log ( "spYoubora :: No devices found..." );
			}
		}
	},
	isYouboraDataLoaded: function ()
	{
		var isLoaded = false;

		if ( typeof YouboraData == "function" )				isLoaded = true;
		else 												isLoaded = false; 

		if ( spYoubora.debug ) 
			 console.log ( "spYoubora :: YouboraData is loaded :: " + isLoaded );
		

		return isLoaded; 
	},  
	isYouboraApiLoaded: function ()
	{
		var isLoaded = false;

		if ( typeof YouboraCommunication == "function" )	isLoaded = true;
		else 												isLoaded = false;
		
		if ( spYoubora.debug ) 
	 		 console.log ( "spYoubora :: YouboraApi is loaded :: " + isLoaded );

		return isLoaded;
	},
	isSmartPluginLoaded: function ()
	{
		var isLoaded = false;

		if ( typeof SmartPlugin !== "undefined" )			isLoaded = true;
		else 												isLoaded = false;

		if ( spYoubora.debug ) 
			 console.log ( "spYoubora :: SmartPlugin is loaded :: " + isLoaded );

		return isLoaded;
	},
	loadJavascriptFile: function(url, callback) 
	{ 
		try 
		{
			if ( spYoubora.debug )
			{
				console.log ( "spYoubora :: Load JS File :: " + url );
			}

		    var head 	= document.getElementsByTagName('head')[0];
		    var script 	= document.createElement('script');
		    script.type = 'text/javascript';
		    script.src 	= url;
		 	
		    script.onreadystatechange 	= callback;
		    script.onload 				= callback;
		 
	    	head.appendChild(script);  

		}
		catch ( err ) 
		{
			if ( spYoubora.debug ) 
				 console.log ( "spYoubora :: loadJavascriptFile :: Error :: " + err );
		}
	},
	getYouboraVersion: function()
	{
		return spYoubora.youboraVersion;
	}
}

try
{
	window.onload 		= function () { spYoubora.init(); } 
	document.onload 	= function () { spYoubora.init(); } 
}
catch (err)
{ 
	try 
	{
		document.onload 	= spYoubora.init();
		window.onload 		= spYoubora.init();
	}
	catch (err)
	{
		if ( spYoubora.debug ) 
			 console.log ( "spYoubora :: Error Init 2: " + err );
	}

	if ( spYoubora.debug ) 
		 console.log ( "spYoubora :: Error Init: " + err );
} 
