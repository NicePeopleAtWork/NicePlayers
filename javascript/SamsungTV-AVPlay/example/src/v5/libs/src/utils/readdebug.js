/**
 * @license
 * YouboraLib Log
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

// This script will search inside tags and url request for info about debugLevel, plainConsole or remoteLog.
(function() {
    try {
        if (typeof window != 'undefined') {

            function defineConsole(options) {
                switch (options) {
                    case 'plain':
                        $YB.plainConsole = true;
                        break;
                    case 'remote':
                        $YB.remoteLog.forced = true;
                        break;
                    case 'plain+remote':
                    case 'remote+plain':
                        $YB.remoteLog.forced = true;
                        $YB.plainConsole = true;
                        break;
                }
            }

            // It will first search it in the tags: <script src='this_file.js' youbora-debug="X" youbora-console="Y"></script>
            var tags = document.getElementsByTagName('script');
            for (var k in tags) {
                if (tags[k].getAttribute) {
                    var tag = tags[k].getAttribute('youbora-debug');
                    if (tag) {
                        $YB.debugLevel = tag;
                    }

                    tag = tags[k].getAttribute('youbora-console');
                    if (tag) {
                        defineConsole(tag);
                    }
                }
            }


            // Then it will search inside window.location.search for attributes like 'youbora-debug=X' or 'youbora-console=Y'.
            // Config found here will prevail over the one fetched from <script> tags.
            var m = /\?.*\&*youbora-debug=(.+)/i.exec(window.location.search);
            if (m !== null) {
                $YB.debugLevel = m[1];
            }

            m = /\?.*\&*youbora-console=(.+)/i.exec(window.location.search);
            if (m !== null) {
                defineConsole(m[1]);
            }
        }
    } catch (err) {
        $YB.error(err);
    }
}());