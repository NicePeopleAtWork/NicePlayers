package com.theplatform.pdk.events
{
	public class ExcerptFormEvent extends PdkBaseEvent
	{
		public static const START_TIME_CHANGED:String = "startTimeChanged";
		public static const END_TIME_CHANGED:String = "endTimeChanged"; 

		public function ExcerptFormEvent(type:String=null, data:Object=null)
		{
			super(type, data);
		}
	}
}