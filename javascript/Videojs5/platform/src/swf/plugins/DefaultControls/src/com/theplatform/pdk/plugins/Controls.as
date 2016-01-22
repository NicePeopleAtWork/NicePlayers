/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins 
{
	import com.theplatform.pdk.containers.*;
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.*;
	import com.theplatform.pdk.data.*;
	import com.theplatform.pdk.mediators.*;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.utils.PdkStringUtils;
	
	import flash.display.Sprite;
	import flash.external.*;

	public class Controls extends Sprite implements IControlPlugIn, IDestroyablePlugIn
	{
		private var _controller:IViewController;
		private var _pcontroller:IPlayerController;
		
		public function Controls()
		{
			
		}

		///Interface Functions //////
		/////////////////////////////
		
		public function initialize(lo:LoadObject):void
		{	
			_controller = lo.controller as IViewController;
			_pcontroller = _controller as IPlayerController;
			
			//setControlStyles();
			
			_controller.registerControlPlugIn(this, lo.priority);
		}

        public function destroy():void
        {
              //here we need to kill anything we've created..(which may be nothing?)
            
        }

		public function getControlIds():Array
		{
			
			var arr:Array = new Array();
			arr.push("tpPlay");
			arr.push("tpLive");
			arr.push("tpMute");
			arr.push("tpVolumeSlider");
			arr.push("tpVolume");
			arr.push("tpPrevious");
			arr.push("tpNext");
			arr.push("tpScrubber");
			arr.push("tpCurrentTime");
			arr.push("tpStartTime");
			arr.push("tpTimeDivider");
			arr.push("tpTotalTime");
			arr.push("tpRemainingTime");
			arr.push("tpCC");
			arr.push("tpFullScreen");
			arr.push("tpAdCountdown");
			arr.push("tpBandwidth");
			return arr;
		}
		
		public function getControl(metadata:ItemMetaData):Control
		{
			var c:Control;
			switch (metadata.id)
			{
				//buttons
				case "tpPrevious":
				case "tpNext":  
					if (_controller.getProperty("showNav") == "false") return null;
				case "tpButton":
					if (!PdkStringUtils.isExternalInterfaceAvailable()) return null;
				case "tpPlay":
				case "tpMute":
				case "tpLive":
					c = new ButtonControl(metadata.id, metadata, _controller);
					break;
				case "tpBandwidth":
					if(_controller.getProperty("allowBandwidth") == "false") return null;
					var mode:String = metadata.display["mode"];					
					if (mode && mode == "advanced")
					{
						c = new ExpandingBandwidthControl(metadata.id, metadata, _controller);
					}
					else
					{
						c = new ButtonControl(metadata.id, metadata, _controller);
					}
					break;
				case "tpFullScreen":
					c = new ButtonControl(metadata.id, metadata, _controller);
					break;
				
				case "tpVolume":
					c = new ExpandingMuteVolumeControl(metadata.id, metadata, _controller);
					break;
 				case "tpVolumeSlider":
					c = new VolumeControl(metadata.id, metadata, _controller);
					break;
					
				//scrubber
				case "tpScrubber": 
					c = new ScrubberControl(metadata.id, metadata, _controller);;
					break;
					
				//text controls
				case "tpTimeDivider":
					if (!metadata.display.text)
						metadata.display.text = "/";
				case "tpTotalTime":
				case "tpRemainingTime":
					if (_controller.getProperty("showFullTime") == "false")	return null;
				case "tpStartTime": 
				case "tpCurrentTime": 
					c = new TextControl(metadata.id, metadata, _controller);
					break;
				case "tpTitle": 
					if (_controller.getProperty("showTitle") != "false")
					{
						c = new TextAreaControl(metadata.id, metadata, _controller);
					}
					break;
				case "tpAdCountdown":
					if (_controller.getProperty("showAdCountdown") != "false")
					{ 
						//c = new TextControl(metadata.id, metadata, _controller);
						c = new TextAreaControl(metadata.id, metadata, _controller);
					}
					break;
					
				//cc		
				case "tpCC": 
					c = new ExpandingCCControl(metadata.id, metadata, _controller);
					break;
			}
			return c;
		}
		public function getControlMediator(metadata:ItemMetaData):Mediator
		{	
			var m:Mediator;
			switch (metadata.id)
			{
				case "tpPlay":
					m = new DefaultPlayPauseMediator(metadata.id, _pcontroller, metadata);
					break;
				case "tpLive":
					m = new DefaultLiveMediator(metadata.id, _pcontroller, metadata);
					break;
				case "tpMute":
					m = new DefaultMuteMediator(metadata.id, _pcontroller, metadata);
					break;
				case "tpButton":
					if (!PdkStringUtils.isExternalInterfaceAvailable()) return null;
					m = new DefaultButtonMediator(metadata.id, _pcontroller, metadata);
					break;
				case "tpVolume":
					m = new DefaultExpandingMuteVolumeMediator(metadata.id, _pcontroller, metadata);
					break;
				case "tpVolumeSlider":
					m = new DefaultVolumeSliderMediator(metadata.id, _pcontroller, metadata);
					break;
				case "tpPrevious": 
					if (_controller.getProperty("showNav") == "false") return null;
					m = new DefaultPreviousMediator(metadata.id, _pcontroller, metadata);
					break;
				case "tpNext": 
					if (_controller.getProperty("showNav") == "false") return null;
					m = new DefaultNextMediator(metadata.id, _pcontroller, metadata);
					break;
				case "tpScrubber": 
					m = new DefaultScrubberMediator(metadata.id, _pcontroller,  metadata);
					break;
				case "tpCurrentTime": 
					if (_controller.getProperty("showFullTime") == "false")
						m = new DefaultRemainingTimeMediator(metadata.id, _pcontroller,  metadata);
					else 
						m = new DefaultCurrentTimeMediator(metadata.id, _pcontroller,  metadata);
					break;
				case "tpStartTime": 
					m = new DefaultStartTimeMediator(metadata.id, _pcontroller,  metadata);
					break;
				case "tpTimeDivider":
					if (_pcontroller.getProperty("showFullTime") == "false") return null; 
					m = new DefaultTextMediator(metadata.id, _pcontroller,  metadata);
					break;
				case "tpTotalTime":
					if (_pcontroller.getProperty("showFullTime") == "false") return null; 
					m = new DefaultTotalTimeMediator(metadata.id, _pcontroller,  metadata);
					break;		
				case "tpRemainingTime": 
					m = new DefaultRemainingTimeMediator(metadata.id, _pcontroller,  metadata);
					break;
				case "tpCC": 
					m = new DefaultCCMediator(metadata.id, _pcontroller,  metadata);
					break;
				case "tpFullScreen": 
					m = new DefaultFullScreenMediator(metadata.id, _pcontroller,  metadata);
					break;
				case "tpTitle":
					if (_controller.getProperty("showTitle") != "false")
					{
						m = new DefaultTitleMediator(metadata.id, _pcontroller,  metadata);
					} 
					break;
				case "tpAdCountdown":
					if (_controller.getProperty("showAdCountdown") != "false")
					{		 
						m = new DefaultAdCountdownMediator(metadata.id, _pcontroller,  metadata);
					}
					break;	
				case "tpTitleRegion":
					if (_controller.getProperty("showTitle") != "false")
					{
						m = new TitleRegionMediator(metadata.id, _pcontroller, metadata);
					}
					break;
				case "tpTitleContainer":
					if (_controller.getProperty("showTitle") != "false")
					{
						m = new TitleContainerMediator(metadata.id, _pcontroller, metadata);
					}
					break;
				case "tpAdCountdownRegion":
					if (_controller.getProperty("showAdCountdown") != "false")
					{
						m = new AdCountdownRegionMediator(metadata.id, _pcontroller, metadata);
					}
					break;
				case "tpAdCountdownContainer":
					if (_controller.getProperty("showAdCountdown") != "false")
					{
						m = new AdCountdownContainerMediator(metadata.id, _pcontroller, metadata);
					}
					break;
				case "defaultcontrols":
				case "tpNormalControls":
					m = new NormalControlsMediator(metadata.id, _pcontroller, metadata);
					break;
				case "tpFullScreenControls":
					m = new FullScreenControlsMediator(metadata.id, _pcontroller, metadata);
					break;
				case "tpAdvertisementControls":
					m = new AdvertisementControlsMediator(metadata.id, _pcontroller, metadata);
					break;
				case "tpFullScreenAdvertisementControls":
					m = new FullScreenAdvertisementControlsMediator(metadata.id, _pcontroller, metadata);
					break;
				case "tpPreviewControls":
					m = new PreviewControlsMediator(metadata.id, _pcontroller, metadata);
					break;
				case "tpBandwidth":
					if(_controller.getProperty("allowBandwidth") == "false") return null;
					var mode:String = metadata.display["mode"];
					if (mode && mode == "advanced")
					{
						m = new ExpandingBandwidthMediator(metadata.id, _pcontroller, metadata);
					}
					else
					{
						m = new DefaultBandwidthMediator(metadata.id, _pcontroller, metadata);
					}
					break;
				case "tpBottomRegion":
					m = new BottomRegionMediator(metadata.id, _controller, metadata);
					break;
				case "tpVideoRegion"://not calling tpVideoRegionMediator any more
				case "tpBottomFloatRegion":
					m = new BottomFloatRegionMediator(metadata.id, _controller, metadata);
					break;
				case "tpLeftRegion":
					m = new LeftRegionMediator(metadata.id, _controller, metadata);
					break;
				case "tpLeftFloatRegion":
					m = new LeftFloatRegionMediator(metadata.id, _controller, metadata);
					break;
				case "tpTopRegion":
					m = new TopRegionMediator(metadata.id, _controller, metadata);
					break;
				case "tpTopFloatRegion":
					m = new TopFloatRegionMediator(metadata.id, _controller, metadata);
					break;
				case "tpRightRegion":
					m = new RightRegionMediator(metadata.id, _controller, metadata);
					break;
				case "tpRightFloatRegion":
					m = new RightFloatRegionMediator(metadata.id, _controller, metadata);
					break;
				case "tpMobileVideoTopRegion":
					m = new MobileVideoTopRegionMediator(metadata.id, _controller, metadata);
					break;
				case "tpMobileVideoBottomRegion":
					m = new MobileVideoBottomRegionMediator(metadata.id, _controller, metadata);
					break;
				
			}
			return m;
		}
		public function finalize(component:ComponentArea):void
		{
			var pa:PlayerArea = component as PlayerArea;//since this is a plugin designed for players, we can 
			
			if (pa)//the controls are the only card that uses playerArea right now, so it won't cast for the other componentAreas
			{
				if (_controller.getProperty("showTitle") == "false" && pa.getItemById("tpTitleContainer"))//they don't want the title, clean up if it has been added
				{
					pa.removeItemById("tpTitleContainer");//this is so it won't be skinned
				}
				
				if (_controller.getProperty("showAdCountdown") == "false" && pa.getItemById("tpAdCountdownContainer"))
				{
					pa.removeItemById("tpAdCountdownContainer");
				}
				// not sure if this is needed				
				if (_controller.getProperty("allowBandwidth") == "false" && pa.getItemById("tpBandwidth"))
				{
					pa.removeItemById("tpBandwidth");
				}
			}
		}
		
		
		/* 
		private function setControlStyles():void
		{
			var regionStyle:IStyleObject = _controller.getStyleObject(null, CommonItemTypes.REGION, 0);
			setItemDefaults(regionStyle);
			setContainerDefaults(regionStyle);
			regionStyle.setProperty(RegionProperties.alpha, 100);
			regionStyle.setProperty(RegionProperties.autoHide, false);
			regionStyle.setProperty(RegionProperties.autoHideDelay, 5000);
			regionStyle.setProperty(RegionProperties.float, false);
			regionStyle.setProperty(RegionProperties.hidden, false);
			regionStyle.setProperty(RegionProperties.initialHideDelay, 0);
			regionStyle.setProperty(RegionProperties.regionType, RegionType.TYPE_BOTTOM);
			regionStyle.setProperty(RegionProperties.scale, 1);
			
			var spacerStyle:IStyleObject = _controller.getStyleObject(null, CommonItemTypes.SPACER, 0);
			setItemDefaults(spacerStyle);
			spacerStyle.setProperty(SpacerProperties.percentHeight, 100);
			spacerStyle.setProperty(SpacerProperties.percentWidth, 100);
			
			var containerStyle:IStyleObject = _controller.getStyleObject(null, CommonItemTypes.CONTAINER, 0);
			setItemDefaults(containerStyle);
			setContainerDefaults(containerStyle);
			
		}
		
		private function setItemDefaults(style:IStyleObject):void
		{
			style.setProperty(ItemProperties.enabled, true);
			style.setProperty(ItemProperties.x, 0);
			style.setProperty(ItemProperties.y, 0);
			style.setProperty(ItemProperties.height, NaN);
			style.setProperty(ItemProperties.width, NaN);
		}
		
		private function setContainerDefaults(style:IStyleObject):void
		{
			style.setProperty(ContainerProperties.direction, ContainerDirection.HORIZONTAL);
			style.setProperty(ContainerProperties.horizontalAlign, HorizontalAlign.LEFT);
			style.setProperty(ContainerProperties.horizontalGap, NaN);
			style.setProperty(ContainerProperties.padding, NaN);
			style.setProperty(ContainerProperties.paddingBottom, NaN);
			style.setProperty(ContainerProperties.paddingTop, NaN);
			style.setProperty(ContainerProperties.paddingLeft, NaN);
			style.setProperty(ContainerProperties.paddingRight, NaN);
			style.setProperty(ContainerProperties.percentHeight, NaN);
			style.setProperty(ContainerProperties.percentWidth, NaN);
			style.setProperty(ContainerProperties.percentHeight, NaN);
			style.setProperty(ContainerProperties.verticalAlign, VerticalAlign.TOP);
			style.setProperty(ContainerProperties.verticalGap, NaN);
		}
		 */
				
	}
}
