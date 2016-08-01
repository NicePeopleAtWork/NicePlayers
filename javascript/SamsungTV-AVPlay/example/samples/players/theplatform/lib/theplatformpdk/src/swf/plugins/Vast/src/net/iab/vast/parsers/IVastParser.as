package net.iab.vast.parsers
{
import net.iab.vast.data.Ad;
import net.iab.vast.data.AdParameters;
import net.iab.vast.data.Companion;
import net.iab.vast.data.InLine;
import net.iab.vast.data.MediaFile;
import net.iab.vast.data.TrackingEvent;
import net.iab.vast.data.URL;
import net.iab.vast.data.Video;
import net.iab.vast.data.VideoAdServingTemplate;
import net.iab.vast.data.VideoClicks;
import net.iab.vast.data.Wrapper;

public interface IVastParser
{

    function parse(vast:String):VideoAdServingTemplate;
   


}
}