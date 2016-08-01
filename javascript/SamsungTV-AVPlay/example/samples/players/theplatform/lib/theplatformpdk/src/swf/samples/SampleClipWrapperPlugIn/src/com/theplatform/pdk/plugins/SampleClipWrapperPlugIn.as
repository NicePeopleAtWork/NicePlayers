package com.theplatform.pdk.plugins 
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.Annotation;
	import com.theplatform.pdk.data.Banner;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.ClipWrapper;
import com.theplatform.pdk.data.CustomData;
import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.data.StreamType;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.events.PlayerEvent;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.events.Event;
	import flash.events.TimerEvent;
	import flash.geom.Rectangle;
	import flash.utils.Timer;

	public class SampleClipWrapperPlugIn extends NoOpPlugIn implements IClipWrapperPlugIn
	{
		private var _controller:IPlayerController;
		private var _mockLoader:Timer;
		private var _wrapper:ClipWrapper;
		private var _scrubberTimer:Timer;
		private var _startClipTimer:Timer;
		private var _loaderTimer:Timer;
		private var _soundLevel:Number;
		private var _muted:Boolean;
		private var _position:Number;
		private var _paused:Boolean;
		private var _currentAd:Clip;
		private var _clip:Clip;
		private var _loadPercentage:Number;
		private var _dynamicMidRollTimes:Array;
		private var _dynamicMidRollIndex:Number;
		private const _class:String = "SampleClipWrapperPlugIn";
		private const _adUrl:String = "http://ads.sampleclipwrapperplugin.com";
		private static const SAMPLECLIPWRAPPERANNOTATIONTYPE:Number = Math.floor(Math.random() * 100000);
		
		// storage for ads returned from the server
		private var _preRoll:Clip;
		private var _midRolls:Array;
		private var _postRoll:Clip;
		
		public function SampleClipWrapperPlugIn()
		{
		}
		
		override public function initialize(lo:LoadObject):void
		{
			super.initialize(lo);
			_controller = lo.controller as IPlayerController;
			
			_controller.addEventListener(PdkEvent.OnMediaLoadStart, handleMediaLoadStart);
			_controller.addEventListener(PdkEvent.OnAnnotationPlayed, handleAnnotationPlayed);
			_controller.addEventListener(PdkEvent.OnAnnotationSeeked, handleAnnotationPlayed);
			_controller.addEventListener(PdkEvent.OnMediaStart, handleMediaStart);
			_controller.addEventListener(PdkEvent.OnGetAnnotations, handleGetAnnotations);
			_controller.trace("registering wrapper component with priority [" + lo.priority + "]", _class, Debug.INFO);
			_controller.registerClipWrapperPlugIn(this, lo.priority);		
		}
				
		// this is called by the controller on every clip
		public function wrapClip(wrapper:ClipWrapper):Boolean
		{
			// if it's an ad, no wrapping
			if (wrapper.clip.baseClip.isAd)
			{
				return false;
			}

			_clip = wrapper.clip;
			var clip:Clip = _clip;

			// if it's the first clip in a release, call the ad server to get ads
			if (clip.chapter.index == 0)
			{
				_controller.trace("simulating ad server call for [" + clip.title + "]", _class, Debug.INFO);
				getAdsFromServer(wrapper);
			}
			// if it's the last chapter, add any mid-roll and/or post-roll
			else if (clip.chapter.index == clip.chapter.chapters.chapters.length - 1)
			{
				addMidRoll(clip, wrapper);
				addPostRoll(wrapper);
				_controller.setClipWrapper(wrapper);
			}
			// otherwise it must be middle chapter... add a mid-roll
			else
			{
				addMidRoll(clip, wrapper);
				_controller.setClipWrapper(wrapper);
			}
			
			// now lets figure out where to put the dynamic midroll (half way through)
			(_controller as IPlayerController).getAnnotations();
			
			return true;
		}
		
		protected function handleGetAnnotations(e:PdkEvent):void
        {
			if (!_clip) return;//we aren't worried about it yet

            var annotations:Array = e.data as Array;

			if (annotations)
            {
				for (var i:Number=0; i<annotations.length; i++)
                {
					// if there are any of ours, no need to add them again
					if ( (annotations[i] as Annotation).type == SAMPLECLIPWRAPPERANNOTATIONTYPE )
                    {
						return;
					}
				}
				
				_dynamicMidRollTimes = [_clip.length / 2];
				_dynamicMidRollIndex = 0;
			} 
		}
		
		protected function getAdsFromServer(wrapper:ClipWrapper):void
		{
			// store the wrapper for use in the callback
			_wrapper = wrapper;
			
			// simulate an async process with a timer
			var timer:Timer = new Timer(300, 1);
			timer.addEventListener(TimerEvent.TIMER, onAdsLoaded);
			timer.start();
		}
		
		protected function onAdsLoaded(e:Event):void
		{
			_controller.trace("processing simulated ad server response", _class, Debug.INFO);

			// here's where you'd parse your ad server response into pre-rolls, an array of
			// mid-rolls, and a post-roll
			_preRoll = getNoOpClip(_adUrl + "/pre/0xFF0000");
			_midRolls = new Array(getNoOpClip(_adUrl + "/mid/0x00FF00"), getNoOpClip(_adUrl + "/mid/0x0000FF"));
			_postRoll = getStandardClip();
		
			// add the pre-roll
			addPreRoll(_wrapper);
			
			// add the post-roll, but only if there aren't any avails for mid-rolls.
			// if there are chapters, we'll save the post roll for the final chapter
			if (!_wrapper.clip.chapter || _wrapper.clip.chapter.chapters.chapters.length == 1)
			{
				addPostRoll(_wrapper);
			}
			
			// everything ready; start playback again
			_controller.setClipWrapper(_wrapper);
		}
		
		protected function addPreRoll(wrapper:ClipWrapper):void
		{
			if (_preRoll != null)
			{
				_controller.trace("Adding pre-roll", _class, Debug.INFO);
				wrapper.preRolls = createPlaylist(_preRoll, "preroll");
			}			
		}

		protected function addMidRoll(clip:Clip, wrapper:ClipWrapper):void
		{
			if (_midRolls != null && _midRolls.length > 0)
			{
				var midRollIndex:int = clip.chapter.index % _midRolls.length;
				_controller.trace("Attaching mid-roll #" + midRollIndex + " as pre-roll", _class, Debug.INFO);
				wrapper.preRolls = createPlaylist(_midRolls[midRollIndex], "midroll " + midRollIndex);
			}
		}

		protected function addPostRoll(wrapper:ClipWrapper):void
		{
			if (_postRoll != null)
			{
				_controller.trace("Adding post-roll", _class, Debug.INFO);
				wrapper.postRolls = createPlaylist(_postRoll, "postroll");
			}			
		}
				
		protected function showAnnotations():void {
			(_controller as IPlayerController).addAnnotation(new Annotation(_clip.length / 2, SAMPLECLIPWRAPPERANNOTATIONTYPE));
		}
				
		protected function hideAnnotations():void {
			(_controller as IPlayerController).clearAnnotations();
		}
				
		protected function handleMediaStart(e:PdkEvent):void {
			_controller.trace("OnMediaStart called", _class, Debug.INFO);	
			var clip:Clip = e.data as Clip;
			if (clip == _clip) {
				// its our main content clip... show the annotations!
				showAnnotations();
			}
			else {
				hideAnnotations();
			}
		}
				
		protected function handleMediaLoadStart(e:PdkEvent):void
		{
			_controller.trace("OnMediaLoadStart called", _class, Debug.INFO);	
			var clip:Clip = e.data as Clip;
			if (clip.streamType != StreamType.EMPTY)
			{
				_controller.trace("Not an empty stream type; ignore", _class, Debug.INFO);
			}
			else if (clip.baseClip.URL.indexOf(_adUrl) != 0)
			{
				_controller.trace("Empty stream type, but not from this plug-in; ignore", _class, Debug.INFO);				
			}
			else
			{
				_controller.trace("URL is \"" + clip.baseClip.URL + "\"; handle it", _class, Debug.INFO);
				loadStartChecked(true);//we must tell the bridge that we've found the clip we want to play--this prevents us from getting events from other no-op clips that we may not want to hear from
				playAd(clip);
			}		
		}
		
		protected function handleAnnotationPlayed(e:PdkEvent):void {
			var annotation:Annotation = e.data as Annotation;
			
			if (!_wrapper || (_controller.getCurrentClip() != _wrapper.clip)) {
				return;
			}

			if (!_dynamicMidRollTimes || _dynamicMidRollTimes.length <= _dynamicMidRollIndex) {
				return;
			}
			
			if (annotation.type == SAMPLECLIPWRAPPERANNOTATIONTYPE) {
				var midroll:Clip = getNoOpClip(_adUrl + "/pre/0xFF00FF");
				var playlist:Playlist = createPlaylist(midroll, "injected midroll");
				_controller.injectPlaylist(playlist);
			}
		}
		
		// play a no-op clip.  typically this is where an ad plug-in would bring up
		// its own ad SWF, and draw what it needs to draw.
		protected function playAd(clip:Clip):void
		{
			_currentAd = clip;
			_controller.trace("Playing ad \"" + clip.baseClip.URL + "\"", _class, Debug.INFO);
			
			// register for changes in media area
			_controller.addEventListener(PlayerEvent.OnMediaAreaChanged, mediaAreaChanged);
			
			// assume a 15 second ad
			_currentAd.length = 15000;
			_currentAd.mediaLength = 15000;
			
			// reset the scrubber and play/pause state
			_position = 0;
			_loadPercentage = 0;
			_paused = false;
						
			// get the current states of volume and mute
			_muted = _controller.getMuteState();
			_soundLevel = _controller.getSoundLevel();
			
			// draw a placeholder for where the ad plug-in would display
			positionPlayer(_controller.getMediaArea());
			
			//we need to mock up the loading of the media, generally it will take a few milliseconds for the media to load in and start
			//mediaStarts can't be called in the same synchronous call stack as the OnMediaLoadStart, as the player will not have properly initialized yet.
			if (!_startClipTimer)
			{
				_startClipTimer = new Timer(25, 1);
				_startClipTimer.addEventListener(TimerEvent.TIMER, startClipTick, false, 0, true);
			}
			_startClipTimer.start();
		}
		
		protected function startClipTick(e:TimerEvent):void
		{
			_startClipTimer.reset();
			doMediaStart();
		}
		
		protected function doMediaStart():void
		{
			// set up a faux timer for updating the scrubber position
			if (!_scrubberTimer)
			{
				_scrubberTimer = new Timer(300);
				_scrubberTimer.addEventListener(TimerEvent.TIMER, scrubTick, false, 0, true);
			}
			
			// set up a faux timer for updating the load progress position
			if (!_loaderTimer)
			{
				_loaderTimer = new Timer(500);
				_loaderTimer.addEventListener(TimerEvent.TIMER, loadTick, false, 0, true);
			}
			
			// tell the controller that the media has started
			_controller.trace("Calling \"mediaStarts\"", _class, Debug.INFO);
			mediaStarts();

			// keep the scrubber chugging along
			_scrubberTimer.start();

			// show load progress
			_loaderTimer.start();
		}
		
		protected function scrubTick(e:TimerEvent):void
		{
			if (!_paused)
			{
				_position += 300;
			}					
			if (_position >= _currentAd.mediaLength)
			{
				_controller.trace("Ad is done playing", _class, Debug.INFO);
				adComplete();
			}
			else
			{					
				_controller.trace("Calling \"mediaPlaying(" + _position + ")\"", _class, Debug.INFO);
				mediaPlaying(_position);
			}
		}
		
		protected function loadTick(e:TimerEvent):void
		{
			if (_loadPercentage < 100)
			{
				_loadPercentage += 10;
				_controller.trace("Calling \"mediaLoading(" + _loadPercentage + ", 100)\"", _class, Debug.INFO);
				mediaLoading(_loadPercentage, 100);
			}
			else
			{
				_loaderTimer.stop();
			}
		}
		
		protected function mediaAreaChanged(e:PlayerEvent):void
		{
			_controller.trace("Received \"onMediaAreaChanged\"", _class, Debug.INFO);
			positionPlayer(e.data as Rectangle);
		}
		
		protected function positionPlayer(mediaArea:Rectangle):void
		{				
			// here's where you'd show your plug-in; this sample just draws a picture
			_controller.trace("Positioning player at [" + mediaArea.x + ", " + mediaArea.y + "], " + mediaArea.width + "w x " + mediaArea.height + "h", _class, Debug.INFO);
			this.graphics.clear();
			var color:Number = 0xFFFFFF;
			try
			{
				color = new Number(_currentAd.baseClip.URL.substr(_adUrl.length + 5));
			}
			catch (e:Error)
			{
				_controller.trace("Could not parse color from \"" + _currentAd.baseClip.URL + "\"", _class, Debug.WARN);
			}
			this.graphics.beginFill(color, 0.5);
			this.graphics.drawEllipse(mediaArea.x, mediaArea.y, mediaArea.width, mediaArea.height);
			this.graphics.endFill();
			showState();
		}
		
		protected function showState():void
		{
			_controller.setPlayerMessage("Mute=" + _muted + ", Volume=" + _soundLevel, 0);				
		}
		
		// clean up
		protected function cleanUp():void
		{
			loadStartChecked(false);//turn off the bridge, no more messages to or from
			this.graphics.clear();
			_controller.clearPlayerMessage();
			_scrubberTimer.stop();
			_loaderTimer.stop();
			_controller.removeEventListener(PlayerEvent.OnMediaAreaChanged, mediaAreaChanged);			
		}
		
		// ad is done
		protected function adComplete():void
		{
			_controller.trace("Calling \"mediaEnds\"", _class, Debug.INFO);
			mediaEnds();//mediaEnds must be called before cleanup here, or it won't be sent (since the bridge gets turned off in cleanup)
			cleanUp();
		}
				
		// called when an external event ends playback
		override public function mediaEndSet():void
		{
			_controller.trace("mediaEndSet()");
			cleanUp();
		}
		
		// called when the sound level is set externally
		override public function mediaSoundLevelSet(level:Number):void
		{
			_controller.trace("mediaSoundLevelSet(" + level + ")", _class, Debug.INFO);
			_soundLevel = level;
			showState();
		}
		
		// called when mute/unmute is called externally
		override public function mediaMuteSet(isMuted:Boolean):void
		{
			_controller.trace("mediaMuteSet(" + isMuted + ")", _class, Debug.INFO);
			_muted = isMuted;
			showState();
		}
		
		// called when seek is called externally
		override public function mediaSeekSet(position:int):void
		{
			_controller.trace("mediaSeekSet(" + position + ")", _class, Debug.INFO);
			_position = position;
		}
		
		// called when play/pause is called externally
		override public function mediaPauseSet(isPaused:Boolean):void
		{
			_controller.trace("mediaPauseSet(" + isPaused + ")", _class, Debug.INFO);
			_paused = isPaused;
			if (_paused)
			{
				_scrubberTimer.stop();
			}
			else
			{
				_scrubberTimer.start();
			}
		}		
		
		// create a no-op clip
		private function getNoOpClip(url:String):Clip
		{
			var baseClip:BaseClip = new BaseClip();
			baseClip.URL = url;
			// uncommented, but just for showing integration with the control rack.
			//baseClip.noSkip = true;
			baseClip.isAd = true;
			baseClip.noSkip = true;
			var largeBanner:Banner = new Banner();
			largeBanner.src = "http://ne.edgecastcdn.net/0008B0/mps/PSAPI_Ads/162/156/panteneLarge__529775.jpg";
			largeBanner.href = "http://www.pantene.com";
			var smallBanner:Banner = new Banner();
			smallBanner.src = "http://ne.edgecastcdn.net/0008B0/mps/PSAPI_Ads/162/156/panteneSmall.jpg";
			smallBanner.href = "http://www.pantene.com";
			baseClip.banners = new Array();
			baseClip.banners.push(largeBanner);
			baseClip.banners.push(smallBanner);
            //add customData:
            var cd:CustomData = new CustomData(null);
            cd.addValue("test:ClipWrapper", "no-op clip");
            baseClip.contentCustomData = cd;

			var clip:Clip = _controller.createClipFromBaseClip(baseClip);//make sure the clip is set up correctly from the baseclip
			clip.streamType = StreamType.EMPTY;
			return clip;			
		}
		
		// create a standard clip
		private function getStandardClip():Clip
		{
			var baseClip:BaseClip = new BaseClip();
			baseClip.URL = "http://ne.edgecastcdn.net/0008B0/mps/PSAPI_Ads/162/153/CrestWS_PGCW0287-300k__193285.flv";
			baseClip.noSkip = true;
			baseClip.isAd = true;
			var largeBanner:Banner = new Banner();
			largeBanner.src = "http://ne.edgecastcdn.net/0008B0/mps/PSAPI_Ads/162/153/crestLarge.jpg";
			largeBanner.href = "http://www.crest.com";
			var smallBanner:Banner = new Banner();
			smallBanner.src = "http://ne.edgecastcdn.net/0008B0/mps/PSAPI_Ads/162/153/crestSmall.jpg";
			smallBanner.href = "http://www.crest.com";
			baseClip.banners = new Array();
			baseClip.banners.push(largeBanner);
			baseClip.banners.push(smallBanner);
            //add customData: you may need to check if the customData already exists, you don't want to overwrite it.
            var cd:CustomData = new CustomData(null);
            cd.addValue("test:ClipWrapper", "standard clip");
            baseClip.contentCustomData = cd;

			return _controller.createClipFromBaseClip(baseClip);//make sure the clip is set up correctly from the baseclip
		}
		
		// return a simple playlist with a single clip
		private function createPlaylist(clip:Clip, type:String):Playlist
		{
			var playlist:Playlist = new Playlist();
            //add customData: you may need to check if the customData already exists, you don't want to overwrite it.
            var cd:CustomData = new CustomData(null);
            cd.addValue("test:PlaylistType", type);
            playlist.customData = cd;
			playlist.addClip(clip);
			return playlist;			
		}
	}
}
