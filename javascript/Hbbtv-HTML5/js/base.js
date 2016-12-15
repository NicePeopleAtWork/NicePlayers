var opts = false;
var selected = 0;

function initVideo() {
  try {
    document.getElementById('video').bindToCurrentChannel();
  } catch (e) {
    // ignore
  }
  try {
    document.getElementById('video').setFullScreen(false);
  } catch (e) {
    // ignore
  }
}

function initApp() {
  try {
    var app = document.getElementById('appmgr').getOwnerApplication(document);
    app.show();
    app.activate();
  } catch (e) {
    // ignore
  }
  setKeyset(0x1+0x2+0x4+0x8+0x10);
}

function setKeyset(mask) {
  // for HbbTV 0.5:
  try {
    var elemcfg = document.getElementById('oipfcfg');
    elemcfg.keyset.value = mask;
  } catch (e) {
    // ignore
  }
  try {
    var elemcfg = document.getElementById('oipfcfg');
    elemcfg.keyset.setValue(mask);
  } catch (e) {
    // ignore
  }
  // for HbbTV 1.0:
  try {
    var app = document.getElementById('appmgr').getOwnerApplication(document);
    app.privateData.keyset.setValue(mask);
    app.privateData.keyset.value = mask;
  } catch (e) {
    // ignore
  }
}

function registerKeyEventListener() {
  document.addEventListener("keydown", function(e) {
    if (handleKeyCode(e.keyCode)) {
      e.preventDefault();
    }
  }, false);
}
