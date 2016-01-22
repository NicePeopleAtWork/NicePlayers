/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins.ad 
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.events.PlayerEvent;
	import com.theplatform.pdk.events.VastEvent;
	import com.theplatform.pdk.plugins.IAdPlugIn;
	import com.theplatform.pdk.utils.Debug;
	import com.theplatform.pdk.utils.PdkStringUtils;
	
	import flash.display.Sprite;
	import flash.events.ErrorEvent;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.utils.getDefinitionByName;
	import flash.utils.getQualifiedClassName;
	
	import net.iab.vast.data.*;
	import net.iab.vast.parsers.VastParserAdapter;

	public class Vast extends Sprite implements IAdPlugIn
	{
		private var _controller:IPlayerController;
		private var _hosts:Array = new Array();
		private var _mimeTypes:Array = new Array();
		private var _isError:Boolean = false;
        private var _duration:Number=10000;//default duration
        private var _timestamp:Number;
        private var _enablePods:Boolean = false;

		private var _currentVastProcess:ParseVastProcess;

		private var mimeTypeTable:Object = {
			"f4m": "application/f4m+xml",
			"m3u": "application/x-mpegURL",
			"mpeg4": "video/mp4",
			"flv": "video/x-flv",
			"qt": "video/quicktime",
			"swf": "application/x-shockwave-flash"
		};

		private var defaultTypes:Array = ["application/f4m+xml", "video/mp4", "video/x-flv","video/quicktime","audio/3gpp2","audio/mp4","audio/3gpp",
                        "application/x-shockwave-flash", "audio/mpeg"];

//        private var overlayDuration:Number=10000;
				
		public function Vast()
		{
			// used for correlation across ad requests
			_timestamp = (new Date()).getTime();
		}
		
		public function initialize(lo:LoadObject):void
		{
			_controller = lo.controller as IPlayerController;
			var priority:Number = lo.priority;
			if (!priority) priority = 1;	
			var hosts:String = lo.vars["hosts"] as String; // could be array or string
			if (hosts && hosts.length)
			{
				_hosts = hosts.split(",");
			}
			else
			{
				_controller.trace("No \"hosts\" parameter, using mime-type for ad recognition", "VAST", Debug.INFO);
				//return;
			}
			var mimeType:String = lo.vars["mimeType"] as String;

            var duration:String = lo.vars["overlayDefaultDuration"];

            if (duration)
            {
                _duration = Number(duration);
            }

			if (mimeType)
			{
				_mimeTypes.push(mimeType)
			}
			else
			{
				mimeType = lo.vars["mimeTypes"] as String;
				if (mimeType)
				{
					_mimeTypes = mimeType.split(",");
				}
                else if (_controller.getProperty("formats"))
                {
                	var formats:Array = _controller.getProperty("formats").split(",");                	
                	var type:String;

                	_mimeTypes = [];
                	
                	// add the preferred types first
                	for (var i:Number=0; i<formats.length; i++)
                	{
                		type = mimeTypeTable[formats[i].toLowerCase()];
						if (type)
                			_mimeTypes.push(type);
                	}

                	// now add any missing default types
                	for (i=0; i<defaultTypes.length; i++)
                	{
                		if (_mimeTypes.indexOf(defaultTypes[i]) == -1)
                		{
                			_mimeTypes.push(defaultTypes[i]);
                		}
                	}
                }
                else
                {
                    _mimeTypes = defaultTypes.concat();
                }
			}
			//PDK-3016 trim each mimetye
            for each (var mt:String in _mimeTypes)
            {
                mt = PdkStringUtils.trim(mt);
            }
			_controller.trace("*** VAST plugIn LOADED", "VAST", Debug.INFO);
			_controller.trace("Supported mime-types: " + _mimeTypes.join(", "), "VAST", Debug.INFO);

			_enablePods = lo.vars["enablePods"] == "true";

			_controller.registerAdPlugIn(this, "VAST", priority);
		}
		
		private function isVastUrl(checkURL:String):Boolean 
		{
			return PdkStringUtils.contains(checkURL, _hosts, 0);
		}

		public function isAd(bc:BaseClip):Boolean 
		{
			return (bc.type == "application/vast+xml" || isVastUrl(bc.URL) || (PdkStringUtils.isRelative(bc.URL) && isVastUrl(bc.baseURL)) ) 
		}
		
		public function checkAd(clip:Clip):Boolean
		{
            //if this is an actual clip with a length, obviously we don't need to load xml from it
			var isHandled:Boolean = clip.mediaLength<=0 && (isVastUrl(clip.URL) || clip.baseClip.type == "application/vast+xml");
			if (isHandled)
			{
				if (_currentVastProcess)
				{
					removeCurrentVastProcess();
				}
				_currentVastProcess = new ParseVastProcess(clip, _controller, _mimeTypes, _duration, _timestamp, _enablePods);
				_currentVastProcess.addEventListener(VastEvent.OnVastAdSuccess, handleVastSuccess, false, 0, true);
				_currentVastProcess.addEventListener(VastEvent.OnVastAdFailure, handleVastFailure, false, 0, true);
				_currentVastProcess.addEventListener(VastEvent.OnVastDebug, handleVastDebug, false, 0, true);
				_currentVastProcess.execute();			
			}
			_controller.trace("checkAd - IS THIS A VAST AD? " + isHandled, "VAST", Debug.INFO);
			return isHandled;
		}
		
		private function removeCurrentVastProcess():void
		{
			_currentVastProcess.removeEventListener(VastEvent.OnVastAdSuccess, handleVastSuccess);
			_currentVastProcess.removeEventListener(VastEvent.OnVastAdFailure, handleVastFailure);
			_currentVastProcess.removeEventListener(VastEvent.OnVastDebug, handleVastDebug);
			_currentVastProcess.destroy();
			_currentVastProcess = null;
		}
		
		private function handleVastSuccess(e:VastEvent):void
		{
			_controller.trace("handleVastSuccess", "VAST", Debug.DEBUG);
			var playlist:Playlist = e.data as Playlist;
			removeCurrentVastProcess();
			_controller.setAds(playlist);
		}
		
		private function handleVastFailure(e:VastEvent):void
		{
			_controller.trace("handleVastFailure", "VAST", Debug.DEBUG);
			var clip:Clip = e.data as Clip;
			removeCurrentVastProcess();
			_controller.dispatchEvent(new PlayerEvent(PlayerEvent.OnCheckAdFailed, clip));
		}
		
		private function handleVastDebug(e:VastEvent):void
		{
			var message:String = e.data.message;
			var className:String = e.data.className;
			var level:int = e.data.level;
			_controller.trace(message, className, level);
		}
				
	}
}


