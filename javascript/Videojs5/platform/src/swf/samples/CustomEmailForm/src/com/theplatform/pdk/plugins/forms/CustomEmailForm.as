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

	public class CustomEmailForm extends Sprite implements IPlugIn
	{
		private var _lo:LoadObject;
		private var _controller:PlayerController;
		private var _useDefault:Boolean;
		private var _pid:String;
		private var _baseClip:BaseClip;
		
		public var subPlugin:Object;
		
		public function CustomEmailForm()
		{
			_useDefault = false;
		}
		
		public function initialize(lo:LoadObject):void
		{
			// get the controller	
			_lo = lo;
			_controller = _lo.controller as PlayerController;

			// add event listeners
			_controller.addEventListener(PdkEvent.OnPlugInsComplete, handlePlugInsComplete);
		}

		private function handlePlugInsComplete(e:PdkEvent):void
		{
			_controller.trace("Received OnPluginsComplete", "CustomEmailForm", Debug.INFO)
			_controller.removeEventListener(PdkEvent.OnPlugInsComplete, handlePlugInsComplete);
					
			// load the sub-plugin
			subPlugin = _lo.subPlugInRef;
			if (subPlugin)
			{
				//Don't add event listeners until after we know we have a valid supPlugin
				_controller.addEventListener(PdkEvent.OnShowEmailForm, handleShowEmailForm);
				_controller.addEventListener(PdkEvent.OnUseDefaultEmailForm, handleUseDefaultEmailForm);
				_controller.addEventListener(PdkEvent.OnReleaseStart, releaseStart);
				_controller.addEventListener(PdkEvent.OnLoadRelease, loadRelease);
				_controller.addEventListener(PdkEvent.OnLoadReleaseUrl, loadRelease);
				_controller.addEventListener(PdkEvent.OnMediaStart,	mediaStart);
				_controller.trace("Initialized CustomEmailForm plug-in","CustomEmailForm", Debug.INFO);
				
				addChild(subPlugin as DisplayObject);
				subPlugin.setWrapper(this);
				centerPlugin(false);
				
				var cancelBtn:Sprite = Sprite(subPlugin.myEmailForm.cancelBtn);
				cancelBtn.addEventListener(MouseEvent.CLICK, hideMe);
				cancelBtn.buttonMode = true;
				
				var submitBtn:Sprite = Sprite(subPlugin.myEmailForm.submitBtn);
				submitBtn.addEventListener(MouseEvent.CLICK, hideMe);
				submitBtn.buttonMode = true;
				
				subPlugin.myEmailForm.visible = false;
				_controller.useDefaultEmailForm(false);
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
	 		if (!_baseClip && _controller.getCurrentPlaylist())
	 		{
	 			_baseClip = _controller.getCurrentPlaylist().firstContentBaseClip;
	 		}
	 		if (!_baseClip)
	 		{
	 			_controller.trace("couldn't find a content base clip; no title or guid available", "CustomEmailForm", Debug.ERROR);
	 		}
	 		else
	 		{
		 		result = PdkStringUtils.replaceStr(result, "{guid}", _baseClip.guid);
		 		result = PdkStringUtils.replaceStr(result, "{title}", PdkStringUtils.encodeForSeo(_baseClip.title));
	 		}
			return result;
		}
				
		private function sendEmail():void
		{
			var emailServiceURL:String = _controller.getProperty("emailServiceUrl");
	 		if (emailServiceURL)
	 		{
	 			var playerURL:String = _controller.getProperty("playerUrl");
	 			var substPlayerURL:String = substituteUrl(playerURL);
	 		}
	 		_controller.trace("emailServiceURL:       " + emailServiceURL, "CustomEmailForm", Debug.INFO);
	 		_controller.trace("playerURL:             " + playerURL, "CustomEmailForm", Debug.INFO);
	 		_controller.trace("substituted playerURL: " + substPlayerURL, "CustomEmailForm", Debug.INFO);
	 		
	 		// now put in the code that sends the email...
		}
		
		private function hideMe(e:MouseEvent):void
		{
			_controller.trace("Received hideMe", "CustomEmailForm", Debug.INFO);
			_controller.showEmailForm(false);
		}
		
		private function handleShowEmailForm(e:PdkEvent):void
		{
			_controller.trace("Received OnShowEmailForm", "CustomEmailForm", Debug.INFO);
			openForm(Boolean(e.data));
		}

		private function openForm(b:Boolean):void 
		{	
			_controller.trace("Executing openForm(" + b + ")", "CustomEmailForm", Debug.INFO);
			subPlugin.myEmailForm.visible = b 
			
			// for testing only
			if (b) sendEmail();
		}
		 
		private function handleUseDefaultEmailForm(e:PdkEvent):void
		{
			_controller.trace("Received OnUseDefaultEmailForm", "CustomEmailForm", Debug.INFO);
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

