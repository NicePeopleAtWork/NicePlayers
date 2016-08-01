describe("buffer.js", function() {
    $YB.plainConsole = true;
    var v = new $YB.Buffer(new $YB.Api({
        getPlayhead: function() {
            return 0
        }
    }, 'bufferTest'));

    it("_checkBuffer called", function(done) {
        spyOn(v, '_checkBuffer');
        v.start();
        setTimeout(function() {
            expect(v.timer).not.toBe(null);
            expect(v._checkBuffer).toHaveBeenCalled();
            done();
        }, 2000);
    });

});