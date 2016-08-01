/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins.ad
{
	import com.google.ads.instream.api.AdError;
	import com.google.ads.instream.api.AdErrorEvent;
	import com.google.ads.instream.api.AdEvent;
	import com.google.ads.instream.api.AdLoadedEvent;
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.Banner;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.HyperLink;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.data.StreamType;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.events.PlayerEvent;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.display.Graphics;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.geom.Rectangle;
	import flash.media.Video;
	
	public class InStreamVideoAd extends Sprite
	{
		private var _controller:IPlayerController;
		private var _videoAd:IVideoAd;
		private var _netStreamManager:NetStreamManager;
		
		private var _video:Video = new Video();
		private var _clip:Clip;
		
		private var _clickArea:Sprite;
		private var _mediaArea:Rectangle;
		
		private var _formsUp:Number = 0;
		private var _started:Boolean = false;


		public function InStreamVideoAd(controller:IPlayerController)
		{
			_controller = controller;
		}
				
		public function start(videoAd:IVideoAd):void
		{
			_video.visible = false; // ...but is visible after video is resized
			_mediaArea = _controller.getOverlayArea();
			_videoAd = videoAd;

			createClickArea();
            sizeClickArea();
            _videoAd.videoAdsManager.clickTrackingElement = _clickArea;


			addChild(_video);
			addChild(_clickArea);
			
			
			//_controller.addEventListener(PdkEvent.OnMediaError,		onMediaError);
			_controller.addEventListener(PdkEvent.OnMediaLoadStart, onMediaLoadStart);
			_controller.addEventListener(PlayerEvent.OnMediaAreaChanged, onMediaAreaChanged);
			_controller.addEventListener(PlayerEvent.OnOverlayAreaChanged, onMediaAreaChanged);
			_controller.addEventListener(PdkEvent.OnShowFullScreen, onFullscreen);
			_controller.setPlugInsAboveControls(false);
		}
		
		public function createBaseClip(noSkip:Boolean):BaseClip
		{
			//_controller.trace("Preparing clip for ad ID [" + _videoAd.getDartId() + "]", "InStream");
			var bc:BaseClip = new BaseClip();
			
			bc.URL = "";
			bc.author = _videoAd.getAuthor();
			bc.title = _videoAd.getTitle();
			if (!bc.title || bc.title == "")
			{
				var url:String = _videoAd.getFlvURL();
				bc.title = url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf(".")); 
			}
			bc.isAd = true;
			bc.noSkip = noSkip;
			
			var clickString:String	= _videoAd.getClickString();
	 		if (clickString)
	   		{
				var thirdPartyClickURL:String = _videoAd.getThirdPartyClickURL();
			
				var trackingURLs:Array = new Array();
				if (thirdPartyClickURL) 
					trackingURLs.push(thirdPartyClickURL);
				
				bc.moreInfo = new HyperLink();
				bc.moreInfo.href = clickString;
				bc.moreInfo.clickTrackingUrls = trackingURLs;
	   		}
	   		
			return bc;
		}
				
		private function cleanUp():void
		{
			_clip = null;
			if (_netStreamManager) _netStreamManager.end();
			_videoAd = null;
			_controller.removeEventListener(PdkEvent.OnMediaError, onMediaError);
			_controller.removeEventListener(PdkEvent.OnMediaLoadStart, onMediaLoadStart); // should be only PDK event		
		}
		
		public function get isPresent():Boolean
		{
			return (_videoAd != null);
		}
		
		public function getRoadblockURL(url:String):String
		{
			return _videoAd.getRoadblockURL(url);
		}

		public function get video():Video
		{
			return _video;
		}
		
				
		////////////////////////////
		//	DartInStreamAd Events
		////////////////////////////
		
		private function onError(e:AdErrorEvent):void
		{
			_controller.trace("ERROR: " + e.error.errorMessage, "InStreamAd", Debug.ERROR)
			_controller.trace("Unable to load InStreamVideo","InStreamAd", Debug.ERROR)
			_netStreamManager.error();
		}

		/////////////////
		//	PDK Events
		/////////////////
		

		private function onMediaLoadStart(e:PdkEvent):void
		{
			_clip = e.data as Clip;

			_controller.trace("OnMediaLoadStart received","InStreamAd");
			_controller.removeEventListener(PdkEvent.OnMediaLoadStart, onMediaLoadStart);
			
			_started = false;

			_videoAd.addEventListener(AdEvent.STARTED, onVideoStart, false, 0, true);
			_videoAd.addEventListener(AdEvent.COMPLETE, onVideoEnd, false, 0, true);
			_videoAd.addEventListener(AdEvent.STOPPED, onVideoStopped, false, 0, true);
			_videoAd.addEventListener(AdErrorEvent.AD_ERROR, onError, false, 0, true);
			
			// start the video...	        
			var pdkVideoPlayback:PdkVideoPlayback = new PdkVideoPlayback(_videoAd);
			_netStreamManager = new NetStreamManager(_controller, pdkVideoPlayback, _clip, _video);
		}
		
		private function onVideoStart(e:Event):void
		{
			_controller.trace("onVideoStart","InStreamAd");
			if (!_started)
			{
				_controller.trace("calling netStreamManager.start()","InStreamAd");
				_started = true;
				_netStreamManager.start();
	        	if (_clickArea) _clickArea.visible = true;
			}
		}
		
		private function onVideoEnd(e:Event):void
		{
        	if (_videoAd)
        	{
				_videoAd.removeEventListener(AdEvent.STARTED, onVideoStart);
				_videoAd.removeEventListener(AdEvent.COMPLETE, onVideoEnd);
				_videoAd.removeEventListener(AdEvent.STOPPED, onVideoStopped);
				_videoAd.removeEventListener(AdErrorEvent.AD_ERROR, onError);
        	}
        	if (_netStreamManager.isActive)
        		_netStreamManager.end();
        		
        	if (_video) _video.visible = false;
        	if (_clickArea) _clickArea.visible = false;
		}

        private function onVideoStopped(e:Event):void
        {
            _controller.trace("OnVideoStopped called.  We're not shutting down the connection, is the player frozen?", "InStreamVideoAd", Debug.WARN);
        }
		
		
		private function onMediaError(e:PdkEvent) :void
		{
			// the player was unable to open the media...
			_controller.trace("*** ERROR: player couldn't open media", "InStream");
			
			cleanUp()
		}
        private function createClickArea():void
        {
            if (_clickArea)
            {
                _clickArea.removeEventListener(MouseEvent.CLICK, onAdClicked);
                removeChild(_clickArea);
                _clickArea = null;
            }
            _clickArea = new Sprite();
		    _clickArea.addEventListener(MouseEvent.CLICK, onAdClicked, false, 0, true);
        }
		
		private function sizeClickArea():void
		{
			if (!_clickArea)
			{
				return;
			}
			var g:Graphics = _clickArea.graphics;
			g.clear();
			g.beginFill(0xff0000, 0);
			g.drawRect(0, 0, _mediaArea.width, _mediaArea.height);
			_clickArea.x = _mediaArea.x;
			_clickArea.y = _mediaArea.y;
		}
		
		private function onAdClicked(e:MouseEvent):void
		{
			_controller.pause(true);
		}
		
		private function onFullscreen(e:PdkEvent):void
		{
			_mediaArea = _controller.getOverlayArea(); //e.data as Rectangle;
			sizeClickArea();
		}

		private function onMediaAreaChanged(e:PlayerEvent):void
		{
			_mediaArea = _controller.getOverlayArea(); //e.data as Rectangle;
			sizeClickArea();
		}
		
	}
}
