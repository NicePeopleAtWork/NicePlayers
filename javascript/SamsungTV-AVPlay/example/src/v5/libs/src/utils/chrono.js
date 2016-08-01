/**
 * @license
 * Youbora Chrono
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * This class calculates time lapses between two points.
 * @class
 * @memberof $YB
 */
$YB.utils.Chrono = function() {
    try {
        this.startTime = 0;
        this.lastTime = 0;

    } catch (err) {
        $YB.error(err);
    }
};


/**
 * Returns the time between start() and the last stop() in ms. Returns -1 if start wasn't called.
 * @param {boolean} [stop=true] If true, it will force a stop() if it wasn't called before.
 * @return Time lapse in ms.
 */
$YB.utils.Chrono.prototype.getDeltaTime = function(stop) {
    try {
        if (this.startTime) {
            if (this.lastTime === 0) {
                if (stop !== false) {
                    return this.stop();
                } else {
                    return new Date().getTime() - this.startTime
                }
            } else {
                return this.lastTime - this.startTime;
            }
        } else {
            return -1;
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Starts the timer.
 */
$YB.utils.Chrono.prototype.start = function() {
    try {
        this.startTime = new Date().getTime();
        this.lastTime = 0;
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Stops the timer and returns current delta time.
 * @return Returns the delta time
 */
$YB.utils.Chrono.prototype.stop = function() {
    try {
        this.lastTime = new Date().getTime();

        return this.getDeltaTime();
    } catch (err) {
        $YB.error(err);
    }
};
