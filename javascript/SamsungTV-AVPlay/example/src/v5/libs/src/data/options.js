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
