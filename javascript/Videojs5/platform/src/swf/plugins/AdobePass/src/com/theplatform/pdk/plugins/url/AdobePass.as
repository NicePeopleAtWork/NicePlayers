package com.theplatform.pdk.plugins.url
{
import com.theplatform.pdk.controllers.IPlayerController;
import com.theplatform.pdk.data.LoadObject;
import com.theplatform.pdk.data.Rating;
import com.theplatform.pdk.data.Release;
import com.theplatform.pdk.events.PdkEvent;
import com.theplatform.pdk.events.PlayerEvent;
import com.theplatform.pdk.plugins.IMetadataUrlPlugIn;
import com.theplatform.pdk.utils.Debug;
import com.theplatform.pdk.utils.PdkStringUtils;

import flash.display.Loader;
import flash.display.Sprite;
import flash.events.*;
import flash.external.ExternalInterface;
import flash.net.LocalConnection;
import flash.net.URLLoader;
import flash.net.URLRequest;
import flash.system.Security;
import flash.utils.Timer;


public class AdobePass extends Sprite implements IMetadataUrlPlugIn
{
    private var _controller:IPlayerController;
    private var _priority:Number;
    private var accessEnablerUrl:String = "http://entitlement.auth-staging.adobe.com/entitlement/AccessEnabler.swf";
    private var _promptImmediately:Boolean = false;
    private var requestorId:String;
    private var useSampleMvpdPicker:Boolean = false;
    private var accessSwfLoader:Loader;
    private var currentTime:Number = new Date().time;
    private var uniqueName:String = currentTime.toString();
    private var callbackID:String = "_accessEnablerClient";
    private var listenerID:String = "_accessEnabler";
    private var shortTokenName:String = "auth";
    private var conn:LocalConnection;

    private var _perMedia:Boolean = false;
	private var _rating:String;
    private var _defaultRatingScheme:String;
    private var _releaseJSONLoader:URLLoader;

    //callbacks
    private var swfLoadedCallback:String;
    private var setTokenCallback:String;
    private var displayProviderDialogCallback:String;
    private var createIFrameCallback:String;
    private var tokenRequestFailedCallback:String;
    private var setAuthenticationStatusCallback:String;
    private var setMetadataStatusCallback:String;
    private var selectedProviderCallback:String;
    private var setMovieDimensionsCallback:String;
    private var sendTrackingDataCallback:String;

    private var _mvpdPickerLoaded:Boolean = false;
    private var _waitAuthStatusMessage:Object;
    private var _waitSendTrackingData:Array;
    private var _waitRewriteForResourceId:Boolean = false;
    private var _isAuthenticated:int = 0;
    private var _resourceId:String;
    private var _providerId:String = "";
    private var releaseURL:String;
    private var aeLoaded:Boolean = false;
    private var tokenReceived:Boolean = false;
    private var startAuthorizationProcess:Boolean = false;
    private var startAuthenticationProcess:Boolean = false;
	private var playerUrl:String;

    private var _firstAuthFailure:Boolean = true;
    private var _errorTimer:Timer;

    private const ERROR_INTERVAL:int = 90000;//set a timeout for how long the player will wait for a return call from getAuthentication, etc.

    public function AdobePass()
    {

    }

    public function initialize(lo:LoadObject):void
    {

        // get the controller
        _controller = lo.controller as IPlayerController;

        _controller.trace("Initializing AdobePass", "AdobePass", Debug.INFO);

        if (lo.vars["accessEnablerURL"])
        {
            accessEnablerUrl = lo.vars["accessEnablerURL"];
        }
        _promptImmediately = lo.vars["promptImmediately"] == "true" ? true : false;

        requestorId = lo.vars["requestorId"];
        _priority = lo.vars["priority"];

        _perMedia = lo.vars["perMedia"] == "true" ? true : false;
		_rating = lo.vars["defaultRating"];
        _defaultRatingScheme = lo.vars["defaultRatingScheme"];

        _controller.registerMetadataUrlPlugIn(this, _priority);
        _controller.addEventListener("mvpdPickerLoaded", pickerComplete);

        swfLoadedCallback = lo.vars["swfLoadedCallback"];
        setTokenCallback = lo.vars["setTokenCallback"];
        createIFrameCallback = lo.vars["createIFrameCallback"];
        displayProviderDialogCallback = lo.vars["displayProviderDialogCallback"];
        tokenRequestFailedCallback = lo.vars["tokenRequestFailedCallback"];
        setAuthenticationStatusCallback = lo.vars["setAuthenticationStatusCallback"];
        setMetadataStatusCallback = lo.vars["setMetadataStatusCallback"];
        selectedProviderCallback = lo.vars["selectedProviderCallback"];
        setMovieDimensionsCallback = lo.vars["setMovieDimensionsCallback"];
        sendTrackingDataCallback = lo.vars["sendTrackingDataCallback"];

        Security.allowDomain(accessEnablerUrl, "player.theplatform.com");
        Security.allowInsecureDomain(accessEnablerUrl, "player.theplatform.com");

        loadAccessEnabler();
        exposeAPIs();

        ExternalInterface.call("eval", "tpLogLevel='debug'");
    }

    private function loadAccessEnabler():void
    {
        var host:String = accessEnablerUrl.substring()

        callbackID += uniqueName;
        listenerID += uniqueName;

        try
        {
            conn = new LocalConnection();
            conn.addEventListener(StatusEvent.STATUS, onConnStatus);
            conn.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onReceivedError);
            conn.client = this;
            conn.allowDomain("*");
            conn.connect(callbackID);

            _controller.trace("Creating connection - listening on " + callbackID + "(*)", "AdobePass", Debug.INFO);
        }
        catch (er:Error)
        {
            _controller.trace("ERROR: " + "createConnection - error opening localconnection: " + er.getStackTrace(), "AdobePass", Debug.ERROR);
        }

        /* Load the AccessEnabler SWF */
        if (conn)
        {
            _controller.trace("Connection exists - loading AccessEnabler...", "AdobePass", Debug.INFO);

            accessSwfLoader = new Loader();
            accessSwfLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, onLoadComplete);
            accessSwfLoader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, onReceivedError);
            accessSwfLoader.load(new URLRequest(accessEnablerUrl + "?uniquename=" + uniqueName));
        }

    }
    private function pickerComplete(e:PlayerEvent):void
    {
        _mvpdPickerLoaded = true;
        _controller.trace("picker complete", "AdobePass", Debug.DEBUG);

        if (_waitSendTrackingData)
        {
            _controller.trace("calling tracking Status delayed, mvpd picker plugin was slow", "AdobePass", Debug.DEBUG);
            for (var i:int = 0; i < _waitSendTrackingData.length; i++)
            {
                var td:Object = _waitSendTrackingData[i];
                doSendTrackingData(td.trackingEventType, td.trackingData);
            }
        }

        if (_waitAuthStatusMessage)
        {
            callAuthenticationStatusCallback(_waitAuthStatusMessage.isAuthenticated, _waitAuthStatusMessage.errorCode);
        }
    }

    private function onLoadComplete(evt:Event):void
    {
        try
        {
            _controller.trace("AccessEnabler Loaded!", "AdobePass", Debug.INFO);
            addChild(accessSwfLoader);
        }
        catch (er:Error)
        {
            _controller.trace("ERROR: " + "INVALID PARENT! Access Enabler would not be able to display its GUI" + er.getStackTrace(), "AdobePass", Debug.ERROR);
        }

    }

    private function exposeAPIs():void
    {
        ExternalInterface.addCallback("ap_setRequestor", setRequestor);
        ExternalInterface.addCallback("ap_getAuthorization", getAuthorization);
        ExternalInterface.addCallback("ap_checkAuthorization", checkAuthorization);
        ExternalInterface.addCallback("ap_checkAuthentication", checkAuthentication);
        ExternalInterface.addCallback("ap_logout", logout);
        ExternalInterface.addCallback("ap_setProviderDialogURL", setProviderDialogURL);
        ExternalInterface.addCallback("ap_getAuthentication", getAuthentication);
        ExternalInterface.addCallback("ap_setSelectedProvider", setSelectedProvider);
        ExternalInterface.addCallback("ap_getSelectedProvider", getSelectedProvider);
        ExternalInterface.addCallback("ap_getMetadata", getMetaData);
        ExternalInterface.addCallback("ap_setResourceId", setResourceId);
        ExternalInterface.addCallback("ap_setMetadataStatus", setMetadataStatus);
        ExternalInterface.addCallback("ap_selectedProvider", selectedProvider);
    }

    public function swfLoaded():void
    {
        _controller.trace("Inside SWF Loaded!", "AdobePass", Debug.INFO);

        aeLoaded = true;

        registerToShim();
        setRequestor();

        if (swfLoadedCallback != null)
        {
            ExternalInterface.call(swfLoadedCallback);
        }

        if (_promptImmediately || releaseURL)
        {
            checkAuthentication();
        }
    }

    private function registerToShim():void
    {
        var id:String = ExternalInterface.objectID;
        ExternalInterface.call("adobePassShim.setSwfAP", id);
    }

    private function setRequestor():void
    {
        conn.send(listenerID, "setRequestor", requestorId);

        if (!useSampleMvpdPicker)
        {
            setProviderDialogURL("none");
        }
    }

    private function setProviderDialogURL(url:String):void
    {
        conn.send(listenerID, "setProviderDialogURL", url);
    }

    private function checkAuthentication():void
    {
        startErrorTimer();
        startAuthenticationProcess = true;
        conn.send(listenerID, "checkAuthentication");
    }

    public function setAuthenticationStatus(isAuthenticated:int, errorCode:String):void
    {
        _isAuthenticated = isAuthenticated;
        if (_isAuthenticated == 1)
        {
            startAuthenticationProcess = false;
            //logged in
            _controller.trace("Authentication succeeded, wait for AccessEnabler to come back with a resourceID", "AdobePass", Debug.INFO);
			// If we haven't already started this process, and we don't need to wait for Media specific data...
            /*if (!startAuthorizationProcess)
            {
				if (!_perMedia || (_perMedia && releaseURL))
				{
	                checkAuthorization();
	                startAuthorizationProcess = true;
				}
            }*/
        }
        else
        {
            _controller.trace("Authentication failed:" + errorCode + " code:" + _isAuthenticated, "AdobePass", Debug.WARN);

            if (errorCode.toLowerCase().indexOf("user not authenticated") >= 0)
            {
                endErrorTimer();
                //not logged in, start authentication process
                getAuthentication();
            }
            else
            {
                startAuthenticationProcess = false;
                //else we're not interested in it. If we authenticate any other type of error, we'll get an infinite loop
                //at least that's what happened in "generic authentication error"
                completeProcess();
            }

        }

        if (_mvpdPickerLoaded)
        {
            callAuthenticationStatusCallback(_isAuthenticated, errorCode);
        }
        else
        {
            _waitAuthStatusMessage = {isAuthenticated:_isAuthenticated, errorCode:errorCode};
        }
    }

    private function callAuthenticationStatusCallback(isAuthenticated:int, errorCode:String):void
    {
        if (setAuthenticationStatusCallback != null)
        {
            ExternalInterface.call(setAuthenticationStatusCallback, isAuthenticated, errorCode);
        }
    }

    private function getAuthentication():void
    {
		if (!playerUrl && ExternalInterface.available)
		{
			playerUrl = ExternalInterface.call("eval", "$pdk.parentUrl");
			if (playerUrl == "null" || playerUrl == "undefined") playerUrl = null;
		}

		if (playerUrl)
		{
	        conn.send(listenerID, "getAuthentication", playerUrl);
		}
		else
		{
	        conn.send(listenerID, "getAuthentication");
		}
    }

    public function displayProviderDialog(providers:Array):void
    {
        if (displayProviderDialogCallback != null)
        {
            ExternalInterface.call(displayProviderDialogCallback, providers);
        }
        else
        {
            _controller.trace("Can not create MVPD picker, displayProviderDialogCallback was not defined.", "AdobePass", Debug.INFO);
        }
    }

    public function createIFrame(w:uint, h:uint):void
    {
        if (createIFrameCallback != null)
        {
            ExternalInterface.call(createIFrameCallback, w, h);
        }
        else
        {
            _controller.trace("Can not create Iframe, createIFrameCallback was not defined.", "AdobePass", Debug.INFO);
        }
    }

    private function setSelectedProvider(id:String):void
    {
        _controller.trace("***inside setSelectedProvider", "AdobePass", Debug.INFO);
        if (!id)
        {
            _providerId = null;
        }
        conn.send(listenerID, "setSelectedProvider", id);
    }

    private function checkAuthorization():void
    {
        startErrorTimer();
        conn.send(listenerID, "checkAuthorization", _resourceId);
    }

    private function getAuthorization():void
    {
        if (!_perMedia)
        {
            _controller.trace("perMedia is false, getting default mrss", "AdobePass", Debug.INFO);
            doGetAuthorization(getDefaultMRSS(_resourceId));
        }
        else
        {
            _controller.trace("perMedia is true, searching for values", "AdobePass", Debug.INFO)
            var curRelease:Release = _controller.getCurrentRelease();
			var rating:Rating = (curRelease && curRelease.ratings && curRelease.ratings.length) ? curRelease.ratings[0] : null;
    		
            if (curRelease && (curRelease.title || curRelease.guid || (rating && rating.scheme && rating.rating)))
            {
                _controller.trace("at least one value was found in current release", "AdobePass", Debug.INFO)
                //any one of these values will be good enough to set the value
                doGetAuthorization(createAuthMRSS(_resourceId, rating, curRelease.title, curRelease.guid));
            }
            else if (releaseURL)
            {
                _controller.trace("values aren't on the currentRelease, loading from feeds", "AdobePass", Debug.INFO)
                //load in the releaseUrl with ?format=script
                loadReleaseJSON(releaseURL);
            }
            else
            {
                _controller.trace("no release accessible in getAuthorization, using default values", "AdobePass", Debug.WARN);
                doGetAuthorization(getDefaultMRSS(_resourceId));
            }
        }

    }

    private function doGetAuthorization(mrss:String):void
    {
        startErrorTimer();
        _controller.trace("Inside getAuthorization mrss:" + mrss, "AdobePass", Debug.INFO);
        conn.send(listenerID, "getAuthorization", mrss);
    }

    private function createAuthMRSS(resourceId:String, rating:Rating, title:String = null, guid:String = null):String
    {
        if (title.indexOf("&amp;") < 0)//only if there is not already an &amp;
        {
            //& in the title was breaking the code
            title = title.replace(/&/g, "&amp;");
        }


        var mrss:String =
                '<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">' +
                    '<channel>' +
                        '<title>' + resourceId + '</title>' +
                        '<item>';
        if (title)
        {
            mrss +=         '<title>' + title + '</title>';
        }
        if (guid)
        {
            mrss +=         '<guid>' + guid + '</guid>';
        }
        if (rating && rating.scheme && rating.rating)
        {
            mrss +=         '<media:rating scheme="' + rating.scheme +'">' + rating.rating + '</media:rating>';
        }
		else if (_rating && _defaultRatingScheme)
        {
            mrss +=     	'<media:rating scheme="' + _defaultRatingScheme + '">' + _rating + '</media:rating>';
        }

        mrss +=         '</item>'+
                    '</channel>'+
                '</rss>';


        return mrss;
    }



    private function getDefaultMRSS(resourceId:String):String
    {
        var mrss:String =
                '<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">' +
                    '<channel>' +
                        '<title>' + resourceId + '</title>';

        if (_rating && _defaultRatingScheme)
        {
            mrss +=     '<media:rating scheme="' + _defaultRatingScheme + '">' + _rating + '</media:rating>';
        }

            mrss +='</channel>' +
                '</rss>';

        return mrss;
    }

    private function loadReleaseJSON(releaseUrl:String):void
    {
        if (releaseUrl.match(/format=[^\&\=\?]+/i))
        {
            releaseUrl = releaseUrl.replace(/format=[^\&\=\?]+/i, "format=Script");
        }
        else
        {
            releaseUrl += ((releaseUrl.indexOf("?") < 0) ? "?" : "&") + "format=Script";
        }
        releaseUrl = PdkStringUtils.replaceStr(releaseUrl, "&amp;", "&");


        try
        {
            _releaseJSONLoader = new URLLoader();
            _releaseJSONLoader.addEventListener(Event.COMPLETE, onReleaseJSONComplete, false, 0, true);
            _releaseJSONLoader.addEventListener(IOErrorEvent.IO_ERROR, onReleaseJSONError, false, 0, true);
            _releaseJSONLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onReleaseJSONError, false, 0, true);
            _releaseJSONLoader.load(new URLRequest(releaseUrl));
            //_controller.trace("warming release: " + selectorRelease, "ReleaseSelectorProcess", Debug.DEBUG);
        }
        catch (error:Error)
        {
            onReleaseJSONError(new ErrorEvent(error.name + ": " + error.errorID, false, false, error.message));
        }
    }

    private function onReleaseJSONError(e:ErrorEvent):void
    {
        _controller.trace("error loading release JSON, using default values", "AdobePass", Debug.WARN);
        doGetAuthorization(getDefaultMRSS(_resourceId));
    }

    private function onReleaseJSONComplete(e:Event):void
    {
        // parse JSON and call warming function
        var jsonRelease:Object = null;
        var data:String = (e.target as URLLoader).data as String;
        //_controller.trace("parsing release json: " + data, "ReleaseSelectorProcess", Debug.DEBUG);
        try
        {
            jsonRelease = JSON.parse(data);
        }
        catch (e:Error)
        {
            onReleaseJSONError(new ErrorEvent(e.name + ": " + e.errorID, false, false, e.message));
            return;
        }
        var release:Release = Release.createReleaseFromJSON(jsonRelease);

        var rating:Rating = release.ratings ? release.ratings[0] : null;
        if (release && (release.title || release.guid || (rating && rating.scheme && rating.rating)))
        {
            //any one of these values will be good enough to set the value
            doGetAuthorization(createAuthMRSS(_resourceId, rating, release.title, release.guid));
        }
        else
        {
            _controller.trace("json release doesn't have enough info, using default values", "AdobePass", Debug.WARN);
            doGetAuthorization(getDefaultMRSS(_resourceId));
        }
    }


    public function sendTrackingData(trackingEventType:String, trackingData:Array):void
    {
        _controller.trace("tracking data received", "AdobePass", Debug.INFO);
        if (_mvpdPickerLoaded)
        {
            doSendTrackingData(trackingEventType, trackingData);
        }
        else
        {
            if (!_waitSendTrackingData)
            {
                _waitSendTrackingData = [];
            }
            _waitSendTrackingData.push({trackingEventType:trackingEventType, trackingData:trackingData});
        }
    }

    private function doSendTrackingData(trackingEventType:String, trackingData:Array):void
    {
        _controller.trace("sending tracking data to: " + sendTrackingDataCallback + " eventType:" + trackingEventType + " data:" + (trackingData ? trackingData.toString() : "none"), "AdobePass", Debug.DEBUG);
        if (sendTrackingDataCallback != null)
        {
            ExternalInterface.call(sendTrackingDataCallback, trackingEventType, trackingData);
        }
    }

    private function setResourceId(id:String):void
    {
        _controller.trace("***Setting resource id, id is " + id, "AdobePass", Debug.INFO);

        _resourceId = id;
        if (!_resourceId)
        {
            _resourceId = "";
            if (_waitRewriteForResourceId)
            {
                //we were waiting for the resourceId to be set and now we know it's invalid
                completeProcess();
            }
            return;
        }
        if (!_perMedia || (_perMedia && releaseURL))
        {
            //start authorisation process
            startAuthorizationProcess = true;
            getAuthorization();
        }
        else
        {
            completeProcess();
        }
    }

    public function setToken(resourceId:String, token:String):void
    {
        _controller.setToken(token, "urn:theplatform:auth:adobe");
        tokenReceived = true;
        _controller.trace("Inside setToken, resourceId is " + resourceId + " and token is " + token, "AdobePass", Debug.INFO);
        //getMetaData("TTL_AUTHZ", __resourceId);

        completeProcess(token);

        if (setTokenCallback != null)
        {
            ExternalInterface.call(setTokenCallback, resourceId, token);
        }
    }

    public function tokenRequestFailed(inRequestedResourceID:String, inRequestErrorCode:String, inRequestDetails:String):void
    {
        if (!_firstAuthFailure)
        {
            _controller.trace("Token Request Failed! ResourceID: " + inRequestedResourceID + ", ErrorCode: " + inRequestErrorCode + ", inRequestDetails: " + inRequestDetails, "AdobePass", Debug.ERROR);
            completeProcess();

            if (tokenRequestFailedCallback != null)
            {
                ExternalInterface.call(tokenRequestFailedCallback, inRequestedResourceID, inRequestErrorCode, inRequestDetails);
            }
        }
        else
        {
            _controller.trace("First authorization failed, trying again: error code:" + inRequestErrorCode, "AdobePass", Debug.INFO)
            _firstAuthFailure = false;
            getAuthorization();
        }

    }

    private function completeProcess(token:String = null):void
    {
        endErrorTimer();
        if (!releaseURL) return;//just ignore, we must have already completed

        if (token)//if no token is included, then we'll just send back the url without it
        {
            var escapedToken:String = encodeURIComponent(token);

            if (releaseURL.indexOf("?") >= 0)
            {
                releaseURL += "&" + shortTokenName + "=" + escapedToken;
            }
            else
            {
                releaseURL += "?" + shortTokenName + "=" + escapedToken;
            }
            _controller.trace("Setting releaseURL: " + releaseURL, "AdobePass", Debug.INFO);
        }
        _controller.setMetadataUrl(releaseURL);
        releaseURL = null;
    }

    private function getMetaData(key:String, id:String):void
    {
        _controller.trace("getting metadata for Authz token", "AdobePass", Debug.INFO);
        conn.send(listenerID, "getMetadata", key, [id]);
    }


    public function setMetadataStatus(key:String, argument:Array, value:Object):void
    {
        _controller.trace("Inside sideMetadataStatus, value is " + value, "AdobePass", Debug.INFO);

        if (setMetadataStatusCallback != null)
        {
            ExternalInterface.call(setMetadataStatusCallback, key, argument, value);
        }
    }

    private function getSelectedProvider():void
    {
        conn.send(listenerID, "getSelectedProvider");
    }

    public function selectedProvider(result:Object):void
    {
        if (selectedProviderCallback != null)
        {
            ExternalInterface.call(selectedProviderCallback, result);
        }
    }

    public function setMovieDimensions(w:int, h:int):void
    {
        if (setMovieDimensionsCallback != null)
        {
            ExternalInterface.call(setMovieDimensionsCallback, w, h);
        }
    }

    private function logout():void
    {
        conn.send(listenerID, "logout");
    }

    public function rewriteMetadataUrl(url:String, isPreview:Boolean):Boolean
    {
        if (!isPreview && _resourceId != "")//_resourceId was explicitly set to empty, we don't even bother now
        {
            _controller.trace("Received rewriteMetadataUrl call isAuthenticated?" + _isAuthenticated + " startAuth?" + startAuthenticationProcess, "AdobePass", Debug.INFO);
            tokenReceived = false;
            startAuthorizationProcess = false;
            //set release url
            releaseURL = url;
            if (aeLoaded)
            {
                if (_isAuthenticated == 1 && _resourceId != null)
                {
                    startAuthorizationProcess = true;
                    getAuthorization();
                }
                else if (!startAuthenticationProcess)
                {
                    checkAuthentication();
                }
                else
                {
                    _waitRewriteForResourceId = true;
                }
            }
            return true;
        }
        return false;
    }


    private function onConnStatus(evt:StatusEvent):void
    {
        if (evt.level == "error")//LocalConnection will be unhappy if we don't do something here
        {
            _controller.trace("LocalConnection error with AccessEnabler: " + evt.toString(), "AdobePass", Debug.WARN);
            startAuthenticationProcess = false;
            completeProcess(null);
        }
    }

    private function onReceivedError(evt:ErrorEvent):void
    {
        _controller.trace("Connection ERROR: " + evt.toString(), "AdobePass", Debug.ERROR);
        startAuthenticationProcess = false;
        completeProcess(null);
    }

    private function startErrorTimer():void
    {
        _controller.trace("start error timer", "AdobePass", Debug.INFO)
        if (!_errorTimer)
        {
            _errorTimer = new Timer(ERROR_INTERVAL);
            _errorTimer.addEventListener(TimerEvent.TIMER, errorTick, false, 0, true);
        }
        _errorTimer.reset();
        _errorTimer.start();
    }

    private function endErrorTimer():void
    {
        _controller.trace("end error timer", "AdobePass", Debug.INFO)
        if (_errorTimer)
        {
            _errorTimer.reset();
        }
    }

    private function errorTick(e:TimerEvent):void
    {
        _controller.trace("The AccessEnabler swf never sent back a reply", "AdobePass", Debug.ERROR);
        startAuthenticationProcess = false;
        completeProcess(null);
    }
}
}
