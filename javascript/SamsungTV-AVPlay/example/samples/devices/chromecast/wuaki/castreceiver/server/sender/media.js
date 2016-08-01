<!--
// Copyright 2014 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
-->

/**
 * global variables
 */
var currentMediaSession = null;
var currentVolume = 0.5;
var progressFlag = 1;
var mediaCurrentTime = 0;
var session = null;
var autoJoinPolicy = 'tab_and_origin_scoped';
var media = [
    {'url':'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4',
     'title':'Big Buck Bunny',
     'thumb':'images/bunny.jpg',
     'metadataType':0
    },
    {'url':'http://commondatastorage.googleapis.com/gtv-videos-bucket/ED_1280.mp4',
     'title':'Elephant Dream',
     'thumb':'images/ed.jpg',
     'metadataType':1
    },
    {'url':'http://commondatastorage.googleapis.com/gtv-videos-bucket/tears_of_steel_1080p.mov',
     'title':'Tears of Steel',
     'thumb':'images/Tears.jpg',
     'metadataType':2
    },
    {'url':'http://commondatastorage.googleapis.com/gtv-videos-bucket/Google%20IO%202011%2045%20Min%20Walk%20Out.mp3',
     'title':'Google I/O 2011 Audio',
     'thumb':'images/google-io-2011.jpg',
     'metadataType':3
    },
    {'url':'http://www.videws.com/eureka/castv2/images/San_Francisco_Fog.jpg',
     'title':'San Francisco Fog',
     'thumb':'images/San_Francisco_Fog.jpg',
     'metadataType':4
    },
];


/**
 * Call initialization
 */
if (!chrome.cast || !chrome.cast.isAvailable) {
  setTimeout(initializeCastApi, 1000);
}


/**
 * parse query string
 */
function getQueryParams() {
    var qs = window.location.search.substring(1);
    qs = qs.split("+").join(" ");

    var params = {}, tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }

    return params;
}

/**
 * initialization
 */
function initializeCastApi() {
  var p = getQueryParams();

  if( p['auto'] == 'page_scoped' ) {
    autoJoinPolicy = chrome.cast.AutoJoinPolicy.PAGE_SCOPED;
  }
  else if( p['auto'] == 'origin_scoped' ) {
    autoJoinPolicy = chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;
  }
  else {
    autoJoinPolicy = chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED;
  }

  var sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
  var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
    sessionListener,
    receiverListener,
    autoJoinPolicy);

  chrome.cast.initialize(apiConfig, onInitSuccess, onError);
};

/**
 * initialization success callback
 */
function onInitSuccess() {
  appendMessage("init success");
}

/**
 * initialization error callback
 */
function onError() {
  console.log("error");
  appendMessage("error");
}

/**
 * generic success callback
 */
function onSuccess(message) {
  console.log(message);
}

/**
 * callback on success for stopping app
 */
function onStopAppSuccess() {
  console.log('Session stopped');
  appendMessage('Session stopped');
  document.getElementById("casticon").src = 'images/cast_icon_idle.png';
}

/**
 * session listener during initialization
 */
function sessionListener(e) {
  console.log('New session ID: ' + e.sessionId);
  appendMessage('New session ID:' + e.sessionId);
  session = e;
  if (session.media.length != 0) {
    appendMessage(
        'Found ' + session.media.length + ' existing media sessions.');
    onMediaDiscovered('onRequestSessionSuccess_', session.media[0]);
  }
  session.addMediaListener(
      onMediaDiscovered.bind(this, 'addMediaListener'));
  session.addUpdateListener(sessionUpdateListener.bind(this));
}

/**
 * session update listener
 */
function sessionUpdateListener(isAlive) {
  var message = isAlive ? 'Session Updated' : 'Session Removed';
  message += ': ' + session.sessionId;
  appendMessage(message);
  if (!isAlive) {
    session = null;
  }
};

/**
 * receiver listener during initialization
 */
function receiverListener(e) {
  if( e === 'available' ) {
    console.log("receiver found");
    appendMessage("receiver found");
  }
  else {
    console.log("receiver list empty");
    appendMessage("receiver list empty");
  }
}

/**
 * launch app and request session
 */
function launchApp() {
  console.log("launching app...");
  appendMessage("launching app...");
  chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);
}

/**
 * callback on success for requestSession call
 * @param {Object} e A non-null new session.
 */
function onRequestSessionSuccess(e) {
  console.log("session success: " + e.sessionId);
  appendMessage("session success: " + e.sessionId);
  session = e;
  document.getElementById("casticon").src = 'images/cast_icon_active.png';
}

/**
 * callback on launch error
 */
function onLaunchError() {
  console.log("launch error");
  appendMessage("launch error");
}

/**
 * stop app/session
 */
function stopApp() {
  session.stop(onStopAppSuccess, onError);
}

/**
 * load media
 * @param {string} i An index for media
 */
function loadMedia(currentMediaIndex) {
  if (!session) {
    console.log("no session");
    appendMessage("no session");
    return;
  }

  console.log("loading..." + media[currentMediaIndex]['url']);
  appendMessage("loading..." + media[currentMediaIndex]['url']);
  var mediaInfo = new chrome.cast.media.MediaInfo(media[currentMediaIndex]['url']);

  var mediaInfo = new chrome.cast.media.MediaInfo(media[currentMediaIndex]['url'], 'video/mp4');

  switch(currentMediaIndex) {
    case chrome.cast.media.MetadataType.GENERIC:
      mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
      mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
      mediaInfo.metadata.subtitle = 'By Blender Foundation';
      mediaInfo.metadata.releaseDate = '2000';
      mediaInfo.contentType = 'video/mp4';
      document.getElementById("media_control").style.display = 'block';
      break;
    case chrome.cast.media.MetadataType.TV_SHOW:
      mediaInfo.metadata = new chrome.cast.media.TvShowMediaMetadata();
      mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.TV_SHOW;
      mediaInfo.metadata.seriesTitle = 'seriesTitle';
      mediaInfo.metadata.subtitle = 'Elephant Dream';
      mediaInfo.metadata.season = 5;
      mediaInfo.metadata.episode = 23;
      mediaInfo.metadata.originalAirDate = '2011';
      mediaInfo.contentType = 'video/mov';
      document.getElementById("media_control").style.display = 'block';
      break;
    case chrome.cast.media.MetadataType.MOVIE:
      mediaInfo.metadata = new chrome.cast.media.MovieMediaMetadata();
      mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.MOVIE;
      mediaInfo.metadata.subtitle = 'steel steel steel';
      mediaInfo.metadata.studio = 'By Blender Foundation';
      mediaInfo.metadata.releaseDate = '2006';
      mediaInfo.contentType = 'video/mp4';
      document.getElementById("media_control").style.display = 'block';
      break;
    case chrome.cast.media.MetadataType.MUSIC_TRACK:
      mediaInfo.metadata = new chrome.cast.media.MusicTrackMediaMetadata();
      mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.MUSIC_TRACK;
      mediaInfo.metadata.albumName = 'Album name';
      mediaInfo.metadata.albumArtist = 'Album artist';
      mediaInfo.metadata.artist = 'Music artist';
      mediaInfo.metadata.composer = 'Composer';
      mediaInfo.metadata.trackNumber = 13;
      mediaInfo.metadata.discNumber = 2;
      mediaInfo.metadata.releaseDate = '2011';
      mediaInfo.contentType = 'audio/mp3';
      document.getElementById("media_control").style.display = 'block';
      break;
    case chrome.cast.media.MetadataType.PHOTO:
      mediaInfo.metadata = new chrome.cast.media.PhotoMediaMetadata();
      mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.PHOTO;
      mediaInfo.metadata.artist = 'Photo artist';
      mediaInfo.metadata.location = 'San Francisco';
      mediaInfo.metadata.longitude = 37.7833;
      mediaInfo.metadata.latitude = 122.4167;
      mediaInfo.metadata.width = 1728;
      mediaInfo.metadata.height = 1152;
      mediaInfo.metadata.creationDateTime = '1999';
      mediaInfo.contentType = 'image/jpg';
      document.getElementById("media_control").style.display = 'none';
      break;
    default:
      break;
  }

  mediaInfo.metadata.title = media[currentMediaIndex]['title'];
  mediaInfo.metadata.images = [{'url': 'http://www.videws.com/eureka/castv2/' + media[currentMediaIndex]['thumb']}];

  var request = new chrome.cast.media.LoadRequest(mediaInfo);
  request.autoplay = true;
  request.currentTime = 0;
  session.loadMedia(request,onMediaDiscovered.bind(this, 'loadMedia'), onMediaError.bind(this));

}

/**
 * callback on success for loading media
 * @param {Object} e A non-null media object
 */
function onMediaDiscovered(how, mediaSession) {
  console.log("new media session ID:" + mediaSession.mediaSessionId);
  appendMessage("new media session ID:" + mediaSession.mediaSessionId + ' (' + how + ')');
  currentMediaSession = mediaSession;
  mediaSession.addUpdateListener(onMediaStatusUpdate);
  mediaCurrentTime = currentMediaSession.currentTime;
  playpauseresume.innerHTML = 'Pause';
  document.getElementById("casticon").src = 'images/cast_icon_active.png';
}

/**
 * callback on media loading error
 * @param {Object} e A non-null media object
 */
function onMediaError(e) {
  console.log("media error");
  appendMessage("media error");
  document.getElementById("casticon").src = 'images/cast_icon_warning.png';
}

/**
 * callback for media status event
 * @param {Object} e A non-null media object
 */
function onMediaStatusUpdate(isAlive) {
  if( progressFlag ) {
    document.getElementById("progress").value = parseInt(100 * currentMediaSession.currentTime / currentMediaSession.media.duration);
  }
  document.getElementById("playerstate").innerHTML = currentMediaSession.playerState;
}

/**
 * play media
 */
function playMedia() {
  if( !currentMediaSession )
    return;

  var playpauseresume = document.getElementById("playpauseresume");
  if( playpauseresume.innerHTML == 'Play' ) {
    currentMediaSession.play(null,
      mediaCommandSuccessCallback.bind(this,"playing started for " + currentMediaSession.sessionId),
      onError);
      playpauseresume.innerHTML = 'Pause';
      //currentMediaSession.addListener(onMediaStatusUpdate);
      appendMessage("play started");
  }
  else {
    if( playpauseresume.innerHTML == 'Pause' ) {
      currentMediaSession.pause(null,
        mediaCommandSuccessCallback.bind(this,"paused " + currentMediaSession.sessionId),
        onError);
      playpauseresume.innerHTML = 'Resume';
      appendMessage("paused");
    }
    else {
      if( playpauseresume.innerHTML == 'Resume' ) {
        currentMediaSession.play(null,
          mediaCommandSuccessCallback.bind(this,"resumed " + currentMediaSession.sessionId),
          onError);
        playpauseresume.innerHTML = 'Pause';
        appendMessage("resumed");
      }
    }
  }
}

/**
 * stop media
 */
function stopMedia() {
  if( !currentMediaSession )
    return;

  currentMediaSession.stop(null,
    mediaCommandSuccessCallback.bind(this,"stopped " + currentMediaSession.sessionId),
    onError);
  var playpauseresume = document.getElementById("playpauseresume");
  playpauseresume.innerHTML = 'Play';
  appendMessage("media stopped");
}

/**
 * set media volume
 * @param {Number} level A number for volume level
 * @param {Boolean} mute A true/false for mute/unmute
 */
function setMediaVolume(level, mute) {
  if( !currentMediaSession )
    return;

  var volume = new chrome.cast.Volume();
  volume.level = level;
  currentVolume = volume.level;
  volume.muted = mute;
  var request = new chrome.cast.media.VolumeRequest();
  request.volume = volume;
  currentMediaSession.setVolume(request,
    mediaCommandSuccessCallback.bind(this, 'media set-volume done'),
    onError);
}

/**
 * set receiver volume
 * @param {Number} level A number for volume level
 * @param {Boolean} mute A true/false for mute/unmute
 */
function setReceiverVolume(level, mute) {
  if( !session )
    return;

  if( !mute ) {
    session.setReceiverVolumeLevel(level,
      mediaCommandSuccessCallback.bind(this, 'media set-volume done'),
      onError);
    currentVolume = level;
  }
  else {
    session.setReceiverMuted(true,
      mediaCommandSuccessCallback.bind(this, 'media set-volume done'),
      onError);
  }
}

/**
 * mute media
 * @param {DOM Object} cb A checkbox element
 */
function muteMedia(cb) {
  if( cb.checked == true ) {
    document.getElementById('muteText').innerHTML = 'Unmute media';
    //setMediaVolume(currentVolume, true);
    setReceiverVolume(currentVolume, true);
    appendMessage("media muted");
  }
  else {
    document.getElementById('muteText').innerHTML = 'Mute media';
    //setMediaVolume(currentVolume, false);
    setReceiverVolume(currentVolume, false);
    appendMessage("media unmuted");
  }
}


/**
 * seek media position
 * @param {Number} pos A number to indicate percent
 */
function seekMedia(pos) {
  console.log('Seeking ' + currentMediaSession.sessionId + ':' +
    currentMediaSession.mediaSessionId + ' to ' + pos + "%");
  progressFlag = 0;
  var request = new chrome.cast.media.SeekRequest();
  request.currentTime = pos * currentMediaSession.media.duration / 100;
  currentMediaSession.seek(request,
    onSeekSuccess.bind(this, 'media seek done'),
    onError);
}

/**
 * callback on success for media commands
 * @param {string} info A message string
 * @param {Object} e A non-null media object
 */
function onSeekSuccess(info) {
  console.log(info);
  appendMessage(info);
  setTimeout(function(){progressFlag = 1},1500);
}

/**
 * callback on success for media commands
 * @param {string} info A message string
 * @param {Object} e A non-null media object
 */
function mediaCommandSuccessCallback(info) {
  console.log(info);
  appendMessage(info);
}

/**
 * reload page with auto join or not
 */
function autoJoin(value) {
  window.location.href = window.location.pathname + '?auto=' + value;
};


/**
 * append message to debug message window
 * @param {string} message A message string
 */
function appendMessage(message) {
  var dw = document.getElementById("debugmessage");
  dw.innerHTML += '\n' + JSON.stringify(message);
};
