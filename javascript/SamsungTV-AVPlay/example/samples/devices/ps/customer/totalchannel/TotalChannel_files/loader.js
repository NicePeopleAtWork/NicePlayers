
try {
	
	// Global config changes
    if(TVA && TVA.GUI)
    {
        TVA.GUI.BANNERURL = "http://devices.totalchannel.tv/resources/smarttv/banners/login.bein.jpg?nc="+((new Date()).getDate());
    }
    
    if(TVA && TVA.OTT)
    {
        if(TVA.OTT.DEVICETYPE)
        {
            switch (TVA.OTT.DEVICETYPE)
            {
                    case 1000: // PC
                        break;
                    case 2000: // iPad
                        break;
                    case 2200: // Android
                        break;
                    case 3000: // Samsung
                        SAMSUNG_HACKS();
                        break;
                    case 3001: // LG
                        LG_HACKS();
                        break;
                    case 4000: // PlayStation
                        break;
                    case 4001: // PlayStation 4
                        break;
                    case 4002: // Sony Bravia
                        break;
                    default: 
                        break;
            }
        }
        
        if(TVA.OTT.VER)
        {
            switch(TVA.OTT.VER)
            {
                    case "#VX#": // DEBUG
                        break;
                    default: 
                        break;
            }
        }
        
        // Move focus
        
        $(document).ready(function() {
            try {
                $("#messages-image-right").css({left:'1225px',top:'334px'});
                $("#messages-image-left").css({left:'3px',top:'334px'});
            } catch(dre) {}
        });

        ALL_HACKS();

    }
}
catch(hex)
{
    // Error loading helper
    // alert(hex);
}

function ALL_HACKS()
{
    if(API.authSuccess && Main.onLoad)
    {

        API._authSuccess = API.authSuccess;
        API.authSuccess = function(data,status,xhr,onSuccessCallback)
        {
            Main.onLoadLastCall=0;
            API.numInitErrors = 0;
            return API._authSuccess(data,status,xhr,onSuccessCallback);
        };

        Main._onLoad = Main.onLoad;
        Main.onLoadLastCall=0;
        Main.onLoad = function()
        {
            var nw = 0;
            // Wew don't know if all the devices can use Utils.now
            if(typeof Utils != 'undefined' && typeof Utils.now != 'undefined')
            {
                nw = Utils.now();
            }
            else
            {
                nw = (new Date()).getTime();
            }

            var dif = nw-Main.onLoadLastCall;

            if(API.numInitErrors<=0)
            {
                Main.onLoadLastCall = nw;
                Main._onLoad();
                return;
            }

            if(dif<10*1e3 && API.numInitErrors!=5)
            {
                API.numInitErrors+=4;
                setTimeout(Main.onLoad,10*1e3-dif+10);
            }
            else
            {
                API.numInitErrors++;
                Main.onLoadLastCall = nw;
                Main._onLoad();
            }

        };

    }
	
	API.removeRequest = function(xhr) {
		Debug.log("API.removeRequest from loader");
		try {
			if(!xhr) return;
			var settings = xhr.jqSettings;
			for(var k in this.requests) if(this.requests.hasOwnProperty(k)) {
				if(this.requests[k].apiId==settings.apiId) {
					this.requests.splice(k,1);
				}
			}
		} catch(e) {}
	};

    TEMP_HACKS();
}

function TEMP_HACKS()
{

    PopUp.loadExternal = function (url,fn) {

        //stop the sync
        clearInterval(API.pairingTimeout);
        API.pairingTimeout = null;

        if(url=="login.html" && TVA.GUI.REGISTER==false) {
            PopUp.goFrame("login-login");
            return;
        }

        PopUp.blur();
        View.loaderShow($("#messages-frame").css('zIndex'));
        setTimeout(function() {
            $("#messages-frame").load(url,function() {
                $(".servicename").html(TVA.OTT.SERVICE);

                try {
                    TVA.putInnerHTML(document.getElementById("CONDICIONESTXT"),TVA.login.CONDICIONES);
                    TVA.putInnerHTML(document.getElementById("PPRIVTXT"),TVA.login.PPRIV);
                    TVA.putInnerHTML(document.getElementById("CHECKBOXTXT"),TVA.login.CHECKBOX);
                } catch(e) {}

                fn();
                View.loaderHide();
                if(url=="login.html")
                {
                    // Start pairing again
                    clearInterval(API.pairingTimeout);
                    if(TVA.OTT.PAIRING!==false)
                    {
                        API.pairingTimeout = setInterval(API.authDevice, 10000);
                    }


                    var bannerUrl = ( TVA.GUI.BANNERURL && TVA.GUI.BANNERURL.length ) ? TVA.GUI.BANNERURL : ("http://devices.totalchannel.tv/resources/smarttv/banners/login.002.jpg?nc="+((new Date()).getDate()));
					Debug.log("BN:plugin:"+bannerUrl);
					
                    $("<img/>")
                        .load(function() {
                            // Ok, set banner
                            $(".bloquebanner").css('background-image', 'url(' + bannerUrl + ')').removeClass("bloquebanner-border");
                        })
                        .error(function() {
                            // Load banner block and if it fails... reposition layers
                            var bb = $(".bloquebanner");
                            var h = bb.height();
                            bb.addClass("hide-this");
                            $(".bloquetexto").css({height: Math.round(h/4)+"px"});
                            $(".wrapperlogin").find(".logo").css({"marginTop": Math.round(h/2)+"px"});
                        })
                        .attr("src", bannerUrl );
                }
            });
        },200);
    };

    PopMsg._firstInit = true;
    PopMsg._called = false;
    PopMsg.init = function() {

        if(!API.initialized && PopMsg._firstInit==true)
        {
            PopMsg._firstInit = false;
            setTimeout("PopMsg.init();",4*1e3);
            return;
        }
        else if(!API.initialized)  {
            PopMsg._firstInit = false;
            setTimeout("PopMsg.init();",60*1e3);
            return;
        }
        PopMsg._firstInit = false;
        if(PopMsg._called==true)
        {
            return;
        }
        PopMsg._called = true;
        API.call({
            url:API.base_url + 'messages',
            data:{
                deviceType: TVA.OTT.DEVICETYPE
            },
            errorWrapper: false,
            errorCode: -1,
            emptyResponseAllowed:true,
            hideLoader:true,
            success:function (data, status, xhr) {
                if(xhr && xhr.status==200 && data && data.data) {
                    PopMsg.mapping = data.data;
                }
            }
        });
    };

    try {

        // If hack is not applied from source ... hack now!
        if(!OTTAnalytics.sendErrorV2 && !OTTAnalytics._oldSendError) {
            OTTAnalytics._oldSendError = OTTAnalytics.sendError;
            OTTAnalytics.sendError  = function (nr,errorCode) {
                // Hide popup before sending an error
                if(View.actualPageIs(PopUp)) {
                    PopUp.deInitView();
                }
                try {
                    if(typeof SmartPlugin !== "undefined" && SmartPlugin.communicationClass) {
                        var msg = null;
                        switch(nr)
                        {
                            case 51: // La petición ha caducado, por favor vuelva a intentarlo
                                msg = 6000; // 'CONNECTION FAILED';
                                break;
                            case 47: // Este contenido todavía no está disponible para este dispositivo
                                // AP01
                                msg = 6003; // 'STREAM NOT FOUND';
                                break;
                            case 34: // Ocurrió un error al reproducir el contenido
                                switch(errorCode)
                                {
                                    case 'CONF01': // Connection failed
                                        msg = 6000; // 'CONNECTION FAILED';
                                        break;
                                    case 'VPLC02': // Error de timeout
                                        msg = 6000; // 'CONNECTION FAILED';
                                        break;
                                    case 'VPCN09': //  Mensaje de play error recibido
                                        msg = 6002; // 'RENDER ERROR';
                                        break;
                                    case 'REND01':
                                        msg = 6002; // 'RENDER ERROR';
                                        break;
                                    case 'STRM01':
                                        msg = 6003; // 'STREAM NOT FOUND';
                                        break;
                                    case 'SMTBTO01': // Smart error
                                        msg = 6002; // 'RENDER ERROR';
                                        break;
                                    case 'VPLC01': //  Error de status = finished
                                        msg = 6002; // 'RENDER ERROR';
                                        break;
                                    case 'VEV01':  //  Error de samsung cuando se queda congelada la imagen
                                        msg = 6002; // 'RENDER ERROR';
                                        break;
                                    case 'AUTH01':
                                        msg = 6004; // 'AUTHENTICATION FAILED';
                                        break;
                                    case 'TVAS01': // Error de Tizen / prepareAsync => Fallo de DRM/AUTH
                                        msg = 6004; // 'AUTHENTICATION FAILED';
                                        break;
                                    default:
                                        // PS errors ...
                                        msg = 6000; // 'CONNECTION FAILED';
                                        break;
                                }
                                break;
                        }
                        if(msg!==null)
                        {
                            // We append suffix and if plugin supports it... we will append it
                            SmartPlugin.communicationClass.sendError(msg,"[nr:"+nr+":"+errorCode+"]");
                            return;
                        }

                    }
                } catch(se) {
                }
                // We do not have time to test, so call the old method if we reach the end of this function
                return OTTAnalytics._oldSendError(nr,errorCode);
            };
        }
    } catch(el) {}
}
////////////////////////////////////////////////////////////////////////
// SAMSUNG : START /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

function SAMSUNG_HACKS()
{
    TVA_Widevine._getESN = TVA_Widevine.getESN;
    TVA_Widevine.getESN = function () {

        var c = TVA_Widevine._getESN();
        
        // If GetESN("WIDEVINE") failed... try to get the MAC
        if(c==="" || c===false || c==="false" || c==="FALSE"  || c==null || c==="null" || c==="NULL" || typeof c === "undefined")
        {
            var mac = "";
            try
            {
                if(TVA && TVA.network)
                {
                    mac = "MC-"+TVA.network.GetMAC(1);
                }
            } catch(ex)
            {
            }
            c=mac;
        }
        
        // If MAC failed ... generate UUID cookie value
        if(c==="" || c===false || c==="false" || c==="FALSE"  || c==null || c==="null" || c==="NULL" || typeof c === "undefined")
        {
            var uid = "";
            try
            {
                uid = totalChannelStorage.getItem("uid");
                if(uid===null || uid=='' || typeof uid==='undefined') {
                    uid = "UU-"+Utils.UUID();
                    totalChannelStorage.setItem("uid",uid, true);
                }
            } catch(ex)
            {
            }
            c = uid;
        }
        
        return c;
    };
    
    TVA.getDeviceId = function() {
        return TVA_Widevine.getESN();
    };

    TVA.getOriginalESN = function() {
        try {
            var b = document.getElementById("externalPlugin");
            if (b != null) {
            } else {
                var d = document.createElement("span");
                d.setAttribute("id", "TVA_ESNpluginBox");
                TVA.putInnerHTML(d, '<object id="externalPlugin" '+'border="0" classid="clsid:SAMSUNG-INFOLINK-EXTERNALWIDGETINTERFACE"  style="position:absolute; visibility:hidden"></object>');
                document.getElementById("body").appendChild(d);
                b = document.getElementById("externalPlugin")
            }
            var c = null;
            try { c = b.GetESN("WIDEVINE"); } catch (a) { }
        } catch(a2) { }
        return c;
    };
    
    TVA.getInfo = function() {
        
        var c = document.getElementById("pluginObjectNNavi");
        var pfw = ""; try { pfw = c.GetFirmware(); } catch(ex1) {}
        var pmc = ""; try { pmc = c.GetModelCode(); } catch(ex2) {}
        
        var ret = null;
        try { 
            ret = JSON.stringify({
                dev: TVA.device,
                fw: pfw,
                mc: pmc,
                ua: navigator.userAgent,
                oesn: TVA.getOriginalESN(),
                esn: TVA_Widevine.getESN()
            });
        } catch(esn) { }
        
        return ret;
    };

    // NICE: GET CORRECT BITRATE
	if(!TVA_Player._nyap_play) {
        TVA_Player._nyap_play = TVA_Player.play;
        TVA_Player.play = function (p1, p2) {

            try {
                if (SmartPlugin && SmartPlugin.communicationClass && !SmartPlugin.communicationClass._sendPingTotalBitrate) {

                    SmartPlugin.communicationClass._sendPingTotalBitrate = SmartPlugin.communicationClass.sendPingTotalBitrate;
                    SmartPlugin.communicationClass.sendPingTotalBitrate = function (brp1, brp2) {
                        try {
                            if(isNaN(brp1) || brp1*1<=0) {
                                brp1 = 1*TVA_Player.player.Execute('GetCurrentBitrates');
                            }
                        } catch (e1) { }
                        // Debug.log("PING "+brp1+" :: "+brp2);
                        return SmartPlugin.communicationClass._sendPingTotalBitrate(brp1, brp2);
                    };

                }
            } catch (e2) {
            }
            return TVA_Player._nyap_play(p1, p2);
        };
    }
}

////////////////////////////////////////////////////////////////////////
// SAMSUNG : END ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
// LG : START //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

function LG_HACKS()
{
    try {
        if(!TVA_Player._loader_play) {
            TVA_Player._loader_play = TVA_Player.play;
            TVA_Player.play = function() {

                // Override SmartPlugin.getBitrate method once
                try {
                    if (!SmartPlugin._getBitrate) {
                        SmartPlugin._getBitrate = SmartPlugin.getBitrate;
                        SmartPlugin.getBitrate = function () {
                            try {
                                var playInfo = SmartPlugin.player.mediaPlayInfo();
                                if (SmartPlugin.player.type === 'application/vnd.ms-sstr+xml' && playInfo.bitrateInstant<10000) {
                                    return playInfo.bitrateInstant * 1000;
                                }
                                else {
                                    return playInfo.bitrateInstant;
                                }
                            }
                            catch (e) {
                            }
                             // In case of error try NPAW bitrate
                            return SmartPlugin._getBitrate();
                        };
                    }
                } catch(e) {}

                return TVA_Player._loader_play.apply(TVA_Player,arguments);
            }
        }
    } catch(e) { }
}

////////////////////////////////////////////////////////////////////////
// LG : END ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////


try {

    $._ottAjaxCall = $.ajax;

    $.ajax = function(a)
    {
        try {

            /*

             // TODO: FUTURE HTTPS REPLACEMENT ( CHECK IF IT WORKS ON ALL PLATFORMS !! )

             // HTTPS: auth nop play my-tv vote
             // HTTP: config promos details channel-content guide catch seasons evt
             var l = a.url;
             if(l.indexOf("/auth")<0 && l.indexOf("/nop")<0 && l.indexOf("/play")<0 && l.indexOf("/my-tv")<0 && l.indexOf("/vote")<0
             && l.indexOf(TVA.OTT.BASEURL)==0 && l.indexOf("https")==0 )
             {
             // Ensure https is replaced
             a.url = l.replace("https://","http://").replace(":443/",'');
             }

             */

            if(a)
            {
                // Only 2 requests 1 or 0
                if(a.jsonpCallback && a.jsonpCallback.length && a.jsonpCallback.indexOf("channelcontentcontents")<0)
                {
                    a.jsonpCallback = a.jsonpCallback.replace(/[1-9]$/,"0");
                }

                // Avoid nocache parameter
                if(a.data && a.data.nocache)
                {
                    nc = a.data.nocache;
                    delete a.data.nocache;
                    a.data._=nc;
                }
            }

        } catch(eacb) { }

        return $._ottAjaxCall(a);
    }

} catch(aex) { }
