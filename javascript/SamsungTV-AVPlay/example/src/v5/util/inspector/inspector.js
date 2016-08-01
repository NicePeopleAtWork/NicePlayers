/*
 * Youbora DebugUtil
 * Copyright (c) 2015 NicePeopleAtWork
 * Author: Jordi Aguilar
 */

if (typeof $YB != 'undefined') { // is youboraLib loaded?
    if ($YB.version.startsWith("5.3")) {
        $YB.inspector = {
            divs: {},
            collapsed: false,
            init: function() {
                // Create styles
                $YB.inspector.createStyles();

                // Create div structure
                $YB.inspector.createDivs();

                // Provault log systems
                $YB.comm.AjaxRequest.onEverySuccess = $YB.inspector.nqsdebugLog;
                $YB.remoteLog = $YB.inspector.consoleLog;
                $YB.remoteLog.enabled = true;

                // Console
                $YB.debug('Youbora Inspector is ready.');
            },
            createStyles: function() {
                var css = "#YBInspector { position:fixed; bottom: 0; left: 0; height: 33%; width: 100%; background-color: #F8F8F8; opacity: 0.85; line-height: normal; z-index: 99; }";
                css += "#YBMenu { text-align: center; height: 20px !important; padding: 2px; background-color: rgb(38, 42, 55); border: 1px solid black; color: white; font-family: Ubuntu, sans-serif; font-size: 14px; overflow: hidden; box-sizing: content-box;}";
                css += "#YBMenu .radioflag { background-color: darkred; border-radius: 50%; width: 14px; height: 14px; border: 1px solid black; display:inline-block; }"
                css += "#nqs-button-collapse { background-color: #F8F8F8; color: black; border-radius: 3px; width: 25px; border: 1px solid black;}"
                css += "#nqs-button-collapse:hover { background-color: #e5005f; color: white; }"
                css += "#YBInspector .yblogger { width: calc(50% - 10px); height: calc(100% - 50px); overflow: scroll; font-size: 11px !important; font-family: Menlo, monospace; padding: 5px; color: black;}";
                css += ".yblogger .error strong { color: darkred; }"
                css += ".yblogger .warning strong { color: darkorange; }"
                css += ".yblogger .notice strong { color: darkgreen; }"
                css += ".yblogger .debug strong { color: purple; }"
                css += ".yblogger .verbose strong { color: navy; }"
                css += ".ybmessage.disabled { display: none }"
                css += ".ybtoggler { margin: 0; background-color: #f8f8f8; padding: 5px; text-align: center; position: fixed; bottom: 0; height: 24px; }"
                css += ".ybtoggler menuitem { cursor: pointer; }"
                css += ".ybtoggler menuitem.disabled strong { color: darkgray !important; }"

                var style = document.createElement('style');
                style.type = 'text/css';
                if (style.styleSheet) {
                    style.styleSheet.cssText = css;
                } else {
                    style.appendChild(document.createTextNode(css));
                }

                var head = document.head || document.getElementsByTagName('head')[0];
                head.appendChild(style);
            },
            createDivs: function() {
                var body = document.body || document.getElementsByTagName('body')[0];
                //document.body.style.position = "relative";

                //Main div
                $YB.inspector.divs.main = $YB.inspector.appendDiv(body, {
                    id: "YBInspector"
                });

                //Menu div
                $YB.inspector.divs.menu = $YB.inspector.appendDiv($YB.inspector.divs.main, {
                    id: "YBMenu",
                    //innerHTML: "~Youbora Inspector~"
                });
                $YB.inspector.appendMenu($YB.inspector.divs.menu);

                //Console div
                $YB.inspector.divs.console = $YB.inspector.appendDiv($YB.inspector.divs.main, {
                    id: "YBConsole",
                    className: "yblogger",
                    style: { float: "left" }
                });
                $YB.inspector.appendTogglerMenu($YB.inspector.divs.console);

                //Nqs debug div
                $YB.inspector.divs.nqsdebug = $YB.inspector.appendDiv($YB.inspector.divs.main, {
                    id: "YBNqsDebug",
                    className: "yblogger",
                    style: { float: "right" }
                });
                $YB.inspector.appendTogglerMenu($YB.inspector.divs.nqsdebug);

                $YB.inspector.appendDiv($YB.inspector.divs.main, {
                    style: { clear: "both" }

                });

                setInterval($YB.inspector.inspectPlugins, 500);
            },
            inspectPlugins: function() {
                var plugins = "";
                for (var k in $YB.plugins.map) {
                    var plugin = $YB.plugins.map[k];
                    plugins += " " + plugin.pluginVersion + (plugin.playerId ? " (" + plugin.playerId + ")" : "");
                }
                $YB.inspector.divs.plugins.innerHTML = plugins;

                var plugin = $YB.plugins.map[0];
                if (plugin) {
                    $YB.inspector.divs.startstatus.style["background-color"] = plugin.viewManager.isStartSent ? "green" : "darkred";
                    $YB.inspector.divs.joinstatus.style["background-color"] = plugin.viewManager.isJoinSent ? "green" : "darkred";
                    $YB.inspector.divs.pausestatus.style["background-color"] = plugin.viewManager.isPaused ? "green" : "darkred";
                    $YB.inspector.divs.seekstatus.style["background-color"] = plugin.viewManager.isSeeking ? "green" : "darkred";
                    $YB.inspector.divs.bufferstatus.style["background-color"] = plugin.viewManager.isBuffering ? "green" : "darkred";
                    $YB.inspector.divs.adsstatus.style["background-color"] = plugin.viewManager.isShowingAds ? "green" : "darkred";
                    $YB.inspector.divs.pingsstatus.style["background-color"] = plugin.viewManager.timer.pinger.isRunning ? "green" : "darkred";
                    $YB.inspector.divs.errorstatus.style["background-color"] = plugin.viewManager.isErrorSent ? "green" : "darkred";

                    $YB.inspector.divs.joincomment.innerHTML = plugin.viewManager.chrono.joinTime.getDeltaTime(false) + "ms";
                    $YB.inspector.divs.seekcomment.innerHTML = plugin.viewManager.chrono.seek.getDeltaTime(false) + "ms";
                    $YB.inspector.divs.buffercomment.innerHTML = plugin.viewManager.chrono.buffer.getDeltaTime(false) + "ms";
                }
            },
            consoleLog: function(msg) {
                var className = "";
                switch (msg.substr(10, 1)) {
                    case "e":
                        className = "error";
                        break;
                    case "w":
                        className = "warning";
                        break;
                    case "n":
                        className = "notice";
                        break;
                    case "d":
                        className = "debug";
                        break;
                    case "v":
                        className = "verbose";
                        break;
                }

                var toggler = $YB.inspector.divs.console.getElementsByClassName("ybtoggler")[0];
                var check = toggler ? toggler.getElementsByClassName(className)[0] : false;
                className += ((check && check.className.indexOf("disabled") !== -1) ? " disabled" : "");

                msg = msg.replace("[Youbora]", "<strong>[Youbora]</strong>");
                var div = $YB.inspector.appendDiv($YB.inspector.divs.console, {
                    className: "ybmessage " + className
                });
                div.innerHTML = msg;

                $YB.inspector.divs.console.scrollTop = $YB.inspector.divs.console.scrollHeight;
            },
            nqsdebugLog: function() {
                try {
                    var obj = JSON.parse(this.response);
                    if (obj) {
                        $YB.inspector.appendArray($YB.inspector.divs.nqsdebug, obj.errors, "Error", obj.event);
                        $YB.inspector.appendArray($YB.inspector.divs.nqsdebug, obj.warnings, "Warning", obj.event);
                        $YB.inspector.appendArray($YB.inspector.divs.nqsdebug, obj.notices, "Notice", obj.event);
                    }
                } catch (err) {}

                $YB.inspector.divs.nqsdebug.scrollTop = $YB.inspector.divs.nqsdebug.scrollHeight;
            },
            appendDiv: function(container, options, element) {
                var div = document.createElement(element || 'div');
                for (k in options) {
                    if (k == "style") {
                        for (var style in options[k])
                            div.style[style] = options[k][style];
                    } else {
                        div[k] = options[k];
                    }
                }
                container.appendChild(div);
                return div;
            },
            appendArray: function(container, arr, type, category) {
                var toggler = container.getElementsByClassName("ybtoggler")[0];
                for (var k in arr) {
                    var check = toggler ? toggler.getElementsByClassName(type.toLowerCase())[0] : false;
                    var div = $YB.inspector.appendDiv(container);
                    div.className = "ybmessage " +
                        ((type) ? type.toLowerCase() : "") + " " +
                        ((check && check.className.indexOf("disabled") !== -1) ? "disabled" : "");

                    div.innerHTML = "<strong>" + type + (category ? " (" + category + ")" : "") + ":</strong> " + arr[k];
                }
            },
            appendTogglerMenu: function(container) {
                var toggler = $YB.inspector.appendDiv(container, { className: "ybtoggler" }, 'menu');

                $YB.inspector.appendDiv(toggler, {
                        className: "error",
                        innerHTML: "[<strong>errors</strong>]"
                    }, 'menuitem')
                    .onclick = $YB.inspector.ontogglerclicked;

                $YB.inspector.appendDiv(toggler, {
                        className: "warning",
                        innerHTML: " [<strong>warnings</strong>]"
                    }, 'menuitem')
                    .onclick = $YB.inspector.ontogglerclicked;

                $YB.inspector.appendDiv(toggler, {
                        className: "notice",
                        innerHTML: " [<strong>notice</strong>]"
                    }, 'menuitem')
                    .onclick = $YB.inspector.ontogglerclicked;

                $YB.inspector.appendDiv(toggler, {
                        className: "debug",
                        innerHTML: " [<strong>debug</strong>]"
                    }, 'menuitem')
                    .onclick = $YB.inspector.ontogglerclicked;

                $YB.inspector.appendDiv(toggler, {
                        className: "verbose",
                        innerHTML: " [<strong>verbose</strong>]"
                    }, 'menuitem')
                    .onclick = $YB.inspector.ontogglerclicked;

            },
            ontogglerclicked: function(e) {
                var button = e.target.parentNode;
                var className = button.classList[0];
                var logger = button.parentNode.parentNode;

                var messages = logger.getElementsByClassName(className);
                for (var i = 0; i < messages.length; i++) {
                    messages[i].classList.toggle("disabled");
                }

                logger.scrollTop = logger.scrollHeight;
            },
            appendMenu: function(container) {
                var arr = ['start', 'join', 'pause', 'seek', 'buffer', 'ads', 'error', 'pings'];
                var msg = "";
                for (var k in arr) {
                    msg += '[ <div class="radioflag" id="nqs-' + arr[k] + '-status"></div> ' + arr[k].toUpperCase() + ' <span id="nqs-' + arr[k] + '-comment"></span>]'
                }

                // Left Part
                $YB.inspector.appendDiv($YB.inspector.divs.menu, {
                    style: { float: "left" },
                    innerHTML: msg
                });

                // Right Part
                var div = $YB.inspector.appendDiv($YB.inspector.divs.menu, {
                    style: { float: "right" },
                    innerHTML: 'Plugins: <span id="nqs-plugins-detected">-</span>&nbsp;' +
                        '<button id="nqs-button-collapse" onclick="$YB.inspector.collapse()">V</button>'
                });

                // save divs
                for (var k in arr) {
                    $YB.inspector.divs[arr[k] + "status"] = document.getElementById("nqs-" + arr[k] + "-status");
                    $YB.inspector.divs[arr[k] + "comment"] = document.getElementById("nqs-" + arr[k] + "-comment");
                }
                $YB.inspector.divs["plugins"] = document.getElementById("nqs-plugins-detected");
            },
            collapse: function() {
                if ($YB.inspector.collapsed) {
                    $YB.inspector.divs.main.style.height = '33%';
                    $YB.inspector.collapsed = false;
                    document.getElementById("nqs-button-collapse").innerHTML = "V";
                } else {
                    $YB.inspector.divs.main.style.height = '26px';
                    $YB.inspector.collapsed = true;
                    document.getElementById("nqs-button-collapse").innerHTML = "^";
                }

                var togglers = document.getElementsByClassName("ybtoggler");
                for (var i = 0; i < togglers.length; i++) {
                    togglers[i].style.display = $YB.inspector.collapsed ? "none" : "block";
                }
            }
        };

        // Start inspector
        $YB.inspector.init();
    } else {
        $YB.error("Youbora Inspector needs youboralib 5.3 or more to run.")
    }
}
