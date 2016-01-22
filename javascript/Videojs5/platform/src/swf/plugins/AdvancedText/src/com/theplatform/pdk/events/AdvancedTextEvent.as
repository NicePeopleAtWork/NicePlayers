package com.theplatform.pdk.events
{
	public class AdvancedTextEvent extends PdkBaseEvent
	{
		public static const OnTextDisplayObject:String = "OnTextDisplayObject";
		
		public function AdvancedTextEvent(type:String=null, data:Object=null)
		{
			super(type, data);
		}
		
	}
}