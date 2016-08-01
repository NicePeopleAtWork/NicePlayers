/**
NicePeopleAtWork Plugin Test Framework
Author:  Luis Miguel Lainez
**/

var debugService = "http://db8.pam.nice264.com:8991";
//var debugService = "http://localhost:8991";
var testCode = $("testCode").innerHTML;
var destination="";
var testType ="";
var resource="";
var player="";
var pluginVersion="";
var technology="";

//------------------------------------------------------------
//PRIVATE METHODS
//------------------------------------------------------------

//[Private] Class in charge of dynamically load scripts
var ScriptLoader = {
      load: function(src, callback) {
        var script = document.createElement('script'),
            loaded;
        script.setAttribute('src', src);
        if (callback) {
          script.onreadystatechange = script.onload = function() {
              callback();
          };
        }
        document.getElementsByTagName('head')[0].appendChild(script);
    }
};

//[Private] Function to get the parameter value from the URL
function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
//[Private] Function to set up the plugin parameters in youboraData
//depending on the type of test 
function configureTest(){

	youboraData.setAccountCode("QA");
	youboraData.setDebug(true);
	startTest(testCode,testType);
	if(destination == "Debug"){
		youboraData.setService(debugService);
	}
	if(testType == 'A'){
		//Do nothing. Just set up the accountCode
	}else if (testType =='B'){
		youboraData.setUsername('QAautotest');
	    youboraData.setContentId('contentIdAutotest');
	    youboraData.setLive(true);
	    youboraData.setTransaction("transacodeAutotest");
	    youboraData.setMediaResource("http://nice264.com/autotest.mp4");
	    youboraData.setProperties({ 
	      filename: "fileNameAutotest", 
	      content_id: "contentIdAutotest", 
	      content_metadata: { 
	        title: "TitleAutotest", 
	        genre: "GenreAutotest", 
	        language: "LanguageAutotest", 
	        year: "YearAutotest", 
	        cast: "castAutotest", 
	        director: "directorAutotest", 
	        owner: "ownerAutotest", 
	        duration: "durationAutotest", 
	        parental: "parentalAutotest", 
	        price: "priceAutotest", 
	        rating: "ratingAutotest", 
	        audioType: "audioTypeAutotest", 
	        audioChannels: "audioChannelsAutotest" 
	      }, 
	      transaction_type: "transactionTypeAutotest", 
	      quality: "qualityAutotest", 
	      content_type: "movieAutotest", 
	      device: { 
	        manufacturer: "manufacturerAutotest", 
	        type: "typeAutotest", 
	        year: "yearAutotest", 
	        firmware: "firmwareAutotest" 
	      } 
	    });
	    youboraData.setExtraParam(1, 'extraparam1');
	    youboraData.setExtraParam(2, 'extraparam2');
	    youboraData.setExtraParam(3, 'extraparam3');
	    youboraData.setExtraParam(4, 'extraparam4');
	    youboraData.setExtraParam(5, 'extraparam5');
	    youboraData.setExtraParam(6, 'extraparam6');
	    youboraData.setExtraParam(7, 'extraparam7');
	    youboraData.setExtraParam(8, 'extraparam8');
	    youboraData.setExtraParam(9, 'extraparam9');
	    youboraData.setExtraParam(10, 'extraparam10');

	    youboraData.setIP("8.8.8.8");
		youboraData.setISP("ISP TestNice");
		youboraData.setCDN("L3");
        youboraData.setHttpSecure(false);
        youboraData.setDebug(true);
	}else if(testType=='C'){
		youboraData.setContentId("testId");
		youboraData.setUsername('QAautotest');
		youboraData.setResumeProperties({
	     	resumeEnabled:   true,
	     	//At some point, implement this in db8 and isolate the plugin
	     	//from other services
	     	resumeService:  debugService+"/resume",// "http://pc.youbora.com/resume/", 
	     	playTimeService: debugService+"/concurrencyService",//"http://pc.youbora.com/playTime/",    
	     	resumeCallback:  resumeCallback            
   		 }); 
	}else if(testType=='D'){
		youboraData.setContentId("testId");
		youboraData.setUsername('QAautotest');
		var concurrencyRedirectUrl = "../concurrencyLandingPage.html?testCode="+testCode+"&testType="+testType;
		youboraData.setConcurrencyProperties({
	      enabled: true,
	      //At some point, implement this in db8 and the plugin from other services
	      concurrencyService: debugService+"/cping", //"http://pc.youbora.com/cping/", 
	      concurrencyCode: "testCode", 
	      concurrencyMaxCount: 1,
	      concurrencyRedirectUrl: concurrencyRedirectUrl,
	      concurrencyIpMode: false 
	    }); 
	}else if(testType=="E"){
		//This is meant to be done for L3
		youboraData.setCDNNodeData(true);
	}else if(testType=="F"){
		//This is meant to be done for AKAMAI
		youboraData.setCDNNodeData(true);
	}else if(testType=="G"){
		youboraData.setHttpSecure(true);
	}else if(testType=="H"){
		setTimeout(function(){
			$( "#forceError" ).click();
			$( "#play" ).click();
		},2000);
	}else if(testType=="I"){
		setTimeout(function(){
			$("#play").click();
		},2000);
		setTimeout(function(){
			$( "#forceError" ).click();
		},15000);		
	}
}

//[Private] Function to reload the testing page in case one of the parameters changes and it cannot be
//done in the fly
function reloadTestPage(){
	destination = $('#destination').find(":selected").text();
	testType = $('#testType').find(":selected").text();
	technology = $('#technology').find(":selected").text();
	resource = $('#resource').find(":selected").text();
	pluginVersion = $('#pluginVersion').find(":selected").text();
	testCode = $('#testCode').val();
	var newlocation =  location.protocol + '//' + location.host + location.pathname+"?destination="+destination+"&testType="+testType+"&technology="+technology+"&resource="+resource+"&forcePluginVersion="+pluginVersion+"&testCode="+testCode;
	window.location = newlocation;
}

function loadJavascriptFile(url,callback) {
	ScriptLoader.load(url,callback);
    /*try {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        head.appendChild(script);
    } catch (error) {
        console.log("loadJavascriptFile :: Error :: " + error);
    }*/
}

function resumeCallback(time){
	sendResume(testCode,testType);
}

//------------------------------------------------------------
//PUBLIC METHODS
//------------------------------------------------------------

//[Public] Test initialization function. It is in charge of setting up the UI 
//and the test parameters
function prepareTestEnvironment(){
	destination = getParameterByName("destination");
	testType =getParameterByName("testType");
	technology =getParameterByName("technology");
	resource = getParameterByName("resource");
	pluginVersion = getParameterByName("forcePluginVersion");
	testCode = getParameterByName("testCode");
	if(destination != ""){
		$( "#destination" ).val(destination);
	}else{
		destination = $('#destination').find(":selected").text();
	}
	if(testType!=""){
		$( "#testType" ).val(testType);
	}else{
		testType = $('#testType').find(":selected").text();
	}
	if(technology!=""){
		$( "#technology" ).val(technology);
	}else{
		technology = $('#technology').find(":selected").text();
	}
	if(resource!=""){
		$('#resource option').filter(function () { return $(this).html() == resource; }).attr('selected', 'selected');
	}else{
		resource = $('#resource').find(":selected").text();
	}
	if(pluginVersion!=""){
		$( "#pluginVersion" ).val(pluginVersion);
	}else{
		pluginVersion = $('#pluginVersion').find(":selected").text();
	}
	if(testCode!=""){
		$( "#testCode" ).val(testCode);
	}else{
		testCode = Math.floor((Math.random() * 1000) + 1);
		testCode = player+"_"+technology+"_"+pluginVersion+"_"+testCode;
		$('#testCode').val(testCode);
	}
	$("#testCode").keypress(function(){
		testCode = $('#testCode').text();
	});
	$("#destination").change(function(){
		reloadTestPage();
	});
	$("#testType").change(function(){
		reloadTestPage();
	});
	$("#technology").change(function(){
		reloadTestPage();
	});
	$("#resource").change(function(){
		reloadTestPage();
	});
	$("#pluginVersion").change(function(){
		reloadTestPage();
	});

	configureTest();
}

//[Public] Function to load the SmartPlugin libraries depending on the parameters
//passed by URL
function loadLibraries(){
	pluginVersion = getParameterByName("forcePluginVersion");
	var spYouboraParams = "";
	spYouboraParams +="?preProduction=true";
	if(pluginVersion!=""){
		spYouboraParams += "&forcedVersion="+pluginVersion;
	}
	loadJavascriptFile("http://pre.smartplugin.youbora.com/1.3/sp/spyoubora.js"+spYouboraParams);
}

function getForcedPluginVersion(){
	return pluginVersion;
}
function getTechnology(){
	return getParameterByName("technology");
}
function getSelectedResource(){
	return $('#resource').find(":selected").val();
}

function startTest(testCode,testType){
	var request = new XMLHttpRequest();
	var urlDataWithCode = debugService+"/startTest?testCode="+testCode+"&testType="+testType;
    request.open("GET", urlDataWithCode, true);
    request.send();
}
function endTest(testCode,testType){
	var request = new XMLHttpRequest();
	var urlDataWithCode =debugService+ "/end?testCode="+testCode+"&testType="+testType;
    request.open("GET", urlDataWithCode, true);
    request.send();
}
 
function sendResume(testCode,testType){
	var request = new XMLHttpRequest();
	var urlDataWithCode = debugService+"/resumeTest?testCode="+testCode+"&testType="+testType;
    request.open("GET", urlDataWithCode, true);
    request.send();
}
function sendConcurrency(testCode,testType){
	console.log(testType);
	var request = new XMLHttpRequest();
	var urlDataWithCode = debugService+"/concurrencyTest?testCode="+testCode+"&testType="+testType;
    request.open("GET", urlDataWithCode, true);
    request.send();
}