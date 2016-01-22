package com.theplatform.pdk.plugins.managers
{
import com.serialization.json.JSON;
import com.theplatform.device.DeviceRegistrationResponse;
import com.theplatform.device.DeviceService;
import com.theplatform.downloadmanager.data.model.Device;
import com.theplatform.downloadmanager.data.model.User;
import com.theplatform.downloadmanager.services.authentication.AuthenticationResult;
import com.theplatform.downloadmanager.services.device.DRMProvisionResult;
import com.theplatform.downloadmanager.services.device.DRMProvisioner;
import com.theplatform.pdk.controllers.IViewController;
import com.theplatform.pdk.plugins.data.DeviceAuthenticationData;
import com.theplatform.pdk.plugins.events.DeviceServiceManagerEvent;
import com.theplatform.pdk.plugins.services.authentication.Authenticator;
import com.theplatform.pdk.utils.Debug;

import flash.events.Event;
import flash.events.EventDispatcher;
import flash.events.IOErrorEvent;
import flash.net.URLLoader;
import flash.net.URLRequest;

public class DeviceServiceManager extends EventDispatcher
{
    /**
     * Spec URLS
     *
     * http://tpsharepoint/dev/core/playerSDK/Specs/Device%20Manager%20PlugIn.htm
     * UI Comps
     * http://tpconfluence/display/product/Device+Manager
     *
     * http://tpconfluence/display/product/SAML+Authentication#SAMLAuthentication-Processtheresponse.
     * http://tpconfluence/display/product/Device+Identity+and+Registration
     *
     * http://tpconfluence/display/product/SAML+Authentication#SAMLAuthentication-CreatetheuserentryandretrieveatokenviatheTrustedadapter.
     *
     * From config.xml in the DownloadManager project
     * <provisionServiceURL>http://data.entitlement.sandbox.theplatform.com/eds/data/Device?schema=1.0&pipeline=audience</provisionServiceURL>
     * <deviceRegistrationURL>http://entitlement.sandbox.theplatform.com/ent/web/Entitlement?schema=1.0&pipeline=audience</deviceRegistrationURL>
     *
     * Token generator URL
     *
     * https://euid.theplatform.com/idm/web/Authentication/signIn?schema=1.0&form=xml
     * ukUDqQle/Jeremy
     * Jeremy
     *
     * ukUDqQle/paul.rangel
     * password
     *
     */

    // should these be loadvars with defaults?  i'm not sure yet
    public var authServiceUrl:String = "https://euid.theplatform.com/idm/JSON/Authentication/2.0/signIn";
    public var authServiceAliveUrl:String = "http://entitlement.commerce.theplatform.com/entitlement/management/alive"
    public var deviceRegistrationUrl:String = "http://entitlement.theplatform.com/ent/web/Entitlement?schema=1.0&pipeline=audience"; //"&traceTo=mailto:jeremy.lacivita@theplatform.com";
    public var drmProvisionURL:String = "http://foo.data.entitlement.theplatform.com/eds/data/Device?schema=1.5&pipeline=audience";
    //        public var userURI:String = "https://euid.theplatform.com/idm/data/User/ukUDqQle/1458572928"  <-- not used

    //  loadvars for the plugin
    private var _accountURI:String;
    private var _userDirectory:String;

    // get this from the UserAuthPlugIn
    private var _userToken:String;

    private var _identifier:Number;
    private var _deviceAuthenticationData:DeviceAuthenticationData;
    private var _deviceService:DeviceService;
    private var _drmProvisioner:DRMProvisioner;
    private var _authenticator:Authenticator;

    private var _attempts:Number = 0;

    private var _controller:IViewController;

    private var _authenticated:Boolean = false;

    public function DeviceServiceManager(controller:IViewController, accountURI:String, userDirectory:String, userToken:String)
    {
        // put this in a command chain to prevent playback if it doesn't all succeed (authenticationSuccess)
        _controller = controller;
        _accountURI = accountURI;
        _userDirectory = userDirectory;
        _userToken = userToken;
    }

    public function initAuthentication():void
    {

        //need to provision unless we have these...
        if (!deviceAuthenticationData.deviceId)
        {
            _controller.trace("Init provisioning: ", "DeviceServiceManager", Debug.INFO);
            provisionMachine();
        }
        else
        {
            _controller.trace("Init authenticating: ", "DeviceServiceManager", Debug.INFO);
            authenticate();
        }
    }

    protected function get deviceAuthenticationData():DeviceAuthenticationData
    {
        if (!_deviceAuthenticationData)
            _deviceAuthenticationData = new DeviceAuthenticationData();

        return _deviceAuthenticationData;

    }

    public function provisionMachine():void
    {
        dispatchEvent(new DeviceServiceManagerEvent(DeviceServiceManagerEvent.onProvisionStart));
        _attempts ++;

        if (_attempts > 2)
        {
            // might need to throw an event/error here to let the plugin know they should show the device manager UI
            return;
        }

        deviceAuthenticationData.reset();
        deviceAuthenticationData.createDeviceName();

        _drmProvisioner = new DRMProvisioner(drmProvisionURL, deviceRegistrationUrl, _accountURI, null);
        _drmProvisioner.provisionMachine(_userToken, deviceAuthenticationData.deviceClientInfo, deviceAuthenticationData.deviceName, "", provisionSuccess, provisionError);
    }

    protected function provisionSuccess(result:*):void
    {
        // get the device
        var device:Device = result as Device
        // set the device id
        _controller.trace("Provisioning SUCCESS: ", "DeviceServiceManager", Debug.INFO);
        deviceAuthenticationData.deviceId = device.id;
        dispatchEvent(new DeviceServiceManagerEvent(DeviceServiceManagerEvent.onProvisionComplete, true));
        doRegsiterDevice();
    }

    protected function provisionError(result:*):void
    {
        var r:DRMProvisionResult = result as DRMProvisionResult;
        if (r)
        {
            if (r.isAuthError || r.isServerError)
            {
                _controller.setPlayerMessage(r.message);
                _controller.trace("Provisioning Server Error: " + r.message, "DeviceServiceManager", Debug.ERROR);
            }
            else
            {
                // tell the plugin to show the device manager ui
                _controller.trace("Provisioning Error: " + r.message, "DeviceServiceManager", Debug.WARN);
                // we need to unregister all devices in this case
                dispatchEvent(new DeviceServiceManagerEvent(DeviceServiceManagerEvent.onProvisionComplete, false, {message: "Device provisioning failed"}));
            }
        }
    }

    protected function doRegsiterDevice():void
    {
        _drmProvisioner.registerDeviceId(_userToken, deviceAuthenticationData.deviceId, registerSuccess, registerError);
    }

    protected function registerSuccess(result:DeviceRegistrationResponse):void
    {
        _controller.trace("Registration success: ", "DeviceServiceManager", Debug.INFO);
        //result.registerDeviceResponse.returnResponse.exponent
        // see comment in Return.as for mapping
        var hexKey:Array = result.registerDeviceResponse.returnResponse.hexKey;

        deviceAuthenticationData.deviceModulus = hexKey[0]
        deviceAuthenticationData.deviceExponent = hexKey[1]

        doAuthentication();
    }

    protected function registerError(result:*):void
    {
        _controller.trace("Registration  error: " + result, "DeviceServiceManager", Debug.INFO);
        // tell the plugin to show the device manager ui
        dispatchEvent(new DeviceServiceManagerEvent(DeviceServiceManagerEvent.onRegisterComplete, false, "Device registration failed"));
    }

    public function authenticate():void
    {
        dispatchEvent(new DeviceServiceManagerEvent(DeviceServiceManagerEvent.onAuthenticationStart));
        doAuthentication();
    }

    protected function doAuthentication():void
    {

        _authenticator = new Authenticator(authServiceUrl, authServiceAliveUrl);
        _authenticator.clientIdentificationSchema = "PDK_ID";
        // modulus and exponent needs to be attached to the device for the authenication to go through
        // User can be a mock object
        var device:Device = new Device();
        device.modulus = deviceAuthenticationData.deviceModulus
        device.exponent = deviceAuthenticationData.deviceExponent
        device.name = deviceAuthenticationData.deviceName
        device.id = deviceAuthenticationData.deviceId;  //.substr(_deviceAuthenticationData.deviceId.lastIndexOf("/")+1);
        device.clientInfo = deviceAuthenticationData.deviceClientInfo
        _controller.trace("doAuthentication: sending modulus and exponent for device name " + device.name, "DeviceServiceManager", Debug.INFO);

        var user:User = new User();


        _authenticator.authenticate("", _userDirectory, user, device, authenticateSuccess, authenticateError);
    }

    protected function authenticateSuccess(result:*):void
    {
        var _deviceToken:String = (result as AuthenticationResult).token;
        _controller.trace("authentication success: " + _deviceToken, "DeviceServiceManager", Debug.INFO);
        _authenticated = true;
        dispatchEvent(new DeviceServiceManagerEvent(DeviceServiceManagerEvent.onAuthenticateComplete, true, {deviceToken: _deviceToken }));
    }

    protected function authenticateError(result:*):void
    {
        var r:AuthenticationResult = result as AuthenticationResult;
        _controller.trace("authentication error trying to provision new machine: ", "DeviceServiceManager", Debug.WARN);
        dispatchEvent(new DeviceServiceManagerEvent(DeviceServiceManagerEvent.onAuthenticateComplete, false, {message:r.message}));
        // auth failed, try to provision a new machine
        provisionMachine();
    }

    public function get authenticated():Boolean
    {
        return _authenticated;
    }

    /* public functions:  should move to another class? */

    public function removeThisDevice():void
    {
        doRemoveThisDevice();
    }

    public function removeAllDevices():void
    {
        var getOwnerIdUrl:String = drmProvisionURL + "&form=json&token=" + _userToken + "&fields=ownerId&range=1-1";
        var loader:URLLoader = new URLLoader();
        var ownerId:String;

        loader.addEventListener(Event.COMPLETE, onOwnerIdLoaded);
        loader.addEventListener(IOErrorEvent.IO_ERROR, onOwnerIdError);

        function onOwnerIdLoaded(e:Event):void
        {
            var json:Object = com.serialization.json.JSON.deserialize((e.target as URLLoader).data);
            if (json['entryCount'] > 0)
            {
                ownerId = json.entries[0].ownerId;
                doRemoveAllDevices(ownerId);
            }
        }

        function onOwnerIdError(e:Event):void
        {

        }
        try
        {
            loader.load(new URLRequest(getOwnerIdUrl));
        }
        catch(e:Error){}


        //http://data.entitlement.theplatform.com/eds/data/Device?schema=1.5&pipeline=audience&form=json&token=7b1P42ZdfFE1SXhZofe4wXD38FDH4LBe&method=delete&byOwnerId=http://mps.theplatform.com/data/Account/89114517
    }

    protected function doRemoveAllDevices(ownerId:String):void
    {
        var deleteUrl:String = drmProvisionURL + "&form=json&token=" + _userToken + "&method=delete&byOwnerId=" + ownerId;
        var loader:URLLoader = new URLLoader();

        loader.addEventListener(Event.COMPLETE, onDevicesDeleted);
        loader.addEventListener(IOErrorEvent.IO_ERROR, onDevicesError);

        function onDevicesDeleted(e:Event):void
        {
            var json:Object = com.serialization.json.JSON.deserialize((e.target as URLLoader).data);
            // confirm it worked
            // json.isException true or false
            if (json['isException'] == true)
            {
                dispatchEvent(new DeviceServiceManagerEvent(DeviceServiceManagerEvent.onUnregisterAllDevices, false, {}));
            }
            else
            {
                _authenticated = false;
                dispatchEvent(new DeviceServiceManagerEvent(DeviceServiceManagerEvent.onUnregisterAllDevices, true, {}));
            }
        }

        function onDevicesError(e:Event):void
        {
            // handle error
            dispatchEvent(new DeviceServiceManagerEvent(DeviceServiceManagerEvent.onUnregisterAllDevices, false, {}));
        }

        try
        {
            loader.load(new URLRequest(deleteUrl));
        }
        catch(e:Error)
        {
            // handle error
            dispatchEvent(new DeviceServiceManagerEvent(DeviceServiceManagerEvent.onUnregisterAllDevices, false, {}));
        }

    }

    protected function doRemoveThisDevice():void
    {
        //http://data.entitlement.theplatform.com/eds/data/Device/<deviceID>/?schema=1.5&pipeline=audience&form=json&token=7b1P42ZdfFE1SXhZofe4wXD38FDH4LBe&method=delete
        var deleteUrl:String = drmProvisionURL.substr(0, drmProvisionURL.indexOf("?")) + "/" + deviceAuthenticationData.deviceId.substr(deviceAuthenticationData.deviceId.lastIndexOf("/") + 1) + drmProvisionURL.substr(drmProvisionURL.indexOf("?")) + "&form=json&token=" + _userToken + "&method=delete";
        var loader:URLLoader = new URLLoader();

        loader.addEventListener(Event.COMPLETE, onDevicesDeleted);
        loader.addEventListener(IOErrorEvent.IO_ERROR, onDevicesError);

        function onDevicesDeleted(e:Event):void
        {
            var json:Object = com.serialization.json.JSON.deserialize((e.target as URLLoader).data);
            // CONFIRM IT WORKED
            // look in the json for any errors
            // if json.isException is true it didn't work
            // else, display check mark on the button
            if (json['isException'] == true)
            {
                dispatchEvent(new DeviceServiceManagerEvent(DeviceServiceManagerEvent.onUnregisterCurrentDevice, false));
            }
            else
            {
                _authenticated = false;
                dispatchEvent(new DeviceServiceManagerEvent(DeviceServiceManagerEvent.onUnregisterCurrentDevice, true));
            }
        }

        function onDevicesError(e:Event):void
        {
            // handle error?
            var json:Object = com.serialization.json.JSON.deserialize((e.target as URLLoader).data);
        }

        try
        {
            loader.load(new URLRequest(deleteUrl));
        }
        catch (e:Error){}
    }

    public function getNumberOfRegisteredDevices():void
    {
        //http://data.entitlement.theplatform.com/eds/data/Device/?schema=1.5&pipeline=audience&form=json&token=7b1P42ZdfFE1SXhZofe4wXD38FDH4LBe
        var allDevicesUrl:String = drmProvisionURL + "&form=json&token=" + _userToken;
        var loader:URLLoader = new URLLoader();

        loader.addEventListener(Event.COMPLETE, onGetNumberOfRegisteredDevices);
        loader.addEventListener(IOErrorEvent.IO_ERROR, onGetNumberOfRegisteredDevicesError);

        function onGetNumberOfRegisteredDevices(e:Event):void
        {
            var json:Object = com.serialization.json.JSON.deserialize((e.target as URLLoader).data);
            if (json.hasOwnProperty('isException') && json['isException'])
            {
                dispatchEvent(new DeviceServiceManagerEvent(DeviceServiceManagerEvent.onGetCurrentNumberOfDevices, false, {message: json['description']}));
            }
            else
            {
                dispatchEvent(new DeviceServiceManagerEvent(DeviceServiceManagerEvent.onGetCurrentNumberOfDevices, true, {numberOfDevices: json['entryCount']}));
            }

        }

        function onGetNumberOfRegisteredDevicesError(e:Event):void
        {
            var xml:XML = new XML(e);
            _controller.trace("GetNumberOfDevicesError: ", "DeviceServiceManager", Debug.ERROR);
            dispatchEvent(new DeviceServiceManagerEvent(DeviceServiceManagerEvent.onGetCurrentNumberOfDevices, false, {message: xml}));
        }

        try
        {
            loader.load(new URLRequest(allDevicesUrl));
        }
        catch (e:Error)
        {
            var xml:XML = new XML(e);
            _controller.trace("GetNumberOfDevicesError: ", "DeviceServiceManager", Debug.ERROR);
            dispatchEvent(new DeviceServiceManagerEvent(DeviceServiceManagerEvent.onGetCurrentNumberOfDevices, false, {message: xml}));
        }

    }
}
}
