if (typeof $YB != "undefined") {
    $YB.plugins.BraviaRakuten = function(playerId, options) {
        // Name and version the plugin
        this.pluginName = 'BraviaRakuten';
        this.pluginVersion = '5.1.0c-bravia-rakuten';

        // This method will start the library logic.
        this.init(playerId, options);

        this.initYoubora();
    };

    // Inherit from generic plugin
    $YB.plugins.BraviaRakuten.prototype = new $YB.plugins.Generic;

    $YB.plugins.BraviaRakuten.prototype.getResource = function() {
        return this.player.currentSrc;
    };

    $YB.plugins.BraviaRakuten.prototype.getMediaDuration = function() {
        return this.player.duration;
    };

    $YB.plugins.BraviaRakuten.prototype.getPlayhead = function() {
        return this.player.currentTime;
    };

    $YB.plugins.BraviaRakuten.prototype.getPlayerVersion = function() {
        return "Bravia";
    };

    $YB.plugins.BraviaRakuten.prototype.initYoubora = function() {
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
            plugin.errorHandler('PLAY_FAILURE');
        });
        this.player.addEventListener("seeking", function(e) {
            plugin.seekingHandler();
        });
    };
}
