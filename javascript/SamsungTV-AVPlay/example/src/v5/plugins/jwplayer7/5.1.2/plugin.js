/**
 * @license
 * Youbora Plugin Jwplayer7
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {
$YB.plugins.Jwplayer7 = function(player, options) {
    try {
        // Version
        this.pluginName = "jwplayer7";
        this.pluginVersion = "5.1.2-jwplayer7";

        // Initialize YouboraJS
        this.init(player, options);

        // Register the listeners.
        this.registerListeners();
    } catch (err) {
        $YB.error(err);
    }
};

// Inherit from generic plugin
$YB.plugins.Jwplayer7.prototype = new $YB.plugins.Generic;

// Interface methods
$YB.plugins.Jwplayer7.prototype.getPlayhead = function() {
    return this.player.getPosition();
}

$YB.plugins.Jwplayer7.prototype.getMediaDuration = function() {
    return this.duration || this.player.getDuration();
};

$YB.plugins.Jwplayer7.prototype.getThroughput = function() {
    return this.throughput;
};

$YB.plugins.Jwplayer7.prototype.getBitrate = function() {
    var quality = this.player.getVisualQuality();
    if (typeof quality != 'undefined' && typeof quality.level != 'undefined' && typeof quality.level.bitrate != 'undefined') {
        return quality.level.bitrate;
    }

    return -1;
};

$YB.plugins.Jwplayer7.prototype.getRendition = function() {
    var quality = this.player.getVisualQuality();
    if (typeof quality != 'undefined' && typeof quality.level != 'undefined' && typeof quality.level.label != 'undefined') {
        return quality.level.label;
    }
    return undefined;
};

$YB.plugins.Jwplayer7.prototype.getResource = function() {
    if (typeof this.player.getPlaylistItem() != "undefined") {
        return this.player.getPlaylistItem().file;
    } else if (this.player.getPlaylist() && this.player.getPlaylist().length > 0) {
        return this.player.getPlaylist()[0].file;
    } else {
        return undefined;
    }
};

$YB.plugins.Jwplayer7.prototype.getPlayerVersion = function() {
    return this.player.version;
};


$YB.plugins.Jwplayer7.prototype.getTitle = function() {
    if (typeof this.player.getPlaylistItem() != "undefined") {
        return this.player.getPlaylistItem().title;
    } else if (this.player.getPlaylist() && this.player.getPlaylist().length > 0) {
        return this.player.getPlaylist()[0].title;
    } else {
        return undefined;
    }
};

// Register Listeners
$YB.plugins.Jwplayer7.prototype.registerListeners = function() {
    try {
        // save context
        var plugin = this;

        // debug all events
        $YB.utils.listenAllEvents(this.player, [
            'beforePlay', 'meta', 'playlistItem', 'setupError', 'idle', 'complete', 'buffer', 'firstFrame'
        ], function(e) {
            $YB.debug('Event: ' + plugin.playerId + ' > ' + e.type);
        });

        // playlist item changes
        this.player.on('playlistItem', function(e) {
            try {
                // reset private variables
                plugin.duration = undefined;
                plugin.throughput = -1;

                // Set options
                plugin.setOptions(this.getConfig().youbora);
                plugin.setOptions(this.getPlaylistItem().youbora);
            } catch (error) {
                $YB.error(error);
            }
        });

        // Play is clicked (/start)
        this.player.on('beforePlay', function(e) {
            try {
                // reset private variables
                plugin.duration = undefined;
                plugin.throughput = -1;


                // Set options from config if playlist options are not defined
                // Playlist config has higher priority, they will be set in playlistItem event
                if (!this.getPlaylistItem().youbora) {
                    plugin.setOptions(this.getConfig().youbora);
                }

                // Send /start
                if (!plugin.isStartSent) {
                    plugin.videoApi.sendStart({ duration: 0 }); //force duration 0

                    // Start adnalyzer
                    if ($YB.adnalyzers.Jwplayer7Ads && !plugin.adnalyzer)
                        plugin.adnalyzer = new $YB.adnalyzers.Jwplayer7Ads(plugin);
                }
            } catch (error) {
                $YB.error(error);
            }
        });

        // Video starts (/joinTime)
        this.player.on('firstFrame', function(e) {
            try {
                plugin.joinHandler();
            } catch (error) {
                $YB.error(error);
            }
        });

        // resumes (resume) or bufferEnd (bufferUnderrun)
        this.player.on('play', function(e) {
            try {
                //plugin.resumeHandler();
                //plugin.bufferedHandler();
            } catch (error) {
                $YB.error(error);
            }
        });

        this.player.on('meta', function(e) {
            plugin.duration = e.duration || plugin.duration;
            if (e.metadata) {
                plugin.duration = e.metadata.duration || plugin.duration;
                plugin.throughput = e.metadata.bandwidth || plugin.throughput;
            }
        });

        // Buffer starts
        this.player.on('buffer', function(e) {
            try {
                if (e.oldstate != 'idle' && e.oldstate != 'paused') {
                    plugin.bufferingHandler();
                }
            } catch (error) {
                $YB.error(error);
            }
        });

        // Video pauses (pause)
        this.player.on('pause', function(e) {
            try {
                plugin.pauseHandler();
            } catch (error) {
                $YB.error(error);
            }
        });

        // video error (error)
        this.player.on('error', function(e) {
            try {
                plugin.errorHandler(e.message);
            } catch (error) {
                $YB.error(error);
            }
        });

        this.player.on('setupError', function(e) {
            try {
                plugin.errorHandler(e.message);
            } catch (error) {
                $YB.error(error);
            }
        });

        // video seek start
        this.player.on('seek', function(e) {
            try {
                plugin.seekingHandler();
            } catch (error) {
                $YB.error(error);
            }
        });

        //video seek end (seek)
        this.player.on('time', function(e) {
            try {
                plugin.playingHandler();
            } catch (error) {
                $YB.error(error);
            }
        });

        // video ends (stop)
        this.player.on('idle', function(e) {
            try {
                plugin.endedHandler();
            } catch (error) {
                $YB.error(error);
            }
        });
    } catch (err) {
        $YB.error(err);
    }
};

(function(jwplayer) {
    if (typeof jwplayer != "undefined")
        jwplayer().registerPlugin('sp.min', '7.0', $YB.plugins.Jwplayer7);

})(jwplayer);
}