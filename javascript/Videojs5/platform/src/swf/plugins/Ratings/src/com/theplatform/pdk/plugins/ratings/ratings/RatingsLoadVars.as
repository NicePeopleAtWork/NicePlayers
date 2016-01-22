/**
 * Created with IntelliJ IDEA.
 * User: paul.rangel
 * Date: 10/11/13
 * Time: 3:25 PM
 * To change this template use File | Settings | File Templates.
 */
package com.theplatform.pdk.plugins.ratings.ratings {
import flash.geom.Point;

public class RatingsLoadVars {

    private var _scheme:String =  "urn:v-chip";
    private var _path:String = "images/ratings/"; // uri string
    private var _reminder:Number = 0;
    private var _position:Point;

    private var _delay:uint = 15; // 15 seconds

    public function RatingsLoadVars(vars:Object) {
        // path to look for images
        if(vars.hasOwnProperty('path')) {
            _path = vars['path'];
        }
        else
        {
            var plugInUrl:String = vars['plugInUrl'];
                    
            if (plugInUrl && plugInUrl.match(/swf\/.+\.swf/)) {
                _path = plugInUrl.replace(/swf\/(.+)\.swf/, "../images/ratings/");
            }
            else if (plugInUrl && plugInUrl.match(/.+swf/)) {
                //_gaJavascriptUrl = "ga.js";
                _path = plugInUrl.replace(/\w*\.swf/, "../images/ratings/");
            }
        }

        // length of time to show the ratings image
        if(vars.hasOwnProperty('delay')) {
            _delay = vars['delay'];
        }
        // scheme used by factory to create image name
        if(vars.hasOwnProperty('scheme')) {
            _scheme = vars['scheme'];
        }
        // position to show rating
        if(vars.hasOwnProperty('position')) {
            var strPoint:String = vars['position'];
            var xyPos:Array = strPoint.split(",");
            if(xyPos && xyPos.length == 2) {
                _position = new Point(xyPos[0], xyPos[1])
            }
        }
        // arbitrary timepoint to show rating
        if(vars.hasOwnProperty("reminder")) {
            _reminder = Number(vars['reminder']);
        }
    }

    public function get scheme():String {
        return _scheme;
    }

    public function set scheme(value:String):void {
        _scheme = value;
    }

    public function get path():String {
        return _path;
    }

    public function set path(value:String):void {
        _path = value;
    }

    public function get reminder():Number {
        return _reminder;
    }

    public function set reminder(value:Number):void {
        _reminder = value;
    }

    public function get position():Point {
        return _position;
    }

    public function set position(value:Point):void {
        _position = value;
    }

    public function get delay():uint {
        return _delay;
    }

    public function set delay(value:uint):void {
        _delay = value;
    }
}
}
