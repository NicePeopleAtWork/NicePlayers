/**
 * @license
 * Youbora Plugin 5.3.1-ooyala4
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != 'undefined') {

$YB.plugins.Ooyala4 = function(player, options) {
    try {
        /** Name and platform of the plugin.*/
        this.pluginName = 'ooyala4';

        /** Version of the plugin. ie: 5.1.0-name */
        this.pluginVersion = '5.3.1-ooyala4';

        //this.adnalyzer = new $YB.adnalyzers.Ooyala4(this);

        if (player) {
            /* Initialize YouboraJS */
            this.startMonitoring(player.getElementId(), options);

            // Save player reference
            this.player = player;
        } else {
            this.resetValues();
        }
    } catch (err) {
        $YB.error(err);
    }
};

// Extend Generic Plugin
$YB.plugins.Ooyala4.prototype = new $YB.plugins.Generic;

/** Reset reported values. */
$YB.plugins.Ooyala4.prototype.resetValues = function() {
    this.playhead = 0;
    this.resource = "";
    this.title = "";
    this.duration = 0;
    this.bitrate = -1;
    this.isLive = false;
    this.rendition = "";

    //this.adnalyzer.resetValues();
}

/** Returns the current playhead of the video or 0. */
$YB.plugins.Ooyala4.prototype.getPlayhead = function() {
    if (this.player) {
        return this.player.getPlayheadTime();
    } else {
        return this.playhead;
    }
};

/** Returns the media duration of the video or 0. */
$YB.plugins.Ooyala4.prototype.getMediaDuration = function() {
    if (this.player) {
        return this.player.getDuration();
    } else {
        return this.duration;
    }
};

/** Returns true if media is Live, and false if it is VOD. */
$YB.plugins.Ooyala4.prototype.getIsLive = function() {
    return this.isLive;
};


/** Returns the title or an empty string. */
$YB.plugins.Ooyala4.prototype.getTitle = function() {
    if (this.player) {
        return this.player.getTitle();
    } else {
        return this.title;
    }
};

/** Returns the src of the resource or an empty string. */
$YB.plugins.Ooyala4.prototype.getResource = function() {
    if (this.resource) {
        return this.resource;
    }
};
/**/

/** Returns version of the player or an empty string. */
$YB.plugins.Ooyala4.prototype.getPlayerVersion = function() {
    return "Ooyala V4 " + OO.VERSION.core.rev;
};

/** Returns the current bitrate of the video or -1. */
$YB.plugins.Ooyala4.prototype.getBitrate = function() {
    if (this.player) {
        return this.player.getCurrentBitrate();
    } else {
        return this.bitrate;
    }
};

/** Returns current rendition name or null.*/
$YB.plugins.Ooyala4.prototype.getRendition = function() {
    if (this.rendition) {
        return this.rendition;
    } else {
        return null
    }
};

/** Analytics */
$YB.plugins.Ooyala4.prototype.processEvent = function(eventName, params) {
    try {
        if ($YB.debugLevel >= 4) {
            if (eventName != "video_stream_downloading" && eventName != "video_stream_position_changed") {
                $YB.debug("Event: " + eventName);
                if (params[0])
                    $YB.debug(params[0]);
            }
        }

        switch (eventName) {
            case "video_stream_position_changed":
                if (!this.isShowingAds) {
                    this.playhead = params[0].streamPosition;
                    this.duration = params[0].totalStreamDuration;
                }
                break;

            case "initial_playback_requested":
                this.playHandler();
                break;


            case "video_buffering_started":
                if (!this.viewManager.isSeeking && params[0].streamUrl.startsWith(this.resource)) {
                    this.bufferingHandler();
                }
                break;

            case "video_buffering_ended":
                this.joinHandler();
                if (this.viewManager.isBuffering) {
                    this.bufferedHandler();
                }
                break;

            case "video_pause_requested":
                this.pauseHandler();
                break;

            case "video_playing":
                this.resumeHandler();
                break;

            case "video_seek_requested":
                this.seekingHandler();
                break;

            case "video_seek_completed":
                this.seekedHandler();
                break;

            case "ad_break_started":
                this.ignoringAdHandler();
                //this.adnalyzer.startJoinAdHandler();
                break;

            case "ad_break_ended":
                this.ignoredAdHandler();
                //this.adnalyzer.endedAdHandler();
                //this.adnalyzer.resetValues();
                break;

            case "playback_completed":
                this.endedHandler();
                //this.adnalyzer.resetValues();
                break;

            case "video_content_metadata_updated":
                this.title = params[0].title;
                this.duration = params[0].duration / 1000;
                break;

            case "video_element_created":
                this.resource = params[0].streamUrl;
                break;

            case "stream_type_updated":
                this.isLive = !(params[0].streamType == "vod");
                break;

            case "video_stream_bitrate_changed":
                this.bitrate = params[0].bitrate;

                if (isNaN(params[0].id)) {
                    this.rendition = params[0].id;
                } else if (params[0].width && params[0].height && params[0].bitrate) {
                    this.rendition = params[0].width + "x" + params[0].height + "@" + params[0].bitrate;
                } else {
                    this.rendition = null;
                }
                break;
        }
    } catch (err) {
        $YB.error(err)
    }
};

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

}
