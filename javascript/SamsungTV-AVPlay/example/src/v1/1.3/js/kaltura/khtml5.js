/*console.log("This is only load in case of HTML5 player and is loaded inside the iframe")*/
console.log("khtml5 !!")
var html5Fix = {
		videoElement: undefined,
		isBuffering: false,
		totalBytesTimer: undefined,
		bufferingTimer: undefined,
		lastTime: 0,
		countEqualPlayhead: 0,
		eventsToBuffer: 5,
		source: "",
		sourceSent: false,
		isPaused: false,
		canBuffer: false,
		init: function(){
			/* For versions older to 2, the buffering can be extracted, so use the inner HTML5 object to track. THe case of bitrate has to be extracted with this also */
			html5Fix.videoElement = document.getElementsByTagName('video')[0]
			// Timeout to get resource URL
			html5Fix.resourceTimer();

			html5Fix.videoElement.addEventListener("seeking", function (e) {
				/*console.log('******************* html5Fix seek start! ***********')*/
				message = {
					type : 'seek_start',
					time: new Date().getTime()
				}							
				html5Fix.sendMessageToSmartPlugin(message);				
			}, false);						

			/*
			html5Fix.videoElement.addEventListener("seeked", function (e) {
				console.log('******************* html5Fix seek end! ***********')
			}, false);					
			*/

			//Answer to SmartPlugin probe
			window.addEventListener("message", function(message){
				if(message.data=='probe'){
					html5Fix.sendMessageToSmartPlugin('ack','*')
				}
				if(message.data=='canbuffer'){
					html5Fix.canBuffer=true;
				}
			}, false);

			// Bitrate cannot be extracted even in v2
			html5Fix.checkBitrateType();

			// Reset parameters when the video is ended
			html5Fix.videoElement.addEventListener("ended", function (e) {
							html5Fix.videoElement= undefined;
							html5Fix.isBuffering=false;
							clearInterval(html5Fix.totalBytesTimer);
							clearInterval(html5Fix.bufferingTimer);
							html5Fix.totalBytesTimer=undefined;
							html5Fix.bufferingTimer=undefined;
							html5Fix.source="";
							html5Fix.sourceSent=false;
							html5Fix.canBuffer=false;
							html5Fix.init();
			}, false);				


			if(mw.versionIsAtLeast("2")==false){
				if(html5Fix.videoElement){

					html5Fix.videoElement.addEventListener("pause", function (e) {
						html5Fix.isPaused=true;
					});

					html5Fix.videoElement.addEventListener("play", function (e) {
						if(html5Fix.isPaused==true){
							html5Fix.isPaused=false;
						}
					});

					html5Fix.videoElement.addEventListener("waiting", function (e) {
						if(html5Fix.canBuffer){
							html5Fix.isBuffering=true;
							message = {
								type : 'buffer_start',
								time: new Date().getTime()
							}
							html5Fix.sendMessageToSmartPlugin(message);
						}
					}, false);	
					
					html5Fix.videoElement.addEventListener("timeupdate", function (e) {
						if(html5Fix.videoElement.currentTime > html5Fix.lastTime)
							html5Fix.lastTime = html5Fix.videoElement.currentTime						
						/*
						if(html5Fix.isBuffering==true){
							message = {
								type : 'buffer_end',
								time: new Date().getTime()
							}							
							html5Fix.sendMessageToSmartPlugin(message);
							html5Fix.isBuffering=false;
						}
						*/
					}, false);	

					/* Check each 300 ms the presence of a buffer underrun*/
					html5Fix.bufferingTimer = setInterval(html5Fix.checkStatus,300)									
				}
			}
		},
		checkStatus: function(){
			if(html5Fix.canBuffer){
				diffTolerance = 0.099;
				diff = (html5Fix.videoElement.currentTime - html5Fix.lastTime);

				html5Fix.log(html5Fix.videoElement.currentTime+" ******* "+html5Fix.lastTime+" ********* "+diff);

				if((diff < diffTolerance) && html5Fix.isBuffering==false && html5Fix.lastTime>0 && html5Fix.isPaused==false){
					if(html5Fix.countEqualPlayhead < html5Fix.eventsToBuffer){
						html5Fix.log("count one")
						html5Fix.countEqualPlayhead++;
					}else if(html5Fix.countEqualPlayhead==html5Fix.eventsToBuffer){
						html5Fix.isBuffering=true;
						html5Fix.log("BUFFER START")
							message = {
								type : 'buffer_start',
								time: new Date().getTime()
							}
							html5Fix.sendMessageToSmartPlugin(message);					
					}
				}
				if(diff >= diffTolerance && html5Fix.isBuffering==true && html5Fix.lastTime>0){
					html5Fix.countEqualPlayhead=0;
					html5Fix.isBuffering=false;
					html5Fix.log("BUFFER END!")
					message = {
						type : 'buffer_end',
						time: new Date().getTime()
					}							
					html5Fix.sendMessageToSmartPlugin(message);				
				}
				/*
				if(diff >= 0.09 && html5Fix.isBuffering==false && html5Fix.lastTime>0){
					html5Fix.countEqualPlayhead=0;
				}
				*/
			}			
		},
		sendMessageToSmartPlugin: function(message){
			window.parent.postMessage(message,'*')
		},
		resourceTimer: function(){
			if(html5Fix.videoElement.currentSrc!="" && html5Fix.sourceSent==false){
				html5Fix.source = html5Fix.videoElement.currentSrc;
				message = {
							type : 'resource',
							url : html5Fix.source
				}
				html5Fix.sendMessageToSmartPlugin(message);						
				html5Fix.sourceSent=true;
			}else if(html5Fix.videoElement.currentSrc==""){
				setTimeout(html5Fix.resourceTimer,1);
			}
		},
	    checkBitrateType: function () {
	        if (typeof html5Fix.videoElement.webkitVideoDecodedByteCount != "undefined") {
	            clearInterval(html5Fix.totalBytesTimer);
	            html5Fix.totalBytesTimer = setInterval(function () { 
	            	totalBytes = html5Fix.videoElement.webkitVideoDecodedByteCount
	            	message = {
	            		type: 'totalBytes',
	            		bytes: totalBytes
	            	}
	            	html5Fix.sendMessageToSmartPlugin(message)
	            }, 1000);
	        }
	    },	
	    log: function(txt){
	    	/*
	    	console.log("***********"+txt);
	        message = {
	        	type: 'log',
	            log: "***********"+txt
	        }
	        html5Fix.sendMessageToSmartPlugin(message)	    	
	        */
	    }	

	}
html5Fix.init()
