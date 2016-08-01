describe("data.js", function() {
    $YB.plainConsole = true;
    var v = new $YB.Data({
        accountCode: "a",
        service: "b",
        username: "c",
        transactionCode: "d",
        isBalanced: 3,
        network: {
            cdn: "nope",
            ip: "nope",
            isp: "nope"
        },
    });

    v.setOptions({
        network: {
            cdn: "e",
            ip: "f",
            isp: "g"
        },
        media: {
            isLive: true,
            resource: "h"
        },
        properties: {
            filename: "i",
            content_id: "j",
            content_metadata: {
                title: "k"
            }
        }
    });


    it("accountCode", function() {
        expect(v.accountCode).toBe("a");
    });

    it("service", function() {
        expect(v.service).toBe("b");
    });

    it("username", function() {
        expect(v.username).toBe("c");
    });

    it("transactionCode", function() {
        expect(v.transactionCode).toBe("d");
    });

    it("isBalanced", function() {
        expect(v.isBalanced).toBe(3);
    });

    it("network cdn", function() {
        expect(v.network.cdn).toBe("e");
    });

    it("network ip", function() {
        expect(v.network.ip).toBe("f");
    });

    it("network isp", function() {
        expect(v.network.isp).toBe("g");
    });

    it("media isLive", function() {
        expect(v.media.isLive).toBe(true);
    });

    it("media resource", function() {
        expect(v.media.resource).toBe("h");
    });

    it("properties filename", function() {
        expect(v.properties.filename).toBe("i");
    });

    it("properties content_id", function() {
        expect(v.properties.content_id).toBe("j");
    });

    it("properties content_metadata title", function() {
        expect(v.properties.content_metadata.title).toBe("k");
    });
});