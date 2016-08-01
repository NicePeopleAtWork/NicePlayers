/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins.doubleclick.strategy
{
//    import com.theplatform.pdk.data.Clip;
    import com.google.ads.ima.api.AdsManager;

	public interface IDoubleClickStrategy
	{
		function get ready():Boolean;
		function preparePod(url:String):void;
		function playNextPod():Boolean;
		function get isOverlay():Boolean;
		function get isVpaid():Boolean;
		function set adsManager(am:AdsManager):void;
        function contentPauseRequested():void;
        function contentResumeRequested():Boolean; // Boolean: if true, we listen to IMA and finish any ad break (see AdRulesStrategy)
        function linearOrExpandedChanged():void;
        function destroy():void;

	}

}
