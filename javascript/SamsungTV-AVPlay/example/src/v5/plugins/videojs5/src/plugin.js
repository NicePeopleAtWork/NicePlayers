/**
 * @license
 * Youbora VideoJS5 Plugin
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {
    $YB.plugins.Videojs5 = function(player, options) {
        try {
            this.pluginName = '[name]-unknown';
            this.pluginVersion = '[ver]-[name]';

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
    $YB.plugins.Videojs5.prototype = new $YB.plugins.Generic();

    $YB.plugins.Videojs5.prototype.detectPlayer = function() {
        this.pluginName = "[name]";

        if (this.getTech().hls) {
            this.pluginName += "-hlsC";
        }

        if (this.getTech().hls_) {
            this.pluginName += "-hlsjs";
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

    $YB.plugins.Videojs5.prototype.getTech = function() {

        // NOTE: Videojs discourages accessing techs from plugins because they want
        // devs to develop tech-agnostic plugins. I don't think this applies to us,
        // as we have to retrieve info from each different tech.
        // https://github.com/videojs/video.js/issues/2617
        return this.player.tech({ IWillNotUseThisInPlugins: true });
    };


    // Methods
    $YB.plugins.Videojs5.prototype.getPlayhead = function() {
        if (this.player.absoluteTime) {
            return this.player.absoluteTime();
        } else {
            return this.player.currentTime();
        }
    };

    $YB.plugins.Videojs5.prototype.getMediaDuration = function() {
        if (this.player.mediainfo && typeof this.player.mediainfo.duration != "undefined") {
            return Math.round(this.player.mediainfo.duration);
        } else {
            return Math.round(this.player.duration());
        }
    };

    $YB.plugins.Videojs5.prototype.getThroughput = function() {
        if (this.getTech().hls && this.getTech().hls.bandwidth) {
            return this.getTech().hls.bandwidth;
        } else {
            return -1;
        }
    };

    $YB.plugins.Videojs5.prototype.getBitrate = function() {
        try {
            if (this.getTech().hls) { //contrib hls
                return this.getTech().hls.playlists.media().attributes.BANDWIDTH;
            } else if (this.getTech().hls_) { // hlsjs
                return this.getTech().hls_.levels[this.getTech().hls_.currentLevel].bitrate;
            } else {
                return -1;
            }
        } catch (err) {
            return -1;
        }
    };

    $YB.plugins.Videojs5.prototype.getRendition = function() {
        try {
            if (this.getTech().hls) { //contrib hls
                var att = this.getTech().hls.playlists.media().attributes;
                if (att.NAME) {
                    return att.NAME;
                } else if (att.RESOLUTION.width) {
                    return att.RESOLUTION.width + "x" + att.RESOLUTION.height + "@" + att.BANDWIDTH;
                } else {
                    return null;
                }
            } else if (this.getTech().hls_) { // hlsjs
                var level = this.getTech().hls_.levels[this.getTech().hls_.currentLevel];
                if (level.name) {
                    return level.name;
                } else if (level.bitrate) {
                    return (level.width + "x" + level.height + "@" + level.bitrate);
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }

        return $YB.utils.parseNumber(this.getBitrate(), "");
    };

    $YB.plugins.Videojs5.prototype.getResource = function() {
        if (this.getTech().hls_) {
            return this.getTech().hls_.url;
        } else {
            return this.player.currentSrc();
        }
    };

    $YB.plugins.Videojs5.prototype.getPlayerVersion = function() {
        if (videojs.VERSION) {
            return this.pluginName + " " + videojs.VERSION;
        }
    };

    $YB.plugins.Videojs5.prototype.getTitle = function() {
        if (this.player.mediainfo && this.player.mediainfo.name) {
            return this.player.mediainfo.name;
        } else {
            return undefined;
        }
    };

    // Register Listeners
    $YB.plugins.Videojs5.prototype.registerCommon = function() {
        try {

            /* Print all events if debug is enabled. */
            $YB.utils.listenAllEvents(this, ["adstart", "adend", "adskip", "adsready", "adserror"]);

            /* Register Events*/
            this.on('loadstart', function(e) {
                this.youbora.plugin.detectPlayer();
            });

            this.on('play', function(e) {
                this.youbora.plugin.playHandler();

                // Start adnalyzers
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

    $YB.plugins.Videojs5.prototype.connectAdnalyzers = function() {
        if (typeof $YB.adnalyzers.BrightcoveAds != 'undefined' && this.player.mediainfo && this.player.ads && (this.player.ima3)) { // Brightcove Ads
            this.adnalyzer = new $YB.adnalyzers.BrightcoveAds(this);
        } else if (typeof $YB.adnalyzers.Ima != 'undefined' && this.player.ima) { // IMA
            this.adnalyzer = new $YB.adnalyzers.Ima(this);
        }
    };

}
