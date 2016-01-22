/**
 * Created with IntelliJ IDEA.
 * User: daniel.niland
 * Date: 1/16/13
 * Time: 2:38 PM
 * To change this template use File | Settings | File Templates.
 */
package com.theplatform.pdk.decoder
{
import com.adobe.cc.CCDecoderImpl;
import com.adobe.cc.CCType;
import com.adobe.cc.CEA708Service;

import flash.display.DisplayObject;
import flash.geom.Rectangle;

public class PDKCCDecoder extends CCDecoderImpl
{
    public function PDKCCDecoder(channel:String = CEA708Service.CC1)
    {
        super();
        init(channel);
    }

    private function init(channel:String):void
    {
        type = CCType.CEA708;
        service = channel; //CEA708Service.CC1;

        //default colors and sizes are already set
    }

    public function setCaptionInfo(info:Object):void
    {
        super.onCaptionInfoImpl(info);
    }

    public function get displayObject():DisplayObject
    {
        return super.getDisplayObjectImpl();
    }

    public function setVideoBounds(bounds:Rectangle):void
    {
        super.setVideoBoundsImpl(bounds);
    }

    public function getVideoBounds():Rectangle
    {
        return super.getVideoBoundsImpl();
    }

}
}
