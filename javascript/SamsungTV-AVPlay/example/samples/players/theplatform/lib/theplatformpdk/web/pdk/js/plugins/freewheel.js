$pdk.ns("$pdk.plugin.freewheel.admanager");
$pdk.plugin.freewheel.admanager.AdManager=$pdk.extend(function(){},{constructor:function(){this.ready=false
},initialize:function(b,a,c){this.controller=b;
this.slotManager=a
},resetsEvents:function(){return true
},bind:function(b,c){var a=Array.prototype.slice.call(arguments);
a.shift();
c=a.shift();
return function(){return c.apply(b,a.concat(Array.prototype.slice.call(arguments)))
}
},getAdInfo:function(d,a,c){var b={};
return b
},setServer:function(a){},setNetwork:function(a){},refresh:function(){},dispose:function(){},setKeyValue:function(a,b){},addKeyValue:function(a,b){},setContentVideoElement:function(a){},setProfile:function(a){},setSiteSection:function(d,e,c,a,b){},setVideoAsset:function(h,e,c,a,g,d,b,f){},setVisitor:function(a){},setParameter:function(a,c,b){},addEventListener:function(a,b){},addTemporalSlot:function(c,a,b){},getTemporalSlots:function(){},getSlotByCustomId:function(a){},setAdPlayState:function(a){},setAdVolume:function(a){},setVideoState:function(a){},getVideoDisplaySize:function(){},setVideoDisplaySize:function(e,d,c,b,a){},scanSlotsOnPage:function(){},setRequestMode:function(a){},submitRequest:function(a){},setVisitorHttpHeader:function(a,b){}});
$pdk.ns("$pdk.plugin.freewheel.admanager");
$pdk.plugin.freewheel.admanager.NativeAdManager=$pdk.extend($pdk.plugin.freewheel.admanager.AdManager,{constructor:function(b,a,c){this.controller=a
},initialize:function(b,a,c){$pdk.plugin.freewheel.admanager.NativeAdManager.superclass.initialize.call(this,b,a,c);
if(c&&c.parentNode){c.parentNode.removeChild(c)
}this._slots=null
},resetsEvents:function(){return false
},getAdInfo:function(e,a,d,c){var b=this.controller.callLayerFunction("freewheel","getAdInfo",[e.getCustomId(),a,d,c])||{parameters:{}};
return b
},onMediaPause:function(a){},setServer:function(a){this.controller.callLayerFunction("freewheel","setServer",[a])
},setNetwork:function(a){this.controller.callLayerFunction("freewheel","setNetwork",[a])
},refresh:function(){this.controller.callLayerFunction("freewheel","refresh",[])
},dispose:function(){this.controller.callLayerFunction("freewheel","dispose",[])
},setKeyValue:function(a,b){this.addKeyValue(a,b)
},addKeyValue:function(a,b){this.controller.callLayerFunction("freewheel","addKeyValue",[a,b])
},setContentVideoElement:function(a){},setProfile:function(a){this.controller.callLayerFunction("freewheel","setProfile",[a])
},setSiteSection:function(d,e,c,a,b){this.controller.callLayerFunction("freewheel","setSiteSection",[d,e,c,a,b])
},setVideoAsset:function(h,e,c,a,g,d,b,f){this.controller.callLayerFunction("freewheel","setVideoAsset",[h,e,c,a,g,d,b,f])
},setVisitor:function(a){this.controller.callLayerFunction("freewheel","setVistor",[a])
},setParameter:function(a,c,b){this.controller.callLayerFunction("freewheel","setParameter",[a,c,b])
},addEventListener:function(b,d){$pdk.ns("$pdk.plugin.freewheel.admanager.callbacks");
var a="callback_"+Math.floor(Math.random()*10000000);
var c=this;
$pdk.plugin.freewheel.admanager.callbacks[a]=function(){if(arguments&&arguments.length&&arguments[0].slotCustomId){arguments[0].slot=c.getSlotByCustomId(arguments[0].slotCustomId)
}d.apply(null,arguments)
};
this.controller.callLayerFunction("freewheel","addAdManagerEventListener",[b,"$pdk.plugin.freewheel.admanager.callbacks."+a])
},addTemporalSlot:function(c,a,b){this.controller.callLayerFunction("freewheel","addTemporalSlot",[c,a,b])
},getTemporalSlots:function(){if(this._slots){return this._slots
}else{this._slots=[]
}var a=this.controller.callLayerFunction("freewheel","getTemporalSlotsLength",[]);
for(var b=0;
b<a;
b++){this._slots.push(new $pdk.plugin.freewheel.admanager.SlotProxy(b,this.controller))
}window._slots=this._slots;
return this._slots
},getSlotByCustomId:function(a){if(!this._slots){this.getTemporalSlots()
}return this._slots[this.controller.callLayerFunction("freewheel","getSlotIndexByCustomId",[a])]
},setAdVolume:function(a){this.controller.callLayerFunction("freewheel","setAdVolume",[a])
},setAdPlayState:function(a){this.controller.callLayerFunction("freewheel","setAdPlayState",[a])
},setVideoState:function(a){this.controller.callLayerFunction("freewheel","setVideoState",[a])
},getVideoDisplaySize:function(){var a=this.controller.callLayerFunction("freewheel","getVideoDisplaySize",[]);
if(a){return JSON.parse()
}else{return{top:0,left:0,width:0,height:0}
}},setVideoDisplaySize:function(e,d,c,b,a){this.controller.callLayerFunction("freewheel","setVideoDisplaySize",[e,d,c,b,a])
},setRequestMode:function(a){this.controller.callLayerFunction("freewheel","setRequestMode",[a])
},submitRequest:function(a){this.controller.callLayerFunction("freewheel","submitRequest",[a])
},setVisitorHttpHeader:function(a,b){this.controller.callLayerFunction("freewheel","setVisitorHttpHeader",[a,b])
}});
$pdk.ns("$pdk.plugin.freewheel.admanager");
$pdk.plugin.freewheel.admanager.FlashAdManager=$pdk.extend($pdk.plugin.freewheel.admanager.NativeAdManager,{constructor:function(d,a,g,c,b){$pdk.plugin.freewheel.admanager.FlashAdManager.superclass.constructor(d,a,g);
this.ready=false;
this._callback=g;
var e=this;
this.addEventListener("urn:theplatform:freewheel:ready",function(h){if(h){e.ready=true;
e._callback.call()
}});
if(d){d=d.replace("{ext}","swf").replace("{runtime}","flash")
}var f=(d?"adManagerUrl="+escape(d):"");
if(c){a.loadLayer("flash","freewheel",c+(c.indexOf("?")>0?"&":"?")+f)
}else{a.loadLayer("flash","freewheel",$pdk.scriptRoot+"/swf/FreeWheelAdManagerLoader.swf?"+f)
}$pdk.ns("tv.freewheel");
tv.freewheel.SDK={version:"js-5.15.0.1-r10575-201406260803",LOG_LEVEL_QUIET:0,LOG_LEVEL_INFO:1,LOG_LEVEL_DEBUG:2,PLATFORM_IS_WINDOWSPHONE:false,PLATFORM_IS_IPAD:false,PLATFORM_IS_IPHONE_IPOD:false,PLATFORM_IE_MOBILE_VERSION:0,PLATFORM_IOS_VERSION:0,PLATFORM_ANDROID_VERSION:0,PLATFORM_IS_SAFARI:true,PLATFORM_IS_MOBILE:false,PLATFORM_ID:"Desktop",PLATFORM_EVENT_CLICK:"click",MOBILE_EVENT_DRAG:"touchmove",PLATFORM_SEND_REQUEST_BY_FORM:false,PLATFORM_HIDE_AND_SHOW_CONTENT_VIDEO_BY_MOVE_POSITION:false,PLATFORM_HIDE_AND_SHOW_CONTENT_VIDEO_BY_SET_DISPLAY:true,PLATFORM_SUPPORT_PLAY_MIDROLL_BY_CURRENT_VIDEO_ELEMENT:false,PLATFORM_AUTO_SEEK_AFTER_MIDROLL:false,PLATFORM_NOT_SUPPORT_OVERLAY_AD:false,PLATFORM_FILL_VIDEO_POOL_FOR_MIDROLL:false,PLATFORM_NOT_SUPPORT_MIDROLL_AD:false,PLATFORM_NOT_SUPPORT_VIDEO_AD:false,PLATFORM_DETECT_FULL_SCREEN_FOR_MIDROLL:false,PLATFORM_NOT_SUPPORT_CLICK_FOR_VIDEO:false,PLATFORM_NOT_FIRE_CLICK_WHEN_AD_VIDEO_PAUSED:false,PLATFORM_WAIT_WHEN_AD_VIDEO_TIMEOUT:false,PLATFORM_VIDEO_DOESNOT_SUPPORT_TIMEUPDATE:false,PLATFORM_PLAY_DUMMY_VIDEO_FOR_PREROLL:false,PLATFORM_NOT_WAIT_FOR_ERROR_WHEN_PLAY_DUMMY_VIDEO_FOR_PREROLL:false,PLATFORM_SUPPORT_VIDEO_START_DETECT_TIMEOUT:true,PLATFORM_NOT_SUPPORT_OVERLAY_CLICK_WHEN_CONTROLS_IS_TRUE:false,RENDERER_STATE_INIT:1,RENDERER_STATE_STARTING:2,RENDERER_STATE_STARTED:3,RENDERER_STATE_COMPLETING:4,RENDERER_STATE_COMPLETED:5,RENDERER_STATE_FAILED:6,TRANSLATOR_STATE_INIT:1,TRANSLATOR_STATE_STARTING:2,TRANSLATOR_STATE_STARTED:3,TRANSLATOR_STATE_COMPLETING:4,TRANSLATOR_STATE_COMPLETED:5,TRANSLATOR_STATE_FAILED:6,EVENT_AD:"adEvent",EVENT_SLOT_IMPRESSION:"slotImpression",EVENT_SLOT_END:"slotEnd",EVENT_AD_IMPRESSION:"defaultImpression",EVENT_AD_IMPRESSION_END:"adEnd",EVENT_AD_QUARTILE:"quartile",EVENT_AD_FIRST_QUARTILE:"firstQuartile",EVENT_AD_MIDPOINT:"midPoint",EVENT_AD_THIRD_QUARTILE:"thirdQuartile",EVENT_AD_COMPLETE:"complete",EVENT_AD_CLICK:"defaultClick",EVENT_AD_MUTE:"_mute",EVENT_AD_UNMUTE:"_un-mute",EVENT_AD_COLLAPSE:"_collapse",EVENT_AD_EXPAND:"_expand",EVENT_AD_PAUSE:"_pause",EVENT_AD_RESUME:"_resume",EVENT_AD_REWIND:"_rewind",EVENT_AD_ACCEPT_INVITATION:"_accept-invitation",EVENT_AD_CLOSE:"_close",EVENT_AD_MINIMIZE:"_minimize",EVENT_ERROR:"_e_unknown",EVENT_RESELLER_NO_AD:"resellerNoAd",INFO_KEY_CUSTOM_ID:"customId",INFO_KEY_MODULE_TYPE:"moduleType",MODULE_TYPE_EXTENSION:"extension",MODULE_TYPE_RENDERER:"renderer",MODULE_TYPE_TRANSLATOR:"translator",INFO_KEY_ERROR_CODE:"errorCode",INFO_KEY_ERROR_INFO:"errorInfo",INFO_KEY_ERROR_MODULE:"errorModule",ERROR_IO:"_e_io",ERROR_TIMEOUT:"_e_timeout",ERROR_NULL_ASSET:"_e_null-asset",ERROR_ADINSTANCE_UNAVAILABLE:"_e_adinst-unavail",ERROR_UNKNOWN:"_e_unknown",ERROR_MISSING_PARAMETER:"_e_missing-param",ERROR_NO_AD_AVAILABLE:"_e_no-ad",ERROR_PARSE:"_e_parse",ERROR_INVALID_VALUE:"_e_invalid-value",ERROR_INVALID_SLOT:"_e_invalid-slot",ERROR_NO_RENDERER:"_e_no-renderer",ERROR_DEVICE_LIMIT:"_e_device-limit",ERROR_3P_COMPONENT:"_e_3p-comp",ERROR_UNSUPPORTED_3P_FEATURE:"_e_unsupp-3p-feature",ERROR_SECURITY:"_e_security",ERROR_UNMATCHED_SLOT_SIZE:"_e_slot-size-unmatch",INFO_KEY_URL:"url",INFO_KEY_SHOW_BROWSER:"showBrowser",INFO_KEY_CUSTOM_EVENT_NAME:"customEventName",INFO_KEY_NEED_EMPTY_CT:"needEmptyCT",EVENT_TYPE_CLICK_TRACKING:"CLICKTRACKING",EVENT_TYPE_IMPRESSION:"IMPRESSION",EVENT_TYPE_CLICK:"CLICK",EVENT_TYPE_STANDARD:"STANDARD",EVENT_TYPE_GENERIC:"GENERIC",EVENT_TYPE_ERROR:"ERROR",EVENT_VIDEO_VIEW:"videoView",SHORT_EVENT_TYPE_IMPRESSION:"i",SHORT_EVENT_TYPE_CLICK:"c",SHORT_EVENT_TYPE_STANDARD:"s",SHORT_EVENT_TYPE_ERROR:"e",INIT_VALUE_ZERO:"0",INIT_VALUE_ONE:"1",INIT_VALUE_TWO:"2",INFO_KEY_PARAMETERS:"parameters",URL_PARAMETER_KEY_ET:"et",URL_PARAMETER_KEY_CN:"cn",URL_PARAMETER_KEY_INIT:"init",URL_PARAMETER_KEY_CT:"ct",URL_PARAMETER_KEY_METR:"metr",URL_PARAMETER_KEY_CR:"cr",URL_PARAMETER_KEY_KEY_VALUE:"kv",URL_PARAMETER_KEY_ERROR_INFO:"additional",URL_PARAMETER_KEY_ERROR_MODULE:"renderer",URL_PARAMETER_KEY_CREATIVE_RENDITION_ID:"reid",CAPABILITY_SLOT_TEMPLATE:"sltp",CAPABILITY_MULTIPLE_CREATIVE_RENDITIONS:"emcr",CAPABILITY_RECORD_VIDEO_VIEW:"exvt",CAPABILITY_CHECK_COMPANION:"cmpn",CAPABILITY_CHECK_TARGETING:"targ",CAPABILITY_FALLBACK_UNKNOWN_ASSET:"unka",CAPABILITY_FALLBACK_UNKNOWN_SITE_SECTION:"unks",CAPABILITY_FALLBACK_ADS:"fbad",CAPABILITY_SLOT_CALLBACK:"slcb",CAPABILITY_NULL_CREATIVE:"nucr",CAPABILITY_AUTO_EVENT_TRACKING:"aeti",CAPABILITY_RENDERER_MANIFEST:"rema",CAPABILITY_REQUIRE_VIDEO_CALLBACK:"vicb",CAPABILITY_SKIP_AD_SELECTION:"skas",SLOT_TYPE_TEMPORAL:"temporal",SLOT_TYPE_VIDEOPLAYER_NONTEMPORAL:"videoPlayerNonTemporal",SLOT_TYPE_SITESECTION_NONTEMPORAL:"siteSectionNonTemporal",TIME_POSITION_CLASS_PREROLL:"PREROLL",TIME_POSITION_CLASS_MIDROLL:"MIDROLL",TIME_POSITION_CLASS_POSTROLL:"POSTROLL",TIME_POSITION_CLASS_OVERLAY:"OVERLAY",TIME_POSITION_CLASS_DISPLAY:"DISPLAY",TIME_POSITION_CLASS_PAUSE_MIDROLL:"PAUSE_MIDROLL",EVENT_REQUEST_COMPLETE:"onRequestComplete",EVENT_SLOT_STARTED:"onSlotStarted",EVENT_SLOT_ENDED:"onSlotEnded",EVENT_CONTENT_VIDEO_PAUSE_REQUEST:"contentVideoPauseRequest",EVENT_CONTENT_VIDEO_RESUME_REQUEST:"contentVideoResumeRequest",CAPABILITY_STATUS_OFF:0,CAPABILITY_STATUS_ON:1,PARAMETER_LEVEL_PROFILE:0,PARAMETER_LEVEL_GLOBAL:1,PARAMETER_LEVEL_OVERRIDE:5,PARAMETER_ENABLE_FORM_TRANSPORT:"sdk.enableFormTransport",PARAMETER_DESIRED_BITRATE:"desiredBitrate",PARAMETER_VIDEO_POOL_SIZE:"sdk.videoPoolSize",PARAMETER_PLAY_MIDROLL_BY_CURRENT_VIDEO_ELEMENT:"PARAMETER_PLAY_MIDROLL_BY_CURRENT_VIDEO_ELEMENT",PARAMETER_EXTENSION_AD_CONTROL_CLICK_ELEMENT:"extension.ad.control.clickElement",PARAMETER_EXTENSION_CONTENT_VIDEO_ENABLED:"extension.contentVideo.enabled",PARAMETER_EXTENSION_CONTENT_VIDEO_RESPOND_PAUSE_RESUME:"extension.contentVideo.respondPauseResume",PARAMETER_EXTENSION_CONTENT_VIDEO_AUTO_SEEK_BACK:"extension.contentVideo.autoSeekBack",PARAMETER_EXTENSION_CONTENT_VIDEO_AUTO_SOURCE_RESTORE:"extension.contentVideo.autoSourceRestore",PARAMETER_EXTENSION_VIDEO_STATE_ENABLED:"extension.videoState.enabled",PARAMETER_RENDERER_VIDEO_START_DETECT_TIMEOUT:"renderer.video.startDetectTimeout",PARAMETER_RENDERER_VIDEO_PROGRESS_DETECT_TIMEOUT:"renderer.video.progressDetectTimeout",PARAMETER_RENDERER_VIDEO_ANDROID_DELAY:"renderer.video.android.delay",PARAMETER_RENDERER_VIDEO_DISPLAY_CONTROLS_WHEN_PAUSE:"renderer.video.displayControlsWhenPause",PARAMETER_RENDERER_VIDEO_CLICK_DETECTION:"renderer.video.clickDetection",PARAMETER_RENDERER_VIDEO_PLAY_AFTER_STALLED:"renderer.video.playAfterStalled",PARAMETER_EXTENSION_SURVEY_ENABLED:"extension.survey.enabled",PARAMETER_RENDERER_HTML_COAD_SCRIPT_NAME:"renderer.html.coadScriptName",PARAMETER_RENDERER_HTML_SHOULD_BACKGROUND_TRANSPARENT:"renderer.html.isBackgroundTransparent",PARAMETER_RENDERER_HTML_SHOULD_END_AFTER_DURATION:"renderer.html.shouldEndAfterDuration",PARAMETER_RENDERER_HTML_AD_LOAD_TIMEOUT:"renderer.html.adLoadTimeout",PARAMETER_RENDERER_HTML_PLACEMENT_TYPE:"renderer.html.placementType",PARAMETER_RENDERER_HTML_BOOTSTRAP:"renderer.html.bootstrap",PARAMETER_RENDERER_HTML_PRIMARY_ANCHOR:"renderer.html.primaryAnchor",PARAMETER_RENDERER_HTML_MARGIN_WIDTH:"renderer.html.marginWidth",PARAMETER_RENDERER_HTML_MARGIN_HEIGHT:"renderer.html.marginHeight",PARAMETER_VPAID_CREATIVE_TIMEOUT_DELAY:"renderer.vpaid.creativeTimeoutDelay",PARAMETER_RENDERER_HTML_PLACEMENT_TYPE_INLINE:"inline",PARAMETER_RENDERER_HTML_PLACEMENT_TYPE_INTERSTITIAL:"interstitial",PARAMETER_RENDERER_HTML_BASEUNIT_INTERSTITIAL:"app-interstitial",ID_TYPE_FW:1,ID_TYPE_CUSTOM:2,ID_TYPE_GROUP:3,VIDEO_STATE_PLAYING:1,VIDEO_STATE_PAUSED:2,VIDEO_STATE_STOPPED:3,VIDEO_STATE_COMPLETED:4,VIDEO_ASSET_AUTO_PLAY_TYPE_ATTENDED:1,VIDEO_ASSET_AUTO_PLAY_TYPE_UNATTENDED:2,VIDEO_ASSET_AUTO_PLAY_TYPE_NONE:3,VIDEO_ASSET_AUTO_PLAY_TYPE_NON_AUTO_PLAY:3,ADUNIT_PREROLL:"preroll",ADUNIT_MIDROLL:"midroll",ADUNIT_POSTROLL:"postroll",ADUNIT_OVERLAY:"overlay",METR_MASK_QUARTILE:0,METR_MASK_MIDPOINT:1,METR_MASK_COMPLETE:2,METR_MASK_VOLUME:3,METR_MASK_SIZE:4,METR_MASK_CONTROL:5,METR_MASK_REWIND:6,METR_MASK_ACCEPT_INVITATION:7,METR_MASK_CLOSE:8,METR_MASK_MINIMIZE:9,METR_MASK_CLICK:10}
},onAdManagerLoaderError:function(){},onAdManagerLoaderLoaded:function(){this.ready=true
}});
$pdk.ns("$pdk.plugin.freewheel.admanager");
$pdk.plugin.freewheel.admanager.JavaScriptAdManager=$pdk.extend($pdk.plugin.freewheel.admanager.AdManager,{constructor:function(b,a,c){tpLoadScript(b.replace("{ext}","js").replace("{runtime}","html5"),this.bind(this,this.onAdManagerLoaded));
this._callback=c
},initialize:function(b,a,c){$pdk.plugin.freewheel.admanager.JavaScriptAdManager.superclass.initialize.call(this,b,a,c);
this.proxy=b.getVideoProxy();
this.proxy.parentNode=c;
this.setContentVideoElement(this.proxy)
},onAdManagerLoaded:function(){if(typeof tv=="undefined"||typeof tv.freewheel=="undefined"||typeof tv.freewheel.SDK=="undefined"||typeof tv.freewheel.SDK.AdManager=="undefined"){return
}this._adManager=new tv.freewheel.SDK.AdManager();
this.ready=true;
this._callback.call()
},getAdInfo:function(j,g,b,k){var f={};
f.slot=j;
f.adId=g;
f.uniqueURL=f.adId.toString();
var c,a;
var h=j.getAdInstances();
var e;
for(var d=0;
d<h.length;
d++){e=h[d].getAdId();
if(e==g){if(!c){c=h[d]
}a=h[d]
}}if(c){f.title=c.getActiveCreativeRendition().getPrimaryCreativeRenditionAsset().getName();
f.category=c.getRendererController().getParameter("_fw_advertiser_name");
f.subCategory=c.getRendererController().getParameter("_fw_campaign_name");
f.titleId=c.getRendererController().getParameter("_fw_ad_title_id");
f.advertiserId=c.getRendererController().getParameter("_fw_advertiser_id");
f.siteSectionId=c.getRendererController().getParameter("_fw_site_section_id");
f.siteSectionTag=c.getRendererController().getParameter("_fw_site_section_tag");
f.adUnitName=c.getRendererController().getParameter("_fw_ad_unit_name");
f.customData=c.getRendererController().getParameter("extension.analytics.customData")||c.getRendererController().getParameter("customData");
f.time_position_class=j.getTimePositionClass();
f.base_unit=c.getActiveCreativeRendition().getBaseUnit();
f.content_type=c.getActiveCreativeRendition().getContentType();
f.type=this._getAdType(j,c.getActiveCreativeRendition(),f.adUnitName);
if(k&&k.length){f.parameters={};
for(d=0;
d<k.length;
d++){f.parameters[k[d]]=c.getRendererController().getParameter(k[d])
}}}else{f.title="unknown"
}if(a){f.duration=a.getActiveCreativeRendition().getDuration();
f.adURL=a.getActiveCreativeRendition().getPrimaryCreativeRenditionAsset().getUrl()
}return f
},_getAdType:function(e,b,a){var c="";
var d=e.getTimePositionClass();
switch(d){case tv.freewheel.SDK.TIME_POSITION_CLASS_MIDROLL:if(e.getTimePosition()==-1){c="pause"
}else{if(b.getBaseUnit()=="video-click-to-content"){c="interactive"
}else{c="midroll"
}}break;
case tv.freewheel.SDK.TIME_POSITION_CLASS_PREROLL:case tv.freewheel.SDK.TIME_POSITION_CLASS_POSTROLL:if(a=="Video Branded Slate"){c="brandedslate"
}else{c=d==tv.freewheel.SDK.TIME_POSITION_CLASS_PREROLL?"preroll":"postroll"
}break;
case tv.freewheel.SDK.TIME_POSITION_CLASS_OVERLAY:if(a=="Overlay Bug"){c="bug"
}else{c="overlay"
}break;
case tv.freewheel.SDK.TIME_POSITION_CLASS_PAUSE_MIDROLL:c="pause";
break;
default:break
}return c
},_onProxyPlay:function(a){this.proxy.removeEventListener("play",this.playListener);
this.playListenerAdded=false;
this.slotManager.resume()
},_onProxyPaused:function(a){if(isNaN(this.proxy.duration)){return
}if(this.proxy.ended||Math.abs(this.proxy.currentTime-this.proxy.duration)<0.25){return
}this.slotManager.pause();
if(!this.playListenerAdded){this.proxy.addEventListener("play",this.playListener);
this.playListenerAdded=true
}},setServer:function(a){this._adManager.setServer(a)
},setNetwork:function(a){this._adManager.setNetwork(a)
},refresh:function(){if(this._context){this.dispose()
}this._context=this._adManager.newContext()
},dispose:function(){this._context.dispose()
},setKeyValue:function(a,b){this.addKeyValue(a,b)
},addKeyValue:function(a,b){if(Array.isArray(b)){this._context.addKeyValue(a,b.join(","))
}else{this._context.addKeyValue(a,b)
}},setContentVideoElement:function(a){this._context.setContentVideoElement(a)
},setProfile:function(a){this._context.setProfile(a)
},setSiteSection:function(d,e,c,a,b){this._context.setSiteSection(d,e,c,a,b)
},setVideoAsset:function(h,e,c,a,g,d,b,f){this._context.setVideoAsset(h,e,c,a,g,d,b,f)
},setVisitor:function(a){this._context.setVisitor(a)
},setParameter:function(a,c,b){this._context.setParameter(a,c,b)
},addEventListener:function(a,b){this._context.addEventListener(a,b)
},addTemporalSlot:function(c,a,b){this._context.addTemporalSlot(c,a,b)
},getTemporalSlots:function(){return this._context.getTemporalSlots()
},getSlotByCustomId:function(a){return this._context.getSlotByCustomId(a)
},setAdVolume:function(a){this.proxy.volume=a/100
},setAdPlayState:function(a){if(a){this.proxy.pause()
}else{this.proxy.play()
}},setVideoState:function(a){this._context.setVideoState(a)
},getVideoDisplaySize:function(){return this._context.getVideoDisplaySize()
},setVideoDisplaySize:function(e,d,c,b,a){this._context.setVideoDisplaySize(e,d,c,b,a)
},setRequestMode:function(a){},submitRequest:function(a){this._context.submitRequest(a)
},setVisitorHttpHeader:function(a,b){}});
$pdk.ns("$pdk.plugin.freewheel.admanager");
$pdk.plugin.freewheel.admanager.AdManagerFactory={};
$pdk.plugin.freewheel.admanager.AdManagerFactory.create=function(d,c,a,f,b){var e=null;
if(d==$pdk.plugin.freewheel.admanager.AdManagerFactory.FLASH){e=new $pdk.plugin.freewheel.admanager.FlashAdManager(c,a,f,b)
}else{if(d==$pdk.plugin.freewheel.admanager.AdManagerFactory.HTML5){e=new $pdk.plugin.freewheel.admanager.JavaScriptAdManager(c,a,f)
}}return e
};
$pdk.plugin.freewheel.admanager.AdManagerFactory.FLASH="flash";
$pdk.plugin.freewheel.admanager.AdManagerFactory.HTML5="html5";
$pdk.ns("$pdk.plugin.freewheel.admanager");
$pdk.plugin.freewheel.admanager.SlotProxy=$pdk.extend(function(){},{constructor:function(b,a){this.index=b;
this.controller=a;
this.adUnit=this.controller.callLayerFunction("freewheel","getSlotAdUnit",[this.index]);
this.customId=this.controller.callLayerFunction("freewheel","getSlotCustomId",[this.index]);
this.timePosition=this.controller.callLayerFunction("freewheel","getSlotTimePosition",[this.index]);
this.maxDuration=this.controller.callLayerFunction("freewheel","getSlotMaxDuration",[this.index]);
this.minDuration=this.controller.callLayerFunction("freewheel","getSlotMinDuration",[this.index]);
this.timePositionSequence=this.controller.callLayerFunction("freewheel","getSlotTimePositionSequence",[this.index]);
this.chapterIndex=this.controller.callLayerFunction("freewheel","getSlotChapterIndex",[this.index])
},getTotalDuration:function(a){return this.controller.callLayerFunction("freewheel","getSlotTotalDuration",[this.index,a])
},getPlayheadTime:function(a){return this.controller.callLayerFunction("freewheel","getSlotPlayheadTime",[this.index,a])
},getTimePosition:function(){return this.controller.callLayerFunction("freewheel","getSlotTimePosition",[this.index])
},getTimePositionClass:function(){var a=this.controller.callLayerFunction("freewheel","getSlotTimePositionClass",[this.index]);
return a
},getCustomId:function(){return this.controller.callLayerFunction("freewheel","getSlotCustomId",[this.index])
},getAdCount:function(){return this.controller.callLayerFunction("freewheel","getSlotAdCount",[this.index])
},play:function(){this.controller.callLayerFunction("freewheel","playSlot",[this.index])
},stop:function(){this.controller.callLayerFunction("freewheel","stopSlot",[this.index])
},preload:function(){this.controller.callLayerFunction("freewheel","preloadSlot",[this.index])
}});
$pdk.ns("$pdk.plugin.freewheel.noop");
$pdk.plugin.freewheel.noop.PdkNoopPlayer=$pdk.extend(function(){},{_controller:null,_volumeSetCallback:null,_muteSetCallback:null,_pauseSetCallback:null,_onPlayerPauseListener:null,_onPlayerUnpauseListener:null,_onVolumeChangeListener:null,_onMuteListener:null,_active:false,constructor:function(a,b,d,e){this._controller=a;
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
},activate:function(){this._active=true;
var a=this._controller.callFunction("getVolume",[]);
if(a===undefined){a=100
}this._onVolumeChange({data:a});
this._onMute({data:this._controller.callFunction("getMuteState",[])||false})
},deactivate:function(){this._active=false
},mediaStarts:function(a){if(this._active){this._controller.dispatchEvent("OnMediaStart",a)
}},mediaPause:function(c,b){if(this._active){var a={globalDataType:"com.theplatform.pdk.data::MediaPause",clip:b,userInitiated:true};
if(c){this._controller.dispatchEvent("OnMediaPause",a)
}else{this._controller.dispatchEvent("OnMediaUnpause",a)
}}},mediaPlaying:function(e){if(this._active&&e.currentTime>=0){var a=e.currentTime;
var c=e.duration;
var b={globalDataType:"com.theplatform.pdk.data::TimeObject",mediaTime:a,currentTime:a,currentTimeAggregate:a,duration:c,durationAggregate:c,percentComplete:(a/c)*100,percentCompleteAggregate:(a/c)*100,isAggregate:false,isLive:false};
this._controller.dispatchEvent("OnMediaPlaying",b)
}},mediaEnds:function(a){if(this._active){this._controller.endMedia(a);
this._paused=false
}},done:function(a){if(this._active){var b=this._controller;
var c=a;
var e=this;
setTimeout(function d(){e.log("on async, call endMedia");
e.controller.endMedia(c)
},10)
}},_onVolumeChange:function(a){if(this._active){this._volumeSetCallback(parseInt(a.data,10))
}},_onMute:function(a){if(this._active){this._muteSetCallback(a.data)
}},_onPlayerPause:function(d){if(this._active){var b="PdkNoopPlayer::onPlayerPause";
var a=this._controller.component.videoengineruntime==="flash";
var f,c,e;
if(!a){f=this._controller.getVideoProxy();
c=f.currentTime;
e=f.duration
}if((a||c!==e)&&!this._paused&&this._pauseSetCallback&&this._active){this._paused=true;
tpDebug(b+"- calling pauseSetCallback with True");
this._pauseSetCallback(true)
}}},_onPlayerUnpause:function(b){var a="PdkNoopPlayer::onPlayerUnpause";
if(this._paused&&this._pauseSetCallback&&this._active){this._paused=false;
tpDebug(a+"- calling pauseSetCallback with False");
this._pauseSetCallback(false)
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
$pdk.ns("$pdk.plugin.freewheel.slotmanager");
$pdk.plugin.freewheel.slotmanager.SlotManager=$pdk.extend(function(){},{constructor:function(a,c){this.controller=a;
this.adManager=c;
var b=this;
this._noopPlayer=new $pdk.plugin.freewheel.noop.PdkNoopPlayer(this.controller,function(){b._mediaSoundLevelSet.apply(b,arguments)
},function(){b._mediaMuteSet.apply(b,arguments)
},function(){b._mediaPauseSet.apply(b,arguments)
})
},initialize:function(){this.paused=false;
this.muted=false;
this.playlist=null;
this.clip=null;
this._noopPlayer.deactivate()
},_mediaSoundLevelSet:function(a){if(!this.adManager){return
}this.adManager.setAdVolume(a)
},_mediaMuteSet:function(a){if(!this.adManager){return
}if(a){this.adManager.setAdVolume(0)
}else{this.adManager.setAdVolume(100)
}},_mediaPauseSet:function(a){if(!this.adManager||!this.clip){return
}if(a){this._stopProgressTimer();
this.adManager.setAdPlayState(a)
}else{this._startProgressTimer();
this.adManager.setAdPlayState(a)
}this._noopPlayer.mediaPause(a,this.clip)
},start:function(a){this._noopPlayer.activate();
this.playlist=a;
this.slot=this.adManager.getSlotByCustomId(a.clips[0].baseClip.guid);
this.slot.play();
this.clip=a.clips[0];
this._noopPlayer.mediaStarts(this.clip);
this._startProgressTimer();
this.setIOSPauseListeners(true)
},stop:function(){if(this.slot){this.slot.stop()
}},next:function(a){},end:function(){this.setIOSPauseListeners(false);
this.clip=null;
this._noopPlayer.mediaEnds(this.clip);
this._stopProgressTimer();
this._noopPlayer.deactivate()
},setIOSPauseListeners:function(a){if(!$pdk.isIOS){return
}var c=this;
var b=this.controller.getVideoProxy();
if(a&&!this._onPause){this._onPause=function(){var d=b.paused;
if(c._noopPlayer._paused!==d){if(d){c.pause();
if(b.ended||Math.abs(b.currentTime-b.duration)<0.25){return
}}else{c.resume()
}c._noopPlayer._paused=d;
c._noopPlayer.mediaPause(d,c.clip)
}};
b.addEventListener("pause",this._onPause);
b.addEventListener("play",this._onPause)
}else{if(!a&&this._onPause){b.removeEventListener("pause",this._onPause);
b.removeEventListener("play",this._onPause);
this._onPause=null
}}},isTemporalSlot:function(a){if(a){return[tv.freewheel.SDK.TIME_POSITION_CLASS_PREROLL,tv.freewheel.SDK.TIME_POSITION_CLASS_MIDROLL,tv.freewheel.SDK.TIME_POSITION_CLASS_POSTROLL].indexOf(a.getTimePositionClass())>-1
}return false
},createPlaylist:function(c){if(!c){return null
}var e={};
e.globalDataType="com.theplatform.pdk.data::Playlist";
e.baseClips=[];
e.clips=[];
for(var b=0;
b<c.length;
b++){var f=c[b];
var d={};
d.URL=(this.adManager.proxy?f.getCustomId():"");
d.guid=f.getCustomId();
d.title="";
d.isAd=true;
d.noSkip=this.currentAd&&this.currentAd.baseClip?this.currentAd.baseClip.noSkip:true;
d.globalDataType="com.theplatform.pdk.data::BaseClip";
var a=com.theplatform.pdk.SelectorExported.getInstance(this.controller.scopes.toString()).parseClip(d);
a.streamType="empty";
a.title="";
a.length=f.getTotalDuration(true)*1000;
a.mediaLength=f.getTotalDuration(true)*1000;
a.clipEnd=f.getTotalDuration(true)*1000;
d.trueLength=f.getTotalDuration(true)*1000;
e.baseClips.push(d);
e.clips.push(a)
}return e
},bind:function(b,c){var a=Array.prototype.slice.call(arguments);
a.shift();
c=a.shift();
return function(){return c.apply(b,a.concat(Array.prototype.slice.call(arguments)))
}
},pause:function(a){if(!this.clip||!this.clip.baseClip.isAd){return
}this._stopProgressTimer()
},resume:function(a){if(!this.clip||!this.clip.baseClip.isAd){return
}this._startProgressTimer()
},_startProgressTimer:function(){var a=this;
this._stopProgressTimer();
this._doProgressTimer();
this.progressTimerId=setInterval(function(){a._doProgressTimer()
},167)
},_stopProgressTimer:function(){clearInterval(this.progressTimerId)
},_doProgressTimer:function(){this._noopPlayer.mediaPlaying({currentTime:this.slot.getPlayheadTime(true)*1000,duration:this.slot.getTotalDuration(true)*1000})
}});
$pdk.ns("$pdk.plugin.freewheel.slotmanager");
$pdk.plugin.freewheel.slotmanager.MultiClipSlotManager=$pdk.extend($pdk.plugin.freewheel.slotmanager.SlotManager,{impression:false,load:false,constructor:function(a,c,b){$pdk.plugin.freewheel.slotmanager.SlotManager.call(this,a,c);
this.listeners=false;
this.parameters=b
},initialize:function(){$pdk.plugin.freewheel.slotmanager.MultiClipSlotManager.superclass.initialize.call(this);
this.impression=false;
this.load=false;
if(!this.listeners||this.adManager.resetsEvents()){this.listeners=true;
this.adManager.addEventListener(tv.freewheel.SDK.EVENT_AD_IMPRESSION,this.bind(this,this._onAdImpression))
}},start:function(a){this.playlist=a;
this.clip=a.clips[0];
this.index=-1;
this.slot=this.adManager.getSlotByCustomId(a.clips[0].baseClip.guid);
this.slot.play();
this.next(this.clip)
},stop:function(){if(this.slot){this.slot.stop()
}},next:function(a){if(this.playlist){if(a.baseClip.isAd&&a.streamType==="empty"){this.load=true;
this.clip=a;
this._checkStart()
}}else{if(a.baseClip.isAd&&a.streamType==="empty"){this.controller.nextClip()
}}},end:function(){this._stopProgressTimer();
if(this.clip){var a=this;
setTimeout(function(){a._endClip();
a.clip=null;
a.playlist=null
},1)
}},_onAdImpression:function(b){var c=b.slot||b.adInstance.getSlot();
var a=c.getTimePositionClass();
if(["PREROLL","MIDROLL","POSTROLL"].indexOf(a)>=0){this.impression=true;
this.index++;
this.adId=b.adInstance?b.adInstance.getAdId():b.adId;
this._checkStart()
}},_checkStart:function(){if(this.impression&&!this.load&&this.index>0){this._endClip()
}if(this.impression&&this.load){var a=this;
setTimeout(function(){a._startClip()
},1)
}},_startClip:function(){if(!this.clip){return
}this.impression=false;
this.load=false;
var b=this.adManager.getAdInfo(this.slot,this.adId,null,this.parameters);
if(b){this.clip.title=b.title;
this.clip.baseClip.isMid=(b.type=="midroll");
this.clip.length=parseInt(b.duration,10)*1000;
this.clip.mediaLength=parseInt(b.duration,10)*1000;
this.clip.clipEnd=this.clip.length;
this.clip.baseClip.trueLength=parseInt(b.duration,10)*1000;
if(!this.clip.baseClip.contentCustomData){this.clip.baseClip.contentCustomData={}
}this.clip.baseClip.contentCustomData["fw:category"]=b.category;
this.clip.baseClip.contentCustomData["fw:subcategory"]=b.subcategory;
this.clip.baseClip.contentCustomData["fw:type"]=b.type;
this.clip.baseClip.contentCustomData["fw:customData"]=b.customData;
this.clip.baseClip.contentCustomData["fw:titleId"]=b.titleId;
this.clip.baseClip.contentCustomData["fw:advertiserId"]=b.advertiserId;
this.clip.baseClip.contentCustomData["fw:siteSectionId"]=b.siteSectionId;
this.clip.baseClip.contentCustomData["fw:siteSectionTag"]=b.siteSectionTag;
this.clip.baseClip.contentCustomData["fw:adurl"]=b.adURL;
this.clip.baseClip.contentCustomData["fw:time_position_class"]=b.time_position_class;
this.clip.baseClip.contentCustomData["fw:base_unit"]=b.base_unit;
this.clip.baseClip.contentCustomData["fw:content_type"]=b.content_type;
if(this.parameters&&this.parameters.length){for(var a=0;
a<this.parameters.length;
a++){this.clip.baseClip.contentCustomData[this.parameters[a]]=b.parameters[this.parameters[a]]
}}this.controller.updateClip(this.clip)
}this._noopPlayer.activate();
this.setIOSPauseListeners(true);
this._noopPlayer.mediaStarts(this.clip);
this._startProgressTimer()
},_endClip:function(){if(!this._noopPlayer._active){this._noopPlayer.activate();
this._noopPlayer.mediaStarts(this.clip)
}this.setIOSPauseListeners(false);
this._stopProgressTimer();
this._noopPlayer.mediaEnds(this.clip);
this._noopPlayer.deactivate()
},pause:function(a){$pdk.plugin.freewheel.slotmanager.MultiClipSlotManager.superclass.pause.call(this,a)
},resume:function(a){$pdk.plugin.freewheel.slotmanager.MultiClipSlotManager.superclass.resume.call(this,a)
},createPlaylist:function(d){if(!d){return null
}var f={};
f.globalDataType="com.theplatform.pdk.data::Playlist";
f.baseClips=[];
f.clips=[];
for(var c=0;
c<d.length;
c++){var g=d[c];
if(!this.isTemporalSlot(g)){continue
}for(var b=0;
b<g.getAdCount();
b++){var e={};
if(b===0){e.URL=(this.adManager.proxy?g.getCustomId():"");
e.guid=g.getCustomId()
}else{e.URL=(this.adManager.proxy?g.getCustomId()+":"+b:"");
e.guid=g.getCustomId()+":"+b
}e.title="";
e.isAd=true;
e.noSkip=this.currentAd&&this.currentAd.baseClip?this.currentAd.baseClip.noSkip:true;
e.globalDataType="com.theplatform.pdk.data::BaseClip";
var a=com.theplatform.pdk.SelectorExported.getInstance(this.controller.scopes.toString()).parseClip(e);
a.streamType="empty";
a.title="";
f.baseClips.push(e);
f.clips.push(a)
}}return f
}});
$pdk.ns("$pdk.plugin.freewheel");
$pdk.plugin.freewheel.FreeWheel=$pdk.extend(function(){},{version:"VERSION_UNKNOWN",constructor:function(){this.adManager=null;
this.adManagerError=false;
this.setAdsWaiting=false;
this.requestPending=false;
this.requestSubmitted=false;
this.currentAd=null;
this.prerollSlots=[];
this.midrollSlots={};
this.postrollSlots=[];
this.currentVideo=null;
this.parameters=null;
this.bannerScriptName=null;
this.controller=null;
this.cuePointManager=this.getCuePointManager();
this.currentClip=null;
this.chapters=null;
this.testCustomValue=null;
this.isLive=false;
this.clipPerAd=true;
this.releaseUrl=null;
this.hasPrebuffered=false;
this.requestTimeout=5;
this.isOnLoadReleaseUrlInvoked=false;
this.adCustomParameters=null;
this.initVideoDisplayBase()
},initVideoDisplayBase:function(){this.videoDisplayBase=document.createElement("div");
this.videoDisplayBase.id="fw-pdk-plugin-video-display-base";
this.videoDisplayBase.style.display="none"
},initialize:function(c){this.controller=c.controller;
this.controller.registerAdPlugIn(this);
this.log("FreeWheel plug-in created");
this.runtime=this.controller.getProperty("videoEngineRuntime")||"html5";
if(this.runtime=="flash"){this.extension="swf"
}else{if(this.runtime=="html5"){this.extension="js"
}else{this.log(this.runtime+" Runtime not supported by FreeWheel");
this.parameters={};
return
}}if(c.vars.adManagerUrl){c.vars.adManagerUrl=c.vars.adManagerUrl
}if(c.vars.playerProfile){c.vars.playerProfile=c.vars.playerProfile.replace("{ext}",this.extension).replace("{runtime}",this.runtime)
}if(c.vars.playerProfileHTML5&&this.runtime=="html5"){c.vars.playerProfile=c.vars.playerProfileHTML5
}if(c.vars.playerProfileFlash&&this.runtime=="flash"){c.vars.playerProfile=c.vars.playerProfileFlash
}if(c.vars.bannerScriptName){this.bannerScriptName=c.vars.bannerScriptName
}if(c.vars.adCustomParameters){this.adCustomParameters=c.vars.adCustomParameters.split(",")
}this.loadVars=c.vars;
this.parameters=this.getParameters(window.fw_config?window.fw_config():null,this.loadVars);
if(c.vars.testCustomValue){this.testCustomValue=c.vars.testCustomValue
}if(c.vars.clipPerAd){this.clipPerAd=!(c.vars.clipPerAd==="false")
}if(c.vars.isLive){this.isLive=(c.vars.isLive==="true")
}if(c.vars.requestTimeout){this.requestTimeout=parseInt(c.vars.requestTimeout,10)||this.requestTimeout
}var a=this.controller.getOverlayArea();
this.log("initialize overlayArea width:"+a.width+" height:"+a.height);
if(a){this.videoDisplayBase.style.width=a.width+"px";
this.videoDisplayBase.style.height=a.height+"px"
}var b=this;
this.controller.addEventListener("OnLoadReleaseUrl",this.bind(this,this.onLoadReleaseUrl));
this.controller.addEventListener("OnSetReleaseUrl",this.bind(this,this.onSetReleaseUrl));
this.controller.addEventListener("OnReleaseStart",this.bind(this,this.onReleaseStart));
this.controller.addEventListener("OnReleaseEnd",this.bind(this,this.onReleaseEnd));
this.adManager=$pdk.plugin.freewheel.admanager.AdManagerFactory.create(this.runtime,this.parameters.adManagerUrl,this.controller,this.bind(this,this.onAdManagerLoaded),this.parameters.adManagerLoaderUrl);
this.isFlash=(this.runtime=="flash")
},onAdManagerLoaded:function(a){if(!this.adManager||!this.adManager.ready){this.log("onAdManagerLoaded(), failed to load");
this.adManagerError=true;
if(this.setAdsWaiting){this.controller.setAds(null)
}return
}if(this.parameters.isDebug){}else{}this.log("AdManager successfully loaded.",tpConsts.INFO);
this.adManager.setServer(this.parameters.serverUrl);
this.adManager.setNetwork(this.parameters.networkId);
if($pdk.parentUrl){this.adManager.setVisitorHttpHeader("referer",$pdk.parentUrl)
}this.controller.addEventListener("OnMediaLoadStart",this.bind(this,this.onMediaLoadStart));
this.controller.addEventListener("OnMediaStart",this.bind(this,this.onMediaStart));
this.controller.addEventListener("OnMediaPlaying",this.bind(this,this.onMediaPlaying));
this.controller.addEventListener("OnMediaEnd",this.bind(this,this.onMediaEnd));
this.controller.addEventListener("OnOverlayAreaChanged",this.bind(this,this.onOverlayAreaChanged));
this.slotManager=(this.clipPerAd?new $pdk.plugin.freewheel.slotmanager.MultiClipSlotManager(this.controller,this.adManager,this.adCustomParameters):new $pdk.plugin.freewheel.slotmanager.SlotManager(this.controller,this.adManager));
if(this.requestPending){this.submitRequest()
}},getReleaseUrl:function(b){var a=b.indexOf("?");
if(a>0){b=b.substr(0,a)
}return b
},resetDataForNewRelease:function(){this.log("resetDataForNewRelease()");
this.isOnLoadReleaseUrlInvoked=false;
this.midrollSlots={};
this.prerollSlots=[];
this.postrollSlots=[];
this.hasPrebuffered=false
},onOverlayAreaChanged:function(){var a=this.controller.getOverlayArea();
this.log("onOverlayAreaChanged() width:"+a.width+" height:"+a.height);
if(a){this.videoDisplayBase.style.width=a.width+"px";
this.videoDisplayBase.style.height=a.height+"px"
}},onSetReleaseUrl:function(a){if(this.adManagerError){return
}if(this.hasPrebuffered){this.submitRequest()
}else{this.hasPrebuffered=true
}this.log("onSetReleaseUrl():"+this.releaseUrl)
},onLoadReleaseUrl:function(e){if(this.adManagerError){return
}this.log("onLoadReleaseUrl():"+this.releaseUrl);
this.isOnLoadReleaseUrlInvoked=true;
var b=e.data;
var a=this.getReleaseUrl(b.url);
if(a==this.releaseUrl){this.log("onLoadReleaseUrl invoked after onReleaseStart, do not send request");
this.isOnLoadReleaseUrlInvoked=false;
this.releaseUrl=null;
return
}this.releaseUrl=a;
this.chapters=b.chapters;
var d=null;
if(this.parameters.customVideoAssetOverrideId){d=this.parameters.customVideoAssetOverrideId
}else{if(b&&this.parameters.customVideoAssetIdField){for(field in b){if(field.indexOf("$">1)){if(field.split("$")[1]==this.parameters.customVideoAssetIdField){d=b[field]
}}}this.log("Trying to get VideoAssetCustomId from release['"+this.parameters.customVideoAssetIdField+"']: "+d)
}}if(!d&&this.testCustomValue){d=this.testCustomValue
}if(!d&&b&&b.id){d=b.id.substr(b.id.lastIndexOf("/")+1);
this.log("Use release.id for videoAssetCustomId:"+d)
}var c=null;
if(b&&this.parameters.keyValuesField){for(field in b){if(field.indexOf("$">1)){if(field.split("$")[1]==this.parameters.keyValuesField){c=b[field]
}}}this.log("Getting keyValues from Media ['"+this.parameters.keyValuesField+"']: "+c)
}this.buildCurrentVideoInfo(d,null,c);
if(!this.hasPrebuffered){this.submitRequest()
}},onReleaseStart:function(d){if(this.adManagerError){return
}this.log("onReleaseStart()");
this.hasPrebuffered=false;
var c=d.data;
var g=this.getReleaseUrl(c.releaseURL);
this.chapters=c.chapters.chapters;
if(this.isOnLoadReleaseUrlInvoked){this.log("OnLoadReleaseUrl() has been invoked before");
if(g==this.releaseUrl){this.log("return since it's the same release");
return
}this.resetDataForNewRelease()
}this.releaseUrl=g;
this.log("chapters.length:"+this.chapters.length);
var e=this.getFirstContent(c);
var b=null;
var a=null;
var f=null;
if(e){this.setDesiredBitrate(e.bitrate);
f=e.URL;
if(this.parameters.customVideoAssetIdField&&e&&e.contentCustomData){b=e.contentCustomData[this.parameters.customVideoAssetIdField];
if(!b&&this.parameters.customVideoAssetIdField.indexOf("$")>-1){b=e.contentCustomData[this.parameters.customVideoAssetIdField.split("$")[1]]
}this.log("get videoAssetCustomId:"+b+" from customIdField:"+this.parameters.customVideoAssetIdField,tpConsts.INFO)
}if(!b&&this.testCustomValue){b=this.testCustomValue
}if(!b&&e){b=e.contentID;
this.log("get videoAssetCustomId:"+b+" from clip.baseClip.contentID")
}if(this.parameters.keyValuesField&&e&&e.contentCustomData){a=e.contentCustomData[this.parameters.keyValuesField];
if(!a&&this.parameters.keyValuesField.indexOf("$")>-1){a=e.contentCustomData[this.parameters.keyValuesField.split("$")[1]]
}this.log("Getting keyValues from Media ['"+this.parameters.keyValuesField+"']: "+a)
}}this.buildCurrentVideoInfo(b,f,a);
this.submitRequest()
},getFirstContent:function(d){if(!d.baseClips){return null
}var c=d.baseClips;
for(var a=0;
a<c.length;
a++){var b=c[a];
if(!b.isAd){return b
}}},onReleaseEnd:function(a){this.log("onReleaseEnd()");
if(this.slotManager){this.slotManager.stop()
}this.resetDataForNewRelease()
},isAd:function(a){return this.isFreeWheelUrl(a.URL)
},checkAd:function(b){if(!this.isFreeWheelUrl(b.URL)){this.log("checkAd(), return false for AdManger is null");
return false
}if(this.adManagerError){this.log("checkAd(), return false for AdManger failed to load");
return false
}if(!this.checkParameters()){this.log("checkAd() return false for required parameters are missed");
return false
}this.log("checkAd()");
if(this.controller.component.videoengineruntime!=="html5"){b.isExternal=true;
this.controller.modClip(b)
}this.currentAd=b;
var a=this;
setTimeout(function(){a.doSetAds()
},1);
return true
},doSetAds:function(){if(this.adManagerError||!this.adManager){this.controller.setAds(null);
return
}else{if(!this.adManager.ready||this.requestSubmitted){this.setAdsWaiting=true;
return
}}this.currentClip=null;
var a=this.getChapterPositionFromAd(this.chapters,this.currentAd);
var b;
if(a===0){this.log("setAds(), create prerolls length:"+this.prerollSlots.length,tpConsts.INFO);
b=this.slotManager.createPlaylist(this.prerollSlots)
}else{if(a==this.chapters.length){this.log("setAds(), create postrolls length:"+this.postrollSlots.length,tpConsts.INFO);
b=this.slotManager.createPlaylist(this.postrollSlots)
}else{if(a>0){this.log("setAds(), insert midroll slot for chapter "+a,tpConsts.INFO);
b=this.slotManager.createPlaylist(this.midrollSlots[this.generateMidrollCustomId(a)])
}}}this.setAdsWaiting=false;
this.currentPlaylist=b;
this.controller.setAds(b)
},getChapterPositionFromAd:function(d,c){if(!d||d.length===0){return -1
}for(var b=0;
b<d.length;
b++){var a=d[b];
if(a.adIndex==c.clipIndex||a.contentIndex>c.clipIndex){return b
}}return d.length
},isFreeWheelUrl:function(a){return(a.indexOf("freewheel.tv")>=0)
},checkParameters:function(){if(!this.parameters.adManagerUrl){this.log("adManagerUrl is required, return false",tpConsts.WARN);
return false
}if(!this.parameters.serverUrl){this.log("serverUrl is required, return false",tpConsts.WARN);
return false
}if(isNaN(this.parameters.networkId)||this.parameters.networkId<0){this.log("networkId is required, return false",tpConsts.WARN);
return false
}if(!this.parameters.playerProfile){this.log("playerProfile is required, return false",tpConsts.WARN);
return false
}return true
},buildCurrentVideoInfo:function(d,e,a){this.log("buildCurrentVideoInfo()");
this.currentVideo={};
this.currentVideo.customId=d;
this.currentVideo.location=e;
this.currentVideo.duration=0;
this.currentVideo.keyValues=a;
for(var c=0;
c<this.chapters.length;
c++){var b=this.chapters[c];
this.currentVideo.duration+=b.length/1000
}this.currentVideo.networkId=this.parameters.videoAssetNetworkId;
switch(this.parameters.autoPlayType){case"attended":this.currentVideo.autoPlayType=tv.freewheel.SDK.VIDEO_ASSET_AUTO_PLAY_TYPE_ATTENDED;
break;
case"unattended":this.currentVideo.autoPlayType=tv.freewheel.SDK.VIDEO_ASSET_AUTO_PLAY_TYPE_UNATTENDED;
break;
case"nonAutoPlay":this.currentVideo.autoPlayType=tv.freewheel.SDK.VIDEO_ASSET_AUTO_PLAY_TYPE_NON_AUTO_PLAY;
break
}this.logObj("currentVideo",this.currentVideo)
},generateMidrollCustomId:function(a){return"fw_tp_midroll_"+a
},submitRequest:function(){this.log("Requesting ads",tpConsts.INFO);
if(this.adManagerError){return
}if(!this.adManager.ready){this.requestPending=true;
return
}this.parameters=this.getParameters(window.fw_config?window.fw_config():null,this.loadVars);
this.hideVideoDisplayBase();
this.adManager.refresh();
var b,a;
for(a=0;
a<this.parameters.keyValues.length;
a++){b=this.parameters.keyValues[a];
this.adManager.addKeyValue(b[0],b[1])
}if(this.currentVideo.keyValues){keys=this.currentVideo.keyValues.split("&");
for(a=0;
a<keys.length;
a++){var c=keys[a].split("=");
this.adManager.addKeyValue(c[0],c[1])
}}this.slotManager.initialize();
this.adManager.initialize(this.controller,this.slotManager,this.videoDisplayBase);
this.adManager.setProfile(this.parameters.playerProfile);
this.adManager.setSiteSection(this.parameters.siteSectionId,this.parameters.siteSectionNetworkId,Math.floor(Math.random()*9999),0,this.parameters.fallbackSiteSectionId);
this.adManager.setVideoAsset(this.currentVideo.customId,this.currentVideo.duration,this.currentVideo.networkId,this.currentVideo.location,this.currentVideo.autoPlayType,Math.floor(Math.random()*9999),0,this.parameters.fallbackVideoAssetId);
this.adManager.setVisitor(this.getCustomVisitorId());
this.adManager.setParameter("wrapperVersion","ThePlatformJS-"+this.version);
if(this.bannerScriptName){this.adManager.setParameter("renderer.html.coadScriptName",this.bannerScriptName,tv.freewheel.SDK.PARAMETER_LEVEL_GLOBAL)
}this.adManager.setParameter(tv.freewheel.SDK.PARAMETER_RENDERER_VIDEO_DISPLAY_CONTROLS_WHEN_PAUSE,false,tv.freewheel.SDK.PARAMETER_LEVEL_GLOBAL);
this.adManager.setParameter(tv.freewheel.SDK.PARAMETER_EXTENSION_CONTENT_VIDEO_ENABLED,false,tv.freewheel.SDK.PARAMETER_LEVEL_GLOBAL);
this.adManager.setParameter(tv.freewheel.SDK.PARAMETER_EXTENSION_AD_CONTROL_CLICK_ELEMENT,this.videoDisplayBase.id,tv.freewheel.SDK.PARAMETER_LEVEL_GLOBAL);
this.adManager.setParameter(tv.freewheel.SDK.PARAMETER_PLAY_MIDROLL_BY_CURRENT_VIDEO_ELEMENT,true,tv.freewheel.SDK.PARAMETER_LEVEL_GLOBAL);
this.adManager.addEventListener(tv.freewheel.SDK.EVENT_REQUEST_COMPLETE,this.bind(this,this.onRequestComplete));
this.adManager.addEventListener(tv.freewheel.SDK.EVENT_SLOT_STARTED,this.bind(this,this.onSlotStarted));
this.adManager.addEventListener(tv.freewheel.SDK.EVENT_SLOT_ENDED,this.bind(this,this.onSlotEnded));
this.adManager.addEventListener(tv.freewheel.SDK.EVENT_CONTENT_VIDEO_PAUSE_REQUEST,this.bind(this,this.onContentVideoPauseRequest));
this.adManager.addEventListener(tv.freewheel.SDK.EVENT_CONTENT_VIDEO_RESUME_REQUEST,this.bind(this,this.onContentVideoResumeRequest));
this.adManager.addEventListener(tv.freewheel.SDK.EVENT_CONTENT_VIDEO_ATTACH,this.bind(this,this.onContentVideoAttach));
this.adManager.addEventListener(tv.freewheel.SDK.EVENT_CONTENT_VIDEO_DETACH,this.bind(this,this.onContentVideoDetach));
this.adManager.addEventListener(tv.freewheel.SDK.EVENT_AD_CLICK,this.bind(this,this.onAdClicked));
this.adManager.addEventListener(tv.freewheel.SDK.EVENT_AD_IMPRESSION,this.bind(this,this.onAdImpression));
if(this.isLive){this.log("preroll");
this.adManager.addTemporalSlot("fw_tp_preroll_0",tv.freewheel.SDK.ADUNIT_PREROLL,0)
}for(a=1;
a<this.chapters.length;
a++){this.log("chapters["+a+"]: ("+this.chapters[a].startTime+","+this.chapters[a].endTime+")");
this.adManager.addTemporalSlot(this.generateMidrollCustomId(a),tv.freewheel.SDK.ADUNIT_MIDROLL,this.chapters[a].startTime/1000)
}for(b in this.parameters.renderers){this.log("renderer("+b+"):"+this.parameters.renderers[b]);
this.adManager._rendererManifest[b]=this.parameters.renderers[b]
}if(this.isLive){this.adManager.setRequestMode("live")
}else{this.adManager.setRequestMode("on-demand")
}this.resize();
this.requestSubmitted=true;
this.adManager.submitRequest(this.requestTimeout)
},getCustomVisitorId:function(){if(!this.parameters.externalCustomVisitor){return null
}var customVisitorId=null;
try{customVisitorId=eval.call(this,"window."+this.parameters.externalCustomVisitor+"()")
}catch(error){this.log("warning: get an error when try to get externalCustomVisitor, message:"+error.message,tpConsts.WARN)
}if(!customVisitorId){this.log("warning: js function "+this.parameters.externalCustomVisitor+"() returns null or empty string",tpConsts.WARN)
}this.log("getCustomVisitorId(), return:"+customVisitorId);
return customVisitorId
},onRequestComplete:function(c){this.requestSubmitted=false;
this.log("Ads request complete",tpConsts.INFO);
this.cuePointManager.refresh();
var b=this.adManager.getTemporalSlots();
for(var a=0;
a<b.length;
a++){var d=b[a];
switch(d.getTimePositionClass()){case tv.freewheel.SDK.TIME_POSITION_CLASS_PREROLL:if(d.getCustomId()!="_fw_empty_preroll_slot"){this.log("adding preroll slot:"+d.getCustomId()+" to position:"+this.prerollSlots.length,tpConsts.DEBUG);
this.prerollSlots.push(d)
}break;
case tv.freewheel.SDK.TIME_POSITION_CLASS_POSTROLL:this.log("adding postroll slot:"+d.getCustomId()+" to position:"+this.postrollSlots.length,tpConsts.DEBUG);
this.postrollSlots.push(d);
break;
case tv.freewheel.SDK.TIME_POSITION_CLASS_MIDROLL:if(d.getAdCount()){this.log("adding midroll ads id:"+d.getCustomId()+" num ads:"+d.getAdCount(),tpConsts.DEBUG);
this.midrollSlots[d.getCustomId()]=[d]
}else{this.log("adding temporal midpoint slot to cuePointManager");
this.cuePointManager.addTemporalSlot(d)
}break;
case tv.freewheel.SDK.TIME_POSITION_CLASS_OVERLAY:this.cuePointManager.addTemporalSlot(d);
break
}}if(this.setAdsWaiting){this.doSetAds()
}},setDesiredBitrate:function(a){this.log("setDesiredBitrate()"+a);
if(a>0){this.bitrate=a;
if(this.adManager&&this.adManager.ready){}}},isFreeWheelClip:function(b){if(b.streamType=="empty"&&b.baseClip.guid){var a=b.baseClip.guid;
if(a.indexOf(":")>=0){a=a.split(":")[0]
}if(this.adManager.getSlotByCustomId(a)){return true
}}return false
},onMediaLoadStart:function(b){var a=b.data;
this.log("onMediaLoadStart() clip.streamType = "+a.streamType+" url:"+a.URL);
if(this.isFreeWheelClip(a)){var c=this.adManager.getSlotByCustomId(a.baseClip.guid);
if(c){this.log("Playing ad slot:"+c.getCustomId(),tpConsts.INFO);
this.currentClip=a;
this.log("onSlotStarted() dispatch OnMediaStart event");
this._hasStarted=true;
this.slotManager.start(this.currentPlaylist)
}else{if(this._hasStarted){this.slotManager.next(a)
}}}},onMediaStart:function(a){this.log("onMediaStart");
if(this.adManager&&a.data&&a.data.baseClip.isAd===false&&a.data.chapter&&a.data.chapter.index===0){this.adManager.setVideoState(tv.freewheel.SDK.VIDEO_STATE_PLAYING);
if(a.data.baseClip.bitrate>0){this.setDesiredBitrate(a.data.baseClip.bitrate)
}}},onMediaPlaying:function(b){var a=b.data;
if(this.adManager.ready&&!a.isAd){var c=this.cuePointManager.getPlayableSlot(b.data.currentTimeAggregate/1000);
if(c){c.play()
}}},onMediaEnd:function(a){},onSlotStarted:function(a){if(this.isTemporalSlot(a.slot)){this.log("Slot started",tpConsts.INFO);
this.showVideoDisplayBase()
}},onSlotEnded:function(b){if(this.isTemporalSlot(b.slot)){if(this.currentClip&&this.currentClip.baseClip&&this.currentClip.baseClip.guid&&this.currentClip.baseClip.guid.split(":")[0]!==b.slot.getCustomId()){return
}this.log("Slot ended",tpConsts.INFO);
if(this._hasStarted){this._hasStarted=false;
var a=this;
setTimeout(this.bind(this,function(){a.slotManager.end()
}),250)
}this.hideVideoDisplayBase()
}},onContentVideoPauseRequest:function(a){this.log("onContentVideoPauseRequest()")
},onContentVideoResumeRequest:function(a){this.log("onContentVideoResumeRequest()")
},onContentVideoAttach:function(a){this.log("onContentVideoAttach()")
},onContentVideoDetach:function(a){this.log("onContentVideoDetach()")
},onAdClicked:function(a){this.log("onAdClicked()");
this.controller.dispatchEvent("OnAdvertisementClick",{data:{}})
},onAdImpression:function(f){if(!this.currentClip){return
}this.log("onAdImpression()");
var h=this.adManager.getSlotByCustomId(this.currentClip.baseClip.guid);
var e;
var d=h.getAdInstances(false);
for(var c=0;
c<d.length;
c++){e=d[c];
if(e.getAdId()==f.adInstance.getAdId()){if(e.getCompanionAdInstances){var b=e.getCompanionAdInstances();
var g;
if(b&&b.length>0){for(var a=0;
a<b.length;
a++){g=b[a];
if(g.isRequiredToShow&&g.isRequiredToShow()){this.controller.showFullScreen(false);
break
}}}}}}},isSlotMappedToCurrentClip:function(a){if(this.currentClip&&this.currentClip.baseClip.isAd&&this.currentClip.baseClip.guid==a.getCustomId()){return true
}return false
},isTemporalSlot:function(a){if(a){return[tv.freewheel.SDK.TIME_POSITION_CLASS_PREROLL,tv.freewheel.SDK.TIME_POSITION_CLASS_MIDROLL,tv.freewheel.SDK.TIME_POSITION_CLASS_OVERLAY,tv.freewheel.SDK.TIME_POSITION_CLASS_POSTROLL].indexOf(a.getTimePositionClass())>-1
}return false
},resize:function(){var a=this.controller.getMediaArea();
if(this.adManager&&a){this.logObj("resize() mediaArea",a)
}},showVideoDisplayBase:function(){this.log("showVideoDisplayBase");
this.videoDisplayBase.style.display=""
},hideVideoDisplayBase:function(){this.log("hideVideoDisplayBase");
this.videoDisplayBase.style.display="none"
},getParameters:function(f,g){this.log("getParameters()");
if(!f){f={}
}if(!g){g={}
}this.logObj("jsConfig",f);
this.logObj("loadVars",g);
var d=function(k,i){if(k){return f[k]?f[k]:(g[k]?g[k]:i)
}return null
};
var h={};
var a=tpLogLevel=="debug"?true:false;
h.isDebug=d("isDebug",a);
h.adManagerUrl=d("adManagerUrl");
h.adManagerLoaderUrl=d("adManagerLoaderUrl");
h.bannerScriptName=d("bannerScriptName");
h.serverUrl=d("serverUrl");
h.networkId=Number(d("networkId"));
h.playerProfile=d("playerProfile");
h.videoAssetNetworkId=Number(d("videoAssetNetworkId"));
h.siteSectionNetworkId=Number(d("siteSectionNetworkId"));
h.siteSectionId=d("siteSectionId");
h.autoPlayType=d("autoPlayType");
h.fallbackVideoAssetId=Number(d("fallbackVideoAssetId"));
h.fallbackSiteSectionId=Number(d("fallbackSiteSectionId"));
h.customVideoAssetIdField=d("customVideoAssetIdField");
h.customVideoAssetOverrideId=d("customVideoAssetOverrideId");
h.keyValuesField=d("keyValuesField");
h.renderers=d("renderers");
h.externalCustomVisitor=d("externalCustomVisitor");
h.keyValues=[];
var j=d("keyValues");
if(j){var b=j.split("&");
for(var e=0;
e<b.length;
e++){var c=b[e].split("=");
if(c.length==2){h.keyValues.push([unescape(c[0]),unescape(c[1])])
}}}this.logObj("parameters",h);
return h
},getCuePointManager:function(){CuePointManager=Class.extend({init:function(){this.slots=[]
},addTemporalSlot:function(a){this.slots.push({target:a})
},getPlayableSlot:function(b){var a=null;
for(var d=0;
d<this.slots.length;
d++){var c=this.slots[d];
if(!c.isPlayed&&Math.abs(c.target.getTimePosition()-b)<1){c.isPlayed=true;
a=c.target
}else{if(c.isPlayed&&Math.abs(c.target.getTimePosition()-b)>5){c.isPlayed=false
}}}return a
},refresh:function(){this.init()
}});
return new CuePointManager()
},bind:function(b,c){var a=Array.prototype.slice.call(arguments);
a.shift();
c=a.shift();
return function(){return c.apply(b,a.concat(Array.prototype.slice.call(arguments)))
}
},logObj:function(b,c){for(var a in c){this.log(b+": "+a+" = "+c[a])
}},log:function(a,b){if(!b){b=tpConsts.DEBUG
}tpDebug(a,this.controller.id,"FreeWheel",b)
},getCurrentAdInfo:function(){if(this.adManager&&this.slotManager&&this.slotManager.slot){return this.adManager.getAdInfo(this.slotManager.slot,this.slotManager.adId)
}else{return null
}},getCurrentSlot:function(){if(this.adManager&&this.slotManager&&this.slotManager.slot){return this.slotManager.slot
}else{return null
}}});
$pdk.plugin.freewheel._instance=new $pdk.plugin.freewheel.FreeWheel();
tpController.plugInLoaded($pdk.plugin.freewheel._instance,$pdk.plugin.freewheel._instance.videoDisplayBase);