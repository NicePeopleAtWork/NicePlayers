package com.theplatform.pdk.plugins.forms 
{
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.data.Release;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.plugins.IPlugIn;
	import com.theplatform.pdk.utils.Debug;
	import com.theplatform.pdk.utils.PdkStringUtils;
	import com.theplatform.pdk.utils.Positioning;
	
	import flash.display.DisplayObject;
	import flash.display.Sprite;
	import flash.events.MouseEvent;
	import flash.geom.Rectangle;

	public class CustomLinkForm extends Sprite implements IPlugIn
	{
		private var _lo:LoadObject;
		private var _controller:PlayerController;
		private var _useDefault:Boolean;
		private var _pid:String;
		private var _baseClip:BaseClip;
		public var subPlugin:Object;
		
		public function CustomLinkForm()
		{
			_useDefault = false;
		}
		
		public function initialize(lo:LoadObject):void
		{
			// get the controller
			_lo = lo;
			_controller = _lo.controller as PlayerController;
			
			_controller.addEventListener(PdkEvent.OnPlugInsComplete, handlePlugInsComplete);
		}

		private function handlePlugInsComplete(e:PdkEvent):void
		{
			_controller.trace("Received OnPlugInsComplete", "CustomLinkForm", Debug.INFO)
			_controller.removeEventListener(PdkEvent.OnPlugInsComplete, handlePlugInsComplete);
			
			// load the sub plug-in
			subPlugin = _lo.subPlugInRef;
			if (subPlugin)
			{
				// add event listeners
				_controller.addEventListener(PdkEvent.OnShowLinkForm, handleShowLinkForm);
				_controller.addEventListener(PdkEvent.OnUseDefaultLinkForm, handleUseDefaultLinkForm);
				_controller.addEventListener(PdkEvent.OnReleaseStart, releaseStart);
				_controller.addEventListener(PdkEvent.OnLoadRelease, loadRelease);
				_controller.addEventListener(PdkEvent.OnLoadReleaseUrl, loadRelease);
				_controller.addEventListener(PdkEvent.OnMediaStart,	mediaStart);
				
				addChild(subPlugin as DisplayObject);
				
				subPlugin.setWrapper(this);
				centerPlugin(false);
				
				var closeBtn:Sprite = Sprite(subPlugin.myLinkForm.closeBtn);
				closeBtn.addEventListener(MouseEvent.CLICK, hideMe);
				closeBtn.buttonMode = true;
				
				subPlugin.myLinkForm.visible = false;
				_controller.useDefaultLinkForm(false);	
			}
			
		}

		
		private function releaseStart(e:PdkEvent):void
		{
			_pid = (e.data as Playlist).releasePID;
			_baseClip = null;
		}

		private function loadRelease(e:PdkEvent):void 
		{
			var release:Release = e.data as Release;
			baseClipFromRelease(release);
		}
		
		private function mediaStart(e:PdkEvent):void
		{
			var newClip:BaseClip = (e.data as Clip).baseClip;
			if (!newClip.isAd && !newClip.noSkip)
			{
				_baseClip = (e.data as Clip).baseClip;
			}
		}
		
		private function baseClipFromRelease(release:Release):void
		{
			if (!release) return;
			_pid = release.pid;
			_baseClip = new BaseClip();
			_baseClip.title = release.title;
			_baseClip.description = release.description;
			_baseClip.contentID = (release.id ? release.id.substr(release.id.lastIndexOf("/") + 1) : "");
			_baseClip.guid = release.guid;
		}
		
		private function substituteUrl(url:String):String
		{
			if (!_pid)
			{
				//check to see if there's a current release
				var release:Release = _controller.getCurrentRelease();
				baseClipFromRelease(release);
				if (!_pid)
				{
					_controller.trace("no pid available", "CustomEmailForm", Debug.ERROR);
				}
			}
			var result:String = PdkStringUtils.replaceStr(url, "{releasePID}", _pid);
	 		if (_baseClip == null && _controller.getCurrentPlaylist() != null)
	 		{
	 			_baseClip = _controller.getCurrentPlaylist().firstContentBaseClip;
	 		}
	 		if (_baseClip == null)
	 		{
	 			_controller.trace("couldn't find a content base clip; no title or guid available", "CustomLinkForm", Debug.ERROR);
	 		}
	 		else
	 		{
		 		result = PdkStringUtils.replaceStr(result, "{guid}", _baseClip.guid);
		 		result = PdkStringUtils.replaceStr(result, "{title}", PdkStringUtils.encodeForSeo(_baseClip.title));
	 		}
			return result;
		}
				
		private function hideMe(e:MouseEvent):void
		{
			_controller.trace("Received hideMe", "CustomLinkForm", Debug.INFO);
			_controller.showLinkForm(false)
		}
		
		private function handleShowLinkForm(e:PdkEvent):void
		{
			_controller.trace("Received OnShowLinkForm", "CustomLinkForm", Debug.INFO);
			openForm(Boolean(e.data))
		}
		
		private function openForm(showIt:Boolean):void 
		{	
			_controller.trace("Executing openForm(" + showIt + ")", "CustomLinkForm", Debug.INFO);
			subPlugin.setFormVisible(showIt);
			if (showIt)
			{
				subPlugin.setEmbeddedPlayer(substituteUrl(_controller.getProperty("embeddedPlayerHtml")));
				if (_controller.getProperty("allowLink") != "false")
				{
					subPlugin.setPlayerUrl(substituteUrl(_controller.getProperty("playerUrl")));
				}
				// note that there aren't any substitutions supported on the RSS URL
				subPlugin.setLinkForm(substituteUrl(_controller.getProperty("rssUrl")));							
			}
		}
		 
		private function handleUseDefaultLinkForm(e:PdkEvent):void
		{
			_controller.trace("Received OnUseDefaultLinkForm", "CustomLinkForm", Debug.INFO);
			_useDefault = Boolean(e.data);
		}
		
		private function centerPlugin(isFullScreen:Boolean):void
		{
			var x:int;var y:int;var w:int;var h:int;
			if (isFullScreen)
			{
				x = 0;
				y = 0;
				w = this.stage.width;
				h = this.stage.height;
			}
			else
			{
				var dimensions:Rectangle = _controller.getMediaArea();
				x = dimensions.x;
				y = dimensions.y;
				w = dimensions.width;
				h = dimensions.height;
			}			
			_controller.trace("Video area is [" + w + "x" + h + "], starting at [" + x + ", " + y + "]", "CustomEmailForm", Debug.INFO);
			
			// Re-center the form, using a helper function from the Positioning library
			Positioning.alignDisplayObject(DisplayObject(subPlugin), {x:x,y:y,width:w,height:h}, "MM");
		}
	}
}

