/**
 * @license
 * Youbora Plugin [ver]-BitdashVR
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.plugins.BitdashVR = function(playerId, options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = '[name]';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '[ver]-[name]';

            /* Initialize YouboraJS */
            this.init(playerId, options);

            // Register the listeners. Comment this line if you want to instantiate the plugin async.
            var context = this;
            this.player.addEventHandler('onReady', function() { context.registerListeners(); });
        } catch (err) {
            $YB.error(err);
        }
    };

    // Extend Generic Plugin
    $YB.plugins.BitdashVR.prototype = new $YB.plugins.Generic;

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.BitdashVR.prototype.getPlayhead = function() {
        return this.player.getCurrentTime();
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.BitdashVR.prototype.getMediaDuration = function() {
        return this.player.getDuration();
    };

    /** Returns true if the video is life, or false if it is a VOD. */
    $YB.plugins.BitdashVR.prototype.getIsLive = function() {
        return this.player.isLive();
    };

    /** Returns the src of the resource or an empty string. */
    $YB.plugins.BitdashVR.prototype.getResource = function() {
        if (this.player.getConfig && this.player.getConfig().source.dash) {
            return this.player.getConfig().source.dash;
        } else {
            return 'unknown';
        }
    };

    /** Returns version of the player or an empty string. */
    $YB.plugins.BitdashVR.prototype.getPlayerVersion = function() {
        return "bitdash " + this.player.getVersion();
    };

    /** Returns the current bitrate of the video or -1. */
    $YB.plugins.BitdashVR.prototype.getBitrate = function() {
        if (this.player.getPlaybackVideoData && this.player.getPlaybackVideoData()) {
            return this.player.getPlaybackVideoData().bitrate;
        } else {
            return -1;
        }
    };

    /** Returns the current rendition of the video or an empty string. */
    $YB.plugins.BitdashVR.prototype.getRendition = function() {
        if (this.player.getPlaybackVideoData && this.player.getPlaybackVideoData()) {
            return this.player.getPlaybackVideoData().id;
        } else {
            return -1;
        }
    };

    /** Register Listeners */
    $YB.plugins.BitdashVR.prototype.registerListeners = function() {
        try {
            // Report events as Debug messages
            $YB.utils.listenAllEvents(this.player.addEventHandler, [
                'onPlay',
                'onPause',
                'onSeek',
                'onSeeked',
                'onPlaybackFinished',
                'onError',
                'onStartBuffering',
                'onStopBuffering',
                'onVideoPlaybackQualityChange',
                'onCueEnter',
                'onCueExit',
                'onAdStarted',
                'onAdSkipped',
                'onAdFinished',
                'onVRModeChanged',
                'onSourceLoaded'
            ]);

            // Start buffer watcher. Requires data.enableNiceBuffer to be true.
            //this.startAutobuffer();

            // Register Events
            var plugin = this;
            this.player.addEventHandler('onPlay', function() {
                plugin.playHandler(); // Play is clicked (/start)
                plugin.resumeHandler(); // Resume is clicked (/resume)
            });

            this.player.addEventHandler('onTimeChanged', function() {
                //plugin.playingHandler(); // Image starts moving after start, pause, seek or buffer (/joinTime), (/resume), (/seekEnd), (/bufferEnd)
            });

            this.player.addEventHandler('onPause', function() {
                plugin.pauseHandler(); // Video pauses (/pause)
            });

            this.player.addEventHandler('onPlaybackFinished', function() {
                plugin.endedHandler(); // video ends (/stop)
            });

            this.player.addEventHandler('onError', function(e) {
                plugin.errorHandler(e.code, e.message); // video error (/error)
            });

            this.player.addEventHandler('onSeek', function() {
                plugin.seekingHandler(); // video starts seeking
            });

            this.player.addEventHandler('onSeeked', function() {
                plugin.seekedHandler(); // video ends seeking
            });

            this.player.addEventHandler('onStartBuffering', function() {
                plugin.bufferingHandler(); // video starts buffering.
            });

            this.player.addEventHandler('onStopBuffering', function() {
                plugin.bufferedHandler(); // video ends buffering.
            });
        } catch (err) {
            $YB.error(err);
        }
    };
}
