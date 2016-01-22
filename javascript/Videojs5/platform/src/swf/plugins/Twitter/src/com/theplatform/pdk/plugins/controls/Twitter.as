package com.theplatform.pdk.plugins.controls 
{
	import com.theplatform.pdk.containers.ComponentArea;
	import com.theplatform.pdk.containers.Container;
	import com.theplatform.pdk.containers.PlayerArea;
	import com.theplatform.pdk.containers.Region;
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.controls.ButtonControl;
	import com.theplatform.pdk.controls.Control;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.mediators.Mediator;
	import com.theplatform.pdk.mediators.TwitterMediator;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.plugins.IControlPlugIn;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.display.Sprite;

	/**
 	* This class implements the sample control SWF file that adds the 
 	* custom control to the player control rack.  
 	*/
	public class Twitter extends Sprite implements IControlPlugIn
	{
		static public const controlId:String = "twitter";
		
		private var _controller:IPlayerController;
				
		/**
		 * Embed the various sized icons.
		 */
		[Embed(source='/images/Twitter-256x256.png')]
		private var _icon256:Class;
		
		[Embed(source='/images/Twitter-80x80.png')]
		private var _icon80:Class;
		
		[Embed(source='/images/Twitter-40x40.png')]
		private var _icon40:Class;
		
		[Embed(source='/images/Twitter-35x35.png')]
		private var _icon35:Class;
		
		[Embed(source='/images/Twitter-30x30.png')]
		private var _icon30:Class;
		
		[Embed(source='/images/Twitter-20x20.png')]
		private var _icon20:Class;
				
		[Embed(source='/images/Twitter-15x15.png')]
		private var _icon15:Class;

		[Embed(source='/images/Twitter-10x10.png')]
		private var _icon10:Class;
				
		/**
		 * Add the embeded icons to an array, biggest to smallest.
		 */		
		private var _icons:Array = [_icon256,
									_icon80, 
									_icon40,
									_icon35,
									_icon30,
									_icon20,
									_icon15,
									_icon10];
				
		private var _control:ButtonControl;
		private var _mediator:TwitterMediator;
		private var _added:Boolean = false;
		
		public function Twitter()
		{
		}
		
		public function initialize(lo:LoadObject):void
		{
			_controller = lo.controller as IPlayerController;
			_controller.trace("*** Twitter  IS UP!!! ***");
			_controller.trace("registering control plugin with priority [" + lo.priority + "]", "Twitter", Debug.INFO);
			_controller.registerControlPlugIn(this, lo.priority);
		}

		public function getControlIds():Array
		{
			return [controlId];
		}
	 
		public function getControl(metadata:ItemMetaData):Control
		{
			if (metadata.id == controlId)
			{
				_controller.trace("getControl: Found an implementation for ID \"" + metadata.id + "\"", "Twitter", Debug.INFO);
				_control = new ButtonControl(metadata.id, metadata);
				_control.colorizeIcon = false;
				_control.scaleIcon = false;
				_added = true;
				return _control;
			}
			return null;
		}
		
		public function getControlMediator(metadata:ItemMetaData):Mediator
		{
			if (metadata.id == controlId)
			{
				_controller.trace("getControlMediator: Found an implementation for ID \"" + metadata.id + "\"", "Twitter", Debug.INFO);
				_mediator = new TwitterMediator(metadata.id, _controller, metadata, {icon:_icons});
				return _mediator;
			}
			return null;
		}
		
		/**
		 * Called by the ControlManager on the second pass of control rendering.
		 * In this example, the plug-in inserts itself into the control rack.
		 */
		public function finalize(componentArea:ComponentArea):void
		{
			_controller.trace("finalize called", "Twitter", Debug.INFO);
			var playerArea:PlayerArea = componentArea as PlayerArea;
			if (playerArea)
			{
				if (!_added)
				{
					// If the control wasn't created on the first pass, add it as the last
					// control, first trying to add it to the floating controls, and then
					// to the bottom controls
					_controller.trace("control ID wasn't in layout", "Twitter", Debug.INFO);
					_added = injectInRegion(playerArea, "tpBottomRegion");
					if (!_added)
					{
						_added = injectInRegion(playerArea, "tpBottomFloatRegion");
					}
					if (!_added)
					{
						_controller.trace("control ID wasn't in layout, and couldn't be injected", "Twitter", Debug.ERROR);
					}
				}
			}
		}
		
		/**
		 * Check if a container exists, and if it does, try to add the control
		 */
		private function injectInRegion(playerArea:PlayerArea, id:String):Boolean
		{
			var region:Region = playerArea.getItemById(id) as Region;
			if (region != null)
			{	
				_controller.trace("Attempting to inject control in region \"" + id + "\"", "Twitter", Debug.INFO);			
				// assume one top-level container in the region; either a column, or a row.
				// then, append this control as the last item in the last column or row.
				var subContainer:Container = region.getLastContainer();
				if (subContainer != null)
				{
					appendControl(subContainer);
					return true;
				}
				else
				{
					_controller.trace("Didn't find a last container in region \"" + id + "\"", "Twitter", Debug.WARN);
				}
			}
			return false;		
		}
		
		/**
		 * Used to inject the control into the last position in a given container
		 */
		private function appendControl(container:Container):void
		{
			//make a button control
			_control = new ButtonControl(controlId, null, _controller);
			_control.colorizeIcon = false;
			//	_control.scaleIcon = true;
			container.add(_control); //add it to the container
			
			//make the mediator
			_mediator = new TwitterMediator(controlId, _controller, null, {icon:_icons});
			_controller.addMediator(_mediator, container.card.deckId, container.card.id);
			
			_controller.trace("Control ID not supplied in layout; automatically injected", "Twitter", Debug.INFO);
		}		
	}
}
