/**
 * Sends '/adStart' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.managers.View.prototype.sendAdStart = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (!this.isAdStartSent) {

                // Chronos & Flags
                this.isShowingAds = true;
                this.isAdStartSent = true;
                this.chrono.adTotal.start();
                this.chrono.adJoinTime.start();

                // Close buffer and seek
                this.sendSeekEnd();
                this.sendBufferEnd();

                // Params
                params = this.infoManager.getAdStartParams(params);

                // Save last position and insert number
                params.number = typeof params.number != 'undefined' ? params.number : this.getAdNumber(params.position, true);
                this.lastAdPosition = params.position;

                // Send request
                this.sendRequest('/adStart', params, callback);
                $YB.noticeRequest("Request: NQS /adStart " + params.position + params.number);
            }
        }
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
$YB.managers.View.prototype.sendAdJoin = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isAdStartSent && !this.isAdJoinSent) {

                // Chronos & Flags
                this.isAdJoinSent = true;

                // Start AdPlayheadMonitor
                if (this.enableAdBufferMonitor || this.enableAdSeekMonitor) {
                    this.timer.adPlayheadMonitor.start();
                    this.lastPlayhead = 0;
                }

                // Params
                params = this.infoManager.getAdJoinParams(params);
                params.duration = typeof params.duration != 'undefined' ? params.duration : this.chrono.adJoinTime.getDeltaTime();
                params.position = typeof params.position != 'undefined' ? params.position : this.lastAdPosition;
                params.number = typeof params.number != 'undefined' ? params.number : this.getAdNumber(params.position);

                // Send request
                this.sendRequest('/adJoinTime', params, callback);
                $YB.noticeRequest("Request: NQS /adJoinTime " + params.duration + "ms");
            }
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
$YB.managers.View.prototype.sendAdStop = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isAdStartSent) {

                // Chronos & Flags
                this.isAdStartSent = false;
                this.isAdJoinSent = false;
                this.isAdBuffering = false;
                this.isShowingAds = false;

                // stop playhead monitor
                this.timer.adPlayheadMonitor.stop();

                // Params
                params = this.infoManager.getAdStopParams(params);
                params.totalDuration = typeof params.totalDuration != 'undefined' ? params.totalDuration : this.chrono.adTotal.getDeltaTime();
                params.position = typeof params.position != 'undefined' ? params.position : this.lastAdPosition;
                params.number = typeof params.number != 'undefined' ? params.number : this.getAdNumber(params.position);

                if (!params.adPlayhead) {
                    delete params.adPlayhead;
                }

                // Remove adTime from joinTime
                if (!this.isJoinSent) {
                    this.chrono.joinTime.startTime += this.chrono.adTotal.getDeltaTime();
                    this.chrono.joinTime.startTime = Math.min(this.chrono.joinTime.startTime, new Date().getTime());
                }

                // Send request
                this.sendRequest('/adStop', params, callback);
                $YB.noticeRequest("Request: NQS /adStop " + params.totalDuration + "ms");
            }
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
$YB.managers.View.prototype.sendAdPause = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isAdJoinSent && !this.isAdPaused) {

                // Chronos & Flags
                this.isAdPaused = true;
                this.chrono.adPause.start();

                // Params
                params = this.infoManager.getAdPauseParams(params);
                params.position = typeof params.position != 'undefined' ? params.position : this.lastAdPosition;
                params.number = typeof params.number != 'undefined' ? params.number : this.getAdNumber(params.position);

                // Send the request
                this.sendRequest('/adPause', params, callback);
                $YB.noticeRequest("Request: NQS /adPause");
            }
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
$YB.managers.View.prototype.sendAdResume = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isAdJoinSent && this.isAdPaused) {

                // Chronos & Flags
                this.isAdPaused = false;
                this.chrono.adPause.stop();

                // Params
                params = this.infoManager.getAdResumeParams(params);
                params.position = typeof params.position != 'undefined' ? params.position : this.lastAdPosition;
                params.number = typeof params.number != 'undefined' ? params.number : this.getAdNumber(params.position);

                // Send the request
                this.sendRequest('/adResume', params, callback);
                $YB.noticeRequest("Request: NQS /adResume");
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};


/** Notifies a buffer start. It will expect a {$YB.managers.View#sendAdBufferEnd}. */
$YB.managers.View.prototype.sendAdBufferStart = function() {
    try {
        if (!this.isHalted()) {
            if (this.isAdJoinSent && !this.isAdBuffering) {

                // Chronos & Flags
                this.isAdBuffering = true;
                this.chrono.adBuffer.start();

                // Log
                $YB.noticeRequest("Method: /adBufferStart");
            }
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
$YB.managers.View.prototype.sendAdBufferEnd = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isAdJoinSent && this.isAdBuffering) {

                // Chronos & Flags
                this.isAdBuffering = false;

                // Params
                params = this.infoManager.getAdBufferEndParams(params);
                params.duration = typeof params.duration != 'undefined' ? params.duration : this.chrono.adBuffer.getDeltaTime();
                params.position = typeof params.position != 'undefined' ? params.position : this.lastAdPosition;
                params.number = typeof params.number != 'undefined' ? params.number : this.getAdNumber(params.position);

                // Send request
                this.sendRequest('/adBufferUnderrun', params, callback);
                $YB.noticeRequest("Request: NQS /adBufferUnderrun " + params.duration + "ms");
            }
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
$YB.managers.View.prototype.getAdNumber = function(pos, increment) {
    switch (pos) {
        case 'pre':
            return (increment) ? ++this.adCounter.pre : this.adCounter.pre;
        case 'mid':
            return (increment) ? ++this.adCounter.mid : this.adCounter.mid;
        case 'post':
            return (increment) ? ++this.adCounter.post : this.adCounter.post;
        default:
            return (increment) ? ++this.adCounter.unknown : this.adCounter.unknown;
    }
};

/**
 * Restarts all the counters.
 */
$YB.managers.View.prototype.resetAdNumbers = function() {
    this.adCounter = {
        pre: 0,
        mid: 0,
        post: 0,
        unknown: 0
    };
};


/** Notifies a Generic Ad start. It will expect a {$YB.api.Video#sendGenericAdEnd}. */
$YB.managers.View.prototype.sendIgnoreAdStart = function() {
    try {
        if (!this.isHalted()) {

            if (this.isStartSent && !this.isShowingAds) {

                // Flags & Chronos
                this.isShowingAds = true;
                this.chrono.adIgnore.start();

                // Close buffer and seek
                this.sendBufferEnd();
                this.sendSeekEnd();

                // Log
                $YB.noticeRequest("Method: /genericAdStart");
            }

        }
    } catch (err) {
        $YB.error(err);
    }
};

/** Notifies a Generic Ad stop.*/
$YB.managers.View.prototype.sendIgnoreAdEnd = function() {
    try {
        if (!this.isHalted()) {
            if (this.isStartSent && this.isShowingAds) {

                // Flags & Chronos
                this.isShowingAds = false;
                this.chrono.adIgnore.stop();

                // Remove ad time from joinTime
                if (!this.isJoinSent) {
                    this.chrono.joinTime.startTime += this.chrono.adIgnore.getDeltaTime();
                    this.chrono.joinTime.startTime = Math.min(this.chrono.joinTime.startTime, new Date().getTime());
                }

                // Log
                $YB.noticeRequest("Method: /genericAdEnd " + this.chrono.adIgnore.getDeltaTime() + "ms");
            }

        }
    } catch (err) {
        $YB.error(err);
    }
};
