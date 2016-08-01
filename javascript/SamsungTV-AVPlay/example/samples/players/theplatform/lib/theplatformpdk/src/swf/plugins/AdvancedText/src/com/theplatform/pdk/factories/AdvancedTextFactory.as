package com.theplatform.pdk.factories
{
	import flash.geom.Rectangle;
	import flash.text.TextField;
	import flash.text.TextFormat;
	import flash.text.engine.FontLookup;
	import flash.text.engine.FontPosture;
	import flash.text.engine.FontWeight;
	
	import flashx.textLayout.elements.ParagraphElement;
	import flashx.textLayout.elements.SpanElement;
	import flashx.textLayout.elements.TextFlow;
	import flashx.textLayout.factory.StringTextLineFactory;
	import flashx.textLayout.factory.TextFlowTextLineFactory;
	import flashx.textLayout.formats.BackgroundColor;
	import flashx.textLayout.formats.Direction;
	import flashx.textLayout.formats.ITextLayoutFormat;
	import flashx.textLayout.formats.TextAlign;
	import flashx.textLayout.formats.TextDecoration;
	import flashx.textLayout.formats.TextLayoutFormat;
	import flashx.textLayout.formats.VerticalAlign;
	
	public class AdvancedTextFactory
	{
		private var _stringTLFactory:StringTextLineFactory;
		private var _flowTLFactory:TextFlowTextLineFactory;
		private var _defaultTextFormat:TextLayoutFormat;
		
		public function AdvancedTextFactory()
		{
			init();
		}
		
		private function init():void
		{
			_stringTLFactory = new StringTextLineFactory();
			_flowTLFactory = new TextFlowTextLineFactory();
			_defaultTextFormat = new TextLayoutFormat();
			//set the values on the text format
			//get this from _controller at some point?
			_defaultTextFormat.backgroundColor = BackgroundColor.TRANSPARENT;//no background
			_defaultTextFormat.color = 0x000000;//default to black
			_defaultTextFormat.direction = Direction.LTR;
			_defaultTextFormat.fontFamily = "Arial,Helvetica,_sans";
			_defaultTextFormat.fontLookup = FontLookup.DEVICE;//default should be device
			_defaultTextFormat.fontSize = 12;
			_defaultTextFormat.fontStyle = FontPosture.NORMAL;
			_defaultTextFormat.fontWeight = FontWeight.NORMAL;
			_defaultTextFormat.lineHeight = "120%";
			_defaultTextFormat.lineThrough = false;
			_defaultTextFormat.locale = "en_US";
			_defaultTextFormat.paddingBottom = 0;
			_defaultTextFormat.paddingLeft = 0;
			_defaultTextFormat.paddingRight = 0;
			_defaultTextFormat.paddingTop = 0;
			_defaultTextFormat.textAlign = TextAlign.LEFT;
			_defaultTextFormat.textAlpha = 1;
			_defaultTextFormat.textDecoration = TextDecoration.NONE;
			_defaultTextFormat.verticalAlign = VerticalAlign.TOP;
		}
		
		public function getTextDisplay(textLayoutFormat:ITextLayoutFormat, text:String, bounds:Rectangle, callback:Function, multiline:Boolean = false):void
		{
			/*
			//TODO: switch between single line and flow
			if (multiline)
			{
				flowDisplay(textLayoutFormat, text, bounds, callback);
			}
			else
			{
				stringDisplay(textLayoutFormat, text, bounds, callback);
			}
			var tempTextFormat:TextLayoutFormat = new TextLayoutFormat();
			tempTextFormat.copy(_defaultTextFormat);
			tempTextFormat.apply(textLayoutFormat);
			tempTextFormat.paddingTop = 20;


			var textFlow:TextFlow = new TextFlow();

			// Create a controller given your sprite and bounding box.
			var containerController:ContainerController = new ContainerController(inputTextContainer,240,80);
			containerController.verticalAlign = flashx.textLayout.formats.VerticalAlign.TOP;
			textFlow.flowComposer.addController(containerController);

			var paragraphElement:ParagraphElement = new ParagraphElement();  

			var spanElementTarget:SpanElement = new SpanElement();
			spanElementTarget.text = text;
			paragraphElement.addChild(spanElementTarget);


			// Really? All this for just some underlined, padded, editable text?
			textFlow.hostFormat = textLayoutFormat;
			textFlow.interactionManager = new EditManager(new UndoManager());
			textFlow.addChild(paragraphElement)
			textFlow.flowComposer.updateAllControllers();

			callback();
			*/
		}

		private function stringDisplay(textLayoutFormat:ITextLayoutFormat, text:String, bounds:Rectangle, callback:Function):void
		{
			var tempTextFormat:TextLayoutFormat = new TextLayoutFormat();
			tempTextFormat.copy(_defaultTextFormat);
			tempTextFormat.apply(textLayoutFormat);
	
			_stringTLFactory.text = text;
			_stringTLFactory.compositionBounds = bounds;
			_stringTLFactory.spanFormat = tempTextFormat;
			_stringTLFactory.createTextLines(callback);
		}
		
		private function flowDisplay(textLayoutFormat:ITextLayoutFormat, text:String, bounds:Rectangle, callback:Function):void
		{
			var tempTextFormat:TextLayoutFormat = new TextLayoutFormat();
			tempTextFormat.copy(_defaultTextFormat);
			tempTextFormat.apply(textLayoutFormat);
			
			_flowTLFactory.compositionBounds = bounds;

			var flow:TextFlow = new TextFlow();
			var span:SpanElement = new SpanElement();
			span.text = text;
			span.format = tempTextFormat;
			
			var para:ParagraphElement = new ParagraphElement();
			para.addChild(span);
			flow.addChild(para);
			_flowTLFactory.createTextLines(callback, flow);
		}
		
		public function get defaultLayoutFormat():TextLayoutFormat
		{
			return _defaultTextFormat;
		}

	}
}
