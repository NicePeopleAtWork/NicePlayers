package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.containers.Container;
	import com.theplatform.pdk.containers.ContainerDirection;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.ButtonControl;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.data.CardActions;
	import com.theplatform.pdk.data.NoCardFunctionError;
	import com.theplatform.pdk.events.ButtonEvent;
	import com.theplatform.pdk.events.CardEvent;
	import com.theplatform.pdk.events.CardLinkEvent;
	import com.theplatform.pdk.functions.CardFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.errors.IllegalOperationError;
	import flash.events.TimerEvent;
	import flash.utils.Dictionary;
	import flash.utils.Timer;

	public class CardLinkContainerMediator extends ContainerMediator
	{
		protected var _container:Container;
		protected var _links:Object;
		
		private var _deckTimer:Timer;
		
		public function CardLinkContainerMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
			_links = new Dictionary(true);
		}
		
		override protected function setItem(item:Item):void
		{
			super.setItem(item);
			_container = item as Container;
			if (!_container) throw new IllegalOperationError("CardLinkContainerMediator must be associated with a Container");
			
			_container.direction = ContainerDirection.HORIZONTAL;
			
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);

			card.registerFunction(CardFunctions.setLink, this, setLink);
			card.addEventListener(CardEvent.OnDeckCreated, deckCreated, false, 0, true);
			
		}
		
		private function setLink(button:ButtonControl, childCardId:String, parentCardId:String, isDefault:Boolean = false):Boolean
		{
			_controller.trace("setting link for: " + childCardId, "CardLinkContainerMediator", Debug.INFO);
			var useCard:Boolean = true;
			if (card.hasFunction(CardFunctions.checkCardLinkto))
			{
				useCard = card.call(CardFunctions.checkCardLinkto, [childCardId]);
			}
			
			if (useCard)
			{
				_links[button.id] = new LinkRefs(button, childCardId, parentCardId, isDefault);//get the reference
				_container.add(button);
				button.addEventListener(ButtonEvent.OnButtonClick, linkClick, false, 0, true);
			}
			else
			{
				return false;
			}
			return true;//lets the caller know that the action was successful
		}
		
		private function linkClick(e:ButtonEvent):void
		{
			var buttonRef:ButtonControl = e.target as ButtonControl;
			//if the target isn't a ButtonControl, we'll get an error... easier to debug
			//find the links
			var lr:LinkRefs = _links[buttonRef.id];
			if (lr) doSetCard(lr);
		}
		
		private function deckCreated(e:CardEvent):void
		{
			card.removeEventListener(CardEvent.OnDeckCreated, deckCreated);
			if (!_deckTimer)
			{
				_deckTimer = new Timer(100, 1);
				_deckTimer.addEventListener(TimerEvent.TIMER, deckTick, false, 0, true);
			}
			_deckTimer.start();
		}
		
		private function deckTick(e:TimerEvent):void
		{
			_deckTimer.reset();
			var cardOpened:Boolean = false;
			var firstCard:LinkRefs;
			for each (var lr:LinkRefs in _links)
			{
				if (!firstCard) firstCard = lr;
				if (lr.isDefault)
				{
					cardOpened = true;
					doSetCard(lr);
					break;
				}
			}
			if (!cardOpened && firstCard)
			{
				//just open the first one
				doSetCard(firstCard);
			}
		}
		
		private function doSetCard(lr:LinkRefs):void
		{
			_controller.showCard(card.deckId, lr.childId, CardActions.ENABLE, lr.parentId);
			//TO DO: check to see if the card actuall showed up?
			var evt:CardLinkEvent = new CardLinkEvent(CardLinkEvent.OnLinkSelected, lr.button.id);
			card.dispatchEvent(evt);
		}
		
		override public function destroy():void
		{
			if (card)
			{
				card.removeEventListener(CardEvent.OnDeckCreated, deckCreated);
			}
			for each (var lr:LinkRefs in _links)
			{
				lr.button.removeEventListener(ButtonEvent.OnButtonClick, linkClick);
			}
			if (_deckTimer)
			{
				_deckTimer.stop();
				_deckTimer.removeEventListener(TimerEvent.TIMER, deckTick);
			}
			_links = null;
			super.destroy();
		}
		
	}
}
	import com.theplatform.pdk.controls.ButtonControl;
	

internal class LinkRefs
{
	public var button:ButtonControl;
	public var childId:String;
	public var parentId:String;
	public var isDefault:Boolean;
	
	public function LinkRefs(button:ButtonControl, childId:String, parentId:String, isDefault:Boolean)
	{
		this.button = button;
		this.childId = childId;
		this.parentId = parentId;
		this.isDefault = isDefault;
	}
}
