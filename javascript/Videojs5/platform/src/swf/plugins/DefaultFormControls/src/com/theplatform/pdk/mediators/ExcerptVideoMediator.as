package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.VideoControl;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.events.ExcerptFormEvent;
	import com.theplatform.pdk.events.ItemEvent;
	import com.theplatform.pdk.events.VideoEvent;
	import com.theplatform.pdk.functions.ExcerptFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	
	import flash.errors.IllegalOperationError;
	import flash.geom.Rectangle;

	public class ExcerptVideoMediator extends Mediator
	{
		private var _video:VideoControl;
		private var _currentClip:Clip;
		
		public function ExcerptVideoMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
		}
		
		override protected function setItem(item:Item):void
		{
			_video = item as VideoControl;
			if (!_video) throw new IllegalOperationError("An excerpt video mediator must have a VideoControl item");
			
			super.setItem(item);
			
			_video.addEventListener(VideoEvent.OnVideoPlaying, onVideoPlaying, false, 0, true);
			_video.addEventListener(VideoEvent.OnVideoPauseState, onVideoPauseState, false, 0, true);
			_video.addEventListener(VideoEvent.OnVideoLoading, onVideoLoading, false, 0, true);
			_video.addEventListener(ItemEvent.OnContainerLayout, onContainerLaidOut, false, 0, true);
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);

			card.registerFunction(ExcerptFormFunctions.setVideoClip, this, setClip);
			card.registerFunction(ExcerptFormFunctions.pauseExcerptVideo, this, pauseVideo);
			card.registerFunction(ExcerptFormFunctions.seekExcerptVideo, this, seekVideo);
		}
		
		private function setClip(clip:Clip):void
		{
			_video.initVideo(clip);
		}
		
		private function pauseVideo(isPaused:Boolean):void
		{
			_video.paused = isPaused;
		}
		
		private function seekVideo(position:Number):void
		{
			_video.location = position;
		}
		
		protected function onVideoPlaying(e:VideoEvent):void 
		{
			var time:Number = e.data as Number;
			card.dispatchEvent(new VideoEvent(VideoEvent.OnVideoPlaying, time)); 
		}
		
		protected function onVideoPauseState(e:VideoEvent):void 
		{
			card.dispatchEvent(new VideoEvent(VideoEvent.OnVideoPauseState, e.data)); 
		}
		
		protected function onVideoLoading(e:VideoEvent):void
		{
			card.dispatchEvent(new VideoEvent(VideoEvent.OnVideoLoading, e.data));
		}
		
		protected function onContainerLaidOut(e:ItemEvent):void
		{

			var mediaArea:Rectangle = (_controller as IPlayerController).getMediaArea();
			var ratio:Number = mediaArea.width / mediaArea.height;
			var ratioWidth:Number = Math.ceil(_video.height * ratio);
			if (ratioWidth != _video.width)
			{
				_video.width = ratioWidth;
			}   
			
			
			
		}
		
		override public function destroy():void
		{
			_video.removeEventListener(VideoEvent.OnVideoPlaying, onVideoPlaying);
			_video.removeEventListener(VideoEvent.OnVideoPauseState, onVideoPauseState);
			_video.removeEventListener(ItemEvent.OnContainerLayout, onContainerLaidOut);
			_video.removeEventListener(VideoEvent.OnVideoLoading, onVideoLoading);
			card.unRegisterFunction(ExcerptFormFunctions.setVideoClip);
			card.unRegisterFunction(ExcerptFormFunctions.pauseExcerptVideo);
			card.unRegisterFunction(ExcerptFormFunctions.seekExcerptVideo);
		}
		
	}
}
