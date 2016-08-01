package com.theplatform.pdk.views
{
	import com.theplatform.pdk.containers.SkinnedLayoutContainer;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.Release;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.events.RelatedItemInteractionEvent;
	import com.theplatform.pdk.utils.Positioning;

	import flash.display.Loader;
	import flash.events.Event;
	import flash.events.HTTPStatusEvent;
	import flash.events.IEventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.events.MouseEvent;
	import flash.events.ProgressEvent;
	import flash.events.SecurityErrorEvent;
	import flash.geom.Rectangle;
	import flash.net.URLRequest;
	import flash.sampler.Sample;
	import flash.system.LoaderContext;

	public class RelatedItemRenderer extends SkinnedLayoutContainer
	{
		public static const DEFAULT_THUMB_ASPECT_RATIO:Number = .75;
		public static const DEFAULT_THUMB_PADDING:Number = 10;

		private var _release:Release;
		private var _thumbLoader:Loader;
		private var _urlRequest:URLRequest;
		private var _currentFrameColor:String = "controlFrameColor";

		private var _thumbLoaded:Boolean = false;
		private var _thumbIOError:Boolean = false;
		private var _clipSkippable:Boolean = true;

		private var _isFullscreen:Boolean;


		public function RelatedItemRenderer(controller:IViewController, id:String, relase:Release)
		{
			super(controller, null);
			visible = false;
			autoMask = false;

			_release = relase;

			_isFullscreen = PlayerController(_controller).getFullScreenState();

			var currentClip:Clip = (PlayerController(_controller).getCurrentClip());

			if (currentClip && currentClip.noSkip)
			{
				_clipSkippable = false;
				alpha = .5;
				buttonMode = false;
				useHandCursor = false;
			}
			else
			{
				buttonMode = true;
				useHandCursor = true;
			}


			addEventListener(MouseEvent.CLICK, handleMouse);
			addEventListener(MouseEvent.ROLL_OVER, handleMouse);
			addEventListener(MouseEvent.ROLL_OUT, handleMouse);
			_controller.addEventListener(PdkEvent.OnShowFullScreen, handleOnShowFullscreen);

			percentHeight = 100;
			percentWidth = 100;
			verticalAlign = "middle";
			horizontalAlign = "center";

			if (!_release)
			{
				visible = false;
				return;
			}


			loadThumbnail();

		}

        override public function destroy():void
        {
            _controller.removeEventListener(PdkEvent.OnShowFullScreen, handleOnShowFullscreen);
            removeEventListener(MouseEvent.CLICK, handleMouse);
			removeEventListener(MouseEvent.ROLL_OVER, handleMouse);
			removeEventListener(MouseEvent.ROLL_OUT, handleMouse);

            super.destroy();
        }

		protected function handleMouse(e:MouseEvent):void
		{

			switch (e.type)
			{
				case MouseEvent.CLICK:

					if (_clipSkippable)
						dispatchEvent(new RelatedItemInteractionEvent(RelatedItemInteractionEvent.OnItemClick, _release, true, true));

					break;

				case MouseEvent.ROLL_OVER:

					if (_clipSkippable)
						_currentFrameColor = "controlHoverColor";

					validateLayout();
					
					dispatchEvent(new RelatedItemInteractionEvent(RelatedItemInteractionEvent.OnItemRollover, _release, true, true));

					addEventListener(MouseEvent.MOUSE_DOWN, handleMouse);
					addEventListener(MouseEvent.MOUSE_UP, handleMouse);

					break;

				case MouseEvent.ROLL_OUT:

					if (_clipSkippable)
					{
						_currentFrameColor = "controlFrameColor";
						validateLayout();
					}

					dispatchEvent(new RelatedItemInteractionEvent(RelatedItemInteractionEvent.OnItemRollout, _release, true, true));

					removeEventListener(MouseEvent.MOUSE_DOWN, handleMouse);
					removeEventListener(MouseEvent.MOUSE_UP, handleMouse);

					break;

				case MouseEvent.MOUSE_DOWN:

					if (_clipSkippable)
					{
						_currentFrameColor = "controlSelectedColor";
						validateLayout();
					}

					break;

				case MouseEvent.MOUSE_UP:

					if (_clipSkippable)
					{
						_currentFrameColor = "controlHoverColor";
						validateLayout();
					}

					break;
			}
		}


		override public function validateLayout():void
		{
			var scale:Number;

			if (_thumbLoader && _thumbLoaded && _thumbLoader.contentLoaderInfo)
			{
				scale = Positioning.getFitMaxScaleRatio(_thumbLoader.contentLoaderInfo.width, _thumbLoader.contentLoaderInfo.height, width - DEFAULT_THUMB_PADDING, height);
				_thumbLoader.scaleX = scale;
				_thumbLoader.scaleY = scale;

				if (!visible)
					visible = true;
			}
			else if (_thumbIOError)
			{
				var fakeThumbBounds:Rectangle = new Rectangle(0, 0, 1, 1);
				fakeThumbBounds.height = fakeThumbBounds.width * DEFAULT_THUMB_ASPECT_RATIO;

				scale = Positioning.getFitMaxScaleRatio(fakeThumbBounds.width, fakeThumbBounds.height, width - DEFAULT_THUMB_PADDING, height);

				fakeThumbBounds.width *= scale;
				fakeThumbBounds.height *= scale;
				fakeThumbBounds.x = (width / 2) - (fakeThumbBounds.width / 2);
				fakeThumbBounds.y = (height / 2) - (fakeThumbBounds.height / 2);

				// round to whole pixels.
				fakeThumbBounds.width = Math.round(fakeThumbBounds.width);
				fakeThumbBounds.height = Math.round(fakeThumbBounds.height);
				fakeThumbBounds.x = Math.round(fakeThumbBounds.x);
				fakeThumbBounds.y = Math.round(fakeThumbBounds.y);

				graphics.clear();
				graphics.beginFill(0x00FF00, 0);
				graphics.drawRect(0, 0, width, height);
				graphics.beginFill(Number(_controller.getProperty(_currentFrameColor)));
				graphics.drawRect(fakeThumbBounds.x - 1, fakeThumbBounds.y - 1, fakeThumbBounds.width + 2, fakeThumbBounds.height + 2);
				graphics.beginFill(Number(_controller.getProperty("backgroundColor")));
				graphics.drawRect(fakeThumbBounds.x, fakeThumbBounds.y, fakeThumbBounds.width, fakeThumbBounds.height);

				if (!visible)
					visible = true;
			}


			super.validateLayout();

			if (_thumbLoaded)
			{
				_thumbLoader.x = Math.round(_thumbLoader.x);
				_thumbLoader.y = Math.round(_thumbLoader.y);

				graphics.clear();
				graphics.beginFill(0xFF0000, 0);
				graphics.drawRect(0, 0, width, height);
				graphics.beginFill(Number(_controller.getProperty(_currentFrameColor)));
				graphics.drawRect(_thumbLoader.x - 1, _thumbLoader.y - 1, _thumbLoader.width + 2, _thumbLoader.height + 2);
				graphics.beginFill(Number(_controller.getProperty("backgroundColor")));
				graphics.drawRect(_thumbLoader.x, _thumbLoader.y, _thumbLoader.width, _thumbLoader.height);
			}
		}

		private function loadThumbnail():void
		{
			if (!_release.defaultThumbnailUrl)
			{
				_thumbIOError = true;
				validateLayout();
				return;
			}

			_thumbLoader = new Loader();
			_urlRequest = new URLRequest(_release.defaultThumbnailUrl);
			configureListeners(_thumbLoader.contentLoaderInfo);
            try
            {
                _thumbLoader.load(_urlRequest, new LoaderContext(true));
            }
            catch(e:Error)
            {
                if (_thumbLoaded)
				    _thumbLoaded = false;

                _thumbIOError = true;

                validateLayout();
            }
		}

		private function configureListeners(dispatcher:IEventDispatcher):void
		{
            //this has memory leak written all over it, if we're attaching listeners we need the ability to remove them
            //put in weak refs in hopes that will help
			dispatcher.addEventListener(Event.COMPLETE, completeHandler,false,0,true);
			dispatcher.addEventListener(SecurityErrorEvent.SECURITY_ERROR, handleSecurity,false,0,true);
			dispatcher.addEventListener(HTTPStatusEvent.HTTP_STATUS, httpStatusHandler,false,0,true);
			dispatcher.addEventListener(Event.INIT, initHandler,false,0,true);
			dispatcher.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler,false,0,true);
			dispatcher.addEventListener(Event.OPEN, openHandler,false,0,true);
			dispatcher.addEventListener(ProgressEvent.PROGRESS, progressHandler,false,0,true);
			dispatcher.addEventListener(Event.UNLOAD, unLoadHandler,false,0,true);
		}

		private function completeHandler(event:Event):void
		{
			//	trace("completeHandler: " + event);
			//	var scale:Number = Positioning.getFitMaxScaleRatio(_thumbLoader.width, _thumbLoader.height, width, height)

			//	var thumbScaleFactor:Number = width / _thumbLoader.contentLoaderInfo.width;

			//	_scaledThumbWidth = _thumbLoader.width * thumbScaleFactor;
			//	_scaledThumbHeight = _thumbLoader.height * thumbScaleFactor;
			_thumbLoaded = true;

			addChild(_thumbLoader);

		}

		private function handleSecurity(e:SecurityErrorEvent):void
		{
			//	trace(e.text);
		}

		private function httpStatusHandler(event:HTTPStatusEvent):void
		{
			//	trace("httpStatusHandler: " + event);
		}

		private function initHandler(event:Event):void
		{
			//	trace("initHandler: " + event);
		}

		private function ioErrorHandler(event:IOErrorEvent):void
		{
			//	trace("ioErrorHandler: " + event);

			if (_thumbLoaded)
				_thumbLoaded = false;

			_thumbIOError = true;

			validateLayout();
		}

		private function openHandler(event:Event):void
		{
			//	trace("openHandler: " + event);
		}

		private function progressHandler(event:ProgressEvent):void
		{
			//	trace("progressHandler: bytesLoaded=" + event.bytesLoaded + " bytesTotal=" + event.bytesTotal);
		}

		private function unLoadHandler(event:Event):void
		{
			//	trace("unLoadHandler: " + event);
		}

		private function handleOnShowFullscreen(e:PdkEvent):void
		{
			_isFullscreen = true;
			validateLayout();
		}


		private function drawChrome():void
		{

		}


	}
}
