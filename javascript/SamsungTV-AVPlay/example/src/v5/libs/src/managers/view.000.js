/**
 * @license
 * Youbora ViewManager
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * ViewManager will help each plugin to control the content/event workflow and manage XHRequests send.
 *
 * @since 5.3
 * @class
 * @memberof $YB.managers
 * @param {$YB.managers.Info} infoManager Associated infoManager instance.
 */
$YB.managers.View = function(infoManager) { // constructor
    this.infoManager = infoManager;

    /** Flag when Start has been sent. */
    this.isStartSent = false;
    /** Flag when Join has been sent. */
    this.isJoinSent = false;
    /** Flag when Player is paused. */
    this.isPaused = false;
    /** Flag when Player is seeking. */
    this.isSeeking = false;
    /** Flag when Player is buffering. */
    this.isBuffering = false;
    /** Flag when view arised at least one error. */
    this.isErrorSent = false;
    /** Flag when there are ads showing. */
    this.isShowingAds = false;
    /** Flag when Ads Start has been sent */
    this.isAdStartSent = false;
    /** Flag when Join has been sent */
    this.isAdJoinSent = false;
    /** Flag when Ad is paused. */
    this.isAdPaused = false;
    /** Flag when Ad is buffering */
    this.isAdBuffering = false;

    /** An object with multiples instances of {@link $YB.utils.Chrono}.
     * @prop {$YB.utils.Chrono} joinTime Chrono between start and joinTime.
     * @prop {$YB.utils.Chrono} seek Chrono for seeks.
     * @prop {$YB.utils.Chrono} pause Chrono for pauses.
     * @prop {$YB.utils.Chrono} buffer Chrono for buffers
     * @prop {$YB.utils.Chrono} adIgnore Chrono for ignoreAds.
     * @prop {$YB.utils.Chrono} adTotal Chrono for the totality of the Ad.
     * @prop {$YB.utils.Chrono} adJoinTime Chrono between adStart and adJoinTime.
     * @prop {$YB.utils.Chrono} adPause Chrono for ad pauses.
     * @prop {$YB.utils.Chrono} adBuffer Chrono for ad buffers
     */
    this.chrono = {
        joinTime: new $YB.utils.Chrono(),
        seek: new $YB.utils.Chrono(),
        pause: new $YB.utils.Chrono(),
        buffer: new $YB.utils.Chrono(),
        adIgnore: new $YB.utils.Chrono(),
        adTotal: new $YB.utils.Chrono(),
        adJoinTime: new $YB.utils.Chrono(),
        adPause: new $YB.utils.Chrono(),
        adBuffer: new $YB.utils.Chrono()
    };

    /** Counters of rolls shown.
     * @prop {number} pre Prerolls shown.
     * @prop {number} mid midrolls shown.
     * @prop {number} post Postrolls shown.
     */
    this.adCounter = {
        pre: 0,
        mid: 0,
        post: 0,
        unknown: 0
    };

    // Set inner timers
    var context = this;
    this.timer = {
        pinger: new $YB.utils.Timer(function(diffTime) { context.sendPing({ diffTime: diffTime }); }),
        playheadMonitor: new $YB.utils.Timer(function(diffTime) { context.checkPlayhead(); }, $YB.managers.View.monitoringInterval),
        adPlayheadMonitor: new $YB.utils.Timer(function(diffTime) { context.checkAdPlayhead(); }, $YB.managers.View.monitoringInterval)
    };

    // Monitor flags
    this.enableBufferMonitor = false;
    this.enableSeekMonitor = false;
    this.enableAdBufferMonitor = false;
    this.enableAdSeekMonitor = false;

    /** Last duration sent. */
    this.lastDuration = 0;
    /** Last playhead sent. */
    this.lastPlayhead = 0;
    /** Last ad position sent */
    this.lastAdPosition = "";
    /** Last rendition sent. */
    this.lastRendition = '';
    /** Time of the last resume. */
    this.lastResume = 0;

    /** An array of key-value pairs of entities changed to be sent in pings. */
    this.changedEntities = [];

    /** An instance of {@link $YB.utils.ResourceParser}. */
    this.resourceParser = new $YB.utils.ResourceParser(this);

    /** An instance of {@link $YB.comm.Communication}. */
    this.comm = new $YB.comm.Communication(this.infoManager.options.service, this.infoManager.options.httpSecure);

    // Request Data
    this.comm.requestData(this.infoManager.getDataParams());
};

$YB.managers.View.prototype.sendRequest = function(service, params, callback) {
    try {
        if (this.isAllowed(service)) {
            this.comm.sendRequest(service, params, callback);
        }
    } catch (err) {
        $YB.error(err);
    }
}

/**
 * Returns if this kind of analytic is allowed (enableAnalytics must be true and the service shall not be in disabledRequests).
 * @param {string} srv Name of the service. ie: '/seek'.
 * @return {bool} True if the analytic is allowed, false otherwise.
 */
$YB.managers.View.prototype.isAllowed = function(service) {
    return this.infoManager.options.enableAnalytics && !(service in this.infoManager.options.disabledRequests);
};

/**
 * Returns true if the execution is stoped by an error.
 * @return {Boolean}
 */
$YB.managers.View.prototype.isHalted = function() {
    return this.infoManager.options.haltOnError && this.isErrorSent;
};
