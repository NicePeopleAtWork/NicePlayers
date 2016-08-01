/**
 * @license
 * Youbora Plugin 5.1.0-VieraHtml5
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.plugins.VieraHtml5 = function(playerId, options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = 'viera-html5';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '5.1.0-viera-html5';

            /* Initialize YouboraJS */
            this.init(playerId, options);

            // Register the listeners. Comment this line if you want to instantiate the plugin async.
            this.registerListeners();
        } catch (err) {
            $YB.error(err);
        }
    };

    // Extend Generic Plugin
    $YB.plugins.VieraHtml5.prototype = new $YB.plugins.Generic;

    $YB.plugins.VieraHtml5.prototype.getResource = function() {
        return this.player.currentSrc;
    };

    $YB.plugins.VieraHtml5.prototype.getMediaDuration = function() {
        return this.player.duration;
    };

    $YB.plugins.VieraHtml5.prototype.getPlayhead = function() {
        return this.player.currentTime;
    };

    $YB.plugins.VieraHtml5.prototype.getPlayerVersion = function() {
        return "Panasonic Viera";
    };

    $YB.plugins.VieraHtml5.prototype.registerListeners = function() {
        // Will report all events to console
        $YB.utils.listenAllEvents(this.player);

        // Nicebuffer
        this.startAutobuffer();

        // Listeners
        var plugin = this;
        this.player.addEventListener("ended", function() {
            plugin.endedHandler();
        });
        this.player.addEventListener("play", function() {
            plugin.playHandler();
        });
        this.player.addEventListener("playing", function() {
            plugin.joinHandler();
            plugin.resumeHandler();
        });
        this.player.addEventListener("pause", function() {
            plugin.pauseHandler();
        });
        this.player.addEventListener("error", function(e) {
            plugin.errorHandler('PLAY_FAILURE');
        });
        this.player.addEventListener("seeking", function(e) {
            plugin.seekingHandler();
        });
        this.player.addEventListener("seeked", function(e) {
            plugin.seekPlayhead = plugin.getPlayhead();
        });
        this.player.addEventListener("timeupdate", function(e) {
            if (plugin.getPlayhead() != plugin.seekTime) {
                plugin.seekedHandler();
            }
        });
    };
}
