package com.theplatform.pdk.plugins 
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.display.Sprite;
	import flash.events.TimerEvent;
	import flash.utils.Timer;

	public class SampleRelatedItemsPlugIn extends Sprite implements IRelatedItemsPlugIn
	{
		private var _controller:IPlayerController;
		private var VERSION:String = "1.0"; 
		private var _plugin:Sprite;
		
		//If you are using more than one plugin to manage related items, you should set the priority
		//according to which one you want to check first. 
		private var _priority:Number = 1;  
		
		//This is just an array full of pids to test with. 
		private var _dummyContentIds:Array = null;
		
		public function SampleRelatedItemsPlugIn()
		{
			//do nothing
		}
		
		public function initialize(lo:LoadObject):void
		{	
			// Get the controller
			_controller = lo.controller as IPlayerController;

			var contentCheck:String = lo.vars["dummyContentIds"];
			_dummyContentIds = contentCheck!= null ? _dummyContentIds = contentCheck.split(",") : _dummyContentIds = ["1158311219", "1158310347"];

			_controller.trace("Loaded SampleRelated with " + _dummyContentIds.length + " identifiers", "SampleRelatedItemsPlugin", Debug.INFO); 

			// register as a related items plug-in
			_controller.registerRelatedItemsPlugIn(this, lo.priority);
		}
		
		//This is the function that is called by the PDK to kick off getting the 
		//related items PIDs. 
		public function getRelatedItems(clip:Clip):Boolean
		{
			//This timer is a hack to simulate a third party asynchronous operation
			//presumably the plugin writer will use an event model to retrieve PIDs 
			//and call valuesReturned
			var returnTimer:Timer = new Timer(500, 1);
			returnTimer.addEventListener("timer", valuesReturned);
			returnTimer.start();
			
				
			// Return false to decline the request to provide related items. 
			// Multiple plug-ins can be added to a player.
			// Once a plug-in returns true, the controller assumes the plug-in 
			// is generating a list of ids and any remaining plug-ins are ignored. 
				
			return true;
		}
		
		private function valuesReturned(tev:TimerEvent):void
		{
			//this function name is arbitrary, but this line is necessary to load
			//the related items. 
			_controller.setRelatedContentIds(_dummyContentIds);
		}
	}
}
