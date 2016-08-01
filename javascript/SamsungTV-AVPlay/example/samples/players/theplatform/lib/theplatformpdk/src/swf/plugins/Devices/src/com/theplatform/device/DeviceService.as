package com.theplatform.device
{
	import com.adobe.serialization.json.JSON;
	import com.adobe.serialization.json.JSONParseError;
	import com.theplatform.console.service.MockService;
	import com.theplatform.flex.ServiceUrl;
	import com.theplatform.flex.collections.ObjectMap;
	
	import flash.net.URLLoader;

	public class DeviceService extends MockService
	{
		public var clientIdentifiers:Object;
		public var description:String;
		public var deviceInfo:String;
		public var deviceName:String;
		public var schema:String;
		public var account:String;
		public var path:String;
		public var pipeline:String;
		public var token:String;

		public function DeviceService() {
			super(this, null);
		}
		
		public function createDevice(result:Function, error:Function):void {
			operationPreCheck();
			
			//encode as {"PDK_ID": clientIdentifiers}
			var device:String = "{\"$xmlns\":{\"dev\":\"http://xml.theplatform.com/data/entitlement/Device\"},\"dev$clientIdentifiers\": {";
				
			var isFirst:Boolean = true;
			for (var scheme:String in clientIdentifiers) {
				if (!isFirst) device += ", ";
				device += "\"" + scheme + "\": \"" + clientIdentifiers[scheme] + "\""; 
				isFirst = false;
			}
			
			device += "},\"dev$disabled\":false,\"dev$name\":\"" + deviceName + "\"}";
//			var device:String = "{\"$xmlns\":{\"dev\":\"http://xml.theplatform.com/data/entitlement/Device\"},\"dev$clientIdentifiers\":\"" +
//				clientIdentifiers + "\",\"dev$disabled\":false,\"dev$name\":\"" + deviceName + "\"}";
			
			var params:ObjectMap = new ObjectMap();
			params.add("schema", schema);
			params.add("pipeline", pipeline);
			params.add("account", account);
			params.add("token", token);
			params.add("form","json");
			
			var url:ServiceUrl = new ServiceUrl(baseServiceUrl, null, path, null, params);
			postData(url, device, dataLoaded, error);
			
			function dataLoaded(postLoader:URLLoader):void {
				var json:Object = com.adobe.serialization.json.JSON.decode(postLoader.data);
				if(json.isException) {
					error(json);
				}
				else {
					result(json);
				}
			}
		}
		
		public function getDevice(success:Function, error:Function):void {
			operationPreCheck();
			
			var params:ObjectMap = new ObjectMap();
			params.add("schema", schema);
			params.add("pipeline", pipeline);
			params.add("account", account);
			params.add("token", token);
			params.add("form","json");
			
			var url:ServiceUrl = new ServiceUrl(baseServiceUrl, null, path, null, params);
			getData(url, null, getDeviceSuccess, error);
			
			function getDeviceSuccess(loader:URLLoader):void {
				try {
					var json:Object = com.adobe.serialization.json.JSON.decode(loader.data);
				}
				catch(ex:JSONParseError) {
					return; // nothing to see here.  result of a device update is empty JSON
				}
				if(json.isException) {
					error(json);
				}
				else {
					success(json);
				}
			}
		}
		
		public function updateDevice(result:Function, error:Function):void {
			operationPreCheck();
			
			var device:String = "{\"$xmlns\":{\"dev\":\"http://xml.theplatform.com/data/entitlement/Device\"},\"dev$name\":\"" + deviceName + "\"}";
			
			var params:ObjectMap = new ObjectMap();
			params.add("schema", schema);
			params.add("pipeline", pipeline);
			params.add("account", account);
			params.add("token", token);
			params.add("form","json");
			
			var url:ServiceUrl = new ServiceUrl(baseServiceUrl, null, path, null, params);
			putData(url, device, dataLoaded, error);
			
			function dataLoaded(postLoader:URLLoader):void {			
				// Put returns http 200 and no data for success
				if (postLoader.data=="")
				{
					result(json);
				}			
				else
				{
					var json:Object = com.adobe.serialization.json.JSON.decode(postLoader.data);
					if(json.isException) {
						error(json);
					}
				}
			}
		}
	}
}