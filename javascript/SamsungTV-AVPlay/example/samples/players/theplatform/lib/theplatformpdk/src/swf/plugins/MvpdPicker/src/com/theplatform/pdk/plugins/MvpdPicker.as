package com.theplatform.pdk.plugins
{
import com.theplatform.pdk.controllers.GlobalController;
import com.theplatform.pdk.data.LoadObject;
import com.theplatform.pdk.events.PdkEvent;
import com.theplatform.pdk.events.PlayerEvent;
import com.theplatform.pdk.utils.Debug;

import flash.display.Sprite;
import flash.events.TimerEvent;
import flash.external.ExternalInterface;
import flash.system.Security;
import flash.utils.Timer;

public class MvpdPicker extends Sprite implements IPlugIn
{
    private var _controller:GlobalController;
	private var _scriptPath:String;
	private var _resourceIdMap:String;
    private var _pickerReady:Boolean = false;
    private var _pluginsLoaded:Boolean = false;
    private var _pickerReadyTimer:Timer;

    public function MvpdPicker()
    {
    }

    public function initialize(lo:LoadObject):void
    {

        // get the controller
        _controller = lo.controller as GlobalController;

        _controller.trace("Initializing MvpdPicker - 1", "MvpdPicker", Debug.INFO);

        _controller.addEventListener(PdkEvent.OnPlugInsComplete, pluginsComplete);

		Security.allowDomain("*");

		if (ExternalInterface.available)
		{
            if (lo.vars["jsUrl"]) _scriptPath = lo.vars["jsUrl"];

            var _swfId:String = ExternalInterface.objectID;
            ExternalInterface.marshallExceptions = false;
            ExternalInterface.addCallback("mvpdPickerReady", this.pickerReadyCallback);
			ExternalInterface.call("eval", "window.tpUseCustomMVPDPicker = " + (lo.vars["useCustomMVPDPicker"] ? lo.vars["useCustomMVPDPicker"].toLowerCase() == "true" : false));

            var onReadyListener:String = [
                "function(){",
                "var ready = false;",
                "if(window['adobePassShim'] !== undefined && typeof(adobePassShim) === 'object') {",
                "setTimeout(function(){document.getElementById(\"" + _swfId + "\").mvpdPickerReady();},1);",
                "ready = true;",
                "} else {",
                "}",
                "return function() { return ready; };",
                "}",
            ].join("");


			if (lo.vars["resourceIdMap"])
			{
				_resourceIdMap = lo.vars["resourceIdMap"];
			}

            //we should probably import the javascript if it's not available...

            var ready:Boolean = ExternalInterface.call(onReadyListener + "()");

            if (!ready)
            {
                var scriptUrl:String = "$pdk.scriptRoot+'/js/plugins/mvpdPicker.js'";
                if (_scriptPath)
                {
                    if (_scriptPath.indexOf("http://") == 0)
                    {
                        scriptUrl = "'" + _scriptPath + "'";
                    }
                    else
                    {
                        scriptUrl = "'" +getSwfBaseUrl() + _scriptPath + "'";
                    }
                }
                _controller.trace("loading scriptUrl:" + scriptUrl, "MvpdPicker", Debug.INFO);

                var loaderStr:String = "function(){"
                        + " tpLoadScript(" + scriptUrl + ", function(){setTimeout(function(){document.getElementById(\"" + _swfId + "\").mvpdPickerReady();},1)}"
                        + ");"
                        + "  }";

                ExternalInterface.call(loaderStr);
            }

		}
    }
    private function pluginsComplete(e:PdkEvent):void
    {
        _pluginsLoaded = true;
        sendPickerLoaded();
    }

    private function getSwfBaseUrl():String
    {
        return this.loaderInfo.url.substr(0, this.loaderInfo.url.lastIndexOf("/"));
    }

	public function pickerReadyCallback():void
    {
        _pickerReadyTimer = new Timer(1, 1);
        _pickerReadyTimer.addEventListener(TimerEvent.TIMER, firstPickerReadyTick, false, 0, true);
        _pickerReadyTimer.start();

	}

    public function firstPickerReadyTick(e:TimerEvent):void
    {
        _controller.trace("Picker Ready", "MvpdPicker", Debug.INFO);
		_pickerReadyTimer.removeEventListener(TimerEvent.TIMER, firstPickerReadyTick);
        ExternalInterface.marshallExceptions = false;
        ExternalInterface.call("adobePassShim.parseResourceIds('" + _resourceIdMap + "')");
        _pickerReady = true;
        if (_pluginsLoaded)
        {
            _pickerReadyTimer.addEventListener(TimerEvent.TIMER, pickerReadyTick, false, 0, true);
            _pickerReadyTimer.reset();
            _pickerReadyTimer.start();
        }
    }

    private function pickerReadyTick(e:TimerEvent):void
    {
        sendPickerLoaded();
    }

    private function sendPickerLoaded():void
    {
        _controller.trace("send picker loaded", "MvpdPicker", Debug.DEBUG)

        if (_pluginsLoaded && _pickerReady)
        {
            if (_pickerReadyTimer)
            {
                _pickerReadyTimer.removeEventListener(TimerEvent.TIMER, pickerReadyTick);
                _pickerReadyTimer = null;
            }
            _controller.trace("Picker Ready; dispatching pickerLoaded event", "MvpdPicker", Debug.INFO);
		    _controller.dispatchEvent(new PlayerEvent("mvpdPickerLoaded", null));
        }
    }


}
}