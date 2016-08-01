/**
 * @license
 * Youbora VideoJS5 Plugin
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {
    $YB.plugins.Videojs5 = function(player, options) {
        try {
            this.pluginName = 'videojs5';
            this.pluginVersion = '5.1.2-videojs5';
            this.init(player.id(), options);

            // Save reference to the player
            this.player = player;

            // Set player type as it could not be detected yet.
            this.playerType = "videojs5-unknown";

            // Connect Adnalyzers
            this.connectAdnalyzers();

            // Start watcher.
            this.startAutobuffer();

            // Register listeners
            player.ready(this.registerCommon);
        } catch (err) {
            $YB.error(err);
        }
    };

    // Inherit from generic plugin.
    $YB.plugins.Videojs5.prototype = new $YB.plugins.Generic();

    $YB.plugins.Videojs5.prototype.detectPlayer = function() {
        this.playerType = "videojs5";

        if (this.player.tech_.hls) {
            this.playerType += "-hls";
        }

        if (this.player.mediainfo) {
            this.playerType += "-bcove";
        }

        if (this.player.ima) {
            this.playerType += "-ima";
        }

        $YB.notice("Player detected: " + this.playerType);
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
        if (this.player.tech_.hls && this.player.tech_.hls.bandwidth) {
            return this.player.tech_.hls.bandwidth;
        } else {
            return -1;
        }
    };

    $YB.plugins.Videojs5.prototype.getBitrate = function() {
        if (this.player.tech_.hls && this.player.tech_.hls.bytesReceived && this.player.tech_.hls.playlists.media() && this.player.tech_.hls.playlists.media().attributes) {
            return this.player.tech_.hls.playlists.media().attributes.BANDWIDTH;
        } else {
            return -1;
        }
    };

    $YB.plugins.Videojs5.prototype.getRendition = function() {
        return $YB.utils.parseNumber(this.getBitrate(), "");
    };

    $YB.plugins.Videojs5.prototype.getResource = function() {
        return this.player.currentSrc();
    };

    $YB.plugins.Videojs5.prototype.getPlayerVersion = function() {
        if (videojs.VERSION) {
            return this.playerType + " " + videojs.VERSION;
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
            $YB.utils.listenAllEvents(this);

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
        if (typeof $YB.adnalyzers.Ima != 'undefined' && this.player.ima) { // IMA
            this.adnalyzer = new $YB.adnalyzers.Ima(this);
        }
    };

}

/**
 * @license
 * Youbora Videojs5 Plugin
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */


if (typeof videojs != 'undefined') {
    videojs.plugin('youbora', function(options) { // Register the plugin in videojs plugins space.

        if (typeof this.youbora.plugin == 'undefined') { // First call of the plugin
            this.youbora.plugin = new $YB.plugins.Videojs5(this, options);

        } else { // Subsequent calls of the plugin.
            this.youbora.plugin.setOptions(options);
        }

    });
}
