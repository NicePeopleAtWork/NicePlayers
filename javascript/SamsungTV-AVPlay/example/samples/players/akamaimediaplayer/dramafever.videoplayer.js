// SWAPPED LOCAL FILE

var DFVideoPlayer = function(params) {
    var $this = this;
    $this.debug = false;
    $this.cs = 'TtLakcKgf6etmweB';
    $this.enableShortcuts = true;

    var defaults = {
        'autoplay': false,
        'plat': 'hulu',
        'inst': null,
        'prog': null,
        'st': 0,
        'next': null,
        'sid': 0,
        'cid': 0,
        'num': 0,
        'videotype': '',
        'guid': '',
        'logTimeout': 60000,
        'logTimer': null,
        'page_domain': '',
        'player_version': '',
        'view_as_premium': false,
        'check_mature': false,
        'cpid': '',
        'cbid': '',
        'csid': '',
        'vap': false,
        'tvnetwork': null,
        'audio_lang': null,
        'embed': false,
        'container_id': "akamai-media-player",
        'xmlLoaded': $.Deferred(),
        'youbora_id': "dramafever",
        'hide_captions': false,
        'caption_lang': false,
        'env': 'prod',
        'broadcast_language': '',
        'protocol': 'https'
    };


    $this.data = $.extend(defaults, params);

    $this.status = {
        'state': -1,
        'is_fullscreen': false,
        'is_ad': false,
        'is_marked': false,
        'started': false,
        'resumed': false,
        'resume_started': false,
        'start_timecode': 0,
        'end_timecode': 0
    };

    if ($this.data.csid == '') {
        $this.data.csid = uuid.v4();
    }

    if ($this.data.cpid == '') {
        $this.data.cpid = $.cookie('persistent_id');
        if ($this.data.cpid == '' || $this.data.cpid == null) {
            $this.data.cpid = uuid.v4();
            $.cookie(
                "persistent_id",
                $this.data.cpid, { expires: 10950, path: "/", domain: $.dramafever.basedomain() }
            );
        }
    }

    if ($this.data.cbid == '') {
        $this.data.cbid = $.cookie('browser_id');
        if ($this.data.cbid == '' || $this.data.cbid == null) {
            $this.data.cbid = uuid.v4();
            $.cookie(
                "browser_id",
                $this.data.cbid, { path: "/", domain: $.dramafever.basedomain() }
            );
        }
    }

    if ($this.data.plat == 'hulu') {

        // add listeners
        NewSite.addListener('newsiteReady', $this);
        NewSite.addListener('videoStateChange', $this);
        NewSite.addListener('videoAdBegin', $this);
        NewSite.addListener('videoAdEnd', $this);
        NewSite.addListener('theEnd', $this);
        NewSite.addListener('videoStart', $this);
        NewSite.addListener('videoPlayheadUpdate', $this);

        // listen for progress
        $this.playhead = 0;

        // resize for fluid layout
        $($this.data.inst.instance).css({
            'height': '100%',
            'width': '100%'
        });

        $this.data.inst.playVideo($this.data.cid);

    } else if ($this.data.plat == 'amp') {

        $this.cs = 'fWzCX2fzMwWTtJ4A';
        $this.playhead = 0;

        if (urlParams.audio_lang != undefined && urlParams.audio_lang.length == 2) {
            this.data.audio_lang = urlParams.audio_lang;
        }

        if (urlParams.ap != undefined && urlParams.ap == '1') {
            $this.data.autoplay = true;
        }

        // override the start time with the
        if (urlParams.st != undefined) {
            $this.data.st = urlParams.st;
        } else if (urlParams.starttime != undefined) {
            $this.data.st = urlParams.starttime;
        }

        var data_url = '/my/video/data/?guid=' + $this.data.guid;
        $.get(data_url,
            function(data) {
                $this.data.prog = data['prog'];
                $this.data.check_mature = data['check_mature'];
                $this.data.vap = data['view_as_premium'];
                $this.data.adtag = data['ad_tag'];
                $this.data.mediaanalytics = data['media_analytics'];
                $this.data.new_amp = data['new_amp'];
                $this.data.premium_data = data['premium'];
                var use_new_amp_string = ($this.data.new_amp) ? ".new" : ""
                var use_new_amp_type = ($this.data.new_amp) ? "json" : "xml"
                    // var view_as_premium_string = ($this.data.view_as_premium) ? "premium." : ""
                var view_as_premium_string = '';
                var script_url = $.dramafever.static_url + "amp.premier" + use_new_amp_string + "/amp.premier.js";
                $.ajax({
                    url: script_url,
                    cache: true,
                    dataType: "script"
                }).done(function(data) {
                    akamai.amp.AMP.loadDefaults($.dramafever.static_url + "amp.premier" + use_new_amp_string + "/amp.premier." + view_as_premium_string + use_new_amp_type, function() {
                        $this.data.xmlLoaded.resolve('resolve');
                    });
                    if (!$this.data.check_mature) {
                        $this.createPlayer();
                    } else {
                        $('.blocked-message.blocked-mature').removeClass('hidden');
                    }
                });
            }
        );

        $this.hdModal();

    } // end amp
};

DFVideoPlayer.prototype = {

    onStart: function() {
        if (!this.status.started) {
            this.status.started = true;
            this.episode_count(this.data.id, this.data.num, this.data.plat);
        }
    },

    onPause: function(time) {},

    newsiteReady: function() {

        this.log('newsiteReady');
        this.data.loaded = true;
        this.status.state = 1;

    },

    videoStateChange: function(state) {
        this.log('changing state to: ' + state);

        if (state == 'playing' && !this.status.is_ad) {
            this.status.start_timecode = this.getCurrentTime();
            this.postva('play',
                this.status.start_timecode,
                this.data.videotype,
                this.status.start_timecode,
                this.status.end_timecode);
            if (this.status.state == 4 || this.status.state == 5) {
                this.startLogTimer();
            }
            this.status.state = 3;
        } else if (state == 'playing' && this.status.is_ad) {
            this.status.state = 4;
        }

        if (state == 'paused' && !this.status.is_ad) {
            this.stopLogTimer();
            this.status.end_timecode = this.getCurrentTime();
            this.postva('watch',
                this.status.end_timecode,
                this.data.videotype,
                this.status.start_timecode,
                this.status.end_timecode);
            this.postva('pause',
                this.status.end_timecode,
                this.data.videotype,
                this.status.start_timecode,
                this.status.end_timecode);
            this.status.state = 5;
        }
    },

    videoAdBegin: function(adInfo) {
        this.log('Video Ad Start');
        this.status.is_ad = true;
        this.postvad('ad_start', 'null', 'null', this.getCurrentTime());
    },

    videoAdEnd: function() {
        this.log('Video Ad End');
        if (this.status.is_ad) {
            $.dramafever.dfad(this.data.id, this.data.epnum, this.data.plat);
        } else {
            $.dramafever.dfadm(this.data.id, this.data.epnum, this.data.plat);
        }
        this.postvad('ad_end', 'null', 'null', this.getCurrentTime());
        this.status.is_ad = false;
    },

    theEnd: function() {
        this.stopLogTimer();
        this.status.end_timecode = this.getCurrentTime();
        this.postva('watch',
            this.status.end_timecode,
            this.data.videotype,
            this.status.start_timecode,
            this.status.end_timecode);
        this.postva('pause',
            this.status.end_timecode,
            this.data.videotype,
            this.status.start_timecode,
            this.status.end_timecode);
        if (this.data.next) {
            window.location = this.data.next;
        }
    },

    videoStart: function(data) {
        if (data == 'clip' && !this.status.started) {
            if (this.data.plat == 'hulu' && this.data.inst.properties.duration * 0.98 < this.data.prog) {
                this.data.prog = 0
            }
            this.status.started = true;
            this.data.inst.seek(this.data.prog);
            this.episode_count(this.data.id, this.data.num, this.data.plat);
            this.data.duration = this.data.inst.getProperty('duration');
            this.status.start_timecode = this.getCurrentTime();
            this.postva('play', this.status.start_timecode,
                this.data.videotype,
                this.status.start_timecode,
                this.status.end_timecode);
        }
    },

    videoPlayheadUpdate: function(data) {
        if (data.position >= this.data.duration - 2 && this.data.next) {
            window.location = this.data.next
        };
    },

    // analytics ajax functions
    episode_count: function(id, num, plat) {
        this.log('episode count');
        if (plat == 'hulu' || plat == 'amp') {
            _gaq.push(["_trackEvent", "video", "view", id + '.' + num + '.' + plat]);

            dataLayer.push({
                'event': 'video',
                'eventCategory': 'video',
                'eventAction': 'view',
                'eventLabel': id + '.' + num + '.' + plat
            });
        }
    },

    mark_ended: function(id, num, plat) {
        this.log('mark_ended');
        _gaq.push(["_trackEvent", "video", "end of video", this.data.id + '.' + this.data.num + '.' + this.data.plat]);

        dataLayer.push({
            'event': 'video',
            'eventCategory': 'video',
            'eventAction': 'end of video',
            'eventLabel': this.data.id + '.' + this.data.num + '.' + this.data.plat
        });

    },

    mark_episode: function(id, num) {
        this.status.is_marked = true;
        $.post('/episode/episodemark/' + id + '/' + num + '/', function(data) {
            if (data.redirect) { window.location = data.redirect; }
        });
    },

    mark_time: function(id, num, secs) {
        var time = Math.floor(secs);
        if ($.dramafever.simple_is_auth() && time > 0 && time != this.data.prog) {
            $.post('/episode/episodetime/' + id + '/' + num + '/' + time + '/', { 'cs': this.cs }, function(data) {
                if (data.redirect) { window.location = data.redirect; }
            });
        }
    },

    onShare: function(event) {
        var scope = angular.element($("#ShareApp")).scope();
        scope.$broadcast('showShareModal');
    },

    checkHD: function() {
        var $this = this;
        if (this.data.view_as_premium || $.dramafever.is_premium()) {
            if (this.data.is_hd === true) {
                $('.hd-overlay').toggleClass('on');
                $('.hdon').toggleClass('on');
            } else {
                $('.hd-overlay').toggleClass('on');
                $('.hdoff').toggleClass('on');
            }
        } else {
            $('.modal-akamai').fadeIn();
            $this.data.inst.getMediaElement().setPlayerProperty("qualityBtn", { state: true })
        }
    },

    hdModal: function() {
        var $this = this;
        $('.hdon').on('click', '.btn-action', function() {
            $('.hd-overlay').toggleClass('on');
            _gaq.push(["trackEvent", "HD Button", "Disable HD", $this.data.id + "." + $this.data.num]);

            dataLayer.push({
                'event': 'click',
                'eventCategory': 'HD Button',
                'eventAction': 'Disable HD',
                'eventLabel': $this.data.id + '.' + $this.data.num
            });

            $this.data.autoplay = true;
            $this.data.prog = $this.getCurrentTime();
            $this.status.resume_started = false;
            $this.data.inst.feed.setURL($this.data.protocol + "://" + location.host + $this.data.feed_lq);
            $this.data.is_hd = false;
            $.dramafever.setCookie('akamai_hd', false);
            $('.hdon').removeClass('on');
            $this.data.inst.getMediaElement().setPlayerProperty("qualityBtn", { state: true })
            return false;
        });
        $('.hdon').on('click', '.btn-default', function() {
            $('.hd-overlay').toggleClass('on');
            $('.hdon').removeClass('on');
            $this.data.inst.getMediaElement().setPlayerProperty("qualityBtn", { state: false })
            return false;
        });
        $('.hdoff').on('click', '.btn-action', function() {
            $('.hd-overlay').toggleClass('on');
            _gaq.push(["trackEvent", "HD Button", "Enable HD", $this.data.id + "." + $this.data.num]);

            dataLayer.push({
                'event': 'click',
                'eventCategory': 'HD Button',
                'eventAction': 'Enable HD',
                'eventLabel': $this.data.id + '.' + $this.data.num
            });

            $this.data.autoplay = true;
            $this.data.prog = $this.getCurrentTime();
            $this.status.resume_started = false;
            $this.data.inst.feed.setURL($this.data.protocol + "://" + location.host + $this.data.feed);
            $this.data.is_hd = true;
            $.dramafever.setCookie('akamai_hd', true);
            $('.hdoff').removeClass('on');
            $this.data.inst.getMediaElement().setPlayerProperty("qualityBtn", { state: false })
            return false;
        });
        $('.hdoff').on('click', '.btn-default', function() {
            $('.hd-overlay').toggleClass('on');
            $('.hdoff').removeClass('on');
            $this.data.inst.getMediaElement().setPlayerProperty("qualityBtn", { state: true })
            return false;
        });
    },

    updateWatchingLink: function() {
        var dfUrl = $('.continue-watching').attr('href');
        var parsed = DFC.parseUrl(dfUrl);
        var newDfUrl = parsed.protocol + '://' + parsed.host + parsed.pathname + '?' + $.param($.extend(parsed.params, { 'st': this.getCurrentTime() })) + "&ap=1";
        $('.continue-watching').attr('href', newDfUrl);
    },

    postva: function(event_type, timestamp, videotype, start_timecode, end_timecode) {
        var base_url = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        var url = base_url + '/player/log/';
        var data = {
            'event_type': event_type,
            'episode_number': this.data.num,
            'timestamp': Math.floor(timestamp),
            'persistent_user_cookie': this.data.cpid,
            'browser_id': this.data.cbid,
            'session_id': this.data.csid,
            'videotype': videotype,
            'cs': this.cs,
            'start_timecode': Math.floor(start_timecode),
            'end_timecode': Math.floor(end_timecode),
            'page_domain': this.data.embed_domain || this.data.page_domain,
            'player_version': this.data.player_version
        };
        data[this.data.type + '_id'] = this.data.id;
        var t_processva = this.processva;
        if (data.start_timecode == data.end_timecode && data.event_type == 'watch') {
            return;
        }
        $.ajax({
            type: "POST",
            xhrFields: { withCredentials: true },
            dataType: "xml",
            url: url,
            data: data,
            success: function(data) { t_processva(data); }
        });
    },

    postvad: function(event_type, ad_network, ad_content_type, timestamp, videotype) {
        if (videotype === undefined || videotype == null) { videotype = 'ad' }
        var base_url = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        var url = base_url + '/player/log/';
        var pid = $.cookie('persistent_id');
        var bid = $.cookie('browser_id');
        var csid = this.data.csid;
        var data = {
            'event_type': event_type,
            'episode_number': this.data.num,
            'timestamp': Math.floor(timestamp),
            'persistent_user_cookie': pid,
            'browser_id': bid,
            'session_id': csid,
            'videotype': videotype,
            'cs': this.cs,
            'start_timecode': Math.floor(this.status.start_timecode),
            'end_timecode': Math.floor(this.status.end_timecode),
            'ad_network': ad_network,
            'ad_content_type': ad_content_type,
            'ad_campaign_id': "null",
            'ad_duration': "null",
            'page_domain': this.data.embed_domain || this.data.page_domain
        };
        data[this.data.type + '_id'] = this.data.id;
        var t_processva = this.processva;
        $.ajax({
            type: "POST",
            xhrFields: { withCredentials: true },
            dataType: "xml",
            url: url,
            data: data,
            success: function(data) { t_processva(data); }
        });
    },

    processva: function(data) {
        try {
            var sresp = $(data).find("stream_response").first().text();
            if (sresp == "Fail") {
                window.location = '/error/simulstream/';
            }
        } catch (err) {
            if (window.console) { console.log('processva exception ' + err); }
        }
    },

    getCurrentTime: function() {
        return (this.data.inst.getCurrentTime());
    },

    printobj: function(obj) {
        if (this.debug && window.console) {
            $.each(obj, function(key, element) {
                console.log('key: ' + key + '=' + element);
            });
        }
    },

    startLogTimer: function() {
        var player = this;
        player.data.logTimer = setInterval(function() {
            player.status.end_timecode = player.getCurrentTime();
            if (!player.status.playing && player.status.end_timecode != 0) {
                player.postva('watch',
                    player.status.end_timecode,
                    player.data.videotype,
                    player.status.start_timecode,
                    player.status.end_timecode);
                player.status.start_timecode = player.status.end_timecode;
            }
        }, this.data.logTimeout);
    },

    stopLogTimer: function() {
        clearInterval(this.data.logTimer);
    },

    checkresume: function() {
        this.log('checkresume started=' + this.status.started);
        var $this = this;
        if (!this.status.resume_started) {
            this.status.resume_started = true;
            this.log('checkresume st=' + this.data.st + ' prog=' + this.data.prog);
            if (this.data.st > 0) {
                this.log('checkresume st=' + this.data.st);
                setTimeout(function() {
                    $this.data.inst.setCurrentTime($this.data.st);
                }, 100);
            } else if (this.data.prog > 0) {
                this.log('checkresume prog=' + this.data.prog);
                setTimeout(function() {
                    $this.data.inst.setCurrentTime($this.data.prog);
                }, 100);
            }
        }
    },

    postga: function(category, action, label) {
        this.log('postga,' + category + ',' + action + ',' + label);
    },

    continuePlay: function() {
        this.log('continuePlay next=' + this.data.next + ' premium=' + this.data.view_as_premium);
        if (this.data.next && !this.data.view_as_premium) {
            this.log('calling next');
            if (this.data.next.indexOf('ap=1') == -1) {
                if (this.data.next.indexOf('?') == -1) {
                    this.data.next = this.data.next + '?ap=1';
                } else {
                    this.data.next = this.data.next + '&ap=1';
                }
            }
            window.location = this.data.next;
        }
    },

    pictureState: function() {
        var $this = this;

        if (Math.random() > 0.5) { //crappy variation selector
            var recopromise = $.dramafever.get_recommendations(
                true, $('.df-tab-container').data('sid'));
            recopromise.success(function(data) {
                var www = $('#pip>.row>.col-md-9>.row');
                www.empty();
                var reco = data.series;
                for (var i = 0; i < Math.min(reco.length, 3); i++) {
                    var adiv = document.createElement('div');
                    adiv.className = 'col-md-4';
                    var anchor = document.createElement('a');
                    anchor.href = reco[i].www_next_url;
                    anchor.className = 'img-fade';
                    var img = document.createElement('img');
                    img.src = reco[i].nowplay_small;
                    img.alt = reco[i].name;
                    img.style.width = "250px"
                        //'onerror="this.src=\'v2/img/fallbacks/slider-placeholder.jpg\'"' +
                    anchor.appendChild(img);
                    adiv.appendChild(anchor);
                    www.append(adiv);
                }

            });
        }

        $('.df-player').addClass('picture-state');
        $('.picture-state .akamai-video-layer').css('overflow', 'hidden');
        $('.picture-state .akamai-video-layer').html($('#end-screen').removeClass('hidden'));
        $('#btn-replay').click(function() {
            clearInterval($this.data.secondsInterval);
            $this.data.inst.replay();
            $('#end-screen').addClass('hidden');
            $('.df-player').removeClass('picture-state');
        });

        if ($this.data.next) {
            var secondsLeft = 9;
            var secondsContainer = $('.seconds');
            this.data.secondsInterval = setInterval(function() {
                secondsContainer.html(--secondsLeft);
                if (secondsLeft == 1) {
                    clearInterval($this.data.secondsInterval);
                    window.location = $this.data.next + '?ap=1';
                }
            }, 1000);
        } else {
            $('#pip .next-episode').hide();
        }
    },

    ampReadyHandler: function(event) {
        if (window.console) { console.log("ampReadyHandler in"); }
        var $this = $.videoplayer;

        $this.data.container = $('.df-akamai-player');

        if (window.console) { console.log("ampReadyHandler, $this=" + $this); }

        $($this.data.inst.instance).css({
            'height': '100%',
            'width': '100%'
        });

        $this.data.container.find('.df-akamai-player-btn-play').on('click', function(e) {
            $this.data.inst.play();
        });

        if ($this.data.vap) {
            $this.data.inst.getMediaElement().setPlayerProperty('qualityBtn', { state: false });
        }

        if (!$this.data.is_hd) {
            $this.data.inst.getMediaElement().setPlayerProperty('qualityBtn', { state: true })
        }

        $this.data.player_version = $this.data.inst.getVersion().replace("AMP Premier - dramafever ", "");

        $this.data.inst.addEventListener(
            "canplaythrough",
            function(obj) {
                $this.log('canplaythrough obj.data.type=' + obj.data.type + ' enabled=' + obj.data.enabled);
                if (obj && obj.data && obj.data.enabled == true) {
                    $this.checkresume();
                    $this.log('canplaythrough after checkresume');
                }
            }
        );

        // start popup subtitles after mediaLoadStateReady
        $this.data.inst.addEventListener(
            "mediaLoadStateReady",
            function(obj) {
                if ($this.data.hide_captions) {
                    $this.data.inst.getMediaElement().setPlayerProperty("captionDisplay", { visible: false });
                }

                if ($this.data.caption_lang) {
                    $this.data.inst.captioning.selectTrackByLanguage($this.data.caption_lang);
                }

                if (!$this.data.embed) {
                    var isIE11 = '-ms-scroll-limit' in document.documentElement.style && '-ms-ime-align' in document.documentElement.style;
                    if ( /*@cc_on!@*/ true && !isIE11) {
                        // $('#btn-popout').addClass('shown');
                        $(window).bind('storage', function(e) {
                            var keys = e.originalEvent.key.split('.');
                            if (keys[0] == 'popout' && keys[1] == $this.data.id && keys[2] == $this.data.num)
                                $this.data.inst.setCurrentTime(e.originalEvent.newValue);
                        });
                    }
                    localStorage['popout.' + $this.data.id + '.' + $this.data.num + '.timestamp'] = -1; // reset timestamp
                    function updateSubs() {
                        localStorage['popout.' + $this.data.id + '.' + $this.data.num + '.timestamp'] = $this.getCurrentTime();
                    }
                    // setInterval(updateSubs, 700); // poll for current time
                }
            }
        );

        $this.data.inst.addEventListener(
            "fullscreenchange",
            function(obj) {
                $this.status.is_fullscreen = obj.data
            }
        );

        if ($this.enableShortcuts) {
            $this.data.inst.addEventListener('mediaPlayerKeyPress', function(obj) {
                key = {
                    pause: 32,
                    exit: 27,
                    fullscreen: 70,
                    mute: 77,
                    arrow: { voldown: 40, volup: 38, back: 37, fwd: 39 },
                    seek: { one: 49, two: 50, three: 51, four: 52, five: 53, six: 54, seven: 55, eight: 56, nine: 57 }
                }

                var keyCode = obj.data.key,
                    player = $this.data.inst,
                    currVol = player.getVolume(),
                    currTime = player.getCurrentTime(),
                    duration = player.getDuration();

                if (obj.data.type === 'keyDown') {
                    switch (keyCode) {
                        case key.pause:
                            if ($this.status.is_fullscreen === false) {
                                if (player.paused === false) {
                                    player.pause();
                                } else {
                                    player.play();
                                }
                            }
                            break;
                        case key.exit:
                            $this.log('Exit fullscreen');
                            break;
                        case key.fullscreen:
                            $this.log('Fullscreen');
                            break;
                        case key.mute:
                            if (player.getMuted() === true) {
                                player.unmute();
                            } else {
                                player.mute();
                            }
                            break;
                        case key.arrow.voldown:
                            player.setVolume(currVol -= 0.1);
                            break;
                        case key.arrow.volup:
                            player.setVolume(currVol += 0.1);
                            break;
                        case key.arrow.back:
                            player.setCurrentTime(currTime -= 10);
                            break;
                        case key.arrow.fwd:
                            player.setCurrentTime(currTime += 10);
                            break;
                        case key.seek.one:
                            player.setCurrentTime(duration * 0.1);
                            break;
                        case key.seek.two:
                            player.setCurrentTime(duration * 0.2);
                            break;
                        case key.seek.three:
                            player.setCurrentTime(duration * 0.3);
                            break;
                        case key.seek.four:
                            player.setCurrentTime(duration * 0.4);
                            break;
                        case key.seek.five:
                            player.setCurrentTime(duration * 0.5);
                            break;
                        case key.seek.six:
                            player.setCurrentTime(duration * 0.6);
                            break;
                        case key.seek.seven:
                            player.setCurrentTime(duration * 0.7);
                            break;
                        case key.seek.eight:
                            player.setCurrentTime(duration * 0.8);
                            break;
                        case key.seek.nine:
                            player.setCurrentTime(duration * 0.9);
                            break;
                        default:
                            return;
                    }
                }
            });
        }

        $this.data.inst.addEventListener(
            "playing",
            function(event) {
                $this.log('playing');
                if (!$this.status.started) {
                    $this.status.started = true;
                    $this.status.start_timecode = $this.getCurrentTime();
                    $this.postva('play',
                        $this.status.start_timecode,
                        $this.data.videotype,
                        $this.status.start_timecode,
                        $this.status.end_timecode
                    );
                }
                $this.stopLogTimer();
                $this.startLogTimer();
            }
        );

        $this.data.inst.addEventListener(
            "play",
            function(event) {
                $this.log('play');
                if (!$this.status.started) {
                    $this.episode_count($this.data.id, $this.data.num, $this.data.plat);
                    // custom event for GTM and nanigans
                    dataLayer.push({ 'event': 'ampPlayerVideoPlay' });
                }
                $this.status.started = true;
                $this.startLogTimer();
                $this.status.start_timecode = $this.getCurrentTime();
                $this.postva('play',
                    $this.status.start_timecode,
                    $this.data.videotype,
                    $this.status.start_timecode,
                    $this.status.end_timecode
                );
                $this.onStart();
                $(document).trigger('onPlayerStart'); // hide pause screen
                $this.data.inst.controls.setMode('auto') // turn on auto-hide
            }
        );

        $this.data.inst.addEventListener(
            "pause",
            function(event) {
                $this.log('pause');
                $this.stopLogTimer();
                $this.log('pause 2');
                $this.status.end_timecode = $this.getCurrentTime();
                $this.log('pause 3');
                $this.postva('watch',
                    $this.status.end_timecode,
                    $this.data.videotype,
                    $this.status.start_timecode,
                    $this.status.end_timecode
                );
                $this.log('pause 4');
                $this.postva('pause',
                    $this.status.end_timecode,
                    $this.data.videotype,
                    $this.status.start_timecode,
                    $this.status.end_timecode
                );
                if ($this.data.embed) {
                    $this.updateWatchingLink();
                }
                $this.log('pause end');
            }
        );

        $this.data.inst.addEventListener(
            "ended",
            function(event) {
                $this.log('ended');
                $this.stopLogTimer();
                // When video ended we should stop posting the video - heartbeat event to GA and GTM
                if ($this.data.gaEvent) {
                    clearInterval($this.data.gaEvent);
                }
                if ($this.data.gtmEvent) {
                    clearInterval($this.data.gtmEvent);
                }

                $this.status.end_timecode = $this.getCurrentTime();
                $this.postva('watch',
                    $this.status.end_timecode,
                    $this.data.videotype,
                    $this.status.start_timecode,
                    $this.status.end_timecode
                );
                $this.postva('pause',
                    $this.status.end_timecode,
                    $this.data.videotype,
                    $this.status.start_timecode,
                    $this.status.end_timecode
                );
                $this.mark_ended();
                $this.log('ended, showing end screen');
                $('#pip').addClass("in");
                if ($this.data.embed) {
                    $('#pause-screen').removeClass('hidden');
                    $(".poster-wrapper").removeClass('hidden');
                    $this.updateWatchingLink();
                } else if ($this.data.type != "clip") {
                    $this.pictureState();
                }
            }
        );

        if ($this.data.inst.ads) {
            $this.data.inst.addEventListener(
                "adComponentAdBegin",
                function(event) {
                    ad_details = '' + $this.data.id + '.' + $this.data.num + '.' + $this.data.plat + '.' + event.data.id + '.' + event.data.title;
                    $this.status.is_ad = true;
                    $this.log('ad started: ' + ad_details);
                    _gaq.push(["_trackEvent", "video", "ad", ad_details]);

                    dataLayer.push({
                        'event': 'video',
                        'eventCategory': 'video',
                        'eventAction': 'ad_begin',
                        'eventLabel': $this.data.id + '.' + $this.data.num + '.' + $this.data.plat + '.' + event.data.id + '.' + event.data.title
                    });

                    $(document).trigger('onPlayerStart'); // hide pause screen
                    $this.postvad('ad_begin',
                        event.data.adSystem,
                        event.data.apiFramework,
                        $this.getCurrentTime()
                    );
                }
            );

            $this.data.inst.addEventListener(
                "adComponentAdComplete",
                function(event) {
                    ad_details = '' + $this.data.id + '.' + $this.data.num + '.' + $this.data.plat + '.' + event.data.id + '.' + event.data.title;
                    $this.log('ad ended: ' + ad_details);
                    $this.status.is_ad = false;
                    $this.postvad('ad_end',
                        event.data.adSystem,
                        event.data.apiFramework,
                        $this.getCurrentTime()
                    );

                    dataLayer.push({
                        'event': 'video',
                        'eventCategory': 'video',
                        'eventAction': 'ad_end',
                        'eventLabel': $this.data.id + '.' + $this.data.num + '.' + $this.data.plat + '.' + event.data.id + '.' + event.data.title
                    });
                }
            );

            $this.data.inst.addEventListener(
                "adComponentCompanion",
                function(event) {
                    $this.log('ads.companion');
                }
            );

            $this.data.inst.addEventListener(
                "adComponentError",
                function(event) {
                    $this.log('ads.error');
                    _gaq.push(["_trackEvent", "video", "adm", $this.data.id + '.' + $this.data.num]);

                    dataLayer.push({
                        'event': 'video',
                        'eventCategory': 'video',
                        'eventAction': 'ad_error',
                        'eventLabel': $this.data.id + '.' + $this.data.num
                    });
                }
            );
        }

        $this.data.inst.share.addEventListener(
            "share",
            function(event) {
                $this.log('share');
                var scope = angular.element($("#ShareApp")).scope();
                scope.$broadcast('showShareModal', event.data);
            }
        );

        $this.data.inst.addEventListener('mediaPlayerResumeOrPausePlayback', function(e) {

            $this.data.container.removeClass('init-state');

            if ($this.data.inst.paused === true && !$this.status.is_ad) {

                $this.data.container.addClass('is-paused');

                // show premium pause screen

                if (!$this.data.view_as_premium) {

                    $(document).trigger('onPlayerPause');
                    if ($this.data.embed == true) {
                        $('#pause-screen').removeClass('hidden');
                    }
                    e.target.controls.setMode('fixed');
                }


            } else {

                $this.data.container.removeClass('is-paused');
                $(document).trigger('onPlayerStart');
                if ($this.data.embed == true) {
                    $('#pause-screen').addClass('hidden');
                }
                e.target.controls.setMode('auto');
            }
        });

        // for amp 2.0014+
        $this.data.inst.addEventListener(
            "mediaPlayerElementEvent",
            function(obj) {
                if (obj.data.element === 'nextBtn' && obj.data.type === 'click') {
                    if ($this.data.next) {
                        window.location = $this.data.next;
                    } else {
                        $('#amp_next_overlay').fadeIn().delay(1000).fadeOut();
                    }
                } else if (obj.data.element === 'qualityBtn' && obj.data.type === 'click') {
                    // hd button
                    if ($this.data.embed) {
                        $('.embed-hd').show().delay(1000).fadeOut();
                        $this.data.inst.getMediaElement().setPlayerProperty("qualityBtn", { state: true });
                        return;
                    }
                    $this.checkHD();
                }
            }
        );

        $this.data.inst.addEventListener(
            "seeking",
            function(obj) {
                $this.status.end_timecode = $this.data.inst.getCurrentTime();
                $this.postva('watch',
                    $this.status.end_timecode,
                    $this.data.videotype,
                    $this.status.start_timecode,
                    $this.status.end_timecode);
                $this.postva('seek_begin',
                    $this.status.end_timecode,
                    $this.data.videotype,
                    $this.status.start_timecode,
                    $this.status.end_timecode);
                if ($this.data.logTimer) {
                    $this.stopLogTimer();
                }
            }
        );

        $this.data.inst.addEventListener(
            "seeked",
            function(obj) {
                $this.status.start_timecode = $this.data.inst.getCurrentTime();
                $this.postva('seek_end',
                    $this.status.start_timecode,
                    $this.data.videotype,
                    $this.status.end_timecode,
                    $this.status.start_timecode);
                if ($this.data.logTimer) {
                    $this.stopLogTimer();
                }
                $this.startLogTimer();

            }
        );

        $this.data.inst.share.addEventListener(
            "share",
            function(event) {
                var scope = angular.element($("#ShareApp")).scope();
                scope.$broadcast('showShareModal', event.data);
            }
        );

        $this.data.inst.addEventListener(
            "mediaPlayerError",
            function(event) {
                /* stop watch logging if 'stream not found' error */
                if (event.data.id == 16) {
                    $this.stopLogTimer();
                } else if (event.data.id == -1) {
                    /* show error message and block player when feed 403s */
                    $('#forbidden').show()
                }
            }
        );

        $this.data.inst.addEventListener(
            "mediaPlayerCaptionLangChange",
            function(obj) {
                $.cookie('amp_subtitle_language', obj.data.toLang.language);
            }
        );

        if ($this.data.embed) {
            $this.data.inst.getMediaElement().setPlayerProperty("nextBtn", { visible: false });
        }

        if (!$this.data.view_as_premium && $this.data.type == 'clip') {
            $this.data.inst.getMediaElement().setPlayerProperty("qualityBtn", { visible: false });
        }

        if ($this.data.autoplay) {
            $this.data.inst.setAutoplay(true);
        }

    },

    createPlayer: function(obj) {
        var $this = this;
        var cust_already = true;

        if ($this.data.st > 0 || $this.data.prog > 0) {
            $this.data.ad_tag = $this.data.ad_tag + '%26is_resuming%3Dtrue';
        }

        if ($this.data.type == 'clip') {
            $this.data.ad_tag = $this.data.ad_tag + '%26sid%3Dc.' + $this.data.id;
        } else {
            $this.data.ad_tag = $this.data.ad_tag + '%26sid%3D' + $this.data.id;
        }

        if ($this.data.tvnetwork != null) {
            $this.data.ad_tag = $this.data.ad_tag + '%26network%3D' + $this.data.tvnetwork;
        }


        if (cust_already) {
            $this.data.ad_tag = $this.data.ad_tag + "%26slanguage%3D" + $.dramafever.default_lang;
        }

        if ($.cookie('amp_subtitle_language')) {
            $this.data.ad_tag = $this.data.ad_tag + "%26sub%3D" + $.cookie('amp_subtitle_language');
        }

        if ($this.data.premium_data) {
            if ($this.data.premium_data.video_ad_code) {
                $this.data.ad_tag = $this.data.ad_tag + "%26video_ad_code%3D" + $this.data.premium_data.video_ad_code;
            }
        }

        var freewheelKeyValues = {
            country: $.dramafever.params.country,
            sub: $.cookie('amp_subtitle_language') || 'English',
            env: $this.data.env,
            bl: $this.data.broadcast_language,
            platform: 'web'
        };
        if ($this.data.premium_data) {
            freewheelKeyValues.video_ad_code = $this.data.premium_data.video_ad_code;
        } else {
            freewheelKeyValues.video_ad_code = "";
        }

        var init = {
            'autoplay': $this.data.autoplay,
            feed: { url: $this.data.protocol + "://" + location.host + $this.data.feed },
            captioning: { enabled: true },
            flash: {
                params: { wmode: (/Windows/.test(navigator.userAgent)) ? "transparent" : "direct" },
                vars: { hds_enable_ssl_transfer: true }
            },
            ima: { enabled: true, adTagUrl: $this.data.ad_tag },
            mediaanalytics: $this.data.mediaanalytics,
            comscore: {
                url: "//b.scorecardresearch.com/p",
                data: {
                    c1: "1",
                    c2: "14909701",
                    c3: "",
                    c4: "",
                    c5: "03",
                    c6: $this.data.guid,
                    c7: document.location.href,
                    c8: document.title,
                    c9: "",
                    c10: "1-1",
                    c14: ""
                },
                events: { video: [{ type: "started" }], ads: [{ type: "started", data: { c5: "11" } }] }
            }
        };

        if ($this.data.new_amp) {
            // change this for freewheel
            init.ima.enabled = false;
            init.freewheel = {
                enabled: true,
                plugin: {
                    js: "https://mssl.fwmrm.net/p/vitest-js/AdManager.js",
                    swf: "https://mssl.fwmrm.net/p/df_live/AdManager.swf?logLevel=VERBOSE"
                },
                networkId: 385234,
                serverUrl: "5e0d2.v.fwmrm.net",
                profileId: "385234:df_flash_live",
                siteSectionId: "df_desktop_episode",
                videoAssetId: $this.data.guid,
                prerollSlotId: "Preroll_1",
                midrollSlotId: "Midroll_1",
                postrollSlotId: "Postroll_1",
                keyValues: freewheelKeyValues,
                keyValuesString: $.param(freewheelKeyValues)
            };
        };

        if ($this.data.premium_preview) {
            init.ima = { enabled: false };
            init.freewheel = { enabled: false };

        }

        if (!$this.data.vap || $.cookie('akamai_hd') === 'false') {
            init.feed.url = $this.data.protocol + "://" + location.host + $this.data.feed + "&hd=False"
            $this.data.is_hd = false;
        }

        if (obj != undefined && obj.autoplay != undefined && obj.autoplay) { init['autoplay'] = obj.autoplay; }

        $('.blocked-mature').hide();

        $this.data.xmlLoaded.done(function() {
            $this.data.inst = akamai.amp.AMP.create($this.data.container_id, init, $this.ampReadyHandler);

            //youbora
            $.getScript("//pre-smartplugin.youbora.com/5.0/plugins/akamaimediaplayer/5.1.0/sp.min.js", function(data, textStatus, jqxhr) {
                $YB.debugLevel = 0;
                window.youbora = new $YB.plugins.AkamaiMediaPlayer($this.data.inst, {
					accountCode: 'qamini',
					username: "hectorsito",
					transactionCode: "transactiontest",
					media: {
						isLive: true,
						duration: "12345",
						title: "test title 123" ,
						cdn: "LEVEL3",
					},
					network: {
						ip: "1.1.1.1",
						isp: "vodafone" 
					}
            	});
       		});
		});

        // Post video - hearbeat event to GA every 14 mins
        $this.data.gaEvent = setInterval(function() {
            _gaq.push(["_trackEvent", "video", "heartbeat", $this.data.id + '.' + $this.data.num + '.' + $this.data.plat]);


            if (typeof ga !== 'undefined') {
                ga('send', {
                    'hitType': 'event',
                    'eventCategory': 'video',
                    'eventAction': 'heartbeat',
                    'eventLabel': $this.data.id + '.' + $this.data.num + '.' + $this.data.plat
                });
            }
        }, 840000);

        // Post video - hearbeat event to GTM
        $this.data.gtmEvent = setInterval(function() {
            dataLayer.push({
                'event': 'video',
                'eventCategory': 'video',
                'eventAction': 'heartbeat',
                'eventLabel': $this.data.id + '.' + $this.data.num + '.' + $this.data.plat
            });
        }, 840000);

        $('.modal-akamai .icon-remove-sign').on('click', function() {
            $('.modal-akamai').fadeOut();
        });

        this.log('out of createPlayer');
    },

    log: function(msg) {
        if (window.console && this.debug) { console.log(msg); }
    }
}