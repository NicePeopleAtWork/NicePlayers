/**
 * @license
 * YouboraLib
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * This namespace is the global YouboraJS Object. All classes and objects pend from this namespace.
 * @namespace
 */
var $YB = $YB || {

    /**
     * Version of the library.
     * @memberof $YB
     */
    version: '5.3',

    /**
     * Namespace for Plugins
     * @namespace
     * @memberof $YB
     */
    plugins: { map: [] },

    /**
     * Namespace for Adnalyzers
     * @namespace
     * @memberof $YB
     */
    adnalyzers: {},

    /**
     * Namespace for all sort of lib functions
     * @namespace
     * @memberof $YB
     */
    utils: {},

    /**
     * Namespace for all manager classes
     * @namespace
     * @memberof $YB
     * @since  5.3
     */
    managers: {},

    /**
     * Namespace for all communication classes
     * @namespace
     * @private
     * @memberof $YB
     * @since 5.1.03
     */
    comm: {},

    /**
     * Namespace for all data classes
     * @namespace
     * @memberof $YB
     * @since  5.1.03
     */
    data: {},
};

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
 * @private
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

/**
 * @license
 * Youbora AjaxRequest
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * AjaxRequest will generate the call URL. See createServiceUrl.
 *
 * @class
 * @private
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

/**
 * @license
 * Youbora Data
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Define the global values for youbora.
 * @class
 * @memberof $YB.data
 * @param {(Object|$YB.data.Options)} [options] A literal or another Data containing values.
 */
$YB.data.Options = function(options) { // constructor
    try {
        this.setOptions(options);
    } catch (err) {
        $YB.error(err);
    }
};

$YB.data.Options.prototype = {
    // Options
    /**
     * If false, the plugin won't send NQS requests.
     * @type {boolean}
     * @default true
     */
    enableAnalytics: true,
    /**
     * Services inside this array will not be sent. ie: ['/seek', '/adStart'...].
     * @type {array}
     * @default []
     */
    disabledRequests: [],
    /**
     * If true, the plugin will parse HLS files to use the first .ts file found as resource. It might slow performance down.
     * @type {boolean}
     * @default false
     */
    parseHLS: false,
    /**
     * If true, the plugin will query the CDN to retrieve the node name. It might slow performance down.
     * @type {boolean}
     * @default false
     */
    parseCDNNodeHost: false,
    /**
     * When true, views will stop reporting events after an error.
     * @type {boolean}
     * @default true
     */
    haltOnError: true,
    /**
     * If true, youbora will use an anti-resource collision system.
     * @type {boolean}
     * @default true
     */
    hashTitle: true,
    /**
     * Define the security of NQS calls. If true, it will use 'https://'; If false, it will use 'http://'; if undefined, it will use '//'.
     * @type {boolean}
     * @default undefined
     */
    httpSecure: undefined,
    /**
     * If true, the plugin will try to inform about bufferUnderrun based on the playhead of the video (only if player does not natively inform about buffers).
     * @type {boolean}
     * @default true
     */
    enableNiceBuffer: true,
    /**
     * If true, the plugin will try to inform about seeks based on the playhead of the video (only if player does not natively inform about seeks).
     * @type {boolean}
     * @default true
     */
    enableNiceSeek: true,

    // Main properties
    /**
     * NicePeopleAtWork account code that indicates the customer account.
     * @type {string}
     * @default nicetest
     */
    accountCode: "nicetest",
    /**
     * Host of the NQS FastData service.
     * @type {string}
     * @default nqs.nice264.com
     */
    service: "nqs.nice264.com",
    /**
     * User ID value inside your system.
     * @type {string}
     * @default undefined
     */
    username: undefined,
    /**
     * Custom unique code to identify the view.
     * @type {string}
     * @default undefined
     */
    transactionCode: undefined,

    /**
     * Item containing network info.
     * @type {object}
     * @prop {string} [network.ip] IP of the viewer/user. ie: '100.100.100.100'.
     * @prop {string} [network.isp] Name of the internet service provider of the viewer/user.
     */
    network: {
        ip: undefined,
        isp: undefined
    },

    /**
     * Item containing device information.
     * @type {object}
     * @prop {string} [device.id] Youbora ID of the device. If specified, it will rewrite info gotten from user agent.
     */
    device: {
        id: undefined
    },

    // Media Info
    /**
     * Item containing media info. All the info specified here will override the info gotten from the player.
     * @type {object}
     * @prop {boolean} [media.isLive] True if the content is live, false if VOD.
     * @prop {string} [media.resource] URL/path of the current media resource.
     * @prop {string} [media.title] Title of the media.
     * @prop {number} [media.duration] Duration of the media.
     * @prop {string} [media.cdn] Codename of the CDN where the content is streaming from. ie: AKAMAI
     * @prop {string} [media.isBalanced] Set to 1 if the content was previously balanced.
     * @prop {string} [media.isResumed] Set to 1 if the content was resumed.
     */
    media: {
        isLive: undefined,
        resource: undefined,
        title: undefined,
        duration: undefined,
        cdn: undefined,
        isBalanced: 0,
        isResumed: 0
    },

    // Ad Info
    /**
     * Item containing ads info. All the info specified here will override the info gotten from the Ads player.
     * @type {object}
     * @prop {boolean} [ads.expected] Change it to true when ads are expected in the current video stream. It will be sent in /start call.
     * @prop {string} [ads.resource] URL/path of the current ads resource or the ads server petition.
     * @prop {string} [ads.title] Title of the ad.
     * @prop {string} [ads.position] Either 'pre', 'mid' or 'post'.
     * @prop {string} [ads.campaign] Name of the ad campaign.
     * @prop {number} [ads.duration] Duration of the ad.
     */
    ads: {
        expected: false,
        resource: undefined,
        campaign: undefined,
        title: undefined,
        position: undefined,
        duration: undefined,
    },

    // properties
    /**
     * Item containing mixed extra information about the view, like the director, the parental rating, device info or the audio channels.
     * This object can contain any variable or can implement any structure.
     * @type {object}
     */
    properties: {
        contentId: undefined,
        type: undefined,
        transaction_type: undefined,
        genre: undefined,
        language: undefined,
        year: undefined,
        cast: undefined,
        director: undefined,
        owner: undefined,
        parental: undefined,
        price: undefined,
        rating: undefined,
        audioType: undefined,
        audioChannels: undefined,
        device: undefined,
        quality: undefined
    },

    //extraparams
    /**
     * An object of extra parameters set by the customer.
     * @type {object}
     * @prop {string} [param1] Custom parameter 1.
     * @prop {string} [param2] Custom parameter 2.
     * @prop {string} [param3] Custom parameter 3.
     * @prop {string} [param4] Custom parameter 4.
     * @prop {string} [param5] Custom parameter 5.
     * @prop {string} [param6] Custom parameter 6.
     * @prop {string} [param7] Custom parameter 7.
     * @prop {string} [param8] Custom parameter 8.
     * @prop {string} [param9] Custom parameter 9.
     * @prop {string} [param10] Custom parameter 10.
     */
    extraParams: {
        param1: undefined,
        param2: undefined,
        param3: undefined,
        param4: undefined,
        param5: undefined,
        param6: undefined,
        param7: undefined,
        param8: undefined,
        param9: undefined,
        param10: undefined
    },

    /**
     * Recursively sets the properties present in the params object. ie: this.username = params.username.
     * @param {Object} options A literal or another Data containing values.
     * @param {Object} [base=this] Start point for recursion.
     */
    setOptions: function(options, base) {
        try {
            base = base || this;
            if (typeof options != "undefined") {
                for (var key in options) {
                    if (typeof base[key] == "object" && base[key] !== null) {
                        this.setOptions(options[key], base[key]);
                    } else {
                        base[key] = options[key];
                    }
                }
            }
        } catch (err) {
            $YB.error(err);
        }
    }
};

/**
 * @license
 * Youbora API
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * This class is the generic adnalyzers from which specifics adnalyzers will extend.
 * Internally, it coordinates AdsApi and its flags.
 *
 * @class Generic
 * @since  5.1.02
 * @memberof $YB.adnalyzers
 */
$YB.adnalyzers.Generic = function() {};

$YB.adnalyzers.Generic.prototype = {
    /** Version of the plugin. ie: 1.0.0-name */
    adnalyzerVersion: '1.0.0-GENERIC',

    /** Reference to the ads player. */
    ads: undefined,
    /** Reference to the main plugin */
    plugin: undefined
};

/**
 * Instantiates the adnalyzer libraries and starts monitoring an ads object.
 *
 * @param {(object)} plugin The main youbora plugin from where it is instantiated.
 * @param {(object)} [ads] The object sending ads. ie: this.plugin.player.ima
 */
$YB.adnalyzers.Generic.prototype.startMonitoring = function(plugin, ads) {
    try {
        $YB.notice("Adnalyzer " + this.adnalyzerVersion + " is ready.");

        // Save the main plugin.
        this.plugin = plugin;

        // Save the ads plugin
        this.ads = ads;
    } catch (err) {
        $YB.error(err);
        return null;
    }
}

/**
 * Removes ad player object from reference.
 * This will not ensure that previously registered listeners are removed.
 */
$YB.adnalyzers.Generic.prototype.stopMonitoring = function() {
    this.ads = null;
    this.viewManager.timer.adPlayheadMonitor.stop();
}


/**
 * Starts Nicebuffer in ads API.
 */
$YB.adnalyzers.Generic.prototype.enableAdBufferMonitor = function() {
    if (this.plugin.infoManager.options.enableNiceBuffer) {
        this.viewManager.enableAdBufferMonitor = true;
    }
};

/**
 * Starts Niceseek in ads API.
 */
$YB.adnalyzers.Generic.prototype.enableAdSeekMonitor = function() {
    if (this.plugin.infoManager.options.enableNiceSeek) {
        this.viewManager.enableAdSeekMonitor = true;
    }
};

/**
 * This function must be called when a new ad starts loading.
 * @see $YB.api.Ads#sendAdStart
 */
$YB.adnalyzers.Generic.prototype.playAdHandler = function() {
    try {
        if (!this.isAdStartSent) {
            this.plugin.viewManager.sendAdStart();
        }
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * This function must be called when a new ad starts. It will /adStart + /adJoinTime. If there was a bufferUnderrun running before this call, its time will be used as joinTime.
 * @see $YB.api.Ads#sendAdStart
 * @see $YB.api.Ads#sendAdJoin
 */
$YB.adnalyzers.Generic.prototype.startJoinAdHandler = function() {
    try {
        if (!this.isAdStartSent) {
            this.plugin.viewManager.sendAdStart();

            // Use buffer clock to calculate joinTime in midrolls
            if (this.plugin.viewManager.isBuffering) {
                this.plugin.viewManager.chrono.joinTime.startTime = this.plugin.viewManager.chrono.buffer.startTime;
                this.plugin.viewManager.isBuffering = false;
            }

            this.plugin.viewManager.sendAdJoin();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video starts playing for the first time. If playingAdHandler is used, this function is not needed.
 * @see $YB.plugin.viewManager#sendAdJoin
 */
$YB.adnalyzers.Generic.prototype.joinAdHandler = function() {
    try {
        this.plugin.viewManager.sendAdJoin();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video is paused.
 * @see $YB.api.Ads#sendAdPause
 */
$YB.adnalyzers.Generic.prototype.pauseAdHandler = function() {
    try {
        this.plugin.viewManager.sendAdPause();
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * This function must be called when a button of pause/resume is pressed.
 * @see $YB.api.Ads#sendAdPause
 * @see $YB.api.Ads#sendAdResume
 */
$YB.adnalyzers.Generic.prototype.pauseToggleAdHandler = function() {
    try {
        if (this.isAdPaused) {
            this.plugin.viewManager.sendAdResume();
        } else {
            this.plugin.viewManager.sendAdPause();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video is resumed from a pause. If playingAdHandler is used, this function is not needed.
 * @see $YB.api.Ads#sendAdResume
 */
$YB.adnalyzers.Generic.prototype.resumeAdHandler = function() {
    try {
        this.plugin.viewManager.sendAdResume();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video has ended.
 * @see $YB.plugin.viewManager#sendAdStop
 */
$YB.adnalyzers.Generic.prototype.endedAdHandler = function() {
    try {
        this.plugin.viewManager.sendAdStop();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video has been stoped.
 * @see $YB.plugin.viewManager#sendAdStop
 */
$YB.adnalyzers.Generic.prototype.skipAdHandler = function() {
    try {
        this.plugin.viewManager.sendAdStop({ skipped: true });
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video starts a buffer underrun.
 * @see $YB.plugin.viewManager#sendAdBufferStart
 */
$YB.adnalyzers.Generic.prototype.bufferingAdHandler = function() {
    try {
        this.plugin.viewManager.sendAdBufferStart();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video ends buffering. If playingAdHandler is used, this function is not needed.
 * @see $YB.plugin.viewManager#sendAdBufferEnd
 */
$YB.adnalyzers.Generic.prototype.bufferedAdHandler = function() {
    try {
        if (this.isAdStartSent) {
            if (!this.isAdJoinSent) {
                this.plugin.viewManager.sendAdJoin();
            } else if (this.isAdBuffering) {
                this.plugin.viewManager.sendAdBufferEnd();
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};



/**
 * Override this function to return ad resource.
 * @return {string} ""
 */
$YB.adnalyzers.Generic.prototype.getAdResource = function() {
    return "unknown";
};


/**
 * Override this function to return ad playhead of the media. If null is returned, this class will be ignored.
 * @return {number} null
 */
$YB.adnalyzers.Generic.prototype.getMediaPlayhead = function() {
    return null;
};

/**
 * Override this function to return ad playhead.
 * @return {number} 0
 */
$YB.adnalyzers.Generic.prototype.getAdPlayhead = function() {
    return 0;
};


/**
 * Override this function to return ad position pre/mid/post/unknown.
 * @return {string} "unknown"
 */
$YB.adnalyzers.Generic.prototype.getAdPosition = function() {
    return 'unknown';
};

/**
 * Override this function to return ad title.
 * @return {string} ""
 */
$YB.adnalyzers.Generic.prototype.getAdTitle = function() {
    return null;
};

/**
 * Override this function to return ad duration.
 * @return {number} ""
 */
$YB.adnalyzers.Generic.prototype.getAdDuration = function() {
    return 0;
};

/**
 * Override this function to return ad bitrate.
 * @return {number} -1
 */
$YB.adnalyzers.Generic.prototype.getAdBitrate = function() {
    return -1;
};

/**
 * Override this function to return ad player version.
 * @return {string} ""
 */
$YB.adnalyzers.Generic.prototype.getAdPlayerVersion = function() {
    return null;
};

/**
 * @license
 * Youbora API
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * This class is the generic plugin from which specifics plugins will extend.
 * Internally, it coordinates a number of inner components like AdsApi, VideoApi, Communications, Chrono, ResourceParser, Resumer, ConcurrencyChecker...
 *
 * @class Generic
 * @since  5.1
 * @memberof $YB.plugins
 */
$YB.plugins.Generic = function() {};

$YB.plugins.Generic.prototype = {
    /** Name and platform of the plugin.*/
    pluginName: 'GENERIC',
    /** Version of the plugin. ie: 5.1.0-name */
    pluginVersion: '5.1.0-GENERIC',

    /** Unique identifier of the player, usually asociated with the ID of the tag. */
    playerId: 'generic',
    /** Reference to the player tag */
    player: null,
    /** Reference to the video/object tag, could be the same as the player. */
    tag: null,

    /** An instance of {@link $YB.managers.Info}. */
    infoManager: undefined,
    /** An instance of {@link $YB.managers.View}. */
    viewManager: undefined,
    /** An instance inherited from  {@link $YB.adnalyzers.Generic}. */
    adnalyzer: null,
};


/**
 * Instantiates the plugin libraries and starts listening to the set player.
 *
 * @param {(string|object)} player Either the player object or the unique identifier of the player, usually asociated with the ID tag of the DOM.
 * @param {Object} [options] {@link $YB.data.Options |Youbora Data} initial values.
 */
$YB.plugins.Generic.prototype.startMonitoring = function(player, options) {
    try {
        $YB.notice("Plugin " + this.pluginVersion + " (with YouboraJS " + $YB.version + ") is ready.");

        // Safe reference to the
        if (typeof player == "string") {
            this.playerId = player;
            this.player = document.getElementById(player);
        } else {
            this.player = player;
            if (player && player.id) {
                this.playerId = player.id;
            }
        }

        // Save reference of the tag. If it is different, specific plugins have to overwrite it.
        this.tag = this.player;

        // Instantiate Objects
        if (typeof this.infoManager == 'undefined') {
            this.infoManager = new $YB.managers.Info(this, options);
        } else {
            this.infoManager.setOptions(options);
        }

        this.viewManager = new $YB.managers.View(this.infoManager);

    } catch (err) {
        $YB.error(err);
        return null;
    }
};

/**
 * Removes player object from reference and stops monitoring.
 * This will not ensure that previously registered listeners are removed.
 */
$YB.plugins.Generic.prototype.stopMonitoring = function() {
    this.player = null;
    this.tag = null;
    this.viewManager.stopTimers();
};


/**
 * Starts Nicebuffer in video APIs.
 */
$YB.plugins.Generic.prototype.enableBufferMonitor = function() {
    if (this.infoManager.options.enableNiceBuffer) {
        this.viewManager.enableBufferMonitor = true;
    }
};

/**
 * Starts Niceseek in video APIs.
 */
$YB.plugins.Generic.prototype.enableSeekMonitor = function() {
    if (this.infoManager.options.enableNiceSeek) {
        this.viewManager.enableSeekMonitor = true;
    }
};


/**
 * Changes the $YB.data.Options options.
 * @see $YB.data.Options#setOptions
 */
$YB.plugins.Generic.prototype.setOptions = function(options) {
    try {
        this.infoManager.options.setOptions(options);
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Returns {@link $YB.data.Options} options.
 * @returns $YB.data.Options
 * @see $YB.data.Options
 */
$YB.plugins.Generic.prototype.getOptions = function() {
    try {
        return this.infoManager.options || {};
    } catch (err) {
        $YB.error(err);
        return {};
    }
};


/**
 * This function must be called when a new video starts loading.
 * @see $YB.api.Video#sendStart
 */
$YB.plugins.Generic.prototype.playHandler = function() {
    try {
        this.viewManager.sendStart();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video starts playing for the first time. If playingHandler is used, this function is not needed.
 * @see $YB.api.Video#sendJoin
 */
$YB.plugins.Generic.prototype.joinHandler = function() {
    try {
        this.viewManager.sendJoin();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video starts playing (either for the first time or arfter a pause, seek or buffer).
 * @see $YB.api.Video#sendStart
 * @see $YB.api.Video#sendResume
 * @see $YB.api.Video#sendSeekEnd
 * @see $YB.api.Video#sendBufferEnd
 */
$YB.plugins.Generic.prototype.playingHandler = function() {
    try {
        if (this.viewManager.isStartSent) {
            if (!this.viewManager.isJoinSent) {
                this.viewManager.sendJoin();
            } else if (this.viewManager.isSeeking && this.viewManager.isPaused) {
                this.viewManager.sendSeekEnd();
                this.viewManager.sendResume();
            } else if (this.viewManager.isSeeking) {
                this.viewManager.sendSeekEnd();
            } else if (this.viewManager.isBuffering) {
                this.viewManager.sendBufferEnd();
            } else if (this.viewManager.isPaused) {
                this.viewManager.sendResume();
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video is paused.
 * @see $YB.api.Video#sendPause
 */
$YB.plugins.Generic.prototype.pauseHandler = function() {
    try {
        this.viewManager.sendPause();
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * This function must be called when a button of pause/resume is pressed.
 * @see $YB.api.Video#sendPause
 * @see $YB.api.Video#sendResume
 */
$YB.plugins.Generic.prototype.pauseToggleHandler = function() {
    try {
        if (this.viewManager.isPaused) {
            this.viewManager.sendResume();
        } else {
            this.viewManager.sendPause();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video is resumed from a pause. If playingHandler is used, this function is not needed.
 * @see $YB.api.Video#sendResume
 */
$YB.plugins.Generic.prototype.resumeHandler = function() {
    try {
        this.viewManager.sendResume();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video has ended.
 * @see $YB.api.Video#sendStop
 */
$YB.plugins.Generic.prototype.endedHandler = function() {
    try {
        this.viewManager.sendStop();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video throws an error.
 * In case you could not find a code, send only the message.
 * In case you can not get an error message you should create your own message.
 * @see $YB.api.Video#sendError
 * @param code Error code
 * @param msg Error message.
 */
$YB.plugins.Generic.prototype.errorHandler = function(code, msg) {
    try {
        if (typeof code == "undefined") {
            code = 0;
        }
        msg = msg || code || 'Unknown error';

        this.viewManager.sendError({
            errorCode: code,
            msg: msg
        });
        //this.viewManager.sendStop();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video starts a seek.
 * @see $YB.api.Video#sendSeekStart
 */
$YB.plugins.Generic.prototype.seekingHandler = function() {
    try {
        if (this.viewManager.isBuffering) {
            this.viewManager.convertBufferToSeek();
        } else {
            this.viewManager.sendSeekStart();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video ends Seeking. If playingHandler is used, this function is not needed.
 * @see $YB.api.Video#sendSeekEnd
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.seekedHandler = function() {
    try {
        this.viewManager.sendSeekEnd();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video starts a buffer underrun.
 * @see $YB.api.Video#sendBufferStart
 */
$YB.plugins.Generic.prototype.bufferingHandler = function() {
    try {
        if (!this.viewManager.isSeeking) {
            this.viewManager.sendBufferStart();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when the video ends buffering. If playingHandler is used, this function is not needed.
 * @see $YB.api.Video#sendBufferEnd
 */
$YB.plugins.Generic.prototype.bufferedHandler = function() {
    try {
        if (this.viewManager.isStartSent) {
            if (!this.viewManager.isJoinSent) {
                this.viewManager.sendJoin();
            } else if (this.viewManager.isSeeking) {
                this.viewManager.sendSeekEnd();
            } else if (this.viewManager.isBuffering) {
                this.viewManager.sendBufferEnd();
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when an ad starts. If you are using adnalyzer modules, this function won't work.
 * @see $YB.api.Video#sendIgnoreAdStart
 */
$YB.plugins.Generic.prototype.ignoringAdHandler = function() {
    try {
        this.viewManager.sendIgnoreAdStart();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * This function must be called when an ad ends. If you are using adnalyzer modules, this function won't work.
 * @see $YB.api.Video#sendIgnoreAdEnd
 * @memberof Generic
 */
$YB.plugins.Generic.prototype.ignoredAdHandler = function() {
    try {
        this.viewManager.sendIgnoreAdEnd();
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * Override this function to return resource.
 * @return {string} "unknown".
 */
$YB.plugins.Generic.prototype.getResource = function() {
    return "unknown";
};

/**
 * Override this function to return resource.
 * @return {string} 0.
 */
$YB.plugins.Generic.prototype.getPlayhead = function() {
    return 0;
};

/**
 * Override this function to return resource.
 * @return {number} 0.
 */
$YB.plugins.Generic.prototype.getMediaDuration = function() {
    return 0;
};

/**
 * Override this function to return resource.
 * @return {bool} false.
 */
$YB.plugins.Generic.prototype.getIsLive = function() {
    return false;
};

/**
 * Override this function to return resource.
 * @return {string} "".
 */
$YB.plugins.Generic.prototype.getRendition = function() {
    return null;
};

/**
 * Override this function to return bitrate.
 * @return {number} -1.
 */
$YB.plugins.Generic.prototype.getBitrate = function() {
    return -1;
};

/**
 * Override this function to return throughput.
 * @return {number} -1.
 */
$YB.plugins.Generic.prototype.getThroughput = function() {
    return -1;
};

/**
 * Override this function to return player version.
 * @return {string} "".
 */
$YB.plugins.Generic.prototype.getPlayerVersion = function() {
    return null;
};

/**
 * Override this function to return totalbytes.
 * @return {number} null.
 */
$YB.plugins.Generic.prototype.getTotalBytes = function() {
    return null;
};

/**
 * Override this function to return media title.
 * @return {string} "".
 */
$YB.plugins.Generic.prototype.getTitle = function() {
    return null;
};

/**
 * @license
 * Youbora InfoManager
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/** Info API is in charge to retrieve information from OPTIONS, plugins or adnalyzers using getXXX functions (ie: getResource).
 *
 * @since 5.3
 * @class
 * @memberof $YB.managers
 * @param {$YB.plugins.Generic} plugin The plugin from where it was called.
 * @param {object} options Literal object that will be uset to initialize {@link $YB.data.Options}.
 */
$YB.managers.Info = function(plugin, options) {
    /** @type {$YB.plugins.Generic} Instance of the plugin */
    this.plugin = plugin;

    /** @type {$YB.data.Options} Instance of options */
    this.options = new $YB.data.Options(options);

    /** Last bitrate calculated. */
    this.lastBitrate = 0;
    /** Last ad bitrate calculated. */
    this.lastAdBitrate = 0;
};

$YB.managers.Info.prototype.getDataParams = function(params) {
    try {
        // Save current plugin to have it tracked. It is only for debugging purposes.
        $YB.plugins.map.push(this.plugin);

        // Set params
        params = params || {};

        params.system = params.hasOwnProperty('system') ? params.system : this.options.accountCode;
        params.pluginName = params.hasOwnProperty('pluginName') ? params.pluginName : this.plugin.pluginName;
        params.pluginVersion = params.hasOwnProperty('pluginVersion') ? params.pluginVersion : this.plugin.pluginVersion;
        params.live = params.hasOwnProperty('live') ? params.live : this.options.media.isLive;

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
}

/** Exposes {@link $YB.data.Options#setOptions}. */
$YB.managers.Info.prototype.setOptions = function(options) {
    this.options.setOptions(options);
};

/** Returns the instance of {$YB.data.Options}. */
$YB.managers.Info.prototype.getOptions = function(options) {
    return this.options;
};

/**
 * Tries to get the playhead of the ad from adnalyzer.getAdPlayhead().
 * @return {number} Playhead in seconds or 0
 */
$YB.managers.Info.prototype.getAdPlayhead = function() {
    try {
        return $YB.utils.parseNumber(this.plugin.adnalyzer.getAdPlayhead(), 0);
    } catch (err) {
        $YB.warn(err);
        return 0;
    }
};

/**
 * Tries to get the bitrate of the ad with adnalyzer.getAdBitrate().
 * @return {number} Bitrate or -1.
 */
$YB.managers.Info.prototype.getAdBitrate = function() {
    try {
        var res = Math.round(this.plugin.adnalyzer.getAdBitrate());

        // Chrome workarround
        if (res == -1 && this.plugin.adnalyzer.tag && typeof this.plugin.adnalyzer.tag.webkitVideoDecodedByteCount != "undefined") {
            var bitrate = this.plugin.adnalyzer.tag.webkitVideoDecodedByteCount;
            if (this.lastAdBitrate) {
                bitrate = Math.round(((this.plugin.adnalyzer.tag.webkitVideoDecodedByteCount - this.lastAdBitrate) / 5) * 8);
            }
            this.lastAdBitrate = this.plugin.adnalyzer.tag.webkitVideoDecodedByteCount;
            res = bitrate;
        }

        return $YB.utils.parseNumber(res, -1);
    } catch (err) {
        $YB.warn(err);
        return -1;
    }
};

/**
 * Tries to get the resource of the ad.
 * The order is {@link $YB.data.Options} > adnalyzer.getAdResource() > "".
 * @return {string} Resource or empty string.
 */
$YB.managers.Info.prototype.getAdResource = function() {
    try {
        if (typeof this.options.ads.resource != 'undefined') {
            return this.options.ads.resource;
        } else {
            return this.plugin.adnalyzer.getAdResource();
        }
    } catch (err) {
        $YB.warn(err);
        return "";
    }
};

/**
 * Tries to get the position of the roll (pre, mid, post) of the ad from adnalyzer.getAdPosition().
 * The order is {@link $YB.data.Options} > adnalyzer.getPosition() > "unknown".
 * @return {string} Position (pre, mid, post) or 'unknown';
 */
$YB.managers.Info.prototype.getAdPosition = function() {
    try {
        if (typeof this.options.ads.position != 'undefined') {
            return this.options.ads.position;
        } else {
            return this.plugin.adnalyzer.getAdPosition();
        }
    } catch (err) {
        $YB.warn(err);
        return 'unknown';
    }
};

/**
 * Tries to get the title of the ad, from {@link $YB.data.Options} > adnalyzer.getAdTitle();
 * The order is {@link $YB.data.Options} > adnalyzer.getTitle() > "".
 * @return {string} Title of the ad or "";
 */
$YB.managers.Info.prototype.getAdTitle = function() {
    try {
        if (typeof this.options.ads.title != 'undefined') {
            return this.options.ads.title;
        } else {
            return this.plugin.adnalyzer.getAdTitle();
        }
    } catch (err) {
        $YB.warn(err);
        return '';
    }
};

/**
 * Tries to get the mediaduration of the ad from {@link $YB.data.Options} > adnalyzer.getAdDuration().
 * @return {number} Duration in seconds (rounded) or 0;
 */
$YB.managers.Info.prototype.getAdDuration = function() {
    try {
        res = 0;
        if (typeof this.options.ads.duration != "undefined") {
            res = this.options.ads.duration;
        } else {
            res = Math.round(this.plugin.adnalyzer.getAdDuration());
        }

        return $YB.utils.parseNumber(res, 0);
    } catch (err) {
        $YB.warn(err);
        return 0;
    }
};

/**
 * Tries to get the ads player version from adnalyzer.getAdPlayerVersion().
 * @return {string} AdPlayerVersion or "".
 */
$YB.managers.Info.prototype.getAdPlayerVersion = function() {
    try {
        return this.plugin.adnalyzer.getAdPlayerVersion();
    } catch (err) {
        $YB.warn(err);
        return null;
    }
};

/**
 * Creates and returns the parameters required for the  '/adStart' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getAdStartParams = function(params, callback) {
    try {
        // Params
        params = params || {};

        params.resource = typeof params.resource != 'undefined' ? params.resource : this.getAdResource();
        params.campaign = typeof params.campaign != 'undefined' ? params.campaign : this.options.ads.campaign;
        params.title = typeof params.title != 'undefined' ? params.title : this.getAdTitle();
        params.adDuration = typeof params.adDuration != 'undefined' ? params.adDuration : this.getAdDuration();
        params.playhead = typeof params.playhead != 'undefined' ? params.playhead : this.getPlayhead();
        params.adnalyzerVersion = typeof params.adnalyzerVersion != 'undefined' ? params.adnalyzerVersion : this.adnalyzer.adnalyzerVersion;
        params.adPlayerVersion = typeof params.adPlayerVersion != 'undefined' ? params.adPlayerVersion : this.getAdPlayerVersion();

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};

/**
 * Creates and returns the parameters required for the  '/adJoinTime' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getAdJoinParams = function(params, callback) {
    try {
        // Params
        params = params || {};

        params.adPlayhead = typeof params.adPlayhead != 'undefined' ? params.adPlayhead : this.getAdPlayhead();

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};

/**
 * Creates and returns the parameters required for the  '/adStop' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getAdStopParams = function(params, callback) {
    try {
        params = params || {};

        params.adPlayhead = typeof params.adPlayhead != 'undefined' ? params.adPlayhead : this.getAdPlayhead();
        params.adBitrate = typeof params.adBitrate != 'undefined' ? params.adBitrate : this.getAdBitrate();

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};

/**
 * Creates and returns the parameters required for the  '/adPause' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getAdPauseParams = function(params, callback) {
    return params || {};
};


/**
 * Creates and returns the parameters required for the  '/adResume' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getAdResumeParams = function(params, callback) {
    return params || {};
};

/**
 * Creates and returns the parameters required for the  '/adBufferUnderrun' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getAdBufferEndParams = function(params, callback) {
    try {
        params = params || {};

        params.adPlayhead = typeof params.adPlayhead != 'undefined' ? params.adPlayhead : this.getAdPlayhead();

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};

/**
 * Creates and returns the parameters required for the  (ad related) '/ping' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getAdPingParams = function(params, callback) {
    try {
        params = params || {};

        // Params
        params.adBitrate = typeof params.bitrate != 'undefined' ? params.bitrate : this.getAdBitrate();
        params.adPlayhead = typeof params.throughput != 'undefined' ? params.throughput : this.getAdPlayhead();

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};

/**
 * Tries to get the resource of the video.
 * The order is {@link $YB.resourceParser#realResource} > {@link $YB.data.Options} > plugin.getResource() > "unknown".
 * @return {string} Resource or "unknown".
 */
$YB.managers.Info.prototype.getResource = function() {
    try {
        if (this.plugin.resourceParser && this.plugin.resourceParser.realResource) {
            return this.plugin.resourceParser.realResource;
        } else if (typeof this.options.media.resource != "undefined") {
            return this.options.media.resource;
        } else {
            return this.plugin.getResource();
        }
    } catch (err) {
        $YB.warn(err);
        return "unknown";
    }
};



/**
 * Tries to get the mediaduration of the video from {@link $YB.data.Options} > plugin.getMediaDuration().
 * @return {number} Duration in seconds (rounded) or 0;
 */
$YB.managers.Info.prototype.getMediaDuration = function() {
    try {
        var res = 0;
        if (typeof this.options.media.duration != "undefined") {
            res = this.options.media.duration;
        } else {
            res = this.plugin.getMediaDuration();
        }

        return Math.round($YB.utils.parseNumber(res, 0));
    } catch (err) {
        $YB.warn(err);
        return 0;
    }
};

/**
 * Tries to get if the video is Live.
 * The order is {@link $YB.data.Options} > plugin.getIsLive() > false.
 * @return {boolean} True if live, false if vod.
 */
$YB.managers.Info.prototype.getIsLive = function() {
    try {
        if (typeof this.options.media.isLive != "undefined") {
            return this.options.media.isLive;
        } else {
            return this.plugin.getIsLive();
        }
    } catch (err) {
        $YB.warn(err);
        return false;
    }
};

/**
 * Tries to get the player version from plugin.getPlayerVersion().
 * @return {string} PlayerVersion or "".
 */
$YB.managers.Info.prototype.getPlayerVersion = function() {
    try {
        return this.plugin.getPlayerVersion();
    } catch (err) {
        $YB.warn(err);
        return "";
    }
};

/**
 * Tries to get the title from {@link $YB.data.Options} > plugin.getTitle().
 * @return {string} Title or empty string.
 */
$YB.managers.Info.prototype.getTitle = function() {
    try {
        if (typeof this.options.media.title != "undefined") {
            return this.options.media.title;
        } else {
            return this.plugin.getTitle();
        }
    } catch (err) {
        $YB.warn(err);
        return "";
    }
};

/**
 * Tries to get the rendition of the video from plugin.getRendition().
 * @return {number|string} Rendition of the media.
 */
$YB.managers.Info.prototype.getRendition = function() {
    try {
        if (typeof this.options.media.rendition != "undefined") {
            return this.options.media.rendition;
        } else {
            return this.plugin.getRendition();
        }
    } catch (err) {
        $YB.warn(err);
        return '';
    }
};

/**
 * Tries to get the bitrate of the video with plugin.getBitrate().
 * @return {number} Bitrate or -1.
 */
$YB.managers.Info.prototype.getBitrate = function() {
    try {
        var res = Math.round(this.plugin.getBitrate());

        // Chrome workarround
        if (res == -1 && this.plugin.tag && typeof this.plugin.tag.webkitVideoDecodedByteCount != "undefined") {
            var bitrate = this.plugin.tag.webkitVideoDecodedByteCount;
            if (this.lastBitrate) {
                bitrate = Math.round(((this.plugin.tag.webkitVideoDecodedByteCount - this.lastBitrate) / 5) * 8);
            }
            this.lastBitrate = this.plugin.tag.webkitVideoDecodedByteCount;
            res = bitrate != 0 ? bitrate : -1;
        }

        return $YB.utils.parseNumber(res, -1);
    } catch (err) {
        $YB.warn(err);
        return -1;
    }
};

/**
 * Tries to get the throughput of the video with plugin.getThroughput().
 * @return {number} Throughput or -1.
 */
$YB.managers.Info.prototype.getThroughput = function() {
    try {
        return $YB.utils.parseNumber(Math.round(this.plugin.getThroughput()), -1);
    } catch (err) {
        $YB.warn(err);
        return -1;
    }
};

/**
 * Tries to get the total bytes loaded from the video from plugin.getTotalBytes().
 * @return {number} Total Bytes or null;
 */
$YB.managers.Info.prototype.getTotalBytes = function() {
    try {
        return $YB.utils.parseNumber(this.plugin.getTotalBytes(), null);
    } catch (err) {
        $YB.warn(err);
        return null;
    }
};

/**
 * Tries to get the playhead of the video.
 * The order is {@link $YB.data.Options} > adnalyzer.getMediaPlayhead() > plugin.getPlayhead() > 0.
 * @return {number} Playhead in seconds or 0
 */
$YB.managers.Info.prototype.getPlayhead = function() {
    try {
        var res = this.plugin.getPlayhead();

        if (this.plugin.adnalyzer && this.plugin.adnalyzer.getMediaPlayhead() !== null) {
            res = this.plugin.adnalyzer.getMediaPlayhead();
        }

        return $YB.utils.parseNumber(res, 0);
    } catch (err) {
        $YB.warn(err);
        return 0;
    }
};

/**
 * Creates and returns the parameters required for the  '/start' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getStartParams = function(params) {
    try {
        params = params || {};

        // Params
        params.system = params.hasOwnProperty('system') ? params.system : this.options.accountCode;
        params.player = params.hasOwnProperty('player') ? params.player : this.plugin.pluginName;
        params.user = params.hasOwnProperty('user') ? params.user : this.options.username;
        params.transcode = params.hasOwnProperty('transcode') ? params.transcode : this.options.transactionCode;
        params.hashTitle = params.hasOwnProperty('hashTitle') ? params.hashTitle : this.options.hashTitle;
        params.referer = params.hasOwnProperty('referer') ? params.referer : (typeof window != 'undefined' ? window.location.href : '');

        // Device
        params.deviceId = params.hasOwnProperty('deviceId') ? params.deviceid : this.options.device.id;

        // Plugin versioning
        params.pluginVersion = params.hasOwnProperty('pluginVersion') ? params.pluginVersion : this.plugin.pluginVersion;
        params.playerVersion = params.hasOwnProperty('playerVersion') ? params.playerVersion : this.getPlayerVersion();

        // Media
        params.resource = params.hasOwnProperty('resource') ? params.resource : this.getResource();
        params.duration = params.hasOwnProperty('duration') ? params.duration : this.getMediaDuration();
        params.live = params.hasOwnProperty('live') ? params.live : this.getIsLive();
        params.rendition = params.hasOwnProperty('rendition') ? params.rendition : this.getRendition();
        params.title = params.hasOwnProperty('title') ? params.title : this.getTitle();
        params.properties = params.hasOwnProperty('properties') ? params.properties : this.options.properties;
        params.cdn = params.hasOwnProperty('cdn') ? params.cdn : this.options.media.cdn;

        // Network
        params.isp = params.hasOwnProperty('isp') ? params.isp : this.options.network.isp;
        params.ip = params.hasOwnProperty('ip') ? params.ip : this.options.network.ip;

        // Extra Params
        params.param1 = params.hasOwnProperty('param1') ? params.param1 : this.options.extraParams.param1;
        params.param2 = params.hasOwnProperty('param2') ? params.param2 : this.options.extraParams.param2;
        params.param3 = params.hasOwnProperty('param3') ? params.param3 : this.options.extraParams.param3;
        params.param4 = params.hasOwnProperty('param4') ? params.param4 : this.options.extraParams.param4;
        params.param5 = params.hasOwnProperty('param5') ? params.param5 : this.options.extraParams.param5;
        params.param6 = params.hasOwnProperty('param6') ? params.param6 : this.options.extraParams.param6;
        params.param7 = params.hasOwnProperty('param7') ? params.param7 : this.options.extraParams.param7;
        params.param8 = params.hasOwnProperty('param8') ? params.param8 : this.options.extraParams.param8;
        params.param9 = params.hasOwnProperty('param9') ? params.param9 : this.options.extraParams.param9;
        params.param10 = params.hasOwnProperty('param10') ? params.param10 : this.options.extraParams.param10;

        // Ping-related
        params.totalBytes = params.hasOwnProperty('totalBytes') ? params.totalBytes : this.getTotalBytes();

        // Ads
        params.adsExpected = params.hasOwnProperty('adsExpected') ? params.adsExpected : this.options.ads.expected;

        //resume & balanced
        if (this.options.isResumed == 1) params.isResumed = 1;
        if (this.options.isBalanced == 1) params.isBalanced = 1;

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};

/**
 * Creates and returns the parameters required for the  '/joinTime' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getJoinParams = function(params) {
    try {
        params = params || {};

        params.eventTime = params.hasOwnProperty('eventTime') ? params.eventTime : this.getPlayhead();
        params.mediaDuration = params.hasOwnProperty('mediaDuration') ? params.mediaDuration : this.getMediaDuration();

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};

/**
 * Creates and returns the parameters required for the  '/stop' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getStopParams = function(params) {
    return params || {};
};


/**
 * Creates and returns the parameters required for the  '/pause' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getPauseParams = function(params) {
    return params || {};
};


/**
 * Creates and returns the parameters required for the  '/resume' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getResumeParams = function(params) {
    return params || {};
};

/**
 * Creates and returns the parameters required for the  '/bufferUnderrun' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getBufferEndParams = function(params) {
    try {
        params = params || {};

        params.time = params.hasOwnProperty('time') ? params.time : this.getPlayhead();

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};

/**
 * Creates and returns the parameters required for the  '/error' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getErrorParams = function(params) {
    try {
        params = params || {};

        // Message & Errorcode
        params.errorCode = params.hasOwnProperty('errorCode') ? params.errorCode : '9000';
        params.msg = params.hasOwnProperty('msg') ? params.msg : 'Unknown Error';

        // Complete with /start params
        params = this.getStartParams(params);

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};

/**
 * Creates and returns the parameters required for the  '/seek' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getSeekEndParams = function(params) {
    return this.getBufferEndParams(params);
};

/**
 * Creates and returns the parameters required for the  '/ping' info.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The manager will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS manager for more information.
 * @return the params required to make the http call.
 */
$YB.managers.Info.prototype.getPingParams = function(params, callback) {
    try {
        params = params || {};

        // Params
        params.time = typeof params.time != 'undefined' ? params.time : this.getPlayhead();
        params.bitrate = typeof params.bitrate != 'undefined' ? params.bitrate : this.getBitrate();
        params.throughput = typeof params.throughput != 'undefined' ? params.throughput : this.getThroughput();
        params.totalBytes = typeof params.totalBytes != 'undefined' ? params.totalBytes : this.getTotalBytes();

        return params;
    } catch (err) {
        $YB.error(err);
        return params;
    }
};

/**
 * @license
 * Youbora ViewManager
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * ViewManager will help each plugin to control the content/event workflow and manage XHRequests send.
 *
 * @since 5.3
 * @class
 * @memberof $YB.managers
 * @param {$YB.managers.Info} infoManager Associated infoManager instance.
 */
$YB.managers.View = function(infoManager) { // constructor
    this.infoManager = infoManager;

    /** Flag when Start has been sent. */
    this.isStartSent = false;
    /** Flag when Join has been sent. */
    this.isJoinSent = false;
    /** Flag when Player is paused. */
    this.isPaused = false;
    /** Flag when Player is seeking. */
    this.isSeeking = false;
    /** Flag when Player is buffering. */
    this.isBuffering = false;
    /** Flag when view arised at least one error. */
    this.isErrorSent = false;
    /** Flag when there are ads showing. */
    this.isShowingAds = false;
    /** Flag when Ads Start has been sent */
    this.isAdStartSent = false;
    /** Flag when Join has been sent */
    this.isAdJoinSent = false;
    /** Flag when Ad is paused. */
    this.isAdPaused = false;
    /** Flag when Ad is buffering */
    this.isAdBuffering = false;

    /** An object with multiples instances of {@link $YB.utils.Chrono}.
     * @prop {$YB.utils.Chrono} joinTime Chrono between start and joinTime.
     * @prop {$YB.utils.Chrono} seek Chrono for seeks.
     * @prop {$YB.utils.Chrono} pause Chrono for pauses.
     * @prop {$YB.utils.Chrono} buffer Chrono for buffers
     * @prop {$YB.utils.Chrono} adIgnore Chrono for ignoreAds.
     * @prop {$YB.utils.Chrono} adTotal Chrono for the totality of the Ad.
     * @prop {$YB.utils.Chrono} adJoinTime Chrono between adStart and adJoinTime.
     * @prop {$YB.utils.Chrono} adPause Chrono for ad pauses.
     * @prop {$YB.utils.Chrono} adBuffer Chrono for ad buffers
     */
    this.chrono = {
        joinTime: new $YB.utils.Chrono(),
        seek: new $YB.utils.Chrono(),
        pause: new $YB.utils.Chrono(),
        buffer: new $YB.utils.Chrono(),
        adIgnore: new $YB.utils.Chrono(),
        adTotal: new $YB.utils.Chrono(),
        adJoinTime: new $YB.utils.Chrono(),
        adPause: new $YB.utils.Chrono(),
        adBuffer: new $YB.utils.Chrono()
    };

    /** Counters of rolls shown.
     * @prop {number} pre Prerolls shown.
     * @prop {number} mid midrolls shown.
     * @prop {number} post Postrolls shown.
     */
    this.adCounter = {
        pre: 0,
        mid: 0,
        post: 0,
        unknown: 0
    };

    // Set inner timers
    var context = this;
    this.timer = {
        pinger: new $YB.utils.Timer(function(diffTime) { context.sendPing({ diffTime: diffTime }); }),
        playheadMonitor: new $YB.utils.Timer(function(diffTime) { context.checkPlayhead(); }, $YB.managers.View.monitoringInterval),
        adPlayheadMonitor: new $YB.utils.Timer(function(diffTime) { context.checkAdPlayhead(); }, $YB.managers.View.monitoringInterval)
    };

    // Monitor flags
    this.enableBufferMonitor = false;
    this.enableSeekMonitor = false;
    this.enableAdBufferMonitor = false;
    this.enableAdSeekMonitor = false;

    /** Last duration sent. */
    this.lastDuration = 0;
    /** Last playhead sent. */
    this.lastPlayhead = 0;
    /** Last ad position sent */
    this.lastAdPosition = "";
    /** Last rendition sent. */
    this.lastRendition = '';
    /** Time of the last resume. */
    this.lastResume = 0;

    /** An array of key-value pairs of entities changed to be sent in pings. */
    this.changedEntities = [];

    /** An instance of {@link $YB.utils.ResourceParser}. */
    this.resourceParser = new $YB.utils.ResourceParser(this);

    /** An instance of {@link $YB.comm.Communication}. */
    this.comm = new $YB.comm.Communication(this.infoManager.options.service, this.infoManager.options.httpSecure);

    // Request Data
    this.comm.requestData(this.infoManager.getDataParams());
};

$YB.managers.View.prototype.sendRequest = function(service, params, callback) {
    try {
        if (this.isAllowed(service)) {
            this.comm.sendRequest(service, params, callback);
        }
    } catch (err) {
        $YB.error(err);
    }
}

/**
 * Returns if this kind of analytic is allowed (enableAnalytics must be true and the service shall not be in disabledRequests).
 * @param {string} srv Name of the service. ie: '/seek'.
 * @return {bool} True if the analytic is allowed, false otherwise.
 */
$YB.managers.View.prototype.isAllowed = function(service) {
    return this.infoManager.options.enableAnalytics && !(service in this.infoManager.options.disabledRequests);
};

/**
 * Returns true if the execution is stoped by an error.
 * @return {Boolean}
 */
$YB.managers.View.prototype.isHalted = function() {
    return this.infoManager.options.haltOnError && this.isErrorSent;
};

/**
 * Sends '/adStart' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.managers.View.prototype.sendAdStart = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (!this.isAdStartSent) {

                // Chronos & Flags
                this.isShowingAds = true;
                this.isAdStartSent = true;
                this.chrono.adTotal.start();
                this.chrono.adJoinTime.start();

                // Close buffer and seek
                this.sendSeekEnd();
                this.sendBufferEnd();

                // Params
                params = this.infoManager.getAdStartParams(params);

                // Save last position and insert number
                this.lastAdPosition = params.position;
                params.number = typeof params.number != 'undefined' ? params.number : this.getAdNumber(params.position, true);

                // Send request
                this.sendRequest('/adStart', params, callback);
                $YB.noticeRequest("Request: NQS /adStart " + params.position + params.number);
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/adJoinTime' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.managers.View.prototype.sendAdJoin = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isAdStartSent && !this.isAdJoinSent) {

                // Chronos & Flags
                this.isAdJoinSent = true;

                // Start AdPlayheadMonitor
                if (this.enableAdBufferMonitor || this.enableAdSeekMonitor) {
                    this.timer.adPlayheadMonitor.start();
                    this.lastPlayhead = 0;
                }

                // Params
                params = this.infoManager.getAdJoinParams(params);
                params.duration = typeof params.duration != 'undefined' ? params.duration : this.chrono.adJoinTime.getDeltaTime();
                params.position = typeof params.position != 'undefined' ? params.position : this.lastAdPosition;
                params.number = typeof params.number != 'undefined' ? params.number : this.getAdNumber(params.position);

                // Send request
                this.sendRequest('/adJoinTime', params, callback);
                $YB.noticeRequest("Request: NQS /adJoinTime " + params.duration + "ms");
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/adStop' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.managers.View.prototype.sendAdStop = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isAdStartSent) {

                // Chronos & Flags
                this.isAdStartSent = false;
                this.isAdJoinSent = false;
                this.isAdBuffering = false;
                this.isShowingAds = false;

                // stop playhead monitor
                this.adPlayheadMonitor.stop();

                // Params
                params = this.infoManager.getAdStopParams(params);
                params.totalDuration = typeof params.totalDuration != 'undefined' ? params.totalDuration : this.chrono.adTotal.getDeltaTime();
                params.position = typeof params.position != 'undefined' ? params.position : this.lastAdPosition;
                params.number = typeof params.number != 'undefined' ? params.number : this.getAdNumber(params.position);

                if (!params.adPlayhead) {
                    delete params.adPlayhead;
                }

                // Remove adTime from joinTime
                if (!this.isJoinSent) {
                    this.chrono.joinTime.startTime += this.chrono.adTotal.getDeltaTime();
                    this.chrono.joinTime.startTime = Math.min(this.chrono.joinTime.startTime, new Date().getTime());
                }

                // Send request
                this.sendRequest('/adStop', params, callback);
                $YB.noticeRequest("Request: NQS /adStop " + params.totalDuration + "ms");
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/adPause' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.managers.View.prototype.sendAdPause = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isAdJoinSent && !this.isAdPaused) {

                // Chronos & Flags
                this.isAdPaused = true;
                this.chrono.adPause.start();

                // Params
                params = this.infoManager.getAdPauseParams(params);
                params.position = typeof params.position != 'undefined' ? params.position : this.lastAdPosition;
                params.number = typeof params.number != 'undefined' ? params.number : this.getAdNumber(params.position);

                // Send the request
                this.sendRequest('/adPause', params, callback);
                $YB.noticeRequest("Request: NQS /adPause");
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * Sends '/adResume' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.managers.View.prototype.sendAdResume = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isAdJoinSent && this.isAdPaused) {

                // Chronos & Flags
                this.isAdPaused = false;
                this.chrono.adPause.stop();

                // Params
                params = this.infoManager.getAdResumeParams(params);
                params.position = typeof params.position != 'undefined' ? params.position : this.lastAdPosition;
                params.number = typeof params.number != 'undefined' ? params.number : this.getAdNumber(params.position);

                // Send the request
                this.sendRequest('/adResume', params, callback);
                $YB.noticeRequest("Request: NQS /adResume");
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};


/** Notifies a buffer start. It will expect a {$YB.managers.View#sendAdBufferEnd}. */
$YB.managers.View.prototype.sendAdBufferStart = function() {
    try {
        if (!this.isHalted()) {
            if (this.isAdJoinSent && !this.isAdBuffering) {

                // Chronos & Flags
                this.isAdBuffering = true;
                this.chrono.adBuffer.start();

                // Log
                $YB.noticeRequest("Method: /adBufferStart");
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/adBufferUnderr
un' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.managers.View.prototype.sendAdBufferEnd = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isAdJoinSent && this.isAdBuffering) {

                // Chronos & Flags
                this.isAdBuffering = false;

                // Params
                params = this.infoManager.getAdBufferEndParams(params);
                params.duration = typeof params.duration != 'undefined' ? params.duration : this.chrono.adBuffer.getDeltaTime();
                params.position = typeof params.position != 'undefined' ? params.position : this.lastAdPosition;
                params.number = typeof params.number != 'undefined' ? params.number : this.getAdNumber(params.position);

                // Send request
                this.sendRequest('/adBufferUnderrun', params, callback);
                $YB.noticeRequest("Request: NQS /adBufferUnderrun " + params.duration + "ms");
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * Given a position, it returns the counter of ads of that type.
 * @param {string} pos either 'pre', 'mid', 'post' or 'unknown'.
 * @param {boolean} [increment=false] If true, counter will be incremented before beign sent.
 */
$YB.managers.View.prototype.getAdNumber = function(pos, increment) {
    switch (pos) {
        case 'pre':
            return (increment) ? ++this.adCounter.pre : this.adCounter.pre;
        case 'mid':
            return (increment) ? ++this.adCounter.mid : this.adCounter.mid;
        case 'post':
            return (increment) ? ++this.adCounter.post : this.adCounter.post;
        default:
            return (increment) ? ++this.adCounter.unknown : this.adCounter.unknown;
    }
};

/**
 * Restarts all the counters.
 */
$YB.managers.View.prototype.resetAdNumbers = function() {
    this.adCounter = {
        pre: 0,
        mid: 0,
        post: 0,
        unknown: 0
    };
};


/** Notifies a Generic Ad start. It will expect a {$YB.api.Video#sendGenericAdEnd}. */
$YB.managers.View.prototype.sendIgnoreAdStart = function() {
    try {
        if (!this.isHalted()) {

            if (this.isStartSent && !this.isShowingAds) {

                // Flags & Chronos
                this.isShowingAds = true;
                this.chrono.adIgnore.start();

                // Close buffer and seek
                this.sendBufferEnd();
                this.sendSeekEnd();

                // Log
                $YB.noticeRequest("Method: /genericAdStart");
            }

        }
    } catch (err) {
        $YB.error(err);
    }
};

/** Notifies a Generic Ad stop.*/
$YB.managers.View.prototype.sendIgnoreAdEnd = function() {
    try {
        if (!this.isHalted()) {
            if (this.isStartSent && this.isShowingAds) {

                // Flags & Chronos
                this.isShowingAds = false;
                this.chrono.adIgnore.stop();

                // Remove ad time from joinTime
                if (!this.isJoinSent) {
                    this.chrono.joinTime.startTime += this.chrono.adIgnore.getDeltaTime();
                    this.chrono.joinTime.startTime = Math.min(this.chrono.joinTime.startTime, new Date().getTime());
                }

                // Log
                $YB.noticeRequest("Method: /genericAdEnd " + this.chrono.adIgnore.getDeltaTime() + "ms");
            }

        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/start' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.managers.View.prototype.sendStart = function(params, callback) {
    try {
        if (!this.isHalted()) {

            if (!this.isStartSent) {

                //resource Parser start
                if (this.infoManager.options.parseCDNNodeHost || this.infoManager.options.parseHLS) {
                    this.resourceParser.init();
                }

                // Flags
                this.isStartSent = true;

                // Chronos
                this.chrono.joinTime.start();

                // Start pings
                $YB.noticeRequest("Sending pings every " + this.comm.pingTime + "s.");
                this.timer.pinger.interval = Math.max(1000, this.comm.pingTime * 1000);
                this.timer.pinger.start();

                // Params
                params = this.infoManager.getStartParams(params);
                params.pingTime = typeof params.pingTime != 'undefined' ? params.pingTime : this.comm.pingTime;
                if (this.infoManager.options.parseCDNNodeHost) {
                    params.nodeHost = typeof params.nodeHost != 'undefined' ? params.nodeHost : (typeof this.resourceParser.nodeHost != 'undefined' ? this.resourceParser.nodeHost : "");
                    params.nodeType = typeof params.nodeType != 'undefined' ? params.nodeType : (typeof this.resourceParser.nodeType != 'undefined' ? this.resourceParser.nodeType : "");
                }

                // Request next viewcode
                this.comm.nextView(params.live);

                // Send the request
                this.sendRequest('/start', params, callback);
                $YB.noticeRequest("Request: NQS /start " + params.resource);

                // Save last info sent
                this.lastDuration = params.duration;
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/joinTime' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.managers.View.prototype.sendJoin = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isStartSent && !this.isJoinSent && !this.isShowingAds) {

                // Flags
                this.isJoinSent = true;

                // Start playheadMonitor
                if (this.enableBufferMonitor || this.enableSeekMonitor) {
                    this.timer.playheadMonitor.start();
                    this.lastPlayhead = 0;
                }

                // Params
                params = this.infoManager.getJoinParams(params);
                params.time = typeof params.time != 'undefined' ? params.time : this.chrono.joinTime.getDeltaTime();

                // Check duration to send it only once
                if (params.mediaDuration === this.lastDuration) {
                    delete params.mediaDuration;
                }

                // Send the request
                this.sendRequest('/joinTime', params, callback);
                $YB.noticeRequest("Request: NQS /joinTime " + params.time + "ms");
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/stop' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.managers.View.prototype.sendStop = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isStartSent) {

                // Flags
                this.isStartSent = false;
                this.isPaused = false;
                this.isJoinSent = false;
                this.isSeeking = false;
                this.isBuffering = false;

                // Clear resource parser
                this.resourceParser.clear();

                // Reset Ad roll counters
                this.resetAdNumbers();

                // Stop Timers
                this.stopTimers();

                // Params
                params = this.infoManager.getStopParams(params);
                params.diffTime = typeof params.diffTime != 'undefined' ? params.diffTime : this.timer.pinger.chrono.getDeltaTime();

                // Send the request
                this.sendRequest('/stop', params, callback);
                $YB.noticeRequest("Request: NQS /stop");
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * Sends '/pause' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.managers.View.prototype.sendPause = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isJoinSent && !this.isPaused) {

                // Flags & Chronos
                this.isPaused = true;
                this.chrono.pause.start();

                // Params
                params = this.infoManager.getPauseParams(params);

                // Send the request
                this.sendRequest('/pause', params, callback);
                $YB.noticeRequest("Request: NQS /pause");
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * Sends '/resume' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.managers.View.prototype.sendResume = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isJoinSent && this.isPaused) {

                // Flags & Chronos
                this.isPaused = false;
                this.chrono.pause.stop();
                this.lastResume = new Date().getTime();

                // Params
                params = this.infoManager.getResumeParams(params);

                // Send the request
                this.sendRequest('/resume', params, callback);
                $YB.noticeRequest("Request: NQS /resume");
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/** Notifies a buffer start. It will expect a {$YB.api.Video#sendBufferEnd}. */
$YB.managers.View.prototype.sendBufferStart = function() {
    try {
        if (!this.isHalted()) {
            if (this.isJoinSent && !this.isBuffering) {

                // Flags & Chronos
                this.isBuffering = true;
                this.chrono.buffer.start();

                // Log
                $YB.noticeRequest("Method: /bufferStart");
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/bufferUnderrun' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.managers.View.prototype.sendBufferEnd = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isJoinSent && this.isBuffering) {

                // Flags & Chronos
                this.isBuffering = false;

                // Params
                params = this.infoManager.getBufferEndParams(params);
                params.duration = typeof params.duration != 'undefined' ? params.duration : this.chrono.buffer.getDeltaTime();

                // Send the request
                this.sendRequest('/bufferUnderrun', params, callback);
                $YB.noticeRequest("Request: NQS /bufferUnderrun " + params.duration + "ms");
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/** Notifies a seek start. It will expect a {$YB.api.Video#sendSeekEnd}. */
$YB.managers.View.prototype.sendSeekStart = function() {
    try {
        if (!this.isHalted()) {
            if (this.isJoinSent && !this.isSeeking) {

                // Flags & Chronos
                this.isSeeking = true;
                this.chrono.seek.start();

                // Log
                $YB.noticeRequest("Method: /seekStart");

            }
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Sends '/seek' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.managers.View.prototype.sendSeekEnd = function(params, callback) {
    try {
        if (!this.isHalted()) {
            if (this.isJoinSent && this.isSeeking) {

                // Flags & Chronos
                this.isSeeking = false;

                // Params
                params = this.infoManager.getSeekEndParams(params);
                params.duration = typeof params.duration != 'undefined' ? params.duration : this.chrono.seek.getDeltaTime();

                // Send the request
                this.sendRequest('/seek', params, callback);
                $YB.noticeRequest("Request: NQS /seek " + params.duration + "ms");
            }
        }
    } catch (err) {
        $YB.error(err);
    }
};


/**
 * Sends '/error' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.managers.View.prototype.sendError = function(params, callback) {
    try {
        // Flags & Crhonos
        this.isErrorSent = true;

        // stop pings and nicebuffer
        if (this.infoManager.options.haltOnError) {
            this.stopTimers();
        }

        // Params
        params = this.infoManager.getErrorParams(params);
        params.pingTime = typeof params.pingTime != 'undefined' ? params.pingTime : this.comm.pingTime;
        if (this.infoManager.options.parseCDNNodeHost) {
            params.nodeHost = typeof params.nodeHost != 'undefined' ? params.nodeHost : (typeof this.resourceParser.nodeHost != 'undefined' ? this.resourceParser.nodeHost : "");
            params.nodeType = typeof params.nodeType != 'undefined' ? params.nodeType : (typeof this.resourceParser.nodeType != 'undefined' ? this.resourceParser.nodeType : "");
        }

        // Send the request
        this.sendRequest('/error', params, callback);
        $YB.noticeRequest("Request: NQS /error " + params.msg);
    } catch (err) {
        $YB.error(err);
    }
};

/** Converts Buffer to Seek (migrating its chronos) */
$YB.managers.View.prototype.convertBufferToSeek = function() {
    try {
        $YB.noticeRequest("Converting buffer to seek");

        this.chrono.seek.startTime = this.chrono.buffer.startTime;
        this.chrono.seek.lastTime = 0;

        this.chrono.buffer.stop();

        this.isBuffering = false;
        this.isSeeking = true;

    } catch (err) {
        $YB.error(err);
    }
};

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
        var bufferThreshold = ViewManager.MonitoringInterval / 2;
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

/**
 * Sends '/ping' request.
 *
 * @param {Object} [params] Any parameter specified in this object will be sent along the AJAX request. The API will try to populate every param, so use this only if you need to override a specific param. Refer to the NQS API for more information.
 * @param {function} [callback] If defined, this callback will be called when de AJAX request is done successfully.
 */
$YB.managers.View.prototype.sendPing = function(params, callback) {
    try {
        // Params
        params = this.infoManager.getPingParams(params);
        if (this.isShowingAds) params = this.infoManager.getAdPingParams(params);

        // Ping Time & chronos
        params.pingTime = typeof params.pingTime != 'undefined' ? params.pingTime : this.comm.pingTime;
        if (this.isSeeking) params.seekDuration = typeof params.seekDuration != 'undefined' ? params.seekDuration : this.chrono.seek.getDeltaTime(false);
        if (this.isBuffering) params.bufferDuration = typeof params.bufferDuration != 'undefined' ? params.bufferDuration : this.chrono.buffer.getDeltaTime(false);
        if (this.isAdBuffering) params.adBufferDuration = typeof params.adBufferDuration != 'undefined' ? params.adBufferDuration : this.chrono.adBuffer.getDeltaTime(false);

        // Rendition
        var rendition = this.infoManager.getRendition();
        if (this.lastRendition != rendition) {
            this.sendChangedEntity('rendition', rendition);
            this.lastRendition = rendition;
        }

        // Changed entities
        if (this.changedEntities.length == 1) {
            var ent = this.changedEntities.shift();
            params.entityType = ent.key;
            params.entityValue = ent.value;
        } else if (this.changedEntities.length > 1) {
            params.entityType = null;
            params.entityValue = JSON.stringify(this.changedEntities);
            this.changedEntities = {};
        }

        // Send request
        this.sendRequest('/ping', params, callback);

    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Queues an entity that would be changed during the next ping.
 * @param {string} key Name of the entity. If the key is already queued to change, it will be overriden. ie: duration, rendition...
 * @param {mixed} value New value.
 */
$YB.managers.View.prototype.sendChangedEntity = function(key, value) {
    try {
        this.changedEntities.push({ key: key, value: value });
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * @license
 * Youbora Chrono
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * This class calculates time lapses between two points.
 * @private
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
/**
 * @license
 * Youbora utils.ResourceParser
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Youbora utils.ResourceParser will parse the precise CDN of the resource if options.parseHLS or options.parseCDNNodeHost are true.
 * CDNs will be parsed in the order defined in {@link $YB.utils.ResourceParser.cdnsAvailable}, modify context list to modify order.
 *
 * @private
 * @class
 * @memberof $YB
 * @param {$YB.managers.View} viewManager The viewManager from where it was called.

 */
$YB.utils.ResourceParser = function(viewManager) {
    try {
        this.viewManager = viewManager;
        this.parseTimeout = null;

        /** Final resource parsed.
         * @var {string}
         * @readonly
         */
        this.realResource = '';

        /** Node Host name after parsing it.
         * @var {string}
         * @readonly
         */
        this.nodeHost = undefined;

        /** Code of the Node Host type after parsing it.
         * @var {number}
         * @readonly
         */
        this.nodeType = undefined;

        this.cdnRequests = {};
        this.cdns = $YB.utils.ResourceParser.cdnsEnabled.slice();
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Starts the process if either parseHLS or parseCDNNodeHost are active. The process is aborted automatically after 3 seconds.
 */
$YB.utils.ResourceParser.prototype.init = function() {
    try {
        // Reinit
        if (this.realResource) {
            this.clear();
        }

        // Add Preloader
        this.viewManager.comm.addPreloader('ResourceParser');

        // Replace resource parser discoveries
        var context = this;
        this.viewManager.comm.extraOperationsCallback = function(params) {
            if (typeof params.resource != "undefined" && context.realResource) {
                params.resource = context.realResource; // If realresource was fetched, use it.
            }
            if (typeof params.nodeHost != "undefined" && context.nodeHost) {
                params.nodeHost = context.nodeHost;
                params.nodeType = context.nodeType;
            }
        };

        // Abort operation after 3s
        this.parseTimeout = setTimeout(function() {
            if ('ResourceParser' in context.viewManager.comm.preloaders) {
                context.realResource = context.viewManager.infoManager.getResource();
                context.viewManager.comm.removePreloader('ResourceParser');
                $YB.warn('ResourceParser has exceded the maximum execution time (3s) and will be aborted.');
            }
        }, 3000);

        // Start processing
        this.realResource = this.viewManager.infoManager.getResource();
        if (this.viewManager.infoManager.options.parseHLS) {
            this._parseRealResourceAsync(this.realResource);
        } else {
            this._parseCDNAsync();
        }
    } catch (err) {
        $YB.error(err);
    }
};

/**
 * Clear the info fetched by utils.ResourceParser. Should be called after a stop is sent.
 */
$YB.utils.ResourceParser.prototype.clear = function() {
    this.realResource = '';
    this.nodeHost = undefined;
    this.nodeType = undefined;
    this.cdnRequests = {};
    this.cdns = $YB.utils.ResourceParser.cdnsEnabled.slice();
};

/**
 * Parses resource, if it is an HLS .m3u8 file, it recursively parses its info until .ts or .mp4 is found.
 *
 * @private
 * @param {string} resource path to the resource.
 */
$YB.utils.ResourceParser.prototype._parseRealResourceAsync = function(resource, parentResource) {
    try {
        var matches = /(\S*?(\.m3u8|\.m3u|\.ts|\.mp4)(\?\S*|\n|\r|$))/i.exec(resource); //get first line ending in .m3u8, .m3u, .mp4 or .ts
        if (matches !== null) {
            var res = matches[1].trim();
            if (res.indexOf('http') !== 0) { // Does not start with http add parentResource relative route.
                res = parentResource.slice(0, parentResource.lastIndexOf('/')) + "/" + res;
            }
            if (matches[2] == '.m3u8' || matches[2] == '.m3u') { // It is m3u8 or m3u...
                var context = this;
                new $YB.comm.AjaxRequest(res).load(function() {
                        context._parseRealResourceAsync(this.responseText, res); //In this viewManager, this referes to the XHR.
                    }).error(function() {
                        context._parseCDNAsync();
                    })
                    .send();
            } else { // It is mp4 or ts...
                this.realResource = res;
                this._parseCDNAsync();
            }
        } else {
            this._parseCDNAsync();
        }
    } catch (err) {
        $YB.error(err);
        this._parseCDNAsync();
    }
};


/** List of CDNs in order for execution. Can be modified to alter the order/list of CDNs available.
 * CDNs context share headers will share request, saving resources.
 */
$YB.utils.ResourceParser.cdnsEnabled = ['Level3', 'Akamai', 'Highwinds', 'Fastly'];

/** List of CDNs configuration. */
$YB.utils.ResourceParser.cdnsAvailable = {
    Level3: {
        parsers: [{
            type: 'host+type',
            name: 'X-WR-DIAG',
            regex: /Host:(.+)\sType:(.+)/
        }],
        headers: {
            'X-WR-DIAG': 'host'
        }
    },
    Akamai: {
        parsers: [{
            type: 'host+type',
            name: 'X-Cache',
            regex: /(.+)\sfrom\s.+\(.+\/(.+)\).+/
        }]
    },
    Highwinds: {
        parsers: [{
            type: 'host+type',
            name: 'X-HW',
            regex: /.+,[0-9]+\.(.+)\.(.+)/
        }]
    },
    Fastly: {
        parsers: [{
            type: 'host',
            name: 'X-Served-By',
            regex: /([^,\s]+)$/
        }, {
            type: 'type',
            name: 'X-Cache',
            regex: /([^,\s]+)$/
        }]
    }
};

/**
 * Starts the parsing of CDN Nodes.
 * @private
 */
$YB.utils.ResourceParser.prototype._parseCDNAsync = function() {
    try {
        if (this.viewManager.infoManager.options.parseCDNNodeHost) {
            if (this.cdns.length > 0 && !this.nodeHost) { // if there's CDN remaining in the pool and host has not been retrieved...
                var cdn = this.cdns.shift();
                if (typeof $YB.utils.ResourceParser.cdnsAvailable[cdn] != 'undefined') {

                    var config = $YB.utils.ResourceParser.cdnsAvailable[cdn],
                        headers = JSON.stringify(config.headers);

                    if (this.cdnRequests.hasOwnProperty(headers)) {
                        this._parseNode(config.parsers, this.cdnRequests[headers]);
                    } else {
                        var context = this;

                        var ajax = new $YB.comm.AjaxRequest(this.realResource, '', '', {
                            method: 'HEAD',
                            maxRetries: 0,
                            requestHeaders: config.headers
                        });

                        ajax.load(function() {
                            context.cdnRequests[headers] = ajax.getXHR();
                            context._parseNode(config.parsers, ajax.getXHR());
                        });

                        ajax.error(function() {
                            context._parseCDNAsync();
                        });

                        ajax.send();
                    }
                } else {
                    this._parseCDNAsync();
                }
            } else {
                this.viewManager.comm.removePreloader('ResourceParser');
            }
        } else {
            this.viewManager.comm.removePreloader('ResourceParser');
        }
    } catch (err) {
        $YB.error(err);
    }
};

$YB.utils.ResourceParser.prototype._parseNode = function(parsers, response) {
    try {
        for (var key in parsers) {
            var header = response.getResponseHeader(parsers[key].name); // May throw error since headers will not always be available.
            if (header !== null) {
                var match = parsers[key].regex.exec(header);

                if (match !== null) {
                    switch (parsers[key].type) {
                        case 'host':
                            this.nodeHost = match[1];
                            break;
                        case 'type':
                            this.nodeType = this._parseNodeType(match[1]);
                            break;
                        case 'host+type':
                            this.nodeHost = match[1];
                            this.nodeType = this._parseNodeType(match[2]);
                            break;
                        case 'type+host':
                            this.nodeType = this._parseNodeType(match[1]);
                            this.nodeHost = match[2];
                            break;
                    }
                } else {
                    this._parseCDNAsync();
                    return;
                }
            } else {
                this._parseCDNAsync();
                return;
            }
        }

        this._parseCDNAsync();
    } catch (err) {
        $YB.error(err);
        this._parseCDNAsync();
    }
};

$YB.utils.ResourceParser.prototype._parseNodeType = function(type) {
    try {
        switch (type) {
            case 'TCP_HIT':
            case 'HIT':
            case 'c':
                return 1;
            case 'TCP_MISS':
            case 'MISS':
            case 'p':
                return 2;
            case 'TCP_MEM_HIT':
                return 3;
            case 'TCP_IMS_HIT':
                return 4;
            default:
                return 0;
        }
    } catch (err) {
        $YB.error(err);
        return 0;
    }
};

/**
 * @license
 * Youbora PingApi
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Instances of this class will call a callback every setted interval.
 *
 * @private
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
