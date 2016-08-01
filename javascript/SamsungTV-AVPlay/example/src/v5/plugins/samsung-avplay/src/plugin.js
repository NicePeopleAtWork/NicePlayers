/**
 * @license
 * Youbora Plugin SamsungAvplay
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    //Console fix
    $YB.plainConsole = true;

    $YB.plugins.SamsungAvplay = function(playerId, options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = '[name]';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '[ver]-[name]';

            /* Initialize YouboraJS */
            this.startMonitoring(playerId, options);

            if (webapis && webapis.avplay) {

                /** Reference to the player. */
                this.player = document.getElementById(playerId);

                /** Reference to the <video> tag. */
                this.video = this.player;

            } else {
                $YB.error("Fatal Error: webapis.avplay not found!")
            }

        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.SamsungAvplay.prototype = new $YB.plugins.Generic;

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.SamsungAvplay.prototype.getPlayhead = function() {
        return webapis.avplay.getCurrentTime() / 1000;
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.SamsungAvplay.prototype.getMediaDuration = function() {
        return webapis.avplay.getDuration() / 1000;
    };

    /** Returns version of the player or an empty string. */
    $YB.plugins.SamsungAvplay.prototype.getPlayerVersion = function() {
        return 'avplay-' + webapis.avplay.getVersion();
    };

    /** Returns the current bitrate of the video or -1. */
    $YB.plugins.SamsungAvplay.prototype.getBitrate = function() {
        try {
            if (webapis.avplay.getCurrentStreamInfo()[0]) {
                var j = JSON.parse(webapis.avplay.getCurrentStreamInfo()[0].extra_info)
                return (j.Bit_rate && j.Bit_rate != "0") ? j.Bit_rate : -1;
            } else {
                return -1;
            }
        } catch (err) {
            return -1;
        }
    };
}
