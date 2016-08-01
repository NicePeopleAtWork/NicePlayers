/*
* YouBora - BrightCove SWF Adapter 
* Copyright (c) 2014 NicePeopleAtWork
* Author: Lluís Campos Beltran
* Version: 3.1.0
*	- Full Revision
*/ 
package
{
	import com.adobe.serialization.json.JSON;
	import com.brightcove.api.APIModules;
	import com.brightcove.api.CustomModule;
	import com.brightcove.api.brightcove_api;
	import com.brightcove.api.dtos.BrightcoveDateDTO;
	import com.brightcove.api.dtos.RenditionAssetDTO;
	import com.brightcove.api.dtos.VideoDTO;
	import com.brightcove.api.events.ErrorEvent;
	import com.brightcove.api.events.MediaEvent;
	import com.brightcove.api.modules.ContentModule;
	import com.brightcove.api.modules.ExperienceModule;
	import com.brightcove.api.modules.MenuModule;
	import com.brightcove.api.modules.VideoPlayerModule;
	import com.nice.BandwidthProcess;
	import com.nice.event.AnalyticEvent;
	import com.nice.processor.EventProcessor;
	import com.nice.utils.UtilsCNN;
	
	import flash.display.LoaderInfo;
	import flash.events.Event;
	import flash.events.HTTPStatusEvent;
	import flash.events.IOErrorEvent;
	import flash.events.SecurityErrorEvent;
	import flash.events.TimerEvent;
	import flash.external.ExternalInterface;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestHeader;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	import flash.net.navigateToURL;
	import flash.system.Security;
	import flash.utils.Timer;
	import flash.utils.clearInterval;
	import flash.utils.clearTimeout;
	import flash.utils.setInterval;
	import flash.utils.setTimeout;
	
	import org.httpclient.HttpClient;
	import org.httpclient.HttpHeader;
	import org.httpclient.HttpRequest;
	import org.httpclient.HttpResponse;
	import org.httpclient.events.HttpDataEvent;
	import org.httpclient.events.HttpErrorEvent;
	import org.httpclient.events.HttpListener;
	import org.httpclient.events.HttpRequestEvent;
	import org.httpclient.events.HttpStatusEvent;
	import org.httpclient.http.Get;
	
	public class Module extends CustomModule
	{   
		private var _menuModule:MenuModule;
		private var _experienceModule:ExperienceModule;
		private var _videoPlayer:VideoPlayerModule;
		private var _contentModule:ContentModule;
		private var _areModulesLoaded:Boolean = false; 
		protected var testXML:XML; 
		protected var currentDuration:Number = 0;
		protected var currentPosition:Number = 0; 
		protected var pamUrl:String = "";
		protected var pamBufferUnderrunUrl:String = "";
		protected var pamJoinTimeUrl:String = "";
		protected var pamStartUrl:String = "";
		protected var pamStopUrl:String = "";
		protected var pamPauseUrl:String = "";
		protected var pamResumeUrl:String = "";
		protected var pamPingUrl:String = "";
		protected var pamErrorUrl:String = "";
		protected var pamCode:String  = "";
		protected var pamCodeOriginal:String = "";
		protected var pamCodeCounter:Number = 0;
		protected var pamLastCode:String = "last";
		protected var pamPingTime:Number = 5000;  
		protected var joinTimeBegin:uint;
		protected var bufferTimeBegin:uint;
		protected var pingTimer:Timer = null; 
		protected var bdtestTimer:Timer;
		protected var bdtest:Number;
		protected var bwtest:BandwidthProcess;
		protected var totalBytes:Number = 0;
		protected var currentBitrate:Number;
		protected var bitrateType:String; 
		protected var isStartEventSent:Boolean = false;
		protected var isStopEventSent:Boolean = true;
		protected var isJoinEventSent:Boolean = false;
		protected var isPauseEventSent:Boolean = false;
		protected var isPingRunning:Boolean = false;	 
		protected var lastPingTime:Number = 0;
		protected var eventProcessor:EventProcessor;
		protected var isXMLGetted:Boolean=false;
		protected var pluginVersion:String = "3.1.5_BrightCove-SWF";
		protected var targetDevice:String = "BrightCove-SWF";		
		protected var actualURL:String = ""; 
		protected var loadedBalancerURL:Boolean = false;
		protected var useOriginalBalancerURL:Boolean = false;
		protected var balancerTimeoutTimer:Timer;  
		protected var balancerNiceNVA:String;
		protected var balancerNiceNVB:String;
		protected var balancerToken:String;  
		protected var balancerObject:Object;
		protected var balancerIndex:Number;
		protected var balancerResourcesNum:Number; 
		protected var balancerExecuted:Number = 0;
		protected var isBalancerDataFetched:Boolean = false;
		protected var balancerOriginURL:String; 
		protected var getPathRef:RegExp = /^(\w+:\/\/)?((\w+\.){0,999})?(\w+)?\//; 
		protected var balancerURL:String = "http://smartswitch.youbora.com"; 
		protected var balancerStopEvents:Boolean = false;
		// Pass Trought Variables
		protected var debug:Boolean = false;
		protected var accountCode:String;
		protected var service:String = "http://nqs.nice264.com";
		protected var username:String;
		protected var mediaResource:String;
		protected var transaction:String;
		protected var live:Boolean = false;
		protected var liveSetted:Boolean = false;
		protected var properties:Object;
		protected var contentId:String;		
		// Properties 
		protected var propertyFileName:String = "";
		protected var propertyContentId:String = "";
		protected var propertyTransactionType:String = "";
		protected var propertyQuality:String = "";
		protected var propertyContentType:String = "";
		protected var propertyDeviceManufacturer:String = "";
		protected var propertyDeviceType:String = "";
		protected var propertyDeviceYear:String = "";
		protected var propertyDeviceFirmware:String = ""; 
		protected var propertyMetaTitle:String = "";
		protected var propertyMetaGenre:String = "";
		protected var propertyMetaLanguage:String = "";
		protected var propertyMetaYear:String = "";
		protected var propertyMetaCast:String = "";
		protected var propertyMetaDirector:String = "";
		protected var propertyMetaOwner:String = "";
		protected var propertyMetaDuration:String = "";
		protected var propertyMetaParental:String = "";
		protected var propertyMetaPrice:String = "";
		protected var propertyMetaRating:String = "";
		protected var propertyMetaAudioType:String = "";
		protected var propertyMetaAudioChannels:String = ""; 
		// Concurrency 
		protected var concurrencyEnabled:Boolean = false;
		protected var concurrencyCode:String = "";
		protected var concurrencyService:String = "http://pc.youbora.com/cPing/";
		protected var concurrencyMaxCount:Number = 0;
		protected var concurrencyRedirectUrl:String = "";
		protected var concurrencyIpMode:Boolean = false; 	
		protected var concurrencyInterval:uint;		
		protected var concurrencyTimeoutTimer:uint;
		protected var concurrencySessionId:Number = Math.random();
		// Resume 
		protected var resumeEnabled:Boolean = false;
		protected var resumeCallback:String = "function(secs) { console.log(secs); }";
		protected var resumeService:String = "http://pc.youbora.com/resume/";
		protected var playTimeService:String = "http://pc.youbora.com/playTime/";
		protected var playerCurrentTime:Number = 0;
		protected var resumeTimeoutTimer:Timer;
		protected var resumeTimer:Timer;
		protected var resumeMovetoSecs:Number = 0;
		protected var stopResume:Boolean = false;
		protected var firstTime:Boolean = true;
		// Balancer		
		protected var balanceEnabled:Boolean = false;
		protected var balanceType:String = "balanced";
		protected var balanceService:String = "http://smartswitch.youbora.com";
		protected var balanceZoneCode:String = "default";
		protected var balanceOriginCode:String = "";
		protected var balanceNVA:Number;
		protected var balanceNVB:Number;
		protected var balanceToken:String; 
		protected var isBalancing:Boolean = false;
		// Extra Params
		protected var extraparam1:String;
		protected var extraparam2:String;
		protected var extraparam3:String;
		protected var extraparam4:String;
		protected var extraparam5:String;
		protected var extraparam6:String;
		protected var extraparam7:String;
		protected var extraparam8:String;
		protected var extraparam9:String;
		protected var extraparam10:String;
		// Others
		protected var hashTitle:String = "true";
		protected var cdn:String = "";
		protected var isp:String = "";
		protected var ip:String = ""; 
		// Params Inherit From BrightCove (getPlayerParams)
		protected var playerParameters:Object;
		// Level 3
		protected var cdnNodeData:Boolean = false;
		protected var l3Host:String = "";
		protected var l3Type:String = "";
		protected var isSeeking:Boolean = false; 
		protected var httpSecure :Boolean=false; 
		protected var nqsDebugServiceEnabled :Boolean=false; 
		
		protected var playCounter : int =0;
		
		//---| Contructor |--->
		
		public function Module():void {	
			if(debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Initialized')"); } }
		
		override protected function initialize():void { 
			_experienceModule = player.getModule(APIModules.EXPERIENCE) as ExperienceModule;
			_videoPlayer = player.getModule(APIModules.VIDEO_PLAYER) as VideoPlayerModule;
			_contentModule = player.getModule(APIModules.CONTENT) as ContentModule;
			_menuModule = player.getModule(APIModules.MENU) as MenuModule;  
			playerParameters = _experienceModule.getStage().loaderInfo.parameters;
			 
			readParameters();			
			getPlayerParams();			
			setupEventListeners(); 
			
			if(liveSetted == false) { live = _videoPlayer.mediaIsLive(); }
			if (propertyMetaTitle == "") { propertyMetaTitle = _videoPlayer.getCurrentVideo().displayName; }
			setMetadata();
			properties = com.adobe.serialization.json.JSON.encode(properties);
			
			var now:Date = new Date();
			lastPingTime = now.time; 
			lastPingTime = now.time; 
					 
			if(httpSecure){ 
				service = service.split("//")[1];				 
				service = "https://"+service; 
			} 
			pamUrl = service + "/data?system="+accountCode+"&pluginVersion="+pluginVersion+"&targetDevice="+targetDevice+"&output=xml";
			if(nqsDebugServiceEnabled){ 
				pamUrl = pamUrl + "&nqsDebugServiceEnabled=true"; 
			} 
			if(debug) { ExternalInterface.call("console.log('pamUrl "+ pamUrl+"')"); }  
			eventProcessor = new EventProcessor(this);  
			fetchAnalytics(); 
			
			if(debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: onInitialize 3.1.5')"); } 
			_areModulesLoaded = true; 
		}  
		
		private function setMetadata():void {
			var composedProperties:Object = { 
				filename: propertyFileName,
				content_id: propertyContentId, 
				transaction_type: propertyTransactionType, 
				quality: propertyQuality, 
				content_type: propertyContentType, 
				content_metadata: { 
					title: propertyMetaTitle, 
					genre: propertyMetaGenre, 
					language: propertyMetaLanguage, 
					year: propertyMetaYear, 
					cast: propertyMetaCast, 
					director: propertyMetaDirector, 
					owner: propertyMetaOwner, 
					duration: propertyMetaDuration, 
					parental: propertyMetaParental, 
					price: propertyMetaPrice,
					rating: propertyMetaRating,
					audioType: propertyMetaAudioType, 
					audioChannels: propertyMetaAudioChannels
				},
				device: { 
					manufacturer: propertyDeviceManufacturer, 
					type: propertyDeviceType, 
					year: propertyDeviceYear, 
					firmware: propertyDeviceFirmware 
				}  
			};
			properties = composedProperties;
		}
		
		private function getPlayerParams():void
		{  
			try
			{
				var possibleVars:Array = ['debug','accountCode','service','username','mediaResource','transaction','live',
					                      'contentId','propertyFileName','propertyContentId','propertyTransactionType','propertyQuality',
										  'propertyContentType','propertyDeviceManufacturer','propertyDeviceType','propertyDeviceYear',
										  'propertyDeviceFirmware','propertyMetaTitle','propertyMetaGenre','propertyMetaLanguage','propertyMetaYear',
										  'propertyMetaCast','propertyMetaDirector','propertyMetaOwner','propertyMetaDuration','propertyMetaParental',
										  'propertyMetaPrice','propertyMetaRating','propertyMetaAudioType','propertyMetaAudioChannels',
										  'concurrencyEnabled','concurrencyCode','concurrencyService','concurrencyMaxCount','concurrencyRedirectUrl',
										  'concurrencyIpMode','resumeEnabled','resumeCallback','resumeService','playTimeService','balanceEnabled',
										  'balanceType','balanceService','balanceZoneCode','balanceOriginCode','balanceNVA','balanceNVB','balanceToken',
										  'extraparam1','extraparam2','extraparam3','extraparam4','extraparam5','extraparam6','extraparam7','extraparam8',
										  'extraparam9','extraparam10','cdnNodeData','hashTitle','cdn','isp','ip','nqsDebugServiceEnabled','httpSecure'];

				for (var elem:String in possibleVars)
				{
					var insideArrayElem:String = possibleVars[elem];
					var elemValue:String = playerParameters[insideArrayElem]; 
					
					
					if(elemValue != null && elemValue != "null")
					{ 
						if(debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: getPlayerParams :: "+ insideArrayElem +" => From: "+ this[insideArrayElem] +" To: "+ elemValue +"')"); } 
						try
						{
							if(insideArrayElem == "live" ) { liveSetted = true; } 
							if(elemValue == "false") { this[insideArrayElem]  = false; } 
							else if(elemValue == "true") { this[insideArrayElem]  = true; }
							else { 
								this["" + insideArrayElem + ""] =  elemValue;
							}
						}
						catch (err:Error)
						{
							if(debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: getPlayerParams Error: " + err + "')"); } 							
						}
					}
				}
			}
			catch (err:Error)
			{
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: getPlayerParams Error: "+ err +" ')");
				}
			}
		}
		
		private function getParamValue(key:String):String
		{ 
			var pluginParams:Object = LoaderInfo(this.root.loaderInfo).parameters; 
			for(var param:String in pluginParams) {  
				if(param == key) { return pluginParams[param]; } 
			}			
			return null;
		}
		
		private function readParameters ():void
		{  
			var possibleVars:Array = ['debug','accountCode','service','username','mediaResource','transaction','live',
				'contentId','propertyFileName','propertyContentId','propertyTransactionType','propertyQuality',
				'propertyContentType','propertyDeviceManufacturer','propertyDeviceType','propertyDeviceYear',
				'propertyDeviceFirmware','propertyMetaTitle','propertyMetaGenre','propertyMetaLanguage','propertyMetaYear',
				'propertyMetaCast','propertyMetaDirector','propertyMetaOwner','propertyMetaDuration','propertyMetaParental',
				'propertyMetaPrice','propertyMetaRating','propertyMetaAudioType','propertyMetaAudioChannels',
				'concurrencyEnabled','concurrencyCode','concurrencyService','concurrencyMaxCount','concurrencyRedirectUrl',
				'concurrencyIpMode','resumeEnabled','resumeCallback','resumeService','playTimeService','balanceEnabled',
				'balanceType','balanceService','balanceZoneCode','balanceOriginCode','balanceNVA','balanceNVB','balanceToken',
				'extraparam1','extraparam2','extraparam3','extraparam4','extraparam5','extraparam6','extraparam7','extraparam8',
				'extraparam9','extraparam10','cdnNodeData','hashTitle','cdn','isp','ip','nqsDebugServiceEnabled','httpSecure'];
			
			for (var elem:String in possibleVars)
			{
				var insideArrayElem:String = possibleVars[elem];
				var elemValue:String = getParamValue(insideArrayElem); 
				if(elemValue != null)
				{
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: readParameters :: "+ insideArrayElem +" => "+ elemValue +"')");
					}
					try
					{
						if(insideArrayElem == "live" ) { liveSetted = true; } 
						if(elemValue == "false") { this[insideArrayElem]  = false; } 
						else if(elemValue == "true") { this[insideArrayElem]  = true; }
						else { 
							this["" + insideArrayElem + ""] =  elemValue;
						}
					}
					catch (err:Error)
					{
						if(debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: readParameters Error: " + err + "')"); }
					}
				}  
			} 
		} 
		private function checkConcurrencyStatus():void
		{
			if (concurrencyEnabled == true)
			{ 
				
				concurrencyTimeoutTimer = setTimeout(timedConcurrencyFunction,3000);
				
				try 
				{ 
					var resumeLoader:URLLoader = new URLLoader();		
					var resumeURL:String = "";
					if(httpSecure){ 	 	
						concurrencyService = concurrencyService.split("//")[1];				 	 	
						concurrencyService = "https://"+concurrencyService; 	 	
					}
					if(concurrencyIpMode == true)
					{
						resumeURL = concurrencyService + "?accountCode="+accountCode+"&concurrencyCode="+concurrencyCode+"&concurrencyMaxCount=" + concurrencyMaxCount + "&random=" + Math.random();
					}
					else
					{
						resumeURL = concurrencyService + "?accountCode="+accountCode+"&concurrencySessionId="+concurrencySessionId+"&concurrencyCode="+concurrencyCode+"&concurrencyMaxCount=" + concurrencyMaxCount + "&random=" + Math.random();
					}
					var request:URLRequest = new URLRequest(resumeURL);
					resumeLoader.addEventListener(Event.COMPLETE, loadConcurrencyRequest);
					resumeLoader.load(request);
				}
				catch (e:Error) 
				{
					clearInterval(concurrencyInterval);
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Concurrency Error: "+e+"')");
					} 			
				}
			}
			else
			{
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Concurrency Disabled')");
					clearInterval(concurrencyInterval);
				} 
			}
		} 
		
		private function timedConcurrencyFunction (e:TimerEvent):void
		{ 
			if(debug)
			{
				ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Concurrency Timeout Reached - Disabling...')");
			} 
			clearInterval(concurrencyInterval);
			clearTimeout(concurrencyTimeoutTimer);			
			concurrencyEnabled = false;			
		}
		
		private function loadConcurrencyRequest (event:Event):void
		{ 
			
			try
			{
				var response:String = new String(event.target.data);
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Concurrency Response: "+ response +"')");
				} 
				if( response == "0") {
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Concurrency :: 0 :: Continue...')");
					} 
				}   
				else if (response == "1")
				{ 
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Concurrency :: 1 :: Exiting...')");
					}  
					try
					{ 
				
						ExternalInterface.call("window.location.replace('" + concurrencyRedirectUrl + "')");
					}
					catch(e:Error)
					{
						if(debug)
						{
							ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: loadConcurrencyRequest :: Error while callback: "+ e+" ')");
						}  
					}
				}
				else
				{
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Concurrency :: Unknown response: ["+response+"] Disabling...')");
					}  
					clearInterval(concurrencyInterval);
					clearTimeout(concurrencyTimeoutTimer);			
					concurrencyEnabled = false;
				}
			}
			catch (e:Error)
			{
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: loadConcurrencyRequest :: Concurrency error: "+ e +" ')");
				}   					
			}
		}  
		
		public function getPamCode():String { return pamCode; }
		public function getPamLastCode():String { return pamLastCode; }	
		public function getLastPingTime():Number { return lastPingTime; }
		
		private function checkResumeStatus():void
		{
			if (resumeEnabled == true)
			{ 
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Resume Enabled')");
				}
				
				resumeTimeoutTimer = new Timer(3000);
				resumeTimeoutTimer.addEventListener("timer", timedResumeFunction);
				
				try 
				{ 
					if(httpSecure){ 	 	
						resumeService = resumeService.split("//")[1];				 	 	
						resumeService = "https://"+resumeService; 	 	
					} 
					var request:URLRequest = new URLRequest(resumeService + "?contentId=" + contentId + "&userId=" + username + "&random=" + Math.random());
					var resumeLoader:URLLoader = new URLLoader(); 
					resumeLoader.addEventListener(Event.COMPLETE, loadResumeRequest);
					resumeLoader.load(request);
				}
				catch (e:Error) 
				{
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Resume Error: "+e+"')");
					} 			
				}
			}
			else
			{
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Resume Disabled')");
				} 
			}
		} 
		
		private function timedResumeFunction (e:TimerEvent):void
		{ 
			if(debug)
			{
				ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Resume Timeout Reached - Disabling...')");
			} 
			resumeTimeoutTimer.stop();			
			resumeEnabled = false;			
		}
		
		private function loadResumeRequest (event:Event):void
		{
			if(debug)
			{
				ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: loadresumeEvent')");
			} 
			
			try
			{
				var response:String = new String(event.target.data);
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Resume Response: "+ response +"')");
				} 
				if( response == "0") {
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: loadresumeEvent :: No previous state')");
					} 
				}  
				else if ( response == "")
				{	
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: loadresumeEvent :: Unknown state... Disabling...')");
					}  
					resumeEnabled = false;
				} 
				else
				{ 
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: loadresumeEvent :: Resume available: "+ response+"s ')");
					}   
					
					resumeMovetoSecs = Number(response); 
					try { 	 	
						ExternalInterface.call(resumeCallback + "("+ Number(response)+")");					 	 	
					} catch (e:Error) { 	 	
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: loadresumeEvent :: Failed to call resume function!')");						 	 	
					} 
				}
			}
			catch (e:Error)
			{
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: loadresumeEvent :: Resume error: "+ e +" ')");
				}   					
			}
		}
		
		private function sendResumeStatus():void 
		{
			try
			{ 	
				if(stopResume == false) {
					var actualPamCode:String = pamCode;
					var eventResume:AnalyticEvent = new AnalyticEvent("playTime",actualPamCode);
					eventProcessor.addToQueue(eventResume);
				}
 				setTimeout(sendResumeStatus,6000); 			 
			}
			catch (e:Error)
			{
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: sendResumeStatus error: "+ e +"')");
				}    					
			}
		}
		
		private function balancerStart():void
		{  
			if (balanceEnabled == false) {
				if(debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Balancer Disabled')"); }   
			}
			else
			{
				isBalancing = true;
				try
				{ 
					balancerTimeoutTimer = new Timer(3000);
					balancerTimeoutTimer.addEventListener("timer", timedBalancedFunction); 
					balancerTimeoutTimer.start();
					 
					var videoAsset:VideoDTO = _videoPlayer.getCurrentVideo();
					
					
					if ( _videoPlayer.getCurrentRendition() != null )
					{
						actualURL = _videoPlayer.getCurrentRendition().defaultURL;
					}
					else
					{
						actualURL = videoAsset.FLVFullLengthURL;
					}
					
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Balancer :: Original URL: "+ actualURL +" ')");
					}				
					 
					var balancerLoader:URLLoader = new URLLoader();
					balancerLoader.addEventListener(Event.COMPLETE, loadBalancerRequest);
					
					var urlBalancer:String = balanceService + "/?type="+balanceType+"&systemcode=" + accountCode + 
						"&zonecode=" + balanceZoneCode + "&origincode=" + balanceOriginCode + 
						"&resource=/" + escape(actualURL.replace(getPathRef, "")) + "&niceNva=" + balanceNVA + 
						"&niceNvb=" + balanceNVB + "&token=" + balanceToken;
					 
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Http Balancer Request: "+ urlBalancer +" ')");
					}
					
					var request:URLRequest = new URLRequest(urlBalancer);					
					balancerLoader.load(request);
				}
				catch (err:Error) 
				{
					balanceEnabled = false;
					balancerStopEvents = false;
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Balancer Start Error: "+ err +" ')");
					}
				}
			}
		}
		
		private function timedBalancedFunction (e:TimerEvent):void
		{

			balancerTimeoutTimer.stop();
			
			if ( loadedBalancerURL ) return;
			balanceEnabled = false;
			useOriginalBalancerURL	= true;
			balancerStopEvents = false;
			if(debug)
			{
				ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Balancer Timed Out, playing original URL')");
			} 
			
			//_videoPlayer.play();
		}
		
		private function loadBalancerRequest(event:Event):void
		{
			if ( useOriginalBalancerURL ) return; 
			loadedBalancerURL 	= true;
			
			if(debug)
			{
				ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: loadBalancerRequest')");
			}
			
			var response:String = new String(event.target.data);			
			var dataResponse:Object = com.adobe.serialization.json.JSON.decode(response);
			
			try {
				var count:Number = 0; 			
				for (var index:String in dataResponse) { 
					count++; 
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Balancer Resource: "+  dataResponse[count]['URL'] +"')");
					} 
				}
				
				dataResponse[count+1] = {};
				dataResponse[count+1]['URL'] = actualURL; 
				dataResponse[count+1]['CDN_NODE'] = "ORIGINAL";
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Balancer Resource: "+  dataResponse[count+1]['URL'] +"')");
				}  
			} catch (e:Error) {
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Balancer Error: "+  e +"')");
				}  
			}
			
			try {
			
				balancerObject = dataResponse;
				var newURL:String  = dataResponse['1']['URL'];
				
				if(newURL == actualURL)
				{
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Balancer Cancelled [Same URL]");
					}   		
				}
				else {
					balancerExecuted = 1;
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Balancing: "+  newURL +"')");
					}  
					balancerIndex = 1;
					replaceURLBalancer ( newURL );
				} 
			
			} catch (e:Error) {
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Balancer Error2: "+  e +"')");
				}  
			}
		}	
		
		private function setNextBalancerUrl():Boolean
		{
			_videoPlayer.stop();
			var newURL:String;
			var number:Number = 0;
			
			try {
				balancerIndex++;
				newURL  = balancerObject[balancerIndex]['URL'];
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Balancing new resource cause error:"+  newURL +"')");
				}  
				var counter:Number = balancerIndex-1;
				var requestError:URLRequest = new URLRequest(pamErrorUrl+"?errorCode=1300"+ counter +"&message=CDN_FAILED_AND_TRY_NEXT&code=" + pamCode); 				
				var errorLoader:URLLoader = new URLLoader();
				errorLoader.load(requestError);
				replaceURLBalancer( newURL );
			} 
			catch (err:Error) 
			{ 
				newURL = balancerOriginURL;
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: setNextBalancerUrl error: "+ err +"')");
				}   
				replaceURLBalancer( newURL );
			}
			
			if(number == 1) { return false; } else { return true; }
			
		}
		
		private function replaceURLBalancer(newURL:String):void
		{			 
			try { 
				_videoPlayer.removeUserMessage();
				_menuModule.closeMenuPage(); 
			} 
			catch(e:Error) 
			{
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Error closing menu: "+e+"')");
				}
			}
			
			try
			{ 

				var videoAsset:VideoDTO = _videoPlayer.getCurrentVideo();
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: replaceURLBalancer: "+  newURL +"')");
				}   
				
				videoAsset.displayName 							= newURL;
				videoAsset.FLVFullLengthURL 					= newURL;
				videoAsset.videoStillURL 						= newURL;
				videoAsset.linkURL								= newURL; 
				
				if ( _videoPlayer.getCurrentRendition() != null )
				{ 
					_videoPlayer.getCurrentRendition().defaultURL 	= newURL;
				} 				
				
				var renditions:Array = videoAsset.renditions;
				
				for ( var i:int = 0 ; i < renditions.length ; i++ )
				{
					try
					{ 						
						var rendition:RenditionAssetDTO = renditions[i];
						
						rendition.defaultURL = newURL;
						
						renditions[i] = rendition;
					}
					catch (error:Error) 
					{
						if(debug)
						{
							ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: replaceURLBalancer renditions error: "+  error +"')");
						}   
					}
					
				}
				 
				videoAsset.renditions = renditions;		 
				_contentModule.updateMedia(videoAsset);		  
				 
				updateAssetMetadata ();  
				_videoPlayer.loadVideo(_videoPlayer.getCurrentVideo().id);
				_videoPlayer.stop();
				// ¿AutoPlay?
				//_videoPlayer.play();
			}
			catch (err:Error) 
			{
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: replaceURLBalancer error: "+  err +"')");
				}    
			}
			
		}
		 
		private function setupEventListeners():void
		{
			if(debug)
			{
				ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: setupEventListeners')");
			}    
			try
			{
				_videoPlayer.addEventListener(MediaEvent.BEGIN, onMediaPlayerBegin);
				_videoPlayer.addEventListener(MediaEvent.PLAY, onMediaPlayerPlay);
				_videoPlayer.addEventListener(MediaEvent.BUFFER_BEGIN, onMediaPlayerBufferBegin);
				_videoPlayer.addEventListener(MediaEvent.BUFFER_COMPLETE, onMediaPlayerBufferComplete);
				_videoPlayer.addEventListener(MediaEvent.COMPLETE, onMediaPlayerStop);
				_videoPlayer.addEventListener(MediaEvent.STOP, onMediaPlayerStop);
				_videoPlayer.addEventListener(MediaEvent.CHANGE, onMediaPlayerChange);
				_videoPlayer.addEventListener(MediaEvent.ERROR, onMediaPlayerError);
				_videoPlayer.addEventListener(MediaEvent.SEEK, onMediaSeek);
				_videoPlayer.addEventListener(MediaEvent.PROGRESS, onMediaProgress);
				
			//	_videoPlayer.addEventListener(MediaEvent.BEGIN, onMediaBegin);
				
			}
			catch (err:Error)
			{
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: setupEventListeners error: "+err+"')");
				}    				
			}
		}
		private function onMediaProgress(event:MediaEvent):void 
		{ 
			try 
			{  
				if(debug) 
				{ 
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: OnMediaProgress Event')"); 
				}  
				if(!isStartEventSent){
					var eventStart:AnalyticEvent = new AnalyticEvent("start",pamCode);
					eventProcessor.addToQueue(eventStart);
					isStartEventSent =true;
				}
				if (!isJoinEventSent)
				{
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Join Event Complete')");
					}  
					
					isJoinEventSent = true;
					
					var now = new Date();
					var joinTimeEnd:uint = now.time;
					var joinTimeTotal:uint = joinTimeEnd - joinTimeBegin; 
					
					var eventJoin:AnalyticEvent = new AnalyticEvent("join",pamCode);
					eventJoin.setTime(event.position);
					eventJoin.setDuration(joinTimeTotal); 
					eventProcessor.addToQueue(eventJoin);
					firstTime = false;
				}
				if (!isPingRunning && isStartEventSent) 
				{  
					if (pingTimer == null || typeof(pingTimer) == undefined)  
					{ 
						pingTimer = new Timer(pamPingTime, 1); 
						pingTimer.addEventListener(TimerEvent.TIMER, _onPingTimer); 
					} 
					isPingRunning = true;  
					pingTimer.start();  
				} 
				
			} 
			catch(err:Error) 
			{ 
				if (debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: onMediaPlayerBegin Error: "+ err +"')"); }				 
			} 
		} 
		private function fetchAnalytics():void
		{
			if (debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: fetchAnalytics')"); }
			if ( isXMLGetted && ( pamCode != "" ) ) 
				return;
			
			var pamAnalyticsLoader:URLLoader = new URLLoader();
			pamAnalyticsLoader.load(new URLRequest(pamUrl));
			pamAnalyticsLoader.addEventListener(Event.COMPLETE, loadAnalytics);
		}
		
		private function loadAnalytics(event:Event):void
		{ 
			var xml:XML = new XML(event.target.data);
			testXML = xml;
						
			try 
			{ 
				// Level 3
				try
				{  
					if( cdnNodeData == true ) {
						if(debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Level 3 Headers Enabled')"); }
						var header :String = ExternalInterface.call(UtilsCNN.GET_CNN_INFO_METHOD,mediaResource);
						var response :Array = ExternalInterface.call(UtilsCNN.PARSE_L3_HEADER_METHOD,header,1);						 
						
						l3Host = response[0];
						l3Type = response[1];
						
						if(debug)
						{
							ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Level 3 Host: "+l3Host+"')");
							ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Level 3 Type: "+l3Type+"')");
						}
					}  
					else
					{
						if(debug)
						{
							ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Level 3 Headers Disabled')");
						}
					}
				} 
				catch (err:Error) 
				{  
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Level 3 Headers Error: "+ err +" ')");
					}
				} 
				 
				
				// Analytics
				try 
				{ 
					pamCode = xml.c;
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: loadAnalytics :: Analytics Enabled')");
					} 
				}
				catch (err:Error)
				{
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: loadAnalytics :: Analytics Disabled')");
					}    					
				}
				
				// Balancer
				try 
				{
					if (xml.b == 1)
					{ 
						if(debug)
						{
							ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: loadAnalytics :: Balancer Enabled')");
						}
						if(balanceEnabled == true)
						{
							balancerStart();
						}
					}
					else
					{
						balanceEnabled = false;
						if(debug)
						{
							ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: loadAnalytics :: Balancer Disabled')");
						}
						
					}
				}
				catch (err:Error)
				{
					balanceEnabled = false;
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: loadAnalytics :: Balancer Disabled')");
					}    					
				}
				
				// Host
				try 
				{ 
					var protocol:String = "http://"; 
					if(this.httpSecure==true){ 
						protocol="https://"; 
					}
					pamBufferUnderrunUrl = protocol+xml.h+"/bufferUnderrun"; 
					pamJoinTimeUrl = protocol+xml.h+"/joinTime"; 
					pamStartUrl = protocol+xml.h+"/start"; 
					pamStopUrl = protocol+xml.h+"/stop"; 
					pamPauseUrl = protocol+xml.h+"/pause"; 
					pamResumeUrl = protocol+xml.h+"/resume"; 
					pamPingUrl = protocol+xml.h+"/ping"; 
					pamErrorUrl = protocol+xml.h+"/error";   
				}
				catch (err:Error)
				{
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: loadAnalytics :: Invalid Host')");
					}    					
				}
				 
				try 
				{ 
					if( resumeEnabled == true ) 
					{ 
						checkResumeStatus(); 
					}  
					
				} 
				catch (err:Error) 
				{  
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Resume Error: "+ err +" ')");
					}
				} 
				
				try { 
					
					if( concurrencyEnabled == true ) {
						if(debug)
						{
							ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Concurrency Enabled')");
						}
						concurrencyInterval = setInterval(checkConcurrencyStatus,10000);
						checkConcurrencyStatus(); 
					}  
					else
					{
						if(debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Concurrency Disabled')");	}				
					}
				} 
				catch (err:Error) 
				{  
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Concurrency Error: "+ err +" ')");
					}
				} 
				
				var pingTimeInMilliseconds:Number = Number(xml.pt) * 1000;
				pamPingTime = pingTimeInMilliseconds;
				
				if (pingTimer == null || typeof(pingTimer) == undefined) 
				{
					pingTimer = new Timer(pamPingTime, 1);
					pingTimer.addEventListener(TimerEvent.TIMER, _onPingTimer);
				}
				 
				setBandwidthTest(); 
				this.eventProcessor.startProcessor(); 
				isXMLGetted = true; 
			} 
			catch (error:Error) 
			{
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: loadAnalytics error: " + error + "')");
				}    
				
			}
		}
		public function onError() :void{ 
			if(debug) { 
				ExternalInterface.call("console.log('SmartPlugin :: SecurityError ')"); 
			}
		} 
		public function sendAnalytics(type:String, actPamCode:String, time:Number=0, duration:Number=0, errorCode:String="", bitrate:Number=0, resourceURLSended:String="", diffTimeLastPing:Number=0):void
		{

			var request:URLRequest;
			var loader:URLLoader = new URLLoader();
			var loaderTimeout:URLLoader = new URLLoader();
			loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onError); 

			
			if(debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: sendAnalytics :: "+type+"')"); }
			
			switch (type)
			{
				case "buffer":  
					
					request = new URLRequest(pamBufferUnderrunUrl+"?time="+time+"&duration="+duration+"&code="+escape(actPamCode)); 
					 
				break;
				
				case "join": 
					request = new URLRequest(pamJoinTimeUrl+"?eventTime="+time+"&time="+duration+"&code="+escape(actPamCode));					
				break;
				
				case "start":  
					if ( pamLastCode == actPamCode ) { return; }
					
					var pamPingTimeInSeconds:Number = 5;
					var windowLocation:String = "";
					try
					{
						updateAssetMetadata();
						windowLocation 			= ExternalInterface.call("window.location.href.toString");
						pamPingTimeInSeconds	= pamPingTime / 1000; 
					}
					catch (err:Error) 
					{

					} 
					var string:String = "";
					if ( extraparam1 != "" ) { string += "&extraparam1=" + extraparam1; }
					if ( extraparam2 != "" ) { string += "&extraparam2=" + extraparam2; }
					if ( extraparam3 != "" ) { string += "&extraparam3=" + extraparam3; }
					if ( extraparam4 != "" ) { string += "&extraparam4=" + extraparam4; }
					if ( extraparam5 != "" ) { string += "&extraparam5=" + extraparam5; }
					if ( extraparam6 != "" ) { string += "&extraparam6=" + extraparam6; }
					if ( extraparam7 != "" ) { string += "&extraparam7=" + extraparam7; }
					if ( extraparam8 != "" ) { string += "&extraparam8=" + extraparam8; }
					if ( extraparam9 != "" ) { string += "&extraparam9=" + extraparam9; }
					if ( extraparam10 != "" ) { string += "&extraparam10=" + extraparam10; }
					
					if ( hashTitle != "" ) { string += "&hashTitle=" + hashTitle; }
					if ( cdn != "" ) { string += "&cdn=" + cdn; }
					if ( isp != "" ) { string += "&isp=" + isp; }
					if ( ip != "" ) { string += "&ip=" + ip; } 
					
					if ( l3Type != "" ) { string += "&nodeType=" + l3Type; } 
					if ( l3Host != "" ) { string += "&nodeHost=" + l3Host; } 
					if ( transaction != "" ) { string += "&transcode=" + transaction; } 
					
					stopResume = false;
					var randNumber:uint = uint(Math.random() * 100000);
					
					request = new URLRequest(pamStartUrl+"?system="+escape(accountCode)+"&user="+escape(username)+"&pluginVersion="+escape(pluginVersion)+
						"&pingTime="+pamPingTimeInSeconds+"&live="+live+"&totalBytes="+totalBytes+"&resource="+escape(videoAssetUrl)+"&referer="+escape(windowLocation)+
						"&properties="+properties+"&code="+escape(actPamCode)+"&isBalanced="+balancerExecuted+"&randomNumber="+randNumber+ "&duration="+ (_videoPlayer.getCurrentVideo().length / 1000) + "" + string); 
				break;

				case "stop":
					request = new URLRequest(pamStopUrl+"?code="+escape(actPamCode)+"&diffTime="+diffTimeLastPing);
				break;

				case "playTime":
					if (debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Sending playTime: "+ Math.round(Number(_videoPlayer.getVideoPosition()))  +"')"); }
					if(httpSecure){ 	 	
						playTimeService = playTimeService.split("//")[1];				 	 	
						playTimeService = "https://"+playTimeService; 	 	
					} 
					var urlDataWithCode:String = playTimeService + "?contentId=" + contentId +"&userId="  + username + "&playTime=" + Math.round(Number(_videoPlayer.getVideoPosition())) + "&random=" + Math.random();					
					request = new URLRequest(urlDataWithCode);
				break;
				
				case "playTimeStop":
					if (debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Sending playTime restart')"); }
					var urlDataWithCode2:String = playTimeService + "?contentId=" + contentId +"&userId="  + username + "&playTime=0&random=" + Math.random();					
					request = new URLRequest(urlDataWithCode2);
					break;
				case "pause":
					request = new URLRequest(pamPauseUrl+"?code="+escape(actPamCode));
				break;
				
				case "resume":
					request = new URLRequest(pamResumeUrl+"?code="+escape(actPamCode));	
				break;
				
				case "ping":
					var pamPingTimeInSecondsRevert:Number = pamPingTime / 1000;
					var resource_url:String = _videoPlayer.getCurrentVideo().FLVFullLengthURL.toString();
					var dataType:Number = 0;
					if (resource_url.indexOf("http://") == -1) { dataType = 1; }
					if ( bitrateType == "dto" ) { 
						request = new URLRequest(pamPingUrl+"?time="+_videoPlayer.getVideoPosition()+"&pingTime="+pamPingTimeInSecondsRevert+"&bitrate="+bitrate+
							"&code="+escape(actPamCode)+"&diffTime="+diffTimeLastPing);
					} else if ( bitrateType == "bytes" ) { 
						request = new URLRequest(pamPingUrl+"?time="+_videoPlayer.getVideoPosition()+"&pingTime="+pamPingTimeInSecondsRevert+"&totalBytes="+bitrate+
							"&dataType="+dataType+"&code="+escape(actPamCode)+"&diffTime="+diffTimeLastPing);
					}
					pingTimer.stop();
					pingTimer.reset();
					if (!loaderTimeout.hasEventListener(IOErrorEvent.IO_ERROR))
					{
						loaderTimeout.addEventListener(IOErrorEvent.IO_ERROR, retryPing);
					}
					if (!loaderTimeout.hasEventListener(Event.COMPLETE))
					{
						loaderTimeout.addEventListener(Event.COMPLETE, checkPingTimeResponse);
					}
				break;
				
				case "error":
					if (balanceEnabled == false) {
						var pamPingTimeInSeconds_error:Number = pamPingTime / 1000;
						var windowLocation_error:String = ""; 						
						try
						{
							windowLocation_error		= ExternalInterface.call("window.location.href.toString");
						}
						catch (err:Error) 
						{ 
							request = new URLRequest(pamErrorUrl+"?system="+escape(accountCode)+"&user="+escape(username)+"&pluginVersion="+escape(pluginVersion)+
								"&pingTime="+pamPingTimeInSeconds_error+"&live="+live+"&totalBytes="+totalBytes+"&resource="+escape(videoAssetUrl)+"&referer="+escape(windowLocation_error)+
								"&properties="+properties+"&errorCode="+escape(errorCode)+"&code="+escape(actPamCode)+"&diffTime="+diffTimeLastPing);
						} 
					}
					else
					{ 
						var result:Boolean = setNextBalancerUrl();
						if(result == false)
						{
							if(debug)
							{
								ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Balancer: no more resources')");
							}
							request = new URLRequest(pamErrorUrl+"?system="+escape(accountCode)+"&user="+escape(username)+"&pluginVersion="+escape(pluginVersion)+
								"&pingTime="+pamPingTimeInSeconds_error+"&live="+live+"&totalBytes="+totalBytes+"&resource="+escape(videoAssetUrl)+"&referer="+escape(windowLocation_error)+
								"&properties="+properties+"&errorCode="+escape(errorCode)+"&code="+escape(actPamCode)+"&diffTime="+diffTimeLastPing);
						} else {
							try { 
								_menuModule.closeMenuPage(); 
								_videoPlayer.removeUserMessage();
							} 
							catch(e:Error) 
							{
								if(debug)
								{
									ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Error closing menu: "+e+"')");
								}
							}
							_videoPlayer.stop();
							return;
						}
					}
				break;
			}
			request.method = URLRequestMethod.GET;
			if (type != "ping"){ loader.load(request); } else { loaderTimeout.load(request);  }
		} 
		
		private function restartAnalytics():void
		{
			isStartEventSent	= false;
			isStopEventSent		= true;
			isJoinEventSent 	= false;
			isPauseEventSent 	= false;
			isPingRunning 		= false;
			stopResume 			= true;
			updateCode();
		}
		
		private function updateCode():void
		{
			
			playCounter++;
			var actualPamCode:String = pamCode;
			var eventResume:AnalyticEvent = new AnalyticEvent("playTimeStop",actualPamCode);
			eventProcessor.addToQueue(eventResume);
			
			isXMLGetted = false;
			var now:Date = new Date();
			lastPingTime = now.time;
			pamCode = pamCode+"_"+playCounter;
			//pamUrl = service + "/data?system="+accountCode+"&pluginVersion="+pluginVersion+"&targetDevice="+targetDevice+"&output=xml";
			//fetchAnalytics();
			
			
		}
		
		private function retryPing(event:Event):void
		{ 
			pingTimer.start();
		}
		
		private function checkPingTimeResponse(event:Event):void
		{ 
			pingTimer.start();
		}
		
		private function _onPingTimer(event:TimerEvent):void
		{ 
			try
			{	
				
				var nowDate:Date			= new Date();
				var actPingTime:Number		= nowDate.time;
				var diffTimePing:Number 	= actPingTime - lastPingTime;
				
				if ( diffTimePing > 60000 )
					diffTimePing = 60000;
				
				if ( diffTimePing < 0 )
					diffTimePing = 5000;

				var eventPing:AnalyticEvent = new AnalyticEvent("ping",pamCode);
				eventPing.setTime(0);
				eventPing.setDuration(0);
				eventPing.setErrorCode("");
				eventPing.setBitrate(getCurrentBitrate());
				eventPing.setDiffTimePing(diffTimePing);
				lastPingTime = actPingTime;
				eventProcessor.addToQueue(eventPing);
				
				if (debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: sendPing ')"); }
			}
			catch (err:Error) 
			{
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: _onPingTimer error: "+err+"')");
				}
			}
			
		}
		
		private function _onBdTestTimer(event:TimerEvent):void
		{
			bwtest = new BandwidthProcess("nice264-analytics-plugin", pamUrl, testXML);
			bwtest.init();
		}
		 
		private function setBandwidthTest():void
		{ 
			if (bdtest > 0)
			{ 
				if (bdtestTimer == null || typeof(bdtestTimer) == undefined)  
				{
					var bdtestTime:Number = bdtest * 60 * 1000; 
					bdtestTimer = new Timer(bdtestTime);
					bdtestTimer.addEventListener(TimerEvent.TIMER, _onBdTestTimer);
					bdtestTimer.start();
				}
				bwtest = new BandwidthProcess("nice264-analytics-plugin", pamUrl, testXML);
				bwtest.init();
			}
		}
		
		// Bitrate
		private function getCurrentBitrate():Number
		{ 
			currentBitrate = 0;			
			try
			{
				var hasRenditions:RenditionAssetDTO = _videoPlayer.getCurrentRendition();
				if ( hasRenditions != null )
				{
					bitrateType 	= "dto";
					currentBitrate 	= _videoPlayer.getCurrentRendition().encodingRate;
				} 
				else 
				{
					bitrateType 	= "bytes";
					currentBitrate 	= _videoPlayer.getVideoBytesLoaded();
					totalBytes 		= currentBitrate;
				}
			}
			catch (err:Error) 
			{
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: getCurrentBitrate error: "+err+"')");
				} 
			}			
			return currentBitrate;
		}
		 
		private function onMediaPlayerBegin(event:MediaEvent):void
		{
			try
			{
				isBalancing == false;
				
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Player Begin Event , isStartEventSent "+isStartEventSent+"')");
				} 
				playerCurrentTime = event.position;			 
				if (resumeEnabled == true) { 
					if(resumeMovetoSecs > 0) 
					{
						if (debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Moving to last resume position: "+ resumeMovetoSecs +"s')"); }
						_videoPlayer.seek(resumeMovetoSecs); 
						resumeMovetoSecs = 0;
					}
					sendResumeStatus(); 
				}
			}
			catch(err:Error)
			{
				if (debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: onMediaPlayerBegin Error: "+ err +"')"); }				
			}
		}
		
		private function onMediaSeek(event:MediaEvent):void 
		{ 
			try 
			{  
				if(debug) 
				{ 
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Seeking Event')"); 
				}  
				if (isSeeking == false) { 
					isSeeking = true; 
				} 
			} 
			catch(err:Error) 
			{ 
				if (debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: onMediaPlayerBegin Error: "+ err +"')"); }				 
			} 
		} 
		private function onMediaPlayerPlay(event:MediaEvent):void
		{ 
			try
			{ 
				currentPosition = event.position;
				currentDuration = event.duration; 
				
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Player Event')");
				} 
				
				if (!isStartEventSent && !isBalancing)
				{ 
					isStartEventSent = true;
					
					now = new Date();
					lastPingTime = now.time; 
					
					var eventStart:AnalyticEvent = new AnalyticEvent("start",pamCode);
					
					eventProcessor.addToQueue(eventStart);
					
					isStopEventSent = false; 
				}
				
				if (!isJoinEventSent)
				{ 
					var now:Date = new Date();
					joinTimeBegin = now.time;
					if(firstTime == false)
					{  
						isJoinEventSent = true; 
						var joinTimeTotal:uint = 100; 
						
						var eventJoin:AnalyticEvent = new AnalyticEvent("join",pamCode);
						eventJoin.setTime(event.position);
						eventJoin.setDuration(joinTimeTotal); 
						eventProcessor.addToQueue(eventJoin);  
						
						if(debug)
						{
							ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Join Event Complete')");
						}  
					}
				}
				
				if (isPauseEventSent)
				{ 
					isPauseEventSent = false;
					var eventResume:AnalyticEvent = new AnalyticEvent("resume",pamCode);
					eventProcessor.addToQueue(eventResume); 
				}
				try{
					if (!isPingRunning && isStartEventSent) 
					{  
						if (pingTimer == null || typeof(pingTimer) == undefined)  
						{ 
							pingTimer = new Timer(pamPingTime, 1); 
							pingTimer.addEventListener(TimerEvent.TIMER, _onPingTimer); 
						} 
						isPingRunning = true;  
						pingTimer.start();  
					} 
				} 
				
			catch(err:Error) 
			{ 
				if (debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: onMediaPlayerPlay TIMER ERROR 3: "+ pingTimer +"')"); }	
			}
			}
			catch(err:Error)
			{
				if (debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: onMediaPlayerPlay Error: "+ err +"')"); }				
			}
		}
		
		private function onMediaPlayerBufferBegin(event:MediaEvent):void
		{
			if (debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: onMediaPlayerBufferBegin')"); }
			try
			{
				currentPosition = event.position;
				currentDuration = event.duration;
				
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Buffering Event')");
				}  
				
				var now:Date = new Date();
				bufferTimeBegin = now.time;
			}
			catch(err:Error)
			{
				ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: onMediaPlayerBufferBegin Error: "+ err +"')");				
			}
		}
		
		private function onMediaPlayerBufferComplete(event:MediaEvent):void
		{
			if (debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: onMediaPlayerBufferComplete')"); }
			
			try 
			{
				currentPosition = event.position;
				currentDuration = event.duration;
				var now:Date = new Date(); 
				if (!isJoinEventSent && isStartEventSent)
				{
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Join Event Complete')");
					}  
					
					isJoinEventSent = true;
					
					now = new Date();
					var joinTimeEnd:uint = now.time;
					var joinTimeTotal:uint = joinTimeEnd - joinTimeBegin; 
					
					var eventJoin:AnalyticEvent = new AnalyticEvent("join",pamCode);
					eventJoin.setTime(event.position);
					eventJoin.setDuration(joinTimeTotal); 
					eventProcessor.addToQueue(eventJoin);
					firstTime = false;
				}
				else
				{  
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Buffer Event Complete')");
					}  
					if(!isSeeking){
						now = new Date();
						var bufferTimeEnd:uint = now.time;
						var bufferUnderrunTime:uint = bufferTimeEnd - bufferTimeBegin; 
						
						var eventBuffer:AnalyticEvent = new AnalyticEvent("buffer",pamCode);
						eventBuffer.setTime(event.position);
						eventBuffer.setDuration(bufferUnderrunTime);
						
						eventProcessor.addToQueue(eventBuffer);
					}
				}
			}
			catch(err:Error)
			{
				if (debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: onMediaPlayerBufferComplete Error: "+ err +"')"); }				
			}
			isSeeking=false;
		}
		 
		private function onMediaPlayerStop(event:MediaEvent):void
		{	
			if (debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: onMediaPlayerStop')"); }	
			try
			{
				currentPosition = event.position;
				currentDuration = event.duration; 
				var actualPamCode:String = pamCode;
				if ( currentPosition >= currentDuration )
				{
					try
					{
						isStopEventSent = true;  
						
						var nowDate:Date			= new Date();
						var actPingTime:Number		= nowDate.time;
						var diffTimePing:Number 	= actPingTime - lastPingTime;
						var eventStop:AnalyticEvent = new AnalyticEvent("stop",actualPamCode);
						eventStop.setDiffTimePing(diffTimePing);						
						eventProcessor.addToQueue(eventStop);		
						
						restartAnalytics();
						
						pingTimer.stop();
						pingTimer.reset();
						lastPingTime = actPingTime;
						
						if(debug)
						{
							ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Stop Event')");
						}
						 
					}
					catch (e:Error)
					{
						if(debug)
						{
							trace(e);
							ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Stop Event Error: "+e+"')");
						}  					
					}
				}
				else
				{
					if ( isStartEventSent )
					{
						if (!isPauseEventSent)
						{
							isPauseEventSent = true;
							var eventPause:AnalyticEvent = new AnalyticEvent("pause",actualPamCode);
							if(debug)
							{
								ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Pause Event')");
							}
							eventProcessor.addToQueue(eventPause);
						}
					}
				}
			}
			catch(err:Error)
			{
				ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: onMediaPlayerStop Error: "+ err +"')");				
			}
		}
		
		private function onMediaPlayerChange(event:MediaEvent):void
		{
			try
			{ 
				if(balanceEnabled == false || isBalancing == false)
				{
					if(debug)
					{
						ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: Change Event')");
					}   
				}
				
				firstTime = true;
			}
			catch(err:Error)
			{
				if (debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: onMediaPlayerChange Error: "+ err +"')"); }				
			}
		}

		private function onMediaPlayerError(event:MediaEvent):void
		{
			try
			{
				currentPosition = event.position;
				currentDuration = event.duration;
				
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: onMediaPlayerError Event')");
				}   
				
				if(balanceEnabled == false)
				{
					
					var actualPamCode:String = pamCode;
					
					var nowDate:Date			= new Date();
					var actPingTime:Number		= nowDate.time;
					var diffTimePing:Number 	= actPingTime - lastPingTime; 
					
					var eventError:AnalyticEvent = new AnalyticEvent("error",actualPamCode);
					eventError.setTime(0);
					eventError.setDuration(0);
					switch (event.code) {  
						case 'DOMAIN_RESTRICTED': 
							eventError.setErrorCode("2011"); 
						break; 
						case 'GEO_RESTRICTED': 
							eventError.setErrorCode("2012"); 
						break; 
						case 'INVALID_ID': 
							eventError.setErrorCode("2013"); 
						break; 
						case 'NO_CONTENT': 
							eventError.setErrorCode("2014"); 
						break; 
						case 'PE_COMPONENT_CORRUPTED': 
							eventError.setErrorCode("2015"); 
						break; 
						case 'PE_LIVE_UNPUBLISHED': 
							eventError.setErrorCode("2016"); 
						break; 
						case 'PE_REQUIRED_COMPONENT': 
							eventError.setErrorCode("2017"); 
						break; 
						case 'PE_REQUIRED_COMPONENT_CORRUPTED': 
							eventError.setErrorCode("2018"); 
						break; 
						case 'SERVICE_UNAVAILABLE': 
							eventError.setErrorCode("2019"); 
						break; 
						case 'SERVICE_UNAVAILABLE': 
							eventError.setErrorCode("2019"); 
						break; 
						case 'UNAVAILABLE_CONTENT': 
							eventError.setErrorCode("2020"); 
						break; 
						case 'UNKNOWN': 
							eventError.setErrorCode("2021"); 
						break; 
						case 'UPGRADE_REQUIRED_FOR_PLAYER': 
							eventError.setErrorCode("2022"); 
						break; 
						case 'UPGRADE_REQUIRED_FOR_VIDEO': 
							eventError.setErrorCode("2023"); 
						break; 
						case 'VE_FMS_CONNECT_FAILED': 
							eventError.setErrorCode("2024"); 
						break; 
						case 'VE_FMS_NOTFOUND': 
							eventError.setErrorCode("2025"); 
						break; 
						case 'VE_PD_NOTFOUND': 
							eventError.setErrorCode("2026");	 
						break; 
						case 'VS_RESTRICT_INACTIVE': 
							eventError.setErrorCode("2027");	 
						break; 
						case 'VS_RESTRICT_SCHEDULED': 
							eventError.setErrorCode("2028");	 
						break; 
						case 'VS_SECURITY_VID': 
							eventError.setErrorCode("2029");	 
						break;  
						default: 
							eventError.setErrorCode("2021");	 
						break; 
					}  
					eventError.setBitrate(0);
					eventError.setDiffTimePing(diffTimePing); 
					eventProcessor.addToQueue(eventError); 
					
					pingTimer.stop();
					pingTimer.reset(); 
					
					var eventStop:AnalyticEvent = new AnalyticEvent("stop",actualPamCode);
					eventStop.setDiffTimePing(diffTimePing); 
					eventProcessor.addToQueue(eventStop);
					isStopEventSent = true; 
					lastPingTime = actPingTime; 
					restartAnalytics();
					var requestError1:URLRequest = new URLRequest(pamErrorUrl+"?errorCode=3001&message=PLAY_FAILURE");
					var errorLoader1:URLLoader = new URLLoader();
					errorLoader1.load(requestError1);
				}
				else
				{ 
					if(setNextBalancerUrl())
					{ 
						isBalancing == true;
						if (debug) 
						{
							ExternalInterface.call("console.log('SmartPlugin :: Balancer :: Going to next url cause stream error...')");
						}				
					} 
					else
					{
						if (debug) 
						{
							ExternalInterface.call("console.log('SmartPlugin :: Balancer :: Failed to play next balanced resource...')");
						}	 
						isBalancing == false;
						var counter2:Number = balancerIndex-1;
						var requestError:URLRequest = new URLRequest(pamErrorUrl+"?errorCode=1310"+ counter2 +"&message=BALANCING_PLAY_FAILURE&code=" + pamCode); 
						var errorLoader:URLLoader = new URLLoader();
						errorLoader.load(requestError);
						balanceEnabled = false; 
						onMediaPlayerError(event);
					}	
				}
			}
			catch(err:Error)
			{
				if (debug) { ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: onMediaPlayerError Error: "+ err +"')"); }				
			}
		}
		
		private function updateAssetMetadata():void
		{	
			try
			{
				var videoAsset:VideoDTO = _videoPlayer.getCurrentVideo(); 
				videoAssetCaptions = videoAsset.captions;
				videoAssetCustomFields = videoAsset.customFields; 
				videoAssetDisplayName = videoAsset.displayName;
				videoAssetEconomics = videoAsset.economics;
				videoAssetEncodignRate = videoAsset.encodingRate;
				videoAssetEndDate = videoAsset.endDate;
				videoAssetCodec = videoAsset.FLVFullCodec;
				videoAssetStreamed = videoAsset.FLVFullLengthStreamed;
				videoAssetUrl = videoAsset.FLVFullLengthURL;
				videoAssetSize = videoAsset.FLVFullSize;
				videoAssetAds = videoAsset.forceAds;
				videoAssetID = videoAsset.id;
				videoAssetLength = videoAsset.length;
				videoAssetLineupID = videoAsset.lineupId;
				videoAssetLinkText = videoAsset.linkText;
				videoAssetLinkUrl = videoAsset.linkURL;
				videoAssetDescription = videoAsset.longDescription;
				videoAssetPubDate = videoAsset.publishedDate
				videoAssetPubID = videoAsset.publisherId;
				videoAssetRefID = videoAsset.referenceId;
				videoAssetRenditions = videoAsset.renditions;
				videoAssetSharedBy = videoAsset.sharedBy;
				videoAssetShortDescription = videoAsset.shortDescription;
				videoAssetStartDate = videoAsset.startDate;
				videoAssetTags = videoAsset.tags;
				videoAssetThumbnail = videoAsset.thumbnailURL;
				videoAssetStillVideo = videoAsset.videoStillURL;
			}
			catch ( e:Error )
			{
				if(debug)
				{
					ExternalInterface.call("console.log('SmartPlugin :: BRIGHTCOVE :: updateAssetMetadata error: "+e+"')");
				}   
			}
			
		}
		
		// Metadata
		private var videoAssetCaptions:Array;
		private var videoAssetCustomFields:Object; 
		private var videoAssetDisplayName:String;
		private var videoAssetEconomics:Number;
		private var videoAssetEncodignRate:Number;
		private var videoAssetEndDate:BrightcoveDateDTO;
		private var videoAssetCodec:Number;
		private var videoAssetStreamed:Boolean;
		private var videoAssetUrl:String;
		private var videoAssetSize:Number;
		private var videoAssetAds:Boolean;
		private var videoAssetID:Number;
		private var videoAssetLength:Number;
		private var videoAssetLineupID:Number;
		private var videoAssetLinkText:String;
		private var videoAssetLinkUrl:String;
		private var videoAssetDescription:String;
		private var videoAssetPubDate:Date;
		private var videoAssetPubID:Number;
		private var videoAssetRefID:String;
		private var videoAssetRenditions:Array;
		private var videoAssetSharedBy:Number;
		private var videoAssetShortDescription:String;
		private var videoAssetStartDate:BrightcoveDateDTO;
		private var videoAssetTags:Array;
		private var videoAssetThumbnail:String;
		private var videoAssetStillVideo:String;
	}
}
