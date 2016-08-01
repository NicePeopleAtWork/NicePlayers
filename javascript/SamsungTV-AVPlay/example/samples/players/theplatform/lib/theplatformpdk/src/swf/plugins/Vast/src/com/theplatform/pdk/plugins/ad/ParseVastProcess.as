package com.theplatform.pdk.plugins.ad
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.Chapter;
	import com.theplatform.pdk.data.ChapterList;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.events.VastEvent;
	import com.theplatform.pdk.utils.Debug;
	import com.theplatform.pdk.utils.PdkStringUtils;
	
	import flash.events.ErrorEvent;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.events.SecurityErrorEvent;
	import flash.events.TimerEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.utils.Timer;
	import flash.utils.getDefinitionByName;
	import flash.utils.getQualifiedClassName;
	import flash.external.ExternalInterface;	
	
	import net.iab.vast.data.Ad;
	import net.iab.vast.data.InLine;
	import net.iab.vast.data.VideoAdServingTemplate;
	import net.iab.vast.data.Wrapper;
	import net.iab.vast.parsers.VastParserAdapter;

	public class ParseVastProcess extends EventDispatcher
	{
		private const ERROR_TIME_OUT:int = 10000;//5 seconds should suffice
		
		private var _clip:Clip;
		private var _controller:IPlayerController;
		private var _mimeTypes:Array;
		private var _duration:Number;
		private var _timestamp:Number;
		
		private var _loader:URLLoader;
		private var _playlist:Playlist;
		private var _parentWrappers:Array;
		private var _errorTimer:Timer;
		private var _enablePods:Boolean = false;
		private var _destroyed:Boolean = false;
		
		public function ParseVastProcess(clip:Clip, controller:IPlayerController, mimeTypes:Array, duration:Number, timestamp:Number, enablePods:Boolean)
		{
			_clip = clip;
			_controller = controller;
			_mimeTypes = mimeTypes;
			_duration = duration;
			_timestamp = timestamp;
			_playlist = new Playlist();
			_enablePods = enablePods;
			_parentWrappers = [];
		}
		
		public function execute():void
		{
			startErrorTimer();
			loadXML(_clip.URL);
		}
		
		
		private function loadXML(url:String):void
		{
			url = doUrlSubstitutions(url);
			debug("loading XML from: " + url, Debug.INFO);			
			_loader = new URLLoader();
			_loader.addEventListener(Event.COMPLETE, parseXML, false, 0, true);
			_loader.addEventListener(IOErrorEvent.IO_ERROR, handleError, false, 0, true);
			_loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, handleError, false, 0, true);
            try
            {
                _loader.load(new URLRequest(url));
            }
            catch (e:Error)
            {
                debug("call to load url failed:" + e.toString(), Debug.ERROR);
			    adParsed(false);
            }
		}

		private function doUrlSubstitutions(url:String):String
		{
			var page:String = _controller.id;
			var parent:String;

			if (PdkStringUtils.isExternalInterfaceAvailable())
			{
				page = ExternalInterface.call("eval", "document.location.href");
				parent = ExternalInterface.call("eval", "$pdk.parentUrl");
				if (parent)
				{
					page = parent;
				}
			}

			url = url.replace(/\[timestamp\]/gi, _timestamp);
			
			if (PdkStringUtils.isExternalInterfaceAvailable())
			{
				url = url.replace(/\[page_url\]/gi, escape(page));
			}
			else
			{
				url = url.replace(/\[page_url\]/gi, _controller.id);				
			}

			return url;
		}
		
		private function handleError(e:ErrorEvent):void
		{
			debug("call to load url failed:" + e.toString(), Debug.ERROR);
			adParsed(false);
		}
		
		private function parseXML(e:Event):void
		{
			if (_destroyed) return;//just ignore
			var xmlString:String = e.currentTarget.data;
			if (!xmlString)
			{
				debug("*** ERROR: unable to load XML", Debug.ERROR);
				adParsed(false);
			}
			else
			{		
				var vast:VideoAdServingTemplate = null;	
				try
				{
					vast = VastParserAdapter.parse(xmlString);
				}
				catch (e:Error)
				{
					debug("XML could not be parsed:\n" + e.getStackTrace(), Debug.ERROR);
					adParsed(false);
				}
				if (vast != null)
				{				
					processVast(vast);
				}
			}
		}
		
		private function processVast(vast:VideoAdServingTemplate):void
		{	
			// if it's empty, just return it
			if (!vast || !vast.ads || vast.ads.length == 0)
			{
				debug("No ads found", Debug.WARN);
				adParsed(true);
			}
			
			// do some checks for unsupported scenarios
			var wrapperCount:int = 0;
			var inLineCount:int = 0; 
			var sequenceCount:int = 0;
			var wrapperSequenceCount:int = 0;

			for (var i:int = 0; i < vast.ads.length; i++)
			{
				var ad:Ad = vast.ads[i];


				if (ad is Wrapper)
				{
					wrapperCount++;
					if (ad.sequence && !isNaN(ad.sequence))
					{
						wrapperSequenceCount++;
					}
				}
				else if (ad is InLine)
				{
					inLineCount++;
					if (ad.sequence && !isNaN(ad.sequence))
					{
						sequenceCount++;
					}
				}
				else
				{
					debug("Unknown ad type: \"" + Class(getDefinitionByName(getQualifiedClassName(ad))) + "\"; ignoring", Debug.WARN);
				}				
			}
			if (wrapperCount > 1)
			{
				debug("This playlist has multiple wrappers; not supported", Debug.ERROR);
				adParsed(false);
				return;
			}
			if (wrapperCount > 0 && inLineCount > 0)
			{
				debug("This playlist has a mix of wrappers and inline ads; not supported", Debug.ERROR);
				adParsed(false);
				return;
			}
			
			// if Ads have sequence Ids they must be choosen or error out
			if (_enablePods && (sequenceCount > 0))
			{
				debug("Detected VAST 3.0 sequence attributes", Debug.INFO);
				var pod:Array = new Array();
				var ads:Array = new Array();

				for (i = 0; i < vast.ads.length; i++ )
				{
					if ( (vast.ads[i] as Ad).sequence && !isNaN((vast.ads[i] as Ad).sequence) )
					{
						ads.push(vast.ads[i]);
					}
				}

				while(ads.length > 0)
				{
					var lowestSequence:Number = Number.MAX_VALUE;
					var lowestIndex:Number = -1;
					var sequence:Number = 0;

					for (i = 0; i < ads.length; i++ )
					{
						sequence = Number((vast.ads[i] as Ad).sequence);
						if (sequence < lowestSequence)
						{
							lowestSequence = sequence;
							lowestIndex = i;
						}
					}
					pod.push(ads[lowestIndex]);
					ads.splice(lowestIndex, 1);
				}

				for (i = 0; i < pod.length; i++ )
				{
					processInLine(pod[i] as InLine);
				}

				adParsed(true);
			}
			else if (wrapperCount == 1)
			{
				debug("Detected VAST 2.0 wrapper", Debug.INFO);
				processWrapper(vast.ads[0] as Wrapper);
			}
			else if (inLineCount > 0)
			{
				debug("Detected VAST 2.0 inline", Debug.INFO);
				// if pods are turned on, we only play one Ad when there's no sequence attributes
				if (_enablePods)
				{
					if (vast.ads.length > 1)
					{
						debug("Playing only first inline, since VAST 3.0 was triggered", Debug.INFO);
					}
					processInLine(vast.ads[0] as InLine);
				}
				else
				{
					debug("Playing all inlines, since VAST 2.0 was triggered", Debug.INFO);
					for (i = 0; i < vast.ads.length; i++ )
					{
						processInLine(vast.ads[i] as InLine);
					}					
				}

				adParsed(true);
			}
			else {
				adParsed(true);
			}
		}
		
		private function processWrapper(wrapper:Wrapper):void
		{
			debug("Resolving wrapper::" + wrapper.id + " from \"" + wrapper.adSystem + "\"");
			_parentWrappers.push(wrapper);
			loadXML(wrapper.vastAdTagURL);
		}
		
		private function processInLine(inLine:InLine):void
		{
			debug("Resolving inLine::" + inLine.id + " from \"" + inLine.adSystem + "\"");
			var baseClip:BaseClip = new BaseClip();
			baseClip.isAd = true;
			baseClip.noSkip = _clip.baseClip.noSkip;;
			baseClip.releaseID = _clip.baseClip.releaseID;
			var converter:VastConverter = new VastConverter(baseClip, _mimeTypes, _duration);
			converter.addEventListener(VastEvent.OnVastDebug, handleDebug, false, 0, true);
			converter.convertInLine(inLine);			
			for (var i:int = 0; i < _parentWrappers.length; i++)
			{
				var parentWrapper:Wrapper = _parentWrappers[i] as Wrapper;
				debug("Adding Wrapper Events: " + parentWrapper.trackingEvents);
				if (parentWrapper.videoClicks)
				{
					debug("Adding Wrapper VAST 2.0 VideoClicks");
					converter.addVideoClicks(parentWrapper.videoClicks);
				}
				converter.addImpressions(parentWrapper);
				converter.addTrackingUrls(parentWrapper);
			}
			debug("Found MediaFile: " + baseClip.URL);
			converter.removeEventListener(VastEvent.OnVastDebug, handleDebug);
			if (baseClip.URL)//if there is no url, then there were no valid files in vast
			{
				// the baseClip is updated inside of the converter
				var duration:Number = (inLine.video ? inLine.video.duration : -1);
				baseClip.clipBegin = 0;
				baseClip.clipEnd = duration;
				baseClip.releaseLength = duration;
				baseClip.trueLength = duration;
				var clip:Clip = _controller.createClipFromBaseClip(baseClip);
				clip.baseClip = baseClip;
				_playlist.addClip(clip);
				clip.chapter = new Chapter();
				clip.chapter.index = _playlist.clips.length - 1;
				clip.chapter.startTime = 0;
				clip.chapter.endTime = duration;
				debug("Adding Clip to Playlist: " + baseClip.URL);

				if (_playlist.clips.length > 1)
				{
					var lastClip:Clip = _playlist.clips[_playlist.clips.length-2];
					clip.chapter.aggregateStartTime = lastClip.chapter.aggregateStartTime + lastClip.chapter.endTime;
					clip.chapter.chapters = lastClip.chapter.chapters;
					clip.chapter.chapters.isAggregate = true;
				}
				else
				{
					clip.chapter.chapters = new ChapterList();
					clip.chapter.aggregateStartTime = 0;
				}
				clip.chapter.chapters.chapters.push(clip.chapter);
				clip.chapter.chapters.aggregateLength += duration;
				clip.chapter.endTime = clip.chapter.startTime + duration;
			}
			else
			{
				//not actually true, if there's no URL we still may have valid companions/nolinears
//
//				var playlist:Playlist = _controller.getCurrentClip().baseClip.playlistRef;
//
//
//
//				if (playlist.baseClips.length>=playlist.currentIndex+2)
//				{
//					var bc:BaseClip = playlist.baseClips[playlist.currentIndex+1];
//
//					bc.overlays=baseClip.overlays;
//					bc.banners=baseClip.banners;
//
//					//these two might not be wanted
//					bc.trackingURLs=baseClip.trackingURLs;
//					bc.impressionUrls=baseClip.impressionUrls;
//
//
//				}
//				//else we do nothing

                _playlist.unattachedOverlays = baseClip.overlays;
                _playlist.unattachedBanners = baseClip.banners;
			}
		}
		
		private function adParsed(parsed:Boolean):void
		{
			endErrorTimer();
			if (_destroyed) return;//just ignore
			if (parsed)
			{
				dispatchEvent(new VastEvent(VastEvent.OnVastAdSuccess, _playlist));
			}
			else
			{
				dispatchEvent(new VastEvent(VastEvent.OnVastAdFailure, _clip));
			}
		}
		
		private function startErrorTimer():void
		{
			if (!_errorTimer)
			{
				_errorTimer = new Timer(ERROR_TIME_OUT, 1);
				_errorTimer.addEventListener(TimerEvent.TIMER, errorTick, false, 0, true);
				_errorTimer.start();
			}
		}
		
		private function endErrorTimer():void
		{
			if (_errorTimer)
			{
				_errorTimer.removeEventListener(TimerEvent.TIMER, errorTick);
				_errorTimer.stop();
				_errorTimer = null;
			}
		}
		
		private function errorTick(e:TimerEvent):void
		{
            debug("VAST timed out" + e.toString(), Debug.ERROR);
			adParsed(false);
		}
		
		private function handleDebug(e:VastEvent):void
		{
			var message:String = e.data.message;
			var className:String = e.data.className;
			var level:int = e.data.level;
			debug(message, level, className);
		}
				
		private function debug(message:String, level:int = 4, className:String = "ParseVastProcess"):void
		{
			if (!_destroyed) dispatchEvent(new VastEvent(VastEvent.OnVastDebug, {message:message, className:className, level:level}));
		}
		
		private function removeLoader():void
		{
			if (_loader)
			{
				try
				{
					_loader.close();
					_loader = null;
				}
				catch (e:Error) {}
			}
		}
		
		public function destroy():void
		{
			removeLoader();
			endErrorTimer();
			_destroyed = true;
		}
	}
}