package com.nice.event
{
	public class AnalyticEvent
	{
		private var type:String;
		private var time:Number=0;
		private var duration:Number=0;
		private var errorCode:String="";
		private var bitrate:Number=0;
		private var eventPamCode:String;
		private var resource:String;
		private var diffTimePing:Number;
		
		public function AnalyticEvent( _type:String , _pamCode:String )
		{
			this.type 			= _type;
			this.eventPamCode	= _pamCode;
		}
		
		public function setType ( _type:String ):void
		{
			this.type 			= _type;
		}
		
		public function getType ():String
		{
			return this.type;
		}
		
		public function setTime ( _time:Number ):void
		{
			this.time 			= _time;
		}
		
		public function getTime ():Number
		{
			return this.time;
		}
		
		public function setDuration ( _duration:Number ):void
		{
			this.duration 		= _duration;
		}
		
		public function getDuration ():Number
		{
			return this.duration;
		}
		
		public function setErrorCode ( _errorCode:String ):void
		{
			this.errorCode 		= _errorCode;
		}
		
		public function getErrorCode ():String
		{
			return this.errorCode;
		}
		
		public function setBitrate ( _bitrate:Number ):void
		{
			this.bitrate 		= _bitrate;
		}
		
		public function getBitrate ():Number
		{
			return this.bitrate;
		}
		
		public function setPamCode ( _pamCode:String ):void
		{
			this.eventPamCode 	= _pamCode;
		}
		
		public function getPamCode ():String
		{
			return this.eventPamCode;
		}
		
		public function setResource ( _resource:String ):void
		{
			this.resource 		= _resource;
		}
		
		public function getResource ():String
		{
			return this.resource;
		}
		
		public function setDiffTimePing ( _diffTimePing:Number ):void
		{
			this.diffTimePing	= _diffTimePing;
		}
		
		public function getDiffTimePing ():Number
		{
			return this.diffTimePing;
		}
		
	}
}