package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.data.ExcerptFocus;
	import com.theplatform.pdk.events.ExcerptEvent;
	import com.theplatform.pdk.events.ExcerptFormEvent;
	import com.theplatform.pdk.events.SliderEvent;
	import com.theplatform.pdk.events.VideoEvent;
	import com.theplatform.pdk.functions.ExcerptFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	
	import flash.events.Event;
	import flash.events.KeyboardEvent;
	import flash.ui.Keyboard;

	public class ExcerptExcerptSliderMediator extends DefaultExcerptSliderMediator
	{
		private var _currentPercent:Number = 0;
		private var _ended:Boolean = false;
		
		public function ExcerptExcerptSliderMediator(id:String, controller:IViewController, metadata:ItemMetaData = null, resources:Object = null)
		{
			super(id, controller, metadata, resources);
		}

		override protected function setItem(item:Item):void
		{
			super.setItem(item);
			//register functions here for the excerpt slider
			_excerpt.addEventListener(SliderEvent.OnSeek, onSliderSeek, false, 0, true);
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);

			card.addEventListener(VideoEvent.OnVideoPlaying, onVideoPlaying);
			card.addEventListener(VideoEvent.OnVideoLoading, onVideoLoading);
			card.registerFunction(ExcerptFormFunctions.getExcerptStartTime, this, getExcerptStartTime);
			card.registerFunction(ExcerptFormFunctions.getExcerptEndTime, this, getExcerptEndTime);
			card.registerFunction(ExcerptFormFunctions.setPauseState, this, setPauseState);
		}

		protected function onVideoPlaying(e:VideoEvent):void
		{
			var currentLocation:Number = e.data as Number;
			_currentPercent = currentLocation / _currentClip.mediaLength
			_excerpt.percentage = _currentPercent;

			if (_currentPercent > _excerpt.endPercent + .01)//give a little buffer in case percent goes over a bit
			{
				if (!_ended)
				{
					_ended = true;
					card.call(ExcerptFormFunctions.pauseExcerptVideo, [true]);
					//card.call(ExcerptFormFunctions.seekExcerptVideo, [_currentClip.mediaLength * _excerpt.endPercent]);
				}
			}
			else
			{
				_ended = false;
			}

		}
		
		protected function onVideoLoading(e:VideoEvent):void
		{
			var percent:Number = e.data as Number;//should be a value between 0 and 1;
			_excerpt.loadPercentage = percent;
		}

		/* override protected function cardEnabled(isEnabled:Boolean):void
		{
		} */

		protected function getTimeFromPercent(p:Number):Number
		{
			return _currentClip.mediaLength * p;
		}

		protected function onSliderSeek(e:SliderEvent):void
		{
			var time:Number = getTimeFromPercent(e.data as Number);
			card.call(ExcerptFormFunctions.seekExcerptVideo, [time]);
		}

		override protected function focusChanged(newFocus:String, oldFocus:String):void
		{
			//do anything here?
		}

		override protected function setFocusedCursor(percent:Number):void
		{
			super.setFocusedCursor(percent);

			// super class might have modifed the inputted value
			percent = _percent;

			// pause the video while dragging
			card.call(ExcerptFormFunctions.pauseExcerptVideo, [true]);

			//the _excerpt has been updated so that now we can create an object that can be sent out in an event by using those values
			var event:ExcerptFormEvent;

			if (_excerpt.focus == ExcerptFocus.START)
			{
				if (percent > _excerpt.percentage)
				{
					_excerpt.percentage = percent;
					card.call(ExcerptFormFunctions.seekExcerptVideo, [_currentClip.mediaLength * percent]);
				}
			}
			else if (_excerpt.focus == ExcerptFocus.END)
			{
				if (percent < _excerpt.percentage)
				{
					_excerpt.percentage = percent;
					card.call(ExcerptFormFunctions.seekExcerptVideo, [_currentClip.mediaLength * percent]);
				}
			}
			else
			{
				// something is wrong
			}
			event = new ExcerptFormEvent(ExcerptFormEvent.START_TIME_CHANGED, getTimeFromPercent(_excerpt.startPercent));
			card.dispatchEvent(event);

			event = new ExcerptFormEvent(ExcerptFormEvent.END_TIME_CHANGED, getTimeFromPercent(_excerpt.endPercent));
			card.dispatchEvent(event);
		}
		
		protected override function excerptDragStop(e:ExcerptEvent):void 
		{
			super.excerptDragStop(e);
			card.call(ExcerptFormFunctions.seekExcerptVideo, [_currentClip.mediaLength * _excerpt.percentage])
		}
		
		protected override function keyPressed(e:KeyboardEvent):void 
		{
			super.keyPressed(e);
			var key:uint = e.keyCode;
			if (key == Keyboard.LEFT || key == Keyboard.RIGHT)
			{
				card.call(ExcerptFormFunctions.seekExcerptVideo, [_currentClip.mediaLength * _excerpt.percentage])
			}
		}

		protected function setPauseState(pause:Boolean):void
		{
			if (pause)
			{
				card.call(ExcerptFormFunctions.pauseExcerptVideo, [true]);
			}
			else
			{
				card.call(ExcerptFormFunctions.pauseExcerptVideo, [false]);
				if (_currentPercent >= _excerpt.endPercent - .001)
				{
					card.call(ExcerptFormFunctions.seekExcerptVideo, [_currentClip.mediaLength * _excerpt.startPercent]);
				}
			}
		}

		protected function getExcerptStartTime():Number
		{
			return _excerpt.startPercent * _currentClip.mediaLength / 1000;
		}

		protected function getExcerptEndTime():Number
		{
			return _excerpt.endPercent * _currentClip.mediaLength / 1000;
		}


		override public function destroy():void
		{
			if (_excerpt)
			{
				_excerpt.removeEventListener(SliderEvent.OnSeek, onSliderSeek);
			}
			if (card)
			{
				card.removeEventListener(VideoEvent.OnVideoPlaying, onVideoPlaying);
				card.removeEventListener(VideoEvent.OnVideoLoading, onVideoLoading);
				card.unRegisterFunction(ExcerptFormFunctions.getExcerptStartTime);
				card.unRegisterFunction(ExcerptFormFunctions.getExcerptEndTime);
				card.unRegisterFunction(ExcerptFormFunctions.setPauseState);
			}
			super.destroy();
		}

	}
}
