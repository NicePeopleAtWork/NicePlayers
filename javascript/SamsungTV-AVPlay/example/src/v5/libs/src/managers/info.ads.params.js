/**
 * Creates and returns the parameters required for the  '/adStart' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getAdStartParams = function(params, callback) {
    try {
        // Params
        params = params || {};

        params.position = typeof params.position != 'undefined' ? params.position : this.getAdPosition();
        params.resource = typeof params.resource != 'undefined' ? params.resource : this.getAdResource();
        params.campaign = typeof params.campaign != 'undefined' ? params.campaign : this.options.ads.campaign;
        params.title = typeof params.title != 'undefined' ? params.title : this.getAdTitle();
        params.adDuration = typeof params.adDuration != 'undefined' ? params.adDuration : this.getAdDuration();
        params.playhead = typeof params.playhead != 'undefined' ? params.playhead : this.getPlayhead();
        params.adnalyzerVersion = typeof params.adnalyzerVersion != 'undefined' ? params.adnalyzerVersion : this.plugin.adnalyzer.adnalyzerVersion;
        params.adPlayerVersion = typeof params.adPlayerVersion != 'undefined' ? params.adPlayerVersion : this.getAdPlayerVersion();

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};

/**
 * Creates and returns the parameters required for the  '/adJoinTime' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getAdJoinParams = function(params, callback) {
    try {
        // Params
        params = params || {};

        params.adPlayhead = typeof params.adPlayhead != 'undefined' ? params.adPlayhead : this.getAdPlayhead();

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};

/**
 * Creates and returns the parameters required for the  '/adStop' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getAdStopParams = function(params, callback) {
    try {
        params = params || {};

        params.adPlayhead = typeof params.adPlayhead != 'undefined' ? params.adPlayhead : this.getAdPlayhead();
        params.adBitrate = typeof params.adBitrate != 'undefined' ? params.adBitrate : this.getAdBitrate();

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};

/**
 * Creates and returns the parameters required for the  '/adPause' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getAdPauseParams = function(params, callback) {
    return params || {};
};


/**
 * Creates and returns the parameters required for the  '/adResume' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getAdResumeParams = function(params, callback) {
    return params || {};
};

/**
 * Creates and returns the parameters required for the  '/adBufferUnderrun' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getAdBufferEndParams = function(params, callback) {
    try {
        params = params || {};

        params.adPlayhead = typeof params.adPlayhead != 'undefined' ? params.adPlayhead : this.getAdPlayhead();

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};

/**
 * Creates and returns the parameters required for the  (ad related) '/ping' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getAdPingParams = function(params, callback) {
    try {
        params = params || {};

        // Params
        params.adBitrate = typeof params.adBitrate != 'undefined' ? params.adBitrate : this.getAdBitrate();
        params.adPlayhead = typeof params.adPlayhead != 'undefined' ? params.adPlayhead : this.getAdPlayhead();

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};
