/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins.tracking {
	import com.omniture.AppMeasurement;
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.data.SeekObject;
	import com.theplatform.pdk.data.TimeObject;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.plugins.IPlugIn;
	import com.theplatform.pdk.utils.Debug;
	import com.theplatform.pdk.utils.PdkStringUtils
	
	import flash.display.Sprite;
	import flash.events.TimerEvent;
	import flash.external.ExternalInterface;
	import flash.utils.Timer;

	public class OmnitureTracking extends Sprite implements IPlugIn
	{
		private static var VERSION:String = "1.51";
		private static var DEFAULT_MINUTES_TO_LIVE_CUTOFF:uint = 10;
		
		private var _lo:LoadObject;
		private var _controller:IPlayerController;
		
		// omniture tracking vals
		private var _frequency:String;
		private var _frequencySeconds:Number = 0;
		private var _frequencyPercent:Number = 0;
		private var _pageName:String;
		private var _pageUrl:String;
		private var _player:String;
		private var _currentTime:TimeObject;
		private var _isPaused:Boolean;		
		private var _AppMeasurement:IAppMeasurement;	
		private var _clipTitle:String;
		private var _adViewEvent:String;
		private var _adCompleteEvent:String;
		private var _mediaIdVars:Array
		private var _mediaGuidVars:Array;
		private var _categoriesVars:Array;
		private var _trackVars:String;
		private var _milestones:String;
		private var _useTrackLink:Boolean = false;

		private var _playlist:Playlist;
		private var _chapters:Number;
		private var _clip:Clip;
		private var _lastChapter:Clip;
		private var _firstChapter:Clip;
		private var _open:Boolean = false;
		private var _position:Number;
		private var _isAd:Boolean = false;
        private var _mediaStarted:Boolean = false;
		
		private var _minutesToLiveCutoff:Number = DEFAULT_MINUTES_TO_LIVE_CUTOFF;
		private var _liveCutoffTimer:Timer;
		private var _liveCutoffTimerComplete:Boolean = false;

		public static const OmnitureTrackingMonitor:String = "omnitureTrackingMonitor";
		public static const OmnitureTrackingEvent:String = "OnOmnitureTracking";
		
		/**
		 * default constructor
		 */
		public function OmnitureTracking()
		{			
		}		
		
		/**
		 * Initialize the plugin with the load object
		 * @param lo load object
		 */ 
		public function initialize(lo:LoadObject):void
		{
			if (_minutesToLiveCutoff > 0)
			{
				_liveCutoffTimer = new Timer(_minutesToLiveCutoff * 60 * 1000, 0);
				_liveCutoffTimer.addEventListener(TimerEvent.TIMER, handleLiveCutoffTimer);				
			}

			var omnitureJsUrl:String = "";

			if (lo.vars.hasOwnProperty("omnitureJsUrl")) {
				omnitureJsUrl = lo.vars["omnitureJsUrl"];
			}
			else if (PdkStringUtils.isExternalInterfaceAvailable()) {
				omnitureJsUrl = ExternalInterface.call("eval", "$pdk.scriptRoot") + "/js/omniture.sitecatalyst.js";
			}

			_lo = lo;
			_controller = _lo.controller as IPlayerController;
			_controller.trace("Omniture Media loading...", "OmnitureMedia", Debug.INFO);

			var useJS:Boolean = true;
			var s_code:String = "s";

			if (_lo.vars["jsInstanceName"])
			{
				s_code = _lo.vars["jsInstanceName"];
			}
			
			if (_lo.vars["useJS"] == "false")
			{
				useJS = false;
			}
			
			if (_lo.vars["useTrackLink"] == "true")
			{
				_useTrackLink = true;
			}

			if (!com.theplatform.pdk.utils.PdkStringUtils.isExternalInterfaceAvailable()) useJS = false;
			
			if (useJS)
			{
				_AppMeasurement = new JSAppMeasurement(s_code, omnitureJsUrl, _controller, lo.vars["account"]);
			}
			else
			{
				_AppMeasurement = new FlashAppMeasurement();
			}

			if (_AppMeasurement.ready())
			{
				configureSiteCatalyst();
			}
			else
			{
				_AppMeasurement.callback = configureSiteCatalyst;
			}
			_controller.addEventListener(PdkEvent.OnPlugInsComplete, loadComplete);
		}
		
		public function configureSiteCatalyst():void
		{
			var milestoneEvents:String = null;
			var monitorJSFunction:String;

			_trackVars = "";

			_controller.trace("AppMeasurement component is version " + _AppMeasurement.version, "OmnitureMedia", Debug.INFO);
					
			if (_lo.vars.hasOwnProperty("pageName")) {
				_pageName = _lo.vars["pageName"];     
			}
			else if (_lo.vars.hasOwnProperty("pagename")) {
				_pageName = _lo.vars["pagename"];
			}
			
			if (_lo.vars.hasOwnProperty("pageUrl")) {
				_pageUrl = _lo.vars["pageUrl"];
			}
			else if (_lo.vars.hasOwnProperty("pageurl")) {
				_pageUrl = _lo.vars["pageurl"];
			}
			
			if (_lo.vars.hasOwnProperty("pageUrl")) {
				_pageUrl = _lo.vars["pageUrl"];
			}
			else if (_lo.vars.hasOwnProperty("pageurl")) {
				_pageUrl = _lo.vars["pageurl"];
			}
				
//			// minutesToLiveCutoff
//			if (_lo.vars.hasOwnProperty("minutesToLiveCutoff")) {
//				_minutesToLiveCutoff = Number(_lo.vars["minutesToLiveCutoff"]);
//			}
//			else if (_lo.vars.hasOwnProperty("minutestolivecutoff")) {
//				_minutesToLiveCutoff = Number(_lo.vars["minutestolivecutoff"]);
//			}	
			
			// minutesToLiveCutoff
			if (_lo.vars.hasOwnProperty("milestoneStopTime")) {
				_minutesToLiveCutoff = Number(_lo.vars["milestoneStopTime"]);
			}
			else if (_lo.vars.hasOwnProperty("milestonestoptime")) {
				_minutesToLiveCutoff = Number(_lo.vars["milestonestoptime"]);
			}	
			
			// universal AppMeasurement settings
			_AppMeasurement.pageName = getPageName();
			_AppMeasurement.pageURL = getPageUrl();
			_AppMeasurement.charSet = "UTF-8";
			_AppMeasurement.currencyCode = "USD";
			_AppMeasurement.trackClickMap = false;
			_AppMeasurement.movieID = "";
			
			// parse all properties
			for (var loadVar:* in _lo.vars)
			{
				_controller.trace(loadVar + "=[" + _lo.vars[loadVar] + "]", "OmnitureMedia", Debug.INFO);
				switch (loadVar)
				{
					case "useJS":
					case "jsInstanceName":
						break;						
					case "monitor":
						monitorJSFunction = _lo.vars[loadVar];
						break;
					case "host":
						_AppMeasurement.trackingServer = _lo.vars[loadVar];
						break;
					case "secureHost":
						_AppMeasurement.trackingServerSecure = _lo.vars[loadVar];
						break;
					case "debug":
						_AppMeasurement.debugTracking = _lo.vars[loadVar] == "true";
						_AppMeasurement.trackLocal = _lo.vars[loadVar] == "true";
						break;
					case "trackingDelay":
						_AppMeasurement.trackingDelay = Number(_lo.vars[loadVar]);
						break;
					case "trackVars":
						_trackVars += (_trackVars.length > 0 ? "," : "") + _lo.vars[loadVar];
						break;
					case "trackEvents":
						_AppMeasurement.Media.trackEvents = _lo.vars[loadVar];
						break;
					case "trackMilestones":
						_milestones = _lo.vars[loadVar];
						break;
					case "a.media.milestones":
						milestoneEvents = _lo.vars[loadVar]
						break;
					case "a.media.name":
						_AppMeasurement.Media.trackUsingContextData = true;
						_AppMeasurement.Media.contextDataMapping.setProperty(loadVar, _lo.vars[loadVar]);
						break;
					case "adViewEvent":
						_adViewEvent = _lo.vars[loadVar];
						break;
					case "adCompleteEvent":
						_adCompleteEvent = _lo.vars[loadVar];
						break;
					case "mediaIdVars":
						_mediaIdVars = (_lo.vars[loadVar] as String).split(",");
						_trackVars += (_trackVars.length > 0 ? "," : "") + _mediaIdVars;
						break;
					case "mediaGuidVars":
						_mediaGuidVars = (_lo.vars[loadVar] as String).split(",");
						_trackVars += (_trackVars.length > 0 ? "," : "") + _mediaGuidVars;
						break;
					case "categoriesVars":
						_categoriesVars = (_lo.vars[loadVar] as String).split(",");
						_trackVars += (_trackVars.length > 0 ? "," : "") + _categoriesVars;
						break;
					case "a.contentType":
					case "a.contenttype":
						_AppMeasurement.Media.trackUsingContextData = true;
						_AppMeasurement.Media.contextDataMapping.setProperty(loadVar, _lo.vars[loadVar]);
						break;
					case "frequency":
						_frequency = _lo.vars[loadVar];
						if (_frequency.indexOf("%") == _frequency.length - 1)
						{
							_frequencyPercent = Number(_frequency.substr(0, _frequency.length - 1));
							if (isNaN(_frequencyPercent))
							{
								_frequencyPercent = 25;
							}
						}
						else
						{
							
							_frequencySeconds = Number(_frequency);
							if (isNaN(_frequencySeconds))
							{
								_frequencySeconds = 5;
							}
							if (_frequencySeconds < 5)
							{
								_controller.trace("Omniture doesn't support a frequency less than 5 seconds; snapping to 5", "OmnitureMedia", Debug.WARN);
							}
						}
						break;
					// handles "dc", "account", "visitorNamespace", "Media.x", and any "eVarN" and "propN"
					default:
						var subLoadVar:String;
						
						if (loadVar.toLowerCase().indexOf("media.") == 0)
						{
							subLoadVar = (loadVar as String).substring(6);
							_AppMeasurement.Media.setProperty(subLoadVar, _lo.vars[loadVar]);
						}
						else if (loadVar.toLowerCase().indexOf("a.media.") == 0)
						{
							_AppMeasurement.Media.trackUsingContextData = true;
							_AppMeasurement.Media.contextDataMapping.setProperty(loadVar, _lo.vars[loadVar]);
						}
						else if (loadVar.toLowerCase().indexOf("a.ad.") == 0)
						{
							// do nothing... these are for later
						}
						else
						{
							_AppMeasurement.setProperty(loadVar, _lo.vars[loadVar]);
						}
				}
				
				_pageName = _AppMeasurement.pageName;
				_pageUrl = _AppMeasurement.pageURL;
			}			 

			_AppMeasurement.Media.trackVars = _trackVars;

			// set up a monitor
			if (!(_AppMeasurement is JSAppMeasurement))
			{
				var me:Object = this;
				_AppMeasurement.Media.monitor = function(s:AppMeasurement, media:Object):void
				{
					_controller.callFunction(OmnitureTrackingMonitor, [s, media, me._clip]);
				}
			}
			else if (monitorJSFunction)
			{
				_AppMeasurement.Media.monitor = monitorJSFunction;
			}
			
			// configure Omniture to send tracking information while playing,
			// to deal with cases where people end clips prematurely.
			if (_milestones && _milestones.length > 0)
			{
				_AppMeasurement.Media.trackWhilePlaying = true;
				_AppMeasurement.Media.trackMilestones = _milestones;
				_AppMeasurement.Media.segmentByMilestones = true;
			}
			else if (_frequencyPercent != 0)
			{
				_AppMeasurement.Media.trackWhilePlaying = true;
				var milestone:Number = _frequencyPercent;
				_milestones = "";
				while (milestone < 100)
				{
					_milestones += (_milestones.length > 0 ? "," : "") + milestone.toString();
					milestone += _frequencyPercent;
				}				
				_AppMeasurement.Media.trackMilestones = _milestones;
				_AppMeasurement.Media.segmentByMilestones = true;
			}
			else if (_frequencySeconds != 0)
			{
				_AppMeasurement.Media.trackWhilePlaying = true;
				_AppMeasurement.Media.trackSeconds = _frequencySeconds;
			}

			if (milestoneEvents && _milestones && _milestones.split(",").length == milestoneEvents.split(",").length)
			{
				var milestonesArray:Array = _milestones.split(",");
				var milestoneEventsArray:Array = milestoneEvents.split(",");
				_AppMeasurement.Media.trackUsingContextData = true;
				
				for (var i:Number=0; i<milestonesArray.length; i++)
				{
					_controller.trace("s.Media.contextDataMapping[a.media.milestones][" + parseFloat(milestonesArray[i]) + "] = " + milestoneEventsArray[i], "OmnitureMedia", Debug.INFO);
					_AppMeasurement.Media.contextDataMapping.milestones.setProperty(""+parseFloat(milestonesArray[i]), milestoneEventsArray[i]);
				}
			}
				
			_controller.trace("*** OmnitureMedia PLUGIN LOADED *** version:[" + VERSION + "]", "OmnitureMedia", Debug.INFO);
			_controller.trace("account=[" + _AppMeasurement.account + "] visitorNamespace=[" + _AppMeasurement.visitorNamespace + "] dc=[" + _AppMeasurement.dc + "] pageName=[" + _AppMeasurement.pageName + "] pageURL=[" + _AppMeasurement.pageURL + "] debug=[" + _AppMeasurement.debugTracking + "] frequency=[" + _frequency + "] host=[" + _AppMeasurement.trackingServer + "]","OmnitureMedia", Debug.INFO);
			
			// only send unfinished track records if we're not doing tracking while playing
			// note that this will register as a page view, which might overcount things
			if (!_frequencyPercent && _frequencySeconds <= 0)
			{
//				_controller.trace("Calling track() to send any unclosed sessions", "OmnitureMedia", Debug.INFO);
//				_AppMeasurement.track();
			}

			if (_mediaStarted)
            {
                _controller.trace("calling doStartMeasurement from configure", "OmnitureTracking", Debug.WARN);
                doStartMeasurement();
            }
		}
		
		private function getPageName():String {
			if (_pageName) {
				return _pageName;
			}
			else {
				try {
					return ExternalInterface.call("eval", "document.title");
				}
				catch (e:Error) {
					_controller.trace("unable to determine page name, JS access not available.", "OmnitureTracking", Debug.ERROR);
				}
				return "Unknown";
			}
		}
		
		private function getPageUrl():String {
			if (_pageUrl) {
				return _pageUrl;
			}
			else {
				try {
					return ExternalInterface.call("eval", "window.location.href");
				}
				catch (e:Error) {
					_controller.trace("unable to determine page url, JS access not available.", "OmnitureTracking", Debug.ERROR);
				}
				return "Unknown";
			}
		}
		
		/**
		 * Load complete, register for rest of events 
		 * @param event the pdkevent for completing registration of plugins
		 */ 
		private function loadComplete(event:PdkEvent):void 
		{
			_controller.removeEventListener(PdkEvent.OnPlugInsComplete, loadComplete);
			
			_controller.trace("adding PDK event listeners.", "OmnitureTracking", Debug.INFO);
			try {
				_controller.addEventListener(OmnitureTrackingEvent, onOmnitureTrackingEvent, _controller.globalScope);
			}
			catch (e:Error)
			{
				_controller.trace("failed to set up AS3-based monitor", "OmnitureTracking", Debug.INFO);
			}
			_controller.addEventListener(PdkEvent.OnReleaseStart, onReleaseStart);
            _controller.addEventListener(PdkEvent.OnReleaseSelected, onReleaseSelected);
            _controller.addEventListener(PdkEvent.OnReleaseEnd, onReleaseEnd);
			_controller.addEventListener(PdkEvent.OnMediaLoadStart, onMediaLoadStart);
			_controller.addEventListener(PdkEvent.OnMediaStart, onMediaStart);
			_controller.addEventListener(PdkEvent.OnMediaPlaying, onMediaPlaying);
			_controller.addEventListener(PdkEvent.OnMediaPause, onMediaPause);
			_controller.addEventListener(PdkEvent.OnMediaEnd, onMediaEnd);
			_controller.addEventListener(PdkEvent.OnMediaUnpause, onMediaUnpause);
			_controller.addEventListener(PdkEvent.OnMediaSeek, onMediaSeek);	
			_controller.addEventListener(PdkEvent.OnMediaBuffer, onMediaBuffer);
			_controller.addEventListener(PdkEvent.OnMediaPlay, onMediaUnpause);
		}
		
		private function onOmnitureTrackingEvent(e:PdkEvent):void {
			var props:Object = e.data;
			
			// copy eVars and props to AppMeasurement object
			for (var prop:String in props) {
				if (prop.toLowerCase().indexOf("evar")==0 || prop.toLowerCase().indexOf("prop")==0) {
					_AppMeasurement.setProperty(prop, props[prop]);
				}
			}
			
			// copy events
			_AppMeasurement.events = props.events;
			_controller.trace("Calling track() for custom OmnitureTrackingEvent", "OmnitureMedia", Debug.INFO);
			_AppMeasurement.track();
		}

        private function onReleaseSelected(e:PdkEvent):void
        {
            _open = false;
        }

        private function onReleaseEnd(e:PdkEvent):void
        {
            _open = false;
        }

		/**
		 * Track on release start event
		 * @param e pdk event 
		 */
		private function onReleaseStart(e:PdkEvent):void 
		{
			// try to get the player name from the playlist
			if (e.data.player != null && e.data.player.length > 0)
			{
				_player = e.data.player;
			}
			// otherwise, use the current page title
			else
			{
				_player = _AppMeasurement.pageName;
			}

			_firstChapter = null;
			_lastChapter = null;
			_open = false;
			_playlist = e.data as Playlist;
			_chapters = (_playlist && _playlist.chapters && _playlist.chapters.chapters  ? _playlist.chapters.chapters.length : 1);

			var test:Clip;
			
			if (!_firstChapter && _playlist && _playlist.clips)
			{
				_controller.trace("OnReleaseStart: Finding first and last content chapters", "OmnitureMedia", Debug.INFO);
				for (var i:Number=0; i<_playlist.clips.length; i++)
				{
					test = _playlist.clips[i];
					if (!test.isAd)
					{
						if (!_firstChapter)
						{
							_controller.trace("OnReleaseStart: found first chapter", "OmnitureMedia", Debug.INFO);
							_controller.trace("OnReleaseStart: found last chapter", "OmnitureMedia", Debug.INFO);
							_firstChapter = (_playlist.clips[i] as Clip);
						}
						_lastChapter = (_playlist.clips[i] as Clip);
					}
				}
			}

			setVars();

			_controller.trace("OnReleaseStart: " + _chapters, "OmnitureTracking", Debug.INFO);
		}				
		
		/**
		 * Pre-process on media load start event
		 * @param e pdk event
		 */
		private function onMediaLoadStart(e:PdkEvent):void 
		{
			_controller.trace("OnMediaLoadStart", "OmnitureMedia", Debug.INFO);
			var clip:Clip = e.data as Clip;
			setVars();
		}

		/**
		 * Track on media start event
		 * @param e pdk event
		 */
		private function onMediaStart(e:PdkEvent):void 
		{			
			_controller.trace("OnMediaStart", "OmnitureMedia", Debug.INFO);
			_mediaStarted = true;

			setVars();

			var clip:Clip = e.data as Clip;
			_clip = clip;
			
			_position = clip.baseClip.clipBegin / 1000;
			
			// We only care if _adViewEvent is set... adComplete can be null
			if (clip.isAd)
			{
				_controller.trace("Switching to ad tracking config", "OmnitureMedia", Debug.INFO);
				_isAd = true;
			}
			else
			{
				_controller.trace("Switching to content tracking config", "OmnitureMedia", Debug.INFO);
				_isAd = false;
			}
			
			_clipTitle = "undefined";
			
			if (clip)
			{
				if (!clip.title)
				{
					_clipTitle = (clip.isAd ? "Untitled Advertisement" : "Untitled Content");
				}
				else
				{
					_clipTitle = clip.title;
				}
			}
					
			// delay calling monitor, .open() and .play() until we're ready
			if (!_AppMeasurement.ready())
				return;

			doStartMeasurement();
		}

		private function doStartMeasurement():void
		{
			_controller.trace("doStartMeasurement", "OmnitureTracking", Debug.WARN);
            if (_AppMeasurement is FlashAppMeasurement)
			{
				// this is dirty, but it works...
				var media:Object = {name: _clipTitle, timePlayed: 0, event: ""}
				_controller.callFunction(OmnitureTrackingMonitor, [(_AppMeasurement as FlashAppMeasurement)._AppMeasurement, media, _clip]);
			}

			if (_isAd && _adViewEvent)
			{
				trackEvent(_adViewEvent);
			}
			else if (_clip == _firstChapter && !_open)
			{
				_open = true;
				var mediaLength:Number = Math.floor((_clip.baseClip.trueLength > 0 ? _clip.baseClip.trueLength : _clip.baseClip.releaseLength) / 1000);
				_controller.trace("Media.open: chapter=[" + _clip.clipIndex + " / " + _chapters + "] title=[" + _clipTitle + "] length=[" + mediaLength + "] player=[" + _player + "]", "OmnitureMedia", Debug.INFO);
				_AppMeasurement.Media.open(_clipTitle, mediaLength, _player);
	            _AppMeasurement.Media.play(_clipTitle, 0);
			}

			this.onMediaUnpause(null);			
		}

        private function onMediaBuffer(e:PdkEvent):void
        {
            if (_mediaStarted && !_isAd)
            {
                doStopMeasurement();
            }

        }
	
		/**
		 * Track on media pause event
		 * @param e pdk event for media pause, report to omniture
		 */
		private function onMediaPause(e:PdkEvent):void 
		{	
			if (_isAd) return;
			
			doStopMeasurement();
		}

        private function doStopMeasurement():void
        {
            setVars();

			_controller.trace("Media.stop: event=[" +"" + "] title=[" + _clipTitle + "]  position=[" + _position + "]", "OmnitureMedia", Debug.INFO);
			_AppMeasurement.Media.stop(_clipTitle, _position);
			_isPaused = true;
        }
	
		/**
		 * Track on media unpause
		 * @param e pdk event for on media unpause
		 */
		private function onMediaUnpause(e:PdkEvent):void
		{
			if (_isAd) return;
			
			setVars();
			
			// when the release ends while in paused state (ie, user hits forward button while the player
			// is paused), the player will send an onMediaUnpause event to "reset" the state for the next clip. 
			// The result is a null clip in the payload. We should ignore this event.
			if (!_clipTitle)
				return;

			_controller.trace("Media.play: event=[" + (e ? e.type : "null") + "] title=[" + _clipTitle + "]  position=[" + _position + "]", "OmnitureMedia", Debug.INFO);
			_AppMeasurement.Media.play(_clipTitle, _position);
			_isPaused = false;
		}		
		
		private function onMediaPlaying(e:PdkEvent):void {
			if (_isAd) return;
			
			
			
			setVars();

			var timeobject:TimeObject = e.data as TimeObject;
			
			// minutestolivecutoff
			if(timeobject.isLive)
			{
				if (!_liveCutoffTimerComplete)
					_liveCutoffTimer.start();					
			}
			else
			{
				_liveCutoffTimer.stop();
				_liveCutoffTimerComplete = false;
			}
			
			_position = Math.floor(timeobject.currentTimeAggregate / 1000);
			var media:Object = {
				name: _clipTitle,
				timePlayed: _position,
				event: ""
			};

		//		this.monitor(s, media, clip);

			//_controller.trace("Media.play: title=[" + this._clipTitle + "]  position=[" + _position + "]", "OmnitureMedia", Debug.INFO);
            _AppMeasurement.Media.play(_clipTitle, _position);
		}
			
		/**
		 * Track on media end
		 * @param e pdk event for media ending
		 */
		private function onMediaEnd(e:PdkEvent):void 
		{
			setVars();
            _mediaStarted = false;
			if (_isAd && _adCompleteEvent)
			{
				
				trackEvent(_adCompleteEvent);
				clearEvents();
				return;
			}
			
			var clip:Clip = e.data as Clip;

			_controller.trace("Media.stop: chapter=[" + clip.clipIndex + " / " + _chapters + "] title=[" + _clipTitle + "]   position=[" + _position + "]", "OmnitureMedia", Debug.INFO);
			_AppMeasurement.Media.stop(_clipTitle, _position);

			
			if (clip == _lastChapter)
			{
				_controller.trace("Media.close: chapter=[" + clip.clipIndex + " / " + _chapters + "] title=[" + _clipTitle + "]", "OmnitureMedia", Debug.INFO);
				_AppMeasurement.Media.close(_clipTitle);
				_AppMeasurement.Media.track(_clipTitle);
			}
		}		
		
		/**
		 * Track a seek event
		 * @param e pdk even for media seek
		 */
		private function onMediaSeek(e:PdkEvent):void 
		{
			if (_isAd) return;
			
			setVars();

			var position:Number;
			var seekObj:SeekObject = e.data as SeekObject;
			
			if (!_isPaused)
			{
				if (seekObj.start)
                {
                    position = Math.floor(seekObj.start.currentTimeAggregate/1000);
                    _controller.trace("Media.stop: (seek start) title=[" + _clipTitle + "]  position=[" + position + "]", "OmnitureMedia", Debug.INFO);
                    _AppMeasurement.Media.stop(_clipTitle, position);
                }

	            if (seekObj.end)
                {
                    position = Math.floor(seekObj.end.currentTimeAggregate/1000);
                    _controller.trace("Media.play: (seek end) title=[" + _clipTitle + "]  position=[" + position + "]", "OmnitureMedia", Debug.INFO);
                    _AppMeasurement.Media.play(_clipTitle, position);
                }
			}
		}
		
		private function setVars():void
		{
			// if we're not ready, skip.  It'll come back here again.
			if (!_AppMeasurement.ready())
			{
				return;
			}

			var clip:Clip;
			
			if (_firstChapter)
			{
				clip = _firstChapter;
			}
			else
			{
				return;
			}
			
			_AppMeasurement.Media.trackVars = _trackVars;

			_controller.trace("setting Media tracking vars", "OmnitureMedia", Debug.DEBUG);

			var i:Number;
			
			//Media ID
			if (_mediaIdVars)
			{
				for (i=0; i<_mediaIdVars.length; i++)
				{
					//_controller.trace(" - setting " + _mediaIdVars[i] + " to " + clip.baseClip.contentID, "OmnitureMedia", Debug.INFO);
					_AppMeasurement.setProperty(_mediaIdVars[i], clip.baseClip.contentID)
				}
			}

			// Media GUID
			if (_mediaGuidVars)
			{
				for (i=0; i<_mediaGuidVars.length; i++)
				{
					//_controller.trace(" - setting " + _mediaGuidVars[i] + " to " + clip.baseClip.guid, "OmnitureMedia", Debug.INFO);
					_AppMeasurement.setProperty(_mediaGuidVars[i], clip.baseClip.guid)
				}
			}

			// Categories
			if (_categoriesVars)
			{
				var cats:String = "";
				
				for (i=0; i<clip.baseClip.categories.length; i++)
				{
					cats += (cats.length > 0 ? "," : "") + clip.baseClip.categories[i].name;
				}
				
				for (i=0; i<_categoriesVars.length; i++)
				{
					//_controller.trace(" - setting " + _categoriesVars[i] + " to " + cats, "OmnitureMedia", Debug.INFO);
					_AppMeasurement.setProperty(_categoriesVars[i], cats);
				}
			}
		}
		
		private function trackEvent(event:String):void
		{
			addEvent(event);

			if (!_useTrackLink)
				_AppMeasurement.track();
			else
				_AppMeasurement.trackLink(this, 'o', event);

			removeEvent(event);
		}
		
		private function addEvent(event:String):void
		{
			_AppMeasurement.events = (_AppMeasurement.events ? _AppMeasurement.events : "").split(",").concat(event).join(",");
		}
		
		private function removeEvent(event:String):void
		{
			var events:Array = (_AppMeasurement.events ? _AppMeasurement.events : "").split(",");
			var newEvents:Array = [];

			for (var i:Number=0; i<events.length; i++)
			{
				if (events[i] == event || events[i].indexOf(event+"=") == 0)
				{
					// do nothing
				}
				else
				{
					newEvents.push(events[i]);
				}
			}
			_AppMeasurement.events = newEvents.join(",");
		}
		
		private function clearEvents():void
		{
			_AppMeasurement.events = "";
		}
		
		private function handleLiveCutoffTimer(e:TimerEvent):void
		{
			_liveCutoffTimer.stop();
			_liveCutoffTimerComplete = true;
			_AppMeasurement.Media.trackWhilePlaying = false; // This deosn't work.
			_AppMeasurement.Media.trackSeconds = Number.MAX_VALUE; // This does work. 	
			_controller.trace("milestoneStopTime hit at " + _minutesToLiveCutoff  + " minutes. Stopping media tracking by seconds", "OmnitureMedia", Debug.INFO);
		}
	}
}
