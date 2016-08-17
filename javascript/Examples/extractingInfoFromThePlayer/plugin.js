$YB.plugins.Html5 = function(playerId, options) {
  // Name and version the plugin
  this.pluginName = 'html5';
  this.pluginVersion = '5.3.0-1.0-html5';

  // This method will start the library logic.
  this.startMonitoring(playerId, options);

  // Register the listeners.
  this.registerListeners();
};

// Inherit from generic plugin
$YB.plugins.Html5.prototype = new $YB.plugins.Generic;

// Register listeners
$YB.plugins.Html5.prototype.registerListeners = function() {
  var context = this;
  // Remember: 'this.player' is a reference to the player/video tag.
  this.player.addEventListener("play", function() {
    // Once the event is fired, we call hist event handler
    context.playHandler();
  });

  this.player.addEventListener("playing", function(e) {
    context.playingHandler();
  });

  this.player.addEventListener("pause", function(e) {
    context.pauseHandler();
  });

  this.player.addEventListener("ended", function(e) {
    context.endedHandler();
  });
};

$YB.plugins.Html5.prototype.getMediaDuration = function() {
  return this.player.duration;
};

$YB.plugins.Html5.prototype.getPlayhead = function() {
  return this.player.currentTime;
};

$YB.plugins.Html5.prototype.getResource = function() {
  return this.player.currentSrc;
};
