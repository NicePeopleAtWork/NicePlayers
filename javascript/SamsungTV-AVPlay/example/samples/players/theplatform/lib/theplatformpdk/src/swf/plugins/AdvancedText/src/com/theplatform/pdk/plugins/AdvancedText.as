package com.theplatform.pdk.plugins 
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.AdvancedTextDisplayObject;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.factories.AdvancedTextFactory;
	import com.theplatform.pdk.factories.AdvancedTextFactoryInstance;
	import com.theplatform.pdk.views.ITextDisplayObject;
	
	import flash.display.Sprite;

	public class AdvancedText extends Sprite implements ITextPlugIn
	{
		private var _controller:IViewController;

        private var _preferredFonts:Array;
        private var _fontEnlarge:Number;
		
		public function AdvancedText()
		{
		}
		
		public function initialize(lo:LoadObject):void
		{
			_controller = lo.controller as IViewController;

            var fonts:String = lo.vars['preferredFonts'];
            if (fonts&&fonts.length)
            _preferredFonts = fonts.split(",");

            _fontEnlarge = Number(lo.vars['fontEnlarge']);

			_controller.registerTextPlugIn(this, lo.priority);
		}
		
		public function getTextDisplayObject(textFieldId:String):ITextDisplayObject
		{
			return new AdvancedTextDisplayObject(_controller, textFieldId, _preferredFonts, _fontEnlarge);
		}
	}
}
