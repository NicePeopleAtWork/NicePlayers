package com.theplatform.pdk.events
{
	import flash.events.Event;

	public class PageContainerEvent extends Event
	{
		public static const NUMBER_OF_PAGES_CHANGED:String = "numberOfPagesChanged";  // data is the new number of pages.
		public static const CURRENT_PAGE_CHANGED:String = "currentPageChanged";  // data is the new current page.
		
		public var data:Object;
		
		public function PageContainerEvent(type:String, data:Object, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
	
			this.data = data;
		}
		
	}
}