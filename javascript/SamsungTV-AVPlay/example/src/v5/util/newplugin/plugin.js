/**
 * @license
 * Youbora Plugin [ver]-[name]
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author [author]
 */

if (typeof $YB != 'undefined') {

    $YB.plugins.[plugin_name] = function(playerId, options) {
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
    $YB.plugins.[plugin_name].prototype = new $YB.plugins.Generic;

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.[plugin_name].prototype.getPlayhead = function() {
        return 0;
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.[plugin_name].prototype.getMediaDuration = function() {
        return 0;
    };

    /** Returns true if the video is life, or false if it is a VOD. */
    $YB.plugins.[plugin_name].prototype.getIsLive = function() {
        return false;
    };

    /** Returns the title or an empty string. */
    $YB.plugins.[plugin_name].prototype.getTitle = function() {
        return '';
    };

    /** Returns the src of the resource or an empty string. */
    $YB.plugins.[plugin_name].prototype.getResource = function() {
        return 'unknown';
    };

    /** Returns version of the player or an empty string. */
    $YB.plugins.[plugin_name].prototype.getPlayerVersion = function() {
        return '';
    };

    /** Returns the current bitrate of the video or -1. */
    $YB.plugins.[plugin_name].prototype.getBitrate = function() {
        return -1;
    };

    /** Returns the current throughput of the video or -1. */
    $YB.plugins.[plugin_name].prototype.getThroughput = function() {
        return -1;
    };

    /** Returns the current rendition of the video or an empty string. */
    $YB.plugins.[plugin_name].prototype.getRendition = function() {
        return '';
    };

    /** Register Listeners */
    $YB.plugins.[plugin_name].prototype.registerListeners = function() {
        try {
            // Report events as Debug messages
            $YB.utils.listenAllEvents(this.player);

            // Start buffer watcher. Requires data.enableNiceBuffer to be true.
            this.enableBufferMonitor();

            // Register Events
            var plugin = this;
            this.player.addEventListener('play', function() {
                plugin.playHandler(); // Play is clicked (/start)
            });
            this.player.addEventListener('playing', function() {
                plugin.playingHandler(); // Image starts moving after start, pause, seek or buffer (/joinTime), (/resume), (/seekEnd), (/bufferEnd)
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
            this.player.addEventListener('buffering', function() {
                plugin.bufferingHandler(); // video starts buffering. If this is natively informed, autobuffer is not needed.
            });
        } catch (err) {
            $YB.error(err);
        }
    };
}
