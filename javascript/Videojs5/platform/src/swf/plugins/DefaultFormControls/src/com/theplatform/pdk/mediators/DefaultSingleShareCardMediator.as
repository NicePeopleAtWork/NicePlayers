package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.containers.ComponentArea;
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.controls.IconType;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.Release;
	import com.theplatform.pdk.data.ReleaseState;
	import com.theplatform.pdk.data.SharingSite;
	import com.theplatform.pdk.functions.HeaderFunctions;
	import com.theplatform.pdk.functions.SingleSharingCardFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	
	public class DefaultSingleShareCardMediator extends ExcerptableFormCardMediator
	{
		private var _sharingSite:SharingSite;
		private var _iController:IViewController;

		public function DefaultSingleShareCardMediator(id:String, controller:IViewController, metadata:ItemMetaData=null)
		{
			super(id, controller, metadata, resources);
			_iController = controller;
			if (!_title) _title = "Post";
		}

		override protected function setItem(item:Item):void
		{
			super.setItem(item);
			
		}

		override protected function cardCreated(componentArea:ComponentArea):void
		{
			super.cardCreated(componentArea);
			
			//register any functions here
			card.registerFunction("postSharingSite", this, postSharingSite);
			
			var id:String = card.initVars["sharingSiteId"];
			_sharingSite = PlayerController(_iController).getSharingSite(id);
		}
		
		override protected function deckCreated():void
		{
			setControls();
			card.call(HeaderFunctions.setHeaderIcon, [IconType.POST]);
			card.call(HeaderFunctions.setHeaderTitle, [_title]);
		}
		
		override protected function cardCreationStart(card:Card):void
		{
			//we have a chance here to turn the card off if it isn't valid
			var valid:Boolean = true;//disprove
			var curClip:Clip = currentClip;
			var curRelease:Release = currentRelease;
			
			if (((!curClip || curClip.isAd || curClip.isExternal) && !curRelease) || (_iController as PlayerController).getFullScreenState())
			{
				valid = false;
			}
			card.isActive = valid;//if isActive is set to false, then the card isn't included in the deck hierarchy
		}

		private function setControls():void
		{
			var ic:* = _sharingSite.icon;
			var title:String = _sharingSite.title;
			var clipTitle:String = currentClip ? currentClip.title : currentRelease.title;
			var instructionTxt:String = "Share this clip on " + title;
			
			card.call(SingleSharingCardFunctions.setSharingSiteIcon, [ic]);
			card.call(SingleSharingCardFunctions.setSharingSiteTitle, [title]);
			card.call(SingleSharingCardFunctions.setSharingSiteClipTitle, [clipTitle]);
			card.call(SingleSharingCardFunctions.setSharingSiteInstructions, [instructionTxt]);
		}
		
		private function postSharingSite():void
		{
			var curClip:Clip = currentClip;
			//TODO: We're having to create a clip from the loaded release an awful lot, this should be 
			if (!curClip)
			{
				curClip = (_controller as IPlayerController).createClipFromBaseClip(this.getBaseClip());
				curClip.releasePid = currentRelease.pid;
			}
			(_iController as PlayerController).postSharingSite(_sharingSite, curClip, null, _excerpt, null);
			//_iController.hideCard("forms");
		}
		
		override protected function cardDestroyed(card:Card):void
		{
			super.cardDestroyed(card);
			//unRegister functions here
		}
	}
}
