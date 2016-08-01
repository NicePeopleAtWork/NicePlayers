/**
 * @license
 * Youbora Plugin Brightcove
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.plugins.Brightcove = function(playerId, options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = '[name]';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '[ver]-[name]'

            /* Initialize YouboraJS */
            if (brightcove && brightcove.api) {
                this.init(playerId, options);

                this.player = brightcove.api.getExperience(playerId);
                this.tag = this.player.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);

                // Register the listeners.
                if (this.player.type == "html") {
                    this.registerListeners();
                }
            }

        } catch (err) {
            $YB.error(err);
        }
    };

    // Extend Generic Plugin
    $YB.plugins.Brightcove.prototype = new $YB.plugins.Generic;

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.Brightcove.prototype.getPlayhead = function() {
        return this.playhead;
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.Brightcove.prototype.getMediaDuration = function() {
        return this.duration;
    };

    /** Returns the src of the resource or an empty string. */
    $YB.plugins.Brightcove.prototype.getResource = function() {
        return this.video.defaultURL;
    };

    /** Returns the title or an empty string. */
    $YB.plugins.Brightcove.prototype.getTitle = function() {
        return this.video.displayName;
    };

    /** Returns version of the player or an empty string. */
    $YB.plugins.Brightcove.prototype.getPlayerVersion = function() {
        return 'brightcove-' + brightcove.majorVersion + '.' + brightcove.majorRevision + '.' + brightcove.minorRevision;
    };

    /** Returns the current bitrate of the video or -1. */
    $YB.plugins.Brightcove.prototype.getBitrate = function() {
        if (this.rendition && this.rendition.encodingRate > 0) {
            return this.rendition.encodingRate;
        }
    };

    /** Register Listeners */
    $YB.plugins.Brightcove.prototype.registerListeners = function() {
        try {
            // Listen all events
            $YB.utils.listenAllEvents(this.tag, ['mediaBegin', 'mediaChange', 'mediaComplete', 'mediaError', 'mediaPlay', 'mediaSeekNotify', 'mediaSeek', 'mediaBufferBegin', 'mediaBufferComplete', 'mediaStop']);

            // Start buffer watcher. Requires data.enableNiceBuffer to be true.
            this.startAutobuffer();

            // Register Events
            var plugin = this;

            this.tag.addEventListener('mediaChange', function(e) {
                if (e.position) plugin.playhead = e.position;
            });

            this.tag.addEventListener('mediaPlay', function(e) {
                if (e.position) plugin.playhead = e.position;
                plugin.playHandler(e);
            });

            this.tag.addEventListener('mediaProgress', function(e) {
                if (e.position) plugin.playhead = e.position;
                plugin.playingHandler();
            });

            this.tag.addEventListener('mediaStop', function(e) {
                if (e.position) plugin.playhead = e.position;
                if (plugin.getMediaDuration() && e.position >= plugin.getMediaDuration()) {
                    plugin.endedHandler();
                } else {
                    plugin.pauseHandler();
                }
            });

            this.tag.addEventListener('mediaBegin', function(e) {
                if (e.position) plugin.playhead = e.position;
            });

            this.tag.addEventListener('mediaComplete', function(e) {
                if (e.position) plugin.playhead = e.position;
                plugin.endedHandler();
            });

            this.tag.addEventListener('mediaSeekNotify', function(e) {
                if (e.position) plugin.playhead = e.position;
                plugin.seekingHandler();
            });

            this.tag.addEventListener('mediaError', function(e) {
                if (e.position) plugin.playhead = e.position;
                this.errorHandler(playerEvent.code, "PLAY_FAILURE");
            });

        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.Brightcove.prototype.playHandler = function(e) {
        try {
            if (e.duration) this.duration = e.duration;
            if (!this.isStartSent) {
                var plugin = this;

                this.tag.getCurrentRendition(function(rendition) {
                    plugin.rendition = rendition;
                });

                this.tag.getCurrentVideo(function(video) {
                    plugin.video = video;
                    plugin.videoApi.sendStart();
                });
            }
        } catch (err) {
            $YB.error(err);
        }
    };
}
