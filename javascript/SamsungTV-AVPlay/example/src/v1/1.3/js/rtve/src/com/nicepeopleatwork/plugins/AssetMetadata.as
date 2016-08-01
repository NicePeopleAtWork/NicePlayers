package com.nicepeopleatwork.plugins
{
	import flash.display.Sprite;
	
	public class AssetMetadata extends Sprite
	{
		private var metadata:Object;
		
		public function AssetMetadata():void{}
		
		public function setProperties(properties:Object):void
		{
			metadata = properties;
		}
		
		public function getProperties():Object
		{
			return metadata;
		}
	}
}