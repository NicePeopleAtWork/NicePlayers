    /* ENYO XHR FIX */
    $YB.AjaxRequest.prototype.createXHR = function() {
        try {
            return new enyo.Ajax();
        } catch (err) {
            $YB.error(err);
            return {};
        }
    };

    $YB.AjaxRequest.prototype.getXHR = function() {
        return this.xhr.xhr;
    };

    $YB.AjaxRequest.prototype.on = function(event, callback) {
        try {
            if (typeof callback != "undefined" && typeof callback != "function") {
                $YB.warn("Warning: Request '" + this.getUrl() + "' has a callback that is not a function.");
                return this;
            }

            if (event == 'error') {
                this.hasError = true;
                this.xhr.error(callback);
            } else {
                this.xhr.response(callback);
            }

        } catch (err) {
            $YB.error(err);
        } finally {
            return this;
        }
    };

    $YB.AjaxRequest.prototype.send = function() {
        try {
            this.xhr.url = this.getUrl();
            this.xhr.handleAs = 'xml';
            this.xhr.method = this.options.method;

            if (this.options.requestHeaders) {
                this.xhr.headers = this.options.requestHeaders;
            }

            if (!this.hasError && this.options.retryAfter > 0 && this.options.maxRetries > 0) {
                var that = this;
                this.error(function genericError() {
                    that.retries++;
                    if (that.retries > that.options.maxRetries) {
                        $YB.error("Error: Aborting failed request. Max retries reached.");
                    } else {
                        $YB.error("Error: Request failed. Retry " + that.retries + " of " + that.options.maxRetries + " in " + that.options.retryAfter + "ms.");

                        setTimeout(function() {
                            that.xhr.errorHandlers = [];
                            that.send();
                        }, that.options.retryAfter);
                    }
                });
            }

            $YB.report("XHR Req: " + this.getUrl(), 5, 'navy');

            this.xhr.go();

        } catch (err) {
            $YB.error(err);
        }
    };
    /**/
