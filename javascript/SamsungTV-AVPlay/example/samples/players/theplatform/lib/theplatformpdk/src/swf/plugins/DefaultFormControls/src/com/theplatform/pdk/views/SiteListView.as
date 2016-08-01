package com.theplatform.pdk.views
{
	import com.theplatform.pdk.containers.HorizontalAlign;
	import com.theplatform.pdk.containers.SkinnedLayoutContainer;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.CompositeScrollbarView;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.PdkTileList;
	import com.theplatform.pdk.data.Padding;
	import com.theplatform.pdk.data.ScrollbarInteractionEventData;
	import com.theplatform.pdk.data.SharingSite;
	import com.theplatform.pdk.events.PdkTileListEvent;
	import com.theplatform.pdk.events.ScrollbarInteractionEvent;
	import com.yahoo.astra.layout.modes.IAdvancedLayoutMode;
	
	import fl.data.DataProvider;
	import fl.events.ListEvent;
	
	import flash.display.Shape;
	
	/**
	 *
	 * @author aaron.begley
	 */
	public class SiteListView extends SkinnedLayoutContainer implements ISiteListView
	{
		private var _textFieldId:String = "PlayerControlLabelFont";
		private var _dataProvider:DataProvider = new DataProvider();
		private var _sharingSites:Array;
		private var _numberOfColumns:uint;
		private var _showText:Boolean;
		private var _rowHeight:Number = 25;
		private var _textColor:uint;
		private var _item:Item;
		private var _mask:Shape;
		private var _showScrollBar:String = "false";
		
		private var _percentVisible:Number = 1;
		
		private var _scrollbar:CompositeScrollbarView;
		private var _scrollPercent:Number = 0;
		
		private var _padding:Padding = new Padding();
		private var _scrollbarPadding:Padding = new Padding();
		
		protected var _tileList:PdkTileList;
		
		public var debug:Boolean = false;
		
		private var _paddedSiteListHolder:SkinnedLayoutContainer;
		private var _paddedScrollbarHolder:SkinnedLayoutContainer;
		
		private var _scrolling:Boolean = false;
		
		
		/**
		 *
		 * @param controller
		 * @param id
		 *
		 *
		 */
		public function SiteListView(controller:IViewController, item:Item)
		{
			super(controller, null);
			init();
		}
		
		private function init():void
		{
			autoMask = true;
			
			_paddedSiteListHolder = new SkinnedLayoutContainer(_controller, null);
			_paddedSiteListHolder.autoMask = true;
			_paddedSiteListHolder.percentHeight = 100;
			_paddedSiteListHolder.percentWidth = 100;
			
			_paddedScrollbarHolder = new SkinnedLayoutContainer(_controller, null);
			_paddedScrollbarHolder.autoMask = true;
			_paddedScrollbarHolder.percentHeight = 100;
			
			
			_textColor = _controller.getDefaultStyles()['textColor'];
			
			_tileList = new PdkTileList(_controller, null);
			_tileList.dataProvider = _dataProvider;
			
			if (_paddedSiteListHolder.layoutMode is IAdvancedLayoutMode)
				IAdvancedLayoutMode(_paddedSiteListHolder.layoutMode).addClient(_tileList, {percentWidth: 100});
			
			
			_paddedSiteListHolder.addChild(_tileList);
			addChild(_paddedSiteListHolder)
			
			_mask = new Shape();
			if (layoutMode is IAdvancedLayoutMode)
				IAdvancedLayoutMode(layoutMode).addClient(_mask, {includeInLayout: false});
			
			_paddedSiteListHolder.mask = _mask;
			_tileList.mask = _mask;
			
			_scrollbar = new CompositeScrollbarView(_controller, null);
			_scrollbar.percentHeight = 100;
			_scrollbar.addEventListener(ScrollbarInteractionEvent.OnThumbMove, handleScrollbarInteractionEvents, false, 0, true);
			_scrollbar.addEventListener(ScrollbarInteractionEvent.OnTrackClick, handleScrollbarInteractionEvents, false, 0, true);
			_scrollbar.addEventListener(ScrollbarInteractionEvent.OnForwardClick, handleScrollbarInteractionEvents, false, 0, true);
			_scrollbar.addEventListener(ScrollbarInteractionEvent.OnBackwardClick, handleScrollbarInteractionEvents, false, 0, true);
			
			addChild(_mask);
			
			
			horizontalAlign = HorizontalAlign.RIGHT;
			percentHeight = 100;
			percentWidth = 100;
			
			_tileList.addEventListener(ListEvent.ITEM_CLICK, onItemClick);
		}

        override public function destroy():void
        {

            if (_paddedSiteListHolder)
            {
                if (_paddedSiteListHolder.layoutMode is IAdvancedLayoutMode&&_tileList)
				    IAdvancedLayoutMode(_paddedSiteListHolder.layoutMode).removeClient(_tileList);

                if (_tileList&&_paddedSiteListHolder.contains(_tileList))
                    _paddedSiteListHolder.removeChild(_tileList);


                if (_scrollbar&&_paddedSiteListHolder.contains(_scrollbar))
                    _paddedSiteListHolder.removeChild(_scrollbar);


			    removeChild(_paddedSiteListHolder)
                

                 _paddedSiteListHolder.destroy();

                _paddedSiteListHolder=null;
            }


            if (_tileList)
            {

               _tileList=null;
            }

            if (_paddedScrollbarHolder)
            {

            }



            if (_scrollbar)
            {


                _scrollbar.removeEventListener(ScrollbarInteractionEvent.OnThumbMove, handleScrollbarInteractionEvents);
                _scrollbar.removeEventListener(ScrollbarInteractionEvent.OnTrackClick, handleScrollbarInteractionEvents);
                _scrollbar.removeEventListener(ScrollbarInteractionEvent.OnForwardClick, handleScrollbarInteractionEvents);
                _scrollbar.removeEventListener(ScrollbarInteractionEvent.OnBackwardClick, handleScrollbarInteractionEvents);
                _scrollbar.destroy();

                _scrollbar=null;

            }

            super.destroy();


        }
		
		//
		// event handlers
		private function handleScrollbarInteractionEvents(e:ScrollbarInteractionEvent):void
		{
			switch (e.type)
			{
				case ScrollbarInteractionEvent.OnThumbMove:
				case ScrollbarInteractionEvent.OnTrackClick:
				case ScrollbarInteractionEvent.OnForwardClick:
				case ScrollbarInteractionEvent.OnBackwardClick:
					_scrollPercent = ScrollbarInteractionEventData(e.data).percentage;
					_scrolling = true;
					break;
			}
			
			validateLayout();
		}
		
		
		private function onItemClick(e:ListEvent):void
		{
			if (e.item.site)
				dispatchEvent(new PdkTileListEvent(PdkTileListEvent.OnItemClick, e.item.site));
		}
		
		
		//
		//  overrides 
		
		override public function validateLayout():void
		{
			if (!_tileList || !_padding || !_dataProvider || !_scrollbar || !_paddedScrollbarHolder || !_mask)
            {
                return;
            }

			// handle scrolling.
			if (_scrolling)
			{
				_tileList.y = _scrollPercent * (height - _padding.top - _tileList.height);
				_scrolling = false;
				return;
			}

			super.validateLayout();
			
			if (_tileList.rowHeight != _rowHeight)
				_tileList.rowHeight = _rowHeight;
			
			if (_tileList.rowCount != Math.ceil(_dataProvider.length / _numberOfColumns))
				_tileList.rowCount = Math.ceil(_dataProvider.length / _numberOfColumns)
			
			if (_tileList.columnCount != Math.round(width / _numberOfColumns))
				_tileList.columnWidth = Math.round(width / _numberOfColumns);
			
			if (_tileList.columnCount != _numberOfColumns)
				_tileList.columnCount = _numberOfColumns;
			
			// manage _showScrollBar
			if (_tileList.height > (height - _padding.top - _padding.bottom) && !contains(_scrollbar) && height > 0 && _showScrollBar == "auto")
			{
				_paddedScrollbarHolder.addChild(_scrollbar);
				addChild(_paddedScrollbarHolder);
			}
			else if (_showScrollBar == "true" && !contains(_scrollbar))
			{
				_paddedScrollbarHolder.addChild(_scrollbar);
				addChild(_paddedScrollbarHolder);
			}
			else if (_showScrollBar == "false" && contains(_scrollbar))
			{
				_paddedScrollbarHolder.removeChild(_scrollbar);
				removeChild(_paddedScrollbarHolder);
			}
			
			
			if (contains(_scrollbar))
				_tileList.columnWidth = Math.round((width - _scrollbar.width) / _numberOfColumns);
			
			
			_scrollbar.percentVisible = height / _tileList.height;
			_scrollbar.validateLayout();
			
			// mask _paddedSiteListHolder based on padding.
			
			_mask.graphics.clear();
			_mask.graphics.beginFill(0xFF0000, 1);
			_mask.graphics.drawRect(_padding.left, _padding.top, _paddedSiteListHolder.width - _padding.left, _paddedSiteListHolder.height - padding.top - padding.bottom)
			
			//	_tileList.validateNow();
			if (!debug)
				return;
			
			graphics.clear();
			graphics.beginFill(0xFF0000, .5);
			graphics.drawRect(0, 0, width, height);
			
		}
		
		
		//
		//  ISiteListView implementation
		public function set sharingSites(array:Array):void
		{
			_sharingSites = array;
			if (_sharingSites)
			{
				translateSharingSitesToDataProvider(_sharingSites);
			}
		}
		
		public function get sharingSites():Array
		{
			return _sharingSites;
		}
		
		//
		// columns
		
		public function set numberOfColumns(value:uint):void
		{
			_numberOfColumns = value;
			_tileList.columnCount = _numberOfColumns;
			_tileList.invalidate();
		}
		
		public function get numberOfColumns():uint
		{
			return _numberOfColumns;
		}
		
		//
		// show text
		
		public function set showText(value:Boolean):void
		{
			_showText = value;
		}
		
		public function get showText():Boolean
		{
			return _showText;
		}
		
		//
		// rowHeight
		
		public function set rowHeight(value:Number):void
		{
			_rowHeight = value;
		}
		
		public function get rowHeight():Number
		{
			return _rowHeight;
		}
		
		
		//
		// showScrollBars
		
		public function set showScrollbar(value:String):void
		{
			_showScrollBar = value;
			validateLayout();
		}
		
		public function get showScrollbar():String
		{
			return _showScrollBar;
		}
		
		//
		// padding
		
		override public function set padding(value:Padding):void
		{
			_padding = value;
			_paddedSiteListHolder.padding = _padding;
			_paddedSiteListHolder.validateLayout();
			validateLayout();
		}
		
		override public function get padding():Padding
		{
			return _padding;
		}
		
		public function set scrollbarPadding(value:Padding):void
		{
			_scrollbarPadding = value;
			_paddedScrollbarHolder.padding = _scrollbarPadding;
			_paddedScrollbarHolder.validateLayout();
			validateLayout();
		}
		
		public function get scrollbarPadding():Padding
		{
			return _scrollbarPadding;
		}
		
		//
		// private utility functions
		
		private function translateSharingSitesToDataProvider(sharingSites:Array):void
		{
			_dataProvider.removeAll();
			
			for each (var sharingSite:SharingSite in sharingSites)
			{
				_dataProvider.addItem({label: sharingSite.title, icon: sharingSite.icon, id: sharingSite.id, url: sharingSite.url, textColor: _textColor, showText: _showText, site: sharingSite, controller: _controller, textFieldID: _textFieldId, stubItem: "false"});
			}
			
			if (sharingSites.length <= numberOfColumns)
			{
				for (var i:uint = 0 ; i < numberOfColumns ; i++)
				{
					_dataProvider.addItem({label: "", icon: "", id: "", url: "", textColor: _textColor, showText: _showText, site: null, controller: _controller, textFieldID: _textFieldId, stubItem: "true"});
				}
			}
			
			validateLayout();
		}
		
	}
}
