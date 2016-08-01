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
    /** Version of the plugin. ie: 5.3.0-name */
    adnalyzerVersion: '5.3.0-GENERIC',

    /** Reference to the ads player. */
    ads: undefined,
    /** Reference to the main plugin */
    plugin: undefined
};

/**
 * Instantiates the adnalyzer libraries and starts monitoring an ads object.
 *
 * @param {(object)} plugin The main youbora plugin from where it is instantiated.
 * @param {(object)} [ads] The object sending ads. ie: this.plugin.player.ima
 */
$YB.adnalyzers.Generic.prototype.startMonitoring = function(plugin, ads) {
    try {
        $YB.notice("Adnalyzer " + this.adnalyzerVersion + " is ready.");

        // Save the main plugin.
        this.plugin = plugin;

        // Save the ads plugin
        this.ads = ads;
    } catch (err) {
        $YB.error(err);
        return null;
    }
}

/**
 * Removes ad player object from reference.
 * This will not ensure that previously registered listeners are removed.
 */
$YB.adnalyzers.Generic.prototype.stopMonitoring = function() {
    this.ads = null;
    this.plugin.viewManager.timer.adPlayheadMonitor.stop();
}


/**
 * Starts Nicebuffer in ads API.
 */
$YB.adnalyzers.Generic.prototype.enableAdBufferMonitor = function() {
    if (this.plugin.infoManager.options.enableNiceBuffer) {
        this.plugin.viewManager.enableAdBufferMonitor = true;
    }
};

/**
 * Starts Niceseek in ads API. Not in use because ads does not have seeks.
 * @private
 */
$YB.adnalyzers.Generic.prototype.enableAdSeekMonitor = function() {
    if (this.plugin.infoManager.options.enableNiceSeek) {
        this.plugin.viewManager.enableAdSeekMonitor = true;
    }
};

/**
 * This function must be called when a new ad starts loading.
 * @see $YB.api.Ads#sendAdStart
 */
$YB.adnalyzers.Generic.prototype.playAdHandler = function() {
    try {
        if (!this.isAdStartSent) {
            this.plugin.viewManager.sendAdStart();
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
$YB.adnalyzers.Generic.prototype.startJoinAdHandler = function() {
    try {
        if (!this.isAdStartSent) {
            this.plugin.viewManager.sendAdStart();

            // Use buffer clock to calculate joinTime in midrolls
            if (this.plugin.viewManager.isBuffering) {
                this.plugin.viewManager.chrono.joinTime.startTime = this.plugin.viewManager.chrono.buffer.startTime;
                this.plugin.viewManager.isBuffering = false;
            }

            this.plugin.viewManager.sendAdJoin();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video starts playing for the first time. If playingAdHandler is used, this function is not needed.
 * @see $YB.plugin.viewManager#sendAdJoin
 */
$YB.adnalyzers.Generic.prototype.joinAdHandler = function() {
    try {
        this.plugin.viewManager.sendAdJoin();
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
        this.plugin.viewManager.sendAdPause();
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
            this.plugin.viewManager.sendAdResume();
        } else {
            this.plugin.viewManager.sendAdPause();
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
        this.plugin.viewManager.sendAdResume();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video has ended.
 * @see $YB.plugin.viewManager#sendAdStop
 */
$YB.adnalyzers.Generic.prototype.endedAdHandler = function() {
    try {
        this.plugin.viewManager.sendAdStop();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video has been stoped.
 * @see $YB.plugin.viewManager#sendAdStop
 */
$YB.adnalyzers.Generic.prototype.skipAdHandler = function() {
    try {
        this.plugin.viewManager.sendAdStop({ skipped: true });
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video starts a buffer underrun.
 * @see $YB.plugin.viewManager#sendAdBufferStart
 */
$YB.adnalyzers.Generic.prototype.bufferingAdHandler = function() {
    try {
        this.plugin.viewManager.sendAdBufferStart();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video ends buffering. If playingAdHandler is used, this function is not needed.
 * @see $YB.plugin.viewManager#sendAdBufferEnd
 */
$YB.adnalyzers.Generic.prototype.bufferedAdHandler = function() {
    try {
        if (this.isAdStartSent) {
            if (!this.isAdJoinSent) {
                this.plugin.viewManager.sendAdJoin();
            } else if (this.isAdBuffering) {
                this.plugin.viewManager.sendAdBufferEnd();
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
