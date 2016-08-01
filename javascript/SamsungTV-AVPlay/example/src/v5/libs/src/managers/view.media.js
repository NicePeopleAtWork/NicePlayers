/**
 * Sends '/start' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.managers.View.prototype.sendStart = function(params, callback) {
    try {
        if (!this.isHalted()) {

            if (!this.isStartSent) {

                //resource Parser start
                if (this.infoManager.options.parseCDNNodeHost || this.infoManager.options.parseHLS) {
                    this.resourceParser.init();
                }

                // Flags
                this.isStartSent = true;

                // Chronos
                this.chrono.joinTime.start();

                // Start pings
                $YB.noticeRequest("Sending pings every " + this.comm.pingTime + "s.");
                this.timer.pinger.interval = Math.max(1000, this.comm.pingTime * 1000);
                this.timer.pinger.start();

                // Params
                params = this.infoManager.getStartParams(params);
                params.pingTime = typeof params.pingTime != 'undefined' ? params.pingTime : this.comm.pingTime;
                if (this.infoManager.options.parseCDNNodeHost) {
                    params.nodeHost = typeof params.nodeHost != 'undefined' ? params.nodeHost : (typeof this.resourceParser.nodeHost != 'undefined' ? this.resourceParser.nodeHost : "");
                    params.nodeType = typeof params.nodeType != 'undefined' ? params.nodeType : (typeof this.resourceParser.nodeType != 'undefined' ? this.resourceParser.nodeType : "");
                }

                // Request next viewcode
                this.comm.nextView(params.live);

                // Send the request
                this.sendRequest('/start', params, callback);
                $YB.noticeRequest("Request: NQS /start " + params.resource);

                // Save last info sent
                this.lastDuration = params.duration;
                this.lastRendition = params.rendition;
            }
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
$YB.managers.View.prototype.sendJoin = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isStartSent && !this.isJoinSent && !this.isShowingAds) {

                // Flags
                this.isJoinSent = true;

                // Start playheadMonitor
                if (this.enableBufferMonitor || this.enableSeekMonitor) {
                    this.timer.playheadMonitor.start();
                    this.lastPlayhead = 0;
                }

                // Params
                params = this.infoManager.getJoinParams(params);
                params.time = typeof params.time != 'undefined' ? params.time : this.chrono.joinTime.getDeltaTime();

                // Check duration to send it only once
                if (params.mediaDuration === this.lastDuration) {
                    delete params.mediaDuration;
                }

                // Send the request
                this.sendRequest('/joinTime', params, callback);
                $YB.noticeRequest("Request: NQS /joinTime " + params.time + "ms");
            }
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
$YB.managers.View.prototype.sendStop = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isStartSent) {

                // Flags
                this.isStartSent = false;
                this.isPaused = false;
                this.isJoinSent = false;
                this.isSeeking = false;
                this.isBuffering = false;

                // Clear resource parser
                this.resourceParser.clear();

                // Reset Ad roll counters
                this.resetAdNumbers();

                // Stop Timers
                this.stopTimers();

                // Params
                params = this.infoManager.getStopParams(params);
                params.diffTime = typeof params.diffTime != 'undefined' ? params.diffTime : this.timer.pinger.chrono.getDeltaTime();

                // Send the request
                this.sendRequest('/stop', params, callback);
                $YB.noticeRequest("Request: NQS /stop");
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
$YB.managers.View.prototype.sendPause = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isJoinSent && !this.isPaused) {

                // Flags & Chronos
                this.isPaused = true;
                this.chrono.pause.start();

                // Params
                params = this.infoManager.getPauseParams(params);

                // Send the request
                this.sendRequest('/pause', params, callback);
                $YB.noticeRequest("Request: NQS /pause");
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
$YB.managers.View.prototype.sendResume = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isJoinSent && this.isPaused) {

                // Flags & Chronos
                this.isPaused = false;
                this.chrono.pause.stop();
                this.lastResume = new Date().getTime();

                // Params
                params = this.infoManager.getResumeParams(params);

                // Send the request
                this.sendRequest('/resume', params, callback);
                $YB.noticeRequest("Request: NQS /resume");
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/** Notifies a buffer start. It will expect a {$YB.api.Video#sendBufferEnd}. */
$YB.managers.View.prototype.sendBufferStart = function() {
    try {
        if (!this.isHalted()) {
            if (this.isJoinSent && !this.isBuffering) {

                // Flags & Chronos
                this.isBuffering = true;
                this.chrono.buffer.start();

                // Log
                $YB.noticeRequest("Method: /bufferStart");
            }
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
$YB.managers.View.prototype.sendBufferEnd = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isJoinSent && this.isBuffering) {

                // Flags & Chronos
                this.isBuffering = false;

                // Params
                params = this.infoManager.getBufferEndParams(params);
                params.duration = typeof params.duration != 'undefined' ? params.duration : this.chrono.buffer.getDeltaTime();

                // Send the request
                this.sendRequest('/bufferUnderrun', params, callback);
                $YB.noticeRequest("Request: NQS /bufferUnderrun " + params.duration + "ms");
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/** Notifies a seek start. It will expect a {$YB.api.Video#sendSeekEnd}. */
$YB.managers.View.prototype.sendSeekStart = function() {
    try {
        if (!this.isHalted()) {
            if (this.isJoinSent && !this.isSeeking) {

                // Flags & Chronos
                this.isSeeking = true;
                this.chrono.seek.start();

                // Log
                $YB.noticeRequest("Method: /seekStart");

            }
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
$YB.managers.View.prototype.sendSeekEnd = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isJoinSent && this.isSeeking) {

                // Flags & Chronos
                this.isSeeking = false;

                // Params
                params = this.infoManager.getSeekEndParams(params);
                params.duration = typeof params.duration != 'undefined' ? params.duration : this.chrono.seek.getDeltaTime();

                // Send the request
                this.sendRequest('/seek', params, callback);
                $YB.noticeRequest("Request: NQS /seek " + params.duration + "ms");
            }
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
$YB.managers.View.prototype.sendError = function(params, callback) {
    try {
        // Flags & Crhonos
        this.isErrorSent = true;

        // stop pings and nicebuffer
        if (this.infoManager.options.haltOnError) {
            this.stopTimers();
        }

        // Params
        params = this.infoManager.getErrorParams(params);
        params.pingTime = typeof params.pingTime != 'undefined' ? params.pingTime : this.comm.pingTime;
        if (this.infoManager.options.parseCDNNodeHost) {
            params.nodeHost = typeof params.nodeHost != 'undefined' ? params.nodeHost : (typeof this.resourceParser.nodeHost != 'undefined' ? this.resourceParser.nodeHost : "");
            params.nodeType = typeof params.nodeType != 'undefined' ? params.nodeType : (typeof this.resourceParser.nodeType != 'undefined' ? this.resourceParser.nodeType : "");
        }

        // Send the request
        this.sendRequest('/error', params, callback);
        $YB.noticeRequest("Request: NQS /error " + params.msg);
    } catch (err) {
        $YB.error(err);
    }
};

/** Converts Buffer to Seek (migrating its chronos) */
$YB.managers.View.prototype.convertBufferToSeek = function() {
    try {
        $YB.noticeRequest("Converting buffer to seek");

        this.chrono.seek.startTime = this.chrono.buffer.startTime;
        this.chrono.seek.lastTime = 0;

        this.chrono.buffer.stop();

        this.isBuffering = false;
        this.isSeeking = true;

    } catch (err) {
        $YB.error(err);
    }
};
