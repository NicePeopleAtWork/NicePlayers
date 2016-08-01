/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins.doubleclick
{
import com.theplatform.pdk.data.PauseStates;
import com.theplatform.pdk.plugins.doubleclick.strategy.*;

    import com.google.ads.ima.api.AdsLoader;
    import com.google.ads.ima.api.AdsManager;
    import com.google.ads.ima.api.Ad;
    import com.google.ads.ima.api.AdsRenderingSettings;
    import com.google.ads.ima.api.AdsRequest;
    import com.google.ads.ima.api.ViewModes;
    import com.google.ads.ima.api.AdEvent;
    import com.google.ads.ima.api.AdErrorEvent;
    import com.google.ads.ima.api.AdsManagerLoadedEvent;

    import com.theplatform.pdk.controllers.IPlayerController;
    import com.theplatform.pdk.data.BaseClip;
    import com.theplatform.pdk.data.Clip;
    import com.theplatform.pdk.data.LoadObject;
    import com.theplatform.pdk.data.Playlist;
    import com.theplatform.pdk.data.TimeObject;
    import com.theplatform.pdk.data.StreamType;
    import com.theplatform.pdk.events.PlayerEvent;
    import com.theplatform.pdk.plugins.NoOpPlugIn;
    import com.theplatform.pdk.main.Version;

import com.theplatform.pdk.plugins.doubleclick.strategy.AdRulesStrategy;

import flash.display.Graphics;

import flash.display.Sprite;

import flash.events.TimerEvent;
import flash.external.ExternalInterface;
import flash.geom.Rectangle;

	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.plugins.IAdPlugIn;
	import com.theplatform.pdk.utils.Debug;
	import com.theplatform.pdk.utils.PdkStringUtils;
	
    import flash.utils.Timer;
    import flash.utils.setTimeout;

    public class Doubleclick extends NoOpPlugIn implements IAdPlugIn
    {

        private static const DEFAULT_HOST:String = "doubleclick.net";
        private static const DEFAULT_MIMETYPE:String = null;

        private var _hosts:Array;
        private var _mimeTypes:Array;
        private var _plugInVars:Object;
        private var _companionBackfill:String = "always"; // always or onlyForMasterAd
        private var _competitiveExclusion:String = "on"; // legacyDfp, off, on
        private var _uniqueAds:Boolean = true;
        private var _liveAds:Boolean = false;

        private var _controller:IPlayerController;
        private var _strategy:IDoubleClickStrategy;

        // passed in from canvas
        private var _priority:Number;

        // IMA3 SDK objects
        private var _adsLoader:AdsLoader;
        private var _adsManager:AdsManager;
        private var _adsErrorForNextCheckAd:Boolean = false;
        private var _adsRequestInProgress:Boolean = false;
        private var _slotPending:Boolean = false;
        private var _signedUpForAd:Boolean = false;
        private var _setAdsCalled:Boolean = false;
        private var _currentBitrate:Number = 750;
        private var _contentTimeObject:TimeObject;
        private var _podTimeObject:TimeObject;
        private var _aggregatePodTime:Number = 0;
        private var _playheadTimer:Timer;
        private var _abr:Boolean = false;
        private var _contentClip:Clip;
        private var _sourceClip:Clip;
        private var _adClip:Clip;
        private var _ad:Ad;
        private var _adPlaying:Boolean = false;
        private var _contentComplete:Boolean = false;
        private var _playlist:Playlist;
        private var _podIndex:Number = 1;
        private var _mediaLoadStart:Boolean = false;
        private var _linearAdStarted:Boolean = false;
        private var _mediaStartsTimer:Timer = new Timer(1,1);
        private var _usedMidrollCuePoints:Array = [];
        private var _currentTimeAggregate:Number = NaN;

        public function Doubleclick()
        {
            super();
        }

        /////////////////////
        //	INITIALIZATION
        /////////////////////

        public override function initialize(lo:LoadObject):void
        {
            super.initialize(lo);
            _controller = lo.controller as IPlayerController;
            _controller.setPlugInsAboveControls(false);

            _plugInVars = lo.vars;
            var priority:Number = lo.priority;
            _hosts = extractLoadVars(lo, ['host', 'hosts'], DEFAULT_HOST);
            _controller.trace("hosts: "+ _hosts.join(","),"DoubleClick", Debug.INFO);
            _mimeTypes = extractLoadVars(lo, ['mimeType', 'mimeTypes'], DEFAULT_MIMETYPE);
            _controller.trace("mimeTypes: "+ _mimeTypes.join(","),"DoubleClick", Debug.INFO);

            if (lo.vars['competitiveExclusion'])
                _competitiveExclusion = lo.vars['competitiveExclusion'];

            if (lo.vars['companionBackfill'])
                _companionBackfill = lo.vars['companionBackfill'];

            if (lo.vars['uniqueAds'] == "false") _uniqueAds = false;

            if (priority)
                _priority = priority;

            _controller.trace("Initializing Doubleclick (IMA3)","Doubleclick", Debug.INFO);

            _controller.addEventListener(PdkEvent.OnReleaseStart, onReleaseStart);
            _controller.addEventListener(PdkEvent.OnReleaseEnd, onReleaseEnd);
            _controller.addEventListener(PdkEvent.OnMediaStart, onMediaStart);
            _controller.addEventListener(PdkEvent.OnMediaEnd, onMediaEnd);
//            _controller.addEventListener(PdkEvent.OnMediaPlaying, onMediaPlaying);

            _controller.addEventListener(PdkEvent.OnStreamSwitched, onStreamSwitched);
            _controller.addEventListener(PdkEvent.OnMediaLoadStart, onMediaLoadStart);

            _controller.addEventListener(PlayerEvent.OnMediaAreaChanged, onMediaAreaChanged);
            _controller.addEventListener(PlayerEvent.OnOverlayAreaChanged, onOverlayAreaChanged);
            _controller.addEventListener(PlayerEvent.OnFlashFullScreen, onFlashFullScreen);
            _controller.addEventListener("OnAdvertisementLoadStart", onAdvertisementLoadStart);

            _controller.registerAdPlugIn(this, "Doubleclick", _priority);

            initAdsLoader();
        }


        private function initAdsLoader():void
        {

            _adsLoader = new AdsLoader();

            // Important! by default, IMA3 wants to drive the player
            // but the PDK should be in charge. Setting this to false
            // enables the PDK to drive
            _adsLoader.settings.autoPlayAdBreaks = false;

            _adsLoader.settings.playerType = "thePlatform";

//            log("set IMASdkSettings to : player: "+_adsLoader.settings.playerType+", version: "+_adsLoader.settings.playerVersion);
            _adsLoader.settings.companionBackfill = _companionBackfill;
            _adsLoader.settings.competitiveExclusion = _competitiveExclusion;
            _adsLoader.settings.uniqueAds = _uniqueAds;

            _adsLoader.settings.playerType = "theplatform/pdk";
            _adsLoader.settings.playerVersion = Version.major + "." + Version.minor + "." + Version.servicePack;

            _adsLoader.loadSdk();

            log("initAdsLoader: " + _adsLoader.sdkVersion);

            _adsLoader.addEventListener(AdErrorEvent.AD_ERROR, onAdsLoadError);
        }

        private function onAdsManagerLoaded(e:AdsManagerLoadedEvent):void
        {
            _controller.trace("IMA3 AdsManager loaded: " + _slotPending,"Doubleclick", Debug.INFO);
            _adsRequestInProgress = false;
            _adsLoader.removeEventListener(AdsManagerLoadedEvent.ADS_MANAGER_LOADED, onAdsManagerLoaded);

            // Publishers can modify the default preferences through this object.
            var settings:AdsRenderingSettings = new AdsRenderingSettings();
            // Options: autoAlign, bitrate, delivery, linearAdPreferred, mimeTypes, useStyledNonLinearAds

            settings.autoAlign = true;
            settings.bitrate = _currentBitrate;
            settings.delivery = "streaming";
            settings.linearAdPreferred = true;
            settings.useStyledNonLinearAds = true;

            if(_mimeTypes && _mimeTypes.length > 0)
            {
                settings.mimeTypes = _mimeTypes;
            }

            // In order to support VMAP ads, ads manager requires an object that
            // provides current playhead position for the content.

            var playhead:Object = {
                time: this.getNextDoubleClickTime
            };

            // Get a reference to the AdsManager object through the event object.
            _adsManager = e.getAdsManager(playhead, settings);


            if (_adsManager)
            {
                _adsManager.volume = _controller.getMuteState() ? 0 : 1;

                _adsManager.addEventListener(AdEvent.ALL_ADS_COMPLETED, onAllAdsCompleted);
                _adsManager.addEventListener(AdErrorEvent.AD_ERROR, onAdError);
                _adsManager.addEventListener(AdEvent.CONTENT_PAUSE_REQUESTED, onContentPauseRequested);
                _adsManager.addEventListener(AdEvent.CONTENT_RESUME_REQUESTED, onContentResumeRequested);
                _adsManager.addEventListener(AdEvent.STARTED, onAdStarted);
                _adsManager.addEventListener(AdEvent.PAUSED, onAdPaused);
                _adsManager.addEventListener(AdEvent.PAUSED, onAdResumed);
                _adsManager.addEventListener(AdEvent.COMPLETED, onAdCompleted);
                _adsManager.addEventListener(AdEvent.DURATION_CHANGED, onAdDurationChanged);
                _adsManager.addEventListener(AdEvent.CLICKED, onAdClicked);
                _adsManager.addEventListener(AdEvent.LINEAR_CHANGED, onAdLinearChanged);
                _adsManager.addEventListener(AdEvent.EXPANDED_CHANGED, onAdExpandedChanged);
                _adsManager.addEventListener(AdEvent.USER_CLOSED, onAdUserClosed);
                _adsManager.addEventListener(AdEvent.LOG, onAdLog);
                _adsManager.addEventListener(AdEvent.SKIPPABLE_STATE_CHANGED, onAdSkippableStateChanged);
                _adsManager.addEventListener(AdEvent.SKIPPED, onAdSkipped);


                this.addChild(_adsManager.adsContainer);

                // determine which strategy to use
                _controller.trace("AdsManager.cuePoints: " + _adsManager.cuePoints.join(", "),"Doubleclick", Debug.INFO);

                if (_adsManager.cuePoints && _adsManager.cuePoints.length > 0)
                {
                    _strategy = new AdRulesStrategy(haveCuePointForAdBreak, _adsLoader, _controller);
                    if(_adsManager.cuePoints[0]==-1)
                        _currentTimeAggregate = 1; // post roll only
                }
                else
                {
                    _strategy = new VastStrategy(requestAds, _adsLoader,  _controller);
                }

                _strategy.adsManager = _adsManager;

                // Init should be called before playing the content in order for VMAP
                // ads to function correctly.
                var area:Rectangle = _controller.getMediaArea();

                var handshakeString:String = _adsManager.handshakeVersion("2.0");
                _controller.trace("handshakeString: " + handshakeString,"Doubleclick", Debug.INFO);

                _adsManager.init(area.width, area.height, getViewMode());

                if (_slotPending)
                {
                    _strategy.preparePod(_sourceClip.baseClip.computeUrl());
                    if(!_strategy.playNextPod())
                    {
                        bypassAdBreak();
                    }
                }

            }
            else {
                _controller.trace("Error: AdsManager is null!", "Doubleclick", Debug.ERROR);
            }
        }

        private function onAdvertisementLoadStart(e:*):void
        {
            log("OnAdvertisementLoadStart heard, setting liveAds to true");
            if(!_liveAds)
            {
                log("\treboot adsManager if we are going to a live ads state.");
                cleanUp();
            }
            _liveAds = true;
            _controller.removeEventListener("OnAdvertisementLoadStart", onAdvertisementLoadStart);
        }

        private function getNextDoubleClickTime():Number
        {
            var t:Number = NaN;
            var cuePoints:Array = _adsManager ? _adsManager.cuePoints : null;

            if (cuePoints && cuePoints.length > 0 && !isNaN(_currentTimeAggregate))
            {
                if(_currentTimeAggregate == 0)    // PREROLL
                {
                    // if we have a preroll cue point, lets notify IMA we are ready;
                    if(cuePoints[0] == 0)
                        t = 0;
                }
                else                              // MID OR POST ROLL
                {
                    var cuePoint:Number;
                    for (var i:Number=0; i<cuePoints.length; i++)
                    {
                        cuePoint = cuePoints[i]*1000;
                        if(cuePoint == 0) // ignore pre
                            continue;

                        if(cuePoint < 0) // post
                        {
                            t = 1;
                            break;
                        }

                        if(_usedMidrollCuePoints.indexOf(cuePoint) == -1) // available mid!
                        {
                            t = cuePoint;
                            break;
                        }
                    }
                }
            }

//            log("t--> "+t);

            return t;
        }

        private function haveCuePointForCheckAd():Boolean
        {
            var l:String = "";

            var t:Number = getNextDoubleClickTime();

            var returnVal:Boolean;

            if(isNaN(t))
            {
                l+= "NaN for t\n";
                returnVal = false;
            }
            else if(t == 0)
            {
                l+= "valid pre roll\n";
                returnVal = true;
            }
            else if(t == 1)
            {
                returnVal =  (_contentComplete && _adsManager.cuePoints.indexOf(-1) >= 0);
            }
            else
            {

                var availableCuePoint:Boolean = (_usedMidrollCuePoints.indexOf(t) == -1);
                if(!availableCuePoint)
                {
                    l += "cue point has been used \n";
                    returnVal = false; // cue point has been used
                }
                else
                {
//                    _usedMidrollCuePoints.push(t); // store cue point usage
                    l += "using cue point ("+t+")\n";
                    returnVal = true;
                }
            }

            l += "t --> "+t+" and return "+returnVal;

//            log(l);

            return returnVal;
        }



        private function haveCuePointForAdBreak():Boolean
        {
            var haveCuePoint:Boolean = haveCuePointForCheckAd();
            if(!haveCuePoint) _controller.trace("Missing ad rule cue point for ad break!", "Doubleclick", Debug.WARN);

            log("haveCuePointForAdBreak: "+haveCuePoint);

            return haveCuePoint;
        }

        private function requestAds(url:String):void
        {
            cleanUp();
            _adsErrorForNextCheckAd = false;

            _adsLoader.addEventListener(AdsManagerLoadedEvent.ADS_MANAGER_LOADED, onAdsManagerLoaded);

            _controller.trace("requestAds   : " + url, "Doubleclick", Debug.INFO);
            var lineararea:Rectangle = _controller.getMediaArea();
            var nonlineararea:Rectangle = _controller.getOverlayArea();
            var adsRequest:AdsRequest = new AdsRequest();

            adsRequest.adTagUrl = url;
            adsRequest.linearAdSlotWidth = lineararea.width;
            adsRequest.linearAdSlotHeight = lineararea.height;
            adsRequest.nonLinearAdSlotWidth = nonlineararea.width;
            adsRequest.nonLinearAdSlotHeight = nonlineararea.height;
            _adsRequestInProgress = true;
            _adsLoader.requestAds(adsRequest);
        }

        // Clean up from previous request before new request.
        // See this: https://groups.google.com/forum/embed/?place=forum/ima-sdk&showsearch=true&showpopout=true&parenturl=https%3A%2F%2Fdevelopers.google.com%2Finteractive-media-ads%2Fcommunity#!topic/ima-sdk/C9Vuargl3YU
        // And this: https://developers.google.com/interactive-media-ads/faq#8
        private function cleanUp():void
        {
            log("cleanup");
            if(_strategy) _strategy.destroy();
            _strategy = null;

            if(_adsManager)
            {
                log("   adsManager.destroy()");
                _adsManager.destroy();
            }
            _adsManager = null;


            // for certain cases, midroll ad tags for one, we need to get this to
            // false prior to request. previous release would leave this at true when done.
            _slotPending = false;

            _adsRequestInProgress = false;

            _contentComplete = false;

            _signedUpForAd = false;

            _setAdsCalled = false;

            _usedMidrollCuePoints = [];
        }

        private function getViewMode():String
        {
            return _controller.getFullScreenState() ? ViewModes.FULLSCREEN : ViewModes.NORMAL;
        }

        //////////////////
        //	PDK EVENTS
        //////////////////

        private function onOverlayAreaChanged(e:PlayerEvent):void
        {
            if (!_strategy) return;
            
            var area:Rectangle = e ? e.data as Rectangle : null;
            if (area && _adsManager && _strategy.isOverlay)
            {
                _adsManager.resize(area.width, area.height, getViewMode());
                positionAdsContainer(area);
            }
        }

        private function onMediaAreaChanged(e:PlayerEvent):void
        {
            if (!_strategy) return;

            var area:Rectangle = e ? e.data as Rectangle : null;
            if (area && _adsManager && !_strategy.isOverlay)
            {
                _adsManager.resize(area.width, area.height, getViewMode());
                positionAdsContainer(area);
            }
        }

        private function positionAdsContainer(area:Rectangle):void
        {
            if(_adsManager && area)
            {
                _adsManager.adsContainer.x = area.x;
                _adsManager.adsContainer.y = area.y;
            }
        }

        private function onStreamSwitched(e:PdkEvent):void
        {
            _currentBitrate = e.data.newFileInfo.bitrate / 1000;
            _abr = true;
        }

        private function onMediaLoadStart(e:PdkEvent):void
        {
            log("onMediaLoadStart: " + (e.data && e.data is Clip ? Clip(e.data).baseClip.computeUrl() : "no clip"));
            var clip:Clip = e.data as Clip;
            
            if (clip && clip.isAd)
            {
                _adClip = clip;
                log("   Ad: URL is " + _adClip.URL + " clipIndex = " + _adClip.clipIndex);
                if (_adClip.streamType == StreamType.EMPTY && _adClip.baseClip.provider == "DFP")
                {
                    _mediaLoadStart = true;
                    startAdNoOpClip();
                }
            }
            else
            {
                _contentClip = clip;
                log("   Content: URL is " + _contentClip.URL + " clipIndex = " + _contentClip.clipIndex);
                setCurrentBitrateFromBaseClip(_contentClip.baseClip);
            }
        }

        private function setCurrentBitrateFromBaseClip(baseClip:BaseClip):void
        {
            if (!_abr && baseClip && !baseClip.isAd && baseClip.bitrate)
            {
                _currentBitrate = baseClip.bitrate / 1000;
            }
        }

        private function onMediaStart(e:PdkEvent):void
        {
            log("onMediaStart: "+ Clip(e.data).id+", "+Clip(e.data).baseClip.URL);
            if (e.data.isAd)
            {
                _adPlaying = true;
            }
            else
            {
                _adPlaying = false;
            }
        }

        private function onMediaEnd(e:PdkEvent):void
        {
            log("onMediaEnd");
            if (e.data.isAd)
            {
                _adPlaying = false;
                _mediaLoadStart = false;
                _linearAdStarted = false;
            }
        }

        private function onReleaseStart(e:PdkEvent):void
        {
            log("PDK Event:"+e.type);

            var playlist:Playlist = e.data as Playlist;

            // first non ad is used to the the bitrate
            var contentBaseClip:BaseClip = playlist.firstContentBaseClip;
            var doubleclickAdClip:Clip = getFirstDoubleclickAdClip(playlist);

            // get set bitrate
            if (contentBaseClip)
            {
                setCurrentBitrateFromBaseClip(contentBaseClip);
            }

            _podIndex = 1;
            _contentTimeObject = null;
            _currentTimeAggregate = NaN;

            if (doubleclickAdClip)
            {
                // we always request the first ad as soon as we can
                // because that's what determines if it's an ad rule
                // or just plain VAST
                requestAds(doubleclickAdClip.baseClip.computeUrl());
            }
        }

        private function onReleaseEnd(e:PdkEvent):void
        {
            log("PDK Event:"+e.type);
            cleanUp();
        }

        ///////////////
        // Utils
        ///////////////

        private function getFirstDoubleclickAdClip(playlist:Playlist):Clip
        {
            for (var i:int = 0; i < playlist.clips.length; i++)
            {
                var clip:Clip = playlist.clips[i];
                if(clip.isAd && isAd(clip.baseClip))
                    return clip;
            }
            return null;
        }

        private function isDoubleclickUrl(checkUrl:String):Boolean
        {
            var _isDoubleClickUrl:Boolean = false;
            for each (var host:String in _hosts)
            {

//                _controller.trace("URL: "+ checkUrl + " == " + host, "Doubleclick", Debug.WARN);
                
                if(checkUrl && checkUrl.indexOf(host) >= 0)
                {
                    _isDoubleClickUrl = true;
                    break;
                }
            }
            return _isDoubleClickUrl;
        }

        ////////////////////////
        //  IAdPlugIn API
        ////////////////////////

        public function isAd(bc:BaseClip):Boolean
        {
            // TEMP!! Remove when done. --> this lets someone put in any ad tag of any domain. Not restricted to load vars value.
//            log("bc.isAd ("+bc.isAd+"), bc.URL: "+bc.URL)
//            if(bc.isAd && _hosts.indexOf("*") == 0 && bc.URL.indexOf("DFP") != 0)
//            {
//                return true;
//            }

            var isAd:Boolean = (isDoubleclickUrl(bc.URL) || (PdkStringUtils.isRelative(bc.URL) && isDoubleclickUrl(bc.baseURL)) );
            _controller.trace("isAd: " + isAd, "Doubleclick", Debug.WARN);
            return isAd;
        }

        public function checkAd(clip:Clip):Boolean
        {
            if (isAd(clip.baseClip))
            {
                _signedUpForAd = true;

                _controller.trace("checkAd: true", "Doubleclick", Debug.INFO);

                setCurrentTimeFromAdClip(clip);

                if(isContentComplete(clip))
                {
                    _controller.trace("contentComplete", "Doubleclick", Debug.INFO);
                    _adsLoader.contentComplete();
                    _contentComplete = true;
                }

                if (_strategy)
                    _strategy.preparePod(clip.baseClip.computeUrl());
                else if(needToRequestAds())
                    requestAds(clip.baseClip.computeUrl());


                beginAdExperience(clip);
                return true;
            }
            else
            {
                _controller.trace("checkAd: false", "Doubleclick", Debug.INFO);
                return false;
            }
        }

        private function needToRequestAds():Boolean
        {
            return (!_adsRequestInProgress && !_adsErrorForNextCheckAd);
        }

        private function beginAdExperience(clip:Clip):void
        {
            _controller.trace("beginAdExperience", "Doubleclick", Debug.DEBUG);

            if (_playheadTimer) _playheadTimer.reset();

            // reset some values
            _slotPending = false;
            _podTimeObject = null;
            _aggregatePodTime = 0;
            _contentClip = null;
            _adClip = null;
            _ad = null;
            _adPlaying = false;
            _playlist = null;
            _sourceClip = clip;

            if (_adsManager)
            {
                _controller.trace("ready", "Doubleclick", Debug.DEBUG);

                if(!_strategy.playNextPod())
                {
                    bypassAdBreak();
                }
            }
            else if (_adsErrorForNextCheckAd)
            {
                _controller.trace("due to error, bailing on ad break", "Doubleclick", Debug.WARN);
                _controller.setAds(null);
                _setAdsCalled = true;
                _adsErrorForNextCheckAd = false;
            }
            else
            {
                _controller.trace("not ready", "Doubleclick", Debug.DEBUG);
                _slotPending = true;
            }
        }

        private function isContentComplete(clip:Clip):Boolean
        {
            return (clip.baseClip.adType == "postroll");
        }

        // async b/c where this is called we need to let the function complete
        private function bypassAdBreak():void
        {
            // this is an ad rule without a cue point to fill PDK ad break
            var __controller:IPlayerController = _controller;
            setTimeout(function ignoreAdBreak():void {
                __controller.trace("Bypassing ad break. AdsManager doesn't have an ad for this break.", "Doubleclick", Debug.WARN);
                __controller.setAds(new Playlist());
                _setAdsCalled = true;
            },1);
        }

        private function setCurrentTimeFromAdClip(clip:Clip):void
        {
            if(!_adPlaying && clip.baseClip.isAd)
            {
                if(clip.clipIndex > 0)
                {
                    var releasePlaylist:Playlist = _controller.getCurrentPlaylist();
                    var index:int = clip.clipIndex-1;
                    while(index >=0)
                    {
                        var previousClip:Clip = releasePlaylist.clips[index];
                        if(!previousClip.baseClip.isAd)
                        {
                            log("setting currentTimeAggregate to "+previousClip.endTime);
                            _currentTimeAggregate = previousClip.endTime;
                            break;
                        }
                        index--;
                    }
                }
                else
                {
                    _currentTimeAggregate = 0;   // we have a preroll scheduled in pdk
                }
            }
        }

        // TODO: AdsManager's OnAdComplete comes after the ad is over...
        private function doEndPod():void
        {
            _playheadTimer.reset();
            _aggregatePodTime += _ad.duration * 1000;
        }

        private function createPlaylist(ids:Array):Playlist
        {
            log("createPlaylist()");
            var playlist:Playlist = new Playlist();
            for (var i:Number = 0; ids && i < ids.length; i++)
            {
                playlist.addClip(createAdClip(ids[i]));
            }
            return playlist;
        }

        private function createAdClip(id:String):Clip
        {
            log("createAdClip(" + id + ")");

            var baseClip:BaseClip = new BaseClip();
            baseClip.URL = id;
            baseClip.provider = "DFP";
            baseClip.isAd = true;
            baseClip.noSkip = true;
            if(_ad.title) baseClip.title = _ad.title;

            var clip:Clip = _controller.createClipFromBaseClip(baseClip);
            clip.streamType = StreamType.EMPTY;

            // Copy source clip properties
            clip.adPattern = _sourceClip.adPattern;
            clip.clipIndex = _sourceClip.clipIndex;

            if(_ad && _ad.duration < 0)
            {
                // hide ad countdown if we don't have a duration. This comes up often enough for VPAID ads.
                clip.hasOverlayLayer = true;
            }

            // noSkip from ad is updated in startAdNoOpClip when we actually have the _ad instance
            clip.baseClip.adType = _sourceClip.baseClip.adType;


            return clip;
        } 

        /////////////////
        // NoOpPlugIn
        /////////////////

        // this should only be triggered by someone hitting tpNext.
        override public function mediaEndSet():void
        {
            log("mediaEndSet");
            if(_adsManager)
            {

                if(_ad.skippable && _ad.adSkippableState)
                {
                    log("   adsManager.skip(): ");
                    // if an ad skips, IMA fires its completed event, at which point we end the no op clip
                    // so nothing more to do here than to just try calling skip.
                    var skipped:Boolean = _adsManager.skip();
                }

            }
        }

        // called when the sound level is set externally
        override public function mediaSoundLevelSet(level:Number):void
        {
            log("mediaSoundLevelSet " + level);

            if (!_adsManager)
            {
                return;
            }

            _adsManager.volume = level / 100;
        }

        // called when mute/unmute is called externally
        override public function mediaMuteSet(isMuted:Boolean):void
        {
            log("mediaMuteSet " + isMuted);
            
            if (!_adsManager)
            {
                return;
            }

            if (isMuted)
            {
                _adsManager.volume = 0;
            }
            else
            {
                _adsManager.volume = 1;
            }
        }

        // called when seek is called externally
        override public function mediaSeekSet(position:int):void
        {
            // do we care?
        }

        // called when play/pause is called externally
        override public function mediaPauseSet(isPaused:Boolean):void
        {
            log("mediaPauseSet " + isPaused);

            if (!_adsManager)
            {
                return;
            }

            if (isPaused)
            {
                _adsManager.pause();
            }
            else
            {
                _adsManager.resume();
            }
        }

        ///////////////////
        // IMA / PDK sync
        ///////////////////

        private function startAdNoOpClip():void
        {
            log("startAdNoOpClip");

            // If there's no Playlist yet, this is the first ad in a pod
            // so we need to create one to begin the flow of Clips and exit
            if (!_playlist)
            {
                var id:String = "DFP:" + _podIndex + ":1"; //"" + Math.floor(Math.random()*10);
                _podIndex++;
                _playlist = createPlaylist([id]);

                log("      setAds");
                _controller.setAds(_playlist);
                _setAdsCalled = true;
                return;
            }

            if (!_mediaLoadStart || !_linearAdStarted) return;

            // this is done here to avoid 0 blip on ad countdown, then full duration.
            // Done later after mediaStarts() call, for instance, and we see the brief 0 on ad countdown at ad start.
            if(_ad.duration > -1)
            {
                _adClip.length = _ad.duration*1000;
                _adClip.mediaLength = _ad.duration*1000;
            }

            log("   calling loadStartChecked");

            loadStartChecked(true); // must be called after noop playlist is set, not before
            mediaLoading(50,100);

            // async mediaStarts per set up of original instream plugin
            // DNS would have keen insight on why this is needed, but without it,
            // get a clip failed to load error and automaticallly move on to next clip
            _mediaStartsTimer.reset();
            _mediaStartsTimer.addEventListener(TimerEvent.TIMER, onMediaStartsReady);
            _mediaStartsTimer.start();
        }

        private function onMediaStartsReady(e:TimerEvent):void
        {
            _mediaStartsTimer.removeEventListener(TimerEvent.TIMER, onMediaStartsReady);
            _mediaStartsTimer.reset();

            log("     mediaStarts [async 1]");

            mediaLoading(100,100);
            mediaStarts();
            mediaPlaying(1);

            if (!_playheadTimer)
            {
                _playheadTimer = new Timer(166, 0);
                _playheadTimer.addEventListener(TimerEvent.TIMER, playheadTick);
            }

            if(_ad.skippable && _ad.adSkippableState)
            {
                _adClip.baseClip.noSkip = false;
            }

            updateAdPlaylist(_ad);
            updateAdPodTime(_ad);

            //TODO: Get Google to expose AdPodInfo.totalTime, for aggregate times

            _playheadTimer.start();
        }

        private function updateUsedCuePoints(podIndex:Number):void
        {
            if(_adsManager && _adsManager.cuePoints && _adsManager.cuePoints.length)
            {
                var cuePoint:Number = _adsManager.cuePoints[podIndex]*1000;
                if(cuePoint > 0 && _usedMidrollCuePoints.indexOf(cuePoint) == -1)
                {
                    _usedMidrollCuePoints.push(cuePoint);
                    log("adding cue point ("+cuePoint+") to used mid roll cue points; now used these: "+_usedMidrollCuePoints.join(","));
                }
            }
        }

        /////////////////
        // IMA 3 events
        /////////////////

        // Add required ads manager listeners.
        private function onAdStarted(e:AdEvent):void
        {
            log("IMA Event:"+e.type);

            _ad = e.ad;
            log("podIndex: "+_ad.adPodInfo.podIndex);

            updateUsedCuePoints(_ad.adPodInfo.podIndex);

            if (_ad.linear)
            {
                log("- adsManager.pause() if already paused entering break");
                if(_controller.getPauseState())
                    _adsManager.pause();

                startLinearAd(_ad);
                positionAdsContainer(_controller.getMediaArea());
            }
            else
            {
                startNonLinearAd(_ad);
                positionAdsContainer(_controller.getOverlayArea());
            }
        }

        private function startLinearAd(ad:Ad):void
        {
            _linearAdStarted = true;
            startAdNoOpClip();

            var remainingTime:Number = _adsManager.remainingTime;
            var duration:Number = _ad.duration;
            log("startLinearAd (" + ad.adPodInfo.adPosition + " / " + ad.adPodInfo.totalAds + ") " + remainingTime + ", ad duration: "+duration);

            var area:Rectangle = _controller.getMediaArea();
            if (area && _adsManager)//_strategy.isOverlay)
            {
                _adsManager.resize(area.width, area.height, getViewMode());
            }
        }

        private function startNonLinearAd(ad:Ad):void
        {
            log("startNonLinearAd");
//            _controller.dispatchEvent(new PdkEvent(PdkEvent.OnOverlayStart,null));
            _controller.setAds(new Playlist());
            _setAdsCalled = true;
            var area:Rectangle = _controller.getOverlayArea();
            if (area && _adsManager)//_strategy.isOverlay)
            {
                _adsManager.resize(area.width, area.height, getViewMode());
            }
        }

        private function onAdPaused(e:AdEvent):void
        {
            log("IMA Event:"+e.type);
            if (_playheadTimer) _playheadTimer.stop()
        }

        private function onAdResumed(e:AdEvent):void
        {
            log("IMA Event:"+e.type);
            if (_playheadTimer) _playheadTimer.start()            
        }

        // only pause ad clicked on vast linear ads. per JL
        private function onAdClicked(e:AdEvent):void
        {
            log("IMA Event:"+e.type);
            if (_strategy && !_strategy.isVpaid)
            {
                if (e.ad.linear)
                {
                    _controller.setPauseState(PauseStates.PAUSED);
                    _adsManager.pause();
                }
                else
                {
                    _controller.pause(true);
                }
            }
        }

        private function onAdDurationChanged(e:AdEvent):void
        {
            log("IMA Event:"+e.type+" : duration: "+ e.ad.duration);
            var ad:Ad = e.ad as Ad;

            if (ad && _podTimeObject && ad.duration > -1)
            {
                _adClip.length = ad.duration * 1000;
                _adClip.mediaLength = ad.duration * 1000;

                _podTimeObject.duration = ad.duration * 1000;
                // todo: see comment in updateAdPodTime about more API from google for pod totalTime
//                if (ad.adPodInfo && ad.adPodInfo.totalAds > 1)
//                {
//                    _podTimeObject.durationAggregate = _adsManager.remainingTime * 1000;
//                }
//                else
//                {
                    _podTimeObject.durationAggregate = ad.duration * 1000;
//                }
            }
        }

        private function onAdLinearChanged(e:AdEvent):void
        {
            log("IMA Event:"+e.type);

            if(_strategy) _strategy.linearOrExpandedChanged();

            if(!e.ad.linear && _adPlaying) // linear to overlay
            {
                doEndLinearAd();
                positionAdsContainer(_controller.getOverlayArea());
            }
            else                          // overlay to linear
            {

                positionAdsContainer(_controller.getMediaArea());
            }
        }

        private function onAdExpandedChanged(e:AdEvent):void
        {
            log("IMA Event:"+e.type+", linear:"+e.ad.linear);
            if(_strategy) _strategy.linearOrExpandedChanged();
        }

        private function onAdCompleted(e:AdEvent):void
        {
            log("IMA Event:"+e.type);
            doEndAd();
        }

        private function onAdSkipped(e:AdEvent):void
        {
            log("IMA Event:"+e.type);
            doEndAd();
        }

        private function doEndAd():void
        {
            if(!_strategy.isOverlay)
                doEndLinearAd();
            else
                doEndOverlayAd();
        }

        private function onAdSkippableStateChanged(e:AdEvent):void
        {
            _adClip.baseClip.noSkip = !e.ad.adSkippableState;
            log("IMA Event:"+e.type + ": adSkippableState: "+ e.ad.adSkippableState + ", adClip.baseClip.noSkip set to "+ _adClip.baseClip.noSkip);
        }

        private function onAdLog(e:AdEvent):void
        {
            log("IMA Event: event type:"+e.type+", adData:"+ e.adData.toString());
        }

        private function onAdUserClosed(e:AdEvent):void
        {
            log("IMA Event:"+e.type);
        }

        private function doEndLinearAd():void
        {
            doEndPod();
            mediaEnds();
            loadStartChecked(false);
        }

        private function doEndOverlayAd():void
        {
            _controller.dispatchEvent(new PdkEvent(PdkEvent.OnOverlayComplete,null));
        }

        private function onContentResumeRequested(e:AdEvent):void
        {
            log("IMA Event:"+e.type);
//            try{log("- ad linear: "+ e.ad.linear+", adsMgr linear: "+_adsManager.linear)}catch(e:Error){log("e.ad is null")}
            var forceEndAdBreak:Boolean = false;
            if(_strategy)
            {
                forceEndAdBreak = _strategy.contentResumeRequested();
            }

            if(forceEndAdBreak)
            {
                _controller.trace("Bypassing ad break. AdsManager doesn't have an ad for this break.", "Doubleclick", Debug.WARN);
                _podIndex++;
                _controller.setAds(new Playlist());
            }
        }

        private function onContentPauseRequested(e:AdEvent):void
        {
            log("IMA Event:"+e.type);
//            try{log("- ad linear: "+ e.ad.linear+", adsMgr linear: "+_adsManager.linear)}catch(e:Error){log("e.ad is null")}
            if(_strategy && _strategy.isVpaid )
            {
                _strategy.contentPauseRequested();
            }
        }

        private function updateAdPlaylist(ad:Ad):void
        {
            log("updating ad Playlist");
            if (ad.adPodInfo.totalAds > _playlist.clips.length)
            {
                log("\ttotalAds doesn't equal _playlist.clips.length, so updating.");
                var adPodType:String = "";
                for (var i:Number = 1; i < ad.adPodInfo.totalAds; i++)
                {
//                    _controller.trace("\t\tcreating ad clip...", "Doubleclick", Debug.ERROR);

                    if(ad.adPodInfo.podIndex==-1)
                        adPodType = "post";
                    else if(ad.adPodInfo.podIndex==0)
                        adPodType = "pre";
                    else
                        adPodType = "mid" + ad.adPodInfo.podIndex;

                    _playlist.addClip(createAdClip("DFP:"+(_podIndex-1)+":"+(i+1)+":___("+(i+1)+"_of_"+ad.adPodInfo.totalAds+":"+adPodType+")"));
                    _playlist.reset();
                }
            }
            else if(ad.adPodInfo.totalAds < _playlist.clips.length)
            {
                // todo: how to remove a placeholder clip? Remove as many as the diff in these two numbers from the end _playlist.clips
                log("\ttotalAds is less than clips.length, so need to remove clips somehow (or handle another way).");
            }
            else
            {
                log("\ttotalAds equals clips.length, so doing nothing.");
            }
        }

        private function updateAdPodTime(ad:Ad):void
        {
            if (!_podTimeObject)
            {
                _podTimeObject = new TimeObject();
            }

            _podTimeObject.duration = ad.duration * 1000;
            _podTimeObject.currentTime = (ad.currentTime) * 1000;
            _podTimeObject.percentComplete = _podTimeObject.currentTime / _podTimeObject.duration;


//            log("ad: duration("+ad.duration+"), currentTime("+ad.currentTime+"), adsmgr.remainingTime("+_adsManager.remainingTime+")");

            // todo: until google gives us more API for pod total time, we don't need to the condition using aggregates. It was causing PDK-10397
//            if (ad.adPodInfo && ad.adPodInfo.totalAds > 1)
//            {
//                _podTimeObject.isAggregate = true;
//                _podTimeObject.durationAggregate = _podTimeObject.currentTimeAggregate + _adsManager.remainingTime*1000;
//                _podTimeObject.currentTimeAggregate = _aggregatePodTime + ad.currentTime*1000;
//            }
//            else
//            {
                _podTimeObject.isAggregate = false;
                _podTimeObject.durationAggregate = ad.duration * 1000;
                _podTimeObject.currentTimeAggregate = ad.currentTime * 1000;
//            }
            _podTimeObject.percentCompleteAggregate = _podTimeObject.currentTimeAggregate / _podTimeObject.durationAggregate;
        }

        private function playheadTick(e:TimerEvent):void
        {
            updateAdPodTime(_ad);
            //log("playheadTick:" + _podTimeObject.currentTimeAggregate);
            if(_podTimeObject.currentTimeAggregate >= 0)
                mediaPlaying(_podTimeObject.currentTimeAggregate);
        }

        // ALL_ADS_COMPLETED event will fire once all the ads have played. There
        // might be more than one ad played in the case of ad pods and VMAP.
        private function onAllAdsCompleted(e:AdEvent):void
        {
            log("IMA Event:"+e.type + " signed up for ad: " + _signedUpForAd + ", mediaEnds() called: " + _setAdsCalled+", _liveAds: "+_liveAds)


            if(missingAdCheck())
            {
                log("IMA Event:"+e.type + ": skipping ad slot");
                _controller.trace("Bypassing ad break. AdsManager doesn't have an ad for this break.", "Doubleclick", Debug.WARN);
                _podIndex++;
                _controller.setAds(new Playlist());
            }
            else if(_liveAds)
            {
                log("liveAds, so cleaning up at all ads completed");
                cleanUp();
            }
        }

        private function missingAdCheck():Boolean
        {
            return (_signedUpForAd && !_setAdsCalled);
        }

        // All AD_ERRORs indicate fatal failures. You can discard the AdsManager and
        // resume your content in this handler.
        private function onAdError(e:AdErrorEvent):void
        {
            log("IMA Event:"+e.type);
            onAdsLoadError(e);
        }

        private function onAdsLoadError(e:AdErrorEvent):void
        {
            log("onAdsLoadError");

            if (_slotPending)
            {
                // loading up ads at check ad and had a failure
                log("Ads failed to load. Bail on ad break.");
                _controller.setAds(null);
                _setAdsCalled = true;
            }
            else if (_linearAdStarted)
            {
                // ads failure after successful load (e.g., during playback).
                log("mediaError");
                mediaEnds();
                loadStartChecked(false);
            }
            else
            {
                // Ads pre-load failure. Flag here to handle checkAd when it arrives.
                _adsErrorForNextCheckAd = true;
            }

            // on any failure, we should destroy the busted adsManager (per the docs).
            cleanUp();

            if(e) _controller.trace(e.type+" error: code:"+ e.error.errorCode+", message: "+ e.error.errorMessage, "Doubleclick", Debug.ERROR);
        }

        private function log(msg:String, level:int=Debug.DEBUG):void
        {
            _controller.trace(msg, "DoubleClick", level);
        }
    
        private static function extractLoadVars(lo:LoadObject, loadVarNames:Array, defaultValue:String):Array
        {
            var loadVarValues:Array = [];
            var loadVarValue:String;

            for each (var loadVarName:String in loadVarNames)
            {
                loadVarValue = lo.vars[loadVarName] as String;
                loadVarValues = loadVarValues.concat(extractCommaDelimitedStrings(loadVarValue));
            }

            if(loadVarValues.length == 0 && defaultValue && defaultValue.length > 0)
                loadVarValues.push(defaultValue);

            return loadVarValues;
        }

        private static function extractCommaDelimitedStrings(value:String):Array
        {
            var values:Array = [];
            if(value && value.length > 0)
            {
                var split:Array = value.split(",");
                for each (var host:String in split)
                {
                    var trimmedHost:String = PdkStringUtils.trim(host);
                    if(trimmedHost)
                        values.push(trimmedHost);
                }
            }
            return values;
        }

        private function onFlashFullScreen(event:PlayerEvent):void {
            log("\n*     fullscreen: "+event.data+"     *\n");
        }
    }
}
