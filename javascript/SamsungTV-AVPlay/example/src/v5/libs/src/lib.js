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
    version: '[ver]',

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
