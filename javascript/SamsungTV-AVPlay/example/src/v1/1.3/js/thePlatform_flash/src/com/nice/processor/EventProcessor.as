package com.nice.processor
{
	//import SmartPlugin.*;
	
	import com.nice.event.AnalyticEvent;
	import com.adobe.serialization.json.*;
	
	import flash.events.Event;
	import flash.events.TimerEvent;
	import flash.external.ExternalInterface;
	import flash.utils.Timer;

	public class EventProcessor
	{
		/* QUEUE EVENTS */
		protected var eventsQueue:Array = new Array();
		protected var eventsTimer:Timer;
		
		protected var _plugin:SmartPlugin = null;
		private   var now:Date;
		private  var pamCode : String;
		//Variable to activate o deactivate the module
		private var enable=true;
		public function EventProcessor ( module:SmartPlugin ) 
		{
			this._plugin = module;	
		}

		public function startProcessor():void
		{
			// Create Timer for ProcessEvents
			if (eventsTimer == null || typeof(eventsTimer) == undefined) // create Timer object only once
			{
				eventsTimer = new Timer(100, 0);
				eventsTimer.addEventListener(TimerEvent.TIMER, processEvents);
				eventsTimer.start();
			}
		}
		
		/////////////////////
		// Queue Events Processor
		
		public function addToQueue (analyticEvent:AnalyticEvent):void
		{
			//ExternalInterface.call("console.log('$$$$$$ Add to Queue [" + eventsQueue.length + "] " + analyticEvent.getType() + "')");
			
			if ( eventsQueue.length < 30 )
				eventsQueue.push(analyticEvent);
		}
		
		private function processEvents (event:Event):void
		{
			while ( eventsQueue.length > 0 )
			{
				var actualEvent:AnalyticEvent = AnalyticEvent ( eventsQueue.shift() );
				
				if ( actualEvent != null )
				{
					// Process Event
					
					var typeEvent:String	= actualEvent.getType();
					var actPamCode:String	= actualEvent.getPamCode();
					//If the pamCode is not null, update the reference in the class
					//if it is null, it is an error, but still get the value stored
					if(actPamCode != null){
						pamCode = actPamCode;
					}else{
						actPamCode = pamCode;
					}
										
					// If pamCode global is emtpy too.. don't process event
					if ( actPamCode == "" )
						return;
					
					switch ( typeEvent )
					{
						case "join":
						case "buffer":
							
							var assetCurrentTime:Number = actualEvent.getTime();
							var bufferTimeTotal:Number	= actualEvent.getDuration();
							
							this._plugin.sendAnalytics(typeEvent, actPamCode, assetCurrentTime, bufferTimeTotal, "", 0, "", 0);
							
							break;
						
						case "error":
							
							var time:Number					= actualEvent.getTime();
							var duration:Number				= actualEvent.getDuration();
							var errorCode:String			= actualEvent.getErrorCode();
							var bitrate:Number				= actualEvent.getBitrate();
							var diffTimePingError:Number	= actualEvent.getDiffTimePing();
							var resource:String				= actualEvent.getResource();
							var properties:Object			= actualEvent.getProperties();
														
							this._plugin.sendAnalytics(typeEvent, actPamCode, time, duration, errorCode, bitrate, resource, diffTimePingError, properties);
							
							break;
						
						case "ping":
							
							var timePing:Number			= actualEvent.getTime();
							var durationPing:Number		= actualEvent.getDuration();
							var errorCodePing:String	= actualEvent.getErrorCode();
							var bitratePing:Number		= actualEvent.getBitrate();
							var diffTimePing:Number		= actualEvent.getDiffTimePing();
							
							this._plugin.sendAnalytics(typeEvent, actPamCode, timePing, durationPing, errorCodePing, bitratePing, "", diffTimePing);
							
							break;
						
						case "start":
							
							var resourceAct:String	= actualEvent.getResource();
							var currentTime : int = actualEvent.getTime();
							var duration : Number= actualEvent.getDuration();
							
							// is Ad, duration = 0 to send latter in jointime
							/*if(this._plugin.isAdvertisement) {
								duration = 0;
							}*/
							
							this._plugin.sendAnalytics(typeEvent, actPamCode, currentTime, duration, "", 0, resourceAct );
							
							break;
						
						case "stop":
							var diffTimePingStop:Number		= actualEvent.getDiffTimePing(); 
							this._plugin.sendAnalytics(typeEvent, actPamCode, 0, 0, "", 0, "", diffTimePingStop );
							break;
						
						case "pause":
						case "resume":
						default:
							
							this._plugin.sendAnalytics(typeEvent, actPamCode);
							
							break;
					}
				}
			}
		}
		public function setEnable(enabled:Boolean){
			enable=enabled;
		}
		public function getEnable(){
			return enable;
		}
	}
}