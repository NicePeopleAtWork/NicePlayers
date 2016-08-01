package com.theplatform.pdk.plugins.ad
{
	import com.theplatform.pdk.controllers.IPlayerController;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.ClipWrapper;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.plugins.IClipWrapperPlugIn;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.display.Sprite;

	public class AdInsertionPlugIn extends Sprite implements IClipWrapperPlugIn
	{
		private var _controller:IPlayerController;
		private var _wrapper:ClipWrapper;
		private var _priority:Number;

		private var _preRollUrls:Array;
		private var _postRollUrls:Array;
		private var _midRollUrls:Array;
		
		// deprecated
		private var _urlPattern:String;
		private var _numberOfClipsBeforeAd:Number = -1;

		
		public function AdInsertionPlugIn()
		{
		}
		
		public function initialize(lo:LoadObject):void
		{
			_controller = lo.controller as IPlayerController;
			_controller.registerClipWrapperPlugIn(this, lo.priority);
			_priority = lo.priority;
			
			_urlPattern = lo.vars["urlPattern"];
			if (lo.vars.hasOwnProperty("numberOfClipsBeforeAd")) {
				_numberOfClipsBeforeAd = Number(lo.vars["numberOfClipsBeforeAd"]);
			}
			
			if (lo.vars.hasOwnProperty("preRollUrls")) {
				_preRollUrls = lo.vars["preRollUrls"].toString().split(",");
			}
			else if (lo.vars.hasOwnProperty("prerollurls")) {
				_preRollUrls = lo.vars["prerollurls"].toString().split(",");
			}
			
			if (lo.vars.hasOwnProperty("postRollUrls")) {
				_postRollUrls = lo.vars["postRollUrls"].toString().split(",");
			}
			else if (lo.vars.hasOwnProperty("postrollurls")) {
				_postRollUrls = lo.vars["postrollurls"].toString().split(",");
			}
			
			if (lo.vars.hasOwnProperty("midRollUrls")) {
				_midRollUrls = lo.vars["midRollUrls"].toString().split(",");
			}
			else if (lo.vars.hasOwnProperty("midrollurls")) {
				_midRollUrls = lo.vars["midrollurls"].toString().split(",");
			}
			
			// Copy the old "urlPattern" to prerolls if they're using that
			if (!_preRollUrls && _urlPattern) {
				_preRollUrls = [_urlPattern];
			}
			
			_controller.trace("*** AdInsertionPlugIn PLUGIN LOADED *** priority=[" + _priority + "] urlPattern=[" + _urlPattern + "]", "AdInsertionPlugIn", Debug.INFO);
		}
		
		public function wrapClip(wrapper:ClipWrapper):Boolean
		{
			_controller.trace("Do we want to wrap this clip?", "AdInsertionPlugIn", Debug.INFO)

			var clip:Clip = wrapper.clip;
			
			// if it's an ad, no wrapping
			if (clip.baseClip.isAd)
			{
				return false;
			}
			
			// increment the clip count
			var contentSinceLastAd:int;
			if (_numberOfClipsBeforeAd >= 0) 
			{
				contentSinceLastAd = _controller.getContentSinceLastAd();
				if (contentSinceLastAd < _numberOfClipsBeforeAd)
				{
					return false;//we haven't hit enough contents
				}
			}
			else if (clip.adPattern)//numberOfClipsBeforeAd was never set, check the adPattern
			{
				contentSinceLastAd = _controller.getContentSinceLastAd();
				var timeSinceLastAd:int = _controller.getTimeSinceLastAd();
				var adCount:int = _controller.getAdCount();
				var valid:Boolean = clip.adPattern.checkPattern(adCount, contentSinceLastAd, timeSinceLastAd);
				if (!valid)
				{
					return false;//the adPattern says don't play it
				}
			}
			
			var wrapped:Boolean = false;
			
			// if it's the first chapter in a release add a pre roll
			if (clip.chapter.index == 0)
			{
				addPreRoll(clip, wrapper);
				wrapped = true;
			}
			// otherwise add a mid roll
			else {
				addMidRoll(clip, wrapper);
				wrapped = true;
			}
			
			// if it's the last chapter, add a post-roll
			if (clip.chapter.index == clip.chapter.chapters.chapters.length - 1)
			{
				addPostRoll(wrapper);
				wrapped = true;
			}

			if (wrapped) {
				_controller.setClipWrapper(wrapper);
				return true;
			}
			else {
				return false;
			}
		}
		
		private function addPreRoll(clip:Clip, wrapper:ClipWrapper):void
		{
			_wrapper = wrapper;
			if (_preRollUrls) {
				var preRoll:Clip;
				var playlist:Playlist = new Playlist();
				for (var i:Number=0; i<_preRollUrls.length; i++) {
					preRoll = createClip(_preRollUrls[i]);
					playlist.addClip(preRoll);
				}
				if (playlist.baseClips.length > 0) {
					wrapper.preRolls = playlist;
				}
			}
		}

		private function addMidRoll(clip:Clip, wrapper:ClipWrapper):void
		{
			_wrapper = wrapper;
			if (_midRollUrls) {
				var midRoll:Clip;
				var playlist:Playlist = new Playlist();
				for (var i:Number=0; i<_midRollUrls.length; i++) {
					midRoll = createClip(_midRollUrls[i]);
					playlist.addClip(midRoll);
				}
				if (playlist.baseClips.length > 0) {
					wrapper.preRolls = playlist;
				}
			}
		}

		private function addPostRoll(wrapper:ClipWrapper):void
		{
			_wrapper = wrapper;
			if (_postRollUrls) {
				var postRoll:Clip;
				var playlist:Playlist = new Playlist();
				for (var i:Number=0; i<_postRollUrls.length; i++) {
					postRoll = createClip(_postRollUrls[i]);
					playlist.addClip(postRoll);
				}
				if (playlist.baseClips.length > 0) {
					wrapper.postRolls = playlist;
				}
			}
		}
		
		private function createClip(url:String):Clip {
			var bc:BaseClip = createBaseClip(url);
			var clip:Clip = _controller.createClipFromBaseClip(bc);
			return clip;
		}

		private function createBaseClip(url:String):BaseClip {
			var bc:BaseClip = new BaseClip();
			bc.URL = substituteParamsInUrl(url);
			bc.releaseLength = 0;
			bc.noSkip = true;
			bc.isAd = true;
			return bc;
		}

		private function createPlaylist(clip:Clip):Playlist
		{
			var playlist:Playlist = new Playlist();
			playlist.addClip(clip);
			return playlist;			
		}
		
		private function substituteParamsInUrl(url:String):String {
			url = url.replace(/\{contentId\}/i, _wrapper.clip.baseClip.contentID);
			url = url.replace(/\{releaseId\}/i, _wrapper.clip.baseClip.releaseID);
			url = url.replace(/\{releaseUrl\}/i, encodeURIComponent("http://release.theplatform.com/content.select?pid=" + _wrapper.clip.baseClip.releaseID));
			url = url.replace(/\{n\}/i, (new Date()).getTime()); 
			
			var customFieldPattern:RegExp = /\{cf\:([a-zA-Z0-9]+)\}/;
			var result:Object;
			while (result = customFieldPattern.exec(url)) {
				url = url.substr(0, result.index) + encodeURIComponent(_wrapper.clip.baseClip.contentCustomData[result[1]]) + url.substr(result.index + result[0].length);
			}
			
			return url;
		}
	}
}
