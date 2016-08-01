/**
 * @license
 * Youbora Videojs4 Plugin
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {
    $YB.plugins.Videojs4 = function(player, options) {
        try {
            this.pluginName = 'videojs4-unknown';
            this.pluginVersion = '5.3.0-videojs4';

            // Save player reference
            this.startMonitoring(player, options);
            this.playerId = player.id();

            // Start watcher.
            this.enableBufferMonitor();

            // Register listeners
            player.ready(this.registerCommon);
        } catch (err) {
            $YB.error(err);
        }
    };

    // Inherit from generic plugin.
    $YB.plugins.Videojs4.prototype = new $YB.plugins.Generic();

    $YB.plugins.Videojs4.prototype.detectPlayer = function() {
        this.pluginName = "videojs4";

        if (this.player.hls) {
            this.pluginName += "-hls";
        } else if (this.player.getPlaybackStatistics) {
            this.pluginName += "-castlabs";
        }

        if (this.player.mediainfo) {
            this.pluginName += "-bcove";
        }

        if (this.player.ima || this.player.ima3) {
            this.pluginName += "-ima";
        }

        if (this.player.FreeWheelPlugin) {
            this.pluginName += "-fw";
        }

        $YB.notice("Player detected: " + this.pluginName);

        // Connect Adnalyzers
        this.connectAdnalyzers();
    };

    // Methods
    $YB.plugins.Videojs4.prototype.getPlayhead = function() {
        if (this.player.absoluteTime) {
            return this.player.absoluteTime();
        } else {
            return this.player.currentTime();
        }
    };

    $YB.plugins.Videojs4.prototype.getMediaDuration = function() {
        if (this.player.mediainfo && typeof this.player.mediainfo.duration != "undefined") {
            return Math.round(this.player.mediainfo.duration);
        } else {
            return Math.round(this.player.duration());
        }
    };

    $YB.plugins.Videojs4.prototype.getThroughput = function() {
        try {
            if (this.player.hls && this.player.hls.bandwidth) {
                return this.player.hls.bandwidth;
            } else {
                return -1;
            }
        } catch (err) {
            return -1;
        }
    };

    $YB.plugins.Videojs4.prototype.getBitrate = function() {
        try {
            if (typeof this.player.getPlaybackStatistics == "function") {
                return this.player.getPlaybackStatistics().video.bandwidth;
            } else if (this.player.hls && this.player.hls.bytesReceived) {
                return this.player.hls.playlists.media().attributes.BANDWIDTH;
            } else {
                return -1;
            }
        } catch (err) {
            return -1;
        }
    };

    $YB.plugins.Videojs4.prototype.getRendition = function() {
        try {
            if (this.player.hls) {
                var att = this.player.hls.playlists.media().attributes;
                if (att.NAME) {
                    return att.NAME;
                } else if (att.RESLOUTION.width) {
                    return att.RESOLUTION.width + "x" + att.RESOLUTION.height + "@" + att.BANDWIDTH;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    };

    $YB.plugins.Videojs4.prototype.getResource = function() {
        if (this.player.manifestUrl) {
            return this.player.manifestUrl;
        } else if (this.player.ads && this.player.ads.contentSrc) {
            return this.player.ads.contentSrc;
        } else if (this.player.src && this.player.src()) {
            return this.player.src();
        } else {
            return this.player.currentSrc()
        }
    };

    $YB.plugins.Videojs4.prototype.getPlayerVersion = function() {
        if (videojs.VERSION) {
            return this.pluginName + " " + videojs.VERSION;
        } else if (this.player.mediaPlayer.getVersion) {
            return this.pluginName + " " + this.player.mediaPlayer.getVersion();
        }
    };

    $YB.plugins.Videojs4.prototype.getTitle = function() {
        if (this.player.mediainfo && this.player.mediainfo.name) {
            return this.player.mediainfo.name;
        } else {
            return undefined;
        }
    };

    // Register Listeners
    $YB.plugins.Videojs4.prototype.registerCommon = function() {
        try {
            /* Print all events if debug is enabled. */
            $YB.utils.listenAllEvents(this);

            /* Register Events*/
            this.on('loadstart', function(e) {
                this.youbora.plugin.detectPlayer();
            });

            this.on('play', function(e) {
                this.youbora.plugin.playHandler();

                if (this.youbora.plugin.adnalyzer && this.youbora.plugin.adnalyzer.registerVideojs) {
                    this.youbora.plugin.adnalyzer.registerVideojs();
                }
            });

            this.on('playing', function(e) {
                this.youbora.plugin.resumeHandler();
            });

            this.on('pause', function(e) {
                this.youbora.plugin.pauseHandler();
            });

            this.on('abort', function(e) {
                this.youbora.plugin.endedHandler();
            });

            this.on('ended', function(e) {
                this.youbora.plugin.endedHandler();
            });

            this.on('seeking', function(e) {
                this.youbora.plugin.seekingHandler();
            });

            this.on('seeked', function(e) {
                // We save the playhead after the seek, we will send the seeked in the next timeupdate
                this.youbora.plugin.seekPlayhead = this.youbora.plugin.getPlayhead();
            });

            this.on('timeupdate', function(e) {
                try {
                    if (this.youbora.plugin.getPlayhead() > 0.1) {
                        this.youbora.plugin.joinHandler();

                        // Send seekend
                        if (this.youbora.plugin.seekPlayhead &&
                            this.youbora.plugin.seekPlayhead != this.youbora.plugin.getPlayhead()
                        ) {
                            this.youbora.plugin.seekedHandler();
                            this.youbora.plugin.seekPlayhead = false;
                        }
                    }
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.on('error', function(e) {
                try {
                    this.youbora.plugin.errorHandler(this.error().code, this.error().message);
                } catch (error) {
                    $YB.error(error);
                }
            });
        } catch (error) {
            $YB.error(error);
        }
    };

    $YB.plugins.Videojs4.prototype.connectAdnalyzers = function() {
        if (typeof $YB.adnalyzers.Ima != 'undefined' && this.player.ima) { // IMA
            this.adnalyzer = new $YB.adnalyzers.Ima(this);
        }

        if (typeof $YB.adnalyzers.BrightcoveAds != 'undefined' && this.player.mediainfo && this.player.ads && (this.player.ima3)) { // Brightcove Ads
            this.adnalyzer = new $YB.adnalyzers.BrightcoveAds(this);
        }
    };
}

/**
 * @license
 * Youbora Videojs4 Plugin
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof videojs != 'undefined') {
    videojs.plugin('youbora', function(options) { // Register the plugin in videojs plugins space.

        if (typeof this.youbora.plugin == 'undefined') { // First call of the plugin
            this.youbora.plugin = new $YB.plugins.Videojs4(this, options);

        } else { // Subsequent calls of the plugin.
            this.youbora.plugin.setOptions(options);
        }

    });
}
