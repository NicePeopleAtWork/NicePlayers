enyo.kind({
    name: "Tutorial.Develop.PlayVideo.MainView",
    kind: "moon.VideoPlayer",
    src: "http://vevoplaylist-live.hls.adaptive.level3.net/vevo/ch1/appleman.m3u8",
    autoplay: false,
    handlers: {
        onplay: 'onPlay'
    },
    onPlay: function() {
        debugger
        $YB.debug('play')
    },
    tap: function(a, b) {
        this.showFSControls();
    },
    rendered: function() {
        try {
            $YB.plugin = new $YB.plugins.LgMoonstone(this, {
                accountCode: 'qamini',
                username: 'qa',
                transactionCode: "transcode",

                httpSecure: false,
                parseCDNNodeHost: true,
                parseHLS: true,

                // Network
                network: {
                    cdn: "AKAMAI",
                    ip: "1.1.1.1",
                    isp: "ISPa"
                },

                // Media Info
                media: {
                    title: 'Telenoticias',
                },

                // properties
                properties: {
                    content_metadata: {
                        genre: "a",
                        year: "b",
                        cast: "c",
                        director: "d",
                        owner: "e",
                        parental: "f",
                        price: "g",
                        rating: "h",
                        audioType: "i",
                        audioChannels: "j",
                        language: 'k'
                    },
                    transaction_type: "k",
                    quality: "l",
                    content_type: "m",
                    device: {
                        manufacturer: "n",
                        type: "o",
                        year: "p",
                        firmware: "q"
                    }
                }
            });
        } catch (err) {
            $YB.error(err);
        }
    }
});
