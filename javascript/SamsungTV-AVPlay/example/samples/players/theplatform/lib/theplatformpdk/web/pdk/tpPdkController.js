(function(){var w=navigator.userAgent.toLowerCase(),q=function(e){return e.test(w)
},j=function(){var i=w.match(/android (\d+(\.\d+)?)/i);
var H=(i&&i.length>1&&i[1])||"";
var F=H.split(".");
var G=F[0]*1;
var e=F.length>0?F[1]*1:0;
return(G>4)||(G==4&&e>=4)
},f=function(){var e=w.match(/\b[0-9]+_[0-9]+(?:_[0-9]+)?\b/);
return e[0].indexOf("7")===0
},a=function(){var H;
var G=function(){};
var i=["assert","clear","count","debug","dir","dirxml","error","exception","group","groupCollapsed","groupEnd","info","log","markTimeline","profile","profileEnd","table","time","timeEnd","timeStamp","trace","warn"];
var F=i.length;
var e=(window.console=window.console||{});
while(F--){H=i[F];
if(!e[H]){e[H]=G
}}},u=true,E=q(/opera/),h=q(/edge\//),t=(!E&&(q(/msie/)||q(/trident/))),s=t&&q(/msie 6/),r=t&&q(/msie 7/),p=t&&q(/msie 8/),o=(t&&q(/trident\/5.0/)),g=q(/firefox [0-9][0-9]/)||q(/firefox\/[0-9][0-9]/),x=q(/webkit/)&&!h,c=q(/chrome/)&&!h,B=!c&&!h&&q(/safari/),y=q(/bb10/),A=q(/iphone/),l=q(/iphone/)||q(/ipad/),m=(l)&&f(),D=q(/android/),b=D&&j(),C=q(/windows|win32/),k=q(/macintosh/),d,n="";
a();
try{d=document.getElementsByTagName("script");
if(typeof(window.$pdk)==="object"&&typeof(window.$pdk.scriptRoot)==="string"){n=$pdk.scriptRoot
}else{for(var v=0;
v<d.length;
v++){if(d[v].src.match(/tpPdk\.js/)){n=d[v].src.substr(0,d[v].src.lastIndexOf("/"));
break
}}if(!n){n=d[d.length-1].src.substr(0,d[d.length-1].src.lastIndexOf("/"))
}}}catch(z){n=""
}if(window.$pdk===null||(typeof(window.$pdk)!=="object"&&typeof(window.$pdk)!=="function")){window.$pdk={bootloader_version:1}
}if(typeof($pdk.apply)!=="function"){$pdk.apply=function(F,G,i){if(i){$pdk.apply(F,i)
}if(F&&G&&typeof G=="object"){for(var e in G){F[e]=G[e]
}}return F
}
}$pdk.apply($pdk,{isAny:u,isOpera:E,isEdge:h,isIE:t,isIE6:s,isIE7:r,isIE8:p,isIE9:o,isWebKit:x,isChrome:c,isSafari:B,isFirefox:g,isMac:k,isBB10:y,isAndroid:D,isAndroid44plus:b,isIPhone:A,isIOS7:m,isIOS:l,isWindows:C,scriptRoot:n,startTime:(new Date()).getTime(),defaultAppJsRoot:"js/app",isArray:function(e){return Object.prototype.toString.apply(e)==="[object Array]"
},isEmpty:function(i,e){return i===null||i===undefined||(($pdk.isArray(i)&&!i.length))||(!e?i==="":false)
},isPrimitive:function(e){var i=typeof e;
return i=="string"||i=="number"||i=="boolean"
},isObject:function(e){return e&&typeof e=="object"
},tupleComp:function(J,I,F){var e=-1,H,G=J.length;
for(H=0;
H<G;
H++){e=F(J[H],I[H]);
if(e!==0){break
}}return e
},each:function(I,H,G){if($pdk.isEmpty(I,true)){return
}if(typeof I.length=="undefined"||$pdk.isPrimitive(I)){I=[I]
}for(var F=0,e=I.length;
F<e;
F++){if(H.call(G||I[F],I[F],F,I)===false){return F
}}},ns:function(){var H,G,i=window;
try{i=$wnd!==null&&typeof($wnd)==="object"?$wnd:window
}catch(F){i=window
}$pdk.each(arguments,function(e){G=e.split(".");
H=i[G[0]]=i[G[0]]||{};
$pdk.each(G.slice(1),function(I){H=H[I]=H[I]||{}
})
});
return H
},override:function(e,F){if(F){var i=e.prototype;
$pdk.apply(i,F);
if($pdk.isIE&&F.toString!=e.toString){i.toString=F.toString
}}},extend:function(){var i=function(G){for(var F in G){this[F]=G[F]
}};
var e=Object.prototype.constructor;
return function(L,I,K){if($pdk.isObject(I)){K=I;
I=L;
L=(K.constructor!=e&&(!K.constructor.name||K.constructor.name!="Object"))?K.constructor:function(){I.apply(this,arguments)
}
}var H=function(){},J,G=I.prototype;
H.prototype=G;
J=L.prototype=new H();
J.constructor=L;
L.superclass=G;
if(G.constructor==e){G.constructor=I
}L.override=function(F){$pdk.override(L,F)
};
J.superclass=J.supr=(function(){return G
});
J.override=i;
$pdk.override(L,K);
L.extend=function(F){$pdk.extend(L,F)
};
return L
}
}(),isDomReady:function(){if($pdk.isEmpty(document.readyState)){return !$pdk.isEmpty(document.body)
}return/loaded|complete/.test(document.readyState)
}});
$pdk.ns("js.com.theplatform.pdk");
js.com.theplatform.pdk=$pdk
})();
$pdk.ns("$pdk.entrypoint");
$pdk.entrypoint.Entrypoint=$pdk.extend(function(){},{constructor:function(){this._complete=false;
this._registry=null;
this._env=null;
this._callBacks=[];
this._postOnLoad=function(){}
},configure:function(a,b){this._registry=a;
this._env=b
},_loaded:false,addCallback:function(a){this._callBacks.push(a);
if(this._loaded){a.apply()
}},initialize:function(){},onLoad:function(){var c=0,a=this._callBacks.length,d=this;
if(typeof(window.tpLogLevel)==="string"&&window.tpLogLevel.toLowerCase()==="debug"&&window.console&&window.console.time){window.console.timeEnd("Time it took from tpPdk.js being loaded until $pdk.onload fired");
window.console.timeEnd("Time it took from pageload until $pdk.onload fired");
window.console.time("Time it took from $pdk.onload until setRelease/setReleaseUrl");
window.console.time("Time it took from $pdk.onload until OnPluginsComplete")
}this._loaded=true;
for(;
c<a;
c++){this._callBacks[c].apply()
}var b=typeof(window._PDK_SUPRESS_INITIALIZE)==="boolean"?window._PDK_SUPRESS_INITIALIZE:false;
if((this._env===null||this._env.getAutoInitialize())&&!b){this.initialize()
}this._postOnLoad()
}});
$pdk.ns("$pdk.env.HttpHead");
$pdk.env.HttpHead.Processor=$pdk.extend(function(){},{constructor:function(a){this._env=a
},process:function(f){var e,a,b,g=this._collectTpMetaTags(f),d=g.length,c;
for(c=0;
c<d;
c++){e=g[c];
if(!$pdk.isEmpty(e.value)){b=e.name.replace(/^tp:/,"").toLowerCase();
if(b==="baseurl"){a=e.value.replace(/\s/g,"").split(",")
}else{a=e.value.replace(/\s/g,"").toLowerCase().split(",")
}while(a.length>0){this._env.addToConfigSet(b,a.shift())
}}}},_collectTpMetaTags:function(g){var f,a=[],b,e,h=g.getElementsByTagName("meta"),d=h.length,c;
for(c=0;
c<d;
c++){f=h[c];
b=f.getAttribute("name");
if(typeof(b)==="string"&&b.match(/^tp:/)){e=f.getAttribute("content");
a.push({name:b,value:e})
}}return a
}});
$pdk.Entrypoint=$pdk.apply({},{_class:$pdk.extend($pdk.entrypoint.Entrypoint,{constructor:function(){$pdk.Entrypoint._class.superclass.constructor.call(this)
},initialize:function(){var a=this;
$pdk.Entrypoint._class.superclass.initialize.call(this);
$pdk._boundIframes={};
$pdk._bind=function(b,c){if(c){$pdk._boundIframes[b.id]=true;
return
}if(typeof b==="string"){return $pdk._bind(document.getElementById(b))
}else{if(b!==null&&typeof b==="object"&&b.nodeType===1&&typeof b.nodeName==="string"&&b.nodeName.toLowerCase()==="iframe"){if(!this._first||!window.tpController){$pdk.controller=window.tpController=new $pdk.queue.external.Controller();
$pdk.interfaces.expose(window,$pdk.controller)
}else{$pdk.controller=window.tpController
}this._first=false;
$pdk.controller.setIFrame(b,$pdk._boundIframes[b.id])
}}return $pdk.controller
};
$pdk.bind=function(b,c){return $pdk._bind(b,c)
}
}}),_singleton:null,_first:true,getInstance:function(){if($pdk.Entrypoint._singleton===null){$pdk.Entrypoint._singleton=new $pdk.Entrypoint._class()
}return $pdk.Entrypoint._singleton
},onLoad:function(){$pdk.Entrypoint.getInstance().onLoad()
}});
$pdk.ns("$pdk.queue.external");
$pdk.queue.external.Controller=$pdk.extend(function(){},{constructor:function(){var a=this;
this.listeners={};
this.queue=[];
this.listenerId=0;
if(window.addEventListener){addEventListener("message",function(b){a.receiveMessage(b)
},false)
}else{attachEvent("onmessage",function(b){a.receiveMessage(b)
})
}},setIFrame:function(b,a){var c=this;
this.iframe=b;
this.DOMAIN=b.src.substring(0,b.src.indexOf("/",b.src.indexOf(":")+3));
if(b.src.indexOf("#")==-1){b.src+="#playerurl="+escape(window.location.href)
}if(typeof(window.JSON)!=="object"){return
}if(a){c._iframeOnload(window.location.href)
}else{b.onload=function(d){c._iframeOnload(window.location.href)
}
}},requestFullScreen:function(){if(this.iframe){var a=this.iframe.requestFullScreen||this.iframe.webkitRequestFullScreen||this.iframe.mozRequestFullScreen||this.iframe.msRequestFullscreen||this._requestFullWindow;
try{a()
}catch(b){this._requestFullWindow()
}}},cancelFullScreen:function(){if(this.iframe){if(this._isFullWindow){this._cancelFullWindow();
return
}var a=this.iframe.cancelFullScreen||this.iframe.webkitCancelFullScreen||this.iframe.mozCancelFullScreen||this.iframe.msCancelFullscreen||this._cancelFullWindow;
try{a()
}catch(b){this._cancelFullWindow()
}}},_requestFullWindow:function(){if(!this.iframe){return
}var a=this.iframe;
if(!this.playerContainerStyle){this.playerContainerStyle={}
}this._isFullWindow=false;
this.playerContainerStyle.position=a.style.position;
this.playerContainerStyle.top=a.style.top;
this.playerContainerStyle.left=a.style.left;
this.playerContainerStyle.bottom=a.style.bottom;
this.playerContainerStyle.right=a.style.right;
this.playerContainerStyle.marginTop=a.style.marginTop;
this.playerContainerStyle.marginLeft=a.style.marginLeft;
this.playerContainerStyle.marginBottom=a.style.marginBottom;
this.playerContainerStyle.marginRight=a.style.marginRight;
this.playerContainerStyle.zIndex=a.style.zIndex;
this.playerContainerStyle.width=a.style.zIndex;
this.playerContainerStyle.height=a.style.zIndex;
a.style.zIndex=10000;
a.style.position="fixed";
a.style.top="0px";
a.style.left="0px";
a.style.bottom="0px";
a.style.right="0px";
a.style.marginTop="0px";
a.style.marginLeft="0px";
a.style.marginBottom="0px";
a.style.marginRight="0px";
a.style.width="100%";
a.style.height="100%";
this._isFullWindow=true
},_cancelFullWindow:function(){if(!this.iframe){return
}var a=this.iframe;
a.style.position=this.playerContainerStyle.position;
a.style.top=this.playerContainerStyle.top;
a.style.left=this.playerContainerStyle.left;
a.style.bottom=this.playerContainerStyle.bottom;
a.style.right=this.playerContainerStyle.right;
a.style.marginTop=this.playerContainerStyle.marginTop;
a.style.marginLeft=this.playerContainerStyle.marginLeft;
a.style.marginBottom=this.playerContainerStyle.marginBottom;
a.style.marginRight=this.playerContainerStyle.marginRight;
a.style.zIndex=this.playerContainerStyle.zIndex;
a.style.width=this.playerContainerStyle.width;
a.style.height=this.playerContainerStyle.height;
this._isFullWindow=false
},_iframeOnload:function(a){this.ready=true;
var b;
this.sendMessage("initialization","playerUrl",[a]);
while(this.queue.length>0){b=window.JSON.parse(this.queue.shift());
this.sendMessage(b.type,b.name,b.parameters)
}},sendMessage:function(c,b,a){if(typeof(window.JSON)!=="object"){return
}var d=window.JSON.stringify({type:c,name:b,parameters:a});
if(this.ready){this.iframe.contentWindow.postMessage(d,this.DOMAIN)
}else{this.queue.push(d)
}},dispatchEvent:function(a,c,b){this.sendMessage("dispatchEvent",a,[b,c])
},addEventListener:function(a,d,b){var c=this.listenerId++;
this.listeners[c]={callback:d,id:c,eventName:a};
this.sendMessage("addEventListener",a,[b,c])
},removeEventListener:function(a,e,b){for(var d in this.listeners){var c=this.listeners[d];
if(typeof(c)==="object"&&typeof(c.id)==="number"){if(c.callback===e&&a===c.eventName){delete this.listeners[c.id];
this.sendMessage("removeEventListener",a,[b,c.id]);
break
}}}},receiveMessage:function(a){if(typeof(window.JSON)!=="object"||!this.iframe||a.source!==this.iframe.contentWindow||!a.data){return
}try{a=window.JSON.parse(a.data)
}catch(c){return
}if(a.type=="event"&&a.parameters&&a.parameters.length>1&&a.scope==="pdk"){var b=this.listeners[a.parameters[1]];
if(typeof(b)==="object"){if(typeof(b.callback)==="function"){b.callback(a.parameters[0])
}}}else{if(a.type=="api"&&a.scope==="pdk"){if(a.name=="requestIFrameFullWindow"){this.requestFullScreen()
}else{if(a.name=="cancelIFrameFullWindow"){this.cancelFullScreen()
}}}}},isExternal:function(){return true
}});
$pdk.ns("$pdk.interfaces");
$pdk.interfaces.expose=function(b,a){a.getCurrentRange=function(c){this.sendMessage("method","getCurrentRange",[c])
};
a.previousRange=function(d,c){d=typeof(d)==="undefined"?true:d;
this.sendMessage("method","previousRange",[d,c])
};
a.nextRange=function(d,c){d=typeof(d)==="undefined"?true:d;
this.sendMessage("method","nextRange",[d,c])
};
a.firstRange=function(d,c){d=typeof(d)==="undefined"?true:d;
this.sendMessage("method","firstRange",[d,c])
};
a.showPlayerCard=function(d,g,f,c,e){this.sendMessage("method","showPlayerCard",[d,g,f,c,e])
};
a.addPlayerCard=function(g,j,d,i,e,c,f,h){this.sendMessage("method","addPlayerCard",[g,j,d,i,e,c,f,h])
};
a.hidePlayerCard=function(c,e,d){this.sendMessage("method","hidePlayerCard",[c,e,d])
};
a.setClipInfo=function(d,e,c){this.sendMessage("method","setClipInfo",[d,e,c])
};
a.getValidRegions=function(c){this.sendMessage("method","getValidRegions",[c])
};
a.getDefaultBanners=function(c){this.sendMessage("method","getDefaultBanners",[c])
};
a.search=function(d,c){d=typeof(d)==="undefined"?"":d;
this.sendMessage("method","search",[d,c])
};
a.setSubtitleStyle=function(d,c){this.sendMessage("method","setSubtitleStyle",[d,c])
};
a.setCurrentReleaseList=function(d,c){this.sendMessage("method","setCurrentReleaseList",[d,c])
};
a.clearPlayerMessage=function(c){this.sendMessage("method","clearPlayerMessage",[c])
};
a.getAnnotations=function(c){this.sendMessage("method","getAnnotations",[c])
};
a.removeAnnotation=function(c,d){this.sendMessage("method","removeAnnotation",[c,d])
};
a.setSmil=function(c,d){this.sendMessage("method","setSmil",[c,d])
};
a.showFullScreen=function(c,d){this.sendMessage("method","showFullScreen",[c,d])
};
a.getMediaArea=function(e,d,c){this.sendMessage("method","getMediaArea",[e,d,c])
};
a.getNextClip=function(c){this.sendMessage("method","getNextClip",[c])
};
a.previousClip=function(c){this.sendMessage("method","previousClip",[c])
};
a.setVideoScalingMethod=function(d,c){this.sendMessage("method","setVideoScalingMethod",[d,c])
};
a.resetPlayer=function(c){this.sendMessage("method","resetPlayer",[c])
};
a.getPlaybackRate=function(c){this.sendMessage("method","getPlaybackRate",[c])
};
a.setPlayerLayoutXml=function(c,d){this.sendMessage("method","setPlayerLayoutXml",[c,d])
};
a.showEmailForm=function(d,c){this.sendMessage("method","showEmailForm",[d,c])
};
a.getContentArea=function(c){this.sendMessage("method","getContentArea",[c])
};
a.loadReleaseURL=function(c,d,e){this.sendMessage("method","loadReleaseURL",[c,d,e])
};
a.setExpandVideo=function(d,c){this.sendMessage("method","setExpandVideo",[d,c])
};
a.seekToPosition=function(c,d){this.sendMessage("method","seekToPosition",[c,d])
};
a.getBandwidthPreferences=function(c){this.sendMessage("method","getBandwidthPreferences",[c])
};
a.playNext=function(e,c,d){this.sendMessage("method","playNext",[e,c,d])
};
a.setPlayerLayoutUrl=function(c,d){this.sendMessage("method","setPlayerLayoutUrl",[c,d])
};
a.useDefaultLinkForm=function(c,d){this.sendMessage("method","useDefaultLinkForm",[c,d])
};
a.suspendPlayAll=function(d,c){this.sendMessage("method","suspendPlayAll",[d,c])
};
a.loadSmil=function(d,c,e){this.sendMessage("method","loadSmil",[d,c,e])
};
a.pause=function(c,d,e){this.sendMessage("method","pause",[c,d,e])
};
a.getOverlayArea=function(f,c,e,d){this.sendMessage("method","getOverlayArea",[f,c,e,d])
};
a.cancelMedia=function(c,d){this.sendMessage("method","cancelMedia",[c,d])
};
a.getNextRelease=function(e,c,d){this.sendMessage("method","getNextRelease",[e,c,d])
};
a.hidePlayerRegions=function(d,c,e){this.sendMessage("method","hidePlayerRegions",[d,c,e])
};
a.setToken=function(c,e,d){this.sendMessage("method","setToken",[c,e,d])
};
a.refreshReleaseModel=function(c,k,e,f,d,i,j,g,h){this.sendMessage("method","refreshReleaseModel",[c,k,e,f,d,i,j,g,h])
};
a.clickPlayButton=function(c){this.sendMessage("method","clickPlayButton",[c])
};
a.refreshCategoryModel=function(d,c,e){this.sendMessage("method","refreshCategoryModel",[d,c,e])
};
a.previewRefreshReleaseModel=function(c,k,e,f,d,i,j,g,h){this.sendMessage("method","previewRefreshReleaseModel",[c,k,e,f,d,i,j,g,h])
};
a.setVolume=function(d,c){this.sendMessage("method","setVolume",[d,c])
};
a.mute=function(d,c){this.sendMessage("method","mute",[d,c])
};
a.setClipInfo=function(d,e,c){this.sendMessage("method","setClipInfo",[d,e,c])
};
a.setRelease=function(c,d,e){this.sendMessage("method","setRelease",[c,d,e])
};
a.clearCurrentRelease=function(c){this.sendMessage("method","clearCurrentRelease",[c])
};
a.endCurrentRelease=function(c){this.sendMessage("method","endCurrentRelease",[c])
};
a.setVariable=function(f,d,g,c,e){this.sendMessage("method","setVariable",[f,d,g,c,e])
};
a.disablePlayerControls=function(c,d,e){this.sendMessage("method","disablePlayerControls",[c,d,e])
};
a.setAudioTrackByLanguage=function(d,c){this.sendMessage("method","setAudioTrackByLanguage",[d,c])
};
a.setBandwidthPreferences=function(d,c){this.sendMessage("method","setBandwidthPreferences",[d,c])
};
a.clearAdCookie=function(c){this.sendMessage("method","clearAdCookie",[c])
};
a.clearAnnotations=function(c){this.sendMessage("method","clearAnnotations",[c])
};
a.setShowSubtitles=function(c,d){this.sendMessage("method","setShowSubtitles",[c,d])
};
a.useDefaultPlayOverlay=function(c,d){this.sendMessage("method","useDefaultPlayOverlay",[c,d])
};
a.getUseDefaultPlayOverlay=function(c){this.sendMessage("method","getUseDefaultPlayOverlay",[c])
};
a.setLicenseServer=function(d,c,e){this.sendMessage("method","setLicenseServer",[d,c,e])
};
a.useDefaultEmailForm=function(c,d){this.sendMessage("method","useDefaultEmailForm",[c,d])
};
a.addAnnotation=function(c,d){this.sendMessage("method","addAnnotation",[c,d])
};
a.playPrevious=function(d,c){this.sendMessage("method","playPrevious",[d,c])
};
a.showLinkForm=function(d,c){this.sendMessage("method","showLinkForm",[d,c])
};
a.getCurrentRange=function(c){this.sendMessage("method","getCurrentRange",[c])
};
a.setPlaybackRate=function(d,c){this.sendMessage("method","setPlaybackRate",[d,c])
};
a.setProperty=function(f,d,g,c,e){this.sendMessage("method","setProperty",[f,d,g,c,e])
};
a.getSubtitleLanguage=function(c,d){this.sendMessage("method","getSubtitleLanguage",[c,d])
};
a.trace=function(e,d,f,c){this.sendMessage("method","trace",[e,d,f,c])
};
a.setPlayerMessage=function(e,c,d){this.sendMessage("method","setPlayerMessage",[e,c,d])
};
a.setSubtitleLanguage=function(d,c){this.sendMessage("method","setSubtitleLanguage",[d,c])
};
a.clearCategorySelection=function(c){this.sendMessage("method","clearCategorySelection",[c])
};
a.seekToPercentage=function(d,c){this.sendMessage("method","seekToPercentage",[d,c])
};
a.getSubtitleStyle=function(c){this.sendMessage("method","getSubtitleStyle",[c])
};
a.getPlayerVariables=function(d,c){this.sendMessage("method","getPlayerVariables",[d,c])
};
a.previewNextRefreshReleaseModel=function(c){this.sendMessage("method","previewNextRefreshReleaseModel",[c])
};
a.loadRelease=function(c,d,e){this.sendMessage("method","loadRelease",[c,d,e])
};
a.setPreviewImageUrl=function(c,d){this.sendMessage("method","setPreviewImageUrl",[c,d])
};
a.setAudioTrackById=function(d,c){this.sendMessage("method","setAudioTrackById",[d,c])
};
a.nextClip=function(c){this.sendMessage("method","nextClip",[c])
};
a.setReleaseURL=function(d,c,e){this.sendMessage("method","setReleaseURL",[d,c,e])
}
};
(function(b,a){a=typeof(a)==="boolean"?a:false;
if(!a){if($pdk.controller===null||typeof($pdk.controller)!=="object"){b.tpController=new $pdk.queue.external.Controller();
$pdk.controller=b.tpController;
$pdk.interfaces.expose(b,b.tpController)
}$pdk.Entrypoint.onLoad()
}}(window,window._PDK_SUPRESS_AUTOINIT));