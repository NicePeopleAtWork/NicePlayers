/**
 * @license
 * Youbora Shakaplayer Plugin
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != "undefined") {

    $YB.plugins.Shaka = function(player, options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = '[name]';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '[ver]-[name]';

            /* Initialize YouboraJS */
            this.startMonitoring(player, options);

            this.tag = this.player.a;

            // Register the listeners. Comment this line if you want to instantiate the plugin async.
            this.registerListeners();
        } catch (err) {
            $YB.error(err);
        }
    };

    /** Inherit from generic plugin */
    $YB.plugins.Shaka.prototype = new $YB.plugins.Generic;

    // Interface methods
    $YB.plugins.Shaka.prototype.getPlayhead = function() {
        try {
            return this.tag.currentTime;
        } catch (err) {
            $YB.error(err);
            return 0;
        }
    }

    $YB.plugins.Shaka.prototype.getMediaDuration = function() {
        try {
            return this.tag.duration;
        } catch (err) {
            $YB.error(err);
            return 1;
        }
    }

    $YB.plugins.Shaka.prototype.getIsLive = function() {
        try {
            return this.player.isLive();
        } catch (err) {
            $YB.error(err);
            return false;
        }
    }

    $YB.plugins.Shaka.prototype.getThroughput = function() {
        try {
            return this.player.getStats().estimatedBandwidth;
        } catch (err) {
            $YB.error(err);
            return -1;
        }
    }

    $YB.plugins.Shaka.prototype.getBitrate = function() {
        try {
            return this.player.getStats().streamStats.videoBandwidth;
        } catch (err) {
            $YB.error(err);
            return -1;
        }
    }

    $YB.plugins.Shaka.prototype.getResource = function() {
        try {
            if (typeof this.player.b.la == "string") {
                return this.player.b.la;
            } else if (typeof this.player.b.f == "string") {
                return this.player.b.f;
            } else {
                return this.tag.currentSrc;
            }
        } catch (err) {
            $YB.error(err);
            return "";
        }
    }

    $YB.plugins.Shaka.prototype.getPlayerVersion = function() {
        try {
            return "Shaka " + shaka.player.Player.version;
        } catch (err) {
            $YB.error(err);
            return "shaka";
        }
    }

    /** Register Listeners */
    $YB.plugins.Shaka.prototype.registerListeners = function() {
        try {
            // Report events as Debug messages
            $YB.utils.listenAllEvents(this.tag);

            // save context
            var plugin = this;

            // Play is clicked (Start)
            this.tag.addEventListener("play", function(e) {
                try {
                    plugin.playHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Video starts (JoinTime)
            this.tag.addEventListener("playing", function(e) {
                try {
                    plugin.joinHandler();
                    plugin.resumeHandler();

                } catch (error) {
                    $YB.error(error);
                }
            });

            // Video pauses (pause)
            this.tag.addEventListener("pause", function(e) {
                try {
                    plugin.pauseHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // video ends (stop)
            this.tag.addEventListener("ended", function(e) {
                try {
                    plugin.endedHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // video error (error)
            this.player.addEventListener("error", function(e) {
                try {
                    plugin.errorHandler(e.detail.message);
                } catch (error) {
                    $YB.error(error);
                }
            });

            // video seek start
            this.tag.addEventListener("seeking", function(e) {
                try {
                    plugin.seekingHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            //video seek end (seek)
            this.tag.addEventListener("seeked", function(e) {
                try {
                    plugin.seekedHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            //video starts buffering
            this.player.addEventListener("bufferingStart", function(e) {
                try {
                    plugin.bufferingHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            //video ends buffering (Buffer)
            this.player.addEventListener("bufferingEnd", function(e) {
                try {
                    plugin.bufferedHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

        } catch (err) {
            $YB.error(err);
        }

    }
}
