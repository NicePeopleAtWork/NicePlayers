/*
 * SmartPlugin
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Jordi Aguilar
 * Version: 3.0.0
 * API Version: 1.4.3+
 */

// DEPRECATED, USE 3.1.0 (v2) INSTEAD

videojs.plugin('youboraSmartPlugin', function(options) {
    var debug = getYouboraData().getDebug();

    // Version
    var targetDevice = "pc-videojs",
        pluginName = "videojs5",
        pluginVersion = "3.0.0-videojs5";

    // Objects
    var apiClass = null,
        pingTimer = null,
        bufferMilis = 1000,
        bufferRange = 800,
        bufferLastTime = 1000,
        bufferTimeBegin = 0,
        joinTimeBegin = 0,
        seekTimeBegin = 0,
        pauseTimeBegin = 0,
        mediaEvents = {
            BUFFER_BEGIN: 1,
            BUFFER_END: 0,
            JOIN_SEND: 2,
            ADS_BEGIN: 3,
            ADS_END: 4
        };

    // Flags
    var isStartSent = false,
        isPaused = false,
        isJoinSent = false,
        isSeeking = false,
        isBuffering = false;

    // Player is loaded
    this.ready(function() {
        try {
            /* Start API */
            apiClass = new YouboraCommunication(getYouboraData().getAccountCode(), getYouboraData().getService(), 0, pluginVersion, targetDevice, this.id);



            /* Start watcher */
            this.setInterval(function() {
                try {
                    if (isJoinSent && !isPaused) {
                        var currentTime = this.currentTime() * 1000;

                        if (bufferLastTime !== currentTime) {
                            // Update the lastTime if the time has changed.
                            bufferLastTime = currentTime;

                            if (isBuffering) {
                                var delta = new Date().getTime() - bufferTimeBegin;
                                isBuffering = false;
                                apiClass.sendBuffer(this.currentTime(), delta);
                            }
                        } else if (bufferLastTime - currentTime < bufferRange && !isPaused) {
                            // Video is buffering/waiting.
                            if (!isBuffering) {
                                bufferTimeBegin = new Date().getTime();
                                isBuffering = true;
                            }
                        }
                    }
                } catch (error) {
                    if (debug) {
                        console.log("SmartPlugin :: " + pluginName + " :: watcher :: " + error);
                    }
                }
            }, bufferMilis);

            if (debug) {
                console.log("SmartPlugin :: " + pluginName + " :: Ready ::");
            }
        } catch (error) {

            if (debug) {
                console.log("SmartPlugin :: " + pluginName + " :: Ready :: " + error);
            }

        }
    });

    // Play is clicked (Start)
    this.on("play", function(e) {
        try {
            if (!isStartSent) {
                if (typeof getYouboraData().getLive() === 'undefined') {
                    if (this.duration() > 0) {
                        getYouboraData().setLive(false);
                    } else {
                        getYouboraData().setLive(true);
                    }
                }

                apiClass.sendStart(0, window.location.href, "", getYouboraData().getLive(), getYouboraData().getMediaResource(), this.duration(), getYouboraData().getTransaction());
                joinTimeBegin = new Date().getTime();
                setPing();

                isStartSent = true;
            }
        } catch (error) {
            if (debug) {
                console.log("SmartPlugin :: " + pluginName + " :: play :: " + error);
            }
        }
    });

    // Video starts (JoinTime)
    this.on("playing", function(e) {
        try {
            if (isStartSent) {
                var time = new Date().getTime() - joinTimeBegin;

                if (isPaused) {
                    apiClass.sendResume();
                    isPaused = false;
                }

                if (!isJoinSent) {
                    apiClass.sendJoinWithMediaDuration(0, time, this.duration());
                    isJoinSent = true;
                }
            }

        } catch (error) {
            if (debug) {
                console.log("SmartPlugin :: " + pluginName + " :: playing :: " + error);
            }
        }
    });

    this.on("pause", function(e) {
        try {
            if (isStartSent) {
                apiClass.sendPause();
                pauseTimeBegin = new Date().getTime();
                isPaused = true;
            }
        } catch (error) {
            if (debug) {
                console.log("SmartPlugin :: " + pluginName + " :: pause :: " + error);
            }
        }
    });

    this.on("ended", function(e) {
        try {
            if (isStartSent) {
                apiClass.sendStop();
                stop();
            }
        } catch (error) {
            if (debug) {
                console.log("SmartPlugin :: " + pluginName + " :: ended :: " + error);
            }
        }
    });

    this.on("error", function(e) {
        try {
            //(errorCode, message, totalBytes, referer, properties, isLive, resource, duration, transcode)
            apiClass.sendAdvancedError(0, targetDevice, this.error, 0, window.location.href, getYouboraData().getProperties(), getYouboraData().getLive(), getYouboraData().getMediaResource(), this.duration, getYouboraData().getTransaction());
        } catch (error) {
            if (debug) {
                console.log("SmartPlugin :: " + pluginName + " :: error :: " + error);
            }
        }
    });

    this.on("seeking", function(e) {
        try {
            if (isStartSent && !isSeeking) {
                seekTimeBegin = new Date().getTime();
                isSeeking = true;
            }
        } catch (error) {
            if (debug) {
                console.log("SmartPlugin :: " + pluginName + " :: seeking :: " + error);
            }
        }
    });

    this.on("seeked", function(e) {
        try {
            if (isStartSent && isSeeking) {
                var delta = new Date().getTime() - seekTimeBegin;
                seekTimeBegin = 0;
                isSeeking = false;

                apiClass.sendSeek(this.currentTime(), delta);

            }
        } catch (error) {
            if (debug) {
                console.log("SmartPlugin :: " + pluginName + " :: seeking :: " + error);
            }
        }
    });
    /*
		this.on("timeupdate", function (e) {
			try {
				// As video downloads, check if the video is actually playing.
				// (this.paused() will return true even if it's buffering, so we have to check the time advancement)
				if (isJoinSent) {
					var currentTime = this.currentTime();

					if (lastTime !== currentTime) {
						// Update the lastTime if the time has changed.
						lastTime = currentTime;

						if (isBuffering) {
							var delta = new Date().getTime() - bufferTimeBegin;
							isBuffering = false;
							apiClass.sendBuffer(this.currentTime(), delta);
						}
					} else if (this.paused() === false) {
						// Video is buffering/waiting.
						if (!isBuffering) {
							bufferTimeBegin = new Date().getTime();
							isBuffering = true;
						}
					}
				}
			} catch (error) {
				if (debug) {
					console.log("SmartPlugin :: " + pluginName + " :: waiting :: " + error);
				}
			}
		});*/

    /* Event Registrer * /
	var playerEvents = ["canplay", "playing", "waiting", "ended", "play", "pause", "error", "abort", "seeking", "seeked", "stalled", "suspend", "progress", "dispose", "loadeddata", "loadstart", "adstart", "adend"];
	/**/

    function getYouboraData() {
        if (typeof youboraDataMap !== 'undefined') {
            return youboraDataMap.get(this.id);
        } else {
            return youboraData;
        }
    }

    function stop() {
        try {
            isStartSent = false;
            isPaused = false;
            isJoinSent = false;

            clearTimeout(pingTimer);
        } catch (error) {
            if (debug) {
                console.log("SmartPlugin :: " + pluginName + " :: stop :: " + error);
            }
        }
    }

    function setPing() {
        try {
            pingTimer = setTimeout(function() {
                ping();
            }, apiClass.getPingTime());
        } catch (error) {
            if (debug) {
                console.log("SmartPlugin :: " + pluginName + " :: setPing :: " + error);
            }
        }
    }

    function ping() {
        try {
            clearTimeout(pingTimer);
            pingTimer = null;
            setPing();
            if (isStartSent) {
                apiClass.sendPingTotalBitrate(0, 0);
            }
        } catch (error) {
            if (debug) {
                console.log("SmartPlugin :: " + pluginName + " :: Ping :: " + error);
            }
        }
    }
});