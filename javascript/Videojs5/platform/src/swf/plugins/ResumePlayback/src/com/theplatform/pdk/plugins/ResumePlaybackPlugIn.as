/**
 * Created by IntelliJ IDEA.
 * User: andre.desroches
 * Date: 9/15/11
 * Time: 10:22 AM
 * To change this template use File | Settings | File Templates.
 */
package
com.theplatform.pdk.plugins
{
import com.theplatform.pdk.containers.ComponentArea;
import com.theplatform.pdk.controllers.IPlayerController;
import com.theplatform.pdk.controls.ButtonControl;
import com.theplatform.pdk.controls.Control;
import com.theplatform.pdk.controls.TextControl;
import com.theplatform.pdk.data.CardActions;
import com.theplatform.pdk.data.CardPriority;
import com.theplatform.pdk.data.Chapter;
import com.theplatform.pdk.data.Clip;
import com.theplatform.pdk.data.LoadObject;
import com.theplatform.pdk.data.MediaPause;
import com.theplatform.pdk.data.Playlist;
import com.theplatform.pdk.data.TimeObject;
import com.theplatform.pdk.data.TokenInfo;
import com.theplatform.pdk.events.PdkEvent;
import com.theplatform.pdk.mediators.FormCardMediator;
import com.theplatform.pdk.mediators.Mediator;
import com.theplatform.pdk.metadata.ItemMetaData;
import com.theplatform.pdk.plugins.mediators.ResumePlaybackButtonMediator;
import com.theplatform.pdk.plugins.mediators.ResumePlaybackLabelMediator;
import com.theplatform.pdk.utils.Debug;
import com.theplatform.pdk.utils.PdkStringUtils;

import flash.display.Sprite;
import flash.events.Event;
import flash.events.IOErrorEvent;
import flash.events.SecurityErrorEvent;

import flash.events.TimerEvent;

import flash.external.ExternalInterface;
import flash.net.URLLoader;
import flash.net.URLRequest;
import flash.system.Security;
import flash.utils.Timer;

import com.serialization.json.JSON;

public class ResumePlaybackPlugIn extends Sprite implements IMetadataUrlPlugIn, IControlPlugIn,IDestroyablePlugIn
{

    private var _context:String;
    private var _token:String;
    private var _mediaId:String;
    private var _lastKnownPosition:Number = 0;
    private var _total:Number = 0;
    private var _desiredPosition:Number=0;

    private var _useCache:Boolean = true;

    private var _isReady:Boolean = false;
    private var _isServiceError:Boolean = false;

    private var _priority:Number = 0;

    private var _swfId:String;

    private var _controller:IPlayerController;

    private var _scriptLoadTimer:Timer;

    private var _scriptPath:String = "/js/libs/bookmarks/bookmarks.js";//maybe this will be different?

    private var _currentReleaseUrl:String;

    private var _currentTitle:String;

    private var _resumeLabel:String;
    private var _restartLabel:String;
    private var _currentClip:Clip;
    private var _autoResume:Boolean = false;
	private var _threshold:Number = 0;

    private var _mediaIsAutoPlay:Boolean = false;
    private var _firstRelease:Boolean = true;


    private var _accountId:String = "";


    private static var _controlId:String = "tpResumePlaybackCard";

    private static const URN_PREFIX:String = "urn:theplatform:pdk:media:";

    private var _restartButtonMediator:ResumePlaybackButtonMediator;
    private var _resumeButtonMediator:ResumePlaybackButtonMediator;

    public function ResumePlaybackPlugIn()
    {
        Security.allowDomain("*");
    }

    public function initialize(lo:LoadObject):void
    {

        _context = lo.vars['context'];
        _token = lo.vars['token'];

        _controller = lo.controller as IPlayerController;

        if (!_token)
        {
            _controller.addEventListener(PdkEvent.OnSetToken, handleSetToken);
        }

        _resumeLabel = lo.vars['resumeLabel'];
        _restartLabel = lo.vars['restartLabel'];

        _accountId = lo.vars['accountId'];
        _accountId = _accountId === null ? "" : _accountId;

        //   _useCache = lo.vars['useCache'] != "false" ? true : false;

        _priority = lo.priority;

        _controller = lo.controller as IPlayerController;

		_autoResume = lo.vars['autoResume'] === "true" ? true : false;
		_threshold = lo.vars['threshold'] !== undefined ? parseInt(lo.vars['threshold']) : 0;

        if (PdkStringUtils.isExternalInterfaceAvailable())//if the externalInterface isn't available nothing here will work
        {
            _swfId = ExternalInterface.objectID;
            ExternalInterface.addCallback("bookmarkServiceReady", this.serviceReadyCallBack);

            var onReadyListener:String = [
                "function(){",
                "var ready = $pdk !== null && $pdk['bookmarks'] !== null && typeof($pdk) === 'object' && typeof($pdk['bookmarks']) === 'object';",
                "if (ready) {",
                "if($pdk.bookmarks !== null && typeof($pdk.bookmarks) === 'object' && $pdk.bookmarks.isReady) {",
                "setTimeout(function(){document.getElementById(\"" + _swfId + "\").bookmarkServiceReady();},1);",
                "} else {",
                "$pdk['bookmarks'].addEventListener(\"OnReady\",function(){ ",
                "setTimeout(function(){document.getElementById(\"" + _swfId + "\").bookmarkServiceReady();},1);",
                "});",
                "}",
                "} ",
                "return function() { return ready; };",
                "}",
            ].join("");

            //we should probably import the javascript if it's not available...

            //_controller.trace("calling: "+onReadyListener, "ConcurrencyPlugin", Debug.WARN);

            var ready:Boolean = ExternalInterface.call(onReadyListener + "()");

            if (!ready)
            {
                var loaderStr:String = "function(){"
                        + " tpLoadScript($pdk.scriptRoot+\"" + _scriptPath + "\", " + onReadyListener
                        + ");"
                        + "  }";

                //  _controller.trace("not ready", "BookmarksPlugin", Debug.WARN);

                //  _controller.trace("calling: "+loaderStr, "BookmarksPlugin", Debug.WARN);

                ExternalInterface.call(loaderStr + "()");
            }

            //isn't it possible that isReady has been set by now?
            startScriptLoadTimer();
        }
        else
        {
            _controller.trace("ExternalInterface is not available: Concurrency cannot communicate with service", "ConcurrencyPlugin", Debug.ERROR);
            return;
        }


        _controller.registerControlPlugIn(this, _priority);

        var devicesCard:XML =
            <card id="tpResumePlaybackCard"  paddingTop="6" paddingRight="4" paddingBottom="6" paddingLeft="4">
            <spacer width="100%" height="40"/>
            <container direction="vertical" width="100%" height="60" horizontalAlign="center">
                <label text="Would you like to resume from where you left off watching:" textStyle="PlayerFormLabelFont"/>
                <control id="tpResumePlaybackTitle" textStyle="PlayerFormTitleFont"/>
            </container>
            <spacer width="100%" height="40" />
            <group direction="horizontal" horizontalAlign="center" width="100%" horizontalGap="4">
                <spacer width="100%"/>
                <control id="tpResumePlaybackRestartButton" skin="FormsButtonSkin" label="Restart" width="100" height="40"/>
                <control id="tpResumePlaybackResumeButton" skin="FormsButtonSkin" label="Resume" width="100" height="40"/>
                <spacer width="100%"/>
            </group>
            <spacer width="100%" height="50%"/>
            </card>

        _controller.addCard("forms", "tpResumePlaybackCard", devicesCard, CardPriority.DEFAULT);

        //registering now so we need to put in safety measures to check for _isReady and _isServiceError
        _controller.registerMetadataUrlPlugIn(this, _priority);
        _controller.addEventListener(PdkEvent.OnSetRelease, onSetRelease);
        _controller.addEventListener(PdkEvent.OnSetReleaseUrl, onSetRelease);
        _controller.addEventListener(PdkEvent.OnReleaseSelected, onReleaseSelected);

    }

    private function serviceErrorCallBack(e:TimerEvent):void
    {

        _controller.trace("$pdk.concurrency failed to load", "ResumePlaybackPlugin", Debug.WARN);

        endScriptLoadTimer();

        _isServiceError = true;

        checkStandbyReleaseUrl();
    }

    private function startScriptLoadTimer():void
    {
        if (!_scriptLoadTimer)
        {
            _scriptLoadTimer = new Timer(5000);
            _scriptLoadTimer.addEventListener(TimerEvent.TIMER, serviceErrorCallBack, false, 0, true);
        }
        _scriptLoadTimer.start();
    }

    private function endScriptLoadTimer():void
    {
        if (_scriptLoadTimer)
        {
            _scriptLoadTimer.stop();
            _scriptLoadTimer.removeEventListener(TimerEvent.TIMER, serviceErrorCallBack);
            _scriptLoadTimer = null;
        }
    }

    public function serviceReadyCallBack():void
    {

        _controller.trace("$pdk.bookmarks is now ready", "ResumePlaybackPlugin", Debug.INFO);

        _isReady = true;

        endScriptLoadTimer();

        _controller.addEventListener(PdkEvent.OnReleaseEnd, onReleaseEnd);
        _controller.addEventListener(PdkEvent.OnMediaPlaying, onMediaPlaying);
        _controller.addEventListener(PdkEvent.OnMediaStart, onMediaStart);
        _controller.addEventListener(PdkEvent.OnMediaEnd, onMediaEnd);
        _controller.addEventListener(PdkEvent.OnMediaPause, onMediaPause);

        //we expose some more JS functions to use as callbacks to $pdk.bookmarks service calls

        ExternalInterface.addCallback("hasBookmarkSuccessHandler", this.hasBookmarkSuccessHandler);

        ExternalInterface.addCallback("getBookmarkSuccessHandler", this.getBookmarkSuccessHandler);

        ExternalInterface.addCallback("bookmarksErrorHandler", this.errorHandler);

        checkStandbyReleaseUrl();

    }

    private function handleSetToken(e:PdkEvent):void
    {
        var ti:TokenInfo = e.data as TokenInfo;
        if (ti && ti.token)
        {
            _token = ti.token;
            _controller.trace("token set: " + ti.token + " from: " + ti.type, "ResumePlaybackPlugIn", Debug.INFO)
        }
    }

    private function onReleaseEnd(e:PdkEvent):void
    {
        if (!_currentClip) return;

        var lastChapter:Chapter = _currentClip.baseClip.playlistRef.chapters.lastChapter;
	    var isException:String = _currentClip.baseClip.contentCustomData ? _currentClip.baseClip.contentCustomData["isException"] : null;
        if (isException !== "true" && Math.abs(_lastKnownPosition-(lastChapter.aggregateStartTime + lastChapter.length))<=1000)
        {
            removeBookmark(_mediaId);
        }
        else if (_currentClip.currentMediaTime > 1000)
        {
            saveCurrentTime();
        }
        _mediaIsAutoPlay = false;
        _mediaId = null;
        _currentClip = null;
    }

    private function onReleaseSelected(e:PdkEvent):void
    {
        if (!e.data.userInitiated && _firstRelease)
        {
            _mediaIsAutoPlay = true;
        }
    }

    private function onMediaPlaying(e:PdkEvent):void
    {
        var time:TimeObject = e.data as TimeObject;

        if (_currentClip)
        {
            this._lastKnownPosition = time.currentTimeAggregate;
        }
    }

    private function onMediaPause(e:PdkEvent):void
    {
        var pause:MediaPause = e.data as MediaPause;

        if (!pause.clip.isAd)
        {
            saveCurrentTime();
        }
    }

    private function onMediaStart(e:PdkEvent):void
    {
        var clip:Clip = e.data as Clip;
        if (!clip.isAd)
        {
            _controller.addEventListener(PdkEvent.OnMediaPlaying, onMediaPlaying);
            _currentClip = clip;

            _total = _currentClip.baseClip.releaseLength>0 ? _currentClip.baseClip.releaseLength : _currentClip.baseClip.trueLength;

            if (_currentClip.baseClip.contentID)
            {
                this._mediaId = _currentClip.baseClip.contentID;
            }

            if (_currentClip.chapter.index > 0)
            {
                this._lastKnownPosition = _currentClip.currentMediaTime;

                this.saveCurrentTime();
            }
        }

    }

    private function isLiveStreaming():Boolean
    {
        //if currentclip is null, we return false, but we can possibly still create a bookmark (maybe?)
        return (_currentClip!=null)&&(_currentClip.mediaLength == -1);
    }

    private function onSetRelease(e:PdkEvent):void
    {
        _lastKnownPosition = 0;
        _currentReleaseUrl = null; //not needed now? only during the process of getting the bookmark?
    }

    private function onMediaEnd(e:PdkEvent):void
    {
        _controller.removeEventListener(PdkEvent.OnMediaPlaying, onMediaPlaying);
    }

    private function doResume(releaseUrl:String):void
    {
        //_controller.trace("do resume", "ResumePlaybackPlugIn", Debug.DEBUG);
        _controller.setMetadataUrl(releaseUrl);
    }

    public function errorHandler(error:String):void
    {
        //_controller.trace(error, "com.theplatform.pdk.plugins.ResumePlaybackPlugIn", Debug.ERROR);
        this.doResume(_currentReleaseUrl)
    }

    public function hasBookmarkSuccessHandler(result:Boolean):void
    {
        //_controller.trace("has bookmark?" + result, "ResumePlaybackPlugin", Debug.DEBUG);
        if (result)
        {
            var code:String = "function(){$pdk.bookmarks.getBookmark(\"" + _context + "\", \"" + _token + "\", \"" + _accountId + "\", \"" + URN_PREFIX + _mediaId + "\", " +
                    "{" +
                    "onSuccess: function(result){setTimeout(function(){document.getElementById(\"" + _swfId + "\").getBookmarkSuccessHandler(result);},1); } ," +
                    "onFailure: function(error){setTimeout(function(){document.getElementById(\"" + _swfId + "\").errorHandler(error);},1); } " +
                    "});" +
                    "}";

            // _controller.trace("Executing: "+code, "ResumePlaybackPlugin",Debug.WARN);

            ExternalInterface.call(code);
        }
        else
        {
            doResume(_currentReleaseUrl);
        }
    }

    public function getBookmarkSuccessHandler(result:Object):void
    {
        _controller.trace("get bookmark:" + result, "ResumePlaybackPlugIn", Debug.DEBUG);
        //ExternalInterface weirdness (or service weirdness?) can cause result to be null somehow
        if (result && result.position != 0 && result.position != null)
        {
            _controller.trace("bookmark success: " + result.position, "ResumePlaybackPlugIn", Debug.DEBUG);
            showUIPrompt(result.position as Number);
        }
        else
        {
            this.doResume(_currentReleaseUrl)
        }

    }


    private function restartClicked(e:Event):void
    {

       _controller.hideCard("forms", "tpResumePlaybackCard");

       //this couldn't be streaming, it had a bookmark...so remove
       removeBookmark(_mediaId);

       this.doResume(_currentReleaseUrl);
    }

    private function resumeClicked(e:Event):void
    {
        _controller.hideCard("forms", "tpResumePlaybackCard");

        var cb:Function = function(e:PdkEvent):void
        {

            _controller.removeEventListener(PdkEvent.OnReleaseStart, cb);
            var pl:Playlist = e.data as Playlist;
            pl.markOffset(_desiredPosition * 1000);

            _desiredPosition = 0;

        }

        _controller.addEventListener(PdkEvent.OnReleaseStart, cb);

        this.doResume(_currentReleaseUrl);

    }



    private function showUIPrompt(position:Number):void
    {
        //let's just use external interface?

        _controller.showCard("forms", "tpResumePlaybackCard",CardActions.DISABLE,null,null,{title:_currentTitle});

        this._desiredPosition = position;

		if (_autoResume)
		{
			resumeClicked(null);
		}

    }

    private function removeBookmark(mediaID:String):void
    {
        //_controller.trace("remove bookmark:" + mediaID, "ResumePlaybackPlugIn", Debug.DEBUG);
        var code:String = "function(){$pdk.bookmarks.removeBookmark(\"" + _context + "\", \"" + _token + "\", \"" + _accountId + "\", \"" + URN_PREFIX + mediaID +
                "\", { onSuccess:function(result){setTimeout(function(){tpDebug(\"Bookmark removed sucessfully\");},1)},onFailure:function(errorMsg){setTimeout(function(){tpDebug(\"Bookmark remove unsucessful\");},1);}}" +
                ");}";

//        _controller.trace("Executing: " + code, "ResumePlaybackPlugin", Debug.WARN);

        ExternalInterface.call(code);

    }

    private function saveCurrentTime():void
    {
        if (_mediaIsAutoPlay || !_mediaId || isLiveStreaming() || (_lastKnownPosition / 1000) < _threshold || (_lastKnownPosition / 1000) > (this._total/1000 - _threshold ) )
        {
            return;//ignore, we don't want to save the time
        }

        //should update the last known position...
        //_controller.trace("save current time:" + _lastKnownPosition, "ResumePlaybackPlugIn", Debug.DEBUG);
        var code:String = "function(){$pdk.bookmarks.updateBookmark(\"" + _context + "\", \"" + _token + "\", \"" + _accountId + "\", \"" + URN_PREFIX + _mediaId + "\" ," + Math.ceil(_lastKnownPosition / 1000) + "" +
                ", " + this._total / 1000 +
                ", { onSuccess:function(result){setTimeout(function(){tpDebug(\"Bookmark saved sucessfully\");},1)},onFailure:function(errorMsg){setTimeout(function(){tpDebug(\"Bookmark save unsucessful\");},1);}}" +
                ");}";

//        _controller.trace("Executing: " + code, "ResumePlaybackPlugin", Debug.WARN);

        ExternalInterface.call(code);
    }

    private function checkForBookmark():void
    {
        var code:String = "function(){ $pdk.bookmarks.hasBookmark(\"" + _context + "\", \"" + _token + "\", \"" + _accountId + "\", \"" + URN_PREFIX + _mediaId + "\" ," + _useCache + ", " +
                "{" +
            //TODO: need setTimeout here and on all callbacks
                "onSuccess: function(result){setTimeout(function(){document.getElementById(\"" + _swfId + "\").hasBookmarkSuccessHandler(result);},1);} ," +
                "onFailure: function(error){setTimeout(function(){document.getElementById(\"" + _swfId + "\").bookmarksErrorHandler(error);},1);}" +
                "});" +
                "}";

//        _controller.trace("Executing: "+code, "ResumePlaybackPlugin",Debug.WARN);

        ExternalInterface.call(code);

     //   _wasUserInitiated = false;//set it back to false...
    }

    private function parseMediaID(e:Event):void
    {

        var json:Object = com.serialization.json.JSON.deserialize((e.target as URLLoader).data as String);

        var id:String = json.id as String;

        _mediaId = (id).substr(id.lastIndexOf("/") + 1);

        _currentTitle = json.title;
        //_controller.trace("media id parsed:" + _mediaId + " currentTitle:" + _currentTitle, "ResumePlaybackPlugIn", Debug.DEBUG);
        checkForBookmark();

    }

    private function checkStandbyReleaseUrl():void
    {
        if (_currentReleaseUrl)
        {
            if (_isServiceError)
            {
                doResume(_currentReleaseUrl);
            }
            else
            {
                rewriteMetadataUrl(_currentReleaseUrl, false);//send it back through
            }

        }
    }

    public function rewriteMetadataUrl(url:String, isPreview:Boolean):Boolean
    {
        //_controller.trace("rewrite metadataurl:" + url + " preview?" + isPreview + " serviceError?" + _isServiceError + " _isReady?" + _isReady + " autoPlay?" + _mediaIsAutoPlay, "ResumePlaybackPlugIn", Debug.DEBUG);
        if (isPreview || _isServiceError) return false;

        _firstRelease = false;

        if (_mediaIsAutoPlay)
        {
            return false;
        }
        _currentReleaseUrl = url;

        if (!_isReady)
        {
            return true;//we're just going to wait until we either time out or we error out
        }

        if (url.indexOf("release.theplatform.com")==-1)
        {

            //if it's showing, we hide it
            _controller.hideCard("forms");

            var loader:URLLoader;

            //just get rid of any params
            loader = new URLLoader();

            var errorHandler:Function = function():void
            {
                doResume(_currentReleaseUrl);
            };

            loader.addEventListener(Event.COMPLETE, parseMediaID);
            loader.addEventListener(IOErrorEvent.IO_ERROR, errorHandler);
            loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, errorHandler);
            //_controller.trace("loading preview request", "ResumePlaybackPlugIn", Debug.DEBUG);
            try
            {
                loader.load(new URLRequest(_currentReleaseUrl.split("?")[0] + "?format=preview"));
            }
            catch (e:Error) { doResume(_currentReleaseUrl)}


            return true;
        }
        else
        {
            return false;
        }
    }

    public function getControlIds():Array
    {
        return [_controlId];
    }

    public function getControl(metadata:ItemMetaData):Control
    {
        var c:Control;

        switch (metadata.id)
        {
            // TextArea Controls
            //might need this for the label...
            case "tpResumePlaybackTitle":
                c = new TextControl(metadata.id, metadata, _controller);
                break;
            //Button Controls
            case "tpResumePlaybackRestartButton":
            case "tpResumePlaybackResumeButton":
                c = new ButtonControl(metadata.id, metadata, _controller);
                break;
        }

        return c;
    }


    public function getControlMediator(metadata:ItemMetaData):Mediator
    {
        var m:Mediator;

        switch (metadata.id)
        {
            // buttons
            case "tpResumePlaybackRestartButton":
                //_buttonCreated = true;
                _restartButtonMediator = new ResumePlaybackButtonMediator(metadata.id, _controller, metadata, {label:_restartLabel});
                m = _restartButtonMediator;
                    //we should listen for a click, and call the callback with false when we get it
                _restartButtonMediator.addEventListener("buttonClicked",restartClicked);
                break;
            case "tpResumePlaybackResumeButton":
                _resumeButtonMediator = new ResumePlaybackButtonMediator(metadata.id, _controller, metadata, {label:_resumeLabel});
                m = _resumeButtonMediator;
                    //we should listen for a click, and call the callback with true when we get it
                _resumeButtonMediator.addEventListener("buttonClicked",resumeClicked);
                break;
            case "tpResumePlaybackTitle":
                m = new ResumePlaybackLabelMediator(metadata.id,  _controller, metadata, {});
                _controller.trace("{\"testId\":\"RESUME_PLAYBACK_FORM_DISPLAYED\",\"data\":{\"token\":\"" + _token + "\",\"mediaId\":\"" + _mediaId + "\"}}", "ResumePlaybackPlugIn", Debug.TEST);
                break;
            // card mediator
            case "tpResumePlaybackCard":
                m = new FormCardMediator(metadata.id, _controller, metadata, {});
                break;
        }
        return m;
    }

    public function finalize(componentArea:ComponentArea):void
    {
    }

    public function destroy():void
    {

        //just remove listeners...
        _controller.removeEventListener(PdkEvent.OnReleaseSelected, onReleaseSelected);
        _controller.removeEventListener(PdkEvent.OnMediaPlaying, onMediaPlaying);
        _controller.removeEventListener(PdkEvent.OnMediaStart, onMediaStart);
        _controller.removeEventListener(PdkEvent.OnReleaseEnd, onReleaseEnd);
        _controller.removeEventListener(PdkEvent.OnMediaPause, onMediaPause);
        _controller.removeEventListener(PdkEvent.OnSetRelease, onSetRelease);
        _controller.removeEventListener(PdkEvent.OnSetReleaseUrl, onSetRelease);
        _controller.removeEventListener(PdkEvent.OnMediaEnd, onMediaEnd);


    }
}
}
