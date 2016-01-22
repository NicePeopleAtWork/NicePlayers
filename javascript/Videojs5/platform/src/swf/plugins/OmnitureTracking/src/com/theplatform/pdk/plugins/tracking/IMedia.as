package com.theplatform.pdk.plugins.tracking {
	public interface IMedia {
		
		function get trackVars():String;
		function set trackVars(t:String):void
		
		function get trackEvents():String;
		function set trackEvents(t:String):void
		
		function get trackMilestones():String;
		function set trackMilestones(t:String):void

		function get trackSeconds():Number;
		function set trackSeconds(s:Number):void
		
		function get contextDataMapping():IContextDataMapping;
		
		function get trackUsingContextData():Boolean;
		function set trackUsingContextData(t:Boolean):void
		
		function get monitor():Object;
		function set monitor(f:Object):void;
		
		function get trackWhilePlaying():Boolean;
		function set trackWhilePlaying(t:Boolean):void

		function get segmentByMilestones():Boolean;
		function set segmentByMilestones(t:Boolean):void

		function track(t:String):void;
		function open(t:String, p:Number, id:String):void;
		function play(t:String, p:Number):void;
		function stop(t:String, p:Number):void;
		function close(t:String):void;

		function setProperty(n:String, v:Object):void;
		function getProperty(n:String):Object;
	}
}