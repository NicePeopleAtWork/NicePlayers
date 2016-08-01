/**
 * Creates and returns the parameters required for the  '/start' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getStartParams = function(params) {
    try {
        params = params || {};

        // Params
        params.system = params.hasOwnProperty('system') ? params.system : this.options.accountCode;
        params.player = params.hasOwnProperty('player') ? params.player : this.plugin.pluginName;
        params.user = params.hasOwnProperty('user') ? params.user : this.options.username;
        params.transcode = params.hasOwnProperty('transcode') ? params.transcode : this.options.transactionCode;
        params.hashTitle = params.hasOwnProperty('hashTitle') ? params.hashTitle : this.options.hashTitle;
        params.referer = params.hasOwnProperty('referer') ? params.referer : (typeof window != 'undefined' ? window.location.href : '');

        // Device
        params.deviceId = params.hasOwnProperty('deviceId') ? params.deviceid : this.options.device.id;

        // Plugin versioning
        params.pluginVersion = params.hasOwnProperty('pluginVersion') ? params.pluginVersion : this.plugin.pluginVersion;
        params.playerVersion = params.hasOwnProperty('playerVersion') ? params.playerVersion : this.getPlayerVersion();

        // Media
        params.resource = params.hasOwnProperty('resource') ? params.resource : this.getResource();
        params.duration = params.hasOwnProperty('duration') ? params.duration : this.getMediaDuration();
        params.live = params.hasOwnProperty('live') ? params.live : this.getIsLive();
        params.rendition = params.hasOwnProperty('rendition') ? params.rendition : this.getRendition();
        params.title = params.hasOwnProperty('title') ? params.title : this.getTitle();
        params.properties = params.hasOwnProperty('properties') ? params.properties : this.options.properties;
        params.cdn = params.hasOwnProperty('cdn') ? params.cdn : this.options.media.cdn;

        // Network
        params.isp = params.hasOwnProperty('isp') ? params.isp : this.options.network.isp;
        params.ip = params.hasOwnProperty('ip') ? params.ip : this.options.network.ip;

        // Extra Params
        params.param1 = params.hasOwnProperty('param1') ? params.param1 : this.options.extraParams.param1;
        params.param2 = params.hasOwnProperty('param2') ? params.param2 : this.options.extraParams.param2;
        params.param3 = params.hasOwnProperty('param3') ? params.param3 : this.options.extraParams.param3;
        params.param4 = params.hasOwnProperty('param4') ? params.param4 : this.options.extraParams.param4;
        params.param5 = params.hasOwnProperty('param5') ? params.param5 : this.options.extraParams.param5;
        params.param6 = params.hasOwnProperty('param6') ? params.param6 : this.options.extraParams.param6;
        params.param7 = params.hasOwnProperty('param7') ? params.param7 : this.options.extraParams.param7;
        params.param8 = params.hasOwnProperty('param8') ? params.param8 : this.options.extraParams.param8;
        params.param9 = params.hasOwnProperty('param9') ? params.param9 : this.options.extraParams.param9;
        params.param10 = params.hasOwnProperty('param10') ? params.param10 : this.options.extraParams.param10;

        // Ping-related
        params.totalBytes = params.hasOwnProperty('totalBytes') ? params.totalBytes : this.getTotalBytes();

        // Ads
        params.adsExpected = params.hasOwnProperty('adsExpected') ? params.adsExpected : this.options.ads.expected;

        //resume & balanced
        if (this.options.isResumed == 1) params.isResumed = 1;
        if (this.options.isBalanced == 1) params.isBalanced = 1;

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};

/**
 * Creates and returns the parameters required for the  '/joinTime' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getJoinParams = function(params) {
    try {
        params = params || {};

        params.eventTime = params.hasOwnProperty('eventTime') ? params.eventTime : this.getPlayhead();
        params.mediaDuration = params.hasOwnProperty('mediaDuration') ? params.mediaDuration : this.getMediaDuration();

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};

/**
 * Creates and returns the parameters required for the  '/stop' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getStopParams = function(params) {
    return params || {};
};


/**
 * Creates and returns the parameters required for the  '/pause' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getPauseParams = function(params) {
    return params || {};
};


/**
 * Creates and returns the parameters required for the  '/resume' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getResumeParams = function(params) {
    return params || {};
};

/**
 * Creates and returns the parameters required for the  '/bufferUnderrun' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getBufferEndParams = function(params) {
    try {
        params = params || {};

        params.time = params.hasOwnProperty('time') ? params.time : this.getPlayhead();

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};

/**
 * Creates and returns the parameters required for the  '/error' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getErrorParams = function(params) {
    try {
        params = params || {};

        // Message & Errorcode
        params.errorCode = params.hasOwnProperty('errorCode') ? params.errorCode : '9000';
        params.msg = params.hasOwnProperty('msg') ? params.msg : 'Unknown Error';

        // Complete with /start params
        params = this.getStartParams(params);

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};

/**
 * Creates and returns the parameters required for the  '/seek' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getSeekEndParams = function(params) {
    return this.getBufferEndParams(params);
};

/**
 * Creates and returns the parameters required for the  '/ping' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getPingParams = function(params, callback) {
    try {
        params = params || {};

        // Params
        params.time = typeof params.time != 'undefined' ? params.time : this.getPlayhead();
        params.bitrate = typeof params.bitrate != 'undefined' ? params.bitrate : this.getBitrate();
        params.throughput = typeof params.throughput != 'undefined' ? params.throughput : this.getThroughput();
        params.totalBytes = typeof params.totalBytes != 'undefined' ? params.totalBytes : this.getTotalBytes();

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};
