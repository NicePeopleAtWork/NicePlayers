define("tvedemo/ctrl/FullscreenPlayer", [
    "tvedemo/helper/youboraAnalyticsObject"

], function (YouboraAnalytics) {

    return ax.klass.create(RoutableController, {
    }, {

        setup: function (context) {
            // calling the APIs to get stream and build UI...etc. 
            //before running any episode I call this function
            this._setYouboraProperties();
        },

        _setYouboraProperties: function(){
            try{
                if(!this.__episode)
                    return;
                var firmwareInfo = device.id.getFirmware();
                if (device.platform === "playstation" && WM_devSettings) {
                    firmwareInfo = device.id.getModel() + " Webmaf " + WM_devSettings.version;
                }
                var contentID = this.__episode.id,
                parameters = {
                    filename: this.__episode.titles && this.__episode.titles.default,
                    content_id: contentID,
                    content_metadata: {
                        title: this.__episode.titles && this.__episode.titles.default,
                        genre: this.__episode.categories && this.__episode.categories.length > 0 && this.__episode.categories[0].titles.default,
                        language: "",
                        year: this.__episode.details && this.__episode.details.year,
                        cast: "",
                        director: "",
                        owner: this.__episode.details && this.__episode.details.content_owner,
                        duration: this.__episode.details && this.__episode.details.length,
                        parental: this.__episode.parental_control && this.__episode.parental_control.rating,
                        price: "",
                        rating: this.__episode.details && this.__episode.details.nz_rating
                    },
                    //fadelly el manufacture info gebha mn el Help
                    device: {
                        manufacturer: device.platform,
                        year: device.id.getFirmwareYear(),
                        firmware: firmwareInfo
                    }
                };
                YouboraAnalytics.setProperties(contentID, parameters);
            } catch(error){
                console.log("[FullscreenPlayer] error while settting Youbora parameters");
            }
        },

        //some other functions
    });
});