CONFIG = {
	locale: 'ES',
	version: '4.017 [25.09.2015]', // application version
	versionSDK: '2.0.168 [10.02.2015]',  // SDK version  (format: X.Y.SDK_SVN_Revision_number)
	environment: 'PRODUCTION', // 'DEVELOPMENT' or 'PRODUCTION'
	developer: {
		debug: true,
		active: true,
		console: 'console',
		simulateIssuesNetworkOrCable: false // true simulate network cable plugged/unplugged or network issue (keyboard c = connect; d = disconnect)
	},

	homeChangeInterval: 5000,

	mediaMarksInterval: 20000, // Timer how often we can call media marks. in milliseconds
	mediaMarksStart: 120000, // How much after the start we can reset media marks to null / show resume dialog? in milliseconds
	mediaMarksEnd: 120000, // How much before the end we can reset media marks to null / show resume dialog? in milliseconds

	player: {
		muted: true
	},

	ajax: {
		timeout: 45000
	},

	throbber: {
		timeout: 60 // in seconds
	},

	keyboard: {
		oneLayout: false
	},

	// how long should be visible arrows after mouseover
	onMouseoverTimeout: 10000,

	// page limit for catalogue scene
	cataloguePageLimit: 50,
	cataloguePageLimitSearch: 200,

	// page limit for catalogue collections scene
	collectionsPageLimit: 50,

	GA: {
		account: 'UA-9277760-1', // account number for Google Analytics
		ssl: false // true
	},

	expirationWarningBefore: 10*24*60*60, // show warning message before subscription expiration [in seconds]

	providerAPI: {
		domain: 'apiv3.filmin.es',
		api: {
			version: 'v1.0',
			appVersion: '4.0',
			osVersion: '1.0.0',
			url: 'https://apiv3.filmin.es',
			urlSignin: 'https://apiv3.filmin.es',
			urlStats: 'https://apiv3.filmin.es',

			mediaMarksUrl: 'https://ws.filmin.es',
			mediaMarksToken: '69533920-45f6-11e3-8f96-0800200c9a66',

			// TODO DS control device ID
			// APP row 233 ....
			clients: {
				'default': {
					client_id: 'mjgM9QrSYVLAFsIB',
					client_secret: 'skDomxOxaZfzktcsU7XvizHEIFl7qLz2'
				},
				'samsung': {
					client_id: 'mjgM9QrSYVLAFsIB',
					client_secret: 'skDomxOxaZfzktcsU7XvizHEIFl7qLz2'
				},
				'tizen': {
					client_id: 'SnbqjHLwlMQqwMJ5',
					client_secret: 'yXGAvQAfzEI3IiEA2rFOzfcSTYTGTpu2'
				},
				'lg': {
					client_id: '0Zu94QnJz31ZhSeo',
					client_secret: 'kmtgMvMx73S1yYdDPpJMPLyFykmUoRqQ'
				},
				'webos': {
					client_id: 'EyqRPprOxB7CPVU0',
					client_secret: 'PLZ2sICgdiXHIawUHv3uijLztByVZ6en'
				},
				'panasonic': {
					client_id: 'gkib4wrknsu392ow',
					client_secret: 'aQTScAdO23ChfKEqUIb5sna7QYtZagyj'
				},
				'phillips': {
					client_id: 'kjP8GeMkZLeUF9tl',
					client_secret: 'oNFEPRJjSsYdNNbno11LdvuU06oOLpGS'
				},
				'sonytv': {
					client_id: 'Qlr2HSOcVbTFWvNV',
					client_secret: 'mYaZnpeCUlUdn8fRnVj6vmrTWPWY1hml'
				},
				'playstation3': {
					client_id: 'lJ4ltNGl7YSG7Rx4',
					client_secret: 'xVoS7DrxIRIuQbbqr7RQWDDuZ02cl9wR'
				},
				'playstation4': {
					client_id: '58bYDqUtS5S7G3D4',
					client_secret: 'QkWPECg9dI0nJH33zUaludorgWjeT3ia'
				},
				'android': {
					client_id: 'mjgM9QrSYVLAFsIB',
					client_secret: 'skDomxOxaZfzktcsU7XvizHEIFl7qLz2'
				},
			}
		},
		ssl: true,
		PayTVP: {
			url: 'https://secure.paytpv.com/gateway/xml_bankstore.php',
			wsdlUrl: 'https://secure.paytpv.com/gateway/xml_bankstore.php?wsdl',
			PAYTPV_MERCHANT_CODE: 'p138vyzm',
			PAYTPV_PASSWORD: 'E1yj5Y8Zm1NyJe4xksTgCP',
			PAYTPV_TERMINAL: '2101' // Terminal number
		}
	},

	// Develop
	providerAPId: {
		domain: 'apistage.filmin.es',
		api: {
			version: 'v1.0',
			appVersion: '4.0',
			osVersion: '1.0.0',
			url: 'http://apistage.filmin.es',
			urlSignin: 'http://apistage.filmin.es',
			urlStats: 'http://apistage.filmin.es',

			mediaMarksUrl: 'https://ws-stage.filmin.es',
			mediaMarksToken: '69533920-45f6-11e3-8f96-0800200c9a66',

			// TODO DS control device ID
			// APP row 233 ....
			clients: {
				'default': {
					client_id: 'mjgM9QrSYVLAFsIB',
					client_secret: 'skDomxOxaZfzktcsU7XvizHEIFl7qLz2'
				},
				'samsung': {
					client_id: 'mjgM9QrSYVLAFsIB',
					client_secret: 'skDomxOxaZfzktcsU7XvizHEIFl7qLz2'
				},
				'tizen': {
					client_id: 'SnbqjHLwlMQqwMJ5',
					client_secret: 'yXGAvQAfzEI3IiEA2rFOzfcSTYTGTpu2'
				},
				'lg': {
					client_id: '0Zu94QnJz31ZhSeo',
					client_secret: 'kmtgMvMx73S1yYdDPpJMPLyFykmUoRqQ'
				},
				'webos': {
					client_id: 'EyqRPprOxB7CPVU0',
					client_secret: 'PLZ2sICgdiXHIawUHv3uijLztByVZ6en'
				},
				'panasonic': {
					client_id: 'gkib4wrknsu392ow',
					client_secret: 'aQTScAdO23ChfKEqUIb5sna7QYtZagyj'
				},
				'phillips': {
					client_id: 'kjP8GeMkZLeUF9tl',
					client_secret: 'oNFEPRJjSsYdNNbno11LdvuU06oOLpGS'
				},
				'sonytv': {
					client_id: 'Qlr2HSOcVbTFWvNV',
					client_secret: 'mYaZnpeCUlUdn8fRnVj6vmrTWPWY1hml'
				},
				'playstation3': {
					client_id: 'lJ4ltNGl7YSG7Rx4',
					client_secret: 'xVoS7DrxIRIuQbbqr7RQWDDuZ02cl9wR'
				},
				'playstation4': {
					client_id: '58bYDqUtS5S7G3D4',
					client_secret: 'QkWPECg9dI0nJH33zUaludorgWjeT3ia'
				}
			}
		},
		ssl: false,
		PayTVP: {
			/*
			url: 'https://secure.paytpv.com/gateway/xml_bankstore.php',
			wsdlUrl: 'https://secure.paytpv.com/gateway/xml_bankstore.php?wsdl',
			PAYTPV_MERCHANT_CODE: '5ksvfm01',
			PAYTPV_PASSWORD: 'V38yvMHPqXk9grz6tCB7',
			PAYTPV_TERMINAL: '3436' // Terminal number
			*/

			url: 'http://smarttv.mautilus.com/gateway/xml_bankstore.php',
			wsdlUrl: 'http://smarttv.mautilus.com/gateway/xml_bankstore.php?wsdl',
			PAYTPV_MERCHANT_CODE: 'dwpbhm76',
			PAYTPV_PASSWORD: '5jq200sc3vyphzfk4186',
			PAYTPV_TERMINAL: '3827' // Terminal number
		}
	}

};