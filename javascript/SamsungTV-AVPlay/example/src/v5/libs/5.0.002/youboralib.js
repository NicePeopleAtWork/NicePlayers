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
        version: '5.0.002',

        /**
         * $YB.report will show all messages inferior to this level.
         * 0: no errors;
         * 1: errors;
         * 2: + warnings;
         * 3: + life-cycle logs;
         * 4: + debug messages;
         * 5: + expose XML requests;
         * You can specify youbora-debug="X" inside the &lt;script&gt; tag to force level.
         *
         * @default 1
         * @memberof $YB
         * @see {@link $YB.report}
         */
        errorLevel: 1,

        /**
         * If true, console outputs will always be outputed without colors (for debbugin in devices).
         * @default false
         * @memberof $YB
         */
        plainConsole: false,

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
        util: {}
    };

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
                if ($YB.remoteLog.forced === true) {
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
     * Sends a XHR request to a PHP script for logging purposes.
     *
     * @param msg Message to be sent.
     * @param [host=<$YB.remoteLog.host>] Host of the script
     * @param [file=<$YB.remoteLog.file>] Route to the script file
     * @memberof $YB
     */
    $YB.remoteLog = function(msg, host, file) {
        host = host || $YB.remoteLog.host;
        file = file || $YB.remoteLog.file;

        var ar = new $YB.AjaxRequest(host, file, {
            msg: msg
        });
        ar.send();
    }

    /**
     * RemoteLog configuration. If true, every $YB log will also call remoteLog.
     * @default false
     * @memberof $YB.remoteLog
     */
    $YB.remoteLog.forced = false;

    /**
     * RemoteLog configuration. Host of the script
     * @default http://pre.smartplugin.youbora.com
     * @memberof $YB.remoteLog
     */
    $YB.remoteLog.host = 'http://pre.smartplugin.youbora.com';

    /**
     * RemoteLog configuration. Route to the script file
     * @default /5.0/util/log.php
     * @memberof $YB.remoteLog
     */
    $YB.remoteLog.file = '/5.0/util/log.php';

    /**
     * Returns the first element in the array not undefined and not null.
     * If a function is passed, it will be executed (no arguments will be sent).
     * @param {array} arr Array of elements and undefineds
     * @return First defined item. If there aren't any, returns null.
     */
    $YB.util.getFirstDefined = function(arr) {
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
    };

    /**
     * Return n if it isn't NaN, negative, Infinity, null or undefined. In any other case, return def.
     * @param {mixed} n Number to be parsed.
     * @param {number} def Number to return if n is not correct.
     */
    $YB.util.parseNumber = function(n, def) {
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
    $YB.util.listenAllEvents = $YB.util.listenAllEvents || function() {};
    $YB.util.serialize = $YB.util.listenAllEvents || function() {};

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
} catch (err) {
    var m = '[Youbora] Fatal Error: Unable to start Youboralib.';
    console.error ? console.error(m) : console.log(m);
    console.log(err);
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
        $YB.warn(err);
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
        $YB.warn(err);
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
        $YB.warn(err);
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
        $YB.warn(err);
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
        $YB.warn(err);
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
        $YB.warn(err);
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
                return "?" + this.params;
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
                this.timer = setInterval(function() {
                    try {
                        that._checkBuffer();
                    } catch (err) {
                        $YB.error(err);
                    }
                }, this.options.interval);
            } else {
                $YB.warn("Warning: Can't start autobuffer because context does not implement getPlayhead().");
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

        /** Array of strings, only when the array is empty the request Queues will begin sending. */
        this.preloaders = [];

        this._lastDurationSent = 0; // Save the last duration so it will be sent only once.
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
            ajax = new $YB.AjaxRequest(this._parseServiceHost(this.host), '/data', params);

        ajax.load(function() {
            that.receiveData(ajax);
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
            vars = {
                h: response.getElementsByTagName('h'), // Host
                c: response.getElementsByTagName('c'), // Code
                pt: response.getElementsByTagName('pt'), // Ping time interval in seconds
                b: response.getElementsByTagName('b') // 1 = Balancer enabled
                    //tc: response.getElementsByTagName('tc'), // Transaction code
                    //t: response.getElementsByTagName('t') // Test
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

            $YB.notice('FastData \'' + this.code + '\'is ready.', 'darkgreen');

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
        params.referer = [params.referer, (typeof window != 'undefined') ? window.location.href : ''];
        params.properties = [params.properties, {}];
        params.pingTime = [params.pingTime, this.pingTime];
        params.live = [params.live, false];
        this.checkMandatoryParams(params, ['system', 'pluginVersion', 'user', 'resource']);


        this.sendRequest('/start', params, callback);

        // Save lastDuration to sent it only once
        this._lastDurationSent = params.duration;

        $YB.notice("Request: NQS /start " + params.resource, 'darkgreen');

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

        $YB.notice("Request: NQS /joinTime " + params.time + "ms", 'darkgreen');
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

        $YB.notice("Request: NQS /stop", 'darkgreen');
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

        $YB.notice("Request: NQS /pause", 'darkgreen');
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

        $YB.notice("Request: NQS /resume", 'darkgreen');
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

        $YB.notice("Request: NQS /bufferUnderrun " + params.duration + "ms", 'darkgreen');
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
$YB.Communication.prototype.sendError = function(params, callback) {
    try {
        params = params || {};
        delete params.code;
        params.msg = [params.msg, 'Unknown Error'];
        params.referer = [params.referer, (typeof window != 'undefined') ? window.location.href : ''];
        if (typeof params.errorCode == 'undefined' || parseInt(params.errorCode) < 0) {
            params.errorCode = 9000;
        }

        this.checkMandatoryParams(params, ['msg', 'errorCode', 'player']);

        this.sendRequest('/error', params, callback);

        $YB.notice("Request: NQS /error " + params.msg, 'darkgreen');
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

        $YB.notice("Request: NQS /seek " + params.duration + "ms", 'darkgreen');
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

        $YB.notice("Request: NQS /adStart " + params.position + params.number, 'darkgreen');
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

        $YB.notice("Request: NQS /adJoinTime " + params.duration + "ms", 'darkgreen');
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

        $YB.notice("Request: NQS /adStop " + params.totalDuration + "ms", 'darkgreen');
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

        $YB.notice("Request: NQS /bufferUnderrun " + params.duration + "ms", 'darkgreen');
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

                        if (typeof ajax.params.resource != "undefined" && this.context.resourceParser.realResource) {
                            ajax.params.resource = this.context.resourceParser.realResource; // If realresource was fetched, use it.
                        }
                        if (typeof ajax.params.nodeHost != "undefined" && this.context.resourceParser.nodeHost) {
                            ajax.params.nodeHost = this.context.resourceParser.nodeHost;
                            ajax.params.nodeType = this.context.resourceParser.nodeType;
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
            var allOk = true;
            for (var i = 0; i < mandatory.length; i++) {
                if (!(mandatory[i] in params)) {
                    allOk = false;
                    $YB.warn('Warning: Missing mandatory parameter \'' + mandatory[i] + '\' in the request.');
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
        this.timer = setInterval(function() {
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
                clearInterval(that.timer);
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
     */
    media: {
        isLive: undefined,
        resource: undefined,
        title: undefined,
        duration: undefined,
        bitrate: undefined,
        throughput: undefined,
        rendition: undefined
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

        $YB.notice("Sending pings every " + this.interval + "ms.", 'darkgreen');
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
        clearTimeout(this.timer);
    } catch (err) {
        $YB.error(err);
    }
};

$YB.Pinger.prototype._setPing = function() {
    try {
        if (this.isRunning) {
            var that = this;
            this.time = new Date().getTime();
            this.timer = setTimeout(function() {
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
        this.cdns = $YB.ResourceParser.cdnsEnabled.slice();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Starts the process if either parseHLS or parseCDNNodeHost are active. The process is aborted automatically after 3 seconds.
 */
$YB.ResourceParser.prototype.init = function() {
    try {
        // Reinit
        if (this.realResource) {
            this.clear();
        }

        // Add Preloader
        this.context.comm.addPreloader('ResourceParser');

        // Abort operation after 3s
        var that = this;
        this.parseTimeout = setTimeout(function() {
            if ('ResourceParser' in that.context.comm.preloaders) {
                that.realResource = that.context.getResource();
                that.context.comm.removePreloader('ResourceParser');
                $YB.warn('ResourceParser has exceded the maximum execution time (3s) and will be aborted.');
            }
        }, 3000);

        // Start processing
        this.realResource = this.context.getResource();
        if (this.context.data.parseHLS) {
            this.parseRealResourceAsync(this.context.getResource());
        } else {
            this.parseCDNAsync();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Clear the info fetched by resourceParser. Should be called after a stop is sent.
 */
$YB.ResourceParser.prototype.clear = function() {
    this.realResource = '';
    this.nodeHost = undefined;
    this.nodeType = undefined;
    this.cdnRequests = {};
    this.cdns = $YB.ResourceParser.cdnsEnabled.slice();
}

/**
 * Parses resource, if it is an HLS .m3u8 file, it recursively parses its info until .ts or .mp4 is found.
 *
 * @private
 * @param {string} resource path to the resource.
 */
$YB.ResourceParser.prototype.parseRealResourceAsync = function(resource, parentResource) {
    try {
        var matches = /(\S*?(\.m3u8|\.m3u|\.ts|\.mp4)(\?\S*|\n|\r|$))/i.exec(resource); //get first line ending in .m3u8, .m3u, .mp4 or .ts
        if (matches !== null) {
            var res = matches[1].trim();
            if (res.indexOf('http') !== 0) { // Does not start with http add parentResource relative route.
                res = parentResource.slice(0, parentResource.lastIndexOf('/')) + "/" + res;
            }
            if (matches[2] == '.m3u8' || matches[2] == '.m3u') { // It is m3u8 or m3u...
                var that = this;
                new $YB.AjaxRequest(res).load(function() {
                        debugger;
                        that.parseRealResourceAsync(this.responseText, res); //In this context, this referes to the XHR.
                    }).error(function() {
                        debugger;
                        that.parseCDNAsync();
                    })
                    .send();
            } else { // It is mp4 or ts...
                this.realResource = res;
                this.parseCDNAsync()
            }
        } else {
            this.parseCDNAsync();
        }
    } catch (err) {
        $YB.error(err);
        this.parseCDNAsync();
    }
};


/** List of CDNs in order for execution. Can be modified to alter the order/list of CDNs available.
 * CDNs that share headers will share request, saving resources.
 */
$YB.ResourceParser.cdnsEnabled = ['Level3', 'Akamai', 'Highwinds', 'Fastly'];

/** List of CDNs configuration. */
$YB.ResourceParser.cdnsAvailable = {
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
$YB.ResourceParser.prototype.parseCDNAsync = function() {
    try {
        if (this.context.data.parseCDNNodeHost) {
            if (this.cdns.length > 0 && !this.nodeHost) { // if there's CDN remaining in the pool and host has not been retrieved...
                var cdn = this.cdns.shift();
                if (typeof $YB.ResourceParser.cdnsAvailable[cdn] != 'undefined') {

                    var config = $YB.ResourceParser.cdnsAvailable[cdn],
                        headers = JSON.stringify(config.headers);

                    if (this.cdnRequests.hasOwnProperty(headers)) {
                        this.parseNode(config.parsers, this.cdnRequests[headers]);
                    } else {
                        var that = this;

                        var ajax = new $YB.AjaxRequest(this.realResource, '', '', {
                            method: 'HEAD',
                            maxRetries: 0,
                            requestHeaders: config.headers
                        });

                        ajax.load(function() {
                            that.cdnRequests[headers] = ajax.getXHR();
                            that.parseNode(config.parsers, ajax.getXHR());
                        });

                        ajax.error(function() {
                            that.parseCDNAsync();
                        });

                        ajax.send();
                    }
                } else {
                    this.parseCDNAsync();
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
}

$YB.ResourceParser.prototype.parseNode = function(parsers, response) {
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
                            this.nodeType = this.parseNodeType(match[1]);
                            break;
                        case 'host+type':
                            this.nodeHost = match[1];
                            this.nodeType = this.parseNodeType(match[2]);
                            break;
                        case 'type+host':
                            this.nodeType = this.parseNodeType(match[1]);
                            this.nodeHost = match[2];
                            break;
                    }
                } else {
                    this.parseCDNAsync();
                    return;
                }
            } else {
                this.parseCDNAsync();
                return;
            }
        }

        this.parseCDNAsync();
    } catch (err) {
        $YB.error(err);
        this.parseCDNAsync();
    }
};

$YB.ResourceParser.prototype.parseNodeType = function(type) {
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
                        $YB.warn("ResumeService callback is not a function");
                    }
                } else if (httpEvent.response === "0") {
                    // Resume ok...
                } else {
                    // Resume disabled, stop service.
                    that.stop();
                }
            });

            $YB.notice("Request: ResumeService check " + this.config.contentId, 'darkgreen');
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
        this.timer = setInterval(function() {
            that._sendPlayTime();
        }, interval);
    } catch (err) {
        $YB.error(err);
    }
};

/** Stops sending playtimes */
$YB.ResumeService.prototype.stop = function() {
    try {
        clearInterval(this.timer);
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
                    $YB.warn("Smartswitch said: '" + xhr.response + "'");
                }
                if (response) {
                    that.data.isBalanced = 1;
                    that.callback(response);
                } else {
                    that.callback(false);
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
    lastBitrate: 0,
    /** Last rendition calculated */
    lastRendition: '',
    /** An object of entities changed to be sent in pings. */
    changedEntities: []
};

$YB.Api.prototype._init = function() {
    try {
        var report = "YAPI Modules Loaded: [Communication] [Adnalizer] [ResourceParser] ";

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
        this.resourceParser = new $YB.ResourceParser(this);

        // Concurrency
        if (this.data.concurrencyConfig.enabled) {
            this.concurrency = new $YB.ConcurrencyService(this);
            report += "[Concurrency] ";
        }

        // Resume
        if (this.data.resumeConfig.enabled) {
            this.resume = new $YB.ResumeService(this);
            report += "[Resume] ";
        }

        // Smartswitch
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

        if (this.data.parseCDNNodeHost || this.data.parseHLS) {
            this.resourceParser.init();
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
        params.rendition = [params.rendition, this.getRendition()];
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

        if (this.data.parseCDNNodeHost) {
            params.nodeHost = [params.nodeHost, this.resourceParser.cdnHost];
            params.nodeType = [params.nodeType, this.resourceParser.cdnType];
        }

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

            this.resourceParser.clear();

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

        if (this.data.parseCDNNodeHost) {
            params.nodeHost = [params.nodeHost, this.resourceParser.cdnHost];
            params.nodeType = [params.nodeType, this.resourceParser.cdnType];
        }

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
        params.throughput = [params.throughput, this.getThroughput()];

        //Rendition
        var rendition = this.getRendition();
        if (this.lastRendition != rendition) {
            this.changeEntity('rendition', rendition);
            this.lastRendition = rendition;
        }

        // Changed entities
        if (this.changedEntities.length == 2) {
            params.entityType = [params.entityType, this.changedEntities.shift()];
            params.entityValue = [params.entityValue, this.changedEntities.shift()];
        } else if (this.changedEntities.length > 2) {
            var obj = {};
            while (this.changedEntities.length > 0) {
                obj[this.changedEntities.shift()] = this.changedEntities.shift();
            }
            params.entityValue = [params.entityValue, JSON.stringify(obj)];
        }

        // Ads
        if (this.ads.isStartSent) {
            params.adPlayhead = [params.adPlayhead, this.ads.getPlayhead()];
            params.adBitrate = [params.adBitrate, this.ads.getBitrate()];
        }

        this.comm.sendPing(params);

    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Queues an entity that would be changed during the next ping.
 * @param {string} key Name of the entity. If the key is already queued to change, it will be overriden. ie: duration, rendition...
 * @param {mixed} value New value.
 */
$YB.Api.prototype.changeEntity = function(key, value) {
    try {
        this.changedEntities.push(key);
        this.changedEntities.push(value);
    } catch (err) {
        $YB.error(err);
    }
}

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
        $YB.warn(err);
        return "";
    }
};

/**
 * Tries to get the playhead of the video from plugin.getPlayhead().
 * @return {number} Playhead in seconds (rounded) or 0
 */
$YB.Api.prototype.getPlayhead = function() {
    try {
        var res = 0;
        if (typeof this.plugin.getPlayhead == "function") {
            res = this.plugin.getPlayhead();
        }

        return $YB.util.parseNumber(res);
    } catch (err) {
        $YB.warn(err);
        return 0;
    }
};

/**
 * Tries to get the mediaduration of the video from plugin.getMediaDuration().
 * @return {number} Duration in seconds (rounded) or 0;
 */
$YB.Api.prototype.getMediaDuration = function() {
    try {
        var res = 0;
        if (typeof this.data.media.duration != "undefined") {
            res = this.data.media.duration;
        } else if (typeof this.plugin.getMediaDuration == "function") {
            res = this.plugin.getMediaDuration();
        }

        return $YB.util.parseNumber(res);
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
$YB.Api.prototype.getIsLive = function() {
    try {
        //debugger;
        //return $YB.util.getFirstDefined([this.plugin.getIsLive]);

        if (typeof this.data.media.isLive != "undefined") {
            return this.data.media.isLive;
        } else if (typeof this.plugin.getIsLive == "function" && typeof this.plugin.getIsLive() == "boolean") {
            return this.plugin.getIsLive();
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
$YB.Api.prototype.getRendition = function() {
    try {
        if (typeof this.data.media.rendition != "undefined") {
            return this.data.media.rendition;
        } else if (typeof this.plugin.getRendition == "function") {
            return this.plugin.getRendition();
        } else {
            return '';
        }
    } catch (err) {
        $YB.warn(err);
        return '';
    }
};

/**
 * Tries to get the bitrate of the video with plugin.getBitrate().
 * @return {number} Bitrate or -1.
 */
$YB.Api.prototype.getBitrate = function() {
    try {
        var res = -1;
        if (typeof this.data.media.bitrate != "undefined") {
            res = this.data.media.bitrate;
        } else if (typeof this.plugin.getBitrate == "function" && this.plugin.getBitrate() != -1 && this.plugin.getBitrate() != 0 && !isNaN(this.plugin.getBitrate())) {
            res = Math.round(this.plugin.getBitrate());
        } else if (typeof this.plugin.video != "undefined" && typeof this.plugin.video.webkitVideoDecodedByteCount != "undefined") {
            // Chrome workarround
            var bitrate = this.plugin.video.webkitVideoDecodedByteCount;
            if (this.lastBitrate) {
                bitrate = Math.round(((this.plugin.video.webkitVideoDecodedByteCount - this.lastBitrate) / 5) * 8);
            }
            this.lastBitrate = this.plugin.video.webkitVideoDecodedByteCount;
            res = bitrate;
        }

        return $YB.util.parseNumber(res, -1);
    } catch (err) {
        $YB.warn(err);
        return -1;
    }
};

/**
 * Tries to get the throughput of the video with plugin.getThroughput().
 * @return {number} Throughput or -1.
 */
$YB.Api.prototype.getThroughput = function() {
    try {
        var res = -1;
        if (typeof this.data.media.throughput != "undefined") {
            res = this.data.media.throughput;
        } else if (typeof this.plugin.getThroughput == "function" && this.plugin.getThroughput() != -1 && this.plugin.getThroughput() != 0 && !isNaN(this.plugin.getThroughput())) {
            res = Math.round(this.plugin.getThroughput());
        }

        return $YB.util.parseNumber(res, -1);
    } catch (err) {
        $YB.warn(err);
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
        $YB.warn(err);
        return "";
    }
};

// Notice Start
$YB.notice('YouboraLib ' + $YB.version + ' is ready.');
