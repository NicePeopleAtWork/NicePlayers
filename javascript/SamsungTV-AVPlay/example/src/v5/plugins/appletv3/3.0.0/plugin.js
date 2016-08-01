/** 
 * @license
 * Youbora Plugin AppleTv3
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

// Disable Retries in  the device
$YB.AjaxRequest.options.retryAfter = 0;


$YB.plugins.AppleTv3 = function(options, referer) {
    try {
        /** Name and platform of the plugin. ie: pc-name */
        this.pluginName = 'appleTv3';

        /** Version of the plugin. ie: 3.0.0-name */
        this.pluginVersion = '3.0.0-appleTv3';

        /** Instance of $YB.Api. Will send /data request. */
        this.yapi = new $YB.Api(this, 'appleTv3', options);

        this.referer = referer;
        this.playhead = 0;

        $YB.notice('Plugin ' + this.pluginVersion + ' is ready.');
    } catch (err) {
        $YB.error(err);
    }
};

$YB.plugins.AppleTv3.prototype.didStopPlayingHandler = function() {
    try {
        $YB.debug('Event > Stop');
        this.yapi.handleStop();
    } catch (err) {
        $YB.error(err);
    }
}

$YB.plugins.AppleTv3.prototype.playerStateChangedHandler = function(newState, playhead) {
    try {
        $YB.debug('Event > StateChanged > ' + newState + ' ' + playhead);

        // Save the playhead
        this.playhead = playhead;

        switch (newState) {
            case 'Playing':
                this.yapi.handleJoin();

                if (this.yapi.isSeeking) {
                    this.yapi.handleSeekEnd();
                }

                if (this.yapi.isBuffering) {
                    this.yapi.handleBufferEnd();
                }

                if (this.yapi.isPaused) {
                    this.yapi.handleResume();
                }
                break;

            case 'Paused':
                this.yapi.handlePause();
                break;
        }
    } catch (err) {
        $YB.error(err);
    }
}

$YB.plugins.AppleTv3.prototype.onStartBufferingHandler = function(playhead) {
    try {
        $YB.debug('Event > StartBuffer ' + playhead);

        // Save the playhead
        this.playhead = playhead;

        if (!this.yapi.isStartSent) {
            this.yapi.handleStart({
                referer: this.referer
            });
        } else if (!this.yapi.isSeeking) {
            this.yapi.handleBufferStart();
        }
    } catch (err) {
        $YB.error(err);
    }
}

$YB.plugins.AppleTv3.prototype.onBufferSufficientToPlayHandler = function() {
    try {
        $YB.debug('Event > EndBuffer');
    } catch (err) {
        $YB.error(err);
    }
}

$YB.plugins.AppleTv3.prototype.playerWillSeekToTimeHandler = function(playhead) {
    try {
        $YB.debug('Event > willSeek ' + playhead);

        // Save the playhead
        this.playhead = playhead;

        if (!this.yapi.isSeeking) {
            this.yapi.handleSeekStart();
        }
    } catch (err) {
        $YB.error(err);
    }
}

$YB.plugins.AppleTv3.prototype.onPlaybackErrorHandler = function(msg) {
    try {
        $YB.debug('Event > Error > ' + msg);

        this.yapi.handleError({
            errorCode: msg,
            msg: msg,
            referer: this.referer
        });
    } catch (err) {
        $YB.error(err);
    }
}

$YB.plugins.AppleTv3.prototype.playerTimeDidChangeHandler = function(playhead) {
    try { // Save the playhead
        //$YB.debug('Event > Time > ' + playhead);
        this.playhead = playhead;
    } catch (err) {
        $YB.error(err);
    }
}

$YB.plugins.AppleTv3.prototype.getMediaDuration = function() {
    return atv.player.currentItem.duration;
}

$YB.plugins.AppleTv3.prototype.getPlayhead = function() {
    return this.playhead;
}