/**
 * @license
 * Youbora utils.ResourceParser
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 */

/**
 * Youbora utils.ResourceParser will parse the precise CDN of the resource if options.parseHLS or options.parseCDNNodeHost are true.
 * CDNs will be parsed in the order defined in {@link $YB.utils.ResourceParser.cdnsAvailable}, modify context list to modify order.
 *
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
