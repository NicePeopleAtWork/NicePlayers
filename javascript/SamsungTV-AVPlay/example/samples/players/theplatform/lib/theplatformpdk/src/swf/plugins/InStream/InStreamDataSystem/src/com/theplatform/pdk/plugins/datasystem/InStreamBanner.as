/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins.datasystem 
{
	import com.theplatform.pdk.controllers.ClipInfoController;
	import com.theplatform.pdk.controllers.IClipInfoController;
	import com.theplatform.pdk.data.Banner;
	import com.theplatform.pdk.data.BannerData;
	import com.theplatform.pdk.events.BannerEvent;
	import com.theplatform.pdk.events.ClipInfoEvent;
	import com.theplatform.pdk.events.InstreamEvent;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.managers.IBannerSystem;
	import com.theplatform.pdk.plugins.ad.ICustomAd;
	import com.theplatform.pdk.plugins.ad.IFlashAd;
	import com.theplatform.pdk.plugins.ad.PdkAdsRequest;
	import com.theplatform.pdk.plugins.instream.InStreamBridge;
	import com.theplatform.pdk.processes.LoadBannerProcess;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.display.DisplayObject;
	import flash.display.Sprite;
	import flash.events.EventDispatcher;
	import flash.geom.Rectangle;

	//public class InStreamBanner extends InStreamPlugIn implements IBannerSystem
	public class InStreamBanner extends EventDispatcher implements IBannerSystem
	{
		private var _controller:IClipInfoController;
		
		private var _instreamBridge:InStreamBridge;
		private var _useBannerQueueing:Boolean;
		private var _startingNewRelease:Boolean;
		private var _banner:Banner;
		private var _banners:Array;
		private var _host:String;
		private var _abort:Boolean = false;
		
		private var _bannerWidth:Number;
		private var _bannerHeight:Number;
		private var _isExpanded:Boolean;
		
		private var _assetHolder:Sprite;
		private var _errorLoadProcess:LoadBannerProcess;
				
		public function InStreamBanner(controller:IClipInfoController, host:String)
		{
			_controller = controller;
			_host = host;
			init();
		}
	
		public function init():void
		{
			_instreamBridge = new InStreamBridge();
			_instreamBridge.addEventListener(InstreamEvent.onDartShellError, onDartShellError, false, 0, true);
			_instreamBridge.addEventListener(InstreamEvent.onFlashAdCollapsed, onFlashAdCollapsed, false, 0, true);
			_instreamBridge.addEventListener(InstreamEvent.onFlashAdExpanded, onFlashAdExpanded, false, 0, true);
			_instreamBridge.addEventListener(InstreamEvent.onFlashAssetLoaded, onFlashAssetLoaded, false, 0, true);
			_instreamBridge.addEventListener(InstreamEvent.onCustomAdLoaded, onCustomAdLoaded, false, 0, true);
			
			_controller.trace("initializing InStreamBanner...", "InStreamBanner", Debug.INFO);
			_controller.addEventListener(PdkEvent.OnPlugInsComplete, onPlugInsComplete);
			_controller.addEventListener(PdkEvent.OnMediaComplete, onMediaEnd);
			_controller.addEventListener(PdkEvent.OnReleaseEnd, onSetRelease);
			_controller.addEventListener(PdkEvent.OnSetRelease, onSetRelease);
			_controller.addEventListener(PdkEvent.OnSetReleaseUrl, onSetRelease);
			_controller.addEventListener(PdkEvent.OnClipInfoLoaded, onClipInfoLoaded);
			
			_bannerWidth = Number(_controller.getProperty("bannerWidth"));
			_bannerHeight = Number(_controller.getProperty("bannerHeight"));
			
			_useBannerQueueing = (_controller.getProperty("useBannerQueueing") == "true") ? true : false;
			
		
		}
		
			
		////////////////////////
		//	INTERFACE METHODS
		////////////////////////
		
		public function setClipInfoBanners(banners:Array, isDefault:Boolean = false):void
		{
			_banner = null;
			_banners = banners;//in case they all error out, etc. put this in there.
			var request:PdkAdsRequest;
			for each (var banner:Banner in banners)
			{
				if (banner.src.indexOf("/pfadx/") == -1)
				{
					_controller.trace("\"" + banner.src + "\" is not a pre-fetch URL (doesn't contain '/pfadx/'), can't be an InStream banner", "InStreamBanner");
				}			
				else if (banner.bannerWidth==_bannerWidth && banner.bannerHeight==_bannerHeight)
				{
					_banner = banner;
					_controller.trace("banner matched " + _bannerWidth + "x" + _bannerHeight + "; loading", "InStreamBanner");

					request = new PdkAdsRequest();
					request.adTagUrl = _banner.src;
					request.adSlotHeight = _banner.bannerHeight;
					request.adSlotWidth = _bannerWidth;
					_instreamBridge.loadFromIAdsRequest(request);
					break; // we just grab just one
				}
				else
					_controller.trace("banner was " + _banner.bannerWidth + "x" + _banner.bannerHeight + ", didn't match " + _bannerWidth + "x" + _bannerHeight + "; ignoring", "InStreamBanner");
			}
			checkLoadProcess();
		}
		
		public function abort():void
		{
			_abort = true;
		}
		
		protected function checkAbort():Boolean
		{
			return _abort;
		}
		
		
		public function clearBanners():void {}
		
		protected function onDartShellError(e:InstreamEvent):void
		{
			var msg:String = e.data as String;
			_controller.trace(msg, "InStreamBanner", Debug.ERROR);
			
			checkLoadProcess();//retry
		}
		
		protected function checkLoadProcess():void
		{
			if (checkAbort()) return;
			
			_controller.trace("main line failed, trying load process", "InStreamBanner", Debug.INFO);
			if (_errorLoadProcess)
			{
				_errorLoadProcess.removeEventListener(BannerEvent.OnLoadBannerProcessComplete, loadBannerProcessCompleted);
				_errorLoadProcess.destroy();
			}
			var bd:BannerData
			//find a banner;
			if (_banner)
			{
				bd = new BannerData(_banner);
			}
			else if (_banners)
			{
				for each (var banner:Banner in _banners)
				{
					if (banner.bannerWidth == _bannerWidth && banner.bannerHeight == _bannerHeight)
					{
						//find a size match
						bd = new BannerData(banner);
						break;
					}
				}
				if (!bd && _banners[0] is Banner)
				{
					bd = new BannerData(_banners[0] as Banner);
				}
			}
			
			if (bd)
			{
				_errorLoadProcess = new LoadBannerProcess(_controller);
				_errorLoadProcess.addEventListener(BannerEvent.OnLoadBannerProcessComplete, loadBannerProcessCompleted, false, 0, true);
				_errorLoadProcess.execute(bd);
			}
			//else just don't send out an event, it'll just quietly fail.
		}
		
		protected function loadBannerProcessCompleted(e:BannerEvent):void
		{
			_errorLoadProcess.removeEventListener(BannerEvent.OnLoadBannerProcessComplete, loadBannerProcessCompleted);
			
			var bd:BannerData = e.data as BannerData;
			bd.addEventListener(BannerEvent.OnBannerLoaded, bannerLoaded);
			bd.loadBanner();
		}
		
		private function bannerLoaded(e:BannerEvent):void
		{
			var bannerData:BannerData= e.data as BannerData;
			bannerData.removeEventListener(BannerEvent.OnBannerLoaded, bannerLoaded);
			
			bannerComplete(bannerData);
		}

		//hit from both the main line and error line
		protected function bannerComplete(bannerData:BannerData):void
		{
			if (checkAbort()) return;//just ignore, the code has moved on before we could finish;
			
			if (bannerData)
			{
				_controller.trace("SENDING: --- OnBannerRetrieved --- " + bannerData.banner.bannerWidth + "x" + bannerData.banner.bannerHeight + " - " + bannerData.banner.src, "instream")
			}
			else
			{
				_controller.trace("no banner retrieved", "InStreamBanner", Debug.INFO);
			}
			var evt:BannerEvent = new BannerEvent( BannerEvent.OnBannerRetrieved, bannerData );
			dispatchEvent(evt);
		}
		
		/////////////////////
		//	PDK EVENTS
		/////////////////////
		
		private function onPlugInsComplete(e:PdkEvent):void
		{
		}
		
		private function onMediaStart(ad:IFlashAd, e:PdkEvent):void
		{
			if (!_useBannerQueueing || _startingNewRelease) 
			{
				ad.unload();
			}
		}
		
		private function onMediaEnd(e:PdkEvent):void
		{
			_instreamBridge.collapseAd();
		}
		
		private function onSetRelease(e:PdkEvent):void
		{
			_startingNewRelease = true;
		}
		
		private function onClipInfoLoaded(e:PdkEvent):void
		{
			_bannerWidth = (e.data).innerWidth;
			_bannerHeight = (e.data).innerHeight;
		}

		//////////////////////
		//	DARTSHELL EVENTS
		//////////////////////
		
		protected function onFlashAdCollapsed(e:InstreamEvent):void
		{ 
			var flash_ad:IFlashAd = e.data as IFlashAd;

			_controller.trace("%%% BANNER COLLAPSED!", "instream")
			_isExpanded = false;
			sendOnClipInfoBannerResized(flash_ad);
		}
	
		protected function onFlashAdExpanded(e:InstreamEvent):void
		{
			var flash_ad:IFlashAd = e.data as IFlashAd;

			_controller.trace("%%% BANNER EXPANDED!", "instream")
			_isExpanded = true;
			sendOnClipInfoBannerResized(flash_ad);
		}
		
		protected function onFlashAssetLoaded(e:InstreamEvent):void 
		{
			var flash_ad:IFlashAd = e.data as IFlashAd;

			_controller.addEventListener(PdkEvent.OnMediaStart, function(e:PdkEvent):void {
				onMediaStart(flash_ad, e);
			});

			_assetHolder = new Sprite();
			flash_ad.play(_assetHolder);
			
			_controller.trace("%%% FLASH ASSET LOADED %%%", "instream", Debug.DEBUG)
			
			var bannerData:BannerData = createBannerData(flash_ad);
			bannerComplete(bannerData);
		}



		private function onCustomAdLoaded(e:InstreamEvent):void
		{
			var customAd:ICustomAd = e.data as ICustomAd;
			_controller.trace("UNHANDLED custom ad: " + customAd.content, "InstreamBanner", Debug.WARN);
			
			checkLoadProcess();//nothing happened, just retry
		}

		
		private function sendOnClipInfoBannerResized(ad:IFlashAd):void
		{
			var bannerData:BannerData = createBannerData(ad);
			
			_controller.trace("SENDING: ---OnClipInfoBannerResized--- " + bannerData.banner.bannerWidth + "x" + bannerData.banner.bannerHeight,"InStreamBanner");
			 
			var evt:ClipInfoEvent = new ClipInfoEvent( ClipInfoEvent.OnClipInfoBannerResized, bannerData);
			_controller.dispatchEvent(evt);
		}
		
		private function createBannerData(ad:IFlashAd):BannerData
		{
			var rect:Rectangle = getSize(ad);						
			_banner.bannerWidth = rect.width;
			_banner.bannerHeight = rect.height;
			_controller.trace("%%% creating bannerData:" + rect.width + "x" + rect.height, "instream")
			
			var bannerData:BannerData = new BannerData(_banner, _assetHolder as DisplayObject);
			return bannerData;
		}
 
		private function getSize(ad:IFlashAd):Rectangle
		{
			var rect:Rectangle = new Rectangle();
			if (_isExpanded)
			{
				rect.width = ad.asset.getExpandedWidth();
				rect.height = ad.asset.getExpandedHeight();
			}
			else
			{
				rect.width = ad.asset.getWidth();
				rect.height = ad.asset.getHeight();				
			}
			return rect;
		}		
	}
}
