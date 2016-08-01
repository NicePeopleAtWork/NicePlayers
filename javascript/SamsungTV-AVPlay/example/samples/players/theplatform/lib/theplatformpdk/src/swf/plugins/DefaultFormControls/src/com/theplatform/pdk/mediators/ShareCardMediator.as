package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.containers.ComponentArea;
	import com.theplatform.pdk.controllers.IBaseController;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.controls.IconType;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.factory.ViewFactory;
	import com.theplatform.pdk.functions.CardFunctions;
	import com.theplatform.pdk.functions.HeaderFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;

	public class ShareCardMediator extends FormCardMediator
	{
		protected var _isFullScreen:Boolean = false;
		
		public function ShareCardMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
			if (!_parentCardId)
			{
				_parentCardId = "tpExcerptCard";
			}
			if (!_title) _title = "Share";
		}
		
		override protected function setItem(item:Item):void
		{
			super.setItem(item);
			
			_isFullScreen = (_controller as PlayerController).getFullScreenState();
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
		}
		
		override protected function cardCreated(componentArea:ComponentArea):void
		{
			card.registerFunction(CardFunctions.checkCardLinkto, this, checkLinkto);
			
			if(card.parent && card.parent.id == "tpShareCard") {
				var ca:ComponentArea =  componentArea;
				if(ca) {
					ca.paddingLeft = 0;
					ca.paddingRight = 0;
					ca.paddingTop = 0;
					ca.paddingBottom = 0;
				}
			} 
			
		}
		
		override protected function deckCreated():void
		{
			card.call(HeaderFunctions.setHeaderIcon, [IconType.IMAGE_SHARE]);
			card.call(HeaderFunctions.setHeaderTitle, [_title]);
		}
		
		override protected function cardDestroyed(card:Card):void
		{
			card.unRegisterFunction(CardFunctions.checkCardLinkto);
			super.cardDestroyed(card);
		}
		
		private function checkLinkto(id:String):Boolean
		{
			return ViewFactory.isControlValid(id, _controller.id);
		}
		
		public function checkAnyControlsValid():Boolean
		{
			if (!card) return true;//we can't know yet, we'll just assume yes
			
			var xml:XML = card.layout;
			
			for each (var node:XML in xml..link)
			{
				var id:String = node.@linkto;
				if (checkLinkto(id))
				{
					  return true;//there's at least one
				}
			}
			return false;
		}
		
		
		
		/* override public function destroy():void
		{
			super.destroy();
		} */
		
	}
}
