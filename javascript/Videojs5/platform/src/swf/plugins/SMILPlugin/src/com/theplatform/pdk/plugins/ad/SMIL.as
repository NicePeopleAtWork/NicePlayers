/************************************************************************
 * Copyright (c) 2009  thePlatform for Media, Inc. All Rights Reserved. *
 ************************************************************************/

package com.theplatform.pdk.plugins.ad
{
	import com.theplatform.pdk.controllers.PlayerController;
	import com.theplatform.pdk.data.BaseClip;
	import com.theplatform.pdk.data.Clip;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.data.Playlist;
	import com.theplatform.pdk.events.PdkEvent;
	import com.theplatform.pdk.events.PlayerEvent;
	import com.theplatform.pdk.plugins.IAdPlugIn;
	import com.theplatform.pdk.utils.Debug;
	import com.theplatform.pdk.utils.PdkStringUtils;

	import flash.display.Sprite;

	public class SMIL extends Sprite implements IAdPlugIn
	{
		private var _controller:PlayerController;
		private var _adType:String="SMIL";
		private var _priority:Number=1;
		private var _isError:Boolean=false;
		private var _parserCallback:Function;
		private var VERSION:String="";
		private var hostsArray:Array=new Array();
		private var excludeArray:Array=new Array();

		public function SMIL()
		{

		}

		public function initialize(lo:LoadObject):void
		{
			_controller=lo.controller as PlayerController;
			_controller.trace("*** SMIL PLUGIN IS UP! ***", "SMIL", Debug.INFO)
			_controller.addEventListener(PdkEvent.OnPlugInsComplete, handlePluginsComplete);

			var priority:Number=lo.priority;
			if (priority)
				_priority=priority;

			var hosts:*=lo.vars["host"]; // could be array or string						
			if (typeof hosts == "string" && hosts.length > 0)
				hosts=[hosts];
			if (hosts != undefined && hosts.length > 0)
				hostsArray=hosts;

			var exclude:*=lo.vars["exclude"]; // could be array or string						
			if (typeof exclude == "string" && exclude.length > 0)
				exclude=[exclude];
			if (exclude != undefined && exclude.length > 0)
				excludeArray=exclude;
		}


		///////////////////////////////////////////////////////////////////////////////////////////////////
		// interface functions
		///////////////////////////////////////////////////////////////////////////////////////////////////


		// Called by the playbackManager, is this clip an ad that we recognize?
		public function isAd(bc:BaseClip):Boolean
		{

			if (isSmilMimeType(bc.type)) // || bc.type == "application/smil" || bc.type == "application/smil+xml")
				return true;
			else
				return isExternalSmilURL(bc.computeUrl());
		}

		private function isSmilMimeType(mime:String):Boolean
		{
			if (mime == "text/xml" || mime == "application/smil" || mime == "application/smil+xml")
			{
				return true;
			}
			else
			{
				return false;
			}
		}

		private function isExternalSmilURL(checkURL:String):Boolean
		{
			var EXTERNAL_FLAVORS:Array=["247realmedia.com", "release.theplatform.com", "ad.doubleclick.net", "search.spotxchange.com", "view.atdmt.com"];

			var isExternal:Boolean=PdkStringUtils.contains(checkURL, EXTERNAL_FLAVORS);

			if (!isExternal && hostsArray.length > 0)
				isExternal=PdkStringUtils.contains(checkURL, hostsArray);

			if (isExternal && excludeArray.length > 0)
				isExternal=!PdkStringUtils.contains(checkURL, excludeArray);

			return isExternal;
		}

		///////////////////////////////////////////////////////////////////////////////////////////////////
		public function checkAd(clip:Clip):Boolean
		{
			if (!clip || !clip.baseClip || !clip.baseClip.computeUrl())
				return false; // BAIL - we have no URL
			var isHandled:Boolean=false;
			if (!isExternalSmilURL(clip.baseClip.computeUrl()) && !isSmilMimeType(clip.baseClip.type))
			{
				// not SMIL! SMIL needs release.theplatform or a specified ad provider
				_controller.trace("clip \"" + clip.baseClip.computeUrl() + "\" of type \"" + clip.baseClip.type + "\" is not a registered SMIL reference", "SMIL", Debug.INFO);
			}
			else
			{
				var url:String=findPOS(clip);
				_controller.trace("parsing external SMIL... url= " + url, "SMIL", Debug.INFO);
				_controller.parseReleaseXML(url, SMILParsed, clip); //put in the clip so we can get back the referenc in the callback
				isHandled=true;
			}
			return isHandled;
		}

		private function findPOS(clip:Clip):String
		{
			var url:String=clip.baseClip.computeUrl();
			if (PdkStringUtils.contains(url, ["POS", "<position>", "{position}"], 0)) //there is a POS or <position> string, process
			{
				var position:Number=1;
				if (clip.clipIndex > 0) //if the position == 0, then it must be the first, otherwise check
				{
					var pl:Playlist=clip.baseClip.playlistRef;
					for (var i:Number=0; i < clip.clipIndex; i++)
					{
						if (!pl.clips[i]) break;//for some reason, we've run off the end
						if (pl.clips[i].isAd)
						{
							position++;
						}
					}
				}
				url=PdkStringUtils.replaceStrs(url, ["{position}", "<position>", "POS"], position.toString());
			}
			return url;
		}

		///////////////////////////////////////////////////////////////////////////////////////////////////
		// the smil url should be parsed now
		///////////////////////////////////////////////////////////////////////////////////////////////////
		private function SMILParsed(playlist:Playlist, url:String, clip:Clip):void
		{
			if (playlist && !playlist.isError)
			{
                
                //This is to fix pdk-5919, if the clip was an ad, we make sure the playlist is all ads
                for each (var c:Clip in playlist.clips)
                {
                    c.baseClip.isAd = clip.isAd;
                    c.baseClip.noSkip = clip.noSkip;
                }
                
                
				_controller.setAds(playlist); //setAds should not be called on an invalid playlist
			}
			else
			{
				var evt:PlayerEvent=new PlayerEvent(PlayerEvent.OnCheckAdFailed, clip);
				_controller.dispatchEvent(evt);
			}

		}

		///////////////////////////////////////////////////////////////////////////////////////////////////
		// event handlers
		///////////////////////////////////////////////////////////////////////////////////////////////////

		public function handlePluginsComplete(e:PdkEvent):void
		{
			_controller.removeEventListener(PdkEvent.OnPlugInsComplete, handlePluginsComplete);
			_controller.registerAdPlugIn(this, _adType, _priority);
		}


	}
}


