window.matchMedia||(window.matchMedia=function(){var c=window.styleMedia||window.media;
if(!c){var a=document.createElement("style"),d=document.getElementsByTagName("script")[0],b=null;
a.type="text/css";
a.id="matchmediajs-test";
d.parentNode.insertBefore(a,d);
b="getComputedStyle" in window&&window.getComputedStyle(a,null)||a.currentStyle;
c={matchMedium:function(f){var g="@media "+f+"{ #matchmediajs-test { width: 1px; } }";
if(a.styleSheet){a.styleSheet.cssText=g
}else{a.textContent=g
}return b.width==="1px"
}}
}return function(e){return{matches:c.matchMedium(e||"all"),media:e||"all"}
}
}());
$pdk.ns("$pdk.plugin.doubleclick");
$pdk.plugin.doubleclick.Doubleclick=$pdk.extend(function(){},{VERSION:"3.1",AD_CONTAINER_ID_PREFIX:"tpAdContainer",_callback:"tpDCLoaded",_dcUrl:null,_imaJsUrl:"//imasdk.googleapis.com/js/sdkloader/ima3.js",_adDisplayContainer:null,_clickTrackingElement:null,_adDisplayContainerInitialized:false,_adsLoader:null,_adsManager:null,_hosts:null,DEFAULT_HOST:"doubleclick.net",_mimeTypes:null,_companionBackfill:null,_imaSDKLoaded:false,_currentBitrateKbs:750,_loadVideoTimeout:NaN,_adsErrorForNextCheckAd:false,_adsRequestInProgress:false,_slotPending:false,_signedUpForAd:false,_setAdsCalled:false,_delayedAdRequest:null,_podTimeObject:null,_aggregatePodTimeCompleted:0,_playheadTimer:0,_abr:false,_contentClip:null,_sourceClip:null,_adClip:null,_ad:null,_adPlaying:false,_adSkipped:false,_resumeContentAfterSkipFix:false,_overlayShowing:false,_adCompleted:false,_playlist:null,_podIndex:1,_mediaLoadStart:false,_linearAdStarted:false,_currentTimeAggregate:NaN,_usedMidrollCuePoints:[],_playlistClipsLength:0,_adStartingUp:false,_contentComplete:false,_releasePlaylist:null,_adErrorListener:null,_playhead:{currentTime:0,duration:NaN},_noopPlayer:null,_isFullScreen:false,_nextMidrollCuePointTime:NaN,_userInitiatedPlayback:false,_isMuted:false,_floatingControlsTriggerLayer:null,_showingControls:false,_floatRegionId:null,_isCustomPlayback:false,_videoProxy:null,_playListenerAdded:false,_proxyPlayListener:null,_proxyPausedListener:null,constructor:function(){this._adContainer=document.createElement("div");
this._adContainer.style.position="relative"
},initialize:function(a){var b=this;
this._lo=a;
this._controller=this._lo.controller;
var c=new Date();
this.log("\n\ninitialize "+c.toLocaleDateString()+" "+c.toLocaleTimeString()+"\n\n");
this._hosts=this.extractLoadVars([a.vars.host,a.vars.hosts],[this.DEFAULT_HOST]);
this.log("\thosts: "+this._hosts?this._hosts:"no host or hosts loadvar applied.");
this._mimeTypes=this.extractLoadVars([a.vars.mimeType,a.vars.mimeTypes],null);
this.log("\tmimeTypes: "+this._mimeTypes?this._mimeTypes:"no mimeType or mimeTypes loadvar applied.");
this._loadVideoTimeout=this.extractLoadVars([a.vars.loadVideoTimeout],NaN);
if(this._lo.vars.imaJsUrl){this._imaJsUrl=this._lo.vars.imaJsUrl
}if(this._lo.vars.competitiveExclusion){this._competitiveExclusion=this._lo.vars.competitiveExclusion
}if(this._lo.vars.companionBackfill){this._companionBackfill=this._lo.vars.companionBackfill
}if(this._lo.vars.uniqueAds=="false"){this._uniqueAds=false
}this._controller.addEventListener("OnReleaseStart",function(){b._onReleaseStart.apply(b,arguments)
});
this._controller.addEventListener("OnReleaseEnd",function(){b._onReleaseEnd.apply(b,arguments)
});
this._controller.addEventListener("OnMediaStart",function(){b._onMediaStart.apply(b,arguments)
});
this._controller.addEventListener("OnMediaEnd",function(){b._onMediaEnd.apply(b,arguments)
});
this._controller.addEventListener("OnShowFullScreen",function(){b._onShowFullScreen.apply(b,arguments)
});
this._controller.addEventListener("OnStreamSwitched",function(){b._onStreamSwitched.apply(b,arguments)
});
this._controller.addEventListener("OnMediaLoadStart",function(){b._onMediaLoadStart.apply(b,arguments)
});
this._controller.addEventListener("OnMediaAreaChanged",function(){b._onMediaAreaChanged.apply(b,arguments)
});
this._controller.addEventListener("OnOverlayAreaChanged",function(){b._onOverlayAreaChanged.apply(b,arguments)
});
this._controller.addEventListener("OnShowControls",function(){b._onShowControls.apply(b,arguments)
});
this._proxyPlayListener=function(){b.onProxyPlay()
};
this._noopPlayer=new $pdk.plugin.doubleclick.PdkNoopPlayer(this._controller,function(){b._mediaSoundLevelSet.apply(b,arguments)
},function(){b._mediaMuteSet.apply(b,arguments)
},function(){b._mediaPauseSet.apply(b,arguments)
});
this._controller.registerAdPlugIn(this);
if(!this.checkIMAExists()){tpLoadScript(this._imaJsUrl,function(){b.onIMASDKLoaded()
})
}else{this.log("\tGIMA Version: "+google.ima.VERSION+" exists in DOM already");
this.initializeSDK()
}},onProxyPaused:function(a){this.log("onProxyPaused");
if(!this._adPlaying){this.log("\tno ad playing, so exiting");
return
}if(isNaN(this._videoProxy.duration)){this.log(" videoProxy.duration isNaN, so exiting");
return
}this.log(" videoProxy.ended: "+this._videoProxy.ended);
this.log(" videoProxy.duration ("+this._videoProxy.duration+"), vp.currentTime ("+this._videoProxy.currentTime+")");
if(this._videoProxy.ended||Math.abs(this._videoProxy.currentTime-this._videoProxy.duration)<0.25){this.log(" videoProxy.ended and currentTime is close to duration, so we must be done");
return
}this.log("dispatching onMediaPause");
this._controller.dispatchEvent("OnMediaPause",{globalDataType:"com.theplatform.pdk.data::MediaPause",clip:this._adClip,userInitiated:false});
this.stopProgressTimer();
if(!this._playListenerAdded){this._videoProxy.addEventListener("play",this._proxyPlayListener);
this._playListenerAdded=true
}},onProxyPlay:function(a){this.log("onProxyPlay");
this._videoProxy.removeEventListener("play",this._proxyPlayListener);
this._playListenerAdded=false;
if(!this._adPlaying){this.log("\tno ad playing, so exiting");
return
}this.log("dispatching OnMediaUnpause");
this._controller.dispatchEvent("OnMediaUnpause",{globalDataType:"com.theplatform.pdk.data::MediaPause",clip:this._adClip,userInitiated:true});
this.startProgressTimer()
},_resumeContentAfterSkip:function(){if(!this._adPlaying&&this._resumeContentAfterSkipFix){this.log("resuming content due to Skip Ad pause");
this._controller.pause(false);
this._resumeContentAfterSkipFix=false
}},_onMediaPlaying:function(b){if(!this._adPlaying){var a=b.data;
if(!isNaN(this._nextMidrollCuePointTime)){this._playhead.currentTime=Math.min(this._nextMidrollCuePointTime,this._playhead.currentTime+0.2)
}}},logCurrentTime:function(){var a=this;
setInterval(function(){a.log("playhead.currentTime: "+a._playhead.currentTime+", playhead.duration: "+a._playhead.duration+", cta: "+a._currentTimeAggregate)
},1000)
},extractLoadVars:function(d,b){var c=[];
this.log(".extractLoadVars: "+d);
for(var f=d.length-1;
f>=0;
f--){var e=d[f];
this.log("\tv: "+e);
if(!e){continue
}if(e.indexOf(",")>-1){c=c.concat(e.split(","))
}else{c.push(e)
}}if(c.length==0){return b
}return c
},checkIMAExists:function(){return !(typeof google=="undefined"||typeof google.ima=="undefined"||typeof google.ima.AdDisplayContainer=="undefined")
},_onUserInitiatedPlayback:function(a){if(this._userInitiatedPlayback){return
}this._userInitiatedPlayback=true;
this.log("UserInitiatedPlayback!!  creating ad display container and initializing.");
this._createAdDisplayContainer();
this._adDisplayContainer.initialize()
},onIMASDKLoaded:function(){this.log("onIMASDKLoaded: google.ima loaded; version["+google.ima.VERSION+"]",tpConsts.INFO);
this.initializeSDK()
},initializeSDK:function(){this._imaSDKLoaded=true;
var a=document.getElementById(this._controller.id+".plugins");
a.appendChild(this._adContainer);
this._initAdLoader();
var b=this;
this._controller.addEventListener("OnPlayButtonClicked",function(){b._onUserInitiatedPlayback.apply(b,arguments)
});
this._controller.addEventListener("OnSetRelease",function(){b._onUserInitiatedPlayback.apply(b,arguments)
});
this._controller.addEventListener("OnSetReleaseUrl",function(){b._onUserInitiatedPlayback.apply(b,arguments)
});
this._controller.addEventListener("OnSetSmil",function(){b._onUserInitiatedPlayback.apply(b,arguments)
})
},_createAdDisplayContainer:function(){this.log("createAdDisplayContainer");
if(!this._adDisplayContainer){this.log("\talways pass in video proxy");
this._videoProxy=this._controller.getVideoProxy();
this._adDisplayContainer=new google.ima.AdDisplayContainer(this._adContainer,this._videoProxy,null)
}},stopProgressTimer:function(){if(this._playheadTimer>0){this.log("timer cleared!");
clearInterval(this._playheadTimer);
this._playheadTimer=0
}},startProgressTimer:function(){if(this._playheadTimer==0){this.log("start timer");
var a=this;
this._playheadTimer=setInterval(function(){a._playheadTick.apply(a,arguments)
},166)
}},useCustomPlayback:function(){var d=false;
var c=navigator.userAgent;
this.log("userAgent: "+c);
this.log("customPlayback for ipod, iphone, ipad and android 0-3, android 4 stock browser");
if(c.match(/(ipod)|(iphone)|(ipad)|(android [0-3])/i)){d=true
}else{var b=c.indexOf("Android")>=0;
var a=parseInt((/webkit\/([0-9]+)/i.exec(navigator.appVersion)||0)[1],10)||void 0;
var e=b&&a<=534&&navigator.vendor.indexOf("Google")==0;
this.log("isNativeAndroid: "+e);
d=e
}return d
},dontPlayMidrolls:function(){return !!navigator.userAgent.match(/(android [0-3])/i)
},_supportsAdRules:function(){var b=navigator.userAgent;
this.log("userAgent: "+b);
if(matchMedia("only screen and (max-device-width: 480px)").matches){this.log("phone! doesn't support ad rules");
return false
}if(tpIsIOS()){var a=(navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
if(b.match(/iPad/i)&&parseInt(a[1])>=6){return true
}else{return false
}}return true
},_rewriteAdRuleUrlToTag:function(a){if(a.match(/ad_rule=1/g)){return a.replace(/ad_rule=1/,"ad_rule=0")
}return a
},_onShowFullScreen:function(a){this._isFullScreen=a.data
},_initAdLoader:function(){this.log("initAdLoader");
if(!this._imaSDKLoaded){return
}this._createAdDisplayContainer();
if(!this._adsLoader){this.log("\tcreating AdsLoader");
var b=this;
this._adsLoader=new $pdk.plugin.doubleclick.AdsLoader(new google.ima.AdsLoader(this._adDisplayContainer));
this._adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR,function(c){b._onAdError.apply(b,arguments)
},false);
this._adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,function(c){b._onAdsManagerLoaded.apply(b,arguments)
},false);
var a=this._adsLoader.getSettings();
a.setAutoPlayAdBreaks(false);
if(this._companionBackfill){a.setCompanionBackfill(this._companionBackfill)
}a.setPlayerType("theplatform/pdk");
a.setPlayerVersion($pdk.version.major+"."+$pdk.version.minor+"."+$pdk.version.revision);
if(this._delayedAdRequest){this.log("making delayed ad request...");
this._requestAds(this._delayedAdRequest);
this._delayedAdRequest=null
}}},_onAdsManagerLoaded:function(f){this.log("\n\nIMA3 AdsManager loaded, slotPending > "+this._slotPending+"\n\n");
this._adsRequestInProgress=false;
var b=new google.ima.AdsRenderingSettings();
b.autoAlign=true;
b.bitrate=this._currentBitrateKbs;
b.useStyledNonLinearAds=true;
b.restoreCustomPlaybackStateOnAdBreakComplete=false;
if(!isNaN(this._loadVideoTimeout)){b.loadVideoTimeout=this._loadVideoTimeout
}if(this._mimeTypes&&this._mimeTypes.length>0){b.mimeTypes=this._mimeTypes
}this._playhead.currentTime=0;
var g=f.getAdsManager(this._playhead,b);
this.log("isCustomPlaybackUsed: "+g.isCustomPlaybackUsed());
this._adsManager=new $pdk.plugin.doubleclick.AdsManager(g);
if(this._adsManager){this._isCustomPlayback=this._adsManager.isCustomPlaybackUsed();
this._noopPlayer.usingVideoProxy(this._isCustomPlayback);
var h=(this._isMuted?0:1);
this.log("adsManagerVolumeSetting: "+h);
this._adsManager.setVolume(h);
var d=this;
this._adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED,function(i){d._onAllAdsCompleted.apply(d,arguments)
});
this._adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR,function(i){d._onAdError.apply(d,arguments)
});
this._adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,function(i){d._onContentPauseRequested.apply(d,arguments)
});
this._adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,function(i){d._onContentResumeRequested.apply(d,arguments)
});
this._adsManager.addEventListener(google.ima.AdEvent.Type.STARTED,function(i){d._onAdStarted.apply(d,arguments)
});
this._adsManager.addEventListener(google.ima.AdEvent.Type.PAUSED,function(i){d._onAdPaused.apply(d,arguments)
});
this._adsManager.addEventListener(google.ima.AdEvent.Type.RESUMED,function(){d._onAdResumed.apply(d,arguments)
});
this._adsManager.addEventListener(google.ima.AdEvent.Type.RESUME,function(){d._onAdResume.apply(d,arguments)
});
this._adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE,function(i){d._onAdCompleted.apply(d,arguments)
});
this._adsManager.addEventListener(google.ima.AdEvent.Type.DURATION_CHANGED,function(i){d._onAdDurationChanged.apply(d,arguments)
});
this._adsManager.addEventListener(google.ima.AdEvent.Type.REMAINING_TIME_CHANGED,function(i){d._onAdRemainingChanged.apply(d,arguments)
});
this._adsManager.addEventListener(google.ima.AdEvent.Type.CLICK,function(i){d._onAdClicked.apply(d,arguments)
});
this._adsManager.addEventListener(google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED,function(i){d._onAdSkippableStateChanged.apply(d,arguments)
});
this._adsManager.addEventListener(google.ima.AdEvent.Type.LOG,function(i){d.log.apply(d,arguments)
});
this._adsManager.addEventListener(google.ima.AdEvent.Type.SKIPPED,function(i){d._onAdSkipped.apply(d,arguments)
});
this.log("AdsManager.cuePoints: "+this._adsManager.getCuePoints().join(", "));
var a=this._adsManager.getCuePoints();
if(a&&a.length>0){this._strategy=new $pdk.plugin.doubleclick.AdRulesStrategy(function(){return d._haveCuePointForAdBreak.apply(d,arguments)
},this._adsLoader,this._controller);
this._setCurrentTimeFromAdClip(this._getFirstDoubleclickAdClip(this._releasePlaylist));
this._updatePlayhead(this._getNextDoubleClickTime())
}else{this._strategy=new $pdk.plugin.doubleclick.VastStrategy(function(i){d._requestAds.apply(d,arguments)
},this._adsLoader,this._controller)
}this._strategy.setAdsManager(this._adsManager);
var c=this._controller.getMediaArea();
this._adsManager.init(c.width,c.height,this._getViewMode());
if(this._slotPending){this.log("slot pending, so try to play ad");
this._strategy.preparePod(this._sourceClip.baseClip.URL);
if(!this._strategy.playNextPod()){this._bypassAdBreak()
}}}else{this.log("AdsManager is null!",tpConsts.ERROR)
}},_getNextDoubleClickTime:function(){this.log("getNextDoubleClickTime");
var d=NaN;
var a=this._adsManager?this._adsManager.getCuePoints():null;
if(a&&a.length>0&&!isNaN(this._currentTimeAggregate)){if(this._currentTimeAggregate==0){if(a[0]==0){d=0
}}else{var b;
for(var c=0;
c<a.length;
c++){b=a[c]*1000;
if(b==0){continue
}if(b<0){d=1;
break
}if(this._usedMidrollCuePoints.indexOf(b)==-1){d=b;
break
}}}}this.log("t--> "+d);
return d
},_haveCuePointForCheckAd:function(){var a="";
var b=this._getNextDoubleClickTime();
this._updatePlayhead(b);
var c;
if(isNaN(b)){a+="NaN for t\n";
c=false
}else{if(b==0){a+="valid pre roll\n";
c=true
}else{if(b==1){c=!!(this._contentComplete&&this._adsManager.getCuePoints().indexOf(-1)>=0)
}else{var d=(this._usedMidrollCuePoints.indexOf(b)==-1);
if(!d){a+="cue point has been used \n";
c=false
}else{a+="using cue point ("+b+")\n";
c=true
}}}}a+="t --> "+b+" and return "+c;
this.log(a);
return c
},_haveCuePointForAdBreak:function(){var a=this._haveCuePointForCheckAd();
if(!a){this.warn("Missing ad rule cue point for ad break!")
}this.log("haveCuePointForAdBreak: "+a);
return a
},_requestAds:function(a){this.log("\nabout to requestAds: "+a+"\n");
if(this.isHtml5Video()&&this.isUnsupportedIE()){this.log("We don't load ads for IMA HTML SDK in Internet Explorer < 11 because it is not supported.");
return
}if(!this._adsLoader){this.log(" .... IMA SDK not ready .... ");
this._delayedAdRequest=a;
return
}this._cleanUp();
this._adsErrorForNextCheckAd=false;
var d=this._controller.getMediaArea();
var c=this._controller.getOverlayArea();
var b=new google.ima.AdsRequest();
if(a.match(/ad_rule=1/g)){this.log("\tWe are an ad rule. Doing check to see if rules are supported.");
if(!this._supportsAdRules()){this.log("\tre writing ad rule to ad tag");
a=this._rewriteAdRuleUrlToTag(a)
}else{this.log("\tad rules supported, so no change")
}}b.adTagUrl=a;
b.linearAdSlotWidth=d.width;
b.linearAdSlotHeight=d.height;
b.nonLinearAdSlotWidth=c.width;
b.nonLinearAdSlotHeight=c.height;
this._adsRequestInProgress=true;
this.log("calling adsLoader.requestAds with url: "+a);
this._adsLoader.requestAds(b)
},_cleanUp:function(){this.log("cleanup");
if(this._strategy){this._strategy.destroy()
}this._strategy=null;
if(this._adsManager){this.log("*** calling adsManager.destroy() ***");
this._adsManager.destroy()
}else{this.log("no ads manager!")
}this._adsManager=null;
this._slotPending=false;
this._signedUpForAd=false;
this._setAdsCalled=false;
this._adsRequestInProgress=false;
this._contentComplete=false;
this._adCompleted=false;
this._usedMidrollCuePoints=[];
this._nextMidrollCuePointTime=NaN;
this._overlayShowing=false;
this._positionFloatingControlsFixLayer();
this.stopProgressTimer()
},_getViewMode:function(){return this._isFullScreen?google.ima.ViewMode.FULLSCREEN:google.ima.ViewMode.NORMAL
},_onOverlayAreaChanged:function(b){if(!this._strategy){return
}var a=b?b.data:null;
this.log("onOverlayAreaChanged");
if(this._isValidArea(a)&&this._adsManager&&this._strategy.isOverlay()){this._adsManager.resize(a.width,a.height,this._getViewMode());
this._positionAdsContainer(a)
}},_onMediaAreaChanged:function(b){if(!this._strategy){return
}var a=b?b.data:null;
this.log("onMediaAreaChanged");
if(this._isValidArea(a)&&this._adsManager&&!this._strategy.isOverlay()){this._adsManager.resize(a.width,a.height,this._getViewMode());
this._positionAdsContainer(a)
}},_isValidArea:function(a){return !!(a&&a.width>0&&a.height>0)
},_positionAdsContainer:function(a){if(this._adsManager&&a){this.log("positioning adContainer");
this._adContainer.style.left=a.x+"px";
this._adContainer.style.top=a.y+"px";
this._positionFloatingControlsFixLayer()
}},_positionFloatingControlsFixLayer:function(){if(this._floatingControlsTriggerLayer){var b={};
if(this._overlayShowing){var a=this._controller.getOverlayArea();
b.x=a.x;
b.y=a.y;
b.width=a.width;
b.height=a.height-(this._ad?this._ad.getHeight():0)
}else{b=this._controller.getMediaArea()
}this._floatingControlsTriggerLayer.style.left=b.x+"px";
this._floatingControlsTriggerLayer.style.top=b.y+"px";
this._floatingControlsTriggerLayer.style.width=b.width+"px";
this._floatingControlsTriggerLayer.style.height=b.height+"px"
}},_onShowControls:function(a){this.log("onShowControls: visible("+a.data.visible+") regionId("+a.data.regionId+")");
if(!this._floatRegionId&&a.data.regionId.indexOf("Float")>0){this._floatRegionId=a.data.regionId
}if(this._floatRegionId&&a.data.regionId==this._floatRegionId){this._showingControls=a.data.visible;
if(this.applyFloatingControlsFix()){this._showFloatingControlsTriggerLayer()
}}},_showFloatingControlsTriggerLayer:function(){if(!this._floatingControlsTriggerLayer){return
}if(!this._adPlaying&&!this._showingControls){this._floatingControlsTriggerLayer.style.display="block";
this._positionFloatingControlsFixLayer()
}else{this._floatingControlsTriggerLayer.style.display="none"
}},_onStreamSwitched:function(a){this._currentBitrateKbs=a.data.newFileInfo.bitrate/1000;
this._abr=true
},_onMediaLoadStart:function(c){this.log("onMediaLoadStart: "+c.data.isAd+c.data.baseClip.URL);
if(this._isCustomPlayback&&!this._proxyPausedListener){var b=this;
this._proxyPausedListener=function(){b.onProxyPaused()
};
this._videoProxy.addEventListener("pause",this._proxyPausedListener)
}var a=c.data;
if(a&&a.baseClip.isAd){this._adClip=a;
this.log("   Ad: URL is "+this._adClip.URL+", clipIndex = "+this._adClip.clipIndex);
if(this._adClip.streamType=="empty"&&this._adClip.baseClip.provider=="DFP"){this._mediaLoadStart=true;
this._startAdNoOpClip()
}}else{this._contentClip=a;
this.log("   Content: URL is "+this._contentClip.URL+", clipIndex = "+this._contentClip.clipIndex);
this._setCurrentBitrateFromBaseClip(this._contentClip.baseClip)
}},_setCurrentBitrateFromBaseClip:function(a){if(!this._abr&&a&&!a.isAd){if(a.bitrate){this._currentBitrateKbs=a.bitrate/1000
}else{this._currentBitrateKbs=750
}}},_onMediaStart:function(b){this.log("onMediaStart: isAd:"+b.data.baseClip.isAd+", url:"+b.data.baseClip.URL);
this._adPlaying=b.data.baseClip.isAd;
if(this.applyFloatingControlsFix()){this.log("Applying floating controls fix\n");
if(!this._floatingControlsTriggerLayer){this._createFloatingControlsTriggerLayer()
}if(!this._adPlaying){this._floatingControlsTriggerLayer.style.display="block";
this._positionFloatingControlsFixLayer()
}else{this._floatingControlsTriggerLayer.style.display="none"
}}var a=this;
setTimeout(function(){a._resumeContentAfterSkip()
},1)
},_createFloatingControlsTriggerLayer:function(){var a=document.createElement("div");
a.className=this._controller.id+".imaFloatingControlsTriggerLayer";
a.style.zIndex=9999;
a.style.position="absolute";
this._positionFloatingControlsFixLayer();
this._floatingControlsTriggerLayer=a;
document.getElementById(this._controller.id).appendChild(this._floatingControlsTriggerLayer)
},_onMediaEnd:function(a){this.log("onMediaEnd: "+a.data.baseClip.URL);
if(a.data.baseClip.isAd){this._adPlaying=false;
this._mediaLoadStart=false;
this._linearAdStarted=false;
this._adClip=null;
if(!this._adCompleted&&this._adsManager){this.log("calling skip on ads manager");
this._adsManager.skip()
}}},_onReleaseStart:function(d){this.log("\n***************************\n*** onReleaseStart ***\n***************************\n");
this._releasePlaylist=d.data;
this.log("playhead.duration set: "+this._releasePlaylist.release.duration);
this._playlistClipsLength=this._releasePlaylist.clips.length;
this._playhead.duration=this._releasePlaylist.release.duration/1000;
var f;
for(var a=0;
a<this._releasePlaylist.baseClips.length;
a++){var c=this._releasePlaylist.baseClips[a];
if(!c.isAd){f=c;
break
}}var b=this._getFirstDoubleclickAdClip(this._releasePlaylist);
if(f){this._setCurrentBitrateFromBaseClip(f)
}this._podIndex=1;
if(b){this._requestAds(b.baseClip.URL)
}},_onReleaseEnd:function(a){this.log("\n*** onReleaseEnd ***\n");
this._cleanUp()
},_getFirstDoubleclickAdClip:function(d){var b=null;
for(var a=0;
a<d.clips.length;
a++){var c=d.clips[a];
if(c.baseClip.isAd&&this.isAd(c.baseClip)){b=c;
break
}}return b
},_isDoubleclickUrl:function(a){var c=false;
for(var b=0;
b<this._hosts.length;
b++){var d=this._hosts[b];
this.log("URL: "+a+" == "+d);
if(a&&a.indexOf(d)>=0){c=true;
break
}}return c
},_isRelative:function(a){if(!a||a==""){return false
}else{if(a.indexOf("urn:")==0){return false
}else{var b=a.indexOf("://");
return b>6||b<0
}}},isHtml5Video:function(){return true
},isUnsupportedIE:function(){return $pdk.isIE&&!$pdk._browserCheck([{browser:"internet explorer",version:11}])
},applyFloatingControlsFix:function(){var a=!!navigator.userAgent.match(/iPad/i);
var b=!!navigator.userAgent.match(/android/i);
return this._isCustomPlayback&&this._floatRegionId&&(a||b)
},isIpad:function(){return !!(navigator.userAgent.match(/iPad/i))
},isAd:function(a){return !!(this._isDoubleclickUrl(a.URL)||(this._isRelative(a.URL)&&this._isDoubleclickUrl(a.URL)))
},checkAd:function(a){this.log("start checkAd");
if(this.isAd(a.baseClip)){this._signedUpForAd=true;
if(this.shouldBypassAdBreak(a)){this.warn("Bypassing this ad break.");
this._bypassAdBreak();
return true
}this._setCurrentTimeFromAdClip(a);
if(this._isContentComplete(a)){this.log("contentComplete");
this._adsLoader.contentComplete();
this._contentComplete=true
}if(this._strategy){this._strategy.preparePod(a.baseClip.URL)
}else{if(this.needToRequestAds()){this._requestAds(a.baseClip.URL)
}}this._beginAdExperience(a);
this.log("checkAd: true");
return true
}else{this.log("checkAd: false");
return false
}},needToRequestAds:function(){return(!this._adsRequestInProgress&&!this._adsErrorForNextCheckAd)
},shouldBypassAdBreak:function(a){var b=false;
if(this.isHtml5Video()){if(this.isUnsupportedIE()){b=true;
this.log("Bypass reason: IMA3 HTML5 does not support Internet Explorer < 11.")
}else{if(this.dontPlayMidrolls()&&this.isMidroll(a)){b=true;
this.log("Bypass reason: Android devices from an OS less than version 4 have trouble playing midrolls.")
}}}return b
},isMidroll:function(d){var c=false;
var b=d.clipIndex;
var e=this._releasePlaylist.clips.length;
var k=!!(b==0||b==e-1);
if(!k){for(var f=b-1;
f>-1;
f--){var h=this._releasePlaylist.clips[f];
if(!h.baseClip.isAd){c=true;
break
}}if(c){for(var j=b+1;
j<e;
j++){var a=this._releasePlaylist.clips[j];
if(!a.baseClip.isAd){c=true;
break
}c=false
}}}return c
},_beginAdExperience:function(b){this.log("beginAdExperience");
this.stopProgressTimer();
this._slotPending=false;
this._podTimeObject=null;
this._aggregatePodTimeCompleted=0;
this._contentClip=null;
this._adClip=null;
this._ad=null;
this._adPlaying=false;
this._playlist=null;
this._sourceClip=b;
if(this._adsManager){this.log("\tready");
if(!this._strategy.playNextPod()){this._bypassAdBreak()
}}else{if(this._adsErrorForNextCheckAd){this.warn("\tDue to error, bailing on ad break. Async.");
var a=this;
setTimeout(function(){a.log("setAds(null) called due to error.");
a._controller.setAds(null)
},1);
this._setAdsCalled=true;
this._adsErrorForNextCheckAd=false
}else{this.log("\tnot ready");
this._slotPending=true
}}this.log("\tslotPending: "+this._slotPending+", adsErrorForNextCheckAd: "+this._adsErrorForNextCheckAd)
},_isContentComplete:function(a){return(a.clipIndex+1==this._playlistClipsLength)
},_bypassAdBreak:function(){var a=this._controller;
var c=this;
setTimeout(function b(){tpDebug("Bypassing ad break. AdsManager doesn't have any ads for this ad break.");
var d={baseClips:[],clips:[],globalDataType:"com.theplatform.pdk.data::Playlist"};
a.setAds(d);
c._setAdsCalled=true
},1)
},_setCurrentTimeFromAdClip:function(c){if(!this._adPlaying&&c.baseClip.isAd){if(c.clipIndex>0){var d=this._releasePlaylist;
var b=c.clipIndex-1;
while(b>=0){var a=d.clips[b];
if(!a.baseClip.isAd){this._currentTimeAggregate=a.endTime;
break
}b--
}}else{this._currentTimeAggregate=0
}}this.log("setting current time aggregrate to: "+this._currentTimeAggregate)
},_createPlaylist:function(b){var d={baseClips:[],clips:[],globalDataType:"com.theplatform.pdk.data::Playlist"};
var c;
for(var a=0;
b&&a<b.length;
a++){this.log("createPlaylistFromPodIds(): add one clip:"+b[a]);
c=this._createAdClip(b[a]);
d.baseClips.push(c.baseClip);
d.clips.push(c.clip)
}return d
},_createAdClip:function(d){this.log("createAdClip("+d+")");
var c={};
c.globalDataType="com.theplatform.pdk.data::BaseClip";
c.URL=this._isCustomPlayback?"ImaCustomPlayback_"+d:"";
c.id=d+"_"+Date.now();
c.provider="DFP";
c.isAd=true;
c.noSkip=true;
var b=com.theplatform.pdk.SelectorExported.getInstance(this._controller.scopes.toString()).parseClip(c);
b.streamType="empty";
b.adPattern=this._sourceClip.adPattern;
b.clipIndex=this._sourceClip.clipIndex;
b.baseClip.adType=this._sourceClip.baseClip.adType;
if(this._ad&&this._ad.getDuration()<0){b.hasOverlayLayer=true
}var a={};
a.clip=b;
a.baseClip=c;
return a
},_mediaSoundLevelSet:function(a){this.log("mediaSoundLevelSet "+a);
if(!this._adsManager){return
}this._adsManager.setVolume(a/100)
},_mediaMuteSet:function(a){this.log("mediaMuteSet "+a);
if(!this._adsManager){return
}this._isMuted=a;
if(a){this._adsManager.setVolume(0)
}else{this._adsManager.setVolume(1)
}},_mediaPauseSet:function(a){this.log("mediaPauseSet "+a);
if(!this._adsManager||!this._adPlaying){this.log("no ads mgr ("+!!this._adsManager+") or ad playing is false ("+this._adPlaying+")");
return
}if(a){this.log("pause!");
this.stopProgressTimer();
this._adsManager.pause()
}else{this.log("resume!");
this.startProgressTimer();
this._adsManager.resume()
}this._noopPlayer.mediaPause(a,this._adClip)
},_startAdNoOpClip:function(){if(!this._playlist){var c="DFP:"+this._podIndex+":1";
this._podIndex++;
this._playlist=this._createPlaylist([c]);
this.log("  setAds");
this._controller.setAds(this._playlist);
this._setAdsCalled=true;
return
}if(!this._mediaLoadStart||!this._linearAdStarted){return
}if(this._ad.getDuration()>-1){this._adClip.length=this._ad.getDuration()*1000;
this._adClip.mediaLength=this._ad.getDuration()*1000
}var b=this;
setTimeout(function a(){b._onMediaStartReady.apply(b,arguments)
},1)
},_onMediaStartReady:function(){this.log("  mediaStarts [async 1ms]");
var a=!this._adsManager.getAdSkippableState();
this._adClip.baseClip.noSkip=this._sourceClip.baseClip.noSkip=a;
if(!this._adPlaying){this._noopPlayer.mediaStarts(this._adClip)
}this._adStartingUp=true;
this._updateAdPlaylist(this._ad);
this._updateAdPodTime(this._ad);
this.startProgressTimer()
},_updateUsedCuePoints:function(b){if(this._adsManager&&this._adsManager.getCuePoints()&&this._adsManager.getCuePoints().length){var a=this._adsManager.getCuePoints()[b]*1000;
if(a>0&&this._usedMidrollCuePoints.indexOf(a)==-1){this._usedMidrollCuePoints.push(a);
this.log("adding cue point ("+a+") to used mid roll cue points; now used these: "+this._usedMidrollCuePoints.join(","))
}}},_onAdStarted:function(a){this.logEvent(a);
this._ad=a.getAd();
this.log("podIndex: "+this._ad.getAdPodInfo().getPodIndex());
this._updateUsedCuePoints(this._ad.getAdPodInfo().getPodIndex());
if(this._ad.isLinear()){this._overlayShowing=false;
this._startLinearAd(this._ad)
}else{this.log("overlay ad started");
this._overlayShowing=true;
this._startNonLinearAd(this._ad)
}this._positionFloatingControlsFixLayer()
},_startLinearAd:function(a){this._linearAdStarted=true;
this._adCompleted=false;
this._adSkipped=false;
this._startAdNoOpClip();
this.log("startLinearAd ("+this._ad.getAdPodInfo().getAdPosition()+" / "+this._ad.getAdPodInfo().getTotalAds()+") "+this._adsManager.getRemainingTime());
var b=this._controller.getMediaArea();
if(this._isValidArea(b)&&this._adsManager){this._adsManager.resize(b.width,b.height,this._getViewMode());
this._positionAdsContainer(b)
}},_startNonLinearAd:function(a){var c={baseClips:[],clips:[],globalDataType:"com.theplatform.pdk.data::Playlist"};
this._controller.setAds(c);
this._setAdsCalled=true;
var b=this._controller.getOverlayArea();
if(this._isValidArea(b)&&this._adsManager){this._adsManager.resize(b.width,b.height,this._getViewMode());
this._positionAdsContainer(b)
}},_onAdPaused:function(a){this.logEvent(a)
},_onAdResumed:function(a){this.logEvent(a)
},_onAdResume:function(a){this.logEvent(a)
},_onAdRemainingChanged:function(a){this.logEvent(a)
},_onAdClicked:function(a){this.logEvent(a);
if(a.getAd().isLinear()){this.stopProgressTimer();
this._noopPlayer.mediaPause(true,this._adClip);
this._adsManager.pause()
}else{this._controller.pause(true)
}},_onAdSkipped:function(a){this.logEvent(a);
this._adSkipped=true;
if(a.getAd().isLinear()){this._endLinearAd(a)
}},_onAdCompleted:function(a){this.logEvent(a);
if(a.getAd().isLinear()){this._endLinearAd(a)
}},_endLinearAd:function(d){this.log("endLinearAd");
var a=!this._adPlaying;
this._adCompleted=true;
this._adPlaying=false;
var c=d.getAd();
var b=c.getAdPodInfo();
var f=(b.getAdPosition()==b.getTotalAds());
if(!f){if(this._adClip){this._noopPlayer.mediaEnds(this._adClip)
}}else{this.log("last clip complete, letting contentResumeRequested end clip")
}if(this._adSkipped&&this.isIpad()&&!a&&this.isMidroll(this._sourceClip)){this._resumeContentAfterSkipFix=true
}this.stopProgressTimer()
},_onAdDurationChanged:function(b){this.logEvent(b);
var a=b.getAd();
if(a&&this._podTimeObject&&a.getDuration()>-1){this._adClip.length=a.getDuration()*1000;
this._adClip.mediaLength=a.getDuration()*1000;
this._podTimeObject.duration=a.getDuration();
this._podTimeObject.durationAggregate=a.getDuration()*1000
}},_onAdSkippableStateChanged:function(a){this._adClip.baseClip.noSkip=false;
this._controller.updateClip(this._adClip);
this.logEvent(a)
},_onContentResumeRequested:function(a){this.logEvent(a);
if(this._isInternalIMAError()){this._adCompleted=true;
this._onAdError()
}this._updatePlayhead(this._getNextDoubleClickTime());
if(this._ignoreContentResume()){return
}this.stopProgressTimer();
if(this._adClip){this._noopPlayer.done(this._adClip)
}},_isInternalIMAError:function(){return !!(this._strategy.getAdsManagerStarted()&&!this._strategy.isOverlay()&&!this._adClip&&!this._adSkipped)
},_updatePlayhead:function(a){this._playhead.currentTime=isNaN(a)?0:a/1000;
this.log("playhead current time updated to "+this._playhead.currentTime)
},_setNextMidrollCuepointTime:function(){if(!this._adsManager||!this._adsManager.getCuePoints()||this._adsManager.getCuePoints().length){var a=this._adsManager.getCuePoints();
for(var b=0;
b<a.length;
b++){var c=a[b]*1000;
if(c>0){if(this._usedMidrollCuePoints.indexOf(c)==-1){this._nextMidrollCuePointTime=c;
this.log("nextMidrollCuePointTime set to "+this._nextMidrollCuePointTime);
break
}}}}else{this._nextMidrollCuePointTime=NaN
}},_onContentPauseRequested:function(a){this.logEvent(a)
},_ignoreContentResume:function(){return !this._adCompleted
},_updateAdPlaylist:function(d){if(d.getAdPodInfo().getTotalAds()!=this._playlist.clips.length){this.log("updating ad Playlist");
var a=d.getAdPodInfo().getTotalAds();
var e=this._playlist.clips.length;
for(var c=e;
c<a;
c++){var b=this._createAdClip("DFP:"+c+":"+a);
this._playlist.clips.push(b.clip);
this._playlist.baseClips.push(b.baseClip)
}this._controller.updatePlaylist(this._playlist)
}},_updateAdPodTime:function(a){if(!this._podTimeObject){this._podTimeObject={}
}if(!this._adsManager||!a){return
}var c=Math.max(0,this._adsManager.getRemainingTime());
var d=a.getDuration();
var b=Math.max(0,Math.min(d,d-c));
if(c<0||d<1||b<0){this.log("Bailing! One of these is not a reasonable value: adRemainingTime ("+c+"), adDuration ("+d+"), adCurrentTime ("+b+"), adStartingUp ("+this._adStartingUp+")",tpConsts.ERROR);
return
}if(this._adStartingUp&&c==0){b=0
}else{this._adStartingUp=false
}this._podTimeObject.duration=this._aggregatePodTimeCompleted+d*1000;
this._podTimeObject.currentTime=this._aggregatePodTimeCompleted+b*1000;
this._podTimeObject.percentComplete=this._podTimeObject.currentTime/this._podTimeObject.duration;
this._podTimeObject.isAggregate=false;
this._podTimeObject.durationAggregate=this._aggregatePodTimeCompleted+d*1000;
this._podTimeObject.currentTimeAggregate=this._aggregatePodTimeCompleted+b*1000;
this._podTimeObject.percentCompleteAggregate=this._podTimeObject.currentTimeAggregate/this._podTimeObject.durationAggregate
},_playheadTick:function(a){this._updateAdPodTime(this._ad);
if(this._podTimeObject.currentTimeAggregate>=0){this._noopPlayer.mediaPlaying({currentTime:this._podTimeObject.currentTimeAggregate,duration:this._podTimeObject.durationAggregate})
}},_onAllAdsCompleted:function(b){this.log("onAllAdsCompleted");
if(this._signedUpForAd&&!this._setAdsCalled){this.log("skipping ad slot");
var a={baseClips:[],clips:[],globalDataType:"com.theplatform.pdk.data::Playlist"};
this._controller.setAds(a)
}},_onAdError:function(a){this.log("AdErrorEvent.AD_ERROR handler");
this._onAdsLoadError(a)
},_onAdsLoadError:function(b){this.log("onAdsLoadError: some action and cleanup");
var a=false;
if(this._slotPending){this.log("slotPending error");
a=true
}else{if(this._linearAdStarted){this.log("ad playback error");
this._noopPlayer.done(this._adClip)
}else{if(this._adCompleted){this.log("ad wouldn't play");
a=true
}else{this.log("pre-loading of ads failure");
this._adsErrorForNextCheckAd=true
}}}this._cleanUp();
if(a){this._controller.setAds(null);
this._setAdsCalled=true
}if(b){this.log("Error Loading Ads Manager: "+b.getError().getMessage(),tpConsts.ERROR)
}},_inspect:function(b){var c="|||";
for(var a in b){if(b.hasOwnProperty(a)){c+=a+" = "+b[a]+">>"
}}this.log(c)
},logEvent:function(a){this.log("IMA Event: "+a.type)
},log:function(a,b){if(!b){b=tpConsts.DEBUG
}tpDebug(a,this._controller.id,"Doubleclick",b)
},warn:function(a){tpDebug(a,this._controller.id,"Doubleclick",tpConsts.WARN)
}});
$pdk.plugin.doubleclick.PdkNoopPlayer=$pdk.extend(function(){},{_controller:null,_volumeSetCallback:null,_muteSetCallback:null,_pauseSetCallback:null,_onPlayerPauseListener:null,_onPlayerUnpauseListener:null,_onVolumeChangeListener:null,_onMuteListener:null,_usingVideoProxy:false,constructor:function(a,b,d,e){this._controller=a;
this._volumeSetCallback=b;
this._muteSetCallback=d;
this._pauseSetCallback=e;
var c=this;
this._onPlayerUnpauseListener=function(){c._onPlayerUnpause.apply(c,arguments)
};
this._onPlayerPauseListener=function(){c._onPlayerPause.apply(c,arguments)
};
this._onVolumeChangeListener=function(){c._onVolumeChange.apply(c,arguments)
};
this._onMuteListener=function(){c._onMute.apply(c,arguments)
};
this._addPlaybackListeners()
},usingVideoProxy:function(a){this._usingVideoProxy=a
},mediaStarts:function(a){this.log("mediaStarts");
this._controller.dispatchEvent("OnMediaStart",a)
},mediaPause:function(c,b){this.log("mediaPause("+c+")");
var a={globalDataType:"com.theplatform.pdk.data::MediaPause",clip:b,userInitiated:true};
if(c){this._controller.dispatchEvent("OnMediaPause",a)
}else{this._controller.dispatchEvent("OnMediaUnpause",a)
}},mediaPlaying:function(a){this._controller.dispatchEvent("OnMediaPlaying",a)
},mediaEnds:function(a){this.log("mediaEnds: calling endMedia");
this._controller.endMedia(a)
},done:function(e){this.log("done: calling endMedia");
var a=this._controller;
var d=e;
var c=this;
setTimeout(function b(){c.log("on async, call endMedia");
a.endMedia(d)
},10)
},_onVolumeChange:function(a){this._volumeSetCallback(parseInt(a.data))
},_onMute:function(a){this._muteSetCallback(a.data)
},_onPlayerPause:function(b){var a="PdkNoopPlayer::onPlayerPause";
if(this._pauseSetCallback&&!this._usingVideoProxy){tpDebug(a+"- calling pauseSetCallback with True");
this._pauseSetCallback(true)
}else{tpDebug(a+" usingVideoProxy("+this._usingVideoProxy+")")
}},_onPlayerUnpause:function(b){var a="PdkNoopPlayer::onPlayerUnpause";
if(this._pauseSetCallback&&!this._usingVideoProxy){tpDebug(a+"- calling pauseSetCallback with False");
this._pauseSetCallback(false)
}else{tpDebug(a+" usingVideoProxy("+this._usingVideoProxy+")")
}},_addPlaybackListeners:function(){this._controller.addEventListener("OnPlayerPause",this._onPlayerPauseListener);
this._controller.addEventListener("OnPlayerUnPause",this._onPlayerUnpauseListener);
this._controller.addEventListener("OnVolumeChange",this._onVolumeChangeListener);
this._controller.addEventListener("OnMute",this._onMuteListener)
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
$pdk.plugin.doubleclick.VastStrategy=$pdk.extend(function(){},{_adsManager:null,_controller:null,_slotPlayRequested:false,_ad:null,_adLoadedReady:false,_preparePodCallback:null,_firstPod:true,_adLoadedListener:null,_adBreakReadyListener:null,_adsLoader:null,_isOverlay:false,_adsManagerStarted:false,constructor:function(c,a,b){this._adsLoader=a;
this._controller=b;
this._preparePodCallback=c;
var e=this;
this._adLoadedListener=function d(){e._onAdLoaded.apply(e,arguments)
};
this._adBreakReadyListener=function f(){e._onAdBreakReady.apply(e,arguments)
}
},setAdsManager:function(a){this._adsManager=a;
this._adsManager.addEventListener(google.ima.AdEvent.Type.LOADED,this._adLoadedListener);
this._adsManager.addEventListener(google.ima.AdEvent.Type.AD_BREAK_READY,this._adBreakReadyListener)
},preparePod:function(a){if(this._firstPod){this._firstPod=false
}else{tpDebug("preparePod","DoubleClick:VastStrategy",tpConsts.INFO);
this._preparePodCallback(a)
}},playNextPod:function(){tpDebug("playNextPod","DoubleClick:VastStrategy",tpConsts.INFO);
this._slotPlayRequested=true;
this._adsManagerStarted=false;
this.doPlayNextPod();
return true
},doPlayNextPod:function(){if(this._slotPlayRequested&&this._adLoadedReady){tpDebug("doPlayNextPod","DoubleClick:VastStrategy",tpConsts.DEBUG);
this._adsManager.start();
this._adsManagerStarted=true;
this._adLoadedReady=this._slotPlayRequested=false
}},getReady:function(){return true
},getAdsManagerStarted:function(){return this._adsManagerStarted
},isOverlay:function(){return this._isOverlay
},_onAdLoaded:function(a){tpDebug("onAdLoaded","DoubleClick:VastStrategy",tpConsts.DEBUG);
this._ad=a.getAd();
this._isOverlay=!this._ad.isLinear();
this._adLoadedReady=true;
this.doPlayNextPod()
},_onAdBreakReady:function(a){tpDebug("onAdBreakReady","DoubleClick:VastStrategy",tpConsts.DEBUG)
},destroy:function(){tpDebug("destroy","DoubleClick:VastStrategy",tpConsts.DEBUG);
this._adsLoader.contentComplete();
if(this._adsManager){this._adsManager.removeEventListener(google.ima.AdEvent.Type.LOADED,this._adLoadedListener);
this._adsManager.removeEventListener(google.ima.AdEvent.Type.AD_BREAK_READY,this._adBreakReadyListener)
}this._controller=null;
this._preparePodCallback=null;
this._ad=null
}});
$pdk.plugin.doubleclick.AdRulesStrategy=$pdk.extend(function(){},{_adsManager:null,_controller:null,_adBreakReady:false,_slotPlayRequested:false,_ad:null,_adLoadedListener:null,_adBreakReadyListener:null,_preparePodCallback:null,_adsLoader:null,_cuePointAvailable:true,_isOverlay:false,_adsManagerStarted:false,constructor:function(c,a,b){this._adsLoader=a;
this._controller=b;
this._preparePodCallback=c;
var e=this;
this._adLoadedListener=function d(){e._onAdLoaded.apply(e,arguments)
};
this._adBreakReadyListener=function f(){e._onAdBreakReady.apply(e,arguments)
}
},setAdsManager:function(a){this._adsManager=a;
this._adsManager.addEventListener(google.ima.AdEvent.Type.LOADED,this._adLoadedListener);
this._adsManager.addEventListener(google.ima.AdEvent.Type.AD_BREAK_READY,this._adBreakReadyListener)
},preparePod:function(a){var b=this._preparePodCallback();
tpDebug("preparePod: cuePointAvailable: "+b);
this._cuePointAvailable=b
},playNextPod:function(){tpDebug("playNextPod","DoubleClick::AdRulesStrategy",tpConsts.INFO);
this._slotPlayRequested=true;
this._adsManagerStarted=false;
this.doPlayNextPod();
return this._cuePointAvailable
},doPlayNextPod:function(){if(this._slotPlayRequested&&this._adBreakReady&&this._cuePointAvailable){tpDebug("doPlayNextPod","DoubleClick::AdRulesStrategy",tpConsts.DEBUG);
this._adsManager.start();
this._adsManagerStarted=true;
this._adBreakReady=this._slotPlayRequested=false
}},getReady:function(){return true
},getAdsManagerStarted:function(){return this._adsManagerStarted
},isOverlay:function(){return this._isOverlay
},_onAdLoaded:function(a){tpDebug("onAdLoaded","DoubleClick::AdRulesStrategy",tpConsts.DEBUG);
this._ad=a.getAd();
this._isOverlay=!this._ad.isLinear()
},_onAdBreakReady:function(a){tpDebug("onAdBreakReady","DoubleClick::AdRulesStrategy",tpConsts.DEBUG);
this._adBreakReady=true;
this.doPlayNextPod()
},destroy:function(){tpDebug("destroy (no content complete)","DoubleClick::AdRulesStrategy",tpConsts.DEBUG);
if(this._adsManager){this._adsManager.removeEventListener(google.ima.AdEvent.Type.LOADED,this._adLoadedListener);
this._adsManager.removeEventListener(google.ima.AdEvent.Type.AD_BREAK_READY,this._adBreakReadyListener);
this._adBreakReadyListener=null;
this._adLoadedListener=null
}this._controller=null;
this._ad=null
}});
$pdk.plugin.doubleclick.AdsLoader=$pdk.extend(function(){},{_imaAdsLoader:null,constructor:function(a){this._imaAdsLoader=a
},contentComplete:function(){this._imaAdsLoader.contentComplete()
},getSettings:function(){return this._imaAdsLoader.getSettings()
},requestAds:function(a){this._imaAdsLoader.requestAds(a)
},addEventListener:function(a,b){this._imaAdsLoader.addEventListener(a,b)
},removeEventListener:function(a,b){this._imaAdsLoader.removeEventListener(a,b)
}});
$pdk.plugin.doubleclick.AdsManager=$pdk.extend(function(){},{_imaAdsManager:null,constructor:function(a){this._imaAdsManager=a
},init:function(c,a,b){this._imaAdsManager.init(c,a,b)
},getCuePoints:function(){return this._imaAdsManager.getCuePoints()
},getAdSkippableState:function(){return this._imaAdsManager.getAdSkippableState()
},getRemainingTime:function(){return this._imaAdsManager.getRemainingTime()
},getVolume:function(){return this._imaAdsManager.getVolume()
},pause:function(){this._imaAdsManager.pause()
},resume:function(){this._imaAdsManager.resume()
},skip:function(){this._imaAdsManager.skip()
},start:function(){this._imaAdsManager.start()
},stop:function(){this._imaAdsManager.stop()
},resize:function(c,a,b){this._imaAdsManager.resize(c,a,b)
},setVolume:function(a){this._imaAdsManager.setVolume(a)
},isCustomPlaybackUsed:function(){return this._imaAdsManager.isCustomPlaybackUsed()
},isCustomClickTrackingUsed:function(){return this._imaAdsManager.isCustomClickTrackingUsed()
},addEventListener:function(a,b){this._imaAdsManager.addEventListener(a,b)
},removeEventListener:function(a,b){this._imaAdsManager.removeEventListener(a,b)
},destroy:function(){if(this._imaAdsManager){this._imaAdsManager.destroy()
}this._imaAdsManager=null
}});
var doubleclickPlugIn=new $pdk.plugin.doubleclick.Doubleclick();
tpController.plugInLoaded(doubleclickPlugIn,null);