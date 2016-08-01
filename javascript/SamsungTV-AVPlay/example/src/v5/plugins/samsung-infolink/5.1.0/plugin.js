/**
 * @license
 * Youbora Plugin SamsungTv
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

    $YB.PlayerType = {
        UNKNOWN: 0,
        PLAYER: 1,
        SEF: 2,
    }

    $YB.plugins.SamsungTv = function(playerId, options) {
        try {
            /** Name and platform of the plugin. ie: pc-name */
            this.pluginName = 'samsungtv';

            /** Version of the plugin. ie: 3.0.0-name */
            this.pluginVersion = '5.1.0-samsungtv';

            /** Instance of $YB.Api. Will send /data request. */
            this.yapi = new $YB.Api(this, playerId, options);

            /** Save reference to the player object. */
            this.player = document.getElementById(playerId);

            /* Determine if INFOLINK or SEF */
            switch (this.player.getAttribute('classid')) {
                case 'clsid:SAMSUNG-INFOLINK-PLAYER':
                    this.playerType = $YB.PlayerType.PLAYER;
                    $YB.notice('Player type detected: INFOLINK-PLAYER');
                    break;
                case 'clsid:SAMSUNG-INFOLINK-SEF':
                    this.playerType = $YB.PlayerType.SEF;
                    $YB.notice('Player type detected: INFOLINK-SEF');
                    break;
                default:
                    this.playerType = $YB.PlayerType.UNKNOWN;
                    $YB.warning('No player type detected.');
                    break;
            }

            $YB.notice('Plugin ' + this.pluginVersion + ' is ready.');
        } catch (err) {
            $YB.error(err);
        }
    };

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.SamsungTv.prototype.getPlayhead = function() {
        return this.playhead / 1000;
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.SamsungTv.prototype.getMediaDuration = function() {
        return Math.round(this.player.GetDuration() / 1000);
    };

    /** Returns the src of the resource or an empty string. */
    $YB.plugins.SamsungTv.prototype.getResource = function() {
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
    $YB.plugins.SamsungTv.prototype.getPlayerVersion = function() {
        return this.player.GetPlayerVersion();
    };

    /** Returns the current bitrate of the video or -1. */
    $YB.plugins.SamsungTv.prototype.getBitrate = function() {
        return this.player.GetCurrentBitrates();
    };

    $YB.plugins.SamsungTv.prototype.playHandler = function(url) {
        try {
            $YB.debug("Event: playHandler");

            this.resource = url;
            if (!this.yapi.isStartSent) {
                this.yapi.handleStart();
            }
        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.SamsungTv.prototype.resumeHandler = function() {
        try {
            $YB.debug("Event: resumeHandler");
            this.yapi.handleResume();
        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.SamsungTv.prototype.pauseHandler = function() {
        try {
            $YB.debug("Event: pauseHandler");
            this.yapi.handlePause();
        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.SamsungTv.prototype.stopHandler = function() {
        try {
            $YB.debug("Event: stopHandler");

            this.yapi.handleStop();
        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.SamsungTv.prototype.errorHandler = function(err) {
        try {
            $YB.debug("Event: errorHandler");

            this.yapi.handleError({
                errorCode: err,
                msg: err
            });
        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.SamsungTv.prototype.seekingHandler = function() {
        try {
            $YB.debug("Event: seekingHandler");

            this.yapi.handleSeekStart();
        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.SamsungTv.prototype.bufferingHandler = function() {
        try {
            $YB.debug("Event: bufferingHandler");

            if (this.yapi.isJoinSent) {
                this.yapi.handleBufferStart();
            }

        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.SamsungTv.prototype.bufferedHandler = function() {
        try {
            $YB.debug("Event: bufferedHandler");

            if (!this.yapi.isJoinSent) {
                this.yapi.handleJoin();
            } else if (this.yapi.isSeeking) {
                this.yapi.handleSeekEnd();
            } else {
                this.yapi.handleBufferEnd();
            }
        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.SamsungTv.prototype.playtimeHandler = function(ms) {
        try {
            //$YB.debug("Event: playtimeHandler");

            this.playhead = ms;
        } catch (err) {
            $YB.error(err);
        }
    };


    // Samsung console config
    $YB.plainConsole = true;
    console.log = function(msg) {
        alert(msg);
    }

}
