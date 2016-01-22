function(swfId) {
	var contextId = "_concurrency" + String(Math.round(Math.random() * 100000000000000000));

	var ConcurrencyPlugInJSBridge = function(swfId)
	{
		this._swfEelement = document.getElementById(swfId);
		this._serviceLoaderTimeout = 0;
		this._heartBeatInterval = 0;
		this._isBeating = false;
	};

	ConcurrencyPlugInJSBridge.prototype =
	{
		loadService : function(onReadyCallbackId, timeout, onReadyPersistencePut, onReadyPersistenceGet)
		{
			var that = this,
			onReadyListener = function()
			{
				clearTimeout(that._serviceLoaderTimeout);
				$pdk.platformConcurrency.removeEventListener("OnReady", onReadyListener);
				that._initialize(onReadyCallbackId, onReadyPersistencePut, onReadyPersistenceGet);
			};

			that._serviceLoaderTimeout = setTimeout(function() {
				that._swfEelement[onReadyCallbackId]({
					success : false
				});
			}, timeout);

			if ($pdk.platformConcurrency !== null && typeof($pdk.platformConcurrency) === "object")
			{
				if($pdk.platformConcurrency.isReady)
				{
					onReadyListener();
				}
				else
				{
					$pdk.platformConcurrency.addEventListener("OnReady", onReadyListener);
				}
			}
			else
			{
				tpLoadScript(tpGetScriptPath('tpPdk.js')+"/js/libs/concurrency/platformConcurrency.js",function(){
					$pdk.platformConcurrency.addEventListener("OnReady", onReadyListener);
				});
			}
		},

		_initialize : function(onReadyCallbackId, onReadyPersistencePut, onReadyPersistenceGet)
		{
			var that = this;

			that.isReady = true;

			$pdk.platformConcurrency.client.setConcurrencyStatePersistence({
				put : function(name, value)
				{
					that._swfEelement[onReadyPersistencePut](name, value);
				},

				get : function(name)
				{
					return that._swfEelement[onReadyPersistenceGet](name);
				}
			});

			that._swfEelement[onReadyCallbackId]({
				success : true
			});
		},

		startHeartbeat : function(heartbeatFrequency, callbackId)
		{
			var that = this;

			that._isBeating = true;

			that._heartBeatInterval = setInterval(function() {
				that.updateLockLast(callbackId);
			}, heartbeatFrequency);
		},

		stopHeartbeat : function()
		{
			this._isBeating = false;
			clearInterval(this._heartBeatInterval);
		},

		isBeating : function()
		{
			return this._isBeating;
		},

		updateLock : function(concurrencyServiceUrl, clientId, lockId, lockSequenceToken, lock, callbackId)
		{
			var that = this;

			$pdk.platformConcurrency.client.updateLock(
				concurrencyServiceUrl,
				clientId,
				lockId,
				lockSequenceToken,
				lock,
				function(value)
				{
					that._swfEelement[callbackId](value);
				}
			);
		},

		updateLockLast : function(callbackId)
		{
			var that = this;

			$pdk.platformConcurrency.client.updateLockLast(
				function(value)
				{
					that._swfEelement[callbackId](value);
				}
			);
		},

		unlockLast : function(callbackId)
		{
			var that = this;

			$pdk.platformConcurrency.client.unlockLast(
				function(value)
				{
					that._swfEelement[callbackId](value);
				}
			);
		}


	};

	window[contextId] = new ConcurrencyPlugInJSBridge(swfId);

	return contextId;
}
