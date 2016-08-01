package com.theplatform.pdk.plugins.tracking
{

	import flash.external.ExternalInterface;

	public class JSMilestones implements IMilestones {
		
		private var _s_code_name:String;
		
	   	public function JSMilestones(n:String)
		{
			_s_code_name = n;
			ExternalInterface.call("eval", _s_code_name + ".Media.contextDataMapping['a.media.milestones'] = {}");
		}
				
		public function setProperty(n:String, v:Object):void
		{
			ExternalInterface.call("eval", _s_code_name + ".Media.contextDataMapping['a.media.milestones']['" + n + "'] = '" + v + "'");
		}

		public function getProperty(n:String):Object
		{
			return ExternalInterface.call("eval", _s_code_name + ".Media.contextDataMapping['a.media.milestones']['" + n + "']");
		}
     }
}
