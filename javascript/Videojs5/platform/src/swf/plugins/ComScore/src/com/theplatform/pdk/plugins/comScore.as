package  com.theplatform.pdk.plugins {
	
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.ChapterList;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.data.TrackingUrl;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.utils.Debug;

	import flash.events.ErrorEvent;

	import flash.external.ExternalInterface;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.HTTPStatusEvent;
	import flash.events.IEventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.events.ProgressEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;

	public class comScore extends Sprite implements IPlugIn
	{
		private var VERSION:String = "1.0";
		private static const URL:String = "http://b.scorecardresearch.com/b?";
		
		private var _lo:LoadObject;
		private var _controller:IPlayerController;
		
		// LoadVars
		// Required
		private var _c2:String = "";  		// comScore  ID for the distribution platform
		private var _c3:String = "";		// The owner-level custom field to map to the comScore ID for the content owner
		private var _c4:String = "";  		// comScore  ID for location/site where content was viewed
		 // Optional
		private var _c5:String = "";	// The content-level custom field to map to the "c5" field
		private var _c6:String = ""; 	// The content-level custom field to map to the "c6" field
		private var _c10:String = "";
        private var _minLongformDuration:Number = Number.MIN_VALUE;
		
		private var _clip:Clip;
		private var _baseClip:BaseClip;
		private var _longForm:Boolean = false;
		private var _chapters:Number;
		//private var _longFormNeedsDispatch:Boolean = false;
		private var _longFormGUID:String;
		private var _trackEachChapter:Boolean = false;
		
		private var _currentAdState:Number = PRE;
				
		private static var PRE:Number = 0;
		private static var MID:Number = 1;
		private static var POST:Number = 2;
		
		/**
		 * What is the event that is fired after initial loading but before playing? 
		 * How to determine midroll? 
		 * How to determine longForm content? 
		 */
		
		public function comScore()
		{
		}
		/**
		 * Initialize the plugin with the load object
		 * @param lo load object
		 */ 
		public function initialize(lo:LoadObject):void
		{			
			
			_lo = lo;
			_controller = _lo.controller as IPlayerController;
			_controller.trace("ComScorePlugin loading", "ComScore", Debug.INFO);
			
			// get various required loadvars


			_c2 = _lo.vars['c2'];
			if(_c2 == null || _c2.length == 0) {
				_controller.trace("*** ERROR: missing 'c2' parameter", "ComScore", Debug.FATAL);
				return;
			}
			_c3 = _lo.vars['c3Field'];
			if(_c3 == null || _c3.length == 0) {
				_c3 = _c2;
			}
			_c4 = _lo.vars['c4'];
			if(_c4 == null || _c4.length == 0) {
				_controller.trace("*** ERROR: missing 'c4' parameter", "ComScore", Debug.FATAL);
				return;
			}
			_c5 = _lo.vars['c5Field'];
			_c6 = _lo.vars['c6Field'];

            var minLongformDuration:Number = Number(_lo.vars["minLongformDuration"]);
            if(minLongformDuration) {
                _minLongformDuration = minLongformDuration * 60;
            }
			
			_trackEachChapter = (lo.vars['trackEachChapter'] == "true" ? true : false);

			_controller.addEventListener(PdkEvent.OnPlugInsComplete, loadComplete);
			
			_controller.trace("*** ComScorePlugin LOADED *** version:[" + VERSION + "]", "ComScore", Debug.INFO);
			_controller.trace("params: "+getParams(),"ComScore", Debug.INFO);
		}
		
		/**
		 * Load complete, register for rest of events 
		 * @param event the pdkevent for completing registration of plugins
		 */ 
		private function loadComplete(event:PdkEvent):void 
		{
			_controller.trace("loadComplete, adding listeners", "ComScore", Debug.INFO);
			_controller.removeEventListener(PdkEvent.OnPlugInsComplete, loadComplete);
						
			_controller.addEventListener(PdkEvent.OnReleaseStart, onReleaseStart);
			_controller.addEventListener(PdkEvent.OnMediaStart, onMediaStart);
			_controller.addEventListener(PdkEvent.OnReleaseEnd, onReleaseEnd);
		}
		
		private function onReleaseStart(e:PdkEvent):void
		{	
			var playlist:Playlist = e.data as Playlist;
			var chapterList:ChapterList = playlist.chapters;
            var baseClip:BaseClip = playlist.firstContentBaseClip;
            var length:Number = Math.floor(baseClip.releaseLength / 1000);

			_currentAdState = PRE;

            _controller.trace("onReleaseStart, length: "+length+" _minLongFormDuration: "+_minLongformDuration , "ComScore", Debug.INFO);

			if(isLongForm(_minLongformDuration,length,chapterList.chapters))  {				
				_longForm = true;
				_chapters = chapterList.chapters.length;
			} else {
				_longForm = false;
			}
			
			_controller.trace("onReleaseStart, longForm="+_longForm , "ComScore", Debug.INFO);
		}

        private function isLongForm(minLongFormDuration:Number, length:Number, chapters:Array):Boolean {        	
            if(minLongFormDuration != Number.MIN_VALUE) {
                return length > minLongFormDuration
            }
            return (chapters && chapters.length > 1)
        }
		
		private function onMediaStart(e:PdkEvent):void
		{
			_clip = e.data as Clip;			
			_baseClip = _clip.baseClip;

			if (!_baseClip.isAd)
			{
				// if we're playing content chapter, next ad is midroll
				if (_currentAdState == PRE)
				{
					_currentAdState = MID;
				}
				// if we're playing last chapter, next ad is postroll
				if (_clip.clipIndex == _chapters-1)
				{
					_currentAdState = POST;
				}
			}

			_c3 = _lo.vars['c3Field'];
			_c5 = _lo.vars['c5Field'];
			_c6 = _lo.vars['c6Field'];

			_c10 = "";
			
			_controller.trace("onMediaStart, longForm="+_longForm + " guid="+_longFormGUID, "ComScore", Debug.INFO);

			if(_longForm && !_longFormGUID) {
				_controller.trace("long form, copying guid", "ComScore", Debug.INFO);
				_longFormGUID = _baseClip.guid;
				dispatchBeacon();
			}
			else if (_trackEachChapter) {
				_controller.trace("long form, tracking successive chapters", "ComScore", Debug.INFO);
				dispatchBeacon();
			}
			else if (_longFormGUID != _baseClip.guid) {
				_controller.trace("already had a guid", "ComScore", Debug.INFO);
				dispatchBeacon();
			}
		}
		
		private function onReleaseEnd(e:PdkEvent):void
		{
			
			if(_longForm)  {
				_longForm = false;
				_longFormGUID = null;
			}
		}
		
		protected function getParams():String
		{
			if(_baseClip) {	
				if(_c3)				
					_c3 = getProperty(_baseClip, _c3);

				_c5 = (_c5 ? getProperty(_baseClip, _c5) : getCategorizationCode());

                if(_c6)
					_c6 = getProperty(_baseClip, _c6);
			}
			if (!_c3)
				_c3 = _c2;

			if(!_c5)
				_c5 = "";
			
			if(!_c6)
				_c6 = "";
			if (_longForm)
			{
				_c10 = (_clip.clipIndex+1) + "-" + _chapters;
			}
			else
			{
				_c10 = "";
			}

			if (_clip && _clip.isAd)
			{
				_c6 = "";
				_c10 = "";
			}

			var params:String = "c1=1";
			params += "&c2=" +_c2;
			params += "&c3=" +_c3;
			params += "&c4=" +_c4;
			params += "&c5=" +_c5;
			params += "&c6=" +_c6;
			params += "&c10="+_c10;

			return params;
		}
		
		protected function getCategorizationCode():String {
			var code:String = "";

			if (_baseClip.isAd)
			{
				if (_currentAdState == PRE)
				{
					code = "09";
				}
				else if (_currentAdState == MID)
				{
					code = "11";
				}
				else
				{
					code = "10";
				}				
			}
			else {
				code = (_longForm ? "03" : "02");
			}
			
			return code;
		}
		
		protected function getProperty(bc:BaseClip, prop:String, recursive:Boolean=true):String
		{

			if (recursive && prop.match(/\{([a-zA-Z0-1]+)\}/))
			{
				var result:String = prop;
				var parts:Array = result.match(/\{([a-zA-Z0-1]+)\}/g);
				var value:String;
				
				for (var i:Number=0; i<parts.length; i++)
			   	{
					value = getProperty(bc, result.match(/\{([a-zA-Z0-1]+)\}/)[1], false);
					_controller.trace("replacing " + parts[i] + " with " + value, "ComScore", Debug.INFO);
					result = result.replace(/\{([a-zA-Z0-1]+)\}/, value);
				}

				return result;
			}

            if(!prop)
                return null;

            var propertyKey:String;
            var property:String;

            if(bc.contentCustomData)
                propertyKey = getCustomDataProperty(bc.contentCustomData, prop);

            if(!propertyKey && bc.ownerCustomData)
                propertyKey = getCustomDataProperty(bc.ownerCustomData, prop);

            if(!propertyKey)
                return null;
            if(bc.contentCustomData)
                property = bc.contentCustomData[propertyKey];

            if(!property && bc.ownerCustomData)
                property = bc.ownerCustomData[propertyKey];

            return property;
            /*
			if(prop && bc.contentCustomData && bc.contentCustomData.hasOwnProperty(prop))
			{
				return bc.contentCustomData[prop];
			}
			else if(prop && bc.ownerCustomData && bc.ownerCustomData.hasOwnProperty(prop))
			{
				return bc.ownerCustomData[prop];
			}
			else {
				return null;
			}
			*/
		}

        /**
         * Does a case insensitive hasOwnProperty check
         * @param properties
         * @param key
         * @return
         */
        protected function getCustomDataProperty(properties:Object, key:String):String
        {

            for (var pkey:String in properties) {
                if(pkey.toUpperCase() == key.toUpperCase())
                    return pkey;
            }
            return null;
        }

		protected function dispatchBeacon():void
		{
			_controller.trace("dispatchBeacon, isAd="+_baseClip.isAd, "ComScore", Debug.INFO);

			if (_baseClip.isAd && _baseClip.trackingURLs && _baseClip.trackingURLs.length > 0)
			{
				var alreadyTracked:Boolean = false;
				
				for each(var trackingURL:TrackingUrl in _baseClip.trackingURLs)
				{
					if (String(trackingURL.URL).search(URL) >= 0)
						alreadyTracked = true;
				}
				
				if(alreadyTracked)
					return;

			}
			
			var params:String = getParams();

			comScoreBeacon("1", _c2, _c3, _c4, _c5, _c6, _c10);
/*			var request:URLRequest = new URLRequest(URL+params);
			var loader:URLLoader = new URLLoader();
			configureListeners(loader);
*/
//			loader.load(request);
		}
		
		private function configureListeners(dispatcher:IEventDispatcher):void {
			dispatcher.addEventListener(Event.COMPLETE, completeHandler);
			dispatcher.addEventListener(Event.OPEN, openHandler);
			dispatcher.addEventListener(ProgressEvent.PROGRESS, progressHandler);
			dispatcher.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
			dispatcher.addEventListener(HTTPStatusEvent.HTTP_STATUS, httpStatusHandler);
			dispatcher.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
		}
		
		private function completeHandler(event:Event):void {
			var loader:URLLoader = URLLoader(event.target);
			trace("completeHandler: " + loader.data);
		}
		
		private function openHandler(event:Event):void {
			trace("openHandler: " + event);
		}
		
		private function progressHandler(event:ProgressEvent):void {
			trace("progressHandler loaded:" + event.bytesLoaded + " total: " + event.bytesTotal);
		}
		
		private function securityErrorHandler(event:SecurityErrorEvent):void {
			trace("securityErrorHandler: " + event);
		}
		
		private function httpStatusHandler(event:HTTPStatusEvent):void {
			trace("httpStatusHandler: " + event);
		}
		
		private function ioErrorHandler(event:IOErrorEvent):void {
			trace("ioErrorHandler: " + event);
		}

		protected function comScoreBeacon(c1:String, c2:String, c3:String, c4:String, c5:String, c6:String, c10:String):String {
			var page:String = "", referrer:String = "", title:String = "";

			try {
				page = ExternalInterface.call("function() { return document.location.href; }").toString();
				referrer = ExternalInterface.call("function() { return document.referrer; }").toString();
				title = ExternalInterface.call("function() { return document.title; }").toString();
				if (typeof(page) == "undefined" || page == "null") { page = loaderInfo.url; };
				if (typeof(referrer) == "undefined" || referrer == "null") { referrer = ""; }
				if (typeof(title) == "undefined" || title == "null") { title = ""; }
				if (page != null && page.length > 512) { page = page.substr(0, 512); }
				if (referrer.length > 512) { referrer = referrer.substr(0, 512); }
			}
			catch (e:Error) {
				page = loaderInfo.url;
				trace(e);
			}

			var url:String = (new Array(
			page.indexOf("https:") == 0 ? "https://sb" : "http://b",
				".scorecardresearch.com/p",
				"?c1=", c1,
				"&c2=", escape(c2),
				"&c3=", escape(c3),
				"&c4=", escape(c4),
				"&c5=", escape(c5),
				"&c6=", escape(c6),
				"&c10=", escape(c10),
				"&c7=", escape(page),
				"&c8=", escape(title),
				"&c9=", escape(referrer),
				"&rn=", Math.random(),
				"&cv=2.0"
			)).join("");

			if (url.length > 2080) { url = url.substr(0, 2080); }

			var loader:URLLoader = new URLLoader();
            loader.addEventListener(IOErrorEvent.IO_ERROR, handleError, false, 0, true);
            loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, handleError, false, 0, true);

			_controller.trace("dispatching beacon: " + url, "ComScore", Debug.INFO);

			try
            {
                loader.load(new URLRequest(url));
            }
            catch (e:Error)
            {
                _controller.trace(e.toString(), "comScore", Debug.WARN);
            }

			return url;
		}

        private function handleError(e:ErrorEvent):void
        {
            _controller.trace(e.toString(), "comScore", Debug.WARN);
        }
		
	}
}
