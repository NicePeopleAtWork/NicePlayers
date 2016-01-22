package net.iab.vast.parsers
{
import com.theplatform.pdk.utils.PdkStringUtils;

import flash.errors.IllegalOperationError;

import net.iab.vast.data.*;

public class Vast2XmlParser extends AbstractVastXmlParser implements IVastParser
{

    protected static var _instance:IVastParser;

    public function Vast2XmlParser(pvt:Object = null)
    {
        super(this);

        if (!pvt || (pvt != this && !(pvt is Vast2Pvt)))
        {
            throw new IllegalOperationError("Vast2Parser constructor can not be called directly")
        }
    }

    public static function getInstance():IVastParser
    {
        if (_instance)
            return _instance;
        else
            return new Vast2XmlParser(new Vast2Pvt());
    }


    override protected function parseAd(xml:XML):Ad
    {
        var result:Ad = new Ad();
        result.id = xml.@id[0];
        var subXml:XML = xml.children()[0];
        result.adSystem = subXml.AdSystem[0];
        result.error = parseSimpleUrl(subXml.Error[0]);
        result.extensions = subXml.Extensions[0];
        result.impressions = parseMultiUrls(subXml.Impression);
        result.trackingEvents = parseTrackingEvents(subXml.TrackingEvents[0]);
        if (subXml.name() == "InLine")
        {
            return parseInLine(subXml, result);
        }
        else if (subXml.name() == "Wrapper")
        {
            return parseWrapper(subXml, result);
        }
        else
        {
            throw new IllegalOperationError("Unrecognized ad type: \"" + subXml.name() + "\"");
        }
    }


    override protected function parseSimpleUrl(xml:XML):String
    {
        if (xml != null && xml.toString().length > 0)
        {
            var url:String = xml.toString();
            return url.replace( /^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm, "$2" );;
        }
        return null;
    }

    override protected function parseWrapper(xml:XML, ad:Ad):Wrapper
    {
        var result:Wrapper = new Wrapper(ad);
        //it's called a URI in 2.0
        result.vastAdTagURL = parseSimpleUrl(xml.VASTAdTagURI[0]);

        // grab the first batch of linear tracking events
        if ((xml..Linear..TrackingEvents))
        {
            result.trackingEvents = parseTrackingEvents(xml..Linear..TrackingEvents[0]);
        }

        // grab the first VideoClicks object
        if (xml..VideoClicks)
        {
            result.videoClicks = parseVideoClicks(xml..VideoClicks[0]);            
        }

        // wrappers can't have clickThroughs
        if (result.videoClicks)
        {
            result.videoClicks.clickThrough = null;
        }

        return result;
    }


    private function parseInLine(inLineXML:XML, ad:Ad):InLine
    {
        ad.id = inLineXML.@id[0];

        var result:InLine = parseCreatives(inLineXML, ad);
        return result;

    }


    private function parseCreatives(inLineXML:XML, ad:Ad):InLine
    {

        var result:InLine = new InLine(ad);
        result.adTitle = inLineXML.AdTitle[0];
        result.description = inLineXML.Description[0];

        var creativesXML:XML = inLineXML.Creatives[0];

        for (var i:int = 0; i < creativesXML.children().length(); i++)
        {

            var creativeXML:XML = creativesXML.children()[i];

            if (creativeXML.CompanionAds.length() > 0)
            {
                var companionAdsXML:XML = creativeXML.CompanionAds[0];
                if (companionAdsXML != null)
                {
                    result.companionAds = parseCompanionAds(companionAdsXML);
                }
            }
            if (creativeXML.Linear[0] != null)
            {
                var linearXML:XML = creativeXML.Linear[0];
                if (linearXML != null)
                {
                    result.video = parseVideo(linearXML);
                }
            }
            if (creativeXML.NonLinearAds.length() > 0)
            {
                var nonLinearAdsXML:XML = creativeXML.NonLinearAds[0];
                if (nonLinearAdsXML != null)
                {
                    result.nonLinearAds = parseNonLinearAds(nonLinearAdsXML);
                    
                }
            }
        }


        return result;

    }

    override protected function parseMediaFile(xml:XML):MediaFile
    {
        var result:MediaFile = new MediaFile();
        if (xml.@bitrate[0] != null)
        {
            result.bitrate = Number(xml.@bitrate[0]) * 1000;
        }
        if (xml.@scalable[0] != null)
        {
            result.scalable = Boolean(xml.@scalable[0]);
        }
        if (xml.@maintainAspectRatio[0] != null)
        {
            result.maintainAspectRatio = Boolean(xml.@maintainAspectRatio[0]);
        }
        if (xml.@apiFramework[0] != null)
        {
            result.apiFramework = xml.@apiFramework[0];
        }

        result.delivery = xml.@delivery[0];
        if (xml.@height[0] != null)
        {
            result.height = Number(xml.@height[0]);
        }
        result.id = xml.@id[0];
        result.type = xml.@type[0];
        result.url = parseSimpleUrl(xml);
        if (xml.@width[0] != null)
        {
            result.width = Number(xml.@width[0]);
        }
        return result;
    }


    override protected function parseCompanion(xml:XML):Companion
    {
        if (!xml) return null;
		var result:Companion = new Companion();
        result.altText = xml.AltText[0];
        result.adParameters = parseAdParameters(xml.AdParameters[0]);
        result.code = xml.Code[0];
        result.companionClickThrough = parseSimpleUrl(xml.CompanionClickThrough[0]);
        result.trackingEvents = parseTrackingEvents(xml.TrackingEvents[0]);
        result.creativeType = xml.@creativeType[0];
        if (xml.@expandedHeight[0] != null)
        {
            result.expandedHeight = Number(xml.@expandedHeight[0]);
        }
        if (xml.@expandedWidth[0] != null)
        {
            result.expandedWidth = Number(xml.@expandedWidth[0]);
        }
        if (xml.@height[0] != null)
        {
            result.height = Number(xml.@height[0]);
        }
        result.id = xml.@id[0];
        result.resourceType = xml.@resourceType[0];
        result.url = parseSimpleUrl(xml.StaticResource[0]);
        if (!result.url)
        result.url = parseSimpleUrl(xml.IFrameResource[0]);

        if (xml.@width[0] != null)
        {
            result.width = Number(xml.@width[0]);
        }
                                
		// if there was no creative type on the Companion node get it from the StaticResource node
		if (xml.StaticResource[0] && xml.StaticResource[0].@creativeType[0])
		{
			result.creativeType = xml.StaticResource[0].@creativeType[0];
		}

        //result.iFrameResource = parseIFrameResource(xml.IFrameResource[0]);
        result.htmlResource = xml.HTMLResource[0];

        return result;
    }

//    private function parseStaticResource(xml:XML):StaticResource
//    {
//        if (xml!=null)
//        {
//            var result:StaticResource = new StaticResource();
//            result.creativeType=xml.@creativeType[0];
//            result.url=xml.text();
//            return result;
//        }
//        else
//            return null;
//    }

//    private function parseIFrameResource(xml:XML):IFrameResource
//    {
//        if (xml!=null)
//        {
//            var result:IFrameResource = new IFrameResource();
//            result.creativeType=xml.@creativeType[0];
//            result.url=xml.text();
//            return result;
//        }
//        else
//            return null;
//    }

    override protected function parseNonLinear(xml:XML, trackingEvents:Array = null):NonLinear
    {
        var result:NonLinear = new NonLinear();
        result.apiFramework = xml.@apiFramework[0];
        result.code = xml.Code[0];
        result.creativeType = xml.@creativeType[0];

        if (xml.StaticResource[0])
        {
            result.creativeType = xml.StaticResource[0].@creativeType[0];
        }

        if (xml.@expandedHeight[0] != null)
        {
            result.expandedHeight = Number(xml.@expandedHeight[0]);
        }
        if (xml.@expandedWidth[0] != null)
        {
            result.expandedWidth = Number(xml.@expandedWidth[0]);
        }
        if (xml.@height[0] != null)
        {
            result.height = Number(xml.@height[0]);
        }
        result.id = xml.@id[0];
        if (xml.@maintainAspectRatio[0] != null)
        {
            result.maintainAspectRatio = Boolean(xml.@maintainAspectRatio[0]);
        }
        if (xml.@minSuggestedDuration[0] != null)
        {
            result.minSuggestedDuration = Number(xml.@minSuggestedDuration[0]);
        }
        result.nonLinearClickThrough = parseSimpleUrl(xml.NonLinearClickThrough[0]);
        result.adParameters = parseAdParameters(xml.AdParameters[0]);
        result.trackingEvents = trackingEvents;//Tracking events are on NonLinearsAds tag not each nonLinear parseTrackingEvents(xml.TrackingEvents[0]);

        result.resourceType = xml.@resourceType[0];
        if (xml.@scalable[0] != null)
        {
            result.scalable = Boolean(xml.@scalable[0]);
        }
        result.url = parseSimpleUrl(xml.StaticResource[0]);
        if (!result.url)
            result.url = parseSimpleUrl(xml.IFrameResource[0]);

        if (xml.HTMLResource[0])
            result.htmlResource = xml.HTMLResource[0];


        if (xml.@width[0] != null)
        {
            result.width = Number(xml.@width[0]);
        }
        return result;
    }

    override protected function parseNonLinearAds(xml:XML):Array
    {

        if (xml != null && xml.NonLinear != null)
        {
            var trackingEvents:Array;

            if (xml.TrackingEvents!=null)
                trackingEvents = parseTrackingEvents(xml.TrackingEvents[0]);

            var result:Array = new Array();
            for (var i:int = 0; i < xml.NonLinear.length(); i++)
            {
                result.push(parseNonLinear(xml.NonLinear[i],trackingEvents));

                //not the most readable way to do this, but we set trackingEvents back to null, because Vast says
                //one NonLinearAds creative represents a single creative concept, so we only track it once (when the first overlay is rendered)
                trackingEvents = null;
            }
            return result;
        }
        return null;
    }


}
}

internal class Vast2Pvt
{
    public function Vast2Pvt()
    {
    }
}
