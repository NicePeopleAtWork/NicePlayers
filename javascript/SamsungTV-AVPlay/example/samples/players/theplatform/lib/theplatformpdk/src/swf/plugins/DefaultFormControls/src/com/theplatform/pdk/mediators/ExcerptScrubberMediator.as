package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.metadata.ItemMetaData;

	public class ExcerptScrubberMediator extends Mediator
	{
		//private var _scrubber:ExcerptScrubber;
		
		public function ExcerptScrubberMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
		}
		
		override protected function setItem(item:Item):void
		{
			//_scrubber = item as ExcerptScrubber;
			
			super.setItem(item);
			
			//set events, register functions, etc.
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
		}
		
	}
}
