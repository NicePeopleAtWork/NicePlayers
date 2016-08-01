    /**
     * @class YBOOAnalyticsPlugin
     * @classdesc This is an example class of a plugin that works with the Ooyala Analytics Framework.
     * @param {object} framework The Analytics Framework instance
     */
    $YB.plugins.Ooyala4.AnalyticsFramework = function(framework) {
        this.framework = framework;
        this.name = "youbora";
        this.id;
        this.active = true;

        this.plugin = new $YB.plugins.Ooyala4();

        /**
         * [Required Function] Return the name of the plugin.
         * @public
         * @method YBOOAnalyticsPlugin#getName
         * @return {string} The name of the plugin.
         */
        this.getName = function() {
            return this.name;
        };

        /**
         * [Required Function] Return the version string of the plugin.
         * @public
         * @method YBOOAnalyticsPlugin#getVersion
         * @return {string} The version of the plugin.
         */
        this.getVersion = function() {
            return this.plugin.pluginVersion;
        };

        /**
         * [Required Function] Set the plugin id given by the Analytics Framework when
         * this plugin is registered.
         * @public
         * @method YBOOAnalyticsPlugin#setPluginID
         * @param  {string} newID The plugin id
         */
        this.setPluginID = function(newID) {
            this.id = newID;
        };

        /**
         * [Required Function] Returns the stored plugin id, given by the Analytics Framework.
         * @public
         * @method YBOOAnalyticsPlugin#setPluginID
         * @return  {string} The pluginID assigned to this instance from the Analytics Framework.
         */
        this.getPluginID = function() {
            return this.id;
        };

        /**
         * [Required Function] Initialize the plugin with the given metadata.
         * @public
         * @method YBOOAnalyticsPlugin#init
         */
        this.init = function() {
            var missedEvents;
            //if you need to process missed events, here is an example
            if (this.framework) {
                missedEvents = this.framework.getRecordedEvents();
                for (var k in missedEvents) {
                    var event = missedEvents[k];
                    this.plugin.processEvent(event.eventName, event.params);
                }
            }
        };

        /**
         * [Required Function] Set the metadata for this plugin.
         * @public
         * @method YBOOAnalyticsPlugin#setMetadata
         * @param  {object} metadata The metadata for this plugin
         */
        this.setMetadata = function(metadata) {
            $YB.notice("Ooyala Analytics Framework Plugin " + this.id + " is ready.");
            this.plugin.startMonitoring(null, metadata);
            if (typeof metadata["debug"] != "undefined") {
                $YB.debugLevel = metadata["debug"];
            }
        };

        /**
         * [Required Function] Process an event from the Analytics Framework, with the given parameters.
         * @public
         * @method YBOOAnalyticsPlugin#processEvent
         * @param  {string} eventName Name of the event
         * @param  {Array} params     Array of parameters sent with the event
         */
        this.processEvent = function(eventName, params) {
            this.plugin.processEvent(eventName, params);
        };

        /**
         * [Required Function] Clean up this plugin so the garbage collector can clear it out.
         * @public
         * @method YBOOAnalyticsPlugin#destroy
         */
        this.destroy = function() {
            delete this.framework;
            delete this.plugin;
        };
    };


    if (typeof OO != "undefined") {
        if (OO.Analytics) {
            OO.Analytics.RegisterPluginFactory($YB.plugins.Ooyala4.AnalyticsFramework);
        } else {
            $YB.error("OO.Analytics not found. This plugin is designed for Ooyala V4.");
        }
    } else {
        $YB.error("Ooyala library not yet loaded.");
    }
