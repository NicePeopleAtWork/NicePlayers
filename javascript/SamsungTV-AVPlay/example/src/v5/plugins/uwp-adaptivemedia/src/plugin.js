/**
 * @license
 * Youbora Plugin [ver]-UWPAdaptiveMedia
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.plugins.UWPAdaptiveMedia = function(playerId, options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = '[name]';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '[ver]-[name]';

            /* Initialize YouboraJS */
            this.startMonitoring(playerId, options);

            // Register the listeners. Comment this line if you want to instantiate the plugin async.
            this.registerListeners();
        } catch (err) {
            $YB.error(err);
        }
    };

    // Extend Generic Plugin
    $YB.plugins.UWPAdaptiveMedia.prototype = new $YB.plugins.Generic;


    /** Register and listen an instance of Windows.Media.Streaming.Adaptive.UWPAdaptiveMediaSource */
    $YB.plugins.UWPAdaptiveMedia.prototype.setMediaSource = function(ms) {
        this.mediaSource = ms;
    };


    /** Returns the current playhead of the video or 0. */
    $YB.plugins.UWPAdaptiveMedia.prototype.getPlayhead = function() {
        return this.player.currentTime;
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.UWPAdaptiveMedia.prototype.getMediaDuration = function() {
        return this.player.duration;
    };

    /** Returns true if the video is life, or false if it is a VOD. */
    $YB.plugins.UWPAdaptiveMedia.prototype.getIsLive = function() {
        if (this.mediaSource) {
            return this.mediaSource.isLive;
        } else {
            return undefined;
        }
    };

    /** Returns version of the player or an empty string. */
    $YB.plugins.UWPAdaptiveMedia.prototype.getPlayerVersion = function() {
        var p = Windows.ApplicationModel.Package.current.id.version;
        return "JS AdaptiveMedia " + p.major + "." + p.minor + "." + p.build + "." + p.revision;
    };

    /** Returns the current bitrate of the video or -1. */
    $YB.plugins.UWPAdaptiveMedia.prototype.getBitrate = function() {
        if (this.mediaSource) {
            return this.mediaSource.currentPlaybackBitrate;
        } else {
            return undefined;
        }
    };

    /** Returns the current throughput of the video or -1. */
    $YB.plugins.UWPAdaptiveMedia.prototype.getThroughput = function() {
        if (this.mediaSource) {
            return this.mediaSource.currentDownloadBitrate;
        } else {
            return undefined;
        }
    };

    /** Register Listeners */
    $YB.plugins.UWPAdaptiveMedia.prototype.registerListeners = function() {
        try {
            // Report events as Debug messages
            $YB.utils.listenAllEvents(this.player);

            // Start buffer watcher. Requires data.enableNiceBuffer to be true.
            this.enableBufferMonitor();

            // Register Events
            var plugin = this;

            this.player.addEventListener('loadstart', function() {
                plugin.playHandler(); // Play is clicked (/start)
            });

            this.player.addEventListener('play', function() { // To control playlists
                plugin.playHandler(); // Play is clicked (/start)
            });

            this.player.addEventListener('playing', function() {
                plugin.resumeHandler(); // Image starts moving after pause (/resume)
            });

            this.player.addEventListener('timeupdate', function() {
                if (plugin.getPlayhead() > 0.1) {
                    plugin.joinHandler(); // Image starts moving after start (/joinTime)
                }
            });

            this.player.addEventListener('pause', function() {
                plugin.pauseHandler(); // Video pauses (/pause)
            });

            this.player.addEventListener('ended', function() {
                plugin.endedHandler(); // video ends (/stop)
            });

            this.player.addEventListener('error', function() {
                plugin.errorHandler(); // video error (/error)
            });

            this.player.addEventListener('seeking', function() {
                plugin.seekingHandler(); // video starts seeking
            });

            this.player.addEventListener('seeked', function() {
                plugin.seekedHandler(); // video ends seeking
            });

        } catch (err) {
            $YB.error(err);
        }
    };
}
