package net.iab.vast.data
{
	public class Companion
	{
		public var url:String;
		public var code:String;
		public var companionClickThrough:String;
		public var altText:String;
		public var adParameters:AdParameters;
		public var id:String;
		public var width:Number;
		public var height:Number;
		public var expandedWidth:Number;
		public var expandedHeight:Number;
//        public var staticResource:StaticResource;
//        public var iFrameResource:IFrameResource;
        public var htmlResource:XML;
		/**
		 * This must be a constant value from ResourceType 
		 */
		public var resourceType:String;
		public var creativeType:String;

        public var trackingEvents:Array;

		public function Companion()
		{
		}
	}
}
