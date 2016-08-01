package com.theplatform.pdk.plugins.services.authentication
{
	
	import com.hurlant.crypto.Crypto;
	import com.hurlant.crypto.hash.HMAC;
	import com.hurlant.crypto.rsa.RSAKey;
	import com.hurlant.util.Base64;
	import com.hurlant.util.Hex;
	import com.theplatform.downloadmanager.data.model.Device;
	import com.theplatform.downloadmanager.data.model.User;
	import com.theplatform.downloadmanager.services.authentication.AuthenticationEvent;
	import com.theplatform.downloadmanager.services.authentication.AuthenticationResult;
	import com.theplatform.downloadmanager.services.authentication.IAuthenticator;
	import com.theplatform.downloadmanager.services.authentication.ServerTimeRetriever;
	import com.theplatform.flex.configuration.ServiceConfiguration;
	import com.theplatform.flex.identity.IIdentityClient;
	import com.theplatform.flex.identity.IIdentityContext;
	import com.theplatform.flex.identity.IdentityClientImpl;
	
	import flash.events.ErrorEvent;
	import flash.events.EventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.utils.ByteArray;
	
	import mx.utils.UIDUtil;


	public class Authenticator extends EventDispatcher implements IAuthenticator
	{
		
		private var _authServiceURL:String;
		private var _authServiceAliveURL:String;
		private var _identityConfig:ServiceConfiguration;
		private var _identity:IIdentityClient;
		
		private var _serverTimeRetriever:ServerTimeRetriever;
		private var _serverTime:Date;
		
		public var clientIdentificationSchema:String = "WMDRM";
		
		public function Authenticator(authService:String, authServiceAlive:String, identityClient:IIdentityClient=null)
		{
			if (!authService || !authServiceAlive) {
				throw new Error("URL is required for authentication");
			}
			
			if(identityClient != null) {
				_identity = identityClient;
			}
			else {
				_identity = new IdentityClientImpl();
			}
			_identityConfig = new ServiceConfiguration();
			_authServiceURL = authService;
			_authServiceAliveURL = authServiceAlive;
			_serverTimeRetriever = new ServerTimeRetriever(_authServiceAliveURL);
			
			
		}
		
		
		public function authenticate(directory:String, deviceAuthDirectory:String, user:User, device:Device, success:Function, error:Function):void {			
			setupForAuthentication(setupCompleted, error);
			function setupCompleted():void {
				doAuthentication(directory, deviceAuthDirectory, user, device, success, error);
			}	
		}
		
		protected function doAuthentication(directory:String, deviceAuthDirectory:String, user:User, device:Device, success:Function, error:Function):void {			
			
			if(_authServiceURL.indexOf("signIn") > -1) {
				_authServiceURL = _authServiceURL.substring(0,_authServiceURL.indexOf("signIn"));
			}
			
			_identityConfig.baseUrl = _authServiceURL;
			_identityConfig.servicePath = "";
			_identityConfig.version = "1.1";
			_identityConfig.parameters = {duration:14400000, idleTimeout:14400000};
			
			if(device && device.modulus && device.exponent && device.id && device.clientInfo) {
				configureDeviceAuthentication(device, deviceAuthDirectory);
			}
			else {
				trace("missing params");
			}
			
			_identity.serviceConfiguration = _identityConfig;
			_identity.getContext(authSuccess, authError, false);
			
			function authSuccess(context:IIdentityContext):void {
				processSuccessResponse(context, success);
			}
			
			function authError(msg:String):void {
				processErrorResponse(msg, error);
			}

		}
		
		protected function setupForAuthentication(success:Function, error:Function):void
		{	
			_serverTime = new Date();
			success();
		}
		
		private function configureDeviceAuthentication(device:Device, deviceAuthDirectory:String):void {
			
			var uid:String = UIDUtil.createUID();
			var rsaKey:RSAKey = RSAKey.parsePublicKey(device.modulus, device.exponent);
			var source:ByteArray = new ByteArray();
			var destination:ByteArray = new ByteArray();
			var encString:String = uid + "|" + clientIdentificationSchema + "|" + _serverTime.time;
			
			source.writeUTFBytes(encString);
			rsaKey.encrypt(source, destination, source.length);
			
			var hmac:HMAC = Crypto.getHMAC("hmac-sha1");
			var hashKey:ByteArray = Hex.toArray(Hex.fromString(uid));
			var hashData:ByteArray = Hex.toArray(Hex.fromString(device.clientInfo));
			
			var hashValue:ByteArray = hmac.compute(hashKey,hashData);
			var deviceId:String = device.id.substring(device.id.lastIndexOf("/") + 1);
			
			_identity.username = deviceAuthDirectory + "/" + deviceId;
			
			var passwordOne:String = Base64.encodeByteArray(destination);
			var passwordTwo:String = Base64.encodeByteArray(hashValue);
			_identity.password = passwordOne + "|" + passwordTwo;
		}
		
		protected function processSuccessResponse(context:IIdentityContext, success:Function):void {
			var authResult:AuthenticationResult;
			var evt:AuthenticationEvent;
			
			//authResult = new AuthenticationResult(context.token, context.duration, context.idleTimeout);
			authResult = new AuthenticationResult(context.token);
			authResult.authType = AuthenticationResult.DEVICE_AUTH;
			
			
			success(authResult);
		}
		
		protected function processErrorResponse(msg:String, error:Function):void {
			var authResult:AuthenticationResult;
			var evt:AuthenticationEvent;
			
			authResult = new AuthenticationResult();
 			authResult.message = msg;
 						
			authResult.authType = AuthenticationResult.DEVICE_AUTH;
			
			
			if(msg.indexOf("Error #2032: Stream Error.") > -1) {
				authResult.authEvent = new IOErrorEvent(IOErrorEvent.IO_ERROR);
			}
			else {
				authResult.authEvent = new ErrorEvent(ErrorEvent.ERROR);
			}
			
			error(authResult);
		}
		
	}
}