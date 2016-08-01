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
	import com.theplatform.pdk.data.StreamType;
	import com.theplatform.pdk.events.InstreamEvent;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.plugins.IAdPlugIn;
	import com.theplatform.pdk.plugins.instream.InStreamBridge;
	import com.theplatform.pdk.utils.Debug;
	import com.theplatform.pdk.utils.PdkStringUtils;
	
	import flash.display.DisplayObject;
	import flash.display.Sprite;
	import flash.external.ExternalInterface;
	
	public class InStreamAd extends Sprite implements IAdPlugIn
	{

		private static const DEFAULT_HOST:String = "ad.doubleclick.net";
		
		private var _host:String;
		private var _plugInVars:Object;

		private var _controller:IPlayerController;
		private var _instreamBridge:InStreamBridge;
		private var _instreamVideo:InStreamVideoAd;
		private var _instreamFlash:InStreamFlashAd;
		private var _instreamCompanions:InStreamBannerFactory;
		
		// passed in from canvas
		private var _priority:Number;
		
		// optional call to rewrite InStream URL
		private var _adKit:String;

		private var _noSkip:Boolean;
		private var _trackingUrls:Array;
        private var _mustSetAds:Boolean = false;
		
		private var _mainInStreamUrl:String;
		
		
		public function InStreamAd()
		{
			super();
		}

		
		
		/////////////////////
		//	INITIALIZATION
		/////////////////////
		
		public function initialize(lo:LoadObject):void
		{
			_controller = lo.controller as IPlayerController;
			_controller.trace("initializing InStreamAd...", "InStreamAd", Debug.INFO);
			_controller.setPlugInsAboveControls(false);

			_plugInVars = lo.vars;
			var priority:Number = lo.priority;
			var bannerSizes:String = lo.vars["bannerSizes"] as String;
			var bannerRegions:String = lo.vars["bannerRegions"] as String;
			var bannerTiles:String = lo.vars["bannerTiles"] as String;
			var bannerCommand:String = lo.vars["bannerCommand"] as String;
			var adKit:String = lo.vars["adKit"] as String;		// any function to call to dynamically rewrite the URL
			
			var host:String = lo.vars["host"] as String;
			_host = (host) ? host : DEFAULT_HOST;
			
			if (priority) 
				_priority = priority;	

			// set the optional callback for a rewriter
			_adKit = (!adKit ? "" : adKit);
			
			_controller.trace("%%%% priority=[" + _priority + "], host=[" + _host + "]","InStreamAd");
			_controller.trace("Loading DartShell...","InStreamAd", Debug.INFO);
			
			_controller.addEventListener(PdkEvent.OnPlugInsComplete, onLoadComplete);
			_controller.addEventListener(PdkEvent.OnPlayerLoaded, onPlayerLoaded);
			
			_instreamCompanions = new InStreamBannerFactory(_controller, bannerSizes, bannerRegions, bannerTiles, bannerCommand, _adKit);

		}

		
		//////////////////
		//	PDK EVENTS
		//////////////////
		
		private function onLoadComplete(e:PdkEvent):void
		{
			_controller.trace("onLoadComplete received","InStreamAd", Debug.INFO);
			
			// register IAdPlugin interface
			_controller.removeEventListener(PdkEvent.OnPlugInsComplete, onLoadComplete);
			_controller.registerAdPlugIn(this, "InStream", _priority);

			_instreamBridge = new InStreamBridge(this.stage);
			_instreamBridge.addEventListener(InstreamEvent.onDartShellError, onDartShellError, false, 0, true);
			_instreamBridge.addEventListener(InstreamEvent.onCustomAdLoaded, onCustomAdLoaded, false, 0, true);
			_instreamBridge.addEventListener(InstreamEvent.onDartInStreamAdLoaded, onDartInStreamAdLoaded, false, 0, true);
			_instreamBridge.addEventListener(InstreamEvent.onFlashAssetLoaded, onFlashAssetLoaded, false, 0, true);

			_instreamVideo = new InStreamVideoAd(_controller);
			addChild(_instreamVideo);
			_instreamFlash = new InStreamFlashAd(_controller, _instreamBridge, _adKit, _plugInVars, _instreamVideo, _instreamCompanions);
			addChild(_instreamFlash);
		}
		
		private function onPlayerLoaded(e:PdkEvent):void
		{
			// We need to ensure that all clipInfo components have had enough time
			// to report their dimensions (thru the onClipInfoLoaded event). So  
			// we're holding up checkAd until we get an OnPlayerLoaded event.
		}
				

		
		////////////////////////
		//	isAd / checkAd
		////////////////////////
		
		public function isAd(bc:BaseClip):Boolean
		{
			return (isInStreamUrl(bc.URL) || (PdkStringUtils.isRelative(bc.URL) && isInStreamUrl(bc.baseURL)) ) 
		}
		
		private function isInStreamUrl(checkUrl:String):Boolean
		{
			return (checkUrl.indexOf(_host) >= 0)
		}
	
		public function checkAd(clip:Clip):Boolean
		{
			var isHandled:Boolean = isAd(clip.baseClip);
			
			_controller.trace("Is this an INSTREAM ad? " + isHandled, "InStreamAd", Debug.INFO);
			
			if(isHandled)
			{
				_noSkip = clip.baseClip.noSkip;
				_controller.trace("Is this ad skippable? " + !_noSkip, "InStreamAd", Debug.INFO);

				if (clip.baseClip.trackingURLs)
				{
					_trackingUrls = clip.baseClip.trackingURLs.concat();
				}
				_mainInStreamUrl = clip.URL;
				if (_adKit)
				{
					_controller.trace("Calling JavaScript function " + _adKit + "(\"" + clip.URL + "\")", "InStreamAd");
                    _mainInStreamUrl = String(ExternalInterface.call(_adKit, clip.URL));
                    _controller.trace("mainInstreamUrl after adKit:" + _mainInStreamUrl, "InStreamAd");
				}

                _mustSetAds = true;
				var request:PdkAdsRequest = new PdkAdsRequest();
				request.adTagUrl = _mainInStreamUrl;
				request.adSlotHeight = _controller.getMediaArea().height;
				request.adSlotWidth = _controller.getMediaArea().width;

				_instreamBridge.loadFromIAdsRequest(request, {
						"video_container" : _instreamVideo.video
					}
				);

			}

			_controller.trace("checkAd returned:" + isHandled,"InStreamAd");
			return isHandled;
		}
		
		private function onDartShellError(e:InstreamEvent):void
		{
			var msg:String = e.data as String;
			_controller.trace("DartShell ERROR: " + msg,"InStreamAd", Debug.ERROR);
			_controller.setAds(new Playlist()) // skip to next clip
		}
		
		private function onCustomAdLoaded(e:InstreamEvent):void
		{
			var customAd:ICustomAd = e.data as ICustomAd;
			if (!customAd)
				_controller.trace("*** customAd returned null", "InStreamAd", Debug.WARN);
			else
			{
				_controller.trace("custom content: " + customAd.content, "InStreamAd");
			}
	
			// if this wasn't the result of trying to call an overlay roadblock, then
			// the main instream ad was custom, and we should skip forward
			if (_mustSetAds)
			{
				_mustSetAds = false;
                _controller.trace("Calling setAds");
				_controller.setAds(new Playlist());
			}
		}
		
		private function onDartInStreamAdLoaded(e:InstreamEvent):void
		{
			var video_ad:IVideoAd = e.data as IVideoAd;
			if (video_ad)
			{
				_controller.trace("Google returned an inStream Ad: " + video_ad.getTitle(), "InStreamAd");

                _mustSetAds = false;
                _instreamVideo.start(video_ad);

				var playlist:Playlist = createPlaylist(video_ad);
				_controller.setAds(playlist);
			}
			else if (_mustSetAds)
            {
                _controller.trace("Google returned a NULL inStream Ad", "InStreamAd", Debug.ERROR);
                _mustSetAds = false;
                _controller.setAds(new Playlist());
            }
			
			_instreamFlash.reset();
		}
		
		private function createPlaylist(video_ad:IVideoAd):Playlist
		{
			var playlist:Playlist = new Playlist();

			// create a baseClip and banners to it
			var bc:BaseClip = _instreamVideo.createBaseClip(_noSkip);
			bc.banners = _instreamCompanions.getBanners(video_ad, _mainInStreamUrl);

			if (bc.banners)
			{
	            _controller.trace("Got " + bc.banners.length + " banners", "InStreamAd", Debug.INFO);			
			}

			var clip:Clip = _controller.createClipFromBaseClip(bc);
			clip.streamType  = StreamType.EMPTY; // no-op
			if (_trackingUrls)
				clip.trackingURLs = _trackingUrls;
				
			playlist.addClip(clip);
			return playlist;
		}		

		private function createFlashAdPlaylist(flash_ad:IFlashAd):Playlist
		{
			var playlist:Playlist = new Playlist();

			// create a baseClip and banners to it
			var bc:BaseClip = _instreamFlash.createBaseClip(_noSkip);
			bc.banners = _instreamCompanions.getBanners(flash_ad, _mainInStreamUrl);

			if (bc.banners)
			{
	            _controller.trace("Got " + bc.banners.length + " banners", "InStreamAd", Debug.INFO);			
			}

			var clip:Clip = _controller.createClipFromBaseClip(bc);
			clip.streamType  = StreamType.EMPTY; // no-op
			if (_trackingUrls)
				clip.trackingURLs = _trackingUrls;
				
			playlist.addClip(clip);
			return playlist;
		}		
		
		
		//////////////////////////
		//	FLASH-IN-FLASH AD
		//////////////////////////		
		
		private function onFlashAssetLoaded(e:InstreamEvent):void 
		{
			var flash_ad:IFlashAd = e.data as IFlashAd;

			_controller.trace("DARTSHELL RETURNED FLASH AD","InStreamAd");
			
			if (flash_ad && flash_ad.linear)
			{
				_controller.trace("FLASH AD is linear","InStreamAd");
				_mustSetAds = false;

                _instreamFlash.start(flash_ad, _mainInStreamUrl, _mustSetAds);

				var playlist:Playlist = createFlashAdPlaylist(flash_ad);
				_controller.setAds(playlist);

				// create clip and set ads
			}
			else if (flash_ad)
			{
				_controller.trace("FLASH AD is overlay","InStreamAd");
				_instreamFlash.start(flash_ad, _mainInStreamUrl, _mustSetAds);
			}

			if (_mustSetAds)
			{
                _mustSetAds = false;
                _controller.setAds(new Playlist());
			}

		}
	}
	

}
