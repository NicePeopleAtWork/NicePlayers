package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.containers.ComponentArea;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.mediators.CardMediator;
	import com.theplatform.pdk.metadata.ItemMetaData;

	public class EmailCaptchaEndCardMediator extends CardMediator
	{
		public function EmailCaptchaEndCardMediator(id:String, controller:IViewController, metadata:ItemMetaData, resources:Object)
		{
			super(id, controller, metadata, resources);
		}

		override protected function setItem(item:Item):void
		{
			super.setItem(item);
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
		}

		override protected function cardCreated(componentArea:ComponentArea):void
		{
			super.cardCreated(componentArea);
		/*
		   card.registerFunction(CaptchaFunctions.submit, this, submit);
		   requestImageUrl();
		 */
		}
	}
}