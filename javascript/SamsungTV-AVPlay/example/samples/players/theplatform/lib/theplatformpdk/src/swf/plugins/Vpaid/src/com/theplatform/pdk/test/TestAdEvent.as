package com.theplatform.pdk.test {
	
	import flash.events.Event;
	
	class TestAdEvent extends flash.events.Event
	{
		public function TestAdEvent(type:String)
		{
			super(type);
		}

		public var data:Object;
	}
}