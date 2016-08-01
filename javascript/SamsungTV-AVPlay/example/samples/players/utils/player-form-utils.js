$(function () {

	function buildForm(options) {

		$('#accountCode').val(options.accountCode);
		$('#username').val(options.username);
		$('#transaction').val(options.transaction);
		$('#httpSecure').val(options.httpSecure.toString()).change();
		$('#isp').val(options.isp);
		$('#cdn').val(options.cdn);

		$('#duration').val(options.properties.content_metadata.duration);
		$('#isLive').val(options.isLive.toString()).change();
		$('#title').val(options.properties.content_metadata.title);

		$('#extraparam1').val(options.extraparam1);
		$('#extraparam2').val(options.extraparam2);

	}	

	function readForm() {
		options = null;

		options = {
			accountCode: $('#accountCode').val(),
			trackAdvertisement: true ,
			username: $('#username').val(),
			isLive: ($('#isLive').val() === 'true'),	//cast string to boolean
			debug: true,
			transaction: $('#transaction').val(),
			httpSecure: ($('#httpSecure').val() === 'true'),	//cast string to boolean
			isp: $('#isp').val(),
			cdn: $('#cdn').val(),
			extraparam1: $('#extraparam1').val(),
			extraparam2: $('#extraparam2').val(),
			contentId: 'contentId',
			CDNNodeData: true,
			parseHLS: true,
			properties: {
				filename: null,
				content_id: null,
				content_metadata: {
					title: $('#title').val(),
					genre: null,
					language: null,
					year: null,
					cast: null,
					director: null,
					owner: null,
					duration: $('#duration').val(),
					parental: null,
					price: null,
					rating: null,
					audioType: null,
					audioChannels: null
				},
				transaction_type: null,
				quality: null,
				content_type: null,
				device: {
					manufacturer: null,
					type: null,
					year: null,
					firmware: null
				}
			},
			concurrencyProperties: {
				enabled: false,
				concurrencyService: "http://pc.youbora.com/cping/",
				concurrencyCode: "testcode",
				concurrencyMaxCount: 1,
				concurrencyRedirectUrl: function(){ document.location.href = "http://www.google.es/"; },
				concurrencyIpMode: false
			}/*,			
			balanceProperties: {
				balanceType: "balance", 
				enabled:     false,
				service:     "http://smartswitch.youbora.com/",
				zoneCode:    "default",
				originCode:  "test",
				niceNVA:     "1400775385000",
				niceNVB:     "1398183395000",
				token:       "9c32f41a92a31b6a83dd82b612ff73a5",
				niceTokenIp: null
			},
			resumeProperties: {
				resumeEnabled:   false,
				resumeService:   "http://pc.youbora.com/resume/",
				playTimeService: "http://pc.youbora.com/playTime/",
				resumeCallback:  function(secs){ alert("Resume: "+ secs) },
			}*/
		};
	}

	var optionsA = {
		accountCode: 'QA',
		username: 9,
		isLive: false,
		debug: true,
		transaction: null,
		httpSecure: false,
		isp: null,
		cdn: null,
		extraparam1: null,
		extraparam2: null,
		contentId: 'contentId',
		trackAdvertisement: true,
		CDNNodeData: true,
		parseHLS: true,
		properties: {
			filename: null,
			content_id: null,
			content_metadata: {
				title: null,
				genre: null,
				language: null,
				year: null,
				cast: null,
				director: null,
				owner: null,
				duration: null,
				parental: null,
				price: null,
				rating: null,
				audioType: null,
				audioChannels: null
			},
			transaction_type: null,
			quality: null,
			content_type: null,
			device: {
				manufacturer: null,
				type: null,
				year: null,
				firmware: null
			}
		},		
		balanceProperties: {
			balanceType: "balance", 
			enabled:     false,
			service:     "http://smartswitch.youbora.com/",
			zoneCode:    "default",
			originCode:  "test",
			niceNVA:     "1400775385000",
			niceNVB:     "1398183395000",
			token:       "9c32f41a92a31b6a83dd82b612ff73a5",
			niceTokenIp: null
		},
		concurrencyProperties: {
			enabled: false,
			concurrencyService: "http://pc.youbora.com/cping/",
			concurrencyCode: "testcode",
			concurrencyMaxCount: 1,
			concurrencyRedirectUrl: function(){ document.location.href = "http://www.google.es/"; },
			concurrencyIpMode: false
		},
		resumeProperties: {
			resumeEnabled:   false,
			resumeService:   "http://pc.youbora.com/resume/",
			playTimeService: "http://pc.youbora.com/playTime/",
			resumeCallback:  function(secs){ alert("Resume: "+ secs) },
		}
	};

	var optionsB = {
		accountCode: 'QA',
		username: 9,
		isLive: false,
		debug: false,
		transaction: 'transacodeAutotest',
		httpSecure: false,
		isp: 'ISP TestNice',
		cdn: 'L3',
		extraparam1: 'extraparam1',
		extraparam2: 'extraparam2',
		contentId: 'contentId',
		trackAdvertisement: true,
		trackSeekEvent: true,
		CDNNodeData: true,
		parseHLS: true,
		properties: {
			filename: "fileNameAutotest",
			content_id: "contentIdAutotest",
			content_metadata: {
				title: "TitleAutotest",
				genre: "GenreAutotest",
				language: "LanguageAutotest",
				year: "YearAutotest",
				cast: "castAutotest",
				director: "directorAutotest",
				owner: "ownerAutotest",
				duration: "durationAutotest",
				parental: "parentalAutotest",
				price: "priceAutotest",
				rating: "ratingAutotest",
				audioType: "audioTypeAutotest",
				audioChannels: "audioChannelsAutotest"
			},
			transaction_type: "Transaction Types",
			quality: "Quality",
			content_type: "Content Type",
			device: {
				manufacturer: "Manufacturer",
				type: "Type",
				year: "Year",
				firmware: "Firmware"
			}
		},		
		balanceProperties: {
			balanceType: "balance", 
			enabled:     false,
			service:     "http://smartswitch.youbora.com/",
			zoneCode:    "default",
			originCode:  "test",
			niceNVA:     "1400775385000",
			niceNVB:     "1398183395000",
			token:       "9c32f41a92a31b6a83dd82b612ff73a5",
			niceTokenIp: null
		},
		concurrencyProperties: {
			enabled: false,
			concurrencyService: "http://pc.youbora.com/cping/",
			concurrencyCode: "testcode",
			concurrencyMaxCount: 1,
			concurrencyRedirectUrl: function(){ document.location.href = "http://www.google.es/"; },
			concurrencyIpMode: false
		},
		resumeProperties: {
			resumeEnabled:   false,
			resumeService:   "http://pc.youbora.com/resume/",
			playTimeService: "http://pc.youbora.com/playTime/",
			resumeCallback:  function(secs){ alert("Resume: "+ secs) },
		}
	};


	// SELECT Test Type change
	$('#testType').on('change', function() {		
		
		options = null;

		if(this.value === 'A') {

			options = optionsA;

		} else if(this.value === 'B') {

			options = optionsB;

		}		

		buildForm(options);
		updateVideo();
	});

	// BUTTON UPDATE
	$('.button_update').on('click', function() {		
		readForm();
		//updateVideo();
	});


	// set default form
	$('#testType').val('B').change();

});