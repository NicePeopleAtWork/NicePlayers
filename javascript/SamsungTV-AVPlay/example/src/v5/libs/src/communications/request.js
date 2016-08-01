/**
 * @license
 * Youbora AjaxRequest
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * AjaxRequest will generate the call URL. See createServiceUrl.
 *
 * @class
 * @memberof $YB
 * @param {string} host URL of the request. ie: nqs.nice264.com
 * @param {string} [service] Name of the service. ie '/start'
 * @param {(string|Object)} [params] String of params. Skip '?' at start. ie: 'system=nicetv&user=user'.
 * @param {Object} [options] Object with custom options.
 * @param {string} [options.method=GET] Specifies the method of the request ie: "GET", "POST", "HEAD".
 * @param {string} [options.requestHeaders] A literal with options of requestHeaders. ie: {header: value}.
 * @param {number} [options.retryAfter=5000] Time in ms before sending a failed request again. 0 to disable.
 * @param {number} [options.maxRetries=3] Max number of retries. 0 to disable.
 */
$YB.comm.AjaxRequest = function(host, service, params, options) {
    try {
        this.xhr = this.createXHR(); // new xhrRequest();
        this.host = host;
        this.service = service || "";
        this.params = params;
        this.options = options || {};
        this.options.method = this.options.method || $YB.comm.AjaxRequest.options.method;
        this.options.maxRetries = this.options.maxRetries || $YB.comm.AjaxRequest.options.maxRetries;

        if (typeof this.options.retryAfter == 'undefined') {
            this.options.retryAfter = $YB.comm.AjaxRequest.options.retryAfter;
        }

        this.hasError = false;
        this.retries = 1;
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Adds a callback to 'load' event of every success request.
 */
$YB.comm.AjaxRequest.onEverySuccess = null;

/**
 * Default options
 */
$YB.comm.AjaxRequest.options = {
    method: 'GET',
    requestHeaders: {},
    maxRetries: 3,
    retryAfter: 5000
};

/** Returns the complete url of the request. */
$YB.comm.AjaxRequest.prototype.getUrl = function() {
    try {
        return this.host + this.service + this.getParams();
    } catch (err) {
        $YB.error(err);
    }
};

/** Returns the params of the request, stringified. ie: '?pluginVersion=5.1.0&systemCode=nicetv'. */
$YB.comm.AjaxRequest.prototype.getParams = function() {
    try {
        switch (typeof this.params) {
            case "object":
                return "?" + this._parseParams(this.params);
            case "string":
                if (this.params) {
                    return "?" + this.params;
                }
                return "";
            default:
                return "";
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Add or set a parameter for the request. ie: if you want to add 'username=user' use setParam('username', 'user').
 * @param {string} key Name of the paremeter.
 * @param {string} value Name of the paremeter.
 * @return Returns AjaxRequest object.
 */
$YB.comm.AjaxRequest.prototype.setParam = function(key, value) {
    try {
        switch (typeof this.params) {
            case "string":
                if (this.params.length > 0) {
                    this.params += "&";
                }
                this.params += key + "=" + value;
                break;
            case "object":
            default:
                this.params[key] = value;
                break;

        }
        return this;
    } catch (err) {
        $YB.error(err);
        return this;
    }
};

/**
 * Adds a callback to an event.
 *
 * @param {string} event Name of the event. ie: 'load', 'error'...
 * @param {function} [callback] Callback function to call whenever HTTPRequest returns the event.
 * @return {$YB.comm.AjaxRequest} Returns current request item.
 */
$YB.comm.AjaxRequest.prototype.on = function(event, callback) {
    try {
        if (event == 'error') {
            this.hasError = true;
        }

        if (typeof callback == "function") {
            this.xhr.addEventListener(event, callback, false);
        } else if (typeof callback != "undefined") {
            $YB.warn("Warning: Request '" + this.getUrl() + "' has a callback that is not a function.");
        }
    } catch (err) {
        $YB.error(err);
    } finally {
        return this;
    }
};

/**
 * Adds a callback to 'load' event
 *
 * @param {function} [callback] Callback function to call whenever HTTPRequest returns the event.
 * @return {$YB.comm.AjaxRequest} Returns current request item.
 * @see {@link $YB.comm.AjaxRequest#on}
 */
$YB.comm.AjaxRequest.prototype.load = function(callback) {
    return this.on('load', callback);
};

/**
 * Adds a callback to 'error' event
 *
 * @param {function} [callback] Callback function to call whenever HTTPRequest returns the event.
 * @return {$YB.comm.AjaxRequest} Returns current request item.
 * @see {@link $YB.comm.AjaxRequest#on}
 */
$YB.comm.AjaxRequest.prototype.error = function(callback) {
    return this.on('error', callback);
};

/**
 * Send the request.
 *
 * @return returns xhrRequest.send().
 */
$YB.comm.AjaxRequest.prototype.send = function() {
    try {
        this.xhr.open(this.options.method, this.getUrl(), true);
        if (this.options.requestHeaders) {
            for (var key in this.options.requestHeaders) {
                if (this.options.requestHeaders.hasOwnProperty(key)) {
                    this.xhr.setRequestHeader(key, this.options.requestHeaders[key]);
                }
            }
        }

        if (!this.hasError && this.options.retryAfter > 0 && this.options.maxRetries > 0) {
            var that = this;
            this.error(function genericError() {
                if (that.retries > that.options.maxRetries) {
                    $YB.error("Error: Aborting failed request. Max retries reached.");
                } else {
                    $YB.warn("Error: Request " + that.service + " failed. Retry " + that.retries + " of " + that.options.maxRetries + " in " + that.options.retryAfter + "ms.");
                    var context = that;
                    setTimeout(function() {
                        context.retries += 1;
                        //context.xhr.removeEventListener("error", genericError);
                        context.send();
                    }, that.options.retryAfter);
                }
            });
        }

        if ($YB.debugLevel >= 5) {
            $YB.verbose("XHR Req: " + this.getUrl());
        }

        // Register on every success
        if (typeof $YB.comm.AjaxRequest.onEverySuccess == "function") {
            this.load($YB.comm.AjaxRequest.onEverySuccess);
        }

        this.xhr.send();

    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Creates XMLHttpRequest if it is available in the browser.
 * If not, it creates an ActiveXObject xhr item.
 *
 * @return AJAX handler.
 */
$YB.comm.AjaxRequest.prototype.createXHR = function() {
    try {
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        } else {
            return new ActiveXObject("Microsoft.XMLHTTP");
        }
    } catch (err) {
        $YB.error(err);
        return {};
    }
};

/**
 * Returns XMLHttpRequest object.
 *
 * @return XMLHttpRequest object.
 */
$YB.comm.AjaxRequest.prototype.getXHR = function() {
    return this.xhr;
};

/**
 * Will transform an object of params into a url string.
 *
 * @private
 * @param params An object with the params of the call.
 * @return Return the param chunk. ie: system=nicetv&user=user.
 */
$YB.comm.AjaxRequest.prototype._parseParams = function(params) {
    try {
        if (typeof params === 'string') {
            return params;
        } else if (params !== null && typeof params == 'object') {
            var url = '';
            for (var key in params) {
                if (params[key] !== null && typeof params[key] == 'object') {
                    url += encodeURIComponent(key) + '=' + encodeURIComponent(JSON.stringify(params[key])) + '&';
                } else if (params[key] !== null && typeof params[key] != 'undefined' && params[key] !== '') {
                    url += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&';
                }
            }
            return url.slice(0, -1);
        } else {
            return '';
        }
    } catch (err) {
        $YB.error(err);
        return '';
    }
};
