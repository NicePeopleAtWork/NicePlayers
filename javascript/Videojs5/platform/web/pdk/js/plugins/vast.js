$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.VASTParser=$pdk.extend(function(){},{constructor:function(){if($pdk.plugin.vast.VASTParser._instance){this.parse=null;
this.parseVast=null;
throw"$pdk.plugin.vast.VASTParser is a Singlton. Access via getInstance()"
}$pdk.plugin.vast.VASTParser._instance=this;
tpDebug("VastPlugin instantiated.","","VAST")
},parse:function(a){var b;
if(a instanceof window.Document){tpRemoveWhiteSpace(a);
b=a
}else{if(a.xml){b=tpParseXml(a.xml)
}else{b=tpParseXml(a)
}}return this.parseVast(b.childNodes[0].childNodes)
},parseVast:function(b){var a={};
var d;
a.ads=[];
for(var c=0;
c<b.length;
c++){if(b[c] instanceof Element){d=this.parseAd(b[c]);
if(d){a.ads.push(d)
}}}if(a.ads.length>0){return a
}else{return null
}},parseUrls:function(a){if(a&&a.childNodes){var c=[];
for(var b=0;
b<a.childNodes.length;
b++){c.push(this.parseUrl(a.childNodes[b]))
}return c
}return null
},parseUrl:function(b){var a={};
a.url=this.parseSimpleUrl(b);
if(b.attributes&&b.attributes.id){a.id=b.attributes.id.nodeValue
}else{a.id=null
}return a
},parseSimpleUrl:function(a){if(a&&a.nodeValue){return a.nodeValue.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{if(a&&a.childNodes&&a.childNodes[0]&&a.childNodes[0].nodeValue){return a.childNodes[0].nodeValue.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{if(a&&a.childNodes&&a.childNodes[0]&&a.childNodes[0].textContent){return a.childNodes[0].textContent.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{return null
}}}},parseAd:function(b){var d=b.childNodes[0];
var a;
if(!(d instanceof Element)){return null
}if(d.tagName=="InLine"){a=this.parseInLine(d);
if(b.attributes.sequence){a.sequence=parseInt(b.attributes.sequence.nodeValue,10)
}if(!a){return null
}a.adType="InLine";
return a
}else{if(d.tagName=="Wrapper"){a={};
a.id=b.attributes.getNamedItem("id").nodeValue;
var f=d.getElementsByTagName("AdSystem")[0];
if(f){a.adSystem=f.childNodes.nodeValue
}a.error=this.parseSimpleUrl(d.getElementsByTagName("Error")[0]);
a.extensions=d.getElementsByTagName("Extensions")[0];
try{a.impressions=this.parseImpressions(d.getElementsByTagName("Impression"))
}catch(c){console.error(c)
}a.trackingEvents=this.parseTrackingEvents(d.getElementsByTagName("TrackingEvents")[0]);
a.adType="Wrapper";
return this.parseWrapper(d,a)
}else{throw new Error("Unrecognized ad type: "+d.tagName)
}}return null
},parseImpressions:function(d){if(!d){return null
}var b=[];
var a=d.length;
var c=0;
for(;
c<a;
c++){b=b.concat(this.parseUrls(d[c]))
}return b
},parseTrackingEvents:function(b){if(b&&b.childNodes){var a=[];
for(var c=0;
c<b.childNodes.length;
c++){a.push(this.parseTrackingEvent(b.childNodes[c]))
}return a
}return null
},parseTrackingEvent:function(b){var a={};
if(b.attributes.event){a.event=b.attributes.event.nodeValue
}a.urls=this.parseUrls(b);
return a
},parseWrapper:function(b,c){var a=c?c:{};
a.vastAdTagURL=this.parseSimpleUrl(b.getElementsByTagName("VASTAdTagURI")[0]);
a.videoClicks=this.parseVideoClicks(b.getElementsByTagName("VideoClicks")[0]);
return a
},parseInLine:function(b){var c={};
if(b.attributes.id){c.id=b.attributes.id.nodeValue
}c.adSystem=b.getElementsByTagName("AdSystem")[0].childNodes[0].nodeValue;
c.error=this.parseSimpleUrl(b.getElementsByTagName("Error")[0]);
c.extensions=b.getElementsByTagName("Extensions")[0];
try{c.impressions=this.parseImpressions(b.getElementsByTagName("Impression"))
}catch(d){console.error(d)
}var a=this.parseCreatives(b,c);
return a
},parseCreatives:function(e,h){var j=h;
if(e.getElementsByTagName("AdTitle")[0]&&e.getElementsByTagName("AdTitle")[0].childNodes[0]){j.adTitle=e.getElementsByTagName("AdTitle")[0].childNodes[0].nodeValue
}if(e.getElementsByTagName("Description")[0]&&e.getElementsByTagName("Description")[0].childNodes[0]){j.description=e.getElementsByTagName("Description")[0].childNodes[0].nodeValue
}var g=e.getElementsByTagName("Creatives")[0];
if(!g){return null
}for(var c=0;
c<g.childNodes.length;
c++){var f=g.childNodes[c];
if(f.getElementsByTagName("CompanionAds").length>0){var a=f.getElementsByTagName("CompanionAds")[0];
if(a){j.companionAds=this.parseCompanionAds(a)
}}if(f.getElementsByTagName("Linear")[0]){var d=f.getElementsByTagName("Linear")[0];
if(d){j.video=this.parseVideo(d)
}}if(f.getElementsByTagName("NonLinearAds").length>0){var b=f.getElementsByTagName("NonLinearAds")[0];
if(b){j.nonLinearAds=this.parseNonLinearAds(b)
}}}if(!j.video){j.video={}
}return j
},parseCompanionAds:function(b){if(b&&b.childNodes){var a=[];
for(var c=0;
c<b.childNodes.length;
c++){a.push(this.parseCompanion(b.childNodes[c]))
}return a
}return null
},parseCompanion:function(b){var a={};
if(b.getElementsByTagName("AltText")[0]&&b.getElementsByTagName("AltText")[0].childNodes[0]){a.altText=b.getElementsByTagName("AltText")[0].childNodes[0].nodeValue
}if(b.getElementsByTagName("adParameters")[0]){a.adParameters=this.parseAdParameters(b.getElementsByTagName("AdParameters")[0])
}if(b.getElementsByTagName("Code")[0]&&b.getElementsByTagName("Code")[0].childNodes[0]){a.code=b.getElementsByTagName("Code")[0].childNodes[0].nodeValue
}if(b.getElementsByTagName("CompanionClickThrough")[0]){a.companionClickThrough=this.parseSimpleUrl(b.getElementsByTagName("CompanionClickThrough")[0])
}if(b.attributes.creativeType){a.creativeType=b.attributes.creativeType.nodeValue
}if(b.attributes.expandedHeight){a.expandedHeight=b.attributes.expandedHeight.nodeValue
}if(b.attributes.expandedWidth){a.expandedWidth=b.attributes.expandedWidth.nodeValue
}if(b.attributes.height){a.height=b.attributes.height.nodeValue
}if(b.attributes.id){a.id=b.attributes.id.nodeValue
}if(b.attributes.resourceType){a.resourceType=b.attributes.resourceType.nodeValue
}if(b.getElementsByTagName("StaticResource")[0]){a.staticResource=this.parseSimpleUrl(b.getElementsByTagName("StaticResource")[0])
}if(b.getElementsByTagName("IFrameResource")[0]){a.iFrameResource=this.parseSimpleUrl(b.getElementsByTagName("IFrameResource")[0])
}if(b.getElementsByTagName("HTMLResource")[0]){a.HTMLResource=b.getElementsByTagName("HTMLResource")[0]
}if(b.attributes.width){a.width=b.attributes.width.nodeValue
}return a
},parseVideo:function(b){var a={};
if(b.getElementsByTagName("Duration")[0]){a.duration=tpTimeToMillis(b.getElementsByTagName("Duration")[0].childNodes[0].nodeValue)
}if(b.getElementsByTagName("AdID")[0]){a.adId=b.getElementsByTagName("AdID")[0].childNodes[0].nodeValue
}if(b.getElementsByTagName("AdParameters")[0]){a.adParameters=this.parseAdParameters(b.getElementsByTagName("AdParameters")[0])
}if(b.getElementsByTagName("VideoClicks")[0]){a.videoClicks=this.parseVideoClicks(b.getElementsByTagName("VideoClicks")[0])
}if(b.getElementsByTagName("MediaFiles")[0]){a.mediaFiles=this.parseMediaFiles(b.getElementsByTagName("MediaFiles")[0])
}if(b.getElementsByTagName("TrackingEvents")[0]){a.trackingEvents=this.parseTrackingEvents(b.getElementsByTagName("TrackingEvents")[0])
}if(b.attributes.skipoffset){var d=b.attributes.skipoffset.nodeValue;
if(d.indexOf(":")>0){var c=d.split(":");
a.skipOffset=(c[0]*60*60)+(c[1]*60)+(c[2])
}else{if(d.indexOf("%")>0){if(a.duration){a.skipOffset=Math.round((a.duration/1000)*(parseInt(d,10)*0.01))
}}else{a.skipOffset=parseInt(d,10)
}}}return a
},parseAdParameters:function(b){if(b){try{var a={};
a.apiFramework=b.attributes.apiFramework;
a.parameters=b.childNodes[0].nodeValue;
return a
}catch(c){}}return null
},parseVideoClicks:function(b){if(b){var a={};
a.clickThrough=this.parseUrls(b.getElementsByTagName("ClickThrough")[0]);
a.clickTracking=this.parseUrls(b.getElementsByTagName("ClickTracking")[0]);
if(b.getElementsByTagName("CustomClick").length>0){a.customClick=this.parseUrls(b.getElementsByTagName("CustomClick")[0])
}return a
}return null
},parseMediaFiles:function(b){if(b&&b.childNodes){var a=[];
for(var c=0;
c<b.childNodes.length;
c++){a.push(this.parseMediaFile(b.childNodes[c]))
}return a
}return null
},parseMediaFile:function(b){var a={};
if(b.attributes.bitrate){a.bitrate=b.attributes.bitrate.nodeValue*1000
}a.delivery=(b.attributes.delivery?b.attributes.delivery.nodeValue:null);
if(b.attributes.height){a.height=b.attributes.height.nodeValue
}if(b.attributes.id){a.id=b.attributes.id.nodeValue
}if(b.attributes.type){a.type=b.attributes.type.nodeValue
}a.url=this.parseSimpleUrl(b);
if(b.attributes.width){a.width=b.attributes.width.nodeValue
}return a
},parseNonLinearAds:function(c){if(c&&c.childNodes){var b;
if(c.getElementsByTagName("TrackingEvents")){b=this.parseTrackingEvents(c.getElementsByTagName("TrackingEvents")[0])
}var a=[];
var e=c.getElementsByTagName("NonLinear");
for(var d=0;
d<e.length;
d++){a.push(this.parseNonLinear(e[d],b));
b=null
}return a
}return null
},parseNonLinear:function(c,b){var a={};
if(c.attributes.apiFramework){a.apiFramework=c.attributes.apiFramework.nodeValue
}if(c.attributes.expandedHeight){a.expandedHeight=c.attributes.expandedHeight.nodeValue
}if(c.attributes.expandedWidth){a.expandedWidth=c.attributes.expandedWidth.nodeValue
}if(c.attributes.height){a.height=c.attributes.height.nodeValue
}if(c.attributes.id){a.id=c.attributes.id.nodeValue
}if(c.attributes.maintainAspectRatio){a.maintainAspectRatio=c.attributes.maintainAspectRatio.nodeValue
}a.nonLinearClickThrough=this.parseSimpleUrl(c.getElementsByTagName("NonLinearClickThrough")[0]);
a.adParameters=this.parseAdParameters(c.getElementsByTagName("AdParameters")[0]);
if(c.attributes.resourceType){a.resourceType=c.attributes.resourceType.nodeValue
}if(c.attributes.scalable){a.scalable=c.attributes.scalable.nodeValue
}if(c.getElementsByTagName("StaticResource")[0]){a.staticResource=this.parseSimpleUrl(c.getElementsByTagName("StaticResource")[0])
}if(c.getElementsByTagName("IFrameResource")[0]){a.iFrameResource=this.parseSimpleUrl(c.getElementsByTagName("IFrameResource")[0])
}if(c.getElementsByTagName("HTMLResource")[0]){a.HTMLResource=c.getElementsByTagName("HTMLResource")[0]
}if(c.attributes.width){a.width=c.attributes.width.nodeValue
}if(b){a.trackingEvents=b
}return a
}});
$pdk.plugin.vast.VASTParser.getInstance=function(){if(!$pdk.plugin.vast.VASTParser._instance){$pdk.plugin.vast.VASTParser._instance=new $pdk.plugin.vast.VASTParser()
}return $pdk.plugin.vast.VASTParser._instance
};
$pdk.plugin.vast.VASTParser.getInstance();
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.AdTracking=$pdk.extend(function(){},{TRIGGER_TYPE_PERCENTAGE:0,TRIGGER_TYPE_MILLISECONDS:1,TRIGGER_TYPE_EVENT:2,EVENT_MUTE:0,EVENT_PAUSE:1,EVENT_REPLAY:2,EVENT_FULL_SCREEN:3,EVENT_STOP:4,EVENT_START:5,EVENT_UNPAUSE:6,EVENT_CLOSE:7,EVENT_UNMUTE:8,EVENT_ACCEPTINVITATION:9,constructor:function(){},getTrackingUrl:function(c){var b=c.event;
var a=c.urls[0].url;
switch(b.toLowerCase()){case"start":return this.setTracking(a,this.TRIGGER_TYPE_PERCENTAGE,0);
case"firstquartile":return this.setTracking(a,this.TRIGGER_TYPE_PERCENTAGE,25);
case"midpoint":return this.setTracking(a,this.TRIGGER_TYPE_PERCENTAGE,50);
case"thirdquartile":return this.setTracking(a,this.TRIGGER_TYPE_PERCENTAGE,75);
case"mute":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_MUTE);
case"unmute":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_UNMUTE);
case"pause":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_PAUSE);
case"unpause":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_UNPAUSE);
case"replay":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_REPLAY);
case"stop":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_STOP);
case"resume":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_UNPAUSE);
case"close":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_CLOSE);
case"complete":return this.setTracking(a,this.TRIGGER_TYPE_PERCENTAGE,100);
case"acceptinvitation":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_ACCEPTINVITATION);
case"expand":case"fullscreen":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_FULL_SCREEN);
default:return null
}},setTracking:function(b,c,d){var a={};
a.triggerType=c;
a.triggerValue=d;
a.URL=b;
a.hasFired=false;
a.globalDataType="com.theplatform.pdk.data::TrackingUrl";
return a
},sendTrackingUrl:function(a){if(a.indexOf("ord=")===-1){var b=100000+Math.floor(Math.random()*900001);
a+=(a.indexOf("?")===-1?"?":"&");
a+="ord="+b
}a+=(a.indexOf("?")===-1?"?":"&");
a+="source=vastplugin"
}});
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.OverlayManager=$pdk.extend(function(){},{constructor:function(b,d,a){var c=this;
this.controller=b;
this.adTracking=d;
this.overlayLayer=a;
this.controller.addEventListener("OnOverlayAreaChanged",function(f){c.layout()
});
this.divs={};
this.a={}
},showOverlay:function(d){if(!this.overlays){this.overlays=[]
}var b=document.createElement("div");
if(d.guid){b.id="tpVastPlugInoverlay"+d.guid
}var f=document.createElement("a");
var c=document.createElement("img");
this.divs[d]=b;
this.a[d]=f;
if(d.url){c.src=d.url
}if(d.stretchToFit&&!d.maintainAspectRatio){c.style.height="100%";
c.style.width="100%"
}else{if(d.stretchToFit&&d.bannerHeight>d.bannerWidth){c.style.height="100%"
}else{if(d.stretchToFit){c.style.width="100%"
}}}b.style.position="absolute";
b.style["text-align"]="center";
var g=this;
f.href=d.href;
f.target="_blank";
f.style.position="relative";
f.appendChild(c);
b.appendChild(f);
if(d.impressionUrls){var a=d.impressionUrls.length;
var e=0;
for(;
e<a;
e++){this.adTracking.sendTrackingUrl(d.impressionUrls[e])
}}this.doLayout(d,b,f);
this.overlays.push(d);
this.overlayLayer.appendChild(b);
var h=document.createElement("canvas");
if(h&&h.getContext&&h.getContext("2d")){h.width=15;
h.height=15;
h.style.position="absolute";
h.style.top="0";
h.style.right="0";
f.onclick=function(i){if(i.target!=h){g.controller.pause(true)
}};
h.onclick=function(){g.removeOverlay(d);
return false
};
this.drawCloseButton(h,"#"+this.controller.getProperty("controlframecolor").substr(2),"#"+this.controller.getProperty("controlbackgroundcolor").substr(2),"#"+this.controller.getProperty("controlcolor").substr(2));
f.appendChild(h)
}},layout:function(){if(this.overlays){for(var a=0;
a<this.overlays.length;
a++){this.doLayout(this.overlays[a],this.divs[this.overlays[a]],this.a[this.overlays[a]])
}}},doLayout:function(b,a,c){if(b.bannerHeight){a.style.height=b.bannerHeight+"px";
c.style.height=b.bannerHeight+"px";
c.style.display="block"
}if(b.bannerWidth){a.style.width=b.bannerWidth+"px";
c.style.width=b.bannerWidth+"px"
}c.style.marginLeft="auto";
c.style.marginRight="auto";
a.style.width="100%";
var d=this.controller.getOverlayArea();
a.style.top=((d.height-b.bannerHeight))+"px"
},drawCloseButton:function(c,e,d,b){var a=c.getContext("2d");
a.clearRect(0,0,15,15);
a.fillStyle=d;
a.strokeStyle=e;
a.fillRect(0,0,15,15);
a.strokeStyle=e;
a.moveTo(0,0);
a.lineTo(15,0);
a.lineTo(15,15);
a.lineTo(0,15);
a.lineTo(0,0);
a.stroke();
a.strokeStyle=b;
a.lineWidth=3;
a.moveTo(4,4);
a.lineTo(11,11);
a.moveTo(4,11);
a.lineTo(11,4);
a.stroke()
},removeOverlay:function(b){var a;
if(b.id){a=document.getElementById(b.id)
}else{a=document.getElementById("tpVastPlugInoverlay"+b.guid)
}if(a){this.overlayLayer.removeChild(a)
}for(var c=0;
this.overlays&&c<this.overlays.length;
c++){if(this.overlays[c]==b){this.overlays.splice(c,1);
break
}}},removeAllOverlays:function(){this.overlays=undefined;
this.overlayLayer.innerHTML=""
}});
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.VASTPlugIn=$pdk.extend(function(){},{nextPercentage:null,_enablePods:false,VPAID_FLASH_MIMETYPE:"application/x-shockwave-flash",VPAID_JS_MIMETYPE:"application/javascript",mimeTypeTable:{f4m:"application/f4m+xml",m3u:"application/x-mpegURL",mpeg4:"video/mp4","mpeg-dash":"application/dash+xml",flv:"video/x-flv",qt:"video/quicktime",js:this.VPAID_JS_MIMETYPE,swf:this.VPAID_FLASH_MIMETYPE},skipOffsets:{},defaultTypes:["video/mp4"],adTracking:new $pdk.plugin.vast.AdTracking(),overlayManager:null,constructor:function(){this.container=document.createElement("div");
this.container.style.display="";
this.container.style.width="100%";
this.overlayLayer=document.createElement("div");
this.overlayLayer.id="overlaylayer";
this.overlayLayer.style.height="100%";
this.overlayLayer.style.width="100%";
this.overlayLayer.style.position="relative";
this.overlayLayer.style.display="";
this.container.appendChild(this.overlayLayer)
},onEnded:function(a){this.done()
},initialize:function(f){var g=this;
this.controller=f.controller;
this.controller.registerAdPlugIn(this);
this.priority=f.priority;
this.hasFlash=this.controller.component.videoengineruntime==="flash";
this.overlayManager=new $pdk.plugin.vast.OverlayManager(this.controller,this.adTracking,this.overlayLayer);
var k=f.vars.enableVPAID!=="false";
this.enableVPAID=k;
var e=f.vars.hosts;
if(e&&e.length){this.hosts=e.split(",")
}this.mimeTypes=[];
if(this.controller.getProperty("formats")){var j=this.controller.getProperty("formats").split(",");
var h;
for(var c=0;
c<j.length;
c++){h=this.mimeTypeTable[j[c].toLowerCase()];
if(h){this.mimeTypes.push(h)
}}for(c=0;
c<this.defaultTypes.length;
c++){if(this.mimeTypes.indexOf(this.defaultTypes[c])==-1){this.mimeTypes.push(this.defaultTypes[c])
}}}else{this.mimeTypes=this.defaultTypes.concat()
}var a=f.vars.mimeType;
if(a){this.mimeTypes.push(a)
}else{a=f.vars.mimeTypes;
if(a){this.mimeTypes=this.mimeTypes.concat(a.split(","))
}}if(this.enableVPAID&&this.hasFlash&&this.mimeTypes.indexOf(this.VPAID_FLASH_MIMETYPE)<0){this.mimeTypes.unshift(this.VPAID_FLASH_MIMETYPE)
}else{if(this.enableVPAID&&this.mimeTypes.indexOf(this.VPAID_JS_MIMETYPE)<0){this.mimeTypes.unshift(this.VPAID_JS_MIMETYPE)
}}var d=f.vars.enablePods;
if(d&&d.toLowerCase()==="true"){this._enablePods=true
}var b=f.vars.allowClicks;
if(b&&b.toLowerCase()==="false"){this.allowClicks=false
}else{this.allowClicks=true
}this.controller.addEventListener("OnMediaLoadStart",function(i){g.currentClip=i.data;
g.nextPercentage=null
});
this.controller.addEventListener("OnMediaEnd",function(i){g.onEnded(i);
g.currentClip=null
});
this.controller.addEventListener("OnMediaStart",function(i){g.onMediaStart.apply(g,[i])
});
this.controller.addEventListener("OnMediaPlaying",function(i){if(g.skipOffsets[g.currentPlaylistClip]&&!isNaN(g.skipOffsets[g.currentPlaylistClip])){if(i.data.currentTime>g.skipOffsets[g.currentPlaylistClip]){g.originalClip.baseClip.noSkip=false;
g.controller.updateClip(g.originalClip)
}}});
this.controller.addEventListener("OnMediaEnd",function(i){g.onMediaEnd.apply(g,[i])
});
this.controller.addEventListener("OnReleaseStart",function(i){g.onReleaseStart.apply(g,[i])
});
this.controller.addEventListener("OnReleaseEnd",function(i){g.onReleaseEnd.apply(g,[i])
});
this.controller.addEventListener("OnSetRelease",function(i){g.onReleaseEnd.apply(g,[i])
});
this.controller.addEventListener("OnSetReleaseUrl",function(i){g.onReleaseEnd.apply(g,[i])
});
this.controller.addEventListener("OnLoadReleaseUrl",function(i){g.onReleaseEnd.apply(g,[i])
});
this.controller.addEventListener("OnSetRelease",function(i){g.onReleaseEnd.apply(g,[i])
});
this.controller.addEventListener("OnSetReleaseUrl",function(i){g.onReleaseEnd.apply(g,[i])
});
this.controller.addEventListener("OnLoadReleaseUrl",function(i){g.onReleaseEnd.apply(g,[i])
});
tpDebug("*** VAST plugin LOADED! ***")
},destroy:function(){},onMediaStart:function(f){var d=f.data;
if(!d.baseClip.isAd&&this.currentOverlays){for(var b=0;
b<this.currentOverlays.length;
b++){var a=this.currentOverlays[b];
this.overlayManager.showOverlay(a);
var c=this;
setTimeout(function(){c.overlayManager.removeOverlay(a)
},10000)
}}else{if(d.baseClip.isAd){this.currentPlaylistClip=d
}}},onMediaEnd:function(b){var a=b.data;
if(!a.baseClip.isAd){this.currentOverlays=[];
this.overlayManager.removeAllOverlays()
}},onReleaseStart:function(a){this.currentPlaylist=a.data
},onReleaseEnd:function(a){this.overlayLayer.innerHTML="";
this.currentOverlays=[]
},isAd:function(a){return(this.isVastUrl(a.URL)||this.isVastUrl(a.baseURL))
},checkAd:function(b){var a=(!b.mediaLength||b.mediaLength<=0)&&(this.isVastUrl(b.baseClip.URL)||b.baseClip.type=="application/vast+xml");
if(a){if(!b.baseClip.type||b.baseClip.type&&(b.baseClip.type.toLowerCase()==="application/xml"||b.baseClip.type.toLowerCase()==="application/vast+xml"||b.baseClip.type.toLowerCase()==="text/xml")){this.currentClip=b;
this.originalClip=b;
this.parentWrappers=[];
this.loadAdXML(this.doUrlSubstitutions(b.baseClip.URL))
}else{return false
}return true
}else{if(b.baseClip.type==this.VPAID_FLASH_MIMETYPE||b.baseClip.type==this.VPAID_JS_MIMETYPE){this._vpaidPlayer=$pdk.plugin.vpaid.player.VPAIDPlayer.getInstance(this.controller,this.overlayLayer);
this._vpaidPlayer.initVPAIDAd(b);
return true
}}return false
},doUrlSubstitutions:function(a){var b=document.location.href;
if($pdk.parentUrl){b=$pdk.parentUrl
}a=a.replace(/\[timestamp\]/gi,(new Date()).getTime());
a=a.replace(/\[page_url\]/gi,escape(b));
return a
},loadAdXML:function(b){this.xmlHandled=false;
tpDebug("Trying to load VAST XML From url:"+b);
var c;
if(typeof XDomainRequest!=="undefined"&&b.indexOf(document.domain)<0){c=true
}if(typeof XMLHttpRequest==="undefined"){XMLHttpRequest=function(){try{return new ActiveXObject("Msxml2.XMLHTTP.6.0")
}catch(j){}try{return new ActiveXObject("Msxml2.XMLHTTP.3.0")
}catch(i){}try{return new ActiveXObject("Msxml2.XMLHTTP")
}catch(e){}throw new Error("This browser does not support XMLHttpRequest.")
}
}var h;
if(c){h=new XDomainRequest()
}else{h=new XMLHttpRequest()
}var d=this;
var a=function(){d.currentClip=null;
d.vastError()
};
var g=function(){var j,i;
if(this.readyState===4&&this.status===200&&!d.xmlHandled){d.xmlHandled=true;
j=h.responseXML;
if(!j){j=h.responseText
}try{var m=$pdk.plugin.vast.VASTParser.getInstance();
i=m.parse(j);
d.processVast(i)
}catch(k){tpDebug("Error parsing Vast XML: "+j,"Vast",tpConsts.WARN);
a();
if(tpLogLevel=="debug"){throw k
}}}else{if(this.readyState===4&&this.status===404&&!d.xmlHandled){d.xmlHandled=true;
a()
}else{if(c&&!d.xmlHandled){d.xmlHandled=true;
try{i=$pdk.plugin.vast.VASTParser.getInstance().parse(h.responseText);
d.processVast(i)
}catch(l){tpDebug("Error parsing Vast XML: "+h.responseText,"Vast",tpConsts.WARN);
a();
if(tpLogLevel=="debug"){throw l
}}}}}};
if($pdk.isIE){h.onload=g
}else{h.onreadystatechange=g
}h.onerror=function(){tpDebug("Error loading Vast XML from url:"+b,d.controller.id,"Vast",tpConsts.WARN);
d.xmlHandled=true;
a()
};
try{h.open("GET",b);
h.send(null);
setTimeout(function(){if(!d.xmlHandled){d.xmlHandled=true;
a()
}},5000)
}catch(f){tpDebug(f.message,this.controller.id,"VAST");
this.vastError()
}},processCompanions:function(g,h){if(!(g&&g.length)){return
}if(!h.banners){h.banners=[]
}tpDebug("adding companions",this.controller.id,"VAST");
var n,a,b,k,j,c,o,m,l,f,d;
for(var e=0;
e<g.length;
e++){if(g[e].staticResource){if(g[e].staticResource){a=g[e].staticResource
}else{if(ads[e].iFrameResource){a=g[e].iFrameResource
}}b=g[e].companionClickThrough;
j="_blank";
c=parseInt(g[e].width,10);
o=parseInt(g[e].height,10);
if(g[e].creativeType){d=g[e].creativeType
}if(g[e].altText){f=g[e].altText
}m=g[e].id;
l=g[e].id;
n={globalDataType:"com.theplatform.pdk.data::Banner",guid:l,region:m,src:a,href:b,target:j,alt:f,bannerType:d,bannerWidth:c,bannerHeight:o,bannerSize:(c*o)};
h.banners.push(n)
}}},processImpressions:function(c,b){if(b&&c&&c.length){if(!b.impressionUrls){b.impressionUrls=[]
}for(var a=0;
a<c.length;
a++){if(c[a].url){b.impressionUrls.push(c[a].url)
}}}},processMediaTrackingEvents:function(f,g){tpDebug("adding Tracking URLs",this.controller.id,"VAST");
if(!(f.trackingEvents&&f.trackingEvents.length)){return
}if(!g.trackingURLs){g.trackingURLs=[]
}for(var e=0;
e<f.trackingEvents.length;
e++){if(f.trackingEvents[e].event=="creativeView"){if(f.trackingEvents[e].urls){if(!g.impressionUrls){g.impressionUrls=[]
}var b=f.trackingEvents[e].urls.length;
var d=0;
for(;
d<b;
d++){var c=f.trackingEvents[e].urls[d];
if(c){g.impressionUrls.push(c.url)
}}}}var a=this.adTracking.getTrackingUrl(f.trackingEvents[e]);
if(a){g.trackingURLs.push(a)
}else{tpDebug("TrackingEvent "+f.trackingEvents[e].event+" not supported. Ignoring.",this.controller.id,"VAST")
}}},processVideoClicks:function(d,e){var c=d.videoClicks;
if(c){if(!e.moreInfo){e.moreInfo={globalDataType:"com.theplatform.pdk.data::HyperLink"};
e.moreInfo.clickTrackingUrls=[]
}if(this.allowClicks&&c.clickThrough&&c.clickThrough.length>0){e.moreInfo.href=c.clickThrough[0].url
}else{e.moreInfo.href=null
}if(this.allowClicks&&c.clickTracking){var b=0;
var a=c.clickTracking.length;
for(;
b<a;
b++){e.moreInfo.clickTrackingUrls.push(c.clickTracking[b].url)
}}}},_playlist:null,processMediaFiles:function(d,l,a,o){var p=null;
var m={};
var h,g;
var c;
for(h=0;
h<this.parentWrappers.length;
h++){c=this.parentWrappers[h];
this.processMediaTrackingEvents(c,m);
this.processVideoClicks(c,m);
this.processImpressions(c.impressions,m)
}if(d&&d.mediaFiles&&d.mediaFiles.length){m.releaseLength=d.duration;
if(d.mediaFiles&&d.mediaFiles.length){tpDebug("looping through MediaFiles");
var f=true;
var k;
if(this.mimeTypes&&this.mimeTypes.length){for(h=0;
h<this.mimeTypes.length;
h++){for(g=0;
g<d.mediaFiles.length;
g++){k=d.mediaFiles[g];
if(k&&this.isAllowedVideo(k)&&k.type==this.mimeTypes[h]){this.addVideoToBaseClip(k,m,f);
tpDebug("mediaFile["+g+"]: "+k.url);
f=false
}}}}else{for(h=0;
h<d.mediaFiles.length;
h++){k=d.mediaFiles[h];
if(k&&this.isAllowedVideo(k)){this.addVideoToBaseClip(k,m,f);
tpDebug("mediaFile["+g+"]: "+k.url);
f=false
}}}}}if(m.URL){if(d.adParameters){if(typeof d.adParameters.parameters!="string"){m.trackingData=JSON.stringify(d.adParameters.parameters).replace(/\\n/g,"\n").replace(/\\"/g,'"')
}else{m.trackingData=d.adParameters.parameters
}}this.processImpressions(o,m);
this.processMediaTrackingEvents(d,m);
this.processVideoClicks(d,m);
this.processCompanions(l,m);
var e=com.theplatform.pdk.SelectorExported.getInstance(this.controller.scopes.toString()).parseClip(m);
e.baseClip=m;
this._playlist.clips.push(e);
this._playlist.baseClips.push(m);
if(d.skipOffset){this.skipOffsets[e]=1000*Number(d.skipOffset)
}e.chapter={globalDataType:this.controller.getDataTypeName("Chapter")};
e.chapter.index=this._playlist.clips.length-1;
e.chapter.startTime=0;
e.chapter.endTime=d.duration;
e.chapter.length=d.duration;
e.chapter.aggregateLength=d.duration;
e.chapter.globalDataType="com.theplatform.pdk.data::Chapter";
e.title=this.currentTitle;
if(this._playlist.clips.length>1){var b=this._playlist.clips[this._playlist.clips.length-2];
e.chapter.aggregateStartTime=b.chapter.aggregateStartTime+b.chapter.endTime;
e.chapter.chapters=b.chapter.chapters;
e.chapter.chapters.isAggregate=true
}else{e.chapter.chapters={globalDataType:this.controller.getDataTypeName("ChapterList"),chapters:[],aggregateStartTime:0,aggregateLength:0};
e.chapter.aggregateStartTime=0
}e.chapter.chapters.chapters.push(e.chapter);
e.chapter.chapters.aggregateLength+=d.duration;
e.chapter.endTime=e.chapter.startTime+d.duration
}else{this.processCompanions(l,m);
var n=false;
if(this.currentPlaylist&&this.currentPlaylist.clips&&this.currentPlaylist.clips.length){for(h=0;
h<this.currentPlaylist.clips.length;
h++){if(this.currentPlaylist.clips[h].URL==this.currentClip.URL&&this.currentPlaylist.clips[h].clipIndex==this.currentClip.clipIndex){n=true;
continue
}else{if(n&&!this.currentPlaylist.clips[h].baseClip.isAd){if(!this.currentPlaylist.clips[h].baseClip.banners){this.currentPlaylist.clips[h].baseClip.banners=[]
}this.currentPlaylist.clips[h].baseClip.banners=this.currentPlaylist.clips[h].baseClip.banners.concat(m.banners);
this.controller.updateClip(this.currentPlaylist.clips[h]);
break
}}}}}},isAllowedVideo:function(a){if(!a.url||a.url.length===0){return false
}if(this.mimeTypes.length===0){return true
}for(var b=0;
b<this.mimeTypes.length;
b++){if(this.mimeTypes[b]==a.type){return true
}}return false
},addVideoToBaseClip:function(a,d,c){var b={};
b.globalDataType="com.theplatform.pdk.data::FileInfo";
b.URL=a.url;
b.bitrate=a.bitrate;
b.width=a.width;
b.height=a.height;
b.type=a.type;
if(!d.possibleFiles){d.possibleFiles=[]
}d.possibleFiles.push(b);
if(c){d.defaultFI=b;
d.isAd=true;
d.noSkip=this.currentClip&&this.currentClip.baseClip?this.currentClip.baseClip.noSkip:true;
d.streamType="flashVideoUnknownMP4";
d.URL=a.url;
d.description=this.currentDescription;
d.type=a.type;
d.globalDataType="com.theplatform.pdk.data::BaseClip"
}},processAd:function(a){if(!a){this.currentClip=null;
return
}if(a.adType=="InLine"){this.processInline(a)
}else{if(a.adType=="Wrapper"){this.processWrapperAdEvent(a);
this.loadAdXML(a.vastAdTagURL)
}}},processWrapperAdEvent:function(a){tpDebug("Processing wrapper tracking events");
this.parentWrappers.push(a)
},processInline:function(f){var e=this;
if(f.adTitle){this.currentTitle=f.adTitle
}if(f.description){this.currentDescription=f.description
}var d=f.video;
var a=f.companionAds;
var g=f.impressions;
var c;
if(!f.impressions){f.impressions=[]
}var h;
for(var b=0;
b<this.parentWrappers.length;
b++){h=this.parentWrappers[b];
f.impressions=f.impressions.concat(h.impressions)
}this.showCompanions(a);
this.addOverlays(f);
if(d){this.processMediaFiles(d,a,c,g)
}else{this.vastError()
}},processVast:function(b){if(!b||!b.ads||b.ads.length===0){tpDebug("No ads found",this.controller.id,"VAST");
this.vastError();
return
}this._playlist={};
this._playlist.baseClips=[];
this._playlist.clips=[];
this._playlist.globalDataType="com.theplatform.pdk.data::Playlist";
var j=0;
var k=0;
var h=0;
var m=0;
for(var f=0;
f<b.ads.length;
f++){var l=b.ads[f];
if(l.adType==="Wrapper"){j++;
if(l.sequence&&!isNaN(l.sequence)){m++
}}else{if(l.adType==="InLine"){k++;
if(l.sequence&&!isNaN(l.sequence)){h++
}}else{tpDebug("Unknown ad type: "+(l?l.adType:"<null>")+" ignoring",this.controller.id,"VAST")
}}}if(j>1){tpDebug("This playlist has multiple wrappers; not supported",this.controller.id,"VAST");
this.vastError();
return
}if(j>0&&k>0){tpDebug("This playlist has a mix of wrappers and inline ads; not supported",this.controller.id,"VAST");
this.vastError();
return
}if(this._enablePods&&(h>0)){tpDebug("Detected VAST 3.0 sequence attributes",this.controller.id,"VAST");
var e=[];
var c=[];
for(f=0;
f<b.ads.length;
f++){if(b.ads[f].sequence&&!isNaN(b.ads[f].sequence)){c.push(b.ads[f])
}}while(c.length>0){var g=Number.MAX_VALUE;
var a=-1;
var d=0;
for(f=0;
f<c.length;
f++){d=Number(b.ads[f].sequence);
if(d<g){g=d;
a=f
}}e.push(c[a]);
c.splice(a,1)
}for(f=0;
f<e.length;
f++){this.processAd(e[f])
}this.vastSuccess();
return
}else{if(j==1){tpDebug("Detected VAST 2.0 wrapper",this.controller.id,"VAST");
this.processAd(b.ads[0]);
return
}else{if(k>0){tpDebug("Detected VAST 2.0 inline",this.controller.id,"VAST");
if(this._enablePods){if(b.ads.length>1){tpDebug("Playing only first inline, since VAST 3.0 was triggered",this.controller.id,"VAST")
}this.processAd(b.ads[0])
}else{tpDebug("Playing all inlines, since VAST 2.0 was triggered",this.controller.id,"VAST");
for(f=0;
f<b.ads.length;
f++){this.processAd(b.ads[f])
}}this.vastSuccess();
return
}}}if(this._playlist.clips.length>0){this.vastSuccess()
}else{this.vastError()
}},vastError:function(){this.controller.setAds(null)
},vastSuccess:function(){this.controller.setAds(this._playlist)
},addOverlays:function(k){if(k.nonLinearAds){var g;
for(g=0;
g<k.nonLinearAds.length;
g++){var c=k.nonLinearAds[g];
var e={};
e.guid=c.id;
if(!e.guid){e.guid="tpVASTOverlay"+Math.floor(Math.random()*100000)
}e.globalDataType="com.theplatform.pdk.data::Overlay";
if(c.staticResource){e.url=c.staticResource
}else{if(c.iFrameResource){e.url=c.iFrameResource
}}if(c.nonLinearClickThrough){e.href=c.nonLinearClickThrough
}e.bannerHeight=c.height;
if(c.creativeType){e.bannerType=c.creativeType
}e.stretchToFit=c.scalable;
if(c.url){e.src=c.url
}e.bannerWidth=c.width;
if(c.maintainAspectRatio){e.maintainAspectRatio=!(c.maintainAspectRatio=="false")
}if(!this.currentOverlays){this.currentOverlays=[]
}if(c.trackingEvents){var h=c.trackingEvents.length;
g=0;
for(;
g<h;
g++){var d=c.trackingEvents[g];
if(d.event=="creativeView"){if(d.urls){if(!e.impressionUrls){e.impressionUrls=[]
}var a=d.urls.length;
var f=0;
for(;
f<a;
f++){var b=d.urls[f];
e.impressionUrls.push(b.url)
}}}}}this.currentOverlays.push(e)
}}},showCompanions:function(c){if(!this.bannerImg){var b=document.getElementById("comp_300x60");
if(b){this.bannerLink=document.createElement("a");
this.bannerImg=document.createElement("img");
this.bannerLink.appendChild(this.bannerImg);
b.appendChild(this.bannerLink)
}else{return
}}for(var a=0;
a<c.length;
a++){if(c[a].staticResource&&c[a].height==60&&c[a].width==300){if(c[a].staticResource){this.bannerImg.src=c[a].staticResource
}else{if(c[a].iFrameResource){this.bannerImg.src=c[a].iFrameResource
}}this.bannerLink.href=c[a].companionClickThrough;
this.bannerLink.target="_blank";
break
}}},done:function(){this.overlayManager.removeAllOverlays()
},isVastUrl:function(a){if(!a||!this.hosts||this.hosts.length===0){return false
}for(var b=0;
b<this.hosts.length;
b++){if(a.match(this.hosts[b])){return true
}}return false
}});
var vastPlugIn=new $pdk.plugin.vast.VASTPlugIn();
tpController.plugInLoaded(vastPlugIn,vastPlugIn.container);
$pdk.ns("$pdk.plugin.vpaid.player");
$pdk.plugin.vpaid.player.PdkNoopPlayer=$pdk.extend(function(){},{_controller:null,_volumeSetCallback:null,_muteSetCallback:null,_pauseSetCallback:null,_onPlayerPauseListener:null,_onPlayerUnpauseListener:null,_onVolumeChangeListener:null,_onMuteListener:null,_active:false,constructor:function(a,c){this._controller=a;
this._seekSetCallback=c.mediaSeekSet;
this._volumeSetCallback=c.mediaSoundLevelSet;
this._muteSetCallback=c.mediaMuteSet;
this._pauseSetCallback=c.mediaPauseSet;
this._endSetCallback=c.mediaEndSet;
this._closeSetCallback=c.mediaCloseSet;
var b=this;
this._onPlayerUnpauseListener=function(){b._onPlayerUnpause.apply(b,arguments)
};
this._onPlayerPauseListener=function(){b._onPlayerPause.apply(b,arguments)
};
this._onVolumeChangeListener=function(){b._onVolumeChange.apply(b,arguments)
};
this._onMuteListener=function(){b._onMute.apply(b,arguments)
};
this._onResetPlayerListener=function(){b._onResetPlayer.apply(b,arguments)
};
this._onMediaEndListener=function(){b._onMediaEnd.apply(b,arguments)
};
this._addPlaybackListeners()
},activate:function(a){this._active=true;
this._clip=a
},deactivate:function(){this._active=false
},mediaStarts:function(){if(this._active){this._controller.dispatchEvent("OnMediaStart",this._clip)
}},mediaPause:function(a){if(this._active){if(a){this._controller.dispatchEvent("OnMediaPause",this._clip)
}else{this._controller.dispatchEvent("OnMediaUnpause",this._clip)
}}},mediaPlaying:function(b){if(this._active){var a={currentTime:b,duration:this._clip.mediaLength};
this._controller.dispatchEvent("OnMediaPlaying",a)
}},mediaEnds:function(){if(this._active){this._controller.endMedia(this._clip)
}},mediaError:function(a){},done:function(a){if(this._active){var b=this._controller;
var c=a;
var e=this;
setTimeout(function d(){e.log("on async, call endMedia");
e.controller.endMedia(c)
},10)
}},_onVolumeChange:function(a){if(this._active){this._volumeSetCallback(parseInt(a.data,10))
}},_onMute:function(a){if(this._active){this._muteSetCallback(a.data)
}},_onPlayerPause:function(b){var a="PdkNoopPlayer::onPlayerPause";
if(this._pauseSetCallback&&this._active){tpDebug(a+"- calling pauseSetCallback with True");
this._pauseSetCallback(true)
}},_onPlayerUnpause:function(b){var a="PdkNoopPlayer::onPlayerUnpause";
if(this._pauseSetCallback&&this._active){tpDebug(a+"- calling pauseSetCallback with False");
this._pauseSetCallback(false)
}},_onResetPlayer:function(){this._closeSetCallback()
},_onMediaEnd:function(){this._endSetCallback()
},_addPlaybackListeners:function(){this._controller.addEventListener("OnPlayerPause",this._onPlayerPauseListener);
this._controller.addEventListener("OnPlayerUnPause",this._onPlayerUnpauseListener);
this._controller.addEventListener("OnVolumeChange",this._onVolumeChangeListener);
this._controller.addEventListener("OnMute",this._onMuteListener);
this._controller.addEventListener("OnResetPlayer",this._onResetPlayerListener);
this._controller.addEventListener("OnMediaEnd",this._onMediaEndListener)
},dispose:function(){this.log("dispose");
this._controller=null;
this._volumeSetCallback=null;
this._muteSetCallback=null;
this._pauseSetCallback=null;
this._mediaPlayingCallback=null;
this._callbackScope=null;
this._currentReleasePlaylistAdClip=null;
this._onPlayerUnpauseListener=null;
this._onPlayerPauseListener=null;
this._onVolumeChangeListener=null;
this._onMuteListener=null
},log:function(b,c){if(!c){c=tpConsts.DEBUG
}var a=this._controller?this._controller.id:"";
tpDebug(b,a,"NoOpPlayer",c)
}});
$pdk.ns("$pdk.plugin.vpaid.player");
$pdk.ns("$pdk.plugin.vpaid.VPAIDEvent");
$pdk.plugin.vpaid.VPAIDEvent.AdClickThru="AdClickThru";
$pdk.plugin.vpaid.VPAIDEvent.AdError="AdError";
$pdk.plugin.vpaid.VPAIDEvent.AdExpandedChange="AdExpandedChange";
$pdk.plugin.vpaid.VPAIDEvent.AdImpression="AdImpression";
$pdk.plugin.vpaid.VPAIDEvent.AdLinearChange="AdLinearChange";
$pdk.plugin.vpaid.VPAIDEvent.AdLoaded="AdLoaded";
$pdk.plugin.vpaid.VPAIDEvent.AdLog="AdLog";
$pdk.plugin.vpaid.VPAIDEvent.AdPaused="AdPaused";
$pdk.plugin.vpaid.VPAIDEvent.AdPlaying="AdPlaying";
$pdk.plugin.vpaid.VPAIDEvent.AdRemainingTimeChange="AdRemainingTimeChange";
$pdk.plugin.vpaid.VPAIDEvent.AdStarted="AdStarted";
$pdk.plugin.vpaid.VPAIDEvent.AdStopped="AdStopped";
$pdk.plugin.vpaid.VPAIDEvent.AdUserAcceptInvitation="AdUserAcceptInvitation";
$pdk.plugin.vpaid.VPAIDEvent.AdUserClose="AdUserClose";
$pdk.plugin.vpaid.VPAIDEvent.AdUserMinimize="AdUserMinimize";
$pdk.plugin.vpaid.VPAIDEvent.AdVideoComplete="AdVideoComplete";
$pdk.plugin.vpaid.VPAIDEvent.AdVideoFirstQuartile="AdVideoFirstQuartile";
$pdk.plugin.vpaid.VPAIDEvent.AdVideoMidpoint="AdVideoMidpoint";
$pdk.plugin.vpaid.VPAIDEvent.AdVideoStart="AdVideoStart";
$pdk.plugin.vpaid.VPAIDEvent.AdVideoThirdQuartile="AdVideoThirdQuartile";
$pdk.plugin.vpaid.VPAIDEvent.AdVolumeChange="AdVolumeChange";
$pdk.plugin.vpaid.VPAIDEvent.AdSkippableStateChange="AdSkippableStateChange";
$pdk.plugin.vpaid.player.VPAIDPlayer=$pdk.extend(function(){},{version:"VERSION_UNKNOWN",LOAD_TIMEOUT:5000,INIT_TIMEOUT:5000,START_TIMEOUT:5000,RESUME_TIMEOUT:5000,LOAD:"load",INIT:"init",START:"start",RESUME:"resume",NONE:"none",_controller:null,_scrubberTimer:null,_soundLevel:null,_muted:false,_position:0,_currentAd:null,_clip:null,_mediaArea:null,_pauseStateMachine:null,_loadPercentage:0,_useRemainingTime:false,_linearPending:false,_loadStartChecked:false,_waitingForPossibleIndecisiveLinearAd:false,_injectionPending:false,_adVideoStarted:false,_adVideoStarting:false,_adVideoComplete:false,_adStarted:false,_adStopped:false,_adLoading:false,_adWrapper:null,_errorTimer:null,_errorStage:this.NONE,constructor:function(b,a){if($pdk.plugin.vpaid.player.VPAIDPlayer._instance){this.isVPAIDAd=null;
this.initVPAIDAd=null;
throw"$pdk.plugin.vpaid.player.VPAIDPlayer is a Singlton. Access via getInstance()"
}$pdk.plugin.vpaid.player.VPAIDPlayer._instance=this;
this._controller=b;
this._container=a;
tpConsts.StreamType={};
tpConsts.StreamType.EMPTY="empty";
var d=this;
this._controller.trace=function(f,e,g){tpDebug(f,d._controller.widgetId,e,g)
};
this._controller.addEventListener("OnReleaseStart",function(f){d.handleReleaseStart(f)
});
this._controller.addEventListener("OnClearCurrentRelease",function(f){d.handleClearCurrentRelease(f)
});
this._controller.addEventListener("OnResetPlayer",function(f){d.handleClearCurrentRelease(f)
});
this._controller.addEventListener("OnMediaEnd",function(f){d.handleMediaEnd(f)
});
this._controller.addEventListener("OnShowFullScreen",function(f){d.handleShowFullScreen(f)
});
var c={mediaEndSet:function(){d.requestMediaEnd()
},mediaCloseSet:function(){d.requestMediaClose()
},mediaSeekSet:function(e){d.requestMediaSeek(e)
},mediaPauseSet:function(e){d.requestMediaPause(e)
},mediaMuteSet:function(e){d.requestMediaMute(!d._muted)
},mediaSoundLevelSet:function(e){d.requestMediaSoundLevel(e)
}};
this._noop=new $pdk.plugin.vpaid.player.PdkNoopPlayer(this._controller,c)
},requestMediaClose:function(){this._adWrapper.stopAd()
},requestMediaEnd:function(){this._adWrapper.stopAd()
},requestMediaSeekSet:function(a){return
},requestMediaPause:function(a){if(a){this._adWrapper.pauseAd()
}else{this._adWrapper.resumeAd()
}},requestMediaMute:function(b){if(this._ignoreMute){return
}setTimeout(function(){a._ignoreMute=false
},500);
this._ignoreMute=true;
this._muted=b;
var a=this;
if(b){this._preMuteVolume=this._adWrapper.getAdVolume();
if(this._preMuteVolume<0){this._preMuteVolume=1
}this._adWrapper.setAdVolume(0)
}else{this._adWrapper.setAdVolume(this._preMuteVolume)
}},requestMediaSoundLevel:function(a){this._adWrapper.setAdVolume(a)
},destroy:function(){return
},isVPAIDAd:function(b){var a=false;
if((b.type=="application/x-shockwave-flash"||b.type=="swf")||(this._clip&&this._clip.baseClip.URL==b.URL)){a=true
}else{if((b.type=="application/javascript"||b.type=="js")||(this._clip&&this._clip.baseClip.URL==b.URL)){a=true
}else{a=false
}}this._controller.trace("is this a VPAID ad? ["+b.type+": "+a+"]","VPAID",tpConsts.INFO);
return a
},initVPAIDAd:function(a){if(this.isVPAIDAd(a.baseClip)&&a.streamType!=tpConsts.StreamType.EMPTY){this._clip=a;
this._adStopped=false;
this.loadAd();
this._controller.trace("loading the VPAID ad","VPAID",tpConsts.INFO);
if(a.baseClip.isOverlay){this._controller.trace("VPAID came from a NonLinear VAST element, skipping until injectPlaylist","VPAID",tpConsts.INFO);
a.baseClip.URL="";
a.streamType="empty";
this._controller.modClip(a);
this._linearPending=true;
return false
}else{a.streamType="empty";
this._controller.modClip(a);
this._controller.trace("Signing up to play this ad","VPAID",tpConsts.INFO);
this._adLoading=true;
return false
}}return false
},loadAd:function(){this._controller.trace("loadAd","VPAID",tpConsts.INFO);
this.startErrorStage(this.LOAD);
var a=this;
if(this._controller.component.videoengineruntime==="html5"){this._adWrapper=new $pdk.plugin.vpaid.wrapper.JavaScriptAdWrapper(this._controller,this._container)
}else{this._adWrapper=new $pdk.plugin.vpaid.wrapper.FlashAdWrapper(this._controller)
}this._adWrapper.loadAd(this._clip.baseClip.URL,function(){a.onLoaderCompleteHandler()
},function(b){a.onLoaderErrorHandler(b)
})
},onLoaderCompleteHandler:function(){this.endErrorStage(this.LOAD);
var a=this._adWrapper.handshakeVersion("2.0");
this._controller.trace("handshake version: "+a,"VPAID",tpConsts.INFO);
if(a===null){this._noop.mediaError("ad api has no handshake function; it's either not implemented correctly or implemented for a non-generalized framework that we don't understand");
return
}this.addVPaidHandlers();
this.doInitAd()
},onLoaderErrorHandler:function(a){this._noop.mediaError(a.toString())
},handleReleaseStart:function(a){this.cleanUp()
},handleClearCurrentRelease:function(a){this._noop.deactivate();
this._loadStartChecked=false;
this.cleanUp()
},beginVPAID:function(){var b=this._clip;
var a=this;
if(!b.baseClip.isAd){return
}else{if(b.streamType!="empty"){}else{if(b.baseClip.URL.indexOf(this._clip.baseClip.URL)!==0){this._controller.trace("Empty stream type, but not from this plug-in; ignore","VPAID",tpConsts.INFO)
}else{if(this._adWrapper&&(this._adWrapper.getAdLinear()||this._adVideoStarting)){this._controller.trace("ad is linear, starting playback...","VPAID",tpConsts.INFO);
this._controller.trace("Opening NoOp Bridge","VPAID",tpConsts.INFO);
this._noop.activate(b);
this._loadStartChecked=true;
if(this._linearPending){this._linearPending=false;
setTimeout(function(){a.doStartAdVideo()
},1)
}this._controller.trace("URL is "+b.baseClip.URL+" handle it","VPAID",tpConsts.INFO);
this.playAd(b)
}else{this._controller.trace("ad is not linear, resuming content playback...","VPAID",tpConsts.INFO);
this._noop.activate(b);
this._loadStartChecked=true;
this._waitingForPossibleIndecisiveLinearAd=true;
setTimeout(function(){a._noop.mediaStarts(this._clip)
},1)
}}}}},handleShowFullScreen:function(a){if(a.data){this._adWrapper.resizeAd(mediaArea.width,mediaArea.height,"fullscreen")
}else{this._adWrapper.resizeAd(mediaArea.width,mediaArea.height,"normal")
}},handleMediaEnd:function(a){if(this._adWrapper&&this._adWrapper.adLinear&&this._adVideoStarted&&this._adWrapper.getAdRemainingTime()>=1){this._controller.trace("ending linear media from outside","VPAID",tpConsts.INFO);
this._adWrapper.stopAd()
}else{if(this._adWrapper&&this._adStarted&&!this._adVideoStarting&&!(a.data).isAd){this._controller.trace("ending ad and moving on to next chapter","VPAID",tpConsts.INFO);
this._adWrapper.stopAd()
}}},playAd:function(b){this._controller.trace("playAd","VPAID",tpConsts.INFO);
this._currentAd=b;
if(this._adWrapper.getAdRemainingTime()>0){var c=this._adWrapper.getAdRemainingTime()*1000;
this._currentAd.mediaLength=c;
this._currentAd.length=c;
this._useRemainingTime=true;
this._controller.modClip(b)
}else{this._useRemainingTime=false
}this._controller.trace("Playing ad "+b.baseClip.URL+" duration: "+this._currentAd.mediaLength,"VPAID",tpConsts.INFO);
var a=this;
this._position=0;
this._loadPercentage=0
},doInitAd:function(){var b=(this._clip.baseClip.trackingData?this._clip.baseClip.trackingData:null);
var a=this._controller.getMediaArea();
this.startErrorStage(this.INIT);
this._controller.trace("calling initAd("+a.width+", "+a.height+", normal, 300, "+b+", env)","VPAID",tpConsts.INFO);
this._adWrapper.initAd(a.width,a.height,"normal",300,b,null)
},doStartAdVideo:function(){this._controller.trace("Calling mediaStarts","VPAID",tpConsts.INFO);
this._noop.mediaStarts(this._clip);
this._adVideoStarted=true;
this._adVideoStarting=false;
this.startScrubberTimer()
},startAd:function(){this._controller.trace("calling startAd()","VPAID",tpConsts.INFO);
this.startErrorStage(this.START);
this._adWrapper.startAd()
},adStarted:function(){this.positionPlayer(this._controller.getMediaArea());
this.positionPlayer(this._controller.getMediaArea())
},scrubTick:function(){if(this._useRemainingTime&&this._currentAd.mediaLength>0){this._position=this._currentAd.mediaLength-(this._adWrapper.getAdRemainingTime()*1000)+500
}else{this._position+=300
}if(this._currentAd.mediaLength>0&&this._position>=this._currentAd.mediaLength){this._controller.trace("Video portion of ad is done playing","VPAID",tpConsts.INFO)
}else{this._controller.trace("Calling mediaPlaying("+this._position+") timeRemaining:"+this._adWrapper.getAdRemainingTime(),"VPAID",tpConsts.DEBUG);
this._noop.mediaPlaying(this._position)
}},positionPlayer:function(a){this._controller.trace("Positioning player at ["+a.x+", "+a.y+"], "+a.width+"w x "+a.height+"h","VPAID",tpConsts.INFO);
this._adWrapper.resizeAd(a.width,a.height,"normal")
},linearComplete:function(){this._controller.trace("linear portion of ad is complete","VPAID",tpConsts.DEBUG);
this._noop.mediaPlaying(this._currentAd.mediaLength);
this._loadStartChecked=false;
this._noop.mediaEnds();
this._noop.deactivate();
this._adVideoComplete=true;
if(!this._adWrapper||!this._adWrapper.getAdExpanded()){this._controller.pause(false)
}if(this._scrubberTimer){this._controller.trace("removing scrubber timer","VPAID",tpConsts.DEBUG);
clearInterval(this._scrubberTimer);
this._scrubberTimer=null
}},adComplete:function(){if((this._adVideoStarted||this._adVideoStarting)&&!this._adVideoComplete){this._noop.mediaError("The VPAID ad ended unexpectedly, moving on.")
}this.cleanUp()
},startErrorStage:function(a){this._errorStage=a;
var b=this;
switch(a){case this.LOAD:this._errorTimer=setTimeout(function(){b.loadError()
},this.LOAD_TIMEOUT);
break;
case this.INIT:this._errorTimer=setTimeout(function(){b.initError()
},this.INIT_TIMEOUT);
break;
case this.START:this._errorTimer=setTimeout(function(){b.startError()
},this.START_TIMEOUT);
break;
case this.RESUME:this._errorTimer=setTimeout(function(){b.resumeError()
},this.RESUME_TIMEOUT);
break
}},endErrorStage:function(a){this._errorStage=this.NONE;
clearTimeout(this._errorTimer)
},loadError:function(){this._noop.mediaError("The VPAID content failed to Load after ms:"+this.LOAD_TIMEOUT)
},initError:function(){this._noop.mediaError("The VPAID content failed to Init after ms:"+this.INIT_TIMEOUT)
},startError:function(){this._noop.mediaError("The VPAID content failed to Start after ms:"+this.START_TIMEOUT)
},resumeError:function(){this._noop.mediaError("The VPAID content failed to Resume after ms:"+this.RESUME_TIMEOUT)
},addVPaidHandlers:function(){if(!this._adWrapper){return
}var a=this;
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdClickThru,function(b){a.handleAdClickThru(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdError,function(b){a.handleAdError(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdExpandedChange,function(b){a.handleAdExpandedChange(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdImpression,function(b){a.handleAdImpression(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdLinearChange,function(b){a.handleAdLinearChange(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdLoaded,function(b){a.handleAdLoaded(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdLog,function(b){a.handleAdLog(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdPaused,function(b){a.handleAdPaused(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdPlaying,function(b){a.handleAdPlaying(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdRemainingTimeChange,function(b){a.handleAdRemainingTimeChange(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdStarted,function(b){a.handleAdStarted(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdStopped,function(b){a.handleAdStopped(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdUserAcceptInvitation,function(b){a.handleAdUserAcceptInvitation(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdUserClose,function(b){a.handleAdUserClose(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdUserMinimize,function(b){a.handleAdUserMinimize(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoComplete,function(b){a.handleAdVideoComplete(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoFirstQuartile,function(b){a.handleAdVideoFirstQuartile(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoMidpoint,function(b){a.handleAdVideoMidpoint(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoStart,function(b){a.handleAdVideoStart(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoThirdQuartile,function(b){a.handleAdVideoThirdQuartile(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVolumeChange,function(b){a.handleAdVolumeChange(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdSkippableStateChange,function(b){a.handleAdSkippableStateChange(b)
})
},removeVPaidHandlers:function(){},linearCheck:function(){if(this._adVideoStarting||this._adVideoStarted){}else{this._controller.trace("closing out empty clip since no ad started.","VPAID",tpConsts.INFO);
this._noop.mediaEnds();
this._noop.deactivate();
this._loadStartChecked=false
}},handleAdClickThru:function(b){var a=b.data;
this._controller.trace("handleAdClickThru "+(a?"url:"+a.url+" id:"+a.id+" playerHandles:"+a.playerHandles:"no data"),"VPAID",tpConsts.INFO);
if(a.playerHandles){if(a.url!==""){window.open(a.url,"_blank")
}else{window.open(this._clip.baseClip.moreInfo.href,"_blank")
}}},handleAdError:function(b){var a=(b.message?b.message:"null");
this._controller.trace("handleAdError :"+a,"VPAID",tpConsts.INFO);
if(this._controller.getProperty("logLevel")=="debug"){}},handleAdExpandedChange:function(a){this._controller.trace("handleAdExpandedChange expanded:"+this._adWrapper.getAdExpanded(),"VPAID",tpConsts.INFO);
if(this._adWrapper.getAdExpanded()){this._controller.pause(true)
}else{this._controller.pause(false)
}},handleAdImpression:function(a){this._controller.trace("handleAdImpression :","VPAID",tpConsts.INFO)
},handleAdLinearChange:function(a){this._controller.trace("handleAdLinearChange : "+this._adWrapper.getAdLinear(),"VPAID",tpConsts.INFO);
if(!this._adWrapper.getAdLinear()){this.linearComplete()
}},handleAdLoaded:function(a){this._controller.trace("handleAdLoaded: adLinear = "+this._adWrapper.getAdLinear(),"VPAID",tpConsts.INFO);
if(this._adLoading){if(this._adWrapper.getAdLinear()){this._adLoading=false;
this._controller.trace("inserting VPAID ad. linear: "+this._adWrapper.getAdLinear(),"VPAID",tpConsts.INFO);
this.takeOverClip(this._clip);
this.beginVPAID()
}else{this._controller.trace("Got a non-linear AdLoaded event but expecting a linear ad..."+this._adWrapper.getAdLinear(),"VPAID",tpConsts.ERROR)
}}else{if(this._adWrapper.getAdLinear()){this._controller.trace("Got a linear AdLoaded event but not expecting one..."+this._adWrapper.getAdLinear(),"VPAID",tpConsts.ERROR)
}else{this._controller.trace("not inserting VPAID ad since it's an overlay. linear: "+this._adWrapper.getAdLinear(),"VPAID",tpConsts.INFO)
}}this.endErrorStage(this.INIT);
this.startAd()
},handleAdLog:function(a){this._controller.trace(a,"AdLog",tpConsts.INFO)
},handleAdPaused:function(a){this._controller.trace("handleAdPaused","VPAID",tpConsts.INFO);
this.stopScrubberTimer();
this._noop.mediaPause(true)
},handleAdPlaying:function(a){this._controller.trace("handleAdPlaying","VPAID",tpConsts.INFO);
this.endErrorStage(this.RESUME);
this._noop.mediaPause(false);
this.startScrubberTimer()
},handleAdRemainingTimeChange:function(a){this._controller.trace("handleAdRemainingTimeChange :"+this._adWrapper.getAdRemainingTime()+" time remaining:"+this._adWrapper.getAdRemainingTime(),"VPAID",tpConsts.INFO)
},handleAdStarted:function(c){this._controller.trace("handleAdStarted: adLinear = "+this._adWrapper.getAdLinear(),"VPAID",tpConsts.INFO);
this.endErrorStage(this.START);
this.adStarted();
this._adStarted=true;
if(this._adWrapper.getAdRemainingTime()>0){var b=this._adWrapper.getAdRemainingTime()*1000;
this._currentAd.mediaLength=b;
this._currentAd.length=b;
this._useRemainingTime=true;
this._controller.modClip(clip)
}else{this._useRemainingTime=false
}if(this._waitingForPossibleIndecisiveLinearAd){var a=this;
setTimeout(function(){a.linearCheck()
},100)
}},handleAdStopped:function(a){this._controller.trace("handleAdStopped","VPAID",tpConsts.INFO);
this._adStopped=true;
this.adComplete()
},handleAdUserAcceptInvitation:function(a){this._controller.trace("handleAdUserAcceptInvitation","VPAID",tpConsts.INFO)
},handleAdUserClose:function(a){this._controller.trace("handleAdUserClose","VPAID",tpConsts.INFO)
},handleAdUserMinimize:function(a){this._controller.trace("handleAdUserMinimize :","VPAID",tpConsts.INFO)
},handleAdVideoComplete:function(a){this._controller.trace("handleAdVideoComplete :","VPAID",tpConsts.INFO);
this.linearComplete()
},handleAdVideoFirstQuartile:function(a){this._controller.trace("handleAdVideoFirstQuartile :","VPAID",tpConsts.INFO)
},handleAdVideoMidpoint:function(a){this._controller.trace("handleAdVideoMidpoint","VPAID",tpConsts.INFO)
},handleAdVideoStart:function(a){this._controller.trace("handleAdVideoStart","VPAID",tpConsts.INFO);
if(this._linearPending){this._adVideoStarting=true;
this._controller.trace("handleAdVideoStart: injecting","VPAID",tpConsts.INFO);
this._controller.injectPlaylist(this.createPlaylist(this.getNoOpClip(this._clip.baseClip)))
}else{this._controller.trace("handleAdVideoStart: starting","VPAID",tpConsts.INFO);
this.doStartAdVideo()
}},handleAdVolumeChange:function(a){this._ignoreMute=false
},handleAdSkippableStateChange:function(a){this._clip.baseClip.noSkip=!this._adWrapper.getAdSkippableState();
this._controller.updateClip(this._clip)
},startScrubberTimer:function(){if(!this._scrubberTimer){var a=this;
this._scrubberTimer=setInterval(function(){a.scrubTick()
},300)
}},stopScrubberTimer:function(){if(this._scrubberTimer){clearInterval(this._scrubberTimer);
this._scrubberTimer=null
}},getNoOpClip:function(c){var b={};
b.globalDataType="com.theplatform.pdk.data::BaseClip";
b.title="";
b.URL=c.URL;
b.isAd=true;
b.noSkip=true;
b.releaseLength=c.releaseLength;
b.impressionUrls=c.impressionUrls;
b.type="application/x-shockwave-flash";
var a=com.theplatform.pdk.SelectorExported.getInstance(this._controller.scopes.toString()).parseClip(b);
a.streamType="empty";
a.title="";
a.hasOverlayLayer=true;
a.trackingURLs=this._clip.trackingURLs;
return a
},takeOverClip:function(a){var b=a.baseClip;
b.globalDataType="com.theplatform.pdk.data::BaseClip";
b.isAd=true;
b.noSkip=true;
b.title="";
b.type="application/x-shockwave-flash";
this._controller.modBaseClip(a);
a.title="";
a.streamType="empty";
a.isExternal=true;
a.hasOverlayLayer=true;
this._controller.modClip(a)
},createPlaylist:function(a){var b={};
b.globalDataType="com.theplatform.pdk.data::Playlist";
b.baseClips=[a.baseClip];
b.clips=[a];
return b
},cleanUp:function(){if(!this._clip){return
}this._controller.trace("cleanUp()","VPAID",tpConsts.INFO);
this._clip=null;
if(this._adWrapper){this.removeVPaidHandlers();
if(!this._adStopped){this._controller.trace("calling stopAd()","VPAID",tpConsts.INFO);
this._adWrapper.stopAd()
}}if(this._loadStartChecked){this._noop.mediaEnds();
this._noop.deactivate();
this._loadStartChecked=false
}if(this._scrubberTimer){this._controller.trace("removing scrubber timer","VPAID",tpConsts.DEBUG);
clearInterval(this._scrubberTimer);
this._scrubberTimer=null
}this._linearPending=false;
this._waitingForPossibleIndecisiveLinearAd=false;
this._adStarted=false;
this._adStopped=false;
this._adVideoStarted=false;
this._adVideoStarting=false;
this._adVideoComplete=false;
this._adWrapper=null
}});
$pdk.plugin.vpaid.player.VPAIDPlayer.getInstance=function(b,a){if(!$pdk.plugin.vpaid.player.VPAIDPlayer._instance){$pdk.plugin.vpaid.player.VPAIDPlayer._instance=new $pdk.plugin.vpaid.player.VPAIDPlayer(b,a)
}return $pdk.plugin.vpaid.player.VPAIDPlayer._instance
};
$pdk.ns("$pdk.plugin.vpaid.wrapper");
$pdk.plugin.vpaid.wrapper.FlashAdWrapper=$pdk.extend(function(){},{LAYER_LOADED:false,constructor:function(a){this.controller=a;
if(!$pdk.plugin.vpaid.wrapper.FlashAdWrapper.LAYER_LOADED){$pdk.plugin.vpaid.wrapper.FlashAdWrapper.LAYER_LOADED=true;
this.controller.loadLayer("flash",$pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,$pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_URL)
}},loadAd:function(b,c,a){setTimeout(function(){c()
},1000);
this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"loadAd",[b])
},addEventListener:function(c,d){$pdk.ns("$pdk.plugin.vpaid.callbacks");
var a="callback_"+Math.floor(Math.random()*10000000);
var b=this;
$pdk.plugin.vpaid.callbacks[a]=function(){d.apply()
};
this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"addVPAIDEventListener",[c,"$pdk.plugin.vpaid.callbacks."+a])
},getAdLinear:function(){return this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"getAdLinear",[])
},getAdExpanded:function(){return this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"getAdExpanded",[])
},getAdRemainingTime:function(){return this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"getAdRemainingTime",[])
},getAdVolume:function(){return this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"getAdVolume",[])
},setAdVolume:function(a){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"setAdVolume",[a])
},handshakeVersion:function(a){return this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"handshakeVersion",[a])
},initAd:function(d,a,b,c,f,e){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"initAd",[d,a,b,c,f,e])
},resizeAd:function(c,a,b){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"resizeAd",[c,a,b])
},startAd:function(){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"startAd",[])
},stopAd:function(){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"stopAd",[])
},pauseAd:function(){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"pauseAd",[])
},resumeAd:function(){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"resumeAd",[])
},expandAd:function(){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"expandAd",[])
},collapseAd:function(){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"collapseAd",[])
}});
$pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID="vpaid-layer";
$pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_URL=$pdk.scriptRoot+"/swf/VPAIDLoader.swf";
$pdk.ns("$pdk.plugin.vpaid.wrapper");
$pdk.plugin.vpaid.wrapper.JavaScriptAdWrapper=$pdk.extend(function(){},{LAYER_LOADED:false,constructor:function(b,a){this.controller=b;
this.iframe=document.createElement("iframe");
this.iframe.style.visibility="hidden";
this.iframe.style.position="absolute";
this.iframe.style.top="-10000px";
a.appendChild(this.iframe);
this.container=a;
if(!$pdk.plugin.vpaid.wrapper.JavaScriptAdWrapper.LAYER_LOADED){$pdk.plugin.vpaid.wrapper.JavaScriptAdWrapper.LAYER_LOADED=true
}},loadAd:function(b,e,a){var d=this;
this.iframe.onload=function(g){var f=d.iframe.contentWindow.getVPAIDAd;
if(f&&typeof f=="function"){d.VPAIDCreative=f();
if(d.checkVPAIDInterface(d.VPAIDCreative)){e()
}else{a()
}}};
var c='<html><head><script type="text/javascript" src="'+b+'"><\/script></head><body></body></html>';
this.iframe.contentWindow.document.open();
this.iframe.contentWindow.document.write(c);
this.iframe.contentWindow.document.close()
},checkVPAIDInterface:function(a){if(a.handshakeVersion&&typeof a.handshakeVersion=="function"&&a.initAd&&typeof a.initAd=="function"&&a.startAd&&typeof a.startAd=="function"&&a.stopAd&&typeof a.stopAd=="function"&&a.skipAd&&typeof a.skipAd=="function"&&a.resizeAd&&typeof a.resizeAd=="function"&&a.pauseAd&&typeof a.pauseAd=="function"&&a.resumeAd&&typeof a.resumeAd=="function"&&a.expandAd&&typeof a.expandAd=="function"&&a.collapseAd&&typeof a.collapseAd=="function"&&a.subscribe&&typeof a.subscribe=="function"&&a.unsubscribe&&typeof a.unsubscribe=="function"){return true
}return false
},subscribe:function(b,a){this.VPAIDCreative.subscribe(b,a)
},unsubscribe:function(b,a){this.VPAIDCreative.unsubscribe(b,a)
},addEventListener:function(a,b){this.subscribe(b,a)
},removeEventListener:function(a,b){this.unsubscribe(b,a)
},getAdLinear:function(){try{return this.VPAIDCreative.getAdLinear()
}catch(a){return true
}},getAdExpanded:function(){try{return this.VPAIDCreative.getAdExpanded()
}catch(a){return false
}},getAdRemainingTime:function(){try{return this.VPAIDCreative.getAdRemainingTime()
}catch(a){return -1
}},getAdVolume:function(){try{return this.VPAIDCreative.getAdVolume()
}catch(a){return -1
}},setAdVolume:function(a){try{this.VPAIDCreative.setAdVolume(a)
}catch(b){}},getAdSkippableState:function(){try{return this.VPAIDCreative.getAdSkippableState()
}catch(a){return false
}},handshakeVersion:function(a){return this.VPAIDCreative.handshakeVersion(a)
},initAd:function(d,a,b,c,f,e){if(!e){e={slot:this.container,videoSlot:this.controller.getVideoProxy(),videoSlotCanAutoPlay:true}
}this.VPAIDCreative.initAd(d,a,b,c,f,e)
},resizeAd:function(c,a,b){this.VPAIDCreative.resizeAd(c,a,b)
},startAd:function(){this.VPAIDCreative.startAd()
},stopAd:function(){this.VPAIDCreative.stopAd()
},pauseAd:function(){this.VPAIDCreative.pauseAd()
},resumeAd:function(){this.VPAIDCreative.resumeAd()
},expandAd:function(){this.VPAIDCreative.expandAd()
},collapseAd:function(){this.VPAIDCreative.collapseAd()
}});