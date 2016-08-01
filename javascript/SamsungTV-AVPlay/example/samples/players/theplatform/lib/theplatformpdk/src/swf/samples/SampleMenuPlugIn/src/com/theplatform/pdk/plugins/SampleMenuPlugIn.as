package com.theplatform.pdk.plugins 
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.data.CardPriority;
	import com.theplatform.pdk.data.ICard;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.events.CardEvent;
	import com.theplatform.pdk.events.PdkEvent;
	
	import flash.display.MovieClip;
	import flash.display.Sprite;
	import flash.events.MouseEvent;
	import flash.geom.Rectangle;

	public class SampleMenuPlugIn extends Sprite implements IPlugIn
	{
		private var _lo:LoadObject;
		private var _controller:IPlayerController;
		private var _card:ICard;
		
		public var menu:MovieClip;
		
		public function SampleMenuPlugIn()
		{
		}
		
		public function initialize(lo:LoadObject):void
		{
			_lo = lo;
			_controller = _lo.controller as IPlayerController;
			
			_controller.addEventListener(PdkEvent.OnPlugInsComplete, loadComplete);
		}
		
		private function loadComplete(e:PdkEvent):void
		{
			// It's a good idea to remove event listeners when they aren't needed any more
			_controller.removeEventListener(PdkEvent.OnPlugInsComplete, loadComplete);
			
			// Now that the loading is complete, we can access the subPlugin via the LoadObject.
			// This isn't available at initialize, only after loadComplete can we be sure it's there.
			// If your plug-in doesn't need to load a supporting SWF, you can skip this step.
			// in this example, we know that the menu has 3 buttons
			menu = _lo.subPlugInRef as MovieClip;
			
			if (menu)
			{
				MovieClip(menu.buttons.closeButton).addEventListener(MouseEvent.CLICK, closeClick, false, 0, true);
				MovieClip(menu.buttons.fullButton).addEventListener(MouseEvent.CLICK, fullClick, false, 0, true);
				MovieClip(menu.buttons.nextButton).addEventListener(MouseEvent.CLICK, nextClick, false, 0, true);
				
				//make a card: In this example the card is simply a conduit for messages between the layoutManager and the plugin
				//the plugin will decide what it shows and how it shows it, using the card to determine when and how big.
				_card = _controller.addCard("forms", "tpMenuCard", null, CardPriority.CUSTOM);//we won't provide any xml since this plugin will handle all of the form view.
				
				
				//now that the card is created, add event listeners
				_card.addEventListener(CardEvent.OnCardAreaChanged, cardAreaChanged, false, 0, true);
				_card.addEventListener(CardEvent.OnCardCreated, cardCreated, false, 0, true);
				_card.addEventListener(CardEvent.OnCardCreationStart, cardCreationStart, false, 0, true);
				_card.addEventListener(CardEvent.OnCardDestroyed, cardDestroyed, false, 0, true);
				_card.addEventListener(CardEvent.OnCardDestroyStart, cardDestroyStart, false, 0, true);
				_card.addEventListener(CardEvent.OnCardEnabled, cardEnabled, false, 0, true);
				_card.addEventListener(CardEvent.OnCardVisible, cardVisible, false, 0, true);
			}
			
		}
		
		private function closeClick(e:MouseEvent):void
		{
			_controller.hideCard("forms");//remove the card, that gets rid of the whole thing
		}
		
		private function fullClick(e:MouseEvent):void
		{
			_controller.showFullScreen(true);//go to full screen (nothing will happen if already in fullscreen
		}
		
		private function nextClick(e:MouseEvent):void
		{
			_controller.playNext(false);//play the next release
		}
		 
		/**
		 * The layoutManager has gotten the call to show your card
		 * This event gives us a chance to show the card and set some initialization values 
		 * @param e
		 * 
		 */
		private function cardCreationStart(e:CardEvent):void
		{
			if (menu)//always check that the subForm exists
			{
				_card.isActive = true;//isActive must be set to true here (it starts as false if there is no layout xml--the plugin has to prove that it is handling the card)
				var area:Rectangle = _card.area;//get the starting area--this may change after the card is created, listen for OnCardAreaChanged, too
				menu.sizeMenu(area);//sizeForm is a function defined on the timeline of the subForm movieClip
				_card.container.addChild(menu);//make sure we add the child TO THE CARD'S CONTAINER, so the 
				menu.visible = true;//make sure it's visible
			}
		}
		
		/**
		 * The card may change its size for a number of reasons, make sure you catch this event. 
		 * @param e
		 * 
		 */
		private function cardAreaChanged(e:CardEvent):void
		{
			if (menu)
			{
				var area:Rectangle = e.data as Rectangle
				menu.sizeMenu(area);
			}
		}
		
		/**
		 * This is fired after the card has added itself to the dom, etc.  
		 * This is more important for cards with layout xml, as it fires after all the controls have been dynamically created.
		 * @param e
		 * 
		 */
		private function cardCreated(e:CardEvent):void
		{
			
		}
		
		/**
		 * The card is being removed from view--the plugin needs to take this opportunity to remove its overlay
		 * or else it will stick around after it's wanted. 
		 * @param e
		 * 
		 */
		private function cardDestroyStart(e:CardEvent):void
		{
			if (menu)
			{
				menu.visible = false;
				_card.container.removeChild(menu);
			}
		}
		
		/**
		 * This is fired after the card has removed itself from the dom, etc.
		 * This is more important for cards with layout xml, as it fires after all the controls have been destroyed.
		 * @param e
		 * 
		 */
		private function cardDestroyed(e:CardEvent):void
		{
			//do nothing here
		}
		
		/**
		 * Sometimes decks disable all other decks when they are shown. 
		 * If there is some process that is graphics-intensive, it should be paused if e.data = false;
		 * @param e
		 * 
		 */
		private function cardEnabled(e:CardEvent):void
		{
			
		}
		/**
		 * Sometimes decks make all other decks invisible when they are shown.  The layoutManager itself will handle setting the container visibility to false, so the plugin doesn't have to worry about that
		 * If there is some process that is graphics-intensive, it should be paused if e.data = false;
		 * @param e
		 * 
		 */
		private function cardVisible(e:CardEvent):void
		{
			
		}
		
	}
}
