/**
 * @license
 * Youbora [ver]-[name] Adnalyzer
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.adnalyzers.Jwplayer7Ads = function(plugin) {
        try {
            this.adnalyzerVersion = '[ver]-[name]';

            // Reference to the plugin where it was called.
            this.startMonitoring(plugin);

            // register listeners
            this.registerListeners();
        } catch (err) {
            $YB.error(err);
        }
    }

    // Inheritance
    $YB.adnalyzers.Jwplayer7Ads.prototype = new $YB.adnalyzers.Generic();

    // Expose info from ads plugin
    $YB.adnalyzers.Jwplayer7Ads.prototype.getAdResource = function() {
        return this.resource;
    };

    $YB.adnalyzers.Jwplayer7Ads.prototype.getAdPlayhead = function() {
        return this.playhead;
    };

    $YB.adnalyzers.Jwplayer7Ads.prototype.getAdDuration = function() {
        return this.duration;
    };

    $YB.adnalyzers.Jwplayer7Ads.prototype.getAdPosition = function() {
        return this.position;
    };

    $YB.adnalyzers.Jwplayer7Ads.prototype.getAdTitle = function() {
        return this.title;
    };

    $YB.adnalyzers.Jwplayer7Ads.prototype.getAdPlayerVersion = function() {
        return "jwplayer " + this.plugin.getPlayerVersion();
    };

    // Register listeners
    $YB.adnalyzers.Jwplayer7Ads.prototype.registerListeners = function() {
        try {
            // Print all events if debug level is 4+.
            $YB.utils.listenAllEvents(this.plugin.player.on, [
                null,
                'adClick',
                'adCompanions',
                'adComplete',
                'adError',
                'adStarted',
                'adImpression',
                'adMeta',
                'adPause',
                'adPlay',
                'adSkipped',
                'adBlock',
                'beforePlay',
                'beforeComplete',
                'adRequest'
            ], function(e) {
                $YB.debug('Event: JWP7-Ads > ' + e.type);
            });

            // Start nicebuffer
            this.enableAdBufferMonitor();

            //Save context
            var context = this;

            //this.plugin.player.on('adError', function(e) {});

            this.plugin.player.on('adTime', function(e) {
                try {
                    context.playhead = e.position;
                    context.duration = e.duration;

                    context.startJoinAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.plugin.player.on('adStarted', function(e) {
                try {
                    context.position = e.adposition;
                    context.resource = e.tag;
                    context.title = e.adtitle;
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.plugin.player.on('adImpression', function(e) {
                try {
                    context.position = e.adposition;
                    context.resource = e.tag;
                    context.title = e.adtitle;
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.plugin.player.on('adPause', function(e) {
                try {
                    context.pauseAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.plugin.player.on('adPlay', function(e) {
                try {
                    context.resumeAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.plugin.player.on('adSkipped', function(e) {
                try {
                    context.skipAdHandler();
                    context.resetValues();
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.plugin.player.on('adComplete', function(e) {
                try {
                    context.endedAdHandler();
                    context.resetValues();
                } catch (error) {
                    $YB.error(error);
                }
            });
        } catch (error) {
            $YB.error(error);
        }
    };

    $YB.adnalyzers.Jwplayer7Ads.prototype.resetValues = function() {
        try {
            this.playhead = undefined;
            this.duration = undefined;
            this.position = undefined;
            this.resource = undefined;
            this.title = undefined;
        } catch (error) {
            $YB.error(error);
        }
    };
}
