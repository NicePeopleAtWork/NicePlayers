/************************************************************************
 * Copyright (c) 2012  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins 
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.data.NetStreamData;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.data.TimeObject;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.utils.Debug;
	import com.theplatform.pdk.utils.PdkStringUtils;
	
	import flash.display.Sprite;
	import flash.utils.getTimer;
	import flash.utils.setTimeout;
	import flash.utils.clearTimeout;
	import flash.external.ExternalInterface;

	public class LiveAds extends Sprite implements IPlugIn, IDestroyablePlugIn
	{	
		private static var _VERSION:String = "2.0";
		private static var _DEV:String = "Rob H";
		private static var _UPDATE:String = "2012-04-06";
		
		private var _controller:IPlayerController; 
		
		private var _adCountStart:uint;  // the value to start the ad count at
		private var _adCount:uint; // number of ads that have been inserted
		private var _adUrl:String =""; // url that's used for ad
	
		private var _cClient:Object; // reference for onCuePoint() handler
		private var _cuePointInfo:Object; // holds the cue point information object from the "onCuePoint" callback
		private var _currentClip:Clip; // current clip being played
		private var _currentTimeoutId:Number;
		
		private var _durationBreak:Number = 0; // duration assinged from onCuePoint info
		private var _durationDefault:uint = 30000; // default property - if none is specified in cue point
		private var _durationMinimumForAd:Number = 30000; // time needed to play another ad - can be set via loadvars
		private var _durationUsed:Number = 0; // total timed used by played ads so far (per ad roll)
		private var _durationField:String = null;
		private var _useTenths:Boolean = false;
		private var _preLoadOffset:Number = 0; // how long to wait after cue point before playing ad
		private var _insertAdPending:Boolean = false;

		private var _ignoreCuePoint:Boolean; // for some reason, on the CBC stream, "onCuePoint" is fired every time you try to use "_controller.addNetStreamClient(_cClient)" // we use this to negate that fire
		private var _ignoreState:Boolean =false; // temp value holder for _ignoreCuePoint - used on play/pause
		
		private var _ordRand:String; // holds the randomized ord value between 1 and 1000000 so that multiple ads can use it.
		
		private var _timeStart:uint; // time the ad starts playing
		private var _timeEnd:uint; // time the ad finishes playing or errors out
		
		private var _triggerArr:Array; // property and vlue assigned from a loadVar
		private var _trigger:Boolean = false; // set to true if a valid trigger is found in the url loadvar

		private var _contentTriggerArr:Array; // property and vlue assigned from a loadVar
        private var _currentInjectedPlaylistId:String;
	
		
		
/////////////////////////////////////// CONSTRUCTOR ///////////////////////////////////////////
		
		public function LiveAds()
		{
		}

		
		
///////////////////////////////////// PUBLIC FUNCTIONS ////////////////////////////////////////
		
		public function initialize(lo:LoadObject):void
		{ 	
			_ignoreCuePoint = false;
			
			//instantiate the controller
			_controller = lo.controller as IPlayerController;
			
			_controller.trace("LiveAds plug-in loaded.", "LiveAds", Debug.INFO);
			
			// loads url string variable from HTML page
			var tempURL:String = lo.vars["adUrl"] as String;
			if (tempURL != null && tempURL != "null" && tempURL != "")
			{
				_adUrl = lo.vars["adUrl"] as String;
				_adUrl = unescape(_adUrl);
			}
			
			
			// loads the minimum duration for ad value from the HTML page
			var tempMin:Number =  new Number(lo.vars["minimumDurationForAd"]);
			if (tempMin)
			{
				_durationMinimumForAd = tempMin*1000;
			}
			
			// loads the minimum duration for ad value from the HTML page
			var tempPre:Number =  new Number(lo.vars["preLoadOffset"]);
			if (tempPre)
			{
				_preLoadOffset = tempPre*1000;
			}

			// loads trigger string variable from HTML page - if not trigger, sets private _trigger var to fasle
			var tempTrigger:String = lo.vars["adTrigger"] as String;
			tempTrigger = unescape(tempTrigger);
			if (tempTrigger != null && tempTrigger != "null" && tempTrigger != "none" && tempTrigger != "")
			{
				_controller.trace("getting ad trigger: " + tempTrigger);
				_trigger = true; 
				_triggerArr = tempTrigger.split(":");
			}
			else
			{
				_trigger = false;
			}

			// loads content trigger string variable from HTML page - if not trigger, sets private _trigger var to fasle
			if (_trigger)
			{
				tempTrigger = lo.vars["contentTrigger"] as String;
				tempTrigger = unescape(tempTrigger);
				if (tempTrigger != null && tempTrigger != "null" && tempTrigger != "")
				{
					_controller.trace("getting content trigger: " + tempTrigger);
					_contentTriggerArr = tempTrigger.split(":");
				}
			}

			if (lo.vars["initialPosition"])
			{
				_adCountStart = new Number(lo.vars["initialPosition"]);
			}
			else
			{
				_adCountStart = 1;
			}
			
			if (lo.vars["durationField"])
			{
				_durationField = lo.vars["durationField"];
			}
			else
			{
				_durationField = "duration";
			}

			if (lo.vars["defaultDuration"])
			{
				_durationDefault = new Number(lo.vars["defaultDuration"]) * 1000;
			}
			
			if (lo.vars["useTenthsForDuration"])
			{
				_useTenths = lo.vars["useTenthsForDuration"] == "true";
			}

			if (lo.vars["enableDebug"] == "true")
			{
				ExternalInterface.addCallback("insertAd", _startNewAdRoll);
			}

			_adCount = _adCountStart;
			
			// custom client
			_cClient = new Object();
			_cClient.onCuePoint = _onCuePoint;
			_cClient.onUserDataEvent = _onUserDataEvent;
            _controller.addNetStreamClient(_cClient);
			
			// adding listeners for events
			_controller.addEventListener(PdkEvent.OnReleaseStart, _onReleaseStart);
			_controller.addEventListener(PdkEvent.OnMediaStart, _onMediaStart);
			_controller.addEventListener(PdkEvent.OnMediaEnd, _onMediaEnd);
			_controller.addEventListener(PdkEvent.OnMediaPause,  _onMediaPause);
			_controller.addEventListener(PdkEvent.OnMediaUnpause,  _onMediaUnpause);
		}

        public function destroy():void
        {
            _controller.removeNetStreamClient(_cClient);

            _controller.removeEventListener(PdkEvent.OnReleaseStart, _onReleaseStart);
			_controller.removeEventListener(PdkEvent.OnMediaStart, _onMediaStart);
			_controller.removeEventListener(PdkEvent.OnMediaEnd, _onMediaEnd);
			_controller.removeEventListener(PdkEvent.OnMediaPause,  _onMediaPause);
			_controller.removeEventListener(PdkEvent.OnMediaUnpause,  _onMediaUnpause);
        }
		


		
////////////////////////////////////////// PRIVATE FUNCTIONS ////////////////////////////////////////////
		
		// each new add roll must have a random "ord" value.  The ord value stays the same for each ad roll
		private function _startNewAdRoll(offset:Number, duration:Number):void
		{
			_controller.trace("_startNewAdRoll()", "LiveAds", Debug.INFO);
			
			// don't start one if there's already one queued up.
			if (_insertAdPending)
				return;
			
			//re initialize for start of new ad roll
			_ignoreCuePoint = true;
			_adCount = _adCountStart;
			_durationUsed = 0;
			_ordRand = (  Math.ceil(Math.random()*99999).toString() )
			_timeStart = getTimer();
				
			_controller.trace("dispatching advertisement pre-load event timeStart:" + _timeStart, "LiveAds", Debug.INFO);
			_controller.dispatchEvent(new PdkEvent("OnAdvertisementLoadStart", {offset: offset, duration: duration}));

			if ( offset > 0)
			{
				_insertAdPending = true;
				_currentTimeoutId = setTimeout(_insertAd, offset);
			}
			else
			{
				_insertAd();
			}
		}
		 
		
		// creates base clip, clip, playlist, and inserts into stream
		private function _insertAd():void
		{
			_controller.trace("_insertAd()", "LiveAds", Debug.INFO);
			_insertAdPending = false;
			
			var baseClip:BaseClip = new BaseClip();
			baseClip.title = "Advertisement";
			var url:String =_buildAdUrl();
			baseClip.URL = url;
			baseClip.isAd = true; 
			baseClip.noSkip = true;			
			var clip:Clip = _controller.createClipFromBaseClip(baseClip);
			var playlist:Playlist = new Playlist();
			playlist.addClip(clip);
            _currentInjectedPlaylistId = playlist.id;
            //_controller.trace("current injected playlist id:"+_currentInjectedPlaylistId, "LiveAd")
			_controller.injectPlaylist(playlist);
		}
		
		// assemles all the custom data into a new valid URL string
		private function _buildAdUrl():String
		{
			// replaces  "MediaId", "ReleasePid", "Guid", and "Title"
			var builtUrl:String = PdkStringUtils.substituteProperties(_adUrl, _currentClip, null, false);
			// replaces cue point information
			builtUrl = _replaceData(builtUrl);
			
			return builtUrl;
		}		
		
		
		// replaces cue point data and returns a url string
		private function _replaceData(url:String):String
		{
			// this is causing problems... disabling for now.
			//url  = url.toLowerCase();
			
			// replaces "position" and "n" with appropriate values
			if (url.indexOf("position")!= -1){ 
				url = _replaceProperty(url, "{position}", _adCount.toString() );  
			}; 
			if (url.indexOf("n") != -1){ 
				url = _replaceProperty(url, "{n}", _ordRand.toString() )
			};
			
			for (var i:* in _cuePointInfo)
			{
				var val:String = (("{cuepoint:"+i+"}").toString()).toLowerCase()
				if (  url.indexOf(val) != -1 )
				{
					url = _replaceProperty(url, val, _cuePointInfo[i].toString() )	
				}
			}			
			return url;
		}
		
		
		// utility to search and replce within a string 
		private function _replaceProperty($str:String, $search:String, $replace:String):String  
		{  
			return $str.split($search).join($replace);   
		}
		
		
////////////////////////////////////////// HANDLERS ////////////////////////////////////////////
				
		private function _onReleaseStart(event:PdkEvent):void
		{
/*			_controller.trace("_onReleaseStart(): dispathcing initial pre-load", "LiveAds", Debug.INFO);*/
/*			_controller.dispatchEvent(new PdkEvent("OnAdvertisementLoadStart", {offset: _preLoadOffset, duration: ???}));*/
			var playlist:Playlist = event.data as Playlist;

            if (playlist)
			{
				if (playlist.unscheduledClips && playlist.unscheduledClips.length > 0)
				{
					_controller.trace("_onReleaseStart(): using adUrl from AdPolicy '" + playlist.unscheduledClips[0].baseClip.URL + "'", "LiveAds", Debug.INFO);
					_adUrl = playlist.unscheduledClips[0].baseClip.URL;
				}
			}
		}

		// handled callback whenever something starts playing on the screen - ad or live stream
		private function _onMediaStart(event:PdkEvent):void
		{
			_currentClip = event.data as Clip;
            if (!_currentClip.isAd)
            {
                _ignoreCuePoint = false;
            }
		}
		
		
		// handled callback whenever a clip is paused - ad or live stream
		private function _onMediaPause(event:PdkEvent):void
		{
			_controller.trace("_onMediaPause() ignoreCuePoint?" + _ignoreCuePoint, "LiveAds", Debug.INFO);
			// stores the original _ignoreCuePoint value in a temp variabe
			_ignoreState = _ignoreCuePoint;
			// sets the _ignoreCuePoint vaue to true so that when play is resumed, that first unwanted cue point will be ignored.
			_ignoreCuePoint = true;
		}
		
		
		// handled callback whenever a clip is unpaused - ad or live stream
		private function _onMediaUnpause(event:PdkEvent):void
		{
			_controller.trace("_onMediaUnpause() ignoreState?" + _ignoreState, "LiveAds", Debug.INFO);
			// sets _ignoreCuePoint back to its orginal state before Pause was pressed.
			_ignoreCuePoint = _ignoreState;
		}
		
		 	
		// handled callback whenever something stops playing on the screen - ad or live stream  - this is also called when there's an error plaing the ad or video
		private function _onMediaEnd(event:PdkEvent):void
		{
            _controller.trace("_onMediaEnd() isAd?" + _currentClip.isAd, "LiveAds", Debug.INFO);
			if (_currentClip.isAd && isLiveAdsInjectedPlaylist(_currentClip) && isLastClipInPlaylist(_currentClip))
			{
				
				// checks to see if there's enough time left for another ad
				// if so, invokes a method to build the cue point ifo into a string
				// that can be insterted into the adUrl
				_timeEnd = getTimer();
				_durationUsed = (_timeEnd - _timeStart);
					
				_controller.trace("_onMediaEnd(): startTime:"+_timeStart+"  endTime:"+_timeEnd+" check? " + _durationUsed + " + " + _durationMinimumForAd + " <= " + _durationBreak, "LiveAds", Debug.INFO);
				// if the _durationUsed(total time since the first ad started) +  _durationMinimumForAd(minimum time need for the next ad - set in the URL loadVars)  <=  _durationBreak(set from the cue point data)
				// also ... if _currentClip.isAd(was this clip and ad?) == true  and  _currentClip.hasPlayed(this clip has played to it's finish) == true
				// this is an important check as _onMediaEnd() is fired when an ad tries and fails to play. We use these checks to look out for that situation.
				if ((_durationUsed + _durationMinimumForAd) <= _durationBreak && _currentClip.lengthPlayed > 1000)
				{
					_controller.trace("_onMediaEnd(): insert another ad", "LiveAds", Debug.INFO);
					_controller.dispatchEvent(new PdkEvent("OnAdvertisementLoadStart", {offset: 0, duration: (_durationBreak - _durationUsed)}));
					_adCount++ 
					_insertAd();
				}
				else
				{
					// sets it back to false so the next cue point can be handled
					_controller.trace("_onMediaEnd(): done with ads", "LiveAds", Debug.INFO);
					_ignoreCuePoint = false;
				}
			}
			//_controller.trace("_onMediaEnd(): startTime:"+_timeStart+"  endTime:"+_timeEnd+"  durationUsed:"+_durationUsed+"  _durationMinimumForAd:"+_durationMinimumForAd+"  durationBreak:"+_durationBreak, "LiveAds", Debug.INFO);	
		}

        private function isLiveAdsInjectedPlaylist(clip:Clip):Boolean
        {
            if (clip.baseClip
                    && clip.baseClip.playlistRef
                    && (clip.baseClip.playlistRef.id == _currentInjectedPlaylistId
                        || (clip.baseClip.playlistRef.parentPlaylist
                            && clip.baseClip.playlistRef.parentPlaylist.id == _currentInjectedPlaylistId)))
            {
                return true;
            }
            return false;
        }

        private function isLastClipInPlaylist(clip:Clip):Boolean
        {
            if (clip.baseClip && clip.baseClip.playlistRef)
            {
                var clips:Array = clip.baseClip.playlistRef.clips;
                if ((clips[clips.length-1] as Clip).id != clip.id)
                {
                    return false;
                }
            }
            return true;
        }
				
		
		// handles cuePoint call and and assigns values
		private function _onCuePoint(info:Object):void
		{
			_controller.trace("_onCuePoint isAd?" +_currentClip.isAd + " ignore?" + _ignoreCuePoint, "LiveAds", Debug.INFO);
            if (_currentClip.isAd)
			{
				// don't process live ads cue-points during an ad...
				return;
			}
			
			// this conditional negates the automatic firing of a cuepoint on the stream whenever you try  "_controller.addNetStreamClient(_cClient)"
			// look for it being set in both the onMediaStart() and onMediaFinish() callbacks.
			if (!_ignoreCuePoint)
			{
				_controller.trace("_onCuePoint() content: " + PdkStringUtils.ObjToString(info), "LiveAds", Debug.INFO);
				
				// assigns new or default duration based on break_duration property from cue Point
				if (_durationField && info.parameters && info.parameters[_durationField] != null && info.parameters[_durationField] != undefined)
				{
					_durationBreak = Number(info.parameters[_durationField]) * 1000;
				}
				else
				{
					_durationBreak = _durationDefault;
				}
				
				if (_useTenths)
				{
					_durationBreak = _durationBreak / 10;
				}

				_cuePointInfo = info;
				
				//check to see if there's a trigger
				if (_trigger)
				{				
					//check to see if the trigger matches a property in the cue point information - AND - checks to see if the corresponding cue point value is in the trigger value
					if (_triggerArr && _triggerArr[0] in info.parameters  &&  _triggerArr[1].indexOf(info.parameters[_triggerArr[0]]) != -1)
					{  
						if (_preLoadOffset <= 0 && !isNaN(info.time))
						{
							_startNewAdRoll(info.time * 1000, _durationBreak);
						}
						else
						{
							_startNewAdRoll(_preLoadOffset, _durationBreak);
						}
					}
					else if (_contentTriggerArr && _contentTriggerArr[0] in info.parameters  &&  _contentTriggerArr[1].indexOf(info.parameters[_contentTriggerArr[0]]) != -1)
					{
						// use up all time so content will resume.
						_controller.trace("_onCuePoint(): got a content trigger, won't request anymore ads", "LiveAds", Debug.INFO);
						_durationUsed = _durationBreak + 1000;

						// clear out any scheduled ad rolls
						clearTimeout(_currentTimeoutId);
					}
				}
				else
				{
					// there's no trigger, so goahed and inert an ad at every cue point
					_startNewAdRoll(_preLoadOffset, _durationBreak);
				}
			}
		}

		// handles onUserDataEvent call and and dispatches to the world
		private function _onUserDataEvent(info:Object):void
		{
			_controller.trace("onUserDataEvent: " + info, "LiveAds", Debug.INFO);
			if (info.indexOf("<") == 0)
			{
				_controller.dispatchEvent(new PdkEvent(PdkEvent.OnMediaCuePoint, {info: "{\"xml\": \"" + info.replace("\n", "") + "\"}"}));
			}
			else
			{
				_controller.dispatchEvent(new PdkEvent(PdkEvent.OnMediaCuePoint, {info: info}));
			}

			_controller.trace("OnMediaCuePoint event dispatached", "LiveAds", Debug.INFO);
		}
			
	}
}
