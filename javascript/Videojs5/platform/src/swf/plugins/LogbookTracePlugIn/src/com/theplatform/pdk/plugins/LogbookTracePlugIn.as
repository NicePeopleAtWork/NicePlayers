package com.theplatform.pdk.plugins
{
import com.theplatform.pdk.controllers.IBaseController;
import com.theplatform.pdk.controllers.IViewController;

import com.theplatform.pdk.data.LoadObject;

import com.theplatform.pdk.events.PdkEvent;

import com.theplatform.pdk.utils.Debug;

import flash.display.Sprite;

import flash.events.StatusEvent;
import flash.net.LocalConnection;

import net.comcast.logging.Logger;
import net.comcast.logging.consoles.IConsole;
import net.comcast.logging.consoles.LogBookConsole;

public class LogbookTracePlugIn extends Sprite implements IPlugIn
{

    private var _controller:IBaseController;

    private var _logConsole:IConsole;

    private var _connectionName:String = "_com.theplatform.pdk"


    public function LogbookTracePlugIn()
    {
        super();
    }

    public function initialize(lo:LoadObject):void
    {
        _controller = lo.controller as IBaseController;

        //this plugin need not register itself

        if (lo.vars["connectionName"])
            _connectionName = lo.vars["connectionName"] as String;

        _controller.addEventListener(PdkEvent.OnPdkTrace, onPdkTrace);
    }

    private function onPdkTrace(e:PdkEvent):void
    {

        var obj:Object = e.data;

        if (obj)
        {
            //this plugin ignored the timestamp
            trace(obj.message,  obj.className, obj.controllerId, obj.level);
        }

    }

    private function trace(str:String, className:String = null, controllerId:String = null, level:int = Debug.INFO):void
    {

        if (!_logConsole)
        {
            _logConsole = new LogBookConsole(_connectionName);
            Logger.console = _logConsole;
            Logger.setLevel(0);

        }
        var domainStr:String = "";
        if (controllerId) domainStr += controllerId;
        if (!str) str = "";
        if (className) str = className + " :: " + str;

        switch (level)
        {
            case Debug.DEBUG:
                Logger.debug(domainStr, str);
                break;

            case Debug.INFO:
                Logger.info(domainStr, str);
                break;

            case Debug.WARN:
                Logger.warn(domainStr, str);
                break;

            case Debug.ERROR:
                Logger.error(domainStr, str);
                break;

            case Debug.FATAL:
                Logger.fatal(domainStr, str);
                break;

        }
    }

    private static function handleDebugLCStatus(e:StatusEvent):void
    {
        if (e.level == "error")
        {
        }
    }


}
}
