/**
 * @license
 * Youbora Plugin [ver]-LgMediaPlayer
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.plugins.LgMediaPlayer = function(playerId, options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = '[name]';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '[ver]-[name]';

            /* Initialize YouboraJS */
            this.init(playerId, options);
        } catch (err) {
            $YB.error(err);
        }
    };

    // Extend Generic Plugin
    $YB.plugins.LgMediaPlayer.prototype = new $YB.plugins.Generic;

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.LgMediaPlayer.prototype.getPlayhead = function() {
        return this.player.playPosition / 1000;
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.LgMediaPlayer.prototype.getMediaDuration = function() {
        return this.player.playTime / 1000;
    };

    /** Returns the src of the resource or an empty string. */
    $YB.plugins.LgMediaPlayer.prototype.getResource = function() {
        return this.player.data;
    };

    /** Returns version of the player or an empty string. */
    $YB.plugins.LgMediaPlayer.prototype.getPlayerVersion = function() {
        return 'LG-MediaPlayer-' + this.player.version;
    };

    /** Returns the current bitrate of the video or -1. */
    $YB.plugins.LgMediaPlayer.prototype.getBitrate = function() {
        return this.player.mediaPlayInfo().bitrateTarget;
    };

    /** Handlers */
    $YB.plugins.LgMediaPlayer.prototype.playStateChangeHandler = function() {
        try {
            $YB.debug('State Change: ' + this.player.playState);
            switch (this.player.playState) {
                case 0: //Stopped
                    this.stopHandler();
                    break;
                case 1: //Playing
                    this.playingHandler();
                    break;
                case 2: //Paused
                    this.pauseHandler();
                    break;
                case 3: //Connecting
                    break;
                case 4: //Buffering
                    this.bufferingHandler();
                    break;
                case 5: //Finished
                    this.stopHandler();
                    break;
                case 6: //Error
                    this.errorHandler(this.player.error);
                    break;
            }
        } catch (err) {
            $YB.error(err);
        }
    };
}
