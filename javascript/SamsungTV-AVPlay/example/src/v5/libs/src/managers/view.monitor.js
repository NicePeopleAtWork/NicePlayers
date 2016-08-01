// Static Monitor interval in ms
$YB.managers.View.monitoringInterval = 800;
$YB.managers.View.prototype.jumpNextTick = false;

$YB.managers.View.prototype.checkPlayhead = function() {
    if (this.isJoinSent && !this.isShowingAds) {
        var seekThreshold = $YB.managers.View.monitoringInterval * 2;
        var bufferThreshold = $YB.managers.View.monitoringInterval / 2;
        var minBuffer = $YB.managers.View.monitoringInterval * 1.1;

        var currentPlayhead = this.infoManager.getPlayhead();
        var diffPlayhead = Math.abs(this.lastPlayhead - currentPlayhead) * 1000;


        if (diffPlayhead < bufferThreshold) {
            // Ensure at least one tick has passed since the last resume to avoid false detection.
            var timeSinceLastResume = this.lastResume ? Math.abs((new Date().getTime()) - this.lastResume) : 0;

            // detected buffer
            if (this.enableBufferMonitor &&
                (
                    timeSinceLastResume == 0 ||
                    timeSinceLastResume > $YB.managers.View.monitoringInterval
                ) &&
                this.lastPlayhead > 0 &&
                !this.isBuffering &&
                !this.isPaused &&
                !this.isSeeking
            ) {
                this.sendBufferStart();
            }
        } else if (diffPlayhead > seekThreshold) {
            // detected seek
            if (this.enableSeekMonitor) {
                if (
                    this.lastPlayhead > 0 &&
                    !this.IsSeeking
                ) {
                    if (this.isBuffering) {
                        this.convertBufferToSeek();
                    } else {
                        this.sendSeekStart();
                    }
                }
            }
        } else {
            // healthy
            if (
                this.isSeeking &&
                this.enableSeekMonitor
            ) {
                this.sendSeekEnd();
            } else if (
                this.isBuffering &&
                this.enableBufferMonitor &&
                this.chrono.buffer.getDeltaTime(false) > minBuffer
            ) {
                this.sendBufferEnd();
            }
        }

        this.lastPlayhead = currentPlayhead;
    }
};

$YB.managers.View.prototype.checkAdPlayhead = function() {
    if (this.isAdJoinSent) {
        var bufferThreshold = $YB.managers.View.monitoringInterval / 2;
        var minBuffer = $YB.managers.View.monitoringInterval * 1.1;

        var currentPlayhead = this.infoManager.getAdPlayhead();
        var diffPlayhead = Math.abs(this.lastPlayhead - currentPlayhead) * 1000;


        if (diffPlayhead < bufferThreshold) {
            // detected buffer
            if (this.enableAdBufferMonitor && this.lastPlayhead > 0 && !this.isAdBuffering && !this.isAdPaused) {
                this.sendAdBufferStart();
            }
        } else {
            // healthy
            if (this.isAdBuffering && this.chrono.adBuffer.getDeltaTime(false) > minBuffer) {
                this.sendAdBufferEnd();
            }
        }

        this.lastPlayhead = currentPlayhead;
    }
};

$YB.managers.View.prototype.stopTimers = function() {
    this.timer.pinger.stop();
    this.timer.playheadMonitor.stop();
    this.timer.adPlayheadMonitor.stop();
};
