package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.containers.ComponentArea;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.controls.IconType;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.functions.CaptchaFunctions;
	import com.theplatform.pdk.functions.EmailFormFunctions;
	import com.theplatform.pdk.functions.HeaderFunctions;
	import com.theplatform.pdk.mediators.EmailCardMediator;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.utils.Debug;

	import flash.errors.IllegalOperationError;
	import flash.events.ErrorEvent;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
import flash.events.SecurityErrorEvent;
import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	import flash.utils.Dictionary;

	public class EmailCaptchaCardMediator extends EmailCardMediator
	{
		private var _imgUrl:String;
		private var _encryptedCaptcha:String;
		private var _toCount:Number;
		private var _domain:String;

		public function EmailCaptchaCardMediator(id:String, controller:IViewController, metadata:ItemMetaData = null, resources:Object = null)
		{
			super(id, controller, metadata, resources);
		}

		override protected function setItem(item:Item):void
		{
			super.setItem(item);
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
		}

		override protected function cardCreated(componentArea:ComponentArea):void
		{
			super.cardCreated(componentArea);
			card.registerFunction(CaptchaFunctions.submit, this, submit);
			requestImageUrl();
		}

		protected function requestImageUrl():void
		{
			var captchaUrl:String = "http://" + _domain + "/user/authkey/overlays/email/captcha/" + new Date().getTime() + "/?a=true";

			var imgReq:URLRequest = new URLRequest(captchaUrl);
			var urlLoader:URLLoader = new URLLoader();
			urlLoader.addEventListener(Event.COMPLETE, sourceHandler);
            urlLoader.addEventListener(IOErrorEvent.IO_ERROR, errorHandler, false, 0, true);
            urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, errorHandler, false, 0, true);
            try
            {
                urlLoader.load(imgReq);
            } catch (e:Error) { errorHandler(e);}

		}

		private function sourceHandler(e:Object):void
		{
			var urlLoader:URLLoader = e.target as URLLoader;
			urlLoader.removeEventListener(Event.COMPLETE, sourceHandler);
			var src:String = getSourceUrl(String(urlLoader.data));
			if (src)
				loadImage(src)
		}

        private function errorHandler(e:Error):void
        {
            _controller.trace(e.toString(), "EmailCaptchaCardMediator", Debug.WARN);
        }

		protected function getSourceUrl(data:String):String
		{
			var validXML:String = "<xml>" + data + "</xml>";
			var xhtml:XML = new XML(validXML);
			var src:String = xhtml.img.@src;
			_encryptedCaptcha = xhtml.input.@value;
			if (src.length > 0)
				return src;
			else
				return null
		}

		private function loadImage(src:String):void
		{
			if (!card.isActive)
				return
					// meed to add .jpg to the url to get the control to load the image
					card.call(CaptchaFunctions.addCaptchaImage, ["http://" + _domain + "/" + src + "&v=.jpg"]);
		}

		override protected function deckCreated():void
		{
			super.deckCreated();
			if (card.parent && card.parent.id != "tpShareCard")
			{
				card.call(HeaderFunctions.setHeaderIcon, [IconType.IMAGE_MAIL]);
				card.call(HeaderFunctions.setHeaderTitle, ["EmailCaptcha"]);
			}
		}

		override protected function cardDestroyed(card:Card):void
		{
			super.cardDestroyed(card);
			card.unRegisterFunction(CaptchaFunctions.submit);
		}

		public function submit():void
		{
			//This is technically the way we should handle this.
			//however, the submitForm returns an event that doesn't
			//allow me to reference the returned xml from the server. 
			//there's probably a way around it, but in interest of speed, 
			//I'm using the classic urlRequest
			/*
			   var pController:PlayerController=_controller as PlayerController;

			   var emailServiceURL:String;

			   if (DOMAIN.substr(0, 4) == "http")
			   {
			   emailServiceURL=DOMAIN + "/user/authkey/service/emailavideo/";
			   }
			   else
			   {
			   emailServiceURL="http://" + DOMAIN + "/user/authkey/service/emailavideo/";
			   }

			   var fields:Dictionary=new Dictionary();

			   fields["from"]=card.call(EmailFormFunctions.getEmailSender, []);
			   fields["to"]=card.call(EmailFormFunctions.getEmailSendTo, []);
			   fields["message"]=card.call(EmailFormFunctions.getEmailMessage, []);
			   fields["captchaAttempt"]=card.call(CaptchaFunctions.getCaptchaText, []);
			   fields["playerUrl"]=getLinkText();
			   fields["releaseTitle"]=currentClip.title;
			   fields["subject"]="You have been sent a video!";


			   _toCount = String(fields["to"]).split(/[ ,;]/).length;

			   if (!checkErrors(fields["from"], fields["to"]))
			   {
			   _pController.submitForm(this.id, emailServiceURL, fields, URLRequestMethod.GET, emailResponseHandler, emailIOErrorHandler);
			   }

			 */

			var from:String = card.call(EmailFormFunctions.getEmailSender, []);
			var to:String = card.call(EmailFormFunctions.getEmailSendTo, []);
			var message:String = escape(card.call(EmailFormFunctions.getEmailMessage, []));
			var captchaAttempt:String = card.call(CaptchaFunctions.getCaptchaText, []);
			var playerUrl:String = getLinkText();
			var releaseTitle:String = escape(currentClip.title);
			//var releaseDescription:String = BaseClip(currentClip.baseClip).description;
			var subject:String = escape("You have been sent a video!");

			_toCount = to.split(/[ ,;]/).length;

			var urlStr:String = "http://" + _domain + "/user/authkey/service/emailavideo/?toAddresses=" + to + "&fromAddress=" + from + "&emailthisMessage=" + message + "&captchaResponse=" + captchaAttempt + "&encryptedCaptcha=" + _encryptedCaptcha + "&emailthisUrl=" + playerUrl + "&exec=" + "true" + "&copyMe=" + "false" + "&fmt=" + "xml" + "&emailthisTitle=" + releaseTitle + "&subject=" + subject;
			//trace("url: " + urlStr);

			var mailReq:URLRequest = new URLRequest(urlStr);

			if (!checkErrors(from, to))
			{
				var urlLoader:URLLoader = new URLLoader();
				urlLoader.addEventListener(Event.COMPLETE, emailResponseHandler);
				urlLoader.addEventListener(IOErrorEvent.IO_ERROR, emailIOErrorHandler);
				urlLoader.load(mailReq);
			}

		}

		private function checkErrors(sender:String, sendTo:String):Boolean
		{
			var error:Boolean = false; //disprove
			var emailExpression:RegExp = /^([A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,4}[ ,;]*)+$/i;

			if (!emailExpression.test(sender))
			{
				error = true;
				card.call(EmailFormFunctions.emailSenderAlert, [true]);
			}
			else
			{
				card.call(EmailFormFunctions.emailSenderAlert, [false]);
			}
			if (!emailExpression.test(sendTo))
			{
				error = true;
				card.call(EmailFormFunctions.emailSendToAlert, [true]);
			}
			else
			{
				card.call(EmailFormFunctions.emailSendToAlert, [false]);

			}
			return error;
		}

		private function emailIOErrorHandler(evt:ErrorEvent):void
		{
			showThankYou(true);
			_controller.trace("*** email error: " + evt.toString(), "EmailForm", Debug.ERROR)
		}

		private function emailResponseHandler(e:Event):void
		{
			//handle success
			var urlLoader:URLLoader = e.target as URLLoader;
			var data:String = urlLoader.data;
			var responseXML:XML = new XML(data);
			var errStr:String = responseXML..error;
			trace(responseXML);
			trace("error string: " + errStr);
			if (errStr.length > 0)
			{
				card.call(CaptchaFunctions.addErrorMessage, [errStr]);
			}
			else
			{
				showThankYou(true);
			}
		}

		private function showThankYou(isShown:Boolean):void
		{
			var evt:PdkEvent = new PdkEvent(PdkEvent.OnEmail, {recipientCount: _toCount, excerpt: _excerpt, clip: currentClip});
			_controller.dispatchEvent(evt);
			//_controller.showEmailForm(false);
			_controller.showCard("forms", "tpEmailEndCard");
		}
	}
}