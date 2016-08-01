package net.iab.vast.parsers
{
    import com.theplatform.pdk.utils.PdkStringUtils;
    import flash.errors.IllegalOperationError;
    import net.iab.vast.data.*;

    public class Vast3XmlParser extends Vast2XmlParser implements IVastParser
    {

        protected static var _instance:IVastParser;

        public function Vast3XmlParser(pvt:Object = null)
        {

            super(this);

            if (!pvt || (pvt != this && !(pvt is Vast3Pvt)))
            {
                throw new IllegalOperationError("Vast3Parser constructor can not be called directly")
            }

        }

        public static function getInstance():IVastParser
        {
            if (_instance)
                return _instance;
            else
                return new Vast3XmlParser(new Vast3Pvt());
        }


        override protected function parseAd(xml:XML):Ad
        {
            var result:Ad = super.parseAd(xml);
            result.sequence = parseInt(xml.@sequence[0]);
            return result;
        }
    }
}

internal class Vast3Pvt
{
    public function Vast3Pvt()
    {
    }
}
