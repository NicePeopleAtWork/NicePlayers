package com.nice {
	
	import com.nice.BandwidthChecker;
	
	import flash.display.*;
	import flash.display.MovieClip;
	import flash.events.*;
	import flash.events.Event;
	import flash.external.ExternalInterface;
	import flash.net.*;
	
	public class BandwidthProcess extends EventDispatcher {
		
		private var testUrl:String = "";
		private var testFile : String = "path/to/your/image.jpg";
		private var bandwidth:String;
		private var niceXML:XML;
		private var count:Number = 0;
		private var countLatency:Number = 0;
		private var bandWidthCheckerVector:Vector.<BandwidthChecker>;
		private var concurrency:Number = 0;
		private var completed:Number = 0;
		private var resultfileCode:Vector.<String>;
		private var resultCdnCode:Vector.<String>;
		private var resultConcurrency:Vector.<Number>;
		private var resultBandwidth:Vector.<Number>;
		private var actualBandWidthDetected:Number;
		private var bandWidthLatencyVector:Vector.<BandwidthChecker>;
		private var latencies:Vector.<Number>;
		
		private var minLatencies:Number = 9;
		
		private var minPing:Number = 10000;
		private var myIp:String = "";
		private var system_code:String;
		
	
		private var lastLoader:URLLoader;

		public function BandwidthProcess(system_code:String, pamUrl:String, testXML:XML) {
			this.system_code = system_code;
			this.testUrl = pamUrl;
			this.niceXML = testXML;
			
			super();	
		}
		
		public function reset():void{
			count = 0;
			countLatency = 0;
			concurrency = 0;
			completed = 0;
		}
		
		public function init():void{
			handleVariables();
			
			// TODO: delete
			// OLD WAY of retrieving test XML
			/*var request:URLRequest = new URLRequest(testUrl);
			var loader:URLLoader = new URLLoader();  		
			loader.addEventListener(Event.COMPLETE, handleVariables);
			loader.load(request);*/
		}
		

		private function handleVariables():void{
			var i:Number = 0;
			
			if (niceXML.t.test.length() > 0){ // niceXML.tests.test.length() > 0 -> replace "tests" with "t"
				ExternalInterface.call("console.log('****** BandwidthProcess -> test is enabled')");
				
				niceXML.t.test.length() 
				
				resultfileCode = new Vector.<String>(niceXML.t.test.length());
				resultCdnCode = new Vector.<String>(niceXML.t.test.length());
				resultConcurrency = new Vector.<Number>(niceXML.t.test.length());
				resultBandwidth = new Vector.<Number>(niceXML.t.test.length());	
				
				latencies = new Vector.<Number>( niceXML.t.test.length() );	
				
				this.concurrency = new Number( this.niceXML.t.test[count].files.file.length() );
				
				bandWidthLatencyVector = new Vector.<BandwidthChecker>( this.concurrency );	
				bandWidthCheckerVector = new Vector.<BandwidthChecker>( this.concurrency );
				
				this.parallelLatency( );
			} else {
				ExternalInterface.call("console.log('****** BandwidthProcess -> test is disabled')");
			}
		}
		
		// TODO: delete
		// OLD WAY of handling test XML
		/*private function handleVariables(e:Event):void{
			
			niceXML = new XML(e.target.data);
		
			var i:Number = 0;
			
			if (niceXML.tests.test.length() > 0){
				ExternalInterface.call("console.log('****** BandwidthProcess -> test is enabled')");
				
				niceXML.tests.test.length() 
				
				resultfileCode = new Vector.<String>(niceXML.tests.test.length());
				resultCdnCode = new Vector.<String>(niceXML.tests.test.length());
				resultConcurrency = new Vector.<Number>(niceXML.tests.test.length());
				resultBandwidth = new Vector.<Number>(niceXML.tests.test.length());	
				
				latencies = new Vector.<Number>( niceXML.tests.test.length() );	
				
				this.concurrency = new Number( this.niceXML.tests.test[count].files.file.length() );
				
				bandWidthLatencyVector = new Vector.<BandwidthChecker>( this.concurrency );	
				bandWidthCheckerVector = new Vector.<BandwidthChecker>( this.concurrency );
				
				this.parallelLatency( );
			} else {
				ExternalInterface.call("console.log('****** BandwidthProces -> test is disabled')");
			}
		}*/
		
		private function parallelLatency():void{
			
				this.calculateLatency( countLatency );
		}
		
		private function parallelBandwidth():void{
			
			var i:Number = 0;
			
			resultfileCode[count] = this.niceXML.tests.test[count].fileCode.text();
			resultCdnCode[count] =  this.niceXML.tests.test[count].cdnCode.text();
			//resultConcurrency[count] = new Number( this.niceXML.tests.test[count].concurrency.text() );
			
			for( i = 0; i < this.concurrency ; i++ ){
				this.getBandwidth( i, count );
			}
		     
			this.count++;
			if(this.niceXML.tests.test[count] != undefined){
				this.concurrency = new Number( this.niceXML.tests.test[count].files.file.length() );
			}
		}
		
		
		private function calculateLatency(globalElement:Number ):void{
		
			bandWidthLatencyVector[globalElement] = new BandwidthChecker();
			bandWidthLatencyVector[globalElement].addEventListener( Event.COMPLETE, this.onLatencyCheckNext, false, 0, false );
			bandWidthLatencyVector[globalElement].check( this.niceXML.tests.test[globalElement].latencyFile.text(),0,globalElement );
			
		}
		
		private function onLatencyCheckNext (event : Event):void{
			latencies[countLatency] = bandWidthLatencyVector[countLatency].getTimeMillis()/1000;
			if ( latencies[countLatency]<minPing ){
				
				minPing = latencies[countLatency];
			}
			
			minLatencies --;
			
			if(minLatencies!=0){
				parallelLatency();
			}else{
				this.onLatencyCheckComplete();
			}
		}
		
		private function onLatencyCheckComplete() : void {
			
			
			minLatencies = 7;
			countLatency++;
			if( niceXML.tests.test.length() > countLatency ){
				parallelLatency();
			}else{
				this.dispatchEvent( new Event(Event.CONNECT) );
				this.parallelBandwidth();
			}
			
		}
		
		
		
		private function getBandwidth( element:Number,globalElement:Number ):void{
			bandWidthCheckerVector[element] = new BandwidthChecker();
			bandWidthCheckerVector[element].addEventListener( Event.COMPLETE, this.onBandwidthCheckComplete, false, 0, false );
			bandWidthCheckerVector[element].check( this.niceXML.tests.test[globalElement].files.file[element].text(),element,globalElement );
		} 
		
			
		private function onCheckNext():void{
			
		}
		
		private function onBandwidthCheckComplete(event : Event) : void {

			completed++;
			
			if( completed == concurrency ){
				concurrencyTest();
			}else{
				
				calculateConcurrency();
			}
		
		}
		
		private function calculateConcurrency():Number{
			var i:Number = 0;
			var startTime:uint = bandWidthCheckerVector[0].getStartTime();
			var endTime:uint = bandWidthCheckerVector[0].getStartTime();
			var totalBytes:uint = 0;
			var bandwidthSpeedDetected:Number;
			
			for( i=0; i<this.concurrency; i++ ){
				if( bandWidthCheckerVector[i].getStartTime() < startTime )
					startTime = bandWidthCheckerVector[i].getStartTime();
			}
			
			for( i=0; i<this.concurrency; i++ ){
				if( bandWidthCheckerVector[i].getEndTime() > endTime )
					endTime = bandWidthCheckerVector[i].getEndTime();
			}
			
			for( i=0; i<this.concurrency; i++ ){
				totalBytes = totalBytes + bandWidthCheckerVector[i].getTotalBytes();
			}
			
			var time : Number = ( endTime - startTime ) / 1000;
			time = time - latencies[count-1];
			
			bandwidthSpeedDetected = Math.round(( totalBytes / 1024 * 8 ) / time);
			
			this.actualBandWidthDetected = bandwidthSpeedDetected;
			this.dispatchEvent( new Event(Event.CHANGE) );
			
			return bandwidthSpeedDetected;
		}
		
		private function concurrencyTest() : void {
			
			
			resultBandwidth[count-1] = calculateConcurrency();
			// Execute the next one
			
			if( niceXML.tests.test.length() >count ){
				this.completed = 0;
				parallelBandwidth();
			}else{
				this.sendInfo();
				this.dispatchEvent( new Event(Event.COMPLETE) );
			}			

		}
		
		
		private function sendInfo():void{
			for (var i:Number=0; i<niceXML.tests.test.length(); i++){
				var request:URLRequest = new URLRequest( niceXML.trackingUrl.text()+"?ping="+latencies[i]+"&concurrency="+resultConcurrency[i]+"&cdncode="+resultCdnCode[i]+"&bandWidth="+(resultBandwidth[i]/1000)+"&fileCode="+resultfileCode[i]+"&randCaching="+randomNumber(0,999999)+"&system="+this.system_code);
				lastLoader = new URLLoader();  
				request.method = URLRequestMethod.GET;
				lastLoader.load(request);
			}
		}
		
		public function getActualBandWidth():Number{
			return actualBandWidthDetected/10;
		}
		
		
		private function randomNumber(low:Number, high:Number):Number
		{
			return Math.floor(Math.random() * (1+high-low)) + low;
		}
		
		public function getMinPing():Number{
			return this.minPing*1000;
		}
	}
}