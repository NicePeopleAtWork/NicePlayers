/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins.doubleclick.strategy
{
import com.google.ads.ima.api.AdsLoader;
import com.google.ads.ima.api.AdsManager;
    import com.google.ads.ima.api.AdEvent;
    import com.google.ads.ima.api.Ad;

    import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.utils.Debug;

	public class AdRulesStrategy implements IDoubleClickStrategy
	{
		private var _adsManager:AdsManager;
		private var _controller:IPlayerController;
		private var _adBreakReady:Boolean = false;
		private var _slotPlayRequested:Boolean = false;
		private var _ad:Ad;
        private var _isOverlay:Boolean;
        private var _isVpaid:Boolean;
        private var _adsLoader:AdsLoader;
        private var _pausedForAd:Boolean = false;
        private var _linearOrExpandedChanged:Boolean = false;
        private var _preparePodCallback:Function;

        private var _cuePointAvailable:Boolean = true;

		public function AdRulesStrategy(preparePodCallback:Function, adsLoader:AdsLoader, controller:IPlayerController)
		{
			_controller = controller;
            _adsLoader = adsLoader;
            _preparePodCallback = preparePodCallback;
		}

		public function set adsManager(am:AdsManager):void
		{
            _adsManager = am;
            _adsManager.addEventListener(AdEvent.LOADED, onAdLoaded);
            _adsManager.addEventListener(AdEvent.AD_METADATA, onAdMetadata);
            _adsManager.addEventListener(AdEvent.AD_BREAK_READY, onAdBreakReady);
		}

		public function preparePod(url:String):void
		{
            _cuePointAvailable = _preparePodCallback();
            //_controller.trace("preparePod: cuePointAvailable: "+_cuePointAvailable, "DoubleClick", Debug.DEBUG);
		}

		public function playNextPod():Boolean
		{
            _controller.trace("playNextPod", "DoubleClick", Debug.DEBUG);
			_slotPlayRequested = true;
			doPlayNextPod();
            return _cuePointAvailable;
		}

        private function doPlayNextPod():void
        {
        	if (_slotPlayRequested && _adBreakReady && _cuePointAvailable)
        	{
	            _controller.trace("doPlayNextPod: adsManager.start()", "DoubleClick", Debug.DEBUG);
                _adsManager.start();
	        	// reset for next slot
	        	_adBreakReady = _slotPlayRequested = false;
        	}
        }

   		public function get ready():Boolean
		{
			return true;
		}

		public function get isOverlay():Boolean
		{
            return _isOverlay;
		}

        public function get isVpaid():Boolean {
            return _isVpaid;
        }

        private function onAdLoaded(event:AdEvent):void
        {
            _controller.trace("IMA Event: "+ event.type+": adPosition: "+event.ad.adPodInfo.adPosition, "DoubleClick", Debug.DEBUG);
            _ad = event.ad.adPodInfo.adPosition == 1 ? event.ad : null;
            if(_ad) _isVpaid = _ad.apiFramework == "VPAID";
            if(_ad) _isOverlay = !_ad.linear;
        }

        private function onAdMetadata(event:AdEvent):void
        {
            _controller.trace("IMA Event: "+ event.type+": adPosition: "+event.ad.adPodInfo.adPosition, "DoubleClick", Debug.DEBUG);
        }
        
        private function onAdBreakReady(event:AdEvent):void
        {
            _controller.trace("onAdBreakReady", "DoubleClick", Debug.DEBUG);
            _adBreakReady = true;
            doPlayNextPod();
        }

        public function destroy():void
        {
            _adsLoader.contentComplete();
            _controller.trace("destroy and contentComplete", "DoubleClick:AdRulesStrategy", Debug.DEBUG);

            if(_adsManager)
            {
                _adsManager.removeEventListener(AdEvent.LOADED, onAdLoaded);
                _adsManager.removeEventListener(AdEvent.AD_BREAK_READY, onAdBreakReady);
                _adsManager.removeEventListener(AdEvent.AD_METADATA, onAdMetadata);
                _adsManager = null;
            }
            _controller = null;
            _ad = null;
            _adsLoader = null;
        }

        public function contentPauseRequested():void
        {
            if(_isVpaid && _linearOrExpandedChanged && !_controller.getPauseState() )
            {
                _controller.trace("pausing content", "DoubleClick:VastStrategy", Debug.DEBUG);
                _controller.pause(true);
                _pausedForAd = true;
            }
        }

        public function contentResumeRequested():void
        {
            if(_isVpaid && _linearOrExpandedChanged && _pausedForAd )
            {
                _controller.trace("resuming content", "DoubleClick:VastStrategy", Debug.DEBUG);
                _controller.pause(false);
                _pausedForAd = false;
            }
        }

        public function linearOrExpandedChanged():void
        {
            _linearOrExpandedChanged = true;
        }
    }

}
