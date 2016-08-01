/*
 * ATVLogger
 */
function yblog(msg) {};

/**
 * @license
 * YouboraLib
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

try {
    /**
     * Global namespace for youboralib.
     * @namespace
     */
    var $YB = $YB || {

        /**
         * Version of the library.
         * @memberof $YB
         */
        version: '2.0-appleTv3',

        /**
         * $YB.report will show all messages inferior to this level.
         * 0 = no errors;
         * 1 = only errors;
         * 2 = errors + warnings;
         * 3 = error + warnings + info;
         * 4 = All;
         * You can specify youbora-debug inside the &lt;script&gt; tag to force level 3. With &lt;script youbora-silent&gt; you can force level 0.
         * @default 1
         * @memberof $YB
         * @see {@link $YB.report}
         */
        errorLevel: 1,

        /**
         * Returns a console coded message
         *
         * @memberof $YB
         * @param {(string|Error)} msg Message
         * @see {@link $YB.errorLevel}
         */
        report: function(msg, color, level) {
            level = level || 4;
            if (level <= $YB.errorLevel) {
                yblog(msg);
            }
        },

        /**
         * Sends an error console log.
         * @param {(string|Error)} msg Message
         * @memberof $YB
         * @see {@link $YB.report}
         */
        error: function(msg) {
            $YB.report(msg, 'darkred', 1);
        },

        /**
         * Sends a warning console log.
         * @param {(string|Error)} msg Message
         * @memberof $YB
         * @see {@link $YB.report}
         */
        warning: function(msg) {
            $YB.report(msg, 'darkorange', 2);
        },

        /**
         * Sends a warning console log.
         * @param {(string|Error)} msg Message
         * @memberof $YB
         * @see {@link $YB.report}
         */
        info: function(msg) {
            $YB.report(msg, 'navy', 3);
        },

        /**
         * Sends a notice console log.
         * @param {(string|Error)} msg Message
         * @memberof $YB
         * @see {@link $YB.report}
         */
        notice: function(msg) {
            $YB.report(msg, 'darkcyan', 4);
        },

        /**
         * Sends a notice console log about an ajax request sent.
         * @param {(string|Error)} msg Message
         * @memberof $YB
         * @see {@link $YB.report}
         */
        noticeRequest: function(msg) {
            $YB.report(msg, 'darkgreen', 4);
        },

        /**
         * Sends a notice console log about a debug highlight.
         * All debug highlight should me removed from final code.
         * Note: This method will only be available if you include debug-util.js.
         * @param {(string|Error)} msg Message
         * @memberof $YB
         * @see {@link $YB.report}
         */
        debug: function(msg) {
            $YB.report(msg, 'purple', 5);
        },

        /**
         * If $YB.errorLevel is 4 or more, it shows msg in console.
         * @param {(string|Error)} msg Message
         * @memberof $YB
         */
        log: function(msg) {
            if (this.errorLevel >= 4) {
                yblog(msg);
            }
        },

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
        util: {
            listenAllEvents: function() {},
            serialize: function() {},
            inspect: function(item) {
                if (4 <= $YB.errorLevel) {
                    for (var key in item) {
                        $YB.notice(key + ' > ' + item[key]);
                    }
                }
            },

            /**
             * Returns the first element in the array not undefined and not null.
             * If a function is passed, it will be executed (no arguments will be sent).
             * @param {array} arr Array of elements and undefineds
             * @return First defined item. If there aren't any, returns null.
             */
            getFirstDefined: function(arr) {
                if (typeof arr != 'undefined' && Object.prototype.toString.call(arr) === '[object Array]') {
                    for (var i = 0; i < arr.length; i++) {
                        if (typeof arr[i] == 'function' && typeof arr[i]() != 'undefined' && arr[i]() !== null) {
                            return $YB.util.getFirstDefined(arr[i]());
                        } else if (typeof arr[i] != 'undefined' && arr[i] !== null) {
                            return $YB.util.getFirstDefined(arr[i]);
                        }
                    }
                    return null;
                } else {
                    return arr;
                }
            }
        }
    };

    // Notice Start
    $YB.notice('YouboraLib ' + $YB.version + ' is ready.');

} catch (err) {
    var m = '[Youbora] Fatal Error: Unable to start Youboralib.';
    yblog(m);
    yblog(err);
}
/**
 * @license
 * Youbora AdnalyzerApi
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/** AdnalyzerApi will help yapi class in the tracking and analyzing the Ad events. It also will help with the iteration with the Ads addons.
 *
 * @class
 * @memberof $YB
 * @param {$YB.Api} context The context from where it was called.
 */
$YB.AdnalyzerApi = function(context) { // constructor
    /** Reference to the {@link $YB.Api|context} from where it was called. */
    this.context = context;

    /** Shortcut reference to {@link $YB.Data|this.context.data}. */
    this.data = this.context.data

    /** An instance of {@link $YB.Buffer}. */
    this.buffer = new $YB.Buffer(this);

    /** An object with multiples instances of {@link $YB.Chrono}.
     * @prop {$YB.Chrono} total Chrono for the totality of the Ad.
     * @prop {$YB.Chrono} joinTime Chrono between ad start and joinTime.
     * @prop {$YB.Chrono} buffer Reference to this.buffer.chrono
     */
    this.chrono = {
        total: new $YB.Chrono(),
        joinTime: new $YB.Chrono(),
        buffer: this.buffer.chrono
    };
};

$YB.AdnalyzerApi.prototype = {
    /** Flag when Ads Start has been sent */
    isStartSent: false,
    /** Flag when Join has been sent */
    isJoinSent: false,
    /** Flag when Ad is buffering */
    isBuffering: false,

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


/** Handles Ad Start event.
 * @see $YB.Communication#sendAdStart
 */
$YB.AdnalyzerApi.prototype.handleStart = function(params) {
    try {
        if (this.context.isStartSent) {

            if (this.isStartSent) {
                this.handleStop();
            }

            if (this.buffer.autostart) {
                this.buffer.start();
            }

            this.isStartSent = true;
            this.chrono.total.start();
            this.chrono.joinTime.start();

            params = params || {};
            params.resource = [params.resource, this.getResource()];
            params.position = [params.position, this.getPosition()];
            params.number = [params.number, this._getNumber(params.position)];
            params.campaign = [params.campaign, this.data.ads.campaign];
            params.title = [params.title, this.getTitle()];
            params.adDuration = [params.adDuration, this.data.ads.duration];
            params.playhead = [params.playhead, this.context.getPlayhead()];

            if (typeof params.durationJointime != 'undefined') {
                this.isJoinSent = true;
            }

            this.position = $YB.util.getFirstDefined(params.position);
            this.context.comm.sendAdStart(params);
        }
    } catch (err) {
        $YB.error(err);
    }
};

/** Handles Ad JoinTime event.
 * @see $YB.Communication#sendAdJoin
 */
$YB.AdnalyzerApi.prototype.handleJoin = function(params) {
    try {
        if (this.isStartSent && !this.isJoinSent) {
            this.isJoinSent = true;

            if (this.buffer.autostart) {
                this.buffer.start();
            }

            params = params || {};
            params.adPlayhead = [params.adPlayhead, this.getPlayhead()];
            params.duration = [params.duration, this.chrono.joinTime.getDeltaTime()];

            this.context.comm.sendAdJoin(params);
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Starts the autobuffer class $YB.Buffer.
 * Do not use this function if you want to calculate the buffers manually, instead call handleBufferStart() and handleBufferEnd() methods.
 */
$YB.AdnalyzerApi.prototype.startAutobuffer = function() {
    if (this.context.data.enableNiceBuffer) { // EnableNiceBuffer has to be true for the autobuffer to run.
        this.buffer.autostart = true;
    }
};

/** Handles Ad Buffer Start */
$YB.AdnalyzerApi.prototype.handleBufferStart = function(params) {
    try {
        if (this.isJoinSent && !this.isBuffering) {
            this.isBuffering = true;
            this.chrono.buffer.start();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/** Handles Ad Buffer End event
 * @see $YB.Communication#sendAdBuffer
 */
$YB.AdnalyzerApi.prototype.handleBufferEnd = function(params) {
    try {
        if (this.isJoinSent && this.isBuffering) {
            this.isBuffering = false;

            params = params || {};
            params.adPlayhead = [params.adPlayhead, this.getPlayhead()];
            params.duration = [params.duration, this.chrono.buffer.getDeltaTime()];

            this.context.comm.sendAdBuffer(params);
        }
    } catch (err) {
        $YB.error(err);
    }
};

/** Handles Ad End event.
 * @see $YB.Communication#sendAdStop
 */
$YB.AdnalyzerApi.prototype.handleStop = function(params) {
    try {
        if (this.isStartSent) {
            this.isStartSent = false;
            this.isJoinSent = false;
            this.isBuffering = false;

            this.buffer.stop();

            params = params || {};
            params.totalDuration = [params.totalDuration, this.chrono.total.getDeltaTime()];
            params.adPlayhead = [params.adPlayhead, this.getPlayhead()];
            params.adBitrate = [params.adBitrate, this.getBitrate()];

            if (this.position == 'pre' && !this.context.isJoinSent) {
                this.totalPrerollTime += $YB.util.getFirstDefined(params.totalDuration);
            }

            this.context.comm.sendAdStop(params);
        }
    } catch (err) {
        $YB.error(err);
    }
};

$YB.AdnalyzerApi.prototype._getNumber = function(pos) {
    switch ($YB.util.getFirstDefined(pos)) {
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
$YB.AdnalyzerApi.prototype.getResource = function() {
    try {
        if (typeof this.data.ads.resource != 'undefined') {
            return this.data.ads.resource;
        } else if (typeof this.context.plugin.ads != 'undefined' && typeof this.context.plugin.ads.getResource == 'function') {
            return this.context.plugin.ads.getResource();
        } else {
            return '';
        }
    } catch (err) {
        $YB.warning(err);
        return "";
    }
};

/**
 * Tries to get the playhead of the ad from adnalyzer.getPlayhead().
 * @return {number} Playhead in seconds (rounded) or 0
 */
$YB.AdnalyzerApi.prototype.getPlayhead = function() {
    try {
        if (typeof this.context.plugin.ads != 'undefined' && typeof this.context.plugin.ads.getPlayhead == 'function') {
            return this.context.plugin.ads.getPlayhead();
        } else {
            return 0;
        }
    } catch (err) {
        $YB.warning(err);
        return 0;
    }
};


/**
 * Tries to get the position of the roll (pre, mid, post) of the ad from adnalyzer.getPosition().
 * The order is {@link $YB.Data} > adnalyzer.getPosition() > "unknown".
 * @return {string} Position (pre, mid, post) or 'unknown';
 */
$YB.AdnalyzerApi.prototype.getPosition = function() {
    try {
        if (typeof this.data.ads.position != 'undefined') {
            return this.data.ads.position;
        } else if (typeof this.context.plugin.ads != 'undefined' && typeof this.context.plugin.ads.getPosition == 'function') {
            return this.context.plugin.ads.getPosition();
        } else {
            return 'unknown';
        }
    } catch (err) {
        $YB.warning(err);
        return 'unknown';
    }
};

/**
 * Tries to get the title of the ad, from adnalyzer.getTitle();
 * The order is {@link $YB.Data} > adnalyzer.getTitle() > "".
 * @return {string} Title of the ad or "";
 */
$YB.AdnalyzerApi.prototype.getTitle = function() {
    try {
        if (typeof this.data.ads.title != 'undefined') {
            return this.data.ads.title;
        } else if (typeof this.context.plugin.ads != 'undefined' && typeof this.context.plugin.ads.getTitle == 'function') {
            return this.context.plugin.ads.getTitle();
        } else {
            return '';
        }
    } catch (err) {
        $YB.warning(err);
        return '';
    }
};

/**
 * Tries to get the mediaduration of the ad from plugin.getAdDuration().
 * @return {number} Duration in seconds (rounded) or 0;
 */
$YB.AdnalyzerApi.prototype.getAdDuration = function() {
    try {
        if (typeof this.data.ads.duration != "undefined") {
            return this.data.ads.duration;
        } else if (typeof this.context.plugin.ads != 'undefined' && typeof this.context.plugin.ads.getAdDuration == 'function') {
            var d = this.context.plugin.ads.getAdDuration();
            if (d === 0 || d == Infinity || isNaN(d)) {
                return 0;
            } else {
                return Math.round(d);
            }
        } else {
            return 0;
        }
    } catch (err) {
        $YB.warning(err);
        return 0;
    }
};

/**
 * Tries to get the bitrate of the ad with plugin.getBitrate().
 * @return {number} Bitrate or -1.
 */
$YB.AdnalyzerApi.prototype.getBitrate = function() {
    try {
        if (typeof this.context.plugin.ads != 'undefined' && typeof this.context.plugin.ads.getBitrate == 'function') {
            return Math.round(this.context.plugin.ads.getBitrate());
        } else {
            return -1;
        }
    } catch (err) {
        $YB.warning(err);
        return -1;
    }
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
 * @param {string} [options.requestHeader] A literal with options of requestHeader. ie: {header: value}.
 * @param {number} [options.retryAfter=5000] Time in ms before sending a failed request again. 0 to disable.
 * @param {number} [options.maxRetries=5] Max number of retries.
 */
$YB.AjaxRequest = function(host, service, params, options) {
    try {
        this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
        this.host = host;
        this.service = service || "";
        this.params = params || "";
        this.options = options || {};
        this.options.method = this.options.method || $YB.AjaxRequest.options.method;
        this.options.maxRetries = this.options.maxRetries || $YB.AjaxRequest.options.maxRetries;

        if (!this.options.retryAfter) {
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
    requestHeader: {},
    maxRetries: 5,
    retryAfter: 5000
};

/** The complete url of the request. */
$YB.AjaxRequest.prototype.getUrl = function() {
    try {
        if (this.params) {
            return this.host + this.service + "?" + this.params;
        } else {
            return this.host + this.service;
        }
    } catch (err) {
        $YB.error(err);
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

        var that = this;
        if (typeof callback == "function") {
            this.xmlHttp.onreadystatechange = function() {
                if (that.xmlHttp.readyState == 4) {
                    callback();
                }
            };
        } else if (typeof callback != "undefined") {
            $YB.warning("Warning: Request '" + that.getUrl() + "' has a callback that is not a function.");
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
 * Appends some text at the end of the request URL.
 * @param {string} text Text to be appended. Skip the first ?, they will be added automatically. ie: 'username=user&system=nicetv'.
 * @return Returns self.
 */
$YB.AjaxRequest.prototype.append = function(text) {
    if (this.params.length > 0) {
        text = "&" + text;
    }

    this.params += text;
    return this;
};

/**
 * Send the request.
 *
 * @return returns XMLHttpRequest.send().
 */
$YB.AjaxRequest.prototype.send = function() {
    try {
        this.xmlHttp.open(this.options.method, this.getUrl(), false);

        if (this.options.requestHeader) {
            for (var key in this.options.requestHeader) {
                if (this.options.hasOwnProperty(key)) {
                    this.xmlHttp.setRequestHeader(key, this.options.requestHeader[key]);
                }
            }
        }

        if (!this.hasError && this.options.retryAfter > 0) {
            var that = this;
            this.error(function genericError() {
                that.retries++;
                if (that.retries > that.options.maxRetries) {
                    $YB.error("Error: Aborting failed request. Max retries reached.");
                } else {
                    $YB.error("Error: Request failed. Retry " + that.retries + " of " + that.options.maxRetries + " in " + that.options.retryAfter + "ms.");

                    atv.setTimeout(function() {
                        that.xmlHttp.removeEventListener("error", genericError);
                        that.send();
                    }, that.options.retryAfter);
                }
            });
        }

        this.xmlHttp.send();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Creates XMLHttpRequest if it is available in the browser.
 * If not, it creates an ActiveXObject XMLHTTP item.
 *
 * @return AJAX handler.
 */
$YB.AjaxRequest.prototype.createXMLHttpRequest = function() {
    try {
        if (typeof XMLHttpRequest != "undefined") {
            //Firefox, Opera, IE7, and other browsers will use the native object
            return new XMLHttpRequest();
        } else {
            //IE 5 and 6 will use the ActiveX control
            return new ActiveXObject("Microsoft.XMLHTTP");
        }
    } catch (err) {
        $YB.error(err);
        return {};
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
 * @param {$YB.Api} context The context from where it was called.
 * @param {Object} [options] Object with custom options.
 * @param {number} [options.interval=800] How many ms between checks.
 * @param {number} [options.threshold=400] The ammount of ms accepted without calling a buffer (Minibuffer).
 * @param {boolean} [options.skipMiniBuffer=true] Skip the minibuffers.
 *
 * @prop {$YB.Chrono} chrono Chrono instance.
 */
$YB.Buffer = function(context, options) {
    try {
        this.context = context;

        this.chrono = new $YB.Chrono();

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
$YB.Buffer.prototype.start = function() {
    try {
        if (this.timer === null) {
            if (typeof this.context.getPlayhead == "function") {
                var that = this;
                this.lastPlayhead = 0;
                this.chrono.start();
                this.timer = atv.setInterval(function() {
                    try {
                        that._checkBuffer();
                    } catch (err) {
                        $YB.error(err);
                    }
                }, this.options.interval);
            } else {
                $YB.warning("Warning: Can't start autobuffer because context does not implement getPlayhead().");
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
$YB.Buffer.prototype._checkBuffer = function() {
    try {
        if (this.context.isJoinSent && !this.context.isPaused && !this.context.isSeeking) {
            var currentPlayhead = this.context.getPlayhead();

            if (Math.abs((this.lastPlayhead * 1000) - (currentPlayhead * 1000)) > this.options.threshold) { // Video is playing

                this.lastPlayhead = currentPlayhead;
                if (!this.options.skipMiniBuffer || this.chrono.stop() > (this.options.interval * 1.1)) {
                    this.context.handleBufferEnd();
                }

            } else if (this.lastPlayhead && !this.context.isBuffering && Math.abs((this.lastPlayhead * 1000) - (currentPlayhead * 1000)) < this.options.threshold) { // Video is buffering

                this.context.handleBufferStart();

            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Stops the autobuffer
 */
$YB.Buffer.prototype.stop = function() {
    try {
        atv.clearInterval(this.timer);
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
$YB.Chrono = function() {
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
$YB.Chrono.prototype.getDeltaTime = function() {
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
$YB.Chrono.prototype.start = function() {
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
$YB.Chrono.prototype.stop = function() {
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
$YB.Chrono.prototype.isStoped = function() {
    try {
        return (this.lastTime !== 0);
    } catch (err) {
        $YB.error(err);
        return false;
    }
};
/**
 * @license
 * Youbora Communication
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Youbora Communication implements the last abstraction layer against NQS requests.
 * Internally, Communication implements an array of $YB.AjaxRequest objects, executing one after another.
 * All requests will be blocked until a first /data call is made, before that, any request sent will be queued.
 *
 * @class
 * @memberof $YB
 * @param {$YB.Api} context The context from where it was called.
 */
$YB.Communication = function(context) {
    try {
        /** Reference to the {@link $YB.Api|context} from where it was called. */
        this.context = context;

        /** The host of the requests. Got from {@link $YB.Data|this.context.data.service}. */
        this.host = context.data.service;

        /** Time between pings defined by FastData. In seconds. */
        this.pingTime = 5;

        /** Communication code from the FastData request.*/
        this.code = '';

        /** Number of the view. Every /start call will add 1 to that number. Starts at -1 (first view will be 0). */
        this.view = -1;

        this._lastDurationSent = 0; // Save the last duration so it will be sent only once.
        this._requests = {}; // Queue of requests, indexed by view code. Format: {U_code_0: [request1, request2], U_code_1: []}
        this._preloaders = []; // Array of strings, only when the array is empty the request Queues will begin sending.

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
        return this.code + '_' + this.view;
    } else {
        return 'nocode';
    }
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
$YB.Communication.prototype.sendData = function(params, callback) {
    try {
        params = params || {};
        delete params.code;
        var that = this,
            ajax = new $YB.AjaxRequest(this._parseServiceHost(this.host), '/data', this._parseParams(params));

        ajax.load(function() {
            that.receiveData(ajax);
            callback();
        });
        ajax.send();

        $YB.noticeRequest("Request: NQS /data " + params.system);
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Callback function to parse '/data' response.
 */
$YB.Communication.prototype.receiveData = function(ajax) {
    try {
        var response = ajax.xmlHttp.responseXML.rootElement,
            vars = {
                h: response.getElementsByName('h'), // Host
                c: response.getElementsByName('c'), // Code
                pt: response.getElementsByName('pt'), // Ping time interval in seconds
                b: response.getElementsByName('b') // 1 = Balancer enabled
            };

        if (vars.h.length > 0 &&
            vars.c.length > 0 &&
            vars.pt.length > 0 &&
            vars.b.length > 0
        ) {
            this.code = vars.c[0].textContent;
            this.host = vars.h[0].textContent;
            this.pingTime = vars.pt[0].textContent;
            this.balancerEnabled = vars.b[0].textContent;

            $YB.noticeRequest('FastData \'' + this.code + '\'is ready.');

            // Move requests from 'nocode' to the proper queue
            if (this._requests['nocode'] && this._requests['nocode'].length > 0) {
                this._requests[this.getViewCode()] = [];
                this._requests[this.getViewCode()] = this._requests['nocode'];
                delete this._requests['nocode'];
            }

            // Everything is ok, start sending requests
            this.removePreloader('FastData');
        } else {
            $YB.warning('Warning: FastData response is wrong.');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/start' request.
 *
 * @param {Object} params An object of parameters sent with the request.
 * @param {string} params.system system code
 * @param {string} params.pluginVersion 3.x.x-<pluginName>
 * @param {string} [params.user] username.
 * @param {string} params.resource resource filename
 * @param {string} [params.transcode] Transaction code.
 * @param {boolean} [params.live] boolean or string 'true'/'false'. false by default
 * @param {string} [params.title] Title of the video.
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
$YB.Communication.prototype.sendStart = function(params, callback) {
    try {
        this.view++;

        params = params || {};
        delete params.code;
        params.totalBytes = [params.totalBytes, 0];
        params.pingTime = [params.pingTime, this.pingTime];
        params.properties = [params.properties, {}];
        params.pingTime = [params.pingTime, this.pingTime];
        params.live = [params.live, false];
        this.checkMandatoryParams(params, ['system', 'pluginVersion', 'user', 'resource']);


        this.sendRequest('/start', params, callback);

        // Save lastDuration to sent it only once
        this._lastDurationSent = params.duration;

        $YB.noticeRequest("Request: NQS /start " + params.resource);
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/joinTime' request.
 *
 * @param {Object} params An object of parameters sent with the request.
 * @param {number} params.time time lapse between start and when the video starts playing (miliseconds)
 * @param {number} [params.eventTime] video curent position / playhead (seconds)
 * @param {number} [params.mediaDuration] Total duration of the video in seconds.
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.Communication.prototype.sendJoin = function(params, callback) {
    try {
        params = params || {};
        delete params.code;
        this.checkMandatoryParams(params, ['time']);

        // Consolidate and check
        params.mediaDuration = $YB.util.getFirstDefined(params.mediaDuration);
        if (params.mediaDuration === this._lastDurationSent) {
            delete params.mediaDuration;
        }

        this.sendRequest('/joinTime', params, callback);

        $YB.noticeRequest("Request: NQS /joinTime " + params.time + "ms");
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
$YB.Communication.prototype.sendStop = function(params, callback) {
    try {
        params = params || {};
        delete params.code;

        this.sendRequest('/stop', params, callback);

        $YB.noticeRequest("Request: NQS /stop");
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
$YB.Communication.prototype.sendPause = function(params, callback) {
    try {
        params = params || {};
        delete params.code;

        this.sendRequest('/pause', params, callback);

        $YB.noticeRequest("Request: NQS /pause");
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
$YB.Communication.prototype.sendResume = function(params, callback) {
    try {
        params = params || {};
        delete params.code;

        this.sendRequest('/resume', params, callback);

        $YB.noticeRequest("Request: NQS /resume");
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
$YB.Communication.prototype.sendBuffer = function(params, callback) {
    try {
        params = params || {};
        delete params.code;
        this.checkMandatoryParams(params, ['time', 'duration']);

        this.sendRequest('/bufferUnderrun', params, callback);

        $YB.noticeRequest("Request: NQS /bufferUnderrun " + params.duration + "ms");
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
 * @param {number} [params.totalBytes] Flash players total bytes, 0 otherwise.
 * @param {number} [params.dataType] 0 fot HTTP, 1 for RTMP(Flash). Not needed if bitrate is specified.
 * @param {string} [params.nodeHost] NodeHost (string).
 * @param {number} [params.nodeType] NodeType (int).
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.Communication.prototype.sendPing = function(params, callback) {
    try {
        params = params || {};
        delete params.code;
        params.totalBytes = [params.totalBytes, 0];
        params.pingTime = [params.pingTime, this.pingTime];
        this.checkMandatoryParams(params, ['time']);

        this.sendRequest('/ping', params, callback);
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
 * @param {string} [params.player] PlayerName.
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
$YB.Communication.prototype.sendError = function(params, callback) {
    try {
        params = params || {};
        delete params.code;
        params.msg = [params.msg, 'Unknown Error'];
        if (typeof params.errorCode == 'undefined' || parseInt(params.errorCode) < 0) {
            params.errorCode = 9000;
        }

        this.checkMandatoryParams(params, ['msg', 'errorCode', 'player']);

        this.sendRequest('/error', params, callback);

        $YB.noticeRequest("Request: NQS /error " + params.msg);
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
$YB.Communication.prototype.sendSeek = function(params, callback) {
    try {
        params = params || {};
        delete params.code;
        this.checkMandatoryParams(params, ['time', 'duration']);

        this.sendRequest('/seek', params, callback);

        $YB.noticeRequest("Request: NQS /seek " + params.duration + "ms");
    } catch (err) {
        $YB.error(err);
    }
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
$YB.Communication.prototype.sendAdStart = function(params, callback) {
    try {
        params = params || {};
        delete params.code;
        this.checkMandatoryParams(params, ['position', 'number', 'playhead', 'campaign']);

        this.sendRequest('/adStart', params, callback);

        $YB.noticeRequest("Request: NQS /adStart " + params.position + params.number);
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
$YB.Communication.prototype.sendAdJoin = function(params, callback) {
    try {
        params = params || {};
        delete params.code;
        this.checkMandatoryParams(params, ['adPlayhead', 'duration']);

        this.sendRequest('/adJoinTime', params, callback);

        $YB.noticeRequest("Request: NQS /adJoinTime " + params.duration + "ms");
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
$YB.Communication.prototype.sendAdStop = function(params, callback) {
    try {
        params = params || {};
        delete params.code;
        this.checkMandatoryParams(params, ['adPlayhead', 'totalDuration']);

        this.sendRequest('/adStop', params, callback);

        $YB.noticeRequest("Request: NQS /adStop " + params.totalDuration + "ms");
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
$YB.Communication.prototype.sendAdBuffer = function(params, callback) {
    try {
        params = params || {};
        delete params.code;
        this.checkMandatoryParams(params, ['adPlayhead', 'totalDuration']);

        this.sendRequest('/adBufferUnderrun', params, callback);

        $YB.noticeRequest("Request: NQS /bufferUnderrun " + params.duration + "ms");
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
            var ajax = new $YB.AjaxRequest('', service, this._parseParams(params));
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
        var ajax = new $YB.AjaxRequest(this._parseServiceHost(service), '', this._parseParams(params));
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
    return (this.context.data.enableAnalytics && !(srv in this.context.data.disabledRequests));
}

/**
 * Adds a preloader to the queue. While this queue is not empty, all requests will be stoped.
 * Remember to call removePreloader to unblock the main queue
 *
 * @param {string} key Unique identifier of the blocker. ie: 'CDNParser'.
 */
$YB.Communication.prototype.addPreloader = function(key) {
    try {
        this._preloaders.push(key);
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
        var pos = this._preloaders.indexOf(key);
        if (pos !== -1) {
            this._preloaders.splice(pos, 1);

            this._sendRequests();
        } else {
            $YB.warning('Warning: trying to remove unexisting preloader \'' + key + '\'.');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Check if the mandatory params are in the params object, it they aren't, throws a warning.
 * This function will only work with $YB.errorLevel of 2 or higher.
 *
 * @param {object} params Object of params.
 * @param {string[]} mandatory An array with param names to be checked. ie: ['system', 'code'...].
 * @returns {?boolean} Return true if all the mandatory params are in. Returns false otherwise. Returns null if {@link $YB.errorLevel} is lower than 2.
 */
$YB.Communication.prototype.checkMandatoryParams = function(params, mandatory) {
    try {
        if ($YB.errorLevel >= 2) {
            var i = mandatory.length,
                allOk = true;
            while (i--) {
                if (!(mandatory[i] in params)) {
                    allOk = false;
                    $YB.warning('Warning: Missing mandatory parameter \'' + mandatory[i] + '\' in the request.');
                }
            }

            return allOk;
        } else {
            return null;
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

        request.append('timemark=' + new Date().getTime());

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
        if (this._preloaders.length === 0) { // if data has been retreived and there is no preloader blocking the queue...
            for (var k in this._requests) {
                if (this._requests.hasOwnProperty(k)) {
                    while (this._requests[k].length > 0) {
                        var ajax = this._requests[k].shift();

                        ajax.append('code=' + k); //if no code, use last
                        if (!ajax.host) {
                            ajax.host = this._parseServiceHost(this.host);
                        }

                        ajax.send();
                    }
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

        if (this.context.data.httpSecure === true) {
            url = 'https://' + url;
        } else if (this.context.data.httpSecure === false) {
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
 * Will transform an object of params into a url string.
 *
 * @private
 * @param params An object with the params of the call.
 * @return Return the param chunk. ie: system=nicetv&user=user.
 */
$YB.Communication.prototype._parseParams = function(params) {
    try {
        if (typeof params === 'string') {
            return params;
        } else if (params !== null && typeof params == 'object') {
            var url = '';
            for (var key in params) {
                params[key] = $YB.util.getFirstDefined(params[key]);
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
 * Youbora ConcurrencyService
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Youbora ConcurrencyService will automatically prevent concurrent connections with the same username.
 *
 * @class
 * @memberof $YB
 * @param {$YB.Api} context The YAPI item where it was initialized.
 * @param {number} [interval=10000] The time between checks in ms.
 */
$YB.ConcurrencyService = function(context, interval) {
    try {
        this.context = context;
        this.interval = interval || 10000;
        this.timer = null;

        this.sessionId = Math.random();

        this.data = this.context.data; // Save reference
        this.config = this.context.data.concurrencyConfig; // Save reference

        this._init();
    } catch (err) {
        $YB.error(err);
    }
};

$YB.ConcurrencyService.prototype._init = function() {
    try {
        var that = this;
        this.timer = atv.setInterval(function() {
            that._checkConcurrency();
        }, this.interval);
    } catch (err) {
        $YB.error(err);
    }
};

$YB.ConcurrencyService.prototype._checkConcurrency = function() {
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

        var that = this;
        this.context.comm.sendService(this.config.service, options, function(httpEvent) {
            if (httpEvent.response === "1") {
                // Concurrency collision, kick user.
                that.context.handleError({
                    errorCode: 14000,
                    msg: "CC_KICK"
                });

                if (typeof that.config.redirect == "function") {
                    that.config.redirect();
                } else {
                    window.location = that.config.redirect;
                }
            } else if (httpEvent.response === "0") {
                // Concurrency ok...
            } else {
                // Concurrency disabled, stop service.
                atv.clearInterval(that.timer);
            }
        });

    } catch (err) {
        $YB.error(err);
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
 *
 * @prop {boolean} [enableAnalytics=true] Defines if the plugin should send NQS requests.
 * @prop {array} [disabledRequests=[]] Services inside this array will not be sent. ie: ['/seek', '/adStart'...].
 * @prop {boolean} [trackSeekEvent=true] Defines if the plugin should track seeks.
 * @prop {boolean} [parseHLS=false] If true, the plugin will parse HLS files to use the first .ts file found as resource. It might slow performance down.
 * @prop {boolean} [parseCDNNodeHost=false] If true, the plugin will query the CDN to retrieve the node name. It might slow performance down.
 * @prop {boolean} [hashTitle=true] This boolean parameter is an anti-resource collision system.
 * @prop {boolean} [httpSecure] Define the security of NQS calls. If true, it will use 'https://'; If false, it will use 'http://'; if undefined, it will use '//'.
 * @prop {boolean} [enableNiceBuffer=true] If true, the plugin will try to inform about bufferUnderrun based on the playhead of the video (only if player does not natively inform about buffers).
 * @prop {string} [accountCode=demosite] NicePeopleAtWork account code that indicates the customer account.
 * @prop {string} [service=nqs.nice264.com] Host of the NQS FastData service.
 * @prop {string} [username] User ID value inside your system.
 * @prop {string} [transactionCode] Custom code to identify the view.
 * @prop {number} [isBalanced=0] Set to 1 if the content was previously balanced.
 * @prop {Object} [network] Item containing network info.
 * @prop {string} [network.cdn] Codename of the CDN where the content is streaming from. ie: AKAMAI
 * @prop {string} [network.ip] IP of the viewer/user. ie: '100.100.100.100'
 * @prop {string} [network.isp] Name of the internet service provider of the viewer/user.
 * @prop {Object} [media] Item containing media info.
 * @prop {boolean} [media.isLive] True if the content is live, false if VOD. When undefined, the player will try to retrieve it from the video.
 * @prop {string} [media.resource=""] URL/path of the current media resource.
 * @prop {string} [media.title=""] Title of the media. Will override properties.content_metadata.title.
 * @prop {Object} [properties] Metadata properties of the media.
 * @prop {Object} [extraParams] An object of extra parameters set by the customer.
 * @prop {string} [extraParams.param1] Custom parameter 1.
 * @prop {string} [extraParams.param2] Custom parameter 2.
 * @prop {string} [extraParams.param3] Custom parameter 3.
 * @prop {string} [extraParams.param4] Custom parameter 4.
 * @prop {string} [extraParams.param5] Custom parameter 5.
 * @prop {string} [extraParams.param6] Custom parameter 6.
 * @prop {string} [extraParams.param7] Custom parameter 7.
 * @prop {string} [extraParams.param8] Custom parameter 8.
 * @prop {string} [extraParams.param9] Custom parameter 9.
 * @prop {string} [extraParams.param10] Custom parameter 10.
 * @prop {Object} [concurrencyConfig] Config concurrency service.
 * @prop {boolean} [concurrencyConfig.enabled=false] Enables the service.
 * @prop {string} [concurrencyConfig.contentId=""] It identifies the content (or content section) that is being played.
 * @prop {number} [concurrencyConfig.maxConcurrents=1] It defines the maximum number of concurrent users connected to that asset.
 * @prop {string} [concurrencyConfig.service=pc.youbora.com/cping] Host of the CPing service.
 * @prop {(string|function)} [concurrencyConfig.redirect=http://google.com] Either a callback function when concurrency occurs or a string with an url to redirect the user.
 * @prop {boolean} [concurrencyConfig.ipMode=false] This Boolean defines whether the concurrency control works by session or by IP.
 * @prop {Object} [resumeConfig] Config resume service.
 * @prop {boolean} [resumeConfig.enabled=false] Enables the service.
 * @prop {string} [resumeConfig.contentId=""] It identifies the content (or content section) that is being played.
 * @prop {string} [resumeConfig.service=pc.youbora.com/resume] Host of the Resume service.
 * @prop {string} [resumeConfig.playTimeService=pc.youbora.com/playTime] Host of the PlayTime service.
 * @prop {function} [resumeConfig.callback] Function callback when resume occurs.
 * @prop {Object} [smartswitchConfig] Config concurrency service.
 * @prop {boolean} [smartswitchConfig.enabled=false] Enables the service.
 * @prop {string} [smartswitchConfig.type=balance] Defines the type of the balance.
 * @prop {string} [smartswitchConfig.service=smartswitch.youbora.com] Host of the SmartSwitch service.
 * @prop {string} [smartswitchConfig.zoneCode=""] Defines the area where your smart switching rules apply.
 * @prop {string} [smartswitchConfig.originCode=""] It is the origin code configured in Account Settings.
 * @prop {string} [smartswitchConfig.niceNVA=""] "Not Valid After" parameter.
 * @prop {string} [smartswitchConfig.niceNVB=""] "Not Valid Before" parameter.
 * @prop {string} [smartswitchConfig.token=""] Authentication token for the petition generated with an md5 algorithm applied to the following string chain (appended): md5(system + zoneCode + originCode + filePath + nva + nvb + secretKey)
 */
$YB.Data = function(options) { // constructor
    try {
        this.setOptions(options);
    } catch (err) {
        $YB.error(err);
    }
};

$YB.Data.prototype = {
    // options
    enableAnalytics: true,
    disabledRequests: [],
    parseHLS: false,
    parseCDNNodeHost: false,
    hashTitle: true,
    httpSecure: undefined,
    enableNiceBuffer: true,

    // Main properties
    accountCode: "demosite",
    service: "nqs.nice264.com",
    username: undefined,
    transactionCode: undefined,
    isBalanced: 0,

    // params defined
    network: {
        cdn: undefined,
        ip: undefined,
        isp: undefined
    },

    // Media Info
    media: {
        isLive: undefined,
        resource: undefined,
        title: undefined,
        duration: undefined
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
    properties: {
        filename: undefined,
        content_id: undefined,
        content_metadata: {
            title: undefined,
            genre: undefined,
            language: undefined,
            year: undefined,
            cast: undefined,
            director: undefined,
            owner: undefined,
            duration: undefined,
            parental: undefined,
            price: undefined,
            rating: undefined,
            audioType: undefined,
            audioChannels: undefined
        },
        transaction_type: undefined,
        quality: undefined,
        content_type: undefined,
        device: {
            manufacturer: undefined,
            type: undefined,
            year: undefined,
            firmware: undefined
        }
    },

    //extraparams
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
    concurrencyConfig: {
        enabled: false,
        contentId: "",
        maxConcurrents: 1,
        service: "pc.youbora.com/cping",
        redirect: "http://www.google.com",
        ipMode: false
    },

    //resume
    resumeConfig: {
        enabled: false,
        contentId: "",
        service: "pc.youbora.com/resume",
        playTimeService: "pc.youbora.com/playTime",
        callback: function(time) {
            console.log("ResumeService Callback: Seek to second " + time);
        }
    },

    //balancer
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
 * Youbora Pinger
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Instances of this class will call a callback every setted interval.
 *
 * @class
 * @memberof $YB
 * @param {$YB.Api} context The context from where it was called.
 * @param {function} callback The callback function called each interval. The first parameter will be the time_since_last_ping'.
 * @param {number} [interval=5000] The interval in ms.
 */
$YB.Pinger = function(context, callback, interval) {
    try {
        this.time = 0;
        this.context = context;
        this.interval = interval || 5000;
        this.isRunning = false;
        this.callback = callback;
        this.timer = null;
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Returns the time since last ping.
 */
$YB.Pinger.prototype.getDeltaTime = function() {
    if (this.time) {
        return new Date().getTime() - this.time;
    } else {
        return -1;
    }
};

/**
 * Starts the timer.
 */
$YB.Pinger.prototype.start = function() {
    try {
        this.isRunning = true;
        this._setPing();

        $YB.noticeRequest("Sending pings every " + this.interval + "ms.");
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Stops the timer.
 */
$YB.Pinger.prototype.stop = function() {
    try {
        this.isRunning = false;
        atv.clearTimeout(this.timer);
    } catch (err) {
        $YB.error(err);
    }
};

$YB.Pinger.prototype._setPing = function() {
    try {
        if (this.isRunning) {
            var that = this;
            this.time = new Date().getTime();
            this.timer = atv.setTimeout(function() {
                that._ping(that);
            }, this.interval);

        }
    } catch (err) {
        $YB.error(err);
    }
};

$YB.Pinger.prototype._ping = function(that) {
    try {
        if (that.isRunning) {
            if (typeof that.callback == "function") {
                that.callback(this.getDeltaTime());
            }
            that._setPing();
        }
    } catch (err) {
        $YB.error(err);
    }
};
/**
 * @license
 * Youbora ResourceParser
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */


/**
 * Youbora ResourceParser will parse the precise CDN of the resource if data.parseHLS or data.parseCDNNodeHost are true.
 * CDNs will be parsed in the order defined in {@link $YB.ResourceParser.cdnsAvailable}, modify that list to modify order.
 *
 * @class
 * @memberof $YB
 * @param {$YB.Api} context The context from where it was called.
 */
$YB.ResourceParser = function(context) {
    try {
        this.context = context;

        this.parseTimeout = null;

        this.cdns = [];

        /** Final resource parsed.
         * @var {string}
         * @readonly
         */
        this.realResource = '';

        /** Node Host name after parsing it.
         * @var {string}
         * @readonly
         */
        this.cdnHost = '';

        /** Node Host type after parsing it.
         * @var {string}
         * @readonly
         */
        this.cdnTypeString = '';

        /** Code of the Node Host type after parsing it.
         * @var {number}
         * @readonly
         */
        this.cdnType = 0;

        this._init();
    } catch (err) {
        $YB.error(err);
    }
};

/** List of CDNs to be parsed in order of execution */
$YB.ResourceParser.cdnsAvailable = ['Level3', 'Akamai'];

$YB.ResourceParser.prototype._init = function() {
    try {
        this.context.comm.addPreloader('ResourceParser');

        var that = this;
        this.parseTimeout = atv.setTimeout(function() {
            // Abort operation after 3s
            that.realResource = that.context.getResource();
            that.context.comm.removePreloader('ResourceParser');
            $YB.info('ResourceParser has exceded the maximum execution time (3s) and it will be aborted.');
        }, 3000);

        if (this.context.data.parseHLS) {
            this.getRealResource(this.context.getResource());
        } else {
            this.realResource = this.context.getResource();
            this.getNextNode();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Parses resource, if it is an HLS .m3u8 file, it recursively parses its info until .ts or .mp4 is found.
 *
 * @private
 * @param {string} resource path to the resource.
 */
$YB.ResourceParser.prototype.getRealResource = function(resource) {
    try {
        var extension = resource.slice(resource.lastIndexOf('.'));

        if (extension == '.m3u8') {
            var parentURL = resource.slice(0, resource.lastIndexOf('/'));

            var that = this;
            new $YB.AjaxRequest(resource).load(function(ajax) {
                var matches = /(.*(\.m3u8|\.ts|\.mp4))/i.exec(ajax.responseText); //get first line ending in .m3u8, .mp4 or .ts

                if (matches !== null) {
                    if (matches[1].indexOf('http') !== 0)
                        matches[1] = parentURL + '/' + matches[1];

                    if (matches[2] == '.ts' || matches[2] == '.mp4') { //if .ts or .mp4
                        that.realResource = matches[1];
                        that.getNextNode();
                    } else { // if it is .m3u8
                        that.getRealResource(matches[1]);
                    }
                } else {
                    that.realResource = resource;
                    that.getNextNode();
                }
            }).error(function() {
                that.getNextNode();
            }).send();
        } else {
            this.realResource = resource;
            this.getNextNode();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Parses the CDN Node Host
 * @private
 */
$YB.ResourceParser.prototype.getNextNode = function() {
    try {
        if (this.context.data.parseCDNNodeHost) {
            this.cdns = $YB.ResourceParser.cdnsAvailable;

            if (this.cdns.length > 0 && !this.cdnHost) {
                var cdn = this.cdns.shift();
                if (typeof this['parseCDN' + cdn] == 'function') {
                    this['parseCDN' + cdn]();
                } else {
                    this.getNextNode();
                }
            } else {
                this.context.comm.removePreloader('ResourceParser');
            }
        } else {
            this.context.comm.removePreloader('ResourceParser');
        }
    } catch (err) {
        $YB.error(err);
    }
};

$YB.ResourceParser.prototype.parseCDNLevel3 = function() {
    try {
        var that = this;
        new $YB.AjaxRequest(this.realResource, '', '', {
            method: 'HEAD',
            requestHeader: {
                'X-WR-DIAG': 'host'
            }
        }).load(function(httpEvent) {
            var matches = null;
            try {
                matches = /Host:(.+)\sType:(.+)/.exec(httpEvent.getAllResponseHeaders('X-WR-DIAG'));
            } catch (e) {
                that.getNextNode();
            }

            if (matches !== null) {
                that.cdnHost = matches[1];
                that.cdnTypeString = matches[2];
                that.parseHeader();
            }

            that.getNextNode();
        }).error(function() {
            that.getNextNode();
        }).send();
    } catch (err) {
        $YB.error(err);
    }
};

$YB.ResourceParser.prototype.parseCDNAkamai = function() {
    try {
        //TO-DO: Needs exhaustive testing
        var that = this;
        new $YB.AjaxRequest(this.realResource, '', '', {
            method: 'HEAD'
        }).load(function(httpEvent) {
            var matches = null;
            try {
                matches = /(.+)\sfrom\s.+\(.+\/(.+)\).+/.exec(httpEvent.getResponseHeader('X-Cache'));
            } catch (e) {
                that.getNextNode();
            }

            if (matches !== null) {
                that.cdnHost = matches[1];
                that.cdnTypeString = matches[2];
                that.parseHeader();
            }

            that.getNextNode();
        }).error(function() {
            that.getNextNode();
        }).send();
    } catch (err) {
        $YB.error(err);
    }
};

$YB.ResourceParser.prototype.parseHeader = function() {
    try {
        switch (this.cdnTypeString) {
            case 'TCP_HIT':
                this.cdnType = 1;
                break;
            case 'TCP_MISS':
                this.cdnType = 2;
                break;
            case 'TCP_MEM_HIT':
                this.cdnType = 3;
                break;
            case 'TCP_IMS_HIT':
                this.cdnType = 4;
                break;
            default:
                this.cdnType = 0;
                break;
        }

        $YB.notice('CDN Node Host: ' + this.cdnHost + ' Type: ' + this.cdnTypeString);
    } catch (err) {
        $YB.error(err);
    }
};
/**
 * @license
 * Youbora ResumeService
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Youbora Resume Service will automatically generate a seek if the player view is closed and resumed.
 *
 * @class
 * @memberof $YB
 * @param {$YB.Api } context The context from where it was called.
 */
$YB.ResumeService = function(context) {
    try {
        this.context = context;
        this.timer = null;
        this.isResumed = 0;

        this.data = this.context.data; // Save reference
        this.config = this.context.data.resumeConfig; // Save reference

        this._check();
    } catch (err) {
        $YB.error(err);
    }
};

$YB.ResumeService.prototype._check = function() {
    try {
        if (this.config.enabled && typeof this.config.contentId != "undefined" && typeof this.data.username != "undefined") {

            var that = this;
            this.context.comm.sendService(this.config.service, {
                contentId: this.config.contentId,
                userId: this.data.username
            }, function(httpEvent) {
                if (httpEvent.response > 0) {
                    that.isResumed = 1;
                    if (typeof that.config.callback == "function") {
                        that.config.callback(httpEvent.response);
                    } else {
                        $YB.warning("ResumeService callback is not a function");
                    }
                } else if (httpEvent.response === "0") {
                    // Resume ok...
                } else {
                    // Resume disabled, stop service.
                    that.stop();
                }
            });

            $YB.noticeRequest("Request: ResumeService check " + this.config.contentId);
        } else {
            this.stop();
        }
    } catch (err) {
        $YB.error(err);
    }
};

$YB.ResumeService.prototype._sendPlayTime = function() {
    try {
        if (this.config.enabled && typeof this.config.contentId != "undefined" && typeof this.data.username != "undefined") {
            this.context.comm.sendService(this.config.playTimeService, {
                contentId: this.config.contentId,
                userId: this.data.username,
                playTime: this.context.getPlayhead()
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
$YB.ResumeService.prototype.start = function(interval) {
    try {
        interval = interval || 6000;

        this._sendPlayTime();

        var that = this;
        this.timer = atv.setInterval(function() {
            that._sendPlayTime();
        }, interval);
    } catch (err) {
        $YB.error(err);
    }
};

/** Stops sending playtimes */
$YB.ResumeService.prototype.stop = function() {
    try {
        atv.clearInterval(this.timer);
    } catch (err) {
        $YB.error(err);
    }
};
/**
 * @license
 * Youbora SmartswitchService
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Youbora ConcurrencyService will automatically prevent concurrent connections with the same username.
 *
 * @class
 * @memberof $YB
 * @param {$YB.Api} context The context from where it was called.
 */
$YB.SmartswitchService = function(context) {
    try {
        this.context = context;
        this.callback = function() {};

        this.data = this.context.data; // Save reference
        this.config = this.context.data.smartswitchConfig; // Save reference

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
$YB.SmartswitchService.prototype.getBalancedUrls = function(url, callback) {
    try {
        this.callback = callback;
        if (this.config.enabled) {

            var that = this;
            this.context.comm.sendService(this.config.service, {
                resource: url,
                systemcode: this.data.accountCode,
                zonecode: this.config.zoneCode,
                session: this.context.comm.getViewCode(),
                origincode: this.config.originCode,
                niceNva: this.config.niceNVA,
                niceNvb: this.config.niceNVB,
                live: this.context.getIsLive(),
                token: this.config.token,
                type: this.config.type
            }, function(xhr) {
                var response;
                try {
                    response = JSON.parse(xhr.response);
                } catch (e) {
                    $YB.warning("Smartswitch said: '" + xhr.response + "'");
                }
                if (response) {
                    that.data.isBalanced = 1;
                    that.callback(response);
                } else {
                    that.callback(false);
                }
            });

            $YB.noticeRequest("Request: Smartswitch " + url);
        } else {
            this.callback(false);
        }
    } catch (err) {
        $YB.error(err);
    }
};
/**
 * @license
 * Youbora API
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/** Youbora API implements the first abstaction layer that iterates with the SmartPlugin.
 * Internally, it coordinates a number of inner components like Communications, Chrono, ResourceParser, Resumer, ConcurrencyChecker...
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

        /** The instance of SmartPlugin object interacting with this. */
        this.plugin = plugin;

        /** The unique identifier of the player, usually asociated with the ID tag of the DOM. */
        this.playerId = playerId;

        /** The initial options passed to the object. */
        this.initialOptions = options;

        /** Instance of {$YB.Data}. It will retrieve it from {$YB.DataMap} using the PlayerId. */
        this.data = $YB.datamap.get(this.playerId); // Save reference
        this.data.setOptions(options);

        // Instantiate lib objects
        var that = this;

        /** An instance of {@link $YB.Pinger}. */
        this.pinger = new $YB.Pinger(this, function(delta) {
            that.handlePing({
                diffTime: delta
            });
        });

        /** An instance of {@link $YB.Buffer}. */
        this.buffer = new $YB.Buffer(this);

        /** An object with multiples instances of {@link $YB.Chrono}.
         * @prop {$YB.Chrono} seek Chrono for seeks.
         * @prop {$YB.Chrono} pause Chrono for pauses.
         * @prop {$YB.Chrono} joinTime Chrono between start and joinTime.
         * @prop {$YB.Chrono} buffer Reference to this.buffer.chrono
         */
        this.chrono = {
            seek: new $YB.Chrono(),
            pause: new $YB.Chrono(),
            joinTime: new $YB.Chrono(),
            buffer: this.buffer.chrono
        };
        this.ads = new $YB.AdnalyzerApi(this);

        /** An instance of {@link $YB.Communication}. */
        this.comm = new $YB.Communication(this);

        this._init();
    } catch (err) {
        $YB.error(err);
    }
};

$YB.Api.prototype = {
    /** An instance of {@link $YB.ResourceParser}. */
    resourceParser: null,
    /** An instance of {@link $YB.ConcurrencyService}. */
    concurrency: null,
    /** An instance of {@link $YB.ResumeService}. */
    resume: null,
    /** An instance of {@link $YB.SmartswitchService}. */
    smartswitch: null,
    /** An instance of {@link $YB.Adnalizer}. */
    ads: null,
    /** Flag when Start has been sent */
    isStartSent: false,
    /** Flag when Join has been sent */
    isJoinSent: false,
    /** Flag when Player is paused */
    isPaused: false,
    /** Flag when Player is seeking */
    isSeeking: false,
    /** Flag when Player is buffering */
    isBuffering: false,
    /** Last bitrate calculated */
    lastBitrate: 0
};

$YB.Api.prototype._init = function() {
    try {
        var report = "YAPI Modules Loaded: [Communication] ";

        // Handle /data
        var params = {
            system: this.data.accountCode,
            pluginVersion: this.plugin.pluginVersion,
            targetDevice: this.plugin.pluginName,
            live: this.data.media.isLive
        };

        var that = this;
        this.comm.sendData(params, function() {
            that.pinger.interval = that.comm.pingTime * 1000;
        });

        // Parse Resource (HLS & CDN Node Host)
        if (this.data.parseCDNNodeHost || this.data.parseHLS) {

            this.resourceParser = new $YB.ResourceParser(this);
            report += "[ResourceParser] ";
        }

        if (this.data.concurrencyConfig.enabled) {
            this.concurrency = new $YB.ConcurrencyService(this);
            report += "[Concurrency] ";
        }

        if (this.data.resumeConfig.enabled) {
            this.resume = new $YB.ResumeService(this);
            report += "[Resume] ";
        }

        if (this.data.smartswitchConfig.enabled) {
            this.smartswitch = new $YB.SmartswitchService(this);
            report += "[Smartswitch] ";
        }

        $YB.notice(report);
    } catch (err) {
        $YB.error(err);
    }
};

/** Handles start event.
 * @see $YB.Communication#sendStart
 */
$YB.Api.prototype.handleStart = function(params) {
    try {
        if (this.isStartSent) { // If there's a previous view, close it
            this.handleStop();
        }

        this.isStartSent = true;

        this.chrono.joinTime.start();
        this.pinger.start();

        this._consolidateTitle();


        params = params || {};
        params.system = [params.system, this.data.accountCode];
        params.player = [params.player, this.plugin.pluginName];
        params.pluginVersion = [params.pluginVersion, this.plugin.pluginVersion];
        params.playerVersion = [params.playerVersion, this.getPlayerVersion()];
        params.resource = [params.resource, this.getResource()];
        params.duration = [params.duration, this.getMediaDuration()];
        params.live = [params.live, this.getIsLive()];
        params.user = [params.user, this.data.username];
        params.transcode = [params.transcode, this.data.transactionCode];
        params.title = [params.title, this.data.media.title];
        params.properties = [params.properties, this.data.properties];
        params.hashTitle = [params.hashTitle, this.data.hashTitle];
        params.cdn = [params.cdn, this.data.network.cdn];
        params.isp = [params.isp, this.data.network.isp];
        params.ip = [params.ip, this.data.network.ip];
        params.param1 = [params.param1, this.data.extraParams.param1];
        params.param2 = [params.param2, this.data.extraParams.param2];
        params.param3 = [params.param3, this.data.extraParams.param3];
        params.param4 = [params.param4, this.data.extraParams.param4];
        params.param5 = [params.param5, this.data.extraParams.param5];
        params.param6 = [params.param6, this.data.extraParams.param6];
        params.param7 = [params.param7, this.data.extraParams.param7];
        params.param8 = [params.param8, this.data.extraParams.param8];
        params.param9 = [params.param9, this.data.extraParams.param9];
        params.param10 = [params.param10, this.data.extraParams.param10];

        if (this.data.resumeConfig.enabled) { // If Resume service is enabled
            this.resume.start();
            params.isResumed = this.resume.isResumed;
        }

        if (this.data.isBalanced == 1) { // Add isBalanced
            params.isBalanced = 1;
        }

        this.comm.sendStart(params);


    } catch (err) {
        $YB.error(err);
    }
};

/** Handles JoinTime event.
 * @see $YB.Communication#sendJoin
 */
$YB.Api.prototype.handleJoin = function(params) {
    try {
        if (this.isStartSent && !this.isJoinSent) {
            this.isJoinSent = true;

            if (this.buffer.autostart) {
                this.buffer.start();
            }

            params = params || {};
            params.time = [params.time, this.chrono.joinTime.getDeltaTime()];
            params.eventTime = [params.eventTime, this.getPlayhead()];
            params.mediaDuration = [params.mediaDuration, this.getMediaDuration()];

            //Substract preroll time from time
            if (this.ads.totalPrerollTime > 0) {
                params.time = $YB.util.getFirstDefined(params.time) - this.ads.totalPrerollTime;
            }

            this.comm.sendJoin(params);
        }
    } catch (err) {
        $YB.error(err);
    }
};

/** Handles stop event.
 * @see $YB.Communication#sendStop
 */
$YB.Api.prototype.handleStop = function(params) {
    try {
        if (this.isStartSent) {
            this.isStartSent = false;
            this.isPaused = false;
            this.isJoinSent = false;
            this.isSeeking = false;
            this.isBuffering = false;

            this.pinger.stop();
            this.buffer.stop();

            params = params || {};
            params.diffTime = [params.diffTime, this.pinger.getDeltaTime()];

            this.comm.sendStop(params);

            if (this.data.resumeConfig.enabled) { // If Resume service is enabled
                this.resume.sendPlayTime();
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/** Handles a pause event.
 * @see $YB.Communication#sendPause
 */
$YB.Api.prototype.handlePause = function() {
    try {
        if (this.isJoinSent && !this.isPaused && !this.isSeeking && !this.ads.isStartSent) {
            this.isPaused = true;
            this.chrono.pause.start();

            this.comm.sendPause();

            if (this.data.resumeConfig.enabled) { // If Resume service is enabled
                this.resume.sendPlayTime();
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/** Handles resume event.
 * @see $YB.Communication#sendResume
 */
$YB.Api.prototype.handleResume = function() {
    try {
        if (this.isJoinSent && this.isPaused && !this.isSeeking && !this.ads.isStartSent) {
            this.isPaused = false;
            this.chrono.pause.getDeltaTime();
            this.comm.sendResume();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Starts the autobuffer class $YB.Buffer.
 * Do not use this function if you want to calculate the buffers manually, instead call handleBufferStart() and handleBufferEnd() methods.
 */
$YB.Api.prototype.startAutobuffer = function() {
    if (this.data.enableNiceBuffer) { // EnableNiceBuffer has to be true for the autobuffer to run.
        this.buffer.autostart = true;
    }
};

/** Handles buffer Start event. */
$YB.Api.prototype.handleBufferStart = function() {
    try {
        if (this.isJoinSent && !this.isBuffering) {
            this.isBuffering = true;
            this.chrono.buffer.start();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Handles buffer end event.
 * @see $YB.Communication#sendBuffer
 */
$YB.Api.prototype.handleBufferEnd = function(params) {
    try {
        if (this.isJoinSent && this.isBuffering) {

            this.isBuffering = false;

            params = params || {};
            params.duration = [params.duration, this.chrono.buffer.getDeltaTime()];
            params.time = [params.time, this.getPlayhead()];

            if (this.getIsLive() && params.time === 0) {
                params.time = 1; // Buffer does not support 0 in time parameter.
            }

            this.comm.sendBuffer(params);
        }
    } catch (err) {
        $YB.error(err);
    }
};

/** Handles player error event.
 * @see $YB.Communication#sendError
 */
$YB.Api.prototype.handleError = function(params) {
    try {
        this._consolidateTitle();

        params = params || {};
        params.system = [params.system, this.data.accountCode];
        params.player = [params.player, this.plugin.pluginName];
        params.pluginVersion = [params.pluginVersion, this.plugin.pluginVersion];
        params.playerVersion = [params.playerVersion, this.getPlayerVersion()];
        params.resource = [params.resource, this.getResource()];
        params.duration = [params.duration, this.getMediaDuration()];
        params.live = [params.live, this.getIsLive()];
        params.user = [params.user, this.data.username];
        params.transcode = [params.transcode, this.data.transactionCode];
        params.title = [params.title, this.data.media.title];
        params.properties = [params.properties, this.data.properties];
        params.hashTitle = [params.hashTitle, this.data.hashTitle];
        params.cdn = [params.cdn, this.data.network.cdn];
        params.isp = [params.isp, this.data.network.isp];
        params.ip = [params.ip, this.data.network.ip];
        params.param1 = [params.param1, this.data.extraParams.param1];
        params.param2 = [params.param2, this.data.extraParams.param2];
        params.param3 = [params.param3, this.data.extraParams.param3];
        params.param4 = [params.param4, this.data.extraParams.param4];
        params.param5 = [params.param5, this.data.extraParams.param5];
        params.param6 = [params.param6, this.data.extraParams.param6];
        params.param7 = [params.param7, this.data.extraParams.param7];
        params.param8 = [params.param8, this.data.extraParams.param8];
        params.param9 = [params.param9, this.data.extraParams.param9];
        params.param10 = [params.param10, this.data.extraParams.param10];

        if (this.data.resumeConfig.enabled) { // If Resume service is enabled
            this.resume.start();
            params.isResumed = this.resume.isResumed;
        }

        if (this.data.isBalanced == 1) { // Add isBalanced
            params.isBalanced = 1;
        }

        this.comm.sendError(params);
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Handles ping timeout. It will be automatically called by the {@link $YB.Pinger} class.
 * @see $YB.Communication#sendPing
 */
$YB.Api.prototype.handlePing = function(params) {
    try {
        params = params || {};
        params.time = [params.time, this.getPlayhead()];
        params.bitrate = [params.bitrate, this.getBitrate()];

        if (this.ads.isStartSent) {
            params.adPlayhead = [params.adPlayhead, this.ads.getPlayhead()];
            params.adBitrate = [params.adBitrate, this.ads.getBitrate()];
        }

        this.comm.sendPing(params);

    } catch (err) {
        $YB.error(err);
    }
};

/** Handles Seek Start event. */
$YB.Api.prototype.handleSeekStart = function() {
    try {
        if (this.isJoinSent) {
            this.isSeeking = true;
            this.chrono.seek.start();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/** Handles Seek End event.
 * @see $YB.Communication#sendSeek
 */
$YB.Api.prototype.handleSeekEnd = function(params) {
    try {
        if (this.isJoinSent) {
            this.isSeeking = false;

            params = params || {};
            params.duration = [params.duration, this.chrono.seek.getDeltaTime()];
            params.time = [params.time, this.getPlayhead()];

            this.comm.sendSeek(params);
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
$YB.Api.prototype.getResource = function() {
    try {
        if (this.resourceParser && this.resourceParser.realResource) {
            return this.resourceParser.realResource;
        } else if (typeof this.data.media.resource != "undefined") {
            return this.data.media.resource;
        } else if (typeof this.plugin.getResource == "function") {
            return this.plugin.getResource();
        } else {
            return "";
        }
    } catch (err) {
        $YB.warning(err);
        return "";
    }
};

/**
 * Tries to get the playhead of the video from plugin.getPlayhead().
 * @return {number} Playhead in seconds (rounded) or 0
 */
$YB.Api.prototype.getPlayhead = function() {
    try {
        if (typeof this.plugin.getPlayhead == "function") {
            return this.plugin.getPlayhead();
        } else {
            return 0;
        }
    } catch (err) {
        $YB.warning(err);
        return 0;
    }
};

/**
 * Tries to get the mediaduration of the video from plugin.getMediaDuration().
 * @return {number} Duration in seconds (rounded) or 0;
 */
$YB.Api.prototype.getMediaDuration = function() {
    try {
        if (typeof this.data.media.duration != "undefined") {
            return this.data.media.duration;
        } else if (typeof this.plugin.getMediaDuration == "function") {
            var d = this.plugin.getMediaDuration();
            if (d === 0 || d == Infinity || isNaN(d)) {
                return 0;
            } else {
                return Math.round(d);
            }
        } else {
            return 0;
        }
    } catch (err) {
        $YB.warning(err);
        return 0;
    }
};

/**
 * Tries to get if the video is Live.
 * The order is {@link $YB.Data} > plugin.getIsLive() > false.
 * @return {boolean} True if live, false if vod.
 */
$YB.Api.prototype.getIsLive = function() {
    try {
        if (typeof this.data.media.isLive != "undefined") {
            return this.data.media.isLive;
        } else if (typeof this.plugin.getIsLive == "function" && typeof this.plugin.getIsLive() == "boolean") {
            return this.plugin.getIsLive();
        } else {
            return false;
        }
    } catch (err) {
        $YB.warning(err);
        return false;
    }
};

/**
 * Tries to get the bitrate of the video with plugin.getBitrate().
 * @return {number} Bitrate or -1.
 */
$YB.Api.prototype.getBitrate = function() {
    try {
        if (typeof this.plugin.getBitrate == "function" && this.plugin.getBitrate() != -1) {
            return Math.round(this.plugin.getBitrate());
        } else if (typeof this.plugin.video != "undefined" && typeof this.plugin.video.webkitVideoDecodedByteCount != "undefined") {
            var bitrate = this.plugin.video.webkitVideoDecodedByteCount;
            if (this.lastBitrate) {
                bitrate = Math.round(((this.plugin.video.webkitVideoDecodedByteCount - this.lastBitrate) / 5) * 8);
            }
            this.lastBitrate = this.plugin.video.webkitVideoDecodedByteCount;
            return bitrate;
        } else {
            return -1;
        }
    } catch (err) {
        $YB.warning(err);
        return -1;
    }
};

/**
 * Tries to get the player version with plugin.getPlayerVersion().
 * @return {string} PlayerVersion or "".
 */
$YB.Api.prototype.getPlayerVersion = function() {
    try {
        if (typeof this.plugin.getPlayerVersion == "function" && this.plugin.getPlayerVersion()) {
            return this.plugin.getPlayerVersion();
        } else {
            return "";
        }
    } catch (err) {
        $YB.warning(err);
        return "";
    }
};

$YB.Api.prototype._consolidateTitle = function() {
    try {
        if (this.data && this.data.media && this.data.media.title) {
            if (this.data.properties.content_metadata) {
                this.data.properties.content_metadata.title = this.data.media.title;
            } else {
                this.data.properties.content_metadata = {
                    title: this.data.media.title
                };
            }
        }
    } catch (err) {
        $YB.error(err);
    }
}