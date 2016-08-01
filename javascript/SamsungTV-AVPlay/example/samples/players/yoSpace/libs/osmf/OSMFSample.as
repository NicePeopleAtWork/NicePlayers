package {
    import com.yospace.osmf.HldsConstants;
    
    import flash.display.Sprite;
    import flash.events.Event;
    import flash.external.ExternalInterface;
    
    import org.osmf.events.MediaFactoryEvent;
    import org.osmf.media.DefaultMediaFactory;
    import org.osmf.media.MediaFactory;
    import org.osmf.media.MediaPlayer;
    import org.osmf.media.MediaPlayerSprite;
    import org.osmf.media.URLResource;
    
    // Simple OSMF app to load the HldsPlugin
    [SWF(width="800", height="450", frameRate="30", backgroundColor="#000000")]
    public class OSMFSample extends Sprite {
        private var _factory:MediaFactory;
        
        public function OSMFSample() {
            _factory = new DefaultMediaFactory(); 
            _factory.addEventListener(MediaFactoryEvent.PLUGIN_LOAD, onPluginLoad); 
            _factory.addEventListener(MediaFactoryEvent.PLUGIN_LOAD_ERROR, onPluginLoadError); 
            _factory.loadPlugin(new URLResource("HldsPlugin.swf"));
            
            // Listen for events from the VAST subsystem
            addEventListener(HldsConstants.VAST_AD_START, _reportEvent);
            addEventListener(HldsConstants.VAST_AD_END, _reportEvent);
            addEventListener(HldsConstants.VAST_AD_BREAK_START, _reportEvent);
            addEventListener(HldsConstants.VAST_AD_BREAK_END, _reportEvent);
            
            super();
        }
        
        private function _reportEvent(event:Event):void {
            try {
                ExternalInterface.call("console.log", event.toString());
            } catch(e:Error) {}
        }
        
        private function onPluginLoad(event:MediaFactoryEvent):void {
            // Create a resource for the video to display. 
            var resource:URLResource = new URLResource("http://csm.cds1.yospace.com/csm/41728638/666021318435?yo.sl=3&yo.l=true&yo.p=3");
            
            // Force OSMF to select hldsplugin regardless of the URL
            resource.addMetadataValue(HldsConstants.HLDS_METADATA_TYPE, HldsConstants.HLDS);
            
            // Enable the yospaceCDS VAST Advertising integration
            resource.addMetadataValue(HldsConstants.HLDS_METADATA_VAST, true);
            
            // Enable the ClosedCaption subsystem
            resource.addMetadataValue(HldsConstants.HLDS_METADATA_CC, true);
            
            // Request that we get HLSSDK events forwarded to us
            resource.addMetadataValue(HldsConstants.HLDS_METADATA_HANDLER, this);
            
            // Change the banner text during adverts
            resource.addMetadataValue(HldsConstants.HLDS_METADATA_ADVERT_TEXT, "A word from our sponsors...");
            
            var mediaPlayer:MediaPlayer = new MediaPlayer(); 
            mediaPlayer.autoPlay = true;
            mediaPlayer.media = _factory.createMediaElement(resource);
            
            var mediaPlayerSprite:MediaPlayerSprite = new MediaPlayerSprite(mediaPlayer);
            mediaPlayerSprite.width = stage.stageWidth;
            mediaPlayerSprite.height = stage.stageHeight;
            
            addChild(mediaPlayerSprite);
        }
        
        private function onPluginLoadError(event:MediaFactoryEvent):void {
            // Uh-oh - didn't load
        }
    }
}
