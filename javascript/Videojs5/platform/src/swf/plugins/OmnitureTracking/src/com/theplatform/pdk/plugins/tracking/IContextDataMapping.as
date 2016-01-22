package com.theplatform.pdk.plugins.tracking {
	public interface IContextDataMapping {
		function setProperty(n:String, v:Object):void;
		function getProperty(n:String):Object;
		function get milestones():IMilestones;
	}
}