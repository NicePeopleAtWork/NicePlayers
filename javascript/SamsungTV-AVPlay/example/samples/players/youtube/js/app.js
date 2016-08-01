// App helpers
var player;
var playerId = 'player';
var playerCodes = {
    vod_noAd: 'M7lc1UVf-VE',
    live_noAd: 'VBEmqvVPOX4',
    vod_Ad: '6ttobrfMnyQ'
};

var options = {
    // Account code and enable YOUBORA Analytics
    accountCode: "qamini",
    enableAnalytics: true,
    //View parameters
    username: "userTest",
    transactionCode: "transactionTest",
    // Media info
    //media: {
    //title: "titleTest",
    //duration: 3600,
    //isLive: false,
    //resource: "http://yourhost.com/yourmedia.m3u8"
    //cdn: "AKAMAI",
    //},
    // Media and device extra info
    properties: {
        filename: "test.m3u8",
        content_id: "contentTest",
        content_metadata: {
            genre: "genreTest",
            language: "languageTest",
            year: "yearTest",
            cast: "castTest",
            director: "directorTest",
            owner: "ownerTest",
            parental: "parentalTest",
            price: "priceTest",
            rating: "ratingTest",
            audioType: "typeTest",
            audioChannels: "channelTest"
        },
        transaction_type: "transactionTest",
        quality: "qualityTest",
        content_type: "contentTest",
        device: {
            manufacturer: "manufacturerTest",
            type: "typeTest",
            year: "yearTest",
            firmware: "firmwareTest"
        }
    },
    // Optional features
    //parseHLS: false,
    //parseCDNNodeHost: false,
    httpSecure: false,
    //network: {
    //ip: "1.1.1.1",
    //isp: "ISPTest"
    //}
};

function loadPlayer(videoId, playerId) {
    player = new YT.Player(playerId, {
        height: '390',
        width: '640',
        videoId: videoId,
        events: {
            'onReady': onPlayerReady,
        }
    });

    // Plugin declaration
    if (typeof $YB !== undefined) {
        youbora = new $YB.plugins.Youtube(player, options);
    }
}

// YOUTUBE Player setup
var YTtag = document.createElement('script');
YTtag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(YTtag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    loadPlayer(playerCodes.vod_noAd, playerId);
}

function onPlayerReady(event) {
    event.target.playVideo();
    player.mute();
}

// Page setup
var li = document.getElementById('navbar').getElementsByTagName('li');
for (var i = 0; i < li.length; i++) {
    li[i].addEventListener('click', function(event) {
        //Remove the active class from the active element and add it to the clicked one
        document.getElementsByClassName('active')[0].className = "";
        event.target.parentNode.className = "active";

        // Remove the player iframe and set a new player for the plugin to be attached correctly
        removePlayer(playerId);
        loadPlayer(playerCodes[event.target.parentNode.id], playerId);
    });
}

function removePlayer(playerId) {
    var iframe = document.getElementById(playerId);
    var container = iframe.parentNode;

    container.removeChild(iframe);
    container.innerHTML = '<div id="' + playerId + '"></div>';

    // Send a stop in order to see the view correctly closed
    youbora.endedHandler();
}
