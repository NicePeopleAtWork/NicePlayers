/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins.datasystem
{
	import flash.display.DisplayObject;
	import flash.display.Sprite;

	import com.theplatform.pdk.plugins.ad.IFlashAsset;
	
	public class FlashAssetWrapper extends Sprite
	{
		private var _flashAsset:IFlashAsset;
		private var _assetHolder:Sprite;
		
		public function FlashAssetWrapper(fa:IFlashAsset,assetHolder:Sprite)
		{
			_flashAsset = fa;
			_assetHolder = assetHolder;
			addChild(_assetHolder);
		}
		override public function set x(i:Number):void {	_flashAsset.x = i }
		override public function set y(i:Number):void { _flashAsset.y = i }
		override public function get x():Number 	  {	return _flashAsset.x }
		override public function get y():Number		  {	return _flashAsset.y }
		override public function get width():Number   {	return _flashAsset.getWidth() }
		override public function get height():Number  {	return _flashAsset.getHeight() }
		override public function set visible(b:Boolean):void 
		{
			_assetHolder.visible = b;
		}
		override public function get visible():Boolean 
		{
			return _assetHolder.visible;
		}
	}
}
