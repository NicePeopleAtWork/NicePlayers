/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.parsers
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.Banner;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.plugins.ad.Msn;
	
	public class ParserMsnV3 extends ParserMsn implements IParserMsn
	{

		public function ParserMsnV3(ref:Msn,controller:IPlayerController)
		{
			_ref = ref;
			_controller = controller;
			_msnVersion = "MSNv3";
		}
		///////////////////////////////////////////////////////////////////////////////////////	
		public function isThirdPartyAd(ad:XML):Boolean
		{
			return (ad.@type == "Third Party");
		}
	
		///////////////////////////////////////////////////////////////////////////////////////	
		public function parseThirdPartyAd(ad:XML):void
		{
			_controller.trace("PARTY AD!", "MSNv3");

			var adChildren:XMLList = ad.children();
			for each (var adChild:XML in adChildren)
			{
				if (adChild.localName() == "contentgroup")
				{
					var contentList:XMLList = adChild.children();
					for each (var content:XML in contentList)
					{
						if (content.localName() == "content")
						{
							var url:String = content.@url;
							if (url)
								_ref.reloadURL(url);
							return;
						}
					}
				}
			}
			return;
		}
		
		///////////////////////////////////////////////////////////////////////////////////////	
		public function parseStandardAd(ad:XML):Object
		{
			var clip:BaseClip = new BaseClip();
			var banners:Object = new Object();
			var trackingURLs:Array = new Array();
			
			var adChildren:XMLList = ad.children();
			for each (var adChild:XML in adChildren)
			{
				switch(adChild.localName())
				{
					case "mediagroup":
						// get clip's URL and banners...
						clip.URL = getMediaUrl(adChild);
						if (!clip.URL.length)
						{
							_controller.trace("*** ERROR: mediaUrl not found","MSN");
							return {}; // BAIL
						}
						banners = parseMediaGroup(adChild);
						break;

					case "clickgroup":
						// get hyperlinks for the banners...
						parseClickGroup(adChild, banners);
						break;
						
					case "trackgroup":	  
						var bSuccess:Boolean = parseTrackGroup(adChild, trackingURLs); 
						if (!bSuccess) 
							return {}; // BAIL!
						break;
						
					case "tpstrackgroup": 
						parseTpsTrackGroup(adChild,trackingURLs);
						break;
				}
			}
			for each (var banner:Banner in banners)
				clip.banners.push(banner);
			
			var oReturnData:Object = { clip:clip, trackingURLs:trackingURLs };
			return oReturnData;
		}
		
		///////////////////////////////////////////////////////////////////////////////////////	
		private function parseMediaGroup(mediaGroup:XML):Object
		{
			var banners:Object;
			
			// get banners...
			var mediaList:XMLList = mediaGroup.children();
			for each (var media:XML in mediaList)
			{
				if (media.@type =="flash")
				{
					banners = getBanners(media);
					if (banners)
						break;
				}
			}
			
			// if no flash banner, look for an image
			if (!banners)
			{
				_controller.trace("No \"flash\" media found; looking for \"image\"", "MSNv3");

				for each (var media2:XML in mediaList)
				{
					if (media2.@type =="image")
					{
						var src:String = media2.@url;
						if (src)
						{
							_controller.trace("Found \"image\" banner of \"" + src + "\"", "MSNv3");
							var banner:Banner = new Banner();
							banner.src = src;						
							banner.region = "img1";
							
							banners = new Object();
							banners["img1"] = banner;
							break;
						}
					}
				}
			}
			
			if (!banners)
				_controller.trace("No banners found", "MSNv3");

			return banners;
		}
	
		///////////////////////////////////////////////////////////////////////////////////////
		private function parseClickGroup(clickGroup:XML, banners:Object):void
		{
			var clickList:XMLList = clickGroup.children();
			for each (var click:XML in clickList)
			{
				var url:String = click.@url;
				if (url && url.length)
				{
					var name:String = "img" + click.@item;
					banners[name].href = url;
				}
			}
				
			for each (var banner:Banner in banners)
				if (!banner.href.length)
					_controller.trace("*** WARNING: Banner " + banner.src + " is not hyperlinked", "MSNv3");
		}
		
		///////////////////////////////////////////////////////////////////////////////////////	
		private function getBanners(media:XML):Array
		{
			// url format->  "http://xxxxxxxxx.swf?img1=xxx&img2=xxx"
			
			var bannerArray:Array;
			
			var queryParams:String = media.@url.split("?")[1]; // the stuff following the "?" in the URL
			if (!queryParams)
				return null;
			
			var arImages:Array = queryParams.split("&")
			for each (var image:String in arImages)
			{
				if (image.substr(0,3) == "img")
				{
					var name:String = image.substr(0,4); // img1, img2, etc
					var banner:Banner = new Banner();
					banner.src = image.split("=")[1];
					banner.region = name;
					if (!bannerArray)
						bannerArray = new Array();
					bannerArray[name] = banner;
				}
			}
			return bannerArray;
		}
		
		///////////////////////////////////////////////////////////////////////////////////////	
		private function parseTpsTrackGroup(tpsTrackGroup:XML, trackingURLs:Array):void
		{	
			var tpsTrackList:XMLList = tpsTrackGroup.children();
			for each (var tpsTrack:XML in tpsTrackList)
			{
				if (tpsTrack.localName() == "tpsimage")
					trackingURLs["tpsimage"] = tpsTrack.@url;
			}
		}
	}
}