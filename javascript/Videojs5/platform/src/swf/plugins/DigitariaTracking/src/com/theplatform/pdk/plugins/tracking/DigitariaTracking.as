/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins.tracking
{
	import com.digitaria.tracking.DigitariaVideoTrack;
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.data.TimeObject;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.plugins.IPlugIn;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.display.Sprite;
	import flash.external.ExternalInterface;

	public class DigitariaTracking extends Sprite implements IPlugIn
	{
		private var _controller:IPlayerController;
		
		private var _isAd:Boolean = false;		
		
		private var _digitaria:DigitariaVideoTrack = DigitariaVideoTrack.getInstance();
		
		private var _lastSelectedRelease:Object;
		private var _releaseUserInitiated:Boolean;
		
		private var _mediaStarted:Boolean = false;
		
		public function DigitariaTracking()
		{
		}		
		
		public function initialize(lo:LoadObject):void
		{
			_controller = lo.controller as IPlayerController;
			_controller.trace("DigitariaTracking loading", "DigitariaTracking", Debug.INFO);
				 
			// required params
			var account:String = lo.vars["account"];
			if (account == null || account.length == 0)
			{
				_controller.trace("*** ERROR: missing 'account' parameter", "DigitariaTracking", Debug.FATAL);
				return;
			}
			var visitorNamespace:String = lo.vars["visitorNamespace"];
			if (visitorNamespace == null || visitorNamespace.length == 0)
			{
				_controller.trace("*** ERROR: missing 'visitorNamespace' parameter", "DigitariaTracking", Debug.FATAL);
				return;
			}
			var dc:String = lo.vars["dc"];
			if (dc == null || dc.length == 0)
			{
				_controller.trace("*** ERROR: missing 'dc' parameter", "DigitariaTracking", Debug.FATAL);
				return;
			}
			
			// optional params
			var trackingServer:String = lo.vars["trackingServer"];
			var debug:Boolean = (lo.vars["debug"] ? Boolean(lo.vars["debug"]) : false);
			var player:String = lo.vars["player"];
			var onsite:Boolean = (lo.vars["onsite"] ? Boolean(lo.vars["onsite"]) : true);
			var pageName:String = lo.vars["pageName"];
			if ((pageName == null || pageName.length == 0) && ExternalInterface.available)
			{
				try
				{
					pageName = ExternalInterface.call("eval", "document.title");
				}
				catch (e:Error)
				{
					_controller.trace("Could not get page name: " + e.message, "DigitariaTracking", Debug.WARN);
				}
			}
						
			// set up digitaria
			_digitaria.configActionSource(account, visitorNamespace, dc, trackingServer, debug);
			_digitaria.configPlayer(onsite, pageName, player);
							
			_controller.trace("*** DigitariaTracking PLUGIN LOADED ***", "Digitaria", Debug.INFO);
			_controller.trace("account=[" + account + "] visitorNamespace=[" + visitorNamespace + "] dc=[" + dc + "] trackingServer=[" + trackingServer + "] debug=[" + debug + "] onsite=[" + onsite + "] pageName=[" + pageName + "]", "DigitariaTracking", Debug.INFO);
			_controller.addEventListener(PdkEvent.OnPlugInsComplete, loadComplete);
		}
		
		private function loadComplete(event:PdkEvent):void 
		{
			_controller.removeEventListener(PdkEvent.OnPlugInsComplete, loadComplete);
			_controller.addEventListener(PdkEvent.OnReleaseStart, onReleaseStart);
			_controller.addEventListener(PdkEvent.OnMediaStart, onMediaStart);
			_controller.addEventListener(PdkEvent.OnMediaPlaying, onMediaPlaying);
			_controller.addEventListener(PdkEvent.OnMediaPause, onMediaPause);
			_controller.addEventListener(PdkEvent.OnMediaUnpause, onMediaUnpause);
			_controller.addEventListener(PdkEvent.OnMediaEnd, onMediaEnd);	
			_controller.addEventListener(PdkEvent.OnReleaseSelected, onReleaseSelected);
		}		

		private function onReleaseStart(e:PdkEvent):void 
		{
			// start a new tracking session
			_digitaria.initialize();

			// try to get the player name from the playlist			
			var playlist:Playlist = e.data as Playlist;
			if (playlist.player != null && playlist.player.length > 0)
			{
				_digitaria.setPlayerName(playlist.player);
			}

			// get the main content and set various properties
			var content:BaseClip = playlist.firstContentBaseClip;
			_digitaria.setVideoName(content.title);
			var length:Number = Math.floor(content.releaseLength / 1000);
			_digitaria.setVideoLength(length);
			_controller.trace("initialized tracking for \"" + content.title + "\" (" + length + "s)", "DigitariaTracking", Debug.INFO);
			
			// TODO
			/*
			_digitaria.setEpisodeName("");
			_digitaria.setPlayerSponsor("");
			_digitaria.setShowName("");
			_digitaria.setVideoTopics();
			*/
			
			//figure out if the release is userInitiated			
			_releaseUserInitiated = false;
			if (_lastSelectedRelease)
			{
				if (playlist.releaseURL.indexOf(_lastSelectedRelease.releaseUrl) == 0)//account for extra query string parameters that may have been tacked on the end
				{
					_releaseUserInitiated = _lastSelectedRelease.userInitiated;
				}
				else
				{
					_controller.trace("Last selected release URL was \"" + _lastSelectedRelease.releaseUrl + "\", which doesn't match current release of \"" + playlist.releaseURL + "\"", "DigitariaTracking", Debug.WARN);
					_releaseUserInitiated = false;
				}
			}
		}	
		
		private function onMediaStart(e:PdkEvent):void 
		{
			_mediaStarted = true;
			var clip:Clip = e.data as Clip;
			var clipLength:Number = clip.length / 1000;
			if (clipLength == 0)
			{
				_controller.trace("Couldn't get clip length", "DigitariaTracking", Debug.WARN);
			}
			_isAd = clip.isAd;
			
			if (_isAd)
			{
				var adPosition:String = DigitariaVideoTrack.AD_PRE_ROLL;
				if (clip.clipIndex != 1)
				{
					adPosition = DigitariaVideoTrack.AD_PRE_ROLL;
				}
				var adTitle:String = clip.title;
				if (!adTitle || adTitle.length == 0)
				{
					adTitle = "No Title Available";
				}
				_controller.trace("calling trackAdStart(" + adTitle + ", " + adPosition + ", " + clipLength + ")", "DigitariaTracking", Debug.INFO);
				_digitaria.trackAdStart(adTitle, adPosition, clipLength);
			}
			else
			{
				var id:String = clip.baseClip.guid;
				if (id == null || id.length == 0) id = clip.baseClip.contentID;
				_controller.trace("calling trackVideoStart(" + _releaseUserInitiated + ", " + id + ")", "DigitariaTracking", Debug.INFO);
				_digitaria.trackVideoStart(_releaseUserInitiated, id);
			}
		}
		
		private function onReleaseSelected(e:PdkEvent):void
		{
			var releaseInfo:Object = e.data;
			_controller.trace("received OnReleaseSelected; releaseURL=" + releaseInfo.releaseUrl + ", userInitiated=" + releaseInfo.userInitiated, "DigitariaTracking", Debug.INFO);
			_lastSelectedRelease = releaseInfo;
		}
				
		 private function onMediaPlaying(e:PdkEvent):void
		 {
			if (!_isAd && _mediaStarted)
			{
				var position:TimeObject = e.data as TimeObject;
				var currentTime:Number = Math.floor(position.currentTime / 1000);
				var duration:Number = Math.floor(position.duration / 1000);
				_digitaria.trackVidProgress(currentTime, duration);
			}
		 }	

		private function onMediaPause(e:PdkEvent):void 
		{
			if (!_isAd && _mediaStarted)
			{
				var currentPos:Number = 0;
				var position:TimeObject = _controller.getCurrentPosition();
				if (position != null) currentPos = Math.floor(position.currentTime / 1000);
				_controller.trace("calling trackVideoPause(" + currentPos + ")", "DigitariaVideoTrack", Debug.INFO);
				_digitaria.trackVideoPause(currentPos);
			}
		}

		private function onMediaUnpause(e:PdkEvent):void
		{
			if (!_isAd && _mediaStarted)
			{
				var clip:Clip = e.data as Clip;
				
				// when the release ends while in paused state (ie, user hits forward button while the player
				// is paused), the player will send an onMediaUnpause event to "reset" the state for the next clip. 
				// The result is a null clip in the payload. We should ignore this event.
				if (!clip) return;
	
				var currentPos:Number = 0;
				var position:TimeObject = _controller.getCurrentPosition();
				if (position != null) currentPos = Math.floor(position.currentTime / 1000)
				_controller.trace("calling trackVideoResume(" + currentPos + ")", "DigitariaVideoTrack", Debug.INFO);
				_digitaria.trackVideoResume(currentPos);
			}
		}		
		
		private function onMediaEnd(e:PdkEvent):void 
		{
			_mediaStarted = false;
			var clip:Clip = e.data as Clip;
			var isComplete:Boolean = (clip.lengthPlayed == clip.trueLength);
			if (_isAd)
			{
				_controller.trace("calling trackAdEnd(" + isComplete + ")", "DigitariaVideoTrack", Debug.INFO);
				_digitaria.trackAdEnd(isComplete);	
			}
			else
			{
				_controller.trace("calling trackVideoEnd(" + isComplete + ")", "DigitariaVideoTrack", Debug.INFO);
				_digitaria.trackVideoEnd(isComplete);
			}
		}		
	}
}
