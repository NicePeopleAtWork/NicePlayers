/**
 * @license
 * Youbora 1.0.0-videoplaza Adnalyzer
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.adnalyzers.Videoplaza = function(plugin, ads) {
        try {
            this.adnalyzerVersion = '1.0.0-videoplaza';

            // Reference to the plugin where it was called.
            this.init(plugin, ads);

        } catch (err) {
            $YB.error(err);
        }
    }

    // Inheritance
    $YB.adnalyzers.Videoplaza.prototype = new $YB.adnalyzers.Generic();

    // Expose info from ads plugin
    $YB.adnalyzers.Videoplaza.prototype.getAdResource = function() {
        return "unknown";
    };

    $YB.adnalyzers.Videoplaza.prototype.getAdPlayhead = function() {
        return 0;
    };

    $YB.adnalyzers.Videoplaza.prototype.getAdDuration = function() {
        return 0;
    };

    $YB.adnalyzers.Videoplaza.prototype.getAdPosition = function() {
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

    $YB.adnalyzers.Videoplaza.prototype.getAdTitle = function() {
        return "";
    };

    $YB.adnalyzers.Videoplaza.prototype.getAdPlayerVersion = function() {
        if (videoplaza && videoplaza.versionNumber) {
            return 'videoplaza ' + videoplaza.versionNumber;
        } else {
            return 'videoplaza';
        }
    };

    $YB.adnalyzers.Videoplaza.prototype.getAdBitrate = function() {
        return -1;
    };

    $YB.adnalyzers.Videoplaza.prototype.getAdThroughput = function() {
        return -1;
    };

    // Register listeners
    $YB.adnalyzers.Videoplaza.prototype.registerListeners = function() {
        try {
            // Print all events if debug level is 4+.
            $YB.utils.listenAllEvents(this.addEventListener, [null], function(e) {
                $YB.debug('Event: Ima > ' + e.type);
            });

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
