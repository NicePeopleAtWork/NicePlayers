package com.theplatform.pdk.mediators
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.controls.Item;
	import com.theplatform.pdk.controls.PlayerControl;
	import com.theplatform.pdk.controls.RelatedItemsControl;
	import com.theplatform.pdk.data.CardCallerType;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.Release;
	import com.theplatform.pdk.data.ReleaseFeed;
	import com.theplatform.pdk.data.ReleaseState;
	import com.theplatform.pdk.events.PlayerEvent;
	import com.theplatform.pdk.events.RelatedItemInteractionEvent;
	import com.theplatform.pdk.functions.MenuFormFunctions;
	import com.theplatform.pdk.metadata.ItemMetaData;
	import com.theplatform.pdk.parsers.ReleaseFeedParser;
	import com.theplatform.pdk.utils.Debug;
	import com.theplatform.pdk.utils.PdkStringUtils;
	
	import flash.events.ErrorEvent;
	import flash.events.Event;
	import flash.events.HTTPStatusEvent;
	import flash.events.IEventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.events.ProgressEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;

	public class RelatedItemsMediator extends PlayerControlMediator
	{
		private const RELATED_TO_PID_PATTERN:Array = ["{releasePID}", "{releasePid}"];
		private const RELATED_TO_ID_PATTERN:Array = ["{id}", "{ID}", "{Id}"];
		
		protected var _relatedItemsControl:RelatedItemsControl;
		protected var _urlRequest:URLRequest;
		protected var _urlLoader:URLLoader;
		protected var _releaseFeed:ReleaseFeed;
		protected var _clip:Clip;

		public function RelatedItemsMediator(id:String, controller:IViewController, metadata:ItemMetaData = null, resources:Object = null)
		{
			super(id, controller, metadata, resources);
			init();
		}
		
		private function init():void
		{
			_controller.addEventListener(PlayerEvent.OnRelatedContentIdsReceived, RelatedContentIdEventHandler);
		}
		
		private function RelatedContentIdEventHandler(pev:PlayerEvent):void
		{	
			var startUrl:String = _controller.getProperty("relatedItemsURL");
			var urlArr:Array = startUrl.split("?");
			var newUrl:String;
			var contentIds:Array = pev.data as Array;
			
			if(urlArr.length > 1)
			{
				newUrl = urlArr[0] + contentIds.join(",") + "/?" + urlArr[1];
			}
			else
			{
				newUrl = urlArr[0] + contentIds.join(",") + "/";
			}
			
			createUrlRequest(newUrl);
		}
		
		private function createUrlRequest(url:String):void
		{
			var u:String = decorateUrl(url);
			
			if (u)
			{
				_urlRequest = new URLRequest(u);
				_urlLoader = new URLLoader(_urlRequest);
				
				_controller.trace("related items request: " + u, "RelatedItemsMediator", Debug.INFO);
				addURLLoadedListeners(_urlLoader);
				try
				{
					_urlLoader.load(_urlRequest);
				}
				catch (e:Error)
				{
					
				}
			}
			else
			{
				card.call(MenuFormFunctions.onRelatedItemURLIOError, [null]);
			}
		}

		override protected function setItem(item:Item):void
		{
			super.setItem(item);
			
			_relatedItemsControl = item as RelatedItemsControl;
            updateItems();
        }

        private function updateItems():void
        {
            var relatedItemsURL:String = _controller.getProperty("relatedItemsURL")
            var pc:PlayerController = _controller as PlayerController;
            var callerType:String = card.initVars["callerType"];

            if (relatedItemsURL)
            {
                if (pc.getReleaseState() == ReleaseState.STANDBY && callerType == CardCallerType.END_CARD)
                {
                    var prev:Clip = pc.getPreviousClip();
                    if (prev)
                    {
                        _clip = prev;
                    }
                }
                if (!_clip)
                {
                    _clip = pc.getCurrentClip();
                }

                if (!IPlayerController(_controller).checkRelatedContentIds(_clip))
                {
                    createUrlRequest(relatedItemsURL);
                }
                //if true, it should hit RelatedContentIdEventHandler

                // add listeners
                _relatedItemsControl.addEventListener(RelatedItemInteractionEvent.OnItemClick, handleItemClick, false, 0, true);
                _relatedItemsControl.addEventListener(RelatedItemInteractionEvent.OnItemRollover, handleItemRollover, false, 0, true);
                _relatedItemsControl.addEventListener(RelatedItemInteractionEvent.OnItemRollout, handleItemRollout, false, 0, true)
                _relatedItemsControl.addEventListener(RelatedItemInteractionEvent.OnNextClick, handleNextClick, false, 0, true);
                _relatedItemsControl.addEventListener(RelatedItemInteractionEvent.OnPreviousClick, handlePreviousClick, false, 0, true);
            }
            else
            {
                //destroy self?  the code shouldn't get here
                trace("no related items URL");
            }
        }


		//
		// RIInteractionEvents

		protected function handleItemClick(e:RelatedItemInteractionEvent):void
		{
			//	trace(e.type + ": " + e.data);
			var release:Release = e.data as Release;
			
			if (release && release.url)
				_controller.setReleaseURL(release.url);
		}

		protected function handleNextClick(e:RelatedItemInteractionEvent):void
		{
			_relatedItemsControl.currentPage++;
            card.call(MenuFormFunctions.setRelatedItemsHeaderRange, [_relatedItemsControl.getHeaderRangeString()]);
            updateItems();


		}

		protected function handlePreviousClick(e:RelatedItemInteractionEvent):void
		{
			_relatedItemsControl.currentPage--;
            card.call(MenuFormFunctions.setRelatedItemsHeaderRange, [_relatedItemsControl.getHeaderRangeString()]);
            updateItems();

		}

		protected function handleItemRollover(e:RelatedItemInteractionEvent):void
		{
		//	trace(e.type + ": " + e.data);
			
			var clipTitle:String = Release(e.data).title;

			if (clipTitle)
				card.call(MenuFormFunctions.setRelatedItemsClipTitle, [clipTitle]);
		}

		protected function handleItemRollout(e:RelatedItemInteractionEvent):void
		{
			//	trace(e.type + ": " + e.data);
			card.call(MenuFormFunctions.revertRelatedItemsClipTitle, []);
		}


		protected function addURLLoadedListeners(dispatcher:IEventDispatcher):void
		{
			dispatcher.addEventListener(Event.COMPLETE, completeHandler, false, 0, true);
			dispatcher.addEventListener(SecurityErrorEvent.SECURITY_ERROR, errorHandler, false, 0, true);
			dispatcher.addEventListener(IOErrorEvent.IO_ERROR, errorHandler, false, 0, true);
		}

		protected function destroyURLLoadedListeners(dispatcher:IEventDispatcher):void
		{
			dispatcher.removeEventListener(Event.COMPLETE, completeHandler);
			dispatcher.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, errorHandler);
			dispatcher.removeEventListener(IOErrorEvent.IO_ERROR, errorHandler);
		}
		
		protected function decorateUrl(url:String):String
		{
			//replace the PID
			var currentPID:String;
			var currentID:String;

			if (_clip)
			{
				currentPID = _clip.releasePID;
				currentID = _clip.baseClip.contentID;
			}
			if (!_clip || !currentPID)
			{
				var release:Release = PlayerController(_controller).getCurrentRelease();
				if (release)
				{
					currentPID = release.pid;
					currentID = (release.id ? release.id.substr(release.id.lastIndexOf("/") + 1) : "")
				}
			}
			if (currentPID || currentID)
			{
				url = PdkStringUtils.replaceStrs(url, RELATED_TO_ID_PATTERN, currentID);
				url = PdkStringUtils.replaceStrs(url, RELATED_TO_PID_PATTERN, currentPID);
			}
			else
			{
				_controller.trace("There was no PID or ID for the release or clip, we can't continue with the related items", "RelatedItemsMediator", Debug.WARN);
				return null;
			}
			
			//add form=JSON
			var lcUrl:String = url.toLowerCase();
			if (lcUrl.indexOf("form=json") < 0)
			{
				if (url.indexOf("?") > 0)
				{
					url += "&form=JSON";
				}
				else if (url.charAt(url.length -1) == "/")
				{
					url += "?form=JSON";
				}
				else
				{
					url += "/?form=JSON";
				}
			}

            var itemsPerPage:Number = _relatedItemsControl.relatedItemsPerPage;

            var range:String = "&count=true&range="+((_relatedItemsControl.currentPage*itemsPerPage-itemsPerPage+1))+"-"+((_relatedItemsControl.currentPage*itemsPerPage));

            url+=range;

            if (url.indexOf("fields=") < 0)
            {
                url += "&fields=defaultThumbnailUrl,title,content&fileFields=url"
            }
			
			return url;
		}
			


		override public function destroy():void
		{
			_relatedItemsControl.removeEventListener(RelatedItemInteractionEvent.OnItemClick, handleItemClick);
			_relatedItemsControl.removeEventListener(RelatedItemInteractionEvent.OnItemRollover, handleItemRollover);
			_relatedItemsControl.removeEventListener(RelatedItemInteractionEvent.OnItemRollout, handleItemRollout);
			_relatedItemsControl.removeEventListener(RelatedItemInteractionEvent.OnNextClick, handleNextClick);
			_relatedItemsControl.removeEventListener(RelatedItemInteractionEvent.OnPreviousClick, handlePreviousClick);
			
			_controller.removeEventListener(PlayerEvent.OnRelatedContentIdsReceived, RelatedContentIdEventHandler);

			if (_urlLoader)
				destroyURLLoadedListeners(_urlLoader);
		}


		//
		// loader event handeling
		private function completeHandler(event:Event):void
		{
			var json:String = event.target.data as String;
			try
			{
				_releaseFeed = ReleaseFeedParser.parse(json);
			}
			catch (e:Error){}//there was an error parsing the url, we'll let the world know below.

			if (_releaseFeed && _releaseFeed.entries.length > 0)
			{
				_relatedItemsControl.releaseFeed = _releaseFeed;
				card.call(MenuFormFunctions.setRelatedItemsHeaderRange, [_relatedItemsControl.getHeaderRangeString()]);
			}
			else
			{
				_controller.trace("RelatedItems ioError: ReleaseFeedParser could not resolve any releases. JSON:" + json, "RelatedItemsMediator", Debug.ERROR);
				card.call(MenuFormFunctions.onRelatedItemURLIOError, [event]);
			}

		}

		private function errorHandler(event:ErrorEvent):void
		{
			_controller.trace("relatedItemsURL error:" + event.text, "RelatedItemsMediator", Debug.ERROR);
			card.call(MenuFormFunctions.onRelatedItemURLIOError, [event]);
		}
	}
}
