package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.containers.ComponentArea;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.controls.IconType;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.data.NoCardFunctionError;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.functions.EmailFormFunctions;
	import com.theplatform.pdk.functions.HeaderFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.utils.Debug;
	import com.theplatform.pdk.utils.PdkStringUtils;

import flash.events.ErrorEvent;
import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.geom.Rectangle;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.getClassByAlias;
	import flash.utils.Dictionary;
	import flash.utils.getTimer;

	public class EmailCardMediator extends ExcerptableFormCardMediator
	{
		private var _componentArea:ComponentArea;
		private var toCount:Number;
		
		public function EmailCardMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
			if (!_title) _title = "Email";
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
			_componentArea = componentArea;
			super.cardCreated(componentArea);
			
			card.registerFunction(EmailFormFunctions.cancelEmail, this, cancelEmail);
			card.registerFunction(EmailFormFunctions.submitEmail, this, submitEmail);
		
			// alter the layout of the card if it is not at the root of the dom
			//TO DO: we'll need to figure out a better way of checking if part of the excerptForm, but for now, we'll hard code it.
			if(card.parent && (card.parent.id == "tpExcerptCard" || (card.parent.parent && card.parent.parent.id == "tpExcerptCard")))  
		 	{
				var ca:ComponentArea =  componentArea;
				if(ca) 
				{
					ca.paddingLeft = 0;
					ca.paddingRight = 0;
					ca.paddingTop = 0;
					ca.paddingBottom = 0;
				}
			}  
			
		}
		
		//all the cards have been created, don't call registered functions on the card until this has happened
		override protected function deckCreated():void
		{
			super.deckCreated();
			if (card.parent && card.parent.id != "tpShareCard")
			{
				card.call(HeaderFunctions.setHeaderIcon, [IconType.IMAGE_MAIL]);
				card.call(HeaderFunctions.setHeaderTitle, [_title]);
			}
			_controller.dispatchEvent(new PdkEvent(PdkEvent.OnShowEmailForm, true));
		}
		

		
		//////// local functions to the form //////////////
		
		private function cancelEmail():void
		{
			_controller.hideCard("forms");
		}
		
		private function submitEmail():void
		{
			var sender:String = card.call(EmailFormFunctions.getEmailSender, []);
			
			var sendTo:String = card.call(EmailFormFunctions.getEmailSendTo, []);
			var message:String = card.call(EmailFormFunctions.getEmailMessage, []);
			
			if (!checkErrors(sender, sendTo))
			{
				doSubmit(sender, sendTo, message);
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
				card.call(EmailFormFunctions.emailSendToAlert, ["Include an email to send to"]);
			}
			else
			{
				card.call(EmailFormFunctions.emailSendToAlert, [false]);

			}
			return error;
		}
		
		private function doSubmit(sender:String, sendTo:String, message:String):void
		{
			var emailServiceURL:String = _controller.getProperty("emailServiceUrl");
			
			var pController:PlayerController = _controller as PlayerController;
			
			toCount = sendTo.split(/[ ,;]/).length;
	 		
	 		var bc:BaseClip = getBaseClip();
	 		if (!bc)
	 		{
	 			_controller.trace("couldn't find a content base clip; no title or guid available", "PlayerForm", Debug.ERROR);
	 		}
	 		else if (emailServiceURL)
	 		{
	 			emailServiceURL = substituteUrl(emailServiceURL);
	 			var fields:Dictionary = new Dictionary();

				// if emailServiceURL has {to} then we're using GET for to/from/message
	 			if (emailServiceURL.indexOf("{to}") >= 0)
	 			{
					emailServiceURL=PdkStringUtils.replaceStr(emailServiceURL, "{to}", encodeURIComponent(sendTo), "g");
					emailServiceURL=PdkStringUtils.replaceStr(emailServiceURL, "{from}", encodeURIComponent(sender), "g");
					emailServiceURL=PdkStringUtils.replaceStr(emailServiceURL, "{message}", encodeURIComponent(message), "g");
	 			}
	 			// otherwise POST
	 			else
	 			{
		 			fields["to"] = sendTo;
		 			fields["from"] = sender;
	 				fields["message"] = message;
	 			}	
	 			fields["playerURL"] = getLinkText();
	 			fields["releaseTitle"] = currentClip ? currentClip.title : bc ? bc.title : "this clip";
	 			fields["releaseDescription"] = bc.description;
	 			
	 			(_controller as PlayerController).submitForm(this.id, emailServiceURL, fields, URLRequestMethod.POST, completeHandler, ioErrorHandler);

				_componentArea.visible = false;
	 		}
	 		else
	 			_controller.trace("*** ERROR - unable to send email: emailServiceURL is null","EmailForm", Debug.ERROR);
		}
		private function completeHandler(evt:Event):void 
		{ 
			showThankyou(true);
			_controller.trace("*** email sent ***", "EmailForm", Debug.INFO) 
		}
		private function ioErrorHandler(evt:ErrorEvent):void 
		{ 
			showThankyou(true);
			_controller.trace("*** email error: " + evt.toString(), "EmailForm", Debug.ERROR) 
		}
				
		private function showThankyou(isShown:Boolean):void
		{
			var evt:PdkEvent = new PdkEvent(PdkEvent.OnEmail, {recipientCount: toCount, excerpt: _excerpt, clip: currentClip});
			_controller.dispatchEvent(evt);
			_controller.showEmailForm(false);			
		}
		
		//////// override the card event handlers /////////
		
		/* override protected function cardAreaChanged(area:Rectangle):void
		{
		} */
		
		/* override protected function cardCreationStart(card:Card):void
		{
		} */
		
		override protected function cardDestroyed(card:Card):void
		{
			super.cardDestroyed(card);
			card.unRegisterFunction(EmailFormFunctions.cancelEmail);
			card.unRegisterFunction(EmailFormFunctions.submitEmail);
			
			_controller.dispatchEvent(new PdkEvent(PdkEvent.OnShowEmailForm, false));
		}
		
		/* override protected function cardVisible(isVisible:Boolean):void
		{
		} */

		
		
		
		/* override public function destroy():void
		{
			super.destroy();
		} */		
	}
}
