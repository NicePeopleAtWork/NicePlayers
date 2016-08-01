/**
 * @license
 * Youbora Plugin LgTv WebOS
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    /* ENYO XHR FIX */
    $YB.AjaxRequest.prototype.createXHR = function() {
        try {
            return new enyo.Ajax();
        } catch (err) {
            $YB.error(err);
            return {};
        }
    };

    $YB.AjaxRequest.prototype.getXHR = function() {
        return this.xhr.xhr;
    };

    $YB.AjaxRequest.prototype.on = function(event, callback) {
        try {
            if (typeof callback != "undefined" && typeof callback != "function") {
                $YB.warn("Warning: Request '" + this.getUrl() + "' has a callback that is not a function.");
                return this;
            }

            if (event == 'error') {
                this.hasError = true;
                this.xhr.error(callback);
            } else {
                this.xhr.response(callback);
            }

        } catch (err) {
            $YB.error(err);
        } finally {
            return this;
        }
    };

    $YB.AjaxRequest.prototype.send = function() {
        try {
            this.xhr.url = this.getUrl();
            this.xhr.handleAs = 'xml';
            this.xhr.method = this.options.method;

            if (this.options.requestHeaders) {
                this.xhr.headers = this.options.requestHeaders;
            }

            if (!this.hasError && this.options.retryAfter > 0 && this.options.maxRetries > 0) {
                var that = this;
                this.error(function genericError() {
                    that.retries++;
                    if (that.retries > that.options.maxRetries) {
                        $YB.error("Error: Aborting failed request. Max retries reached.");
                    } else {
                        $YB.error("Error: Request failed. Retry " + that.retries + " of " + that.options.maxRetries + " in " + that.options.retryAfter + "ms.");

                        setTimeout(function() {
                            that.xhr.errorHandlers = [];
                            that.send();
                        }, that.options.retryAfter);
                    }
                });
            }

            $YB.report("XHR Req: " + this.getUrl(), 5, 'navy');

            this.xhr.go();

        } catch (err) {
            $YB.error(err);
        }
    };
    /**/

    $YB.plugins.LgMoonstone = function(player, options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = 'lg-moonstone';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '5.1.0-lg-moonstone';

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

}
