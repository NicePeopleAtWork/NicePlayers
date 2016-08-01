package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.SiteListControl;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.data.SharingSite;
	import com.theplatform.pdk.events.PdkTileListEvent;
	import com.theplatform.pdk.functions.PostFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;

	/**
	 *
	 * @author aaron.begley
	 */
	public class PostSiteListMediator extends PlayerControlMediator
	{

		protected var _siteList:SiteListControl

		/**
		 *
		 * @param id
		 * @param controller
		 * @param metadata
		 * @param resources
		 *
		 *
		 */
		public function PostSiteListMediator(id:String, controller:IViewController, metadata:ItemMetaData = null, resources:Object = null)
		{
			super(id, controller, metadata, resources);
		}

		override protected function setItem(item:Item):void
		{
			super.setItem(item);

			_siteList = item as SiteListControl;

			// add listeners
			_siteList.addEventListener(PdkTileListEvent.OnItemClick, onItemClick, false, 0, true); 	
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
			
			card.registerFunction(PostFormFunctions.setSiteList, this, setSiteList);
		}
		
		private function setSiteList(siteList:Array):void
		{
			_siteList.sharingSites = siteList;
		}
		
		private function onItemClick(e:PdkTileListEvent):void
		{
			card.call(PostFormFunctions.postToSharingSite, [e.data as SharingSite]);
		}

		override public function destroy():void
		{

			_siteList.removeEventListener(PdkTileListEvent.OnItemClick, onItemClick, false); 	
			
			if (card)
				card.unRegisterFunction(PostFormFunctions.setSiteList);

			super.destroy();
		}

	}
}
