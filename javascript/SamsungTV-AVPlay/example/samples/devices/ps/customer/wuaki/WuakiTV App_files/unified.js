var Main = {
    global: "Main.global"
};
Main.onLoad = function() {
    Main.getConfig()
};
Main.continueLoad = function() {
    $("body").show();
    if (typeof TVA_Rollbar !== "undefined") TVA_Rollbar.init({
        ajaxOnError: true
    });
    Main.loaded = false;
    window.onscroll = function() {
        window.scrollTo(0, 0)
    };
    TVA.init({
        debug: false,
        touchPanel: TVA.device == "ps4" ? false : true
    });
    if (TVA.device.match(/ps3|ps4|psvita/i)) {
        TVA_Player.forward = function(offset) {
            offset = offset ? offset : TVA_Player.defaultSkip;
            var seekTo = TVA_Player.playPos + offset > TVA_Player.getLength() ? TVA_Player.getLength() : TVA_Player.playPos + offset;
            TVA.WebMAF.setPlayTime(seekTo);
            if (TVA_Player.simulateSeconds) TVA_Player.fakeSeconds += seekTo
        };
        TVA_Player.backward = function(offset) {
            offset = offset ? offset : TVA_Player.defaultSkip;
            var seekTo = TVA_Player.playPos - offset < 0 ? 0 : TVA_Player.playPos - offset;
            TVA.WebMAF.setPlayTime(seekTo);
            if (TVA_Player.simulateSeconds) TVA_Player.fakeSeconds -= seekTo
        }
    }
    commonTools.setupWuakiLanguage();
    TVA_GoogleAnalytics.init(Wuaki.GoogleAnalyticsId);
    TVA_GoogleAnalytics.analyticMark(TVA.device + "/navigation", "AppLaunched");
    if (TVA.device == "samsung") TVA_Convergence.init({
        onMessageReceived: deepLinking.convergenceManager
    });
    Main.loaded = true;
    TVA.log("init Done");
    $(window).bind("mousewheel", function(event) {
        if (event.wheelDelta > 0) Main.keyDown(VK_UP);
        else Main.keyDown(VK_DOWN)
    })
};
Main.unload = function() {
    if (!(TVA.device == "lg" && TVA.year < 2014)) Wuaki.elements["playerMenu"].deinitPlayer();
    else Wuaki.enableElement("mainMenu");
    if (TVA.device == "lg" && deepLinking.isActive()) TVA.quit(true);
    else TVA.quit()
};
Main.keyDown = function(keycode) {
    switch (keycode) {
        default: Wuaki.nav(keycode);
        break
    }
};
Main.keyUp = function(keycode) {};
Main.onActivate = function(params) {
    if (Main.loaded) location.reload()
};
Main.onDeactivate = function(params) {
    if (Wuaki.currentElement.name == "playerMenu") {
        Wuaki.currentElement.showBars(false);
        Wuaki.enableElement(Wuaki.currentElement.parentMenu)
    }
    $("body").hide()
};
Main.getConfig = function() {
    $.ajax({
        dataType: "json",
        url: config.configURL + TVA.device + "/config.json",
        success: function(data) {
            $.extend(Wuaki, data);
            Main.getConfigCountry()
        },
        error: function() {
            $("#splash").append('<div class="configError">config error!</div>')
        }
    })
};
Main.getConfigCountry = function() {
    $.ajax({
        dataType: "json",
        url: config.configURL + TVA.device + "/country.json",
        success: function(data) {
            $.extend(Wuaki, data);
            Main.continueLoad()
        },
        error: function() {
            Main.continueLoad()
        }
    })
};

function boxFormMenu() {
    var div;
    var name, parentMenu;
    var status;
    var mode;
    var focusedOption, selectedOption;
    var menuOptions;
    var data;
    var _this = this;
    boxFormMenu.prototype.init = function(div, name) {
        this.name = name;
        this.div = div;
        this.status = new Object;
        this.status.visible = false;
        this.status.enable = false;
        this.status.ready = false;
        this.menuOptions = new Array
    };
    boxFormMenu.prototype.ready = function() {
        return this.status.ready
    };
    boxFormMenu.prototype.autoEnable = function() {
        this.status.autoEnable = true;
        if (this.status.ready) Wuaki.enableElement(this.name)
    };
    boxFormMenu.prototype.enable = function() {
        Wuaki.currentElement = this;
        this.focusCurrentOption();
        this.display();
        this.status.enable = true;
        this.drawFooter();
        TVA.log(this.name);
        Wuaki.hideLoading();
        TVA_GoogleAnalytics.analyticMark(TVA.device + "/navigation", "Menu/" + this.mode)
    };
    boxFormMenu.prototype.drawFooter = function() {
        if (Wuaki.background != "resources/images/1w_pixel_bg.jpg") Wuaki.elements["footerMenu"].div.removeClass("white");
        Wuaki.elements["footerMenu"].drawLoginStatus(TVA.device == "ps4" ? false : true);
        Wuaki.elements["footerMenu"].drawReturn();
        Wuaki.elements["footerMenu"].drawSelect();
        Wuaki.elements["footerMenu"].drawNavigate();
        Wuaki.elements["footerMenu"].applyNewContent()
    };
    boxFormMenu.prototype.disable = function() {
        this.status.enable = false;
        this.unfocusOption(this.focusedOption)
    };
    boxFormMenu.prototype.display = function() {
        this.status.visible = true;
        $("#main").css("background-image", "");
        Wuaki.elements["gridMenu"].hide();
        if (Wuaki.homescreen) Wuaki.elements["homescreenMenu"].hide();
        this.div.show()
    };
    boxFormMenu.prototype.hide = function() {
        this.status.visible = false;
        this.div.hide()
    };
    boxFormMenu.prototype.reset = function() {};
    boxFormMenu.prototype.draw = function() {
        switch (this.mode) {
            case "emptyBoxForm":
                this.drawEmptyBoxForm();
                break;
            case "OverviewBoxForm":
                this.drawOverviewBoxForm();
                break;
            case "UnpairBoxForm":
                this.drawUnpairBoxForm();
                break;
            case "PaymentsBoxForm":
                this.initCreditCard();
                this.drawPaymentsBoxForm();
                break;
            case "PreferencesBoxForm":
                this.drawPreferencesBoxForm();
                break;
            default:
                break
        }
        this.addMouseEvents();
        this.status.ready = true;
        Wuaki.hideLoading()
    };
    boxFormMenu.prototype.addMouseEvents = function() {
        this.div.find(".boxFormButton,.PaymentsOptions,.PaymentsUpdate").unbind().bind("mouseenter", this, function(event) {
            var element = event.data;
            element.div.find(".hover").removeClass("hover");
            element.focusOption(Number($(this).attr("boxFormButtonIndex")));
            if (Wuaki.currentElement.name != element.name) Wuaki.enableElementFromError(element.name)
        }).bind("mouseleave", this, function(event) {}).bind("click", this, function(event) {
            var element = event.data;
            element.selectCurrentOption()
        }).addClass("pointer")
    };
    boxFormMenu.prototype.initCreditCard = function() {
        this.data.creditCard = new Object;
        if (Wuaki.user.data.credit_card != null) this.data.creditCard.name = Wuaki.user.data.credit_card.holder_name;
        else this.data.creditCard.name = "";
        this.data.creditCard.number = "";
        if (Wuaki.user.data.credit_card != null) this.data.creditCard.expiration = [Wuaki.user.data.credit_card.month, Wuaki.user.data.credit_card.year];
        else this.data.creditCard.expiration = "";
        this.data.creditCard.cvv = ""
    };
    boxFormMenu.prototype.drawEmptyBoxForm = function() {
        this.div.empty();
        $("<div/>").addClass("boxformIcon" + this.data.mode).appendTo(this.div);
        $("<div/>").addClass("boxFormExplanation").append($("<span/>").text(Wuaki.language["noContent"]).addClass("fontBoxFormEmptyTitle")).appendTo(this.div);
        var textContent = new Array;
        var goMenuOption;
        switch (this.data.id) {
            case "myFavouritesMovies":
                textContent.push(Wuaki.language["wishlistNoContent"].replace("*****", Wuaki.language["movie"]));
                textContent.push(Wuaki.language["seeMovies"]);
                goMenuOption = Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["Movies"]);
                break;
            case "myFavouritesEpisodes":
                textContent.push(Wuaki.language["wishlistNoContent2"].replace("*****", Wuaki.language["episode"]));
                textContent.push(Wuaki.language["seeTVShows"]);
                goMenuOption = Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["TVShows"]);
                break;
            case "myFavouritesSeasons":
                textContent.push(Wuaki.language["wishlistNoContent"].replace("*****", Wuaki.language["season"]));
                textContent.push(Wuaki.language["seeTVShows"]);
                goMenuOption = Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["TVShows"]);
                break;
            case "myLibraryMovies":
                textContent.push(Wuaki.language["purchasedNoContent"].replace("*****", Wuaki.language["movie"]));
                textContent.push(Wuaki.language["seeMovies"]);
                goMenuOption = Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["Movies"]);
                break;
            case "myLibrarySeasons":
                textContent.push(Wuaki.language["purchasedNoContent"].replace("*****", Wuaki.language["season"]));
                textContent.push(Wuaki.language["seeTVShows"]);
                goMenuOption = Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["TVShows"]);
                break;
            case "myLibraryEpisodes":
                textContent.push(Wuaki.language["purchasedNoContent2"].replace("*****", Wuaki.language["episode"]));
                textContent.push(Wuaki.language["seeTVShows"]);
                goMenuOption = Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["TVShows"]);
                break;
            default:
                textContent.push(Wuaki.language["searchNoContent"].replace("*****", this.data.mode == "movies" ? Wuaki.language["movie"] : Wuaki.language["serie"]));
                textContent.push(Wuaki.language["searchAgain"]);
                goMenuOption = Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["Search"]);
                break
        }
        var options = $('<div style="width:70%; height:70px; margin: 20px auto;"/>').appendTo(this.div);
        this.menuOptions[0] = new Object;
        this.menuOptions[0].button = $('<div boxFormButtonIndex="0"/>').addClass("boxFormButton").append($("<span/>").text(Wuaki.language["parentalSettings"]).addClass("fontMenuOptions center")).appendTo(options);
        this.addActionGoToMenu(this.menuOptions[0], Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["Settings"]), 2);
        this.menuOptions[1] = new Object;
        this.menuOptions[1].button = $('<div boxFormButtonIndex="1"/>').addClass("boxFormButton").append($("<span/>").text(textContent[1]).addClass("fontMenuOptions center")).appendTo(options);
        this.addActionGoToMenu(this.menuOptions[1], goMenuOption);
        $("<div/>").addClass("boxFormExplanation").append($("<span/>").text(textContent[0]).addClass("fontBoxFormEmpty")).appendTo(this.div);
        this.navigation = {
            left: function() {
                if (_this.focusedOption > 0) _this.prevOption();
                else Wuaki.enableElement(_this.parentMenu)
            },
            right: this.nextOption,
            down: function() {},
            up: function() {}
        };
        this.focusedOption = 0
    };
    boxFormMenu.prototype.drawOverviewBoxForm = function() {
        this.div.empty();
        var subscriptions = Wuaki.user.subscriptionPlan.subscriptions;
        var account = $('<div class="overviewAccount"/>').appendTo(this.div);
        $('<div class="overviewUserEmail">' + Wuaki.user.data.email + "</div>").addClass("fontSettingTitle").appendTo(account);
        $('<div class="overviewIsPaired">' + Wuaki.language["isPaired"] + "</div>").addClass("fontSettingExplanation").appendTo(account);
        $('<div class="overviewPairedIcon"/>').appendTo(account);
        if (Wuaki.subscriptionPlans.length == 0) {} else if (subscriptions.length == 0) {
            var subscription = $('<div class="overviewNoSubscription">').appendTo(this.div);
            $('<div class="overviewNoSubscriptionIcon"/>').appendTo(subscription);
            $('<div class="overviewNoSubscriptionPlan">' + Wuaki.language["youNotSubscribed"] + "</div>").addClass("fontSettingTitle").appendTo(subscription);
            $('<div class="overviewNoSubscriptionPlanData">' + Wuaki.language["youNotSubscribedExplanation"] + "</div>").addClass("fontSettingExplanation").appendTo(subscription);
            var options = $('<div class="overviewOptions"/>').appendTo(this.div);
            this.menuOptions[0] = new Object;
            this.menuOptions[0].button = $('<div boxFormButtonIndex="0"/>').addClass("boxFormButton").append($("<span/>").text(Wuaki.language["subscribe"]).addClass("fontMenuOptions center")).appendTo(options);
            this.menuOptions[0].action = function() {
                var data = new Object;
                data.subscription_plans = Wuaki.subscriptionPlans;
                Wuaki.processCaller = "gridMenu";
                process.subscription(_this, data, function() {
                    Wuaki.enableElement(_this.parentMenu);
                    Wuaki.currentElement.selectCurrentOption()
                })
            };
            this.navigation = {
                left: function() {
                    if (_this.focusedOption > 0) _this.prevOption();
                    else Wuaki.enableElement(_this.parentMenu)
                },
                right: this.nextOption,
                down: function() {},
                up: function() {}
            };
            this.focusedOption = 0
        } else {
            var subscription = $('<div class="overviewSubscription"/>').appendTo(this.div);
            var date = subscriptions[0].next_invoice_at;
            if (TVA.getLanguage() != "en") {
                date = date.split("-");
                date = date[2] + "-" + date[1] + "-" + date[0]
            }
            $('<div class="overviewSubscriptionIcon"/>').appendTo(subscription);
            $('<div class="overviewSubscriptionPlan">' + Wuaki.language["youSubscribedTo"] + " <br/>" + subscriptions[0].subscription_plan.name + "</div>").addClass("fontSettingTitle").appendTo(subscription);
            $('<div class="overviewSubscriptionPlanData">' + Wuaki.language["yourNextFee"] + " " + date + ".<br/>" + Wuaki.language["toUnsuscribe"] + "</div>").addClass("fontSettingExplanation").appendTo(subscription)
        }
    };
    boxFormMenu.prototype.drawPaymentsBoxForm = function() {
        this.div.empty();
        var creditcard = Wuaki.user.data.credit_card;
        if (creditcard && creditcard.type === "PaymentMethod::Paypal") {
            $('<div class="PaymentsTitle">' + Wuaki.language["paymentDetails"] + "</div>").addClass("fontHeader").appendTo(this.div);
            $('<div class="PaymentsSubTitle fontHeader">' + Wuaki.language["payPalDetails"] + '</div><div class="paypalIcon"/>').appendTo(this.div);
            $('<div class="payPalPaymentsExplaination">' + Wuaki.language["paypalPayment"] + "</div>").addClass("fontSettingExplanation").appendTo(this.div);
            $('<div class="payPalPaymentsExplaination white">' + creditcard.holder_name + "</div>").addClass("fontSettingExplanation").appendTo(this.div);
            $('<div class="payPalPaymentsExplaination">' + Wuaki.language["paypalModifyMessage"] + "</div>").addClass("fontSettingExplanation").appendTo(this.div)
        } else if (creditcard == null) {
            $('<div class="noPaymentsIcon"/>').appendTo(this.div);
            $('<div class="noPaymentsTitle">' + Wuaki.language["youHaveNotCreditCard"] + "</div>").addClass("fontSettingTitle").appendTo(this.div);
            $('<div class="noPaymentsExplaination">' + Wuaki.language["youHaveNotCreditCardExplanation"] + "</div>").addClass("fontSettingExplanation").appendTo(this.div);
            var options = $('<div class="overviewOptions"/>').appendTo(this.div);
            this.menuOptions[0] = new Object;
            this.menuOptions[0].button = $('<div boxFormButtonIndex="0"/>').addClass("boxFormButton").append($("<span/>").text(Wuaki.language["addCreditCard"]).addClass("fontMenuOptions center")).appendTo(options);
            this.menuOptions[0].action = function() {
                Wuaki.processCaller = "subMenu";
                process.creditCard()
            };
            this.navigation = {
                left: function() {
                    if (_this.focusedOption > 0) _this.prevOption();
                    else Wuaki.enableElement(_this.parentMenu)
                },
                right: this.nextOption,
                down: function() {},
                up: function() {}
            };
            this.focusedOption = 0
        } else {
            $('<div class="PaymentsTitle">' + Wuaki.language["paymentDetails"] + "</div>").addClass("fontHeader").appendTo(this.div);
            $('<div class="PaymentsSubTitle">' + Wuaki.language["creditCardDetails"] + '<div class="visa-electron"/><div class="visa"/><div class="mastercard"/></div>').addClass("fontHeader").appendTo(this.div);
            this.menuOptions[0] = new Object;
            $('<div class="PaymentsHolderName">' + Wuaki.language["cardHolderName"] + "</div>").addClass("fontsubHeader").appendTo(this.div);
            this.menuOptions[0].button = $('<div boxFormButtonIndex = "0" class="PaymentsOptions"><div class="PaymentsHolderNameInput">' + creditcard.holder_name + '</div><div boxFormButtonIndex = "0" class="editButton fontMenuOptions center">' + Wuaki.language["pressToEdit"] + "</div></div>").addClass("fontsubHeader").appendTo(this.div);
            this.menuOptions[0].action = function() {
                _this.updateHolderName()
            };
            this.menuOptions[1] = new Object;
            var holderName = creditcard.display_number.split("-");
            $('<div class="PaymentsCardNumber">' + Wuaki.language["cardNumber"] + "</div>").addClass("fontsubHeader").appendTo(this.div);
            this.menuOptions[1].button = $('<div boxFormButtonIndex = "1" class="PaymentsOptions"><div class = "PaymentsCardNumberInput"><div class="PaymentsCardNumberInput1">' + holderName[0] + '</div><div class="PaymentsCardNumberInput2">' + holderName[1] + '</div><div class="PaymentsCardNumberInput3">' + holderName[2] + '</div><div class="PaymentsCardNumberInput4">' + holderName[3] + '</div></div><div boxFormButtonIndex = "1" class="editButton fontMenuOptions center">' + Wuaki.language["pressToEdit"] + "</div></div>").addClass("fontsubHeader").appendTo(this.div);
            this.menuOptions[1].action = function() {
                _this.updateCardNumber()
            };
            this.menuOptions[2] = new Object;
            $('<div class="PaymentsExpirationDate">' + Wuaki.language["expirationDate"] + "</div>").addClass("fontsubHeader").appendTo(this.div);
            this.menuOptions[2].button = $('<div boxFormButtonIndex = "2" class="PaymentsOptions"><div class="PaymentsExpirationDateInput"><div class="PaymentsExpirationDateInput1">' + creditcard.month + '</div><div class="PaymentsExpirationDateInput2">' + creditcard.year + '</div></div><div boxFormButtonIndex = "2" class="editButton fontMenuOptions center">' + Wuaki.language["pressToEdit"] + "</div></div>").addClass("fontsubHeader").appendTo(this.div);
            this.menuOptions[2].action = function() {
                _this.updateExpirationDate()
            };
            this.menuOptions[3] = new Object;
            $('<div class="PaymentsCVV">' + Wuaki.language["CVV"] + "</div>").addClass("fontsubHeader").appendTo(this.div);
            var cvv = "***";
            this.menuOptions[3].button = $('<div boxFormButtonIndex = "3" class="PaymentsOptions"><div class="PaymentsCVVInput">' + cvv + '</div><div boxFormButtonIndex = "3" class="editButton fontMenuOptions center">' + Wuaki.language["pressToEdit"] + "</div></div>").addClass("fontsubHeader").appendTo(this.div);
            this.menuOptions[3].action = function() {
                _this.updateCVV()
            };
            this.menuOptions[4] = new Object;
            this.menuOptions[4].button = $('<div boxFormButtonIndex = "4" class="PaymentsUpdate"><div class="rightmenuIconDiv"><div class="PaymentsUpdateIcon"></div></div>' + Wuaki.language["updateCreditCardDetails"] + "</div>").addClass("fontsubHeader").appendTo(this.div);
            this.menuOptions[4].action = function() {
                Wuaki.processCaller = "subMenu";
                process.creditCard()
            };
            $('<div class="PaymentsMethods">' + Wuaki.language["paypalModifyMessage"] + "</div>").addClass("fontsubHeader").appendTo(this.div);
            this.navigation = {
                left: function() {
                    Wuaki.enableElement(_this.parentMenu)
                },
                right: function() {},
                up: function() {
                    if (_this.focusedOption > 0) _this.prevOption()
                },
                down: this.nextOption
            };
            this.focusedOption = 0
        }
    };
    boxFormMenu.prototype.drawPreferencesBoxForm = function() {
        var profile = Wuaki.user.data.profile;
        this.div.empty();
        $('<div class="PaymentsTitle">' + Wuaki.language["Preferences"] + "</div>").addClass("fontHeader").appendTo(this.div);
        var option = 0;
        this.menuOptions[option] = new Object;
        $('<div class="PreferencesHolderName">' + Wuaki.language["audioQuality"] + "</div>").addClass("fontsubHeader").appendTo(this.div);
        this.menuOptions[option].button = $('<div  boxFormButtonIndex = "' + option + '" class="PaymentsOptions"><div class="PaymentsHolderNameInput">' + profile.audio_quality.name + '</div><div boxFormButtonIndex = "' + option + '" class="editButton fontMenuOptions center">' + Wuaki.language["pressToEdit"] + "</div></div>").addClass("fontsubHeader").appendTo(this.div);
        this.menuOptions[option].action = function() {
            _this.changeAudioQuality()
        };
        option++;
        this.menuOptions[option] = new Object;
        $('<div class="PreferencesHolderName">' + Wuaki.language["audioLanguage"] + "</div>").addClass("fontsubHeader").appendTo(this.div);
        this.menuOptions[option].button = $('<div boxFormButtonIndex = "' + option + '" class="PaymentsOptions"><div class="PaymentsHolderNameInput">' + profile.language.name + '</div><div boxFormButtonIndex = "' + option + '" class="editButton fontMenuOptions center">' + Wuaki.language["pressToEdit"] + "</div></div>").addClass("fontsubHeader").appendTo(this.div);
        this.menuOptions[option].action = function() {
            _this.changeAudioLanguage()
        };
        option++;
        this.menuOptions[option] = new Object;
        $('<div class="PreferencesHolderName">' + Wuaki.language["parentalControl"] + "</div>").addClass("fontsubHeader").appendTo(this.div);
        this.menuOptions[option].button = $('<div boxFormButtonIndex = "' + option + '" class="PaymentsOptions"><div class="PaymentsHolderNameInput">' + profile.classification.description + '</div><div boxFormButtonIndex = "' + option + '" class="editButton fontMenuOptions center">' + Wuaki.language["pressToEdit"] + "</div></div>").addClass("fontsubHeader").appendTo(this.div);
        this.menuOptions[option].action = function() {
            _this.changeParentalControl()
        };
        option++;
        this.menuOptions[option] = new Object;
        $('<div class="PreferencesHolderName">' + Wuaki.language["changePassword"] + "</div>").addClass("fontsubHeader").appendTo(this.div);
        this.menuOptions[option].button = $('<div boxFormButtonIndex = "' + option + '" class="PaymentsOptions"><div class="PaymentsHolderNameInput">***************</div><div boxFormButtonIndex = "' + option + '" class="editButton fontMenuOptions center">' + Wuaki.language["pressToEdit"] + "</div></div>").addClass("fontsubHeader").appendTo(this.div);
        this.menuOptions[option].action = function() {
            _this.changePassword()
        };
        this.navigation = {
            left: function() {
                Wuaki.enableElement(_this.parentMenu)
            },
            right: function() {},
            up: function() {
                if (_this.focusedOption > 0) _this.prevOption()
            },
            down: this.nextOption
        };
        this.focusedOption = 0
    };
    boxFormMenu.prototype.drawUnpairBoxForm = function() {
        this.div.empty();
        var subscriptions = Wuaki.user.subscriptionPlan.subscriptions;
        $('<div class="unpairIcon"/>').appendTo(this.div);
        $('<div class="unpairIconTitle">' + Wuaki.language["aboutToUnpair"] + "</div>").addClass("fontSettingTitle").appendTo(this.div);
        $('<div class="unpairIconExplanation">' + Wuaki.language["aboutToUnpairExplanation"] + "</div>").addClass("fontSettingExplanation").appendTo(this.div);
        var options = $('<div class="unpairOptions"/>').appendTo(this.div);
        this.menuOptions[0] = new Object;
        this.menuOptions[0].button = $('<div boxFormButtonIndex="0"/>').addClass("boxFormButton").append($("<span/>").text(Wuaki.language["Unpair"]).addClass("fontMenuOptions center")).appendTo(options);
        this.menuOptions[0].action = function() {
            process.unpair()
        };
        this.navigation = {
            left: function() {
                if (_this.focusedOption > 0) _this.prevOption();
                else Wuaki.enableElement(_this.parentMenu)
            },
            right: this.nextOption,
            down: function() {},
            up: function() {}
        };
        this.focusedOption = 0
    };
    boxFormMenu.prototype.addActionGoToMenu = function(item, mainMenuOption, subMenuOption) {
        item.action = function() {
            var menu = Wuaki.elements[_this.data.parentMenu];
            menu.disable();
            menu.div.hide();
            Wuaki.enableElement("mainMenu");
            menu = Wuaki.elements["mainMenu"];
            menu.unfocusOption(menu.focusedOption);
            menu.focusedOption = mainMenuOption;
            menu.focusOption(mainMenuOption);
            menu.unselectOption(menu.selectedOption);
            menu.selectedOption = mainMenuOption;
            menu.selectOption(mainMenuOption);
            if (typeof subMenuOption != "undefined") Wuaki.elements["subMenu"].autoSelectConfig(subMenuOption, subMenuOption)
        }
    };
    boxFormMenu.prototype.config = function(id, name, parentMenu, data, mode) {
        if (this.id !== id) {
            Wuaki.showLoading();
            this.status.ready = false;
            this.status.autoEnable = false;
            this.navigation = new Object;
            this.id = id;
            this.parentMenu = parentMenu;
            this.data = data;
            this.name = name;
            this.mode = mode;
            this.focusedOption = 0;
            this.menuOptions = new Array;
            this.draw()
        }
        this.display()
    };
    boxFormMenu.prototype.changeVideoQuality = function() {
        Wuaki.elements["modalMenu"].config("preferenceschangeVideoQuality" + JSON.stringify(Wuaki.user.data.profile.video_quality), "modalMenu", this.name, "preferences", null, modalFillCallbacks.preferencesVideoQuality, function(output) {
            var user = Wuaki.user.data;
            var callback = function(token) {
                ApiWuaki.changeUserProfile(user.id, "", "", "", output[0].id, token, function(requestId) {
                    if (ApiWuaki.getResult(requestId) != "success") {
                        if (!process.tokenExpiration(_this, requestId, callback)) {
                            Wuaki.apiError(requestId)
                        }
                        return
                    }
                    Wuaki.user.data = ApiWuaki.getData(requestId);
                    Wuaki.cleanAllRequest();
                    boxFormConfigs.Preferences();
                    Wuaki.enableElement(_this.name)
                })
            };
            callback(user.authentication_token)
        });
        Wuaki.elements["modalMenu"].autoEnable()
    };
    boxFormMenu.prototype.changeAudioQuality = function() {
        Wuaki.elements["modalMenu"].config("preferencesChangeAudioQuality" + JSON.stringify(Wuaki.user.data.profile.audio_quality), "modalMenu", this.name, "preferences", null, modalFillCallbacks.preferencesAudioQuality, function(output) {
            var user = Wuaki.user.data;
            var callback = function(token) {
                ApiWuaki.changeUserProfile(user.id, "", output[0].id, "", "", token, function(requestId) {
                    if (ApiWuaki.getResult(requestId) != "success") {
                        if (!process.tokenExpiration(_this, requestId, callback)) {
                            Wuaki.apiError(requestId)
                        }
                        return
                    }
                    Wuaki.user.data = ApiWuaki.getData(requestId);
                    Wuaki.cleanAllRequest();
                    boxFormConfigs.Preferences();
                    Wuaki.enableElement(_this.name)
                })
            };
            callback(user.authentication_token)
        });
        Wuaki.elements["modalMenu"].autoEnable()
    };
    boxFormMenu.prototype.changeAudioLanguage = function() {
        Wuaki.elements["modalMenu"].config("preferenceschangeAudioLanguage" + JSON.stringify(Wuaki.user.data.profile.language), "modalMenu", this.name, "preferences", null, modalFillCallbacks.preferencesAudioLanguages, function(output) {
            var user = Wuaki.user.data;
            var callback = function(token) {
                ApiWuaki.changeUserProfile(user.id, "", "", output[0].id, "", token, function(requestId) {
                    if (ApiWuaki.getResult(requestId) != "success") {
                        if (!process.tokenExpiration(_this, requestId, callback)) {
                            Wuaki.apiError(requestId)
                        }
                        return
                    }
                    Wuaki.user.data = ApiWuaki.getData(requestId);
                    Wuaki.cleanAllRequest();
                    boxFormConfigs.Preferences();
                    Wuaki.enableElement(_this.name)
                })
            };
            callback(user.authentication_token)
        });
        Wuaki.elements["modalMenu"].autoEnable()
    };
    boxFormMenu.prototype.changeParentalControl = function() {
        Wuaki.elements["modalMenu"].config("preferencesChangeParentalControl" + JSON.stringify(Wuaki.user.data.profile.classification), "modalMenu", this.name, "preferences", null, modalFillCallbacks.preferencesParentalControl, function(output) {
            var user = Wuaki.user.data;
            var callback = function(token) {
                ApiWuaki.changeUserProfile(user.id, output[0].id, "", "", "", token, function(requestId) {
                    if (ApiWuaki.getResult(requestId) != "success") {
                        if (!process.tokenExpiration(_this, requestId, callback)) {
                            Wuaki.apiError(requestId)
                        }
                        return
                    }
                    Wuaki.user.data = ApiWuaki.getData(requestId);
                    Wuaki.cleanAllRequest();
                    boxFormConfigs.Preferences();
                    Wuaki.enableElement(_this.name)
                })
            };
            callback(user.authentication_token)
        });
        Wuaki.elements["modalMenu"].autoEnable()
    };
    boxFormMenu.prototype.changePassword = function() {
        Wuaki.processCaller = this.name;
        process.updatePassword()
    };
    boxFormMenu.prototype.updateHolderName = function() {
        Wuaki.elements["keyboard"].reset();
        Wuaki.elements["keyboard"].config("keyboardHolderName", this, this.name, 6, "normal", Wuaki.elements["keyboard"].stringCancelFinish, Wuaki.elements["keyboard"].fullLayoutKeyboard, Wuaki.language["nameOnCard"], Wuaki.language["nameOnCardExplanation"], function() {
            _this.data.creditCard.name = this.input.value;
            if (!_this.data.creditCard.cvv) _this.data.creditCard.cvv = "123";
            _this.div.find(".PaymentsHolderNameInput").text(_this.data.creditCard.name);
            Wuaki.enableElement(this.parentMenu);
            _this.updateCardDetails()
        }, _this.data.creditCard.name);
        Wuaki.elements["keyboard"].autoEnable()
    };
    boxFormMenu.prototype.updateCardNumber = function() {
        Wuaki.elements["keyboard"].reset();
        Wuaki.elements["keyboard"].config("keyboardCardNumber", this, this.name, 6, "numeric", Wuaki.elements["keyboard"].numericCardNumberOnly, Wuaki.elements["keyboard"].numericKeyboard, Wuaki.language["cardNumber"], '<div class="mastercard"/><div class="visa"/><div class="visa-electron"/>' + Wuaki.language["cardNumberExplanation"], function() {
            _this.data.creditCard.number = this.input.value;
            if (!_this.data.creditCard.cvv) _this.data.creditCard.cvv = "123";
            var cardNumbers = _this.data.creditCard.number.match(/..../g);
            Wuaki.enableElement(this.parentMenu);
            _this.updateCardDetails()
        }, _this.data.creditCard.number);
        Wuaki.elements["keyboard"].autoEnable()
    };
    boxFormMenu.prototype.updateExpirationDate = function() {
        Wuaki.elements["keyboard"].reset();
        Wuaki.elements["keyboard"].config("keyboardCardExpiration", this, this.name, 6, "numeric", Wuaki.elements["keyboard"].numericExpirationOnly, Wuaki.elements["keyboard"].numericKeyboard, Wuaki.language["expirationDate"], Wuaki.language["expirationDateExplanation"], function() {
            _this.data.creditCard.expiration = this.input.value.match(/.{1,2}/g);
            if (!_this.data.creditCard.cvv) _this.data.creditCard.cvv = "123";
            _this.div.find(".PaymentsExpirationDateInput1").text(_this.data.creditCard.expiration[0]);
            _this.div.find(".PaymentsExpirationDateInput2").text(_this.data.creditCard.expiration[1]);
            Wuaki.enableElement(this.parentMenu);
            _this.updateCardDetails()
        }, _this.data.creditCard.expiration.join(""));
        Wuaki.elements["keyboard"].autoEnable()
    };
    boxFormMenu.prototype.updateCVV = function() {
        Wuaki.elements["keyboard"].reset();
        Wuaki.elements["keyboard"].config("keyboardCardExpiration", this, this.name, 6, "numeric", Wuaki.elements["keyboard"].numericCVVOnly, Wuaki.elements["keyboard"].numericKeyboard, Wuaki.language["CVV"], Wuaki.language["CVVExplanation"], function() {
            _this.data.creditCard.cvv = this.input.value;
            _this.div.find(".PaymentsCVVInput").text("***");
            Wuaki.enableElement(this.parentMenu);
            _this.updateCardDetails()
        }, "");
        Wuaki.elements["keyboard"].autoEnable()
    };
    boxFormMenu.prototype.updateCardDetails = function() {
        var _this = this;
        var callback = function(token) {
            var legacy = !(Wuaki.user.data.migrated_to_global == true);
            Wuaki.showLoading();
            ApiWuaki.addCreditCardParams(legacy, Wuaki.user.data.id, Wuaki.user.data.email, _this.data.creditCard.name, _this.data.creditCard.expiration[0], _this.data.creditCard.expiration[1], _this.data.creditCard.number, _this.data.creditCard.cvv, token, function(requestId) {
                Wuaki.hideLoading();
                if ("success" === ApiWuaki.getResult(requestId)) {
                    var requestData = ApiWuaki.getData(requestId);
                    if (requestData.errorCode != null) {
                        var res = "";
                        if (requestData.errorMessage.indexOf("cardNumber") != -1 || requestData.errorMessage.indexOf("check digit") != -1) res += Wuaki.language["inv_cardNumber"] + "<br/>";
                        if (requestData.errorMessage.indexOf("brand") != -1) res += Wuaki.language["inv_brand"] + "<br/>";
                        if (requestData.errorMessage.indexOf("expirationYear") != -1) res += Wuaki.language["inv_year"] + "<br/>";
                        if (requestData.errorMessage.indexOf("expirationMonth") != -1) res += Wuaki.language["inv_month"] + "<br/>";
                        if (requestData.errorMessage.indexOf("serviceId") != -1) res += Wuaki.language["inv_serviceId"] + "<br/>";
                        var data = {
                            message: res,
                            modalTitle: Wuaki.language["error"],
                            buttonText: Wuaki.language["ok"]
                        };
                        Wuaki.elements["modalMenu"].config("CreditCardMessageError" + JSON.stringify(requestData), "modalMenu", Wuaki.currentElement.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                            Wuaki.storedKeyboard = 0;
                            Wuaki.keyboardRestoreConfig();
                            Wuaki.enableElement("keyboard")
                        });
                        Wuaki.elements["modalMenu"].autoEnable()
                    } else if (requestData.hasOwnProperty("verified")) {
                        var data = {};
                        data.message = Wuaki.language["validationFail"];
                        data.modalTitle = Wuaki.language["error"];
                        data.buttonText = Wuaki.language["ok"];
                        Wuaki.elements["modalMenu"].config("CreditCardMessageError" + +JSON.stringify(requestData), "modalMenu", Wuaki.currentElement.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                            Wuaki.storedKeyboard = 0;
                            Wuaki.keyboardRestoreConfig();
                            Wuaki.enableElement("keyboard")
                        });
                        Wuaki.elements["modalMenu"].autoEnable()
                    } else {
                        var cardNumbers = requestData.credit_card.display_number.split("-");
                        _this.div.find(".PaymentsCardNumberInput1").text(cardNumbers[0]);
                        _this.div.find(".PaymentsCardNumberInput2").text(cardNumbers[1]);
                        _this.div.find(".PaymentsCardNumberInput3").text(cardNumbers[2]);
                        _this.div.find(".PaymentsCardNumberInput4").text(cardNumbers[3]);
                        Wuaki.login(function() {
                            Wuaki.enableElement(_this.name)
                        })
                    }
                } else if (!process.tokenExpiration(_this, requestId, callback)) {
                    var data = ApiWuaki.getError(requestId);
                    data.modalTitle = Wuaki.language["error"];
                    data.buttonText = Wuaki.language["fixIt"];
                    Wuaki.elements["modalMenu"].config("CreditCardMessageError" + JSON.stringify(_this.data.creditCard), "modalMenu", _this.name, "errorMessage", data, modalFillCallbacks.errorModal, function() {
                        Wuaki.enableElement(this.parentMenu)
                    });
                    Wuaki.elements["modalMenu"].autoEnable()
                }
                ApiWuaki.cleanRequest(requestId)
            })
        };
        callback(Wuaki.user.data.authentication_token)
    };
    boxFormMenu.prototype.nav = function(keycode) {
        switch (keycode) {
            case VK_UP:
                this.navigation.up();
                break;
            case VK_DOWN:
                this.navigation.down();
                break;
            case VK_LEFT:
                this.navigation.left();
                break;
            case VK_RIGHT:
                this.navigation.right();
                break;
            case VK_BDR_ENTER:
            case VK_CROSS:
                this.selectCurrentOption();
                break;
            case VK_BDR_RETURN:
            case VK_CIRCLE:
            case Wuaki.FOOTER_BACK:
                Wuaki.enableElement(this.parentMenu);
                break;
            default:
                break
        }
    };
    boxFormMenu.prototype.focusOption = function(option) {
        _this.focusedOption = option;
        _this.menuOptions[option].button.addClass("hover")
    };
    boxFormMenu.prototype.focusCurrentOption = function() {
        _this.menuOptions[_this.focusedOption].button.addClass("hover")
    };
    boxFormMenu.prototype.unfocusOption = function() {
        _this.menuOptions[_this.focusedOption].button.removeClass("hover")
    };
    boxFormMenu.prototype.selectCurrentOption = function() {
        _this.menuOptions[_this.focusedOption].action(_this)
    };
    boxFormMenu.prototype.nextOption = function() {
        if (_this.focusedOption + 1 < _this.menuOptions.length) {
            _this.unfocusOption();
            _this.focusedOption++;
            _this.focusCurrentOption()
        }
    };
    boxFormMenu.prototype.prevOption = function() {
        if (_this.focusedOption - 1 >= 0) {
            _this.unfocusOption();
            _this.focusedOption--;
            _this.focusCurrentOption()
        }
    }
}
var boxFormConfigs = {
    Overview: function() {
        var data = {};
        Wuaki.elements["boxFormMenu"].config("boxFormMenuOverview" + Wuaki.user.data.id + JSON.stringify(Wuaki.user.subscriptionPlan), "boxFormMenu", "subMenu", data, "OverviewBoxForm");
        Wuaki.elements["boxFormMenu"].display()
    },
    Payments: function() {
        var data = {};
        Wuaki.elements["boxFormMenu"].config("boxFormMenuPayments" + JSON.stringify(Wuaki.user.data.credit_card), "boxFormMenu", "subMenu", data, "PaymentsBoxForm");
        Wuaki.elements["boxFormMenu"].display()
    },
    Preferences: function() {
        var data = {};
        Wuaki.elements["boxFormMenu"].config("boxFormMenuPreferences" + JSON.stringify(Wuaki.user.data.profile), "boxFormMenu", "subMenu", data, "PreferencesBoxForm");
        Wuaki.elements["boxFormMenu"].display()
    },
    Unpair: function() {
        var data = {};
        Wuaki.elements["boxFormMenu"].config("boxFormMenuUnpair", "boxFormMenu", "subMenu", data, "UnpairBoxForm");
        Wuaki.elements["boxFormMenu"].display()
    }
};
deepLinking = {
    MODES: {
        NONE: 0,
        YOSEMITE: 1,
        NSCREEN: 2,
        LG: 3,
        YOSEMITE2: 4,
        PLAYSTATION: 5
    },
    V_QUALITY: {
        SUBSCRIPTION: "00",
        SD: "01",
        HD: "02"
    },
    OPERATION: {
        PURCHASE: "01",
        RENT: "02",
        SUBSCRIPTION: "03"
    },
    mode: 0,
    URLParameters: {},
    checkInterval: "null",
    active: false,
    checkDeeplinkingMode: function(callback) {
        deepLinking.getURLParameters(function() {
            if (deepLinking.getMode() != deepLinking.MODES.NONE && deepLinking.getMode() != deepLinking.MODES.NSCREEN) {
                callback(deepLinking.active = true)
            } else callback(deepLinking.active = false)
        })
    },
    isActive: function() {
        return this.active
    },
    getURLParameters: function(callback) {
        if (TVA.device.match(/ps4/i) && TVA.WebMAF.getExternalParameter) {
            TVA.WebMAF.getExternalParameter(function(externalData) {
                deepLinking.URLParameters = externalData;
                callback()
            })
        } else {
            var parameters = window.location.search.substring(1).split("&");
            for (var i = 0; i < parameters.length; i++) {
                var param = parameters[i].split("=");
                deepLinking.URLParameters[decodeURIComponent(param[0])] = decodeURIComponent(param[1])
            }
            callback()
        }
        deepLinking.getURLParameters = function() {
            return deepLinking.URLParameters
        }
    },
    getMode: function() {
        if (typeof deepLinking.URLParameters.data !== "undefined") {
            if (typeof deepLinking.URLParameters.data != "undefined") {
                var urlData = JSON.parse(deepLinking.URLParameters.data) || {};
                if (typeof urlData.token != "undefined" && typeof urlData.actionType != "undefined") deepLinking.mode = deepLinking.MODES.YOSEMITE2;
                else deepLinking.mode = deepLinking.MODES.YOSEMITE
            }
        } else if (typeof deepLinking.URLParameters.nscreen !== "undefined") {
            deepLinking.mode = deepLinking.MODES.NSCREEN
        } else if (typeof deepLinking.URLParameters.titleid !== "undefined") {
            deepLinking.mode = deepLinking.MODES.LG
        } else if (typeof deepLinking.URLParameters.value !== "undefined") {
            deepLinking.mode = deepLinking.MODES.PLAYSTATION
        } else {
            deepLinking.mode = deepLinking.MODES.NONE
        }
        return deepLinking.mode
    },
    manager: function(caller) {
        switch (deepLinking.getMode()) {
            case deepLinking.MODES.YOSEMITE:
                deepLinking.getLaunchParameters();
                return deepLinking.process(caller);
                break;
            case deepLinking.MODES.YOSEMITE2:
                deepLinking.getLaunchParameters();
                deepLinking.launchPlayerPlayback();
                break;
            case deepLinking.MODES.LG:
            case deepLinking.MODES.PLAYSTATION:
                deepLinking.getLaunchParameters();
                return deepLinking.loadDetailsPage(caller);
                break;
            case deepLinking.MODES.NSCREEN:
                deepLinking.launchPlayerPlayback();
                break;
            case deepLinking.MODES.NONE:
            default:
                return false;
                break
        }
    },
    launchPlayerPlayback: function() {
        switch (deepLinking.launchParameters.actionType) {
            case "play":
                var callback = function(requestId) {
                    if (ApiWuaki.getResult(requestId) == "success") {
                        var data = ApiWuaki.getData(requestId);
                        data.id = deepLinking.launchParameters.mediaId;
                        data.playbackTime = deepLinking.launchParameters.playbackTime;
                        var stream = {
                            id: deepLinking.launchParameters.streamId
                        };
                        deepLinking.enablePlayer(data, stream, {
                            name: "deepLinkingMenu"
                        }, deepLinking.launchParameters.token)
                    } else deepLinking.loadNormalApplication()
                };
                if (deepLinking.launchParameters.mode == "movie") ApiWuaki.gettingMovieDetail(deepLinking.launchParameters.mediaId, deepLinking.launchParameters.token, callback);
                else ApiWuaki.gettingEpisodeDetail("", deepLinking.launchParameters.mediaId, deepLinking.launchParameters.token, callback);
                break;
            default:
                break
        }
    },
    createDeepLinkingMenu: function() {
        Wuaki.dimissSplashLoadingScreen();
        Wuaki.elements["deepLinkingMenu"] = new deeplinkingMenu;
        Wuaki.elements["deepLinkingMenu"].init($("#deeplinking"), "deepLinkingMenu");
        Wuaki.elements["deepLinkingMenu"].config("deepLinkingMenu", "deepLinkingMenu", "", "deepLinking", {}, null, null);
        Wuaki.elements["deepLinkingMenu"].enable();
        Wuaki.elements["deepLinkingMenu"].selectCurrentOption()
    },
    process: function(caller) {
        if (!Wuaki.isPremiumUser() && (deepLinking.launchParameters.operation == deepLinking.OPERATION.SUBSCRIPTION || deepLinking.launchParameters.videoQuality == deepLinking.V_QUALITY.SUBSCRIPTION)) {
            deepLinking.processSubscription(caller)
        } else if (!Wuaki.statusLogged) {
            Wuaki.processCaller = caller.name;
            Wuaki.elements["splashMenu"].config("splashPairingFromPurchaseOptions", "splashMenu", "deepLinkingMenu", "splashPairing", {}, null, null);
            Wuaki.elements["splashMenu"].autoEnable()
        } else {
            var auth_token = Wuaki.user.data.authentication_token;
            var callback = function(requestId) {
                if (ApiWuaki.getResult(requestId) == "success") {
                    var data = ApiWuaki.getData(requestId);
                    if (data.playback_settings && data.playback_settings.streams && data.playback_settings.streams.length > 0) {
                        deepLinking.processPlayback(data, caller)
                    } else if (data.purchase_options && data.purchase_options.length > 0 && deepLinking.launchParameters.operation != deepLinking.OPERATION.SUBSCRIPTION) {
                        deepLinking.processRentPurchase(data, caller)
                    } else deepLinking.loadNormalApplication()
                } else deepLinking.loadNormalApplication()
            };
            if (deepLinking.launchParameters.mode == "movie") ApiWuaki.gettingMovieDetail(deepLinking.launchParameters.id, auth_token, callback);
            else ApiWuaki.gettingEpisodeDetail("", deepLinking.launchParameters.id, auth_token, callback)
        }
        return true
    },
    processSubscription: function(caller) {
        var data = {};
        Wuaki.processCaller = caller.name;
        data.subscription_plans = Wuaki.subscriptionPlans;
        process.subscription(caller, data, function() {
            Wuaki.cleanAllRequest();
            Wuaki.enableElement(caller.name);
            Wuaki.currentElement.selectCurrentOption()
        })
    },
    processPlayback: function(data, caller) {
        var results = new Array;
        var videoQuality = deepLinking.launchParameters.videoQuality == deepLinking.V_QUALITY.HD ? "HD" : "SD";
        var search = data.playback_settings.streams;
        for (i in search) {
            if (search[i].video_quality.abbr == videoQuality) results.push(search[i])
        }
        if (results.length != 0) {
            search = results;
            results = new Array
        }
        for (i in search) {
            if (search[i].language.id == Wuaki.user.data.profile.language.id) results.push(search[i])
        }
        if (results.length == 0) results = search;
        deepLinking.enablePlayer(data, results[0], caller)
    },
    enablePlayer: function(data, stream, caller, forceAuthToken) {
        var mode, streamType = Wuaki.moviesStreamType;
        var _data = data;
        var auth_token;
        if (forceAuthToken) auth_token = forceAuthToken;
        else auth_token = Wuaki.user.data.authentication_token;
        Wuaki.showLoading();
        switch (deepLinking.launchParameters.mode) {
            case "movie":
                APICall = ApiWuaki.gettingMovieStreams;
                mode = "movies";
                break;
            case "season":
            case "episode":
                mode = "episodes";
                APICall = ApiWuaki.gettingEpisodeStreams;
                break
        }
        Wuaki.elements["playerMenu"].disablePlayer();
        APICall(data.id, stream.id, auth_token, function(requestId) {
            if ("success" === ApiWuaki.getResult(requestId)) {
                var stream = ApiWuaki.getData(requestId);
                ApiWuaki.cleanRequest(requestId);
                Wuaki.elements["playerMenu"].config("playerMenu" + JSON.stringify(stream), "playerMenu", caller.name, _data, mode);
                Wuaki.elements["playerMenu"].fill(stream, _data.id, streamType, _data.playbackTime);
                Wuaki.enableElement("playerMenu")
            } else {
                var data = ApiWuaki.getError(requestId);
                data.modalTitle = Wuaki.language["error"];
                data.buttonText = Wuaki.language["ok"];
                Wuaki.elements["modalMenu"].config("PlaybackGetStreamMessageError" + JSON.stringify(data), "modalMenu", caller.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                    Wuaki.cleanAllRequest();
                    Wuaki.enableElement("deepLinkingMenu")
                });
                Wuaki.elements["modalMenu"].autoEnable()
            }
        })
    },
    processRentPurchase: function(data, caller) {
        var results = new Array;
        var videoQuality = deepLinking.launchParameters.videoQuality == deepLinking.V_QUALITY.HD ? "HD" : "SD";
        var purchaseType = deepLinking.launchParameters.operation == deepLinking.OPERATION.RENT ? "rental" : "purchase";
        var search = data.purchase_options;
        for (i in search) {
            if (search[i].video_quality.abbr == videoQuality && search[i].purchase_type.type == purchaseType) {
                data.currentPurchasedOption = i;
                results.push(search[i])
            }
        }
        if (results.length == 0) deepLinking.loadNormalApplication();
        else {
            var purchaseOptions = results[0];
            if (purchaseOptions.price > 0) Wuaki.fromPurchase = true;
            if (purchaseOptions.price > 0 && Wuaki.user.data.credit_card == null) {
                Wuaki.processCaller = caller.name;
                process.preCreditCard()
            } else {
                data.isACoupon = false;
                switch (deepLinking.launchParameters.mode) {
                    case "movie":
                        data.detailsMode = "movies";
                        break;
                    case "episode":
                        data.detailsMode = "episodes";
                        break;
                    case "season":
                        data.detailsMode = "seasons";
                        break
                }
                Wuaki.elements["modalMenu"].config("purchasing" + JSON.stringify(purchaseOptions), "modalMenu", caller.name, "purchasing", data, modalFillCallbacks.purchasingOrCouponModal, function(output) {
                    Wuaki.elements["modalMenu"].purchasingProcessModal();
                    var purchaseable_type = deepLinking.launchParameters.mode,
                        purchaseable_id = data.id;
                    ApiWuaki.purchase(results[0].id, Wuaki.user.data.authentication_token, function(requestId) {
                        if ("success" === ApiWuaki.getResult(requestId) || "timeout" === ApiWuaki.getResult(requestId)) {
                            if (!Wuaki.asyncPurchase) {
                                Wuaki.cleanAllRequest();
                                Wuaki.enableElement(caller.name);
                                caller.selectCurrentOption();
                                TVA_GoogleAnalytics.analyticMark(TVA.device + "/navigation", "Purchase/" + purchaseable_id + "/" + purchaseOptions.video_quality.abbr)
                            } else {
                                var auth_token = Wuaki.user.data.authentication_token,
                                    id_user = Wuaki.user.data.id;
                                Wuaki.elements["detailsMenu"].purchaseStatusCheck(id_user, purchaseable_id, purchaseable_type, auth_token, function(requestId) {
                                    Wuaki.cleanAllRequest();
                                    Wuaki.enableElement(caller.name);
                                    caller.selectCurrentOption();
                                    TVA_GoogleAnalytics.analyticMark(TVA.device + "/navigation", "Purchase/" + purchaseable_id + "/" + purchaseOptions.video_quality.abbr)
                                })
                            }
                        } else {
                            var data = ApiWuaki.getError(requestId);
                            var type;
                            if (data["class"] == "Wuaki::Exceptions::AlreadyPurchasedException") {
                                data.modalTitle = Wuaki.language["message"];
                                data.buttonText = Wuaki.language["ok"];
                                type = "message"
                            } else {
                                data.modalTitle = Wuaki.language["error"];
                                data.buttonText = Wuaki.language["ok"];
                                type = "errorMessage"
                            }
                            Wuaki.elements["modalMenu"].config("PurchasingMessageError" + JSON.stringify(data), "modalMenu", caller.name, type, data, modalFillCallbacks.errorModal, function(output) {
                                Wuaki.cleanAllRequest();
                                Wuaki.enableElement(caller.name);
                                caller.selectCurrentOption()
                            });
                            Wuaki.elements["modalMenu"].autoEnable()
                        }
                        ApiWuaki.cleanRequest(requestId)
                    })
                });
                Wuaki.elements["modalMenu"].autoEnable()
            }
        }
    },
    getLaunchParameters: function() {
        switch (deepLinking.getMode()) {
            case deepLinking.MODES.YOSEMITE:
                var data = JSON.parse(deepLinking.URLParameters.data);
                var launchParameters = data.contentid.split("|");
                var modeId = launchParameters[0].split("_");
                deepLinking.launchParameters = {
                    mode: modeId[0],
                    id: modeId[1],
                    videoQuality: launchParameters[1],
                    operation: launchParameters[2]
                };
                break;
            case deepLinking.MODES.YOSEMITE2:
                deepLinking.launchParameters = JSON.parse(deepLinking.URLParameters.data);
                for (item in deepLinking.launchParameters) {
                    if (typeof deepLinking.launchParameters[item] != "string") {
                        deepLinking.launchParameters[item] = deepLinking.launchParameters[item][0]
                    }
                }
                switch (deepLinking.launchParameters.mediaType) {
                    case "Movie":
                        deepLinking.launchParameters.mode = "movie";
                        break;
                    default:
                        deepLinking.launchParameters.mode = "episode";
                        break
                }
                break;
            case deepLinking.MODES.LG:
                var data = deepLinking.URLParameters.titleid;
                var launchParameters = data.split("|");
                var modeId = launchParameters[0].split("_");
                deepLinking.launchParameters = {
                    mode: modeId[0],
                    id: modeId[1].replace("id", "")
                };
                break;
            case deepLinking.MODES.PLAYSTATION:
                var data = deepLinking.URLParameters.value;
                var launchParameters = data.split("|");
                var modeId = launchParameters[0].split("_");
                deepLinking.launchParameters = {
                    mode: modeId[0],
                    id: modeId[1].replace("id", "")
                };
                break;
            case deepLinking.MODES.NSCREEN:
                break
        }
        deepLinking.getLaunchParameters = function() {}
    },
    loadDetailsPage: function(caller) {
        var mode, callback;
        switch (deepLinking.launchParameters.mode) {
            case "movie":
                callback = detailsFillCallbacks.movie;
                mode = "movies";
                break;
            case "episode":
                mode = "episodes";
                callback = detailsFillCallbacks.episode;
                break;
            case "season":
                mode = "seasons";
                callback = detailsFillCallbacks.season;
                break
        }
        $("#version").hide();
        Wuaki.elements["detailsMenu"].config("deepLinkingDetails" + mode + deepLinking.launchParameters.id, {
            id: deepLinking.launchParameters.id
        }, caller.name, mode, callback);
        Wuaki.elements["detailsMenu"].autoEnable();
        deepLinking.checkInterval = window.setInterval(function() {
            if (Wuaki.elements["detailsMenu"].ready()) {
                var titleid = deepLinking.URLParameters.titleid || deepLinking.URLParameters.value;
                if (deepLinking.launchParameters.mode == "season" && titleid.split("|").length > 1) {
                    var item = Wuaki.elements["detailsMenu"].detailsData.episodes.episodes[commonTools.arrayObjectIndexOf(Wuaki.elements["detailsMenu"].detailsData.episodes.episodes, Number(titleid.split("|")[1].split("_")[1].replace("id", "")), "id")];
                    item.seasonData = Wuaki.elements["detailsMenu"].detailsData;
                    Wuaki.elements["detailsMenu"].config("detailsEpisodes" + item.id, item, caller.name, "episodes", detailsFillCallbacks.episode);
                    Wuaki.elements["detailsMenu"].autoEnable()
                }
                window.clearInterval(deepLinking.checkInterval);
                Wuaki.dimissSplashLoadingScreen()
            }
        }, 200)
    },
    loadNormalApplication: function() {
        deepLinking.active = false;
        Wuaki.enableElement("mainMenu");
        $("#main").show();
        Wuaki.elements["mainMenu"].selectCurrentOption();
        Wuaki.elements["gridMenu"].status.boot = true
    },
    convergenceManager: function(sParam) {
        deepLinking.launchParameters = JSON.parse(sParam);
        for (item in deepLinking.launchParameters) {
            if (typeof deepLinking.launchParameters[item] != "string") {
                deepLinking.launchParameters[item] = deepLinking.launchParameters[item][0]
            }
        }
        switch (deepLinking.launchParameters.mediaType) {
            case "Movie":
                deepLinking.launchParameters.mode = "movie";
                break;
            default:
                deepLinking.launchParameters.mode = "episode";
                break
        }
        deepLinking.URLParameters = {
            nscreen: true
        };
        deepLinking.active = true;
        if (Wuaki.currentElement) Wuaki.currentElement.hide();
        deepLinking.createDeepLinkingMenu()
    }
};

function deeplinkingMenu() {
    var div;
    var name, parentMenu;
    var status;
    var mode;
    var focusedOption, selectedOption;
    var menuOptions;
    var data;
    var _this = this;
    deeplinkingMenu.prototype.init = function(div, name) {
        this.name = name;
        this.div = div;
        this.status = new Object;
        this.status.visible = false;
        this.status.enable = false;
        this.status.ready = false;
        this.menuOptions = new Array
    };
    deeplinkingMenu.prototype.ready = function() {
        return this.status.ready
    };
    deeplinkingMenu.prototype.autoEnable = function() {
        this.status.autoEnable = true;
        if (this.status.ready) Wuaki.enableElement(this.name)
    };
    deeplinkingMenu.prototype.enable = function() {
        Wuaki.currentElement = this;
        if (this.menuOptions.length > 0) this.focusCurrentOption();
        this.drawFooter();
        Wuaki.elements["keyboard"].hide();
        $("#main").hide();
        this.display();
        this.status.enable = true;
        Wuaki.hideLoading()
    };
    deeplinkingMenu.prototype.disable = function() {
        this.status.enable = false;
        this.hide()
    };
    deeplinkingMenu.prototype.display = function() {
        this.status.visible = true;
        this.div.show()
    };
    deeplinkingMenu.prototype.hide = function() {
        this.status.visible = false;
        this.div.hide()
    };
    deeplinkingMenu.prototype.reset = function() {};
    deeplinkingMenu.prototype.draw = function() {
        switch (this.mode) {
            case "deepLinking":
                this.drawDeepLinking();
                break;
            default:
                break
        }
        this.addMouseEvents()
    };
    deeplinkingMenu.prototype.addMouseEvents = function() {
        this.div.find("[menuOption]").unbind().bind("mouseenter", this, function(event) {
            var element = event.data;
            element.unfocusOption();
            element.focusOption(Number($(this).attr("menuOption")));
            if (Wuaki.currentElement.name != element.name) Wuaki.enableElementFromError(element.name)
        }).bind("mouseleave", this, function() {}).bind("click", this, function(event) {
            var element = event.data;
            element.selectCurrentOption()
        }).addClass("pointer")
    };
    deeplinkingMenu.prototype.drawDeepLinking = function() {
        this.div.empty();
        $('<div class="deepLinkingTitle"/>').text(Wuaki.language["WhatOption"]).appendTo(this.div);
        var pos = this.menuOptions.length;
        if (!TVA.device.match(/ps3|ps4|psvita/i)) {
            this.menuOptions[pos] = new Object;
            this.menuOptions[pos].button = $('<div menuOption="' + pos + '" ><div class="deepLinkingBack"/><div class="deepLinkingButtonText">' + Wuaki.language["Exit"] + '</div><div class="splashButtonSubText">' + (TVA.device == "sony" ? Wuaki.language["goToSamsungYosemite"] : "") + "</div></div>").addClass("splashBigButton").css("float", "left").css("margin", "0px 10px");
            this.menuOptions[pos].action = function() {
                process.exit(_this)
            }
        }
        pos = this.menuOptions.length;
        this.menuOptions[pos] = new Object;
        this.menuOptions[pos].button = $('<div menuOption="' + pos + '"><div class="deepLinkingWuaki"/><div class="deepLinkingButtonText">' + Wuaki.language["goToWuakiTV"] + '</div><div class="splashButtonSubText">' + Wuaki.language["goToWuakiTVExplanation"] + "</div></div>").addClass("splashBigButton").css("float", "left").css("margin", "0px 10px");
        this.menuOptions[pos].action = function() {
            deepLinking.loadNormalApplication()
        };
        pos = this.menuOptions.length;
        this.menuOptions[pos] = new Object;
        this.menuOptions[pos].button = $('<div menuOption="' + pos + '"><div class="deepLinkingNext"/><div class="deepLinkingButtonText">' + Wuaki.language["Return"] + '</div><div class="splashButtonSubText">' + Wuaki.language["backToPreviousStep"] + "</div></div>").addClass("splashBigButton").css("float", "left").css("margin", "0px 10px");
        this.menuOptions[pos].action = function() {
            deepLinking.manager(_this)
        };
        var buttons = $("<div/>");
        for (pos in this.menuOptions) {
            buttons.append(this.menuOptions[pos].button)
        }
        buttons.addClass("deepLinkingOptions").appendTo(this.div);
        $('<div class="splashRakutenLogo"/>').appendTo(this.div);
        this.focusedOption = this.menuOptions.length - 1
    };
    deeplinkingMenu.prototype.config = function(id, name, parentMenu, mode, data, callbackFill, callbackDone) {
        if (this.id !== id) {
            Wuaki.showLoading();
            this.status.ready = false;
            this.status.autoEnable = false;
            this.id = id;
            this.parentMenu = parentMenu;
            this.data = data;
            this.name = name;
            this.mode = mode;
            this.focusedOption = 2;
            this.menuOptions = new Array;
            this.callbackFill = callbackFill;
            this.callbackDone = callbackDone;
            if (this.callbackFill != null) this.callBackFill();
            else this.draw()
        }
        this.status.ready = true;
        if (this.status.autoEnable) Wuaki.enableElement(this.name)
    };
    deeplinkingMenu.prototype.fill = function(data) {
        this.data = data;
        this.draw()
    };
    deeplinkingMenu.prototype.drawFooter = function() {
        if (Wuaki.background != "resources/images/1w_pixel_bg.jpg") Wuaki.elements["footerMenu"].div.removeClass("white");
        switch (this.mode) {
            case "deepLinking":
                if (!TVA.device.match(/ps3|ps4|psvita/i)) Wuaki.elements["footerMenu"].drawExit();
                Wuaki.elements["footerMenu"].drawSelect();
                Wuaki.elements["footerMenu"].drawNavigateLeftRight();
                Wuaki.elements["footerMenu"].applyNewContent();
                break;
            default:
                Wuaki.elements["footerMenu"].hide();
                break
        }
    };
    deeplinkingMenu.prototype.nav = function(keycode) {
        switch (keycode) {
            case VK_UP:
                break;
            case VK_DOWN:
                break;
            case VK_LEFT:
                this.prevOption();
                break;
            case VK_RIGHT:
                this.nextOption();
                break;
            case VK_BDR_ENTER:
            case VK_CROSS:
                this.selectCurrentOption();
                break;
            case VK_BDR_RETURN:
            case VK_CIRCLE:
            case Wuaki.FOOTER_BACK:
                process.exit(this);
                break;
            default:
                break
        }
    };
    deeplinkingMenu.prototype.focusOption = function(option) {
        this.focusedOption = option;
        this.menuOptions[option].button.addClass("hover")
    };
    deeplinkingMenu.prototype.focusCurrentOption = function() {
        this.menuOptions[this.focusedOption].button.addClass("hover")
    };
    deeplinkingMenu.prototype.unfocusOption = function() {
        this.menuOptions[this.focusedOption].button.removeClass("hover")
    };
    deeplinkingMenu.prototype.selectCurrentOption = function() {
        this.hide();
        this.menuOptions[this.focusedOption].action()
    };
    deeplinkingMenu.prototype.nextOption = function() {
        if (this.focusedOption + 1 < this.menuOptions.length) {
            this.unfocusOption();
            this.focusedOption++;
            this.focusCurrentOption()
        }
    };
    deeplinkingMenu.prototype.prevOption = function() {
        if (this.focusedOption - 1 >= 0) {
            this.unfocusOption();
            this.focusedOption--;
            this.focusCurrentOption()
        }
    }
}

function detailsMenu() {
    var div;
    var _this = this;
    var name, currentMenuName;
    var menuHeaderElements, parentMenu;
    var focusedOption, selectedOption;
    var menuOptions, menuOptionsTop, menuOptionsBottom;
    var menuCarousel, menuCarouselBottom, menuCarouselTop;
    var fillRequestId;
    var reloadStatus;
    var status, pairingProcess;
    var id, callbackFill, parent, detailsData, mode;
    detailsMenu.prototype.init = function(div, name, parentMenu, focusedOption, selectedOption) {
        this.div = div;
        this.reloadStatus = false;
        this.status = new Object;
        this.status.visible = false;
        this.status.ready = false;
        this.status.enable = false;
        this.status.autoEnable = false;
        this.name = name;
        this.focusedOption = focusedOption;
        this.selectedOption = selectedOption;
        this.parentMenu = parentMenu;
        this.menuOptions = new Object;
        this.menuOptionsTop = new Array;
        this.menuOptionsBottom = new Array;
        this.id = this.callbackFill = null;
        this.pairingProcess = false;
        this.drawCarousels(this.div.find("#details_right_menu"))
    };
    detailsMenu.prototype.ready = function() {
        return this.status.ready
    };
    detailsMenu.prototype.autoEnable = function() {
        this.status.autoEnable = true;
        if (this.status.ready) Wuaki.enableElement(this.name)
    };
    detailsMenu.prototype.enable = function() {
        Wuaki.currentElement = this;
        if (this.mode == "profiles") {
            $("#version").hide();
            $("#main_left_menu").hide();
            $("#main_left_submenu").hide();
            $("#details_content").hide();
            $("#details_right_menu").css("left", "55px").addClass("grid");
            $("#main").show()
        } else {
            $("#main").hide();
            if (this.parent.homescreen == true) Wuaki.elements["homescreenMenu"].hide();
            $("#details_right_menu").css("left", "").removeClass("grid");
            $("#details_content").show()
        }
        this.display();
        this.focusOption(this.focusedOption);
        this.status.enable = true;
        this.status.autoEnable = false;
        this.drawFooter();
        Wuaki.hideLoading();
        TVA_GoogleAnalytics.analyticMark(TVA.device + "/navigation", "Details/" + this.parent.title);
        if (this.contentNotAvailable && Wuaki.elements["modalMenu"].id !== "notAllowedContent" + this.id) {
            var message = this.mode == "movies" ? Wuaki.language["notAllowedContentMessage"] : Wuaki.language["notAllowedContentMessage3"];
            Wuaki.elements["modalMenu"].config("notAllowedContent" + this.id, "modalMenu", "detailsMenu", "message", message, modalFillCallbacks.notAllowedContent, function(output) {
                Wuaki.enableElement("detailsMenu")
            });
            Wuaki.elements["modalMenu"].autoEnable()
        }
    };
    detailsMenu.prototype.drawFooter = function() {
        if (Wuaki.background != "resources/images/1w_pixel_bg.jpg") Wuaki.elements["footerMenu"].div.removeClass("white");
        Wuaki.elements["footerMenu"].drawLoginStatus(TVA.device == "ps4" ? false : true);
        Wuaki.elements["footerMenu"].drawReturn();
        Wuaki.elements["footerMenu"].drawSelect();
        if (this.mode != "profiles") Wuaki.elements["footerMenu"].drawNavigateUpDown();
        else Wuaki.elements["footerMenu"].drawNavigate();
        if (this.mode == "episodes" && typeof this.detailsData.next_episode_id != "undefined") Wuaki.elements["footerMenu"].drawNextEpisode();
        if (this.mode == "episodes" && typeof this.detailsData.previous_episode_id != "undefined") Wuaki.elements["footerMenu"].drawPrevEpisode();
        if (this.mode == "seasons" && typeof this.detailsData.next_season_id != "undefined") Wuaki.elements["footerMenu"].drawNextSeason();
        if (this.mode == "seasons" && typeof this.detailsData.previous_season_id != "undefined") Wuaki.elements["footerMenu"].drawPrevSeason();
        Wuaki.elements["footerMenu"].applyNewContent()
    };
    detailsMenu.prototype.disable = function() {
        if (this.mode != "profiles") {
            this.hide()
        }
        this.status.enable = false
    };
    detailsMenu.prototype.display = function() {
        this.status.visible = true;
        this.div.show()
    };
    detailsMenu.prototype.hide = function() {
        this.status.visible = false;
        this.div.hide()
    };
    detailsMenu.prototype.resetOptions = function() {
        this.menuCarouselTop.reset();
        this.menuCarouselBottom.reset();
        this.menuOptions = new Object;
        this.menuOptionsTop = new Array;
        this.menuOptionsBottom = new Array;
        this.focusedOption = 1;
        this.selectedOption = 1
    };
    detailsMenu.prototype.reset = function() {
        this.menuCarouselTop.reset();
        this.menuCarouselBottom.reset();
        this.focusedOption = 1;
        this.selectedOption = 1;
        this.reloadStatus = false;
        this.status = new Object;
        this.status.visible = false;
        this.status.ready = false;
        this.status.enable = false;
        this.status.autoEnable = false;
        this.parentMenu = null;
        this.menuOptions = new Object;
        this.menuOptionsTop = new Array;
        this.menuOptionsBottom = new Array;
        this.id = this.callbackFill = null;
        this.pairingProcess = false;
        this.contentNotAvailable = false
    };
    detailsMenu.prototype.hideContent = function() {
        this.div.find("#details_content").css("left", "-10000px")
    };
    detailsMenu.prototype.showContent = function() {
        this.div.find("#details_content").css("left", "0px")
    };
    detailsMenu.prototype.fill = function(data, fillRequestId) {
        this.fillRequestId = fillRequestId;
        var cloneDiv = commonTools.cloneDiv(this.div, "body");
        if (commonTools.checkProviderList(data.provider_id)) this.contentNotAvailable = true;
        else this.contentNotAvailable = false;
        this.hide();
        if (this.div.attr("class")) this.div.attr("class", this.div.attr("class").replace(/detailMode_[a-z]+/i, "")).addClass("detailMode_" + this.mode);
        this.detailsData = data;
        this.detailsData.detailsMode = this.mode;
        this.arrowDraw();
        this.rightMenuDraw(data);
        this.headerDraw();
        this.contentDraw();
        if (this.mode != "profiles" && this.userPreferedOption == null) this.enableTopMenu();
        else if (this.userPreferedOption != null) {
            this.enableBottomMenu();
            this.focusOption(this.userPreferedOption);
            this.userPreferedOption = null
        } else {
            this.recoverFocusAndActive()
        }
        cloneDiv.remove();
        this.status.ready = true;
        if (this.status.autoEnable) Wuaki.enableElement(this.name)
    };
    detailsMenu.prototype.arrowDraw = function() {
        this.div.find("#detailsRigthArrow").remove();
        this.div.find("#detailsLeftArrow").remove();
        if (this.mode == "episodes" && typeof this.detailsData.next_episode_id != "undefined" || this.mode == "seasons" && typeof this.detailsData.next_season_id != "undefined") this.div.append('<div id="detailsRigthArrow"/>');
        if (this.mode == "episodes" && typeof this.detailsData.previous_episode_id != "undefined" || this.mode == "seasons" && typeof this.detailsData.previous_season_id != "undefined") this.div.append('<div id="detailsLeftArrow"/>')
    };
    detailsMenu.prototype.jcarouselFillTop = function(data) {
        var pos = 1;
        this.menuCarouselTop.reset();
        switch (this.mode) {
            case "movies":
                pos = this.moreDetailsItemDraw(pos, data);
                if (data.playback_settings && data.playback_settings.trailer) pos = this.watchTrailerDraw(pos, data);
                if (Wuaki.statusLogged) pos = this.addToWishlistItemDraw(pos, data);
                break;
            case "moviesDetails":
                pos = this.lessDetailsItemDraw(pos, data);
                break;
            case "seasons":
                if (data.playback_settings && data.playback_settings.trailer) pos = this.watchTrailerDraw(pos, data);
                if (Wuaki.statusLogged) pos = this.addToWishlistItemDraw(pos, data);
                break;
            case "episodes":
                if (data.playback_settings && data.playback_settings.trailer) pos = this.watchTrailerDraw(pos, data);
                if (Wuaki.statusLogged) pos = this.addToWishlistItemDraw(pos, data);
                break;
            case "profiles":
                pos = this.backToMovieItemDraw(pos, data);
                break
        }
        pos--;
        this.div.find(".jcarousel-skin-details-top .jcarousel-container-vertical").css("height", pos * 55 + "px");
        this.div.find(".jcarousel-skin-details-top .jcarousel-clip-vertical").css("height", pos * 55 + "px");
        this.menuCarouselTop.size(pos);
        this.menuCarouselTop.reload()
    };
    detailsMenu.prototype.jcarouselFillBottom = function(data) {
        var pos = 1;
        this.menuCarouselBottom.reset();
        this.div.find(".rightMenuBottomTitle").remove();
        switch (this.mode) {
            case "movies":
                pos = this.playbackOptionsItemDraw(pos, data);
                if (pos == 1 && !data.purchase) {
                    if (!Wuaki.SVOD) pos = this.purchaseOptionsItemDraw(pos, data);
                    pos = this.subscriptionPlansItemDraw(pos, data);
                    pos = this.reedemCouponItemDraw(pos, data);
                    if (pos > 1) this.bottomMenuTitleDraw(Wuaki.language["availableOptions"], data)
                } else {
                    if (pos > 1) this.bottomMenuTitleDraw(Wuaki.language["watchNow"], data)
                }
                break;
            case "moviesDetails":
            case "profiles":
                pos = this.relatedProfilesItemDraw(pos, data);
                if (pos > 1) this.bottomMenuTitleDraw(Wuaki.language["relatedProfiles"], data);
                break;
            case "seasons":
                if (data.purchased || typeof data.subscription_plans != "undefined" && data.subscription_plans.length > 0 && data.subscription_plans[0].subscribed) {
                    pos = this.episodeListOptionsItemDraw(pos, data)
                } else {
                    pos = this.watchByEpisodeItemDraw(pos, data);
                    if (!Wuaki.SVOD) pos = this.purchaseOptionsItemDraw(pos, data);
                    pos = this.subscriptionPlansItemDraw(pos, data)
                }
                if (pos > 1) this.bottomMenuTitleDraw(Wuaki.language["availableOptions"], data);
                break;
            case "episodes":
                pos = this.playbackOptionsItemDraw(pos, data);
                if (pos == 1 && !data.purchase) {
                    if (!Wuaki.SVOD) pos = this.purchaseOptionsItemDraw(pos, data);
                    pos = this.subscriptionPlansItemDraw(pos, data);
                    if (pos > 1) this.bottomMenuTitleDraw(Wuaki.language["availableOptions"], data)
                } else {
                    if (pos > 1) this.bottomMenuTitleDraw(Wuaki.language["watchNow"], data)
                }
                break
        }
        pos--;
        var bottomCarouselHeight = 550 - this.div.find(".jcarousel-skin-details-top .jcarousel-container-vertical").css("height").replace(/[^-\d\.]/g, "");
        if (pos * 55 < bottomCarouselHeight) bottomCarouselHeight = pos * 55;
        this.div.find(".jcarousel-skin-details-bottom .jcarousel-container-vertical").css("height", bottomCarouselHeight + "px");
        this.div.find(".jcarousel-skin-details-bottom .jcarousel-clip-vertical").css("height", bottomCarouselHeight + "px");
        this.menuCarouselBottom.size(pos);
        this.menuCarouselBottom.reload();
        this.menuCarouselBottom.last = parseInt((bottomCarouselHeight / 55).toFixed());
        this.menuCarouselBottom.visibleOptions = parseInt(bottomCarouselHeight / 55);
        this.enableBottomMenu();
        this.opacity()
    };
    detailsMenu.prototype.config = function(id, parent, parentMenu, mode, callbackFill) {
        if (1) {
            this.userPreferedOption = null;
            Wuaki.showLoading();
            this.status.ready = false;
            this.status.autoEnable = false;
            this.parentMenu = parentMenu;
            this.id = id;
            this.parent = parent;
            this.reloadStatus = false;
            this.focusedOption = 1;
            if (mode == "contents") switch (parent.content_type) {
                case "Movie":
                    this.mode = "movies";
                    break;
                case "Season":
                    this.mode = "seasons";
                    break;
                default:
                    this.mode = "episodes";
                    break
            } else this.mode = mode;
            this.callbackFill = callbackFill;
            this.callbackFill(this.id, this.parent)
        } else {
            this.display();
            Wuaki.enableElement(this.name)
        }
        if (!this.gridRestoreConfig) {
            if (this.parent.homescreen) this.gridRestoreConfig = Wuaki.elements["homescreenMenu"].getConfig();
            else this.gridRestoreConfig = Wuaki.elements["gridMenu"].getConfig()
        }
    };
    detailsMenu.prototype.drawCarousels = function(parent) {
        $('<div class="rightMenuTop"><ul class="jcarousel-skin-details-top" id="' + this.name + 'Top"></ul></div>').appendTo(parent).addClass("fontMenuOptions");
        $("#" + this.name + "Top").jcarousel({
            vertical: true,
            scroll: 1,
            animation: Wuaki.animation,
            itemFallbackDimension: 800,
            setupCallback: function(carousel) {
                carousel.reload()
            }
        });
        this.menuCarouselTop = $("#" + this.name + "Top").data("jcarousel");
        $('<div class="rightMenuBottom"><ul class="jcarousel-skin-details-bottom" id="' + this.name + 'Bottom"></ul></div>').appendTo(parent).addClass("fontMenuOptions");
        $("#" + this.name + "Bottom").jcarousel({
            vertical: true,
            scroll: 1,
            animation: Wuaki.animation,
            itemFallbackDimension: 800,
            itemFirstOutCallback: function() {
                Wuaki.elements["detailsMenu"].opacity()
            },
            setupCallback: function(carousel) {
                carousel.reload()
            }
        });
        this.menuCarouselBottom = $("#" + this.name + "Bottom").data("jcarousel")
    };
    detailsMenu.prototype.headerDraw = function() {
        this.div.find("#details_header").empty();
        switch (this.mode) {
            case "movies":
            case "moviesDetails":
                $("<div>" + this.detailsData.title + "</div>").appendTo(this.div.find("#details_header")).addClass("fontDetailsHeaderTitle detailsHeaderTitle");
                var genres = commonTools.getFieldFromObjectArray(this.detailsData.genres, "name");
                var countries = commonTools.getFieldFromObjectArray(this.detailsData.countries, "name");
                var html = "<div>" + this.detailsData.year + ". " + countries.join(", ") + ". " + this.detailsData.duration + '. <span style="padding-left: 6px; margin-left:10px;" class="boxedText"><img style="margin: -6px;" src="resources/icons/shape_3.png"/>' + this.detailsData.classification.name + "</span> " + genres.join(", ") + "</div>";
                $(html).appendTo(this.div.find("#details_header")).addClass("fontMenuOptions detailsHeaderData");
                break;
            case "seasons":
                $("<div>" + Wuaki.language["Season"] + " " + this.detailsData.number + " - " + this.detailsData.tv_show.title + "</div>").appendTo(this.div.find("#details_header")).addClass("fontDetailsHeaderTitle detailsHeaderTitle");
                var episodes = this.detailsData.episodes.episodes.length + " " + Wuaki.language["episodes"];
                var genres = commonTools.getFieldFromObjectArray(this.detailsData.tv_show.genres, "name");
                var countries = commonTools.getFieldFromObjectArray(this.detailsData.tv_show.countries, "name");
                var html = "<div>" + episodes + ". " + this.detailsData.year + ". " + countries.join(", ") + '. <span style="padding-left: 6px; margin-left:10px;"  class="boxedText"><img style="margin: -6px;" src="resources/icons/shape_3.png"/>' + this.detailsData.tv_show.classification.name + "</span> " + genres.join(", ") + "</div>";
                $(html).appendTo(this.div.find("#details_header")).addClass("fontMenuOptions detailsHeaderData");
                break;
            case "episodes":
                $("<div>" + this.detailsData.title + "</div>").appendTo(this.div.find("#details_header")).addClass("fontDetailsHeaderTitle detailsHeaderTitle");
                var genres = commonTools.getFieldFromObjectArray(this.detailsData.season.tv_show.genres, "name");
                var countries = commonTools.getFieldFromObjectArray(this.detailsData.season.tv_show.countries, "name");
                var html = "<div>" + Wuaki.language["Episode"] + " " + this.detailsData.number + ". " + Wuaki.language["Season"] + " " + this.detailsData.season.number + ". " + this.detailsData.year + ". " + countries.join(", ") + '. <span style="padding-left: 6px; margin-left:10px;" class="boxedText"><img style="margin: -6px;" src="resources/icons/shape_3.png"/>' + this.detailsData.season.tv_show.classification.name + "</span> " + genres.join(", ") + "</div>";
                $(html).appendTo(this.div.find("#details_header")).addClass("fontMenuOptions detailsHeaderData");
                break
        }
    };
    detailsMenu.prototype.contentDraw = function() {
        var description = this.div.find("#details_description");
        description.empty().show();
        var episode_description = this.div.find("#details_episode_description").empty();
        this.artWorkDraw(description);
        this.plotDraw(description);
        if (this.mode != "moviesDetails") {
            if (this.mode != "seasons") this.audioLanguagesDraw(description);
            if (this.mode == "episodes" && (this.detailsData.snapshots.length > 0 || this.parent.snapshots.length > 0)) description = episode_description;
            this.directorDraw(description);
            this.castDraw(description)
        }
    };
    detailsMenu.prototype.artWorkDraw = function(parent) {
        var front = this.div.find("#details_front");
        if (this.mode == "episodes" && (this.detailsData.snapshots.length > 0 || this.parent.snapshots.length > 0)) {
            if (this.detailsData.snapshots.length > 0) {
                front.empty().append('<img class="detailsArtworkItemSnapshot_' + this.mode + '" src="' + this.detailsData.snapshots[0].shot.web + '"  />').show();
                front.append('<img class="detailsArtworkItemSnapshotShadow" src="resources/images/shadow.png"/>')
            } else {
                front.empty().append('<img class="detailsArtworkItemSnapshot_' + this.mode + '" src="' + this.parent.snapshots[0].shot.web + '"  />').show();
                front.append('<img class="detailsArtworkItemSnapshotShadow" src="resources/images/shadow.png"/>')
            }
        } else {
            front.empty().append('<img class="detailsArtworkItem_' + this.mode + '" src="' + this.detailsData.artwork.h420 + '"/>').show();
            front.append('<img class="detailsArtworkItemShadow" src="resources/images/shadow.png"/>')
        }
    };
    detailsMenu.prototype.plotDraw = function(parent) {
        var plotSize;
        switch (this.mode) {
            case "movies":
                plotSize = 300;
                break;
            case "moviesDetails":
                plotSize = 900;
                break;
            case "seasons":
                plotSize = 420;
                break;
            case "episodes":
                if (this.detailsData.snapshots.length > 0 || this.parent.snapshots.length > 0) plotSize = 700;
                else plotSize = 300;
                break
        }
        $("<div>" + commonTools.truncateString(this.detailsData.plot, plotSize) + "</div>").addClass("fontDetailsItemDescription detailsItemPlot_" + this.mode).appendTo("#details_description")
    };
    detailsMenu.prototype.classificationDraw = function(parent) {};
    detailsMenu.prototype.audioLanguagesDraw = function(parent) {
        var audiosElement = $("<div/>").addClass("detailsItemAudioLanguages_" + this.mode).appendTo(parent);
        $('<div><span class="fontDetailsGreyTitle">' + Wuaki.language["audio_languages"] + "</span></div>").addClass("fontDetailsItemDescription detailsItemAudioLanguages").appendTo(audiosElement);
        var audioQualities = '<span class="boxedTextTransparent">' + commonTools.getFieldFromObjectArray(this.detailsData.audio_qualities, "name").join('</span><span class="boxedTextTransparent">') + "</span>";
        var languages = '<span class="boxedTextTransparent">' + commonTools.getFieldFromObjectArray(this.detailsData.languages, "abbr").join('</span><span class="boxedTextTransparent">') + "</span>";
        $("<div>" + audioQualities + languages + "</div>").addClass("fontDetailsItemDescription detailsItemAudioLanguagesContent").appendTo(audiosElement)
    };
    detailsMenu.prototype.directorDraw = function(parent) {
        var directorElement = $("<div/>").addClass("detailsItemDirector_" + this.mode).appendTo(parent);
        $('<div class="shape_1"/>').appendTo(directorElement);
        $('<div><span class="fontDetailsGreyTitle">' + Wuaki.language["director"] + "</span></div>").addClass("fontDetailsItemDescription detailsItemDirector").appendTo(directorElement);
        var director = commonTools.getFieldFromObjectArray(this.detailsData.directors, "name").join(", ");
        $("<div>" + director + "</div>").addClass("fontDetailsItemDescription detailsItemDirectorContent").appendTo(directorElement)
    };
    detailsMenu.prototype.castDraw = function(parent) {
        var castElement = $("<div/>").addClass("detailsItemCast_" + this.mode).appendTo(parent);
        $('<div class="shape_2"/>').appendTo(castElement);
        $('<div><span class="fontDetailsGreyTitle">' + Wuaki.language["cast"] + "</span></div>").addClass("fontDetailsItemDescription detailsItemCast").appendTo(castElement);
        var director = commonTools.truncateString(commonTools.getFieldFromObjectArray(this.detailsData.actors, "name").join(", "), 110);
        $("<div>" + director + "</div>").addClass("fontDetailsItemDescription detailsItemCastContent").appendTo(castElement)
    };
    detailsMenu.prototype.rightMenuDraw = function(data) {
        if (this.mode != "profiles") this.resetOptions();
        this.jcarouselFillTop(data);
        if (this.mode != "profiles") this.jcarouselFillBottom(data);
        this.addMouseEvents()
    };
    detailsMenu.prototype.addMouseEvents = function() {
        $(this.div).find("div.rightMenuTop li").unbind().bind("mouseenter", this, function(event) {
            var element = event.data;
            element.unfocusOption();
            element.enableTopMenu();
            element.focusOption(Number($(this).attr("jcarouselindex")));
            if (Wuaki.currentElement.name != element.name) Wuaki.enableElementFromError(element.name)
        }).bind("mouseleave", this, function() {}).bind("click", this, function(event) {
            var element = event.data;
            element.selectCurrentOption()
        }).addClass("pointer");
        $(this.div).find("div.rightMenuBottom li").unbind().bind("mouseenter", this, function(event) {
            var element = event.data;
            element.unfocusOption();
            element.enableBottomMenu();
            element.focusOption(Number($(this).attr("jcarouselindex")));
            var last = element.menuCarousel.last;
            var first = element.menuCarousel.first;
            if (first == element.focusedOption) setTimeout(function() {
                if (element.status.enable) element.menuCarousel.prev()
            }, 300);
            if (last == element.focusedOption) setTimeout(function() {
                if (element.status.enable) element.menuCarousel.next()
            }, 300);
            element.opacity();
            if (Wuaki.currentElement.name != element.name) Wuaki.enableElementFromError(element.name)
        }).bind("mouseleave", this, function() {}).bind("click", this, function(event) {
            var element = event.data;
            element.selectCurrentOption()
        }).addClass("pointer");
        $(this.div).find("#detailsRigthArrow").unbind().bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            var element = event.data;
            element.nextItem()
        }).addClass("pointer");
        $(this.div).find("#detailsLeftArrow").unbind().bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            var element = event.data;
            element.prevItem()
        }).addClass("pointer")
    };
    detailsMenu.prototype.bottomMenuTitleDraw = function(title, data) {
        this.div.find(".rightMenuBottomTitle").remove();
        $('<div class="rightMenuBottomTitle">' + title + "</div>").insertBefore(this.div.find(".rightMenuBottom")).addClass("fontMenuTitle")
    };
    detailsMenu.prototype.episodeListOptionsItemDraw = function(pos, data) {
        if (this.contentNotAvailable) return pos;
        if (typeof data.episodes == "undefined") return pos;
        for (var i = 0; i < data.episodes.episodes.length; i++) {
            this.menuCarouselBottom.add(pos, '<div class="rightmenuIconDiv"><div class="rightmenuIconEpisode"/></div><div class="rightmenuButtonText">' + data.episodes.episodes[i].number + ". " + data.episodes.episodes[i].title + "</div>");
            this.actionEpisodeList(pos, data);
            pos++
        }
        return pos
    };
    detailsMenu.prototype.playbackOptionsItemDraw = function(pos, data) {
        if (this.contentNotAvailable) return pos;
        if (Wuaki.heartbeat && data.current_position && data.playback_settings) {
            this.menuCarouselBottom.add(pos, '<div class="rightmenuIconDiv"><div class="rightmenuIconPlay"/></div><div class="rightmenuButtonText"><div style="width:100%;float:left;overflow:hidden;text-overflow:ellipsis;">' + Wuaki.language["ContinueWatching"] + "</div></div>");
            if (data.playback_settings.streams.length === 1) this.actionPlaybackOptions(pos, data, 0, true);
            else this.actionResume(pos);
            this.userPreferedOption = pos;
            pos++;
            this.menuCarouselBottom.add(pos, '<div class="rightmenuIconDiv"><div class="rightmenuIconPlay"/></div><div class="rightmenuButtonText"><div style="width:100%;float:left;overflow:hidden;text-overflow:ellipsis;">' + Wuaki.language["PlayFromStart"] + "</div></div>");
            if (data.playback_settings.streams.length === 1) this.actionPlaybackOptions(pos, data, 0, false);
            else this.actionStart(pos);
            pos++
        } else {
            if (data.playback_settings == null || typeof data.playback_settings == "undefined") return pos;
            var compareValue = 0;
            for (var i = 0; i < data.playback_settings.streams.length; i++) {
                var currentCompareValue = 0;
                this.menuCarouselBottom.add(pos, '<div class="rightmenuIconDiv"><div class="rightmenuIconPlay"/></div><div class="rightmenuButtonText"><div style="width:80%;float:left;overflow:hidden;text-overflow:ellipsis;">' + data.playback_settings.streams[i].language.name + "                                                 " + data.playback_settings.streams[i].audio_quality.abbr + '                                                 </div><div class="rightmenuContentIconPurchase' + data.playback_settings.streams[i].video_quality.abbr + '"/></div>');
                if (Wuaki.statusLogged) {
                    if (data.playback_settings.streams[i].video_quality.id == Wuaki.user.data.profile.video_quality.id) currentCompareValue++;
                    if (data.playback_settings.streams[i].language.id == Wuaki.user.data.profile.language.id) currentCompareValue++;
                    if (data.playback_settings.streams[i].audio_quality.id == Wuaki.user.data.profile.audio_quality.id) currentCompareValue++;
                    if (currentCompareValue > compareValue) {
                        compareValue = currentCompareValue;
                        this.userPreferedOption = pos
                    }
                }
                this.actionPlaybackOptions(pos, data, i);
                pos++
            }
        }
        return pos
    };
    detailsMenu.prototype.purchaseOptionsItemDraw = function(pos, data) {
        if (this.contentNotAvailable) return pos;
        if (typeof data.purchase_options == "undefined") return pos;
        var buttonText, compareValue = 0;
        if (Wuaki.purchaseNotAvailable) commonTools.removePurchaseOptions(data.purchase_options);
        for (var i = 0; i < data.purchase_options.length; i++) {
            var currentCompareValue = 0;
            switch (data.purchase_options[i].purchase_type.type) {
                case "purchase":
                    buttonText = Wuaki.language["Purchase"];
                    break;
                case "rental":
                    buttonText = Wuaki.language["Rent"];
                    break;
                default:
                    break
            }
            var price;
            if (Wuaki.language["currency"] != "£") price = data.purchase_options[i].price + Wuaki.language["currency"];
            else price = Wuaki.language["currency"] + data.purchase_options[i].price;
            this.menuCarouselBottom.add(pos, '<div class="rightmenuIconDiv"><div class="rightmenuIconPurchase' + data.purchase_options[i].video_quality.abbr + '"/></div><div class="rightmenuButtonText">' + buttonText + ' <a style="float:right; margin-right:10px;">' + price + "</a></div>");
            if (Wuaki.statusLogged) {
                if (data.purchase_options[i].video_quality.id == Wuaki.user.data.profile.video_quality.id) currentCompareValue++
            }
            if (currentCompareValue > compareValue) {
                compareValue = currentCompareValue;
                this.userPreferedOption = pos
            }
            this.actionPurchaseOptions(pos, data, i);
            pos++
        }
        return pos
    };
    detailsMenu.prototype.subscriptionPlansItemDraw = function(pos, data) {
        if (this.contentNotAvailable) return pos;
        if (typeof data.subscription_plans == "undefined" || Wuaki.subscriptionPlans.length == 0) return pos;
        for (var i = 0; i < data.subscription_plans.length; i++) {
            this.menuCarouselBottom.add(pos, '<div class="rightmenuIconDiv"><div class="rightmenuIconSubscriptionPlan"/></div><div class="rightmenuButtonText">' + Wuaki.language["in"] + " " + data.subscription_plans[i].name + "</div>");
            this.actionPlanPremium(pos, data);
            pos++
        }
        return pos
    };
    detailsMenu.prototype.relatedProfilesItemDraw = function(pos, data) {
        if (typeof data.directors != "undefined") {
            for (var i = 0; i < data.directors.length; i++) {
                this.menuCarouselBottom.add(pos, '<div class="rightmenuIconDiv"><div class="rightmenuIconRelatedProfiles"/></div><div class="rightmenuButtonText">' + data.directors[i].name + "</div>");
                this.actionRelatedProfiles(pos, data.directors[i]);
                pos++
            }
        }
        if (typeof data.actors != "undefined") {
            for (var i = 0; i < data.actors.length; i++) {
                this.menuCarouselBottom.add(pos, '<div class="rightmenuIconDiv"><div class="rightmenuIconRelatedProfiles"/></div><div class="rightmenuButtonText">' + data.actors[i].name + "</div>");
                this.actionRelatedProfiles(pos, data.actors[i]);
                pos++
            }
        }
        return pos
    };
    detailsMenu.prototype.watchByEpisodeItemDraw = function(pos, data) {
        if (this.contentNotAvailable) return pos;
        this.menuCarouselBottom.add(pos, '<div class="rightmenuIconDiv"><div class="rightmenuIconWatchByEpisode"/></div><div class="rightmenuButtonText">' + Wuaki.language["watchByEpisode"] + "</div>");
        this.actionwatchByEpisode(pos, data);
        return ++pos
    };
    detailsMenu.prototype.reedemCouponItemDraw = function(pos, data) {
        if (this.contentNotAvailable) return pos;
        this.menuCarouselBottom.add(pos, '<div class="rightmenuIconDiv"><div class="rightmenuIconReedemCoupon"/></div><div class="rightmenuButtonText">' + Wuaki.language["reedemCoupon"] + "</div>");
        this.actionReedemCouponItem(pos, data);
        return ++pos
    };
    detailsMenu.prototype.moreDetailsItemDraw = function(pos, data) {
        this.menuCarouselTop.add(pos, '<div class="rightmenuIconDiv"><div class="rightmenuIconMoreDetails"/></div><div class="rightmenuButtonText">' + Wuaki.language["moreDetails"] + "</div>");
        this.actionMoreDetails(pos, data);
        return ++pos
    };
    detailsMenu.prototype.lessDetailsItemDraw = function(pos, data) {
        this.menuCarouselTop.add(pos, '<div class="rightmenuIconDiv"><div class="rightmenuIconLessDetails"/></div><div class="rightmenuButtonText">' + Wuaki.language["lessDetails"] + "</div>");
        this.actionLessDetails(pos, data);
        return ++pos
    };
    detailsMenu.prototype.watchTrailerDraw = function(pos, data) {
        this.menuCarouselTop.add(pos, '<div class="rightmenuIconDiv"><div class="rightmenuIconPlay"/></div><div class="rightmenuButtonText">' + Wuaki.language["watchTrailer"] + "</div>");
        this.actionWatchTrailer(pos, data);
        return ++pos
    };
    detailsMenu.prototype.addToWishlistItemDraw = function(pos, data) {
        this.menuCarouselTop.add(pos, '<div class="rightmenuIconDiv"><div class="rightmenuIconWishlist"/></div><div id="rightmenuWishlist" class="rightmenuButtonText"/>');
        this.addToWishlistButtonText(data);
        this.actionAddToMyWishlist(pos, data);
        return ++pos
    };
    detailsMenu.prototype.addToWishlistButtonText = function(data) {
        var buttonText;
        if (!data.favorited) buttonText = Wuaki.language["addToWishlist"];
        else buttonText = Wuaki.language["removeFromWishlist"];
        $("#rightmenuWishlist").text(buttonText)
    };
    detailsMenu.prototype.backToMovieItemDraw = function(pos, data) {
        this.menuCarouselTop.add(pos, '<div class="rightmenuIconDiv"><div class="rightmenuIconBackToMovie"/></div><div class="rightmenuButtonText">' + Wuaki.language["backToMovie"] + "</div>");
        this.actionBackToMovie(pos, data);
        return ++pos
    };
    detailsMenu.prototype.nav = function(keycode) {
        switch (keycode) {
            case VK_UP:
                this.prevOption();
                break;
            case VK_DOWN:
                this.nextOption();
                break;
            case VK_LEFT:
                this.prevItem();
                break;
            case VK_RIGHT:
                this.nextItem();
                break;
            case VK_BDR_ENTER:
            case VK_CROSS:
                this.selectCurrentOption();
                break;
            case VK_BDR_RETURN:
            case VK_CIRCLE:
            case Wuaki.FOOTER_BACK:
                if (!this.gridRestoreConfig && this.gridRestoreConfigBackup) this.gridRestoreConfig = this.gridRestoreConfigBackup;
                if (this.mode == "profiles") {
                    this.backToMovies()
                } else if (this.parent.seasonData) {
                    var mode = "seasons";
                    Wuaki.elements["detailsMenu"].config("detailsSeasons" + this.parent.seasonData.id, this.parent.seasonData, "gridMenu", mode, detailsFillCallbacks.season);
                    Wuaki.elements["detailsMenu"].autoEnable()
                } else if (deepLinking.isActive()) {
                    Wuaki.enableElement("deepLinkingMenu");
                    this.gridRestoreConfigBackup = this.gridRestoreConfig;
                    this.gridRestoreConfig = null
                } else if (this.gridRestoreConfig.name == "homescreenMenu") {
                    this.hide();
                    $("#main").show();
                    $("#main_left_menu").show();
                    Wuaki.enableElement("homescreenMenu");
                    this.gridRestoreConfigBackup = this.gridRestoreConfig;
                    this.gridRestoreConfig = null
                } else {
                    this.hide();
                    Wuaki.elements["gridMenu"].config(this.gridRestoreConfig.id, this.gridRestoreConfig.parent, this.gridRestoreConfig.parentMenu, this.gridRestoreConfig.gridMode, this.gridRestoreConfig.page, this.gridRestoreConfig.perPage, this.gridRestoreConfig.focusedOption, this.gridRestoreConfig.callbackFill);
                    Wuaki.elements["gridMenu"].autoEnable();
                    $("#main").show();
                    $("#main_left_menu").css("display", this.gridRestoreConfig.leftMenuDiv);
                    $("#main_left_submenu").css("display", this.gridRestoreConfig.leftSubMenuDiv);
                    $("#main_content").css("display", this.gridRestoreConfig.contentDiv);
                    this.gridRestoreConfigBackup = this.gridRestoreConfig;
                    this.gridRestoreConfig = null
                }
                break;
            case VK_BDR_YELLOW:
            case Wuaki.customPairKey:
            case Wuaki.FOOTER_PAIR:
                if (!Wuaki.statusLogged) {
                    Wuaki.fromPurchase = false;
                    Wuaki.processCaller = this.name;
                    Wuaki.proccessCallerKey = keycode;
                    Wuaki.elements["splashMenu"].config("splashPairingFromPurchaseOptions", "splashMenu", this.name, "splashPairing", {}, null, null);
                    Wuaki.elements["splashMenu"].autoEnable();
                    this.pairingProcess = true
                } else if (this.pairingProcess) {
                    this.pairingProcess = false;
                    this.redrawDetails()
                }
                break;
            default:
                break
        }
    };
    detailsMenu.prototype.enableBottomMenu = function() {
        this.menuCarousel = this.menuCarouselBottom;
        this.currentMenuName = this.name + "Bottom";
        this.menuOptions = this.menuOptionsBottom
    };
    detailsMenu.prototype.enableTopMenu = function() {
        if (this.menuCarouselTop.options.size != 0) {
            this.menuCarousel = this.menuCarouselTop;
            this.currentMenuName = this.name + "Top";
            this.menuOptions = this.menuOptionsTop
        } else this.enableBottomMenu()
    };
    detailsMenu.prototype.recoverFocusAndActive = function() {
        $("#" + this.currentMenuName + " .jcarousel-item-" + this.focusedOption).addClass("hover");
        $("#" + this.currentMenuName + " .jcarousel-item-" + this.selectedOption).addClass("active")
    };
    detailsMenu.prototype.focusOption = function(option) {
        var first = this.menuCarousel.first;
        var last = this.menuCarousel.last;
        var li_active = $("#" + this.currentMenuName + " li.lihover");
        li_active.removeClass("lihover");
        li_active = $("#" + this.currentMenuName + " .jcarousel-item-" + option);
        li_active.addClass("lihover");
        li_active.focus();
        this.focusedOption = option
    };
    detailsMenu.prototype.focusCurrentOption = function() {
        this.focusOption(this.focusedOption)
    };
    detailsMenu.prototype.unfocusOption = function() {
        var first = this.menuCarousel.first;
        var last = this.menuCarousel.last;
        var li_active = $("#" + this.currentMenuName + " li.lihover");
        li_active.removeClass("lihover")
    };
    detailsMenu.prototype.selectCurrentOption = function() {
        $("#" + this.currentMenuName + " li.active").removeClass("active");
        if (this.mode == "profiles") $("#" + this.currentMenuName + " li.lihover").addClass("active");
        this.selectedOption = this.focusedOption;
        if (this.menuOptions && this.menuOptions[this.selectedOption]) this.menuOptions[this.selectedOption].action()
    };
    detailsMenu.prototype.nextOption = function() {
        if (this.menuCarousel.animating) return;
        if (this.currentMenuName == this.name + "Top" && this.focusedOption >= this.menuCarousel.options.size && this.menuCarouselBottom.options.size > 0) {
            this.unfocusOption();
            this.enableBottomMenu();
            this.focusOption(1);
            return
        } else {
            if (this.focusedOption >= this.menuCarousel.options.size) return
        }
        var nextElement = $("#" + this.currentMenuName + " li.lihover").next();
        if (nextElement.length) {
            $("#" + this.currentMenuName + " li.lihover").removeClass("lihover");
            nextElement.addClass("lihover");
            this.focusedOption = Number(nextElement.attr("jcarouselindex"));
            var last = this.menuCarousel.last;
            if (this.focusedOption >= last - 1) {
                this.menuCarousel.next()
            }
        }
        this.opacity()
    };
    detailsMenu.prototype.prevOption = function() {
        if (this.menuCarousel.animating) return;
        if (this.currentMenuName == this.name + "Bottom" && this.focusedOption <= 1) {
            this.unfocusOption();
            this.enableTopMenu();
            this.focusOption(this.menuCarousel.options.size);
            return
        }
        var prevElement = $("#" + this.currentMenuName + " li.lihover").prev();
        if (prevElement.length) {
            $("#" + this.currentMenuName + " li.lihover").removeClass("lihover");
            prevElement.addClass("lihover");
            this.focusedOption = Number(prevElement.attr("jcarouselindex"));
            var first = this.menuCarousel.first;
            if (this.focusedOption <= first + 1) {
                this.menuCarousel.prev()
            }
        }
        this.opacity()
    };
    detailsMenu.prototype.nextItem = function() {
        var item = new Object;
        item = this.parent;
        switch (this.mode) {
            case "seasons":
                if (typeof this.detailsData.next_season_id != "undefined") {
                    item.id = this.detailsData.next_season_id;
                    Wuaki.elements["detailsMenu"].config("detailsSeasons" + this.detailsData.next_season_id, item, "gridMenu", this.mode, detailsFillCallbacks.season);
                    Wuaki.elements["detailsMenu"].autoEnable()
                }
                break;
            case "episodes":
                if (typeof this.detailsData.next_episode_id != "undefined") {
                    item.id = this.detailsData.next_episode_id;
                    Wuaki.elements["detailsMenu"].config("detailsEpisodes" + this.detailsData.next_episode_id, item, "gridMenu", this.mode, detailsFillCallbacks.episode);
                    Wuaki.elements["detailsMenu"].autoEnable()
                }
                break;
            case "moviesDetails":
                break;
            case "profiles":
                if (this.currentMenuName == this.name + "Bottom") {
                    this.selectCurrentOption()
                }
                this.unfocusOption();
                Wuaki.elements["gridMenu"].autoEnable();
                break
        }
    };
    detailsMenu.prototype.prevItem = function() {
        var item = new Object;
        item = this.parent;
        switch (this.mode) {
            case "seasons":
                if (typeof this.detailsData.previous_season_id != "undefined") {
                    item.id = this.detailsData.previous_season_id;
                    Wuaki.elements["detailsMenu"].config("detailsSeasons" + this.detailsData.previous_season_id, item, "gridMenu", this.mode, detailsFillCallbacks.season);
                    Wuaki.elements["detailsMenu"].autoEnable()
                }
                break;
            case "episodes":
                if (typeof this.detailsData.previous_episode_id != "undefined") {
                    item.id = this.detailsData.previous_episode_id;
                    Wuaki.elements["detailsMenu"].config("detailsEpisodes" + this.detailsData.previous_episode_id, item, "gridMenu", this.mode, detailsFillCallbacks.episode);
                    Wuaki.elements["detailsMenu"].autoEnable()
                }
                break
        }
    };
    detailsMenu.prototype.opacity = function() {
        if (this.currentMenuName == this.name + "Bottom") {
            if (this.menuCarousel && this.menuCarousel.options.size > this.menuCarouselBottom.visibleOptions) {
                for (var i = 1; i < 4; i++) {
                    $("#" + this.currentMenuName + " .liOpacity" + i).removeClass("liOpacity" + i);
                    if (this.menuCarousel.first > 1 && 1 < this.menuCarousel.first - 3 + i) $("#" + this.currentMenuName + " .jcarousel-item-" + (this.menuCarousel.first - 3 + i)).addClass("liOpacity" + i);
                    if (this.focusedOption < this.menuCarousel.last + (3 - i) && this.menuCarousel.last < this.menuCarousel.options.size) $("#" + this.currentMenuName + " .jcarousel-item-" + (this.menuCarousel.last + (3 - i))).addClass("liOpacity" + i)
                }
            }
        }
    };
    detailsMenu.prototype.actionEpisodeList = function(pos, data) {
        var item = new Object;
        item.action = function() {
            item = _this.detailsData.episodes.episodes[pos - 1];
            item.seasonData = _this.detailsData;
            Wuaki.elements["detailsMenu"].config("detailsEpisodes" + item.id, item, "gridMenu", "episodes", detailsFillCallbacks.episode);
            Wuaki.elements["detailsMenu"].autoEnable()
        };
        this.menuOptionsBottom[pos] = item
    };
    detailsMenu.prototype.actionwatchByEpisode = function(pos, data) {
        var item = new Object;
        item.action = function() {
            item = _this.detailsData.episodes.episodes[0];
            item.seasonData = _this.detailsData;
            Wuaki.elements["detailsMenu"].config("detailsEpisodes" + item.id, item, "gridMenu", "episodes", detailsFillCallbacks.episode);
            Wuaki.elements["detailsMenu"].autoEnable()
        };
        this.menuOptionsBottom[pos] = item
    };
    detailsMenu.prototype.actionPlanPremium = function(pos, data) {
        var item = new Object;
        item.action = function() {
            if (deepLinking.isActive()) deepLinking.processSubscription(Wuaki.elements["deepLinkingMenu"]);
            else {
                Wuaki.currentElement.disable();
                _this.gridRestoreConfig = null;
                Wuaki.enableElement("mainMenu");
                menu = Wuaki.elements["mainMenu"];
                menu.unfocusOption(menu.focusedOption);
                menu.focusedOption = Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["PlanPremium"]);
                menu.focusOption(menu.focusedOption);
                menu.unselectOption(menu.selectedOption);
                menu.selectedOption = Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["PlanPremium"]);
                menu.selectOption(menu.selectedOption);
                Wuaki.elements["gridMenu"].focusOption("banner");
                $("#main").show()
            }
        };
        this.menuOptionsBottom[pos] = item
    };
    detailsMenu.prototype.actionReedemCouponItem = function(pos, data) {
        var item = new Object;
        item.action = function() {
            Wuaki.fromPurchase = false;
            if (!Wuaki.statusLogged) {
                Wuaki.processCaller = "detailsMenu";
                Wuaki.proccessCallerKey = VK_BDR_ENTER;
                Wuaki.elements["splashMenu"].config("splashPairingFromPurchaseOptions", "splashMenu", "detailsMenu", "splashPairing", {}, null, null);
                Wuaki.elements["splashMenu"].autoEnable()
            } else {
                Wuaki.processCaller = "detailsMenu";
                Wuaki.elements["keyboard"].config("keyboardCouponsMovies", this, "detailsMenu", 7, "normal", Wuaki.elements["keyboard"].stringCancelFinish, Wuaki.elements["keyboard"].fullLayoutKeyboard, Wuaki.language["reedemCoupon"], Wuaki.language["reedemCouponExplanation"], function() {
                    Wuaki.elements["keyboard"].disable();
                    Wuaki.elements["detailsMenu"].display();
                    ApiWuaki.couponsForMovie(_this.detailsData.id, this.input.value, Wuaki.user.data.authentication_token, function(requestId) {
                        if ("success" === ApiWuaki.getResult(requestId)) {
                            _this.detailsData.couponData = ApiWuaki.getData(requestId);
                            _this.detailsData.isACoupon = true;
                            Wuaki.elements["modalMenu"].config("coupon" + JSON.stringify(_this.detailsData.couponData), "modalMenu", "detailsMenu", "purchasing", _this.detailsData, modalFillCallbacks.purchasingOrCouponModal, function(output) {
                                ApiWuaki.getTerms(Wuaki.user.data.authentication_token, _this.detailsData.couponData.coupon.token, function(req_id) {
                                    if ("success" === ApiWuaki.getResult(req_id)) {
                                        function closure() {
                                            Wuaki.elements["modalMenu"].config("coupon" + JSON.stringify(_this.detailsData.couponData), "modalMenu", "detailsMenu", "purchasing", _this.detailsData, modalFillCallbacks.purchasingOrCouponModal, function(output) {});
                                            Wuaki.elements["modalMenu"].autoEnable();
                                            if (_this.detailsData.couponData.price != 0 && Wuaki.user.data.credit_card == null) {
                                                Wuaki.fromPurchase = true;
                                                Wuaki.processCaller = "modalMenu";
                                                Wuaki.proccessCallerKey = VK_BDR_ENTER;
                                                process.preCreditCard()
                                            } else {
                                                Wuaki.elements["modalMenu"].purchasingProcessModal(_this.detailsData.couponData.coupon.coupon_campaign.purchase_type.type);
                                                var purchaseable_type, purchaseable_id = _this.detailsData.id;
                                                switch (_this.detailsData.detailsMode) {
                                                    case "movies":
                                                        purchaseable_type = "movie";
                                                        break;
                                                    case "seasons":
                                                        purchaseable_type = "season";
                                                        break;
                                                    default:
                                                        purchaseable_type = "episode";
                                                        break
                                                }
                                                Wuaki.elements["modalMenu"].enable();
                                                ApiWuaki.reedemCouponForMovie(_this.detailsData.id, _this.detailsData.couponData.coupon.token, Wuaki.user.data.authentication_token, function(requestId) {
                                                    if ("success" === ApiWuaki.getResult(requestId)) {
                                                        if (!Wuaki.asyncPurchase) {
                                                            Wuaki.cleanAllRequest();
                                                            _this.redrawDetails();
                                                            TVA_GoogleAnalytics.analyticMark(TVA.device + "/navigation", "ReedemCoupon/" + _this.parent.title)
                                                        } else {
                                                            var auth_token = Wuaki.user.data.authentication_token,
                                                                id_user = Wuaki.user.data.id;
                                                            _this.purchaseStatusCheck(id_user, purchaseable_id, purchaseable_type, auth_token, function(requestId) {
                                                                Wuaki.cleanAllRequest();
                                                                _this.redrawDetails();
                                                                TVA_GoogleAnalytics.analyticMark(TVA.device + "/navigation", "ReedemCoupon/" + _this.parent.title)
                                                            })
                                                        }
                                                    } else {
                                                        var data = ApiWuaki.getError(requestId);
                                                        data.modalTitle = Wuaki.language["error"];
                                                        data.buttonText = Wuaki.language["ok"];
                                                        Wuaki.elements["modalMenu"].config("PurchasingMessageError" + JSON.stringify(data), "modalMenu", _this.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                                                            Wuaki.cleanAllRequest();
                                                            _this.callbackFill(_this.id, _this.parent);
                                                            Wuaki.enableElement("detailsMenu")
                                                        });
                                                        Wuaki.elements["modalMenu"].autoEnable()
                                                    }
                                                    ApiWuaki.cleanRequest(requestId)
                                                })
                                            }
                                        }
                                        var termsToAcceptList = ApiWuaki.getData(req_id);
                                        var termsListIndex = 0;
                                        ApiWuaki.cleanRequest(req_id);

                                        function validateNext() {
                                            Wuaki.elements["modalMenu"].config("TermsAndConditionMessage", "modalMenu", "detailsMenu", "TermsAndConditions", termsToAcceptList[termsListIndex], modalFillCallbacks.termsAndConditionsCoupon, function() {
                                                {
                                                    Wuaki.elements["modalMenu"].purchasingProcessModal(_this.detailsData.couponData.coupon.coupon_campaign.purchase_type.type);
                                                    var purchaseable_type, purchaseable_id = _this.detailsData.id;
                                                    switch (_this.detailsData.detailsMode) {
                                                        case "movies":
                                                            purchaseable_type = "movie";
                                                            break;
                                                        case "seasons":
                                                            purchaseable_type = "season";
                                                            break;
                                                        default:
                                                            purchaseable_type = "episode";
                                                            break
                                                    }
                                                    Wuaki.elements["modalMenu"].enable()
                                                }
                                                ApiWuaki.acceptTerms(Wuaki.user.data.authentication_token, termsToAcceptList[termsListIndex].id, function(last_req) {
                                                    if ("success" === ApiWuaki.getResult(last_req)) {
                                                        ApiWuaki.cleanRequest(last_req);
                                                        termsListIndex++;
                                                        var len = termsToAcceptList.length;
                                                        for (var t = termsListIndex; t < len; t++) {
                                                            if (termsToAcceptList[t].required_for_user && !termsToAcceptList[t].accepted) {
                                                                validateNext();
                                                                return
                                                            }
                                                        }
                                                        closure()
                                                    } else ApiWuaki.cleanRequest(last_req)
                                                })
                                            });
                                            Wuaki.elements["modalMenu"].autoEnable()
                                        }
                                        var len = termsToAcceptList.length;
                                        for (var t = 0; t < len; t++) {
                                            if (termsToAcceptList[t].required_for_user && !termsToAcceptList[t].accepted) {
                                                validateNext();
                                                return
                                            }
                                        }
                                        closure()
                                    } else {
                                        var data = ApiWuaki.getError(requestId);
                                        data.modalTitle = Wuaki.language["error"];
                                        data.buttonText = Wuaki.language["ok"];
                                        Wuaki.elements["modalMenu"].config("CouponMessageError" + JSON.stringify(data), "modalMenu", _this.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                                            ApiWuaki.cleanRequest(req_id);
                                            Wuaki.enableElement("keyboard")
                                        });
                                        Wuaki.elements["modalMenu"].autoEnable()
                                    }
                                })
                            });
                            Wuaki.elements["modalMenu"].autoEnable()
                        } else {
                            var data = ApiWuaki.getError(requestId);
                            data.modalTitle = Wuaki.language["error"];
                            data.buttonText = Wuaki.language["ok"];
                            Wuaki.elements["modalMenu"].config("CouponMessageError" + JSON.stringify(data), "modalMenu", _this.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                                Wuaki.enableElement("keyboard")
                            });
                            Wuaki.elements["modalMenu"].autoEnable()
                        }
                        ApiWuaki.cleanRequest(requestId)
                    })
                });
                Wuaki.elements["keyboard"].autoEnable()
            }
        };
        this.menuOptionsBottom[pos] = item
    };
    detailsMenu.prototype.actionMoreDetails = function(pos, data) {
        var item = new Object;
        item.action = function() {
            _this.mode = "moviesDetails";
            Wuaki.showLoading();
            _this.redrawDetails();
            TVA_GoogleAnalytics.analyticMark(TVA.device + "/navigation", "More_Details/" + _this.parent.title)
        };
        this.menuOptionsTop[pos] = item
    };
    detailsMenu.prototype.actionLessDetails = function(pos, data) {
        var item = new Object;
        item.action = function() {
            _this.mode = "movies";
            Wuaki.showLoading();
            _this.redrawDetails()
        };
        this.menuOptionsTop[pos] = item
    };
    detailsMenu.prototype.actionWatchTrailer = function(pos, data) {
        var item = new Object;
        item.id_stream = data.playback_settings.trailer.id;
        item.id = data.id;
        item.data = data;
        var auth_token = "";
        if (Wuaki.statusLogged) {
            auth_token = Wuaki.user.data.authentication_token
        }
        item.action = function() {
            Wuaki.showLoading();
            switch (_this.mode) {
                case "movies":
                    ApiWuaki.gettingTrailerStreamMovies(item.id, item.id_stream, auth_token, function(requestId) {
                        if ("success" == ApiWuaki.getResult(requestId)) {
                            var stream = ApiWuaki.getData(requestId);
                            Wuaki.elements["playerMenu"].config("playerMenu" + JSON.stringify(item.id), "playerMenu", "detailsMenu", item.data, "trailer");
                            Wuaki.elements["playerMenu"].fill(stream, item.id, Wuaki.trailersStreamType);
                            Wuaki.enableElement("playerMenu")
                        } else {
                            var data = ApiWuaki.getError(requestId);
                            data.modalTitle = Wuaki.language["error"];
                            data.buttonText = Wuaki.language["ok"];
                            Wuaki.elements["modalMenu"].config("TrailerGetStreamMessageError" + JSON.stringify(data), "modalMenu", _this.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                                Wuaki.cleanAllRequest();
                                _this.redrawDetails()
                            });
                            Wuaki.elements["modalMenu"].autoEnable()
                        }
                    });
                    break;
                case "seasons":
                    ApiWuaki.gettingTrailerStreamSeasons(item.id, item.id_stream, auth_token, function(requestId) {
                        if ("success" == ApiWuaki.getResult(requestId)) {
                            var stream = ApiWuaki.getData(requestId);
                            Wuaki.elements["playerMenu"].config("playerMenu" + JSON.stringify(item.id), "playerMenu", "detailsMenu", item.data, "trailer");
                            Wuaki.elements["playerMenu"].fill(stream, item.id, Wuaki.trailersStreamType);
                            Wuaki.enableElement("playerMenu")
                        } else {
                            var data = ApiWuaki.getError(requestId);
                            data.modalTitle = Wuaki.language["error"];
                            data.buttonText = Wuaki.language["ok"];
                            Wuaki.elements["modalMenu"].config("TrailerGetStreamMessageError" + JSON.stringify(data), "modalMenu", _this.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                                Wuaki.cleanAllRequest();
                                _this.redrawDetails()
                            });
                            Wuaki.elements["modalMenu"].autoEnable()
                        }
                    });
                    break;
                case "episodes":
                    ApiWuaki.gettingTrailerStreamEpisodes(item.id, item.id_stream, auth_token, function(requestId) {
                        if ("success" == ApiWuaki.getResult(requestId)) {
                            var stream = ApiWuaki.getData(requestId);
                            Wuaki.elements["playerMenu"].config("playerMenu" + JSON.stringify(item.id), "playerMenu", "detailsMenu", item.data, "trailer");
                            Wuaki.elements["playerMenu"].fill(stream, item.id, Wuaki.trailersStreamType);
                            Wuaki.enableElement("playerMenu")
                        } else {
                            var data = ApiWuaki.getError(requestId);
                            data.modalTitle = Wuaki.language["error"];
                            data.buttonText = Wuaki.language["ok"];
                            Wuaki.elements["modalMenu"].config("TrailerGetStreamMessageError" + JSON.stringify(data), "modalMenu", _this.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                                Wuaki.cleanAllRequest();
                                _this.redrawDetails()
                            });
                            Wuaki.elements["modalMenu"].autoEnable()
                        }
                    });
                    break
            }
        };
        this.menuOptionsTop[pos] = item
    };
    detailsMenu.prototype.actionResume = function(pos) {
        var _this = this;
        var item = new Object;
        item.id = "resume";
        item.action = function() {
            var data = _this.detailsData;
            data.stream = {
                id: "resume"
            };
            if (_this.mode == "episodes") {
                Wuaki.elements["modalMenu"].config("playbackOptionsEpisodes" + data.id + this.id, "modalMenu", _this.name, "playbackOptionsEpisodes", data, modalFillCallbacks.playbackOptions, function() {})
            } else {
                Wuaki.elements["modalMenu"].config("playbackOptionsMovies" + data.id + this.id, "modalMenu", _this.name, "playbackOptionsMovies", data, modalFillCallbacks.playbackOptions, function() {})
            }
            Wuaki.elements["detailsMenu"].disable();
            Wuaki.elements["playerMenu"].parentMenu = "detailsMenu";
            Wuaki.elements["modalMenu"].autoEnable()
        };
        _this.menuOptionsBottom[pos] = item
    };
    detailsMenu.prototype.actionStart = function(pos) {
        var _this = this;
        var item = new Object;
        item.id = "start";
        item.action = function() {
            var data = _this.detailsData;
            data.stream = {
                id: "start"
            };
            if (_this.mode == "episodes") {
                Wuaki.elements["modalMenu"].config("playbackOptionsEpisodes" + data.id + this.id, "modalMenu", _this.name, "playbackOptionsEpisodes", data, modalFillCallbacks.playbackOptions, function() {})
            } else {
                Wuaki.elements["modalMenu"].config("playbackOptionsMovies" + data.id + this.id, "modalMenu", _this.name, "playbackOptionsMovies", data, modalFillCallbacks.playbackOptions, function() {})
            }
            Wuaki.elements["detailsMenu"].disable();
            Wuaki.elements["playerMenu"].parentMenu = "detailsMenu";
            Wuaki.elements["modalMenu"].autoEnable()
        };
        _this.menuOptionsBottom[pos] = item
    };
    detailsMenu.prototype.actionPlaybackOptions = function(pos, data, i, resume) {
        var item = new Object;
        item.id_stream = data.playback_settings.streams[i].id;
        item.id = data.id;
        item.data = data;
        var auth_token = "";
        if (Wuaki.statusLogged) {
            auth_token = Wuaki.user.data.authentication_token
        }
        item.action = function() {
            Wuaki.elements["playerMenu"].resume = resume;
            var streamType = Wuaki.moviesStreamType;
            Wuaki.showLoading();
            switch (_this.mode) {
                case "movies":
                    ApiWuaki.gettingMovieStreams(item.id, item.id_stream, auth_token, function(requestId) {
                        if ("success" === ApiWuaki.getResult(requestId)) {
                            var stream = ApiWuaki.getData(requestId);
                            ApiWuaki.cleanRequest(requestId);
                            Wuaki.elements["playerMenu"].config("playerMenu" + JSON.stringify(item.id), "playerMenu", "detailsMenu", item.data, "movies");
                            Wuaki.elements["playerMenu"].fill(stream, item.id, streamType);
                            Wuaki.enableElement("playerMenu")
                        } else {
                            var data = ApiWuaki.getError(requestId);
                            data.modalTitle = Wuaki.language["error"];
                            data.buttonText = Wuaki.language["ok"];
                            Wuaki.elements["modalMenu"].config("PlaybackGetStreamMessageError" + JSON.stringify(data), "modalMenu", _this.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                                Wuaki.cleanAllRequest();
                                _this.redrawDetails()
                            });
                            Wuaki.elements["modalMenu"].autoEnable()
                        }
                    });
                    break;
                case "episodes":
                    ApiWuaki.gettingEpisodeStreams(item.id, item.id_stream, auth_token, function(requestId) {
                        if ("success" === ApiWuaki.getResult(requestId)) {
                            var stream = ApiWuaki.getData(requestId);
                            ApiWuaki.cleanRequest(requestId);
                            Wuaki.elements["playerMenu"].config("playerMenu" + JSON.stringify(item.id), "playerMenu", "detailsMenu", item.data, "episodes");
                            Wuaki.elements["playerMenu"].fill(stream, item.id, streamType);
                            Wuaki.enableElement("playerMenu")
                        } else {
                            var data = ApiWuaki.getError(requestId);
                            data.modalTitle = Wuaki.language["error"];
                            data.buttonText = Wuaki.language["ok"];
                            Wuaki.elements["modalMenu"].config("PlaybackGetStreamMessageError" + JSON.stringify(data), "modalMenu", _this.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                                Wuaki.cleanAllRequest();
                                _this.redrawDetails()
                            });
                            Wuaki.elements["modalMenu"].autoEnable()
                        }
                    });
                    break
            }
        };
        this.menuOptionsBottom[pos] = item
    };
    detailsMenu.prototype.actionPurchaseOptions = function(pos, data, i) {
        var item = new Object;
        data.detailsMode = this.mode;
        var auth_token = "";
        item.action = function() {
            var purchaseOptions = data.purchase_options[i];
            data.currentPurchasedOption = i;
            if (purchaseOptions.price > 0) Wuaki.fromPurchase = true;
            if (!Wuaki.statusLogged) {
                Wuaki.processCaller = "detailsMenu";
                Wuaki.proccessCallerKey = VK_BDR_ENTER;
                Wuaki.elements["splashMenu"].config("splashPairingFromPurchaseOptions", "splashMenu", "detailsMenu", "splashPairing", {}, null, null);
                Wuaki.elements["splashMenu"].autoEnable()
            } else if (purchaseOptions.price > 0 && Wuaki.user.data.credit_card == null) {
                Wuaki.processCaller = "detailsMenu";
                Wuaki.proccessCallerKey = VK_BDR_ENTER;
                process.preCreditCard()
            } else {
                _this.detailsData.isACoupon = false;
                Wuaki.elements["modalMenu"].config("purchasing" + JSON.stringify(purchaseOptions), "modalMenu", "detailsMenu", "purchasing", data, modalFillCallbacks.purchasingOrCouponModal, function(output) {
                    Wuaki.elements["modalMenu"].purchasingProcessModal();
                    var purchaseable_type, purchaseable_id = data.id;
                    switch (data.detailsMode) {
                        case "movies":
                            purchaseable_type = "movie";
                            break;
                        case "seasons":
                            purchaseable_type = "season";
                            break;
                        default:
                            purchaseable_type = "episode";
                            break
                    }
                    ApiWuaki.purchase(data.purchase_options[data.currentPurchasedOption].id, Wuaki.user.data.authentication_token, function(requestId) {
                        if ("success" === ApiWuaki.getResult(requestId) || "timeout" === ApiWuaki.getResult(requestId)) {
                            if (!Wuaki.asyncPurchase) {
                                Wuaki.cleanAllRequest();
                                _this.redrawDetails();
                                TVA_GoogleAnalytics.analyticMark(TVA.device + "/navigation", "Purchase/" + _this.parent.title + "/" + purchaseOptions.video_quality.abbr)
                            } else {
                                var auth_token = Wuaki.user.data.authentication_token,
                                    id_user = Wuaki.user.data.id;
                                _this.purchaseStatusCheck(id_user, purchaseable_id, purchaseable_type, auth_token, function(requestId) {
                                    Wuaki.cleanAllRequest();
                                    _this.redrawDetails();
                                    TVA_GoogleAnalytics.analyticMark(TVA.device + "/navigation", "Purchase/" + _this.parent.title + "/" + purchaseOptions.video_quality.abbr)
                                })
                            }
                        } else {
                            var data = ApiWuaki.getError(requestId);
                            var type;
                            if (data["class"] == "Wuaki::Exceptions::AlreadyPurchasedException") {
                                data.modalTitle = Wuaki.language["message"];
                                data.buttonText = Wuaki.language["ok"];
                                type = "message"
                            } else {
                                data.modalTitle = Wuaki.language["error"];
                                data.buttonText = Wuaki.language["ok"];
                                type = "errorMessage"
                            }
                            Wuaki.elements["modalMenu"].config("PurchasingMessageError" + JSON.stringify(data), "modalMenu", _this.name, type, data, modalFillCallbacks.errorModal, function(output) {
                                Wuaki.cleanAllRequest();
                                _this.redrawDetails()
                            });
                            Wuaki.elements["modalMenu"].autoEnable()
                        }
                        ApiWuaki.cleanRequest(requestId)
                    })
                });
                Wuaki.elements["modalMenu"].autoEnable()
            }
        };
        this.menuOptionsBottom[pos] = item
    };
    detailsMenu.prototype.purchaseStatusCheck = function(id_user, purchaseable_id, purchaseable_type, auth_token, callback) {
        setTimeout(function() {
            ApiWuaki.purchaseStatus(id_user, purchaseable_id, purchaseable_type, auth_token, function(requestId) {
                if ("success" === ApiWuaki.getResult(requestId)) {
                    var response = ApiWuaki.getData(requestId);
                    if (response.status != "pending") {
                        callback()
                    } else {
                        _this.purchaseStatusCheck(id_user, purchaseable_id, purchaseable_type, auth_token, callback)
                    }
                } else {
                    var data = ApiWuaki.getError(requestId);
                    if (typeof data.message == "undefined" && typeof data.error != "undefined") data.message = data.error;
                    var type;
                    data.modalTitle = Wuaki.language["error"];
                    data.buttonText = Wuaki.language["ok"];
                    type = "errorMessage";
                    Wuaki.elements["modalMenu"].config("PurchasingMessageError" + JSON.stringify(data), "modalMenu", _this.name, type, data, modalFillCallbacks.errorModal, function(output) {
                        Wuaki.cleanAllRequest();
                        _this.redrawDetails()
                    });
                    Wuaki.elements["modalMenu"].autoEnable()
                }
                ApiWuaki.cleanRequest(requestId)
            })
        }, 1e3)
    };
    detailsMenu.prototype.redrawDetails = function() {
        _this.status.ready = false;
        _this.callbackFill(_this.id, _this.parent);
        _this.autoEnable()
    };
    detailsMenu.prototype.actionBackToMovie = function(pos, data) {
        var item = new Object;
        item.action = function() {
            _this.backToMovies()
        };
        this.menuOptionsTop[pos] = item
    };
    detailsMenu.prototype.backToMovies = function() {
        _this.mode = "moviesDetails";
        Wuaki.showLoading();
        _this.redrawDetails()
    };
    detailsMenu.prototype.actionRelatedProfiles = function(pos, data) {
        var item = new Object;
        item = data;
        item.action = function() {
            _this.mode = "profiles";
            _this.redrawDetails();
            Wuaki.elements["gridMenu"].config("actionRelatedProfiles" + item.id, item, "detailsMenu", "normal", 1, 10, 0, gridFillCallbacks.detailsProfile);
            Wuaki.elements["detailsMenu"].autoEnable()
        };
        this.menuOptionsBottom[pos] = item
    };
    detailsMenu.prototype.actionAddToMyWishlist = function(pos, data) {
        var item = new Object;
        item.id = data.id;
        switch (this.mode) {
            case "movies":
                item.action = function() {
                    if (Wuaki.statusLogged) {
                        auth_token = Wuaki.user.data.authentication_token;
                        ApiWuaki.toggleMovieToFavoritesList(item.id, auth_token, function(requestId) {
                            if (ApiWuaki.getResult(requestId) != "success") {
                                Wuaki.apiError(requestId);
                                return
                            }
                            _this.addToWishlistButtonText(ApiWuaki.getData(requestId));
                            ApiWuaki.cleanRequest(requestId);
                            Wuaki.elements["gridMenu"].reset();
                            Wuaki.cleanAllRequestFromElement("gridMenu");
                            Wuaki.cleanAllRequestFromElement("detailsMenu")
                        })
                    } else {}
                };
                break;
            case "seasons":
                item.action = function() {
                    if (Wuaki.statusLogged) {
                        auth_token = Wuaki.user.data.authentication_token;
                        ApiWuaki.toggleSeasonToFavoritesList(item.id, auth_token, function(requestId) {
                            if (ApiWuaki.getResult(requestId) != "success") {
                                Wuaki.apiError(requestId);
                                return
                            }
                            _this.addToWishlistButtonText(ApiWuaki.getData(requestId));
                            ApiWuaki.cleanRequest(requestId);
                            Wuaki.elements["gridMenu"].reset();
                            Wuaki.cleanAllRequestFromElement("gridMenu");
                            Wuaki.cleanAllRequestFromElement("detailsMenu")
                        })
                    } else {}
                };
                break;
            case "episodes":
                item.action = function() {
                    if (Wuaki.statusLogged) {
                        auth_token = Wuaki.user.data.authentication_token;
                        ApiWuaki.toggleEpisodeToFavoritesList(item.id, auth_token, function(requestId) {
                            if (ApiWuaki.getResult(requestId) != "success") {
                                Wuaki.apiError(requestId);
                                return
                            }
                            _this.addToWishlistButtonText(ApiWuaki.getData(requestId));
                            ApiWuaki.cleanRequest(requestId);
                            Wuaki.elements["gridMenu"].reset();
                            Wuaki.cleanAllRequestFromElement("gridMenu");
                            Wuaki.cleanAllRequestFromElement("detailsMenu")
                        })
                    } else {}
                };
                break
        }
        this.menuOptionsTop[pos] = item
    }
}
var detailsFillCallbacks = {
    movie: function(id, parent) {
        if (Wuaki.elements["detailsMenu"].mode !== "profiles") {
            var auth_token = "";
            if (Wuaki.statusLogged) {
                auth_token = Wuaki.user.data.authentication_token
            }
            var movie_id = parent.id;
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "detailsMenu";
            Wuaki.requestList[id].requestId = ApiWuaki.gettingMovieDetail(movie_id, auth_token, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                Wuaki.elements["detailsMenu"].fill(ApiWuaki.getData(requestId), id)
            });
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["detailsMenu"].fill(ApiWuaki.getData(Wuaki.requestList[id].requestId), id)
        }
    },
    season: function(id, parent) {
        var apicalls = new Array;
        var auth_token = "";
        if (Wuaki.statusLogged) {
            auth_token = Wuaki.user.data.authentication_token
        }
        var call = new Object;
        call.funcName = "ApiWuaki.gettingSeasonDetail";
        call.arguments = new Array;
        call.arguments.push('"' + parent.id + '"');
        call.arguments.push('"' + auth_token + '"');
        apicalls.push(call);
        var call = new Object;
        call.funcName = "ApiWuaki.gettingEpisodesListFromSeason";
        call.arguments = new Array;
        call.arguments.push('"' + parent.id + '"');
        call.arguments.push('""');
        call.arguments.push('"2000"');
        call.arguments.push('""');
        call.arguments.push('""');
        call.arguments.push('"' + auth_token + '"');
        apicalls.push(call);
        if (1) {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "queue";
            Wuaki.requestList[id].element = "detailsMenu";
            Wuaki.requestList[id].requestId = id;
            ApiWuaki.queue(id, apicalls, function(id) {
                if (Wuaki.checkAPIError(id, true)) return;
                detailsDataProcess.concatDetailsData(id)
            });
            Wuaki.queueIdLifeTime(id)
        } else {
            detailsDataProcess.concatDetailsData(id)
        }
    },
    episode: function(id, parent) {
        if (1) {
            var auth_token = "";
            if (Wuaki.statusLogged) {
                auth_token = Wuaki.user.data.authentication_token
            }
            var episode_id = parent.id;
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "detailsMenu";
            Wuaki.requestList[id].requestId = ApiWuaki.gettingEpisodeDetail("", episode_id, auth_token, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                Wuaki.elements["detailsMenu"].fill(ApiWuaki.getData(requestId), id)
            });
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["detailsMenu"].fill(ApiWuaki.getData(Wuaki.requestList[id].requestId), id)
        }
    }
};
var detailsDataProcess = {
    concatDetailsData: function(id) {
        var season = ApiWuaki.queueGetData(id, 0);
        season.episodes = new Object;
        season.episodes = ApiWuaki.queueGetData(id, 1);
        Wuaki.elements["detailsMenu"].fill(season, id)
    }
};

function footerMenu() {
    var div;
    var name;
    var status;
    var contentRightDiv, contentLeftDiv;
    footerMenu.prototype.init = function(div, name) {
        this.name = name;
        this.div = div;
        this.timeline = new Object;
        this.status = new Object;
        this.status.visible = false;
        this.draw()
    };
    footerMenu.prototype.enable = function() {
        this.display()
    };
    footerMenu.prototype.disable = function() {
        this.hide()
    };
    footerMenu.prototype.display = function() {
        this.status.visible = true;
        this.div.show()
    };
    footerMenu.prototype.hide = function() {
        this.status.visible = false;
        this.div.hide()
    };
    footerMenu.prototype.reset = function() {};
    footerMenu.prototype.applyNewContent = function() {
        this.div.find("#footerRightDiv").empty().append(this.contentRightDiv);
        this.div.find("#footerLeftDiv").empty().append(this.contentLeftDiv);
        this.contentRightAutoAdjust();
        this.contentRightDiv = $("<div/>");
        this.contentLeftDiv = $("<div/>");
        this.div.show()
    };
    footerMenu.prototype.contentRightAutoAdjust = function() {
        var size = $("#footerRightDiv").width() - 5;
        if (!size) return;
        var footerIcons = $("#footerRightDiv .footerIcon");
        var currentWidth = 0;
        footerIcons.each(function() {
            currentWidth += $(this).outerWidth(true)
        });
        if (size < currentWidth) {
            var maxWidth = Math.floor((size - footerIcons.length * 10) / footerIcons.length);
            var sizeToReduce = currentWidth - size;
            footerIcons.each(function() {
                if ($(this).width() > maxWidth) {
                    var reduce = $(this).width() - maxWidth;
                    if (reduce >= sizeToReduce) reduce = sizeToReduce;
                    $(this).width($(this).width() - reduce);
                    sizeToReduce -= reduce;
                    if (sizeToReduce <= 0) return
                }
            })
        }
    };
    footerMenu.prototype.draw = function() {
        this.div.addClass("fontFooter").addClass(TVA.device);
        $('<div id="footerRightDiv"/>').appendTo(this.div);
        $('<div id="footerLeftDiv"/>').appendTo(this.div);
        this.contentRightDiv = $("<div/>");
        this.contentLeftDiv = $("<div/>")
    };
    footerMenu.prototype.drawLogin = function() {
        $('<div class="footerOptionLeft"><div class="footerLoginIcon"/><div id="userLogin" class="footerLoginText">' + Wuaki.user.data.email + "</div></div>").appendTo(this.contentLeftDiv)
    };
    footerMenu.prototype.drawPair = function() {
        $('<div class="footerOptionLeft"><div class="footerPairIcon"/><div id="userLogin" class="footerLoginText">' + Wuaki.language["pairRegister"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(Wuaki.FOOTER_PAIR)
        }).addClass("pointer").appendTo(this.contentLeftDiv)
    };
    footerMenu.prototype.drawLoginStatus = function(drawPairing) {
        if (Wuaki.statusLogged) {
            this.drawLogin()
        } else if (drawPairing) {
            this.drawPair()
        }
    };
    footerMenu.prototype.drawOptions = function() {
        $('<div class="footerOptionRight"><div class="footerOptionsIcon footerIcon">' + Wuaki.language["Options"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(Wuaki.FOOTER_OPTIONS)
        }).addClass("pointer").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawFF = function() {
        $('<div class="footerOptionRight"><div class="footerFFIcon footerIcon">' + Wuaki.language["FF"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(Wuaki.FOOTER_FF)
        }).addClass("pointer").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawRW = function() {
        $('<div class="footerOptionRight"><div class="footerRWIcon footerIcon">' + Wuaki.language["RW"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(Wuaki.FOOTER_RW)
        }).addClass("pointer").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawStop = function() {
        $('<div class="footerOptionRight"><div class="footerStopIcon footerIcon">' + Wuaki.language["Stop"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(Wuaki.FOOTER_STOP)
        }).addClass("pointer").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawPause = function() {
        $('<div class="footerOptionRight"><div class="footerPauseIcon footerIcon">' + Wuaki.language["Pause"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(Wuaki.FOOTER_PAUSE)
        }).addClass("pointer").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawPlay = function() {
        $('<div class="footerOptionRight"><div class="footerPlayIcon footerIcon">' + Wuaki.language["Play"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(Wuaki.FOOTER_PLAY)
        }).addClass("pointer").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.removeFooterRight = function() {
        $("#footerRightDiv").empty()
    };
    footerMenu.prototype.removeFooterLeft = function() {
        $("#footerLeftDiv").empty()
    };
    footerMenu.prototype.drawReturn = function() {
        $('<div class="footerOptionRight"><div class="footerReturnIcon footerIcon">' + Wuaki.language["Return"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(Wuaki.FOOTER_BACK)
        }).addClass("pointer").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawSelect = function() {
        $('<div class="footerOptionRight"><div class="footerSelectIcon footerIcon">' + Wuaki.language["Select"] + "</div></div>").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawNavigate = function() {
        $('<div class="footerOptionRight"><div class="footerNavigateIcon footerIcon">' + Wuaki.language["Navigate"] + "</div></div>").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawNavigateUpDown = function() {
        $('<div class="footerOptionRight"><div class="footerNavigateUpDownIcon footerIcon">' + Wuaki.language["Navigate"] + "</div></div>").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawSearch = function() {
        $('<div class="footerOptionRight"><div class="footerSearchIcon footerIcon">' + Wuaki.language["Search"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(Wuaki.FOOTER_SEARCH)
        }).addClass("pointer").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawCoupon = function() {
        $('<div class="footerOptionRight"><div class="footerCouponIcon footerIcon">' + Wuaki.language["useCoupon"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(Wuaki.FOOTER_COUPON)
        }).addClass("pointer").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawSubscribe = function() {
        $('<div class="footerOptionRight"><div class="footerSubscribeIcon footerIcon">' + Wuaki.language["subscribe"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(Wuaki.FOOTER_SUBSCRIBE)
        }).addClass("pointer").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawBrowse = function() {
        $('<div class="footerOptionRight"><div class="footerBrowseIcon footerIcon">' + Wuaki.language["browseCatalogue"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(Wuaki.FOOTER_BROWSE)
        }).addClass("pointer").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawNextEpisode = function() {
        $('<div class="footerOptionRight"><div class="footerNextIcon footerIcon">' + Wuaki.language["nextEpisode"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(VK_RIGHT)
        }).addClass("pointer").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawPrevEpisode = function() {
        $('<div class="footerOptionRight"><div class="footerPrevIcon footerIcon">' + Wuaki.language["prevEpisode"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(VK_LEFT)
        }).addClass("pointer").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawNextSeason = function() {
        $('<div class="footerOptionRight"><div class="footerNextIcon footerIcon">' + Wuaki.language["nextSeason"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(VK_RIGHT)
        }).addClass("pointer").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawPrevSeason = function() {
        $('<div class="footerOptionRight"><div class="footerPrevIcon footerIcon">' + Wuaki.language["prevSeason"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(VK_LEFT)
        }).addClass("pointer").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawNavigateLeftRight = function() {
        $('<div class="footerOptionRight"><div class="footerLeftRightIcon footerIcon">' + Wuaki.language["Navigate"] + "</div></div>").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawExit = function() {
        $('<div class="footerOptionRight"><div class="footerReturnIcon footerIcon">' + Wuaki.language["Exit"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(Wuaki.FOOTER_BACK)
        }).addClass("pointer").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawSkip = function() {
        $('<div class="footerOptionRight"><div class="footerSkipIcon footerIcon">' + Wuaki.language["skip"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.landing = false;
            $("#splash").css("background-image", "url(" + Wuaki.background + ")").hide();
            Wuaki.LoadConditions()
        }).addClass("pointer").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawUnpair = function() {
        $('<div class="footerOptionRight"><div class="footerUnpairIcon footerIcon">' + Wuaki.language["Unpair"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(Wuaki.FOOTER_UNPAIR)
        }).addClass("pointer").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawDelete = function() {
        $('<div class="footerOptionRight"><div class="footerDeleteIcon footerIcon">' + Wuaki.language["delete"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(Wuaki.FOOTER_DELETE)
        }).appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.drawContinue = function() {
        $('<div class="footerOptionRight"><div class="footerContinueIcon footerIcon">' + Wuaki.language["continue"] + "</div></div>").bind("mouseenter", this, function(event) {
            $(this).addClass("focus")
        }).bind("mouseleave", this, function() {
            $(this).removeClass("focus")
        }).bind("click", this, function(event) {
            Wuaki.currentElement.nav(Wuaki.FOOTER_CONTINUE)
        }).addClass("pointer").appendTo(this.contentRightDiv)
    };
    footerMenu.prototype.fill = function(data, id) {};
    footerMenu.prototype.config = function(id, parentMenu) {
        if (this.id !== id) {
            this.id = id
        }
    }
}

function gridMenu() {
    var div;
    var name;
    var menuElementCarousel, menuCarousel, parentMenu;
    var focusedOption, selectedOption;
    var menuOptions;
    var menuPagination;
    var id, page, perPage, callbackFill, parent;
    var fillRequestId;
    var status;
    var focusedOptionBeforeBanner;
    var mode;
    var _this = this;
    gridMenu.prototype.init = function(div, name, parentMenu, focusedOption, selectedOption) {
        this.div = div;
        this.name = name;
        this.focusedOption = focusedOption;
        this.selectedOption = selectedOption;
        this.parentMenu = parentMenu;
        this.menuOptions = new Array;
        this.page = 0;
        this.perPage = 10;
        this.id = this.callbackFill = this.fillRequestId = null;
        this.status = new Object;
        this.status.visible = false;
        this.status.enable = false;
        this.status.ready = false;
        this.status.empty = false;
        this.status.autoEnable = false;
        this.status.boot = false;
        this.draw()
    };
    gridMenu.prototype.ready = function() {
        return this.status.ready
    };
    gridMenu.prototype.autoEnable = function() {
        this.status.autoEnable = true;
        if (this.status.ready) {
            Wuaki.enableElement(this.name)
        }
    };
    gridMenu.prototype.enable = function() {
        Wuaki.elements["keyboard"].hide();
        if (this.status.empty) {
            Wuaki.elements["boxFormMenu"].autoEnable()
        } else {
            Wuaki.currentElement = this;
            this.display();
            this.focusOption(this.focusedOption);
            this.status.enable = true;
            this.status.autoEnable = false;
            this.drawFooter()
        }
        Wuaki.hideLoading();
        TVA_GoogleAnalytics.analyticMark(TVA.device + "/navigation", "grid/" + this.parent.name)
    };
    gridMenu.prototype.disable = function() {
        this.status.enable = false;
        this.unfocusOption()
    };
    gridMenu.prototype.display = function() {
        if (this.status.empty == false) {
            this.status.visible = true;
            Wuaki.elements["boxFormMenu"].hide();
            this.div.show()
        }
        if (Wuaki.homescreen) Wuaki.elements["homescreenMenu"].hide()
    };
    gridMenu.prototype.hide = function() {
        this.status.visible = false;
        this.div.hide()
    };
    gridMenu.prototype.drawFooter = function() {
        if (Wuaki.background != "resources/images/1w_pixel_bg.jpg") Wuaki.elements["footerMenu"].div.removeClass("white");
        Wuaki.elements["footerMenu"].drawLoginStatus(TVA.device == "ps4" ? false : true);
        Wuaki.elements["footerMenu"].drawReturn();
        Wuaki.elements["footerMenu"].drawSelect();
        if (!Wuaki.isPremiumUser() && Wuaki.elements["mainMenu"].selectedOption == Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["PlanPremium"])) {
            if (Wuaki.elements["subMenu"].status.visible != true) {
                Wuaki.elements["footerMenu"].drawCoupon();
                if (TVA.device != "ps4") Wuaki.elements["footerMenu"].drawSubscribe();
                Wuaki.elements["footerMenu"].drawBrowse()
            } else {
                Wuaki.elements["footerMenu"].drawNavigate();
                Wuaki.elements["footerMenu"].drawCoupon();
                Wuaki.elements["footerMenu"].drawSubscribe()
            }
        } else {
            Wuaki.elements["footerMenu"].drawNavigate();
            Wuaki.elements["footerMenu"].drawSearch()
        }
        Wuaki.elements["footerMenu"].applyNewContent()
    };
    gridMenu.prototype.resetOptions = function() {
        this.menuCarousel.reset();
        this.menuOptions = new Array
    };
    gridMenu.prototype.reset = function() {
        this.id = null;
        this.focusedOption = 0;
        this.selectedOption = 0;
        this.parentMenu = null;
        this.menuOptions = new Array;
        this.page = 0;
        this.perPage = 10;
        this.id = this.callbackFill = this.fillRequestId = null;
        this.status = new Object;
        this.status.visible = false;
        this.status.enable = false;
        this.status.ready = false;
        this.status.empty = false;
        this.status.autoEnable = false
    };
    gridMenu.prototype.autoSelectConfig = function(focus, select) {
        this.autofocusedOption = focus;
        this.autoselectedOption = select
    };
    gridMenu.prototype.enableFocus = function(option) {
        if (this.status.enable && this.status.visible) this.focusOption(option)
    };
    gridMenu.prototype.hideContent = function() {
        this.div.find("#main_header").hide();
        this.div.find("#main_grid").css("left", "-10000px")
    };
    gridMenu.prototype.showContent = function() {
        this.div.find("#main_header").show();
        this.div.find("#main_grid").css("left", "0px")
    };
    gridMenu.prototype.config = function(id, parent, parentMenu, gridMode, page, perPage, focus, callbackFill) {
        if (this.id !== id) {
            Wuaki.showLoading();
            this.parentMenu = parentMenu;
            this.status.ready = false;
            this.status.empty = false;
            if (this.status.boot) {
                this.status.boot = false;
                this.status.autoEnable = true
            } else this.status.autoEnable = false;
            this.hideContent();
            this.id = id;
            this.gridMode = gridMode;
            this.banner = false;
            this.parent = parent;
            this.page = page;
            this.perPage = perPage;
            this.focusedOption = focus;
            this.focusedOptionBeforeBanner = 0;
            this.clonedDivision = $("main_content_clone");
            this.PremiumBrandConfig();
            this.callbackFill = callbackFill;
            this.callbackFill(this.parent, this.page, this.perPage, this.focusedOption)
        }
        this.display()
    };
    gridMenu.prototype.getConfig = function() {
        var config = new Object;
        config.name = this.name;
        config.id = this.id;
        config.gridMode = this.gridMode;
        config.banner = this.banner;
        config.parent = this.parent;
        config.parentMenu = this.parentMenu;
        config.page = this.page;
        config.perPage = this.perPage;
        config.focusedOption = this.focusedOption;
        config.callbackFill = this.callbackFill;
        config.leftMenuDiv = $("#main_left_menu").css("display");
        config.leftSubMenuDiv = $("#main_left_submenu").css("display");
        config.leftContentDiv = $("#main_content").css("display");
        return config
    };
    gridMenu.prototype.PremiumBrandConfig = function() {
        this.div.find(".brandedHeader").remove();
        $("#main").css("background-image", "");
        if (typeof this.parent.images != "undefined") {
            $('<div class="brandedHeader"></div>').css("background-image", "url(" + this.parent.images.header.original + ")").hide().appendTo(this.div);
            if (this.page == 1) {
                this.perPage = 5;
                this.div.find(".brandedHeader").show()
            } else this.perPage = 10;
            this.gridMode = "reduced";
            $("#main").css("background-image", 'url("' + this.parent.images.pattern.original + '")')
        }
    };
    gridMenu.prototype.showBanner = function(data) {
        this.banner = true;
        this.div.find("#main_banner").empty().css("display", "block").append('<img onerror="commonTools.imgError(this);" style="width: 100%; height: 100%;" src="' + data.subscription_plan.banner.original + '"/>')
    };
    gridMenu.prototype.fill = function(data, fillRequestId) {
        var row_size = this.gridMode == "reduced" && this.page == 1 ? this.perPage : Math.floor(this.perPage / 2);
        if (this.menuElementCarousel.attr("class")) this.menuElementCarousel.attr("class", this.menuElementCarousel.attr("class").replace(/rowSize[0-9]+/, "")).addClass("rowSize" + row_size);
        if (this.gridMode == "reduced" && this.page == 1 && (this.focusedOption < row_size || this.focusedOption == "banner")) {
            this.div.find("#main_header").css("top", "270px");
            this.div.find("#main_grid").css("top", "270px")
        } else {
            this.div.find("#main_header").css("top", "");
            this.div.find("#main_grid").css("top", "");
            this.div.find("#main_banner").hide()
        }
        this.fillRequestId = fillRequestId;
        var gridData = new Array;
        if (typeof data.seasons !== "undefined") {
            gridData = gridData.concat(data.seasons);
            this.mode = "seasons"
        }
        if (typeof data.episodes !== "undefined") {
            gridData = gridData.concat(data.episodes);
            this.mode = "episodes"
        }
        if (typeof data.movies !== "undefined") {
            gridData = gridData.concat(data.movies);
            this.mode = "movies"
        }
        if (typeof data.contents !== "undefined") {
            gridData = gridData.concat(data.contents);
            this.mode = "contents"
        }
        if (typeof data.tv_shows !== "undefined") {
            gridData = gridData.concat(data.tv_shows);
            this.mode = "tvshows"
        }
        if (gridData.length == 0) {
            this.status.empty = true;
            this.status.ready = true;
            Wuaki.cleanRequest(this.fillRequestId);
            Wuaki.elements["boxFormMenu"].config("boxFormMenuEmptyBox" + this.id, "boxFormMenu", this.parentMenu, this, "emptyBoxForm");
            if (this.status.autoEnable == true) Wuaki.elements["boxFormMenu"].autoEnable();
            Wuaki.dimissSplashLoadingScreen();
            Wuaki.hideLoading();
            return false
        } else {
            this.status.empty = false;
            Wuaki.elements["boxFormMenu"].hide()
        }
        this.hideContent();
        this.menuPagination = data.pagination;
        this.resetOptions();
        if (!Wuaki.SVOD || !this.banner) {
            for (var i = 0; i < gridData.length; i++) {
                this.menuCarousel.add(i, this.itemDraw(gridData[i]));
                this.addActionTransitionToItem(gridData[i], this.mode);
                this.menuOptions.push(gridData[i])
            }
            if (Wuaki.SVOD) {
                $(".gridItemTitle").show();
                $(".gridItemPriceContainer").hide()
            }
        }
        if (this.banner) {
            this.addActionToBanner(data.subscription_plans[0]);
            this.menuOptions["banner"] = data.subscription_plans[0]
        }
        this.headerDraw();
        this.showContent();
        this.menuCarousel.options.size = gridData.length;
        this.menuCarousel.last = 10;
        this.addMouseEvents();
        this.status.ready = true;
        Wuaki.dimissSplashLoadingScreen();
        if (this.status.autoEnable) Wuaki.enableElement(this.name);
        Wuaki.hideLoading();
        return true
    };
    gridMenu.prototype.addMouseEvents = function() {
        $(this.div).find("li.jcarousel-item").unbind().bind("mouseenter", this, function(event) {
            var element = event.data;
            element.focusOption(Number($(this).attr("jcarouselindex")));
            if (Wuaki.currentElement.name != element.name) Wuaki.enableElementFromError(element.name)
        }).bind("mouseleave", this, function() {}).bind("click", this, function(event) {
            var element = event.data;
            element.selectCurrentOption()
        }).addClass("pointer");
        $("#headerArrowUp").unbind().bind("click", this, function(event) {
            var element = event.data;
            var oneRow = element.gridMode != "reduced" || element.page != 1;
            element.prevRow();
            if (oneRow) element.prevRow()
        }).addClass("pointer");
        $("#headerArrowDown").unbind().bind("click", this, function(event) {
            var element = event.data;
            var oneRow = element.gridMode != "reduced" || element.page != 1;
            element.nextRow();
            if (oneRow) element.nextRow()
        }).addClass("pointer");
        $("#main_banner").unbind().bind("click", this, function(event) {
            var element = event.data;
            element.selectCurrentOption()
        }).bind("mouseenter", this, function(event) {
            var element = event.data;
            element.focusOption("banner")
        }).addClass("pointer")
    };
    gridMenu.prototype.draw = function() {
        this.menuElementCarousel = $('<ul class="jcarousel-skin-grid" id="' + this.name + '"></ul>').appendTo(this.div.find("#main_grid")).addClass("gridItemFont");
        $("#" + this.name).jcarousel({
            vertical: true,
            scroll: this.perPage,
            animation: Wuaki.animation,
            itemFallbackDimension: this.div.find("#main_grid").height(),
            setupCallback: function(carousel) {
                carousel.reload()
            }
        });
        this.menuCarousel = $("#" + this.name).data("jcarousel")
    };
    gridMenu.prototype.headerDraw = function() {
        var upArrow, downArrow;
        var totalPages = 0;
        if (typeof this.menuPagination.total_pages != "undefined") totalPages = this.menuPagination.total_pages;
        this.div.find("#main_header").empty();
        if (Wuaki.SVOD && this.banner) return;
        if (this.banner) {} else {
            $("<div>" + this.parent.name + '. <span style="color:rgba(185,185,185,1);">' + Wuaki.language["Viewing"] + " " + this.page + " " + Wuaki.language["of"] + " " + totalPages + " " + Wuaki.language["pages"] + ".</span></div>").appendTo(this.div.find("#main_header")).addClass("fontHeader gridHeaderTitle");
            $("#headerArrowUp").remove();
            $("#headerArrowDown").remove();
            if (this.page <= 1) upArrow = "arrowUpDisable";
            else upArrow = "arrowUpEnable";
            $("<div/>").attr("id", "headerArrowUp").addClass(upArrow).appendTo(this.div.find("#main_header"));
            if (this.page == totalPages) downArrow = "arrowDownDisable";
            else downArrow = "arrowDownEnable";
            $("<div/>").attr("id", "headerArrowDown").addClass(downArrow).appendTo(this.div.find("#main_header"))
        }
    };
    gridMenu.prototype.itemDraw = function(data) {
        var itemContent;
        var title = data.title;
        if (this.mode == "tvshows") {
            if (TVA.device == "ps3" || TVA.device == "ps4" || TVA.device == "lg") itemContent = "<div class='gridItemArtwork'><img alt='' class='gridItemArtworkImg' onerror='commonTools.imgError(this);' src='" + data.artwork.web + "'></img></div>";
            else itemContent = "<img alt='' class='gridItemArtwork' onerror='commonTools.imgError(this);' src='" + data.artwork.web + "'></img>";
            itemContent += "<div class='gridItemSeasonTitle'>" + title + "<div class='gridItemSeasonNumber'>" + data.number_of_seasons + " " + Wuaki.language["Seasons"] + "</div></div>"
        } else {
            var ratingWidth = Math.round(data.rating_average * 95 / 50) * 9.5;
            if (Wuaki.SVOD && typeof data.subscription_plans === "undefined") {
                title = Wuaki.language["notAvailable"]
            }
            if (this.mode == "seasons") title = Wuaki.language["Season"] + " " + data.number + " - " + data.display_name.split(" - ")[0];
            var boxText = typeof data.purchaseStatus != "undefined" ? data.purchaseStatus : data.lowest_price;
            if (TVA.device == "ps3" || TVA.device == "ps4" || TVA.device == "lg") itemContent = "<div class='gridItemArtwork'><img alt='' class='gridItemArtworkImg' onerror='commonTools.imgError(this);' src='" + data.artwork.h200 + "'></img></div>";
            else itemContent = "<img alt='' class='gridItemArtwork' onerror='commonTools.imgError(this);' src='" + data.artwork.h200 + "'></img>";
            itemContent += "<div class='gridItemTitle hide'>" + title + "</div> 								<div class='gridItemRating'><div class='gridItemRatingBlackStars'/><div class='gridItemRatingWhiteStars' style='width:" + ratingWidth + "px;'/></div> 								<div class='gridItemPriceContainer'><span class='boxedText'>" + boxText + "</span></div> 								<div class='gridItemNotAvailable'>" + Wuaki.language["notAllowedContent"] + "</div>"
        }
        if (commonTools.checkProviderList(data.provider_id)) {
            var itemContent = $("<div>").append(itemContent);
            itemContent.find("div").addClass("providerFilter");
            itemContent.find("img").addClass("providerFilter");
            itemContent = itemContent.html()
        }
        return itemContent
    };
    gridMenu.prototype.addActionToBanner = function(item) {
        var data = new Object;
        data.subscription_plans = Wuaki.subscriptionPlans;
        item.action = function() {
            Wuaki.proccessCallerKey = VK_BDR_ENTER;
            process.subscription(_this, data, function() {
                Wuaki.enableElement(_this.parentMenu);
                Wuaki.currentElement.selectCurrentOption()
            })
        }
    };
    gridMenu.prototype.addActionTransitionToItem = function(item, mode) {
        if (Wuaki.SVOD && typeof item.subscription_plans === "undefined") {
            item.action = function() {};
            item.transition = function() {};
            return
        }
        switch (mode) {
            case "movies":
                item.action = function() {
                    Wuaki.elements["detailsMenu"].config("detailsMovies" + this.id, this, "gridMenu", mode, detailsFillCallbacks.movie);
                    Wuaki.elements["detailsMenu"].autoEnable()
                };
                item.transition = function() {
                    Wuaki.elements["detailsMenu"].autoEnable()
                };
                break;
            case "seasons":
                item.action = function() {
                    Wuaki.elements["detailsMenu"].config("detailsSeasons" + this.id, this, "gridMenu", mode, detailsFillCallbacks.season);
                    Wuaki.elements["detailsMenu"].autoEnable()
                };
                item.transition = function() {
                    Wuaki.elements["detailsMenu"].autoEnable()
                };
                break;
            case "episodes":
                item.action = function() {
                    Wuaki.elements["detailsMenu"].config("detailsEpisodes" + this.id, this, "gridMenu", mode, detailsFillCallbacks.episode);
                    Wuaki.elements["detailsMenu"].autoEnable()
                };
                item.transition = function() {
                    Wuaki.elements["detailsMenu"].autoEnable()
                };
                break;
            case "contents":
                item.action = function() {
                    var callback = detailsFillCallbacks.episode;
                    if (item.content_type == "Season") callback = detailsFillCallbacks.season;
                    else if (item.content_type == "Movie") callback = detailsFillCallbacks.movie;
                    Wuaki.elements["detailsMenu"].config("detailsContents" + this.id, this, "gridMenu", mode, callback);
                    Wuaki.elements["detailsMenu"].autoEnable()
                };
                item.transition = function() {
                    Wuaki.elements["detailsMenu"].autoEnable()
                };
                break;
            case "tvshows":
                item.action = function() {
                    var auth_token = "";
                    if (Wuaki.statusLogged) {
                        auth_token = Wuaki.user.data.authentication_token
                    }
                    ApiWuaki.gettingTVShowsDetail(this.id, auth_token, function(requestId) {
                        if ("success" == ApiWuaki.getResult(requestId)) {
                            mode = "seasons";
                            var data = ApiWuaki.getData(requestId).seasons[0];
                            Wuaki.elements["detailsMenu"].config("detailsSeasons" + data.id, data, "gridMenu", mode, detailsFillCallbacks.season);
                            Wuaki.elements["detailsMenu"].autoEnable()
                        }
                    })
                };
                item.transition = function() {
                    Wuaki.elements["detailsMenu"].autoEnable()
                };
                break
        }
        if (commonTools.checkProviderList(item.provider_id) && Wuaki.elements["mainMenu"].selectedOption == Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["MyLibrary"])) {
            item.nextAction = item.action;
            item.action = function() {
                Wuaki.elements["modalMenu"].config("notAllowedContent" + item.id, "modalMenu", "gridMenu", "message", Wuaki.language["notAllowedContentMessage2"], modalFillCallbacks.notAllowedContent, function(output) {
                    Wuaki.enableElement("gridMenu")
                });
                Wuaki.elements["modalMenu"].autoEnable()
            }
        }
    };
    gridMenu.prototype.nav = function(keycode) {
        switch (keycode) {
            case VK_UP:
                this.prevRow();
                break;
            case VK_DOWN:
                this.nextRow();
                break;
            case VK_LEFT:
                this.prevOption();
                break;
            case VK_RIGHT:
                this.nextOption();
                break;
            case VK_BDR_ENTER:
            case VK_CROSS:
                this.selectCurrentOption();
                break;
            case VK_BDR_RED:
            case Wuaki.customBrowserKey:
            case Wuaki.FOOTER_BROWSE:
                if (!Wuaki.isPremiumUser() && Wuaki.elements["mainMenu"].selectedOption == Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["PlanPremium"]) && Wuaki.elements["subMenu"].status.visible != true) {
                    Wuaki.browsePlanPremium = true;
                    Wuaki.enableElement("mainMenu");
                    Wuaki.currentElement.selectCurrentOption()
                }
                break;
            case VK_BDR_BLUE:
            case VK_SQUARE:
            case Wuaki.FOOTER_COUPON:
                if (!Wuaki.isPremiumUser() && Wuaki.elements["mainMenu"].selectedOption == Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["PlanPremium"]) || Wuaki.isProcessedCallerKey) {
                    var data = new Object;
                    data.subscription_plans = Wuaki.subscriptionPlans;
                    Wuaki.proccessCallerKey = keycode;
                    process.couponForSubscription(_this, data, function() {
                        Wuaki.enableElement(_this.parentMenu);
                        Wuaki.currentElement.selectCurrentOption()
                    })
                }
                break;
            case VK_BDR_GREEN:
            case VK_TRIANGLE:
            case Wuaki.FOOTER_SUBSCRIBE:
            case Wuaki.FOOTER_SEARCH:
                if (TVA.device == "ps4" && !Wuaki.isPremiumUser() && Wuaki.elements["mainMenu"].selectedOption == Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["PlanPremium"]) && Wuaki.elements["subMenu"].status.visible != true) {
                    Wuaki.browsePlanPremium = true;
                    Wuaki.enableElement("mainMenu");
                    Wuaki.currentElement.selectCurrentOption()
                } else if (!Wuaki.isPremiumUser() && Wuaki.elements["mainMenu"].selectedOption == Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["PlanPremium"]) || Wuaki.isProcessedCallerKey) {
                    var data = new Object;
                    data.subscription_plans = Wuaki.subscriptionPlans;
                    Wuaki.proccessCallerKey = keycode;
                    process.subscription(_this, data, function() {
                        Wuaki.enableElement(_this.parentMenu);
                        Wuaki.currentElement.selectCurrentOption()
                    })
                } else {
                    Wuaki.elements["detailsMenu"].hide();
                    Wuaki.enableElement("mainMenu");
                    Wuaki.elements["mainMenu"].unselectOption(Wuaki.elements["mainMenu"].selectedOption);
                    Wuaki.elements["mainMenu"].unfocusOption(Wuaki.elements["mainMenu"].focusedOption);
                    Wuaki.elements["mainMenu"].focusedOption = 0;
                    Wuaki.elements["mainMenu"].selectOption(Wuaki.elements["mainMenu"].focusedOption)
                }
                break;
            case VK_BDR_YELLOW:
            case Wuaki.customPairKey:
            case Wuaki.FOOTER_PAIR:
                if (!Wuaki.statusLogged) {
                    Wuaki.fromPurchase = false;
                    Wuaki.processCaller = this.name;
                    Wuaki.proccessCallerKey = keycode;
                    Wuaki.elements["splashMenu"].config("splashPairingFromPurchaseOptions", "splashMenu", this.name, "splashPairing", {}, null, null);
                    Wuaki.elements["splashMenu"].autoEnable()
                }
                break;
            case VK_BDR_RETURN:
            case VK_CIRCLE:
            case Wuaki.FOOTER_BACK:
                this.unfocusOption();
                Wuaki.enableElement(this.parentMenu);
                break;
            default:
                break
        }
    };
    gridMenu.prototype.nextRow = function(comesFromNextOption) {
        var row_size = this.gridMode == "reduced" && this.page == 1 ? this.perPage : Math.floor(this.perPage / 2);
        if (this.focusedOption == "banner" && !Wuaki.SVOD) {
            this.unfocusBanner();
            this.focusedOption = this.focusedOptionBeforeBanner;
            this.focusOption(this.focusedOption)
        } else if (this.banner) {
            return
        } else if (this.focusedOption + row_size < this.menuCarousel.options.size) {
            this.focusOption(this.focusedOption + row_size)
        } else if (this.page < this.menuPagination.total_pages) {
            if (this.gridMode == "reduced" && this.page == 1) {
                this.hideContent();
                this.div.find("#main_banner").hide();
                this.div.find(".brandedHeader").hide();
                this.div.find("#main_header").css("top", "");
                this.div.find("#main_grid").css("top", "");
                this.perPage = 10
            }
            this.unfocusOption();
            if (comesFromNextOption) this.focusedOption = 0;
            else this.focusedOption = this.focusedOption % row_size;
            if (Wuaki.animation) {
                $("#main_content_clone").remove();
                this.clonedDivision = commonTools.cloneDiv(this.div, "#main");
                this.clonedDivision.css("top", "0px");
                _this.div.css("top", "674px").css("opacity", "0.25");
                Wuaki.blocked = true;
                this.animationTimeout = window.setTimeout(function() {
                    _this.animation("up")
                }, Wuaki.gridTimeOutAnimation)
            }
            Wuaki.showLoading();
            this.callbackFill(this.parent, ++this.page, this.perPage, this.focusedOption)
        } else if (this.focusedOption < row_size) this.focusOption(this.menuCarousel.options.size)
    };
    gridMenu.prototype.prevRow = function() {
        var row_size = this.gridMode == "reduced" && this.page == 1 ? this.perPage : Math.floor(this.perPage / 2);
        if (this.focusedOption - row_size >= 0) {
            this.focusOption(this.focusedOption - row_size)
        } else {
            if (this.page > 1) {
                if (this.gridMode == "reduced" && this.page == 2) {
                    this.hideContent();
                    this.div.find("#main_header").css("top", "270px");
                    this.div.find("#main_grid").css("top", "270px");
                    if (this.banner == true) this.div.find("#main_banner").show();
                    else {
                        this.div.find(".brandedHeader").show()
                    }
                    this.perPage = 5
                }
                this.unfocusOption();
                if (this.gridMode != "reduced") this.focusedOption = this.focusedOption + row_size;
                if (Wuaki.animation) {
                    $("#main_content_clone").remove();
                    this.clonedDivision = commonTools.cloneDiv(this.div, "#main");
                    this.clonedDivision.css("top", "0px");
                    _this.div.css("top", "-674px").css("opacity", "0.25");
                    Wuaki.blocked = true;
                    this.animationTimeout = window.setTimeout(function() {
                        _this.animation("down")
                    }, Wuaki.gridTimeOutAnimation)
                }
                Wuaki.showLoading();
                this.callbackFill(this.parent, --this.page, this.perPage, this.focusedOption)
            } else {
                if (this.banner) {
                    this.focusOption("banner")
                }
            }
        }
    };
    gridMenu.prototype.animation = function(direction) {
        window.clearTimeout(_this.animationTimeout);
        if (direction == "up") {
            _this.clonedDivision.animate({
                opacity: .25,
                top: "-674px"
            }, Wuaki.gridAnimationTime, "swing", function() {});
            _this.div.animate({
                opacity: 1,
                top: "0px"
            }, Wuaki.gridAnimationTime, function() {
                Wuaki.blocked = false
            })
        } else {
            _this.clonedDivision.animate({
                opacity: .25,
                top: "674px"
            }, Wuaki.gridAnimationTime, "swing", function() {});
            _this.div.animate({
                opacity: 1,
                top: "0px"
            }, Wuaki.gridAnimationTime, function() {
                Wuaki.blocked = false
            })
        }
    };
    gridMenu.prototype.focusBanner = function() {
        if (this.focusedOption != "banner") this.focusedOptionBeforeBanner = this.focusedOption;
        this.div.find("#main_banner").addClass("gridBannerFocus")
    };
    gridMenu.prototype.unfocusBanner = function() {
        this.div.find("#main_banner").removeClass("gridBannerFocus")
    };
    gridMenu.prototype.focusOption = function(option) {
        var first = this.menuCarousel.first;
        var last = this.menuCarousel.last;
        this.unfocusOption();
        if (option == "banner") {
            this.focusBanner()
        } else {
            if (option >= this.menuCarousel.options.size) option = this.menuCarousel.options.size - 1;
            li_active = $("#" + this.name + " .jcarousel-item-" + option);
            this.itemFocus(li_active)
        }
        this.focusedOption = option
    };
    gridMenu.prototype.unfocusOption = function() {
        var first = this.menuCarousel.first;
        var last = this.menuCarousel.last;
        if (this.focusedOption == "banner") {
            this.unfocusBanner();
            return
        } else {
            var li_active = $("#" + this.name + " li.lihover");
            this.itemUnfocus(li_active)
        }
    };
    gridMenu.prototype.selectCurrentOption = function() {
        if (this.focusedOption == "banner") {} else {
            $("#" + this.name + " li.active").removeClass("active");
            $("#" + this.name + " li.lihover").addClass("active")
        }
        this.selectedOption = this.focusedOption;
        this.menuOptions[this.selectedOption].action()
    };
    gridMenu.prototype.nextOption = function() {
        if (this.focusedOption == "banner") {
            return
        }
        if (this.focusedOption + 1 >= this.menuCarousel.options.size || this.focusedOption == 9) {
            this.nextRow(true);
            return
        }
        var nextElement = $("#" + this.name + " li.lihover").next();
        if (nextElement.length) {
            this.unfocusOption();
            this.itemFocus(nextElement);
            this.focusedOption = Number(nextElement.attr("jcarouselindex"));
            var last = this.menuCarousel.last
        }
    };
    gridMenu.prototype.prevOption = function() {
        var row_size = this.gridMode == "reduced" && this.page == 1 ? this.perPage : Math.floor(this.perPage / 2);
        if (this.focusedOption == 0 || this.focusedOption == row_size || this.focusedOption == "banner") {
            this.unfocusOption();
            Wuaki.enableElement(this.parentMenu);
            return
        }
        var prevElement = $("#" + this.name + " li.lihover").prev();
        if (prevElement.length) {
            this.unfocusOption();
            this.itemFocus(prevElement);
            this.focusedOption = Number(prevElement.attr("jcarouselindex"));
            var first = this.menuCarousel.first
        }
    };
    gridMenu.prototype.itemFocus = function(item) {
        item.addClass("lihover");
        item.find(".gridItemArtwork").addClass("ItemArtworkfocus");
        if (!Wuaki.SVOD) {
            item.find(".gridItemPriceContainer").hide();
            item.find(".gridItemTitle").show()
        }
        item.find(".gridItemRating").hide()
    };
    gridMenu.prototype.itemUnfocus = function(item) {
        item.removeClass("lihover");
        item.find(".gridItemArtwork").removeClass("ItemArtworkfocus");
        if (!Wuaki.SVOD) {
            item.find(".gridItemPriceContainer").show();
            item.find(".gridItemTitle").hide()
        }
        item.find(".gridItemRating").show()
    }
}
var gridFillCallbacks = {
    detailsProfile: function(parent, page, perPage, item) {
        var id = "listMoviesByPerson" + page + parent.id + parent.name;
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "gridMenu";
            Wuaki.requestList[id].requestId = ApiWuaki.listMoviesByPerson(parent.id, page, perPage, 0, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                Wuaki.elements["gridMenu"].enableFocus(item)
            });
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(Wuaki.requestList[id].requestId), id);
            Wuaki.elements["gridMenu"].enableFocus(item)
        }
    },
    search: function(parent, page, perPage, item) {
        var filters = parent.filters;
        var id = "gridSearch_movies" + page + parent.id + parent.name + parent.input.value + filters[0].name + filters[1].abbr;
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "keyboard";
            var auth_token = "",
                classification_id = Wuaki.defaultClassificationId,
                id_subscription_plan = Wuaki.defaultSubscriptionPlan,
                meta_sort = "title.asc",
                purchase_method = "",
                title_like = parent.input.value;
            if (Wuaki.statusLogged) {
                auth_token = Wuaki.user.data.authentication_token;
                if (Wuaki.user.data.profile.classification.id) classification_id = Wuaki.user.data.profile.classification.id;
                if (Wuaki.user.subscriptionPlan.subscriptions.length != 0) id_subscription_plan = Wuaki.user.subscriptionPlan.subscriptions[0].subscription_plan.id
            }
            var filters = parent.filters;
            if (filters[0].name == Wuaki.language["Movies"]) {
                if (filters[1].abbr == "HD") {
                    Wuaki.requestList[id].requestId = ApiWuaki.listHDMovies(meta_sort, purchase_method, classification_id, title_like, perPage, page, 0, auth_token, function(requestId) {
                        if (ApiWuaki.getResult(requestId) != "success") {
                            Wuaki.apiError(requestId);
                            return
                        }
                        Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                        Wuaki.elements["gridMenu"].enableFocus(item)
                    })
                } else {
                    if (Wuaki.SVOD) Wuaki.requestList[id].requestId = ApiWuaki.gettingListOfAllSubscriptionMovies(id_subscription_plan, "", meta_sort, title_like, classification_id, "", perPage, page, 0, auth_token, function(requestId) {
                        if (ApiWuaki.getResult(requestId) != "success") {
                            Wuaki.apiError(requestId);
                            return
                        }
                        Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                        Wuaki.elements["gridMenu"].enableFocus(item)
                    });
                    else Wuaki.requestList[id].requestId = ApiWuaki.gettingMoviesList(meta_sort, purchase_method, classification_id, title_like, perPage, page, 0, auth_token, function(requestId) {
                        if (ApiWuaki.getResult(requestId) != "success") {
                            Wuaki.apiError(requestId);
                            return
                        }
                        Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                        Wuaki.elements["gridMenu"].enableFocus(item)
                    })
                }
            } else {
                if (Wuaki.SVOD) Wuaki.requestList[id].requestId = ApiWuaki.gettingListOfAllSeasonFromSubscriptionPlan(id_subscription_plan, "", meta_sort, title_like, classification_id, "", perPage, page, 0, auth_token, function(requestId) {
                    if (ApiWuaki.getResult(requestId) != "success") {
                        Wuaki.apiError(requestId);
                        return
                    }
                    Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                    Wuaki.elements["gridMenu"].enableFocus(item)
                });
                else Wuaki.requestList[id].requestId = ApiWuaki.gettingSeasonList(meta_sort, purchase_method, classification_id, title_like, perPage, page, 0, auth_token, function(requestId) {
                    if (ApiWuaki.getResult(requestId) != "success") {
                        Wuaki.apiError(requestId);
                        return
                    }
                    Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                    Wuaki.elements["gridMenu"].enableFocus(item)
                })
            }
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(Wuaki.requestList[id].requestId), id);
            Wuaki.elements["gridMenu"].enableFocus(item)
        }
    },
    movies: function(parent, page, perPage, item) {
        var id = "gridFillCallbacks_movies" + page + parent.id + parent.name;
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "gridMenu";
            var auth_token = "",
                classification_id = Wuaki.defaultClassificationId,
                meta_sort = "",
                purchase_method = "",
                title_like = "";
            if (Wuaki.statusLogged) {
                auth_token = Wuaki.user.data.authentication_token;
                if (Wuaki.user.data.profile.classification.id) classification_id = Wuaki.user.data.profile.classification.id
            }
            Wuaki.requestList[id].requestId = ApiWuaki.gettingMoviesList(meta_sort, purchase_method, classification_id, title_like, perPage, page, 0, auth_token, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                Wuaki.elements["gridMenu"].enableFocus(item)
            });
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(Wuaki.requestList[id].requestId), id);
            Wuaki.elements["gridMenu"].enableFocus(item)
        }
    },
    moviesNewReleases: function(parent, page, perPage, item) {
        var id = "moviesNewReleases" + page + parent.id + parent.name;
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "gridMenu";
            Wuaki.requestList[id].requestId = ApiWuaki.listRecentlyReleasedMovies(page, perPage, 0, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                Wuaki.elements["gridMenu"].enableFocus(item)
            });
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(Wuaki.requestList[id].requestId), id);
            Wuaki.elements["gridMenu"].enableFocus(item)
        }
    },
    gettingListFromEditorial: function(parent, page, perPage, item) {
        var id = "gettingListFromEditorial" + page + parent.id + parent.name;
        var meta_sort = "",
            purchase_method = "",
            classification_id = Wuaki.defaultClassificationId,
            auth_token = "";
        var id_list = parent.id;
        if (Wuaki.statusLogged) {
            auth_token = Wuaki.user.data.authentication_token;
            if (Wuaki.user.data.profile.classification.id) classification_id = Wuaki.user.data.profile.classification.id
        }
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "gridMenu";
            Wuaki.requestList[id].requestId = ApiWuaki.gettingListFromEditorial(parent.content_type, id_list, false, meta_sort, purchase_method, classification_id, page, perPage, 0, auth_token, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                Wuaki.elements["gridMenu"].enableFocus(item)
            });
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(Wuaki.requestList[id].requestId), id);
            Wuaki.elements["gridMenu"].enableFocus(item)
        }
    },
    moviesRecommended: function(parent, page, perPage, item) {
        var id = "moviesRecommended" + page + parent.id + parent.name;
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "gridMenu";
            Wuaki.requestList[id].requestId = ApiWuaki.listFeaturedMovies(page, perPage, 0, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                Wuaki.elements["gridMenu"].enableFocus(item)
            });
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(Wuaki.requestList[id].requestId), id);
            Wuaki.elements["gridMenu"].enableFocus(item)
        }
    },
    moviesMostWatched: function(parent, page, perPage, item) {
        var id = "moviesMostWatched" + page + parent.id + parent.name;
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].requestId = ApiWuaki.listTopRatedMovies(page, perPage, 0, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                Wuaki.elements["gridMenu"].enableFocus(item)
            });
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(Wuaki.requestList[id].requestId), id);
            Wuaki.elements["gridMenu"].enableFocus(item)
        }
    },
    moviesFree: function(parent, page, perPage, item) {
        var id = "moviesFree" + page + parent.id + parent.name;
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "gridMenu";
            Wuaki.requestList[id].requestId = ApiWuaki.listFreeMovies(page, perPage, 0, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                Wuaki.elements["gridMenu"].enableFocus(item)
            });
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(Wuaki.requestList[id].requestId), id);
            Wuaki.elements["gridMenu"].enableFocus(item)
        }
    },
    moviesByGenre: function(parent, page, perPage, item) {
        var id = "moviesByGenre" + page + parent.id + parent.name;
        var offset = 0,
            meta_sort = "",
            purchase_method = "",
            classification_id = Wuaki.defaultClassificationId,
            auth_token = "";
        var id_genres = parent.id;
        if (Wuaki.statusLogged) {
            auth_token = Wuaki.user.data.authentication_token;
            if (Wuaki.user.data.profile.classification.id) classification_id = Wuaki.user.data.profile.classification.id
        }
        if (page > 1 && typeof parent.images != "undefined") {
            page--;
            offset = this.perPage / 2
        }
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "gridMenu";
            Wuaki.requestList[id].requestId = ApiWuaki.gettingMoviesListByGenres(id_genres, meta_sort, purchase_method, classification_id, perPage, page, offset, auth_token, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                Wuaki.elements["gridMenu"].enableFocus(item)
            });
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(Wuaki.requestList[id].requestId), id);
            Wuaki.elements["gridMenu"].enableFocus(item)
        }
    },
    seasons: function(parent, page, perPage, item) {
        var id = "seasons" + page + parent.id + parent.name;
        var auth_token = "",
            title_like = "",
            meta_sort = "",
            purchase_method = "",
            classification_id = Wuaki.defaultClassificationId;
        if (Wuaki.statusLogged) {
            auth_token = Wuaki.user.data.authentication_token;
            if (Wuaki.user.data.profile.classification.id) classification_id = Wuaki.user.data.profile.classification.id
        }
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "gridMenu";
            Wuaki.requestList[id].requestId = ApiWuaki.gettingTVShowsList(meta_sort, purchase_method, classification_id, title_like, perPage, page, 0, auth_token, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                Wuaki.elements["gridMenu"].enableFocus(item)
            });
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(Wuaki.requestList[id].requestId), id);
            Wuaki.elements["gridMenu"].enableFocus(item)
        }
    },
    planPremiumMoviesHighlighted: function(parent, page, perPage, item) {
        var id = "planPremiumMoviesHighlighted" + page;
        var meta_sort = "",
            subscription_highlighted = "true",
            genre_id = "",
            classification_id = Wuaki.defaultClassificationId,
            auth_token = "";
        if (Wuaki.statusLogged) {
            auth_token = Wuaki.user.data.authentication_token;
            if (Wuaki.user.data.profile.classification.id) classification_id = Wuaki.user.data.profile.classification.id
        }
        var apicalls = new Array;
        var call = new Object;
        call.funcName = "ApiWuaki.gettingListAllSubscriptionsAvailable";
        call.arguments = new Array;
        call.arguments.push('"' + auth_token + '"');
        apicalls.push(call);
        var call = new Object;
        call.funcName = "ApiWuaki.gettingListOfAllSubscriptionMovies";
        call.arguments = new Array;
        call.arguments.push("ApiWuaki.queueList[id].result[0].data.subscription_plans[0].id");
        call.arguments.push('"' + genre_id + '"');
        call.arguments.push('"' + meta_sort + '"');
        call.arguments.push('""');
        call.arguments.push('"' + classification_id + '"');
        call.arguments.push('"' + subscription_highlighted + '"');
        call.arguments.push('"' + perPage + '"');
        call.arguments.push('"' + page + '"');
        call.arguments.push('"' + 0 + '"');
        call.arguments.push('"' + auth_token + '"');
        apicalls.push(call);
        var call = new Object;
        call.funcName = "ApiWuaki.gettingSubscriptionDetail";
        call.arguments = new Array;
        call.arguments.push("ApiWuaki.queueList[id].result[0].data.subscription_plans[0].id");
        call.arguments.push('"' + auth_token + '"');
        apicalls.push(call);
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "gridMenu";
            ApiWuaki.queue(id, apicalls, function(id) {
                if (Wuaki.checkAPIError(id, true)) return;
                var data = ApiWuaki.queueGetData(id, 1);
                data.subscription_plans = ApiWuaki.queueGetData(id, 0)["subscription_plans"];
                data.subscription_plan = ApiWuaki.queueGetData(id, 2);
                Wuaki.elements["gridMenu"].showBanner(data);
                Wuaki.elements["gridMenu"].fill(data, id);
                Wuaki.elements["gridMenu"].enableFocus(item)
            });
            Wuaki.queueIdLifeTime(id)
        } else {
            var data = ApiWuaki.queueGetData(id, 1);
            data.subscription_plans = ApiWuaki.queueGetData(id, 0)["subscription_plans"];
            data.subscription_plan = ApiWuaki.queueGetData(id, 2);
            Wuaki.elements["gridMenu"].showBanner(data);
            Wuaki.elements["gridMenu"].fill(data, id);
            Wuaki.elements["gridMenu"].enableFocus(item)
        }
    },
    planPremiumRecentlyAdded: function(parent, page, perPage, item) {
        var id = "planPremiumRecentlyAdded" + page + parent.id + parent.name;
        var auth_token = "",
            classification_id = Wuaki.defaultClassificationId,
            id_subscription_plan = Wuaki.subscriptionPlans[0].id,
            meta_sort = "publish_at.desc",
            subscription_highlighted = "";
        var genre_id = parent.id;
        if (Wuaki.statusLogged) {
            auth_token = Wuaki.user.data.authentication_token;
            if (Wuaki.user.data.profile.classification.id) classification_id = Wuaki.user.data.profile.classification.id;
            if (Wuaki.user.subscriptionPlan.subscriptions.length != 0) id_subscription_plan = Wuaki.user.subscriptionPlan.subscriptions[0].subscription_plan.id
        }
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "gridMenu";
            Wuaki.requestList[id].requestId = ApiWuaki.gettingListOfAllSubscriptionMovies(id_subscription_plan, genre_id, meta_sort, "", classification_id, subscription_highlighted, perPage, page, 0, auth_token, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                Wuaki.elements["gridMenu"].enableFocus(item)
            });
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(Wuaki.requestList[id].requestId), id);
            Wuaki.elements["gridMenu"].enableFocus(item)
        }
    },
    gettingListFromSubscriptionEditorial: function(parent, page, perPage, item) {
        var offset = 0,
            meta_sort = "",
            purchase_method = "",
            classification_id = Wuaki.defaultClassificationId,
            auth_token = "";
        var id_list = parent.id;
        if (Wuaki.statusLogged) {
            auth_token = Wuaki.user.data.authentication_token;
            if (Wuaki.user.data.profile.classification.id) classification_id = Wuaki.user.data.profile.classification.id
        }
        if (page > 1 && typeof parent.images != "undefined") {
            page--;
            offset = this.perPage / 2
        }
        var id = "gettingListFromSubscriptionEditorial" + page + parent.id + parent.name + offset;
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "gridMenu";
            Wuaki.requestList[id].requestId = ApiWuaki.gettingListFromEditorial(parent.content_type, id_list, true, meta_sort, purchase_method, classification_id, page, perPage, offset, auth_token, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                Wuaki.elements["gridMenu"].enableFocus(item)
            });
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(Wuaki.requestList[id].requestId), id);
            Wuaki.elements["gridMenu"].enableFocus(item)
        }
    },
    planPremiumMovies: function(parent, page, perPage, item) {
        var offset = 0,
            auth_token = "",
            classification_id = Wuaki.defaultClassificationId,
            id_subscription_plan = Wuaki.subscriptionPlans[0].id,
            meta_sort = "",
            subscription_highlighted = "";
        var genre_id = parent.id;
        if (Wuaki.statusLogged) {
            auth_token = Wuaki.user.data.authentication_token;
            if (Wuaki.user.data.profile.classification.id) classification_id = Wuaki.user.data.profile.classification.id;
            if (Wuaki.user.subscriptionPlan.subscriptions.length != 0) id_subscription_plan = Wuaki.user.subscriptionPlan.subscriptions[0].subscription_plan.id
        }
        if (page > 1 && typeof parent.images != "undefined") {
            page--;
            offset = this.perPage / 2
        }
        var id = "planPremiumMovies" + page + parent.id + parent.name + offset;
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "gridMenu";
            Wuaki.requestList[id].requestId = ApiWuaki.gettingListOfAllSubscriptionMovies(id_subscription_plan, genre_id, meta_sort, "", classification_id, subscription_highlighted, perPage, page, offset, auth_token, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                Wuaki.elements["gridMenu"].enableFocus(item)
            });
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(Wuaki.requestList[id].requestId), id);
            Wuaki.elements["gridMenu"].enableFocus(item)
        }
    },
    planPremiumSeasons: function(parent, page, perPage, item) {
        var id = "planPremiumSeasons" + page + parent.id + parent.name;
        var auth_token = "",
            classification_id = Wuaki.defaultClassificationId,
            id_subscription_plan = Wuaki.subscriptionPlans[0].id,
            meta_sort = "",
            subscription_highlighted = "";
        if (Wuaki.statusLogged) {
            auth_token = Wuaki.user.data.authentication_token;
            if (Wuaki.user.data.profile.classification.id) classification_id = Wuaki.user.data.profile.classification.id;
            if (Wuaki.user.subscriptionPlan.subscriptions.length != 0) id_subscription_plan = Wuaki.user.subscriptionPlan.subscriptions[0].subscription_plan.id
        }
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "gridMenu";
            Wuaki.requestList[id].requestId = ApiWuaki.gettingTVShowsListPremium(id_subscription_plan, meta_sort, "", classification_id, "", perPage, page, 0, auth_token, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                Wuaki.elements["gridMenu"].enableFocus(item)
            });
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(Wuaki.requestList[id].requestId), id);
            Wuaki.elements["gridMenu"].enableFocus(item)
        }
    },
    myFavouritesMovies: function(parent, page, perPage, item) {
        var id = "myFavouritesMovies" + page + parent.id + parent.name;
        var auth_token = "",
            classification_id = Wuaki.defaultClassificationId,
            id_subscription_plan = "";
        if (Wuaki.statusLogged) {
            auth_token = Wuaki.user.data.authentication_token;
            if (Wuaki.user.data.profile.classification.id) classification_id = Wuaki.user.data.profile.classification.id
        }
        if (typeof Wuaki.requestList[id] === "undefined") {
            var perPage = perPage;
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "gridMenu";
            Wuaki.requestList[id].requestId = ApiWuaki.gettingFavoritesMoviesList(perPage, page, 0, auth_token, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                var data = ApiWuaki.getData(requestId);
                if (data.pagination.total_pages < data.pagination.page) {
                    Wuaki.elements["gridMenu"].id = "";
                    Wuaki.elements["gridMenu"].config("myFavouritesMovies", Wuaki.elements["gridMenu"].parent, "subMenu", "normal", data.pagination.total_pages, 10, 0, gridFillCallbacks.myFavouritesMovies);
                    Wuaki.elements["gridMenu"].autoEnable()
                } else {
                    Wuaki.elements["gridMenu"].fill(data, id);
                    Wuaki.elements["gridMenu"].enableFocus(item)
                }
            });
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(Wuaki.requestList[id].requestId), id);
            Wuaki.elements["gridMenu"].enableFocus(item)
        }
    },
    myFavouritesSeasons: function(parent, page, perPage, item) {
        var id = "myFavouritesSeasons" + page + parent.id + parent.name;
        var auth_token = "",
            classification_id = Wuaki.defaultClassificationId,
            id_subscription_plan = "";
        if (Wuaki.statusLogged) {
            auth_token = Wuaki.user.data.authentication_token;
            if (Wuaki.user.data.profile.classification.id) classification_id = Wuaki.user.data.profile.classification.id
        }
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "gridMenu";
            Wuaki.requestList[id].requestId = ApiWuaki.gettingFavoritesSeasonsList(perPage, page, 0, auth_token, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                Wuaki.elements["gridMenu"].enableFocus(item)
            });
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(Wuaki.requestList[id].requestId), id);
            Wuaki.elements["gridMenu"].enableFocus(item)
        }
    },
    myFavouritesEpisodes: function(parent, page, perPage, item) {
        var id = "myFavouritesEpisodes" + page + parent.id + parent.name;
        var auth_token = "",
            classification_id = Wuaki.defaultClassificationId,
            id_subscription_plan = "";
        if (Wuaki.statusLogged) {
            auth_token = Wuaki.user.data.authentication_token;
            if (Wuaki.user.data.profile.classification.id) classification_id = Wuaki.user.data.profile.classification.id
        }
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "gridMenu";
            Wuaki.requestList[id].requestId = ApiWuaki.gettingFavoritesEpisodesList(perPage, page, 0, auth_token, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(requestId), id);
                Wuaki.elements["gridMenu"].enableFocus(item)
            });
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["gridMenu"].fill(ApiWuaki.getData(Wuaki.requestList[id].requestId), id);
            Wuaki.elements["gridMenu"].enableFocus(item)
        }
    },
    myLibrary: function(parent, page, perPage, item) {
        var id = "myLibrary" + page + parent.id + parent.name;
        var auth_token = "",
            classification_id = Wuaki.defaultClassificationId,
            id_subscription_plan = "",
            id_user = "";
        var type;
        switch (parent.name) {
            case Wuaki.language["Movies"]:
                type = "Movie";
                break;
            case Wuaki.language["Seasons"]:
                type = "Season";
                break;
            case Wuaki.language["Episodes"]:
                type = "Episode";
                break
        }
        if (Wuaki.statusLogged) {
            auth_token = Wuaki.user.data.authentication_token;
            id_user = Wuaki.user.data.id;
            if (Wuaki.user.data.profile.classification.id) classification_id = Wuaki.user.data.profile.classification.id
        }
        if (typeof Wuaki.requestList[id] == "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "gridMenu";
            Wuaki.requestList[id].requestId = ApiWuaki.gettingMyLibrary(id_user, type, perPage, page, 0, auth_token, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                Wuaki.elements["gridMenu"].fill(gridFillCallbacks.myLibraryProcessData(ApiWuaki.getData(requestId), type), id);
                Wuaki.elements["gridMenu"].enableFocus(item)
            });
            Wuaki.requestIdLifeTime(id)
        } else {
            Wuaki.elements["gridMenu"].fill(gridFillCallbacks.myLibraryProcessData(ApiWuaki.getData(Wuaki.requestList[id].requestId), type), id);
            Wuaki.elements["gridMenu"].enableFocus(item)
        }
    },
    myLibraryProcessData: function(data, type) {
        var processedData = new Object;
        var container = new Array;
        for (var i = 0; i < data.purchases.length; i++) {
            var tempContainer = new Object;
            tempContainer = data.purchases[i].purchaseable;
            tempContainer.purchaseStatus = data.purchases[i].status;
            container.push(tempContainer)
        }
        switch (type) {
            case "Movie":
                processedData.movies = container;
                break;
            case "Season":
                processedData.seasons = container;
                break;
            case "Episode":
                processedData.episodes = container;
                break
        }
        processedData.pagination = data.pagination;
        return processedData
    }
};

function homescreenMenu() {
    var div;
    var name;
    var menuElementCarousel, menuCarousel, parentMenu;
    var focusedOption, selectedOption;
    var menuOptions;
    var menuPagination;
    var id, page, perPage, callbackFill, parent;
    var fillRequestId;
    var status;
    var focusedOptionBeforeBanner;
    var mode;
    var _this = this;
    homescreenMenu.prototype.init = function(div, name, parentMenu, focusedOption, selectedOption) {
        this.div = div;
        this.name = name;
        this.focusedOption = focusedOption;
        this.selectedOption = selectedOption;
        this.parentMenu = parentMenu;
        this.menuOptions = new Array;
        this.bannerOptions = {};
        this.page = 0;
        this.perPage = 10;
        this.id = this.callbackFill = this.fillRequestId = null;
        this.status = new Object;
        this.status.visible = false;
        this.status.enable = false;
        this.status.ready = false;
        this.status.empty = false;
        this.status.autoEnable = false;
        this.status.boot = false;
        this.draw()
    };
    homescreenMenu.prototype.ready = function() {
        return this.status.ready
    };
    homescreenMenu.prototype.autoEnable = function() {
        this.status.autoEnable = true;
        if (this.status.ready) {
            Wuaki.enableElement(this.name)
        }
    };
    homescreenMenu.prototype.enable = function() {
        Wuaki.elements["keyboard"].hide();
        Wuaki.currentElement = this;
        this.display();
        this.focusOption(this.focusedOption);
        this.status.enable = true;
        this.status.autoEnable = false;
        this.drawFooter();
        Wuaki.hideLoading();
        TVA_GoogleAnalytics.analyticMark(TVA.device + "/navigation", "homescreen/" + this.parent.name)
    };
    homescreenMenu.prototype.disable = function() {
        this.status.enable = false;
        this.unfocusOption()
    };
    homescreenMenu.prototype.display = function() {
        if (this.status.empty == false) {
            this.status.visible = true;
            this.div.show()
        }
        Wuaki.elements["gridMenu"].hide();
        Wuaki.elements["boxFormMenu"].hide();
        try {
            if (this.data.assets.background.original && $("#wrapper").css("background-image") != "url(" + this.data.assets.background.original + ")") $("#wrapper").css("background-image", "url(" + this.data.assets.background.original + ")")
        } catch (e) {
            $("#wrapper").css("background-image", "url(resources/images/background_homescreen.png)")
        }
    };
    homescreenMenu.prototype.hide = function() {
        this.status.visible = false;
        if (this.videoActive) this.disableHomescreenVideo();
        $("#wrapper").css("background-image", "url(" + Wuaki.background + ")");
        this.div.hide()
    };
    homescreenMenu.prototype.drawFooter = function() {
        if (Wuaki.background != "resources/images/1w_pixel_bg.jpg") Wuaki.elements["footerMenu"].div.removeClass("white");
        Wuaki.elements["footerMenu"].drawLoginStatus(TVA.device == "ps4" ? false : true);
        Wuaki.elements["footerMenu"].drawReturn();
        Wuaki.elements["footerMenu"].drawSelect();
        Wuaki.elements["footerMenu"].drawNavigate();
        Wuaki.elements["footerMenu"].drawSearch();
        Wuaki.elements["footerMenu"].applyNewContent()
    };
    homescreenMenu.prototype.resetOptions = function() {
        this.menuCarousel.reset();
        this.menuOptions = new Array;
        this.bannerOptions = {}
    };
    homescreenMenu.prototype.reset = function() {
        this.id = null;
        this.focusedOption = 0;
        this.selectedOption = 0;
        this.parentMenu = null;
        this.menuOptions = new Array;
        this.bannerOptions = {};
        this.page = 0;
        this.perPage = 5;
        this.id = this.callbackFill = this.fillRequestId = null;
        this.status = new Object;
        this.status.visible = false;
        this.status.enable = false;
        this.status.ready = false;
        this.status.empty = false;
        this.status.autoEnable = false
    };
    homescreenMenu.prototype.autoSelectConfig = function(focus, select) {
        this.autofocusedOption = focus;
        this.autoselectedOption = select
    };
    homescreenMenu.prototype.enableFocus = function(option) {
        if (this.status.enable && this.status.visible) this.focusOption(option)
    };
    homescreenMenu.prototype.config = function(id, parent, parentMenu, gridMode, page, perPage, focus, callbackFill) {
        if (this.id !== id) {
            Wuaki.showLoading();
            this.parentMenu = parentMenu;
            this.status.ready = false;
            this.status.empty = false;
            if (this.status.boot) {
                this.status.boot = false;
                this.status.autoEnable = true
            } else this.status.autoEnable = false;
            this.id = id;
            this.gridMode = gridMode;
            this.banner = false;
            this.parent = parent;
            this.page = page;
            this.perPage = perPage;
            this.focusedOption = focus;
            this.callbackFill = callbackFill;
            this.callbackFill(this.parent, this.focusedOption)
        }
        this.display()
    };
    homescreenMenu.prototype.getConfig = function() {
        var config = new Object;
        config.name = this.name;
        return config
    };
    homescreenMenu.prototype.fill = function(data, fillRequestId) {
        this.data = data;
        data = data.lists[0];
        if (this.menuElementCarousel.attr("class")) this.menuElementCarousel.attr("class", this.menuElementCarousel.attr("class").replace(/rowSize[0-9]+/, "")).addClass("rowSize" + 5);
        this.fillRequestId = fillRequestId;
        var gridData = new Array;
        if (typeof data == "object" && typeof data.seasons !== "undefined") {
            gridData = gridData.concat(data.seasons);
            this.mode = "seasons"
        }
        if (typeof data == "object" && typeof data.episodes !== "undefined") {
            gridData = gridData.concat(data.episodes);
            this.mode = "episodes"
        }
        if (typeof data == "object" && typeof data.movies !== "undefined") {
            gridData = gridData.concat(data.movies);
            this.mode = "movies"
        }
        if (typeof data == "object" && typeof data.contents !== "undefined") {
            gridData = gridData.concat(data.contents);
            this.mode = "contents"
        }
        if (typeof data == "object" && typeof data.tv_shows !== "undefined") {
            gridData = gridData.concat(data.tv_shows);
            this.mode = "tvshows"
        }
        this.resetOptions();
        for (var i = 0; i < gridData.length && i < 5; i++) {
            gridData[i].homescreen = true;
            this.menuCarousel.add(i, this.itemDraw(gridData[i]));
            this.addActionTransitionToItem(gridData[i], this.mode);
            this.menuOptions.push(gridData[i])
        }
        this.fillBannersContent();
        this.headerDraw();
        this.menuCarousel.options.size = 5;
        this.menuCarousel.last = 5;
        this.addMouseEvents();
        this.status.ready = true;
        try {
            if (this.status.visible && this.data.assets.background.original && $("#wrapper").css("background-image") != "url(" + this.data.assets.background.original + ")") $("#wrapper").css("background-image", "url(" + this.data.assets.background.original + ")")
        } catch (e) {
            $("#wrapper").css("background-image", "url(resources/images/background_homescreen.png)")
        }
        Wuaki.dimissSplashLoadingScreen();
        if (this.status.autoEnable) Wuaki.enableElement(this.name);
        Wuaki.hideLoading();
        return true
    };
    homescreenMenu.prototype.fillBannersContent = function() {
        var banners = this.data.banners;
        var banner_ids = ["homescreen_banner0", "homescreen_banner1", "homescreen_banner2"];
        for (banner in banners) {
            var element = banners[banner];
            var item = this.div.find("#" + banner_ids[banner]);
            item.empty();
            if (element.status == "success") {
                try {
                    var image = $.parseJSON(element.response.display_source)
                } catch (e) {
                    image = element.response.display_source
                }
                if (typeof image == "object") {
                    if (image.mp4) element.response.mp4 = image.mp4;
                    if (image.jpg) image = image.jpg
                }
                if (TVA.device.match(/lg|samsung/i)) image = image.replace(/^https/, "http");
                item.append("<img class='homescreen_banner_image' onerror='commonTools.imgError(this);' src='" + image + "'></img>");
                this.addActionToBanner(banner_ids[banner], element.response)
            } else {
                item.text(Wuaki.language["error"])
            }
        }
    };
    homescreenMenu.prototype.headerDraw = function() {
        try {
            var header = this.div.find("#homescreen_header").empty();
            $("<div>" + this.data.lists[0].name + "</div>").appendTo(header).addClass("fontHeader homescreenHeaderTitle")
        } catch (e) {}
    };
    homescreenMenu.prototype.addMouseEvents = function() {
        $(this.div).find("li.jcarousel-item").unbind().bind("mouseenter", this, function(event) {
            var element = event.data;
            element.focusOption(Number($(this).attr("jcarouselindex")));
            if (Wuaki.currentElement.name != element.name) Wuaki.enableElementFromError(element.name)
        }).bind("mouseleave", this, function() {}).bind("click", this, function(event) {
            var element = event.data;
            element.selectCurrentOption()
        }).addClass("pointer");
        $(".homescreen_banner").unbind().bind("click", this, function(event) {
            var element = event.data;
            element.selectCurrentOption()
        }).bind("mouseenter", this, function(event) {
            var element = event.data;
            element.focusOption($(this));
            if (Wuaki.currentElement.name != element.name) Wuaki.enableElementFromError(element.name)
        }).addClass("pointer")
    };
    homescreenMenu.prototype.draw = function() {
        this.div.empty();
        this.div.append('<div id="homescreen_banner0" class="homescreen_banner"></div><div id="homescreen_banner1" class="homescreen_banner"></div><div id="homescreen_banner2" class="homescreen_banner"></div><div id="homescreen_header"></div><div id="homescreen_grid"></div>');
        this.navigation = {
            homescreen_banner0: {
                left: "mainMenu",
                right: "homescreen_banner1",
                down: 0
            },
            homescreen_banner1: {
                left: "homescreen_banner0",
                right: "mainMenu",
                down: "homescreen_banner2"
            },
            homescreen_banner2: {
                left: "homescreen_banner0",
                right: "mainMenu",
                down: 3,
                up: "homescreen_banner1"
            }
        };
        this.menuElementCarousel = $('<ul class="jcarousel-skin-grid" id="' + this.name + '"></ul>').appendTo(this.div.find("#homescreen_grid")).addClass("gridItemFont");
        $("#" + this.name).jcarousel({
            vertical: true,
            animation: Wuaki.animation,
            itemFallbackDimension: 200,
            setupCallback: function(carousel) {
                carousel.reload()
            }
        });
        this.menuCarousel = $("#" + this.name).data("jcarousel")
    };
    homescreenMenu.prototype.itemDraw = function(data) {
        var itemContent;
        var title = data.title;
        if (this.mode == "tvshows") {
            if (TVA.device == "ps3" || TVA.device == "ps4" || TVA.device == "lg") itemContent = "<div class='gridItemArtwork'><img alt='' class='gridItemArtworkImg' onerror='commonTools.imgError(this);' src='" + data.artwork.web + "'></img></div>";
            else itemContent = "<img alt='' class='gridItemArtwork' onerror='commonTools.imgError(this);' src='" + data.artwork.web + "'></img>";
            itemContent += "<div class='gridItemSeasonTitle'>" + title + "<div class='gridItemSeasonNumber'>" + data.number_of_seasons + " " + Wuaki.language["Seasons"] + "</div></div>"
        } else {
            var ratingWidth = Math.round(data.rating_average * 95 / 50) * 9.5;
            if (Wuaki.SVOD && typeof data.subscription_plans === "undefined") {
                title = Wuaki.language["notAvailable"]
            }
            if (this.mode == "seasons") title = Wuaki.language["Season"] + " " + data.number + " - " + data.display_name.split(" - ")[0];
            var boxText = typeof data.purchaseStatus != "undefined" ? data.purchaseStatus : data.lowest_price;
            if (TVA.device == "ps3" || TVA.device == "ps4" || TVA.device == "lg") itemContent = "<div class='gridItemArtwork'><img alt='' class='gridItemArtworkImg' onerror='commonTools.imgError(this);' src='" + data.artwork.h200 + "'></img></div>";
            else itemContent = "<img alt='' class='gridItemArtwork' onerror='commonTools.imgError(this);' src='" + data.artwork.h200 + "'></img>";
            itemContent += "<div class='gridItemTitle hide'>" + title + "</div>                                 <div class='gridItemRating'><div class='gridItemRatingBlackStars'/><div class='gridItemRatingWhiteStars' style='width:" + ratingWidth + "px;'/></div>"
        }
        if (commonTools.checkProviderList(data.provider_id)) {
            var itemContent = $("<div>").append(itemContent);
            itemContent.find("div").addClass("providerFilter");
            itemContent.find("img").addClass("providerFilter");
            itemContent = itemContent.html()
        }
        return itemContent
    };
    homescreenMenu.prototype.addActionToBanner = function(id, data) {
        try {
            var target = $.parseJSON(data.target)
        } catch (e) {
            target = data.target
        }
        var item = {};
        item.bannerId = id;
        item.homescreen = true;
        item.data = data;
        if (typeof target == "object") {
            switch (Object.getOwnPropertyNames(target)[0]) {
                case "movie":
                    item.id = target.movie.id;
                    this.addActionTransitionToItem(item, "movies");
                    break;
                case "season":
                    item.id = target.season.id;
                    this.addActionTransitionToItem(item, "seasons");
                    break;
                case "list":
                    item.id = target.list.id;
                    this.addActionTransitionToItem(item, "lists");
                    break;
                case "tv_show":
                    item.id = target.tv_show.id;
                    this.addActionTransitionToItem(item, "tvshows");
                    break;
                case "episode":
                    item.id = target.episode.id;
                    item.snapshots = new Array;
                    this.addActionTransitionToItem(item, "episodes");
                    break;
                case "genre":
                    item.id = target.genre.id;
                    this.addActionTransitionToItem(item, "genres");
                    break
            }
        } else {
            switch (target) {
                case "#selection":
                    var data = new Object;
                    data.subscription_plans = Wuaki.subscriptionPlans;
                    item.action = function() {
                        if (_this.videoPlayerCheck(this)) {
                            Wuaki.enableElement("mainMenu");
                            var menu = Wuaki.elements["mainMenu"];
                            menu.unfocusOption(menu.focusedOption);
                            menu.focusedOption = menu.getOptionPos(Wuaki.language["PlanPremium"]);
                            menu.focusOption(menu.focusedOption);
                            menu.unselectOption(menu.selectedOption);
                            menu.selectedOption = menu.getOptionPos(Wuaki.language["PlanPremium"]);
                            menu.selectOption(menu.selectedOption)
                        }
                    };
                    break;
                case "#selectionModal":
                    var data = new Object;
                    data.subscription_plans = Wuaki.subscriptionPlans;
                    item.action = function() {
                        if (_this.videoPlayerCheck(this)) {
                            Wuaki.enableElement("mainMenu");
                            var menu = Wuaki.elements["mainMenu"];
                            menu.unfocusOption(menu.focusedOption);
                            menu.focusedOption = menu.getOptionPos(Wuaki.language["PlanPremium"]);
                            menu.focusOption(menu.focusedOption);
                            menu.unselectOption(menu.selectedOption);
                            menu.selectedOption = menu.getOptionPos(Wuaki.language["PlanPremium"]);
                            menu.selectOption(menu.selectedOption);
                            var checkInterval = window.setInterval(function() {
                                if (Wuaki.currentElement.name !== "gridMenu") return;
                                window.clearInterval(checkInterval);
                                var data = new Object;
                                data.subscription_plans = Wuaki.subscriptionPlans;
                                Wuaki.processCaller = "gridMenu";
                                process.subscription(Wuaki.currentElement, data, function() {
                                    Wuaki.enableElement("mainMenu");
                                    Wuaki.currentElement.selectCurrentOption()
                                })
                            }, 500)
                        }
                    };
                    break;
                case "#pairing":
                    item.action = function() {
                        if (_this.videoPlayerCheck(this)) {
                            Wuaki.processCaller = "mainMenu";
                            Wuaki.elements["splashMenu"].config("splashPairingFromPurchaseOptions", "splashMenu", "homescreenMenu", "splashPairing", {}, null, null);
                            Wuaki.elements["splashMenu"].autoEnable()
                        }
                    };
                    break;
                default:
                    break
            }
        }
        this.bannerOptions[id] = item
    };
    homescreenMenu.prototype.addActionTransitionToItem = function(item, mode) {
        if (Wuaki.SVOD && typeof item.subscription_plans === "undefined") {
            item.action = function() {};
            item.transition = function() {};
            return
        }
        var _this = this;
        switch (mode) {
            case "genres":
                item.action = function() {
                    if (_this.videoPlayerCheck(this)) ApiWuaki.gettingGenreInfo(this.id, function(requestId) {
                        if (ApiWuaki.getResult(requestId) == "success") {
                            var data = ApiWuaki.getData(requestId);
                            Wuaki.elements["gridMenu"].config("##homescreen##Movies_moviesByGenre" + data.id, data, "mainMenu", "normal", 1, 10, 0, gridFillCallbacks.moviesByGenre);
                            Wuaki.elements["gridMenu"].autoEnable()
                        }
                    })
                };
                item.transition = function() {
                    Wuaki.elements["gridMenu"].autoEnable()
                };
                break;
            case "lists":
                item.action = function() {
                    if (_this.videoPlayerCheck(this)) ApiWuaki.gettingListInfo(this.id, function(requestId) {
                        if (ApiWuaki.getResult(requestId) == "success") {
                            var data = ApiWuaki.getData(requestId);
                            Wuaki.elements["gridMenu"].config("##homescreen##Movies_gettingListFromEditorial" + data.id, data, "mainMenu", "normal", 1, 10, 0, gridFillCallbacks.gettingListFromEditorial);
                            Wuaki.elements["gridMenu"].autoEnable()
                        }
                    })
                };
                item.transition = function() {
                    Wuaki.elements["gridMenu"].autoEnable()
                };
                break;
            case "movies":
                item.action = function() {
                    if (_this.videoPlayerCheck(this)) {
                        Wuaki.elements["detailsMenu"].config("detailsMovies" + this.id, this, "homescreenMenu", mode, detailsFillCallbacks.movie);
                        Wuaki.elements["detailsMenu"].autoEnable()
                    }
                };
                item.transition = function() {
                    Wuaki.elements["detailsMenu"].autoEnable()
                };
                break;
            case "seasons":
                item.action = function() {
                    if (_this.videoPlayerCheck(this)) {
                        Wuaki.elements["detailsMenu"].config("detailsSeasons" + this.id, this, "homescreenMenu", mode, detailsFillCallbacks.season);
                        Wuaki.elements["detailsMenu"].autoEnable()
                    }
                };
                item.transition = function() {
                    Wuaki.elements["detailsMenu"].autoEnable()
                };
                break;
            case "episodes":
                item.action = function() {
                    if (_this.videoPlayerCheck(this)) {
                        Wuaki.elements["detailsMenu"].config("detailsEpisodes" + this.id, this, "homescreenMenu", mode, detailsFillCallbacks.episode);
                        Wuaki.elements["detailsMenu"].autoEnable()
                    }
                };
                item.transition = function() {
                    Wuaki.elements["detailsMenu"].autoEnable()
                };
                break;
            case "contents":
                item.action = function() {
                    if (_this.videoPlayerCheck(this)) {
                        var callback = detailsFillCallbacks.episode;
                        if (item.content_type == "Season") callback = detailsFillCallbacks.season;
                        else if (item.content_type == "Movie") callback = detailsFillCallbacks.movie;
                        Wuaki.elements["detailsMenu"].config("detailsContents" + this.id, this, "homescreenMenu", mode, callback);
                        Wuaki.elements["detailsMenu"].autoEnable()
                    }
                };
                item.transition = function() {
                    Wuaki.elements["detailsMenu"].autoEnable()
                };
                break;
            case "tvshows":
                item.action = function() {
                    if (_this.videoPlayerCheck(this)) {
                        var auth_token = "";
                        if (Wuaki.statusLogged) {
                            auth_token = Wuaki.user.data.authentication_token
                        }
                        ApiWuaki.gettingTVShowsDetail(this.id, auth_token, function(requestId) {
                            if ("success" == ApiWuaki.getResult(requestId)) {
                                mode = "seasons";
                                var data = ApiWuaki.getData(requestId).seasons[0];
                                data.homescreen = true;
                                Wuaki.elements["detailsMenu"].config("detailsSeasons" + data.id, data, "homescreenMenu", mode, detailsFillCallbacks.season);
                                Wuaki.elements["detailsMenu"].autoEnable()
                            }
                        })
                    }
                };
                item.transition = function() {
                    Wuaki.elements["detailsMenu"].autoEnable()
                };
                break
        }
    };
    homescreenMenu.prototype.videoPlayerCheck = function() {
        if (this.videoActive && isNaN(this.selectedOption) && this.videoActive != this.selectedOption.attr("id")) this.disableHomescreenVideo();
        if (!isNaN(this.selectedOption) || !this.bannerOptions[this.selectedOption.attr("id")].data.mp4) return true;
        else {
            if (!this.videoActive) {
                this.activeHomescreenVideo();
                return false
            } else {
                this.disableHomescreenVideo();
                return true
            }
        }
    };
    homescreenMenu.prototype.activeHomescreenVideo = function() {
        this.videoActive = this.selectedOption.attr("id");
        this.playHeadChangedBackup = playHeadChanged;
        playHeadChanged = function() {};
        this.playStateChangedBackup = playStateChanged;
        playStateChanged = function(newState) {
            switch (newState) {
                case TVA_Player.state.finished:
                    Wuaki.elements["homescreenMenu"].videoPlayerCheck();
                    break
            }
        };
        this.playErrorBackup = playError;
        playError = function() {};
        var banner = $("#" + this.videoActive);
        banner.find(".homescreen_banner_image").hide();
        TVA_Player.setHeight(banner.height());
        TVA_Player.setWidth(banner.width());
        TVA_Player.setXY(banner.offset().left + 6, banner.offset().top + 6);
        TVA_Player.MIMEType = "video/mp4";
        TVA_Player.setURL(this.bannerOptions[this.videoActive].data.mp4);
        TVA_Player.readyVideo();
        $(TVA_Player.player).css("background-color", "black");
        TVA_Player.show();
        TVA_Player.play({})
    };
    homescreenMenu.prototype.disableHomescreenVideo = function() {
        $("#" + this.videoActive + " .homescreen_banner_image").show();
        TVA_Player.stop();
        TVA_Player.hide();
        $(TVA_Player.player).css("background-color", "");
        TVA_Player.setHeight(720);
        TVA_Player.setWidth(1280);
        TVA_Player.setXY(0, 0);
        window.setTimeout(function() {
            playHeadChanged = Wuaki.elements["homescreenMenu"].playHeadChangedBackup;
            playStateChanged = Wuaki.elements["homescreenMenu"].playStateChangedBackup;
            playError = Wuaki.elements["homescreenMenu"].playErrorBackup
        }, 500);
        this.videoActive = false
    };
    homescreenMenu.prototype.nav = function(keycode) {
        switch (keycode) {
            case VK_UP:
                this.prevRow();
                break;
            case VK_DOWN:
                this.nextRow();
                break;
            case VK_LEFT:
                this.prevOption();
                break;
            case VK_RIGHT:
                this.nextOption();
                break;
            case VK_BDR_ENTER:
            case VK_CROSS:
                this.selectCurrentOption();
                break;
            case VK_BDR_GREEN:
            case VK_TRIANGLE:
            case Wuaki.FOOTER_SEARCH:
                Wuaki.elements["detailsMenu"].hide();
                Wuaki.enableElement("mainMenu");
                Wuaki.elements["mainMenu"].unselectOption(Wuaki.elements["mainMenu"].selectedOption);
                Wuaki.elements["mainMenu"].unfocusOption(Wuaki.elements["mainMenu"].focusedOption);
                Wuaki.elements["mainMenu"].focusedOption = 0;
                Wuaki.elements["mainMenu"].selectOption(Wuaki.elements["mainMenu"].focusedOption);
                break;
            case VK_BDR_YELLOW:
            case Wuaki.customPairKey:
            case Wuaki.FOOTER_PAIR:
                if (!Wuaki.statusLogged) {
                    Wuaki.fromPurchase = false;
                    Wuaki.processCaller = this.name;
                    Wuaki.proccessCallerKey = keycode;
                    Wuaki.elements["splashMenu"].config("splashPairingFromPurchaseOptions", "splashMenu", this.name, "splashPairing", {}, null, null);
                    Wuaki.elements["splashMenu"].autoEnable()
                }
                break;
            case VK_BDR_RETURN:
            case VK_CIRCLE:
            case Wuaki.FOOTER_BACK:
                this.unfocusOption();
                Wuaki.enableElement(this.parentMenu);
                break;
            default:
                break
        }
    };
    homescreenMenu.prototype.nextRow = function(comesFromNextOption) {
        if (isNaN(this.focusedOption)) {
            var nextId = this.navigation[this.focusedOption.attr("id")].down;
            if (typeof nextId == "undefined") return;
            if (isNaN(nextId)) {
                this.navigation[nextId].up = this.focusedOption.attr("id");
                this.focusOption($("#" + nextId))
            } else this.focusOption(nextId)
        }
    };
    homescreenMenu.prototype.prevRow = function() {
        if (isNaN(this.focusedOption)) {
            var prevId = this.navigation[this.focusedOption.attr("id")].up;
            if (typeof prevId == "undefined") return;
            if (isNaN(prevId)) {
                this.navigation[prevId].down = this.focusedOption.attr("id");
                this.focusOption($("#" + prevId))
            } else this.focusOption(prevId)
        } else {
            if (this.focusedOption >= 3) {
                this.navigation["homescreen_banner2"].down = this.focusedOption;
                this.focusOption($("#homescreen_banner2"))
            } else {
                this.navigation["homescreen_banner0"].down = this.focusedOption;
                this.focusOption($("#homescreen_banner0"))
            }
        }
    };
    homescreenMenu.prototype.focusOption = function(option) {
        var first = this.menuCarousel.first;
        var last = this.menuCarousel.last;
        this.unfocusOption();
        if (isNaN(option) && option.hasClass("homescreen_banner")) {
            option.addClass("focus")
        } else {
            if (option >= this.menuCarousel.options.size) option = this.menuCarousel.options.size - 1;
            li_active = $("#" + this.name + " .jcarousel-item-" + option);
            this.itemFocus(li_active)
        }
        this.focusedOption = option
    };
    homescreenMenu.prototype.unfocusOption = function() {
        var first = this.menuCarousel.first;
        var last = this.menuCarousel.last;
        if (isNaN(this.focusedOption) && this.focusedOption.hasClass("homescreen_banner")) {
            this.focusedOption.removeClass("focus");
            return
        } else {
            var li_active = $("#" + this.name + " li.lihover");
            this.itemUnfocus(li_active)
        }
    };
    homescreenMenu.prototype.selectCurrentOption = function() {
        this.selectedOption = this.focusedOption;
        if (isNaN(this.focusedOption)) {
            if (this.bannerOptions[this.focusedOption.attr("id")] && typeof this.bannerOptions[this.focusedOption.attr("id")].action == "function") this.bannerOptions[this.focusedOption.attr("id")].action()
        } else {
            $("#" + this.name + " li.active").removeClass("active");
            $("#" + this.name + " li.lihover").addClass("active");
            this.menuOptions[this.selectedOption].action()
        }
    };
    homescreenMenu.prototype.nextOption = function() {
        if (isNaN(this.focusedOption)) {
            var nextId = this.navigation[this.focusedOption.attr("id")].right;
            if (typeof nextId == "undefined") return;
            if (isNaN(nextId)) {
                if (nextId == "mainMenu") {
                    this.unfocusOption();
                    this.focusedOption = $("#homescreen_banner0");
                    Wuaki.enableElement(this.parentMenu);
                    return
                }
                this.navigation[nextId].left = this.focusedOption.attr("id");
                this.focusOption($("#" + nextId))
            } else this.focusOption(nextId)
        } else {
            if (this.focusedOption >= 4) {
                this.unfocusOption();
                this.focusedOption = 0;
                Wuaki.enableElement(this.parentMenu)
            } else {
                var nextElement = $("#" + this.name + " li.lihover").next();
                if (nextElement.length) {
                    this.unfocusOption();
                    this.itemFocus(nextElement);
                    this.focusedOption = Number(nextElement.attr("jcarouselindex"))
                }
            }
        }
    };
    homescreenMenu.prototype.prevOption = function() {
        if (isNaN(this.focusedOption)) {
            var prevId = this.navigation[this.focusedOption.attr("id")].left;
            if (typeof prevId == "undefined") return;
            if (isNaN(prevId)) {
                if (prevId == "mainMenu") {
                    this.unfocusOption();
                    this.focusedOption = $("#homescreen_banner0");
                    Wuaki.enableElement(this.parentMenu);
                    return
                }
                this.navigation[prevId].right = this.focusedOption.attr("id");
                this.focusOption($("#" + prevId))
            } else this.focusOption(prevId)
        } else {
            if (this.focusedOption == 0) {
                this.unfocusOption();
                Wuaki.enableElement(this.parentMenu)
            } else {
                var prevElement = $("#" + this.name + " li.lihover").prev();
                if (prevElement.length) {
                    this.unfocusOption();
                    this.itemFocus(prevElement);
                    this.focusedOption = Number(prevElement.attr("jcarouselindex"));
                    var first = this.menuCarousel.first
                }
            }
        }
    };
    homescreenMenu.prototype.itemFocus = function(item) {
        item.addClass("lihover");
        item.find(".gridItemArtwork").addClass("ItemArtworkfocus");
        if (!Wuaki.SVOD) {
            item.find(".gridItemPriceContainer").hide();
            item.find(".gridItemTitle").show()
        }
        item.find(".gridItemRating").hide()
    };
    homescreenMenu.prototype.itemUnfocus = function(item) {
        item.removeClass("lihover");
        item.find(".gridItemArtwork").removeClass("ItemArtworkfocus");
        if (!Wuaki.SVOD) {
            item.find(".gridItemPriceContainer").show();
            item.find(".gridItemTitle").hide()
        }
        item.find(".gridItemRating").show()
    }
}
var homescreenFillCallbacks = {
    homescreen: function(parent, item, byApplicationName, callback) {
        var id = "homescreen";
        var auth_token = "";
        if (Wuaki.statusLogged) auth_token = Wuaki.user.data.authentication_token;
        var apicalls = new Array;
        var call = new Object;
        call.funcName = "ApiWuaki.getHomescreenID";
        call.arguments = new Array;
        call.arguments.push('"' + auth_token + '"');
        apicalls.push(call);
        var call = new Object;
        call.funcName = "ApiWuaki.getHomescreenGarden";
        call.arguments = new Array;
        call.arguments.push("ApiWuaki.queueList[id].result[0].data.menus[0].choices[0].choiceable_id");
        call.arguments.push('"' + auth_token + '"');
        apicalls.push(call);
        var country = Wuaki.country === "GB" ? "uk" : Wuaki.country.toLowerCase();
        var request1 = '"' + country + "_" + Wuaki.APIDevice.toLowerCase() + "_homescreen_zone1" + '"';
        var request2 = '"' + country + "_" + Wuaki.APIDevice.toLowerCase() + "_homescreen_zone2" + '"';
        var request3 = '"' + country + "_" + Wuaki.APIDevice.toLowerCase() + "_homescreen_zone3" + '"';
        if (byApplicationName) {
            request1 = '"' + country + "_mayfly_homescreen_zone1" + '"';
            request2 = '"' + country + "_mayfly_homescreen_zone2" + '"';
            request3 = '"' + country + "_mayfly_homescreen_zone3" + '"'
        }
        var call = new Object;
        call.funcName = "ApiWuaki.getHomescreenBanners";
        call.arguments = new Array;
        call.arguments.push(request1);
        call.arguments.push('"' + (Wuaki.statusLogged ? 1 : 0) + '"');
        call.arguments.push('"' + (Wuaki.statusLogged && Wuaki.user.subscriptionPlan.subscriptions.length != 0 ? 1 : 0) + '"');
        call.arguments.push('"' + auth_token + '"');
        apicalls.push(call);
        var call = new Object;
        call.funcName = "ApiWuaki.getHomescreenBanners";
        call.arguments = new Array;
        call.arguments.push(request2);
        call.arguments.push('"' + (Wuaki.statusLogged ? 1 : 0) + '"');
        call.arguments.push('"' + (Wuaki.statusLogged && Wuaki.user.subscriptionPlan.subscriptions.length != 0 ? 1 : 0) + '"');
        call.arguments.push('"' + auth_token + '"');
        apicalls.push(call);
        var call = new Object;
        call.funcName = "ApiWuaki.getHomescreenBanners";
        call.arguments = new Array;
        call.arguments.push(request3);
        call.arguments.push('"' + (Wuaki.statusLogged ? 1 : 0) + '"');
        call.arguments.push('"' + (Wuaki.statusLogged && Wuaki.user.subscriptionPlan.subscriptions.length != 0 ? 1 : 0) + '"');
        call.arguments.push('"' + auth_token + '"');
        apicalls.push(call);
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "single";
            Wuaki.requestList[id].element = "homescreenMenu";
            ApiWuaki.queue(id, apicalls, function(id) {
                if (Wuaki.checkAPIError(id, true)) return;
                var data = ApiWuaki.queueGetData(id, 1);
                data.banners = new Array;
                if (ApiWuaki.queueGetData(id, 2).status === "failed" && !byApplicationName) {
                    Wuaki.requestList[id] = undefined;
                    homescreenFillCallbacks.homescreen(Wuaki.elements.mainMenu.menuOptions[Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["Homescreen"])], $("#homescreen_banner0"), true, callback);
                    return
                }
                data.banners.push(ApiWuaki.queueGetData(id, 2));
                data.banners.push(ApiWuaki.queueGetData(id, 3));
                data.banners.push(ApiWuaki.queueGetData(id, 4));
                Wuaki.elements["homescreenMenu"].fill(data, id);
                Wuaki.elements["homescreenMenu"].enableFocus(item);
                if (typeof callback == "function") callback()
            });
            Wuaki.queueIdLifeTime(id)
        } else {
            var data = ApiWuaki.queueGetData(id, 1);
            Wuaki.elements["homescreenMenu"].fill(data, id);
            Wuaki.elements["homescreenMenu"].enableFocus(item);
            if (typeof callback == "function") callback()
        }
    }
};
var JSON;
if (!JSON) {
    JSON = {}
}(function() {
    "use strict";

    function f(n) {
        return n < 10 ? "0" + n : n
    }
    if (typeof Date.prototype.toJSON !== "function") {
        Date.prototype.toJSON = function(key) {
            return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null
        };
        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(key) {
            return this.valueOf()
        }
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap, indent, meta = {
            "\b": "\\b",
            "	": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            '"': '\\"',
            "\\": "\\\\"
        },
        rep;

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
            var c = meta[a];
            return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
        }) + '"' : '"' + string + '"'
    }

    function str(key, holder) {
        var i, k, v, length, mind = gap,
            partial, value = holder[key];
        if (value && typeof value === "object" && typeof value.toJSON === "function") {
            value = value.toJSON(key)
        }
        if (typeof rep === "function") {
            value = rep.call(holder, key, value)
        }
        switch (typeof value) {
            case "string":
                return quote(value);
            case "number":
                return isFinite(value) ? String(value) : "null";
            case "boolean":
            case "null":
                return String(value);
            case "object":
                if (!value) {
                    return "null"
                }
                gap += indent;
                partial = [];
                if (Object.prototype.toString.apply(value) === "[object Array]") {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || "null"
                    }
                    v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]";
                    gap = mind;
                    return v
                }
                if (rep && typeof rep === "object") {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === "string") {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ": " : ":") + v)
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ": " : ":") + v)
                            }
                        }
                    }
                }
                v = partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}";
                gap = mind;
                return v
        }
    }
    if (typeof JSON.stringify !== "function") {
        JSON.stringify = function(value, replacer, space) {
            var i;
            gap = "";
            indent = "";
            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " "
                }
            } else if (typeof space === "string") {
                indent = space
            }
            rep = replacer;
            if (replacer && typeof replacer !== "function" && (typeof replacer !== "object" || typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify")
            }
            return str("", {
                "": value
            })
        }
    }
    if (typeof JSON.parse !== "function") {
        JSON.parse = function(text, reviver) {
            var j;

            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v
                            } else {
                                delete value[k]
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value)
            }
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function(a) {
                    return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                })
            }
            if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
                j = eval("(" + text + ")");
                return typeof reviver === "function" ? walk({
                    "": j
                }, "") : j
            }
            throw new SyntaxError("JSON.parse")
        }
    }
})();

function keyboard() {
    var div;
    var name;
    var menuElement, menuCarousel, parentMenu;
    var focusedOption, selectedOption;
    var menuOptions;
    var autoSelectTimeOut;
    var status, visible;
    var fillRequestId;
    var autoSelectTime;
    var keyboardLayout, options;
    var input;
    var maxStringLength;
    var title, subtitle;
    var _this = this;
    keyboard.prototype.init = function(div, name) {
        this.div = div;
        this.name = name;
        this.focusedOption = focusedOption;
        this.selectedOption = selectedOption;
        this.menuOptions = new Array;
        this.status = new Object;
        this.status.visible = false;
        this.status.ready = false;
        this.status.enable = false;
        this.status.autoEnable = false;
        this.mode = null;
        this.maxStringLength = 16;
        this.searchTimeout = null;
        Wuaki.storedConfigs[this.name] = new Array;
        Wuaki.storedKeyboard = 0
    };
    keyboard.prototype.ready = function() {
        return this.status.ready
    };
    keyboard.prototype.autoEnable = function() {
        this.status.autoEnable = true;
        if (this.status.ready) Wuaki.enableElement(this.name)
    };
    keyboard.prototype.enable = function() {
        Wuaki.currentElement = this;
        this.display();
        this.focusOption(this.focusedOption);
        this.status.enable = true;
        this.status.autoEnable = false;
        this.drawFooter();
        this.checkEmptyInput();
        Wuaki.hideLoading()
    };
    keyboard.prototype.drawFooter = function() {
        if (Wuaki.background != "resources/images/1w_pixel_bg.jpg") Wuaki.elements["footerMenu"].div.removeClass("white");
        Wuaki.elements["footerMenu"].drawLoginStatus(false);
        Wuaki.elements["footerMenu"].drawReturn();
        Wuaki.elements["footerMenu"].drawSelect();
        Wuaki.elements["footerMenu"].drawDelete();
        if (TVA.device != "ps4") Wuaki.elements["footerMenu"].drawContinue();
        Wuaki.elements["footerMenu"].drawNavigate();
        if (this.mode == "passwordUnpair") Wuaki.elements["footerMenu"].drawUnpair();
        Wuaki.elements["footerMenu"].applyNewContent()
    };
    keyboard.prototype.disable = function() {
        this.unfocusOption();
        this.hide();
        this.status.enable = false;
        clearTimeout(this.searchTimeout)
    };
    keyboard.prototype.display = function() {
        this.status.visible = true;
        if (TVA.device == "lg") commonTools.LGOverlappingIssue(true);
        this.div.show()
    };
    keyboard.prototype.hide = function() {
        this.status.visible = false;
        if (TVA.device == "lg") commonTools.LGOverlappingIssue(false);
        this.div.hide()
    };
    keyboard.prototype.resetOptions = function() {
        this.menuOptions = new Array;
        this.focusedOption = 0;
        this.selectedOption = 0
    };
    keyboard.prototype.reset = function() {
        this.menuOptions = new Array;
        this.focusedOption = 0;
        this.selectedOption = 0;
        this.parentMenu = null;
        this.menuOptions = new Array;
        this.status = new Object;
        this.status.visible = false;
        this.status.ready = false;
        this.status.enable = false;
        this.status.autoEnable = false;
        clearTimeout(this.searchTimeout);
        Wuaki.storedConfigs[this.name] = new Array;
        Wuaki.storedKeyboard = 0;
        this.id = null
    };
    keyboard.prototype.draw = function() {
        this.div.addClass("fontKeyboard");
        this.div.find("#keyboard_full_layout").html(this.options + this.keyboardLayout);
        this.configKeyboard();
        this.drawHeader();
        this.addMouseEvents();
        this.status.ready = true;
        if (this.status.autoEnable) Wuaki.enableElement(this.name)
    };
    keyboard.prototype.addMouseEvents = function() {
        this.div.find('li[class^="item-"]').unbind().bind("mouseenter", this, function(event) {
            var element = event.data;
            element.focusOption(Number($(this).attr("class").match(/item-([0-9]+)/)[1]));
            if (Wuaki.currentElement.name != element.name) Wuaki.enableElementFromError(element.name)
        }).bind("mouseleave", this, function() {}).bind("click", this, function(event) {
            var element = event.data;
            element.selectCurrentOption()
        }).addClass("pointer")
    };
    keyboard.prototype.drawHeader = function() {
        var titleElement = $("<div><span>" + this.title + "</span></div>").addClass("fontDetailsHeaderTitle headerTitle");
        var subtitleElement = $("<div><span>" + this.subtitle + "</span></div>").addClass("fontHeader headerSubtitle");
        this.div.find("#keyboard_header").empty().append(titleElement).append(subtitleElement)
    };
    keyboard.prototype.configKeyboard = function() {
        switch (this.mode) {
            case "search":
                break;
            case "numeric":
                break;
            case "email":
                $("#" + this.layout + " .email").removeClass("disable");
            case "password":
            case "passwordUnpair":
                $("#" + this.layout + " .space").addClass("disable");
                break;
            case "normal":
            default:
                break
        }
    };
    keyboard.prototype.config = function(id, parent, parentMenu, focus, mode, options, keyboardLayout, title, subtitle, callbackDone, inputValue) {
        if (this.id !== id) {
            Wuaki.showLoading();
            this.status.ready = false;
            this.status.autoEnable = false;
            this.status.caps = false;
            this.layout = "keyboard_full_layout";
            this.parentMenu = parentMenu;
            this.id = id;
            this.parent = parent;
            this.mode = mode;
            this.options = options;
            this.keyboardLayout = keyboardLayout;
            this.title = title;
            this.subtitle = subtitle;
            this.callbackDone = callbackDone;
            this.draw()
        } else {
            this.drawHeader()
        }
        this.focusedOption = focus;
        this.input = new Object;
        this.input.value = "";
        if (typeof inputValue != "undefined") this.input.value = inputValue;
        this.initInput()
    };
    keyboard.prototype.storeConfig = function() {
        this.cloneDiv = this.div.html();
        this.parent = null;
        Wuaki.storedConfigs[this.name][Wuaki.storedKeyboard] = jQuery.extend(true, {}, this)
    };
    keyboard.prototype.cleanInputs = function() {
        this.input.currentInput = 1;
        this.getCurrentElement();
        var pos = 0,
            input = 1;
        if (this.input.value == null) this.input.value = "";
        while (this.input.currentElement.length != 0) {
            this.input.currentElement.text(this.input.value.substr(pos, this.getInputSize()));
            if (this.input.currentElement.text().length > 0) input = this.input.currentInput;
            this.input.currentInput++;
            pos += this.getInputSize();
            this.getCurrentElement()
        }
        if (pos == this.input.value.length) {
            this.disableButtons("number");
            this.selectNextStep()
        } else {
            this.input.currentInput = input;
            this.getCurrentElement();
            this.input.currentSize = this.getInputSize()
        }
        if (this.mode == "search") {
            this.div.find("#keyboard_header .headerSubtitle").text(this.subtitle)
        }
    };
    keyboard.prototype.initInput = function() {
        this.input.currentInput = 1;
        this.cleanInputs();
        this.filters = new Array;
        this.filters[0] = {
            id: -1,
            name: Wuaki.language["Movies"],
            abbr: Wuaki.language["Movies"]
        };
        this.filters[1] = {
            id: -1,
            name: Wuaki.language["allQualities"],
            abbr: Wuaki.language["allQualities"]
        };
        this.filters[2] = {
            id: -1,
            name: Wuaki.language["allLanguages"],
            abbr: Wuaki.language["allLanguages"]
        }
    };
    keyboard.prototype.getCurrentElement = function() {
        this.input.currentElement = this.div.find("#" + this.layout + " .input-" + this.input.currentInput + " span");
        this.input.currentElementDiv = this.div.find("#" + this.layout + " .input-" + this.input.currentInput)
    };
    keyboard.prototype.getInputSize = function() {
        return this.getItemNumber(this.input.currentElementDiv, "size")
    };
    keyboard.prototype.addInputValue = function(value) {
        if (this.input.currentElement.length == 0) return;
        this.input.value += value;
        if (this.mode == "password" || this.mode == "passwordUnpair") this.input.currentElement.text(this.input.currentElement.text() + "*");
        else this.input.currentElement.text(this.input.currentElement.text() + value);
        if (this.input.currentElement.text().length >= this.input.currentSize) this.nextInput();
        if (this.input.currentSize > this.maxStringLength) this.checkOverflow();
        if (this.mode == "search") {
            if (this.input.value.length >= 3) {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(Wuaki.elements["keyboard"].search, 2e3)
            }
        }
    };
    keyboard.prototype.removeInputValue = function(value) {
        if (this.input.currentElement.text().length <= 0) this.prevInput();
        this.input.value = this.input.value.substr(0, this.input.value.length - 1);
        this.input.currentElement.text(this.input.currentElement.text().substr(0, this.input.currentElement.text().length - 1));
        if (this.input.currentSize > this.maxStringLength) this.checkOverflow();
        if (this.mode == "search") {
            if (this.input.value.length >= 3) {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(Wuaki.elements["keyboard"].search, 2e3)
            } else if (this.input.value.length == 2) this.div.find("#keyboard_header .headerSubtitle").text(this.subtitle)
        }
    };
    keyboard.prototype.nextInput = function() {
        this.input.currentInput++;
        this.getCurrentElement();
        if (this.input.currentElement.length == 0) {
            this.disableButtons("number");
            this.selectNextStep()
        } else this.input.currentSize = this.getInputSize()
    };
    keyboard.prototype.prevInput = function() {
        if (this.input.currentInput > 1) this.input.currentInput--;
        this.getCurrentElement();
        if (this.input.currentElement.length != 0) {
            this.enableButtons("number")
        }
        this.input.currentSize = this.getInputSize()
    };
    keyboard.prototype.checkOverflow = function() {
        var currentLength = this.input.currentElement.text().length;
        if (currentLength > this.maxStringLength) {
            this.input.currentElement.text(this.input.currentElement.text().substr(currentLength - this.maxStringLength, currentLength))
        } else if (currentLength < this.input.value.length) {
            if (this.mode != "password" && this.mode != "passwordUnpair") this.input.currentElement.text(this.input.value.substr(this.input.value.length - this.maxStringLength, this.input.value.length));
            else {
                this.input.currentElement.text(Array(this.maxStringLength).join("*"))
            }
        }
    };
    keyboard.prototype.disableButtons = function(type) {
        this.div.find("#" + this.layout + " ." + type).addClass("disable")
    };
    keyboard.prototype.enableButtons = function(type) {
        this.div.find("#" + this.layout + " ." + type).removeClass("disable")
    };
    keyboard.prototype.selectNextStep = function() {
        this.focusOption(this.getItemNumber(this.div.find("#" + this.layout + " .finish, #" + this.layout + " .nextstep"), "item"))
    };
    keyboard.prototype.checkEmptyInput = function() {
        if (this.mode != "search" && this.input.value.length == 0 || this.mode == "search" && this.input.value.length < 3) this.div.find("li.item-1.option").addClass("disable");
        else this.div.find("li.item-1.option").removeClass("disable")
    };
    keyboard.prototype.nav = function(keycode) {
        if (this.searchTimeout != null && this.mode == "search") {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(Wuaki.elements["keyboard"].search, 2e3)
        }
        var number = 0;
        switch (keycode) {
            case VK_UP:
                this.prevRow();
                break;
            case VK_DOWN:
                this.nextRow();
                break;
            case VK_LEFT:
                this.prevOption();
                break;
            case VK_RIGHT:
                this.nextOption();
                break;
            case VK_BDR_ENTER:
            case VK_CROSS:
                this.selectCurrentOption();
                break;
            case VK_BDR_RETURN:
            case VK_CIRCLE:
            case Wuaki.FOOTER_BACK:
                if (this.input.currentInput == 1 && this.input.currentElement.text().length == 0) Wuaki.enableElement(this.parentMenu);
                else {
                    this.removeInputValue();
                    this.checkEmptyInput()
                }
                break;
            case Wuaki.customUnpairKey:
            case VK_BDR_RED:
            case Wuaki.FOOTER_UNPAIR:
                if (this.mode == "passwordUnpair") process.unpair();
                break;
            case VK_BDR_YELLOW:
            case VK_SQUARE:
            case Wuaki.FOOTER_DELETE:
                this.buttonAction(this.div.find(".delete:not(.disable)"));
                break;
            case VK_BDR_BLUE:
            case VK_START:
            case Wuaki.FOOTER_CONTINUE:
                this.buttonAction(this.div.find(".item-1.option:not(.disable)"));
                break;
            case VK_BDR_9:
                number++;
            case VK_BDR_8:
                number++;
            case VK_BDR_7:
                number++;
            case VK_BDR_6:
                number++;
            case VK_BDR_5:
                number++;
            case VK_BDR_4:
                number++;
            case VK_BDR_3:
                number++;
            case VK_BDR_2:
                number++;
            case VK_BDR_1:
                number++;
            case VK_BDR_0:
                this.addInputValue(number.toString());
                this.checkEmptyInput();
                break;
            default:
                this.keyboardInputCheck(keycode);
                break
        }
    };
    keyboard.prototype.keyboardInputCheck = function(keycode) {
        var i = 0,
            keycodeSymbol = String.fromCharCode(keycode);
        var isAvailable = false,
            keyboardElements = this.div.find("li:not(.disable)");
        if (keycode == 32) {
            isAvailable = true;
            keycodeSymbol = " "
        }
        if (!isAvailable)
            for (i = 0; i < keyboardElements.length; i++) {
                if ($(keyboardElements[i]).text() == keycodeSymbol || $(keyboardElements[i]).text().toUpperCase() == keycodeSymbol) {
                    isAvailable = true;
                    break
                }
            }
        if (!isAvailable) {
            keyboardElements = this.div.find("span");
            for (i = 0; i < keyboardElements.length; i++) {
                if ($(keyboardElements[i]).text() == keycodeSymbol || $(keyboardElements[i]).text().toUpperCase() == keycodeSymbol) {
                    isAvailable = true;
                    break
                }
            }
        }
        if (isAvailable) {
            this.addInputValue(keycodeSymbol);
            this.checkEmptyInput()
        }
    };
    keyboard.prototype.focusOption = function(option) {
        this.unfocusOption();
        this.focusedOption = option;
        this.div.find("#" + this.layout + " .item-" + option + ":visible").addClass("hover")
    };
    keyboard.prototype.unfocusOption = function() {
        this.div.find("#" + this.layout + " li.hover").removeClass("hover")
    };
    keyboard.prototype.selectCurrentOption = function() {
        this.buttonAction(this.div.find("#" + this.layout + " li.hover:not(.disable)"))
    };
    keyboard.prototype.buttonAction = function(item) {
        if (item.hasClass("capslock")) {
            this.actionCAPS(item)
        }
        if (item.hasClass("lowercase")) {
            this.actionLowercase(item)
        }
        if (item.hasClass("symbols")) {
            this.actionSymbols(item)
        }
        if (item.hasClass("number") || item.hasClass("symbol") || item.hasClass("email")) {
            if (item.find("span").length) this.addInputValue(item.find("span:visible").text());
            else this.addInputValue(item.text())
        }
        if (item.hasClass("letter")) {
            var value;
            if (item.find("span").length) value = item.find("span:visible").text();
            else value = item.text();
            if (this.status.caps) value = value.toUpperCase();
            this.addInputValue(value)
        }
        if (item.hasClass("delete")) {
            this.removeInputValue()
        }
        if (item.hasClass("space")) {
            this.addInputValue(" ")
        }
        if (item.hasClass("results")) {
            if (this.input.value.length >= 3) this.callbackDone();
            else Wuaki.enableElement(this.parentMenu)
        }
        if (item.hasClass("nextstep")) {
            this.storeConfig();
            Wuaki.storedKeyboard++;
            if (typeof Wuaki.storedConfigs[this.name][Wuaki.storedKeyboard] == "undefined") {
                this.callbackDone(false)
            } else {
                this.callbackDone(true);
                Wuaki.keyboardRestoreConfig()
            }
            return
        }
        if (item.hasClass("back")) {
            this.storeConfig();
            Wuaki.storedKeyboard--;
            Wuaki.keyboardRestoreConfig();
            return
        }
        if (item.hasClass("finish")) {
            this.storeConfig();
            this.callbackDone();
            return
        }
        if (item.hasClass("cancel")) {
            Wuaki.enableElement(this.parentMenu)
        }
        if (item.hasClass("filters")) {
            Wuaki.elements["modalMenu"].config("searchFilters", "modalMenu", this.name, "searchFilters", null, modalFillCallbacks.filters, function(output) {
                Wuaki.elements["keyboard"].filters = jQuery.extend({}, output);
                if (Wuaki.elements["keyboard"].filters[0].name == Wuaki.language["Movies"]) Wuaki.elements["keyboard"].div.find(".headerTitle").text(Wuaki.language["searchForMovieTitles"]);
                else Wuaki.elements["keyboard"].div.find(".headerTitle").text(Wuaki.language["searchForSerieTitles"]);
                Wuaki.enableElement(_this.name);
                if (_this.input.value.length >= 3) _this.search()
            });
            Wuaki.elements["modalMenu"].autoEnable()
        }
        this.checkEmptyInput()
    };
    keyboard.prototype.nextOption = function() {
        if (this.div.find("#" + this.layout + " li.hover").hasClass("lastitem")) {
            var nextOption = this.div.find("#" + this.layout + " li.hover").prevAll(".firstitem");
            this.focusedOption = this.getItemNumber(nextOption, "item")
        } else this.focusedOption++;
        this.focusOption(this.focusedOption)
    };
    keyboard.prototype.prevOption = function() {
        if (this.div.find("#" + this.layout + " li.hover").hasClass("firstitem")) {
            var prevOption = this.div.find("#" + this.layout + " li.hover").nextAll(".lastitem");
            this.focusedOption = this.getItemNumber(prevOption, "item")
        } else this.focusedOption--;
        this.focusOption(this.focusedOption)
    };
    keyboard.prototype.nextRow = function() {
        var current = this.div.find("#" + this.layout + " li.hover");
        var x0;
        if (current.hasClass("firstitem")) x0 = this.focusedOption;
        else x0 = this.getItemNumber(current.prevAll(".firstitem"), "item");
        var x1;
        if (current.hasClass("lastitem")) x1 = parseInt(this.focusedOption);
        else x1 = this.getItemNumber(this.div.find("#" + this.layout + " li.hover").nextAll(".lastitem"), "item");
        var y0 = x1 + 1;
        if (y0 > this.getItemNumber(this.div.find("#" + this.layout + " .lastkeyboarditem"), "item")) {
            y0 = 0
        }
        var y1 = this.getItemNumber(this.div.find("#" + this.layout + " .item-" + y0).nextAll(".lastitem"), "item");
        this.focusedOption = (y0 + (this.focusedOption - x0) / ((x1 - x0) / (y1 - y0))).toFixed();
        this.focusOption(this.focusedOption)
    };
    keyboard.prototype.prevRow = function() {
        var current = this.div.find("#" + this.layout + " li.hover");
        var x0;
        if (current.hasClass("firstitem")) x0 = parseInt(this.focusedOption);
        else x0 = this.getItemNumber(this.div.find("#" + this.layout + " li.hover").prevAll(".firstitem"), "item");
        var x1;
        if (current.hasClass("lastitem")) x1 = this.focusedOption;
        else x1 = this.getItemNumber(this.div.find("#" + this.layout + " li.hover").nextAll(".lastitem"), "item");
        var y1 = x0 - 1;
        if (y1 < 0) {
            y1 = this.getItemNumber(this.div.find("#" + this.layout + " .lastkeyboarditem"), "item")
        }
        var y0 = this.getItemNumber(this.div.find("#" + this.layout + " .item-" + y1).prevAll(".firstitem"), "item");
        this.focusedOption = (y0 + (this.focusedOption - x0) / ((x1 - x0) / (y1 - y0))).toFixed();
        this.focusOption(this.focusedOption)
    };
    keyboard.prototype.getItemNumber = function(item, itemClass) {
        return parseInt(item.attr("class").match(itemClass + "-[0-9]+")[0].replace(itemClass + "-", ""))
    };
    keyboard.prototype.actionCAPS = function(item) {
        var level1 = $("#" + this.layout + " .level1");
        var level2 = $("#" + this.layout + " .level2");
        this.div.find("#" + this.layout + " .letter").css("text-transform", "uppercase");
        this.status.caps = true;
        $("#" + this.layout + " .capslock").addClass("hide");
        $("#" + this.layout + " .lowercase").removeClass("hide").removeClass("item-45 lastitem lastkeyboarditem").addClass("item-44");
        $("#" + this.layout + " .symbols").removeClass("hide");
        if (this.mode == "email") $("#" + this.layout + " .emailDisable").parent().removeClass("disable");
        this.div.find("#" + this.layout + " .letter").removeClass("symbolActive");
        level1.removeClass("off").addClass("on");
        level2.removeClass("on").addClass("off");
        this.focusOption(this.focusedOption)
    };
    keyboard.prototype.actionLowercase = function(item) {
        var level1 = $("#" + this.layout + " .level1");
        var level2 = $("#" + this.layout + " .level2");
        this.div.find("#" + this.layout + " .letter").css("text-transform", "lowercase");
        this.status.caps = false;
        $("#" + this.layout + " .capslock").removeClass("hide");
        $("#" + this.layout + " .lowercase").addClass("hide").removeClass("item-45 lastitem lastkeyboarditem").addClass("item-44");
        $("#" + this.layout + " .symbols").removeClass("hide");
        if (this.mode == "email") $("#" + this.layout + " .emailDisable").parent().removeClass("disable");
        this.div.find("#" + this.layout + " .letter").removeClass("symbolActive");
        level1.removeClass("off").addClass("on");
        level2.removeClass("on").addClass("off");
        this.focusOption(this.focusedOption)
    };
    keyboard.prototype.actionSymbols = function(item) {
        var level1 = $("#" + this.layout + " .level1");
        var level2 = $("#" + this.layout + " .level2");
        $("#" + this.layout + " .capslock").removeClass("hide");
        $("#" + this.layout + " .lowercase").removeClass("hide").removeClass("item-44").addClass("item-45 lastitem lastkeyboarditem");
        $("#" + this.layout + " .symbols").addClass("hide");
        if (this.mode == "email") $("#" + this.layout + " .emailDisable").parent().addClass("disable");
        this.div.find("#" + this.layout + " .letter").addClass("symbolActive");
        level1.removeClass("on").addClass("off");
        level2.removeClass("off").addClass("on");
        this.focusOption(this.focusedOption)
    };
    keyboard.prototype.search = function() {
        clearTimeout(_this.searchTimeout);
        if (_this.input.value.length < 3) return;
        var id = "keyboardSearch_movies";
        if (typeof Wuaki.requestList[id] != "undefined") Wuaki.cleanRequest(id);
        Wuaki.requestList[id] = new Object;
        Wuaki.requestList[id].mode = "single";
        Wuaki.requestList[id].element = "keyboard";
        var auth_token = "",
            classification_id = Wuaki.defaultClassificationId,
            id_subscription_plan = Wuaki.defaultSubscriptionPlan,
            meta_sort = "title.asc",
            purchase_method = "",
            title_like = _this.input.value,
            perPage = page = "";
        if (Wuaki.statusLogged) {
            auth_token = Wuaki.user.data.authentication_token;
            if (Wuaki.user.data.profile.classification.id) classification_id = Wuaki.user.data.profile.classification.id;
            if (Wuaki.user.subscriptionPlan.subscriptions.length != 0) id_subscription_plan = Wuaki.user.subscriptionPlan.subscriptions[0].subscription_plan.id
        }
        if (_this.filters[0].name == Wuaki.language["Movies"]) {
            if (_this.filters[1].abbr == "HD") {
                Wuaki.requestList[id].requestId = ApiWuaki.listHDMovies(meta_sort, purchase_method, classification_id, title_like, perPage, page, 0, auth_token, function(requestId) {
                    if (ApiWuaki.getResult(requestId) != "success") {
                        Wuaki.apiError(requestId);
                        return
                    }
                    _this.searchResults = ApiWuaki.getData(requestId);
                    var text = "moviesFound";
                    if (_this.searchResults.pagination.count == 1) text = "movieFound";
                    _this.div.find("#keyboard_header .headerSubtitle").text(_this.searchResults.pagination.count + " " + Wuaki.language[text])
                })
            } else {
                if (Wuaki.SVOD) Wuaki.requestList[id].requestId = ApiWuaki.gettingListOfAllSubscriptionMovies(id_subscription_plan, "", meta_sort, title_like, classification_id, "", perPage, page, 0, auth_token, function(requestId) {
                    if (ApiWuaki.getResult(requestId) != "success") {
                        Wuaki.apiError(requestId);
                        return
                    }
                    _this.searchResults = ApiWuaki.getData(requestId);
                    var text = "moviesFound";
                    if (_this.searchResults.pagination.count == 1) text = "movieFound";
                    _this.div.find("#keyboard_header .headerSubtitle").text(_this.searchResults.pagination.count + " " + Wuaki.language[text])
                });
                else Wuaki.requestList[id].requestId = ApiWuaki.gettingMoviesList(meta_sort, purchase_method, classification_id, title_like, perPage, page, 0, auth_token, function(requestId) {
                    if (ApiWuaki.getResult(requestId) != "success") {
                        Wuaki.apiError(requestId);
                        return
                    }
                    _this.searchResults = ApiWuaki.getData(requestId);
                    var text = "moviesFound";
                    if (_this.searchResults.pagination.count == 1) text = "movieFound";
                    _this.div.find("#keyboard_header .headerSubtitle").text(_this.searchResults.pagination.count + " " + Wuaki.language[text])
                })
            }
        } else {
            if (Wuaki.SVOD) Wuaki.requestList[id].requestId = ApiWuaki.gettingListOfAllSeasonFromSubscriptionPlan(id_subscription_plan, "", meta_sort, title_like, classification_id, "", perPage, page, 0, auth_token, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                _this.searchResults = ApiWuaki.getData(requestId);
                var text = "seasonsFound";
                if (_this.searchResults.pagination.count == 1) text = "seasonFound";
                _this.div.find("#keyboard_header .headerSubtitle").text(_this.searchResults.seasons.length + " " + Wuaki.language[text])
            });
            else Wuaki.requestList[id].requestId = ApiWuaki.gettingSeasonList(meta_sort, purchase_method, classification_id, title_like, perPage, page, 0, auth_token, function(requestId) {
                if (ApiWuaki.getResult(requestId) != "success") {
                    Wuaki.apiError(requestId);
                    return
                }
                _this.searchResults = ApiWuaki.getData(requestId);
                var text = "seasonsFound";
                if (_this.searchResults.pagination.count == 1) text = "seasonFound";
                _this.div.find("#keyboard_header .headerSubtitle").text(_this.searchResults.seasons.length + " " + Wuaki.language[text])
            })
        }
    };
    keyboard.prototype.fullLayoutKeyboard = "" + "<li class='item-2 letter firstitem'><span class='on level1'>a</span><span class='off level2 emailDisable'>&quot;</span></li>" + "<li class='item-3 letter'><span class='on level1'>b</span><span class='off level2 emailDisable'>&#91;</span></li>" + "<li class='item-4 letter'><span class='on level1'>c</span><span class='off level2 emailDisable'>&#93;</span></li>" + "<li class='item-5 letter'><span class='on level1'>d</span><span class='off level2'>&#33;</span></li>" + "<li class='item-6 letter'><span class='on level1'>e</span><span class='off level2'>&#63;</span></li>" + "<li class='item-7 letter'><span class='on level1'>f</span><span class='off level2'>&#35;</span></li>" + "<li class='item-8 letter'><span class='on level1'>g</span><span class='off level2'>&#47;</span></li>" + "<li class='item-9 letter'><span class='on level1'>h</span><span class='off level2'>&#96;</span></li>" + "<li class='item-10 letter'><span class='on level1'>i</span><span class='off level2'>&#39;</span></li>" + "<li class='item-11 symbol'>0</li>" + "<li class='item-12 symbol'>1</li>" + "<li class='item-13 symbol'>2</li> " + "<li class='item-14 symbol lastitem'>3</li>  " + "<li class='item-15 letter firstitem'><span class='on level1'>j</span><span class='off level2 emailDisable'>&#92;</span></li>  " + "<li class='item-16 letter'><span class='on level1'>k</span><span class='off level2 emailDisable'>&#40;</span></li>  " + "<li class='item-17 letter'><span class='on level1'>l</span><span class='off level2 emailDisable'>&#41;</span></li>  " + "<li class='item-18 letter'><span class='on level1'>m</span><span class='off level2'>&#36;</span></li>  " + "<li class='item-19 letter'><span class='on level1'>n</span><span class='off level2'>&#37;</span></li>  " + "<li class='item-20 letter'><span class='on level1'>o</span><span class='off level2'>&amp;</span></li>  " + "<li class='item-21 letter'><span class='on level1'>p</span><span class='off level2'>&#43;</span></li>  " + "<li class='item-22 letter'><span class='on level1'>q</span><span class='off level2'>&#45;</span></li>  " + "<li class='item-23 letter'><span class='on level1'>r</span><span class='off level2'>&#61;</span></li>  " + "<li class='item-24 symbol'>&#95;</li>  " + "<li class='item-25 symbol'>4</li> " + "<li class='item-26 symbol'>5</li> " + "<li class='item-27 symbol lastitem'>6</li> " + "<li class='item-28 letter firstitem'><span class='on level1'>s</span><span class='off level2 emailDisable'>&#58;</span></li>  " + "<li class='item-29 letter'><span class='on level1'>t</span><span class='off level2 emailDisable'>&#59;</span></li>  " + "<li class='item-30 letter'><span class='on level1'>u</span><span class='off level2 emailDisable'>&#44;</span></li>  " + "<li class='item-31 letter'><span class='on level1'>v</span><span class='off level2 emailDisable'>&#42;</span></li>  " + "<li class='item-32 letter'><span class='on level1'>w</span><span class='off level2'>&#124;</span></li>  " + "<li class='item-33 letter'><span class='on level1'>x</span><span class='off level2'>&#123;</span></li>  " + "<li class='item-34 letter'><span class='on level1'>y</span><span class='off level2'>&#125;</span></li>  " + "<li class='item-35 letter'><span class='on level1'>z</span><span class='off level2'>&#94;</span></li>  " + "<li class='item-36 symbol'><span class='on level1'>@</span><span class='off level2'>&#126;</span></li>  " + "<li class='item-37 symbol'>&#46;</li>  " + "<li class='item-38 symbol'>7</li>  " + "<li class='item-39 symbol'>8</li>  " + "<li class='item-40 symbol lastitem'>9</li>  " + "<li class='item-41 delete firstitem'><div/>" + Wuaki.language["delete"] + "</li>   " + "<li class='item-42 space'>" + Wuaki.language["space"] + "</li> " + "<li class='item-43 email disable'>.com</li>  " + "<li class='item-44 capslock'>" + Wuaki.language["caps"] + "</li> " + "<li class='item-45 lowercase hide'>" + Wuaki.language["lowercase"] + "</li> " + "<li class='item-45 symbols lastitem lastkeyboarditem'>" + Wuaki.language["symbols"] + "</li></ul>";
    keyboard.prototype.fullLayoutKeyboardPassword = keyboard.prototype.fullLayoutKeyboard;
    keyboard.prototype.searchLayout = "<ul id='keys'> " + "<li class='item-0 option cancel firstitem'>" + Wuaki.language["cancel"] + "</li> " + "<li class='input-1 size-50' ><span/></li> " + "<li class='item-1 option results lastitem'>" + Wuaki.language["results"] + "</li>";
    keyboard.prototype.stringCancelNextStep = "<ul id='keys'> " + "<li class='item-0 option cancel firstitem'>" + Wuaki.language["cancel"] + "</li> " + "<li class='input-1 size-50'><span/></li> " + "<li class='item-1 option nextstep lastitem'>" + Wuaki.language["nextStep"] + "</li>";
    keyboard.prototype.stringBackNextStep = "<ul id='keys'> " + "<li class='item-0 option back firstitem'>" + Wuaki.language["back"] + "</li> " + "<li class='input-1 size-50'><span/></li> " + "<li class='item-1 option nextstep lastitem'>" + Wuaki.language["nextStep"] + "</li>";
    keyboard.prototype.stringBackFinish = "<ul id='keys'> " + "<li class='item-0 option back firstitem'>" + Wuaki.language["back"] + "</li> " + "<li class='input-1 size-50'><span/></li> " + "<li class='item-1 option finish lastitem'>" + Wuaki.language["finish"] + "</li>";
    keyboard.prototype.stringCancelFinish = "<ul id='keys'> " + "<li class='item-0 option cancel firstitem'>" + Wuaki.language["cancel"] + "</li> " + "<li class='input-1 size-50'><span/></li> " + "<li class='item-1 option finish lastitem'>" + Wuaki.language["finish"] + "</li>";
    keyboard.prototype.numericCardNumber = "<ul id='keys'> " + "<li class='item-0 option back firstitem'>" + Wuaki.language["back"] + "</li> " + "<li class='input-1 reduced size-4'><span/></li> " + "<li class='input-2 reduced size-4'><span/></li> " + "<li class='input-3 reduced size-4'><span/></li> " + "<li class='input-4 reduced size-4'><span/></li> " + "<li class='item-1 option nextstep lastitem'>" + Wuaki.language["nextStep"] + "</li>";
    keyboard.prototype.numericCardNumberOnly = "<ul id='keys'> " + "<li class='item-0 option cancel firstitem'>" + Wuaki.language["cancel"] + "</li> " + "<li class='input-1 reduced size-4'><span/></li> " + "<li class='input-2 reduced size-4'><span/></li> " + "<li class='input-3 reduced size-4'><span/></li> " + "<li class='input-4 reduced size-4'><span/></li> " + "<li class='item-1 option finish lastitem'>" + Wuaki.language["finish"] + "</li>";
    keyboard.prototype.numericExpiration = "<ul id='keys'> " + "<li class='item-0 option back firstitem'>" + Wuaki.language["back"] + "</li> " + "<li class='padding2'/> " + "<li class='input-1 reduced2 size-1'><span/></li> " + "<li class='input-2 reduced2 size-1'><span/></li> " + "<li class='padding2'>/</li> " + "<li class='input-3 reduced2 size-1'><span/></li> " + "<li class='input-4 reduced2 size-1'><span/></li> " + "<li class='padding2'/> " + "<li class='item-1 option nextstep lastitem'>" + Wuaki.language["nextStep"] + "</li>";
    keyboard.prototype.numericExpirationOnly = "<ul id='keys'> " + "<li class='item-0 option cancel firstitem'>" + Wuaki.language["cancel"] + "</li> " + "<li class='padding2'/> " + "<li class='input-1 reduced2 size-1'><span/></li> " + "<li class='input-2 reduced2 size-1'><span/></li> " + "<li class='padding2'>/</li> " + "<li class='input-3 reduced2 size-1'><span/></li> " + "<li class='input-4 reduced2 size-1'><span/></li> " + "<li class='padding2'/> " + "<li class='item-1 option finish lastitem'>" + Wuaki.language["finish"] + "</li>";
    keyboard.prototype.numericCVV = "<ul id='keys'> " + "<li class='item-0 option back firstitem'>" + Wuaki.language["back"] + "</li> " + "<li class='padding3'/> " + "<li class='input-1 reduced3 size-3'><span/></li>" + "<li class='padding3'/> " + "<li class='item-1 option finish lastitem'>" + Wuaki.language["finish"] + "</li>";
    keyboard.prototype.numericCVVOnly = "<ul id='keys'> " + "<li class='item-0 option cancel firstitem'>" + Wuaki.language["cancel"] + "</li> " + "<li class='padding3'/> " + "<li class='input-1 reduced3 size-3'><span/></li>" + "<li class='padding3'/> " + "<li class='item-1 option finish lastitem'>" + Wuaki.language["finish"] + "</li>";
    keyboard.prototype.numericKeyboard = "" + "<li class='padding'/> " + "<li class='item-2 number firstitem'>1</li> " + "<li class='item-3 number'>2</li> " + "<li class='item-4 number lastitem'>3</li> " + "<li class='padding'/> " + "<li class='padding'/> " + "<li class='item-5 number firstitem'>4</li> " + "<li class='item-6 number'>5</li> " + "<li class='item-7 number lastitem'>6</li> " + "<li class='padding'/> " + "<li class='padding'/> " + "<li class='item-8 number firstitem'>7</li> " + "<li class='item-9 number'>8</li> " + "<li class='item-10 number lastitem'>9</li> " + "<li class='padding'/> " + "<li class='padding'/> " + "<li class='item-11 delete extra firstitem'><div/>" + Wuaki.language["delete"] + "</li>   " + "<li class='item-12 number lastitem lastkeyboarditem'>0</li> " + "<li class='padding'/></ul>"
}

function mainMenu() {
    var div;
    var menuOptions;
    var name;
    var menuElement;
    var focusedOption = 0;
    var selectedOption = 0;
    var status;
    var _this = this;
    mainMenu.prototype.init = function(div, name, menuOptions, focusedOption, selectedOption) {
        this.div = div;
        this.menuOptions = menuOptions;
        this.name = name;
        this.focusedOption = focusedOption;
        this.selectedOption = selectedOption;
        if (!this.status) this.status = new Object;
        this.status.ready = false;
        this.status.visible = false;
        this.status.enable = false;
        this.status.autoEnable = false;
        this.draw()
    };
    mainMenu.prototype.ready = function() {
        return this.status.ready
    };
    mainMenu.prototype.autoEnable = function() {
        this.status.autoEnable = true;
        if (this.status.ready) Wuaki.enableElement(this.name)
    };
    mainMenu.prototype.enable = function() {
        Wuaki.currentElement = this;
        Wuaki.elements["subMenu"].hide();
        Wuaki.elements["keyboard"].hide();
        this.div.show();
        this.focusOption(this.focusedOption);
        this.status.autoEnable = false;
        this.status.enable = true;
        this.drawFooter();
        Wuaki.hideLoading();
        if (this.status.boot) {
            this.status.boot = false;
            this.selectCurrentOption()
        }
    };
    mainMenu.prototype.drawFooter = function() {
        if (Wuaki.background != "resources/images/1w_pixel_bg.jpg") Wuaki.elements["footerMenu"].div.removeClass("white");
        Wuaki.elements["footerMenu"].drawLoginStatus(TVA.device == "ps4" ? false : true);
        if (TVA.device != "ps3" && TVA.device != "ps4") Wuaki.elements["footerMenu"].drawExit();
        Wuaki.elements["footerMenu"].drawSelect();
        Wuaki.elements["footerMenu"].drawNavigate();
        Wuaki.elements["footerMenu"].drawSearch();
        Wuaki.elements["footerMenu"].applyNewContent()
    };
    mainMenu.prototype.disable = function() {
        this.unfocusOption();
        this.status.enable = false;
        Wuaki.elements["footerMenu"].removeFooterRight()
    };
    mainMenu.prototype.display = function() {
        this.div.show();
        this.status.visible = true
    };
    mainMenu.prototype.hide = function() {
        this.div.hide();
        this.status.visible = false
    };
    mainMenu.prototype.remove = function() {
        this.menuElement.remove();
        this.status.ready = false;
        this.status.visible = false;
        this.status.enable = false
    };
    mainMenu.prototype.getOptionPos = function(name) {
        for (element in this.menuOptions) {
            if (this.menuOptions[element].name == name) return parseInt(element)
        }
        return false
    };
    mainMenu.prototype.getOptionName = function(pos) {
        return this.menuOptions[pos].name
    };
    mainMenu.prototype.draw = function() {
        this.div.empty();
        this.menuElement = $("<ul/>", {
            id: this.name
        }).appendTo(this.div).addClass("main_menu");
        for (var i = 0; i < this.menuOptions.length; i++) {
            $("<li/>", {
                id: this.name + i
            }).appendTo(this.menuElement).append($("<div/>").addClass("icon").append($('<div class="' + this.menuOptions[i].icon + '"></div>'))).append($("<div>" + this.menuOptions[i].name + "</div>").addClass("fontMenuOptions").addClass("text")).bind("mouseenter", {
                pos: i,
                menu: this
            }, function(event) {
                var element = event.data;
                if (Wuaki.currentElement.name != element.name) Wuaki.enableElement(element.menu.name);
                element.menu.unfocusOption();
                element.menu.focusOption(element.pos)
            }).bind("mouseleave", {
                pos: i,
                menu: this
            }, function() {}).bind("click", this, function(event) {
                var menu = event.data;
                if (menu.focusedOption != menu.selectedOption) {
                    menu.unselectOption(menu.selectedOption)
                }
                menu.selectOption(menu.focusedOption)
            }).addClass("pointer")
        }
        $('<div id="medium_logo"/>').show().appendTo(this.div);
        $('<div id="small_logo"/>').hide().appendTo(this.div);
        this.status.ready = true;
        if (this.status.autoEnable) Wuaki.enableElement(this.name)
    };
    mainMenu.prototype.nav = function(keycode) {
        switch (keycode) {
            case VK_UP:
                if (this.focusedOption > 0) {
                    this.unfocusOption();
                    this.focusOption(--this.focusedOption)
                } else {
                    this.unfocusOption();
                    this.focusOption(this.focusedOption = this.menuOptions.length - 1)
                }
                break;
            case VK_DOWN:
                if (this.focusedOption + 1 < this.menuOptions.length) {
                    this.unfocusOption();
                    this.focusOption(++this.focusedOption)
                } else {
                    this.unfocusOption();
                    this.focusOption(this.focusedOption = 0)
                }
                break;
            case VK_LEFT:
                break;
            case VK_RIGHT:
                if ((this.menuOptions[this.selectedOption].name === Wuaki.language["Search"] || this.menuOptions[this.selectedOption].name === Wuaki.language["Homescreen"]) && Wuaki.elements["gridMenu"].status.visible === true && (Wuaki.elements["gridMenu"].id.match(/^##search##/) || Wuaki.elements["gridMenu"].id.match(/^##homescreen##/))) {
                    this.menuOptions[this.selectedOption].transition();
                    return
                }
                if (this.focusedOption != this.selectedOption) {
                    this.unselectOption(this.selectedOption)
                }
                this.selectOption(this.focusedOption);
                break;
            case VK_BDR_ENTER:
            case VK_CROSS:
                if (this.focusedOption != this.selectedOption) {
                    this.unselectOption(this.selectedOption)
                }
                this.selectOption(this.focusedOption);
                break;
            case VK_BDR_GREEN:
            case VK_TRIANGLE:
            case Wuaki.FOOTER_SEARCH:
                this.unselectOption(this.selectedOption);
                this.unfocusOption();
                this.focusedOption = 0;
                this.selectOption(this.focusedOption);
                break;
            case VK_BDR_YELLOW:
            case Wuaki.customPairKey:
            case Wuaki.FOOTER_PAIR:
                if (!Wuaki.statusLogged) {
                    Wuaki.fromPurchase = false;
                    Wuaki.processCaller = this.name;
                    Wuaki.proccessCallerKey = keycode;
                    Wuaki.elements["splashMenu"].config("splashPairingFromPurchaseOptions", "splashMenu", this.name, "splashPairing", {}, null, null);
                    Wuaki.elements["splashMenu"].autoEnable()
                }
                break;
            case VK_BDR_RETURN:
            case Wuaki.FOOTER_BACK:
                process.exit(this);
                break;
            default:
                break
        }
    };
    mainMenu.prototype.selectCurrentOption = function() {
        if (deepLinking.active) deepLinking.createDeepLinkingMenu();
        else {
            var element = this.menuElement.find("li#" + this.name + this.selectedOption).addClass("selected");
            this.menuOptions[this.selectedOption].action()
        }
    };
    mainMenu.prototype.selectOption = function(option) {
        this.selectedOption = option;
        var element = this.menuElement.find("li#" + this.name + option).addClass("selected");
        this.menuOptions[option].action()
    };
    mainMenu.prototype.unselectOption = function(option) {
        var element = this.menuElement.find("li#" + this.name + option).removeClass("selected")
    };
    mainMenu.prototype.focusOption = function(option) {
        this.normalMenu();
        var element = this.menuElement.find("li#" + this.name + option).addClass("focus");
        this.focusedOption = option
    };
    mainMenu.prototype.unfocusOption = function() {
        var element = this.menuElement.find("li#" + this.name + this.focusedOption).removeClass("focus")
    };
    mainMenu.prototype.reduceMenu = function() {
        this.div.addClass("reduced");
        this.menuElement.find(".selected").addClass("reduced");
        this.div.find("#small_logo").show();
        this.div.find("#medium_logo").hide();
        $("#version").hide()
    };
    mainMenu.prototype.normalMenu = function() {
        this.div.removeClass("reduced");
        this.menuElement.find(".selected").removeClass("reduced");
        this.div.find("#small_logo").hide();
        this.div.find("#medium_logo").show();
        $("#version").show()
    }
}

function subMenu() {
    var div;
    var name;
    var menuElement, menuCarousel, parentMenu;
    var focusedOption, selectedOption;
    var menuOptions;
    var autoSelectTimeOut;
    var status;
    var fillRequestId;
    var autoSelectTime;
    var _this = this;
    subMenu.prototype.init = function(div, name, parentMenu, focusedOption, selectedOption) {
        this.div = div;
        this.name = name;
        this.focusedOption = focusedOption;
        this.selectedOption = selectedOption;
        this.parentMenu = parentMenu;
        this.menuOptions = new Array;
        this.status = new Object;
        this.status.visible = false;
        this.status.ready = false;
        this.status.enable = false;
        this.status.autoEnable = false;
        this.status.adultEnable = false;
        this.autoSelectTime = 1800;
        this.draw()
    };
    subMenu.prototype.ready = function() {
        return this.status.ready
    };
    subMenu.prototype.autoEnable = function() {
        this.status.autoEnable = true;
        if (this.status.ready) Wuaki.enableElement(this.name)
    };
    subMenu.prototype.enable = function(fromError) {
        if (typeof fromError == "undefined") fromError = false;
        Wuaki.currentElement = this;
        Wuaki.elements[this.parentMenu].reduceMenu();
        Wuaki.elements["keyboard"].hide();
        this.display();
        if (this.autofocusedOption != null) {
            this.focusedOption = this.autofocusedOption;
            this.autofocusedOption = null
        }
        this.focusOption(this.focusedOption);
        if (this.autoselectedOption != null) {
            this.selectedOption = this.autoselectedOption;
            this.autoselectedOption = null
        }
        this.status.enable = true;
        this.status.autoEnable = false;
        this.opacity();
        if ((typeof this.menuOptions[this.focusedOption].adult == "undefined" || this.menuOptions[this.focusedOption].adult == false || this.status.adultEnable == true) && !fromError) this.selectCurrentOption();
        this.drawFooter();
        Wuaki.hideLoading();
        TVA_GoogleAnalytics.analyticMark(TVA.device + "/navigation", "Menu/" + this.id)
    };
    subMenu.prototype.autoSelectConfig = function(focus, select) {
        this.autofocusedOption = focus;
        this.autoselectedOption = select
    };
    subMenu.prototype.disable = function() {
        this.unfocusOption();
        this.status.enable = false
    };
    subMenu.prototype.display = function() {
        this.status.visible = true;
        this.div.show()
    };
    subMenu.prototype.hide = function() {
        this.status.visible = false;
        this.div.hide()
    };
    subMenu.prototype.resetOptions = function() {
        this.menuCarousel.reset();
        this.menuOptions = new Array
    };
    subMenu.prototype.reset = function() {
        this.menuCarousel.reset();
        this.menuOptions = new Array;
        this.focusedOption = 0;
        this.selectedOption = 0;
        this.parentMenu = null;
        this.menuOptions = new Array;
        this.status = new Object;
        this.status.visible = false;
        this.status.ready = false;
        this.status.enable = false;
        this.status.autoEnable = false;
        this.status.adultEnable = false;
        this.autoSelectTime = 3e3
    };
    subMenu.prototype.drawFooter = function() {
        if (Wuaki.background != "resources/images/1w_pixel_bg.jpg") Wuaki.elements["footerMenu"].div.removeClass("white");
        Wuaki.elements["footerMenu"].drawLoginStatus(TVA.device == "ps4" ? false : true);
        Wuaki.elements["footerMenu"].drawReturn();
        Wuaki.elements["footerMenu"].drawSelect();
        Wuaki.elements["footerMenu"].drawNavigate();
        if (!Wuaki.isPremiumUser() && Wuaki.elements["mainMenu"].selectedOption == Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["PlanPremium"])) {
            Wuaki.elements["footerMenu"].drawCoupon();
            Wuaki.elements["footerMenu"].drawSubscribe()
        } else {
            Wuaki.elements["footerMenu"].drawSearch()
        }
        Wuaki.elements["footerMenu"].applyNewContent()
    };
    subMenu.prototype.draw = function() {
        this.menuElement = $('<ul class="jcarousel-skin-submenu" id="' + this.name + '"></ul>').appendTo(this.div);
        $("#" + this.name).jcarousel({
            vertical: true,
            scroll: 1,
            animation: Wuaki.animation,
            itemFallbackDimension: 640,
            itemFirstOutCallback: function() {
                Wuaki.elements["subMenu"].opacity()
            },
            setupCallback: function(carousel) {
                carousel.reload()
            }
        });
        this.menuCarousel = $("#" + this.name).data("jcarousel")
    };
    subMenu.prototype.config = function(id, parent, parentMenu, focus, callbackFill) {
        if (this.id !== id) {
            Wuaki.showLoading();
            this.status.ready = false;
            this.status.autoEnable = false;
            this.status.adultEnable = false;
            this.parentMenu = parentMenu;
            this.id = id;
            this.parent = parent;
            this.focusedOption = focus;
            this.callbackFill = callbackFill;
            this.callbackFill()
        }
    };
    subMenu.prototype.fill = function(data, id) {
        var listFocus = null;
        this.fillRequestId = id;
        this.resetOptions();
        this.hide();
        for (var i = 0; i < data.length; i++) {
            if (typeof data[i].short_name == "undefined") data[i].short_name = data[i].name;
            this.menuCarousel.add(i, "<div class='buttonText'>" + data[i].short_name + "</div>").addClass("fontMenuOptions");
            if (typeof data[i].position != "undefined" && data[i].position != null && (listFocus == null || data[i].position < data[listFocus].position)) listFocus = i
        }
        this.addMouseEvents();
        if (listFocus) this.focusedOption = listFocus;
        this.menuOptions = data;
        this.menuCarousel.options.size = data.length + 1;
        this.menuCarousel.last = 12;
        this.status.ready = true;
        if (this.status.autoEnable) Wuaki.enableElement(this.name)
    };
    subMenu.prototype.addMouseEvents = function() {
        $(this.div).find("li").unbind().bind("mouseenter", this, function(event) {
            var element = event.data;
            $("#" + element.name + " li.lihover").removeClass("lihover");
            $(this).addClass("lihover");
            element.focusedOption = Number($(this).attr("jcarouselindex"));
            var last = element.menuCarousel.last;
            var first = element.menuCarousel.first;
            if (first - 1 == element.focusedOption) setTimeout(function() {
                if (element.status.enable) element.menuCarousel.prev()
            }, 300);
            if (last - 1 == element.focusedOption) setTimeout(function() {
                if (element.status.enable) element.menuCarousel.next()
            }, 300);
            element.opacity();
            if (Wuaki.currentElement.name != element.name) Wuaki.enableElementFromError(element.name)
        }).bind("mouseleave", this, function() {}).bind("click", this, function(event) {
            var element = event.data;
            element.selectCurrentOption()
        }).addClass("pointer")
    };
    subMenu.prototype.nav = function(keycode) {
        switch (keycode) {
            case VK_UP:
                if (Wuaki.autoselectOption) this.autoSelect();
                this.prevOption();
                break;
            case VK_DOWN:
                if (Wuaki.autoselectOption) this.autoSelect();
                this.nextOption();
                break;
            case VK_LEFT:
            case VK_BDR_RETURN:
            case VK_CIRCLE:
            case Wuaki.FOOTER_BACK:
                this.disable();
                this.hide();
                Wuaki.enableElement(this.parentMenu);
                break;
            case VK_RIGHT:
                this.selectCurrentOption();
                this.menuOptions[this.selectedOption].transition();
                break;
            case VK_BDR_ENTER:
            case VK_CROSS:
                this.selectCurrentOption();
                this.menuOptions[this.selectedOption].transition();
                break;
            case VK_BDR_BLUE:
            case VK_SQUARE:
            case Wuaki.FOOTER_COUPON:
                if (!Wuaki.isPremiumUser() && Wuaki.elements["mainMenu"].selectedOption == Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["PlanPremium"]) || Wuaki.isProcessedCallerKey) {
                    var data = new Object;
                    data.subscription_plans = Wuaki.subscriptionPlans;
                    Wuaki.proccessCallerKey = keycode;
                    process.couponForSubscription(_this, data, function() {
                        Wuaki.enableElement(_this.parentMenu);
                        Wuaki.currentElement.selectCurrentOption()
                    })
                }
                break;
            case VK_BDR_GREEN:
            case VK_TRIANGLE:
            case Wuaki.FOOTER_SEARCH:
            case Wuaki.FOOTER_SUBSCRIBE:
                if (!Wuaki.isPremiumUser() && Wuaki.elements["mainMenu"].selectedOption == Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["PlanPremium"]) || Wuaki.isProcessedCallerKey) {
                    var data = new Object;
                    data.subscription_plans = Wuaki.subscriptionPlans;
                    Wuaki.proccessCallerKey = keycode;
                    process.subscription(_this, data, function() {
                        Wuaki.enableElement(_this.parentMenu);
                        Wuaki.currentElement.selectCurrentOption()
                    })
                } else {
                    Wuaki.enableElement("mainMenu");
                    Wuaki.elements["mainMenu"].unselectOption(Wuaki.elements["mainMenu"].selectedOption);
                    Wuaki.elements["mainMenu"].unfocusOption();
                    Wuaki.elements["mainMenu"].focusedOption = 0;
                    Wuaki.elements["mainMenu"].selectOption(Wuaki.elements["mainMenu"].focusedOption)
                }
                break;
            case VK_BDR_YELLOW:
            case Wuaki.customPairKey:
            case Wuaki.FOOTER_PAIR:
                if (!Wuaki.statusLogged) {
                    Wuaki.fromPurchase = false;
                    Wuaki.processCaller = this.name;
                    Wuaki.proccessCallerKey = keycode;
                    Wuaki.elements["splashMenu"].config("splashPairingFromPurchaseOptions", "splashMenu", this.name, "splashPairing", {}, null, null);
                    Wuaki.elements["splashMenu"].autoEnable()
                }
                break;
            default:
                break
        }
    };
    subMenu.prototype.autoSelect = function() {
        clearTimeout(this.autoSelectTimeOut);
        this.autoSelectTimeOut = setTimeout(function() {
            if (_this.status.enable) _this.selectCurrentOption()
        }, this.autoSelectTime)
    };
    subMenu.prototype.focusOption = function(option) {
        var first = this.menuCarousel.first;
        var last = this.menuCarousel.last;
        var li_active = $("#" + this.name + " li.lihover");
        li_active.removeClass("lihover");
        li_active = $("#" + this.name + " .jcarousel-item-" + option);
        li_active.addClass("lihover");
        if (option < first || option > last) {
            this.menuCarousel.scroll(option)
        }
        this.focusedOption = option
    };
    subMenu.prototype.unfocusOption = function() {
        var first = this.menuCarousel.first;
        var last = this.menuCarousel.last;
        var li_active = $("#" + this.name + " li.lihover");
        li_active.removeClass("lihover")
    };
    subMenu.prototype.selectCurrentOption = function() {
        clearTimeout(this.autoSelectTimeOut);
        if (this.menuOptions[this.focusedOption].adult && this.status.adultEnable == false) {
            if (Wuaki.statusLogged) {
                Wuaki.elements["modalMenu"].config("AdultContentWarning", "modalMenu", "subMenu", "adult", this.menuOptions[this.focusedOption], modalFillCallbacks.adult, function(output) {
                    if (output) {
                        _this.status.adultEnable = true
                    }
                    Wuaki.enableElement("subMenu")
                });
                Wuaki.elements["modalMenu"].autoEnable()
            } else {
                Wuaki.elements["modalMenu"].config("AdultContentWarning", "modalMenu", "subMenu", "adult", this.menuOptions[this.focusedOption], modalFillCallbacks.adult, function(output) {
                    if (output) {
                        Wuaki.processCaller = "subMenu";
                        Wuaki.fromPurchase = false;
                        Wuaki.elements["splashMenu"].config("splashPairing", "splashMenu", "mainMenu", "splashPairing", {}, null, null);
                        Wuaki.elements["splashMenu"].autoEnable()
                    } else Wuaki.enableElement("subMenu")
                });
                Wuaki.elements["modalMenu"].autoEnable()
            }
        } else {
            $("#" + this.name + " li.active").removeClass("active");
            $("#" + this.name + " li.lihover").addClass("active");
            this.selectedOption = this.focusedOption;
            this.menuOptions[this.selectedOption].action()
        }
    };
    subMenu.prototype.nextOption = function() {
        if (this.menuCarousel.animating || this.focusedOption + 1 >= this.menuCarousel.options.size - 1) return;
        var nextElement = $("#" + this.name + " li.lihover").next();
        if (nextElement.length) {
            $("#" + this.name + " li.lihover").removeClass("lihover");
            nextElement.addClass("lihover");
            this.focusedOption = Number(nextElement.attr("jcarouselindex"));
            var last = this.menuCarousel.last;
            if (this.focusedOption >= last - 2) {
                this.menuCarousel.next()
            }
        }
    };
    subMenu.prototype.prevOption = function() {
        if (this.menuCarousel.animating) return;
        var prevElement = $("#" + this.name + " li.lihover").prev();
        if (prevElement.length) {
            $("#" + this.name + " li.lihover").removeClass("lihover");
            prevElement.addClass("lihover");
            this.focusedOption = Number(prevElement.attr("jcarouselindex"));
            var first = this.menuCarousel.first;
            if (this.focusedOption < first + 1) {
                this.menuCarousel.prev()
            }
        }
    };
    subMenu.prototype.opacity = function() {
        if (this.menuCarousel && this.menuCarousel.options.size > 13) {
            for (var i = 1; i < 4; i++) {
                $("#" + this.name + " .liOpacity" + i).removeClass("liOpacity" + i);
                if (this.menuCarousel.first > 1 && 1 < this.menuCarousel.first - 3 + i) $("#" + this.name + " .jcarousel-item-" + (this.menuCarousel.first - 4 + i)).addClass("liOpacity" + i);
                if (this.menuCarousel.last < this.menuCarousel.options.size && this.focusedOption < this.menuCarousel.last + 1 - i) $("#" + this.name + " .jcarousel-item-" + (this.menuCarousel.last + 1 - i)).addClass("liOpacity" + i)
            }
        }
    }
}
var mainMenuOptions = {
    getOptions: function() {
        var options = new Array;
        options.push(this.search());
        if (Wuaki.homescreen) options.push(this.homescreen());
        if (!Wuaki.isPremiumUser() && Wuaki.SVOD && Wuaki.subscriptionPlans.length > 0) options.push(this.planPremium());
        options.push(this.movies());
        options.push(this.tvShows());
        if (!Wuaki.SVOD) {
            if (Wuaki.subscriptionPlans.length > 0) options.push(this.planPremium());
            options.push(this.myLibrary())
        }
        if (Wuaki.statusLogged || !Wuaki.SVOD) {
            options.push(this.wishList());
            options.push(this.settings())
        }
        return options
    },
    search: function() {
        var menuOption = new Object;
        menuOption.name = Wuaki.language["Search"];
        menuOption.icon = "search";
        menuOption.action = function() {
            Wuaki.elements["keyboard"].config("keyboardSearch", this, "mainMenu", 7, "search", Wuaki.elements["keyboard"].searchLayout, Wuaki.elements["keyboard"].fullLayoutKeyboard, Wuaki.language["searchForMovieTitles"], Wuaki.language["typeAtLeast3chars"], function() {
                var _this = jQuery.extend({}, this);
                _this.name = Wuaki.language["resultsFor"] + ' "' + Wuaki.elements["keyboard"].input.value + '"';
                Wuaki.elements["gridMenu"].config("##search##" + Wuaki.elements["keyboard"].input.value + Wuaki.elements["keyboard"].filters[0].name + Wuaki.elements["keyboard"].filters[1].abbr, _this, "mainMenu", "normal", 1, 10, 0, gridFillCallbacks.search);
                Wuaki.elements["gridMenu"].autoEnable()
            });
            Wuaki.elements["keyboard"].autoEnable();
            Wuaki.temporalPassword = ""
        };
        menuOption.transition = function() {
            Wuaki.elements["gridMenu"].parentMenu = "mainMenu";
            Wuaki.elements["gridMenu"].autoEnable()
        };
        return menuOption
    },
    homescreen: function() {
        var menuOption = new Object;
        menuOption.name = Wuaki.language["Homescreen"];
        menuOption.icon = "homescreen";
        menuOption.action = function() {
            Wuaki.elements["homescreenMenu"].config("homescreenMenu", this, "mainMenu", "reduced", 1, 5, $("#homescreen_banner0"), homescreenFillCallbacks.homescreen);
            Wuaki.elements["homescreenMenu"].autoEnable()
        };
        menuOption.transition = function() {
            Wuaki.elements["gridMenu"].parentMenu = "mainMenu";
            Wuaki.elements["gridMenu"].autoEnable()
        };
        return menuOption
    },
    movies: function() {
        var menuOption = new Object;
        menuOption.name = Wuaki.language["Movies"];
        menuOption.icon = "movies";
        menuOption.action = function() {
            Wuaki.browsePlanPremium = false;
            if (Wuaki.SVOD) Wuaki.elements["subMenu"].config("premiumMovies", this, "mainMenu", 0, submenuFillCallbacks.premiumSubscribed);
            else Wuaki.elements["subMenu"].config("movies", this, "mainMenu", 0, submenuFillCallbacks.movies);
            Wuaki.elements["subMenu"].autoEnable();
            Wuaki.temporalPassword = ""
        };
        return menuOption
    },
    tvShows: function() {
        var menuOption = new Object;
        menuOption.name = Wuaki.language["TVShows"];
        menuOption.icon = "tv-shows";
        menuOption.action = function() {
            if (Wuaki.SVOD) Wuaki.elements["gridMenu"].config("premiumSeasons", this, "mainMenu", "normal", 1, 8, 0, gridFillCallbacks.planPremiumSeasons);
            else Wuaki.elements["gridMenu"].config("seasons", this, "mainMenu", "normal", 1, 8, 0, gridFillCallbacks.seasons);
            Wuaki.elements["gridMenu"].autoEnable();
            Wuaki.temporalPassword = ""
        };
        return menuOption
    },
    planPremium: function() {
        var menuOption = new Object;
        menuOption.name = Wuaki.language["PlanPremium"];
        menuOption.icon = "plan-premium";
        menuOption.action = function() {
            if (!Wuaki.isPremiumUser()) {
                Wuaki.elements["gridMenu"].config("planPremiumMoviesHighlighted", this, "mainMenu", "reduced", 1, 5, "banner", gridFillCallbacks.planPremiumMoviesHighlighted);
                Wuaki.elements["gridMenu"].autoEnable()
            } else {
                Wuaki.browsePlanPremium = false;
                Wuaki.elements["subMenu"].config("premiumSubscribed", this, "mainMenu", 2, submenuFillCallbacks.premiumSubscribed);
                Wuaki.elements["subMenu"].autoEnable()
            }
            Wuaki.temporalPassword = ""
        };
        return menuOption
    },
    myLibrary: function() {
        var menuOption = new Object;
        menuOption.name = Wuaki.language["MyLibrary"];
        menuOption.icon = "my-library";
        menuOption.action = function() {
            if (Wuaki.isUserAccountAndDevicePairing()) {
                Wuaki.elements["subMenu"].config("myLibrary", this, "mainMenu", 0, submenuFillCallbacks.myLibrary);
                Wuaki.elements["subMenu"].autoEnable()
            } else {
                Wuaki.fromPurchase = false;
                Wuaki.processCaller = "mainMenu";
                Wuaki.elements["splashMenu"].config("splashPairing", "splashMenu", "mainMenu", "splashPairing", {}, null, null);
                Wuaki.elements["splashMenu"].autoEnable()
            }
            Wuaki.temporalPassword = ""
        };
        return menuOption
    },
    wishList: function() {
        var menuOption = new Object;
        menuOption.name = Wuaki.language["Wishlist"];
        menuOption.icon = "wishlist";
        menuOption.action = function() {
            if (Wuaki.isUserAccountAndDevicePairing()) {
                Wuaki.elements["subMenu"].config("wishList", this, "mainMenu", 0, submenuFillCallbacks.wishList);
                Wuaki.elements["subMenu"].autoEnable()
            } else {
                Wuaki.fromPurchase = false;
                Wuaki.processCaller = "mainMenu";
                Wuaki.elements["splashMenu"].config("splashPairing", "splashMenu", "mainMenu", "splashPairing", {}, null, null);
                Wuaki.elements["splashMenu"].autoEnable()
            }
            Wuaki.temporalPassword = ""
        };
        return menuOption
    },
    settings: function() {
        var menuOption = new Object;
        menuOption.name = Wuaki.language["Settings"];
        menuOption.icon = "settings";
        menuOption.action = function() {
            if (Wuaki.isUserAccountAndDevicePairing() && Wuaki.temporalPassword != Wuaki.pairing.password) {
                Wuaki.elements["keyboard"].reset();
                Wuaki.elements["keyboard"].config("keyboardPassword", this, "mainMenu", 7, "passwordUnpair", Wuaki.elements["keyboard"].stringCancelFinish, Wuaki.elements["keyboard"].fullLayoutKeyboardPassword, Wuaki.language["password"], Wuaki.language["useYourAccountPassword"], function() {
                    Wuaki.temporalPassword = this.input.value;
                    ApiWuaki.login(Wuaki.user.data.username || Wuaki.user.data.email, this.input.value, function(requestId) {
                        if ("success" === ApiWuaki.getResult(requestId)) {
                            Wuaki.user.data = ApiWuaki.getData(requestId);
                            TVA_Storage.toFile(Wuaki.COOKIE_TOKEN, Wuaki.user.data.authentication_token);
                            TVA_Storage.toFile(Wuaki.COOKIE_ID, Wuaki.user.data.id.toString());
                            Wuaki.pairing.password = Wuaki.temporalPassword;
                            Wuaki.elements["subMenu"].config("settings", this, "mainMenu", 0, submenuFillCallbacks.settings);
                            Wuaki.elements["subMenu"].autoEnable()
                        } else {
                            var data = ApiWuaki.getError(requestId);
                            data.modalTitle = Wuaki.language["login"];
                            data.buttonText = Wuaki.language["ok"];
                            Wuaki.elements["modalMenu"].config("PairingMessageError", "modalMenu", Wuaki.currentElement.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                                Wuaki.disableElement("keyboard");
                                Wuaki.enableElement("mainMenu")
                            });
                            Wuaki.elements["modalMenu"].autoEnable()
                        }
                    })
                });
                Wuaki.elements["keyboard"].autoEnable()
            } else if (Wuaki.isUserAccountAndDevicePairing() && Wuaki.temporalPassword == Wuaki.pairing.password) {
                Wuaki.elements["subMenu"].config("settings", this, "mainMenu", 0, submenuFillCallbacks.settings);
                Wuaki.elements["subMenu"].autoEnable()
            } else {
                Wuaki.fromPurchase = false;
                Wuaki.processCaller = "mainMenu";
                Wuaki.elements["splashMenu"].config("splashPairing", "splashMenu", "mainMenu", "splashPairing", {}, null, null);
                Wuaki.elements["splashMenu"].autoEnable()
            }
        };
        return menuOption
    }
};
var submenuFillCallbacks = {
    movies: function() {
        var auth_token = "",
            classification_id = '"' + Wuaki.defaultClassificationId + '"';
        if (Wuaki.statusLogged) {
            auth_token = '"' + Wuaki.user.data.authentication_token + '"';
            if (Wuaki.user.data.profile.classification.id) classification_id = '"' + Wuaki.user.data.profile.classification.id + '"'
        } else auth_token = '""';
        var apicalls = new Array;
        var data = new Array;
        var call = new Object;
        call.funcName = "ApiWuaki.gettingEditorialList";
        call.arguments = new Array;
        call.arguments.push('""');
        call.arguments.push('"true"');
        call.arguments.push(auth_token);
        apicalls.push(call);
        var call = new Object;
        call.funcName = "ApiWuaki.gettingGenres";
        call.arguments = new Array;
        call.arguments.push('"movies"');
        call.arguments.push(auth_token);
        apicalls.push(call);
        var id = "Movies_Submenu";
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "queue";
            Wuaki.requestList[id].element = "subMenu";
            Wuaki.requestList[id].requestId = id;
            ApiWuaki.queue(id, apicalls, function(id) {
                if (Wuaki.checkAPIError(id, true)) return;
                submenuFillCallbacks.listGenresConcatFillMovies(id, data)
            });
            Wuaki.queueIdLifeTime(id)
        } else {
            submenuFillCallbacks.listGenresConcatFillMovies(id, data)
        }
    },
    premiumSubscribed: function() {
        var auth_token = "",
            id_subscription_plan = Wuaki.defaultSubscriptionPlan;
        if (Wuaki.statusLogged) {
            auth_token = Wuaki.user.data.authentication_token;
            if (Wuaki.user.subscriptionPlan.subscriptions.length != 0) id_subscription_plan = Wuaki.user.subscriptionPlan.subscriptions[0].subscription_plan.id;
            else id_subscription_plan = Wuaki.defaultSubscriptionPlan
        }
        var apicalls = new Array;
        var data = new Array;
        if (Wuaki.browsePlanPremium || !Wuaki.SVOD) {
            data.push({
                id: "-1",
                short_name: Wuaki.language["AllMovies"],
                name: Wuaki.language["AllMoviesLong"],
                action: function() {
                    Wuaki.elements["gridMenu"].config("planPremiumMovies", this, "subMenu", "normal", 1, 10, 0, gridFillCallbacks.planPremiumMovies)
                },
                transition: function() {
                    Wuaki.elements["gridMenu"].autoEnable()
                }
            });
            data.push({
                id: "-1",
                short_name: Wuaki.language["AllTVShows"],
                name: Wuaki.language["AllTVShowsLong"],
                action: function() {
                    Wuaki.elements["gridMenu"].config("planPremiumSeasons", this, "subMenu", "normal", 1, 8, 0, gridFillCallbacks.planPremiumSeasons)
                },
                transition: function() {
                    Wuaki.elements["gridMenu"].autoEnable()
                }
            })
        }
        var call = new Object;
        call.funcName = "ApiWuaki.gettingEditorialList";
        call.arguments = new Array;
        call.arguments.push('"true"');
        call.arguments.push('""');
        call.arguments.push('"' + auth_token + '"');
        apicalls.push(call);
        var call = new Object;
        call.funcName = "ApiWuaki.gettingListOfGenresSubscriptionPlan";
        call.arguments = new Array;
        call.arguments.push('"' + id_subscription_plan + '"');
        call.arguments.push('"movies"');
        call.arguments.push('"' + auth_token + '"');
        apicalls.push(call);
        var id = "PlanPremium_Submenu";
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "queue";
            Wuaki.requestList[id].element = "subMenu";
            Wuaki.requestList[id].requestId = id;
            ApiWuaki.queue(id, apicalls, function(id) {
                if (Wuaki.checkAPIError(id, true)) return;
                submenuFillCallbacks.listGenresConcatFillPlanPremium(id, data)
            });
            Wuaki.queueIdLifeTime(id)
        } else {
            submenuFillCallbacks.listGenresConcatFillPlanPremium(id, data)
        }
    },
    myLibrary: function() {
        var data = new Array;
        data.push({
            id: "-1",
            name: Wuaki.language["Movies"],
            action: function() {
                Wuaki.elements["gridMenu"].config("myLibraryMovies", this, "subMenu", "normal", 1, 10, 0, gridFillCallbacks.myLibrary)
            },
            transition: function() {
                Wuaki.elements["gridMenu"].autoEnable()
            }
        });
        data.push({
            id: "-1",
            name: Wuaki.language["Seasons"],
            action: function() {
                Wuaki.elements["gridMenu"].config("myLibrarySeasons", this, "subMenu", "normal", 1, 10, 0, gridFillCallbacks.myLibrary)
            },
            transition: function() {
                Wuaki.elements["gridMenu"].autoEnable()
            }
        });
        data.push({
            id: "-1",
            name: Wuaki.language["Episodes"],
            action: function() {
                Wuaki.elements["gridMenu"].config("myLibraryEpisodes", this, "subMenu", "normal", 1, 10, 0, gridFillCallbacks.myLibrary)
            },
            transition: function() {
                Wuaki.elements["gridMenu"].autoEnable()
            }
        });
        Wuaki.elements["subMenu"].fill(data)
    },
    wishList: function() {
        var data = new Array;
        data.push({
            id: "-1",
            name: Wuaki.language["Movies"],
            action: function() {
                Wuaki.elements["gridMenu"].config("myFavouritesMovies", this, "subMenu", "normal", 1, 10, 0, gridFillCallbacks.myFavouritesMovies)
            },
            transition: function() {
                Wuaki.elements["gridMenu"].autoEnable()
            }
        });
        data.push({
            id: "-1",
            name: Wuaki.language["Seasons"],
            action: function() {
                Wuaki.elements["gridMenu"].config("myFavouritesSeasons", this, "subMenu", "normal", 1, 10, 0, gridFillCallbacks.myFavouritesSeasons)
            },
            transition: function() {
                Wuaki.elements["gridMenu"].autoEnable()
            }
        });
        data.push({
            id: "-1",
            name: Wuaki.language["Episodes"],
            action: function() {
                Wuaki.elements["gridMenu"].config("myFavouritesEpisodes", this, "subMenu", "normal", 1, 10, 0, gridFillCallbacks.myFavouritesEpisodes)
            },
            transition: function() {
                Wuaki.elements["gridMenu"].autoEnable()
            }
        });
        Wuaki.elements["subMenu"].fill(data)
    },
    settings: function() {
        var data = new Array;
        data.push({
            id: "-1",
            name: Wuaki.language["Overview"],
            action: function() {
                boxFormConfigs.Overview()
            },
            transition: function() {
                if (Wuaki.elements["boxFormMenu"].menuOptions.length > 0) Wuaki.elements["boxFormMenu"].autoEnable();
                else Wuaki.hideLoading()
            }
        });
        data.push({
            id: "-1",
            name: Wuaki.language["Payments"],
            action: function() {
                boxFormConfigs.Payments()
            },
            transition: function() {
                if (Wuaki.elements["boxFormMenu"].menuOptions.length > 0) Wuaki.elements["boxFormMenu"].autoEnable();
                else Wuaki.hideLoading()
            }
        });
        data.push({
            id: "-1",
            name: Wuaki.language["Preferences"],
            action: function() {
                boxFormConfigs.Preferences()
            },
            transition: function() {
                if (Wuaki.elements["boxFormMenu"].menuOptions.length > 0) Wuaki.elements["boxFormMenu"].autoEnable();
                else Wuaki.hideLoading()
            }
        });
        data.push({
            id: "-1",
            name: Wuaki.language["Unpair"],
            action: function() {
                boxFormConfigs.Unpair()
            },
            transition: function() {
                if (Wuaki.elements["boxFormMenu"].menuOptions.length > 0) Wuaki.elements["boxFormMenu"].autoEnable();
                else Wuaki.hideLoading()
            }
        });
        Wuaki.elements["subMenu"].fill(data)
    },
    listGenresConcatFillMovies: function(id, data) {
        var lists = ApiWuaki.queueGetData(id, 0)["lists"];
        if (!Wuaki.adultContent) lists = commonTools.removeAdultFromList(lists);
        commonTools.addActionTransitionToObjectArray(lists, function() {
            Wuaki.elements["gridMenu"].config("Movies_gettingListFromEditorial" + this.id, this, "subMenu", "normal", 1, 10, 0, gridFillCallbacks.gettingListFromEditorial)
        }, function() {
            if (Wuaki.elements["subMenu"].menuOptions[Wuaki.elements["subMenu"].focusedOption].adult && Wuaki.elements["subMenu"].status.adultEnable == false) return;
            else Wuaki.elements["gridMenu"].autoEnable()
        });
        var genres = ApiWuaki.queueGetData(id, 1)["genres"];
        if (!Wuaki.adultContent) genres = commonTools.removeAdultFromList(genres);
        commonTools.addActionTransitionToObjectArray(genres, function() {
            Wuaki.elements["gridMenu"].config("Movies_moviesByGenre" + this.id, this, "subMenu", "normal", 1, 10, 0, gridFillCallbacks.moviesByGenre)
        }, function() {
            if (Wuaki.elements["subMenu"].menuOptions[Wuaki.elements["subMenu"].focusedOption].adult && Wuaki.elements["subMenu"].status.adultEnable == false) return;
            else Wuaki.elements["gridMenu"].autoEnable()
        });
        data = data.concat(lists, genres);
        Wuaki.elements["subMenu"].fill(data)
    },
    listGenresConcatFillPlanPremium: function(id, data) {
        var lists = ApiWuaki.queueGetData(id, 0)["lists"];
        if (!Wuaki.adultContent) lists = commonTools.removeAdultFromList(lists);
        commonTools.addActionTransitionToObjectArray(lists, function() {
            Wuaki.elements["gridMenu"].config("Plan_gettingListFromEditorial" + this.id, this, "subMenu", "normal", 1, 10, 0, gridFillCallbacks.gettingListFromSubscriptionEditorial)
        }, function() {
            if (Wuaki.elements["subMenu"].menuOptions[Wuaki.elements["subMenu"].focusedOption].adult && Wuaki.elements["subMenu"].status.adultEnable == false) return;
            else Wuaki.elements["gridMenu"].autoEnable()
        });
        var genres = ApiWuaki.queueGetData(id, 1)["genres"];
        if (!Wuaki.adultContent) genres = commonTools.removeAdultFromList(genres);
        commonTools.addActionTransitionToObjectArray(genres, function() {
            Wuaki.elements["gridMenu"].config("Plan_moviesByGenre" + this.id, this, "subMenu", "normal", 1, 10, 0, gridFillCallbacks.planPremiumMovies)
        }, function() {
            if (Wuaki.elements["subMenu"].menuOptions[Wuaki.elements["subMenu"].focusedOption].adult && Wuaki.elements["subMenu"].status.adultEnable == false) return;
            else Wuaki.elements["gridMenu"].autoEnable()
        });
        data = data.concat(lists, genres);
        Wuaki.elements["subMenu"].fill(data, id)
    }
};

function modalMenu() {
    var div;
    var name, parentMenu;
    var status;
    var data;
    var mode;
    var modalCarousel;
    var focusedOption, selectedOption;
    var menuOptions;
    var output;
    var _this = this;
    modalMenu.prototype.init = function(div, name) {
        this.name = name;
        this.div = div;
        this.status = new Object;
        this.status.enable = false;
        this.status.visible = false;
        this.status.ready = false;
        this.status.autoEnable = false;
        this.output = new Array;
        this.carousels = new Array;
        this.currentCarousel = 0
    };
    modalMenu.prototype.ready = function() {
        return this.status.ready
    };
    modalMenu.prototype.autoEnable = function() {
        this.status.autoEnable = true;
        if (this.status.ready) Wuaki.enableElementNoDisablePrevious(this.name)
    };
    modalMenu.prototype.enable = function() {
        Wuaki.currentElement = this;
        this.display();
        this.status.enable = true;
        this.status.autoEnable = false;
        this.drawFooter();
        this.setup();
        Wuaki.hideLoading()
    };
    modalMenu.prototype.drawFooter = function() {
        Wuaki.elements["footerMenu"].div.addClass("white");
        Wuaki.elements["footerMenu"].drawLoginStatus(false);
        Wuaki.elements["footerMenu"].drawReturn();
        Wuaki.elements["footerMenu"].drawSelect();
        if (this.mode == "searchFilters" || this.mode == "preferences") Wuaki.elements["footerMenu"].drawNavigate();
        else if (this.mode == "playbackOptionsEpisodes" || this.mode == "playbackOptionsMovies") Wuaki.elements["footerMenu"].drawNavigateUpDown();
        else if (this.mode == "TermsAndConditions" || this.mode == "purchasing" || this.mode == "unPair") Wuaki.elements["footerMenu"].drawNavigateLeftRight();
        Wuaki.elements["footerMenu"].applyNewContent()
    };
    modalMenu.prototype.disable = function() {
        this.status.enable = false;
        this.hide()
    };
    modalMenu.prototype.display = function() {
        this.status.visible = true;
        this.div.css("left", "0px")
    };
    modalMenu.prototype.hide = function() {
        this.status.visible = false;
        this.div.css("left", "99999px")
    };
    modalMenu.prototype.reset = function() {};
    modalMenu.prototype.draw = function() {
        switch (this.mode) {
            case "playbackOptionsEpisodes":
            case "playbackOptionsMovies":
                this.drawplaybackOptions();
                break;
            case "searchFilters":
                this.drawSearchFilterOptions();
                break;
            case "message":
                this.drawMessage(Wuaki.language["continue"]);
                break;
            case "errorMessage":
                this.drawMessage(this.data.buttonText);
                break;
            case "TermsAndConditions":
                this.drawTermsAndConditions();
                break;
            case "purchasing":
                this.drawConfirm(this.data.buttonText);
                break;
            case "unPair":
                this.drawConfirm(Wuaki.language["Unpair"]);
                break;
            case "preferences":
                this.drawPreferences();
                break;
            case "exit":
                this.drawConfirm(this.data.buttonText);
                break;
            case "adult":
                this.drawConfirm(this.data.buttonText);
                break;
            case "resume":
                this.drawConfirm(this.data.buttonText);
                break;
            default:
                break
        }
        this.addMouseEvents()
    };
    modalMenu.prototype.addMouseEvents = function() {
        $(this.div).find("li").unbind().bind("mouseenter", this, function(event) {
            var element = event.data;
            var selector = $(this).parents().find("ul").attr("id");
            if (selector < element.carousels.length && element.carousels[selector].enable) {
                element.currentCarousel = Number(selector);
                element.selectCurrentCarousel(element);
                element.div.find(" li.lihover").removeClass("lihover");
                $(this).addClass("lihover");
                element.focusedOption = Number($(this).attr("jcarouselindex"))
            }
            if (Wuaki.currentElement.name != element.name) Wuaki.enableElementFromError(element.name)
        }).bind("mouseleave", this, function() {}).bind("click", this, function(event) {
            var element = event.data;
            element.selectCurrentOption()
        }).addClass("pointer")
    };
    modalMenu.prototype.drawPreferences = function() {
        var modalBox = this.div.find("#modal_box").removeClass().addClass(this.mode);
        modalBox.empty();
        $('<div><div class="centerTitle">' + this.data.modalTitle + "</div></div>").addClass(this.mode + "Title").addClass("fontModalTitle").appendTo(modalBox);
        $('<div class="modalContent">').appendTo(modalBox);
        this.drawCarousels(0, this.data.content);
        this.data.buttons = new Array;
        item = {
            id: -1,
            name: Wuaki.language["cancel"],
            action: function() {
                Wuaki.enableElement(_this.parentMenu)
            }
        };
        this.data.buttons.push(item);
        item = {
            id: -1,
            name: Wuaki.language["apply"],
            action: function() {
                _this.callbackDone(_this.output)
            }
        };
        this.data.buttons.push(item);
        this.drawCarouselButton(1, this.data.buttons)
    };
    modalMenu.prototype.drawConfirm = function(buttonString) {
        var titleImage = "";
        var modalBox = this.div.find("#modal_box").removeClass().addClass(this.mode);
        if ($(this.data.content).find(".message")[0]) modalBox.addClass("withMessage");
        modalBox.empty();
        if (typeof this.data.modalTitleImage != "undefined") titleImage = this.data.modalTitleImage;
        $('<div><div class="centerTitle">' + commonTools.truncateString(this.data.modalTitle, 30) + titleImage + "</div></div>").addClass(this.mode + "Title").addClass("fontModalTitle").appendTo(modalBox);
        $(this.data.content).addClass("fontModalContent").appendTo(modalBox);
        buttons = new Array;
        item = {
            id: -1,
            name: Wuaki.language["cancel"],
            action: function() {
                if (_this.mode == "adult" || _this.mode == "resume") _this.callbackDone(false);
                else Wuaki.enableElement(_this.parentMenu)
            }
        };
        buttons.push(item);
        item = {
            id: -1,
            name: buttonString,
            action: function() {
                _this.callbackDone(true)
            }
        };
        buttons.push(item);
        this.drawCarouselButton(0, buttons)
    };
    modalMenu.prototype.drawTermsAndConditions = function() {
        var modalBox = this.div.find("#modal_box").removeClass().addClass(this.mode);
        modalBox.empty();
        $('<div><div class="centerTitle">' + commonTools.truncateString(this.data.modalTitle, 30) + "</div></div>").addClass(this.mode + "Title").addClass("fontModalTitle").appendTo(modalBox);
        $(this.data.content).addClass("fontModalContent").appendTo(modalBox);
        buttons = new Array;
        item = {
            id: -1,
            name: '<img src="resources/images/blank.gif" class="scrollDown"/>' + Wuaki.language["down"],
            action: function() {
                _this.scrollDownContent()
            }
        };
        buttons.push(item);
        item = {
            id: -1,
            name: '<img src="resources/images/blank.gif" class="scrollUp"/>' + Wuaki.language["up"],
            action: function() {
                _this.scrollUpContent()
            }
        };
        buttons.push(item);
        item = {
            id: -1,
            name: Wuaki.language["cancel"],
            action: function() {
                Wuaki.enableElement(_this.parentMenu)
            }
        };
        buttons.push(item);
        item = {
            id: -1,
            name: Wuaki.language["iAccept"],
            action: function() {
                Wuaki.enableElement(_this.parentMenu);
                _this.callbackDone()
            }
        };
        buttons.push(item);
        this.drawCarouselButton(0, buttons);
        this.carousels[0].down = function() {
            _this.scrollDownContent()
        };
        this.carousels[0].up = function() {
            _this.scrollUpContent()
        };
        this.carousels[0].enable = true
    };
    modalMenu.prototype.scrollDownContent = function() {
        var contentBox = this.div.find(".contentBox");
        var content = this.div.find(".termsAndConditionsContent");
        var position = content.position().top;
        if (content.height() - contentBox.height() > -position - 30) content.css("top", position - 30 + "px")
    };
    modalMenu.prototype.scrollUpContent = function() {
        var contentBox = this.div.find(".contentBox");
        var content = this.div.find(".termsAndConditionsContent");
        var position = content.position().top;
        if (position < 0) content.css("top", position + 30 + "px")
    };
    modalMenu.prototype.drawMessage = function(buttonString) {
        var modalBox = this.div.find("#modal_box").removeClass().addClass(this.mode);
        modalBox.empty();
        $('<div><div class="centerTitle">' + commonTools.truncateString(this.data.modalTitle, 30) + "</div></div>").addClass(this.mode + "Title").addClass("fontModalTitle").appendTo(modalBox);
        $(this.data.content).addClass("fontModalContent").appendTo(modalBox);
        buttons = new Array;
        item = {
            id: -1,
            name: buttonString,
            action: function() {
                _this.callbackDone()
            }
        };
        buttons.push(item);
        this.drawCarouselButton(0, buttons)
    };
    modalMenu.prototype.purchasingProcessModal = function(a) {
        var type, titleText;
        var modalBox = this.div.find("#modal_box").removeClass().addClass(this.mode);
        modalBox.empty();
        this.id = "processingPurchaseRent";
        if (a) type = a;
        else if (this.data.isACoupon === true) type = this.data.couponData.coupon.coupon_campaign.purchase_type.type;
        else type = this.data.purchase_options[this.data.currentPurchasedOption].purchase_type.type;
        switch (type) {
            case "purchase":
                titleText = Wuaki.language["purchase"];
                break;
            case "rental":
                titleText = Wuaki.language["rental"];
                break;
            default:
                break
        }
        $('<div><div class="centerTitle">' + commonTools.truncateString(Wuaki.language["processingYour"] + " " + titleText, 30) + "</div></div>").addClass(this.mode + "Title").addClass("fontModalTitle").appendTo(modalBox);
        this.data.content = $('<div class="modalContent"><div class="processingPurchaseMicrowave"/><div class="processingPurchaseText">' + Wuaki.language["thisCanTake"] + "</div></div>");
        $(this.data.content).addClass("fontModalContent").appendTo(modalBox);
        $('<div class="loadingIcon"/><div class="waitAMoment">' + Wuaki.language["waitAMomentPlease"] + "</div>").appendTo(modalBox)
    };
    modalMenu.prototype.subscriptionProcessModal = function() {
        var type, titleText;
        var modalBox = this.div.find("#modal_box").removeClass().addClass(this.mode);
        modalBox.empty();
        this.id = "subscriptionProcessModal";
        $('<div><div class="centerTitle">' + commonTools.truncateString(Wuaki.language["processingYour"] + " " + Wuaki.language["subscription"], 30) + "</div></div>").addClass(this.mode + "Title").addClass("fontModalTitle").appendTo(modalBox);
        this.data.content = $('<div class="modalContent"><div class="processingPurchaseMicrowave"/><div class="processingPurchaseText">' + Wuaki.language["thisCanTake"] + "</div></div>");
        $(this.data.content).addClass("fontModalContent").appendTo(modalBox);
        $('<div class="loadingIcon"/><div class="waitAMoment">' + Wuaki.language["waitAMomentPlease"] + "</div>").appendTo(modalBox)
    };
    modalMenu.prototype.drawSearchFilterOptions = function() {
        var modalBox = this.div.find("#modal_box").removeClass().addClass(this.mode);
        modalBox.empty();
        $('<div><div class="centerTitle">' + Wuaki.language["searchFilters"] + "</div></div>").addClass(this.mode + "Title").addClass("fontModalTitle").appendTo(modalBox);
        $('<div class="modalContent">').appendTo(modalBox);
        var options = {
            content: new Array
        };
        this.data.unshift(options);
        var item = {
            id: -1,
            name: Wuaki.language["Movies"],
            action: function() {
                _this.carousels[_this.currentCarousel + 1].enable = true;
                $(_this.carousels[_this.currentCarousel + 1].modalCarousel.container[0]).removeClass("disableCarousel");
                _this.carousels[_this.currentCarousel + 1].modalCarousel.locked = false;
                _this.output[_this.currentCarousel] = this
            }
        };
        this.data[0].content.push(item);
        item = {
            id: -1,
            name: Wuaki.language["TVShows"],
            action: function() {
                _this.carousels[_this.currentCarousel + 1].enable = false;
                $(_this.carousels[_this.currentCarousel + 1].modalCarousel.container[0]).addClass("disableCarousel");
                _this.carousels[_this.currentCarousel + 1].modalCarousel.locked = true;
                _this.output[_this.currentCarousel] = this
            }
        };
        this.data[0].content.push(item);
        this.drawCarousels(0, this.data[0].content);
        item = {
            name: Wuaki.language["allQualities"]
        };
        this.data[1].video_qualities.unshift(item);
        this.drawCarousels(1, this.data[1].video_qualities);
        options = {
            buttons: new Array
        };
        item = {
            id: -1,
            name: Wuaki.language["cancel"],
            action: function() {
                Wuaki.enableElement(_this.parentMenu)
            }
        };
        options.buttons.push(item);
        item = {
            id: -1,
            name: Wuaki.language["applyFilters"],
            action: function() {
                _this.callbackDone(_this.output)
            }
        };
        options.buttons.push(item);
        this.data.push(options);
        this.drawCarouselButton(2, this.data[3].buttons)
    };
    modalMenu.prototype.drawCarouselButton = function(carouselNumber, data) {
        var modalBox = this.div.find("#modal_box");
        $('<div class="modalCarouselButtons"><ul class="jcarousel-skin-modal-buttons" id="' + carouselNumber + '"></ul></div>').appendTo(modalBox).addClass("fontMenuOptions");
        $("#" + carouselNumber).jcarousel({
            vertical: false,
            scroll: 1,
            animation: Wuaki.animation,
            itemFallbackDimension: 5e3
        });
        this.carousels[carouselNumber] = new Object;
        this.carousels[carouselNumber].modalCarousel = $("#" + carouselNumber).data("jcarousel");
        this.carousels[carouselNumber].left = function() {
            _this.prevOption()
        };
        this.carousels[carouselNumber].right = function() {
            _this.nextOption()
        };
        this.carousels[carouselNumber].up = function() {
            if (_this.currentCarousel > 0) _this.unfocusOption();
            _this.prevCarousel()
        };
        this.carousels[carouselNumber].down = function() {};
        this.carousels[carouselNumber].data = data;
        this.carousels[carouselNumber].enable = true;
        var text;
        var pos = 1;
        this.carousels[carouselNumber].modalCarousel.reset();
        this.carousels[carouselNumber].menuOptions = new Array;
        for (var i = 0; i < data.length; i++) {
            this.carousels[carouselNumber].modalCarousel.add(pos, '<div style="width: 100%; line-height: 60px;"><span>' + data[i].name + "</span></div>");
            if (typeof data[i].action == "undefined") {
                data[i].action = function() {
                    _this.output[_this.currentCarousel] = this
                }
            }
            this.carousels[carouselNumber].menuOptions[pos] = data[i];
            pos++
        }
        modalBox.find(".jcarousel-skin-modal-buttons .jcarousel-item").addClass(this.mode);
        modalBox.find(".modalCarouselButtons").css("width", (pos - 1) * 270 + "px");
        modalBox.find(".jcarousel-skin-modal-buttons .jcarousel-container").css("width", (pos - 1) * 270 + "px");
        modalBox.find(".jcarousel-skin-modal-buttons .jcarousel-clip").css("width", (pos - 1) * 270 + "px");
        this.carousels[carouselNumber].modalCarousel.options.size = pos - 1;
        this.carousels[carouselNumber].modalCarousel.reload()
    };
    modalMenu.prototype.drawCarousels = function(carouselNumber, data) {
        var modalBox = this.div.find("#modal_box .modalContent");
        var carouselDiv = $('<div class="modalCarousel-' + this.mode + '"><ul class="jcarousel-skin-modal-' + this.mode + '" id="' + carouselNumber + '"></ul></div>').appendTo(modalBox).addClass("fontMenuOptions");
        $("#" + carouselNumber).jcarousel({
            vertical: false,
            scroll: 1,
            animation: Wuaki.animation,
            itemFirstInCallback: function(jcarousel, element, index, state) {
                if (_this.status.ready) {
                    var selector = $(element).parents().find("ul").attr("id");
                    if (selector < _this.carousels.length && _this.carousels[selector] && _this.carousels[selector].enable) {
                        _this.currentCarousel = Number(selector);
                        _this.selectCurrentCarousel(element);
                        _this.focusOption(index);
                        _this.selectCurrentOption()
                    }
                }
            },
            itemFallbackDimension: 5e3
        });
        this.carousels[carouselNumber] = new Object;
        this.carousels[carouselNumber].modalCarousel = $("#" + carouselNumber).data("jcarousel");
        this.carousels[carouselNumber].left = function() {
            _this.prevOption();
            _this.selectCurrentOption()
        };
        this.carousels[carouselNumber].right = function() {
            _this.nextOption();
            _this.selectCurrentOption()
        };
        this.carousels[carouselNumber].up = function() {
            if (_this.currentCarousel > 0) _this.unfocusOption();
            _this.prevCarousel()
        };
        this.carousels[carouselNumber].down = function() {
            _this.unfocusOption();
            _this.nextCarousel()
        };
        this.carousels[carouselNumber].data = data;
        this.carousels[carouselNumber].enable = true;
        var text;
        var pos = 1;
        this.carousels[carouselNumber].menuOptions = new Array;
        for (var i = 0; i < data.length; i++) {
            var dataValue, style;
            if (typeof data[i].description != "undefined") {
                dataValue = data[i].description;
                style = 'style = "width: 100%; margin-top: 30px;"'
            } else {
                dataValue = data[i].name;
                style = 'style = "width: 100%; line-height: ' + carouselDiv.find(".jcarousel-item").height() + 'px;"'
            }
            this.carousels[carouselNumber].modalCarousel.add(pos, "<div " + style + "><span>" + dataValue + "</span></div>");
            if (typeof data[i].action == "undefined") {
                data[i].action = function() {
                    _this.output[_this.currentCarousel] = this
                }
            }
            this.carousels[carouselNumber].menuOptions[pos] = data[i];
            pos++
        }
        this.carousels[carouselNumber].modalCarousel.options.size = pos - 1;
        this.carousels[carouselNumber].modalCarousel.reload()
    };
    modalMenu.prototype.drawplaybackOptions = function() {
        var modalBox = this.div.find("#modal_box").removeClass().addClass(this.mode);
        modalBox.empty();
        $('<div><div class="centerTitle">' + commonTools.truncateString(this.data.modalTitle, 50) + "</div></div>").addClass(this.mode + "Title").addClass("fontModalTitle").appendTo(modalBox);
        $('<div><div class="centerTitle">' + Wuaki.language["setLanguageAndQuality"] + ":</div></div>").addClass(this.mode + "Content").addClass("fontModalContent").appendTo(modalBox);
        this.drawCarouselPlaybackOptions(0, this.data)
    };
    modalMenu.prototype.drawCarouselPlaybackOptions = function(carouselNumber, data) {
        var modalBox = this.div.find("#modal_box");
        $('<div class="modalCarousel"><ul class="jcarousel-skin-modal" id="' + carouselNumber + '"></ul></div>').appendTo(modalBox).addClass("fontMenuOptions");
        $("#" + carouselNumber).jcarousel({
            vertical: true,
            scroll: 1,
            animation: Wuaki.animation,
            itemFallbackDimension: 55
        });
        this.carousels[carouselNumber] = new Object;
        this.carousels[carouselNumber].modalCarousel = $("#" + carouselNumber).data("jcarousel");
        this.carousels[carouselNumber].menuOptions = new Array;
        this.carousels[carouselNumber].left = null;
        this.carousels[carouselNumber].right = null;
        this.carousels[carouselNumber].up = this.prevOption;
        this.carousels[carouselNumber].down = this.nextOption;
        this.carousels[carouselNumber].enable = true;
        var text;
        var pos = 1;
        this.reset();
        if (data.playback_settings == null || typeof data.playback_settings == "undefined") return pos;
        for (var i = 0; i < data.playback_settings.streams.length; i++) {
            if (this.data.playback_settings.streams[i].id == this.data.stream.id) {
                this.focusedOption = pos;
                text = Wuaki.language["continueIn"];
                this.actionPlaybackOptions(this.carousels[carouselNumber], pos, data, i, true)
            } else {
                Wuaki.elements["playerMenu"].resume = true;
                if (this.data.stream.id == "resume") text = Wuaki.language["ContinueWatching"];
                else if (this.data.stream.id == "start") {
                    text = Wuaki.language["PlayFromStart"];
                    Wuaki.elements["playerMenu"].resume = false
                } else text = Wuaki.language["startMovieIn"];
                this.actionPlaybackOptions(this.carousels[carouselNumber], pos, data, i, false)
            }
            this.carousels[carouselNumber].modalCarousel.add(pos, '<div class="rightmenuIconDiv"><div class="rightmenuIconPlay"/></div><div class="modalButtonText"><div style="width:80%;float:left;overflow:hidden;text-overflow:ellipsis;">' + text + " " + this.data.playback_settings.streams[i].language.name + "                                             " + this.data.playback_settings.streams[i].audio_quality.abbr + '                                             </div><div class="rightmenuContentIconPurchase' + this.data.playback_settings.streams[i].video_quality.abbr + '"/></div>');
            pos++
        }
        var height = (pos - 1) * 55 < 275 ? (pos - 1) * 55 : 330;
        this.div.find("modalCarousel").css("height", height + "px");
        this.div.find(".jcarousel-skin-modal .jcarousel-clip-vertical").css("height", height + "px");
        this.div.find(".jcarousel-skin-modal .jcarousel-container-vertical").css("height", height + "px");
        this.carousels[carouselNumber].modalCarousel.options.size = pos - 1;
        this.carousels[carouselNumber].modalCarousel.reload();
        this.selectCurrentCarousel(this);
        return pos
    };
    modalMenu.prototype.fill = function(data) {
        this.data = data;
        this.draw();
        this.setup()
    };
    modalMenu.prototype.config = function(id, name, parentMenu, mode, data, callbackFill, callbackDone) {
        if (this.id !== id) {
            Wuaki.showLoading();
            this.status.ready = false;
            this.status.autoEnable = false;
            this.id = id;
            this.parentMenu = parentMenu;
            this.data = data;
            this.name = name;
            this.mode = mode;
            this.pos = 1;
            this.focusedOption = 1;
            this.currentCarousel = 0;
            this.output = new Array;
            this.callbackDone = callbackDone;
            this.callbackFill = callbackFill;
            this.modalCarousel = new Object;
            this.callbackFill(this.data)
        } else {
            this.setup()
        }
    };
    modalMenu.prototype.setup = function() {
        this.unfocusOption();
        this.unSelectCurrentOption();
        switch (this.mode) {
            case "searchFilters":
                this.setupFiltersCarousel();
                break;
            case "preferences":
                this.setupPreferences();
                break;
            default:
                this.currentCarousel = 0;
                this.selectCurrentCarousel(this);
                break
        }
        this.status.ready = true;
        if (this.status.autoEnable) Wuaki.enableElementNoDisablePrevious(this.name)
    };
    modalMenu.prototype.setupFiltersCarousel = function() {
        var filters = Wuaki.elements["keyboard"].filters;
        for (var i = 0; i < this.carousels.length - 1; i++) {
            this.currentCarousel = i;
            this.selectCurrentCarousel(this);
            this.focusedOption = this.carousels[i].data.indexOf(filters[i]) + 1;
            if (this.focusedOption == 0) this.focusedOption = 1;
            this.focusCurrentOption(this);
            this.selectCurrentOption(this);
            this.carousels[i].modalCarousel.scroll(this.focusedOption);
            this.unfocusOption(this)
        }
        this.currentCarousel = 0;
        this.selectCurrentCarousel(this);
        this.focusCurrentOption(this)
    };
    modalMenu.prototype.setupPreferences = function() {
        this.currentCarousel = 0;
        this.selectCurrentCarousel(this);
        this.focusedOption = commonTools.arrayObjectIndexOf(this.carousels[0].data, this.data.currentValue.id, "id") + 1;
        if (this.focusedOption == 0) this.focusedOption = 1;
        this.focusCurrentOption(this);
        this.selectCurrentOption(this);
        this.carousels[0].modalCarousel.scroll(this.focusedOption)
    };
    modalMenu.prototype.actionPlaybackOptions = function(carousel, pos, data, i, noNewAction) {
        var item = new Object;
        if (!noNewAction) {
            item.id_stream = data.playback_settings.streams[i].id;
            item.id = data.id;
            item.data = data;
            var auth_token = "";
            if (Wuaki.statusLogged) {
                auth_token = Wuaki.user.data.authentication_token
            }
            item.action = function() {
                var mimeType = Wuaki.moviesStreamType;
                switch (_this.mode) {
                    case "playbackOptionsMovies":
                        ApiWuaki.gettingMovieStreams(item.id, item.id_stream, auth_token, function(requestId) {
                            if ("success" === ApiWuaki.getResult(requestId)) {
                                var stream = ApiWuaki.getData(requestId);
                                ApiWuaki.cleanRequest(requestId);
                                Wuaki.elements["playerMenu"].config("playerMenu" + JSON.stringify(item.id), "playerMenu", Wuaki.elements["playerMenu"].parentMenu, item.data, "movies");
                                Wuaki.elements["playerMenu"].fill(stream, item.id, mimeType);
                                Wuaki.enableElement("playerMenu")
                            } else {
                                var data = ApiWuaki.getError(requestId);
                                data.modalTitle = Wuaki.language["error"];
                                data.buttonText = Wuaki.language["ok"];
                                Wuaki.elements["modalMenu"].config("PlaybackGetStreamMessageError" + JSON.stringify(data), "modalMenu", _this.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                                    Wuaki.enableElement("playerMenu")
                                });
                                Wuaki.elements["modalMenu"].autoEnable()
                            }
                        });
                        break;
                    case "playbackOptionsEpisodes":
                        ApiWuaki.gettingEpisodeStreams(item.id, item.id_stream, auth_token, function(requestId) {
                            if ("success" === ApiWuaki.getResult(requestId)) {
                                var stream = ApiWuaki.getData(requestId);
                                ApiWuaki.cleanRequest(requestId);
                                Wuaki.elements["playerMenu"].config("playerMenu" + JSON.stringify(item.id), "playerMenu", Wuaki.elements["playerMenu"].parentMenu, item.data, "episodes");
                                Wuaki.elements["playerMenu"].fill(stream, item.id, mimeType);
                                Wuaki.enableElement("playerMenu")
                            } else {
                                var data = ApiWuaki.getError(requestId);
                                data.modalTitle = Wuaki.language["error"];
                                data.buttonText = Wuaki.language["ok"];
                                Wuaki.elements["modalMenu"].config("PlaybackGetStreamMessageError" + JSON.stringify(data), "modalMenu", _this.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                                    Wuaki.enableElement("playerMenu")
                                });
                                Wuaki.elements["modalMenu"].autoEnable()
                            }
                        });
                        break
                }
            }
        } else item.action = function() {
            Wuaki.enableElement("playerMenu");
            Wuaki.elements["playerMenu"].playProcess()
        };
        carousel.menuOptions[pos] = item
    };
    modalMenu.prototype.nav = function(keycode) {
        switch (keycode) {
            case VK_UP:
                if (this.carousels[this.currentCarousel].up) this.carousels[this.currentCarousel].up();
                break;
            case VK_DOWN:
                if (this.carousels[this.currentCarousel].down) this.carousels[this.currentCarousel].down();
                break;
            case VK_LEFT:
                if (this.carousels[this.currentCarousel].left) this.carousels[this.currentCarousel].left();
                break;
            case VK_RIGHT:
                if (this.carousels[this.currentCarousel].right) this.carousels[this.currentCarousel].right();
                break;
            case VK_BDR_ENTER:
            case VK_CROSS:
                this.selectCurrentOption();
                break;
            case VK_BDR_RETURN:
            case VK_CIRCLE:
            case Wuaki.FOOTER_BACK:
                Wuaki.enableElement(this.parentMenu);
                break;
            default:
                break
        }
    };
    modalMenu.prototype.recoverFocusAndActive = function() {
        _this.div.find("#" + _this.currentCarousel + " .jcarousel-item-" + _this.focusedOption).addClass("hover");
        _this.div.find("#" + _this.currentCarousel + " .jcarousel-item-" + _this.selectedOption).addClass("active")
    };
    modalMenu.prototype.focusOption = function(option) {
        var li_active = _this.div.find("#" + _this.currentCarousel + " li.lihover");
        li_active.removeClass("lihover");
        li_active = _this.div.find("#" + _this.currentCarousel + " .jcarousel-item-" + option);
        li_active.addClass("lihover");
        _this.focusedOption = option
    };
    modalMenu.prototype.focusCurrentOption = function() {
        _this.focusOption(_this.focusedOption)
    };
    modalMenu.prototype.unfocusOption = function() {
        var li_active = _this.div.find("#" + _this.currentCarousel + " li.lihover");
        li_active.removeClass("lihover")
    };
    modalMenu.prototype.unSelectCurrentOption = function() {
        var li_active = _this.div.find("#" + _this.currentCarousel + " li.active");
        li_active.removeClass("active")
    };
    modalMenu.prototype.selectCurrentOption = function() {
        _this.div.find("#" + _this.currentCarousel + " li.active").removeClass("active");
        _this.div.find("#" + _this.currentCarousel + " li.lihover").addClass("active");
        _this.selectedOption = _this.focusedOption;
        if (typeof _this.data == "object" && this.data.data && this.data.data["class"] && this.data.data["class"] == "Wuaki::Exceptions::SignedInUserRequiredException") {
            process.forceLogout()
        } else _this.carousels[_this.currentCarousel].menuOptions[_this.selectedOption].action()
    };
    modalMenu.prototype.nextOption = function() {
        if (_this.modalCarousel.animating) return;
        var nextElement = _this.div.find("#" + _this.currentCarousel + " li.lihover").next();
        if (nextElement.length && _this.focusedOption < _this.modalCarousel.options.size) {
            _this.div.find("#" + _this.currentCarousel + " li.lihover").removeClass("lihover");
            nextElement.addClass("lihover");
            _this.focusedOption = Number(nextElement.attr("jcarouselindex"));
            var last = _this.modalCarousel.last;
            if (_this.focusedOption >= last) _this.modalCarousel.next()
        }
    };
    modalMenu.prototype.prevOption = function() {
        if (_this.modalCarousel.animating) return;
        var prevElement = _this.div.find("#" + _this.currentCarousel + " li.lihover").prev();
        if (prevElement.length) {
            _this.div.find("#" + _this.currentCarousel + " li.lihover").removeClass("lihover");
            prevElement.addClass("lihover");
            _this.focusedOption = Number(prevElement.attr("jcarouselindex"));
            var first = _this.modalCarousel.first;
            if (_this.focusedOption <= first) _this.modalCarousel.prev()
        }
    };
    modalMenu.prototype.nextCarousel = function() {
        for (var selector = _this.currentCarousel + 1; selector < _this.carousels.length && _this.carousels[selector].enable == false; selector++);
        if (selector < _this.carousels.length && _this.carousels[selector].enable) {
            _this.currentCarousel = selector;
            _this.selectCurrentCarousel(_this)
        }
    };
    modalMenu.prototype.prevCarousel = function() {
        for (var selector = _this.currentCarousel - 1; selector >= 0 && _this.carousels[selector].enable == false; selector--);
        if (selector >= 0 && _this.carousels[selector].enable) {
            _this.currentCarousel = selector;
            _this.selectCurrentCarousel(_this)
        }
    };
    modalMenu.prototype.selectCurrentCarousel = function() {
        _this.modalCarousel.focusedOption = _this.focusedOption;
        _this.modalCarousel = _this.carousels[_this.currentCarousel].modalCarousel;
        _this.focusedOption = _this.modalCarousel.focusedOption;
        if (!_this.focusedOption) _this.focusedOption = 1;
        _this.focusCurrentOption(_this)
    }
}
var modalFillCallbacks = {
    playbackOptions: function(data) {
        data.modalTitle = data.title;
        Wuaki.elements["modalMenu"].fill(data)
    },
    pairingDone: function() {
        var data = new Object;
        data.modalTitle = Wuaki.language["welcome"] + " " + Wuaki.user.data.username + "!";
        data.content = '<div class="modalContent"><div class="pairingDoneIcon"/><div class="pairingDoneText">' + Wuaki.language["pairedSuccess"].replace("[username]", Wuaki.user.data.username) + "</div></div>";
        Wuaki.elements["modalMenu"].fill(data)
    },
    subscriptionDone: function() {
        var data = new Object;
        data.modalTitle = Wuaki.language["PlanPremium"];
        data.content = '<div class="modalContent"><div class="subscriptionDoneIcon"/><div class="pairingDoneText">' + Wuaki.language["subscriptionSuccess"] + "</div></div>";
        Wuaki.elements["modalMenu"].fill(data)
    },
    errorModal: function(data) {
        var modalData = new Object;
        modalData.data = data;
        modalData.modalTitle = data.modalTitle;
        modalData.buttonText = data.buttonText;
        modalData.content += '<div class="modalContent">';
        if (data.length > 0)
            for (var i = 0; i < data.length; i++) {
                var padding = (320 / data.length - 26) / 4;
                modalData.content += '<div style="padding-top:' + padding + "px; padding-bottom:" + padding + 'px;  width:90%; margin:0px auto;">' + data[i].message + "</div>"
            } else {
                modalData.content += '<div style="padding-top: 124px; width:90%; margin:0px auto;">' + data.message + "</div>"
            }
        modalData.content += "</div>";
        Wuaki.elements["modalMenu"].fill(modalData)
    },
    termsAndConditionsCoupon: function(data) {
        if (data.title) data.modalTitle = data.title;
        else data.modalTitle = Wuaki.language["termsAndConditions"];
        data.content = '<div class="modalContent"><div class="firstContentLine"><div class="confirmIcon"/><b>' + (data.printable_description ? data.printable_description : Wuaki.language["termsAndConditionsContentFirstLine"]) + '</b></div><div class="contentBox"><div class="termsAndConditionsContent">' + data.content_to_display + "</div></div></div>";
        Wuaki.elements["modalMenu"].fill(data)
    },
    termsAndConditions: function() {
        var data = new Object;
        data.modalTitle = Wuaki.language["termsAndConditions"];
        data.content = '<div class="modalContent"><div class="firstContentLine"><div class="confirmIcon"/><b>' + Wuaki.language["termsAndConditionsContentFirstLine"] + '</b></div><div class="contentBox"><div class="termsAndConditionsContent">' + Wuaki.language["termsAndConditionsContent"] + "</div></div></div>";
        Wuaki.elements["modalMenu"].fill(data)
    },
    termsAndConditionsSubscription: function(data) {
        data.modalTitle = Wuaki.language["termsAndConditions"];
        ApiWuaki.gettingSubscriptionDetail(data.subscription_plans[0].id, Wuaki.user.data.authentication_token, function(requestId) {
            if ("success" == ApiWuaki.getResult(requestId)) {
                data.subscriptionPolicy = ApiWuaki.getData(requestId);
                data.content = '<div class="modalContent"><div class="firstContentLine"><div class="confirmIcon"/><b>' + Wuaki.language["termsAndConditionsContentFirstLine"] + '</b></div><div class="contentBox"><div class="termsAndConditionsContent">' + data.subscriptionPolicy.price_policies[0].terms_and_conditions + "</div></div></div>";
                Wuaki.elements["modalMenu"].fill(data)
            } else {
                Wuaki.apiError(requestId)
            }
            ApiWuaki.cleanRequest(requestId)
        })
    },
    termsAndConditionsSubscriptionCoupon: function(data) {
        data.modalTitle = Wuaki.language["termsAndConditions"];
        data.content = '<div class="modalContent"><div class="firstContentLine"><div class="confirmIcon"/><b>' + Wuaki.language["termsAndConditionsContentFirstLine"] + '</b></div><div class="contentBox"><div class="termsAndConditionsContent">' + data.subscriptionPolicy.price_policies[0].terms_and_conditions + "</div></div></div>";
        Wuaki.elements["modalMenu"].fill(data)
    },
    unpairModal: function() {
        var data = new Object;
        data.modalTitle = Wuaki.language["unpairYourAccount"];
        data.content = '<div class="modalContent"><div class="pairingDoneIcon"/><div class="pairingDoneText">' + Wuaki.language["AreYouSureUnpair"] + "</div></div>";
        Wuaki.elements["modalMenu"].fill(data)
    },
    exit: function() {
        var data = new Object;
        data.modalTitle = Wuaki.language["Exit"];
        data.buttonText = Wuaki.language["Yes"];
        data.content += '<div class="modalContent"><div style="padding-top: 124px; width:90%; margin:0px auto;">' + Wuaki.language["AreYouSureExit"] + "</div></div>";
        Wuaki.elements["modalMenu"].fill(data)
    },
    adult: function() {
        var data = new Object;
        data.modalTitle = Wuaki.language["AdultContent"];
        var content = Wuaki.language["AdultContentText"];
        if (Wuaki.statusLogged) {
            data.buttonText = Wuaki.language["ok"]
        } else {
            data.buttonText = Wuaki.language["devicePairing"];
            content += "<br/>" + Wuaki.language["youNeedToBeRegistered"]
        }
        data.content += '<div class="modalContent"><div style="padding-top: 60px; width:90%; margin:0px auto;">' + content + "</div></div>";
        Wuaki.elements["modalMenu"].fill(data)
    },
    alreadySubscribed: function() {
        var data = new Object;
        data.modalTitle = Wuaki.language["message"];
        data.content = '<div class="modalContent"><div style="padding-top: 124px; width:90%; margin:0px auto;">' + Wuaki.language["alreadySubscribed"] + "</div></div>";
        Wuaki.elements["modalMenu"].fill(data)
    },
    notAllowedContent: function(message) {
        var data = new Object;
        data.modalTitle = Wuaki.language["notAvailable"];
        data.content = '<div class="modalContent"><div style="padding-top: 75px; width:90%; margin:0px auto;">' + message + "</div></div>";
        Wuaki.elements["modalMenu"].fill(data)
    },
    subscription: function(data) {
        data.modalTitle = Wuaki.language["youAreSubscribingTo"];
        data.buttonText = Wuaki.language["subscribe"];
        var subscriptionTitle, setupFees, permanence, trialPrice, invoicePeriod;
        subscriptionTitle = Wuaki.language["PlanPremium"] + '<br/><p style="font-size: 20px">' + data.subscriptionPolicy.price_policies[0].name + "</p>";
        if (data.subscriptionPolicy.price_policies[0].set_up_fee == 0) setupFees = Wuaki.language["noSetUpFees"];
        else {
            if (Wuaki.language["currency"] != "£") setupFees = Wuaki.language["setUpFees"] + " " + data.subscriptionPolicy.price_policies[0].set_up_fee + Wuaki.language["currency"];
            else setupFees = Wuaki.language["setUpFees"] + " " + Wuaki.language["currency"] + data.subscriptionPolicy.price_policies[0].set_up_fee
        }
        var months = data.subscriptionPolicy.price_policies[0].permanency_months;
        if (months == 0) permanence = Wuaki.language["noPermanenceAgreement"];
        else {
            permanence = Wuaki.language["PermanenceAgreement"] + " " + months;
            if (months > 1) permanence += " " + Wuaki.language["months"];
            else permanence += " " + Wuaki.language["month"]
        }
        trialPrice = data.subscriptionPolicy.price_policies[0].trial_num_months;
        if (trialPrice > 1) trialPrice += " " + Wuaki.language["months"];
        else trialPrice += " " + Wuaki.language["month"];
        switch (data.subscriptionPolicy.price_policies[0].invoicing_period) {
            case "monthly":
                invoicePeriod = Wuaki.language["fee"] + ": " + Wuaki.language["monthly"];
                break;
            case "anual":
                invoicePeriod = Wuaki.language["fee"] + ": " + Wuaki.language["annual"];
                break;
            default:
                invoicePeriod = Wuaki.language["fee"] + ": " + data.subscriptionPolicy.price_policies[0].invoicing_period;
                break
        }
        if (Wuaki.language["currency"] != "£") {
            trialPrice += " " + Wuaki.language["trial"] + '<br/><a class="modalPremiumPrice">' + data.subscriptionPolicy.price_policies[0].trial_fee + Wuaki.language["currency"] + "</a>";
            invoicePeriod += '<br/><a class="modalPremiumPrice">' + data.subscriptionPolicy.price_policies[0].fee + Wuaki.language["currency"] + "*</a>"
        } else {
            trialPrice += " " + Wuaki.language["trial"] + '<br/><a class="modalPremiumPrice">' + Wuaki.language["currency"] + data.subscriptionPolicy.price_policies[0].trial_fee + "</a>";
            invoicePeriod += '<br/><a class="modalPremiumPrice">' + Wuaki.language["currency"] + data.subscriptionPolicy.price_policies[0].fee + "*</a>"
        }
        var content = $("<div/>").addClass("modalContent");
        $('<div class="modalPremiumIcon"/>').appendTo(content);
        $('<div class="modalPremiumContentTitle">' + subscriptionTitle + "</div>").appendTo(content);
        if (data.subscriptionPolicy.price_policies[0].can_apply_for_trial) {
            $('<div class="modalPremiumPricesbox"><div class="modalPremiumTrialPrice">' + trialPrice + '</div><div class="modalPremiumInvoicePrice">' + invoicePeriod + "</div></div>").appendTo(content);
            $('<div class="modalPremiumContentExplanation">' + Wuaki.language["VATIncluded"] + ". " + setupFees + ". " + permanence + ". " + "</div>").appendTo(content)
        } else {
            $('<div class="modalPremiumPricesbox"><div class="modalPremiumInvoicePrice">' + invoicePeriod + '</div></div><div class="modalPremiumLockedTrial">' + Wuaki.language["VATIncluded"] + ". " + setupFees + ". " + permanence + ". " + "</div>").appendTo(content);
            $('<div class="modalPremiumContentExplanation">' + Wuaki.language["lockedTrial"] + "</div>").appendTo(content)
        }
        data.content = content;
        Wuaki.elements["modalMenu"].fill(data)
    },
    purchasingOrCouponModal: function(data) {
        var detailsTitle, expirationTimeType, expirationTime, priceText, definitionText, price, type, videoQuality;
        if (data.isACoupon === true) type = data.couponData.coupon.coupon_campaign.purchase_type.type;
        else type = data.purchase_options[data.currentPurchasedOption].purchase_type.type;
        switch (type) {
            case "purchase":
                data.buttonText = Wuaki.language["Purchase"];
                titleText = Wuaki.language["purchase"];
                detailsTitle = Wuaki.language["purchaseDetails"];
                expirationTimeType = Wuaki.language["purchase"];
                priceText = Wuaki.language["purchasePrice"];
                break;
            case "rental":
                data.buttonText = Wuaki.language["Rent"];
                titleText = Wuaki.language["rent"];
                detailsTitle = Wuaki.language["rentalDetails"];
                expirationTimeType = Wuaki.language["rental"];
                priceText = Wuaki.language["rentalPrice"];
                break;
            default:
                break
        }
        if (data.isACoupon === true) {
            price = data.couponData.price;
            expirationTime = data.couponData.coupon.coupon_campaign.purchase_type.expires_after;
            videoQuality = data.couponData.coupon.coupon_campaign.video_quality;
            data.modalTitle = Wuaki.language["courtesyOf"];
            data.modalTitleImage = '<img class="modalMessageTitleImage" src="' + data.couponData.coupon.coupon_campaign.redeeming_image["default"] + '"/>'
        } else {
            price = data.purchase_options[data.currentPurchasedOption].price;
            expirationTime = data.purchase_options[data.currentPurchasedOption].purchase_type.expires_after;
            videoQuality = data.purchase_options[data.currentPurchasedOption].video_quality;
            data.modalTitle = Wuaki.language["aboutTo"] + " " + titleText + "...";
            delete data.modalTitleImage
        }
        if (price == 0) price = Wuaki.language["free"];
        else {
            if (Wuaki.language["currency"] != "£") price += Wuaki.language["currency"];
            else price = Wuaki.language["currency"] + price
        }
        data.buttonText += " " + price;
        var content = $("<div/>").addClass("modalContent");
        $('<div class="purchaseItemTitle">' + commonTools.truncateString(data.title, 50) + '</div><div class="purchaseImage"/><div class="purchaseDetails"/>').appendTo(content);
        if (this.data.detailsMode == "episodes" && data.snapshots.length > 0) {
            $('<img class="purchaseModalSnapshot" src="' + data.snapshots[0].shot.web + '"/>').appendTo(content.find(".purchaseImage"))
        } else {
            $('<img class="purchaseModalArtwork" src="' + data.artwork.h200 + '"/>').css("background", 'url("resources/images/no-cover_modal.jpg") no-repeat').appendTo(content.find(".purchaseImage"))
        }
        $('<div class="purchaseModalDetailsTitle">' + detailsTitle + "</div>").appendTo(content.find(".purchaseDetails"));
        $('<div class="purchaseModalDetailsBox"/>').appendTo(content.find(".purchaseDetails"));
        var creditcard = Wuaki.user.data.credit_card;
        if (creditcard && creditcard.type === "PaymentMethod::Paypal") $('<div class="purchaseModalDetailsPrice"><div class="IconCreditCard"/><span class="detailsText">' + Wuaki.language["payingWithPaypal"] + "</span></div>").addClass("fontPurchaseDetails").appendTo(content.find(".purchaseModalDetailsBox"));
        else $('<div class="purchaseModalDetailsPrice"><div class="IconCreditCard"/><span class="detailsText">' + priceText + ": " + price + " " + Wuaki.language["inclVAT"] + "</span></div>").addClass("fontPurchaseDetails").appendTo(content.find(".purchaseModalDetailsBox"));
        if (videoQuality.abbr == "UHD") {
            definitionText = Wuaki.language["ultraHighDef"];
            content.append('<div class="message">' + Wuaki.language["UHDNotPlayable"] + "</div>")
        } else if (videoQuality.abbr == "SD") definitionText = Wuaki.language["standardDef"];
        else definitionText = Wuaki.language["highDef"];
        $('<div class="purchaseModalDetailsVideoQuality"><div class="Icon' + videoQuality.abbr + '"/><span class="detailsText">' + Wuaki.language["videoQuality"] + ": " + definitionText + "</span></div>").addClass("fontPurchaseDetails").appendTo(content.find(".purchaseModalDetailsBox"));
        if (expirationTime == null) expirationTime = Wuaki.language["noExpiration"];
        else expirationTime = Wuaki.language["expirationTime"] + ": " + expirationTime + "h " + expirationTimeType;
        $('<div class="purchaseModalDetailsExpirationTime"><div class="clockIcon"/><span class="detailsText">' + expirationTime + "</span></div>").addClass("fontPurchaseDetails").appendTo(content.find(".purchaseModalDetailsBox"));
        data.content = content;
        Wuaki.elements["modalMenu"].fill(data)
    },
    preferencesVideoQuality: function() {
        ApiWuaki.gettingVideoQualityList("", function(requestId) {
            if (ApiWuaki.getResult(requestId) != "success") {
                Wuaki.apiError(requestId);
                return
            }
            var data = new Array;
            data.content = ApiWuaki.getData(requestId).video_qualities;
            data.modalTitle = Wuaki.language["videoQuality"];
            data.currentValue = Wuaki.user.data.profile.video_quality;
            Wuaki.elements["modalMenu"].fill(data);
            ApiWuaki.cleanRequest(requestId)
        })
    },
    preferencesAudioQuality: function() {
        ApiWuaki.gettingAudioQualityList("", function(requestId) {
            if (ApiWuaki.getResult(requestId) != "success") {
                Wuaki.apiError(requestId);
                return
            }
            var data = new Array;
            data.content = ApiWuaki.getData(requestId).audio_qualities;
            data.modalTitle = Wuaki.language["audioQuality"];
            data.currentValue = Wuaki.user.data.profile.audio_quality;
            Wuaki.elements["modalMenu"].fill(data);
            ApiWuaki.cleanRequest(requestId)
        })
    },
    preferencesParentalControl: function() {
        ApiWuaki.listClassifications(function(requestId) {
            if (ApiWuaki.getResult(requestId) != "success") {
                Wuaki.apiError(requestId);
                return
            }
            var data = new Array;
            data.content = ApiWuaki.getData(requestId).classifications;
            data.modalTitle = Wuaki.language["parentalControl"];
            data.currentValue = Wuaki.user.data.profile.classification;
            Wuaki.elements["modalMenu"].fill(data);
            ApiWuaki.cleanRequest(requestId)
        })
    },
    preferencesAudioLanguages: function() {
        ApiWuaki.gettingLanguagesList(Wuaki.user.data.authentication_token, function(requestId) {
            if (ApiWuaki.getResult(requestId) != "success") {
                Wuaki.apiError(requestId);
                return
            }
            var data = new Array;
            data.content = ApiWuaki.getData(requestId).languages;
            data.modalTitle = Wuaki.language["audioLanguage"];
            data.currentValue = Wuaki.user.data.profile.language;
            Wuaki.elements["modalMenu"].fill(data);
            ApiWuaki.cleanRequest(requestId)
        })
    },
    filters: function() {
        var auth_token;
        if (Wuaki.statusLogged) {
            auth_token = '"' + Wuaki.user.data.authentication_token + '"'
        } else auth_token = '""';
        var apicalls = new Array;
        var data = new Array;
        var call = new Object;
        call.funcName = "ApiWuaki.gettingVideoQualityList";
        call.arguments = new Array;
        call.arguments.push(auth_token);
        apicalls.push(call);
        var call = new Object;
        call.funcName = "ApiWuaki.gettingVideoQualityList";
        call.arguments = new Array;
        call.arguments.push(auth_token);
        apicalls.push(call);
        var id = "SearchFilters";
        if (typeof Wuaki.requestList[id] === "undefined") {
            Wuaki.requestList[id] = new Object;
            Wuaki.requestList[id].mode = "queue";
            Wuaki.requestList[id].element = "keyboard";
            Wuaki.requestList[id].requestId = id;
            ApiWuaki.queue(id, apicalls, function(id) {
                if (Wuaki.checkAPIError(id, true)) return;
                modalFillCallbacks.concatData(id, data)
            });
            Wuaki.queueIdLifeTime(id)
        } else {
            modalFillCallbacks.concatData(id, data)
        }
    },
    concatData: function(id, data) {
        var data = new Array;
        data = data.concat(ApiWuaki.queueGetData(id, 0), ApiWuaki.queueGetData(id, 1));
        Wuaki.elements["modalMenu"].fill(data);
        Wuaki.elements["modalMenu"].setup()
    }
};

function playerMenu() {
    var div;
    var name, parentMenu;
    var status, visible;
    var timeline, refreshTimeline;
    var autoHideBarsTimeout, autoHideBarsTimeout, autoHideBarsTime;
    var playbackStatus;
    var data;
    var name;
    var speed, maxSpeed;
    var intervalFFRW;
    var intervalFFRWTime;
    var timeFFRW;
    var statusFFRW;
    var _this = this;
    var timelinePosition;
    var stateBeforeFForRW;
    var waitAfterFForRWTime;
    playerMenu.prototype.init = function(div, name) {
        this.name = name;
        this.div = div;
        this.autoHideBarsTime = 5e3;
        this.autoHideBarsTimeout = null;
        this.waitAfterFForRWTime = 2e3;
        this.timeline = new Object;
        this.status = new Object;
        this.status.enable = false;
        this.status.visible = false;
        this.status.ready = false;
        this.initialized = false;
        this.status.timelineModified = false;
        this.speed = 0;
        this.maxSpeed = 5;
        this.intervalFFRWTime = 500;
        this.intervalFFRW = null;
        this.timeFFRW = 60;
        this.statusFFRW = null;
        this.stateBeforeFForRW = "";
        this.recoverPlayerState = null;
        this.initPlayer();
        this.draw()
    };
    playerMenu.prototype.ready = function() {
        return this.status.ready
    };
    playerMenu.prototype.enable = function() {
        Wuaki.currentElement = this;
        this.display();
        this.autoHideBarsTimeout = setTimeout(this.hideBars, this.autoHideBarsTime);
        this.status.enable = true;
        this.drawFooter();
        if (this.mode == "trailer") TVA_GoogleAnalytics.analyticMark(TVA.device + "/Player", "Trailer/Source/" + this.data.title);
        else {
            try {
                TVA_GoogleAnalytics.analyticMark(TVA.device + "/Player", "Movie/Source/" + this.data.stream.language.abbr + "/" + this.data.stream.video_quality.abbr + "/" + this.data.title)
            } catch (e) {
                TVA_Rollbar.rollbar.log("GoogleAnalytics Exception: " + this.data.title)
            }
        }
    };
    playerMenu.prototype.drawFooter = function() {
        Wuaki.elements["footerMenu"].div.addClass("white");
        Wuaki.elements["footerMenu"].drawLoginStatus(false);
        Wuaki.elements["footerMenu"].drawReturn();
        if (this.mode != "trailer") Wuaki.elements["footerMenu"].drawOptions();
        Wuaki.elements["footerMenu"].drawFF();
        Wuaki.elements["footerMenu"].drawRW();
        Wuaki.elements["footerMenu"].drawStop();
        if (TVA.device == "ps3" || TVA.device == "ps4" || TVA.device == "orange" || TVA.device == "netgem") {
            if (TVA_Player.getState() == TVA_Player.state.playing) Wuaki.elements["footerMenu"].drawPause();
            else Wuaki.elements["footerMenu"].drawPlay()
        } else {
            Wuaki.elements["footerMenu"].drawPause();
            Wuaki.elements["footerMenu"].drawPlay()
        }
        Wuaki.elements["footerMenu"].applyNewContent()
    };
    playerMenu.prototype.disable = function() {
        this.status.enable = false;
        TVA_Player.stop();
        TVA_Player.hide();
        this.reset();
        Wuaki.elements["footerMenu"].removeFooterRight();
        this.hide();
        if (Wuaki.heartbeat) TVA_Heartbeat.removeConfig()
    };
    playerMenu.prototype.display = function() {
        this.status.visible = true;
        $("#wrapper").css("background-image", "");
        this.div.show()
    };
    playerMenu.prototype.hideBars = function() {
        var player = Wuaki.elements["playerMenu"];
        if (player.status.enable) {
            player.timeline.hide();
            player.playbackStatus.hide();
            var footer = Wuaki.elements["footerMenu"];
            footer.hide()
        }
    };
    playerMenu.prototype.showBars = function(timeout) {
        var player = Wuaki.elements["playerMenu"];
        if (player.status.enable) {
            clearTimeout(player.autoHideBarsTimeout);
            if (timeout) {
                player.autoHideBarsTimeout = setTimeout(player.hideBars, player.autoHideBarsTime)
            } else {
                clearInterval(player.autoHideBarsTimeout)
            }
            if (!player.timeline.is(":visible")) player.timeline.show();
            player.showStatus(TVA_Player.getState());
            if (!player.playbackStatus.is(":visible")) player.playbackStatus.show();
            player.drawFooter();
            Wuaki.elements["footerMenu"].display()
        }
    };
    playerMenu.prototype.showStatus = function(status) {
        if (this.speed == 0) this.playbackSpeedStatus.empty().hide();
        switch (status) {
            case TVA_Player.state.paused:
                if (this.speed == 0) this.playbackStatus.css("background-image", "url(resources/icons/screen_pause.png)");
                break;
            case TVA_Player.state.stopped:
            case TVA_Player.state.finished:
                if (this.speed == 0) this.playbackStatus.css("background-image", "");
                break;
            case TVA_Player.state.playing:
                if (this.speed == 0) this.playbackStatus.css("background-image", "url(resources/icons/screen_play.png)");
                break;
            case TVA_Player.state.buffering:
                break;
            case TVA_Player.state.connecting:
                break;
            case "rw":
                this.playbackStatus.css("background-image", "url(resources/icons/screen_rw.png)");
                break;
            case "ff":
                this.playbackStatus.css("background-image", "url(resources/icons/screen_ff.png)");
                break
        }
    };
    playerMenu.prototype.hide = function() {
        this.status.visible = false;
        $("#wrapper").css("background-image", "url(" + Wuaki.background + ")");
        this.div.hide()
    };
    playerMenu.prototype.reset = function() {
        this.timeline.barCurrentTime.css("width", 0 + "%");
        this.timeline.currentTime.text(this.formatTime(0));
        this.timeline.totalTime.text(this.formatTime(0));
        this.timelinePosition = 0;
        this.status.playCallback = this.status.stopCallback = this.status.pauseCallback = this.status.bufferCallback = this.status.connectCallback = this.status.errorCallback = this.status.finishCallback = null;
        clearInterval(this.intervalFFRW);
        clearTimeout(this.recoverPlayerState);
        clearInterval(this.autoHideBarsTimeout);
        this.status.playerReady = false;
        this.speed = 0;
        this.statusFFRW = null;
        this.status.timelineModified = false;
        this.stateBeforeFForRW = "";
        this.widevineSettings = "";
        this.hideBars()
    };
    playerMenu.prototype.draw = function() {
        this.drawTimeLine();
        this.drawPlaybackStatus();
        this.addMouseEvents()
    };
    playerMenu.prototype.addMouseEvents = function() {
        this.eventCounter = 0;
        this.div.unbind().bind("mousemove", this, function(event) {
            var player = event.data;
            player.eventCounter++;
            if (player.eventCounter >= 50) {
                player.showBars(true);
                player.eventCounter = 0
            }
        });
        this.div.find(".timelineBarTotalTime").unbind().bind("click", this, function(event) {
            var player = event.data;
            if (TVA_Player.getState() == TVA_Player.state.paused || TVA_Player.getState() == TVA_Player.state.playing) var time = Math.floor((event.pageX - $(this).offset().left) / $(this).width() * TVA_Player.getLength());
            player.storedTimelinePos = time;
            if (TVA.device != "lg") {
                time = time - TVA_Player.getCurrentTime();
                if (time >= 0) TVA_Player.forward(time);
                else TVA_Player.backward(-time)
            } else {
                TVA_Player.player.seek(time * 1e3)
            }
        }).addClass("pointer")
    };
    playerMenu.prototype.drawTimeLine = function() {
        this.timeline = $('<div id="timeline"></div>').appendTo(this.div).addClass("timeline");
        this.timeline.currentTime = $("<div>00:00:00</div>").appendTo(this.timeline).addClass("fontTimeline").addClass("timelineCurrentTime");
        this.timeline.totalTime = $("<div>00:00:00</div>").appendTo(this.timeline).addClass("fontTimeline").addClass("timelineTotalTime");
        this.timeline.barTotalTime = $("<div/>").appendTo(this.timeline).addClass("timelineBarTotalTime");
        this.timeline.barCurrentTime = $("<div/>").appendTo(this.timeline.barTotalTime).addClass("timelineBarCurrentTime")
    };
    playerMenu.prototype.drawPlaybackStatus = function() {
        this.playbackSpeedStatus = $('<div id="playbackStatusSpeed"></div>').appendTo(this.div);
        this.playbackStatus = $('<div id="playbackStatus"></div>').appendTo(this.div)
    };
    playerMenu.prototype.fill = function(stream, id, type, playbackTime) {
        Wuaki.showLoading();
        this.data.stream = stream;
        this.data.type = type;
        this.addMetadataAnalytics();
        if (type.MIMEType == "application/vnd.ms-sstr+xml" && (TVA.device == "ps3" || TVA.device == "ps4" || TVA.device == "orange")) {
            this.data.stream.stream_url = this.data.stream.stream_url.replace(/^https:\/\/(.*?)\//, "http://$1:1935/");
            if (TVA.device == "orange") {
                TVA_Player.setLicenseUri("")
            }
        } else if (type.drm == "widevine") {
            if (TVA.device == "samsung") stream.license_url += "&playbackmode=st";
            this.widevineSettings = {
                url: this.data.stream.stream_url,
                portalID: Wuaki.widevinePortalID,
                drmServerURL: stream.license_url,
                cadURL: Wuaki.cadWidevineURL
            };
            if (this.data.playbackTime) this.widevineSettings.startTime = Math.floor(this.data.playbackTime / 1e3)
        } else if (type.drm == "WMDRM10") {
            this.data.stream.stream_url = stream.license_url
        }
        if (TVA_Player.getState() == TVA_Player.state.paused) {
            this.status.stopCallback = function() {
                var player = Wuaki.elements["playerMenu"];
                TVA_Player.MIMEType = player.data.type.MIMEType;
                TVA_Player.setURL(player.data.stream.stream_url);
                TVA_Player.readyVideo();
                TVA_Player.show();
                player.status.playerReady = true;
                setTimeout(function() {
                    Wuaki.elements["playerMenu"].playProcess()
                }, 1e3)
            };
            TVA_Player.stop()
        } else {
            TVA_Player.MIMEType = this.data.type.MIMEType;
            TVA_Player.setURL(this.data.stream.stream_url);
            TVA_Player.readyVideo();
            TVA_Player.show();
            this.status.playerReady = true;
            this.playProcess()
        }
        this.status.ready = true
    };
    playerMenu.prototype.addMetadataAnalytics = function() {
        if (Wuaki.niceAnalytic) {
            var metadata = {
                filename: this.data.stream.stream_url,
                content_id: this.data.stream.id,
                content_metadata: {
                    title: typeof this.data.title != "undefined" ? this.mode.replace("movies", "[MV] ").replace("episodes", "[EP] ").replace("trailer", "[TR] ") + this.data.title : "undefined",
                    genre: typeof this.data.genres != "undefined" ? '"' + commonTools.getFieldFromObjectArray(this.data.genres, "name").join(", ") + '"' : "undefined",
                    language: typeof this.data.stream.language != "undefined" ? this.data.stream.language.name : "undefined",
                    year: typeof this.data.year != "undefined" ? this.data.year : "undefined",
                    cast: typeof this.data.actors != "undefined" ? '"' + commonTools.getFieldFromObjectArray(this.data.actors, "name").join(", ") + '"' : "undefined",
                    director: typeof this.data.directors != "undefined" ? '"' + commonTools.getFieldFromObjectArray(this.data.directors, "name").join(", ") + '"' : "undefined",
                    owner: "",
                    duration: typeof this.data.duration != "undefined" ? this.data.duration : "undefined",
                    parental: typeof this.data.classification != "undefined" ? this.data.classification.name : "undefined",
                    price: typeof this.data.lowest_price != "undefined" ? this.data.lowest_price : "undefined",
                    rating: typeof this.data.rating_average != "undefined" ? this.data.rating_average : "undefined",
                    audioType: typeof this.data.stream.audio_quality != "undefined" ? this.data.stream.audio_quality.name : "undefined",
                    audioChannels: typeof this.data.stream.audio_quality != "undefined" ? this.data.stream.audio_quality.name : "undefined"
                },
                transaction_type: typeof this.data.stream.transaction_key != "undefined" ? this.data.stream.transaction_key : "undefined",
                quality: typeof this.data.stream.video_quality != "undefined" ? this.data.stream.video_quality.name : "undefined",
                content_type: typeof this.data.purchase != "undefined" ? this.data.purchase.id : "undefined"
            };
            TVA_NiceAnalytics.setMetadata(metadata);
            if (typeof this.data.stream.transaction_key != "undefined") TVA_NiceAnalytics.setTransactionCode(this.data.stream.transaction_key);
            if (typeof Wuaki.user.data != "undefined" && Wuaki.user.data.id) TVA_NiceAnalytics.setUsername(Wuaki.user.data.id)
        }
        if (Wuaki.convivaAnalytic) {
            var metadata = {
                playerVersion: Wuaki.version,
                assetName: convivaMetadataManager.getAssetName(this.data, this.mode),
                viewerId: typeof Wuaki.user.data != "undefined" ? Wuaki.country + "-" + Wuaki.user.data.email : "not logged user",
                streamUrl: this.data.stream.stream_url,
                cdnName: convivaMetadataManager.getCDN(this.data),
                isLive: false,
                tags: {
                    accessType: convivaMetadataManager.getAssetType(this.data, this.mode),
                    contentId: this.data.id,
                    contentType: this.mode,
                    pubYear: typeof this.data.year != "undefined" ? this.data.year : "undefined",
                    rating: typeof this.data.rating_average != "undefined" ? this.data.rating_average : "undefined",
                    show: typeof this.data.title != "undefined" ? (this.mode == "trailer" ? "Trailer " : "") + this.data.title : "undefined",
                    streamQuality: typeof this.data.stream.video_quality != "undefined" ? this.data.stream.video_quality.name : "undefined",
                    audioQuality: typeof this.data.stream.audio_quality != "undefined" ? this.data.stream.audio_quality.abbr : "undefined",
                    language: typeof this.data.stream.language != "undefined" ? this.data.stream.language.name : "undefined",
                    streamProtocol: "HTTP Progressive",
                    videoType: this.mode == "trailer" ? "Trailer" : "Feature"
                }
            };
            TVA_Conviva.setSessionMetadata(metadata)
        }
        if (Wuaki.heartbeat) TVA_Heartbeat.config(this.data.stream)
    };
    playerMenu.prototype.config = function(id, name, parentMenu, data, mode) {
        if (this.id !== id || this.mode !== mode) {
            Wuaki.showLoading();
            this.status.ready = false;
            this.id = id;
            this.parentMenu = parentMenu;
            this.data = data;
            this.name = name;
            this.mode = mode
        }
        this.reset()
    };
    playerMenu.prototype.initPlayer = function() {
        if (!this.status.initialized) {
            TVA_Player.init({
                autoRecover: {
                    enable: true,
                    process: function() {
                        TVA_Player.readyVideo();
                        Wuaki.elements["playerMenu"].playProcess(TVA_Player.autoRecover.time)
                    }
                }
            });
            TVA_Player.setHeight(720);
            TVA_Player.setWidth(1280);
            TVA_Player.setXY(0, 0);
            TVA_Player.hide()
        }
        this.status.initialized = true
    };
    playerMenu.prototype.deinitPlayer = function() {
        if (this.status.initialized) TVA_Player.deinit();
        this.status.initialized = false
    };
    playerMenu.prototype.nav = function(keycode) {
        var timeout = true;
        switch (keycode) {
            case VK_UP:
                break;
            case VK_DOWN:
                break;
            case VK_LEFT:
                if (TVA.device == "sony") TVA_Player.backward(30);
                break;
            case VK_RIGHT:
                if (TVA.device == "sony") TVA_Player.forward(30);
                break;
            case VK_L1:
                this.backwardTimeline();
                clearTimeout(this.recoverPlayerState);
                this.recoverPlayerState = setTimeout(function() {
                    if (_this.stateBeforeFForRW == TVA_Player.state.playing) _this.playProcess();
                    _this.stateBeforeFForRW = "";
                    _this.recoverPlayerState = null
                }, this.waitAfterFForRWTime);
                break;
            case VK_R1:
                this.forwardTimeline();
                clearTimeout(this.recoverPlayerState);
                this.recoverPlayerState = setTimeout(function() {
                    if (_this.stateBeforeFForRW == TVA_Player.state.playing) _this.playProcess();
                    _this.stateBeforeFForRW = "";
                    _this.recoverPlayerState = null
                }, this.waitAfterFForRWTime);
                break;
            case VK_BDR_GREEN:
            case VK_TRIANGLE:
            case Wuaki.FOOTER_OPTIONS:
                if (this.mode != "trailer") {
                    timeout = false;
                    TVA_Player.pause(true);
                    if (this.mode == "episodes") {
                        Wuaki.elements["modalMenu"].config("playbackOptionsEpisodes" + this.data.id + this.data.stream.id, "modalMenu", this.name, "playbackOptionsEpisodes", this.data, modalFillCallbacks.playbackOptions, function() {})
                    } else {
                        Wuaki.elements["modalMenu"].config("playbackOptionsMovies" + this.data.id + this.data.stream.id, "modalMenu", this.name, "playbackOptionsMovies", this.data, modalFillCallbacks.playbackOptions, function() {})
                    }
                    Wuaki.elements["modalMenu"].autoEnable()
                }
                break;
            case VK_BDR_RETURN:
            case VK_CIRCLE:
            case Wuaki.FOOTER_BACK:
                timeout = false;
                this.disablePlayer();
                Wuaki.elements[this.parentMenu].fill(Wuaki.elements[this.parentMenu].detailsData, Wuaki.elements[this.parentMenu].id);
                Wuaki.elements[this.parentMenu].autoEnable();
                return;
                break;
            case VK_BDR_PLAY:
            case VK_CROSS:
            case Wuaki.FOOTER_PLAY:
                this.playProcess();
                break;
            case VK_BDR_RED:
                if (TVA.device != "netgem") break;
            case VK_BDR_STOP:
            case VK_SQUARE:
            case Wuaki.FOOTER_STOP:
                this.stopProcess(true);
                break;
            case VK_BDR_SCAN_BACK:
            case Wuaki.FOOTER_RW:
                timeout = false;
                this.backwardProcess();
                break;
            case VK_BDR_SCAN_FWD:
            case Wuaki.FOOTER_FF:
                timeout = false;
                this.forwardProcess();
                break;
            case VK_BDR_PAUSE:
            case Wuaki.FOOTER_PAUSE:
                this.pauseProcess();
                break;
            case VK_BDR_YELLOW:
            case Wuaki.customPairKey:
            case Wuaki.FOOTER_PAIR:
                break;
            default:
                break
        }
        this.showBars(timeout)
    };
    playerMenu.prototype.forwardTimeline = function(speed) {
        if (!this.status.playerReady) return;
        if (typeof speed == "undefined") var speed = 1;
        if (TVA_Player.getState() != TVA_Player.state.paused) {
            if (!this.stateBeforeFForRW) this.stateBeforeFForRW = TVA_Player.getState();
            TVA_Player.pause(true)
        }
        this.status.timelineModified = true;
        this.showStatus("ff");
        this.showBars(true);
        var skipTime = this.mode == "trailer" ? 2 : this.timeFFRW;
        this.timelinePosition += speed * skipTime;
        if (this.timelinePosition > TVA_Player.getLength()) {
            this.timelinePosition = TVA_Player.getLength() - 1;
            this.pauseProcess();
            this.showBars(true)
        }
        this.updateTimeDisplay(this.timelinePosition)
    };
    playerMenu.prototype.backwardTimeline = function(speed) {
        if (!this.status.playerReady) return;
        if (typeof speed == "undefined") var speed = 1;
        if (TVA_Player.getState() != TVA_Player.state.paused) {
            if (!this.stateBeforeFForRW) this.stateBeforeFForRW = TVA_Player.getState();
            TVA_Player.pause(true)
        }
        this.status.timelineModified = true;
        this.showStatus("rw");
        this.showBars(true);
        var skipTime = this.mode == "trailer" ? 2 : this.timeFFRW;
        this.timelinePosition -= speed * skipTime;
        if (this.timelinePosition < 0) {
            this.timelinePosition = TVA.device == "philips" ? 1 : 0;
            this.pauseProcess();
            this.showBars(true)
        }
        this.updateTimeDisplay(this.timelinePosition)
    };
    playerMenu.prototype.jumpToNewTimelinePos = function() {
        if (!this.status.playerReady) return;
        this.status.timelineModified = false;
        if (TVA.device == "lg") {
            this.storedTimelinePos = this.timelinePosition
        }
        if (this.timelinePosition > TVA_Player.getCurrentTime()) {
            TVA_Player.forward(this.timelinePosition - TVA_Player.getCurrentTime())
        } else if (this.timelinePosition < TVA_Player.getCurrentTime()) {
            TVA_Player.backward(TVA_Player.getCurrentTime() - this.timelinePosition)
        }
    };
    playerMenu.prototype.playProcess = function(startTime) {
        if (!this.status.playerReady) return;
        clearTimeout(this.recoverPlayerState);
        this.speed = 0;
        clearInterval(this.intervalFFRW);
        if (this.status.timelineModified && !TVA.device.match(/orange|netgem/i)) this.jumpToNewTimelinePos();
        if (TVA_Player.getState() == TVA_Player.state.paused || (TVA.device == "lg" || TVA.device == "philips" && !navigator.userAgent.match(/webkit/i)) && this.statusFFRW != null) {
            if (TVA.device == "lg" && this.statusFFRW != null && this.data.type.drm == "widevine") TVA_Player.player.play(2);
            TVA_Player.pause(false)
        } else if (TVA_Player.getState() == TVA_Player.state.playing) {
            TVA_Player.pause(true)
        } else if (TVA_Player.getState() != TVA_Player.state.buffering) {
            if (this.data.type.drm == "widevine") {
                if (startTime) this.widevineSettings.startTime = startTime;
                TVA_Widevine.playWidevine(this.widevineSettings);
                if (this.widevineSettings.startTime) this.widevineSettings.startTime = null
            } else if (this.data.type.drm == "playReady") {
                var options = {
                    url: this.data.stream.stream_url,
                    customData: this.data.stream.license_url
                };
                if (TVA.device == "philips") options.license = "http://drm.license.nice264.com/";
                if (this.data.stream.custom_data && this.data.stream.custom_data.length) {
                    options.license = this.data.stream.license_url;
                    options.customData = this.data.stream.custom_data
                }
                if (startTime) options.startTime = startTime;
                TVA_PlayReady.play(options)
            } else {
                var options = {};
                if (startTime) {
                    options.startTime = startTime;
                    TVA_Player.play(options)
                } else TVA_Player.play({})
            }
        }
        if (this.status.timelineModified && TVA.device.match(/orange|netgem/i)) this.jumpToNewTimelinePos();
        this.statusFFRW = null;
        this.drawFooter()
    };
    playerMenu.prototype.stopProcess = function(backToDetails) {
        if (!this.status.playerReady) return;
        this.speed = 0;
        this.statusFFRW = null;
        this.timelinePosition = 0;
        this.updateTimeDisplay(this.timelinePosition);
        clearInterval(this.intervalFFRW);
        TVA_Player.stop();
        if (backToDetails) {
            timeout = false;
            this.disablePlayer();
            Wuaki.elements[this.parentMenu].fill(Wuaki.elements[this.parentMenu].detailsData, Wuaki.elements[this.parentMenu].id);
            Wuaki.elements[this.parentMenu].autoEnable()
        }
    };
    playerMenu.prototype.pauseProcess = function() {
        if (!this.status.playerReady) return;
        TVA_Player.pause(true);
        this.speed = 0;
        clearInterval(this.intervalFFRW);
        this.drawFooter()
    };
    playerMenu.prototype.backwardProcess = function() {
        if (!this.status.playerReady || TVA_Player.getState() == TVA_Player.state.stopped || TVA_Player.getState() == TVA_Player.state.connecting) return;
        if (this.statusFFRW != "RW") {
            this.statusFFRW = "RW";
            this.speed = 0
        }
        if (this.speed < this.maxSpeed) this.speed++;
        clearInterval(this.intervalFFRW);
        this.playbackSpeedStatus.empty().text("X" + this.speed).show();
        if (TVA.device == "lg" && this.data.type.drm == "widevine") {
            if (this.mode == "trailer" && this.speed > 2) this.speed = 2;
            TVA_Player.pause(false);
            TVA_Player.player.play(-this.speed * this.speed * 5);
            this.showStatus("rw");
            return
        } else if (TVA.device == "philips" && !navigator.userAgent.match(/webkit/i)) {
            if (this.mode == "trailer" && this.speed > 2) this.speed = 2;
            if (TVA_Player.player.speed == 0) TVA_Player.player.play("1");
            TVA_Player.player.play((-1 * (this.speed + 1)).toString());
            this.showStatus("rw");
            return
        }
        this.intervalFFRW = setInterval(function() {
            _this.backwardTimeline(_this.speed)
        }, this.intervalFFRWTime)
    };
    playerMenu.prototype.forwardProcess = function() {
        if (!this.status.playerReady || TVA_Player.getState() == TVA_Player.state.stopped || TVA_Player.getState() == TVA_Player.state.connecting) return;
        if (this.statusFFRW != "FF") {
            this.statusFFRW = "FF";
            this.speed = 0
        }
        if (this.speed < this.maxSpeed) this.speed++;
        clearInterval(this.intervalFFRW);
        this.playbackSpeedStatus.empty().text("X" + this.speed).show();
        if (TVA.device == "lg" && this.data.type.drm == "widevine") {
            if (this.mode == "trailer" && this.speed > 2) this.speed = 2;
            TVA_Player.pause(false);
            TVA_Player.player.play(this.speed * this.speed * 5);
            this.showStatus("ff");
            return
        } else if (TVA.device == "philips" && !navigator.userAgent.match(/webkit/i)) {
            if (this.mode == "trailer" && this.speed > 2) this.speed = 2;
            if (TVA_Player.player.speed == 0) TVA_Player.player.play("1");
            TVA_Player.player.play((this.speed + 1).toString());
            this.showStatus("ff");
            return
        }
        this.intervalFFRW = setInterval(function() {
            _this.forwardTimeline(_this.speed)
        }, this.intervalFFRWTime)
    };
    playerMenu.prototype.updateTimeDisplay = function(time) {
        var currentTime;
        var duration = TVA_Player.getLength();
        if (typeof time != "undefined") {
            _this.timelinePosition = currentTime = time
        } else {
            _this.timelinePosition = currentTime = TVA_Player.getCurrentTime()
        }
        if (duration != Number.POSITIVE_INFINITY && duration != Number.NEGATIVE_INFINITY) {
            var proportion = currentTime * 100 / duration;
            _this.timeline.barCurrentTime.css("width", proportion + "%");
            if (currentTime >= 0) _this.timeline.currentTime.text(_this.formatTime(currentTime));
            if (duration >= 0) _this.timeline.totalTime.text(_this.formatTime(duration))
        }
        return currentTime
    };
    playerMenu.prototype.formatTime = function(seconds) {
        var seconds = Math.round(seconds);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        hours = hours >= 10 ? hours : "0" + hours;
        minutes = Math.floor(minutes % 60);
        minutes = minutes >= 10 ? minutes : "0" + minutes;
        seconds = Math.floor(seconds % 60);
        seconds = seconds >= 10 ? seconds : "0" + seconds;
        return hours + ":" + minutes + ":" + seconds
    };
    playerMenu.prototype.unfocusOption = function() {};
    playerMenu.prototype.focusOption = function() {};
    playerMenu.prototype.selectCurrentOption = function() {};
    playerMenu.prototype.selectOption = function(option) {};
    playerMenu.prototype.unselectOption = function(option) {};
    playerMenu.prototype.disablePlayer = function() {
        TVA_Player.stop();
        TVA_Player.hide();
        Wuaki.hideLoading()
    }
}

function playHeadChanged(seconds) {
    var player = Wuaki.elements["playerMenu"];
    if (player.status.timelineModified) return;
    if (TVA.device == "philips" && !navigator.userAgent.match(/webkit/i)) {
        if (Number(TVA_Player.player.speed) < 0 && seconds <= -7 * TVA_Player.player.speed - 12) {
            TVA_Player.player.stop();
            TVA_Player.player.play(1);
            seconds = 0;
            player.speed = 0;
            player.showStatus(TVA_Player.state.playing)
        }
        if (TVA_Player.getState() == TVA_Player.state.playing) {
            player.speed = Math.abs(TVA_Player.player.speed) - 1;
            if (player.speed < 0) player.speed = 0
        }
    }
    if (TVA.device == "lg") {
        if (player.data.type.drm == "widevine" && player.statusFFRW == "RW" && seconds == 0) {
            player.stopProcess(false);
            player.playProcess(1)
        }
        player.storedTimelinePos = player.timelinePosition
    }
    player.updateTimeDisplay(seconds);
    player.showStatus(TVA_Player.getState());
    Wuaki.hideLoading()
}

function playStateChanged(newState) {
    var player = Wuaki.elements["playerMenu"];
    switch (newState) {
        case TVA_Player.state.paused:
            if (typeof player.status.pauseCallback == "function") player.status.pauseCallback();
            player.status.pauseCallback = null;
            player.showBars(true);
            Wuaki.hideLoading();
            break;
        case TVA_Player.state.stopped:
            if (typeof player.status.stopCallback == "function") player.status.stopCallback();
            player.status.stopCallback = null;
            TVA_Player.hide();
            player.timelinePosition = 0;
            player.updateTimeDisplay(player.timelinePosition);
            player.showBars(false);
            Wuaki.hideLoading();
            break;
        case TVA_Player.state.playing:
            player.storedLength = TVA_Player.getLength();
            if (typeof player.status.playCallback == "function") player.status.playCallback();
            player.status.playCallback = null;
            if (!TVA_Player.active) TVA_Player.show();
            player.showBars(true);
            if (player.mode == "trailer") TVA_GoogleAnalytics.analyticMark(TVA.device + "/Player", "Trailer/Playing/" + player.data.title);
            else {
                try {
                    TVA_GoogleAnalytics.analyticMark(TVA.device + "/Player", "Movie/Playing/" + player.data.stream.language.abbr + "/" + player.data.stream.video_quality.abbr + "/" + player.data.title)
                } catch (e) {
                    TVA_Rollbar.rollbar.log("GoogleAnalytics Exception: " + player.data.title)
                }
            }
            break;
        case TVA_Player.state.buffering:
            if (typeof player.status.bufferCallback == "function") player.status.bufferCallback();
            player.status.bufferCallback = null;
            if (Wuaki.currentElement.name == "playerMenu") Wuaki.showLoading();
            break;
        case TVA_Player.state.connecting:
            if (typeof player.status.connectCallback == "function") player.status.connectCallback();
            player.status.connectCallback = null;
            if (Wuaki.currentElement.name == "playerMenu") Wuaki.showLoading();
            break;
        case TVA_Player.state.finished:
            if (TVA.device == "lg" && !(player.statusFFRW == "FF" && player.data.type.drm == "widevine") && player.storedTimelinePos < player.storedLength - 3) {
                TVA.log("LG false finished event!. Back to details aborted.");
                player.statusFFRW = null;
                if (player.data.type.drm != "widevine") TVA_Player.play({
                    startTime: player.storedTimelinePos
                });
                else player.playProcess(1);
                return
            }
            if (typeof player.status.finishCallback == "function") player.status.finishCallback();
            player.status.finishCallback = null;
            Wuaki.hideLoading();
            timeout = false;
            player.disablePlayer();
            Wuaki.enableElement(player.parentMenu);
            break;
        case TVA_Player.state.error:
            if (typeof player.status.errorCallback == "function") player.status.errorCallback();
            player.status.errorCallback = null;
            Wuaki.hideLoading();
            if (player.mode == "trailer") TVA_GoogleAnalytics.analyticMark(TVA.device + "/Player", "Trailer/Error/" + player.data.title);
            else {
                try {
                    TVA_GoogleAnalytics.analyticMark(TVA.device + "/Player", "Movie/Error/" + player.data.stream.language.abbr + "/" + player.data.stream.video_quality.abbr + "/" + player.data.title)
                } catch (e) {
                    TVA_Rollbar.rollbar.log("GoogleAnalytics Exception: " + player.data.title)
                }
            }
            break;
        default:
            Wuaki.hideLoading();
            break
    }
}

function playError() {
    if (Wuaki.elements["playerMenu"].status.enable == false) return;
    if (TVA.device == "sony" && TVA_Player.player.error != null && TVA_Player.player.error.code == 2) {
        var currentTime = TVA_Player.player.currentTime;
        TVA_Player.setURL(TVA_Player.player.currentSrc);
        TVA_Player.play({
            startTime: currentTime
        })
    } else {
        var data = new Object;
        data.message = Wuaki.language["playerError"];
        data.modalTitle = Wuaki.language["error"];
        data.buttonText = Wuaki.language["ok"];
        Wuaki.elements["modalMenu"].config("PlayerMessageError" + JSON.stringify(data), "modalMenu", "playerMenu", "errorMessage", data, modalFillCallbacks.errorModal, function() {
            Wuaki.disableElement("playerMenu");
            Wuaki.enableElement(Wuaki.elements["playerMenu"].parentMenu)
        });
        Wuaki.elements["modalMenu"].autoEnable()
    }
}
var convivaMetadataManager = {
    getAssetType: function(data, mode) {
        var accessType = "Free";
        if (data.purchase != undefined) {
            if (data.purchase.expires_at != null) {
                if (data.lowest_price.match(/[0-9]+/)) accessType = "Rent";
                else accessType = "Free"
            }
        } else if (mode == "trailer") accessType = "Free";
        else accessType = "EST";
        if (mode == "episodes") data = data.season;
        if (data.subscription_plans != undefined && data.subscription_plans[0].subscribed != false) accessType = "Subscriber";
        return accessType
    },
    getCDN: function(data) {
        var cdnName = "OTHER";
        if (data.stream.stream_url.indexOf("static-cdn.wuaki.tv") >= 0) {
            cdnName = "AKAMAI"
        }
        return cdnName
    },
    getAssetName: function(data, mode) {
        var assetName = "undefined";
        switch (mode) {
            case "episodes":
                if (typeof data.title != "undefined" && typeof data.season != "undefined") assetName = "[S:" + data.id + "- U:" + (Wuaki.user.data && Wuaki.user.data.id ? Wuaki.user.data.id : 0) + "] " + data.season.display_name + " - " + data.title;
                break;
            case "movies":
                if (typeof data.title != "undefined") assetName = "[S:" + data.id + "- U:" + (Wuaki.user.data && Wuaki.user.data.id ? Wuaki.user.data.id : 0) + "] " + data.title;
                break;
            case "trailer":
                if (typeof data.title != "undefined") assetName = "[S:" + data.id + "- U:" + (Wuaki.user.data && Wuaki.user.data.id ? Wuaki.user.data.id : 0) + "] Trailer " + data.title;
                break
        }
        return assetName
    }
};

function splashMenu() {
    var div;
    var name, parentMenu;
    var status;
    var mode;
    var focusedOption, selectedOption;
    var menuOptions;
    var data;
    var _this = this;
    splashMenu.prototype.init = function(div, name) {
        this.name = name;
        this.div = div;
        this.status = new Object;
        this.status.visible = false;
        this.status.enable = false;
        this.status.ready = false;
        this.menuOptions = new Array
    };
    splashMenu.prototype.ready = function() {
        return this.status.ready
    };
    splashMenu.prototype.autoEnable = function() {
        this.status.autoEnable = true;
        if (this.status.ready) Wuaki.enableElement(this.name)
    };
    splashMenu.prototype.enable = function() {
        Wuaki.currentElement = this;
        if (this.menuOptions.length > 0) this.focusCurrentOption();
        this.drawFooter();
        Wuaki.elements["keyboard"].hide();
        this.display();
        this.status.enable = true;
        Wuaki.hideLoading()
    };
    splashMenu.prototype.disable = function() {
        this.status.enable = false;
        this.hide()
    };
    splashMenu.prototype.display = function() {
        this.status.visible = true;
        this.div.show()
    };
    splashMenu.prototype.hide = function() {
        this.status.visible = false;
        this.div.hide()
    };
    splashMenu.prototype.reset = function() {};
    splashMenu.prototype.draw = function() {
        switch (this.mode) {
            case "splashLanding":
                this.drawLanding();
                break;
            case "splashPairing":
                this.drawPairing();
                break;
            case "splashCongrats":
                this.drawCongrats();
                break;
            case "splashCreditCard":
                this.drawCreditCard();
                break;
            case "splashMaintenance":
                this.drawMaintenance();
                break;
            case "splashNotAvailable":
                this.drawNotAvailable();
                break;
            default:
                break
        }
        this.addMouseEvents()
    };
    splashMenu.prototype.addMouseEvents = function() {
        this.div.find("[menuOption]").unbind().bind("mouseenter", this, function(event) {
            var element = event.data;
            element.unfocusOption();
            element.focusOption(Number($(this).attr("menuOption")));
            if (Wuaki.currentElement.name != element.name) Wuaki.enableElementFromError(element.name)
        }).bind("mouseleave", this, function() {}).bind("click", this, function(event) {
            var element = event.data;
            element.selectCurrentOption()
        }).addClass("pointer")
    };
    splashMenu.prototype.drawPairing = function() {
        this.div.empty();
        $('<div class="splashHeaderLogin"/>').append('<div class="splashWuakiLogoGlobalID"/>').append('<div class="splashRakutenLogoGlobalID"/>').appendTo(this.div);
        var title = $("<div>" + "</div>").addClass("splashTitle fontDetailsHeaderTitle " + this.mode).appendTo(this.div);
        var accountExplain = Wuaki.country == "GB" ? Wuaki.language["youNeedAnAccountExplain_UK"] : Wuaki.language["youNeedAnAccountExplain"];
        var wuakiRakutenAccount = Wuaki.country == "GB" ? Wuaki.language["wuakiRakutenAccount_UK"] : Wuaki.language["wuakiRakutenAccount"];
        $("<div>" + accountExplain + "</div>").addClass("splashExplanation fontDetailsGreyTitle " + this.mode).appendTo(title);
        this.menuOptions[0] = new Object;
        this.menuOptions[0].button = $('<div menuOption="0" ><div class="splashPairingIcon"/><div class="splashButtonText">' + Wuaki.language["devicePairing"] + '</div><div class="splashButtonSubText">' + wuakiRakutenAccount + "</div></div>").addClass("splashBigButton").css("float", "left");
        this.menuOptions[0].action = process.pairingDevice;
        this.menuOptions[1] = new Object;
        this.menuOptions[1].button = $('<div menuOption="1"><div class="splashAccountIcon"/><div class="splashButtonText">' + Wuaki.language["createAccount"] + '</div><div class="splashButtonSubText">' + Wuaki.language["noAccount"] + "</div></div>").addClass("splashBigButton").css("float", "right");
        this.menuOptions[1].action = process.createAccount;
        $("<div/>").append(this.menuOptions[0].button).append(this.menuOptions[1].button).addClass("splashPairingOptions " + this.mode).appendTo(this.div);
        $('<div class="disclaimerAboutLogin">' + Wuaki.language["disclaimerAboutLogin"] + "</div>").appendTo(this.div);
        $('<div class="moreInformationAboutLogin">' + Wuaki.language["moreInformationAboutLogin"] + "</div>").appendTo(this.div)
    };
    splashMenu.prototype.drawLanding = function() {
        this.div.empty();
        this.menuOptions[0] = new Object;
        this.menuOptions[0].button = $('<div menuOption="0"><div class="splashButton create">' + Wuaki.language["landingCreateAccount"] + "</div></div>");
        this.menuOptions[0].action = function() {
            Wuaki.processCaller = "mainMenu";
            Wuaki.proccessCallerKey = "dummy";
            process.createAccount()
        };
        this.menuOptions[1] = new Object;
        this.menuOptions[1].button = $('<div menuOption="1" ><div class="splashButton pairing">' + Wuaki.language["landingDevicePairing"] + "</div></div>");
        this.menuOptions[1].action = function() {
            Wuaki.processCaller = "mainMenu";
            Wuaki.proccessCallerKey = "dummy";
            process.pairingDevice()
        };
        $("<div/>").append(this.menuOptions[0].button).append(this.menuOptions[1].button).addClass("splashPairingOptions " + this.mode).appendTo(this.div)
    };
    splashMenu.prototype.drawCongrats = function() {
        this.div.empty();
        $('<div><div class="congratTitle">' + this.data.title1 + "<br/>" + this.data.title2 + '</div><div class="' + this.data.icon + '"/></div>').addClass("splashTitle fontDetailsHeaderTitle").appendTo(this.div);
        var congratBox = $('<div class="splashCongratBox"/>').appendTo(this.div);
        for (var i = 0; i < this.data.options.length; i++) {
            congratBox.append('<div class="splashCongratElement"><div class="Name">' + this.data.options[i].name + '</div><div class="Value">' + this.data.options[i].value + '</div><div class="Result' + this.data.options[i].result + '"/></div>')
        }
        this.menuOptions[0] = new Object;
        this.menuOptions[0].button = $('<div menuOption="0" class="splashButton">' + this.data.buttonText + "</div>");
        this.menuOptions[0].action = function() {
            _this.callbackDone(_this.data)
        };
        $("<div/>").append(this.menuOptions[0].button).addClass("splashOptions").appendTo(this.div)
    };
    splashMenu.prototype.drawCreditCard = function() {
        this.div.empty();
        $('<div class="creditCardIcon2"/>').appendTo(this.div);
        var title = $('<div style="margin-top:0px;">' + Wuaki.language["yourAccountNeedsCC"] + "</div>").addClass("splashTitle fontDetailsHeaderTitle").appendTo(this.div);
        $("<div>" + Wuaki.language["yourAccountNeedsCCExplanation"] + "</div>").addClass("splashExplanation fontDetailsGreyTitle").appendTo(title);
        var i = 0;
        var buttons = $("<div/>").addClass("splashPairingOptions").appendTo(this.div);
        if (!Wuaki.fromPurchase) {
            this.menuOptions[i] = new Object;
            this.menuOptions[i].button = $('<div menuOption="' + i + '" class="splashButton" style="display:inline-block; margin: 16px 10px;">' + Wuaki.language["skip"] + "</div>");
            this.menuOptions[i].action = function() {
                _this.callbackDone(_this.data)
            };
            buttons.append(this.menuOptions[i].button);
            i++
        }
        this.menuOptions[i] = new Object;
        this.menuOptions[i].button = $('<div menuOption="' + i + '" class="splashButton" style="display:inline-block; margin: 16px 10px;">' + Wuaki.language["addCreditCard"] + "</div>");
        this.menuOptions[i].action = process.creditCard;
        buttons.append(this.menuOptions[i].button)
    };
    splashMenu.prototype.drawMaintenance = function() {
        this.div.empty();
        this.div.css("background-image", "url(" + Wuaki.background + ")");
        $('<div class="logoBig"/>').appendTo(this.div);
        $('<div class="maintenanceTitle">' + Wuaki.language["wuakiMaintenance"] + "</div>").appendTo(this.div).addClass("fontDetailsHeaderTitle");
        $('<div class="maintenanceExlanation">' + Wuaki.language["wuakiMaintenanceExplanation"] + "</div>").appendTo(this.div).addClass("fontDetailsGreyTitle");
        $('<div class="splashRakutenLogo"/>').appendTo(this.div)
    };
    splashMenu.prototype.drawNotAvailable = function() {
        this.div.empty();
        this.div.css("background-image", "url(" + Wuaki.background + ")");
        $('<div class="logoBig"/>').appendTo(this.div);
        $('<div class="maintenanceTitle">' + Wuaki.language["notAvailable"] + "</div>").appendTo(this.div).addClass("fontDetailsHeaderTitle");
        $('<div class="maintenanceExlanation">' + this.data.message.en + "</div>").appendTo(this.div).addClass("fontDetailsGreyTitle");
        $('<div class="splashRakutenLogo"/>').appendTo(this.div)
    };
    splashMenu.prototype.config = function(id, name, parentMenu, mode, data, callbackFill, callbackDone) {
        if (this.id !== id) {
            Wuaki.showLoading();
            this.status.ready = false;
            this.status.autoEnable = false;
            this.id = id;
            this.parentMenu = parentMenu;
            this.data = data;
            this.name = name;
            this.mode = mode;
            this.focusedOption = 0;
            this.menuOptions = new Array;
            this.callbackFill = callbackFill;
            this.callbackDone = callbackDone;
            if (this.callbackFill != null) this.callBackFill();
            else this.draw()
        }
        this.status.ready = true;
        if (this.status.autoEnable) Wuaki.enableElement(this.name)
    };
    splashMenu.prototype.fill = function(data) {
        this.data = data;
        this.draw()
    };
    splashMenu.prototype.drawFooter = function() {
        if (Wuaki.background != "resources/images/1w_pixel_bg.jpg") Wuaki.elements["footerMenu"].div.removeClass("white");
        switch (this.mode) {
            case "splashPairing":
            case "splashCongrats":
            case "splashCreditCard":
                Wuaki.elements["footerMenu"].drawReturn();
                Wuaki.elements["footerMenu"].applyNewContent();
                break;
            case "splashLanding":
                Wuaki.elements["footerMenu"].div.addClass("white");
                if (!TVA.device.match(/ps3|ps4|psvita/i)) Wuaki.elements["footerMenu"].drawExit();
                if (Wuaki.landing && Wuaki.landing.skip) Wuaki.elements["footerMenu"].drawSkip();
                Wuaki.elements["footerMenu"].applyNewContent();
                break;
            case "splashMaintenance":
            case "splashNotAvailable":
            default:
                Wuaki.elements["footerMenu"].hide();
                break
        }
    };
    splashMenu.prototype.nav = function(keycode) {
        switch (keycode) {
            case VK_UP:
                if (this.mode === "splashLanding") this.prevOption();
                break;
            case VK_DOWN:
                if (this.mode === "splashLanding") this.nextOption();
                break;
            case VK_LEFT:
                if (this.mode !== "splashLanding") this.prevOption();
                break;
            case VK_RIGHT:
                if (this.mode !== "splashLanding") this.nextOption();
                break;
            case VK_BDR_ENTER:
            case VK_CROSS:
                this.selectCurrentOption();
                break;
            case VK_BDR_RETURN:
            case VK_CIRCLE:
            case Wuaki.FOOTER_BACK:
                if (this.mode == "splashLanding") process.exit(this);
                else Wuaki.enableElement(this.parentMenu);
                break;
            case VK_BDR_GREEN:
            case VK_TRIANGLE:
                if (this.mode == "splashLanding" && Wuaki.landing && Wuaki.landing.skip) $(".footerSkipIcon").click();
                break;
            default:
                break
        }
    };
    splashMenu.prototype.focusOption = function(option) {
        this.focusedOption = option;
        this.menuOptions[option].button.addClass("hover")
    };
    splashMenu.prototype.focusCurrentOption = function() {
        this.menuOptions[this.focusedOption].button.addClass("hover")
    };
    splashMenu.prototype.unfocusOption = function() {
        this.menuOptions[this.focusedOption].button.removeClass("hover")
    };
    splashMenu.prototype.selectCurrentOption = function() {
        this.menuOptions[this.focusedOption].action()
    };
    splashMenu.prototype.nextOption = function() {
        if (this.focusedOption + 1 < this.menuOptions.length) {
            this.unfocusOption();
            this.focusedOption++;
            this.focusCurrentOption()
        }
    };
    splashMenu.prototype.prevOption = function() {
        if (this.focusedOption - 1 >= 0) {
            this.unfocusOption();
            this.focusedOption--;
            this.focusCurrentOption()
        }
    }
}
var splashFillCallbacks = {
    accountDone: function(data) {
        if (Wuaki.globalID) data.icon = "shapeRakuten";
        else data.icon = "shapeWuaki";
        data.title1 = Wuaki.language["Congratulations"];
        data.title2 = Wuaki.language["yourAccountIsCreated"];
        data.buttonText = Wuaki.language["continue"];
        Wuaki.login(function() {
            var endProcess = function() {
                Wuaki.temporalPassword = Wuaki.pairing.password;
                Wuaki.elements["splashMenu"].config("splashCongrats" + JSON.stringify(data.options), "splashMenu", Wuaki.processCaller, "splashCongrats", data, null, process.preCreditCard);
                Wuaki.elements["splashMenu"].autoEnable()
            };
            if (Wuaki.homescreen) homescreenFillCallbacks.homescreen(Wuaki.elements.mainMenu.menuOptions[Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["Homescreen"])], $("#homescreen_banner0"), false, endProcess);
            else {
                Wuaki.dimissSplashLoadingScreen();
                endProcess()
            }
        })
    },
    passwordUpdate: function(data) {
        if (Wuaki.globalID) data.icon = "shapeRakuten";
        else data.icon = "shapeWuaki";
        data.title1 = Wuaki.language["Congratulations"];
        data.title2 = Wuaki.language["yourPasswordIsUpdated"];
        data.buttonText = Wuaki.language["continue"];
        Wuaki.login(function() {
            Wuaki.temporalPassword = Wuaki.pairing.password;
            Wuaki.elements["splashMenu"].config("splashCongrats" + JSON.stringify(data.options), "splashMenu", Wuaki.processCaller, "splashCongrats", data, null, function() {
                Wuaki.enableElement(this.parentMenu)
            });
            Wuaki.elements["splashMenu"].autoEnable()
        })
    },
    creditCardDone: function(data) {
        data.icon = "creditCardIcon";
        if (data.errors == true) {
            data.title1 = Wuaki.language["weAreSorry"];
            data.title2 = Wuaki.language["someDetailsWrong"];
            data.buttonText = Wuaki.language["fixIt"];
            Wuaki.elements["splashMenu"].config("splashCongrats" + JSON.stringify(data.options), "splashMenu", Wuaki.processCaller, "splashCongrats", data, null, function() {
                Wuaki.elements["splashMenu"].autoEnable();
                Wuaki.storedKeyboard = 0;
                Wuaki.keyboardRestoreConfig();
                Wuaki.enableElement("keyboard")
            });
            Wuaki.elements["splashMenu"].autoEnable()
        } else {
            data.title1 = Wuaki.language["wellDone"] + "!";
            data.title2 = Wuaki.language["yourCreditCardAdded"];
            data.buttonText = Wuaki.language["continue"];
            Wuaki.login(function() {
                Wuaki.elements["splashMenu"].config("splashCongrats" + JSON.stringify(data.options), "splashMenu", Wuaki.processCaller, "splashCongrats", data, null, function() {
                    Wuaki.login(function() {
                        Wuaki.backToProcessCaller()
                    })
                });
                Wuaki.elements["splashMenu"].autoEnable()
            })
        }
    }
};
var Wuaki = {
    version: "v2.5.9",
    currentElement: null,
    elements: null,
    GoogleAnalyticsId: "UA-22025146-18",
    languageFileURL: "resources/language/language",
    widevinePortalID: "wuaki",
    APIUrl: "https://api.wuaki.tv/",
    APITrianaUrl: "https://triana.wuaki.tv/",
    PayVaultUrl: "https://payvault.global.rakuten.com/api/pv/Card/V1/Add",
    cadWidevineURL: "http://54.194.157.63/philips-widevine.php",
    APIFileType: "json",
    APIDevice: TVA.device,
    user: null,
    requestList: null,
    blocked: false,
    processCaller: "",
    proccessCallerKey: "",
    SVOD: false,
    homescreen: false,
    LIFETIME: 6e5,
    defaultSubscriptionPlan: 1,
    dirName: "SonyWuakiTVAppStore",
    COOKIE_USERNAME: "wuaki_username",
    COOKIE_PASSWORD: "wuaki_password",
    COOKIE_TOKEN: "wuaki_token",
    COOKIE_ID: "wuaki_id",
    oldCookieRecoverList: [{
        oldCookie: "wuaki_philips_user_token",
        replaceCookie: "wuaki_token"
    }, {
        oldCookie: "wuaki_philips_user_id",
        replaceCookie: "wuaki_id"
    }, {
        oldCookie: "wuakitv_user",
        replaceCookie: ""
    }],
    samsungRecoveryDir: "",
    pairing: {
        email: null,
        password: null
    },
    storedConfigs: new Array,
    browsePlanPremium: false,
    temporalPassword: "",
    animation: 0,
    autoselectOption: true,
    defaultClassificationId: -1,
    gridTimeOutAnimation: 500,
    gridAnimationTime: 1e3,
    customPairKey: VK_START,
    customBrowserKey: VK_SELECT,
    customSubscribeKey: VK_TRIANGLE,
    customUnpairKey: VK_SELECT,
    purchaseNotAvailable: false,
    adultContent: false,
    asyncPurchase: true,
    niceAnalytic: false,
    convivaAnalytic: false,
    convivaCustomerKey: "8d598c91e2282ac6a68988a006358bcd2e5d52cc",
    heartbeat: true,
    globalID: true,
    moviesStreamType: {
        MIMEType: "application/vnd.ms-sstr+xml",
        drm: false
    },
    trailersStreamType: {
        MIMEType: "video/mp4",
        drm: false
    },
    background: "resources/images/background.jpg",
    isProcessedCallerKey: false,
    country: "",
    language: null,
    i18nResponse: null,
    statusLogged: false,
    FOOTER_PAIR: "footer_pair",
    FOOTER_UNPAIR: "footer_unpair",
    FOOTER_SEARCH: "footer_search",
    FOOTER_BACK: "footer_back",
    FOOTER_COUPON: "footer_coupon",
    FOOTER_SUBSCRIBE: "footer_subscribe",
    FOOTER_BROWSE: "footer_browse",
    FOOTER_DELETE: "footer_delete",
    FOOTER_CONTINUE: "footer_contnue",
    FOOTER_PLAY: "footer_play",
    FOOTER_STOP: "footer_stop",
    FOOTER_FF: "footer_ff",
    FOOTER_RW: "footer_rw",
    FOOTER_PAUSE: "footer_pause",
    FOOTER_OPTIONS: "footer_options",
    previousBlockingTime: null,
    TLSCheck: {
        TLSWarningCheck: false,
        TLSImageUrl: "https://ssl-test.wuaki.tv/logo.png",
        TLSWarningMessageExit: false
    },
    commingSoon: false,
    landing: false,
    preLoad: function() {
        Wuaki.onLoad()
    },
    recoverOldCookies: function() {
        if (TVA.device == "samsung") {
            if (Wuaki.samsungRecoveryDir === "") Wuaki.samsungRecoveryDir = curWidget.id;
            var fileSystemObj = new FileSystem;
            var bValid = fileSystemObj.isValidCommonPath(Wuaki.samsungRecoveryDir);
            if (!bValid) {
                return
            } else {
                var fileObj = fileSystemObj.openCommonFile(Wuaki.samsungRecoveryDir + "/WuakiTv.data", "a+");
                var readData = fileObj.readAll();
                fileSystemObj.closeFile(fileObj);
                if (readData) {
                    readData = String(readData);
                    readData = readData.split(";");
                    if (readData.length > 1) {
                        TVA_Storage.toFile(Wuaki.COOKIE_TOKEN, readData[1]);
                        TVA_Storage.toFile(Wuaki.COOKIE_ID, readData[0])
                    }
                    fileSystemObj.deleteCommonFile(Wuaki.samsungRecoveryDir + "/WuakiTv.data")
                } else {}
            }
        } else
            for (var counter = 0; counter < Wuaki.oldCookieRecoverList.length; counter++) {
                var oldCookieValue = false;
                var nameEQ = Wuaki.oldCookieRecoverList[counter].oldCookie + "=";
                var ca = document.cookie.split(";");
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == " ") c = c.substring(1, c.length);
                    if (c.indexOf(nameEQ) === 0) {
                        oldCookieValue = decodeURIComponent(c.substring(nameEQ.length, c.length))
                    }
                }
                if (oldCookieValue) {
                    var value = "";
                    var expires = "; expires=Thu, 01-Jan-1970 00:00:01 GMT";
                    document.cookie = nameEQ + value + expires + "; path=/";
                    if (TVA.device == "lg") {
                        oldCookieValue = JSON.parse(oldCookieValue);
                        TVA_Storage.toFile(Wuaki.COOKIE_TOKEN, oldCookieValue.authentication_token);
                        TVA_Storage.toFile(Wuaki.COOKIE_ID, oldCookieValue.id)
                    } else TVA_Storage.toFile(Wuaki.oldCookieRecoverList[counter].replaceCookie, oldCookieValue)
                }
            }
    },
    onLoad: function() {
        var _this = this;
        TVA_Storage.openStore(this.dirName);
        if (Wuaki.oldCookieRecoverList) Wuaki.recoverOldCookies();
        if (Wuaki.niceAnalytic) TVA_NiceAnalytics.init(Wuaki.niceAnalytic.user, Wuaki.niceAnalytic.server, Wuaki.niceAnalytic.pingTime, function() {}, Wuaki.niceAnalytic.https);
        if (Wuaki.convivaAnalytic) TVA_Conviva.init(Wuaki.convivaCustomerKey);
        if (Wuaki.heartbeat) TVA_Heartbeat.init({
            exceptionCallback: process.heartbeatException,
            beforePlayCallback: process.heartbeatResume,
            beatCallback: process.heartbeatBeatCallback,
            checkCallback: process.heartbeatCheckCallback
        });
        this.user = {};
        this.requestList = {};
        this.elements = {};
        $(document).ajaxStart(function() {});
        $(document).ajaxStop(function() {
            Wuaki.blocked = false
        });
        $(document).ajaxComplete(function(e, jqXHR, ajaxOptions) {
            if (ajaxOptions.blocking) Wuaki.blocked = false
        });
        $(document).ajaxError(function(event, request, settings, thrownError) {
            if (settings.blocking) Wuaki.blocked = false
        });
        this.avoidInfinityBlocking = window.setInterval(function() {
            var now = new Date;
            if (!Wuaki.previousBlockingTime) Wuaki.previousBlockingTime = now;
            if (now.getTime() - Wuaki.previousBlockingTime.getTime() > 3e4) {
                Wuaki.blocked = false;
                Wuaki.hideLoading()
            }
            if (!Wuaki.blocked) Wuaki.previousBlockingTime = now
        }, 5e3);
        $("#wrapper").css("background-image", "url(" + Wuaki.background + ")");
        Wuaki.preMainStructure();
        this.getSubscriptionPlans(function(result) {
            Wuaki.mainStructure();
            if (TVA.device == "ps3" || TVA.device == "ps4") TVA.WebMAF.isPsnPlusAccount(function(PSNPlus) {
                TVA.log("PSN Plus user " + PSNPlus);
                ApiWuaki.isPsnPlusAccount = PSNPlus
            });
            if (!Wuaki.i18nResponse.available) {
                Wuaki.elements["splashMenu"].config("splashNotAvailable", "splashMenu", "", "splashNotAvailable", Wuaki.i18nResponse, null, null);
                Wuaki.elements["splashMenu"].autoEnable()
            } else ApiWuaki.getAPIVersion(function(requestId) {
                var loginFunction = _this.login;
                if ("success" == ApiWuaki.getResult(requestId)) {
                    _this.enableElement("mainMenu");
                    if (TVA_Storage.fromFile(Wuaki.COOKIE_USERNAME) && TVA_Storage.fromFile(Wuaki.COOKIE_PASSWORD)) loginFunction = _this.repairPairing;
                    loginFunction(function() {
                        var auth_token = null;
                        if (Wuaki.statusLogged) auth_token = Wuaki.user.data.authentication_token;
                        var firmware = _this.getFirmware();
                        ApiWuaki.pairADevice(TVA.device, Wuaki.getDeviceId(), "start", (firmware ? firmware : "") + navigator.userAgent, auth_token, function(requestId) {});
                        deepLinking.checkDeeplinkingMode(_this.LoadConditions)
                    });
                    $("#footer").show()
                } else {
                    Wuaki.elements["splashMenu"].config("splashMaintenance", "splashMenu", "", "splashMaintenance", {}, null, null);
                    Wuaki.elements["splashMenu"].autoEnable()
                }
            })
        })
    },
    getFirmware: function() {
        var firmware = "Firmware Version: [##swVersion##] ";
        switch (TVA.device) {
            case "samsung":
                var nnaviPlugin = document.getElementById("pluginObjectNNavi");
                firmware = firmware.replace("##swVersion##", nnaviPlugin.GetFirmware());
                break;
            case "lg":
                firmware = firmware.replace("##swVersion##", TVA.deviceInfo.swVersion);
                break
        }
        return firmware
    },
    LoadConditions: function() {
        if (!Wuaki.landing || Wuaki.statusLogged) {
            Wuaki.elements["mainMenu"].selectCurrentOption();
            Wuaki.elements["gridMenu"].status.boot = true
        } else if (Wuaki.landing && !Wuaki.statusLogged) {
            var endProcess = function() {
                Wuaki.elements["splashMenu"].config("splashLanding", "splashMenu", "", "splashLanding", {}, null, null);
                Wuaki.elements["splashMenu"].autoEnable();
                Wuaki.elements["mainMenu"].status.boot = true
            };
            var zone = Wuaki.landing.zone.toLowerCase() + "_" + TVA.device.toLowerCase() + "_landing_top";
            ApiWuaki.getLandingBackground(zone, function(requestId) {
                if (ApiWuaki.getResult(requestId) === "success" && ApiWuaki.getData(requestId).status !== "failed") {
                    var data = ApiWuaki.getData(requestId);
                    if (TVA.device == "lg") data.response.display_source = data.response.display_source.replace(/^https/, "http");
                    Wuaki.dimissSplashLoadingScreen();
                    $("#splash").css({
                        "background-image": "url(" + data.response.display_source + ")"
                    });
                    endProcess()
                } else {
                    zone = Wuaki.landing.zone.toLowerCase() + "_mayfly_landing_top";
                    ApiWuaki.getLandingBackground(zone, function(requestId) {
                        if (ApiWuaki.getResult(requestId) === "success" && ApiWuaki.getData(requestId).status !== "failed") {
                            var data = ApiWuaki.getData(requestId);
                            if (TVA.device.match(/lg|samsung/i)) data.response.display_source = data.response.display_source.replace(/^https/, "http");
                            Wuaki.dimissSplashLoadingScreen();
                            $("#splash").css({
                                "background-image": "url(" + data.response.display_source + ")"
                            })
                        }
                        endProcess()
                    })
                }
            })
        }
    },
    checkTLS: function() {
        if (Wuaki.TLSCheck && Wuaki.TLSCheck.TLSWarningCheck) {
            Wuaki.TLSCheck.TLSWarningCheck = false;
            $("<img/>", {
                src: Wuaki.TLSCheck.TLSImageUrl
            }).error(function() {
                var data = {};
                var currentElementName = Wuaki.currentElement.name;
                data.modalTitle = Wuaki.language["message"];
                data.buttonText = Wuaki.TLSCheck.TLSWarningMessageExit ? Wuaki.language["Exit"] : Wuaki.language["ok"];
                data.message = Wuaki.language["TLSWarningMessage"];
                Wuaki.elements["modalMenu"].config("TLSWarning", "modalMenu", Wuaki.TLSCheck.TLSWarningMessageExit ? "modalMenu" : currentElementName, Wuaki.TLSCheck.TLSWarningMessageExit ? "errorMessage" : "message", data, modalFillCallbacks.errorModal, function(output) {
                    if (Wuaki.TLSCheck.TLSWarningMessageExit) TVA.quit();
                    else Wuaki.enableElement(currentElementName)
                });
                Wuaki.elements["modalMenu"].autoEnable();
                var y = (Wuaki.elements["modalMenu"].div.find(".modalContent").height() - Wuaki.elements["modalMenu"].div.find(".modalContent div").height()) / 2;
                Wuaki.elements["modalMenu"].div.find(".modalContent div").css({
                    "padding-top": y + "px"
                })
            })
        }
    },
    repairPairing: function(callback) {
        ApiWuaki.login(TVA_Storage.fromFile(Wuaki.COOKIE_USERNAME), TVA_Storage.fromFile(Wuaki.COOKIE_PASSWORD), function(requestId) {
            if ("success" === ApiWuaki.getResult(requestId)) {
                var data = ApiWuaki.getData(requestId);
                TVA_Storage.toFile(Wuaki.COOKIE_TOKEN, data.authentication_token);
                TVA_Storage.toFile(Wuaki.COOKIE_ID, data.id.toString())
            }
            TVA_Storage.deleteFile(Wuaki.COOKIE_USERNAME);
            TVA_Storage.deleteFile(Wuaki.COOKIE_PASSWORD);
            Wuaki.login(callback)
        })
    },
    unLoad: function() {
        Main.unload()
    },
    nav: function(keycode) {
        if (this.currentElement && this.currentElement.nav && (!$("#loading").is(":visible") || this.currentElement.name == "playerMenu") && (this.blocked === false || this.currentElement.name == "keyboard")) this.currentElement.nav(keycode)
    },
    getDeviceId: function() {
        if (TVA.device == "lg") {
            return TVA.getNativeDeviceId()
        } else return TVA.getDeviceId()
    },
    deviceConfig: function() {
        $("#version").text(Wuaki.version);
        switch (TVA.device) {
            case "psvita":
            case "ps3":
                Wuaki.customPairKey = VK_START;
                Wuaki.customBrowserKey = VK_SELECT;
                Wuaki.customUnpairKey = VK_SELECT;
                $("#wrapper").css("text-shadow", "0px 2px 2px rgba(0,0,0,.44)");
                break;
            case "ps4":
                Wuaki.customPairKey = 0;
                Wuaki.customBrowserKey = 0;
                Wuaki.customUnpairKey = VK_TRIANGLE;
                $("#wrapper").css("text-shadow", "0px 2px 2px rgba(0,0,0,.44)");
                break;
            case "orange":
                break;
            case "sony":
            case "operatv":
                break;
            case "samsung":
                if (TVA.year == "2011") {
                    Wuaki.background = "resources/images/1w_pixel_bg.jpg";
                    $("body").addClass("samsung_2011");
                    Wuaki.autoselectOption = false
                }
                break;
            case "lg":
                break;
            case "netgem":
                break;
            case "philips":
            case "philipsHTML5":
                $("#footer").addClass("white");
                var userAgentParse = navigator.userAgent.match(/NETTV\/([0-9])\./i);
                if (userAgentParse && userAgentParse.length > 1) Wuaki.versionNetTV = userAgentParse[1];
                break;
            case "toshiba":
                break;
            case "panasonic":
                break;
            case "foxxum":
            case "humax":
                break;
            case "vestel":
            case "vestelHTML5":
                break;
            default:
                break
        }
        $("body").addClass(TVA.device);
        if (Wuaki.SVOD) {
            $("body").addClass("SVOD");
            $("#version").append(" SVOD")
        }
    },
    apiError: function(requestId, queue) {
        var data;
        if (queue) data = ApiWuaki.queueGetError(requestId);
        else data = ApiWuaki.getError(requestId);
        if (typeof data != "object") data = {
            message: data
        };
        data.modalTitle = Wuaki.language["error"];
        data.buttonText = Wuaki.language["ok"];
        if (!data.message) data.message = Wuaki.language["apiError"];
        if (Wuaki.currentElement.name === "modalMenu") return;
        var currentElement = Wuaki.currentElement.name;
        Wuaki.elements["modalMenu"].config("ApiError" + requestId + JSON.stringify(data), "modalMenu", currentElement, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
            Wuaki.cleanAllRequest();
            Wuaki.enableElementFromError(currentElement)
        });
        Wuaki.elements["modalMenu"].autoEnable()
    },
    checkAPIError: function(id, queue) {
        if (queue && ApiWuaki.queueGetError(id) || !queue && ApiWuaki.getResult(id) != "success") {
            Wuaki.apiError(id, queue);
            return true
        }
        return false
    },
    enableElementFromError: function(element) {
        if (this.elements[element].ready()) {
            if (this.currentElement) this.currentElement.disable();
            this.elements[element].enable(true)
        }
    },
    enableElement: function(element) {
        if (this.elements[element].ready()) {
            if (this.currentElement) this.currentElement.disable();
            this.elements[element].enable();
            TVA_Rollbar.rollbar.configure({
                payload: {
                    context: "CurrentElement: " + Wuaki.currentElement.name
                }
            })
        }
    },
    disableElement: function(element) {
        this.elements[element].disable()
    },
    enableElementNoDisablePrevious: function(element) {
        if (this.elements[element].ready()) {
            if (this.currentElement) {
                this.currentElement.unfocusOption();
                this.currentElement.status.enable = false
            }
            this.elements[element].enable()
        }
    },
    backToProcessCaller: function() {
        if (typeof Wuaki.processCaller === "function") {
            Wuaki.processCaller();
            Wuaki.processCaller = "";
            return
        }
        this.enableElement(Wuaki.processCaller);
        Wuaki.processCaller = "";
        if (Wuaki.proccessCallerKey == "") Wuaki.currentElement.selectCurrentOption();
        else {
            var keycode = Wuaki.proccessCallerKey;
            Wuaki.proccessCallerKey = "";
            Wuaki.isProcessedCallerKey = true;
            Wuaki.currentElement.nav(keycode);
            Wuaki.isProcessedCallerKey = false
        }
    },
    dimissSplashLoadingScreen: function() {
        if (Wuaki.currentElement.name != "splashMenu") $("#splash").css("background-image", "url(" + Wuaki.background + ")").css("z-index", "200").hide();
        Wuaki.checkTLS()
    },
    login: function(callback) {
        this.user = new Object;
        this.user.data = new Object;
        var id = TVA_Storage.fromFile(Wuaki.COOKIE_ID);
        var token = TVA_Storage.fromFile(Wuaki.COOKIE_TOKEN);
        Wuaki.statusLogged = false;
        Wuaki.cleanAllRequest();
        if (!id || !token || id === "undefined" || token === "undefined") {
            Wuaki.configureRollbarPerson();
            callback();
            return
        }
        ApiWuaki.getUserData(id, token, function(requestId) {
            if ("success" === ApiWuaki.getResult(requestId)) {
                Wuaki.user.data = ApiWuaki.getData(requestId);
                if (Wuaki.user.data) {
                    Wuaki.statusLogged = true;
                    TVA_Storage.toFile(Wuaki.COOKIE_TOKEN, Wuaki.user.data.authentication_token);
                    TVA_Storage.toFile(Wuaki.COOKIE_ID, Wuaki.user.data.id.toString());
                    Wuaki.getUserSubscriptionPlan(callback);
                    Wuaki.configureRollbarPerson()
                } else {
                    var data = ApiWuaki.getError(requestId);
                    data.modalTitle = Wuaki.language["error"];
                    data.buttonText = Wuaki.language["ok"];
                    Wuaki.elements["modalMenu"].config("LoginMessageError" + JSON.stringify(data), "modalMenu", "mainMenu", "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                        callback()
                    });
                    Wuaki.elements["modalMenu"].autoEnable()
                }
            } else {
                callback()
            }
            ApiWuaki.cleanRequest(requestId)
        })
    },
    getUserSubscriptionPlan: function(callback) {
        if (Wuaki.statusLogged) {
            var data = Wuaki.user.data;
            var auth_token = data.authentication_token,
                id_user = data.id;
            ApiWuaki.gettingUserSubscription(id_user, auth_token, function(requestId) {
                if ("success" === ApiWuaki.getResult(requestId)) {
                    var menu = Wuaki.elements["mainMenu"];
                    var menuOptionName = menu.getOptionName(menu.selectedOption);
                    Wuaki.user.subscriptionPlan = new Object;
                    Wuaki.user.subscriptionPlan = ApiWuaki.getData(requestId);
                    menu.init($("#main_left_menu"), "mainMenu", mainMenuOptions.getOptions(), 1, 1);
                    if (menu.getOptionPos(menuOptionName) !== false) menu.selectedOption = menu.focusedOption = menu.getOptionPos(menuOptionName);
                    menu.menuElement.find("li#" + menu.name + menu.selectedOption).addClass("selected");
                    if (menu.div.hasClass("reduced")) menu.reduceMenu();
                    else menu.normalMenu();
                    if (typeof callback != "undefined") callback()
                } else {
                    Wuaki.elements["splashMenu"].config("splashMaintenance", "splashMenu", "", "splashMaintenance", {}, null, null);
                    Wuaki.elements["splashMenu"].autoEnable()
                }
                ApiWuaki.cleanRequest(requestId)
            })
        }
    },
    getSubscriptionPlans: function(callback) {
        ApiWuaki.gettingListAllSubscriptionsAvailable("", function(requestId) {
            if ("success" == ApiWuaki.getResult(requestId)) {
                Wuaki.subscriptionPlans = ApiWuaki.getData(requestId)["subscription_plans"];
                if (Wuaki.subscriptionPlans && Wuaki.subscriptionPlans.length) Wuaki.defaultSubscriptionPlan = Wuaki.subscriptionPlans[0].id;
                for (var property in Wuaki.language) {
                    if (Wuaki.language.hasOwnProperty(property)) {
                        if (typeof Wuaki.language[property] == "string") Wuaki.language[property] = commonTools.replacePlanName(Wuaki.language[property])
                    }
                }
                ApiWuaki.cleanRequest(requestId);
                callback()
            } else {
                Wuaki.elements["splashMenu"].config("splashMaintenance", "splashMenu", "", "splashMaintenance", {}, null, null);
                Wuaki.elements["splashMenu"].autoEnable()
            }
        })
    },
    isPremiumUser: function() {
        if (!Wuaki.browsePlanPremium && (!Wuaki.statusLogged || Wuaki.statusLogged && Wuaki.user.subscriptionPlan.subscriptions.length == 0)) return false;
        return true
    },
    showLoading: function() {
        $("#loading").show()
    },
    hideLoading: function() {
        $("#loading").hide()
    },
    mainStructure: function() {
        this.elements["mainMenu"] = new mainMenu;
        this.elements["mainMenu"].init($("#main_left_menu"), "mainMenu", mainMenuOptions.getOptions(), 1, 1);
        this.elements["subMenu"] = new subMenu;
        this.elements["subMenu"].init($("#main_left_submenu"), "subMenu", "mainMenu", 1, 1);
        this.elements["gridMenu"] = new gridMenu;
        this.elements["gridMenu"].init($("#main_content"), "gridMenu", "subMenu", 0, 0);
        this.elements["homescreenMenu"] = new homescreenMenu;
        this.elements["homescreenMenu"].init($("#main_homescreen"), "homescreenMenu", "mainMenu", 0, 0);
        this.elements["detailsMenu"] = new detailsMenu;
        this.elements["detailsMenu"].init($("#details"), "detailsMenu", "gridMenu", 0, 0);
        this.elements["playerMenu"] = new playerMenu;
        this.elements["playerMenu"].init($("#player"), "playerMenu");
        this.elements["modalMenu"] = new modalMenu;
        this.elements["modalMenu"].init($("#modal"), "modalMenu");
        this.elements["boxFormMenu"] = new boxFormMenu;
        this.elements["boxFormMenu"].init($("#main_box_form"), "boxFormMenu")
    },
    preMainStructure: function() {
        this.elements["keyboard"] = new keyboard;
        this.elements["keyboard"].init($("#keyboard"), "keyboard");
        this.elements["footerMenu"] = new footerMenu;
        this.elements["footerMenu"].init($("#footer"), "footerMenu");
        this.elements["splashMenu"] = new splashMenu;
        this.elements["splashMenu"].init($("#splash"), "splashMenu")
    },
    cleanRequest: function(id) {
        if (typeof Wuaki.requestList[id] == "undefined") return;
        if (Wuaki.requestList[id].mode == "queue") ApiWuaki.deleteQueue(id);
        else ApiWuaki.cleanRequest(Wuaki.requestList[id].requestId);
        delete Wuaki.requestList[id]
    },
    cleanAllRequestFromElement: function(element) {
        for (key in Wuaki.requestList) {
            if (this.requestList[key].element == element) {
                this.cleanRequest(key)
            }
        }
    },
    cleanAllRequest: function() {
        for (key in Wuaki.requestList) {
            this.cleanRequest(key)
        }
        for (key in Wuaki.elements) {
            this.elements[key].id = null
        }
    },
    requestIdLifeTime: function(id) {
        this.requestList[id].timeOut = setTimeout(function() {
            Wuaki.cleanRequest(id)
        }, this.LIFETIME)
    },
    queueIdLifeTime: function(id) {
        this.requestList[id].timeOut = setTimeout(function() {
            Wuaki.cleanRequest(id)
        }, this.LIFETIME)
    },
    isUserAccountAndDevicePairing: function() {
        if (Wuaki.statusLogged == false || TVA_Storage.fromFile(this.COOKIE_ID) == null || TVA_Storage.fromFile(this.COOKIE_TOKEN) == null || Wuaki.getDeviceId() == null) return false;
        else return true
    },
    keyboardRestoreConfig: function() {
        var config;
        config = Wuaki.storedConfigs["keyboard"][Wuaki.storedKeyboard];
        Wuaki.elements["keyboard"] = jQuery.extend(true, {}, config);
        Wuaki.elements["keyboard"].div.empty().append(config.cloneDiv);
        Wuaki.elements["keyboard"].addMouseEvents();
        Wuaki.elements["keyboard"].getCurrentElement();
        Wuaki.elements["keyboard"].status.ready = true;
        Wuaki.elements["keyboard"].configKeyboard();
        Wuaki.elements["keyboard"].autoEnable()
    },
    configureRollbarPerson: function() {
        if (typeof TVA_Rollbar === "undefined") return;
        try {
            TVA_Rollbar.rollbar.configure({
                payload: {
                    person: {
                        id: Wuaki.user.data && Wuaki.user.data.id ? Wuaki.user.data.id : -1,
                        username: Wuaki.user.data && (Wuaki.user.data.username || Wuaki.user.data.email) ? Wuaki.user.data.username || Wuaki.user.data.email : "notLoggedUser",
                        email: Wuaki.user.data && Wuaki.user.data.email ? Wuaki.user.data.email : "notLoggedUser@example.com"
                    }
                }
            })
        } catch (e) {
            TVA_Rollbar.rollbar.error("Not possible to configure Rollbar person data.")
        }
    }
};
var commonTools = {
    setupWuakiLanguage: function() {
        Wuaki.deviceConfig();
        ApiWuaki.init(Wuaki.APIUrl, Wuaki.PayVaultUrl, Wuaki.APIFileType, Wuaki.APIDevice);
        ApiWuaki.getAPICountry(function(requestId) {
            if ("success" == ApiWuaki.getResult(requestId)) {
                commonTools.i18nManagement(ApiWuaki.getData(requestId))
            } else {
                ApiWuaki.get404(function(requestId) {
                    if ("success" == ApiWuaki.getResult(requestId)) {
                        commonTools.i18nManagement(ApiWuaki.getData(requestId))
                    } else commonTools.i18nManagement({
                        geoip: {
                            country: "ES",
                            language: "es_ES",
                            available: true
                        }
                    })
                })
            }
        })
    },
    i18nManagement: function(response) {
        if (Wuaki.landing && !Wuaki.landing.zone) Wuaki.landing.zone = response.geoip.country;
        switch (response.geoip.country) {
            case "UK":
            case "GB":
            case "GG":
            case "IM":
            case "JE":
                response.geoip.country = "GB";
                TVA.setNetworkPopupLang("en");
                break;
            case "ES":
            case "AD":
                response.geoip.country = "ES";
                TVA.setNetworkPopupLang("es");
                break;
            case "IE":
                TVA.setNetworkPopupLang("en");
                break;
            case "TR":
                TVA.setNetworkPopupLang("tr");
                break;
            case "PT":
                TVA.setNetworkPopupLang("pt");
                break;
            case "IT":
                TVA.setNetworkPopupLang("it");
                break;
            case "FR":
            case "MC":
                TVA.setNetworkPopupLang("fr");
                response.geoip.country = "FR";
                break;
            case "DE":
            case "AT":
                TVA.setNetworkPopupLang("de");
                break;
            default:
                if (response && response.geoip && response.geoip.language) TVA.setNetworkPopupLang(response.geoip.language.split("_")[0]);
                else TVA.setNetworkPopupLang("en");
                break
        }
        if (Wuaki.countryConfig && typeof Wuaki.countryConfig[response.geoip.country] == "object") $.extend(Wuaki, Wuaki.countryConfig[response.geoip.country]);
        if (Wuaki.commingSoon) {
            $("#splash").css({
                background: "url(" + Wuaki.commingSoon.imageURL + "), url(resources/images/commingSoon.jpg)"
            });
            return
        }
        ApiWuaki.setService(response);
        ApiWuaki.getLanguageStrings(response.geoip.language, function(requestId) {
            if ("success" === ApiWuaki.getResult(requestId)) {
                Wuaki.language = ApiWuaki.getData(requestId);
                commonTools.applyLanguageAndContinue(response)
            } else ApiWuaki.getLanguageStrings(response.geoip.language.split("_")[0], function(requestId) {
                if ("success" === ApiWuaki.getResult(requestId)) {
                    Wuaki.language = ApiWuaki.getData(requestId);
                    commonTools.applyLanguageAndContinue(response)
                } else {
                    Wuaki.elements["splashMenu"].config("splashNotAvailable", "splashMenu", "", "splashNotAvailable", Wuaki.i18nResponse, null, null);
                    Wuaki.elements["splashMenu"].autoEnable()
                }
            })
        })
    },
    applyLanguageAndContinue: function(response) {
        $("body").addClass(response.geoip.country);
        Wuaki.country = response.geoip.country;
        Wuaki.i18nResponse = response.geoip;
        ApiWuaki.getHomescreenID("", function(requestId) {
            if (ApiWuaki.getResult(requestId) == "success") {
                var data = ApiWuaki.getData(requestId);
                if ($.isArray(data.menus) && data.menus.length > 0 && $.isArray(data.menus[0].choices) && data.menus[0].choices.length > 0) {
                    Wuaki.homescreen = true;
                    Wuaki.language["Homescreen"] = data.menus[0].choices[0].name || Wuaki.language["Homescreen"]
                }
            }
            Wuaki.preLoad()
        });
        TVA_GoogleAnalytics.analyticMark(TVA.device + "/language", response.geoip.language)
    },
    replacePlanName: function(string) {
        if (Wuaki && Wuaki.subscriptionPlans && Wuaki.subscriptionPlans.length > 0 && Wuaki.subscriptionPlans[0].name) return string.replace(/\[##PlanName##\]/g, Wuaki.subscriptionPlans[0].name);
        else return string
    },
    loadJS: function(url, loaded) {
        var scr = document.createElement("script");
        scr.type = "text/javascript";
        scr.src = url;
        scr.onload = loaded;
        document.getElementsByTagName("head")[0].appendChild(scr)
    },
    truncateString: function(text, maxsize) {
        var truncatedText;
        if (text.length >= maxsize) {
            truncatedText = text.substring(0, maxsize) + "..."
        } else truncatedText = text;
        return truncatedText
    },
    getFieldFromObjectArray: function(object, field) {
        var newArray = new Array;
        for (var i = 0; i < object.length; i++) newArray.push(object[i][field]);
        return newArray
    },
    addActionTransitionToObjectArray: function(data, action, transition) {
        for (var i = 0; i < data.length; i++) {
            if (typeof data[i].action == "undefined") data[i].action = action;
            if (typeof data[i].transition == "undefined") data[i].transition = transition
        }
        return data
    },
    cloneDiv: function(div, parentName) {
        var cloneDiv = div.clone();
        cloneDiv.attr("id", cloneDiv.attr("id") + "_clone");
        cloneDiv.find("[id]").each(function() {
            var $th = $(this);
            var newID = $th.attr("id") + "_clone";
            $th.attr("id", newID)
        });
        cloneDiv.appendTo(parentName);
        return cloneDiv
    },
    arrayObjectIndexOf: function(myArray, searchTerm, property) {
        for (var i = 0, len = myArray.length; i < len; i++) {
            if (typeof myArray[i][property] != "undefined" && myArray[i][property] === searchTerm) return i
        }
        return -1
    },
    removeAdultFromList: function(myArray) {
        var index = 0;
        while (-1 !== (index = this.arrayObjectIndexOf(myArray, true, "adult"))) {
            myArray.splice(index, 1)
        }
        while (-1 !== (index = this.arrayObjectIndexOf(myArray, "Erótico", "name"))) {
            myArray.splice(index, 1)
        }
        while (-1 !== (index = this.arrayObjectIndexOf(myArray, "Erotic", "name"))) {
            myArray.splice(index, 1)
        }
        return myArray
    },
    removePurchaseOptions: function(myArray) {
        var index = 0;
        for (var i = 0, len = myArray.length; i < len; i++) {
            if (typeof myArray[i].purchase_type != "undefined" && myArray[i].purchase_type.type === "purchase") {
                myArray.splice(i, 1);
                len = myArray.length;
                i--
            }
        }
        return myArray
    },
    imgError: function(image) {
        image.onerror = "";
        image.src = "resources/images/blank.gif";
        return true
    },
    LGOverlappingIssue: function(apply) {
        if (apply) {
            $("#main:visible").addClass("wasVisible").hide();
            $("#details:visible").addClass("wasVisible").hide()
        } else {
            $(".wasVisible").removeClass("wasVisible").show()
        }
    },
    checkProviderList: function(id) {
        if (providerList[TVA.device] && providerList[TVA.device].indexOf(id) !== -1) return true;
        else return false
    }
};
var process = {
    pairingDevice: function() {
        var pairing = new Object;
        var currentElement = Wuaki.currentElement;
        Wuaki.elements["keyboard"].reset();
        Wuaki.elements["keyboard"].config("keyboardPairing1", this, "splashMenu", 7, "email", Wuaki.elements["keyboard"].stringCancelNextStep, Wuaki.elements["keyboard"].fullLayoutKeyboard, Wuaki.language["emailAddress"] + ". " + Wuaki.language["step"] + " 1 " + Wuaki.language["of"] + " 2", Wuaki.language["useYourAccountEmail"], function(restoreConfig) {
            pairing.email = this.input.value;
            if (!restoreConfig) {
                Wuaki.elements["keyboard"].config("keyboardPairing2", this, "splashMenu", 7, "password", Wuaki.elements["keyboard"].stringBackFinish, Wuaki.elements["keyboard"].fullLayoutKeyboardPassword, Wuaki.language["password"] + ". " + Wuaki.language["step"] + " 2 " + Wuaki.language["of"] + " 2", Wuaki.language["useYourAccountPassword"], function() {
                    pairing.password = this.input.value;
                    Wuaki.showLoading();
                    Wuaki.blocked = true;
                    Wuaki.temporalPassword = pairing.password;
                    ApiWuaki.login(pairing.email, pairing.password, function(requestId) {
                        if ("success" === ApiWuaki.getResult(requestId)) {
                            Wuaki.user.data = ApiWuaki.getData(requestId);
                            TVA_Storage.toFile(Wuaki.COOKIE_TOKEN, Wuaki.user.data.authentication_token);
                            TVA_Storage.toFile(Wuaki.COOKIE_ID, Wuaki.user.data.id.toString());
                            Wuaki.pairing.password = Wuaki.temporalPassword;
                            Wuaki.login(function() {
                                var endProcess = function() {
                                    if (Wuaki.statusLogged) {
                                        Wuaki.elements["modalMenu"].config("PairingMessage", "modalMenu", Wuaki.currentElement.name, "message", null, modalFillCallbacks.pairingDone, function(output) {
                                            if (Wuaki.fromPurchase && Wuaki.user.data.credit_card == null) {
                                                process.preCreditCard()
                                            } else {
                                                Wuaki.disableElement("keyboard");
                                                Wuaki.backToProcessCaller()
                                            }
                                        });
                                        Wuaki.elements["modalMenu"].autoEnable()
                                    }
                                };
                                if (Wuaki.homescreen) {
                                    homescreenFillCallbacks.homescreen(Wuaki.elements.mainMenu.menuOptions[Wuaki.elements["mainMenu"].getOptionPos(Wuaki.language["Homescreen"])], $("#homescreen_banner0"), false, endProcess)
                                } else {
                                    Wuaki.dimissSplashLoadingScreen();
                                    endProcess()
                                }
                            });
                            TVA_GoogleAnalytics.analyticMark(TVA.device + "/device_pairing", pairing.email + "/" + Wuaki.getDeviceId())
                        } else {
                            TVA_Storage.deleteFile(Wuaki.COOKIE_TOKEN);
                            TVA_Storage.deleteFile(Wuaki.COOKIE_ID);
                            var data = ApiWuaki.getError(requestId);
                            data.modalTitle = Wuaki.language["login"];
                            data.buttonText = Wuaki.language["ok"];
                            Wuaki.elements["modalMenu"].config("PairingMessageError", "modalMenu", Wuaki.currentElement.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                                Wuaki.storedKeyboard = 0;
                                Wuaki.keyboardRestoreConfig();
                                Wuaki.enableElement("keyboard")
                            });
                            Wuaki.elements["modalMenu"].autoEnable()
                        }
                        ApiWuaki.cleanRequest(requestId)
                    })
                });
                Wuaki.elements["keyboard"].autoEnable()
            }
        });
        Wuaki.elements["keyboard"].autoEnable()
    },
    updatePassword: function() {
        var update = new Object;
        var currentElement = Wuaki.currentElement;
        Wuaki.elements["keyboard"].reset();
        Wuaki.elements["keyboard"].config("keyboardPasswordUpdate1", this, currentElement.name, 7, "password", Wuaki.elements["keyboard"].stringCancelNextStep, Wuaki.elements["keyboard"].fullLayoutKeyboardPassword, Wuaki.language["password"] + ". " + Wuaki.language["step"] + " 1 " + Wuaki.language["of"] + " 2", Wuaki.language["enterPassword"], function(restoreConfig) {
            update.password = this.input.value;
            if (!restoreConfig) {
                Wuaki.elements["keyboard"].config("keyboardPasswordUpdate2", this, currentElement.name, 7, "password", Wuaki.elements["keyboard"].stringBackFinish, Wuaki.elements["keyboard"].fullLayoutKeyboardPassword, Wuaki.language["confirmPassword"] + ". " + Wuaki.language["step"] + " 2 " + Wuaki.language["of"] + " 2", Wuaki.language["verifyPassword"], function() {
                    update.passwordConfirm = this.input.value;
                    Wuaki.showLoading();
                    Wuaki.blocked = true;
                    ApiWuaki.changePasswordUser(Wuaki.user.data.id, Wuaki.pairing.password, update.password, update.passwordConfirm, Wuaki.user.data.authentication_token, function(requestId) {
                        if ("success" === ApiWuaki.getResult(requestId)) {
                            var data = ApiWuaki.getData(requestId);
                            Wuaki.pairing.password = update.password;
                            TVA_Storage.toFile(Wuaki.COOKIE_TOKEN, data.authentication_token);
                            TVA_Storage.toFile(Wuaki.COOKIE_ID, data.id.toString());
                            var options = new Array;
                            options.push({
                                name: Wuaki.language["password"],
                                value: "*************",
                                result: "OK"
                            });
                            options.push({
                                name: Wuaki.language["repeatPassword"],
                                value: "*************",
                                result: "OK"
                            });
                            data.options = options;
                            splashFillCallbacks.passwordUpdate(data);
                            TVA_GoogleAnalytics.analyticMark(TVA.device + "/password_update", Wuaki.user.data.id)
                        } else {
                            var data = ApiWuaki.getError(requestId);
                            data.modalTitle = Wuaki.language["error"];
                            data.buttonText = Wuaki.language["ok"];
                            Wuaki.elements["modalMenu"].config("keyboardPasswordUpdateError" + JSON.stringify(update), "modalMenu", Wuaki.currentElement.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                                Wuaki.storedKeyboard = 0;
                                Wuaki.keyboardRestoreConfig();
                                Wuaki.enableElement("keyboard")
                            });
                            Wuaki.elements["modalMenu"].autoEnable()
                        }
                        ApiWuaki.cleanRequest(requestId)
                    })
                });
                Wuaki.elements["keyboard"].autoEnable()
            }
        });
        Wuaki.elements["keyboard"].autoEnable()
    },
    createAccount: function() {
        var account = new Object;
        var currentElement = Wuaki.currentElement;
        Wuaki.elements["modalMenu"].config("TermsAndConditionMessage", "modalMenu", currentElement.name, "TermsAndConditions", null, modalFillCallbacks.termsAndConditions, function() {
            account.termsAndConditions = 1;
            Wuaki.elements["keyboard"].reset();
            Wuaki.elements["keyboard"].config("keyboardAccount1", this, "splashMenu", 7, "email", Wuaki.elements["keyboard"].stringCancelNextStep, Wuaki.elements["keyboard"].fullLayoutKeyboard, Wuaki.language["emailAddress"] + ". " + Wuaki.language["step"] + " 1 " + Wuaki.language["of"] + " 3", Wuaki.language["validEmail"], function(restoreConfig) {
                account.email = this.input.value;
                if (!restoreConfig) {
                    Wuaki.elements["keyboard"].config("keyboardAccount2", this, "splashMenu", 7, "password", Wuaki.elements["keyboard"].stringBackNextStep, Wuaki.elements["keyboard"].fullLayoutKeyboardPassword, Wuaki.language["password"] + ". " + Wuaki.language["step"] + " 2 " + Wuaki.language["of"] + " 3", Wuaki.language["enterPassword"], function(restoreConfig) {
                        account.password = this.input.value;
                        if (!restoreConfig) {
                            Wuaki.elements["keyboard"].config("keyboardAccount3", this, "splashMenu", 7, "password", Wuaki.elements["keyboard"].stringBackFinish, Wuaki.elements["keyboard"].fullLayoutKeyboardPassword, Wuaki.language["confirmPassword"] + ". " + Wuaki.language["step"] + " 3 " + Wuaki.language["of"] + " 3", Wuaki.language["verifyPassword"], function() {
                                account.passwordConfirm = this.input.value;
                                Wuaki.showLoading();
                                Wuaki.blocked = true;
                                ApiWuaki.createAnUser(account.email, account.password, account.passwordConfirm, "", account.email, "", account.termsAndConditions, function(requestId) {
                                    if ("success" === ApiWuaki.getResult(requestId)) {
                                        account.data = ApiWuaki.getData(requestId);
                                        TVA_Storage.toFile(Wuaki.COOKIE_TOKEN, account.data.authentication_token);
                                        TVA_Storage.toFile(Wuaki.COOKIE_ID, account.data.id.toString());
                                        Wuaki.pairing.password = account.password;
                                        var options = new Array;
                                        options.push({
                                            name: Wuaki.language["termAndCond"],
                                            value: Wuaki.language["accepted"],
                                            result: "OK"
                                        });
                                        options.push({
                                            name: Wuaki.language["email"],
                                            value: account.data.email,
                                            result: "OK"
                                        });
                                        options.push({
                                            name: Wuaki.language["password"],
                                            value: "*************",
                                            result: "OK"
                                        });
                                        options.push({
                                            name: Wuaki.language["repeatPassword"],
                                            value: "*************",
                                            result: "OK"
                                        });
                                        account.data.options = options;
                                        splashFillCallbacks.accountDone(account.data);
                                        TVA_GoogleAnalytics.analyticMark(TVA.device + "/new_user", account.data.email)
                                    } else {
                                        var data = ApiWuaki.getError(requestId);
                                        data.modalTitle = Wuaki.language["error"];
                                        data.buttonText = Wuaki.language["ok"];
                                        Wuaki.elements["modalMenu"].config("PairingMessageError" + JSON.stringify(account), "modalMenu", Wuaki.currentElement.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                                            Wuaki.storedKeyboard = 0;
                                            Wuaki.keyboardRestoreConfig();
                                            Wuaki.enableElement("keyboard")
                                        });
                                        Wuaki.elements["modalMenu"].autoEnable()
                                    }
                                    ApiWuaki.cleanRequest(requestId)
                                })
                            });
                            Wuaki.elements["keyboard"].autoEnable()
                        }
                    });
                    Wuaki.elements["keyboard"].autoEnable()
                }
            });
            Wuaki.elements["keyboard"].autoEnable()
        });
        Wuaki.elements["modalMenu"].autoEnable()
    },
    creditCard: function(data) {
        var creditCard = new Object;
        var currentElement = Wuaki.currentElement;
        Wuaki.elements["keyboard"].reset();
        Wuaki.elements["keyboard"].config("keyboardCreditCard1", this, currentElement.name, 7, "normal", Wuaki.elements["keyboard"].stringCancelNextStep, Wuaki.elements["keyboard"].fullLayoutKeyboard, Wuaki.language["nameOnCard"] + ". " + Wuaki.language["step"] + " 1 " + Wuaki.language["of"] + " 4", Wuaki.language["nameOnCardExplanation"], function(restoreConfig) {
            creditCard.name = this.input.value;
            if (!restoreConfig) {
                Wuaki.elements["keyboard"].config("keyboardCreditCard2", this, currentElement.name, 6, "numeric", Wuaki.elements["keyboard"].numericCardNumber, Wuaki.elements["keyboard"].numericKeyboard, Wuaki.language["cardNumber"] + ". " + Wuaki.language["step"] + " 2 " + Wuaki.language["of"] + " 4", '<div class="mastercard"/><div class="visa"/><div class="visa-electron"/>' + Wuaki.language["cardNumberExplanation"], function() {
                    creditCard.cardNumber = this.input.value;
                    if (!restoreConfig) {
                        Wuaki.elements["keyboard"].config("keyboardCreditCard3", this, currentElement.name, 6, "numeric", Wuaki.elements["keyboard"].numericExpiration, Wuaki.elements["keyboard"].numericKeyboard, Wuaki.language["expirationDate"] + ". " + Wuaki.language["step"] + " 3 " + Wuaki.language["of"] + " 4", Wuaki.language["expirationDateExplanation"], function() {
                            creditCard.expirationDate = this.input.value.match(/.{1,2}/g);
                            if (!restoreConfig) {
                                Wuaki.elements["keyboard"].config("keyboardCreditCard4", this, currentElement.name, 6, "numeric", Wuaki.elements["keyboard"].numericCVV, Wuaki.elements["keyboard"].numericKeyboard, Wuaki.language["CVV"] + ". " + Wuaki.language["step"] + " 4 " + Wuaki.language["of"] + " 4", Wuaki.language["CVVExplanation"], function() {
                                    creditCard.CVV = this.input.value;
                                    var _this = this;
                                    var callback = function(value) {
                                        Wuaki.showLoading();
                                        Wuaki.blocked = true;
                                        var legacy = !(Wuaki.user.data.migrated_to_global == true);
                                        ApiWuaki.addCreditCardParams(legacy, Wuaki.user.data.id, Wuaki.user.data.email, creditCard.name, creditCard.expirationDate[0], creditCard.expirationDate[1], creditCard.cardNumber, creditCard.CVV, Wuaki.user.data.authentication_token, function(requestId) {
                                            if ("success" === ApiWuaki.getResult(requestId)) {
                                                var requestData = ApiWuaki.getData(requestId);
                                                if (requestData.errorCode != null) {
                                                    var data = {};
                                                    var res = "";
                                                    if (requestData.errorMessage.indexOf("cardNumber") != -1 || requestData.errorMessage.indexOf("check digit") != -1) res += Wuaki.language["inv_cardNumber"] + "<br/>";
                                                    if (requestData.errorMessage.indexOf("brand") != -1) res += Wuaki.language["inv_brand"] + "<br/>";
                                                    if (requestData.errorMessage.indexOf("expirationYear") != -1) res += Wuaki.language["inv_year"] + "<br/>";
                                                    if (requestData.errorMessage.indexOf("expirationMonth") != -1) res += Wuaki.language["inv_month"] + "<br/>";
                                                    if (requestData.errorMessage.indexOf("serviceId") != -1) res += Wuaki.language["inv_serviceId"] + "<br/>";
                                                    data.message = res;
                                                    data.modalTitle = Wuaki.language["error"];
                                                    data.buttonText = Wuaki.language["ok"];
                                                    Wuaki.elements["modalMenu"].config("CreditCardMessageError" + creditCard.name + creditCard.cardNumber + creditCard.expirationDate + creditCard.CVV, "modalMenu", Wuaki.currentElement.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                                                        Wuaki.storedKeyboard = 0;
                                                        Wuaki.keyboardRestoreConfig();
                                                        Wuaki.enableElement("keyboard")
                                                    });
                                                    Wuaki.elements["modalMenu"].autoEnable()
                                                } else if (requestData.hasOwnProperty("verified")) {
                                                    var data = {};
                                                    data.message = Wuaki.language["validationFail"];
                                                    data.modalTitle = Wuaki.language["error"];
                                                    data.buttonText = Wuaki.language["ok"];
                                                    Wuaki.elements["modalMenu"].config("CreditCardMessageError" + creditCard.name + creditCard.cardNumber + creditCard.expirationDate + creditCard.CVV, "modalMenu", Wuaki.currentElement.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                                                        Wuaki.storedKeyboard = 0;
                                                        Wuaki.keyboardRestoreConfig();
                                                        Wuaki.enableElement("keyboard")
                                                    });
                                                    Wuaki.elements["modalMenu"].autoEnable()
                                                } else {
                                                    var options = new Array;
                                                    var data = new Object;
                                                    data.errors = false;
                                                    options.push({
                                                        name: Wuaki.language["fullName"],
                                                        value: requestData.credit_card.holder_name,
                                                        result: "OK"
                                                    });
                                                    options.push({
                                                        name: Wuaki.language["cardNumber"],
                                                        value: requestData.credit_card.display_number,
                                                        result: "OK"
                                                    });
                                                    options.push({
                                                        name: Wuaki.language["expiration"],
                                                        value: creditCard.expirationDate.join("/"),
                                                        result: "OK"
                                                    });
                                                    options.push({
                                                        name: Wuaki.language["CVV"],
                                                        value: creditCard.CVV,
                                                        result: "OK"
                                                    });
                                                    Wuaki.user.data = requestData;
                                                    TVA_Storage.toFile(Wuaki.COOKIE_TOKEN, requestData.authentication_token);
                                                    TVA_Storage.toFile(Wuaki.COOKIE_ID, requestData.id.toString());
                                                    data.options = options;
                                                    splashFillCallbacks.creditCardDone(data);
                                                    TVA_GoogleAnalytics.analyticMark(TVA.device + "/credit_card", "added")
                                                }
                                            } else if (!process.tokenExpiration(_this, requestId, callback)) {
                                                var data = ApiWuaki.getError(requestId);
                                                data.modalTitle = Wuaki.language["error"];
                                                data.buttonText = Wuaki.language["ok"];
                                                Wuaki.elements["modalMenu"].config("CreditCardMessageError" + creditCard.name + creditCard.cardNumber + creditCard.expirationDate + creditCard.CVV, "modalMenu", Wuaki.currentElement.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                                                    Wuaki.storedKeyboard = 0;
                                                    Wuaki.keyboardRestoreConfig();
                                                    Wuaki.enableElement("keyboard")
                                                });
                                                Wuaki.elements["modalMenu"].autoEnable()
                                            }
                                            ApiWuaki.cleanRequest(requestId)
                                        })
                                    };
                                    callback()
                                });
                                Wuaki.elements["keyboard"].autoEnable()
                            }
                        });
                        Wuaki.elements["keyboard"].autoEnable()
                    }
                });
                Wuaki.elements["keyboard"].autoEnable()
            }
        });
        Wuaki.elements["keyboard"].autoEnable()
    },
    preCreditCard: function() {
        Wuaki.elements["splashMenu"].config("splashCreditCard" + Wuaki.fromPurchase, "splashMenu", Wuaki.processCaller, "splashCreditCard", {}, null, function() {
            Wuaki.disableElement("keyboard");
            Wuaki.backToProcessCaller()
        });
        Wuaki.fromPurchase = false;
        Wuaki.elements["splashMenu"].autoEnable()
    },
    unpair: function() {
        var currentElement = Wuaki.currentElement;
        Wuaki.elements["modalMenu"].config("unPair", "modalMenu", currentElement.name, "unPair", null, modalFillCallbacks.unpairModal, function(output) {
            Wuaki.showLoading();
            Wuaki.blocked = true;
            TVA_Storage.deleteFile(Wuaki.COOKIE_TOKEN);
            TVA_Storage.deleteFile(Wuaki.COOKIE_ID);
            Wuaki.login(function() {
                Wuaki.elements["mainMenu"].init($("#main_left_menu"), "mainMenu", mainMenuOptions.getOptions(), 1, 1);
                var optionName = Wuaki.language["Movies"];
                if (Wuaki.homescreen) optionName = Wuaki.language["Homescreen"];
                if (Wuaki.SVOD) optionName = Wuaki.language["PlanPremium"];
                Wuaki.elements["subMenu"].disable();
                Wuaki.elements["subMenu"].hide();
                Wuaki.elements["mainMenu"].normalMenu();
                Wuaki.elements[currentElement.name].hide();
                if (!Wuaki.SVOD) Wuaki.elements["subMenu"].autoSelectConfig(0, 0);
                Wuaki.elements["mainMenu"].selectOption(Wuaki.elements["mainMenu"].getOptionPos(optionName))
            });
            TVA_GoogleAnalytics.analyticMark(TVA.device + "/unpair_device", Wuaki.getDeviceId())
        });
        Wuaki.elements["modalMenu"].autoEnable()
    },
    forceLogout: function() {
        TVA_Storage.deleteFile(Wuaki.COOKIE_TOKEN);
        TVA_Storage.deleteFile(Wuaki.COOKIE_ID);
        TVA.quit = function() {};
        window.location.reload(true)
    },
    exit: function(caller) {
        if (TVA.device.match(/ps3|ps4|psvita/i)) return;
        Wuaki.elements["modalMenu"].config("exit" + caller.name, "modalMenu", caller.name, "exit", null, modalFillCallbacks.exit, function(output) {
            Wuaki.unLoad()
        });
        Wuaki.elements["modalMenu"].autoEnable()
    },
    subscription: function(caller, data, callback) {
        Wuaki.fromPurchase = true;
        if (!Wuaki.statusLogged) {
            Wuaki.processCaller = caller.name;
            Wuaki.elements["splashMenu"].config("splashPairingFromPurchaseOptions", "splashMenu", caller.name, "splashPairing", {}, null, null);
            Wuaki.elements["splashMenu"].autoEnable()
        } else if (Wuaki.user.data.credit_card == null) {
            Wuaki.processCaller = caller.name;
            process.preCreditCard()
        } else if (Wuaki.user.subscriptionPlan.subscriptions.length == 0) {
            Wuaki.elements["modalMenu"].config("TermsAndConditionMessage" + JSON.stringify(data.subscription_plans), "modalMenu", caller.name, "TermsAndConditions", data, modalFillCallbacks.termsAndConditionsSubscription, function() {
                Wuaki.elements["modalMenu"].config("Subscription" + JSON.stringify(data.subscription_plans), "modalMenu", caller.name, "purchasing", data, modalFillCallbacks.subscription, function(output) {
                    Wuaki.elements["modalMenu"].subscriptionProcessModal();
                    Wuaki.showLoading();
                    Wuaki.blocked = true;
                    ApiWuaki.subscribeASubscriptionPlan(data.subscriptionPolicy.id, data.subscriptionPolicy.price_policies[0].id, Wuaki.user.data.authentication_token, function(requestId) {
                        if ("success" === ApiWuaki.getResult(requestId)) {
                            Wuaki.login(function() {
                                Wuaki.elements["modalMenu"].config("PairingMessage", "modalMenu", caller.name, "message", null, modalFillCallbacks.subscriptionDone, function(output) {
                                    callback()
                                });
                                Wuaki.elements["modalMenu"].autoEnable()
                            });
                            TVA_GoogleAnalytics.analyticMark(TVA.device + "/subscription", Wuaki.user.data.email)
                        } else {
                            var data = ApiWuaki.getError(requestId);
                            data.modalTitle = Wuaki.language["error"];
                            data.buttonText = Wuaki.language["ok"];
                            Wuaki.elements["modalMenu"].config("PurchasingMessageError" + JSON.stringify(data), "modalMenu", caller.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                                Wuaki.cleanAllRequest();
                                callback()
                            });
                            Wuaki.elements["modalMenu"].autoEnable()
                        }
                        ApiWuaki.cleanRequest(requestId)
                    })
                });
                Wuaki.elements["modalMenu"].autoEnable()
            });
            Wuaki.elements["modalMenu"].autoEnable()
        } else {
            Wuaki.elements["modalMenu"].config("alreadySubscribed", "modalMenu", caller.name, "message", null, modalFillCallbacks.alreadySubscribed, function(output) {
                Wuaki.cleanAllRequest();
                callback()
            });
            Wuaki.elements["modalMenu"].autoEnable()
        }
    },
    couponForSubscription: function(caller, dataIn, callback) {
        var token;
        Wuaki.fromPurchase = true;
        if (!Wuaki.statusLogged) {
            Wuaki.processCaller = caller.name;
            Wuaki.elements["splashMenu"].config("splashPairingFromPurchaseOptions", "splashMenu", caller.name, "splashPairing", {}, null, null);
            Wuaki.elements["splashMenu"].autoEnable()
        } else if (Wuaki.user.data.credit_card == null) {
            Wuaki.processCaller = caller.name;
            process.preCreditCard()
        } else if (Wuaki.user.subscriptionPlan.subscriptions.length == 0) {
            Wuaki.processCaller = caller.name;
            Wuaki.elements["keyboard"].config("keyboardCouponsSubscription", this, caller.name, 7, "normal", Wuaki.elements["keyboard"].stringCancelFinish, Wuaki.elements["keyboard"].fullLayoutKeyboard, Wuaki.language["reedemCoupon"], Wuaki.language["reedemCouponExplanation"], function() {
                Wuaki.showLoading();
                Wuaki.blocked = true;
                Wuaki.elements["keyboard"].disable();
                Wuaki.elements[caller.name].display();
                token = this.input.value;
                ApiWuaki.couponsForSubscriptionPlan(dataIn.subscription_plans[0].id, token, Wuaki.user.data.authentication_token, function(requestId) {
                    dataIn.subscriptionPolicy = new Object;
                    dataIn.subscriptionPolicy.price_policies = new Array;
                    dataIn.subscriptionPolicy.price_policies.push(ApiWuaki.getData(requestId).price_policy);
                    if ("success" === ApiWuaki.getResult(requestId)) {
                        Wuaki.elements["modalMenu"].config("TermsAndConditionMessage" + JSON.stringify(dataIn.subscription_plans), "modalMenu", caller.name, "TermsAndConditions", dataIn, modalFillCallbacks.termsAndConditionsSubscriptionCoupon, function() {
                            Wuaki.elements["modalMenu"].config("Subscription" + JSON.stringify(dataIn.subscription_plans), "modalMenu", caller.name, "purchasing", dataIn, modalFillCallbacks.subscription, function(output) {
                                Wuaki.elements["modalMenu"].subscriptionProcessModal();
                                ApiWuaki.reedemCouponForSubscriptionPlan(dataIn.subscription_plans[0].id, token, Wuaki.user.data.authentication_token, function(requestId) {
                                    if ("success" === ApiWuaki.getResult(requestId)) {
                                        Wuaki.login(function() {
                                            callback()
                                        })
                                    } else {
                                        var data = ApiWuaki.getError(requestId);
                                        data.modalTitle = Wuaki.language["error"];
                                        data.buttonText = Wuaki.language["ok"];
                                        Wuaki.elements["modalMenu"].config("PurchasingMessageError" + JSON.stringify(data), "modalMenu", caller.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                                            Wuaki.cleanAllRequest();
                                            callback()
                                        });
                                        Wuaki.elements["modalMenu"].autoEnable()
                                    }
                                    ApiWuaki.cleanRequest(requestId);
                                    TVA_GoogleAnalytics.analyticMark(TVA.device + "/subscription_coupon", Wuaki.user.data.email + "/" + token)
                                })
                            });
                            Wuaki.elements["modalMenu"].autoEnable()
                        });
                        Wuaki.elements["modalMenu"].autoEnable()
                    } else {
                        var data = ApiWuaki.getError(requestId);
                        data.modalTitle = Wuaki.language["error"];
                        data.buttonText = Wuaki.language["ok"];
                        Wuaki.elements["modalMenu"].config("CouponMessageError" + JSON.stringify(data), "modalMenu", Wuaki.currentElement.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                            Wuaki.enableElement("keyboard")
                        });
                        Wuaki.elements["modalMenu"].autoEnable()
                    }
                    ApiWuaki.cleanRequest(requestId)
                })
            });
            Wuaki.elements["keyboard"].autoEnable()
        } else {
            Wuaki.elements["modalMenu"].config("alreadySubscribed", "modalMenu", caller.name, "message", null, modalFillCallbacks.alreadySubscribed, function(output) {
                Wuaki.cleanAllRequest();
                callback()
            });
            Wuaki.elements["modalMenu"].autoEnable()
        }
    },
    heartbeatResume: function() {
        TVA_Heartbeat.play(Wuaki.elements["playerMenu"].resume)
    },
    heartbeatException: function(data) {
        data.modalTitle = Wuaki.language["error"];
        data.buttonText = Wuaki.language["ok"];
        Wuaki.elements["modalMenu"].config("PlayerMessageError" + JSON.stringify(data), "modalMenu", "playerMenu", "errorMessage", data, modalFillCallbacks.errorModal, function() {
            Wuaki.disableElement("playerMenu");
            Wuaki.enableElement(Wuaki.elements["playerMenu"].parentMenu)
        });
        Wuaki.elements["modalMenu"].autoEnable()
    },
    heartbeatBeatCallback: function(parametes, xhr) {
        Wuaki.elements["detailsMenu"].detailsData.current_position = parameters.position
    },
    heartbeatCheckCallback: function(parameters, xhr) {},
    tokenExpiration: function(parent, requestId, callback) {
        if (ApiWuaki.getError(requestId)["class"] === "Wuaki::Exceptions::SignedInUserRequiredException") {
            Wuaki.elements["keyboard"].reset();
            Wuaki.elements["keyboard"].config("keyboardPassword", parent, Wuaki.currentElement.name, 7, "passwordUnpair", Wuaki.elements["keyboard"].stringCancelFinish, Wuaki.elements["keyboard"].fullLayoutKeyboardPassword, Wuaki.language["password"], Wuaki.language["useYourAccountPassword"], function() {
                ApiWuaki.login(Wuaki.user.data.email, this.input.value, function(requestId) {
                    if ("success" === ApiWuaki.getResult(requestId)) {
                        Wuaki.user.data = ApiWuaki.getData(requestId);
                        TVA_Storage.toFile(Wuaki.COOKIE_TOKEN, Wuaki.user.data.authentication_token);
                        TVA_Storage.toFile(Wuaki.COOKIE_ID, Wuaki.user.data.id.toString());
                        Wuaki.enableElement(parent.name);
                        callback(Wuaki.user.data.authentication_token)
                    } else {
                        var data = ApiWuaki.getError(requestId);
                        data.modalTitle = Wuaki.language["login"];
                        data.buttonText = Wuaki.language["ok"];
                        Wuaki.elements["modalMenu"].config("PairingMessageError", "modalMenu", Wuaki.currentElement.name, "errorMessage", data, modalFillCallbacks.errorModal, function(output) {
                            Wuaki.disableElement("keyboard");
                            Wuaki.enableElement(parent.name)
                        });
                        Wuaki.elements["modalMenu"].autoEnable()
                    }
                })
            });
            Wuaki.elements["keyboard"].autoEnable();
            return true
        } else return false
    }
};
//# sourceMappingURL=../js/unified.map
