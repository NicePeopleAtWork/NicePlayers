package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controls.ButtonControl;
	import com.theplatform.pdk.controls.ButtonSkin;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.metadata.ItemMetaData;

	public class FormButtonControlMediator extends Mediator
	{
		protected var _buttonControl:ButtonControl;
		private static var DEFAULT_SKIN:String = ButtonSkin.DEFAULT_FORMS;
		private var _displayMetaData:Object;
		
		public function FormButtonControlMediator(id:String, controller:IViewController, metadata:ItemMetaData = null, resources:Object = null)
		{
			super(id, controller, metadata, resources);
			
			if (metadata.display)
				_displayMetaData = metadata.display;
		}



		override protected function setItem(item:Item):void
		{
			_buttonControl = item as ButtonControl;

			_buttonControl.autoSkin = false;

			if (_displayMetaData["skin"] == undefined)
				_buttonControl.skin = DEFAULT_SKIN;
			else
				_buttonControl.skin = _displayMetaData["skin"];

			super.setItem(item);

		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
		}


	}
}
