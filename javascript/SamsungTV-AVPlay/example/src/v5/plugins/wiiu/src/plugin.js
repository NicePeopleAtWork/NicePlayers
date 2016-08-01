/**
 * @license
 * Youbora Plugin [ver]-WiiU
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.plugins.WiiU = function(playerId, options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = '[name]';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '[ver]-[name]';

            /* Initialize YouboraJS */
            this.init(playerId, options);

            // Register the listeners. Comment this line if you want to instantiate the plugin async.
            this.registerListeners();
        } catch (err) {
            $YB.error(err);
        }
    };

    // Extend Generic Plugin
    $YB.plugins.WiiU.prototype = new $YB.plugins.Generic;

    $YB.plugins.WiiU.prototype.getMediaDuration = function() {
        return this.player.duration;
    };

    $YB.plugins.WiiU.prototype.getPlayhead = function() {
        if (typeof this.player.currentTime != "undefined") {
            return this.player.currentTime;
        }

        return 0;
    };

    $YB.plugins.WiiU.prototype.getPlayerVersion = function() {
        return "WiiU";
    };

    /** Register Listeners */
    $YB.plugins.WiiU.prototype.registerListeners = function() {
        try {
            // Report events as Debug messages
            $YB.utils.listenAllEvents(this.player);

            // Start buffer watcher. Requires data.enableNiceBuffer to be true.
            this.startAutobuffer();

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
        } catch (err) {
            $YB.error(err);
        }
    };
}
