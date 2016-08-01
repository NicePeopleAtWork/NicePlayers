/**
 * @license
 * Youbora Plugin native LgHtml5 player
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != "undefined") {

    $YB.plugins.LgHtml5 = function(playerId, options) {
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

    /** Inherit from generic plugin */
    $YB.plugins.LgHtml5.prototype = new $YB.plugins.Generic;

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.LgHtml5.prototype.getPlayhead = function() {
        return this.player.currentTime;
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.LgHtml5.prototype.getMediaDuration = function() {
        return this.player.duration;
    };

    /** Returns the src of the resource or an empty string. */
    $YB.plugins.LgHtml5.prototype.getResource = function() {
        return this.player.currentSrc;
    };

    /** Register Listeners */
    $YB.plugins.LgHtml5.prototype.registerListeners = function() {
        try {
            // If debug-util is included, report all events
            $YB.utils.listenAllEvents(this.player);

            // Start buffer watcher. Requires data.enableNiceBuffer to be true.
            this.startAutobuffer();

            // save context
            var context = this;

            // Play is clicked (/start)
            this.player.addEventListener("play", function(e) {
                try {
                    context.playHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Video starts (/joinTime) or resumes (resume)
            this.player.addEventListener("playing", function(e) {
                try {
                    context.playingHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Video pauses (pause)
            this.player.addEventListener("pause", function(e) {
                try {
                    context.pauseHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // video ends (stop)
            this.player.addEventListener("ended", function(e) {
                try {
                    context.endedHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // video error (error)
            this.player.addEventListener("error", function(e) {
                try {
                    context.errorHandler("PLAY_FAILURE");
                } catch (error) {
                    $YB.error(error);
                }
            });

            // video seek start
            this.player.addEventListener("seeking", function(e) {
                try {
                    context.seekingHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });
        } catch (err) {
            $YB.error(err);
        }
    };
}
