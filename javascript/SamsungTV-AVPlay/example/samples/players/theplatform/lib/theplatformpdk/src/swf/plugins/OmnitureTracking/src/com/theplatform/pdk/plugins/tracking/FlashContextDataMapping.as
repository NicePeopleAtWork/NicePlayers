package com.theplatform.pdk.plugins.tracking
{

	public class FlashContextDataMapping implements IContextDataMapping {
		
		private var _context:Object;
		private var _milestones:IMilestones;
		
	   	public function FlashContextDataMapping(o:Object)
		{
			_context = o;
			if (o.milestones)
			 	_milestones = new FlashMilestones(o.milestones);
			else
				_milestones = new FlashMilestones(o.miletones = {});
		}
		
		public function get milestones():IMilestones
		{
			return _milestones;
		}

		public function setProperty(n:String, v:Object):void
		{
			_context[n] = v;
		}

		public function getProperty(n:String):Object
		{
			return _context[n];
		}
     }
}
