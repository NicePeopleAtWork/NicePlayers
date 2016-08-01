/**
 * @license
 * YouboraLib
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * This namespace is the global YouboraJS Object. All classes and objects pend from this namespace.
 * @namespace
 */
var $YB = $YB || {

    /**
     * Version of the library.
     * @memberof $YB
     */
    version: '5.2',

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
     * Namespace for all API classes
     * @namespace
     * @memberof $YB
     * @since  5.1.03
     */
    api: {},

    /**
     * Namespace for all communication classes
     * @namespace
     * @private
     * @memberof $YB
     * @since 5.1.03
     */
    comm: {},

    /**
     * Namespace for all data classes
     * @namespace
     * @memberof $YB
     * @since  5.1.03
     */
    data: {},

    /**
     * Namespace for all extra services
     * @namespace
     * @memberof $YB
     */
    services: {}
};

/**
 * @license
 * Youbora AdsApi
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/** AdsApi will help plugin class in the tracking and analyzing the Ad events. It also will help with the iteration with the Ads addons.
 *
 * @class Ads
 * @memberof $YB.api
 * @param {$YB.adnalyzers.Generic} adnalyzer The adnalyzer from where it was called.
 */
$YB.api.Ads = function(adnalyzer) { // constructor
    this.adnalyzer = adnalyzer;

    /** An instance of {@link $YB.utils.Buffer}. */
    this.buffer = new $YB.utils.Buffer(this);

    /** An object with multiples instances of {@link $YB.utils.Chrono}.
     * @prop {$YB.utils.Chrono} total Chrono for the totality of the Ad.
     * @prop {$YB.utils.Chrono} joinTime Chrono between ad start and joinTime.
     * @prop {$YB.utils.Chrono} pause Chrono for pauses.
     * @prop {$YB.utils.Chrono} buffer Reference to this.buffer.chrono
     */
    this.chrono = {
        total: new $YB.utils.Chrono(),
        joinTime: new $YB.utils.Chrono(),
        pause: new $YB.utils.Chrono(),
        buffer: this.buffer.chrono
    };

    /** Counters of rolls shown.
     * @prop {number} pre Prerolls shown.
     * @prop {number} mid midrolls shown.
     * @prop {number} post Postrolls shown.
     */
    this.counter = {
        pre: 0,
        mid: 0,
        post: 0,
        unknown: 0
    };

    /** Sum of preroll times. Useful to adecuate joinTime. */
    this.totalPrerollTime = 0;

    /** Position of the current roll: pre, mid, post, unknown. */
    this.position = '';
};

/**
 * Sends '/adStart' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.api.Ads.prototype.sendAdStart = function(params, callback) {
    try {
        // Close previous view
        if (this.adnalyzer.isAdStartSent) {
            this.sendAdStop();
        }

        // Start autobuffer
        if (this.buffer.autostart) {
            this.buffer.start();
        }

        //If seeking or buffering, send /seek or /bufferUnderrun
        this.adnalyzer.plugin.videoApi.sendSeekEnd();
        this.adnalyzer.plugin.videoApi.sendBufferEnd();

        // Chronos & Flags
        this.adnalyzer.plugin.isShowingAds = true;
        this.adnalyzer.isAdStartSent = true;
        this.chrono.total.start();
        this.chrono.joinTime.start();

        // Params
        params = params || {};
        params.resource = typeof params.resource != 'undefined' ? params.resource : this.adnalyzer.plugin.infoApi.getAdResource();
        params.position = typeof params.position != 'undefined' ? params.position : this.adnalyzer.plugin.infoApi.getAdPosition();
        params.number = typeof params.number != 'undefined' ? params.number : this.getNumber(params.position, true);
        params.campaign = typeof params.campaign != 'undefined' ? params.campaign : this.adnalyzer.plugin.data.ads.campaign;
        params.title = typeof params.title != 'undefined' ? params.title : this.adnalyzer.plugin.infoApi.getAdTitle();
        params.adDuration = typeof params.adDuration != 'undefined' ? params.adDuration : this.adnalyzer.plugin.infoApi.getAdDuration();
        params.playhead = typeof params.playhead != 'undefined' ? params.playhead : this.adnalyzer.plugin.infoApi.getPlayhead();
        params.adnalyzerVersion = typeof params.adnalyzerVersion != 'undefined' ? params.adnalyzerVersion : this.adnalyzer.adnalyzerVersion;
        params.adPlayerVersion = typeof params.adPlayerVersion != 'undefined' ? params.adPlayerVersion : this.adnalyzer.plugin.infoApi.getAdPlayerVersion();


        if (typeof params.durationJointime != 'undefined') {
            this.adnalyzer.isAdJoinSent = true;
        }

        this.position = params.position;

        // Send request
        this.adnalyzer.plugin.comm.sendRequest('/adStart', params, callback);
        $YB.notice("Request: NQS /adStart " + params.position + params.number, 'darkgreen');
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/adJoinTime' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.api.Ads.prototype.sendAdJoin = function(params, callback) {
    try {
        if (this.adnalyzer.isAdStartSent && !this.adnalyzer.isAdJoinSent) {
            this.adnalyzer.isAdJoinSent = true;

            if (this.buffer.autostart) {
                this.buffer.start();
            }

            // Params
            params = params || {};
            params.adPlayhead = typeof params.adPlayhead != 'undefined' ? params.adPlayhead : this.adnalyzer.plugin.infoApi.getAdPlayhead();
            params.duration = typeof params.duration != 'undefined' ? params.duration : this.chrono.joinTime.getDeltaTime();
            params.position = typeof params.position != 'undefined' ? params.position : this.position;
            params.number = typeof params.number != 'undefined' ? params.number : this.getNumber(params.position);

            // Send request
            this.adnalyzer.plugin.comm.sendRequest('/adJoinTime', params, callback);
            $YB.notice("Request: NQS /adJoinTime " + params.duration + "ms", 'darkgreen');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/adStop' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.api.Ads.prototype.sendAdStop = function(params, callback) {
    try {
        if (this.adnalyzer.isAdStartSent) {
            this.adnalyzer.isAdStartSent = false;
            this.adnalyzer.isAdJoinSent = false;
            this.adnalyzer.isAdBuffering = false;
            this.adnalyzer.plugin.isShowingAds = false;

            this.buffer.stop();

            // Params
            params = params || {};
            params.totalDuration = typeof params.totalDuration != 'undefined' ? params.totalDuration : this.chrono.total.getDeltaTime();
            params.adPlayhead = typeof params.adPlayhead != 'undefined' ? params.adPlayhead : this.adnalyzer.plugin.infoApi.getAdPlayhead();
            params.adBitrate = typeof params.adBitrate != 'undefined' ? params.adBitrate : this.adnalyzer.plugin.infoApi.getAdBitrate();
            params.position = typeof params.position != 'undefined' ? params.position : this.position;
            params.number = typeof params.number != 'undefined' ? params.number : this.getNumber(params.position);

            if (!params.adPlayhead) {
                delete params.adPlayhead;
            }

            // Save preroll time
            if (this.position == 'pre' && !this.adnalyzer.plugin.isJoinSent) {
                this.totalPrerollTime += params.totalDuration;
            }

            // Send request
            this.adnalyzer.plugin.comm.sendRequest('/adStop', params, callback);
            $YB.notice("Request: NQS /adStop " + params.totalDuration + "ms", 'darkgreen');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/adPause' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.api.Ads.prototype.sendAdPause = function(params, callback) {
    try {
        if (this.adnalyzer.isAdJoinSent && !this.adnalyzer.isAdPaused) {
            this.adnalyzer.isAdPaused = true;
            this.chrono.pause.start();

            // Params
            params = params || {};
            params.position = typeof params.position != 'undefined' ? params.position : this.position;
            params.number = typeof params.number != 'undefined' ? params.number : this.getNumber(params.position);

            // Send the request
            this.adnalyzer.plugin.comm.sendRequest('/adPause', params, callback);
            $YB.notice("Request: NQS /adPause", 'darkgreen');
        }
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * Sends '/adResume' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.api.Ads.prototype.sendAdResume = function(params, callback) {
    try {
        if (this.adnalyzer.isAdJoinSent && this.adnalyzer.isAdPaused) {
            this.adnalyzer.isAdPaused = false;
            this.chrono.pause.getDeltaTime();

            // Params
            params = params || {};
            params.position = typeof params.position != 'undefined' ? params.position : this.position;
            params.number = typeof params.number != 'undefined' ? params.number : this.getNumber(params.position);

            // Send the request
            this.adnalyzer.plugin.comm.sendRequest('/adResume', params, callback);
            $YB.notice("Request: NQS /adResume", 'darkgreen');
        }
    } catch (err) {
        $YB.error(err);
    }
};


/** Notifies a buffer start. It will expect a {$YB.api.Ads#sendAdBufferEnd}. */
$YB.api.Ads.prototype.sendAdBufferStart = function() {
    try {
        if (this.adnalyzer.isAdJoinSent && !this.adnalyzer.isAdBuffering) {
            this.adnalyzer.isAdBuffering = true;
            this.chrono.buffer.start();

            $YB.notice("Method: /adBufferStart", 'darkgreen');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/adBufferUnderr
un' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.api.Ads.prototype.sendAdBufferEnd = function(params, callback) {
    try {
        if (this.adnalyzer.isAdJoinSent && this.adnalyzer.isAdBuffering) {
            this.adnalyzer.isAdBuffering = false;

            params = params || {};
            params.adPlayhead = typeof params.adPlayhead != 'undefined' ? params.adPlayhead : this.adnalyzer.plugin.infoApi.getAdPlayhead();
            params.duration = typeof params.duration != 'undefined' ? params.duration : this.chrono.buffer.getDeltaTime();
            params.position = typeof params.position != 'undefined' ? params.position : this.position;
            params.number = typeof params.number != 'undefined' ? params.number : this.getNumber(params.position);

            // Send request
            this.adnalyzer.plugin.comm.sendRequest('/adBufferUnderrun', params, callback);
            $YB.notice("Request: NQS /adBufferUnderrun " + params.duration + "ms", 'darkgreen');
        }
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * Given a position, it returns the counter of ads of that type.
 * @param {string} pos either 'pre', 'mid', 'post' or 'unknown'.
 * @param {boolean} [increment=false] If true, counter will be incremented before beign sent.
 */
$YB.api.Ads.prototype.getNumber = function(pos, increment) {
    switch (pos) {
        case 'pre':
            return (increment) ? ++this.counter.pre : this.counter.pre;
        case 'mid':
            return (increment) ? ++this.counter.mid : this.counter.mid;
        case 'post':
            return (increment) ? ++this.counter.post : this.counter.post;
        default:
            return (increment) ? ++this.counter.unknown : this.counter.unknown;
    }
};

/**
 * Restarts all the counters.
 */
$YB.api.Ads.prototype.resetNumbers = function() {
    this.counter = {
        pre: 0,
        mid: 0,
        post: 0,
        unknown: 0
    };
};

/**
 * @license
 * Youbora InfoApi
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/** Info API is in charge to retrieve information from OPTIONS, plugins or adnalyzers using getXXX functions (ie: getResource).
 *
 * @class
 * @memberof $YB
 * @param {$YB.plugins.Generic} plugin The plugin from where it was called.
 */

$YB.api.Info = function(plugin) { // constructor
    this.plugin = plugin;

    /** Last bitrate calculated. */
    this.lastBitrate = 0;
    /** Last ad bitrate calculated. */
    this.lastAdBitrate = 0;
}

/**
 * Tries to get the resource of the video.
 * The order is {@link $YB.resourceParser#realResource} > {@link $YB.data.Options} > plugin.getResource() > "unknown".
 * @return {string} Resource or "unknown".
 */
$YB.api.Info.prototype.getResource = function() {
    try {
        if (this.plugin.resourceParser && this.plugin.resourceParser.realResource) {
            return this.plugin.resourceParser.realResource;
        } else if (typeof this.plugin.data.media.resource != "undefined") {
            return this.plugin.data.media.resource;
        } else {
            return this.plugin.getResource();
        }
    } catch (err) {
        $YB.warn(err);
        return "unknown";
    }
};



/**
 * Tries to get the mediaduration of the video from {@link $YB.data.Options} > plugin.getMediaDuration().
 * @return {number} Duration in seconds (rounded) or 0;
 */
$YB.api.Info.prototype.getMediaDuration = function() {
    try {
        var res = 0;
        if (typeof this.plugin.data.media.duration != "undefined") {
            res = this.plugin.data.media.duration;
        } else {
            res = this.plugin.getMediaDuration();
        }

        return Math.round($YB.utils.parseNumber(res, 0));
    } catch (err) {
        $YB.warn(err);
        return 0;
    }
};

/**
 * Tries to get if the video is Live.
 * The order is {@link $YB.data.Options} > plugin.getIsLive() > false.
 * @return {boolean} True if live, false if vod.
 */
$YB.api.Info.prototype.getIsLive = function() {
    try {
        if (typeof this.plugin.data.media.isLive != "undefined") {
            return this.plugin.data.media.isLive;
        } else {
            return this.plugin.getIsLive();
        }
    } catch (err) {
        $YB.warn(err);
        return false;
    }
};

/**
 * Tries to get the player version from plugin.getPlayerVersion().
 * @return {string} PlayerVersion or "".
 */
$YB.api.Info.prototype.getPlayerVersion = function() {
    try {
        return this.plugin.getPlayerVersion();
    } catch (err) {
        $YB.warn(err);
        return "";
    }
};

/**
 * Tries to get the title from {@link $YB.data.Options} > plugin.getTitle().
 * @return {string} Title or empty string.
 */
$YB.api.Info.prototype.getTitle = function() {
    try {
        if (typeof this.plugin.data.media.title != "undefined") {
            return this.plugin.data.media.title;
        } else {
            return this.plugin.getTitle();
        }
    } catch (err) {
        $YB.warn(err);
        return "";
    }
};

/**
 * Tries to get the rendition of the video from plugin.getRendition().
 * @return {number|string} Rendition of the media.
 */
$YB.api.Info.prototype.getRendition = function() {
    try {
        if (typeof this.plugin.data.media.rendition != "undefined") {
            return this.plugin.data.media.rendition;
        } else {
            return this.plugin.getRendition();
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
$YB.api.Info.prototype.getBitrate = function() {
    try {
        var res = Math.round(this.plugin.getBitrate());

        // Chrome workarround
        if (res == -1 && this.plugin.tag && typeof this.plugin.tag.webkitVideoDecodedByteCount != "undefined") {
            var bitrate = this.plugin.tag.webkitVideoDecodedByteCount;
            if (this.lastBitrate) {
                bitrate = Math.round(((this.plugin.tag.webkitVideoDecodedByteCount - this.lastBitrate) / 5) * 8);
            }
            this.lastBitrate = this.plugin.tag.webkitVideoDecodedByteCount;
            res = bitrate;
        }

        return $YB.utils.parseNumber(res, -1);
    } catch (err) {
        $YB.warn(err);
        return -1;
    }
};

/**
 * Tries to get the throughput of the video with plugin.getThroughput().
 * @return {number} Throughput or -1.
 */
$YB.api.Info.prototype.getThroughput = function() {
    try {
        return $YB.utils.parseNumber(Math.round(this.plugin.getThroughput()), -1);
    } catch (err) {
        $YB.warn(err);
        return -1;
    }
};

/**
 * Tries to get the total bytes loaded from the video from plugin.getTotalBytes().
 * @return {number} Total Bytes or null;
 */
$YB.api.Info.prototype.getTotalBytes = function() {
    try {
        return $YB.utils.parseNumber(this.plugin.getTotalBytes(), null);
    } catch (err) {
        $YB.warn(err);
        return null;
    }
};

/**
 * Tries to get the playhead of the video.
 * The order is {@link $YB.data.Options} > adnalyzer.getMediaPlayhead() > plugin.getPlayhead() > 0.
 * @return {number} Playhead in seconds or 0
 */
$YB.api.Info.prototype.getPlayhead = function() {
    try {
        var res = this.plugin.getPlayhead();

        if (this.plugin.adnalyzer && this.plugin.adnalyzer.getMediaPlayhead() !== null) {
            res = this.plugin.adnalyzer.getMediaPlayhead();
        }

        return $YB.utils.parseNumber(res, 0);
    } catch (err) {
        $YB.warn(err);
        return 0;
    }
};


/**
 * Tries to get the playhead of the ad from adnalyzer.getAdPlayhead().
 * @return {number} Playhead in seconds or 0
 */
$YB.api.Info.prototype.getAdPlayhead = function() {
    try {
        return $YB.utils.parseNumber(this.plugin.adnalyzer.getAdPlayhead(), 0);
    } catch (err) {
        $YB.warn(err);
        return 0;
    }
};

/**
 * Tries to get the bitrate of the ad with adnalyzer.getAdBitrate().
 * @return {number} Bitrate or -1.
 */
$YB.api.Info.prototype.getAdBitrate = function() {
    try {
        var res = Math.round(this.plugin.adnalyzer.getAdBitrate());

        // Chrome workarround
        if (res == -1 && this.plugin.adnalyzer.tag && typeof this.plugin.adnalyzer.tag.webkitVideoDecodedByteCount != "undefined") {
            var bitrate = this.plugin.adnalyzer.tag.webkitVideoDecodedByteCount;
            if (this.lastAdBitrate) {
                bitrate = Math.round(((this.plugin.adnalyzer.tag.webkitVideoDecodedByteCount - this.lastAdBitrate) / 5) * 8);
            }
            this.lastAdBitrate = this.plugin.adnalyzer.tag.webkitVideoDecodedByteCount;
            res = bitrate;
        }

        return $YB.utils.parseNumber(res, -1);
    } catch (err) {
        $YB.warn(err);
        return -1;
    }
};

/**
 * Tries to get the resource of the ad.
 * The order is {@link $YB.data.Options} > adnalyzer.getAdResource() > "".
 * @return {string} Resource or empty string.
 */
$YB.api.Info.prototype.getAdResource = function() {
    try {
        if (typeof this.plugin.data.ads.resource != 'undefined') {
            return this.plugin.data.ads.resource;
        } else {
            return this.plugin.adnalyzer.getAdResource();
        }
    } catch (err) {
        $YB.warn(err);
        return "";
    }
};

/**
 * Tries to get the position of the roll (pre, mid, post) of the ad from adnalyzer.getAdPosition().
 * The order is {@link $YB.data.Options} > adnalyzer.getPosition() > "unknown".
 * @return {string} Position (pre, mid, post) or 'unknown';
 */
$YB.api.Info.prototype.getAdPosition = function() {
    try {
        if (typeof this.plugin.data.ads.position != 'undefined') {
            return this.plugin.data.ads.position;
        } else {
            return this.plugin.adnalyzer.getAdPosition();
        }
    } catch (err) {
        $YB.warn(err);
        return 'unknown';
    }
};

/**
 * Tries to get the title of the ad, from {@link $YB.data.Options} > adnalyzer.getAdTitle();
 * The order is {@link $YB.data.Options} > adnalyzer.getTitle() > "".
 * @return {string} Title of the ad or "";
 */
$YB.api.Info.prototype.getAdTitle = function() {
    try {
        if (typeof this.plugin.data.ads.title != 'undefined') {
            return this.plugin.data.ads.title;
        } else {
            return this.plugin.adnalyzer.getAdTitle();
        }
    } catch (err) {
        $YB.warn(err);
        return '';
    }
};

/**
 * Tries to get the mediaduration of the ad from {@link $YB.data.Options} > adnalyzer.getAdDuration().
 * @return {number} Duration in seconds (rounded) or 0;
 */
$YB.api.Info.prototype.getAdDuration = function() {
    try {
        res = 0;
        if (typeof this.plugin.data.ads.duration != "undefined") {
            res = this.plugin.data.ads.duration;
        } else {
            res = Math.round(this.plugin.adnalyzer.getAdDuration());
        }

        return $YB.utils.parseNumber(res, 0);
    } catch (err) {
        $YB.warn(err);
        return 0;
    }
};

/**
 * Tries to get the ads player version from adnalyzer.getAdPlayerVersion().
 * @return {string} AdPlayerVersion or "".
 */
$YB.api.Info.prototype.getAdPlayerVersion = function() {
    try {
        return this.plugin.adnalyzer.getAdPlayerVersion();
    } catch (err) {
        $YB.warn(err);
        return null;
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
 * @param {$YB.plugins.Generic} plugin The plugin from where it was called.
 */
$YB.api.Ping = function(plugin) {
    try {
        this.plugin = plugin;
        this.interval = 5000;
        this.isRunning = false;
        this.timer = null;

        this.chrono = new $YB.utils.Chrono();

        /** An array of key-value pairs of entities changed to be sent in pings. */
        this.changedEntities = [];

        /** Last rendition sent. */
        this.lastRendition = '';

    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Starts the timer.
 */
$YB.api.Ping.prototype.start = function() {
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
$YB.api.Ping.prototype.stop = function() {
    try {
        this.isRunning = false;
        clearTimeout(this.timer);
    } catch (err) {
        $YB.error(err);
    }
};

$YB.api.Ping.prototype._setPing = function() {
    try {
        if (this.isRunning) {
            this.chrono.start();
            var context = this;
            this.timer = setTimeout(function() {
                context.sendPing({
                    diffTime: context.chrono.stop()
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
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.api.Ping.prototype.sendPing = function(params, callback) {
    try {
        params = params || {};

        // Params
        params.time = typeof params.time != 'undefined' ? params.time : this.plugin.infoApi.getPlayhead();
        params.bitrate = typeof params.bitrate != 'undefined' ? params.bitrate : this.plugin.infoApi.getBitrate();
        params.throughput = typeof params.throughput != 'undefined' ? params.throughput : this.plugin.infoApi.getThroughput();
        params.totalBytes = typeof params.totalBytes != 'undefined' ? params.totalBytes : this.plugin.infoApi.getTotalBytes();
        params.pingTime = typeof params.pingTime != 'undefined' ? params.pingTime : this.plugin.comm.pingTime;

        // Rendition
        var rendition = this.plugin.infoApi.getRendition();
        if (this.lastRendition != rendition) {
            this.sendChangeEntity('rendition', rendition);
            this.lastRendition = rendition;
        }

        // Changed entities
        if (this.changedEntities.length == 1) {
            var ent = this.changedEntities.shift();
            params.entityType = typeof params.entityType != 'undefined' ? params.entityType : ent.key;
            params.entityValue = typeof params.entityValue != 'undefined' ? params.entityValue : ent.value;
        } else if (this.changedEntities.length > 1) {
            var obj = {};
            while (this.changedEntities.length > 0) {
                var ent = this.changedEntities.shift();
                obj[ent.key] = ent.value;
            }

            params.entityValue = typeof params.entityValue != 'undefined' ? params.entityValue : JSON.stringify(obj);
        }

        // Ads
        if (this.plugin.adnalyzer && this.plugin.isShowingAds) {
            params.adPlayhead = typeof params.adPlayhead != 'undefined' ? params.adPlayhead : this.plugin.infoApi.getAdPlayhead();
            params.adBitrate = typeof params.adBitrate != 'undefined' ? params.adBitrate : this.plugin.infoApi.getAdBitrate();
        }

        // Send request
        this.plugin.comm.sendRequest('/ping', params, callback);

    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Queues an entity that would be changed during the next ping.
 * @param {string} key Name of the entity. If the key is already queued to change, it will be overriden. ie: duration, rendition...
 * @param {mixed} value New value.
 */
$YB.api.Ping.prototype.sendChangeEntity = function(key, value) {
    try {
        this.changedEntities.push({ key: key, value: value });
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * @license
 * Youbora VideoApi
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/** VideoApi will help plugin class in the tracking and analyzing the Video events.
 *
 * @class
 * @memberof $YB
 * @param {$YB.plugins.Generic} plugin The plugin from where it was called.
 */
$YB.api.Video = function(plugin) { // constructor
    this.plugin = plugin;

    /** An instance of {@link $YB.utils.Buffer}. */
    this.buffer = new $YB.utils.Buffer(this);

    /** An object with multiples instances of {@link $YB.utils.Chrono}.
     * @prop {$YB.utils.Chrono} seek Chrono for seeks.
     * @prop {$YB.utils.Chrono} pause Chrono for pauses.
     * @prop {$YB.utils.Chrono} joinTime Chrono between start and joinTime.
     * @prop {$YB.utils.Chrono} buffer Reference to this.buffer.chrono
     */
    this.chrono = {
        seek: new $YB.utils.Chrono(),
        pause: new $YB.utils.Chrono(),
        joinTime: new $YB.utils.Chrono(),
        genericAd: new $YB.utils.Chrono(),
        buffer: this.buffer.chrono
    };

    /** Last duration sent. */
    this.lastDuration = 0;
};

/**
 * Sends '/start' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.api.Video.prototype.sendStart = function(params, callback) {
    try {
        if (this.plugin.isStartSent) { // If there's a previous view, close it
            this.sendStop();
        }

        if (this.plugin.data.parseCDNNodeHost || this.plugin.data.parseHLS) {
            this.plugin.resourceParser.init();
        }

        this.plugin.isStartSent = true;

        this.chrono.joinTime.start();
        this.plugin.pingApi.start();

        this._consolidateTitle();

        params = params || {};

        // Params
        params.system = typeof params.system != 'undefined' ? params.system : this.plugin.data.accountCode;
        params.player = typeof params.player != 'undefined' ? params.player : this.plugin.pluginName;
        params.user = typeof params.user != 'undefined' ? params.user : this.plugin.data.username;
        params.transcode = typeof params.transcode != 'undefined' ? params.transcode : this.plugin.data.transactionCode;
        params.hashTitle = typeof params.hashTitle != 'undefined' ? params.hashTitle : this.plugin.data.hashTitle;
        params.referer = typeof params.referer != 'undefined' ? params.referer : (typeof window != 'undefined') ? window.location.href : '';

        // Device
        params.deviceId = typeof params.deviceId != 'undefined' ? params.deviceid : this.plugin.data.device.id;

        // Plugin versioning
        params.pluginVersion = typeof params.pluginVersion != 'undefined' ? params.pluginVersion : this.plugin.pluginVersion;
        params.playerVersion = typeof params.playerVersion != 'undefined' ? params.playerVersion : this.plugin.infoApi.getPlayerVersion();

        // Media
        params.resource = typeof params.resource != 'undefined' ? params.resource : this.plugin.infoApi.getResource();
        params.duration = typeof params.duration != 'undefined' ? params.duration : this.plugin.infoApi.getMediaDuration();
        params.live = typeof params.live != 'undefined' ? params.live : this.plugin.infoApi.getIsLive();
        params.rendition = typeof params.rendition != 'undefined' ? params.rendition : this.plugin.infoApi.getRendition();
        params.title = typeof params.title != 'undefined' ? params.title : this.plugin.infoApi.getTitle();
        params.properties = typeof params.properties != 'undefined' ? params.properties : this.plugin.data.properties;
        params.cdn = typeof params.cdn != 'undefined' ? params.cdn : this.plugin.data.media.cdn;

        // Network
        params.isp = typeof params.isp != 'undefined' ? params.isp : this.plugin.data.network.isp;
        params.ip = typeof params.ip != 'undefined' ? params.ip : this.plugin.data.network.ip;

        // Extra Params
        params.param1 = typeof params.param1 != 'undefined' ? params.param1 : this.plugin.data.extraParams.param1;
        params.param2 = typeof params.param2 != 'undefined' ? params.param2 : this.plugin.data.extraParams.param2;
        params.param3 = typeof params.param3 != 'undefined' ? params.param3 : this.plugin.data.extraParams.param3;
        params.param4 = typeof params.param4 != 'undefined' ? params.param4 : this.plugin.data.extraParams.param4;
        params.param5 = typeof params.param5 != 'undefined' ? params.param5 : this.plugin.data.extraParams.param5;
        params.param6 = typeof params.param6 != 'undefined' ? params.param6 : this.plugin.data.extraParams.param6;
        params.param7 = typeof params.param7 != 'undefined' ? params.param7 : this.plugin.data.extraParams.param7;
        params.param8 = typeof params.param8 != 'undefined' ? params.param8 : this.plugin.data.extraParams.param8;
        params.param9 = typeof params.param9 != 'undefined' ? params.param9 : this.plugin.data.extraParams.param9;
        params.param10 = typeof params.param10 != 'undefined' ? params.param10 : this.plugin.data.extraParams.param10;

        // Ping-related
        params.totalBytes = typeof params.totalBytes != 'undefined' ? params.totalBytes : this.plugin.infoApi.getTotalBytes();
        params.pingTime = typeof params.pingTime != 'undefined' ? params.pingTime : this.plugin.comm.pingTime;

        // Ads
        params.adsExpected = typeof params.adsExpected != 'undefined' ? params.adsExpected : this.plugin.data.ads.expected;

        // CDN Node Host
        if (this.plugin.data.parseCDNNodeHost) {
            params.nodeHost = typeof params.nodeHost != 'undefined' ? params.nodeHost : this.plugin.resourceParser.cdnHost;
            params.nodeType = typeof params.nodeType != 'undefined' ? params.nodeType : this.plugin.resourceParser.cdnType;
        }

        // Resumer
        if (this.plugin.resumeService && this.plugin.data.resumeConfig.enabled) { // If Resume service is enabled
            this.plugin.resumeService.start();
            params.isResumed = this.plugin.resumeService.isResumed;
        }

        // isBalanced
        if (this.plugin.data.isBalanced == 1) {
            params.isBalanced = 1;
        }

        // isResumed
        if (this.plugin.data.isResumed == 1) {
            params.isResumed = 1;
        }

        // Send the request
        this.plugin.comm.nextView(params.live);
        this.plugin.comm.sendRequest('/start', params, callback);
        $YB.notice("Request: NQS /start " + params.resource, 'darkgreen');

        // Save last info sent
        this.lastDuration = params.duration;
    } catch (err) {
        $YB.error(err);
    }
};

$YB.api.Video.prototype._consolidateTitle = function() {
    try {
        if (this.plugin.data.properties.content_metadata) {
            this.plugin.data.properties.content_metadata.title = this.plugin.infoApi.getTitle();
        } else {
            this.plugin.data.properties.content_metadata = {
                title: this.plugin.infoApi.getTitle()
            };
        }
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * Sends '/joinTime' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.api.Video.prototype.sendJoin = function(params, callback) {
    try {
        if (this.plugin.isStartSent && !this.plugin.isJoinSent && (!this.plugin.adnalyzer || !this.plugin.adnalyzer.isAdStartSent)) {
            this.plugin.isJoinSent = true;

            if (this.buffer.autostart) {
                this.buffer.start();
            }

            params = params || {};
            params.time = typeof params.time != 'undefined' ? params.time : this.chrono.joinTime.getDeltaTime();
            params.eventTime = typeof params.eventTime != 'undefined' ? params.eventTime : this.plugin.infoApi.getPlayhead();
            params.mediaDuration = typeof params.mediaDuration != 'undefined' ? params.mediaDuration : this.plugin.infoApi.getMediaDuration();

            // Check duration to send it only once
            if (params.mediaDuration === this.lastDuration) {
                delete params.mediaDuration;
            }

            //Substract preroll time from time
            if (this.plugin.adnalyzer && this.plugin.adnalyzer.adsApi.totalPrerollTime > 0) {
                params.time = params.time - this.plugin.adnalyzer.adsApi.totalPrerollTime;
                if (params.time < 0) params.time = 1;
                this.plugin.adnalyzer.adsApi.totalPrerollTime = 0;
            }

            // Send the request
            this.plugin.comm.sendRequest('/joinTime', params, callback);
            $YB.notice("Request: NQS /joinTime " + params.time + "ms", 'darkgreen');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/stop' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.api.Video.prototype.sendStop = function(params, callback) {
    try {
        if (this.plugin.isStartSent) {
            this.plugin.isStartSent = false;
            this.plugin.isPaused = false;
            this.plugin.isJoinSent = false;
            this.plugin.isSeeking = false;
            this.plugin.isBuffering = false;

            this.plugin.resourceParser.clear();

            this.plugin.pingApi.stop();
            this.buffer.stop();

            if (this.plugin.adnalyzer) {
                this.plugin.adnalyzer.adsApi.resetNumbers();
            }

            params = params || {};
            params.diffTime = typeof params.diffTime != 'undefined' ? params.diffTime : this.plugin.pingApi.chrono.getDeltaTime();

            // Send the request
            this.plugin.comm.sendRequest('/stop', params, callback);
            $YB.notice("Request: NQS /stop", 'darkgreen');

            // If Resume service is enabled
            if ($YB.services.Resume && this.plugin.data.resumeConfig.enabled) {
                this.plugin.resumeService.sendPlayTime();
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * Sends '/pause' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.api.Video.prototype.sendPause = function(params, callback) {
    try {
        if (this.plugin.isJoinSent && !this.plugin.isPaused) {
            this.plugin.isPaused = true;
            this.chrono.pause.start();

            // Send the request
            this.plugin.comm.sendRequest('/pause', params, callback);
            $YB.notice("Request: NQS /pause", 'darkgreen');

            if ($YB.services.Resume && this.plugin.data.resumeConfig.enabled) { // If Resume service is enabled
                this.plugin.resumeService.sendPlayTime();
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * Sends '/resume' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.api.Video.prototype.sendResume = function(params, callback) {
    try {
        if (this.plugin.isJoinSent && this.plugin.isPaused) {
            this.plugin.isPaused = false;
            this.chrono.pause.getDeltaTime();

            // Send the request
            this.plugin.comm.sendRequest('/resume', params, callback);
            $YB.notice("Request: NQS /resume", 'darkgreen');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/** Notifies a buffer start. It will expect a {$YB.api.Video#sendBufferEnd}. */
$YB.api.Video.prototype.sendBufferStart = function() {
    try {
        if (this.plugin.isJoinSent && !this.plugin.isBuffering) {
            this.plugin.isBuffering = true;
            this.chrono.buffer.start();

            $YB.notice("Method: /bufferStart", 'darkgreen');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/bufferUnderrun' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.api.Video.prototype.sendBufferEnd = function(params, callback) {
    try {
        if (this.plugin.isJoinSent && this.plugin.isBuffering) {

            this.plugin.isBuffering = false;

            params = params || {};
            params.duration = typeof params.duration != 'undefined' ? params.duration : this.chrono.buffer.getDeltaTime();
            params.time = typeof params.time != 'undefined' ? params.time : this.plugin.infoApi.getPlayhead();

            if (this.plugin.infoApi.getIsLive() && params.time === 0) {
                params.time = 1; // Buffer does not support 0 in time parameter.
            }

            // Send the request
            this.plugin.comm.sendRequest('/bufferUnderrun', params, callback);
            $YB.notice("Request: NQS /bufferUnderrun " + params.duration + "ms", 'darkgreen');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/error' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.api.Video.prototype.sendError = function(params, callback) {
    try {
        this._consolidateTitle();

        // stop pings and nicebuffer
        this.plugin.pingApi.stop();
        this.buffer.stop();

        params = params || {};

        // Message & Errorcode
        params.msg = typeof params.msg != 'undefined' ? params.msg : 'Unknown Error';
        if (typeof params.errorCode == 'undefined' || parseInt(params.errorCode) < 0) {
            params.errorCode = 9000;
        }

        // Params
        params.system = typeof params.system != 'undefined' ? params.system : this.plugin.data.accountCode;
        params.player = typeof params.player != 'undefined' ? params.player : this.plugin.pluginName;
        params.hashTitle = typeof params.hashTitle != 'undefined' ? params.hashTitle : this.plugin.data.hashTitle;
        params.user = typeof params.user != 'undefined' ? params.user : this.plugin.data.username;
        params.transcode = typeof params.transcode != 'undefined' ? params.transcode : this.plugin.data.transactionCode;
        params.referer = typeof params.referer != 'undefined' ? params.referer : (typeof window != 'undefined') ? window.location.href : '';

        // Device
        params.deviceId = typeof params.deviceId != 'undefined' ? params.deviceid : this.plugin.data.device.id;

        // Plugin versioning
        params.pluginVersion = typeof params.pluginVersion != 'undefined' ? params.pluginVersion : this.plugin.pluginVersion;
        params.playerVersion = typeof params.playerVersion != 'undefined' ? params.playerVersion : this.plugin.infoApi.getPlayerVersion();

        // Media
        params.resource = typeof params.resource != 'undefined' ? params.resource : this.plugin.infoApi.getResource();
        params.duration = typeof params.duration != 'undefined' ? params.duration : this.plugin.infoApi.getMediaDuration();
        params.live = typeof params.live != 'undefined' ? params.live : this.plugin.infoApi.getIsLive();
        params.rendition = typeof params.rendition != 'undefined' ? params.rendition : this.plugin.infoApi.getRendition();
        params.title = typeof params.title != 'undefined' ? params.title : this.plugin.infoApi.getTitle();
        params.properties = typeof params.properties != 'undefined' ? params.properties : this.plugin.data.properties;
        params.cdn = typeof params.cdn != 'undefined' ? params.cdn : this.plugin.data.media.cdn;

        // Network
        params.isp = typeof params.isp != 'undefined' ? params.isp : this.plugin.data.network.isp;
        params.ip = typeof params.ip != 'undefined' ? params.ip : this.plugin.data.network.ip;

        // Extra params
        params.param1 = typeof params.param1 != 'undefined' ? params.param1 : this.plugin.data.extraParams.param1;
        params.param2 = typeof params.param2 != 'undefined' ? params.param2 : this.plugin.data.extraParams.param2;
        params.param3 = typeof params.param3 != 'undefined' ? params.param3 : this.plugin.data.extraParams.param3;
        params.param4 = typeof params.param4 != 'undefined' ? params.param4 : this.plugin.data.extraParams.param4;
        params.param5 = typeof params.param5 != 'undefined' ? params.param5 : this.plugin.data.extraParams.param5;
        params.param6 = typeof params.param6 != 'undefined' ? params.param6 : this.plugin.data.extraParams.param6;
        params.param7 = typeof params.param7 != 'undefined' ? params.param7 : this.plugin.data.extraParams.param7;
        params.param8 = typeof params.param8 != 'undefined' ? params.param8 : this.plugin.data.extraParams.param8;
        params.param9 = typeof params.param9 != 'undefined' ? params.param9 : this.plugin.data.extraParams.param9;
        params.param10 = typeof params.param10 != 'undefined' ? params.param10 : this.plugin.data.extraParams.param10;

        // CDN Node Host
        if (this.plugin.data.parseCDNNodeHost) {
            params.nodeHost = typeof params.nodeHost != 'undefined' ? params.nodeHost : this.plugin.resourceParser.cdnHost;
            params.nodeType = typeof params.nodeType != 'undefined' ? params.nodeType : this.plugin.resourceParser.cdnType;
        }

        // Resumer
        if ($YB.services.Resume && this.plugin.data.resumeConfig.enabled) { // If Resume service is enabled
            this.plugin.resumeService.start();
            params.isResumed = this.plugin.resumeService.isResumed;
        }

        // isBalanced
        if (this.plugin.data.isBalanced == 1) {
            params.isBalanced = 1;
        }

        // isResumed
        if (this.plugin.data.isResumed == 1) {
            params.isResumed = 1;
        }

        // Send the request
        this.plugin.comm.sendRequest('/error', params, callback);
        $YB.notice("Request: NQS /error " + params.msg, 'darkgreen');
    } catch (err) {
        $YB.error(err);
    }
};

/** Notifies a seek start. It will expect a {$YB.api.Video#sendSeekEnd}. */
$YB.api.Video.prototype.sendSeekStart = function() {
    try {
        if (this.plugin.isJoinSent && !this.plugin.isSeeking) {
            this.plugin.isSeeking = true;
            this.chrono.seek.start();

            $YB.notice("Method: /seekStart", 'darkgreen');

        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/seek' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.api.Video.prototype.sendSeekEnd = function(params, callback) {
    try {
        if (this.plugin.isJoinSent && this.plugin.isSeeking) {
            this.plugin.isSeeking = false;

            params = params || {};
            params.duration = typeof params.duration != 'undefined' ? params.duration : this.chrono.seek.getDeltaTime();
            params.time = typeof params.time != 'undefined' ? params.time : this.plugin.infoApi.getPlayhead();

            // Send the request
            this.plugin.comm.sendRequest('/seek', params, callback);
            $YB.notice("Request: NQS /seek " + params.duration + "ms", 'darkgreen');
        }
    } catch (err) {
        $YB.error(err);
    }
};


/** Notifies a Generic Ad start. It will expect a {$YB.api.Video#sendGenericAdEnd}. */
$YB.api.Video.prototype.sendGenericAdStart = function() {
    try {
        if (this.plugin.adnalyzer) {
            $YB.warn('Generic Ads are disabled if an adnalyzer module is loaded.')
        } else {
            if (this.plugin.isStartSent && !this.plugin.isShowingAds) {
                this.plugin.isShowingAds = true;
                this.chrono.genericAd.start();

                this.sendBufferEnd();
                this.sendSeekEnd();


                $YB.notice("Method: /genericAdStart", 'darkgreen');
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/** Notifies a Generic Ad stop.*/
$YB.api.Video.prototype.sendGenericAdEnd = function() {
    try {
        if (this.plugin.adnalyzer) {
            $YB.warn('Generic Ads are disabled if an adnalyzer module is loaded.')
        } else {
            if (this.plugin.isStartSent && this.plugin.isShowingAds) {
                this.plugin.isShowingAds = false;
                this.chrono.genericAd.stop();

                if (!this.plugin.isJoinSent) { // Remove ad time from joinTime
                    this.chrono.joinTime.startTime += this.chrono.genericAd.getDeltaTime();
                    this.chrono.joinTime.startTime = Math.min(this.chrono.joinTime.startTime, new Date().getTime());
                }

                $YB.notice("Method: /genericAdEnd " + this.chrono.genericAd.getDeltaTime() + "ms", 'darkgreen');
            }
        }
    } catch (err) {
        $YB.error(err);
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
 * @private
 * @memberof $YB
 * @param {string} host URL of the request. ie: nqs.nice264.com
 * @param {string} [service] Name of the service. ie '/start'
 * @param {(string|Object)} [params] String of params. Skip '?' at start. ie: 'system=nicetv&user=user'.
 * @param {Object} [options] Object with custom options.
 * @param {string} [options.method=GET] Specifies the method of the request ie: "GET", "POST", "HEAD".
 * @param {string} [options.requestHeaders] A literal with options of requestHeaders. ie: {header: value}.
 * @param {number} [options.retryAfter=5000] Time in ms before sending a failed request again. 0 to disable.
 * @param {number} [options.maxRetries=3] Max number of retries. 0 to disable.
 */
$YB.comm.AjaxRequest = function(host, service, params, options) {
    try {
        this.xhr = this.createXHR(); // new xhrRequest();
        this.host = host;
        this.service = service || "";
        this.params = params;
        this.options = options || {};
        this.options.method = this.options.method || $YB.comm.AjaxRequest.options.method;
        this.options.maxRetries = this.options.maxRetries || $YB.comm.AjaxRequest.options.maxRetries;

        if (typeof this.options.retryAfter == 'undefined') {
            this.options.retryAfter = $YB.comm.AjaxRequest.options.retryAfter;
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
$YB.comm.AjaxRequest.options = {
    method: 'GET',
    requestHeaders: {},
    maxRetries: 3,
    retryAfter: 5000
};

/** Returns the complete url of the request. */
$YB.comm.AjaxRequest.prototype.getUrl = function() {
    try {
        return this.host + this.service + this.getParams();
    } catch (err) {
        $YB.error(err);
    }
};

/** Returns the params of the request, stringified. ie: '?pluginVersion=5.1.0&systemCode=nicetv'. */
$YB.comm.AjaxRequest.prototype.getParams = function() {
    try {
        switch (typeof this.params) {
            case "object":
                return "?" + this._parseParams(this.params);
            case "string":
                if (this.params) {
                    return "?" + this.params;
                }
                return "";
            default:
                return "";
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Add or set a parameter for the request. ie: if you want to add 'username=user' use setParam('username', 'user').
 * @param {string} key Name of the paremeter.
 * @param {string} value Name of the paremeter.
 * @return Returns AjaxRequest object.
 */
$YB.comm.AjaxRequest.prototype.setParam = function(key, value) {
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
 * @return {$YB.comm.AjaxRequest} Returns current request item.
 */
$YB.comm.AjaxRequest.prototype.on = function(event, callback) {
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
 * @return {$YB.comm.AjaxRequest} Returns current request item.
 * @see {@link $YB.comm.AjaxRequest#on}
 */
$YB.comm.AjaxRequest.prototype.load = function(callback) {
    return this.on('load', callback);
};

/**
 * Adds a callback to 'error' event
 *
 * @param {function} [callback] Callback function to call whenever HTTPRequest returns the event.
 * @return {$YB.comm.AjaxRequest} Returns current request item.
 * @see {@link $YB.comm.AjaxRequest#on}
 */
$YB.comm.AjaxRequest.prototype.error = function(callback) {
    return this.on('error', callback);
};

/**
 * Send the request.
 *
 * @return returns xhrRequest.send().
 */
$YB.comm.AjaxRequest.prototype.send = function() {
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
                    $YB.warn("Error: Request failed. Retry " + that.retries + " of " + that.options.maxRetries + " in " + that.options.retryAfter + "ms.");

                    setTimeout(function() {
                        that.xhr.removeEventListener("error", genericError);
                        that.send();
                    }, that.options.retryAfter);
                }
            });
        }

        if ($YB.debugLevel >= 5) {
            $YB.requestLog("XHR Req: " + this.getUrl(), 'navy');
        }

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
$YB.comm.AjaxRequest.prototype.createXHR = function() {
    try {
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        } else {
            return new ActiveXObject("Microsoft.XMLHTTP");
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
$YB.comm.AjaxRequest.prototype.getXHR = function() {
    return this.xhr;
};

/**
 * Will transform an object of params into a url string.
 *
 * @private
 * @param params An object with the params of the call.
 * @return Return the param chunk. ie: system=nicetv&user=user.
 */
$YB.comm.AjaxRequest.prototype._parseParams = function(params) {
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
 * Youbora Communication
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Youbora Communication implements the last abstraction layer against NQS requests.
 * Internally, Communication implements an array of $YB.comm.AjaxRequest objects, executing one after another.
 * All requests will be blocked until a first /data call is made, before context, any request sent will be queued.
 *
 * @class
 * @private
 * @memberof $YB
 * @param {$YB.plugins.Generic} plugin The plugin from where it was called.
 */
$YB.comm.Communication = function(plugin) {
    try {
        /** Reference to the {@link $YB.plugins.Generic|plugin} from where it was called. */
        this.plugin = plugin;

        /** The host of the requests. Got from {@link $YB.data.Options|this.plugin.data.service}. */
        this.host = plugin.data.service;

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
$YB.comm.Communication.prototype.getViewCode = function() {
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
$YB.comm.Communication.prototype.nextView = function(isLive) {
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
$YB.comm.Communication.prototype.requestData = function(params, callback) {
    try {
        params = params || {};
        params.outputformat = 'jsonp';
        delete params.code;
        var context = this,
            ajax = new $YB.comm.AjaxRequest(this._parseServiceHost(this.host), '/data', params);

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
$YB.comm.Communication.prototype.receiveData = function(ajax) {
    try {
        var response = ajax.getXHR().response,
            msg = JSON.parse(response.slice(response.indexOf('(') + 1, response.lastIndexOf(')'))),
            host = msg.q.h, // Host
            code = msg.q.c, // Code
            pt = msg.q.pt, // Ping time interval in seconds
            //tc: msg.q.tc, // Transaction code
            //t: msg.q.t // Test
            balancer = msg.q.b; // 1 = Balancer enabled

        if (host.length > 0 &&
            code.length > 0 &&
            pt.length > 0 &&
            balancer.length > 0
        ) {
            this.prefix = code.slice(0, 1);
            this.code = code.slice(1);
            this.host = host;
            this.pingTime = pt;
            this.plugin.pingApi.interval = this.pingTime * 1000;
            this.balancerEnabled = balancer;

            $YB.notice('FastData \'' + code + '\' is ready.', 'darkgreen');

            // Move requests from 'nocode' to the proper queue
            if (this._requests.nocode && this._requests.nocode.length > 0) {
                this._requests[this.getViewCode()] = this._requests.nocode;
                delete this._requests.nocode;
            }

            // Everything is ok, start sending requests
            this.removePreloader('FastData');
        } else {
            $YB.error('Error: FastData response is wrong.');
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
$YB.comm.Communication.prototype.sendRequest = function(service, params, callback) {
    try {
        if (this.isAllowed(service)) {
            params = params || {};
            delete params.code;
            var ajax = new $YB.comm.AjaxRequest('', service, params);
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
$YB.comm.Communication.prototype.sendService = function(service, params, callback) {
    try {
        var ajax = new $YB.comm.AjaxRequest(this._parseServiceHost(service), '', params);
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
$YB.comm.Communication.prototype.isAllowed = function(srv) {
    return (this.plugin.data.enableAnalytics && !(srv in this.plugin.data.disabledRequests));
};

/**
 * Adds a preloader to the queue. While this queue is not empty, all requests will be stoped.
 * Remember to call removePreloader to unblock the main queue
 *
 * @param {string} key Unique identifier of the blocker. ie: 'CDNParser'.
 */
$YB.comm.Communication.prototype.addPreloader = function(key) {
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
$YB.comm.Communication.prototype.removePreloader = function(key) {
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

                        // Replace resource parser discoveries
                        if (typeof ajax.params.resource != "undefined" && this.plugin.resourceParser.realResource) {
                            ajax.params.resource = this.plugin.resourceParser.realResource; // If realresource was fetched, use it.
                        }
                        if (typeof ajax.params.nodeHost != "undefined" && this.plugin.resourceParser.nodeHost) {
                            ajax.params.nodeHost = this.plugin.resourceParser.nodeHost;
                            ajax.params.nodeType = this.plugin.resourceParser.nodeType;
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
$YB.comm.Communication.prototype._registerRequest = function(request) {
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
$YB.comm.Communication.prototype._sendRequests = function() {
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
$YB.comm.Communication.prototype._parseServiceHost = function(url) {
    try {
        // Service
        if (url.indexOf('//') === 0) {
            url = url.slice(2);
        } else if (url.indexOf('http://') === 0) {
            url = url.slice(7);
        } else if (url.indexOf('https://') === 0) {
            url = url.slice(8);
        }

        if (this.plugin.data.httpSecure === true) {
            url = 'https://' + url;
        } else if (window.location.protocol.indexOf('http') === 0) {
            url = '//' + url;
        } else {
            url = 'http://' + url;
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
 * @memberof $YB.data
 * @param {(Object|$YB.data.Options)} [options] A literal or another Data containing values.
 */
$YB.data.Options = function(options) { // constructor
    try {
        this.setOptions(options);
    } catch (err) {
        $YB.error(err);
    }
};

$YB.data.Options.prototype = {
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
     * @default false
     */
    parseCDNNodeHost: false,
    /**
     * This boolean parameter is an anti-resource collision system.
     * @type {boolean}
     * @default true
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
     * @default nicetest
     */
    accountCode: "nicetest",
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
     * Set to 1 if the content was resumed.
     * @type {number}
     * @default 0
     */
    isResumed: 0,

    /**
     * Item containing network info.
     * @type {object}
     * @prop {string} [network.ip] IP of the viewer/user. ie: '100.100.100.100'.
     * @prop {string} [network.isp] Name of the internet service provider of the viewer/user.
     */
    network: {
        ip: undefined,
        isp: undefined
    },

    /**
     * Item containing device information.
     * @type {object}
     * @prop {string} [device.id] Youbora ID of the device. If specified, it will rewrite info gotten from user agent.
     */
    device: {
        id: undefined
    },

    // Media Info
    /**
     * Item containing media info. All the info specified here will override the info gotten from the player.
     * @type {object}
     * @prop {boolean} [media.isLive] True if the content is live, false if VOD.
     * @prop {string} [media.resource] URL/path of the current media resource.
     * @prop {string} [media.title] Title of the media.
     * @prop {number} [media.duration] Duration of the media.
     * @prop {string} [media.cdn] Codename of the CDN where the content is streaming from. ie: AKAMAI
     */
    media: {
        isLive: undefined,
        resource: undefined,
        title: undefined,
        duration: undefined,
        cdn: undefined
    },

    // Ad Info
    /**
     * Item containing ads info. All the info specified here will override the info gotten from the Ads player.
     * @type {object}
     * @prop {boolean} [ads.expected] Change it to true when ads are expected in the current video stream. It will be sent in /start call.
     * @prop {string} [ads.resource] URL/path of the current ads resource or the ads server petition.
     * @prop {string} [ads.title] Title of the ad.
     * @prop {string} [ads.position] Either 'pre', 'mid' or 'post'.
     * @prop {string} [ads.campaign] Name of the ad campaign.
     * @prop {number} [ads.duration] Duration of the ad.
     */
    ads: {
        expected: false,
        resource: undefined,
        campaign: undefined,
        title: undefined,
        position: undefined,
        duration: undefined,
    },

    // properties
    /**
     * Item containing mixed extra information about the view, like the director, the parental rating, device info or the audio channels.
     * This object can contain any variable or can implement any structure.
     * @type {object}
     */
    properties: {
        contentId: undefined,
        type: undefined,
        transaction_type: undefined,
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
        audioChannels: undefined,
        device: undefined,
        quality: undefined
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
 * Youbora API
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * This class is the generic adnalyzers from which specifics adnalyzers will extend.
 * Internally, it coordinates AdsApi and its flags.
 *
 * @class Generic
 * @since  5.1.02
 * @memberof $YB.adnalyzers
 */
$YB.adnalyzers.Generic = function() {};

$YB.adnalyzers.Generic.prototype = {
    /** Version of the plugin. ie: 1.0.0-name */
    adnalyzerVersion: '1.0.0-GENERIC',

    /** Reference to the ads player. */
    ads: undefined,
    /** Reference to the main plugin */
    plugin: undefined,

    /** An instance of {@link $YB.api.Ads}. */
    adsApi: undefined,


    /** Flag when Ads Start has been sent */
    isAdStartSent: false,
    /** Flag when Join has been sent */
    isAdJoinSent: false,
    /** Flag when Ad is paused. */
    isAdPaused: false,
    /** Flag when Ad is buffering */
    isAdBuffering: false,
};

/**
 * Instantiates the adnalyzer libraries.
 *
 * @param {(object)} plugin The main youbora plugin from where it is instantiated.
 * @param {(object)} [ads] The object sending ads. ie: this.plugin.player.ima.
 * @return {Object} Returns the ads player object.
 */
$YB.adnalyzers.Generic.prototype.init = function(plugin, ads) {
    try {
        $YB.notice("Adnalyzer " + this.adnalyzerVersion + " is ready.");

        // Save the main plugin.
        this.plugin = plugin;

        // Save the ads plugin
        this.ads = ads;

        // Instantiate Objects
        this.adsApi = new $YB.api.Ads(this);

        return this.ads;
    } catch (err) {
        $YB.error(err);
        return null;
    }
}


/**
 * Starts Nicebuffer in ads API.
 */
$YB.adnalyzers.Generic.prototype.startAutobuffer = function() {
    if (this.plugin.data.enableNiceBuffer) {
        this.adsApi.buffer.autostart = true;
    }
};

/**
 * This function must be called when a new ad starts loading.
 * @see $YB.api.Ads#sendAdStart
 */
$YB.adnalyzers.Generic.prototype.playAdHandler = function(options) {
    try {
        if (!this.isAdStartSent) {
            this.plugin.setOptions(options);
            this.adsApi.sendAdStart();
        }
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * This function must be called when a new ad starts. It will /adStart + /adJoinTime. If there was a bufferUnderrun running before this call, its time will be used as joinTime.
 * @see $YB.api.Ads#sendAdStart
 * @see $YB.api.Ads#sendAdJoin
 */
$YB.adnalyzers.Generic.prototype.startJoinAdHandler = function(options) {
    try {
        if (!this.isAdStartSent) {
            this.plugin.setOptions(options);
            this.adsApi.sendAdStart();

            // Use buffer clock to calculate joinTime in midrolls
            if (this.plugin.isBuffering) {
                this.adsApi.chrono.joinTime.startTime = this.plugin.videoApi.chrono.buffer.startTime;
                this.plugin.isBuffering = false;
            }

            this.adsApi.sendAdJoin();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video starts playing for the first time. If playingAdHandler is used, this function is not needed.
 * @see $YB.adsApi#sendAdJoin
 */
$YB.adnalyzers.Generic.prototype.joinAdHandler = function() {
    try {
        this.adsApi.sendAdJoin();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video is paused.
 * @see $YB.api.Ads#sendAdPause
 */
$YB.adnalyzers.Generic.prototype.pauseAdHandler = function() {
    try {
        this.adsApi.sendAdPause();
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * This function must be called when a button of pause/resume is pressed.
 * @see $YB.api.Ads#sendAdPause
 * @see $YB.api.Ads#sendAdResume
 */
$YB.adnalyzers.Generic.prototype.pauseToggleAdHandler = function() {
    try {
        if (this.isAdPaused) {
            this.adsApi.sendAdResume();
        } else {
            this.adsApi.sendAdPause();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video is resumed from a pause. If playingAdHandler is used, this function is not needed.
 * @see $YB.api.Ads#sendAdResume
 */
$YB.adnalyzers.Generic.prototype.resumeAdHandler = function() {
    try {
        this.adsApi.sendAdResume();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video has ended.
 * @see $YB.adsApi#sendAdStop
 */
$YB.adnalyzers.Generic.prototype.endedAdHandler = function() {
    try {
        this.adsApi.sendAdStop();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video has been stoped.
 * @see $YB.adsApi#sendAdStop
 */
$YB.adnalyzers.Generic.prototype.skipAdHandler = function() {
    try {
        this.adsApi.sendAdStop({ skipped: true });
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video starts a buffer underrun.
 * @see $YB.adsApi#sendAdBufferStart
 */
$YB.adnalyzers.Generic.prototype.bufferingAdHandler = function() {
    try {
        this.adsApi.sendAdBufferStart();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video ends buffering. If playingAdHandler is used, this function is not needed.
 * @see $YB.adsApi#sendAdBufferEnd
 */
$YB.adnalyzers.Generic.prototype.bufferedAdHandler = function() {
    try {
        if (this.isAdStartSent) {
            if (!this.isAdJoinSent) {
                this.adsApi.sendAdJoin();
            } else if (this.isAdBuffering) {
                this.adsApi.sendAdBufferEnd();
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};



/**
 * Override this function to return ad resource.
 * @return {string} ""
 */
$YB.adnalyzers.Generic.prototype.getAdResource = function() {
    return "unknown";
};


/**
 * Override this function to return ad playhead of the media. If null is returned, this class will be ignored.
 * @return {number} null
 */
$YB.adnalyzers.Generic.prototype.getMediaPlayhead = function() {
    return null;
};

/**
 * Override this function to return ad playhead.
 * @return {number} 0
 */
$YB.adnalyzers.Generic.prototype.getAdPlayhead = function() {
    return 0;
};


/**
 * Override this function to return ad position pre/mid/post/unknown.
 * @return {string} "unknown"
 */
$YB.adnalyzers.Generic.prototype.getAdPosition = function() {
    return 'unknown';
};

/**
 * Override this function to return ad title.
 * @return {string} ""
 */
$YB.adnalyzers.Generic.prototype.getAdTitle = function() {
    return null;
};

/**
 * Override this function to return ad duration.
 * @return {number} ""
 */
$YB.adnalyzers.Generic.prototype.getAdDuration = function() {
    return 0;
};

/**
 * Override this function to return ad bitrate.
 * @return {number} -1
 */
$YB.adnalyzers.Generic.prototype.getAdBitrate = function() {
    return -1;
};

/**
 * Override this function to return ad player version.
 * @return {string} ""
 */
$YB.adnalyzers.Generic.prototype.getAdPlayerVersion = function() {
    return null;
};

/**
 * @license
 * Youbora API
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * This class is the generic plugin from which specifics plugins will extend.
 * Internally, it coordinates a number of inner components like AdsApi, VideoApi, Communications, Chrono, ResourceParser, Resumer, ConcurrencyChecker...
 *
 * @class Generic
 * @since  5.1
 * @memberof $YB.plugins
 */
$YB.plugins.Generic = function() {};

$YB.plugins.Generic.prototype = {
    /** Name and platform of the plugin.*/
    pluginName: 'GENERIC',
    /** Version of the plugin. ie: 5.1.0-name */
    pluginVersion: '5.1.0-GENERIC',

    /** Unique identifier of the player, usually asociated with the ID of the tag. */
    playerId: 'generic',
    /** Reference to the player tag */
    player: undefined,
    /** Reference to the video/object tag, could be the same as the player. */
    tag: undefined,

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
    /** Flag when there are ads showing. */
    isShowingAds: false,

    /** Instance of {$YB.data.Options}. Each playerId will have the same data object. If two or more plugins share playerId, they will also share data object. */
    data: undefined,
    /** An instance of {@link $YB.api.Info}. */
    infoApi: undefined,
    /** An instance of {@link $YB.api.Video}. */
    videoApi: undefined,
    /** An instance of {@link $YB.api.Ping}. */
    pingApi: undefined,
    /** An instance of {@link $YB.comm.Communication}. */
    comm: undefined,
    /** An instance inherited from  {@link $YB.adnalyzers.Generic}. */
    adnalyzer: undefined,

    /** An instance of {@link $YB.services.Resource}. */
    resourceParser: undefined,
    /** An instance of {@link $YB.services.Concurrency}. */
    concurrencyService: undefined,
    /** An instance of {@link $YB.services.Resume}. */
    resumeService: undefined,
    /** An instance of {@link $YB.services.Smartswitch}. */
    smartswitchService: undefined
};

/**
 * Instantiates the plugin libraries.
 *
 * @param {(string|object)} player Either the player object or the unique identifier of the player, usually asociated with the ID tag of the DOM.
 * @param {Object} [options] {@link $YB.data.Options |Youbora Data} initial values.
 * @return {Object} Returns the player object.
 */
$YB.plugins.Generic.prototype.init = function(player, options) {
    try {
        $YB.notice("Plugin " + this.pluginVersion + " (with YouboraJS " + $YB.version + ") is ready.");

        if (typeof player == "string") {
            this.playerId = player;
            this.player = document.getElementById(player);
        } else {
            this.player = player;
            if (player && player.id) {
                this.playerId = player.id;
            }
        }

        // Save reference of the tag. If it is different, specific plugins have to overwrite it.
        this.tag = this.player;

        // Instantiate Objects
        this.data = new $YB.data.Options(options);
        this.infoApi = new $YB.api.Info(this);
        this.videoApi = new $YB.api.Video(this);
        this.pingApi = new $YB.api.Ping(this);
        this.comm = new $YB.comm.Communication(this);

        // Instantiate Services
        this.resourceParser = new $YB.services.ResourceParser(this);
        if (this.data.concurrencyConfig.enabled) {
            if ($YB.services.Concurrency) {
                this.concurrency = new $YB.services.Concurrency(this);
            } else {
                $YB.warning("Concurrecy Service is enabled but library was not found. Try to include 'services.js'.")
            }
        }
        if (this.data.resumeConfig.enabled) {
            if ($YB.services.Resume) {
                this.resume = new $YB.services.Resume(this);
            } else {
                $YB.warning("Resume Service is enabled but library was not found. Try to include 'services.js'.")
            }
        }
        if (this.data.smartswitchConfig.enabled) {
            if ($YB.services.Smartswitch) {
                this.smartswitch = new $YB.services.Smartswitch(this);
            } else {
                $YB.warning("Smartswitch Service is enabled but library was not found. Try to include 'services.js'.")
            }
        }

        // Send /data request
        this.comm.requestData({
            system: this.data.accountCode,
            pluginVersion: this.pluginVersion,
            targetDevice: this.pluginName,
            live: this.data.media.isLive
        });

        return this.player;

    } catch (err) {
        $YB.error(err);
        return null;
    }
}

/**
 * Starts Nicebuffer in video APIs.
 */
$YB.plugins.Generic.prototype.startAutobuffer = function() {
    if (this.data.enableNiceBuffer) {
        this.videoApi.buffer.autostart = true;
    }
};

/**
 * This function must be called when a new video starts loading.
 * @see $YB.api.Video#sendStart
 */
$YB.plugins.Generic.prototype.playHandler = function(options) {
    try {
        if (!this.isStartSent) {
            this.setOptions(options);
            this.videoApi.sendStart();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when video changes in a playlist.
 * @see $YB.api.Video#sendStart
 */
$YB.plugins.Generic.prototype.videoChangeHandler = function(options) {
    try {
        this.setOptions(options);
        this.videoApi.sendStart();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video starts playing for the first time. If playingHandler is used, this function is not needed.
 * @see $YB.api.Video#sendJoin
 */
$YB.plugins.Generic.prototype.joinHandler = function() {
    try {
        this.videoApi.sendJoin();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video starts playing (either for the first time or arfter a pause, seek or buffer).
 * @see $YB.api.Video#sendStart
 * @see $YB.api.Video#sendResume
 * @see $YB.api.Video#sendSeekEnd
 * @see $YB.api.Video#sendBufferEnd
 */
$YB.plugins.Generic.prototype.playingHandler = function() {
    try {
        if (this.isStartSent) {
            if (!this.isJoinSent) {
                this.videoApi.sendJoin();
            } else if (this.isSeeking && this.isPaused) {
                this.videoApi.sendSeekEnd();
                this.videoApi.sendResume();
            } else if (this.isSeeking) {
                this.videoApi.sendSeekEnd();
            } else if (this.isBuffering) {
                this.videoApi.sendBufferEnd();
            } else if (this.isPaused) {
                this.videoApi.sendResume();
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video is paused.
 * @see $YB.api.Video#sendPause
 */
$YB.plugins.Generic.prototype.pauseHandler = function() {
    try {
        this.videoApi.sendPause();
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * This function must be called when a button of pause/resume is pressed.
 * @see $YB.api.Video#sendPause
 * @see $YB.api.Video#sendResume
 */
$YB.plugins.Generic.prototype.pauseToggleHandler = function() {
    try {
        if (this.isPaused) {
            this.videoApi.sendResume();
        } else {
            this.videoApi.sendPause();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video is resumed from a pause. If playingHandler is used, this function is not needed.
 * @see $YB.api.Video#sendResume
 */
$YB.plugins.Generic.prototype.resumeHandler = function() {
    try {
        this.videoApi.sendResume();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video has ended.
 * @see $YB.api.Video#sendStop
 */
$YB.plugins.Generic.prototype.endedHandler = function() {
    try {
        this.videoApi.sendStop();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video has been stoped.
 * @see $YB.api.Video#sendStop
 */
$YB.plugins.Generic.prototype.stopHandler = function() {
    try {
        this.videoApi.sendStop();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video throws an error.
 * In case you could not find a code, send only the message.
 * In case you can not get an error message you should create your own message.
 * @see $YB.api.Video#sendError
 * @param code Error code
 * @param msg Error message.
 */
$YB.plugins.Generic.prototype.errorHandler = function(code, msg) {
    try {
        if (typeof code == "undefined") {
            code = 0;
        }
        msg = msg || code || 'Unknown error';

        this.videoApi.sendError({
            errorCode: code,
            msg: msg
        });
        //this.videoApi.sendStop();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video starts a seek.
 * @see $YB.api.Video#sendSeekStart
 */
$YB.plugins.Generic.prototype.seekingHandler = function() {
    try {
        if (this.isBuffering) {
            this.videoApi.chrono.seek.startTime = this.videoApi.chrono.buffer.startTime;
            this.videoApi.chrono.seek.lastTime = 0;

            this.videoApi.chrono.buffer.stop();
            this.isBuffering = false;
            this.isSeeking = true;
        } else {
            this.videoApi.sendSeekStart();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video ends Seeking. If playingHandler is used, this function is not needed.
 * @see $YB.api.Video#sendSeekEnd
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.seekedHandler = function() {
    try {
        this.videoApi.sendSeekEnd();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video starts a buffer underrun.
 * @see $YB.api.Video#sendBufferStart
 */
$YB.plugins.Generic.prototype.bufferingHandler = function() {
    try {
        if (!this.isSeeking) {
            this.videoApi.sendBufferStart();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video ends buffering. If playingHandler is used, this function is not needed.
 * @see $YB.api.Video#sendBufferEnd
 */
$YB.plugins.Generic.prototype.bufferedHandler = function() {
    try {
        if (this.isStartSent) {
            if (!this.isJoinSent) {
                this.videoApi.sendJoin();
            } else if (this.isSeeking) {
                this.videoApi.sendSeekEnd();
            } else if (this.isBuffering) {
                this.videoApi.sendBufferEnd();
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when an ad starts. If you are using adnalyzer modules, this function won't work.
 * @see $YB.api.Video#sendSeekStart
 */
$YB.plugins.Generic.prototype.genericAdStartHandler = function() {
    try {
        this.videoApi.sendGenericAdStart();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when an ad ends. If you are using adnalyzer modules, this function won't work.
 * @see $YB.api.Video#sendSeekEnd
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.genericAdEndHandler = function() {
    try {
        this.videoApi.sendGenericAdEnd();
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * Changes the $YB.data.Options options.
 * @see $YB.data.Options#setOptions
 */
$YB.plugins.Generic.prototype.setOptions = function(options) {
    try {
        this.data.setOptions(options);
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Returns $YB.data.Options options.
 * @returns $YB.data.Options
 * @see $YB.data.Options
 */
$YB.plugins.Generic.prototype.getOptions = function() {
    try {
        return this.data || {};
    } catch (err) {
        $YB.error(err);
        return {};
    }
};


/**
 * Override this function to return resource.
 * @return {string} "unknown".
 */
$YB.plugins.Generic.prototype.getResource = function() {
    return "unknown";
};

/**
 * Override this function to return resource.
 * @return {string} 0.
 */
$YB.plugins.Generic.prototype.getPlayhead = function() {
    return 0;
};

/**
 * Override this function to return resource.
 * @return {number} 0.
 */
$YB.plugins.Generic.prototype.getMediaDuration = function() {
    return 0;
};

/**
 * Override this function to return resource.
 * @return {bool} false.
 */
$YB.plugins.Generic.prototype.getIsLive = function() {
    return false;
};

/**
 * Override this function to return resource.
 * @return {string} "".
 */
$YB.plugins.Generic.prototype.getRendition = function() {
    return null;
};

/**
 * Override this function to return bitrate.
 * @return {number} -1.
 */
$YB.plugins.Generic.prototype.getBitrate = function() {
    return -1;
};

/**
 * Override this function to return throughput.
 * @return {number} -1.
 */
$YB.plugins.Generic.prototype.getThroughput = function() {
    return -1;
};

/**
 * Override this function to return player version.
 * @return {string} "".
 */
$YB.plugins.Generic.prototype.getPlayerVersion = function() {
    return null;
};

/**
 * Override this function to return totalbytes.
 * @return {number} null.
 */
$YB.plugins.Generic.prototype.getTotalBytes = function() {
    return null;
};

/**
 * Override this function to return media title.
 * @return {string} "".
 */
$YB.plugins.Generic.prototype.getTitle = function() {
    return null;
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
 * @param {$YB.plugins.Generic} plugin The plugin from where it was called.

 */
$YB.services.ResourceParser = function(plugin) {
    try {
        this.plugin = plugin;
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
        this.plugin.comm.addPreloader('services.ResourceParser');

        // Abort operation after 3s
        var context = this;
        this.parseTimeout = setTimeout(function() {
            if ('services.ResourceParser' in context.plugin.comm.preloaders) {
                context.realResource = context.plugin.infoApi.getResource();
                context.plugin.comm.removePreloader('services.ResourceParser');
                $YB.warn('ResourceParser has exceded the maximum execution time (3s) and will be aborted.');
            }
        }, 3000);

        // Start processing
        this.realResource = this.plugin.infoApi.getResource();
        if (this.plugin.data.parseHLS) {
            this._parseRealResourceAsync(this.realResource);
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
};

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
                new $YB.comm.AjaxRequest(res).load(function() {
                        context._parseRealResourceAsync(this.responseText, res); //In this plugin, this referes to the XHR.
                    }).error(function() {
                        context._parseCDNAsync();
                    })
                    .send();
            } else { // It is mp4 or ts...
                this.realResource = res;
                this._parseCDNAsync();
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
        if (this.plugin.data.parseCDNNodeHost) {
            if (this.cdns.length > 0 && !this.nodeHost) { // if there's CDN remaining in the pool and host has not been retrieved...
                var cdn = this.cdns.shift();
                if (typeof $YB.services.ResourceParser.cdnsAvailable[cdn] != 'undefined') {

                    var config = $YB.services.ResourceParser.cdnsAvailable[cdn],
                        headers = JSON.stringify(config.headers);

                    if (this.cdnRequests.hasOwnProperty(headers)) {
                        this._parseNode(config.parsers, this.cdnRequests[headers]);
                    } else {
                        var context = this;

                        var ajax = new $YB.comm.AjaxRequest(this.realResource, '', '', {
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
                this.plugin.comm.removePreloader('services.ResourceParser');
            }
        } else {
            this.plugin.comm.removePreloader('services.ResourceParser');
        }
    } catch (err) {
        $YB.error(err);
    }
};

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
 * Youbora Buffer
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * This class automatically calculates buffers, checking incoherence between playhead of the video and the time spent.
 * If you want to calculate the buffers manually, do not use this class.
 *
 * @class
 * @memberof $YB
 * @param {Object} api The api from where it was called.
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

        if (api instanceof $YB.api.Video) {
            this.isAd = false;
        } else if (api instanceof $YB.api.Ads) {
            this.isAd = true;
        }

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
            var context = this;
            this.lastPlayhead = 0;
            this.chrono.start();
            this.timer = setInterval(function() {
                try {
                    if (!context.isAd) {
                        context._checkBuffer();
                    } else {
                        context._checkAdBuffer();
                    }
                } catch (err) {
                    $YB.error(err);
                }
            }, this.options.interval);
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
 * Asynchronus call to check buffer status
 * @private
 */
$YB.utils.Buffer.prototype._checkBuffer = function() {
    try {
        if (this.api.plugin.isJoinSent && !this.api.plugin.isPaused && !this.api.plugin.isSeeking && !this.api.plugin.isShowingAds) {
            var api = this.api;

            this._checkPlayhead(this.api.plugin.infoApi.getPlayhead(), this.api.plugin.isBuffering, function() {
                api.sendBufferStart()
            }, function() {
                api.sendBufferEnd();
            });
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Asynchronus call to check Ad buffer status
 * @private
 */
$YB.utils.Buffer.prototype._checkAdBuffer = function() {
    try {
        if (this.api.adnalyzer.isAdJoinSent && !this.api.adnalyzer.isAdPaused) {
            var api = this.api;

            this._checkPlayhead(this.api.adnalyzer.plugin.infoApi.getAdPlayhead(), this.api.adnalyzer.isAdBuffering, function() {
                api.sendAdBufferStart()
            }, function() {
                api.sendAdBufferEnd();
            });
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Asynchronus call to check Ad buffer status
 * @private
 * @param {number} currentPlayhead Current playhead
 * @param {function} cbStart Callback if buffer must start.
 * @param {function} cbEnd Callback if buffer must end.
 */
$YB.utils.Buffer.prototype._checkPlayhead = function(currentPlayhead, isBuffering, cbStart, cbEnd) {
    try {
        var diffPlayhead = Math.abs((this.lastPlayhead * 1000) - (currentPlayhead * 1000));
        if (diffPlayhead > this.options.threshold) { // Video is playing
            this.lastPlayhead = currentPlayhead;
            if (isBuffering && (!this.options.skipMiniBuffer || this.chrono.stop() > (this.options.interval * 1.1))) {
                cbEnd();
            }

        } else if (this.lastPlayhead && !isBuffering && diffPlayhead < this.options.threshold) { // Video is buffering
            cbStart();
        }
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
 * Returns the time between start() and the last stop() in ms. Returns -1 if start wasn't called.
 * @param {boolean} [stop=true] If true, it will force a stop() if it wasn't called before.
 * @return Time lapse in ms.
 */
$YB.utils.Chrono.prototype.getDeltaTime = function(stop) {
    try {
        if (this.startTime) {
            if (this.lastTime === 0) {
                if (stop !== false) {
                    return this.stop();
                } else {
                    return new Date().getTime() - this.startTime
                }
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
 * @license
 * YouboraLib Util
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Return n if it isn't NaN, negative, Infinity, null or undefined. In any other case, return def.
 * @param {mixed} n Number to be parsed.
 * @param {number} def Number to return if n is not correct.
 */
$YB.utils.parseNumber = function(n, def) {
    if (!isNaN(n) && n >= 0 && n != Infinity && n !== null && typeof n != "undefined") {
        return n;
    } else {
        return def;
    }
};

/**
 * This utility function will add most of the HTML5 event listener to the player sent.
 * This common events will be listened: 'canplay', 'buffering', 'waiting', 'ended', 'play', 'playing', 'pause', 'resume', 'error', 'abort', 'seek', 'seeking', 'seeked', 'stalled', 'dispose', 'loadeddata', 'loadstart'.
 * Events will be reported as level 4 messages (debug).
 *
 * @memberof Debug-Util
 * @param o Object to attach the events.
 * @param [extraEvents] An array of extra events to watch. ie:  ['timeupdate', 'progress']. If the first item is null, no common events will be added.
 * @param {function} [report] Callback function called to report events. Default calls $YB.debug.
 */
$YB.utils.listenAllEvents = function(o, extraEvents, report) {
    try {
        if ($YB.debugLevel >= 4) {
            report = report || function(e) {
                var label = "";
                if (typeof e.target != 'undefined' && typeof e.target.id != 'undefined') {
                    label = e.target.id;
                }

                $YB.debug('Event: ' + label + ' > ' + e.type);
            };

            var playerEvents = [
                'canplay', 'buffering', 'waiting', 'ended', 'play', 'playing', 'pause', 'resume', 'error',
                'abort', 'seek', 'seeking', 'seeked', 'stalled', 'dispose', 'loadeddata', 'loadstart'
            ];
            if (extraEvents) {
                if (extraEvents[0] === null) {
                    extraEvents.shift();
                    playerEvents = extraEvents;
                } else {
                    playerEvents = playerEvents.concat(extraEvents);
                }
            }

            for (var i = 0; i < playerEvents.length; i++) {
                if (typeof o == "function") {
                    o.call(window, playerEvents[i], report);
                } else if (o.on) {
                    o.on(playerEvents[i], report);
                } else if (o.addEventListener) {
                    o.addEventListener(playerEvents[i], report);
                }
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

// Define the headers of debug-util functions
$YB.utils.serialize = $YB.utils.listenAllEvents || function() {};

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
 * @default 2
 * @memberof $YB
 * @see {@link $YB.report}
 */
$YB.debugLevel = 2;

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
 * @param {number} [debugLevel=3] Defines the level of the error sent. Only errors with level lower than $YB.debugLevel will be displayed.
 * @param {string} [color=darkcyan] Color of the header
 * @see {@link $YB.debugLevel}
 */
$YB.report = function(msg, debugLevel, color) {
    if (console && console.log) {
        debugLevel = debugLevel || 4;
        color = color || 'darkcyan';

        if ($YB.debugLevel >= debugLevel) {

            if ($YB.plainConsole || document.documentMode) { //document.documentMode exits only in IE
                if (typeof msg == 'string') {
                    console.log('[Youbora:' + debugLevel + '] ' + msg);
                } else {
                    console.log('[Youbora:' + debugLevel + '] next line:');
                    console.log(msg);
                }
            } else {
                var logMethod = console.log;
                if (debugLevel == 1 && console.error) {
                    logMethod = console.error;
                } else if (debugLevel == 2 && console.warn) {
                    logMethod = console.warn;
                } else if (debugLevel >= 4 && console.debug) {
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
                $YB.remoteLog('[Youbora:' + debugLevel + '] ' + msg);
            }
        }
    }
};

/**
 * Sends an error (level 1) console log.
 * @param {(string|Error)} msg Message
 * @param {string} [color=darkred] Specific color for the message.
 * @memberof $YB
 * @see {@link $YB.report}
 */
$YB.error = function(msg, color) {
    $YB.report(msg, 1, color || 'darkred');
};

/**
 * Sends a warning (level 2) console log.
 * @param {(string|Error)} msg Message
 * @param {string} [color=darkorange] Specific color for the message.
 * @memberof $YB
 * @see {@link $YB.report}
 */
$YB.warn = function(msg, color) {
    $YB.report(msg, 2, color || 'darkorange');
};

/**
 * Sends a notice (level 3) console log.
 * @param {(string|Error)} msg Message
 * @param {string} [color=darkcyan] Specific color for the message.
 * @memberof $YB
 * @see {@link $YB.report}
 */
$YB.notice = function(msg, color) {
    $YB.report(msg, 3, color || 'darkcyan');
};

/**
 * Sends a debug message (level 4) to console.
 * @param {(string|Error)} msg Message
 * @param {string} [color=indigo] Specific color for the message.
 * @memberof $YB
 * @see {@link $YB.report}
 */
$YB.debug = function(msg, color) {
    $YB.report(msg, 4, color || 'indigo');
};

/**
 * Sends a request url (level 5) to console.
 * @param {(string|Error)} msg Message
 * @param {string} [color=navy] Specific color for the message.
 * @memberof $YB
 * @see {@link $YB.report}
 */
$YB.requestLog = function(msg, color) {
    $YB.report(msg, 5, color || 'navy');
};

/**
 * @license
 * YouboraLib Log
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

// This script will search inside tags and url request for info about debugLevel, plainConsole or remoteLog.
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
                        $YB.debugLevel = tag;
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
                $YB.debugLevel = m[1];
            }

            m = /\?.*\&*youbora-console=(.+)/i.exec(window.location.search);
            if (m !== null) {
                defineConsole(m[1]);
            }
        }
    } catch (err) {
        $YB.error(err);
    }
}());