var Player = {

    widgetAPI: new Common.API.Widget(),
    tvKey: new Common.API.TVKeyValue(),
    plugin: null,
    drmType: "none",
    isStartSent: false,
    url: null,
    playHead: 0,
    state: 0,
    skipState: -1,
    mode: 0,
    WINDOW: 0,
    FULLSCREEN: 1,
    STOPPED: 0,
    PLAYING: 1,
    PAUSED: 2,
    FORWARD: 1,
    REWIND: 2,

    init: function() {
        /*
         * If the plugin is loaded, the initializer method has to be called:
         * SmartPlugin.init()
         */

        if (Player.plugin == null) {
            Player.plugin = document.getElementById("pluginPlayer");
        }

        Player.plugin.OnBufferingStart = "Player.onBufferingStart";
        Player.plugin.OnBufferingComplete = "Player.onBufferingComplete";
        Player.plugin.OnCurrentPlayTime = "Player.onCurrentPlayTime";
        Player.plugin.OnRenderingComplete = "Player.onRenderingComplete";
        Player.plugin.OnAuthenticationFailed = "Player.onAuthenticationFailed";
        Player.plugin.OnConnectionFailed = "Player.onConnectionFailed";
        Player.plugin.OnNetworkDisconnected = "Player.onNetworkDisconnected";
        Player.plugin.OnRenderError = "Player.onRenderError";
        Player.plugin.OnStreamNotFound = "Player.onStreamNotFound";

        document.getElementById('anchor').focus();
        Player.widgetAPI.sendReadyEvent();

        /*
         * Autoplay: Player.testPlay();
         */

        return true;
    },

    getESN: function() {
        var deviceId = null;
        try {
            var externalPlugin = document.getElementById('EXTERNALWIDGET');
            deviceId = externalPlugin.GetESN("WIDEVINE");
        } catch (e) {
            alert(e);
            return false;
        }
        return deviceId;
    },

    setWindow: function() {
        Player.plugin.SetDisplayArea(0, 0, 472, 270);
    },

    /* NUMBER KEY-CODES FROM 1 TO 9
    [TV Log] Widget Alert() : SmartPlugin :: SMAMSUNGTV-Player :: keyHandler :: 101
    [TV Log] Widget Alert() : SmartPlugin :: SMAMSUNGTV-Player :: keyHandler :: 98
    [TV Log] Widget Alert() : SmartPlugin :: SMAMSUNGTV-Player :: keyHandler :: 6
    [TV Log] Widget Alert() : SmartPlugin :: SMAMSUNGTV-Player :: keyHandler :: 8
    [TV Log] Widget Alert() : SmartPlugin :: SMAMSUNGTV-Player :: keyHandler :: 9
    [TV Log] Widget Alert() : SmartPlugin :: SMAMSUNGTV-Player :: keyHandler :: 10
    [TV Log] Widget Alert() : SmartPlugin :: SMAMSUNGTV-Player :: keyHandler :: 12
    [TV Log] Widget Alert() : SmartPlugin :: SMAMSUNGTV-Player :: keyHandler :: 13
    [TV Log] Widget Alert() : SmartPlugin :: SMAMSUNGTV-Player :: keyHandler :: 14
    [TV Log] Widget Alert() : SmartPlugin :: SMAMSUNGTV-Player :: keyHandler :: 17
    */

    keyHandler: function() {
        var keyCode = event.keyCode;
        event.preventDefault();
        alert('SmartPlugin :: SMAMSUNGTV-Player :: keyHandler :: ' + keyCode);
        switch (keyCode) {
            case 101: // Key '1'
                Player.testPlay();
                break;
            case 98: // Key '2'
                Player.testPlayHLS();
                break;
            case 6: // Key '3'
                Player.testPlayWidevine();
                break;
            case 8: // Key '4'
                Player.testPlayPlayready();
                break;
            case 9: // Key '5'
                Player.testPlayLiveHLS();
                break;

            case 71: // Play
                Player.Resume();
                break;
            case 70: // Stop
                Player.Stop();
                break;
            case 74: // Pause
                Player.Pause();
                break;
            case Player.tvKey.KEY_FF: // FF
                Player.seekForward();
                break;
            case Player.tvKey.KEY_RW: // RW
                Player.seekBackward();
                break;
            case tvKey.KEY_RETURN:
            case tvKey.KEY_PANEL_RETURN:
                alert("RETURN");
                widgetAPI.sendReturnEvent(); // Terminating an application
                // (Return Key)
                break;
            case tvKey.KEY_EXIT:
                alert("EXIT");
                widgetAPI.sendExitEvent(); // Terminating an application (Exit Key)
                break;
        }
    },

    testPlay: function() {
        Player.drmType = "none";
        var movie_url = "http://deslasexta.antena3.com/mp_series1/2012/09/10/00001.mp4";

        Player.Play(movie_url);
    },

    testPlayHLS: function() {
        Player.drmType = "none";
        var movie_url = "http://c.brightcove.com/services/mobile/streaming/index/master.m3u8?videoId=3747024716001&pubId=2564185535001|COMPONENT=HLS";

        Player.Play(movie_url);
    },

    testPlayWidevine: function() {
        try {
            alert("start testPlay Widevine");
            var deviceId = Player.getESN();
            var licenseUrl = "http://nws.nice264.com/Drm/wideVineLicense?transactionKey=&licenseHash=bf58599572693f4b8e98a49157a7d0a6&mediaHash=598b52607859d419d164&transactionTime=1337234985&qualityHash=widevine_mb_1&licenseToken=894dd3a44e335be16e065ec82cb4e3c4";
            var movie_url = "http://nws.nice264.com/vod/fill1/widevine_mb_1/598b52607859d419d164.wvm";
            var url = movie_url + "|DEVICE_ID=" + deviceId + "|DEVICET_TYPE_ID=60|STREAM_ID=|IP_ADDR=|DRM_URL=" + licenseUrl + "|ACK_URL=|HEARTBEAT_URL=|HEARTBEAT_PERIOD=30|I_SEEK=TIME|CUR_TIME=PTS|PORTAL=nicepeople|COMPONENT=WV";

            Player.Play(url);
        } catch (err) {
            alert(err);
        }

        /* Player.Play(composedUrl); */
    },

    testPlayPlayready: function() {
        try {
    		var LAURL = "http://playready.directtaps.net/pr/svc/rightsmanager.asmx";
    		var VideoURL = "http://playready.directtaps.net/smoothstreaming/TTLSS720VC1PR/To_The_Limit_720.ism/Manifest";

    		 if (Player.state == 1)
    	            Player.Stop();

    	     Player.state = 1;

    		//Buffering API's do not work in Emulator, work on TV
    		Player.plugin.InitPlayer(VideoURL+'|COMPONENT=WMDRM');
    		Player.plugin.SetPlayerProperty(4, LAURL, LAURL.length);
    		Player.plugin.StartPlayback();
    		
	        if (typeof $YB != 'undefined')
	            $YB.plugin.playHandler(VideoURL);

        } catch (err) {
            alert(err);
        }

        /* Player.Play(composedUrl); */
    },

    testPlayLiveHLS: function() {
        Player.drmType = "none";
        var movie_url = "http://vevoplaylist-live.hls.adaptive.level3.net/vevo/ch1/appleman.m3u8|COMPONENT=HLS";

        Player.Play(movie_url);
        
        setTimeout(function(){
        	$YB.notice($YB.plugin.yapi.resourceParser.realResource);
        }, 5000);
    },


    Play: function(url) {
        if (Player.state == 1)
            Player.Stop();

        Player.state = 1;

        if (typeof url != 'undefined')
            Player.plugin.Play(url);

        if (typeof $YB != 'undefined')
            $YB.plugin.playHandler(url);
    },

    Stop: function() {
        Player.state = 0;
        Player.plugin.Stop();
        Player.isStartSent = false;

        if (typeof $YB != 'undefined')
            $YB.plugin.stopHandler();
    },

    Pause: function(url) {
        if (Player.state == 2) { //Already paused, so resume
            Player.state = 1;
            Player.plugin.Resume();

            if (typeof $YB != 'undefined')
                $YB.plugin.resumeHandler();

        } else {
            Player.state = 2;
            Player.plugin.Pause();

            if (typeof $YB != 'undefined')
                $YB.plugin.pauseHandler();
        }
    },

    Resume: function(url) {
        Player.state = 1;
        Player.plugin.Resume();

        if (typeof $YB != 'undefined')
            $YB.plugin.resumeHandler();
    },

    seekForward: function() {
        alert('should seek >>');
        if (typeof $YB != 'undefined')
            $YB.plugin.seekingHandler();
        Player.plugin.JumpForward(30);
    },

    seekBackward: function() {
        alert('should seek <<');
        if (typeof $YB != 'undefined')
            $YB.plugin.seekingHandler();
        Player.plugin.JumpBackward(30);
    },

    onBufferingStart: function() {
        if (typeof $YB != 'undefined')
            $YB.plugin.bufferingHandler();
    },

    onBufferingComplete: function() {
        if (typeof $YB != 'undefined')
            $YB.plugin.bufferedHandler();
    },

    onCurrentPlayTime: function(milliseconds) {
        if (typeof $YB != 'undefined')
            $YB.plugin.playtimeHandler(milliseconds);
    },

    onRenderingComplete: function() {
        try {
            Player.Stop();
        } catch (err) {
            console.log(err);
            alert(err);
        }
    },

    onAuthenticationFailed: function() {
        if (typeof $YB != 'undefined') {
            $YB.plugin.errorHandler('Authentication failed');
            $YB.plugin.stopHandler();
        }
    },

    onConnectionFailed: function() {
        if (typeof $YB != 'undefined') {
            $YB.plugin.errorHandler('Connection failed');
            $YB.plugin.stopHandler();
        }
    },

    onNetworkDisconnected: function() {
        if (typeof $YB != 'undefined') {
            $YB.plugin.errorHandler('Network Disconnected');
            $YB.plugin.stopHandler();
        }
    },

    onRenderError: function() {
        if (typeof $YB != 'undefined') {
            $YB.plugin.errorHandler('Render Error');
            $YB.plugin.stopHandler();
        }
    },

    onStreamNotFound: function() {
        if (typeof $YB != 'undefined') {
            $YB.plugin.errorHandler('Stream not found');
            $YB.plugin.stopHandler();
        }
    }
};
