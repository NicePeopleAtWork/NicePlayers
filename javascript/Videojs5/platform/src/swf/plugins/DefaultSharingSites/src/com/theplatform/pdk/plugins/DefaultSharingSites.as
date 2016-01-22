package com.theplatform.pdk.plugins {
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.data.SharingSite;
	import com.theplatform.pdk.utils.PdkStringUtils;
	
	public class DefaultSharingSites implements IPlugIn
	{
		private var _controller:IPlayerController;
	                                                                  
		private var _facebookIcon:String = 'images/icons/facebook.png';
		private var _mySpaceIcon:String = 'images/icons/mySpace.png';
		private var _twitterIcon:String = 'images/icons/twitter.png';
		private var _tumblrIcon:String = 'images/icons/tumblr.png';
		private var _googlePlusIcon:String = 'images/icons/googlePlus.png';
		private var _windowsLiveIcon:String = 'images/icons/windowsLive.png';
		private var _diggIcon:String = 'images/icons/digg.png';
		private var _stumbleUponIcon:String = 'images/icons/stumbleUpon.png';
		private var _redditIcon:String =  'images/icons/reddit.png';
		private var _deliciousIcon:String =  'images/icons/delicious.png';
		private var _vodPodIcon:String = 'images/icons/vodpod.png';
		
		private var _baseUrl:String;

		private var sites:Array = 
		[
			["facebook",    "Facebook", 	_facebookIcon, 		"http://www.facebook.com/sharer.php?u={playerURL}&t={title}"],
			["twitter",     "Twitter", 		_twitterIcon, 		"http://twitter.com/home?status={status}"],
			["tumblr",      "Tumblr", 		_tumblrIcon, 		"http://www.tumblr.com/share/link?url={playerURL}&name={title}&description={description}"],  // &tags=foo,bar... we need to add {tags}
			["googleplus",  "Google+", 		_googlePlusIcon, 	"https://plus.google.com/share?url={playerURL}"],
			["digg",        "Digg", 		_diggIcon, 			"http://digg.com/submit?phase=2&url={playerURL}&title={title}&bodytext={description}&media=video"],
			["stumbleupon", "StumbleUpon", 	_stumbleUponIcon,	"http://www.stumbleupon.com/submit?url={playerURL}&title={title}"],
			["myspace",     "MySpace", 		_mySpaceIcon, 		"http://www.myspace.com/Modules/PostTo/Pages/?t={title}&c={embeddedPlayerHTML}&u={playerURL}&l=4"],
			["delicious",   "Delicious", 	_deliciousIcon, 	"http://del.icio.us/post?url={playerURL}&title={title}&notes={description}"],
			["vodpod",      "VodPod", 		_vodPodIcon, 	    "http://vodpod.com/savevideo/popup?t={title}&d={description}&embed={embeddedPlayerHTML}&p={playerURL}&source=theplatform&site={site}"],
			["reddit",      "Reddit", 		_redditIcon, 		"http://reddit.com/submit?url={playerURL}&title={title}"],
			["windowslive", "Windows Live", _windowsLiveIcon,	"http://skydrive.live.com/quickadd.aspx?title={title}&mkt=en-us&url={playerURL}&marklet=1"]
		]

		private var _enabledIds:Array = ["facebook", "twitter", "googleplus", "tumblr", "digg", "reddit"];
	
		public function DefaultSharingSites()
		{

			
		}
		
		public function initialize(lo:LoadObject):void
		{
			_controller = lo.controller as IPlayerController;
						
			 var s:String = _controller.getProperty("sharingSiteIds");

			if (s)
				_enabledIds = s.split(",");
			
			for (var j:int=0;j<_enabledIds.length;j++)
			{
				_enabledIds[j]=PdkStringUtils.trim(_enabledIds[j]);
			}	

			var pUrl:Boolean = _controller.getProperty("playerURL") != null;
			var pHtml:Boolean = _controller.getProperty("embeddedPlayerHTML") != null;

			var id:String;
			var title:String;
			var icon:String;
			var url:String;
			var site:Array;
			var enabledId:String;

			for (j = 0; j < _enabledIds.length; j++)
			{
				enabledId = _enabledIds[j];

				for (var i:Number = 0; i < sites.length; i++)
				{
					id = sites[i][0];

					if (id == enabledId)
					{
						title = sites[i][1];
						icon = baseUrl() + sites[i][2];
						url = sites[i][3];
						if (pUrl)
							_controller.addSharingSite(id, i, title, icon, url);
					}
				}

				for (var key:String in _controller.properties)
				{
					if (key.toLowerCase() !== "sharingsiteids" && key.toLowerCase().indexOf("sharingsite") == 0)
					{
						site = _controller.getProperty(key).split("|");
						if (site.length >= 4)
						{
							id = site[0];

							if (id == enabledId)
							{
								title = site[1];
								icon = site[2];
								url = site[3];
								_controller.addSharingSite(id, 1, title, icon, url);
							}
						}
					}
				}
			}

			debug();
		}
		
		private function isEnabled(id:String):Boolean
		{
			if (!_enabledIds || !_enabledIds.length)
				return true;
				
			for each (var s:String in _enabledIds)
			{
				
				if (s.toLowerCase() == id.toLowerCase())
					return true;
			}
			return false;
		}

		private function debug():void
		{
			_controller.trace("Default sites...","DefaultSharingSites");
			
			var sites:Array = _controller.getSharingSite();
			
			for each (var site:SharingSite in sites)
				_controller.trace(site.id + " : " + site.url,"DefaultSharingSites")
		}
		
		
		private function baseUrl():String
		{
			if (_baseUrl)
				return _baseUrl;
				
			if (_controller.getProperty("baseURL"))
				return _controller.getProperty("baseURL");
			
			_baseUrl = _controller.getStage().loaderInfo.url;
			_baseUrl = _baseUrl.slice(0, _baseUrl.lastIndexOf("/"));
			_baseUrl = _baseUrl.slice(0, _baseUrl.lastIndexOf("/"));
			_baseUrl += "/";

			return _baseUrl;
		}
	}
}
