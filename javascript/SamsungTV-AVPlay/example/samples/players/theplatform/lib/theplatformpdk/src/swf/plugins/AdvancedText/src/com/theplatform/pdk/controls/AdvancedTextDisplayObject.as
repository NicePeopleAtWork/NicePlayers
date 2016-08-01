package com.theplatform.pdk.controls
{
	import com.serialization.json.JSON;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controllers.ViewController;
	import com.theplatform.pdk.data.Padding;
	import com.theplatform.pdk.events.TextDisplayObjectSizeChange;
	import com.theplatform.pdk.factories.AdvancedTextFactoryInstance;
	import com.theplatform.pdk.styles.IStyleFactory;
	import com.theplatform.pdk.views.ITextDisplayObject;
	
	import flash.display.DisplayObject;
	import flash.display.MovieClip;
	import flash.display.Sprite;
import flash.filters.BevelFilter;
import flash.filters.BitmapFilter;
import flash.filters.BitmapFilterQuality;
import flash.filters.BitmapFilterType;
import flash.filters.DropShadowFilter;
	import flash.filters.GlowFilter;
	import flash.text.StyleSheet;
	import flash.text.TextFieldType;
	import flash.text.TextFormat;
	import flash.text.TextFormatAlign;
	import flash.text.engine.FontLookup;
	import flash.text.engine.FontPosture;
	import flash.text.engine.FontWeight;
	
	import flashx.textLayout.edit.EditingMode;
	import flashx.textLayout.formats.Direction;
	import flashx.textLayout.formats.TextAlign;
	import flashx.textLayout.formats.TextDecoration;
	import flashx.textLayout.formats.WhiteSpaceCollapse;
	

	public class AdvancedTextDisplayObject extends Sprite implements ITextDisplayObject
	{
		
		public static var TEXT_METRICS_PADDING:Padding = new Padding(4,1,2,2); // Tuned to match TextFields TextMetrics
		
		private var _debug:Boolean = false;
		
		private var _controller:IViewController;
		private var _textFieldId:String;
		private var _factory:AdvancedTextFactoryInstance;
		private var _styleFactory:IStyleFactory;
		private var _useHtml:Boolean = false;
		
		private var _text:String;
		private var _multiline:Boolean;
		private var _styleSheet:StyleSheet;
		
		// for TextLayoutFormat in HTML text
		private var _openingAnchorFormat:String;
		private var _anchorRegExp:RegExp = /<[a].*?>.*?<\/[a].*?>/gi;
		
		private var _explicitWidth:Number = NaN;
		private var _explicitHeight:Number = NaN;
		
		private var _factoryContainer:Sprite;
		
		private var _selectedColor:uint;
		private var _selectionColor:uint;
        private var _displayAsPassword:Boolean = false;

        private var _preferredFonts:Array;



		public function AdvancedTextDisplayObject(controller:IViewController, textFieldId:String, preferredFonts:Array = null, fontEnlarge:int = 0)
		{
			_controller = controller;
			_textFieldId = textFieldId;
			_factoryContainer = new Sprite();
			addChild(_factoryContainer);
            _preferredFonts = preferredFonts;
			_factory = new AdvancedTextFactoryInstance(_factoryContainer, _preferredFonts, fontEnlarge);
			//init();//init after styleFactory is hit
		}
		
		private function init():void
		{
			//get the values from the skin
			var skinAttributes:Object = _controller.getTextFieldAttributes(_textFieldId); // Display Manager
			if(skinAttributes)
			{

                if (_preferredFonts&&skinAttributes.textFormat)
                    skinAttributes.textFormat.font = _preferredFonts.join(",");

				if(_controller is ViewController) // not exposing styleFactory calls in IViewController?
					ViewController(_controller).setPreferredStyle(this, skinAttributes);
			}
			else
			{
				if(_controller is ViewController)
					ViewController(_controller).setDefaultStyle(this);
			}
			var ss:StyleSheet = this._styleSheet;
			if (ss)
			{

				_factory.styleSheet = ss;
				
				//set the other values as fallback, in case it isn't html
				
				var styleDeclaration:Object = ss.getStyle(textFieldId.toLowerCase());

                //if they specified preferred fonts, favor them over the skin
				fontName = _preferredFonts ? _preferredFonts.join(",") : styleDeclaration.fontFamily;
				align = styleDeclaration.textAlign;
				leading = styleDeclaration.leading;
				fontSize = styleDeclaration.fontSize;
				if (styleDeclaration.color is String)
				{
					var col:uint = uint(styleDeclaration.color.replace("#", "0x"));
					fontColor = col;	
				}
				
				//styleDeclaration.letterSpacing = textFormat.letterSpacing;
				//styleDeclaration.kerning = textFormat.kerning;
				_factory.fontWeight = styleDeclaration.fontWeight;
				_factory.fontStyle = styleDeclaration.fontStyle;
				leftMargin = styleDeclaration.marginLeft;
				rightMargin = styleDeclaration.marginRight; 
				//styleDeclaration.textIndent = textFormat.indent;
				
				//styleDeclaration.antiAliasType = skinAttributes.antiAliasType;
				//styleDeclaration.thickness = skinAttributes.thickness;
				//styleDeclaration.sharpness = skinAttributes.sharpness;
				//styleDeclaration.gridFitType = skinAttributes.gridFitType;
			}
			else if (skinAttributes)
			{
				var textFormat:TextFormat = skinAttributes.textFormat;
				if(textFormat != null)
				{

                    //prefer the loadvars fonts to the skin's
					fontName = _preferredFonts ? _preferredFonts.join(",") : textFormat.font;
					//needed in tlf?
					//skinAttributes.antiAliasType;
					//skinAttributes.thickness;
					//skinAttributes.sharpness;
					//skinAttributes.gridFitType;
					_factory.fontWeight = textFormat.bold ? FontWeight.BOLD : FontWeight.NORMAL;
					if (textFormat.align) _factory.textAlign = textFormat.align;//TODO: any translation between old and new values?
					_factory.fontStyle = textFormat.italic ? FontPosture.ITALIC : FontPosture.NORMAL;
					fontSize = Number(textFormat.size);
					//textFormat.kerning;
					//textFormat.leading;
					_factory.textDecoration = textFormat.underline ? TextDecoration.UNDERLINE : TextDecoration.NONE;
					//etc.
				}
			}
			
			
			var skin:DisplayObject = _controller.getAsset(_textFieldId);
			if (skin)
			{
				var skinProperties:Object = _controller.getSkinProperties(skin as MovieClip);
				if (skinProperties)
				{
					var styles:String = skinProperties.textStyle;
					if (styles)
					{
						addStyle(com.serialization.json.JSON.deserialize(styles));
					}
				}
			}

		}


		
		protected function layout():void
		{
			if (!isNaN(_explicitHeight))
				_factory.height = _explicitHeight - TEXT_METRICS_PADDING.top - TEXT_METRICS_PADDING.bottom;
			
			if (!isNaN(_explicitWidth))
				_factory.width = _explicitWidth - TEXT_METRICS_PADDING.left - TEXT_METRICS_PADDING.right;
			
			_factoryContainer.x = TEXT_METRICS_PADDING.left;
			_factoryContainer.y = TEXT_METRICS_PADDING.top;
			
			graphics.clear();
			
			if (_debug)
				graphics.beginFill(0xFF0000, .5);
			else
				graphics.beginFill(0xFF0000, 0);
			
			graphics.drawRect(0,0, Math.ceil(_factoryContainer.width) + TEXT_METRICS_PADDING.left + TEXT_METRICS_PADDING.right, Math.ceil(_factoryContainer.height) + TEXT_METRICS_PADDING.top + TEXT_METRICS_PADDING.bottom);
		
		}

		public function setFocus():void
		{
			_factory.setFocus();
		}

		
		////// PROPERTIES ///////////

		
		public function set align(value:String):void
		{
			switch (value)
			{
				case TextFormatAlign.CENTER:
					value = TextAlign.CENTER;
					break;
				case TextFormatAlign.JUSTIFY:
					value = TextAlign.JUSTIFY;
					break;
				case TextFormatAlign.LEFT:
					value = TextAlign.LEFT;
					break;
				case TextFormatAlign.RIGHT:
					value = TextAlign.RIGHT;
					break;
			}
			_factory.textAlign = value;
		}
		public function get align():String
		{
			var align:String = _factory.textAlign;
			if(align == TextAlign.START) 
			{
				// This tells components which alignment we have. 
				// "start" isn't quite descriptive enough if we don't know "direction" 
				align = _factory.direction == Direction.RTL ? TextAlign.RIGHT : TextAlign.LEFT;
			}
			return align;
		}
		
		public function set alwaysShowSelection(value:Boolean):void
		{
			//TODO: how implement in tlf?
		}
		public function get alwaysShowSelection():Boolean
		{
			return false;
		}
		
		public function set autoSize(value:String):void
		{
			//TODO: is this relevant any more?
		}
		public function get autoSize():String
		{
			return null;
		}
		
		public function set backgroundColor(value:uint):void
		{
			//TODO: implement
		}
		public function get backgroundColor():uint
		{
			return 0;
		}

		public function set borderColor(value:uint):void
		{
			//TODO: implement?
		}

		public function set background(value:Boolean):void
		{
			//TODO: implement?
		}
		public function get background():Boolean
		{
			//TODO: implement?
			return false;
		}
		
		public function set condenseWhite(value:Boolean):void
		{
			var valStr:String = WhiteSpaceCollapse.PRESERVE;
			if (value)
			{
				valStr = WhiteSpaceCollapse.COLLAPSE;
			}
			_factory.whiteSpaceCollapse = valStr;
		}
		public function get condenseWhite():Boolean
		{
			return _factory.whiteSpaceCollapse != WhiteSpaceCollapse.COLLAPSE ? false : true;
		}
		/* //just use the sprite's filters array
		override public function set filters(value:Array):void
		{
			_filters = value;
			for each(var tl:TextLine in _textLines)
			{
				tl.filters = _filters;//TODO: make sure this works with text itself rather than text bg
			}
		}
		override public function get filters():Array
		{
			return _filters;
		} */
		
		public function set embedFonts(value:Boolean):void
		{
			var valStr:String = FontLookup.DEVICE;
			if (value)
			{
				valStr = FontLookup.EMBEDDED_CFF;
			}
			_factory.fontLookup = valStr;
		}
		public function get embedFonts():Boolean
		{
			return _factory.fontLookup != FontLookup.DEVICE ? true : false;
		}
		
		public function set fontColor(value:uint):void
		{
			_factory.color = value;
		}
		public function get fontColor():uint
		{
			return _factory.color;
		}
		
		public function set selectionColor(value:uint):void
		{
			_selectionColor = value;
		}
		
		public function get selectionColor():uint
		{
			return _selectionColor;
		}
		
		public function set selectedColor(value:uint):void
		{
			_selectedColor = value;
		}
		
		public function get selectedColor():uint
		{
			return _selectedColor;
		}
		
		public function set fontName(value:String):void
		{
			_factory.fontFamily = value;
		}
		public function get fontName():String
		{
			return _factory.fontFamily;
		}
		
		public function set fontSize(value:Number):void
		{
			_factory.fontSize = value;
		}
		public function get fontSize():Number
		{
			return _factory.fontSize;
		}
		
		override public function set height(value:Number):void
		{
			_explicitHeight = value
			layout();
			
		//	_factory.height = value;
		}
		/* override public function get height():Number
		{
			return _factory.height;
		} */
		
		public function set htmlText(value:String):void
		{
			// replace carriage returns and newlines with break tags
			value = value.replace(/(\r\n)|(\n)/g, "<br/>");

			_factory.useHtml = true;
			_text = value;

			// apply inline styling markup where/if necessary 
			applyInlineMarkup();
			
			if(_text.search(/<html.*?>/i) == -1)
			{
				// Don't let wrapper TextFlows stack up
				if(value.indexOf("<TextFlow xmlns") < 0)
					_text = "<TextFlow xmlns=\"http://ns.adobe.com/textLayout/2008\">" + _text + "</TextFlow>";
			}
			
			_factory.text = _text;
			layout();
			
			var event:TextDisplayObjectSizeChange = new TextDisplayObjectSizeChange(this, this.width, this.height, true, false);
			dispatchEvent(event);
		}

		public function get htmlText():String
		{
			if (_useHtml)
			{
				return _factory.text;
			}
			return "";
		}
		
		public function get leading():Number
		{
			//TODO: not sure how to convert this right now
			return 0;
		}
		public function set leading(value:Number):void
		{
		}
		
		public function get length():int
		{
			//get the number of characters...
			return _text ? _text.length : 0;
		}
		
		public function get lineHeight():Number
		{
			return _factory.lineHeight;
		}
		
		public function get gutter():Number
		{
			return 0; // should not have a gutter in new text (the 5 px fudge on legacy textfield that is added to textHeight)
		}
		
		public function set multiline(value:Boolean):void
		{
			_multiline = value;
			_factory.multiline = _multiline;
		}
		public function get multiline():Boolean
		{
			return _multiline;
		}
		
		public function get numLines():int
		{
			//TODO: only relevant in flow system
			return _factory.numLines;
		}
		
		public function set selectable(value:Boolean):void
		{
			if (value && _factory.editMode == EditingMode.READ_ONLY)
			{
				_factory.editMode = EditingMode.READ_SELECT;//set to selectable only if it's in readonly, we don't want to take off editing capabilities
			}
			else if (!value)
			{
				_factory.editMode = EditingMode.READ_ONLY;
			}
		}
		public function get selectable():Boolean
		{
			return _factory.editMode == EditingMode.READ_ONLY ? false : true;
		}
		
		public function get styleFactory():IStyleFactory
		{
			return _styleFactory;
		}
		public function set styleFactory(value:IStyleFactory):void
		{
			_styleFactory = value;
			init();
		}
		
		public function set text(value:String):void
		{
			_text = value;
			_useHtml = false;
			_factory.text = _text;
			
			layout();
			
			var event:TextDisplayObjectSizeChange = new TextDisplayObjectSizeChange(this, this.width, this.height, true, false);
			dispatchEvent(event);
		}
		public function get text():String
		{
			if (!_useHtml)
			{
				return _factory.text;
			}
			return "";
		}
		
		public function get textFieldId():String
		{
			return _textFieldId;
		}
		
		
		public function get textHeight():Number
		{
			//TODO: figure this out with scrolling
			return _factory.textHeight + TEXT_METRICS_PADDING.top + TEXT_METRICS_PADDING.bottom;

		}
		
		public function get textWidth():Number
		{
			return _factory.textWidth + TEXT_METRICS_PADDING.left+ TEXT_METRICS_PADDING.right;
		}
		
		//input or dynamic TODO: how switch between the two?
		public function get type():String
		{
			return _factory.editMode == EditingMode.READ_WRITE ? TextFieldType.INPUT : TextFieldType.DYNAMIC;
		}
		public function set type(value:String):void
		{
			if (value == TextFieldType.INPUT)
			{
				_factory.editMode = EditingMode.READ_WRITE;
			}
			else if (value == TextFieldType.DYNAMIC)
			{
				if (selectable)
				{
					_factory.editMode = EditingMode.READ_SELECT;
				}
				else
				{
					_factory.editMode = EditingMode.READ_ONLY;
				}
			}
			//else ignore, this is invalid input
		}
		
		public function set underline(value:Boolean):void
		{
			var valStr:String = TextDecoration.NONE;
			if (value)
			{
				valStr = TextDecoration.UNDERLINE;
			}
			_factory.textDecoration = valStr;
		}
		public function get underline():Boolean
		{
			return _factory.textDecoration != TextDecoration.UNDERLINE ? false : true;
		}
		
		public function set useDefaultFont(value:Boolean):void
		{
			// no-op: shouldn't need this for advanced, only for legacy
		}
		public function get useDefaultFont():Boolean
		{
			return false;
		}
		
		public function get fragments():Object
		{
			// no-op: only for legacy
			return null;
		}
		
		public function set fragment(value:String):void
		{
			// no-op: only for legacy
		}
		
		override public function set width(value:Number):void
		{
			_explicitWidth = value;
			layout();
			//_factory.width = value;//hard code this in there for now
		}
		/* override public function get width():Number
		{
			return _factory.width;
		} */
		
		public function set wordWrap(value:Boolean):void
		{
			_factory.multiline = value;
		}
		public function get wordWrap():Boolean
		{
			return _factory.multiline;
		}
		
		
		public function get leftMargin():Number
		{
			return _factory.paddingLeft;
		}
		public function set leftMargin(value:Number):void
		{
			_factory.paddingLeft = value;
		}
		
		public function get rightMargin():Number
		{
			return _factory.paddingRight;
		}
		public function set rightMargin(value:Number):void
		{
			_factory.paddingRight = value;
		}
		
		public function get styleSheet():StyleSheet
		{
			return _factory.styleSheet ? _factory.styleSheet : _styleSheet;
		}
		public function set styleSheet(value:StyleSheet):void
		{
			_styleSheet = value;
			_openingAnchorFormat = null;
			
			if(_text && _factory.useHtml)
			{
				applyInlineMarkup();				
				if (_text != _factory.text)
				{
					_factory.text = _text;
				}
			}
			_factory.styleSheet = value;
		}
		
		public function get textFormat():TextFormat
		{
			return null;
		}
		public function set textFormat(value:TextFormat):void
		{
			//
		}
		
		//
		// @see flash.text.TextField specific properties
		public function set antiAliasType(value:String):void
		{
			// not a player 10 text property
		}
		public function get antiAliasType():String
		{
			return null;
		}
		public function set thickness(value:Number):void
		{
			// not a player 10 text property...that i know of
		}
		public function get thickness():Number
		{
			return NaN;
		}
		public function set sharpness(value:Number):void
		{
			// not a player 10 text property
		}
		public function get sharpness():Number
		{
			return NaN;
		}
		public function set gridFitType(value:String):void
		{
			// not a player 10 text property
		}
		public function get gridFitType():String
		{
			return null;
		}
		
		public function get scrollV():int
		{
			return _factory.scrollV;
		}

		public function set scrollV(value:int):void
		{
			_factory.scrollV = value;
		}
		
		public function get maxScrollV():int
		{
			return _factory.maxScrollV;
		}

		public function get bottomScrollV():int
		{
			return _factory.bottomScrollV;
		}
		
		public function set truncateToFit(value:Boolean):void
		{		
			// set truncationOptions
			_factory.truncateToFit = value;
		}
		public function get truncateToFit():Boolean
		{
			return _factory.truncateToFit;
		}
		
		/////// functions /////////
		
		public function addStyle(json:Object):void
		{

			var stylesObject:Object = {};
			stylesObject.filters = createFilters(json);

			filters = null;
            if (stylesObject.filters)
            {
                filters = stylesObject.filters;
            }

		}


        protected function createFilters(stylesObject:Object):Array
        {
            var filters:Array = [];
            for each (var filter:Object in stylesObject)
            {
                if (filter.type == "shadow")
                {
                    filters.push(createDropshadow(filter));
                }
                if(filter.type == "outline")
                {
                    filters.push(createOutlineFilter(filter));
                }
                if(filter.type == "depressed")
                {
                    filters.push(createDepressedOutline(filter));
                }
                if(filter.type == "raised")
                {
                    filters.push(createRaisedOutline(filter));
                }

            }
            return filters;
        }

        protected function createRaisedOutline(shadowObject:Object):BitmapFilter
        {
            var bitmapFilter:BevelFilter = new BevelFilter();
            var defaults:Object =
                {shadowColor:0x404040,
                shadowAlpha:1,
                highlightColor:0xC0C0C0,
                highlightAlpha:1,
                blurX:1,
                blurY:1,
                strength:10,
                quality:BitmapFilterQuality.MEDIUM,
                distance:1,
                angle:45,
                knockout:false,
                type:"outer"};

            bitmapFilter = setFilterValues(shadowObject, defaults, bitmapFilter) as BevelFilter;
            bitmapFilter.type = BitmapFilterType.OUTER;//for some reason, type needs to be set directly, or it goes to "full"
            return bitmapFilter;
        }


        protected function createDepressedOutline(shadowObject:Object):BitmapFilter
        {
            var bitmapFilter:BevelFilter = new BevelFilter();
            var defaults:Object =
                {shadowColor:0x404040,
                shadowAlpha:1,
                highlightColor:0xC0C0C0,
                highlightAlpha:1,
                blurX:1,
                blurY:1,
                strength:10,
                quality:BitmapFilterQuality.MEDIUM,
                distance:1,
                angle:225,
                knockout:false,
                type:"outer"};
            bitmapFilter = setFilterValues(shadowObject, defaults, bitmapFilter) as BevelFilter;
            bitmapFilter.type = BitmapFilterType.OUTER;
            return bitmapFilter;
        }



        protected function createDropshadow(shadowObject:Object):BitmapFilter
        {
            var bitmapFilter:DropShadowFilter = new DropShadowFilter();
            var defaults:Object =
                {color:0x000000,
                alpha:1,
                blurX:2,
                blurY:2,
                strength:10,
                quality:BitmapFilterQuality.LOW,
                distance:2};

            return setFilterValues(shadowObject, defaults, bitmapFilter);
        }

        protected function createOutlineFilter(outlineParams:Object):BitmapFilter
        {
            var bitmapFilter:GlowFilter = new GlowFilter();
            var defaults:Object =
                {color: 0x000000,
                alpha: 1,
                blurX: 3,
                blurY: 3,
                strength: 20,
                quality: BitmapFilterQuality.LOW,
                inner: false,
                knockout: false };

            return setFilterValues(outlineParams, defaults, bitmapFilter);
        }

        protected function setFilterValues(overrides:Object, defaults:Object, bitmapFiler:BitmapFilter):BitmapFilter
        {
            // replace flashvar name with its corresponding color
            // or just leave it alone if its actually a hard coded color
            replaceColor(overrides, "color");
            replaceColor(overrides, "highlightColor");
            replaceColor(overrides, "shadowColor");

            for( var param:String in defaults) {
                bitmapFiler[param] = overrides.hasOwnProperty(param)? overrides[param] : defaults[param];
            }

            return bitmapFiler;
        }

        private function replaceColor(props:Object, colorProperty:String):void
        {
            if (props.hasOwnProperty(colorProperty) && props[colorProperty] is String)
            {
                props[colorProperty] = _controller.getColorFromString(props[colorProperty]);
            }
        }

		
		public function disableBorder(disable:Boolean = true):void
		{
			//TODO: will we have to make a graphics object for a border?
		}
		
		public function appendText(newText:String):void
		{
			_text += newText;
			_factory.text = _text;
		}
		
				
		public function setSelection(startIndex:Number, endIndex:Number):void
		{
			_factory.setSelection(startIndex, endIndex);
		}

		public function normalize():void
		{
			layout();
		}
		
		public function destroy():void
		{
			if (_factory)
			{
				_factory.destroy();
				_factory = null;
			}
		}
		
		public function styleChanged():void
		{
			// do something here to notify this guy to update with new styles

//            if (_preferredFonts)
//                _styleSheet.setStyle()

			_factory.refresh();
			//-dns this should happen whenever the styleSheet object is set
		}
		
		
		////////////////////////////////////////////////////////////
		// for TextLayoutFormat markup generation                 //
		////////////////////////////////////////////////////////////
		
		private function applyInlineMarkup():void
		{
			if(_text.search(/<html.*?>/i) == -1)
			{
				//take out <p> tags that don't have classes and replace with a <br>, they're messing up the styling
				_text = _text.replace(/<p>(.*?)<\/p>/gi, "$1<br/>");
				
				if(_text.search(/^(<span)|(<textflow)|(<p[^>]+)|(<div)/i) == -1)
				{
					// Wrap html text in a span if we are not already wrapping in another html "container" tag (ie p or div or span).
					// The <textflow> check is there to let us know if this text has already come through here. 
					// This is necessary to get html to show up properly (ie <b>, <u>, <i>);
					_text = "<span>" + _text + "</span>";
				}
				
				//handle splitting the spans around the a tag
				_text = _text.replace(/<span(.*?)>(.*?)<\/span>/gi, parseSpanContents);
				//handle adding formatting info to the link
				_text = _text.replace(_anchorRegExp, replaceLinkMarkup);
				
				
				//_text = _text.replace(/(<p>).*?(<\/p>)/gi, 
				//_text = _text.replace(/<[a-z]>/gi, replaceSelectorMarkup);
			}
		}
		
		/*private function replaceSelectorMarkup():String
		{
			var wholeTag:String = arguments[0];
			var matchArray:Array = wholeTag.match(/[a-z0-9]+/i);
			var tagType:String = matchArray[0];
			var tagClassMatchArray:Array = wholeTag.match(/(class)\=\"[a-z0-9_]*\"/i);
			var tagClass:String;
			if(tagClassMatchArray && tagClassMatchArray.length > 0)
			{			
				tagClass = String(tagClassMatchArray[0]).replace("class=", "").replace(/\u0022+/g,"");
			}
			var selector:String = tagClass ? tagClass : tagType;
			var ret:String = "<"+tagType+" "+createInlineStyleFromSelector(selector)+" >";
			return ret;
		}*/
		
		/*private function findSelector(source:String):String
		{
			var tagClassMatchArray:Array = source.match(/(class)\=(\u0022|\u0027)([a-z0-9_]*)(\u0022|\u0027)/i);
			var tagClass:String = "";
			if(tagClassMatchArray && tagClassMatchArray.length > 0)
			{			
				tagClass = String(tagClassMatchArray[0]).replace("class=", "").replace(/(\u0022|\u0027)+/g,""); //replace(/\u0022+/g,"");
			}
			return tagClass;
		}*/
		
		/*private function replaceParagraphMarkup():String
		{
			var ret:String = arguments[0];
			var inlineStyle:String = createInlineStyleFromSelector("p");
			return "<p " + inlineStyle + ">";
		}*/
		
		/*private function createInlineStyleFromSelector(selector:String):String
		{
			var inlineStyle:String = "";
			if(!_factory.styleSheet || selector == "") 
			{
				return inlineStyle;
			}
			
			var styleObj:Object = _factory.styleSheet.getStyle("."+selector);
			for(var style:String in styleObj)
			{
				inlineStyle += style + "=\"" + styleObj[style] + "\" ";
			}
			return inlineStyle;
		}*/
		
		/**
		 * Because the span elements in the TLF, according to the docs, 
		 * ignore all tags within them (except <br> and <tab>), 
		 * we must account for tags we want to display. Otherwise they
		 * just get stripped out.
		 */
		private function parseSpanContents():String
        {
            var span_attribs:String = arguments[1];
            var span_contents:String = arguments[2];

			// links: a
            span_contents = span_contents.replace(/<a (.*?)>/gi, "<\/span><a $1>");
            span_contents = span_contents.replace(/<\/a>/gi, "<\/a><span" + span_attribs+ ">");

			//var selector:String = findSelector(span_attribs);
			//var classStyles:String = createInlineStyleFromSelector(selector);
			
			// bold: b
			span_contents = span_contents.replace(/<b>/gi, "<\/span><span " + span_attribs + " fontWeight=\"bold\">");
            span_contents = span_contents.replace(/<\/b>/gi, "<\/span><span" + span_attribs + ">");
            
            // italic: i
			span_contents = span_contents.replace(/<i>/gi, "<\/span><span " + span_attribs + " fontStyle=\"italic\">");
            span_contents = span_contents.replace(/<\/i>/gi, "<\/span><span" + span_attribs + ">");
            
            // underline : u
			span_contents = span_contents.replace(/<u>/gi, "<\/span><span " + span_attribs + " textDecoration=\"underline\">");
            span_contents = span_contents.replace(/<\/u>/gi, "<\/span><span" + span_attribs + ">");

			// stray < or >, but not as a complete tag
			var strayLessThanExp:RegExp = /(<)([^<^>]*)($|<)/g;
			var strayGreaterThanExp:RegExp = /(^|>)([^<^>]*)(>)/g;
			var matches:Array = span_contents.match(strayLessThanExp);
			while(matches.length > 0)
			{
				span_contents = span_contents.replace(strayLessThanExp, replaceStrayLessThan);
				matches = span_contents.match(strayLessThanExp);
			}
			matches = span_contents.match(strayGreaterThanExp);
			while(matches.length > 0)
			{
				span_contents = span_contents.replace(strayGreaterThanExp, replaceStrayGreaterThan);
				matches = span_contents.match(strayGreaterThanExp);
			}
			
			
			
			//span_contents = span_contents.replace(/</g, "&lt;");
			//span_contents = span_contents.replace(/>/g, "&gt;");

            return "<span" + span_attribs + ">" + span_contents + "</span>";
        }
		
		private function replaceStrayLessThan():String
		{
			return "&lt;" + arguments[0].slice(1, arguments[0].length);
		}
		private function replaceStrayGreaterThan():String
		{
			return arguments[0].slice(0, arguments[0].length-1) + "&gt;";
		}
		
		private function replaceLinkMarkup():String
		{
			var args:Object = arguments;
			var ret:String = arguments[0];
			ret = ret.replace(/>(.*?)</, applyAnchorFormat);
			//ret = ret.replace(/<\/a(.*?)>/i, applyClosingAnchorFormat);
			return ret;
		}
		
		private function applyAnchorFormat():String
		{
			if(!_openingAnchorFormat)
			{
				createOpeningAnchorFormat();
			}
			var ret:String = arguments[0];
			ret = ret.replace("<", "</span>" + "<");
			ret = ret.replace(">", ">" + _openingAnchorFormat);
			return ret;
			//return arguments[0] + openingAnchorFormat;
		}
		
		private function createOpeningAnchorFormat():void
		{
			_openingAnchorFormat = "";
			if(!_styleSheet)
			{
				return;
			}
			
			// link active format
			_openingAnchorFormat += "<linkActiveFormat><TextLayoutFormat ";
			var activeStyle:Object = _styleSheet.getStyle("a");
			for(var style:String in activeStyle)
			{
				_openingAnchorFormat += style + "=\"" + activeStyle[style] + "\" ";
			}
			_openingAnchorFormat += "/></linkActiveFormat>";
			
			// link active format
			_openingAnchorFormat += "<linkHoverFormat><TextLayoutFormat ";
			var hoverStyle:Object = _styleSheet.getStyle("a:hover");
			for(var style2:String in hoverStyle)
			{
				_openingAnchorFormat += style2 + "=\"" + hoverStyle[style2] + "\" ";
			}
			_openingAnchorFormat += "/></linkHoverFormat>";
			
			// link active format
			_openingAnchorFormat += "<linkNormalFormat><TextLayoutFormat ";
			var normalStyle:Object = _styleSheet.getStyle("a");
			for(var style3:String in normalStyle)
			{
				_openingAnchorFormat += style3 + "=\"" + normalStyle[style3] + "\" ";
			}
			_openingAnchorFormat += "/></linkNormalFormat>";
			
			_openingAnchorFormat += "<span>";
		}

		
		
		public function get isRightToLeft():Boolean
		{
			return (_factory.isRightToLeft == Direction.RTL);
		}
		
		public function set textDirection(value:String):void
		{
			if (value == _factory.textDirection)
				return;
			
			_factory.textDirection = value;
		}
		public function get textDirection():String
		{
			return _factory.textDirection;
		}

        public function set displayAsPassword(value:Boolean):void
        {
            _displayAsPassword = value;
//			if (_textField)
//			{
//				_textField.displayAsPassword = _displayAsPassword;
//			}

        }

        public function get displayAsPassword():Boolean
        {

//            if (_textField)
//			{
//				return _textField.displayAsPassword;
//			}
			return _displayAsPassword;


        }

	}
}
