$pdk.ns("$pdk.plugin.ratings.BasicTimer");
$pdk.plugin.ratings.BasicTimer=$pdk.extend(function(){},{constructor:function(){this._interval=1000;
this._tickCounter=0;
this._id=0;
this._isRunning=false
},setCallback:function(a){this._callback=a
},start:function(a){this.log("start; seconds: "+a);
this._seconds=a;
this.go()
},go:function(){this.log("go; isRunning: "+this._isRunning);
if(!this._isRunning){var a=this;
this._isRunning=true;
this._id=setInterval(function(){a._tick()
},this._interval)
}},_tick:function(){this.log("tick: "+this._tickCounter);
if(this._seconds<=this._tickCounter){this.log("timer complete");
this._callback(this._id);
this.reset()
}else{this._tickCounter++
}},stop:function(){this.log("stop");
this._isRunning=false;
clearInterval(this._id)
},isRunning:function(){return this._isRunning
},reset:function(){this.log("reset");
this.stop();
this._tickCounter=0
},log:function(a){tpDebug("BasicTimer: "+a)
}});
$pdk.ns("$pdk.plugin.ratings.Ratings");
$pdk.plugin.ratings.Ratings=$pdk.extend(function(){},{constructor:function(){this.log("Ratings is up")
},initialize:function(b,a){this._shouldBeDisplayed=true;
this._isFirstClip=true;
this._isAd=false;
this.mediaArea={width:0,height:0};
this.imageManager=this.setUpRatingsImageManager();
this.imageManager.setImageElement(a);
this.nameMap=this.setUpNameMap();
this.loadVars=this.setUpLoadVarsManager();
this.ratingsTimer=this.setUpTimerUtils();
this.loadVars.setLoadVars(b.vars);
this.controller=b.controller;
this.attachEventlisteners()
},attachEventlisteners:function(){var a=this;
this.controller.addEventListener("OnMediaStart",function(){a.handleMediaStart.apply(a,arguments)
});
this.controller.addEventListener("OnMediaPlaying",function(){a.handleMediaPlaying.apply(a,arguments)
});
this.controller.addEventListener("OnReleaseStart",function(){a.handleLoadRelease.apply(a,arguments)
});
this.controller.addEventListener("OnReleaseEnd",function(){a.handleReleaseEnd.apply(a,arguments)
});
this.controller.addEventListener("OnMediaError",function(){a.handleMediaError.apply(a,arguments)
});
this.controller.addEventListener("OnMediaPause",function(){a.handleMediaPause.apply(a,arguments)
});
this.controller.addEventListener("OnMediaUnpause",function(){a.handleMediaUnpause.apply(a,arguments)
});
this.controller.addEventListener("OnMediaAreaChanged",function(){a.handleMediaAreaChanged.apply(a,arguments)
})
},setUpRatingsImageManager:function(){var a={HD:{size:{width:1920,height:1080},position:{x:195,y:100}},SD:{size:{width:640,height:480},position:{x:70,y:40}}};
return new $pdk.plugin.ratings.RatingsImageManager(a)
},setUpNameMap:function(){var a=new $pdk.plugin.ratings.RatingsNameMap();
this._namingProperties={HD:[{subdir:"hd_large",definition:"H",size:"L"},{subdir:"hd_mid",definition:"H",size:"M"}],SD:[{subdir:"sd_large",definition:"S",size:"L"},{subdir:"sd_mid",definition:"S",size:"M"}]};
a.setNamingPattern("{subdir}/{size}{rating}{subratings}{definition}");
return a
},setUpLoadVarsManager:function(){return new $pdk.plugin.ratings.RatingsLoadVars()
},setUpTimerUtils:function(){var a=new $pdk.plugin.ratings.BasicTimer();
var b=this;
a.setCallback(function(){b.hideRating()
});
return a
},handleMediaPlaying:function(b){var a=Math.round(b.data.currentTime*100)/100;
if(this._reminder>-1&&a>(this._reminder*1000)&&!this._isAd){this.showRating();
this._reminder=-1
}},handleMediaStart:function(b){var a=b.data;
this._isAd=a.baseClip&&a.baseClip.isAd;
if(this._isAd){this._shouldBeDisplayed=true;
this.hideRating()
}else{if(a.baseClip&&a.baseClip.ratings.length>0&&this._shouldBeDisplayed){this.nameMap.setRatings(a.baseClip.ratings);
this.showRating();
if(this._isFirstClip){this._isFirstClip=false
}}}},handleLoadRelease:function(a){this.resetState()
},handleReleaseEnd:function(a){this.resetState()
},resetState:function(){this.imageManager.hide();
this._shouldBeDisplayed=true;
this._isFirstClip=true;
this._reminder=this.loadVars.getReminder()
},handleMediaPause:function(a){this.log("handleMediaPause");
if(!this._isAd&&this.ratingsTimer.isRunning()){this.log("handleMediaPause: calling ratingsTimer.stop");
this.ratingsTimer.stop()
}},handleMediaUnpause:function(a){this.log("handleMediaUnpause");
if(!this._isAd&&!this.ratingsTimer.isRunning()){this.log("handleMediaUnpause: calling ratingsTimer.go");
this.ratingsTimer.go()
}},handleMediaError:function(a){this.hideRating()
},handleMediaAreaChanged:function(a){if(this.mediaArea.width!=a.data.width||this.mediaArea.height!=a.data.height){this.mediaArea.width=a.data.width;
this.mediaArea.height=a.data.height;
this.imageManager.setContainerSize(this.mediaArea)
}},showRating:function(){this.log("showRating");
if(this._isAd){this.log("showRating: _isAd was true, doing nothing");
return
}this.log("showRating: showing rating");
var c=this._namingProperties[this.imageManager.isHD()?"HD":"SD"][this._isFirstClip?0:1];
var b=this.nameMap.getImageName(this.loadVars.getScheme(),c);
this.imageManager.setImageSrc(this.loadVars.getPath()+b);
if(!this.ratingsTimer.isRunning()){var a=this.loadVars.getDelay();
this.log("showRating: ratingsTimer.isRunning() was false, starting timer with delay: "+a);
this.ratingsTimer.start(a)
}},hideRating:function(){this.log("hideRating");
this.imageManager.hide()
},log:function(a){tpDebug("Ratings: "+a)
}});
$pdk.ns("$pdk.plugin.ratings.RatingsImageManager");
$pdk.plugin.ratings.RatingsImageManager=$pdk.extend(function(){},{constructor:function(a){this._config=a;
this._imgElement=undefined;
this._srcLoaded=false;
this._currentSrc="";
this._containerSize={};
this._nativeImageSize={}
},setImageElement:function(a){if(this._imgElement){return
}var b=this;
this._imgElement=a;
this._imgElement.style.position="absolute";
this._imgElement.style.zIndex=0;
this._imgElement.style.visibility="hidden";
this._imgElement.onerror=function(c){b._onError(c)
};
this._imgElement.onload=function(c){b._onLoad(c)
}
},setImageSrc:function(a){if(this._srcLoaded){if(this._currentSrc===a){this.show();
return
}}this.hide();
this._srcLoaded=false;
this._imgElement.src=this._currentSrc=a
},setContainerSize:function(a){if(!a){return
}this._containerSize.width=a.width;
this._containerSize.height=a.height;
this.resizeImage();
this.positionImage()
},_getContainerSize:function(){if(!this._containerSize.hasOwnProperty("width")||!this._containerSize.hasOwnProperty("height")){var a=this._imgElement.parentNode;
this._containerSize={width:(a?a.clientWidth:100),height:(a?a.clientHeight:100)}
}return this._containerSize
},resizeImage:function(){if(!this._imgElement||this._imgElement.clientWidth===0){return
}var a=this._config[(this.isHD()?"HD":"SD")].size;
var b=Math.min(1,(this._getContainerSize().width/a.width));
this._imgElement.style.width=Math.floor(this._nativeImageSize.width*b)+"px"
},positionImage:function(){var a=this._config[(this.isHD()?"HD":"SD")];
var b=Math.min(1,(this._getContainerSize().width/a.size.width));
this._imgElement.style.top=Math.floor(b*a.position.x)+"px";
this._imgElement.style.left=Math.floor(b*a.position.y)+"px"
},_onError:function(a){this._srcLoaded=false
},_onLoad:function(a){this._srcLoaded=true;
this._imgElement.style.width="auto";
this._imgElement.style.height="auto";
this._nativeImageSize.width=this._imgElement.clientWidth;
this._nativeImageSize.height=this._imgElement.clientHeight;
this.resizeImage();
this.positionImage();
this.show()
},isVisible:function(){return(this._imgElement.style.visibility=="visible")
},isHD:function(){return((this._getContainerSize().width/this._getContainerSize().height)>1.33)
},show:function(){if(!this.isVisible()&&this._srcLoaded){this._imgElement.style.visibility="visible"
}},hide:function(){if(this.isVisible()){this._imgElement.style.visibility="hidden"
}}});
$pdk.ns("$pdk.plugin.ratings.RatingsLoadVars");
$pdk.plugin.ratings.RatingsLoadVars=$pdk.extend($pdk.plugin.ratings.LoadVarsManager,{constructor:function(){this._delay=15;
this._scheme="";
this._position={x:100,y:20};
this._reminder=-1;
$pdk.plugin.ratings.RatingsLoadVars.superclass.constructor.call(this)
},initVars:function(){this.addVar({name:"path",value:$pdk.scriptRoot+"/../images/ratings/"});
this.addVar({name:"delay",value:15});
this.addVar({name:"scheme",value:"urn:v-chip"});
this.addVar({name:"position",value:{x:100,y:20}});
this.addVar({name:"reminder",value:-1})
},getPath:function(){return this.getVar("path")
},getDelay:function(){return this.getVar("delay")
},getScheme:function(){var a=this._prependUrn(this.getVar("scheme").toLowerCase());
return a
},_prependUrn:function(a){if(!a.match(/^urn:/)){a="urn:"+a
}return a
},getPosition:function(){return this.getVar("position")
},getReminder:function(){return this.getVar("reminder")
}});
$pdk.ns("$pdk.plugin.ratings.RatingsNameMap");
$pdk.plugin.ratings.RatingsNameMap=$pdk.extend(function(){},{constructor:function(){this._suffix=".png";
this._ratings=[];
this._namingPattern="{rating}{subratings}";
this._filenameToUpper=true
},setNamingPattern:function(a){if(a.indexOf("{rating}")<0){console.log("Missing {rating} in naming pattern definition")
}else{this._namingPattern=a
}},setFilenameToUpper:function(a){this._filenameToUpper=a
},setRatings:function(a){this._ratings=a
},setSuffix:function(a){this._suffix=a
},getImageName:function(c,b){var e=this._namingPattern,f=this._getRating(c),a="",i;
if(!f){return null
}var h=f.rating;
var g="";
if(f.rating.indexOf(" ")){_rating=h.split(" ")[0].replace("-","");
g=h.split(" ")[1]
}e=e.replace("{rating}",_rating);
if(e.indexOf("{subratings}")>-1){a=(g)?g:"";
if(f.hasOwnProperty("subRatings")&&f.subRatings.length>0){a=f.subRatings.sort().join("").replace("-","")
}e=e.replace("{subratings}",a)
}if(this._filenameToUpper){e=e.toUpperCase()
}for(var d in b){if(b.hasOwnProperty(d)){i="{"+d+"}";
if(this._filenameToUpper){i=i.toUpperCase()
}if(e.indexOf(i)>=0){e=e.replace(i,b[d])
}}}return e+this._suffix
},_getRating:function(b){for(var a in this._ratings){if(this._ratings[a].scheme.toLowerCase()==b){return this._ratings[a]
}}return null
}});