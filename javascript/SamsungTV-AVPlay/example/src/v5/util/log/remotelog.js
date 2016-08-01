/*
 * Youbora RemoteDebug
 * Copyright (c) 2015 NicePeopleAtWork
 * Author: Jordi Aguilar
 */

if (typeof $YB != 'undefined') { // is youboraLib loaded?
    $YB.debug('Remote-debug is ready.');

    /**
     * RemoteLog configuration. Host of the script
     * @default http://pre.smartplugin.youbora.com
     * @memberof $YB.remoteLog
     */
    $YB.remoteLog.host = $YB.remoteLog.host || 'http://pre.smartplugin.youbora.com';

    /**
     * RemoteLog configuration. Route to the script file
     * @default /5.0/util/log.php
     * @memberof $YB.remoteLog
     */
    $YB.remoteLog.file = $YB.remoteLog.file || 'src/v5/util/log/';

    /**
     * RemoteLog configuration. If true, every $YB log will also call remoteLog.
     * @default false
     * @memberof $YB.remoteLog
     */
    if (typeof $YB.remoteLog.enabled == "undefined") {
        $YB.remoteLog.enabled = true;
    }

    /**
     * Sends a XHR request to a PHP script for logging purposes.
     *
     * @param msg Message to be sent.
     * @param [host=<$YB.remoteLog.host>] Host of the script
     * @param [file=<$YB.remoteLog.file>] Route to the script file
     * @memberof $YB
     */
    $YB.remoteLog = function(msg, host, file) {
        host = host || $YB.remoteLog.host;
        file = file || $YB.remoteLog.file;

        var ar = new $YB.AjaxRequest(host, file, {
            msg: msg
        });
        ar.send();
    };
}
