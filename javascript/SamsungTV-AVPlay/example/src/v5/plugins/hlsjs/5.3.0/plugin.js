/**
 * @license
 * Youbora Plugin 5.3.0-Hlsjs
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.plugins.Hlsjs = function(player, options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = 'hlsjs';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '5.3.0-hlsjs';

            /* Initialize YouboraJS */
            this.startMonitoring(player, options);

            // Register the listeners. Comment this line if you want to instantiate the plugin async.
            var plugin = this;
            this.player.on(Hls.Events.MEDIA_ATTACHED, function() {
                plugin.tag = plugin.player.media;
                plugin.registerListeners();
            });
        } catch (err) {
            $YB.error(err);
        }
    };

    // Extend Generic Plugin
    $YB.plugins.Hlsjs.prototype = new $YB.plugins.Generic;

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.Hlsjs.prototype.getPlayhead = function() {
        return this.tag.currentTime;
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.Hlsjs.prototype.getMediaDuration = function() {
        return this.tag.duration;
    };

    /** Returns true if the video is life, or false if it is a VOD. */
    $YB.plugins.Hlsjs.prototype.getIsLive = function() {
        if (this.player.levels[this.player.currentLevel]) {
            return this.player.levels[this.player.currentLevel].details.live;
        } else {
            return false;
        }
    };

    /** Returns the src of the resource or an empty string. */
    $YB.plugins.Hlsjs.prototype.getResource = function() {
        if (this.player.levels[this.player.currentLevel]) {
            return this.player.levels[this.player.currentLevel].details.url;
        } else {
            return 'unknown';
        }
    };

    /** Returns version of the player or an empty string. */
    $YB.plugins.Hlsjs.prototype.getPlayerVersion = function() {
        return 'Hls.js ' + Hls.version;
    };

    /** Returns the current bitrate of the video or -1. */
    $YB.plugins.Hlsjs.prototype.getBitrate = function() {
        if (this.player.levels[this.player.currentLevel]) {
            return this.player.levels[this.player.currentLevel].bitrate;
        } else {
            return -1;
        }
    };

    /** Returns the current rendition of the video or an empty string. */
    $YB.plugins.Hlsjs.prototype.getRendition = function() {
        if (this.player.levels[this.player.currentLevel]) {
            return this.player.levels[this.player.currentLevel].name;
        } else {
            return 'unknown';
        }
    };

    /** Register Listeners */
    $YB.plugins.Hlsjs.prototype.registerListeners = function() {
        try {
            // Report events as Debug messages
            $YB.utils.listenAllEvents(this.tag);

            // Start buffer watcher. Requires data.enableNiceBuffer to be true.
            this.enableBufferMonitor();

            // Register Events
            var plugin = this;
            this.tag.addEventListener('play', function() {
                plugin.playHandler(); // Play is clicked (/start)
            });

            this.tag.addEventListener('playing', function() {
                plugin.playingHandler(); // Image starts moving after start, pause, seek or buffer (/joinTime), (/resume), (/seekEnd), (/bufferEnd)
            });

            this.tag.addEventListener('pause', function() {
                plugin.pauseHandler(); // Video pauses (/pause)
            });

            this.tag.addEventListener('ended', function() {
                plugin.endedHandler(); // video ends (/stop)
            });

            this.tag.addEventListener('seeking', function() {
                plugin.seekingHandler(); // video starts seeking
            });

            this.tag.addEventListener('error', function() {
                plugin.errorHandler(plugin.tag.error.code, "PLAY_FAILURE");
            });

            this.player.on(Hls.Events.ERROR, function(event, error) {
                if (error.fatal) {
                    plugin.errorHandler(error.details);
                }
            });
        } catch (err) {
            $YB.error(err);
        }
    };
}
