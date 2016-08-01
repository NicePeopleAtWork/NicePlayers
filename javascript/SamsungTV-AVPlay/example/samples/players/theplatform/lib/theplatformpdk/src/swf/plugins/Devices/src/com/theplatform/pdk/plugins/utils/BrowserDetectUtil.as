package com.theplatform.pdk.plugins.utils
{
	
	import flash.external.ExternalInterface;
	
	// http://www.quirksmode.org/js/detect.html
	public class BrowserDetectUtil
	{
		// look up tables
		protected var _browsers:Array;
		protected var _OSs:Array;
		
		protected var _browser:String;
		protected var _os:String
		protected var _version:String
		
		private var _versionSearchString:String;
		
		public function BrowserDetectUtil(detectOnInit:Boolean= false)
		{			
			init(detectOnInit)
		}
		
		protected function init(detectOnInit:Boolean):void
		{
			initBrowserData();
			initOSData();
			// to minimise the amount of external interface calls there is an option
			// to delay the detection until params are needed
			if (detectOnInit) {
				_browser = doGetBrowser()
				_os = doGetOS()
				_version = doGetVersion()	
			}
		}
		
		public function get browser():String
		{
			if(!_browser)
				_browser = doGetBrowser();
							
			return _browser	
		}
		
		protected function doGetBrowser():String
		{
			return searchData(_browsers);
		}
		
		public function get os():String
		{
			if(!_os)
				_os = doGetOS();
							
			return _os	
		}
		
		protected function doGetOS():String
		{
			return searchData(_OSs);
		}
		
		public function get version():String
		{
			if(!_version)  {				
				if(!_versionSearchString)
					_browser = doGetBrowser();
				_version = doGetVersion();
			}
										
			return _version	
		}
		
		protected function doGetVersion():String
		{			 
			 var versionNumber:String = searchVersion("window.navigator.userAgent.toString");
			 if (!versionNumber) 
			 	versionNumber = searchVersion("window.navigator.appVersion.toString");
			 if (!versionNumber) 
			 	return null
			 return versionNumber;
		}
		
		private function searchData(data:Array):String
		{
			var sorted:Array = data.sortOn("string")
			
			var string:String;
			var dataString:String;
			
			for each (var d:BrowserData in data) {
				
				if(!string || string != d.string) {					
					dataString = ExternalInterface.call(d.string);
				
					string = d.string
				}
				_versionSearchString = (d.versionSearch)? d.versionSearch : d.identity;	
				if(dataString) 
					if(dataString.indexOf(d.subString) != -1 || d.subString == null)
						return d.identity
								
			}
			// if we don't find anything return null
			_versionSearchString = null
			return null
			
		}
		
		private function searchVersion(browserCall:String):String
		{
			var dataString:String = ExternalInterface.call(browserCall) as String
			var index:Number = dataString.indexOf(_versionSearchString);			
			
			if (index == -1) 
				return null;
			return dataString.substring(index+_versionSearchString.length+1);
			
		}
		
		private function initBrowserData():void
		{						
			// for newer Netscapes (6+)
			addBrowserData("window.navigator.userAgent.toString", "Netscape", "Netscape");			
			// for older Netscapes (4-)
			
			addBrowserData("window.navigator.userAgent.toString", "Mozilla", "Netscape", "Netscape");
			addBrowserData("window.navigator.userAgent.toString", "MSIE", "Explorer", "MSIE");
			addBrowserData("window.navigator.userAgent.toString", "Gecko", "Mozilla", "rv");
			addBrowserData("window.navigator.userAgent.toString", "Chrome", "Chrome");
			addBrowserData("window.navigator.userAgent.toString", "OmniWeb", "OmniWeb","OmniWeb/");
			addBrowserData("window.navigator.userAgent.toString", "Firefox", "Firefox");
			
			addBrowserData("window.navigator.vendor.toString", "Apple", "Safari","Version");
			addBrowserData("window.navigator.vendor.toString", "Mobile", "Mobile Safari","Version");			
			addBrowserData("window.navigator.vendor.toString", "iCab", "iCab");
			addBrowserData("window.navigator.vendor.toString", "KDE", "Konqueror");			
			addBrowserData("window.navigator.vendor.toString", "Camino", "Camino");
			
			addBrowserData("window.opera.toString", null, "Opera");
			
		}
		
		public function addBrowserData(string:String, subString:String = null, identity:String = null, versionSearch:String = null ):void
		{
			if(!_browsers)
				_browsers = [];
			_browsers.push(new BrowserData(string, subString, identity, versionSearch));
		}
		
		private function initOSData():void
		{
			addOSData("window.navigator.userAgent.toString","Android", "Android");
			
			addOSData("window.navigator.platform.toString","Win", "Windows");
			addOSData("window.navigator.platform.toString","Mac", "Mac");
			addOSData("window.navigator.platform.toString","Linux", "Linux");
		}
		
		public function addOSData(string:String, subString:String = null, identity:String = null, versionSearch:String = null ):void
		{
			if(!_OSs)
				_OSs = [];
			_OSs.push(new BrowserData(string, subString, identity, versionSearch));	
		}
		

	}
}

class BrowserData
{
	public var string:String; // : navigator.vendor,
	public var subString:String //  "Apple",
	public var identity:String //  "Safari",
	public var versionSearch:String //  "Version"
	
	public function BrowserData(string:String, subString:String = null, identity:String = null, versionSearch:String = null) 
	{
		
		this.string = string;
		this.subString = subString
		this.identity = identity
		this.versionSearch = versionSearch
	}
}
