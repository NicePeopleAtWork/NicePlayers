package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.containers.ComponentArea;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.controls.IconType;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.data.CardCallerType;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.Release;
	import com.theplatform.pdk.data.ReleaseState;
	import com.theplatform.pdk.functions.HeaderFunctions;
	import com.theplatform.pdk.functions.InfoFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;

	public class InfoCardMediator extends CardMediator
	{
		public function InfoCardMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
			if (!_title) _title = "Info";
		}
		
		override protected function setItem(item:Item):void
		{
			super.setItem(item);
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
		}
		
		
		//---- local functions to the form ----

		private function closeInfo():void
		{
			_controller.hideCard("forms");
		}
		
		override protected function cardCreated(componentArea:ComponentArea):void
		{
			card.registerFunction(InfoFormFunctions.closeInfo, this, closeInfo);
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
			card.unRegisterFunction(InfoFormFunctions.closeInfo);
			super.cardDestroyed(card);
		}
		
		override protected function deckCreated():void
		{
			var pController:PlayerController = _controller as PlayerController
			var noCard:Boolean = false;
			

			var releaseState:String = pController.getReleaseState()
			if (releaseState == ReleaseState.EXECUTING)
			{
				var clip:Clip = pController.getCurrentClip();
				
				if (clip)
				{
					var bc:BaseClip = clip.baseClip;
					
					if (bc.isAd) bc = bc.playlistRef.firstContentBaseClip;
					
					card.call(InfoFormFunctions.setInfoTitleText, [clip.title]);
					card.call(InfoFormFunctions.setInfoAuthorText, [bc.author]);
					card.call(InfoFormFunctions.setInfoDescriptionText, [bc.description]);
					card.call(InfoFormFunctions.setInfoCopyrightText, [bc.copyright]);
				}
				else
				{
					showReleaseInfo();
				}
			}
			else if (releaseState == ReleaseState.STANDBY)
			{
				showReleaseInfo();
			}
			else // NONE
			{
				card.call(InfoFormFunctions.setInfoTitleText, ["There is currently no media available"]);
				card.call(InfoFormFunctions.setInfoAuthorText, [""]);
				card.call(InfoFormFunctions.setInfoDescriptionText, [""]);
				card.call(InfoFormFunctions.setInfoCopyrightText, [""]);
			}
			
			if (card.parent && card.parent.id != "tpShareCard")
			{
				card.call(HeaderFunctions.setHeaderIcon, [IconType.IMAGE_INFO]);
				card.call(HeaderFunctions.setHeaderTitle, [_title]);
			}
		}
		
		private function showReleaseInfo():void
		{
			var pc:PlayerController = _controller as PlayerController;
			var currentRelease:Release;
			var initVars:Object = card.initVars
			var cType:String = initVars ? initVars["callerType"] : null;

			var title:String = "";
			var description:String = "";
			var author:String = "";
			var copyright:String = "";
			var prev:Clip = pc.getPreviousClip();
			if(cType == CardCallerType.END_CARD && prev)
			{
				title = prev.baseClip.title;
				description = prev.baseClip.description;
				author = prev.baseClip.author;
				copyright = prev.baseClip.copyright;
			}
			else
			{
				currentRelease = pc.getCurrentRelease();
				if (currentRelease)
				{
					title = currentRelease.title;
					description = currentRelease.description;
					author = currentRelease.author;
					copyright = currentRelease.copyright;
				}
			}
			
			card.call(InfoFormFunctions.setInfoTitleText, [title ? title : ""]);
			card.call(InfoFormFunctions.setInfoDescriptionText, [description ? description : ""]);
			card.call(InfoFormFunctions.setInfoAuthorText, [author ? author : ""]);
			card.call(InfoFormFunctions.setInfoCopyrightText, [copyright ? copyright : ""]);
		}		
		
		/* override public function destroy():void
		{
			super.destroy();
		} */


	}
}
