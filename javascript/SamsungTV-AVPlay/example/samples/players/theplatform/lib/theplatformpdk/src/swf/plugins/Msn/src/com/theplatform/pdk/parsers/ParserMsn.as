/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.parsers
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.plugins.ad.Msn;
	
	public class ParserMsn
	{
		protected var _msnVersion:String;
		protected var _ref:Msn;
		protected var _controller:IPlayerController
		
		public function ParserMsn()
		{
			// constructor
		}

		public function getMSNVersion():String { return _msnVersion	}
		
		public function isEmptyAd(ad:XML):Boolean
		{
			return (ad.localName() == "img")
		}
		
		///////////////////////////////////////////////////////////////////////////////////////	
		protected function getMediaUrl(mediaGroup:XML):String
		{
			var mediaList:XMLList = mediaGroup.children();
			
			// TODO: refactor using e4x queries - 

			for each (var media:XML in mediaList)
			{
				if (media.@type =="videoflash")
				{
					var videoFlashUrl:String = media.@url.toString()
					if (videoFlashUrl.length)
						return videoFlashUrl;
				}
			}
					
			for each (var media2:XML in mediaList)
			{
				if (media2.@type =="video")
				{
					var videoUrl:String = media.@url.toString()
					if (videoUrl.length)
						return videoUrl;
				}
			}
			return undefined;
		}
				
		///////////////////////////////////////////////////////////////////////////////////////	
		protected function parseTrackGroup(trackGroup:XML, trackingURLs:Array):Boolean
		{
			var atLeastOneURL:Boolean = false;
			
			var trackList:XMLList = trackGroup.children();
			for each (var track:XML in trackList)
			{
				var type:String =track.@type.toString(); 
				switch(type)
				{
					case "onload":
					case "durationtrack":
					case "endtrack":
						trackingURLs[type] = track.@url.toString();
						atLeastOneURL = true;
				}
			}
			return atLeastOneURL;
		}
	}		
}