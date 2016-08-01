var first = true;
var player;
var source;
var currentTime;
var duration;
var plugin;
var licenseRequestId;
var showtimeData = {
    'content_id': '33950',
    'content_name': '機動戦士ガンダムUC episode 3 ラプラスの亡霊',
    'device_id': '18',
    'device_name': 'VIERA',
    'player_type': 'viera',
    'hash': 'NSROB90YK1',
    'resolution': '1'
};
var youboraData = {
    'accountCode': 'rakutenshowtimedev',
    'username': 'guest',
    'transactionCode': '833ca7404071cc89'
};

function initTest() {
    var options = {
        accountCode: youboraData.accountCode,
        username: youboraData.username,
        transactionCode: youboraData.transactionCode,

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
            param2: showtimeData.device_name,
        }
    };
    plugin = new $YB.plugins.VieraRakuten('videoPlayer', options);

    /// PlayerCode
    currentTime = document.getElementById("currentTime");
    duration = document.getElementById("duration");
    player = document.getElementById("videoPlayer");
    document.getElementById("b").focus();
    source = document.getElementById("source");

    source.addEventListener("error", function(e) {
        plugin.errorHandler('vie_001', 'SOURCE_ERROR');
    });

    player.addEventListener("canplay", function(e) {
        duration.innerText = convertHhmmss(player.duration);
    });

    player.addEventListener("timeupdate", function(e) {
        if (Math.floor(player.currentTime) <= Math.floor(player.duration)) {
            currentTime.innerText = convertHhmmss(Math.floor(player.currentTime));
        }
    });

//    player.load();
//    sendDRMMessage();
}

function skip(time) {
    player.pause();
    player.currentTime = player.currentTime + time;
    player.play();
}

function playpause() {
	if (first)
	{
		first = false;
		player.load();
		sendDRMMessage();
		return;
	}
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

function sendDRMMessage()
{
	PanasonicDevice.drmAgent.onDRMMessageResult = HandleDRMMessageResult;
	var xml = getLicenceAcquisitionXML();
	licenseRequestId = PanasonicDevice.drmAgent.sendDRMMessage
	(
		"application/vnd.ms-playready.initiator+xml", // msgType
		xml,                                          // msg (xmlLicenceAcquisition)
		"urn:dvb:casystemid:19219"                    // DRMSystemID
	);
}

// ライセンスレスポンス解析
function HandleDRMMessageResult(msgID, resultMsg, resultCode)
{
	var errorCode = "";
	if (msgID !== licenseRequestId)
	{
		return;
	}

	switch (resultCode)
	{
		case 0:  // Success
			player.play();
			return;
			break;
		case 1:  // An unspecified error occurred
			errorCode = "vie_011";
			plugin.errorHandler(errorCode, "");
			break;
		case 2:  // The DRM agent was unable to complete the request
			errorCode = "vie_012";
			plugin.errorHandler(errorCode, "");
			break;
		case 3:  // The specified Mime Type is unknown for the specified DRM system indicated in the DRMSystemId
			errorCode = "vie_013";
			plugin.errorHandler(errorCode, "");
			break;
		case 4:  // User consent is needed for that action (このエラーが発生するケースが想定できない)
			errorCode = "vie_014";
			plugin.errorHandler(errorCode, "");
			break;
		case 5:  // The specified DRM System in DRMSystemId is unknown
			errorCode = "vie_015";
			plugin.errorHandler(errorCode, "");
			break;
		case 6:  // The message in msg has the wrong format
			errorCode = "vie_016";
			plugin.errorHandler(errorCode, "");
			break;
		default: // Invalid license response
			errorCode = "vie_017";
			plugin.errorHandler(errorCode, "DRM_ERROR");
			break;
	}
}

// ライセンスリクエスト設定
function getLicenceAcquisitionXML()
{
	var xml = "";
	xml += "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
	xml += "<PlayReadyInitiator>";
	xml += "<LicenseServerUriOverride>";
	xml += "<LA_URL>";
	xml += "http://qa.license.video.rakuten.co.jp/Silverlight/rightsmanager.asmx";
	xml += "</LA_URL>";
	xml += "</LicenseServerUriOverride>";
	xml += "<SetCustomData>";
	xml += "<CustomData>";
	xml += "Resolution=";
	xml += "0";
	xml += "</CustomData>";
	xml += "</SetCustomData>";
	xml += "</PlayReadyInitiator>";
	return xml;
};
