package com.theplatform.pdk.views
{
	import com.theplatform.pdk.data.Padding;
	
	public interface ISiteListView extends IView
	{
		function set sharingSites(array:Array):void;
		function get sharingSites():Array;
		function set numberOfColumns(value:uint):void;
		function get numberOfColumns():uint;
		function set showText(value:Boolean):void;
		function get showText():Boolean;
		function set showScrollbar(value:String):void;
		function get showScrollbar():String;
		function set rowHeight(value:Number):void;
		function get rowHeight():Number;
		function set padding(value:Padding):void
		function get padding():Padding
		function set scrollbarPadding(value:Padding):void
		function get scrollbarPadding():Padding
		
	}
}