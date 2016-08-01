/*jslint browser: true, indent: 2 */
/*global $, chrome, cast, parseInt, CastPlayer, console */

/**
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function () {
  'use strict';

  var wktvcastplayer, ajaxRequest, translate, setupDevEnv, logger, fadeTimer, startDevice,
      apiUrl, errorMessage;

  /**
   * Logger with time
   */
  logger = function (text) {
    console.log(text);
  };

  /**
   * The amount of time in a given state before the player goes idle.
   * @TODO remove hardcoded url's (like: api_url)
   */
  wktvcastplayer = {
    namespace: 'urn:x-cast:tv.wuaki',
    IDLE_TIMEOUT: {
      LAUNCHING: 3 * 1000,       // 3 seconds
      LOADING:   300 * 1000,     // 5 minutes
      PAUSED:    1200 * 1000,    // 20 minutes
      DONE:      300 * 1000,     // 5 minutes
      IDLE:      300 * 1000      // 5 minutes
      // STALLED:   120 * 1000,  // 2 minutes
    },
    Type: {
      IMAGE: 'image',
      VIDEO: 'video'
    },
    State: {
      LAUNCHING: 'launching',
      LOADING:   'loading',
      BUFFERING: 'buffering',
      PLAYING:   'playing',
      PAUSED:    'paused',
      STALLED:   'stalled',
      DONE:      'done',
      IDLE:      'idle'
    },
    country: null,
    i18n: {
      de: {
        ready_to_cast: 'Startklar'
      },
      es: {
        ready_to_cast: 'Listo para reproducir'
      },
      fr: {
        ready_to_cast: 'Pr&ecirc;t &agrave; caster'
      },
      gb: {
        ready_to_cast: 'Ready to cast'
      },
      it: {
        ready_to_cast: 'Presto per trasmettere'
      }
    }
  };

  // declare wktvcastplayer as global
  window.wktvcastplayer = wktvcastplayer || {};

  /**
   * Helper to make api GET requests
   * @param {string} type request type ( get, post, put, delete)
   * @param {string} url url
   * @param {function} callback for the api response
   * @return {json} data
   */
  ajaxRequest = function (type, url, urlData, callback){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open(type, url, true);
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlhttp.setRequestHeader('Accept', 'application/xml');
    xmlhttp.onreadystatechange = function(){
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
        callback(JSON.parse(xmlhttp.responseText));
      }
    };
    xmlhttp.send(urlData);
  };

  translate = function () {
    var all, el, i18n, count, i;
    all = document.querySelectorAll('*');
    count = all.length;
    for (i = 0; i < count; i++) {
      el = all[i];
      i18n = el.dataset.i18n;
      if (i18n) {
        el.innerHTML = wktvcastplayer.i18n[wktvcastplayer.country][i18n];
      }
    }
  };

  setupDevEnv = function () {
    // setup development logging
    cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);
    cast.player.api.setLoggerLevel(cast.player.api.LoggerLevel.DEBUG);

    // render development label
    var devPlayLay = document.getElementById('player'),
        devSpanLay = document.createElement('p'),
        devSpanTxt = document.createTextNode('This is Sparta!');

    devSpanLay.appendChild(devSpanTxt);
    devPlayLay.appendChild(devSpanLay);
  };

  apiUrl = function(){
    if (window.location.origin.indexOf('dev-cast.wuaki.tv') > 1) {
      return 'https://qa-api.wuaki.tv/';
    }
    return 'https://api.wuaki.tv/';
  };

  errorMessage = function(errorCode){
    switch (errorCode)
    {
      case cast.player.api.ErrorCode.MANIFEST:
        return 'MANIFEST_ERROR';
      case cast.player.api.ErrorCode.MEDIAKEYS:
        return 'MEDIAKEYS_ERROR';
      case cast.player.api.ErrorCode.NETWORK:
        return 'NETWORK_ERROR';
      case cast.player.api.ErrorCode.PLAYBACK:
        return 'PLAYBACK_ERROR';
      default:
        return 'GENERIC_ERROR';
    }
  };

  /**
   * Helper to call wuaki's api to create the custom event
   * @param {string} auth_token user's auth_token necessarty to use wuaki's api
   * @param {string} identifier device's identifier
   * @param {integer} user_id user's id
   */
  startDevice = function (auth_token, additional_attributes, serial_number) {
    var url,
        urlData = 'serial_number=' + serial_number + '&' + 'device=cast&event=start&auth_token=' + auth_token
        + '&additional_attributes=' + additional_attributes;

    url = apiUrl() + 'device_pairings.json';
    ajaxRequest('POST', url, urlData,
                function(response){ console.log('[startDevice] status: ' + response.status); }
               );
  };

  window.onload = function () {
    window.mediaPlayer = null;
    var url = apiUrl() + 'i18n.json';

    // call api to get the i18n data
    ajaxRequest('GET', url, null, function (data) {
      var i18nData = data;
      wktvcastplayer.country = i18nData.geoip.country.toLowerCase();

      // set country data attribute
      document.querySelector('body').dataset.country = wktvcastplayer.country;

      translate();

      // init application
      var userAgent = window.navigator.userAgent,
        playerDiv = document.getElementById('player');

      if (!((userAgent.indexOf('CrKey') > -1) || (userAgent.indexOf('TV') > -1))) {
        window.player = new wktvcastplayer.CastPlayer(playerDiv);
      } else {
        if (window.location.origin.indexOf('dev-cast.wuaki.tv') > 1) {
          setupDevEnv();
        }

        window.castReceiver = cast.receiver.CastReceiverManager.getInstance();
        window.player = new wktvcastplayer.CastPlayer(playerDiv);
        window.castReceiver.start(window.castReceiver);
      }
    });
  };

  /**
   *
   * @param {Element} element the element to attach the player
   * @constructor
   * @export
   */
  wktvcastplayer.CastPlayer = function (element) {

    /**
     * CastMessageBus to handle custom messages
     */
    this.castReceiver = cast.receiver.CastReceiverManager.getInstance();
    this.castMessageBus = this.castReceiver.getCastMessageBus(wktvcastplayer.namespace, cast.receiver.CastMessageBus.MessageType.JSON);
    this.castMessageBus.onMessage = this.onBusMessage.bind(this);

    /**
     * The DOM element the player is attached.
     * @private {Element}
     */
    this.element = element;
    this.element.ownerDocument.addEventListener('webkitvisibilitychange', this.onVisibilityChange.bind(this), false);
    /**
     * The current state of the player
     * @private {wktvcastplayer.State}
     */
    this.setState(wktvcastplayer.State.LAUNCHING);

    /**
     * The media element
     * @private {HTMLMediaElement}
     */
    this.mediaElement = (this.element.querySelector('video'));
    this.mediaElement.addEventListener('error', this.onError.bind(this), false);
    this.mediaElement.addEventListener('stalled', this.onStalled.bind(this), false);
    this.mediaElement.addEventListener('waiting', this.onBuffering.bind(this), false);
    this.mediaElement.addEventListener('buffering', this.onBuffering.bind(this), false);
    this.mediaElement.addEventListener('playing', this.onPlaying.bind(this), false);
    this.mediaElement.addEventListener('pause', this.onPause.bind(this), false);
    this.mediaElement.addEventListener('ended', this.onEnded.bind(this), false);
    this.mediaElement.addEventListener('timeupdate', this.onProgress.bind(this), false);
    this.mediaElement.addEventListener('seeking', this.onSeekStart.bind(this), false);
    this.mediaElement.addEventListener('seeked', this.onSeekEnd.bind(this), false);

    this.progressBarInnerElement = this.element.querySelector('.controls-progress-inner');
    this.progressBarThumbElement = this.element.querySelector('.controls-progress-thumb');
    this.curTimeElement = this.element.querySelector('.controls-cur-time');
    this.totalTimeElement = this.element.querySelector('.controls-total-time');

    /**
     * The remote media object
     * @private {cast.receiver.MediaManager}
     */
    this.mediaManager = new cast.receiver.MediaManager(this.mediaElement);
    this.mediaManager.onLoad = this.onLoad.bind(this);
    this.mediaManager.onStop = this.onStop.bind(this);
  };

  /**
   * Parse unique senders from the receiver
   */
  wktvcastplayer.CastPlayer.prototype.getUniqueSenders = function() {
    var id, i,
      senders = window.castReceiver.getSenders(),
      ids = [];

    for (i = 0; i < senders.length; i ++) {
      id = senders[i].split(':', 1).join();
      if (ids.indexOf(id) < 0) {
        ids.push(id);
      }
    }
    return ids;
  };

  /**
   * Sets the amount of time before the player is considered idle.
   *
   * @param {number} t the time in milliseconds before the player goes idle
   * @private
   */
  wktvcastplayer.CastPlayer.prototype.setIdleTimeout = function (t) {
    clearTimeout(this.idle);
    if (t) {
      this.idle = setTimeout(this.onIdle.bind(this), t);
    }
  };

  /**
   * Handler for the message Bus
   *
   * @private
   */
  wktvcastplayer.CastPlayer.prototype.onBusMessage = function (event) {
    var courier, senderId, message, additional_attributes, auth_token, serial_number;

    courier = event.data;
    senderId = event.senderId;
    logger('[onBusMessage]', event.data);

    if (courier.command == 'user_disconnected_explicitly') {
      if (this.getUniqueSenders().length < 2) {
        message = { command: 'last_user_disconnected' };
        this.castMessageBus.send(senderId, message);
        logger('[teardown]');
        window.close();
      } else {
        message = { command: 'some_user_disconnected' };
        this.castMessageBus.send(senderId, message);
        logger('[some_user_disconnected]');
      }
    }

    if (courier.command == 'start') {
      if (this.getUniqueSenders().length < 2) {
        additional_attributes = JSON.stringify(courier.additional_attributes);
        auth_token = courier.auth_token;
        serial_number = courier.serial_number;
        startDevice(auth_token, additional_attributes, serial_number);
        logger('[device_start]');
      }
    }
  };

  /**
   * Sets the type of player to video
   *
   * @private
   */
  wktvcastplayer.CastPlayer.prototype.setContentTypeToVideo = function () {
    this.type = wktvcastplayer.Type.VIDEO;
  };

  /**
   * Sets the state of the player
   *
   * @param {wktvcastplayer.State} state the new state of the player
   * @param {boolean=} crossfade true if should cross fade between states
   * @param {number=} delay the amount of time (in ms) to wait
   */
  wktvcastplayer.CastPlayer.prototype.setState = function (state) {
    this.state = state;
    this.element.className = 'player video ' + state;
    this.setIdleTimeout(wktvcastplayer.IDLE_TIMEOUT[state.toUpperCase()]);
    logger('[setState]', state);
  };

  /**
   * Callback called when media has stalled
   *
   */
  wktvcastplayer.CastPlayer.prototype.onStalled = function () {
    logger('[onStalled]');
    logger('[setState] stalled');
    // this.setState(wktvcastplayer.State.STALLED);
  };

  /**
   * Callback called when media is buffering
   *
   */
  wktvcastplayer.CastPlayer.prototype.onBuffering = function () {
    logger('[onBuffering]');
    if (this.state !== wktvcastplayer.State.LOADING) {
      wktvcastplayer.fadeUi('show');
      this.setState(wktvcastplayer.State.BUFFERING);
    }
  };

  /**
   * Callback called when media has started playing
   *
   */
  wktvcastplayer.CastPlayer.prototype.onPlaying = function () {
    logger('[onPlaying]');
    wktvcastplayer.fadeUi('show');
    this.setState(wktvcastplayer.State.PLAYING);
  };

  /**
   * Callback called when media has been paused
   *
   */
  wktvcastplayer.CastPlayer.prototype.onPause = function () {
    if (this.state !== wktvcastplayer.State.DONE) {
      if (window.mediaPlayer !== null &&
          window.mediaPlayer.getState(['underflow']).underflow === true) {
        logger('[onAutoPause]');
        this.setState(wktvcastplayer.State.BUFFERING);
      } else {
        logger('[onPause]');
        wktvcastplayer.fadeUi('hide', 5000);
        this.setState(wktvcastplayer.State.PAUSED);
      }
    }
  };

  /**
   * Callback called when media has been stopped
   *
   */
  wktvcastplayer.CastPlayer.prototype.onStop = function () {
    logger('[onStop]');
    var self = this;
    wktvcastplayer.fadeOut(self.element, 0.75, function () {
      self.mediaElement.pause();
      self.mediaElement.removeAttribute('src');
      self.setState(wktvcastplayer.State.DONE);
      wktvcastplayer.fadeIn(self.element, 0.75);
      //TEST
      SmartPlugin.reset();
    });
  };

  /**
   * Callback called when media has ended
   *
   */
  wktvcastplayer.CastPlayer.prototype.onEnded = function () {
    logger('[onEnded]');
    this.setState(wktvcastplayer.State.DONE);
  };

  /**
   * Callback called when media position has changed
   *
   */
  wktvcastplayer.CastPlayer.prototype.onProgress = function () {
    var curTime = this.mediaElement.currentTime, totalTime = this.mediaElement.duration, pct;
    if (!isNaN(curTime) && !isNaN(totalTime)) {
      pct = 100 * (curTime / totalTime);
      this.curTimeElement.innerText = wktvcastplayer.formatDuration(curTime);
      this.totalTimeElement.innerText = wktvcastplayer.formatDuration(totalTime);
      this.progressBarInnerElement.style.width = pct + '%';
      this.progressBarThumbElement.style.left = pct + '%';
    }
  };

  /**
   * Callback called when user starts seeking
   *
   */
  wktvcastplayer.CastPlayer.prototype.onSeekStart = function () {
    logger('[onSeekStart]');
    wktvcastplayer.fadeUi('show');
    clearTimeout(this.seekingTimeout);
    this.element.classList.add('seeking');
  };

  /**
   * Callback called when user stops seeking
   *
   */
  wktvcastplayer.CastPlayer.prototype.onSeekEnd = function () {
    logger('[onSeekEnd]');
    wktvcastplayer.fadeUi('show');
    clearTimeout(this.seekingTimeout);
    this.seekingTimeout = wktvcastplayer.addClassWithTimeout(this.element, 'seeking', 3000);
  };

  /**
   * Callback called when media volume has changed - we rely on the pause timer
   * to get us to the right state.  If we are paused for too long, things will
   * close. Otherwise, we can come back, and we start again.
   *
   */
  wktvcastplayer.CastPlayer.prototype.onVisibilityChange = function () {
    logger('[onVisibilityChange]');
    if (document.webkitHidden) {
      this.mediaElement.pause();
    } else {
      this.mediaElement.play();
    }
  };

  /**
   * Callback called when player enters idle state
   *
   */
  wktvcastplayer.CastPlayer.prototype.onIdle = function () {
    logger('[onIdle]');
    if (this.state === wktvcastplayer.State.DONE ||
        this.state === wktvcastplayer.State.PAUSED ||
        this.state === wktvcastplayer.State.IDLE) {
      logger('[teardown]');
      window.close();
    } else {
      this.setState(wktvcastplayer.State.IDLE);
    }
  };

  /**
   * Called to handle an error when the metadata could not be loaded.
   * cast.MediaManager in the Receiver also listens for this event, and it will
   * notify any senders. We choose to load the loading state because the problem
   * might be caused by some network issues but it's better to show some coherent
   * response to the user.
   *
   */
  wktvcastplayer.CastPlayer.prototype.onLoadMetadataError = function() {
    logger('[onLoadMetadataError]');
    this.setState(wktvcastplayer.State.LOADING);
  };

  /**
   * Called to handle an error when the media could not be loaded.
   * cast.MediaManager in the Receiver also listens for this event, and it will
   * notify any senders. We choose to just enter the done state, bring up the
   * finished image and let the user either choose to do something else.  We are
   * trying not to put up errors on the second screen.
   *
   */
  wktvcastplayer.CastPlayer.prototype.onError = function () {
    logger('[onError]');
    this.setState(wktvcastplayer.State.DONE);
    url = apiUrl() + 'errors';
    errorCode = 'LOAD_ERROR';
    urlData = 'device=cast&message=ErrorCode-'+ errorCode;
    ajaxRequest('POST', url, urlData,
                function(response){ logger('Receiver OnError: ' + errorCode); }
               );
  };

  /**
   * Called to handle a load PlayReady request
   *
   * @param {cast.receiver.MediaManager.Event} event the load event
   * @param {boolean} autoplay on the mediaElement
   */
  wktvcastplayer.CastPlayer.prototype.loadPlayReady = function (event) {
    var url, initialTimeIndexSeconds, protocol, mediaInfo;
    if (window.mediaPlayer) {
      window.mediaPlayer.unload();
    }

    if (event.data.media && event.data.media.contentId) {
      url = event.data.media.contentId;
      mediaInfo = event.data.media;

      window.mediaHost = new cast.player.api.Host({
        'mediaElement': this.mediaElement,
        'url': url,
        'licenseCustomData': mediaInfo.customData.licenseUrl
      });

      window.mediaHost.onError = function (errorCode) {
        var errorUrl, urlData, errorMsg, backtrace;
        console.error('[onError]', errorCode);
        errorUrl = apiUrl() + 'errors';
        errorMsg = errorMessage(errorCode);
        backtrace = JSON.stringify(mediaInfo);
        urlData = 'device=cast&message=ErrorCode-'+ errorMsg + '&backtrace=' + backtrace;
        ajaxRequest('POST', errorUrl, urlData,
                    function(){ logger('mediaPlayerLibrar Error: ' + errorMsg); }
                   );
        if (window.mediaPlayer) {
          window.mediaPlayer.unload();
        }
      };

      initialTimeIndexSeconds = mediaInfo.currentTime || 0;
      protocol = new cast.player.api.CreateSmoothStreamingProtocol(window.mediaHost);

      if (!protocol) {
        this.mediaManager.onLoadOrig(event); // Call on the original callback
      } else {
        this.setState(wktvcastplayer.State.LOADING);
        window.mediaPlayer = new cast.player.api.Player(window.mediaHost);
        window.mediaPlayer.load(protocol, initialTimeIndexSeconds);
      }
    }
  };

  /**
   * Called to handle a load PlayReady request
   *
   * @param {string} contentId stream`s url
   * @param {boolean} autoplay  Autoplay on the mediaElement
   */
  wktvcastplayer.CastPlayer.prototype.loadMp4 = function () {
    if (window.mediaPlayer) {
      window.mediaPlayer.unload();
    }
    logger('[loadMp4]');
  };

  /**
   * Called to handle a load request
   *
   * @param {cast.receiver.MediaManager.Event} event the load event
   */

  // TODO - setup for load here
  // TODO - if there is an error during load: call mediaManager.sendLoadError to notify sender
  // TODO - if there is no error call mediaManager.sendLoadCompleteComplete
  // TODO - call mediaManager.setMediaInformation(MediaInformation)

  wktvcastplayer.CastPlayer.prototype.onLoad = function (event) {

    // BEHOLD - streamType will be always in uppercase due compatibility issues
    // https://developers.google.com/cast/docs/reference/chrome/chrome.cast.media.StreamType
    // We need tho force the streamType to uppercase because Android is pretty strict so it only
    // process the data in uppercase for this particular case
    event.data.media.streamType = event.data.media.streamType.toUpperCase();

    var title, titleElement, subtitle, subtitleElement, artwork, artworkElement, autoplay, contentId, contentType;

    logger('[onLoad]');
    this.setState(wktvcastplayer.State.LOADING);

    title = wktvcastplayer.getValue(event.data, ['media', 'metadata', 'title']);
    titleElement = this.element.querySelector('.media-title');
    wktvcastplayer.setInnerText(titleElement, title);

    subtitle = wktvcastplayer.getValue(event.data, ['media', 'metadata', 'subtitle']);
    subtitleElement = this.element.querySelector('.media-director');
    wktvcastplayer.setInnerText(subtitleElement, subtitle);

    artwork = wktvcastplayer.getValue(event.data, ['media', 'metadata', 'images', 0, 'url']);
    artworkElement = this.element.querySelector('.media-artwork');
    wktvcastplayer.setBackgroundImage(artworkElement, artwork);

    autoplay = wktvcastplayer.getValue(event.data, ['autoplay']);
    contentId = wktvcastplayer.getValue(event.data, ['media', 'contentId']);
    contentType = wktvcastplayer.getValue(event.data, ['media', 'contentType']);

    this.setContentTypeToVideo();
    this.mediaElement.autoplay = autoplay || true;
    this.mediaElement.src = contentId || '';

    if (contentType === 'video/mp4') {
      this.loadMp4();
    } else if (contentType === 'application/vnd.ms-sstr+xml') {
      this.loadPlayReady(event);
    }
    youboraData.setAccountCode('QA');
    youboraData.setUsername('FerranCastToLoco');
    youboraData.getBalanceEnabled(true);
    youboraData.setPropertyMetaTitle('testTitle');
    youboraData.setTransaction('testTransaction');
    youboraData.setCDN('LEVEL3');
    youboraData.setIP('test.ip.com.net');
    youboraData.setISP('CUSTOMISP');
    youboraData.setContentId('Test-Content');

        youboraData.setBalanceProperties({
            enabled:    true,
            balanceType:"balance", 
            service:    "http://smartswitch.youbora.com/",
            zoneCode:   "default",
            originCode: "test",
            niceNVA:    "3600",
            ncieNVB:    "10",
            token:      "07dc44a13f74b00d6be6b7a6c44d35c1"
        });

    SmartPlugin.Init();
  };

  /**
   * Get a value from an object multiple levels deep.
   *
   * @param {Object} obj The object.
   * @param {Array} keys The keys keys.
   * @returns {R} the value of the property with the given keys
   * @template R
   */
  wktvcastplayer.getValue = function (obj, keys) {
    var i;
    for (i = 0; i < keys.length; i += 1) {
      if (obj === null || obj === undefined) {
        return '';                    // default to an empty string
      }
      obj = obj[keys[i]];
    }
    return obj;
  };

  /**
   * Sets the inner text for the given element.
   *
   * @param {Element} element The element.
   * @param {string} text The text.
   */
  wktvcastplayer.setInnerText = function (element, text) {
    element.innerText = text || '';
  };

  /**
   * Sets the background image for the given element.
   *
   * @param {Element} element The element.
   * @param {string} url The image url.
   */
  wktvcastplayer.setBackgroundImage = function (element, url) {
    element.style.backgroundImage = (url ? 'url("' + url + '")' : 'none');
    element.style.display = (url ? '' : 'none');
  };

  /**
   * Formats the given duration
   *
   * @param {number} dur the duration (in seconds)
   * @return {string} the time (in HH:MM:SS)
   */
  wktvcastplayer.formatDuration = function (dur) {
    var hr, min, sec;
    function digit(n) { return ('00' + Math.floor(n)).slice(-2); }
    hr = Math.floor(dur / 3600);
    min = Math.floor(dur / 60) % 60;
    sec = dur % 60;
    if (!hr) {
      return digit(min) + ':' + digit(sec);
    }
    return digit(hr) + ':' + digit(min) + ':' + digit(sec);
  };

  /**
   * Adds the given className to the given element for the specified amount of
   * time
   *
   * @param {Element} element the element to add the given class
   * @param {string} className the class name to add to the given element
   * @param {number} timeout the amount of time (in ms) the class should be
   *                 added to the given element
   * @return {number} returns a numerical id, which can be used later with
   *                  window.clearTimeout()
   */
  wktvcastplayer.addClassWithTimeout = function (element, className, timeout) {
    element.classList.add(className);
    return setTimeout(function () {
      element.classList.remove(className);
    }, timeout);
  };

  /**
   * Select all the UI elements that must be hidden with some transition
   * returning an erray to control them apart
   */
  wktvcastplayer.uiElements = function() {
    var mediaInfo, controlsProgress, controlsTotal, controlsCurrent, stamp, elementsArray;

    mediaInfo          = wktvcastplayer.elemByClass('media-info');
    controlsProgress   = wktvcastplayer.elemByClass('controls-progress');
    controlsTotal      = wktvcastplayer.elemByClass('controls-total-time');
    controlsCurrent    = wktvcastplayer.elemByClass('controls-cur-time');
    stamp              = wktvcastplayer.elemByClass('stamp');

    elementsArray = [mediaInfo, controlsProgress, controlsTotal, controlsCurrent, stamp];
    return elementsArray;
  };

  /**
   * Hide the UI elements
   * @param {action} to know which kind of fade must be enabled
   * @param {time} the amount of time in miliseconds for the animation to start
   */
  wktvcastplayer.fadeUi = function(action, time) {
    switch (action) {
      case 'hide':
        fadeTimer = setTimeout(function() {
          wktvcastplayer.uiElements().forEach(function(element) {
            wktvcastplayer.fadeOut(element, 1);
          });
        }, time);
        break;
      case 'show':
        clearTimeout(fadeTimer);
        wktvcastplayer.uiElements().forEach(function(element) {
          wktvcastplayer.fadeIn(element, 0);
        });
        break;
    }
  };

  /**
   * Return the DOM element with a concrete className
   *
   * @param {className} the class of the element we want to select in the DOM
   */
  wktvcastplayer.elemByClass = function (className) {
    return document.getElementsByClassName(className)[0];
  };

  /**
   * Causes the given element to fade in
   *
   * @param {Element} element the element to fade in
   * @param {number} time the amount of time (in seconds) to transition
   * @param {function()=} doneFunc the function to call when complete
   */
  wktvcastplayer.fadeIn = function (element, time, doneFunc) {
    wktvcastplayer.fadeTo(element, '', time, doneFunc);
  };

  /**
   * Causes the given element to fade out
   *
   * @param {Element} element the element to fade out
   * @param {number} time the amount of time (in seconds) to transition
   * @param {function()=} doneFunc the function to call when complete
   */
  wktvcastplayer.fadeOut = function (element, time, doneFunc) {
    wktvcastplayer.fadeTo(element, 0, time, doneFunc);
  };

  /**
   * Causes the given element to fade to the given opacity
   *
   * @param {Element} element the element to fade in/out
   * @param {string|number} opacity the opacity to transition to
   * @param {number} time the amount of time (in seconds) to transition
   * @param {function()=} doneFunc the function to call when complete
   */
  wktvcastplayer.fadeTo = function (element, opacity, time, doneFunc) {
    var listener;
    listener = function () {
      element.style.webkitTransition = '';
      element.removeEventListener('webkitTransitionEnd', listener, false);
      if (doneFunc) {
        doneFunc();
      }
    };
    element.addEventListener('webkitTransitionEnd', listener, false);
    element.style.webkitTransition = 'opacity ' + time + 's';
    element.style.opacity = opacity;
  };
}());
