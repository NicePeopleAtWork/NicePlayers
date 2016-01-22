package com.theplatform.pdk.controls
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.data.Padding;
	import com.theplatform.pdk.events.PdkTileListEvent;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.views.ISiteListView;
	import com.theplatform.pdk.views.IView;

	/**
	 *
	 * @author aaron.begley
	 */
	public class SiteListControl extends PlayerControl
	{
		// metaData defaults
		public static const DEFAULT_BACKGROUND_SKIN:String = SiteListSkin.BACKGROUND;
		public static const DEFAULT_NUMBER_OF_COLUMNS:uint = 1;
		public static const DEFAULT_ROW_HEIGHT:uint = 25;
		public static const DEFAULT_SHOW_TEXT:Boolean = true;
		public static const DEFAULT_SHOW_SCROLLBAR:String = "auto";

		public static const DEFAULT_PADDING_LEFT:Number = 1;
		public static const DEFAULT_PADDING_RIGHT:Number = 0;
		public static const DEFAULT_PADDING_TOP:Number = 1;
		public static const DEFAULT_PADDING_BOTTOM:Number = 1;

		public static const DEFAULT_SCROLLBAR_PADDING_LEFT:Number = 0;
		public static const DEFAULT_SCROLLBAR_PADDING_RIGHT:Number = 0;
		public static const DEFAULT_SCROLLBAR_PADDING_TOP:Number = 0;
		public static const DEFAULT_SCROLLBAR_PADDING_BOTTOM:Number = 0;

		protected var _siteListView:ISiteListView;

		private var _sharingSites:Array;
		
		// private metaData vars
		private var _numberOfColumns:uint;
		private var _showText:Boolean;
		private var _showScrollbar:String;
		private var _rowHeight:Number;
		private var _padding:Padding = new Padding();
		private var _scrollbarPadding:Padding = new Padding();

		/**
		 *
		 * @param id
		 * @param metadata
		 *
		 *
		 */
		public function SiteListControl(id:String, metadata:ItemMetaData = null, controller:IViewController = null)
		{
			super(id, metadata, controller);

			//
			// columns metaData
			if (metadata.display.hasOwnProperty("columns"))
				_numberOfColumns = uint(metadata.display["columns"]);
			else
				_numberOfColumns = DEFAULT_NUMBER_OF_COLUMNS;


			//
			// showText metaData
			if (metadata.display.hasOwnProperty("showText"))
			{
				if (metadata.display["showText"] == "false")
					_showText = false;
				else
					_showText = true;
			}
			else
				_showText = DEFAULT_SHOW_TEXT;

			//
			// showScrolbar metaData
			if (metadata.display.hasOwnProperty("showScrollBar"))
				_showScrollbar = metadata.display["showScrollBar"];
			else
				_showScrollbar = DEFAULT_SHOW_SCROLLBAR;


			//
			// rowHeight metaData
			if (metadata.display.hasOwnProperty("rowHeight"))
				_rowHeight = Number(metadata.display["rowHeight"]);
			else
				_rowHeight = DEFAULT_ROW_HEIGHT;


			// padding metaData
			if (metadata.display.hasOwnProperty("paddingLeft"))
				_padding.left = Number(metadata.display["paddingLeft"]);
			else
				_padding.left = DEFAULT_PADDING_LEFT;
				
			if (metadata.display.hasOwnProperty("paddingRight"))
				_padding.right = Number(metadata.display["paddingRight"]);
			else
				_padding.right = DEFAULT_PADDING_RIGHT;
				
			if (metadata.display.hasOwnProperty("paddingTop"))
				_padding.top = Number(metadata.display["paddingTop"]);
			else
				_padding.top = DEFAULT_PADDING_TOP;
				
			if (metadata.display.hasOwnProperty("paddingBottom"))
				_padding.bottom = Number(metadata.display["paddingBottom"]);
			else
				_padding.bottom = DEFAULT_PADDING_BOTTOM;


			// scrollBar metaData
			if (metadata.display.hasOwnProperty("scrollbarPaddingLeft"))
				_scrollbarPadding.left = Number(metadata.display["scrollbarPaddingLeft"]);
			else
				_scrollbarPadding.left = DEFAULT_SCROLLBAR_PADDING_LEFT;
				
			if (metadata.display.hasOwnProperty("scrollbarPaddingRight"))
				_scrollbarPadding.right = Number(metadata.display["scrollbarPaddingRight"]);
			else
				_scrollbarPadding.right = DEFAULT_SCROLLBAR_PADDING_RIGHT;
				
			if (metadata.display.hasOwnProperty("scrollbarPaddingTop"))
				_scrollbarPadding.top = Number(metadata.display["scrollbarPaddingTop"]);
			else
				_scrollbarPadding.top = DEFAULT_SCROLLBAR_PADDING_RIGHT;
				
			if (metadata.display.hasOwnProperty("scrollbarPaddingBottom"))
				_scrollbarPadding.bottom = Number(metadata.display["scrollbarPaddingBottom"]);
			else
				_scrollbarPadding.bottom = DEFAULT_SCROLLBAR_PADDING_BOTTOM;

		}

		/**
		 *
		 */
		override protected function setView(view:IView):void
		{
			_siteListView = view as ISiteListView;

			super.setView(view);


			_siteListView.skinValue = DEFAULT_BACKGROUND_SKIN;
			_siteListView.numberOfColumns = _numberOfColumns;
			_siteListView.showText = _showText;
			_siteListView.showScrollbar = _showScrollbar;
			_siteListView.rowHeight = _rowHeight;
			_siteListView.sharingSites = _sharingSites;
			_siteListView.addEventListener(PdkTileListEvent.OnItemClick, onItemClick, false, 0, true);
			
			var sp:Padding = new Padding();
			sp.bottom = _scrollbarPadding.bottom;
			sp.left = _scrollbarPadding.left;
			sp.right = _scrollbarPadding.right;
			sp.top = _scrollbarPadding.top;
			_siteListView.scrollbarPadding = sp;
			
			var p:Padding = new Padding();
			p.bottom = _padding.bottom;
			p.left = _padding.left;
			p.right = _padding.right;
			p.top = _padding.top;
			_siteListView.padding = p;
		}

		private function onItemClick(e:PdkTileListEvent):void
		{
			dispatchEvent(new PdkTileListEvent(PdkTileListEvent.OnItemClick, e.data));
		}

		//
		// sharing sites

		public function set sharingSites(array:Array):void
		{
			_sharingSites = array;

			if (_viewSet)
				_siteListView.sharingSites = _sharingSites;

		}

		public function get sharingSites():Array
		{
			return _sharingSites;
		}


		//
		// number of columns

		public function set numberOfColumns(value:uint):void
		{
			_numberOfColumns = value;

			if (_viewSet)
				_siteListView.numberOfColumns = _numberOfColumns;
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

			if (_viewSet)
				_siteListView.showText = _showText;
		}

		public function get showText():Boolean
		{
			return _showText;
		}
	}
}