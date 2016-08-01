/**
 * @license
 * Youbora Plugin 5.2.0-chromecast
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.plugins.Chromecast = function(options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = 'chromecast';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '5.2.0-chromecast';

            /* Initialize YouboraJS */
            this.init(null, options);

            /* Save TAG reference*/
            this.tag = document.getElementsByTagName('video')[0];

            // Register the listeners. Comment this line if you want to instantiate the plugin async.
            this.registerListeners();
        } catch (err) {
            $YB.error(err);
        }
    };

    // Extend Generic Plugin
    $YB.plugins.Chromecast.prototype = new $YB.plugins.Generic;

    $YB.plugins.Chromecast.prototype.setMediaPlayer = function(player) {
        this.player = player;
    };

    /** Returns the current rendition of the video or an empty string. */
    $YB.plugins.Chromecast.prototype.getRendition = function() {
        return this.getBitrate();
    };

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.Chromecast.prototype.getPlayhead = function() {
        return this.tag.currentTime;
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.Chromecast.prototype.getMediaDuration = function() {
        return this.tag.duration;
    };

    /** Returns the src of the resource or an empty string. */
    $YB.plugins.Chromecast.prototype.getResource = function() {
        if (!this.tag.currentSrc.startsWith("blob:")) {
            return this.tag.currentSrc;
        } else if (this.player) {
            return this.player.getHost().url;
        } else {
            return "unknown";
        }
    };

    /** Returns version of the player or an empty string. */
    $YB.plugins.Chromecast.prototype.getPlayerVersion = function() {
        if (cast && cast.player && cast.player.api && cast.player.api.VERSION) {
            return "Chromecast " + cast.player.api.VERSION;
        } else {
            return "Chromecast";
        }
    };

    /** Returns the current bitrate of the video or -1. */
    $YB.plugins.Chromecast.prototype.getBitrate = function() {
        try {
            if (this.player.getStreamingProtocol) {
                var protocol = this.player.getStreamingProtocol();
                for (var c = 0; c < protocol.getStreamCount(); c++) {
                    var streamInfo = protocol.getStreamInfo(c);
                    var videoLevel = protocol.getQualityLevel(c);
                    if (streamInfo.bitrates && streamInfo.bitrates[videoLevel]) {
                        return streamInfo.bitrates[videoLevel];
                    }
                }
            }
            return -1;
        } catch (err) {
            return -1; // Stream info not available yet, do nothing
        }
    };

    /** Register Listeners */
    $YB.plugins.Chromecast.prototype.registerListeners = function() {
        try {
            // Report events as Debug messages
            $YB.utils.listenAllEvents(this.tag, ["ratechange"]);

            // Start buffer watcher. Requires data.enableNiceBuffer to be true.
            if (!this.player)
                this.startAutobuffer();

            // Register Events
            var plugin = this;
            this.tag.addEventListener('loadstart', function() {
                plugin.endedHandler();
                plugin.playHandler(); // Play is clicked (/start)
            });
            this.tag.addEventListener('playing', function() {
                plugin.playingHandler(); // Image starts moving after start, pause, seek or buffer (/joinTime), (/resume), (/seekEnd), (/bufferEnd)
            });
            this.tag.addEventListener('pause', function() {
                if (this.player && this.player.getState().underflow) {
                    plugin.bufferingHandler();
                } else {
                    plugin.pauseHandler();
                }
                plugin.pauseHandler(); // Video pauses (/pause)
            });
            this.tag.addEventListener('error', function() {
                plugin.errorHandler(plugin.tag.error.code);
                plugin.endedHandler();
            });
            this.tag.addEventListener('abort', function() {
                plugin.endedHandler(); // video ends (/stop)
            });
            this.tag.addEventListener('ended', function() {
                plugin.endedHandler();
            });
            this.tag.addEventListener('seeking', function() {
                plugin.seekingHandler(); // video starts seeking
            });
        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.Chromecast.prototype.errorHandler = function(code) {
        var errorMsg = "PLAY FAILURE";
        switch (code) {
            case cast.player.api.ErrorCode.NETWORK:
                errorMsg = "NETWORK ERROR";
                break;
            case cast.player.api.ErrorCode.MANIFEST:
                errorMsg = "MANIFEST ERROR";
                break;
            case cast.player.api.ErrorCode.PLAYBACK:
                errorMsg = "PLAYBACK ERROR";
                break;
            case cast.player.api.ErrorCode.MEDIAKEYS:
                errorMsg = "MEDIAKEYS ERROR";
                break;
        }

        this.videoApi.sendError({
            errorCode: code,
            msg: errorMsg
        });
    };
}
