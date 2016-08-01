/************************************************************************
Copyright (c) 2013 thePlatform for Media, Inc. All Rights Reserved. *
************************************************************************/

package com.theplatform.pdk.plugins
{

import avmplus.factoryXml;

import com.adobe.cc.CCDecoderImpl;
import com.adobe.cc.CCType;
import com.adobe.cc.CEA708Service;
import com.adobe.cc.EdgeType;
import com.theplatform.pdk.controllers.IPlayerController;
import com.theplatform.pdk.controls.IItem;
import com.theplatform.pdk.data.Clip;
import com.theplatform.pdk.data.ICard;
import com.theplatform.pdk.data.LoadObject;
import com.theplatform.pdk.data.MediaPause;
import com.theplatform.pdk.data.SubtitlePref;
import com.theplatform.pdk.data.SubtitleStyle;
import com.theplatform.pdk.data.Subtitles;
import com.theplatform.pdk.data.TimeObject;
import com.theplatform.pdk.decoder.PDKCCDecoder;
import com.theplatform.pdk.events.PdkEvent;
import com.theplatform.pdk.events.PlayerEvent;
import com.theplatform.pdk.plugins.IDestroyablePlugIn;
import com.theplatform.pdk.utils.Debug;
import com.theplatform.pdk.utils.PdkStringUtils;

import flash.display.DisplayObject;

import flash.display.Sprite;
import flash.geom.Rectangle;

public class LiveCaptions extends Sprite implements IDestroyablePlugIn
{
    private var _controller:IPlayerController;
    private var _trackId:String;
    private var _captionsDO:DisplayObject;
    private var _contentArea:Rectangle;
    private var _overlayArea:Rectangle;
    private var _currentClip:Clip;
    private var _currentClipHasCCSub:Boolean = false;
    private var _showCaptions:Boolean = false;
    private var _showSubtitles:Boolean = true;//set from OnSetShowSubtitles
    private var _isPaused:Boolean = false;
    private var _closedCaptionText:String = "Closed Captions"
    private var _defaultSubtitleStyle:SubtitleStyle = null;
    private var _channel:String;
    private var _client:Object;
    private var _708Logging:Boolean = false;

    private var _ccDecoder:PDKCCDecoder;

    public function LiveCaptions(){}

    public function initialize(lo:LoadObject):void
    {
        _controller = lo.controller as IPlayerController;

        _trackId = lo.vars["trackId"];

        if (lo.vars["CCButtonText"])
        {
            _closedCaptionText = lo.vars["CCButtonText"];
        }

        if (lo.vars["channel"])
        {
            _channel = lo.vars["channel"].toUpperCase();

            // make sure it's a valid channel;
            if (_channel != CEA708Service.CC1 && _channel != CEA708Service.CC2 && _channel != CEA708Service.CC3 && _channel != CEA708Service.CC4)
                _channel = null;
        }

        if (lo.vars["enable708Logging"] == "true")
        {
            _708Logging = true;
        }

        _client = new Object();
        _client.onCaptionInfo = onCaptionInfo;

        _controller.addNetStreamClient(_client);

        _controller.addEventListener(PdkEvent.OnMediaStart, mediaStart);
        _controller.addEventListener(PdkEvent.OnMediaEnd, mediaEnd);
        _controller.addEventListener(PdkEvent.OnGetSubtitleLanguage, onGetSubtitleLanguage);
        _controller.addEventListener(PdkEvent.OnGetSubtitleStyle, onGetSubtitleStyle);
        _controller.addEventListener(PdkEvent.OnMediaPause, onMediaPause);
        _controller.addEventListener(PdkEvent.OnMediaUnpause, onMediaUnpause);
        _controller.addEventListener(PdkEvent.OnShowCard, onShowCard);
        _controller.addEventListener(PdkEvent.OnHideCard, onHideCard);


        if (_channel)
            _ccDecoder = new PDKCCDecoder(_channel);
        else
            _ccDecoder = new PDKCCDecoder();

        _ccDecoder.enabled = true;//we'll switch this if necessary

        setSubtitleStyles();

        doContentArea(_controller.getContentArea());
        _controller.addEventListener(PlayerEvent.onContentAreaChanged, contentArea);
        _controller.addEventListener(PlayerEvent.OnOverlayAreaChanged, overlayArea);
        _controller.addEventListener(PlayerEvent.OnSetShowSubtitles, setShowSubtitles);
        _controller.getSubtitleLanguage();
        _controller.getSubtitleStyle();

    }

    public function destroy():void
    {
        _controller.removeEventListener(PdkEvent.OnMediaStart, mediaStart);
        _controller.removeEventListener(PdkEvent.OnMediaEnd, mediaEnd);
        _controller.removeEventListener(PdkEvent.OnGetSubtitleLanguage, onGetSubtitleLanguage);
        _controller.removeEventListener(PdkEvent.OnGetSubtitleStyle, onGetSubtitleStyle);
        _controller.removeEventListener(PdkEvent.OnMediaPause, onMediaPause);
        _controller.removeEventListener(PdkEvent.OnMediaUnpause, onMediaUnpause);
        _controller.removeEventListener(PdkEvent.OnShowCard, onShowCard);
        _controller.removeEventListener(PdkEvent.OnHideCard, onHideCard);

        _controller.removeEventListener(PlayerEvent.onContentAreaChanged, contentArea);
        _controller.removeEventListener(PlayerEvent.OnSetShowSubtitles, setShowSubtitles);


        _controller.removeNetStreamClient(_client);

        _ccDecoder.enabled = false;
        _ccDecoder = null;
    }

    private function onCaptionInfo(info:Object):void
    {
        if (_708Logging)
        {
            _controller.trace("OnCaptionInfo: " + PdkStringUtils.ObjToString(info), "LiveCaptions", Debug.DEBUG);
        }
        if (info.type == "708" && !_isPaused)
        {
            doCaptionInfo(info);
        }
    }

    private function doCaptionInfo(info:Object):void
    {
        if (!_captionsDO)
        {
            _captionsDO = _ccDecoder.displayObject;
            addChild(_captionsDO);
            doContentArea(_contentArea);
        }
        if (!_currentClip || !_currentClip.baseClip)
        {
            return;//can't do much
        }
        if (!_currentClipHasCCSub)
        {
            //make sure we put in the subtitles object
            if (!_currentClip.baseClip.availableSubtitles)
            {
                _currentClip.baseClip.availableSubtitles = [];
            }
            var caption:Subtitles = new Subtitles();
            caption.initialize(null, "embed", "live");
            caption.name = _closedCaptionText;
            _currentClip.baseClip.availableSubtitles.push(caption);
            _currentClipHasCCSub = true;
            _controller.getSubtitleLanguage();
        }
        if (_showCaptions && _showSubtitles)
        {
            _ccDecoder.setCaptionInfo(info);
            //moveCaptions();
        }

    }

    private function contentArea(e:PlayerEvent):void
    {
        doContentArea(e.data as Rectangle);
    }

    private function doContentArea(r:Rectangle):void
    {
        _contentArea = r;
        updateArea();
//        _ccDecoder.setVideoBounds(_contentArea);
    }

    private function overlayArea(e:PlayerEvent):void
    {
        doOverlayArea(e.data as Rectangle);
    }

    private function doOverlayArea(r:Rectangle):void
    {
        _overlayArea = r;
        updateArea();
//        _ccDecoder.setVideoBounds(_contentArea);
    }

    private function updateArea():void
    {
        if (_overlayArea && _contentArea)
        {
            var r:Rectangle = computeArea(_overlayArea, _contentArea);
            _ccDecoder.setVideoBounds(r);
        }
        else if (_overlayArea)
        {
            _ccDecoder.setVideoBounds(_overlayArea);
        }
        else if (_contentArea)
        {
            _ccDecoder.setVideoBounds(_contentArea);
        }
    }

    private function computeArea(overlay:Rectangle, content:Rectangle):Rectangle
    {
        var scaledH:Number = overlay.width * (content.height / content.width);
        var scaledW:Number = overlay.height * (content.width / content.height);
        if (scaledH < overlay.height)
        {
            //scaled area is less tall
            var hPad:Number = Math.round((overlay.height - scaledH) / 2);
            return new Rectangle(
                overlay.x,
                overlay.y + (hPad),
                overlay.width,
                Math.round(scaledH)
            );
        }
        else if (scaledW < overlay.width)
        {
            //scaled area is narrower
            var wPad:Number = Math.round((overlay.width - scaledW) / 2);
            return new Rectangle(
                overlay.x + wPad,
                overlay.y,
                Math.round(scaledW),
                overlay.height
            );
        }
        return overlay;//they are the same aspect ratio
    }

    private function findScale(fontSize:Number):Number
    {
        if (isNaN(fontSize) || fontSize < 0)
        {
            return 1;
        }

        // We've tweaked how this works a few times, so this
        // maps some old values to reasonable new ones.
        if (fontSize > 12)
            fontSize = 2;
        else if (fontSize > 10)
            fontSize -= 10;
        else if (fontSize > 8)
            fontSize -= 8;
        else if (fontSize > 6)
            fontSize -= 6;
        else if (fontSize > 4)
            fontSize -= 4;
        else if (fontSize > 2)
            fontSize -= 2;

        return fontSize;
    }

    private function mediaStart(e:PdkEvent):void
    {
        _ccDecoder.reset();
        _currentClip = e.data as Clip;
        var subtitles:Array = _currentClip.baseClip.availableSubtitles;
        if (containsLiveCaption(subtitles))
        {
            _currentClipHasCCSub = true;
        }
    }

    private function onMediaPause(e:PdkEvent):void
    {
        var clip:Clip = (e.data as MediaPause).clip;
        if (!clip.isAd)
        {
            _isPaused = true;
        }
    }

    private function onMediaUnpause(e:PdkEvent):void
    {
        var clip:Clip = (e.data as MediaPause).clip;
        if (!clip.isAd)
        {
            _ccDecoder.reset();
            _isPaused = false;
        }
    }

    private function containsLiveCaption(subtitles:Array):Boolean
    {
        if (subtitles && subtitles.length > 0)
        {
            for each (var subs:Subtitles in subtitles)
            {
                if (subs.MIMEType == "live")
                {
                    return true;
                }
            }
        }
        return false;
    }

    private function mediaEnd(e:PdkEvent):void
    {
        _ccDecoder.reset();
        _currentClip = null;
        _currentClipHasCCSub = false;
    }

    private function onGetSubtitleLanguage(e:PdkEvent):void
    {
        var pref:SubtitlePref = e.data as SubtitlePref;
        showCaptions(pref.langCode && pref.langCode != "none");
    }

    private function onGetSubtitleStyle(e:PdkEvent):void
    {
        if(e.data === null)
            _defaultSubtitleStyle = null;
        else
        {
            _defaultSubtitleStyle =  e.data as SubtitleStyle;
        }

        setSubtitleStyles();
    }

    private function setSubtitleStyles():void
    {
        if (_defaultSubtitleStyle)
        {
            if (_defaultSubtitleStyle.fontFamily)
                _ccDecoder.font = _defaultSubtitleStyle.fontFamily;

            if (!isNaN(_defaultSubtitleStyle.fontSize))
            {
                _ccDecoder.fontSize = _defaultSubtitleStyle.fontSize * 0.8;
            }

            if (_defaultSubtitleStyle.fontColor)
            {
                _ccDecoder.textColor = parseInt(_defaultSubtitleStyle.fontColor.substr(1), 16); //0xFF00FF;
            }

            if (_defaultSubtitleStyle.opacity)
            {
                _ccDecoder.textOpacity = _defaultSubtitleStyle.opacity;
            }

            if (!isNaN(_defaultSubtitleStyle.backgroundOpacity))
            {
                _ccDecoder.backgroundOpacity = _defaultSubtitleStyle.backgroundOpacity;
            }

            if (_defaultSubtitleStyle.backgroundColor)
                _ccDecoder.backgroundColor = parseInt(_defaultSubtitleStyle.backgroundColor.substr(1), 16); //0x00FF00;
            
            if (_defaultSubtitleStyle.fontEdge)
            {
                switch (_defaultSubtitleStyle.fontEdge)
                {
                    case "none":
                        _ccDecoder.edgeType = EdgeType.NONE;
                        break;
                    case "uniform":
                        _ccDecoder.edgeType = EdgeType.UNIFORM;
                        break;
                    case "raised":
                        _ccDecoder.edgeType = EdgeType.RAISED;
                        break;
                    case "depressed":
                        _ccDecoder.edgeType = EdgeType.DEPRESSED;
                        break;
                    case "dropshadow":
                        _ccDecoder.edgeType = EdgeType.RIGHT_DROP_SHADOW;
                        break;
                    default:
                        _ccDecoder.edgeType = EdgeType.NONE;
                        break;
                }
            }
            else
            {
                _ccDecoder.edgeType = EdgeType.NONE;
            }

            if (_defaultSubtitleStyle.fontEdgeColor)
                _ccDecoder.edgeColor = parseInt(_defaultSubtitleStyle.fontEdgeColor.substr(1), 16);
        }
    }

    private function showCaptions(show:Boolean):void
    {
        if (_showCaptions != show)
        {
            _showCaptions = show;
            _ccDecoder.enabled = _showCaptions && _showSubtitles;
        }
    }

    private function setShowSubtitles(e:PlayerEvent):void
    {
        var show:Boolean = e.data as Boolean;

        if (_showSubtitles != show)
        {
            _showSubtitles = show;
            _ccDecoder.enabled = _showSubtitles && _showCaptions;
        }
    }

    private function onShowCard(e:PdkEvent):void
    {
        if (e.data.deck == "forms")
        {
            this.visible = false;
        }
    }

    private function onHideCard(e:PdkEvent):void
    {
        if (e.data.deck == "forms")
        {
            this.visible = true;
        }
    }

}
}
