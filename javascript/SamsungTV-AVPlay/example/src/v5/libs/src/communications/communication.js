/**
 * @license
 * Youbora Communication
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Youbora Communication implements the last abstraction layer against NQS requests.
 * Internally, Communication implements an array of $YB.comm.AjaxRequest objects, executing one after another.
 * All requests will be blocked until a first /data call is made, before context, any request sent will be queued.
 *
 * @class
 * @memberof $YB
 * @param {string} host The fastdata host address.
 * @param {boolean} httpSecure True for https, false for http, undefined for //.
 */
$YB.comm.Communication = function(host, httpSecure) {
    try {
        this.host = host;
        this.httpSecure = httpSecure;

        /** Time between pings defined by FastData. In seconds. */
        this.pingTime = 5;

        /** Prefix code character. L = Live, V = Vod, U = Unknown. */
        this.prefix = 'U';

        /** Communication code from the FastData request.*/
        this.code = '';

        /** Number of the view. Every /start call will add 1 to context number. Starts at -1 (first view will be 0). */
        this.view = -1;

        /** Array of strings, only when the array is empty the request Queues will begin sending. */
        this.preloaders = [];

        this._requests = {}; // Queue of requests, indexed by view code. Format: {U_code_0: [request1, request2], U_code_1: []}

        this.addPreloader('FastData');
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Callback defined here will be executed when the last preloader is removed for each request queued.
 * @method
 * @param {object} [params] Params object that will contain the params of the stored request.
 * @return {object} Params object modified
 */
$YB.comm.Communication.prototype.extraOperationsCallback = null;

/**
 * The code of the view.
 * @return {string} The code
 */
$YB.comm.Communication.prototype.getViewCode = function() {
    if (this.code) {
        return this.prefix + this.code + '_' + this.view;
    } else {
        return 'nocode';
    }
};

/**
 * Creates a new view code.
 * @param {bool} isLive Determines if the view code should start with V, L or U.
 * @return {string} The code of the new view.
 */
$YB.comm.Communication.prototype.nextView = function(isLive) {
    this.view++;

    if (isLive === true) {
        this.prefix = "L";
    } else if (isLive === false) {
        this.prefix = "V";
    } else {
        this.prefix = "U";
    }

    return this.getViewCode();
};

/**
 * Sends '/data' request. This has to be the first request and all other request will wait till we got a callback from this.
 *
 * @param {Object} params An object of parameters sent with the request.
 * @param {string} params.params.system System code.
 * @param {string} params.pluginVersion 3.x.x-<pluginName>
 * @param {boolean} [params.live] true if the content is life. False if VOD. Do not send if unknown.
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.comm.Communication.prototype.requestData = function(params, callback) {
    try {
        params = params || {};
        params.outputformat = 'jsonp';
        delete params.code;
        var context = this,
            ajax = new $YB.comm.AjaxRequest(this._parseServiceHost(this.host), '/data', params);

        ajax.load(function() {
            context.receiveData(ajax);
        });
        ajax.load(callback);

        ajax.send();

        $YB.noticeRequest("Request: NQS /data " + params.system);
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Callback function to parse '/data' response.
 */
$YB.comm.Communication.prototype.receiveData = function(ajax) {
    try {
        var response = ajax.getXHR().response,
            msg = JSON.parse(response.slice(response.indexOf('(') + 1, response.lastIndexOf(')'))),
            host = msg.q.h, // Host
            code = msg.q.c, // Code
            pt = msg.q.pt, // Ping time interval in seconds
            //tc: msg.q.tc, // Transaction code
            //t: msg.q.t // Test
            balancer = msg.q.b; // 1 = Balancer enabled

        if (host.length > 0 &&
            code.length > 0 &&
            pt.length > 0 &&
            balancer.length > 0
        ) {
            this.prefix = code.slice(0, 1);
            this.code = code.slice(1);
            //this.code = code;
            this.host = host;
            this.pingTime = pt;
            this.balancerEnabled = balancer;

            $YB.noticeRequest('FastData \'' + code + '\' is ready.');

            // Move requests from 'nocode' to the proper queue
            if (this._requests.nocode && this._requests.nocode.length > 0) {
                this._requests[this.getViewCode()] = this._requests.nocode;
                delete this._requests.nocode;
            }

            // Everything is ok, start sending requests
            this.removePreloader('FastData');
        } else {
            $YB.error('Error: FastData response is wrong.');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends a generic request. All the specific functions use this method.
 * Will automatically report an error if the request gives Error.
 *
 * @param {string} service A string with the service to be called. ie: 'nqs.nice264.com/data', '/joinTime'...
 * @param {(Object|string)} [params] Either a object or an uri-formated string with the args of the call.
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.comm.Communication.prototype.sendRequest = function(service, params, callback) {
    try {
        params = params || {};
        delete params.code;
        var ajax = new $YB.comm.AjaxRequest('', service, params);
        ajax.load(callback);
        this._registerRequest(ajax);
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends a service request.
 *
 * @param {string} service A string with the service to be called. ie: 'pc.youbora.com/cping/'
 * @param {(Object|string)} [params] Either a object or an uri-formated string with the args of the call.
 * @param {function} [callback] The defined load callback to the ajaxRequest
 */
$YB.comm.Communication.prototype.sendService = function(service, params, callback) {
    try {
        var ajax = new $YB.comm.AjaxRequest(this._parseServiceHost(service), '', params);
        ajax.load(callback);
        this._registerRequest(ajax);
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Adds a preloader to the queue. While this queue is not empty, all requests will be stoped.
 * Remember to call removePreloader to unblock the main queue
 *
 * @param {string} key Unique identifier of the blocker. ie: 'CDNParser'.
 */
$YB.comm.Communication.prototype.addPreloader = function(key) {
    try {
        this.preloaders.push(key);
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Removes a preloader. If it was the last preloader, all requests queued will be sent.
 *
 * @param {string} key Unique identifier of the blocker. ie: 'CDNParser'.
 */
$YB.comm.Communication.prototype.removePreloader = function(key) {
    try {
        var pos = this.preloaders.indexOf(key);
        if (pos !== -1) {
            this.preloaders.splice(pos, 1);

            if (this.preloaders.length === 0) { // if there is no more preloaders blocking the queue...
                var ajax;
                for (var k in this._requests) {
                    while (ajax = this._requests[k].shift()) {
                        ajax.setParam('code', k); //if no code, use last

                        if (!ajax.host) {
                            ajax.host = this._parseServiceHost(this.host);
                        }

                        // execute extra operations
                        if (typeof this.extraOperationsCallback == "function") {
                            this.extraOperationsCallback(ajax.params);
                        }

                        ajax.send();
                    }
                }
            }
        } else {
            $YB.warn('Warning: trying to remove unexisting preloader \'' + key + '\'.');
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Adds an AjaxRequest to the queue of requests.
 *
 * @private
 * @param request The AjaxRequest to be queued.
 * @returns Returns a pointer to the AjaxRequest.
 */
$YB.comm.Communication.prototype._registerRequest = function(request) {
    try {

        if (typeof this._requests[this.getViewCode()] == 'undefined') {
            this._requests[this.getViewCode()] = [];
        }

        request.setParam('timemark', new Date().getTime());

        this._requests[this.getViewCode()].push(request);
        this._sendRequests();

        return request;
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Execute pending requests in the queue.
 * @private
 */
$YB.comm.Communication.prototype._sendRequests = function() {
    try {
        if (this.preloaders.length === 0) { // if data has been retreived and there is no preloader blocking the queue...
            var ajax;
            for (var k in this._requests) {
                while (ajax = this._requests[k].shift()) {
                    ajax.setParam('code', k); // add code
                    if (!ajax.host) {
                        ajax.host = this._parseServiceHost(this.host);
                    }

                    ajax.send();
                }
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Determine the service host protocol. ie: [http[s]:]//nqs.nice264.com
 *
 * @private
 * @param url URL of the service.
 * @return Return the complete service URL.
 */
$YB.comm.Communication.prototype._parseServiceHost = function(url) {
    try {
        // Service
        if (url.indexOf('//') === 0) {
            url = url.slice(2);
        } else if (url.indexOf('http://') === 0) {
            url = url.slice(7);
        } else if (url.indexOf('https://') === 0) {
            url = url.slice(8);
        }

        if (this.httpSecure === true) {
            url = 'https://' + url;
        } else if (window.location.protocol.indexOf('http') === 0) {
            url = '//' + url;
        } else {
            url = 'http://' + url;
        }

        return url;

    } catch (err) {
        $YB.error(err);
        return 'http://localhost';
    }
};
