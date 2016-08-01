package com.theplatform.pdk.views
{
	import com.theplatform.pdk.data.Padding;
	import com.theplatform.pdk.data.ReleaseFeed;
	import com.theplatform.pdk.views.relateditems.PageContainer;
	
	public interface IRelatedItemsView extends IView
	{
		function get previousButton():IButtonView;
		function get nextButton():IButtonView;
		function set itemRendererSkin(value:String):void
		function get itemRendererSkin():String;

		function set releaseFeed(value:ReleaseFeed):void;
		function get releaseFeed():ReleaseFeed;
		
		function set padding(value:Padding):void
		function get padding():Padding;
		
		function set currentPage(value:uint):void;
		function get currentPage():uint;
		
		function set relatedItemsPerPage(value:uint):void
		function get relatedItemsPerPage():uint;
	}
}