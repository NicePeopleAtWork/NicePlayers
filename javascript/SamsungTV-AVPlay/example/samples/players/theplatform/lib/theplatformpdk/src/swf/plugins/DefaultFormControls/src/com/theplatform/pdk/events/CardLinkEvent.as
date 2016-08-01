package com.theplatform.pdk.events
{
	public class CardLinkEvent extends PdkBaseEvent
	{
		public static const OnLinkSelected:String = "OnCardLinkSelected";
		
		public function CardLinkEvent(type:String=null, data:Object=null)
		{
			super(type, data);
		}
		
	}
}