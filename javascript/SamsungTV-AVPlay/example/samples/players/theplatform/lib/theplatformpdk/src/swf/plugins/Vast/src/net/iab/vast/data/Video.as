package net.iab.vast.data
{
	import net.iab.vast.data.VideoClicks;
	
	public class Video
	{
		public var adParameters:AdParameters;
		public var duration:Number;
		public var adId:String;
		public var videoClicks:VideoClicks;
        public var trackingEvents:Array;

		/**
		 * An array of MediaFile objects 
		 */		
		public var mediaFiles:Array;
		
		public function Video()
		{
		}

	}
}
