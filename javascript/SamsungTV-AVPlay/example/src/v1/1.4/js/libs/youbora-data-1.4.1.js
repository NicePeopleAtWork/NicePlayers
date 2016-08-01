/*
 * YouboraData
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Lluís Campos i Beltran
 * Version: 3.1.0
 */
function YouboraData() {
    try {

        this.debug = false; 
        this.accountCode = "demosite";
        this.service = "http://nqs.nice264.com";
        //this.service = "http://nqs5.pam.nice264.com:8991/"; 

        this.username = "default";
        this.mediaResource = "";
        this.transaction = ""; 
        this.live = false; 
        this.contentId = ""; 
        this.isBalanced = false; 
 
        this.properties = { 
            filename: "",
            content_id: "",
            content_metadata: {     
                title: "",
                genre: "",
                language: "",
                year: "",
                cast: "",
                director: "",
                owner: "",
                duration: "",
                parental: "",
                price: "",
                rating: "",
                audioType: "",
                audioChannels: ""
            },
            transaction_type: "",
            quality: "",
            content_type: "",
            device: {     
                manufacturer: "", 
                type: "",
                year: "",
                firmware: "" 
        }} 

        this.concurrencySessionId = Math.random(); 
        this.concurrencyProperties = { 
            enabled: false,
            concurrencyService: "http://pc.youbora.com/cping/",
            concurrencyCode: "123",
            concurrencyMaxCount: 0,
            concurrencyRedirectUrl: "",
            concurrencyIpMode: false
        }

        this.resumeProperties = { 
            resumeEnabled: false,
            resumeService: "http://pc.youbora.com/resume/",
            playTimeService: "http://pc.youbora.com/playTime/",
            resumeCallback: function () {  console.log("YouboraData :: Default Resume Callback"); }
        }

        this.balanceProperties = { 
            balanceType: "balance",
            enabled: false,
            service: "http://smartswitch.youbora.com/",
            zoneCode: "",
            originCode: "",
            niceNVA: "",
            niceNVB: "",
            token: "",
            niceTokenIp: null,
            live: false }

        this.extraParams = { 
            'extraparam1': undefined,
            'extraparam2': undefined,
            'extraparam3': undefined,
            'extraparam4': undefined,
            'extraparam5': undefined,
            'extraparam6': undefined,
            'extraparam7': undefined,
            'extraparam8': undefined,
            'extraparam9': undefined,
            'extraparam10': undefined
        }

        this.jwplayerOverlayText = "";
        this.jwplayerOverlayEnabled = false;
        this.jwplayerOverlayTime = 90000;
        this.jwplayerOverlayDuration = 5000;
        this.jwplayerOverlayTextColor = undefined;
        this.jwplayerOverlayBackgroundColor = undefined;
        this.jwplayerStreamMode=false;

        this.silverlightMediaElementName = undefined;
        this.silverlightPlayer = undefined;

        this.enableAnalytics = true;
        this.enableBalancer = false;
        this.cdn_node_data = false;
        this.cdn_node_data_obtained = false;
        this.parseHLS = false;
        this.hashTitle = true;

        this.text_cdn = "";
        this.text_ip = "";
        this.text_isp = "";

        this.nqsDebugServiceEnabled = false;
        this.httpSecure = false;
        this.trackAdvertisement = false;
        this.trackSeekEvent = false;

        this.pluginVersion ={
            "thePlatformHtml5" : "2.1.0",
            "thePlatformFlash" : "2.1.0"
        };

        this.init();
    } catch (error) {  if (this.debug) { console.log("YouboraData :: Error [Function] :: " + err) }  }
} 
YouboraData.prototype.init = function () {
    try { 
        if (this.debug) { console.log("YouboraData :: Initialized"); }
        this.collectParams();
        return true; 
    } catch (error) { 
        if (this.debug) { console.log("YouboraData :: Init Error: " + error); } 
    }
};
YouboraData.prototype.collectParams = function () {
    try { var scripts = document.getElementsByTagName('script');
        var index = 0;
        for (var i = 0; i < scripts.length; i++) { if (scripts[i].src.indexOf('youbora-data') != -1) { index = i; } }
        var spYouboraScript = scripts[index];
        var srcData = spYouboraScript.src.replace(/^[^\?]+\??/, '');
        var Pairs = srcData.split(/[;&]/);

        for (var i = 0; i < Pairs.length; i++) { var KeyVal = Pairs[i].split('=');
            if (!KeyVal || KeyVal.length != 2) continue;
            var key = unescape(KeyVal[0]);
            var val = unescape(KeyVal[1]);
            val = val.replace(/\+/g, ' ');
            if (val == "true") { val = true; }
            if (val == "false") { val = false; }
            if (key == "debug") { this.setDebug(val); }

            if (key == "accountCode") { this.setAccountCode(val); }
            if (key == "service") { this.setService(val); }
            if (key == "username") { this.setUsername(val); }
            if (key == "mediaResource") { this.setMediaResource(val); }
            if (key == "transaction") { this.setTransaction(val); }
            if (key == "live") { this.setLive(val); }
            if (key == "contentId") { this.setContentId(val); }
            if (key == "hashTitle") { this.setHashTitle(val); }
            if (key == "cdn") { this.setCDN(val); }
            if (key == "isp") { this.setISP(val); }
            if (key == "ip") { this.setIP(val); }

            if (key == "properties") { this.setProperties(val); }
            if (key == "propertyFileName") { this.setPropertyFileName(val); }
            if (key == "propertyContentId") { this.setPropertyContentId(val); }
            if (key == "propertyTransactionType") { this.setPropertyTransactionType(val); }
            if (key == "propertyQuality") { this.setPropertyQuality(val); }
            if (key == "propertyContentType") { this.setPropertyContentType(val); }
            if (key == "propertyDeviceManufacturer") { this.setPropertyDeviceManufacturer(val); }
            if (key == "propertyDeviceType") { this.setPropertyDeviceType(val); }
            if (key == "propertyDeviceYear") { this.setPropertyDeviceYear(val); }
            if (key == "propertyDeviceFirmware") { this.setPropertyDeviceFirmware(val); }
            if (key == "propertyMetaTitle") { this.setPropertyMetaTitle(val); }
            if (key == "propertyMetaGenre") { this.setPropertyMetaGenre(val); }
            if (key == "propertyMetaLanguage") { this.setPropertyMetaLanguage(val); }
            if (key == "propertyMetaYear") { this.setPropertyMetaYear(val); }
            if (key == "propertyMetaCast") { this.setPropertyMetaCast(val); }
            if (key == "propertyMetaDirector") { this.setPropertyMetaDirector(val); }
            if (key == "propertyMetaOwner") { this.setPropertyMetaOwner(val); }
            if (key == "propertyMetaDuration") { this.setPropertyMetaDuration(val); }
            if (key == "propertyMetaParental") { this.setPropertyMetaParental(val); }
            if (key == "propertyMetaPrice") { this.setPropertyMetaPrice(val); }
            if (key == "propertyMetaRating") { this.setPropertyMetaRating(val); }
            if (key == "propertyMetaAudioType") { this.setPropertyMetaAudioType(val); }
            if (key == "propertyMetaAudioChannels") { this.setPropertyMetaAudioChannels(val); }
 
            if (key == "concurrencyProperties") { this.setConcurrencyProperties(val); }
            if (key == "concurrencyEnabled") { this.setConcurrencyEnabled(val); }
            if (key == "concurrencyCode") { this.setConcurrencyCode(val); }
            if (key == "concurrencyService") { this.setConcurrencyService(val); }
            if (key == "concurrencyMaxCount") { this.setConcurrencyMaxCount(val); }
            if (key == "concurrencyRedirectUrl") { this.setConcurrencyRedirectUrl(val); }
            if (key == "concurrencyIpMode") { this.setConcurrencyIpMode(val); }
 
            if (key == "resumeProperties") { this.setResumeProperties(val); }
            if (key == "resumeEnabled") { this.setResumeEnabled(val); }
            if (key == "resumeCallback") { this.setResumeCallback(val); }
            if (key == "resumeService") { this.setResumeService(val); }
            if (key == "playTimeService") { this.setPlayTimeService(val); }
 
            if (key == "balanceProperties") { this.setBalanceProperties(val); }
            if (key == "balanceEnabled") { this.setBalanceEnabled(val); }
            if (key == "balanceType") { this.setBalanceType(val); }
            if (key == "balanceService") { this.setBalanceService(val); }
            if (key == "balanceZoneCode") { this.setBalanceZoneCode(val); }
            if (key == "balanceOriginCode") { this.setBalanceOriginCode(val); }
            if (key == "balanceNVA") { this.setBalanceNVA(val); }
            if (key == "balanceNVB") { this.setBalanceNVB(val); }
            if (key == "balanceToken") { this.setBalanceToken(val); }
            if (key == "balanceLive") { this.setBalanceLive(val); }
 
            if (key == "extraparam1") { this.setExtraParam(1, val); }
            if (key == "extraparam2") { this.setExtraParam(2, val); }
            if (key == "extraparam3") { this.setExtraParam(3, val); }
            if (key == "extraparam4") { this.setExtraParam(4, val); }
            if (key == "extraparam5") { this.setExtraParam(5, val); }
            if (key == "extraparam6") { this.setExtraParam(6, val); }
            if (key == "extraparam7") { this.setExtraParam(7, val); }
            if (key == "extraparam8") { this.setExtraParam(8, val); }
            if (key == "extraparam9") { this.setExtraParam(9, val); }
            if (key == "extraparam10") { this.setExtraParam(10, val); }
 
            if (key == "jwplayerOverlayText") { this.setJwplayerOverlayText(val); }
            if (key == "jwplayerOverlayEnabled") { this.setJwplayerOverlayEnabled(val); }
            if (key == "jwplayerOverlayTime")       { this.setJwplayerOverlayTime(val); }
            if (key == "jwplayerOverlayDuration") { this.setJwplayerOverlayDuration(val); }
 
            if (key == "cdnNodeData") { this.setCDNNodeData(val); }

            if (key == "nqsDebugServiceEnabled") { this.setNqsDebugServiceEnabled(val); }
            if (key == "httpSecure") { this.setHttpSecure(val); }

            if (this.debug) { console.log('YouboraData :: collectParams :: ' + key + ' = ' + val); } 
        } 
    } catch (error) {  if (this.debug) { console.log("YouboraData :: collectParams :: Error :: " + error); }  }
};
YouboraData.prototype.setAccountCode = function (accountCode) {
    try { if (typeof accountCode != "undefined" && accountCode.length > 1) { this.accountCode = accountCode; } }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setAccountCode] :: " + error); } }
};
YouboraData.prototype.getAccountCode = function () {
    try { return this.accountCode; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getAccountCode] :: " + error); } }
};
YouboraData.prototype.setService = function (service) {
    try { if (typeof service != "undefined" && service.length > 1) { this.service = service; } } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setService] :: " + error); } }
};
YouboraData.prototype.getService = function () {
    try { return this.service; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getService] :: " + error); } }
};
YouboraData.prototype.setMediaResource = function (mediaResource) {
    try { if (typeof mediaResource != "undefined" && mediaResource.length > 1) { this.mediaResource = mediaResource; } } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setMediaResource] :: " + error); } }
};
YouboraData.prototype.getMediaResource = function () {
    try { return this.mediaResource; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getMediaResource] :: " + error); } }
};
YouboraData.prototype.setTransaction = function (transaction) {
    try { if (typeof transaction != "undefined" && transaction.length > 1) { this.transaction = transaction; } } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setTransaction] :: " + error); } }
};
YouboraData.prototype.getTransaction = function () {
    try { return this.transaction; } 
    catch (err) { if (this.debug) { console.log("YouboraData :: Error [getTransaction] :: " + error); } } 
};
YouboraData.prototype.setUsername = function (username) {
    try {   if(typeof username == "number"){username = username.toString();}if (typeof username != "undefined" && username.length > 0) { this.username = username; } } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setUserName] :: " + error); } }
};
YouboraData.prototype.getUsername = function () {
    try { return this.username; } 
    catch (err) { if (this.debug) { console.log("YouboraData :: Error [getUserName] :: " + error); } }
};
YouboraData.prototype.setLive = function (bool) {
    try { if (typeof bool != "undefined" && (bool == true || bool == false)) { this.live = bool; } } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setLive] :: " + error); } }
};
YouboraData.prototype.getLive = function () {
    try { return this.live; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getLive] :: " + error); } }
};
YouboraData.prototype.setResume = function (bool) {
    try { if (typeof bool != "undefined" && (bool == true || bool == false)) { this.resume = bool; } } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setResume] :: " + error); } }
};
YouboraData.prototype.getResume = function () {
    try { return this.resume; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getResume] :: " + error); } }
};
YouboraData.prototype.setContentId = function (contentId) {
    try { if (typeof contentId != "undefined" && contentId.length > 1) { this.contentId = contentId; } } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setContentId] :: " + error); } }
};
YouboraData.prototype.getContentId = function () {
    try { return this.contentId; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getContentId] :: " + error); } }
};
YouboraData.prototype.setProperties = function (propertiesObject) {
    try { if (typeof propertiesObject == "string") { propertiesObject = JSON.parse(propertiesObject); } if (typeof propertiesObject == "object") { this.properties = propertiesObject; } } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setProperties] :: " + error); } }
};
YouboraData.prototype.getProperties = function () {
    try { return this.properties; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getProperties] :: " + error); } }
};
YouboraData.prototype.getPropertiesString = function () {
    try { return this.properties; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getProperties] :: " + error); } }
};
YouboraData.prototype.setPropertyFileName = function (filename) {
    try { this.properties.filename = filename; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyFileName] :: " + error); } }
};
YouboraData.prototype.getPropertyFileName = function () {
    try { return this.properties.filename; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyFileName] :: " + error); } }
};
YouboraData.prototype.setPropertyContentId = function (contentid) {
    try { this.properties.content_id = contentid; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyContentId] :: " + error); } }
};
YouboraData.prototype.getPropertyContentId = function () {
    try { return this.properties.content_id; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyContentId] :: " + error); } }
};
YouboraData.prototype.setPropertyTransactionType = function (transactiontype) {
    try { this.properties.transaction_type = transactiontype; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyTransactionType] :: " + error); } }
};
YouboraData.prototype.getPropertyTransactionType = function () {
    try { return this.properties.transaction_type; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyTransactionType] :: " + error); } }
};
YouboraData.prototype.setPropertyQuality = function (quality) {
    try { this.properties.quality = quality; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyQuality] :: " + error); } }
};
YouboraData.prototype.getPropertyQuality = function () {
    try { return this.properties.transaction_type; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyQuality] :: " + error); } }
};
YouboraData.prototype.setPropertyContentType = function (contenttype) {
    try { this.properties.content_type = contenttype; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyContentType] :: " + error); } }
};
YouboraData.prototype.getPropertyContentType = function () {
    try { return this.properties.transaction_type; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyContentType] :: " + error); } }
};
YouboraData.prototype.setPropertyDeviceManufacturer = function (manufacturer) {
    try { this.properties.device.manufacturer = manufacturer; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyDeviceManufacturer] :: " + error); } }
};
YouboraData.prototype.getPropertyDeviceManufacturer = function () {
    try { return this.properties.device.manufacturer; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyDeviceManufacturer] :: " + error); } }
};
YouboraData.prototype.setPropertyDeviceType = function (type) {
    try { this.properties.device.type = type; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyDeviceType] :: " + error); } }
};
YouboraData.prototype.getPropertyDeviceType = function () {
    try { return this.properties.device.type; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyDeviceType] :: " + error); } }
};
YouboraData.prototype.setPropertyDeviceYear = function (year) {
    try { this.properties.device.year = year; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyDeviceYear] :: " + error); } }
};
YouboraData.prototype.getPropertyDeviceYear = function () {
    try { return this.properties.device.year; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyDeviceYear] :: " + error); } }
};
YouboraData.prototype.setPropertyDeviceFirmware = function (firmware) {
    try { this.properties.device.firmware = firmware; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyDeviceFirmware] :: " + error); } }
};
YouboraData.prototype.getPropertyDeviceFirmware = function () {
    try { return this.properties.device.firmware; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyDeviceFirmware] :: " + error); } }
};
YouboraData.prototype.setPropertyMetaTitle = function (title) {
    try { this.properties.content_metadata.title = title; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyMetaTitle] :: " + error); } }
};
YouboraData.prototype.getPropertyMetaTitle = function () {
    try { return this.properties.content_metadata.title; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyMetaTitle] :: " + error); } }
};
YouboraData.prototype.setPropertyMetaGenre = function (genre) {
    try { this.properties.content_metadata.genre = genre; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyMetaGenre] :: " + error); } }
};
YouboraData.prototype.getPropertyMetaGenre = function () {
    try { return this.properties.content_metadata.genre; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyMetaGenre] :: " + error); } }
};
YouboraData.prototype.setPropertyMetaLanguage = function (language) {
    try { this.properties.content_metadata.language = language; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyMetaLanguage] :: " + error); } }
};
YouboraData.prototype.getPropertyMetaLanguage = function () {
    try { return this.properties.content_metadata.language; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyMetaLanguage] :: " + error); } }
};
YouboraData.prototype.setPropertyMetaYear = function (year) {
    try { this.properties.content_metadata.year = year; } 
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyMetaYear] :: " + error); } }
};
YouboraData.prototype.getPropertyMetaYear = function () {
    try { return this.properties.content_metadata.year; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyMetaYear] :: " + error); } }
};
YouboraData.prototype.setPropertyMetaCast = function (cast) {
    try { this.properties.content_metadata.cast = cast; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyMetaCast] :: " + error); } }
};
YouboraData.prototype.getPropertyMetaCast = function () {
    try { return this.properties.content_metadata.cast; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyMetaCast] :: " + error); } }
};
YouboraData.prototype.setPropertyMetaDirector = function (director) {
    try { this.properties.content_metadata.director = director; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyMetaDirector] :: " + error); } }
};
YouboraData.prototype.getPropertyMetaDirector = function () {
    try { return this.properties.content_metadata.director; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyMetaDirector] :: " + error); } }
};
YouboraData.prototype.setPropertyMetaOwner = function (owner) {
    try { this.properties.content_metadata.owner = owner; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyMetaOwner] :: " + error); } }
};
YouboraData.prototype.getPropertyMetaOwner = function () {
    try { return this.properties.content_metadata.owner; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyMetaOwner] :: " + error); } }
};
YouboraData.prototype.setPropertyMetaDuration = function (duration) {
    try { this.properties.content_metadata.duration = duration; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyMetaDuration] :: " + error); } }
};
YouboraData.prototype.getPropertyMetaDuration = function () {
    try { return this.properties.content_metadata.duration; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyMetaDuration] :: " + error); } }
};
YouboraData.prototype.setPropertyMetaParental = function (parental) {
    try { this.properties.content_metadata.parental = parental; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyMetaParental] :: " + error); } }
};
YouboraData.prototype.getPropertyMetaParental = function () {
    try { return this.properties.content_metadata.parental; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyMetaParental] :: " + error); } }
};
YouboraData.prototype.setPropertyMetaPrice = function (price) {
    try { this.properties.content_metadata.price = price; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyMetaPrice] :: " + error); } }
};
YouboraData.prototype.getPropertyMetaPrice = function () {
    try { return this.properties.content_metadata.price; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyMetaPrice] :: " + error); } }
};
YouboraData.prototype.setPropertyMetaRating = function (rating) {
    try { this.properties.content_metadata.rating = rating; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyMetaRating] :: " + error); } }
};
YouboraData.prototype.getPropertyMetaRating = function () {
    try { return this.properties.content_metadata.rating; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyMetaRating] :: " + error); } }
};
YouboraData.prototype.setPropertyMetaAudioType = function (audiotype) {
    try { this.properties.content_metadata.audioType = audiotype; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyMetaAudioType] :: " + error); } }
};
YouboraData.prototype.getPropertyMetaAudioType = function () {
    try { return this.properties.content_metadata.audioType; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyMetaAudioType] :: " + error); } }
};
YouboraData.prototype.setPropertyMetaAudioChannels = function (audiochannels) {
    try { this.properties.content_metadata.audioChannels = audiochannels; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPropertyMetaAudioChannels] :: " + error); } }
};
YouboraData.prototype.getPropertyMetaAudioChannels = function () {
    try { return this.properties.content_metadata.audioChannels; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPropertyMetaAudioChannels] :: " + error); } }
};
YouboraData.prototype.setJwplayerOverlayText = function (text) {
    try { this.jwplayerOverlayText = text; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setJwplayerOverlayText] :: " + error); } }
};
YouboraData.prototype.getJwplayerOverlayText = function () {
    try { return this.jwplayerOverlayText; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getJwplayerOverlayText] :: " + error); } }
};
YouboraData.prototype.setJwplayerOverlayEnabled = function (enabled) {
    try { if (typeof enabled != "undefined" && (enabled == true || enabled == false)) { this.jwplayerOverlayEnabled = enabled; } }
    catch (error) { console.log("YouboraData :: Error [setJwplayerOverlayEnabled] :: " + err) }
};
YouboraData.prototype.getJwplayerOverlayEnabled = function () {
    try { return this.jwplayerOverlayEnabled; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getJwplayerOverlayEnabled] :: " + error); } }
};
YouboraData.prototype.setJwplayerOverlayTime = function (time) {
    try { this.jwplayerOverlayTime = time; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setJwplayerOverlayTime] :: " + error); } }
};
YouboraData.prototype.getJwplayerOverlayTime = function () {
    try { return this.jwplayerOverlayTime; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getJwplayerOverlayTime] :: " + error); } }
};
YouboraData.prototype.setJwplayerOverlayDuration = function (duration) {
    try { this.jwplayerOverlayDuration = duration; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setJwplayerOverlayDuration] :: " + error); } }
};
YouboraData.prototype.getJwplayerOverlayDuration = function () {
    try { return this.jwplayerOverlayDuration; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getJwplayerOverlayDuration] :: " + error); } }
};
YouboraData.prototype.setJwplayerOverlayTextColor = function (textColor) {
    try { this.jwplayerOverlayTextColor = textColor; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setJwplayerOverlayTextColor] :: " + error); } }
};
YouboraData.prototype.getJwplayerOverlayTextColor = function () {
    try { return this.jwplayerOverlayTextColor }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getjwplayerOverlayTextColor] :: " + error); } }
};
YouboraData.prototype.setJwplayerOverlayBackgroundColor = function (backgroudColor) {
    try { this.jwplayerOverlayBackgroundColor = backgroudColor; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setJwplayerOverlayBackgroundColor] :: " + error); } }
};
YouboraData.prototype.getJwplayerOverlayBackgroundColor = function () {
    try { return this.jwplayerOverlayBackgroundColor; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getJwplayerOverlayBackgroundColor] :: " + error); } }
}; 
YouboraData.prototype.setJwplayerStreamMode = function (jwplayerStreamMode) {
    try { this.jwplayerStreamMode = jwplayerStreamMode; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setJwplayerStreamMode] :: " + error); } }
};
YouboraData.prototype.getJwplayerStreamMode = function () {
    try { return this.jwplayerStreamMode; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setJwplayerStreamMode] :: " + error); } }
}; 
YouboraData.prototype.setConcurrencyProperties = function (concurrencyPropertiesObject) {
    try { 
        if (typeof concurrencyPropertiesObject == "string") { concurrencyPropertiesObject = JSON.parse(concurrencyPropertiesObject); }
        if (typeof concurrencyPropertiesObject != "undefined") { this.concurrencyProperties.enabled = true; this.concurrencyProperties = concurrencyPropertiesObject; } 
    } catch (error) { if (this.debug) { console.log("YouboraData :: Error [setConcurrencyProperties] :: " + error); } }
};
YouboraData.prototype.getConcurrencyProperties = function () {
    try { return this.concurrencyProperties; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getConcurrencyProperties] :: " + error); } }
};
YouboraData.prototype.setConcurrencyEnabled = function (enabled) {
    try { this.concurrencyProperties.enabled = enabled; }
    catch (err) { if (this.debug) { console.log("YouboraData :: Error [setConcurrencyEnabled] :: " + error); } }
};
YouboraData.prototype.getConcurrencyEnabled = function () {
    try { return this.concurrencyProperties.enabled; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getConcurrencyEnabled] :: " + error); } }
};
YouboraData.prototype.setConcurrencyCode = function (code) {
    try { this.concurrencyProperties.enabled = true;
        this.concurrencyProperties.concurrencyCode = code; }
    catch (err) { if (this.debug) { console.log("YouboraData :: Error [setConcurrencyCode] :: " + error); } }
};
YouboraData.prototype.getConcurrencyCode = function () {
    try { return this.concurrencyProperties.concurrencyCode; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getConcurrencyCode] :: " + error); } }
};
YouboraData.prototype.setConcurrencyService = function (service) {
    try { this.concurrencyProperties.enabled = true;
        this.concurrencyProperties.concurrencyService = service; }
    catch (err) { if (this.debug) { console.log("YouboraData :: Error [setConcurrencyService] :: " + error); } }
};
YouboraData.prototype.getConcurrencyService = function () {
    try { return this.concurrencyProperties.concurrencyService; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getConcurrencyService] :: " + error); } }
};
YouboraData.prototype.getConcurrencySessionId = function () {
    try { return this.concurrencySessionId; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getConcurrencySessionId] :: " + error); } }
};
YouboraData.prototype.setConcurrencyMaxCount = function (maxCount) {
    try { this.concurrencyProperties.enabled = true;
        this.concurrencyProperties.concurrencyMaxCount = maxCount; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setConcurrencyMaxCount] :: " + error); } }
};
YouboraData.prototype.getConcurrencyMaxCount = function () {
    try { return this.concurrencyProperties.concurrencyMaxCount; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getConcurrencyMaxCount] :: " + error); } }
};
YouboraData.prototype.setConcurrencyRedirectUrl = function (redirectUrl) {
    try { this.concurrencyProperties.enabled = true;
        this.concurrencyProperties.concurrencyRedirectUrl = redirectUrl; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setConcurrencyRedirectUrl] :: " + error); } }
};
YouboraData.prototype.getConcurrencyRedirectUrl = function () {
    try { return this.concurrencyProperties.concurrencyRedirectUrl; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getConcurrencyRedirectUrl] :: " + error); } }
};
YouboraData.prototype.setConcurrencyIpMode = function (state) {
    try { this.concurrencyProperties.enabled = true;
        this.concurrencyProperties.concurrencyIpMode = state; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setConcurrencyIpMode] :: " + error); } }
};
YouboraData.prototype.getConcurrencyIpMode = function () {
    try { return this.concurrencyProperties.concurrencyIpMode; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getConcurrencyIpMode] :: " + error); } }
};
YouboraData.prototype.setBalanceProperties = function (balancePropertiesObject) {
    try { 
        if (typeof balancePropertiesObject == "string") { balancePropertiesObject = JSON.parse(balancePropertiesObject); } 
        if (typeof balancePropertiesObject != "undefined") { this.balanceProperties = balancePropertiesObject; } 
    } catch (error) { if (this.debug) { console.log("YouboraData :: Error [setBalanceProperties] :: " + error); } }
};
YouboraData.prototype.getBalanceProperties = function () {
    try { return this.balanceProperties; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getBalanceProperties] :: " + error); } }
};
YouboraData.prototype.setBalanceLive = function (live) {
    try { this.balanceProperties.live = live; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setBalanceLive] :: " + error); } }
};
YouboraData.prototype.getBalanceLive = function () {
    try { return this.balanceProperties.live; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getBalanceLive] :: " + error); } }
};
YouboraData.prototype.setBalanceType = function (type) {
    try { this.balanceProperties.balanceType = type; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setBalanceType] :: " + error); } }
};
YouboraData.prototype.getBalanceType = function () {
    try { return this.balanceProperties.balanceType; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getBalanceType] :: " + error); } }
};
YouboraData.prototype.setBalanceEnabled = function (state) {
    try { this.balanceProperties.enabled = state;
          this.enableBalancer = state; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setBalanceEnabled] :: " + error); } }
};
YouboraData.prototype.getBalanceEnabled = function () {
    try { return this.balanceProperties.enabled; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getBalanceEnabled] :: " + error); } }
};
YouboraData.prototype.setBalanceService = function (serviceURL) {
    try { this.balanceProperties.service = serviceURL; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setBalanceService] :: " + error); } }
};
YouboraData.prototype.getBalanceService = function () {
    try { return this.balanceProperties.service; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getBalanceService] :: " + error); } }
};
YouboraData.prototype.setBalanceZoneCode = function (zoneCode) {
    try { this.balanceProperties.zoneCode = zoneCode; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setBalanceZoneCode] :: " + error); } }
};
YouboraData.prototype.getBalanceZoneCode = function () {
    try { return this.balanceProperties.zoneCode; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getBalanceZoneCode] :: " + error); } }
};
YouboraData.prototype.setBalanceOriginCode = function (originCode) {
    try { this.balanceProperties.originCode = originCode; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setBalanceOriginCode] :: " + error); } }
};
YouboraData.prototype.getBalanceOriginCode = function () {
    try { return this.balanceProperties.originCode; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getBalanceOriginCode] :: " + error); } }
};
YouboraData.prototype.setBalanceNVA = function (NVA) {
    try { this.balanceProperties.niceNVA = NVA; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setBalanceNVA] :: " + error); } }
};
YouboraData.prototype.getBalanceNVA = function () {
    try { return this.balanceProperties.niceNVA; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getBalanceNVA] :: " + error); } }
};
YouboraData.prototype.setBalanceNVB = function (NVB) {
    try { this.balanceProperties.niceNVB = NVB; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setBalanceNVB] :: " + error); } }
};
YouboraData.prototype.getBalanceNVB = function () {
    try { return this.balanceProperties.niceNVB; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getBalanceNVB] :: " + error); } }
};
YouboraData.prototype.setBalanceToken = function (token) {
    try { this.balanceProperties.token = token; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setBalanceToken] :: " + error); } }
};
YouboraData.prototype.getBalanceToken = function () {
    try { return this.balanceProperties.token; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getBalanceToken] :: " + error); } }
};
YouboraData.prototype.setResumeProperties = function (resumePropertiesObject) {
    try { 
        if (typeof resumePropertiesObject == "string") { resumePropertiesObject = JSON.parse(resumePropertiesObject); }
        if (typeof resumePropertiesObject != "undefined") { this.resumeProperties = resumePropertiesObject; }
    } catch (error) { if (this.debug) { console.log("YouboraData :: Error [setResumeProperties] :: " + error); } }
};
YouboraData.prototype.getResumeProperties = function () {
    try { return this.resumeProperties; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getResumeProperties] :: " + error); } }
};
YouboraData.prototype.setResumeEnabled = function (state) {
    try { this.resumeProperties.resumeEnabled = state; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setResumeEnabled] :: " + error); } }
};
YouboraData.prototype.getResumeEnabled = function () {
    try { return this.resumeProperties.resumeEnabled; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getResumeEnabled] :: " + error); } }
};
YouboraData.prototype.setResumeCallback = function (callback) {
    try { this.resumeProperties.resumeCallback = callback; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setResumeCallback] :: " + error); } }
};
YouboraData.prototype.getResumeCallback = function () {
    try { return this.resumeProperties.resumeCallback; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getResumeCallback] :: " + error); } }
};
YouboraData.prototype.setResumeService = function (serviceURL) {
    try { this.resumeProperties.resumeService = serviceURL; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setResumeService] :: " + error); } }
};
YouboraData.prototype.getResumeService = function () {
    try { return this.resumeProperties.resumeService; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getResumeService] :: " + error); } }
};
YouboraData.prototype.setPlayTimeService = function (serviceURL) {
    try { this.resumeProperties.playTimeService = serviceURL; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setPlayTimeService] :: " + error); } }
};
YouboraData.prototype.getPlayTimeService = function () {
    try { return this.resumeProperties.playTimeService; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getPlayTimeService] :: " + error); } }
};
YouboraData.prototype.setDebug = function (status) {
    try { this.debug = status; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setDebug] :: " + error); } }
};
YouboraData.prototype.getDebug = function () {
    try { return this.debug; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getDebug] :: " + error); } }
};
YouboraData.prototype.setZoneCode = function (zoneCode) {
    try { this.zoneCode = zoneCode; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setZoneCode] :: " + error); } }
};
YouboraData.prototype.getZoneCode = function () {
    try { return this.zoneCode; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getZoneCode] :: " + error); } }
};
YouboraData.prototype.setOriginCode = function (originCode) {
    try { this.originCode = originCode; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setOriginCode] :: " + error); } }
};
YouboraData.prototype.getOriginCode = function () {
    try { return this.originCode; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getOriginCode] :: " + error); } }
};
YouboraData.prototype.setCDNNodeData = function (value) {
    try { this.cdn_node_data = value; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setCDNNodeData] :: " + error); } }
};
YouboraData.prototype.getCDNNodeData = function () {
    try { return this.cdn_node_data; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getCDNNodeData] :: " + error); } }
};
YouboraData.prototype.setParseHLS = function (value) {
    try { this.parseHLS = value; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setParseHLS] :: " + error); } }
};
YouboraData.prototype.getParseHLS = function () {
    try { return this.parseHLS; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getParseHLS] :: " + error); } }
};
YouboraData.prototype.setCDNNodeDataObtained = function (value) {
    try { this.cdn_node_data_obtained = value; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setCDNNodeData] :: " + error); } }
};
YouboraData.prototype.getCDNNodeDataObtained = function () {
    try { return this.cdn_node_data_obtained; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getCDNNodeData] :: " + error); } }
};
YouboraData.prototype.setCDN = function (value) {
    try { this.text_cdn = value; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setCDN] :: " + error); } }
};
YouboraData.prototype.getCDN = function () {
    try { return this.text_cdn; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getCDN] :: " + error); } }
};
YouboraData.prototype.setISP = function (value) {
    try { this.text_isp = value; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setISP] :: " + error); } }
};
YouboraData.prototype.getISP = function () {
    try { return this.text_isp; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getISP] :: " + error); } }
};
YouboraData.prototype.setIP = function (value) {
    try { this.text_ip = value; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setIP] :: " + error); } }
};
YouboraData.prototype.getIP = function () {
    try { return this.text_ip; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getIP] :: " + error); } }
};
YouboraData.prototype.setHashTitle = function (value) {
    try { this.hashTitle = value; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setHashTitle] :: " + error); } }
};
YouboraData.prototype.getHashTitle = function () {
    try { return this.hashTitle; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getHashTitle] :: " + error); } }
};
YouboraData.prototype.setNiceTokenIp = function (niceTokenIp) {
    try { this.balanceProperties.niceTokenIp = niceTokenIp; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [niceTokenIp] :: " + error); } }
};
YouboraData.prototype.getNiceTokenIp = function () {
    try { return this.balanceProperties.niceTokenIp; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getNiceTokenIp] :: " + error); } }
};
YouboraData.prototype.setExtraParam = function (position, value) {
    try { 
        switch (position) { 
            case 1:
                this.extraParams['extraparam1'] = value;
            break;
            case 2:
                this.extraParams['extraparam2'] = value;
            break;
            case 3:
                this.extraParams['extraparam3'] = value;
            break;
            case 4:
                this.extraParams['extraparam4'] = value;
            break;
            case 5:
                this.extraParams['extraparam5'] = value;
            break;
            case 6:
                this.extraParams['extraparam6'] = value;
            break;
            case 7:
                this.extraParams['extraparam7'] = value;
            break;
            case 8:
                this.extraParams['extraparam8'] = value;
            break;
            case 9:
                this.extraParams['extraparam9'] = value;
            break;
            case 10:
                this.extraParams['extraparam10'] = value;
            break; 
        }
     }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setExtraParam] :: " + error); } }
};
YouboraData.prototype.getExtraParam = function (position) {
    try { 
        switch (position) { 
            case 1:
                return this.extraParams['extraparam1'];
            break;
            case 2:
                return this.extraParams['extraparam2'];
            break;
            case 3:
                return this.extraParams['extraparam3'];
            break;
            case 4:
                return this.extraParams['extraparam4'];
            break;
            case 5:
                return this.extraParams['extraparam5'];
            break;
            case 6:
                return this.extraParams['extraparam6'];
            break;
            case 7:
                return this.extraParams['extraparam7'];
            break;
            case 8:
                return this.extraParams['extraparam8'];
            break;
            case 9:
                return this.extraParams['extraparam9'];
            break;
            case 10:
                return this.extraParams['extraparam10'];
            break; 
        } 
    }
    catch (error) { 
        if (this.debug) { console.log("YouboraData :: Error [getExtraParam] :: " + error); } 
    }
};
YouboraData.prototype.getExtraParams = function () {
    try { return this.extraParams; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getExtraParams] :: " + error); } }
}

YouboraData.prototype.setEnableAnalytics = function (enabled) {
    try { this.enableAnalytics = enabled; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setEnableAnalytics] :: " + error); } }
};
YouboraData.prototype.getEnableAnalytics = function () {
    try { return this.enableAnalytics; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getEnableAnalytics] :: " + error); } }
};
YouboraData.prototype.setEnableBalancer = function (enabled) {
    try { this.enableBalancer = enabled; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setEnableBalancer] :: " + error); } }
};
YouboraData.prototype.getEnableBalancer = function (state) {
    try { return this.enableBalancer; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getEnableBalancer] :: " + error); } }
};
YouboraData.prototype.getBalancedResource = function () {
    try { return this.isBalanced; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [getBalancedResource] :: " + error); } }
};
YouboraData.prototype.setBalancedResource = function (state) {
    try { this.isBalanced = state; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [setBalancedResource] :: " + error); } }
};
YouboraData.prototype.setSilverlightMediaElementName = function (mediaElementName) {
    try { this.silverlightMediaElementName = mediaElementName; }
    catch (err) { if (this.debug) { console.log("YouboraData :: Error [setSilverlightMediaElementName] :: " + err); } }
};
YouboraData.prototype.getSilverlightMediaElementName = function () {
    try { return this.silverlightMediaElementName; }
    catch (err) { if (this.debug) { console.log("YouboraData :: Error [getSilverlightMediaElementName] :: " + err); } }
};
YouboraData.prototype.setSilverlightPlayer = function (silverlightPlayer) {
    try { this.silverlightPlayer = silverlightPlayer; }
    catch (err) { if (this.debug) { console.log("YouboraData :: Error [setSilverlightMediaElementName] :: " + err); } }
};
YouboraData.prototype.getSilverlightPlayer = function () {
    try { return this.silverlightPlayer; }
    catch (err) { if (this.debug) { console.log("YouboraData :: Error [getSilverlightPlayer] :: " + err); } }
};
YouboraData.prototype.getNqsDebugServiceEnabled = function () {
    try { return this.nqsDebugServiceEnabled; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [GET nqsDebugServiceEnabled] :: " + error); } }
};
YouboraData.prototype.setNqsDebugServiceEnabled = function (nqsDebugEnabled) {
    try { this.nqsDebugServiceEnabled = nqsDebugEnabled; }
    catch (err) { if (this.debug) { console.log("YouboraData :: Error [SET nqsDebugServiceEnabled] :: " + err); } }
};
YouboraData.prototype.getHttpSecure = function () {
    try { return this.httpSecure; }
    catch (error) { if (this.debug) { console.log("YouboraData :: Error [GET nqsDebugServiceEnabled] :: " + error); } }
};
YouboraData.prototype.setHttpSecure = function (enabled) {
    try { this.httpSecure = enabled; }
    catch (err) { if (this.debug) { console.log("YouboraData :: Error [SET nqsDebugServiceEnabled] :: " + err); } }
};
YouboraData.prototype.setTrackAdvertisement = function (enabled) {
    try { this.trackAdvertisement = enabled; }
    catch (err) { if (this.debug) { console.log("YouboraData :: Error [SET trackAdvertisement] :: " + err); } }
};
YouboraData.prototype.getTrackAdvertisement = function () {
    try { return this.trackAdvertisement; }
    catch (err) { if (this.debug) { console.log("YouboraData :: Error [SET trackAdvertisement] :: " + err); } }
};
YouboraData.prototype.setTrackSeekEvent = function (enabled) {
    try { this.trackSeekEvent = enabled; }
    catch (err) { if (this.debug) { console.log("YouboraData :: Error [SET trackAdvertisement] :: " + err); } }
};
YouboraData.prototype.getTrackSeekEvent = function () {
    try { return this.trackSeekEvent; }
    catch (err) { if (this.debug) { console.log("YouboraData :: Error [SET trackAdvertisement] :: " + err); } }
};

YouboraData.prototype.log = function (message) {
    if(youboraData.getDebug()==true){
        console.log(message);
    }
};
//Convenience method to redirect from swf (Used only in thePlatfrom by now)
//if we put a ; after url, in the method, the swf will crash
YouboraData.prototype.redirectFunction = function(url){
    window.location = url
}

var youboraData = new YouboraData();