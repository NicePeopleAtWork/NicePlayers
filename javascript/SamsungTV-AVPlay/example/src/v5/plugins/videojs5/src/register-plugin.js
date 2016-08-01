/**
 * @license
 * Youbora Videojs5 Plugin
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */


if (typeof videojs != 'undefined') {
    videojs.plugin('youbora', function(options) { // Register the plugin in videojs plugins space.

        if (typeof this.youbora.plugin == 'undefined') { // First call of the plugin
            this.youbora.plugin = new $YB.plugins.Videojs5(this, options);

        } else { // Subsequent calls of the plugin.
            this.youbora.plugin.setOptions(options);
        }

    });
}
