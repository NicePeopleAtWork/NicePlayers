/**
 * @license
 * Youbora Videojs4 Plugin
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {
    $YB.plugins.Videojs4 = function(player, options) {
        try {
            this.pluginName = 'videojs4';
            this.pluginVersion = '5.1.0-videojs4';
            this.init(player.id(), options);

            // Save reference to the player
            this.player = player;

            // Determine playerType
            this.detectPlayer();

            // Start watcher.
            this.startAutobuffer();

            // Register listeners
            player.ready(this.registerCommon);
            if (this.player.getPlaybackStatistics) {
                player.ready(this.registerCastlabs);
            } else {
                player.ready(this.registerGeneric);
            }
        } catch (err) {
            $YB.error(err);
        }
    };

    // Inherit from generic plugin.
    $YB.plugins.Videojs4.prototype = new $YB.plugins.Generic();

    $YB.plugins.Videojs4.prototype.detectPlayer = function() {
        this.playerType = "videojs4";
        if (this.player.hls) {
            this.playerType += "-hls";
        } else if (this.player.getPlaybackStatistics) {
            this.playerType += "-castlabs";
        }

        if (this.player.ima) {
            this.playerType += "-ima";

            /* Connect Adnalyzers * /
            if (typeof $YB.adnalyzers.Ima3 != 'undefined') { // IMA3
                this.ads = new $YB.adnalyzers.Ima3(this, this.pluginName);
            }
            /**/
        }

        $YB.notice("Player detected: " + this.playerType);
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
        return Math.round(this.player.duration());
    };

    $YB.plugins.Videojs4.prototype.getThroughput = function() {
        if (this.player.hls && this.player.hls.bandwidth) {
            return this.player.hls.bandwidth;
        } else {
            return -1;
        }
    };

    $YB.plugins.Videojs4.prototype.getBitrate = function() {
        if (typeof this.player.getPlaybackStatistics == "function") {
            return this.player.getPlaybackStatistics().video.bandwidth;
        } else if (this.player.hls && this.player.hls.bytesReceived) {
            return this.player.hls.playlists.media().attributes.BANDWIDTH;
        } else {
            return -1;
        }
    };

    $YB.plugins.Videojs4.prototype.getRendition = function() {
        return $YB.utils.parseNumber(this.getBitrate(), "");
    };

    $YB.plugins.Videojs4.prototype.getResource = function() {
        if (this.player.manifestUrl) {
            return this.player.manifestUrl;
        } else {
            return this.player.currentSrc();
        }
    };

    $YB.plugins.Videojs4.prototype.getPlayerVersion = function() {
        if (videojs.VERSION) {
            return this.playerType + " " + videojs.VERSION;
        } else if (this.player.mediaPlayer.getVersion) {
            this.playerType + " " + this.player.mediaPlayer.getVersion();
        }
    };

    // Register Listeners
    $YB.plugins.Videojs4.prototype.registerCommon = function() {
        try {
            /* Print all events if debug is enabled. */
            $YB.utils.listenAllEvents(this);

            /* Register Events*/
            //this.on('playing', function(e) {
            //this.youbora.plugin.playingHandler();
            //});
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

            this.on('timeupdate', function(e) {
                try {
                    if (this.youbora.plugin.getPlayhead() > 0.1) {
                        this.youbora.plugin.playingHandler();
                    }
                } catch (error) {
                    $YB.error(error);
                }
            });


            this.on('error', function(e) {
                try {
                    this.youbora.plugin.errorHandler(this.error().code, this.error().message);
                    this.youbora.plugin.stopHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });
        } catch (error) {
            $YB.error(error);
        }
    };

    $YB.plugins.Videojs4.prototype.registerCastlabs = function() {
        try {
            /* Register Events*/
            this.on('play', function(e) {
                this.youbora.plugin.playHandler();
            });
            this.on('loadstart', function(e) {
                this.youbora.plugin.playHandler();
            });
        } catch (error) {
            $YB.error(error);
        }
    };

    $YB.plugins.Videojs4.prototype.registerGeneric = function() {
        try {
            /* Register Events*/
            this.on('play', function(e) {
                this.youbora.plugin.playHandler();
            });

        } catch (error) {
            $YB.error(error);
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
