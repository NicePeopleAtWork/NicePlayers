/**
 * Created by IntelliJ IDEA.
 * User: daniel.niland
 * Date: 7/25/11
 * Time: 10:13 AM
 * To change this template use File | Settings | File Templates.
 */
package com.theplatform.pdk.plugins
{
import com.theplatform.pdk.controllers.IPlayerController;
import com.theplatform.pdk.data.Clip;
import com.theplatform.pdk.data.CustomData;
import com.theplatform.pdk.data.LoadObject;
import com.theplatform.pdk.data.PlaybackError;
import com.theplatform.pdk.data.Playlist;
import com.theplatform.pdk.events.PdkEvent;
import com.theplatform.pdk.utils.Debug;
import com.theplatform.pdk.utils.PdkStringUtils;

import flash.display.Sprite;
import flash.events.TimerEvent;
import flash.external.ExternalInterface;
import flash.system.Security;
import flash.utils.Timer;
import mx.core.ByteArrayAsset;
import flash.net.SharedObject;

import mx.events.CalendarLayoutChangeEvent;

public class ConcurrencyPlugIn extends Sprite implements IMetadataUrlPlugIn, IDestroyablePlugIn
{
    private var _controller:IPlayerController;
    private var _isReady:Boolean = false;
    private var _isError:Boolean = false;
    private var _lastUnhandledRewriteUrl:String = null;
    private var _finalUrl:String;

    //variables that will be sent down to client
    private var _clientId:String;
    private var _swfId:String;
    private var _jsBridgeContextId:String;

    private var _contextStorage:SharedObject = SharedObject.getLocal("com.theplatform.pdk.plugins.ConcurrencyPlugIn");

    private var _priority:Number = 0;

    private var _scriptPath:String = "/js/libs/concurrency/platformConcurrency.js";
    
    private const ERROR_MESSAGE:String = "Error: Stream concurrency limit reached.";

    [Bindable]
    [Embed(source="ConcurrencyPlugInJSBridge.js", mimeType="application/octet-stream")]
    private var concurrencyPlugInJSBridge:Class;


    public function ConcurrencyPlugIn()
    {
        Security.allowDomain("*");

    }

    public function initialize(lo:LoadObject):void
    {
        _controller = lo.controller as IPlayerController;
        _clientId = _controller.id;// + "_" + Math.floor(Math.random() * 1000).toString();

        _priority = lo.priority;

        if (PdkStringUtils.isExternalInterfaceAvailable())//if the externalInterface isn't available nothing here will work
        {
            _swfId = ExternalInterface.objectID;

            var jsBridgeBA:ByteArrayAsset = ByteArrayAsset(new concurrencyPlugInJSBridge());
            var jsBridge:String = jsBridgeBA.readUTFBytes(jsBridgeBA.length);
            _jsBridgeContextId = ExternalInterface.call(jsBridge, _swfId);

            ExternalInterface.addCallback("concurrencyServiceReady", this.serviceReadyCallBack);
            ExternalInterface.addCallback("updateCB", this.updateLockCallback);
            ExternalInterface.addCallback("unlockCB", this.unlockCallback);
            ExternalInterface.addCallback("persistencePut", this.persistencePut);
            ExternalInterface.addCallback("persistenceGet", this.persistenceGet);
            ExternalInterface.addCallback("___setMetadataUrl", this.___setMetadataUrl);

            ExternalInterface.call("window." + _jsBridgeContextId + ".loadService", "concurrencyServiceReady", 1500, "persistencePut", "persistenceGet");

            _controller.registerMetadataUrlPlugIn(this, _priority);
        }
        else
        {
            _controller.trace("ExternalInterface is not available: Concurrency cannot communicate with service", "ConcurrencyPlugin", Debug.ERROR);
        }
    }

    public function serviceReadyCallBack(status:Object):void
    {

	if(status.success)
	{
		_controller.trace("$pdk.platformConcurrency is now ready", "ConcurrencyPlugin", Debug.INFO);

		_isReady = true;

		_controller.addEventListener(PdkEvent.OnReleaseStart, handleReleaseStart);
		_controller.addEventListener(PdkEvent.OnReleaseEnd, handleReleaseEnd);
		_controller.addEventListener(PdkEvent.OnMediaEnd, handleMediaEnd);
		_controller.addEventListener(PdkEvent.OnMediaError, handleMediaError);

		if (_lastUnhandledRewriteUrl)
		{
		    doUrlRewrite(_lastUnhandledRewriteUrl);
		    _lastUnhandledRewriteUrl= null;
		}
	}
	else
	{
		_controller.trace("$pdk.platformConcurrency failed to load", "ConcurrencyPlugin", Debug.WARN);

		_isError = true;

		//we can now go ahead and rewrite the url, as the same as it was to begin with
		if (!_isReady && _lastUnhandledRewriteUrl)
		{
		    _controller.setMetadataUrl(_lastUnhandledRewriteUrl);
		    _lastUnhandledRewriteUrl= null;
		}
	}
    }

    public function persistencePut(name:String, value:String):void
    {
	this._contextStorage.data[name] = value;
    }

    public function persistenceGet(name:String):String
    {
	return this._contextStorage.data[name];
    }

    public function rewriteMetadataUrl(url:String, isPreview:Boolean):Boolean
    {
        if(isPreview || _isError)
        {
            return false;

        }

        if (_isReady)
        {
            doUrlRewrite(url);
        }
        else
        {
           _lastUnhandledRewriteUrl = url;
        }

        return true;
    }

    private function doUrlRewrite(url:String):void
    {
        //always add clientId to selector hit
        if (url.indexOf("?") > 0)
        {
            url += "&";
        }
        else
        {
            url += "?";
        }
        _finalUrl = url + "clientId=" + _clientId;
        ExternalInterface.call("window." + _jsBridgeContextId + ".unlockLast", "___setMetadataUrl");
    }

    public function ___setMetadataUrl(value:Object):void
    {
        _controller.trace("concurrency service setting final url: " + _finalUrl, "ConcurrencyPlugIn", Debug.INFO);
        _controller.setMetadataUrl(_finalUrl);
    }

    private function handleReleaseStart(e:PdkEvent):void
    {
        var playlist:Playlist = e.data as Playlist;
        if (playlist && playlist.customData)
        {
            var lockInterval:String = playlist.customData.getValue("updateLockInterval");
            if (lockInterval)//don't even bother if it isn't there
            {
                var cd:CustomData = playlist.customData;

		var concurrencyPlugInLockContext:ConcurrencyPlugInLockContext = new ConcurrencyPlugInLockContext();
                concurrencyPlugInLockContext.lockId = cd.getValue("lockId");
                concurrencyPlugInLockContext.lockSequenceToken = cd.getValue("lockSequenceToken");
                concurrencyPlugInLockContext.lock = cd.getValue("lock");
                concurrencyPlugInLockContext.concurrencyServiceUrl = cd.getValue("concurrencyServiceUrl");
                concurrencyPlugInLockContext.clientId = _clientId;

                _controller.trace("concurrency service starting interval:" + lockInterval + " lockId:" + concurrencyPlugInLockContext.lockId + " concurrencyServiceUrl:" + concurrencyPlugInLockContext.concurrencyServiceUrl, "ConcurrencyPlugIn", Debug.INFO);
                startHeartbeat(int(lockInterval) * 1000, concurrencyPlugInLockContext);
            }
            else
            {
                _controller.trace("playlist doesn't contain updateLockInterval customData, can't start concurrency heartbeat", "ConcurrencyPlugIn", Debug.INFO);
            }
        }
        else
        {
            _controller.trace("playlist contains no customData, can't start concurrency heartbeat", "ConcurrencyPlugIn", Debug.INFO);
        }

    }

    private function startHeartbeat(heartbeatFrequency:int, concurrencyPlugInLockContext:ConcurrencyPlugInLockContext):void
    {
        ExternalInterface.call("window." + _jsBridgeContextId + ".startHeartbeat", heartbeatFrequency, "updateCB");
	callUpdate(concurrencyPlugInLockContext);
    }

    private function endHeartbeat():void
    {
        ExternalInterface.call("window." + _jsBridgeContextId + ".stopHeartbeat");
        _controller.trace("unlocking concurrency lockId", "ConcurrencyPlugIn", Debug.INFO);
        ExternalInterface.call("window." + _jsBridgeContextId + ".unlockLast", "unlockCB");
    }

    private function cancelMedia(msg:String):void
    {
        ExternalInterface.call("window." + _jsBridgeContextId + ".stopHeartbeat");
        _controller.trace(msg, "ConcurrencyPlugIn", Debug.ERROR);
        var pbe:PlaybackError = new PlaybackError(msg, "ConcurrencyPlugIn", "concurrencyFailed", null, true);
        pbe.friendlyMessage = ERROR_MESSAGE;
        _controller.cancelMedia(pbe);
    }

    private function handleMediaEnd(e:PdkEvent):void
    {
	/*
	 * Probably unreliable. For now, we're only going to unlock at OnReleaseEnd
	 */
        /*if (ExternalInterface.call("window." + _jsBridgeContextId + ".isBeating"))
        {
            var clip:Clip = e.data as Clip;
            var playlist:Playlist = clip.baseClip.playlistRef;
            var moreContent:Boolean = false;
            var curIndex:int = clip.clipIndex;
            while (true)
            {
                var c:Clip = playlist.getClip(++curIndex, false);//get the clips without setting the index
                if (!c) break;//we're at the end
                if (!c.isAd)
                {
                    moreContent = true;
                }
                break;
            }
            if (!moreContent)
            {
                endHeartbeat();
            }
        }*/
    }

    private function handleMediaError(e:PdkEvent):void
    {
        var clip:Clip = (e.data as Clip)
        if (!clip || clip.isAd) return;//ignore
        if (ExternalInterface.call("window." + _jsBridgeContextId + ".isBeating"))
	    {
            endHeartbeat();
        }
    }

    private function handleReleaseEnd(e:PdkEvent):void
    {
        if (ExternalInterface.call("window." + _jsBridgeContextId + ".isBeating"))
        {
            endHeartbeat();
        }
    }

    private function heartbeatTick(e:TimerEvent):void
    {
        callUpdate(null);
    }

    private function callUpdate(concurrencyPlugInLockContext:ConcurrencyPlugInLockContext):void
    {
	if(concurrencyPlugInLockContext === null)
	{
		ExternalInterface.call("window." + _jsBridgeContextId + ".updateLockLast", "updateCB");
	}
	else
	{
        	_controller.trace("calling updateLock lockId:" + concurrencyPlugInLockContext.lockId + " sequenceToken:" + concurrencyPlugInLockContext.lockSequenceToken,  "ConcurrencyPlugIn", Debug.INFO);
		ExternalInterface.call(
			"window." + _jsBridgeContextId + ".updateLock",
			concurrencyPlugInLockContext.concurrencyServiceUrl,
			concurrencyPlugInLockContext.clientId,
			concurrencyPlugInLockContext.lockId,
			concurrencyPlugInLockContext.lockSequenceToken,
			concurrencyPlugInLockContext.lock,
			"updateCB"
		);
	}
    }

    public function updateLockCallback(value:Object):void
    {
        if (value.isException)
        {
            _controller.trace("updateLock exception thrown:" + value.exception + " title:" + value.title + " description:" + value.description + " responseCode:" + value.responseCode,  "ConcurrencyPlugIn", Debug.ERROR);
            cancelMedia("Concurrency call did not succeed")
        }
        else
        {
            _controller.trace("updateLock success id: " + value.id + ", sequenceToken: " + value.sequenceToken + ", encryptedLock: " + value.encryptedLock,  "ConcurrencyPlugIn", Debug.INFO);
        }
    }

    public function unlockCallback(value:Object):void
    {
        if (value.isException)
        {
            _controller.trace("unlock exception thrown: " + value.exception + ", title:" + value.title + ", description:" + value.description + ", responseCode:" + value.responseCode,  "ConcurrencyPlugIn", Debug.ERROR);
        }
        else
        {
		_controller.trace("unlock success: " + value.success, "ConcurrencyPlugIn", Debug.INFO);
        }

    }

    public function destroy():void
    {
        ExternalInterface.call("window." + _jsBridgeContextId + ".stopHeartbeat");
        _controller.removeEventListener(PdkEvent.OnReleaseStart, handleReleaseStart);
        _controller.removeEventListener(PdkEvent.OnReleaseEnd, handleReleaseEnd);
        _controller.removeEventListener(PdkEvent.OnMediaEnd, handleMediaEnd);
        _controller.removeEventListener(PdkEvent.OnMediaError, handleMediaError);
    }
}
}
