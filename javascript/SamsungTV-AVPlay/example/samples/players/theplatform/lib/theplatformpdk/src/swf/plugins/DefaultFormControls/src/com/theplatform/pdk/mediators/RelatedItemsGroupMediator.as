
package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.containers.Container;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.ItemVisibility;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.ReleaseState;
	import com.theplatform.pdk.data.CardCallerType;
	import com.theplatform.pdk.functions.MenuFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	
	import flash.errors.IllegalOperationError;
	import flash.events.Event;

	public class RelatedItemsGroupMediator extends ContainerMediator
	{
		protected var _container:Container;

		public function RelatedItemsGroupMediator(id:String, controller:IViewController, metadata:ItemMetaData = null, resources:Object = null)
		{
			super(id, controller, metadata, resources);
		}

		override protected function setItem(item:Item):void
		{
			super.setItem(item);

			_container = item as Container;
			var hasRelatedItemsURL:Boolean = true;
			
			if( _controller.getProperty("relatedItemsURL") == null)
			{
				hasRelatedItemsURL = false;
			}

			if (!_container)
				throw new IllegalOperationError("RelatedItemsGroupMediator must be associated with a Container");

			if (!hasRelatedItemsURL)
			{
				supressContainer();
			}else
			{
				var plc:PlayerController = _controller as PlayerController;
                if (plc)
                {
                    var state:String = plc.getReleaseState();
				    var prev:Clip = plc.getPreviousClip();    
                }

                var callerType:String
                if (card)
				    callerType = card.initVars["callerType"];
				
				if(state == ReleaseState.STANDBY && callerType == CardCallerType.END_CARD)
				{
					if(!prev)
					{
						supressContainer();
					}
				}else
				{
					if(!hasRelatedItemsURL)
					{
						supressContainer();
					}
				}
			}

		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
			
			card.registerFunction(MenuFormFunctions.onRelatedItemURLIOError, this, onRelatedItemURLIOError);
		}
		
		private function onRelatedItemURLIOError(error:Event):void
		{
			supressContainer();
		}

		private function supressContainer():void
		{
			_container.visibility = ItemVisibility.HIDDEN;
		}
		
				
		override public function destroy():void
		{
			if (card)
			{
				card.unRegisterFunction(MenuFormFunctions.onRelatedItemURLIOError);
			}
			
			super.destroy();
		}

	}
}
