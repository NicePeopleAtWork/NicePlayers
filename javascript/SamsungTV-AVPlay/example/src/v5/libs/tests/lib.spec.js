describe("lib.js", function() {
    $YB.plainConsole = true;

    it("namespace exists", function() {
        expect($YB).toBeDefined();
    });

    it("version exists", function() {
        expect($YB.version.length).toBeGreaterThan(0);
    });
});