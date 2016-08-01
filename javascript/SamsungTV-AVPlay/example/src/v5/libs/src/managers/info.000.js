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
    /**
     * Instance of the plugin
     * @type {$YB.plugins.Generic}
     */
    this.plugin = plugin;

    /**
     * Instance of options
     * @type {$YB.data.Options}
     */
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
