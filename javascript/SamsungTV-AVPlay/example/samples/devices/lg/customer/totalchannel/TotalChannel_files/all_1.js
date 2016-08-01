var TVA = {
    connectivityTimer: null,
    online: true,
    device: "lg",
    deviceId: 2,
    year: 2011,
    zoomMargins: {
        min: 0.94,
        max: 1,
        step: 0.03
    },
    language: null,
    country: null,
    onHover: "",
    onFocus: "",
    connectionCheck: true,
    connectionPlaying: false,
    callbackFunction: null,
    parse: true,
    activeInput: false,
    popupActive: true,
    popupConnNoTitle: "No Network Connection",
    popupConnNoText: "Please check your internet connection and re-launch this application",
    popupConnBadTitle: "Network Instability",
    popupConnBadText: "Your network connection had become disconnected. Some network services may need to be restarted",
    popupConnBack: "Press return to close",
    appName: "##appName##",
    engineId: "##engineId##",
    connectionAlertInterval: 0,
    oldDevice: false
};
TVA.init = function(c) {
    TVA.deviceInfo = document.getElementById("deviceInfo");
    if (c) {
        if (c.connectionCheck && c.connectionCheck == false) {
            TVA.connectionCheck = false
        }
    }
    if (TVA.connectionCheck) {
        TVA.connectivityTimer = window.setInterval("TVA.testConnectivity();", 5000)
    }
    TVA.setNetworkPopupLang();
    TVA.onShowEvent();
    try {
        var f = navigator.userAgent;
        f = f.toLowerCase().split("netcast.");
        if (f.length > 1) {
            f = f[1];
            var j = f.split("-");
            if (j.length > 1) {
                var g = j[1];
                g = g.match(/\d+/g);
                if (g && g.length > 0 && parseInt(g[0]) > 0) {
                    TVA.year = parseInt(g[0])
                }
            }
        }
        if (TVA.year <= 2012) {
            TVA.OTT.PLAYER_CAN_PLAY_FROM_POSITION = false
        }
        f = navigator.userAgent.toUpperCase();
        var a = false,
            h = false,
            d;
        if (TVA.device == "lg") {
            if (f.indexOf("TV-2010") > 0) {
                a = false;
                h = true
            } else {
                if (f.indexOf("TV-2011") > 0) {
                    a = false;
                    h = true
                } else {
                    if (f.indexOf("TV-2012") > 0) {
                        a = false;
                        h = true
                    } else {
                        if (f.indexOf("TV-") > 0) {
                            a = true
                        }
                    }
                }
            }
            if (a == false) {
                for (d in TVA.OTT.DRM) {
                    if (TVA.OTT.DRM.hasOwnProperty(d)) {
                        if (TVA.OTT.DRM[d] == "playready") {
                            TVA.OTT.DRM.splice(d, 1)
                        }
                    }
                }
            }
        } else {
            for (d in TVA.OTT.DRM) {
                if (TVA.OTT.DRM.hasOwnProperty(d)) {
                    if (TVA.OTT.DRM[d] == "widevine") {
                        TVA.OTT.DRM.splice(d, 1)
                    }
                }
            }
        }
        TVA.oldDevice = h
    } catch (i) {}
};
TVA.getInfo = function() {
    if (!TVA.deviceInfo) {
        TVA.deviceInfo = document.getElementById("deviceInfo")
    }
    try {
        return JSON.stringify({
            dev: TVA.device,
            manuf: TVA.deviceInfo.manufacturer,
            model: TVA.deviceInfo.modelName,
            sn: TVA.deviceInfo.serialNumber,
            sw: TVA.deviceInfo.swVersion,
            hw: TVA.deviceInfo.hwVersion,
            ua: navigator.userAgent
        })
    } catch (a) {
        return "" + a
    }
};
TVA.quit = function() {
    if (TVA_Player) {
        TVA_Player.deinit()
    }
    try {
        if (TVA.OTT.WEBOS) {
            window.setTimeout(function() {
                window.close()
            }, 100);
            return
        }
    } catch (a) {}
    window.setTimeout(function() {
        window.NetCastBack()
    }, 100)
};
TVA.onShowEvent = function() {
    try {
        ScreenSaver.enable()
    } catch (b) {}
};
TVA.keyDownEvt = null;
TVA.keyDown = function(d) {
    TVA.keyDownEvt = d;
    d.preventDefault();
    var c = d.keyCode;
    if (c == TVA.tvKey.KEY_5 && (View.actualPageIs(Home) || View.actualPageIs(VideoPlayer)) && (Debug.enabled == true || (TVA.OTT.DLU && TVA.OTT.DLU.length))) {
        window.location.reload();
        return
    }
    if (TVA.activeInput) {
        TVA_Input.processKey(c)
    } else {
        if (TVA.online && !document.getElementById("connectionAlert")) {
            Main.keyDown(c)
        } else {
            if (c == TVA.tvKey.KEY_RETURN) {
                Main.unload()
            }
        }
    }
    TVA.keyDownEvt = null
};
TVA.invalidate = function() {};
TVA.handleReturn = function() {
    Main.unload()
};
TVA.getDeviceId = function() {
    var b = null;
    TVA.deviceInfo = document.getElementById("deviceInfo");
    if (TVA.deviceInfo) {
        b = TVA.deviceInfo.serialNumber
    }
    try {
        if (b === null || typeof b === "undefined" || b === "" || b === "undefined" || b === "FOO") {
            if (typeof API !== "undefined" && typeof API.getDUID === "function") {
                b = "DUID-" + API.getDUID()
            }
        }
    } catch (c) {}
    return b
};
TVA.setHover = function(f) {
    try {
        if (TVA.onHover) {
            var h = document.getElementById(TVA.onHover);
            if (h) {
                if ($(h).hasClass("hover")) {
                    $(h).removeClass("hover")
                }
            }
        }
    } catch (g) {}
    TVA.onHover = f;
    var d = document.getElementById(f);
    if (d) {
        $(d).addClass("hover")
    }
};
TVA.offHover = function(d) {
    TVA.onHover = "";
    try {
        if (d) {
            var c = document.getElementById(d);
            if (c) {
                $(c).removeClass("hover")
            }
        }
    } catch (f) {}
};
TVA.setFocus = function(d) {
    try {
        if (TVA.activeInput) {
            TVA_Input.exitInput(false)
        }
        var h = document.getElementById(TVA.onFocus);
        if (h) {
            if ($(h).hasClass("focus")) {
                $(h).removeClass("focus")
            }
        }
    } catch (g) {}
    TVA.onFocus = d;
    var f = document.getElementById(d);
    if (f) {
        $(f).addClass("focus");
        $(f).focus()
    }
};
TVA.offFocus = function(d) {
    TVA.onFocus = "";
    try {
        var c = document.getElementById(d);
        if (c) {
            $(c).removeClass("focus");
            $(c).blur()
        }
    } catch (f) {}
};
TVA.setLanguage = function(b) {
    TVA.language = b
};
TVA.getLanguage = function() {
    if (TVA.deviceInfo && TVA.deviceInfo.tvLanguage2) {
        return TVA.deviceInfo.tvLanguage2.substr(0, 2)
    } else {
        return null
    }
};
TVA.getCountry = function() {
    if (TVA.deviceInfo) {
        return TVA.deviceInfo.tvCountry2
    } else {
        return null
    }
};
TVA.getTime = function() {
    return new Date(TVA.getEpoch()).toLocaleTimeString()
};
TVA.getDate = function() {
    return new Date(TVA.getEpoch()).toLocaleDateString()
};
TVA.getEpoch = function() {
    try {
        var c = TVA.deviceInfo.getLocalTime();
        return new Date(c.year, c.month - 1, c.date, c.hour, c.minute, c.second)
    } catch (d) {
        return new Date().getTime()
    }
};
TVA.checkConnectivity = function() {
    if (TVA.device != "lg") {
        TVA.deviceInfo.net_isConnected = true
    } else {
        if (TVA.OTT.WEBOS_EMULATOR) {
            try {
                TVA.deviceInfo.net_isConnected = true
            } catch (a) {}
        }
    }
    return TVA.deviceInfo.net_isConnected
};
TVA.testConnectivity = function() {
    var e, c, h;
    var f = TVA.checkConnectivity();
    if (!TVA.online && !f && !document.getElementById("connectionAlert")) {
        TVA.online = true
    }
    if (TVA.online) {
        if (f) {} else {
            TVA.online = false;
            if (TVA.popupActive) {
                window.clearTimeout(TVA.connectionAlertInterval);
                $("#connectionAlert").remove();
                PopUp.hideIfVisible();
                e = document.createElement("div");
                c = document.createElement("div");
                h = document.createElement("div");
                h.textContent = TVA.popupConnNoText;
                h.style.color = "#AAA";
                h.style.textAlign = "center";
                c.textContent = TVA.popupConnNoTitle;
                c.style.color = "#EEE";
                c.style.textAlign = "center";
                e.style.position = "absolute";
                e.style.backgroundColor = "#111";
                e.style.fontSize = "24px";
                e.style.border = "5px solid #EEE";
                e.style.width = "675px";
                e.style.height = "85px";
                e.style.left = "303px";
                e.style.top = "316px";
                e.style.padding = "15px 0px 15px 0px";
                e.style.zIndex = 10000;
                e.id = "connectionAlert";
                e.appendChild(c);
                e.appendChild(h);
                document.getElementById("body").appendChild(e)
            }
            if (TVA_Player != null && (TVA_Player.getState() == TVA_Player.state.playing || TVA_Player.getState() == TVA_Player.state.buffering)) {
                this.connectionPlaying = true;
                TVA_Player.stop()
            }
            if (typeof Main.networkDown == "function") {
                Main.networkDown()
            }
        }
    } else {
        if (f) {
            window.clearTimeout(TVA.connectionAlertInterval);
            $("#connectionAlert").remove();
            PopUp.hideIfVisible();
            TVA.online = true;
            if (API.initialized == false) {
                API.authDevice(API.getStorefrontOps);
                if (typeof Main.networkUp == "function") {
                    Main.networkUp()
                }
                PopUp.showIfVisible();
                return
            }
            if (TVA.popupActive) {
                e = document.createElement("div");
                c = document.createElement("div");
                h = document.createElement("div");
                h.textContent = TVA.popupConnBadText;
                h.style.color = "#AAA";
                h.style.textAlign = "center";
                c.textContent = TVA.popupConnBadTitle;
                c.style.color = "#EEE";
                c.style.textAlign = "center";
                e.style.position = "absolute";
                e.style.backgroundColor = "#111";
                e.style.fontSize = "24px";
                e.style.border = "5px solid #EEE";
                e.style.width = "675px";
                e.style.height = "85px";
                e.style.left = "303px";
                e.style.top = "316px";
                e.style.padding = "15px 0px 15px 0px";
                e.style.zIndex = 10000;
                e.id = "connectionAlert";
                e.appendChild(c);
                e.appendChild(h);
                document.getElementById("body").appendChild(e)
            }
            var g = "";
            if (TVA_Player != null && this.connectionPlaying) {
                this.connectionPlaying = false;
                TVA.recoverFromNetworkError()
            } else {
                g = "if(View.actualPage!==PopUp)View.initActualPage(true);"
            }
            TVA.connectionAlertInterval = window.setTimeout("$('#connectionAlert').remove();PopUp.showIfVisible();" + g, 4000);
            if (typeof Main.networkUp == "function") {
                Main.networkUp()
            }
        } else {}
    }
};
TVA.recoverFromNetworkError = function() {
    var a = setTimeout("View.loaderHide();View.previousPage();", 1)
};
TVA.putInnerHTML = function(c, d) {
    if (c) {
        c.innerHTML = d
    }
};
TVA.netUp = function() {};
TVA.netDown = function() {};
TVA.getJSONcors = function(f, h, g) {
    var j = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D"' + encodeURIComponent(f) + '"&format=json&callback=';
    TVA.callbackFunction = h;
    if (g) {
        TVA.parse = false
    }
    var i = document.createElement("script");
    i.type = "text/javascript";
    i.src = j + "TVA.responseCallback";
    document.getElementsByTagName("head")[0].appendChild(i)
};
TVA.responseCallback = function(f) {
    var e;
    if (TVA.parse) {
        e = JSON.parse(f.query.results.body.p)
    } else {
        e = f.query.results.body.p;
        TVA.parse = true
    }
    var d = TVA.callbackFunction;
    TVA.callbackFunction = null;
    d(e)
};
TVA.setNetworkPopupLang = function() {
    if ("es" == TVA.getLanguage()) {
        TVA.popupConnNoTitle = "Sin conexión a la red";
        TVA.popupConnNoText = "Por favor, compruebe su conexión a internet y vuelva a lanzar la aplicación";
        TVA.popupConnBadTitle = "Inestabilidad de la red";
        TVA.popupConnBadText = "Tu conexión a la red se ha desconectado. Algunos servicios de red pueden necesitar ser reiniciados";
        TVA.popupConnBack = "Pulse volver para cerrar este mensaje"
    } else {
        if ("fr" == TVA.getLanguage()) {
            TVA.popupConnNoTitle = "Pas de connexion r?seau";
            TVA.popupConnNoText = "S'il vous pla?t v?rifier votre connexion Internet et relancer cette application";
            TVA.popupConnBadTitle = "L'instabilit? du r?seau";
            TVA.popupConnBadText = "Votre connexion au r?seau a ?t? d?branch?. Certains services r?seau peut etre n?cessaire de red?marrer";
            TVA.popupConnBack = "Appuyez sur RETURN pour fermer"
        } else {
            if ("tr" == TVA.getLanguage()) {
                TVA.popupConnNoTitle = "Internet Baglantisi Bulunamadi";
                TVA.popupConnNoText = "L?tfen internet baglantinizi kontrol edin ve uygulamayi tekrar a?in";
                TVA.popupConnBadTitle = "Baglanti Hatasi";
                TVA.popupConnBadText = "Internet baglantisi kurulamadi. Bazi durumlarda baglanti servisini yeniden ba?latmaniz gerekebilir";
                TVA.popupConnBack = "Kapatmak i?in geri tu?una basin"
            } else {
                if ("pt" == TVA.getLanguage()) {
                    TVA.popupConnNoTitle = "Nenhuma liga?ao de rede";
                    TVA.popupConnNoText = "Por favor, verifique a liga?ao com a internet e relance esta aplica?ao";
                    TVA.popupConnBadTitle = "Instabilidade de rede";
                    TVA.popupConnBadText = "Houve problemas na liga?ao de rede. Alguns servi?os podem precisar de ser reiniciados";
                    TVA.popupConnBack = "Prima RETURN para fechar"
                } else {
                    if ("it" == TVA.getLanguage()) {
                        TVA.popupConnNoTitle = "Nessuna connessione di rete";
                        TVA.popupConnNoText = "Verifica la tua connessione di rete e rilancia questa applicazione";
                        TVA.popupConnBadTitle = "Rete instabile";
                        TVA.popupConnBadText = "La connessione di rete era scollegata. Potrebbe essere necessario riavviare alcuni servizi di rete";
                        TVA.popupConnBack = "Premi RETURN per chiudere"
                    }
                }
            }
        }
    }
};
TVA.setBackgroundStatus = function(a) {};
TVA.getMainPage = function(a) {
    if (Utils.getMainPage(function(b) {
            View.getMainPageResponse(a, b)
        }) == true) {
        return
    }
    View.getMainPageResponse(a, "")
};
var TVA_Player = {
    url: null,
    pluginMW: null,
    originalSource: null,
    player: null,
    height: 720,
    width: 1280,
    xPosition: 0,
    yPosition: 0,
    zoomFactor: 0,
    MIMEType: "",
    defaultMIMEAud: "audio/mpeg",
    defaultMIMEVid: "video/mp4",
    playPos: 0,
    defaultSkip: 10,
    mode: 0,
    active: false,
    preBufferMode: 0,
    avMode: 0,
    defaultLoading: false,
    avState: {
        video: 0,
        audio: 1
    },
    state: {
        stopped: 0,
        playing: 1,
        paused: 2,
        buffering: 4,
        connecting: 3,
        finished: 5,
        error: 6
    },
    headTimer: null,
    previousMode: -1,
    widevine: false,
    lastPlayedPosition: 0,
    timeoutPlay: null,
    prManager: null,
    seekTimeout: null,
    multipleVodAudioTracksDisabled: false,
    multipleLiveAudioTracksDisabled: false,
    started: false
};
TVA_Player.init = function(a) {
    if (!a) {
        a = {}
    }
    if (a.width) {
        TVA_Player.width = a.width
    }
    if (a.height) {
        TVA_Player.height = a.height
    }
    if (a.xPosition) {
        TVA_Player.xPosition = a.xPosition
    }
    if (a.yPosition) {
        TVA_Player.yPosition = a.yPosition
    }
    if (a.url) {
        TVA_Player.url = a.url
    }
    if (a.defaultSkip) {
        TVA_Player.defaultSkip = a.defaultSkip
    }
    if (a.MIMEType) {
        TVA_Player.MIMEType = a.MIMEType
    }
    if (a.defaultLoading) {
        TVA_Player.defaultLoading = a.defaultLoading
    }
    TVA_Player.zoomFactor = 0;
    TVA_Player.buildPlayer();
    if (!TVA_Player.player) {
        return false
    }
    if (a.avMode && a.avMode == "audio") {
        TVA_Player.readyAudio()
    } else {
        TVA_Player.readyVideo()
    }
    if (typeof playStateChanged != "function") {
        playStateChanged = function() {}
    }
    if (playStateChanged == TVA_Player.playStateChanged) {
        TVA_Player.playerPlayStateChanged = playStateChanged;
        playStateChanged = TVA_Player.playStateChanged
    }
    return true
};
TVA_Player.buildPlayer = function(d) {
    TVA_Player.e = d;
    var b = document.getElementById("TVA_PlayerBox");
    if (b) {
        if (TVA_Player.player) {
            TVA_Player.player.Stop();
            TVA_Player.player = null
        }
        var f = document.getElementById("LGplayer");
        if (f) {
            var a = b.removeChild(f)
        }
    } else {
        b = document.createElement("span");
        b.setAttribute("id", "TVA_PlayerBox");
        document.getElementById("body").appendChild(b)
    }
    if (d) {
        TVA.putInnerHTML(b, d)
    } else {
        var c = " autostart='false' ";
        TVA.putInnerHTML(b, '<object data="" type="audio/mpeg" id="LGplayer" ' + c + ' style="position:absolute; width: 0; height: 0; top:0; left:0;"></object>')
    }
    TVA_Player.player = document.getElementById("LGplayer");
    TVA_Player.widevine = false;
    TVA_Player.player.onPlayStateChange = TVA_Player.onPlayStateChange;
    TVA_Player.player.onBuffering = TVA_Player.onBuffering
};
TVA_Player.checkPlayer = function() {
    TVA_Player.buildPlayer(TVA_Player.e)
};
TVA_Player.readyVideo = function() {
    TVA_Player.setHeight(TVA_Player.height);
    TVA_Player.setWidth(TVA_Player.width);
    TVA_Player.setXY(TVA_Player.xPosition, TVA_Player.yPosition);
    TVA_Player.avMode = 0;
    TVA_Player.player.setAttribute("type", TVA_Player.MIMEType ? TVA_Player.MIMEType : TVA_Player.defaultMIMEVid)
};
TVA_Player.readyAudio = function() {
    TVA_Player.setHeight(0);
    TVA_Player.setWidth(0);
    TVA_Player.setXY(0, 0);
    TVA_Player.avMode = 1;
    TVA_Player.player.setAttribute("type", TVA_Player.MIMEType ? TVA_Player.MIMEType : TVA_Player.defaultMIMEAud)
};
TVA_Player.setXY = function(b, a) {
    TVA_Player.xPosition = b;
    TVA_Player.yPosition = a;
    TVA_Player.player.style.position = "absolute";
    TVA_Player.player.style.left = b + "px";
    TVA_Player.player.style.top = a + "px";
    return true
};
TVA_Player.getWidth = function() {
    return TVA_Player.player.width
};
TVA_Player.setWidth = function(a) {
    TVA_Player.player.width = a;
    TVA_Player.width = a;
    return true
};
TVA_Player.getHeight = function() {
    return TVA_Player.player.height
};
TVA_Player.setHeight = function(a) {
    TVA_Player.player.height = a;
    TVA_Player.height = a;
    return true
};
TVA_Player.hide = function() {
    ScreenSaver.enable();
    TVA_Player.active = false;
    TVA_Player.player.style.display = "none"
};
TVA_Player.show = function() {
    ScreenSaver.disable();
    TVA_Player.player.style.display = "block";
    TVA_Player.active = true
};
TVA_Player.getURL = function() {
    return TVA_Player.url
};
TVA_Player.setURL = function(a) {
    TVA_Player.url = a;
    return true
};
TVA_Player._playParams = null;
TVA_Player.play = function(b, c, a) {
    if (a === true) {
        TVA_Player._playParams = null
    } else {
        TVA_Player._playParams = {
            e: b,
            lastPlayedPosition: c
        }
    }
    var d = 0;
    if (typeof c !== "undefined") {
        d = parseInt(c);
        TVA_Player.lastPlayedPosition = d
    } else {
        d = TVA_Player.lastPlayedPosition
    }
    if (isNaN(d) || d <= 0) {
        d = 0
    }
    OTTAnalytics.checkPosition(0);
    if (b) {
        TVA_Widevine.playPlayready({
            url: b.url,
            drmServerURL: b.emmUrl,
            portalID: b.portalId,
            userData: b.userData,
            plastPlayedPosition: d
        });
        return true
    } else {
        if (TVA_Player.prManager !== null) {} else {}
    }
    try {
        window.clearTimeout(TVA_Player.timeoutPlay)
    } catch (b) {}
    if (TVA.OTT.WEBOS) {
        if (TVA_Player.started === true) {
            TVA_Player.player = document.getElementById("LGplayer");
            TVA_Player.player.play(1)
        }
        return true
    } else {
        if (TVA_Player.player) {
            TVA_Player.player.data = TVA_Player.url
        }
    }
    try {
        window.clearTimeout(TVA_Player.timeoutPlay)
    } catch (b) {}
    TVA_Player.timeoutPlay = window.setTimeout(function() {
        TVA_Player.player = document.getElementById("LGplayer");
        if (TVA_Player.player) {
            TVA_Player.player.play(1)
        }
    }, 100);
    return true
};
TVA_Player.stop = function() {
    TVA_Player.lastPlayedPosition = 0;
    clearTimeout(TVA_Player.seekTimeout);
    OTTAnalytics.checkPosition(0);
    return TVA_Player.player.stop()
};
TVA_Player.pause = function(a) {
    if (a) {
        return TVA_Player.player.play(0)
    } else {
        return TVA_Player.player.play(1)
    }
};
TVA_Player.forward = function(b) {
    b = b ? b : TVA_Player.defaultSkip;
    var a = TVA_Player.playPos + b > TVA_Player.getLength() ? TVA_Player.getLength() : TVA_Player.playPos + b;
    return TVA_Player.player.seek(a * 1000)
};
TVA_Player.backward = function(b) {
    b = b ? b : TVA_Player.defaultSkip;
    var a = TVA_Player.playPos - b < 0 ? 0 : TVA_Player.playPos - b;
    return TVA_Player.player.seek(a * 1000)
};
TVA_Player.seekTo = function(b) {
    var a = Math.floor((b / 100) * (TVA_Player.getLength()));
    return TVA_Player.player.seek(a * 1000)
};
TVA_Player.playStateChanged = function(c) {
    if (TVA_Player.defaultLoading) {
        var a = null;
        if (document.getElementById("loading_logo")) {
            a = document.getElementById("loading_logo")
        } else {
            a = document.createElement("img");
            a.setAttribute("id", "loading_logo");
            a.setAttribute("src", "TVA/images/loading.png");
            a.style.position = "absolute";
            a.style.zIndex = "99999";
            document.getElementById("body").appendChild(a)
        }
        if (c == 3 || c == 4) {
            var d = TVA_Player.yPosition + TVA_Player.height / 2 - 92;
            var b = TVA_Player.xPosition + TVA_Player.width / 2 - 100;
            a.style.top = d + "px";
            a.style.left = b + "px";
            a.style.display = "block"
        } else {
            a.style.display = "none"
        }
    }
    TVA_Player.playerPlayStateChanged(c)
};
TVA_Player.onBuffering = function() {
    if (typeof bufferingProgress == "function") {
        bufferingProgress("Not available")
    }
};
TVA_Player.onPlayStateChange = function() {
    TVA_Player.mode = TVA_Player.player.playState;
    if (TVA_Player.mode == 4) {
        TVA_Player.onBuffering()
    }
    if (TVA_Player.mode != TVA_Player.previousMode) {
        TVA_Player.previousMode = TVA_Player.mode
    } else {
        return
    }
    if (TVA_Player.mode == 1) {
        TVA_Player.headTimer = window.setInterval(function() {
            TVA_Player.setCurrentTime()
        }, 1000)
    } else {
        if (TVA_Player.headTimer != null) {
            TVA_Player.clearTimer()
        }
    }
    if (TVA_Player.mode == 6) {
        if (TVA.OTT.WEBOS && TVA_Player.player && TVA_Player.player.error == 2 && TVA_Player._playParams != null) {
            TVA_Widevine._playParams = null;
            return
        }
        if (typeof playError == "function") {
            var a = "";
            try {
                a = "" + TVA_Player.player.error
            } catch (c) {
                a = ""
            }
            playError(true, a)
        }
    } else {
        if (typeof playStateChanged == "function") {
            if (TVA_Player.lastPlayedPosition > 0 && TVA_Player.mode == 1) {
                clearTimeout(TVA_Player.seekTimeout);
                var b = TVA_Player.lastPlayedPosition;
                TVA_Player.lastPlayedPosition = 0;
                TVA_Player.seekTimeout = setTimeout(function() {
                    TVA_Player.player.seek(b * 1000)
                }, 100)
            }
            playStateChanged(TVA_Player.mode)
        }
    }
};
TVA_Player.getLength = function() {
    if (TVA_Player.player) {
        return Math.floor(TVA_Player.player.playTime / 1000)
    }
    return null
};
TVA_Player.getCurrentTime = function() {
    if (VideoPlayer.details.isLive) {
        var a = Utils.now();
        if (EVT.startTime === null || EVT.startTime <= 0) {
            EVT.startTime = a
        }
        return Math.floor((a - EVT.startTime - EVT.pausedTime) / 1000)
    }
    return Math.floor(TVA_Player.player.playPosition / 1000)
};
TVA_Player.setCurrentTime = function() {
    if (OTTAnalytics.updatingPlayTime == true) {
        return
    }
    TVA_Player.playPos = TVA_Player.getCurrentTime();
    if (typeof playHeadChanged == "function") {
        playHeadChanged(TVA_Player.playPos)
    }
};
TVA_Player.getAVState = function() {
    return TVA_Player.avMode
};
TVA_Player.getState = function() {
    return TVA_Player.mode
};
TVA_Player.deinit = function() {
    try {
        TVA_Player.lastPlayedPosition = 0;
        clearTimeout(TVA_Player.seekTimeout);
        if (TVA_Player.player) {
            TVA_Player.hide();
            try {
                TVA_Player.player.stop()
            } catch (b) {}
            TVA_Player.player = null;
            TVA_Player.clearTimer()
        }
    } catch (a) {}
};
TVA_Player.clearTimer = function() {
    window.clearInterval(TVA_Player.headTimer);
    TVA_Player.headTimer = null
};
TVA_Player.zoom = function() {
    TVA_Player.zoomFactor++;
    var c = Math.floor(TVA_Player.width);
    var a = Math.floor(TVA_Player.height);
    var b = TVA_Player.zoomFactor * 40;
    var d = Math.round(b * (a / c));
    if (b > c / 5 || d > a / 5) {
        TVA_Player.zoomFactor = 0;
        b = 0;
        d = 0
    }
    TVA_Player.player.width = c + (b * 2);
    TVA_Player.player.height = a + (d * 2);
    TVA_Player.setXY(-b, -d);
    return true
};
TVA_Player.checkAudioAndSubtitles = function() {
    if (TVA_Player.widevine == true) {
        return
    }
    if (Subtitles.DISABLED === false && VideoPlayer.details.isLive == false) {
        return
    }
    var a = TVA_Player.url;
    $.ajax({
        type: "GET",
        url: a,
        dataType: "text",
        success: function(k) {
            try {
                if (TVA_Player.url != a) {
                    return
                }
                k = k.replace(/[\x00-\x1F\x80-\xFF]/g, "");
                var g = "",
                    d = "";
                if (TVA.OTT.DEVICETYPE != TVA.OTT.DEVICETYPE_BRAVIA) {
                    for (i = 0; i < k.length; i++) {
                        d = k.charCodeAt(i);
                        if (d > 31 && d < 128) {
                            g += k[i]
                        }
                    }
                } else {
                    var f = 0;
                    for (i = 0; i < 50; i++) {
                        d = k.charCodeAt(i);
                        if (d <= 31 || d >= 128) {
                            f = i
                        }
                    }
                    g = k.substr(f)
                }
                if (window.DOMParser) {
                    var b = new DOMParser();
                    xmlDoc = b.parseFromString(g, "text/xml")
                } else {
                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async = false;
                    xmlDoc.loadXML(g)
                }
                var c = [];
                var o = xmlDoc.getElementsByTagName("StreamIndex");
                for (var h = 0; h < o.length; h++) {
                    var m = o[h].getAttribute("Type");
                    if (m === "audio") {
                        var n = o[h].getAttribute("Language");
                        if (n && c.indexOf(n) >= 0) {} else {
                            if (n === null) {} else {
                                c[c.length] = n
                            }
                        }
                    }
                }
                TVA_Player.setAudioInfo({
                    track: c,
                    selected: 0
                })
            } catch (l) {}
        },
        error: function() {}
    })
};
TVA_Player.setAudioInfo = function(b) {
    try {
        if (VideoPlayer.details.isLive && TVA_Player.multipleLiveAudioTracksDisabled == true) {
            TVA_Player.audio = {
                track: [],
                selected: 0
            };
            return ""
        } else {
            if (!VideoPlayer.details.isLive && TVA_Player.multipleVodAudioTracksDisabled == true) {
                TVA_Player.audio = {
                    track: [],
                    selected: 0
                };
                return ""
            }
        }
        TVA_Player.audio = b;
        if (View.actualPageIs(VideoPlayer) && TVA_Player.audio.track.length > 1) {
            VideoPlayer.setFooter()
        }
        if (TVA_Player.audio.track.length > 1) {
            return ("" + TVA_Player.audio.track[TVA_Player.audio.selected]).toUpperCase()
        }
    } catch (a) {}
    return ""
};
TVA_Player.setSubtitlesInfo = function(a) {};
TVA_Player.getAudioTracks = function() {
    if (typeof TVA_Player.audio === "undefined") {
        TVA_Player.audio = {
            track: [],
            selected: 0
        }
    }
    return TVA_Player.audio
};
TVA_Player.getSubtitleTracks = function() {
    if (typeof TVA_Player.subtitles === "undefined") {
        TVA_Player.subtitles = {
            track: [],
            selected: 0
        }
    }
    return TVA_Player.subtitles
};
TVA_Player.setAudioTrack = function(a) {
    try {
        if (typeof a === "undefined" || a < 0 || a >= TVA_Player.audio.track.length) {
            a = TVA_Player.audio.selected + 1;
            if (a >= TVA_Player.audio.track.length) {
                a = 0
            }
            if (TVA_Player.audio.track[a] == TVA_Player.lastAudioTrack) {
                a++;
                if (a >= TVA_Player.audio.track.length) {
                    a = 0
                }
            }
        }
        var c = TVA_Player.audio.track[a];
        if (c === null) {
            c = ""
        }
        TVA_Player.audio.selected = a;
        TVA_Player.lastAudioTrack = a;
        document.getElementById("LGplayer").audioLanguage = c;
        if (c === "") {
            c = "-"
        }
        var b = ("" + c).toUpperCase();
        Alert.show("Audio: " + b, true);
        return b
    } catch (d) {}
    return ""
};
TVA_Player.setSubtitleTrack = function(a) {};
TVA_Player.getRealTime = function() {
    if (TVA_Player.player) {
        return TVA_Player.player.playPosition
    }
    return 0
};
var TVA_Widevine = {};
var TVA_Playready = {};
TVA_Widevine.playPlayready = function(a) {
    return TVA_Widevine.playWidevine(a, true)
};
TVA_Widevine._firstPlay1 = 0;
TVA_Widevine._firstPlay2 = 0;
TVA_Widevine._nextPlay = 0;
if (navigator.userAgent.toLowerCase().indexOf("webos") > 0 || navigator.userAgent.toLowerCase().indexOf("web0s") > 0) {
    TVA_Widevine._firstPlay1 = 1000;
    TVA_Widevine._firstPlay2 = 1000;
    TVA_Widevine._nextPlay = 50
}
TVA_Widevine.playWidevine = function(j, b) {
    var h = true;
    var l = document.getElementById("TVA_PlayerBox");
    if (l) {
        if (TVA_Player.player) {
            TVA_Player.player.Stop();
            TVA_Player.player = null
        }
        var g = document.getElementById("LGplayer");
        if (g) {
            var e = l.removeChild(g)
        }
    } else {
        l = document.createElement("span");
        l.setAttribute("id", "TVA_PlayerBox");
        document.getElementById("body").appendChild(l)
    }
    if (!j && !j.url) {
        return false
    }
    var i = " autostart='true' ";
    TVA_Player.started = true;
    if (b === true && j && j.drmServerURL && typeof j.drmServerURL == "string" && j.drmServerURL.length) {
        i = " autostart='false' ";
        TVA_Player.started = false
    }
    if (b === true) {
        TVA_Player.prManager = document.getElementById("oipfDrm");
        TVA_Player.MIMEType = "application/vnd.ms-sstr+xml";
        TVA.putInnerHTML(l, '<object type="' + TVA_Player.MIMEType + '" data="' + j.url + '" ' + i + ' width="1280" height="720" id="LGplayer" style="position:absolute; top:0px; left:0px;"></object>')
    } else {
        TVA_Player.prManager = null;
        TVA_Player.MIMEType = "video/x-ms-wmv";
        TVA.putInnerHTML(l, '<object type="' + TVA_Player.MIMEType + '" drm_type="widevine" data="' + j.url + '" ' + i + ' width="1280" height="720" id="LGplayer" style="position:absolute; top:0px; left:0px;"></object>')
    }
    h = true;
    TVA_Player.url = j.url;
    TVA_Player.player = document.getElementById("LGplayer");
    TVA_Player.player.onPlayStateChange = TVA_Player.onPlayStateChange;
    TVA_Player.player.onBuffering = TVA_Player.onBuffering;
    TVA_Player.widevine = b ? false : true;
    var k = 0;
    if (j && b == true && j.drmServerURL && typeof j.drmServerURL == "string" && j.drmServerURL.length) {
        k = TVA_Widevine._firstPlay2;
        TVA_Widevine._firstPlay2 = 0
    } else {
        if (TVA.OTT.WEBOS) {
            k = 5;
            TVA_Widevine._firstPlay2 = 0
        }
    }
    if (k == 0) {
        return TVA_Widevine.playWidevine1(j, b, h)
    } else {
        setTimeout(function() {
            TVA_Widevine.playWidevine1(j, b, h)
        }, k + TVA_Widevine._nextPlay)
    }
    return h
};
TVA_Widevine.playWidevine1 = function(e, b, c) {
    var a = 0;
    if (e && b == true && e.drmServerURL && typeof e.drmServerURL == "string" && e.drmServerURL.length) {
        a = TVA_Widevine._firstPlay1;
        TVA_Widevine._firstPlay1 = 0
    }
    TVA_Player.player = document.getElementById("LGplayer");
    if (TVA_Widevine._nextPlay > 0) {
        TVA_Player.player.onPlayStateChange = TVA_Player.onPlayStateChange;
        TVA_Player.player.onBuffering = TVA_Player.onBuffering;
        TVA_Player.widevine = b ? false : true
    }
    if (TVA.OTT.WEBOS) {} else {
        TVA_Player.player.data = TVA_Player.url
    }
    TVA_Player.readyVideo();
    if (a == 0) {
        return TVA_Widevine.playWidevine2(e, b, c)
    } else {
        setTimeout(function() {
            TVA_Widevine.playWidevine2(e, b, c)
        }, a + TVA_Widevine._nextPlay)
    }
    return c
};
TVA_Widevine.playWidevine2 = function(l, o, j) {
    if (o == true) {
        TVA_Player.widevine = false
    }
    try {
        if (l && o == true && l.drmServerURL && typeof l.drmServerURL == "string" && l.drmServerURL.length) {
            var c = "application/vnd.ms-playready.initiator+xml";
            var m = "";
            if (TVA.OTT.CUSTOMDATA == true) {
                m = "v=1,pb=" + l.userData + ",dt=" + TVA.OTT.DEVICETYPE + "|";
                m = "<SetCustomData><CustomData>" + m + "</CustomData></SetCustomData>"
            }
            var q = '<?xml version="1.0" encoding="utf-8"?><PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">' + m + "<LicenseServerUriOverride><LA_URL>" + l.drmServerURL + "</LA_URL></LicenseServerUriOverride></PlayReadyInitiator>";
            var r = "urn:dvb:casystemid:19219";
            TVA_Player.prManager.onDRMMessageResult = TVA_Playready.HandleOnDRMMessageResult;
            TVA_Player.prManager.onDRMRightsError = TVA_Playready.HandleOnDRMRightsError;
            TVA_Player.prManager.sendDRMMessage(c, q, r)
        } else {
            if (l) {
                j = true;
                if (j === true) {
                    var k = TVA_Widevine.getIP();
                    var p = TVA_Widevine.getESN();
                    if (k != null && p != null) {
                        TVA_Player.player.setWidevineClientIP(k);
                        TVA_Player.player.setWidevineDeviceID(p)
                    } else {
                        j = false
                    }
                }
                if (j === true && l.portalID) {
                    TVA_Player.player.setWidevinePortalID(l.portalID)
                }
                if (j === true && l.streamID) {
                    TVA_Player.player.setWidevineStreamID(l.streamID)
                }
                if (j === true && l.userData) {
                    TVA_Player.player.setWidevineUserData(l.userData)
                }
                if (j === true && l.drmAckServerURL) {
                    var i = l.drmAckServerURL;
                    TVA_Player.player.setWidevineDrmAckURL(i)
                }
                if (j === true && l.drmServerURL) {
                    TVA_Player.player.setWidevineDrmURL(l.drmServerURL)
                } else {
                    j = false
                }
                if (j === true && l.heartbeatURL) {
                    var a = l.heartbeatURL;
                    TVA_Player.player.setWidevineHeartbeatURL(a)
                }
                if (j === true && l.heartbeatPeriod) {
                    var n = l.heartbeatPeriod;
                    TVA_Player.player.setWidevineHeartbeatPeriod(n)
                }
            }
        }
    } catch (h) {}
    var g = {
        url: TVA_Player.url
    };
    OTTspYoubora.play(g, function(b) {
        if (b && b.url && b.url != TVA_Player.url) {
            TVA_Player.url = b.url;
            TVA_Player.player.data = TVA_Player.url
        }
        TVA_Widevine.playResponse(j, l)
    });
    return j
};
TVA_Widevine.playResponse = function(a, b) {
    if (a) {
        TVA_Player.show();
        if (b.plastPlayedPosition < 120) {
            b.plastPlayedPosition = 0
        }
        TVA_Player.lastPlayedPosition = b.plastPlayedPosition
    }
    return a
};
TVA_Widevine.playVideo = function(e, b) {
    if (!e) {
        return false
    }
    var h = true;
    var j = document.getElementById("TVA_PlayerBox");
    if (j) {
        if (TVA_Player.player) {
            TVA_Player.player.Stop();
            TVA_Player.player = null
        }
        var d = document.getElementById("LGplayer");
        if (d) {
            var g = j.removeChild(d)
        }
    } else {
        j = document.createElement("span");
        j.setAttribute("id", "TVA_PlayerBox");
        document.getElementById("body").appendChild(j)
    }
    TVA_Player.MIMEType = "video/x-ms-wmv";
    if (Utils.isHLS(e)) {
        TVA_Player.MIMEType = "application/x-netcast-av"
    }
    var i = " autostart='true' ";
    TVA_Player.started = true;
    TVA.putInnerHTML(j, '<object type="' + TVA_Player.MIMEType + '" data="' + e + '" ' + i + ' width="1280" height="720" id="LGplayer" style="position:absolute; top:0px; left:0px;"></object>');
    TVA_Player.url = e;
    TVA_Player.player = document.getElementById("LGplayer");
    TVA_Player.player.onPlayStateChange = TVA_Player.onPlayStateChange;
    TVA_Player.player.onBuffering = TVA_Player.onBuffering;
    TVA_Player.widevine = false;
    TVA_Player.readyVideo();
    if (TVA_Player.player) {
        TVA_Player.show();
        if (b < 120) {
            b = 0
        }
        TVA_Player.lastPlayedPosition = b
    }
    return h
};
TVA_Widevine.getIP = function() {
    var b = null;
    if (document.getElementById("deviceInfo")) {
        b = document.getElementById("deviceInfo").net_ipAddress
    }
    return b
};
TVA_Widevine.getESN = function() {
    return TVA.getDeviceId()
};
TVA_Playready.HandleOnDRMMessageResult = function(c, b, a) {
    TVA_Player.prManager = null;
    TVA_Player.started = true;
    if (a == 0) {
        TVA_Player.play()
    } else {}
};
TVA_Playready.HandleOnDRMRightsError = function(a, c, d, b) {
    TVA_Player.prManager = null;
    if (a == 0) {} else {
        if (a == 1) {}
    }
    View.previousPage();
    PopMsg.show("error", 47)
};
