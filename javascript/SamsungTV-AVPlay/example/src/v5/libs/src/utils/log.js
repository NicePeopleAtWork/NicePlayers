/**
 * @license
 * YouboraLib Report
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * $YB.report will show all messages inferior to this level.
 * 0: no errors;
 * 1: errors;
 * 2: + warnings;
 * 3: + life-cycle logs;
 * 4: + debug messages;
 * 5: + expose HTTP requests;
 * You can specify youbora-debug="X" inside the &lt;script&gt; tag to force level.
 *
 * @default 2
 * @memberof $YB
 * @see {@link $YB.report}
 */
$YB.debugLevel = 2;

$YB.messageLevels = {
    1: "e", // Error
    2: "w", // Warning
    3: "n", // Notice
    4: "d", // Debug
    5: "v" // Verbose
}

/**
 * If true, console outputs will always be outputed without colors (for debbugin in devices).
 * @default false
 * @memberof $YB
 */
$YB.plainConsole = false;

/**
 * Returns a console message
 *
 * @memberof $YB
 * @private
 * @param {(string|object|array)} msg Message string, object or array of messages.
 * @param {number} [debugLevel=3] Defines the level of the error sent. Only errors with level lower than $YB.debugLevel will be displayed.
 * @param {string} [color=darkcyan] Color of the header
 * @see {@link $YB.debugLevel}
 */
$YB.report = function(msg, debugLevel, color) {
    if (console && console.log) {
        debugLevel = debugLevel || 4;
        color = color || 'darkcyan';
        var letter = $YB.messageLevels[debugLevel];
        var prefix = '[Youbora] ' + letter + ': ';

        // If RemoteLog is available & enabled
        if (typeof $YB.remoteLog != "undefined" && $YB.remoteLog.enabled === true) {
            $YB.remoteLog(prefix + msg);
        }

        // Show messages in actual console if level is enought
        if ($YB.debugLevel >= debugLevel) {

            if ($YB.plainConsole || document.documentMode) { //document.documentMode exits only in IE
                // Plain log for IE and devices
                $YB.plainReport(msg, prefix);
            } else {
                // choose log method
                var logMethod = console.log;
                if (debugLevel == 1 && console.error) {
                    logMethod = console.error;
                } else if (debugLevel == 2 && console.warn) {
                    logMethod = console.warn;
                } else if (debugLevel >= 4 && console.debug) {
                    logMethod = console.debug;
                }

                // print message
                prefix = '%c' + prefix;
                if (msg instanceof Array) {
                    msg.splice(0, 0, prefix, 'color: ' + color);
                    logMethod.apply(console, msg);
                } else {
                    logMethod.call(console, prefix, 'color: ' + color, msg);
                }
            }
        }
    }
};


/**
 * Returns a console message without style
 *
 * @memberof $YB
 * @since  5.3
 * @private
 * @param {(string|object|array)} msg Message string, object or array of messages.
 */
$YB.plainReport = function(msg, prefix) {
    if (msg instanceof Array) {
        for (var m in msg) {
            $YB.plainReport(m);
        }
    } else {
        if (typeof msg == 'string') {
            console.log(prefix + msg);
        } else {
            console.log(prefix + '<next line>');
            console.log(msg);
        }
    }
};

/**
 * Sends an error (level 1) console log.
 * Supports unlimited arguments: ("this", "is", "a", "message")
 * @memberof $YB
 * @see {@link $YB.report}
 */
$YB.error = function( /*...*/ ) {
    $YB.report([].slice.call(arguments), 1, 'darkred');
};

/**
 * Sends a warning (level 2) console log.
 * Supports unlimited arguments: ("this", "is", "a", "message")
 * @memberof $YB
 * @see {@link $YB.report}
 */
$YB.warn = function( /*...*/ ) {
    $YB.report([].slice.call(arguments), 2, 'darkorange');
};

/**
 * Sends a notice (level 3) console log.
 * Supports unlimited arguments: ("this", "is", "a", "message")
 * @memberof $YB
 * @see {@link $YB.report}
 */
$YB.notice = function( /*...*/ ) {
    $YB.report([].slice.call(arguments), 3, 'darkcyan');
};

/**
 * Sends a notice (level 3) console log.
 * Use this function to report service calls "/start", "/error"...
 * Supports unlimited arguments: ("this", "is", "a", "message")
 * @memberof $YB
 * @see {@link $YB.report}
 */
$YB.noticeRequest = function( /*...*/ ) {
    $YB.report([].slice.call(arguments), 3, 'darkgreen');
};

/**
 * Sends a debug message (level 4) to console.
 * Supports unlimited arguments: ("this", "is", "a", "message")
 * @memberof $YB
 * @see {@link $YB.report}
 */
$YB.debug = function( /*...*/ ) {
    $YB.report([].slice.call(arguments), 4, 'indigo');
};

/**
 * Sends a verbose message (level 5) to console.
 * Supports unlimited arguments: ("this", "is", "a", "message")
 * @memberof $YB
 * @see {@link $YB.report}
 */
$YB.verbose = function( /*...*/ ) {
    $YB.report([].slice.call(arguments), 5, 'navy');
};
