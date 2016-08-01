
if ($pdk.plugin == null)
{
    $pdk.ns("$pdk.plugin");
}
if ($pdk.plugin.ratings == null)
{
    $pdk.ns("$pdk.plugin.ratings");
}

if(!$pdk.plugin.ratings.LoadVarsManager ) {


$pdk.ns("$pdk.plugin.ratings.LoadVarsManager");
$pdk.plugin.ratings.LoadVarsManager = $pdk.extend(function(){}, {

    constructor : function(){
        this._defaults = [];
    },

    setLoadVars : function(vars) {
        this._vars = vars;
        this.initVars();
    },

    initVars : function() {
       console.log('override in implementation');
    },

    addVar : function(varObj) {
        this._defaults.push(varObj);
    },

    _getDefaultObj : function(name) {
        var i, obj;
        for (i = 0; i < this._defaults.length; i++) {
            obj = this._defaults[i];
            if (obj &&
                obj.hasOwnProperty('name') &&
               obj.name == name) {
                return obj;
            }
        }
        return null;
    },

    _getDefaultValue : function(name) {
        var dobj = this._getDefaultObj(name);
        if(dobj) {
            return dobj.value;
        }
        return null;
    },

    _getTypedValue: function(value, defaultValue)
    {
        // if we are returning the default then it is already typed
        if(!value) {
            return defaultValue;
        }

        if(typeof defaultValue == "boolean") {
            return (value.toLowerCase() === "true");
        }

        if(typeof defaultValue == "number") {
            return parseFloat(value,10);
        }

        if(typeof defaultValue == "string") {
            return value;
        }

        if(Object.prototype.toString.call( defaultValue ) === '[object Array]') {
            // TODO: do some string parsing here
            return value.split(",");
        }

        if(Object.prototype.toString.call( defaultValue ) === "[object Object]") {
            // TODO: do some string parsing here
            return value;
        }

        return null;

    },

    getVar : function(name) {
        var value, defaultValue;
        if (this._vars.hasOwnProperty(name)) {
            // TODO: validate this at some point
            value = this._vars[name];
        }
        defaultValue = this._getDefaultValue(name);
        return this._getTypedValue(value, defaultValue);
    }


});


}


$pdk.ns("$pdk.plugin.ratings.version");
$pdk.plugin.ratings.version = "0.1.14-04-09_02_01";
/*
* Age Verification code
* This serves as the API for the Flash and HTML versions of the
* age verification plugins
*/
$pdk.ns("$pdk.plugin.ratings.AgeVerification");
$pdk.plugin.ratings.AgeVerification = $pdk.extend(function(){},
{

    VERIFICATION_NEEDED : "verificationNeeded",
    VERIFICATION_NOT_NEEDED : "verificationNotNeeded",
    VERIFIED : "verified",
    UNVERIFIED : "unverified",
    DEFAULT_STYLES : '\n.tpAgeVerificationCard .tpMenuButtons .tpButton {width:100px;height:40px;}\n'+
        '.tpPlayerCard.tpAgeVerificationCard{text-align:center;}',
    _stylesReady : false,
    _scopes : null,
    _loadvars : null,
    _initializationReadyCallback: null,

	constructor : function(verifiedCallback, unverifiedCallback){
		this.log("AgeVerification is up");
        this.verifiedCallback = verifiedCallback;
        this.unverifiedCallback = unverifiedCallback;

        this.stylesReadyHandler(null);
//        this._applyDefaultStyles();
	},

    // takes an existing style tag of class tpPdkStyles and adds to it;
    // or creates a new style tag of class tpPdkStyles with the default styles.
    _applyDefaultStyles : function()
    {
        var me = this;
        var $ = jQuery;
        $(function(){ tpDebug("DOM ready hit!", "AgeVerification(js)")});
        var $tpPdkStylesElements = $(".tpPdkStyles");
        var $tpPdkStylesTag = null;
        var createdNewTag = false;
        if($tpPdkStylesElements != null && $tpPdkStylesElements.length > 0 && $tpPdkStylesElements[0].tagName.toLowerCase() == "style")
        {
            $tpPdkStylesTag = $($tpPdkStylesElements[0]);
        }
        if($tpPdkStylesTag === null)
        {
            createdNewTag = true;
            $tpPdkStylesTag = $("<style type='text/css' class='tpPdkStyles'>");
        }

        if(createdNewTag || $tpPdkStylesTag.html().indexOf("tpAgeVerificationCard") < 0)
        {
            this.log("adding styles to styles tag");
            $tpPdkStylesTag.html($tpPdkStylesTag.html() + this.DEFAULT_STYLES);

            if(createdNewTag)
            {
                $tpPdkStylesTag.appendTo("head");
            }

            // the key is not to add the cards before the styles are ready, otherwise some ui oddities
            setTimeout(function(e){ me.stylesReadyHandler.apply(me,arguments)}, 450);
        }
        else
        {
            tpDebug("- styles and tag already existed, so triggering ready");
            this.stylesReadyHandler();
        }
    },
    // theres a slight delay for creating a dynamic style tag ~10ms on desktop mac chrome
    // listeners not behaving, so just tossing in a timeout
    stylesReadyHandler : function(e)
    {
        this._stylesReady = true;
        if(this._loadVars && this._scopes)
        {
            this._addCards();
        }
    },
	initialize : function(loadVars, scopes, readyCallback)
    {
		this._scopes = scopes;
        this._loadVars = loadVars;
        this._initializationReadyCallback = readyCallback;
        this.loadVarsParser = new $pdk.plugin.ratings.AgeVerificationLoadVars();
		this.loadVarsParser.setLoadVars(loadVars);
        this.log("ratingsToVerify: "+this.loadVarsParser.ratingsToVerify());
		this.verify = new $pdk.plugin.ratings.AgeVerificationVerifier(this.loadVarsParser.ratingsToVerify());
        this.log("minimumAge: "+this.loadVarsParser.minimumAge());
        this.cookieName = this.loadVarsParser.cookieName();
        this.log("cookieName: "+this.cookieName);
        this.persister = new $pdk.plugin.ratings.AgeVerificationPersistence(this.cookieName, 2592000);

        if(this._stylesReady)
        {
            this._addCards();
        }
	},
    _addCards : function()
    {
        this.log("adding age verification cards from _addCards.");
        var me = this;
        $pdk.plugin.ratings.AgeVerificationCards.verification(
            function(ttl) { me.verifiedCallback.apply(me, [ttl]);},
            function() { me.unverifiedCallback.apply(me);},
            this.loadVarsParser.getCallbackName(),
            this._scopes
        );
        $pdk.plugin.ratings.AgeVerificationCards.notVerifiedCard(this._scopes);

        this._initializationReadyCallback();
    },
    verifyRating : function(rating)
    {
        var verified = this.verify.verifyRating(rating, this.persister.get(this.cookieName));
        return verified ? this.VERIFICATION_NOT_NEEDED : this.VERIFICATION_NEEDED;
    },
    getMinimumAge : function()
    {
        return this.loadVarsParser.minimumAge();
    },
    /*
        ratings: STRING
        verified: STRING
        ttl: int (milliseconds)
     */
    setRatingVerified : function(rating, verified, ttl)
    {
        if(verified === this.VERIFIED)
        {
          this.log("setting cookie for verified");
          var options = {
              "ratingsToVerify" : this.loadVarsParser.ratingsToVerify(),
              "rating" : rating
          };

          if(ttl != null)
              options['expires'] = ttl!=0 ? parseInt(ttl/1000) : 0;

          this.persister.set(this.cookieName, this.VERIFIED, options);
        }
        else
        {
          this.log("setting cookie for Unverified");
          this.persister.set(this.cookieName, this.UNVERIFIED);
        }
        this.logCookie();
    },
	log : function(s) {
		tpDebug(s, "AgeVerification(js)");
	},
    logCookie: function() {
        this.log(" -> cookie for key ("+this.cookieName+"): "+this.persister.get(this.cookieName));
    }
});

/*
 AgeVerificationCards
 */
$pdk.ns("$pdk.plugin.ratings.AgeVerificationCards");
//$pdk.ns("$pdk.plugin.ratings.tpAgeVerificationCardPresenter");

$pdk.plugin.ratings.AgeVerificationCards = (function(jquery, controller)
{

    var tpAgeVerificationCardHTML =  '<div class="tpPlayerCard tpResumePlaybackCard" id="tpAgeVerificationCard">' +
        '<div class="tpResumePromptMessage">${message}</div>' +
        '<div class="tpMenuButtons">' +
        '<a href="javascript:void(0)" class="tpButton tpVerify" tp:label="${verify}">${verify}</a>' +
        '<a href="javascript:void(0)" class="tpButton tpNoVerify" tp:label="${noverify}">${noverify}</a>' +
        '</div>' +
        '</div>';

    var tpAgeVerificationCardPresenter = function()
    {
        this.verify = function(ttl) {
            _verifiedCallback(ttl);
        };
        this.noverify = function() {
            _unverifiedCallback();
        };
        this.addListeners = function() {
            var me = this;
            jquery(me.initVars.card).find(".tpVerify").click(function() {
                me.verify();
            });
            jquery(me.initVars.card).find(".tpNoVerify").click(function() {
                me.noverify();
            });
        };
        this.show = function(initVars)
        {
            this.initVars = initVars;
            initVars.card.presenter = this;
            var me = this;
            // need to wait a bit to prevent yes/no from stealing the current click
            setTimeout(function() { me.addListeners(); }, 500);
        };
        this.hide = function()
        {
            tpDebug("tpAgeVerificationCard has been hidden");
            if(_userCallbackStr && _userCallbackStr.length > 0 && typeof window[_userCallbackStr] != 'undefined') {
                window[_userCallbackStr].apply(this, [this.initVars.card]);
            }

        };
    };


    var _verifiedCallback;
    var _unverifiedCallback;
    var _userCallbackStr;


    var tpAgeNotVerifiedCardHTML = '<div class="tpPlayerCard tpResumePlaybackCard" id="tpAgeNotVerifiedCard">' +
        '<div class="tpResumePromptMessage">${message}</div>' +
        '</div>';

    return {

        verification: function(verifiedCallback, unverifiedCallback, userCallback, scopes) {
            _verifiedCallback = verifiedCallback;
            _unverifiedCallback = unverifiedCallback;
            _userCallbackStr = userCallback;

            controller.addPlayerCard(
                "forms",
                "tpAgeVerificationCard",
                tpAgeVerificationCardHTML,
                "urn:theplatform:pdk:area:player",
                {
                    verify: "Yes",
                    noverify:"No",
                    message : "This content, rated ${rating}, is for viewers ${age} or older. Are you of age?"
                },
                tpAgeVerificationCardPresenter,
                100,
                scopes);
        },
        notVerifiedCard: function(scopes) {

            controller.addPlayerCard(
                "forms",
                "tpAgeNotVerifiedCard",
                tpAgeNotVerifiedCardHTML,
                "urn:theplatform:pdk:area:player",
                {
                    message: "You are not verified."
                },
                null,
                100,
                scopes);
        }
    };
})($pdk.jQuery, $pdk.controller);



//
$pdk.ns("$pdk.plugin.ratings.AgeVerificationLoadVars");
$pdk.plugin.ratings.AgeVerificationLoadVars = $pdk.extend($pdk.plugin.ratings.LoadVarsManager, {

    constructor : function() {
        $pdk.plugin.ratings.AgeVerificationLoadVars.superclass.constructor.call(this);
    },

    initVars : function() {
        this.addVar({name: 'ratingsToVerify', value: []});
        this.addVar({name: 'minimumAge', value: 18});
        this.addVar({name: 'cookieName', value: "pdk:ageverification"});
        this.addVar({name: 'scheme', value: 'urn:v-chip'});
        this.addVar({name: 'callback', value: ''});
    },

    ratingsToVerify : function() {
        // adding to lower to ensure matching
        var ratings = this.getVar('ratingsToVerify');
        var lowered = [];
        for (var i = 0, L=ratings.length ; i < L; i++) {
            lowered[i]= ratings[i].toLowerCase();
        }
        return lowered;
    },

    minimumAge : function() {
        return this.getVar('minimumAge');
    },

    cookieName : function() {
        return this.getVar('cookieName');
    },
    getCallbackName : function() {
        return this.getVar('callback');
    },
    getScheme : function() {
        // prepending urn if it does not exist
        var scheme = this._prependUrn(this.getVar('scheme').toLowerCase());
        return scheme;
    },
    _prependUrn : function(scheme) {
        if(!scheme.match(/^urn:/)) {
            scheme = "urn:"+scheme;
        }
        return scheme;
    }

});


$pdk.ns("$pdk.plugin.ratings.AgeVerificationPersistence");
// https://raw.github.com/ScottHamper/Cookies/master/src/cookies.js

$pdk.plugin.ratings.AgeVerificationPersistence = $pdk.extend(function() {}, {
	constructor: function(cookieName, expires) {
		this._cookieName = cookieName;
		this._document = document;
        this._keyReplacePattern = /[\s;,]/g;
        this.defaults = {
            path: '/',
            expires: expires
        };
	},
    get : function (key) {
        if (this._cachedDocumentCookie !== this._document.cookie) {
            this._renewCache();
        }
        key = (key + '').replace(this._keyReplacePattern,'');
        return this._cache[key];
    },
	set : function (key, value, options) {

        if(options) {
            var ratingsToVerify = options.ratingsToVerify ? options.ratingsToVerify : null;
            var rating = options.rating ? options.rating : null;
            if(rating && ratingsToVerify) {
                var matchedRatingIndex = ratingsToVerify.indexOf(rating);
                if(matchedRatingIndex > -1)
                {
                    var verifiedRatings = ratingsToVerify.slice(matchedRatingIndex);
                    value = verifiedRatings.join(",");
                }
            }
        }

        options = this._getExtendedOptions(options);
		options.expires = this._getExpiresDate(value === undefined ? -1 : options.expires);
		this._document.cookie = this._generateCookieString(key, value, options);
	},
    _getExtendedOptions : function (options) {
        return {
            path: options && options.path || this.defaults.path,
            domain: options && options.domain || this.defaults.domain,
            expires: options && options.expires || this.defaults.expires,
            secure: options && options.secure !== undefined ?  options.secure : this.defaults.secure
        };
    },
	_generateCookieString : function (key, value, options) {
		key = (key + '').replace(this._keyReplacePattern,'');
		value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);


		var cookieString = key + '=' + value;
		cookieString += options.path ? ';path=' + options.path : '';
		cookieString += options.domain ? ';domain=' + options.domain : '';
		cookieString += options.expires ? ';expires=' + options.expires.toUTCString() : '';
		cookieString += options.secure ? ';secure' : '';

		return cookieString;
	},
	_getExpiresDate : function(expires) {
		var now = new Date();
		switch (typeof expires) {
			case 'number': expires = new Date(now.getTime() + expires * 1000); break;
			case 'string': expires = new Date(expires); break;
		}

		if (expires && !this._isValidDate(expires)) {
			throw new Error('`expires` parameter cannot be converted to a valid Date instance');
		}

		return expires;
	},
	_isValidDate : function (date) {
		return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
	},
	_getCookieObjectFromString : function (documentCookie) {
		var cookieObject = {};
		var cookiesArray = documentCookie ? documentCookie.split('; ') : [];

		for (var i = 0; i < cookiesArray.length; i++) {
		var cookieKvp = this._getKeyValuePairFromCookieString(cookiesArray[i]);

			if (cookieObject[cookieKvp.key] === undefined) {
			    cookieObject[cookieKvp.key] = cookieKvp.value;
			}
		}

		return cookieObject;
	},
	_getKeyValuePairFromCookieString : function (cookieString) {
		// "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
		var separatorIndex = cookieString.indexOf('=');
		// IE omits the "=" when the cookie value is an empty string
		separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;

		return {
            key: cookieString.substr(0, separatorIndex),
			value: decodeURIComponent(cookieString.substr(separatorIndex + 1))
		};
	},
    _renewCache : function () {
        this._cache = this._getCookieObjectFromString(this._document.cookie);
        this._cachedDocumentCookie = this._document.cookie;
    }

});$pdk.ns("$pdk.plugin.ratings.AgeVerificationState");

$pdk.plugin.ratings.AgeVerificationState = $pdk.extend(function(){},{

    _currentReleaseUrl : null,
    _ageVerificationReady : false,
    _showCardData : null,

    // If a media doesn't have a rating, this is rating we give it
    // for cookie storage and business logic purposes.
    // It is the least restrictive rating, so for instance, a 'TV-G' rating is considered
    // more explicit than 'no-rating'.
    // If this changes, make the same change in flash plugin.
    NO_RATING : "no-rating",

    constructor : function(loadVars, controller)
    {
        var me = this;
        this.controller = controller;
        this.log("AgeVerificationState is up");

        this.ageVerification = new $pdk.plugin.ratings.AgeVerification(
            function(ttl) { me._verified.apply(me, [ttl]);},
            function() {me._unverified.apply(me)}
        );

        this.ageVerification.initialize(loadVars, this.controller.scopes, function(){me._handleAgeVerificationReady.apply(me,arguments)});
        this.loadVarsParser = new $pdk.plugin.ratings.AgeVerificationLoadVars();
        this.loadVarsParser.setLoadVars(loadVars);
    },
    _handleAgeVerificationReady: function()
    {
        this._ageVerificationReady = true;
        if(this._showCardData)
        {
            this.showCard(this._showCardData.show,this._showCardData.cardId,this._showCardData.deckId,this._showCardData.rating);
            this._showCardData = null;
        }
    },
    showCard : function(show, cardId, deckId, rating)
    {
        this.log("showCard("+show+")");
        if(!this._ageVerificationReady)
        {
            this._showCardData = {show:show,cardId:cardId,deckId:deckId,rating:rating};
            this.log("- delaying showing of card. age ver not ready");
            return;
        }

        if(show)
        {
            this.log("calling showPlayerCard (card:"+cardId+", rating:"+rating+")");
            this.controller.showPlayerCard(
                deckId,
                cardId,
                null,
                {
                    "age":this.ageVerification.getMinimumAge(),
                    "rating":rating
                });
        }
        else
        {
            this.log("calling hidePlayerCard ("+cardId+")");
            this.controller.hidePlayerCard(deckId,cardId);
        }
    },

    /**
     * Implementation for MetadataUrlPlugin
     * @param url String
     * @param isPreview Boolean
     */
    rewriteMetadataUrl: function(url)
    {
        //get the current release
        var rating;
        var release = this.controller.callFunction("getCurrentRelease", []);
        if (release)
        {
            rating = this._getRating(release, this.loadVarsParser.getScheme())
        }
        this._currentReleaseUrl = url;

        if (!rating)
        {
            //we've got to load the rating in
            this._loadReleaseForRating(url);
            return true;
        }
        else
        {
            return this._checkVerification(rating);
        }
    },

    _checkVerification : function(rating)
    {
        this.rating = !rating ? this.NO_RATING : rating;
        var retVal = false;
        retVal = this._doVerificationCheck();

        if(retVal)
            this._showAgeVerificationCard();

        this.log("rewriteMetadataUrl: returning "+retVal);

        return retVal;
    },

    _verified : function(ttl)
    {
        this.log("_verified: "+this.rating);
        this.ageVerification.setRatingVerified(this.rating,this.ageVerification.VERIFIED, ttl);
        this.controller.hidePlayerCard("forms","tpAgeVerificationCard");
        this._returnControlToPlayer();
    },
    _unverified : function()
    {
        this.log("_unverified: "+this.rating);
        this.ageVerification.setRatingVerified(this.rating,this.ageVerification.UNVERIFIED);
        this.showCard(true,"tpAgeNotVerifiedCard", "forms", this.rating);
    },
    _returnControlToPlayer: function()
    {
        if (this._currentReleaseUrl)
        {
            var url = this._currentReleaseUrl;
            this._currentReleaseUrl = null;
            this.controller.setMetadataUrl(url);
        }
    },
    _doVerificationCheck : function()
    {
        return (this.ageVerification.verifyRating(this.rating) === this.ageVerification.VERIFICATION_NEEDED);
    },
    _showAgeVerificationCard: function()
    {
        var me = this;
        setTimeout(function() {
            me.showCard(true,"tpAgeVerificationCard", "forms", me.rating);
        },0);
    },
    _getRating : function(release, scheme)
    {
        if (!release.ratings) return null;
        var rating;
        for (var i = 0; i < release.ratings.length; i++)
        {
            rating = release.ratings[i];
            if(rating.scheme.toLowerCase() === scheme)
            {
                var rawRating = rating.rating;
                var returnedRating = rawRating;
                if(rawRating.indexOf(" ")) {
                    returnedRating = rawRating.split(" ")[0];
                }
                return returnedRating ? returnedRating.toLowerCase() : returnedRating;
            }
        }
        return null;
    },

    _loadReleaseForRating : function(url)
    {
        if (url.toLowerCase().indexOf("format=script") < 0)
        {
			// remove any existing format=...
			if (url.toLowerCase().match(/format=[^\&]+/)) {
				url = url.replace(/format=[^\&]+/i, "");
			}

			if (url.indexOf("?") >= 0) {
				url += "&format=Script";
			}
			else {
				url += "?format=Script";
			}
		}
		var me = this;
		var loader = new JSONLoader();
		loader.load(url, function(json) {me.selector(json);});
    },

    selector : function(json)
    {
        var rating = this._getRating(json, this.loadVarsParser.getScheme());

        if (!this._checkVerification(rating))
        {
            this._returnControlToPlayer();
        }
    },

    log : function(s) {
        tpDebug(s, "AgeVerificationState ("+this.controller.scopes.join(',')+")");
    }
});

$pdk.ns("$pdk.plugin.ratings.AgeVerificationVerifier");

$pdk.plugin.ratings.AgeVerificationVerifier = $pdk.extend(function() {}, {
	constructor: function(ratingsToVerify)
	{
		this._ratingsToVerify = ratingsToVerify; //sorted array of ratings
	},

    // rating String
    // cookieValue String
    // return Boolean false to make user verify their age, true if already verified or don't need to
	verifyRating : function(rating, cookieValue)
	{
        // ORDER IS VITAL on these conditions!
        var hasRatingsToVerify = (this._ratingsToVerify && this._ratingsToVerify.length > 0);

        if(rating == null || rating === "")
        {
            return true;  // rating is null, undefined or empty. no rating means no verification.
        }

		//NOT HANDLED HERE: If age verification is not enabled via "enableAgeVerification", do not prompt, allow playback
		//Otherwise, if "ratingsToVerify" is empty and there is a cookie on this machine whose name matches
		// the configured cookieName, with the value "verified", do not prompt, allow playback
		if(!hasRatingsToVerify && cookieValue === "verified")
		{
			return true;
		}
		//
		if(hasRatingsToVerify  && rating && this._ratingsToVerify.indexOf(rating) == -1)
		{
			return true; // we have a rating that is not in ratingsToVerify
		}

        if(cookieValue && cookieValue === "unverified") {
            return false;
        }

        if(hasRatingsToVerify && cookieValue && rating )
		{
            var cookieValueArray = [];

            if(typeof cookieValue == "string") {
                cookieValueArray = cookieValue.split(",");
            } else {
                cookieValueArray = cookieValue;
            }

			// Otherwise, if "ratingsToVerify", the cookie value, and the Media's Ratings Array are all not empty
			// and have at least one value in common to all three, then do not prompt, allow playback
			var intersect = this._ratingsToVerify.filter(function(n) {
				return cookieValueArray.indexOf(n) != -1;
			});
			// no intersection between cookieValue and ratingsToVerify
			if(intersect.length === 0) {
				return false;
			}
			if(intersect.indexOf(rating) != -1) {
				return true;
			}
			// Otherwise, if there is a value configured for "ratingsToVerify" and the Media's ratings do not
			// include any of the configured values or any values, do not prompt, allow playback
			// return true;
		}
		// Otherwise, prompt the user to verify their age
		return false;
	}
});/*
* Base Plugin
*/
$pdk.ns("$pdk.plugin.Ratings");
$pdk.plugin.Ratings = $pdk.extend(function(){},{
	constructor: function() {
        this.overlay = document.createElement("img");
        this.overlay.style.visibility = 'hidden';
        tpDebug("initially setting ratings img tag as hidden");
        this.libdir = "/js/libs/ratings/";
        this.libRatings = "ratingsLib.js";
        this.libAgeVerification = "ageVerificationLib.js";
	},

    initialize : function(lo)
    {
        this.lo = lo;
        this._ageVerification;
        this._clip;
        var me = this;
        this.controller = lo.controller;

        var loadVars = new $pdk.plugin.ratings.PluginLoadVars();
        loadVars.setLoadVars(lo.vars);
        if(loadVars.showRatings() !== null && loadVars.showRatings()) {
            tpLoadScript($pdk.scriptRoot+this.libdir+this.libRatings,function(){
                var ratings = new $pdk.plugin.ratings.Ratings();
                ratings.initialize(me.lo, me.overlay);
            });
        }
        if(loadVars.enableAgeVerification() !== null && loadVars.enableAgeVerification())
        {
                me._ageVerification = new $pdk.plugin.ratings.AgeVerificationState(me.lo.vars, me.lo.controller);
                me.lo.controller.registerMetadataUrlPlugIn(me,me.lo.type,me.lo.priority);
        }
    },
    rewriteMetadataUrl: function(url, isPreview)
    {
        var retVal = false;
        if(this._ageVerification && !isPreview)
        {
            retVal = this._ageVerification.rewriteMetadataUrl(url);
        }
        return retVal;
    }
});//
$pdk.ns("$pdk.plugin.ratings.PluginLoadVars");
$pdk.plugin.ratings.PluginLoadVars = $pdk.extend($pdk.plugin.ratings.LoadVarsManager, {

    constructor : function() {
        $pdk.plugin.ratings.PluginLoadVars.superclass.constructor.call(this);
    },

    initVars : function() {
        this.addVar({name: 'showRatings', value: true});
        this.addVar({name: 'enableAgeVerification', value: false});
    },

    showRatings : function() {
        return this.getVar('showRatings');
    },

    enableAgeVerification : function() {
        return this.getVar('enableAgeVerification');
    }

});


// RatingsPluginInit.js
// create an instance of the plugin and tell the controller we're ready.
// optionally you can pass a second param to add to the plugin's layer (any html element)
var _tprp = new $pdk.plugin.Ratings();
$pdk.controller.plugInLoaded(_tprp, _tprp.overlay);
