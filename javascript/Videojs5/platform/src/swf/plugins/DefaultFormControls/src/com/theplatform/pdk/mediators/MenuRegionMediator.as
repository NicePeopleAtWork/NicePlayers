package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
import com.theplatform.pdk.events.PdkEvent;
import com.theplatform.pdk.events.PlayerEvent;
	import com.theplatform.pdk.main.pdkInternal;
	import com.theplatform.pdk.metadata.ItemMetaData;

	import flash.events.Event;
	import flash.geom.Rectangle;

	use namespace pdkInternal;

	public class MenuRegionMediator extends PlayerRegionMediator
	{
		protected var _overlayArea:Rectangle;
		protected var _regionWidth:Number = 0;
		protected var _isFullScreen:Boolean = false;

		public function MenuRegionMediator(id:String, controller:IPlayerController, metadata:ItemMetaData = null, resources:Object = null)
		{
			super(id, controller, metadata, resources);
			init();
		}

		private function init():void
		{
			_overlayArea = _pcontroller.getOverlayArea();
			_controller.addEventListener(PlayerEvent.OnOverlayAreaChanged, overlayAreaChanged);
			_controller.addEventListener(PlayerEvent.OnFlashFullScreen, onFlashFullScreen);

            _controller.addEventListener(PdkEvent.OnMediaUnpause, onMediaAction);
			_controller.addEventListener(PdkEvent.OnMediaSeek, onMediaAction);

			_isFullScreen = IPlayerController(_controller).getFullScreenState();
		}

        private function onMediaAction(e:PdkEvent):void
        {
            _controller.hideCard("forms");//this card hides itself whenever unpause our seek happens
        }


		override protected function setItem(item:Item):void
		{
			super.setItem(item);
			_region.addEventListener(Event.RESIZE, resized, false, 0, true);
			_region.visible = false;
			_region.float = true;
			_region.scale = scale;
			sizeRegion();
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
		}

		protected function overlayAreaChanged(e:PlayerEvent):void
		{
			_overlayArea = e.data as Rectangle;
			sizeRegion();
		}

		protected function onFlashFullScreen(e:PlayerEvent):void
		{
			_isFullScreen = new Boolean(e.data);
			_region.scale = scale;
		}

		protected function get scale():uint
		{
			return (_isFullScreen) ? 2 : 1;
		}

		protected function resized(e:Event):void
		{
			resize();
		}

		protected function resize():void
		{
			sizeRegion();
		}

		protected function sizeRegion():void
		{
			_controller.getStage().addEventListener(Event.ENTER_FRAME, handleVisibility)

			_region.width = _overlayArea.width / scale;
			_region.height = _overlayArea.height / scale;
			_region.x = _overlayArea.x;
			_region.y = _overlayArea.y;


		}

		override public function destroy():void
		{
			if (_region)
			{
				_region.removeEventListener(Event.RESIZE, resized);
			}
			_controller.removeEventListener(PlayerEvent.OnFlashFullScreen, onFlashFullScreen);
			_controller.removeEventListener(PlayerEvent.OnOverlayAreaChanged, overlayAreaChanged);
            _controller.removeEventListener(PdkEvent.OnMediaUnpause, onMediaAction);
			_controller.removeEventListener(PdkEvent.OnMediaSeek, onMediaAction);
			super.destroy();
		}

		private var i:uint = 1;

		private function handleVisibility(e:Event):void
		{
			if (i > 0)
				i--;
			else
			{
				_controller.getStage().removeEventListener(Event.ENTER_FRAME, handleVisibility)
				_region.visible = true;
				i = 1;
			}
		}
	}
}
