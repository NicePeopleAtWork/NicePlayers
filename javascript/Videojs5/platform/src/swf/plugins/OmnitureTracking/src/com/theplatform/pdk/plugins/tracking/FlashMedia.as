package com.theplatform.pdk.plugins.tracking
{

	import com.omniture.AppMeasurement;
	import com.omniture.AppMeasurement_Module_Media;

	public class FlashMedia implements IMedia {
		
		private var _media:AppMeasurement_Module_Media;
		private var _context:FlashContextDataMapping;
		
	   	public function FlashMedia(m:AppMeasurement_Module_Media)
		{
			_media = m;
			if (m.contextDataMapping)
				_context = new FlashContextDataMapping(m.contextDataMapping);
			else
				_context = new FlashContextDataMapping(m.contextDataMapping = {});
		}
		
		public function get trackVars():String
		{
			return _media.trackVars;
		}
		
		public function set trackVars(t:String):void
		{
			_media.trackVars = t;
		}
		
		public function get trackEvents():String
		{
			return _media.trackEvents;
		}
		
		public function set trackEvents(t:String):void
		{
			_media.trackEvents = t;
		}		
		
		public function get trackMilestones():String
		{
			return _media.trackMilestones;
		}
		
		public function set trackMilestones(t:String):void
		{
			_media.trackMilestones = t;
		}

		public function get trackSeconds():Number
		{
			return _media.trackSeconds;
		}
		
		public function set trackSeconds(s:Number):void
		{
			_media.trackSeconds = s;
		}
		
		public function get contextDataMapping():IContextDataMapping
		{
			return _context;
		}
		
		public function get trackUsingContextData():Boolean
		{
			return _media.trackUsingContextData;
		}
		
		public function set trackUsingContextData(t:Boolean):void
		{
			_media.trackUsingContextData = t;
		}
		
		public function get monitor():Object
		{
			return _media.monitor;
		}
		
		public function set monitor(f:Object):void
		{
			_media.monitor = f as Function;
		}
		
		public function get trackWhilePlaying():Boolean
		{
			return _media.trackWhilePlaying;
		}
		
		public function set trackWhilePlaying(t:Boolean):void
		{
			_media.trackWhilePlaying = t;
		}

		public function get segmentByMilestones():Boolean
		{
			return _media.segmentByMilestones;
		}
		
		public function set segmentByMilestones(t:Boolean):void
		{
			_media.segmentByMilestones = t;
		}

		public function track(t:String):void
		{
			// do nothing...
		}

		public function open(t:String, p:Number, id:String):void
		{
			_media.open(t, p, id);
		}
		
		public function play(t:String, p:Number):void
		{
			_media.play(t, p);
		}
		
		public function stop(t:String, p:Number):void
		{
			_media.stop(t, p);
		}
		
		public function close(t:String):void
		{
			_media.close(t);
		}
				
		public function setProperty(n:String, v:Object):void
		{
			_media[n] = v;
		}

		public function getProperty(n:String):Object
		{
			return _media[n];
		}
     }
}
