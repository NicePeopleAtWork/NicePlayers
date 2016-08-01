/**
 * @license
 * Youbora Plugin 5.3.1-clappr
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.plugins.Clappr = function(player, options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = 'clappr';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '5.3.1-clappr';

            /* Initialize YouboraJS */
            this.startMonitoring(player, options);

            // save playback object and tag
            this.playback = this.player.core.getCurrentPlayback();
            this.tag = this.playback.video;

            // Register the listeners. Comment this line if you want to instantiate the plugin async.
            this.registerListeners();
        } catch (err) {
            $YB.error(err);
        }
    };

    // Extend Generic Plugin
    $YB.plugins.Clappr.prototype = new $YB.plugins.Generic;

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.Clappr.prototype.getPlayhead = function() {
        return this.player.getCurrentTime();
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.Clappr.prototype.getMediaDuration = function() {
        return this.player.getDuration();
    };

    /** Returns true if the video is life, or false if it is a VOD. */
    $YB.plugins.Clappr.prototype.getIsLive = function() {
        return this.player.core.getPlaybackType() == "live";
    };

    /** Returns the src of the resource or an empty string. */
    $YB.plugins.Clappr.prototype.getResource = function() {
        var src = this.player.playerInfo.options.source;
        return (typeof src == "object") ? src.source : src;
    };

    /** Returns version of the player or an empty string. */
    $YB.plugins.Clappr.prototype.getPlayerVersion = function() {
        return 'Clappr' + Clappr.version;
    };

    /** Returns the current bitrate of the video or -1. */
    $YB.plugins.Clappr.prototype.getBitrate = function() {
        return this.bitrate || -1;
    };

    /** Returns the current throughput of the video or -1. */
    $YB.plugins.Clappr.prototype.getThroughput = function() {
        return this.throughput || -1;
    };

    /** Returns the current rendition of the video or an empty string. */
    $YB.plugins.Clappr.prototype.getRendition = function() {
        return this.rendition;
    };

    /** Register Listeners */
    $YB.plugins.Clappr.prototype.registerListeners = function() {
        try {
            var plugin = this;

            // Report events as Debug messages
            if ($YB.debugLevel >= 4) {

                /// PLAYBACK EVENTS
                var playerEvents = [
                    Clappr.Events.PLAYBACK_BITRATE,
                    Clappr.Events.PLAYBACK_BUFFERFULL,
                    Clappr.Events.PLAYBACK_BUFFERING,
                    Clappr.Events.PLAYBACK_DVR,
                    Clappr.Events.PLAYBACK_ENDED,
                    Clappr.Events.PLAYBACK_ERROR,
                    Clappr.Events.PLAYBACK_HIGHDEFINITIONUPDATE,
                    Clappr.Events.PLAYBACK_LEVEL_SWITCH_END,
                    Clappr.Events.PLAYBACK_LEVEL_SWITCH_START,
                    Clappr.Events.PLAYBACK_LEVELS_AVAILABLE,
                    Clappr.Events.PLAYBACK_LOADEDMETADATA,
                    Clappr.Events.PLAYBACK_PAUSE,
                    Clappr.Events.PLAYBACK_PLAY,
                    Clappr.Events.PLAYBACK_PLAYBACKSTATE,
                    Clappr.Events.PLAYBACK_PLAY_INTENT,
                    //Clappr.Events.PLAYBACK_PROGRESS,
                    Clappr.Events.PLAYBACK_READY,
                    Clappr.Events.PLAYBACK_SETTINGSUPDATE,
                    Clappr.Events.PLAYBACK_STOP,
                    //Clappr.Events.PLAYBACK_TIMEUPDATE
                ];

                for (var i = 0; i < playerEvents.length; i++) {
                    var event = playerEvents[i];
                    this.playback.on(event, function() {
                        $YB.debug('Event: Clappr-' + plugin.player.core.uniqueId + ' > ' + this);
                    }, event);
                }

                /// PLAYER EVENTS
                var playerEvents = [
                    Clappr.Events.PLAYER_ENDED,
                    Clappr.Events.PLAYER_ERROR,
                    Clappr.Events.PLAYER_PAUSE,
                    Clappr.Events.PLAYER_PLAY,
                    Clappr.Events.PLAYER_READY,
                    Clappr.Events.PLAYER_SEEK,
                    Clappr.Events.PLAYER_STOP,
                    //Clappr.Events.PLAYER_TIMEUPDATE,
                ];

                for (var i = 0; i < playerEvents.length; i++) {
                    var event = playerEvents[i];
                    this.player.on(event, function() {
                        $YB.debug('Event: Clappr-' + plugin.player.core.uniqueId + ' > ' + this);
                    }, event);
                }
            }

            // Start buffer watcher. Requires data.enableNiceBuffer to be true.
            this.enableBufferMonitor();


            // PLAYBACK EVENTS
            this.playback.on(Clappr.Events.PLAYBACK_PLAY_INTENT, function() {
                plugin.playHandler();
            });

            this.playback.on(Clappr.Events.PLAYBACK_BUFFERING, function() {
                plugin.playback = plugin.player.core.getCurrentPlayback();
            });

            this.playback.on(Clappr.Events.PLAYBACK_PLAY, function() {
                plugin.playingHandler();
            });

            this.playback.on(Clappr.Events.PLAYBACK_PAUSE, function() {
                plugin.pauseHandler();
            });

            this.playback.on(Clappr.Events.PLAYBACK_STOP, function() {
                plugin.endedHandler();
            });

            this.playback.on(Clappr.Events.PLAYBACK_ENDED, function() {
                plugin.endedHandler();
            });

            this.playback.on(Clappr.Events.PLAYBACK_ERROR, function(error, player) {
                var errCode = error.code + "-" + player;
                plugin.errorHandler(errCode);
            });

            this.playback.on(Clappr.Events.PLAYBACK_BUFFERFULL, function() {
                plugin.seekedHandler();
            });

            this.playback.on(Clappr.Events.PLAYBACK_BITRATE, function(e) {
                plugin.bitrate = e.bitrate;
                plugin.throughput = e.bandwidth;
                plugin.rendition = plugin.playback.levels[e.level].label;
            });


            // PLAYER EVENTS
            this.player.on(Clappr.Events.PLAYER_SEEK, function() {
                plugin.seekingHandler(); // video starts seeking
            });

        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.Clappr.prototype.resetValues = function() {
        plugin.bitrate = null;
        plugin.throughput = null;
        plugin.rendition = null;
    };
}
