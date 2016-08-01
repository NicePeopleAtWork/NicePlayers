package com.theplatform.pdk.plugins.tracking
{

	import flash.external.ExternalInterface;

	public class JSMedia implements IMedia {
		
		private var _s_code_name:String;
		private var _context:IContextDataMapping;
		private var _monitor:String;
		
	   	public function JSMedia(n:String)
		{
			_s_code_name = n;
			ExternalInterface.call(_s_code_name + ".loadModule", "Media");
			_context = new JSContextDataMapping(n);
		}
		
		public function get trackVars():String
		{
			return ExternalInterface.call("eval", _s_code_name + ".Media.trackVars");
		}
		
		public function set trackVars(t:String):void
		{
			ExternalInterface.call("eval", _s_code_name + ".Media.trackVars = '" + t + "'");
		}
		
		public function get trackEvents():String
		{
			return ExternalInterface.call("eval", _s_code_name + ".Media.trackEvents");
		}
		
		public function set trackEvents(t:String):void
		{
			ExternalInterface.call("eval", _s_code_name + ".Media.trackEvents = '" + t + "'");
		}		
		
		public function get trackMilestones():String
		{
			return ExternalInterface.call("eval", _s_code_name + ".Media.trackMilestones");
		}
		
		public function set trackMilestones(t:String):void
		{
			ExternalInterface.call("eval", _s_code_name + ".Media.trackMilestones = '" + t + "'");
		}

		public function get trackSeconds():Number
		{
			return ExternalInterface.call("eval", _s_code_name + ".Media.trackSeconds");
		}
		
		public function set trackSeconds(s:Number):void
		{
			ExternalInterface.call("eval", _s_code_name + ".Media.trackSeconds = " + s);
		}
		
		public function get contextDataMapping():IContextDataMapping
		{
			return _context;
		}
		
		public function get trackUsingContextData():Boolean
		{
			return ExternalInterface.call("eval", _s_code_name + ".Media.trackUsingContextData");
		}
		
		public function set trackUsingContextData(t:Boolean):void
		{
			ExternalInterface.call("eval", _s_code_name + ".Media.trackUsingContextData = " + t);
		}
		
		public function get monitor():Object
		{
			return _monitor;
		}
		
		public function set monitor(f:Object):void
		{
			_monitor = f as String;
			ExternalInterface.call("eval", _s_code_name + ".Media.monitor = " + _monitor);
		}
		
		public function get trackWhilePlaying():Boolean
		{
			return ExternalInterface.call("eval", _s_code_name + ".Media.trackWhilePlaying");
		}
		
		public function set trackWhilePlaying(t:Boolean):void
		{
			ExternalInterface.call("eval", _s_code_name + ".Media.trackWhilePlaying = " + t);
		}

		public function get segmentByMilestones():Boolean
		{
			return ExternalInterface.call("eval", _s_code_name + ".Media.segmentByMilestones");
		}
		
		public function set segmentByMilestones(t:Boolean):void
		{
			ExternalInterface.call("eval", _s_code_name + ".Media.segmentByMilestones = " + t);
		}

		public function track(t:String):void
		{
			ExternalInterface.call(_s_code_name + ".Media.track", t);
		}

		public function open(t:String, p:Number, id:String):void
		{
			ExternalInterface.call(_s_code_name + ".Media.open", t, p, id);
		}
		
		public function play(t:String, p:Number):void
		{
			ExternalInterface.call(_s_code_name + ".Media.play", t, p);
		}
		
		public function stop(t:String, p:Number):void
		{
			ExternalInterface.call(_s_code_name + ".Media.stop", t, p);
		}
		
		public function close(t:String):void
		{
			ExternalInterface.call(_s_code_name + ".Media.close", t);
		}
				
		public function setProperty(n:String, v:Object):void
		{
			ExternalInterface.call("eval", _s_code_name + ".Media['" + n + "'] = '" + v + "'");
		}

		public function getProperty(n:String):Object
		{
			return ExternalInterface.call("eval", _s_code_name + ".Media['" + n + "']");
		}
     }
}
