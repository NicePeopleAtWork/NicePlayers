package com.theplatform.downloadmanager.services.device
{
	import com.adobe.serialization.json.JSON;
	import com.theplatform.device.DeviceRegistrationResponse;
	import com.theplatform.device.DeviceService;
	import com.theplatform.device.DeviceWebService;
	import com.theplatform.downloadmanager.data.model.Device;
	import com.theplatform.downloadmanager.managers.LogManager;
	import com.theplatform.downloadmanager.services.UrlConfiguration;
	import com.theplatform.flex.identity.IIdentityClient;
	import com.theplatform.flex.identity.IdentityClientImpl;
	import com.theplatform.serialization.JsonSerializer;
	
	import flash.events.EventDispatcher;
	import flash.net.URLLoader;
	
		
	/**
	 * The DRMProvisioner will take the machine name and DRM Client info from
	 *an end user's machine and provision a DeviceID on the back-end for it. This
	 *provisioning will enable the drm license delivery by linking the WMDRM client
	 *info with the license delivery service.
	 */
	public class DRMProvisioner extends EventDispatcher
	{
		private var _drmProvisionURL:String;
		private var _log:LogManager;
		private var _accountURI:String;
		private var _userURI:String;
		private var _authFailure:Boolean = false;
		private var _serverFailure:Boolean = false;
		private var _provisionLoader:URLLoader;
		private var _deviceURL:String;
		private var _deviceRegistrationUrl:String;
		
		public static var DUPLICATE_ERROR:String = "Machine Name already exists";

		/**
		 * Constructor for DRMProvisioner. Requires a DRM Provision service URL and an account
		 * context for creation.
		 * @param drmProvisionServiceURL the URL for provisioning a machine against
		 * @param deviceRegistrationUrl the URL to register the device with
		 * @param accountURI the account URI context
		 * @param userURI the URI that identifies the user
		 */
		public function DRMProvisioner(drmProvisionServiceURL:String, deviceRegistrationUrl:String, accountURI:String, userURI:String)
		{		
			if (!drmProvisionServiceURL) 
			{
				throw new Error("URL is required for drm provision service");
			}
			
			if(!deviceRegistrationUrl) {
				throw new Error("URL is required for device registration service");
			}
			
			_drmProvisionURL = drmProvisionServiceURL;
			_deviceRegistrationUrl = deviceRegistrationUrl;
			_log = LogManager.getInstance();
			_accountURI = accountURI;
			_userURI = userURI; 
		}
		
		
		/**
		 * Provision the machine based on the enduser's authenticated token
		 * 
		 * @param token the authenticated enduser
		 * @param clientInfo the DRM client info bits pulled from the machine
		 * @param machineName the name of the machine
		 */
		public function provisionMachine(token:String, clientInfo:String, machineName:String, userName:String, success:Function, error:Function):void
		{
			var deviceServiceUrlConfiguration:UrlConfiguration = new UrlConfiguration(_drmProvisionURL);
			var identity:IIdentityClient = new IdentityClientImpl();
			var deviceService:DeviceService = new DeviceService();
			deviceService.authBridge = identity;
			deviceService.baseServiceUrl = deviceServiceUrlConfiguration.baseUrl;
			deviceService.path = deviceServiceUrlConfiguration.path;
			deviceService.clientIdentifiers = {"PDK_ID": clientInfo};
			deviceService.deviceName = machineName;
			deviceService.account = _accountURI;
			deviceService.schema = deviceServiceUrlConfiguration.queryParameters.getValue("schema") as String;
			deviceService.pipeline = deviceServiceUrlConfiguration.queryParameters.getValue("pipeline") as String;
			deviceService.token = token;
			
			_authFailure = false;
			_serverFailure = false;
			
			// make provision request
			_log.debug("Making machine provision request for : " + userName);
			deviceService.createDevice(deviceProvisionSuccess, deviceProvisionError);
			
			function deviceProvisionError(result:*):void {
				deviceError(result, error);
			}
			
			function deviceProvisionSuccess(result:*):void {
				deviceResult(result, success, error);
			}
		}
		
		public function registerDeviceId(token:String, deviceId:String, success:Function, error:Function):void {
			var json:Object = new Object();
			json.id = deviceId;
			registerDevice(token, json, success, error);
		}
		
		private function registerDevice(token:String, deviceJsonObject:Object, success:Function, error:Function):void {
			var identity:IIdentityClient = new IdentityClientImpl();
			var deviceWebServiceUrlConfiguration:UrlConfiguration = new UrlConfiguration(_deviceRegistrationUrl);
			var deviceService:DeviceWebService = new DeviceWebService();
			deviceService.authBridge = identity;
			deviceService.baseServiceUrl = deviceWebServiceUrlConfiguration.baseUrl;
			deviceService.path = deviceWebServiceUrlConfiguration.path;
			deviceService.account = _accountURI;
			deviceService.token = token;
			deviceService.schema = deviceWebServiceUrlConfiguration.queryParameters.getValue("schema") as String;
			deviceService.pipeline = deviceWebServiceUrlConfiguration.queryParameters.getValue("pipeline") as String;
			
			deviceService.registerDevice(com.adobe.serialization.json.JSON.encode(deviceJsonObject), registerDeviceSuccess, registerDeviceError);
				
				function registerDeviceSuccess(result:DeviceRegistrationResponse):void {
					_log.debug("registerDevice successful");
					success(result);
				}
				
				function registerDeviceError(result:*):void {
					_log.debug("registerDevice error: " + com.adobe.serialization.json.JSON.encode(result));
					error(result);
				}
		}
		
		private function deviceError(result:*, error:Function):void {
			var provisionRes:DRMProvisionResult= new DRMProvisionResult();
			
			if(result.serverStackTrace) {
				_log.error(result.serverStackTrace);
				if(result.serverStackTrace.indexOf("Duplicate entry") > -1) {
					provisionRes.message = DUPLICATE_ERROR;
					_log.warn(provisionRes.message);
					provisionRes.provisionEvent = null;
					provisionRes.isServerError = true;
				}
				else if(result.serverStackTrace.indexOf("Invalid token") > -1) {
					provisionRes.message = "Failed auth on drm provision request";
					_log.warn(provisionRes.message);
					provisionRes.provisionEvent = null;
					provisionRes.isAuthError = true;
				}
				else {
					provisionRes.message = "Error on drm provision request";
					_log.warn(provisionRes.message);
					provisionRes.provisionEvent = null;
					provisionRes.isServerError = true;
				}
			}
			else {
				provisionRes.message = result.title + ":" + result.description;
				_log.error(provisionRes.message);
				provisionRes.provisionEvent = null;
				provisionRes.isServerError = true;
			}
			
			error(provisionRes);
		}
		
		private function deviceResult(result:*, success:Function, error:Function):void {
			var prepProvisions:String = result;
			_log.debug("Prep provisions : " + result.id);
			var provisionResult:DRMProvisionResult = new DRMProvisionResult();
			var provisionEvent:DRMProvisionEvent;
			
   			if (result.id == null || result.id.length <= 0) 
   			{
   				_log.warn("Provision failure! : no device ID passed back");
				provisionResult.message = "Failed provision : no device ID passed back";
				provisionResult.provisionEvent = null;

				error(provisionResult);
   			}
   			else {
   				var device:Device = new Device();
				device = JsonSerializer.deserialize(com.adobe.serialization.json.JSON.encode(result), device);
				success(device);
   			}
		}
		
		/**
		 * Change the machine name for this device
		 * @param token the authenticated token
		 * @param machineName the new machine name
		 * @deviceURI the device to change the machine name on
		 * @userID optional user id
		 */
		public function changeMachineName(token:String, machineName:String, deviceURI:String, success:Function, error:Function/*, userID:String*/):void
		{
			var deviceUrlConfiguration:UrlConfiguration = new UrlConfiguration(deviceURI);
			var identity:IIdentityClient = new IdentityClientImpl();
			
			var deviceService:DeviceService = new DeviceService();
			deviceService.authBridge = identity;
			deviceService.baseServiceUrl = deviceUrlConfiguration.baseUrl;
			deviceService.path = deviceUrlConfiguration.path;
			deviceService.clientIdentifiers = null;
			deviceService.deviceName = machineName;
			deviceService.account = _accountURI;
			deviceService.schema = "1.0";
			deviceService.pipeline = "audience";
			deviceService.token = token;
			
			_authFailure = false;
			_serverFailure = false;
			
			// make provision request
			_log.debug("Making device update request for : " + deviceURI);
			deviceService.updateDevice(updateSuccess, updateError);
			function updateSuccess(json:Object):void {
				success();
			}
			
			function updateError(json:Object):void {
				_log.error("getDevice error: " + com.adobe.serialization.json.JSON.encode(json));
				error();
			}
		}
		
		public function getDevice(deviceId:String, token:String, success:Function, error:Function):void {
			var urlConfig:UrlConfiguration = new UrlConfiguration(deviceId);
			var identity:IIdentityClient = new IdentityClientImpl();
			var deviceService:DeviceService = new DeviceService();
			deviceService.authBridge = identity;
			deviceService.baseServiceUrl = urlConfig.baseUrl;
			deviceService.path = urlConfig.path;
			deviceService.account = _accountURI;
			deviceService.schema = "1.0";
			deviceService.pipeline = "audience";
			deviceService.token = token;
			deviceService.getDevice(getSuccess, getError);
			
			function getSuccess(json:Object):void {
				var device:Device = new Device();
				device = JsonSerializer.deserialize(com.adobe.serialization.json.JSON.encode(json), device);
				success(device);
			}
			
			function getError(json:Object):void {
				_log.debug("getDevice error: " + com.adobe.serialization.json.JSON.encode(json));
				error(json);
			}
		}
		
		public function destroy():void {
		}
	}
}
	
