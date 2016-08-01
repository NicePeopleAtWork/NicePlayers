/**
 * NicePeopleAtWork SmartPlugin 
 * SAMSUNG SMARTTV Player
 * Author: Lluís Campos Beltran
 * Date: 21/03/2014
**/

var Player = {
	widgetAPI: new Common.API.Widget(),
	tvKey: new Common.API.TVKeyValue(),		
	plugin: document.getElementById("pluginPlayer"),
	balancing: youboraData.getBalanceEnabled(),
	balanceObject: "",
	balanceIndex: 1,
	drmType : "none",
	isStartSent: false,
	url : null,
	playHead : 0,
	state : 0,
	skipState : -1,
	mode : 0,
	WINDOW : 0,
	FULLSCREEN : 1,
	STOPPED : 0,
	PLAYING : 1,
	PAUSED : 2,
	FORWARD : 1,
	REWIND : 2,	
	testPlay: function() { 
		Player.drmType = "none"
		var movie_url = "http://deslasexta.antena3.com/mp_series1/2012/09/10/00001.mp4";
		Player.Play(movie_url);		
	},
	testPlayWidevine: function() { 
		Player.drmType = "widevine"
		var movie_url = "";
		var license_url = "";
		var composedUrl = movie_url + "|DEVICE_ID=0" + "|DEVICE_TYPE_ID=60|STREAM_ID=0" + "|PORTAL=nicepeople" + "|DRM_URL="
				+ license_url + "&playbackmode=st" + "|COMPONENT=WV";
		Player.Play(composedUrl);		 
	},
	testPlayWmdrm: function() { 
		Player.drmType = "wmdrm"
		return false;
	},
	init: function() { 
		console.log('SmartPlugin :: SMAMSUNGTV-Player :: Init ::');
		console.log('SmartPlugin :: SMAMSUNGTV-Player :: Balancing :: '+ Player.balancing);
		Player.plugin.OnStreamInfoReady			=	 "Player.onStreamInfoReady;"
	    Player.plugin.OnBufferingStart 			=	 "Player.onBufferingStart";
	    Player.plugin.OnBufferingComplete 		=	 "Player.onBufferingComplete";
	    Player.plugin.OnCurrentPlayTime 		=	 "Player.onCurrentPlayTime";
	    Player.plugin.OnRenderingComplete 		=	 "Player.onRenderingComplete";
	    Player.plugin.OnAuthenticationFailed 	=	 "Player.onAuthenticationFailed";
	    Player.plugin.OnConnectionFailed 		=	 "Player.onConnectionFailed";
	    Player.plugin.OnNetworkDisconnected 	=	 "Player.onNetworkDisconnected";
	    Player.plugin.OnRenderError 			=	 "Player.onRenderError";
	    Player.plugin.OnStreamNotFound 			=	 "Player.onStreamNotFound";       
	    
		document.getElementById('anchor').focus();
		Player.widgetAPI.sendReadyEvent();
		Player.testPlay();
		
		return true;	 
	},
	setWindow: function() {
		Player.plugin.SetDisplayArea(0, 0, 472, 270);
	},
	keyHandler: function()	{		
	    var keyCode = event.keyCode;
	    event.preventDefault();
		console.log('SmartPlugin :: SMAMSUNGTV-Player :: keyHandler :: '+ keyCode);
	    switch (keyCode)
	    {
	        case 71:
	            Player.Play();
	            break;
	        case 70:
	            Player.Stop();
	            break;
	        case 74:
	            Player.Pause();
	            break;
	        case Player.tvKey.KEY_FF:
	            Player.seekForward();
	            break;
	        case Player.tvKey.KEY_RW:
	            Player.seekBackward();
	            break;
	    }
	}, 
	setBalancedResource: function(obj) {
	  Player.balanceObject = obj;
        if(obj != false)
        {
            if (typeof obj['1']['URL'] != "undefined") 
            { 
              console.log('SmartPlugin :: SMAMSUNGTV-Player :: Balance Current Resource  :: ' + youboraData.getMediaResource());
              console.log('SmartPlugin :: SMAMSUNGTV-Player :: Balance Priority Resource :: ' + obj['1']['URL']);

              if(obj['1']['URL'] != youboraData.getMediaResource())
              {
                console.log('SmartPlugin :: SMAMSUNGTV-Player :: Balancing :: ' + obj['1']['URL']); 
    			Player.state = 1;
    			SmartPlugin.Play(obj['1']['URL']);
    			Player.plugin.Play(obj['1']['URL']); 
    			Player.isStartSent = true;
              } 
              else {
                console.log('SmartPlugin :: SMAMSUNGTV-Player :: Balancer :: Same Resource');  
    			Player.state = 1;
    			SmartPlugin.Play(obj['1']['URL']);
    			Player.plugin.Play(obj['1']['URL']); 
    			Player.isStartSent = true;
              } 
           }
            else 
            {
            	console.log('SmartPlugin :: SMAMSUNGTV-Player :: Invalid balance object');
	   			Player.state = 1;
				SmartPlugin.Play(youboraData.getMediaResource());
				Player.plugin.Play(youboraData.getMediaResource()); 
    			Player.isStartSent = true;
            }
        }
        else 
        {
          console.log('SmartPlugin :: SMAMSUNGTV-Player :: Balance unavailable with current parameters');
		  Player.state = 1;
	   	  SmartPlugin.Play(youboraData.getMediaResource());
		  Player.plugin.Play(youboraData.getMediaResource());
		Player.isStartSent = true;
        }
	},
    refreshBalancedResource: function () {  
        console.log('SmartPlugin :: SMAMSUNGTV-Player :: Balancing to next resource due to error');
        try 
        {
            if(typeof Player.balanceObject[Player.balanceIndex]['URL'] != "undefined")
            {
        		Player.plugin.Stop();
                console.log('SmartPlugin :: SMAMSUNGTV-Player :: Balancing :: ' +Player.balanceObject[Player.balanceIndex]['URL']);
	   			Player.state = 1;
				SmartPlugin.Play(Player.balanceObject[Player.balanceIndex]['URL']);
				Player.plugin.Play(Player.balanceObject[Player.balanceIndex]['URL']); 
            }
            else
            {
                console.log('SmartPlugin :: SMAMSUNGTV-Player :: Balancer :: Error :: End of mirrors'); 
    			SmartPlugin.onConnectionFailed();
            }
        } 
        catch (e)
        {
            console.log('SmartPlugin :: SMAMSUNGTV-Player :: Balance Resource :: Error: '+ e); 
			SmartPlugin.onConnectionFailed();
        }
    },
	Play: function(url) {
		youboraData.setMediaResource(url);
		if (Player.balancing)
		{
			if(Player.isStartSent)
			{
				Player.balanceIndex = Player.balanceIndex + 1;
				Player.refreshBalancedResource();				
			}
			else
			{
				var path = url.replace(/^.*\/\/[^\/]+/, '')
				SmartPlugin.communicationClass.getBalancedResource(path, function(obj) { Player.setBalancedResource(obj); });
			}
		}
		else
		{
			Player.state = 1;
			SmartPlugin.Play(url);
			Player.plugin.Play(url);
		}
	},
	Stop: function() {
		Player.state = 0;
		SmartPlugin.Stop();
		Player.plugin.Stop();
		Player.isStartSent = false;
	},
	Pause: function(url) {
		if(Player.state == 2) {
			Player.state = 1;
			SmartPlugin.Resume();
			Player.plugin.Resume();			
		} else {
			Player.state = 2;
			SmartPlugin.Pause();
			Player.plugin.Pause();			
		}
	},
	Resume: function(url) {
		Player.state = 1;
		SmartPlugin.Resume();
		Player.plugin.Resume();
	},
	seekForward: function() {
		Player.plugin.JumpForward(30);
	},
	seekBackward: function() {
		Player.plugin.JumpBackward(30);
	},
	onStreamInfoReady: function() { SmartPlugin.onStreamInfoReady(); },
	onBufferingStart: function() { SmartPlugin.onBufferingStart(); },
	onBufferingComplete: function() { SmartPlugin.onBufferingComplete(); },
	onCurrentPlayTime: function(milliseconds) { SmartPlugin.onCurrentPlayTime(milliseconds); },
	onRenderingComplete: function() { SmartPlugin.onRenderingComplete(); },
	onAuthenticationFailed: function() { SmartPlugin.onAuthenticationFailed(); },
	onConnectionFailed: function() {
        console.log('SmartPlugin :: SMAMSUNGTV-Player :: Balancer :: Stop cause error'); 
		Player.plugin.Stop();
		if (Player.balancing)
		{  
			Player.balanceIndex = Player.balanceIndex + 1;
			Player.refreshBalancedResource();
		}
		else 
		{
			SmartPlugin.onConnectionFailed();
		}
	},
	onNetworkDisconnected: function() { SmartPlugin.onNetworkDisconnected(); },
	onRenderError: function() { SmartPlugin.onRenderError(); },
	onStreamNotFound: function() { SmartPlugin.onStreamNotFound(); }	
};