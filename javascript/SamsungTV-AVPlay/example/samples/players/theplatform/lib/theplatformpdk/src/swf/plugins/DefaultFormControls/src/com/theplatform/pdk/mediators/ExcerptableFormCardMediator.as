package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.containers.ComponentArea;
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.Excerpt;
	import com.theplatform.pdk.data.Release;
	import com.theplatform.pdk.events.ExcerptFormEvent;
	import com.theplatform.pdk.functions.ExcerptFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.utils.Debug;
	import com.theplatform.pdk.utils.PdkStringUtils;

	public class ExcerptableFormCardMediator extends FormCardMediator
	{
		protected var _excerpt:Excerpt;

		public function ExcerptableFormCardMediator(id:String, controller:IViewController, metadata:ItemMetaData = null, resources:Object = null)
		{
			super(id, controller, metadata, resources);
		}

		protected override function cardCreated(componentArea:ComponentArea):void
		{
			_excerpt = new Excerpt();
			
			_excerpt.clip = currentClip;

			card.addEventListener(ExcerptFormEvent.START_TIME_CHANGED, onStartTimeChanged);
			card.addEventListener(ExcerptFormEvent.END_TIME_CHANGED, onEndTimeChanged);

			_excerpt.startTime = 0;
			if (currentClip)
			{
				_excerpt.endTime = Math.floor(currentClip.length);
			}
			else
			{
				_excerpt.endTime = 0;
			}
		}

		protected override function deckCreated():void
		{
			if (card.hasFunction(ExcerptFormFunctions.getExcerptStartTime))
			{
				_excerpt.startTime = Math.floor(card.call(ExcerptFormFunctions.getExcerptStartTime, []));
			}
			else
			{
				_excerpt.startTime = 0;
			}

			if (card.hasFunction(ExcerptFormFunctions.getExcerptEndTime))
			{
				_excerpt.endTime = Math.floor(card.call(ExcerptFormFunctions.getExcerptEndTime, []));
			}
			else if (currentClip)
			{
				_excerpt.endTime = Math.floor(currentClip.length);
			}
			else
			{
				_excerpt.endTime = 0;
			}
		}

		protected function onStartTimeChanged(e:ExcerptFormEvent):void
		{
			_excerpt.startTime = Math.floor((e.data as Number) / 1000);
			updateExcerptTimes();
		}

		protected function onEndTimeChanged(e:ExcerptFormEvent):void
		{
			_excerpt.endTime = Math.floor((e.data as Number) / 1000);
			updateExcerptTimes();
		}

		protected function updateExcerptTimes():void
		{
			// subclass should override
		}

        protected override function substituteUrl(url:String):String
		{
			if (currentClip&&currentClip.releasePID!=null)//if current clip has no release pid show release link
				return PdkStringUtils.substituteUrl(url, currentClip, _excerpt);
			else if (currentRelease)
				return PdkStringUtils.substituteUrl(url, currentRelease);
			else
				return url;
		}

		protected function substituteHtml(html:String):String
		{
			if (currentClip)
				return PdkStringUtils.substituteHtml(html, currentClip, _excerpt);
			else if (currentRelease)
				return PdkStringUtils.substituteHtml(html, currentRelease);
			else
				return html;
		}

		protected function getLinkText():String
		{
			var linkText:String;
			var playerUrl:String = _controller.getProperty("playerUrl");
			linkText = substituteUrl(playerUrl);

			return linkText;
		}

		protected override function cardDestroyed(card:Card):void
		{
			card.removeEventListener(ExcerptFormEvent.START_TIME_CHANGED, onStartTimeChanged);
			card.removeEventListener(ExcerptFormEvent.END_TIME_CHANGED, onEndTimeChanged);
			super.cardDestroyed(card);
		}

	}
}