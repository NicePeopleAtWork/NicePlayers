/**
 * Tries to get the playhead of the ad from adnalyzer.getAdPlayhead().
 * @return {number} Playhead in seconds or 0
 */
$YB.managers.Info.prototype.getAdPlayhead = function() {
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
$YB.managers.Info.prototype.getAdBitrate = function() {
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
$YB.managers.Info.prototype.getAdResource = function() {
    try {
        if (typeof this.options.ads.resource != 'undefined') {
            return this.options.ads.resource;
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
$YB.managers.Info.prototype.getAdPosition = function() {
    try {
        if (typeof this.options.ads.position != 'undefined') {
            return this.options.ads.position;
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
$YB.managers.Info.prototype.getAdTitle = function() {
    try {
        if (typeof this.options.ads.title != 'undefined') {
            return this.options.ads.title;
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
$YB.managers.Info.prototype.getAdDuration = function() {
    try {
        res = 0;
        if (typeof this.options.ads.duration != "undefined") {
            res = this.options.ads.duration;
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
$YB.managers.Info.prototype.getAdPlayerVersion = function() {
    try {
        return this.plugin.adnalyzer.getAdPlayerVersion();
    } catch (err) {
        $YB.warn(err);
        return null;
    }
};
