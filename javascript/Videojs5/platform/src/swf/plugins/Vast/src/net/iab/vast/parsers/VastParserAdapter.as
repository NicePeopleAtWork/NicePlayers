package net.iab.vast.parsers
{
	import com.theplatform.pdk.utils.PdkStringUtils;
	
	import flash.errors.IllegalOperationError;
	
	import net.iab.vast.data.*;

//will keep this as a static class (for now), uses strategy pattern to determine which parser to use
	public class VastParserAdapter
	{

        public static const VAST1:String = "VAST1.0";
        public static const VAST2:String = "VAST2.0";

        private static var _instance:IVastParser;

        private static function getVersion(vast:String):String
        {
            XML.ignoreWhitespace = true;
			var vastXml:XML = new XML(vast);
            

            if (vastXml.name()=="VAST")
                return VastParserAdapter.VAST2;
            else if (vastXml.name()=="VideoAdServingTemplate")
                return VastParserAdapter.VAST1;
            else
                return null;

        }


        private static function getParser(vast:String):IVastParser
        {
            var feedversion:String=getVersion(vast);

            if (feedversion==VastParserAdapter.VAST1)
            {                
               return Vast1XmlParser.getInstance();
            }
            else if (feedversion==VastParserAdapter.VAST2)
            {
                // VAST 3 is backwards compatible w/ 2, and many ad providers say they're 2.0 but include 3.0 features...
               return Vast3XmlParser.getInstance();
            }
            else
                throw new IllegalOperationError("XML is not valid VAST 1.0 or 2.0")
        }

		public static function parse(vast:String):VideoAdServingTemplate
		{
			
            return getParser(vast).parse(vast);
		}

		
	}
}