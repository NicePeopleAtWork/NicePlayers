package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.containers.ComponentArea;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.controls.IconType;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.data.CardActions;
	import com.theplatform.pdk.data.CardCallerType;
	import com.theplatform.pdk.data.ReleaseState;
	import com.theplatform.pdk.events.ButtonEvent;
	import com.theplatform.pdk.events.CardEvent;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.metadata.ItemMetaData;

	import com.theplatform.pdk.utils.Debug;
	import com.theplatform.pdk.utils.PdkBrowserDetectUtils;

	import flash.errors.IllegalOperationError;
	import flash.utils.setTimeout;

	public class DefaultMenuMediator extends PlayerButtonControlMediator
	{
		private static var DEFAULT_LINK_TO:String = "tpMenuCard";

        private static const BROWSER_WAIT_TIME:int = 5000;

		protected var _openLabel:String = "Menu";
		protected var _closeLabel:String = "Close";

		protected var _openTooltip:String = "Show Menu";
		protected var _closeTooltip:String = "Close Menu";

		protected var _openIcon:String = IconType.MENU_CLOSED;
		protected var _closeIcon:String = IconType.MENU_OPENED;

		protected var _linkTo:String;
		protected var _isOpen:Boolean = false;
		protected var _buttonControlCard:Card;
		protected var _buttonControlMediator:MenuCardMediator;

		private var _explicitHideLabel:Boolean = false;
		//private var _explicitLabelSecond:Boolean = false;
		
		public function DefaultMenuMediator(id:String, controller:IViewController, metadata:ItemMetaData = null, resources:Object = null)
		{
			super(id, controller, metadata, resources);
			init();
		}

		private function init():void
		{
			// handle metaData linkTo
			if (metadata)
			{
				if (metadata.display["linkTo"])
					_linkTo = metadata.display["linkTo"] as String;
				else
					_linkTo = DEFAULT_LINK_TO;
					
				if (metadata.display["showLabel"] == "false")
					_explicitHideLabel = true;
				
				/* if (metadata.display["labelFirst"] == "false")
					_explicitLabelSecond = true; */
				
			}
			
			_controller.addEventListener(PdkEvent.OnSetRelease, turnButtonOn);
			_controller.addEventListener(PdkEvent.OnSetReleaseUrl, turnButtonOn);
			_controller.addEventListener(PdkEvent.OnReleaseStart, turnButtonOn);
			_controller.addEventListener(PdkEvent.OnShowCard, handleShowCard);
			_controller.addEventListener(PdkEvent.OnHideCard, handleHideCard);
            //added this as fix for PDK-2980
            _controller.addEventListener(PdkEvent.OnFetchReleaseData, turnButtonOn);

		}

		override protected function setItem(item:Item):void
		{
			super.setItem(item);

			if (!_buttonControl)
				throw new IllegalOperationError("the menu mediator must be linked to a button control");
			
			if (_buttonControl.icon)
			{
				_openIcon = _buttonControl.icon;
			}
			if (_buttonControl.icons && _buttonControl.icons[1])
			{
				_closeIcon = _buttonControl.icons[1];
			}
			//labels
			if (_buttonControl.label)
			{
				_openLabel = _buttonControl.label;
			}
			if (_buttonControl.labels && _buttonControl.labels[1])
			{
				_closeLabel = _buttonControl.labels[1];
			}
			//tooltips
			if (_buttonControl.tooltip)
			{
				_openTooltip = _buttonControl.tooltip;
			}
			if (_buttonControl.tooltips && _buttonControl.tooltips[1])
			{
				_closeTooltip = _buttonControl.tooltips[1];
			}
			
			//we need to check if the menu card is currently open.
			if (!_buttonControlMediator)
			{
				_buttonControlMediator = _controller.getMediator(_linkTo, "forms", "tpMenuCard") as MenuCardMediator;
			}
			if (_buttonControlMediator && _buttonControlMediator.card && _buttonControlMediator.card.isActive)
			{
				_isOpen = false;//this will be set to true inside setOpened
				setOpened();
			}
			else
			{
				_isOpen = true;//this will be set to false inside setClosed
				setClosed();
			}
			
			if (!_explicitHideLabel)
			{
				_buttonControl.showLabel = true;//set the default to true unless it's been explicitly hidden
			}
			_buttonControl.addEventListener(ButtonEvent.OnButtonClick, buttonClicked, false, 0, true);

            checkValidity();

		}

		private function buttonClicked(e:ButtonEvent):void
		{
			if (_isOpen)
			{
				closeMenu();
			}
			else
			{
				openMenu();
			}
		}


		protected function openMenu():void
		{
			if (!_isOpen)
			{
				// REVIEW: just in case custom form is up
				_controller.showEmailForm(false);
				_controller.showLinkForm(false);

				var sendVars:Object = new Object();
				sendVars["callerType"] = CardCallerType.MENU_BUTTON;
				_pController.closeFullScreenThenShowCard("forms", _linkTo, CardActions.ENABLE, null, null, sendVars);
			}
		}

		protected function closeMenu():void
		{
			if (_isOpen)
			{
				_controller.hideCard("forms");
			}
		}

		private function handleShowCard(e:PdkEvent):void
		{
			var deck:String = e.data['deck'];
			var card:String = e.data['card'];
			if (deck == "forms" && card == _linkTo) //this is the card we want
			{
				setOpened();
			}			
		}

        private function handleHideCard(e:PdkEvent):void
        {
            var deck:String = e.data['deck'];
			var card:String = e.data['card'];
			if (deck == "forms" && card == _linkTo) //this is the card we want
			{
				setClosed();
			}
        }
		
		//called when controls refreshed with right card
		protected function setOpened():void
		{
			if (!_isOpen)
			{
				if (_buttonControl)
				{
					_buttonControl.label = _closeLabel;
					_buttonControl.tooltip = _closeTooltip;
					if (_closeIcon) _buttonControl.icon = _closeIcon;
				}
				
				_isOpen = true;
			}
		}

		protected function setClosed():void
		{
			if (_isOpen)
			{
				if (_buttonControl)
				{
					_buttonControl.tooltip = _openLabel;
					if (_openIcon)_buttonControl.icon = _openIcon;
					_buttonControl.label = _openLabel;
	
				}
				_isOpen = false;
			}
		}

		
		
		
		private function checkValidity():void
		{
			//set the state of the menu depending on the state of the release
			var curReleaseState:String = _pController.getReleaseState();
			
			if (curReleaseState == ReleaseState.EMPTY)
			{
				buttonSwitch(false);
			}
		}
		
		private function turnButtonOn(pe:PdkEvent):void
		{
            buttonSwitch(true);
		}
		
		private function turnButtonOff(pe:PdkEvent):void
		{
			buttonSwitch(false);
		}
		
		private function buttonSwitch(onoff:Boolean):void
		{
			if(onoff)
			{
				_enabledState.enable(true, "noRelease");//there's a release
				_buttonControl.enabled = _enabledState.enabled;
			}
			else
			{
				_enabledState.enable(false, "noRelease");//there's nothing to show
				_buttonControl.enabled = _enabledState.enabled;
			}
		}


		override public function destroy():void
		{
			if (_buttonControl)
            {
				_buttonControl.removeEventListener(ButtonEvent.OnButtonClick, buttonClicked);
                _buttonControl=null;
            }

            if (_buttonControlMediator)
            {
                //mediatormgr should handle its destruction
                _buttonControlMediator=null;
            }

            if(_enabledState)
            {
                _enabledState=null;
            }


			_controller.removeEventListener(PdkEvent.OnSetRelease, turnButtonOn);
			_controller.removeEventListener(PdkEvent.OnSetReleaseUrl, turnButtonOn);
			_controller.removeEventListener(PdkEvent.OnReleaseStart, turnButtonOn);
            //added this as fix for PDK-2980
            _controller.removeEventListener(PdkEvent.OnFetchReleaseData, turnButtonOn);
			_controller.removeEventListener(PdkEvent.OnShowCard, handleShowCard);
			_controller.removeEventListener(PdkEvent.OnHideCard, handleHideCard);



			super.destroy();
		}

	}
}
