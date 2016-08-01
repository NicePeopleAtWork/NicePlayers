/*
 * YouboraConsole 
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Lluis Campos
 * Version: 1.0.0 
 */
var alert = function(txt) {
  try
  {
      var time = new Date();
      var timeStamp = "[" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() +"] [ALERT] ";
      var xmlhttp;
      if (window.XMLHttpRequest) { xmlhttp=new XMLHttpRequest(); }
      else { xmlhttp=new ActiveXObject("Microsoft.XMLHTTP"); }
      xmlhttp.open( "GET", "http://192.168.2.49/smarttv/PS3/TotalChannel/test.php?test=" + encodeURIComponent(timeStamp) + " > " +encodeURIComponent(txt));
      xmlhttp.send();
  }
  catch (err) 
  {
       console.log('Alert Error:' + err)  
  }
} 
var console = 
{ 
   log: function(txt) 
   {
       try
       {
           var time = new Date();
           var timeStamp = "[" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() +"] [LOG]";
           var xmlhttp;
           if (window.XMLHttpRequest) { xmlhttp=new XMLHttpRequest(); }
           else { xmlhttp=new ActiveXObject("Microsoft.XMLHTTP"); }
           xmlhttp.open( "GET", "http://192.168.2.49/smarttv/PS3/TotalChannel/test.php?test=" + encodeURIComponent(timeStamp) + " > " + encodeURIComponent(txt));
           xmlhttp.send();
       }
       catch (err)
       {
           console.log('Console Error:' + err) 
       } 
   }
}   
