// add the stylesheet ASAP
document.write("<link type='text/css' rel='stylesheet' href='" + $pdk.scriptRoot+ "/accessibility/css/player.css'/>");	

// create our accessible functionality at the right moment
$pdk.Entrypoint.getInstance().addCallback(function() {
	new accessiblePlayer();
})

//// accessiblePlayer class
function accessiblePlayer() {

	// ELEMENTS
	var ap = this;

	// load the stylesheet

	ap.control = document.getElementsByClassName("tpAccessibleControls")[0];
	ap.windowContainer = document.getElementsByClassName("tpAccessibleForms")[0];
	// ap.fs = document.getElementById("fs");

	// BOOLEANS
	ap.isPause = false;
	ap.isMute = false;
	ap.isStopped = true;
	ap.captionOn = true;
	ap.isIE7 = false;

	// STRINGS
	ap.releaseUrl = "";
	ap.description = "";
	ap.windowToClose = "";
	ap.title = "";

	// ARRAYS
	ap.buttons = new Array();

	// NUMBERS
	// total duration in seconds
	ap.totalDuration = 0;
	// currentDuration in seconds
	ap.currentDuration = 0;
	// next/previous increment in seconds
	ap.nextPrevIncrement = 0;
	// default volume is set to 50
	ap.currentVolume = 50;
	// video progress bar increment
	ap.progressIncrement = 0;
	// actual volume increment
	ap.volIncrement = 10;
	// width of the increment
	ap.volIncrementWidth = 0;
	
	ap.embeds = 
		[{ "title": "embed",
		  "description":"Flash Embed Code",
		  "src":"We are sorry.  Accessibility limitations in Flash technology prevent us from offering the option to share this video via an &lt;EMBED&gt; tag."
		}];

	var players = document.getElementsByClassName("tpPlayer");
	if (players && players.length)
	{
		for (var i=0; i<players.length; i++)
		{
			if (!ap.emailService && players[i].getAttribute("tp:emailServiceURL"))
			{
				ap.emailService = players[i].getAttribute("tp:emailServiceUrl");
			}
			if (players[i].getAttribute("tp:embeddedPlayerHTML") && players[i].getAttribute("tp:embeddedPlayerHTML").indexOf("iframe"))
			{
				ap.embeds.unshift({"title": "iframe", "description": "HTML IFrame", "src": players[i].getAttribute("tp:embeddedPlayerHTML")})
			}
			
			players[i].setAttribute("tp:layout", "<controls><region id=\"tpBottomRegion\"/></controls>");
			players[i].setAttribute("tp:showSubtitles", "false");
			players[i].setAttribute("tp:skinUrl", $pdk.scriptRoot + "/skins/cinematic/cinematic.json");
		}
	}
	
	var controls = document.getElementsByClassName("tpAccessibleControls");
	if (controls)
	{
		for (var i=0; i<controls.length; i++)
		{
			controls[i].innerHTML = "<div id = \"top\">\n    <div id = \"counter\"><span class=\"hide\">Elapsed Time: </span></div>\n    <div id = \"progressBar\" >\n	<div id = \"progress\"><span class=\"hide\">Playback 0% complete</span></div>\n    </div>\n    <div id =\"duration\"><span class=\"hide\">Total Time: </span></div>\n    \n    <div class=\"clear\"></div>\n    <button type = \"button\" tabindex = \"1\" 	class = \"play\" 		id=\"playBtn\" 		value = \"Play Video\"		title = \"Play Video\"><span>Play Video</span></button>\n    <button type = \"button\" tabindex = \"2\" 	class = \"prev\" 		id=\"prevBtn\" 		value = \"Skip Back\"		title = \"Skip Back\"><span>Skip Back</span></button>\n    <button type = \"button\" tabindex = \"3\" 	class = \"next\" 		id=\"nextBtn\" 		value = \"Skip Forward\"		title = \"Skip Forward\"><span>Skip Forward</span></button>\n    <button type = \"button\" tabindex = \"4\" 	class = \"muteOn\" 	id=\"muteBtn\" 		value = \"Turn Mute On\"		title = \"Turn Mute On\"><span>Turn Mute On</span></button>\n    <button type = \"button\" tabindex = \"5\" 	class = \"minVolume\"	id=\"minVolBtn\" 		value = \"Decrease Volume\"	title = \"Decrease Volume\"><span>Decrease Volume</span></button>\n    <div id=\"volumeContainer\">\n	<div id = \"volumeBg\"><div id = \"redBar\"></div></div>\n	<div id = \"volumeText\"></div>\n    </div>\n    <button type = \"button\" tabindex = \"6\" 	class = \"maxVolume\"	 id=\"maxVolBtn\" 	value = \"Increase Volume\"	><span>Increase Volume</span></button>\n    <div class=\"clear\"></div>\n</div>\n<div id = \"bottom\">\n    <button type = \"button\" tabindex = \"7\" 	class = \"share\" 	id=\"shareBtn\" 		value = \"Share\"		disabled = \"disabled\" title = \"Share (opens dialog window)\"><span>Share</span></button>\n    <button type = \"button\" tabindex = \"8\" 	class = \"embed\" 	id=\"embedBtn\" 		value = \"Embed\"		disabled = \"disabled\" title = \"Embed (opens dialog window)\"><span>Embed</span></button>\n    <button type = \"button\" tabindex = \"10\" class = \"info\" 		id=\"infoBtn\" 		value = \"Information\"	disabled = \"disabled\" title = \"Information (opens dialog window)\"><span>Information</span></button>\n    <button type = \"button\" tabindex = \"11\" class = \"captionOff\" 	id=\"captionBtn\"		value = \"Turn Caption Off\"		    title = \"Turn Caption On\"><span>Turn Caption On</span></button>\n    <!--<button type = \"button\" tabindex = \"12\" class = \"fullScreen\" 	id=\"fs\"  			value = \"Full Screen\"		><span>Full Screen</span></button>-->\n    <div class=\"clear\"></div>\n</div>";
		}
	}

	var captions = document.getElementsByClassName("tpClosedCaptions");
	if (captions && captions.length)
	{
		for (var i=0; i<captions.length; i++)
		{
			captions[i].innerHTML = "<div><p></p></div>";
		}
		ap.captionArea = captions[0].getElementsByTagName("div")[0].getElementsByTagName("p")[0];
	}
	else
	{
		ap.captionArea = {style: {}};
	}

	ap.progress = document.getElementById("progress");
	ap.durationText = document.getElementById("duration");
	ap.counterText = document.getElementById("counter");
	ap.play = document.getElementById("playBtn");
	ap.next = document.getElementById("nextBtn");
	ap.prev = document.getElementById("prevBtn");
	ap.mute = document.getElementById("muteBtn");
	ap.volumeContainer = document.getElementById("volumeBg");
	ap.minVol = document.getElementById("minVolBtn");
	ap.maxVol = document.getElementById("maxVolBtn");
	ap.redVol = document.getElementById("redBar");
	ap.volumeText = document.getElementById("volumeText");
	ap.share = document.getElementById("shareBtn");
	ap.embed = document.getElementById("embedBtn");
//	ap.more = document.getElementById("moreBtn");
	ap.info = document.getElementById("infoBtn");
	ap.caption = document.getElementById("captionBtn");
	ap.playSpan = ap.play.getElementsByTagName("SPAN")[0];
	ap.muteSpan = ap.mute.getElementsByTagName("SPAN")[0];
	ap.captionSpan = ap.caption.getElementsByTagName("SPAN")[0];
	
	$pdk.initialize();

	ap.init = function() {

		// determine if this is IE7
		if (navigator.appVersion.indexOf('MSIE 7.') != -1) {
			ap.isIE7 = true;
		}

		// clear any previous captions from the caption area
		ap.captionArea.value = "";

		// assess if an emailservice url is provided
		ap.toggleShareButton();

		// instantiate the flv player
		ap.initplayer();
	}

	ap.configureURLs = function(pid) {

		ap.emailService = ap.emailService.replace("{releasePid}", pid);

		// now configure the embed codes
		for ( var i = 0; i < ap.embeds.length; i++) {
			var str = ap.embeds[i]["src"];
			str = str.replace("{releasePid}", pid);
			ap.embeds[i]["src"] = str;
		}
	}

	ap.getClipInfo = function(response) {

		ap.totalDuration = response.data.length;

		var tempDuration = response.data.length;
		tempDuration = ap.convertMS(tempDuration);

		ap.durationText.innerHTML = "<span class='hide'>Total Time: </span>"
				+ tempDuration;

		ap.calculateNextandPrev();

		$pdk.controller.removeEventListener("OnMediaStart", ap.getClipInfo);
	}

	ap.getSubtitlePref = function(response) {

		var langCode = response.data.langCode;

		if (langCode != undefined && langCode != "none") {
			ap.captionOn = true;
			ap.caption.className = "captionOff";
			ap.changeButtonText("caption off");
		}

		ap.displaySubtitleField();

		$pdk.controller.removeEventListener("OnGetSubtitleLanguage",
				ap.getSubtitlePref);
	}

	ap.displaySubtitleField = function() {

		if (ap.captionOn) {
			ap.captionArea.style.display = "block";
			ap.captionArea.focus();
		} else {
			ap.captionArea.style.display = "none";
		}
	}

	ap.displaySubtitles = function(cuepoint) {

		var div = document.createElement("DIV");
		div.innerHTML = cuepoint.data.content;

		var caption = "";

		if (document.body.innerText) {
			caption = div.innerText;
		} else {
			caption = div.textContent;
		}

		ap.captionArea.innerHTML = caption;
	}

	ap.calculateNextandPrev = function() {

		// divide up the total duration by 10 to calculate the forward/rewind
		// increment
		ap.nextPrevIncrement = Math.floor(ap.totalDuration / 10);

		// calculate the progress bar pixel per second
		ap.fullProgressWidth = document.getElementById("progressBar").offsetWidth - 2;
		ap.progressIncrement = ap.fullProgressWidth / ap.totalDuration;
	}

	ap.getEmailURL = function(response) {

		ap.emailService = response.data["emailServiceURL"];
		ap.toggleShareButton();
	}

	ap.toggleShareButton = function() {

		// if email service is not defined or player url is not defined then
		// take away the share button and reorder the
		// tab index
		if (ap.emailService == "" || ap.emailService == "undefined"
				|| ap.emailService == null) {

			var shareBtn = document.getElementById("shareBtn");
			shareBtn.parentNode.removeChild(shareBtn);
		}

		ap.addButtonsToArray();
	}

	ap.addButtonsToArray = function() {
		var buttonsArray = ap.control.getElementsByTagName("Button");
		ap.buttons = new Array();

		// put buttons from the control rack in to an array - exclude close and
		// send buttons
		for ( var i = 0; i < buttonsArray.length; i++) {
			ap.buttons.push(buttonsArray[i]);
		}

		ap.reorderTabIndex();
	}

	ap.seekToMedia = function(time) {

		if (time > ap.totalDuration) {
			$pdk.controller.seekToPercentage(100);
		} else if (time <= 0) {
			$pdk.controller.seekToPercentage(0);
			ap.currentDuration = 0;
		} else {
			$pdk.controller.seekToPosition(time);
		}
	}

	ap.getPIDFromUrl = function(url)
	{
		if (!url)
			return null;
		var matches = url.match(/[\?\&]pid\=[^\&]+/i);
		if (matches && matches.length > 0)
		{
			return (matches[0]).substr(5);
		}
		//to get the pid out of the rest url, we need to get the third element
		//Alan R assures that this will always and ever be the spot for the pid, so if this
		//ever changes, find him and taunt him
		var regex = /.*?\/?[^\/]+\/[^\/]+\/[^\/]+\/([a-zA-Z0-9_]+)/;
		matches = url.match(regex);
		if (matches && matches.length > 1) {
			return matches[1];
		}
		else {
			return null;
		}
	}

	ap.onLoadRelease = function(response) {

		ap.title = response.data.title;
		ap.description = response.data.description;

		// enable the share, embed and info buttons
		if (ap.share) {
			ap.share.disabled = false;
		}

		ap.embed.disabled = false;
		ap.info.disabled = false;

		ap.control.style.display = "block";
		
		ap.releaseUrl = response.data.url;

		// configure the embed code and player url
		ap.configureURLs(ap.getPIDFromUrl(ap.releaseUrl));  //getPIDFromUrl

		// calculate the width of each volume increment - minus two for the
		// border
		ap.volIncrementWidth = (ap.volumeContainer.offsetWidth - 2) / 10;
	}

	ap.onReleaseStart = function() {
		$pdk.controller.addEventListener("OnMediaPlaying", ap.onMediaPlaying);
		$pdk.controller.addEventListener("OnReleaseEnd", ap.onReleaseEnd);
		$pdk.controller.removeEventListener("OnReleaseStart", ap.onReleaseStart);

		ap.progress.style.display = "block";

		ap.isPause = true;
		ap.isStopped = false;
		ap.toggleButton('play');
	}

	ap.onMediaPlaying = function(evt) {

		var time = ap.convertMS(evt.data["currentTime"]);
		ap.counterText.innerHTML = "<span class='hide'>Elapsed Time: </span>"
				+ time;
		ap.currentDuration = Math.round(evt.data["currentTime"]);

		ap.progress.innerHTML = "<span class='hide'>Playback "
				+ Math.round(evt.data["percentComplete"]) + "% complete";

		// calculate what the current time corresponds to in width of the
		// progress bar
		var length = ap.progressIncrement * ap.currentDuration;

		if (length >= ap.fullProgressWidth) {
			ap.progress.style.width = ap.fullProgressWidth;
		} else {
			ap.progress.style.width = length + "px";
		}
	}

	ap.onReleaseEnd = function() {

		ap.counterText.innerHTML = "00:00";
		ap.currentDuration = 0;

		// change the pause button to play
		ap.toggleButton('stop');
		ap.isStopped = true;

		ap.progress.style.display = "none";

		$pdk.controller.removeEventListener("OnReleaseEnd", ap.onReleaseEnd);
		$pdk.controller.removeEventListener("OnMediaPlaying", ap.onMediaPlaying);
	}

	ap.initFunctions = function(btn) {

		btn.onfocus = function() {
			ap.highlight(btn.name);
		}

		btn.onblur = function() {
			ap.unhighlight(btn.name);
		}

		btn.onclick = function() {
			ap.toggleButton(btn.name);
		}
	}

	ap.initControls = function() {

		ap.volumeText.innerHTML = "50%";
		ap.counterText.innerHTML = "<span class='hide'>Elapsed Time: </span> 00:00";

		// set volume to 50%
		$pdk.controller.setVolume(ap.currentVolume);

		// play button
		ap.play.name = 'play';
		ap.initFunctions(ap.play);

		// previous button
		ap.prev.name = 'previous';
		ap.initFunctions(ap.prev);

		// next button
		ap.next.name = 'next';
		ap.initFunctions(ap.next);

		// mute button
		ap.mute.name = 'mute';
		ap.initFunctions(ap.mute);

		// minimise volume button
		ap.minVol.name = 'minVol';
		ap.initFunctions(ap.minVol);

		// maximise volume button
		ap.maxVol.name = 'maxVol';
		ap.initFunctions(ap.maxVol);

		// share button
		ap.share.name = 'share';
		ap.initFunctions(ap.share);

		// embed button
		ap.embed.name = 'embed';
		ap.initFunctions(ap.embed);

		// more button
//		ap.more.name = 'more';
//		ap.initFunctions(ap.more);

		// info button
		ap.info.name = 'info';
		ap.initFunctions(ap.info);

		// caption button
		ap.caption.name = 'caption';
		ap.initFunctions(ap.caption);

		// fullscreen button
		// ap.fs.name = "fs";
		// ap.initFunctions(ap.fs);
	}

	ap.toggleButton = function(mode) {

		var newTime = 0;

		switch (mode) {

		case "stop":
			ap.play.className = "play";
			// ap.changeButtonText("play");
			break;

		case "play":

			if (ap.isPause) {

				$pdk.controller.pause(false);
				ap.isPause = false;

				// switch to pause button
				ap.play.className = "pauseHighlight";

				// change the span text of the button and the value
				ap.changeButtonText("pause");

				ap.play.focus();
			} else {

				if (ap.isStopped) {

					// ap.isStopped = false;
					// ap.play.className = "pauseHighlight";

					// change the span text of the button and the value
					// ap.changeButtonText("pause");

					// ap.play.focus();

					$pdk.controller.clickPlayButton();

				} else {
					$pdk.controller.pause(true);
					ap.isPause = true;
					// switch to play button
					ap.play.className = "playHighlight";

					// change the span text of the button and the value
					ap.changeButtonText("play");

					ap.play.focus();
				}
			}

			break;

		case "previous":

			newTime = (ap.currentDuration - ap.nextPrevIncrement);
			ap.seekToMedia(newTime);

			break;

		case "next":

			newTime = (ap.currentDuration + ap.nextPrevIncrement);
			ap.seekToMedia(newTime);

			break;

		case "mute":

			// turning off mute
			if (ap.isMute) {

				if (ap.currentVolume <= 0) {
					ap.setVolume('max');
				} else {
					ap.redVol.style.display = "block";
					// set the volume text
					ap.volumeText.innerHTML = ap.currentVolume + "%";
				}

				ap.mute.value = "Mute On";
				// switch to mute off button
				$pdk.controller.mute(false);

				// switch the button
				ap.isMute = false;
				ap.mute.className = "muteOnHighlight";
				ap.changeButtonText("mute on");

			} else {
				ap.isMute = true;
				// switch to mute on button
				ap.mute.className = "muteOffHighlight";
				$pdk.controller.mute(true);

				// turn red volume bar off
				ap.redVol.style.display = "none";

				// set the volume text
				ap.volumeText.innerHTML = "0%";
				ap.changeButtonText("mute off");
			}

			break;

		case "minVol":
			ap.setVolume('min');
			break;

		case "maxVol":
			ap.setVolume('max');
			break;

		case "share":
			// create and display the share window
			ap.createShareWindow();
			break

		case "embed":
			// create and display the embed window
			ap.createEmbedWindow();
			break

		case "copy":

			break;

		case "more":
			// open up the feedroom home page
			break

		case "info":
			// create and display the info window
			ap.createInfoWindow();
			break

		case "close":
			// close any open windows
			ap.closeWindow(ap.windowToClose);
			break;

		case "caption":
			// if caption is on then turn it off
			if (ap.captionOn) {
				ap.captionOn = false;
				$pdk.controller.setSubtitleLanguage("none");
				ap.caption.className = "captionOnHighlight";
				ap.changeButtonText("caption on");
				ap.displaySubtitleField();
			} else {
				ap.captionOn = true;
				$pdk.controller.setSubtitleLanguage("en");
				ap.caption.className = "captionOffHighlight";
				ap.changeButtonText("caption off");
				ap.displaySubtitleField();
			}
			break;

		case "fs":
			break;

		case "submitShare":
			var toAddress = document.getElementById("to").value;
			var fromAddress = document.getElementById("from").value;
			var message = document.getElementById("message").value;

			$.ajax({
				type : "POST",
				url : ap.emailService,
				data : "?to=" + toAddress + "&from=" + fromAddress
						+ "&message=" + message,
				success : function(msg) {
					ap.closeWindow(ap.windowToClose);
				},
				error : function(xhr, text, err) {
					alert("Error:" + text);
				}
			});

			break;

		default:
			break;
		}
	}

	ap.changeButtonText = function(mode) {

		switch (mode) {

		case "play":
			if (ap.isIE7) {
				// if it's IE7 then this will change the inner text however the
				// value attribute of the markup does not change...
				ap.play.value = "<span>Play Video</span>";
			} else {
				ap.playSpan.innerHTML = "Play Video";
				ap.play.value = "Play Video";
			}

			ap.play.title = "Play Video"
			break;

		case "pause":
			if (ap.isIE7) {
				// if it's IE7 then this will change the inner text however the
				// value attribute of the markup does not change...
				ap.play.value = "<span>Pause Video</span>";
			} else {
				ap.playSpan.innerHTML = "Pause Video";
				ap.play.value = "Pause Video";
			}

			ap.play.title = "Pause Video";
			break;

		case "mute off":
			if (ap.isIE7) {
				// if it's IE7 then this will change the inner text however the
				// value attribute of the markup does not change...
				ap.mute.value = "<span>Turn Mute Off</span>";
			} else {
				ap.muteSpan = "Turn Mute Off";
				ap.mute.value = "Turn Mute Off";
			}

			ap.mute.title = "Turn Mute Off";
			break;

		case "mute on":
			if (ap.isIE7) {
				// if it's IE7 then this will change the inner text however the
				// value attribute of the markup does not change...
				ap.mute.value = "<span>Turn Mute On</span>";
			} else {
				ap.muteSpan.innerHTML = "Turn Mute On";
				ap.mute.value = "Turn Mute On";
			}

			ap.mute.title = "Turn Mute On";
			break;

		case "caption on":
			if (ap.isIE7) {
				// if it's IE7 then this will change the inner text however the
				// value attribute of the markup does not change...
				ap.caption.value = "<span>Turn Captions On</span>";
			} else {
				ap.captionSpan.innerHTML = "Turn Caption On";
				ap.caption.value = "Turn Captions On";
			}

			ap.caption.title = "Turn Caption On";
			break;

		case "caption off":
			if (ap.isIE7) {
				// if it's IE7 then this will change the inner text however the
				// value attribute of the markup does not change...
				ap.caption.value = "<span>Turn Captions Off</span>";
			} else {
				ap.captionSpan.innerHTML = "Turn Captions Off";
				ap.caption.value = " Turn Captions Off";
			}

			ap.caption.title = " Turn Captions Off";
			break;

		default:
			break;
		}
	}

	ap.createCloseBtn = function() {

		ap.closeBtn = document.createElement("Button");
		// ap.closeBtn.type = "Button";

		if (!ap.isIE7) {
			ap.closeBtn.value = "Close";
		}

		ap.closeBtn.className = "close";
		ap.closeBtn.name = 'close';
		ap.closeBtn.title = "Close (closes dialog window)";
		ap.initFunctions(ap.closeBtn);

		var span = document.createElement("SPAN");
		span.innerHTML = "Close Window";

		ap.closeBtn.appendChild(span);

		return ap.closeBtn;
	};

	ap.createHeading = function(msg) {

		var heading = document.createElement("H1");
		heading.innerHTML = msg;
		heading.className = "heading";
		heading.title = msg;

		return heading;
	}

	ap.createLabel = function(msg, forParam) {

		var label = document.createElement("LABEL");
		label.innerHTML = msg;
		label.htmlFor = forParam;
		label.className = "label";
		label.title = msg;

		return label;
	}

	ap.createDialog = function(msg) {
		var span = document.createElement("SPAN");
		span.className = "hide";
		span.innerHTML = msg;

		return span;
	}

	ap.createInput = function(type, id, title) {
		var text = document.createElement("INPUT");
		text.type = type;
		text.value = "";
		text.name = id;
		text.id = id;
		text.title = title;
		text.className = "textInput";

		return text;
	}

	ap.createInfoWindow = function() {

		ap.disableControls();

		ap.windowToClose = "infoWindow";

		var div = document.createElement("DIV");
		div.className = "blankWindow";
		div.id = "infoWindow";

		var heading = ap.createHeading("You Are Watching...");

		var descText = document.createElement("TEXTAREA");
		descText.innerHTML = ap.description;
		descText.className = "infoDesc";
		descText.readOnly = "readonly";
		descText.title = "Information on current video playing";

		var closeBtn = ap.createCloseBtn();
		closeBtn.id = "closeInfo";

		var closeBtnLabel = ap.createLabel("Close this Window", closeBtn.id);
		closeBtnLabel.className = "hide";

		var textInfoBegin = ap.createDialog("Begin Information Dialog");

		var textInfoEnd = ap.createDialog("End Information Dialog");

		div.appendChild(textInfoBegin);
		div.appendChild(heading);
		div.appendChild(descText);
		div.appendChild(textInfoEnd);
		div.appendChild(closeBtnLabel);
		div.appendChild(closeBtn);

		ap.appendDiv(div);

		descText.focus();

		var indexToInsert = 0;

		// put the heading, desctext and close button in to the array and
		// reorder the tab index
		for ( var i = 0; i < ap.buttons.length; i++) {

			if (ap.buttons[i].id.indexOf("info") != -1) {

				indexToInsert = i;
			}
		}

		ap.buttons.splice(indexToInsert + 2, 0, descText);
		ap.buttons.splice(indexToInsert + 3, 0, closeBtn);

		ap.reorderTabIndex();
	}

	ap.createShareWindow = function() {

		ap.disableControls();

		ap.windowToClose = "shareWindow";

		// parent container
		var div = document.createElement("DIV");
		div.className = "blankWindow";
		div.id = "shareWindow";

		// close button
		var closeBtn = ap.createCloseBtn();
		closeBtn.id = "closeShare";

		// send button
		ap.submitBtn = document.createElement("BUTTON");
		ap.submitBtn.id = "submitShare";
		ap.submitBtn.className = "submitShare";
		ap.submitBtn.name = "submitShare";
		ap.submitBtn.title = "Submit Email";
		// ap.submitBtn.type = "Button";
		if (!ap.isIE7) {
			ap.submitBtn.value = "Submit";
		}

		ap.initFunctions(ap.submitBtn);

		var span = document.createElement("SPAN");
		span.innerHTML = "Submit";

		ap.submitBtn.appendChild(span);

		// heading
		var heading = ap.createHeading("Send this Video to a Friend");

		// recipient's email field
		var text1 = ap.createInput("text", "to", "Friend's Email Address");

		// sender's email field
		var text2 = ap.createInput("text", "from", "Your Email Address");

		// optional message
		var text3 = ap.createInput("text", "message", "Optional Message");

		// hidden info
		var text5 = ap.createInput("hidden", "releaseTitle", ap.title);

		var text6 = ap.createInput("hidden", "releaseDescription",
				ap.description);

		// labels
		var recipientLabel = ap.createLabel(
				"Friend's e-mail (multiple e-mail addresses allowed):",
				text1.id);
		var emailLabel = ap.createLabel("Your e-mail:", text2.id);
		var messageLabel = ap.createLabel("Optional message:", text3.id);
		var closeLabel = ap.createLabel("Close this Window", closeBtn.id);
		closeLabel.className = "hide";
		var submitLabel = ap.createLabel("Submit Email", ap.submitBtn.id);
		submitLabel.className = "hide";

		var textInfoBegin = ap.createDialog("Begin Share Dialog");
		var textInfoEnd = ap.createDialog("End Share Dialog");

		div.appendChild(textInfoBegin);
		div.appendChild(heading);
		div.appendChild(recipientLabel);
		div.appendChild(text1);
		div.appendChild(emailLabel);
		div.appendChild(text2);
		div.appendChild(messageLabel);
		div.appendChild(text3);
		div.appendChild(text5);
		div.appendChild(text6);
		div.appendChild(submitLabel);
		div.appendChild(ap.submitBtn);
		div.appendChild(closeLabel);
		div.appendChild(closeBtn);
		div.appendChild(textInfoEnd);
		ap.appendDiv(div);

		text1.focus();

		var indexToInsert = 0;

		// put the heading, desctext and close button in to the array and
		// reorder the tab index
		for ( var i = 0; i < ap.buttons.length; i++) {

			if (ap.buttons[i].id.indexOf("share") != -1) {
				indexToInsert = i;
			}
		}

		ap.buttons.splice(indexToInsert + 3, 0, text1);
		ap.buttons.splice(indexToInsert + 5, 0, text2);
		ap.buttons.splice(indexToInsert + 7, 0, text3);
		ap.buttons.splice(indexToInsert + 8, 0, ap.submitBtn);
		ap.buttons.splice(indexToInsert + 9, 0, closeBtn);

		ap.reorderTabIndex();
	}

	ap.createEmbedWindow = function() {

		ap.disableControls();

		ap.windowToClose = "embedWindow";

		// parent container
		var div = document.createElement("DIV");
		div.className = "blankWindow";
		div.id = "embedWindow";

		// close button
		var closeBtn = ap.createCloseBtn();
		closeBtn.id = "closeEmbed";

		// heading
		var heading = ap.createHeading("Embed Video");

		// option menu
		var sm = document.createElement("SELECT");
		sm.id = "embedMenu";
		sm.onchange = function() {
			ap.setOption();
		};
				
		for ( var i=0;i<ap.embeds.length;i++)
		{
			var option = document.createElement("OPTION");
			option.value = ap.embeds[i]['title'];
			option.innerHTML = ap.embeds[i]['description'];
			sm.appendChild(option);
		}

		// text area
		var textArea = document.createElement("TEXTAREA");
		textArea.className = "embedCode";
		textArea.id = "codeArea";
		textArea.name = "codeArea";
		textArea.title = "Code Area";
		textArea.readOnly = "readonly";
		textArea.innerHTML = ap.embeds[0]["src"];
		textArea.onfocus = function() {
			ap.selectText();
		};

		// labels
		var label1 = ap.createLabel("Embed", sm.id);
		var label2 = ap.createLabel("Code", textArea.id);
		var label3 = ap.createLabel("Close this Window", closeBtn.id);
		label3.className = "hide";

		var textInfoBegin = ap.createDialog("Begin Embed Dialog");
		var textInfoEnd = ap.createDialog("End Embed Dialog");

		div.appendChild(textInfoBegin);
		div.appendChild(heading);
		div.appendChild(label1);
		div.appendChild(sm);
		div.appendChild(label2);
		div.appendChild(textArea);
		// div.appendChild(ap.copyBtn);
		div.appendChild(label3);
		div.appendChild(closeBtn);
		div.appendChild(textInfoEnd);

		ap.appendDiv(div);

		sm.focus();

		var indexToInsert = 0;

		// put the heading, desctext and close button in to the array and
		// reorder the tab index
		for ( var i = 0; i < ap.buttons.length; i++) {

			if (ap.buttons[i].id.indexOf("embed") != -1) {
				indexToInsert = i;
			}
		}

		ap.buttons.splice(indexToInsert + 3, 0, sm);
		ap.buttons.splice(indexToInsert + 5, 0, textArea);
		// ap.buttons.splice(indexToInsert+6,0,ap.copyBtn);
		ap.buttons.splice(indexToInsert + 6, 0, closeBtn);

		ap.reorderTabIndex();
	}

	ap.selectText = function() {
		document.getElementById("codeArea").select();
	}

	ap.setOption = function() {

		var option = document.getElementById("embedMenu").value;
		
		
		for ( var i=0;i<ap.embeds.length;i++)
		{
			if ( option==ap.embeds[i]["title"])
			{
				document.getElementById("codeArea").innerHTML = ap.embeds[i]["src"];
			}
		}
	}

	ap.appendDiv = function(div) {
		ap.windowContainer.appendChild(div);
		ap.windowContainer.style.display = "block";
	}

	ap.closeWindow = function(id) {

		ap.enableControls();
		ap.windowContainer.removeChild(document.getElementById(id));
		ap.windowContainer.style.display = "none";

		// empty the buttons array and re insert just the control panel buttons
		ap.buttons.length = 0;
		ap.addButtonsToArray();

		if (id == "shareWindow") {
			ap.share.focus();
		}

		if (id == "infoWindow") {
			ap.info.focus();
		}

		if (id == "embedWindow") {
			ap.embed.focus();
		}
	}

	ap.reorderTabIndex = function() {

		for ( var i = 0; i < ap.buttons.length; i++) {

			// alert(ap.buttons[i].id);
			ap.buttons[i].tabIndex = i + 1;
		}
	}

	ap.disableControls = function() {

		var buttons = ap.control.getElementsByTagName("Button");

		for ( var i = 0; i < buttons.length; i++) {

			buttons[i].disabled = "disabled";
		}
	}

	ap.enableControls = function() {

		var buttons = ap.control.getElementsByTagName("Button");

		for ( var i = 0; i < buttons.length; i++) {

			buttons[i].disabled = "";
		}
	}

	ap.fullScreenOn = function() {
		// when the full screen button is pressed put the focus on that so it
		// highlights
		ap.fs.focus();
	}

	ap.setVolume = function(mode) {

		// alert(ap.redVol.offsetWidth);

		if (mode == 'min') {

			if (ap.currentVolume <= 0) {

			} else {
				if (ap.isMute == true) {

					ap.isMute = false;
					ap.mute.className = "muteOn";
					ap.redVol.style.display = "block";
					ap.mute.value = "Mute On";
					ap.changeButtonText("mute on");
				}

				ap.currentVolume -= ap.volIncrement;
				$pdk.controller.setVolume(ap.currentVolume);

				var newWidth = ap.redVol.offsetWidth - ap.volIncrementWidth;
				newWidth = Math.ceil(newWidth);

				if (newWidth >= 0) {

					ap.redVol.style.width = newWidth + "px";
				}

				// set the volume text
				ap.volumeText.innerHTML = ap.currentVolume + "%";

				if (ap.currentVolume == 0) {

					ap.redVol.style.display = "none";
					ap.isMute = true;
					// switch to mute off button
					ap.mute.className = "muteOff";
					ap.mute.value = "Mute Off";
					ap.changeButtonText("mute off");
				}
			}
		}

		if (mode == "max") {

			// if volume is at 100
			if (ap.currentVolume >= 100) {

				if (ap.isMute == true) {
					ap.isMute = false;
					ap.mute.className = "muteOn";
					ap.redVol.style.display = "block";
					ap.changeButtonText("mute on");
					ap.mute.value = "Mute On";
				}

			} else {

				// if the current volume is set to 0 or mute is turned on then
				// make sure the mute button turns off and the red volume bar
				// appears
				if (ap.currentVolume <= 0 || ap.isMute == true) {

					ap.isMute = false;
					ap.mute.className = "muteOn";
					ap.redVol.style.display = "block";
					ap.changeButtonText("mute on");
					ap.mute.value = "Mute On";
				}

				ap.currentVolume += ap.volIncrement;
				$pdk.controller.setVolume(ap.currentVolume);

				// set the width of the the red volume bar
				var newWidth = ap.redVol.offsetWidth + ap.volIncrementWidth;

				ap.redVol.style.width = newWidth + "px";

				// set the volume text
				ap.volumeText.innerHTML = ap.currentVolume + "%";
			}
		}
	}

	ap.highlight = function(mode) {

		switch (mode) {

		case "play":

			if (ap.isStopped) {
				ap.play.className = "playHighlight";
			} else {
				if (ap.isPause) {
					ap.play.className = "playHighlight";
				} else {
					ap.play.className = "pauseHighlight";
				}
			}
			break;

		case "previous":
			ap.prev.className = "prevHighlight";
			break;

		case "next":
			ap.next.className = "nextHighlight";
			break;

		case "mute":
			if (ap.isMute) {
				ap.mute.className = "muteOffHighlight";
				isMute = false;
			} else {
				ap.mute.className = "muteOnHighlight";
				isMute = true;
			}
			break

		case "minVol":
			ap.minVol.className = "minVolumeHighlight";
			break;

		case "maxVol":
			ap.maxVol.className = "maxVolumeHighlight";
			break;

		case "share":
			ap.share.className = "shareHighlight";
			break;

		case "embed":
			ap.embed.className = "embedHighlight";
			break;

		case "more":
//			ap.more.className = "moreHighlight";
			break;

		case "info":
			ap.info.className = "infoHighlight";
			break;

		case "fs":
			document.getElementById("playerwidget").onTabFocus();
			document.getElementById('playerwidget').focus();
			break;

		case "close":
			ap.closeBtn.className = "closeHighlight";
			break;

		case "submitShare":
			ap.submitBtn.className = "submitShareHighlight";
			break;

		case "caption":
			if (ap.captionOn) {
				ap.caption.className = "captionOffHighlight";
			} else {
				ap.caption.className = "captionOnHighlight";
			}
			break;

		default:
			break;
		}
	}

	ap.unhighlight = function(mode) {

		switch (mode) {

		case "play":

			if (ap.isStopped) {

				ap.play.className = "play";
			} else {
				if (ap.isPause) {

					ap.play.className = "play";
				} else {
					ap.play.className = "pause";
				}
			}
			break;

		case "previous":
			ap.prev.className = "prev";
			break;

		case "next":
			ap.next.className = "next";
			break;

		case "mute":
			if (ap.isMute) {

				ap.mute.className = "muteOff";
				isMute = false;
			} else {
				ap.mute.className = "muteOn";
				isMute = true;
			}
			break;

		case "minVol":
			ap.minVol.className = "minVolume";
			break;

		case "maxVol":
			ap.maxVol.className = "maxVolume";
			break;

		case "share":
			ap.share.className = "share";
			break;

		case "embed":
			ap.embed.className = "embed";
			break;

		case "more":
//			ap.more.className = "more";
			break;

		case "info":
			ap.info.className = "info";
			break;

		case "close":
			ap.closeBtn.className = "close";
			break;

		case "submitShare":
			ap.submitBtn.className = "submitShare";
			break;

		case "caption":

			if (ap.captionOn) {
				ap.caption.className = "captionOff";
			} else {
				ap.caption.className = "captionOn";
			}
			break;

		case "fs":
			document.getElementById("playerwidget").onTabOut();
			break;

		default:
			break;
		}
	}

	ap.initplayer = function() {
		// when clip first starts get the clip info - title, description and
		// duration
		$pdk.controller.addEventListener("OnMediaStart", ap.getClipInfo);
		$pdk.controller.addEventListener("OnReleaseStart", ap.onReleaseStart);
		$pdk.controller.addEventListener("OnGetSubtitleLanguage", ap.getSubtitlePref);
		$pdk.controller.addEventListener("OnSubtitleCuePoint", ap.displaySubtitles);
		// when release is first loaded get the clip info - title, description
		// and duration etc and then display the
		// control area
		$pdk.controller.addEventListener("OnLoadReleaseUrl", ap.onLoadRelease);
		$pdk.controller.addEventListener("OnSetReleaseUrl", ap.onLoadRelease);

		// check to see if a subtitle language is already set for this player,
		// if it is display the subtitles
		$pdk.controller.getSubtitleLanguage();

		ap.initControls();
	}

	ap.two = function(x) {
		return ((x > 9) ? "" : "0") + x;
	}

	ap.three = function(x) {
		return ((x > 99) ? "" : "0") + ((x > 9) ? "" : "0") + x;
	}

	ap.convertMS = function(ms) {
		var sec = Math.floor(ms / 1000)
		var min = Math.floor(sec / 60);
		sec = sec % 60;
		t = ap.two(sec);

		var hr = Math.floor(min / 60);
		min = min % 60;
		t = ap.two(min) + ":" + t;

		return t;
	}

	ap.getQuery = function(key, default_) {

		if (default_ == null)
			default_ = "";
		key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
		var qs = regex.exec(window.location.href);
		if (qs == null)
			return default_;
		else
			return qs[1];
	}

	function writeDebug(txt) {

		var div = document.createElement("P");
		div.innerHTML = txt;

		document.getElementById("debug").appendChild(div);
	}

	// start the player
	ap.init();
}