(function () { 

	var userParams = collectParams(); 
 	loadYouboraData(); 

	function loadYouboraData() {		
		try {
			var data = document.createElement("script");
			data.type = "text/javascript"; 
			data.src = "http://pre.smartplugin.youbora.com/1.2/js/libs/youbora-data.js?" + userParams + window.location.search.substr(1); 
			data.onload = function() {
				try {
					loadSpYoubora();
				} catch (error) { console.log("VideoJS :: loadYouboraData.onload :: Error :: " + error); }
			}
			data.onreadystatechange = function () { 
				try {
					if (this.readyState == 'complete') { loadSpYoubora();  }
				} catch (error) { console.log("VideoJS :: loadYouboraData.onreadystatechange :: Error :: " + error); }
			}
			document.body.appendChild(data); 
		} catch (error) { console.log("VideoJS :: loadYouboraData :: Error :: " + error); }
	}

	function loadSpYoubora() {
		try {
			var sp = document.createElement("script");
			sp.type = "text/javascript";  
			sp.src = "http://pre.smartplugin.youbora.com/1.2/sp/spyoubora.js?preProduction=true&" + userParams; 
			document.body.appendChild(sp);
		} catch (error) { console.log("VideoJS :: loadSpYoubora :: Error :: " + error); }
	}

	function collectParams() {
	    try { 
	    	var scripts = document.getElementsByTagName('script');
	        var index = 0;
	        for (var i = 0; i < scripts.length; i++) { if (scripts[i].src.indexOf('players.brightcove.net') != -1) { index = i; } }
	        var spYouboraScript = scripts[index];
	        var srcData = spYouboraScript.src.replace(/^[^\?]+\??/, '');
	        var Pairs = srcData.split(/[;&]/);
	        var resultString = "";
	        for (var i = 0; i < Pairs.length; i++) { var KeyVal = Pairs[i].split('=');
	            if (!KeyVal || KeyVal.length != 2) continue;
	            var key = unescape(KeyVal[0]);
	            var val = unescape(KeyVal[1]);
		    val = val.replace(/\+/g, ' ');
	            resultString += key + "=" + val + "&";
	        }
	        return resultString;
	    } catch (error) { console.log("VideoJS :: collectParams :: Error :: " + error); }
	}

})();
