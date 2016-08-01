/**
 * @license
 * Youbora Plugin 5.3.0-dashjs
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.plugins.Dashjs = function(player, options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = 'dashjs';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '5.3.0-dashjs';

            /* Initialize YouboraJS */
            this.startMonitoring(player, options);
            this.tag = this.player.getVideoElement();

            // Register the listeners. Comment this line if you want to instantiate the plugin async.
            this.registerListeners();
        } catch (err) {
            $YB.error(err);
        }
    };

    // Extend Generic Plugin
    $YB.plugins.Dashjs.prototype = new $YB.plugins.Generic;

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.Dashjs.prototype.getPlayhead = function() {
        return this.tag.currentTime;
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.Dashjs.prototype.getMediaDuration = function() {
        return this.player.duration();
    };

    /** Returns the src of the resource or an empty string. */
    $YB.plugins.Dashjs.prototype.getResource = function() {
        return this.player.getSource();
    };

    /** Returns version of the player or an empty string. */
    $YB.plugins.Dashjs.prototype.getPlayerVersion = function() {
        return 'dash.js ' + this.player.getVersion();
    };

    /** Returns the current bitrate of the video or -1. */
    $YB.plugins.Dashjs.prototype.getBitrate = function() {
        var level = this.player.getQualityFor("video")
        return this.player.getBitrateInfoListFor("video")[level].bitrate;
    };

    /** Register Listeners */
    $YB.plugins.Dashjs.prototype.registerListeners = function() {
        try {
            // Report events as Debug messages
            $YB.utils.listenAllEvents(this.player.on, [null,
                dashjs.MediaPlayer.events.BUFFER_EMPTY,
                dashjs.MediaPlayer.events.BUFFER_LOADED,
                dashjs.MediaPlayer.events.CAN_PLAY,
                dashjs.MediaPlayer.events.ERROR,
                dashjs.MediaPlayer.events.MANIFEST_LOADED,
                dashjs.MediaPlayer.events.PLAYBACK_ENDED,
                dashjs.MediaPlayer.events.PLAYBACK_ERROR,
                dashjs.MediaPlayer.events.PLAYBACK_METADATA_LOADED,
                dashjs.MediaPlayer.events.PLAYBACK_PAUSED,
                dashjs.MediaPlayer.events.PLAYBACK_PLAYING,
                //dashjs.MediaPlayer.events.PLAYBACK_PROGRESS,
                dashjs.MediaPlayer.events.PLAYBACK_RATE_CHANGED,
                dashjs.MediaPlayer.events.PLAYBACK_SEEKED,
                dashjs.MediaPlayer.events.PLAYBACK_SEEKING,
                dashjs.MediaPlayer.events.PLAYBACK_STARTED,
                //dashjs.MediaPlayer.events.PLAYBACK_TIME_UPDATED,
                dashjs.MediaPlayer.events.STREAM_INITIALIZED,
                dashjs.MediaPlayer.events.LICENSE_REQUEST_COMPLETE,
                dashjs.MediaPlayer.events.PROTECTION_CREATED,
                dashjs.MediaPlayer.events.PROTECTION_DESTROYED
            ]);

            // Start buffer watcher. Requires data.enableNiceBuffer to be true.
            this.enableBufferMonitor();

            // Register Events
            var plugin = this;
            this.player.on(dashjs.MediaPlayer.events.PLAYBACK_STARTED, function() {
                plugin.playHandler(); // Play is clicked (/start)
            });
            this.player.on(dashjs.MediaPlayer.events.PLAYBACK_PLAYING, function() {
                plugin.playingHandler(); // Image starts moving after start, pause, seek or buffer (/joinTime), (/resume), (/seekEnd), (/bufferEnd)
            });
            this.player.on(dashjs.MediaPlayer.events.PLAYBACK_PAUSED, function() {
                plugin.pauseHandler(); // Video pauses (/pause)
            });
            this.player.on(dashjs.MediaPlayer.events.PLAYBACK_ENDED, function() {
                plugin.endedHandler(); // video ends (/stop)
            });
            this.player.on(dashjs.MediaPlayer.events.PLAYBACK_ERROR, function() {
                plugin.errorHandler(); // video error (/error)
            });
            this.player.on(dashjs.MediaPlayer.events.PLAYBACK_SEEKING, function() {
                plugin.seekingHandler(); // video starts seeking
            });
            this.player.on(dashjs.MediaPlayer.events.BUFFER_EMPTY, function() {
                plugin.bufferingHandler(); // video starts buffering. If this is natively informed, autobuffer is not needed.
            });
        } catch (err) {
            $YB.error(err);
        }
    };
}
