package net.iab.vast.parsers
{
import com.theplatform.pdk.utils.PdkStringUtils;

import flash.errors.IllegalOperationError;

import net.iab.vast.data.*;

//this would make sense as a singleton
public class Vast1XmlParser extends AbstractVastXmlParser implements IVastParser
{

    protected static var _instance:IVastParser;

    protected static const secretSingletonCode:String = "itsasecret";

    public function Vast1XmlParser(pvt:Vast1Pvt = null)
    {

        super(this);

        if (!pvt)
        {
            throw new IllegalOperationError("Vast1Parser constructor can not be called directly")
        }



    }

    public static function getInstance():IVastParser
    {

        if (_instance)
            return _instance;
        else
            return new Vast1XmlParser(new Vast1Pvt());

    }

    override protected function parseWrapper(xml:XML, ad:Ad):Wrapper
    {
        var result:Wrapper = new Wrapper(ad);
        result.vastAdTagURL = parseSimpleUrl(xml.VASTAdTagURL.URL[0]);
        result.videoClicks = parseVideoClicks(xml.VideoClicks[0]);
        return result;
    }


    override protected function parseAd(xml:XML):Ad
    {
        var result:Ad = new Ad();
        result.id = xml.@id[0];
        var subXml:XML = xml.children()[0];
        result.adSystem = subXml.AdSystem[0];
        result.error = parseSimpleUrl(subXml.Error[0]);
        result.extensions = subXml.Extensions[0];
        result.impressions = parseUrls(subXml.Impression[0]);
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
        if (xml != null&&xml.text().length)
        {
            return xml.text();
        }
        return null;
    }


    private function parseInLine(xml:XML, ad:Ad):InLine
    {
        var result:InLine = new InLine(ad);
        result.adTitle = xml.AdTitle[0];
        result.description = xml.Description[0];
        result.survey = parseSimpleUrl(xml.Survey[0]);
        result.video = parseVideo(xml.Video[0]);
        result.companionAds = parseCompanionAds(xml.CompanionAds[0]);
        result.nonLinearAds = parseNonLinearAds(xml.NonLinearAds[0]);
        return result;
    }




    override protected function parseMediaFile(xml:XML):MediaFile
    {
        var result:MediaFile = new MediaFile();
        if (xml.@bitrate[0] != null)
        {
            result.bitrate = Number(xml.@bitrate[0]) * 1000;
        }
        result.delivery = xml.@delivery[0];
        if (xml.@height[0] != null)
        {
            result.height = Number(xml.@height[0]);
        }
        result.id = xml.@id[0];
        result.type = xml.@type[0];
        result.url = parseSimpleUrl(xml.URL[0]);
        if (xml.@width[0] != null)
        {
            result.width = Number(xml.@width[0]);
        }
        return result;
    }



    override protected function parseCompanion(xml:XML):Companion
    {
        var result:Companion = new Companion();
        result.altText = xml.AltText[0];
        result.adParameters = parseAdParameters(xml.AdParameters[0]);
        result.code = xml.Code[0];
        result.companionClickThrough = parseSimpleUrl(xml.CompanionClickThrough.URL[0]);
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
        result.url = parseSimpleUrl(xml.URL[0]);
        if (xml.@width[0] != null)
        {
            result.width = Number(xml.@width[0]);
        }
        return result;
    }

  
    override protected function parseNonLinear(xml:XML, trackingEvents:Array = null):NonLinear
    {
        var result:NonLinear = new NonLinear();
        result.apiFramework = xml.@apiFramework[0];
        result.code = xml.Code[0];
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
        if (xml.@maintainAspectRatio[0] != null)
        {
            result.maintainAspectRatio = Boolean(xml.@maintainAspectRatio[0]);
        }
        result.nonLinearClickThrough = parseSimpleUrl(xml.NonLinearClickThrough[0]);
        result.adParameters = parseAdParameters(xml.AdParameters[0]);
        result.resourceType = xml.@resourceType[0];
        if (xml.@scalable[0] != null)
        {
            var val:String = xml.@scalable[0].toString().toLowerCase();
            result.scalable = ( val == "true" ? true : false );
        }
        result.url = parseSimpleUrl(xml.URL[0]);
        if (xml.@width[0] != null)
        {
            result.width = Number(xml.@width[0]);
        }
        return result;
    }

        override protected function parseNonLinearAds(xml:XML):Array
    {
        //todo: verify this works with vast 1.0
        if (xml != null && xml.children() != null)
        {
            var result:Array = new Array();
            for (var i:int = 0; i < xml.children().length(); i++)
            {
                result.push(parseNonLinear(xml.children()[i]));
            }
            return result;
        }
        return null;
    }


}

}

internal class Vast1Pvt
{
    public function Vast1Pvt()
    {
    }
}