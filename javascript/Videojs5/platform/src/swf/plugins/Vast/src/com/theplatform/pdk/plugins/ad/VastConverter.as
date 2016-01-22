package com.theplatform.pdk.plugins.ad
{
import com.theplatform.pdk.controllers.IPlayerController;
import com.theplatform.pdk.data.Banner;
import com.theplatform.pdk.data.BaseClip;
import com.theplatform.pdk.data.FileInfo;
import com.theplatform.pdk.data.HyperLink;
import com.theplatform.pdk.data.Overlay;
import com.theplatform.pdk.data.TrackingUrl;
import com.theplatform.pdk.events.VastEvent;
import com.theplatform.pdk.utils.Debug;

import flash.events.EventDispatcher;

import net.iab.vast.data.*;

public class VastConverter extends EventDispatcher
{
    private var _baseClip:BaseClip;
    private var _mimeTypes:Array;
    private var _duration:Number;

    private static var DEFAULT_DURATION:int = 10000;

    public function VastConverter(baseClip:BaseClip, mimeTypes:Array, duration:Number)
    {
        _baseClip = baseClip;
        _mimeTypes = mimeTypes;
        _duration= duration;
    }

    public function getBaseClip():BaseClip
    {
        return _baseClip
    }

    public function convertInLine(inLine:InLine):void
    {
        if (inLine.adTitle != null) _baseClip.title = inLine.adTitle;
        if (inLine.description != null) _baseClip.description = inLine.description;
        if (inLine.survey)
        {
            debug("This ad has a survey URL of [" + inLine.survey + "]; not supported", Debug.WARN);
        }
        if (inLine.error)
        {
            debug("This ad has an error URL of [" + inLine.error + "]; not supported", Debug.WARN);
        }
        addTrackingUrls(inLine);
        addVideo(inLine);
        addBanners(inLine);
        addOverlays(inLine);
        addImpressions(inLine);
    }



    public function addTrackingUrls(ad:Ad):void
    {

        if (ad.trackingEvents != null)
        {
            if (_baseClip.trackingURLs == null)
            {
                _baseClip.trackingURLs = new Array();
            }
            for (var i:int = 0; i < ad.trackingEvents.length; i++)
            {
                var trackingEvent:TrackingEvent = ad.trackingEvents[i] as TrackingEvent;
                for (var j:int = 0; j < trackingEvent.urls.length; j++)
                {
                    var url:String = (trackingEvent.urls[j] as URL).url;
                    if (url)
                    {
                        var ord:String = (url.indexOf("?") === -1 ? "?" : "&") + "ord=" + (100000 + Math.floor(Math.random() * 900001))
                        var trackingUrl:TrackingUrl = getTrackingUrl(trackingEvent.event, url + ord);
                        if (trackingUrl != null)
                        {
                            _baseClip.trackingURLs.push(trackingUrl)
                        }
                    }
                }
            }
        }
    }

    private function getTrackingUrl(eventType:String, url:String):TrackingUrl
    {
        switch (eventType)
        {
            case TrackingEventType.complete:       return setTracking(url, TrackingUrl.TRIGGER_TYPE_PERCENTAGE, 90);
            case TrackingEventType.firstQuartile: return setTracking(url, TrackingUrl.TRIGGER_TYPE_PERCENTAGE, 25);
            case TrackingEventType.midPoint:      return setTracking(url, TrackingUrl.TRIGGER_TYPE_PERCENTAGE, 50);
            case TrackingEventType.start:          return setTracking(url, TrackingUrl.TRIGGER_TYPE_PERCENTAGE, 0);
            case TrackingEventType.thirdQuartile: return setTracking(url, TrackingUrl.TRIGGER_TYPE_PERCENTAGE, 75);
            case TrackingEventType.mute:          return setTracking(url, TrackingUrl.TRIGGER_TYPE_EVENT, TrackingUrl.EVENT_MUTE);
            case TrackingEventType.pause:          return setTracking(url, TrackingUrl.TRIGGER_TYPE_EVENT, TrackingUrl.EVENT_PAUSE);
            case TrackingEventType.replay:          return setTracking(url, TrackingUrl.TRIGGER_TYPE_EVENT, TrackingUrl.EVENT_REPLAY);
            case TrackingEventType.stop:          return setTracking(url, TrackingUrl.TRIGGER_TYPE_EVENT, TrackingUrl.EVENT_STOP);
            case TrackingEventType.fullScreen:      return setTracking(url, TrackingUrl.TRIGGER_TYPE_EVENT, TrackingUrl.EVENT_FULL_SCREEN);
            case TrackingEventType.creativeView:      return setTracking(url, TrackingUrl.TRIGGER_TYPE_EVENT, TrackingUrl.EVENT_START);
            case TrackingEventType.resume:      return setTracking(url, TrackingUrl.TRIGGER_TYPE_EVENT, TrackingUrl.EVENT_UNPAUSE);
            case TrackingEventType.close:      return setTracking(url, TrackingUrl.TRIGGER_TYPE_EVENT, TrackingUrl.EVENT_CLOSE);
            case TrackingEventType.unmute:      return setTracking(url, TrackingUrl.TRIGGER_TYPE_EVENT, TrackingUrl.EVENT_UNMUTE);
            case TrackingEventType.acceptInvitation:      return setTracking(url, TrackingUrl.TRIGGER_TYPE_EVENT, TrackingUrl.EVENT_ACCEPTINVITATION);
			
			default:
                debug("Tracking event of type \"" + eventType + "\" not supported; ignoring");
                return null;
        }
    }

    private function setTracking(url:String, type:Number, value:Number):TrackingUrl
    {
        var trackingUrl:TrackingUrl = new TrackingUrl();
        trackingUrl.triggerType = type;
        trackingUrl.triggerValue = value;
        trackingUrl.URL = url;                          
        return trackingUrl;
    }

    private function isAllowedVideo(mediaFile:MediaFile):Boolean
    {
        if (mediaFile.url == null || mediaFile.url.length == 0)
        {
            return false;
        }
        if (_mimeTypes.length == 0)
        {
            return true;
        }
        for (var i:int = 0; i < _mimeTypes.length; i++)
        {
            if (_mimeTypes[i] == mediaFile.type)
            {
                return true;
            }
        }
        return false;
    }

    private function addVideo(inLine:InLine):void
    {
        debug("addVideo", Debug.DEBUG);
        if (inLine.video != null)
        {
            _baseClip.releaseLength = inLine.video.duration;
            addVideoClicks(inLine.video.videoClicks);
            if (inLine.video.mediaFiles != null)
            {
                debug("looping through mediaFiles", Debug.DEBUG);
                // use the first entry as the default
                var isDefault:Boolean = true;

                // try adding the files based on mime-type priority
                if (_mimeTypes && _mimeTypes.length)
                {
                    for (var j:int = 0; j < _mimeTypes.length; j++)
                    {
                        for (var i:int = 0; i < inLine.video.mediaFiles.length; i++)
                        {
                            var mediaFile:MediaFile = inLine.video.mediaFiles[i] as MediaFile;
                            
                            if (mediaFile && isAllowedVideo(mediaFile) && mediaFile.type == _mimeTypes[j])
                            {
                                addVideoToBaseClip(mediaFile, _baseClip, isDefault);
                                debug("mediaFile[" + i + "]: " + mediaFile.url, Debug.DEBUG);
                                isDefault = false;
                            }
                        }
                    }
                }
                // otherwise just add them in order
                else
                {
                    for (var i:int = 0; i < inLine.video.mediaFiles.length; i++)
                    {
                        var mediaFile:MediaFile = inLine.video.mediaFiles[i] as MediaFile;
                        
                        if (mediaFile && isAllowedVideo(mediaFile))
                        {
                            addVideoToBaseClip(mediaFile, _baseClip, isDefault);
                            debug("mediaFile[" + i + "]: " + mediaFile.url, Debug.DEBUG);
                            isDefault = false;
                        }
                    }                    
                }

                if (inLine.video.adParameters)
                {
                    _baseClip.trackingData = inLine.video.adParameters.parameters.toString();
                }

                if (inLine.video.trackingEvents)
                {
                    //vast 2.0 stuff
                    if (_baseClip.trackingURLs == null)
                    {
                        _baseClip.trackingURLs = new Array();
                    }
                    
                    for (i = 0; i < inLine.video.trackingEvents.length; i++)
                    {
                        var trackingEvent:TrackingEvent = inLine.video.trackingEvents[i] as TrackingEvent;
                        for (var j:int = 0; j < trackingEvent.urls.length; j++)
                        {
                            var url:String = (trackingEvent.urls[j] as URL).url;
                            if (url)
                            {
                                var ord:String = (url.indexOf("?") === -1 ? "?" : "&") + "ord=" + (100000 + Math.floor(Math.random() * 900001))
                                var trackingUrl:TrackingUrl = getTrackingUrl(trackingEvent.event, url + ord);
                                if (trackingUrl != null)
                                {
                                    _baseClip.trackingURLs.push(trackingUrl)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    protected function addVideoToBaseClip(mediaFile:MediaFile, baseClip:BaseClip, isDefault:Boolean = false):void
    {
        var fileInfo:FileInfo = new FileInfo();
        fileInfo.URL = mediaFile.url;
        fileInfo.bitrate = mediaFile.bitrate;
        fileInfo.width = mediaFile.width;
        fileInfo.height = mediaFile.height;
        fileInfo.type = mediaFile.type;
        // TODO no type on FileInfo?
        // if (mediaFile.type != null) _baseClip.type = mediaFile.type;
        baseClip.addPossibleFile(fileInfo, isDefault);        
    }

    public function addVideoClicks(videoClicks:VideoClicks):void
    {
        if (videoClicks != null)
        {
            if (videoClicks.clickThrough != null)
            {
                if (videoClicks.clickThrough.length > 1)
                {
                    debug("Multiple video click-throughs not supporting; choosing the first", Debug.WARN);
                }
                
                if (_baseClip.moreInfo == null)
                {
                    _baseClip.moreInfo = new HyperLink();
                }
                _baseClip.moreInfo.href = (videoClicks.clickThrough[0] as URL).url;
            }
            if (videoClicks.clickTracking != null)
            {
                if (_baseClip.moreInfo == null)
                {
                    _baseClip.moreInfo = new HyperLink();
                }

                for (var i:int = 0; i < videoClicks.clickTracking.length; i++)
                {
                    if (_baseClip.moreInfo.clickTrackingUrls == null)
                    {
                        _baseClip.moreInfo.clickTrackingUrls = new Array();
                    }
                    var url:String = (videoClicks.clickTracking[i] as URL).url;

                    if (url)
                    {
                        var ord:String = (url.indexOf("?") === -1 ? "?" : "&") + "ord=" + (100000 + Math.floor(Math.random() * 900001))
                        _baseClip.moreInfo.clickTrackingUrls.push(url + ord);
                    }
                }
            }
            if (videoClicks.customClick != null)
            {
                debug("Video custom clicks not supported; ignoring", Debug.WARN);
            }
        }
    }

    private function addBanners(inLine:InLine):void
    {
        if (inLine.companionAds != null)
        {
            for (var i:int = 0; i < inLine.companionAds.length; i++)
            {
                var companionAd:Companion = inLine.companionAds[i] as Companion;
                var banner:Banner = new Banner();

                banner.guid = companionAd.id;
                banner.region = companionAd.id;

                if (companionAd.altText != null) banner.alt = companionAd.altText;
                if (companionAd.companionClickThrough != null) banner.href = companionAd.companionClickThrough;
                banner.bannerHeight = companionAd.height;
                if (companionAd.creativeType != null) banner.bannerType = companionAd.creativeType;
                if (companionAd.url != null) banner.src = companionAd.url;

//                if (companionAd.htmlResource)
//                {
//                    //might also need to pop up an iframe here
//                    //dont know what to do with this yet
//                }
                banner.bannerWidth = companionAd.width;
                if (_baseClip.banners == null)
                {
                    _baseClip.banners = new Array();
                }
                _baseClip.banners.push(banner);
            }
        }
    }

    private function addOverlays(inLine:InLine):void
    {
        if (inLine.nonLinearAds != null)
        {
            var isDefault:Boolean = true;
            for (var i:int = 0; i < inLine.nonLinearAds.length; i++)
            {
                var nonLinearAd:NonLinear = inLine.nonLinearAds[i] as NonLinear;
                if (!nonLinearAd.url)
                {
                    continue;//ignore it if there is no url, it won't work as an overlay in our system
                }

                // VPAID requires a MediaFile, not an overlay...
                if (nonLinearAd.apiFramework == "VPAID")
                {
                    var fileInfo:FileInfo = new FileInfo();
                    fileInfo.URL = nonLinearAd.url;
                    fileInfo.height = nonLinearAd.height;
                    fileInfo.type = nonLinearAd.creativeType;
                    fileInfo.width = nonLinearAd.width;

                    _baseClip.type = nonLinearAd.creativeType;
                    // use this to let VPAID plug-in know there's no need for a clip
                    _baseClip.isOverlay = true;
                    _baseClip.addPossibleFile(fileInfo, isDefault);

                    isDefault = false;
                    continue;
                }

                var overlay:Overlay = new Overlay();

                overlay.guid = nonLinearAd.id;

                if (nonLinearAd.nonLinearClickThrough != null) overlay.href = nonLinearAd.nonLinearClickThrough;
                overlay.bannerHeight = nonLinearAd.height;
                if (nonLinearAd.creativeType != null) overlay.bannerType = nonLinearAd.creativeType;

                //it shouldn't stretch to fit unless asked
                overlay.stretchToFit = nonLinearAd.scalable&&!nonLinearAd.maintainAspectRatio;
                if (nonLinearAd.url != null) overlay.src = nonLinearAd.url;
                overlay.bannerWidth = nonLinearAd.width;

                overlay.duration = nonLinearAd.minSuggestedDuration ? int(Math.floor(1000 * nonLinearAd.minSuggestedDuration)) : _duration;


                //TODO: if there's a creativeView trackingEvents, add it to the overlay's impressionUrl array

                if (nonLinearAd.trackingEvents)
                {
                    for each (var te:TrackingEvent in nonLinearAd.trackingEvents)
                    {
                        if (te.event=="creativeView")
                        {
                            if (te.urls!=null)
                            {
                                if (overlay.impressionUrls==null)
                                    overlay.impressionUrls = new Array();

                                for each (var url:URL in te.urls)
                                    overlay.impressionUrls.push(url.url);
                            }
                        }

                    }
                }



                if (_baseClip.overlays == null)
                {
                    _baseClip.overlays = new Array();
                }
                _baseClip.overlays.push(overlay);
            }
        }
    }

    public function addImpressions(ad:Ad):void
    {
        if (ad.impressions != null)
        {
            for each (var impression:URL in ad.impressions)
            {
                if (impression.url)
                {
                    var attached:Boolean = checkForImpression(_baseClip.banners, impression);
                    if (!attached)
                        attached = checkForImpression(_baseClip.overlays, impression);
                    if (!attached)
                    {
                        if (!_baseClip.impressionUrls) _baseClip.impressionUrls = [];
                        
                        var ord:String = (impression.url.indexOf("?") === -1 ? "?" : "&") + "ord=" + (100000 + Math.floor(Math.random() * 900001))
                        _baseClip.impressionUrls.push(impression.url + ord);
                    }
                }
            }
        }
    }

    private function checkForImpression(banners:Array, impression:URL):Boolean
    {
        if (!banners || !banners.length)
            return false;

        var attached:Boolean = false;
        for each (var banner:Banner in banners)
        {
            if (banner.guid != null && (banner.guid == impression.id))
            {
                attached = true;
                if (!banner.impressionUrls)
                    banner.impressionUrls = new Array();
                banner.impressionUrls.push(impression.url);
                break;//only put the impression on one banner so it doesn't fire multiple times
            }
        }
        return attached;
    }
	
	private function debug(message:String, level:int = 4):void
	{
		dispatchEvent(new VastEvent(VastEvent.OnVastDebug, {message:message, className:"VastConverter", level:level}));
	}
	
}


}
