package com.theplatform.pdk.plugins.tracking
{

	import flash.external.ExternalInterface;

	public class JSContextDataMapping implements IContextDataMapping {
		
		private var _s_code_name:String;
		private var _milestones:IMilestones;
		
	   	public function JSContextDataMapping(n:String)
		{
			_s_code_name = n;
			ExternalInterface.call("eval", _s_code_name + ".Media.contextDataMapping = {}");
			_milestones = new JSMilestones(n);
		}
				
		public function get milestones():IMilestones
		{
			return _milestones;
		}

		public function setProperty(n:String, v:Object):void
		{
			ExternalInterface.call("eval", _s_code_name + ".Media.contextDataMapping['" + n + "'] = '" + v + "'");
		}

		public function getProperty(n:String):Object
		{
			return ExternalInterface.call("eval", _s_code_name + ".Media.contextDataMapping['" + n + "']");
		}
     }
}
