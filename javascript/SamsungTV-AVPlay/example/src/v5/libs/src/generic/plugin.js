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
    player: null,
    /** Reference to the video/object tag, could be the same as the player. */
    tag: null,

    /** An instance of {@link $YB.managers.Info}. */
    infoManager: undefined,
    /** An instance of {@link $YB.managers.View}. */
    viewManager: undefined,
    /** An instance inherited from  {@link $YB.adnalyzers.Generic}. */
    adnalyzer: null,
};


/**
 * Instantiates the plugin libraries and starts listening to the set player.
 *
 * @param {(string|object)} player Either the player object or the unique identifier of the player, usually asociated with the ID tag of the DOM.
 * @param {Object} [options] {@link $YB.data.Options |Youbora Data} initial values.
 */
$YB.plugins.Generic.prototype.startMonitoring = function(player, options) {
    try {
        $YB.notice("Plugin " + this.pluginVersion + " (with YouboraJS " + $YB.version + ") is ready.");

        // Safe reference to the
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
        if (typeof this.infoManager == 'undefined') {
            this.infoManager = new $YB.managers.Info(this, options);
        } else {
            this.infoManager.setOptions(options);
        }

        this.viewManager = new $YB.managers.View(this.infoManager);

    } catch (err) {
        $YB.error(err);
        return null;
    }
};

/**
 * Removes player object from reference and stops monitoring.
 * This will not ensure that previously registered listeners are removed.
 */
$YB.plugins.Generic.prototype.stopMonitoring = function() {
    this.player = null;
    this.tag = null;
    this.viewManager.stopTimers();
};


/**
 * Starts Nicebuffer in video APIs.
 */
$YB.plugins.Generic.prototype.enableBufferMonitor = function() {
    if (this.infoManager.options.enableNiceBuffer) {
        this.viewManager.enableBufferMonitor = true;
    }
};

/**
 * Starts Niceseek in video APIs.
 */
$YB.plugins.Generic.prototype.enableSeekMonitor = function() {
    if (this.infoManager.options.enableNiceSeek) {
        this.viewManager.enableSeekMonitor = true;
    }
};


/**
 * Changes the $YB.data.Options options.
 * @see $YB.data.Options#setOptions
 */
$YB.plugins.Generic.prototype.setOptions = function(options) {
    try {
        this.infoManager.options.setOptions(options);
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Returns {@link $YB.data.Options} options.
 * @returns $YB.data.Options
 * @see $YB.data.Options
 */
$YB.plugins.Generic.prototype.getOptions = function() {
    try {
        return this.infoManager.options || {};
    } catch (err) {
        $YB.error(err);
        return {};
    }
};


/**
 * This function must be called when a new video starts loading.
 * @see $YB.api.Video#sendStart
 */
$YB.plugins.Generic.prototype.playHandler = function() {
    try {
        this.viewManager.sendStart();
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
        this.viewManager.sendJoin();
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
        if (this.viewManager.isStartSent) {
            if (!this.viewManager.isJoinSent) {
                this.viewManager.sendJoin();
            } else if (this.viewManager.isSeeking && this.viewManager.isPaused) {
                this.viewManager.sendSeekEnd();
                this.viewManager.sendResume();
            } else if (this.viewManager.isSeeking) {
                this.viewManager.sendSeekEnd();
            } else if (this.viewManager.isBuffering) {
                this.viewManager.sendBufferEnd();
            } else if (this.viewManager.isPaused) {
                this.viewManager.sendResume();
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
        this.viewManager.sendPause();
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
        if (this.viewManager.isPaused) {
            this.viewManager.sendResume();
        } else {
            this.viewManager.sendPause();
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
        this.viewManager.sendResume();
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
        this.viewManager.sendStop();
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

        this.viewManager.sendError({
            errorCode: code,
            msg: msg
        });
        //this.viewManager.sendStop();
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
        if (this.viewManager.isBuffering) {
            this.viewManager.convertBufferToSeek();
        } else {
            this.viewManager.sendSeekStart();
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
        this.viewManager.sendSeekEnd();
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
        if (!this.viewManager.isSeeking) {
            this.viewManager.sendBufferStart();
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
        if (this.viewManager.isStartSent) {
            if (!this.viewManager.isJoinSent) {
                this.viewManager.sendJoin();
            } else if (this.viewManager.isSeeking) {
                this.viewManager.sendSeekEnd();
            } else if (this.viewManager.isBuffering) {
                this.viewManager.sendBufferEnd();
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when an ad starts. If you are using adnalyzer modules, this function won't work.
 * @see $YB.api.Video#sendIgnoreAdStart
 */
$YB.plugins.Generic.prototype.ignoringAdHandler = function() {
    try {
        this.viewManager.sendIgnoreAdStart();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when an ad ends. If you are using adnalyzer modules, this function won't work.
 * @see $YB.api.Video#sendIgnoreAdEnd
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.ignoredAdHandler = function() {
    try {
        this.viewManager.sendIgnoreAdEnd();
    } catch (err) {
        $YB.error(err);
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
