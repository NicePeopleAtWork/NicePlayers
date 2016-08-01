/* YouBora - thePlatfrom SWF Plugin 
* Copyright (c) 2014 NicePeopleAtWork
* Author: Luis Miguel Lainez
* Version: 1.3.2.1.1_Flash
*/ 
package
{
 	import com.adobe.serialization.json.*;
 	import com.nice.event.AnalyticEvent;
 	import com.nice.processor.EventProcessor;
 	import com.nice.utils.UtilsCNN;
 	import com.theplatform.pdk.controllers.IBaseController;
 	import com.theplatform.pdk.data.BaseClip;
 	import com.theplatform.pdk.data.Clip;
 	import com.theplatform.pdk.data.LoadObject;
 	import com.theplatform.pdk.data.PlaybackError;
 	import com.theplatform.pdk.data.SeekObject;
 	import com.theplatform.pdk.data.StreamSwitch;
 	import com.theplatform.pdk.data.TimeObject;
 	import com.theplatform.pdk.events.PdkEvent;
 	import com.theplatform.pdk.plugins.IPlugIn;
 	import com.theplatform.pdk.plugins.ad.PdkAd;
 	
 	import flash.display.LoaderInfo;
 	import flash.display.Sprite;
 	import flash.events.Event;
 	import flash.events.IOErrorEvent;
 	import flash.events.TimerEvent;
 	import flash.external.ExternalInterface;
 	import flash.net.URLLoader;
 	import flash.net.URLRequest;
 	import flash.net.URLRequestHeader;
 	import flash.net.URLRequestMethod;
 	import flash.net.URLVariables;
 	import flash.net.navigateToURL;
 	import flash.utils.*;
 	import flash.utils.Timer;
 	import flash.utils.getQualifiedClassName;
	
	
	public class SmartPlugin extends Sprite implements IPlugIn
	{
		private var BUFFER_BEGIN : int = 0;
		private var BUFFER_END : int = 1;
		private var pluginVersion : String = "1.3.2.1.1_platFlash";
		private var targetDevice  : String = "thePlatform";
		// Media
		private var realUrlResource:String = "";
		private var	urlResource:String = "";

		private var pingTime : int =0;
		private var currentTime:Number = 0;
		public  var duration :int =0;
		private var bitrate : int =0;
		private var isLive : Boolean =false;
		private var errorMessage: String = "";
		// Control
		private var isBuffering : Boolean = false;
		private var isPaused : Boolean = false;		
		private var playerParameters:Object;
		public var isAdvertisement: Boolean = false;
		protected var isXMLGetted : Boolean = false;
		protected var eventProcessor:EventProcessor;
		protected var testXML:XML; 
		protected var pamUrl:String = "";
		protected var pamBufferUnderrunUrl:String = "";
		protected var pamJoinTimeUrl:String = "";
		protected var pamStartUrl:String = "";
		protected var pamStopUrl:String = "";
		protected var pamPauseUrl:String = "";
		protected var pamResumeUrl:String = "";
		protected var pamPingUrl:String = "";
		protected var pamErrorUrl:String = "";
		protected var pamCode:String  = "";
		protected var pamCodeOrig:String = "";
		protected var pamCodeCounter:Number = 0;
		protected var pamLastCode:String = "last";
		protected var pamPingTime:Number = 5000; 
		protected var totalBytes:Number = 0;
		protected var bufferTimeBegin:uint;
		protected var pingTimer:Timer = null;
		protected var currentBitrate:Number;
		protected var isStartEventSent:Boolean = false;
		protected var isJoinEventSent:Boolean = false;
		protected var isPingRunning:Boolean = false;	 
		protected var lastPingTime:Number = 0;
		protected var clipHasAds:Boolean = false;
		protected var titleFromPlaylist:Boolean = false;
		//If ads are played, the playtime restarts to 0, so we need
		//to accummulate the last time before the ad to add it everytime.
		protected var accummulatedPlayTime :int = 0;
		
		//Smartswitch
		protected var balancerExecuted:Number = 0;
		// Pass Trought Variables
		protected var debug:Boolean = true;
		protected var accountCode:String;
		protected var service:String = "http://nqs.nice264.com";
		protected var username:String;
		protected var mediaResource:String;
		protected var mediaResourceYouboraData:String;
		protected var transaction:String;
		protected var live:Boolean = false;
		protected var liveSetted:Boolean = false;
		protected var properties:Object;
		protected var propertiesAux:Object;
		protected var contentId:String;		
		// Properties 
	
		// Concurrency 
		protected var concurrencyEnabled:Boolean = false;
		protected var concurrencyCode:String = "";
		protected var concurrencyService:String = "http://pc.youbora.com/cPing/";
		protected var concurrencyMaxCount:Number = 0;
		protected var concurrencyRedirectUrl:String = "";
		protected var concurrencyIpMode:Boolean = false; 	
		protected var concurrencyInterval:uint;		
		protected var concurrencyTimeoutTimer:uint;
		protected var concurrencySessionId:Number = Math.random();
		// Resume 
		protected var resumeEnabled:Boolean = false;
		protected var resumeCallback:String = "function(secs) { console.log(secs); }";
		protected var resumeService:String = "http://pc.youbora.com/resume/";
		protected var playTimeService:String = "http://pc.youbora.com/playTime/";
		protected var playerCurrentTime:Number = 0;
		protected var resumeTimeoutTimer:Timer;
		protected var resumeTimer:Timer;
		protected var resumeMovetoSecs:Number = 0;
		protected var stopResume:Boolean = false;
		protected var resumeCallBackCalled :Boolean =false;
		// Balancer		
		protected var balanceEnabled:Boolean = false;
		protected var balanceType:String = "balanced";
		protected var balanceService:String = "http://smartswitch.youbora.com";
		protected var balanceZoneCode:String = "default";
		protected var balanceOriginCode:String = "";
		protected var balanceNVA:Number;
		protected var balanceNVB:Number;
		protected var balanceToken:String; 
		protected var isBalancing:Boolean = false;
		// Extra Params
		protected var extraparam1:String;
		protected var extraparam2:String;
		protected var extraparam3:String;
		protected var extraparam4:String;
		protected var extraparam5:String;
		protected var extraparam6:String;
		protected var extraparam7:String;
		protected var extraparam8:String;
		protected var extraparam9:String;
		protected var extraparam10:String;
		// Others
		protected var hashTitle:String = "true";
		protected var cdn:String = "";
		protected var isp:String = "";
		protected var ip:String = ""; 
		// Params Inherit From thePlatform (getPlayerParams)
		// Level 3
		protected var cdnNodeData:Boolean = false;
		protected var l3Host:String = "";
		protected var l3Type:String = "";
		protected var isSeeking:Boolean = false;
		
		protected var httpSecure :Boolean=false;
		protected var nqsDebugServiceEnabled :Boolean=false;
		
		protected var youboraDataString : String ="";
		protected var youboraData:Object;
		
		private var pluginParameters : Array =["youboraData"];
		
		public function SmartPlugin()
		{
			//No need to do anything
		}
		
		public function initialize(lo:LoadObject):void{
	
			if(false) {ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Initializing FlashPlugin')")};
			playerParameters = new Object();
			readParameters();
			
			try{
				var controller:IBaseController  = lo.controller;
				controller.addEventListener(PdkEvent.OnMediaPlaying, this.mediaPlayingListener);
				controller.addEventListener(PdkEvent.OnMediaPause, this.mediaPauseListener);
				controller.addEventListener(PdkEvent.OnMediaBuffer, this.mediaBufferListener);
				controller.addEventListener(PdkEvent.OnMediaEnd, this.mediaEndListener);
				controller.addEventListener(PdkEvent.OnMediaError, this.mediaErrorListener);
				controller.addEventListener(PdkEvent.OnVersionError, this.versionErrorListener);
				controller.addEventListener(PdkEvent.OnMediaPlay, this.mediaPlayListener);
				controller.addEventListener(PdkEvent.OnMediaSeek, this.mediaSeekListener);
				controller.addEventListener(PdkEvent.OnPlayButtonClicked, this.playButtonClickedListener);
				controller.addEventListener(PdkEvent.OnMediaStart, this.mediaStartListener);
				controller.addEventListener(PdkEvent.OnStreamSwitched, this.streamSwitchedListener);
				controller.addEventListener(PdkEvent.OnAdvertisementClick, this.advertismentClickedListener);
				controller.addEventListener(PdkEvent.OnReleaseStart, this.releaseStartListener);
			}catch(err:Error){
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: "+err+"')")};
			}

			youboraData = com.adobe.serialization.json.JSON.decode(youboraDataString);
			parseYouboraData();
			instantiateAnalytics();
			if(resumeEnabled){
				sendResumeStatus(); 
			}
			
			if(debug) {ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: FlashPlugin Initialized')")};
		}
		
		private function releaseStartListener(e:PdkEvent):void{
			try {			
				var clips : Array = e.data.clips as Array;
				
				if(clips){
					for(var i:int = 0; i < clips.length; i++) {
						if(clips[i].baseClip.isAd == false) {
							this.duration = clips[i].baseClip.releaseLength/1000;
							this.properties.content_metadata.title = clips[i].baseClip.title;
							this.urlResource = clips[i].baseClip.URL;
							this.titleFromPlaylist = true;
							
							this.propertiesAux = this.properties;
						}					
					}
				}
			} catch (err:Error) {
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform ::"+err+"')")};
			}
		}
		
		private function mediaPlayingListener(e:PdkEvent):void{
			try{
				
				var nowDate:Date			= new Date();
				//var currentTime:Number		= nowDate.time;
				var clip : Clip = e.data as Clip;
				var to : TimeObject =  e.data as TimeObject;			
				
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: MediaPlaying Obj: " + e.data + "')")};
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: MediaPlaying " + this.currentTime + "')")};								
				
				if(isPaused){
					this.sendResume();
				} 
				
				this.currentTime = Number(to.currentTime)/1000;
				
				// Only send JoinTime here if not is Live, is current Buffering, and not JoinEventSent yet...
				if(/*!isLive &&*/ isBuffering && !isJoinEventSent){
					if ( to.currentTime > 0 ) {
						if(!this.titleFromPlaylist) {
							this.duration = clip.mediaLength/1000;
						}
						if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: BufferEnd from MediaPlaying with time " + to.currentTime + "')")};
						buffer(BUFFER_END);
					}
				}
				
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: CurrentTimeAbs: " + to.currentTimeAbsolute +
						" // CurrentTime: " + to.currentTime + " // CurrentTimeAgr: " + to.currentTimeAggregate + "')")};
				
				isPaused=false;			
			}catch(err:Error){
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform ::"+err+"')")};
			}
		}
		private function mediaPauseListener(e:PdkEvent):void{
			try{
				sendPause();
				isPaused = true;
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: mediaPauseListener')")};
			}catch(err:Error){
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: "+err+"')")};
			}
		}
		
		private function mediaBufferListener(e:PdkEvent):void{
			try{
				
				var nowDate:Date			= new Date();
				var currentTime:Number		= nowDate.time;
				
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: mediaBufferListener " + currentTime + "')")};
				
				var clip : Clip = e.data as Clip;
				
				try
				{
					if ( clip == null )
					 	 clip = e.data.clip as Clip;
				}
				catch(err:Error){}
				
				if(!isStartEventSent)
				{
					// Check Clip in Buffer Event
					var bool:Boolean = checkClipIsOK (clip);
					
					if (bool)
					{
						if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Send Start from Buffer Event')")};
						
						
						sendStart(clip);
						pingTimer.start();
					}
					else
					{
						if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Can't send start from Buffer (NO CHECK OK FROM CLIP)!!!')")};
						
					}
				}
				if(!isBuffering && !clip.baseClip.isAd){
					buffer(BUFFER_BEGIN);
				}
			}catch(err:Error){
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Error "+err.getStackTrace()+"')")};
			}
		}
		
		private function checkClipIsOK(clip:Clip):Boolean
		{
			try
			{
				if ( clip != null ) 
				{
					if ( clip.title == null || clip.title == "" )
					{
						if ( clip.baseClip.title != "" )
						{
							
						}
					}
					else
					{
						if ( properties.content_metadata.title == "" )
						{
							
						}
						else
						{
							return false;
						}
					}
				} 
				else 
				{
					return false;
				}
			
				if ( clip.URL == null || clip.URL == "" )
				{
					if ( clip.baseClip.URL != null )
					{
						
					}
					else
					{
						return false;
					}
				}
			}
			catch (err:Error)
			{
				return false;
			}
			
			return true;
		}
		
		private function mediaEndListener(e:PdkEvent):void{
			try{
				var clip : Clip = e.data as Clip;
				
				try
				{
					if ( clip == null )
						clip = e.data.clip as Clip;
				}
				catch(err:Error){}
				
				if(isStartEventSent){
					
					if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: mediaEndListener :: isAd " + clip.baseClip.isAd + " ')")};
					if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: mediaEndListener :: CurrentMediaTime " + clip.currentMediaTime + " ')")};
					if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: mediaEndListener :: CloseToEnd " + isCloseToEnd(clip.currentMediaTime) + " ')")};
					
					if(!clip.baseClip.isAd && isCloseToEnd(clip.currentMediaTime)){
						sendStop();
					}
					
					// calculate jointime when have ads
					if(clip.baseClip.isAd){
						buffer(BUFFER_BEGIN);
					}
				}
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: mediaEndListener')")};
			}catch(err:Error){
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Error "+err+"')")};
			}
		}
		
		private function advertismentClickedListener(e:PdkEvent):void{
			try
			{
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: advertismentClickedListener!!')");}
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: > EventError " + e.type + "!!')");}
			}catch(err:Error){
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Error "+err+" , this my be normal if clip is not found')")};
			}
		}
		
		private function versionErrorListener(e:PdkEvent):void{
			try
			{
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: versionErrorListener!!')");}
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: > EventError " + e.type + "!!')");}
			}catch(err:Error){
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Error "+err+" , this my be normal if clip is not found')")};
			}
		}
		
		private function mediaErrorListener(e:PdkEvent):void{
			try{
				var clip : Clip = e.data as Clip;
				var playbackError:PlaybackError= e.data as PlaybackError;
				
				try
				{					
					var playbackError:PlaybackError= e.data as PlaybackError;
										
				}catch(err:Error){}
				
				try
				{
					if ( clip == null )
						clip = e.data.clip as Clip;
				}
				catch(err:Error){}
				
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Error Clip is " + clip + "')");}
				
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: mediaErrorListener")};
				if(debug && clip != null){ExternalInterface.call("console.log('SmartPlugin :: isAd ?  :: "+clip.baseClip.isAd+"')")};
				if(debug && clip != null){ExternalInterface.call("console.log('SmartPlugin :: Title ?  :: "+clip.title+"')")};
				if(debug && clip != null){ExternalInterface.call("console.log('SmartPlugin :: Resource ?  :: "+clip.URL+"')")};
								
				if( clip == null || !clip.baseClip.isAd )
				{	
					try
					{
						if(properties.content_metadata.title == '' || properties.content_metadata.title == 'Undefined') {
							if ( clip != null && !this.titleFromPlaylist){
								if ( clip.title == null || clip.title == "" ){
									if ( clip.baseClip.title != ""){
										properties.content_metadata.title = clip.baseClip.title;
									}
								} else {
									properties.content_metadata.title = clip.title;
								}
							} else {
								if ( properties.content_metadata.title == "" ) {
									properties.content_metadata.title = "Undefined";
								}
							}
						} // end -> if(properties.content_metadata.title == '' || properties.content_metadata.title == 'Undefined') {
						
						if ( clip != null ){
							realUrlResource	= clip.URL;
							if(!this.titleFromPlaylist) {
								urlResource 	= clip.URL;
							}
						}
						
						if ( realUrlResource == null || realUrlResource == "" ) {
							if ( clip.baseClip.URL != null ) {
								realUrlResource	= clip.baseClip.URL;
								if(!this.titleFromPlaylist) {
									urlResource 	= clip.baseClip.URL;
								}
							}
						}
					} catch (err:Error){}
					
					sendError("9000");
					
					if(isStartEventSent) {
						this.sendStop();
					}
				}
				
			}catch(err:Error){
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: "+err+" , this my be normal if clip is not found')")};
			}
		}
		private function mediaPlayListener(e:PdkEvent):void{
			try{
				
				var nowDate:Date			= new Date();
				var currentTime:Number		= nowDate.time;
				var clip:Clip = 		e.data as Clip;	
				
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: mediaPlayListener " + currentTime + "')")};
				if(isBuffering){
					//currentTime has changed- ->Playback restarted
					if(!this.titleFromPlaylist) {
						this.duration = clip.mediaLength/1000;					
					}					
					buffer(BUFFER_END);
				}
			}catch(err:Error){
				ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Error "+err+"')");
			}
		}
		private function mediaSeekListener(e:PdkEvent):void{
			try{
				var seek :SeekObject = e.data as SeekObject;
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: mediaSeekListener')")};
			}catch(err:Error){
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Error "+err+"')")};
			}
		}
		private function playButtonClickedListener(e:PdkEvent):void{
			try{
				var clip : Clip = e.data as Clip;
				this.isAdvertisement = clip.baseClip.isAd;
				if(!this.isAdvertisement) {
					buffer(BUFFER_BEGIN);
				}				
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform ::playButtonClickedListener')")};
			}catch(err:Error){
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Error "+err+"')")};
			}
		}
		private function mediaStartListener(e:PdkEvent):void{
			try{				
				
				var nowDate:Date		= new Date();
				var currentTime:Number	= nowDate.time;
				var clip:Clip = 		e.data as Clip;								
				this.isAdvertisement = clip.baseClip.isAd;
				
				try
				{
					if ( clip == null )
						clip = e.data.clip as Clip;
				}
				catch(err:Error){}
				
				//Uncommunicated change of video
				/*if(!clipHasAds && clip.URL != this.realUrlResource){
					sendStop();
					restartAnalytics();
				}*/
				
				//Store the previous time because the currentTime is going to start
				//from 0 back again
				accummulatedPlayTime +=currentTime;				
				//Sometimes, if there is no buffer, start is not sent in buffer
				if(/*isLive && */isBuffering && !clip.baseClip.isAd) {
					if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: BufferEnd from Start')")};
					if(!this.titleFromPlaylist) {
						this.duration = clip.mediaLength/1000;
					}
					buffer(BUFFER_END);
				}	

				/*if(isStartEventSent && !clip.baseClip.isAd){
					//buffer(BUFFER_BEGIN);
				}*/				
				
				if(!isStartEventSent){
					if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Send Start from Start Event')")};
					
					// Check Clip in Buffer Event
					var bool:Boolean = checkClipIsOK (clip);
					
					if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: In Start Event Clip is OK? " + bool + "')")};
					
					this.sendStart(clip);
					pingTimer.start();
				}
				
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: mediaStartListener " + currentTime + "')")};
			}catch(err:Error){
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Error "+err+"')")};
			}
		}
		
		private function streamSwitchedListener(e:PdkEvent):void{
			try{
				var streamSwitch : StreamSwitch = e.data as StreamSwitch;
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: streamSwitchedListener')")};
				
			}catch(err:Error){
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Error "+err+"')")};
			}
		}
		
		private function sendStop():void{
			var eventStop:AnalyticEvent = new AnalyticEvent("stop",pamCode);
			eventProcessor.addToQueue(eventStop);
			restartAnalytics();
			updateCode();
		}
		private function sendStart(clip : Clip):void {
			try{								
				this.isAdvertisement = clip.baseClip.isAd;
				if(!this.titleFromPlaylist) {
					duration=clip.mediaLength/1000;
				}
				//if less than 0 -> is Live
				if(duration < 0){
					duration =0;
				}

				currentTime = clip.currentMediaTime;
				bitrate 	= clip.baseClip.bitrate;
				
				try
				{
					if ( clip != null && !this.titleFromPlaylist ) 
					{
						if ( clip.title == null || clip.title == "" )
						{
							if ( clip.baseClip.title != "" )
							{
								properties.content_metadata.title = clip.baseClip.title;
							}
						}
						else
						{
							properties.content_metadata.title = clip.title;
						}
					} 
					else 
					{
						if ( properties.content_metadata.title == "" )
						{
							properties.content_metadata.title = "Undefined";
						}
					}
					
					if ( clip != null )
					{
						realUrlResource	= clip.URL;
						if(!this.titleFromPlaylist) {
							urlResource 	= clip.URL;
						}
					}
					
					if ( realUrlResource == null || realUrlResource == "" )
					{
						if ( clip.baseClip.URL != null )
						{
							realUrlResource	= clip.baseClip.URL;
							if(!this.titleFromPlaylist) {
								urlResource 	= clip.baseClip.URL;
							}
						}
					}
				}
				catch (err:Error){}

				if(mediaResourceYouboraData !="" && mediaResourceYouboraData!="null"){
					urlResource = mediaResourceYouboraData;
				}
			
				if(clip.mediaLength ==-1){
					isLive=true;
				}else{
					isLive=false;
				}
				
				
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: START :: TITLE BC " + clip.baseClip.title + "')")};
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: START :: TITLE CL " + clip.title + "')")};
				
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: START :: URL      " + urlResource + "')")};
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: START :: DURATION " + duration + "')")};
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: START :: TITLE    " + properties.content_metadata.title + "')")};
								
				var eventStart:AnalyticEvent = new AnalyticEvent("start",pamCode);
				eventStart.setDuration(duration);
				eventStart.setResource(urlResource);
				eventStart.setPamCode(pamCode);
				eventProcessor.addToQueue(eventStart);
				eventProcessor.startProcessor();
				isStartEventSent = true;
				
				var now:Date = new Date();
				lastPingTime = now.time;
				
			}catch(err:Error){
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Error "+err+"')")};
			}
		}
		private function sendJoin(bufferDuration : int ):void {
			var eventBuffer:AnalyticEvent = new AnalyticEvent("join",pamCode);
			eventBuffer.setTime(currentTime);
			eventBuffer.setDuration(bufferDuration); 
			eventProcessor.addToQueue(eventBuffer); 
		}
		private function sendBuffer(bufferDuration : int ) :void{
			var eventBuffer:AnalyticEvent = new AnalyticEvent("buffer",pamCode);
			eventBuffer.setTime(currentTime);
			eventBuffer.setDuration(bufferDuration);
			if(!isAdvertisement){
				eventBuffer.setMediaDuration(duration);
			}
			eventProcessor.addToQueue(eventBuffer); 
		}
		private function sendPause(): void{
			var eventPause : AnalyticEvent = new AnalyticEvent("pause",pamCode);
			eventProcessor.addToQueue(eventPause);
		}
		private function sendResume() :void{
			var eventResume : AnalyticEvent =  new AnalyticEvent("resume",pamCode);
			eventProcessor.addToQueue(eventResume);
		}
		private function sendError(errorCode : String):void{
			var eventError:AnalyticEvent = new AnalyticEvent("error",pamCode);
			eventError.setTime(currentTime);
			eventError.setDuration(duration);
			eventError.setBitrate(bitrate);
			eventError.setDiffTimePing(0); 
			eventError.setErrorCode(errorCode);
			eventError.setResource(urlResource);
			eventError.setProperties(cloneObject(properties));
			eventProcessor.addToQueue(eventError); 
			pingTimer.stop();
			pingTimer.reset(); 
			
		}
		
		private function cloneObject(object:Object, filter:Function=null):Object
		{
			if (filter != null)
			{
				var filteredClone:Object = filter(object);
				if (filteredClone) return filteredClone;
			}
			
			if (object is Number || object is String || object is Boolean || object == null)
				return object;
			else if (object is Array)
			{
				var array:Array = object as Array;
				var arrayClone:Array = [];
				var length:int = array.length;
				for (var i:int=0; i<length; ++i) arrayClone[i] = cloneObject(array[i], filter);
				return arrayClone;
			}
			else 
			{
				var objectClone:Object = {};
				var typeDescription:XML = null;
				
				if (getQualifiedClassName(object) == "Object")
				{
					for (var key:String in object) 
						objectClone[key] = cloneObject(object[key], filter);
				}
				else
				{
					typeDescription = describeType(object);
					var properties:XMLList = typeDescription.variable + typeDescription.accessor;
					
					for each (var property:XML in properties)
					{
						var propertyName:String = property.@name.toString();
						var access:String = property.@access.toString(); 
						var nonSerializedMetaData:XMLList = property.metadata.(@name == "NonSerialized");
						
						if (access != "writeonly" && nonSerializedMetaData.length() == 0)
							objectClone[propertyName] = cloneObject(object[propertyName], filter);
					}
				}
				
				return objectClone;
			}
		}
		
		private function buffer(action:int) : void{
			var now :int = new Date().time;
			if(action==BUFFER_BEGIN){				
				bufferTimeBegin = now;
				isBuffering=true;
			}else if (isStartEventSent){

				var bufferDuration : int = now - bufferTimeBegin;
				if(bufferDuration < 10){
					bufferDuration=10;
				}
				if(!isAdvertisement && !isJoinEventSent){
					sendJoin(bufferDuration);
					isJoinEventSent = true;
				}else{
					sendBuffer(bufferDuration);
				}
				isBuffering = false;
			}
		}
		
		
		private function getParamValue(key:String):String
		{ 
			var pluginParams:Object = LoaderInfo(this.root.loaderInfo).parameters; 
			for(var param:String in pluginParams) {  
				if(param == key) { return pluginParams[param]; } 
			}			
			return null;
		}
		
		private function readParameters ():void
		{  
			if(false) { ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: ReadParameters')"); } 			
			youboraDataString = getParamValue("youboraData");
		} 
		
		public function sendAnalytics(type:String, actPamCode:String, time:Number=0, duration:Number=0, errorCode:String="", bitrate:Number=0, resourceURLSended:String="", diffTimeLastPing:Number=0, _properties:Object=null):void
		{
			var request:URLRequest;
			var loader:URLLoader = new URLLoader();
			
			var loaderTimeout:URLLoader = new URLLoader();
			
			if(debug) { ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: sendAnalytics :: "+type+"')"); }
			
			switch (type)
			{
				case "buffer": 
					if(isSeeking == false) {
						request = new URLRequest(pamBufferUnderrunUrl+"?time="+time+"&duration="+duration+"&code="+escape(actPamCode));
					}
					break;
				
				case "join":
					request = new URLRequest(pamJoinTimeUrl+"?eventTime=0&time="+duration+"&code="+escape(actPamCode));
					break;
				
				case "start":  
					if ( pamLastCode == actPamCode ) { return; }
					
					var pamPingTimeInSeconds:Number = 5;
					var windowLocation:String = "";
					try
					{
						//videoAssetUrl 			= escape(videoAssetUrl); 
						windowLocation 			= ExternalInterface.call("window.location.href.toString");
						pamPingTimeInSeconds	= pamPingTime / 1000; 
					}
					catch (err:Error) 
					{
						
					} 
					var string:String = "";
					if ( extraparam1 != "" ) { string += "&extraparam1=" + extraparam1; }
					if ( extraparam2 != "" ) { string += "&extraparam2=" + extraparam2; }
					if ( extraparam3 != "" ) { string += "&extraparam3=" + extraparam3; }
					if ( extraparam4 != "" ) { string += "&extraparam4=" + extraparam4; }
					if ( extraparam5 != "" ) { string += "&extraparam5=" + extraparam5; }
					if ( extraparam6 != "" ) { string += "&extraparam6=" + extraparam6; }
					if ( extraparam7 != "" ) { string += "&extraparam7=" + extraparam7; }
					if ( extraparam8 != "" ) { string += "&extraparam8=" + extraparam8; }
					if ( extraparam9 != "" ) { string += "&extraparam9=" + extraparam9; }
					if ( extraparam10 != "" ) { string += "&extraparam10=" + extraparam10; }
					
					if ( hashTitle != "" ) { string += "&hashTitle=" + hashTitle; }
					if ( cdn != "" ) { string += "&cdn=" + cdn; }
					if ( isp != "" ) { string += "&isp=" + isp; }
					if ( ip != "" ) { string += "&ip=" + ip; } 
					
					if ( l3Type != "" ) { string += "&nodeType=" + l3Type; } 
					if ( l3Host != "" ) { string += "&nodeHost=" + l3Host; } 
					if ( transaction != "" ) { string += "&transcode=" + transaction; } 
					
					stopResume = false;
					var randNumber:uint = uint(Math.random() * 100000);
										
					request = new URLRequest(pamStartUrl+"?system="+escape(accountCode)+"&user="+escape(username)+"&pluginVersion="+escape(pluginVersion)+
						"&pingTime="+pamPingTimeInSeconds+"&live="+live+"&totalBytes="+totalBytes+"&resource="+escape(urlResource)+"&referer="+escape(windowLocation)+
						"&properties="+ com.adobe.serialization.json.JSON.encode(properties)+"&code="+escape(actPamCode)+"&isBalanced="+balancerExecuted+"&randomNumber="+randNumber+ "&duration="+ duration + "" + string);
					break;
				
				case "stop":
					if(isBalancing == false)
					{
						request = new URLRequest(pamStopUrl+"?code="+escape(actPamCode));
						
					}	
					break;
				
				case "playTime":
					if (debug) { ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Sending playTime: "+ currentTime  +"')"); }
					if(httpSecure){
						playTimeService = playTimeService.split("//")[1];				
						playTimeService = "https://"+playTimeService;
					}
					var urlDataWithCode:String = playTimeService + "?contentId=" + contentId +"&userId="  + username + "&playTime=" + currentTime + "&random=" + Math.random();					
					request = new URLRequest(urlDataWithCode);
					
					break;
				
				case "playTimeStop":
					if (debug) { ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Sending playTime restart')"); }
					var urlDataWithCode2:String = playTimeService + "?contentId=" + contentId +"&userId="  + username + "&playTime=0&random=" + Math.random();					
					request = new URLRequest(urlDataWithCode2);
					break;
				case "pause":
					request = new URLRequest(pamPauseUrl+"?code="+escape(actPamCode));
					break;
				
				case "resume":
					request = new URLRequest(pamResumeUrl+"?code="+escape(actPamCode));
					break;
				
				case "ping":
					var pamPingTimeInSecondsRevert:Number = pamPingTime / 1000;
					var dataType:Number = 0;
					
					request = new URLRequest(pamPingUrl+"?time="+time+"&pingTime="+pamPingTimeInSecondsRevert+"&bitrate="+bitrate+
							"&code="+escape(actPamCode)+"&diffTime="+diffTimeLastPing);
					
					pingTimer.stop();
					pingTimer.reset();
					if (!loaderTimeout.hasEventListener(IOErrorEvent.IO_ERROR))
					{
						loaderTimeout.addEventListener(IOErrorEvent.IO_ERROR, checkPingTimeResponse);
					}
					if (!loaderTimeout.hasEventListener(Event.COMPLETE))
					{
						loaderTimeout.addEventListener(Event.COMPLETE, checkPingTimeResponse);
					}
					break;
				
				case "error":
						var pamPingTimeInSeconds_error:Number = pamPingTime / 1000;
						var windowLocation_error:String = "";
						try
						{ 
							//	videoAssetUrl 				= escape(videoAssetUrl);
							windowLocation_error		= ExternalInterface.call("window.location.href.toString");
						}
						catch (err:Error) 
						{ 
						} 
						
						//private var errorMessage:String;
						
						if ( hashTitle != "" ) { string += "&hashTitle=" + hashTitle; }
						if ( transaction != "" ) { 
							string += "&transcode=" + transaction; 
						} else {
							string += "&transcode=";
						}
						
						var message:String = "Undefined";
						
						if(errorCode == '9000') {
							message = "thePlatform Unknown error";
						}
						
						request = new URLRequest(pamErrorUrl+"?system="+escape(accountCode)+"&player=platform_flash&user="+escape(username)+"&pluginVersion="+escape(pluginVersion)+
							"&pingTime="+pamPingTimeInSeconds_error+"&live="+live+"&totalBytes="+totalBytes+"&duration="+this.duration+"&resource="+escape(resourceURLSended)+
							"&referer="+escape(windowLocation_error)+"&properties="+ com.adobe.serialization.json.JSON.encode(_properties)+"&isBalanced="+balancerExecuted+
							"&errorCode="+escape(errorCode)+"&msg="+escape(message)+"&code="+escape(actPamCode)+"&diffTime="+diffTimeLastPing+"&random="+Math.random());
					
					
					break;
			}
			request.method = URLRequestMethod.GET;
			if (type != "ping"){ loader.load(request); } else { loaderTimeout.load(request);  }
		} 
		
		private function checkPingTimeResponse(event:Event):void
		{ 
			pingTimer.start();
		}
		private function _onPingTimer(event:TimerEvent):void
		{ 
			try
			{	
				
				var nowDate:Date			= new Date();
				var actPingTime:Number		= nowDate.time;
				var diffTimePing:Number 	= actPingTime - lastPingTime;
				
				if ( diffTimePing > 60000 )
					diffTimePing = 60000;
				
				if ( diffTimePing < 0 )
					diffTimePing = 5000;
				
				var eventPing:AnalyticEvent = new AnalyticEvent("ping",pamCode);				
				if(this.isAdvertisement) { 
					eventPing.setTime(0);
				} else { 
					eventPing.setTime(currentTime);	
				}				
				eventPing.setDuration(0);
				eventPing.setErrorCode("");
				eventPing.setBitrate(bitrate);
				eventPing.setDiffTimePing(diffTimePing);
				lastPingTime = actPingTime;
				eventProcessor.addToQueue(eventPing);
				
				if (debug) { ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: sendPing ')"); }
			}
			catch (err:Error) 
			{
				if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: _onPingTimer error: "+err+"')");	}
			}
			
		}
		
		private function parseYouboraData():void{
			accountCode = youboraData.accountCode;
			debug = youboraData.debug;
			username =  youboraData.username;
			mediaResourceYouboraData = youboraData.mediaResource;
			contentId = youboraData.contentId;
			properties = youboraData.properties;
			concurrencySessionId = youboraData.concurrencySessionId;
			service = youboraData.service;
			try{
				concurrencyEnabled = youboraData.concurrencyProperties.enabled;
				concurrencyCode = youboraData.concurrencyProperties.concurrencyCode;
				concurrencyService = youboraData.concurrencyProperties.concurrencyService;
				concurrencyMaxCount = youboraData.concurrencyProperties.concurrencyMaxCount;
				concurrencyRedirectUrl = youboraData.concurrencyProperties.concurrencyRedirectUrl;
				concurrencyIpMode = youboraData.concurrencyProperties.concurrencyIpMode ; 
			}catch(err:Error){
				if(debug) {ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Concurrency Disabled :: Error in parameters setting')");	} 
			}
			
			// Resume 
			try{
				resumeEnabled = youboraData.resumeProperties.resumeEnabled;
				resumeCallback =  youboraData.resumeProperties.resumeCallback;
				if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: resume Callback :: "+resumeCallback+"')");	} 
				resumeService = youboraData.resumeProperties.resumeService;
				playTimeService = youboraData.resumeProperties.playTimeService;
			}catch(err:Error){
				if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: resume Disabled :: Error in parameters setting')");	} 
			}
			
			// ExtraParams 
			try{
			
				extraparam1 = youboraData.extraParams.extraparam1;
				extraparam2 = youboraData.extraParams.extraparam2;
				extraparam3 = youboraData.extraParams.extraparam3;
				extraparam4 = youboraData.extraParams.extraparam4;
				extraparam5 = youboraData.extraParams.extraparam5;
				extraparam6 = youboraData.extraParams.extraparam6;
				extraparam7 = youboraData.extraParams.extraparam7;
				extraparam8 = youboraData.extraParams.extraparam8;
				extraparam9 = youboraData.extraParams.extraparam9;
				extraparam10 = youboraData.extraParams.extraparam10;
			}catch(err:Error){
				if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Error in extraParams setting')");	} 
			}
			
			//Others
			try{
				transaction = youboraData.transaction;
				hashTitle = youboraData.hashTitle;
				cdn = youboraData.text_cdn;
				ip = youboraData.text_ip;
				isp = youboraData.text_isp;
				nqsDebugServiceEnabled = youboraData.nqsDebugServiceEnabled;
				httpSecure = youboraData.httpSecure;
				
			}catch(err:Error){
				if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Error in other params setting')");	} 
			}
		}
		private function instantiateAnalytics() : void{
			
			if(accountCode == null){
				eventProcessor.setEnable(false);
			}
			if(httpSecure){
				service = service.split("//")[1];				
				service = "https://"+service;
			}
			pamUrl = service + "/data?system="+accountCode+"&pluginVersion="+pluginVersion+"&targetDevice="+targetDevice+"&output=xml";
			if(nqsDebugServiceEnabled){
				pamUrl = pamUrl + "&nqsDebugServiceEnabled=true";
			}
			eventProcessor = new EventProcessor(this);  
			fetchAnalytics(); 
		}
		private function fetchAnalytics():void
		{
			if (debug) { ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: fetchAnalytics')"); }
			if ( isXMLGetted && ( pamCode != "" ) ) 
				return;
			
			var pamAnalyticsLoader:URLLoader = new URLLoader();
			
			pamAnalyticsLoader.load(new URLRequest(pamUrl));
			pamAnalyticsLoader.addEventListener(Event.COMPLETE, loadAnalytics);
		}
		private function loadAnalytics(event:Event):void
		{ 
			var xml:XML = new XML(event.target.data);
			testXML = xml;
			
			try 
			{ 
				// Analytics
				try  {
					if( pamCode == "") {
						pamCode = xml.c;
					}

					if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: loadAnalytics :: Analytics Enabled')");} 
				
				} catch (err:Error) {
					
					if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: loadAnalytics :: Analytics Disabled')");	} 
					eventProcessor.setEnable(false);
				}
				
				// Level 3
				try
				{  
					if( cdnNodeData == true ) {
						if(debug) { ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Level 3 Headers Enabled')"); }
						var header :String = ExternalInterface.call(UtilsCNN.GET_CNN_INFO_METHOD,mediaResource);
						var response :Array = ExternalInterface.call(UtilsCNN.PARSE_L3_HEADER_METHOD,header,1);						 
						
						l3Host = response[0];
						l3Type = response[1];
						
						if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Level 3 Host: "+l3Host+"')");ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Level 3 Type: "+l3Type+"')");	}
					}  
					else
					{
						if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Level 3 Headers Disabled')");}
					}
				} 
				catch (err:Error) 
				{  
					if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Level 3 Headers Error: "+ err +" ')");}
				}
				
				
				// Balancer
				try 
				{
					if (xml.b == 1)
					{ 
						if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: loadAnalytics :: Balancer Enabled')");}
						/*if(balanceEnabled == true)
						{
							balancerStart();
						}*/
					}
					else
					{
						balanceEnabled = false;
						if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: loadAnalytics :: Balancer Disabled')");}
						
					}
				}
				catch (err:Error)
				{
					balanceEnabled = false;
					if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: loadAnalytics :: Balancer Disabled')");}    					
				}
				
				// Host
				try 
				{ 
					var protocol:String = "http://";
					if(this.httpSecure==true){
						protocol="https://";
					}
					pamBufferUnderrunUrl = protocol+xml.h+"/bufferUnderrun";
					pamJoinTimeUrl = protocol+xml.h+"/joinTime";
					pamStartUrl = protocol+xml.h+"/start";
					pamStopUrl = protocol+xml.h+"/stop";
					pamPauseUrl = protocol+xml.h+"/pause";
					pamResumeUrl = protocol+xml.h+"/resume";
					pamPingUrl = protocol+xml.h+"/ping";
					pamErrorUrl = protocol+xml.h+"/error";  
				}
				catch (err:Error)
				{
					if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: loadAnalytics :: Invalid Host')");}  
					eventProcessor.setEnable(false);
				}
				
				try 
				{ 
					if( resumeEnabled == true ) 
					{ 
						checkResumeStatus(); 
					} 
					
				} 
				catch (err:Error) 
				{  
					if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Resume Error: "+ err +" ')");}
				} 
				
				try { 
					if( concurrencyEnabled == true ) {
						if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Concurrency Enabled')");	}
						concurrencyInterval = setInterval(checkConcurrencyStatus,10000);
						checkConcurrencyStatus(); 
					}  
					else
					{
						if(debug)	{ ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Concurrency Disabled')"); }					
					}
				} 
				catch (err:Error) 
				{  
					if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Concurrency Error: "+ err +" ')");}
				} 
				
				var pingTimeInMilliseconds:Number = Number(xml.pt) * 1000;
				pamPingTime = pingTimeInMilliseconds;
				
				if (pingTimer == null || typeof(pingTimer) == undefined) 
				{
					pingTimer = new Timer(pamPingTime, 1);
					pingTimer.addEventListener(TimerEvent.TIMER, _onPingTimer);
				}
				
				this.eventProcessor.startProcessor(); 
				isXMLGetted = true; 
			} 
			catch (error:Error) 
			{
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: loadAnalytics error: " + error + "')");	}  
				eventProcessor.setEnable(false);
				
			}
		}
		private function isCloseToEnd(currentTime : int) : Boolean{
			// 10 %
			var threshold :Number = 0.1;
			return (currentTime +(threshold * (duration*1000))) >= (duration*1000) ;
		}
		private function restartAnalytics():void
		{			
			isStartEventSent		= false;
			isJoinEventSent 		= false;
			isPingRunning 			= false;
			isBuffering				= false;
			stopResume 				= true;
			accummulatedPlayTime 	= 0;
			currentTime 			= 0;
			fetchAnalytics();
			// Reset resource and title
			urlResource = "";
			properties.content_metadata.title = "";
			
			pingTimer.stop();
			pingTimer.reset(); 
		}
		private function updateCode():void
		{
			
			// If pamCode is empty, don't do updateCode
			if ( pamCode == "" ) return;
			
			if ( pamCodeCounter == 0 )
			{
				pamCodeOrig = pamCode;
			}
			
			pamCodeCounter++;
			pamCode = pamCodeOrig + "_" + String(pamCodeCounter);
			
		}
		private function sendResumeStatus():void 
		{
			try
			{ 	
				if(stopResume == false) {
					var actualPamCode:String = pamCode;
					var eventResume:AnalyticEvent = new AnalyticEvent("playTime",actualPamCode);
					eventProcessor.addToQueue(eventResume);
				}
				setTimeout(sendResumeStatus,6000); 			 
			}
			catch (e:Error)
			{
				if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: sendResumeStatus error: "+ e +"')");	}    					
			}
		}
		private function checkConcurrencyStatus():void
		{
			if (concurrencyEnabled == true)
			{ 
				
				concurrencyTimeoutTimer = setTimeout(timedConcurrencyFunction,3000);
				
				try 
				{ 
					var resumeLoader:URLLoader = new URLLoader();		
					var resumeURL:String = "";
					if(httpSecure){
						concurrencyService = concurrencyService.split("//")[1];				
						concurrencyService = "https://"+concurrencyService;
					}
					if(concurrencyIpMode == true)
					{
						resumeURL = concurrencyService + "?accountCode="+accountCode+"&concurrencyCode="+concurrencyCode+"&concurrencyMaxCount=" + concurrencyMaxCount + "&random=" + Math.random();
					}
					else
					{
						resumeURL = concurrencyService + "?accountCode="+accountCode+"&concurrencySessionId="+concurrencySessionId+"&concurrencyCode="+concurrencyCode+"&concurrencyMaxCount=" + concurrencyMaxCount + "&random=" + Math.random();
					}
					var request:URLRequest = new URLRequest(resumeURL);
					resumeLoader.addEventListener(Event.COMPLETE, loadConcurrencyRequest);
					resumeLoader.load(request);
				}
				catch (e:Error) 
				{
					clearInterval(concurrencyInterval);
					if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Concurrency Error: "+e+"')");} 			
				}
			}
			else
			{
				if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Concurrency Disabled')");clearInterval(concurrencyInterval);	} 
			}
		} 
		
		private function checkResumeStatus():void
		{
			if (resumeEnabled == true)
			{ 
				if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Resume Enabled')");}
				
				resumeTimeoutTimer = new Timer(3000);
				resumeTimeoutTimer.addEventListener("timer", timedResumeFunction);
				
				try 
				{ 
					if(httpSecure){
						resumeService = resumeService.split("//")[1];				
						resumeService = "https://"+resumeService;
					}
					var request:URLRequest = new URLRequest(resumeService + "?contentId=" + contentId + "&userId=" + username + "&random=" + Math.random());
					var resumeLoader:URLLoader = new URLLoader(); 
					resumeLoader.addEventListener(Event.COMPLETE, loadResumeRequest);
					resumeLoader.load(request);
				}
				catch (e:Error) 
				{
					if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Resume Error: "+e+"')");	} 			
				}
			}
			else
			{
				if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Resume Disabled')");} 
			}
		} 
		private function loadResumeRequest (event:Event):void
		{
			if(debug){ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: loadresumeEvent')");	} 
			
			try
			{
				var response:String = new String(event.target.data);
				if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Resume Response: "+ response +"')");	} 
				if( response == "0") {
					if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: loadresumeEvent :: No previous state')");} 
				}  
				else if ( response == "")
				{	
					if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: loadresumeEvent :: Unknown state... Disabling...')");}  
					resumeEnabled = false;
				} 
				else
				{ 
					if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: loadresumeEvent :: Resume available: "+ response+"s ')");}
					resumeMovetoSecs = Number(response); 
					if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: loadresumeEvent :: call: "+ resumeCallback+"s ')");}
					if(!resumeCallBackCalled){
						ExternalInterface.call(resumeCallback,resumeMovetoSecs);
						resumeCallBackCalled =true;
					}
				}
			}
			catch (e:Error)
			{
				if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: loadresumeEvent :: Resume error: "+ e +" ')");}   					
			}
		}
		private function timedResumeFunction (e:TimerEvent):void
		{ 
			if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Resume Timeout Reached - Disabling...')");} 
			resumeTimeoutTimer.stop();			
			resumeEnabled = false;			
		}
		private function timedConcurrencyFunction (e:TimerEvent):void
		{ 
			if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Concurrency Timeout Reached - Disabling...')");} 
			clearInterval(concurrencyInterval);
			clearTimeout(concurrencyTimeoutTimer);			
			concurrencyEnabled = false;			
		}
		
		private function loadConcurrencyRequest (event:Event):void
		{ 
			
			try
			{
				var response:String = new String(event.target.data);
				if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Concurrency Response: "+ response +"')");} 
				if( response == "0") {
					if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Concurrency :: 0 :: Continue...')");	} 
				}   
				else if (response == "1")
				{ 
					if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Concurrency :: 1 :: Exiting...')");}  
					try
					{ 
						if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Concurrency to => ::"+concurrencyRedirectUrl+"')");}
						sendError("14000");
						ExternalInterface.call("youboraData.redirectFunction",concurrencyRedirectUrl);


					}
					catch(e:Error)
					{
						if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: loadConcurrencyRequest :: Error while callback: "+ e+" ')");	}  
					}
				}
				else
				{
					if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: Concurrency :: Unknown response: ["+response+"] Disabling...')");}
					clearInterval(concurrencyInterval);
					clearTimeout(concurrencyTimeoutTimer);			
					concurrencyEnabled = false;
				}
			}
			catch (e:Error)
			{
				if(debug)	{ExternalInterface.call("console.log('SmartPlugin :: thePlatform :: loadConcurrencyRequest :: Concurrency error: "+ e +" ')");}   					
			}
		} 
	}
	
}