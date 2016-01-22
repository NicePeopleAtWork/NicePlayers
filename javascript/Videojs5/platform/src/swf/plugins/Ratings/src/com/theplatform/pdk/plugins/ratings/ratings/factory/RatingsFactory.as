/**
 * Created with IntelliJ IDEA.
 * User: paul.rangel
 * Date: 10/11/13
 * Time: 3:14 PM
 *
 */
package com.theplatform.pdk.plugins.ratings.ratings.factory {
import com.theplatform.pdk.data.Rating;

import flash.errors.IllegalOperationError;

public class RatingsFactory {
    private var _suffix:String = ".png";
    private var _ratings:Array;
    private var _namingPattern:String = "{rating}-{subratings}";
    private var _filenameToUpper:Boolean = false;

    public function RatingsFactory()
    {
    }

    public function set namingPattern(value:String):void {
        if(!value.indexOf("{rating}"))
            throw IllegalOperationError("Missing {rating} in naming pattern definition");
        _namingPattern = value;
    }

    public function set filenameToUpper(value:Boolean):void
    {
        _filenameToUpper = value;
    }

    public function set ratings(value:Array):void {
        if(_ratings)
            _ratings = null;
        _ratings = value;
    }

    public function set suffix(value:String):void
    {
        _suffix = value;
    }

    public function getImageName(scheme:String, additionalParams:Object):String
    {
        var fileName:String = _namingPattern;
        var rating:Rating = getRating(scheme);
        var spaceRegex:RegExp = /[\s]*/gim;
        if(!rating)
            return null;
        fileName = fileName.replace("{rating}", rating.rating.replace("-",""));
        //trace("filename: "+fileName)
        if(fileName.indexOf("{subratings}")) {
            if(rating.subRatings && rating.subRatings.length > 0) {
                // custom join to clean up whitespaces
                var sr:String = "";
                rating.subRatings.sort(Array.CASEINSENSITIVE); // images with subratings are named with alphabetized subratings
//                trace("subratings: ");
                for each(var r:String in rating.subRatings) {
//                    trace(r);
                    sr += r.replace("-","");
                }
                //var joined:String = rating.subRatings.join("");
//                trace("subRatings; "+sr);
                fileName = fileName.replace("{subratings}", sr);
            } else {
                fileName = fileName.replace("{subratings}", "");
            }
        }
        // make ratings uppercase
        if(_filenameToUpper)
            fileName = fileName.toUpperCase();
        // find and replace additional params
        for(var k:String in additionalParams) {
            var toReplace:String = "{"+k.toUpperCase()+"}";
            if(fileName.indexOf(toReplace) >= 0) {
                fileName = fileName.replace(toReplace, additionalParams[k]);
            }
        }
        // make sure there are no spaces
        fileName = fileName.replace(spaceRegex, "");
        //trace("final filename: "+fileName);
        return fileName+_suffix;
    }

    private function getRating(scheme:String):Rating
    {
        for each(var r:Rating in _ratings) {
            if(r.scheme == scheme) {
                return r;
            }
        }
        return null;
    }
}
}
