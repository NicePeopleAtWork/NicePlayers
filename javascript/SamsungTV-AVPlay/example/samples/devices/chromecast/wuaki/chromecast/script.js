var session = null;

var progressFlag = 1;
var mediaCurrentTime = 0;

$( document ).ready(function(){
    var loadCastInterval = setInterval(function(){
            if (chrome.cast.isAvailable) {
                    console.log('Cast has loaded.');
                    clearInterval(loadCastInterval);
                    initializeCastApi();
            } else {
                    console.log('Unavailable');
            }
    }, 1000);

	$('#castme').click(function(){
	        launchApp();
	});

});

function loadMedia() {
    if (!session) { console.log("No session."); return; }
    session.addMediaListener(onMediaDiscovered.bind(this, 'addMediaListener'));        
    var mediaInfo = new chrome.cast.media.MediaInfo('http://dbb2.nice264.com/2163455179001/2163455179001_3617672303001_tears-of-steel-404p.mp4');
    mediaInfo.contentType = 'video/mp4';  
    var request = new chrome.cast.media.LoadRequest(mediaInfo);
    request.autoplay = true;
    session.loadMedia(request, onLoadSuccess, onLoadError); 
}

function onMediaDiscovered(how, media) { 
	console.log('Media Update')
    media.addUpdateListener(onMediaStatusUpdate);
    mediaCurrentTime = session.media[0].currentTime; 
}

function onLoadSuccess(elem) {
	console.log(elem)
    console.log('Successfully loaded image.');
}

function onLoadError() {
        console.log('Failed to load image.');
}
function launchApp() {
        console.log("Launching the Chromecast App...");
        chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);
}
function onRequestSessionSuccess(e) {
        console.log("Successfully created session: " + e.sessionId);
        session = e; 
        session.addMediaListener(onMediaDiscovered.bind(this, 'addMediaListener'));
}

function onLaunchError() {
        console.log("Error connecting to the Chromecast.");
}
function sessionListener(e) {
        session = e;
        console.log('New session');
        if (session.media.length != 0) { console.log('Found ' + session.media.length + ' sessions.'); }
}

function onRequestSessionSuccess(e) {
        console.log("Successfully created session: " + e.sessionId);
        session = e;
        loadMedia();
}

function receiverListener(e) {
        if( e === 'available' ) { console.log("Chromecast was found on the network."); }
        else { console.log("There are no Chromecasts available."); }
}

function onInitSuccess() { console.log("Initialization succeeded"); }
function onInitError() { console.log("Initialization failed"); }

function initializeCastApi() {
        var applicationID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
        var sessionRequest = new chrome.cast.SessionRequest(applicationID);
        var apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);
        chrome.cast.initialize(apiConfig, onInitSuccess, onInitError); 
}; 

function seekMedia(pos) {
        progressFlag = 0;
        var request = new chrome.cast.media.SeekRequest();
        request.currentTime = pos * session.media[0].media.duration / 100;
        session.media[0].seek(request, onSeekSuccess.bind(this, 'media seek done'), onSeekError);
}

$('#stop').click(function(){ stopApp(); });
$('#pause').click(function(){ puseApp(); }); 
function stopApp() { session.stop(onStopAppSuccess, onStopAppError); }
function onStopAppSuccess() { console.log('Successfully stopped app.'); }
function onStopAppError() { console.log('Error stopping app.'); }
function puseApp() { session.pause(onPauseAppSuccess, onStopAppError); }
function onPauseAppSuccess() { console.log('Successfully paused app.'); }
function onPauseAppError() { console.log('Error pausing app.'); }
function onMediaStatusUpdate(isAlive) { console.log('Update...') } 
function onSeekError(info) { console.log(info); }
function onSeekSuccess(info) { console.log(info); setTimeout(function(){progressFlag = 1},1500); }