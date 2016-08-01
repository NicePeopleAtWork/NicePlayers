// ActionScript file

/**
  *
  * BandwidthProcess utiltiy
  *
  * Copyright (c) 2009 Ben Kanizay
  * This software is released under the MIT License
  *
  */
 
package com.nice {
	 
	import flash.display.Loader;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.system.Capabilities;
	import flash.utils.getTimer;
	 
	    public class BandwidthChecker extends EventDispatcher {
		 
		        public static const DEFAULT_BANDWIDTH : String = "low";
		        public static const DEFAULT_BANDWIDTH_SPEED : Number = 900;
		 
		        protected var bandwidthDetected : String;
		        protected var bandwidthSpeedDetected : Number;
		 
		        protected var startTime : uint;
				protected var endTime : uint;
		        protected var testFile : String;
		        protected var loader : URLLoader;
		        protected var request : URLRequest;
				protected var totalBytes:uint;
				protected var element:Number;
				protected var globalElement:Number;
				protected var timeMillis : Number;

				
		 
		        public function BandwidthChecker() {
		        }
		 
		/////////////////////////////////////////////////////////////////////////////
		//      PUBLIC METHODS
		/////////////////////////////////////////////////////////////////////////////
		 
		        public function check(testImage:String, element:Number, globalElement:Number ) : void {
			
			            this.testFile = testImage;
			            this.loader = new URLLoader();
						this.element = element;
						this.globalElement = globalElement;
							
						if( true ){
							var url:String = this.testFile;
						}else{
							var url:String = this.testFile + this.getCacheBlocker();
						}
						
						trace("Real url -> "+url);
						
			            this.request = new URLRequest(url);
			            this.addLoaderListeners();
						this.startTime = getTimer();
			            this.loader.load(this.request);
		        }
		 
		/////////////////////////////////////////////////////////////////////////////
		//      EVENT HANDLERS
		/////////////////////////////////////////////////////////////////////////////
		 
		        protected function onLoadStart( event:Event ) : void {
						trace("Load Start");
	 	        }
		 
		        protected function onLoadError( event:Event ) : void {
						trace("Load Error");
						trace(event.type);
			            this.bandwidthDetected = DEFAULT_BANDWIDTH;
			            this.bandwidthSpeedDetected = DEFAULT_BANDWIDTH_SPEED;
			            this.complete();
				}
		 
		        protected function onLoadComplete(event:Event) : void {
			
						
						endTime = getTimer();
						
			            var time:Number = ( endTime - this.startTime ) / 1000;
						
			 			timeMillis = ( endTime - this.startTime );
			
						
						totalBytes =  this.loader.bytesTotal;
			            
						this.bandwidthSpeedDetected = Math.round(( this.loader.bytesTotal / 1024 * 8 ) / time);
			            this.bandwidthDetected = (this.bandwidthSpeedDetected > DEFAULT_BANDWIDTH_SPEED) ? "high" : "low";
						trace("Load Complete: "+this.bandwidthSpeedDetected);
			            this.complete();			
		        }
		
		override public function dispatchEvent(event:Event):Boolean
		{
				
			// TODO Auto Generated method stub
			return super.dispatchEvent(event);
		}
		
		 
		
		
		/////////////////////////////////////////////////////////////////////////////
		//      HELPERS
		/////////////////////////////////////////////////////////////////////////////
		 
		        protected function getCacheBlocker() : String {
			            				
		            var date : Date = new Date();
				    var time:uint  = date.getTime();
				       
					return "&t=" + time.toString()+this.element+this.globalElement;

		        }
		 
		        protected function addLoaderListeners() : void {
			
			            this.loader.addEventListener(Event.OPEN, this.onLoadStart, false, 0, false);
			            this.loader.addEventListener(Event.COMPLETE, this.onLoadComplete, false, 0, false); 
			            this.loader.addEventListener(IOErrorEvent.IO_ERROR, this.onLoadError, false, 0, false);
			            this.loader.addEventListener(IOErrorEvent.NETWORK_ERROR, this.onLoadError, false, 0, false);
			            this.loader.addEventListener(IOErrorEvent.DISK_ERROR, this.onLoadError, false, 0, false);
			            this.loader.addEventListener(IOErrorEvent.VERIFY_ERROR, this.onLoadError, false, 0, false);
			            this.loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, this.onLoadError, false, 0, false);
		        }
		 
		        protected function removeLoaderListeners() : void {
			            this.loader.removeEventListener(Event.OPEN, this.onLoadStart);
			            this.loader.removeEventListener(Event.COMPLETE, this.onLoadComplete);
			 
			            this.loader.removeEventListener(IOErrorEvent.IO_ERROR, this.onLoadError);
			            this.loader.removeEventListener(IOErrorEvent.NETWORK_ERROR, this.onLoadError);
			            this.loader.removeEventListener(IOErrorEvent.DISK_ERROR, this.onLoadError);
			            this.loader.removeEventListener(IOErrorEvent.VERIFY_ERROR, this.onLoadError);
			            this.loader.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, this.onLoadError);
		        }
		 
		        protected function complete() : void {
						trace("complete");
			            this.removeLoaderListeners();
			            this.loader = null;
			            this.request = null;
			            this.testFile = null;
			            this.dispatchEvent(new Event(Event.COMPLETE));
		        }
		 
		/////////////////////////////////////////////////////////////////////////////
		//      GETTERS
		/////////////////////////////////////////////////////////////////////////////
		 
		        public function getBandwidth() : String {
			            return this.bandwidthDetected;
		        }
		 
		        public function getBandwidthSpeed() : Number {
			            return this.bandwidthSpeedDetected;
		        }
		
		        public function getStartTime() : uint {
			            return this.startTime;
		        }
		
		        public function getEndTime() : uint {
			            return this.endTime;
		        }
		
				public function getTotalBytes() : uint {
			            return this.totalBytes;
		        }
		
				
				public function getTimeMillis() : Number {
					            return this.timeMillis;
				        }
				
	    }
}