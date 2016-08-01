package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.containers.ContainerDirection;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.ButtonControl;
	import com.theplatform.pdk.controls.ButtonSkin;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.data.NoCardFunctionError;
	import com.theplatform.pdk.events.CardEvent;
	import com.theplatform.pdk.events.CardLinkEvent;
	import com.theplatform.pdk.events.ItemEvent;
	import com.theplatform.pdk.functions.CardFunctions;
	import com.theplatform.pdk.main.pdkInternal;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.styles.PlayerStyleFactory;
	
	import flash.errors.IllegalOperationError;
	
	use namespace pdkInternal;

	public class CardLinkMediator extends FormButtonControlMediator
	{
		protected var _linkButton:ButtonControl;
		protected var _linkTo:String;
		protected var _isDefault:Boolean = false;
		protected var _icon:String;
		protected var _label:String;
		
		protected var _deckCreated:Boolean = false;
		protected var _linkToSet:Boolean = false;
		protected var _selected:Boolean = false;
		
		public function CardLinkMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
			if (metadata)
			{
				_linkTo = metadata.display["linkto"];
				_isDefault = metadata.display["isDefault"] == "true" ? true : false;
			}
			if (!_linkTo) throw new IllegalOperationError("a link must have a linkto property");
		}
		
		override protected function setItem(item:Item):void
		{
			super.setItem(item);
			_linkButton = item as ButtonControl;
			if (!_linkButton) throw new IllegalOperationError("a cardLinkMediator should be associated with a ButtonControl");
			
			_linkButton.skin = ButtonSkin.DEFAULT;
			_linkButton.addEventListener(ItemEvent.OnViewAttached, viewAttached, false, 0, true);
			
			_linkButton.selected = _selected;
			_linkButton.direction = ContainerDirection.HORIZONTAL;
			
			if (_linkButton.view)//is the view already attached?
			{
				doSetLink();
			}
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);

			card.addEventListener(CardEvent.OnDeckCreated, deckCreated);
			card.addEventListener(CardLinkEvent.OnLinkSelected, linkSelected);
		}
		
		private function viewAttached(e:ItemEvent):void
		{
			//set the link when a view is attached
			doSetLink();
		}
		
		protected function doSetLink():void
		{
			_linkToSet = true;
			if (_deckCreated)
			{
				//call the setLink registered function.  The assumption is that some other mediator has registered the function
				var cardSuccess:Boolean = false;
				if (card.hasFunction(CardFunctions.setLink))
				{
					cardSuccess = card.call(CardFunctions.setLink, [_linkButton, _linkTo, card.id, _isDefault])	
				}
				
				if (!cardSuccess)
				{
					//hopefully this will get rid of it
					_linkButton.destroy();
					this.destroy();
				}
			}
			
		}
		
		protected function linkSelected(e:CardLinkEvent):void
		{
			var linkId:String = e.data as String;
			if (linkId == this.id)
			{
				_selected = true;
			}
			else
			{
				_selected = false;
			}
			_linkButton.selected = _selected;
		}
		
		private function deckCreated(e:CardEvent):void
		{
			_deckCreated = true;
			if (_linkToSet)
			{
				doSetLink();
			}
		} 
		
		override public function destroy():void
		{
			if (_linkButton)
			{
				_linkButton.removeEventListener(ItemEvent.OnViewAttached, viewAttached);
			}
			card.removeEventListener(CardEvent.OnDeckCreated, deckCreated);
			card.removeEventListener(CardLinkEvent.OnLinkSelected, linkSelected);
			super.destroy();
		}
		
		
		
	}
}
