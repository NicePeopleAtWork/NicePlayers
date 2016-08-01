if (typeof $YB != "undefined") {
    $YB.plugins.VieraRakuten = function(playerId, options) {
        // Name and version the plugin
        this.pluginName = 'VieraRakuten';
        this.pluginVersion = '5.1.0c-viera-rakuten';

        // This method will start the library logic.
        this.init(playerId, options);

        this.initYoubora();
    };

    // Inherit from generic plugin
    $YB.plugins.VieraRakuten.prototype = new $YB.plugins.Generic;

    $YB.plugins.VieraRakuten.prototype.getResource = function() {
        return this.player.currentSrc;
    };

    $YB.plugins.VieraRakuten.prototype.getMediaDuration = function() {
        return this.player.duration;
    };

    $YB.plugins.VieraRakuten.prototype.getPlayhead = function() {
        return this.player.currentTime;
    };

    $YB.plugins.VieraRakuten.prototype.getPlayerVersion = function() {
        return "Viera";
    };

    $YB.plugins.VieraRakuten.prototype.initYoubora = function() {
        // Will report all events to console
        $YB.utils.listenAllEvents(this.player);

        // Nicebuffer
        this.startAutobuffer();

        // Listeners
        var plugin = this;
        this.player.addEventListener("ended", function() {
            plugin.endedHandler();
        });
        this.player.addEventListener("play", function() {
            plugin.playHandler();
        });
        this.player.addEventListener("playing", function() {
            plugin.playingHandler();
        });
        this.player.addEventListener("pause", function() {
            plugin.pauseHandler();
        });
        this.player.addEventListener("error", function(e) {
	        plugin.errorHandler('vie_002', 'PLAY_FAILURE');
        });
        this.player.addEventListener("seeking", function(e) {
            plugin.seekingHandler();
        });
    };
}
