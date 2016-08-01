var player;
var source;
var currentTime;
var duration;
var plugin;
var showtimeData = {
    'content_id': '33950',
    'content_name': '機動戦士ガンダムUC episode 3 ラプラスの亡霊',
    'device_id': '19',
    'player_type': 'bravia',
    'hash': 'NSROB90YK1',
    'resolution': '1'
};
var youboraData = {
    'accountCode': 'rakutenshowtimedev',
    'username': 'guest',
    'transaction': '833ca7404071cc89'
};

function initTest() {
    var options = {
        accountCode: youboraData.accountCode,
        username: youboraData.username,
        transaction: youboraData.transaction,

        properties: {
            contentId: showtimeData.content_id,
            hash: showtimeData.hash,
            attribute: "通常",
            resolution: "HD",
        },
        media: {
            title: showtimeData.content_id + "-" + showtimeData.content_name,
            isLive: false,
        },
        extraParams: {
            param1: showtimeData.player_type,
            param2: showtimeData.device_id,
        }
    };
    plugin = new $YB.plugins.BraviaRakuten('videoPlayer', options);

    /// PlayerCode
    currentTime = document.getElementById("currentTime");
    duration = document.getElementById("duration");
    player = document.getElementById("videoPlayer");
    document.getElementById("b").focus();
    source = document.getElementById("source");

    source.addEventListener("error", function(e) {
        plugin.errorHandler('SOURCE_ERROR');
    });

    player.addEventListener("canplay", function(e) {
        duration.innerText = convertHhmmss(player.duration);
    });

    player.addEventListener("timeupdate", function(e) {
        if (Math.floor(player.currentTime) <= Math.floor(player.duration)) {
            currentTime.innerText = convertHhmmss(Math.floor(player.currentTime));
        }
    });

    player.load();
    player.play();
}

function skip(time) {
    player.pause();
    player.currentTime = player.currentTime + time;
    player.play();
}

function playpause() {
    if (player.paused) {
        player.play();
    } else {
        player.pause();
    }
}

function logClear() {
    document.getElementById("t").value = "";
}

function convertHhmmss(time) {
    var ss = Math.floor(time % 60);
    var mm = Math.floor(time / 60 % 60);
    var hh = Math.floor(time / 3600);
    hh = ((hh > 0) ? "0" + hh : "00") + ":";
    mm = ((mm < 10) ? "0" + mm : mm) + ":";
    ss = (ss < 10) ? "0" + ss : ss;
    if (hh == "00:") {
        return mm + ss;
    }
    return hh + mm + ss;
};
