package com.adobe.cc.cea608 
{
    import flash.display.*;
    import flash.geom.*;
    import flash.text.*;
    
    public class DisplayCell extends Object
    {
        public function redraw():void
        {
            var loc1:*=null;
            var loc2:*=null;
            var loc3:*=null;
            var loc4:*=0;
            var loc5:*=NaN;
            var loc6:*=NaN;
            var loc7:*=null;
            var loc8:*=0;
            var loc9:*=null;
            var loc10:*=null;
            if (this.isTransparent) 
            {
                this._foregroundSprite.visible = false;
                this._backgroundSprite.visible = false;
                this._textField.visible = false;
            }
            else 
            {
                this._backgroundSprite.visible = true;
                loc1 = this._renderer.customizations;
                loc2 = this._renderer.metrics;
                loc3 = loc2.cellSize;
                loc4 = !(loc1.backgroundColor == -1) ? loc1.backgroundColor : this._gridCell.backgroundColor;
                loc5 = !(loc1.backgroundOpacity == -1) ? loc1.backgroundOpacity : this._gridCell.backgroundOpacity;
                this._backgroundSprite.graphics.clear();
                this._backgroundSprite.graphics.lineStyle();
                this._backgroundSprite.graphics.beginFill(loc4, loc5);
                this._backgroundSprite.graphics.drawRect(0, 0, loc3.x, loc3.y);
                this._backgroundSprite.graphics.endFill();
                if (this._isEnhancedLegibility) 
                {
                    this._textField.visible = false;
                    this._foregroundSprite.visible = false;
                }
                else 
                {
                    this._textField.visible = true;
                    this._foregroundSprite.visible = true;
                    this._textField.wordWrap = false;
                    this._textField.selectable = false;
                    this._textField.antiAliasType = flash.text.AntiAliasType.ADVANCED;
                    this._textField.autoSize = flash.text.TextFieldAutoSize.NONE;
                    loc6 = !(loc1.textOpacity == -1) ? loc1.textOpacity : 1;
                    this._textField.alpha = loc6;
                    loc7 = new flash.text.TextFormat();
                    loc7.font = loc1.font;
                    loc7.size = loc2.fontSize;
                    loc7.italic = this._gridCell.italicized;
                    loc8 = !(loc1.textColor == -1) ? loc1.textColor : this._gridCell.color;
                    loc7.color = loc8;
                    loc7.align = flash.text.TextFormatAlign.LEFT;
                    this._textField.antiAliasType = flash.text.AntiAliasType.ADVANCED;
                    this._textField.defaultTextFormat = loc7;
                    this._textField.gridFitType = flash.text.GridFitType.NONE;
                    loc9 = "    ";
                    this._textField.text = loc9 + this._gridCell.character + loc9;
                    loc10 = this._textField.getLineMetrics(0);
                    this._textField.x = (-loc10.width) / 2 + loc3.x / 2 - 2;
                    this._textField.y = loc2.centeringOffset;
                    this._textField.height = loc10.height * 2;
                    this._foregroundSprite.graphics.clear();
                    if (this._gridCell.underlined) 
                    {
                        this._foregroundSprite.graphics.lineStyle(0.5, loc8, loc6);
                        this._foregroundSprite.graphics.beginFill(loc8);
                        this._foregroundSprite.graphics.moveTo(0, loc2.underlineOffset);
                        this._foregroundSprite.graphics.lineTo(loc3.x + 0.5, loc2.underlineOffset);
                        this._foregroundSprite.graphics.endFill();
                    }
                }
            }
            this._drawnEnhancedLegibility = this._isEnhancedLegibility;
            this._drawnGridCell = this._gridCell;
            return;
        }

        public function get isTransparent():Boolean
        {
            return !this._gridCell || this._gridCell.character == Line21Character.TRANSPARENT_SPACE;
        }

        public function get changed():Boolean
        {
            if (this._isEnhancedLegibility != this._drawnEnhancedLegibility) 
            {
                return true;
            }
            if (this._gridCell == this._drawnGridCell) 
            {
                return false;
            }
            if (!this._gridCell || !this._drawnGridCell) 
            {
                return true;
            }
            return !(this._gridCell.character == this._drawnGridCell.character) || !(this._gridCell.color == this._drawnGridCell.color) || !(this._gridCell.backgroundColor == this._drawnGridCell.backgroundColor) || !(this._gridCell.backgroundOpacity == this._drawnGridCell.backgroundOpacity) || !(this._gridCell.italicized == this._drawnGridCell.italicized) || !(this._gridCell.underlined == this._drawnGridCell.underlined);
        }

        public function set gridCell(arg1:com.adobe.cc.cea608.Cell):void
        {
            this._gridCell = arg1;
            return;
        }

        public function get gridCell():com.adobe.cc.cea608.Cell
        {
            return this._gridCell;
        }

        public function set isEnhancedLegibility(arg1:Boolean):void
        {
            this._isEnhancedLegibility = arg1;
            return;
        }

        public function get isEnhancedLegibility():Boolean
        {
            return this._isEnhancedLegibility;
        }

        public function get textSprite():flash.display.Sprite
        {
            return this._textSprite;
        }

        public function get backgroundSprite():flash.display.Sprite
        {
            return this._backgroundSprite;
        }

        public function get foregroundSprite():flash.display.Sprite
        {
            return this._foregroundSprite;
        }

        public function DisplayCell(arg1:com.adobe.cc.cea608.DisplayObjectCaptionRenderer)
        {
            super();
            this._renderer = arg1;
            this._foregroundSprite = new flash.display.Sprite();
            this._backgroundSprite = new flash.display.Sprite();
            this._textSprite = new flash.display.Sprite();
            this._textField = new flash.text.TextField();
            this._textSprite.addChild(this._textField);
            this._foregroundSprite.visible = false;
            this._backgroundSprite.visible = false;
            this._textField.visible = false;
            return;
        }

        private var _textField:flash.text.TextField;

        private var _textSprite:flash.display.Sprite;

        private var _backgroundSprite:flash.display.Sprite;

        private var _foregroundSprite:flash.display.Sprite;

        private var _gridCell:com.adobe.cc.cea608.Cell;

        private var _drawnGridCell:com.adobe.cc.cea608.Cell;

        private var _drawnEnhancedLegibility:Boolean;

        private var _isEnhancedLegibility:Boolean;

        private var _renderer:com.adobe.cc.cea608.DisplayObjectCaptionRenderer;
    }
}