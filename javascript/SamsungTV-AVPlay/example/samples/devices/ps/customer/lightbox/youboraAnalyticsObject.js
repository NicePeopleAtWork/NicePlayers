/**
 * youbora analytics tracker.
 * @module tvedemo/helper/youboraAnalyticsObject
 * @name youboraAnalyticsObject
 * @memberof tvedemo/helper
 */
define("tvedemo/helper/youboraAnalyticsObject", ["ax/console", "ax/config"],

    function (console, config) {

        var YouboraAnalytics = {

            init: function(){

                var youboraConfigs = config.get("youbora", false),
                    youboraEnabled = youboraConfigs.enabled || false,
                    appGridConfig = config.get("tve.appgrid"),
                    env = appGridConfig.environment,
                    accountCode = youboraConfigs.accountCode[env];

                try{
                    youboraData.setEnableAnalytics(youboraEnabled);
                    youboraData.setAccountCode(accountCode);
                    youboraData.setLive(false);
                    //youboraData.setDebug(true);
                }catch(e){
                    console.error("Error While contacting YouboraAnalytics");
                }
            },

            setUsername: function(username){
                try{
                    youboraData.setUsername(username);
                }catch(e){
                    console.error("Error While contacting YouboraAnalytics in set UserName");
                }
            },

            setProperties: function(contentId, properties){
                try{
                    youboraData.setContentId(contentId);
                    youboraData.setProperties(properties);
                }catch(e){
                    console.error("Error While contacting YouboraAnalytics in set Properties");
                }
            }
        };

        return YouboraAnalytics;
    }
);