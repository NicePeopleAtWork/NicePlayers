    $YB.plugins.LgMoonstone = function(player, options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = '[name]';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '[ver]-[name]';

            /* Initialize YouboraJS */
            this.init(player, options);

            /** Reference to the <video> tag. */
            this.tag = player.$.video.hasNode();

            // Register the listeners. Comment this line if you want to instantiate the plugin async.
            this.registerListeners();
        } catch (err) {
            $YB.error(err);
        }
    };

    /** Inherit from generic plugin */
    $YB.plugins.LgMoonstone.prototype = new $YB.plugins.Generic;

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.LgMoonstone.prototype.getPlayhead = function() {
        return this.tag.currentTime;
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.LgMoonstone.prototype.getMediaDuration = function() {
        return this.tag.duration;
    };

    /** Returns the src of the resource or an empty string. */
    $YB.plugins.LgMoonstone.prototype.getResource = function() {
        return this.tag.currentSrc;
    };

    /** Returns version of the player or an empty string. */
    $YB.plugins.LgMoonstone.prototype.getPlayerVersion = function() {
        return enyo.version.moonstone;
    };

    /** Register Listeners */
    $YB.plugins.LgMoonstone.prototype.init = function() {
        try {
            // If debug-util is included, report all events
            $YB.util.listenAllEvents(this.tag);

            // Start buffer watcher. Requires data.enableNiceBuffer to be true.
            this.yapi.startAutobuffer();

            var plugin = this;

            // Play is clicked (/start)
            this.tag.addEventListener("play", function(e) {
                try {
                    if (!plugin.yapi.isStartSent) {
                        plugin.videoApi.sendStart();
                    }
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Video starts (/joinTime) or resumes (resume)
            this.tag.addEventListener("playing", function(e) {
                try {
                    if (plugin.yapi.isStartSent) {
                        if (plugin.yapi.isPaused) {
                            plugin.videoApi.sendResume();
                        }
                        if (!plugin.yapi.isJoinSent) {
                            plugin.videoApi.sendJoin();
                        }
                    }
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Video pauses (pause)
            this.tag.addEventListener("pause", function(e) {
                try {
                    plugin.videoApi.sendPause();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // video ends (stop)
            this.tag.addEventListener("ended", function(e) {
                try {
                    plugin.videoApi.sendStop();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // video error (error)
            this.tag.addEventListener("error", function(e) {
                try {
                    plugin.videoApi.sendError({
                        msg: "PLAY_FAILURE",
                        errorCode: 3001
                    });
                } catch (error) {
                    $YB.error(error);
                }
            });

            // video seek start
            this.tag.addEventListener("seeking", function(e) {
                try {
                    plugin.videoApi.sendSeekStart();
                } catch (error) {
                    $YB.error(error);
                }
            });

            //video seek end (seek)
            this.tag.addEventListener("seeked", function(e) {
                try {
                    plugin.videoApi.sendSeekEnd();
                } catch (error) {
                    $YB.error(error);
                }
            });
        } catch (err) {
            $YB.error(err);
        }
    };
