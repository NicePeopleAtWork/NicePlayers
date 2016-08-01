describe("ajaxrequest.js", function() {
    $YB.plainConsole = true;

    var v = new $YB.AjaxRequest('http://nqs.nice264.com', '/data', 'system=nicetv&pluginVersion=3.0.0-jasmineTest');
    v.append('live=true');

    it("load callback", function(done) {
        v.load(function(x) {
            var code = v.xmlHttp.responseXML.getElementsByTagName('c')[0].textContent;
            expect(typeof x).toBeDefined("AjaxRequest");
            expect(code).toBeDefined();
            expect(code[0]).toBe('L'); // Statrs with L cuz it's a live.
            done();
        });
    });

    v.send();

    it("createXMLHttpRequest", function() {
        if (typeof XMLHttpRequest == "function")
            expect(v.createXMLHttpRequest() instanceof XMLHttpRequest).toBeTruthy();
        else
            expect(v.createXMLHttpRequest() instanceof Microsoft.XMLHTTP).toBeTruthy();
    });

    it("should create a good url", function() {
        expect(v.getUrl()).toBe("http://nqs.nice264.com/data?system=nicetv&pluginVersion=3.0.0-jasmineTest&live=true");
    });
});