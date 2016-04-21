
// JavaScript Document
var allMenuObject;
var cntIndex = 1;
var allExitObject;
var video;
var plugin;
var progressBarWidth;
var TIME_FOR_SEEK = 10;
var rowID = 1;
var videoPlayInfo;
var dragged = false;

/*
Function ready()
@param -event
@Description - This has the implementation of ready, which loads the video player
Returns  -void
*/
$('document').ready(function() {
    allMenuObject = new Array();
    allExitObject = new Array();
    video = getVideo();

    // Youbora
    initYoubora();

    playMedia();
    video.onPlayStateChange = playStateChange;
    video.onBuffering = buffering;
    progressBarWidth = $('#progressBg').width();
    
    /* on mouseenter of progressBall class, change to progressBallHover class */
    $("#progressBall").on("mouseenter", function(event) {
        if (video.playState == 1) {
            resetFocus();
            $(this).toggleClass("progressBallHover");
            rowID = 2;
            cntIndex = i;
            /* to drag on progressBar, video plays from where progressBall will be pointing*/
            $(".progressBallHover").draggable({
                axis: 'x',
                disabled: false,
                containment: '#ballCoverage',
                start: function(event, ui) {
                    dragged = true;
                },
                stop: function(event, ui) {
                    var xmove = ui.position.left;
                    var seekedTime = (xmove / progressBarWidth) * videoPlayInfo.duration;
                    video.seek(seekedTime);

                    // Youbora
                    if (typeof $YB != "undefined")
                        plugin.seekingHandler();
                }
            });
        }
    });
    
    /* on clicking on progressBar, progressBall moves & video plays from where progressBall will be pointing*/
    $('.progressBarClick').click(function(e) {
        if (video.playState == 1) {
            var xmove = e.pageX - $(this).offset().left;
            var seekedTime = (xmove / progressBarWidth) * videoPlayInfo.duration;
            video.seek(seekedTime);

            // Youbora
            if (typeof $YB != "undefined")
                plugin.seekingHandler();
        }

    });


});

/*
Function forwardMedia()
@param- none
@Description- forwards the running video by 10sec.
Returns- none
*/
function forwardMedia() {
    if (video.playState != 4 && video.playState == 1) {
        if (video.isSeekable) {
            // Youbora
            if (typeof $YB != "undefined")
                plugin.seekingHandler();

            if ((video.playPosition + (TIME_FOR_SEEK * 1000)) < videoPlayInfo.duration * 1000) {
                video.seek(video.playPosition + (TIME_FOR_SEEK * 1000));
            } else {
                video.seek(videoPlayInfo.duration);
            }
        }
    }
}
/*
Function rewindMedia()
@param- none
@Description- rewinds the running video by 10sec.
Returns- none
*/
function rewindMedia() {
    if (video.playState != 4 && video.playState == 1) {
        if (video.isSeekable) {
            // Youbora
            if (typeof $YB != "undefined")
                plugin.seekingHandler();

            if ((video.playPosition - (TIME_FOR_SEEK * 1000)) > 0) {
                video.seek(video.playPosition - (TIME_FOR_SEEK * 1000));
            } else {
                video.seek(0);
            }
        }
    }
}