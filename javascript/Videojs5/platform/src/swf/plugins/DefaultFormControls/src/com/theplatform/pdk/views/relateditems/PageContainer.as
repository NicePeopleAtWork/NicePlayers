package com.theplatform.pdk.views.relateditems
{
	import com.theplatform.pdk.containers.SkinnedLayoutContainer;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.data.ReleaseFeed;
	import com.theplatform.pdk.events.PageContainerEvent;
	import com.yahoo.astra.layout.modes.IAdvancedLayoutMode;

	public class PageContainer extends SkinnedLayoutContainer
	{
		private var _releaseFeed:ReleaseFeed;
		private var _relatedItemsPerPage:uint;
		private var _currentPage:uint = 1;
        private var _numberOfPages:uint = 0;
        protected var _page:Page;
		//protected var _pages:Array = new Array();

		public function PageContainer(controller:IViewController, id:String)
		{
			super(controller, id);

			percentWidth = 100;
			percentHeight = 100;
			verticalAlign = "middle";
			direction = "horizontal";
			paddingLeft = 5;
			paddingRight = 5;

		}

		public function set releaseFeed(value:ReleaseFeed):void
		{
			_releaseFeed = value;
			createPages();
		}

		public function get releaseFeed():ReleaseFeed
		{
			return _releaseFeed;
		}

		public function set relatedItemsPerPage(value:uint):void
		{
			_relatedItemsPerPage = value;
			createPages();
		}

		public function get relatedItemsPerPage():uint
		{
			return _relatedItemsPerPage;
		}


		public function set currentPage(value:uint):void
		{
			try
			{
				removeChild(_page);
			}
			catch (e:Error)
			{
				trace(e);
			}


			if (value > numberOfPages)
				value = numberOfPages;

            if (value < 1)
				value = 1;

			_currentPage = value;

			dispatchEvent(new PageContainerEvent(PageContainerEvent.CURRENT_PAGE_CHANGED, _currentPage));
		}

		public function get currentPage():uint
		{
			return _currentPage;
		}

		public function get numberOfPages():uint
		{
			return _numberOfPages;
		}

		//
		// private 

		private function createPages():void
		{
			if (!_releaseFeed || !_relatedItemsPerPage)
				return;

			removeAll();


			_numberOfPages = Math.ceil(_releaseFeed.range.totalCount / _relatedItemsPerPage);

			var releases:Array = _releaseFeed.entries;
            _page = new Page(_controller, releases, _relatedItemsPerPage);

            if (layoutMode is IAdvancedLayoutMode)
                IAdvancedLayoutMode(layoutMode).addClient(_page, {includeInLayout: false});


			if (_page)
			{
				try
				{
					addChild(_page);
				}
				catch (error:Error)
				{
					trace(error);
				}

			}


			dispatchEvent(new PageContainerEvent(PageContainerEvent.NUMBER_OF_PAGES_CHANGED, _numberOfPages));

		}

		override protected function layout():void
		{
			if (_page)
			{
				_page.width = width - paddingLeft - paddingRight;
				_page.height = height - paddingTop - paddingBottom;
			}
			super.layout();
		}
	}
}