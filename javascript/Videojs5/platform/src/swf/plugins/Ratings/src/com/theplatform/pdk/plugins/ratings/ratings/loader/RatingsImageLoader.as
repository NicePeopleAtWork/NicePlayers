/**
 * Created with IntelliJ IDEA.
 * User: paul.rangel
 * Date: 10/11/13
 * Time: 3:09 PM
 * To change this template use File | Settings | File Templates.
 */
package com.theplatform.pdk.plugins.ratings.ratings.loader {
import flash.display.Bitmap;
import flash.display.DisplayObject;
import flash.display.Loader;
import flash.events.ErrorEvent;
import flash.events.Event;
import flash.events.EventDispatcher;
import flash.events.HTTPStatusEvent;
import flash.events.IOErrorEvent;
import flash.events.SecurityErrorEvent;
import flash.net.URLRequest;
import flash.system.LoaderContext;

public class RatingsImageLoader extends EventDispatcher {

    public static var RATINGS_IMAGE_LOAD_SUCCESS:String = "ratingsImageLoadSuccess";
    public static var RATINGS_IMAGE_LOAD_FAIL:String = "ratingsImageLoadFail";

    private var _loader:Loader;
    private var _loaderContext:LoaderContext;
    private var _httpStatus:uint;
    private var _image:DisplayObject;

    public function RatingsImageLoader() {
        _loaderContext = new LoaderContext();
        _loaderContext.checkPolicyFile = true
    }

    public function loadImage(url:String):void
    {
        var request:URLRequest = new URLRequest(url);

        if(!_loader)
            _loader = new Loader();
        // add event listeners
        _loader.contentLoaderInfo.addEventListener(Event.COMPLETE, onComplete, false, 0, true);
        _loader.contentLoaderInfo.addEventListener(HTTPStatusEvent.HTTP_STATUS, onHTTPStatus, false, 0, true);
        _loader.contentLoaderInfo.addEventListener(ErrorEvent.ERROR, onError, false, 0, true);
        _loader.contentLoaderInfo.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onSecurityError, false, 0, true);
        _loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, onIOError, false, 0, true);
        _loader.load(request, _loaderContext);
    }

    public function get image():DisplayObject
    {
        return _image;
    }

    protected function onIOError(e:IOErrorEvent):void
    {
        e.stopImmediatePropagation();
        onFail("[IOError] "+e.text);
    }

    protected function onSecurityError(e:SecurityErrorEvent):void
    {
        e.stopImmediatePropagation();
        onFail("[SecurityError] "+e.text);
    }

    protected function onError(e:ErrorEvent):void
    {
        e.stopImmediatePropagation();
        onFail(e.text);
    }

    protected function onHTTPStatus(e:HTTPStatusEvent):void
    {

        _httpStatus = e.status;
    }

    protected function onFail(text:String):void
    {
        dispatchEvent(new ErrorEvent(RATINGS_IMAGE_LOAD_FAIL,false, false, text));
    }

    protected function onComplete(e:Event):void
    {
        if(_httpStatus == 200 || _httpStatus == 0) {
            try {
                //var loader:Loader = new Loader();
                //loader.loadBytes(_loader.data);
                var bitmap:Bitmap = e.target.content;
                bitmap.smoothing = true;
                bitmap.width = 100;
                bitmap.height = 100;

                _image = bitmap;
                dispatchEvent(new Event(RATINGS_IMAGE_LOAD_SUCCESS));
            } catch(e:Error) {
                onFail(e.name+"\n Error: "+e.message+"\n Return data: \n\n"+_loader);
            }
        }  else {
            onFail("[RatingImageLoadFail] HttpStatus is not 200 or 0");
        }
    }

 }

}


