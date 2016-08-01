/**
 * @license
 * Youbora Plugin Tizen
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    //Tizen console
    $YB.plainConsole = true;

    $YB.plugins.Tizen = function(player, options) {
        try {
            // Save reference of the options for later initialization.
            this.options = options;

            // Save player reference
            if (typeof player == "string") {
                this.player = document.getElementById(player);
            } else {
                this.player = player;
            }

            // Save <video> item reference
            this.video = this.player;

            // Register the listeners. Comment this line if you want to instantiate the plugin async.
            this.init();

            $YB.notice('Plugin ' + this.pluginVersion + ' is ready.');
        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.Tizen.prototype = {
        /** Name and platform of the plugin. ie: pc-name */
        pluginName: 'tizen',
        /** Version of the plugin. ie: 3.0.0-name */
        pluginVersion: '5.1.0-tizen',
        /** Reference to the player. */
        player: undefined,
        /** Reference to the <video> tag. */
        video: undefined,
        /** Instance of $YB.Api. */
        yapi: undefined,

        _resource: undefined
    };

    // Interface methods
    /** Returns the current playhead of the video or 0. */
    $YB.plugins.Tizen.prototype.getPlayhead = function() {
        return this.player.currentTime / 1000;
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.Tizen.prototype.getMediaDuration = function() {
        return Math.round(this.player.duration / 1000);
    };

    /** Returns true if the video is life, or false if it is a VOD. */
    $YB.plugins.Tizen.prototype.getIsLive = function() {
        return false;
    };

    /** Returns the current bitrate of the video or -1. */
    $YB.plugins.Tizen.prototype.getBitrate = function() {
        return -1;
    };

    /** Returns the src of the resource or an empty string. */
    $YB.plugins.Tizen.prototype.getResource = function() {
        return this._resource;
    };

    /** Returns version of the player or an empty string. */
    $YB.plugins.Tizen.prototype.getPlayerVersion = function() {
        return CONFIG.version;
    };

    /** Register Listeners */
    $YB.plugins.Tizen.prototype.init = function() {
        try {
            // save context
            var that = this;

            this.player.on('url', function(a) {
                that._resource = a;

                if (typeof that.yapi == "undefined") {
                    that.yapi = new $YB.Api(that, player.id || 'tizen', that.options);
                }
                that.yapi.handleStart();
            });

            this.player.on('play', function(e) {
                try {
                    if (that.yapi.isStartSent) {
                        if (!that.yapi.isJoinSent) {
                            that.yapi.chrono.joinTime.stop();
                            //that.yapi.handleJoin();
                        }
                        if (that.yapi.isPaused) {
                            that.yapi.handleResume();
                        }
                    }
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.player.on('durationchange', function(e) {
                try {
                    if (that.yapi.isStartSent) {
                        if (!that.yapi.isJoinSent) {
                            that.yapi.handleJoin();
                        }
                    }
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.player.on('pause', function(e) {
                try {
                    that.yapi.handlePause();
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.player.on('ended', function(e) {
                try {
                    that.yapi.handleStop();
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.player.on('stop', function(e) {
                try {
                    that.yapi.handleStop();
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.player.on('error', function(e, c) {
                try {
                    that.yapi.handleError({
                        msg: e,
                        errorCode: c
                    });
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.player.on('seek', function(e) {
                try {
                    that.yapi.handleSeekStart();
                    that.yapi.handleSeekEnd({
                        duration: that.yapi.chrono.pause.getDeltaTime()
                    });
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.player.on("statechange", function(a) {
                if (that.yapi.isJoinSent) {
                    if (that.yapi.isBuffering && a !== that.player.STATE_BUFFERING) {
                        that.yapi.handleBufferEnd();
                    }

                    if (!that.yapi.isBuffering && a === that.player.STATE_BUFFERING) {
                        that.yapi.handleBufferStart();
                    }
                }
            });

        } catch (err) {
            $YB.error(err);
        }
    };
}
