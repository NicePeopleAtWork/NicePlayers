/**
 * @license
 * YouboraLib
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */


/**
 * Global namespace for youboralib.
 * @namespace
 */
var $YB = $YB || {

    /**
     * Version of the library.
     * @memberof $YB
     */
    version: '5.1-RC',

    /**
     * Namespace for Plugins
     * @namespace
     * @memberof $YB
     */
    plugins: {},

    /**
     * Namespace for Adnalyzers
     * @namespace
     * @memberof $YB
     */
    adnalyzers: {},

    /**
     * Namespace for all sort of lib functions
     * @namespace
     * @memberof $YB
     */
    utils: {},

    /**
     * Namespace for all extra services
     * @namespace
     * @memberof $YB
     */
    services: {}
};

/**
 * @license
 * Youbora AjaxRequest
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * AjaxRequest will generate the call URL. See createServiceUrl.
 *
 * @class
 * @memberof $YB
 * @param {string} host URL of the request. ie: nqs.nice264.com
 * @param {string} [service] Name of the service. ie '/start'
 * @param {string} [params] String of params. Skip '?' at start. ie: 'system=nicetv&user=user'.
 * @param {Object} [options] Object with custom options.
 * @param {string} [options.method=GET] Specifies the method of the request ie: "GET", "POST", "HEAD".
 * @param {string} [options.requestHeaders] A literal with options of requestHeaders. ie: {header: value}.
 * @param {number} [options.retryAfter=5000] Time in ms before sending a failed request again.  0 to disable.
 * @param {number} [options.maxRetries=3] Max number of retries. 0 to disable.
 */
$YB.AjaxRequest = function(host, service, params, options) {
    try {
        this.xhr = this.createXHR(); // new xhrRequest();
        this.host = host;
        this.service = service || "";
        this.params = params;
        this.options = options || {};
        this.options.method = this.options.method || $YB.AjaxRequest.options.method;
        this.options.maxRetries = this.options.maxRetries || $YB.AjaxRequest.options.maxRetries;

        if (typeof this.options.retryAfter == 'udefined') {
            this.options.retryAfter = $YB.AjaxRequest.options.retryAfter;
        }

        this.hasError = false;
        this.retries = 0;
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Default options
 */
$YB.AjaxRequest.options = {
    method: 'GET',
    requestHeaders: {},
    maxRetries: 3,
    retryAfter: 5000
};

/** Returns the complete url of the request. */
$YB.AjaxRequest.prototype.getUrl = function() {
    try {
        return this.host + this.service + this.getParams();
    } catch (err) {
        $YB.error(err);
    }
};

/** Returns the params of the request, stringified. ie: '?pluginVersion=5.1.0&systemCode=nicetv'. */
$YB.AjaxRequest.prototype.getParams = function() {
    try {
        switch (typeof this.params) {
            case "object":
                return "?" + this._parseParams(this.params);
            case "string":
                if (this.params) {
                    return "?" + this.params;
                } else {
                    return "";
                }
            default:
                return "";
        }
    } catch (err) {
        $YB.error(err);
    }
}

/**
 * Add or set a parameter for the request. ie: if you want to add 'username=user' use setParam('username', 'user').
 * @param {string} key Name of the paremeter.
 * @param {string} value Name of the paremeter.
 * @return Returns AjaxRequest object.
 */
$YB.AjaxRequest.prototype.setParam = function(key, value) {
    try {
        switch (typeof this.params) {
            case "string":
                if (this.params.length > 0) {
                    this.params += "&";
                }
                this.params += key + "=" + value;
                break;
            case "object":
            default:
                this.params[key] = value;
                break;

        }
        return this;
    } catch (err) {
        $YB.error(err);
        return this;
    }
};

/**
 * Adds a callback to an event.
 *
 * @param {string} event Name of the event. ie: 'load', 'error'...
 * @param {function} [callback] Callback function to call whenever HTTPRequest returns the event.
 * @return {$YB.AjaxRequest} Returns current request item.
 */
$YB.AjaxRequest.prototype.on = function(event, callback) {
    try {
        if (event == 'error') {
            this.hasError = true;
        }

        if (typeof callback == "function") {
            this.xhr.addEventListener(event, callback, false);
        } else if (typeof callback != "undefined") {
            $YB.warn("Warning: Request '" + this.getUrl() + "' has a callback that is not a function.");
        }
    } catch (err) {
        $YB.error(err);
    } finally {
        return this;
    }
};

/**
 * Adds a callback to 'load' event
 *
 * @param {function} [callback] Callback function to call whenever HTTPRequest returns the event.
 * @return {$YB.AjaxRequest} Returns current request item.
 * @see {@link $YB.AjaxRequest#on}
 */
$YB.AjaxRequest.prototype.load = function(callback) {
    return this.on('load', callback);
};

/**
 * Adds a callback to 'error' event
 *
 * @param {function} [callback] Callback function to call whenever HTTPRequest returns the event.
 * @return {$YB.AjaxRequest} Returns current request item.
 * @see {@link $YB.AjaxRequest#on}
 */
$YB.AjaxRequest.prototype.error = function(callback) {
    return this.on('error', callback);
};

/**
 * Send the request.
 *
 * @return returns xhrRequest.send().
 */
$YB.AjaxRequest.prototype.send = function() {
    try {
        this.xhr.open(this.options.method, this.getUrl(), true);
        if (this.options.requestHeaders) {
            for (var key in this.options.requestHeaders) {
                if (this.options.requestHeaders.hasOwnProperty(key)) {
                    this.xhr.setRequestHeader(key, this.options.requestHeaders[key]);
                }
            }
        }

        if (!this.hasError && this.options.retryAfter > 0 && this.options.maxRetries > 0) {
            var that = this;
            this.error(function genericError() {
                that.retries++;
                if (that.retries > that.options.maxRetries) {
                    $YB.error("Error: Aborting failed request. Max retries reached.");
                } else {
                    $YB.error("Error: Request failed. Retry " + that.retries + " of " + that.options.maxRetries + " in " + that.options.retryAfter + "ms.");

                    setTimeout(function() {
                        that.xhr.removeEventListener("error", genericError);
                        that.send();
                    }, that.options.retryAfter);
                }
            });
        }

        $YB.report("XHR Req: " + this.getUrl(), 5, 'navy');

        this.xhr.send();

    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Creates XMLHttpRequest if it is available in the browser.
 * If not, it creates an ActiveXObject xhr item.
 *
 * @return AJAX handler.
 */
$YB.AjaxRequest.prototype.createXHR = function() {
    try {
        if (typeof XMLHttpRequest != "undefined") {
            //Firefox, Opera, IE7, and other browsers will use the native object
            return new XMLHttpRequest();
        } else {
            //IE 5 and 6 will use the ActiveX control
            return new ActiveXObject("Microsoft.xhr");
        }
    } catch (err) {
        $YB.error(err);
        return {};
    }
};

/**
 * Returns XMLHttpRequest object.
 *
 * @return XMLHttpRequest object.
 */
$YB.AjaxRequest.prototype.getXHR = function() {
    return this.xhr;
};

/**
 * Will transform an object of params into a url string.
 *
 * @private
 * @param params An object with the params of the call.
 * @return Return the param chunk. ie: system=nicetv&user=user.
 */
$YB.AjaxRequest.prototype._parseParams = function(params) {
    try {
        if (typeof params === 'string') {
            return params;
        } else if (params !== null && typeof params == 'object') {
            var url = '';
            for (var key in params) {
                if (params[key] !== null && typeof params[key] == 'object') {
                    url += encodeURIComponent(key) + '=' + encodeURIComponent(JSON.stringify(params[key])) + '&';
                } else if (params[key] !== null && typeof params[key] != 'undefined' && params[key] !== '') {
                    url += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&';
                }
            }
            return url.slice(0, -1);
        } else {
            return '';
        }
    } catch (err) {
        $YB.error(err);
        return '';
    }
};

/**
 * @license
 * Youbora AdsApi
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/** AdsApi will help yapi class in the tracking and analyzing the Ad events. It also will help with the iteration with the Ads addons.
 *
 * @class AdsApi
 * @memberof $YB
 * @param {$YB.Api} yapi The youbora-api from where it was called.
 */
$YB.AdsApi = function(yapi) { // constructor
    /** Reference to the {@link $YB.Api|yapi} from where it was called. */
    this.yapi = yapi;

    /** An instance of {@link $YB.utils.Buffer}. */
    this.buffer = new $YB.utils.Buffer(this);

    /** An object with multiples instances of {@link $YB.utils.Chrono}.
     * @prop {$YB.utils.Chrono} total Chrono for the totality of the Ad.
     * @prop {$YB.utils.Chrono} joinTime Chrono between ad start and joinTime.
     * @prop {$YB.utils.Chrono} buffer Reference to this.buffer.chrono
     */
    this.chrono = {
        total: new $YB.utils.Chrono(),
        joinTime: new $YB.utils.Chrono(),
        buffer: this.buffer.chrono
    };
};

$YB.AdsApi.prototype = {
    /** Counters of rolls shown.
     * @prop {number} pre Prerolls shown.
     * @prop {number} mid midrolls shown.
     * @prop {number} post Postrolls shown.
     */
    counter: {
        pre: 0,
        mid: 0,
        post: 0,
        unknown: 0
    },

    /** Sum of preroll times. Useful to adecuate joinTime. */
    totalPrerollTime: 0,

    /** Position of the current roll: pre, mid, post, unknown. */
    position: ''
};


/**
 * Sends '/adStart' request.
 *
 * @param {Object} params An object of parameters sent with the request.
 * @param {number} params.position If ad is pre/mid/post.
 * @param {number} params.number Number of the current ad: 1,2,3...
 * @param {number} params.playhead Playhead of the video at the moment of the adStart.
 * @param {string} params.campaign The name of the ad campaign.
 * @param {string} [params.title] Title of the ad.
 * @param {string} [params.resource] The URL of the ad.
 * @param {number} [params.adDuration] Duration of the ad. In seconds.
 * @param {number} [params.durationJoinTime] JoinTime of the ad if there won't be a adJoinTime.
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.AdsApi.prototype.handleAdStart = function(params, callback) {
    try {
        if (this.yapi.isStartSent) {

            if (this.yapi.isAdStartSent) {
                this.handleStop();
            }

            if (this.buffer.autostart) {
                this.buffer.start();
            }

            this.yapi.isAdStartSent = true;
            this.chrono.total.start();
            this.chrono.joinTime.start();

            params = params || {};
            params.resource = $YB.utils.getFirstDefined(params.resource, this.getAdResource());
            params.position = $YB.utils.getFirstDefined(params.position, this.getAdPosition());
            params.number = $YB.utils.getFirstDefined(params.number, this._getNumber(params.position));
            params.campaign = $YB.utils.getFirstDefined(params.campaign, this.yapi.data.ads.campaign);
            params.title = $YB.utils.getFirstDefined(params.title, this.getAdTitle());
            params.adDuration = $YB.utils.getFirstDefined(params.adDuration, this.yapi.data.ads.duration);
            params.playhead = $YB.utils.getFirstDefined(params.playhead, this.yapi.getAdPlayhead());

            if (typeof params.durationJointime != 'undefined') {
                this.yapi.isAdJoinSent = true;
            }

            this.position = arams.position;

            this.yapi.comm.sendRequest('/adStart', params, callback);

            $YB.notice("Request: NQS /adStart " + params.position + params.number, 'darkgreen');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/adJoinTime' request.
 *
 * @param {Object} params An object of parameters sent with the request.
 * @param {number} params.adPlayhead Playhead of the ad. Normally 0.
 * @param {number} params.duration Duration of the joinTime, in ms.
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.AdsApi.prototype.handleAdJoin = function(params, callback) {
    try {
        if (this.yapi.isAdStartSent && !this.yapi.isAdJoinSent) {
            this.yapi.isAdJoinSent = true;

            if (this.buffer.autostart) {
                this.buffer.start();
            }

            params = params || {};
            params.adPlayhead = $YB.utils.getFirstDefined(params.adPlayhead, this.getAdPlayhead());
            params.duration = $YB.utils.getFirstDefined(params.duration, this.chrono.joinTime.getDeltaTime());

            this.yapi.comm.sendRequest('/adJoinTime', params, callback);

            $YB.notice("Request: NQS /adJoinTime " + params.duration + "ms", 'darkgreen');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/adStop' request.
 *
 * @param {Object} params An object of parameters sent with the request.
 * @param {number} params.adPlayhead Playhead of the ad.
 * @param {number} params.totalDuration Duration from the adStart, in ms.
 * @param {number} [params.adBitrate] Bitrate of the ad.
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.AdsApi.prototype.handleAdStop = function(params, callback) {
    try {
        if (this.yapi.isAdStartSent) {
            this.yapi.isAdStartSent = false;
            this.yapi.isAdJoinSent = false;
            this.yapi.isAdBuffering = false;

            this.buffer.stop();

            params = params || {};
            params.totalDuration = $YB.utils.getFirstDefined(params.totalDuration, this.chrono.total.getDeltaTime());
            params.adPlayhead = $YB.utils.getFirstDefined(params.adPlayhead, this.getAdPlayhead());
            params.adBitrate = $YB.utils.getFirstDefined(params.adBitrate, this.getAdBitrate());

            if (this.position == 'pre' && !this.yapi.isJoinSent) {
                this.totalPrerollTime += params.totalDuration;
            }

            this.yapi.comm.sendRequest('/adStop', params, callback);

            $YB.notice("Request: NQS /adStop " + params.totalDuration + "ms", 'darkgreen');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Starts the autobuffer class $YB.utils.Buffer.
 * Do not use this function if you want to calculate the buffers manually, instead call handleBufferStart() and handleBufferEnd() methods.
 */
$YB.AdsApi.prototype.startAdAutobuffer = function() {
    if (this.yapi.data.enableNiceBuffer) { // EnableNiceBuffer has to be true for the autobuffer to run.
        this.buffer.autostart = true;
    }
};

/** Handles Ad Buffer Start */
$YB.AdsApi.prototype.handleAdBufferStart = function() {
    try {
        if (this.yapi.isAdJoinSent && !this.yapi.isAdBuffering) {
            this.yapi.isAdBuffering = true;
            this.chrono.buffer.start();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/adBufferUnderrun' request.
 *
 * @param {Object} params An object of parameters sent with the request.
 * @param {number} params.adPlayhead Playhead of the ad.
 * @param {number} params.duration Duration of the buffer, in ms.
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.AdsApi.prototype.handleAdBufferEnd = function(params, callback) {
    try {
        if (this.yapi.isAdJoinSent && this.yapi.isAdBuffering) {
            this.yapi.isAdBuffering = false;

            params = params || {};
            params.adPlayhead = $YB.utils.getFirstDefined(params.adPlayhead, this.getAdPlayhead());
            params.duration = $YB.utils.getFirstDefined(params.duration, this.chrono.buffer.getDeltaTime());
            this.yapi.commsendRequest('/adBufferUnderrun', params, callback);

            $YB.notice("Request: NQS /adBufferUnderrun " + params.duration + "ms", 'darkgreen');
        }
    } catch (err) {
        $YB.error(err);
    }
};

$YB.AdsApi.prototype._getNumber = function(pos) {
    switch (pos) {
        case 'pre':
            return ++this.counter.pre;
        case 'mid':
            return ++this.counter.mid;
        case 'post':
            return ++this.counter.post;
        default:
            return ++this.counter.unknown;
    }
};

/**
 * Tries to get the resource of the ad.
 * The order is {@link $YB.Data} > adnalyzer.getResource() > "".
 * @return {string} Resource or empty string.
 */
$YB.AdsApi.prototype.getAdResource = function() {
    try {
        if (typeof this.yapi.data.ads.resource != 'undefined') {
            return this.yapi.data.ads.resource;
        } else if (typeof this.yapi.plugin.ads != 'undefined' && typeof this.yapi.plugin.ads.getAdResource == 'function') {
            return this.yapi.plugin.ads.getAdResource();
        } else {
            return '';
        }
    } catch (err) {
        $YB.warn(err);
        return "";
    }
};

/**
 * Tries to get the playhead of the ad from adnalyzer.getPlayhead().
 * @return {number} Playhead in seconds (rounded) or 0
 */
$YB.AdsApi.prototype.getAdPlayhead = function() {
    try {
        if (typeof this.yapi.plugin.ads != 'undefined' && typeof this.yapi.plugin.ads.getAdPlayhead == 'function') {
            return this.yapi.plugin.ads.getAdPlayhead();
        } else {
            return 0;
        }
    } catch (err) {
        $YB.warn(err);
        return 0;
    }
};


/**
 * Tries to get the position of the roll (pre, mid, post) of the ad from adnalyzer.getPosition().
 * The order is {@link $YB.Data} > adnalyzer.getPosition() > "unknown".
 * @return {string} Position (pre, mid, post) or 'unknown';
 */
$YB.AdsApi.prototype.getAdPosition = function() {
    try {
        if (typeof this.yapi.data.ads.position != 'undefined') {
            return this.yapi.data.ads.position;
        } else if (typeof this.yapi.plugin.ads != 'undefined' && typeof this.yapi.plugin.ads.getAdPosition == 'function') {
            return this.yapi.plugin.ads.getAdPosition();
        } else {
            return 'unknown';
        }
    } catch (err) {
        $YB.warn(err);
        return 'unknown';
    }
};

/**
 * Tries to get the title of the ad, from adnalyzer.getTitle();
 * The order is {@link $YB.Data} > adnalyzer.getTitle() > "".
 * @return {string} Title of the ad or "";
 */
$YB.AdsApi.prototype.getAdTitle = function() {
    try {
        if (typeof this.yapi.data.ads.title != 'undefined') {
            return this.yapi.data.ads.title;
        } else if (typeof this.yapi.plugin.ads != 'undefined' && typeof this.yapi.plugin.ads.getAdTitle == 'function') {
            return this.yapi.plugin.ads.getAdTitle();
        } else {
            return '';
        }
    } catch (err) {
        $YB.warn(err);
        return '';
    }
};

/**
 * Tries to get the mediaduration of the ad from plugin.getAdDuration().
 * @return {number} Duration in seconds (rounded) or 0;
 */
$YB.AdsApi.prototype.getAdDuration = function() {
    try {
        if (typeof this.yapi.data.ads.duration != "undefined") {
            return this.yapi.data.ads.duration;
        } else if (typeof this.yapi.plugin.ads != 'undefined' && typeof this.yapi.plugin.ads.getAdDuration == 'function') {
            var d = this.yapi.plugin.ads.getAdDuration();
            if (d === 0 || d == Infinity || isNaN(d)) {
                return 0;
            } else {
                return Math.round(d);
            }
        } else {
            return 0;
        }
    } catch (err) {
        $YB.warn(err);
        return 0;
    }
};

/**
 * Tries to get the bitrate of the ad with plugin.getBitrate().
 * @return {number} Bitrate or -1.
 */
$YB.AdsApi.prototype.getAdBitrate = function() {
    try {
        if (typeof this.yapi.plugin.ads != 'undefined' && typeof this.yapi.plugin.ads.getAdBitrate == 'function') {
            return Math.round(this.yapi.plugin.ads.getAdBitrate());
        } else {
            return -1;
        }
    } catch (err) {
        $YB.warn(err);
        return -1;
    }
};

/**
 * @license
 * Youbora PingApi
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Instances of this class will call a callback every setted interval.
 *
 * @class
 * @memberof $YB
 * @param {$YB.Api} yapi The yapi from where it was called.
 */
$YB.PingApi = function(yapi) {
    try {
        this.time = 0;
        this.yapi = yapi;
        this.interval = 5000;
        this.isRunning = false;
        this.timer = null;

        /** An object of entities changed to be sent in pings. */
        this.changedEntities = [];

        /** Last rendition sent. */
        this.lastRendition = '';

    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Returns the time since last ping.
 */
$YB.PingApi.prototype.getDeltaTime = function() {
    if (this.time) {
        return new Date().getTime() - this.time;
    } else {
        return -1;
    }
};

/**
 * Starts the timer.
 */
$YB.PingApi.prototype.start = function() {
    try {
        this.isRunning = true;
        this._setPing();

        $YB.notice("Sending pings every " + this.interval + "ms.", 'darkgreen');
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Stops the timer.
 */
$YB.PingApi.prototype.stop = function() {
    try {
        this.isRunning = false;
        clearTimeout(this.timer);
    } catch (err) {
        $YB.error(err);
    }
};

$YB.PingApi.prototype._setPing = function() {
    try {
        if (this.isRunning) {
            var context = this;
            this.time = new Date().getTime();
            this.timer = setTimeout(function() {
                context.handlePing({
                    diffTime: context.getDeltatime
                });
                context._setPing();
            }, this.interval);
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/ping' request.
 *
 * @param {Object} params An object of parameters sent with the request.
 * @param {number} params.time Video curent position / playhead(seconds). Can't be 0.
 * @param {number} [params.diffTime] Real timelapse since the last ping (miliseconds).
 * @param {number} [params.pingTime] Ping time in seconds.
 * @param {number} [params.bitrate] Bitrate of the video.
 * @param {number} [params.throughput] Throughput of the video.
 * @param {string} [params.entityType] Entity Type (only if the entity has to change).
 * @param {string|object} [params.entityValue] Entity Value (only if the entity has to change). Might be a value or an object.
 * @param {number} [params.totalBytes] Flash players total bytes, 0 otherwise.
 * @param {number} [params.dataType] 0 fot HTTP, 1 for RTMP(Flash). Not needed if bitrate is specified.
 * @param {string} [params.nodeHost] NodeHost (string).
 * @param {number} [params.nodeType] NodeType (int).
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.PingApi.prototype.handlePing = function(params, callback) {
    try {
        params = params || {};
        params.time = $YB.utils.getFirstDefined(params.time, this.yapi.video.getPlayhead());
        params.bitrate = $YB.utils.getFirstDefined(params.bitrate, this.yapi.video.getBitrate());
        params.throughput = $YB.utils.getFirstDefined(params.throughput, this.yapi.video.getThroughput());
        params.totalBytes = $YB.utils.getFirstDefined(params.totalBytes, 0);
        params.pingTime = $YB.utils.getFirstDefined(params.pingTime, this.yapi.comm.pingTime);

        //Rendition
        var rendition = this.yapi.video.getRendition();
        if (this.lastRendition != rendition) {
            this.changeEntity('rendition', rendition);
            this.lastRendition = rendition;
        }

        // Changed entities
        if (this.changedEntities.length == 2) {
            params.entityType = $YB.utils.getFirstDefined(params.entityType, this.changedEntities.shift());
            params.entityValue = $YB.utils.getFirstDefined(params.entityValue, this.changedEntities.shift());
        } else if (this.changedEntities.length > 2) {
            var obj = {};
            while (this.changedEntities.length > 0) {
                obj[this.changedEntities.shift()] = this.changedEntities.shift();
            }
            params.entityValue = $YB.utils.getFirstDefined(params.entityValue, JSON.stringify(obj));
        }

        // Ads
        if (this.yapi.isStartSent) {
            params.adPlayhead = $YB.utils.getFirstDefined(params.adPlayhead, this.yapi.ads.getAdPlayhead());
            params.adBitrate = $YB.utils.getFirstDefined(params.adBitrate, this.yapi.ads.getAdBitrate());
        }

        this.yapi.comm.sendRequest('/ping', params, callback);

    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Queues an entity context would be changed during the next ping.
 * @param {string} key Name of the entity. If the key is already queued to change, it will be overriden. ie: duration, rendition...
 * @param {mixed} value New value.
 */
$YB.PingApi.prototype.changeEntity = function(key, value) {
    try {
        this.changedEntities.push(key);
        this.changedEntities.push(value);
    } catch (err) {
        $YB.error(err);
    }
}

/**
 * @license
 * Youbora VideoApi
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/** AdsApi will help yapi class in the tracking and analyzing the Video events.
 *
 * @class
 * @memberof $YB
 * @param {$YB.VideoApi} yapi The youbora-api from where it was called.
 */
$YB.VideoApi = function(yapi) { // constructor
    /** Reference to the {@link $YB.VideoApi|yapi} from where it was called. */
    this.yapi = yapi;

    /** An instance of {@link $YB.utils.Buffer}. */
    this.yapi.buffer = new $YB.utils.Buffer(this);

    /** An object with multiples instances of {@link $YB.utils.Chrono}.
     * @prop {$YB.utils.Chrono} seek Chrono for seeks.
     * @prop {$YB.utils.Chrono} pause Chrono for pauses.
     * @prop {$YB.utils.Chrono} joinTime Chrono between start and joinTime.
     * @prop {$YB.utils.Chrono} buffer Reference to this.yapi.buffer.chrono
     */
    this.yapi.chrono = {
        seek: new $YB.utils.Chrono(),
        pause: new $YB.utils.Chrono(),
        joinTime: new $YB.utils.Chrono(),
        buffer: this.yapi.buffer.chrono
    };

    /** Last bitrate calculated. */
    this.lastBitrate = 0;
    /** Last duration sent. */
    this.lastDuration = 0;
};

/**
 * Sends '/start' request.
 *
 * @param {Object} params An object of parameters sent with the request.
 * @param {string} params.system system code
 * @param {string} params.pluginVersion 3.x.x-<pluginName>
 * @param {string} [params.player] Name of the player the plugin is designed for (aka pluginName).
 * @param {string} [params.playerVersion] Version of the player
 * @param {string} [params.user] username.
 * @param {string} params.resource resource filename
 * @param {string} [params.transcode] Transaction code.
 * @param {boolean} [params.live] boolean or string 'true'/'false'. false by default
 * @param {string} [params.title] Title of the video.
 * @param {Object} [params.properties] Object with properties
 * @param {string} [params.referer] window.location
 * @param {number} [params.totalBytes] Total bytes sent, 0 otherwise. It will be used to calculate bitrate.
 * @param {number} [params.pingTime] Ping time in seconds.
 * @param {number} [params.duration] Total duration of the video in seconds.
 * @param {string} [params.nodeHost] NodeHost de Level3/akamai (string).
 * @param {number} [params.nodeType] NodeType de Level3/akamai (int).
 * @param {number} [params.isBalanced] '1' if content was balanced.
 * @param {number} [params.isResumed] '1' if content was resumed.
 * @param {boolean} [params.hashTitle] True if hashTitle is on.
 * @param {string} [params.cdn] CDN code to apply in the view.
 * @param {string} [params.isp] ISP name
 * @param {string} [params.ip] IP
 * @param {string} [params.param1...10] Custom parameters
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.VideoApi.prototype.handleStart = function(params, callback) {
    try {
        if (this.yapi.isStartSent) { // If there's a previous view, close it
            this.handleStop();
        }

        if (this.yapi.data.parseCDNNodeHost || this.yapi.data.parseHLS) {
            this.yapi.resourceParser.init();
        }

        this.yapi.isStartSent = true;

        this.yapi.chrono.joinTime.start();
        this.yapi.pinger.start();

        this._consolidateTitle();

        params = params || {};
        params.system = $YB.utils.getFirstDefined(params.system, this.yapi.data.accountCode);
        params.player = $YB.utils.getFirstDefined(params.player, this.yapi.plugin.pluginName);
        params.pluginVersion = $YB.utils.getFirstDefined(params.pluginVersion, this.yapi.plugin.pluginVersion);
        params.playerVersion = $YB.utils.getFirstDefined(params.playerVersion, this.getPlayerVersion());
        params.resource = $YB.utils.getFirstDefined(params.resource, this.getResource());
        params.duration = $YB.utils.getFirstDefined(params.duration, this.getMediaDuration());
        params.live = $YB.utils.getFirstDefined(params.live, this.getIsLive());
        params.rendition = $YB.utils.getFirstDefined(params.rendition, this.getRendition());
        params.user = $YB.utils.getFirstDefined(params.user, this.yapi.data.username);
        params.transcode = $YB.utils.getFirstDefined(params.transcode, this.yapi.data.transactionCode);
        params.title = $YB.utils.getFirstDefined(params.title, this.yapi.data.media.title);
        params.properties = $YB.utils.getFirstDefined(params.properties, this.yapi.data.properties);
        params.hashTitle = $YB.utils.getFirstDefined(params.hashTitle, this.yapi.data.hashTitle);
        params.cdn = $YB.utils.getFirstDefined(params.cdn, this.yapi.data.network.cdn);
        params.isp = $YB.utils.getFirstDefined(params.isp, this.yapi.data.network.isp);
        params.ip = $YB.utils.getFirstDefined(params.ip, this.yapi.data.network.ip);
        params.param1 = $YB.utils.getFirstDefined(params.param1, this.yapi.data.extraParams.param1);
        params.param2 = $YB.utils.getFirstDefined(params.param2, this.yapi.data.extraParams.param2);
        params.param3 = $YB.utils.getFirstDefined(params.param3, this.yapi.data.extraParams.param3);
        params.param4 = $YB.utils.getFirstDefined(params.param4, this.yapi.data.extraParams.param4);
        params.param5 = $YB.utils.getFirstDefined(params.param5, this.yapi.data.extraParams.param5);
        params.param6 = $YB.utils.getFirstDefined(params.param6, this.yapi.data.extraParams.param6);
        params.param7 = $YB.utils.getFirstDefined(params.param7, this.yapi.data.extraParams.param7);
        params.param8 = $YB.utils.getFirstDefined(params.param8, this.yapi.data.extraParams.param8);
        params.param9 = $YB.utils.getFirstDefined(params.param9, this.yapi.data.extraParams.param9);
        params.param10 = $YB.utils.getFirstDefined(params.param10, this.yapi.data.extraParams.param10);
        params.totalBytes = $YB.utils.getFirstDefined(params.totalBytes, this.getTotalBytes());
        params.pingTime = $YB.utils.getFirstDefined(params.pingTime, this.yapi.comm.pingTime);
        params.referer = $YB.utils.getFirstDefined(params.referer, (typeof window != 'undefined') ? window.location.href : '');
        params.properties = $YB.utils.getFirstDefined(params.properties, {});

        if (this.yapi.data.parseCDNNodeHost) {
            params.nodeHost = $YB.utils.getFirstDefined(params.nodeHost, this.yapi.resourceParser.cdnHost);
            params.nodeType = $YB.utils.getFirstDefined(params.nodeType, this.yapi.resourceParser.cdnType);
        }

        if (this.yapi.data.resumeConfig.enabled) { // If Resume service is enabled
            this.yapi.resume.start();
            params.isResumed = this.yapi.resume.isResumed;
        }

        if (this.yapi.data.isBalanced == 1) { // Add isBalanced
            params.isBalanced = 1;
        }

        this.yapi.comm.nextView(params.live);
        this.yapi.comm.sendRequest('/start', params, callback);

        // Save lastDuration to sent it only once
        this.lastDuration = params.duration;

        $YB.notice("Request: NQS /start " + params.resource, 'darkgreen');
    } catch (err) {
        $YB.error(err);
    }
};

$YB.VideoApi.prototype._consolidateTitle = function() {
    try {
        if (this.yapi.data && this.yapi.data.media && this.yapi.data.media.title) {
            if (this.yapi.data.properties.content_metadata) {
                this.yapi.data.properties.content_metadata.title = this.yapi.data.media.title;
            } else {
                this.yapi.data.properties.content_metadata = {
                    title: this.yapi.data.media.title
                };
            }
        }
    } catch (err) {
        $YB.error(err);
    }
}


/**
 * Sends '/joinTime' request.
 *
 * @param {Object} params An object of parameters sent with the request.
 * @param {number} params.time time lapse between start and when the video starts playing (miliseconds)
 * @param {number} [params.eventTime] video curent position / playhead (seconds)
 * @param {number} [params.mediaDuration] Total duration of the video in seconds.
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.VideoApi.prototype.handleJoin = function(params, callback) {
    try {
        if (this.yapi.isStartSent && !this.yapi.isJoinSent) {
            this.yapi.isJoinSent = true;

            if (this.yapi.buffer.autostart) {
                this.yapi.buffer.start();
            }

            params = params || {};
            params.time = $YB.utils.getFirstDefined(params.time, this.yapi.chrono.joinTime.getDeltaTime());
            params.eventTime = $YB.utils.getFirstDefined(params.eventTime, this.getPlayhead());
            params.mediaDuration = $YB.utils.getFirstDefined([params.mediaDuration, this.getMediaDuration()]);

            // Check duration to send it only once
            if (params.mediaDuration === this.lastDuration) {
                delete params.mediaDuration;
            }

            //Substract preroll time from time
            if (this.yapi.ads.totalPrerollTime > 0) {
                params.time = params.time - this.yapi.ads.totalPrerollTime;
            }

            this.yapi.comm.sendRequest('/joinTime', params, callback);

            $YB.notice("Request: NQS /joinTime " + params.time + "ms", 'darkgreen');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/stop' request.
 *
 * @param {Object} [params] An object of parameters sent with the request.
 * @param {number} [params.diffTime] Real timelapse since the last ping (miliseconds).
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.VideoApi.prototype.handleStop = function(params, callback) {
    try {
        if (this.yapi.isStartSent) {
            this.yapi.isStartSent = false;
            this.yapi.isPaused = false;
            this.yapi.isJoinSent = false;
            this.yapi.isSeeking = false;
            this.yapi.isBuffering = false;

            this.yapi.resourceParser.clear();

            this.yapi.pinger.stop();
            this.yapi.buffer.stop();

            params = params || {};
            params.diffTime = $YB.utils.getFirstDefined(params.diffTime, this.yapi.pinger.getDeltaTime());

            this.yapi.comm.sendRequest('/stop', params, callback);

            $YB.notice("Request: NQS /stop", 'darkgreen');

            if (this.yapi.data.resumeConfig.enabled) { // If Resume service is enabled
                this.yapi.resume.sendPlayTime();
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * Sends '/pause' request.
 *
 * @param [params] An object of parameters sent with the request.
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.VideoApi.prototype.handlePause = function(params, callback) {
    try {
        if (this.yapi.isJoinSent && !this.yapi.isPaused && !this.yapi.isSeeking && !this.yapi.ads.isStartSent) {
            this.yapi.isPaused = true;
            this.yapi.chrono.pause.start();

            this.yapi.comm.sendRequest('/pause', params, callback);

            $YB.notice("Request: NQS /pause", 'darkgreen');

            if (this.yapi.data.resumeConfig.enabled) { // If Resume service is enabled
                this.yapi.resume.sendPlayTime();
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * Sends '/resume' request.
 *
 * @param [params] An object of parameters sent with the request.
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.VideoApi.prototype.handleResume = function(params, callback) {
    try {
        if (this.yapi.isJoinSent && this.yapi.isPaused && !this.yapi.isSeeking && !this.yapi.ads.isStartSent) {
            this.yapi.isPaused = false;
            this.yapi.chrono.pause.getDeltaTime();

            this.yapi.comm.sendRequest('/resume', params, callback);

            $YB.notice("Request: NQS /resume", 'darkgreen');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Starts the autobuffer class $YB.utils.Buffer.
 * Do not use this function if you want to calculate the buffers manually, instead call handleBufferStart() and handleBufferEnd() methods.
 */
$YB.VideoApi.prototype.startAutobuffer = function() {
    if (this.yapi.data.enableNiceBuffer) { // EnableNiceBuffer has to be true for the autobuffer to run.
        this.yapi.buffer.autostart = true;
    }
};

/** Handles buffer Start event. */
$YB.VideoApi.prototype.handleBufferStart = function() {
    try {
        if (this.yapi.isJoinSent && !this.yapi.isBuffering) {
            this.yapi.isBuffering = true;
            this.yapi.chrono.buffer.start();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/bufferUnderrun' request.
 *
 * @param {Object} params An object of parameters sent with the request.
 * @param {number} params.time Video curent position / playhead (seconds)
 * @param {number} params.duration Total duration of the buffer (miliseconds).
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.VideoApi.prototype.handleBufferEnd = function(params, callback) {
    try {
        if (this.yapi.isJoinSent && this.yapi.isBuffering) {

            this.yapi.isBuffering = false;

            params = params || {};
            params.duration = $YB.utils.getFirstDefined(params.duration, this.yapi.chrono.buffer.getDeltaTime());
            params.time = $YB.utils.getFirstDefined(params.time, this.getPlayhead());

            if (this.getIsLive() && params.time === 0) {
                params.time = 1; // Buffer does not support 0 in time parameter.
            }

            this.yapi.comm.sendRequest('/bufferUnderrun', params, callback);

            $YB.notice("Request: NQS /bufferUnderrun " + params.duration + "ms", 'darkgreen');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/error' request.
 *
 * @param {Object} params An object of parameters sent with the request.
 * @param {number} params.errorCode Numeric code of the error.
 * @param {string} params.msg Message of the error.
 * @param {string} [params.player] Name of the player the plugin is designed for (aka pluginName).
 * @param {string} [params.playerVersion] Version of the player
 * @param {string} [params.system] system code
 * @param {string} [params.pluginVersion] 3.x.x-<pluginName>
 * @param {string} [params.resource] resource filename
 * @param {string} [params.user] username.
 * @param {string} [params.transcode] Transaction code.
 * @param {boolean} [params.live] boolean or string 'true'/'false'. false by default
 * @param {Object} [params.properties] Object with properties
 * @param {string} [params.referer] window.location
 * @param {number} [params.totalBytes] Flash players total bytes, 0 otherwise.
 * @param {number} [params.pingTime] Ping time in seconds.
 * @param {number} [params.duration] Total duration of the video in seconds.
 * @param {string} [params.nodeHost] NodeHost de Level3/akamai (string).
 * @param {number} [params.nodeType] NodeType de Level3/akamai (int).
 * @param {number} [params.isBalanced] '1' if content was balanced.
 * @param {number} [params.isResumed] '1' if content was resumed.
 * @param {boolean} [params.hashTitle] True if hashTitle is on.
 * @param {string} [params.cdn] CDN code to apply in the view.
 * @param {string} [params.isp] ISP name
 * @param {string} [params.ip] IP
 * @param {string} [params.param1...10] Custom parameters
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.VideoApi.prototype.handleError = function(params, callback) {
    try {
        this._consolidateTitle();

        params = params || {};
        params.system = $YB.utils.getFirstDefined(params.system, this.yapi.data.accountCode);
        params.player = $YB.utils.getFirstDefined(params.player, this.yapi.plugin.pluginName);
        params.pluginVersion = $YB.utils.getFirstDefined(params.pluginVersion, this.yapi.plugin.pluginVersion);
        params.playerVersion = $YB.utils.getFirstDefined(params.playerVersion, this.getPlayerVersion());
        params.resource = $YB.utils.getFirstDefined(params.resource, this.getResource());
        params.duration = $YB.utils.getFirstDefined(params.duration, this.getMediaDuration());
        params.live = $YB.utils.getFirstDefined(params.live, this.getIsLive());
        params.user = $YB.utils.getFirstDefined(params.user, this.yapi.data.username);
        params.transcode = $YB.utils.getFirstDefined(params.transcode, this.yapi.data.transactionCode);
        params.title = $YB.utils.getFirstDefined(params.title, this.yapi.data.media.title);
        params.properties = $YB.utils.getFirstDefined(params.properties, this.yapi.data.properties);
        params.hashTitle = $YB.utils.getFirstDefined(params.hashTitle, this.yapi.data.hashTitle);
        params.cdn = $YB.utils.getFirstDefined(params.cdn, this.yapi.data.network.cdn);
        params.isp = $YB.utils.getFirstDefined(params.isp, this.yapi.data.network.isp);
        params.ip = $YB.utils.getFirstDefined(params.ip, this.yapi.data.network.ip);
        params.param1 = $YB.utils.getFirstDefined(params.param1, this.yapi.data.extraParams.param1);
        params.param2 = $YB.utils.getFirstDefined(params.param2, this.yapi.data.extraParams.param2);
        params.param3 = $YB.utils.getFirstDefined(params.param3, this.yapi.data.extraParams.param3);
        params.param4 = $YB.utils.getFirstDefined(params.param4, this.yapi.data.extraParams.param4);
        params.param5 = $YB.utils.getFirstDefined(params.param5, this.yapi.data.extraParams.param5);
        params.param6 = $YB.utils.getFirstDefined(params.param6, this.yapi.data.extraParams.param6);
        params.param7 = $YB.utils.getFirstDefined(params.param7, this.yapi.data.extraParams.param7);
        params.param8 = $YB.utils.getFirstDefined(params.param8, this.yapi.data.extraParams.param8);
        params.param9 = $YB.utils.getFirstDefined(params.param9, this.yapi.data.extraParams.param9);
        params.param10 = $YB.utils.getFirstDefined(params.param10, this.yapi.data.extraParams.param10);
        params.msg = $YB.utils.getFirstDefined(params.msg, 'Unknown Error');
        params.referer = $YB.utils.getFirstDefined(params.referer, (typeof window != 'undefined') ? window.location.href : '');

        if (typeof params.errorCode == 'undefined' || parseInt(params.errorCode) < 0) {
            params.errorCode = 9000;
        }

        if (this.yapi.data.parseCDNNodeHost) {
            params.nodeHost = $YB.utils.getFirstDefined(params.nodeHost, this.yapi.resourceParser.cdnHost);
            params.nodeType = $YB.utils.getFirstDefined(params.nodeType, this.yapi.resourceParser.cdnType);
        }

        if (this.yapi.data.resumeConfig.enabled) { // If Resume service is enabled
            this.yapi.resume.start();
            params.isResumed = this.yapi.resume.isResumed;
        }

        if (this.yapi.data.isBalanced == 1) { // Add isBalanced
            params.isBalanced = 1;
        }

        this.yapi.comm.sendRequest('/error', params, callback);

        $YB.notice("Request: NQS /error " + params.msg, 'darkgreen');
    } catch (err) {
        $YB.error(err);
    }
};

/** Handles Seek Start event. */
$YB.VideoApi.prototype.handleSeekStart = function() {
    try {
        if (this.yapi.isJoinSent) {
            this.yapi.isSeeking = true;
            this.yapi.chrono.seek.start();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/seek' request.
 *
 * @param {Object} params An object of parameters sent with the request.
 * @param {number} params.time Video curent position / playhead (seconds). Can't be 0.
 * @param {number} params.duration Total duration of the buffer (miliseconds).
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.VideoApi.prototype.handleSeekEnd = function(params, callback) {
    try {
        if (this.yapi.isJoinSent) {
            this.yapi.isSeeking = false;

            params = params || {};
            params.duration = $YB.utils.getFirstDefined(params.duration, this.yapi.chrono.seek.getDeltaTime());
            params.time = $YB.utils.getFirstDefined(params.time, this.getPlayhead());

            this.yapi.comm.sendRequest('/seek', params, callback);

            $YB.notice("Request: NQS /seek " + params.duration + "ms", 'darkgreen');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Tries to get the resource of the video.
 * The order is {@link $YB.ResourceParser#realResource} > {@link $YB.Data} > plugin.getResource() > Empty String.
 * @return {string} Resource or empty string.
 */
$YB.VideoApi.prototype.getResource = function() {
    try {
        if (this.yapi.resourceParser && this.yapi.resourceParser.realResource) {
            return this.yapi.resourceParser.realResource;
        } else if (typeof this.yapi.data.media.resource != "undefined") {
            return this.yapi.data.media.resource;
        } else if (typeof this.yapi.plugin.getResource == "function") {
            return this.yapi.plugin.getResource();
        } else {
            return "";
        }
    } catch (err) {
        $YB.warn(err);
        return "";
    }
};

/**
 * Tries to get the playhead of the video from plugin.getPlayhead().
 * @return {number} Playhead in seconds (rounded) or 0
 */
$YB.VideoApi.prototype.getPlayhead = function() {
    try {
        var res = 0;
        if (typeof this.yapi.plugin.getPlayhead == "function") {
            res = this.yapi.plugin.getPlayhead();
        }

        return $YB.utils.parseNumber(res);
    } catch (err) {
        $YB.warn(err);
        return 0;
    }
};

/**
 * Tries to get the mediaduration of the video from {@link $YB.Data} > plugin.getMediaDuration().
 * @return {number} Duration in seconds (rounded) or 0;
 */
$YB.VideoApi.prototype.getMediaDuration = function() {
    try {
        var res = 0;
        if (typeof this.yapi.data.media.duration != "undefined") {
            res = this.yapi.data.media.duration;
        } else if (typeof this.yapi.plugin.getMediaDuration == "function") {
            res = this.yapi.plugin.getMediaDuration();
        }

        return $YB.utils.parseNumber(res);
    } catch (err) {
        $YB.warn(err);
        return 0;
    }
};

/**
 * Tries to get if the video is Live.
 * The order is {@link $YB.Data} > plugin.getIsLive() > false.
 * @return {boolean} True if live, false if vod.
 */
$YB.VideoApi.prototype.getIsLive = function() {
    try {
        //return $YB.utils.getFirstDefined([this.yapi.plugin.getIsLive]);

        if (typeof this.yapi.data.media.isLive != "undefined") {
            return this.yapi.data.media.isLive;
        } else if (typeof this.yapi.plugin.getIsLive == "function" && typeof this.yapi.plugin.getIsLive() == "boolean") {
            return this.yapi.plugin.getIsLive();
        } else {
            return false;
        }
    } catch (err) {
        $YB.warn(err);
        return false;
    }
};

/**
 * Tries to get the rendition of the video from plugin.getRendition().
 * @return {number|string} Rendition of the media.
 */
$YB.VideoApi.prototype.getRendition = function() {
    try {
        if (typeof this.yapi.data.media.rendition != "undefined") {
            return this.yapi.data.media.rendition;
        } else if (typeof this.yapi.plugin.getRendition == "function") {
            return this.yapi.plugin.getRendition();
        } else {
            return '';
        }
    } catch (err) {
        $YB.warn(err);
        return '';
    }
};

/**
 * Tries to get the bitrate of the video with {@link $YB.Data} > plugin.getBitrate().
 * @return {number} Bitrate or -1.
 */
$YB.VideoApi.prototype.getBitrate = function() {
    try {
        var res = -1;
        if (typeof this.yapi.data.media.bitrate != "undefined") {
            res = this.yapi.data.media.bitrate;
        } else if (typeof this.yapi.plugin.getBitrate == "function" && this.yapi.plugin.getBitrate() != -1 && this.yapi.plugin.getBitrate() != 0 && !isNaN(this.yapi.plugin.getBitrate())) {
            res = Math.round(this.yapi.plugin.getBitrate());
        } else if (typeof this.yapi.plugin.video != "undefined" && typeof this.yapi.plugin.video.webkitVideoDecodedByteCount != "undefined") {
            // Chrome workarround
            var bitrate = this.yapi.plugin.video.webkitVideoDecodedByteCount;
            if (this.lastBitrate) {
                bitrate = Math.round(((this.yapi.plugin.video.webkitVideoDecodedByteCount - this.lastBitrate) / 5) * 8);
            }
            this.lastBitrate = this.yapi.plugin.video.webkitVideoDecodedByteCount;
            res = bitrate;
        }

        return $YB.utils.parseNumber(res, -1);
    } catch (err) {
        $YB.warn(err);
        return -1;
    }
};

/**
 * Tries to get the throughput of the video with {@link $YB.Data} > plugin.getThroughput().
 * @return {number} Throughput or -1.
 */
$YB.VideoApi.prototype.getThroughput = function() {
    try {
        var res = -1;
        if (typeof this.yapi.data.media.throughput != "undefined") {
            res = this.yapi.data.media.throughput;
        } else if (typeof this.yapi.plugin.getThroughput == "function" && this.yapi.plugin.getThroughput() != -1 && this.yapi.plugin.getThroughput() != 0 && !isNaN(this.yapi.plugin.getThroughput())) {
            res = Math.round(this.yapi.plugin.getThroughput());
        }

        return $YB.utils.parseNumber(res, -1);
    } catch (err) {
        $YB.warn(err);
        return -1;
    }
};

/**
 * Tries to get the player version with {@link $YB.Data} > plugin.getPlayerVersion().
 * @return {string} PlayerVersion or "".
 */
$YB.VideoApi.prototype.getPlayerVersion = function() {
    try {
        if (typeof this.yapi.data.playerVersion != "undefined") {
            res = this.yapi.data.playerVersion;
        } else if (typeof this.yapi.plugin.getPlayerVersion == "function" && this.yapi.plugin.getPlayerVersion()) {
            return this.yapi.plugin.getPlayerVersion();
        } else {
            return "";
        }
    } catch (err) {
        $YB.warn(err);
        return "";
    }
};

/**
 * Tries to get the total bytes loaded from the video from {@link $YB.Data} > plugin.getTotalBytes().
 * @return {number} Total Bytes or 0;
 */
$YB.VideoApi.prototype.getTotalBytes = function() {
    try {
        var res = 0;
        if (typeof this.yapi.data.media.totalBytes != "undefined") {
            res = this.yapi.data.media.totalBytes;
        } else if (typeof this.yapi.plugin.getTotalBytes == "function") {
            res = this.yapi.plugin.getTotalBytes();
        }

        return $YB.utils.parseNumber(res);
    } catch (err) {
        $YB.warn(err);
        return 0;
    }
};

/**
 * @license
 * Youbora API
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Youbora API implements the first abstaction layer that iterates with the SmartPlugin.
 * Internally, it coordinates a number of inner components like AdsApi, VideoApi, Communications, Chrono, ResourceParser, Resumer, ConcurrencyChecker...
 *
 * @class
 * @memberof $YB
 * @param {SmartPlugin} plugin The instance of SmartPlugin object interacting with this.
 * @param {string} playerId The unique identifier of the player, usually asociated with the ID tag of the DOM.
 * @param {Object} [options] {@link $YB.Data |Youbora Data} initial values.
 */
$YB.Api = function(plugin, playerId, options) { // constructor
    try {
        if (arguments.length < 2 || plugin === undefined || playerId === undefined)
            throw "Fatal Error: $YB.Api constructor needs two arguments at least: plugin and playerId";

        var report = "Y-API Modules: [Video] [Ads] [ResourceParser] ";
        $YB.notice("YouboraJS " + $YB.version + " is ready.");

        /** The instance of SmartPlugin object interacting with this. */
        this.plugin = plugin;

        /** The unique identifier of the player, usually asociated with the ID tag of the DOM. */
        this.playerId = playerId;

        /** Instance of {$YB.Data}. It will retrieve it from {$YB.DataMap} using the PlayerId. */
        this.data = $YB.datamap.get(this.playerId); // Save reference
        this.data.setOptions(options);

        /** An instance of {@link $YB.VideoApi}. */
        this.video = new $YB.VideoApi(this);

        /** An instance of {@link $YB.PingApi}. */
        this.pinger = new $YB.PingApi(this);

        /** An instance of {@link $YB.AdsApi}. */
        this.ads = new $YB.AdsApi(this);

        /** An instance of {@link $YB.Communication}. */
        this.comm = new $YB.Communication(this);

        /** An instance of {@link $YB.services.Resource}. */
        this.resourceParser = new $YB.services.ResourceParser(this);

        if (this.data.concurrencyConfig.enabled) {
            /** An instance of {@link $YB.services.Concurrency}. */
            this.concurrency = new $YB.services.Concurrency(this);
            report += "[Concurrency] ";
        }

        if (this.data.resumeConfig.enabled) {
            /** An instance of {@link $YB.services.Resume}. */
            this.resume = new $YB.services.Resume(this);
            report += "[Resume] ";
        }

        if (this.data.smartswitchConfig.enabled) {
            /** An instance of {@link $YB.services.Smartswitch}. */
            this.smartswitch = new $YB.services.Smartswitch(this);
            report += "[Smartswitch] ";
        }

        // Handle /data
        this.comm.requestData({
            system: this.data.accountCode,
            pluginVersion: this.plugin.pluginVersion,
            targetDevice: this.plugin.pluginName,
            live: this.data.media.isLive
        });


        $YB.notice(report);

    } catch (err) {
        $YB.error(err);
    }
};

$YB.Api.prototype = {
    /** Flag when Start has been sent. */
    isStartSent: false,
    /** Flag when Join has been sent. */
    isJoinSent: false,
    /** Flag when Player is paused. */
    isPaused: false,
    /** Flag when Player is seeking. */
    isSeeking: false,
    /** Flag when Player is buffering. */
    isBuffering: false,
    /** Flag when Ads Start has been sent */
    isAdStartSent: false,
    /** Flag when Join has been sent */
    isAdJoinSent: false,
    /** Flag when Ad is buffering */
    isAdBuffering: false,
};

$YB.Api.prototype.startAutobuffer = function() {
    this.autoBuffer = true;
    this.video.startAutobuffer();
    this.ads.startAdAutobuffer();
};

/**
 * @license
 * Youbora Communication
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Youbora Communication implements the last abstraction layer against NQS requests.
 * Internally, Communication implements an array of $YB.AjaxRequest objects, executing one after another.
 * All requests will be blocked until a first /data call is made, before context, any request sent will be queued.
 *
 * @class
 * @memberof $YB
 * @param {$YB.Api} yapi The yapi from where it was called.
 */
$YB.Communication = function(yapi) {
    try {
        /** Reference to the {@link $YB.Api|yapi} from where it was called. */
        this.yapi = yapi;

        /** The host of the requests. Got from {@link $YB.Data|this.yapi.data.service}. */
        this.host = yapi.data.service;

        /** Time between pings defined by FastData. In seconds. */
        this.pingTime = 5;

        /** Prefix code character. L = Live, V = Vod, U = Unknown. */
        this.prefix = 'U';

        /** Communication code from the FastData request.*/
        this.code = '';

        /** Number of the view. Every /start call will add 1 to context number. Starts at -1 (first view will be 0). */
        this.view = -1;

        /** Array of strings, only when the array is empty the request Queues will begin sending. */
        this.preloaders = [];

        this._requests = {}; // Queue of requests, indexed by view code. Format: {U_code_0: [request1, request2], U_code_1: []}

        this.addPreloader('FastData');
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * The code of the view.
 * @return {string} The code
 */
$YB.Communication.prototype.getViewCode = function() {
    if (this.code) {
        return this.prefix + this.code + '_' + this.view;
    } else {
        return 'nocode';
    }
};

/**
 * Creates a new view code.
 * @param {bool} isLive Determines if the view code should start with V, L or U.
 * @return {string} The code of the new view.
 */
$YB.Communication.prototype.nextView = function(isLive) {
    this.view++;

    if (isLive === true) {
        this.prefix = "L";
    } else if (isLive === false) {
        this.prefix = "V";
    } else {
        this.prefix = "U";
    }

    return this.getViewCode();
};

/**
 * Sends '/data' request. This has to be the first request and all other request will wait till we got a callback from this.
 *
 * @param {Object} params An object of parameters sent with the request.
 * @param {string} params.params.system System code.
 * @param {string} params.pluginVersion 3.x.x-<pluginName>
 * @param {boolean} [params.live] true if the content is life. False if VOD. Do not send if unknown.
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.Communication.prototype.requestData = function(params, callback) {
    try {
        params = params || {};
        delete params.code;
        var context = this,
            ajax = new $YB.AjaxRequest(this._parseServiceHost(this.host), '/data', params);

        ajax.load(function() {
            context.receiveData(ajax);
        });
        ajax.load(callback);

        ajax.send();

        $YB.notice("Request: NQS /data " + params.system, 'darkgreen');
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Callback function to parse '/data' response.
 */
$YB.Communication.prototype.receiveData = function(ajax) {
    try {
        var response = ajax.getXHR().responseXML,
            host = response.getElementsByTagName('h'), // Host
            code = response.getElementsByTagName('c'), // Code
            pt = response.getElementsByTagName('pt'), // Ping time interval in seconds
            balancer = response.getElementsByTagName('b'); // 1 = Balancer enabled
        //tc: response.getElementsByTagName('tc'), // Transaction code
        //t: response.getElementsByTagName('t') // Test

        if (host.length > 0 &&
            code.length > 0 &&
            pt.length > 0 &&
            balancer.length > 0
        ) {
            this.prefix = code[0].textContent.slice(0, 1);
            this.code = code[0].textContent.slice(1);
            this.host = host[0].textContent;
            this.pingTime = pt[0].textContent;
            this.yapi.pinger.interval = this.pingTime * 1000;
            this.balancerEnabled = balancer[0].textContent;

            $YB.notice('FastData \'' + code[0].textContent + '\'is ready.', 'darkgreen');

            // Move requests from 'nocode' to the proper queue
            if (this._requests['nocode'] && this._requests['nocode'].length > 0) {
                this._requests[this.getViewCode()] = this._requests['nocode'];
                delete this._requests['nocode'];
            }

            // Everything is ok, start sending requests
            this.removePreloader('FastData');
        } else {
            $YB.warn('Warning: FastData response is wrong.');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends a generic request. All the specific functions use this method.
 * Will automatically report an error if the request gives Error.
 *
 * @param {string} service A string with the service to be called. ie: 'nqs.nice264.com/data', '/joinTime'...
 * @param {(Object|string)} [params] Either a object or an uri-formated string with the args of the call.
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.Communication.prototype.sendRequest = function(service, params, callback) {
    try {
        if (this.isAllowed(service)) {
            params = params || {};
            delete params.code;
            var ajax = new $YB.AjaxRequest('', service, params);
            ajax.load(callback);
            this._registerRequest(ajax);
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends a service request.
 *
 * @param {string} service A string with the service to be called. ie: 'pc.youbora.com/cping/'
 * @param {(Object|string)} [params] Either a object or an uri-formated string with the args of the call.
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.Communication.prototype.sendService = function(service, params, callback) {
    try {
        var ajax = new $YB.AjaxRequest(this._parseServiceHost(service), '', params);
        ajax.load(callback);
        this._registerRequest(ajax);
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Returns if this kind of analytic is allowed (enableAnalytics must be true and the service shall not be in disabledRequests).
 * @param {string} srv Name of the service. ie: '/seek'.
 * @return {bool} True if the analytic is allowed, false otherwise.
 */
$YB.Communication.prototype.isAllowed = function(srv) {
    return (this.yapi.data.enableAnalytics && !(srv in this.yapi.data.disabledRequests));
}

/**
 * Adds a preloader to the queue. While this queue is not empty, all requests will be stoped.
 * Remember to call removePreloader to unblock the main queue
 *
 * @param {string} key Unique identifier of the blocker. ie: 'CDNParser'.
 */
$YB.Communication.prototype.addPreloader = function(key) {
    try {
        this.preloaders.push(key);
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Removes a preloader. If it was the last preloader, all requests queued will be sent.
 *
 * @param {string} key Unique identifier of the blocker. ie: 'CDNParser'.
 */
$YB.Communication.prototype.removePreloader = function(key) {
    try {
        var pos = this.preloaders.indexOf(key);
        if (pos !== -1) {
            this.preloaders.splice(pos, 1);

            if (this.preloaders.length === 0) { // if there is no more preloaders blocking the queue...
                var ajax;
                for (var k in this._requests) {
                    while (ajax = this._requests[k].shift()) {
                        ajax.setParam('code', k); //if no code, use last

                        if (!ajax.host) {
                            ajax.host = this._parseServiceHost(this.host);
                        }

                        if (typeof ajax.params.resource != "undefined" && this.yapi.resourceParser.realResource) {
                            ajax.params.resource = this.yapi.resourceParser.realResource; // If realresource was fetched, use it.
                        }
                        if (typeof ajax.params.nodeHost != "undefined" && this.yapi.resourceParser.nodeHost) {
                            ajax.params.nodeHost = this.yapi.resourceParser.nodeHost;
                            ajax.params.nodeType = this.yapi.resourceParser.nodeType;
                        }

                        ajax.send();
                    }
                }
            }
        } else {
            $YB.warn('Warning: trying to remove unexisting preloader \'' + key + '\'.');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Adds an AjaxRequest to the queue of requests.
 *
 * @private
 * @param request The AjaxRequest to be queued.
 * @returns Returns a pointer to the AjaxRequest.
 */
$YB.Communication.prototype._registerRequest = function(request) {
    try {

        if (typeof this._requests[this.getViewCode()] == 'undefined') {
            this._requests[this.getViewCode()] = [];
        }

        request.setParam('timemark', new Date().getTime());

        this._requests[this.getViewCode()].push(request);
        this._sendRequests();

        return request;
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Execute pending requests in the queue.
 * @private
 */
$YB.Communication.prototype._sendRequests = function() {
    try {
        if (this.preloaders.length === 0) { // if data has been retreived and there is no preloader blocking the queue...
            var ajax;
            for (var k in this._requests) {
                while (ajax = this._requests[k].shift()) {
                    ajax.setParam('code', k); // add code
                    if (!ajax.host) {
                        ajax.host = this._parseServiceHost(this.host);
                    }

                    ajax.send();
                }

            }

        }

    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Determine the service host protocol. ie: [http[s]:]//nqs.nice264.com
 * Determines protocol by data.httpSecure.
 *
 * @private
 * @param url URL of the service.
 * @return Return the complete service URL.
 */
$YB.Communication.prototype._parseServiceHost = function(url) {
    try {
        // Service
        if (url.indexOf('//') === 0) {
            url = url.slice(2);
        } else if (url.indexOf('http://') === 0) {
            url = url.slice(7);
        } else if (url.indexOf('https://') === 0) {
            url = url.slice(8);
        }

        if (this.yapi.data.httpSecure === true) {
            url = 'https://' + url;
        } else if (this.yapi.data.httpSecure === false) {
            url = 'http://' + url;
        } else {
            url = '//' + url;
        }

        return url;

    } catch (err) {
        $YB.error(err);
        return 'http://localhost';
    }
};

/**
 * @license
 * Youbora Data
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Define the global values for youbora.
 * @class
 * @memberof $YB
 * @param {(Object|$YB.Data)} [options] A literal or another Data containing values.
 */
$YB.Data = function(options) { // constructor
    try {
        this.setOptions(options);
    } catch (err) {
        $YB.error(err);
    }
};

$YB.Data.prototype = {
    // Options
    /**
     * If false, the plugin won't send NQS requests.
     * @type {boolean}
     * @default true
     */
    enableAnalytics: true,
    /**
     * Services inside this array will not be sent. ie: ['/seek', '/adStart'...].
     * @type {array}
     * @default []
     */
    disabledRequests: [],
    /**
     * If true, the plugin will parse HLS files to use the first .ts file found as resource. It might slow performance down.
     * @type {boolean}
     * @default false
     */
    parseHLS: false,
    /**
     * If true, the plugin will query the CDN to retrieve the node name. It might slow performance down.
     * @type {boolean}
     * @default true
     */
    parseCDNNodeHost: false,
    /**
     * This boolean parameter is an anti-resource collision system.
     * @type {boolean}
     * @default false
     */
    hashTitle: true,
    /**
     * Define the security of NQS calls. If true, it will use 'https://'; If false, it will use 'http://'; if undefined, it will use '//'.
     * @type {boolean}
     * @default undefined
     */
    httpSecure: undefined,
    /**
     * If true, the plugin will try to inform about bufferUnderrun based on the playhead of the video (only if player does not natively inform about buffers).
     * @type {boolean}
     * @default true
     */
    enableNiceBuffer: true,

    // Main properties
    /**
     * NicePeopleAtWork account code that indicates the customer account.
     * @type {string}
     * @default demosite
     */
    accountCode: "demosite",
    /**
     * Host of the NQS FastData service.
     * @type {string}
     * @default nqs.nice264.com
     */
    service: "nqs.nice264.com",
    /**
     * User ID value inside your system.
     * @type {string}
     * @default undefined
     */
    username: undefined,
    /**
     * Custom unique code to identify the view.
     * @type {string}
     * @default undefined
     */
    transactionCode: undefined,
    /**
     * Set to 1 if the content was previously balanced.
     * @type {number}
     * @default 0
     */
    isBalanced: 0,

    /**
     * Player Version reproducing the media.
     * @type {string}
     */
    playerVersion: undefined,

    // params defined
    /**
     * Item containing network info.
     * @type {object}
     * @prop {string} [network.cdn] Codename of the CDN where the content is streaming from. ie: AKAMAI
     * @prop {string} [network.ip] IP of the viewer/user. ie: '100.100.100.100'
     * @prop {string} [network.isp] Name of the internet service provider of the viewer/user.
     */
    network: {
        cdn: undefined,
        ip: undefined,
        isp: undefined
    },

    // Media Info
    /**
     * Item containing media info. All the info specified here will override the info gotten from the player.
     * @type {object}
     * @prop {boolean} [isLive] True if the content is live, false if VOD.
     * @prop {string} [resource] URL/path of the current media resource.
     * @prop {string} [title] Title of the media.
     * @prop {number} [duration] Duration of the media.
     * @prop {number} [bitrate] Bitrate of the media.
     * @prop {number} [thoughput] Thoughput of the media.
     * @prop {(number|string)} [rendition] Rendition of the media. Either number "10000" or name "HighDef".
     * @prop {number} [totalBytes] Total Bytes of the media.
     */
    media: {
        isLive: undefined,
        resource: undefined,
        title: undefined,
        duration: undefined,
        bitrate: undefined,
        throughput: undefined,
        rendition: undefined,
        totalBytes: undefined
    },

    // Ad Info
    ads: {
        expected: false,
        resource: undefined,
        campaign: undefined,
        title: undefined,
        position: undefined,
        duration: undefined
    },

    // properties
    /**
     * Item containing mixed extra information about the view, like the director, the parental rating or the audio channels.
     * This object can be defined in any form and size and does not follow strict restrictions.
     * @type {object}
     */
    properties: {
        content_id: undefined,
        content_metadata: {
            genre: undefined,
            language: undefined,
            year: undefined,
            cast: undefined,
            director: undefined,
            owner: undefined,
            parental: undefined,
            price: undefined,
            rating: undefined,
            audioType: undefined,
            audioChannels: undefined
        },
        transaction_type: undefined,
        content_type: undefined,
        device: {
            manufacturer: undefined,
            type: undefined,
            year: undefined,
            version: undefined,
            firmware: undefined
        }
    },

    //extraparams
    /**
     * An object of extra parameters set by the customer.
     * @type {object}
     * @prop {string} [param1] Custom parameter 1.
     * @prop {string} [param2] Custom parameter 2.
     * @prop {string} [param3] Custom parameter 3.
     * @prop {string} [param4] Custom parameter 4.
     * @prop {string} [param5] Custom parameter 5.
     * @prop {string} [param6] Custom parameter 6.
     * @prop {string} [param7] Custom parameter 7.
     * @prop {string} [param8] Custom parameter 8.
     * @prop {string} [param9] Custom parameter 9.
     * @prop {string} [param10] Custom parameter 10.
     */
    extraParams: {
        param1: undefined,
        param2: undefined,
        param3: undefined,
        param4: undefined,
        param5: undefined,
        param6: undefined,
        param7: undefined,
        param8: undefined,
        param9: undefined,
        param10: undefined
    },



    // concurrency
    /**
     * Config concurrency service.
     * @type {object}
     * @prop {boolean} [enabled=false] Enables the service.
     * @prop {string} [contentId=""] It identifies the content (or content section) that is being played.
     * @prop {number} [maxConcurrents=1] It defines the maximum number of concurrent users connected to that asset.
     * @prop {string} [service=pc.youbora.com/cping] Host of the CPing service.
     * @prop {(string|function)} [redirect=http://google.com] Either a callback function when concurrency occurs or a string with an url to redirect the user.
     * @prop {boolean} [ipMode=false] This Boolean defines whether the concurrency control works by session or by IP.
     */
    concurrencyConfig: {
        enabled: false,
        contentId: "",
        maxConcurrents: 1,
        service: "pc.youbora.com/cping",
        redirect: "http://www.google.com",
        ipMode: false
    },

    //resume
    /**
     * Config resume service.
     * @type {object}
     * @prop {boolean} [enabled=false] Enables the service.
     * @prop {string} [contentId=""] It identifies the content (or content section) that is being played.
     * @prop {string} [service=pc.youbora.com/resume] Host of the Resume service.
     * @prop {string} [playTimeService=pc.youbora.com/playTime] Host of the PlayTime service.
     * @prop {function} [callback] Function callback when resume occurs.
     */
    resumeConfig: {
        enabled: false,
        contentId: "",
        service: "pc.youbora.com/resume",
        playTimeService: "pc.youbora.com/playTime",
        callback: function(time) {
            console.log("ResumeService Callback: Seek to second " + time);
        }
    },

    //SmartSwitch
    /**
     * Config the SmartSwitch service.
     * @type {object}
     * @prop {boolean} [enabled=false] Enables the service.
     * @prop {string} [type=balance] Defines the type of the balance.
     * @prop {string} [service=smartswitch.youbora.com] Host of the SmartSwitch service.
     * @prop {string} [zoneCode=""] Defines the area where your smart switching rules apply.
     * @prop {string} [originCode=""] It is the origin code configured in Account Settings.
     * @prop {string} [niceNVA=""] "Not Valid After" parameter.
     * @prop {string} [niceNVB=""] "Not Valid Before" parameter.
     * @prop {string} [token=""] Authentication token for the petition generated with an md5 algorithm applied to the following string chain (appended): md5(system + zoneCode + originCode + filePath + nva + nvb + secretKey)
     */
    smartswitchConfig: {
        enabled: false,
        type: "balance",
        service: "smartswitch.youbora.com",
        zoneCode: "",
        originCode: "",
        niceNVA: "",
        niceNVB: "",
        token: ""
    },

    /**
     * Recursively sets the properties present in the params object. ie: this.username = params.username.
     * @param {Object} options A literal or another Data containing values.
     * @param {Object} [base=this] Start point for recursion.
     */
    setOptions: function(options, base) {
        try {
            base = base || this;
            if (typeof options != "undefined") {
                for (var key in options) {
                    if (typeof base[key] == "object" && base[key] !== null) {
                        this.setOptions(options[key], base[key]);
                    } else {
                        base[key] = options[key];
                    }
                }
            }
        } catch (err) {
            $YB.error(err);
        }
    }
};

/**
 * @license
 * Youbora DataMap
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Define a map of {@link $YB.Data} objects.
 * @class
 * @memberof $YB
 */
$YB.DataMap = function() {
    this._map = {};
};

/** Returns the length of the map.
 * @readonly
 */
$YB.DataMap.prototype.getLength = function() {
    return this._map.length;
};

/**
 * Adds an item to the map
 *
 * @param {string} id Identifier of the data object.
 * @param {$YB.Data} data Data object.
 * @return {$YB.Data} Returns the data object.
 */
$YB.DataMap.prototype.add = function(id, data) {
    return this._map[id] = data;
};

/**
 * Returns the Data object matching the id value.
 *
 * @param {string} id Identifier of the data object.
 * @return {$YB.Data} Returns the data object.
 * @see {@link $YB.DataMap#add}.
 */
$YB.DataMap.prototype.get = function(id) {
    id = id || 'default'; //If called without id, fetch turn it to 'default'

    if (this._map.hasOwnProperty(id) === false) {
        this.add(id, new $YB.Data()); //if id does not exist inside the map, create it.
    }

    return this._map[id];
};

/**
 * Singleton instance of {@link $YB.DataMap}.
 * @memberof $YB
 */
$YB.datamap = new $YB.DataMap();
/**
 * @license
 * YouboraLib Report
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */


/**
 * $YB.report will show all messages inferior to this level.
 * 0: no errors;
 * 1: errors;
 * 2: + warnings;
 * 3: + life-cycle logs;
 * 4: + debug messages;
 * 5: + expose HTTP requests;
 * You can specify youbora-debug="X" inside the &lt;script&gt; tag to force level.
 *
 * @default 1
 * @memberof $YB
 * @see {@link $YB.report}
 */
$YB.errorLevel = 1;

/**
 * If true, console outputs will always be outputed without colors (for debbugin in devices).
 * @default false
 * @memberof $YB
 */
$YB.plainConsole = false;

/**
 * Returns a console coded message
 *
 * @memberof $YB
 * @param {(string|Error)} msg Message
 * @param {number} [errorLevel=3] Defines the level of the error sent. Only errors with level lower than $YB.errorLevel will be displayed.
 * @param {string} [color=darkcyan] Color of the header
 * @see {@link $YB.errorLevel}
 */
$YB.report = function(msg, errorLevel, color) {
    if (console && console.log) {
        errorLevel = errorLevel || 4;
        color = color || 'darkcyan';

        if ($YB.errorLevel >= errorLevel) {

            if ($YB.plainConsole || document.documentMode) { //document.documentMode exits only in IE
                console.log('[Youbora:' + errorLevel + '] ' + msg);
            } else {
                var logMethod = console.log;
                if (errorLevel == 1 && console.error) {
                    logMethod = console.error;
                } else if (errorLevel == 2 && console.warn) {
                    logMethod = console.warn;
                } else if (errorLevel >= 4 && console.debug) {
                    logMethod = console.debug;
                }

                if (msg !== null && typeof msg == 'object') {
                    logMethod.call(console, '%c[Youbora] %o', 'color: ' + color, msg);
                } else {
                    logMethod.call(console, '%c[Youbora] %c%s', 'color: ' + color, 'color: black', msg);
                }
            }

            // If RemoteLog is forced
            if (typeof $YB.remoteLog != "undefined" && $YB.remoteLog.forced === true) {
                $YB.remoteLog('[Youbora:' + errorLevel + '] ' + msg)
            }
        }
    }
};

/**
 * Sends an error console log.
 * @param {(string|Error)} msg Message
 * @param {string} [color=darkred] Specific color for the message.
 * @memberof $YB
 * @see {@link $YB.report}
 */
$YB.error = function(msg, color) {
    $YB.report(msg, 1, color || 'darkred');
};

/**
 * Sends a warning console log.
 * @param {(string|Error)} msg Message
 * @param {string} [color=darkorange] Specific color for the message.
 * @memberof $YB
 * @see {@link $YB.report}
 */
$YB.warn = function(msg, color) {
    $YB.report(msg, 2, color || 'darkorange');
};

/**
 * Sends a notice console log.
 * @param {(string|Error)} msg Message
 * @param {string} [color=darkcyan] Specific color for the message.
 * @memberof $YB
 * @see {@link $YB.report}
 */
$YB.notice = function(msg, color) {
    $YB.report(msg, 3, color || 'darkcyan');
};

/**
 * Sends a debug message to console.
 * @param {(string|Error)} msg Message
 * @param {string} [color=indigo] Specific color for the message.
 * @memberof $YB
 * @see {@link $YB.report}
 */
$YB.debug = function(msg, color) {
    $YB.report(msg, 4, color || 'indigo');
};

/**
 * @license
 * Youbora API
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */


/**
 * This abstract class is the base of all the plugins and immplements some generic calls for all his children.
 * @abstract
 * @class Generic
 */
$YB.plugins.Generic = function() {
    /** Name and platform of the plugin.*/
    this.pluginName = '<GENERIC>';

    /** Version of the plugin. ie: 5.1.0-name */
    this.pluginVersion = '5.1-RC-<GENERIC>';

    /** Instance of $YB.Api. Will send /data request. */
    this.yapi = undefined;

    /** Reference to the player. */
    this.player = undefined;

    /** Reference to the <video> or <object> tag. */
    this.video = undefined;
};

/**
 * This function must be called when a new video starts loading.
 * @see $YB.Api#handleStart
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.playHandler = function(options) {
    try {
        if (!this.yapi.isStartSent) {
            this.setOptions(options);
            this.yapi.video.handleStart();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when video changes in a playlist.
 * @see $YB.Api#handleStart
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.videoChangeHandler = function(options) {
    try {
        this.setOptions(options);
        this.yapi.video.handleStart();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video starts playing for the first time. If playingHandler is used, this function is not needed.
 * @see $YB.Api#handleJoin
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.joinHandler = function() {
    try {
        this.yapi.video.handleJoin();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video starts playing (either for the first time or arfter a pause, seek or buffer).
 * @see $YB.Api#handleStart
 * @see $YB.Api#handleResume
 * @see $YB.Api#handleSeekEnd
 * @see $YB.Api#handleBufferEnd
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.playingHandler = function() {
    try {
        if (this.yapi.isStartSent) {
            if (!this.yapi.isJoinSent) {
                this.yapi.video.handleJoin();
            } else if (this.yapi.isSeeking && this.yapi.isPaused) {
                this.yapi.video.handleSeekEnd();
                this.yapi.video.handleResume();
            } else if (this.yapi.isSeeking) {
                this.yapi.video.handleSeekEnd();
            } else if (this.yapi.isBuffering) {
                this.yapi.video.handleBufferEnd();
            } else if (this.yapi.isPaused) {
                this.yapi.video.handleResume();
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video is paused.
 * @see $YB.Api#handlePause
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.pauseHandler = function() {
    try {
        this.yapi.video.handlePause();
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * This function must be called when a button of pause/resume is pressed.
 * @see $YB.Api#handlePause
 * @see $YB.Api#handleResume
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.pauseToggleHandler = function() {
    try {
        if (this.yapi.isPaused) {
            this.yapi.video.handleResume();
        } else {
            this.yapi.video.handlePause();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video is resumed from a pause. If playingHandler is used, this function is not needed.
 * @see $YB.Api#handleResume
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.resumeHandler = function() {
    try {
        this.yapi.video.handleResume();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video has ended.
 * @see $YB.Api#handleStop
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.endedHandler = function() {
    try {
        this.yapi.video.handleStop();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video has been stoped.
 * @see $YB.Api#handleStop
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.stopHandler = function() {
    try {
        this.yapi.video.handleStop();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video throws an error.
 * @see $YB.Api#handleError
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.errorHandler = function(code, msg) {
    try {
        if (typeof code == "undefined") {
            code = 0;
        }
        msg = msg || 'Unknown error'

        this.yapi.video.handleError({
            errorCode: code,
            msg: msg
        });
        this.yapi.video.handleStop();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video starts a seek.
 * @see $YB.Api#handleSeekStart
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.seekingHandler = function() {
    try {
        this.yapi.video.handleSeekStart();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video ends Seeking. If playingHandler is used, this function is not needed.
 * @see $YB.Api#handleSeekEnd
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.seekedHandler = function() {
    try {
        this.yapi.video.handleSeekEnd();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video starts a buffer underrun.
 * @see $YB.Api#handleBufferStart
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.bufferingHandler = function() {
    try {
        if (!this.yapi.isSeeking) {
            this.yapi.video.handleBufferStart();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video ends buffering. If playingHandler is used, this function is not needed.
 * @see $YB.Api#handleSeekEnd
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.bufferedHandler = function() {
    try {
        if (this.yapi.isStartSent) {
            if (!this.yapi.isJoinSent) {
                this.yapi.video.handleJoin();
            } else if (this.yapi.isSeeking) {
                this.yapi.video.handleSeekEnd();
            } else if (this.yapi.isBuffering) {
                this.yapi.video.handleBufferEnd();
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * Changes the $YB.Data options.
 * @see $YB.Data#setOptions
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.setOptions = function(options) {
    try {
        this.yapi.data.setOptions(options);
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Returns $YB.Data options.
 * @returns $YB.Data
 * @see $YB.Data
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.getOptions = function() {
    try {
        return this.yapi.data;
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * @license
 * Youbora services.Concurrency
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Youbora services.Concurrency will automatically prevent concurrent connections with the same username.
 *
 * @class
 * @memberof $YB
 * @param {$YB.Api} yapi The YAPI item where it was initialized.
 * @param {number} [interval=10000] The time between checks in ms.
 */
$YB.services.Concurrency = function(yapi, interval) {
    try {
        this.yapi = yapi;
        this.interval = interval || 10000;
        this.timer = null;

        this.sessionId = Math.random();

        this.data = this.yapi.data; // Save reference
        this.config = this.yapi.data.concurrencyConfig; // Save reference

        this._init();
    } catch (err) {
        $YB.error(err);
    }
};

$YB.services.Concurrency.prototype._init = function() {
    try {
        var context = this;
        this.timer = setInterval(function() {
            context._checkConcurrency();
        }, this.interval);
    } catch (err) {
        $YB.error(err);
    }
};

$YB.services.Concurrency.prototype._checkConcurrency = function() {
    try {
        var options = {};
        if (this.config.ipMode) {
            options = {
                accountCode: this.data.accountCode,
                concurrencyCode: this.config.contentId,
                concurrencyMaxCount: this.config.maxConcurrents
            };
        } else {
            options = {
                accountCode: this.data.accountCode,
                concurrencyCode: this.config.contentId,
                concurrencySessionId: this.sessionId,
                concurrencyMaxCount: this.config.maxConcurrents
            };
        }

        var context = this;
        this.yapi.comm.sendService(this.config.service, options, function(httpEvent) {
            if (httpEvent.response === "1") {
                // Concurrency collision, kick user.
                context.yapi.handleError({
                    errorCode: 14000,
                    msg: "CC_KICK"
                });

                if (typeof context.config.redirect == "function") {
                    context.config.redirect();
                } else {
                    window.location = context.config.redirect;
                }
            } else if (httpEvent.response === "0") {
                // Concurrency ok...
            } else {
                // Concurrency disabled, stop service.
                clearInterval(context.timer);
            }
        });

    } catch (err) {
        $YB.error(err);
    }
};

/**
 * @license
 * Youbora services.ResourceParser
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Youbora services.ResourceParser will parse the precise CDN of the resource if data.parseHLS or data.parseCDNNodeHost are true.
 * CDNs will be parsed in the order defined in {@link $YB.services.ResourceParser.cdnsAvailable}, modify context list to modify order.
 *
 * @class
 * @memberof $YB
 * @param {$YB.Api} yapi The instance of youbora-api from where it was called.
 */
$YB.services.ResourceParser = function(yapi) {
    try {
        this.yapi = yapi;
        this.parseTimeout = null;

        /** Final resource parsed.
         * @var {string}
         * @readonly
         */
        this.realResource = '';

        /** Node Host name after parsing it.
         * @var {string}
         * @readonly
         */
        this.nodeHost = undefined;

        /** Code of the Node Host type after parsing it.
         * @var {number}
         * @readonly
         */
        this.nodeType = undefined;

        this.cdnRequests = {};
        this.cdns = $YB.services.ResourceParser.cdnsEnabled.slice();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Starts the process if either parseHLS or parseCDNNodeHost are active. The process is aborted automatically after 3 seconds.
 */
$YB.services.ResourceParser.prototype.init = function() {
    try {
        // Reinit
        if (this.realResource) {
            this.clear();
        }

        // Add Preloader
        this.yapi.comm.addPreloader('services.ResourceParser');

        // Abort operation after 3s
        var context = this;
        this.parseTimeout = setTimeout(function() {
            if ('services.ResourceParser' in context.yapi.comm.preloaders) {
                context.realResource = context.yapi.video.getResource();
                context.yapi.comm.removePreloader('services.ResourceParser');
                $YB.warn('services.ResourceParser has exceded the maximum execution time (3s) and will be aborted.');
            }
        }, 3000);

        // Start processing
        this.realResource = this.yapi.video.getResource();
        if (this.yapi.data.parseHLS) {
            this._parseRealResourceAsync(this.yapi.video.getResource());
        } else {
            this._parseCDNAsync();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Clear the info fetched by services.ResourceParser. Should be called after a stop is sent.
 */
$YB.services.ResourceParser.prototype.clear = function() {
    this.realResource = '';
    this.nodeHost = undefined;
    this.nodeType = undefined;
    this.cdnRequests = {};
    this.cdns = $YB.services.ResourceParser.cdnsEnabled.slice();
}

/**
 * Parses resource, if it is an HLS .m3u8 file, it recursively parses its info until .ts or .mp4 is found.
 *
 * @private
 * @param {string} resource path to the resource.
 */
$YB.services.ResourceParser.prototype._parseRealResourceAsync = function(resource, parentResource) {
    try {
        var matches = /(\S*?(\.m3u8|\.m3u|\.ts|\.mp4)(\?\S*|\n|\r|$))/i.exec(resource); //get first line ending in .m3u8, .m3u, .mp4 or .ts
        if (matches !== null) {
            var res = matches[1].trim();
            if (res.indexOf('http') !== 0) { // Does not start with http add parentResource relative route.
                res = parentResource.slice(0, parentResource.lastIndexOf('/')) + "/" + res;
            }
            if (matches[2] == '.m3u8' || matches[2] == '.m3u') { // It is m3u8 or m3u...
                var context = this;
                new $YB.AjaxRequest(res).load(function() {
                        context._parseRealResourceAsync(this.responseText, res); //In this yapi, this referes to the XHR.
                    }).error(function() {
                        context._parseCDNAsync();
                    })
                    .send();
            } else { // It is mp4 or ts...
                this.realResource = res;
                this._parseCDNAsync()
            }
        } else {
            this._parseCDNAsync();
        }
    } catch (err) {
        $YB.error(err);
        this._parseCDNAsync();
    }
};


/** List of CDNs in order for execution. Can be modified to alter the order/list of CDNs available.
 * CDNs context share headers will share request, saving resources.
 */
$YB.services.ResourceParser.cdnsEnabled = ['Level3', 'Akamai', 'Highwinds', 'Fastly'];

/** List of CDNs configuration. */
$YB.services.ResourceParser.cdnsAvailable = {
    Level3: {
        parsers: [{
            type: 'host+type',
            name: 'X-WR-DIAG',
            regex: /Host:(.+)\sType:(.+)/
        }],
        headers: {
            'X-WR-DIAG': 'host'
        }
    },
    Akamai: {
        parsers: [{
            type: 'host+type',
            name: 'X-Cache',
            regex: /(.+)\sfrom\s.+\(.+\/(.+)\).+/
        }]
    },
    Highwinds: {
        parsers: [{
            type: 'host+type',
            name: 'X-HW',
            regex: /.+,[0-9]+\.(.+)\.(.+)/
        }]
    },
    Fastly: {
        parsers: [{
            type: 'host',
            name: 'X-Served-By',
            regex: /([^,\s]+)$/
        }, {
            type: 'type',
            name: 'X-Cache',
            regex: /([^,\s]+)$/
        }]
    }
};

/**
 * Starts the parsing of CDN Nodes.
 * @private
 */
$YB.services.ResourceParser.prototype._parseCDNAsync = function() {
    try {
        if (this.yapi.data.parseCDNNodeHost) {
            if (this.cdns.length > 0 && !this.nodeHost) { // if there's CDN remaining in the pool and host has not been retrieved...
                var cdn = this.cdns.shift();
                if (typeof $YB.services.ResourceParser.cdnsAvailable[cdn] != 'undefined') {

                    var config = $YB.services.ResourceParser.cdnsAvailable[cdn],
                        headers = JSON.stringify(config.headers);

                    if (this.cdnRequests.hasOwnProperty(headers)) {
                        this._parseNode(config.parsers, this.cdnRequests[headers]);
                    } else {
                        var context = this;

                        var ajax = new $YB.AjaxRequest(this.realResource, '', '', {
                            method: 'HEAD',
                            maxRetries: 0,
                            requestHeaders: config.headers
                        });

                        ajax.load(function() {
                            context.cdnRequests[headers] = ajax.getXHR();
                            context._parseNode(config.parsers, ajax.getXHR());
                        });

                        ajax.error(function() {
                            context._parseCDNAsync();
                        });

                        ajax.send();
                    }
                } else {
                    this._parseCDNAsync();
                }
            } else {
                this.yapi.comm.removePreloader('services.ResourceParser');
            }
        } else {
            this.yapi.comm.removePreloader('services.ResourceParser');
        }
    } catch (err) {
        $YB.error(err);
    }
}

$YB.services.ResourceParser.prototype._parseNode = function(parsers, response) {
    try {
        for (var key in parsers) {
            var header = response.getResponseHeader(parsers[key].name); // May throw error since headers will not always be available.
            if (header !== null) {
                var match = parsers[key].regex.exec(header);

                if (match !== null) {
                    switch (parsers[key].type) {
                        case 'host':
                            this.nodeHost = match[1];
                            break;
                        case 'type':
                            this.nodeType = this._parseNodeType(match[1]);
                            break;
                        case 'host+type':
                            this.nodeHost = match[1];
                            this.nodeType = this._parseNodeType(match[2]);
                            break;
                        case 'type+host':
                            this.nodeType = this._parseNodeType(match[1]);
                            this.nodeHost = match[2];
                            break;
                    }
                } else {
                    this._parseCDNAsync();
                    return;
                }
            } else {
                this._parseCDNAsync();
                return;
            }
        }

        this._parseCDNAsync();
    } catch (err) {
        $YB.error(err);
        this._parseCDNAsync();
    }
};

$YB.services.ResourceParser.prototype._parseNodeType = function(type) {
    try {
        switch (type) {
            case 'TCP_HIT':
            case 'HIT':
            case 'c':
                return 1;
            case 'TCP_MISS':
            case 'MISS':
            case 'p':
                return 2;
            case 'TCP_MEM_HIT':
                return 3;
            case 'TCP_IMS_HIT':
                return 4;
            default:
                return 0;
        }
    } catch (err) {
        $YB.error(err);
        return 0;
    }
};

/**
 * @license
 * Youbora services.Resume
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Youbora Resume Service will automatically generate a seek if the player view is closed and resumed.
 *
 * @class
 * @memberof $YB
 * @param {$YB.Api } yapi The yapi from where it was called.
 */
$YB.services.Resume = function(yapi) {
    try {
        this.yapi = yapi;
        this.timer = null;
        this.isResumed = 0;

        this.data = this.yapi.data; // Save reference
        this.config = this.yapi.data.resumeConfig; // Save reference

        this._check();
    } catch (err) {
        $YB.error(err);
    }
};

$YB.services.Resume.prototype._check = function() {
    try {
        if (this.config.enabled && typeof this.config.contentId != "undefined" && typeof this.data.username != "undefined") {

            var context = this;
            this.yapi.comm.sendService(this.config.service, {
                contentId: this.config.contentId,
                userId: this.data.username
            }, function(httpEvent) {
                if (httpEvent.response > 0) {
                    context.isResumed = 1;
                    if (typeof context.config.callback == "function") {
                        context.config.callback(httpEvent.response);
                    } else {
                        $YB.warn("services.Resume callback is not a function");
                    }
                } else if (httpEvent.response === "0") {
                    // Resume ok...
                } else {
                    // Resume disabled, stop service.
                    context.stop();
                }
            });

            $YB.notice("Request: services.Resume check " + this.config.contentId, 'darkgreen');
        } else {
            this.stop();
        }
    } catch (err) {
        $YB.error(err);
    }
};

$YB.services.Resume.prototype._sendPlayTime = function() {
    try {
        if (this.config.enabled && typeof this.config.contentId != "undefined" && typeof this.data.username != "undefined") {
            this.yapi.comm.sendService(this.config.playTimeService, {
                contentId: this.config.contentId,
                userId: this.data.username,
                playTime: this.yapi.getPlayhead()
            });
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Starts sending playtimes to the service
 * @param {number} [interval=6000] How many time between calls in ms.
 */
$YB.services.Resume.prototype.start = function(interval) {
    try {
        interval = interval || 6000;

        this._sendPlayTime();

        var context = this;
        this.timer = setInterval(function() {
            context._sendPlayTime();
        }, interval);
    } catch (err) {
        $YB.error(err);
    }
};

/** Stops sending playtimes */
$YB.services.Resume.prototype.stop = function() {
    try {
        clearInterval(this.timer);
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * @license
 * Youbora services.Smartswitch
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Youbora ConcurrencyService will automatically prevent concurrent connections with the same username.
 *
 * @class
 * @memberof $YB
 * @param {$YB.Api} yapi The yapi from where it was called.
 */
$YB.services.Smartswitch = function(yapi) {
    try {
        this.yapi = yapi;
        this.callback = function() {};

        this.data = this.yapi.data; // Save reference
        this.config = this.yapi.data.smartswitchConfig; // Save reference

    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Execute a callback after balancing the urls
 *
 * @param {string} url Url to be balanced
 * @param {function} callback Callback function. First parameter will be an object with the return of the service.
 */
$YB.services.Smartswitch.prototype.getBalancedUrls = function(url, callback) {
    try {
        this.callback = callback;
        if (this.config.enabled) {

            var context = this;
            this.yapi.comm.sendService(this.config.service, {
                resource: url,
                systemcode: this.data.accountCode,
                zonecode: this.config.zoneCode,
                session: this.yapi.comm.getViewCode(),
                origincode: this.config.originCode,
                niceNva: this.config.niceNVA,
                niceNvb: this.config.niceNVB,
                live: this.yapi.getIsLive(),
                token: this.config.token,
                type: this.config.type
            }, function(xhr) {
                var response;
                try {
                    response = JSON.parse(xhr.response);
                } catch (e) {
                    $YB.warn("Smartswitch said: '" + xhr.response + "'");
                }
                if (response) {
                    context.data.isBalanced = 1;
                    context.callback(response);
                } else {
                    context.callback(false);
                }
            });

            $YB.notice("Request: Smartswitch " + url, 'darkgreen');
        } else {
            this.callback(false);
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * @license
 * Youbora Buffer
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * This class automatically calculates buffers, checking incoherence between playhead of the video and the time spent.
 * If you want to calculate the buffers manually, do not use this class.
 *
 * @class
 * @memberof $YB
 * @param {$YB.Api} api The api from where it was called.
 * @param {Object} [options] Object with custom options.
 * @param {number} [options.interval=800] How many ms between checks.
 * @param {number} [options.threshold=400] The ammount of ms accepted without calling a buffer (Minibuffer).
 * @param {boolean} [options.skipMiniBuffer=true] Skip the minibuffers.
 *
 * @prop {$YB.utils.Chrono} chrono Chrono instance.
 */
$YB.utils.Buffer = function(api, options) {
    try {
        this.api = api;

        this.chrono = new $YB.utils.Chrono();

        this.options = options || {};
        this.options.interval = this.options.interval || 800;
        this.options.threshold = this.options.threshold || 400;
        this.options.skipMiniBuffer = this.options.skipMiniBuffer || true;

        this.timer = null;
        this.lastPlayhead = 0;

        this.autostart = false;
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Starts the autobuffer
 */
$YB.utils.Buffer.prototype.start = function() {
    try {
        if (this.timer === null) {
            if (typeof this.api.getPlayhead == "function") {
                var context = this;
                this.lastPlayhead = 0;
                this.chrono.start();
                this.timer = setInterval(function() {
                    try {
                        context._checkBuffer();
                    } catch (err) {
                        $YB.error(err);
                    }
                }, this.options.interval);
            } else {
                $YB.warn("Warning: Can't start autobuffer because api does not implement getPlayhead().");
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Asynchronus call to check buffer status
 * @private
 */
$YB.utils.Buffer.prototype._checkBuffer = function() {
    try {
        if (this.api.yapi.isJoinSent && !this.api.yapi.isPaused && !this.api.yapi.isSeeking) {
            var currentPlayhead = this.api.getPlayhead();

            if (Math.abs((this.lastPlayhead * 1000) - (currentPlayhead * 1000)) > this.options.threshold) { // Video is playing

                this.lastPlayhead = currentPlayhead;
                if (!this.options.skipMiniBuffer || this.chrono.stop() > (this.options.interval * 1.1)) {
                    this.api.handleBufferEnd();
                }

            } else if (this.lastPlayhead && !this.api.yapi.isBuffering && Math.abs((this.lastPlayhead * 1000) - (currentPlayhead * 1000)) < this.options.threshold) { // Video is buffering

                this.api.handleBufferStart();

            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Stops the autobuffer
 */
$YB.utils.Buffer.prototype.stop = function() {
    try {
        clearInterval(this.timer);
        this.timer = null;
        return this.chrono.stop();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * @license
 * Youbora Chrono
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * This class calculates time lapses between two points.
 * @class
 * @memberof $YB
 */
$YB.utils.Chrono = function() {
    try {
        this.startTime = 0;
        this.lastTime = 0;

    } catch (err) {
        $YB.error(err);
    }
};


/**
 * Returns the time between start() and the last stop() in ms. Returns -1 if either start/stop wasn't called.
 */
$YB.utils.Chrono.prototype.getDeltaTime = function() {
    try {
        if (this.startTime) {
            if (this.lastTime === 0) {
                return this.stop();
            } else {
                return this.lastTime - this.startTime;
            }
        } else {
            return -1;
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Starts the timer.
 */
$YB.utils.Chrono.prototype.start = function() {
    try {
        this.startTime = new Date().getTime();
        this.lastTime = 0;
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Stops the timer and returns current delta time.
 * @return Returns the delta time
 */
$YB.utils.Chrono.prototype.stop = function() {
    try {
        this.lastTime = new Date().getTime();

        return this.getDeltaTime();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Returns true if the chrono has been stoped since the last start().
 * @return True if stop has been called since the last start(). False otherwise.
 */
$YB.utils.Chrono.prototype.isStoped = function() {
    try {
        return (this.lastTime !== 0);
    } catch (err) {
        $YB.error(err);
        return false;
    }
};

/**
 * @license
 * YouboraLib Util
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Returns the first argument not undefined and not null.
 * If a function is passed, it will be executed (no arguments will be sent).
 * @param {array} arr Array of elements and undefineds
 * @return First defined item. If there aren't any, returns null.
 */
$YB.utils.getFirstDefined = function(arr) {
    if (arguments.length > 1) {
        return $YB.utils.getFirstDefined(arguments);
    } else {
        if (typeof arr != 'undefined' && (
                Object.prototype.toString.call(arr) === '[object Array]' ||
                Object.prototype.toString.call(arr) === '[object Arguments]'
            )) {
            for (var i = 0; i < arr.length; i++) {
                if (typeof arr[i] == 'function' && typeof arr[i]() != 'undefined' && arr[i]() !== null) {
                    return $YB.utils.getFirstDefined(arr[i]());
                } else if (typeof arr[i] != 'undefined' && arr[i] !== null) {
                    return $YB.utils.getFirstDefined(arr[i]);
                }
            }
            return null;
        } else {
            return arr;
        }
    }
};

/**
 * Return n if it isn't NaN, negative, Infinity, null or undefined. In any other case, return def.
 * @param {mixed} n Number to be parsed.
 * @param {number} def Number to return if n is not correct.
 */
$YB.utils.parseNumber = function(n, def) {
    if (typeof def == "undefined") {
        def = 0;
    }
    if (!isNaN(n) && n >= 0 && n !== Infinity && n !== null && typeof n != "undefined") {
        return n;
    } else {
        return def;
    }
}

// Define the headers of debug-util functions
$YB.utils.listenAllEvents = $YB.utils.listenAllEvents || function() {};
$YB.utils.serialize = $YB.utils.listenAllEvents || function() {};

/**
 * @license
 * YouboraLib Log
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

// This script will search inside tags and url request for info about errorLevel, plainConsole or remoteLog.
(function() {
    try {
        if (typeof window != 'undefined') {

            function defineConsole(options) {
                switch (options) {
                    case 'plain':
                        $YB.plainConsole = true;
                        break;
                    case 'remote':
                        $YB.remoteLog.forced = true;
                        break;
                    case 'plain+remote':
                    case 'remote+plain':
                        $YB.remoteLog.forced = true;
                        $YB.plainConsole = true;
                        break;
                }
            }

            // It will first search it in the tags: <script src='this_file.js' youbora-debug="X" youbora-console="Y"></script>
            var tags = document.getElementsByTagName('script');
            for (var k in tags) {
                if (tags[k].getAttribute) {
                    var tag = tags[k].getAttribute('youbora-debug');
                    if (tag) {
                        $YB.errorLevel = tag;
                    }

                    tag = tags[k].getAttribute('youbora-console');
                    if (tag) {
                        defineConsole(tag);
                    }
                }
            }


            // Then it will search inside window.location.search for attributes like 'youbora-debug=X' or 'youbora-console=Y'.
            // Config found here will prevail over the one fetched from <script> tags.
            var m = /\?.*\&*youbora-debug=(.+)/i.exec(window.location.search);
            if (m !== null) {
                $YB.errorLevel = m[1];
            }

            m = /\?.*\&*youbora-console=(.+)/i.exec(window.location.search);
            if (m !== null) {
                defineConsole(m[1])
            }
        }
    } catch (err) {
        $YB.error(err);
    }
}());
