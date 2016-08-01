package net.iab.vast.data
{
	import flash.xml.XMLNode;
	
	public class InLine extends Ad
	{
		public var adTitle:String;
		public var description:String;
		public var survey:String;
		public var video:Video;
		/**
		 * An array of Companion objects 
		 */		
		public var companionAds:Array;
		/**
		 * An array of NonLinear objects 
		 */		
		public var nonLinearAds:Array;
		
		public function InLine(ad:Ad)
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