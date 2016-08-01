describe("communication.js", function() {
    $YB.plainConsole = true;
    var ctry = new $YB.Api(this);

    it("should send data", function(done) {
        ctry.sendData('system=nicetv&pluginVersion=3.0.0-jasmineTest', function() {
            done();
        });
    });

    it("should send start", function(done) {
        ctry.sendStart({
            system: 'nicetv',
            user: 'jasmine-test',
            transcode: 'a-test',
            pluginVersion: '3.0.0-jasmineTest',
            properties: {
                b: "be",
                c: "ce",
                content_metadata: {
                    title: "One Title"
                }
            },
            resource: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
            cdn: 'MASSIOT',
            isp: 'Telefónica Movistar',
            duration: 100,
            param1: "parameter one"
        }, function() {
            done();
        });
    });

    it("should send join", function(done) {
        ctry.sendJoin({
            time: "1000"
        }, function() {
            done();
        });
    });

    it("should send pause", function(done) {
        ctry.sendPause({}, function() {
            done();
        });
    });

    it("should send resume", function(done) {
        ctry.sendResume({}, function() {
            done();
        });
    });

    it("should send buffer", function(done) {
        ctry.sendBuffer({
            time: "10",
            duration: "2500"
        }, function() {
            done();
        });
    });

    it("should send seek", function(done) {
        ctry.sendSeek({
            time: "10",
            duration: "2500"
        }, function() {
            done();
        });
    });

    it("should send ads", function(done) {
        ctry.sendAds({
            time: "10",
            duration: "2500"
        }, function() {
            done();
        });
    });

    it("should send ping", function(done) {
        ctry.sendPing({
            time: "10",
            duration: "2500",
            bitrate: "50000"
        }, function() {
            done();
        });
    });

    it("should send error", function(done) {
        ctry.sendError({
            msg: "This is an error test",
            errorCode: 5001,
            system: 'nicetv',
            user: 'jasmine-test',
            transcode: 'a-test',
            pluginVersion: '3.0.0-jasmineTest',
            properties: {
                b: "be",
                c: "ce",
                content_metadata: {
                    title: "One Title"
                }
            },
            resource: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
            cdn: 'MASSIOT',
            isp: 'Telefónica Movistar',
            duration: 100,
            param1: "parameter one"
        }, function() {
            done();
        });
    });

    it("should send stop", function(done) {
        ctry.sendStop({}, function() {
            done();
        });
    });
});