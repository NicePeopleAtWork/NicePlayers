// this implements the release list object.  this object is then added
// to the ReleaseListTemplateContainer to create a SWF.

package com.theplatform.pdk.component
{
	import com.theplatform.pdk.controllers.ReleaseListController;
	import com.theplatform.pdk.views.ReleaseListTemplateView;
	import com.theplatform.pdk.views.mediators.ReleaseListTemplateMediator;
	
	import flash.display.DisplayObjectContainer;
	import flash.display.Sprite;
	
	public class ReleaseListTemplate extends Component
	{
		private var _releaseListView:ReleaseListTemplateView;
		private var _releaseListMediator:ReleaseListTemplateMediator;
		
		/**
		 * Constructor.
		 */
		public function ReleaseListTemplate(parentDisplay:DisplayObjectContainer = null)
		{
			super(parentDisplay);
		}

		/**
		 * @private
		 */
		override internal function commit():void
		{
			//the super doesn't know what kind of controller we'll need, so we create it here
			var controller:ReleaseListController = new ReleaseListController(this.id); //id should be set in superclass
			commitController(controller); //the Component superclass will populate the properties into the controller
			
			// create the view class and the mediator class
			_releaseListView = new ReleaseListTemplateView(controller, this);
			_releaseListMediator = new ReleaseListTemplateMediator(controller);
			
			// create the actual release list
			controller.plugInLayer = new Sprite();
			addChild(controller.plugInLayer);
			controller.loadPlugIns();
		}
		
		///////// allowScrolling /////////////
		public function get allowScrolling():Boolean { return getProperty("allowScrolling") == "false" ? false : true; };
		public function set allowScrolling(value:Boolean):void { setProperty("allowScrolling", value.toString()); };
		
		///////// autoPlay /////////////
		public function get autoPlay():Boolean { return getProperty("autoPlay") == "false" ? false : true; };
		public function set autoPlay(value:Boolean):void { setProperty("autoPlay", value.toString()); };
		
		///////// autoLoad /////////////
		public function get autoLoad():Boolean { return getProperty("autoLoad") == "false" ? false : true; };
		public function set autoLoad(value:Boolean):void { setProperty("autoLoad", value.toString()); };
		
		///////// category /////////////
		public function get category():String { return getProperty("category"); };
		public function set category(value:String):void { setProperty("category", value); };
		
		///////// columns /////////////
		public function get columns():int { return int(getProperty("columns")); };
		public function set columns(value:int):void { setProperty("columns", value.toString()); };
					
		///////// itemsPerPage /////////////
		public function get itemsPerPage():int { return int(getProperty("itemsPerPage")); };
		public function set itemsPerPage(value:int):void { setProperty("itemsPerPage", value.toString()); };
		
		///////// playAll /////////////
		public function get playAll():Boolean { return getProperty("playAll") == "false" ? false : true; };
		public function set playAll(value:Boolean):void { setProperty("playAll", value.toString()); };
		
		///////// selectedPid /////////////
		public function get selectedPid():String { return getProperty("selectedPid"); };
		public function set selectedPid(value:String):void { setProperty("selectedPid", value); };
		
		///////// showAirdate /////////////
		public function get showAirdate():Boolean { return getProperty("showAirdate") == "false" ? false : true; };
		public function set showAirdate(value:Boolean):void { setProperty("showAirdate", value.toString()); };
		
		///////// showAuthor /////////////
		public function get showAuthor():Boolean { return getProperty("showAuthor") == "false" ? false : true; };
		public function set showAuthor(value:Boolean):void { setProperty("showAuthor", value.toString()); };
		
		///////// showBitrate /////////////
		public function get showBitrate():Boolean { return getProperty("showBitrate") == "false" ? false : true; };
		public function set showBitrate(value:Boolean):void { setProperty("showBitrate", value.toString()); };
		
		///////// showDescription /////////////
		public function get showDescription():Boolean { return getProperty("showDescription") == "false" ? false : true; };
		public function set showDescription(value:Boolean):void { setProperty("showDescription", value.toString()); };
		
		///////// showFormat /////////////
		public function get showFormat():Boolean { return getProperty("showFormat") == "false" ? false : true; };
		public function set showFormat(value:Boolean):void { setProperty("showFormat", value.toString()); };
		
		///////// showLength /////////////
		public function get showLength():Boolean { return getProperty("showLength") == "false" ? false : true; };
		public function set showLength(value:Boolean):void { setProperty("showLength", value.toString()); };
		
		///////// showThumbnail /////////////
		public function get showThumbnail():Boolean { return getProperty("showThumbnail") == "false" ? false : true; };
		public function set showThumbnail(value:Boolean):void { setProperty("showThumbnail", value.toString()); };
		
		///////// showTitle /////////////
		public function get showTitle():Boolean { return getProperty("showTitle") == "false" ? false : true; };
		public function set showTitle(value:Boolean):void { setProperty("showTitle", value.toString()); };
		
		///////// skinURL /////////////
		public function get skinUrl():String { return getProperty("skinUrl"); };
		public function set skinUrl(value:String):void { setProperty("skinUrl", value); };
		
		///////// thumbnailHeight /////////////
		public function get thumbnailHeight():Number { return Number(getProperty("thumbnailHeight")); };
		public function set thumbnailHeight(value:Number):void { setProperty("thumbnailHeight", value.toString()); };
		
		///////// thumbnailWidth /////////////
		public function get thumbnailWidth():Number { return Number(getProperty("thumbnailWidth")); };
		public function set thumbnailWidth(value:Number):void { setProperty("thumbnailWidth", value.toString()); };
		
		
		/////////// COLORS //////////////////
		//////////////////////////////////////
		
		///////// backgroundColor /////////////
		public function get backgroundColor():uint { return uint(getProperty("backgroundColor")); };
		public function set backgroundColor(value:uint):void { setProperty("backgroundColor", "0x" + value.toString(16)); };
		
		///////// frameColor /////////////
		public function get frameColor():uint { return uint(getProperty("frameColor")); };
		public function set frameColor(value:uint):void { setProperty("frameColor", "0x" + value.toString(16)); };
		
		///////// itemBackgroundColor /////////////
		public function get itemBackgroundColor():uint { return uint(getProperty("itemBackgroundColor")); };
		public function set itemBackgroundColor(value:uint):void { setProperty("itemBackgroundColor", "0x" + value.toString(16)); };
		
		///////// itemBackgroundHoverColor /////////////
		public function get itemBackgroundHoverColor():uint { return uint(getProperty("itemBackgroundHoverColor")); };
		public function set itemBackgroundHoverColor(value:uint):void { setProperty("itemBackgroundHoverColor", "0x" + value.toString(16)); };
		
		///////// itemBackgroundSelectedColor /////////////
		public function get itemBackgroundSelectedColor():uint { return uint(getProperty("itemBackgroundSelectedColor")); };
		public function set itemBackgroundSelectedColor(value:uint):void { setProperty("itemBackgroundSelectedColor", "0x" + value.toString(16)); };
		
		///////// itemFrameColor /////////////
		public function get itemFrameColor():uint { return uint(getProperty("itemFrameColor")); };
		public function set itemFrameColor(value:uint):void { setProperty("itemFrameColor", "0x" + value.toString(16)); };
		
		///////// itemShineColor /////////////
		public function get itemShineColor():uint { return uint(getProperty("itemShineColor")); };
		public function set itemShineColor(value:uint):void { setProperty("itemShineColor", "0x" + value.toString(16)); };
		
		///////// itemShineHoverColor /////////////
		public function get itemShineHoverColor():uint { return uint(getProperty("itemShineHoverColor")); };
		public function set itemShineHoverColor(value:uint):void { setProperty("itemShineHoverColor", "0x" + value.toString(16)); };
		
		///////// itemShineSelectedColor /////////////
		public function get itemShineSelectedColor():uint { return uint(getProperty("itemShineSelectedColor")); };
		public function set itemShineSelectedColor(value:uint):void { setProperty("itemShineSelectedColor", "0x" + value.toString(16)); };
		
		///////// pageBackgroundColor /////////////
		public function get pageBackgroundColor():uint { return uint(getProperty("pageBackgroundColor")); };
		public function set pageBackgroundColor(value:uint):void { setProperty("pageBackgroundColor", "0x" + value.toString(16)); };
		
		///////// textColor /////////////
		public function get textColor():uint { return uint(getProperty("textColor")); };
		public function set textColor(value:uint):void { setProperty("textColor", "0x" + value.toString(16)); };
		
		///////// textFrameColor /////////////
		public function get textFrameColor():uint { return uint(getProperty("textFrameColor")); };
		public function set textFrameColor(value:uint):void { setProperty("textFrameColor", "0x" + value.toString(16)); };
		
		///////// textHighlightHoverColor /////////////
		public function get textHighlightHoverColor():uint { return uint(getProperty("textHighlightHoverColor")); };
		public function set textHighlightHoverColor(value:uint):void { setProperty("textHighlightHoverColor", "0x" + value.toString(16)); };
		
		///////// textHighlightSelectedColor /////////////
		public function get textHighlightSelectedColor():uint { return uint(getProperty("textHighlightSelectedColor")); };
		public function set textHighlightSelectedColor(value:uint):void { setProperty("textHighlightSelectedColor", "0x" + value.toString(16)); };
		
		///////// textHoverColor /////////////
		public function get textHoverColor():uint { return uint(getProperty("textHoverColor")); };
		public function set textHoverColor(value:uint):void { setProperty("textHoverColor", "0x" + value.toString(16)); };
		
		///////// textSelectedColor /////////////
		public function get textSelectedColor():uint { return uint(getProperty("textSelectedColor")); };
		public function set textSelectedColor(value:uint):void { setProperty("textSelectedColor", "0x" + value.toString(16)); };
		
		///////// textBackgroundColor /////////////
		public function get textBackgroundColor():uint { return uint(getProperty("textBackgroundColor")); };
		public function set textBackgroundColor(value:uint):void { setProperty("textBackgroundColor", "0x" + value.toString(16)); };
		
		///////// thumbnailBackgroundColor /////////////
		public function get thumbnailBackgroundColor():uint { return uint(getProperty("thumbnailBackgroundColor")); };
		public function set thumbnailBackgroundColor(value:uint):void { setProperty("thumbnailBackgroundColor", "0x" + value.toString(16)); };
		
		///////// thumbnailFrameColor /////////////
		public function get thumbnailFrameColor():uint { return uint(getProperty("thumbnailFrameColor")); };
		public function set thumbnailFrameColor(value:uint):void { setProperty("thumbnailFrameColor", "0x" + value.toString(16)); };
		
		///////// thumbnailHighlightHoverColor /////////////
		public function get thumbnailHighlightHoverColor():uint { return uint(getProperty("thumbnailHighlightHoverColor")); };
		public function set thumbnailHighlightHoverColor(value:uint):void { setProperty("thumbnailHighlightHoverColor", "0x" + value.toString(16)); };
		
		///////// thumbnailHighlightSelectedColor /////////////
		public function get thumbnailHighlightSelectedColor():uint { return uint(getProperty("thumbnailHighlightSelectedColor")); };
		public function set thumbnailHighlightSelectedColor(value:uint):void { setProperty("thumbnailHighlightSelectedColor", "0x" + value.toString(16)); };
		
		///////// thumbnailPaddingColor /////////////
		public function get thumbnailPaddingColor():uint { return uint(getProperty("thumbnailPaddingColor")); };
		public function set thumbnailPaddingColor(value:uint):void { setProperty("thumbnailPaddingColor", "0x" + value.toString(16)); };
		
	}
}