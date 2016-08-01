package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.ImageControl;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.functions.CaptchaFunctions;
	import com.theplatform.pdk.mediators.ControlMediator;
	import com.theplatform.pdk.metadata.ItemMetaData;

	import flash.display.Sprite;

	public class EmailCaptchaImageMediator extends ControlMediator
	{
		private var _imgControl:ImageControl;

		public function EmailCaptchaImageMediator(id:String, controller:IViewController, metadata:ItemMetaData, resources:Object)
		{
			super(id, controller, metadata, resources);
		}

		protected override function setItem(item:Item):void
		{
			_imgControl = item as ImageControl;
			super.setItem(item);
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
			card.registerFunction(CaptchaFunctions.addCaptchaImage, this, setCaptchaImageUrl);
		}

		protected function setCaptchaImageUrl(url:String):void
		{
			trace("captchaUrl: " + url);
			_imgControl.image = url;
		}
	}
}