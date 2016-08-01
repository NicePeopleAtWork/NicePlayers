/**
 * @license
 * Youbora VideoJS5 Plugin
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {
    $YB.plugins.Videojs5 = function(options) {
        try {
            // Version
            this.pluginName = 'pc-videojs5';
            this.pluginVersion = '3.1.0-videojs5';

            // Methods
            this.getPlayhead = function() {
                return this.currentTime();
            }

            this.getMediaDuration = function() {
                return Math.round(this.duration());
            }

            this.getIsLive = function() {
                var d = this.duration();
                return (isNaN(d) || d === Infinity || d <= 0);
            }

            this.getBitrate = function() {
                return -1;
            }

            this.getResource = function() {
                return this.currentSrc();
            }

            this.getPlayerVersion = function() {
                return videojs.CDN_VERSION;
            }

            // Instantiate Lib objects
            this.yapi = new $YB.Api(this, this.id(), options);

            // Register Listeners
            this.ready(function() {
                try {
                    $YB.notice('Plugin ' + this.pluginVersion + ' is ready.');

                    /* Start watcher */
                    this.yapi.startAutobuffer();

                    /* Print all events if debug-util is included. */
                    $YB.util.listenAllEvents(this);
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Play is clicked (Start)
            this.on('play', function(e) {
                try {
                    if (!this.yapi.isStartSent) {
                        this.yapi.handleStart({
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
                    if (this.yapi.isStartSent) {
                        if (this.yapi.isPaused) {
                            this.yapi.handleResume();
                        }
                    }

                } catch (error) {
                    $YB.error(error);
                }
            });

            this.on('timeupdate', function(e) {
                try {
                    //$YB.log(this.currentTime());
                    if (this.yapi.isStartSent && !this.yapi.isJoinSent && this.currentTime() > 0.1) {
                        this.yapi.handleJoin();
                    }
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.on('pause', function(e) {
                try {
                    this.yapi.handlePause();
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.on('abort', function(e) {
                try {
                    this.yapi.handleStop();
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.on('ended', function(e) {
                try {
                    this.yapi.handleStop();
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.on('error', function(e) {
                try {
                    this.yapi.handleError({
                        msg: this.error().message,
                        errorCode: this.error().code
                    });
                    this.yapi.handleStop();
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.on('seeking', function(e) {
                try {
                    this.yapi.handleSeekStart();
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.on('seeked', function(e) {
                try {
                    this.yapi.handleSeekEnd();
                } catch (error) {
                    $YB.error(error);
                }
            });
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