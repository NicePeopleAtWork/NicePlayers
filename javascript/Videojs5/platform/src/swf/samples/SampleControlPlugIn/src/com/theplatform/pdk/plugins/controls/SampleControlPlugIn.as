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
	import com.theplatform.pdk.mediators.SampleButtonMediator;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.plugins.IControlPlugIn;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.display.Sprite;

	/**
 	* This class implements the sample control SWF file that adds the 
 	* custom control to the player control rack.  
 	*/
	public class SampleControlPlugIn extends Sprite implements IControlPlugIn
	{
		private var _controller:IPlayerController;
		
		// Embed the icons in the SWF. 
		// The button manager will pick the one with the best fit. 
		[Embed(source='/images/30x30.png')]
		private var _iconBiggest:Class;
		
		[Embed(source='/images/27x27.png')]
		private var _iconBig:Class;		
		
		[Embed(source='/images/24x24.png')]
		private var _iconMedium:Class;
		
		[Embed(source='/images/20x20.png')]
		private var _iconSmall:Class;		
		
		[Embed(source='/images/17x17.png')]
		private var _iconSmaller:Class;	

		[Embed(source='/images/14x14.png')]
		private var _iconSmallest:Class; 
		
		/**
		 * Add the embedded icons to an array, largest to smallest.
		 */		
		private var _icons:Array = [_iconBiggest,
									_iconBig,
									_iconMedium,
									_iconSmall,
									_iconSmaller,
									_iconSmallest]; 
		
		private var _control:ButtonControl;
		private var _mediator:SampleButtonMediator;
		private var _added:Boolean = false;
		
		private var _blink:Boolean = true;
		private var _scale:Boolean = false;
		
		/**
		 * Constructor. Should only be used to set up local variables. 
		 */
		public function SampleControlPlugIn()
		{
		}
		
		/**
		 * Called by the player controller after it loads the plug-in. 
		 * The method should add the controller reference and
		 * register itself. This method can also be used to 
		 * add any event listeners for events outside the scope
		 * of the control rack. 
		 * 
		 * @param lo LoadObject with properties for control rack and player controller. 
		 */
		public function initialize(lo:LoadObject):void
		{
			// The manager has set everything up. Call the register function
			// and add any events, if necessary. 
			_controller = lo.controller as IPlayerController;
			_controller.trace("registering control component with priority [" + lo.priority + "]", "SampleControlPlugIn", Debug.INFO);
			_controller.registerControlPlugIn(this, lo.priority);
			
			// Grab any canvas-set values for blink and icon scale.
			_blink = lo.vars["blink"] && lo.vars["blink"].toString().toUpperCase() == "FALSE" ? false : true;
			_scale = lo.vars["scale"] && lo.vars["scale"].toString().toUpperCase() == "TRUE" ? true : false;
		}

		/**
		 * Called by the ControlManager on the first pass of control rendering.
		 */
		public function getControlIds():Array
		{
			_controller.trace("getControlIds called: returning implemented control IDs", "SampleControlPlugIn", Debug.INFO);
			// Let the manager know that a control with the ID "sampleControl" 
			// is available to be added to the control rack. 
			return ["sampleControl"];
		}

		/**
		 * Called by the ControlManager on the first pass of control rendering.
		 * The control manager is parsing the layout metadata and 
		 * querying the plug-ins to see which ones render the listed IDs.  
		 */		 
		public function getControl(metadata:ItemMetaData):Control
		{
			if (metadata.id == "sampleControl")
			{
				_controller.trace("getControl: Found an implementation for ID \"" + metadata.id + "\"", "SampleControlPlugIn", Debug.INFO);
				_control = new ButtonControl(metadata.id, metadata);
				_added = true;//we have a button for the controlManager
				
				// Next, grab the tooltips attribute from the metadata layout. 
				if (metadata.display["tooltips"])
				{
					_control.tooltip = metadata.display["tooltips"];
				} 
				else
				{
					// Set a default if nothing's defined.
					_control.tooltip = "Sample";
				}

				// Set this to true to have the button manager scale
				// the closest-fitting icon to be a perfect fit. 
				_control.scaleIcon = _scale;
				
				return _control;
			}
			return null;
		}
		
	
		/**
		 * Called by the ControlManager on the first pass of control rendering.
		 * Once the control manager has loaded the plug-ins, it queries each
		 * for its mediator. The mediator is passed a reference to the controller,
		 * the metadata, and the plug-in's resources. 
		 */
		public function getControlMediator(metadata:ItemMetaData):Mediator
		{
			if (metadata.id == "sampleControl")
			{
				_controller.trace("getControlMediator: Found an implementation for ID \"" + metadata.id + "\"", "SampleControlPlugIn", Debug.INFO);
				// We're also passing in the value of the blink setting from the canvas. 
				_mediator = new SampleButtonMediator(metadata.id, _controller, metadata, {icon:_icons}, _blink);
				return _mediator;//we have a mediator for the controlManager
			}
			return null;
		}
		
		/**
		 * Called by the ControlManager on the second pass of control rendering.
		 * In this example, the plug-in inserts itself into the control rack.
		 * 
		 * <p>Otherwise you can use this method to set up anything left to do just
		 * before the clip begins to play.</p>   
		 */
		public function finalize(component:ComponentArea):void
		{
			var playerArea:PlayerArea = component as PlayerArea;
			_controller.trace("finalize called", "SampleControlPlugIn", Debug.INFO);
			if (!playerArea) return;//we only want to work on the playerArea (which contains is the main control rack), beginning in 4.2, there are multiple possible component areas; one for each card that gets laid out
			if (!_added)
			{
				// If the control wasn't created on the first pass, add it as the last
				// control, first trying to add it to the floating controls, and then
				// to the bottom controls
				_controller.trace("control ID wasn't in layout", "SampleControlPlugIn", Debug.INFO);
				_added = injectInRegion(playerArea, "tpBottomRegion");
				if (!_added)
				{
					_added = injectInRegion(playerArea, "tpVideoRegion");
				}
				if (!_added)
				{
					_controller.trace("control ID wasn't in layout, and couldn't be injected", "SampleControlPlugIn", Debug.ERROR);
				}
			}
			
			if (_added)
			{							
				// this sample control is meant to replace both the "tpEmail" and "tpLink"
				// buttons... so if it was added, and those other controls were on the rack,
				// remove them
				var email:Control = playerArea.getItemById("tpEmail") as Control;
				if (email != null)
				{
					_controller.trace("Found \"tpEmail\" control; removing", "SampleControlPlugIn", Debug.INFO);
					email.parent.remove(email);
				}
				var link:Control = playerArea.getItemById("tpLink") as Control;
				if (link != null)
				{
					_controller.trace("Found \"tpLink\" control; removing", "SampleControlPlugIn", Debug.INFO);
					link.parent.remove(link);
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
				_controller.trace("Attempting to inject control in region \"" + id + "\"", "SampleControlPlugIn", Debug.INFO);			
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
					_controller.trace("Didn't find a last container in region \"" + id + "\"", "SampleControlPlugIn", Debug.WARN);
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
			_control = new ButtonControl("sampleControl", null, _controller);
			_control.scaleIcon = _scale;
			_control.tooltip = "Sample";
			container.add(_control); //add it to the container
			
			//make the mediator
			_mediator = new SampleButtonMediator("sampleControl", _controller, null, {icon:_icons}, _blink);
			_controller.addMediator(_mediator, container.card.deckId, container.card.id);
			
			_controller.trace("Control ID not supplied in layout; automatically injected", "SampleControlPlugIn", Debug.INFO);
		}		
	}
}
