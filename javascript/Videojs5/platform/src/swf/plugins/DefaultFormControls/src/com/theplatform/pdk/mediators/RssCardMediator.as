package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.containers.ComponentArea;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.IconType;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.functions.HeaderFunctions;
	import com.theplatform.pdk.functions.RssFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	
	import flash.system.System;
	import flash.utils.getTimer;

	public class RssCardMediator extends FormCardMediator
	{
		public function RssCardMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
			if (!_title) _title = "Rss";
		}
		
		override protected function setItem(item:Item):void
		{
			super.setItem(item);
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
		}
		
		override protected function deckCreated():void
		{
			var rssUrl:String = _controller.getProperty("RSSURL");
			var rssText:String = (rssUrl) ? substituteUrl(rssUrl) : "";
			card.call(RssFormFunctions.setRssText, [rssText]);
			
			if (card.parent && card.parent.id != "tpShareCard")
			{
				card.call(HeaderFunctions.setHeaderIcon, [IconType.IMAGE_RSS]);
				card.call(HeaderFunctions.setHeaderTitle, [_title]);
			}
		}
		
		override protected function cardCreated(componentArea:ComponentArea):void
		{
			card.registerFunction(RssFormFunctions.closeRss, this, closeRss);
			card.registerFunction(RssFormFunctions.copyToClipboard, this, copyToClipboard);
			//TO DO: we'll need to figure out a better way of checking if part of the excerptForm, but for now, we'll hard code it.
			if(card.parent && (card.parent.id == "tpExcerptCard" || (card.parent.parent && card.parent.parent.id == "tpExcerptCard"))) 
			{
				var ca:ComponentArea =  componentArea;
				if(ca) 
				{
					ca.paddingLeft = 0;
					ca.paddingRight = 0;
					ca.paddingTop = 0;
					ca.paddingBottom = 0;
				}
			}
		}
		
		override protected function cardDestroyed(card:Card):void
		{
			card.unRegisterFunction(RssFormFunctions.closeRss);
			card.unRegisterFunction(RssFormFunctions.copyToClipboard);
			super.cardDestroyed(card);
		}
		
		/* override public function destroy():void
		{
			super.destroy();
		} */


		//---- local functions to the form ----

		private function closeRss():void
		{
			_controller.hideCard("forms");
		}
		
		private function copyToClipboard():void
		{
			card.call(RssFormFunctions.setChecked, [true]);
			var selectedText:String = card.call(RssFormFunctions.selectRssText, [])
			System.setClipboard(selectedText);
			
			_controller.trace("--- Sending OnRssCopy ---", "RssCardMediator");
			var evt:PdkEvent = new PdkEvent(PdkEvent.OnRssCopy, currentClip);
			_controller.dispatchEvent(evt);
		}
	}
}
