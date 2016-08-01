package com.theplatform.pdk.plugins.tracking
{

	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.utils.Debug;
	import flash.external.ExternalInterface;

	public class JSAppMeasurement implements IAppMeasurement
	{

		private var media:IMedia;
		private var _s_code_name:String;
		private var _jsUrl:String;
		private var _callback:Function;
		private var _ready:Boolean = false;
		private var _controller:IPlayerController;
		
		public function JSAppMeasurement(n:String, url:String, controller:IPlayerController, account:String)
		{
			_s_code_name = n;
			_jsUrl = url;
			_controller = controller;
			
			_controller.trace("JSAppMeasurement s_code: " + _s_code_name + ' ' + ExternalInterface.call("eval", "window." + _s_code_name));
			
			_ready = ExternalInterface.call("eval", _s_code_name + " ? true : false");

			_controller.trace("JSAppMeasurement loading. ready = " + _ready, "OmnitureMedia", Debug.INFO);
			
			if (_ready)
			{
				media = new JSMedia(n);
			}
			else
			{
				_controller.trace("JSAppMeasurement loading default site catalyst JS...", "OmnitureMedia", Debug.INFO);
				_controller.trace("JSAppMeasurement: " + url, "OmnitureMedia", Debug.INFO);

				if (account)
				{
					ExternalInterface.call("eval", "window.s_account = '" + account + "'");
				}

				_controller.addEventListener(PdkEvent.OnJavascriptLoaded, onScriptLoaded)
				ExternalInterface.call("tpLoadJScript", url, "tpOmnitureCallback = function (url) { if (!window.$pdk) { $pdk = {controller: tpController}; } $pdk.controller.dispatchEvent('OnJavascriptLoaded', 'Omniture.SiteCatalyst')}");
			}
		}
		
		public function onScriptLoaded(e:PdkEvent):void
		{
			if (callback && e.data == "Omniture.SiteCatalyst")
			{
				_controller.trace("JSAppMeasurement " + e.data + " loaded", "OmnitureMedia", Debug.INFO);
				media = new JSMedia(_s_code_name);
				_ready = true;
				callback();
			}
		}
		
		public function ready():Boolean
		{
			return _ready;
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
			return ExternalInterface.call("eval", _s_code_name + ".version");
		}
		
		public function set version(v:String):void
		{
			ExternalInterface.call("eval", _s_code_name + ".version = '" + v + "'");
		}
		
		public function get pageName():String
		{
			return ExternalInterface.call("eval", _s_code_name + ".pageName");
		}
		
		public function set pageName(p:String):void
		{
			ExternalInterface.call("eval", _s_code_name + ".pageName = '" + p + "'");
		}
		
		public function get pageURL():String
		{
			return ExternalInterface.call("eval", _s_code_name + ".pageURL");			
		}
		
		public function set pageURL(p:String):void
		{
			ExternalInterface.call("eval", _s_code_name + ".pageURL = '" + p + "'");
		}
		
		public function get charSet():String
		{
			return ExternalInterface.call("eval", _s_code_name + ".charSet");			
		}
		
		public function set charSet(c:String):void
		{
			ExternalInterface.call("eval", _s_code_name + ".charSet = '" + c + "'");
		}
		
		public function get currencyCode():String
		{
			return ExternalInterface.call("eval", _s_code_name + ".currencyCode");			
		}
		
		public function set currencyCode(c:String):void
		{
			ExternalInterface.call("eval", _s_code_name + ".currencyCode = '" + c + "'");
		}
		
		public function get trackClickMap():Boolean
		{
			return ExternalInterface.call("eval", _s_code_name + ".trackClickMap");			
		}
		
		public function set trackClickMap(t:Boolean):void
		{
			ExternalInterface.call("eval", _s_code_name + ".trackClickMap = " + t);
		}
		
		public function get movieID():String
		{
			return ExternalInterface.call("eval", _s_code_name + ".movieID");			
		}
		
		public function set movieID(m:String):void
		{
			ExternalInterface.call("eval", _s_code_name + ".movieID = '" + m + "'");
		}
		
		public function get trackingServer():String
		{
			return ExternalInterface.call("eval", _s_code_name + ".trackingServer");
		}
		
		public function set trackingServer(t:String):void
		{
			ExternalInterface.call("eval", _s_code_name + ".trackingServer = '" + t + "'");
		}
		
		public function get trackingServerSecure():String
		{
			return ExternalInterface.call("eval", _s_code_name + ".trackingServerSecure");
		}
		
		public function set trackingServerSecure(t:String):void
		{
			ExternalInterface.call("eval", _s_code_name + ".trackingServerSecure = '" + t + "'");
		}
		
		public function get debugTracking():Boolean
		{
			return ExternalInterface.call("eval", _s_code_name + ".debugTracking");
		}
		
		public function set debugTracking(d:Boolean):void
		{
			ExternalInterface.call("eval", _s_code_name + ".debugTracking = " + d);
		}
		
		public function get trackLocal():Boolean
		{
			return ExternalInterface.call("eval", _s_code_name + ".trackLocal");
		}

		public function set trackLocal(t:Boolean):void
		{
			ExternalInterface.call("eval", _s_code_name + ".trackLocal = " + t);
		}
		
		public function get trackingDelay():Number
		{
			return ExternalInterface.call("eval", _s_code_name + ".trackingDelay");
		}
		
		public function set trackingDelay(t:Number):void
		{
			ExternalInterface.call("eval", _s_code_name + ".trackingDelay = " + t);
		}
		
		public function get account():String
		{
			return ExternalInterface.call("eval", _s_code_name + ".account");
		}
		
		public function set account(a:String):void
		{
			ExternalInterface.call("eval", _s_code_name + ".account = '" + a + "'");
		}
		
		public function get dc():String
		{
			return ExternalInterface.call("eval", _s_code_name + ".dc");
		}
		
		public function set dc(d:String):void
		{
			ExternalInterface.call("eval", _s_code_name + ".dc = '" + d + "'");
		}
		
		public function get visitorNamespace():String
		{
			return ExternalInterface.call("eval", _s_code_name + ".visitorNamespace");
		}

		public function set visitorNamespace(v:String):void
		{
			ExternalInterface.call("eval", _s_code_name + ".visitorNamespace = '" + v + "'");			
		}
		
		public function get events():String
		{
			return ExternalInterface.call("eval", _s_code_name + ".events");
		}

		public function set events(e:String):void
		{
			ExternalInterface.call("eval", _s_code_name + ".events = '" + e + "'");			
		}
		
		public function get Media():IMedia {
			return media;
		}
		
		public function track():void
		{
			ExternalInterface.call("eval", _s_code_name + ".track()");
		}
		
		public function trackLink(url:*, type:String, name:String):void
		{
			if (url is String)
				ExternalInterface.call("eval", _s_code_name + ".trackLink('" + url + "', '" + type + "', '" + name + "')");
			else
				ExternalInterface.call("eval", _s_code_name + ".trackLink({}, '" + type + "', '" + name + "')");
		}

		public function setProperty(n:String, v:Object):void
		{
			ExternalInterface.call("eval", _s_code_name + "['" + n + "'] = '" + v + "'");
		}

		public function getProperty(n:String):Object
		{
			return ExternalInterface.call("eval", _s_code_name + "['" + n + "']");
		}
	}
}