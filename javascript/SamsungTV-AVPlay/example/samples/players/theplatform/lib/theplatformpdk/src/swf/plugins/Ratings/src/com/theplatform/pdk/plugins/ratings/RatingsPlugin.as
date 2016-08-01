/**
 * Created with IntelliJ IDEA.
 * User: paul.rangel
 * Date: 10/11/13
 * Time: 2:44 PM
 * To change this template use File | Settings | File Templates.
 */
package com.theplatform.pdk.plugins.ratings
{
import com.theplatform.pdk.controllers.IPlayerController;
import com.theplatform.pdk.data.Clip;
import com.theplatform.pdk.data.LoadObject;
import com.theplatform.pdk.plugins.IMetadataUrlPlugIn;

import com.theplatform.pdk.plugins.ratings.ratings.Ratings;
import com.theplatform.pdk.plugins.ratings.ratings.RatingsLoadVars;
import com.theplatform.pdk.plugins.ratings.verification.AgeVerification;
import com.theplatform.pdk.utils.Debug;

import flash.display.Sprite;
import flash.external.ExternalInterface;
import flash.system.Security;
import flash.utils.setTimeout;


public class RatingsPlugin extends Sprite implements IMetadataUrlPlugIn {

    private var _ratings:Ratings;
    private var _ageVerification:AgeVerification;
    private var _controller:IPlayerController;

    public function RatingsPlugin()
    {


    }


    public function initialize(lo:LoadObject):void
    {
        Security.allowDomain("*");

        _controller = lo.controller as IPlayerController;
        _controller.trace("initialize ratings plugin", "RatingsPlugin", Debug.INFO);

        // should default to true
        if(!(lo.vars.hasOwnProperty("showRatings") && lo.vars['showRatings'] == "false"))
        {
            try {
                lo.vars['plugInUrl'] = _controller.getStage().loaderInfo.url;
            }
            catch (e:Error) {
                lo.vars['plugInUrl'] = "";
            }
            log("creating flash ratings instance")
            _ratings = new Ratings(this,_controller, new RatingsLoadVars(lo.vars));
        }
        else
        {
            log("NOT creating flash ratings instance")
        }


        // defaults to false
        if(lo.vars.hasOwnProperty("enableAgeVerification") && lo.vars['enableAgeVerification'] == "true")
        {
           var priority:Number = lo.vars.hasOwnProperty("priority") ? Number(lo.vars["priority"]) : NaN;
            log("creating flash age verification instance");
            _ageVerification = new AgeVerification(_controller, lo.vars);
            _controller.registerMetadataUrlPlugIn(this, priority);
        }
        else
        {
            log("NOT creating flash age verification instance");
        }
    }

    public function rewriteMetadataUrl(url:String, isPreview:Boolean):Boolean
    {
        var retVal:Boolean = false;

        if(_ageVerification && !isPreview)
        {
            retVal = _ageVerification.rewriteMetadataUrl(url);
        }

        _controller.trace("*** (end) rewriteUrl: "+retVal, "RatingsPlugin", Debug.DEBUG);

        return retVal;
    }

    private function log(s:String):void
    {
        if(ExternalInterface.available)
        {
            ExternalInterface.call("tpDebug", s, "RatingsPlugin (Flash)", "Debug");
        }
    }
}


}
