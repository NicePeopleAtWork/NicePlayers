/**
 * @license
 * Youbora [ver]-[name] Adnalyzer
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.adnalyzers.[plugin_name] = function(plugin, ads) {
        try {
            this.adnalyzerVersion = '[ver]-[name]';

            // Reference to the plugin where it was called.
            this.startMonitoring(plugin, ads);

        } catch (err) {
            $YB.error(err);
        }
    }

    // Inheritance
    $YB.adnalyzers.[plugin_name].prototype = new $YB.adnalyzers.Generic();

    // Expose info from ads plugin
    $YB.adnalyzers.[plugin_name].prototype.getAdResource = function() {
        return "unknown";
    };

    $YB.adnalyzers.[plugin_name].prototype.getAdPlayhead = function() {
        return 0;
    };

    $YB.adnalyzers.[plugin_name].prototype.getAdDuration = function() {
        return 0;
    };

    $YB.adnalyzers.[plugin_name].prototype.getAdPosition = function() {
        if (false) {
            return 'pre';
        } else if (false) {
            return 'post';
        } else if (false) {
            return 'mid';
        } else {
            return 'unknown';
        }
    };

    $YB.adnalyzers.[plugin_name].prototype.getAdTitle = function() {
        return "";
    };

    $YB.adnalyzers.[plugin_name].prototype.getAdPlayerVersion = function() {
        return "";
    };

    $YB.adnalyzers.[plugin_name].prototype.getAdBitrate = function() {
        return -1;
    };

    $YB.adnalyzers.[plugin_name].prototype.getAdThroughput = function() {
        return -1;
    };

    // Register listeners
    $YB.adnalyzers.[plugin_name].prototype.registerListeners = function() {
        try {
            // Print all events if debug level is 4+.
            $YB.utils.listenAllEvents(this.addEventListener, [null], function(e) {
                $YB.debug('Event: Ima > ' + e.type);
            });

            // Start nicebuffer
            this.enableAdBufferMonitor();

            //Save context
            var context = this;

            // Start
            this.addEventListener('start', function(e) {
                try {
                    context.playAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Join
            this.addEventListener('join', function(e) {
                try {
                    context.joinAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Pause
            this.addEventListener('pause', function(e) {
                try {
                    context.pauseAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Resume
            this.addEventListener('resume', function(e) {
                try {
                    context.resumeAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Stop
            this.addEventListener('ended', function(e) {
                try {
                    context.endedAdHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Skipped
            this.addEventListener('skipped', function(e) {
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
}
