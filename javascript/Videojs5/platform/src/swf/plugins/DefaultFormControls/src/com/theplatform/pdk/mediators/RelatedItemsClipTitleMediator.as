package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.TextControl;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.functions.MenuFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;

	import flash.errors.IllegalOperationError;

	public class RelatedItemsClipTitleMediator extends Mediator
	{
		public static const DEFAULT_HINT_TEXT:String = " ";
		private var _textControl:TextControl;
		private var _hintText:String = DEFAULT_HINT_TEXT;

		public function RelatedItemsClipTitleMediator(id:String, controller:IViewController, metadata:ItemMetaData = null, resources:Object = null)
		{
			super(id, controller, metadata, resources);

			if (metadata.display["hintText"])
				_hintText = metadata.display["hintText"];
		}

		override protected function setItem(item:Item):void
		{
			_textControl = item as TextControl;
			if (!_textControl)
				throw new IllegalOperationError("The RelatedItemsClipTitleMediator must have a text control");

			var currentClip:Clip = (PlayerController(_controller).getCurrentClip());

			//if (currentClip && !currentClip.noSkip)
			_textControl.text = _hintText;

			super.setItem(item);

		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);

			card.registerFunction(MenuFormFunctions.setRelatedItemsClipTitle, this, setClipTitle);
			card.registerFunction(MenuFormFunctions.revertRelatedItemsClipTitle, this, revertClipTitle);
		}

		private function setClipTitle(string:String):void
		{
			_textControl.text = string;
		}

		private function revertClipTitle():void
		{
			if (_hintText == "")
				_textControl.text = " ";
			else
				_textControl.text = _hintText;
		}

		override public function destroy():void
		{
			if (card)
			{
				card.unRegisterFunction(MenuFormFunctions.setRelatedItemsClipTitle);
				card.unRegisterFunction(MenuFormFunctions.revertRelatedItemsClipTitle);
			}

			super.destroy();
		}

	}
}