/**
 * @license
 * Youbora [ver]-[name] Adnalyzer
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.adnalyzers.Ima = function(plugin) {
        try {
            this.adnalyzerVersion = '[ver]-[name]';

            // Reference to the plugin where it was called.
            this.startMonitoring(plugin, plugin.player.ima);
        } catch (err) {
            $YB.error(err);
        }
    }

    // Inheritance
    $YB.adnalyzers.Ima.prototype = new $YB.adnalyzers.Generic();

    // Expose info from ads plugin
    $YB.adnalyzers.Ima.prototype.getAdResource = function() {
        if (this.ads.getAdsManager && this.ads.getAdsManager().D) {
            return this.ads.getAdsManager().D;
        } else {
            return null;
        }
    };

    $YB.adnalyzers.Ima.prototype.getAdPlayhead = function() {
        return this.getAdDuration() - this.ads.getAdsManager().getRemainingTime();
    };

    $YB.adnalyzers.Ima.prototype.getAdPosition = function() {
        var index = this.ads.getAdsManager().getCurrentAd().getAdPodInfo().getPodIndex();
        if (index === 0) {
            return 'pre';
        } else if (index === -1) {
            return 'post';
        } else if (index > 0) {
            return 'mid';
        } else {
            return 'unknown';
        }
    };

    $YB.adnalyzers.Ima.prototype.getAdDuration = function() {
        if (this.ads.getAdsManager().getCurrentAd() !== null) {
            this.duration = this.ads.getAdsManager().getCurrentAd().getDuration();
        }
        return this.duration;
    };

    $YB.adnalyzers.Ima.prototype.getAdTitle = function() {
        return this.ads.getAdsManager().getCurrentAd().getTitle();
    };

    $YB.adnalyzers.Ima.prototype.getAdPlayerVersion = function() {
        return "IMA" + google.ima.VERSION;
    };

    // Register hooks & listeners
    $YB.adnalyzers.Ima.prototype.registerVideojs = function() {
        try {
            // Register listeners
            this.registerListeners();
        } catch (error) {
            $YB.error(error);
        }
    };

    $YB.adnalyzers.Ima.prototype.registerListeners = function() {
        try {
            this.enableAdBufferMonitor();

            // Print all events if debug level is 4+.
            $YB.utils.listenAllEvents(this.ads.addEventListener, [
                null,
                google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
                google.ima.AdEvent.Type.LINEAR_CHANGED,
                google.ima.AdEvent.Type.USER_CLOSE,
                google.ima.AdEvent.Type.COMPLETE,
                google.ima.AdEvent.Type.IMPRESSION,
                google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
                google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
                google.ima.AdEvent.Type.SKIPPED,
                google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED,
                google.ima.AdEvent.Type.LOADED,
                google.ima.AdEvent.Type.PAUSED,
                google.ima.AdEvent.Type.RESUMED,
                google.ima.AdEvent.Type.STARTED,
                google.ima.AdEvent.Type.AD_CAN_PLAY,
                google.ima.AdEvent.Type.AD_METADATA,
                google.ima.AdEvent.Type.EXPANDED_CHANGED,
                google.ima.AdEvent.Type.AD_BREAK_READY,
                google.ima.AdEvent.Type.LOG
            ], function(e) {
                $YB.debug('Event: Ima > ' + e.type);
            });

            //Save context
            var adnalyzer = this;

            // Start
            this.ads.addEventListener(google.ima.AdEvent.Type.LOADED, function(e) {
                try {
                    adnalyzer.playAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.ads.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, function(e) {
                try {
                    adnalyzer.playAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Join
            this.ads.addEventListener(google.ima.AdEvent.Type.STARTED, function(e) {
                try {
                    adnalyzer.joinAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Pause
            this.ads.addEventListener(google.ima.AdEvent.Type.PAUSED, function(e) {
                try {
                    adnalyzer.pauseAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Resume
            this.ads.addEventListener(google.ima.AdEvent.Type.RESUMED, function(e) {
                try {
                    adnalyzer.resumeAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Stop
            this.ads.addEventListener(google.ima.AdEvent.Type.COMPLETE, function(e) {
                try {
                    adnalyzer.endedAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Skipped
            this.ads.addEventListener(google.ima.AdEvent.Type.SKIPPED, function(e) {
                try {
                    adnalyzer.skipAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });
        } catch (error) {
            $YB.error(error);
        }
    };
}
