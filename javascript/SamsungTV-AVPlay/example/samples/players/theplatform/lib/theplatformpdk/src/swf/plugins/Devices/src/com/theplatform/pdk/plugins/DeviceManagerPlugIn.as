package com.theplatform.pdk.plugins
{
import com.theplatform.pdk.containers.ComponentArea;
import com.theplatform.pdk.containers.Container;
import com.theplatform.pdk.containers.Region;
import com.theplatform.pdk.containers.RegionArea;
import com.theplatform.pdk.controllers.IPlayerController;
import com.theplatform.pdk.controllers.GlobalController;
import com.theplatform.pdk.controls.ButtonControl;
import com.theplatform.pdk.controls.Control;
import com.theplatform.pdk.controls.ImageControl;
import com.theplatform.pdk.controls.Item;
import com.theplatform.pdk.controls.TextAreaControl;
import com.theplatform.pdk.data.ICard;
import com.theplatform.pdk.data.CardPriority;
import com.theplatform.pdk.data.LoadObject;
import com.theplatform.pdk.data.Clip;
import com.theplatform.pdk.mediators.Mediator;
import com.theplatform.pdk.metadata.ItemMetaData;
import com.theplatform.pdk.plugins.IControlPlugIn;
import com.theplatform.pdk.plugins.events.DeviceServiceManagerEvent;
import com.theplatform.pdk.plugins.managers.DeviceServiceManager;
import com.theplatform.pdk.plugins.mediators.DMCardMediator;
import com.theplatform.pdk.plugins.mediators.DMMenuButtonMediator;
import com.theplatform.pdk.plugins.mediators.DMTextMediator;
import com.theplatform.pdk.plugins.mediators.DMUnregisterAllDevicesButtonMediator;
import com.theplatform.pdk.plugins.mediators.DMUnregisterAllDevicesCheckboxMediator;
import com.theplatform.pdk.plugins.mediators.DMUnregisterDeviceButtonMediator;
import com.theplatform.pdk.plugins.mediators.DMUnregisterDeviceCheckboxMediator;
import com.theplatform.pdk.plugins.views.AuthenticatingIndicatorHolder;
import com.theplatform.pdk.utils.Debug;
import com.theplatform.pdk.events.PdkEvent;


import flash.display.Sprite;
import flash.events.Event;
import flash.profiler.showRedrawRegions;

public class DeviceManagerPlugIn extends Sprite implements IControlPlugIn, ICredentialsPlugIn
{
    public static const SANDBOX_AUTHSERVICE_URL:String = "https://stg-user.identity.auth.theplatform.com/idm/JSON/Authentication/2.0/signIn";
    public static const SANDBOX_AUTHSERVICEALIVE_URL:String = "http://entitlement.commerce.sandbox.theplatform.com/entitlement/management/alive";
    public static const SANDBOX_REG_URL:String = "http://entitlement.sandbox.theplatform.com/ent/web/Entitlement?schema=1.0&pipeline=audience";
    public static const SANDBOX_PROVISION_URL:String = "http://data.entitlement.sandbox.theplatform.com/eds/data/Device?schema=1.3.0&pipeline=audience";

    public static const AUTHSERVICE_URL:String = "https://euid.theplatform.com/idm/JSON/Authentication/2.0/signIn";
    public static const AUTHSERVICE_ALIVE_URL:String = "http://entitlement.commerce.theplatform.com/entitlement/management/alive";
    public static const REG_URL:String = "http://entitlement.theplatform.com/ent/web/Entitlement?schema=1.0&pipeline=audience";
    public static const PROVISION_URL:String = "http://data.entitlement.theplatform.com/eds/data/Device?schema=1.3.0&pipeline=audience";

    /**
     * Embed the various sized icons.
     */
//    		[Embed(source='/images/Devices-256x256.png')]
//     private var _icon256:Class;
//
//     [Embed(source='/images/Devices-80x80.png')]
//     private var _icon80:Class;
//
//     [Embed(source='/images/Devices-40x40.png')]
//     private var _icon40:Class;
//
//     [Embed(source='/images/Devices-35x35.png')]
//     private var _icon35:Class;
//
//     [Embed(source='/images/Devices-30x30.png')]
//     private var _icon30:Class;

     [Embed(source='/images/Devices-20x20.png')]
     private var _icon20:Class;

//     [Embed(source='/images/Devices-15x15.png')]
//     private var _icon15:Class;
//
//     [Embed(source='/images/Devices-10x10.png')]
//     private var _icon10:Class;

    /**
     * Add the embeded icons to an array, biggest to smallest.
     */
    private var _icons:Array = [/*_icon256,
     _icon80,
     _icon40,
     _icon35,   
     _icon30,*/
     _icon20/*,                    
     _icon15,
     _icon10*/];


    private static const controlId:String = "tpDevices";

    private var _controller:IPlayerController;

    private var _deviceManagerMediator:DMMenuButtonMediator;
    private var _deviceManagerCardMediator:DMCardMediator;

    private var _menuButtonMediator:DMMenuButtonMediator;

    private var _deviceServiceManager:DeviceServiceManager
    private var _loadingIndicator:AuthenticatingIndicatorHolder;

    // load vars
    private var _accountId:String = null;
    private var _userDirectory:String = null;
    private var _maxNumberOfDevices:Number;
    private var _contexts:Array;
    private var _context:String;

    public static const GET_USER_TOKEN_FUNCTION:String = "getUserToken";
    public static const RESUME_SET_RELEASE_URL:String = "resumeSetReleaseUrl";

    private var _deviceToken:String; // returned on successful auth
    private var _userToken:String; // returned from UserAuthPlugin
    private var _sandbox:Boolean = false;
    private var _waitingForCredentials:Boolean = false;
	private var _serviceManagerInitialized:Boolean = false;
    private var _releaseUrl:String;

    private var _waitingForAuthenticated:Boolean = false;

    public static const DEVICE_CREDENTIALS_CONTEXT:String = "tpDeviceCredentialsContext";

    public function DeviceManagerPlugIn()
    {
    }

    public function initialize(lo:LoadObject):void
    {
        _controller = lo.controller as IPlayerController;
        trace("*** DeviceManagerPlugin init ***", "DeviceManagerPlugin");
        trace("registering control plugin with priority [" + lo.priority + "]", "DeviceManagerPlugIn", Debug.INFO);
        _controller.registerControlPlugIn(this, lo.priority);
        _controller.registerCredentialsPlugIn(this, lo.priority);

        // init load vars
        setLoadVars(lo.vars);



        // add the tpDevices card
        var devicesCard:XML =
                <card id="tpDeviceManagerCard" parentCardId="tpHeaderCard"  >
                    <spacer height="80%"/>
                    <container paddingLeft="50" paddingRight="60" height="100%" width="100%" >
                        <control id="tpDevicesTextArea" multiline="true"  paddingLeft="20" />
                        <group direction="horizontal" skin="none" width="100%" horizontalGap="4">
                            <control id="tpDevicesUnregisterCheckBox" />
                            <control id="tpDevicesUnregisterButton" label="Unregister this device" />
                            <spacer width="100%" />
                            <control id="tpDevicesUnregisterAllCheckBox" />
                            <control id="tpDevicesUnregisterAllButton" label="Unregister all my devices" />
                        </group>
                    </container>
                    <spacer height="80%"/>
                </card>
        _controller.addCard("forms", "tpDeviceManagerCard", devicesCard, CardPriority.DEFAULT);

        //initLoadingIndicator();
    }

    public function getCredentials(clip:Clip = null, context:String = null):Boolean
    {
        // first, we must IGNORE OUR OWN getCredentials calls, no matter what!
        if (context == DEVICE_CREDENTIALS_CONTEXT)
            return false;

        // if we have contexts and this call doesn't match then ignore
        // if we don't have a contexts array or the calling context is null, we go ahead and process
        if (context != null && _contexts && _contexts.indexOf(context) >= 0)
            return false;

        trace("getCredentials(): " + context, "DeviceManagerPlugIn", Debug.INFO);

        _context = context;

        if (_deviceToken && _accountId)
        {
            _controller.setCredentials(_accountId, _deviceToken, _context);
            return true;
        }
        else
        {
			if (!_serviceManagerInitialized)
			{
				initServicesManager();
			}

            // we're still waiting for the device manager to reply, or for the user to enter info, etc...
            _waitingForCredentials = true;
            return true;
        }
    }

    private function initLoadingIndicator():void
    {
        _loadingIndicator = new AuthenticatingIndicatorHolder(_controller);
        addChild(_loadingIndicator);
        _loadingIndicator.show();
    }

    private function initServicesManager():void
    {
		// we set this to true, even if its happening asyncronously and waiting on another plugin
		// otherwise it could get called twice.
		_serviceManagerInitialized =  true;

        initLoadingIndicator();

        //  get the userToken from the Identity
        if (!_userToken)
        {
            
            _controller.addEventListener(PdkEvent.OnCredentialsAcquired, credentialsAcquired);
            _controller.addEventListener(PdkEvent.OnCredentialAcquisitionFailed, credentialAcquisitionFailed);
            trace("calling getCredentials()... probably handled by Identity plugin", "DeviceManagerPlugIn", Debug.INFO);
            _controller.getCredentials(null, DEVICE_CREDENTIALS_CONTEXT)
            return;
        }

        doInitServicesManager();
    }

    private function credentialsAcquired(e:PdkEvent):void
    {
        _controller.trace("credentialsAcquired: " + e.data['context'], "DeviceManagerPlugIn", Debug.INFO);
        // ignore events from other stacks
        if (e.data["context"] != DEVICE_CREDENTIALS_CONTEXT) return;

        _controller.removeEventListener(PdkEvent.OnCredentialsAcquired, credentialsAcquired);
        _controller.removeEventListener(PdkEvent.OnCredentialAcquisitionFailed, credentialAcquisitionFailed);

        if (_accountId != e.data["username"])
        {
            // we have a problem
            _controller.trace("AccountId from Identity did not match accountUri from loadVar: " + _accountId, "DeviceManagerPlugIn", Debug.ERROR);
        }

        _userToken = e.data["password"];
        _controller.trace("credentialsAcquired: " + _userToken, "DeviceManagerPlugIn", Debug.INFO);

        doInitServicesManager();
    }

    private function credentialAcquisitionFailed(e:PdkEvent):void
    {
        // ignore events from other stacks
        if (e.data["context"] != DEVICE_CREDENTIALS_CONTEXT)
            return;

        _controller.removeEventListener(PdkEvent.OnCredentialsAcquired, credentialsAcquired);
        _controller.removeEventListener(PdkEvent.OnCredentialAcquisitionFailed, credentialAcquisitionFailed);


        //TODO: implement error case
        doInitServicesManager();

    }

    private function showCard(e:Event):void
    {

        //if no userToken??

        if (!_userToken)
        {


            //otherwise, we may show the login card
            _waitingForAuthenticated=true;

            initServicesManager();
        }
        else
        {
            _controller.showCard("forms", "tpDeviceManagerCard");
        }
    }

    private function doShowCard(e:PdkEvent=null):void
    {

        if (e&&e.data&&e.data["context"] != DEVICE_CREDENTIALS_CONTEXT) return;

        _waitingForAuthenticated=false;

        _controller.showCard("forms", "tpDeviceManagerCard");

    }

    private function doInitServicesManager():void
    {
        if (_userToken)
        {

            

            _controller.trace("User token set: " + _userToken, "DeviceManagerPlugIn", Debug.INFO);
            _deviceServiceManager = new DeviceServiceManager(_controller, _accountId, _userDirectory, _userToken);

            if (_deviceManagerCardMediator)
            {
                _deviceManagerCardMediator.deviceManager = _deviceServiceManager;
            }




            if (_sandbox)
            {
                _deviceServiceManager.authServiceUrl = SANDBOX_AUTHSERVICE_URL;
                _deviceServiceManager.authServiceAliveUrl = SANDBOX_AUTHSERVICEALIVE_URL
                _deviceServiceManager.deviceRegistrationUrl = SANDBOX_REG_URL; //"&traceTo=mailto:jeremy.lacivita@theplatform.com";
                _deviceServiceManager.drmProvisionURL = SANDBOX_PROVISION_URL;
            }
            else
            {
                _deviceServiceManager.authServiceUrl = AUTHSERVICE_URL;
                _deviceServiceManager.authServiceAliveUrl = AUTHSERVICE_ALIVE_URL
                _deviceServiceManager.deviceRegistrationUrl = REG_URL; //"&traceTo=mailto:jeremy.lacivita@theplatform.com";
                _deviceServiceManager.drmProvisionURL = PROVISION_URL;
            }

            _deviceServiceManager.addEventListener(DeviceServiceManagerEvent.onGetCurrentNumberOfDevices, onGetNumberOfDevices, false, 0, true);
            _deviceServiceManager.addEventListener(DeviceServiceManagerEvent.onAuthenticateComplete, onAuthenticationComplete, false, 0, true);
            _deviceServiceManager.getNumberOfRegisteredDevices();

        }
        else
        {
            _controller.trace("No user token set: ", "DeviceManagerPlugIn", Debug.ERROR);
            _controller.setPlayerMessage("initServicesManager: No user token set:");
        }
    }

    private function setLoadVars(vars:Object):void
    {
        if (!vars || !vars.hasOwnProperty("accountId") || !vars.hasOwnProperty("directory") || !vars.hasOwnProperty("maxNumberOfDevices"))
            _controller.trace("Missing load var", "DeviceManagerPlugIn", Debug.ERROR);

        _accountId = String(vars['accountId']);
        _userDirectory = String(vars["directory"]);
        _maxNumberOfDevices = Number(vars['maxNumberOfDevices']);
        _sandbox = (vars['sandbox'] == "true" ? true : false);

        if (vars['contexts'])
        {
            _contexts = vars['contexts'].split(",");
        }

        _controller.trace("Loadvars Set  _accountId: " + _accountId + " _userDirectory: " + _userDirectory + " _maxNumberOfDevices: " + _maxNumberOfDevices, "DeviceManagerPlugIn", Debug.INFO);
    }

    private function onProvisionComplete(e:DeviceServiceManagerEvent):void
    {
        if (!e.success)
            _controller.showCard("forms", "tpDeviceManagerCard");

    }

    private function onAuthenticationComplete(e:DeviceServiceManagerEvent):void
    {

        if (_waitingForAuthenticated)
        {
            doShowCard();

        }

        _loadingIndicator.hide();

        if (e.success && e.data.hasOwnProperty("deviceToken"))
        {
            _deviceToken = e.data['deviceToken'];
            if (_waitingForCredentials)
            {
                _waitingForCredentials = false;
                _controller.setCredentials(_accountId, _deviceToken, _context);

            }
        }
    }

    private function onGetNumberOfDevices(e:DeviceServiceManagerEvent):void
    {
        _deviceServiceManager.removeEventListener(DeviceServiceManagerEvent.onGetCurrentNumberOfDevices, onGetNumberOfDevices);

        if (e.success)
        {
            var currentNumberOfDevices:Number = e.data['numberOfDevices'];
            _controller.trace("number of devices: " + currentNumberOfDevices + " max: " + _maxNumberOfDevices, "DeviceManagerPlugIn", Debug.INFO);
            if (currentNumberOfDevices < _maxNumberOfDevices)
            {

                _deviceServiceManager.addEventListener(DeviceServiceManagerEvent.onProvisionComplete, onProvisionComplete, false, 0, true);
                _deviceServiceManager.initAuthentication();
            }
            else
            {
                _loadingIndicator.hide();
                _controller.showCard("forms", "tpDeviceManagerCard");
            }

        }
        else
        {
            _loadingIndicator.hide();
            _controller.trace(e.data['message'], "DeviceManagerPlugIn", Debug.ERROR);
            _controller.setPlayerMessage(e.data['message']);
        }
    }

    public function getControlIds():Array
    {
        return [controlId]
    }

    public function getControl(metadata:ItemMetaData):Control
    {
        var c:Control;

        switch (metadata.id)
        {
            // TextArea Controls
            case "tpDevicesTextArea":
                c = new TextAreaControl(metadata.id, metadata, _controller);
                break;
            // Button Controls
            case "tpDevicesMenuButton":
            case "tpDevicesUnregisterAllButton":
            case "tpDevicesUnregisterButton":
                c = new ButtonControl(metadata.id, metadata, _controller);
                break;
            // Image Controls
            case "tpDevicesUnregisterAllCheckBox":
            case "tpDevicesUnregisterCheckBox":
                c = new ImageControl(metadata.id, metadata, _controller);
                break;
        }

        return c;
    }

    public function getControlMediator(metadata:ItemMetaData):Mediator
    {
        var m:Mediator;

        switch (metadata.id)
        {
            // buttons
            case "tpDevicesMenuButton":
                //_buttonCreated = true;
                _menuButtonMediator = new DMMenuButtonMediator(metadata.id, _controller, metadata, {icons: [_icon20] });
                m = _menuButtonMediator;
                _menuButtonMediator.addEventListener("showDeviceManagerCard",showCard);
                break;
            case "tpDevicesUnregisterAllButton":
                m = new DMUnregisterAllDevicesButtonMediator(metadata.id, _controller, metadata);
                break;
            case "tpDevicesUnregisterButton":
                m = new DMUnregisterDeviceButtonMediator(metadata.id, _controller, metadata);
                break;

            // checkboxes
            case "tpDevicesUnregisterAllCheckBox":
                m = new DMUnregisterAllDevicesCheckboxMediator(metadata.id, _controller, metadata);
                break;
            case "tpDevicesUnregisterCheckBox":
                m = new DMUnregisterDeviceCheckboxMediator(metadata.id, _controller, metadata);
                break;

            // text area
            case "tpDevicesTextArea":
                m = new DMTextMediator(metadata.id, _controller, metadata);
                break;

            // card mediator
            case "tpDeviceManagerCard":
                _deviceManagerCardMediator = new DMCardMediator(metadata.id, _controller, metadata, {deviceManager: _deviceServiceManager, maxNumberOfDevices: _maxNumberOfDevices, icon: [/*_icon20*/] });
                m = _deviceManagerCardMediator;
                break;
        }
        return m;
    }

    // configure the menu button control
    public function get buttonMetaData():ItemMetaData
    {
        var itemMetaData:ItemMetaData = new ItemMetaData("tpDevicesMenuButton");
        itemMetaData.display['width'] = "50";
        itemMetaData.display['height'] = "50";
        itemMetaData.display['autoSkin'] = "false";
        itemMetaData.display['skin'] = "FormsButtonSkin";
        itemMetaData.display['direction'] = "vertical";
        itemMetaData.display['label'] = "Devices";
        return itemMetaData;
    }

    // this is called after everything else we can traverse the DOM and
    // add the new menu button to the menu card
    public function finalize(componentArea:ComponentArea):void
    {
        // ids to look for in the DOM
        var menuCardAreaId:String = "tpMenuCardarea";
        var menuCardId:String = "tpMenuCard";
        // containers in the dom that we are inspecting
        var mCard:ICard;
        var container:Container;
        // data to init the card
        var itemMetaData:ItemMetaData = buttonMetaData;
        var menuButtonControl:ButtonControl;
        var menuButtonControlMediator:DMMenuButtonMediator;
        // TODO: move this internally to the checks
        // TODO: listen for card destroyed and toggle _butonCreated
        // if(_buttonCreated)
        // return;

        if (componentArea && componentArea is RegionArea && componentArea.card.id == menuCardId)
        {
            if (menuCardAreaId == componentArea.id)
            {
                // set the card, used in the addMediator below
                mCard = componentArea.card;
                if (mCard.id == menuCardId)
                {
                    var regionArea:RegionArea = mCard.dom as RegionArea;
                    var region:Region = regionArea.getItemById("tpMenuRegion") as Region;
                    var tpMenuGroup:Container = region.children[0] as Container;
                    for each(var item:Item in tpMenuGroup.children)
                    {
                        var c:Container = item as Container;
                        if (c)
                        {
                            var infoItem:Item = c.getItemById("tpInfo");
                            if (infoItem)
                            {
                                menuButtonControl = getControl(itemMetaData) as ButtonControl;
                                c.addItemAt(menuButtonControl, c.getItemPosition(infoItem) + 1);
                                menuButtonControlMediator = getControlMediator(itemMetaData) as DMMenuButtonMediator;
                                _controller.addMediator(menuButtonControlMediator, mCard.deckId, mCard.id);
                            }

                        }
                    }
                }
            }

        }
    }


}
}
