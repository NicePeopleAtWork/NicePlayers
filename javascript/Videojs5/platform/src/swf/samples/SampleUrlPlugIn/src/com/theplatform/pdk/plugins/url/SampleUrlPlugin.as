package com.theplatform.pdk.plugins.url 
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.data.NetStreamData;
	import com.theplatform.pdk.events.NetStreamEvent;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.plugins.IUrlPlugin;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.display.Sprite;
	import flash.events.AsyncErrorEvent;
	import flash.events.IOErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.TimerEvent;
	import flash.external.ExternalInterface;
	import flash.utils.Timer;

	public class SampleUrlPlugin extends Sprite implements IUrlPlugin
	{
		private var _controller:IPlayerController;
		private var VERSION:String = "1.0"; 
		private var _plugin:Sprite;
		private var _priority:Number;
		
		// these variables are passed in from canvas and are used for testing only.
		private var _clipModified:Boolean;
		private var _delay:Number;

		public function SampleUrlPlugin()
		{
		}
		
		//////////////////////////////////////////////////////////////////////////
		public function initialize(lo:LoadObject):void
		{
			// get the controller
			_controller = lo.controller as IPlayerController;

			// load some run-time config.  "delay" is used to simulate an asynchronous
			// response to the "rewriteURL" method.
			_delay = Number(lo.vars["delay"]);
			_delay = isNaN(_delay) ? 0 :_delay*1000;

			// "modify" is purely for testing.  if you want the sample to tell the PDK
			// that it doesn't want to handle the clip, set this to "false".			
			_clipModified = (lo.vars["modify"]=="true");
		
			// load up some supporting Javascript; your plug-in might not use this method
			loadJavascript();

			// some plugins monitor the netstream.  If  you need this
			// then create a client to listen to NetStream Callbacks
			var client:Object = new Object();
			client.onCuePoint = onCuePoint;
			client.onMetaData = onMetaData;
			client.onPlayStatus = onPlayStatus;
			client.onImageData = onImageData;
			client.onTextData = onTextData;
			client.onXMPData = onXMPData;
			client.onCaption = onCaption;

			_controller.addNetStreamClient(client);
			
			
			// you can also listen to the NetStream Events
 			_controller.addEventListener(NetStreamEvent.OnAsyncError, onAsyncError);
			_controller.addEventListener(NetStreamEvent.OnIoError, onIoError);
			_controller.addEventListener(NetStreamEvent.OnNetStatus, onNetStatus);

			// finally, evaluate the NetStream data every 5 seconds			
			var timer:Timer = new Timer(5000);
			timer.addEventListener(TimerEvent.TIMER, getNetStreamData);
			timer.start();

			_controller.trace("Initialized SampleUrl plug-in; delay=[" + _delay + "ms], modify=[" + _clipModified + "]", "SampleUrlPlugIn", Debug.INFO);
		}

		private function loadJavascript():void
		{
			// it's common that URL plugins will want to load in some javascript
			// to assist in the rewriting of URLs.  if your URL rewriting code can be
			// done entirely in ActionScript, you can skip this step.
			//
			// in this sample, there are two javascript files
			//
			// 1. sampleUrlPluginLoader.js
			// 2. sampleUrlPlugin.js
			//
			// (1) is a javascript file that loads (2), and sends a notification when (2)
			// is loaded.  This allows you to keep PDK-specific details out of (2).
			_controller.trace("Loading \"sampleUrlPlugInLoader.js\"", "SampleUrlPlugIn", Debug.INFO)
			_controller.addEventListener(PdkEvent.OnJavascriptLoaded, javascriptLoaded);
			
			// use a function from util.js to load the script, and then make a Javascript
			// callback when the script is finished.  This callback is not an event; it's
			// a javascript function call.  The "tpSampleUrlPluginLoader_loaded" call is inside
			// of "sampleUrlPluginLoader.js", and that call in turn loads "sampleUrlPlugin.js",
			// with another javascript callback, and when that callback is made, it then posts
			// a "OnJavascriptLoaded" event, which is picked up by this plugin
			var pluginJsUrl:String;
			
			try 
			{
				var sampleSwfUrl:String = _controller.getStage().loaderInfo.url;
				sampleSwfUrl = sampleSwfUrl.toLowerCase();
				pluginJsUrl = sampleSwfUrl.replace("swf/sampleurlplugin.swf", "js/sampleUrlPlugInLoader.js");
				_controller.trace("Derived javascript URL to be : " + pluginJsUrl, "sampleUrlPlugin", Debug.INFO);
			}
			catch(error:Error)
			{
				_controller.trace("Unable to derive JS, defaulting to relative", "SampleUrlPlugin", Debug.WARN);
                //this isn't very good, what if the plugin is elsewhere??
				pluginJsUrl = "../../js/sampleUrlPlugInloader.js";

			}
			
			ExternalInterface.call("tpLoadJScript", pluginJsUrl, "tpSampleUrlPlugInLoader_loaded");
		}
		
		private function javascriptLoaded(e:PdkEvent):void
		{
			_controller.trace("Received OnJavascriptLoaded for callback of [" + e.data + "]", "SampleUrlPlugIn", Debug.INFO)
			if (e.data == "tpSampleUrlPlugin")
			{
				_controller.trace("Registering URL Component", "SampleUrlPlugIn", Debug.INFO);
				_controller.removeEventListener(PdkEvent.OnJavascriptLoaded, javascriptLoaded);
				_controller.registerUrlPlugIn(this, "SampleUrl", _priority);
			}
		}
	
		public function rewriteURL(clip:Clip):Boolean 
		{
			_controller.trace("Received rewriteURL call", "SampleUrlPlugIn", Debug.INFO);

			// normally, you will set this boolean to indicate whether this pluggin changed the clip.
			// For testing purposes, this sample plugin lets the value get set in the canvas.
			if (_clipModified)
			{
				_controller.trace("Plug-in will change clip", "SampleUrlPlugIn", Debug.INFO);
				
				// in real code, you would take the clip object, and make whatever
				// changes you want to the clip.  in this sample, we'll just snap
				// the title of the clip to upper case.
				if (_delay)
				{
					_controller.trace("Do an asynchronous response in " + _delay + "ms", "SampleUrlPlugIn", Debug.INFO);
					
					// here's an asynchronous implementation...
					var myTimer:Timer = new Timer(_delay, 1);
					myTimer.addEventListener(TimerEvent.TIMER, timeoutHandler);
					function timeoutHandler(e:TimerEvent):void
					{
						myTimer.removeEventListener(TimerEvent.TIMER, timeoutHandler);
						setTitleToUppercase(clip);
					}
					myTimer.start();
				}	
				else
				{			
					_controller.trace("Do a synchronous response", "SampleUrlPlugIn", Debug.INFO);
					// here's a synchronously implementation...
					setTitleToUppercase(clip);
				}				
			}
			else
			{
				_controller.trace("\"modify\" was false; don't modify clip", "SampleUrlPlugIn", Debug.INFO);
			}					
			return _clipModified;
		}
		
		private function setTitleToUppercase(clip:Clip):void
		{
			clip.baseClip.title = String(ExternalInterface.call("tpToUpperCase", clip.baseClip.title));				
			_controller.setClip(clip);
			_controller.trace("Called \"setClip\" to update clip; new title is \"" + clip.baseClip.title + "\"", "SampleUrlPlugIn", Debug.INFO);
		}

		private function getNetStreamData(e:TimerEvent):void
		{
			var nsd:NetStreamData = _controller.getNetStreamData();
			// the data will be null if there is no clip playing
			if (nsd)
			{
				_controller.trace("NetStream getNetStreamData:");
				_controller.trace("\tclip title: \t" + nsd.clip.baseClip.title);
				_controller.trace("\tbufferLength: \t" + nsd.bufferLength);
				_controller.trace("\tbufferTime: \t" + nsd.bufferTime);
				_controller.trace("\tbytesLoaded: \t" + nsd.bytesLoaded);
				_controller.trace("\tbytesTotal: \t" + nsd.bytesTotal);
				_controller.trace("\tcurrentFPS: \t" + nsd.currentFPS);
				_controller.trace("\tliveDelay: \t" + nsd.liveDelay);
				_controller.trace("\tobjectEncoding: \t" + nsd.objectEncoding);
				_controller.trace("\ttime: \t" + nsd.time);
				_controller.trace("\tinfo: \t" + nsd.info);
			}
		}

		private function onAsyncError(e:NetStreamEvent):void
		{
			var asyncErrorEvent:AsyncErrorEvent = (e.data as AsyncErrorEvent);
			_controller.trace("NetStream AsyncError: " + asyncErrorEvent.error + ":" + asyncErrorEvent.text, "SampleUrlPlugin", Debug.ERROR);
		}

		private function onIoError(e:NetStreamEvent):void
		{
			var ioErrorEvent:IOErrorEvent = (e.data as IOErrorEvent);
			_controller.trace("NetStream IOError: " + ioErrorEvent.text, "SampleUrlPlugin", Debug.ERROR);
		}

		private function onNetStatus(e:NetStreamEvent):void
		{
			var netStatusEvent:NetStatusEvent = (e.data as NetStatusEvent);
			_controller.trace("NetStream NetStatus: " + netStatusEvent.info.code, "SampleUrlPlugin", Debug.INFO);
		}

		private function onCuePoint(info:Object):void
		{
			_controller.trace("NetStream onCuePoint:", "SampleUrlPlugin", Debug.INFO);
			traceProps(info);
		}

		private function onMetaData(info:Object):void
		{
			_controller.trace("NetStream onMetaData:", "SampleUrlPlugin", Debug.INFO);
			traceProps(info);
		}

		private function onPlayStatus(info:Object):void
		{
			_controller.trace("NetStream onPlayStatus:", "SampleUrlPlugin", Debug.INFO);
			traceProps(info);
		}

		private function onImageData(info:Object):void
		{
			_controller.trace("NetStream onImageData:", "SampleUrlPlugin", Debug.INFO);
			traceProps(info);
		}

		private function onTextData(info:Object):void
		{
			_controller.trace("NetStream onTextData:", "SampleUrlPlugin", Debug.INFO);
			traceProps(info);
		}

		private function onXMPData(info:Object):void
		{
			_controller.trace("NetStream onXMPData:", "SampleUrlPlugin", Debug.INFO);
			traceProps(info);
		}
		
		private function onCaption(captions:Array, speaker:Number):void
		{
		    _controller.trace("NetStream onCaption:", "SampleUrlPlugin", Debug.INFO);
		   	_controller.trace("captions: " + captions.toString() + " /// speaker: " + speaker, "SampleurlPlugin", Debug.INFO);
		}
		
		private function traceProps(info:Object):void
		{
			for (var prop:String in info) 
			{
		        var text:String = "";
		        var value:* = info[prop]
		        if (value is String || value is Number || value is Boolean || value is int || value is uint)
		        {
		        	text = value;
		        }
		        else if (value is Object)
		        {
		        	for each (var p2:String in value)
		        	{
		        		text += " " + p2 + ": " + value[p2] + " | "; 
		        	}
		        }
		        else
		        {
		        	text = value as String;
		        }
		        
		        _controller.trace(prop+" :: " + text, "SampleUrlPlugin", Debug.INFO);
		    }
		    _controller.trace("", "SampleUrlPlugin", Debug.INFO);
		}
		
		
	}
}
