package net.iab.vast.data
{
	public class NonLinear
	{
		public var url:String;
		public var code:String;
		public var nonLinearClickThrough:String;
		public var adParameters:AdParameters;
		public var id:String;
		public var width:Number;
		public var height:Number;
		public var expandedWidth:Number;
		public var expandedHeight:Number;
        public var minSuggestedDuration:Number;

        public var htmlResource:XML;
		/**
		 * This must be a constant value from ResourceType 
		 */
		public var resourceType:String;
		public var creativeType:String;
		public var scalable:Boolean;
		public var maintainAspectRatio:Boolean;
		public var apiFramework:String;

        public var trackingEvents:Array;
		
		public function NonLinear()
		{
		}

	}
}
