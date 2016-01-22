/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.containers.Container;
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.controls.ButtonControl;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Card;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.CustomData;
	import com.theplatform.pdk.data.CustomValue;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.data.Release;
	import com.theplatform.pdk.events.ButtonEvent;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.utils.Debug;
	import com.theplatform.pdk.utils.PdkStringUtils;

import flash.events.ErrorEvent;

import flash.events.Event;
	import flash.events.HTTPStatusEvent;
	import flash.events.IOErrorEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;

	public class TwitterMediator extends PlayerButtonControlMediator
	{
		private static const DEFAULT_TOOLTIP:String = "Tweet this video!";
		private static const DEFAULT_LABEL:String = "Twitter";

		private var _container:Container;
		private var _position:int;
		private var _button:ButtonControl;
		private var _playerController:IPlayerController;

		private var _pid:String;
		private var _baseClip:BaseClip;
		private var _clip:Clip;
		private var _compressedUrl:String;

		private static const TWITTER_MAX_CHARACTERS:Number = 140;
		private var _urlCompressionServiceUrl:String = "http://tinyurl.com/api-create.php?url=";

		protected var _playerUrl:String;

		public function TwitterMediator(id:String, controller:IPlayerController, metadata:ItemMetaData = null, resources:Object = null)
		{
			super(id, controller, metadata, resources);
			_playerController = controller;
			init();
		}

		protected function init():void
		{
			_controller.addEventListener(PdkEvent.OnReleaseStart, releaseStart);
			_controller.addEventListener(PdkEvent.OnLoadRelease, loadRelease);
			_controller.addEventListener(PdkEvent.OnLoadReleaseUrl, loadRelease);
			_controller.addEventListener(PdkEvent.OnMediaStart, mediaStart);
		}

		private function releaseStart(e:PdkEvent):void
		{
			_pid = (e.data as Playlist).releasePID;
			_baseClip = null;
			enableButton();
		}

		private function loadRelease(e:PdkEvent):void
		{
			var release:Release = e.data as Release;
			_pid = release.pid;
			_baseClip = new BaseClip();
			_baseClip.title = release.title;
			_baseClip.description = release.description;
			_baseClip.guid = release.guid;
			for each (var customValue:CustomValue in release.customValues)
			{
				if (!_baseClip.contentCustomData)
					_baseClip.contentCustomData = new CustomData();
				_baseClip.contentCustomData.addValue(customValue.fieldName.toLowerCase(), customValue.value as String);
			}
            _clip = _playerController.createClipFromBaseClip(_baseClip);
			enableButton();
		}

		private function mediaStart(e:PdkEvent):void
		{
			var newClip:BaseClip = (e.data as Clip).baseClip;
			if (!newClip.isAd && !newClip.noSkip)
			{
				_clip = (e.data as Clip)
				_baseClip = (e.data as Clip).baseClip;
			}
		}

		private function enableButton():void
		{
			_controller.trace("Enabling button " + _pid, "TwitterMediator", Debug.INFO);
			_buttonControl.enabled = true;
		}

		private function disableButton():void
		{
			_controller.trace("Disabling button " + _pid, "TwitterMediator", Debug.INFO);
			_buttonControl.enabled = false;
		}

		override protected function setItem(item:Item):void
		{
			super.setItem(item);

			//handle defaults
			if (_buttonControl.icon == undefined)
				_buttonControl.icon = resources["icon"];
			if (_buttonControl.label == null)
				_buttonControl.label = DEFAULT_LABEL;
			if (_buttonControl.tooltip == null)
				_buttonControl.tooltip = DEFAULT_TOOLTIP;

			_buttonControl.addEventListener(ButtonEvent.OnButtonClick, onClick, false, 0, true);
		}

		override protected function setCard(card:Card):void
		{
			super.setCard(card);
		}


		protected function onClick(e:ButtonEvent):void
		{
			_playerUrl = _controller.getProperty("playerUrl");
			_playerUrl = PdkStringUtils.replaceStr(_playerUrl, "{releasePID}", _pid);
            _playerUrl = PdkStringUtils.replaceStr(_playerUrl, "{releasePid}", _pid);
			_controller.trace("_playerUrl: " + _playerUrl, "TwitterMediator", Debug.INFO);
			var loader:URLLoader = new URLLoader();
			loader.addEventListener(Event.COMPLETE, onCompressedUrl);
			loader.addEventListener(IOErrorEvent.IO_ERROR, onError);
			loader.addEventListener(HTTPStatusEvent.HTTP_STATUS, onCompressedUrl);
			loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onError);

            try
            {
                loader.load(new URLRequest(_urlCompressionServiceUrl + encodeURIComponent(_playerUrl)));
            }
            catch (e:Error)
            {
                _controller.trace(e.toString(), "TwitterMediator", Debug.ERROR);
                _compressedUrl = _playerUrl;

                post();
            }
			

		}

		protected function onError(e:ErrorEvent):void
		{
			// error; just go with the URL as is
			_controller.trace(e.toString(), "TwitterMediator", Debug.ERROR);
			_compressedUrl = _playerUrl;

			post();
		}


		protected function onCompressedUrl(e:Event):void
		{
			_compressedUrl = (e.target as URLLoader).data as String;
			// checking for 404 error
			if (!_compressedUrl)
				_compressedUrl = _playerUrl;
			_controller.trace("onCompressedUrl: " + _compressedUrl, "TwitterMediator", Debug.INFO);
			post();
		}

		protected function post():void
		{
			var tweetURL:String = "http://twitter.com/home?status=";
			var message:String;
			var tags:String = formatTags(_clip);


			if (_baseClip && _baseClip.title)
				message = "Watching " + _baseClip.title + " ";
			else
				message = "Watching ";


			if (tags)
				message += _compressedUrl + " " + tags;
			else
				message += _compressedUrl;
				
			message = substituteReleasePid(message);

			// replace spaces with "+" instead of "%20" because its l337			
			var encodedMessage:String = encodeURIComponent(message).replace(/\%20/g, "+");
			
			tweetURL += encodedMessage;

			_controller.trace("Calling [" + tweetURL + "]", "TwitterMediator", Debug.INFO);
				

			var request:URLRequest = new URLRequest(tweetURL);
			flash.net.navigateToURL(request, "_blank");
		}

		protected function substituteReleasePid(url:String):String
		{
			if (url.indexOf("{releasePID}") >= 0)
			{
				var release:Release = _playerController.getCurrentRelease();
				url = PdkStringUtils.replaceStr(url, "{releasePID}", release.PID);
			}
			return url;
		}
		
		protected function formatTags(clip:Clip):String
		{
			if (!clip || !clip.baseClip)
				return null;

			var delimiter:RegExp = /[\ \,\#]+/;

			var tags:Array = new Array();
			var more:Array;

			if (clip.baseClip.ownerCustomData && clip.baseClip.ownerCustomData.getValue("tags", true))
			{
				more = clip.baseClip.ownerCustomData.getValue("tags", true).split(delimiter);
				tags = mergeTags(tags, more);
			}

			if (clip.baseClip.contentCustomData && clip.baseClip.contentCustomData.getValue("tags", true))
			{
				more = clip.baseClip.contentCustomData.getValue("tags", true).split(delimiter);
				tags = mergeTags(tags, more);
			}

			if (clip.baseClip.outletCustomData && clip.baseClip.outletCustomData.getValue("tags", true))
			{
				more = clip.baseClip.outletCustomData.getValue("tags", true).split(delimiter);
				tags = mergeTags(tags, more);
			}



			if (tags == null)
				return null;

			for (var i:Number = 0; i < tags.length; i++)
			{
				tags[i] = "#" + tags[i];
			}

			return tags.join(" ");
		}

		private function mergeTags(tags:Array, more:Array):Array
		{
			var i:Number;
			var j:Number;
			var contains:Boolean;

			for (i = 0; i < more.length; i++)
			{
				contains = false;

				for (j = tags.length - 1; j >= 0; j--)
				{

					if (tags[j].toString().toLowerCase() == more[i].toString().toLowerCase())
					{
						contains = true;
					}
				}

				if (!contains && more[i] != "")
				{
					tags.push(more[i]);
				}
			}

			return tags;
		}

	}
}
