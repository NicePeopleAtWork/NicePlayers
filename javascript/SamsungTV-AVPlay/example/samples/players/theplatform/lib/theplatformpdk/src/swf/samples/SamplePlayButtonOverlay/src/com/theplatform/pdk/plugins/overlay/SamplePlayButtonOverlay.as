package com.theplatform.pdk.plugins.overlay 
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.events.PlayerEvent;
	import com.theplatform.pdk.plugins.IPlugIn;
	
	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.events.DataEvent;
	import flash.events.MouseEvent;
	import flash.geom.Rectangle;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	import flash.text.TextFormat;

	public class SamplePlayButtonOverlay extends Sprite implements IPlugIn
	{
		private var _lo:LoadObject;
		private var _controller:IPlayerController;
		private var _playBtn:Sprite;
		private var _hideDefaultBtn:Sprite;
		private var _showDefaultBtn:Sprite;
		private var _isShowing:Boolean = false;
		private var _playerArea:Rectangle;
		private var useDefault:Boolean = false;
		
		public function SamplePlayButtonOverlay()
		{
		}

		public function initialize(lo:LoadObject):void
		{
			_lo = lo;
			_controller = _lo.controller as IPlayerController;
			_controller.addEventListener(PdkEvent.OnShowPlayOverlay, onShowPlayOverlay);
			_controller.addEventListener(PdkEvent.OnUseDefaultPlayOverlay, onUseDefaultPlayOverlay);
			_controller.addEventListener(PlayerEvent.OnMediaAreaChanged, areaChanged);
			
			_playBtn = createPlayButton(onClickPlayBtn);
			_showDefaultBtn = createTestButton("show default play button", onClickShowDefaultBtn);
			_hideDefaultBtn = createTestButton("hide default play button", onClickHideDefaultBtn);
			
			// tell player to hide its default play button
			_controller.useDefaultPlayOverlay(useDefault);
		
			// start out invisible. Let the onShowPlayOverlay event initiate showing the state.
			
			_controller.trace("initialized!", "SamplePBO");
		}

		//////////////////////////////////////////////////////////////
		// Button handlers		
		//////////////////////////////////////////////////////////////
		private function onClickShowDefaultBtn(e:MouseEvent):void { _controller.useDefaultPlayOverlay(true) }
		private function onClickHideDefaultBtn(e:MouseEvent):void { _controller.useDefaultPlayOverlay(false) }
		private function onClickPlayBtn(e:MouseEvent):void { _controller.clickPlayButton() }
		
		//////////////////////////////////////////////////////////////
		// PDK Event handlers		
		//////////////////////////////////////////////////////////////
		private function onShowPlayOverlay(e:PdkEvent):void
		{
			var showIt:Boolean = Boolean(e.data);
			_controller.trace("onShowPlayOverlay RECEIVED! showIt=[" + showIt + "] useDefault=[" + useDefault + "]", "PlayOverlay");
			
			_isShowing = showIt;
			setViewState();
		}
		
		private function areaChanged(e:PlayerEvent):void
		{
			var playerArea:Rectangle = e.data as Rectangle;
			_playBtn.x = playerArea.width/2 - _playBtn.width/2;
			_playBtn.y = playerArea.height/2 - _playBtn.height/2;			
		}
		
		private function onUseDefaultPlayOverlay(e:PdkEvent):void
		{
			useDefault = Boolean(e.data);
			_controller.trace("onUseDefaultPlayOverlay RECEIVED! useDefault=" + useDefault, "PlayOverlay");
			if (_isShowing)
				setViewState();
		}
		
		
		//////////////////////////////////////////////////////////////
		// Create UI Elements		
		//////////////////////////////////////////////////////////////
		
		private function createPlayButton(fn:Function):Sprite
		{
			var myButton:Sprite = new Sprite();
			
			var triangle:Shape = new Shape();
			triangle.graphics.lineStyle(2, 0xFFFF00);
			triangle.graphics.beginFill(0x000000, 1);
			
			triangle.graphics.lineTo(100, 60);
			triangle.graphics.lineTo(0, 120);
			triangle.graphics.lineTo(0, 0);
			triangle.graphics.endFill();
			
			myButton.addChild(triangle); 
			myButton.buttonMode = true;
			myButton.addEventListener(MouseEvent.CLICK, fn)
			return myButton;
		}

		private function createTestButton(buttonLabel:String,fn:Function):Sprite
		{
			var myButton:Sprite = new Sprite();
			
			var txt:TextField = new TextField();
			txt.text = buttonLabel;
			txt.autoSize = TextFieldAutoSize.LEFT;
			txt.mouseEnabled = false;
			txt.x = 10;
			txt.y = 10;
			
			// format the text...
			var fmt:TextFormat;
			fmt = new TextFormat('Verdana');
			fmt.size = 10;
			fmt.color = 0xFFFFFF;
			txt.setTextFormat(fmt);

			// create button background...
			var bkgnd:Shape = new Shape();
			bkgnd.graphics.beginFill(0x444444);
			bkgnd.graphics.lineStyle(1,0xFFFFFF);
			
			bkgnd.graphics.drawRect(0, 0, txt.textWidth+20, txt.textHeight+20);
			bkgnd.graphics.endFill();
			
			myButton.addChild(bkgnd);
			myButton.addChild(txt);
			
			myButton.buttonMode = true;
			myButton.addEventListener(MouseEvent.CLICK, fn)
			return myButton;
		}

		//////////////////////////////////////////////////////////////
		// View-states		
		//////////////////////////////////////////////////////////////
		
		private function setViewState():void
		{
			if (_isShowing)
			{
				if (useDefault)
				{
					// player will show the default play button
					while (numChildren)
						removeChildAt(0);
					addChildAt(_hideDefaultBtn,0); 
				}
				else
				{
					// player will show the custom play button
					while (numChildren)
						removeChildAt(0);
					addChildAt(_showDefaultBtn,0); 
					addChildAt(_playBtn,1); 
				}
			}
			else // remove everything
			{
				while (numChildren)
					removeChildAt(0);
			}
		}
	}
	
}
