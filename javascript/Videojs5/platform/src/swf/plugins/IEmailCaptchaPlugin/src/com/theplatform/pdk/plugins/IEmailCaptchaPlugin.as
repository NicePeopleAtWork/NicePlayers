package com.theplatform.pdk.plugins
{
	import com.theplatform.pdk.containers.ComponentArea;
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.controls.ButtonControl;
	import com.theplatform.pdk.controls.Control;
	import com.theplatform.pdk.controls.ImageControl;
	import com.theplatform.pdk.controls.TextAreaControl;
	import com.theplatform.pdk.data.CardPriority;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.mediators.EmailCaptchaCardMediator;
	import com.theplatform.pdk.mediators.EmailCaptchaEndCardMediator;
	import com.theplatform.pdk.mediators.EmailCaptchaImageMediator;
	import com.theplatform.pdk.mediators.EmailCaptchaMessageMediator;
	import com.theplatform.pdk.mediators.EmailCaptchaSendMediator;
	import com.theplatform.pdk.mediators.EmailCaptchaSendToMediator;
	import com.theplatform.pdk.mediators.EmailCaptchaSenderMediator;
	import com.theplatform.pdk.mediators.EmailCaptchaTextEntryMediator;
	import com.theplatform.pdk.mediators.Mediator;
	import com.theplatform.pdk.metadata.ItemMetaData;
	
	import flash.display.Loader;
	import flash.display.Sprite;
	import flash.events.*;

	public class IEmailCaptchaPlugin extends Sprite implements IControlPlugIn
	{
		protected var _pController:IPlayerController;

		private var _imgUrl:String;
		private var _imgLoader:Loader

		public function IEmailCaptchaPlugin()
		{
		}

		public function initialize(lo:LoadObject):void
		{
			_pController = lo.controller as IPlayerController;
			_pController.registerControlPlugIn(this, lo.priority);

			var emailCard:XML = <card id="tpEmailCard" parentCardId="tpExcerptCard" height="100%" paddingRight="0" paddingTop="0"  verticalGap="10" verticalAlign="top">

					<control id="tpEmailSendTo" skin="TextAreaSkin" hint="To: (enter email address, separated by commas)" input="true" />					
					<control id="tpEmailSender" skin="TextAreaSkin" hint="From:" input="true" />
					<control id="tpEmailMessage" skin="TextAreaSkin" hint="Message:" paddingTop="5" input="true" multiline="true"  showScrollBar="auto"/>
					<control id="CaptchaImage" height="40"/>													
					<control id="CaptchaTextEntry" skin="TextAreaSkin" hint="Enter the word as you see it above" input="true" />
					<container direction="horizontal" skin="none" horizontalAlign="right" width="100%" horizontalGap="4">
						<control id="tpEmailSend" label="Send" />
						<control id="tpEmailCancel" label="Cancel"/>
					</container>

				</card>;
			_pController.addCard("forms", "tpEmailCard", emailCard, CardPriority.CUSTOM);

			var emailEndCard:XML = <card id="tpEmailEndCard" parentCardId="tpHeaderCard" height="100%" paddingTop="6" paddingRight="4" paddingBottom="6"  verticalGap="4" paddingLeft="4" >
					<container horizontalAlign="center" width="100%">
						<label text="Thanks for sharing this video!" textStyle="PlayerFormLabelFont" />
					</container>
				</card>;
			_pController.addCard("forms", "tpEmailEndCard", emailEndCard, CardPriority.CUSTOM);

		}

		public function getControlIds():Array
		{
			return ["CaptchaImage", "CaptchaTextEntry", "CaptchaSendButton", "CIMEmailCaptchaCard"];
		}

		public function getControlMediator(metadata:ItemMetaData):Mediator
		{
			var m:Mediator;

			switch (metadata.id)
			{
				case ("tpEmailCard"):
					m = new EmailCaptchaCardMediator(metadata.id, _pController, metadata, null);
					break;

				case ("tpEmailEndCard"):
					m = new EmailCaptchaEndCardMediator(metadata.id, _pController, metadata, null);
					break;

				case ("tpEmailSendTo"):
					m = new EmailCaptchaSendToMediator(metadata.id, _pController, metadata, null);
					break;

				case ("tpEmailSender"):
					m = new EmailCaptchaSenderMediator(metadata.id, _pController, metadata, null);
					break;
				case ("tpEmailMessage"):
					m = new EmailCaptchaMessageMediator(metadata.id, _pController, metadata, null);
					break;
				case ("CaptchaImage"):
					m = new EmailCaptchaImageMediator(metadata.id, _pController, metadata, null);
					break;

				case ("CaptchaTextEntry"):
					m = new EmailCaptchaTextEntryMediator(metadata.id, _pController, metadata, null);
					break;

				case ("tpEmailSend"):
					m = new EmailCaptchaSendMediator(metadata.id, _pController, metadata, null);
					break;
			}

			return m;
		}

		public function getControl(metadata:ItemMetaData):Control
		{
			var c:Control;
			switch (metadata.id)
			{

				case ("CaptchaImage"):
					c = new ImageControl(metadata.id, metadata, _pController);
					break;
				case ("CaptchaTextEntry"):
					c = new TextAreaControl(metadata.id, metadata, _pController);
					break;
				case ("CaptchaSendButton"):
					c = new ButtonControl(metadata.id, metadata, _pController);
					break;

			}
			return c;
		}

		public function finalize(componentArea:ComponentArea):void
		{
		}

		public function getCaptchaImageUrl():String
		{
			return _imgUrl;
		}

	}
}
