package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.data.CardCallerType;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.Release;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.utils.PdkStringUtils;

	public class FormCardMediator extends CardMediator
	{
		protected var _pController:PlayerController;

		public function FormCardMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
			_pController = controller as PlayerController;
		}
		
		override protected function setItem(item:Item):void
		{
			super.setItem(item);
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
		}
		
		public function get currentClip():Clip
		{
			//this checks if the caller is the endcard. If it is, we want it to refer to the previous clip.
			//If not, we want it to refer to the warmed clip. 
			if(card.initVars && card.initVars["callerType"] == CardCallerType.END_CARD)
			{
				var prev:Clip = _pController.getPreviousClip();
				if(prev)
				{
					return prev;
				}
			}
			return _pController.getCurrentClip();
		}
		
		public function get currentRelease():Release
		{
			return _pController.getCurrentRelease();
		} 
		
		
		protected function getBaseClip():BaseClip
		{
			var bc:BaseClip;
			
			if (currentClip)
			{
				bc = currentClip.baseClip;
				if (bc && bc.isAd) 
					bc = _pController.getCurrentPlaylist().firstContentBaseClip; 
			}
			else
			{
				var currentRelease:Release = _pController.getCurrentRelease();
				
				bc = new BaseClip();
				bc.title = currentRelease.title;
				bc.description = currentRelease.description;
				bc.contentID = (currentRelease.id ? currentRelease.id.substr(currentRelease.id.lastIndexOf("/") + 1) : "");
				bc.guid = currentRelease.guid;
			}
			return bc;
		}

		protected function substituteUrl(url:String):String
		{
			if (currentClip)
				return PdkStringUtils.substituteUrl(url, currentClip);
			else if (currentRelease)
				return PdkStringUtils.substituteUrl(url, currentRelease);
			else
				return url;
		}
		
		/* protected override function cardDestroyed(card:Card):void 
		{
			super.cardDestroyed(card);
		} */
		
	}
}
