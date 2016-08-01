/**
 * @license
 * Youbora Plugin TizenAvplay
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    //Console fix
    $YB.plainConsole = true;

    $YB.plugins.TizenAvplay = function(playerId, options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = 'tizen-avplay';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '5.1.0-tizen-avplay';

            if (webapis && webapis.avplay) {

                /** Instance of $YB.Api. Will send /data request. */
                this.yapi = new $YB.Api(this, playerId, options);

                /** Reference to the player. */
                this.player = document.getElementById(playerId);

                /** Reference to the <video> tag. */
                this.video = this.player;

                $YB.notice('Plugin ' + this.pluginVersion + ' is ready.');
            } else {
                $YB.error("Fatal Error: webapis.avplay not found!")
            }
        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.TizenAvplay.prototype = new $YB.plugins.Generic;

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.TizenAvplay.prototype.getPlayhead = function() {
        return webapis.avplay.getCurrentTime() / 1000;
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.TizenAvplay.prototype.getMediaDuration = function() {
        return webapis.avplay.getDuration() / 1000;
    };

    /** Returns version of the player or an empty string. */
    $YB.plugins.TizenAvplay.prototype.getPlayerVersion = function() {
        return 'avplay-' + webapis.avplay.getVersion();
    };

    /** Returns the current bitrate of the video or -1. */
    $YB.plugins.TizenAvplay.prototype.getBitrate = function() {
        try {
            if (webapis.avplay.getCurrentStreamInfo()[0]) {
                var j = JSON.parse(webapis.avplay.getCurrentStreamInfo()[0].extra_info)
                return j.Bit_rate;
            } else {
                return -1;
            }
        } catch (err) {
            return -1;
        }
    };
}
