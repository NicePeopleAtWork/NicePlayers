(function(){var a=false,b=/xyz/.test(function(){xyz
})?/\b_super\b/:/.*/;
this.Class=function(){};
Class.extend=function(g){var f=this.prototype;
a=true;
var e=new this();
a=false;
for(var d in g){e[d]=typeof g[d]=="function"&&typeof f[d]=="function"&&b.test(g[d])?(function(h,i){return function(){var k=this._super;
this._super=f[h];
var j=i.apply(this,arguments);
this._super=k;
return j
}
})(d,g[d]):g[d]
}function c(){if(!a&&this.init){this.init.apply(this,arguments)
}this.instanceOf=function(j){for(var i in j){if(typeof j[i]==="function"&&typeof this[i]!="function"){return false
}return true
}};
if(this["implements"]&&this["implements"].length>0){for(var h=0;
h<this["implements"].length;
h++){if(!this.instanceOf(this["implements"][h])){throw new Error("Interface not fully implemented")
}}}}c.prototype=e;
c.constructor=c;
c.extend=arguments.callee;
return c
}
})();
EventDispatcher=Class.extend({buildListenerChain:function(){if(!this.listenerChain){this.listenerChain={}
}},addEventListener:function(a,b){if(!b instanceof Function){throw {message:"Listener isn't a function"}
}this.buildListenerChain();
if(!this.listenerChain[a]){this.listenerChain[a]=[b]
}else{this.listenerChain[a].push(b)
}},hasEventListener:function(a){if(this.listenerChain){return(typeof this.listenerChain[a]!="undefined")
}else{return false
}},removeEventListener:function(b,c){if(!this.hasEventListener(b)){return false
}for(var a=0;
a<this.listenerChain[b].length;
a++){if(this.listenerChain[b][a]==c){this.listenerChain[b].splice(a,1)
}}},dispatchEvent:function(c,a){this.buildListenerChain();
if(!this.hasEventListener(c)){return false
}for(var b=0;
b<this.listenerChain[c].length;
b++){var d=this.listenerChain[c][b];
if(d.call){d.call(this,a)
}}}});
PDKComponent=Class.extend({_generateExportedMarkup:function(){return'<div id="'+this.id+'"></div>'
},write:function(){document.write(this._generateExportedMarkup(this.id));
try{var a=document.getElementById(this.id);
return this._bindElement(a)
}catch(b){}},bind:function(d){try{var c=document.getElementById(d);
c.innerHTML=this._generateExportedMarkup();
var a=document.getElementById(this.id);
return this._bindElement(a)
}catch(b){}},_bindElement:function(a){return this.container=a
},init:function(){},doPluginStuff:function(){this.pluginManager=new PlugInManager(this.controller);
for(prop in this){if(!prop.toLowerCase().match(/plugin|wrapper/)){continue
}var o=this[prop];
if(typeof o!="string"){continue
}var d;
if(prop.toLowerCase().indexOf("plugin")==0){d=prop.substr(6)
}else{if(prop.toLowerCase().indexOf("wrapper")==0){d=prop.substr(7)
}}var m;
var n=Number.MAX_VALUE;
var a;
var k;
var f;
var g;
var j=new Object();
var c=o.split("|");
for(var h=0;
h<c.length;
h++){var e=c[h];
if(e.indexOf("=")==-1){continue
}var b=[e.substr(0,e.indexOf("=")),e.substr(e.indexOf("=")+1)];
var l=b[0];
var p=b[1];
p=unescape(p);
switch(l.toLowerCase()){case"type":m=p;
break;
case"priority":n=parseInt(p);
break;
case"url":a=p;
break;
case"suburl":k=p;
break;
case"runtime":f=p;
break;
case"videolayer":g=p;
break;
default:j[l]=p;
break
}}if(!a){return null
}this.pluginManager.addPlugIn(d,m,n,a,k,j,null,f,g)
}this.pluginManager.ready()
},ready:function(){this.controller.registerFunction("getComponentSize",this,this.getComponentSize);
this.controller.registerFunction("addChild",this,this.addChild);
var a=this;
tpTime("Component.ready until doPluginStuff timeout");
setTimeout(function(){tpTimeEnd("Component.ready until doPluginStuff timeout");
a.doPluginStuff()
},0)
},getComponentSize:function(){return{width:this.container.offsetWidth,height:this.container.offsetHeight,id:this.id}
},addChild:function(a){if(this.pluginLayer){this.pluginLayer.appendChild(a)
}else{if(this.container){this.container.appendChild(a)
}}},addPlugIn:function(h,c,b,a,g,f,e){if(!this.plugins){this.plugins=new Array()
}var d={id:h,type:c,priority:b,url:a,subUrl:g,vars:f,plugIn:e};
this.pluginManager.addPlugIn(d)
}});
oldController=EventDispatcher.extend({init:function(){this.functions=new Object();
this.objects=new Object();
this.pluginQueue=new Array();
this.pluginScopes=new Array();
this.waitingForPlugIn=false
},trace:function(c,b,d){var a=$pdk.debug.trace(c,this.widgetId,b,d)||new Date();
this.dispatchEvent("OnPdkTrace",{message:c,timestamp:(a.valueOf()),controllerId:this.widgetId,className:b,level:d})
},dispatchEvent:function(b,a){this._super(b,{type:b,data:a})
},doDispatchEvent:function(a){this.dispatchEvent(a.type,a.data)
},removeEventListener:function(a,b){this._super(a,b)
},addEventListener:function(a,b){this._super(a,b)
},loadPlugIn:function(b,a){b.controller=a;
this.pluginQueue.push(b);
this.pluginScopes.push(a.componentId);
if(this.waitingForPlugIn){return
}this.loadNextPlugIn()
},loadNextPlugIn:function(){if(this._pluginTimeout){clearTimeout(this._pluginTimeout);
this._pluginTimeout=undefined
}this.currentPlugIn=this.pluginQueue.shift();
if(!this.queuedControllers){this.queuedControllers=[]
}if(this.currentPlugIn){this.waitingForPlugIn=true;
tpDebug("Trying to load plugin at "+this.currentPlugIn.url);
var b=document.getElementsByTagName("head")[0];
var c=document.createElement("script");
c.type="text/javascript";
c.onerror=function(){e.loadNextPlugIn()
};
c.src=this.currentPlugIn.url;
var e=this;
b.appendChild(c);
this._pluginTimeout=setTimeout(function(){e.loadNextPlugIn()
},5000)
}else{var d=0;
var a=this.queuedControllers.length;
for(;
d<a;
d++){this.queuedControllers[d].dispatchEvent("OnPlugInsComplete",null,this.pluginScopes)
}this.dispatchEvent("OnPlugInsComplete",null,this.pluginScopes);
if(tpController){tpController.ready()
}var d=0;
for(;
d<a;
d++){this.queuedControllers[d].initializePlayback()
}var e=this;
setTimeout(function(){e.initializePlayback()
},1)
}},addChild:function(b,a){return this.callFunction("addChild",[b],a)
},plugInLoaded:function(c,d){if(!this.queuedControllers){this.queuedControllers=[]
}var b=false;
for(var a in this.queuedControllers){if(this.currentPlugIn.controller.id==a.id){b=true;
break
}}if(b){this.queuedControllers.push(this.currentPlugIn.controller)
}c.initialize({controller:this.currentPlugIn.controller,vars:this.currentPlugIn.vars,priority:this.currentPlugIn.priority});
if(d){this.addChild(d,[this.currentPlugIn.controller.componentId])
}this.dispatchEvent("OnPlugInLoaded",c,[this.currentPlugIn.controller.componentId]);
this.waitingForPlugIn=false;
this.loadNextPlugIn()
},clickPlayButton:function(a){return this.callFunction("clickPlayButton",[],a)
},clickPlayButtonNative:function(a){return this.callFunction("clickPlayButtonNative",[],a)
},doParsePlaylist:function(a,c,b){return this.callFunction("doParsePlaylist",[a,c],b)
},firstRange:function(b,a){this.callFunction("firstRange",[b],a)
},getCurrentRange:function(a){this.callFunction("getCurrentRange",[],a)
},getRelease:function(a,c,b){return this.callFunction("getRelease",[a,c],b)
},getSubtitleLanguage:function(a,b){this.callFunction("getSubtitleLanguage",[a],b)
},getSubtitleStyle:function(a){this.callFunction("getSubtitleStyle",[],a)
},loadRelease:function(a,b,c){a=this.modRelease(a);
return this.callFunction("loadRelease",[a,b],c)
},loadReleaseURL:function(a,b,c){return this.callFunction("loadReleaseURL",[a,b],c)
},loadReleaseURLNative:function(a,b,c){return this.callFunction("loadReleaseURLNative",[a,b],c)
},parseRelease:function(c,a,b,d){return this.callFunction("parseRelease",[c,a,b],d)
},loadJSON:function(a,d,b,c){return this.callFunction("loadJSON",[a,d,b],c)
},supportsFullScreen:function(a){return this.callFunction("supportsFullScreen",[],a)
},supportsFastForward:function(a){return this.callFunction("supportsFastForward",[],a)
},supportsSeek:function(a){return this.callFunction("supportsSeek",[],a)
},supportsMute:function(a){return this.callFunction("supportsMute",[],a)
},supportsVolume:function(a){return this.callFunction("supportsVolume",[],a)
},mute:function(b,a){return this.callFunction("mute",[b],a)
},setVolume:function(b,a){return this.callFunction("setVolume",[b],a)
},setPlaybackRate:function(b,a){return this.callFunction("setPlaybackRate",[b],a)
},nextClip:function(a){return this.callFunction("nextClip",[],a)
},nextRange:function(b,a){this.callFunction("nextRange",[b],a)
},tryWritePlayer:function(a){return this.callFunction("tryWritePlayer",[],a)
},pause:function(c,a,b){return this.callFunction("pause",[c,b],a)
},pauseNative:function(b,a){return this.callFunction("pauseNative",[b],a)
},playNext:function(c,a,b){return this.callFunction("playNext",[c,a],b)
},playPrevious:function(b,a){this.callFunction("playPrevious",[b],a)
},sendError:function(a,b){this.callFunction("sendError",[a],b)
},previousClip:function(a){return this.callFunction("previousClip",[],a)
},previousRange:function(b,a){this.callFunction("previousRange",[b],a)
},refreshReleaseModel:function(a,i,c,d,b,g,h,e,f){if(c){c.globalDataType=this.getDataTypeName("Sort")
}if(d){d.globalDataType=this.getDataTypeName("Range")
}return this.callFunction("refreshReleaseModel",[a,i,c,d,b,g,e,f],h)
},setAudioTrackByIndex:function(a,b){this.callFunction("setAudioTrackByIndex",[a],b)
},setAudioTrackByLanguage:function(b,a){this.callFunction("setAudioTrackByLanguage",[b],a)
},seekToPercentage:function(a,b){return this.callFunction("seekToPercentage",[a],b)
},seekToPosition:function(a,b){return this.callFunction("seekToPosition",[a],b)
},playPlaylist:function(b,a){return this.callFunction("playPlaylist",[b],a)
},setRelease:function(a,b,c){a=this.modRelease(a);
return this.callFunction("setRelease",[a,b],c)
},setReleaseURL:function(a,b,c){return this.callFunction("setReleaseURL",[a,b],c)
},setReleaseURLNative:function(a,b,c){return this.callFunction("setReleaseURLNative",[a,b],c)
},setShowSubtitles:function(a,b){this.callFunction("setShowSubtitles",[a],b)
},setSmil:function(a,b){this.callFunction("setSmil",[a],b)
},setSubtitleLanguage:function(b,a){this.callFunction("setSubtitleLanguage",[b],a)
},setSubtitleStyle:function(b,a){this.callFunction("setSubtitleStyle",[b],a)
},setToken:function(a,c,b){this.callFunction("setToken",[a,c],b)
},showFullScreen:function(b,a){return this.callFunction("showFullScreen",[b],a)
},endRelease:function(a){return this.callFunction("endRelease",[],a)
},getMediaArea:function(){var a=null;
return this.callFunction("getMediaArea",[],a)
},setMediaArea:function(b,a){this.callFunction("setMediaArea",[b],a)
},getOverlayArea:function(d,a,c,b){return this.callFunction("getOverlayArea",[d,a,c],b)
},getContentArea:function(a){return this.callFunction("getOverlayArea",[],a)
},setOverlayArea:function(b,a){this.callFunction("setOverlayArea",[b],a)
},getReleaseState:function(){return this.callFunction("getReleaseState",[])
},getTimeSinceLastAd:function(a){return this.callFunction("getTimeSinceLastAd",[],a)
},injectPlaylist:function(b,a){return this.callFunction("injectPlaylist",[b],a)
},insertPlaylist:function(b,a){return this.callFunction("insertPlaylist",[b],a)
},insertClip:function(b,a){return this.callFunction("insertClip",[b],a)
},registerAdPlugIn:function(b){var a=null;
return this.callFunction("registerAdPlugIn",[b],a)
},registerClipWrapperPlugIn:function(b){var a=null;
return this.callFunction("registerClipWrapperPlugIn",[b],a)
},registerMetadataUrlPlugIn:function(c,a,b){return this.callFunction("registerMetadataUrlPlugIn",[c,a],b)
},registerURLPlugIn:function(d,c,a){var b=null;
return this.callFunction("registerURLPlugIn",[d,c,a],b)
},setAds:function(b,a){return this.callFunction("setAds",[b],a)
},addPlayerCard:function(d,h,b,g,a,f,c,e){this.callFunction("addPlayerCard",[d,h,b,g,a,f,c,e],e)
},showPlayerCard:function(b,e,a,d,c){return this.callFunction("showPlayerCard",[b,e,a,d],c)
},hidePlayerCard:function(a,c,b){this.callFunction("hidePlayerCard",[a,c],b)
},showMenuCard:function(a,b){return this.callFunction("showMenuCard",[a],b)
},checkIfEndCardExists:function(a){return this.callFunction("checkIfEndCardExists",[],a)
},setClip:function(b){var a=null;
return this.callFunction("setClip",[b],a)
},setMetadataUrl:function(a,b){return this.callFunction("setMetadataUrl",[a],b)
},setPlayerLayoutUrl:function(a,b){return this.callFunction("setPlayerLayoutUrl",[a],b)
},setPlayerLayoutXml:function(a,b){return this.callFunction("setPlayerLayoutXml",[a],b)
},setClipWrapper:function(a,b){return this.callFunction("setClipWrapper",[a],b)
},wrapClip:function(c,b,a){return this.callFunction("wrapClip",[c,b],a)
},initializePlayback:function(a){return this.callFunction("initializePlayback",[],a)
},getPlaybackRate:function(){return this.callFunction("getPlaybackRate",[],scope)
},endMedia:function(a,b){return this.callFunction("endMedia",[a,b])
},getVideoProxy:function(a){return this.callFunction("getVideoProxy",[],a)
},isFlashPlayer:function(b){var a=this.callFunction("isFlashPlayer",[],b);
if(a===undefined){return true
}else{return a
}},isStandbyMode:function(){return this.callFunction("isStandbyMode",[])
},isPrefetch:function(){return this.callFunction("isPrefetch",[])
},markOffset:function(c,a,b){return this.callFunction("markOffset",[c,a,b])
},resetRelease:function(a){return this.callFunction("resetRelease",[],a)
},updateMediaTime:function(a,b){this.callFunction("updateMediaTime",[a],b)
},updateClip:function(b,a){this.callFunction("updateClip",[b],a)
},updatePlaylist:function(b,a){this.callFunction("updatePlaylist",[b],a)
},writePlayer:function(b,a,c){return this.callFunction("writePlayer",[b,a],c)
},setShowControls:function(b,c,a){this.callFunction("setShowControls",[b,c],a)
},getDataTypeName:function(a){switch(a){case"AdPattern":return"com.theplatform.pdk.data::AdPattern";
case"Banner":return"com.theplatform.pdk.data::Banner";
case"BaseClip":return"com.theplatform.pdk.data::BaseClip";
case"CallInfo":return"com.theplatform.pdk.communication::CallInfo";
case"CategoryInfo":return"com.theplatform.pdk.data::CategoryInfo";
case"Clip":return"com.theplatform.pdk.data::Clip";
case"CommInfo":return"com.theplatform.pdk.communication::CommInfo";
case"CustomData":return"com.theplatform.pdk.data::CustomData";
case"CustomValue":return"com.theplatform.pdk.data::CustomValue";
case"DispatchInfo":return"com.theplatform.pdk.communication::DispatchInfo";
case"FunctionInfo":return"com.theplatform.pdk.communication::FunctionInfo";
case"HandlerInfo":return"com.theplatform.pdk.communication::HandlerInfo";
case"HyperLink":return"com.theplatform.pdk.data::HyperLink";
case"MediaClick":return"com.theplatform.pdk.data::MediaClick";
case"MediaFile":return"com.theplatform.pdk.data::MediaFile";
case"MessageInfo":return"com.theplatform.pdk.communication::MessageInfo";
case"MetricInfo":return"com.theplatform.pdk.data::MetricInfo";
case"Overlay":return"com.theplatform.pdk.data::Overlay";
case"PdkEvent":return"com.theplatform.pdk.events::PdkEvent";
case"ProviderInfo":return"com.theplatform.pdk.data::ProviderInfo";
case"Range":return"com.theplatform.pdk.data::Range";
case"Rating":return"com.theplatform.pdk.data::Rating";
case"Release":return"com.theplatform.pdk.data::Release";
case"ReleaseInfo":return"com.theplatform.pdk.data::ReleaseInfo";
case"ScopeInfo":return"com.theplatform.pdk.communication::ScopeInfo";
case"Sort":return"com.theplatform.pdk.data::Sort";
case"Subtitles":return"com.theplatform.pdk.data::Subtitles";
case"TrackingUrl":return"com.theplatform.pdk.data::TrackingUrl";
case"BandwidthPreferences":return"com.theplatform.pdk.data::BandwidthPreferences";
case"Annotation":return"com.theplatform.pdk.data::Annotation"
}},ready:function(){this.isHTML5Loading=false;
this.checkMessageQueue()
},callFunction:function(b,e,c,d){if(c==null&&this.scopes!=undefined){c=this.scopes.concat()
}var a=this.functions[b];
if(a){return this.functions[b].apply(this.objects[b],e)
}else{if(tpController&&!d){return tpController.callFunction(b,e,c)
}else{return null
}}},doCallFunction:function(a){this.callFunction(a.name,a.args,a.scope)
},registerFunction:function(b,a,d){var c=this.functions[b]===undefined;
this.functions[b]=d;
this.objects[b]=a;
if(tpController){tpController.registerFunction(b,function(){return d.apply(a,arguments)
},(this.scopes?this.scopes.concat():undefined),c)
}},modRelease:function(a){if(a){a.globalDataType=this.getDataTypeName("Release");
if(a.categories){a.categories=this.modCategories(a.categories)
}if(a.thumbnails){for(var b=0;
b<a.thumbnails.length;
b++){a.thumbnails[b].globalDataType=this.getDataTypeName("MediaFile");
if(a.thumbnails[b].customValues){a.thumbnails[b].customValues=this.modCustomValues(a.thumbnails[b].customValues)
}}}if(a.customValues){a.customValues=this.modCustomValues(a.customValues)
}if(a.metrics){for(var b=0;
b<a.metrics.length;
b++){a.metrics[b].globalDataType=this.getDataTypeName("MetricInfo")
}}if(a.provider){a.provider.globalDataType=this.getDataTypeName("ProviderInfo");
if(a.provider.customValues){a.provider.customValues=this.modCustomValues(a.provider.customValues)
}}if(a.ratings){for(var b=0;
b<a.ratings.length;
b++){a.ratings[b].globalDataType=this.getDataTypeName("Rating")
}}if(a.URL){a.url=a.URL
}a.mediaPID=a.mediaPid?a.mediaPid:"";
delete a.mediaPid
}return a
},modCustomValues:function(a){for(var b=0;
b<a.length;
b++){a[b].globalDataType=this.getDataTypeName("CustomValue")
}return a
},modCategories:function(a){for(var b=0;
b<a.length;
b++){a[b].globalDataType=this.getDataTypeName("CategoryInfo")
}return a
},modClip:function(a){if(a){a.globalDataType=this.getDataTypeName("Clip");
var b=a.baseClip;
if(!b){b=new Object()
}if(a.banners){b.banners=a.banners
}if(a.overlays){b.overlays=a.overlays
}a.baseClip=this.modBaseClip(b);
if(a.chapter){a.chapter.globalDataType=this.getDataTypeName("Chapter")
}}return a
},modBaseClip:function(b){if(!b){b=new Object()
}b.globalDataType=this.getDataTypeName("BaseClip");
if(b.moreInfo){b.moreInfo.globalDataType=this.getDataTypeName("HyperLink");
if(b.moreInfo.clickTrackingUrls){b.moreInfo.clickTrackingUrls=this.modTracking(b.moreInfo.clickTrackingUrls)
}}if(b.banners){for(var a=0;
a<b.banners.length;
a++){b.banners[a].globalDataType=this.getDataTypeName("Banner");
if(b.banners[a].clickTrackingUrls){b.banners[a].clickTrackingUrls=this.modTracking(b.banners[a].clickTrackingUrls)
}}}if(b.overlays){for(var a=0;
a<b.overlays.length;
a++){b.overlays[a].globalDataType=this.getDataTypeName("Overlay");
if(b.overlays[a].clickTrackingUrls){b.overlays[a].clickTrackingUrls=this.modTracking(b.overlays[a].clickTrackingUrls)
}}}if(b.availableSubtitles){for(var a=0;
a<b.availableSubtitles;
a++){b.availableSubtitles[a].globalDataType=this.getDataTypeName("Subtitles")
}}if(b.categories){b.categories=this.modCategories(b.categories)
}if(b.adPattern){b.adPattern.globalDataType=this.getDataTypeName("AdPattern")
}if(b.trackingURLs){b.trackingURLs=this.modTracking(b.trackingURLs)
}if(b.contentCustomData){b.contentCustomData.globalDataType=this.getDataTypeName("CustomData")
}if(b.ownerCustomData){b.ownerCustomData.globalDataType=this.getDataTypeName("CustomData")
}if(b.outletCustomData){b.outletCustomData.globalDataType=this.getDataTypeName("CustomData")
}return b
},modTracking:function(a){for(var b=0;
b<a.length;
b++){a.globalDataType=this.getDataTypeName("TrackingUrl")
}return a
}});
if(window.tpController===undefined){tpController=new oldController()
}else{var tempController=tpController;
tpController=new oldController();
for(var prop in tempController){tpController[prop]=tempController[prop]
}if(window["$pdk"]!==undefined){$pdk.controller=tpController
}}ComponentController=oldController.extend({init:function(c,a,b){this.id=c;
this.component=a;
this.widgetId=this.component&&this.component.widgetId?this.component.widgetId:this.id;
if(typeof(b)==="object"){this.scopes=[c].concat(b)
}else{if(typeof(b)==="string"){this.scopes=[c,b]
}else{this.scopes=[c,"default"]
}}this._super()
},getComponentSize:function(a){return this.callFunction("getComponentSize",[],a)
},dispatchEvent:function(b,a){if(this.scopes&&this.scopes.length){tpController.dispatchEvent(b,a,this.scopes.concat(),this.widgetId)
}else{tpController.dispatchEvent(b,a,null,this.widgetId)
}},removeEventListener:function(a,b){if(this.scopes&&this.scopes.length){tpController.removeEventListener(a,b,this.scopes.concat())
}else{tpController.removeEventListener(a,b)
}},addEventListener:function(a,b){if(this.scopes&&this.scopes.length){tpController.addEventListener(a,b,this.scopes.concat())
}else{tpController.addEventListener(a,b)
}},getProperty:function(b){var a=this.component[b];
if(a===undefined){a=this.component[b.toLowerCase()]
}return a
},setProperty:function(a,b){this.component[a]=b
}});
function printStackTrace(){var k=[];
var c=false;
try{d.dont.exist+=0
}catch(g){if(g.stack){var l=g.stack.split("\n");
for(var d=0,f=l.length;
d<f;
d++){if(l[d].match(/^\s*[A-Za-z0-9\-_\$]+\(/)){k.push(l[d])
}}k.shift();
c=true
}else{if(window.opera&&g.message){var l=g.message.split("\n");
for(var d=0,f=l.length;
d<f;
d++){if(l[d].match(/^\s*[A-Za-z0-9\-_\$]+\(/)){var j=l[d];
if(l[d+1]){j+="at"+l[d+1];
d++
}k.push(j)
}}k.shift();
c=true
}}}if(!c){var b=arguments.callee.caller;
while(b){var h=b.toString();
var a=h.substring(h.indexOf("function")+8,h.indexOf("("))||"anonymous";
k.push(a);
b=b.caller
}}output(k)
}function output(a){alert(a.join("\n\n"))
}ViewController=ComponentController.extend({init:function(b,c,a){this._super(c,a)
},instantiateCard:function(a){return this.callFunction("instantiateCard",[a])
},showCard:function(c,e,f,b,d,a){this.callFunction("showCard",[c,e,f,b,d,a])
},hideCard:function(a,b){this.callFunction("hideCard",[a,b])
},getCard:function(a,b){return this.callFunction("getCard",[a,b])
},getCurrentCard:function(a){return this.callFunction("getCurrentCard",[a])
}});
PlayerController=ViewController.extend({init:function(b,a){this._super("player",b,a)
},getCurrentPlaylist:function(){return this.callFunction("getCurrentPlaylist",[])
},getMainPlaylist:function(){return this.callFunction("getMainPlaylist",[])
},getReleaseState:function(){return this.callFunction("getReleaseState",[])
},getMuteState:function(){return this.callFunction("getMuteState",[])
},getFullScreenState:function(){return this.callFunction("getFullScreenState",[])
},registerPlaylistPlugIn:function(b,a){var a=null;
return this.callFunction("registerPlaylistPlugIn",[b],a)
},playlistReplaced:function(b,a){return this.callFunction("playlistReplaced",[b],a)
},loadLayer:function(b,c,a){return this.callFunction("loadLayer",[b,c,a])
},hasLayer:function(a,b){return this.callFunction("hasLayer",[a,b])
},callLayerFunction:function(c,a,b){return this.callFunction("callLayerFunction",[c,a,b])
}});
var PlayerEvent=new Object();
PlayerEvent.OnUpdateOverlays="OnUpdateOverlays";
PlayerEvent.OnCheckAdFailed="OnCheckAdFailed";
PlayerEvent.OnStandbyRelease="OnStandbyRelease";
PlayerEvent.OnMediaAreaChanged="OnMediaAreaChanged";
PlayerEvent.onContentAreaChanged="onContentAreaChanged";
PlayerEvent.OnOverlayAreaChanged="OnOverlayAreaChanged";
PlayerEvent.OnReleaseStop="OnReleaseStop";
PlayerEvent.OnBandwidthPreferencesSet="OnBandwidthPreferencesSet";
PlayerEvent.OnFormShown="OnFormShown";
PlayerEvent.OnFlashFullScreen="OnPlayerFullScreen";
PlayerEvent.OnExternalFullScreen="OnExternalFullScreen";
PlayerEvent.OnPlayerPause="OnPlayerPause";
PlayerEvent.OnPlayerUnPause="OnPlayerUnPause";
PlayerEvent.OnNetConnectionClosed="OnNetConnectionClosed";
PlayerEvent.OnTrackActivated="OnTrackActivated";
PlayerEvent.OnPlugInsAboveControlsChanged="OnPlugInsAboveControlsChanged";
PlayerEvent.OnDebug="OnDebug";
PlayerEvent.OnVideoSized="OnVideoSized";
PlayerEvent.OnRelatedContentIdsReceived="OnRelatedContentIdsReceived";
if($pdk.bootloaderVersion!==null&&typeof($pdk.bootloaderVersion)==="object"){if("5"!=$pdk.bootloaderVersion.major||"6"!=$pdk.bootloaderVersion.minor||"18"!=$pdk.bootloaderVersion.revision){alert("Error: Bootloader Version and PDK-JS Version do not match.\n\nSomething is seriously wrong.")
}}var PdkFunctions=new Object();
PdkFunctions.getCommandChain="getCommandChain";
PdkFunctions.insertCommand="insertCommand";
PdkFunctions.setRelease="setRelease";
PdkFunctions.setReleaseURL="setReleaseURL";
PdkFunctions.loadRelease="loadRelease";
PdkFunctions.loadReleaseURL="loadReleaseURL";
PdkFunctions.fetchReleaseData="fetchReleaseData";
PdkFunctions.loadSmil="loadSmil";
PdkFunctions.setSmil="setSmil";
PdkFunctions.resetPlayer="resetPlayer";
PdkFunctions.setCurrentReleaseList="setCurrentReleaseList";
PdkFunctions.nextClip="nextClip";
PdkFunctions.previousClip="previousClip";
PdkFunctions.seekToPosition="seekToPosition";
PdkFunctions.seekToPercentage="seekToPercentage";
PdkFunctions.pause="pause";
PdkFunctions.mute="mute";
PdkFunctions.setVolume="setVolume";
PdkFunctions.setPlaybackRate="setPlaybackRate";
PdkFunctions.setPlayerMessage="setPlayerMessage";
PdkFunctions.clearPlayerMessage="clearPlayerMessage";
PdkFunctions.disablePlayerControls="disablePlayerControls";
PdkFunctions.setPreviewImageUrl="setPreviewImageUrl";
PdkFunctions.showFullScreen="showFullScreen";
PdkFunctions.showEmailForm="showEmailForm";
PdkFunctions.showLinkForm="showLinkForm";
PdkFunctions.getSubtitleLanguage="getSubtitleLanguage";
PdkFunctions.setSubtitleLanguage="setSubtitleLanguage";
PdkFunctions.useDefaultEmailForm="useDefaultEmailForm";
PdkFunctions.submitForm="submitForm";
PdkFunctions.setFormSubmission="setFormSubmission";
PdkFunctions.useDefaultLinkForm="useDefaultLinkForm";
PdkFunctions.getPlayerVariables="getPlayerVariables";
PdkFunctions.useDefaultPlayOverlay="useDefaultPlayOverlay";
PdkFunctions.getUseDefaultPlayOverlay="getUseDefaultPlayOverlay";
PdkFunctions.showPlayOverlay="showPlayOverlay";
PdkFunctions.clickPlayButton="clickPlayButton";
PdkFunctions.clearAdCookie="clearAdCookie";
PdkFunctions.hidePlayerRegions="hidePlayerRegions";
PdkFunctions.setBandwidthPreferences="setBandwidthPreferences";
PdkFunctions.getBandwidthPreferences="getBandwidthPreferences";
PdkFunctions.setVideoScalingMethod="setVideoScalingMethod";
PdkFunctions.setExpandVideo="setExpandVideo";
PdkFunctions.showPlayerCard="showPlayerCard";
PdkFunctions.hidePlayerCard="hidePlayerCard";
PdkFunctions.registerControlPlugIn="registerControlPlugIn";
PdkFunctions.registerViewFactory="registerViewFactory";
PdkFunctions.createConcreteControl="createConcreteControl";
PdkFunctions.refreshCategoryModel="refreshCategoryModel";
PdkFunctions.clearCategorySelection="clearCategorySelection";
PdkFunctions.refreshReleaseModel="refreshReleaseModel";
PdkFunctions.setClipInfo="setClipInfo";
PdkFunctions.nextRange="nextRange";
PdkFunctions.previousRange="previousRange";
PdkFunctions.firstRange="firstRange";
PdkFunctions.playPrevious="playPrevious";
PdkFunctions.playNext="playNext";
PdkFunctions.suspendPlayAll="suspendPlayAll";
PdkFunctions.loadSkin="loadSkin";
PdkFunctions.getAsset="getAsset";
PdkFunctions.getImageAsset="getImageAsset";
PdkFunctions.getFont="getFont";
PdkFunctions.getTextFormat="getTextFormat";
PdkFunctions.getTextFieldAttributes="getTextFieldAttributes";
PdkFunctions.getDefaultStyles="getDefaultStyles";
PdkFunctions.getSkinProperties="getSkinProperties";
PdkFunctions.getComponentSize="getComponentSize";
PdkFunctions.localToGlobal="localToGlobal";
PdkFunctions.globalToLocal="globalToLocal";
PdkFunctions.colorizeAsset="colorizeAsset";
PdkFunctions.setColor="setColor";
PdkFunctions.getBackgroundPadding="getBackgroundPadding";
PdkFunctions.getStage="getStage";
PdkFunctions.getImageLoaderAsset="getImageLoaderAsset";
PdkFunctions.createITextField="createITextField";
PdkFunctions.createILabel="createILabel";
PdkFunctions.registerMetadataUrlPlugIn="registerMetadataUrlPlugIn";
PdkFunctions.processMetadataUrl="processMetadataUrl";
PdkFunctions.setMetadataUrl="setMetadataUrl";
PdkFunctions.instantiateCard="instantiateCard";
PdkFunctions.addCard="addCard";
PdkFunctions.showCard="showCard";
PdkFunctions.hideCard="hideCard";
PdkFunctions.getCard="getCard";
PdkFunctions.getCurrentCard="getCurrentCard";
PdkFunctions.addMediator="addMediator";
PdkFunctions.addItem="addItem";
PdkFunctions.getMediator="getMediator";
PdkFunctions.getItem="getItem";
PdkFunctions.setDefaultFont="setDefaultFont";
PdkFunctions.registerTextField="registerTextField";
PdkFunctions.setText="setText";
PdkFunctions.setHtmlText="setHtmlText";
PdkFunctions.getColorFromString="getColorFromString";
PdkFunctions.setDefaultStyle="setDefaultStyle";
PdkFunctions.setPreferredStyle="setPreferredStyle";
PdkFunctions.setFont="setFont";
PdkFunctions.setStyleParameter="setStyleParameter";
PdkFunctions.showTooltip="showTooltip";
PdkFunctions.registerCompanionAdPlugIn="registerCompanionAdPlugIn";
PdkFunctions.setCompanionAd="setCompanionAd";
PdkFunctions.getAnimationManager="getAnimationManager";
ComponentTypes=new Object();
ComponentTypes.CATEGORY_LIST="categoryList";
ComponentTypes.CATEGORY_MODEL="categoryModel";
ComponentTypes.CLIP_INFO="clipInfo";
ComponentTypes.COMM_MANAGER="commManager";
ComponentTypes.HEADER="header";
ComponentTypes.JAVASCRIPT="javascript";
ComponentTypes.NAVIGATION="navigation";
ComponentTypes.PLAYER="player";
ComponentTypes.RELEASE_LIST="releaseList";
ComponentTypes.RELEASE_MODEL="releaseModel";
ComponentTypes.SEARCH="search";
ComponentTypes.EXTERNAL="external";
ComponentTypes.LOCAL_ALL="localAll";
ComponentTypes.GLOBAL_ALL="globalAll";
Rectangle=Class.extend({init:function(b,d,c,a){this._x=b?b:0;
this._y=d?d:0;
this._width=c?c:0;
this._height=a?a:0;
this._top=this._y;
this._bottom=this._y+this._height;
this._left=this._x;
this._right=this._x+this._width
},clone:function(){return new Rectangle(this._x,this._y,this._width,this._height)
},x:function(a){if(a!=undefined){if(a<0){a=0
}this._x=a;
this._left=a;
this._right=a+this._width
}return this._x
},y:function(a){if(a!=undefined){if(a<0){a=0
}this._y=a;
this._top=a;
this._bottom=a+this._height
}return this._y
},width:function(a){if(a!=undefined){if(a<0){a=0
}this._width=a;
this._right=a+this._x
}return this._width
},height:function(a){if(a!=undefined){if(a<0){a=0
}this._height=a;
this._bottom=a+this._y
}return this._height
},top:function(a){if(a!=undefined){if(a<0){a=0
}if(a<this._y){this._height=0
}else{this._height=this._bottom-a
}this._top=this._y=a
}return this._top
},left:function(a){if(a!=undefined){if(a<0){a=0
}if(a<this._x){this._width=0
}else{this._width=this._right-a
}this._left=this._x=a
}return this._left
},bottom:function(a){if(a!=undefined){if(a<0){a=0
}if(a<this._y){this._bottom=this._y=a;
this._height=0
}else{this._bottom=a;
this._height=a-this._y
}}return this._bottom
},right:function(a){if(a!=undefined){if(a<0){a=0
}if(a<this._x){this._right=this._x=a;
this._width=0
}else{this._right=a;
this._width=a-this._x
}}return this._right
}});
var PlayerEvent=new Object();
PlayerEvent.OnUpdateOverlays="OnUpdateOverlays";
PlayerEvent.OnCheckAdFailed="OnCheckAdFailed";
PlayerEvent.OnStandbyRelease="OnStandbyRelease";
PlayerEvent.OnMediaAreaChanged="OnMediaAreaChanged";
PlayerEvent.onContentAreaChanged="onContentAreaChanged";
PlayerEvent.OnOverlayAreaChanged="OnOverlayAreaChanged";
PlayerEvent.OnReleaseStop="OnReleaseStop";
PlayerEvent.OnBandwidthPreferencesSet="OnBandwidthPreferencesSet";
PlayerEvent.OnFormShown="OnFormShown";
PlayerEvent.OnFlashFullScreen="OnPlayerFullScreen";
PlayerEvent.OnExternalFullScreen="OnExternalFullScreen";
PlayerEvent.OnPlayerPause="OnPlayerPause";
PlayerEvent.OnPlayerUnPause="OnPlayerUnPause";
PlayerEvent.OnNetConnectionClosed="OnNetConnectionClosed";
PlayerEvent.OnTrackActivated="OnTrackActivated";
PlayerEvent.OnPlugInsAboveControlsChanged="OnPlugInsAboveControlsChanged";
PlayerEvent.OnDebug="OnDebug";
PlayerEvent.OnVideoSized="OnVideoSized";
PlayerEvent.OnRelatedContentIdsReceived="OnRelatedContentIdsReceived";
var PlayerFunctions=new Object();
PlayerFunctions.getContentArea="getContentArea";
PlayerFunctions.getMediaArea="getMediaArea";
PlayerFunctions.setMediaArea="setMediaArea";
PlayerFunctions.setMediaPadding="setMediaPadding";
PlayerFunctions.getMediaPadding="getMediaPadding";
PlayerFunctions.setOverlayArea="setOverlayArea";
PlayerFunctions.getOverlayArea="getOverlayArea";
PlayerFunctions.getNetStreamData="getNetStreamData";
PlayerFunctions.addNetStreamClient="addNetStreamClient";
PlayerFunctions.removeNetStreamClient="removeNetStreamClient";
PlayerFunctions.attachNetStream="attachNetStream";
PlayerFunctions.removeOverlay="removeOverlay";
PlayerFunctions.endRelease="endRelease";
PlayerFunctions.getUsingPlayOverlay="getUsingPlayOverlay";
PlayerFunctions.getReleaseState="getReleaseState";
PlayerFunctions.getCurrentRelease="getCurrentRelease";
PlayerFunctions.getCurrentPlaylist="getCurrentPlaylist";
PlayerFunctions.getCurrentClip="getCurrentClip";
PlayerFunctions.getPreviousClip="getPreviousClip";
PlayerFunctions.getCurrentPosition="getCurrentPosition";
PlayerFunctions.hideMedia="hideMedia";
PlayerFunctions.setFlashFullScreen="setFlashFullScreen";
PlayerFunctions.getFullScreenState="getFullScreenState";
PlayerFunctions.createClipFromBaseClip="createClipFromBaseClip";
PlayerFunctions.getPlugInsAboveControls="getPlugInsAboveControls";
PlayerFunctions.setPlugInsAboveControls="setPlugInsAboveControls";
PlayerFunctions.restartCurrentClip="restartCurrentClip";
PlayerFunctions.addExpandee="addExpandee";
PlayerFunctions.removeExpandee="removeExpandee";
PlayerFunctions.addPopUp="addPopUp";
PlayerFunctions.removePopUp="removePopUp";
PlayerFunctions.validateItemId="validateItemId";
PlayerFunctions.getMuteState="getMuteState";
PlayerFunctions.getSoundLevel="getSoundLevel";
PlayerFunctions.getPauseState="getPauseState";
PlayerFunctions.setPauseState="setPauseState";
PlayerFunctions.setVideoVisible="setVideoVisible";
PlayerFunctions.sizeVideo="sizeVideo";
PlayerFunctions.injectPlaylist="injectPlaylist";
PlayerFunctions.insertClip="insertClip";
PlayerFunctions.setMediaHyperlink="setMediaHyperlink";
PlayerFunctions.getCurrentBandwidthPreferences="getCurrentBandwidthPreferences ";
PlayerFunctions.getActiveTrack="getActiveTrack";
PlayerFunctions.setActiveTrack="setActiveTrack";
PlayerFunctions.setPrimaryMediaWrapper="setPrimaryMediaWrapper";
PlayerFunctions.getPrimaryMediaWrapper="getPrimaryMediaWrapper";
PlayerFunctions.registerNetConnectionPlugIn="registerNetConnectionPlugIn";
PlayerFunctions.registerClipWrapperPlugIn="registerClipWrapperPlugIn";
PlayerFunctions.setClipWrapper="setClipWrapper";
PlayerFunctions.wrapClip="wrapClip";
PlayerFunctions.registerAdPlugIn="registerAdComponent";
PlayerFunctions.getTimeSinceLastAd="getTimeSinceLastAd";
PlayerFunctions.getContentSinceLastAd="getContentSinceLastAd";
PlayerFunctions.setAds="setAds";
PlayerFunctions.registerRelatedItemsPlugIn="registerRelatedItemsPlugIn";
PlayerFunctions.setRelatedContentIds="setRelatedContentIds";
PlayerFunctions.checkRelatedContentIds="checkRelatedContentIds";
PlayerFunctions.registerURLPlugIn="registerURLPlugIn";
PlayerFunctions.setClip="setClip";
PlayerFunctions.parseReleaseXML="parseReleaseXml";
PlayerFunctions.parseSmil="parseSmil";
PlayerFunctions.registerFormSubmitPlugIn="registerFormSubmitPlugIn";
PlayerFunctions.addSharingSite="addSharingSite";
PlayerFunctions.getSharingSite="getSharingSite";
PlayerFunctions.postSharingSite="postSharingSite";
$pdk.ns("$pdk.managers");
$pdk.managers.TrackingUrl={TRIGGER_TYPE_PERCENTAGE:0,TRIGGER_TYPE_MILLISECONDS:1,TRIGGER_TYPE_EVENT:2,EVENT_MUTE:0,EVENT_PAUSE:1,EVENT_REPLAY:2,EVENT_FULL_SCREEN:3,EVENT_STOP:4,EVENT_START:5,EVENT_UNPAUSE:6,EVENT_CLOSE:7,EVENT_UNMUTE:8,EVENT_ACCEPTINVITATION:9,EVENT_CLICK:10,EVENT_COMPLETE:11,EVENT_VIEWABILITY:12};
$pdk.managers.TrackingUrlManager=$pdk.extend(function(){},{_controller:null,_trackingURLs:null,_trackingURLMap:[],_trackingBaseClipMap:[],_eventTracking:null,_urlQueue:[],constructor:function(b,a){this._controller=b;
this._container=a;
this.init();
var c=this;
window.addEventListener("scroll",function(d){c.checkViewability()
});
window.addEventListener("resize",function(d){c.checkViewability()
});
window.addEventListener("focus",function(d){c.checkViewability()
});
window.addEventListener("blur",function(d){c.checkViewability()
})
},init:function(){var a=this;
this._eventTracking=new $pdk.managers.EventTracking(this._controller);
this._eventTracking.addEventListener("OnSendUrl",function(b){a.trackEvent(b)
});
this._controller.addEventListener("OnMediaClick",function(b){a.handleMediaClick(b)
});
this._controller.addEventListener("OnMediaStart",function(b){a.handleMediaStart(b)
});
this._controller.addEventListener("OnMediaEnd",function(b){a.handleMediaEnd(b)
});
this._controller.addEventListener("OnMediaComplete",function(b){a.handleMediaComplete(b)
});
this._controller.addEventListener("OnReleaseEnd",function(b){a.handleReleaseEnd(b)
})
},handleViewableImpression:function(){if(this._clip&&this._isAd&&this._trackingURLs){for(var a=0;
a<this._trackingURLs.length;
++a){if(!this._trackingURLs[a].hasFired&&this._trackingURLs[a].URL&&this._trackingURLs[a].URL.length>0){if((this._trackingURLs[a].triggerType==$pdk.managers.TrackingUrl.TRIGGER_TYPE_EVENT)&&(this._trackingURLs[a].triggerValue===$pdk.managers.TrackingUrl.EVENT_VIEWABILITY)){this.trackProgress(this._trackingURLs[a])
}}}}this._viewabilityFired=true
},handleMediaClick:function(c){try{var d=this._clip.baseClip.moreInfo.clickTrackingUrls;
if(d){var b=0;
var a=d.length;
for(;
b<a;
b++){this.sendUrl(d[b])
}}this.handleViewableImpression()
}catch(c){}},handleMediaStart:function(c){var b=c.data;
this._clip=b;
this._isAd=c.data.baseClip.isAd;
this._viewabilityStartTime=0;
this._viewable=false;
this._viewabilityFired=false;
this.checkViewability();
this._trackingURLs=this.getTrackingURLs(b);
if(!this._trackingURLs||!this._trackingURLs.length){tpDebug("No tracking URLs","TrackingUrlMgr",tpConsts.INFO);
if(this._onMediaPlayingListener){this._controller.removeEventListener("OnMediaPlaying",this._onMediaPlayingListener);
this._onMediaPlayingListener=null
}}else{if(!this._onMediaPlayingListener){tpDebug("Tracking URLs found","TrackingUrlMgr",tpConsts.INFO);
var a=this;
this._onMediaPlayingListener=function(d){a.handleMediaPlaying(d)
};
this._controller.addEventListener("OnMediaPlaying",this._onMediaPlayingListener)
}}},handleMediaPlaying:function(a){if(this._trackingURLs&&this._trackingURLs.length){this.doTracking(a.data)
}},handleMediaEnd:function(a){if(a.data.baseClip.isAd){this.doTracking(null)
}},handleMediaComplete:function(a){if(this._trackingURLs){this.doTracking(null)
}},handleReleaseEnd:function(a){this.resetTrackingURLs()
},checkViewability:function(){var b=this.isViewable();
if(this._clip&&this._isAd&&!this._viewabilityFired){if(!this._viewable&&b){this.startViewableTimer()
}else{if(this._viewable&&!b){this.stopViewableTimer()
}}}this._viewable=b;
var c=Date.now();
var a=c-this._viewabilityStartTime;
tpDebug("Checking Viewability: "+b+" "+(c-this._viewabilityStartTime),"TrackingUrlMgr",tpConsts.INFO);
if(!this._viewabilityFired&&b&&(this._viewabilityStartTime>0)&&(c-this._viewabilityStartTime>2000)){this.handleViewableImpression()
}},startViewableTimer:function(){this._viewabilityStartTime=Date.now();
var a=this;
setTimeout(function(){a.checkViewability()
},2000)
},stopViewableTimer:function(){this._viewabilityStartTime=0
},isViewable:function(){var h=this._container;
var d=0;
var a=0,i=0;
var g=this._container;
while(g){a+=g.offsetLeft;
i+=g.offsetTop;
g=g.offsetParent
}var c=Math.min(0,(window.scrollX+window.innerWidth-a-h.offsetWidth)/h.offsetWidth);
var f=Math.min(0,(window.scrollY+window.innerHeight-i-h.offsetHeight)/h.offsetHeight);
var b=1+c+f;
return document.hasFocus()&&(b>=0.5)
},getTrackingURLs:function(b){var a=b.baseClip.releaseID;
if(this._trackingBaseClipMap[a]&&this._trackingBaseClipMap[a]===b.baseClip){tpDebug("Use existing Clip's trackingURLs","TrackingUrlMgr",tpConsts.INFO);
return this._trackingURLMap[b.baseClip.releaseID]
}this._trackingBaseClipMap[a]=b.baseClip;
this._trackingURLMap[a]=b.baseClip.trackingURLs;
return this._trackingURLMap[a]
},resetTrackingURLs:function(){this._trackingBaseClipMap=[];
this._trackingURLMap=[]
},doTracking:function(e){if(!this._trackingURLs){return
}var c;
var b;
var d;
if(!e){e={};
e.percentComplete=100;
e.currentTime=1000000;
d=5
}else{d=100000/(!this._isAd&&e.durationAggregate?e.durationAggregate:e.duration)
}b=(!this._isAd&&e.currentTimeAggregate)?e.currentTimeAggregate:e.currentTime;
c=(!this._isAd&&e.percentCompleteAggregate)?e.percentCompleteAggregate:e.percentComplete;
for(var a=0;
a<this._trackingURLs.length;
++a){if(!this._trackingURLs[a].hasFired&&this._trackingURLs[a].URL&&this._trackingURLs[a].URL.length>0){if((this._trackingURLs[a].triggerType==$pdk.managers.TrackingUrl.TRIGGER_TYPE_PERCENTAGE)&&(c>=this._trackingURLs[a].triggerValue)&&(c<(this._trackingURLs[a].triggerValue+5*d))){this.trackProgress(this._trackingURLs[a])
}else{if(this._trackingURLs[a].triggerType==$pdk.managers.TrackingUrl.TRIGGER_TYPE_MILLISECONDS&&b>=this._trackingURLs[a].triggerValue&&b<(this._trackingURLs[a].triggerValue+5000)){this.trackProgress(this._trackingURLs[a])
}}}}},trackProgress:function(a){a.hasFired=true;
this.sendUrl(a.URL)
},trackEvent:function(a){this.sendUrl(a.data)
},sendUrl:function(a){this._urlQueue.push(a);
if(!this._urlQueueWaiting){this.sendNextUrl()
}},sendNextUrl:function(){var a=this._urlQueue.shift();
if(!a){return
}if(a.indexOf("ord=")===-1){var d=100000+Math.floor(Math.random()*900001);
a+=(a.indexOf("?")===-1?"?":"&");
a+="ord="+d
}a+=(a.indexOf("?")===-1?"?":"&");
a+="source=pdk";
this._urlQueueWaiting=true;
var c=new Image();
var b=this;
c.onload=function(f){b.completeHandler(f)
};
c.onerror=function(f){b.completeHandler(f)
};
c.src=a+"&"
},completeHandler:function(a){tpDebug("Tracking url sent: "+(a.target).src,"TrackingUrlMgr",tpConsts.INFO);
this._urlQueueWaiting=false;
this.sendNextUrl()
}});
$pdk.ns("$pdk.managers");
$pdk.managers.EventTracking=$pdk.extend(EventDispatcher,{_controller:null,_urls:null,constructor:function(a){this._controller=a;
this.init()
},init:function(){var a=this;
this._controller.addEventListener("OnMediaStart",function(b){a.onMediaStart(b)
})
},onMediaStart:function(b){var a=b.data;
if(a.baseClip.trackingURLs){this.setup(a.baseClip.trackingURLs)
}if(a.baseClip.impressionUrls){this.trackImpression(a)
}},trackImpression:function(c){var d=c.baseClip;
var b=d.impressionUrls;
if(d.impressionUrls&&d.impressionUrls.length){for(var a=0;
a<d.impressionUrls.length;
a++){this.dispatchEvent("OnSendUrl",{type:"OnSendUrl",data:d.impressionUrls[a]})
}d.impressionUrls=[];
this._controller.updateClip(c)
}},setup:function(b){this._urls=[];
if(this._listeners){this.removeListeners()
}this._listeners={};
var a;
for(var c=0;
c<b.length;
c++){a=b[c];
if(a.triggerType==$pdk.managers.TrackingUrl.TRIGGER_TYPE_EVENT){this.doSetup(a)
}}if(this._urls[$pdk.managers.TrackingUrl.EVENT_START]){this.sendTrackingEvent(this._urls[$pdk.managers.TrackingUrl.EVENT_START])
}if(this._urls.length){var d=this;
this._listeners.OnMediaEnd=function(f){d.onMediaEnd(f)
};
this._controller.addEventListener("OnMediaEnd",this._listeners.OnMediaEnd)
}},doSetup:function(a){var b=this;
switch(a.triggerValue){case $pdk.managers.TrackingUrl.EVENT_START:this.addUrlToEvent($pdk.managers.TrackingUrl.EVENT_START,a);
break;
case $pdk.managers.TrackingUrl.EVENT_STOP:break;
case $pdk.managers.TrackingUrl.EVENT_PAUSE:this.addUrlToEvent($pdk.managers.TrackingUrl.EVENT_PAUSE,a);
this._listeners.OnMediaPause=function(c){b.onMediaPause(c)
};
this._controller.addEventListener("OnMediaPause",this._listeners.OnMediaPause);
break;
case $pdk.managers.TrackingUrl.EVENT_UNPAUSE:this.addUrlToEvent($pdk.managers.TrackingUrl.EVENT_UNPAUSE,a);
this._listeners.OnMediaUnpause=function(c){b.onMediaUnpause(c)
};
this._controller.addEventListener("OnMediaUnpause",this._listeners.OnMediaUnpause);
break;
case $pdk.managers.TrackingUrl.EVENT_REPLAY:this.addUrlToEvent($pdk.managers.TrackingUrl.EVENT_REPLAY,a);
this._listeners.OnMediaSeek=function(c){b.onMediaSeek(c)
};
this._controller.addEventListener("OnMediaSeek",this._listeners.OnMediaSeek);
break;
case $pdk.managers.TrackingUrl.EVENT_MUTE:this.addUrlToEvent($pdk.managers.TrackingUrl.EVENT_MUTE,a);
this._listeners.OnMute=function(c){b.onMute(c)
};
this._controller.addEventListener("OnMute",this._listeners.OnMute);
break;
case $pdk.managers.TrackingUrl.EVENT_UNMUTE:this.addUrlToEvent($pdk.managers.TrackingUrl.EVENT_UNMUTE,a);
this._listeners.OnUnMute=function(c){b.onUnMute(c)
};
this._controller.addEventListener("OnMute",this._listeners.OnUnMute);
break;
case $pdk.managers.TrackingUrl.EVENT_FULL_SCREEN:this.addUrlToEvent($pdk.managers.TrackingUrl.EVENT_FULL_SCREEN,a);
this._listeners.OnShowFullScreen=function(c){b.onShowFullScreen(c)
};
this._controller.addEventListener("OnShowFullScreen",this._listeners.OnShowFullScreen);
break;
case $pdk.managers.TrackingUrl.EVENT_CLICK:this.addUrlToEvent($pdk.managers.TrackingUrl.EVENT_CLICK,a);
this._listeners.OnMediaClick=function(c){b.onMediaClick(c)
};
this._controller.addEventListener("OnMediaClick",this._listeners.OnMediaClick);
break;
case $pdk.managers.TrackingUrl.EVENT_COMPLETE:this.addUrlToEvent($pdk.managers.TrackingUrl.EVENT_COMPLETE,a);
this._listeners.OnMediaComplete=function(c){b.onMediaComplete(c)
};
this._controller.addEventListener("OnMediaComplete",this._listeners.OnMediaComplete);
break
}},removeListeners:function(){this._controller.removeEventListener("OnMediaEnd",this._listeners.OnMediaEnd);
this._controller.removeEventListener("OnMediaPause",this._listeners.OnMediaPause);
this._controller.removeEventListener("OnMediaUnpause",this._listeners.OnMediaUnpause);
this._controller.removeEventListener("OnMediaSeek",this._listeners.OnMediaSeek);
this._controller.removeEventListener("OnMute",this._listeners.OnMute);
this._controller.removeEventListener("OnMute",this._listeners.OnUnMute);
this._controller.removeEventListener("OnShowFullScreen",this._listeners.OnShowFullScreen);
this._controller.removeEventListener("OnMediaClick",this._listeners.OnMediaClick);
this._controller.removeEventListener("OnMediaComplete",this._listeners.OnMediaComplete)
},addUrlToEvent:function(b,a){if(!this._urls[b]){this._urls[b]=[]
}this._urls[b].push(a)
},onReleaseStop:function(a){if(this._urls[$pdk.managers.TrackingUrl.EVENT_STOP]&&this._urls[$pdk.managers.TrackingUrl.EVENT_STOP].length){this.sendTrackingEvent(this._urls[$pdk.managers.TrackingUrl.EVENT_STOP])
}},onMediaEnd:function(a){this.cleanup()
},onMediaPause:function(a){this._controller.removeEventListener("OnMediaPause",this._listeners.OnMediaPause);
this.sendTrackingEvent(this._urls[$pdk.managers.TrackingUrl.EVENT_PAUSE])
},onMediaUnpause:function(a){this._controller.removeEventListener("OnMediaUnpause",this._listeners.OnMediaUnpause);
this.sendTrackingEvent(this._urls[$pdk.managers.TrackingUrl.EVENT_UNPAUSE])
},onMediaSeek:function(c){var b=c.data;
var a=b.end;
if(a.currentTime<=3000){this.sendTrackingEvent(this._urls[$pdk.managers.TrackingUrl.EVENT_REPLAY])
}},onMute:function(a){if(a.data){this._controller.removeEventListener("OnMute",this._listeners.OnMute);
this.sendTrackingEvent(this._urls[$pdk.managers.TrackingUrl.EVENT_MUTE])
}},onUnMute:function(a){if(!a.data){this._controller.removeEventListener("OnMute",this._listeners.OnUnMute);
this.sendTrackingEvent(this._urls[$pdk.managers.TrackingUrl.EVENT_UNMUTE])
}},onShowFullScreen:function(b){var a=b.data;
if(a){this.sendTrackingEvent(this._urls[$pdk.managers.TrackingUrl.EVENT_FULL_SCREEN])
}},onMediaClick:function(a){this.sendTrackingEvent(this._urls[$pdk.managers.TrackingUrl.EVENT_CLICK])
},onMediaComplete:function(a){this.sendTrackingEvent(this._urls[$pdk.managers.TrackingUrl.EVENT_COMPLETE])
},cleanup:function(){this.removeListeners()
},destroy:function(){this.cleanup()
},sendTrackingEvent:function(c){if(!c){return
}var a;
for(var b=0;
b<c.length;
b++){if(!c[b].hasFired){a=c[b].URL;
this.dispatchEvent("OnSendUrl",{type:"OnSendUrl",data:a});
c[b].hasFired=true
}}}});
FullScreenManager=Class.extend({init:function(b,a,d){this._controller=b;
this._pbm=a;
this._controller.registerFunction("showFullScreen",this,this.doShowFullScreen);
this._controller.registerFunction("getFullScreenState",this,this.getFullScreenState);
var c=this;
this.flashFullScreenListener=function(g){c.flashFullScreen(g)
};
this._controller.addEventListener("OnFlashFullScreen",this.flashFullScreenListener);
this._controller.addEventListener("OnReleaseStart",function(g){c.onReleaseStart(g)
});
this._controller.addEventListener("OnMediaError",function(){c.doShowFullScreen(false)
});
this._controller.addEventListener("OnMediaAreaChanged",function(){c.onMediaArea(false)
});
window.addEventListener("keydown",function(g){if(g.keyCode===27&&c._isFullWindow){c.doShowFullScreen(false)
}},false);
this._isFullScreen=false;
this._isIFrame=false;
try{this._isIFrame=window.self!==window.top
}catch(f){this._isIFrame=true
}this._enableFullWindow=d&&(!this._isIFrame||$pdk.queue._externalControllerListener);
this._allowFullScreen=this._controller.getProperty("allowFullScreen")=="false"?false:true
},onReleaseStart:function(a){if(tpIsIOS()&&(this._pbm.videoEngine)&&(this._pbm.videoEngine.isFullScreen()!=this._isFullScreen)){this._isFullScreen=this._pbm.videoEngine.isFullScreen();
this.sendEvt()
}},onMediaArea:function(a){if(this._isFullScreen!=this.isFullScreen()){this._isFullScreen=this.isFullScreen();
this.sendEvt()
}},doShowFullScreen:function(a){if(!this._allowFullScreen&&a){return
}if(this.isFullScreen()!=a){this._isFullScreen=a;
tpDebug("Going fullscreen");
this.setWebkitFullScreen(this._isFullScreen)
}},isFullScreen:function(){var a=this._pbm.video;
var b=a.parentNode.parentNode;
if(this._isFullWindow||(document.webkitIsFullScreen&&this._requestedFullScreen)||(document.msFullscreenElement&&this._requestedFullScreen)||b.webkitDisplayingFullscreen||a.webkitDisplayingFullscreen||(document.mozFullScreen&&this._requestedFullScreen)){return true
}else{return this._requestedFullScreen&&this._pbm.videoEngine.isFullScreen()
}},fullscreenChange:function(a){if(!a.isFullScreen){this._isFullScreen=false;
this.sendEvt()
}},setWebkitFullScreen:function(c){this._isFullScreen=c;
tpDebug("Trying to set fullscreen to "+c);
var a=(navigator.userAgent.indexOf("Windows")>-1&&navigator.userAgent.indexOf("AppleWebKit")>-1&&navigator.userAgent.toLowerCase().indexOf("chrome")===-1);
var f=this._pbm.video;
var h=this._pbm.videoEngine;
var g=f.parentNode.parentNode;
if(g.webkitRequestFullScreen&&!a){tpDebug("WebKit fullscreen API is apparently supported");
if((document.webkitIsFullScreen||g.webkitDisplayingFullscreen)&&!c){document.webkitCancelFullScreen()
}else{if(c){try{this.handlerFired=false;
if(!this.fsChangeHandler){this.fsChangeHandler=function(){d._isFullScreen=((document.webkitIsFullScreen&&d._requestedFullScreen)||f.webkitDisplayingFullscreen||g.webkitDisplayingFullscreen)==true;
tpDebug("got webkitfullscreenchange event, isFullscreen is "+d._isFullScreen);
if(!d._isFullScreen){g.removeEventListener("webkitfullscreenchange",this.fsChangeHandler)
}if(d._requestedFullScreen){if(!d._isFullScreen){d._requestedFullScreen=false
}d.sendEvt()
}}
}var d=this;
this._requestedFullScreen=true;
g.removeEventListener("webkitfullscreenchange",this.fsChangeHandler);
g.addEventListener("webkitfullscreenchange",this.fsChangeHandler);
setTimeout(this.fsChangeHandler,3000);
g.webkitRequestFullScreen();
d.sendEvt()
}catch(i){this._requestedFullScreen=false;
g.removeChild(blocker);
tpDebug("Switching to full screen from Javascript is not supported in this browser unless it's initiated by a user click.",this.controller.id,"FullScreenManager","error");
return
}}}return
}else{if(g.mozRequestFullScreen){tpDebug("Moz fullscreen API is apparently supported");
if(document.mozFullScreen&&!c){try{document.mozCancelFullScreen()
}finally{if(document.mozFullScreen){tpDebug("Couldn't exit with mozCancelFullScreen trying to hack the DOM");
var b=g.parentNode;
b.removeChild(g);
b.appendChild(g);
tpDebug("Done trying to hack DOM");
document.removeEventListener("mozfullscreenchange",this.callback);
this.callback=undefined;
this.sendEvt()
}}}else{if(c){try{this._requestedFullScreen=true;
g.mozRequestFullScreen()
}catch(i){tpDebug("Switching to full screen from Javascript is not supported in this browser unless it's initiated by a user click.",this.controller.id,"FullScreenManager","error");
return
}this.sendEvt();
var d=this;
document.removeEventListener("mozfullscreenchange",this.callback);
this.callback=function(){d._isFullScreen=document.mozFullScreen&&d._requestedFullScreen;
if(!d._isFullScreen){document.removeEventListener("mozfullscreenchange",d.callback);
d.callback=undefined
}if(d._requestedFullScreen){if(!d._isFullScreen){d._requestedFullScreen=false
}d.sendEvt()
}};
document.addEventListener("mozfullscreenchange",this.callback)
}}return
}}if(!this._isIFrame&&g.msRequestFullscreen){tpDebug("MS fullscreen API is apparently supported");
if((document.msFullscreenElement)&&!c){document.msExitFullscreen()
}else{if(c){try{this.handlerFired=false;
var d=this;
if(!this.fsChangeHandler){this.fsChangeHandler=function(){d._isFullScreen=(document.msFullscreenElement!=null);
tpDebug("got msfullscreenchange event, isFullscreen is "+d._isFullScreen);
if(!d._isFullScreen){document.removeEventListener("MSFullscreenChange",d.fsChangeHandler)
}if(d._requestedFullScreen){if(!d._isFullScreen){d._requestedFullScreen=false
}d.sendEvt()
}}
}this._requestedFullScreen=true;
document.removeEventListener("MSFullscreenChange",this.fsChangeHandler);
document.addEventListener("MSFullscreenChange",this.fsChangeHandler);
setTimeout(this.fsChangeHandler,3000);
g.msRequestFullscreen();
d.sendEvt()
}catch(i){g.removeChild(blocker);
tpDebug("Switching to full screen from Javascript is not supported in this browser unless it's initiated by a user click.",this.controller.id,"FullScreenManager","error");
return
}}}return
}else{if(this._enableFullWindow||($pdk.isIE&&this._isIFrame)){tpDebug("No fullscreen API available, using full window");
if(!this.playerContainerStyle){this.playerContainerStyle={}
}this._isFullWindow=false;
if(c){this.playerContainerStyle.position=g.style.position;
this.playerContainerStyle.top=g.style.top;
this.playerContainerStyle.left=g.style.left;
this.playerContainerStyle.bottom=g.style.bottom;
this.playerContainerStyle.right=g.style.right;
this.playerContainerStyle.marginTop=g.style.marginTop;
this.playerContainerStyle.marginLeft=g.style.marginLeft;
this.playerContainerStyle.marginBottom=g.style.marginBottom;
this.playerContainerStyle.marginRight=g.style.marginRight;
this.playerContainerStyle.zIndex=$pdk.jQuery(g).parents(".tpPlayer")[0].style.zIndex;
this.playerContainerStyle.overflowX=$pdk.jQuery(g).parents(".tpPlayer")[0].style.overflowX;
this.playerContainerStyle.overflowY=$pdk.jQuery(g).parents(".tpPlayer")[0].style.overflowY;
$pdk.jQuery(g).parents(".tpPlayer")[0].style.zIndex=10000;
g.style.position="fixed";
g.style.top="0px";
g.style.left="0px";
g.style.bottom="0px";
g.style.right="0px";
g.style.marginTop="0px";
g.style.marginLeft="0px";
g.style.marginBottom="0px";
g.style.marginRight="0px";
$pdk.jQuery(g).parents(".tpPlayer")[0].style.overflowX="visible";
$pdk.jQuery(g).parents(".tpPlayer")[0].style.overflowY="visible";
this._isFullWindow=true
}else{g.style.position=this.playerContainerStyle.position;
g.style.top=this.playerContainerStyle.top;
g.style.left=this.playerContainerStyle.left;
g.style.bottom=this.playerContainerStyle.bottom;
g.style.right=this.playerContainerStyle.right;
g.style.marginTop=this.playerContainerStyle.marginTop;
g.style.marginLeft=this.playerContainerStyle.marginLeft;
g.style.marginBottom=this.playerContainerStyle.marginBottom;
g.style.marginRight=this.playerContainerStyle.marginRight;
g.style.zIndex=this.playerContainerStyle.zIndex;
$pdk.jQuery(g).parents(".tpPlayer")[0].style.zIndex=this.playerContainerStyle.zIndex;
$pdk.jQuery(g).parents(".tpPlayer")[0].style.overflowX=this.playerContainerStyle.overflowX;
$pdk.jQuery(g).parents(".tpPlayer")[0].style.overflowY=this.playerContainerStyle.overflowY
}if(this._isIFrame){if(c){$pdk.controller.requestIFrameFullWindow()
}else{$pdk.controller.cancelIFrameFullWindow()
}this._isFullWindow=c
}this._isFullScreen=c;
var d=this;
setTimeout(function(){d.sendEvt()
},10);
return
}else{try{tpDebug("Trying to set VideoEngine fullscreen to "+c);
if(!this.changeListener){var d=this;
this.changeListener=function(j){d.fullscreenChange(j)
};
this._pbm.videoEngine.addEventListener("FULLSCREEN",this.changeListener)
}this._requestedFullScreen=c;
h.setFullScreen(c)
}catch(i){tpDebug("VideoEngine won't support fullscreen");
return
}}}this.sendEvt()
},sendEvt:function(){tpDebug("FullScreen is now:"+this._isFullScreen);
this._controller.dispatchEvent("OnShowFullScreen",this._isFullScreen)
},getFullScreenState:function(){var a;
if(tpIsAndroid()||this._pbm.video.webkitDisplayingFullscreen||document.webkitFullscreenElement||document.msFullscreenElement||this._isFullWindow){a=true
}else{a=false
}if(a!=this._isFullScreen){this._isFullScreen=a;
this.sendEvt()
}return this._isFullScreen
}});
$pdk.ns("$pdk.plugin");
$pdk.plugin.MetadataUrlManager=$pdk.extend(function(){},{constructor:function(a){this._plugins=[];
this._currentQueue=[];
this._context={complete:false,found:false};
this._controller=a;
this._controller.registerFunction("registerMetadataUrlPlugIn",this,this.registerMetadataUrlPlugIn);
this._controller.registerFunction("setMetadataUrl",this,this.setMetadataUrl);
this._controller.registerFunction("setUrl",this,this.setUrl)
},setUrl:function(c,a,b){this._context={releaseUrl:c,isPreview:a,callback:b,complete:false,found:false};
this._currentQueue=this._plugins.concat();
if(this._currentQueue.length===0){b(c);
return true
}else{if(!this._processNextPlugin()){b(c);
return true
}else{return false
}}},setMetadataUrl:function(a){if(this._currentQueue.length===0){if(!this._context.complete){this._context.releaseUrl=a;
this._context.callback(a);
this._context.complete=true
}}else{this._context.releaseUrl=a;
if(!this._processNextPlugin()){this._context.callback(this._context.releaseUrl);
this._context.complete=true
}}},registerMetadataUrlPlugIn:function(b,a){if(typeof(b.rewriteMetadataUrl)!=="function"){throw new Error('Attempt to register MetadataUrlPlugIn with non-conforming interface (plugin method "rewriteMetadataUrl" does not exist or is not a real method)')
}else{if(b.rewriteMetadataUrl.length!==2){throw new Error('Attempt to register MetadataUrlPlugIn with non-conforming interface ("rewriteMetadataUrl" method does not take 2 parameters)')
}}this._plugins.push({plugin:b,priority:Number(a)});
this._plugins=this._sortPluginsByPriority(this._plugins)
},_processNextPlugin:function(){var b=false,a;
while(!b&&this._currentQueue.length>0){a=this._currentQueue.shift();
b=a.plugin.rewriteMetadataUrl(this._context.releaseUrl,this._context.isPreview)
}this._context.found=b?true:this._context.found;
return b
},_sortPluginsByPriority:function(a){return a.sort(function(d,c){return d.priority-c.priority
})
}});
AdManager=Class.extend({adPatternInfo:{cookieName:"",cookiePrefix:"tpPdk",adPolicy:0,mediaCount:0,chapterCount:0},countedRelease:false,init:function(a){this.controller=a;
a.registerFunction("setAds",this,this.setAds);
a.registerFunction("registerAdPlugIn",this,this.registerAdPlugIn);
a.registerFunction("getTimeSinceLastAd",this,this.getTimeSinceLastAd);
this.defaultAdPattern=a.getProperty("adPattern");
this.timeSinceLastAd=0;
this.plugins=new Array();
var b=this;
this.getAdPolicy(a.component.releaseUrl);
this.controller.addEventListener("OnMediaStart",function(c){b.onMediaStart.apply(b,[c])
});
this.controller.addEventListener("OnReleaseStart",function(c){b.onReleaseStart.apply(b,[c])
})
},setAds:function(a){if(a&&(tpIsIOS()||tpIsAndroid()&&this.controller.isPrefetch())){a.isAd=true
}if(!a||(a.clips&&a.clips.length===0)){this.controller.dispatchEvent("__internal__AdLoadFailure")
}this.controller.insertPlaylist(a)
},registerAdPlugIn:function(a,b,c){this.plugins.push({adPlugIn:a,adType:b,priority:c});
function d(f,e){if(f.priority<e.priority){return -1
}else{if(f.priority>e.priority){return 1
}else{return 0
}}}this.plugins.sort(d)
},getTimeSinceLastAd:function(){return this.timeSinceLastAd
},isAd:function(b){if(b.baseClip.isAd){return true
}else{var a=this.adPlugInsIsAd(b);
b.baseClip.isAd=a;
return a
}},checkAd:function(b){tpDebug("We have "+this.plugins.length+" ad plugins to check");
for(var a=0;
a<this.plugins.length;
a++){var c=this.plugins[a].adPlugIn.checkAd.apply(this.plugins[a].adPlugIn,[b]);
if(c){return true
}}return false
},adPlugInsIsAd:function(b){for(var a=0;
a<this.plugins.length;
a++){if(this.plugins[a].adPlugIn.isAd(b)){return true
}}return false
},validateAd:function(a){if(a.hasPlayed){return false
}var c;
if(a.baseClip.hasOwnProperty("contentCustomData")&&a.baseClip.contentCustomData.hasOwnProperty("adPattern")){c=a.baseClip.contentCustomData.adPattern
}else{c=this.defaultAdPattern
}if(c&&c!=""){var b=this.processAdPattern(c,a.baseClip.isMid);
if(!b){return false
}}return true
},onMediaStart:function(b){var a=b.data.baseClip.isAd?"adplay":"videoplay";
if(a=="videoplay"&&this.adPatternInfo.cookieName!=""){if(!this.countedRelease){this.adPatternInfo.mediaCount++;
this.countedRelease=true
}this.adPatternInfo.chapterCount++;
this.setCookie(this.adPatternInfo.cookieName,this.adPatternInfo.mediaCount+"|"+this.adPatternInfo.chapterCount,null,"/")
}},onReleaseStart:function(a){this.countedRelease=false
},getAdPolicy:function(c){var a=new RegExp("[\\?&]policy=([^&#]*)");
var b=a.exec(c);
if(b){this.adPatternInfo.adPolicy=b[1]
}},processAdPattern:function(c,e){var h=new RegExp("count:([0-9]*)[|]([0-9]*)");
var d=h.exec(c);
if(d){var i=d[1];
var a=d[2];
this.adPatternInfo.cookieName=this.adPatternInfo.cookiePrefix+"_"+this.adPatternInfo.adPolicy;
var b=this.getCookie(this.adPatternInfo.cookieName);
if(b){b=b.split("|")
}if(b&&b.length>1){this.adPatternInfo.mediaCount=b[0];
this.adPatternInfo.chapterCount=b[1]
}if(isNaN(this.adPatternInfo.chapterCount)){this.adPatternInfo.chapterCount=0
}var g=a;
if(!e&&!this.adPatternInfo.mediaCount){this.adPatternInfo.mediaCount=0;
g=i
}if(e&&!this.adPatternInfo.chapterCount){this.adPatternInfo.chapterCount=0;
g=i
}var f=(e?this.adPatternInfo.chapterCount:this.adPatternInfo.mediaCount);
if(f<g){return false
}}if(e){this.adPatternInfo.chapterCount=0
}else{this.adPatternInfo.mediaCount=0
}return true
},setCookie:function(a,d,b,f){var e=new Date();
e.setTime(e.getTime()+(b*3600*1000));
var c=escape(d)+((b==null)?"":"; expires="+e.toUTCString())+((f==null)?"":"; path="+f);
document.cookie=a+"="+c
},getCookie:function(b){var c=document.cookie;
var d=c.indexOf(" "+b+"=");
if(d==-1){d=c.indexOf(b+"=")
}if(d==-1){c=null
}else{d=c.indexOf("=",d)+1;
var a=c.indexOf(";",d);
if(a==-1){a=c.length
}c=unescape(c.substring(d,a))
}return c
}});
/*!
 * Bowser - a browser detector
 * https://github.com/ded/bowser
 * MIT License | (c) Dustin Diaz 2014
 */
!function(a,b){$pdk._browserCheck=a(b())
}(function(a){return function(d){if(!d||d.length==0){return false
}var k,h,b,e,g,c,j;
for(var f=0;
f<d.length;
f++){k=d[f];
h=k.browser;
b=k.version;
hasVersion=b!==null&&b!==undefined;
e=k.os;
hasOS=e!==null&&e!==undefined;
g=k.osversion;
j=k.device;
c=j!==null&&j!==undefined;
hasOSversion=g!==null&&g!==undefined;
if(a.name.toLowerCase()==h.toLowerCase()&&(!hasVersion||(hasVersion&&parseFloat(a.version)>=b))&&(!hasOS||(hasOS&&a[e.toLowerCase()]))&&(!hasOSversion||(hasOSversion&&parseFloat(a.osversion)>=g))&&(!c||(c&&a.device==j))){return true
}}return false
}
},function(){var b=true;
function a(f){function j(r){var q=f.match(r);
return(q&&q.length>1&&q[1])||""
}var o=j(/(ipod|iphone|ipad)/i).toLowerCase(),n=/like android/i.test(f),g=!n&&/android/i.test(f),k=/CrOS/.test(f),h=j(/edge\/(\d+(\.\d+)?)/i),e=j(/version\/(\d+(\.\d+)?)/i),m=/tablet/i.test(f),d=!m&&/[^-]mobi/i.test(f),p;
if(/opera|opr/i.test(f)){p={name:"Opera",opera:b,version:e||j(/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)}
}else{if(/windows phone/i.test(f)){p={name:"Windows Phone",windowsphone:b};
if(h){p.msedge=b;
p.version=h
}else{p.msie=b;
p.version=j(/iemobile\/(\d+(\.\d+)?)/i)
}}else{if(/msie|trident/i.test(f)){p={name:"Internet Explorer",msie:b,version:j(/(?:msie |rv:)(\d+(\.\d+)?)/i)}
}else{if(k){p={name:"Chrome",chromeBook:b,chrome:b,version:j(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)}
}else{if(/chrome.+? edge/i.test(f)){p={name:"Microsoft Edge",msedge:b,version:h}
}else{if(/chrome|crios|crmo/i.test(f)){p={name:"Chrome",chrome:b,version:j(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)}
}else{if(o){p={name:o=="iphone"?"iPhone":o=="ipad"?"iPad":"iPod"};
if(e){p.version=e
}}else{if(/firefox|iceweasel/i.test(f)){p={name:"Firefox",firefox:b,version:j(/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i)};
if(/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(f)){p.firefoxos=b
}}else{if(/silk/i.test(f)){p={name:"Amazon Silk",silk:b,version:j(/silk\/(\d+(\.\d+)?)/i)}
}else{if(g){p={name:"Android",version:e}
}else{if(/blackberry|\bbb\d+/i.test(f)||/rim\stablet/i.test(f)){p={name:"BlackBerry",blackberry:b,version:e||j(/blackberry[\d]+\/(\d+(\.\d+)?)/i)}
}else{if(/safari/i.test(f)){p={name:"Safari",safari:b,version:e}
}else{p={}
}}}}}}}}}}}}if(!p.msedge&&/(apple)?webkit/i.test(f)){p.name=p.name||"Webkit";
p.webkit=b;
if(!p.version&&e){p.version=e
}}else{if(!p.opera&&/gecko\//i.test(f)){p.name=p.name||"Gecko";
p.gecko=b;
p.version=p.version||j(/gecko\/(\d+(\.\d+)?)/i)
}}if(!p.msedge&&(g||p.silk)){p.android=b
}else{if(o){p[o]=b;
p.ios=b
}}var i="";
if(p.windowsphone){i=j(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i)
}else{if(o){i=j(/os (\d+([_\s]\d+)*) like mac os x/i);
i=i.replace(/[_\s]/g,".")
}else{if(g){i=j(/android[ \/-](\d+(\.\d+)*)/i)
}else{if(p.webos){i=j(/(?:web|hpw)os\/(\d+(\.\d+)*)/i)
}else{if(p.blackberry){i=j(/rim\stablet\sos\s(\d+(\.\d+)*)/i)
}else{if(p.bada){i=j(/bada\/(\d+(\.\d+)*)/i)
}else{if(p.tizen){i=j(/tizen[\/\s](\d+(\.\d+)*)/i)
}}}}}}}if(i){p.osversion=i
}var l=i.split(".")[0];
if(m||o=="ipad"||(g&&(l==3||(l==4&&!d)))||p.silk){p.tablet=b
}else{if(d||o=="iphone"||o=="ipod"||g||p.blackberry||p.webos||p.bada){p.mobile=b
}}p.device=(p.tablet||p.mobile)?b:false;
return p
}var c=a(typeof navigator!=="undefined"?navigator.userAgent:"");
c._detect=a;
return c
});
tpCategoryList=PDKComponent.extend({_generateExportedMarkup:function(){return'<div id="'+this.id+'" class="categoryList"></div>'
},init:function(c,b,a){this.width=b;
this.height=a;
this.id=c;
this.pretty=!navigator.userAgent.match(/MSIE 8/)&&!navigator.userAgent.match(/MSIE 7/)&&!navigator.userAgent.match(/MSIE 6/);
this.ALL={id:"",value:"all",order:"1",title:"All",fullTitle:"All"};
this.MOST_POPULAR={id:"",value:"mostPopular",order:"2",title:"Most Popular",fullTitle:"MostPopular"};
this.FAVORITES={id:"",value:"favorites",order:"3",title:"Favorites",fullTitle:"Favorites"};
this.TOP_RATED={id:"",value:"topRated",order:"4",title:"Top Rated",fullTitle:"TopRated"};
this.RELATED={id:"",value:"related",order:"5",title:"Related Items",fullTitle:"Related"};
if($pdk._isDevMode){this.pretty=false
}this.controller=new ComponentController(c);
this.deferredController=$pdk.shell.Registry.getInstance().getShells().get(c)._deferredController;
this.eventQueue=[]
},initialize:function(){var a=this;
if(this.scopes){this.controller.scopes=[this.id].concat(this.scopes.split(","))
}else{this.controller.scopes=[this.id,"default"]
}if(this.allChoiceLabel){this.ALL.title=this.allChoiceLabel
}if(this.mostPopularChoiceLabel){this.MOST_POPULAR.title=this.mostPopularChoiceLabel
}if(this.favoritesChoiceLabel){this.FAVORITES.title=this.favoritesChoiceLabel
}if(this.topRatedChoiceLabel){this.TOP_RATED.title=this.topRatedChoiceLabel
}if(this.relatedChoiceLabel){this.RELATED.title=this.relatedChoiceLabel
}this.controller.addEventListener("OnRefreshCategoryModel",function(){a.handleCategoryModelRefreshed.apply(a,arguments)
});
this.deferredController.addEventListener("OnRefreshCategoryModel",function(){a.handleCategoryModelRefreshed.apply(a,arguments)
});
this.controller.addEventListener("OnRefreshReleaseModel",function(){a.handleReleaseModelRefreshed.apply(a,arguments)
});
this.deferredController.addEventListener("OnRefreshReleaseModel",function(){a.handleReleaseModelRefreshed.apply(a,arguments)
});
this.currentIndex=-1
},write:function(b){if(this.autoLoad===undefined){this.autoLoad=true
}if(b){this.container=b
}else{document.write('<div id="'+this.id+'" class="categoryList"></div>');
this.container=document.getElementById(this.id);
this.container.style.width=this.width;
this.container.style.height=this.height
}this.style=document.createElement("style");
var a=document.getElementsByTagName("head")[0];
this.style.setAttribute("type","text/css");
a.appendChild(this.style);
this.initialize()
},_bindElement:function(a){if(this.autoLoad==null){this.autoLoad=true
}this.container=a;
this.container.style.width=this.width;
this.container.style.height=this.height;
tpController.ready();
return this.container
},categoryUrlsAreEqual:function(b,a,c){b=b.replace(/(.*)\?.*/,"$1");
a=a.replace(/(.*)\?.*/,"$1");
return b===a||b.indexOf(c)>=0
},setTileSelected:function(a){var b=-1;
this.currentCategory=a;
if(!this.sortedEntries){return
}for(var c=0;
c<this.sortedEntries.length;
c++){if(a==this.sortedEntries[c].title){b=c;
var d=this.items[c];
if(d!==undefined){d.className="tpCategory tpCategorySelected"
}}else{var d=this.items[c];
if(d!==undefined){d.className="tpCategory"
}}}return b
},refresh:function(){var d=document.createElement("div");
var c=document.createElement("div");
var b=this.framecolor?this.framecolor:"#000000";
var a=this.backgroundcolor?this.backgroundcolor:"#ffffff";
b=b.replace("0x","#");
a=a.replace("0x","#");
d.className="tpBackground";
d.style.backgroundColor=a;
d.style.borderColor=b;
c.className="tpBackgroundShine tpGradient";
this.container.innerHTML="";
this.container.appendChild(d);
this.container.appendChild(c)
},isPrefetch:function(){return this.controller.isPrefetch()
},isMostPopularRequest:function(a){if(a.indexOf("&sort=updated%7Cdesc")>=0||a.indexOf("?sort=updated%7Cdesc")>=0){return true
}else{return false
}},handleReleaseModelRefreshed:function(a){if(a.data.category){this.setTileSelected(a.data.category)
}else{if(a.data.search){this.setTileSelected(null)
}else{if(a.data.requestUrl&&this.isMostPopularRequest(a.data.requestUrl)){this.setTileSelected(this.mostPopularChoiceLabel)
}else{this.setTileSelected(this.allChoiceLabel)
}}}},handleCategoryModelRefreshed:function(p){if(this.paging){this.eventQueue.push(p);
return
}this.loading=false;
$pdk.jQuery(this.loadingIndicator).stop();
$pdk.jQuery(this.loadingIndicator).remove();
var c=p.data;
var y=(this.feed&&this.feed.search!==c.search?true:false);
var B;
var d;
var C;
var z;
if(this.feed&&this.feed.range&&c&&c.range){if(c.entries.length>0){this.paging=true
}if(this.feed.range.startIndex<c.range.startIndex){this.animateForward=true
}else{if(this.feed.range.startIndex>c.range.startIndex){this.animateForward=false
}}}else{this.animateForward=false
}this.feed=c;
this.loadedTiles=[];
this.numTiles=c.entries.length;
if(!this.currentPage||y||!this.pretty){this.refresh();
this.currentPage=null;
this.previousPage=null
}var b=-1;
var n=-1;
var k=0;
if(this.hasoverlay=="true"){var m=document.createElement("div");
m.className="tpCategoryListOverlay";
this.container.appendChild(m);
k=m.clientHeight
}var u=document.createElement("ul");
if(this.flow=="horizontal"){u.className="tpMenu"
}else{u.className="tpList"
}this.container.appendChild(u);
$pdk.jQuery(u).css("margin-top",parseInt($pdk.jQuery(u).css("margin-top"))+k);
u.ontouchstart=function(a){this.startX=a.changedTouches[0].pageX;
this.startY=a.changedTouches[0].pageY
};
u.ontouchend=function(a){if(this.startX&&((this.startX-a.changedTouches[0].pageX)>100)){$pdk.controller.nextRange()
}else{if(this.startX&&((a.changedTouches[0].pageX-this.startX)>100)){$pdk.controller.previousRange()
}}};
this.items=[];
var x,t,z,v,s,j,e,C,o;
var f=($pdk.jQuery(u).innerWidth());
var r=($pdk.jQuery(u).innerHeight());
var l={};
for(var q=0;
q<c.entries.length;
q++){l[c.entries[q].id]=c.entries[q]
}this.sortedEntries=[];
for(var q=0;
q<c.entries.length;
q++){if(l[c.entries[q].parentId]){}else{this.sortedEntries.push(c.entries[q])
}}this.sortedEntries.sort(function(i,h){if(parseInt(i.order,10)==parseInt(h.order,10)){if(i.title<h.title){return -1
}else{if(i.title>h.title){return 1
}else{return 0
}}}else{return parseInt(i.order,10)-parseInt(h.order,10)
}});
if(this.allChoiceIndex>0){this.sortedEntries.splice(this.allChoiceIndex-1,0,this.ALL)
}if(this.mostPopularChoiceIndex>0){this.sortedEntries.splice(this.mostPopularChoiceIndex-1,0,this.MOST_POPULAR)
}if(this.favoritesChoiceIndex>0){this.sortedEntries.splice(this.favoritesChoiceIndex-1,0,this.FAVORITES)
}if(this.topRatedChoiceIndex>0){this.sortedEntries.splice(this.topRatedChoiceIndex-1,0,this.TOP_RATED)
}for(var q=0;
q<this.sortedEntries.length;
q++){x=document.createElement("li");
t=document.createElement("div");
z=document.createElement("a");
v=document.createElement("div");
j=document.createElement("div");
e=document.createElement("div");
C=document.createElement("h2");
x.className="tpCategory";
if(this.pretty){t.className="tpShine"
}v.className="tpInfo";
j.className="tpMetadata";
e.className="tpGroup";
C.className="tpTitle";
x.appendChild(t);
x.appendChild(z);
z.appendChild(v);
if(this.showTitle){this.showMetadata=true;
v.appendChild(j);
j.appendChild(e);
e.appendChild(C)
}u.appendChild(x);
this.items.push(x);
if(this.flow=="horizontal"){x.style.height=r+"px"
}else{x.style.width=f+"px"
}z.style.borderBottomWidth="0px";
z.href="#";
z.category=this.sortedEntries[q];
z.index=q;
var A=this;
z.onclick=function(){if(A.currentClip&&A.currentClip.baseClip&&A.currentClip.baseClip.noSkip){return
}A.wasSetByCategoryList=true;
A.currentIndex=this.index;
A.controller.dispatchEvent("OnCategorySelected",this.category.fullTitle);
if(this.category.fullTitle==A.MOST_POPULAR.fullTitle){A.controller.refreshReleaseModel("",null,null,null)
}else{if(this.category.fullTitle=="Favorites"||this.category.fullTitle=="TopRated"||this.category.fullTitle=="Related"){}else{if(this.category.fullTitle=="All"){A.controller.refreshReleaseModel("",null,null,null)
}else{A.controller.refreshReleaseModel(this.category.title,null,null,null,null,null,null,null,"")
}}}return false
};
if(this.showTitle){C.innerHTML+=this.sortedEntries[q].title
}if($pdk.jQuery(x).offset().top+$pdk.jQuery(x).height()>$pdk.jQuery(u).offset().top+$pdk.jQuery(u).innerHeight()){this.items.pop();
u.removeChild(x);
break
}else{if($pdk.jQuery(x).offset().left+$pdk.jQuery(x).width()>$pdk.jQuery(u).offset().left+$pdk.jQuery(u).innerWidth()){this.items.pop();
u.removeChild(x);
break;
if(!this.more){}}}}var A=this;
setTimeout(function(){A.doInitialLoad(c)
},1);
if(this.style&&!this.createdColorizationStyles){this.createdColorizationStyles=true;
var g="";
if(this.itembackgroundcolor){g+="#"+this.id+".tpCategoryList>ul .tpCategory, ul#"+this.id+".tpCategoryList .tpCategory { background-color: #"+this.itembackgroundcolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList>ul .tpCategory .tpMetadata, ul#"+this.id+".tpCategoryList .tpCategory { background-color: #"+this.itembackgroundcolor.substr(2)+"; }"
}if(this.itemframecolor){g+="#"+this.id+".tpCategoryList .tpCategory { border-color: #"+this.itemframecolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList .tpCategory a { border-color: #"+this.itemframecolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList .tpCategory .tpShine { background-color: #"+this.itemframecolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList .tpCategory .tpShine { border-color: #"+this.itemframecolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList ul { border-color: #"+this.itemframecolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList ol { border-color: #"+this.itemframecolor.substr(2)+"; }"
}if(this.textframecolor){g+="#"+this.id+".tpCategoryList .tpCategory .tpMetadata { border-color: #"+this.textframecolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList .tpCategory a .tpMetadata .tpGroup { border-color: #"+this.textframecolor.substr(2)+"; }"
}if(this.textframeselectedcolor){g+="#"+this.id+".tpCategoryList .tpCategorySelected .tpMetadata { border-color: #"+this.textframeselectedcolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList .tpCategorySelected a .tpMetadata .tpGroup { border-color: #"+this.textframeselectedcolor.substr(2)+"; }"
}if(this.textcolor){g+="#"+this.id+".tpCategoryList .tpCategory a { color: #"+this.textcolor.substr(2)+"; }"
}if(this.thumbnailframecolor){g+="#"+this.id+".tpCategoryList .tpCategory .tpThumbnail { border-color: #"+this.thumbnailframecolor.substr(2)+"; }"
}if(this.thumbnailbackgroundcolor){g+="#"+this.id+".tpCategoryList .tpCategory .tpThumbnail { background-color: #"+this.thumbnailbackgroundcolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList .tpCategory .tpThumbnail img { background-color: #"+this.thumbnailbackgroundcolor.substr(2)+"; }"
}if(this.thumbnailpaddingcolor){g+="#"+this.id+".tpCategoryList .tpCategory .tpThumbnail { background-color: #"+this.thumbnailpaddingcolor.substr(2)+"; }"
}if(this.framecolor){}if(this.texthighlighthovercolor){g+="#"+this.id+".tpCategoryList .tpCategory:hover .tpShine { background-color: #"+this.texthighlighthovercolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList .tpCategory:hover .tpShine { border-color: #"+this.texthighlighthovercolor.substr(2)+"; }"
}if(this.texthovercolor){g+="#"+this.id+".tpCategoryList .tpCategory:hover a { color: #"+this.texthovercolor.substr(2)+"; }"
}if(this.texthighlighthovercolor){g+="#"+this.id+".tpCategoryList .tpCategory:hover a .tpMetadata .tpGroup { border-color: #"+this.texthighlighthovercolor.substr(2)+" !important; }"
}if(this.thumbnailhighlighthovercolor){g+="#"+this.id+".tpCategoryList .tpCategory:hover a .tpThumbnail { border-color: #"+this.thumbnailhighlighthovercolor.substr(2)+" !important; }"
}if(this.itemshineselectedcolor){g+="#"+this.id+".tpCategoryList .tpCategorySelected .tpShine { background-color: #"+this.itemshineselectedcolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList .tpCategorySelected .tpShine { border-color: #"+this.itemshineselectedcolor.substr(2)+"; }"
}if(this.textselectedcolor){g+="#"+this.id+".tpCategoryList .tpCategorySelected a { color: #"+this.textselectedcolor.substr(2)+"; }"
}if(this.texthighlightselectedcolor){g+="#"+this.id+".tpCategoryList .tpCategorySelected a .tpMetadata .tpGroup { border-color: #"+this.texthighlightselectedcolor.substr(2)+" !important; }"
}if(this.thumbnailhighlightselectedcolor){g+="#"+this.id+".tpCategoryList .tpCategorySelected a .tpThumbnail { border-color: #"+this.thumbnailhighlightselectedcolor.substr(2)+" !important; }"
}if(this.itemshineselectedcolor){g+="#"+this.id+".tpCategoryList .tpCategorySelected:hover .tpShine { background-color: #"+this.itemshineselectedcolor.substr(2)+"; }";
g+="#"+this.id+".tpCategoryList .tpCategorySelected:hover .tpShine { border-color: #"+this.itemshineselectedcolor.substr(2)+"; }"
}if(this.textselectedcolor){g+="#"+this.id+".tpCategoryList .tpCategorySelected:hover a { color: #"+this.textselectedcolor.substr(2)+"; }"
}if(this.backgroundcolor&&this.itembackgroundcolor&&this.framecolor){g+=".tpCategoryList ::-webkit-scrollbar                     { background-color: #"+this.backgroundcolor.substr(2)+"}\n";
g+=".tpCategoryList ::-webkit-scrollbar-track               { background-color: #"+this.backgroundcolor.substr(2)+"}\n";
g+=".tpCategoryList ::-webkit-scrollbar-thumb               { background-color: #"+this.itembackgroundcolor.substr(2)+"; border-color: #"+this.framecolor.substr(2)+"}\n";
g+=".tpCategoryList ::-moz-scrollbar                     { background-color: #"+this.backgroundcolor.substr(2)+"}\n";
g+=".tpCategoryList ::-moz-scrollbar-track               { background-color: #"+this.backgroundcolor.substr(2)+"}\n";
g+=".tpCategoryList ::-moz-scrollbar-thumb               { background-color: #"+this.itembackgroundcolor.substr(2)+"; border-color: #"+this.framecolor.substr(2)+"}\n"
}if(this.style.styleSheet){this.style.styleSheet.cssText=g
}else{this.style.appendChild(document.createTextNode(g))
}}if(this.currentCategory){this.currentIndex=this.setTileSelected(this.currentCategory)
}},doInitialLoad:function(a){},disable:function(){if(tpIsIPhone()||tpIsAndroid()){return
}if(!this.blocker){this.blocker=document.createElement("div");
this.blocker.style.width="100%";
this.blocker.style.height="100%";
this.blocker.style.position="absolute";
this.blocker.style.top="0";
this.blocker.style.left="0";
this.blocker.style.background="black";
this.blocker.style.opacity="0.75";
this.blocker.style.filter="alpha(opacity=75)";
this.blocker.innerHTML="&nbsp;";
this.blocker.style.zIndex="500";
this.container.appendChild(this.blocker)
}this.blocker.style.display="";
var a=this.container.childNodes;
for(child in a){if(child.style){child.style.opacity="0.75";
child.style.filter="alpha(opacity=75)"
}}},enable:function(){tpDebug("Doing enable");
try{if(this.blocker){this.blocker.style.display="none"
}var b=this.container.childNodes;
for(child in b){if(child.style){child.style.opacity="";
child.style.filter=""
}}}catch(a){tpDebug("enabled() threw an error with "+a.message+" on "+a.lineNumber)
}},output:function(b){var a="";
for(prop in b){a+=prop+": "+b[prop]+"\n"
}alert(a)
}});
CategoryList=tpCategoryList;
$pdk.ns("$pdk.classes");
$pdk.classes.ChallengeDataWrapper=$pdk.extend(function(){},{constructor:function(a,c){this.controller=a;
this.cd=this.challengeData(c);
tpDebug("challengeDataWrapper constructed","ChallengeDataWrapper",a.id,tpConsts.DEBUG);
var b=this;
a.addEventListener("OnSetToken",function(d){b.onSetToken(d)
});
a.addEventListener("OnMediaLoadStart",function(d){b.onMediaLoadStart(d)
});
a.addEventListener("OnReleaseStart",function(d){b.onReleaseStart(d)
});
a.addEventListener("OnReleaseEnd",function(d){b.onReleaseEnd(d)
});
a.addEventListener("OnPlugInsComplete",function(d){b.onPluginsComplete(d)
});
a.registerFunction("setLicenseServer",this,this.setLicenseServer);
a.registerFunction("getChallengeData",this,this._getChallengeData);
a.registerFunction("setChallengeData",this,this._setChallengeData);
this.currentClipProtected=false;
this.currentClipLicensed=false
},setLicenseServer:function(b,a){this.cd.setLicenseServer(b,a)
},setClip:function(a){this.currentClip=a;
this.cd.setMediaData(a.baseClip.security);
this.cd.flush()
},_getChallengeData:function(){return this.cd.cd
},_setChallengeData:function(){if(this.currentClip){this.cd.flush()
}},onSetToken:function(a){if(a.data.type=="urn:theplatform:auth:token"){this.cd.setToken(a.data.token)
}},onPluginsComplete:function(c){var b=this._getLicenseServers(this.controller.component);
for(var a=0;
a<b.length;
a++){this.setLicenseServer(b[a].security,b[a].url)
}},onMediaLoadStart:function(b){var a=b.data;
if(a.isAd===false||a.baseClip.isAd===false){this.currentClip=a;
this.cd.setMediaData(a.baseClip.security)
}},onReleaseStart:function(c){this.currentClipLicensed=false;
this.currentClipProtected=false;
var a=c.data;
var b=a.mediaPID;
var f=a.accountID;
var d=a.releasePID;
this.cd.setMediaData(null,d,b,f)
},onReleaseEnd:function(a){this.cd.clearMediaData()
},mediaProtected:function(){if(!this.currentClipProtected){this.currentClipProtected=true;
this.controller.dispatchEvent("OnMediaProtected",this.currentClip)
}},mediaLicense:function(){if(!this.currentClipLicensed){this.currentClipLicensed=true;
this.controller.dispatchEvent("OnMediaLicense",this.currentClip)
}},licenseError:function(b){if(!this.currentClip){return
}var a={location:this.controller.id,context:null,clip:this.currentClip,endRelease:true,message:b.message,friendlyMessage:b.details,security:b.security,keySystem:b.keySystem,globalDataType:"com.theplatform.pdk.data::LicenseError"};
tpDebug("There was a security error acquiring a "+b.keySystem+" license for clip: "+this.currentClip.URL+" :: "+b.details,"ChallengeDataWrapper",this.controller.id,tpConsts.WARN);
this.currentClip=null;
this.controller.sendError(a)
},_getLicenseServers:function(a){var b=[];
for(var d in a){if(d.indexOf("licenseserver")==0){var c=a[d].split("|");
b.push({security:c[0],url:c[1]})
}}return b
},challengeData:function(a){return new $pdk.classes.ChallengeData(a,this,this.controller.getProperty("mpx"))
}});
$pdk.classes.ChallengeData=$pdk.extend(function(){},{constructor:function(c,e,d){this.videoEngine=c;
this.wrapper=e;
this.mpx=d;
var a={widevine:"http://widevine.entitlement."+d+"/wv/web/ModularDrm/getWidevineLicense?form=json&schema=1.0&token=<token>&account=http://access.auth."+d+"/data/Account/<account>&_releasePid=<releasePid>&_widevineChallenge=<challenge>",playready:"http://playready.entitlement."+d+"/playready/rightsmanager.asmx"};
this.cd={licenseServers:a,token:"",security:"",releasePid:"",mediaId:"",accountId:"",event:{}};
var b=this;
this.videoEngine.addEventListener("MEDIA_PROTECTED",function(f){b.onMediaProtected(f)
});
this.videoEngine.addEventListener("MEDIA_LICENSE",function(f){b.onMediaLicense(f)
});
this.videoEngine.addEventListener("LICENSE_ERROR",function(f){b.onLicenseError(f)
})
},onMediaProtected:function(a){this.wrapper.mediaProtected(a);
this.cd.event=a.event;
this.flush()
},onMediaLicense:function(a){this.wrapper.mediaLicense(a)
},onLicenseError:function(a){this.wrapper.licenseError(a)
},setLicenseServer:function(b,a){if(b){if(a!=undefined){this.cd.licenseServers[b.toLowerCase()]=a.replace("<mpx>",this.mpx)
}else{delete this.cd.licenseServers[b.toLowerCase()]
}}},setToken:function(a){this.cd.token=a
},setMediaData:function(b,c,a,d){if(b){this.cd.security=b
}if(c){this.cd.releasePid=c
}if(a){this.cd.mediaId=a
}if(d){this.cd.accountId=d
}},clearMediaData:function(){this.cd.security="";
this.cd.releasePid="";
this.cd.mediaId="";
this.cd.accountId="";
this.cd.event={}
},flush:function(){this.videoEngine.setChallengeData(this.cd)
}});
ClipWrapperManager=Class.extend({init:function(a){this.controller=a;
this.initialize()
},initialize:function(){this.controller.registerFunction("registerClipWrapperPlugIn",this,this.registerCWPlugin);
this.controller.registerFunction("setClipWrapper",this,this.setClipWrapper)
},registerCWPlugin:function(d,b){if(!b){b=0
}if(!this.plugIns){this.plugIns=new Array()
}var f={plugin:d,priority:b};
var c=false;
for(var a=0;
a<this.plugIns.length;
a++){var e=this.plugIns[a];
if(f.priority<=e.priority){this.plugIns.splice(a,0,f);
c=true;
break
}}if(!c){this.plugIns.push(f)
}},processClip:function(b){if(this.currentClip){throw"the clipWrapperManager did not complete wrapping one clip before another was started"
}if(b.isWrappingClip||!this.plugIns){return false
}if(b.wasWrapped){b.wasWrapped=false;
return false
}var d=false;
var e={clip:b};
this.currentClip=b;
for(var a=0;
a<this.plugIns.length;
a++){var c=this.plugIns[a];
if(c.plugin.wrapClip(e)){d=true;
break
}}if(!d){this.currentClip=null
}return d
},setClipWrapper:function(a){if(this.currentClip){this.currentClip.wasWrapped=true;
this.currentClip=null;
this.controller.wrapClip(a.preRolls,a.postRolls)
}}});
ControlsManager=EventDispatcher.extend({init:function(a,b,c){this.controller=a;
this._controllerDeferred=b;
this.controlsManager=c;
this.releaseStarted=false;
this._buildListeners()
},initialize:function(b,c){this.successCallback=b;
this.errorCallback=c;
var h=this.controller.getProperty("skinUrl");
if(h&&(h.indexOf(location.hostname)!=-1||h.indexOf("http")!=-1)){this.skinUrl=h
}else{this.skinUrl=h?$pdk.scriptRoot+h:$pdk.scriptRoot+"/../../pdk/skins/cinematic/cinematic.json"
}this.parentNode=document.getElementById(this.controller.id+".controls");
this.isPreview=true;
var g=this;
this.endCardID=this.controller.getProperty("endCard");
var d=this.controller.getProperty("layoutUrl");
var e=this.controller.getProperty("layout");
var a=this.controller.getProperty("useNativeControls")=="true";
var f=this.controller.getProperty("useDefaultPlayOverlay")=="true"||this.controller.getProperty("showControlsBeforeVideo")=="false";
if(f&&!a){setTimeout(function(){c(false,a)
},1)
}if(!a){setTimeout(function(){g.parseMetaLayout(d,e)
},1)
}else{setTimeout(function(){c(false,true)
},1)
}},_buildListeners:function(){this.listeners={};
var a=this;
this.listeners.end=function(b){a.onMediaEnd(b)
};
this.listeners.fullscreen=function(b){a.onShowFullScreen(b)
};
this.listeners.getlanguage=function(b){a.onGetSubtitleLanguage(b)
};
this.listeners.loadStart=function(b){a.onMediaLoadStart(b)
};
this.listeners.loading=function(b){a.onMediaLoading(b)
};
this.listeners.loadrelease=function(b){a.onLoadRelease(b)
};
this.listeners.loadreleaseurl=function(b){a.onLoadRelease(b)
};
this.listeners.mute=function(b){a.onMute(b)
};
this.listeners.paused=function(b){a.onMediaPause(b)
};
this.listeners.playing=function(b){a.onMediaPlaying(b)
};
this.listeners.releaseend=function(b){a.onReleaseEnd(b)
};
this.listeners.releasestart=function(b){a.onReleaseStart(b)
};
this.listeners.resize=function(b){a.onResize(b)
};
this.listeners.seek=function(b){a.onMediaSeek(b)
};
this.listeners.setreleaseurl=function(b){a.onSetReleaseURL(b)
};
this.listeners.showcard=function(b){a.onShowCard(b)
};
this.listeners.hidecard=function(b){a.onHideCard(b)
};
this.listeners.showplayoverlay=function(b){a.onShowPlayOverlay(b)
};
this.listeners.start=function(b){a.onMediaStart(b)
};
this.listeners.unpaused=function(b){a.onMediaUnpause(b)
};
this.listeners.volumechange=function(b){a.onVolumeChange(b)
};
this.listeners.onPlaybackRateChanged=function(b){a.onPlaybackRateChanged(b)
};
this.listeners.noSkipChanged=function(b){a.onNoSkipChanged(b)
};
this.listeners.setShowControls=function(b,c){a.setShowControls(b,c)
};
this.listeners.setPlayerLayoutUrl=function(b){a.setPlayerLayoutUrl(b)
};
this.listeners.setPlayerLayoutXml=function(b){a.setPlayerLayoutXml(b)
};
this.listeners.adLoadFailure=function(){a.onAdLoadFailure()
};
this.listeners.textTracksAvailable=function(b){a.onTextTracksAvailable(b)
};
this.listeners.clearcurrentrelease=function(b){a.onClearCurrentRelease(b)
};
this._controllerDeferred.addEventListener("OnGetSubtitleLanguage",this.listeners.getlanguage);
this._controllerDeferred.addEventListener("OnLoadRelease",this.listeners.loadrelease);
this._controllerDeferred.addEventListener("OnLoadReleaseUrl",this.listeners.loadreleaseurl);
this._controllerDeferred.addEventListener("OnMediaEnd",this.listeners.end);
this._controllerDeferred.addEventListener("OnMediaLoadStart",this.listeners.loadStart);
this._controllerDeferred.addEventListener("OnMediaLoading",this.listeners.loading);
this._controllerDeferred.addEventListener("OnMediaPause",this.listeners.paused);
this._controllerDeferred.addEventListener("OnMediaPlaying",this.listeners.playing);
this._controllerDeferred.addEventListener("OnMediaSeek",this.listeners.seek);
this._controllerDeferred.addEventListener("OnMediaStart",this.listeners.start);
this._controllerDeferred.addEventListener("OnMediaUnpause",this.listeners.unpaused);
this._controllerDeferred.addEventListener("OnMute",this.listeners.mute);
this._controllerDeferred.addEventListener("OnReleaseEnd",this.listeners.releaseend);
this._controllerDeferred.addEventListener("OnClearCurrentRelease",this.listeners.clearcurrentrelease);
this._controllerDeferred.addEventListener("OnReleaseStart",this.listeners.releasestart);
this._controllerDeferred.addEventListener("OnResize",this.listeners.resize);
this._controllerDeferred.addEventListener("OnSetReleaseUrl",this.listeners.setreleaseurl);
this._controllerDeferred.addEventListener("OnShowCard",this.listeners.showcard);
this._controllerDeferred.addEventListener("OnHideCard",this.listeners.hidecard);
this._controllerDeferred.addEventListener("OnShowFullScreen",this.listeners.fullscreen);
this._controllerDeferred.addEventListener("OnShowPlayOverlay",this.listeners.showplayoverlay);
this._controllerDeferred.addEventListener("OnVolumeChange",this.listeners.volumechange);
this._controllerDeferred.addEventListener("OnPlaybackRateChanged",this.listeners.onPlaybackRateChanged);
this._controllerDeferred.addEventListener("OnNoSkipChanged",this.listeners.noSkipChanged);
this._controllerDeferred.addEventListener("__internal__AdLoadFailure",this.listeners.adLoadFailure);
this._controllerDeferred.registerFunction("setShowControls",this,this.listeners.setShowControls);
this._controllerDeferred.registerFunction("setPlayerLayoutUrl",this,this.listeners.setPlayerLayoutUrl);
this._controllerDeferred.registerFunction("setPlayerLayoutXml",this,this.listeners.setPlayerLayoutXml);
this._controllerDeferred.addEventListener("OnTextTracksAvailable",this.listeners.textTracksAvailable)
},addListeners:function(){var a=this;
this.controller.addEventListener("OnGetSubtitleLanguage",this.listeners.getlanguage);
this.controller.addEventListener("OnLoadRelease",this.listeners.loadrelease);
this.controller.addEventListener("OnLoadReleaseUrl",this.listeners.loadreleaseurl);
this.controller.addEventListener("OnMediaEnd",this.listeners.end);
this.controller.addEventListener("OnMediaLoadStart",this.listeners.loadStart);
this.controller.addEventListener("OnMediaLoading",this.listeners.loading);
this.controller.addEventListener("OnMediaPause",this.listeners.paused);
this.controller.addEventListener("OnMediaPlaying",this.listeners.playing);
this.controller.addEventListener("OnMediaSeek",this.listeners.seek);
this.controller.addEventListener("OnMediaStart",this.listeners.start);
this.controller.addEventListener("OnMediaUnpause",this.listeners.unpaused);
this.controller.addEventListener("OnMute",this.listeners.mute);
this.controller.addEventListener("OnReleaseEnd",this.listeners.releaseend);
this.controller.addEventListener("OnClearCurrentRelease",this.listeners.clearcurrentrelease);
this.controller.addEventListener("OnReleaseStart",this.listeners.releasestart);
this.controller.addEventListener("OnResize",this.listeners.resize);
this.controller.addEventListener("OnSetReleaseUrl",this.listeners.setreleaseurl);
this.controller.addEventListener("OnShowCard",this.listeners.showcard);
this.controller.addEventListener("OnHideCard",this.listeners.hidecard);
this.controller.addEventListener("OnShowFullScreen",this.listeners.fullscreen);
this.controller.addEventListener("OnShowPlayOverlay",this.listeners.showplayoverlay);
this.controller.addEventListener("OnVolumeChange",this.listeners.volumechange);
this.controller.addEventListener("OnPlaybackRateChanged",this.listeners.onPlaybackRateChanged);
this.controller.addEventListener("OnNoSkipChanged",this.listeners.noSkipChanged);
this.controller.addEventListener("__internal__AdLoadFailure",this.listeners.adLoadFailure);
this.controller.registerFunction("setShowControls",this,this.listeners.setShowControls);
this.controller.registerFunction("setPlayerLayoutUrl",this,this.listeners.setPlayerLayoutUrl);
this.controller.registerFunction("setPlayerLayoutXml",this,this.listeners.setPlayerLayoutXml);
this.controller.addEventListener("OnTextTracksAvailable",this.listeners.textTracksAvailable)
},setPlayerLayoutUrl:function(a){this.controlsManager.setPlayerLayoutUrl(a)
},setPlayerLayoutXml:function(a){this.controlsManager.setPlayerLayoutXml(a)
},onNoSkipChanged:function(b){var a=b.data;
if(a.baseClip.isAd&&!a.baseClip.noSkip){this.controlsManager.enableNext(true);
this.enableNextOnControlsChanged=true
}},onTextTracksAvailable:function(a){var b=this.clip.baseClip.isAd?[]:a.data.entries;
this.setAvailableLanguages(b)
},setAvailableLanguages:function(c){var a=[];
for(var b=0;
b<c.length;
b++){if(a.indexOf(c[b].language)==-1){a.push(c[b].language)
}}this.controlsManager.setSubtitleLanguages(a)
},parseMetaLayout:function(a,g){var h=this;
if(this.skinUrl.indexOf(".swf")!=-1){tpDebug("You're trying to use a swf skin with an HTML5 player, this won't work. Use a JSON skin",this.controller.id,"ControlsManager",tpConsts.WARN);
this.errorCallback();
return
}h.addListeners();
tpDebug("Parsed metalayout, controls should appear");
var f=h.controller.supportsFullScreen()&&h.controller.getProperty("allowFullScreen")!="false";
var c=h.controller.supportsMute()!=false;
var d=h.controller.supportsVolume()!=false;
var b=h.controller.checkIfEndCardExists()!=false;
var e=h.controller.supportsFastForward()!=false;
tpDebug("SupportsFullScreen is "+f);
h.controller.hidePlayerCard("none");
h.controlsManager.supportsMute(c);
h.controlsManager.supportsVolume(d);
h.controlsManager.supportsFullScreen(f);
h.controlsManager.supportsFastForward(e);
h.controlsManager.supportsMenuCard(b);
h.controlsManager.setIsFullScreen(false);
h.controlsManager.setIsPreview(h.isPreview);
h.controlsManager.setFullScreen(false);
h.controlsManager.hasCC(false);
var i=this.releaseStarted;
h.controlsManager.releaseStarted(i);
h.controlsManager.syncState();
h.releaseStarted=i;
h.controller.getSubtitleLanguage();
h.successCallback()
},onSetReleaseURL:function(a){this.releaseStarted=false;
this.controlsManager.releaseStarted(false);
this.controlsManager.hasCC(false);
this.controlsManager.releaseLoaded()
},onLoadRelease:function(c){this.releaseStarted=false;
this.controlsManager.releaseStarted(false);
this.controlsManager.releaseLoaded();
this.setTimes(0,c.data.duration);
this.controlsManager.setPercentLoaded(0);
this.controlsManager.setClipTitle(c.data.title);
if(c.data&&c.data.captions&&c.data.captions.length>0){var b=c.data.captions;
var d=[];
for(var a=0;
a<b.length;
a++){var f=b[a].lang?b[a].lang:b[a].language;
if(f){d.push({language:f})
}}this.setAvailableLanguages(d)
}},onShowPlayOverlay:function(a){if(!this.releaseStarted){this.controlsManager.releaseStarted(false);
tpDebug("onShowPlayOverlay Setting isPreview "+a.data);
this.controlsManager.setIsPreview(a.data);
this.isPreview=a.data
}},onHideCard:function(b){var a=b.data;
this.controlsManager.cardShowing(false,a.card,a.deck)
},onShowCard:function(b){var a=b.data;
this.controlsManager.cardShowing(true,a.card,a.deck)
},onReleaseStart:function(g){var a=g.data;
if(!a){return
}this.release=a;
this.releaseStarted=true;
this.releaseLength=a.chapters.aggregateLength;
var f=[];
this.adCounts=[];
this.adIndex=0;
this.currentChapter=0;
var c;
for(var d=0;
d<a.chapters.chapters.length;
d++){c=a.chapters.chapters[d];
this.adCounts[d]=Math.max(0,c.contentIndex-(c.adIndex>-1?c.adIndex:c.contentIndex))
}var b=this.getNumberOfPostRollClips(a);
if(b>0){this.adCounts.push(b)
}for(d=1;
d<a.chapters.chapters.length;
d++){f.push(a.chapters.chapters[d].aggregateStartTime/this.releaseLength)
}this.currentChapters=f;
this.controlsManager.setPercentLoaded(0);
this.controlsManager.releaseStarted(true);
if(a.clips&&a.clips.length>0){this.controlsManager.setClipTitle(a.clips[0].title)
}tpDebug("Setting isPreview false");
this.controlsManager.setIsPreview(false);
this.isPreview=false
},getNumberOfPostRollClips:function(a){var b=0;
if(a.baseClips[a.baseClips.length-1].isAd){b=1;
for(var c=a.baseClips.length-2;
c>=0;
c--){if(a.baseClips[c].isAd){b++
}else{break
}}}return b
},onClearCurrentRelease:function(a){this.onReleaseEnd(a);
this.controlsManager.releaseCleared()
},onReleaseEnd:function(a){this.controlsManager.clearImageTracks();
this.releaseStarted=false;
this.controlsManager.setSubtitleLanguages([]);
this.controlsManager.setPercentLoaded(0);
this.controlsManager.setClipTitle("");
this.setTimes(0,1,0,0);
this.controlsManager.setIsAd(false);
this.controlsManager.releaseStarted(false);
this.controlsManager.pause();
this.controlsManager.hasCC(false);
this.controlsManager.setChapterPoints([]);
this.currentChapters=[]
},onAdLoadFailure:function(){this.setCurrentChapter();
if(this.adIndex===0){this.adCounts[this.currentChapter]--
}else{this.adIndex++
}},onMediaLoadStart:function(g){var d=g.data;
var b=0;
this.controlsManager.mediaNoSkip(d.baseClip.noSkip);
this.controlsManager.setIsAd(d.baseClip.isAd);
this.controlsManager.isAd(d.baseClip.isAd);
this.controlsManager.setClipTitle(d.title);
var c=this.controller.getCurrentPlaylist();
var a=this.controller.getMainPlaylist();
this.setCurrentChapter();
if(d.baseClip.isAd){this.adIndex++
}if(c.playlistID!=a.playlistID){var f=this.differentPlaylists(c,this.lastCurrentPlaylist);
this.lastCurrentPlaylist=c;
if(f&&this.adCounts[this.currentChapter]>=1&&c.clips.length&&c.clips[0].baseClip.isAd){b=this.countFetchedAds(c,a);
if(b>0){this.adCounts[this.currentChapter]+=b-1
}}}if(d.chapter&&d.chapter.chapters){this.setTimes(d.chapter.aggregateStartTime+d.offset,d.chapter.chapters.aggregateLength,this.adIndex,this.adCounts[this.currentChapter]);
if(!d.baseClip.isAd&&!d.baseClip.noSkip&&this.controller.supportsSeek()){this.controlsManager.setChapterPoints(!this.currentChapters?[]:this.currentChapters)
}else{this.controlsManager.setChapterPoints([])
}}else{if(d.baseClip.isAd){if(d.endTime>0){this.setTimes(d.startTime,d.endTime,this.adIndex,this.adCounts[this.currentChapter])
}else{this.setTimes(0,d.length,this.adIndex,this.adCounts[this.currentChapter])
}}else{if(d.baseClip.trueLength>0){this.setTimes(d.startTime+d.offset,d.baseClip.trueLength,0,0)
}else{this.setTimes(d.startTime+d.offset,this.releaseLength,0,0)
}}this.controlsManager.setChapterPoints([])
}if(d.baseClip.availableImageTracks&&typeof(d.baseClip.availableImageTracks)&&d.baseClip.availableImageTracks.length>0&&!d.baseClip.isAd){this.controlsManager.setAvailableImageTracks(d.baseClip.availableImageTracks)
}if(d.baseClip.isAd){this.controlsManager.setPercentLoaded(0)
}if(!d.baseClip||d.baseClip.isAd||!d.baseClip.URL||d.baseClip.URL!==this.previousBaseClipURL){this.controlsManager.syncState()
}if(d.baseClip){this.previousBaseClipURL=d.baseClip.URL
}},onMediaStart:function(c){tpDebug("Setting isPreview false");
this.controlsManager.setIsPreview(false);
this.isPreview=false;
this.lastSeek=undefined;
this.clip=c.data;
var b=c.data;
this.setAvailableLanguages(b.baseClip.isAd?[]:b.baseClip.availableTextTracks);
this.controlsManager.setIsAd(b.baseClip.isAd);
var a=this.controller.supportsFullScreen();
this.controlsManager.supportsFullScreen(a);
this.controlsManager.supportsFastForward(this.controller.supportsFastForward());
this.controlsManager.mediaStarted();
this.controlsManager.mediaNoSkip(b.baseClip.noSkip);
this.controlsManager.isAd(b.baseClip.isAd);
this.controlsManager.setClipTitle(b.title);
if(!b.baseClip.isAd&&!b.baseClip.noSkip&&this.controller.supportsSeek()){this.controlsManager.setChapterPoints(!this.currentChapters?[]:this.currentChapters)
}},countFetchedAds:function(f,b){var e,d;
var a=0;
var c;
for(e=0;
e<f.clips.length;
e++){c=true;
for(d=0;
d<b.clips.length;
d++){if(f.clips[e].id===b.clips[d].id){c=false;
break
}}if(c){a++
}}return a
},differentPlaylists:function(c,b){if((c&&!b)||(!c&&b)){return true
}if(c.playlistID!=b.playlistID){return true
}if(c.clips.length!=b.clips.length){return true
}for(var a=0;
a<c.clips.length;
a++){if(c.clips[a].id!=b.clips[a].id){return true
}}return false
},seekWithinChapter:function(a,b){return(b.endTime>a.end.mediaTime&&b.startTime<a.end.mediaTime)
},onMediaSeek:function(a){this.isPlaying=false;
if(!this.seekWithinChapter(a.data,this.clip)){this.lastSeek=a.data
}if(a.data.end.durationAggregate){this.setTimes(a.data.end.currentTimeAggregate,a.data.end.durationAggregate,0,0)
}else{if(a.data.clip.chapter){this.setTimes(a.data.end.currentTimeAggregate,a.data.clip.chapter.chapters.aggregateLength,0,0)
}else{this.setTimes(a.data.end.currentTimeAggregate,this.releaseLength,0,0)
}}},setCurrentChapter:function(){if(this.lastSeek&&this.release){var a=this.lastSeek.end.mediaTime;
var c=this.release.chapters.chapters;
for(var b=0;
b<c.length;
b++){if(a>c[b].startTime&&a<c[b].endTime){this.currentChapter=b;
break
}}this.lastSeek=undefined
}},setTimes:function(d,c,a,b){if(c===Infinity){c=-2
}if(isNaN(a)||isNaN(b)){this.controlsManager.setTimes(d,c)
}else{this.controlsManager.setTimes(d,c,a,b)
}},onMediaLoading:function(a){this.controlsManager.setPercentLoaded(a.data.ratioLoaded)
},onMediaEnd:function(c){var b=c.data;
if(!b.baseClip.isAd&&b.chapter){this.currentChapter++;
this.adIndex=0
}if((b.baseClip.isAd||b.baseClip.noSkip)&&b.currentMediaTime>0){this.setTimes(0,0,this.adIndex,this.adCounts[this.currentChapter])
}this.isPlaying=false;
var a=this;
this.controlsManager.clearImageTracks();
if(this.enableNextOnControlsChanged){this.controlsManager.enableNext(false);
this.enableNextOnControlsChanged=false
}},onMediaPlaying:function(a){if(!this.releaseStarted){this.releaseStarted=true;
this.controlsManager.releaseStarted(false);
this.controlsManager.releaseStarted(this.releaseStarted)
}this.controlsManager.setIsPreview(false);
if(!this.isPlaying){this.isPlaying=true;
this.controlsManager.play()
}if(a.data.currentTimeAggregate!==undefined){if(a.data.durationAggregate>0){this.setTimes(a.data.currentTimeAggregate,a.data.durationAggregate,this.adIndex,this.adCounts[this.currentChapter])
}else{this.setTimes(a.data.currentTimeAggregate,this.releaseLength,this.adIndex,this.adCounts[this.currentChapter])
}}else{if(a.data.duration>0){this.setTimes(a.data.currentTime,a.data.duration,this.adIndex,this.adCounts[this.currentChapter])
}else{this.setTimes(a.data.currentTime,this.releaseLength,this.adIndex,this.adCounts[this.currentChapter])
}}},onMediaPause:function(a){this.isPlaying=false;
this.controlsManager.pause()
},onMediaUnpause:function(a){this.isPlaying=true;
this.controlsManager.play()
},onMute:function(a){this.controlsManager.mute(a.data)
},onVolumeChange:function(a){this.controlsManager.setVolume(a.data/100)
},onPlaybackRateChanged:function(a){this.controlsManager.setPlaybackRate(a.data.rate)
},onShowFullScreen:function(a){this.controlsManager.setIsFullScreen(a.data);
this.controlsManager.setFullScreen(a.data)
},onGetSubtitleLanguage:function(a){var b=a.data.langCode;
this.controlsManager.setSubtitleLanguage(b)
},onResize:function(a){this.controlsManager.setSize(a.data.width+"px",a.data.height+"px")
},setShowControls:function(a,b){this.controller.dispatchEvent("OnShowControls",{visible:a,regionId:b})
}});
var tpJsonContexts=new Object();
function tpRegisterJsonContext(b){var a=(((1+Math.random())*65536)|0).toString(16).substring(1);
tpJsonContexts[a]=b;
return a
}function tpJSONLoaderCallback(b,a){tpJsonContexts[a](b)
}JSONLoader=Class.extend({init:function(){},load:function(a,i,b,g,e,f){if(!b){b="callback"
}if(!e){e="context"
}if(!g){g="tpJSONLoaderCallback"
}var c=tpRegisterJsonContext(function(){i(arguments[0],a)
});
if(a.indexOf("?")>=0){a+="&"+b+"="+g+"&"+e+"="+c
}else{a+="?"+b+"="+g+"&"+e+"="+c
}var d=document.getElementsByTagName("head")[0];
var h=document.createElement("script");
h.type="text/javascript";
h.src=a;
h.onerror=function(j){tpDebug("Failed to load "+h.src);
if(typeof(f)==="function"){f(j)
}};
d.appendChild(h)
}});
OverlayManager=Class.extend({init:function(a,b){this.controller=a;
this.playerElement=b;
var c=this;
this.controller.registerFunction("getOverlayArea",this,this.getOverlayArea);
this.controller.registerFunction("setOverlayArea",this,this.setOverlayArea);
this.controller.addEventListener("OnMediaAreaChanged",function(d){c.mediaAreaChanged(d)
})
},getBrowserOffset:function(){if(this.controller.component.videoengineruntime&&this.controller.component.videoengineruntime==="silverlight"){return 38
}if(navigator.userAgent.toLowerCase().indexOf("chrome")>-1){return 32
}if(navigator.userAgent.toLowerCase().indexOf("msie")>-1){return 42
}if(tpIsIOS()){return 54
}if(navigator.userAgent.toLowerCase().indexOf("safari")>-1){return 24
}if(navigator.userAgent.toLowerCase().indexOf("firefox")>-1){return 28
}return 35
},setOverlayArea:function(a){if(a.width>0&&a.height>0){this.useNativeDefaults=false;
this.overlayArea=a;
this.controller.dispatchEvent("OnOverlayAreaChanged",this.getOverlayArea())
}},getOverlayArea:function(d,a,c){if(this.overlayArea&&!c){if(a){this.controller.dispatchEvent("OnOverlayAreaChanged",this.overlayArea)
}return this.overlayArea
}var b={};
var e=!this.useNativeDefaults?this.getBrowserOffset():0;
b.height=this.playerElement.clientHeight-e;
b.width=this.playerElement.clientWidth;
b.top=this.playerElement.clientTop;
b.left=this.playerElement.clientLeft;
b.bottom=b.top+b.height;
b.right=b.left+b.width;
b.topLeft={x:b.left,y:b.top};
b.bottomRight={x:b.right,y:b.bottom};
b.size={x:b.width,y:b.height};
b.x=b.left;
b.y=b.top;
if(d){b.x+=$pdk.jQuery(this.playerElement).offset().left;
b.y+=$pdk.jQuery(this.playerElement).offset().top
}if(a){this.controller.dispatchEvent("OnOverlayAreaChanged",b)
}if(c){this.overlayArea=b
}return b
},mediaAreaChanged:function(a){}});
var PdkEvent=new Object();
PdkEvent.OnPlayerLoaded="OnPlayerLoaded";
PdkEvent.OnResetPlayer="OnResetPlayer";
PdkEvent.OnPlugInLoaded="OnPlugInLoaded";
PdkEvent.OnPlugInsComplete="OnPlugInsComplete";
PdkEvent.OnMediaLoadStart="OnMediaLoadStart";
PdkEvent.OnMediaPlay="OnMediaPlay";
PdkEvent.OnMediaClick="OnMediaClick";
PdkEvent.OnMediaBuffer="OnMediaBuffer";
PdkEvent.OnMediaEnd="OnMediaEnd";
PdkEvent.OnMediaError="OnMediaError";
PdkEvent.OnMediaComplete="OnMediaComplete";
PdkEvent.OnMediaLoading="OnMediaLoading";
PdkEvent.OnMediaPause="OnMediaPause";
PdkEvent.OnMediaTime="OnMediaTime";
PdkEvent.OnMediaPlaying="OnMediaPlaying";
PdkEvent.OnMediaStart="OnMediaStart";
PdkEvent.OnMediaUnpause="OnMediaUnpause";
PdkEvent.OnReleaseEnd="OnReleaseEnd";
PdkEvent.OnReleaseStart="OnReleaseStart";
PdkEvent.OnReleaseSelected="OnReleaseSelected";
PdkEvent.OnMediaSeek="OnMediaSeek";
PdkEvent.OnMute="OnMute";
PdkEvent.OnSetVolume="OnSetVolume";
PdkEvent.OnPlaybackRateChanged="OnPlaybackRateChanged";
PdkEvent.OnSetRelease="OnSetRelease";
PdkEvent.OnSetReleaseUrl="OnSetReleaseUrl";
PdkEvent.OnLoadRelease="OnLoadRelease";
PdkEvent.OnLoadReleaseUrl="OnLoadReleaseUrl";
PdkEvent.OnSetSmil="OnSetSmil";
PdkEvent.OnLoadSmil="OnLoadSmil";
PdkEvent.OnShowFullScreen="OnShowFullScreen";
PdkEvent.OnShowPlayOverlay="OnShowPlayOverlay";
PdkEvent.OnShowPreviewImageOverlay="OnShowPreviewImageOverlay";
PdkEvent.OnShowControls="OnShowControls";
PdkEvent.OnStreamSwitched="OnStreamSwitched";
PdkEvent.OnGetSubtitleLanguage="OnGetSubtitleLanguage";
PdkEvent.OnRefreshCategoryModel="OnRefreshCategoryModel";
PdkEvent.OnRefreshReleaseModel="OnRefreshReleaseModel";
PdkEvent.OnLoadReleaseModel="OnLoadReleaseModel";
PdkEvent.OnRefreshReleaseModelStarted="OnRefreshReleaseModelStarted";
PdkEvent.OnCategorySelected="OnCategorySelected";
PlaybackManager=Class.extend({init:function(h,c){this.player=h;
this.controller=c;
var i={fontFamily:"Calibri, Helvetica, Arial",fontColor:"white",textAlign:"left",textAlignVertical:"top"};
var b={fontFamily:"Calibri, Helvetica, Arial",fontColor:"white",fontEdge:"dropshadow",textAlign:"center",textAlignVertical:"bottom"};
var f="tp_subtitles_settings";
var e=this;
var g=e.controller.getOverlayArea();
this.plugins=new Array();
e.subtitlesLoader=new $pdk.queue.deferred.loader.Subtitles(e.controller,g,document.getElementById(e.controller.id+".subtitles"),f,6,i,b,true,e.controller.getProperty("enableDynamicSubtitleFonts"));
this.subtitlesSettingsManagerLoader=new $pdk.queue.deferred.loader.SubtitlesSettingsManager(this.controller,f);
this.veSubtitlesManager=new $pdk.classes.VideoEngineSubtitlesManager(this.controller,this.player.videoEngine);
this.replacePlaylistManager=new $pdk.classes.ReplacePlaylistManager();
var e=this;
c.addEventListener("OnLoadReleaseUrl",function(){e.handleLoadReleaseUrl.apply(e,arguments)
});
this.mediaSeekHandler=function(){e.handleMediaSeek.apply(e,arguments)
};
c.addEventListener("OnMediaSeek",this.mediaSeekHandler);
this.mediaStartHandler=function(){e.handleMediaStart.apply(e,arguments)
};
c.addEventListener("OnMediaStart",this.mediaStartHandler);
this.mediaLoadStartHandler=function(){e.handleMediaLoadStart.apply(e,arguments)
};
c.addEventListener("OnMediaLoadStart",this.mediaLoadStartHandler);
this.releaseSelectedHandler=function(){e.handleReleaseSelected.apply(e,arguments)
};
c.addEventListener("OnReleaseSelected",this.releaseSelectedHandler);
this.releaseStartedHandler=function(){e.handleReleaseStarted.apply(e,arguments)
};
c.addEventListener("OnReleaseStart",this.releaseStartedHandler);
this.internalLoadReleaseUrlHandler=function(){e.handleInternalLoadReleaseUrl.apply(e,arguments)
};
c.addEventListener("__internal__OnLoadReleaseUrl",this.internalLoadReleaseUrlHandler);
this._metadataUrlManager=new $pdk.plugin.MetadataUrlManager(this.controller);
this.urlManager=new UrlManager(this.controller);
var a=this.controller.getProperty("useNativeControls")=="true";
var d=this.controller.getProperty("useDefaultPlayOverlay")=="true"||this.controller.getProperty("showControlsBeforeVideo")=="false";
if(d||a){setTimeout(function(){e.controlsLoaded=true;
e.player.controlsLoaded(false,a)
},1)
}if(!a){this.controlsLoader=new $pdk.queue.deferred.loader.ControlsLoader(this.controller,document.getElementById(this.controller.id).parentElement.id,function(){e.controlsLoaded=true;
e.player.controlsLoaded(true,false);
if(e.controlsLoadedCallback){e.controlsLoadedCallback()
}},function(k,j){e.controlsLoaded=true;
e.player.controlsLoaded(k,j)
})
}this.releaseUrl=this.player.releaseUrl;
this.tokenManager=new TokenManager(this.controller);
this.overlayManager=new OverlayManager(this.controller,this.player.container);
this.standbyManager=new StandbyManager(this.controller,this);
this.plugins=new Array();
this.pluginsComplete=false;
c.addEventListener("OnPlugInsComplete",function(){e.pluginsComplete=true
});
c.registerFunction("setRelease",this,this.setRelease);
c.registerFunction("setReleaseURL",this,this.setReleaseURL);
c.registerFunction("tryWritePlayer",this,this.tryWritePlayer);
c.registerFunction("pause",this,this.pause);
c.registerFunction("endRelease",this,this.endRelease);
c.registerFunction("endCurrentRelease",this,this.endRelease);
c.registerFunction("clearCurrentRelease",this,this.clearCurrentRelease);
c.registerFunction("resetRelease",this,this.resetRelease);
c.registerFunction("getCurrentRelease",this,this.getCurrentRelease);
c.registerFunction("getCurrentPlaylist",this,this.getCurrentPlaylist);
c.registerFunction("getMainPlaylist",this,this.getMainPlaylist);
c.registerFunction("injectPlaylist",this,this.injectPlaylist);
c.registerFunction("insertPlaylist",this,this.insertPlaylist);
c.registerFunction("playlistReplaced",this,this.playlistReplaced);
c.registerFunction("wrapClip",this,this.wrapClip);
c.registerFunction("insertClip",this,this.insertClip);
c.registerFunction("mute",this,this.doMute);
c.registerFunction("setVolume",this,this.setVolume);
c.registerFunction("setSmil",this,this.setSmil);
c.registerFunction("updateMediaTime",this,this.updateMediaTime);
c.registerFunction("updateClip",this,this.updateClip);
c.registerFunction("updatePlaylist",this,this.updatePlaylist);
c.registerFunction("endMedia",this,this.endMedia);
c.registerFunction("sendError",this,this.sendError);
c.registerFunction("getMuteState",this,this.getMuteState);
c.registerFunction("getVolume",this,this.getVolume);
c.registerFunction("registerPlaylistPlugIn",this,this.registerPlaylistPlugIn);
c.registerFunction("markOffset",this,this.markOffset);
c.registerFunction("playPlaylist",this,this.playPlaylist);
c.registerFunction("loadReleaseURL",this,this.loadReleaseURL);
c.registerFunction("loadRelease",this,this.loadRelease);
c.registerFunction("nextClip",this,this.nextClipExternal);
c.registerFunction("previousClip",this,this.previousClip);
c.registerFunction("nextRelease",this,this.advanceToNextRelease);
var e=this;
c.registerFunction("initializePlayback",this,this.initializePlayback);
this.adManager=new AdManager(c);
this.clipWrapperManager=new ClipWrapperManager(c);
this.challengeData=new $pdk.classes.ChallengeDataWrapper(this.controller,this.player.videoEngine);
this.trackingManager=new $pdk.managers.TrackingUrlManager(c,h.player);
this.fullScreenManager=new FullScreenManager(c,this,h.enableFullWindow);
this.advanceClipFromExternalCall=false;
com.theplatform.pdk.SelectorExported={getInstance:function(j){this._scopes=j.split(",");
return this
},parseClip:function(j){return c.callFunction("createClipFromBaseClip",[j],this._scopes)
},parsePlaylist:function(j,k){return c.callFunction("doParsePlaylist",[j,k],this._scopes)
}}
},preloadContent:function(){var a=this.getFirstContentClip();
var c=this.getFirstClipWithSameURL(a);
if(c&&!this.isDashMedia(c)&&this.isFlashContext()){var d=c.startTime+c.offset;
var b=this.player.createMediaFileFromClip(c);
this.videoEngine.preload(b,d)
}},getFirstContentClip:function(){var a=function(b){return !b.baseClip.isAd
};
return this.filterPlaylistByCondition(a)
},getFirstClipWithSameURL:function(b){var a=function(c){return c.URL===b.URL
};
return this.filterPlaylistByCondition(a)
},filterPlaylistByCondition:function(a){if(this.playlist&&this.playlist.clips){for(var b=0;
b<this.playlist.clips.length;
b++){var c=this.playlist.clips[b];
if(a(c)){return c
}}}},isDashMedia:function(a){return a.baseClip.type==="application/dash+xml"
},isFlashContext:function(){return this.controller.component.videoengineruntime==="flash"
},registerPlaylistPlugIn:function(a,b){this.plugins.push({playlistPlugIn:a,priority:b});
function c(e,d){if(e.priority<d.priority){return -1
}else{if(e.priority>d.priority){return 1
}else{return 0
}}}this.plugins.sort(c)
},handleReleaseSelected:function(a){if(a.originator.controlId!=this.controller.componentId&&a.originator.controlId.indexOf("player")<0){this.currentReleaseList=a.originator.controlId
}this.tryingToAdvance=false
},handleReleaseStarted:function(a){this.fastForwardSupported=undefined
},initializePlayback:function(){this.pluginsComplete=true;
if(this.waitReleaseCall){if(this.waitReleaseCall.url){this.setReleaseURL(this.waitReleaseCall.url,this.waitReleaseCall.replaceDefault)
}else{if(this.waitReleaseCall.release){this.setRelease(this.waitReleaseCall.release,this.waitReleaseCall.replaceDefault)
}}this.waitReleaseCall=null
}else{if(this.waitSmil){this.setSmil(this.waitSmil);
this.waitSmil=null
}}},handleMediaStart:function(b){var a=b.data;
a.offset=0;
this.clipStarted=true;
this.wasError=false;
this.updateClip(a)
},handleInternalLoadReleaseUrl:function(a){if(a.data&&a.data.captions){if(this.shouldStripVTT(a.data.captions)){this.stripMetadataVTT(a.data)
}}this.controller.dispatchEvent("OnLoadReleaseUrl",a.data)
},handleMediaLoadStart:function(a){if(this.shouldStripVTT(a.data.baseClip.availableSubtitles)){tpDebug("calling stripVTT(clip)");
this.stripVTT(a.data)
}},handleLoadReleaseUrl:function(a){this.tryingToAdvance=false;
if(this.releaseProcess&&this.playlist){this.endRelease();
this.destroyReleaseProcess(this.releaseProcess);
this.releaseProcess=undefined;
this.playlist=undefined
}if(!this.currentRelease||this.currentRelease.pid!=a.data.pid){this.currentRelease=this.convertRawRelease(a.data)
}else{this.appendRawDataToRelease(this.currentRelease,a.data)
}if((tpIsIOS()||tpIsAndroid())&&this.isPrefetch()){release.url=this.releaseUrl;
this.setRelease(release)
}},convertRawRelease:function(a){if(a.pubDate){a.airdate=new Date(a.pubDate)
}return a
},appendRawDataToRelease:function(a,b){if(b.captions){a.captions=b.captions
}if(b.categories){a.categories=b.categories
}if(b.chapters){a.chapters=b.chapters
}if(b.copyright){a.copyright=b.copyright
}if(b.provider){a.provider=b.provider
}if(b.customValues){a.customValues=b.customValues
}if(b.mediaPID){a.mediaPID=b.mediaPID
}else{if(b.mediaPid){a.mediaPID=b.mediaPid
}}},isPrefetch:function(){return this.controller.isPrefetch()
},getCurrentRelease:function(){return this.currentRelease
},getCurrentPlaylist:function(){if(this.releaseProcess){return this.releaseProcess.getCurrentPlaylist()
}},getMainPlaylist:function(){return this.playlist
},getChapterFromOffset:function(b,d){if(d<=b.aggregateLength){for(var a=0;
a<b.chapters.length;
a++){var e=b.chapters[a];
if(e.aggregateStartTime+e.length>=d){e.offset=d-e.aggregateStartTime;
return e
}}}if(b.chapters.length==1){return b.chapters[0]
}return null
},markOffset:function(e,a,b){if(b===undefined){b=true
}var c=this.getChapterFromOffset(e.chapters,a);
var d;
if(!c||c.contentIndex==e.currentIndex){}else{e.currentIndex=c.contentIndex
}d=e.clips[e.currentIndex];
if(c){d.offset=c.offset;
if(c.adIndex>=0&&b){e.currentIndex=c.adIndex
}}else{if(a<d.length){d.offset=a
}else{d.offset=d.length
}}},playCurrentRelease:function(){if(this.playlist&&this.playlist.releaseURL==this.releaseUrl){this.playlist.currentClipIndex=-1;
this.clipEnded=false;
this.controller.dispatchEvent("OnReleaseStart",this.playlist);
this.releaseProcess.setPlaylist(this.playlist)
}else{if(this.playlist&&this.playlist.isAd===true&&this.isPrefetch()&&(tpIsIOS()||tpIsAndroid())){tpDebug("playCurrentRelease.isAd");
this.nextClip(false);
this.clipEnded=false
}else{if(this.releaseUrl){if(!this.clipEnded){}this.currentClip=undefined;
this.playlist=undefined;
this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:this.releaseUrl,userInitiated:true});
this.setReleaseURL(this.releaseUrl)
}else{tpDebug("ERROR: No release to play!","PlaybackManager",tpConsts.ERROR)
}}}},setRelease:function(a,b){if(!this.pluginsComplete){this.waitReleaseCall={url:null,release:a,replaceDefault:b};
return
}var d=this;
if(this.isNoSkipPlaying()||this.defaultBlocksPlayback(b)){return
}if(this.currentClip&&!this.clipEnded){this.controller.dispatchEvent("OnMediaEnd",this.currentClip)
}this.releaseSetInProcess=true;
var c={};
$pdk.apply(c,a);
this.currentRelease=c;
d.currentRelease.url=c.url;
this.tryingToAdvance=false;
d.controller.callFunction("setReleaseGwt",[c])
},setReleaseURL:function(b,a){if(!this.pluginsComplete){this.waitReleaseCall={url:b,release:null,replaceDefault:a};
return
}if(this.isNoSkipPlaying()||this.defaultBlocksPlayback(a)){return
}this.currentRelease=null;
this.tryingToAdvance=false;
this.releaseSetInProcess=true;
tpTime("Time to setReleaseUrl until OnMediaLoadStart");
tpTime("Time to setReleaseUrl until OnMediaStart");
this.controller.callFunction("setReleaseURLGwt",[b])
},loadReleaseURL:function(b,a){if(!b){tpDebug("This release has no URL","LoadReleaseManager",tpConsts.ERROR);
return
}if(a===false){var c=this.controller.getProperty("releaseUrl");
if(c!==undefined){return
}}this.currentRelease=null;
this.controller.callFunction("loadReleaseUrlGwt",[b])
},loadRelease:function(a,b){var c=a.url;
if(!c){tpDebug("This release has no URL","LoadReleaseManager",tpConsts.ERROR);
return
}if(b===false){var d=this.controller.getProperty("releaseUrl");
if(d!==undefined){return
}}this.currentRelease=a;
this.controller.callFunction("loadReleaseGwt",[c])
},tryWritePlayer:function(){if(tpIsIOS()||tpIsAndroid()){tpDebug("doSetReleaseUrl: calling writePlayer()");
this.controller.writePlayer("",true)
}},isNoSkipPlaying:function(){return this.currentClip&&this.currentClip.baseClip&&this.currentClip.baseClip.noSkip
},defaultBlocksPlayback:function(a){if(a===false&&this.player.releaseUrl){return true
}return false
},qs:function(a){return a.indexOf("?")>=0?"&":"?"
},dispatchReleaseError:function(b,a){tpDebug("Error loading SMIL XML");
if(b){this.error=b;
this.controller.showPlayerCard("forms","tpErrorCard",null,{title:this.error.title,message:this.error.description,exception:this.error.exception,responseCode:this.error.responseCode,playNext:true})
}this.controller.dispatchEvent("OnReleaseError",{url:a,title:b.title,description:b.description,exception:b.exception,responseCode:b.responseCode,alternateSrc:b.alternateSrc})
},setSmil:function(a){if(!this.pluginsComplete){this.waitSmil=a;
return
}if(this.isNoSkipPlaying()){return
}this.currentRelease=null;
this.tryingToAdvance=false;
this.controller.callFunction("setSmilGwt",[a])
},pause:function(b,a){if(this.video){this.player.pauseUserInitiated=!!a;
if(b){this.doPauseVideo()
}else{this.doUnPauseVideo()
}}},doPauseVideo:function(){if(this.currentClip&&this.currentClip.streamType==="empty"){if(!this.isNoopClip(this.currentClip)){this.controller.getVideoProxy().pause()
}this.controller.dispatchEvent("OnPlayerPause")
}else{if(this.videoEngine.isPaused()==false){this.videoEngine.pause();
this.controller.dispatchEvent("OnPlayerPause")
}}},doUnPauseVideo:function(){this.play();
this.controller.dispatchEvent("OnPlayerUnPause");
if(this.clipStarted){this.player.onPlay()
}},play:function(){if(this.isNoopClip(this.currentClip)){return
}if(this.currentClip&&this.currentClip.streamType==="empty"){this.controller.getVideoProxy().play()
}else{tpDebug("PBM calling play!");
this.videoEngine.play()
}},setVolume:function(a){this.videoEngine.setVolume(a/100);
this.controller.dispatchEvent("OnVolumeChange",a);
this._oldVolume=a
},getVolume:function(){return this._oldVolume
},doMute:function(a){if(this._isMuted==undefined){this._isMuted=false
}if(a!=this._isMuted){this._isMuted=a;
this.videoEngine.mute(this._isMuted);
if(this._isMuted){this._oldVolume=this.videoEngine.getVolume();
this.videoEngine.setVolume(0)
}else{if(this._oldVolume){if(this._oldVolume>=0){this.videoEngine.setVolume(this._oldVolume)
}this.oldVolume=undefined
}}this.controller.dispatchEvent("OnMute",this._isMuted)
}},getMuteState:function(){return this._isMuted
},stripM3U:function(d){var a=0;
var e=0;
var c;
var b=false;
for(;
a<d.clips.length;
a++){if(!d.clips[a].isAd&&d.baseClips[a].URL.indexOf("m3u")!=-1){if(!b){b=true;
e=a;
c=d.baseClips[a].URL;
d.clips[a].endTime=d.clips[a].mediaLength;
d.chapters.chapters=[d.chapters.chapters[0]];
d.chapters.chapters[0].length=d.clips[0].mediaLength
}else{if(d.baseClips[a].URL==c){d.baseClips.splice(a,1);
d.clips.splice(a,1);
a--
}}}else{if(b&&d.baseClips[a].URL!=c&&a>0&&a<(d.clips.length-1)){d.baseClips.splice(a,1);
d.clips.splice(a,1);
a--
}else{if(b){d.clips[a].clipIndex=a
}}}}},hasVTT:function(c){var b=false;
if(c||c.length>0){var a=0;
for(a;
a<c.length;
a++){if(this._isVTTCaption(c[a])){b=true;
break
}}}return b
},shouldStripVTT:function(a){if(this.hasVTT(a)&&(!this._usingHTML5Context()||!this._browserSupportsVTT())){return true
}return false
},_usingHTML5Context:function(){return this.videoEngine.getRuntime()=="HTML5"
},_browserSupportsVTT:function(){return $pdk._browserCheck([{browser:"chrome",version:31,device:false},{browser:"safari",version:7.1},{browser:"firefox",version:33},{browser:"ipad",osversion:8},{browser:"iphone",osversion:8},{browser:"ipod",osversion:8},{browser:"chrome",version:39,os:"android"},{browser:"android",version:4.4}])
},stripMetadataVTT:function(b){var a=b.captions;
var c=this._stripVTTFromAvailable(a);
if(c){b.captions=c
}else{b.captions=[]
}},stripVTT:function(b){var a=this._stripVTTFromAvailable(b.baseClip.availableSubtitles);
if(a){b.baseClip.availableSubtitles=a
}var c=this._stripVTTFromAvailable(b.baseClip.availableTextTracks);
if(c){b.baseClip.availableTextTracks=c
}if(a||c){this.updateClip(b)
}},_stripVTTFromAvailable:function(c){if(!c||c.length==0){return null
}var a=0,b=[];
for(a;
a<c.length;
a++){if(!this._isVTTCaption(c[a])){b.push(c[a])
}}return(b.length==c.length)?null:b
},_isVTTCaption:function(a){var b="text/vtt";
return((a.MIMEType==b)||(a.type==b))
},replacePlaylist:function(a){return this.replacePlaylistManager.replacePlaylist(this.plugins,a)
},playPlaylist:function(c){this.releaseSetInProcess=false;
if(this.releaseProcess){this.controller.dispatchEvent("OnReleaseEnd",this.playlist);
this.destroyReleaseProcess(this.releaseProcess);
this.releaseProcess=undefined;
var a=this;
setTimeout(function(){a.playPlaylist(c)
},1);
return
}var b=this.replacePlaylist(c);
if(!b){this.doPlayPlaylist(c)
}},doPlayPlaylist:function(c){if(!c||c.isError){this.dispatchReleaseError({title:c.baseClips[0].title,description:c.baseClips[0].description,exception:c.baseClips[0].contentCustomData.exception,responseCode:c.baseClips[0].contentCustomData.responseCode,alternateSrc:c.baseClips[0].URL},this.releaseUrl);
return
}var b=c.metaTags;
if(b){var a=0;
for(;
a<b.length;
a++){if(b[a].name==="manifestServiceUrl"){this.playlistHasSSA=true
}}}if($pdk.isAndroid&&!$pdk.isAndroid44plus&&!this.playlistHasSSA){this.stripM3U(c)
}this.releaseProcess=this.createReleaseProcess();
this.playlist=c;
if(!(this.isPrefetch()&&(tpIsIOS()||tpIsAndroid()))){tpDebug("selector: playing current release");
if(this.currentRelease){this.mergeReleaseWithPlaylist(this.currentRelease,c);
c.release=this.currentRelease;
c.release.mediaPID=c.mediaPID
}else{c.release=this.getReleaseFromPlaylist(c)
}this.controller.dispatchEvent("OnReleaseStart",c);
this.releaseProcess.setPlaylist(c)
}else{this.player.videoEngine.load(this.player.createMediaFileFromClip(this.playlist.baseClips[0]),0);
this.player.currentURL=this.playlist.baseClips[0].URL
}},mergeReleaseWithPlaylist:function(a,c){var b=this.getReleaseFromPlaylist(c);
if(!a){a={globalDataType:"com.theplatform.pdk.data::Release"}
}if(!a.title){a.title=b.title
}if(!a.author){a.author=b.author
}if(!a.duration){a.duration=b.duration
}if(!a.length){a.length=b.length
}if(!a.bitrate){a.bitrate=b.bitrate
}if(!a.description){a.description=b.description
}if(!a.categories){a.categories=b.categories
}if(!a.copyright){a.copyright=b.copyright
}if(!a.countries){a.countries=b.countries
}if(!a.keywords){a.keywords=b.keywords
}if(!a.link){a.link=b.link
}if(!a.pid){a.pid=b.pid
}if(!a.provider){a.provider=b.provider
}if(!a.ratings){a.ratings=b.ratings
}if(!a.text){a.text=b.text
}if(!a.chapters){a.chapters=b.chapters
}if(!a.url){a.url=b.url
}if(!a.mediaPID){a.mediaPID=b.mediaPID
}if(!a.airdate){a.airdate=b.airdate
}},getReleaseFromPlaylist:function(f){if(f.release){return f.release
}var b;
var c=0;
var a=f.baseClips.length;
var e;
var d;
for(;
c<a;
c++){if(!f.baseClips[c].isAd){e=f.baseClips[c];
d=f.clips[c];
break
}}if(!e){return undefined
}b={globalDataType:"com.theplatform.pdk.data::Release",title:f.title?f.title:e.title,author:e.author,duration:e.releaseLength,length:e.releaseLength,bitrate:e.bitrate,description:e.description,categories:e.categories,copyright:e.copyright,countries:[f.countryCode],keywords:e.keywords,link:e.moreInfo,pid:f.releasePID,provider:e.provider,ratings:e.ratings,text:e.description,chapters:d.chapter?d.chapter.chapters:[],url:f.releaseURL,mediaPID:f.mediaPID,airdate:f.airdate};
return b
},createReleaseProcess:function(){var a=com.theplatform.pdk.ReleaseProcessExported.getReleaseProcess(this.controller.id,this.controller.scopes.toString());
a.addEventListener("OnClipFromPlaylist",this,this.clipFromPlaylist);
a.addEventListener("OnNoSkipChanged",this,this.noSkipChanged);
return a
},destroyReleaseProcess:function(a){if(a){a.removeEventListener("OnClipFromPlaylist",this.clipFromPlaylist);
a.removeEventListener("OnNoSkipChanged",this.noSkipChanged);
a.destroy()
}},noSkipChanged:function(a){this.controller.dispatchEvent("OnNoSkipChanged",a.data)
},clipFromPlaylist:function(c){var b=c.data;
if(!b){if(!this.clipEnded&&this.currentClip&&this.currentClip.streamType!="empty"){this.doEndMedia(this.currentClip)
}this.endRelease();
this.playlist=undefined;
if(this.releaseSetInProcess){return
}var a=this.currentReleaseList?[this.currentReleaseList]:null;
var d=this.advanceClipFromExternalCall;
this.advanceClipFromExternalCall=false;
if(!this.wantPrevious){this.advanceToNextRelease(false,!d,a)
}else{this.wantPrevious=false;
this.controller.playPrevious(false,a)
}}else{if(this.currentClip&&!this.currentClip.baseClip.isAd){this.currentClip.offset=0;
this.releaseProcess.updateClip(this.currentClip)
}this.wantPrevious=false;
tpDebug("release process is telling us to play clip with clipIndex "+b.clipIndex+" and src:"+b.URL);
this.processClip(b)
}},advanceToNextRelease:function(c,a,b){this.tryingToAdvance=true;
this.controller.playNext(c,a,b);
var d=this;
setTimeout(function(){if(d.tryingToAdvance){d.tryingToAdvance=false;
d.controller.loadReleaseURL(d.currentRelease?d.currentRelease.url:d.releaseUrl);
d.standbyManager.setStandby(true,true)
}},300)
},endRelease:function(){if(tpIsAndroidLegacy()){this.controller.showFullScreen(false)
}this.releaseProcess=undefined;
this.currentClip=null;
this.controller.dispatchEvent("OnReleaseEnd",this.playlist)
},clearCurrentRelease:function(){if(this.releaseProcess){this.destroyReleaseProcess(this.releaseProcess);
this.controller.callFunction("clearReleaseGwt");
this.endRelease()
}this.controller.dispatchEvent("OnClearCurrentRelease");
this.controller.dispatchEvent("OnResetPlayer")
},resetRelease:function(){var a=this.player.resetVideoElement();
this.video=a.video;
this.videoEngine=a.videoEngine;
this.endRelease()
},sendError:function(b){var e=b.clip;
if(e&&e.baseClip.failOverClips.length>0){var d=e.baseClip.failOverClips[0];
var c=com.theplatform.pdk.SelectorExported.parseClip(d);
if(e.baseClip.failOverClips.length>1){var a=e.baseClip.failOverClips;
a.splice(0,1);
c.baseClip.failOverClips=a
}else{c.baseClip.failOverClips=[]
}var f=$.extend(true,{},e);
f.URL=c.URL;
f.baseClip=c.baseClip;
f.id=c.id;
this.player.doMediaLoadStart(f)
}else{this.controller.dispatchEvent("OnMediaError",b);
this.mediaErrorAction(b)
}},mediaErrorAction:function(a){if(a&&a.globalDataType=="com.theplatform.pdk.data::LicenseError"){this.error={title:"Security Error",description:"This protected content cannot be played on the current system.",exception:a.friendlyMessage,responseCode:null,alternateSrc:a.clip.URL};
this.endRelease();
this.controller.showPlayerCard("forms","tpErrorCard",null,{title:this.error.title,message:this.error.description,playNext:true})
}else{if(a&&a.endRelease){this.wasError=true;
this.endRelease();
this.advanceToNextRelease(false,true)
}else{if(this.releaseProcess){this.wasError=true;
this.advanceClipFromExternalCall=false;
this._doGetNextClip()
}}}},handleMediaSeek:function(f){var d=f.data;
tpDebug("Got OnMediaSeek");
if(!this.currentClip){tpDebug("PBM ignoring seek");
return
}var b=d.end.mediaTime;
tpDebug("Seek time is:"+b);
if(b>=this.currentClip.endTime||b<(this.currentClip.startTime-500)){var a=this.currentClip;
tpDebug("Telling releaseProcess to seek to "+d.end.currentTimeAggregate);
if(this.releaseProcess.seekToPosition(d.end.currentTimeAggregate)){this.controller.dispatchEvent("OnMediaEnd",a)
}else{tpDebug("releaseProcess.seekToPosition returned false");
tpDebug("Endtime is "+this.currentClip.endTime+" duration is "+this.currentClip.duration);
if(this.currentClip.duration>1){this.endMedia()
}else{tpDebug("Continuing to play because we don't know the duration")
}}}else{if(b<=this.currentClip.startTime&&Math.abs(this.videoEngine.getCurrentTime()-this.currentClip.startTime)>300){var c=this;
tpDebug("targetTime is "+b+", need to seek to "+this.currentClip.startTime);
setTimeout(function(){c.controller.seekToPosition(c.currentClip.startTime)
},1)
}else{tpDebug("seekObj was within clip boundaries: "+this.currentClip.startTime+"<"+d.end.mediaTime+"<"+this.currentClip.endTime)
}}},nextClipExternal:function(){this.nextClip(true)
},nextClip:function(a){this.advanceClipFromExternalCall=a===true;
if(this.currentClip){if(a||this.isNoopClip(this.currentClip)||this.isProxyClip(this.currentClip)||this.playlistHasSSA){this.clipEnded=true;
this.controller.dispatchEvent("OnMediaEnd",this.currentClip)
}}if(this.releaseProcess){tpDebug("PBM calling releaseProcess.nextClip");
this._doGetNextClip()
}else{this.advanceToNextRelease(false,false)
}},_doGetNextClip:function(){var a=this;
setTimeout(function(){if(a.releaseProcess){a.releaseProcess.nextClip()
}},1)
},previousClip:function(){this.wantPrevious=true;
this.advanceClipFromExternalCall=true;
if(this.releaseProcess){tpDebug("PBM calling releaseProcess.nextClip");
this.releaseProcess.previousClip()
}else{this.controller.playPrevious(false)
}},processClip:function(b,f){var h=this.adManager.isAd(b);
var g=false;
if(h){if(!this.adManager.validateAd(b)){this.nextClip(this.advanceClipFromExternalCall);
return
}var m=b.URL.indexOf("?")>0?b.URL.substr(0,b.URL.indexOf("?")):b.URL;
var d=true;
for(var e=0;
e<this.playlist.clips.length;
e++){var l=this.playlist.clips[e];
if(l.baseClip.isAd){continue
}var a=l.URL.indexOf("?")>0?l.URL.substr(0,l.URL.indexOf("?")):l.URL;
d=a!=m;
break
}g=d?this.adManager.checkAd(b):false;
if(!b.isExternal&&b.baseClip.type=="application/x-shockwave-flash"){this.nextClip(this.advanceClipFromExternalCall);
return
}if(b.isExternal&&b.clipIndex===0){var k=this;
setTimeout(function(){k.preloadContent()
},100)
}b.hasPlayed=true;
this.updateClip(b);
this.lastAdClip=b;
tpDebug("CheckAd returns "+g)
}var n=false;
if(this.currentClip){n=b.clipIndex<this.currentClip.clipIndex
}this.currentClip=b;
if(!g){var j=false;
if(!n){j=this.clipWrapperManager.processClip(b)
}var o=false;
var k=this;
o=this.urlManager.checkClip(b,function(c){if(b.id===c.id){if(!j&&f!==true){tpDebug("processClip.!wrapped: "+b.URL);
k.urlRewritten(c)
}}});
b.wasProcessed=true
}},urlRewritten:function(a){this.updateClip(a);
if(a.baseClip.type!=="application/vast+xml"&&a.baseClip.type!=="text/plain"){if(a.baseClip.isAd){this.lastAdClip=a
}this.clipStarted=false;
tpDebug("urlreWrtten for clip with URL:"+a.URL);
if(a.baseClip.security&&a.baseClip.security.toLowerCase()==="playready"){this.challengeData.setClip(a)
}this.player.doMediaLoadStart(a);
this.releaseProcess.updateClip(a)
}else{this.endMedia(a)
}},playlistReplaced:function(a){this.updatePlaylist(a);
this.doPlayPlaylist(a)
},insertPlaylist:function(a){if(this.releaseProcess){this.releaseProcess.insertPlaylist(a)
}},insertClip:function(a){if(this.releaseProcess){this.releaseProcess.insertClip(a)
}},injectPlaylist:function(b){if(this.releaseProcess){var a=this.currentClip.currentMediaTime==0&&this.currentClip.startTime>0?this.currentClip.startTime:this.currentClip.currentMediaTime;
this.releaseProcess.injectPlaylist(b,a)
}},updateMediaTime:function(a){if(this.releaseProcess){this.releaseProcess.updateMediaTime(a)
}},updateClip:function(a){if(this.releaseProcess){this.releaseProcess.updateClip(a)
}},updatePlaylist:function(a){if(this.releaseProcess){this.releaseProcess.updatePlaylist(a)
}},endMedia:function(b,c){if(!b){b=this.currentClip
}b.offset=0;
if(this.releaseProcess){this.releaseProcess.updateClip(b);
if(b&&b.mediaLength-1000<=b.currentMediaTime){var a=b
}this.doEndMedia(b);
if(a){this.controller.dispatchEvent("OnMediaComplete",a)
}if(!c){tpDebug("Media ended for clip with url: "+b.baseClip.URL+" and index "+b.clipIndex+" , PBM calling nextClip()");
this.advanceClipFromExternalCall=false;
this._doGetNextClip()
}}},doEndMedia:function(a){this.currentClip=null;
if(!this.wasError){tpDebug("doEndMedia dispatching OnMediaEnd for clip:"+a.baseClip.URL);
this.controller.dispatchEvent("OnMediaEnd",a)
}this.wasError=false
},wrapClip:function(b,a){this.releaseProcess.wrapClip(b,a)
},executeCurrentRelease:function(){},isNoopClip:function(a){if(!a){return false
}return((a.URL==""||a.isExternal)&&a.baseClip.isAd&&a.streamType=="empty")
},isProxyClip:function(a){if(!a){return false
}return(!(a.URL==""||a.isExternal)&&a.baseClip.isAd&&a.streamType=="empty")
}});
tpPlayer=PDKComponent.extend({_generateExportedMarkup:function(){var a="";
a+='<div class="tpLayers" id="'+this.id+'" >';
a+='  <div class="tpVideo" id="'+this.id+'.player" style="z-index:795; position:absolute;"></div>';
a+='  <div class="tpVideoBlocker" id="'+this.id+'.controlBlocker" style="z-index:796; position:absolute;"></div>';
a+='  <div class="tpPlugins" id="'+this.id+'.plugins" style="z-index:797; position:absolute;"></div>';
a+='  <div class="tpBlocker" id="'+this.id+'.blocker" style="z-index:798; position:absolute;" ></div>';
a+='  <div class="tpSubtitles" id="'+this.id+'.subtitles" style="pointer-events:none; z-index:799; position:absolute;" ></div>';
a+='  <div class="tpCards" id="'+this.id+'.cards" style="pointer-events:none;z-index:803;-webkit-touch-callout: text;-webkit-user-select: text;-khtml-user-select: text;-moz-user-select: text;-ms-user-select: text;user-select: text;left:0px;top:0px; position:absolute; visibility: hidden;" ></div>';
a+="</div>";
a+='  <div class="tpOverlays" id="'+this.id+'.overlays" style="z-index:802;top:0px;left:0px;pointer-events:none;position:absolute" ></div>';
a+='  <div class="tpControls" id="'+this.id+'.controls" style="z-index:801;top:0px;left:0px;pointer-events:none;position:absolute" ></div>';
return a
},init:function(a,b,i,d,f){var g=this;
this.id=a;
this._resizeTimout=0;
this._tryResizeAttempts=0;
this.pluginsComplete=false;
this.videoEngine=f;
this.stayInFullScreen=true;
if(d===undefined){d=a
}this.widgetId=d;
this.controller=new PlayerController(a,this,d);
var c=$pdk.scriptRoot;
var h=document.createElement("a");
h.href=$pdk.scriptRoot;
var c=h.hostname.toLowerCase();
var e="theplatform.com";
switch(c){case"pdk.theplatform.com":e="theplatform.com";
break;
case"pdk.preview.theplatform.com":e="preview.theplatform.com";
break;
case"pdk.sandbox.theplatform.com":e="theplatform.com";
break;
case"pdk.test.corp.theplatform.com":e="test.corp.theplatform.com";
break;
case"pdk.theplatform.eu":e="theplatform.eu";
break
}if(!this.controller.getProperty("pauseOnClick")){this.controller.setProperty("pauseOnClick","true")
}this.pauseOnClick=(this.controller.getProperty("pauseOnClick")!=="false");
if(!this.controller.getProperty("mpx")){this.controller.setProperty("mpx",e)
}if(tpIsIOS()||tpIsAndroid()){this.stayInFullScreen=false
}this.unloaded=true;
this.controller.addEventListener("OnMediaAreaChanged",function(){g.handleOnMediaAreaChanged.apply(g,arguments)
});
this.controller.addEventListener("OnOverlayAreaChanged",function(){g.handleOnOverlayAreaChanged.apply(g,arguments)
})
},setProperty:function(a,b){if(this.controller){this.controller.setProperty(a,b)
}},getProperty:function(a){if(this.controller){return this.controller.getProperty(a)
}else{return null
}},attach:function(a){this.initialize();
this.video=document.getElementById(a);
this.ready()
},setSeekHandler:function(){if(this.seekHandler){this.seekHandler.destroy()
}this.seekHandler=new SeekHandler(this.videoEngine);
var a=this;
this.userSeekedListener=function(b){a.userSeeked(b)
};
this.seekErrorListener=function(b){a.seekFailed(b)
};
this.seekHandler.addEventListener(SeekEvents.USERSEEKED,this.userSeekedListener);
this.seekHandler.addEventListener(SeekEvents.SEEKFAILED,this.seekErrorListener)
},seekFailed:function(a){this.onError(a)
},userSeeked:function(a){if(this.currentClip.baseClip.noSkip&&!tpIsIOS()){this.seekHandler.doSeek(this.currentClip.startTime/1000)
}else{if(this.currentClip.baseClip.noSkip&&tpIsIOS()){}else{tpDebug("got userSeeked: showing controls");
this.showControls(true);
this.onSeeked()
}}},progSeeked:function(a){tpDebug("progSeeked fired");
this.onSeeked()
},resetVideoElement:function(){var a=document.createElement("div");
a.setAttribute("id",this.video.getAttribute("id"));
a.setAttribute("class",this.video.getAttribute("class"));
a.setAttribute("style",this.video.getAttribute("style"));
a.setAttribute("x-webkit-airplay","allow");
this.video.parentNode.replaceChild(a,this.video);
this.video=a;
this.videoEngine.setParentElement(this.video);
if(this.videoengineruntime&&this.videoengineruntime.toLowerCase()==="flash"){this.videoEngine.setRuntime("FLASH")
}else{this.videoEngine.setRuntime("HTML5")
}this.startedPlaying=false;
this.currentClip=undefined;
this.attachListeners();
return{video:this.video,videoEngine:this.videoEngine}
},createContainer:function(c){var e=this.framecolor?this.framecolor:"#000000";
var b=this.backgroundcolor?this.backgroundcolor:"#ffffff";
this.bdcolor=e.replace("0x","#");
this.bgcolor=b.replace("0x","#");
var a="";
a+="<div class='tpBackground' style=\"background-color: "+this.bgcolor+"; border-color: "+this.bdcolor+'"></div>';
a+='<div class="tpLayers" id="'+this.id+'" >';
a+='  <div class="tpVideo" id="'+this.id+'.player" style="z-index:795; position:absolute;"></div>';
a+='  <div class="tpVideoBlocker" id="'+this.id+'.controlBlocker" style="z-index:796; position:absolute;"></div>';
a+='  <div class="tpPlugins" id="'+this.id+'.plugins" style="z-index:797; position:absolute;" ></div>';
a+='  <div class="tpBlocker" id="'+this.id+'.blocker" style="z-index:798; position:absolute;" ></div>';
a+='  <div class="tpSubtitles" id="'+this.id+'.subtitles" style="pointer-events:none; z-index:799; position:absolute;" ></div>';
a+='  <div class="tpCards" id="'+this.id+'.cards" style="pointer-events:none;z-index:803;-webkit-touch-callout: text;-webkit-user-select: text;-khtml-user-select: text;-moz-user-select: text;-ms-user-select: text;user-select: text; position:absolute; visibility: hidden" ></div>';
a+='  <div class="tpOverlays" id="'+this.id+'.overlays" style="z-index:802;top:0px;left:0px;pointer-events:none;position:absolute" ></div>';
a+='  <div class="tpControls" id="'+this.id+'.controls" style="z-index:801;top:0px;left:0px;pointer-events:none;position:absolute" ></div>';
a+="</div>";
if(c){c.innerHTML=a
}else{document.write(a)
}this.container=document.getElementById(this.id);
this.pluginLayer=document.getElementById(this.id+".plugins");
this.player=document.getElementById(this.id+".player");
this.controlBlocker=document.getElementById(this.id+".controlBlocker");
var f=this;
var h=function(j){if(f.videoEngine.isPaused()&&(!f._hideNativeControls)){return true
}if(!f.clipStarted){return false
}var i=f.videoClicked(j);
if(i){if(!j){var j=window.event
}j.cancelBubble=true;
if(j.stopPropagation){j.stopPropagation()
}if(j.preventDefault){j.preventDefault()
}return false
}return true
};
anchor=document.createElement("a");
anchor.style.width="100%";
anchor.style.height="100%";
anchor.style.background="transparent";
anchor.style.display="block";
if(!tpIsIOS()){anchor.onclick=h
}else{anchor.ontouchstart=h
}this.controlBlocker.appendChild(anchor);
this.videoClickAnchor=anchor;
this.blocker=document.getElementById(this.id+".blocker");
var d=this.backgroundcolor;
if(d){idx=d.indexOf("0x");
if(idx!==-1){d=d.substring(idx+2);
d="#"+d
}this.blocker.style.backgroundColor=d
}else{this.blocker.style.backgroundColor="black"
}this.blocker.style.position="absolute";
this.blocker.top=0;
this.blocker.left=0;
this.blocker.style.display="";
this.blocker.style.overflow="hidden";
this.blocker.style.height="100%";
this.blocker.style.width="100%";
this.blocker.style.display="none";
this.controlsLayer=document.getElementById(this.id+".controls");
this.controlsLayer.className="tpControls controlsLayer";
this.controlsLayer.style.backgroundColor="transparent";
this.controlsLayer.style.cssFloat="left";
this.controlsLayer.style["float"]="left";
this.controlsLayer.style.left="0px";
this.controlsLayer.style.top="0px";
this.controlBlocker.style.position="absolute";
this.controlBlocker.style.display="none";
this.blocker.top=0;
this.blocker.left=0;
this.controlBlocker.style.backgroundColor="transparent";
this.controlBlocker.style.height="100%";
this.controlBlocker.style.width="100%";
this.controlBlocker.style.overflow="hidden";
this.player.style.width="100%";
this.player.style.height="100%";
this.player.style.position="absolute";
this.player.style.overflow="hidden";
this.pluginLayer.style.width="100%";
this.pluginLayer.style.position="absolute";
this.controlsLayer.style.width="100%";
this.controlsLayer.style.height="100%";
this.container.className="player";
if($pdk._phase1Controllers===null||typeof($pdk._phase1Controllers)!=="object"){$pdk._phase1Controllers={}
}var g=document.getElementById(this.controller.id).parentElement.id;
this.controller.componentId=g;
$pdk._phase1Controllers[g]=this.controller;
return c
},isStandbyMode:function(){return this.standbyMode||(tpIsAndroid&&!tpIsChrome())
},isPrefetch:function(){return !this.standbyMode&&(tpIsIOS()||tpIsAndroid())
},isFlashPlayer:function(){return false
},writePlayer:function(b,a){if(b===""&&a&&this.iOSEnabled){return
}var h=b;
if(!a){tpDebug("writePlayer calling pause()");
tpDebug("writing player src="+b+"&format=redirect");
tpDebug("writePlayer original url:"+b);
var f=h.indexOf("format=");
tpDebug("formatIndex="+f);
if(f>=0){tpDebug("found a format in original");
var c=h.substring(f+7,h.length);
var g="format=";
var e=c.indexOf("&");
if(e>=0){tpDebug("found & at index:"+e);
c=c.substring(0,e)
}g=g+c;
tpDebug("target="+g);
h=h.replace(g,"format=redirect")
}else{if(h.indexOf("?")>=0){h=h+"&format=redirect"
}else{h=h+"?format=redirect"
}}}tpDebug("writePlayer newUrl:"+h);
this.ignoreErrors=h==="";
var d={url:h,isAd:false,mimeType:"unknown"};
this.videoEngine.load(d,0);
if(!this.iOSEnabled){this.iOSEnabled=true
}},createVideo:function(){if(this.video){this.destroyVideo()
}this.video=document.createElement("div");
this._hideNativeControls=this.controller.getProperty("overrideNativeControls")=="true"||(this.controller.getProperty("skinUrl")!=null&&this.controller.getProperty("skinUrl").indexOf(".swf")==-1);
this._useDefaultPlayOverlay=this.controller.getProperty("useDefaultPlayOverlay");
if(this._useDefaultPlayOverlay===undefined){this._useDefaultPlayOverlay=false;
this.controller.setProperty("useDefaultPlayOverlay",this._useDefaultPlayOverlay.toString())
}else{this._useDefaultPlayOverlay=this._useDefaultPlayOverlay=="true"
}this._showControlsBeforeVideo=this.controller.getProperty("showControlsBeforeVideo");
var a=this.controller.getProperty("mute");
this._startMuted=a&&a.toLowerCase()==="true"?true:false;
if(this._showControlsBeforeVideo===undefined){this._showControlsBeforeVideo=true;
this.controller.setProperty("showControlsBeforeVideo",this._showControlsBeforeVideo.toString())
}else{this._showControlsBeforeVideo=this._showControlsBeforeVideo=="true"
}this.video.id=this.id+".content";
this.video.style.width="100%";
this.video.style.height="100%";
if(this.backgroundcolor){this.video.style.backgroundColor="#"+this.backgroundcolor.substr(2)
}this.player.appendChild(this.video);
this.videoLayer=this.controller.getProperty("videoLayer");
if(!this.videoLayer){this.videoLayer="test-context"
}this.videoEngine.setParentElement(this.video);
if(tpIsAndroid()){tpDebug("showing controls");
this.showControls(true)
}if(this._hideNativeControls){this.showControls(false)
}},getVideoProxy:function(){return new $pdk.connection.VideoProxy(this.videoEngine)
},loadLayer:function(b,c,a){if(this.videoEngine){return this.videoEngine.loadLayer(b,c,a)
}else{tpDebug("Trying to call loadLayer without a VideoEngine")
}},hasLayer:function(a,b){if(this.videoEngine){return this.videoEngine.hasLayer(a,b)
}else{tpDebug("Trying to call hasLayer without a VideoEngine")
}},callLayerFunction:function(c,b,a){if(this.videoEngine){return this.videoEngine.callLayerFunction(c,b,a)
}else{tpDebug("Trying to call callLayerFunction without a VideoEngine")
}},setAudioTrackByIndex:function(a){this.videoEngine.setAudioTrackByIndex(a)
},supportsFastForward:function(){return this.videoEngine.isPlaybackRateSupported()
},setPlaybackRate:function(a){var b=this.videoEngine.setPlaybackRate(a);
if(b){this.pbRate=b;
this.dispatchOnPlaybackRateChanged(b)
}},getPlaybackRate:function(){var a=this.videoEngine.getPlaybackRate();
if(a>-1){this.pbRate.rate=a;
this.dispatchOnPlaybackRateChanged(this.pbRate)
}},pbRate:{rate:1,previousRate:1},dispatchOnPlaybackRateChanged:function(a){this.controller.dispatchEvent("OnPlaybackRateChanged",a)
},setAudioTrackByLanguage:function(a){this.videoEngine.setAudioTrackByLanguage(a)
},getCurrentAudioTrack:function(){return this.videoEngine.getCurrentAudioTrack()
},getPauseState:function(){return this.paused
},getCurrentPosition:function(){return this.currentTimeObject
},destroyVideo:function(){if(this.video){this.videoEngine.unload();
this.player.removeChild(this.video);
this.video=null
}},videoClicked:function(d){if(this.currentClip){if(!tpIsIOS()&&!tpIsAndroid()&&this.pauseOnClick===true){this.controller.pause(!this.getPauseState(),true)
}if(this.currentClip.baseClip.moreInfo){if(this.currentClip.baseClip.moreInfo.href){window.open(this.currentClip.baseClip.moreInfo.href,"_blank")
}}var c=$(this.container).parent().offset();
var b=d.pageX-c.left;
var a=d.pageY-c.top;
this.controller.dispatchEvent("OnMediaClick",{ctrlKey:d.ctrlKey,shiftKey:d.shiftKey,localX:b,localY:a,stageX:d.pageX,stageY:d.pageY,position:this.currentClip.currentMediaTime});
return false
}return false
},attachListeners:function(){if(!this.listeners){this.listeners=new Object()
}var a=this;
this.videoEngine.addEventListener("LAYER_LOADED",this.listeners.layerLoaded=function(b){tpDebug("Video tag dispatched "+b.type+" with "+b.data)
},false);
this.videoEngine.addEventListener("MEDIA_LOAD_START",this.listeners.loadstart=function(b){tpDebug("Video tag dispatched "+b.type+" with "+b.media.url)
},false);
this.videoEngine.addEventListener("MEDIA_START",this.listeners.start=function(b){tpDebug("Video tag dispatched "+b.type);
a.onMediaStart(b)
},false);
this.videoEngine.addEventListener("MEDIA_SEEKED",this.listeners.seeked=function(b){tpDebug("Video tag dispatched "+b.type);
a.onSeeked(b)
},false);
this.videoEngine.addEventListener("MEDIA_END",this.listeners.ended=function(b){tpDebug("Video tag dispatched "+b.type);
a.onEnded(b)
},false);
this.videoEngine.addEventListener("MEDIA_UNPAUSED",this.listeners.unpause=function(b){tpDebug("Video tag dispatched "+b.type);
a.onPlay(b)
},false);
this.videoEngine.addEventListener("MEDIA_PAUSED",this.listeners.pause=function(b){tpDebug("Video tag dispatched "+b.type);
a.onPause(b)
},false);
this.videoEngine.addEventListener("MUTE",this.listeners.mute=function(b){tpDebug("Video tag dispatched "+b.type);
a.onMuteChange(b)
},false);
this.videoEngine.addEventListener("MEDIA_PLAYING",this.listeners.playing=function(b){},false);
this.videoEngine.addEventListener("MEDIA_LOADING",this.listeners.progress=function(b){tpDebug("Video tag dispatched "+b.type);
a.onProgress(b)
},false);
this.videoEngine.addEventListener("MEDIA_ERROR",this.listeners.error=function(b){tpDebug("Video tag dispatched "+b.type);
if(b.data){tpDebug("   details: "+b.data.details);
tpDebug("   errorId: "+b.data.errorId)
}a.onError(b)
},false);
this.videoEngine.addEventListener("PLAYBACK_ERROR",this.listeners.playbackerror=function(b){tpDebug("Video tag dispatched "+b.type);
a.onPlaybackError(b)
},false);
this.videoEngine.addEventListener("MEDIA_UNLOADED",this.listeners.unloaded=function(b){tpDebug("Video tag dispatched "+b.type);
a.unloaded=true
},false);
this.videoEngine.addEventListener("AUDIO_TRACK_SWITCHED",this.listeners.audioTrackSwitched=function(b){a.onAudioTrackSwitched(b)
},false);
this.videoEngine.addEventListener("RESIZE",this.listeners.resize=function(b){a.onResize(b)
},false)
},removeListeners:function(){this.videoEngine.removeEventListener("MEDIA_LOAD_START",this.listeners.loadstart);
this.videoEngine.removeEventListener("MEDIA_START",this.listeners.start);
this.videoEngine.removeEventListener("MEDIA_SEEKED",this.listeners.seeked);
this.videoEngine.removeEventListener("MEDIA_END",this.listeners.ended);
this.videoEngine.removeEventListener("MEDIA_UNPAUSED",this.listeners.unpause);
this.videoEngine.removeEventListener("MEDIA_PAUSED",this.listeners.pause);
this.videoEngine.removeEventListener("MEDIA_ERROR",this.listeners.error);
this.videoEngine.removeEventListener("PLAYBACK_ERROR",this.listeners.playbackerror);
this.videoEngine.removeEventListener("MEDIA_UNLOADED",this.listeners.unloaded);
this.videoEngine.removeEventListener("MEDIA_PLAYING",this.listeners.playing);
this.videoEngine.removeEventListener("MEDIA_LOADING",this.listeners.progress);
this.videoEngine.removeEventListener("MUTE",this.listeners.mute);
this.videoEngine.removeEventListener("AUDIO_TRACK_SWITCHED",this.listeners.audioTrackSwitched)
},_bindElement:function(a){this.createContainer(a);
this.createVideo();
this.attachListeners();
var c=this;
var b=function(){c.onResize()
};
if(window.attachEvent){window.attachEvent("onresize",b)
}else{window.addEventListener("resize",b);
window.addEventListener("orientationchange",b)
}this.ready()
},write:function(a){this.createContainer(a);
this.createVideo();
this.attachListeners();
var c=this;
var b=function(){c.onResize()
};
if(window.attachEvent){window.attachEvent("onresize",b)
}else{window.addEventListener("resize",b)
}this.initialize();
this.ready()
},initialize:function(){if(this.scopes){this.controller.scopes=[this.controller.componentId].concat(this.scopes.split(","))
}else{this.controller.scopes=[this.controller.componentId,"default"]
}this.standbyMode=this.standbymode;
if(this.standbyMode==="true"||tpIsAndroid()){this.controller.setProperty("standbyMode",true);
this.standbyMode=true
}else{if(this.standbyMode==="prefetch"){this.controller.setProperty("standbyMode","prefetch");
this.prefetch=true;
this.standbyMode=false
}else{if(tpIsIOS()||tpIsAndroid()){this.controller.setProperty("standbyMode",true);
this.standbyMode=true
}else{this.controller.setProperty("standbyMode",false);
this.standbyMode=false
}}}var a=this;
this.controller.addEventListener("OnPluginsComplete",function(){a.pluginsComplete=true;
a.controller.removeEventListener("OnPluginsComplete",this)
});
this.enableFullWindow=false;
var c=false;
try{c=window.self!==window.top
}catch(b){c=true
}this._isIFrame=c;
if(this.controller.getProperty("enablefullwindow")==="true"){this.enableFullWindow=true&&(!c||$pdk.queue._externalControllerListener)
}else{if(this.controller.getProperty("enablefullwindow")!=="false"){if($pdk.isIE){this.enableFullWindow=true&&(!c||$pdk.queue._externalControllerListener)
}}}this.playbackManager=new PlaybackManager(this,this.controller);
this.controller.registerFunction("getMediaArea",this,this.getMediaArea);
this.controller.registerFunction("setMediaArea",this,this.setMediaArea);
this.controller.registerFunction("getContentArea",this,this.getContentArea);
this.controller.registerFunction("writePlayer",this,this.writePlayer);
this.controller.registerFunction("isPrefetch",this,this.isPrefetch);
this.controller.registerFunction("isStandbyMode",this,this.isStandbyMode);
this.controller.registerFunction("isFlashPlayer",this,this.isFlashPlayer);
this.controller.registerFunction("supportsFullScreen",this,this.supportsFullScreen);
this.controller.registerFunction("supportsSeek",this,this.supportsSeek);
this.controller.registerFunction("supportsMute",this,this.supportsMute);
this.controller.registerFunction("supportsVolume",this,this.supportsVolume);
this.controller.registerFunction("getVideoProxy",this,this.getVideoProxy);
this.controller.registerFunction("loadLayer",this,this.loadLayer);
this.controller.registerFunction("hasLayer",this,this.hasLayer);
this.controller.registerFunction("callLayerFunction",this,this.callLayerFunction);
this.controller.registerFunction("setAudioTrackByIndex",this,this.setAudioTrackByIndex);
this.controller.registerFunction("setAudioTrackByLanguage",this,this.setAudioTrackByLanguage);
this.controller.registerFunction("getCurrentAudioTrack",this,this.getCurrentAudioTrack);
this.controller.registerFunction("getPauseState",this,this.getPauseState);
this.controller.registerFunction("getCurrentPosition",this,this.getCurrentPosition);
this.controller.registerFunction("setPlaybackRate",this,this.setPlaybackRate);
this.controller.registerFunction("getPlaybackRate",this,this.getPlaybackRate);
this.controller.registerFunction("supportsFastForward",this,this.supportsFastForward)
},ready:function(){this._super();
this.playbackManager.video=this.video;
this.playbackManager.videoEngine=this.videoEngine;
if(this.layout||this.layoutUrl){this.controls=document.createElement("div");
this.controls.className="controlLayoutArea";
this.controls.style.height="40px";
this.controls.style.width="100%";
this.controls.style.background="#555555"
}this.video.style.padding="0";
this.video.style.margin="0";
var a=this.controller.getProperty("endCard");
if(self.CardMediator&&a=="HelloWorldEndCard"){this.cardHolder=new oldCardMediator(a,this.controller)
}if(this.controller.getProperty("overlayImageURL")){var d=this;
setTimeout(function(){d.controller.addPlayerCard("overlays","tpOverlayCard","<div class='tpOverlayCard'><img style='position: absolute; bottom: 5px; right: 5px'/></div>","urn:theplatform:pdk:area:overlay",{},{show:function(e){$pdk.jQuery(e.card).find("img")[0].src=e.player.overlayimageurl
},hide:function(){}});
d.controller.showPlayerCard("overlays","tpOverlayCard")
},1)
}if(this.controller.getProperty("relatedItemsURL")){}var d=this;
this.controller.addEventListener("OnPlayerLoaded",function(){d.handlePlayerLoaded.apply(d,arguments)
});
this.controller.addEventListener("OnShowFullScreen",function(){d.onShowFullScreen.apply(d,arguments)
});
this.controller.addEventListener("OnMediaPlaying",function(){d.showVideo();
d.showBlocker(false)
});
this.controller.addEventListener("OnSetRelease",function(){d.handleSetRelease.apply(d,arguments)
});
this.controller.addEventListener("OnReleaseSelected",function(){d.handleSetRelease.apply(d,arguments)
});
this.controller.addEventListener("OnSetReleaseUrl",function(){d.handleSetReleaseUrl.apply(d,arguments)
});
this.controller.addEventListener("OnLoadReleaseUrl",function(){d.handleLoadRelease.apply(d,arguments)
});
this.controller.addEventListener("OnMediaLoadStart",function(){});
this.controller.addEventListener("OnMediaStart",function(f){d.showVideo();
if(f.data.streamType=="empty"){d.showControlBlocker(false)
}else{if(!d._hideNativeControls){if(f.data.baseClip.isAd){d.showControlBlocker(true)
}else{d.showControlBlocker(false)
}}else{d.showControlBlocker(true)
}}});
this.controller.addEventListener("OnReleaseStart",function(){d.handleReleaseStart.apply(d,arguments)
});
this.controller.addEventListener("OnReleaseEnd",function(){d.handleReleaseEnd.apply(d,arguments)
});
this.controller.addEventListener("OnMediaEnd",function(){d.handleMediaEnd.apply(d,arguments)
});
this.controller.addEventListener("OnClearCurrentRelease",function(){d.handleClearCurrentRelease.apply(d,arguments)
});
this.controller.addEventListener("OnShowCard",function(){d.onShowCard.apply(d,arguments)
});
this.controller.addEventListener("OnHideCard",function(){d.onHideCard.apply(d,arguments)
});
this.controller.addEventListener("OnShowControls",function(){d.onShowControls.apply(d,arguments)
});
this.controller.registerFunction("seekToPosition",this,this.seekToPosition);
this.controller.registerFunction("seekToPercentage",this,this.seekToPercentage);
if(this.pluginsComplete===false){var c=d;
var b=function(){if(c.pluginsComplete){return
}c.pluginsComplete=true;
c.controller.removeEventListener("OnPlugInsComplete",b);
c.controller.dispatchEvent("OnPlayerLoaded",[c.id])
};
this.controller.addEventListener("OnPlugInsComplete",b);
return
}else{this.controller.dispatchEvent("OnPlayerLoaded",[this.id])
}},handleShowPlayOverlay:function(a){if(a.data){if(this.videoEngine&&this.videoEngine.isFullScreen()){if(!this.stayInFullScreen){tpDebug("Exiting fullscreen");
this.controller.showFullScreen(false)
}}}},onShowControls:function(a){this.controller.getOverlayArea()
},onShowCard:function(a){if(tpIsIPhone()){this.player.style.left="-10000px"
}},onHideCard:function(a){if(tpIsIPhone()){this.player.style.left="0px"
}},handlePlayerLoaded:function(a){if(!this.releaseUrl){return
}if(this.autoPlay&&!(tpIsIOS()||tpIsAndroid())){this.controller.dispatchEvent("OnReleaseSelected",{releaseUrl:this.releaseUrl,userInitiated:false});
tpDebug("Autoplaying releaseUrl:"+this.releaseUrl);
this.controller.setReleaseURL(this.releaseUrl)
}else{this.controller.loadReleaseURL(this.releaseUrl)
}},handleMediaEnd:function(a){},onShowFullScreen:function(a){if(a.data){this.container.style.backgroundColor=this.bgcolor
}else{this.container.style.backgroundColor=""
}this.onResize()
},supportsFullScreen:function(){try{var a=!(this.playlistHasSSA&&this.currentClip&&this.currentClip.baseClip.isAd&&tpIsIOS())&&this.allowfullscreen==="true"&&(this.videoEngine.isFullScreenSupported()||typeof(this.container.webkitRequestFullScreen)==="function"||typeof(this.container.mozRequestFullScreen)==="function"||(typeof(this.container.msRequestFullScreen)==="function"&&!this._isIFrame)||this.enableFullWindow);
return !!a
}catch(b){return false
}},supportsSeek:function(){return this.videoEngine.isSeekSupported()
},supportsMute:function(){return this.videoEngine.isMuteSupported()
},supportsVolume:function(){return this.videoEngine.isSetVolumeSupported()
},seekToPosition:function(a){this.doSeek(a)
},controlsLoaded:function(b,a){if(!b){if(a){this._hideNativeControls=this.controller.getProperty("overrideNativeControls")=="true";
this.videoEngine.setUseNativeControls(!this._hideNativeControls)
}}},doSeek:function(d){if(d==0){d=1
}if(this.currentClip&&(!this._lastSeekTime||Date.now()-this._lastSeekTime>500)){var a=this.getClipTime(d);
if(a>=this.currentClip.mediaLength){a=this.currentClip.mediaLength-100
}this._lastSeekTime=Date.now();
var b=this;
this.seekTimeObject=this.createCurrentTimeObject();
if($pdk.isAndroid&&!$pdk.isAndroid44plus&&this.currentClip.URL.toLowerCase().indexOf("m3u")!==-1){tpDebug("Ignoring seek for m3u on legacy android");
if(!this.isPaused&&!this.videoEngine.isPaused()){this.controller.dispatchEvent("OnMediaPlaying",this.seekTimeObject)
}}else{if(!this.currentClip.chapter||!this.currentClip.chapter.chapters.isAggregate){this.isSeeking=true;
setTimeout(function(){b.videoEngine.seek(a)
},1)
}else{if(this.currentClip.chapter.startTime<a&&this.currentClip.chapter.endTime>a){this.isSeeking=true;
setTimeout(function(){b.videoEngine.seek(a)
},1)
}else{clearInterval(this.timeUpdateTimer);
var c={globalDataType:"com.theplatform.pdk.data::SeekObject"};
c.end=this.createCurrentTimeObject(a);
if(c.end!=undefined&&this.seekTimeObject!=undefined&&c.end.currentTime!=this.seekTimeObject.currentTime){c.start=this.seekTimeObject
}c.clip=this.currentClip;
this.controller.dispatchEvent("OnMediaSeek",c);
return
}}}}},getClipTime:function(a){var d=this.playlist.chapters.chapters;
var e=0;
for(var b=0;
b<d.length;
b++){var f=d[b];
if(f.aggregateStartTime+f.length>a){e=f.startTime+(a-f.aggregateStartTime);
break
}}return e
},seekToPercentage:function(b){if(!this.currentClip){return
}b=isNaN(b)?0:b;
b=b<0?0:b;
b=b>100?100:b;
var c=this.videoEngine.getTotalTime();
if(this.currentClip.chapter&&this.currentClip.chapter.chapters){c=this.currentClip.chapter.chapters.aggregateLength
}if(isNaN(c)&&this.currentClip){return this.doSeek(this.currentClip.baseClip.trueLength*(b/100))
}else{if(!isNaN(c)){var a=c*(b/100);
return this.doSeek(a)
}else{this.delaySeekPercentage=b;
return false
}}},createMediaFileFromClip:function(a){return{url:a.URL,isAd:a.baseClip.isAd,mimeType:a.streamType=="empty"?"empty":a.baseClip.type,isExternal:this.playbackManager.isNoopClip(a)}
},handleLoadRelease:function(b){clearTimeout(this.nextClipTimerId);
this.clipEnded=false;
var a=b.data;
this.currentReleaseUrl=a.url;
if(!this.stayInFullScreen){try{this.controller.showFullScreen(false)
}catch(c){}}if(tpIsIOS()){this.hideVideo()
}},handleSetRelease:function(b){var a=b.data;
this.currentReleaseUrl=a.url;
this.releaseSet=true;
clearTimeout(this.nextClipTimerId);
tpDebug("handleSetRelease setting release with url "+a.url)
},handleSetReleaseUrl:function(b){var a=b.data;
tpDebug("handleSetReleaseUrl setting release url to "+a);
clearInterval(this.timeUpdateTimer);
this.currentReleaseUrl=a
},handleReleaseStart:function(b){this.newRelease=true;
this.currentVideoTime=0;
this.wasPaused=false;
this.percentLoaded=0;
this.playlist=b.data;
var c=this.playlist.metaTags;
if(c){var a=0;
for(;
a<c.length;
a++){if(c[a].name==="manifestServiceUrl"){this.playlistHasSSA=true
}}}},doMediaLoadStart:function(d){tpDebug("doMediaLoadStart called for for url "+d.URL);
this.clipEnded=false;
this.startedPlaying=false;
this.percentLoaded=0;
if(this.currentClip){this.previousClipUrl=this.currentClip.baseClip.URL
}clearTimeout(this.nextClipTimerId);
clearInterval(this.timeUpdateTimer);
this.jumpTime=undefined;
this.needsJump=false;
this.startedBuffer=false;
tpDebug("handleMediaLoadStart fired, newRelease="+this.newRelease);
this.wasPaused=(this.currentClip&&this.currentClip.streamType!="empty"&&!this.currentClip.baseClip.isAd)&&this.paused&&this.newRelease==false;
this.currentClip=d;
this.clipEndedDueToSeek=false;
if(d.URL.toLowerCase().indexOf("mp3")==-1){this.videoEngine.setPoster("")
}this.removeListeners();
if(this._startMuted){this.controller.mute(true);
this._startMuted=undefined
}if((this.currentURL!=d.URL||this.newRelease||this.hasError)&&d.streamType!=="empty"){this.isSeeking=false;
this.suppressPause=true;
var c=this;
var b=d.startTime+d.offset;
var a=function(){c.videoEngine.removeEventListener("MEDIA_UNLOADED",a);
c.hasError=false;
c.ignoreErrors=false;
c.isComplete=false;
c.newRelease=false;
c.attachListeners();
tpDebug("Starting clip #"+d.clipIndex+" with src:"+d.URL+" at offset:"+(b));
setTimeout(function(){if(d.streamType!=="empty"){c.unloaded=false;
c.loading=true;
tpDebug("Doing ve.load() for "+d.URL+" to offset "+b);
var e=c.createMediaFileFromClip(d);
if($pdk.isAndroid44plus){c.videoEngine.play()
}c.videoEngine.load(e,b);
c.loading=false;
c.releaseSet=false
}else{c.showBlocker(false)
}if(!c.wasPaused||d.baseClip.noSkip){tpDebug("Calling play again because it was paused");
c.videoEngine.play()
}},1);
c.clipEnded=false;
c.currentURL=d.URL;
if(d.baseClip.noSkip&&d.streamType!=="empty"){c.showControls(false)
}else{tpDebug("showing controls");
c.showControls(true)
}setTimeout(function(){tpDebug("Firing OnMediaLoadStart");
tpTimeEnd("Time from setReleaseUrl until OnMediaLoadStart");
c.controller.dispatchEvent("OnMediaLoadStart",d)
},1)
};
this.isComplete=false;
a();
return
}else{if(this.playbackManager.isNoopClip(d)||this.playbackManager.isProxyClip(d)){tpDebug("NoOp case");
this.isSeeking=false;
var c=this;
var a=function(){c.videoEngine.removeEventListener("MEDIA_UNLOADED",a);
if(d.baseClip.noSkip===true){c.showControls(false)
}setTimeout(function(){c.unloaded=false;
tpDebug("Firing OnMediaLoadStart");
tpTimeEnd("Time from setReleaseUrl until OnMediaLoadStart");
c.controller.dispatchEvent("OnMediaLoadStart",d);
c.showBlocker(false)
},1)
};
this.videoEngine.load(this.createMediaFileFromClip(d));
this.showControlBlocker(false);
a();
return
}else{if(!this.clipEnded){this.clipEnded=true;
this.suppressPause=true
}}}this.newRelease=false;
this.attachListeners();
tpDebug("Starting clip #"+d.clipIndex+" with src:"+d.URL+" at offset:"+(d.startTime+d.offset));
if(d.streamType!=="empty"){this.videoEngine.load(this.createMediaFileFromClip(d),d.startTime+d.offset)
}else{this.showBlocker(false)
}this.clipEnded=false;
this.currentURL=d.URL;
var c=this;
if(d.baseClip.noSkip){c.showControls(false)
}else{tpDebug("showing controls");
c.showControls(true)
}setTimeout(function(){tpDebug("Firing OnMediaLoadStart");
c.controller.dispatchEvent("OnMediaLoadStart",d)
},1)
},handleReleaseEnd:function(c){var b=c.data;
var a=this;
this.clipEnded=true;
if(this.timeUpdateTimer){clearInterval(this.timeUpdateTimer)
}this.videoEngine.unload();
this.showBlocker(true);
var e;
if(b){e=b.releaseURL
}function d(){if(!this.stayInFullScreen){tpDebug("Exiting fullscreen");
a.controller.showFullScreen(false)
}if(e&&e===a.currentReleaseUrl){a.controller.loadReleaseURL(a.currentReleaseUrl)
}}this.nextClipTimerId=setTimeout(function(){d()
},1000);
this.hideVideo();
this.currentClip=null
},handleClearCurrentRelease:function(){clearTimeout(this.nextClipTimerId)
},showControls:function(a){this.showControlBlocker(!a)
},onResize:function(){var a=this;
if(!this._tryResize()){if(this._resizeTimout<=0&&this._tryResizeAttempts<100){this._resizeTimout=setTimeout(function(){a._resizeTimout=0;
a.onResize()
},100)
}else{tpDebug("Gave up trying to resize after attemps:"+this._tryResizeAttempts);
this._tryResizeAttempts=0
}}},_tryResize:function(){if(this.container){if(this._containerWidth!==this.container.offsetWidth||this._containerHeight!==this.container.offsetHeight){this._tryResizeAttempts=0;
this._containerWidth=this.container.offsetWidth;
this._containerHeight=this.container.offsetHeight;
this.controller.dispatchEvent("OnResize",{width:this._containerWidth,height:this._containerHeight});
this.controller.dispatchEvent("OnPlayerComponentAreaChanged",{width:this._containerWidth,height:this._containerHeight});
var a=this.controller.getOverlayArea(false,false,true);
this.controller.dispatchEvent("OnOverlayAreaChanged",a);
this.controller.dispatchEvent("OnContentAreaChanged",this.controller.getContentArea());
this.updateMediaArea();
tpDebug(" MediaArea width/height is "+this._mediaArea.width+"/"+this._mediaArea.height);
if(a.width<=0||a.height<=0){tpDebug(" OverlayArea width/height is "+a.width+"/"+a.height+" so returning false");
return false
}return true
}}this._tryResizeAttempts++;
return false
},setTimer:function(){tpDebug("Setting timeUpdateTimer");
if(this.timeUpdateTimer){clearInterval(this.timeUpdateTimer)
}var a=this;
this.timeUpdateTimer=setInterval(function(){a.onTimeUpdate()
},250)
},onMediaStart:function(d){if(!this.currentClip){return
}tpDebug("VideoEngine fired onMediaStart");
this.clipStarted=true;
this.showVideo();
this.contentAreaSet=false;
var c=this;
setTimeout(function(){c.getContentArea()
},300);
if(d.media.hasAudioTracks){var b=this.videoEngine.getAudioTracks();
for(var a in b){b[a].globalDataType="com.theplatform.pdk.data::AudioTrack"
}this.currentClip.baseClip.availableAudioTracks=b
}if(this.currentClip.baseClip.isAd&&this.videoEngine.isPaused()){this.videoEngine.play()
}if(this.currentClip.baseClip.moreInfo&&this.currentClip.baseClip.moreInfo.href){this.videoClickAnchor.style.cursor="pointer"
}else{this.videoClickAnchor.style.cursor="default"
}if(d.media.url.toLowerCase().indexOf(".mp3")>0){this.loadPoster(this.currentReleaseUrl)
}if(!this.videoEngine.isPaused()){tpDebug("In onMediaStart but ve.isPaused is false");
this.suppressPause=false;
this.setTimer()
}else{this.startedPlaying=false;
tpTimeEnd("Time from setReleaseUrl until OnMediaStart");
tpTimeEnd("Time from page load to OnMediaStart");
this.controller.dispatchEvent("OnMediaStart",this.currentClip)
}},onPlay:function(b){if(!this.currentClip||this.currentClip.streamType=="empty"){return
}if(!this._hideNativeControls&&this.currentClip.baseClip.isAd){this.showControlBlocker(true)
}if(this.timeUpdateTimer){clearInterval(this.timeUpdateTimer)
}var a=this;
this.suppressPause=false;
if(this.paused){if(this.currentClip.baseClip.isAd&&tpIsIOS()){this.showControls(false)
}this.paused=false;
if(!this.suppressPause){this.controller.dispatchEvent("OnMediaUnpause",{globalDataType:"com.theplatform.pdk.data::MediaPause",clip:this.currentClip,userInitiated:!!this.pauseUserInitiated})
}else{this.suppressPause=false
}this.pauseUserInitiated=false
}tpDebug("onPlay calling setTimer");
this.setTimer()
},onPlaying:function(a){if(!this.currentClip){return
}if(this.needsJump){}else{if(this.currentClip&&this.currentClip.baseClip.isAd==false){this.showVideo()
}else{if(this.currentClip&&this.currentClip.streamType=="empty"){this.showVideo()
}}}},onPause:function(a){if(!this.currentClip||(this.currentClip.endTime>0&&Math.abs(this.videoEngine.getCurrentTime()-this.currentClip.endTime)<500)||this.suppressPause){tpDebug("Ignoring native pause event suppressPause:"+this.suppressPause);
if(this.clipStarted&&!this.isSeeking&&this.suppressPause){this.videoEngine.play();
this.suppressPause=false
}return
}this.paused=true;
if(this.timeUpdateTimer){clearInterval(this.timeUpdateTimer)
}tpDebug("Dispatching OnMediaPause");
this.controller.dispatchEvent("OnMediaPause",{globalDataType:"com.theplatform.pdk.data::MediaPause",clip:this.currentClip,userInitiated:!!this.pauseUserInitiated});
this.pauseUserInitiated=false;
tpDebug("isAd:"+this.currentClip.baseClip.isAd);
if(this.currentClip.baseClip.isAd&&(tpIsAndroid())){this.showControlBlocker(false);
this.controller.dispatchEvent("OnShowPlayOverlay",true)
}},onMuteChange:function(a){this.controller.dispatchEvent("OnMute",a.isMute)
},onVolumeChange:function(a){this.controller.dispatchEvent("OnVolumeChange",a.volume)
},onSeeked:function(f){if(!this.isSeeking&&(!tpIsIPhone()&&tpIsIOS())&&!this.videoEngine.isFullScreen()&&!this.videoEngine.isPaused()){tpDebug("this is a bogus seek, ignoring");
return
}this.isSeeking=false;
if(!this.currentClip||this.currentClip.streamType=="empty"||this.currentClip.baseClip.noSkip){tpDebug("Ignoring seek!");
return
}if(!this.seekTimeObject&&this.currentTimeObject&&this.currentTimeObject.currentTime!=this.videoEngine.getTotalTime()){this.seekTimeObject=this.cloneTimeObject(this.currentTimeObject)
}var c={globalDataType:"com.theplatform.pdk.data::SeekObject"};
c.end=this.createCurrentTimeObject();
if(c.end!=undefined&&this.seekTimeObject!=undefined&&c.end.currentTime!=this.seekTimeObject.currentTime){c.start=this.seekTimeObject
}else{var b=this.previousTime;
var g=c.end.duration;
c.start={globalDataType:"com.theplatform.pdk.data::TimeObject",mediaTime:b,currentTime:b,currentTimeAggregate:b,duration:c.end.duration,durationAggregate:c.end.durationAggregate,percentComplete:(b/g)*100,percentCompleteAggregate:(b/g)*100,isAggregate:false,isLive:false}
}c.clip=this.currentClip;
c.clip.currentMediaTime=c.end.mediaTime;
c.clip.mediaTime=c.end.mediaTime;
var a=c.clip.mediaTime;
this.controller.dispatchEvent("OnMediaSeek",c);
this.seekTimeObject=undefined;
if(!this.paused){this.videoEngine.play()
}},onSeeking:function(a){if(!this.currentClip||this.currentClip.streamType=="empty"){return
}this.seekTimeObject=this.cloneTimeObject(this.currentTimeObject)
},onProgress:function(c){if(!this.currentClip||this.currentClip.streamType=="empty"){return
}if(!this.startedBuffer){this.startedBuffer=true;
this.controller.dispatchEvent("OnMediaBuffering",this.currentClip)
}var b=c.percentLoaded;
var a=b*this.videoEngine.getTotalTime();
if(b>=1){clearInterval(this.progressUpdateTimer)
}this.controller.dispatchEvent("OnMediaLoading",{ratioLoaded:b,isLoadComplete:b>=1,globalDataType:"com.theplatform.pdk.data::LoadMediaData",loadedMilliseconds:-1,bytesLoaded:-1,bytesTotal:-1})
},onEnded:function(b){if(b){tpDebug("MEDIA_END event for "+b.media.url+" with clipIndex: "+this.currentClip?this.currentClip.clipIndex:"none, currentClip is null");
if(this.currentClip&&b.media.url!==this.currentClip.URL){tpDebug("This was a stale onEnded event, we'll ignore it");
return
}}if(!this.currentClip||this.currentClip.streamType=="empty"||this.clipEnded===true){return
}if(this.currentClip.baseClip.isAd){this.currentClip.hasPlayed=true;
this.playbackManager.updateClip(this.currentClip)
}tpDebug("onEnded called for for url "+this.currentClip.URL);
tpDebug("Clearing timeUpdateTimer");
if(this.timeUpdateTimer){clearInterval(this.timeUpdateTimer)
}this.jumpTime=undefined;
this.needsJump=false;
this.currentVideoTime=undefined;
var a=this.videoEngine.getCurrentTime();
tpDebug("Dispatching OnMediaEnd at "+a+" for src:"+this.currentClip.URL);
if(this.startedPlaying&&!this.clipEnded){tpDebug("Calling endMedia()");
this.endMedia()
}else{tpDebug("Never started Playing or clipEnded is already true","tpPlayer");
if(!this.releaseSet&&!this.loading){this.playbackManager.nextClip()
}}this.releaseSet=false
},onAudioTrackSwitched:function(c){tpDebug("audioTrackSwitched from VE new:"+c.newAudioTrackIndex,"tpPlayer");
var a=this.videoEngine.getAudioTrackByIndex(c.newAudioTrackIndex);
var d=this.videoEngine.getAudioTrackByIndex(c.oldAudioTrackIndex);
if(a){a.globalDataType="com.theplatform.com.data::AudioTrack"
}if(d){d.globalDataType="com.theplatform.com.data::AudioTrack"
}var b={oldAudioTrack:d,newAudioTrack:a};
if(this.startedPlaying){this.controller.dispatchEvent("OnAudioTrackSwitched",b)
}else{this.standbySwitchedAudio=b
}},endMedia:function(){this.clipEnded=true;
this.playbackManager.endMedia(this.currentClip);
if(this.timeUpdateTimer){clearInterval(this.timeUpdateTimer)
}},onTimeUpdate:function(g){if(this.currentClip===undefined){return
}if(this.isSeeking){tpDebug("We're still seeking so we'll suppress onTimeUpdate");
return
}if(this.clipEnded){tpDebug("onTimeUpdate fired somehow even though clipEnded is true");
clearInterval(this.timeUpdateTimer);
return
}if(this.currentClip&&!this.startedPlaying){this.startedPlaying=true;
var b=tpGetPid(this.currentReleaseUrl);
this.currentClip.releasePID=b;
var c=this.videoEngine.getTotalTime();
if(isNaN(c)||c<=0){c=this.currentClip.mediaLength
}this.currentClip.trueLength=Math.floor(c);
this.currentClip.baseClip.loadTime=0;
this.currentClip.currentMediaTime=Math.floor(c);
this.currentClip.mediaTime=this.currentClip.currentMediaTime;
this.currentClip.mediaLength=Math.round(c);
if(!this.currentClip.baseClip.isAd&&(!this.currentClip.chapter||!this.currentClip.chapter.chapters.isAggregate)){this.currentClip.endTime=this.currentClip.length=this.currentClip.mediaLength;
if(this.currentClip.chapter){this.currentClip.chapter.chapters.aggregateLength=this.currentClip.chapter.endTime=this.currentClip.mediaLength;
this.playlist.chapters.chapters[0].length=this.playlist.chapters.aggregateLength=this.currentClip.mediaLength
}}this.previousTime=this.currentClip.currentMediaTime;
tpDebug("Player dispatching OnMediaStart paused="+this.videoEngine.isPaused()+" for clip with index "+this.currentClip.clipIndex+" and url "+this.currentClip.URL+" with VE at offset "+this.videoEngine.getCurrentTime());
this.suppressPause=false;
this.startedPlaying=true;
tpTimeEnd("Time from setReleaseUrl until OnMediaStart");
tpTimeEnd("Time from page load to OnMediaStart");
this.controller.dispatchEvent("OnMediaStart",this.currentClip);
if(this.standbySwitchedAudio){this.controller.dispatchEvent("OnAudioTrackSwitched",this.standbySwitchedAudio);
this.standbySwitchedAudio=null
}}if(this.jumpTime){}else{if(this.delaySeek){if(this.doSeek(this.delaySeek)){this.delaySeek=undefined;
this.delaySeekPercentage=undefined
}}else{if(this.delaySeekPercentage){if(this.seekToPercentage(this.delaySeekPercentage)){this.delaySeekPercentage=undefined
}}else{if(this.currentVideoTime&&Math.abs(this.currentVideoTime-(this.videoEngine.getCurrentTime()))<250){}else{if(!this.clipEnded){var a=true;
if(!this.videoEngine.isPaused()){this.showBlocker(false)
}else{if(this.blockerShowing===true){this.showBlocker(false)
}}var c=this.videoEngine.getTotalTime();
if(isNaN(c)||c<=0){c=this.currentClip.mediaLength
}this.currentClip.currentMediaTime=Math.floor(this.videoEngine.getCurrentTime());
this.currentClip.mediaTime=this.currentClip.currentMediaTime;
this.currentClip.mediaLength=Math.round(c);
if(!this.currentClip.baseClip.isAd&&(!this.currentClip.chapter||!this.currentClip.chapter.chapters.isAggregate)){this.currentClip.endTime=this.currentClip.length=this.currentClip.mediaLength;
if(this.currentClip.chapter){this.currentClip.chapter.chapters.aggregateLength=this.currentClip.chapter.endTime=this.currentClip.mediaLength;
this.playlist.chapters.chapters[0].length=this.playlist.chapters.aggregateLength=this.currentClip.mediaLength
}}if(this.videoEngine.getCurrentTime()===0&&this.currentClip&&this.currentClip.currentMediaTime>0&&Math.abs(this.currentClip.currentMediaTime-this.currentClip.endTime)<1000){this.onEnded();
return
}else{if(this.videoEngine.getCurrentTime()===0){return
}}var f=this.currentTimeObject;
this.currentTimeObject=this.createCurrentTimeObject();
if(this.currentClip){this.controller.updateMediaTime(this.currentClip.currentMediaTime)
}if(this.percentLoaded<1&&this.percentLoaded!=this.videoEngine.getPercentLoaded()){this.percentLoaded=this.videoEngine.getPercentLoaded();
this.onProgress({percentLoaded:this.percentLoaded})
}if(f==null||(f.currentTime!==this.currentTimeObject.currentTime)){if(!this.contentAreaSet){this.getContentArea();
this.contentAreaSet=true
}this.controller.dispatchEvent("OnMediaPlaying",this.currentTimeObject)
}this.showVideo();
this.showBlocker(false);
var d=this.videoEngine.getCurrentTime();
if(this.currentVideoTime){d=this.currentVideoTime
}this.currentVideoTime=undefined;
if(this.playlistHasSSA&&tpIsIOS()&&this.videoEngine.isFullScreen()){return
}if(this.currentClip&&this.currentClip.endTime&&this.currentClip.endTime>0&&(!this.playlistHasSSA?(Math.abs(d-this.currentClip.endTime)<300||this.isSeeking&&d>this.currentClip.endTime):d>this.currentClip.endTime)&&Math.abs(d-c)>1000){this.currentVideoTime=this.videoEngine.getCurrentTime();
if(this.currentClip.baseClip.isAd){this.currentClip.hasPlayed=true
}this.playbackManager.updateClip(this.currentClip);
tpDebug("Calling onEnded() at "+this.videoEngine.getCurrentTime());
this.onEnded()
}else{if(this.currentClip.endTime>0&&d>this.currentClip.endTime||d<(this.currentClip.startTime-30)){tpDebug("We're outside of the clip boundaries for clipIndex "+this.currentClip.clipIndex+" of "+this.currentClip.startTime+" to "+this.currentClip.endTime+" , so sending a seek event at currentTime:"+d)
}}this.previousTime=d
}}}}}},createCurrentTimeObject:function(f){if(!this.video){return undefined
}var g=Math.round(f===undefined?this.videoEngine.getCurrentTime():f);
var a=this.currentClip.chapter;
var h=false;
if(a&&!this.currentClip.baseClip.isAd&&(g<a.startTime||g>a.endTime)){var c=0;
var j=this.playlist.chapters.chapters.length;
for(;
c<j;
c++){var l=this.playlist.chapters.chapters[c];
var e=this.playlist.chapters.chapters[c+1];
if(l&&g>=l.startTime&&g<=l.endTime){tpDebug("selecting chapter "+c);
h=true;
a=l;
break
}else{if(e&&g>=l.endTime&&g<=e.startTime){h=true;
tpDebug("selecting chapter "+(c+1));
a=e;
g=a.startTime;
break
}}}}if(a&&a.chapters&&(a.chapters.isAggregate||a.chapters.isRelative)){var b={globalDataType:"com.theplatform.pdk.data::TimeObject"};
b.mediaTime=g;
b.currentTime=g-a.startTime;
b.currentTimeAggregate=a.aggregateStartTime+b.currentTime;
b.duration=a.length;
b.durationAggregate=a.chapters.aggregateLength;
b.percentComplete=(b.currentTime/a.length)*100;
b.percentCompleteAggregate=(b.currentTimeAggregate/b.durationAggregate)*100,b.isAggregate=a.chapters.isAggregate,b.isLive=false;
return b
}else{if(this.currentClip.baseClip.isAd&&this.currentClip.endTime>0){var b={globalDataType:"com.theplatform.pdk.data::TimeObject"};
b.mediaTime=g;
b.currentTime=g-this.currentClip.startTime;
b.currentTimeAggregate=b.currentTime;
b.duration=this.currentClip.length;
b.durationAggregate=b.duration;
b.percentComplete=(b.currentTime/b.duration)*100;
b.percentCompleteAggregate=b.percentComplete,b.isAggregate=false,b.isLive=false;
return b
}else{var k=Math.round(this.videoEngine.getTotalTime());
return{globalDataType:"com.theplatform.pdk.data::TimeObject",mediaTime:g,currentTime:g,currentTimeAggregate:g,duration:k,durationAggregate:k,percentComplete:(g/k)*100,percentCompleteAggregate:(g/k)*100,isAggregate:false,isLive:false}
}}},cloneTimeObject:function(a){return a?{globalDataType:"com.theplatform.pdk.data::TimeObject",mediaTime:a.mediaTime,currentTime:a.currentTime,currentTimeAggregate:a.currentTimeAggregate,duration:a.duration,durationAggregate:a.durationAggregate,percentComplete:a.percentComplete,percentCompleteAggregate:a.percentCompleteAggregate,isAggregate:a.isAggregate,isLive:a.isLive}:undefined
},onPlaybackError:function(a){if(this.ignoreErrors||!this.currentClip||this.currentClip.streamType=="empty"){tpDebug("Ignoring playback error");
return
}tpDebug("Got a playback error from the video engine, the call to play media must not have orginated from a user click.");
if(this.currentReleaseUrl){tpDebug("Calling loadReleaseUrl for "+this.currentReleaseUrl);
this.controller.loadReleaseURL(this.currentReleaseUrl)
}else{tpDebug("We don't have a releaseurl to load")
}},onError:function(a){if(this.ignoreErrors||!this.currentClip||this.currentClip.streamType=="empty"){return
}this.doError()
},doError:function(){clearTimeout(this.nextClipTimerId);
this.showControls(false);
this.showBlocker(true);
if(this.timeUpdateTimer){clearInterval(this.timeUpdateTimer)
}this.hasError=true;
var a={location:this.id,context:null,clip:this.currentClip,endRelease:!this.currentClip.baseClip.isAd||(this.playlistHasSSA&&this.urlEqualsContentClip(this.playlist,this.currentClip.URL)),message:"The media cannot be played",friendlyMessage:"The media cannot be played",globalDataType:"com.theplatform.pdk.data::PlaybackError"};
if(this.currentClip.baseClip.isAd){this.currentClip.hasPlayed=true;
this.playbackManager.updateClip(this.currentClip)
}this.suppressPause=false;
this.controller.sendError(a)
},urlEqualsContentClip:function(d,b){for(var a=0;
a<d.clips.length;
a++){var e=d.clips[a];
if(!e.isAd){return e.URL==b
}}return true
},showVideo:function(){if(this.isShowing){return
}this.player.style.visibility="";
this.isShowing=true
},hideVideo:function(){if(this.isShowing===false){return
}this.player.style.visibility="hidden";
this.isShowing=false
},loadPoster:function(b){if(!b){return
}if(!this.standby){this.standby=document.getElementById(this.id+".standby")
}var a=b.split("?")[0]+"?format=poster&width="+this.standby.offsetWidth+"&height="+this.standby.offsetHeight;
this.videoEngine.setPoster(a)
},simulateClick:function(d){tpDebug("simulateClick");
var c=document.createElement("a");
c.id="clickSimulator";
c.href="#";
document.body.appendChild(c);
c.addEventListener("click",function(a){a.preventDefault();
d()
},false);
var b;
if(document.createEvent){b=document.createEvent("MouseEvents");
if(b.initMouseEvent){b.initMouseEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null);
c.dispatchEvent(b)
}}document.body.removeChild(c)
},setMediaArea:function(b){if(b.width>0&&b.height>0){this._mediaArea=b;
this.video.style.top=b.y+"px";
this.video.style.left=b.x+"px";
this.video.style.width=b.width+"px";
this.video.style.height=b.height+"px";
this.video.style.position="absolute";
this.blocker.style.top=b.y+"px";
this.blocker.style.left=b.x+"px";
this.blocker.style.width=b.width+"px";
this.blocker.style.height=b.height+"px";
this.blocker.style.position="absolute";
this.controller.dispatchEvent("OnMediaAreaChanged",this.getMediaArea());
var a=this;
setTimeout(function(){a.getContentArea()
},300)
}},updateMediaArea:function(){var a={top:0,left:0,x:0,y:0,width:this.player.offsetWidth,height:this.player.offsetHeight};
if(!this._mediaArea||a.width!=this._mediaArea.width||a.height!=this._mediaArea.height){this._mediaArea=a;
this.controller.dispatchEvent("OnMediaAreaChanged",this._mediaArea)
}},getContentArea:function(k){var b=0;
var l=0;
try{if(this.currentClip){b=this.currentClip.baseClip.width;
l=this.currentClip.baseClip.height
}if(this.contentAreaSet||b===0||l===0){var a=this.videoEngine.getVideoWidth();
var d=this.videoEngine.getVideoHeight();
if(a>0&&d>0){b=a;
l=d
}}}catch(h){return{x:0,y:0,width:0,height:0}
}if(!this._mediaArea){this.updateMediaArea()
}var n=b/l;
var g=this._mediaArea.width/this._mediaArea.height;
var j=0;
var i=0;
var f;
var m;
if(n>=g){f=this._mediaArea.width;
m=Math.round(this._mediaArea.width/n);
i=Math.abs(Math.round(this._mediaArea.y+Math.round(this._mediaArea.height-m)/2))
}else{f=Math.round(this._mediaArea.height*n);
m=this._mediaArea.height;
j=Math.abs(Math.round(this._mediaArea.x+Math.round(this._mediaArea.width-f)/2))
}var c={x:j,y:i,width:f,height:m};
if(!k){this.controller.dispatchEvent("OnContentAreaChanged",c)
}return c
},getMediaArea:function(){if(!this._mediaArea){this.updateMediaArea()
}return this._mediaArea
},getComponentSize:function(){return tpGetComponentSize(this.container)
},_fixAndroidChrome:function(d){if(this._androidReady){d();
return
}tpDebug("Calling _fixAndroidChrome");
this.removeListeners();
this.videoEngine.load("",0);
var a=this;
var c=false;
var b=function(f){if(c){return
}a._androidReady=true;
a.videoEngine.removeEventListener("MEDIA_ERROR",b);
if(f){a.videoEngine.unload();
d()
}c=true
};
this.videoEngine.addEventListener("MEDIA_ERROR",b);
setTimeout(b,1000)
},showControlBlocker:function(a){this.controlBlockerShowing=a;
a?this.controlBlocker.style.display="":this.controlBlocker.style.display="none"
},showBlocker:function(a){this.blockerShowing=a;
a?this.blocker.style.display="":this.blocker.style.display="none"
},handleOnMediaAreaChanged:function(a){if(a.data.height==0){tpDebug("setting video height to:"+a.data.height,"tpPlayer")
}this.blocker.style.top=a.data.y+"px";
this.blocker.style.left=a.data.x+"px";
this.blocker.style.width=a.data.width+"px";
this.blocker.style.height=a.data.height+"px";
this.blocker.style.position="absolute"
},handleOnOverlayAreaChanged:function(a){if(this.videoengineruntime==="silverlight"){this.controlBlocker.style.width=a.data.width+"px";
this.controlBlocker.style.height=a.data.height+"px"
}}});
if(typeof(Player)==="undefined"){Player=tpPlayer
}PlugInManager=Class.extend({init:function(a){this.controller=a;
this.plugins=new Array()
},addPlugIn:function(b,i,j,a,f,g,h,d,c){if((a.indexOf(".swf")<0)){var e={id:b,type:i,priority:j,url:a,subUrl:f,vars:g,plugIn:h};
this.plugins.push(e)
}},ready:function(){var b=this;
if(!this.plugins||this.plugins.length===0){setTimeout(function(){tpTimeEnd("Time it took from $pdk.onload until OnPluginsComplete");
b.controller.dispatchEvent("OnPlugInsComplete",null);
b.controller.initializePlayback()
},1);
return
}for(var a=0;
a<this.plugins.length;
a++){tpController.loadPlugIn(this.plugins[a],this.controller)
}}});
$pdk.ns("$pdk.classes");
$pdk.classes.ReplacePlaylistManager=$pdk.extend(function(){},{constructor:function(){},replacePlaylist:function(a,d){var c=false;
for(var b=0;
b<a.length;
b++){if(a[b].playlistPlugIn.replacePlaylist&&a[b].playlistPlugIn.replacePlaylist.apply(a[b].playlistPlugIn,[d])){c=true
}}return c
}});
var SeekEvents={USERSEEKED:"userseeked",PROGRAMATICALLYSEEKED:"programaticallyseeked",SEEKFAILED:"seekfailed"};
var SeekStates={PAUSED:"paused",PLAYING:"playing",USERSEEKING:"userseeking",PROGRAMATICALLYSEEKING:"programaticallyseeking",ERROR:"error"};
SeekHandler=EventDispatcher.extend({init:function(a){this.videoEngine=a;
this.seekInterval=350;
this.seekState=this.videoEngine.isPaused()?SeekStates.PAUSED:SeekStates.PLAYING;
var b=this;
if(!tpIsIOS()){}else{}this.videoEngine.addEventListener("MEDIA_SEEKED",function(c){b.onSeeked(c)
});
this.lastTime=this.videoEngine.getCurrentTime()/1000
},stopTimer:function(){clearInterval(this.seekTimer)
},startTimer:function(){var a=this;
this.lastTime=0;
this.seekTimer=setInterval(function(){a.onTimer()
},this.seekInterval)
},onSeeked:function(b){tpDebug("got seeked event from "+this.lastTime+" to"+this.videoEngine.getCurrentTime());
this.lastTime=this.video.getCurrentTime()/1000;
if(false&&this.seeking&&Math.abs(this.videoEngine.getCurrentTime()/1000-this.seekingTo)<=300){}else{tpDebug("This was a user seek");
var a=this;
setTimeout(function(){a.dispatchEvent(SeekEvents.USERSEEKED,a.lastTime)
},1)
}this.seekState=this.videoEngine.isPaused()?SeekStates.PAUSED:SeekStates.PLAYING
},onSeeking:function(a){},onTimer:function(){},doSeek:function(b,a,c){},removeProgressListeners:function(){clearInterval(this.progTimer);
this.progTimer=undefined
},checkPlayable:function(){return this.video.readyState>=3
},checkSeekable:function(a){return false
},checkBuffered:function(a){return false
},destroy:function(){this.buildListenerChain();
this.removeProgressListeners();
clearInterval(this.seekTimer)
}});
StandbyManager=Class.extend({init:function(b,a){this.controller=b;
this.pbm=a;
var c=this;
this.controller.registerFunction("showMenuCard",this,this.showMenuCard);
this.controller.registerFunction("checkIfEndCardExists",this,this.checkIfEndCardExists);
this.controller.addEventListener("OnLoadReleaseUrl",function(f){if(!c.formVisible){c.controller.dispatchEvent("OnShowPlayOverlay",true)
}else{}c.controller.dispatchEvent("OnShowPreviewImageOverlay",false)
});
this.controller.addEventListener("OnMediaEnd",function(f){c.playing=false
});
this.controller.addEventListener("OnMediaStart",function(f){c.playing=true
});
this.controller.addEventListener("OnReleaseEnd",function(f){c.playing=false
});
this.controller.addEventListener("OnClearCurrentRelease",function(f){tpDebug("StandbyManager got "+f.type);
c.controller.dispatchEvent("OnShowPreviewImageOverlay",false);
c.controller.dispatchEvent("OnShowPlayOverlay",false);
c.setStandby(false)
});
this.controller.addEventListener("OnReleaseError",function(f){tpDebug("StandbyManager got "+f.type);
c.setStandby(false)
});
this.controller.addEventListener("OnShowCard",function(f){tpDebug("StandbyManager got "+f.type);
if(f.data.deck=="forms"){c.formVisible=true
}});
this.controller.addEventListener("OnHideCard",function(f){tpDebug("StandbyManager got "+f.type);
if(f.data.deck=="forms"){c.formVisible=false
}});
this.controller.addEventListener("OnSetReleaseUrl",function(f){c.setStandby(false)
});
this.controller.addEventListener("OnSetRelease",function(f){c.setStandby(false)
});
this.controller.addEventListener("OnResetPlayer",function(f){c.setStandby(false)
});
var d=this.controller.getProperty("endCard");
if(d){this.endCardID=d
}else{this.endCardID="forms:tpMenuCard"
}},showMenuCard:function(a){if(a){this.controller.showPlayerCard("forms","tpMenuCard")
}else{this.controller.hidePlayerCard("forms")
}},setStandby:function(b,a){if(b){this.doStartStandby(a)
}else{this.doRemoveStandby()
}},checkIfEndCardExists:function(b){var a=this.controller.getProperty("endCard");
if(a){this.endCardID=a
}else{this.endCardID="tpMenuCard"
}return true
},doStartStandby:function(a){tpDebug("doing startStandby");
if(this.playing==true){return
}this.isStandBy=true;
var h=this.controller.getProperty("endCard");
if(h){this.endCardID=h
}if(!a){tpDebug("dispatching OnShowPlayOverlay true");
this.controller.dispatchEvent("OnShowPlayOverlay",!this.formVisible)
}else{tpDebug("call to show card");
var g=false;
if(this.endCardID.indexOf(":")!=-1){var d=this.endCardID.split(":");
var b=d[0];
var c=d[1];
this.controller.showPlayerCard(b,c);
g=(b!=="forms")
}else{this.controller.showPlayerCard("forms",this.endCardID)
}if(tpIsIOS()){this.controller.showFullScreen(false)
}this.controller.dispatchEvent("OnShowPlayOverlay",g)
}var e;
var f=this;
this.playingListener=function(i){f.controller.removeEventListener("OnMediaPlaying",f.playingListener);
if(f.isStandBy){tpDebug("playingListener hiding overlay");
f.isStandBy=false
}};
this.controller.addEventListener("OnMediaPlaying",this.playingListener,true)
},doRemoveStandby:function(){if(this.isStandby){this.isStandby=false;
this.controller.dispatchEvent("OnShowPlayOverlay",false)
}}});
TokenManager=Class.extend({init:function(a){this.controller=a;
this.pluginsLoaded=false;
this.waitTokens={};
var c=this;
var b=this.controller.getProperty("token");
if(b){this.setToken(b,"urn:theplatform:auth:token")
}this.controller.registerFunction("setToken",this,this.setToken);
this.plugInsCompleteHandler=function(d){c.plugInsComplete.apply(c,arguments)
};
this.controller.addEventListener("OnPlugInsComplete",this.plugInsCompleteHandler)
},plugInsComplete:function(b){this.controller.removeEventListener("OnPlugInsComplete",this.plugInsCompleteHandler);
this.pluginsLoaded=true;
for(var a in this.waitTokens){this._doSetToken(this.waitTokens[a])
}},setToken:function(b,c){if(!c){c="urn:theplatform:auth:token"
}var a={token:b,type:c,globalDataType:"com.theplatform.pdk.data::TokenInfo"};
if(this.pluginsLoaded){this._doSetToken(a)
}else{this.waitTokens[c]=a
}},_doSetToken:function(a){this.controller.dispatchEvent("OnSetToken",a)
}});
UrlManager=Class.extend({init:function(a){this.controller=a;
this.plugins=[];
this._currentQueue=[];
this.totalUrlPluginsRegistered=0;
this.totalUrlPluginsLoaded=0;
this.controller.registerFunction("registerURLPlugIn",this,this.registerURLPlugIn);
this.controller.registerFunction("setClip",this,this.setClip)
},checkClip:function(a,b){this._context={clip:a,callback:b,complete:false,found:false};
this._currentQueue=this.plugins.concat();
if(this._currentQueue.length===0){b(a);
return true
}else{if(!this._processNextPlugin()){b(a)
}return false
}},_processNextPlugin:function(){var b=false,a;
while(!b&&this._currentQueue.length>0){a=this._currentQueue.shift();
b=a.component.rewriteURL(this._context.clip)
}this._context.found=b?true:this._context.found;
return this._context.found
},registerURLPlugIn:function(b,c,a){a=parseInt(a);
this.plugins.push({component:b,urlType:c,priority:(isNaN(a)?1000:a)});
this.totalUrlPluginsRegistered++;
this.plugins.sort(this.compare)
},setClip:function(a){if(this._currentQueue.length===0){if(!this._context.complete){this._context.clip=a;
this._context.callback(a);
this._context.complete=true
}}else{this._context.clip=a;
if(!this._processNextPlugin()){this.setClip(a)
}}},compare:function(d,c){return d.priority-c.priority
}});
function tpIsAndroid(){if(navigator.userAgent.match(/iPhone/i)){return false
}else{if(navigator.userAgent.match(/Android/i)){return true
}else{return false
}}}function tpIsChrome(){if(navigator.userAgent.toLowerCase().match(/chrome/i)){return true
}else{return false
}}function tpIsAndroidLegacy(){if(!navigator.userAgent.match(/Android/i)){return false
}else{if(navigator.userAgent.toLowerCase().indexOf("android 1.")!=-1){return true
}else{if(navigator.userAgent.toLowerCase().indexOf("android 2.")!=-1){return true
}else{if(navigator.userAgent.toLowerCase().indexOf("android 3.0")!=-1){return true
}else{if(navigator.userAgent.toLowerCase().indexOf("silk")!=-1){return true
}else{return false
}}}}}}function tpIsIOS(){if(navigator.userAgent.match(/iPad/i)){return true
}if(navigator.userAgent.match(/iPhone/i)){return true
}else{return false
}}function tpIsIPhone(){if(navigator.userAgent.match(/iPhone/i)){return true
}else{return false
}}function tpGetPid(b){var c=b;
if(c&&c.indexOf("pid=")==-1){c=c.substring(c.lastIndexOf("/")+1);
var a=c.indexOf("?");
if(a>0){c=c.substring(0,a)
}}else{if(c){c=c.substring(c.indexOf("pid=")+4);
var a=c.indexOf("&");
if(a>0){c=c.substring(0,a)
}}}return c
}tpControllerClass=$pdk.queue.Controller;
function tpScaleImage(c,g,h){var a=parseInt(c.naturalWidth);
var i=parseInt(c.naturalHeight);
var b=i/a;
c.originalHeight=i;
c.originalWidth=i;
var f=h/g;
var e=g/a;
var d=h/i;
if((e-d)>0){c.height=(h);
c.style.width="auto";
c.newHeight=h;
c.newWidth=h/b
}else{if((e-d)<0){c.width=(g);
c.style.height="auto";
c.newWidth=g;
c.newHeight=g*b
}else{c.height=h;
c.width=g;
c.newHeight=h;
c.newWidth=g
}}}function tpIsChrome(){return(navigator.userAgent.toLowerCase().indexOf("chrome")>-1)
}function tpIsWebKit(){return(navigator.userAgent.toLowerCase().indexOf("webkit")>-1)
}function tpIsSafari(){return(navigator.userAgent.toLowerCase().indexOf("safari")>-1)
}function tpIsFirefox(){return(navigator.userAgent.toLowerCase().indexOf("firefox")>-1)
}function tpParseXml(b){var a=null;
if(window.DOMParser){var c=new DOMParser();
a=c.parseFromString(b,"text/xml")
}else{a=new ActiveXObject("Microsoft.XMLDOM");
a.async="false";
a.loadXML(b)
}tpRemoveWhiteSpace(a);
return a
}function tpRemoveWhiteSpace(b){var a=/\S/;
for(var c=0;
c<b.childNodes.length;
c++){var d=b.childNodes[c];
if(d.nodeType==3&&(!(a.test(d.nodeValue)))){b.removeChild(d);
c--
}else{if(d.nodeType==1){tpRemoveWhiteSpace(d)
}}}}function tpRemoveComments(a){for(var b=0;
b<a.childNodes.length;
b++){var c=a.childNodes[b];
if(c.nodeType==8){a.removeChild(c);
b--
}else{if(c.nodeType==1){tpRemoveComments(c)
}}}}function tpTimeToMillis(d){var a=0;
if(d){if(d.indexOf("ms")>0){a=d.substr(0,d.indexOf("ms"))
}else{var c=d.split(":");
while(c.length>0){var b=c.shift();
if(c.length==2){a+=((b)*1000*60*60)
}if(c.length==1){a+=((b)*1000*60)
}if(c.length==0){if(b.indexOf(".")){a+=((b)*1000)
}else{a+=(b)*1000
}}}}}return a
}function tpSendUrl(a){var b=document.createElement("img");
b.src=a;
b.style.display="none";
b.width=1;
b.height=1;
b.left=-1111;
b.src=a;
document.body.appendChild(b);
tpDebug("sent tracking/impressiong to  "+a);
document.body.removeChild(b)
}function tpGetIEVersion(){var c=9999;
if(navigator.appName=="Microsoft Internet Explorer"){var a=navigator.userAgent;
var b=new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
if(b.exec(a)!=null){c=parseFloat(RegExp.$1)
}}return c
}function tpGetComponentSize(b){var c=false;
var d=b.style.height;
var a=b.style.width;
if(d==="100%"&&b.style.width==="100%"||(!d&&!a)){c=true
}if(c&&b.parentNode&&(b.offsetHeight==0&&b.offsetWidth==0)){return tpGetComponentSize(b.parentNode)
}else{if(!c){d=d.replace("px","");
a=a.replace("px","");
return{width:parseInt(a),height:parseInt(d)}
}}return{width:b.offsetWidth,height:b.offsetHeight}
}function tpGetScriptPath(b){if(b===undefined&&tpScriptPath!==undefined){return tpScriptPath
}var a=document.getElementsByTagName("script");
var d;
if(b!==undefined){for(var c=0;
c<a.length;
c++){if(a[c].src.indexOf(b)>=0){d=a[c].src;
break
}}}else{d=a[a.length-1].src
}if(!d){d=a[a.length-1].src
}if(d.indexOf("/")==-1){return""
}d=d.substring(0,d.lastIndexOf("/"));
return d
}function tpMillisToStr(d){var c=d/1000;
var a=Math.floor(c/(60*60));
c=c-(a*(60*60));
var b=Math.floor(c/60);
var e=Math.floor(c)%60;
var f="";
if(a>0){f=a.toString()+":";
if(b<10){f+="0"
}}f+=b+":";
if(e<10){f+="0"
}f+=e.toString();
return f
}function tpEllipsis(h,l){var a=false;
var c=0;
var g=l.innerHTML;
var e=l.innerHTML.length;
var j=l.innerHTML.length;
var d=0;
var b=h.clientHeight>=h.scrollHeight;
var k;
var f;
while(!b){k=$pdk.jQuery(h).height();
f=h.scrollHeight;
if(tpIsFirefox()){f=0;
$pdk.jQuery(h).children().each(function(m){f+=$pdk.jQuery(h).children().eq(m).outerHeight()
})
}if((j-d)<=1){if(f>k){l.innerHTML="";
a=false
}b=true
}else{if(k>=f){d=e;
e=Math.floor((e+j)/2);
l.innerHTML=g.substr(0,e)+"&hellip;";
a=g.substr(e-1,2).match(/^[a-zA-Z]+$/)
}else{if(k<f){j=e;
e=Math.floor((e+d)/2);
l.innerHTML=g.substr(0,e)+"&hellip;";
a=g.substr(e-1,2).match(/^[a-zA-Z]+$/)
}}}c++;
if(c>100){break
}}if(l.innerHTML.substr(0,e).match(/[\W]+$/)){l.innerHTML=l.innerHTML.substr(0,e).replace(/[\W]+$/g,"")+"&hellip;"
}if(a){l.innerHTML=g.substr(0,e);
l.innerHTML=l.innerHTML.replace(/[\W]+[\w]+$/g,"");
l.innerHTML+="&hellip;"
}}function tpCreateColorizedStateStyles(h,n,j,f,i,b,l){var c=document.createElement("canvas");
var k=this;
if(c.getContext&&c.getContext("2d")){var g=$pdk.jQuery(h).css("background-image");
var d="";
if(g&&g!=="none"){if(g.indexOf('url("')==0||g.indexOf("url('")==0){g=g.substr(5,g.length-7)
}else{if(g.indexOf("url(")==0){g=g.substr(4,g.length-5)
}}var e=new Image();
e.onload=function(){var q=document.createElement("canvas");
var o=q.getContext("2d");
q.style.borderColor="#"+i.substr(2);
var p=$pdk.jQuery(q).css("border-color");
p=p.substr(4,p.length-5).split(", ");
q.width=this.width;
q.height=this.height;
o.drawImage(this,0,0,this.width,this.height);
tpColorize(o,p[0],p[1],p[2]);
d=n.replace(/\{url\}/g,"url("+q.toDataURL()+")").replace(/\{state\}/g,":hover");
if(b.styleSheet){b.styleSheet.cssText=d+b.styleSheet.cssText
}else{b.insertBefore(document.createTextNode(d),b.firstChild)
}};
e.src=g;
var m=new Image();
m.onload=function(){var q=document.createElement("canvas");
var o=q.getContext("2d");
q.style.borderColor="#"+f.substr(2);
var p=$pdk.jQuery(q).css("border-color");
p=p.substr(4,p.length-5).split(", ");
q.width=this.width;
q.height=this.height;
o.drawImage(this,0,0,this.width,this.height);
tpColorize(o,p[0],p[1],p[2]);
d=n.replace(/\{url\}/g,"url("+q.toDataURL()+")").replace(/\{state\}/g,(l?l:":active"));
if(b.styleSheet){b.styleSheet.cssText+=d
}else{b.appendChild(document.createTextNode(d))
}};
m.src=g;
var a=new Image();
a.onload=function(){var q=document.createElement("canvas");
var o=q.getContext("2d");
q.style.borderColor="#"+j.substr(2);
var p=$pdk.jQuery(q).css("border-color");
p=p.substr(4,p.length-5).split(", ");
q.width=this.width;
q.height=this.height;
o.drawImage(this,0,0,this.width,this.height);
tpColorize(o,p[0],p[1],p[2]);
d=n.replace(/\{url\}/g,"url("+q.toDataURL()+")").replace(/\{state\}/g,"");
if(b.styleSheet){b.styleSheet.cssText+=d
}else{b.appendChild(document.createTextNode(d))
}};
a.src=g
}}}function tpColorize(a,f,p,y){var C={r:f,g:p,b:y};
function j(H,G,F){var H=H/360,G=G/100,F=F/100,J,I,i;
if(G==0){J=I=i=F
}else{l=H*6;
k=Math.floor(l);
x=F*(1-G);
w=F*(1-G*(l-k));
t=F*(1-G*(1-(l-k)));
if(k==0){J=F;
I=t;
i=x
}else{if(k==1){J=w;
I=F;
i=x
}else{if(k==2){J=x;
I=F;
i=t
}else{if(k==3){J=x;
I=w;
i=F
}else{if(k==4){J=t;
I=x;
i=F
}else{J=F;
I=x;
i=w
}}}}}}return{r:Math.round(J*255),g:Math.round(I*255),b:Math.round(i*255)}
}function e(h,F,G){h=h/255;
F=F/255;
G=G/255;
var J=Math.min(h,F,G),K=Math.max(h,F,G),I=K-J,s={};
s.v=K;
if(I==0){s.h=0;
s.s=0
}else{s.s=I/K;
var H=(((K-h)/6)+(I/2))/I;
var i=(((K-F)/6)+(I/2))/I;
var v=(((K-G)/6)+(I/2))/I;
if(h==K){s.h=v-i
}else{if(F==K){s.h=(1/3)+H-v
}else{if(G==K){s.h=(2/3)+i-H
}}}if(s.h<0){s.h+=1
}if(s.h>1){s.h-=1
}}return{h:(s.h*360),s:(s.s*100),v:(s.v*100)}
}var o;
if(a.hasOwnProperty("canvas")||a.canvas){o=a
}if(a.hasOwnProperty("width")||a.width){o=a.getContext("2d")
}if(!o){console.error("Trying to colorize non-canvas");
return
}var n=o.getImageData(0,0,o.canvas.width,o.canvas.height);
var E=e(C.r,C.g,C.b);
var A=E.h/360;
var q=E.s/100;
var l=A*6;
var k=Math.floor(l);
var c=E.v*2.55;
for(var z=0;
z<n.data.length;
z+=4){if(n[z+3]==0){continue
}var m=Math.max(n.data[z]/2.55,n.data[z+1]/2.55,n.data[z+2]/2.55);
var d=m/100,u,B,D;
if(q==0){u=B=D=d
}else{var x=d*(1-q);
if(k==0||k==2||k==4){var t=d*(1-q*(1-(l-k)));
if(k==0){u=d;
B=t;
D=x
}else{if(k==2){u=x;
B=d;
D=t
}else{if(k==4){u=t;
B=x;
D=d
}}}}else{var w=d*(1-q*(l-k));
if(k==1){u=w;
B=d;
D=x
}else{if(k==3){u=x;
B=w;
D=d
}else{u=d;
B=x;
D=w
}}}}n.data[z]=u*(c);
n.data[z+1]=B*(c);
n.data[z+2]=D*(c)
}o.putImageData(n,0,0)
}var tpScriptPath;
if(window["$pdk"]===undefined){tpScriptPath=tpGetScriptPath()
}else{tpScriptPath=$pdk.scriptRoot+"/js"
}$pdk.ns("$pdk.classes");
$pdk.classes.VideoEngineSubtitlesManager=$pdk.extend(function(){},{MIME_TYPE_VTT:"text/vtt",SET_ADDED_TEXT_TRACKS_GWT:"setAddedTextTracksGwt",constructor:function(b,d){this.controller=b;
this.ve=d;
this.currentTextTracks=undefined;
this.currentVETextTracks=undefined;
this.currentVESidecarTextTracks=undefined;
this.selectedTextTrackLanguage=undefined;
this.playlist=undefined;
this.lastSelectedTextTracks=undefined;
this.fetchedStylesAndLanguage=false;
var c=this;
if(this.ve.getRuntime()==="FLASH"){b.addEventListener("OnGetSubtitleStyle",function(f){c.onGetSubtitleStyle(f)
})
}var a=this.controller.getProperty("useNativeControls")=="true";
if(!a){b.addEventListener("OnOverlayAreaChanged",function(f){c.setCaptionsOverlayArea(f)
});
b.addEventListener("OnMediaAreaChanged",function(f){c.setCaptionsMediaArea(f)
});
b.addEventListener("OnContentAreaChanged",function(f){c.recalculateCaptionsContainer(f)
})
}this.mediaPlayingHandler=function(g){var f=c.ve.getShowingCaptions();
if(f&&f.language){c.log("hiding captions for "+f.language);
c.ve.hideCaptions(false)
}};
this.isIOS_compatible=$pdk._browserCheck([{browser:"ipad",osversion:8},{browser:"iphone",osversion:8},{browser:"ipod",osversion:8}]);
tpDebug("VideoEngineSubtitlesManager constructed","VideoEngineSubtitlesManager",b.id,tpConsts.DEBUG);
this.ve.addEventListener("TEXT_TRACK_ADDED",function(f){tpDebug("Video tag dispatched "+f.type);
c.onVideoEngineTextTracks(f)
},false);
if(this.isIOS_compatible){b.addEventListener("OnReleaseStart",function(f){c.iosOnReleaseStart(f)
});
b.addEventListener("OnMediaLoadStart",function(f){c.iosOnMediaLoadStart(f)
});
b.addEventListener("OnMediaEnd",function(f){c.iosOnMediaEnd(f)
});
b.addEventListener("OnShowFullScreen",function(f){c.iosFullscreenChange(f)
});
b.addEventListener("OnMediaStart",function(f){c.iosOnMediaStart(f)
})
}else{if(!$pdk.isIOS&&$pdk.isSafari){b.addEventListener("OnMediaLoadStart",function(f){c.safariOnMediaLoadStart(f)
})
}else{if(!$pdk.isIOS){b.addEventListener("OnMediaStart",function(f){c.onMediaStart(f)
})
}else{this.log("VTT unsupported in this environment.")
}}}b.addEventListener("OnGetSubtitleLanguage",function(f){c.onGetSubtitleLanguage(f)
});
b.addEventListener("OnTextTracksAvailable",function(f){c.onTextTracksAvailable(f)
});
b.addEventListener("OnMediaLoadStart",function(f){c.onMediaLoadStart(f)
})
},onGetSubtitleLanguage:function(a){this.log("onGetSubtitleLanguage");
this.selectedTextTrackLanguage=a.data.langCode;
this.log("\tselected lang set to: "+this.selectedTextTrackLanguage);
if(this.selectedTextTrackLanguage){this.showSelectedLanguage()
}},onGetSubtitleStyle:function(a){this.log("onGetSubtitleStyle");
this.ve.callLayerFunction("tp:osmf","setSubtitleStyle",[a.data])
},onTextTracksAvailable:function(a){this.log("onTextTracksAvailable");
this.setCaptions(a.data.entries);
if(this.selectedTextTrackLanguage&&!this.clip.baseClip.isAd){this.showSelectedLanguage()
}},onVideoEngineTextTracks:function(a){this.log("onVideoEngineTextTracks");
if(!this.fetchedStylesAndLanguage&&this.ve.getRuntime()==="FLASH"){this.fetchedStylesAndLanguage=true;
this.controller.getSubtitleStyle();
this.controller.getSubtitleLanguage()
}this.controller.callFunction(this.SET_ADDED_TEXT_TRACKS_GWT,a.event)
},safariOnMediaLoadStart:function(a){this.log("safariOnMediaLoadStart");
this.prepareCaptions(a)
},onMediaStart:function(a){this.log("onMediaStart");
this.prepareCaptions(a)
},onMediaLoadStart:function(a){this.clip=a.data
},prepareCaptions:function(a){this.ve.hideCaptions(true);
this.setCaptions(a.data.baseClip.availableTextTracks);
this.loadCaptions()
},setCaptions:function(a){this.currentTextTracks=a;
this.currentVETextTracks=[];
this.currentVESidecarTextTracks=[];
var c;
if(this.currentTextTracks&&this.currentTextTracks.length>0){for(var b=0;
b<this.currentTextTracks.length;
b++){c=this.currentTextTracks[b];
if(this.isVideoEngineTextTrack(c)){this.currentVETextTracks.push(c)
}if(this.isVideoEngineSidecarTextTrack(c)){this.currentVESidecarTextTracks.push(c)
}}}},isVideoEngineTextTrack:function(a){return(a.MIMEType&&a.MIMEType.toLowerCase()==this.MIME_TYPE_VTT)||a.embedded
},isVideoEngineSidecarTextTrack:function(a){return(a.MIMEType&&a.MIMEType.toLowerCase()==this.MIME_TYPE_VTT&&!a.embedded)
},loadCaptions:function(){this.log("loadCaptions");
if(this.currentVESidecarTextTracks.length>0){var a=this.getVideoEngineTextTrackToShow();
this.log("loadCaptions for "+this.currentVESidecarTextTracks.length+" sidecar tracks");
if(a){this.log("\ttextTrackToShow: "+a.language+", "+a.mimeType+", "+a.embedded);
var b;
for(var c=0;
c<this.currentVESidecarTextTracks.length;
c++){b=this.currentVESidecarTextTracks[c];
b.show=this.tracksMatch(b,a);
this.log("\tve track for "+b.language+" has 'show' of "+b.show)
}}this.ve.loadCaptions({captions:this.currentVESidecarTextTracks},false)
}},tracksMatch:function(b,a){return b.language==a.language&&b.mimeType==a.mimeType&&b.closedCaptions==a.closedCaptions&&b.embedded==a.embedded
},setCaptionsOverlayArea:function(b){var a=b.data;
if(a.width>0&&a.height>0){this.ve.setCaptionsOverlayArea(a)
}},setCaptionsMediaArea:function(b){var a=b.data;
if(a.height>0&&a.width>0){this.ve.setCaptionsMediaArea(a)
}},recalculateCaptionsContainer:function(){var a=this.controller.getMediaArea();
if(a.height>0&&a.width>0){this.ve.setCaptionsMediaArea(a)
}},showSelectedLanguage:function(){this.log("showSelectedLanguage: "+this.selectedTextTrackLanguage);
var a=this.getVideoEngineTextTrackToShow();
if(a){this.log("\tcalling removeVisibleOverlayCuePointsGwt then showCaptions");
this.controller.callFunction("removeVisibleOverlayCuePointsGwt");
this.ve.showCaptions(a)
}else{this.log("\tcalling hideCaptions");
this.ve.hideCaptions(false)
}},getVideoEngineTextTrackToShow:function(){var a=this.controller.callFunction("getTextTrackByLanguageGwt",[this.selectedTextTrackLanguage]);
return a&&this.isVideoEngineTextTrack(a)?a:null
},textTrackForLanguageIsOverlay:function(a){return !this.getVideoEngineTextTrackToShow(a)
},continueShowingOverlayTextTrack:function(a){return a&&this.textTrackForLanguageIsOverlay(a)
},wasShowingVideoEngineTextTrack:function(a){return a&&a!="none"
},nowShowingVideoEngineTextTrack:function(a){return a&&a.language
},iosFullscreenChange:function(b){this.log("fullscreenChange");
if(!b.data&&this.currentVETextTracks&&this.currentVETextTracks.length>0){this.log("NOT fullscreen and iOS, so update selected language if necessary");
var a=this.ve.getShowingCaptions();
if(this.nowShowingVideoEngineTextTrack(a)){this.controller.setSubtitleLanguage(a.language)
}else{if(this.continueShowingOverlayTextTrack(this.selectedTextTrackLanguage)){}else{if(this.wasShowingVideoEngineTextTrack(this.selectedTextTrackLanguage)){this.controller.setSubtitleLanguage("none")
}}}}},iosOnMediaLoadStart:function(a){this.log("iosOnMediaLoadStart: just show/hide on first clip");
if(this.isFirstClip(a.data)){this.showHideOnFirstClip(a.data)
}},iosOnMediaStart:function(b){this.log("iosOnMediaStart");
var a=b.data;
if(a.baseClip.isAd){this.log("Is ad, but doing nothing here for now. Should be hidden already.")
}else{this.hideCaptionsWhenPlaying(false);
if(this.lastSelectedTextTracks){this.log("not an ad and have last selected subtitles, so showing them");
this.ve.showCaptions(this.lastSelectedTextTracks);
this.lastSelectedTextTracks=undefined
}else{this.log("not an ad and no lastSelected, so nothing to do")
}}},iosOnMediaEnd:function(b){this.log("iosOnMediaEnd");
var a=b.data;
if(this.contentClipToAdClip(a)){this.log("next clip is ad, so hiding");
this.lastSelectedTextTracks=this.ve.getShowingCaptions();
this.ve.hideCaptions(false);
this.hideCaptionsWhenPlaying(true)
}else{this.log("next clip is NOT an ad, so doing nothing")
}},hideCaptionsWhenPlaying:function(a){if(a){this.controller.addEventListener("OnMediaPlaying",this.mediaPlayingHandler)
}else{this.controller.removeEventListener("OnMediaPlaying",this.mediaPlayingHandler)
}},isFirstClip:function(a){if(this._firstClipIsNext){this._firstClipIsNext=false;
return true
}else{return false
}},showHideOnFirstClip:function(e){this.log("showHideOnFirstClip");
var b=e.baseClip.isAd;
if(this.currentVESidecarTextTracks&&this.currentVESidecarTextTracks.length>0){var g;
for(var c=0;
c<this.currentVESidecarTextTracks.length;
c++){var d=this.currentVESidecarTextTracks[c];
if(d.show){g=d;
break
}}if(g&&!b){this.log("showingSidecarTextTracks and is not an ad, so show them");
this.ve.showCaptions(g)
}else{this.log("showingSidecarSubtitles: "+(g?g.language:"no showingSidecarSubtitles object")+", isAd:"+b);
var f=this.ve.getShowingCaptions();
if(f&&f.embedded){this.ve.showCaptions(f)
}else{this.ve.hideCaptions(false)
}if(b){this.log("storing lastSelectedTextTracks");
var a=g?g:f;
this.lastSelectedTextTracks=a;
this.hideCaptionsWhenPlaying(true)
}}}},contentClipToAdClip:function(c){var b=false;
if(!c.baseClip.isAd){var d=false;
for(var a=0;
a<this.playlist.clips.length;
a++){var e=this.playlist.clips[a];
if(d){if(e.baseClip.isAd){b=true
}else{this.log("next clip not an ad")
}break
}if(e.clipIndex==c.clipIndex&&e.URL==c.URL){d=true
}}}return b
},iosOnReleaseStart:function(d){this.log("iosOnReleaseStart");
this.playlist=d.data;
this._firstClipIsNext=true;
var a;
for(var b=0;
b<this.playlist.baseClips.length;
b++){var c=this.playlist.baseClips[b];
if(!c.isAd){a=c.availableTextTracks;
break
}}this.setCaptions(a);
if(!this.currentVETextTracks||this.currentVETextTracks.length<1){this.ve.hideCaptions(true)
}else{this.loadCaptions()
}},log:function(a){tpDebug("vesm: "+a)
}});
XMLLoader=Class.extend({init:function(a){this._requestContentType=a
},load:function(a,h,c){var g;
if(typeof XDomainRequest!=="undefined"&&a.indexOf(document.domain)<0){g=true
}if(typeof XMLHttpRequest==="undefined"){XMLHttpRequest=function(){try{return new ActiveXObject("Msxml2.XMLHTTP.6.0")
}catch(j){}try{return new ActiveXObject("Msxml2.XMLHTTP.3.0")
}catch(j){}try{return new ActiveXObject("Msxml2.XMLHTTP")
}catch(j){}throw new Error("This browser does not support XMLHttpRequest.")
}
}var i;
if(g){i=new XDomainRequest();
if(typeof(f._requestContentType)==="string"){i.setRequestHeader("Content-Type",this._requestContentType)
}}else{i=new XMLHttpRequest()
}var f=this;
var d=false;
var e=function(j){d=true;
tpDebug("Error getting SMIL");
c(j)
};
var b=function(){if(this.readyState===4&&this.status===200&&!d){d=true;
var j=i.responseXML;
if(j==null||typeof(j)!=="string"){j=i.responseText
}if(typeof(h)==="function"){h(j)
}}else{if(this.readyState===4&&this.status===404&&!d){d=true;
e()
}else{if(g&&!d){d=true;
if(typeof(h)==="function"){tpDebug("Got SMIL");
h(i.responseText);
tpDebug("Called SMIL callback")
}}}}};
i.onreadystatechange=b;
i.onload=b;
i.onerror=e;
i.ontimeout=e;
setTimeout(function(){try{tpDebug("Trying to download SMIL from "+a);
i.open("GET",a);
i.send();
setTimeout(function(){if(!d){if(typeof(c)==="function"){c()
}}},5000)
}catch(j){tpDebug(j.message);
if(typeof(c)==="function"){c(j)
}}},1)
}});
if(window.tpPhase1PDKLoaded){if(window.tpDoInitGwtCommManager){tpDoInitGwtCommManager()
}tpTimeEnd("Time for Phase1 JS to load/execute");
tpTimeEnd("Time from page load until tpPhase1PDKLoaded");
tpPhase1PDKLoaded()
};