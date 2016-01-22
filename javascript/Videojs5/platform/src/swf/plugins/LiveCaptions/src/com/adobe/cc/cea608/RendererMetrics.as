package com.adobe.cc.cea608 
{
    import flash.events.*;
    import flash.geom.*;
    import flash.text.*;

    public class RendererMetrics extends flash.events.EventDispatcher
    {
        public function get customizations():com.adobe.cc.cea608.RendererCustomizations
        {
            return this._customizations;
        }

        public function set customizations(arg1:com.adobe.cc.cea608.RendererCustomizations):void
        {
            if (this._customizations) 
            {
                this._customizations.removeEventListener(flash.events.Event.CHANGE, this.onCustomizationsChanged);
            }
            this._customizations = arg1;
            if (this._customizations) 
            {
                this._customizations.addEventListener(flash.events.Event.CHANGE, this.onCustomizationsChanged);
            }
            this.recompute();
            return;
        }

        public function get cellSize():flash.geom.Point
        {
            return this._cellSize.clone();
        }

        public function get underlineOffset():Number
        {
            return this._underlineOffset;
        }

        public function get centeringOffset():Number
        {
            return this._centeringOffset;
        }

        public function get fontSize():Number
        {
            return this._fontSize;
        }

        public function get changeNumber():uint
        {
            return this._changeNumber;
        }

        public function getCellX(arg1:int):Number
        {
            return (arg1 - 1) * this._cellSize.x + this._topLeftCellPosition.x;
        }

        public function getCellY(arg1:int):Number
        {
            if (arg1 < com.adobe.cc.cea608.Decoder.ROW_COUNT / 2)
            {
                // top half of rows should be top justified
                return (arg1 - 1) * this._cellSize.y + 0;
            }
            else
            {
                // bottom half of rows should be bottom justified
                return _videoBounds.height - (com.adobe.cc.cea608.Decoder.ROW_COUNT - arg1 + 1) * this._cellSize.y;
            }
        }

        public function getCellPosition(arg1:int, arg2:int):flash.geom.Point
        {
            return new flash.geom.Point(this.getCellX(arg1), this.getCellY(arg2));
        }

        public function getCellBounds(arg1:int, arg2:int):flash.geom.Rectangle
        {
            return new flash.geom.Rectangle(this.getCellX(arg1), this.getCellY(arg2), this._cellSize.x, this._cellSize.y);
        }

        public function getCellRegionBounds(arg1:int, arg2:int, arg3:int, arg4:int):flash.geom.Rectangle
        {
            var loc1:*=this.getCellBounds(arg1, arg2);
            var loc2:*=this.getCellBounds(arg3, arg4);
            var loc3:*=Math.min(loc1.left, loc2.left);
            var loc4:*=Math.min(loc1.top, loc2.top);
            var loc5:*=Math.max(loc1.right, loc2.right);
            var loc6:*=Math.max(loc1.bottom, loc2.bottom);
            return new flash.geom.Rectangle(loc3, loc4, loc5 - loc3, loc6 - loc4);
        }

        private function onCustomizationsChanged(arg1:flash.events.Event):void
        {
            this.recompute();
            return;
        }

        private function recompute():void
        {
            if (this._videoBounds.equals(this._lastVideoBounds) && this._customizations && this._customizations.font == this._lastFont && this._safeAreaHeightPercent == this._lastSafeAreaHeightPercent && this._overrideFontSize == this._lastOverrideFontSize) 
            {
                return;
            }
            this._lastVideoBounds = this._videoBounds.clone();
            this._lastFont = this._customizations ? this._customizations.font : null;
            this._lastSafeAreaHeightPercent = this._safeAreaHeightPercent;
            this._lastOverrideFontSize = this._overrideFontSize;
            var loc1:*;
            var loc2:*=((loc1 = this)._changeNumber + 1);
            loc1._changeNumber = loc2;
            this.recomputeCellMetrics();
            this.recomputeFontSize();
            this.sanitize();
            dispatchEvent(new flash.events.Event(flash.events.Event.CHANGE));
            return;
        }

        private function recomputeCellMetrics():void
        {
            var loc1:*=4 / 3;
            var loc2:*=0.8;
            if (this._safeAreaHeightPercent != -1) 
            {
                loc2 = this._safeAreaHeightPercent;
            }
            if (loc2 > 1) 
            {
                loc2 = 1;
            }
            if (this._overrideFontSize != -1) 
            {
                loc2 = this._overrideFontSize * loc2;
                if (loc2 > 1) 
                {
                    loc2 = 1;
                }
            }
            var loc3:*=this._videoBounds.height * loc2;
            var loc4:*=loc3 * loc1;
            var loc5:*=com.adobe.cc.cea608.Decoder.ROW_COUNT;
            var loc6:*=com.adobe.cc.cea608.Decoder.COL_COUNT;
            this._cellSize.y = loc3 / loc5;
            this._cellSize.x = loc4 / loc6;
            this._topLeftCellPosition.x = this._videoBounds.x + this._videoBounds.width / 2 - this._cellSize.x * loc6 / 2;
            this._topLeftCellPosition.y = this._videoBounds.y + this._videoBounds.height / 2 - this._cellSize.y * loc5 / 2;
            return;
        }

        private function recomputeFontSize():void
        {
            var loc6:*=null;
            this._fontSize = 1;
            this._underlineOffset = 0;
            this._centeringOffset = 0;
            if (!this._customizations) 
            {
                return;
            }
            var loc1:*=new flash.text.TextField();
            loc1.text = "M";
            loc1.wordWrap = false;
            loc1.antiAliasType = flash.text.AntiAliasType.ADVANCED;
            loc1.gridFitType = flash.text.GridFitType.NONE;
            var loc2:*=new flash.text.TextFormat();
            loc2.font = this._customizations.font;
            loc2.align = flash.text.TextFormatAlign.LEFT;
            var loc3:*=Math.max(this._cellSize.x, this._cellSize.y);
            var loc4:*=0.8;
            var loc5:*=32;
            while (loc5 > 0) 
            {
                if (!isReasonableNumber(loc3)) 
                {
                    return;
                }
                loc2.size = loc3;
                loc1.setTextFormat(loc2);
                loc6 = loc1.getLineMetrics(0);
                this._underlineOffset = loc6.height - loc6.descent + 3;
                this._fontSize = loc3;
                this._centeringOffset = this._cellSize.y / 2 - (loc6.ascent + loc6.descent + loc6.leading) / 2 - 2;
                if (loc4 < 1) 
                {
                    if (loc6.height + 2 < this._cellSize.y && loc6.width + 2 < this._cellSize.x) 
                    {
                        loc4 = 1 + (1 - loc4) / 2;
                    }
                }
                else if (loc4 > 1) 
                {
                    if (loc6.height + 2 > this._cellSize.y && loc6.width + 2 > this._cellSize.x) 
                    {
                        loc4 = 1 - (loc4 - 1) / 2;
                    }
                }
                loc3 = this._fontSize * loc4;
                if (loc4 < 1) 
                {
                    if (!(loc3 < this._fontSize)) 
                    {
                        break;
                    }
                }
                else if (loc4 > 1) 
                {
                    if (!(loc3 > this._fontSize)) 
                    {
                        break;
                    }
                }
                --loc5;
            }
            return;
        }

        private function sanitize():void
        {
            if (!isReasonableRectangle(this._videoBounds) || !isReasonableNumber(this._underlineOffset) || !isReasonableNumber(this._centeringOffset) || !isReasonablePoint(this._topLeftCellPosition) || !isReasonablePoint(this._cellSize)) 
            {
                this._cellSize = new flash.geom.Point(0, 0);
                this._topLeftCellPosition = new flash.geom.Point(0, 0);
                this._underlineOffset = 0;
                this._fontSize = 1;
                this._centeringOffset = 0;
            }
            return;
        }

        private static function isReasonableNumber(arg1:Number):Boolean
        {
            return !isNaN(arg1) && isFinite(arg1) && -1000000 <= arg1 && arg1 <= 1000000;
        }

        private static function isReasonablePoint(arg1:flash.geom.Point):Boolean
        {
            return isReasonableNumber(arg1.x) && isReasonableNumber(arg1.y);
        }

        private static function isReasonableRectangle(arg1:flash.geom.Rectangle):Boolean
        {
            var value:flash.geom.Rectangle;

            var loc1:*;
            value = arg1;
            return [value.topLeft, value.bottomRight, value.size].every(function (arg1:flash.geom.Point, ... rest):Boolean
            {
                return isReasonablePoint(arg1);
            })
        }

        public function RendererMetrics()
        {
            super();
            this._videoBounds = new flash.geom.Rectangle();
            this._lastVideoBounds = new flash.geom.Rectangle(Number.NaN, Number.NaN, Number.NaN, Number.NaN);
            this._cellSize = new flash.geom.Point();
            this._topLeftCellPosition = new flash.geom.Point();
            this._safeAreaHeightPercent = -1;
            this._lastSafeAreaHeightPercent = -1;
            this._overrideFontSize = -1;
            this.recompute();
            return;
        }

        public function get videoBounds():flash.geom.Rectangle
        {
            return this._videoBounds.clone();
        }

        public function set videoBounds(arg1:flash.geom.Rectangle):void
        {
            if (!arg1) 
            {
                throw new ArgumentError();
            }
            this._videoBounds = arg1.clone();
            this.recompute();
            return;
        }

        public function set overrideFontSize(arg1:Number):void
        {
            if (!(arg1 == -1) && arg1 <= 0 || !isReasonableNumber(arg1)) 
            {
                throw new ArgumentError("Invalid font size value: " + arg1);
            }
            if (arg1 == this._overrideFontSize) 
            {
                return;
            }
            this._overrideFontSize = arg1;
            this.recompute();
            return;
        }

        public function get overrideFontSize():Number
        {
            return this._overrideFontSize;
        }

        public function set safeAreaHeightPercent(arg1:Number):void
        {
            if (!(arg1 == -1) && arg1 < 0 || !isReasonableNumber(arg1)) 
            {
                throw new ArgumentError("Invalid safe area height percent value: " + arg1);
            }
            if (arg1 == this._safeAreaHeightPercent) 
            {
                return;
            }
            this._safeAreaHeightPercent = arg1;
            this.recompute();
            return;
        }

        public function get safeAreaHeightPercent():Number
        {
            return this._safeAreaHeightPercent;
        }

        private var _overrideFontSize:Number;

        private var _safeAreaHeightPercent:Number;

        private var _customizations:com.adobe.cc.cea608.RendererCustomizations;

        private var _lastOverrideFontSize:Number;

        private var _lastSafeAreaHeightPercent:Number;

        private var _lastFont:String;

        private var _lastVideoBounds:flash.geom.Rectangle;

        private var _fontSize:Number;

        private var _centeringOffset:Number;

        private var _underlineOffset:Number;

        private var _topLeftCellPosition:flash.geom.Point;

        private var _cellSize:flash.geom.Point;

        private var _videoBounds:flash.geom.Rectangle;

        private var _changeNumber:uint;
    }
}