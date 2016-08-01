/**
 * Tries to get the resource of the video.
 * The order is {@link $YB.resourceParser#realResource} > {@link $YB.data.Options} > plugin.getResource() > "unknown".
 * @return {string} Resource or "unknown".
 */
$YB.managers.Info.prototype.getResource = function() {
    try {
        if (this.plugin.resourceParser && this.plugin.resourceParser.realResource) {
            return this.plugin.resourceParser.realResource;
        } else if (typeof this.options.media.resource != "undefined") {
            return this.options.media.resource;
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
$YB.managers.Info.prototype.getMediaDuration = function() {
    try {
        var res = 0;
        if (typeof this.options.media.duration != "undefined") {
            res = this.options.media.duration;
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
$YB.managers.Info.prototype.getIsLive = function() {
    try {
        if (typeof this.options.media.isLive != "undefined") {
            return this.options.media.isLive;
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
$YB.managers.Info.prototype.getPlayerVersion = function() {
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
$YB.managers.Info.prototype.getTitle = function() {
    try {
        if (typeof this.options.media.title != "undefined") {
            return this.options.media.title;
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
$YB.managers.Info.prototype.getRendition = function() {
    try {
        if (typeof this.options.media.rendition != "undefined") {
            return this.options.media.rendition;
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
$YB.managers.Info.prototype.getBitrate = function() {
    try {
        var res = Math.round(this.plugin.getBitrate());

        // Chrome workarround
        if (res == -1 && this.plugin.tag && typeof this.plugin.tag.webkitVideoDecodedByteCount != "undefined") {
            var bitrate = this.plugin.tag.webkitVideoDecodedByteCount;
            if (this.lastBitrate) {
                bitrate = Math.round(((this.plugin.tag.webkitVideoDecodedByteCount - this.lastBitrate) / 5) * 8);
            }
            this.lastBitrate = this.plugin.tag.webkitVideoDecodedByteCount;
            res = bitrate != 0 ? bitrate : -1;
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
$YB.managers.Info.prototype.getThroughput = function() {
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
$YB.managers.Info.prototype.getTotalBytes = function() {
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
$YB.managers.Info.prototype.getPlayhead = function() {
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
