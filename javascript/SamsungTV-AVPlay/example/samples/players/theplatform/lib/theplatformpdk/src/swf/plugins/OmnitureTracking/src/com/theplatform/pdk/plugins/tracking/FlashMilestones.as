package com.theplatform.pdk.plugins.tracking
{

	public class FlashMilestones implements IMilestones {
		
		private var _milestones:Object;
		
	   	public function FlashMilestones(o:Object)
		{
			_milestones = o;
		}
		
		public function setProperty(n:String, v:Object):void
		{
			_milestones[n] = v;
		}

		public function getProperty(n:String):Object
		{
			return _milestones[n];
		}
     }
}
