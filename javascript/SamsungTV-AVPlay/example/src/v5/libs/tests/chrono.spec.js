describe("chrono.js", function() {
    $YB.plainConsole = true;
    var v = new $YB.Chrono();

    it("chrono to work", function(done) {
        v.start();
        setTimeout(function() {
            expect(v.stop() / 1000).toBeCloseTo(1, 0);
            expect(v.getDeltaTime() / 1000).toBeCloseTo(1, 0);
            done();
        }, 1000);
    });

});