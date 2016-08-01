package com.theplatform.pdk.plugins 
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.CardPriority;
	import com.theplatform.pdk.data.ICard;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.events.CardEvent;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.geom.Rectangle;
	import flash.utils.Dictionary;

	public class SampleCaptchaPlugIn extends Sprite implements IFormSubmitPlugIn
	{
		private var _controller:IPlayerController;
			
		private var _serviceUrl:String;
		private var _fields:Dictionary;
		private var _method:String;	
		private var _card:ICard;
				
		public function SampleCaptchaPlugIn()
		{
		}
		
		public function initialize(lo:LoadObject):void
		{
			// Register with the controller. 
			_controller = lo.controller as IPlayerController;
			_controller.trace("registering captcha component with priority [" + lo.priority + "]", "SampleCaptchaPlugIn", Debug.INFO);
			_controller.registerFormSubmitPlugIn(this, lo.priority);		

			// Add a new card to the forms deck, which we'll hide and show manually.
			_card = _controller.addCard("forms", "tpCaptcha", null, CardPriority.CUSTOM);
			
			// Event listeners that create the contents of our form as the player loads. 
			_card.addEventListener(CardEvent.OnCardCreationStart, cardCreationStart, false, 0, true);
			_card.addEventListener(CardEvent.OnCardDestroyStart, cardDestroyStart, false, 0, true);

		}
		
		private function cardCreationStart(e:CardEvent):void
		{
			// Set isActive to true to tell the controller that the plug-in will populate the card.
			_card.isActive = true;
			
			// Find out how much space is available to draw the card. 
			// Note that this may change, so listen for OnCardAreaChanged and redraw if necessary.
			var area:Rectangle = _card.area;
			
			// Create items that will appear in the form. 
			// This first button cancels the submission. 
			var button:Sprite = new Sprite();
			button.graphics.beginFill(0xff0000);
			button.graphics.drawRoundRect(0, 0, 200, 100, 10);
			button.graphics.endFill();
			
			// Add the button to the card and assign listeners for its events.  
			_card.container.addChild(button);
			button.addEventListener(MouseEvent.CLICK, onStopClick);

			// This button OKs the submission. 
			button = new Sprite();
			button.graphics.beginFill(0x00ff00);
			button.graphics.drawRoundRect(0, 0, 200, 100, 10);
			button.graphics.endFill();
			button.x = 210;
			
			_card.container.addChild(button);
			button.addEventListener(MouseEvent.CLICK, onGoClick);
		}

		private function cardDestroyStart(e:CardEvent):void
		{
			// Do any necessary clean-up work here. 
		}
		
		// This is called by the controller on every email sent.
		public function submitForm(cardId:String, serviceUrl:String, fields:Dictionary, method:String):Boolean
		{
			if (cardId == "tpEmailCard") {
				// Copy the URL, the parameters, and the HTTP method for local use. 
				_serviceUrl = serviceUrl;
				_fields = fields;
				_method = method;
			
				displayCaptcha();
				return true;
			}
			// If this isn't our form, then just get out. 
			return false;
		}
		
		// Show our form with our custom buttons. 
		private function displayCaptcha():void {
			_controller.showCard("forms", "tpCaptcha");
		}

		// Hide our form. 
		private function hideCaptcha():void {
			_controller.hideCard("forms");
		}
		
		// If we get a positive result of a captcha, hide the form and continue with submission.
		private function onGoClick(me:MouseEvent):void {
			hideCaptcha();
			_controller.setFormSubmission(_serviceUrl, _fields, _method);
		}
		
		// If the captcha fails, cancel the submission by sending nulls in their place.
		// In a real captcha, you could keep requerying the user a specific number of times. 
		private function onStopClick(me:MouseEvent):void {
			hideCaptcha();
			_controller.setFormSubmission(null, null, null);
		}

	}
}
