/**
 * App name: FILMIN
 * App version: 4.017
 * Author: Mautilus, s.r.o.
 * Build: 25-09-2015 11:16
 **/
App = function(a, b) {
    var c = {
        networkStatus: !0,
        hasNetworkOrCableError: !1
    };
    return $.extend(!0, c, a, b, {
        init: function() {
            var a = this,
                b = $("#notifications"),
                d = $("#version");
            b.length ? this.$notifications = b : (this.$notifications = $('<div id="notifications" />'), $("body").append(this.$notifications)), d.length ? this.$version = d : (this.$version = $('<div id="version" />'), $("body").append(this.$version)), this.throbberInt = null, this.throbberIsShown = !1, this.notificationIsShown = !1, this.provider = FILMIN_API, setInterval(function() {
                a.checkNetworkConnection()
            }, 1e3), this.initGLobalSnippets(), this.initCollections(), this.initProvider(), this.initRouter(), StatsGoogle.init(), this.on("network", function(a) {
                console.log("[App] NETWORK CONNECTIVON: " + a), a ? this.connectionUp() : this.connectionDown()
            }.bind(this)), this.snippetLoading.on("throbber.timeout", function() {
                c.trigger("stat.throbber.timeout", ""), this.throbberHide(!0), Router.goBack(), c.notification(__("loading_timeout"), "error"), this.trigger("network", !1)
            }.bind(this)), 1 == CONFIG.developer.simulateIssuesNetworkOrCable && $(document).on("keydown", function(a) {
                var b = String.fromCharCode(a.which);
                "C" == b ? c.trigger("network", !0) : "D" == b && c.trigger("network", !1)
            }), (CONFIG.developer.debug || CONFIG.developer.active) && $("#viewport").append("<div style=\"position: absolute; right: 0; bottom: 0; width: 75px; height: 46px; background: url('img/debug.png') no-repeat; background-size: cover; z-index: 2000;\"></div>"), Player.formatTime = function(a, b) {
                a = parseInt(a);
                var c = b.h ? Math.floor(a / 3600) : 0,
                    d = b.m ? Math.floor((a - 3600 * c) / 60) : 0,
                    e = b.s ? a - 3600 * c - 60 * d : a;
                return b.h && (10 > c ? c = c : 0 == c && (c = "0")), b.m && 10 > d && (d = "0" + d), b.s && 10 > e && (e = "0" + e), (b.h ? c + ":" : "") + (b.m ? d + ":" : "") + (b.s ? e : a)
            }, this.on("hidden", function() {
                console.log("app is HIDDEN"), c.trigger("stat.app.hidden", "")
            }, this), this.on("resume", function() {
                console.log("app is RESUMED"), c.trigger("stat.app.resumed", "")
            }, this), this.ready()
        },
        initRouter: function() {
            console.log("[APP] init router"), Router.addScene("home", new Scene_Home), Router.addScene("login", new Scene_Login), Router.addScene("forgot_password", new Scene_ForgotPassword), Router.addScene("signup", new Scene_Signup), Router.addScene("catalogue", new Scene_Catalogue), Router.addScene("collections", new Scene_Collections), Router.addScene("search", new Scene_Search), Router.addScene("subscribe", new Scene_Subscribe), Router.addScene("detail", new Scene_Detail), Router.addScene("actors", new Scene_Actors), Router.addScene("splash", new Scene_Splash), Router.addScene("player", new Scene_Player), Router.addScene("userarea", new Scene_UserArea), Router.addScene("creditcards", new Scene_CreditCards), Router.addScene("parental_control", new Scene_ParentalControl), Router.go("splash")
        },
        initGLobalSnippets: function() {
            console.log("[APP] init global snippets"), this.snippetUserBar = new Snippet_UserBar, this.snippetNavigationBar = new Snippet_NavigationBar(this), this.snippetList = new Snippet_List, this.snippetRecommender = new Snippet_Recommender(this), this.snippetLoading = new Snippet_Loading(this)
        },
        initCollections: function() {
            console.log("[APP] init collections"), this.homeSliderColl = new Collection_HomeSlider(null, {
                model: Model_HomeSlider
            }), this.searchMoodColl = new Collection_SearchMood(null, {
                model: Model_SearchWords
            }), this.searchTagColl = new Collection_SearchTag(null, {
                model: Model_SearchWords
            }), this.searchGenreColl = new Collection_SearchGenre(null, {
                model: Model_SearchWords
            }), this.mediaAssetColl = new Collection_MediaAsset(null, {
                model: Model_MediaAsset
            }), this.mediaCatalogColl = new Collection_MediaCatalog(null, {
                model: Model_MediaCatalog
            }), this.mediaCollectionsColl = new Collection_MediaCollections(null, {
                model: Model_MediaCollection
            }), this.creditCardsColl = new Collection_CreditCards(null, {
                model: Model_CreditCard
            }), this.ordersColl = new Collection_Orders(null, {
                model: Model_Order
            }), this.topBarsColl = new Collection_TopBars(null, {
                model: Model_TopBar
            }), this.listViewLaterColl = new Collection_ListViewLater(null, {
                model: Model_MediaCatalog
            }), this.listFavoriteColl = new Collection_ListFavorite(null, {
                model: Model_MediaCatalog
            }), this.listViewedColl = new Collection_ListViewed(null, {
                model: Model_MediaCatalog
            }), this.parentalControlCalColl = new Collection_ParentalControlCal(null, {
                model: Model_ParentalControlCal
            })
        },
        initProvider: function(a) {
            return console.log("[APP] initProvider"), a = a || new Promise, this.provider.on("ready", function() {
                console.log("[APP] initProvider done"), a.resolve()
            }, this), this.provider.on("preflight.error", function(a) {
                this.showPreFlightCheckErrDialog(a)
            }, this), this.provider.on("error", function() {}), this.provider.on("api.error", function() {
                this.showNetworkDialog()
            }.bind(this)), this.provider.on("api.notify", function(a) {
                this.notification(a, "error")
            }, this), this.provider.on("api.stats", function() {}, this), this.provider.on("profile", function() {}, this), this.provider.on("api.user.subscription", function() {}, this), this.provider.on("api.user.login", function() {}, this), this.provider.on("api.user.voucher", function() {}, this), this.provider.on("api.user.reset", function() {}, this), this.provider.on("api.user.logout", function() {
                User.signout()
            }, this), this.provider.on("api.download", function() {}, this), this.provider.on("reset", function() {}, this), this.provider.init({
                mainapp: this,
                storage: Storage,
                deviceId: Player.getESN && Player.getESN() ? Player.getESN() : Device.getUID(),
                device: Main.getDevice()
            }, {
                appVersion: CONFIG.version.split(" ")[0],
                requestTimeout: CONFIG.ajax.timeout,
                domain: CONFIG.providerAPI.domain,
                proxy: CONFIG.providerAPI.proxy,
                secureToken: CONFIG.providerAPI.secureToken,
                protocol: CONFIG.providerAPI.ssl ? "https" : "http",
                apiVersion: CONFIG.providerAPI.api.version,
                appVersion: CONFIG.providerAPI.api.appVersion,
                osVersion: CONFIG.providerAPI.api.osVersion,
                apiUrl: CONFIG.providerAPI.api.url,
                apiSignInUrl: CONFIG.providerAPI.api.urlSignin,
                apiLogUrl: CONFIG.providerAPI.api.urlStats,
                clientId: CONFIG.providerAPI.api.clients[Main.getDevice()[0]].client_id,
                clientSecretId: CONFIG.providerAPI.api.clients[Main.getDevice()[0]].client_secret,
                clientSignUpToken: CONFIG.providerAPI.api.signup_token,
                playreadyUrl: "",
                cacheproxy: "",
                mediaMarksUrl: CONFIG.providerAPI.api.mediaMarksUrl
            }), this.provider.setRememberUser(!0), a
        },
        checkNetworkConnection: function() {
            Device.isTIZEN && document.hidden || Device.checkNetworkConnection(function(a) {
                a !== this.networkStatus && (this.networkStatus = a, this.trigger("network", this.networkStatus), c.trigger("stat.network", this.networkStatus))
            }, this)
        },
        connectionDown: function() {
            this.networkStatus = !1, this.showNetworkDialog(), "webos" === Main.device[0] && Device.clearHistory(), Keyboard && Keyboard.$el && Keyboard.$el.is(":visible") && Keyboard.exit(), $.xhrPool && $.xhrPool.abortAll(), c.throbberHide(), Player.stop(), Mouse.disable(), Control.disable(function(a) {
                a === Control.key.RETURN && (c.exit(), console.log("[App] Exit from connection network"))
            })
        },
        connectionUp: function() {
            this.networkStatus = !0, this.exitDialog && (this.exitDialog = null), "webos" === Main.device[0] && Device.pushHistory(), DialogManager.exitAllDialogs(), c.throbberHide(!0), Mouse.enable(), Control.enable(), Router.go("home")
        },
        showNetworkDialog: function() {
            this.exitDialog || (Control.disable(), Mouse.disable(), this.exitDialog = DialogManager.pushDialog(new Snippet_Dialog(null, {
                classe: "network-dialog",
                title: __("warning"),
                content: __("network_error_dialog"),
                centerLeft: !0,
                centerTop: !0
            })))
        },
        ready: function() {
            $("body").attr("unselectable", "on").css("user-select", "none").on("selectstart", !1).on("mousedown", !1)
        },
        throbberShow: function(a) {
            this.throbberIsShown || (a && a.disable && (Control.disable(), Mouse.disable()), this.snippetLoading.show(a), this.throbberIsShown = !0)
        },
        throbberHide: function(a) {
            this.throbberIsShown && (this.throbberIsShown = !1, this.snippetLoading.hide(), a && (Control.enable(), Mouse.enable()))
        },
        notification: function(a, b) {
            b = b || !1, timeout = "error" == b ? 8e3 : 4e3;
            var c = $('<div class="msg" />').html(a);
            return this.notificationIsShown ? void(this.notificationTimeout = setTimeout(function() {
                this.notification(a, b)
            }.bind(this), 500)) : ($("#notifications").removeClass("error"), "error" == b && $("#notifications").addClass("error"), $("#notifications").html(c), "welcome" == b && this.version(), c.fadeIn(), this.notificationIsShown = !0, void setTimeout(function() {
                c && c.fadeOut(), this.notificationIsShown = !1
            }.bind(this), timeout))
        },
        version: function() {
            if ("home" == Router.activeSceneName) {
                var a = $('<div class="version" />').html("{0}: {1}".format(__("version"), CONFIG.version));
                $("#version").html(a), a.fadeIn(), setTimeout(function() {
                    a && a.fadeOut()
                }, 4e3)
            }
        },
        getCurrentDate: function() {
            var a = new Date;
            if (c.time && c.time.date) {
                var b = c.time.date.split(" "),
                    d = b[0].split("-"),
                    e = b[1].split(":"),
                    d = new Date(d[0], parseInt(d[1], 10) - 1, d[2], e[0], e[1], parseInt(e[2], 10)),
                    f = (new Date).getTime() - c.time.timestamp;
                a = new Date(d.getTime() + f)
            }
            return a
        },
        exit: function() {
            Device.exit()
        },
        imgLoaded: function(a) {
            var b = a.parentNode;
            b && (b.className += b.className ? " loaded" : "loaded")
        }
    }), Main.ready(function() {
        c.init()
    }), c
}(Events, Deferrable);