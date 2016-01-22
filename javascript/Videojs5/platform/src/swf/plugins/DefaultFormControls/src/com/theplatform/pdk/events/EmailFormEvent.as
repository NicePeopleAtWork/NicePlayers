package com.theplatform.pdk.events
{
	public class EmailFormEvent extends PdkBaseEvent
	{
		public static const OnEmailSubmitted:String = "OnEmailSubmitted";
		public static const OnEmailCancelled:String = "OnEmailCancelled";
		
		public function EmailFormEvent(type:String=null, data:Object=null)
		{
			super(type, data);
		}
		
	}
}