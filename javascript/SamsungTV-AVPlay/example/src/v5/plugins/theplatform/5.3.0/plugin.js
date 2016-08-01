/**
 * @license
 * Youbora Plugin 5.3.0-theplatform
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.plugins.ThePlatform = function(options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = 'theplatform';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '5.3.0-theplatform';

            if ($pdk) {
                /* Initialize YouboraJS */
                this.startMonitoring(null, options);

                // Register the listeners. Comment this line if you want to instantiate the plugin async.
                this.registerListeners();
            } else {
                $YB.error("PDK not found. Youbora needs to be initialized after thePlatform PDK.")
            }
        } catch (err) {
            $YB.error(err);
        }
    };

    // Extend Generic Plugin
    $YB.plugins.ThePlatform.prototype = new $YB.plugins.Generic;

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.ThePlatform.prototype.getPlayhead = function() {
        return this.playhead;
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.ThePlatform.prototype.getMediaDuration = function() {
        return this.duration;
    };

    /** Returns true if the video is life, or false if it is a VOD. */
    $YB.plugins.ThePlatform.prototype.getIsLive = function() {
        return this.isLive;
    };

    /** Returns the title or an empty string. */
    $YB.plugins.ThePlatform.prototype.getTitle = function() {
        return this.title;
    };

    /** Returns the src of the resource or an empty string. */
    $YB.plugins.ThePlatform.prototype.getResource = function() {
        return this.resource;
    };

    /** Returns version of the player or an empty string. */
    $YB.plugins.ThePlatform.prototype.getPlayerVersion = function() {
        return 'ThePlatform ' + $pdk.version.toString();
    };

    /** Returns the current bitrate of the video or -1. */
    $YB.plugins.ThePlatform.prototype.getBitrate = function() {
        return this.bitrate;
    };

    /** Register Listeners */
    $YB.plugins.ThePlatform.prototype.registerListeners = function() {
        try {
            // Report events as Debug messages
            $YB.utils.listenAllEvents($pdk.controller, [null,
                //"OnMediaPlaying",
                "OnMediaPause",
                "OnMediaUnpause",
                "OnClipInfoLoaded",
                "OnMediaBuffering",
                "OnMediaEnd",
                "OnMediaError",
                "OnVersionError",
                "OnMediaPlay",
                "OnMediaSeek",
                "OnMediaStart",
                "OnMediaLoadStart",
                "OnResetPlayer",
                "OnReleaseEnd",
                "OnReleaseStart",
                "OnReleaseSelected",
            ]);

            // Start buffer watcher. Requires data.enableNiceBuffer to be true.
            this.enableBufferMonitor();

            // Register Events
            var plugin = this;

            $pdk.controller.addEventListener('OnReleaseStart', function(e) {
                plugin.title = e.data.title;
                if (e.data.baseClips) {
                    var clip = e.data.baseClips[0];
                    plugin.resource = clip.URL;
                    plugin.duration = clip.trueLength / 1000;
                    plugin.isLive = (clip.expression == "nonstop");
                    plugin.bitrate = clip.bitrate ? clip.bitrate : -1;
                }

                plugin.playHandler();

            });

            $pdk.controller.addEventListener('OnMediaLoadStart', function(e) {
                if (e.data.baseClip.isAd) {
                    plugin.ignoringAdHandler();
                } else {
                    plugin.duration = e.data.baseClip.trueLength / 1000;
                    plugin.bitrate = e.data.baseClip.bitrate ? e.data.baseClip.bitrate : -1;
                }
            });

            $pdk.controller.addEventListener('OnMediaEnd', function(e) {
                plugin.ignoredAdHandler();

                // Set lastResume to force playhead monitor to skip next check
                plugin.viewManager.lastResume = new Date().getTime();
            });

            $pdk.controller.addEventListener('OnMediaPlaying', function(e) {
                if (!plugin.viewManager.isShowingAds) {
                    plugin.playhead = e.data.currentTimeAggregate ? e.data.currentTimeAggregate / 1000 : e.data.currentTime / 1000;
                    if (!plugin.viewManager.isBuffering) {
                        if (!plugin.viewManager.isJoinSent) {
                            plugin.joinHandler();
                        } else if (plugin.viewManager.isSeeking && plugin.playhead > plugin.seekingTo) {
                            plugin.seekedHandler();
                        }
                    }
                }
            });

            $pdk.controller.addEventListener('OnMediaPause', function(e) {
                plugin.pauseHandler();
            });

            $pdk.controller.addEventListener('OnMediaUnpause', function(e) {
                plugin.resumeHandler();
            });

            $pdk.controller.addEventListener('OnReleaseEnd', function(e) {
                plugin.endedHandler();

                //reset
                plugin.resetValues();
            });

            $pdk.controller.addEventListener('OnMediaError', function(e) {
                plugin.resource = e.data.clip.URL || e.data.baseClip.URL;
                plugin.title = e.data.clip.title;
                plugin.duration = e.data.clip.mediaLength / 1000;

                plugin.errorHandler(e.data.friendlyMessage || e.data.message);
            });

            $pdk.controller.addEventListener('OnMediaSeek', function(e) {
                plugin.seekingHandler();
                plugin.seekingTo = e.data.end.currentTimeAggregate ? e.data.end.currentTimeAggregate / 1000 : e.data.end.currentTime / 1000;
            });
        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.ThePlatform.prototype.resetValues = function() {
        this.resource = null;
        this.title = null;
        this.duration = null;
        this.seekingTo = null;
        this.playhead = null;
        this.duration = null;
        this.bitrate = null;
        this.isLive = null;
    };
}
