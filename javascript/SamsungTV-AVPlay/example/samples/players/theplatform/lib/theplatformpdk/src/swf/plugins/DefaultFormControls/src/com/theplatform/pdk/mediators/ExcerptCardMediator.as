package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.containers.ComponentArea;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.data.CardCallerType;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.ReleaseState;
	import com.theplatform.pdk.data.StreamType;
	import com.theplatform.pdk.data.TimeObject;
	import com.theplatform.pdk.functions.ExcerptFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;

	public class ExcerptCardMediator extends FormCardMediator
	{
		public function ExcerptCardMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
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
			//register any functions here
		}
		
		override protected function deckCreated():void
		{
			//init the video with the current clip
			if (currentClip)
			{
				card.call(ExcerptFormFunctions.setVideoClip, [currentClip]);
			}
			
		}
		
		override protected function cardCreationStart(card:Card):void
		{
			//we have a chance here to turn the card off if it isn't valid
			var valid:Boolean = true;//disprove
			var c:Clip = currentClip;
			if (!c || c.isAd
                    || c.noSkip
                    || c.length <= 0
                    || c.streamType==StreamType.MP3
                    || c.isExternal
                    || (_controller as PlayerController).getFullScreenState()
                    || (_controller as PlayerController).getReleaseState() == ReleaseState.STANDBY
                    || isLive()
                    || c.streamType == "HttpStream")
			{
				valid = false;
			}
						
			card.isActive = valid;//if isActive is set to false, then the card isn't included in the deck hierarchy
		}
		
		private function isLive():Boolean
		{
			var timeObj:TimeObject = (_controller as PlayerController).getCurrentPosition();
			if (timeObj)
				return timeObj.isLive;
			return false;
		}
		
		/* override protected function cardDestroyed(card:Card):void
		{
			//unRegister functions here
			super.cardDestroyed(card);
		} */
		
	}
}
