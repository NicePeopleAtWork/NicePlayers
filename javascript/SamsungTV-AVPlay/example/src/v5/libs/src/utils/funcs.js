/**
 * @license
 * YouboraLib Util
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Return n if it isn't NaN, negative, Infinity, null or undefined. In any other case, return def.
 * @param {mixed} n Number to be parsed.
 * @param {number} def Number to return if n is not correct.
 */
$YB.utils.parseNumber = function(n, def) {
    if (!isNaN(n) && n >= 0 && n != Infinity && n !== null && typeof n != "undefined") {
        return n;
    } else {
        return def;
    }
};

/**
 * This utility function will add most of the HTML5 event listener to the player sent.
 * This common events will be listened: 'canplay', 'buffering', 'waiting', 'ended', 'play', 'playing', 'pause', 'resume', 'error', 'abort', 'seek', 'seeking', 'seeked', 'stalled', 'dispose', 'loadeddata', 'loadstart'.
 * Events will be reported as level 4 messages (debug).
 *
 * @memberof Debug-Util
 * @param o Object to attach the events.
 * @param [extraEvents] An array of extra events to watch. ie:  ['timeupdate', 'progress']. If the first item is null, no common events will be added.
 * @param {function} [report] Callback function called to report events. Default calls $YB.debug.
 */
$YB.utils.listenAllEvents = function(o, extraEvents, report) {
    try {
        if ($YB.debugLevel >= 4) {
            report = report || function(e) {
                var label = "";
                if (typeof e.target != 'undefined' && typeof e.target.id != 'undefined') {
                    label = e.target.id;
                }

                $YB.debug('Event: ' + label + ' > ' + e.type);
            };

            var playerEvents = [
                'canplay', 'buffering', 'waiting', 'ended', 'play', 'playing', 'pause', 'resume', 'error',
                'abort', 'seek', 'seeking', 'seeked', 'stalled', 'dispose', 'loadeddata', 'loadstart'
            ];
            if (extraEvents) {
                if (extraEvents[0] === null) {
                    extraEvents.shift();
                    playerEvents = extraEvents;
                } else {
                    playerEvents = playerEvents.concat(extraEvents);
                }
            }

            for (var i = 0; i < playerEvents.length; i++) {
                if (typeof o == "function") {
                    o.call(window, playerEvents[i], report);
                } else if (o.on) {
                    o.on(playerEvents[i], report);
                } else if (o.addEventListener) {
                    o.addEventListener(playerEvents[i], report);
                }
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

// Define the headers of debug-util functions
$YB.utils.serialize = $YB.utils.listenAllEvents || function() {};
