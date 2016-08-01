/* global $YB */
/**
 * @license
 * Youbora Plugin PlayStation-Webmaf
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {
    $YB.plainConsole = true;

    $YB.plugins.PsWebmaf = function(options) {
        try {
            this.duration = 0;
            this.playhead = 0;

            /** Name and platform of the plugin.*/
            this.pluginName = 'ps-webmaf';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '5.1.1-ps-webmaf';

            /* Initialize YouboraJS */
            this.init("playstation", options);

            // Register the listeners. Comment this line if you want to instantiate the plugin async.
            this.registerListeners();

            //Starting inquiries
            window.external.user('{"command":"appversion"}');
        } catch (err) {
            $YB.error(err);
        }
    };

    /** Inherit from generic plugin */
    $YB.plugins.PsWebmaf.prototype = new $YB.plugins.Generic;

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.PsWebmaf.prototype.getPlayhead = function() {
        return this.playhead;
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.PsWebmaf.prototype.getMediaDuration = function() {
        return this.duration;
    };

    /** Returns the current bitrate of the video or -1. */
    $YB.plugins.PsWebmaf.prototype.getBitrate = function() {
        return this.bitrate;
    };

    $YB.plugins.PsWebmaf.prototype.getThroughput = function() {
        return this.throughput;
    };

    $YB.plugins.PsWebmaf.prototype.getPlayerVersion = function() {
        return this.playerVersion;
    };

    /** This function shall be called from the customer's accessfunction. See Webmaf docummentaton. */
    $YB.plugins.PsWebmaf.prototype.accessfunctionHandler = function(json) {
        try {
            if (json) {

                try {
                    var data = JSON.parse(json);
                } catch (err) {
                    $YB.warn('Accessfunction response is not correct: "' + json + '".');
                    return;
                }

                if (data.command != 'getPlaybackTime')
                    $YB.debug(json); // Expose json content

                switch (data.command) {
                    case 'playerStreamingError':
                    case 'playerError':
                        this.videoApi.sendError({
                            errorCode: data.error_code,
                            msg: data.error
                        });
                        this.videoApi.sendStop();
                        this.stopTimers();
                        break;

                    case 'AppWebBrowser':
                        this.videoApi.sendError({
                            errorCode: data.errorCode,
                            msg: "Web Browser Error"
                        });
                        this.videoApi.sendStop();
                        this.stopTimers();
                        break;

                    case 'playerStatusChange':
                        switch (data.playerState) {
                            case 'endOfStream':
                            case 'stopped':
                            case 'notReady':
                                this.videoApi.sendStop();
                                this.stopTimers();
                                break;

                            case 'paused':
                                this.videoApi.sendPause();
                                break;

                            case 'buffering':
                                if (this.isJoinSent) {
                                    this.videoApi.sendBufferStart();
                                }
                                break;

                            case 'opening':
                                this.duration = data.totalLength;
                                if (!this.isStartSent) {
                                    this.videoApi.sendStart();
                                }
                                this.startTimers();
                                break;

                            case 'playing':
                                if (!this.isJoinSent) {
                                    this.videoApi.sendJoin();
                                } else if (this.isPaused) {
                                    this.videoApi.sendResume();
                                } else if (this.isSeeking) {
                                    this.videoApi.sendSeekEnd();
                                } else if (this.isBuffering) {
                                    this.videoApi.sendBufferEnd();
                                }
                                break;
                        }
                        break;

                    case 'getPlaybackTime':
                        this.playhead = data.elapsedTime;
                        break;

                    case 'setPlayTime':
                        this.videoApi.sendSeekStart();
                        break;

                    case 'getBitrate':
                        this.bitrate = data.bitrate;
                        this.throughput = data.bandwidth;
                        break;

                    case 'playerMessage':
                        switch (data.msg_code) {
                            case -2140536828:
                                this.videoApi.sendError({
                                    errorCode: data.msg_code,
                                    msg: data.msg_info
                                });
                                this.videoApi.sendStop();
                                this.stopTimers();
                                break;
                        }
                        break;

                    case 'contentAvailable':
                        this.duration = data.totalLength;
                        break;

                    case 'appversion':
                        this.playerVersion = data.version
                        break;
                }
            }
        } catch (err) {
            $YB.error(err);
        }
    };

    $YB.plugins.PsWebmaf.prototype.startTimers = function() {
        this.timers = this.timers || {};

        // ask for playheads
        this.timers.playhead = setInterval(function() {
            window.external.user('{"command":"getPlaybackTime"}');
        }, 500);

        this.timers.bitrate = setInterval(function() {
            window.external.user('{"command":"getBitrate"}');
        }, 5000);
    };

    $YB.plugins.PsWebmaf.prototype.stopTimers = function() {
        for (var key in this.timers) {
            clearInterval(this.timers[key]);
        }
    }

}
