package net.iab.vast.data
{
	public class MediaFile
	{
		public var url:String;
		public var id:String;
		/**
		 * This should be a constant from DeliveryType 
		 */		
		public var delivery:String;
		public var bitrate:Number;
		public var width:Number;
		public var height:Number;
        public var scalable:Boolean;
        public var maintainAspectRatio:Boolean;
        public var apiFramework:String;

		/**
		 * The standard limits this to "video/x-flv", "video/x-ms-wmv", and "video/x-ra".
		 * We don't do this; we allow any MIME type. 
		 */		
		public var type:String;
		
		public function MediaFile()
		{
		}
	}
}