package com.theplatform.pdk.events
{
	final public class TextReady extends PdkBaseEvent
	{
		//list of local Header event names
		public static const OnAdvancedTextReady:String = "OnAdvancedTextReady";

		public function TextReady(bubbles:Boolean = false, cancelable:Boolean = false)
		{
			super(OnAdvancedTextReady, null, bubbles, cancelable);
		}
	}
}
