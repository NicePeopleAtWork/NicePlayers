//opted to go with pure javascript prototypal inheritence, to avoid depending on a particular framework for inheritence
ConcurrencyPlugIn = function(){};

ConcurrencyPlugIn.HeartBeat = function()
{
	this.isBeating = false;
	this.frequency = 0;
	this._intervalId = 0;
	this._loadConcurrencyTimeout = 0;
};

ConcurrencyPlugIn.HeartBeat.prototype = {

	start : function(callback)
	{
    		this.isBeating = true;
		if(this.frequency > 0)
		{
			this._intervalId = setInterval(callback, this.frequency);
		}
	},

	stop : function()
	{
    		this.isBeating = false;
    		clearInterval(this._intervalId);
	}
};

ConcurrencyPlugIn.prototype.initialize = function(loadObj)
{
	this.controller = loadObj.controller;

	this.priority = loadObj.priority;

	this.clientId = this.controller.componentId;

	this.heartbeat = $pdk.isObject(loadObj.heartbeat) ? loadObj.heartbeat : new ConcurrencyPlugIn.HeartBeat();

	this.isReady = false;

	try
	{
		this.controller.registerMetadataUrlPlugIn(this, this.priority);

	}
	catch(e)
	{
		tpDebug("WARN: couldn't register ConcurrencyPlugIn: " + e.message);
	}


	var me=this;
	var doneListener = function()
	{
		$pdk.platformConcurrency.client.unlockLast(
			function(value)
			{
			}
		);

		clearTimeout(me._loadConcurrencyTimeout);
		me.isReady = true;
		$pdk.platformConcurrency.removeEventListener("OnReady",doneListener);
		me.continueInitialize(loadObj);
	}

	//this will need to change if we make a bootloader thing...it'd need to add the eventlistener because the symbols will always exist
	//just may not be ready yet
	if ($pdk.platformConcurrency !== null && typeof($pdk.platformConcurrency) === "object")
	{
		if($pdk.platformConcurrency.isReady)
		{
			doneListener();
		}
		else
		{
			$pdk.platformConcurrency.addEventListener("OnReady",doneListener);
		}
	}
	else
	{
		tpLoadScript($pdk.scriptRoot+"/js/libs/concurrency/platformConcurrency.js",function(){
        		$pdk.platformConcurrency.addEventListener("OnReady",doneListener);
		});
	}

	this._loadConcurrencyTimeout = setTimeout(function()
	{
		if (!me.isReady&&me.lastUnhandledRewriteUrl)
		{
			me._setMetadataUrl(me.lastUnhandledRewriteUrl);
			me.lastUnhandledRewriteUrl = undefined;
		}
	},15000);//wait 15 secs for it to load, if not, timeout

    tpDebug("*** concurrency plugin LOADED! ***");
}

ConcurrencyPlugIn.prototype.continueInitialize = function(loadObj)
{
	this.isReady = true;

	var me=this;

	this.releaseStartListener = function(){me.onReleaseStart.apply(me,arguments);};
	this.mediaEndListener = function(){me.onMediaEnd.apply(me,arguments);};
	this.mediaErrorListener = function(){me.onMediaError.apply(me,arguments);};

	//most of the events we care about will trigger this function
	this.releaseEndListener = function(){me.onReleaseEnd.apply(me,arguments);};

	// this.releaseEndListener =
	// this.setReleaseHandler = function(){me.unlockCurrentRelease()};

	this.controller.addEventListener("OnReleaseStart", this.releaseStartListener);
    this.controller.addEventListener("OnReleaseEnd", this.releaseEndListener);
    this.controller.addEventListener("OnMediaEnd", 	this.mediaEndListener);
    this.controller.addEventListener("OnMediaError", 	this.mediaErrorListener);

	if (this.lastUnhandledRewriteUrl)
	{
		this.doRewrite(this.lastUnhandledRewriteUrl);
		this.lastUnhandledRewriteUrl = undefined;
	}

};

ConcurrencyPlugIn.prototype.startHeartbeat = function(concurrencyData)
{
	//we need to hook up listeners
	var that = this;

	that.doUpdateLock(concurrencyData);

	this.heartbeat.start(function() {
			that.doUpdateLock(null);
		}
	);
};

ConcurrencyPlugIn.prototype.endHeartbeat = function()
{
    this.heartbeat.stop();
};

ConcurrencyPlugIn.prototype.doUpdateLock = function(concurrencyData)
{
	if($pdk.isObject(concurrencyData))
	{
		tpDebug("calling updateLock lockId:" + concurrencyData.lockId + " sequenceToken:" + concurrencyData.lockSequenceToken);
		$pdk.platformConcurrency.client.updateLock(
			concurrencyData.concurrencyServiceUrl,
			this.clientId,
			concurrencyData.lockId,
			concurrencyData.lockSequenceToken,
			concurrencyData.lock,
			function(value)
			{
				if (value.isException)
				{
					tpDebug("updateLock exception thrown:" + value.exception + " title:" + value.title + " description:" + value.description + " responseCode:" + value.responseCode,  "ConcurrencyPlugIn");
					that.controller.resetRelease();
				}
				else
				{
					tpDebug("updateLock success id: " + value.id + ", sequenceToken: " + value.sequenceToken + ", encryptedLock: " + value.encryptedLock,  "ConcurrencyPlugIn");
				}
			}
		);
	}
	else
	{
		tpDebug("calling updateLockLast");
		$pdk.platformConcurrency.client.updateLockLast(
			function(value)
			{
				if (value.isException)
				{
					tpDebug("updateLockLast exception thrown:" + value.exception + " title:" + value.title + " description:" + value.description + " responseCode:" + value.responseCode,  "ConcurrencyPlugIn");
					that.controller.resetRelease();
				}
				else
				{
					tpDebug("updateLockLast success id: " + value.id + ", sequenceToken: " + value.sequenceToken + ", encryptedLock: " + value.encryptedLock,  "ConcurrencyPlugIn");
				}
			}
		);
	}
}

ConcurrencyPlugIn.prototype.doUnlock = function()
{
	var that = this;
	tpDebug("unlocking concurrency lockId");
	$pdk.platformConcurrency.client.unlockLast(
		function(value)
		{
			if (value.isException)
			{
				tpDebug("unlock exception thrown: " + value.exception + ", title:" + value.title + ", description:" + value.description + ", responseCode:" + value.responseCode);
			}
			else
			{
				tpDebug("unlock success: " + value.success);
			}
		}
	);
}

ConcurrencyPlugIn.prototype.onReleaseStart = function(e)
{
	var
	i = 0,
	metaTag,
	metaTags,
	metaTags_l,
	concurrencyData = {};

	//here we check if the data is coming down from the smil
	this.currentPlaylist = e.data;

	if (typeof(this.currentPlaylist) === "object")
	{
		metaTags = this.currentPlaylist.metaTags;
		if (typeof(metaTags) === "object")
		{
			metaTags_l = metaTags.length;
			for(i = 0; i < metaTags_l; i++)
			{
				metaTag = metaTags[i];
				if(metaTag.name === "updateLockInterval")
				{
					try {
						this.heartbeat.frequency = parseInt(metaTag.content) * 1000;
					}
					catch(e) {
						this.heartbeat.frequency = 0;
					}
				}
				if(metaTag.name === "concurrencyServiceUrl")
				{
					concurrencyData.concurrencyServiceUrl = metaTag.content;
				}
				if(metaTag.name === "lockId")
				{
					concurrencyData.lockId = metaTag.content;
				}
				if(metaTag.name === "lockSequenceToken")
				{
					concurrencyData.lockSequenceToken = metaTag.content;
				}
				if(metaTag.name === "lock")
				{
					concurrencyData.lock = metaTag.content;
				}
			}
		}
	}

	if (
		this.heartbeat.frequency > 0
		&& typeof(concurrencyData.concurrencyServiceUrl) === "string" && concurrencyData.concurrencyServiceUrl.length > 0
		&& typeof(concurrencyData.lockId) === "string" && concurrencyData.lockId.length > 0
		&& typeof(concurrencyData.lockSequenceToken) === "string" && concurrencyData.lockSequenceToken.length > 0
		&& typeof(concurrencyData.lock) === "string" && concurrencyData.lock.length > 0)
	{
		tpDebug("concurrency start heartbeat interval:" + this.heartbeat.frequency + " lockId:" + concurrencyData.lockId)

		//we know we need to turn the heartbeat on
		this.startHeartbeat(concurrencyData);
	}
	else
	{
		tpDebug("concurrency heartbeat wasn't set");
	}
}

ConcurrencyPlugIn.prototype.onMediaError = function(e)
{
	if(this.heartbeat.isBeating&&!e.data.clip.baseClip.isAd)
	{
		this.endHeartbeat();
		this.doUnlock();
	}
}

ConcurrencyPlugIn.prototype.onMediaEnd = function(e)
{
	/*
	 * Probably unreliable. For now, we're only going to unlock at OnReleaseEnd
	 */

/*
	if (this.heartbeat.isBeating)
    {
        var clip = e.data;

        if (clip.clipIndex===this.currentPlaylist.length-1)
        {
            this.unlockcurrentPlaylist();
            return;
        }

        //otherwise, we want to see that there are only ads after us

        for (var i=clip.clipIndex+1;i<this.currentPlaylist.length;i++)
        {
            if (this.currentPlaylist.baseClip[i].isAd!==true)
            {
                return;
            }
        }
        //if we got here
        this.endHeartbeat();
        this.doUnlock();
    }
	*/
}

ConcurrencyPlugIn.prototype.onReleaseEnd = function()
{
	if (this.heartbeat.isBeating)
	{
		this.endHeartbeat();
		this.doUnlock();
	}
}

ConcurrencyPlugIn.prototype.doRewrite = function(url)
{
	this.endHeartbeat();

    this.currentPlaylist = undefined;

	var u = [
		url,
		url.indexOf("?") >= 0 ? "&" : "?",
		"clientId",
		"=",
		window.encodeURIComponent(this.clientId)
	].join("");

	this._setMetadataUrl(u);
};

ConcurrencyPlugIn.prototype._setMetadataUrl = function(url)
{
	this.controller.setMetadataUrl(url);
};


ConcurrencyPlugIn.prototype.rewriteMetadataUrl = function(releaseUrl, isPreview)
{
	if (this.isReady)
	{
		//we weren't torn down properly, so do it now
		this.doRewrite(releaseUrl);
	}
	else
	{
		this.lastUnhandledRewriteUrl = releaseUrl;
	}
	return true;

};

$pdk.controller.plugInLoaded(new ConcurrencyPlugIn());
