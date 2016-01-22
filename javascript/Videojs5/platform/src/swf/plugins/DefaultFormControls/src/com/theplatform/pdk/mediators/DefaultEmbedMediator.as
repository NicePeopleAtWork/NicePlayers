package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.controls.ButtonControl;
	import com.theplatform.pdk.controls.IconType;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.data.CardActions;
	import com.theplatform.pdk.data.ReleaseState;
	import com.theplatform.pdk.events.ButtonEvent;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.events.PlayerEvent;
	import com.theplatform.pdk.metadata.ItemMetaData;
	
	import flash.errors.IllegalOperationError;

	public class DefaultEmbedMediator extends PlayerButtonControlMediator
	{

		private static const DEFAULT_TOOLTIP:String = "Get Embed";
		private static const DEFAULT_LABEL:String   = "Embed";
		private static const DEFAULT_ICON:String    = IconType.EMBED;
		
		public function DefaultEmbedMediator(id:String, controller:IPlayerController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
			init();
			
		}
		private function init():void
		{
			_controller.addEventListener(PdkEvent.OnMediaStart, handleMediaStart);
			_controller.addEventListener(PdkEvent.OnMediaEnd,handleMediaEnd);
			_controller.addEventListener(PdkEvent.OnLoadRelease, handleLoadRelease);
			_controller.addEventListener(PdkEvent.OnLoadReleaseUrl, handleLoadRelease);
						
		}
		
		
		override protected function setItem(item:Item):void
		{
			super.setItem(item);

			// check to make sure it works
			if (!_buttonControl) throw new IllegalOperationError("the type of control set on the DefaultEmbedMediator was incorrect");

			//handle defaults
			if (_buttonControl.icon == undefined) _buttonControl.icon = DEFAULT_ICON;
			if (_buttonControl.label == null) _buttonControl.label = DEFAULT_LABEL;
			if (_buttonControl.tooltip == null) _buttonControl.tooltip = DEFAULT_TOOLTIP;
			
			if ((_controller as IPlayerController).getReleaseState() != ReleaseState.EMPTY)
			{
				//turn self on, the loadRelease must have fired before the mediator was created
				_enabledState.enable(true, "noRelease");
			}
			else
			{
				_enabledState.enable(false, "noRelease");
			}
			
			enablePlayerControl();
			// add event listeners 	
			_buttonControl.addEventListener(ButtonEvent.OnButtonClick, handleClick);

		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
		}
		
		protected function handleMediaStart(e:PdkEvent):void
		{
			_enabledState.enable(true, "noRelease");
			enablePlayerControl();
		}
		
		protected function handleMediaEnd(e:PdkEvent):void
		{
			_enabledState.enable(false, "noRelease");			
			enablePlayerControl();
		}
		
		protected function handleLoadRelease(e:PdkEvent):void
		{
			_enabledState.enable(true, "noRelease");
			enablePlayerControl();
		}

		
		
		override public function enablePlayerControl():void
		{
			if (_buttonControl && _buttonControl.enabled != _enabledState.enabled)
				_buttonControl.enabled = _enabledState.enabled;
		}
		
		protected function handleClick(e:ButtonEvent):void
		{
			_pController.closeFullScreenThenShowCard("forms", "tpEmbedCard", CardActions.DISABLE);
		}
		
		override public function destroy():void
		{
			if (_buttonControl)
			{
				_buttonControl.removeEventListener(ButtonEvent.OnButtonClick, handleClick);
			}
			_controller.removeEventListener(PdkEvent.OnMediaStart, handleMediaStart);
			_controller.removeEventListener(PdkEvent.OnMediaEnd,handleMediaEnd);
			_controller.removeEventListener(PdkEvent.OnLoadRelease, handleLoadRelease);
			_controller.removeEventListener(PdkEvent.OnLoadReleaseUrl, handleLoadRelease);
			super.destroy();
		}
	}
}
