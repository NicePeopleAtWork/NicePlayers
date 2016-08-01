describe("pinger.js", function() {
    $YB.plainConsole = true;
    it("pinger check", function(done) {
        var v = new $YB.Pinger(this, function() {
            expect(v.getDeltaTime() / 1000).toBeCloseTo(1, 0);
            done();
        }, 1000);
        v.start();
    });

});