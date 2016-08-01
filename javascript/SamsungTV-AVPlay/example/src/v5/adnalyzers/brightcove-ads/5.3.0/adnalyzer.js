/**
 * @license
 * Youbora 5.3.0-brightcove-ads Adnalyzer
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.adnalyzers.BrightcoveAds = function(plugin) {
        try {
            this.adnalyzerVersion = '5.3.0-brightcove-ads';

            // Reference to the plugin where it was called.
            if (plugin.player.ima3) {
                this.startMonitoring(plugin, plugin.player.ima3);
            } else if (plugin.player.FreeWheelPlugin) {
                this.startMonitoring(plugin, plugin.player.FreeWheelPlugin);
            } else {
                $YB.notice("Adnalyzer '" + this.adnalyzerVersion + "' couldn't find any Ads Plugin associated to Brightcove.")
            }

        } catch (err) {
            $YB.error(err);
        }
    }

    // Inheritance
    $YB.adnalyzers.BrightcoveAds.prototype = new $YB.adnalyzers.Generic();

    // Expose info from ads plugin
    $YB.adnalyzers.BrightcoveAds.prototype.getAdResource = function() {
        if (this.ads.adsManager && this.ads.adsManager.D) {
            return this.ads.adsManager.D;
        } else {
            return null;
        }
    };

    $YB.adnalyzers.BrightcoveAds.prototype.getMediaPlayhead = function() {
        if (this.ads.snapshot && this.ads.snapshot.currentTime) {
            return this.ads.snapshot.currentTime;
        } else {
            return null;
        }
    };

    $YB.adnalyzers.BrightcoveAds.prototype.getAdPlayhead = function() {
        var player = this.plugin.player;
        if (this.ads.adPlayer) {
            player = this.ads.adPlayer;
        }

        return player.currentTime();
    };

    $YB.adnalyzers.BrightcoveAds.prototype.getAdDuration = function() {
        var player = this.plugin.player;
        if (this.ads.adPlayer) {
            player = this.ads.adPlayer;
        }

        return player.duration();
    };

    $YB.adnalyzers.BrightcoveAds.prototype.getAdPosition = function() {
        if (this.ads.adsManager && this.ads.adsManager.getCurrentAd()) {
            var index = this.ads.adsManager.getCurrentAd().getAdPodInfo().getPodIndex();
            if (index === 0) {
                return 'pre';
            } else if (index === -1) {
                return 'post';
            } else if (index > 0) {
                return 'mid';
            } else {
                return 'unknown';
            }
        } else {
            if (!this.plugin.isJoinSent) {
                return 'pre';
            } else if (this.plugin.getPlayhead() >= this.plugin.getMediaDuration()) {
                return 'post';
            } else {
                return 'mid';
            }
        }
    };

    $YB.adnalyzers.BrightcoveAds.prototype.getAdTitle = function() {
        if (this.ads.adsManager && this.ads.adsManager.getCurrentAd()) {
            return this.ads.adsManager.getCurrentAd().getTitle();
        } else {
            return null;
        }
    };

    $YB.adnalyzers.BrightcoveAds.prototype.getAdPlayerVersion = function() {
        if (this.ads.version && google && google.ima) {
            return "bcove-ima " + this.ads.version + " / IMA" + google.ima.VERSION;
        } else if (this.ads.getVersion) {
            return "bcove-fw " + this.ads.getVersion();
        } else {
            return "UNKNOWN";
        }
    };

    // Register listeners
    $YB.adnalyzers.BrightcoveAds.prototype.registerVideojs = function() {
        try {
            this.registerListeners();
        } catch (error) {
            $YB.error(error);
        }
    };

    $YB.adnalyzers.BrightcoveAds.prototype.registerListeners = function() {
        try {
            this.enableAdBufferMonitor();

            // Print all events if debug level is 4+.
            $YB.utils.listenAllEvents(this.plugin.player, [
                null,
                'ima3-ready',
                'ima3error',
                'ima3-ad-error',
                'ima3-started',
                'ima3-complete',
                'ima3-paused',
                'ima3-resumed',
                'ads-request',
                'ads-load',
                'ads-ad-started',
                'ads-ad-ended',
                'ads-pause',
                'ads-play',
                'ads-click',
                'ads-pod-started',
                'ads-pod-ended',
                'ads-allpods-completed'
            ], function(e) {
                $YB.debug('Event: BcoveAds > ' + e.type);
            });

            if (this.plugin.player.ima3) {
                this.registerIMA(); // Register IMA3 events
            } else if (this.plugin.player.FreeWheelPlugin) {
                this.registerFW(); // Register FW events
            }

        } catch (error) {
            $YB.error(error);
        }
    };

    $YB.adnalyzers.BrightcoveAds.prototype.registerIMA = function() {
        try {

            //Save context
            var context = this;

            // Start+Join
            this.plugin.player.on('ima3-started', function(e) {
                try {
                    context.startJoinAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Pause
            this.plugin.player.on('ima3-paused', function(e) {
                try {
                    context.pauseAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Resume
            this.plugin.player.on('ima3-resumed', function(e) {
                try {
                    context.resumeAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Stop
            this.plugin.player.on('ima3-complete', function(e) {
                try {
                    context.endedAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Skip
            this.plugin.player.on('ima3-skipped', function(e) {
                try {
                    context.skipAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

        } catch (error) {
            $YB.error(error);
        }
    };

    $YB.adnalyzers.BrightcoveAds.prototype.registerFW = function() {
        try {

            //Save context
            var context = this;

            // Start+Join
            this.plugin.player.on('ads-ad-started', function(e) {
                try {
                    context.startJoinAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Pause
            this.plugin.player.on('ads-pause', function(e) {
                try {
                    context.pauseAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Resume
            this.plugin.player.on('ads-play', function(e) {
                try {
                    context.resumeAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Stop
            this.plugin.player.on('ads-ad-ended', function(e) {
                try {
                    context.endedAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

        } catch (error) {
            $YB.error(error);
        }
    };


}
