package net.iab.vast.data
{
	import net.iab.vast.data.VideoClicks;
	
	public class Wrapper extends Ad
	{
		public var vastAdTagURL:String;
		public var videoClicks:VideoClicks;
		
		public function Wrapper(ad:Ad)
		{
			super();
			this.adSystem = ad.adSystem;
			this.extensions = ad.extensions;
			this.id = ad.id;
			this.impressions = ad.impressions;
			this.trackingEvents = ad.trackingEvents;
		}
		
	}
}