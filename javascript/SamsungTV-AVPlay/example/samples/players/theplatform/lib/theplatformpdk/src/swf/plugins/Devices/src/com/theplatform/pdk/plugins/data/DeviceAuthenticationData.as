package com.theplatform.pdk.plugins.data
{
	import com.theplatform.pdk.plugins.utils.BrowserDetectUtil;
	
	import flash.net.SharedObject;
	
	public class DeviceAuthenticationData
	{
		
		private static const AUTH_SHARED_OBJECT:String = "authenticationSharedObject";
		
		public static const PDK_IDENTIFIER:String = 'tpPdkIdentifier';
		
		public static const DEVICE_ID:String = 'tpDeviceId';
		public static const DEVICE_MODULUS:String = 'tpDeviceModulus';
		public static const DEVICE_EXPONENT:String = 'tpDeviceExponent';
		
		private var _sharedObject:SharedObject;

		private var _deviceName:String;
		private var _deviceId:String;
		private var _deviceModulus:String;
		private var _deviceExponent:String
		
		private var _deviceClientInfo:String;
		
		public function DeviceAuthenticationData()
		{
			init();
		}
		
		private function init():void
		{
			_sharedObject = SharedObject.getLocal(AUTH_SHARED_OBJECT);
			_deviceId = _sharedObject.data[DEVICE_ID];
			_deviceName = _sharedObject.data[PDK_IDENTIFIER];
			_deviceModulus = _sharedObject.data[DEVICE_MODULUS];
			_deviceExponent = _sharedObject.data[DEVICE_EXPONENT];
		}
		
		public function reset():void {
			_deviceId = null;
			_deviceName = null;
			_deviceModulus = null;
			_deviceExponent = null;
			_deviceClientInfo = null;
		}
		
		public function get deviceClientInfo():String
		{
			if(!_deviceName)
				createDeviceName();
			if(!_deviceClientInfo) {
				var browser:BrowserDetectUtil = new BrowserDetectUtil();
				_deviceClientInfo = browser.os+browser.browser+_deviceName;			
			}	
			return _deviceClientInfo; 	
		}
		
		public function createDeviceName():String
		{
			if(_deviceName) {
				delete _sharedObject.data[PDK_IDENTIFIER];
				_deviceName = null;
			}
			var size:Number = 1000*1000*1000;
			_deviceName = String(Math.floor(Math.random()*size));
			_sharedObject.data[PDK_IDENTIFIER] = _deviceName;
			
			return _deviceName;
		}
		
		public function get deviceName():String
		{
			if(!_deviceName) 	
				_deviceName = _sharedObject.data[PDK_IDENTIFIER] as String;						
			 return _deviceName;
		}
		
		public function set deviceId(value:String):void
		{
			if(_sharedObject)
				_sharedObject.data[DEVICE_ID] = value;
				
			_deviceId = value;
		}
		
		public function get deviceId():String
		{
			if(!_deviceId)
				_deviceId = _sharedObject.data[DEVICE_ID] as String;
			return _deviceId;
		}
		
		public function get deviceModulus():String
		{
			if(!_deviceModulus)
				_deviceModulus = _sharedObject.data[DEVICE_MODULUS] as String; 
			return _deviceModulus
		}
		
		public function set deviceModulus(value:String):void
		{
			if(_sharedObject)
				_sharedObject.data[DEVICE_MODULUS] = value;
		}
		
		public function get deviceExponent():String
		{
			if(!_deviceExponent)
				_deviceExponent = _sharedObject.data[DEVICE_EXPONENT] as String; 
			return _deviceExponent
		}
		
		public function set deviceExponent(value:String):void
		{
			if(_sharedObject)
				_sharedObject.data[DEVICE_EXPONENT] = value;
		}
		
		public function save():void
		{
			_sharedObject.flush();
		}
		
		public function clear():void
		{
			_sharedObject.clear();
		}
		
	}	
}