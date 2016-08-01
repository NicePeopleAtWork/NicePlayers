if (typeof JS_TOTALCHANNEL_PLAYER == "undefined") {
    JS_TOTALCHANNEL_PLAYER = true;
    TotalChannel.Player = TotalChannel.Player || {};
    TotalChannel.Player.BufferEmptyStart = false;
    TotalChannel.Player.BufferEmptyMessages = [];
    TotalChannel.Player.AssetID = "";
    TotalChannel.Player.IsLiveTV = false;
    TotalChannel.Player.currentInfo = null;
    TotalChannel.Player.isBuffering = false;
    TotalChannel.Player.DivID = "slplayerobj";
    TotalChannel.Player.Started = function() {
        if (TotalChannel.Player.BufferEmptyStart !== false) {
            TotalChannel.Player.Notify("buffering", "NEW");
            TotalChannel.Player.BufferEmptyStart = false;
        }
    };
    TotalChannel.Player.getObject = function() {
        try {
            var fu = document.getElementById("SLObjPlayer");
            if (fu.Content && fu.Content.SLPlayer) {
                return fu.Content.SLPlayer;
            }
            return null;
        } catch (e) {}
        return null;
    };
    TotalChannel.Player.Error = function(status, message, result) {
        switch (message) {
            case "NETWORK_NOT_CONFIGURED":
            case "NOT_FROM_NETWORK":
                TotalChannel.SL.GoBack = false;
                break;
        }
        var a = TotalChannel.Player.DivID;
        var b = TotalChannel.Player.AssetID;
        var c = TotalChannel.Player.IsLiveTV;
        if (result) {
            TotalChannel.Player.Notify("error", {
                stat: status,
                res: result
            });
        } else {
            TotalChannel.Player.Notify("error", {
                stat: status
            });
        }
        TotalChannel.Player.Stop(false);
        switch (status) {
            case "INVALID_STATE":
                TotalChannel.DUID = "";
                setTimeout(function() {
                    TotalChannel.Player.Play(a, b, c);
                }, 100);
                break;
            case "INVALID_SESSION":
                setTimeout(function() {
                    TotalChannel.Player.Play(a, b, c);
                }, 100);
                break;
            case "500":
            case "403":
            case "NO_LOGIN":
            case "CONNECTION_CLOSED":
            case "CONNECTION_CLOSED_BUFFER_EMPTY":
            case "NOT_AVAILABLE":
            case "ERROR_INVALID_CERTIFICATE":
            case "ERROR_INVALID_LOCATION":
            case "TIME_LIMIT":
            case "PLAY_LIMIT":
            case "ST_EXCEEDED":
            case "FT_EXCEEDED":
            case "NS_EXCEEDED":
            case "UNKNOWN_ERROR":
            case "CONTENT_NOT_AVAILABLE":
            case "NOT_ALLOWED":
            default:
                if (status)
                    TotalChannel.ALERT(status);
                break;
        }
    };
    TotalChannel.GetJSON = function(url, fn) {
        if (url.indexOf("bbq=") < 0) {
            if (url.indexOf("?") < 0) url += "?";
            url += "&bbq=" + TotalChannel.BBQ;
        }
        try {
            var params = {
                url: url,
                type: "GET",
                dataType: 'json'
            };
            if (typeof fn === "function") {
                params.success = fn;
            }
            jQuery.noConflict().ajax(params);
        } catch (e) {}
    };
    TotalChannel.JSONGET = function(url) {
        TotalChannel.GetJSON(url);
    };
    TotalChannel.Player.showPlayFromPopup = function() {
        if (SqueezeBox) {
            var msg = 'Â¿Reanudar la reproducciÃ³n?';
            SqueezeBox.initialize({});
            SqueezeBox.fn = function(pos) {
                if (pos == 0 || pos == 1) {
                    TotalChannel.Player.getObject().sendResponse(pos);
                    TotalChannel.Player.silverlightLoaded();
                } else {
                    TotalChannel.Player.Stop();
                }
            };
            SqueezeBox.setContent('string', '<div class="alert-content" ><div class="alert-content-cell" >' + msg.replace(/\n/g, "<br/>") + '<div class="alert-content-questions" >' + '<a class="alert-content-button alert-content-button-accept" href="" onclick="SqueezeBox.fn(0);SqueezeBox.close();return false;" >Ver desde el principio</a><br/><br/>' + '<a class="alert-content-button alert-content-button-accept" href="" onclick="SqueezeBox.fn(1);SqueezeBox.close();return false;" >Ver desde donde lo dejÃ©</a><br/><br/>' + '<a class="alert-content-button alert-content-button-cancel" href="" onclick="SqueezeBox.fn(2);SqueezeBox.close();return false;" >Cancelar</a>' + '</div>' + '</div></div>');
            return;
        }
        TotalChannel.Player.getObject().sendResponse(0);
        TotalChannel.Player.silverlightLoaded();
    };
    TotalChannel.Player.ResponseReceived = function(msg, url, retry) {
        if (TotalChannel.Player.getObject() == null) {
            if (typeof retry == "undefined" || retry < 10) {
                if (typeof retry == "undefined") retry = 0;
                else retry++;
                setTimeout(function() {
                    TotalChannel.Player.ResponseReceived(msg, url, retry);
                }, 500);
            } else {}
            return;
        }
        TotalChannel.Player.Notify("url", url);
        if (Config.OTTClient.BALANCER == false) {
            TotalChannel.Player.getObject().balancerResponse(url);
        } else {
            var vurl = url;
            vurl = vurl.split("|");
            var path = vurl[0];
            TotalChannel.Balancer.getBalancedResource(path, function(obj) {
                if (obj != false) {
                    try {
                        if (obj['1'] && obj['1']['URL']) {
                            vurl[0] = obj['1']['URL'];
                        } else if (obj[1] && obj[1]['URL']) {
                            vurl[0] = obj[1]['URL'];
                        }
                    } catch (e) {}
                }
                vurl = vurl.join('|');
                setTimeout(function() {
                    TotalChannel.Player.getObject().balancerResponse(vurl);
                }, 10);
            });
        }
    };
    TotalChannel.Player.setUpNice264Plugin = function(url) {
        if (Config.OTTClient.ANALYTICS == false) {
            nice264Plugin = null;
            return;
        }
        try {
            if (typeof Nice264Analytics !== "undefined") {
                var slSystem = Config.OTTClient.SYSTEMCODE;
                if (!slSystem || !slSystem.length) slSystem = "totalch";
                var HTMLObjectTagID = 'slplayerobj';
                var SilverlightMediaElementName = 'SmoothPlayer';
                if (TotalChannel.Player.currentInfo && TotalChannel.Player.currentInfo.isLive == true) {
                    TotalChannel.Player.IsLiveTV = true;
                }
                var IsLive = TotalChannel.Player.IsLiveTV;
                silverlight2Media.bindToSilverlight(HTMLObjectTagID, SilverlightMediaElementName);
                var playInfo = {
                    username: TotalChannel.DUID,
                    transaction: Widevine.getOptData(),
                    interval: 0
                };
                if (window.location.protocol == "https:" || window.location.protocol == "https") {
                    nice264Plugin = new Nice264Analytics(HTMLObjectTagID, slSystem, 'https://nqs.nice264.com', playInfo, true);
                } else {
                    nice264Plugin = new Nice264Analytics(HTMLObjectTagID, slSystem, 'http://nqs.nice264.com', playInfo, false);
                }
                nice264Plugin.setVideoURL(url);
                nice264Plugin.setLive(IsLive);
                var title = [];
                if (TotalChannel.Player.details) {
                    if (TotalChannel.Player.IsLiveTV) {
                        title.push(TotalChannel.Player.details.alias && TotalChannel.Player.details.alias.length ? TotalChannel.Player.details.alias : (TotalChannel.Player.details.name && TotalChannel.Player.details.name.length ? TotalChannel.Player.details.name : ''));
                    } else {
                        var details = TotalChannel.Player.details;
                        if (details) {
                            if (details.event && details.event.channel && details.event.channel.abrev) {
                                title.push(details.event.channel.abrev);
                            } else if (details.channel) {
                                title.push(details.channel.abrev ? details.channel.abrev : (details.channel.name ? details.channel.name : ''));
                            }
                            if (details.program) {
                                var xtitle = "";
                                if (details.program.title)
                                    xtitle = "" + details.program.title;
                                if (details.program.episodeTitle) {
                                    var episodeTitle = "" + details.program.episodeTitle;
                                    if (episodeTitle.toLowerCase().indexOf(xtitle.toLowerCase()) == 0) {
                                        xtitle = episodeTitle;
                                    } else if (episodeTitle.length > 0) {
                                        xtitle += ':' + episodeTitle;
                                    }
                                }
                                if (details.program.season) {
                                    xtitle += "(S." + details.program.season;
                                    if (details.program.episodePartial) {
                                        xtitle += " E." + details.program.episodePartial;
                                    }
                                    xtitle += ")"
                                } else if (details.program.episodePartial) {
                                    xtitle += "(E." + details.program.episodePartial + ")";
                                }
                                title.push(xtitle);
                            }
                        }
                    }
                }
                title = title.join('|');
                var metadata = {
                    filename: url,
                    content_metadata: {
                        title: title
                    },
                    device: {
                        type: 1000,
                        manufacturer: '',
                        year: (new Date().getFullYear()),
                        firmware: navigator.userAgent
                    }
                };
                nice264Plugin.setMetadata(metadata);
            }
        } catch (e) {
            TotalChannel.LOG("Player.setUpNice264Plugin:E:" + e);
        }
    };
    TotalChannel.Player.Connecting = function(url) {
        if (url && url !== null) {
            if (Config.OTTClient.BALANCER == true) {
                TotalChannel.Player.Notify("burl", url);
            }
        } else {
            TotalChannel.Player.Notify("result", "CONNECTING");
        }
    };
    TotalChannel.Player.Notify = function(k, v) {
        if (k == 'error') {
            try {
                if (nice264Plugin && nice264Plugin.error) {
                    try {
                        if (nice264Plugin.player) {
                            if (v && v.stat) {
                                nice264Plugin.player.error = v.stat;
                            }
                        }
                    } catch (perr) {}
                    nice264Plugin.error();
                    if (nice264Plugin.player) {
                        nice264Plugin.player.error = null;
                    }
                    nice264Plugin = null;
                }
            } catch (npawe) {
                TotalChannel.LOG(npawe, true);
            }
        }
        var optdata = Widevine.getOptData();
        if (optdata == "") {
            return;
        }
        try {
            var url;
            if (k == "result" && v == "STOP") {
                if (TotalChannel.Player.BufferEmptyMessages.length > 0) {
                    TotalChannel.Player.BufferEmptyStart = false;
                    var beml = TotalChannel.Player.BufferEmptyMessages.length;
                    var maxlen = beml > 10 ? 10 : beml;
                    var msg = {
                        len: beml,
                        res: TotalChannel.Player.BufferEmptyMessages.slice(0, maxlen)
                    };
                    url = Config.OTTClient.APIURL + Config.OTTClient.logs.RESULT + TotalChannel.Player.AssetID;
                    url += "&k=buffering&v=" + encodeURIComponent(JSON.stringify(msg)) + "&pbid=" + optdata;
                    TotalChannel.GetJSON(url);
                    TotalChannel.Player.BufferEmptyMessages = [];
                }
            }
            if (TotalChannel.Player.AssetID && ((TotalChannel.Player.BufferEmptyStart === false) || (k == "result" && v == "CONNECTING") || (k == "result" && v == "STOP"))) {
                url = Config.OTTClient.APIURL + Config.OTTClient.logs.RESULT + TotalChannel.Player.AssetID;
                if (typeof k == "object") {
                    k = JSON.stringify(k);
                }
                if (typeof v == "object") {
                    v = JSON.stringify(v);
                }
                url += "&k=" + encodeURIComponent(k) + "&v=" + encodeURIComponent(v) + "&pbid=" + optdata;
                TotalChannel.GetJSON(url);
            } else if (TotalChannel.Player.BufferEmptyStart !== false) {
                TotalChannel.Player.BufferEmptyMessages.push(TotalChannel.Player.BufferEmptyStart);
            }
        } catch (e) {}
    };
    TotalChannel.Player.Init = function() {
        setTimeout('try { TotalChannel.GA.Start(); } catch(e) {};', 1e3);
        TotalChannel.Player.isBuffering = false;
        TotalChannel.Player.AssetID = "";
        TotalChannel.Player.IsLiveTV = false;
        Widevine.setOptData("");
        TotalChannel.Player.BufferEmptyStart = false;
        TotalChannel.Player.BufferEmptyMessages = [];
        try {
            var obj = TotalChannel.Player.getObject();
            if (obj && !obj.isStopped())
                obj.stopStream();
        } catch (e) {}
    };
    TotalChannel.Player.CheckCCPlay = function(divId, assetId, isLive, forceStop) {
        if (OTTChromecast.getInstance().status != 4 || !OTTChromecast.getInstance().currentMedia) {
            TotalChannel.Player._doPlay(divId, assetId, isLive, forceStop);
        }
    };
    TotalChannel.Player.firstPlay = true;
    TotalChannel.Player.Play = function(divId, assetId, isLive, forceStop) {
        if (!assetId && TotalChannel.Player.currentInfo && TotalChannel.Player.currentInfo.idAsset) {
            isLive = TotalChannel.Player.currentInfo.isLive;
            assetId = TotalChannel.Player.currentInfo.idAsset;
        }
        var fp = TotalChannel.Player.firstPlay;
        TotalChannel.Player.firstPlay = false;
        if (OTTChromecast.getInstance().status >= 2 && fp == true) {
            setTimeout(function() {
                TotalChannel.Player.CheckCCPlay(divId, assetId, isLive, forceStop);
            }, 1000);
        } else {
            TotalChannel.Player._doPlay(divId, assetId, isLive, forceStop);
        }
    };
    TotalChannel.Player._doPlay = function(divId, assetId, isLive, forceStop) {
        if (forceStop === true && TotalChannel.Player.AssetID && TotalChannel.Player.AssetID.length) {
            TotalChannel.Player.currentInfo = null;
            TotalChannel.Player.Notify("result", "STOP");
            TotalChannel.Player.Init();
            TotalChannel.SL.Stop(false, false);
            setTimeout(function() {
                TotalChannel.Player.Play(divId, assetId, isLive);
            }, 100);
            return;
        }
        if (divId == null || typeof divId !== "string" || !divId.length || divId == "null" || divId == "undefined") {
            divId = TotalChannel.Player.DivID;
        }
        TotalChannel.CheckSession(function() {
            TotalChannel.Player.PlayAsset(divId, assetId, isLive);
        });
    };
    TotalChannel.Player.PlayAsset = function(divId, assetId, isLive) {
        if (isLive == true) {
            TotalChannel.SetCookie("assetid", assetId);
            if (TotalChannel.Player.originalInfo && TotalChannel.Player.originalInfo.isLive === true) {
                if (!TotalChannel.AssetChannel[assetId]) {
                    var first;
                    for (first in TotalChannel.AssetChannel) {
                        if (TotalChannel.AssetChannel.hasOwnProperty(first)) {
                            break;
                        }
                    }
                    assetId = first;
                }
                TotalChannel.Player.originalInfo.idAsset = assetId;
                TotalChannel.Player.originalInfo.idChannel = TotalChannel.AssetChannel[assetId]["id"];
                TotalChannel.Player.details = TotalChannel.AssetChannel[assetId];
            }
        }
        if (OTTChromecast.getInstance().ready()) {
            if (isLive) {
                OTTChromecast.getInstance().play(assetId, true);
            } else {
                OTTChromecast.getInstance().playVOD(assetId);
            }
            return;
        }
        try {
            if (TotalChannelSC.VOD == false) {
                TotalChannel.ALERT(TotalChannel.MESSAGES.VOD_DISABLED);
                return;
            }
        } catch (e) {}
        TotalChannel.Player.Init();
        if (divId != null && typeof divId === "string" && divId.length && divId != "null" && divId != "undefined") {
            TotalChannel.Player.DivID = divId;
        }
        TotalChannel.Player.AssetID = assetId ? assetId : TotalChannel.Player.LastAssetID;
        TotalChannel.Player.IsLiveTV = isLive;
        TotalChannel.SL.CreateAndPlay(divId);
    };
    TotalChannel.Player.Stop = function(canceled, naid) {
        if (naid) {
            TotalChannel.Player.LastAssetID = naid;
            if (naid.length && nice264Plugin) {
                try {
                    nice264Plugin.stop();
                } catch (e) {}
                nice264Plugin = null;
            }
        }
        var oldinfo = TotalChannel.Player.currentInfo;
        TotalChannel.Player.currentInfo = null;
        if (canceled !== true && canceled !== false) {
            TotalChannel.Player.Notify("result", "STOP");
        }
        TotalChannel.Player.Init();
        if (typeof naid == "string" && naid.length) {} else {
            TotalChannel.SL.Stop();
        }
        if (TotalChannel.Player.LastAssetID && TotalChannel.Player.LastAssetID.length && oldinfo) {
            TotalChannel.Player.originalInfo.idAsset = TotalChannel.Player.LastAssetID;
            TotalChannel.Player.originalInfo.idChannel = TotalChannel.AssetChannel[TotalChannel.Player.LastAssetID]["id"];
            TotalChannel.Player.details = TotalChannel.AssetChannel[TotalChannel.Player.LastAssetID];
            TotalChannel.Player.currentInfo = JSON.parse(JSON.stringify(TotalChannel.Player.originalInfo));
            TotalChannel.Player.IsLiveTV = TotalChannel.Player.currentInfo.isLive;
            if (TotalChannel.Player.IsLiveTV) {
                TotalChannel.SetCookie("assetid", TotalChannel.Player.LastAssetID);
            }
        }
    };
    TotalChannel.History = TotalChannel.History || {};
    TotalChannel.History.NewWindow = function(args) {};
    TotalChannel.Player.BufferEmpty = function() {
        if (TotalChannel.Player.BufferEmptyStart === false) {
            var nw = (new Date()).toISOString();
            var iso = nw.match(/(\d{4}\-\d{2}\-\d{2})T(\d{2}:\d{2}:\d{2})/);
            TotalChannel.Player.BufferEmptyStart = iso[1] + ' ' + iso[2];
        }
    };
    TotalChannel.Player.mediaBuffering = function() {
        if (nice264Plugin == null || Config.OTTClient.ANALYTICS == false) {
            TotalChannel.LOG("mediaBuffering: ANALYTICS DISABLED", true);
            return;
        }
        try {
            nice264Plugin.buffer(Nice264AnalyticsEvents.BUFFER_BEGIN);
        } catch (ex) {}
    };
    TotalChannel.Player.silverlightUnloaded = function(show) {
        clearTimeout(TotalChannel.Player.silverlightUnloadedTimeout);
        TotalChannel.Player.silverlightUnloadedTimeout = setTimeout(function() {
            try {
                if (!TotalChannel.Player.getObject()) {
                    var pobj = jQuery("#" + TotalChannel.Player.DivID);
                    var pcont = pobj.parent();
                    pobj.removeClass("slplayer-loaded");
                    pcont.removeClass("slplayer-loaded");
                    var bg = '' + pobj.css('background-image');
                    if (!bg.length || bg === 'none' || bg === 'undefined' || bg === 'null') {
                        pobj.addClass('slplayer-hide');
                        pcont.addClass('slplayer-hide');
                    } else {
                        pobj.removeClass('slplayer-hide');
                        pcont.removeClass('slplayer-hide');
                        if (show === true) {
                            pobj.show();
                            pcont.show();
                        }
                    }
                } else {}
            } catch (e) {}
        }, 500);
    };
    TotalChannel.Player.silverlightLoaded = function() {
        try {
            clearTimeout(TotalChannel.Player.silverlightUnloadedTimeout);
            var pobj = jQuery("#" + TotalChannel.Player.DivID);
            var pcont = pobj.parent();
            if (!OTTChromecast.getInstance().ready()) {
                pobj.addClass("slplayer-loaded").removeClass('slplayer-hide').show();
                pcont.addClass("slplayer-loaded").removeClass('slplayer-hide').show();
            }
        } catch (e) {}
    };
    TotalChannel.Player.mediaCurrentStateChanged = function(e, t) {
        if (e == "Opening") {
            TotalChannel.Player.silverlightLoaded();
        }
        if (nice264Plugin == null || Config.OTTClient.ANALYTICS == false) {
            TotalChannel.LOG("mediaCurrentStateChanged: ANALYTICS DISABLED", true);
            return;
        }
        try {
            var t = nice264Plugin.player;
            if (t && !t.mediaPlayInfo) {
                t.now = 0;
                t.bytes = 0;
                t.mediaPlayInfo = function() {
                    var bitrate = 0;
                    var nw = (new Date()).getTime();
                    var bytes = TotalChannel.Player.getObject().getBytesDownloaded();
                    if (t.now > 0) {
                        var bits = (bytes - t.bytes) * 8;
                        var secs = (nw - t.now) / 1e3;
                        bitrate = Math.floor(bits / secs);
                    }
                    t.now = nw;
                    t.bytes = bytes;
                    return {
                        bitrateInstant: bitrate
                    };
                }
            }
            if (t && e == "Opening") {
                t.now = 0;
                t.bytes = 0;
            }
        } catch (e) {}
        try {
            if (nice264Plugin) {
                if (e == "Buffering") {
                    TotalChannel.Player.isBuffering = true;
                    nice264Plugin.buffer(Nice264AnalyticsEvents.BUFFER_BEGIN);
                    return;
                } else if (TotalChannel.Player.isBuffering == true && e === "Playing") {
                    nice264Plugin.isJoinEventSent = true;
                    if (nice264Plugin.player && typeof nice264Plugin.player.playPosition == 'undefined') {
                        nice264Plugin.player.playPosition = TotalChannel.Player.getElapsedTime();
                    }
                    nice264Plugin.buffer(Nice264AnalyticsEvents.BUFFER_END);
                    nice264Plugin.resume();
                    TotalChannel.Player.isBuffering = false;
                    return;
                } else if (e == "Playing") {
                    nice264Plugin.join(Nice264AnalyticsEvents.BUFFER_END);
                    TotalChannel.Player.isBuffering = false;
                } else {
                    TotalChannel.Player.isBuffering = false;
                }
            }
            silverlight2Media.mediaCurrentStateChanged({
                findName: function() {
                    return {
                        CurrentState: e
                    };
                }
            }, t);
        } catch (ex) {}
    };
    TotalChannel.Player.updateVolume = function(vol) {
        try {
            TotalChannel.SetCookie("player.volume", vol);
        } catch (e) {}
    };
    TotalChannel.Player.mediaEnded = function() {
        if (nice264Plugin == null || Config.OTTClient.ANALYTICS == false) {
            return;
        }
        try {
            var nicePluginRef = nice264Plugin;
            nice264Plugin = null;
            nicePluginRef._mustStop = true;
            setTimeout(function() {
                if (nicePluginRef && nicePluginRef._mustStop === true) {
                    nicePluginRef._mustStop = false;
                    nicePluginRef.stop();
                }
                nicePluginRef = null;
            }, 500);
        } catch (ex) {
            TotalChannel.LOG("TotalChannel.Player.mediaEnded:E:" + ex);
        }
    };
    TotalChannel.Player.AudioSet = function() {};
    TotalChannel.Player.SetRate = function() {};
    TotalChannel.Player.Subtitle = TotalChannel.Player.Subtitle || {
        enabled: false
    };
    TotalChannel.Player.Subtitle.Set = function(args) {
        TotalChannel.Player.Subtitle.enabled = (args && args.length) ? true : false;
    };
    TotalChannel.Player.Subtitle.Loaded = function(args) {};
    TotalChannel.Player.Subtitle.Send = function(args) {};
    TotalChannel.Player.Subtitle.Enabled = function() {
        return TotalChannel.Player.Subtitle.enabled;
    };
    TotalChannel.Player.NumAudioChannels = function() {};
    jQuery.noConflict()(window).unload(function() {
        if (nice264Plugin) {
            try {
                nice264Plugin.stop();
            } catch (ex1) {}
            nice264Plugin = null;
        }
        try {
            TotalChannel.Player.Stop();
        } catch (ex2) {}
    });
}
if (typeof JS_TOTALCHANNEL_GA == "undefined") {
    JS_TOTALCHANNEL_GA = true;
    TotalChannel.GA = {
        _interval: 0,
        _info: '',
        _timeout: 60
    };
    TotalChannel.GA.Start = function() {
        if (typeof ga === "undefined") {
            return;
        }
        if (!TotalChannel.Player.AssetID || !TotalChannel.Player.AssetID.length) {
            TotalChannel.GA._info = '';
            TotalChannel.GA.stopInterval();
            return;
        }
        var title = [];
        try {
            if (TotalChannel.Player.details) {
                if (TotalChannel.Player.IsLiveTV) {
                    title.push('LIVE');
                    title.push(TotalChannel.Player.details.alias && TotalChannel.Player.details.alias.length ? TotalChannel.Player.details.alias : (TotalChannel.Player.details.name && TotalChannel.Player.details.name.length ? TotalChannel.Player.details.name : ''));
                } else {
                    title.push('VOD');
                    var details = TotalChannel.Player.details;
                    if (details) {
                        if (details.event && details.event.channel && details.event.channel.abrev) {
                            title.push(details.event.channel.abrev);
                        } else if (details.channel) {
                            title.push(details.channel.abrev ? details.channel.abrev : (details.channel.name ? details.channel.name : ''));
                        }
                        if (details.program) {
                            var xtitle = "";
                            if (details.program.title)
                                xtitle = "" + details.program.title;
                            if (details.program.episodeTitle) {
                                var episodeTitle = "" + details.program.episodeTitle;
                                if (episodeTitle.toLowerCase().indexOf(xtitle.toLowerCase()) == 0) {
                                    xtitle = episodeTitle;
                                } else if (episodeTitle.length > 0) {
                                    xtitle += ':' + episodeTitle;
                                }
                            }
                            if (details.program.season) {
                                xtitle += "(S." + details.program.season;
                                if (details.program.episodePartial) {
                                    xtitle += " E." + details.program.episodePartial;
                                }
                                xtitle += ")"
                            } else if (details.program.episodePartial) {
                                xtitle += "(E." + details.program.episodePartial + ")";
                            }
                            title.push(xtitle);
                        }
                    }
                }
            } else {
                if (TotalChannel.Player.IsLiveTV) {
                    title.push('LIVE');
                } else {
                    title.push('VOD');
                }
            }
            title = title.join('|');
        } catch (e) {}
        TotalChannel.GA.startInterval(TotalChannel.Player.AssetID + "|" + title);
    };
    TotalChannel.GA.stopInterval = function() {
        if (TotalChannel.GA._interval > 0) {
            clearInterval(TotalChannel.GA._interval);
            TotalChannel.GA._interval = 0;
        }
    };
    TotalChannel.GA.startInterval = function(info) {
        TotalChannel.GA._info = info;
        TotalChannel.GA.stopInterval();
        TotalChannel.GA.sendEvt();
        TotalChannel.GA._interval = setInterval("TotalChannel.GA.sendEvt();", TotalChannel.GA._timeout * 1e3)
    };
    TotalChannel.GA.sendEvt = function() {
        try {
            if (TotalChannel.GA._info && TotalChannel.GA._info.length) {
                ga('send', 'event', 'EVT_' + TotalChannel.GA._timeout + '_PLAY', TotalChannel.GA._info);
            }
        } catch (e) {
            console.log(e);
        }
    };
}
