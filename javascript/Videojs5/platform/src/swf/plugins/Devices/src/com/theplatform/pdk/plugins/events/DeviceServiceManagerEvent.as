package com.theplatform.pdk.plugins.events
{
	import flash.events.Event;

	public class DeviceServiceManagerEvent extends Event
	{	
		// events sent on start as you might want to know the auth path being taken
		public static const onAuthenticationStart:String = "onAuthenticationStart";
		public static const onProvisionStart:String = "onProvisionStart";
		// complete events
		// this is what will resume the playback and will send a token
		public static const onAuthenticateComplete:String = "onAuthenticateComplete"; 
		public static const	onProvisionComplete:String = "onProvisionComplete";
		public static const onRegisterComplete:String = "onRegisterComplete";
		// data events
		public static const onUnregisterCurrentDevice:String = "onUnregisterCurrentDevice";
		public static const onUnregisterAllDevices:String = "onUnregisterAllDevices";
		public static const onGetCurrentNumberOfDevices:String = "onGetCurrentNumberOfDevices";
		
			
		public var success:Boolean;
		public var data:Object;
		
		public function DeviceServiceManagerEvent(type:String, success:Boolean=true, data:Object=null)
		{
			this.success = success;
			this.data = data;
			super(type);
		}
		
		override public function clone():Event
		{
			return new DeviceServiceManagerEvent(type, success, data);
		}
		
	}
}