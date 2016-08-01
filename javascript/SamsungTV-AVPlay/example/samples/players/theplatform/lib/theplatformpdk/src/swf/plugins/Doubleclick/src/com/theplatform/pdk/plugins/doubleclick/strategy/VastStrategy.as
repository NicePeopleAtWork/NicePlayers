/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins.doubleclick.strategy
{
    import com.google.ads.ima.api.AdsManager;
    import com.google.ads.ima.api.AdsLoader;
    import com.google.ads.ima.api.AdEvent;
    import com.google.ads.ima.api.Ad;

    import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.utils.Debug;

	public class VastStrategy implements IDoubleClickStrategy
	{
		private var _adsManager:AdsManager;
		private var _controller:IPlayerController;
        private var _adsLoader:AdsLoader;
		private var _adLoadedReady:Boolean = false;
		private var _slotPlayRequested:Boolean = false;
		private var _preparePodCallback:Function;
		private var _firstPod:Boolean = true;
		private var _ad:Ad;
        private var _isOverlay:Boolean;
        private var _isVpaid:Boolean;

        // tracks if content was paused when ad was triggered or not
        private var _pausedForAd:Boolean = false;

        // ideally, we wouldn't need this and just use VPAID as our check on content paused and resumed event,
        // but without this, prerolls have funky behavior as contentPaused is called before the preroll.
        // This can jam up the PDK (eg play/pause doesn't work for ad or ad just never begins.)
        private var _linearOrExpandedChanged:Boolean = false;

		public function VastStrategy(preparePodCallback:Function, adsLoader:AdsLoader, controller:IPlayerController)
		{
			_controller = controller;
			_adsLoader = adsLoader;
            _preparePodCallback = preparePodCallback;
		}

		public function set adsManager(am:AdsManager):void
		{
            _adsManager = am;
            _adsManager.addEventListener(AdEvent.LOADED, onAdLoaded);
            _adsManager.addEventListener(AdEvent.AD_BREAK_READY, onAdBreakReady);
		}

		public function preparePod(url:String):void
		{
			// the first slot got pre-loaded by the plug-in
			if (_firstPod)
			{
				_firstPod = false;
			}
            else
            {
                _controller.trace("preparePod", "DoubleClick:VastStrategy", Debug.DEBUG);
                _preparePodCallback(url);
            }
		}

		public function playNextPod():Boolean
		{
            _controller.trace("playNextPod", "DoubleClick:VastStrategy", Debug.DEBUG);
			_slotPlayRequested = true;
			doPlayNextPod();
            return true;
		}

        private function doPlayNextPod():void
        {
        	if (_slotPlayRequested && _adLoadedReady)
        	{
	            _controller.trace("doPlayNextPod: adsManager.start()", "DoubleClick:VastStrategy", Debug.DEBUG);
       			_adsManager.start();
	        	// reset for next slot
	        	_adLoadedReady = _slotPlayRequested = false;
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
            _controller.trace("onAdLoaded", "DoubleClick:VastStrategy", Debug.DEBUG);
            _ad = event.ad;
            _isOverlay = !_ad.linear;
            _isVpaid = _ad.apiFramework == "VPAID";
            _adLoadedReady = true;
            doPlayNextPod();
        }

        private function onAdMetadata(event:AdEvent):void
        {
            _controller.trace("IMA Event: "+ event.type+": adPosition: "+event.ad.adPodInfo.adPosition, "DoubleClick", Debug.DEBUG);
        }
        
        private function onAdBreakReady(event:AdEvent):void
        {
            _controller.trace("onAdBreakReady", "DoubleClick:VastStrategy", Debug.DEBUG);
        }

        public function destroy():void
        {
            _adsLoader.contentComplete();

            if(_adsManager)
            {
                _adsManager.removeEventListener(AdEvent.LOADED, onAdLoaded);
                _adsManager.removeEventListener(AdEvent.AD_BREAK_READY, onAdBreakReady);
                _adsManager.removeEventListener(AdEvent.AD_METADATA, onAdMetadata);
                _adsManager = null;
            }
            _controller = null;
            _preparePodCallback = null;
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

        public function contentResumeRequested():Boolean
        {
            if(_isVpaid && _linearOrExpandedChanged && _pausedForAd )
            {
                _controller.trace("resuming content", "DoubleClick:VastStrategy", Debug.DEBUG);
                _controller.pause(false);
                _pausedForAd = false;
            }
            return false;
        }

        public function linearOrExpandedChanged():void
        {
            _linearOrExpandedChanged = true;
        }
    }

}
