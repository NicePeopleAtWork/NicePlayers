/**
 * @license
 * Youbora Plugin Flowplayer
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * Tested with Flowplayer 6.0.3
 * @author Jordi Aguilar & Biel Conde
 */

if (typeof $YB != "undefined") {

    $YB.plugins.Flowplayer = function(playerId, options) {
        try {
            this.pluginName = "[name]";
            this.pluginVersion = "[ver]-[name]";

            this.startMonitoring(playerId, options);

            // Save player reference
            this.player = flowplayer('#' + playerId);

            // Save <video> item reference
            this.tag = document.getElementById(playerId).getElementsByTagName('video')[0]; // first <video> inside div

            this.registerListeners();
        } catch (err) {
            $YB.error(err);
        }
    };

    // Inherit from generic plugin.
    $YB.plugins.Flowplayer.prototype = new $YB.plugins.Generic();

    // Interface methods
    $YB.plugins.Flowplayer.prototype.getPlayhead = function() {
        return this.player.video.time;
    }

    $YB.plugins.Flowplayer.prototype.getMediaDuration = function() {
        return this.player.video.duration;
    }

    $YB.plugins.Flowplayer.prototype.getResource = function() {
        if (this.player.video.src) {
            return this.player.video.src;
        } else {
            return this._resource;
        }
    }

    $YB.plugins.Flowplayer.prototype.getPlayerVersion = function() {
        return "flowplayer " + flowplayer.version;
    }


    /** Register Listeners */
    $YB.plugins.Flowplayer.prototype.registerListeners = function() {
        try {
            // save context
            var context = this;

            // Listen all events if debugging
            $YB.utils.listenAllEvents(
                this.player.on, ["load", "ready", "stop", "finish", "beforeseek", "seek", /** /"progress"/**/ ],
                function(e) {
                    $YB.debug("Event: " + context.playerId + " > " + e.type)
                }
            );

            // Start buffer watcher
            this.enableBufferMonitor();

            // Register Listeners
            this.player.on("progress", function(ev, obj, playhead) {
                if (playhead > 0.1) {
                    if (context.firstProgressSent) {
                        context.joinHandler();
                    }

                    context.firstProgressSent = true;
                }
                context.seekedHandler();
            });

            this.player.on("pause", function() {
                if (context.getPlayhead() >= context.getMediaDuration()) {
                    context.endedHandler();
                } else {
                    context.pauseHandler();
                }
            });

            this.player.on("load", function(ev, obj, vid) {
                context._resource = vid.src;
                context.playHandler();

                //reset first progress flag
                context.firstProgressSent = false;
            });

            this.player.on("resume", function() {
                context.playHandler();
                context.resumeHandler();

                //reset first progress flag
                context.firstProgressSent = false;
            });

            this.player.on("stop", function() {
                context.endedHandler();
            });

            this.player.on("finish", function() {
                context.endedHandler();
            });

            this.player.on("error", function(ev, obj, error) {
                context._resource = error.video.src;
                context.errorHandler(error.code, error.message);
            });

            this.player.on("beforeseek", function() {
                context.seekingHandler();
            });

            this.player.on("seek", function() {
                //context.seekedHandler();
            });

        } catch (err) {
            $YB.error(err);
        }
    }
}
