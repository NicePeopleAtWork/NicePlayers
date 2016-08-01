/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.parsers
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.Banner;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.HyperLink;
	import com.theplatform.pdk.data.Overlay;
	import com.theplatform.pdk.plugins.ad.Msn;
	
	public class ParserMpva extends ParserMsn implements IParserMsn
	{
		private var ref:ParserMsn;
		
		public function ParserMpva(ref:Msn, controller:IPlayerController)
		{
			_controller = controller;
			_ref = ref;	
			_msnVersion = "MPVA";		
		}

		///////////////////////////////////////////////////////////////////////////////////////	
		public function isThirdPartyAd(ad:XML):Boolean
		{
			var bThirdParty:Boolean = false;
			
			var adChildren:XMLList = ad.children();
			for each (var adChild:XML in adChildren)
			{
				if (adChild.localName() == "mediagroup")
				{
					var contentList:XMLList = adChild.children();
					for each (var content:XML in contentList)
					{
						if (content.localName() == "content")
						{
							var url:String = content.@url;
							bThirdParty = Boolean(url);
						}
					}
				}
			}
			return bThirdParty;
		}
	
		///////////////////////////////////////////////////////////////////////////////////////	
		public function parseThirdPartyAd(ad:XML):void
		{
			var adChildren:XMLList = ad.children();
			for each (var adChild:XML in adChildren)
			{
				if (adChild.localName() == "mediagroup")
				{
					var mediaList:XMLList = adChild.children();
					for each (var media:XML in mediaList)
					{
						if (media.localName() == "content")
						{
							var url:String = media.@url;
							_controller.trace("RELOADING TO URL=" + url, "MPVA");
							if (url)
								_ref.reloadURL(url);
							return;
						}
					}
				}
			}
		}
		
		///////////////////////////////////////////////////////////////////////////////////////	
		public function parseStandardAd(ad:XML):Object
		{
			var clip:BaseClip = new BaseClip();
			var banners:Array = new Array();
			var overlays:Array = new Array();
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
							_controller.trace("*** ERROR: mediaUrl not found","MPVA");
							return {}; // BAIL
						}
						banners = getBanners(adChild);
						overlays = getOverlays(adChild);
						clip.overlays = overlays;
						break;
						
					case "clickgroup":
						// get hyperlinks for the banners and overlays...
						parseClickGroup(adChild, banners, overlays, clip);
						break;
						
					case "trackgroup":	  
						var bSuccess:Boolean = parseTrackGroup(adChild, trackingURLs); 
						if (!bSuccess) 
							return {}; // BAIL!
						break;
				}		
			}
			for each (var banner:Banner in banners)
			{
				clip.banners.push(banner);
			}
			
			var oReturnData:Object = { clip:clip, trackingURLs:trackingURLs };
			return oReturnData;
		}
	
		///////////////////////////////////////////////////////////////////////////////////////	
		private function getBanner(media:XML,isOverlay:Boolean=false):Banner
		{
			var obj:Banner = (isOverlay) ? (new Overlay()) : (new Banner());
			if (media.@url)
			{
				obj.src = media.@url;
				if (!isOverlay)
				{
					obj.bannerWidth = Number(media.@width);
					obj.bannerHeight = Number(media.@height);
				}
			}
			return obj;
		}
		
		///////////////////////////////////////////////////////////////////////////////////////	
		// We look for a <media> node with a "type" attribute of "in frame flash". If we find it, 
		// we extract out the "url" portion, and we'll show it while the ad plays over the video.
		///////////////////////////////////////////////////////////////////////////////////////	
		private function getOverlays(mediaGroup:XML):Array
		{
			var overlays:Array = new Array();
			
			var mediaList:XMLList = mediaGroup.children();
			
			for each (var media:XML in mediaList)
			{
				if (media.@type == "in frame flash")
				{
					var overlay:Overlay = Overlay(getBanner(media, true));
					_controller.trace("Found Flash overlay: " + overlay.src, "MSN");
					overlay.isFlash = true;
					overlays.push(overlay);
				}
			}
			return overlays;
		}
		///////////////////////////////////////////////////////////////////////////////////////	
		// The banners will be in the <mediagroup> group, as <media> tags with "type" attributes of "image" or "flash".
		//
		// We get each <media> tag with a "type" attribute of "flash", and if the "url" attribute is non-blank, we create 
		// a banner, using the "height" and "width" attributes on the tag.
		//
		// Then, we make a sweep through each <media> tag with a "type" attribute of "image". 
		// If the "url" attribute is non-blank, we check if "height" and "width" are provided.
		//
		// If they are provided, we then check if there's already a Flash banner that matches those dimensions.  
		// If there is a Flash banner, we ignore the image.  Otherwise we add the image as a banner, with the 
		// "height" and "width" supplied in the tag.
		//
		// If "height" and "width" are missing, that's MPVA's default image.  We ignore that for now, and go to the next 
		// "image" tag. When we're done, we check if we found at least one banner.  If we didn't, then we will use any 
		// "image" tag with a missing "height" and "width", and make that the only banner.
		///////////////////////////////////////////////////////////////////////////////////////	
		private function getBanners(mediaGroup:XML):Array
		{
			var banners:Array = new Array();
			var defaultBanner:Banner;
	
			//______BANNERS______
	
			// get all Flash banners
			var mediaList:XMLList = mediaGroup.children();
			
			for each (var media:XML in mediaList)
			{
				if (media.@type == "flash")
				{
					var flashBanner:Banner = getBanner(media);
					_controller.trace("Found " + flashBanner.bannerWidth + "x" + flashBanner.bannerHeight + " Flash banner: " + flashBanner.src, "MSN");
					
		  			// some flash banners in MPVA look like this:
		  			// - http://ads1.msn.com/ads/abuimg/MSNV_ImgWrap300x60.swf?img=http://ads1.msn.com/ads/10912/0000010912_000000000000000649372.jpg
		  			// unfortunately they don't render when we try to display them; so, we need to
		  			// strip these down to images
		  			var imgIndex:Number = flashBanner.src.lastIndexOf(".swf?img=");
		  			if (imgIndex >= 0)
		  			{
		  				flashBanner.src = flashBanner.src.slice(imgIndex + 9, flashBanner.src.length);
		  				_controller.trace("Changed to an image banner: " + flashBanner.src, "MSN");
		  			}					
					banners.push(flashBanner);
				}
			}
				
			// get image banners if there are no flash banners
			if (banners.length == 0)
			{
				for each (var media2:XML in mediaList)
				{
					if (media2.@type == "image")
					{
						var imageBanner:Banner = getBanner(media2);
						if (imageBanner)
						{
							_controller.trace("Found " + imageBanner.bannerWidth + "x" + imageBanner.bannerHeight + " Image banner: " + imageBanner.src, "MSN");
							// hold on to the default imageBanner, we'll need it later if we have no banners
							if (!imageBanner.bannerWidth && !imageBanner.bannerHeight)
								defaultBanner = imageBanner;
							else
								banners.push(imageBanner);
						}
					}
				}
			}
			
			// if we have no banners at this point, just grab any imageBanner without a width and height
			if (!banners)
			{
				if (defaultBanner)
				{
					_controller.trace("No banners with defined sizes found; using default image", "MSN");
					banners.push(defaultBanner);
				}
				else
				{
					_controller.trace("No banners found", "MSN");
				}
			}
			
			return banners;
		}
	
		///////////////////////////////////////////////////////////////////////////////////////
		// In the <clickgroup> group, we look for the <click> tag with an "item" attribute of "1".
		// If we find it, and we're showing a banner, we set up an event so when someone clicks 
		// on the banner, we hit this tracking URL.
		///////////////////////////////////////////////////////////////////////////////////////
		private function parseClickGroup(clickGroup:XML, banners:Array, overlays:Array, clip:BaseClip):void
		{
			// ________Tracking Clicks________
	
			var clickList:XMLList = clickGroup.children();
			for each (var click:XML in clickList)
			{
				if (click.@url && click.@item=="1")
				{
					// set the link for banners
					for each (var b:Banner in banners)
						b.href = click.@url;

					// set the link for overlays
					for each (var o:Overlay in overlays)
						o.href = click.@url;
												
					// also hyperlink the ad
					clip.moreInfo = new HyperLink();
					clip.moreInfo.href = click.@url;
					
					break;
				}
			}
			
			for each (var banner:Banner in banners)
				if (!banner.href.length)
					_controller.trace("*** WARNING: Banner " + banner.src + " is not hyperlinked", "MPVA");
		}
		
	}
}