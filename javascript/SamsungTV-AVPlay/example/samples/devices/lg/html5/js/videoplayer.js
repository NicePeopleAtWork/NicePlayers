//*****************************************************************************
//   LCD TV LABORATORY, LG ELECTRONICS INC., SEOUL, KOREA
//   Copyright(c) 2009 by LG Electronics Inc.
//
//   All rights reserved. No part of this work may be reproduced, stored in a
//   retrieval system, or transmitted by any means without prior written
//   permission of LG Electronics Inc.
//
//   Following script is to run HTML5 video on Netcast Browser.
//
//*****************************************************************************
// JavaScript Document
var allMenuObject;
var cntIndex = 1;
var allExitObject;
var id = ["stop", "play", "rewind", "forward", "view", "option"];
var videoArray = ["http://deslasexta.antena3.com/mp_series1/2012/09/10/00001.mp4 "]; // http://media.w3.org/2010/05/sintel/trailer.mp4
var supportedMimeTypes = [".mp4", ".mpeg", ".wmv", ".ts"];
var currentType = "";
var defaultClass = ["stopButton", "playButton", "rewindButton", "forwardButton", "optionButton"];
var exitBtnClass = ["backKey", "exitKey"];
var video;
var progressBarWidth;
var TIME_FOR_SEEK = 10;
var hideTimerId;
var rowID = 1;
var tempcntIndex = -1;
var oldBuffer = 0;
var dragged = false;
var vidIndex = 0;
var stopped = false;
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

    playMedia();


    progressBarWidth = $('#progressBg').width();
    //on mousemove, show player controls
    $('.playerLayout').on("mousemove", function(event) {
        showPlayer();
        triggerHide();
    });
    //to hideplayer
    $('#videoHolder').on("click", function(event) {
        hidePlayer();
    });
    //on mouseenter change the button color using classes of each control button respectively
    $("#buttonLayout ul li").each(function(i) {
        $(this).on("mouseenter", function(event) {
            resetFocus();
            $(this).toggleClass(defaultClass[i] + "Hover");
            rowID = 1;
            cntIndex = i;
        });
    });
    //on click of the control buttons of the video, respective function will be called
    var elem = $("#buttonLayout ul li");
    $("#buttonLayout ul li").click(function() {
        selectedButton();
    });

    for (i = 0; i < elem.length; i++) {
        allMenuObject.push(elem[i]);
    }

    $(allMenuObject[1]).toggleClass(defaultClass[1] + "Hover");
    //on click of the button, respective function will be called to go back or to exit
    var exitElem = $(".keyHelp div");
    $(".keyHelp div").click(function() {
        selectedButton();
    });
    //on mouseenter change the button color using classes of each button respectively
    $(".keyHelp div").each(function(i) {
        $(this).on("mouseenter", function(event) {
            resetFocus();
            $(this).toggleClass(exitBtnClass[i] + "Hover");
            rowID = 3;
            cntIndex = i;
        });
    });
    for (i = 0; i < exitElem.length; i++) {
        allExitObject.push(exitElem[i]);
    }
    /* on mouseenter of progressBall class, change to progressBallHover class */
    $("#progressBall").on("mouseenter", function(event) {
        if (video.currentTime > 0) {
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

                    video.pause();
                    dragged = true;
                },
                stop: function(event, ui) {
                    var xmove = ui.position.left;
                    video.currentTime = (xmove / progressBarWidth) * video.duration;
                    video.play();

                }
            });
        }

    });
    $("#progressBall").on("mouseleave", function(event) {
        $(".progressBallHover").draggable("disable");
    });
    /*
    Event: play
    @Description - event is triggerd, when the video has been started or is no longer paused,
    				while video playing, changes the play image to pause image, gets the playing video information
    Returns  -void
    */
    video.addEventListener("play", function() {
        getVideoSourceInfo();
        getVideoPlayInfo();
        triggerHide();
        $("#play > img").remove();
        $('#play').append('<img src="images/player_btn_icon/movie_btn_icon_pause_n.png" class="center" />');
        /*when mouse is clicked on progress bar, progressBall moves & video plays from where progressBall will be pointing */
        $('.progressBarClick').click(function(e) {
            var x = e.pageX - $(this).offset().left;
            video.currentTime = (x / progressBarWidth) * video.duration;
        });

    });

    /*
    Event: pause
    @Description - event is triggerd, when the video has been paused,
    				when paused, changes the pause image to play image
    Returns  -void
    */
    video.addEventListener("pause", function() {
        $("#play > img").remove();
        $('#play').append('<img src="images/player_btn_icon/movie_btn_icon_play_n.png" class="center" />');
    });
    /*
    Event: timeupdate
    @Description - event is triggerd, when the video's currentTime is changed,
    				it may be due to, forward, rewind or by dragging the progressBall
    Returns  -void
    */
    video.addEventListener("timeupdate", function() {
        getVideoPlayInfo()
    });
    /*
    Event: progress
    @Description - event is triggerd, when the browser is buffreing the video
    Returns  -void
    */
    video.addEventListener("progress", function() {
        buffering();
    });
    /*
    Event: ended
    @Description - event is trigerred, if the video has ended or not, if ended resets all the functionalties
    Returns  -void
    */

    video.addEventListener("ended", endPlay, false);

    function endPlay() {
        video.src = " ";
        resetProgress();
        if (!stopped) {
            vidIndex < videoArray.length - 1 ? vidIndex++ : vidIndex = 0;
            playMedia();
        }
    }
    /*
    Function keydown()
    @param -event
    @Description - This has the implementation of keydown like lfet right up and donw
    Returns  -void
    */

    $(document).keydown(function(event) {
        var key = event.keycode || event.which;
        switch (key) {
            case VK_BACK:
                if (window.NetCastBack) {
                    window.NetCastBack();
                }
                break;
            case VK_RIGHT:
                setFocus(1)
                break;
            case VK_LEFT:
                setFocus(-1)
                break;
            case VK_UP:
                if (rowID < 4) {
                    rowID++;
                }
                if (video.paused && rowID == 2) {
                    rowID = 3;
                }

                if (rowID == 3) {
                    tempcntIndex = cntIndex;
                    cntIndex > 1 ? cntIndex = 1 : "";
                }
                setFocus(0);
                break;
            case VK_DOWN:
                if (rowID > 1) {
                    rowID--;
                    tempcntIndex != -1 ? cntIndex = tempcntIndex : "";
                    tempcntIndex != -1;
                }
                if (video.paused && rowID == 2) {
                    rowID = 1;
                }
                setFocus(0);
                break
            case VK_ENTER:
                $(".playerBottom").is(":visible") ? selectedButton() : "";
                break;
        }
        showPlayer();
        triggerHide();
    });
});
/*
Function setFocus()
@param -button index
@Description - This changes the color of the button from normal to focus (mouse over or remote keynavigation)
Returns  -void
*/
function setFocus(idx) {
    if (rowID == 1) {
        if (allMenuObject[cntIndex + idx] != undefined) {
            resetFocus();
            cntIndex = cntIndex + idx;
            $(allMenuObject[cntIndex]).addClass(defaultClass[cntIndex] + "Hover");
        }

    } else if (rowID == 2) {
        if (idx != 0) {
            idx == 1 ? forwardMedia() : rewindMedia();
        } else {
            resetFocus();
            $("#progressBall").addClass("progressBallHover");
        }
    } else if (rowID == 3) {
        if (allExitObject[cntIndex + idx] != undefined) {
            resetFocus();
            cntIndex = cntIndex + idx;
            $(allExitObject[cntIndex]).addClass(exitBtnClass[cntIndex] + "Hover");
        }
    }
}
/*
Function resetFocus()
@param - none
@Description - This changes the color of the button from focus to noramal (mouse over or remote keynavigation)
Returns  -void
*/
function resetFocus() {
    $("#buttonLayout li").each(function(i) {
        $(allMenuObject[i]).removeClass(defaultClass[i] + "Hover");
    });

    $(".keyHelp div").each(function(i) {
        $(allExitObject[i]).removeClass(exitBtnClass[i] + "Hover");
    });
    $("#progressBall").removeClass("progressBallHover");

}
/*
Function triggerHide()
@param -none
@Description - This triggers the hide function in 5 seconds
Returns  -void
*/
function triggerHide() {
    if (!video.ended) {
        clearTimeout(hideTimerId);
        hideTimerId = setTimeout("hidePlayer()", 5000);
    }
}

/*
Function hidePlayer()
@param -none
@Description - function to hide the player controls
Returns  -void
*/
function hidePlayer() {
    $(".playerBottom").hide(100);
}

/*
Function showPlayer()
@param -none
@Description - function to show the player controls
Returns  -void
*/
function showPlayer() {
    $(".playerBottom").show();
}


/*
Function buffering()
@param - none
@Description - It implements the buffering of the video. As video buffers, the progress bar will
gradually increases with light pink color, showing the buffering progress
Returns  -void
*/
function buffering() {
    if (video) {
        var bufferPos = Math.ceil((video.buffered.end(0) / video.duration) * progressBarWidth)
        var notNaN = isNaN(bufferPos)
        if (!notNaN) {
            setBufferPosition(bufferPos);
        }
    }
}
/*
Function setBufferPosition()
@param - position
@Description - to show the buffering progress
Returns  -void
*/
function setBufferPosition(position) {
    $("#progressBuffer").addClass("progress progressBuffer");
    $("#progressBuffer").css("width", position + 'px');
}

/*
Function selectedButton()
@param -obj-the current selected HTML object
@Description - This function implements the on Enter function of remote or mouse click.
Returns  -void
*/

function selectedButton() {
    if (rowID == 1) {
        switch (cntIndex) {
            case 0: //stops the playing video
                stopMedia();
                break;
            case 1: //plays the video
                playMedia();
                break;
            case 2: //rewinds the video
                rewindMedia();
                break;
            case 3: //forwards the video
                forwardMedia();
                break;
            case 4: //opens window for settings
                optionMedia();
                break;

        }
    } else if (rowID == 3) {
        switch (cntIndex) {
            case 0: //back
            case 1: //exit same for the moment
                if (window.NetCastBack) { window.NetCastBack(); }
                break;
        }
    }
}
/*
Function getVideo()
@param- none
@Description- gets the object of video
Returns- video object
*/
function getVideo() {
    return document.getElementById('video');
}
/*
Function resetProgress()
@param- none
@Description- resets all the functionalities, when video is stopped or video is ended
Returns- none
*/
function resetProgress() {
    clearTimeout(hideTimerId);
    showPlayer();
    $("#progressBarStatus").css("width", '0px');
    $('#progressBall').attr('class', 'progressBallInitial');
    if (dragged) {
        $('.progressBallInitial').draggable("disable");
    }
    dragged = false;
    $('#progressBall').css("left", '0px');
    $("#progressBuffer").css("width", '0px');
    $("#play > img").remove();
    $('#play').append('<img src="images/player_btn_icon/movie_btn_icon_play_n.png" class="center" />');
    $("#remainingTime").text("");
    $("#totalTime").text("");
    $(".runningMovieName").text("");
    $(".runningMovieType").text("");
    resetFocus();
    cntIndex = 1;
    rowID = 1;
    mouseDown = false;
    $(allMenuObject[1]).toggleClass(defaultClass[1] + "Hover");
}
/*
Function getTimeFromMS()
@param- none
@Description- to convert the millisecond in hr:min:sec formatted way
Returns- none
*/
function getTimeFromMS(sec) {
    var time = Math.round(sec);
    var hours = Math.floor(time / 3600);
    var mins = Math.floor((time % 3600) / 60);
    var secs = Math.floor((time % 3600) % 60);

    if (hours < 10)
        hours = "0" + hours;
    if (mins < 10)
        mins = "0" + mins;
    if (secs < 10)
        secs = "0" + secs;

    return hours + ":" + mins + ":" + secs;

}
/*
Function setPosition()
@param - position
@Description - to show the running video progress, it keeps track of
progress status bar & progress ball as video runs.
Returns  -void
*/
function setPosition(position) {
    $("#progressBarStatus").addClass("progress progressBarStatus");
    $("#progressBarStatus").css("width", position + 'px');
    if (rowID == 2) {
        $('#progressBall').css("left", position - 14 + 'px')
    } else {

        $('#progressBall').css("left", position + 'px')
    }
}
/*
Function getVideoPlayInfo()
@param- none
@Description- to get the playing video information
Returns- none
*/

function getVideoPlayInfo() {
    if (video.currentTime > 0) {
        $("#remainingTime").text(getTimeFromMS(video.currentTime));
        $("#totalTime").text(" / " + getTimeFromMS(video.duration));
        var pos = Math.ceil((video.currentTime / video.duration) * progressBarWidth);
        setPosition(pos);
    }
}
/*
Function getVideoSourceInfo()
@param- none
@Description- to get the playing video's source information
Returns- none
*/
function getVideoSourceInfo() {
    var videoSourceInfo = video.src;
    $(".runningMovieName").text(videoSourceInfo.title);
}
/*
Function loadDataSrc()
@param- autoplay, to strt the video without clicking play button
@Description- sets the source to video object
Returns- none
*/
function loadDataSrc(auto) {
    var vidPath = videoArray[vidIndex];
    if (checkFileExtensions(vidPath)) {
        isSupp = video.canPlayType(currentType);
        video.src = vidPath;
        video.type = "video/" + currentType;
        video.autoplay = auto;
    } else {
        console.log("video not supported");
    }
}
/*
Function stopMedia()
@param- none
@Description- stops the running video
Returns- none
*/
function stopMedia() {
    stopped = true;
    video.currentTime = video.duration;
}
/*
Function playMedia()
@param- none
@Description- plays & pauses the video
Returns- none
*/
function playMedia() {
    stopped = false;
    if (video.readyState == 0) {
        loadDataSrc(true);
        video.play();
    }
    if (video.readyState == 4) {
        if (video.paused) {
            //play
            video.play();
        } else {
            //pause
            video.pause();
        }
    }
    $('#progressBall').attr('class', 'progressBall');
}
/*
Function forwardMedia()
@param- none
@Description- forwards the running video by 10sec.
Returns- none
*/
function forwardMedia() {
    if (video.currentTime < video.duration) {
        video.currentTime += 10;
    }
    if (video.paused) {
        // play
        playMedia();
    }
}
/*
Function rewindMedia()
@param- none
@Description- rewinds the running video by 10sec.
Returns- none
*/
function rewindMedia() {
    if (video.currentTime > 0) {
        video.currentTime -= 10;
    }
    if (video.paused) {
        // play
        playMedia();
    }
}

/*
Function optionMedia()
@param- none
@Description- opens window for settings
Returns- none
*/
function optionMedia() {
    if (window.NetCastLaunchQMENU) {
        window.NetCastLaunchQMENU();
    }
}
/*
Function checkFileExtensions()
@param- url the videotype
@Description- checks for the supported formats
Returns- none
*/
function checkFileExtensions(url) {
    for (var i = 0; i < supportedMimeTypes.length; i++) {
        if (url.lastIndexOf(supportedMimeTypes[i]) > 0) {
            currentType = url.slice(url.indexOf(".") + 1, url.length);
            return true;
        }
    }
    return false;
};
