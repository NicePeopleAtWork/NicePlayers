/**
 * @license
 * Youbora Plugin BraviaHtml5
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.plugins.BraviaHtml5 = function(playerId, options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = 'bravia-html5';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '5.1.0-bravia-html5';

            /* Initialize YouboraJS */
            this.init(playerId, options);

            // Register the listeners. Comment this line if you want to instantiate the plugin async.
            this.registerListeners();
        } catch (err) {
            $YB.error(err);
        }
    };

    // Extend Generic Plugin
    $YB.plugins.BraviaHtml5.prototype = new $YB.plugins.Generic;

    $YB.plugins.BraviaHtml5.prototype.getResource = function() {
        return this.player.currentSrc;
    };

    $YB.plugins.BraviaHtml5.prototype.getMediaDuration = function() {
        return this.player.duration;
    };

    $YB.plugins.BraviaHtml5.prototype.getPlayhead = function() {
        return this.player.currentTime;
    };

    $YB.plugins.BraviaHtml5.prototype.getPlayerVersion = function() {
        return "Sony Bravia";
    };

    /** Register Listeners */
    $YB.plugins.BraviaHtml5.prototype.registerListeners = function() {
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
                plugin.errorHandler("PLAY_FAILURE"); // video error (/error)
            });
            this.player.addEventListener('seeking', function() {
                plugin.seekingHandler(); // video starts seeking
            });


        } catch (err) {
            $YB.error(err);
        }
    };
}
