if($pdk.plugin==null){$pdk.ns("$pdk.plugin")
}if($pdk.plugin.ratings==null){$pdk.ns("$pdk.plugin.ratings")
}if(!$pdk.plugin.ratings.LoadVarsManager){$pdk.ns("$pdk.plugin.ratings.LoadVarsManager");
$pdk.plugin.ratings.LoadVarsManager=$pdk.extend(function(){},{constructor:function(){this._defaults=[]
},setLoadVars:function(a){this._vars=a;
this.initVars()
},initVars:function(){console.log("override in implementation")
},addVar:function(a){this._defaults.push(a)
},_getDefaultObj:function(a){var b,c;
for(b=0;
b<this._defaults.length;
b++){c=this._defaults[b];
if(c&&c.hasOwnProperty("name")&&c.name==a){return c
}}return null
},_getDefaultValue:function(a){var b=this._getDefaultObj(a);
if(b){return b.value
}return null
},_getTypedValue:function(b,a){if(!b){return a
}if(typeof a=="boolean"){return(b.toLowerCase()==="true")
}if(typeof a=="number"){return parseFloat(b,10)
}if(typeof a=="string"){return b
}if(Object.prototype.toString.call(a)==="[object Array]"){return b.split(",")
}if(Object.prototype.toString.call(a)==="[object Object]"){return b
}return null
},getVar:function(b){var c,a;
if(this._vars.hasOwnProperty(b)){c=this._vars[b]
}a=this._getDefaultValue(b);
return this._getTypedValue(c,a)
}})
}$pdk.ns("$pdk.plugin.ratings.AgeVerification");
$pdk.plugin.ratings.AgeVerification=$pdk.extend(function(){},{VERIFICATION_NEEDED:"verificationNeeded",VERIFICATION_NOT_NEEDED:"verificationNotNeeded",VERIFIED:"verified",UNVERIFIED:"unverified",DEFAULT_STYLES:"\n.tpAgeVerificationCard .tpMenuButtons .tpButton {width:100px;height:40px;}\n.tpPlayerCard.tpAgeVerificationCard{text-align:center;}",_stylesReady:false,_scopes:null,_loadvars:null,_initializationReadyCallback:null,constructor:function(b,a){this.log("AgeVerification is up");
this.verifiedCallback=b;
this.unverifiedCallback=a;
this.stylesReadyHandler(null)
},_applyDefaultStyles:function(){var d=this;
var e=jQuery;
e(function(){tpDebug("DOM ready hit!","AgeVerification(js)")
});
var b=e(".tpPdkStyles");
var c=null;
var a=false;
if(b!=null&&b.length>0&&b[0].tagName.toLowerCase()=="style"){c=e(b[0])
}if(c===null){a=true;
c=e("<style type='text/css' class='tpPdkStyles'>")
}if(a||c.html().indexOf("tpAgeVerificationCard")<0){this.log("adding styles to styles tag");
c.html(c.html()+this.DEFAULT_STYLES);
if(a){c.appendTo("head")
}setTimeout(function(f){d.stylesReadyHandler.apply(d,arguments)
},450)
}else{tpDebug("- styles and tag already existed, so triggering ready");
this.stylesReadyHandler()
}},stylesReadyHandler:function(a){this._stylesReady=true;
if(this._loadVars&&this._scopes){this._addCards()
}},initialize:function(a,b,c){this._scopes=b;
this._loadVars=a;
this._initializationReadyCallback=c;
this.loadVarsParser=new $pdk.plugin.ratings.AgeVerificationLoadVars();
this.loadVarsParser.setLoadVars(a);
this.log("ratingsToVerify: "+this.loadVarsParser.ratingsToVerify());
this.verify=new $pdk.plugin.ratings.AgeVerificationVerifier(this.loadVarsParser.ratingsToVerify());
this.log("minimumAge: "+this.loadVarsParser.minimumAge());
this.cookieName=this.loadVarsParser.cookieName();
this.log("cookieName: "+this.cookieName);
this.persister=new $pdk.plugin.ratings.AgeVerificationPersistence(this.cookieName,2592000);
if(this._stylesReady){this._addCards()
}},_addCards:function(){this.log("adding age verification cards from _addCards.");
var a=this;
$pdk.plugin.ratings.AgeVerificationCards.verification(function(b){a.verifiedCallback.apply(a,[b])
},function(){a.unverifiedCallback.apply(a)
},this.loadVarsParser.getCallbackName(),this._scopes);
$pdk.plugin.ratings.AgeVerificationCards.notVerifiedCard(this._scopes);
this._initializationReadyCallback()
},verifyRating:function(b){var a=this.verify.verifyRating(b,this.persister.get(this.cookieName));
return a?this.VERIFICATION_NOT_NEEDED:this.VERIFICATION_NEEDED
},getMinimumAge:function(){return this.loadVarsParser.minimumAge()
},setRatingVerified:function(d,c,a){if(c===this.VERIFIED){this.log("setting cookie for verified");
var b={ratingsToVerify:this.loadVarsParser.ratingsToVerify(),rating:d};
if(a!=null){b.expires=a!=0?parseInt(a/1000):0
}this.persister.set(this.cookieName,this.VERIFIED,b)
}else{this.log("setting cookie for Unverified");
this.persister.set(this.cookieName,this.UNVERIFIED)
}this.logCookie()
},log:function(a){tpDebug(a,"AgeVerification(js)")
},logCookie:function(){this.log(" -> cookie for key ("+this.cookieName+"): "+this.persister.get(this.cookieName))
}});
$pdk.ns("$pdk.plugin.ratings.AgeVerificationCards");
$pdk.plugin.ratings.AgeVerificationCards=(function(c,b){var a='<div class="tpPlayerCard tpResumePlaybackCard" id="tpAgeVerificationCard"><div class="tpResumePromptMessage">${message}</div><div class="tpMenuButtons"><a href="javascript:void(0)" class="tpButton tpVerify" tp:label="${verify}">${verify}</a><a href="javascript:void(0)" class="tpButton tpNoVerify" tp:label="${noverify}">${noverify}</a></div></div>';
var h=function(){this.verify=function(i){g(i)
};
this.noverify=function(){f()
};
this.addListeners=function(){var i=this;
c(i.initVars.card).find(".tpVerify").click(function(){i.verify()
});
c(i.initVars.card).find(".tpNoVerify").click(function(){i.noverify()
})
};
this.show=function(i){this.initVars=i;
i.card.presenter=this;
var j=this;
setTimeout(function(){j.addListeners()
},500)
};
this.hide=function(){tpDebug("tpAgeVerificationCard has been hidden");
if(d&&d.length>0&&typeof window[d]!="undefined"){window[d].apply(this,[this.initVars.card])
}}
};
var g;
var f;
var d;
var e='<div class="tpPlayerCard tpResumePlaybackCard" id="tpAgeNotVerifiedCard"><div class="tpResumePromptMessage">${message}</div></div>';
return{verification:function(l,k,i,j){g=l;
f=k;
d=i;
b.addPlayerCard("forms","tpAgeVerificationCard",a,"urn:theplatform:pdk:area:player",{verify:"Yes",noverify:"No",message:"This content, rated ${rating}, is for viewers ${age} or older. Are you of age?"},h,100,j)
},notVerifiedCard:function(i){b.addPlayerCard("forms","tpAgeNotVerifiedCard",e,"urn:theplatform:pdk:area:player",{message:"You are not verified."},null,100,i)
}}
})($pdk.jQuery,$pdk.controller);
$pdk.ns("$pdk.plugin.ratings.AgeVerificationLoadVars");
$pdk.plugin.ratings.AgeVerificationLoadVars=$pdk.extend($pdk.plugin.ratings.LoadVarsManager,{constructor:function(){$pdk.plugin.ratings.AgeVerificationLoadVars.superclass.constructor.call(this)
},initVars:function(){this.addVar({name:"ratingsToVerify",value:[]});
this.addVar({name:"minimumAge",value:18});
this.addVar({name:"cookieName",value:"pdk:ageverification"});
this.addVar({name:"scheme",value:"urn:v-chip"});
this.addVar({name:"callback",value:""})
},ratingsToVerify:function(){var d=this.getVar("ratingsToVerify");
var b=[];
for(var c=0,a=d.length;
c<a;
c++){b[c]=d[c].toLowerCase()
}return b
},minimumAge:function(){return this.getVar("minimumAge")
},cookieName:function(){return this.getVar("cookieName")
},getCallbackName:function(){return this.getVar("callback")
},getScheme:function(){var a=this._prependUrn(this.getVar("scheme").toLowerCase());
return a
},_prependUrn:function(a){if(!a.match(/^urn:/)){a="urn:"+a
}return a
}});
$pdk.ns("$pdk.plugin.ratings.AgeVerificationPersistence");
$pdk.plugin.ratings.AgeVerificationPersistence=$pdk.extend(function(){},{constructor:function(b,a){this._cookieName=b;
this._document=document;
this._keyReplacePattern=/[\s;,]/g;
this.defaults={path:"/",expires:a}
},get:function(a){if(this._cachedDocumentCookie!==this._document.cookie){this._renewCache()
}a=(a+"").replace(this._keyReplacePattern,"");
return this._cache[a]
},set:function(d,f,b){if(b){var g=b.ratingsToVerify?b.ratingsToVerify:null;
var e=b.rating?b.rating:null;
if(e&&g){var a=g.indexOf(e);
if(a>-1){var c=g.slice(a);
f=c.join(",")
}}}b=this._getExtendedOptions(b);
b.expires=this._getExpiresDate(f===undefined?-1:b.expires);
this._document.cookie=this._generateCookieString(d,f,b)
},_getExtendedOptions:function(a){return{path:a&&a.path||this.defaults.path,domain:a&&a.domain||this.defaults.domain,expires:a&&a.expires||this.defaults.expires,secure:a&&a.secure!==undefined?a.secure:this.defaults.secure}
},_generateCookieString:function(b,d,a){b=(b+"").replace(this._keyReplacePattern,"");
d=(d+"").replace(/[^!#$&-+\--:<-\[\]-~]/g,encodeURIComponent);
var c=b+"="+d;
c+=a.path?";path="+a.path:"";
c+=a.domain?";domain="+a.domain:"";
c+=a.expires?";expires="+a.expires.toUTCString():"";
c+=a.secure?";secure":"";
return c
},_getExpiresDate:function(a){var b=new Date();
switch(typeof a){case"number":a=new Date(b.getTime()+a*1000);
break;
case"string":a=new Date(a);
break
}if(a&&!this._isValidDate(a)){throw new Error("`expires` parameter cannot be converted to a valid Date instance")
}return a
},_isValidDate:function(a){return Object.prototype.toString.call(a)==="[object Date]"&&!isNaN(a.getTime())
},_getCookieObjectFromString:function(a){var c={};
var e=a?a.split("; "):[];
for(var b=0;
b<e.length;
b++){var d=this._getKeyValuePairFromCookieString(e[b]);
if(c[d.key]===undefined){c[d.key]=d.value
}}return c
},_getKeyValuePairFromCookieString:function(a){var b=a.indexOf("=");
b=b<0?a.length:b;
return{key:a.substr(0,b),value:decodeURIComponent(a.substr(b+1))}
},_renewCache:function(){this._cache=this._getCookieObjectFromString(this._document.cookie);
this._cachedDocumentCookie=this._document.cookie
}});
$pdk.ns("$pdk.plugin.ratings.AgeVerificationState");
$pdk.plugin.ratings.AgeVerificationState=$pdk.extend(function(){},{_currentReleaseUrl:null,_ageVerificationReady:false,_showCardData:null,NO_RATING:"no-rating",constructor:function(b,a){var c=this;
this.controller=a;
this.log("AgeVerificationState is up");
this.ageVerification=new $pdk.plugin.ratings.AgeVerification(function(d){c._verified.apply(c,[d])
},function(){c._unverified.apply(c)
});
this.ageVerification.initialize(b,this.controller.scopes,function(){c._handleAgeVerificationReady.apply(c,arguments)
});
this.loadVarsParser=new $pdk.plugin.ratings.AgeVerificationLoadVars();
this.loadVarsParser.setLoadVars(b)
},_handleAgeVerificationReady:function(){this._ageVerificationReady=true;
if(this._showCardData){this.showCard(this._showCardData.show,this._showCardData.cardId,this._showCardData.deckId,this._showCardData.rating);
this._showCardData=null
}},showCard:function(a,d,b,c){this.log("showCard("+a+")");
if(!this._ageVerificationReady){this._showCardData={show:a,cardId:d,deckId:b,rating:c};
this.log("- delaying showing of card. age ver not ready");
return
}if(a){this.log("calling showPlayerCard (card:"+d+", rating:"+c+")");
this.controller.showPlayerCard(b,d,null,{age:this.ageVerification.getMinimumAge(),rating:c})
}else{this.log("calling hidePlayerCard ("+d+")");
this.controller.hidePlayerCard(b,d)
}},rewriteMetadataUrl:function(b){var c;
var a=this.controller.callFunction("getCurrentRelease",[]);
if(a){c=this._getRating(a,this.loadVarsParser.getScheme())
}this._currentReleaseUrl=b;
if(!c){this._loadReleaseForRating(b);
return true
}else{return this._checkVerification(c)
}},_checkVerification:function(a){this.rating=!a?this.NO_RATING:a;
var b=false;
b=this._doVerificationCheck();
if(b){this._showAgeVerificationCard()
}this.log("rewriteMetadataUrl: returning "+b);
return b
},_verified:function(a){this.log("_verified: "+this.rating);
this.ageVerification.setRatingVerified(this.rating,this.ageVerification.VERIFIED,a);
this.controller.hidePlayerCard("forms","tpAgeVerificationCard");
this._returnControlToPlayer()
},_unverified:function(){this.log("_unverified: "+this.rating);
this.ageVerification.setRatingVerified(this.rating,this.ageVerification.UNVERIFIED);
this.showCard(true,"tpAgeNotVerifiedCard","forms",this.rating)
},_returnControlToPlayer:function(){if(this._currentReleaseUrl){var a=this._currentReleaseUrl;
this._currentReleaseUrl=null;
this.controller.setMetadataUrl(a)
}},_doVerificationCheck:function(){return(this.ageVerification.verifyRating(this.rating)===this.ageVerification.VERIFICATION_NEEDED)
},_showAgeVerificationCard:function(){var a=this;
setTimeout(function(){a.showCard(true,"tpAgeVerificationCard","forms",a.rating)
},0)
},_getRating:function(a,b){if(!a.ratings){return null
}var d;
for(var c=0;
c<a.ratings.length;
c++){d=a.ratings[c];
if(d.scheme.toLowerCase()===b){var e=d.rating;
var f=e;
if(e.indexOf(" ")){f=e.split(" ")[0]
}return f?f.toLowerCase():f
}}return null
},_loadReleaseForRating:function(b){if(b.toLowerCase().indexOf("format=script")<0){if(b.toLowerCase().match(/format=[^\&]+/)){b=b.replace(/format=[^\&]+/i,"")
}if(b.indexOf("?")>=0){b+="&format=Script"
}else{b+="?format=Script"
}}var c=this;
var a=new JSONLoader();
a.load(b,function(d){c.selector(d)
})
},selector:function(a){var b=this._getRating(a,this.loadVarsParser.getScheme());
if(!this._checkVerification(b)){this._returnControlToPlayer()
}},log:function(a){tpDebug(a,"AgeVerificationState ("+this.controller.scopes.join(",")+")")
}});
$pdk.ns("$pdk.plugin.ratings.AgeVerificationVerifier");
$pdk.plugin.ratings.AgeVerificationVerifier=$pdk.extend(function(){},{constructor:function(a){this._ratingsToVerify=a
},verifyRating:function(c,e){var d=(this._ratingsToVerify&&this._ratingsToVerify.length>0);
if(c==null||c===""){return true
}if(!d&&e==="verified"){return true
}if(d&&c&&this._ratingsToVerify.indexOf(c)==-1){return true
}if(e&&e==="unverified"){return false
}if(d&&e&&c){var b=[];
if(typeof e=="string"){b=e.split(",")
}else{b=e
}var a=this._ratingsToVerify.filter(function(f){return b.indexOf(f)!=-1
});
if(a.length===0){return false
}if(a.indexOf(c)!=-1){return true
}}return false
}});