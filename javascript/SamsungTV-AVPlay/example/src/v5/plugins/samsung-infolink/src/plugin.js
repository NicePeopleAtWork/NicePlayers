/**
 * @license
 * Youbora Plugin SamsungInfolink
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    // Samsung console config
    $YB.plainConsole = true;
    console.log = function(msg) {
        alert(msg);
    }

    $YB.plugins.SamsungInfolink = function(playerId, options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = '[name]';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '[ver]-[name]';

            /* Initialize YouboraJS */
            this.startMonitoring(playerId, options);

            /* Determine if INFOLINK or SEF */
            switch (this.player.getAttribute('classid')) {
                case 'clsid:SAMSUNG-INFOLINK-PLAYER':
                    this.playerType = "INFOLINK-PLAYER";
                    break;
                case 'clsid:SAMSUNG-INFOLINK-SEF':
                    this.playerType = "INFOLINK-SEF";
                    break;
                default:
                    this.playerType = "UNKNOWN";
                    break;
            }
            $YB.notice('Player type detected: ' + this.playerType);

        } catch (err) {
            $YB.error(err);
        }
    };

    /** Inherit from generic plugin */
    $YB.plugins.SamsungInfolink.prototype = new $YB.plugins.Generic;

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.SamsungInfolink.prototype.getPlayhead = function() {
        return this.playhead / 1000;
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.SamsungInfolink.prototype.getMediaDuration = function() {
        if (this.playerType == "INFOLINK-SEF") {
            return Math.round(this.player.Execute("GetDuration") / 1000);
        } else if (this.playerType == "INFOLINK-PLAYER") {
            return Math.round(this.player.GetDuration() / 1000);

        } else {
            return 0;
        }
    };

    /** Returns the src of the resource or an empty string. */
    $YB.plugins.SamsungInfolink.prototype.getResource = function() {
        var r = this.resource;
        if (typeof r != 'undefined') {
            if (r.indexOf('|') === -1) {
                return this.resource;
            } else if (typeof r != 'undefined') {
                return r.slice(0, r.indexOf('|'));
            }
        } else {
            return '';
        }
    };

    /** Returns version of the player or an empty string. */
    $YB.plugins.SamsungInfolink.prototype.getPlayerVersion = function() {
        return this.playerType;
    };

    /** Returns the current bitrate of the video or -1. */
    $YB.plugins.SamsungInfolink.prototype.getBitrate = function() {
        if (this.playerType == "INFOLINK-SEF") {
            return this.player.Execute("GetCurrentBitrates");
        } else if (this.playerType == "INFOLINK-PLAYER") {
            return this.player.GetCurrentBitrates();
        } else {
            return -1;
        }
    };

    $YB.plugins.SamsungInfolink.prototype.playHandler = function(url) {
        try {
            $YB.debug("Event: playHandler");

            this.resource = url;
            if (!this.viewManager.isStartSent) {
                this.viewManager.sendStart();
            }
        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.SamsungInfolink.prototype.resumeHandler = function() {
        try {
            $YB.debug("Event: resumeHandler");
            this.viewManager.sendResume();
        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.SamsungInfolink.prototype.pauseHandler = function() {
        try {
            $YB.debug("Event: pauseHandler");
            this.viewManager.sendPause();
        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.SamsungInfolink.prototype.stopHandler = function() {
        try {
            $YB.debug("Event: stopHandler");

            this.viewManager.sendStop();
        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.SamsungInfolink.prototype.errorHandler = function(err) {
        try {
            $YB.debug("Event: errorHandler");

            this.viewManager.sendError({
                errorCode: err,
                msg: err
            });
        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.SamsungInfolink.prototype.seekingHandler = function() {
        try {
            $YB.debug("Event: seekingHandler");

            this.viewManager.sendSeekStart();
        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.SamsungInfolink.prototype.bufferingHandler = function() {
        try {
            $YB.debug("Event: bufferingHandler");

            if (this.viewManager.isJoinSent) {
                this.viewManager.sendBufferStart();
            }

        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.SamsungInfolink.prototype.bufferedHandler = function() {
        try {
            $YB.debug("Event: bufferedHandler");

            if (!this.viewManager.isJoinSent) {
                this.viewManager.sendJoin();
            } else if (this.viewManager.isSeeking) {
                this.viewManager.sendSeekEnd();
            } else {
                this.viewManager.sendBufferEnd();
            }
        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.SamsungInfolink.prototype.playtimeHandler = function(ms) {
        try {
            //$YB.debug("Event: playtimeHandler");

            this.playhead = ms;
        } catch (err) {
            $YB.error(err);
        }
    };

}
