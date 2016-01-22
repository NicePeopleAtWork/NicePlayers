package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.containers.ComponentArea;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controllers.PlayerController;
import com.theplatform.pdk.controls.IconType;
import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.CustomData;
	import com.theplatform.pdk.data.CustomValue;
	import com.theplatform.pdk.data.Excerpt;
	import com.theplatform.pdk.data.SharingSite;
import com.theplatform.pdk.functions.HeaderFunctions;
import com.theplatform.pdk.functions.PostFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.utils.Debug;

	public class PostCardMediator extends ExcerptableFormCardMediator
	{
		private var _sharingSites:Array;
		
		public function PostCardMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
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
		
		override protected function deckCreated():void
		{
			super.deckCreated();
			_sharingSites = PlayerController(_controller).getSharingSite();
			card.call(PostFormFunctions.setSiteList, [_sharingSites]);

            if (card.parent && card.parent.id != "tpShareCard")
			{

				//card.call(HeaderFunctions.setHeaderIcon, [IconType.POST]);
				card.call(HeaderFunctions.setHeaderTitle, [_title]);
			}


		}
		
		override protected function cardCreated(componentArea:ComponentArea):void
		{
			super.cardCreated(componentArea);

			card.registerFunction(PostFormFunctions.closePost, this, closePost);
			card.registerFunction(PostFormFunctions.postToSharingSite, this, postToSharingSite);
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
			card.unRegisterFunction(PostFormFunctions.closePost);
			card.unRegisterFunction(PostFormFunctions.postToSharingSite);
			super.cardDestroyed(card);
		}
		
		
		/* override public function destroy():void
		{
			super.destroy();
		} */


		//---- local functions to the form ----
		private function closePost():void
		{
			_controller.hideCard("forms");
		}

		private function postToSharingSite(siteObj:SharingSite):void
		{
			var pcontroller:PlayerController = _controller as PlayerController;
			var shareClip:Clip;
			var bc:BaseClip;

			if (!currentClip && !currentRelease)
			{
				// do nothing
			}
			else if (!currentClip)
			{
				bc = new BaseClip()
				bc.title = currentRelease.title;
				bc.description = currentRelease.description;
				bc.contentID = (currentRelease.id ? currentRelease.id.substr(currentRelease.id.lastIndexOf("/") + 1) : "");
				bc.guid = currentRelease.guid;
				for each (var customValue:CustomValue in currentRelease.customValues)
				{
					if (!bc.contentCustomData)
						bc.contentCustomData = new CustomData();
					//_controller.trace("adding to baseClip custom value: " + customValue.fieldName.toLowerCase() + ":" + customValue.value as String, "PostCardMediator", Debug.DEBUG);
					bc.contentCustomData.addValue(customValue.fieldName.toLowerCase(), customValue.value as String);
				}
				shareClip = pcontroller.createClipFromBaseClip(bc);

				shareClip.releasePID = currentRelease.pid;
				pcontroller.postSharingSite(siteObj, shareClip, null, null);
			}
			else if (currentClip.isAd)
			{
				shareClip = pcontroller.createClipFromBaseClip(currentClip.baseClip.playlistRef.firstContentBaseClip)
				pcontroller.postSharingSite(siteObj, shareClip, null, null);
			}
			else
			{
				pcontroller.postSharingSite(siteObj, currentClip, null, new Excerpt(_excerpt.startTime, _excerpt.endTime));
			}
		}
	}
}
