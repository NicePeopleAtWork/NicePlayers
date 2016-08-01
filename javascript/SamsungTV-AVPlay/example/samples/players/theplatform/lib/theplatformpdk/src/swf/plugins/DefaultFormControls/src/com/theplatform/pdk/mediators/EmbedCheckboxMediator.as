package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.IconType;
	import com.theplatform.pdk.controls.ImageControl;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.functions.EmbedFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	
	import flash.errors.IllegalOperationError;

	public class EmbedCheckboxMediator extends PlayerControlMediator
	{
		private static const DEFAULT_ICON_CHECKED:String = IconType.CHECKED;
		private static const DEFAULT_ICON_UNCHECKED:String = IconType.UNCHECKED;
		
		protected var _isChecked:Boolean;
		protected var _checkBoxControl:ImageControl;
		
		public function EmbedCheckboxMediator(id:String, controller:IViewController, metadata:ItemMetaData=null, resources:Object=null)
		{
			super(id, controller, metadata, resources);
			init();
		}
		
		protected function init():void
		{
			_isChecked = false;
		}
		override protected function setItem(item:Item):void
		{
			_checkBoxControl = item as ImageControl;
			_checkBoxControl.colorize = true;
			if (!_checkBoxControl) 
				throw new IllegalOperationError("The EmbedCheckboxMediator must be associated with a ImageControl");
			
			super.setItem(item);
			setChecked(false);
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
				
			card.registerFunction(EmbedFormFunctions.setChecked, this, setChecked);
		}
		
		protected function toggleChecked():void
		{
			setChecked(!_isChecked);
		}
		
		protected function setChecked(b:Boolean):void
		{
			_isChecked = b;
			_checkBoxControl.image = (_isChecked) ? DEFAULT_ICON_CHECKED : DEFAULT_ICON_UNCHECKED;
		}
		
		override public function destroy():void
		{
			if (card)
				card.unRegisterFunction(EmbedFormFunctions.setChecked);
			super.destroy();
		}
	}
}
