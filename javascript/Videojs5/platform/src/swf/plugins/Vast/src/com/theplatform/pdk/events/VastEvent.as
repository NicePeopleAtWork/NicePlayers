package com.theplatform.pdk.events
{
	public class VastEvent extends PdkBaseEvent
	{
		public static const OnVastAdSuccess:String = "OnVastAdSuccess";//data = playlist
		public static const OnVastAdFailure:String = "OnVastAdFailure";//data = clip
		public static const OnVastDebug:String = "OnVastDebug";//data = {message, className, level}
		
		public function VastEvent(type:String=null, data:Object=null, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, data, bubbles, cancelable);
		}
	}
}