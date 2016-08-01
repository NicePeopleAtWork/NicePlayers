// This handles all communication between this component and the
// rest of the PDK

package com.theplatform.pdk.views.mediators
{
	import com.theplatform.pdk.controllers.ReleaseListController;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.data.Release;
	import com.theplatform.pdk.data.ReleaseFeed;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.functions.PdkFunctions;
	import com.theplatform.pdk.utils.Debug;
	import com.theplatform.pdk.utils.PdkStringUtils;
	
	public class ReleaseListTemplateMediator
	{
		private var _controller:ReleaseListController;
		private var _loadComplete:Boolean;
		private var _firstModel:Boolean = true;	
		private var _viewEnabled:Boolean = true;
		private var _autoPlay:Boolean;
		private var _autoLoad:Boolean;
		private var _playAll:Boolean;
		private var _selectedPid:String;
		
		public function ReleaseListTemplateMediator(c:ReleaseListController)
		{
			_controller = c;
			init();
		}
		
		private function init():void
		{
			_controller.trace("Initializing ReleaseListTemplateMediator", null, Debug.INFO);
			
			//register global functions
			_controller.registerFunction(PdkFunctions.playNext, this, playNext)
			_controller.registerFunction(PdkFunctions.playPrevious, this, playPrevious);
			_controller.registerFunction(PdkFunctions.suspendPlayAll, this, suspendPlayAll);
			
			// register various listeners
			_controller.addEventListener(PdkEvent.OnPlugInsComplete, loadComplete);
			_controller.addEventListener(PdkEvent.OnRefreshReleaseModel, modelCompleteHandler);
			_controller.addEventListener(PdkEvent.OnMediaStart, mediaStart);
			_controller.addEventListener(PdkEvent.OnMediaEnd, mediaEnd);
			_controller.addEventListener(PdkEvent.OnSetReleaseUrl, onSetReleaseUrl);
			_controller.addEventListener(PdkEvent.OnLoadRelease, onLoadRelease);
			_controller.addEventListener(PdkEvent.OnReleaseEnd, onReleaseEnd);
			_controller.addEventListener(PdkEvent.OnLoadReleaseUrl, onLoadRelease);
			
			// if various properties are missing, set them to a default value			
			_autoPlay = _controller.getProperty("autoPlay") == "false" ? false : true;
			_autoLoad = _controller.getProperty("autoLoad") == "false" ? false : true;
			_playAll = _controller.getProperty("playAll") == "false" ? false : true;
			_selectedPid = _controller.getProperty("selectedPid");
			
			// If the autoPlay FlashVar is absent, then the first clip will begin  
			// playing automatically unless the value of playAll is false.
			if ((_controller.getProperty("autoPlay") == null) && !_playAll) {
				_autoPlay = false;
			}
		}
		
		// Called either when a user explicitly clicks "Next" in the player, or when the current
		// clip plays to completion.  In the first case, "naturalEnd" will be false, otherwise
		// it's true.  "wrap" is true if the user wants to wrap around at the end of the
		// release list.
		private function playNext(wrap:Boolean, naturalEnd:Boolean):void
		{
			_controller.trace("playNext(" + wrap + ", " + naturalEnd + ")", null, Debug.INFO);
			_controller.trace("// TODO get the next release to play, based on wrap setting", null, Debug.WARN);
			if (!naturalEnd || _playAll)
			{
				_controller.trace("// TODO if there's a next release, make a \"setRelease\" call", null, Debug.WARN);
				return;
			}
			else
			{
				_controller.trace("// TODO if there's a next release, make a \"loadReleaseURL\" call", null, Debug.WARN);
				return;
			}
			_controller.trace("// TODO warm the last release in the list", null, Debug.WARN);
		}
		
		// Called when the user clicks "Previous" in the player.  "wrap" is true if the user wants
		// to wrap around at the beginning of the list
		private function playPrevious(wrap:Boolean):void
		{
			_controller.trace("playPrevious(" + wrap + ")", null, Debug.INFO);
			_controller.trace("// TODO make a \"setRelease\" call for the previous clip", null, Debug.WARN);
		}
		
		// Called when the user wants to turn off play all, for example in the community controls,
		// when a user is in the middle of a comment; they don't want the player to go to the
		// next clip, canceling their edits.  This function is complete; you don't need to modify it.
		private function suspendPlayAll(suspend:Boolean):void
		{
			_controller.trace("suspendPlayAll(" + suspend + ")", null, Debug.INFO);
			_playAll = suspend ? false : true;
		}
		
		// Called when a release URL gets set on the player.
		private function onSetReleaseUrl(e:PdkEvent):void
		{
			var url:String = String(e.data);
			if(!url || url == '') 
				return;
			var pid:String = PdkStringUtils.getPIDFromUrl(url);
			_controller.trace("OnSetReleaseURL(pid=" + pid + ")", null, Debug.INFO);
			_controller.trace("// TODO select the corresponding release item in your list, if it's visible", null, Debug.WARN);			
		}
		
		// Called when the player is primed with a release.
		private function onLoadRelease(e:PdkEvent):void
		{
			var pid:String = (e.data as Release).pid;
			_controller.trace("OnLoadRelease(pid=" + pid + ")", null, Debug.INFO);			
			_controller.trace("// TODO select the corresponding release item in your list, if it's visible", null, Debug.WARN);			
		}
		
		// Called when a release finishes.
		private function onReleaseEnd(e:PdkEvent):void
		{		
			var pid:String = (e.data && Playlist(e.data).hasOwnProperty("releasePID")) ? Playlist(e.data).releasePID : null;
			if(!pid || pid == '') 
				return;
			_controller.trace("OnReleaseEnd(pid=" + pid + ")", null, Debug.INFO);
			_controller.trace("// TODO deselect the release if it was selected", null, Debug.WARN);			
		}
		
		// Called when media starts.
		private function mediaStart(e:PdkEvent):void
		{
			var clip:Clip = e.data as Clip;
			_controller.trace("OnMediaStart(noSkip=" + clip.noSkip + ")", null, Debug.INFO);				
			if (clip.noSkip)
			{
				_viewEnabled = false;
				_controller.trace("// TODO draw the release list as disabled", null, Debug.WARN);			
			}
		}
		
		// Called when media ends
		private function mediaEnd(e:PdkEvent):void
		{
			_controller.trace("OnMediaEnd", null, Debug.INFO);
			if(!_viewEnabled)
			{
				_viewEnabled = true;
				_controller.trace("// TODO draw the release list as enabled", null, Debug.WARN);			
			} 
		}
		
		// Called when all plug-ins are loaded
		protected function loadComplete(e:PdkEvent):void
        {
        	_controller.trace("OnPlugInsComplete", null, Debug.INFO);
        	_controller.removeEventListener(PdkEvent.OnPlugInsComplete, loadComplete);
			_loadComplete = true;
			_controller.trace("// TODO any extra initialization", null, Debug.WARN);			
        }

		// Called whenever the underlying list of releases changes
		protected function modelCompleteHandler(e:PdkEvent):void
		{
			_controller.trace("OnRefreshReleaseModel", null, Debug.INFO);
			
			// check for errors
			var releaseFeed:ReleaseFeed = e.data as ReleaseFeed;
			if (releaseFeed.isError)
			{
				// Handle Error
				_controller.trace("ReleaseFeed has error: "+ releaseFeed.error, "ReleaseListMediator", Debug.ERROR);
				return;
			}
			
			// TODO parse items.  The stuff below just shows the basics of how to iterate over the
			// items for their metadata.
			var entries:Array = releaseFeed.entries as Array;
			_controller.trace("There are " + entries.length + " item(s) to render", null, Debug.INFO);
			
			// Print out the releases
			for (var i:int = 0; i < entries.length; i++)
			{
				var release:Release = entries[i] as Release;
				_controller.trace("release #" + i + ": " + release, null, Debug.INFO);	
			}
			
			_controller.trace("// TODO render items", null, Debug.WARN);			

			// track whether this was the first model loaded
			var selectedRelease:Release = entries[0] as Release;
			if(_firstModel)
			{
				_firstModel = false;			
				if (_selectedPid)
				{
					_controller.trace("// TODO check if _selectedPid matches one of the passed-in release PIDs, and if it does, change the selected release", null, Debug.WARN);			
				}				
				
				// check if we should load a release
				if (!_autoPlay && _autoLoad)
				{
					// if this is a play all list, become the new default release list	
					if (_playAll)
					{
						_controller.setCurrentReleaseList(_controller.id);	
					}
					_controller.loadReleaseURL(selectedRelease.url);
				}
				// otherwise check if it's auto-play; if it is, send the release to the player
				else if (_autoPlay)
				{
					_controller.setRelease(selectedRelease, false);
				}
			}
		}
	}
}
