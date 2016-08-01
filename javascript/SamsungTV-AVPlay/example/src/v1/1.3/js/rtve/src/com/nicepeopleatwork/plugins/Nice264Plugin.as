package com.nicepeopleatwork.plugins
{
	import com.adobe.serialization.json.JSON;
	import com.nice.event.AnalyticEvent;
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.TimerEvent;
	import flash.external.ExternalInterface;
	import flash.net.NetStream;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.utils.Timer;
	
	import fl.video.VideoEvent;
	import fl.video.VideoPlayer;

	public class Nice264Plugin
	{
		
		private const BUFFER_START :String = "bufferStart";
		private const BUFFER_END : String = "bufferEnd";
		private var _player =  null;
		
		
		protected var pamUrl:String = "";
		protected var pamCode:String  = "";
		protected var pamCodeOrig:String = "";
		protected var pamLastCode:String = "last";
		protected var pamCodeCounter:Number = 0;
		protected var pamPingTime:Number = 0;
		protected var pamBufferUnderrunUrl:String = "";
		protected var pamJoinTimeUrl:String = "";
		protected var pamStartUrl:String = "";
		protected var pamStopUrl:String = "";
		protected var pamPauseUrl:String = "";
		protected var pamResumeUrl:String = "";
		protected var pamPingUrl:String = "";
		protected var pamErrorUrl:String = "";
		protected var pamBitrateUrl:String = "";
		protected var pamResourceURL:String = "";
		protected var pamManifestURL:String = "";
		
		protected var bufferTimeBegin:Number;
		protected var pingTimer:Timer;
		protected var pingTimeoutTimer:Timer;
		
		protected var lastPingTime:Number = 0;
		
		protected var isStartEventSent:Boolean = false;
		protected var isStopEventSent:Boolean = true;
		protected var isJoinEventSent:Boolean = false;
		protected var isPauseEventSent:Boolean = false;
		protected var isPingRunning:Boolean = false;
		
		protected var seekingEventTime:Number = 0;
		
		/* RESOURCE QUEUE */
		protected var resourcesQueue:Array = new Array();
		
		/* QUEUE EVENTS */
		protected var eventsQueue:Array = new Array();
		protected var eventsTimer:Timer;
		
		/* GET XML ANALYTICS */
		protected var isXMLGetted:Boolean=false;
		
		/* FOR AVERAGE BITRATE CALCULATE */
		protected var avgBitrate:Number = 0;
		
		private var pluginEnabled:Boolean = false;
		private var pluginVersion:String = "2.0.2_osmf";
		//private var mediaResource:URLResource;
		private var isAFA:Boolean;
		private var isDynamicStream:Boolean;
		//private var _mediaElement:MediaElement;
		private var mediaMetadata:Object;
		private var isLive:Object;
		private var windowLocation:String;
		private var bdtest:Number;
		private var username:String;
		private var system:String;
		private var drmType:String;
		private var testXML:XML;
		private var service:String;
		private var loaderTimeout:URLLoader;
		private var now:Date;
		private var referer : String;
		
		public function Nice264Plugin(player : EventDispatcher, youboraData : Nice264YouboraData)
		{
			_player = player;
			
			
			// Get plugin metadata
			if (youboraData.mediaData as Object != null)
			{
				mediaMetadata = youboraData.mediaData as Object;
			}
			if (youboraData.isLive as Object != null)
			{
				isLive = youboraData.isLive as Object;
			}
			if (youboraData.username as String != null)
			{
				username = youboraData.username as String;
			}
			if (youboraData.system as String != null)
			{
				system = youboraData.system as String;
			}
			if (youboraData.service as String != null)
			{
				service = youboraData.service as String;
			}
			if (youboraData.resource as String != null)
			{
				pamResourceURL = youboraData.resource as String;
			}
			
			try
			{
				drmType = youboraData.drmType as String;
			}
			catch (error:Error)
			{				
				drmType = "none";
			}
			
			referer = ExternalInterface.call("window.location.href.toString");
			
							
			// Check if Widevine and replace .mp4 for .wvm
			if (drmType == "widevine")
			{
				var replacedPamResourceURL:String = pamResourceURL.replace(".mp4", ".wvm");
				pamResourceURL = replacedPamResourceURL;
			}
			
			// Add resource to Queue
			resourcesQueue.push(pamResourceURL);
			
			// Change service url if provided or use default
			if (service != "" && service != null && service != "undefined")
			{
				pamUrl = service+"/data?system="+system+"&pluginVersion="+pluginVersion;
			} 
			else 
			{
				pamUrl = "http://nqs.nice264.com/data?system="+system+"&pluginVersion="+pluginVersion;
			}
			
			// Prepare analytics for the upcoming video
			fetchAnalytics();
			
			// Search url for AFA (.f4m, .f4v)
			if (pamResourceURL.indexOf(".f4m") != -1 || pamResourceURL.indexOf(".f4v") != -1){
				isAFA = true;
			} else {
				isAFA = false;
			}
			
			// Search url for HTTP or RTMP (progressive o dynamic stream)
			isDynamicStream = false
			if (pamResourceURL.indexOf("rtmp://") != -1 
				|| pamResourceURL.indexOf("rtmpe://") != -1 
				|| pamResourceURL.indexOf("rtp://") != -1 
				|| pamResourceURL.indexOf("rtmpt://") != -1){
				isDynamicStream = true;
			}
			//ExternalInterface.call("console.log('About to setListener !!')");
			player.addEventListener(NetStatusEvent.NET_STATUS, onStatusChanged);			
		}
		
		private function onStatusChanged(e:NetStatusEvent):void {
		
			switch(e.info.code){
				case "NetStream.Play.Start":
					// START
					try
					{
						if (!isStartEventSent)
						{	
							
							sendStart();
						}
						processBuffer(BUFFER_START);

					}
					catch(error:Error) {}
					
					// PING
					
					
					break;
				
				case "NetStream.Pause.Notify":
					if(!isStopEventSent){
						var eventPause:AnalyticEvent = new AnalyticEvent("pause",pamCode);
						addToQueue(eventPause);
					}
				break;
				
				case "NetStream.Unpause.Notify":
					if(!isStartEventSent){
						sendStart();
					}else{
						var eventResume:AnalyticEvent = new AnalyticEvent("resume",pamCode);
						addToQueue(eventResume);
					}
				break;
				
				case "NetStream.Play.Stop":
					onMediaStop();					
				break;
				
				case "NetStream.Buffer.Full":
					processBuffer(BUFFER_END);
					break;
			}
			
		}
		
		private function sendStart() :void{
			try
			{
				isStartEventSent = true;
				
				now = new Date();
				lastPingTime = now.time;
				
				var eventStart:AnalyticEvent = new AnalyticEvent("start",pamCode);
				eventStart.setResource(pamResourceURL);
				
				addToQueue(eventStart);
				
				isStopEventSent = false;
			
			
				if (!isPingRunning)
				{
					if ( ( pingTimer != null ) && ( typeof(pingTimer) != undefined ) )
					{
						isPingRunning = true;
						pingTimer.start();
					}
				}
			}
			catch(err:Error) {
				//ExternalInterface.call("console.log('****** Error in Start : " + err.name  + " , "+err.message+"')");
			}
		}
		private function processBuffer(state:String) :void{
			if(state == BUFFER_START){
				bufferTimeBegin = new Date().getMilliseconds();
			}else if(state == BUFFER_END){
				var bufferTimeEnd :Number= new Date().getMilliseconds();
				var eventType :String="buffer";
				if(!isJoinEventSent){
					eventType="join";
					isJoinEventSent = true;
				}
				
				
				var eventBufferOrJoin :AnalyticEvent = new AnalyticEvent(eventType,pamCode);
				eventBufferOrJoin.setTime(_player.time);
				eventBufferOrJoin.setDuration(bufferTimeEnd - bufferTimeBegin);
				addToQueue(eventBufferOrJoin);
				
			}
		}
		
		private function onMediaStop():void
		{
			// If now is stopped, don't send other stop
			
			var actualPamCode:String = pamCode;
			
			var nowDate:Date	= new Date();
			var actPingTime:Number	= nowDate.time;
			var diffTimePing:Number = actPingTime - lastPingTime;
			
			if ( isStopEventSent )
			{
				return;
			}
			
			try
			{
				// flags
				isStartEventSent = false;
				isStopEventSent = true;
				isJoinEventSent = false;
				isPingRunning = false;
				isPauseEventSent = false;
				bufferTimeBegin = 0;
				
				// ping

				pingTimer.stop();
				pingTimer.reset();
				
				// ping timeout
				//pingTimeoutTimer.stop();
				//pingTimeoutTimer.reset();
				
				// stop
				//sendAnalytics("stop");
				
				// add event stop to queue
				var eventStop:AnalyticEvent = new AnalyticEvent("stop",actualPamCode);
				eventStop.setDiffPingTime(diffTimePing);
				
				addToQueue(eventStop);
				
				// Update LastTime
				lastPingTime = actPingTime;
				
				updateCode();
			}
			catch(error:Error)
			{
				
			}
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
		
		private function fetchAnalytics():void
		{		
			// If pamCode not null, and we've getted XML Analytics
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
				pamCode = xml.c;
				
				pamBufferUnderrunUrl = "http://"+xml.h+"/bufferUnderrun";
				pamJoinTimeUrl = "http://"+xml.h+"/joinTime";
				pamStartUrl = "http://"+xml.h+"/start";
				pamStopUrl = "http://"+xml.h+"/stop";
				pamPauseUrl = "http://"+xml.h+"/pause";
				pamResumeUrl = "http://"+xml.h+"/resume";
				pamPingUrl = "http://"+xml.h+"/ping";
				pamErrorUrl = "http://"+xml.h+"/error";
				pamBitrateUrl = "http://"+xml.h+"/bitrate";
								
				// Create Timer for ProcessEvents
				if (eventsTimer == null || typeof(eventsTimer) == undefined) // Create Timer object only once
				{
					eventsTimer = new Timer(100, 0);
					eventsTimer.addEventListener(TimerEvent.TIMER, processEvents);
					eventsTimer.start();
				}
				
				// Create Timer for Pings (Only one time)
				var pingTimeInMilliseconds:Number = Number(xml.pt) * 1000;
				pamPingTime = pingTimeInMilliseconds;
				
				if ( pingTimer == null || typeof(pingTimer) == undefined ) // Create Timer object only once
				{
					pingTimer = new Timer(pamPingTime, 1);
					pingTimer.addEventListener(TimerEvent.TIMER, _onPingTimer);
				}
				
				// If XML received after play video, now start pingTimer
				if ( isStartEventSent )
				{
					isPingRunning = true;
					pingTimer.start();
				}
				
				// Set Bandwidth Test
				//setBandwidthTest();
				
				// Enable plugin
				pluginEnabled = true;
				
				// XML now getted
				isXMLGetted = true;				
			} 
			catch (error:Error) 
			{
				pluginEnabled = false;
			}
		}
		
		private function _onPingTimer(event:TimerEvent):void
		{
			try{
				
				//sendAnalytics("ping", 0, 0, "", getTotalBytes());
				
				var nowDate:Date	= new Date();
				var actPingTime:Number	= nowDate.time;
				var diffTimePing:Number = actPingTime - lastPingTime;
				
				if ( diffTimePing > 60000 )
					diffTimePing = 60000;
				
				// add ping to queue
				var eventPing:AnalyticEvent = new AnalyticEvent("ping",pamCode);
				try{
					eventPing.setTime(_player.time);
				}catch(err:Error){
					eventPing.setTime(0);
				}
				eventPing.setDuration(0);
				eventPing.setErrorCode("");
				eventPing.setBitrate(getTotalBytes());
				eventPing.setDiffPingTime(diffTimePing);
				
				// Update LastTime
				lastPingTime = actPingTime;
				
				addToQueue(eventPing);
				
				
				pingTimer = new Timer(pamPingTime, 1);
				pingTimer.addEventListener(TimerEvent.TIMER, _onPingTimer);
				pingTimer.start();
			}catch(err:Error){
				//ExternalInterface.call("console.log('****** Error in _onPingTimer : " + err.name  + " , "+err.message+"')");

			}

		}
		
		private function addToQueue (analyticEvent:AnalyticEvent):void
		{
			//ExternalInterface.call("console.log('$$$$$$ Add to Queue [" + eventsQueue.length + "] " + analyticEvent.getType() + "')");
			
			if ( eventsQueue.length < 30 )
				eventsQueue.push(analyticEvent);
		}
		
		private function processEvents (event:Event):void
		{
			while ( eventsQueue.length > 0 )
			{
				try{
				var actualEvent:AnalyticEvent = AnalyticEvent ( eventsQueue.shift() );
				
				if ( actualEvent != null )
				{
					// Process Event
					
					var typeEvent:String	= actualEvent.getType();
					var actPamCode:String	= actualEvent.getPamCode();
					
					// If pamCode inserted in Event is empty, use pamCode from global
					if ( actPamCode == "" )
						actPamCode = pamCode;
					
					// If pamCode global is emtpy too.. don't process event
					if ( actPamCode == "" )
						return;
					
					switch ( typeEvent )
					{
						case "join":
						case "buffer":
							
							var assetCurrentTime:Number = actualEvent.getTime();
							var bufferTimeTotal:Number	= actualEvent.getDuration();
							
							sendAnalytics(typeEvent, actPamCode, assetCurrentTime, bufferTimeTotal);
							
							break;
						
						case "error":
							
							var time:Number			= actualEvent.getTime();
							var duration:Number		= actualEvent.getDuration();
							var errorCode:String	= actualEvent.getErrorCode();
							var bitrate:Number		= actualEvent.getBitrate();
							
							sendAnalytics(typeEvent, actPamCode, time, duration, errorCode, bitrate);
							
							break;
						
						case "ping":
							
							var timePing:Number	= actualEvent.getTime();
							var durationPing:Number	= actualEvent.getDuration();
							var errorCodePing:String	= actualEvent.getErrorCode();
							var bitratePing:Number	= actualEvent.getBitrate();
							var diffPingTime:Number	= actualEvent.getDiffPingTime();
							
							sendAnalytics(typeEvent, actPamCode, timePing, durationPing, errorCodePing, bitratePing, "", diffPingTime);
							
							break;
						
						case "start":
							
							var resourceAct:String	= actualEvent.getResource();
							
							sendAnalytics(typeEvent, actPamCode, 0, 0, "", 0, resourceAct );
							
							break;
						
						case "stop":
							
							var diffPingTimeStop:Number	= actualEvent.getDiffPingTime();
							
							sendAnalytics(typeEvent, actPamCode, 0, 0, "", 0, "", diffPingTimeStop );
							
							break;
						
						case "pause":
						case "resume":
						default:
							
							sendAnalytics(typeEvent, actPamCode);
							
							break;
					}
				}
			}catch(err:Error){
				//ExternalInterface.call("console.log('Error in processEvent: "+err.name +" , "+ err.message+" '");
			}
		}
		}
		
		private function sendAnalytics(type:String, actPamCode:String, time:Number=0, duration:Number=0, errorCode:String="", bitrate:Number=0, resourceURLSended:String="", diffTimeLastPing:Number=0):void
		{
			var request:URLRequest = null;
			var loader:URLLoader = new URLLoader();
			var loaderTimeout:URLLoader = new URLLoader();
			
			switch (type)
			{
				case "buffer":
					
					/**
					 * @param time: current playback head (time)
					 * @param duration: buffer duration (time)
					 * @param code: analytics hash
					 **/
					
					request = new URLRequest(pamBufferUnderrunUrl+"?time="+time+"&duration="+duration+"&code="+escape(actPamCode));
					
					break;
				
				case "join":
					
					/**
					 * @param time: duration
					 * @param code: analytics hash
					 **/
					
					request = new URLRequest(pamJoinTimeUrl+"?eventTime="+time+"&time="+duration+"&code="+escape(actPamCode));
					
					break;
				
				case "start":
					
					/**
					 * @param system: system for linking results with pam
					 * @param resource: video resource url
					 * @param ip: analytics ip
					 * @param properties: video properties metadata
					 * @param code: analytics hash
					 **/
									
					//var new_resource_url:String = "";
					var properties:String = "";
					var pamPingTimeInSeconds:Number = 5;
					var liveMetadata:Boolean = false;
					
					if ( pamLastCode == actPamCode )
					{
						return;
					}
					
					try 
					{						
						try 
						{
							properties = com.adobe.serialization.json.JSON.encode(mediaMetadata);
							
						}
						catch (err:Error) 
						{
							
							properties = "";
						}
						
						pamPingTimeInSeconds = pamPingTime / 1000; // from milliseconds to seconds
						
						try 
						{
							liveMetadata = isLive.live;
							
						} 
						catch (err:Error) 
						{
							
							liveMetadata = false;
						}
					}
					catch (err:Error) 
					{
						
					}
					
					if ( resourceURLSended == "" )
					{
						resourceURLSended = pamResourceURL;
					}
					
					//ExternalInterface.call("console.log('****** Start Event : Create with resource: " + resourceURLSended  + " ')");
					
					var randNumber:uint = uint(Math.random() * 100000);
					
					request = new URLRequest(pamStartUrl+"?system="+escape(system)+"&user="+escape(username)+"&pluginVersion="+escape(pluginVersion)+"&pingTime="+pamPingTimeInSeconds+
						"&live="+liveMetadata+"&totalBytes="+getTotalBytes()+"&resource="+escape(resourceURLSended)+"&referer="+escape(referer)+
						"&properties="+escape(properties)+"&code="+escape(actPamCode)+"&duration="+_player.duration+"&randomNumber="+randNumber);
					
					pamLastCode = actPamCode
					
					//ExternalInterface.call("console.log('****** Start Event : Request " + request.url + "')");
					
					break;
				
				case "stop":
					
					/**
					 * @param code: analytics hash
					 **/
					
					request = new URLRequest(pamStopUrl+"?code="+escape(actPamCode));
					
					break;
				
				case "pause":
					
					/**
					 * @param code: analytics hash
					 **/
					
					request = new URLRequest(pamPauseUrl+"?code="+escape(actPamCode));
					
					break;
				
				case "resume":
					
					/**
					 * @param code: analytics hash
					 **/
					
					request = new URLRequest(pamResumeUrl+"?code="+escape(actPamCode));
					
					break;
				
				case "ping":
					
					/**
					 * @param code: analytics hash
					 * @param bytes: total loaded bytes
					 * @param bitrate: asset bitrate (when available)
					 * @param dataType: QoS object referer (HTTP dataType = 0, RTMP dataType = 1)
					 **/
					
					try
					{
						var pamPingTimeInSecondsAgain:Number = pamPingTime / 1000; // From milliseconds to seconds
						var dataType:Number;
						
						if (isDynamicStream)
						{
							dataType = 1;
						}
						else 
						{
							dataType = 0;
						}
						
						var currentTime:Number;
						
						request = new URLRequest(pamPingUrl+"?time="+time+"&pingTime="+pamPingTimeInSecondsAgain+"&totalBytes="+bitrate+
							"&dataType="+dataType+"&code="+escape(actPamCode)+"&diffTime="+diffTimeLastPing);
						
					}
					catch (err:Error) 
					{
						
					}
					
					// listen to the request response
					//ExternalInterface.call("console.log('StopTimer 778')");
					/*pingTimer.stop();
					pingTimer.reset();*/
					
					if (!loaderTimeout.hasEventListener(IOErrorEvent.IO_ERROR))
					{
						//loaderTimeout.addEventListener(IOErrorEvent.IO_ERROR, retryPing);
					}
					
					if (!loaderTimeout.hasEventListener(Event.COMPLETE))
					{
						//loaderTimeout.addEventListener(Event.COMPLETE, checkPingTimeResponse);
					}
					
					break;
				
				case "error":
					
					/**
					 * @param errorCode: error numeric code
					 * @param code: analytics hash
					 * event.info.description: media asset.flv
					 * event.info.code: NetStatusEvent code
					 * event.info.details: details related to the event
					 * event.info.level: specifies if code is an "status" or an "error"
					 **/
					
					var new_resource_url_error:String = pamResourceURL;
					var properties_error:String;
					
					try 
					{
						properties_error = com.adobe.serialization.json.JSON.encode(mediaMetadata);
					}
					catch (err:Error) 
					{
						properties_error = "";
					}
					
					var pamPingTimeInSeconds_error:Number = pamPingTime / 1000; // From milliseconds to seconds
					var liveMetadata_error:Boolean;
					
					try 
					{
						liveMetadata_error = isLive.live;
					} 
					catch (err:Error) 
					{
						liveMetadata_error = false;
					}
					
					request = new URLRequest(pamErrorUrl+"?system="+escape(system)+"&user="+escape(username)+"&pluginVersion="+escape(pluginVersion)+"&pingTime="+pamPingTimeInSeconds_error+
						"&live="+liveMetadata_error+"&totalBytes="+getTotalBytes()+"&resource="+escape(new_resource_url_error)+"&referer="+escape(windowLocation)+
						"&properties="+escape(properties_error)+"&errorCode="+escape(errorCode)+"&code="+escape(actPamCode));
					
					
					break;
			}
			
			if ( request != null )
			{
				request.method = URLRequestMethod.GET;
				
				if (type != "ping")
				{
					loader.load(request);
				}
				else
				{
					loaderTimeout.load(request);
				}
			}
		}
		
		private function getTotalBytes(){
			try{
				return _player.bytesTotal;
			}catch(err:Error){
				return 0;
			}
			
		}
		
	}
}