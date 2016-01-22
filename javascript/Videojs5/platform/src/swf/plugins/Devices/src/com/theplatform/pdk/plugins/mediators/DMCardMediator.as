package com.theplatform.pdk.plugins.mediators
{
	import com.theplatform.pdk.containers.ComponentArea;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.functions.HeaderFunctions;
	import com.theplatform.pdk.mediators.FormCardMediator;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.plugins.events.DeviceServiceManagerEvent;
	import com.theplatform.pdk.plugins.functions.DeviceManagerFormFunctions;
//	import com.theplatform.pdk.plugins.managers.DeviceServiceManager;
	import com.theplatform.pdk.utils.Debug;
	
	import mx.utils.StringUtil;

	public class DMCardMediator extends FormCardMediator	
	{


        private var _deviceManager:Object; //DeviceServiceManager;
		protected var _maxNumberOfDevices:Number ;
		protected var _defaultMessage:String = "You currently have {0} out of {1} devices registered. If you have reached your limit, you'll need to remove one or more devices in order to use additional ones. What would you like to do?";
		// used to trigger a regeistration of the device on destroy
		protected var _allDevicesUnregisterd:Boolean = false;
		protected var _icon:Array;
		
		public function DMCardMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{			
			super(id, controller, metadata, resources);
			if(!resources)
				return;
			
			if(resources.hasOwnProperty('deviceManager')) 			 
				_deviceManager = resources['deviceManager'];
		
			if(resources.hasOwnProperty('maxNumberOfDevices'))
				_maxNumberOfDevices = resources['maxNumberOfDevices'];
			
			if(resources.hasOwnProperty('icon'))
				_icon = resources['icon'];
		}
		
		override protected function setItem(item:Item):void
		{
			super.setItem(item);
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
		}
		
		override protected function deckCreated():void
		{	
			
			super.deckCreated();
			if(_icon)
				card.call(HeaderFunctions.setHeaderIcon, [_icon]);
			card.call(HeaderFunctions.setHeaderTitle, ["Device Management"]);
			
			// if the the current device is not in authenticated then we don't show the buttons to remove it
			if(_deviceManager&&!_deviceManager.authenticated)
				card.call(DeviceManagerFormFunctions.setCurrentDeviceControlsVisibility,[false]);
			// get the number of devices from the server and show the text
            if (_deviceManager)
            {
			    _deviceManager.addEventListener(DeviceServiceManagerEvent.onGetCurrentNumberOfDevices, onGetNumberOfDevices, false, 0, true);
			    _deviceManager.getNumberOfRegisteredDevices();
            }
		}
		
		protected function onGetNumberOfDevices(e:DeviceServiceManagerEvent):void
		{					
			if(e.success) {
				var currentNumberOfDevices:Number = e.data['numberOfDevices'];
				card.call(DeviceManagerFormFunctions.setDeviceManagerFormText, [StringUtil.substitute(_defaultMessage,currentNumberOfDevices,_maxNumberOfDevices)]);				
			} else {
				_controller.trace("onGetNumberOfDevices ERROR: "+e.data['message'],"DMCardMediator",Debug.ERROR);
				_controller.hideCard("forms", "tpDeviceManagerCard");
				_controller.setPlayerMessage(e.data['message']);								
			}	
		}
		
		override protected function cardCreated(componentArea:ComponentArea):void
		{
			card.registerFunction(DeviceManagerFormFunctions.unregisterCurrentDevice, this, unregisterCurrentDevice);
			card.registerFunction(DeviceManagerFormFunctions.unregisterAllDevices, this, unregisterAllDevices);
		}
		
		/* registered functions */
		
		protected function unregisterCurrentDevice():void
		{
            if (_deviceManager)
            {
			    _deviceManager.addEventListener(DeviceServiceManagerEvent.onUnregisterCurrentDevice, onUnregisterCurrentDevice, false, 0, true);
			    _deviceManager.removeThisDevice();
            }
            else
            {
                _controller.trace("There is no device manager to unregister devices","DMCardMediator",Debug.ERROR);
            }
		}
		
		protected function onUnregisterCurrentDevice(e:DeviceServiceManagerEvent):void
		{
			_deviceManager.removeEventListener(DeviceServiceManagerEvent.onUnregisterCurrentDevice, onUnregisterCurrentDevice);
			if(e.success) {
				card.call(DeviceManagerFormFunctions.setDeviceChecked,[true]);
				_deviceManager.getNumberOfRegisteredDevices();
			} else { 
				_controller.trace("onUnregisterCurrentDevice ERROR", "DMCardMediator",Debug.ERROR);
			}
		}
		
		protected function unregisterAllDevices():void
		{
			_allDevicesUnregisterd = true;
            if (_deviceManager)
            {
			_deviceManager.addEventListener(DeviceServiceManagerEvent.onUnregisterAllDevices, onUnregisterAllDevices, false, 0, true);
			_deviceManager.removeAllDevices();
            }
            else
            {
              _controller.trace("There is no device manager to unregister devices","DMCardMediator",Debug.ERROR);

            }
		}
		
		protected function onUnregisterAllDevices(e:DeviceServiceManagerEvent):void
		{
			if(e.success) {
				card.call(DeviceManagerFormFunctions.setAllDevicesChecked,[true]);				
				_deviceManager.getNumberOfRegisteredDevices();
			} else {
				_controller.trace("onUnregisterAllDevices ERROR", "DMCardMediator",Debug.ERROR);
			}
		}
		
		override protected function cardDestroyed(card:Card):void
		{
			if(_allDevicesUnregisterd&&_deviceManager)
				_deviceManager.provisionMachine();
			
			if(_deviceManager)
				_deviceManager.removeEventListener(DeviceServiceManagerEvent.onGetCurrentNumberOfDevices, onGetNumberOfDevices);
			card.unRegisterFunction(DeviceManagerFormFunctions.unregisterCurrentDevice);
			card.unRegisterFunction(DeviceManagerFormFunctions.unregisterAllDevices);
			super.cardDestroyed(card);
		}

        public function get deviceManager():Object
        {
            return _deviceManager;
        }

        public function set deviceManager(value:Object):void
        {
            _deviceManager = value;
        }
		
		
		
	}
}
