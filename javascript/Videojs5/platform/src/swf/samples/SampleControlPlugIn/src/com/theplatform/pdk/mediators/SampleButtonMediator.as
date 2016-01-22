package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.communication.ScopeInfo;
	import com.theplatform.pdk.containers.PlayerArea;
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.controls.ButtonControl;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.events.ButtonEvent;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	/**
	 * The sample mediator class sets up the  
	 * custom button control in the control rack. 
	 */

	public class SampleButtonMediator extends PlayerControlMediator
	{
		protected var _sampleButton:ButtonControl;
		protected var _metadata:ItemMetaData;
		private var _playerArea:PlayerArea;
		
		private var _timer:Timer;		
		private var _icon:*;
		
		// Use this value to demo the button changing its visibility. 
		private var _blink:Boolean;
		
		/**
		 * Constructor. Sets up some basic internal data items  
		 * and calls the superclass' constructor. 
		 * 
		 * @param id ID of plug-in as defined in the metadata.xml.
		 * @param controller Reference to the player controller that owns the control rack.
		 * @param metadata Metadata for the control. Varies by control type. 
		 * @param resources Object with properties for graphic resources. 
		 */
		public function SampleButtonMediator(id:String, controller:IPlayerController, metadata:ItemMetaData=null, resources:Object=null, blink:Boolean=true)
		{
			super(id, controller, metadata, resources);
			_icon = resources["icon"];
			_blink = blink;
			init();
		}
		
		/**
		 * Sets up the mediator within the control rack. Adds event listeners 
		 * and sets up the timer for the button to appear and disappear. 
		 */
		protected function init():void
		{
			// Add any events we want to put on the controller
			_controller.addEventListener(PdkEvent.OnControlsRefreshed, domComplete);
			
			// Set up a timer to toggle the visibility of the button.
			if (_blink)
			{
				_timer = new Timer(1000);
				_timer.addEventListener(TimerEvent.TIMER, timeSwitch, false, 0, true);
			}
		}
		
		/**
		 * Called on the superclass by the controller to 
		 * tie the actual custom control to the mediator. 
		 * Here we set the icon for the button, add a tooltip,
		 * and add listeners to the button events.
		 * 
		 * @param item The control object for which we're mediating.  
		 */
		override protected function setItem(item:Item):void
		{
			_sampleButton = item as ButtonControl;
			_sampleButton.icon = _icon;
			
			// If your icon shouldn't be colorized to match the player colors,
			// set this to false. Otherwise, the icon will be shifted to match
			// the player colors set in the canvas. 
			_sampleButton.colorizeIcon = false;
			
			_sampleButton.addEventListener(ButtonEvent.OnButtonClick, onClick, false, 0, true);
		}
		
		/**
		 * Called by the controller when the player wants 
		 * the button to be disabled. This method should 
		 * toggle the button's active state. 
		 */
		override public function enablePlayerControl():void
		{
			if (_sampleButton.enabled != _enabledState.enabled)
				_sampleButton.enabled = _enabledState.enabled;
		}
		
		/**
		 * What happens when a user clicks the button?
		 * <p>In this case, nothing.</p> 
		 * 
		 * @param e Button click information. 
		 */
		protected function onClick(e:ButtonEvent):void
		{
			// Here's where you'd put the implementation for your control.
			_controller.trace("SampleButtonMediator: Button clicked!", "SampleControlPlugIn", Debug.INFO);
			
			// In this example, we're also going to create a custom event
			// that gets picked up in the canvas through a JavaScript 
			// event handler. Custom events need to be configured properly
			// to be visible across the JavaScript bridge. 
			
			// Create a PDKEvent with a custom name and, if necessary, a data payload. 
			var custEvent:PdkEvent = new PdkEvent("OnCustomEvent", "Hi from ActionScript!");
			// Create a ScopeInfo object for the default scope (assuming that the default is OK) 
			var scopes:ScopeInfo = new ScopeInfo("default");
			// Set isGlobal on the ScopeInfo object to true. This helps get it over the JavaScript bridge.
			scopes.isGlobal = true;
			// Dispatch the event just like any other. 
			_controller.dispatchEvent(custEvent, scopes);
			
			// See the OnCustomEventHandler function in the canvas JavaScript to see the event processed. 

		}
		
		/**
		 * This is the event handler for when the contents of
		 * the control rack change. In this case we need to 
		 * start our timer for the first time the rack loads.
		 * We don't have to worry about it afterwards.    
		 * 
		 * @param e Event data from the player. 
		 */
		protected function domComplete(e:PdkEvent):void
		{
			_playerArea = e.data as PlayerArea;
			
			if (_playerArea)
			{
				_controller.removeEventListener(PdkEvent.OnControlsRefreshed, domComplete);
				if (_blink && !_timer.running)
				{
					_timer.start();
				}
			}
		}
		
		/**
		 * The internal timer that toggles the visibility of the 
		 * custom button control.  This results in an 
		 * OnControlsRefreshed event dispatch.  
		 */
		private function timeSwitch(e:TimerEvent):void
		{
			//Every second let's switch the button on and off
			var button:ButtonControl = _playerArea.getItemById("sampleControl") as ButtonControl;
			if (!button) return;
			if (button.visible)
			{
				button.visible = false;
			}
			else
			{
				button.visible = true;
			}
		}
		
		override public function destroy():void
		{
			if (_timer)
			{
				_timer.stop();
				_timer.removeEventListener(TimerEvent.TIMER, timeSwitch);
				_timer = null
			}
			_controller.removeEventListener(PdkEvent.OnControlsRefreshed, domComplete);
			if (_sampleButton) _sampleButton.removeEventListener(ButtonEvent.OnButtonClick, onClick);
		}	
	}
}
