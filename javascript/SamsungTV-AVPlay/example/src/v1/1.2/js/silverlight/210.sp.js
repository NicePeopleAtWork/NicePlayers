function Silverlight2Media() {
    var e = this;
    this.HTMLObjectTagID = null, this.SilverlightMediaElementName = null, this.mediaElement = null, this.mediaElementTimeoutID = null, this.progressIntervalID = null, this.fastSeekIntervalID = null, this.mediaBuffering = function() {
        nice264Plugin.buffer(Nice264AnalyticsEvents.BUFFER_BEGIN)
    }, this.mediaCurrentStateChanged = function(e) {
        var t = silverlight2Media.SilverlightMediaElementName,
            t = e.findName(silverlight2Media.SilverlightMediaElementName);
        "" == nice264Plugin && (nice264Plugin.assetUrl = t.Source);
        var i = "" + t.CurrentState;
        switch (i) {
            case "Opening":
                nice264Plugin.join(Nice264AnalyticsEvents.BUFFER_BEGIN);
                break;
            case "Closed":
                nice264Plugin.stop();
                break;
            case "Buffering":
                nice264Plugin.buffer(Nice264AnalyticsEvents.BUFFER_BEGIN);
                break;
            case "Playing":
                0 == nice264Plugin.isStartEventSent ? (nice264Plugin.start(), nice264Plugin.isStartEventSent = 1, nice264Plugin.join(Nice264AnalyticsEvents.JOIN_SEND)) : 1 == nice264Plugin.isPaused ? (nice264Plugin.isPaused = 0, nice264Plugin.resume()) : (nice264Plugin.buffer(Nice264AnalyticsEvents.BUFFER_END), nice264Plugin.buffer(Nice264AnalyticsEvents.BUFFER_SEND));
                break;
            case "Stopped":
                nice264Plugin.stop();
                break;
            case "Paused":
                0 == nice264Plugin.isJoinEventSent && nice264Plugin.join(Nice264AnalyticsEvents.BUFFER_END), nice264Plugin.pause(), nice264Plugin.isPaused = !0;
                break;
            case "Resume":
                nice264Plugin.buffer(Nice264AnalyticsEvents.BUFFER_END), nice264Plugin.resume()
        }
    }, this.mediaEnded = function() {
        nice264Plugin.stop()
    }, this.setMediaElement = function() {
        if (null == e.mediaElement) {
            var t = document.getElementById(e.HTMLObjectTagID);
            if (t && t.content) try {
                e.mediaElement = t.content.findName(e.SilverlightMediaElementName)
            } catch (i) {}
        }
        if (null != e.mediaElement, null != e.mediaElement) try {
            e.mediaElement.AddEventListener("BufferingProgressChanged", e.mediaBuffering), e.mediaElement.AddEventListener("CurrentStateChanged", e.mediaCurrentStateChanged), e.mediaElement.AddEventListener("MediaEnded", e.mediaEnded)
        } catch (i) {}
        null == e.mediaElement && (null != e.mediaElementTimeoutID && (clearTimeout(e.mediaElementTimeoutID), e.mediaElementTimeoutID = null), e.mediaElementTimeoutID = setTimeout(e.setMediaElement, 500))
    }, this.bindToSilverlight = function(t, i) {
        e.HTMLObjectTagID = t, e.SilverlightMediaElementName = i, e.setMediaElement()
    }
}

function Nice264Analytics(e, t, i, n, s) {
    this.playerId = e, this.system = t, this.service = i, this.playInfo = n, this.player = null, this.supportHTTPS = s, this.assetUrl = "", this.pluginVersion = "2.1.0_silverlight", this.targetDevice = "Silverlight_JavaScript", this.outputFormat = "xml", this.xmlHttp = null, this.isXMLReceived = !1, this.resourcesQueue = [], this.eventsQueue = [], this.eventsTimer = null, this.isStartEventSent = 0, this.isJoinEventSent = !1, this.isStopEventSent = !1, this.isBufferRunning = !1, this.isPauseEventSent = !1, this.assetMetadata = {}, this.isLive = !1, this.bufferTimeBegin = 0, this.pamBufferUnderrunUrl = "", this.pamJoinTimeUrl = "", this.pamStartUrl = "", this.pamStopUrl = "", this.pamPauseUrl = "", this.pamResumeUrl = "", this.pamPingUrl = "", this.pamErrorUrl = "", this.pamCode = "", this.pamCodeOrig = "", this.pamCodeCounter = 0, this.pamPingTime = 0, this.lastPingTime = 0, this.diffTime = 0, this.pingTimer = null, this.isPaused = 0, this.isBuffering = 0, this.init()
}
var silverlight2Media = new Silverlight2Media,
    Nice264AnalyticsEvents = {
        BUFFER_BEGIN: 1,
        BUFFER_END: 0,
        BUFFER_SEND: 2,
        JOIN_SEND: 2
    };
Nice264Analytics.prototype.init = function() {
    this.player = document.getElementById(this.playerId), void 0 == this.supportHTTPS && (this.supportHTTPS = !1), 1 == this.supportHTTPS && (this.service = this.service.replace("http:", "https:")), this.xmlHttp = new XMLHttpRequest, this.xmlHttp.context = this, this.xmlHttp.addEventListener("load", function(e) {
        this.context.loadAnalytics(e)
    }, !1), this.xmlHttp.open("GET", this.service + "/data?system=" + this.system + "&pluginVersion=" + this.pluginVersion + "&targetDevice=" + this.targetDevice + "&outputformat=" + this.outputFormat, !1), this.xmlHttp.send()
}, Nice264Analytics.prototype.loadAnalytics = function(e) {
    if (4 == e.target.readyState) {
        var t = e.target.responseXML,
            i = t.getElementsByTagName("h")[0].childNodes[0].nodeValue,
            n = "http";
        1 == this.supportHTTPS && (n = "https"), this.pamBufferUnderrunUrl = n + "://" + i + "/bufferUnderrun", this.pamJoinTimeUrl = n + "://" + i + "/joinTime", this.pamStartUrl = n + "://" + i + "/start", this.pamStopUrl = n + "://" + i + "/stop", this.pamPauseUrl = n + "://" + i + "/pause", this.pamResumeUrl = n + "://" + i + "/resume", this.pamPingUrl = n + "://" + i + "/ping", this.pamErrorUrl = n + "://" + i + "/error", this.pamCode = t.getElementsByTagName("c")[0].childNodes[0].nodeValue, this.pamCodeOrig = this.pamCode, this.pamPingTime = 1e3 * t.getElementsByTagName("pt")[0].childNodes[0].nodeValue, this.isXMLReceived = !0
    }
}, Nice264Analytics.prototype.sendAnalytics = function(e, t, i) {
    this.xmlHttp = new XMLHttpRequest, this.xmlHttp.context = this, i && (this.xmlHttp.addEventListener("load", function(e) {
        this.context.parseAnalyticsResponse(e)
    }, !1), this.xmlHttp.addEventListener("error", function() {}, !1)), this.xmlHttp.open("GET", e + t, !1), this.xmlHttp.send()
}, Nice264Analytics.prototype.parseAnalyticsResponse = function(e) {
    if (4 == e.target.readyState) {
        var t = e.target.responseText,
            i = new Date;
        (t.length > 0 || "" != t) && (this.pamPingTime = t), this.setPing(), this.lastPingTime = i.getTime()
    }
}, Nice264Analytics.prototype.updateCode = function() {
    this.pamCodeCounter++, this.pamCode = this.pamCodeOrig + "_" + this.pamCodeCounter
}, Nice264Analytics.prototype.reset = function() {
    this.isStartEventSent = 0, this.isJoinEventSent = 0, this.isBufferRunning = 0, this.isPauseEventSent = 0, this.bufferTimeBegin = 0, clearTimeout(this.pingTimer), this.pingTimer = null, this.lastPingTime = 0, this.diffTime = 0, this.updateCode()
}, Nice264Analytics.prototype.setUsername = function(e) {
    this.playInfo.username = e
}, Nice264Analytics.prototype.setTransactionCode = function(e) {
    this.playInfo.transaction = e
}, Nice264Analytics.prototype.setMetadata = function(e) {
    this.assetMetadata = e
}, Nice264Analytics.prototype.getMetadata = function() {
    var e = JSON.stringify(this.assetMetadata),
        t = encodeURIComponent(e);
    return t
}, Nice264Analytics.prototype.setVideoURL = function(e) {
    this.assetUrl = e
}, Nice264Analytics.prototype.getVideoURL = function() {
    return this.assetUrl
}, Nice264Analytics.prototype.setLive = function(e) {
    this.isLive = e
}, Nice264Analytics.prototype.getBitrate = function() {
    try {
        var e = this.player.mediaPlayInfo()
    } catch (t) {
        return 0
    }
    return e.bitrateInstant
}, Nice264Analytics.prototype.setPing = function() {
    var e = this;
    this.pingTimer = setTimeout(function() {
        e.ping()
    }, this.pamPingTime)
}, Nice264Analytics.prototype.start = function() {
    var e = new Date,
        t = "?pluginVersion=" + this.pluginVersion + "&pingTime=" + this.pamPingTime + "&totalBytes=0&referer=" + encodeURIComponent(window.location.href) + "&user=" + this.playInfo.username + "&properties=" + this.getMetadata() + "&live=" + this.isLive + "&transcode=" + this.playInfo.transaction + "&system=" + this.system + "&resource=" + this.getVideoURL() + "&code=" + this.pamCode;
    this.sendAnalytics(this.pamStartUrl, t, !1), this.setPing(), this.lastPingTime = e.getTime()
}, Nice264Analytics.prototype.ping = function() {
    var e = new Date;
    clearTimeout(this.pingTimer), this.pingTimer = null, 0 != this.lastPingTime && (this.diffTime = e.getTime() - this.lastPingTime), this.lastPingTime = e.getTime();
    var t = "?diffTime=" + this.diffTime + "&bitrate=" + this.getBitrate() + "&pingTime=" + this.pamPingTime / 1e3 + "&dataType=0&code=" + this.pamCode;
    this.sendAnalytics(this.pamPingUrl, t, !0)
}, Nice264Analytics.prototype.join = function(e) {
    var t = new Date,
        i = 0,
        n = null;
    e == Nice264AnalyticsEvents.BUFFER_BEGIN ? this.joinTimeBegin = t.getTime() : e == Nice264AnalyticsEvents.BUFFER_END ? this.joinTimeEnd = t.getTime() : e == Nice264AnalyticsEvents.JOIN_SEND && (void 0 == this.joinTimeEnd && (this.joinTimeEnd = (new Date).getTime()), i = this.joinTimeEnd - this.joinTimeBegin, 0 >= i && (i = 0), n = "?time=" + i + "&code=" + this.pamCode, this.sendAnalytics(this.pamJoinTimeUrl, n, !1), this.isJoinEventSent = 1)
}, Nice264Analytics.prototype.buffer = function(e) {
    var t = new Date,
        i = 0,
        n = 0,
        s = null;
    if (e == Nice264AnalyticsEvents.BUFFER_BEGIN && 0 == this.isBuffering) this.bufferTimeBegin = t.getTime(), this.isBuffering = 1;
    else if (e == Nice264AnalyticsEvents.BUFFER_END)
        if (this.isBuffering = 0, i = t.getTime(), n = i - this.bufferTimeBegin, 0 == this.isJoinEventSent) this.isJoinEventSent = 1, s = "?time=" + n + "&code=" + this.pamCode, this.sendAnalytics(this.pamJoinTimeUrl, s, !1);
        else {
            var a = this.player.playPosition;
            console.log(10 > a), 10 > a && (a = 10), s = "?time=" + a + "&duration=" + n + "&code=" + this.pamCode, this.sendAnalytics(this.pamBufferUnderrunUrl, s, !1)
        }
}, Nice264Analytics.prototype.resume = function() {
    var e = "?code=" + this.pamCode;
    this.sendAnalytics(this.pamResumeUrl, e, !1)
}, Nice264Analytics.prototype.pause = function() {
    var e = "?code=" + this.pamCode;
    this.sendAnalytics(this.pamPauseUrl, e, !1)
}, Nice264Analytics.prototype.stop = function() {
    var e = "?diffTime=" + this.diffTime + "&code=" + this.pamCode;
    this.sendAnalytics(this.pamStopUrl, e, !1), clearTimeout(this.pingTimer), this.pingTimer = null, this.reset()
}, Nice264Analytics.prototype.error = function() {
    var e = "?errorCode=" + this.player.error + "&msg=&code=" + this.pamCode;
    this.sendAnalytics(this.pamErrorUrl, e, !1), clearTimeout(this.pingTimer), this.pingTimer = null
};
