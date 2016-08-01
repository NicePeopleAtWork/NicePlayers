/**
 * @license
 * Youbora Plugin [ver]-Youtube
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Marc Maycas
 */

if (typeof $YB != 'undefined') {

    $YB.plugins.Youtube = function(player, options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = '[name]';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '[ver]-[name]';

            /* Initialize YouboraJS */
            this.startMonitoring(player, options);

            // Register the listeners. Comment this line if you want to instantiate the plugin async.
            this.registerListeners();
        } catch (err) {
            $YB.error(err);
        }
    };

    // Extend Generic Plugin
    $YB.plugins.Youtube.prototype = new $YB.plugins.Generic;

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.Youtube.prototype.getPlayhead = function() {
        return this.player.getCurrentTime();
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.Youtube.prototype.getMediaDuration = function() {
        return this.player.getDuration();
    };

    /** Returns the title or an empty string. */
    $YB.plugins.Youtube.prototype.getTitle = function() {
        if (youbora.player.getVideoData) {
            return this.player.getVideoData().title;
        } else {
            return 'unknown';
        }
    };

    /** Returns the src of the resource or an empty string. */
    $YB.plugins.Youtube.prototype.getResource = function() {
        return this.player.getVideoUrl();
    };

    /** Returns the current rendition of the video or an empty string. */
    $YB.plugins.Youtube.prototype.getRendition = function() {
        return this.player.getPlaybackQuality();
    };

    $YB.plugins.Youtube.prototype.getPlayerVersion = function() {
        return "YOUTUBE API";
    }

    /** Register Listeners */
    $YB.plugins.Youtube.prototype.registerListeners = function() {
        try {
            // Start buffer watcher. Requires data.enableNiceBuffer to be true.
            //this.enableBufferMonitor();

            // Register Events
            var context = this;

            // TODO: Evaluate improvement on the buffering detection using buffering and playing events
            this.player.addEventListener("onStateChange", function(event) {
                var pre = 'Event: ' + context.player.getVideoData().video_id + ' > ';
                if (!context.viewManager.isErrorSent) {
                    switch (event.data) {
                        case YT.PlayerState.UNSTARTED:
                            context.playHandler();
                            $YB.debug(pre + 'State UNSTARTED');
                            break;
                        case YT.PlayerState.ENDED:
                            context.endedHandler();
                            $YB.debug(pre + 'State ENDED');
                            break;
                        case YT.PlayerState.PLAYING:
                            context.playingHandler();
                            $YB.debug(pre + 'State PLAYING');
                            break;
                        case YT.PlayerState.PAUSED:
                            context.pauseHandler();
                            $YB.debug(pre + 'State PAUSED');
                            break;
                        case YT.PlayerState.BUFFERING:
                            context.bufferingHandler();
                            $YB.debug(pre + 'State BUFFERING');
                            break;
                    }
                }
            });


            this.player.addEventListener("onError", function(event) {
                $YB.debug('Event: YT ' + context.player.getVideoData().video_id + ' > Error');
                if (!context.viewManager.isErrorSent) {
                    var error = {
                        "2": "Invalid ID",
                        "5": "HTML5 content error",
                        "100": "Video not found",
                        "101": "Not allowed to play by owner",
                    };

                    var code = event.data;
                    if (code === 150) {
                        // Error 150 is the same as 101 as stated in the documentation
                        code = 101;
                    }

                    if (error[code] !== undefined) {
                        context.errorHandler(code, error[code]);
                    } else {
                        context.errorHandler(code, 'Unknown error');
                    }
                }
            });

        } catch (err) {
            $YB.error(err);
        }
    };
}
