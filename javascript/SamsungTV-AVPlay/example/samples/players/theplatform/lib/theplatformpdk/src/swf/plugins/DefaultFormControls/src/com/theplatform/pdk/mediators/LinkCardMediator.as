package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.containers.ComponentArea;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.controls.IconType;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.events.ExcerptFormEvent;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.functions.HeaderFunctions;
	import com.theplatform.pdk.functions.LinkFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.utils.PdkStringUtils;

	import flash.system.System;

	public class LinkCardMediator extends ExcerptableFormCardMediator
	{

		public function LinkCardMediator(id:String, controller:IViewController, metadata:ItemMetaData = null, resources:Object = null)
		{
			super(id, controller, metadata, resources);
			if (!_title) _title = "Link";
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
			super.deckCreated();
			updateExcerptTimes();

			if (card.parent && card.parent.id != "tpShareCard")
			{
				card.call(HeaderFunctions.setHeaderIcon, [IconType.IMAGE_LINK]);
				card.call(HeaderFunctions.setHeaderTitle, [_title]);
			}
			
			_controller.dispatchEvent(new PdkEvent(PdkEvent.OnShowLinkForm, true));
		}

		override protected function cardCreated(componentArea:ComponentArea):void
		{
			super.cardCreated(componentArea);
			card.registerFunction(LinkFormFunctions.closeLink, this, closeLink);
			card.registerFunction(LinkFormFunctions.copyToClipboard, this, copyToClipboard);
			//TO DO: we'll need to figure out a better way of checking if part of the excerptForm, but for now, we'll hard code it.
			if(card.parent && (card.parent.id == "tpExcerptCard" || (card.parent.parent && card.parent.parent.id == "tpExcerptCard"))) 
			{
				var ca:ComponentArea = componentArea;
				if (ca)
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
			card.unRegisterFunction(LinkFormFunctions.closeLink);
			card.unRegisterFunction(LinkFormFunctions.copyToClipboard);
			super.cardDestroyed(card);
			
			_controller.dispatchEvent(new PdkEvent(PdkEvent.OnShowLinkForm, false));
		}

		/* override public function destroy():void
		   {
		   super.destroy();
		 } */


		//---- local functions to the form ----

		private function closeLink():void
		{
			_controller.hideCard("forms");
		}

		private function copyToClipboard():void
		{
			card.call(LinkFormFunctions.setChecked, [true]);
			var selectedText:String = card.call(LinkFormFunctions.selectLinkText, [])
			System.setClipboard(selectedText);

			_controller.trace("--- Sending OnLinkCopy ---", "LinkCardMediator");
			var evt:PdkEvent = new PdkEvent(PdkEvent.OnLinkCopy, _excerpt);
			_controller.dispatchEvent(evt);

		}

		protected override function updateExcerptTimes():void
		{
			var linkText:String = getLinkText();
			card.call(LinkFormFunctions.setLinkText, [linkText]);
		}

	}
}
