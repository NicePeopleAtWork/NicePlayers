/**
 * @license
 * Youbora [ver]-[name] Adnalyzer
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.adnalyzers.Ooyala4 = function(plugin) {
        try {
            this.adnalyzerVersion = '[ver]-[name]';

            // Reference to the plugin where it was called.
            this.init(plugin, null);

            this.resetValues();

        } catch (err) {
            $YB.error(err);
        }
    }

    // Inheritance
    $YB.adnalyzers.Ooyala4.prototype = new $YB.adnalyzers.Generic();

    /** Reset reported values. */
    $YB.adnalyzers.Ooyala4.prototype.resetValues = function() {
        this.playhead = 0;
        this.resource = "";
        this.title = "";
        this.duration = 0;
    }

    // Expose info from ads plugin
    $YB.adnalyzers.Ooyala4.prototype.getAdResource = function() {
        return this.resource;
    };

    $YB.adnalyzers.Ooyala4.prototype.getAdPlayhead = function() {
        return this.playhead;
    };

    $YB.adnalyzers.Ooyala4.prototype.getAdDuration = function() {
        return this.duration;
    };

    $YB.adnalyzers.Ooyala4.prototype.getAdPosition = function() {
        if (this.plugin.isJoinSent) {
            return "pre";
        } else {
            return "mid";
        }
    };

    $YB.adnalyzers.Ooyala4.prototype.getAdTitle = function() {
        return this.title;
    };
}
