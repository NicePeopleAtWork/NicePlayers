/**
 * @license
 * Youbora PingApi
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Instances of this class will call a callback every setted interval.
 *
 * @class
 * @memberof $YB
 * @param {function} callback The callback to call every due interval.
 * @param {int} [interval=5000] Milliseconds between each call.
 */
$YB.utils.Timer = function(callback, interval) {
    try {
        this.callback = callback;
        this.interval = interval || 5000;
        this.isRunning = false;
        this.timer = null;

        this.chrono = new $YB.utils.Chrono();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Starts the timer.
 */
$YB.utils.Timer.prototype.start = function() {
    try {
        this.isRunning = true;
        this._setPing();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Stops the timer.
 */
$YB.utils.Timer.prototype.stop = function() {
    try {
        this.isRunning = false;
        clearTimeout(this.timer);
    } catch (err) {
        $YB.error(err);
    }
};

$YB.utils.Timer.prototype._setPing = function() {
    try {
        if (this.isRunning) {
            this.chrono.start();
            var context = this;
            this.timer = setTimeout(function() {
                context.callback(context.chrono.stop());
                context._setPing();
            }, this.interval);
        }
    } catch (err) {
        $YB.error(err);
    }
};
