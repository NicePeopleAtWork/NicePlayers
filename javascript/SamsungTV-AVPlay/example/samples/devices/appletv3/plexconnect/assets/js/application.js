/**
 * @license
 * Youboralib 2.0-appleTv3 <http://youbora.com/>
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */
try {
    var $YB = $YB || {
        version: "2.0-appleTv3",
        errorLevel: 1,
        report: function(t, e, i) {
            i = i || 4, i <= $YB.errorLevel && yblog(t)
        },
        error: function(t) {
            $YB.report(t, "darkred", 1)
        },
        warning: function(t) {
            $YB.report(t, "darkorange", 2)
        },
        info: function(t) {
            $YB.report(t, "navy", 3)
        },
        notice: function(t) {
            $YB.report(t, "darkcyan", 4)
        },
        noticeRequest: function(t) {
            $YB.report(t, "darkgreen", 4)
        },
        debug: function(t) {
            $YB.report(t, "purple", 5)
        },
        log: function(t) {
            this.errorLevel >= 4 && yblog(t)
        },
        plugins: {},
        adnalyzers: {},
        util: {
            listenAllEvents: function() {},
            serialize: function() {},
            inspect: function(t) {
                if (4 <= $YB.errorLevel)
                    for (var e in t) $YB.notice(e + " > " + t[e])
            },
            getFirstDefined: function(t) {
                if ("undefined" != typeof t && "[object Array]" === Object.prototype.toString.call(t)) {
                    for (var e = 0; e < t.length; e++) {
                        if ("function" == typeof t[e] && "undefined" != typeof t[e]() && null !== t[e]()) return $YB.util.getFirstDefined(t[e]());
                        if ("undefined" != typeof t[e] && null !== t[e]) return $YB.util.getFirstDefined(t[e])
                    }
                    return null
                }
                return t
            }
        }
    };
    $YB.notice("YouboraLib " + $YB.version + " is ready.")
} catch (err) {
    var m = "[Youbora] Fatal Error: Unable to start Youboralib.";
    yblog(m), yblog(err)
}
$YB.AdnalyzerApi = function(t) {
    this.context = t, this.data = this.context.data, this.buffer = new $YB.Buffer(this), this.chrono = {
        total: new $YB.Chrono,
        joinTime: new $YB.Chrono,
        buffer: this.buffer.chrono
    }
}, $YB.AdnalyzerApi.prototype = {
    isStartSent: !1,
    isJoinSent: !1,
    isBuffering: !1,
    counter: {
        pre: 0,
        mid: 0,
        post: 0,
        unknown: 0
    },
    totalPrerollTime: 0,
    position: ""
}, $YB.AdnalyzerApi.prototype.handleStart = function(t) {
    try {
        this.context.isStartSent && (this.isStartSent && this.handleStop(), this.buffer.autostart && this.buffer.start(), this.isStartSent = !0, this.chrono.total.start(), this.chrono.joinTime.start(), t = t || {}, t.resource = [t.resource, this.getResource()], t.position = [t.position, this.getPosition()], t.number = [t.number, this._getNumber(t.position)], t.campaign = [t.campaign, this.data.ads.campaign], t.title = [t.title, this.getTitle()], t.adDuration = [t.adDuration, this.data.ads.duration], t.playhead = [t.playhead, this.context.getPlayhead()], "undefined" != typeof t.durationJointime && (this.isJoinSent = !0), this.position = $YB.util.getFirstDefined(t.position), this.context.comm.sendAdStart(t))
    } catch (e) {
        $YB.error(e)
    }
}, $YB.AdnalyzerApi.prototype.handleJoin = function(t) {
    try {
        this.isStartSent && !this.isJoinSent && (this.isJoinSent = !0, this.buffer.autostart && this.buffer.start(), t = t || {}, t.adPlayhead = [t.adPlayhead, this.getPlayhead()], t.duration = [t.duration, this.chrono.joinTime.getDeltaTime()], this.context.comm.sendAdJoin(t))
    } catch (e) {
        $YB.error(e)
    }
}, $YB.AdnalyzerApi.prototype.startAutobuffer = function() {
    this.context.data.enableNiceBuffer && (this.buffer.autostart = !0)
}, $YB.AdnalyzerApi.prototype.handleBufferStart = function(t) {
    try {
        this.isJoinSent && !this.isBuffering && (this.isBuffering = !0, this.chrono.buffer.start())
    } catch (e) {
        $YB.error(e)
    }
}, $YB.AdnalyzerApi.prototype.handleBufferEnd = function(t) {
    try {
        this.isJoinSent && this.isBuffering && (this.isBuffering = !1, t = t || {}, t.adPlayhead = [t.adPlayhead, this.getPlayhead()], t.duration = [t.duration, this.chrono.buffer.getDeltaTime()], this.context.comm.sendAdBuffer(t))
    } catch (e) {
        $YB.error(e)
    }
}, $YB.AdnalyzerApi.prototype.handleStop = function(t) {
    try {
        this.isStartSent && (this.isStartSent = !1, this.isJoinSent = !1, this.isBuffering = !1, this.buffer.stop(), t = t || {}, t.totalDuration = [t.totalDuration, this.chrono.total.getDeltaTime()], t.adPlayhead = [t.adPlayhead, this.getPlayhead()], t.adBitrate = [t.adBitrate, this.getBitrate()], "pre" != this.position || this.context.isJoinSent || (this.totalPrerollTime += $YB.util.getFirstDefined(t.totalDuration)), this.context.comm.sendAdStop(t))
    } catch (e) {
        $YB.error(e)
    }
}, $YB.AdnalyzerApi.prototype._getNumber = function(t) {
    switch ($YB.util.getFirstDefined(t)) {
        case "pre":
            return ++this.counter.pre;
        case "mid":
            return ++this.counter.mid;
        case "post":
            return ++this.counter.post;
        default:
            return ++this.counter.unknown
    }
}, $YB.AdnalyzerApi.prototype.getResource = function() {
    try {
        return "undefined" != typeof this.data.ads.resource ? this.data.ads.resource : "undefined" != typeof this.context.plugin.ads && "function" == typeof this.context.plugin.ads.getResource ? this.context.plugin.ads.getResource() : ""
    } catch (t) {
        return $YB.warning(t), ""
    }
}, $YB.AdnalyzerApi.prototype.getPlayhead = function() {
    try {
        return "undefined" != typeof this.context.plugin.ads && "function" == typeof this.context.plugin.ads.getPlayhead ? this.context.plugin.ads.getPlayhead() : 0
    } catch (t) {
        return $YB.warning(t), 0
    }
}, $YB.AdnalyzerApi.prototype.getPosition = function() {
    try {
        return "undefined" != typeof this.data.ads.position ? this.data.ads.position : "undefined" != typeof this.context.plugin.ads && "function" == typeof this.context.plugin.ads.getPosition ? this.context.plugin.ads.getPosition() : "unknown"
    } catch (t) {
        return $YB.warning(t), "unknown"
    }
}, $YB.AdnalyzerApi.prototype.getTitle = function() {
    try {
        return "undefined" != typeof this.data.ads.title ? this.data.ads.title : "undefined" != typeof this.context.plugin.ads && "function" == typeof this.context.plugin.ads.getTitle ? this.context.plugin.ads.getTitle() : ""
    } catch (t) {
        return $YB.warning(t), ""
    }
}, $YB.AdnalyzerApi.prototype.getAdDuration = function() {
    try {
        if ("undefined" != typeof this.data.ads.duration) return this.data.ads.duration;
        if ("undefined" != typeof this.context.plugin.ads && "function" == typeof this.context.plugin.ads.getAdDuration) {
            var t = this.context.plugin.ads.getAdDuration();
            return 0 === t || t == 1 / 0 || isNaN(t) ? 0 : Math.round(t)
        }
        return 0
    } catch (e) {
        return $YB.warning(e), 0
    }
}, $YB.AdnalyzerApi.prototype.getBitrate = function() {
    try {
        return "undefined" != typeof this.context.plugin.ads && "function" == typeof this.context.plugin.ads.getBitrate ? Math.round(this.context.plugin.ads.getBitrate()) : -1
    } catch (t) {
        return $YB.warning(t), -1
    }
}, $YB.AjaxRequest = function(t, e, i, r) {
    try {
        this.xmlHttp = this.createXMLHttpRequest(), this.host = t, this.service = e || "", this.params = i || "", this.options = r || {}, this.options.method = this.options.method || $YB.AjaxRequest.options.method, this.options.maxRetries = this.options.maxRetries || $YB.AjaxRequest.options.maxRetries, this.options.retryAfter || (this.options.retryAfter = $YB.AjaxRequest.options.retryAfter), this.hasError = !1, this.retries = 0
    } catch (n) {
        $YB.error(n)
    }
}, $YB.AjaxRequest.options = {
    method: "GET",
    requestHeader: {},
    maxRetries: 5,
    retryAfter: 5e3
}, $YB.AjaxRequest.prototype.getUrl = function() {
    try {
        return this.params ? this.host + this.service + "?" + this.params : this.host + this.service
    } catch (t) {
        $YB.error(t)
    }
}, $YB.AjaxRequest.prototype.on = function(t, e) {
    try {
        "error" == t && (this.hasError = !0);
        var i = this;
        "function" == typeof e ? this.xmlHttp.onreadystatechange = function() {
            4 == i.xmlHttp.readyState && e()
        } : "undefined" != typeof e && $YB.warning("Warning: Request '" + i.getUrl() + "' has a callback that is not a function.")
    } catch (r) {
        $YB.error(r)
    } finally {
        return this
    }
}, $YB.AjaxRequest.prototype.load = function(t) {
    return this.on("load", t)
}, $YB.AjaxRequest.prototype.error = function(t) {
    return this.on("error", t)
}, $YB.AjaxRequest.prototype.append = function(t) {
    return this.params.length > 0 && (t = "&" + t), this.params += t, this
}, $YB.AjaxRequest.prototype.send = function() {
    try {
        if (this.xmlHttp.open(this.options.method, this.getUrl(), !1), this.options.requestHeader)
            for (var t in this.options.requestHeader) this.options.hasOwnProperty(t) && this.xmlHttp.setRequestHeader(t, this.options.requestHeader[t]);
        if (!this.hasError && this.options.retryAfter > 0) {
            var e = this;
            this.error(function r() {
                e.retries++, e.retries > e.options.maxRetries ? $YB.error("Error: Aborting failed request. Max retries reached.") : ($YB.error("Error: Request failed. Retry " + e.retries + " of " + e.options.maxRetries + " in " + e.options.retryAfter + "ms."), atv.setTimeout(function() {
                    e.xmlHttp.removeEventListener("error", r), e.send()
                }, e.options.retryAfter))
            })
        }
        this.xmlHttp.send()
    } catch (i) {
        $YB.error(i)
    }
}, $YB.AjaxRequest.prototype.createXMLHttpRequest = function() {
    try {
        return "undefined" != typeof XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP")
    } catch (t) {
        return $YB.error(t), {}
    }
}, $YB.Buffer = function(t, e) {
    try {
        this.context = t, this.chrono = new $YB.Chrono, this.options = e || {}, this.options.interval = this.options.interval || 800, this.options.threshold = this.options.threshold || 400, this.options.skipMiniBuffer = this.options.skipMiniBuffer || !0, this.timer = null, this.lastPlayhead = 0, this.autostart = !1
    } catch (i) {
        $YB.error(i)
    }
}, $YB.Buffer.prototype.start = function() {
    try {
        if (null === this.timer)
            if ("function" == typeof this.context.getPlayhead) {
                var t = this;
                this.lastPlayhead = 0, this.chrono.start(), this.timer = atv.setInterval(function() {
                    try {
                        t._checkBuffer()
                    } catch (e) {
                        $YB.error(e)
                    }
                }, this.options.interval)
            } else $YB.warning("Warning: Can't start autobuffer because context does not implement getPlayhead().")
    } catch (e) {
        $YB.error(e)
    }
}, $YB.Buffer.prototype._checkBuffer = function() {
    try {
        if (this.context.isJoinSent && !this.context.isPaused && !this.context.isSeeking) {
            var t = this.context.getPlayhead();
            Math.abs(1e3 * this.lastPlayhead - 1e3 * t) > this.options.threshold ? (this.lastPlayhead = t, (!this.options.skipMiniBuffer || this.chrono.stop() > 1.1 * this.options.interval) && this.context.handleBufferEnd()) : this.lastPlayhead && !this.context.isBuffering && Math.abs(1e3 * this.lastPlayhead - 1e3 * t) < this.options.threshold && this.context.handleBufferStart()
        }
    } catch (e) {
        $YB.error(e)
    }
}, $YB.Buffer.prototype.stop = function() {
    try {
        return atv.clearInterval(this.timer), this.timer = null, this.chrono.stop()
    } catch (t) {
        $YB.error(t)
    }
}, $YB.Chrono = function() {
    try {
        this.startTime = 0, this.lastTime = 0
    } catch (t) {
        $YB.error(t)
    }
}, $YB.Chrono.prototype.getDeltaTime = function() {
    try {
        return this.startTime ? 0 === this.lastTime ? this.stop() : this.lastTime - this.startTime : -1
    } catch (t) {
        $YB.error(t)
    }
}, $YB.Chrono.prototype.start = function() {
    try {
        this.startTime = (new Date).getTime(), this.lastTime = 0
    } catch (t) {
        $YB.error(t)
    }
}, $YB.Chrono.prototype.stop = function() {
    try {
        return this.lastTime = (new Date).getTime(), this.getDeltaTime()
    } catch (t) {
        $YB.error(t)
    }
}, $YB.Chrono.prototype.isStoped = function() {
    try {
        return 0 !== this.lastTime
    } catch (t) {
        return $YB.error(t), !1
    }
}, $YB.Communication = function(t) {
    try {
        this.context = t, this.host = t.data.service, this.pingTime = 5, this.code = "", this.view = -1, this._lastDurationSent = 0, this._requests = {}, this._preloaders = [], this.addPreloader("FastData")
    } catch (e) {
        $YB.error(e)
    }
}, $YB.Communication.prototype.getViewCode = function() {
    return this.code ? this.code + "_" + this.view : "nocode"
}, $YB.Communication.prototype.sendData = function(t, e) {
    try {
        t = t || {}, delete t.code;
        var i = this,
            r = new $YB.AjaxRequest(this._parseServiceHost(this.host), "/data", this._parseParams(t));
        r.load(function() {
            i.receiveData(r), e()
        }), r.send(), $YB.noticeRequest("Request: NQS /data " + t.system)
    } catch (n) {
        $YB.error(n)
    }
}, $YB.Communication.prototype.receiveData = function(t) {
    try {
        var e = t.xmlHttp.responseXML.rootElement,
            i = {
                h: e.getElementsByName("h"),
                c: e.getElementsByName("c"),
                pt: e.getElementsByName("pt"),
                b: e.getElementsByName("b")
            };
        i.h.length > 0 && i.c.length > 0 && i.pt.length > 0 && i.b.length > 0 ? (this.code = i.c[0].textContent, this.host = i.h[0].textContent, this.pingTime = i.pt[0].textContent, this.balancerEnabled = i.b[0].textContent, $YB.noticeRequest("FastData '" + this.code + "'is ready."), this._requests.nocode && this._requests.nocode.length > 0 && (this._requests[this.getViewCode()] = [], this._requests[this.getViewCode()] = this._requests.nocode, delete this._requests.nocode), this.removePreloader("FastData")) : $YB.warning("Warning: FastData response is wrong.")
    } catch (r) {
        $YB.error(r)
    }
}, $YB.Communication.prototype.sendStart = function(t, e) {
    try {
        this.view++, t = t || {}, delete t.code, t.totalBytes = [t.totalBytes, 0], t.pingTime = [t.pingTime, this.pingTime], t.properties = [t.properties, {}], t.pingTime = [t.pingTime, this.pingTime], t.live = [t.live, !1], this.checkMandatoryParams(t, ["system", "pluginVersion", "user", "resource"]), this.sendRequest("/start", t, e), this._lastDurationSent = t.duration, $YB.noticeRequest("Request: NQS /start " + t.resource)
    } catch (i) {
        $YB.error(i)
    }
}, $YB.Communication.prototype.sendJoin = function(t, e) {
    try {
        t = t || {}, delete t.code, this.checkMandatoryParams(t, ["time"]), t.mediaDuration = $YB.util.getFirstDefined(t.mediaDuration), t.mediaDuration === this._lastDurationSent && delete t.mediaDuration, this.sendRequest("/joinTime", t, e), $YB.noticeRequest("Request: NQS /joinTime " + t.time + "ms")
    } catch (i) {
        $YB.error(i)
    }
}, $YB.Communication.prototype.sendStop = function(t, e) {
    try {
        t = t || {}, delete t.code, this.sendRequest("/stop", t, e), $YB.noticeRequest("Request: NQS /stop")
    } catch (i) {
        $YB.error(i)
    }
}, $YB.Communication.prototype.sendPause = function(t, e) {
    try {
        t = t || {}, delete t.code, this.sendRequest("/pause", t, e), $YB.noticeRequest("Request: NQS /pause")
    } catch (i) {
        $YB.error(i)
    }
}, $YB.Communication.prototype.sendResume = function(t, e) {
    try {
        t = t || {}, delete t.code, this.sendRequest("/resume", t, e), $YB.noticeRequest("Request: NQS /resume")
    } catch (i) {
        $YB.error(i)
    }
}, $YB.Communication.prototype.sendBuffer = function(t, e) {
    try {
        t = t || {}, delete t.code, this.checkMandatoryParams(t, ["time", "duration"]), this.sendRequest("/bufferUnderrun", t, e), $YB.noticeRequest("Request: NQS /bufferUnderrun " + t.duration + "ms")
    } catch (i) {
        $YB.error(i)
    }
}, $YB.Communication.prototype.sendPing = function(t, e) {
    try {
        t = t || {}, delete t.code, t.totalBytes = [t.totalBytes, 0], t.pingTime = [t.pingTime, this.pingTime], this.checkMandatoryParams(t, ["time"]), this.sendRequest("/ping", t, e)
    } catch (i) {
        $YB.error(i)
    }
}, $YB.Communication.prototype.sendError = function(t, e) {
    try {
        t = t || {}, delete t.code, t.msg = [t.msg, "Unknown Error"], ("undefined" == typeof t.errorCode || parseInt(t.errorCode) < 0) && (t.errorCode = 9e3), this.checkMandatoryParams(t, ["msg", "errorCode", "player"]), this.sendRequest("/error", t, e), $YB.noticeRequest("Request: NQS /error " + t.msg)
    } catch (i) {
        $YB.error(i)
    }
}, $YB.Communication.prototype.sendSeek = function(t, e) {
    try {
        t = t || {}, delete t.code, this.checkMandatoryParams(t, ["time", "duration"]), this.sendRequest("/seek", t, e), $YB.noticeRequest("Request: NQS /seek " + t.duration + "ms")
    } catch (i) {
        $YB.error(i)
    }
}, $YB.Communication.prototype.sendAdStart = function(t, e) {
    try {
        t = t || {}, delete t.code, this.checkMandatoryParams(t, ["position", "number", "playhead", "campaign"]), this.sendRequest("/adStart", t, e), $YB.noticeRequest("Request: NQS /adStart " + t.position + t.number)
    } catch (i) {
        $YB.error(i)
    }
}, $YB.Communication.prototype.sendAdJoin = function(t, e) {
    try {
        t = t || {}, delete t.code, this.checkMandatoryParams(t, ["adPlayhead", "duration"]), this.sendRequest("/adJoinTime", t, e), $YB.noticeRequest("Request: NQS /adJoinTime " + t.duration + "ms")
    } catch (i) {
        $YB.error(i)
    }
}, $YB.Communication.prototype.sendAdStop = function(t, e) {
    try {
        t = t || {}, delete t.code, this.checkMandatoryParams(t, ["adPlayhead", "totalDuration"]), this.sendRequest("/adStop", t, e), $YB.noticeRequest("Request: NQS /adStop " + t.totalDuration + "ms")
    } catch (i) {
        $YB.error(i)
    }
}, $YB.Communication.prototype.sendAdBuffer = function(t, e) {
    try {
        t = t || {}, delete t.code, this.checkMandatoryParams(t, ["adPlayhead", "totalDuration"]), this.sendRequest("/adBufferUnderrun", t, e), $YB.noticeRequest("Request: NQS /bufferUnderrun " + t.duration + "ms")
    } catch (i) {
        $YB.error(i)
    }
}, $YB.Communication.prototype.sendRequest = function(t, e, i) {
    try {
        if (this.isAllowed(t)) {
            var r = new $YB.AjaxRequest("", t, this._parseParams(e));
            r.load(i), this._registerRequest(r)
        }
    } catch (n) {
        $YB.error(n)
    }
}, $YB.Communication.prototype.sendService = function(t, e, i) {
    try {
        var r = new $YB.AjaxRequest(this._parseServiceHost(t), "", this._parseParams(e));
        r.load(i), this._registerRequest(r)
    } catch (n) {
        $YB.error(n)
    }
}, $YB.Communication.prototype.isAllowed = function(t) {
    return this.context.data.enableAnalytics && !(t in this.context.data.disabledRequests)
}, $YB.Communication.prototype.addPreloader = function(t) {
    try {
        this._preloaders.push(t)
    } catch (e) {
        $YB.error(e)
    }
}, $YB.Communication.prototype.removePreloader = function(t) {
    try {
        var e = this._preloaders.indexOf(t); - 1 !== e ? (this._preloaders.splice(e, 1), this._sendRequests()) : $YB.warning("Warning: trying to remove unexisting preloader '" + t + "'.")
    } catch (i) {
        $YB.error(i)
    }
}, $YB.Communication.prototype.checkMandatoryParams = function(t, e) {
    try {
        if ($YB.errorLevel >= 2) {
            for (var i = e.length, r = !0; i--;) e[i] in t || (r = !1, $YB.warning("Warning: Missing mandatory parameter '" + e[i] + "' in the request."));
            return r
        }
        return null
    } catch (n) {
        $YB.error(n)
    }
}, $YB.Communication.prototype._registerRequest = function(t) {
    try {
        return "undefined" == typeof this._requests[this.getViewCode()] && (this._requests[this.getViewCode()] = []), t.append("timemark=" + (new Date).getTime()), this._requests[this.getViewCode()].push(t), this._sendRequests(), t
    } catch (e) {
        $YB.error(e)
    }
}, $YB.Communication.prototype._sendRequests = function() {
    try {
        if (0 === this._preloaders.length)
            for (var t in this._requests)
                if (this._requests.hasOwnProperty(t))
                    for (; this._requests[t].length > 0;) {
                        var e = this._requests[t].shift();
                        e.append("code=" + t), e.host || (e.host = this._parseServiceHost(this.host)), e.send()
                    }
    } catch (i) {
        $YB.error(i)
    }
}, $YB.Communication.prototype._parseServiceHost = function(t) {
    try {
        return 0 === t.indexOf("//") ? t = t.slice(2) : 0 === t.indexOf("http://") ? t = t.slice(7) : 0 === t.indexOf("https://") && (t = t.slice(8)), t = this.context.data.httpSecure === !0 ? "https://" + t : this.context.data.httpSecure === !1 ? "http://" + t : "//" + t
    } catch (e) {
        return $YB.error(e), "http://localhost"
    }
}, $YB.Communication.prototype._parseParams = function(t) {
    try {
        if ("string" == typeof t) return t;
        if (null !== t && "object" == typeof t) {
            var e = "";
            for (var i in t) t[i] = $YB.util.getFirstDefined(t[i]), null !== t[i] && "object" == typeof t[i] ? e += encodeURIComponent(i) + "=" + encodeURIComponent(JSON.stringify(t[i])) + "&" : null !== t[i] && "undefined" != typeof t[i] && "" !== t[i] && (e += encodeURIComponent(i) + "=" + encodeURIComponent(t[i]) + "&");
            return e.slice(0, -1)
        }
        return ""
    } catch (r) {
        return $YB.error(r), ""
    }
}, $YB.ConcurrencyService = function(t, e) {
    try {
        this.context = t, this.interval = e || 1e4, this.timer = null, this.sessionId = Math.random(), this.data = this.context.data, this.config = this.context.data.concurrencyConfig, this._init()
    } catch (i) {
        $YB.error(i)
    }
}, $YB.ConcurrencyService.prototype._init = function() {
    try {
        var t = this;
        this.timer = atv.setInterval(function() {
            t._checkConcurrency()
        }, this.interval)
    } catch (e) {
        $YB.error(e)
    }
}, $YB.ConcurrencyService.prototype._checkConcurrency = function() {
    try {
        var t = {};
        t = this.config.ipMode ? {
            accountCode: this.data.accountCode,
            concurrencyCode: this.config.contentId,
            concurrencyMaxCount: this.config.maxConcurrents
        } : {
            accountCode: this.data.accountCode,
            concurrencyCode: this.config.contentId,
            concurrencySessionId: this.sessionId,
            concurrencyMaxCount: this.config.maxConcurrents
        };
        var e = this;
        this.context.comm.sendService(this.config.service, t, function(t) {
            "1" === t.response ? (e.context.handleError({
                errorCode: 14e3,
                msg: "CC_KICK"
            }), "function" == typeof e.config.redirect ? e.config.redirect() : window.location = e.config.redirect) : "0" === t.response || atv.clearInterval(e.timer)
        })
    } catch (i) {
        $YB.error(i)
    }
}, $YB.Data = function(t) {
    try {
        this.setOptions(t)
    } catch (e) {
        $YB.error(e)
    }
}, $YB.Data.prototype = {
    enableAnalytics: !0,
    disabledRequests: [],
    parseHLS: !1,
    parseCDNNodeHost: !1,
    hashTitle: !0,
    httpSecure: void 0,
    enableNiceBuffer: !0,
    accountCode: "demosite",
    service: "nqs.nice264.com",
    username: void 0,
    transactionCode: void 0,
    isBalanced: 0,
    network: {
        cdn: void 0,
        ip: void 0,
        isp: void 0
    },
    media: {
        isLive: void 0,
        resource: void 0,
        title: void 0,
        duration: void 0
    },
    ads: {
        expected: !1,
        resource: void 0,
        campaign: void 0,
        title: void 0,
        position: void 0,
        duration: void 0
    },
    properties: {
        filename: void 0,
        content_id: void 0,
        content_metadata: {
            title: void 0,
            genre: void 0,
            language: void 0,
            year: void 0,
            cast: void 0,
            director: void 0,
            owner: void 0,
            duration: void 0,
            parental: void 0,
            price: void 0,
            rating: void 0,
            audioType: void 0,
            audioChannels: void 0
        },
        transaction_type: void 0,
        quality: void 0,
        content_type: void 0,
        device: {
            manufacturer: void 0,
            type: void 0,
            year: void 0,
            firmware: void 0
        }
    },
    extraParams: {
        param1: void 0,
        param2: void 0,
        param3: void 0,
        param4: void 0,
        param5: void 0,
        param6: void 0,
        param7: void 0,
        param8: void 0,
        param9: void 0,
        param10: void 0
    },
    concurrencyConfig: {
        enabled: !1,
        contentId: "",
        maxConcurrents: 1,
        service: "pc.youbora.com/cping",
        redirect: "http://www.google.com",
        ipMode: !1
    },
    resumeConfig: {
        enabled: !1,
        contentId: "",
        service: "pc.youbora.com/resume",
        playTimeService: "pc.youbora.com/playTime",
        callback: function(t) {
            console.log("ResumeService Callback: Seek to second " + t)
        }
    },
    smartswitchConfig: {
        enabled: !1,
        type: "balance",
        service: "smartswitch.youbora.com",
        zoneCode: "",
        originCode: "",
        niceNVA: "",
        niceNVB: "",
        token: ""
    },
    setOptions: function(t, e) {
        try {
            if (e = e || this, "undefined" != typeof t)
                for (var i in t) "object" == typeof e[i] && null !== e[i] ? this.setOptions(t[i], e[i]) : e[i] = t[i]
        } catch (r) {
            $YB.error(r)
        }
    }
}, $YB.DataMap = function() {
    this._map = {}
}, $YB.DataMap.prototype.getLength = function() {
    return this._map.length
}, $YB.DataMap.prototype.add = function(t, e) {
    return this._map[t] = e
}, $YB.DataMap.prototype.get = function(t) {
    return t = t || "default", this._map.hasOwnProperty(t) === !1 && this.add(t, new $YB.Data), this._map[t]
}, $YB.datamap = new $YB.DataMap, $YB.Pinger = function(t, e, i) {
    try {
        this.time = 0, this.context = t, this.interval = i || 5e3, this.isRunning = !1, this.callback = e, this.timer = null
    } catch (r) {
        $YB.error(r)
    }
}, $YB.Pinger.prototype.getDeltaTime = function() {
    return this.time ? (new Date).getTime() - this.time : -1
}, $YB.Pinger.prototype.start = function() {
    try {
        this.isRunning = !0, this._setPing(), $YB.noticeRequest("Sending pings every " + this.interval + "ms.")
    } catch (t) {
        $YB.error(t)
    }
}, $YB.Pinger.prototype.stop = function() {
    try {
        this.isRunning = !1, atv.clearTimeout(this.timer)
    } catch (t) {
        $YB.error(t)
    }
}, $YB.Pinger.prototype._setPing = function() {
    try {
        if (this.isRunning) {
            var t = this;
            this.time = (new Date).getTime(), this.timer = atv.setTimeout(function() {
                t._ping(t)
            }, this.interval)
        }
    } catch (e) {
        $YB.error(e)
    }
}, $YB.Pinger.prototype._ping = function(t) {
    try {
        t.isRunning && ("function" == typeof t.callback && t.callback(this.getDeltaTime()), t._setPing())
    } catch (e) {
        $YB.error(e)
    }
}, $YB.ResourceParser = function(t) {
    try {
        this.context = t, this.parseTimeout = null, this.cdns = [], this.realResource = "", this.cdnHost = "", this.cdnTypeString = "", this.cdnType = 0, this._init()
    } catch (e) {
        $YB.error(e)
    }
}, $YB.ResourceParser.cdnsAvailable = ["Level3", "Akamai"], $YB.ResourceParser.prototype._init = function() {
    try {
        this.context.comm.addPreloader("ResourceParser");
        var t = this;
        this.parseTimeout = atv.setTimeout(function() {
            t.realResource = t.context.getResource(), t.context.comm.removePreloader("ResourceParser"), $YB.info("ResourceParser has exceded the maximum execution time (3s) and it will be aborted.")
        }, 3e3), this.context.data.parseHLS ? this.getRealResource(this.context.getResource()) : (this.realResource = this.context.getResource(), this.getNextNode())
    } catch (e) {
        $YB.error(e)
    }
}, $YB.ResourceParser.prototype.getRealResource = function(t) {
    try {
        var e = t.slice(t.lastIndexOf("."));
        if (".m3u8" == e) {
            var i = t.slice(0, t.lastIndexOf("/")),
                r = this;
            new $YB.AjaxRequest(t).load(function(e) {
                var n = /(.*(\.m3u8|\.ts|\.mp4))/i.exec(e.responseText);
                null !== n ? (0 !== n[1].indexOf("http") && (n[1] = i + "/" + n[1]), ".ts" == n[2] || ".mp4" == n[2] ? (r.realResource = n[1], r.getNextNode()) : r.getRealResource(n[1])) : (r.realResource = t, r.getNextNode())
            }).error(function() {
                r.getNextNode()
            }).send()
        } else this.realResource = t, this.getNextNode()
    } catch (n) {
        $YB.error(n)
    }
}, $YB.ResourceParser.prototype.getNextNode = function() {
    try {
        if (this.context.data.parseCDNNodeHost)
            if (this.cdns = $YB.ResourceParser.cdnsAvailable, this.cdns.length > 0 && !this.cdnHost) {
                var t = this.cdns.shift();
                "function" == typeof this["parseCDN" + t] ? this["parseCDN" + t]() : this.getNextNode()
            } else this.context.comm.removePreloader("ResourceParser");
        else this.context.comm.removePreloader("ResourceParser")
    } catch (e) {
        $YB.error(e)
    }
}, $YB.ResourceParser.prototype.parseCDNLevel3 = function() {
    try {
        var t = this;
        new $YB.AjaxRequest(this.realResource, "", "", {
            method: "HEAD",
            requestHeader: {
                "X-WR-DIAG": "host"
            }
        }).load(function(e) {
            var i = null;
            try {
                i = /Host:(.+)\sType:(.+)/.exec(e.getAllResponseHeaders("X-WR-DIAG"))
            } catch (r) {
                t.getNextNode()
            }
            null !== i && (t.cdnHost = i[1], t.cdnTypeString = i[2], t.parseHeader()), t.getNextNode()
        }).error(function() {
            t.getNextNode()
        }).send()
    } catch (e) {
        $YB.error(e)
    }
}, $YB.ResourceParser.prototype.parseCDNAkamai = function() {
    try {
        var t = this;
        new $YB.AjaxRequest(this.realResource, "", "", {
            method: "HEAD"
        }).load(function(e) {
            var i = null;
            try {
                i = /(.+)\sfrom\s.+\(.+\/(.+)\).+/.exec(e.getResponseHeader("X-Cache"))
            } catch (r) {
                t.getNextNode()
            }
            null !== i && (t.cdnHost = i[1], t.cdnTypeString = i[2], t.parseHeader()), t.getNextNode()
        }).error(function() {
            t.getNextNode()
        }).send()
    } catch (e) {
        $YB.error(e)
    }
}, $YB.ResourceParser.prototype.parseHeader = function() {
    try {
        switch (this.cdnTypeString) {
            case "TCP_HIT":
                this.cdnType = 1;
                break;
            case "TCP_MISS":
                this.cdnType = 2;
                break;
            case "TCP_MEM_HIT":
                this.cdnType = 3;
                break;
            case "TCP_IMS_HIT":
                this.cdnType = 4;
                break;
            default:
                this.cdnType = 0
        }
        $YB.notice("CDN Node Host: " + this.cdnHost + " Type: " + this.cdnTypeString)
    } catch (t) {
        $YB.error(t)
    }
}, $YB.ResumeService = function(t) {
    try {
        this.context = t, this.timer = null, this.isResumed = 0, this.data = this.context.data, this.config = this.context.data.resumeConfig, this._check()
    } catch (e) {
        $YB.error(e)
    }
}, $YB.ResumeService.prototype._check = function() {
    try {
        if (this.config.enabled && "undefined" != typeof this.config.contentId && "undefined" != typeof this.data.username) {
            var t = this;
            this.context.comm.sendService(this.config.service, {
                contentId: this.config.contentId,
                userId: this.data.username
            }, function(e) {
                e.response > 0 ? (t.isResumed = 1, "function" == typeof t.config.callback ? t.config.callback(e.response) : $YB.warning("ResumeService callback is not a function")) : "0" === e.response || t.stop()
            }), $YB.noticeRequest("Request: ResumeService check " + this.config.contentId)
        } else this.stop()
    } catch (e) {
        $YB.error(e)
    }
}, $YB.ResumeService.prototype._sendPlayTime = function() {
    try {
        this.config.enabled && "undefined" != typeof this.config.contentId && "undefined" != typeof this.data.username && this.context.comm.sendService(this.config.playTimeService, {
            contentId: this.config.contentId,
            userId: this.data.username,
            playTime: this.context.getPlayhead()
        })
    } catch (t) {
        $YB.error(t)
    }
}, $YB.ResumeService.prototype.start = function(t) {
    try {
        t = t || 6e3, this._sendPlayTime();
        var e = this;
        this.timer = atv.setInterval(function() {
            e._sendPlayTime()
        }, t)
    } catch (i) {
        $YB.error(i)
    }
}, $YB.ResumeService.prototype.stop = function() {
    try {
        atv.clearInterval(this.timer)
    } catch (t) {
        $YB.error(t)
    }
}, $YB.SmartswitchService = function(t) {
    try {
        this.context = t, this.callback = function() {}, this.data = this.context.data, this.config = this.context.data.smartswitchConfig
    } catch (e) {
        $YB.error(e)
    }
}, $YB.SmartswitchService.prototype.getBalancedUrls = function(t, e) {
    try {
        if (this.callback = e, this.config.enabled) {
            var i = this;
            this.context.comm.sendService(this.config.service, {
                resource: t,
                systemcode: this.data.accountCode,
                zonecode: this.config.zoneCode,
                session: this.context.comm.getViewCode(),
                origincode: this.config.originCode,
                niceNva: this.config.niceNVA,
                niceNvb: this.config.niceNVB,
                live: this.context.getIsLive(),
                token: this.config.token,
                type: this.config.type
            }, function(t) {
                var e;
                try {
                    e = JSON.parse(t.response)
                } catch (r) {
                    $YB.warning("Smartswitch said: '" + t.response + "'")
                }
                e ? (i.data.isBalanced = 1, i.callback(e)) : i.callback(!1)
            }), $YB.noticeRequest("Request: Smartswitch " + t)
        } else this.callback(!1)
    } catch (r) {
        $YB.error(r)
    }
}, $YB.Api = function(t, e, i) {
    try {
        if (arguments.length < 2 || void 0 === t || void 0 === e) throw "Fatal Error: $YB.Api constructor needs two arguments at least: plugin and playerId";
        this.plugin = t, this.playerId = e, this.initialOptions = i, this.data = $YB.datamap.get(this.playerId), this.data.setOptions(i);
        var r = this;
        this.pinger = new $YB.Pinger(this, function(t) {
            r.handlePing({
                diffTime: t
            })
        }), this.buffer = new $YB.Buffer(this), this.chrono = {
            seek: new $YB.Chrono,
            pause: new $YB.Chrono,
            joinTime: new $YB.Chrono,
            buffer: this.buffer.chrono
        }, this.ads = new $YB.AdnalyzerApi(this), this.comm = new $YB.Communication(this), this._init()
    } catch (n) {
        $YB.error(n)
    }
}, $YB.Api.prototype = {
    resourceParser: null,
    concurrency: null,
    resume: null,
    smartswitch: null,
    ads: null,
    isStartSent: !1,
    isJoinSent: !1,
    isPaused: !1,
    isSeeking: !1,
    isBuffering: !1,
    lastBitrate: 0
}, $YB.Api.prototype._init = function() {
    try {
        var t = "YAPI Modules Loaded: [Communication] ",
            e = {
                system: this.data.accountCode,
                pluginVersion: this.plugin.pluginVersion,
                targetDevice: this.plugin.pluginName,
                live: this.data.media.isLive
            },
            i = this;
        this.comm.sendData(e, function() {
            i.pinger.interval = 1e3 * i.comm.pingTime
        }), (this.data.parseCDNNodeHost || this.data.parseHLS) && (this.resourceParser = new $YB.ResourceParser(this), t += "[ResourceParser] "), this.data.concurrencyConfig.enabled && (this.concurrency = new $YB.ConcurrencyService(this), t += "[Concurrency] "), this.data.resumeConfig.enabled && (this.resume = new $YB.ResumeService(this), t += "[Resume] "), this.data.smartswitchConfig.enabled && (this.smartswitch = new $YB.SmartswitchService(this), t += "[Smartswitch] "), $YB.notice(t)
    } catch (r) {
        $YB.error(r)
    }
}, $YB.Api.prototype.handleStart = function(t) {
    try {
        this.isStartSent && this.handleStop(), this.isStartSent = !0, this.chrono.joinTime.start(), this.pinger.start(), this._consolidateTitle(), t = t || {}, t.system = [t.system, this.data.accountCode], t.player = [t.player, this.plugin.pluginName], t.pluginVersion = [t.pluginVersion, this.plugin.pluginVersion], t.playerVersion = [t.playerVersion, this.getPlayerVersion()], t.resource = [t.resource, this.getResource()], t.duration = [t.duration, this.getMediaDuration()], t.live = [t.live, this.getIsLive()], t.user = [t.user, this.data.username], t.transcode = [t.transcode, this.data.transactionCode], t.title = [t.title, this.data.media.title], t.properties = [t.properties, this.data.properties], t.hashTitle = [t.hashTitle, this.data.hashTitle], t.cdn = [t.cdn, this.data.network.cdn], t.isp = [t.isp, this.data.network.isp], t.ip = [t.ip, this.data.network.ip], t.param1 = [t.param1, this.data.extraParams.param1], t.param2 = [t.param2, this.data.extraParams.param2], t.param3 = [t.param3, this.data.extraParams.param3], t.param4 = [t.param4, this.data.extraParams.param4], t.param5 = [t.param5, this.data.extraParams.param5], t.param6 = [t.param6, this.data.extraParams.param6], t.param7 = [t.param7, this.data.extraParams.param7], t.param8 = [t.param8, this.data.extraParams.param8], t.param9 = [t.param9, this.data.extraParams.param9], t.param10 = [t.param10, this.data.extraParams.param10], this.data.resumeConfig.enabled && (this.resume.start(), t.isResumed = this.resume.isResumed), 1 == this.data.isBalanced && (t.isBalanced = 1), this.comm.sendStart(t)
    } catch (e) {
        $YB.error(e)
    }
}, $YB.Api.prototype.handleJoin = function(t) {
    try {
        this.isStartSent && !this.isJoinSent && (this.isJoinSent = !0, this.buffer.autostart && this.buffer.start(), t = t || {}, t.time = [t.time, this.chrono.joinTime.getDeltaTime()], t.eventTime = [t.eventTime, this.getPlayhead()], t.mediaDuration = [t.mediaDuration, this.getMediaDuration()], this.ads.totalPrerollTime > 0 && (t.time = $YB.util.getFirstDefined(t.time) - this.ads.totalPrerollTime), this.comm.sendJoin(t))
    } catch (e) {
        $YB.error(e)
    }
}, $YB.Api.prototype.handleStop = function(t) {
    try {
        this.isStartSent && (this.isStartSent = !1, this.isPaused = !1, this.isJoinSent = !1, this.isSeeking = !1, this.isBuffering = !1, this.pinger.stop(), this.buffer.stop(), t = t || {}, t.diffTime = [t.diffTime, this.pinger.getDeltaTime()], this.comm.sendStop(t), this.data.resumeConfig.enabled && this.resume.sendPlayTime())
    } catch (e) {
        $YB.error(e)
    }
}, $YB.Api.prototype.handlePause = function() {
    try {
        !this.isJoinSent || this.isPaused || this.isSeeking || this.ads.isStartSent || (this.isPaused = !0, this.chrono.pause.start(), this.comm.sendPause(), this.data.resumeConfig.enabled && this.resume.sendPlayTime())
    } catch (t) {
        $YB.error(t)
    }
}, $YB.Api.prototype.handleResume = function() {
    try {
        this.isJoinSent && this.isPaused && !this.isSeeking && !this.ads.isStartSent && (this.isPaused = !1, this.chrono.pause.getDeltaTime(), this.comm.sendResume())
    } catch (t) {
        $YB.error(t)
    }
}, $YB.Api.prototype.startAutobuffer = function() {
    this.data.enableNiceBuffer && (this.buffer.autostart = !0)
}, $YB.Api.prototype.handleBufferStart = function() {
    try {
        this.isJoinSent && !this.isBuffering && (this.isBuffering = !0, this.chrono.buffer.start())
    } catch (t) {
        $YB.error(t)
    }
}, $YB.Api.prototype.handleBufferEnd = function(t) {
    try {
        this.isJoinSent && this.isBuffering && (this.isBuffering = !1, t = t || {}, t.duration = [t.duration, this.chrono.buffer.getDeltaTime()], t.time = [t.time, this.getPlayhead()], this.getIsLive() && 0 === t.time && (t.time = 1), this.comm.sendBuffer(t))
    } catch (e) {
        $YB.error(e)
    }
}, $YB.Api.prototype.handleError = function(t) {
    try {
        this._consolidateTitle(), t = t || {}, t.system = [t.system, this.data.accountCode], t.player = [t.player, this.plugin.pluginName], t.pluginVersion = [t.pluginVersion, this.plugin.pluginVersion], t.playerVersion = [t.playerVersion, this.getPlayerVersion()], t.resource = [t.resource, this.getResource()], t.duration = [t.duration, this.getMediaDuration()], t.live = [t.live, this.getIsLive()], t.user = [t.user, this.data.username], t.transcode = [t.transcode, this.data.transactionCode], t.title = [t.title, this.data.media.title], t.properties = [t.properties, this.data.properties], t.hashTitle = [t.hashTitle, this.data.hashTitle], t.cdn = [t.cdn, this.data.network.cdn], t.isp = [t.isp, this.data.network.isp], t.ip = [t.ip, this.data.network.ip], t.param1 = [t.param1, this.data.extraParams.param1], t.param2 = [t.param2, this.data.extraParams.param2],
            t.param3 = [t.param3, this.data.extraParams.param3], t.param4 = [t.param4, this.data.extraParams.param4], t.param5 = [t.param5, this.data.extraParams.param5], t.param6 = [t.param6, this.data.extraParams.param6], t.param7 = [t.param7, this.data.extraParams.param7], t.param8 = [t.param8, this.data.extraParams.param8], t.param9 = [t.param9, this.data.extraParams.param9], t.param10 = [t.param10, this.data.extraParams.param10], this.data.resumeConfig.enabled && (this.resume.start(), t.isResumed = this.resume.isResumed), 1 == this.data.isBalanced && (t.isBalanced = 1), this.comm.sendError(t)
    } catch (e) {
        $YB.error(e)
    }
}, $YB.Api.prototype.handlePing = function(t) {
    try {
        t = t || {}, t.time = [t.time, this.getPlayhead()], t.bitrate = [t.bitrate, this.getBitrate()], this.ads.isStartSent && (t.adPlayhead = [t.adPlayhead, this.ads.getPlayhead()], t.adBitrate = [t.adBitrate, this.ads.getBitrate()]), this.comm.sendPing(t)
    } catch (e) {
        $YB.error(e)
    }
}, $YB.Api.prototype.handleSeekStart = function() {
    try {
        this.isJoinSent && (this.isSeeking = !0, this.chrono.seek.start())
    } catch (t) {
        $YB.error(t)
    }
}, $YB.Api.prototype.handleSeekEnd = function(t) {
    try {
        this.isJoinSent && (this.isSeeking = !1, t = t || {}, t.duration = [t.duration, this.chrono.seek.getDeltaTime()], t.time = [t.time, this.getPlayhead()], this.comm.sendSeek(t))
    } catch (e) {
        $YB.error(e)
    }
}, $YB.Api.prototype.getResource = function() {
    try {
        return this.resourceParser && this.resourceParser.realResource ? this.resourceParser.realResource : "undefined" != typeof this.data.media.resource ? this.data.media.resource : "function" == typeof this.plugin.getResource ? this.plugin.getResource() : ""
    } catch (t) {
        return $YB.warning(t), ""
    }
}, $YB.Api.prototype.getPlayhead = function() {
    try {
        return "function" == typeof this.plugin.getPlayhead ? this.plugin.getPlayhead() : 0
    } catch (t) {
        return $YB.warning(t), 0
    }
}, $YB.Api.prototype.getMediaDuration = function() {
    try {
        if ("undefined" != typeof this.data.media.duration) return this.data.media.duration;
        if ("function" == typeof this.plugin.getMediaDuration) {
            var t = this.plugin.getMediaDuration();
            return 0 === t || t == 1 / 0 || isNaN(t) ? 0 : Math.round(t)
        }
        return 0
    } catch (e) {
        return $YB.warning(e), 0
    }
}, $YB.Api.prototype.getIsLive = function() {
    try {
        return "undefined" != typeof this.data.media.isLive ? this.data.media.isLive : "function" == typeof this.plugin.getIsLive && "boolean" == typeof this.plugin.getIsLive() ? this.plugin.getIsLive() : !1
    } catch (t) {
        return $YB.warning(t), !1
    }
}, $YB.Api.prototype.getBitrate = function() {
    try {
        if ("function" == typeof this.plugin.getBitrate && -1 != this.plugin.getBitrate()) return Math.round(this.plugin.getBitrate());
        if ("undefined" != typeof this.plugin.video && "undefined" != typeof this.plugin.video.webkitVideoDecodedByteCount) {
            var t = this.plugin.video.webkitVideoDecodedByteCount;
            return this.lastBitrate && (t = Math.round((this.plugin.video.webkitVideoDecodedByteCount - this.lastBitrate) / 5 * 8)), this.lastBitrate = this.plugin.video.webkitVideoDecodedByteCount, t
        }
        return -1
    } catch (e) {
        return $YB.warning(e), -1
    }
}, $YB.Api.prototype.getPlayerVersion = function() {
    try {
        return "function" == typeof this.plugin.getPlayerVersion && this.plugin.getPlayerVersion() ? this.plugin.getPlayerVersion() : ""
    } catch (t) {
        return $YB.warning(t), ""
    }
}, $YB.Api.prototype._consolidateTitle = function() {
    try {
        this.data && this.data.media && this.data.media.title && (this.data.properties.content_metadata ? this.data.properties.content_metadata.title = this.data.media.title : this.data.properties.content_metadata = {
            title: this.data.media.title
        })
    } catch (t) {
        $YB.error(t)
    }
};
/**
 * @license
 * Plugin 3.0.0-appletv3 <http://youbora.com/>
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */
$YB.AjaxRequest.options.retryAfter = 0, $YB.plugins.AppleTv3 = function(e, t) {
    try {
        this.pluginName = "appleTv3", this.pluginVersion = "3.0.0-appleTv3", this.yapi = new $YB.Api(this, "appleTv3", e), this.referer = t, this.playhead = 0, $YB.notice("Plugin " + this.pluginVersion + " is ready.")
    } catch (r) {
        $YB.error(r)
    }
}, $YB.plugins.AppleTv3.prototype.didStopPlayingHandler = function() {
    try {
        $YB.debug("Event > Stop"), this.yapi.handleStop()
    } catch (e) {
        $YB.error(e)
    }
}, $YB.plugins.AppleTv3.prototype.playerStateChangedHandler = function(e, t) {
    try {
        switch ($YB.debug("Event > StateChanged > " + e + " " + t), this.playhead = t, e) {
            case "Playing":
                this.yapi.handleJoin(), this.yapi.isSeeking && this.yapi.handleSeekEnd(), this.yapi.isBuffering && this.yapi.handleBufferEnd(), this.yapi.isPaused && this.yapi.handleResume();
                break;
            case "Paused":
                this.yapi.handlePause()
        }
    } catch (r) {
        $YB.error(r)
    }
}, $YB.plugins.AppleTv3.prototype.onStartBufferingHandler = function(e) {
    try {
        $YB.debug("Event > StartBuffer " + e), this.playhead = e, this.yapi.isStartSent ? this.yapi.isSeeking || this.yapi.handleBufferStart() : this.yapi.handleStart({
            referer: this.referer
        })
    } catch (t) {
        $YB.error(t)
    }
}, $YB.plugins.AppleTv3.prototype.onBufferSufficientToPlayHandler = function() {
    try {
        $YB.debug("Event > EndBuffer")
    } catch (e) {
        $YB.error(e)
    }
}, $YB.plugins.AppleTv3.prototype.playerWillSeekToTimeHandler = function(e) {
    try {
        $YB.debug("Event > willSeek " + e), this.playhead = e, this.yapi.isSeeking || this.yapi.handleSeekStart()
    } catch (t) {
        $YB.error(t)
    }
}, $YB.plugins.AppleTv3.prototype.onPlaybackErrorHandler = function(e) {
    try {
        $YB.debug("Event > Error > " + e), this.yapi.handleError({
            errorCode: e,
            msg: e,
            referer: this.referer
        })
    } catch (t) {
        $YB.error(t)
    }
}, $YB.plugins.AppleTv3.prototype.playerTimeDidChangeHandler = function(e) {
    try {
        this.playhead = e
    } catch (t) {
        $YB.error(t)
    }
}, $YB.plugins.AppleTv3.prototype.getMediaDuration = function() {
    return atv.player.currentItem.duration
}, $YB.plugins.AppleTv3.prototype.getPlayhead = function() {
    return this.playhead
};








// settings for atv.player - communicated in PlayVideo/videoPlayerSettings
var baseURL;
var accessToken;
var showClock, timeFormat, clockPosition, overscanAdjust;
var showEndtime;
var subtitleSize;


// metadata - communicated in PlayVideo/myMetadata
var mediaURL;
var key;
var ratingKey;
var duration, partDuration; // milli-sec (int)
var subtitleURL;


// information for atv.player - computed internally to application.js
var lastReportedTime = -1;
var lastTranscoderPingTime = -1;
var remainingTime = 0;
var startTime = 0; // milli-sec
var isTranscoding = false;



/*
 * Send http request
 */
function loadPage(url) {
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.send();
};

/*
 * ATVLogger
 */
function log(msg, level) {
    level = level || 1;
    var req = new XMLHttpRequest();
    var url = "{{URL(/)}}" + "&PlexConnectATVLogLevel=" + level.toString() + "&PlexConnectLog=" + encodeURIComponent(msg);
    req.open('GET', url, false);
    req.send();
};

function yblog(msg) {
    log(msg);
};

/*
 * Handle ATV player time change
 */
atv.player.playerTimeDidChange = function(time) {
    remainingTime = Math.round((duration / 1000) - time);
    var thisReportTime = Math.round(time * 1000)

    // correct thisReportTime with startTime if stacked media part
    thisReportTime += startTime;

    // report watched time
    if (lastReportedTime == -1 || Math.abs(thisReportTime - lastReportedTime) > 5000) {
        lastReportedTime = thisReportTime;
        var token = '';
        if (accessToken != '')
            token = '&X-Plex-Token=' + accessToken;
        loadPage(baseURL + '/:/timeline?ratingKey=' + ratingKey +
            '&key=' + key +
            '&duration=' + duration.toString() +
            '&state=playing' +
            '&time=' + thisReportTime.toString() +
            '&X-Plex-Client-Identifier=' + atv.device.udid +
            '&X-Plex-Device-Name=' + encodeURIComponent(atv.device.displayName) +
            token);
    }

    // ping transcoder to keep it alive
    if (isTranscoding &&
        (lastTranscoderPingTime == -1 || Math.abs(thisReportTime - lastTranscoderPingTime) > 60000)
    ) {
        lastTranscoderPingTime = thisReportTime;
        loadPage(baseURL + '/video/:/transcode/universal/ping?session=' + atv.device.udid);
    }

    if (subtitle)
        updateSubtitle(thisReportTime);


    if (typeof $YB != "undefined") {
        $YB.plugin.playerTimeDidChangeHandler(time);
    }
};

/*
 * Handle ATV playback stopped
 */
atv.player.didStopPlaying = function() {
    // Remove views
    if (clockTimer) atv.clearInterval(clockTimer);
    if (endTimer) atv.clearInterval(endTimer);
    Views = [];

    // Notify of a stop.
    var token = '';
    if (accessToken != '')
        token = '&X-Plex-Token=' + accessToken;
    loadPage(baseURL + '/:/timeline?ratingKey=' + ratingKey +
        '&key=' + key +
        '&duration=' + duration.toString() +
        '&state=stopped' +
        '&time=' + lastReportedTime.toString() +
        '&X-Plex-Client-Identifier=' + atv.device.udid +
        '&X-Plex-Device-Name=' + encodeURIComponent(atv.device.displayName) +
        token);

    // Kill the transcoder session.
    if (isTranscoding) {
        loadPage(baseURL + '/video/:/transcode/universal/stop?session=' + atv.device.udid);
    }

    /// YOUBORA
    if (typeof $YB != "undefined") {
        $YB.plugin.didStopPlayingHandler();
    }
};

/*
 * Handle ATV playback will start
 */
atv.player.willStartPlaying = function() {
    /// YOUBORA
    log('<PRE>');
    if (typeof $YB != "undefined") {
        log('<LOAD>');

        $YB.errorLevel = 4; //Set error level

        // Define the youbora Options
        var options = {
            accountCode: 'nicetv',
            username: 'devja',
            httpSecure: false, // Definition mandatory in appletv3 [true/false].
            media: {
                resource: 'http://prod-freewheel.espn.go.com/ad/g/1',
                title: 'Title of the file',
                isLive: false
            },
            network: {
                //CDN: 'AKAMAI'
            }
            // Any other option....
        };

        // Instantiate the plugin
        $YB.plugin = new $YB.plugins.AppleTv3(options);
    }


    // init timer vars
    lastReportedTime = -1;
    lastTranscoderPingTime = -1;
    remainingTime = 0; // reset remaining time
    startTime = 0; // starting time for stacked media subsequent parts
    //todo: work <bookmarkTime> and fix "resume" for stacked media

    // get baseURL, OSD settings, ...
    var videoPlayerSettings = atv.player.asset.getElementByTagName('videoPlayerSettings');
    if (videoPlayerSettings != null) {
        baseURL = videoPlayerSettings.getTextContent('baseURL');
        accessToken = videoPlayerSettings.getTextContent('accessToken');

        showClock = videoPlayerSettings.getTextContent('showClock');
        timeFormat = videoPlayerSettings.getTextContent('timeFormat');
        clockPosition = videoPlayerSettings.getTextContent('clockPosition');
        overscanAdjust = videoPlayerSettings.getTextContent('overscanAdjust');
        showEndtime = videoPlayerSettings.getTextContent('showEndtime');

        subtitleSize = videoPlayerSettings.getTextContent('subtitleSize');
        log('willStartPlaying/getVideoPlayerSettings done');
    }

    // mediaURL and myMetadata
    getMetadata();

    // load subtitle - aTV subtitle JSON
    subtitle = [];
    subtitlePos = 0;
    // when... not transcoding or
    //         transcoding and PMS skips subtitle (dontBurnIn)
    if (subtitleURL &&
        (!isTranscoding ||
            isTranscoding && mediaURL.indexOf('skipSubtitles=1') > -1)
    ) {
        log("subtitleURL: " + subtitleURL);

        // read subtitle stream
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if (req.readyState == 4) // 4: request is complete
            {
                subtitle = JSON.parse(req.responseText);
            }
        };
        req.open('GET', subtitleURL + "&PlexConnectUDID=" + atv.device.udid, true); // true: asynchronous
        req.send();
        log('willStartPlaying/parseSubtitleJSON done');
    }

    var Views = [];
    // Dummy animation to make sure clocks start as hidden
    var animation = {
        "type": "BasicAnimation",
        "keyPath": "opacity",
        "fromValue": 0,
        "toValue": 0,
        "duration": 0,
        "removedOnCompletion": false,
        "fillMode": "forwards",
        "animationDidStop": function(finished) {}
    };

    // Create clock view
    containerView.frame = screenFrame;
    if (showClock == "True") {
        clockView = initClockView();
        Views.push(clockView);
        clockView.addAnimation(animation, clockView)
    }
    if (duration > 0) // TODO: grab video length from player not library????
    {
        if (showEndtime == "True") {
            endTimeView = initEndTimeView();
            Views.push(endTimeView);
            endTimeView.addAnimation(animation, endTimeView)
        }
    }
    log('willStartPlaying/createClockView done');

    // create subtitle view
    if (subtitleURL &&
        (!isTranscoding ||
            isTranscoding && mediaURL.indexOf('skipSubtitles=1') > -1)
    ) {
        subtitleView = initSubtitleView();
        for (var i = 0; i < subtitleMaxLines; i++) {
            Views.push(subtitleView['shadowRB'][i]);
            Views.push(subtitleView['subtitle'][i]);
        }
        log('willStartPlaying/createSubtitleView done');
    }

    // Paint the views on Screen.
    containerView.subviews = Views;
    atv.player.overlay = containerView;

    log('willStartPlaying done');
};


/*
 * Playlist handling
 */

var assettimer = null;

atv.player.loadMoreAssets = function(callback) {
    assettimer = atv.setInterval(
        function() {
            atv.clearInterval(assettimer);

            var root = atv.player.asset;
            var videoAssets = root.getElementsByTagName('httpFileVideoAsset');
            if (videoAssets != null && videoAssets.length > 1)
                videoAssets.shift();
            else
                videoAssets = null;
            callback.success(videoAssets);

            log('loadMoreAssets done');
        }, 1000);
}


atv.player.currentAssetChanged = function() {
    // start time for stacked media
    var lastRatingKey = ratingKey;
    startTime += partDuration;

    getMetadata();

    // reset start time on media change (non-stacked)
    if (lastRatingKey != ratingKey)
        startTime = 0;

    log('currentAssetChanged done');
}


function getMetadata() {
    // update mediaURL and myMetadata
    mediaURL = atv.player.asset.getTextContent('mediaURL');
    isTranscoding = (mediaURL.indexOf('transcode/universal') > -1);

    var metadata = atv.player.asset.getElementByTagName('myMetadata');
    if (metadata != null) {
        key = metadata.getTextContent('key');
        ratingKey = metadata.getTextContent('ratingKey');
        duration = parseInt(metadata.getTextContent('duration'));
        partDuration = parseInt(metadata.getTextContent('partDuration'));

        // todo: subtitle handling with playlists/stacked media
        subtitleURL = metadata.getTextContent('subtitleURL');
        log('updateMetadata/getMetadata done');
    }
    log('updateMetadata done');
}


// atv.Element extensions
if (atv.Element) {
    atv.Element.prototype.getElementsByTagName = function(tagName) {
        return this.ownerDocument.evaluateXPath("descendant::" + tagName, this);
    }

    atv.Element.prototype.getElementByTagName = function(tagName) {
        var elements = this.getElementsByTagName(tagName);
        if (elements && elements.length > 0) {
            return elements[0];
        }
        return undefined;
    }

    // getTextContent - return empty string if node not existing.
    atv.Element.prototype.getTextContent = function(tagName) {
        var element = this.getElementByTagName(tagName);
        if (element && element.textContent)
            return element.textContent;
        else
            return '';
    }
}


/*
 * Handle showing/hiding of transport controls
 */
atv.player.onTransportControlsDisplayed = function(animationDuration) {
    var animation = {
        "type": "BasicAnimation",
        "keyPath": "opacity",
        "fromValue": 0,
        "toValue": 1,
        "duration": animationDuration,
        "removedOnCompletion": false,
        "fillMode": "forwards",
        "animationDidStop": function(finished) {}
    };
    if (showClock == "True") clockView.addAnimation(animation, clockView)
    if (showEndtime == "True") endTimeView.addAnimation(animation, endTimeView)
};

atv.player.onTransportControlsHidden = function(animationDuration) {
    var animation = {
        "type": "BasicAnimation",
        "keyPath": "opacity",
        "fromValue": 1,
        "toValue": 0,
        "duration": animationDuration,
        "removedOnCompletion": false,
        "fillMode": "forwards",
        "animationDidStop": function(finished) {}
    };
    if (showClock == "True") clockView.addAnimation(animation, clockView)
    if (showEndtime == "True") endTimeView.addAnimation(animation, endTimeView)
};

/*
 * Handle ATV player state changes
 */

var pingTimer = null;

atv.player.playerStateChanged = function(newState, timeIntervalSec) {

    log("Player state: " + newState + " at this time: " + timeIntervalSec);
    state = null;

    // Pause state, ping transcoder to keep session alive
    if (newState == 'Paused') {
        state = 'paused';
        if (isTranscoding) {
            pingTimer = atv.setInterval(
                function() {
                    loadPage(baseURL + '/video/:/transcode/universal/ping?session=' + atv.device.udid);
                },
                60000
            );
        }
    }

    // Playing state, kill paused state ping timer
    if (newState == 'Playing') {
        state = 'play'
        atv.clearInterval(pingTimer);
    }

    // Loading state, tell PMS we're buffering
    if (newState == 'Loading') {
        state = 'buffering';
    }

    if (state != null) {
        var thisReportTime = Math.round(timeIntervalSec * 1000);

        // correct thisReportTime with startTime if stacked media part
        thisReportTime += startTime;

        var token = '';
        if (accessToken != '')
            token = '&X-Plex-Token=' + accessToken;
        loadPage(baseURL + '/:/timeline?ratingKey=' + ratingKey +
            '&key=' + key +
            '&duration=' + duration.toString() +
            '&state=' + state +
            '&time=' + thisReportTime.toString() +
            '&report=1' +
            '&X-Plex-Client-Identifier=' + atv.device.udid +
            '&X-Plex-Device-Name=' + encodeURIComponent(atv.device.displayName) +
            token);
    }

    /// YOUBORA
    if (typeof $YB != "undefined") {
        $YB.plugin.playerStateChangedHandler(newState, timeIntervalSec);
    }
};

atv.player.onStartBuffering = function(a) {
    /// YOUBORA
    if (typeof $YB != "undefined") {
        $YB.plugin.onStartBufferingHandler(a);
    }
};

atv.player.onBufferSufficientToPlay = function() {
    /// YOUBORA
    if (typeof $YB != "undefined") {
        $YB.plugin.onBufferSufficientToPlayHandler();
    }
};

atv.player.playerWillSeekToTime = function(a) {
    /// YOUBORA
    if (typeof $YB != "undefined") {
        $YB.plugin.playerWillSeekToTimeHandler(a);
    }
};

atv.player.onPlaybackError = function(msg) {
    /// YOUBORA
    if (typeof $YB != "undefined") {
        $YB.plugin.onPlaybackErrorHandler(msg);
    }
};

atv.player.onQualityOfServiceReport = function(report) {
    /// YOUBORA
    if (typeof $YB != "undefined") {
        $YB.notice("<report>");
        $YB.notice(report);
    }
};


/*
 *
 * Clock + End time rendering
 *
 */

var screenFrame = atv.device.screenFrame;
var containerView = new atv.View();
var clockView;
var clockTimer;
var endTimeView;
var endTimer;

function pad(num, len) {
    return (Array(len).join("0") + num).slice(-len);
};

function initClockView() {
    clockView = new atv.TextView();
    var width = screenFrame.width * 0.15;
    if (timeFormat == '24 Hour') {
        width = screenFrame.width * 0.10;
    }
    var height = screenFrame.height * 0.06;
    var overscanadjust = 0.006 * (parseInt(overscanAdjust));
    var xmul = 0.1; //Default for Left Position
    if (clockPosition == 'Center') var xmul = 0.5;
    else if (clockPosition == 'Right') var xmul = 0.9;


    // Setup the clock frame
    clockView.backgroundColor = {
        red: 0,
        blue: 0,
        green: 0,
        alpha: 0.7
    };
    clockView.frame = {
        "x": screenFrame.x + (screenFrame.width * xmul) - (width * 0.5),
        "y": screenFrame.y + (screenFrame.height * (0.988 + overscanadjust)) - height,
        "width": width,
        "height": height
    };

    // Update the overlay clock
    clockTimer = atv.setInterval(updateClock, 1000);
    updateClock();

    return clockView;
}

function initEndTimeView() {
    endTimeView = new atv.TextView();
    var width = screenFrame.width * 0.10;
    if (timeFormat == '12 Hour') {
        width = screenFrame.width * 0.15;
    }
    var height = screenFrame.height * 0.03;
    var overscanadjust = 0.006 * (parseInt(overscanAdjust));
    var xmul = 0.1; // Default for Left Position
    if (clockPosition == 'Center') var xmul = 0.5;
    else if (clockPosition == 'Right') var xmul = 0.9;

    // Setup the end time frame
    endTimeView.backgroundColor = {
        red: 0,
        blue: 0,
        green: 0,
        alpha: 0.7
    };
    endTimeView.frame = {
        "x": screenFrame.x + (screenFrame.width * xmul) - (width * 0.5),
        "y": screenFrame.y + (screenFrame.height * (0.05 - overscanadjust)) - height,
        "width": width,
        "height": height
    };

    // Update the overlay clock
    endTimer = atv.setInterval(updateEndTime, 1000);
    updateEndTime();

    return endTimeView;
}

function updateClock() {
    var tail = "AM";
    var time = new Date();
    var hours24 = pad(time.getHours(), 2);
    var h12 = parseInt(hours24);
    if (h12 > 12) {
        h12 = h12 - 12;
        tail = "PM";
    } else if (h12 == 12) {
        tail = "PM";
    } else if (h12 == 0) {
        h12 = 12;
        tail = "AM";
    }
    hours12 = h12.toString();
    var mins = pad(time.getMinutes(), 2);
    var secs = pad(time.getSeconds(), 2);
    var timestr24 = hours24 + ":" + mins;
    var timestr12 = hours12 + ":" + mins + " " + tail;
    if (timeFormat == '24 Hour') {
        clockView.attributedString = {
            string: "" + timestr24,
            attributes: {
                pointSize: 36.0,
                color: {
                    red: 1,
                    blue: 1,
                    green: 1
                },
                alignment: "center"
            }
        };
    } else {
        clockView.attributedString = {
            string: "" + timestr12,
            attributes: {
                pointSize: 36.0,
                color: {
                    red: 1,
                    blue: 1,
                    green: 1
                },
                alignment: "center"
            }
        };
    }
};

function updateEndTime() {
    var tail = "AM";
    var time = new Date();
    var intHours = parseInt(time.getHours());
    var intMins = parseInt(time.getMinutes());
    var intSecs = parseInt(time.getSeconds());
    var totalTimeInSecs = ((intHours * 3600) + (intMins * 60) + intSecs) + remainingTime;
    var endHours = Math.floor(totalTimeInSecs / 3600);
    if (endHours >= 24) {
        endHours = endHours - 24;
    }
    var endMins = Math.floor((totalTimeInSecs % 3600) / 60);
    var hours24 = pad(endHours.toString(), 2);
    var h12 = endHours;
    if (h12 > 12) {
        h12 = h12 - 12;
        tail = "PM";
    } else if (h12 == 12) {
        tail = "PM";
    } else if (h12 == 0) {
        h12 = 12;
        tail = "AM";
    }
    hours12 = h12.toString();
    var mins = pad(endMins.toString(), 2);
    var timestr24 = hours24 + ":" + mins;
    var timestr12 = hours12 + ":" + mins + " " + tail;
    var endTimeStr = "Ends at:  "
    if (timeFormat == '24 Hour') {
        endTimeStr = endTimeStr + timestr24;
    } else {
        endTimeStr = endTimeStr + timestr12;
    }
    if (remainingTime == 0) {
        endTimeStr = '';
        endTimeView.backgroundColor = {
            red: 0,
            blue: 0,
            green: 0,
            alpha: 0
        };
    } else {
        endTimeView.backgroundColor = {
            red: 0,
            blue: 0,
            green: 0,
            alpha: 0.7
        };
    }

    endTimeView.attributedString = {
        string: endTimeStr,
        attributes: {
            pointSize: 16.0,
            color: {
                red: 1,
                blue: 1,
                green: 1
            },
            alignment: "center"
        }
    };
};


/*
 *
 * Subtitle handling/rendering
 *
 */
var subtitleView = {
    'shadowRB': [],
    'subtitle': []
};
var subtitle = [];
var subtitlePos = 0;
// constants
var subtitleMaxLines = 4;


function initSubtitleView() {
    var width = screenFrame.width;
    var height = screenFrame.height * 1 / 14 * subtitleSize / 100; // line height: 1/14 seems to fit to 40pt font

    var xOffset = screenFrame.width * 1 / 640; // offset for black letter shadow/border/background
    var yOffset = screenFrame.height * 1 / 360;

    // Setup the subtitle frames
    for (var i = 0; i < subtitleMaxLines; i++) {
        // shadow right bottom
        subtitleView['shadowRB'][i] = new atv.TextView();
        subtitleView['shadowRB'][i].backgroundColor = {
            red: 0,
            blue: 0,
            green: 0,
            alpha: 0.0
        };
        subtitleView['shadowRB'][i].frame = {
            "x": screenFrame.x + xOffset,
            "y": screenFrame.y - yOffset + (height * (subtitleMaxLines - i - 0.5)),
            "width": width,
            "height": height
        };
        // subtitle
        subtitleView['subtitle'][i] = new atv.TextView();
        subtitleView['subtitle'][i].backgroundColor = {
            red: 0,
            blue: 0,
            green: 0,
            alpha: 0.0
        };
        subtitleView['subtitle'][i].frame = {
            "x": screenFrame.x,
            "y": screenFrame.y + (height * (subtitleMaxLines - i - 0.5)),
            "width": width,
            "height": height
        };
    }

    return subtitleView;
}


function updateSubtitle(time) {
    // rewind, if needed
    while (subtitlePos > 0 && time < subtitle.Timestamp[subtitlePos].time) {
        subtitlePos--;
    }
    // forward
    while (subtitlePos < subtitle.Timestamp.length - 1 && time > subtitle.Timestamp[subtitlePos + 1].time) {
        subtitlePos++;
    }
    // current subtitle to show: subtitle.Timestamp[subtitlePos]

    // get number of lines (max subtitleMaxLines)
    var lines
    if (subtitle.Timestamp[subtitlePos].Line)
        lines = Math.min(subtitle.Timestamp[subtitlePos].Line.length, subtitleMaxLines);
    else
        lines = 0;

    // update subtitleView[]
    var i_view = 0;
    for (var i = 0; i < subtitleMaxLines - lines; i++) // fill empty lines on top
    {
        subtitleView['shadowRB'][i_view].attributedString = {
            string: "",
            attributes: {
                pointSize: 40.0 * subtitleSize / 100,
                color: {
                    red: 0,
                    blue: 0,
                    green: 0,
                    alpha: 1.0
                }
            }
        };
        subtitleView['subtitle'][i_view].attributedString = {
            string: "",
            attributes: {
                pointSize: 40.0 * subtitleSize / 100,
                color: {
                    red: 1,
                    blue: 1,
                    green: 1,
                    alpha: 1.0
                }
            }
        };
        i_view++;
    }
    for (var i = 0; i < lines; i++) // fill used lines
    {
        subtitleView['shadowRB'][i_view].attributedString = {
            string: subtitle.Timestamp[subtitlePos].Line[i].text,
            attributes: {
                pointSize: 40.0 * subtitleSize / 100,
                color: {
                    red: 0,
                    blue: 0,
                    green: 0,
                    alpha: 1.0
                },
                weight: subtitle.Timestamp[subtitlePos].Line[i].weight || 'normal',
                alignment: "center",
                breakMode: "clip"
            }
        };
        subtitleView['subtitle'][i_view].attributedString = {
            string: subtitle.Timestamp[subtitlePos].Line[i].text,
            attributes: {
                pointSize: 40.0 * subtitleSize / 100,
                color: {
                    red: 1,
                    blue: 1,
                    green: 1,
                    alpha: 1.0
                },
                weight: subtitle.Timestamp[subtitlePos].Line[i].weight || 'normal',
                alignment: "center",
                breakMode: "clip"
            }
        };
        i_view++;
    }

    if (time < 10000)
        log("updateSubtitle done, subtitlePos=" + subtitlePos);
}


/*
 *
 * Main app entry point
 *
 */

atv.config = {
    "doesJavaScriptLoadRoot": true,
    "DEBUG_LEVEL": 4
};

atv.onAppEntry = function() {
    fv = atv.device.softwareVersion.split(".");
    firmVer = fv[0] + "." + fv[1];
    if (parseFloat(firmVer) >= 5.1) {
        // discover - trigger PlexConnect, ignore response
        var url = "{{URL(/)}}&PlexConnect=Discover&PlexConnectUDID=" + atv.device.udid
        var req = new XMLHttpRequest();
        req.open('GET', url, false);
        req.send();

        // load main page
        atv.loadURL("{{URL(/PlexConnect.xml)}}");
    } else {
        var xmlstr =
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?> \
<atv> \
  <body> \
    <dialog id=\"com.sample.error-dialog\"> \
      <title>{{TEXT(PlexConnect)}}</title> \
      <description>{{TEXT(ATV firmware version 5.1 or higher required. Please think about updating.)}}</description> \
    </dialog> \
  </body> \
</atv>";

        var doc = atv.parseXML(xmlstr);
        atv.loadXML(doc);
    }
};

// atv.onGenerateRequest - adding UDID if directed to PlexConnect
atv.onGenerateRequest = function(request) {
    //log("atv.onGenerateRequest: "+request.url);

    if (request.url.indexOf("{{URL(/)}}") != -1) {
        var sep = "&";
        // check for "&", too. some PlexConnect requests don't follow the standard.
        if (request.url.indexOf("?") == -1 && request.url.indexOf("&") == -1) {
            sep = "?";
        }
        request.url = request.url + sep + "PlexConnectUDID=" + atv.device.udid;
        request.url = request.url + "&" + "PlexConnectATVName=" + encodeURIComponent(atv.device.displayName);
    }

    log("atv.onGenerateRequest done: " + request.url);
}
