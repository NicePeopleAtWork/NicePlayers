<?php $lib = $_GET["lib"] ? $_GET["lib"] : "last-build" ?>
<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="content-type" content="text/html; charset=">
    <title>Event Tester</title>
    <!-- youbora -->
    <script src="/src/v5/libs/<?php echo $lib ?>/youboralib.js" youbora-debug="4"></script>
    <script src="/src/v5/libs/debug-util.js"></script>
    <style>
    	th { background-color: black; color: white; }
    </style>
</head>

<body>
	<form>
		Lib Ver <input value="<?php echo $lib ?>" name="lib" /> <input type="submit" value="send"/>
	</form>

    <script>
	    setInterval(function() {
	        document.getElementById('startSent').innerHTML = youbora.viewManager.isStartSent;
	        document.getElementById('joinSent').innerHTML = youbora.viewManager.isJoinSent;
	        document.getElementById('paused').innerHTML = youbora.viewManager.isPaused;
	        document.getElementById('seeking').innerHTML = youbora.viewManager.isSeeking;
	        document.getElementById('buffering').innerHTML = youbora.viewManager.isBuffering;
	        document.getElementById('ads').innerHTML = youbora.viewManager.isShowingAds;

	        document.getElementById('joinChrono').innerHTML = youbora.viewManager.chrono.joinTime.getDeltaTime(false) + "ms";
	        document.getElementById('pauseChrono').innerHTML = youbora.viewManager.chrono.pause.getDeltaTime(false) + "ms";
	        document.getElementById('seekChrono').innerHTML = youbora.viewManager.chrono.seek.getDeltaTime(false) + "ms";
	        document.getElementById('bufferChrono').innerHTML = youbora.viewManager.chrono.buffer.getDeltaTime(false) + "ms";
	        document.getElementById('adsChrono').innerHTML = youbora.viewManager.chrono.adIgnore.getDeltaTime(false) + "ms";

	        document.getElementById('pingIsRunning').innerHTML = youbora.viewManager.timer.pinger.isRunning;
	        document.getElementById('pingTime').innerHTML = youbora.viewManager.timer.pinger.interval + "ms";

	    }, 100);

	    var youbora = new $YB.plugins.Generic();
	    youbora.startMonitoring(null, {media:{title:"title"}});

	    $YB.comm.AjaxRequest.onEverySuccess=function() {
	    	var obj = JSON.parse(this.response);
	    	dumpArray(obj["errors"], "Error", obj["event"]);
            dumpArray(obj["warnings"], "Warning", obj["event"]);
            //dumpArray(obj["notices"], "Notice", obj["event"]);
	    }

	    function dumpArray(arr, type, service) {
         	var div = document.getElementById('responses');
            for(k in arr) {
                div.innerHTML += type + " (" + service + "): " + arr[k] + "<br/>";
            }
        }

    </script>

    <div style="margin: 10px auto; width: 600px; clear: both;">
	    <div style="float: right;">
	    <table style="width: 300px; margin: 10px">
	        <tbody>
	            <tr>
	                <th>Flag</th>
	                <th>Status</th>
	                <th>Time</th>
	            </tr>
	            <tr>
	                <td><strong>isStartSent</strong></td>
	                <td id="startSent">?</td>
	                <td>-</td>
	            </tr>
	            <tr>
	                <td><b>isJoinSent</b></td>
	                <td id="joinSent">?</td>
	                <td id="joinChrono">-</td>
	            </tr>
	            <tr>
	                <td><strong>isPaused</strong></td>
	                <td id="paused">?</td>
	                <td id="pauseChrono">-</td>
	            </tr>
	            <tr>
	                <td><b>isSeeking</b></td>
	                <td id="seeking">?</td>
	                <td id="seekChrono">-</td>
	            </tr>
	            <tr>
	                <td><strong>isBuffering</strong></td>
	                <td id="buffering">?</td>
	                <td id="bufferChrono">-</td>
	            </tr>
	            <tr>
	                <td><strong>isShowingAds</strong></td>
	                <td id="ads">?</td>
	                <td id="adsChrono">-</td>
	            </tr>
	            <tr>
	                <td><strong>pingIsRunning</strong></td>
	                <td id="pingIsRunning">?</td>
	                <td id="pingTime">-</td>
	            </tr>
	        </tbody>
	    </table>
	    </div>

	    <div style="text-align: center; margin: 15px auto 0;">
	        <h4>Fire Event</h4>
	        <button onclick="youbora.playHandler();">Start</button>
	        <button onclick="youbora.joinHandler();">Join</button>
	        <br/>
	        <button onclick="youbora.pauseHandler();">Pause</button>
	        <button onclick="youbora.resumeHandler();">Resume</button>
	        <br/>
	        <button onclick="youbora.seekingHandler();">Seek Start</button>
	        <button onclick="youbora.seekedHandler();">Seek End</button>
	        <br/>
	        <button onclick="youbora.bufferingHandler();">Buffer Start</button>
	        <button onclick="youbora.bufferedHandler();">Buffer End</button>
	        <br/>
	        <button onclick="youbora.ignoringAdHandler();">Ad Start</button>
	        <button onclick="youbora.ignoredAdHandler();">Ad End</button>
	        <br/>
	        <button onclick="youbora.errorHandler(3001, 'PLAY_FAILURE');">Error</button>
	        <button onclick="youbora.endedHandler();">Stop</button>
	    </div>
    </div>

    <div style="clear: both; overflow: scroll; margin-top: 100px;" id="responses"></div>

</body>
</html>