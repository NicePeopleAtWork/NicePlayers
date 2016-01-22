package com.theplatform.pdk.plugins.tracking {
	public interface IAppMeasurement {

		function ready():Boolean;
		function get callback():Function;
		function set callback(f:Function):void;
		function get version():String;
		function get pageName():String;
		function get pageURL():String;
		function get charSet():String;
		function get currencyCode():String;
		function get trackClickMap():Boolean;
		function get movieID():String;
		function get trackingServer():String;
		function get trackingServerSecure():String;
		function get debugTracking():Boolean;
		function get trackLocal():Boolean;
		function get trackingDelay():Number;
		function get account():String;
		function get dc():String;
		function get visitorNamespace():String;
		function get events():String;
		function get Media():IMedia;
		
		function set version(v:String):void;
		function set pageName(p:String):void;
		function set pageURL(p:String):void;
		function set charSet(c:String):void;
		function set currencyCode(c:String):void;
		function set trackClickMap(t:Boolean):void;
		function set movieID(m:String):void;
		function set trackingServer(t:String):void;
		function set trackingServerSecure(t:String):void;
		function set debugTracking(d:Boolean):void;
		function set trackLocal(t:Boolean):void;
		function set trackingDelay(t:Number):void;
		function set account(a:String):void;
		function set dc(d:String):void;
		function set visitorNamespace(v:String):void;		
		function set events(e:String):void;
		
		function track():void;
		function trackLink(url:*, type:String, name:String):void;
		function setProperty(n:String, v:Object):void;
		function getProperty(n:String):Object;
	}
}