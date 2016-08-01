package com.theplatform.pdk.plugins.tracking
{

	import com.omniture.AppMeasurement;

	public class FlashAppMeasurement implements IAppMeasurement
	{

		public var _AppMeasurement:AppMeasurement;	
		private var media:IMedia;
		private var _callback:Function;
		
		public function FlashAppMeasurement()
		{
			_AppMeasurement = new AppMeasurement();
			media = new FlashMedia(_AppMeasurement.Media);
		}

		public function ready():Boolean
		{
			return true;
		}
		
		public function get callback():Function
		{
			return _callback;
		}
		
		public function set callback(f:Function):void
		{
			_callback = f;
		}

		public function get version():String
		{
			return _AppMeasurement.version;
		}
		
		public function set version(v:String):void
		{
			_AppMeasurement.version = v;
		}
		
		public function get pageName():String
		{
			return _AppMeasurement.pageName
		}
		
		public function set pageName(p:String):void
		{
			_AppMeasurement.pageName = p;
		}
		
		public function get pageURL():String
		{
			return _AppMeasurement.pageURL;			
		}
		
		public function set pageURL(p:String):void
		{
			_AppMeasurement.pageURL = p;
		}
		
		public function get charSet():String
		{
			return _AppMeasurement.charSet;			
		}
		
		public function set charSet(c:String):void
		{
			_AppMeasurement.charSet = c;
		}
		
		public function get currencyCode():String
		{
			return _AppMeasurement.currencyCode;			
		}
		
		public function set currencyCode(c:String):void
		{
			_AppMeasurement.currencyCode = c;
		}
		
		public function get trackClickMap():Boolean
		{
			return _AppMeasurement.trackClickMap;			
		}
		
		public function set trackClickMap(t:Boolean):void
		{
			_AppMeasurement.trackClickMap = t;
		}
		
		public function get movieID():String
		{
			return _AppMeasurement.movieID;			
		}
		
		public function set movieID(m:String):void
		{
			_AppMeasurement.movieID = m;
		}
		
		public function get trackingServer():String
		{
			return _AppMeasurement.trackingServer;
		}
		
		public function set trackingServer(t:String):void
		{
			_AppMeasurement.trackingServer = t;
		}
		
		public function get trackingServerSecure():String
		{
			return _AppMeasurement.trackingServerSecure;
		}
		
		public function set trackingServerSecure(t:String):void
		{
			_AppMeasurement.trackingServerSecure = t;
		}
		
		public function get debugTracking():Boolean
		{
			return _AppMeasurement.debugTracking;
		}
		
		public function set debugTracking(d:Boolean):void
		{
			_AppMeasurement.debugTracking = d;
		}
		
		public function get trackLocal():Boolean
		{
			return _AppMeasurement.trackLocal;
		}
		
		public function set trackLocal(t:Boolean):void
		{
			_AppMeasurement.trackLocal = t;
		}
		
		public function get trackingDelay():Number
		{
			return _AppMeasurement.trackingDelay;
		}
		
		public function set trackingDelay(t:Number):void
		{
			_AppMeasurement.trackingDelay = t;
		}
		
		public function get account():String
		{
			return _AppMeasurement.account;
		}
		
		public function set account(a:String):void
		{
			_AppMeasurement.account = a;
		}
		
		public function get dc():String
		{
			return _AppMeasurement.dc;
		}
		
		public function set dc(d:String):void
		{
			_AppMeasurement.dc = d;
		}
		
		public function get visitorNamespace():String
		{
			return _AppMeasurement.visitorNamespace;
		}

		public function set visitorNamespace(v:String):void
		{
			_AppMeasurement.visitorNamespace = v;			
		}
		
		public function get events():String
		{
			return _AppMeasurement.events;
		}

		public function set events(e:String):void
		{
			_AppMeasurement.events = e;			
		}
		
		public function get Media():IMedia {
			return media;
		}
		
		public function track():void
		{
			_AppMeasurement.track();
		}
		
		public function trackLink(url:*, type:String, name:String):void
		{
			_AppMeasurement.trackLink(url, type, name);
		}

		public function setProperty(n:String, v:Object):void
		{
			_AppMeasurement[n] = v;
		}

		public function getProperty(n:String):Object
		{
			return _AppMeasurement[n];
		}
	}
}