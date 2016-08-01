/**
 * Sends '/ping' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.managers.View.prototype.sendPing = function(params, callback) {
    try {
        // Params
        params = this.infoManager.getPingParams(params);
        if (this.isShowingAds) params = this.infoManager.getAdPingParams(params);

        // Ping Time & chronos
        params.pingTime = typeof params.pingTime != 'undefined' ? params.pingTime : this.comm.pingTime;
        if (this.isSeeking) params.seekDuration = typeof params.seekDuration != 'undefined' ? params.seekDuration : this.chrono.seek.getDeltaTime(false);
        if (this.isBuffering) params.bufferDuration = typeof params.bufferDuration != 'undefined' ? params.bufferDuration : this.chrono.buffer.getDeltaTime(false);
        if (this.isAdBuffering) params.adBufferDuration = typeof params.adBufferDuration != 'undefined' ? params.adBufferDuration : this.chrono.adBuffer.getDeltaTime(false);

        // Rendition
        var rendition = this.infoManager.getRendition();
        if (rendition && this.lastRendition != rendition) {
            this.sendChangedEntity('rendition', rendition);
            this.lastRendition = rendition;
        }

        // Changed entities
        if (this.changedEntities.length == 1) {
            var ent = this.changedEntities.shift();
            params.entityType = ent.key;
            params.entityValue = ent.value;
        } else if (this.changedEntities.length > 1) {
            params.entityType = null;
            params.entityValue = JSON.stringify(this.changedEntities);
            this.changedEntities = {};
        }

        // Send request
        this.sendRequest('/ping', params, callback);

    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Queues an entity that would be changed during the next ping.
 * @param {string} key Name of the entity. If the key is already queued to change, it will be overriden. ie: duration, rendition...
 * @param {mixed} value New value.
 */
$YB.managers.View.prototype.sendChangedEntity = function(key, value) {
    try {
        this.changedEntities.push({ key: key, value: value });
    } catch (err) {
        $YB.error(err);
    }
};
