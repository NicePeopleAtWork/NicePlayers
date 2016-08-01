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
            this.pluginName = "flowplayer";
            this.pluginVersion = "5.2.0-flowplayer";
            this.init(playerId, options);

            // Save player reference
            this.player = flowplayer('#' + this.playerId);

            // Save <video> item reference
            this.tag = document.getElementById(this.playerId).getElementsByTagName('video')[0]; // first <video> inside div

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
        return this.player.version;
    }

    /** Register Listeners */
    $YB.plugins.Flowplayer.prototype.registerListeners = function() {
        try {
            // save context
            var context = this;

            // Listen all events if debugging
            $YB.utils.listenAllEvents(this.player.on, ["load", "ready", "stop", "finish", "beforeseek", "seek"], function(e) {
                $YB.debug("Event: " + context.playerId + " > " + e.type)
            });

            // Start buffer watcher
            this.startAutobuffer();

            // Register Listeners
            this.player.on("progress", function() {
                if (context.isFirstProgressSent)
                    context.joinHandler();

                context.isFirstProgressSent = true;
            });
            this.player.on("pause", function() {
                if (context.getPlayhead() >= context.getMediaDuration()) {
                    context.endedHandler();
                } else {
                    context.pauseHandler();
                }
            });
            this.player.on("load", function(ev, obj, vid) {
                context.isFirstProgressSent = false;
                context._resource = vid.src;
                if (!context.isStartSent) {
                    context.videoApi.sendStart();
                }
            });
            this.player.on("resume", function() {
                context.isFirstProgressSent = false;
                context.playHandler();
                context.resumeHandler();
            });
            this.player.on("stop finish", function() {
                context.stopHandler();
            });
            this.player.on("error", function(ev, obj, error) {
                context.errorHandler(error.code, error.message);
            });
            this.player.on("beforeseek", function() {
                context.seekingHandler();
            });
            this.player.on("seek", function() {
                context.seekedHandler();
            });
        } catch (err) {
            $YB.error(err);
        }
    }
}
