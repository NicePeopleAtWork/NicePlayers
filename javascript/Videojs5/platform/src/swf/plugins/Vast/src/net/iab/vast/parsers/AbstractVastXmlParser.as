package net.iab.vast.parsers
{
import com.theplatform.pdk.utils.PdkStringUtils;

import flash.errors.IllegalOperationError;

import net.iab.vast.data.*;

/** this is an abstract class, don't implement it directly
 * this is because we want Vast1Parser and Vast2Parser to share a lot of code, but
 * not inherit from each other (also helps with making them "proper" singletons using an internal class in
 * each .as file)
 */
public class AbstractVastXmlParser implements IVastParser
{
    public function AbstractVastXmlParser(self:AbstractVastXmlParser = null)
    {
        if (this != self)
            throw new IllegalOperationError("AbstractVastParser can not be directly instantiated, must be inherited")
    }

    public function parse(vast:String):VideoAdServingTemplate
    {
        //vast = vast.replace(/[\n\r]/g, "");
        XML.ignoreWhitespace = true;
        var vastXml:XML;
        try
        {
            vastXml = new XML(vast);
        } catch(e:Error)
        {
            return null;
        }

        return parseVast(vastXml.children());
    }

     protected function parseVast(xml:XMLList):VideoAdServingTemplate
    {
        var result:VideoAdServingTemplate = new VideoAdServingTemplate();
        result.ads = new Array();
        for (var i:int = 0; i < xml.length(); i++)
        {
            result.ads.push(parseAd(xml[i]));
        }
        return result;
    }

    protected function parseAd(xml:XML):Ad
    {
        //this is a no-op, impl in parent
        return null;
    }

    protected function parseUrls(xml:XML):Array
    {
        if (xml != null && xml.children() != null)
        {
            var result:Array = new Array();
            for (var i:int = 0; i < xml.children().length(); i++)
            {
                result.push(parseUrl(xml.children()[i]));
            }
            return result;
        }
        return null;
    }

    protected function parseMultiUrls(xml:XMLList):Array
    {
        if (xml)
        {
            var result:Array = [];
            for each(var child:XML in xml)
            {
                result.push(parseUrl(child));
            }
            return result;
        }
        return null;
    }

    protected function parseUrl(xml:XML):URL
    {
        var result:URL = new URL();
        result.url = parseSimpleUrl(xml);
        result.id = xml.@id[0];
        return result;
    }

    protected function parseSimpleUrl(xml:XML):String
    {
        //noop
        return null;
    }

    protected function parseTrackingEvents(xml:XML):Array
    {
        if (xml != null && xml.children() != null)
        {
            var result:Array = new Array();
            for (var i:int = 0; i < xml.children().length(); i++)
            {
                result.push(parseTrackingEvent(xml.children()[i]));
            }
            return result;
        }
        return null;
    }

    protected function parseTrackingEvent(xml:XML):TrackingEvent
    {
        var result:TrackingEvent = new TrackingEvent();
        result.event = xml.@event[0];
        result.urls = parseUrls(xml);
        return result;
    }

    protected function parseWrapper(xml:XML, ad:Ad):Wrapper
    {
        //noop, override in children
        return null;
    }


    protected function parseVideo(xml:XML):Video
    {

        if (!xml)
            return null;

        var result:Video = new Video();
        result.duration = PdkStringUtils.timeToMillis(xml.Duration[0]);
        result.adId = xml.AdID[0];
        result.adParameters = parseAdParameters(xml.AdParameters[0]);
        result.videoClicks = parseVideoClicks(xml.VideoClicks[0]);
        result.mediaFiles = parseMediaFiles(xml.MediaFiles[0]);

        result.trackingEvents = parseTrackingEvents(xml.TrackingEvents[0]);
        return result;
    }

    protected function parseAdParameters(xml:XML):AdParameters
    {
        if (xml != null)
        {
            var result:AdParameters = new AdParameters();
            result.apiFramework = xml.@apiFramework[0];
            result.parameters = xml.children();
            return result;
        }
        return null;
    }

    protected function parseVideoClicks(xml:XML):VideoClicks
    {
        if (xml != null)
        {
            var result:VideoClicks = new VideoClicks();
            result.clickThrough = parseUrls(xml.ClickThrough[0]);
            result.clickTracking = parseUrls(xml.ClickTracking[0]);
            result.customClick = parseUrls(xml.CustomClick[0]);
            return result;
        }
        return null;
    }

    protected function parseMediaFiles(xml:XML):Array
    {
        if (xml != null && xml.children() != null)
        {
            var result:Array = new Array();
            for (var i:int = 0; i < xml.children().length(); i++)
            {
                result.push(parseMediaFile(xml.children()[i]));
            }
            return result;
        }
        return null;
    }

    protected function parseMediaFile(xml:XML):MediaFile
    {
        //noop
        return null;
    }

    protected function parseCompanionAds(xml:XML):Array
    {
        if (xml != null && xml.children() != null)
        {
            var result:Array = new Array();
            for (var i:int = 0; i < xml.children().length(); i++)
            {
                result.push(parseCompanion(xml.children()[i]));
            }
            return result;
        }
        return null;
    }

    protected function parseCompanion(xml:XML):Companion
    {
        //noop
        return null;
    }

    protected function parseNonLinearAds(xml:XML):Array
    {
        //this is a no-op now too
        return null;
    }

    protected function parseNonLinear(xml:XML, trackingEvents:Array = null):NonLinear
    {
        //noop
        return null;
    }


}
}
