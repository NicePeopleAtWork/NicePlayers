/**
 * Created with IntelliJ IDEA.
 * User: paul.rangel
 * Date: 10/11/13
 * Time: 3:02 PM
 *
 */
package com.theplatform.pdk.plugins.ratings.ratings {
import com.theplatform.pdk.controllers.IPlayerController;
import com.theplatform.pdk.data.Clip;
import com.theplatform.pdk.data.TimeObject;
import com.theplatform.pdk.events.PdkEvent;
import com.theplatform.pdk.events.PlayerEvent;
import com.theplatform.pdk.plugins.ratings.ratings.factory.RatingsFactory;
import com.theplatform.pdk.plugins.ratings.ratings.loader.RatingsImageLoader;
import com.theplatform.pdk.utils.Debug;

import fl.transitions.Tween;
import fl.transitions.TweenEvent;
import fl.transitions.easing.Regular;

import flash.display.DisplayObject;
import flash.display.Sprite;
import flash.events.ErrorEvent;
import flash.events.Event;
import flash.events.TimerEvent;
import flash.external.ExternalInterface;
import flash.geom.Point;
import flash.geom.Rectangle;
import flash.utils.Timer;

public class Ratings {

    private var _pluginSprite:Sprite;
    private var _controller:IPlayerController;
    private var _loadVars:RatingsLoadVars;

    // load vars with defaults
//    private var _scheme:String =  "urn:v-chip";
//    private var _path:String = "images/ratings/"; // uri string
//    private var _reminder:Number = 0;
    private var _reminderTime:Number = -1;
//    private var _position:Point;
    private var _isAd:Boolean = false;
//    private var _delay:uint = 15; // 15 seconds
    // utils and managers
    private var _factory:RatingsFactory;
    private var _loader:RatingsImageLoader;
    private var _baselines:Object;
    private var _ratingImage:DisplayObject;
    private var _ratingsImageName:String = "";
    private var _currentTime:int = 0;
    private var _tween:Tween;
    private var _playerArea:Rectangle;
    private var _isFirstClip:Boolean = true;

    private var _showRatingTimer:Timer;
    private var _ratingsShouldBeDisplayed:Boolean = true;
    private var _wasPaused:Boolean = false;

    // timing issue with skin loading: if skin not loaded and next media area changed event hasn't fired
    // then we do not have correct media area, which leads to incorrect ratings image choice/position/size
    private var _skinLoaded:Boolean = false;
    private var _playerLoaded:Boolean = false;
    private var _mediaAreaReady:Boolean = false;
    private var _overlayAreaReady:Boolean = false;
    private var _startupReady:Boolean = false
    private var _showRatingOnStartupReady:Boolean = false;

    public function Ratings(pluginSprite:Sprite, controller:IPlayerController, loadVars:RatingsLoadVars) {

        _pluginSprite = pluginSprite;
        _controller = controller;
        _loadVars = loadVars;
        _controller.setPlugInsAboveControls(false);
        _factory = new RatingsFactory();
        _factory.filenameToUpper = true;
        _factory.namingPattern = "{subdir}/{size}{rating}{subratings}{definition}";
        // image loader set up
        _loader = new RatingsImageLoader();
        _loader.addEventListener(RatingsImageLoader.RATINGS_IMAGE_LOAD_FAIL, onRatingsImageLoadFail, false, 0, true);
        _loader.addEventListener(RatingsImageLoader.RATINGS_IMAGE_LOAD_SUCCESS, onRatingsImageLoadSuccess, false, 0, true);
        // configure baseline
        _baselines = {};
        _baselines["HD"] = new Rectangle(0,0,1920, 1080);
        _baselines["SD"] = new Rectangle(0,0,640, 480);
        // show hide timer setup
        _showRatingTimer = new Timer(1000,_loadVars.delay);
        //_showRatingTimer.addEventListener(TimerEvent.TIMER, onShowRatingsTimer, false, 0, true);
        _showRatingTimer.addEventListener(TimerEvent.TIMER_COMPLETE, onShowRatingsTimerComplete, false, 0, true);

        addEventListeners();
    }


    private function addEventListeners():void
    {
        _controller.addEventListener(PdkEvent.OnSkinComplete, onSkinComplete);
        _controller.addEventListener(PdkEvent.OnPlayerLoaded, onPlayerLoaded);
        _controller.addEventListener(PdkEvent.OnLoadReleaseUrl, onLoadRelease);
        _controller.addEventListener(PdkEvent.OnReleaseStart, onLoadRelease);
        _controller.addEventListener(PdkEvent.OnMediaStart, onMediaStart);
        _controller.addEventListener(PdkEvent.OnMediaPlaying, mediaPlaying);
        _controller.addEventListener(PdkEvent.OnReleaseEnd, releaseEnd);
        _controller.addEventListener(PdkEvent.OnMediaPause, onMediaPause);
        //_controller.addEventListener(PdkEvent.OnMediaPlay, onMediaPlay); this is not working -pr

        // player events
        _controller.addEventListener(PlayerEvent.OnOverlayAreaChanged, overlayAreaChanged);
        _controller.addEventListener(PlayerEvent.OnMediaAreaChanged, onMediaAreaChanged);

    }

    protected function onShowRatingsTimerComplete(e:TimerEvent):void
    {
        hideRating();
    }

    protected function onRatingsImageLoadSuccess(e:Event):void
    {
        _ratingImage = _loader.image;
        // if new image is loaded assign to tween
        if(_tween) {
            _tween.obj = _ratingImage;
        }
        doShowRating();
    }

    protected function onRatingsImageLoadFail(e:ErrorEvent):void
    {
        _controller.trace("Ratings image could not be loaded"+e.text,"RatingsPlugIn", Debug.ERROR);
        _ratingsImageName = "";
        _showRatingTimer.reset();
        doHideRating();
    }
    // TODO: move this to the factory?
    protected function imageConfig():Object
    {
        if(_isFirstClip) {
            if(isHD()) {
                return {subdir: "hd_large", definition: "H", size: "L"}
            } else {
                return {subdir: "sd_large", definition: "S", size: "L"}
            }
        }  else {
            if(isHD()) {
                return {subdir: "hd_mid", definition: "H", size: "M"}
            } else {
                return {subdir: "sd_mid", definition: "S", size: "M"}
            }
        }
    }

    protected function showRating():void
    {
        if(!_startupReady)
        {
            _showRatingOnStartupReady = true;
        }
        else
        {
            _showRatingOnStartupReady = false;

            var imageName:String  = _factory.getImageName(_loadVars.scheme,imageConfig());

            _isFirstClip = false;

            // if we don't have a rating name
            // then load a new rating
            if(imageName && imageName != _ratingsImageName )
            {
                if(_ratingImage && _pluginSprite.contains(_ratingImage))
                    _pluginSprite.removeChild(_ratingImage);

                if(_ratingImage )
                    _ratingImage = null;

                _ratingsImageName = imageName;
                _loader.loadImage(_loadVars.path+imageName);
            }
            else if(imageName)
            {
                doShowRating();
            }
        }

    }

    protected function doShowRating():void
    {
        if(_ratingImage)
        {
            if(_pluginSprite.contains(_ratingImage))
                return;

            _pluginSprite.addChildAt(_ratingImage,0);

            positionRatingImage();

            _showRatingTimer.reset();
            _showRatingTimer.start();
        }
    }

    protected function hideRating():void
    {
        if((_tween && _tween.isPlaying) || !_ratingImage)
            return;

        if(!_tween) {
            _tween = new Tween(_ratingImage,"alpha", Regular.easeOut, 1, 0, .3, true);
            _tween.addEventListener(TweenEvent.MOTION_FINISH, doHideRating, false, 0, true);
        }
        _tween.start();
    }

    protected function doHideRating(e:TweenEvent=null):void
    {
        if(!_ratingImage)
            return;

        if(_pluginSprite.contains(_ratingImage))
            _pluginSprite.removeChild(_ratingImage);
        if(_showRatingTimer.running)
            _showRatingTimer.stop();
        if(_tween)
            _tween.rewind();
    }

    protected function positionRatingImage():void
    {
        if(!_ratingImage)
            return;

        // first set to one
        _ratingImage.scaleY = _ratingImage.scaleX = 1;

        var mediaArea:Rectangle = _controller.getContentArea();
        var scale:Number = getScale();
        var position:Point = (_loadVars.position)? _loadVars.position : getPosition();
        _ratingImage.x = mediaArea.x+position.x*scale;
        _ratingImage.y = mediaArea.y+position.y*scale;
        _ratingImage.scaleY = _ratingImage.scaleX = scale;
    }

    protected function getScale():Number
    {
        var isFullscreen:Boolean = _controller.getFullScreenState();
        var baselineRect:Rectangle = getBaselineSize((isHD())? "HD":"SD");

        var playerArea:Rectangle = isFullscreen
            ? new Rectangle(0,0,_pluginSprite.stage.stageWidth, _pluginSprite.stage.stageHeight)
            : _controller.getOverlayArea();

        return Math.min(playerArea.width/baselineRect.width, 1.0);
    }

    protected function getPosition():Point
    {
        if(isHD()) {
            new Point(195, 100);
        }
        return new Point(70,40);
    }
    // gets the baseline size of the image this is used to scale the size of the image
    protected function getBaselineSize(key:String):Rectangle
    {
        if(_baselines.hasOwnProperty(key))
            return _baselines[key];
        return null;
    }
    // * begin pdk playback listeners * //



    private function onMediaStart(e:PdkEvent):void
    {
        var clip:Clip = e.data as Clip;

        if(clip.baseClip)
            _isAd = clip.baseClip.isAd;

        if(_isAd)
        {
            _ratingsShouldBeDisplayed = true;
            doHideRating(); // if we are an ad, we don't want ratings to show over them. PDK-9699
        }
        else
        {
            if(clip.baseClip.ratings.length > 0 && _ratingsShouldBeDisplayed)
            {
                _factory.ratings = clip.baseClip.ratings;
                showRating();

                _ratingsShouldBeDisplayed = false;
            }
            else
            {
                _controller.trace("No ratings set on baseClip ", "RatingsPlugIn", Debug.WARN);
            }
        }
    }

    // This event fires when a release is loaded
    private function onLoadRelease(e:PdkEvent):void
    {
        resetDisplay();
        _isFirstClip = true;
    }

    private function resetDisplay():void
    {
        if(!isNaN(_loadVars.reminder) && _loadVars.reminder > -1)
            _reminderTime = _loadVars.reminder;
        _ratingsShouldBeDisplayed = true;
    }

    // This event fires three times per second
    private function mediaPlaying(e:PdkEvent):void
    {
        if(_wasPaused && !_showRatingTimer.running)
        {
            _showRatingTimer.start();
            _wasPaused = false;
        }

        var time:TimeObject = e.data as TimeObject;
        _currentTime = time.currentTimeAggregate;
        // in Seconds, enables the showing the rating at arbitrary times
        // during playback

        if(_reminderTime > 0 && _currentTime > (_reminderTime*1000) && !_isAd)
        {
            showRating();
            _reminderTime = -1;
        }
    }

    protected function onMediaPause(e:PdkEvent):void
    {
        if(_showRatingTimer.running)
        {
            _wasPaused = true;
            _showRatingTimer.stop();
        }
    }

    private function onMediaAreaChanged(pev:PlayerEvent):void
    {
        _playerArea = pev.data as Rectangle;

        if(_skinLoaded)
            _mediaAreaReady = true;

        if(_skinLoaded && _overlayAreaReady && _playerLoaded && !_startupReady)
        {
            doDelayedShowRating();
        }
        else if(_startupReady)
        {
            positionRatingImage();
        }
    }

    // This event fires whenever the size of the overlay area changes
    private function overlayAreaChanged(pev:PlayerEvent):void
    {
        if(_skinLoaded)
            _overlayAreaReady = true;

        if(_skinLoaded && _mediaAreaReady && _playerLoaded && !_startupReady)
        {

            doDelayedShowRating();
        }
        else if(_startupReady)
        {
            positionRatingImage();
        }
    }

    protected function isHD():Boolean
    {
        if(_playerArea)
        {
            var aspectRatio:Number = _playerArea.width / _playerArea.height;
            if(aspectRatio > 1.33)
            {
                return true;
            }

        }
        return false;
    }

    // This event fires when a playlist ends.
    private function releaseEnd(e:PdkEvent):void
    {
        doHideRating();
        resetDisplay();
    }

    private function log(s:String):void
    {
        _controller.trace(s,"Ratings(flash)", Debug.DEBUG);
    }

    private function onSkinComplete(event:PdkEvent):void {
        _skinLoaded = true;
    }

    private function onPlayerLoaded(event:PdkEvent):void
    {
        _playerLoaded = true;
        if(skinAndSizeReady())
        {
            doDelayedShowRating();
        }
    }

    private function skinAndSizeReady():Boolean
    {
        return _skinLoaded && _mediaAreaReady && _overlayAreaReady;
    }

    private function doDelayedShowRating():void
    {
        _startupReady = true;
        if(_showRatingOnStartupReady)
        {
            showRating();
        }
    }

}
}
