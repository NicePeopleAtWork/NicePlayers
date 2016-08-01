function(swfId) {

    var contextId = "_ageVerificationFlashPlugInJSBridge" + String(Math.round(Math.random() * 100000000000000000));

    var AgeVerificationFlashPlugInJSBridge = function(swfId)
    {
        this._swfEelement = document.getElementById(swfId);
        this._serviceLoaderTimeout = 0;
        this._ageVerification = null;
        this._ready = false;
        this._ageVerificationInitialized = false;
    };

    AgeVerificationFlashPlugInJSBridge.prototype =
    {
        loadService : function(onReadyCallbackId, ageVerCardUIReadyCallbackId, verifiedCallbackId, unverifiedCallbackId, loadVars, scopes)
        {
            var that = this;
            this.onReadyCallbackId = onReadyCallbackId;
            this.ageVerCardUIReadyCallbackId = ageVerCardUIReadyCallbackId;
            this.verifiedCallbackId = verifiedCallbackId;
            this.unverifiedCallbackId = unverifiedCallbackId;

            tpLoadScript($pdk.scriptRoot+"/js/libs/ratings/ageVerificationLib.js",function(){
                that._initialize(loadVars, scopes)
            });
        },

        verifyRating: function(rating)
        {
            return this._ageVerification.verifyRating(rating);
        },

        setRatingVerified: function(rating, verified, ttl)
        {
//            this.log("bridge.setRatingVerified: ttl: "+ttl);
            this._ageVerification.setRatingVerified(rating, verified, ttl);
        },

        _initialize : function(loadVars, scopes)
        {
            var me = this;
            var verifiedCallback = function(ttl) {
                me._verifiedCallback.apply(me, [ttl]);
            };
            var unverifiedCallback = function() {
                me._unverifiedCallback.apply(me);
            };

            var cardUiReadyCallback = function() {
                me._swfEelement[me.ageVerCardUIReadyCallbackId]();
            };

            this._ageVerification = new $pdk.plugin.ratings.AgeVerification(verifiedCallback,unverifiedCallback);
            this._ageVerification.initialize(loadVars, scopes, cardUiReadyCallback);
            this._ready = true;
            this._swfEelement[this.onReadyCallbackId]({
                success : true
            });
        },

        _verifiedCallback : function(ttl)
        {
            this._swfEelement[this.verifiedCallbackId](ttl);
        },

        _unverifiedCallback : function()
        {
            this._swfEelement[this.unverifiedCallbackId]();
        },

        log : function (s)
        {
            tpDebug(s);
        }
    };

    window[contextId] = new AgeVerificationFlashPlugInJSBridge(swfId);


    return contextId;
}
