package com.theplatform.pdk.events
{
	import flash.events.Event;
	
	public class RelatedItemInteractionEvent extends Event
	{
		public static const OnItemClick:String = "OnItemClick";        // data is Release
		public static const OnItemRollover:String = "OnItemRollover";  // data is Release
		public static const OnItemRollout:String = "OnItemRollout";    // data is Release
		public static const OnNextClick:String = "OnNextClick"         // data is null
		public static const OnPreviousClick:String = "OnPreviousClick" // data is null
		
		public var data:Object;
		
		public function RelatedItemInteractionEvent(type:String=null, data:Object=null, bubbles:Boolean = false, cancelable:Boolean = false)
		{
			super(type, bubbles, cancelable);
			this.data = data;
		}
		
	}
}