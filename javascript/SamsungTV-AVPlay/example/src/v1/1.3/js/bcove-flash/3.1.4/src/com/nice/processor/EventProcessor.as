package com.nice.processor
{
	import Module;
	import com.nice.event.AnalyticEvent;
	
	import flash.events.Event;
	import flash.events.TimerEvent;
	import flash.utils.Timer;

	public class EventProcessor
	{
		/* QUEUE EVENTS */
		protected var eventsQueue:Array = new Array();
		protected var eventsTimer:Timer;
		
		protected var _module:Module = null;
		private   var now:Date;
		
		public function EventProcessor ( module:Module ) 
		{
			this._module = module;	
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
					
					// If pamCode inserted in Event is empty, use pamCode from global
					if ( actPamCode == "" )
						actPamCode = this._module.getPamCode();
					
					// If pamCode global is emtpy too.. don't process event
					if ( actPamCode == "" )
						return;
					
					switch ( typeEvent )
					{
						case "join":
						case "buffer":
							
							var assetCurrentTime:Number = actualEvent.getTime();
							var bufferTimeTotal:Number	= actualEvent.getDuration();
							
							this._module.sendAnalytics(typeEvent, actPamCode, assetCurrentTime, bufferTimeTotal);
							
							break;
						
						case "error":
							
							var time:Number					= actualEvent.getTime();
							var duration:Number				= actualEvent.getDuration();
							var errorCode:String			= actualEvent.getErrorCode();
							var bitrate:Number				= actualEvent.getBitrate();
							var diffTimePingError:Number	= actualEvent.getDiffTimePing();
							
							this._module.sendAnalytics(typeEvent, actPamCode, time, duration, errorCode, bitrate, "", diffTimePingError);
							
							break;
						
						case "ping":
							
							var timePing:Number			= actualEvent.getTime();
							var durationPing:Number		= actualEvent.getDuration();
							var errorCodePing:String	= actualEvent.getErrorCode();
							var bitratePing:Number		= actualEvent.getBitrate();
							var diffTimePing:Number		= actualEvent.getDiffTimePing();   // nowTime - this.module.getLastPingTime();
							
							this._module.sendAnalytics(typeEvent, actPamCode, timePing, durationPing, errorCodePing, bitratePing, "", diffTimePing);
							
							break;
						
						case "start":
							
							var resourceAct:String	= actualEvent.getResource();
							
							this._module.sendAnalytics(typeEvent, actPamCode, 0, 0, "", 0, resourceAct );
							
							break;
						
						case "stop":
							
							var diffTimePingStop:Number		= actualEvent.getDiffTimePing(); 
							
							this._module.sendAnalytics(typeEvent, actPamCode, 0, 0, "", 0, "", diffTimePingStop );
							
							break;
						
						case "pause":
						case "resume":
						default:
							
							this._module.sendAnalytics(typeEvent, actPamCode);
							
							break;
					}
				}
			}
		}
		
		
		
		
		
	}
}