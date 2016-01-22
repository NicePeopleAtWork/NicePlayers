package com.theplatform.pdk.controls
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.data.Padding;
	import com.theplatform.pdk.data.ReleaseFeed;
	import com.theplatform.pdk.events.RelatedItemInteractionEvent;
	import com.theplatform.pdk.functions.MenuFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.views.IRelatedItemsView;
	import com.theplatform.pdk.views.IView;

	public class RelatedItemsControl extends PlayerControl
	{
		//	public static const DEFAULT_BACKGROUND_SKIN:String = RelatedItemsSkin.BACKGROUND;
		public static const DEFAULT_NEXT_BUTTON_SKIN:String = RelatedItemsSkin.NEXT_BUTTON;
		public static const DEFAULT_NEXT_BUTTON_ICON:String = RelatedItemsSkin.ICON_NEXT;
		public static const DEFAULT_PREVIOUS_BUTTON_SKIN:String = RelatedItemsSkin.PREVIOUS_BUTTON;
		public static const DEFAULT_PREVIOUS_BUTTON_ICON:String = RelatedItemsSkin.ICON_PREVIOUS;
		public static const DEFAULT_RELATED_ITEMS_PER_PAGE:uint = 6;

		protected var _relatedItemsView:IRelatedItemsView;
		protected var _releaseFeed:ReleaseFeed;
		protected var _relatedItemsPerPage:uint = DEFAULT_RELATED_ITEMS_PER_PAGE;

		public function RelatedItemsControl(id:String, metadata:ItemMetaData = null, controller:IViewController = null)
		{
			super(id, metadata, controller);
		}

		override protected function setView(view:IView):void
		{
			_relatedItemsView = view as IRelatedItemsView;
			autoSkin = false;

			super.setView(view);

			_relatedItemsView.nextButton.skinValue = DEFAULT_NEXT_BUTTON_SKIN;
			_relatedItemsView.nextButton.buttonIcon = DEFAULT_NEXT_BUTTON_ICON;
			_relatedItemsView.nextButton.colorizeIcon = true;

			_relatedItemsView.previousButton.skinValue = DEFAULT_PREVIOUS_BUTTON_SKIN;
			_relatedItemsView.previousButton.buttonIcon = DEFAULT_PREVIOUS_BUTTON_ICON;
			_relatedItemsView.previousButton.colorizeIcon = true;

			if (_relatedItemsPerPage < 1)
				_relatedItemsView.relatedItemsPerPage = DEFAULT_RELATED_ITEMS_PER_PAGE;
			else
				_relatedItemsView.relatedItemsPerPage = _relatedItemsPerPage;

			addEventListeners();
			
			if (_releaseFeed)
				_relatedItemsView.releaseFeed = _releaseFeed;

		}

		override protected function setMetadataValue(property:String, value:String):void
		{
			switch (property)
			{
				case "relatedItemsPerPage":
					_relatedItemsPerPage = uint(value);
					break;
			}
		}


		protected function handleViewInteractionEvents(e:RelatedItemInteractionEvent):void
		{
			if (e.bubbles)
				e.stopImmediatePropagation();

			dispatchEvent(new RelatedItemInteractionEvent(e.type, e.data));
		}

		protected function addEventListeners():void
		{
			_relatedItemsView.addEventListener(RelatedItemInteractionEvent.OnItemClick, handleViewInteractionEvents, false, 0, true);
			_relatedItemsView.addEventListener(RelatedItemInteractionEvent.OnItemRollout, handleViewInteractionEvents, false, 0, true);
			_relatedItemsView.addEventListener(RelatedItemInteractionEvent.OnItemRollover, handleViewInteractionEvents, false, 0, true);
			_relatedItemsView.addEventListener(RelatedItemInteractionEvent.OnNextClick, handleViewInteractionEvents, false, 0, true);
			_relatedItemsView.addEventListener(RelatedItemInteractionEvent.OnPreviousClick, handleViewInteractionEvents, false, 0, true);
		}

		public function set releaseFeed(value:ReleaseFeed):void
		{
			_releaseFeed = value;
			
			if (_relatedItemsView)
				_relatedItemsView.releaseFeed = _releaseFeed;
		}

		public function get releaseFeed():ReleaseFeed
		{
			return _releaseFeed;
		}

		public function set currentPage(value:uint):void
		{
			_relatedItemsView.currentPage = value;
		}

		public function get currentPage():uint
		{
			if (_relatedItemsView)
				return _relatedItemsView.currentPage;
			else 
				return 1;
		}

		public function get relatedItemsPerPage():uint
		{
			return _relatedItemsPerPage;
		}

		public function getHeaderRangeString():String
		{
			if (!releaseFeed || !releaseFeed.entries)
				return "";
				
			var currentPage:uint = currentPage;
			var numberOfPages:uint = Math.ceil(releaseFeed.range.totalCount / relatedItemsPerPage);
			var itemsPerPage:uint = relatedItemsPerPage;
			var totalItems:uint = releaseFeed.range.totalCount;
			var rangeStart:uint = ((currentPage - 1) * itemsPerPage) + 1;
			var rangeEnd:uint = itemsPerPage * currentPage;

			if (rangeEnd > totalItems)
				rangeEnd = totalItems;

			var range:String = rangeStart + " - " + rangeEnd + " of " + totalItems;
			
			return range;
		//	card.call(MenuFormFunctions.setRelatedItemsHeaderRange, [range]);
		}
	}
}
