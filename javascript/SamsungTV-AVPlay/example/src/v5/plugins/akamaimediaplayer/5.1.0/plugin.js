/**
 * @license
 * Youbora Plugin 5.1.0-AkamaiMediaPlayer
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.plugins.AkamaiMediaPlayer = function(player, options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = 'akamaimediaplayer';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '5.1.0-akamaimediaplayer';

            /* Initialize YouboraJS */
            this.init(player, options);

            // Register the listeners. Comment this line if you want to instantiate the plugin async.
            this.registerListeners();

            this.bitrate = 0;
        } catch (err) {
            $YB.error(err);
        }
    };

    // Extend Generic Plugin
    $YB.plugins.AkamaiMediaPlayer.prototype = new $YB.plugins.Generic;

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.AkamaiMediaPlayer.prototype.getPlayhead = function() {
        return this.player.getCurrentTime();
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.AkamaiMediaPlayer.prototype.getMediaDuration = function() {
        return this.player.getDuration();
    };

    /** Returns the title or an empty string. */
    $YB.plugins.AkamaiMediaPlayer.prototype.getTitle = function() {
        if (this.player.getMedia && this.player.getMedia()) {
            return this.player.getMedia().title;
        } else {
            return null;
        }
    };

    /** Returns the src of the resource or an empty string. */
    $YB.plugins.AkamaiMediaPlayer.prototype.getResource = function() {
        return this.player.getSrc();
    };

    /** Returns version of the player or an empty string. */
    $YB.plugins.AkamaiMediaPlayer.prototype.getPlayerVersion = function() {
        return this.player.getVersion();
    };

    /** Returns the current bitrate of the video or -1. */
    $YB.plugins.AkamaiMediaPlayer.prototype.getBitrate = function() {
        return this.bitrate * 1000;
    };

    /** Returns the current rendition of the video or an empty string. */
    $YB.plugins.AkamaiMediaPlayer.prototype.getRendition = function() {
        return this.bitrate;
    };

    /** Register Listeners */
    $YB.plugins.AkamaiMediaPlayer.prototype.registerListeners = function() {
        try {
            // Report events as Debug messages
            $YB.utils.listenAllEvents(this.player, [
                //'mediaPlayerElementEvent',
                'mediaPlayerDynamicStreamSwitchingChange',
                'mediaPlayerResumeOrPausePlayback',
                'mediaLoadStateReady',
                'adComponentAdBegin',
                //'adComponentPlaybackProgress',
                'adComponentAdComplete',
                'canplaythrough',
                'mediaPlayerError',
                'playrequest',
                'canSeekChange',
                'temporalChange',
                //'mediaPlayerPlayheadUpdate'
            ]);

            // Start buffer watcher. Requires data.enableNiceBuffer to be true.
            this.startAutobuffer();

            // Register Events
            var plugin = this;
            this.player.addEventListener('playrequest', function() {
                plugin.playHandler(); // Play is clicked (/start)
            });

            this.player.addEventListener('pause', function() {
                plugin.pauseHandler(); // Video pauses (/pause)
            });

            this.player.addEventListener('play', function() {
                plugin.resumeHandler(); // Video pauses (/pause)
            });

            this.player.addEventListener('ended', function() {
                plugin.endedHandler(); // video ends (/stop)
            });

            this.player.addEventListener('mediaPlayerError', function() {
                plugin.errorHandler(3001, "PLAY_FAILURE"); // video error (/error)
            });

            this.player.addEventListener('error', function() {
                plugin.errorHandler(3001, "PLAY_FAILURE"); // video error (/error)
            });

            this.player.addEventListener('seeking', function() {
                plugin.seekingHandler(); // video starts seeking
            });

            this.player.addEventListener('seeked', function() {
                plugin.playingHandler(); // Image starts moving after start, pause, seek or buffer (/joinTime), (/resume), (/seekEnd), (/bufferEnd)
            });

            this.player.addEventListener('waiting', function() {
                plugin.bufferingHandler();
            });

            this.player.addEventListener('playing', function() {
                plugin.bufferedHandler();
            });

            this.player.addEventListener('adComponentAdBegin', function() {
                plugin.genericAdStartHandler();
            });

            this.player.addEventListener('adComponentAdComplete', function() {
                plugin.genericAdEndHandler();
            });

            this.player.addEventListener('mediaPlayerDynamicStreamSwitchingChange', function(e) {
                plugin.bitrate = e.data.bitrate; // in kbrate
            });


        } catch (err) {
            $YB.error(err);
        }
    };
}
