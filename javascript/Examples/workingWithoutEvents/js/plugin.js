//Console set
$YB.plainConsole = true;

$YB.plugins.TizenAvplay = function(playerId, options) {
    // Name and version the plugin
    this.pluginName = 'tizen-avplay';
    this.pluginVersion = '6.0.0-tizenAvplay';

    // This method will start the library logic.
    this.init(playerId, options);
};

$YB.plugins.TizenAvplay.prototype = new $YB.plugins.Generic;

$YB.plugins.TizenAvplay.prototype.getPlayhead = function() {
    return webapis.avplay.getCurrentTime() / 1000;
};

$YB.plugins.TizenAvplay.prototype.getMediaDuration = function() {
    return webapis.avplay.getDuration() / 1000;
};

$YB.plugins.TizenAvplay.prototype.getPlayerVersion = function() {
    return 'avplay-' + webapis.avplay.getVersion();
};

$YB.plugins.TizenAvplay.prototype.getBitrate = function() {
    try {
        if (webapis.avplay.getCurrentStreamInfo()[0]) {
            var j = JSON.parse(webapis.avplay.getCurrentStreamInfo()[0].extra_info)
            return j.Bit_rate;
        } else {
            return -1;
        }
    } catch (err) {
        return -1;
    }
};
