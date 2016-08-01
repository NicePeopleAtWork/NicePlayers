package com.theplatform.pdk.plugins.ad
{
	public class InStreamUtils
	{
		public static function updateSize(url:String, newSize:String, newTag:String = null):String
		{
			// replace any "pfadx" tag with the new tag
			if (newTag != null)
			{
				url = url.split("pfadx").join(newTag);
			}
			var components:Array = url.split(";");
			for (var i:Number = 0; i < components.length; i++)
			{
				if (components[i].indexOf("sz=") == 0)
				{
					components[i] = "sz=" + newSize;
					break;
				}
			}
			return components.join(";");
		}
	}
}