package com.theplatform.pdk.plugins
{
	import flash.display.DisplayObjectContainer;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.IEventDispatcher;
	
	public class VPAIDWrapper extends EventDispatcher implements IVPAID
	{
		private var _ad:*; 
		public function VPAIDWrapper(ad:*) 
		{ 
			if (ad && ad.getVPAID && ad.getVPAID is Function)
			{
				_ad = checkInterface(ad.getVPAID());
			}
			else
			{
				_ad = checkInterface(ad as Object);
			}
		} 
		
		private function checkInterface(ad:*):Object
		{
			//let's go by the handshakeVersion to see where the interface has been implemented
			if (ad.handshakeVersion is Function)
			{
				return ad;
			}
			//TODO:  we'll need to discover where in the code the VPAID interface is for some of the creatives.  Could be a lot of hard-coding
			return null;
		}
		
		// Properties
		public function get adLinear():Boolean 
		{ 
			if (!_ad) return false;
			return _ad.adLinear; 
		} 
		public function get adExpanded():Boolean 
		{ 
			if (!_ad) return false;
			return _ad.adExpanded; 
		} 
		public function get adDuration():Number 
		{ 
			if (!_ad) return 0;
			return _ad.adDuration; 
		} 
		public function get adRemainingTime():Number 
		{ 
			if (!_ad) return 0;
			return _ad.adRemainingTime; 
		} 
		public function get adVolume():Number 
		{ 
			if (!_ad) return 0;
			return _ad.adVolume; 
		} 
		public function set adVolume(value:Number):void 
		{ 
			if (!_ad) return;
			_ad.adVolume = value; 
		} 
		
		// Methods
		public function handshakeVersion(playerVPAIDVersion : String):String 
		{ 
			//we'll use this to test compatibility, if there's not even a handshakeVersion
			return (_ad && _ad.handshakeVersion && _ad.handshakeVersion is Function) ? _ad.handshakeVersion(playerVPAIDVersion) : null;
		} 
		public function initAd(width:Number, height:Number, viewMode:String, desiredBitrate:Number, creativeData:String, environmentVars : String):void 
		{ 
			if (!_ad) return;
			_ad.initAd(width, height, viewMode, desiredBitrate, creativeData, environmentVars); 
		} 
		public function resizeAd(width:Number, height:Number, viewMode:String):void 
		{ 
			if (!_ad) return;
			_ad.resizeAd(width, height, viewMode); 
		} 
		public function startAd():void 
		{ 
			if (!_ad) return;
            try
            {
			    _ad.startAd();
            }
            catch(e:Error){}
		} 
		public function stopAd():void 
		{ 
			if (!_ad) return;
            try
            {
			    _ad.stopAd();
            }
            catch (e:Error) {}
		} 
		public function pauseAd():void 
		{ 
			if (!_ad) return;
            try
            {
			    _ad.pauseAd();
            }
            catch (e:Error) {}
		} 
		public function resumeAd():void 
		{ 
			if (!_ad) return;
            try
            {
                _ad.resumeAd();
            }
            catch (e:Error) {}
		} 
		public function expandAd():void 
		{ 
			if (!_ad) return;
			_ad.expandAd(); 
		} 
		public function collapseAd():void 
		{ 
			if (!_ad) return;
			_ad.collapseAd(); 
		} 
		// EventDispatcher overrides  
		override public function addEventListener(type:String, listener:Function, useCapture:Boolean=false, priority:int=0, useWeakReference:Boolean=false):void 
		{ 
			if (!_ad) return;
			_ad.addEventListener(type, listener, useCapture, priority, useWeakReference); 
		} 
		override public function removeEventListener(type:String, listener:Function, useCapture:Boolean=false):void 
		{ 
			if (!_ad) return;
			_ad.removeEventListener(type, listener, useCapture);
		}  
		override public function dispatchEvent(event:Event):Boolean 
		{ 
			if (!_ad) return false;
			return _ad.dispatchEvent(event); 
		} 
		override public function hasEventListener(type:String):Boolean 
		{ 
			if (!_ad) return false;
			return _ad.hasEventListener(type); 
		} 
		override public function willTrigger(type:String):Boolean 
		{ 
			if (!_ad) return false;
			return _ad.willTrigger(type); 
		} 
	} 
}