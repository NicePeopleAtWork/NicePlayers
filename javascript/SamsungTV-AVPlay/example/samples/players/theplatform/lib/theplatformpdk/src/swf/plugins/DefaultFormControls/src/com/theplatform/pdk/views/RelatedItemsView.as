package com.theplatform.pdk.views
{
	import com.theplatform.pdk.containers.SkinnedLayoutContainer;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.ButtonView;
	import com.theplatform.pdk.data.ReleaseFeed;
	import com.theplatform.pdk.events.PageContainerEvent;
	import com.theplatform.pdk.events.RelatedItemInteractionEvent;
	import com.theplatform.pdk.views.relateditems.PageContainer;
	
	import flash.events.MouseEvent;

	public class RelatedItemsView extends SkinnedLayoutContainer implements IRelatedItemsView
	{
		
		protected var _buttonPrevious:ButtonView;
		protected var _pageContainer:PageContainer;
		protected var _buttonNext:ButtonView;
		
		private var _releaseFeed:ReleaseFeed;
		private var _itemRendererSkin:String;
		private var _relatedItemsPerPage:uint;

		public function RelatedItemsView(controller:IViewController, id:String)
		{
			super(controller, null);
			init();
		}
		
		//
		// protected methods
		
		protected function init():void
		{
			// 1.
			createChildren();
			
			// 2.
			addListeners();
			
			// 3.
			addChildren();
			
			// 4.
			// wait for releaseFeed to be set.
		}
		
		protected function createChildren():void
		{	
			_buttonPrevious = new ButtonView(_controller, null);
			_buttonPrevious.colorizeIcon = true;
			_buttonPrevious.buttonMode = true;
			_buttonPrevious.useHandCursor = true;
			
			_pageContainer = new PageContainer(_controller, null);

			_buttonNext = new ButtonView(_controller, null);
			_buttonNext.colorizeIcon = true;
 			_buttonNext.buttonMode = true;
			_buttonNext.useHandCursor = true;
					
			percentWidth = 100;
			percentHeight = 100;
			verticalAlign = "middle";
			
			setNavButtonsEnabledState();
		}
		
		
		//
		// protected methods
		
		protected function addListeners():void
		{
			_buttonPrevious.addEventListener(MouseEvent.CLICK, handleButtonPreviousMouse, false, 0, true);
			_buttonNext.addEventListener(MouseEvent.CLICK, handleButtonNextMouse, false, 0, true);
			_pageContainer.addEventListener(PageContainerEvent.NUMBER_OF_PAGES_CHANGED, handlePageContainerEvents, false, 0, true);
			_pageContainer.addEventListener(PageContainerEvent.CURRENT_PAGE_CHANGED, handlePageContainerEvents, false, 0, true);
		}
		
		protected function addChildren():void
		{
			addChild(_buttonPrevious);
			addChild(_pageContainer);
			addChild(_buttonNext);
		}
		
		protected function removeListeners():void
		{
			_buttonPrevious.removeEventListener(MouseEvent.CLICK, handleButtonPreviousMouse)
			_buttonNext.removeEventListener(MouseEvent.CLICK, handleButtonNextMouse);
			_pageContainer.removeEventListener(PageContainerEvent.NUMBER_OF_PAGES_CHANGED, handlePageContainerEvents);
		}
		
		protected function setNavButtonsEnabledState():void
		{
			
			if (currentPage == 1)
				_buttonPrevious.enabled = false;
			else
				_buttonPrevious.enabled = true;
				
			if (currentPage == numberOfPages)
				_buttonNext.enabled = false;
			else
				_buttonNext.enabled = true;
			
		}
		
		
		
		//
		// interaction events
		
		protected function handleButtonPreviousMouse(e:MouseEvent):void
		{
			if (previousButton.enabled)
				dispatchEvent(new RelatedItemInteractionEvent(RelatedItemInteractionEvent.OnPreviousClick));
		}
		protected function handleButtonNextMouse(e:MouseEvent):void
		{
			// FIXME: why was conditional empty?
			//if (nextButton.enabled);
				dispatchEvent(new RelatedItemInteractionEvent(RelatedItemInteractionEvent.OnNextClick));
		}		
		
		//
		// page events
		protected function handlePageContainerEvents(e:PageContainerEvent):void
		{
			switch(e.type)
			{
				case PageContainerEvent.NUMBER_OF_PAGES_CHANGED:
				case PageContainerEvent.CURRENT_PAGE_CHANGED:
				default:
					
					setNavButtonsEnabledState();
					
					break;
			}
		}
		
		protected function handleRelatedItemInteractionEvents(e:RelatedItemInteractionEvent):void
		{
			dispatchEvent(new RelatedItemInteractionEvent(e.type, e.data));
		}
		
		//
		//  IRelatedItemsView
		
		public function get nextButton():IButtonView
		{
			return _buttonNext;
		}
		public function get previousButton():IButtonView
		{
			return _buttonPrevious;
		}
		
		public function set releaseFeed(value:ReleaseFeed):void
		{
			_releaseFeed = value;
			_pageContainer.releaseFeed = _releaseFeed

		}
		public function get releaseFeed():ReleaseFeed
		{
			return _releaseFeed;
		}
		
		public function set itemRendererSkin(value:String):void
		{
			_itemRendererSkin = value;
		}
		public function get itemRendererSkin():String
		{
			return _itemRendererSkin;	
		}		
		
		//
		// overrides
		
		override public function destroy():void
		{
			removeListeners();
		}
		
		
		public function set currentPage(value:uint):void
		{
			if (value == _pageContainer.currentPage)
				return;
				
			_pageContainer.currentPage = value;
		}
		public function get currentPage():uint
		{
			return _pageContainer.currentPage;
		}


		public function get numberOfPages():uint
		{
			return _pageContainer.numberOfPages;
		}
		
		public function set relatedItemsPerPage(value:uint):void
		{
			if (value == _relatedItemsPerPage)
				return;
				
			_relatedItemsPerPage = value;
			_pageContainer.relatedItemsPerPage = _relatedItemsPerPage;
		}
		public function get relatedItemsPerPage():uint
		{
			return _relatedItemsPerPage;
		}

		//
		// private methods
		
	/* 	private function setRelatedItemsData(data:ReleaseFeed):void
		{
			_pageContainer.removeAll();
			//TODO: Destroy previous items.
			
			var start:uint;
			var end:uint;
			
			
			
			
			for each (var release:Release in data.entries)
			{
				var renderer:RelatedItemRenderer = new RelatedItemRenderer(_controller, null, release);
				renderer.skinValue = _itemRendererSkin;
				renderer.addEventListener(RelatedItemInteractionEvent.OnItemClick, handleItemClick, false, 0, true);
				renderer.addEventListener(RelatedItemInteractionEvent.OnItemRollover, handleItemRollover, false, 0, true);
				renderer.addEventListener(RelatedItemInteractionEvent.OnItemRollout, handleItemRollout, false, 0, true);
				_pageContainer.addChild(renderer);
			}
			
			
		} */
	}
}
