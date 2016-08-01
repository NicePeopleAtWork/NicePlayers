describe("datamap.js", function() {
    $YB.plainConsole = true;
    var v = new $YB.Data({
        accountCode: "a"
    });
    $YB.datamap.add('test-map', v);

    it('datamap work', function() {
        expect($YB.datamap.get('test-map').accountCode).toBe('a');
    });
});