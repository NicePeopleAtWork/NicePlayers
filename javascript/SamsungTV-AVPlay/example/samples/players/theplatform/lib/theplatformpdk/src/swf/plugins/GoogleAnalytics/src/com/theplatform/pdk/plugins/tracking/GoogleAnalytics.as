/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins.tracking {
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.data.TimeObject;
	import com.theplatform.pdk.data.TrackingUrl;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.plugins.IPlugIn;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.display.Sprite;
	import flash.external.*;

	public class GoogleAnalytics extends Sprite implements IPlugIn
	{
		private var VERSION:String = "1.3";		
		private var _controller:IPlayerController;		
		private var _callback:String = "tpGaLoaded";
		private var _histogramTag:String = "histogram";		
		private var _pattern:String;
		private var _histograms:Number;
		private var _trackAds:Boolean;
		private var _ID:String;
		private var _instanceID:Number;		
		private var _checkPoints:Array;
		private var _playlist:Playlist;
		private var _pageTitle:String;
		private var _isAd:Boolean;		
		private var _gaUrl:String;
		private var _gaJavascriptUrl:String;
		
		// this is shared across all instances, so that javascript is only loaded once
		private static var _isJSLoading:Boolean = false;
		
		public function GoogleAnalytics()
		{	
		}
		
		public function initialize(lo:LoadObject):void
		{
			// get the controller
			 _controller = lo.controller as IPlayerController;
			 
			// get the tracking ID
			_ID = lo.vars["ID"];			
			if (_ID == null || _ID.length == 0)
			{
				_controller.trace("ERROR: the google analytics tracking ID (e.g., \"UA-4774730-2\") must be provided via an \"ID\" parameter.", "GoogleAnalytics", Debug.FATAL);
				return;
			}
			
			// create an instance ID, for multiple google analytics plugins running at the same time
			_instanceID = Math.round(1000000 * Math.random());
		
			// get the pattern.  it needs to start with "/", and not end with "/", so massage the string as necessary
			_pattern = lo.vars["pattern"];		
			if (_pattern == null || _pattern.length == 0)
			{
				_pattern = "/thePlatform/{playlist.player}/{isAd}/{title}/{" + _histogramTag + "}";
			}
			// make sure the pattern starts with "/", for URL goodness
			if (_pattern.charAt(0) != "/")
			{
				_pattern = "/" + _pattern;
			}		
		
			// figure out the histogram count
			_histograms = lo.vars["histograms"];			
			if (isNaN(_histograms) || _histograms < 1)
			{
				_histograms = 10;
			}
		
			// record whether to track ads
			_trackAds = lo.vars["trackAds"];

			// get the page title; we might use this for a player name
			try {
				_pageTitle = ExternalInterface.call("eval", "document.title");
			}
			catch(error:SecurityError)
			{
				_controller.trace("Security Error, we won't load GoogleAnalytics", "GoogleAnalytics", Debug.ERROR);
				return;
			}
			
//First check if there is a loadvar: jsUrl, if so then use it.
//Otherwise, try to figure out the url using the following
//try plugInUrl.replace(“swf/*.swf”, “js/ga.js”); 
//if there was no match in #1 try replace(“*.swf”, “ga.js”) 
//if there was no match in #2 try using <currenthost>/js/ga.js 			
			
			var plugInUrl:String;
			
			try {
				plugInUrl = _controller.getStage().loaderInfo.url;
			}
			catch (e:Error) {
				plugInUrl = null;
			}
		
			if (lo.vars.hasOwnProperty("jsUrl")) {
				_gaJavascriptUrl = lo.vars["jsUrl"];
			}
			else if (plugInUrl && plugInUrl.match(/swf\/.+\.swf/)) {
				_gaJavascriptUrl = plugInUrl.replace(/swf\/(.+)\.swf/, "js/ga.js");
			}
			else if (plugInUrl && plugInUrl.match(/.+swf/)) {
				//_gaJavascriptUrl = "ga.js";
				_gaJavascriptUrl = plugInUrl.replace(/\w*\.swf/, "ga.js");
			}
			
			_controller.trace("Derived javascript URL to be : " + _gaJavascriptUrl, "GoogleAnalytics", Debug.INFO);
			_controller.addEventListener(PdkEvent.OnPlugInsComplete, loadComplete);
			
			_controller.trace("[" + _instanceID + "]: *** GoogleAnalytics PLUGIN LOADED *** version:[" + VERSION + "]", "GoogleAnalytics", Debug.INFO);
			_controller.trace("[" + _instanceID + "]: pattern=[" + _pattern + "], histograms=[" + _histograms + "], trackAds=[" + _trackAds + "], ID=[" + _ID + "], pageTitle=[" + _pageTitle + "]", "GoogleAnalytics", Debug.INFO);

		}
		
		//all of the possible plugins have loaded
		private function loadComplete(e:PdkEvent):void
		{
			try 
			{
				_controller.removeEventListener(PdkEvent.OnPlugInsComplete, loadComplete);
				
				// get metadata events registered as quickly as possible
				_controller.addEventListener(PdkEvent.OnMediaStart, onMediaStart);
				_controller.addEventListener(PdkEvent.OnReleaseStart, onReleaseStart);
						
				if (!_isJSLoading)
				{
					// load the google analytics helper JS
					_isJSLoading = true;
					
					_controller.trace("[" + _instanceID + "]: loading javascript from \"" + _gaJavascriptUrl + "\"", "GoogleAnalytics", Debug.INFO);
					ExternalInterface.call("tpLoadJScript", _gaJavascriptUrl, "tpGaWrapperLoaded");
				}
				else
				{
					_controller.trace("[" + _instanceID + "]: javascript is already loading", "GoogleAnalytics", Debug.INFO);
				}
				
				_controller.addEventListener(PdkEvent.OnJavascriptLoaded, onJavascriptLoaded);
			}
			catch(error:SecurityError)
			{
				_controller.trace("SecurityError when loading javascript. We won't load GoogleAnalytics", "GoogleAnalytics", Debug.ERROR);
			}					
		}
		
		public function onJavascriptLoaded(e:Object):void
		{
			
			_controller.trace("[" + _instanceID + "]: javascript loaded with callback of \"" + e.data + "\"", "GoogleAnalytics", Debug.INFO);
		
			if (e.data == "tpGaLoaded")
			{
				_controller.removeEventListener(PdkEvent.OnJavascriptLoaded, onJavascriptLoaded);
				
				// initialize
				_controller.trace("[" + _instanceID + "]: initializing analytics for \"" + _ID + "\"", "GoogleAnalytics", Debug.INFO);
				ExternalInterface.call("tpGaInit", _instanceID, _ID);
				
				// register listeners
				_controller.addEventListener(PdkEvent.OnMediaPlaying, onMediaPlaying);
				_controller.addEventListener(PdkEvent.OnMediaEnd, onMediaEnd);
				_controller.trace("[" + _instanceID + "]: all listeners registered", "GoogleAnalytics", Debug.INFO);
			}			
		}

		public function onReleaseStart(e:PdkEvent):void
		{
			_playlist = e.data as Playlist;
		}
	
		public function onMediaStart(e:PdkEvent):void 
		{
			// figure out if it's an ad
			_isAd = e.data.baseClip.isAd;
			
			if (shouldTrack())
			{
				// do the basic url substitution
				_gaUrl = substitutePattern(e.data as Clip);
				
				// set up the tracking URLs
				initTracking();
			}
		}
			
		public function onMediaPlaying(e:PdkEvent):void
		{
			if (shouldTrack())
			{
				var percentComplete:Number;
				var currentTime:Number;
				var timeObj:TimeObject;
				
				timeObj = e.data as TimeObject;

				percentComplete = (timeObj.percentCompleteAggregate > 0) ? timeObj.percentCompleteAggregate : timeObj.percentComplete;
				
				for (var i:int=0; i<_checkPoints.length; i++)
				{
					// if tracking url hasn't fired then see if it's time
					if (!_checkPoints[i].hasFired)
					{
						// tracking URL hasn't fired
						if (percentComplete >= _checkPoints[i].triggerValue)
						{
							_checkPoints[i].hasFired = true;
							gaCall(Number(_checkPoints[i].triggerValue));
						}
					}
				}
			}
		}	
		
		public function onMediaEnd(e:PdkEvent):void 
		{
			if (shouldTrack())
			{
				gaCommit();
			}
		}

		private function shouldTrack():Boolean
		{
			return _trackAds || !_isAd;
		}
		
		private function substitutePattern(clip:Clip):String
		{
			var inToken:Boolean = false;
			var token:String = "";
			var result:String = "";
			for (var i:int=0; i<_pattern.length; i++)
			{

				var char:String = _pattern.charAt(i);

				// start of a token
				if (char == "{")
				{
					inToken = true;
				}
				// end of a token
				else if (char == "}")
				{
					inToken = false;
					if (token == _histogramTag)
					{
						result += "{" + _histogramTag + "}";
					}
					else
					{
						result += gaEscape(getTokenValue(token, clip, _playlist));
					}
					token = "";
				}
				else
				{
					if (inToken)
					{
						token += char;
					}
					else
					{
						result += char;
					}
				}
			}
			return result;
		}
		
		private function getTokenValue(token:String, clip:Clip, playlist:Playlist):String
		{
			var value:String;

			// special cases for playlist-level fields
			if (token == "playlist.player")
			{
				value = getPlayer(playlist);
			}		
			// generic playlist-level handling
			else if (token.indexOf("playlist.") == 0)
			{
				value = playlist[token.split("\.")[1]];
			}		
			// generic clip-level handling
			else if (token.indexOf("clip.") == 0)
			{
				value = clip[token.split("\.")[1]];
			}		
			else if (token.indexOf("contentCustomData.") == 0)
			{
				value = clip.baseClip.contentCustomData.getValue(token.split("\.")[1], true);
			}		
			// special cases for baseclip-level fields
			else if (token == "title")
			{
				value = getTitle(clip);
			}
			else if (token == "isAd")
			{
				value = (clip.baseClip.isAd ? "Ad" : "Content");
			}		
			// general baseclip-level handling
			else
			{
				value = clip.baseClip[token];
			}
			
			// fix blanks
			if (!value || value.length == 0)
			{
				_controller.trace("Couldn't find a substitution for \"" + token + "\"", "GoogleAnalytics", Debug.WARN);
				value = "(blank)"
			}
			
			_controller.trace("[" + _instanceID + "]: replaced \"{" + token + "}\" with \"" + value + "\"", "GoogleAnalytics", Debug.INFO);
			return value.toString();
		}
		
		private function getTitle(clip:Clip):String
		{
			// try the metadata title		
			var _clipTitle:String = clip.title;
			
			// if that's missing, try to get the file name, first from the immediate clip, and
			// then from the base clip
			if (_clipTitle == null || _clipTitle.length == 0)
			{
				_clipTitle = clip.URL;
				if (_clipTitle == null || _clipTitle.length == 0)
				{
					// there's always a URL, otherwise it wouldn't play
					_clipTitle = clip.baseClip.URL;
				}
				
				// try to slice down to the file name
				var fileStart:int = _clipTitle.lastIndexOf("/");
				if (fileStart >= 0)
				{
					_clipTitle = _clipTitle.substr(fileStart + 1, _clipTitle.length - fileStart);
				}
			}
			return _clipTitle
		}
		
		private function getPlayer(playlist:Playlist):String
		{
			// try to get it from the playlist
			var player:String = playlist.player;
			
			// if that fails, use the page title
			if (player == null || player.length == 0)
			{
				player = _pageTitle;
			}
			
			return player;
		}		
				
		/**
		 * get the label for the histogram bucket; e.g., "00-05", "05-10", "95-100", etc.
		 */
		private function getHistogram(percentComplete:Number):String
		{
			// add padding for sub 10 values, so things line up in order in the google
			// analytics UI
			var roundedPercentComplete:Number = Math.round(percentComplete);
			var paddedPercentComplete:String = (roundedPercentComplete < 10 ? "0" : "") + roundedPercentComplete;
			var histogramEnd:Number = Math.round(percentComplete + (100 / _histograms));
			return paddedPercentComplete + "-" + (histogramEnd < 10 ? "0" : "") + histogramEnd;	
		}
		
		/**
		 * call google analytics
		 */
		private function gaCall(percentComplete:Number):void
		{
			// replace any histogram tag
			var histogram:String = getHistogram(percentComplete);
			var gaEvent:String;
			if (_gaUrl != null && _gaUrl.indexOf("{" + _histogramTag + "}") >= 0)
			{
				gaEvent = _gaUrl.split("{" + _histogramTag + "}").join(histogram);
			}
			else
			{
				gaEvent = _gaUrl;
			}
	
			// track the URL
			_controller.trace("[" + _instanceID + "]: updating URL: " + gaEvent, "GoogleAnalytics", Debug.INFO);
			ExternalInterface.call("tpGaUpdateTracking", _instanceID, 0, gaEvent);
			//ExternalInterface.call("tpGaTrack", _ID, gaEvent);
		}
			
		/**
		 *
		 */	
		private function gaCommit():void
		{
			_controller.trace("[" + _instanceID + "]: committing last URL", "GoogleAnalytics", Debug.INFO);
			ExternalInterface.call("tpGaCommit", _instanceID, 0);
		}
		
		/**
		 * escape any "/" characters using URI encoding
		 */
		private function gaEscape(s:String):String
		{
			return s.split("/").join("%2F");	
		}
		
		///////////////////////////////////////////////////////////////////////////////////////
		// beacon management
		private function resetTracking():void
		{
			_checkPoints = new Array()
		}
		
		private function initTracking():void
		{
			resetTracking();
			for (var i:int=0; i<_histograms; i++)
			{
				var checkPoint:TrackingUrl = new TrackingUrl();	
				checkPoint.triggerType = TrackingUrl.TRIGGER_TYPE_PERCENTAGE;
				checkPoint.triggerValue = i * (100 / _histograms);
				_checkPoints.push(checkPoint);
			}		
		}
	
	}//
}
