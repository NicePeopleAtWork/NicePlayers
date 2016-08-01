/**
 *		Wuaki API.
 * 		Generic 1.1 version
 * 		TvApp Agency
 *      @author Neuro
 */


ApiWuaki = {

    //API base URL.
    APIDomain: "http://localhost",
    //API full URL.
    APIBaseURL: "http://localhost",
    //Ajax config.
    APIFileExtension: "json",
    //API device.
    APIDevice: "sony",
    //queue
    queueList: null,
    //Response array.
    response: [],
    //ajax timeout.
    timeout: 30000,
    timeoutPS3: null,
    //apiUserVariables
    isPsnPlusAccount: false,
    //payVaultDefinition
    PayVaultUrl: "http://localhost",
    serviceId: 'demo48',
    //Constants
    DONE: 0,
    PROCESSING: 1,


    /*
     * Init function.
     */
    init: function(APIDomain, PayVaultDomain, APIFileExtension, APIDevice) {
        ApiWuaki.APIDomain = APIDomain;
        ApiWuaki.PayVaultUrl = PayVaultDomain;
        ApiWuaki.APIBaseURL = APIDomain;
        ApiWuaki.APIFileExtension = APIFileExtension;
        ApiWuaki.APIDevice = APIDevice;
        ApiWuaki.queueList = new Object();
        ApiWuaki.cleanAllRequest();
    },

    /*
     * success callback function that will store into response structure the API request response 
     */
    success: function(requestId, data, result) {
        //TVA.log("RequestId: "+ requestId + " success callback.");
        ApiWuaki.response[requestId].data = data;
        ApiWuaki.response[requestId].result = result;
        ApiWuaki.response[requestId].status = ApiWuaki.DONE;
    },

    /*
     * error callback function that will store into response structure the API request response 
     */
    error: function(requestId, textStatus, errorThrown) {
        //TVA.log("RequestId: "+ requestId + " error callback.");
        ApiWuaki.response[requestId].error = errorThrown;
        ApiWuaki.response[requestId].result = textStatus;
        ApiWuaki.response[requestId].status = ApiWuaki.DONE;
    },

    /*
     * complete callback function that will store into response structure the API request response 
     */
    complete: function(requestId, textStatus) {
        //TVA.log("RequestId: "+ requestId + " complete callback.");
        ApiWuaki.response[requestId].status = ApiWuaki.DONE;
        ApiWuaki.callbackFunction(requestId);
    },

    /*
     * callback function.
     */
    callbackFunction: function(requestId) {
        if (ApiWuaki.response[requestId].callback && ApiWuaki.response[requestId].callback(requestId)) {
            //to avoid multiple calls destroy callback
            ApiWuaki.response[requestId].callback = 0;
        }
    },

    /*
     * requestDone: Check is request has been finished.
     */
    isDone: function(requestId) {
        if (ApiWuaki.DONE == ApiWuaki.response[requestId].status)
            return true;
        else
            return false;
    },

    /*
     * getData: get data server response.
     */
    getData: function(requestId) {
        if (ApiWuaki.response[requestId].data == null) {
            //TVA.log(requestId+' is null');
            ApiWuaki.response[requestId].data = new Object();
        }
        return ApiWuaki.response[requestId].data;
    },

    /*
     * getResult: get result server request.
     */
    getResult: function(requestId) {
        return ApiWuaki.response[requestId].result;
    },

    /*
     * getError: get error server request result.
     */
    getError: function(requestId) {
        return ApiWuaki.response[requestId].error;
    },

    /*
     * cleanRequest: delete request data.
     */
    cleanRequest: function(requestId) {
        delete ApiWuaki.response[requestId];
    },

    /*
     * cleanAllRequest: delete all request structure.
     */
    cleanAllRequest: function() {
        ApiWuaki.response = {};
    },

    /*
     * Ajax request
     */
    ajaxRequest: function(requestId, url, parameters, type) {
        //block keydown until ajax call finsihes.
        Wuaki.blocked = true;
        //Launch request.
        if ("PUT" == type) {
            type = "POST";
            parameters._method = "PUT";
        } else if ("DELETE" == type) {
            type = "POST";
            parameters._method = "DELETE";
        }
        $.ajax({
            id: requestId,
            blocking: true,
            url: url,
            data: parameters,
            dataType: ApiWuaki.APIFileExtension,
            timeout: ApiWuaki.timeout,
            type: type,
            crossDomain: true,
            cache: false,
            xhrFields: {
                withCredentials: false
            },
            success: function(data, textStatus, jqXHR) {
                //TVA.log("AJAX done requestId "+ requestId);
                ApiWuaki.success(requestId, data, textStatus);
            },
            error: function(xhr, textStatus, errorThrown) {
                var response = {};
                try {
                    response = JSON.parse(xhr.responseText);
                } catch (e) {
                    response.message = textStatus;
                }
                ApiWuaki.error(requestId, textStatus, response);
            },
            complete: function(xhr, textStatus) {
                //TVA.log("AJAX complete requestId"+ requestId);
                ApiWuaki.complete(requestId, textStatus);
            }
        });
    },
    jsonAjaxRequest: function(requestId, url, parameters, type) {
        //block keydown until ajax call finsihes.
        Wuaki.blocked = true;
        //Launch request.
        if ("PUT" == type) {
            type = "POST";
            parameters._method = "PUT";
        } else if ("DELETE" == type) {
            type = "POST";
            parameters._method = "DELETE";
        }
        $.ajax({
            id: requestId,
            blocking: true,
            url: url,
            data: JSON.stringify(parameters),
            dataType: ApiWuaki.APIFileExtension,
            timeout: ApiWuaki.timeout,
            contentType: 'application/json',
            type: type,
            crossDomain: true,
            cache: false,
            xhrFields: {
                withCredentials: false
            },
            success: function(data, textStatus, jqXHR) {
                //TVA.log("AJAX done requestId "+ requestId);
                ApiWuaki.success(requestId, data, textStatus);
            },
            error: function(xhr, textStatus, errorThrown) {
                var response = {};
                try {
                    response = JSON.parse(xhr.responseText);
                } catch (e) {
                    response.message = textStatus;
                }
                ApiWuaki.error(requestId, textStatus, response);
            },
            complete: function(xhr, textStatus) {
                //TVA.log("AJAX complete requestId"+ requestId);
                ApiWuaki.complete(requestId, textStatus);
            }
        });
    },
    /*
     * Create random request ID.
     */
    createRequestId: function(request) {
        return request + "_" + Math.random().toString(36).substring(7);
    },
    /*
     * Create an API request
     */
    createRequest: function(request, url, parameters, callback, type) {
        //Random ID.
        var requestId = ApiWuaki.createRequestId(request);
        ApiWuaki.response[requestId] = {};
        ApiWuaki.response[requestId].status = ApiWuaki.PROCESSING;
        if (callback) ApiWuaki.response[requestId].callback = callback;
        //Add ApiWuaki parameter to all API calls.
        if ((ApiWuaki.APIDevice == 'PS3' || ApiWuaki.APIDevice == 'PS4') && ApiWuaki.isPsnPlusAccount && (request == 'reedemCouponForMovie' || request == 'couponsForMovie' || request == 'couponsForSubscriptionPlan' || request == 'reedemCouponForSubscriptionPlan'))
            parameters.device = ApiWuaki.APIDevice + 'plus';
        else
            parameters.device = ApiWuaki.APIDevice;
        parameters.serial_number = Wuaki.getDeviceId();
        ApiWuaki.ajaxRequest(requestId, url, parameters, type);
        return requestId;
    },
    jsonCreateRequest: function(request, url, parameters, callback, type) {
        //Random ID.
        var requestId = ApiWuaki.createRequestId(request);
        ApiWuaki.response[requestId] = {};
        ApiWuaki.response[requestId].status = ApiWuaki.PROCESSING;
        if (callback) ApiWuaki.response[requestId].callback = callback;
        //Add ApiWuaki parameter to all API calls.
        if ((ApiWuaki.APIDevice == 'PS3' || ApiWuaki.APIDevice == 'PS4') && ApiWuaki.isPsnPlusAccount && (request == 'reedemCouponForMovie' || request == 'couponsForMovie' || request == 'couponsForSubscriptionPlan' || request == 'reedemCouponForSubscriptionPlan'))
            parameters.device = ApiWuaki.APIDevice + 'plus';
        else
            parameters.device = ApiWuaki.APIDevice;
        ApiWuaki.jsonAjaxRequest(requestId, url, parameters, type);
        return requestId;
    },
    /*
     * Queue API call.
     */
    queue: function(id, apicalls, callback) {
        ApiWuaki.queueList[id] = new Object();
        ApiWuaki.queueList[id].apicalls = apicalls;
        ApiWuaki.queueList[id].callback = callback;
        ApiWuaki.queueList[id].current = 0;
        ApiWuaki.queueList[id].result = new Array();
        ApiWuaki.queueList[id].requestId = new Array();
        ApiWuaki.queueList[id].error = null;

        //Add to all elements call to queueNextFunction except last element that should call user callback
        for (var i = 0; i < ApiWuaki.queueList[id].apicalls.length; i++) {
            ApiWuaki.queueAddNextFunctionCallback(id, i);
        };

        ApiWuaki.queueList[id].requestId[0] = eval(ApiWuaki.queueList[id].apicalls[0].funcName + '(' + ApiWuaki.queueList[id].apicalls[0].arguments.join() + ')');

    },
    /**
     * add callback to call next queue element. 
     */
    queueAddNextFunctionCallback: function(id, current) {
        ApiWuaki.queueList[id].apicalls[current].arguments.push('function (requestId) {ApiWuaki.queueNextFunction("' + id + '",requestId);}');
    },
    /*
     * Queue next func
     */
    queueNextFunction: function(id, currentRequestId) {
        var result = new Object();
        if (ApiWuaki.getResult(currentRequestId) !== 'success') {
            ApiWuaki.queueList[id].error = ApiWuaki.getResult(currentRequestId);
            ApiWuaki.queueList[id].callback(id);
            return;
        }
        result.data = ApiWuaki.getData(currentRequestId);
        result.requestId = currentRequestId;
        ApiWuaki.queueList[id].result.push(result);
        var current = ++ApiWuaki.queueList[id].current;
        if (current < ApiWuaki.queueList[id].apicalls.length) {
            ApiWuaki.queueList[id].requestId[current] = eval(ApiWuaki.queueList[id].apicalls[current].funcName + '(' + ApiWuaki.queueList[id].apicalls[current].arguments.join() + ')');
        } else {
            ApiWuaki.queueList[id].callback(id);
        }
    },
    /**
     * Get result data from queue call.
     */
    queueGetData: function(id, call) {
        return ApiWuaki.queueList[id].result[call].data;
    },
    /**
     * Get requestId from queue call.
     */
    queueGetRequestId: function(id, call) {
        return ApiWuaki.queueList[id].result[call].requestId;
    },
    /**
     * Get queue result 
     */
    queueGetResult: function(id, call) {
        return ApiWuaki.queueList[id].result[call];
    },
    /**
     * Get error 
     */
    queueGetError: function(id) {
        return ApiWuaki.queueList[id].error;
    },
    /**
     * Delete queue 
     */
    deleteQueue: function(id) {
        for (var i = 0; i < ApiWuaki.queueList[id].requestId.length; i++) {
            ApiWuaki.cleanRequest(ApiWuaki.queueList[id].requestId[i])
        }
        delete ApiWuaki.queueList[id];
    },
    /**
     * Check queu call is success
     */

    /*
     * Date to Timestamp
     */
    toTimestamp: function(dt) {
        var y = dt.getUTCFullYear();
        var mth = dt.getUTCMonth() + 1;
        var d = dt.getUTCDate();
        if (mth < 10) mth = "0" + mth;
        if (d < 10) d = "0" + d;

        var h = dt.getUTCHours();
        var mnt = dt.getUTCMinutes();
        var s = dt.getUTCSeconds();
        var ms = dt.getUTCMilliseconds();

        if (h < 10) h = "0" + h;
        if (mnt < 10) mnt = "0" + mnt;
        if (s < 10) s = "0" + s;
        ms = (ms < 100 ? '0' : '') + (ms < 10 ? '0' : '') + ms;

        return y + '-' + mth + '-' + d + ' ' + h + ':' + mnt + ':' + s + '.' + ms;
    },

    /******************  API Calls ********************/
    /*
     * Sets Service ID for PayVault
     */
    setService: function(response) {
        if (response && response.geoip && response.geoip.payvault_service_id) {
            ApiWuaki.serviceId = response.geoip.payvault_service_id;
        }
    },
    /**********  USER *************/
    /*
     * Login Request.
     */
    login: function(user, password, callback) {
        var url = ApiWuaki.APIBaseURL + "users/authenticate" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (user || password) parameters.user = new Object();
        if (user) parameters.user['login'] = user;
        if (password) parameters.user['password'] = password;
        parameters.serial_number = Wuaki.getDeviceId();

        return ApiWuaki.createRequest("login", url, parameters, callback, "POST");
    },
    /*
     * Create an user Request.
     */
    createAnUser: function(user, password, password_confirmation, born_at, email, gender, terms_and_conditions, callback) {
        var url = ApiWuaki.APIBaseURL + "users" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (user || password) parameters.user = new Object();
        if (user) parameters.user['username'] = user;
        if (password) parameters.user['password'] = password;
        if (password_confirmation) parameters.user['password_confirmation'] = password_confirmation;
        if (born_at) parameters.user['born_at'] = born_at;
        if (email) parameters.user['email'] = email;
        if (gender) parameters.user['gender'] = gender;
        if (terms_and_conditions) parameters.user['terms_and_conditions'] = terms_and_conditions;
        parameters.serial_number = Wuaki.getDeviceId();

        return ApiWuaki.createRequest("createAnUser", url, parameters, callback, "POST");
    },
    /*
     * Get user data.
     */
    getUserData: function(id_user, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "users/" + id_user + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("getUserData", url, parameters, callback, "PUT");
    },
    /*
     * Change password user.
     */
    changePasswordUser: function(id_user, current_password, password, password_confirmation, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "users/" + id_user + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (password || current_password || password_confirmation) parameters.user = new Object();
        if (current_password) parameters.user['current_password'] = current_password;
        if (password) parameters.user['password'] = password;
        if (password_confirmation) parameters.user['password_confirmation'] = password_confirmation;
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("changePasswordUser", url, parameters, callback, "PUT");
    },
    /*
     * Change profile attributes
     */
    changeUserProfile: function(id_user, classification_id, audio_quality_id, language_id, video_quality_id, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "users/" + id_user + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        parameters.user = new Object();
        parameters.user['profile_attributes'] = new Object();
        if (classification_id && classification_id != -1) parameters.user['profile_attributes']['classification_id'] = classification_id;
        if (audio_quality_id) parameters.user['profile_attributes']['audio_quality_id'] = audio_quality_id;
        if (language_id) parameters.user['profile_attributes']['language_id'] = language_id;
        if (video_quality_id) parameters.user['profile_attributes']['video_quality_id'] = video_quality_id;
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("changeUserProfile", url, parameters, callback, "PUT");
    },
    /*
     * Add Credit Card Params
     */
    addCreditCardParams: function(legacy, id_user, mail_user, holder_name, month, year, number, verification_value, auth_token, callback) {
        if (legacy) {
            var url = ApiWuaki.APIBaseURL + "users/" + id_user + "." + ApiWuaki.APIFileExtension;
            var parameters = {};
            parameters.user = new Object();
            parameters.user['credit_card_attributes'] = new Object();
            if (holder_name) parameters.user['credit_card_attributes']['holder_name'] = holder_name;
            if (month) parameters.user['credit_card_attributes']['month'] = month;
            if (year) parameters.user['credit_card_attributes']['year'] = year;
            if (number) parameters.user['credit_card_attributes']['number'] = number;
            if (verification_value) parameters.user['credit_card_attributes']['verification_value'] = verification_value;
            if (auth_token) parameters.auth_token = auth_token;

            return ApiWuaki.createRequest("addCreditCardParams", url, parameters, callback, "PUT");
        } else {
            // Parameters are now submitted directly into PayVault
            var pv_parameters = {};
            pv_parameters['serviceId'] = ApiWuaki.serviceId;
            pv_parameters['timestamp'] = ApiWuaki.toTimestamp(new Date());
            pv_parameters['fullCardDetails'] = {
                cardNumber: '' + number,
                expirationMonth: '' + month,
                expirationYear: '20' + year
            };

            var WuakiCardPut = function(requestId) {
                if ('success' === ApiWuaki.getResult(requestId)) {
                    var cr_data = ApiWuaki.getData(requestId);
                    var resultType = cr_data['resultType'];
                    if (resultType == "success") {
                        /* For Future Request */
                        var maskedCardDetails = cr_data['maskedCardDetails'];
                        var cardToken = maskedCardDetails['cardToken'];
                        var iin = maskedCardDetails['iin'];
                        var last4digits = maskedCardDetails['last4digits'];
                        var brandCode = maskedCardDetails['brandCode'];
                        /* Scoping for future request */

                        var v_url = ApiWuaki.APIBaseURL + "credit_card_validations." + ApiWuaki.APIFileExtension;
                        var v_params = {
                            email: mail_user,
                            credit_card: {
                                holder_name: holder_name,
                                token: cardToken
                            }
                        };

                        function validate(requestId) {
                            var LooperRequestId = requestId;
                            if (ApiWuaki.getResult(requestId) == 'success') {
                                var v_data = ApiWuaki.getData(requestId);
                                if (v_data['href'].charAt(0) == '/')
                                    v_data['href'] = v_data['href'].slice(1);
                                var chk_url = ApiWuaki.APIBaseURL + v_data['href'] + "." + ApiWuaki.APIFileExtension;

                                function addUser(requestId) {
                                    var v_res = ApiWuaki.getData(requestId);
                                    // not ready...restart....
                                    if (v_res.verified == null) {
                                        window.setTimeout(function() {
                                            validate(LooperRequestId); // Try again
                                        }, 5000); // 5 secs
                                        ApiWuaki.cleanRequest(requestId);
                                        return; // Sanity Check
                                    } else if (v_res.verified == "verified") {
                                        // The followup will be a submission into the membership api with the necessary data
                                        var w_url = ApiWuaki.APIBaseURL + "users/" + id_user + "." + ApiWuaki.APIFileExtension;

                                        var w_parameters = {};
                                        w_parameters.user = new Object();
                                        w_parameters.user['credit_card_attributes'] = new Object();
                                        if (holder_name) w_parameters.user['credit_card_attributes']['holder_name'] = holder_name;
                                        if (month) w_parameters.user['credit_card_attributes']['month'] = month;
                                        if (year) w_parameters.user['credit_card_attributes']['year'] = year;
                                        if (auth_token) w_parameters.auth_token = auth_token;

                                        if (number) {
                                            w_parameters.user['credit_card_attributes']['number'] = iin + "******" + last4digits;
                                            w_parameters.user['credit_card_attributes']['payvault_token'] = cardToken;
                                            w_parameters.user['credit_card_attributes']['payvault_brand_code'] = brandCode;
                                        }
                                        ApiWuaki.createRequest("addCreditCardParams", w_url, w_parameters, callback, "PUT");
                                        ApiWuaki.cleanRequest(LooperRequestId);
                                        ApiWuaki.cleanRequest(requestId);
                                    } else {
                                        ApiWuaki.cleanRequest(LooperRequestId);
                                        callback(requestId);
                                    }
                                };
                                ApiWuaki.createRequest("addCreditCardParams", chk_url, new Object(), addUser, "GET");
                            } else
                                callback(requestId);
                        };
                        ApiWuaki.cleanRequest(requestId);
                        ApiWuaki.createRequest("addCreditCardParams", v_url, v_params, validate, "POST");
                    } else
                        callback(requestId);
                } else // Return to the UI callback, as failure in any call will effectively lead to the same result
                    callback(requestId);
            };

            return ApiWuaki.jsonCreateRequest("addCreditCardParams", ApiWuaki.PayVaultUrl, pv_parameters, WuakiCardPut, "POST");
        }
    },
    /*
     * Getting Video Quality List
     */
    gettingVideoQualityList: function(auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "video_qualities" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingVideoQualityList", url, parameters, callback, "GET");
    },
    /*
     * Getting Audio Quality List
     */
    gettingAudioQualityList: function(auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "audio_qualities" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingAudioQualityList", url, parameters, callback, "GET");
    },
    /*
     * Getting Languages List
     */
    gettingLanguagesList: function(auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "languages" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingLanguagesList", url, parameters, callback, "GET");
    },
    /**********  MOVIES *************/

    /*
     * Getting Movies List
     */
    gettingMoviesList: function(meta_sort, purchase_method, classification_id, title_like, per_page, page, offset, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "movies" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (meta_sort || title_like) parameters.search = new Object();
        if (meta_sort) parameters.search['meta_sort'] = meta_sort;
        if (title_like) parameters.search['title_like'] = title_like;
        if (purchase_method) parameters.purchase_method = purchase_method;
        if (classification_id && classification_id != -1) parameters.classification_id = classification_id;
        if (offset) parameters.offset = offset;
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingMoviesList", url, parameters, callback, "GET");
    },
    /*
     * Getting Movie Details
     */
    gettingMovieDetail: function(id, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "movies/" + id + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingMovieDetail", url, parameters, callback, "GET");
    },
    /*
     * Getting Trailer Stream Movies
     */
    gettingTrailerStreamMovies: function(id_movie, id_trailer, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "movies/" + id_movie + "/trailers/" + id_trailer + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingTrailerStreamMovies", url, parameters, callback, "GET");
    },
    /*
     * Getting Genres
     */
    gettingGenres: function(type, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "genres" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;
        if (type) parameters.type = type;

        return ApiWuaki.createRequest("gettingGenres", url, parameters, callback, "GET");
    },
    /*
     * Getting Movies List by Genres
     */
    gettingMoviesListByGenres: function(id_genres, meta_sort, purchase_method, classification_id, per_page, page, offset, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "genres/" + id_genres + "/movies" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (meta_sort) {
            parameters.search = new Object();
            parameters.search['meta_sort'] = meta_sort;
        }
        if (purchase_method) parameters.purchase_method = purchase_method;
        if (classification_id && classification_id != -1) parameters.classification_id = classification_id;
        if (offset) parameters.offset = offset;
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingMoviesListByGenres", url, parameters, callback, "GET");
    },
    /*
     * Getting Genre info
     */
    gettingGenreInfo: function(id_genre, callback) {
        var url = ApiWuaki.APIBaseURL + "genres/" + id_genre + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        return ApiWuaki.createRequest("gettingGenreInfo", url, parameters, callback, "GET");
    },
    /*
     * Getting Editorial List
     */
    gettingEditorialList: function(subscription, displayed_on_frontpage, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "lists" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (subscription) parameters.subscription = subscription;
        if (auth_token) parameters.auth_token = auth_token;
        if (displayed_on_frontpage) parameters.displayed_on_frontpage = displayed_on_frontpage;

        return ApiWuaki.createRequest("gettingEditorialList", url, parameters, callback, "GET");
    },
    /*
     * Getting List info
     */
    gettingListInfo: function(id_list, callback) {
        var url = ApiWuaki.APIBaseURL + "lists/" + id_list + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        return ApiWuaki.createRequest("gettingListInfo", url, parameters, callback, "GET");
    },
    /*
     * Getting List From Editorial
     */
    gettingListFromEditorial: function(contentType, id_list, subscription, meta_sort, purchase_method, classification_id, page, per_page, offset, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "lists/" + id_list;
        //Content Type define if content is movies or seasons.
        if (contentType == 'Season') url += "/seasons";
        else if (contentType == 'Movie') url += "/movies";
        else url += '/contents'
        url += "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (subscription) parameters.subscription = subscription;
        if (meta_sort) {
            parameters.search = new Object();
            parameters.search['meta_sort'] = meta_sort;
        }
        if (purchase_method) parameters.purchase_method = purchase_method;
        if (classification_id && classification_id != -1) parameters.classification_id = classification_id;
        if (per_page) parameters.per_page = per_page;
        if (offset) parameters.offset = offset;
        if (page) parameters.page = page;
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingListFromEditorial", url, parameters, callback, "GET");
    },
    /*
     * Purchase a Movie
     */
    purchase: function(id_purchase_option, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "purchase_options/" + id_purchase_option + "/purchases" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;
        parameters.serial_number = Wuaki.getDeviceId();

        return ApiWuaki.createRequest("purchase", url, parameters, callback, "POST");
    },
    /*
     * Purchase Status.
     */
    purchaseStatus: function(id_user, purchaseable_id, purchaseable_type, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "users/" + id_user + "/purchases/status" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (purchaseable_id) parameters.purchaseable_id = purchaseable_id;
        if (purchaseable_type) parameters.purchaseable_type = purchaseable_type;
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("purchaseStatus", url, parameters, callback, "GET");
    },
    /*
     * Coupons for Movie
     */
    couponsForMovie: function(id_movie, token, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "movies/" + id_movie + "/coupon_redeems/new" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;
        if (token) parameters.token = token;

        return ApiWuaki.createRequest("couponsForMovie", url, parameters, callback, "GET");
    },
    /*
     * Reedem Coupon for Movie
     */
    reedemCouponForMovie: function(id_movie, token, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "movies/" + id_movie + "/coupon_redeems" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;
        if (token) parameters.token = token;

        return ApiWuaki.createRequest("reedemCouponForMovie", url, parameters, callback, "POST");
    },
    /*
     * Getting Movie Streams
     */
    gettingMovieStreams: function(id_movie, id_stream, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "movies/" + id_movie + "/streams/" + id_stream + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingMovieStreams", url, parameters, callback, "GET");
    },
    /*
     * Rate a Movie
     */
    rateAMovie: function(id_movie, stars, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "movies/" + id_movie + "/rate" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;
        if (stars) parameters.stars = stars;

        return ApiWuaki.createRequest("rateAMovie", url, parameters, callback, "POST");
    },
    /**********  SEASONS *************/
    /*
     * Getting Season List
     */
    gettingSeasonList: function(meta_sort, purchase_method, classification_id, tv_show_title_like, per_page, page, offset, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "seasons" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};

        if (tv_show_title_like) {
            parameters.search = new Object();
            parameters.search['tv_show_title_like'] = tv_show_title_like;
        }
        if (auth_token) parameters.auth_token = auth_token;
        if (offset) parameters.offset = offset;
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;
        if (classification_id && classification_id != -1) parameters.classification_id = classification_id;

        return ApiWuaki.createRequest("gettingSeasonList", url, parameters, callback, "GET");
    },
    /*
     * Getting TVShows List
     */
    gettingTVShowsList: function(meta_sort, purchase_method, classification_id, tv_show_title_like, per_page, page, offset, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "tv_shows" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (meta_sort || tv_show_title_like) parameters.search = new Object();
        if (meta_sort) parameters.search['meta_sort'] = meta_sort;
        if (tv_show_title_like) parameters.search['title_like'] = title_like;
        if (classification_id && classification_id != -1) parameters.classification_id = classification_id;
        if (auth_token) parameters.auth_token = auth_token;
        if (offset) parameters.offset = offset;
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;

        return ApiWuaki.createRequest("gettingTVShowsList", url, parameters, callback, "GET");
    },
    /*
     * Getting TVShows List from premium
     */
    gettingTVShowsListPremium: function(id_subscription_plan, meta_sort, purchase_method, classification_id, tv_show_title_like, per_page, page, offset, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "subscription_plans/" + id_subscription_plan + "/tv_shows" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (meta_sort || tv_show_title_like) parameters.search = new Object();
        if (meta_sort) parameters.search['meta_sort'] = meta_sort;
        if (tv_show_title_like) parameters.search['title_like'] = title_like;
        if (classification_id && classification_id != -1) parameters.classification_id = classification_id;
        if (auth_token) parameters.auth_token = auth_token;
        if (offset) parameters.offset = offset;
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;

        return ApiWuaki.createRequest("gettingTVShowsList", url, parameters, callback, "GET");
    },
    /*
     * Getting Season Detail
     */
    gettingSeasonDetail: function(id_season, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "seasons/" + id_season + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;


        return ApiWuaki.createRequest("gettingSeasonList", url, parameters, callback, "GET");
    },
    /*
     * Getting TVShows Details
     */
    gettingTVShowsDetail: function(id_season, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "tv_shows/" + id_season + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;


        return ApiWuaki.createRequest("gettingTVShowsDetail", url, parameters, callback, "GET");
    },
    /*
     * Getting Trailer Stream Seasons
     */
    gettingTrailerStreamSeasons: function(id_season, id_trailer, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "seasons/" + id_season + "/trailers/" + id_trailer + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingTrailerStreamSeasons", url, parameters, callback, "GET");
    },
    /*
     * Getting Trailer Stream Episodes
     */
    gettingTrailerStreamEpisodes: function(id_episode, id_trailer, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "episodes/" + id_episode + "/trailers/" + id_trailer + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingTrailerStreamEpisodes", url, parameters, callback, "GET");
    },
    /*
     * Getting Episodes List From Season
     */
    gettingEpisodesListFromSeason: function(id_season, title_like, per_page, page, offset, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "seasons/" + id_season + "/episodes" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};

        if (title_like) {
            parameters.search = new Object();
            parameters.search['title_like'] = title_like;
        }
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;
        if (offset) parameters.offset = offset;
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingEpisodesListFromSeason", url, parameters, callback, "GET");
    },
    /*
     * Getting Episode Detail
     */
    gettingEpisodeDetail: function(id_season, id_episode, auth_token, callback) {
        var url;
        //Two ways to get episode details.. with and without id_season
        if (!id_season) url = ApiWuaki.APIBaseURL + "episodes/" + id_episode + "." + ApiWuaki.APIFileExtension;
        else url = ApiWuaki.APIBaseURL + "seasons/" + id_season + "/episodes/" + id_episode + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingEpisodeDetail", url, parameters, callback, "GET");
    },

    /*
     * Getting Episode Streams
     */
    gettingEpisodeStreams: function(id_movie, id_stream, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "episodes/" + id_movie + "/streams/" + id_stream + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingEpisodeStreams", url, parameters, callback, "GET");
    },
    /*
     * Rate a Season
     */
    rateASeason: function(id_season, stars, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "seasons/" + id_season + "/rate" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;
        if (stars) parameters.stars = stars;

        return ApiWuaki.createRequest("rateASeason", url, parameters, callback, "POST");
    },
    /*
     * Rate an Episode
     */
    rateAnEpisode: function(id_episode, stars, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "episodes/" + id_episode + "/rate" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;
        if (stars) parameters.stars = stars;

        return ApiWuaki.createRequest("rateAnEpisode", url, parameters, callback, "POST");
    },
    /**********  SUBSCRIPTION *************/
    /*
     * Getting List All Subscriptions Available.
     */
    gettingListAllSubscriptionsAvailable: function(auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "subscription_plans" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingListAllSubscriptionsAvailable", url, parameters, callback, "GET");
    },
    /*
     * Getting Subscription Detail
     */
    gettingSubscriptionDetail: function(id_subscription, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "subscription_plans/" + id_subscription + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingSubscriptionDetail", url, parameters, callback, "GET");
    },
    /*
     * Getting Price Policy From Subscription Plan
     */
    gettingPricePolicyFromSubscriptionPlan: function(id_subscription, id_price_policy, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "subscription_plans/" + id_subscription + "/price_policies/" + id_price_policy + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingPricePolicyFromSubscriptionPlan", url, parameters, callback, "GET");
    },
    /*
     * Subscribe a Subscription Plan
     */
    subscribeASubscriptionPlan: function(id_subscription, id_price_policy, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "subscription_plans/" + id_subscription + "/price_policies/" + id_price_policy + "/subscriptions" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("subscribeASubscriptionPlan", url, parameters, callback, "POST");
    },
    /*
     * Coupons For Subscription Plan
     */
    couponsForSubscriptionPlan: function(id_subscription_plan, token, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "subscription_plans/" + id_subscription_plan + "/coupon_redeems/new" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (token) parameters.token = token;
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("couponsForSubscriptionPlan", url, parameters, callback, "GET");
    },
    /*
     * Reedem Coupon For Subscription Plan
     */
    reedemCouponForSubscriptionPlan: function(id_subscription_plan, token, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "subscription_plans/" + id_subscription_plan + "/coupon_redeems" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (token) parameters.token = token;
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("reedemCouponForSubscriptionPlan", url, parameters, callback, "POST");
    },
    /*
     * Cancel Subscription Plan
     */
    cancelSubscriptionPlan: function(id_user, id_subscription, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "users/" + id_user + "/subscriptions/" + id_subscription + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("cancelSubscriptionPlan", url, parameters, callback, "DELETE");
    },
    /*
     * Getting User Subscription
     */
    gettingUserSubscription: function(id_user, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "users/" + id_user + "/subscriptions" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingUserSubscription", url, parameters, callback, "GET");
    },
    /*
     * Getting List Of All Subscription Movies
     */
    gettingListOfAllSubscriptionMovies: function(id_subscription_plan, genre_id, meta_sort, title_like, classification_id, subscription_highlighted, per_page, page, offset, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "subscription_plans/" + id_subscription_plan + "/movies" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (meta_sort || title_like) parameters.search = new Object();
        if (meta_sort) parameters.search['meta_sort'] = meta_sort;
        if (title_like) parameters.search['title_like'] = title_like;
        if (genre_id && genre_id != -1) parameters.genre_id = genre_id;
        if (classification_id && classification_id != -1) parameters.classification_id = classification_id;
        if (subscription_highlighted) parameters.subscription_highlighted = subscription_highlighted;
        if (offset) parameters.offset = offset;
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingListOfAllSubscriptionMovies", url, parameters, callback, "GET");
    },
    /*
     * Getting List Of All Season From Subscription Movies
     */
    gettingListOfAllSeasonFromSubscriptionPlan: function(id_subscription_plan, genre_id, meta_sort, title_like, classification_id, subscription_highlighted, per_page, page, offset, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "subscription_plans/" + id_subscription_plan + "/seasons" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (meta_sort || title_like) parameters.search = new Object();
        if (meta_sort) parameters.search['meta_sort'] = meta_sort;
        if (title_like) parameters.search['title_like'] = title_like;
        if (genre_id && genre_id != -1) parameters.genre_id = genre_id;
        if (classification_id && classification_id != -1) parameters.classification_id = classification_id;
        if (subscription_highlighted) parameters.subscription_highlighted = subscription_highlighted;
        if (offset) parameters.offset = offset;
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingListOfAllSeasonFromSubscriptionPlan", url, parameters, callback, "GET");
    },
    /*
     * Getting List Of Subscription Genres.
     */
    gettingListOfGenresSubscriptionPlan: function(id_subscription_plan, type, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "subscription_plans/" + id_subscription_plan + "/genres" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (type) parameters.type = type;
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingListOfAllSeasonFromSubscriptionPlan", url, parameters, callback, "GET");
    },
    /*
     * Getting Movies/Season/Episode from "Mi videoteca"
     */
    gettingMyLibrary: function(id_user, type, per_page, page, offset, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "users/" + id_user + "/purchases" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (type) parameters.type = type;
        if (offset) parameters.offset = offset;
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingMyLibrary", url, parameters, callback, "GET");
    },
    /*
     * Getting Favorites Movies List
     */
    gettingFavoritesMoviesList: function(per_page, page, offset, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "movies/favorites" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (offset) parameters.offset = offset;
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingFavoritesMoviesList", url, parameters, callback, "GET");
    },
    /*
     * Getting Favorites Movies List
     */
    gettingFavoritesSeasonsList: function(per_page, page, offset, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "seasons/favorites" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (offset) parameters.offset = offset;
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingFavoritesSeasonsList", url, parameters, callback, "GET");
    },
    /*
     * Getting Favorites Episodes List
     */
    gettingFavoritesEpisodesList: function(per_page, page, offset, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "episodes/favorites" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (offset) parameters.offset = offset;
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("gettingFavoritesEpisodesList", url, parameters, callback, "GET");
    },
    /*
     * Toggle Movie To Favorites List
     */
    toggleMovieToFavoritesList: function(id_movies, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "movies/" + id_movies + "/toggle_favorite" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("toggleMovieToFavoritesList", url, parameters, callback, "POST");
    },
    /*
     * Toggle Season To Favorites List
     */
    toggleSeasonToFavoritesList: function(id_season, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "seasons/" + id_season + "/toggle_favorite" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("toggleSeasonToFavoritesList", url, parameters, callback, "POST");
    },
    /*
     * Toggle Episode To Favorites List
     */
    toggleEpisodeToFavoritesList: function(id_episode, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "episodes/" + id_episode + "/toggle_favorite" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("toggleEpisodeToFavoritesList", url, parameters, callback, "POST");
    },
    /*
     * Toggle Movie From Already Seen List
     */
    toggleMovieFromAlreadySeenList: function(id_movies, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "movies/" + id_movies + "/toggle_already_seen" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("toggleMovieFromAlreadySeenList", url, parameters, callback, "POST");
    },
    /*
     * Toggle Season From Already Seen List
     */
    toggleSeasonFromAlreadySeenList: function(id_season, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "seasons/" + id_season + "/toggle_already_seen" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("toggleSeasonFromAlreadySeenList", url, parameters, callback, "POST");
    },
    /*
     * Toggle Episode From Already Seen List
     */
    toggleEpisodeFromAlreadySeenList: function(id_episode, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "episodes/" + id_episode + "/toggle_already_seen" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("toggleEpisodeFromAlreadySeenList", url, parameters, callback, "POST");
    },
    /*
     * List Free Movies
     */
    listFreeMovies: function(page, per_page, offset, callback) {
        var url = ApiWuaki.APIBaseURL + "movies/free" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (offset) parameters.offset = offset;
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;
        return ApiWuaki.createRequest("listFreeMovies", url, parameters, callback, "GET");
    },
    /*
     * Pair a device
     */
    pairADevice: function(device, serial_number, event, additional_attributes, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "device_pairings" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (device) parameters.device = device;
        if (serial_number) parameters.serial_number = serial_number;
        if (event) parameters.event = event;
        if (additional_attributes) parameters.additional_attributes = additional_attributes;
        if (auth_token) parameters.auth_token = auth_token;

        return ApiWuaki.createRequest("pairADevice", url, parameters, callback, "POST");
    },
    /*
     * Get API country
     */
    getAPICountry: function(callback) {
        var url = ApiWuaki.APIBaseURL + "i18n" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        return ApiWuaki.createRequest("getAPICountry", url, parameters, callback, "GET");
    },
    /*
     * Get 404
     */
    get404: function(callback) {
        var url = ApiWuaki.APIBaseURL + "404" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        return ApiWuaki.createRequest("get404", url, parameters, callback, "GET");
    },
    /*
     * Get API version
     */
    getAPIVersion: function(callback) {
        var url = ApiWuaki.APIBaseURL + "version" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        return ApiWuaki.createRequest("getAPIVersion", url, parameters, callback, "GET");
    },
    /*
     * Display Banners
     */
    displayBanners: function(banner_page_slug, callback) {
        var url = ApiWuaki.APIBaseURL + "banners" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (banner_page_slug) parameters.banner_page_slug = banner_page_slug;
        return ApiWuaki.createRequest("displayBanners", url, parameters, callback, "GET");
    },
    /*
     * List Classifications
     */
    listClassifications: function(callback) {
        var url = ApiWuaki.APIBaseURL + "classifications" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        return ApiWuaki.createRequest("listClassifications", url, parameters, callback, "GET");
    },
    /*
     * List Featured Movies
     */
    listFeaturedMovies: function(page, per_page, offset, callback) {
        var url = ApiWuaki.APIBaseURL + "movies/featured" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (offset) parameters.offset = offset;
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;
        return ApiWuaki.createRequest("listFeaturedMovies", url, parameters, callback, "GET");
    },
    /*
     * List HD Movies
     */
    listHDMovies: function(meta_sort, purchase_method, classification_id, title_like, per_page, page, offset, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "movies/hd_available" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (meta_sort || title_like) parameters.search = new Object();
        if (meta_sort) parameters.search['meta_sort'] = meta_sort;
        if (title_like) parameters.search['title_like'] = title_like;
        if (purchase_method) parameters.purchase_method = purchase_method;
        if (classification_id && classification_id != -1) parameters.classification_id = classification_id;
        if (offset) parameters.offset = offset;
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;
        if (auth_token) parameters.auth_token = auth_token;
        return ApiWuaki.createRequest("listHDMovies", url, parameters, callback, "GET");
    },
    /*
     * List Recently Added Movies
     */
    listRecentlyAddedMovies: function(page, per_page, offset, callback) {
        var url = ApiWuaki.APIBaseURL + "movies/recently_added" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (offset) parameters.offset = offset;
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;
        return ApiWuaki.createRequest("listRecentlyAddedMovies", url, parameters, callback, "GET");
    },
    /*
     * List Recently Release Movies
     */
    listRecentlyReleasedMovies: function(page, per_page, offset, callback) {
        var url = ApiWuaki.APIBaseURL + "movies/recently_released" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (offset) parameters.offset = offset;
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;
        return ApiWuaki.createRequest("listRecentlyReleasedMovies", url, parameters, callback, "GET");
    },
    /*
     * List Top Rated Movies
     */
    listTopRatedMovies: function(page, per_page, offset, callback) {
        var url = ApiWuaki.APIBaseURL + "movies/top_rated" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (offset) parameters.offset = offset;
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;
        return ApiWuaki.createRequest("listTopRatedMovies", url, parameters, callback, "GET");
    },
    /*
     * List Movies By Country 
     */
    listMoviesByCountry: function(country_id, page, per_page, offset, callback) {
        var url = ApiWuaki.APIBaseURL + "countries/" + country_id + "/movies" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (offset) parameters.offset = offset;
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;
        return ApiWuaki.createRequest("listMoviesByCountry", url, parameters, callback, "GET");
    },
    /*
     * List Movies By Person
     */
    listMoviesByPerson: function(person_id, page, per_page, offset, callback) {
        var url = ApiWuaki.APIBaseURL + "people/" + person_id + "/movies" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (offset) parameters.offset = offset;
        if (per_page) parameters.per_page = per_page;
        if (page) parameters.page = page;
        return ApiWuaki.createRequest("listMoviesByPerson", url, parameters, callback, "GET");
    },
    /*
     * Get Languages strings
     */
    getLanguageStrings: function(language, callback) {
        var url = Wuaki.languageFileURL + '_' + language + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        return ApiWuaki.createRequest("getLanguageStrings", url, parameters, callback, "GET");
    },
    /*
     * Get homescreen id.
     */
    getHomescreenID: function(auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "menus" + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;
        return ApiWuaki.createRequest("getHomescreenID", url, parameters, callback, "GET");
    },
    /*
     * Get homescreen Garden
     */
    getHomescreenGarden: function(id, auth_token, callback) {
        var url = ApiWuaki.APIBaseURL + "gardens/" + id + "." + ApiWuaki.APIFileExtension;
        var parameters = {};
        if (auth_token) parameters.auth_token = auth_token;
        return ApiWuaki.createRequest("getHomescreenGarden", url, parameters, callback, "GET");
    },
    /*
     * Get homescreen Banners
     */
    getHomescreenBanners: function(zone, user_logged_in, user_subscriber, auth_token, callback) {
        var url = Wuaki.APITrianaUrl;
        var parameters = {};
        if (zone) parameters.zone = zone;
        if (user_logged_in) parameters.user_logged_in = user_logged_in;
        if (user_subscriber) parameters.user_subscriber = user_subscriber;
        if (auth_token) parameters.auth_token = auth_token;
        return ApiWuaki.createRequest("getHomescreenBanners", url, parameters, callback, "GET");
    },
    /*
     * Get Landing page background. "#{country_triana_zone}_#{device}_landing_#{zone}"
     */
    getLandingBackground: function(zone, callback) {
        var url = Wuaki.APITrianaUrl;
        var parameters = {};
        if (zone) parameters.zone = zone;
        return ApiWuaki.createRequest("getLandingBackground", url, parameters, callback, "GET");
    },
	/*
	 * Get Terms and Conditions Array
	 */
	getTerms: function( auth_token, coupon_token, callback ) {
		var url = ApiWuaki.APIBaseURL + "me/terms_conditions" + "." + ApiWuaki.APIFileExtension;
		var parameters = {};
		parameters.auth_token = auth_token;
		parameters.coupon_token = coupon_token;
		
		return ApiWuaki.createRequest("getTerms",url,parameters,callback,"GET");
	},
	acceptTerms: function( auth_token, terms_id, callback ) {
		var url = ApiWuaki.APIBaseURL + "me/terms_conditions/" + terms_id;
		var parameters = {};
		parameters.auth_token = auth_token;
		parameters.terms_id = terms_id;
		parameters.serial_number = Wuaki.getDeviceId();
		
		return ApiWuaki.createRequest("acceptTerms",url,parameters,callback,"PUT");
	}
};
