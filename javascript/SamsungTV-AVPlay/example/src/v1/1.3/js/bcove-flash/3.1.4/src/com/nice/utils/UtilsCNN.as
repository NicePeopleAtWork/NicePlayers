package com.nice.utils
{
	public class UtilsCNN
	{
		public static var GET_CNN_INFO_METHOD : String = 
		"function getLevel3Header(resource)"+
        "{"+ 
        "        var context = this;"+
		"        var returnVal =''; "+
        "        if (resource.length>0)"+
        "        {"+ 
       
        "                var xmlHttp = new XMLHttpRequest();"+   
        "                xmlHttp.context = this; "+    
		"                xmlHttp.addEventListener('load', function(httpEvent) { "+   
        "                    try {"+
        "                        var header = httpEvent.target.getResponseHeader('X-WR-DIAG').toString(); "+ 
		"						 returnVal=header;"+
       // "                        returnVal = this.context.parseL3Header(header , 1);"+
        "                    }"+
        "                    catch (e)"+
        "                    {"+
        //"                        returnVal =  [false,false]; "+
        "                    }"+
        "                }, false);" +
        "                xmlHttp.open('head', resource, false);"+  
        "                xmlHttp.setRequestHeader('X-WR-Diag','host');"+ 
        "                xmlHttp.send();"+ 
        "        }"+ 
        "        return returnVal;"+          
        "}";
		public static var PARSE_L3_HEADER_METHOD : String = 
		"function parseL3Header( header , obj )"+
        "{"+
        "    var l3types = {"+
        "    UNKNOWN:        0,"+
        "    TCP_HIT:        1,"+
        "    TCP_MISS:       2,"+
        "    TCP_MEM_HIT:    3,"+
        "    TCP_IMS_HIT:    4 "+
        "    };"+
        "    var host='';"+
        "    var type='';"+
        "    var l3Response = header;"+
        "    try "+
        "    {"+
        "        l3Response = l3Response.split(' ');"+
        "        l3Response.host = l3Response[0].replace('Host:','');"+
        "        l3Response.type = l3Response[1].replace('Type:',''); "+
        "        if      ( l3Response.type == 'TCP_HIT' )        { l3Response.type = l3types.TCP_HIT; }"+
        "        else if ( l3Response.type == 'TCP_MISS' )       { l3Response.type = l3types.TCP_MISS; }"+
        "        else if ( l3Response.type == 'TCP_MEM_HIT' )    { l3Response.type = l3types.TCP_MEM_HIT; }"+
        "        else "+
        "        {"+
        "            l3Response.type = l3types.UNKNOWN;"+
        "        }"+
        "        return [l3Response.host,l3Response.type];"+
        "    }"+
        "    catch (e)"+
        "    {"+
        "        return [false,false];"+
        "    }"+
        "} ";
		
		public function UtilsCNN()
		{
		}
	}
}