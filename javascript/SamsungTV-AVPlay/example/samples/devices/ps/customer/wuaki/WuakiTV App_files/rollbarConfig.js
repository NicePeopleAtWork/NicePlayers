/**
 * Rollbar configuration variable. 
 * You can use ##[parameter]## inside _rollbarConfig, these strings are replaced automatically by TVApp engine with the build parameters.
 * ##paramater## can be: appName, platform, engineId, build
 * @type {Object}
 */
var _rollbarConfig = {
    accessToken: "c1a9d7c776b74a43985bbf396257ae1c",
    captureUncaught: true,
    uncaughtErrorLevel:"error",
    //endpoint: "http://api.rollbar.com/api/1/item/",
    payload: {
        environment: "Production WuakiTv PS3",
        person: {
    		id: -1,
    		username: "notLoggedUser",
    		email: "notLoggedUser@example.com"
    	},
        client: {
            javascript: {
                source_map_enabled: true,
                code_version: "61/1983940058",
                // Optionally have Rollbar guess which frames the error was thrown from
                // when the browser does not provide line and column numbers.
                guess_uncaught_frames: true
            }
        },
        server: {
    		host:"PS3Mayfly.##country##"
  		}
    },
    timeoutMax: 10,
    timeoutConter: 0,
    checkIgnore: function(isUncaught, args, payload) 
    {
	    // ignore errors.
	    try
	    {
	    	if (args[1].match(/\[STATUS\]: Timeout/).length > 0)
            {
                this.timeoutConter++;
                if (this.timeoutConter < this.timeoutMax) return true;
                else return false;
            }
	    } 
	    catch (e)
	    {
	    	return false;
	    }
	}
};

(function ()
{
	if (typeof _waitingForRollbarConfig !== 'undefined' && typeof TVA_Rollbar !== 'undefined') TVA_Rollbar.load(); 
})();
