package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.ButtonControl;
	import com.theplatform.pdk.controls.IconType;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.events.ButtonEvent;
	import com.theplatform.pdk.events.VideoEvent;
	import com.theplatform.pdk.functions.ExcerptFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;

	public class ExcerptPlayMediator extends PlayerButtonControlMediator
	{

		protected var _card:Card;
		protected var _paused:Boolean = true;

		public var playLabel:String = "Play";
		public var pauseLabel:String = "Pause";

		public var playTooltip:String = "Play";
		public var pauseTooltip:String = "Pause";

		public var playIcon:String = IconType.PLAY;
		public var pauseIcon:String = IconType.PAUSE;

		public function ExcerptPlayMediator(id:String, controller:IViewController, metadata:ItemMetaData = null, resources:Object = null)
		{
			super(id, controller, metadata, resources);
		}

		override protected function setItem(item:Item):void
		{
			super.setItem(item);
			_buttonControl.addEventListener(ButtonEvent.OnButtonClick, buttonClick, false, 0, true);
			if (_buttonControl.label)
			{
				playLabel = _buttonControl.label;
			}
			if (_buttonControl.labels && _buttonControl.labels[1])
			{
				pauseLabel = _buttonControl.labels[1];
			}
			
			//tooltips
			
			if (_buttonControl.tooltip)
			{
				playTooltip = _buttonControl.tooltip;
			}
			if (_buttonControl.tooltips && _buttonControl.tooltips[1])
			{
				pauseTooltip = _buttonControl.tooltips[1];
			} 
			setControlToPlayState(_buttonControl);
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
			_card = card;

			_card.addEventListener(VideoEvent.OnVideoPauseState, videoPauseState, false, 0, true);
		}

		private function videoPauseState(e:VideoEvent):void
		{
			_paused = e.data as Boolean;
			if (_paused)
			{
				setControlToPlayState(_buttonControl);
			}
			else
			{
				setControlToPauseState(_buttonControl);
			}
		}

		private function buttonClick(e:ButtonEvent):void
		{
			//call whatever registered function is set up for this
			_card.call(ExcerptFormFunctions.setPauseState, [!_paused]);
		}

		private function setControlToPlayState(bc:ButtonControl):void
		{
			bc.icon = playIcon;
			bc.tooltip = playTooltip;
			if(bc.showLabel)
				bc.label = playLabel;
		}

		private function setControlToPauseState(bc:ButtonControl):void
		{
			bc.icon = pauseIcon;
			bc.tooltip = pauseTooltip;
			if(bc.showLabel)
				bc.label = pauseLabel;
		}

	}
}
