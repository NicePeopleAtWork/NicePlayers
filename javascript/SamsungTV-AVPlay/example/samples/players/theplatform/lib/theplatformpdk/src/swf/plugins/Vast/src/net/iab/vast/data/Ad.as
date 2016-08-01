package net.iab.vast.data
{
	import flash.xml.XMLNode;
	
	public class Ad
	{
		public var id:String;
		public var adSystem:String;
		public var error:String;
		public var extensions:XML;
		public var sequence:Number;
		
		/**
		 * An array of URL objects 
		 */		
		public var impressions:Array;
		/**
		 * An array of TrackingEvent objects 
		 */		
		public var trackingEvents:Array;
		
		public function Ad()
		{
		}

	}
}