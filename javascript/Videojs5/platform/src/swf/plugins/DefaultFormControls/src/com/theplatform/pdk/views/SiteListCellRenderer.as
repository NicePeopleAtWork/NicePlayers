package com.theplatform.pdk.views
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.ButtonView;
	import com.theplatform.pdk.controls.Item;
	
	import fl.controls.listClasses.ICellRenderer;
	import fl.controls.listClasses.ListData;

	public class SiteListCellRenderer extends ButtonView implements ICellRenderer
	{
		
		private var _data:Object;
		private var _listData:ListData;
		
		public function SiteListCellRenderer(controller:IViewController, item:Item)
		{
			super(controller, item);
		}
		
		
		public function setSize(width:Number, height:Number):void
		{
		}
		
		public function get listData():ListData
		{
			return null;
		}
		
		public function set listData(listData:ListData):void
		{
			_listData = listData;
			buttonLabel = _listData.label;
		//	buttonIcon  =  getDisplayObjectInstance(_listData.icon);
		//	buttonIcon = _listData.icon;
		}
		
		public function get data():Object
		{
			return null;
		}
		
		public function set data(value:Object):void
		{
		}
		
		override public function get selected():Boolean
		{
			return false;
		}
		
		override public function set selected(value:Boolean):void
		{
		}
		
		public function setMouseState(state:String):void
		{
		}
		
	}
}