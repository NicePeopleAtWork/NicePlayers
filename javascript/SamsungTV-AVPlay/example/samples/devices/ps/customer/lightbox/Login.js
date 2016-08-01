/**
 * The login view's controller, setup user name and password field and the keyboard
 * @name Login
 * @memberof tvedemo/ctrl
 * @class tvedemo/ctrl/Login
 * @extends tvedemo/ctrl/RoutableController
 */
define("tvedemo/ctrl/Login", [
    "tvedemo/helper/youboraAnalyticsObject"
], function (YouboraAnalytics) {


    return ax.klass.create(RoutableController, {
        getDefaultState: function () {
            return {};
        }
    }, {

        setup: function (context) {
            //some code 

                        YouboraAnalytics.setUsername(USER_NAME);

	       // some code
    });
});