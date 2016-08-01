var debug_plugin = function (tema) {
	this.config = function (config) {
		if (yospace.BROWSER.IE && (yospace.BROWSER.IE < 8)) {
			yospace.log("Yoplayer Debug: IE too old");
			return false;
		}
		// Create the logging pane
		return true;
	};

	this.init = function (div, config) {
		if (!this.config(config)) {
			// Config returned false, so do not do anything
			return;
		}
		div.debug = new Object();
		div.debug.id = 'debug_' + div.getAttribute("id");
		div.debug.div = yospace.createElement('div', {
			'id': div.debug.id,
			'style': 'overflow-x: hidden; overflow-y: scroll; position: absolute; top: 10px; left: 10px; width: 75%; height: 50%; background: white; padding: 10px; font-family: sans-serif; z-index: 1000'
		}, 'Debug Messages');
		div.debug.div.hide();
		yospace.log("Yoplayer Debug: Init " + tema);
	};

	this.start = function (div) {
		yospace.log("Yoplayer Debug: Starting");
		setTimeout(function () {
			div.append(div.debug.div);
			div.debug.div.show(0.5);
		}, 400);
		yospace.log("Yoplayer Debug: Started");
	};

	this.destroy = function (div) {
		div.debug.div.remove();
	};

	this.logging = function (div, message) {
		div.debug.div.append(
			yospace.createElement('div', {}, message)
		);
	}
};
