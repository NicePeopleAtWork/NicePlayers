// Set the namespace for the new plug-in
$pdk.ns("$pdk.plugin.ResumePlayback");

$pdk.plugin.ResumePlayback = $pdk.extend(function()
{
}, {

    URN_PREFIX: "urn:theplatform:pdk:media:",

    constructor : function()
    {

    },

    initialize : function(loadObj)
    {

        this.controller = loadObj.controller;

        this.priority = loadObj.priority;

        this.token = loadObj.vars['token'];
        this.context = loadObj.vars['context'];
        this.accountId = loadObj.vars['accountId'];
        this.accountId = typeof(this.accountId) !== "string" ? "" : this.accountId;

        this.firstRelease = true;

        this.resumeLabel = loadObj.vars['resumeLabel']!==undefined ? loadObj.vars['resumeLabel'] : "Resume";
        this.restartLabel = loadObj.vars['restartLabel']!==undefined ? loadObj.vars['restartLabel'] : "Restart";

        this.bookmarkIdField = loadObj.vars['bookmarkIdField']!==undefined ? loadObj.vars['bookmarkIdField'] : null;

        this.autoResume = loadObj.vars['autoResume']==="true" ? true : false;
		this.threshold = loadObj.vars['threshold']!==undefined ? parseInt(loadObj.vars['threshold']) : 0;

        //defaults to true
        this.useCache = true;//loadObj.vars['useCache'] !== "false" ? true : false;

        if (!this.token||this.token.length===0)
        {
            this.setTokenListener = function(e)
            {
                me.onSetToken(e);
            }
            this.controller.addEventListener("OnSetToken", this.setTokenListener);
        }

		this.addResumeCard();

        var me = this;
        var doneListener = function()
        {
            me.isReady = true;
            $pdk.bookmarks.removeEventListener("OnReady", doneListener);
            me.continueInitialize(loadObj);
        }

        if ($pdk['bookmarks'] !== undefined)
        {
            //is it ready? (evt will fire even if it is, so just do it this way)
            $pdk.bookmarks.addEventListener("OnReady", doneListener);
        }
        else
        {
            //need to load in script, then do the same thing
            //may also need to load the "core", but we should really just concat the two js files...
            tpLoadScript($pdk.scriptRoot + "/js/libs/bookmarks/bookmarks.js", function()
            {
                $pdk.bookmarks.addEventListener("OnReady", doneListener);
            });
        }

        try
        {
            this.controller.registerMetadataUrlPlugIn(this, this.priority);
            tpDebug("*** resumePlayback plugin LOADED! ***");

        }
        catch(e)
        {
            tpDebug("WARN: couldn't register resumePlayback: " + e.message);
        }

    },

	addResumeCard: function()
	{
		var html =  '<div class="tpPlayerCard tpResumePlaybackCard">' +
						'<div class="tpResumePromptMessage">${message}</div>' +
							'<div class="tpMenuButtons">' +
								'<a href="#" class="tpButton tpRestart" tp:label="${restart}">${restart}</a>' +
								'<a href="#" class="tpButton tpResume" tp:label="${resume}">${resume}</a>' +
							'</div>' +
						'</div>' +
					'</div>';

		var me = this;

		var presenter = {
			show: function(initVars)
			{
				var messageElement = $pdk.jQuery(initVars.card).find(".tpResumePromptMessage");
				messageElement.text(messageElement.text().replace("${release.title}", me.currentTitle));

				$pdk.jQuery(initVars.card).find(".tpMenuButtons .tpRestart").click(function() {
					me.doSubmitForm(false);
					me.controller.hidePlayerCard("forms", "tpResumePlaybackCard");
				});

				$pdk.jQuery(initVars.card).find(".tpMenuButtons .tpResume").click(function() {
					me.doSubmitForm(true);
					me.controller.hidePlayerCard("forms", "tpResumePlaybackCard");
				});
			},

			hide: function()
			{

			}
		}

		me.controller.addPlayerCard("forms", "tpResumePlaybackCard", html, "urn:theplatform:pdk:area:player", {message: 'Would you like to resume watching \'${release.title}\' from where you left off?', resume: this.resumeLabel, restart: this.restartLabel}, presenter, 99);
	},

	continueInitialize: function(loadObj)
    {

        var me = this;

        this.releaseSelectedListener = function(e)
        {
            me.onReleaseSelected(e);
        };
        this.mediaPlayingListener = function(e)
        {
            me.onMediaPlaying(e);
        };
        this.mediaPauseListener = function(e)
        {
            me.onMediaPause(e);
        };
        this.mediaStartListener = function(e)
        {
            me.onMediaStart(e);
        };

        this.mediaEndListener = function(e)
        {
            me.onMediaEnd(e);
        };

        this.mediaErrorListener = function(e)
        {
            me.onMediaError(e);
        };

        this.setReleaseListener = function(e)
        {
            me.onSetRelease(e);
        };

        this.releaseStartListener = function(e)
        {
            me.onReleaseStart(e);
        };

        this.releaseEndListener = function(e)
        {
            me.onReleaseEnd(e);
        };

        this.controller.addEventListener("OnReleaseSelected", this.releaseSelectedListener);

        this.controller.addEventListener("OnReleaseStart", this.releaseStartListener);



        this.controller.addEventListener("OnMediaPlaying", this.mediaPlayingListener);
        this.controller.addEventListener("OnMediaPause", this.mediaPauseListener);
        this.controller.addEventListener("OnMediaStart", this.mediaStartListener);
        this.controller.addEventListener("OnMediaError", this.mediaErrorListener);
        this.controller.addEventListener("OnMediaEnd", this.mediaEndListener);

        this.controller.addEventListener("OnReleaseEnd", this.releaseEndListener);

        this.controller.addEventListener("OnSetRelease", this.setReleaseListener);

        this.controller.addEventListener("OnSetReleaseUrl", this.setReleaseListener);

        this.video = this.controller.getVideoProxy();//maybe it's a proxy, maybe it's the real deal...



        if (this.lastUnhandledRewriteUrl)
        {
            this.doResume(this.lastUnhandledRewriteUrl);
            //this.controller.setMetadataUrl(this.lastUnhandledRewriteUrl);
            this.lastUnhandledRewriteUrl = undefined;
        }

        this.doneLoading = true;

    },

    onSetToken: function(e)
    {
        this.token = e.data.token;

       // tpDebug({token:e.data.token, type:e.data.type},this.controller.id,"resumePlayback",tpConsts.TEST);
    },

    onMediaError: function(e)
    {

		this._hasError = true;

        if (this.view)
            this.view.style.display="none";

    },

    onReleaseStart: function(e)
    {

        //tpDebug(e);
		this._hasError = false;

        this.currentPlaylist = e.data;
        var url = e.data.releaseURL;
        this.releaseUrl = url;

        this.releaseStarted = true;
        this.wasDeleted = false;

        this.lastSavedTime = undefined;

        //to go along with the flash way of doing things, we should change the playlist object's offset on the current clip

        if (tpIsIPhone())
            this.video.style.display="";

    },

    onReleaseEnd: function(e)
    {

        // this.releaseStarted = false;
	var isException = this.clipHasException(e.data);
        if (!isException && !this.wasError()&&!this.wasDeleted&&this.releaseStarted&&Math.abs(this.lastKnownPosition-this.currentPlaylist.chapters.chapters[this.currentPlaylist.chapters.chapters.length-1].endTime)<=5000)
        {
            this.wasDeleted = true;
            this.releaseStarted = false;
            this.removeBookmark();
        }

    },

    doResume: function(releaseUrl)
    {
        tpDebug("Bookmark plugin calling setMetaDataUrl");


        this.controller.setMetadataUrl(releaseUrl);
		this.controller.pause(false);
    },

    errorHandler: function(error)
    {
        tpDebug("bookmarks service got error: " + error);
        this.doResume(this.releaseUrl);
    },

    successHandler: function(result)
    {
        //sometimes the service can return a null result
        if (result&&result.position !== 0 && result.position !== null)
        {
			this.result = result;
            this.showUIPrompt(result.position);
        }
        else
        {
            this.doResume(this.releaseUrl);
        }
    },

	doSubmitForm: function(resume)
    {
        //this got moved up the the metadataurlmanager
        if (tpIsIOS())
        {
            //this is to force ios to let us play/seek, because we're going to make an async call based on this user input and do nothing more
            //until it returns
            tpDebug("This is an iOS device, we need to set src to '' to get it to let us play things later.");
            this.controller.writePlayer("", true);
        }

		var me = this;

        if (resume)//then we seek if the user wanted to...
        {
            var listener = function(e)
			{
                me.controller.removeEventListener("OnReleaseStart",listener);

				tpDebug("Marking offset at "+ me.result.position*1000);

                //need to ensure this seek is on the playlist, not just current media...
                me.controller.markOffset(e.data, me.result.position*1000);
            }

            this.controller.addEventListener("OnReleaseStart",listener);
        }
        else
        {
            this.removeBookmark();//nuke the bookmark, they don't want to use it
        }

        //either way we call the same url...
        this.doResume(this.releaseUrl);
    },

    checkForBookmark: function()
    {
        var me = this;

        //this way the closure won't get different values than when we started
        var context = this.context;
        var token = this.token;
        var mediaId =  this.mediaId;

        tpDebug({testId:"RESUME_PLAYBACK_CHECK_FOR_BOOKMARK",data:{token:token, mediaId:mediaId}},this.controller.id,"resumePlayback",tpConsts.TEST);

        //i'm assuming we want to use the cache? (otherwise what's it there for?)
        $pdk.bookmarks.hasBookmark(context, token, this.accountId, this.URN_PREFIX+mediaId , this.useCache ,
            {
                onSuccess:function(result)
                {

                    if (result)
                    {
                        $pdk.bookmarks.getBookmark(context, token, me.accountId, me.URN_PREFIX+mediaId , {
                            onSuccess: function(result){me.successHandler(result);} ,
                            onFailure: function(error){me.errorHandler(error);}
                            });
                    }
                    else
                    {
                        tpDebug("We have no bookmark, just use existing url")
                        me.doResume(me.releaseUrl);
                    }

                },

                onFailure: function(error){me.errorHandler(error);}
            });

        this.wasUserGenerated = false;

    },

    checkMediaID:function(json)
    {

        if (!json||!json.id)
            this.doResume(this.releaseUrl)

        var customBookmarkId = this.findCustomBookmarkId(json);

        this.mediaId = customBookmarkId ? customBookmarkId : json.id.substring(json.id.lastIndexOf("/")+1);

        this.currentTitle = json.title;

        this.checkForBookmark();

    },

    findCustomBookmarkId: function(json)
    {
        if(!this.bookmarkIdField || !json["$xmlns"])
            return null;

        var namespaces = Object.keys(json["$xmlns"]);
        if(!namespaces || namespaces.length < 1)
            return null;

        var namespacedKey = '';
        for (var i=0; i<namespaces.length; i++)
        {
            namespacedKey = namespaces[i] + "$" + this.bookmarkIdField;
            if(json[namespacedKey])
            {
                return json[namespacedKey];
            }
        }
        return null;
    },

    rewriteMetadataUrl: function(releaseUrl, isPreview)
    {

        if (!this.doneLoading)
        {
            this.lastUnhandledRewriteUrl = releaseUrl;
            this.mediaIsAutoPlay = true;

            return true;
        }

        //if the previous onReleaseSelected was not user generated, return false...

        this.releaseUrl = releaseUrl;

        if (this.mediaIsAutoPlay===undefined)
            this.mediaIsAutoPlay = this.firstRelease;//we would have got an onReleaseSelected otherwise

        this.firstRelease = false;

        if (!this.mediaIsAutoPlay)
        {

            var me = this;

            //We have to make this async, because otherwise the release will get switched before the previous bookmark is done saving.
            //firefox doesn't hoist function defs inside blocks, so it needs to be above where it's referenced...
            function doBookmarkCheck(){

                me.releaseStarted=false;

                //we load the format=preview version of the releaseUrl
                var loader = new JSONLoader();

                loader.load(me.releaseUrl.split("?")[0]+"?format=preview",
                    function(json){me.checkMediaID(json);},null,null,null,function(){me.doResume(me.releaseUrl);});

                //this got moved up the the metadataurlmanager
                if (tpIsIOS())
                {
                    //this is to force ios to let us play/seek, because we're going to make an async call based on this user input and do nothing more
                    //until it returns
                    tpDebug("This is an iOS device, we need to set src to '' to get it to let us play things later.");
                    me.controller.writePlayer("", true);
                }


            }

            if (this.releaseStarted&&this.mediaId&&!this.wasError())
            {
                this.saveCurrentTime(doBookmarkCheck);
            }
            else
            {
                doBookmarkCheck();
            }

            return true;

        }
        else
        {
            return false;
        }

    },




    onReleaseSelected : function(e)
    {
        this.wasUserGenerated = e.data.userInitiated;

        this.mediaIsAutoPlay = (!this.wasUserGenerated&&this.firstRelease);

        this.releaseUrl = e.data.releaseUrl;

        //this is too late too...
        // if (this.releaseStarted&&this.wasUserGenerated&&this.mediaId)
        // {
        //     this.saveCurrentTime();
        // }

    },

    onMediaPlaying : function(e)
    {
        //we save it in ms, instead of seconds like the spec says, since it makes more sense to divide by 1000 once instead of many times
		// if (!e.data.baseClip.isAd)//only track the position for the content, not ads
		if (!this.currentClip.baseClip.isAd)
       		this.lastKnownPosition = e.data.currentTimeAggregate;
    },

    onMediaEnd : function(e)
    {
        //we don't want to do this in this case, the user must have clicked to another release so we don't want to delete their bookmark
        if (this.wasUserGenerated||!this.currentPlaylist)
            return;

        var clip = e.data;
        var moreContent = false;

        if (clip.clipIndex===this.currentPlaylist.baseClips.length-1)
        {
            moreContent = false;//last clip, so no more content...
        }

            //otherwise, we want to see that there are only ads after us

        for (var i=clip.clipIndex+1;i<this.currentPlaylist.baseClips.length;i++)
        {
            if (this.currentPlaylist.baseClips[i].isAd!==true)
            {
                moreContent = true;
                break;
            }
        }

	var isException = this.clipHasException(clip);
        if (!isException && !this.wasError()&&!this.wasDeleted&&!moreContent&&Math.abs(this.lastKnownPosition-this.currentPlaylist.chapters.chapters[this.currentPlaylist.chapters.chapters.length-1].endTime)<=500)
        {
            this.wasDeleted = true;
            this.releaseStarted = false;
            this.removeBookmark();
        }

    },

    clipHasException : function(clip)
    {
        var r = false;
        if($pdk.isArray(clip.baseClips) && !$pdk.isEmpty(clip.baseClips[0].contentCustomData))
        {
                r = clip.baseClips[0].contentCustomData["isException"] === "true";
        }
        if(!$pdk.isEmpty(clip.baseClip) && !$pdk.isEmpty(clip.baseClip.contentCustomData))
        {
                r = clip.baseClip.contentCustomData["isException"] === "true";
        }
        return r;
    },

    wasError: function()
    {
        return this._hasError;//isNaN(this.video.duration);
    },

    removeBookmark : function()
    {
        $pdk.bookmarks.removeBookmark(this.context, this.token, this.accountId, this.URN_PREFIX+this.mediaId,{
        onSuccess:function(result)
        {
            tpDebug("Bookmark removed sucessfully");
        },onFailure:function(errorMsg)
        {
            tpDebug("Bookmark remove unsucessful");
        }
        });
    },

    onMediaPause : function(e)
    {
        if (this.releaseStarted&&!this.wasDeleted&&!this.wasError())
            this.saveCurrentTime();
        else
            tpDebug("Not saving bookmark, release hasn't started or has already ended");
    },

    saveCurrentTime: function(callback)
    {

        //this prevents us from double-saving because we get extra pause events from the video tag sometimes
        if (this.mediaIsAutoPlay||Math.abs(this.lastKnownPosition-this.total)<=500||this.lastSavedTime!==undefined&&(Math.ceil(this.lastSavedTime / 1000)===Math.ceil(this.lastKnownPosition / 1000)))
        {
            if (typeof(callback)==='function')
                  callback();

            return;
        }

        var time =  Math.ceil(this.lastKnownPosition / 1000)

		// don't save bookmarks if we're within the threshold
		if (time < this.threshold || time > (this.total/1000 - this.threshold))
		{
            if (typeof(callback)==='function')
                  callback();

			return;
		}

        this.lastSavedTime = this.lastKnownPosition;

        $pdk.bookmarks.updateBookmark(this.context, this.token, this.accountId, this.URN_PREFIX+this.mediaId, time, this.total/1000,
                { onSuccess:function(result)
                {
                    tpDebug("Bookmark saved sucessfully for "+time);
                    if (typeof(callback)==='function')
                          callback();
                },onFailure:function(errorMsg)
                {
                    tpDebug("Bookmark save unsucessful for "+time);
                    if (typeof(callback)==='function')
                        callback();
                }
                });
    },

    onMediaStart : function(e)
    {

		this._hasError = false;



        var clip = e.data;

		this.currentClip = clip;

        this.total = clip.baseClip.releaseLength;

        if (!clip.baseClip.isAd)
        {
        	if(this.bookmarkIdField && clip.baseClip.contentCustomData)
            {
                this.mediaId = clip.baseClip.contentCustomData[this.bookmarkIdField];
            }
            else
            {
                this.mediaId = clip.baseClip.contentID;
            }
        }

        if (!clip.baseClip.isAd && clip.chapter.index > 0)
        {
            this.lastKnownPosition = clip.currentMediaTime;
            this.saveCurrentTime();
        }

        this.releaseStarted = true;

        if (this.view)
            this.view.style.display = "none";

    },

    onSetRelease : function(e)
    {

        //we're supposed to save the last known position of the current release
        //but this is too late, the rewriteMetaDataUrl call will have already changed the vars
        // if (this.wasUserGenerated&&this.mediaId)
        // {
        //     this.saveCurrentTime();
        // }

        if (e.type === "OnSetRelease")
        {
            this.lastKnownPosition = 0;
            this.releaseUrl = e.data.url;
        }
        else if (e.type === "OnSetReleaseUrl")
        {
            this.releaseUrl = e.data;
        }
        // else //this way
        //      this.currentRelease = undefined;

    },

    showUIPrompt: function(time)
    {
        //at some point, we should improve this...
        // var r = confirm("Do you want to resume playback of "+this.releaseUrl+" at " + time + "?")
        //
        // callback(r);

        //just in case
        this.releaseStarted = false;


        this.controller.pause(true);

		if (this.autoResume)
		{
			this.doSubmitForm(true);
			return;
		}

		this.controller.showPlayerCard('forms', 'tpResumePlaybackCard');

        //TODO: shouldn't this be localizable too?
//        this.textSpan.innerHTML = "Would you like to resume watching \""+this.currentTitle+"\" from where you left off?";

        tpDebug({testId:'RESUME_PLAYBACK_FORM_DISPLAYED',data:{token:this.token,mediaId:this.mediaId}}, this.controller.id, "resumePlayback", tpConsts.TEST);

    }

});

$pdk.controller.plugInLoaded(new $pdk.plugin.ResumePlayback());
