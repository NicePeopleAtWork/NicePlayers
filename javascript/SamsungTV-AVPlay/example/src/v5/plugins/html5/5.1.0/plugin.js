/**
 * @license
 * Youbora Plugin native html5 player
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != "undefined") {

    $YB.plugins.Html5 = function(playerId, options) {
        try {
            /** Name and platform of the plugin. ie: pc-name */
            this.pluginName = 'html5';

            /** Version of the plugin. ie: 3.0.0-name */
            this.pluginVersion = "5.1.0-html5";

            // Save player reference
            this.player = document.getElementById(playerId);

            // Save <video> item reference
            this.video = this.player;

            // Register the listeners. Comment this line if you want to instantiate the plugin async.
            this.init();
        } catch (err) {
            $YB.error(err);
        }
    }

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.Html5.prototype.getPlayhead = function() {
        return this.player.currentTime;
    }

    /** Returns the media duration of the video or 0. */
    $YB.plugins.Html5.prototype.getMediaDuration = function() {
        return this.player.duration;
    }

    /** Returns the src of the resource or an empty string. */
    $YB.plugins.Html5.prototype.getResource = function() {
        return this.player.currentSrc;
    }

    /** Register Listeners */
    $YB.plugins.Html5.prototype.init = function() {
        try {
            $YB.notice("Plugin " + this.pluginVersion + " is ready.");

            // If debug-util is included, report all events
            $YB.util.listenAllEvents(this.player);

            // save context
            var that = this;

            // Start loading
            this.player.addEventListener("loadstart", function(e) {
                if (typeof that.yapi == 'undefined') {
                    /** Instance of $YB.Api. Will send /data request. */
                    that.yapi = new $YB.Api(that, that.player.id, options);

                    // Start buffer watcher. Requires data.enableNiceBuffer to be true.
                    that.yapi.startAutobuffer();
                }
            });

            // Play is clicked (/start)
            this.player.addEventListener("play", function(e) {
                try {
                    that.yapi.handleStart();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Video starts (/joinTime) or resumes (resume)
            this.player.addEventListener("playing", function(e) {
                try {
                    if (that.yapi.isStartSent) {
                        if (that.yapi.isPaused) {
                            that.yapi.handleResume();
                        }
                        if (!that.yapi.isJoinSent) {
                            that.yapi.handleJoin();
                        }
                    }
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Video pauses (pause)
            this.player.addEventListener("pause", function(e) {
                try {
                    that.yapi.handlePause();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // video ends (stop)
            this.player.addEventListener("ended", function(e) {
                try {
                    that.yapi.handleStop();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // video error (error)
            this.player.addEventListener("error", function(e) {
                try {
                    that.yapi.handleError({
                        msg: "PLAY_FAILURE",
                        errorCode: 3001
                    });
                } catch (error) {
                    $YB.error(error);
                }
            });

            // video seek start
            this.player.addEventListener("seeking", function(e) {
                try {
                    that.yapi.handleSeekStart();
                } catch (error) {
                    $YB.error(error);
                }
            });

            //video seek end (seek)
            this.player.addEventListener("seeked", function(e) {
                try {
                    that.yapi.handleSeekEnd();
                } catch (error) {
                    $YB.error(error);
                }
            });
        } catch (err) {
            $YB.error(err);
        }
    }
}
