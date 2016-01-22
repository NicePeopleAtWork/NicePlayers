package com.theplatform.pdk.plugins.ad
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.Banner;
	import com.theplatform.pdk.plugins.BannerFactory;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.external.ExternalInterface;
	
	public class InStreamBannerFactory extends BannerFactory
	{
		
		public function InStreamBannerFactory(	controller:IPlayerController,
												bannerSizes:String, 
												bannerRegions:String, 
												bannerTiles:String, 
												bannerCommand:String,
												adKit:String)
		{
			super(controller, bannerSizes, bannerRegions, bannerTiles, bannerCommand, adKit);
		}
		
		public function getBanners(ad:IAd, mainInStreamUrl:String, adKit:String=null):Array
		{
			var banners:Array;
			
			if (!_bannerRegions)
				return null;

			// load bannerURLs into baseclip
			for (var i:Number=0; i<_bannerRegions.length; i++)
			{
				var br:Object = _bannerRegions[i];
				var bannerSize:String =  br.innerWidth + "x" + br.innerHeight;
				var newSizeURL:String = InStreamUtils.updateSize(mainInStreamUrl, bannerSize, br.tag);
				if (br.tile)
					newSizeURL.replace(/tile=\d+/g, "tile=" + br.tile);
					
				_controller.trace("getting banner roadblock with:[" + newSizeURL + "]","InStreamAd");
				var bannerURL:String = ad.getRoadblockURL(newSizeURL);
				_controller.trace("retrieved banner roadblock is:[" + bannerURL + "]","InStreamAd");
					
				// do ad kit substitution
				if (adKit)
				{
					bannerURL = String(ExternalInterface.call(adKit, bannerURL));
					_controller.trace("%%%% adKit returned [" + bannerURL + "]", "InStreamAd");
				}
				var banner:Banner	
				if (bannerURL)
				{
					banner = new Banner();
					banner.src = bannerURL;
					banner.bannerWidth = br.innerWidth;
					banner.bannerHeight = br.innerHeight;
					banner.region = br.region;
					
					if (br.tag == "pfadx")
						banner.bannerType = "DoubleClick InStream";
						
					if (!banners)
						banners = new Array();
					banners.push(banner);
				}
			}
			
			if (!banners || banners.length == 0)
			{
				_controller.trace("no legacy instream banners, checking for IMA banners", "InStreamAd");
				for (var i:Number=0; i<_bannerRegions.length; i++)
				{
					var br:Object = _bannerRegions[i];
					_controller.trace("region: " + br.innerWidth + "x" + br.innerHeight + " " + br.region, "InStreamAd");
					//let's try the hacky way, we'll assume there's only one
					var bannerObj_arr:Array = ad.getCompanionAds(br.innerWidth, br.innerHeight);
					if (bannerObj_arr && bannerObj_arr.length > 0)
					{
						for (var j:Number=0; j< bannerObj_arr.length; j++)
						{
							var bannerObj:Object = bannerObj_arr[j];
							if (bannerObj && bannerObj.hasOwnProperty("url"))
							{
								//we've got jpeg banners
								_controller.trace("found a jpg banner", "InStreamAd");
								banner = new Banner();
								banner.src = bannerObj.url;
								if (bannerObj.clickThrough)
								{
									banner.href = bannerObj.clickThrough;
								}
								if (bannerObj.altText)
								{
									banner.alt = bannerObj.altText;
								}
								banner.bannerHeight = bannerObj.height;
								banner.bannerWidth = bannerObj.width;
								banner.bannerType = "image";
								banner.region = br.region;
		                        if (!banners)
		                        {
		                            banners = [];
		                        }
		                        banners.push(banner);
							}
							else if (bannerObj && bannerObj.hasOwnProperty("content"))
							{
								_controller.trace("found an html banner", "InStreamAd");
								// we've got html banners
								banner = new Banner();
								banner.content = bannerObj.content;
								banner.bannerHeight = br.innerHeight;
								banner.bannerWidth = br.innerWidth;
								banner.region = br.region;
								banner.bannerType = "html";
		                        if (!banners)
		                        {
		                            banners = [];
		                        }
		                        banners.push(banner);
							}

						}
					}
				}
			}
			return banners;
		}
	}
}
