/**
 * @license
 * Youbora VideoJS5 Plugin
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {
    $YB.plugins.Videojs5 = function(options) {
        try {
            if (typeof this.youbora.yapi == 'undefined') { // First call of the plugin

                // Version
                this.youbora.pluginName = 'videojs5';
                this.youbora.pluginVersion = '5.1.0-videojs5';

                // Save reference to the player
                this.youbora.player = this;

                // Methods
                this.youbora.getPlayhead = function() {
                    return this.player.currentTime();
                }

                this.youbora.getMediaDuration = function() {
                    return Math.round(this.player.duration());
                }

                this.youbora.getIsLive = function() {
                    var d = this.player.duration();
                    return (isNaN(d) || d === Infinity || d <= 0);
                }

                this.youbora.getBitrate = function() {
                    return -1;
                }

                this.youbora.getResource = function() {
                    return this.player.currentSrc();
                }

                this.youbora.getPlayerVersion = function() {
                    return videojs.VERSION;
                }

                // Instantiate Lib objects
                this.youbora.yapi = new $YB.Api(this.youbora, this.id(), options);

                // Register Listeners
                this.ready(function() {
                    try {
                        $YB.notice('Plugin ' + this.youbora.pluginVersion + ' is ready.');

                        /* Start watcher */
                        this.youbora.yapi.startAutobuffer();

                        /* Print all events if debug-util is included. */
                        $YB.util.listenAllEvents(this.youbora.player);
                    } catch (error) {
                        $YB.error(error);
                    }
                });

                // Play is clicked (Start)
                this.on('play', function(e) {
                    try {
                        if (!this.youbora.yapi.isStartSent) {
                            this.youbora.yapi.handleStart({
                                duration: 0 //Force duration 0, as videojs can't retrieve it before joinTime.
                            });
                        }
                    } catch (error) {
                        $YB.error(error);
                    }
                });

                // Video starts (JoinTime)
                this.on('playing', function(e) {
                    try {
                        if (this.youbora.yapi.isStartSent) {
                            if (this.youbora.yapi.isPaused) {
                                this.youbora.yapi.handleResume();
                            }
                        }

                    } catch (error) {
                        $YB.error(error);
                    }
                });

                this.on('timeupdate', function(e) {
                    try {
                        //$YB.log(this.currentTime());
                        if (this.youbora.yapi.isStartSent && !this.youbora.yapi.isJoinSent && this.youbora.player.currentTime() > 0.1) {
                            this.youbora.yapi.handleJoin();
                        }
                    } catch (error) {
                        $YB.error(error);
                    }
                });

                this.on('pause', function(e) {
                    try {
                        this.youbora.yapi.handlePause();
                    } catch (error) {
                        $YB.error(error);
                    }
                });

                this.on('abort', function(e) {
                    try {
                        this.youbora.yapi.handleStop();
                    } catch (error) {
                        $YB.error(error);
                    }
                });

                this.on('ended', function(e) {
                    try {
                        this.youbora.yapi.handleStop();
                    } catch (error) {
                        $YB.error(error);
                    }
                });

                this.on('error', function(e) {
                    try {
                        this.youbora.yapi.handleError({
                            msg: this.error().message,
                            errorCode: this.error().code
                        });
                        this.youbora.yapi.handleStop();
                    } catch (error) {
                        $YB.error(error);
                    }
                });

                this.on('seeking', function(e) {
                    try {
                        this.youbora.yapi.handleSeekStart();
                    } catch (error) {
                        $YB.error(error);
                    }
                });

                this.on('seeked', function(e) {
                    try {
                        this.youbora.yapi.handleSeekEnd();
                    } catch (error) {
                        $YB.error(error);
                    }
                });

                /* Connect Adnalyzers */
                if (typeof this.ima != 'undefined' && typeof $YB.adnalyzers.Ima3 != 'undefined') { // IMA3
                    this.youbora.ads = new $YB.adnalyzers.Ima3(this.youbora, this.youbora.pluginName);
                }
            } else {
                this.youbora.yapi.data.setOptions(options);
            }
        } catch (err) {
            $YB.error(err);
        }
    }

    try {
        if (typeof videojs != 'undefined') {
            videojs.plugin('youbora', $YB.plugins.Videojs5); // Register in videojs plugins.
        }
    } catch (err) {
        $YB.error(err);
    }
}
