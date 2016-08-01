$YB.plugins.Ooyala4 = function(player, options) {
    try {
        /** Name and platform of the plugin.*/
        this.pluginName = '[name]';

        /** Version of the plugin. ie: 5.1.0-name */
        this.pluginVersion = '[ver]-[name]';

        //this.adnalyzer = new $YB.adnalyzers.Ooyala4(this);

        if (player) {
            /* Initialize YouboraJS */
            this.startMonitoring(player.getElementId(), options);

            // Save player reference
            this.player = player;
        } else {
            this.resetValues();
        }
    } catch (err) {
        $YB.error(err);
    }
};

// Extend Generic Plugin
$YB.plugins.Ooyala4.prototype = new $YB.plugins.Generic;

/** Reset reported values. */
$YB.plugins.Ooyala4.prototype.resetValues = function() {
    this.playhead = 0;
    this.resource = "";
    this.title = "";
    this.duration = 0;
    this.bitrate = -1;
    this.isLive = false;
    this.rendition = "";

    //this.adnalyzer.resetValues();
}

/** Returns the current playhead of the video or 0. */
$YB.plugins.Ooyala4.prototype.getPlayhead = function() {
    if (this.player) {
        return this.player.getPlayheadTime();
    } else {
        return this.playhead;
    }
};

/** Returns the media duration of the video or 0. */
$YB.plugins.Ooyala4.prototype.getMediaDuration = function() {
    if (this.player) {
        return this.player.getDuration();
    } else {
        return this.duration;
    }
};

/** Returns true if media is Live, and false if it is VOD. */
$YB.plugins.Ooyala4.prototype.getIsLive = function() {
    return this.isLive;
};


/** Returns the title or an empty string. */
$YB.plugins.Ooyala4.prototype.getTitle = function() {
    if (this.player) {
        return this.player.getTitle();
    } else {
        return this.title;
    }
};

/** Returns the src of the resource or an empty string. */
$YB.plugins.Ooyala4.prototype.getResource = function() {
    if (this.resource) {
        return this.resource;
    }
};
/**/

/** Returns version of the player or an empty string. */
$YB.plugins.Ooyala4.prototype.getPlayerVersion = function() {
    return "Ooyala V4 " + OO.VERSION.core.rev;
};

/** Returns the current bitrate of the video or -1. */
$YB.plugins.Ooyala4.prototype.getBitrate = function() {
    if (this.player) {
        return this.player.getCurrentBitrate();
    } else {
        return this.bitrate;
    }
};

/** Returns current rendition name or null.*/
$YB.plugins.Ooyala4.prototype.getRendition = function() {
    if (this.rendition) {
        return this.rendition;
    } else {
        return null
    }
};

/** Analytics */
$YB.plugins.Ooyala4.prototype.processEvent = function(eventName, params) {
    try {
        if ($YB.debugLevel >= 4) {
            if (eventName != "video_stream_downloading" && eventName != "video_stream_position_changed") {
                $YB.debug("Event: " + eventName);
                if (params[0])
                    $YB.debug(params[0]);
            }
        }

        switch (eventName) {
            case "video_stream_position_changed":
                if (!this.isShowingAds) {
                    this.playhead = params[0].streamPosition;
                    this.duration = params[0].totalStreamDuration;
                }
                break;

            case "initial_playback_requested":
                this.playHandler();
                break;


            case "video_buffering_started":
                if (!this.viewManager.isSeeking && params[0].streamUrl.startsWith(this.resource)) {
                    this.bufferingHandler();
                }
                break;

            case "video_buffering_ended":
                this.joinHandler();
                if (this.viewManager.isBuffering) {
                    this.bufferedHandler();
                }
                break;

            case "video_pause_requested":
                this.pauseHandler();
                break;

            case "video_playing":
                this.resumeHandler();
                break;

            case "video_seek_requested":
                this.seekingHandler();
                break;

            case "video_seek_completed":
                this.seekedHandler();
                break;

            case "ad_break_started":
                this.ignoringAdHandler();
                //this.adnalyzer.startJoinAdHandler();
                break;

            case "ad_break_ended":
                this.ignoredAdHandler();
                //this.adnalyzer.endedAdHandler();
                //this.adnalyzer.resetValues();
                break;

            case "playback_completed":
                this.endedHandler();
                //this.adnalyzer.resetValues();
                break;

            case "video_content_metadata_updated":
                this.title = params[0].title;
                this.duration = params[0].duration / 1000;
                break;

            case "video_element_created":
                this.resource = params[0].streamUrl;
                break;

            case "stream_type_updated":
                this.isLive = !(params[0].streamType == "vod");
                break;

            case "video_stream_bitrate_changed":
                this.bitrate = params[0].bitrate;

                if (isNaN(params[0].id)) {
                    this.rendition = params[0].id;
                } else if (params[0].width && params[0].height && params[0].bitrate) {
                    this.rendition = params[0].width + "x" + params[0].height + "@" + params[0].bitrate;
                } else {
                    this.rendition = null;
                }
                break;
        }
    } catch (err) {
        $YB.error(err)
    }
};
