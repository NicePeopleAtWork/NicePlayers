package com.theplatform.pdk.parsers
{
	import com.theplatform.pdk.data.Banner;
		
	public class HtmlCompanionAdParser
	{
		
		public static function parseCompanionAd(urlResponse:String, companion:Banner):Banner 
		{
			
			//find which type we are working with
			if(urlResponse.indexOf("dcadvurl") != -1){
				companion = parseJavascriptAdFormat(urlResponse, companion);
			}else {
				companion = parseHTMLAdFormat(urlResponse, companion);
			}
			
			return companion;
		}
		
		protected static function getHTMLAttribute(htmlString:String,attributeName:String):String{
			var htmlStr:String = htmlString+"";
			attributeName = " "+attributeName;
			
			//first find attribute, then the = sign, then the " or '
			var attStartIdx:int = htmlStr.indexOf(attributeName);
			if(attStartIdx == -1){
				return null;
			}
			htmlStr = htmlStr.substring(attStartIdx+attributeName.length,htmlStr.length);
			//now = sign
			attStartIdx = htmlStr.indexOf("=");
			if(attStartIdx == -1){
				return null;
			}
			htmlStr = htmlStr.substring(attStartIdx+1,htmlStr.length);
			
			//now quote
			var endQuote:String = '"';
			attStartIdx = htmlStr.indexOf(endQuote);
			if(attStartIdx == -1){
				endQuote = "'";
				attStartIdx = htmlStr.indexOf(endQuote);
			}
			if(attStartIdx == -1){//failure
				return null;
			}
			htmlStr = htmlStr.substring(attStartIdx+1,htmlStr.length);
			
			var attEndIdx:int = htmlStr.indexOf(endQuote);
			if(attEndIdx==-1){
				return null;
			}
			return htmlStr.substring(0,attEndIdx);
		}
		
		protected static function isolateHTMLTag(htmlStr:String,tagName:String):String{
			var urlResponse:String = htmlStr+"";
			
			var tagStartIdx:int = urlResponse.indexOf("<"+tagName);
		 	if(tagStartIdx == -1){
		 		return null;	
		 	}
		 	var endTag:String = "</"+tagName+">"
		 	var tagEndIdx:int = urlResponse.indexOf(endTag,tagStartIdx);
		 	if(tagEndIdx == -1){
		 		//try to just find ending >
		 		endTag = ">";
		 		tagEndIdx = urlResponse.indexOf(endTag,tagStartIdx);
		 	}
		 	if(tagEndIdx == -1){
		 		return null;
		 	}
		 	urlResponse = urlResponse.substring(tagStartIdx,tagEndIdx+endTag.length);
		 	
		 	return urlResponse;
		}
		
		protected static function parseHTMLAdFormat(urlResponse:String, companion:Banner):Banner 
		{
		 	var noScriptTag:String = isolateHTMLTag(urlResponse,"noscript");
		 	if(noScriptTag == null){
		 		noScriptTag = isolateHTMLTag(urlResponse,"NOSCRIPT");
		 	}
		 	if(noScriptTag == null){
		 		noScriptTag = urlResponse;
		 	}
		 	
		 	var aTagStr:String = isolateHTMLTag(noScriptTag,"a");
		 	if(aTagStr == null){
		 		aTagStr = isolateHTMLTag(noScriptTag,"A");
		 	}
		 	if(aTagStr == null){
		 		return companion;
		 	}
		 	
			var clickThru:String = getHTMLAttribute(aTagStr,"href");
			if(clickThru == null){
				clickThru = getHTMLAttribute(aTagStr,"HREF");
			}
			if(clickThru == null){
				return companion;
			}
			aTagStr = aTagStr.substring(aTagStr.indexOf(clickThru)+clickThru.length,aTagStr.length);
			
			var assetImageTag:String = isolateHTMLTag(aTagStr,"img");
			if(assetImageTag == null){
				assetImageTag = isolateHTMLTag(aTagStr,"IMG");
			}
			if(assetImageTag==null){
				return companion;
			}
			var assetURL:String = getHTMLAttribute(assetImageTag,"src");
			if(assetURL == null){
				assetURL = getHTMLAttribute(assetImageTag,"SRC"); 
			}
			if(assetURL==null){
				return companion;
			}
			
			companion.src = assetURL;
			companion.href = clickThru;
			
			//get tracking url
			noScriptTag = noScriptTag.substring(noScriptTag.indexOf(aTagStr)+aTagStr.length,noScriptTag.length);
			var impressionImageTag:String = isolateHTMLTag(noScriptTag,"img");
			if(impressionImageTag == null){
				impressionImageTag = isolateHTMLTag(noScriptTag,"IMG");
			}
			if(impressionImageTag == null){
				return companion;
			}
			var impressImgAtt:String = getHTMLAttribute(impressionImageTag,"src");
			if(impressImgAtt == null){
				impressImgAtt = getHTMLAttribute(impressionImageTag,"SRC");
			}
			if(impressImgAtt!=null){
				companion.impressionUrls = [impressImgAtt];
			}
			
			return companion;
		}
		
		protected static function parseJavascriptAdFormat(urlResponse:String, companion:Banner):Banner
		{
			var i:uint;
			var startHolder:Number = 0;
			var endHolder:Number;
			var offset:Number;
			var startSet:Number;
			var subString:Array = new Array(3);
			var endString:Array = new Array("\"","\"","\"");
			var startString:Array;
			var rebuildCT:Array = new Array("&CreateID","&PlaceID","&cpng=","&afid","&ref");//FOR REFFERENCE :: &CreateID=27360900&PlaceID=28498529&cpng=starwars&afid=d_g4&ref=tgt_adv_XCJX3258&
			
			 var tempResponseArray:Array = urlResponse.split("%0a");
			 urlResponse = tempResponseArray[0];
			 for(var ii:int=1; ii< tempResponseArray.length; ii++)
			 {
				 urlResponse = urlResponse.concat(tempResponseArray[ii]);
			 }
			 if(urlResponse.indexOf("IMG%20SRC") > -1)
			 {
				 urlResponse = urlResponse.split("IMG%20SRC").join("img%20src");
			 }
			 
			 if(urlResponse.indexOf("%20HREF") > -1)
			 {
				 urlResponse = urlResponse.split("%20HREF").join("%20href");
			 }
			
			 
			 
			 
			 urlResponse = unescape(urlResponse);
			 
			if(urlResponse.indexOf("var dcswf =") != -1)
			 {
				startString = ["var dcswf =","var dcgif =","var advurl ="];
				startSet = 2;
			 }
			 if (urlResponse.indexOf("var dcswf=") != -1)
			 {
				startString = ["var dcswf=","var dcgif=","var advurl="];
				startSet = 1;
			 }
				
			 
			 
			// trace("url response: "+urlResponse);
			 //companion.impressionURL = "http://www.responseTrace.com/ping.gif?"+urlResponse;
			
			 
		     for(i = 0; i<3; i++){
	 		  if(startString[i] != "null"){
				offset = startString[i].length;
		      	startHolder = urlResponse.indexOf(startString[i], (startHolder + 5)) + offset;			
	          	endHolder = urlResponse.indexOf(endString[i], (startHolder + 10));
			  }
			  if(startHolder >= offset){
	             subString[i] = urlResponse.slice((startHolder+startSet), endHolder);
			   }else if (startHolder < offset){ 
			   		subString[i] = subString[i-1];
			  }
			 }
			 var subString0:String =subString[0]; 
			 var subString1:String =subString[1]; 
			 var subString2:String =subString[2]; 
			
			 if(subString2!=null && subString2.indexOf("onLoad=[type Function") != -1){
				 endHolder = subString2.indexOf("&onLoad=[type Function");
				 subString2 = subString2.slice(0, endHolder);
				for(i = 0; i< rebuildCT.length; i++){ 
				 if(urlResponse.indexOf(rebuildCT[i]) != -1){
				  startHolder = urlResponse.indexOf(rebuildCT[i]);			
	          	  endHolder = urlResponse.indexOf("&", (startHolder + 3));
				  subString2 = subString2 + urlResponse.slice(startHolder, endHolder);
				 }
				}
				
			  }
			  
			companion.href = subString1;
			companion.src = subString2; 
			
			return companion;
		}
				
	}
}