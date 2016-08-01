// Dependencias

var concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    header = require('gulp-header'),
    rename = require('gulp-rename'),
    //stripDebug = require('gulp-strip-debug'),
    fs = require('fs'),
    path = require('path'),
    karma = require('gulp-karma'),
    replace = require('gulp-replace'),

    gulp = require('gulp');


// Paths
var pluginsPath = __dirname + '/src/v5/plugins/',
    servicesPath = __dirname + '/src/v5/services/',
    adnalyzersPath = __dirname + '/src/v5/adnalyzers/',
    libsPath = __dirname + '/src/v5/libs/';


// Generic Functions
function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function(file) {
            if (file != 'last-stable' && file != 'last-build')
                return fs.statSync(path.join(dir, file)).isDirectory();
        });
}

function exists(filePath) {
    try {
        return fs.statSync(filePath);
    } catch (err) {
        return false;
    }
}

function createSymLink(destiny, filePath) {
    try {
        if (fs.lstatSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        return false;
    } finally {
        fs.symlinkSync(destiny, filePath);
    }
}

var Log = {
    uglifyError: function(err) {
        process.stdout.write(Log.timeStamp() +
            "\x1b[31mError\x1b[0m on '\x1b[36muglify\x1b[0m' at file " +
            "\x1b[35m" + err.message.replace(": ", "\n\x1b[0m") +
            ": \x1b[36m" + err.lineNumber +
            "\n\n\x1b[0m");
    },
    warn: function(msg) {
        process.stdout.write(Log.timeStamp() +
            "\x1b[33mWarn\x1b[0m '\x1b[36m" + msg + "\x1b[0m'.\n");
    },
    building: function(msg) {
        process.stdout.write(Log.timeStamp() +
            "Building\x1b[0m '\x1b[36m" + msg + "\x1b[0m'.\n");
    },
    msg: function(msg) {
        process.stdout.write(Log.timeStamp() +
            "\x1b[32mMessage\x1b[0m '\x1b[36m" + msg + "\x1b[0m'.\n");
    },
    timeStamp: function() {
        var now = new Date();
        return "[\x1b[30m" + ("0" + now.getHours()).slice(-2) +
            ":" + ("0" + now.getMinutes()).slice(-2) +
            ":" + ("0" + now.getSeconds()).slice(-2) +
            "\x1b[0m] ";
    }
}


// Manifest and build functions
function smartBuild(path) {
    var parent = path.slice(0, path.lastIndexOf('/'));
    var manifestPath = parent + "/manifest.json";
    if (exists(manifestPath)) {
        var m = new Manifest(manifestPath);
        m.build();
    } else {
        if (parent != __dirname)
            smartBuild(parent);
    }
}

var Manifest = function(path) {
    this.manifestPath = path;
    this.data = JSON.parse(fs.readFileSync(path));
    for (var k in this.data) {
        if (this.data.hasOwnProperty(k)) {
            this[k] = this.data[k];
        }
    }

    this.branch = (this.lastStable) ? "main" : "versioned";

    if (!this.type) {
        if (this.name == "services") { // is services
            this.type = "services";
        } else if (this.name == "youboralib") { // is library
            this.type = "youboralib";
        } else { // is plugin
            this.type = "plugin";
        }
    }

    if (this.type == "services") { // is services
        this.sourceFiles = servicesPath + 'src/*.js';
        this.basePath = servicesPath + this.ver;

    } else if (this.type == "youboralib") { // is library
        this.sourceFiles = libsPath + 'src/**/*.js';
        this.basePath = libsPath + this.ver;

    } else if (this.type == "adnalyzer") { // is adnalyzer
        this.sourceFiles = adnalyzersPath + this.name + '/src/*.js';
        this.basePath = adnalyzersPath + this.name + '/' + this.ver;

    } else if (this.type == "plugin") { // is plugin
        this.type = "plugin";
        this.sourceFiles = pluginsPath + this.name + '/src/*.js';
        this.basePath = pluginsPath + this.name + '/' + this.ver;
        this.libPath = libsPath + this.libVer + "/youboralib.min.js"
    } else {
        Log.warn("Type '" + this.type + "' defined in manifest '" + path + "' is wrong.");
    }
};

Manifest.prototype.createVersionedManifest = function() {
    var values = this.data;
    values.built = new Date().toDateString();
    delete values.lastStable;

    fs.writeFileSync(this.basePath + "/manifest.json", JSON.stringify(this.data, null, '    '), {
        mode: '777'
    });
};

Manifest.prototype.license = function() {
    var product = "";
    if (this.type == "plugin") {
        product = "Plugin " + this.ver + "-" + this.name;
    } else if (this.type == "adnalyzer") {
        product = "Adnalyzer " + this.ver + "-" + this.name;
    } else if (this.type == "services") {
        product = "Youbora Services " + this.ver;
    } else {
        product = this.type + " " + this.ver;
    }

    return "/**\n * @license\n * " + product + " <http://youbora.com/>\n * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>\n */\n";
};

Manifest.prototype.createSymLinks = function() {
    var path = '';
    if (this.type == "plugin") {
        path = pluginsPath + this.name;
    } else if (this.type == "adnalyzer") {
        path = adnalyzersPath + this.name;
    } else if (this.type == "services") {
        path = servicesPath;
    } else if (this.type == "youboralib") {
        path = libsPath;
    }
    if (this.ver != "-")
        createSymLink(this.ver + '/', path + '/last-build');

    if (this.lastStable != "-")
        createSymLink(this.lastStable + '/', path + '/last-stable');
};

Manifest.prototype.build = function() {
    if (this.branch == "main") {
        // Create folder if it does not exist
        if (!exists(this.basePath)) fs.mkdirSync(this.basePath);

        // Generate sym links
        this.createSymLinks();

        // Create local manifest
        this.createVersionedManifest();

        // Concat plugin.js
        var stream = gulp.src(this.sourceFiles)
            .pipe(concat(this.type + '.js'))
            .pipe(replace('[name]', this.name))
            .pipe(replace('[ver]', this.ver))
            .pipe(gulp.dest(this.basePath));

        return stream;
    } else {
        return this.minify();
    }
};

Manifest.prototype.minify = function(stream) {
    Log.building(this.type.toUpperCase() + " " + this.ver + "-" + this.name);

    var source = this.type + '.js';
    var dest = this.type + '.min.js';

    if (typeof stream == "undefined") {
        stream = gulp.src(this.basePath + "/" + source);
    }

    var self = this;
    stream
        .pipe(uglify()).on('error', Log.uglifyError)
        .pipe(header(this.license()))
        .pipe(rename(dest))
        .pipe(gulp.dest(this.basePath))
        .on("end", function() {
            self.buildSP();
        });

    return stream;
};

Manifest.prototype.buildSP = function() {
    if (this.type == "plugin") {
        if (exists(this.libPath)) {
            Log.building(" +SP " + this.ver + "-" + this.name + "\tw/ Lib " + this.libVer);

            // Determine source files
            var arr = [this.libPath]; // Library

            if (this.extends) {
                if (this.extends.indexOf('/') === -1) {
                    this.extends += "/last-stable";
                }
                arr.push(pluginsPath + this.extends + '/plugin.min.js'); // Extends
            }

            arr.push(this.basePath + '/plugin.min.js'); // plugin.min

            if (this.adnalyzers) {
                for (var k in this.adnalyzers) {
                    arr.push(adnalyzersPath + k + "/" + this.adnalyzers[k] + "/adnalyzer.min.js");
                }
            }

            var stream = gulp.src(arr)
                .pipe(concat('sp.min.js'))
                .pipe(gulp.dest(this.basePath))

            if (this.export) {
                stream
                    .pipe(gulp.dest(__dirname + '/' + this.export));
            }


            return stream;
        } else {
            Log.warn("Can't build SP for '" + this.name + "'. Lib '" + this.libVer + "' does not exist.");
        }
    } else if (this.type == "youboralib") {
        //Log.building("Lib " + this.ver);
        var self = this;
        getFolders(pluginsPath).map(function(plugin) {
            getFolders(pluginsPath + plugin).map(function(ver) {

                if (ver != 'last-build' && ver != 'last-stable' && ver != 'test' && ver != 'docs' && ver != 'src') {

                    var pluginManifestPath = pluginsPath + plugin + '/' + ver + '/manifest.json';
                    if (exists(pluginManifestPath)) {

                        var pluginManifest = new Manifest(pluginManifestPath);
                        if (pluginManifest.libVer == self.ver) {
                            pluginManifest.buildSP();
                        }
                    }
                }
            });
        });
    } else if (this.type == "adnalyzer") {
        //Log.building("Lib " + this.ver);
        var self = this;
        getFolders(pluginsPath).map(function(plugin) {
            getFolders(pluginsPath + plugin).map(function(ver) {

                if (ver != 'last-build' && ver != 'last-stable' && ver != 'test' && ver != 'docs' && ver != 'src') {

                    var pluginManifestPath = pluginsPath + plugin + '/' + ver + '/manifest.json';
                    if (exists(pluginManifestPath)) {

                        var pluginManifest = new Manifest(pluginManifestPath);
                        if (pluginManifest.adnalyzers && pluginManifest.adnalyzers[self.name]) {
                            pluginManifest.buildSP();
                        }
                    }
                }
            });
        });
    }
};


// Configuración de las tareas
gulp.task('default', ["watch"]);
gulp.task('watch', function() {
    //watch
    gulp.watch([
        // Libs
        libsPath + 'src/**/*.js',
        libsPath + '**/youboralib.js',
        '!' + libsPath + 'last-build/youboralib.js',
        '!' + libsPath + 'last-stable/youboralib.js',
        libsPath + 'manifest.json',

        // Plugins
        pluginsPath + '**/**/plugin.js',
        '!' + pluginsPath + '**/last-build/plugin.js',
        '!' + pluginsPath + '**/last-stable/plugin.js',
        '!' + pluginsPath + '**/src/plugin.js',
        pluginsPath + '**/src/*.js',
        pluginsPath + '*/manifest.json',

        // Services
        //servicesPath + 'src/*.js',
        //servicesPath + '**/services.js',
        //'!' + servicesPath + 'last-build/services.js',
        //'!' + servicesPath + 'last-stable/services.js',
        //servicesPath + 'manifest.json',

        // Adnalyzers
        adnalyzersPath + '**/**/adnalyzer.js',
        '!' + adnalyzersPath + '**/last-build/adnalyzer.js',
        '!' + adnalyzersPath + '**/last-stable/adnalyzer.js',
        '!' + adnalyzersPath + '**/src/adnalyzer.js',
        adnalyzersPath + '**/src/*.js',
        adnalyzersPath + '*/manifest.json',

    ]).on("change", function(file) {
        smartBuild(file.path);
    });
});

gulp.task('libs5', function() {
    var manifestPath = libsPath + '/manifest.json';
    if (exists(manifestPath)) {
        var m = new Manifest(manifestPath);
        m.build().on("end", function() {
            m.minify();
        });
    }
});

gulp.task('plugins5', function() {
    getFolders(pluginsPath).map(function(plugin) {
        var manifestPath = pluginsPath + plugin + '/manifest.json';
        if (exists(manifestPath)) {
            var m = new Manifest(manifestPath);
            m.build().on("end", function() {
                m.minify();
            });
        }
    });
});


gulp.task('adnalyzers5', function() {
    getFolders(adnalyzersPath).map(function(adnalyzer) {
        var manifestPath = adnalyzersPath + adnalyzer + '/manifest.json';
        if (exists(manifestPath)) {
            var m = new Manifest(manifestPath);
            m.build().on("end", function() {
                m.minify();
            });
        }
    });
});

gulp.task('services5', function() {
    var manifestPath = servicesPath + '/manifest.json';
    if (exists(manifestPath)) {
        var m = new Manifest(manifestPath);
        m.build();
        m.minify();
    }
});

gulp.task('build', function() {
    var manifestPath = './manifest.json';
    if (exists(manifestPath)) {
        var m = new Manifest(manifestPath);
        m.build();
    } else {
        Log.warn('manifest.json not found. Try "gulp build --cwd ."');
    }
});

// Karma Testing
gulp.task('karma', function() {
    // Be sure to return the stream
    return gulp.src([
            libsPath + 'last-build/youboralib.min.js',
            libsPath + 'tests/*.js',
            //'5.0/plugins/**/last-build/plugin.min.js',
            //'5.0/plugins/**/tests/*.js'
        ])
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        }))
        .on('error', function(err) {
            // Make sure failed tests cause gulp to exit non-zero
            Log.warn('Karma found some errors');
        });
});
