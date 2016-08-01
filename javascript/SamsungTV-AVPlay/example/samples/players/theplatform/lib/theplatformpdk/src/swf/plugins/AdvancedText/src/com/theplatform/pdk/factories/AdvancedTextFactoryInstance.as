package com.theplatform.pdk.factories
{

import com.theplatform.pdk.data.TextDirection;
import com.theplatform.pdk.utils.BiDiCheckUtility;

import flash.display.Graphics;
import flash.display.Sprite;
import flash.errors.IllegalOperationError;
import flash.events.Event;
import flash.events.EventDispatcher;
import flash.geom.Rectangle;
import flash.text.Font;
import flash.text.FontType;
import flash.text.StyleSheet;
import flash.text.engine.BreakOpportunity;
import flash.text.engine.FontLookup;
import flash.text.engine.FontPosture;
import flash.text.engine.FontWeight;
import flash.text.engine.TextBaseline;
import flash.text.engine.TextLine;

import flashx.textLayout.compose.IFlowComposer;
import flashx.textLayout.compose.StandardFlowComposer;
import flashx.textLayout.compose.TextFlowLine;
import flashx.textLayout.container.ContainerController;
import flashx.textLayout.container.ScrollPolicy;
import flashx.textLayout.conversion.TextConverter;
import flashx.textLayout.edit.EditManager;
import flashx.textLayout.edit.EditingMode;
import flashx.textLayout.edit.ISelectionManager;
import flashx.textLayout.edit.SelectionFormat;
import flashx.textLayout.edit.SelectionManager;
import flashx.textLayout.elements.Configuration;
import flashx.textLayout.elements.FlowGroupElement;
import flashx.textLayout.elements.IFormatResolver;
import flashx.textLayout.elements.ParagraphElement;
import flashx.textLayout.elements.SpanElement;
import flashx.textLayout.elements.TextFlow;
import flashx.textLayout.events.CompositionCompleteEvent;
import flashx.textLayout.events.DamageEvent;
import flashx.textLayout.events.FlowOperationEvent;
import flashx.textLayout.events.TextLayoutEvent;
import flashx.textLayout.events.UpdateCompleteEvent;
import flashx.textLayout.formats.BackgroundColor;
import flashx.textLayout.formats.Direction;
import flashx.textLayout.formats.LineBreak;
import flashx.textLayout.formats.TextAlign;
import flashx.textLayout.formats.TextDecoration;
import flashx.textLayout.formats.TextLayoutFormat;
import flashx.textLayout.formats.VerticalAlign;

import flash.utils.Timer;
import flash.events.TimerEvent;

public class AdvancedTextFactoryInstance extends EventDispatcher
{

    public static const LANGUAGE_MAPPING:Array = [{font:"Microsoft Himalaya", range:[0x0F00, 0x0FFF]},
                                                   {font:"Zawgyi-One", range:[0x1000, 0x104F]}]


    private var _debug:Boolean = false;

    private var _textFieldId:String;
    private var _text:String = "";
    private var _useHtml:Boolean = false;
    private var _multiline:Boolean = false;
    private var _container:Sprite; //the containing AdvancedTextDisplayObject
    private var _containerText:Sprite; //holds the actual text
    private var _editMode:String = EditingMode.READ_ONLY;

    //private var _editManager:EditManager = null; // moved to getter
    //private var _containerController:ContainerController = null; // moved to getter
    //text flow
    private var _textFlow:TextFlow = null;

    private var _layoutFormat:TextLayoutFormat = new TextLayoutFormat();

    private var _requestedWidth:Number = NaN;
    private var _requestedHeight:Number = NaN;

    private var _realTextSize:Rectangle = new Rectangle(0, 0, 0, 0);

    private var _formatResolver:IFormatResolver;
    private var _styleSheet:StyleSheet;
    private var _truncateToFit:Boolean = false;

    private var _internalVScrollPosition:int = 1;
    private var _cachedLineHeight:Number = 0;
    private var _untruncatedTextHeight:Number = 0;
    private var _cachedNumLines:Number = 0;
    private var _cachedNumLinesInWindow:Number = 0;

    //default to true, so we ignore size unless fontEnlarge is there
    private var _fontIncremented:Boolean = true;

    private var _fontEnlarge:int = 0;

    //private var _isRightToLeft:Boolean = false;

    private var _textDirection:String = TextDirection.AUTO;

    public function AdvancedTextFactoryInstance(container:Sprite, preferredFonts:Array = null, fontEnlarge:int = 0)
    {
        _layoutFormat.apply(createDefaultTextLayoutFormat());

        if (preferredFonts)
        {
            _layoutFormat.fontFamily = preferredFonts.join(",");
        }

        if (fontEnlarge>0)
        {
            _fontEnlarge = fontEnlarge;
            _fontIncremented = false;
        }

        _container = container;
        _containerText = new Sprite();

        //	_containerSpacer = new Sprite();
        //	_container.addChild(_containerSpacer);

        _container.addChild(_containerText);
    }

    protected function get defaultContainerController():ContainerController
    {
        if (!_textFlow)
        {
            new IllegalOperationError("no text flow set");
            return null
        }
        /*
         _textFlow.flowComposer.getControllerAt(0).container.graphics.clear()
         _textFlow.flowComposer.getControllerAt(0).container.graphics.beginFill(0x0000ff,.8);
         _textFlow.flowComposer.getControllerAt(0).container.graphics.drawRect(0,0,width, height);
         */

        return _textFlow.flowComposer.getControllerAt(0);
    }

    protected function doSetText(text:String):void
    {

        _textFlow.interactionManager = editManager;
        EditManager(_textFlow.interactionManager).selectAll();
        EditManager(_textFlow.interactionManager).insertText(text);
        _textFlow.invalidateAllFormats();
        _textFlow.direction = _layoutFormat.direction;
        _textFlow.textAlign = _layoutFormat.textAlign;
        // reset the interaction manager back to what it was
        //_textFlow.interactionManager = null;
    }

    protected function resetTextFlow():void
    {
        _container.removeChild(_containerText);
        _containerText = new Sprite();
        _container.addChild(_containerText);
        _textFlow.flowComposer.removeAllControllers();
        for (var i:int = 0; i < _textFlow.numChildren; i++)
        {
            //_textFlow.removeChildAt(0);
        }
        removeFlowEventListeners(_textFlow);
        _textFlow = null;
    }

    private function updateText(force_rebuild:Boolean = false):void
    {
        updateLayoutFormatDirection();

        // TODO: better reset
        // SelectionManager check: b/c you can't replace text on a SelectionManager. If you have new text, then destroy this
        // textFlow and start fresh.
        if (_textFlow !== null && (_useHtml || force_rebuild))
        {
            resetTextFlow();
        }

        //this will force it to use MS-Himalaya if there's tibetan text in the string
        //might want a loadvar for whether to even bother with this
        changeFontIfForeign(_text);


        if (_textFlow == null)
        {
            var config:Configuration = createConfig(_multiline, _layoutFormat);
            _textFlow = createFlow(_useHtml, config, _text);
            createContainerController(_containerText, multiline);
            _textFlow.interactionManager = createInteractionManager(_editMode);
        }
        else
        {

            if (_textNeedsReset)
            {
                doSetText(_text);
                //_textFlow.interactionManager = createInteractionManager(_editMode);
            }

        }

        if (_truncateToFit && !isNaN(_requestedHeight) && _realTextSize.height > _requestedHeight)
        {
            defaultContainerController.verticalScrollPolicy = ScrollPolicy.OFF;
        }

        if (_formatResolver && _useHtml)
        {

            _textFlow.formatResolver = _formatResolver;
            _textFlow.invalidateAllFormats();
        }

        updateTextSize(_requestedWidth, _requestedHeight);
        defaultContainerController.verticalScrollPosition = 0;
    }

    private function changeFontIfForeign(str:String):Boolean
    {

        var currentFont:String = _layoutFormat.fontFamily;

        for (var i:int = 0; i < LANGUAGE_MAPPING.length; i++)
        {
            //if we find a font, stop checking
            if (checkFont(str, LANGUAGE_MAPPING[i].font, LANGUAGE_MAPPING[i].range[0], LANGUAGE_MAPPING[i].range[1],
                    _fontEnlarge))
                break;
        }

        //if it changed, we need to do some extra stuff maybe
        return currentFont != _layoutFormat.fontFamily;
    }

    private function checkFont(str:String, fontName:String, start:Number, end:Number, fontEnlarge:int = 0):Boolean
    {
        if (BiDiCheckUtility.checkRange(str, start, end))
        {
            _layoutFormat.fontFamily = fontName;

            var styleNames:Array = _styleSheet ? _styleSheet.styleNames : null;

            //need to go through and put our font/size on all the styles
            if (styleNames)
            {
                for each (var style:String in styleNames)
                {
                     var styleName:String = style.substring(1);
                    //must have that style the
                    if (str.toLowerCase().indexOf(styleName) != -1)
                    {
                        var styleObj:Object = _styleSheet.getStyle(style);

                        //should only be needed for himalayan
                        if (!_fontIncremented)
                        {
                            //_layoutFormat.fontSize = _layoutFormat.fontSize + 2;
                            styleObj.fontSize = _layoutFormat.fontSize + fontEnlarge;

                        }

                        styleObj.fontFamily = fontName;

                        _styleSheet.setStyle(style, styleObj);

                    }
                }

            }

            if (!_fontIncremented)
            {
                _layoutFormat.fontSize = _layoutFormat.fontSize + fontEnlarge;
                _fontIncremented = true;
            }

            return true;
        }
        else
            return false;
    }

    private function updateTextSize(w:Number, h:Number):void
    {

        if (_textFlow !== null && defaultContainerController !== null)
        {
            // We have to do this because flowcomposer gives us bogus numlines with scrolled text
            defaultContainerController.setCompositionSize(w, 4000);
            _textFlow.flowComposer.compose();

            _untruncatedTextHeight = defaultContainerController.getContentBounds().height;
            _cachedNumLines = _textFlow.flowComposer.numLines;
            _cachedLineHeight = getMaxLineHeight(_textFlow);

            defaultContainerController.setCompositionSize(w, h);
            _textFlow.flowComposer.updateAllControllers();

            _realTextSize = defaultContainerController.getContentBounds();
            updateBackgroundSpacer(w, h, _realTextSize.width, _realTextSize.height);

            _cachedNumLinesInWindow = _cachedLineHeight > 0 ? Math.ceil(_containerText.height / _cachedLineHeight) - 1 : 0;

            if (!isNaN(w) && _layoutFormat.textAlign == TextAlign.CENTER)
            {
                _containerText.x = 0;
            }
            if (!isNaN(h) && _layoutFormat.verticalAlign == VerticalAlign.MIDDLE)
            {
                _containerText.y = 0;
            }
            //
            if (_truncateToFit)
            {
                doTruncateToFit();
            }
        }
    }

    public function getContainer():Sprite
    {
        return _container;
    }

    private function updateStyle():void
    {
        if (_textFlow && _textFlow.flowComposer)
        {

            _textFlow.invalidateAllFormats();
            _textFlow.flowComposer.compose();
            _textFlow.flowComposer.updateAllControllers();

        }
    }

    public function setFocus():void
    {
    }

    public function setSelection(startIndex:Number, endIndex:Number):void
    {
        if (_textFlow !== null && _editMode == EditingMode.READ_SELECT)
        {
            var sm:SelectionManager = new SelectionManager();
            sm.focusedSelectionFormat = new SelectionFormat();
            _textFlow.interactionManager = sm;
            sm.selectRange(startIndex, endIndex);
            sm.setFocus();
        }
    }

    private static function getMaxLineHeight(flow:TextFlow):Number
    {
        var i:uint = 0;
        var num_lines:int;
        var return_height:Number = 0;
        var current_height:Number;

        if (flow !== null && flow.flowComposer)
        {
            num_lines = flow.flowComposer.numLines;
            for (i = 0; i < num_lines; i++)
            {
                current_height = flow.flowComposer.getLineAt(i).height;
                return_height = current_height > return_height ? current_height : return_height;
            }
        }

        return return_height;
    }

    private function createFlow(useHtml:Boolean, config:Configuration, text:String):TextFlow
    {
        var flow:TextFlow;

        if (useHtml)
        {
            if (text.search(/<html.*?>/i) == -1)
            {
                flow = TextConverter.importToFlow(text, TextConverter.TEXT_LAYOUT_FORMAT, config);

                // xml parser failed, cleanup input a bit and try again with the kinder html parser
                if (!flow)
                {
                    text = text.replace(/\n/g, " ");
                    text = text.replace(/\r/g, " ");
                    text = text.replace(/<TextFlow.*?>(.*)<\/TextFlow>/, "$1");
                    flow = TextConverter.importToFlow(text, TextConverter.TEXT_FIELD_HTML_FORMAT, config);
                }
            }
            else
            {
                text = text.replace(/<html.*?>(.*)<\/html>/i, "$1");
                flow = TextConverter.importToFlow(text, TextConverter.TEXT_FIELD_HTML_FORMAT, config);
            }

        }
        else
        {
            flow = new TextFlow(config);
            flow.flowComposer = new StandardFlowComposer();

            var p:ParagraphElement = new ParagraphElement();
            var span:SpanElement = new SpanElement();
            span.text = text;
            p.addChild(span);
            flow.addChild(p);
        }

        addFlowEventListeners(flow);

        return flow;
    }

    protected function addFlowEventListeners(flow:TextFlow):void
    {
        flow.addEventListener(TextLayoutEvent.SCROLL, scrollListener, false, 0, true);
        flow.addEventListener(UpdateCompleteEvent.UPDATE_COMPLETE, updateListener, false, 0, true);

        flow.addEventListener(DamageEvent.DAMAGE, handleDamage, false, 0, true);
        flow.addEventListener(CompositionCompleteEvent.COMPOSITION_COMPLETE, compositionComplete, false, 0, true);
        flow.addEventListener(FlowOperationEvent.FLOW_OPERATION_BEGIN, handleFlowOperationBegin, false, 0, true);
        flow.addEventListener(FlowOperationEvent.FLOW_OPERATION_COMPLETE, handleFlowOperationComplete, false, 0, true);
    }

    protected function removeFlowEventListeners(flow:TextFlow):void
    {
        flow.removeEventListener(TextLayoutEvent.SCROLL, scrollListener);
        flow.removeEventListener(UpdateCompleteEvent.UPDATE_COMPLETE, updateListener);

        flow.removeEventListener(DamageEvent.DAMAGE, handleDamage);
        flow.removeEventListener(CompositionCompleteEvent.COMPOSITION_COMPLETE, compositionComplete);
        flow.removeEventListener(FlowOperationEvent.FLOW_OPERATION_BEGIN, handleFlowOperationBegin);
        flow.removeEventListener(FlowOperationEvent.FLOW_OPERATION_COMPLETE, handleFlowOperationComplete);
    }

    protected function handleFlowOperationBegin(e:FlowOperationEvent):void
    {
        //trace("\tbegin: "+e.level+" : "+e.operation.textFlow.getText());
    }

    protected function handleFlowOperationComplete(e:FlowOperationEvent):void
    {
        //trace("\tend: "+e.level+" : "+e.operation.textFlow.getText());
    }

    protected function handleDamage(e:DamageEvent):void
    {
        // trace("damageStart: "+e.damageAbsoluteStart +" length: "+e.damageLength);
    }

    protected function compositionComplete(e:CompositionCompleteEvent):void
    {
       // trace("compositionComplete(): "+e.type+" compositionStart: "+e.compositionStart+" length: "+e.compositionLength);

        if (_editMode!=EditingMode.READ_WRITE)
            return;//don't care

        var fontChanged:Boolean = false;

        if (e.textFlow.mxmlChildren.length>0&&e.textFlow.mxmlChildren[0].mxmlChildren.length>0)
            fontChanged = changeFontIfForeign(e.textFlow.mxmlChildren[0].mxmlChildren[0].text);

        if (fontChanged)
        {




              //this sucks, but we have to put this on a timer, otherwise we'll destroy the controller(s) while the
              //TLF is still using them, causing an error
              var timer:Timer = new Timer(1,1);
              timer.addEventListener(TimerEvent.TIMER_COMPLETE,
                      function():void{
                          _text = e.textFlow.mxmlChildren[0].mxmlChildren[0].text;
                          updateText(true)
                      }
               );
              timer.start();



        }

    }

    private function scrollListener(e:TextLayoutEvent):void
    {
        _cachedNumLines = _textFlow.flowComposer.numLines;
        _cachedLineHeight = getMaxLineHeight(_textFlow);
        _cachedNumLinesInWindow = _cachedLineHeight > 0 ? Math.ceil(_containerText.height / _cachedLineHeight) - 1 : 0;

        var new_line_pos:Number = convertFlowVScrollPixelsToLinePosition(_textFlow, defaultContainerController.verticalScrollPosition, _internalVScrollPosition, numLines);
        _internalVScrollPosition = new_line_pos != -1 ? new_line_pos + 1 : _internalVScrollPosition;

        var scroll_event:Event = new Event(Event.SCROLL, true, true);
        _containerText.dispatchEvent(scroll_event);
    }

    private function updateListener(e:UpdateCompleteEvent):void
    {

        updateLayoutFormatDirection();

        if (_textFlow.textDecoration != _layoutFormat.textDecoration)
        {
            _textFlow.textDecoration = _layoutFormat.textDecoration
        }

        if (_textFlow.direction != _layoutFormat.direction || _textFlow.textAlign != _layoutFormat.textAlign)
        {
            _textFlow.direction = _layoutFormat.direction;
            _textFlow.textAlign = _layoutFormat.textAlign;
            updateStyle();
        }

    }

    protected function updateLayoutFormatDirection():void
    {
        _layoutFormat.direction = isRightToLeft;
        _layoutFormat.textAlign = _layoutFormat.direction === Direction.RTL ? TextAlign.START : _layoutFormat.textAlign;
    }

    // FIXME : this should probably live in a seperate class
    static private function convertFlowVScrollPixelsToLinePosition(flow:TextFlow, vpixelpos:Number, start_search_at:Number, max_lines:Number):Number
    {
        var search_radius:Number = 0;
        var found_line:Number = -1;

        for (search_radius = 0; start_search_at + search_radius <= max_lines; search_radius++)
        {
            var first_line_pos:Number = start_search_at - search_radius;
            var second_line_pos:Number = start_search_at + search_radius;
            found_line = convertFlowVScrollPixelsToLinePosition_TestLine(flow, vpixelpos, first_line_pos);
            if (found_line == -1 && first_line_pos != second_line_pos)
            {
                found_line = convertFlowVScrollPixelsToLinePosition_TestLine(flow, vpixelpos, second_line_pos);
            }

            if (found_line != -1)
            {
                break;
            }
        }

        return found_line;
    }

    // FIXME : this should probably live in a seperate class
    static private function convertFlowVScrollPixelsToLinePosition_TestLine(flow:TextFlow, vpixelpos:Number, line_pos:Number):Number
    {
        var found_line:Number = -1;
        var current_line:TextFlowLine;
        var next_line:TextFlowLine;
        var next_line_y:Number;

        if (line_pos >= 0)
        {
            current_line = flow.flowComposer.getLineAt(line_pos);
            if (current_line)
            {
                next_line = flow.flowComposer.getLineAt(line_pos + 1);
                next_line_y = next_line ? next_line.y : current_line.y + current_line.height;
                if (vpixelpos >= current_line.y && vpixelpos < next_line_y)
                {
                    found_line = line_pos;
                }
            }
        }

        return found_line;
    }

    private function updateBackgroundSpacer(text_w:Number, text_h:Number, default_w:Number, default_h:Number):void
    {

        var g:Graphics = _container.graphics;

        g.clear();

        if (_debug)
        {
            g.beginFill(0x0000FF, .5);
        }
        else
        {
            g.beginFill(0x0000FF, 0);
        }

        var w:Number = !isNaN(text_w) ? text_w : default_w;
        var h:Number = !isNaN(text_h) ? text_h : default_h;

        g.drawRect(0, 0, w, h);

    }

    private function createContainerController(container:Sprite, multiline:Boolean = false):void
    {
        var cc:ContainerController = new ContainerController(container);
        if (multiline)
        {
            cc.horizontalScrollPolicy = ScrollPolicy.AUTO;
            cc.verticalScrollPolicy = ScrollPolicy.AUTO;
        }
        else
        {
            cc.horizontalScrollPolicy = ScrollPolicy.AUTO;
            cc.verticalScrollPolicy = ScrollPolicy.OFF;
        }
        if (cc && _textFlow)
        {
            if (_textFlow.flowComposer.numControllers > 0)
            {
                _textFlow.flowComposer.removeAllControllers();
            }
            _textFlow.flowComposer.addController(cc);
        }
    }

    static private function createConfig(multiline:Boolean, format:TextLayoutFormat, text:String = ""):Configuration
    {
        /* init config
         * remember that config is COPIED into flow
         * all style changes from this point must be applied to flow directly
         */
        var config:Configuration = new Configuration();
        config.textFlowInitialFormat = format;

        config.manageEnterKey = multiline;

        //this underlines the link in all states.
        var linkFormat:TextLayoutFormat = new TextLayoutFormat(format);
        linkFormat.textDecoration = TextDecoration.UNDERLINE;
        config.defaultLinkActiveFormat = linkFormat;
        config.defaultLinkHoverFormat = linkFormat;
        config.defaultLinkNormalFormat = linkFormat;

        return config;
    }

    static private function createDefaultTextLayoutFormat():TextLayoutFormat
    {
        var defaultTextFormat:TextLayoutFormat = new TextLayoutFormat();
        defaultTextFormat.backgroundColor = BackgroundColor.TRANSPARENT; //no background
        defaultTextFormat.breakOpportunity = BreakOpportunity.ANY; //default is single line, so we want the line to be ablet to break even if there's no spaces
        defaultTextFormat.color = 0x000000; //default to black
        defaultTextFormat.direction = Direction.LTR;
        defaultTextFormat.fontFamily = "Arial,Helvetica,_sans";
        defaultTextFormat.fontLookup = FontLookup.DEVICE; //default should be device
        defaultTextFormat.fontSize = 12;
        defaultTextFormat.fontStyle = FontPosture.NORMAL;
        defaultTextFormat.fontWeight = FontWeight.NORMAL;
        defaultTextFormat.lineBreak = LineBreak.EXPLICIT; //default is single line, keeps input from
        defaultTextFormat.lineHeight = "120%";
        defaultTextFormat.lineThrough = false;
        defaultTextFormat.locale = "en_US";
        defaultTextFormat.paddingBottom = 0;
        defaultTextFormat.paddingLeft = 0;
        defaultTextFormat.paddingRight = 0;
        defaultTextFormat.paddingTop = 0;
        defaultTextFormat.textAlign = TextAlign.START;
        defaultTextFormat.textAlpha = 1;
        defaultTextFormat.textDecoration = TextDecoration.NONE;
        defaultTextFormat.verticalAlign = VerticalAlign.TOP;
        defaultTextFormat.alignmentBaseline = flash.text.engine.TextBaseline.ASCENT;
        defaultTextFormat.dominantBaseline = flash.text.engine.TextBaseline.ASCENT;
        return defaultTextFormat;
    }

    static private function getAllText(flow_group_element:FlowGroupElement):String
    {
        var return_string:String = null;
        if (flow_group_element !== null)
        {
            var num_children:Number = flow_group_element.numChildren;
            if (num_children > 0)
            {
                return_string = "";
                for (var i:Number = 0; i < num_children; i++)
                {
                    return_string += flow_group_element.getChildAt(i).getParagraph().getText();
                }
            }
        }

        return return_string;
    }

    protected function get interactionManager():ISelectionManager
    {
        if (_textFlow.interactionManager)
        {
            return _textFlow.interactionManager
        }
        return null
    }

    protected function get editManager():EditManager
    {
        if (!_editManager)
        {
            _editManager = new EditManager();
        }
        return _editManager;
    }

    protected var _editManager:EditManager;

    protected function createInteractionManager(editMode:String):ISelectionManager
    {
        var im:ISelectionManager = null;

        /* 			if(!_textFlow.interactionManager) {
         _textFlow.interactionManager = new EditManager();

         }

         return; */

        if (editMode == EditingMode.READ_SELECT)
        {
            //make a selectionManager
            im = new SelectionManager();

        }

        if (editMode == EditingMode.READ_WRITE)
        {
            if (_textFlow.interactionManager is EditManager)
            {

                im = null;
            }
            else
            {
                im = editManager;
            }
        }

        if (editMode == EditingMode.READ_ONLY)
        {
            im = null
        }

        if (im !== null)
        {
            //to do: set the different colors, etc of the selection formats
            im.focusedSelectionFormat = new SelectionFormat();
        }

        if (im)
        {
            return im as ISelectionManager;
        }
        return null
    }

    ////////// properties ///////////
    /////////////////////////////////////////////////////

    public function get text():String
    {
        var return_string:String = getAllText(_textFlow);
        return return_string !== null ? return_string : _text;
    }

    protected var _textNeedsReset:Boolean = false;

    public function set text(value:String):void
    {
        _textNeedsReset = (_text != value);

        _text = (value == null || value == "undefined" ) ? "" : value;
        updateText();
    }

    public function get width():Number
    {
        return defaultContainerController.getContentBounds().width;

    }

    public function set width(value:Number):void
    {
        if (value > 9990 || value < 0)
        {
            value = NaN;
        }

        _requestedWidth = value;
        updateTextSize(_requestedWidth, _requestedHeight);
    }

    public function get height():Number
    {
        return _container.height;
    }

    public function set height(value:Number):void
    {
        if (value < 4)
        {
            value = NaN;
        }

        _requestedHeight = value;
        updateTextSize(_requestedWidth, _requestedHeight);
    }

    public function get scrollV():int
    {
        return _internalVScrollPosition;
    }

    public function set scrollV(value:int):void
    {
        var lines_delta:int = value - _internalVScrollPosition;
        _internalVScrollPosition = value;
        if (defaultContainerController !== null && lines_delta != 0)
        {
            var new_scroll_pos:Number = defaultContainerController.verticalScrollPosition + defaultContainerController.getScrollDelta(lines_delta);
            defaultContainerController.verticalScrollPosition = new_scroll_pos;
        }
    }

    public function get maxScrollV():int
    {
        var max:Number = numLines - _cachedNumLinesInWindow;
        max = max > 0 ? max + 1 : 1;
        return max;
    }

    public function get bottomScrollV():int
    {
        var bottom:Number = _cachedNumLinesInWindow + _internalVScrollPosition;
        return bottom;
    }

    public function get fontFamily():String
    {
        return _layoutFormat.fontFamily;
    }

    public function set fontFamily(value:String):void
    {
        _layoutFormat.fontFamily = value;
        updateStyle();
    }

    public function get color():uint
    {
        return _layoutFormat.color;
    }

    public function set color(value:uint):void
    {
        _layoutFormat.color = value;
        if (_textFlow !== null)
        {
            _textFlow.color = value;
            updateStyle();
        }
    }

    public function get direction():String
    {
        return _layoutFormat.direction;
    }

    public function set direction(value:String):void
    {
        _layoutFormat.direction = value;
        if (_textFlow !== null)
        {
            _textFlow.direction = _layoutFormat.direction;
            updateStyle();
        }
    }

    public function get editMode():String
    {
        return _editMode;
    }

    public function set editMode(value:String):void
    {

        if (value == _editMode)
        {
            return;
        }

        _editMode = value;
        updateLayoutFormatDirection();

        if (_textFlow !== null)
        {
            _textFlow.direction = _layoutFormat.direction;
            _textFlow.textAlign = _layoutFormat.textAlign;
            createInteractionManager(_editMode);
            updateStyle();
        }
    }

    public function get fontLookup():String
    {
        return _layoutFormat.fontLookup;
    }

    public function set fontLookup(value:String):void
    {
        _layoutFormat.fontLookup = value;
        updateStyle();
    }

    public function get fontSize():Number
    {
        return _layoutFormat.fontSize;
    }

    public function set fontSize(value:Number):void
    {
        if (isNaN(value))
        {
            return;
        }

        _layoutFormat.fontSize = value;
        updateStyle();
    }

    public function get fontStyle():String
    {
        return _layoutFormat.fontStyle;
    }

    public function set fontStyle(value:String):void
    {
        _layoutFormat.fontStyle = value;
        updateStyle();
    }

    public function get fontWeight():String
    {
        return _layoutFormat.fontWeight;
    }

    public function set fontWeight(value:String):void
    {
        _layoutFormat.fontWeight = value;
        updateStyle();
    }

    public function get lineHeight():Number
    {
        return _cachedLineHeight;
    }

    public function get multiline():Boolean
    {
        return _multiline;
    }

    public function set multiline(value:Boolean):void
    {
        if (_multiline != value)
        {
            _multiline = value;
            if (!_multiline)
            {
                _layoutFormat.lineBreak = LineBreak.EXPLICIT;
                _layoutFormat.breakOpportunity = BreakOpportunity.ANY;
            }
            else
            {
                _layoutFormat.lineBreak = LineBreak.TO_FIT;
                _layoutFormat.breakOpportunity = BreakOpportunity.AUTO;
            }
            //this is serious, we need to re-create the textflow in this situation
            updateText(true);
        }
    }

    public function get paddingBottom():Number
    {
        return _layoutFormat.paddingBottom ? _layoutFormat.paddingBottom : 0;
    }

    public function set paddingBottom(value:Number):void
    {
        if (isNaN(value))
        {
            return;
        }

        _layoutFormat.paddingBottom = value;
        updateStyle();
    }

    public function get paddingTop():Number
    {
        return _layoutFormat.paddingTop ? _layoutFormat.paddingTop : 0;
    }

    public function set paddingTop(value:Number):void
    {
        if (isNaN(value))
        {
            return;
        }

        _layoutFormat.paddingTop = value;
        updateStyle();
    }

    public function get paddingLeft():Number
    {
        return _layoutFormat.paddingLeft ? _layoutFormat.paddingLeft : 0;
    }

    public function set paddingLeft(value:Number):void
    {
        if (isNaN(value))
        {
            return;
        }

        _layoutFormat.paddingLeft = value;
        updateStyle();
    }

    public function get paddingRight():Number
    {
        return _layoutFormat.paddingRight ? _layoutFormat.paddingRight : 0;
    }

    public function set paddingRight(value:Number):void
    {
        if (isNaN(value))
        {
            return;
        }

        _layoutFormat.paddingRight = value;
        updateStyle();
    }

    public function get textAlign():String
    {
        return _layoutFormat.textAlign;
    }

    public function set displayAsPassword(value:Boolean):void
    {

        //noop
    }

    public function get displayAsPassword():Boolean
    {
        return false;
    }

    public function set textAlign(value:String):void
    {
        if (_layoutFormat.direction !== Direction.RTL)
        {
            _layoutFormat.textAlign = value;
        }
        updateStyle();
    }

    public function get textDecoration():String
    {
        return _layoutFormat.textDecoration;
    }

    public function set textDecoration(value:String):void
    {
        //see pdk-3602: this seems stupid, we can't set it directly on the textflow here
        //but we need to copy the value from layoutFormat to textFlow in the updateComplete handler
        //in order for the underline to appear. TLFAIL?
        //_textFlow.format.textDecoration=value;

        _layoutFormat.textDecoration = value;
        updateStyle();
    }

    public function get textHeight():Number
    {
        var r:Number = _realTextSize.height;
        if (_text === null && r < 1)
        {
            r = _layoutFormat.fontSize;
        }
        return r // + _bottomPad;
    }

    public function get textWidth():Number
    {
        var tw:Number = 0;
        if (_textFlow !== null)
        {
            tw = _textFlow.flowComposer.getControllerAt(0).compositionWidth; //not sure if this will get us the right value
        }
        return tw;
    }

    public function get numLines():Number
    {
        return _cachedNumLines;
    }

    public function get whiteSpaceCollapse():String
    {
        return _layoutFormat.whiteSpaceCollapse;
    }

    public function set whiteSpaceCollapse(value:String):void
    {
        _layoutFormat.whiteSpaceCollapse = value;
        updateStyle();
    }

    public function get useHtml():Boolean
    {
        return _useHtml;
    }

    public function set useHtml(value:Boolean):void
    {
        _useHtml = value;
    }

    public function set styleSheet(ss:StyleSheet):void
    {
        if (ss == _styleSheet)
        {
            return;
        }

        _styleSheet = ss;
        _formatResolver = new CSSFormatResolver(_styleSheet);
        if (_textFlow)
        {
            if (_useHtml)
            {
                //applyStylesheet();
                _textFlow.formatResolver = _formatResolver;
                //_textFlow.invalidateAllFormats();
                updateStyle(); //amd same as: _textFlow.flowComposer.updateAllControllers();
            }
            else
            {
                //take out the styles from the styleSheet
            }
        }
    }

    public function get styleSheet():StyleSheet
    {
        return _styleSheet;
    }

    private function applyStylesheet():void
    {
        // take styles and create hostFormat and set on textFlow
    }

    public function set truncateToFit(value:Boolean):void
    {
        _truncateToFit = value;
        updateText(true);

        //	doTruncateToFit();
    }

    public function get truncateToFit():Boolean
    {
        return _truncateToFit;
    }

    public function get isRightToLeft():String
    {
        var isR2L:Boolean = true;
        switch (textDirection)
        {
            case TextDirection.LEFT_TO_RIGHT:
                //_layoutFormat.direction = Direction.LTR;
                isR2L = false;
                break;
            case TextDirection.RIGHT_TO_LEFT:
                //_layoutFormat.direction = Direction.RTL;
                isR2L = true;
                break;
            case TextDirection.AUTO:
                isR2L = BiDiCheckUtility.checkR2L(_text);
                break;
        }

        //_layoutFormat.textAlign = _layoutFormat.direction === Direction.RTL ? TextAlign.START : _layoutFormat.textAlign;

        return (isR2L) ? Direction.RTL : Direction.LTR;
    }

    protected function doTruncateToFit():void
    {
        if (!_textFlow || !_textFlow.flowComposer)
        {
            return;
        }

        if (_truncateToFit && !isNaN(_requestedHeight) && _untruncatedTextHeight > _requestedHeight)
        {
            var flowComposer:IFlowComposer = _textFlow.flowComposer;

            if (_textFlow.flowComposer.numControllers <= 0 || _textFlow.flowComposer.numControllers > 1)
            {
                new IllegalOperationError("flowComposer has more than one controller this will break measurement")
                return
            }

            defaultContainerController.verticalScrollPolicy = ScrollPolicy.OFF;
            defaultContainerController.setCompositionSize(_requestedWidth, _requestedHeight);
            flowComposer.updateAllControllers();

            if (useHtml)
            {
                doHTMLTruncation();
            }

        }
    }

    protected function doHTMLTruncation():void
    {
        var ellipsis_width:int = 10; // in pixels
        var ellipsis_offset:int = 3; // index value we should back up to place the elipsis
        var ellipsis_symbol:String = "\u2026";
        // need to create a new editManager for each pass
        //var editManager:EditManager = editManager;
        // assign the edit manager to the flow
        if (_textFlow.interactionManager !== editManager)
        {
            _textFlow.interactionManager = editManager;
        }
        // reset the position, not sure if we need this (?)
        _textFlow.flowComposer.compose();

        // check to make sure we have a container
        var textLineContainer:Sprite = defaultContainerController.container;

        if (!textLineContainer)
        {
            // bail as we don't have any display objects to show
            new IllegalOperationError("ContainerController does not have a container set");
            return;
        }

        // reset internal text metrics, lame move to method?
        _cachedNumLines = _textFlow.flowComposer.numLines;
        _cachedLineHeight = getMaxLineHeight(_textFlow);
        _cachedNumLinesInWindow = textLineContainer.numChildren;
        // using sprite methods get numLines and bounds
        var lastTextLine:TextLine = textLineContainer.numChildren > 0 ? textLineContainer.getChildAt(textLineContainer.numChildren - 1) as TextLine : null;
        var lineBounds:Rectangle = lastTextLine ? lastTextLine.getBounds(textLineContainer) : new Rectangle();
        // get width of the DOContainer
        var textContainerWidth:Number = textLineContainer.width;
        // elipsis positions
        // this does not work the textBlockBeginIndex does not return the offset from the line position
        //var ep_select_start:Number = lastTextLine.textBlockBeginIndex + lastTextLine.atomCount;
        var ep_select_start:Number = getLastCharIndexFromContainer(textLineContainer);
        /* debug */
        // trace("last line: "+lastTextLine.textBlock.content.rawText);
        // check to see if we should inset the elipsis position
        // trace("line: "+lineBounds.right + ellipsis_width+" container: "+textContainerWidth);
        if (lineBounds.right + ellipsis_width > textContainerWidth)
        {
            ep_select_start -= ellipsis_offset;
        }

        // delete the trailing text
        deleteTrailingText(editManager, ep_select_start);

        var txt:String = _textFlow.flowComposer.getLineAt(0).paragraph.getText();
        if (txt.indexOf(ellipsis_symbol) > 0)
        {
            return;//just ignore if the truncation didn't take off
        }

        // do insertion
        editManager.selectRange(ep_select_start, ep_select_start);
        editManager.insertText(ellipsis_symbol);
        // recompose flow
        _textFlow.flowComposer.compose();
        _textFlow.flowComposer.updateAllControllers();

        //var line:TextFlowLine = _textFlow.flowComposer.getLineAt(0);
        //trace("inserting ellipsis into: " + line.paragraph.getText() + " at:" + ep_select_start);

        _textFlow.interactionManager = null;
    }

    protected function getLastCharIndexFromContainer(container:Sprite):int
    {
        if (!container) return 0;

        var lastCharIndex:int = 0;
        var textLine:TextLine;
        for (var i:int = 0; i < container.numChildren; i++)
        {
            textLine = container.getChildAt(i) as TextLine;
            if (textLine) lastCharIndex += textLine.atomCount;
        }
        // extend truncation depending on last char type
        if (textLine) lastCharIndex -= checkLastChars(textLine.textBlock.content.rawText);
        return lastCharIndex;
    }

    protected function checkLastChars(text:String):int
    {
        var offset:int = 0;
        // we probably want to check more at some point
        // this just checks for a newline at the end of
        // the string
        if (text.charCodeAt(text.length - 1) == 8233)
        {
            offset++;
        }

        return offset;
    }

    protected function deleteTrailingText(editManager:EditManager, fromPosition:int):void
    {
        var endPosition:int = _textFlow.textLength - 1;
        if (fromPosition >= endPosition)
        {
            return
        }
        try
        {
            editManager.selectRange(fromPosition, endPosition);
            editManager.deleteText();
        } catch(e:Error)
        {
            trace("Whoops your trying to delete to much: " + e.message);
        }

    }

    /**
     *
     *
     */
    public function refresh():void
    {

        //if (_text)
        //updateText(_text, true);

    }

    public function destroy():void
    {
        _layoutFormat = null;
    }

    public function set textDirection(value:String):void
    {
        _textDirection = value;
        updateText();
    }

    public function get textDirection():String
    {
        return _textDirection;
    }



}
}
