/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.parsers
{
	import flash.xml.XMLNode;
	
	public interface IParserMsn
	{
		function isEmptyAd(node:XML):Boolean; 
		function isThirdPartyAd(adNode:XML):Boolean;
		function parseStandardAd(node:XML):Object; // returns { clip:BaseClip, trackingURLs:Array }
		function parseThirdPartyAd(node:XML):void;
		function getMSNVersion():String; // "MSNv3" or "MPVA"
	}
}