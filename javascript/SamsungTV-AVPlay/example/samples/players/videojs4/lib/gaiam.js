/* Source and licensing information for the line(s) below can be found at http://www.gaia.com/sites/all/libraries/video-js/video.dev.js. */
document.createElement('video');
document.createElement('audio');
document.createElement('track');
var vjs = function(id, options, ready) {
        var tag;
        if (typeof id === 'string') {
            if (id.indexOf('#') === 0) id = id.slice(1);
            if (vjs.players[id]) {
                if (options) vjs.log.warn('Player "' + id + '" is already initialised. Options will not be applied.');
                if (ready) vjs.players[id].ready(ready);
                return vjs.players[id]
            } else tag = vjs.el(id)
        } else tag = id;
        if (!tag || !tag.nodeName) throw new TypeError('The element or ID supplied is not valid. (videojs)');
        return tag.player || new vjs.Player(tag, options, ready)
    },
    videojs = window.videojs = vjs;
vjs.CDN_VERSION = '4.12';
vjs.ACCESS_PROTOCOL = ('https:' == document.location.protocol ? 'https://' : 'http://');
vjs.VERSION = '4.12.15';
vjs.options = {
    techOrder: ['html5', 'flash'],
    html5: {},
    flash: {},
    width: 300,
    height: 150,
    defaultVolume: 0.00,
    playbackRates: [],
    inactivityTimeout: 2e3,
    children: {
        mediaLoader: {},
        posterImage: {},
        loadingSpinner: {},
        textTrackDisplay: {},
        bigPlayButton: {},
        controlBar: {},
        errorDisplay: {},
        textTrackSettings: {}
    },
    language: document.getElementsByTagName('html')[0].getAttribute('lang') || navigator.languages && navigator.languages[0] || navigator.userLanguage || navigator.language || 'en',
    languages: {},
    notSupportedMessage: 'No compatible source was found for this video.'
};
if (vjs.CDN_VERSION !== 'GENERATED_CDN_VSN') videojs.options['flash']['swf'] = vjs.ACCESS_PROTOCOL + 'vjs.zencdn.net/' + vjs.CDN_VERSION + '/video-js.swf';
vjs.addLanguage = function(code, data) {
    if (vjs.options['languages'][code] !== undefined) {
        vjs.options['languages'][code] = vjs.util.mergeOptions(vjs.options['languages'][code], data)
    } else vjs.options['languages'][code] = data;
    return vjs.options['languages']
};
vjs.players = {};
if (typeof define === 'function' && define.amd) {
    define('videojs', [], function() {
        return videojs
    })
} else if (typeof exports === 'object' && typeof module === 'object') module.exports = videojs;
vjs.CoreObject = vjs.CoreObject = function() {};
vjs.CoreObject.extend = function(props) {
    var init, subObj;
    props = props || {};
    init = props.init || props.init || this.prototype['init'] || this.prototype.init || function() {};
    subObj = function() {
        init.apply(this, arguments)
    };
    subObj.prototype = vjs.obj.create(this.prototype);
    subObj.prototype.constructor = subObj;
    subObj.extend = vjs.CoreObject.extend;
    subObj.create = vjs.CoreObject.create;
    for (var name in props)
        if (props.hasOwnProperty(name)) subObj.prototype[name] = props[name];
    return subObj
};
vjs.CoreObject.create = function() {
    var inst = vjs.obj.create(this.prototype);
    this.apply(inst, arguments);
    return inst
};
vjs.on = function(elem, type, fn) {
    if (vjs.obj.isArray(type)) return _handleMultipleEvents(vjs.on, elem, type, fn);
    var data = vjs.getData(elem);
    if (!data.handlers) data.handlers = {};
    if (!data.handlers[type]) data.handlers[type] = [];
    if (!fn.guid) fn.guid = vjs.guid++;
    data.handlers[type].push(fn);
    if (!data.dispatcher) {
        data.disabled = false;
        data.dispatcher = function(event) {
            if (data.disabled) return;
            event = vjs.fixEvent(event);
            var handlers = data.handlers[event.type];
            if (handlers) {
                var handlersCopy = handlers.slice(0);
                for (var m = 0, n = handlersCopy.length; m < n; m++)
                    if (event.isImmediatePropagationStopped()) {
                        break
                    } else handlersCopy[m].call(elem, event)
            }
        }
    };
    if (data.handlers[type].length == 1)
        if (elem.addEventListener) {
            elem.addEventListener(type, data.dispatcher, false)
        } else if (elem.attachEvent) elem.attachEvent('on' + type, data.dispatcher)
};
vjs.off = function(elem, type, fn) {
    if (!vjs.hasData(elem)) return;
    var data = vjs.getData(elem);
    if (!data.handlers) return;
    if (vjs.obj.isArray(type)) return _handleMultipleEvents(vjs.off, elem, type, fn);
    var removeType = function(t) {
        data.handlers[t] = [];
        vjs.cleanUpEvents(elem, t)
    };
    if (!type) {
        for (var t in data.handlers) removeType(t);
        return
    };
    var handlers = data.handlers[type];
    if (!handlers) return;
    if (!fn) {
        removeType(type);
        return
    };
    if (fn.guid)
        for (var n = 0; n < handlers.length; n++)
            if (handlers[n].guid === fn.guid) handlers.splice(n--, 1);
    vjs.cleanUpEvents(elem, type)
};
vjs.cleanUpEvents = function(elem, type) {
    var data = vjs.getData(elem);
    if (data.handlers[type].length === 0) {
        delete data.handlers[type];
        if (elem.removeEventListener) {
            elem.removeEventListener(type, data.dispatcher, false)
        } else if (elem.detachEvent) elem.detachEvent('on' + type, data.dispatcher)
    };
    if (vjs.isEmpty(data.handlers)) {
        delete data.handlers;
        delete data.dispatcher;
        delete data.disabled
    };
    if (vjs.isEmpty(data)) vjs.removeData(elem)
};
vjs.fixEvent = function(event) {
    function returnTrue() {
        return true
    }

    function returnFalse() {
        return false
    };
    if (!event || !event.isPropagationStopped) {
        var old = event || window.event;
        event = {};
        for (var key in old)
            if (key !== 'layerX' && key !== 'layerY' && key !== 'keyLocation')
                if (!(key == 'returnValue' && old.preventDefault)) event[key] = old[key];
        if (!event.target) event.target = event.srcElement || document;
        event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
        event.preventDefault = function() {
            if (old.preventDefault) old.preventDefault();
            event.returnValue = false;
            event.isDefaultPrevented = returnTrue;
            event.defaultPrevented = true
        };
        event.isDefaultPrevented = returnFalse;
        event.defaultPrevented = false;
        event.stopPropagation = function() {
            if (old.stopPropagation) old.stopPropagation();
            event.cancelBubble = true;
            event.isPropagationStopped = returnTrue
        };
        event.isPropagationStopped = returnFalse;
        event.stopImmediatePropagation = function() {
            if (old.stopImmediatePropagation) old.stopImmediatePropagation();
            event.isImmediatePropagationStopped = returnTrue;
            event.stopPropagation()
        };
        event.isImmediatePropagationStopped = returnFalse;
        if (event.clientX != null) {
            var doc = document.documentElement,
                body = document.body;
            event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0)
        };
        event.which = event.charCode || event.keyCode;
        if (event.button != null) event.button = (event.button & 1 ? 0 : (event.button & 4 ? 1 : (event.button & 2 ? 2 : 0)))
    };
    return event
};
vjs.trigger = function(elem, event) {
    var elemData = (vjs.hasData(elem)) ? vjs.getData(elem) : {},
        parent = elem.parentNode || elem.ownerDocument;
    if (typeof event === 'string') event = {
        type: event,
        target: elem
    };
    event = vjs.fixEvent(event);
    if (elemData.dispatcher) elemData.dispatcher.call(elem, event);
    if (parent && !event.isPropagationStopped() && event.bubbles !== false) {
        vjs.trigger(parent, event)
    } else if (!parent && !event.defaultPrevented) {
        var targetData = vjs.getData(event.target);
        if (event.target[event.type]) {
            targetData.disabled = true;
            if (typeof event.target[event.type] === 'function') event.target[event.type]();
            targetData.disabled = false
        }
    };
    return !event.defaultPrevented
};
vjs.one = function(elem, type, fn) {
    if (vjs.obj.isArray(type)) return _handleMultipleEvents(vjs.one, elem, type, fn);
    var func = function() {
        vjs.off(elem, type, func);
        fn.apply(this, arguments)
    };
    func.guid = fn.guid = fn.guid || vjs.guid++;
    vjs.on(elem, type, func)
}

function _handleMultipleEvents(fn, elem, type, callback) {
    vjs.arr.forEach(type, function(type) {
        fn(elem, type, callback)
    })
};
var hasOwnProp = Object.prototype.hasOwnProperty;
vjs.createEl = function(tagName, properties) {
    var el;
    tagName = tagName || 'div';
    properties = properties || {};
    el = document.createElement(tagName);
    vjs.obj.each(properties, function(propName, val) {
        if (propName.indexOf('aria-') !== -1 || propName == 'role') {
            el.setAttribute(propName, val)
        } else el[propName] = val
    });
    return el
};
vjs.capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
};
vjs.obj = {};
vjs.obj.create = Object.create || function(obj) {
    function F() {};
    F.prototype = obj;
    return new F()
};
vjs.obj.each = function(obj, fn, context) {
    for (var key in obj)
        if (hasOwnProp.call(obj, key)) fn.call(context || this, key, obj[key])
};
vjs.obj.merge = function(obj1, obj2) {
    if (!obj2) return obj1;
    for (var key in obj2)
        if (hasOwnProp.call(obj2, key)) obj1[key] = obj2[key];
    return obj1
};
vjs.obj.deepMerge = function(obj1, obj2) {
    var key, val1, val2;
    obj1 = vjs.obj.copy(obj1);
    for (key in obj2)
        if (hasOwnProp.call(obj2, key)) {
            val1 = obj1[key];
            val2 = obj2[key];
            if (vjs.obj.isPlain(val1) && vjs.obj.isPlain(val2)) {
                obj1[key] = vjs.obj.deepMerge(val1, val2)
            } else obj1[key] = obj2[key]
        };
    return obj1
};
vjs.obj.copy = function(obj) {
    return vjs.obj.merge({}, obj)
};
vjs.obj.isPlain = function(obj) {
    return !!obj && typeof obj === 'object' && obj.toString() === '[object Object]' && obj.constructor === Object
};
vjs.obj.isArray = Array.isArray || function(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
};
vjs.isNaN = function(num) {
    return num !== num
};
vjs.bind = function(context, fn, uid) {
    if (!fn.guid) fn.guid = vjs.guid++;
    var ret = function() {
        return fn.apply(context, arguments)
    };
    ret.guid = uid ? uid + '_' + fn.guid : fn.guid;
    return ret
};
vjs.cache = {};
vjs.guid = 1;
vjs.expando = 'vdata' + (new Date()).getTime();
vjs.getData = function(el) {
    var id = el[vjs.expando];
    if (!id) id = el[vjs.expando] = vjs.guid++;
    if (!vjs.cache[id]) vjs.cache[id] = {};
    return vjs.cache[id]
};
vjs.hasData = function(el) {
    var id = el[vjs.expando];
    return !(!id || vjs.isEmpty(vjs.cache[id]))
};
vjs.removeData = function(el) {
    var id = el[vjs.expando];
    if (!id) return;
    delete vjs.cache[id];
    try {
        delete el[vjs.expando]
    } catch (e) {
        if (el.removeAttribute) {
            el.removeAttribute(vjs.expando)
        } else el[vjs.expando] = null
    }
};
vjs.isEmpty = function(obj) {
    for (var prop in obj)
        if (obj[prop] !== null) return false;
    return true
};
vjs.hasClass = function(element, classToCheck) {
    return ((' ' + element.className + ' ').indexOf(' ' + classToCheck + ' ') !== -1)
};
vjs.addClass = function(element, classToAdd) {
    if (!vjs.hasClass(element, classToAdd)) element.className = element.className === '' ? classToAdd : element.className + ' ' + classToAdd
};
vjs.removeClass = function(element, classToRemove) {
    var classNames, i;
    if (!vjs.hasClass(element, classToRemove)) return;
    classNames = element.className.split(' ');
    for (i = classNames.length - 1; i >= 0; i--)
        if (classNames[i] === classToRemove) classNames.splice(i, 1);
    element.className = classNames.join(' ')
};
vjs.TEST_VID = vjs.createEl('video');
(function() {
    var track = document.createElement('track');
    track.kind = 'captions';
    track.srclang = 'en';
    track.label = 'English';
    vjs.TEST_VID.appendChild(track)
})();
vjs.USER_AGENT = navigator.userAgent;
vjs.IS_IPHONE = /iPhone/i.test(vjs.USER_AGENT);
vjs.IS_IPAD = /iPad/i.test(vjs.USER_AGENT);
vjs.IS_IPOD = /iPod/i.test(vjs.USER_AGENT);
vjs.IS_IOS = vjs.IS_IPHONE || vjs.IS_IPAD || vjs.IS_IPOD;
vjs.IOS_VERSION = (function() {
    var match = vjs.USER_AGENT.match(/OS (\d+)_/i);
    if (match && match[1]) return match[1]
})();
vjs.IS_ANDROID = /Android/i.test(vjs.USER_AGENT);
vjs.ANDROID_VERSION = (function() {
    var match = vjs.USER_AGENT.match(/Android (\d+)(?:\.(\d+))?(?:\.(\d+))*/i),
        major, minor;
    if (!match) return null;
    major = match[1] && parseFloat(match[1]);
    minor = match[2] && parseFloat(match[2]);
    if (major && minor) {
        return parseFloat(match[1] + '.' + match[2])
    } else if (major) {
        return major
    } else return null
})();
vjs.IS_OLD_ANDROID = vjs.IS_ANDROID && /webkit/i.test(vjs.USER_AGENT) && vjs.ANDROID_VERSION < 2.3;
vjs.IS_FIREFOX = /Firefox/i.test(vjs.USER_AGENT);
vjs.IS_CHROME = /Chrome/i.test(vjs.USER_AGENT);
vjs.IS_IE8 = /MSIE\s8\.0/.test(vjs.USER_AGENT);
vjs.TOUCH_ENABLED = !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch);
vjs.BACKGROUND_SIZE_SUPPORTED = 'backgroundSize' in vjs.TEST_VID.style;
vjs.setElementAttributes = function(el, attributes) {
    vjs.obj.each(attributes, function(attrName, attrValue) {
        if (attrValue === null || typeof attrValue === 'undefined' || attrValue === false) {
            el.removeAttribute(attrName)
        } else el.setAttribute(attrName, (attrValue === true ? '' : attrValue))
    })
};
vjs.getElementAttributes = function(tag) {
    var obj, knownBooleans, attrs, attrName, attrVal;
    obj = {};
    knownBooleans = ',autoplay,controls,loop,muted,default,';
    if (tag && tag.attributes && tag.attributes.length > 0) {
        attrs = tag.attributes;
        for (var i = attrs.length - 1; i >= 0; i--) {
            attrName = attrs[i].name;
            attrVal = attrs[i].value;
            if (typeof tag[attrName] === 'boolean' || knownBooleans.indexOf(',' + attrName + ',') !== -1) attrVal = (attrVal !== null) ? true : false;
            obj[attrName] = attrVal
        }
    };
    return obj
};
vjs.getComputedDimension = function(el, strCssRule) {
    var strValue = '';
    if (document.defaultView && document.defaultView.getComputedStyle) {
        strValue = document.defaultView.getComputedStyle(el, '').getPropertyValue(strCssRule)
    } else if (el.currentStyle) strValue = el['client' + strCssRule.substr(0, 1).toUpperCase() + strCssRule.substr(1)] + 'px';
    return strValue
};
vjs.insertFirst = function(child, parent) {
    if (parent.firstChild) {
        parent.insertBefore(child, parent.firstChild)
    } else parent.appendChild(child)
};
vjs.browser = {};
vjs.el = function(id) {
    if (id.indexOf('#') === 0) id = id.slice(1);
    return document.getElementById(id)
};
vjs.formatTime = function(seconds, guide) {
    guide = guide || seconds;
    var s = Math.floor(seconds % 60),
        m = Math.floor(seconds / 60 % 60),
        h = Math.floor(seconds / 3600),
        gm = Math.floor(guide / 60 % 60),
        gh = Math.floor(guide / 3600);
    if (isNaN(seconds) || seconds === Infinity) h = m = s = '-';
    h = (h > 0 || gh > 0) ? h + ':' : '';
    m = (((h || gm >= 10) && m < 10) ? '0' + m : m) + ':';
    s = (s < 10) ? '0' + s : s;
    return h + m + s
};
vjs.blockTextSelection = function() {
    document.body.focus();
    document.onselectstart = function() {
        return false
    }
};
vjs.unblockTextSelection = function() {
    document.onselectstart = function() {
        return true
    }
};
vjs.trim = function(str) {
    return (str + '').replace(/^\s+|\s+$/g, '')
};
vjs.round = function(num, dec) {
    if (!dec) dec = 0;
    return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec)
};
vjs.createTimeRange = function(start, end) {
    if (start === undefined && end === undefined) return {
        length: 0,
        start: function() {
            throw new Error('This TimeRanges object is empty')
        },
        end: function() {
            throw new Error('This TimeRanges object is empty')
        }
    };
    return {
        length: 1,
        start: function() {
            return start
        },
        end: function() {
            return end
        }
    }
};
vjs.setLocalStorage = function(key, value) {
    try {
        var localStorage = window.localStorage || false;
        if (!localStorage) return;
        localStorage[key] = value
    } catch (e) {
        if (e.code == 22 || e.code == 1014) {
            vjs.log('LocalStorage Full (VideoJS)', e)
        } else if (e.code == 18) {
            vjs.log('LocalStorage not allowed (VideoJS)', e)
        } else vjs.log('LocalStorage Error (VideoJS)', e)
    }
};
vjs.getAbsoluteURL = function(url) {
    if (!url.match(/^https?:\/\//)) url = vjs.createEl('div', {
        innerHTML: '<a href="' + url + '">x</a>'
    }).firstChild.href;
    return url
};
vjs.parseUrl = function(url) {
    var div, a, addToBody, props, details;
    props = ['protocol', 'hostname', 'port', 'pathname', 'search', 'hash', 'host'];
    a = vjs.createEl('a', {
        href: url
    });
    addToBody = (a.host === '' && a.protocol !== 'file:');
    if (addToBody) {
        div = vjs.createEl('div');
        div.innerHTML = '<a href="' + url + '"></a>';
        a = div.firstChild;
        div.setAttribute('style', 'display:none; position:absolute;');
        document.body.appendChild(div)
    };
    details = {};
    for (var i = 0; i < props.length; i++) details[props[i]] = a[props[i]];
    if (details.protocol === 'http:') details.host = details.host.replace(/:80$/, '');
    if (details.protocol === 'https:') details.host = details.host.replace(/:443$/, '');
    if (addToBody) document.body.removeChild(div);
    return details
}

function _logType(type, args) {
    var argsArray, noop, console;
    argsArray = Array.prototype.slice.call(args);
    noop = function() {};
    console = window.console || {
        log: noop,
        warn: noop,
        error: noop
    };
    if (type) {
        argsArray.unshift(type.toUpperCase() + ':')
    } else type = 'log';
    vjs.log.history.push(argsArray);
    argsArray.unshift('VIDEOJS:');
    if (console[type].apply) {
        console[type].apply(console, argsArray)
    } else console[type](argsArray.join(' '))
};
vjs.log = function() {
    _logType(null, arguments)
};
vjs.log.history = [];
vjs.log.error = function() {
    _logType('error', arguments)
};
vjs.log.warn = function() {
    _logType('warn', arguments)
};
vjs.findPosition = function(el) {
    var box, docEl, body, clientLeft, scrollLeft, left, clientTop, scrollTop, top;
    if (el.getBoundingClientRect && el.parentNode) box = el.getBoundingClientRect();
    if (!box) return {
        left: 0,
        top: 0
    };
    docEl = document.documentElement;
    body = document.body;
    clientLeft = docEl.clientLeft || body.clientLeft || 0;
    scrollLeft = window.pageXOffset || body.scrollLeft;
    left = box.left + scrollLeft - clientLeft;
    clientTop = docEl.clientTop || body.clientTop || 0;
    scrollTop = window.pageYOffset || body.scrollTop;
    top = box.top + scrollTop - clientTop;
    return {
        left: vjs.round(left),
        top: vjs.round(top)
    }
};
vjs.arr = {};
vjs.arr.forEach = function(array, callback, thisArg) {
    if (vjs.obj.isArray(array) && callback instanceof Function)
        for (var i = 0, len = array.length; i < len; ++i) callback.call(thisArg || vjs, array[i], i, array);
    return array
};
vjs.xhr = function(options, callback) {
    var XHR, request, urlInfo, winLoc, fileUrl, crossOrigin, abortTimeout, successHandler, errorHandler;
    if (typeof options === 'string') options = {
        uri: options
    };
    videojs.util.mergeOptions({
        method: 'GET',
        timeout: 45 * 1e3
    }, options);
    callback = callback || function() {};
    successHandler = function() {
        window.clearTimeout(abortTimeout);
        callback(null, request, request.response || request.responseText)
    };
    errorHandler = function(err) {
        window.clearTimeout(abortTimeout);
        if (!err || typeof err === 'string') err = new Error(err);
        callback(err, request)
    };
    XHR = window.XMLHttpRequest;
    if (typeof XHR === 'undefined') XHR = function() {
        try {
            return new window.ActiveXObject('Msxml2.XMLHTTP.6.0')
        } catch (e) {};
        try {
            return new window.ActiveXObject('Msxml2.XMLHTTP.3.0')
        } catch (f) {};
        try {
            return new window.ActiveXObject('Msxml2.XMLHTTP')
        } catch (g) {};
        throw new Error('This browser does not support XMLHttpRequest.')
    };
    request = new XHR();
    request.uri = options.uri;
    urlInfo = vjs.parseUrl(options.uri);
    winLoc = window.location;
    crossOrigin = (urlInfo.protocol + urlInfo.host) !== (winLoc.protocol + winLoc.host);
    if (crossOrigin && window.XDomainRequest && !('withCredentials' in request)) {
        request = new window.XDomainRequest();
        request.onload = successHandler;
        request.onerror = errorHandler;
        request.onprogress = function() {};
        request.ontimeout = function() {}
    } else {
        fileUrl = (urlInfo.protocol == 'file:' || winLoc.protocol == 'file:');
        request.onreadystatechange = function() {
            if (request.readyState === 4) {
                if (request.timedout) return errorHandler('timeout');
                if (request.status === 200 || fileUrl && request.status === 0) {
                    successHandler()
                } else errorHandler()
            }
        };
        if (options.timeout) abortTimeout = window.setTimeout(function() {
            if (request.readyState !== 4) {
                request.timedout = true;
                request.abort()
            }
        }, options.timeout)
    };
    try {
        request.open(options.method || 'GET', options.uri, true)
    } catch (err) {
        return errorHandler(err)
    };
    if (options.withCredentials) request.withCredentials = true;
    if (options.responseType) request.responseType = options.responseType;
    try {
        request.send()
    } catch (err) {
        return errorHandler(err)
    };
    return request
};
vjs.util = {};
vjs.util.mergeOptions = function(obj1, obj2) {
    var key, val1, val2;
    obj1 = vjs.obj.copy(obj1);
    for (key in obj2)
        if (obj2.hasOwnProperty(key)) {
            val1 = obj1[key];
            val2 = obj2[key];
            if (vjs.obj.isPlain(val1) && vjs.obj.isPlain(val2)) {
                obj1[key] = vjs.util.mergeOptions(val1, val2)
            } else obj1[key] = obj2[key]
        };
    return obj1
};
vjs.EventEmitter = function() {};
vjs.EventEmitter.prototype.allowedEvents_ = {};
vjs.EventEmitter.prototype.on = function(type, fn) {
    var ael = this.addEventListener;
    this.addEventListener = Function.prototype;
    vjs.on(this, type, fn);
    this.addEventListener = ael
};
vjs.EventEmitter.prototype.addEventListener = vjs.EventEmitter.prototype.on;
vjs.EventEmitter.prototype.off = function(type, fn) {
    vjs.off(this, type, fn)
};
vjs.EventEmitter.prototype.removeEventListener = vjs.EventEmitter.prototype.off;
vjs.EventEmitter.prototype.one = function(type, fn) {
    vjs.one(this, type, fn)
};
vjs.EventEmitter.prototype.trigger = function(event) {
    var type = event.type || event;
    if (typeof event === 'string') event = {
        type: type
    };
    event = vjs.fixEvent(event);
    if (this.allowedEvents_[type] && this['on' + type]) this['on' + type](event);
    vjs.trigger(this, event)
};
vjs.EventEmitter.prototype.dispatchEvent = vjs.EventEmitter.prototype.trigger;
vjs.Component = vjs.CoreObject.extend({
    init: function(player, options, ready) {
        this.player_ = player;
        this.options_ = vjs.obj.copy(this.options_);
        options = this.options(options);
        this.id_ = options.id || (options.el && options.el['id']);
        if (!this.id_) this.id_ = ((player.id && player.id()) || 'no_player') + '_component_' + vjs.guid++;
        this.name_ = options.name || null;
        this.el_ = options.el || this.createEl();
        this.children_ = [];
        this.childIndex_ = {};
        this.childNameIndex_ = {};
        this.initChildren();
        this.ready(ready);
        if (options.reportTouchActivity !== false) this.enableTouchActivity()
    }
});
vjs.Component.prototype.dispose = function() {
    this.trigger({
        type: 'dispose',
        bubbles: false
    });
    if (this.children_)
        for (var i = this.children_.length - 1; i >= 0; i--)
            if (this.children_[i].dispose) this.children_[i].dispose();
    this.children_ = null;
    this.childIndex_ = null;
    this.childNameIndex_ = null;
    this.off();
    if (this.el_.parentNode) this.el_.parentNode.removeChild(this.el_);
    vjs.removeData(this.el_);
    this.el_ = null
};
vjs.Component.prototype.player_ = true;
vjs.Component.prototype.player = function() {
    return this.player_
};
vjs.Component.prototype.options_;
vjs.Component.prototype.options = function(obj) {
    if (obj === undefined) return this.options_;
    return this.options_ = vjs.util.mergeOptions(this.options_, obj)
};
vjs.Component.prototype.el_;
vjs.Component.prototype.createEl = function(tagName, attributes) {
    return vjs.createEl(tagName, attributes)
};
vjs.Component.prototype.localize = function(string) {
    var lang = this.player_.language(),
        languages = this.player_.languages();
    if (languages && languages[lang] && languages[lang][string]) return languages[lang][string];
    return string
};
vjs.Component.prototype.el = function() {
    return this.el_
};
vjs.Component.prototype.contentEl_;
vjs.Component.prototype.contentEl = function() {
    return this.contentEl_ || this.el_
};
vjs.Component.prototype.id_;
vjs.Component.prototype.id = function() {
    return this.id_
};
vjs.Component.prototype.name_;
vjs.Component.prototype.name = function() {
    return this.name_
};
vjs.Component.prototype.children_;
vjs.Component.prototype.children = function() {
    return this.children_
};
vjs.Component.prototype.childIndex_;
vjs.Component.prototype.getChildById = function(id) {
    return this.childIndex_[id]
};
vjs.Component.prototype.childNameIndex_;
vjs.Component.prototype.getChild = function(name) {
    return this.childNameIndex_[name]
};
vjs.Component.prototype.addChild = function(child, options) {
    var component, componentClass, componentName;
    if (typeof child === 'string') {
        componentName = child;
        options = options || {};
        componentClass = options.componentClass || vjs.capitalize(componentName);
        options.name = componentName;
        component = new window.videojs[componentClass](this.player_ || this, options)
    } else component = child;
    this.children_.push(component);
    if (typeof component.id === 'function') this.childIndex_[component.id()] = component;
    componentName = componentName || (component.name && component.name());
    if (componentName) this.childNameIndex_[componentName] = component;
    if (typeof component.el === 'function' && component.el()) this.contentEl().appendChild(component.el());
    return component
};
vjs.Component.prototype.removeChild = function(component) {
    if (typeof component === 'string') component = this.getChild(component);
    if (!component || !this.children_) return;
    var childFound = false;
    for (var i = this.children_.length - 1; i >= 0; i--)
        if (this.children_[i] === component) {
            childFound = true;
            this.children_.splice(i, 1);
            break
        };
    if (!childFound) return;
    this.childIndex_[component.id()] = null;
    this.childNameIndex_[component.name()] = null;
    var compEl = component.el();
    if (compEl && compEl.parentNode === this.contentEl()) this.contentEl().removeChild(component.el())
};
vjs.Component.prototype.initChildren = function() {
    var parent, parentOptions, children, child, name, opts, handleAdd;
    parent = this;
    parentOptions = parent.options();
    children = parentOptions.children;
    if (children) {
        handleAdd = function(name, opts) {
            if (parentOptions[name] !== undefined) opts = parentOptions[name];
            if (opts === false) return;
            parent[name] = parent.addChild(name, opts)
        };
        if (vjs.obj.isArray(children)) {
            for (var i = 0; i < children.length; i++) {
                child = children[i];
                if (typeof child == 'string') {
                    name = child;
                    opts = {}
                } else {
                    name = child.name;
                    opts = child
                };
                handleAdd(name, opts)
            }
        } else vjs.obj.each(children, handleAdd)
    }
};
vjs.Component.prototype.buildCSSClass = function() {
    return ''
};
vjs.Component.prototype.on = function(first, second, third) {
    var target, type, fn, removeOnDispose, cleanRemover, thisComponent;
    if (typeof first === 'string' || vjs.obj.isArray(first)) {
        vjs.on(this.el_, first, vjs.bind(this, second))
    } else {
        target = first;
        type = second;
        fn = vjs.bind(this, third);
        thisComponent = this;
        removeOnDispose = function() {
            thisComponent.off(target, type, fn)
        };
        removeOnDispose.guid = fn.guid;
        this.on('dispose', removeOnDispose);
        cleanRemover = function() {
            thisComponent.off('dispose', removeOnDispose)
        };
        cleanRemover.guid = fn.guid;
        if (first.nodeName) {
            vjs.on(target, type, fn);
            vjs.on(target, 'dispose', cleanRemover)
        } else if (typeof first.on === 'function') {
            target.on(type, fn);
            target.on('dispose', cleanRemover)
        }
    };
    return this
};
vjs.Component.prototype.off = function(first, second, third) {
    var target, otherComponent, type, fn, otherEl;
    if (!first || typeof first === 'string' || vjs.obj.isArray(first)) {
        vjs.off(this.el_, first, second)
    } else {
        target = first;
        type = second;
        fn = vjs.bind(this, third);
        this.off('dispose', fn);
        if (first.nodeName) {
            vjs.off(target, type, fn);
            vjs.off(target, 'dispose', fn)
        } else {
            target.off(type, fn);
            target.off('dispose', fn)
        }
    };
    return this
};
vjs.Component.prototype.one = function(first, second, third) {
    var target, type, fn, thisComponent, newFunc;
    if (typeof first === 'string' || vjs.obj.isArray(first)) {
        vjs.one(this.el_, first, vjs.bind(this, second))
    } else {
        target = first;
        type = second;
        fn = vjs.bind(this, third);
        thisComponent = this;
        newFunc = function() {
            thisComponent.off(target, type, newFunc);
            fn.apply(this, arguments)
        };
        newFunc.guid = fn.guid;
        this.on(target, type, newFunc)
    };
    return this
};
vjs.Component.prototype.trigger = function(event) {
    vjs.trigger(this.el_, event);
    return this
};
vjs.Component.prototype.isReady_;
vjs.Component.prototype.isReadyOnInitFinish_ = true;
vjs.Component.prototype.readyQueue_;
vjs.Component.prototype.ready = function(fn) {
    if (fn)
        if (this.isReady_) {
            fn.call(this)
        } else {
            if (this.readyQueue_ === undefined) this.readyQueue_ = [];
            this.readyQueue_.push(fn)
        };
    return this
};
vjs.Component.prototype.triggerReady = function() {
    this.isReady_ = true;
    var readyQueue = this.readyQueue_;
    this.readyQueue_ = [];
    if (readyQueue && readyQueue.length > 0) {
        for (var i = 0, j = readyQueue.length; i < j; i++) readyQueue[i].call(this);
        this.trigger('ready')
    }
};
vjs.Component.prototype.hasClass = function(classToCheck) {
    return vjs.hasClass(this.el_, classToCheck)
};
vjs.Component.prototype.addClass = function(classToAdd) {
    vjs.addClass(this.el_, classToAdd);
    return this
};
vjs.Component.prototype.removeClass = function(classToRemove) {
    vjs.removeClass(this.el_, classToRemove);
    return this
};
vjs.Component.prototype.show = function() {
    this.removeClass('vjs-hidden');
    return this
};
vjs.Component.prototype.hide = function() {
    this.addClass('vjs-hidden');
    return this
};
vjs.Component.prototype.lockShowing = function() {
    this.addClass('vjs-lock-showing');
    return this
};
vjs.Component.prototype.unlockShowing = function() {
    this.removeClass('vjs-lock-showing');
    return this
};
vjs.Component.prototype.disable = function() {
    this.hide();
    this.show = function() {}
};
vjs.Component.prototype.width = function(num, skipListeners) {
    return this.dimension('width', num, skipListeners)
};
vjs.Component.prototype.height = function(num, skipListeners) {
    return this.dimension('height', num, skipListeners)
};
vjs.Component.prototype.dimensions = function(width, height) {
    return this.width(width, true).height(height)
};
vjs.Component.prototype.dimension = function(widthOrHeight, num, skipListeners) {
    if (num !== undefined) {
        if (num === null || vjs.isNaN(num)) num = 0;
        if (('' + num).indexOf('%') !== -1 || ('' + num).indexOf('px') !== -1) {
            this.el_.style[widthOrHeight] = num
        } else if (num === 'auto') {
            this.el_.style[widthOrHeight] = ''
        } else this.el_.style[widthOrHeight] = num + 'px';
        if (!skipListeners) this.trigger('resize');
        return this
    };
    if (!this.el_) return 0;
    var val = this.el_.style[widthOrHeight],
        pxIndex = val.indexOf('px');
    if (pxIndex !== -1) {
        return parseInt(val.slice(0, pxIndex), 10)
    } else return parseInt(this.el_['offset' + vjs.capitalize(widthOrHeight)], 10)
};
vjs.Component.prototype.onResize;
vjs.Component.prototype.emitTapEvents = function() {
    var touchStart, firstTouch, touchTime, couldBeTap, noTap, xdiff, ydiff, touchDistance, tapMovementThreshold, touchTimeThreshold;
    touchStart = 0;
    firstTouch = null;
    tapMovementThreshold = 10;
    touchTimeThreshold = 200;
    this.on('touchstart', function(event) {
        if (event.touches.length === 1) {
            firstTouch = vjs.obj.copy(event.touches[0]);
            touchStart = new Date().getTime();
            couldBeTap = true
        }
    });
    this.on('touchmove', function(event) {
        if (event.touches.length > 1) {
            couldBeTap = false
        } else if (firstTouch) {
            xdiff = event.touches[0].pageX - firstTouch.pageX;
            ydiff = event.touches[0].pageY - firstTouch.pageY;
            touchDistance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
            if (touchDistance > tapMovementThreshold) couldBeTap = false
        }
    });
    noTap = function() {
        couldBeTap = false
    };
    this.on('touchleave', noTap);
    this.on('touchcancel', noTap);
    this.on('touchend', function(event) {
        firstTouch = null;
        if (couldBeTap === true) {
            touchTime = new Date().getTime() - touchStart;
            if (touchTime < touchTimeThreshold) {
                event.preventDefault();
                this.trigger('tap')
            }
        }
    })
};
vjs.Component.prototype.enableTouchActivity = function() {
    var report, touchHolding, touchEnd;
    if (!this.player().reportUserActivity) return;
    report = vjs.bind(this.player(), this.player().reportUserActivity);
    this.on('touchstart', function() {
        report();
        this.clearInterval(touchHolding);
        touchHolding = this.setInterval(report, 250)
    });
    touchEnd = function(event) {
        report();
        this.clearInterval(touchHolding)
    };
    this.on('touchmove', report);
    this.on('touchend', touchEnd);
    this.on('touchcancel', touchEnd)
};
vjs.Component.prototype.setTimeout = function(fn, timeout) {
    fn = vjs.bind(this, fn);
    var timeoutId = setTimeout(fn, timeout),
        disposeFn = function() {
            this.clearTimeout(timeoutId)
        };
    disposeFn.guid = 'vjs-timeout-' + timeoutId;
    this.on('dispose', disposeFn);
    return timeoutId
};
vjs.Component.prototype.clearTimeout = function(timeoutId) {
    clearTimeout(timeoutId);
    var disposeFn = function() {};
    disposeFn.guid = 'vjs-timeout-' + timeoutId;
    this.off('dispose', disposeFn);
    return timeoutId
};
vjs.Component.prototype.setInterval = function(fn, interval) {
    fn = vjs.bind(this, fn);
    var intervalId = setInterval(fn, interval),
        disposeFn = function() {
            this.clearInterval(intervalId)
        };
    disposeFn.guid = 'vjs-interval-' + intervalId;
    this.on('dispose', disposeFn);
    return intervalId
};
vjs.Component.prototype.clearInterval = function(intervalId) {
    clearInterval(intervalId);
    var disposeFn = function() {};
    disposeFn.guid = 'vjs-interval-' + intervalId;
    this.off('dispose', disposeFn);
    return intervalId
};
vjs.Button = vjs.Component.extend({
    init: function(player, options) {
        vjs.Component.call(this, player, options);
        this.emitTapEvents();
        this.on('tap', this.onClick);
        this.on('click', this.onClick);
        this.on('focus', this.onFocus);
        this.on('blur', this.onBlur)
    }
});
vjs.Button.prototype.createEl = function(type, props) {
    var el;
    props = vjs.obj.merge({
        className: this.buildCSSClass(),
        role: 'button',
        'aria-live': 'polite',
        tabIndex: 0
    }, props);
    el = vjs.Component.prototype.createEl.call(this, type, props);
    if (!props.innerHTML) {
        this.contentEl_ = vjs.createEl('div', {
            className: 'vjs-control-content'
        });
        this.controlText_ = vjs.createEl('span', {
            className: 'vjs-control-text',
            innerHTML: this.localize(this.buttonText) || 'Need Text'
        });
        this.contentEl_.appendChild(this.controlText_);
        el.appendChild(this.contentEl_)
    };
    return el
};
vjs.Button.prototype.buildCSSClass = function() {
    return 'vjs-control ' + vjs.Component.prototype.buildCSSClass.call(this)
};
vjs.Button.prototype.onClick = function() {};
vjs.Button.prototype.onFocus = function() {
    vjs.on(document, 'keydown', vjs.bind(this, this.onKeyPress))
};
vjs.Button.prototype.onKeyPress = function(event) {
    if (event.which == 32 || event.which == 13) {
        event.preventDefault();
        this.onClick()
    }
};
vjs.Button.prototype.onBlur = function() {
    vjs.off(document, 'keydown', vjs.bind(this, this.onKeyPress))
};
vjs.Slider = vjs.Component.extend({
    init: function(player, options) {
        vjs.Component.call(this, player, options);
        this.bar = this.getChild(this.options_['barName']);
        this.handle = this.getChild(this.options_['handleName']);
        this.on('mousedown', this.onMouseDown);
        this.on('touchstart', this.onMouseDown);
        this.on('focus', this.onFocus);
        this.on('blur', this.onBlur);
        this.on('click', this.onClick);
        this.on(player, 'controlsvisible', this.update);
        this.on(player, this.playerEvent, this.update)
    }
});
vjs.Slider.prototype.createEl = function(type, props) {
    props = props || {};
    props.className = props.className + ' vjs-slider';
    props = vjs.obj.merge({
        role: 'slider',
        'aria-valuenow': 0,
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        tabIndex: 0
    }, props);
    return vjs.Component.prototype.createEl.call(this, type, props)
};
vjs.Slider.prototype.onMouseDown = function(event) {
    event.preventDefault();
    vjs.blockTextSelection();
    this.addClass('vjs-sliding');
    this.on(document, 'mousemove', this.onMouseMove);
    this.on(document, 'mouseup', this.onMouseUp);
    this.on(document, 'touchmove', this.onMouseMove);
    this.on(document, 'touchend', this.onMouseUp);
    this.onMouseMove(event)
};
vjs.Slider.prototype.onMouseMove = function() {};
vjs.Slider.prototype.onMouseUp = function() {
    vjs.unblockTextSelection();
    this.removeClass('vjs-sliding');
    this.off(document, 'mousemove', this.onMouseMove);
    this.off(document, 'mouseup', this.onMouseUp);
    this.off(document, 'touchmove', this.onMouseMove);
    this.off(document, 'touchend', this.onMouseUp);
    this.update()
};
vjs.Slider.prototype.update = function() {
    if (!this.el_) return;
    var barProgress, progress = this.getPercent(),
        handle = this.handle,
        bar = this.bar;
    if (typeof progress !== 'number' || progress !== progress || progress < 0 || progress === Infinity) progress = 0;
    barProgress = progress;
    if (handle) {
        var box = this.el_,
            boxWidth = box.offsetWidth,
            handleWidth = handle.el().offsetWidth,
            handlePercent = handleWidth ? handleWidth / boxWidth : 0,
            boxAdjustedPercent = 1 - handlePercent,
            adjustedProgress = progress * boxAdjustedPercent;
        barProgress = adjustedProgress + (handlePercent / 2);
        handle.el().style.left = vjs.round(adjustedProgress * 100, 2) + '%'
    };
    if (bar) bar.el().style.width = vjs.round(barProgress * 100, 2) + '%'
};
vjs.Slider.prototype.calculateDistance = function(event) {
    var el, box, boxX, boxY, boxW, boxH, handle, pageX, pageY;
    el = this.el_;
    box = vjs.findPosition(el);
    boxW = boxH = el.offsetWidth;
    handle = this.handle;
    if (this.options()['vertical']) {
        boxY = box.top;
        if (event.changedTouches) {
            pageY = event.changedTouches[0].pageY
        } else pageY = event.pageY;
        if (handle) {
            var handleH = handle.el().offsetHeight;
            boxY = boxY + (handleH / 2);
            boxH = boxH - handleH
        };
        return Math.max(0, Math.min(1, ((boxY - pageY) + boxH) / boxH))
    } else {
        boxX = box.left;
        if (event.changedTouches) {
            pageX = event.changedTouches[0].pageX
        } else pageX = event.pageX;
        if (handle) {
            var handleW = handle.el().offsetWidth;
            boxX = boxX + (handleW / 2);
            boxW = boxW - handleW
        };
        return Math.max(0, Math.min(1, (pageX - boxX) / boxW))
    }
};
vjs.Slider.prototype.onFocus = function() {
    this.on(document, 'keydown', this.onKeyPress)
};
vjs.Slider.prototype.onKeyPress = function(event) {
    if (event.which == 37 || event.which == 40) {
        event.preventDefault();
        this.stepBack()
    } else if (event.which == 38 || event.which == 39) {
        event.preventDefault();
        this.stepForward()
    }
};
vjs.Slider.prototype.onBlur = function() {
    this.off(document, 'keydown', this.onKeyPress)
};
vjs.Slider.prototype.onClick = function(event) {
    event.stopImmediatePropagation();
    event.preventDefault()
};
vjs.SliderHandle = vjs.Component.extend();
vjs.SliderHandle.prototype.defaultValue = 0;
vjs.SliderHandle.prototype.createEl = function(type, props) {
    props = props || {};
    props.className = props.className + ' vjs-slider-handle';
    props = vjs.obj.merge({
        innerHTML: '<span class="vjs-control-text">' + this.defaultValue + '</span>'
    }, props);
    return vjs.Component.prototype.createEl.call(this, 'div', props)
};
vjs.Menu = vjs.Component.extend();
vjs.Menu.prototype.addItem = function(component) {
    this.addChild(component);
    component.on('click', vjs.bind(this, function() {
        this.unlockShowing()
    }))
};
vjs.Menu.prototype.createEl = function() {
    var contentElType = this.options().contentElType || 'ul';
    this.contentEl_ = vjs.createEl(contentElType, {
        className: 'vjs-menu-content'
    });
    var el = vjs.Component.prototype.createEl.call(this, 'div', {
        append: this.contentEl_,
        className: 'vjs-menu'
    });
    el.appendChild(this.contentEl_);
    vjs.on(el, 'click', function(event) {
        event.preventDefault();
        event.stopImmediatePropagation()
    });
    return el
};
vjs.MenuItem = vjs.Button.extend({
    init: function(player, options) {
        vjs.Button.call(this, player, options);
        this.selected(options.selected)
    }
});
vjs.MenuItem.prototype.createEl = function(type, props) {
    return vjs.Button.prototype.createEl.call(this, 'li', vjs.obj.merge({
        className: 'vjs-menu-item',
        innerHTML: this.localize(this.options_['label'])
    }, props))
};
vjs.MenuItem.prototype.onClick = function() {
    this.selected(true)
};
vjs.MenuItem.prototype.selected = function(selected) {
    if (selected) {
        this.addClass('vjs-selected');
        this.el_.setAttribute('aria-selected', true)
    } else {
        this.removeClass('vjs-selected');
        this.el_.setAttribute('aria-selected', false)
    }
};
vjs.MenuButton = vjs.Button.extend({
    init: function(player, options) {
        vjs.Button.call(this, player, options);
        this.update();
        this.on('keydown', this.onKeyPress);
        this.el_.setAttribute('aria-haspopup', true);
        this.el_.setAttribute('role', 'button')
    }
});
vjs.MenuButton.prototype.update = function() {
    var menu = this.createMenu();
    if (this.menu) this.removeChild(this.menu);
    this.menu = menu;
    this.addChild(menu);
    if (this.items && this.items.length === 0) {
        this.hide()
    } else if (this.items && this.items.length > 1) this.show()
};
vjs.MenuButton.prototype.buttonPressed_ = false;
vjs.MenuButton.prototype.createMenu = function() {
    var menu = new vjs.Menu(this.player_);
    if (this.options().title) menu.contentEl().appendChild(vjs.createEl('li', {
        className: 'vjs-menu-title',
        innerHTML: vjs.capitalize(this.options().title),
        tabindex: -1
    }));
    this.items = this['createItems']();
    if (this.items)
        for (var i = 0; i < this.items.length; i++) menu.addItem(this.items[i]);
    return menu
};
vjs.MenuButton.prototype.createItems = function() {};
vjs.MenuButton.prototype.buildCSSClass = function() {
    return this.className + ' vjs-menu-button ' + vjs.Button.prototype.buildCSSClass.call(this)
};
vjs.MenuButton.prototype.onFocus = function() {};
vjs.MenuButton.prototype.onBlur = function() {};
vjs.MenuButton.prototype.onClick = function() {
    this.one('mouseout', vjs.bind(this, function() {
        this.menu.unlockShowing();
        this.el_.blur()
    }));
    if (this.buttonPressed_) {
        this.unpressButton()
    } else this.pressButton()
};
vjs.MenuButton.prototype.onKeyPress = function(event) {
    if (event.which == 32 || event.which == 13) {
        if (this.buttonPressed_) {
            this.unpressButton()
        } else this.pressButton();
        event.preventDefault()
    } else if (event.which == 27) {
        if (this.buttonPressed_) this.unpressButton();
        event.preventDefault()
    }
};
vjs.MenuButton.prototype.pressButton = function() {
    this.buttonPressed_ = true;
    this.menu.lockShowing();
    this.el_.setAttribute('aria-pressed', true);
    if (this.items && this.items.length > 0) this.items[0].el().focus()
};
vjs.MenuButton.prototype.unpressButton = function() {
    this.buttonPressed_ = false;
    this.menu.unlockShowing();
    this.el_.setAttribute('aria-pressed', false)
};
vjs.MediaError = function(code) {
    if (typeof code === 'number') {
        this.code = code
    } else if (typeof code === 'string') {
        this.message = code
    } else if (typeof code === 'object') vjs.obj.merge(this, code);
    if (!this.message) this.message = vjs.MediaError.defaultMessages[this.code] || ''
};
vjs.MediaError.prototype.code = 0;
vjs.MediaError.prototype.message = '';
vjs.MediaError.prototype.status = null;
vjs.MediaError.errorTypes = ['MEDIA_ERR_CUSTOM', 'MEDIA_ERR_ABORTED', 'MEDIA_ERR_NETWORK', 'MEDIA_ERR_DECODE', 'MEDIA_ERR_SRC_NOT_SUPPORTED', 'MEDIA_ERR_ENCRYPTED'];
vjs.MediaError.defaultMessages = {
    1: 'You aborted the video playback',
    2: 'A network error caused the video download to fail part-way.',
    3: 'The video playback was aborted due to a corruption problem or because the video used features your browser did not support.',
    4: 'The video could not be loaded, either because the server or network failed or because the format is not supported.',
    5: 'The video is encrypted and we do not have the keys to decrypt it.'
};
for (var errNum = 0; errNum < vjs.MediaError.errorTypes.length; errNum++) {
    vjs.MediaError[vjs.MediaError.errorTypes[errNum]] = errNum;
    vjs.MediaError.prototype[vjs.MediaError.errorTypes[errNum]] = errNum
};
(function() {
    var apiMap, specApi, browserApi, i;
    vjs.browser.fullscreenAPI;
    apiMap = [
        ['requestFullscreen', 'exitFullscreen', 'fullscreenElement', 'fullscreenEnabled', 'fullscreenchange', 'fullscreenerror'],
        ['webkitRequestFullscreen', 'webkitExitFullscreen', 'webkitFullscreenElement', 'webkitFullscreenEnabled', 'webkitfullscreenchange', 'webkitfullscreenerror'],
        ['webkitRequestFullScreen', 'webkitCancelFullScreen', 'webkitCurrentFullScreenElement', 'webkitCancelFullScreen', 'webkitfullscreenchange', 'webkitfullscreenerror'],
        ['mozRequestFullScreen', 'mozCancelFullScreen', 'mozFullScreenElement', 'mozFullScreenEnabled', 'mozfullscreenchange', 'mozfullscreenerror'],
        ['msRequestFullscreen', 'msExitFullscreen', 'msFullscreenElement', 'msFullscreenEnabled', 'MSFullscreenChange', 'MSFullscreenError']
    ];
    specApi = apiMap[0];
    for (i = 0; i < apiMap.length; i++)
        if (apiMap[i][1] in document) {
            browserApi = apiMap[i];
            break
        };
    if (browserApi) {
        vjs.browser.fullscreenAPI = {};
        for (i = 0; i < browserApi.length; i++) vjs.browser.fullscreenAPI[specApi[i]] = browserApi[i]
    }
})();
vjs.Player = vjs.Component.extend({
    init: function(tag, options, ready) {
        this.tag = tag;
        tag.id = tag.id || 'vjs_video_' + vjs.guid++;
        this.tagAttributes = tag && vjs.getElementAttributes(tag);
        options = vjs.obj.merge(this.getTagSettings(tag), options);
        this.language_ = options.language || vjs.options['language'];
        this.languages_ = options.languages || vjs.options['languages'];
        this.cache_ = {};
        this.poster_ = options.poster || '';
        this.controls_ = !!options.controls;
        tag.controls = false;
        options.reportTouchActivity = false;
        this.isAudio(this.tag.nodeName.toLowerCase() === 'audio');
        vjs.Component.call(this, this, options, ready);
        if (this.controls()) {
            this.addClass('vjs-controls-enabled')
        } else this.addClass('vjs-controls-disabled');
        if (this.isAudio()) this.addClass('vjs-audio');
        vjs.players[this.id_] = this;
        if (options.plugins) vjs.obj.each(options.plugins, function(key, val) {
            this[key](val)
        }, this);
        this.listenForUserActivity()
    }
});
vjs.Player.prototype.language_;
vjs.Player.prototype.language = function(languageCode) {
    if (languageCode === undefined) return this.language_;
    this.language_ = languageCode;
    return this
};
vjs.Player.prototype.languages_;
vjs.Player.prototype.languages = function() {
    return this.languages_
};
vjs.Player.prototype.options_ = vjs.options;
vjs.Player.prototype.dispose = function() {
    this.trigger('dispose');
    this.off('dispose');
    vjs.players[this.id_] = null;
    if (this.tag && this.tag['player']) this.tag['player'] = null;
    if (this.el_ && this.el_['player']) this.el_['player'] = null;
    if (this.tech) this.tech.dispose();
    vjs.Component.prototype.dispose.call(this)
};
vjs.Player.prototype.getTagSettings = function(tag) {
    var tagOptions, dataSetup, options = {
        sources: [],
        tracks: []
    };
    tagOptions = vjs.getElementAttributes(tag);
    dataSetup = tagOptions['data-setup'];
    if (dataSetup !== null) vjs.obj.merge(tagOptions, vjs.JSON.parse(dataSetup || '{}'));
    vjs.obj.merge(options, tagOptions);
    if (tag.hasChildNodes()) {
        var children, child, childName, i, j;
        children = tag.childNodes;
        for (i = 0, j = children.length; i < j; i++) {
            child = children[i];
            childName = child.nodeName.toLowerCase();
            if (childName === 'source') {
                options.sources.push(vjs.getElementAttributes(child))
            } else if (childName === 'track') options.tracks.push(vjs.getElementAttributes(child))
        }
    };
    return options
};
vjs.Player.prototype.createEl = function() {
    var el = this.el_ = vjs.Component.prototype.createEl.call(this, 'div'),
        tag = this.tag,
        attrs;
    tag.removeAttribute('width');
    tag.removeAttribute('height');
    attrs = vjs.getElementAttributes(tag);
    vjs.obj.each(attrs, function(attr) {
        if (attr == 'class') {
            el.className = attrs[attr]
        } else el.setAttribute(attr, attrs[attr])
    });
    tag.id += '_html5_api';
    tag.className = 'vjs-tech';
    tag.player = el.player = this;
    this.addClass('vjs-paused');
    this.width(this.options_['width'], true);
    this.height(this.options_['height'], true);
    tag.initNetworkState_ = tag.networkState;
    if (tag.parentNode) tag.parentNode.insertBefore(el, tag);
    vjs.insertFirst(tag, el);
    this.el_ = el;
    this.on('loadstart', this.onLoadStart);
    this.on('waiting', this.onWaiting);
    this.on(['canplay', 'canplaythrough', 'playing', 'ended'], this.onWaitEnd);
    this.on('seeking', this.onSeeking);
    this.on('seeked', this.onSeeked);
    this.on('ended', this.onEnded);
    this.on('play', this.onPlay);
    this.on('firstplay', this.onFirstPlay);
    this.on('pause', this.onPause);
    this.on('progress', this.onProgress);
    this.on('durationchange', this.onDurationChange);
    this.on('fullscreenchange', this.onFullscreenChange);
    return el
};
vjs.Player.prototype.loadTech = function(techName, source) {
    if (this.tech) this.unloadTech();
    if (techName !== 'Html5' && this.tag) {
        vjs.Html5.disposeMediaElement(this.tag);
        this.tag = null
    };
    this.techName = techName;
    this.isReady_ = false;
    var techReady = function() {
            this.player_.triggerReady()
        },
        techOptions = vjs.obj.merge({
            source: source,
            parentEl: this.el_
        }, this.options_[techName.toLowerCase()]);
    if (source) {
        this.currentType_ = source.type;
        if (source.src == this.cache_.src && this.cache_.currentTime > 0) techOptions.startTime = this.cache_.currentTime;
        this.cache_.src = source.src
    };
    this.tech = new window.videojs[techName](this, techOptions);
    this.tech.ready(techReady)
};
vjs.Player.prototype.unloadTech = function() {
    this.isReady_ = false;
    this.tech.dispose();
    this.tech = false
};
vjs.Player.prototype.onLoadStart = function() {
    this.removeClass('vjs-ended');
    this.error(null);
    if (!this.paused()) {
        this.trigger('firstplay')
    } else this.hasStarted(false)
};
vjs.Player.prototype.hasStarted_ = false;
vjs.Player.prototype.hasStarted = function(hasStarted) {
    if (hasStarted !== undefined) {
        if (this.hasStarted_ !== hasStarted) {
            this.hasStarted_ = hasStarted;
            if (hasStarted) {
                this.addClass('vjs-has-started');
                this.trigger('firstplay')
            } else this.removeClass('vjs-has-started')
        };
        return this
    };
    return this.hasStarted_
};
vjs.Player.prototype.onLoadedMetaData;
vjs.Player.prototype.onLoadedData;
vjs.Player.prototype.onLoadedAllData;
vjs.Player.prototype.onPlay = function() {
    this.removeClass('vjs-ended');
    this.removeClass('vjs-paused');
    this.addClass('vjs-playing');
    this.hasStarted(true)
};
vjs.Player.prototype.onWaiting = function() {
    this.addClass('vjs-waiting')
};
vjs.Player.prototype.onWaitEnd = function() {
    this.removeClass('vjs-waiting')
};
vjs.Player.prototype.onSeeking = function() {
    this.addClass('vjs-seeking')
};
vjs.Player.prototype.onSeeked = function() {
    this.removeClass('vjs-seeking')
};
vjs.Player.prototype.onFirstPlay = function() {
    if (this.options_['starttime']) this.currentTime(this.options_['starttime']);
    this.addClass('vjs-has-started')
};
vjs.Player.prototype.onPause = function() {
    this.removeClass('vjs-playing');
    this.addClass('vjs-paused')
};
vjs.Player.prototype.onTimeUpdate;
vjs.Player.prototype.onProgress = function() {
    if (this.bufferedPercent() == 1) this.trigger('loadedalldata')
};
vjs.Player.prototype.onEnded = function() {
    this.addClass('vjs-ended');
    if (this.options_['loop']) {
        this.currentTime(0);
        this.play()
    } else if (!this.paused()) this.pause()
};
vjs.Player.prototype.onDurationChange = function() {
    var duration = this.techGet('duration');
    if (duration) {
        if (duration < 0) duration = Infinity;
        this.duration(duration);
        if (duration === Infinity) {
            this.addClass('vjs-live')
        } else this.removeClass('vjs-live')
    }
};
vjs.Player.prototype.onVolumeChange;
vjs.Player.prototype.onFullscreenChange = function() {
    if (this.isFullscreen()) {
        this.addClass('vjs-fullscreen')
    } else this.removeClass('vjs-fullscreen')
};
vjs.Player.prototype.onError;
vjs.Player.prototype.cache_;
vjs.Player.prototype.getCache = function() {
    return this.cache_
};
vjs.Player.prototype.techCall = function(method, arg) {
    if (this.tech && !this.tech.isReady_) {
        this.tech.ready(function() {
            this[method](arg)
        })
    } else try {
        this.tech[method](arg)
    } catch (e) {
        vjs.log(e);
        throw e
    }
};
vjs.Player.prototype.techGet = function(method) {
    if (this.tech && this.tech.isReady_) try {
        return this.tech[method]()
    } catch (e) {
        if (this.tech[method] === undefined) {
            vjs.log('Video.js: ' + method + ' method not defined for ' + this.techName + ' playback technology.', e)
        } else if (e.name == 'TypeError') {
            vjs.log('Video.js: ' + method + ' unavailable on ' + this.techName + ' playback technology element.', e);
            this.tech.isReady_ = false
        } else vjs.log(e);
        throw e
    };
    return
};
vjs.Player.prototype.play = function() {
    this.techCall('play');
    return this
};
vjs.Player.prototype.pause = function() {
    this.techCall('pause');
    return this
};
vjs.Player.prototype.paused = function() {
    return (this.techGet('paused') === false) ? false : true
};
vjs.Player.prototype.currentTime = function(seconds) {
    if (seconds !== undefined) {
        this.techCall('setCurrentTime', seconds);
        return this
    };
    return this.cache_.currentTime = (this.techGet('currentTime') || 0)
};
vjs.Player.prototype.duration = function(seconds) {
    if (seconds !== undefined) {
        this.cache_.duration = parseFloat(seconds);
        return this
    };
    if (this.cache_.duration === undefined) this.onDurationChange();
    return this.cache_.duration || 0
};
vjs.Player.prototype.remainingTime = function() {
    return this.duration() - this.currentTime()
};
vjs.Player.prototype.buffered = function() {
    var buffered = this.techGet('buffered');
    if (!buffered || !buffered.length) buffered = vjs.createTimeRange(0, 0);
    return buffered
};
vjs.Player.prototype.bufferedPercent = function() {
    var duration = this.duration(),
        buffered = this.buffered(),
        bufferedDuration = 0,
        start, end;
    if (!duration) return 0;
    for (var i = 0; i < buffered.length; i++) {
        start = buffered.start(i);
        end = buffered.end(i);
        if (end > duration) end = duration;
        bufferedDuration += end - start
    };
    return bufferedDuration / duration
};
vjs.Player.prototype.bufferedEnd = function() {
    var buffered = this.buffered(),
        duration = this.duration(),
        end = buffered.end(buffered.length - 1);
    if (end > duration) end = duration;
    return end
};
vjs.Player.prototype.volume = function(percentAsDecimal) {
    var vol;
    if (percentAsDecimal !== undefined) {
        vol = Math.max(0, Math.min(1, parseFloat(percentAsDecimal)));
        this.cache_.volume = vol;
        this.techCall('setVolume', vol);
        vjs.setLocalStorage('volume', vol);
        return this
    };
    vol = parseFloat(this.techGet('volume'));
    return (isNaN(vol)) ? 1 : vol
};
vjs.Player.prototype.muted = function(muted) {
    if (muted !== undefined) {
        this.techCall('setMuted', muted);
        return this
    };
    return this.techGet('muted') || false
};
vjs.Player.prototype.supportsFullScreen = function() {
    return this.techGet('supportsFullScreen') || false
};
vjs.Player.prototype.isFullscreen_ = false;
vjs.Player.prototype.isFullscreen = function(isFS) {
    if (isFS !== undefined) {
        this.isFullscreen_ = !!isFS;
        return this
    };
    return this.isFullscreen_
};
vjs.Player.prototype.isFullScreen = function(isFS) {
    vjs.log.warn('player.isFullScreen() has been deprecated, use player.isFullscreen() with a lowercase "s")');
    return this.isFullscreen(isFS)
};
vjs.Player.prototype.requestFullscreen = function() {
    var fsApi = vjs.browser.fullscreenAPI;
    this.isFullscreen(true);
    if (fsApi) {
        vjs.on(document, fsApi.fullscreenchange, vjs.bind(this, function(e) {
            this.isFullscreen(document[fsApi.fullscreenElement]);
            if (this.isFullscreen() === false) vjs.off(document, fsApi.fullscreenchange, arguments.callee);
            this.trigger('fullscreenchange')
        }));
        this.el_[fsApi.requestFullscreen]()
    } else if (this.tech.supportsFullScreen()) {
        this.techCall('enterFullScreen')
    } else {
        this.enterFullWindow();
        this.trigger('fullscreenchange')
    };
    return this
};
vjs.Player.prototype.requestFullScreen = function() {
    vjs.log.warn('player.requestFullScreen() has been deprecated, use player.requestFullscreen() with a lowercase "s")');
    return this.requestFullscreen()
};
vjs.Player.prototype.exitFullscreen = function() {
    var fsApi = vjs.browser.fullscreenAPI;
    this.isFullscreen(false);
    if (fsApi) {
        document[fsApi.exitFullscreen]()
    } else if (this.tech.supportsFullScreen()) {
        this.techCall('exitFullScreen')
    } else {
        this.exitFullWindow();
        this.trigger('fullscreenchange')
    };
    return this
};
vjs.Player.prototype.cancelFullScreen = function() {
    vjs.log.warn('player.cancelFullScreen() has been deprecated, use player.exitFullscreen()');
    return this.exitFullscreen()
};
vjs.Player.prototype.enterFullWindow = function() {
    this.isFullWindow = true;
    this.docOrigOverflow = document.documentElement.style.overflow;
    vjs.on(document, 'keydown', vjs.bind(this, this.fullWindowOnEscKey));
    document.documentElement.style.overflow = 'hidden';
    vjs.addClass(document.body, 'vjs-full-window');
    this.trigger('enterFullWindow')
};
vjs.Player.prototype.fullWindowOnEscKey = function(event) {
    if (event.keyCode === 27)
        if (this.isFullscreen() === true) {
            this.exitFullscreen()
        } else this.exitFullWindow()
};
vjs.Player.prototype.exitFullWindow = function() {
    this.isFullWindow = false;
    vjs.off(document, 'keydown', this.fullWindowOnEscKey);
    document.documentElement.style.overflow = this.docOrigOverflow;
    vjs.removeClass(document.body, 'vjs-full-window');
    this.trigger('exitFullWindow')
};
vjs.Player.prototype.selectSource = function(sources) {
    for (var i = 0, j = this.options_['techOrder']; i < j.length; i++) {
        var techName = vjs.capitalize(j[i]),
            tech = window.videojs[techName];
        if (!tech) {
            vjs.log.error('The "' + techName + '" tech is undefined. Skipped browser support check for that tech.');
            continue
        };
        if (tech.isSupported())
            for (var a = 0, b = sources; a < b.length; a++) {
                var source = b[a];
                if (tech.canPlaySource(source)) return {
                    source: source,
                    tech: techName
                }
            }
    };
    return false
};
vjs.Player.prototype.src = function(source) {
    if (source === undefined) return this.techGet('src');
    if (vjs.obj.isArray(source)) {
        this.sourceList_(source)
    } else if (typeof source === 'string') {
        this.src({
            src: source
        })
    } else if (source instanceof Object)
        if (source.type && !window.videojs[this.techName]['canPlaySource'](source)) {
            this.sourceList_([source])
        } else {
            this.cache_.src = source.src;
            this.currentType_ = source.type || '';
            this.ready(function() {
                if (window.videojs[this.techName].prototype.hasOwnProperty('setSource')) {
                    this.techCall('setSource', source)
                } else this.techCall('src', source.src);
                if (this.options_['preload'] == 'auto') this.load();
                if (this.options_['autoplay']) this.play()
            })
        };
    return this
};
vjs.Player.prototype.sourceList_ = function(sources) {
    var sourceTech = this.selectSource(sources);
    if (sourceTech) {
        if (sourceTech.tech === this.techName) {
            this.src(sourceTech.source)
        } else this.loadTech(sourceTech.tech, sourceTech.source)
    } else {
        this.setTimeout(function() {
            this.error({
                code: 4,
                message: this.localize(this.options()['notSupportedMessage'])
            })
        }, 0);
        this.triggerReady()
    }
};
vjs.Player.prototype.load = function() {
    this.techCall('load');
    return this
};
vjs.Player.prototype.currentSrc = function() {
    return this.techGet('currentSrc') || this.cache_.src || ''
};
vjs.Player.prototype.currentType = function() {
    return this.currentType_ || ''
};
vjs.Player.prototype.preload = function(value) {
    if (value !== undefined) {
        this.techCall('setPreload', value);
        this.options_['preload'] = value;
        return this
    };
    return this.techGet('preload')
};
vjs.Player.prototype.autoplay = function(value) {
    if (value !== undefined) {
        this.techCall('setAutoplay', value);
        this.options_['autoplay'] = value;
        return this
    };
    return this.techGet('autoplay', value)
};
vjs.Player.prototype.loop = function(value) {
    if (value !== undefined) {
        this.techCall('setLoop', value);
        this.options_['loop'] = value;
        return this
    };
    return this.techGet('loop')
};
vjs.Player.prototype.poster_;
vjs.Player.prototype.poster = function(src) {
    if (src === undefined) return this.poster_;
    if (!src) src = '';
    this.poster_ = src;
    this.techCall('setPoster', src);
    this.trigger('posterchange');
    return this
};
vjs.Player.prototype.controls_;
vjs.Player.prototype.controls = function(bool) {
    if (bool !== undefined) {
        bool = !!bool;
        if (this.controls_ !== bool) {
            this.controls_ = bool;
            if (bool) {
                this.removeClass('vjs-controls-disabled');
                this.addClass('vjs-controls-enabled');
                this.trigger('controlsenabled')
            } else {
                this.removeClass('vjs-controls-enabled');
                this.addClass('vjs-controls-disabled');
                this.trigger('controlsdisabled')
            }
        };
        return this
    };
    return this.controls_
};
vjs.Player.prototype.usingNativeControls_;
vjs.Player.prototype.usingNativeControls = function(bool) {
    if (bool !== undefined) {
        bool = !!bool;
        if (this.usingNativeControls_ !== bool) {
            this.usingNativeControls_ = bool;
            if (bool) {
                this.addClass('vjs-using-native-controls');
                this.trigger('usingnativecontrols')
            } else {
                this.removeClass('vjs-using-native-controls');
                this.trigger('usingcustomcontrols')
            }
        };
        return this
    };
    return this.usingNativeControls_
};
vjs.Player.prototype.error_ = null;
vjs.Player.prototype.error = function(err) {
    if (err === undefined) return this.error_;
    if (err === null) {
        this.error_ = err;
        this.removeClass('vjs-error');
        return this
    };
    if (err instanceof vjs.MediaError) {
        this.error_ = err
    } else this.error_ = new vjs.MediaError(err);
    this.trigger('error');
    this.addClass('vjs-error');
    vjs.log.error('(CODE:' + this.error_.code + ' ' + vjs.MediaError.errorTypes[this.error_.code] + ')', this.error_.message, this.error_);
    return this
};
vjs.Player.prototype.ended = function() {
    return this.techGet('ended')
};
vjs.Player.prototype.seeking = function() {
    return this.techGet('seeking')
};
vjs.Player.prototype.seekable = function() {
    return this.techGet('seekable')
};
vjs.Player.prototype.userActivity_ = true;
vjs.Player.prototype.reportUserActivity = function(event) {
    this.userActivity_ = true
};
vjs.Player.prototype.userActive_ = true;
vjs.Player.prototype.userActive = function(bool) {
    if (bool !== undefined) {
        bool = !!bool;
        if (bool !== this.userActive_) {
            this.userActive_ = bool;
            if (bool) {
                this.userActivity_ = true;
                this.removeClass('vjs-user-inactive');
                this.addClass('vjs-user-active');
                this.trigger('useractive')
            } else {
                this.userActivity_ = false;
                if (this.tech) this.tech.one('mousemove', function(e) {
                    e.stopPropagation();
                    e.preventDefault()
                });
                this.removeClass('vjs-user-active');
                this.addClass('vjs-user-inactive');
                this.trigger('userinactive')
            }
        };
        return this
    };
    return this.userActive_
};
vjs.Player.prototype.listenForUserActivity = function() {
    var onActivity, onMouseMove, onMouseDown, mouseInProgress, onMouseUp, activityCheck, inactivityTimeout, lastMoveX, lastMoveY;
    onActivity = vjs.bind(this, this.reportUserActivity);
    onMouseMove = function(e) {
        if (e.screenX != lastMoveX || e.screenY != lastMoveY) {
            lastMoveX = e.screenX;
            lastMoveY = e.screenY;
            onActivity()
        }
    };
    onMouseDown = function() {
        onActivity();
        this.clearInterval(mouseInProgress);
        mouseInProgress = this.setInterval(onActivity, 250)
    };
    onMouseUp = function(event) {
        onActivity();
        this.clearInterval(mouseInProgress)
    };
    this.on('mousedown', onMouseDown);
    this.on('mousemove', onMouseMove);
    this.on('mouseup', onMouseUp);
    this.on('keydown', onActivity);
    this.on('keyup', onActivity);
    activityCheck = this.setInterval(function() {
        if (this.userActivity_) {
            this.userActivity_ = false;
            this.userActive(true);
            this.clearTimeout(inactivityTimeout);
            var timeout = this.options()['inactivityTimeout'];
            if (timeout > 0) inactivityTimeout = this.setTimeout(function() {
                if (!this.userActivity_) this.userActive(false)
            }, timeout)
        }
    }, 250)
};
vjs.Player.prototype.playbackRate = function(rate) {
    if (rate !== undefined) {
        this.techCall('setPlaybackRate', rate);
        return this
    };
    if (this.tech && this.tech['featuresPlaybackRate']) {
        return this.techGet('playbackRate')
    } else return 1.0
};
vjs.Player.prototype.isAudio_ = false;
vjs.Player.prototype.isAudio = function(bool) {
    if (bool !== undefined) {
        this.isAudio_ = !!bool;
        return this
    };
    return this.isAudio_
};
vjs.Player.prototype.networkState = function() {
    return this.techGet('networkState')
};
vjs.Player.prototype.readyState = function() {
    return this.techGet('readyState')
};
vjs.Player.prototype.textTracks = function() {
    return this.tech && this.tech['textTracks']()
};
vjs.Player.prototype.remoteTextTracks = function() {
    return this.tech && this.tech['remoteTextTracks']()
};
vjs.Player.prototype.addTextTrack = function(kind, label, language) {
    return this.tech && this.tech['addTextTrack'](kind, label, language)
};
vjs.Player.prototype.addRemoteTextTrack = function(options) {
    return this.tech && this.tech['addRemoteTextTrack'](options)
};
vjs.Player.prototype.removeRemoteTextTrack = function(track) {
    this.tech && this.tech['removeRemoteTextTrack'](track)
};
vjs.ControlBar = vjs.Component.extend();
vjs.ControlBar.prototype.options_ = {
    loadEvent: 'play',
    children: {
        playToggle: {},
        currentTimeDisplay: {},
        timeDivider: {},
        durationDisplay: {},
        remainingTimeDisplay: {},
        liveDisplay: {},
        progressControl: {},
        fullscreenToggle: {},
        volumeControl: {},
        muteToggle: {},
        playbackRateMenuButton: {},
        subtitlesButton: {},
        captionsButton: {},
        chaptersButton: {}
    }
};
vjs.ControlBar.prototype.createEl = function() {
    return vjs.createEl('div', {
        className: 'vjs-control-bar'
    })
};
vjs.LiveDisplay = vjs.Component.extend({
    init: function(player, options) {
        vjs.Component.call(this, player, options)
    }
});
vjs.LiveDisplay.prototype.createEl = function() {
    var el = vjs.Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-live-controls vjs-control'
    });
    this.contentEl_ = vjs.createEl('div', {
        className: 'vjs-live-display',
        innerHTML: '<span class="vjs-control-text">' + this.localize('Stream Type') + '</span>' + this.localize('LIVE'),
        'aria-live': 'off'
    });
    el.appendChild(this.contentEl_);
    return el
};
vjs.PlayToggle = vjs.Button.extend({
    init: function(player, options) {
        vjs.Button.call(this, player, options);
        this.on(player, 'play', this.onPlay);
        this.on(player, 'pause', this.onPause)
    }
});
vjs.PlayToggle.prototype.buttonText = 'Play';
vjs.PlayToggle.prototype.buildCSSClass = function() {
    return 'vjs-play-control ' + vjs.Button.prototype.buildCSSClass.call(this)
};
vjs.PlayToggle.prototype.onClick = function() {
    if (this.player_.paused()) {
        this.player_.play()
    } else this.player_.pause()
};
vjs.PlayToggle.prototype.onPlay = function() {
    this.removeClass('vjs-paused');
    this.addClass('vjs-playing');
    this.el_.children[0].children[0].innerHTML = this.localize('Pause')
};
vjs.PlayToggle.prototype.onPause = function() {
    this.removeClass('vjs-playing');
    this.addClass('vjs-paused');
    this.el_.children[0].children[0].innerHTML = this.localize('Play')
};
vjs.CurrentTimeDisplay = vjs.Component.extend({
    init: function(player, options) {
        vjs.Component.call(this, player, options);
        this.on(player, 'timeupdate', this.updateContent)
    }
});
vjs.CurrentTimeDisplay.prototype.createEl = function() {
    var el = vjs.Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-current-time vjs-time-controls vjs-control'
    });
    this.contentEl_ = vjs.createEl('div', {
        className: 'vjs-current-time-display',
        innerHTML: '<span class="vjs-control-text">Current Time </span>0:00',
        'aria-live': 'off'
    });
    el.appendChild(this.contentEl_);
    return el
};
vjs.CurrentTimeDisplay.prototype.updateContent = function() {
    var time = (this.player_.scrubbing) ? this.player_.getCache().currentTime : this.player_.currentTime();
    this.contentEl_.innerHTML = '<span class="vjs-control-text">' + this.localize('Current Time') + '</span> ' + vjs.formatTime(time, this.player_.duration())
};
vjs.DurationDisplay = vjs.Component.extend({
    init: function(player, options) {
        vjs.Component.call(this, player, options);
        this.on(player, 'timeupdate', this.updateContent);
        this.on(player, 'loadedmetadata', this.updateContent)
    }
});
vjs.DurationDisplay.prototype.createEl = function() {
    var el = vjs.Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-duration vjs-time-controls vjs-control'
    });
    this.contentEl_ = vjs.createEl('div', {
        className: 'vjs-duration-display',
        innerHTML: '<span class="vjs-control-text">' + this.localize('Duration Time') + '</span> 0:00',
        'aria-live': 'off'
    });
    el.appendChild(this.contentEl_);
    return el
};
vjs.DurationDisplay.prototype.updateContent = function() {
    var duration = this.player_.duration();
    if (duration) this.contentEl_.innerHTML = '<span class="vjs-control-text">' + this.localize('Duration Time') + '</span> ' + vjs.formatTime(duration)
};
vjs.TimeDivider = vjs.Component.extend({
    init: function(player, options) {
        vjs.Component.call(this, player, options)
    }
});
vjs.TimeDivider.prototype.createEl = function() {
    return vjs.Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-time-divider',
        innerHTML: '<div><span>/</span></div>'
    })
};
vjs.RemainingTimeDisplay = vjs.Component.extend({
    init: function(player, options) {
        vjs.Component.call(this, player, options);
        this.on(player, 'timeupdate', this.updateContent)
    }
});
vjs.RemainingTimeDisplay.prototype.createEl = function() {
    var el = vjs.Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-remaining-time vjs-time-controls vjs-control'
    });
    this.contentEl_ = vjs.createEl('div', {
        className: 'vjs-remaining-time-display',
        innerHTML: '<span class="vjs-control-text">' + this.localize('Remaining Time') + '</span> -0:00',
        'aria-live': 'off'
    });
    el.appendChild(this.contentEl_);
    return el
};
vjs.RemainingTimeDisplay.prototype.updateContent = function() {
    if (this.player_.duration()) this.contentEl_.innerHTML = '<span class="vjs-control-text">' + this.localize('Remaining Time') + '</span> -' + vjs.formatTime(this.player_.remainingTime())
};
vjs.FullscreenToggle = vjs.Button.extend({
    init: function(player, options) {
        vjs.Button.call(this, player, options)
    }
});
vjs.FullscreenToggle.prototype.buttonText = 'Fullscreen';
vjs.FullscreenToggle.prototype.buildCSSClass = function() {
    return 'vjs-fullscreen-control ' + vjs.Button.prototype.buildCSSClass.call(this)
};
vjs.FullscreenToggle.prototype.onClick = function() {
    if (!this.player_.isFullscreen()) {
        this.player_.requestFullscreen();
        this.controlText_.innerHTML = this.localize('Non-Fullscreen')
    } else {
        this.player_.exitFullscreen();
        this.controlText_.innerHTML = this.localize('Fullscreen')
    }
};
vjs.ProgressControl = vjs.Component.extend({
    init: function(player, options) {
        vjs.Component.call(this, player, options)
    }
});
vjs.ProgressControl.prototype.options_ = {
    children: {
        seekBar: {}
    }
};
vjs.ProgressControl.prototype.createEl = function() {
    return vjs.Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-progress-control vjs-control'
    })
};
vjs.SeekBar = vjs.Slider.extend({
    init: function(player, options) {
        vjs.Slider.call(this, player, options);
        this.on(player, 'timeupdate', this.updateARIAAttributes);
        player.ready(vjs.bind(this, this.updateARIAAttributes))
    }
});
vjs.SeekBar.prototype.options_ = {
    children: {
        loadProgressBar: {},
        playProgressBar: {},
        seekHandle: {}
    },
    barName: 'playProgressBar',
    handleName: 'seekHandle'
};
vjs.SeekBar.prototype.playerEvent = 'timeupdate';
vjs.SeekBar.prototype.createEl = function() {
    return vjs.Slider.prototype.createEl.call(this, 'div', {
        className: 'vjs-progress-holder',
        'aria-label': 'video progress bar'
    })
};
vjs.SeekBar.prototype.updateARIAAttributes = function() {
    var time = (this.player_.scrubbing) ? this.player_.getCache().currentTime : this.player_.currentTime();
    this.el_.setAttribute('aria-valuenow', vjs.round(this.getPercent() * 100, 2));
    this.el_.setAttribute('aria-valuetext', vjs.formatTime(time, this.player_.duration()))
};
vjs.SeekBar.prototype.getPercent = function() {
    return this.player_.currentTime() / this.player_.duration()
};
vjs.SeekBar.prototype.onMouseDown = function(event) {
    vjs.Slider.prototype.onMouseDown.call(this, event);
    this.player_.scrubbing = true;
    this.player_.addClass('vjs-scrubbing');
    this.videoWasPlaying = !this.player_.paused();
    this.player_.pause()
};
vjs.SeekBar.prototype.onMouseMove = function(event) {
    var newTime = this.calculateDistance(event) * this.player_.duration();
    if (newTime == this.player_.duration()) newTime = newTime - 0.1;
    this.player_.currentTime(newTime)
};
vjs.SeekBar.prototype.onMouseUp = function(event) {
    vjs.Slider.prototype.onMouseUp.call(this, event);
    this.player_.scrubbing = false;
    this.player_.removeClass('vjs-scrubbing');
    if (this.videoWasPlaying) this.player_.play()
};
vjs.SeekBar.prototype.stepForward = function() {
    this.player_.currentTime(this.player_.currentTime() + 5)
};
vjs.SeekBar.prototype.stepBack = function() {
    this.player_.currentTime(this.player_.currentTime() - 5)
};
vjs.LoadProgressBar = vjs.Component.extend({
    init: function(player, options) {
        vjs.Component.call(this, player, options);
        this.on(player, 'progress', this.update)
    }
});
vjs.LoadProgressBar.prototype.createEl = function() {
    return vjs.Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-load-progress',
        innerHTML: '<span class="vjs-control-text"><span>' + this.localize('Loaded') + '</span>: 0%</span>'
    })
};
vjs.LoadProgressBar.prototype.update = function() {
    var i, start, end, part, buffered = this.player_.buffered(),
        duration = this.player_.duration(),
        bufferedEnd = this.player_.bufferedEnd(),
        children = this.el_.children,
        percentify = function(time, end) {
            var percent = (time / end) || 0;
            return (percent * 100) + '%'
        };
    this.el_.style.width = percentify(bufferedEnd, duration);
    for (i = 0; i < buffered.length; i++) {
        start = buffered.start(i), end = buffered.end(i), part = children[i];
        if (!part) part = this.el_.appendChild(vjs.createEl());
        part.style.left = percentify(start, bufferedEnd);
        part.style.width = percentify(end - start, bufferedEnd)
    };
    for (i = children.length; i > buffered.length; i--) this.el_.removeChild(children[i - 1])
};
vjs.PlayProgressBar = vjs.Component.extend({
    init: function(player, options) {
        vjs.Component.call(this, player, options)
    }
});
vjs.PlayProgressBar.prototype.createEl = function() {
    return vjs.Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-play-progress',
        innerHTML: '<span class="vjs-control-text"><span>' + this.localize('Progress') + '</span>: 0%</span>'
    })
};
vjs.SeekHandle = vjs.SliderHandle.extend({
    init: function(player, options) {
        vjs.SliderHandle.call(this, player, options);
        this.on(player, 'timeupdate', this.updateContent)
    }
});
vjs.SeekHandle.prototype.defaultValue = '00:00';
vjs.SeekHandle.prototype.createEl = function() {
    return vjs.SliderHandle.prototype.createEl.call(this, 'div', {
        className: 'vjs-seek-handle',
        'aria-live': 'off'
    })
};
vjs.SeekHandle.prototype.updateContent = function() {
    var time = (this.player_.scrubbing) ? this.player_.getCache().currentTime : this.player_.currentTime();
    this.el_.innerHTML = '<span class="vjs-control-text">' + vjs.formatTime(time, this.player_.duration()) + '</span>'
};
vjs.VolumeControl = vjs.Component.extend({
    init: function(player, options) {
        vjs.Component.call(this, player, options);
        if (player.tech && player.tech['featuresVolumeControl'] === false) this.addClass('vjs-hidden');
        this.on(player, 'loadstart', function() {
            if (player.tech['featuresVolumeControl'] === false) {
                this.addClass('vjs-hidden')
            } else this.removeClass('vjs-hidden')
        })
    }
});
vjs.VolumeControl.prototype.options_ = {
    children: {
        volumeBar: {}
    }
};
vjs.VolumeControl.prototype.createEl = function() {
    return vjs.Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-volume-control vjs-control'
    })
};
vjs.VolumeBar = vjs.Slider.extend({
    init: function(player, options) {
        vjs.Slider.call(this, player, options);
        this.on(player, 'volumechange', this.updateARIAAttributes);
        player.ready(vjs.bind(this, this.updateARIAAttributes))
    }
});
vjs.VolumeBar.prototype.updateARIAAttributes = function() {
    this.el_.setAttribute('aria-valuenow', vjs.round(this.player_.volume() * 100, 2));
    this.el_.setAttribute('aria-valuetext', vjs.round(this.player_.volume() * 100, 2) + '%')
};
vjs.VolumeBar.prototype.options_ = {
    children: {
        volumeLevel: {},
        volumeHandle: {}
    },
    barName: 'volumeLevel',
    handleName: 'volumeHandle'
};
vjs.VolumeBar.prototype.playerEvent = 'volumechange';
vjs.VolumeBar.prototype.createEl = function() {
    return vjs.Slider.prototype.createEl.call(this, 'div', {
        className: 'vjs-volume-bar',
        'aria-label': 'volume level'
    })
};
vjs.VolumeBar.prototype.onMouseMove = function(event) {
    if (this.player_.muted()) this.player_.muted(false);
    this.player_.volume(this.calculateDistance(event))
};
vjs.VolumeBar.prototype.getPercent = function() {
    if (this.player_.muted()) {
        return 0
    } else return this.player_.volume()
};
vjs.VolumeBar.prototype.stepForward = function() {
    this.player_.volume(this.player_.volume() + 0.1)
};
vjs.VolumeBar.prototype.stepBack = function() {
    this.player_.volume(this.player_.volume() - 0.1)
};
vjs.VolumeLevel = vjs.Component.extend({
    init: function(player, options) {
        vjs.Component.call(this, player, options)
    }
});
vjs.VolumeLevel.prototype.createEl = function() {
    return vjs.Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-volume-level',
        innerHTML: '<span class="vjs-control-text"></span>'
    })
};
vjs.VolumeHandle = vjs.SliderHandle.extend();
vjs.VolumeHandle.prototype.defaultValue = '00:00';
vjs.VolumeHandle.prototype.createEl = function() {
    return vjs.SliderHandle.prototype.createEl.call(this, 'div', {
        className: 'vjs-volume-handle'
    })
};
vjs.MuteToggle = vjs.Button.extend({
    init: function(player, options) {
        vjs.Button.call(this, player, options);
        this.on(player, 'volumechange', this.update);
        if (player.tech && player.tech['featuresVolumeControl'] === false) this.addClass('vjs-hidden');
        this.on(player, 'loadstart', function() {
            if (player.tech['featuresVolumeControl'] === false) {
                this.addClass('vjs-hidden')
            } else this.removeClass('vjs-hidden')
        })
    }
});
vjs.MuteToggle.prototype.createEl = function() {
    return vjs.Button.prototype.createEl.call(this, 'div', {
        className: 'vjs-mute-control vjs-control',
        innerHTML: '<div><span class="vjs-control-text">' + this.localize('Mute') + '</span></div>'
    })
};
vjs.MuteToggle.prototype.onClick = function() {
    this.player_.muted(this.player_.muted() ? false : true)
};
vjs.MuteToggle.prototype.update = function() {
    var vol = this.player_.volume(),
        level = 3;
    if (vol === 0 || this.player_.muted()) {
        level = 0
    } else if (vol < 0.33) {
        level = 1
    } else if (vol < 0.67) level = 2;
    if (this.player_.muted()) {
        if (this.el_.children[0].children[0].innerHTML != this.localize('Unmute')) this.el_.children[0].children[0].innerHTML = this.localize('Unmute')
    } else if (this.el_.children[0].children[0].innerHTML != this.localize('Mute')) this.el_.children[0].children[0].innerHTML = this.localize('Mute');
    for (var i = 0; i < 4; i++) vjs.removeClass(this.el_, 'vjs-vol-' + i);
    vjs.addClass(this.el_, 'vjs-vol-' + level)
};
vjs.VolumeMenuButton = vjs.MenuButton.extend({
    init: function(player, options) {
        vjs.MenuButton.call(this, player, options);
        this.on(player, 'volumechange', this.volumeUpdate);
        if (player.tech && player.tech['featuresVolumeControl'] === false) this.addClass('vjs-hidden');
        this.on(player, 'loadstart', function() {
            if (player.tech['featuresVolumeControl'] === false) {
                this.addClass('vjs-hidden')
            } else this.removeClass('vjs-hidden')
        });
        this.addClass('vjs-menu-button')
    }
});
vjs.VolumeMenuButton.prototype.createMenu = function() {
    var menu = new vjs.Menu(this.player_, {
            contentElType: 'div'
        }),
        vc = new vjs.VolumeBar(this.player_, this.options_['volumeBar']);
    vc.on('focus', function() {
        menu.lockShowing()
    });
    vc.on('blur', function() {
        menu.unlockShowing()
    });
    menu.addChild(vc);
    return menu
};
vjs.VolumeMenuButton.prototype.onClick = function() {
    vjs.MuteToggle.prototype.onClick.call(this);
    vjs.MenuButton.prototype.onClick.call(this)
};
vjs.VolumeMenuButton.prototype.createEl = function() {
    return vjs.Button.prototype.createEl.call(this, 'div', {
        className: 'vjs-volume-menu-button vjs-menu-button vjs-control',
        innerHTML: '<div><span class="vjs-control-text">' + this.localize('Mute') + '</span></div>'
    })
};
vjs.VolumeMenuButton.prototype.volumeUpdate = vjs.MuteToggle.prototype.update;
vjs.PlaybackRateMenuButton = vjs.MenuButton.extend({
    init: function(player, options) {
        vjs.MenuButton.call(this, player, options);
        this.updateVisibility();
        this.updateLabel();
        this.on(player, 'loadstart', this.updateVisibility);
        this.on(player, 'ratechange', this.updateLabel)
    }
});
vjs.PlaybackRateMenuButton.prototype.buttonText = 'Playback Rate';
vjs.PlaybackRateMenuButton.prototype.className = 'vjs-playback-rate';
vjs.PlaybackRateMenuButton.prototype.createEl = function() {
    var el = vjs.MenuButton.prototype.createEl.call(this);
    this.labelEl_ = vjs.createEl('div', {
        className: 'vjs-playback-rate-value',
        innerHTML: 1.0
    });
    el.appendChild(this.labelEl_);
    return el
};
vjs.PlaybackRateMenuButton.prototype.createMenu = function() {
    var menu = new vjs.Menu(this.player()),
        rates = this.player().options()['playbackRates'];
    if (rates)
        for (var i = rates.length - 1; i >= 0; i--) menu.addChild(new vjs.PlaybackRateMenuItem(this.player(), {
            rate: rates[i] + 'x'
        }));
    return menu
};
vjs.PlaybackRateMenuButton.prototype.updateARIAAttributes = function() {
    this.el().setAttribute('aria-valuenow', this.player().playbackRate())
};
vjs.PlaybackRateMenuButton.prototype.onClick = function() {
    var currentRate = this.player().playbackRate(),
        rates = this.player().options()['playbackRates'],
        newRate = rates[0];
    for (var i = 0; i < rates.length; i++)
        if (rates[i] > currentRate) {
            newRate = rates[i];
            break
        };
    this.player().playbackRate(newRate)
};
vjs.PlaybackRateMenuButton.prototype.playbackRateSupported = function() {
    return this.player().tech && this.player().tech['featuresPlaybackRate'] && this.player().options()['playbackRates'] && this.player().options()['playbackRates'].length > 0
};
vjs.PlaybackRateMenuButton.prototype.updateVisibility = function() {
    if (this.playbackRateSupported()) {
        this.removeClass('vjs-hidden')
    } else this.addClass('vjs-hidden')
};
vjs.PlaybackRateMenuButton.prototype.updateLabel = function() {
    if (this.playbackRateSupported()) this.labelEl_.innerHTML = this.player().playbackRate() + 'x'
};
vjs.PlaybackRateMenuItem = vjs.MenuItem.extend({
    contentElType: 'button',
    init: function(player, options) {
        var label = this.label = options.rate,
            rate = this.rate = parseFloat(label, 10);
        options.label = label;
        options.selected = rate === 1;
        vjs.MenuItem.call(this, player, options);
        this.on(player, 'ratechange', this.update)
    }
});
vjs.PlaybackRateMenuItem.prototype.onClick = function() {
    vjs.MenuItem.prototype.onClick.call(this);
    this.player().playbackRate(this.rate)
};
vjs.PlaybackRateMenuItem.prototype.update = function() {
    this.selected(this.player().playbackRate() == this.rate)
};
vjs.PosterImage = vjs.Button.extend({
    init: function(player, options) {
        vjs.Button.call(this, player, options);
        this.update();
        player.on('posterchange', vjs.bind(this, this.update))
    }
});
vjs.PosterImage.prototype.dispose = function() {
    this.player().off('posterchange', this.update);
    vjs.Button.prototype.dispose.call(this)
};
vjs.PosterImage.prototype.createEl = function() {
    var el = vjs.createEl('div', {
        className: 'vjs-poster',
        tabIndex: -1
    });
    if (!vjs.BACKGROUND_SIZE_SUPPORTED) {
        this.fallbackImg_ = vjs.createEl('img');
        el.appendChild(this.fallbackImg_)
    };
    return el
};
vjs.PosterImage.prototype.update = function() {
    var url = this.player().poster();
    this.setSrc(url);
    if (url) {
        this.show()
    } else this.hide()
};
vjs.PosterImage.prototype.setSrc = function(url) {
    var backgroundImage;
    if (this.fallbackImg_) {
        this.fallbackImg_.src = url
    } else {
        backgroundImage = '';
        if (url) backgroundImage = 'url("' + url + '")';
        this.el_.style.backgroundImage = backgroundImage
    }
};
vjs.PosterImage.prototype.onClick = function() {
    this.player_.play()
};
vjs.LoadingSpinner = vjs.Component.extend({
    init: function(player, options) {
        vjs.Component.call(this, player, options)
    }
});
vjs.LoadingSpinner.prototype.createEl = function() {
    return vjs.Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-loading-spinner'
    })
};
vjs.BigPlayButton = vjs.Button.extend();
vjs.BigPlayButton.prototype.createEl = function() {
    return vjs.Button.prototype.createEl.call(this, 'div', {
        className: 'vjs-big-play-button',
        innerHTML: '<span aria-hidden="true"></span>',
        'aria-label': 'play video'
    })
};
vjs.BigPlayButton.prototype.onClick = function() {
    this.player_.play()
};
vjs.ErrorDisplay = vjs.Component.extend({
    init: function(player, options) {
        vjs.Component.call(this, player, options);
        this.update();
        this.on(player, 'error', this.update)
    }
});
vjs.ErrorDisplay.prototype.createEl = function() {
    var el = vjs.Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-error-display'
    });
    this.contentEl_ = vjs.createEl('div');
    el.appendChild(this.contentEl_);
    return el
};
vjs.ErrorDisplay.prototype.update = function() {
    if (this.player().error()) this.contentEl_.innerHTML = this.localize(this.player().error().message)
};
(function() {
    var createTrackHelper;
    vjs.MediaTechController = vjs.Component.extend({
        init: function(player, options, ready) {
            options = options || {};
            options.reportTouchActivity = false;
            vjs.Component.call(this, player, options, ready);
            if (!this['featuresProgressEvents']) this.manualProgressOn();
            if (!this['featuresTimeupdateEvents']) this.manualTimeUpdatesOn();
            this.initControlsListeners();
            if (!this['featuresNativeTextTracks']) this.emulateTextTracks();
            this.initTextTrackListeners()
        }
    });
    vjs.MediaTechController.prototype.initControlsListeners = function() {
        var player, activateControls;
        player = this.player();
        activateControls = function() {
            if (player.controls() && !player.usingNativeControls()) this.addControlsListeners()
        };
        this.ready(activateControls);
        this.on(player, 'controlsenabled', activateControls);
        this.on(player, 'controlsdisabled', this.removeControlsListeners);
        this.ready(function() {
            if (this.networkState && this.networkState() > 0) this.player().trigger('loadstart')
        })
    };
    vjs.MediaTechController.prototype.addControlsListeners = function() {
        var userWasActive;
        this.on('mousedown', this.onClick);
        this.on('touchstart', function(event) {
            userWasActive = this.player_.userActive()
        });
        this.on('touchmove', function(event) {
            if (userWasActive) this.player().reportUserActivity()
        });
        this.on('touchend', function(event) {
            event.preventDefault()
        });
        this.emitTapEvents();
        this.on('tap', this.onTap)
    };
    vjs.MediaTechController.prototype.removeControlsListeners = function() {
        this.off('tap');
        this.off('touchstart');
        this.off('touchmove');
        this.off('touchleave');
        this.off('touchcancel');
        this.off('touchend');
        this.off('click');
        this.off('mousedown')
    };
    vjs.MediaTechController.prototype.onClick = function(event) {
        if (event.button !== 0) return;
        if (this.player().controls())
            if (this.player().paused()) {
                this.player().play()
            } else this.player().pause()
    };
    vjs.MediaTechController.prototype.onTap = function() {
        this.player().userActive(!this.player().userActive())
    };
    vjs.MediaTechController.prototype.manualProgressOn = function() {
        this.manualProgress = true;
        this.trackProgress()
    };
    vjs.MediaTechController.prototype.manualProgressOff = function() {
        this.manualProgress = false;
        this.stopTrackingProgress()
    };
    vjs.MediaTechController.prototype.trackProgress = function() {
        this.progressInterval = this.setInterval(function() {
            var bufferedPercent = this.player().bufferedPercent();
            if (this.bufferedPercent_ != bufferedPercent) this.player().trigger('progress');
            this.bufferedPercent_ = bufferedPercent;
            if (bufferedPercent === 1) this.stopTrackingProgress()
        }, 500)
    };
    vjs.MediaTechController.prototype.stopTrackingProgress = function() {
        this.clearInterval(this.progressInterval)
    };
    vjs.MediaTechController.prototype.manualTimeUpdatesOn = function() {
        var player = this.player_;
        this.manualTimeUpdates = true;
        this.on(player, 'play', this.trackCurrentTime);
        this.on(player, 'pause', this.stopTrackingCurrentTime);
        this.one('timeupdate', function() {
            this['featuresTimeupdateEvents'] = true;
            this.manualTimeUpdatesOff()
        })
    };
    vjs.MediaTechController.prototype.manualTimeUpdatesOff = function() {
        var player = this.player_;
        this.manualTimeUpdates = false;
        this.stopTrackingCurrentTime();
        this.off(player, 'play', this.trackCurrentTime);
        this.off(player, 'pause', this.stopTrackingCurrentTime)
    };
    vjs.MediaTechController.prototype.trackCurrentTime = function() {
        if (this.currentTimeInterval) this.stopTrackingCurrentTime();
        this.currentTimeInterval = this.setInterval(function() {
            this.player().trigger('timeupdate')
        }, 250)
    };
    vjs.MediaTechController.prototype.stopTrackingCurrentTime = function() {
        this.clearInterval(this.currentTimeInterval);
        this.player().trigger('timeupdate')
    };
    vjs.MediaTechController.prototype.dispose = function() {
        if (this.manualProgress) this.manualProgressOff();
        if (this.manualTimeUpdates) this.manualTimeUpdatesOff();
        vjs.Component.prototype.dispose.call(this)
    };
    vjs.MediaTechController.prototype.setCurrentTime = function() {
        if (this.manualTimeUpdates) this.player().trigger('timeupdate')
    };
    vjs.MediaTechController.prototype.initTextTrackListeners = function() {
        var player = this.player_,
            tracks, textTrackListChanges = function() {
                var textTrackDisplay = player.getChild('textTrackDisplay'),
                    controlBar;
                if (textTrackDisplay) textTrackDisplay.updateDisplay()
            };
        tracks = this.textTracks();
        if (!tracks) return;
        tracks.addEventListener('removetrack', textTrackListChanges);
        tracks.addEventListener('addtrack', textTrackListChanges);
        this.on('dispose', vjs.bind(this, function() {
            tracks.removeEventListener('removetrack', textTrackListChanges);
            tracks.removeEventListener('addtrack', textTrackListChanges)
        }))
    };
    vjs.MediaTechController.prototype.emulateTextTracks = function() {
        var player = this.player_,
            textTracksChanges, tracks, script;
        if (!window.WebVTT) {
            script = document.createElement('script');
            script.src = player.options()['vtt.js'] || '../node_modules/vtt.js/dist/vtt.js';
            player.el().appendChild(script);
            window.WebVTT = true
        };
        tracks = this.textTracks();
        if (!tracks) return;
        textTracksChanges = function() {
            var i, track, textTrackDisplay;
            textTrackDisplay = player.getChild('textTrackDisplay'), textTrackDisplay.updateDisplay();
            for (i = 0; i < this.length; i++) {
                track = this[i];
                track.removeEventListener('cuechange', vjs.bind(textTrackDisplay, textTrackDisplay.updateDisplay));
                if (track.mode === 'showing') track.addEventListener('cuechange', vjs.bind(textTrackDisplay, textTrackDisplay.updateDisplay))
            }
        };
        tracks.addEventListener('change', textTracksChanges);
        this.on('dispose', vjs.bind(this, function() {
            tracks.removeEventListener('change', textTracksChanges)
        }))
    };
    vjs.MediaTechController.prototype.textTracks_;
    vjs.MediaTechController.prototype.textTracks = function() {
        this.player_.textTracks_ = this.player_.textTracks_ || new vjs.TextTrackList();
        return this.player_.textTracks_
    };
    vjs.MediaTechController.prototype.remoteTextTracks = function() {
        this.player_.remoteTextTracks_ = this.player_.remoteTextTracks_ || new vjs.TextTrackList();
        return this.player_.remoteTextTracks_
    };
    createTrackHelper = function(self, kind, label, language, options) {
        var tracks = self.textTracks(),
            track;
        options = options || {};
        options.kind = kind;
        if (label) options.label = label;
        if (language) options.language = language;
        options.player = self.player_;
        track = new vjs.TextTrack(options);
        tracks.addTrack_(track);
        return track
    };
    vjs.MediaTechController.prototype.addTextTrack = function(kind, label, language) {
        if (!kind) throw new Error('TextTrack kind is required but was not provided');
        return createTrackHelper(this, kind, label, language)
    };
    vjs.MediaTechController.prototype.addRemoteTextTrack = function(options) {
        var track = createTrackHelper(this, options.kind, options.label, options.language, options);
        this.remoteTextTracks().addTrack_(track);
        return {
            track: track
        }
    };
    vjs.MediaTechController.prototype.removeRemoteTextTrack = function(track) {
        this.textTracks().removeTrack_(track);
        this.remoteTextTracks().removeTrack_(track)
    };
    vjs.MediaTechController.prototype.setPoster = function() {};
    vjs.MediaTechController.prototype['featuresVolumeControl'] = true;
    vjs.MediaTechController.prototype['featuresFullscreenResize'] = false;
    vjs.MediaTechController.prototype['featuresPlaybackRate'] = false;
    vjs.MediaTechController.prototype['featuresProgressEvents'] = false;
    vjs.MediaTechController.prototype['featuresTimeupdateEvents'] = false;
    vjs.MediaTechController.prototype['featuresNativeTextTracks'] = false;
    vjs.MediaTechController.withSourceHandlers = function(Tech) {
        Tech.registerSourceHandler = function(handler, index) {
            var handlers = Tech.sourceHandlers;
            if (!handlers) handlers = Tech.sourceHandlers = [];
            if (index === undefined) index = handlers.length;
            handlers.splice(index, 0, handler)
        };
        Tech.selectSourceHandler = function(source) {
            var handlers = Tech.sourceHandlers || [],
                can;
            for (var i = 0; i < handlers.length; i++) {
                can = handlers[i]['canHandleSource'](source);
                if (can) return handlers[i]
            };
            return null
        };
        Tech.canPlaySource = function(srcObj) {
            var sh = Tech.selectSourceHandler(srcObj);
            if (sh) return sh.canHandleSource(srcObj);
            return ''
        };
        Tech.prototype.setSource = function(source) {
            var sh = Tech.selectSourceHandler(source);
            if (!sh)
                if (Tech.nativeSourceHandler) {
                    sh = Tech.nativeSourceHandler
                } else vjs.log.error('No source hander found for the current source.');
            this.disposeSourceHandler();
            this.off('dispose', this.disposeSourceHandler);
            this.currentSource_ = source;
            this.sourceHandler_ = sh.handleSource(source, this);
            this.on('dispose', this.disposeSourceHandler);
            return this
        };
        Tech.prototype.disposeSourceHandler = function() {
            if (this.sourceHandler_ && this.sourceHandler_['dispose']) this.sourceHandler_['dispose']()
        }
    };
    vjs.media = {}
})();
vjs.Html5 = vjs.MediaTechController.extend({
    init: function(player, options, ready) {
        var nodes, nodesLength, i, node, nodeName, removeNodes;
        if (options.nativeCaptions === false || options.nativeTextTracks === false) this['featuresNativeTextTracks'] = false;
        vjs.MediaTechController.call(this, player, options, ready);
        this.setupTriggers();
        var source = options.source;
        if (source && (this.el_.currentSrc !== source.src || (player.tag && player.tag.initNetworkState_ === 3))) this.setSource(source);
        if (this.el_.hasChildNodes()) {
            nodes = this.el_.childNodes;
            nodesLength = nodes.length;
            removeNodes = [];
            while (nodesLength--) {
                node = nodes[nodesLength];
                nodeName = node.nodeName.toLowerCase();
                if (nodeName === 'track')
                    if (!this['featuresNativeTextTracks']) {
                        removeNodes.push(node)
                    } else this.remoteTextTracks().addTrack_(node.track)
            };
            for (i = 0; i < removeNodes.length; i++) this.el_.removeChild(removeNodes[i])
        };
        if (vjs.TOUCH_ENABLED && player.options()['nativeControlsForTouch'] === true) this.useNativeControls();
        player.ready(function() {
            if (this.src() && this.tag && this.options_['autoplay'] && this.paused()) {
                delete this.tag['poster'];
                this.play()
            }
        });
        this.triggerReady()
    }
});
vjs.Html5.prototype.dispose = function() {
    vjs.Html5.disposeMediaElement(this.el_);
    vjs.MediaTechController.prototype.dispose.call(this)
};
vjs.Html5.prototype.createEl = function() {
    var player = this.player_,
        track, trackEl, i, el = player.tag,
        attributes, newEl, clone;
    if (!el || this['movingMediaElementInDOM'] === false) {
        if (el) {
            clone = el.cloneNode(false);
            vjs.Html5.disposeMediaElement(el);
            el = clone;
            player.tag = null
        } else {
            el = vjs.createEl('video');
            attributes = videojs.util.mergeOptions({}, player.tagAttributes);
            if (!vjs.TOUCH_ENABLED || player.options()['nativeControlsForTouch'] !== true) delete attributes.controls;
            vjs.setElementAttributes(el, vjs.obj.merge(attributes, {
                id: player.id() + '_html5_api',
                'class': 'vjs-tech'
            }))
        };
        el.player = player;
        if (player.options_.tracks)
            for (i = 0; i < player.options_.tracks.length; i++) {
                track = player.options_.tracks[i];
                trackEl = document.createElement('track');
                trackEl.kind = track.kind;
                trackEl.label = track.label;
                trackEl.srclang = track.srclang;
                trackEl.src = track.src;
                if ('default' in track) trackEl.setAttribute('default', 'default');
                el.appendChild(trackEl)
            };
        vjs.insertFirst(el, player.el())
    };
    var settingsAttrs = ['autoplay', 'preload', 'loop', 'muted'];
    for (i = settingsAttrs.length - 1; i >= 0; i--) {
        var attr = settingsAttrs[i],
            overwriteAttrs = {};
        if (typeof player.options_[attr] !== 'undefined') overwriteAttrs[attr] = player.options_[attr];
        vjs.setElementAttributes(el, overwriteAttrs)
    };
    return el
};
vjs.Html5.prototype.setupTriggers = function() {
    for (var i = vjs.Html5.Events.length - 1; i >= 0; i--) this.on(vjs.Html5.Events[i], this.eventHandler)
};
vjs.Html5.prototype.eventHandler = function(evt) {
    if (evt.type == 'error' && this.error()) {
        this.player().error(this.error().code)
    } else {
        evt.bubbles = false;
        this.player().trigger(evt)
    }
};
vjs.Html5.prototype.useNativeControls = function() {
    var tech, player, controlsOn, controlsOff, cleanUp;
    tech = this;
    player = this.player();
    tech.setControls(player.controls());
    controlsOn = function() {
        tech.setControls(true)
    };
    controlsOff = function() {
        tech.setControls(false)
    };
    player.on('controlsenabled', controlsOn);
    player.on('controlsdisabled', controlsOff);
    cleanUp = function() {
        player.off('controlsenabled', controlsOn);
        player.off('controlsdisabled', controlsOff)
    };
    tech.on('dispose', cleanUp);
    player.on('usingcustomcontrols', cleanUp);
    player.usingNativeControls(true)
};
vjs.Html5.prototype.play = function() {
    this.el_.play()
};
vjs.Html5.prototype.pause = function() {
    this.el_.pause()
};
vjs.Html5.prototype.paused = function() {
    return this.el_.paused
};
vjs.Html5.prototype.currentTime = function() {
    return this.el_.currentTime
};
vjs.Html5.prototype.setCurrentTime = function(seconds) {
    try {
        this.el_.currentTime = seconds
    } catch (e) {
        vjs.log(e, 'Video is not ready. (Video.js)')
    }
};
vjs.Html5.prototype.duration = function() {
    return this.el_.duration || 0
};
vjs.Html5.prototype.buffered = function() {
    return this.el_.buffered
};
vjs.Html5.prototype.volume = function() {
    return this.el_.volume
};
vjs.Html5.prototype.setVolume = function(percentAsDecimal) {
    this.el_.volume = percentAsDecimal
};
vjs.Html5.prototype.muted = function() {
    return this.el_.muted
};
vjs.Html5.prototype.setMuted = function(muted) {
    this.el_.muted = muted
};
vjs.Html5.prototype.width = function() {
    return this.el_.offsetWidth
};
vjs.Html5.prototype.height = function() {
    return this.el_.offsetHeight
};
vjs.Html5.prototype.supportsFullScreen = function() {
    if (typeof this.el_.webkitEnterFullScreen == 'function')
        if (/Android/.test(vjs.USER_AGENT) || !/Chrome|Mac OS X 10.5/.test(vjs.USER_AGENT)) return true;
    return false
};
vjs.Html5.prototype.enterFullScreen = function() {
    var video = this.el_;
    if ('webkitDisplayingFullscreen' in video) this.one('webkitbeginfullscreen', function() {
        this.player_.isFullscreen(true);
        this.one('webkitendfullscreen', function() {
            this.player_.isFullscreen(false);
            this.player_.trigger('fullscreenchange')
        });
        this.player_.trigger('fullscreenchange')
    });
    if (video.paused && video.networkState <= video.HAVE_METADATA) {
        this.el_.play();
        this.setTimeout(function() {
            video.pause();
            video.webkitEnterFullScreen()
        }, 0)
    } else video.webkitEnterFullScreen()
};
vjs.Html5.prototype.exitFullScreen = function() {
    this.el_.webkitExitFullScreen()
};
vjs.Html5.prototype.returnOriginalIfBlobURI_ = function(elementURI, originalURI) {
    var blobURIRegExp = /^blob\:/i;
    if (originalURI && elementURI && blobURIRegExp.test(elementURI)) return originalURI;
    return elementURI
};
vjs.Html5.prototype.src = function(src) {
    var elementSrc = this.el_.src;
    if (src === undefined) {
        return this.returnOriginalIfBlobURI_(elementSrc, this.source_)
    } else this.setSrc(src)
};
vjs.Html5.prototype.setSrc = function(src) {
    this.el_.src = src
};
vjs.Html5.prototype.load = function() {
    this.el_.load()
};
vjs.Html5.prototype.currentSrc = function() {
    var elementSrc = this.el_.currentSrc;
    if (!this.currentSource_) return elementSrc;
    return this.returnOriginalIfBlobURI_(elementSrc, this.currentSource_.src)
};
vjs.Html5.prototype.poster = function() {
    return this.el_.poster
};
vjs.Html5.prototype.setPoster = function(val) {
    this.el_.poster = val
};
vjs.Html5.prototype.preload = function() {
    return this.el_.preload
};
vjs.Html5.prototype.setPreload = function(val) {
    this.el_.preload = val
};
vjs.Html5.prototype.autoplay = function() {
    return this.el_.autoplay
};
vjs.Html5.prototype.setAutoplay = function(val) {
    this.el_.autoplay = val
};
vjs.Html5.prototype.controls = function() {
    return this.el_.controls
};
vjs.Html5.prototype.setControls = function(val) {
    this.el_.controls = !!val
};
vjs.Html5.prototype.loop = function() {
    return this.el_.loop
};
vjs.Html5.prototype.setLoop = function(val) {
    this.el_.loop = val
};
vjs.Html5.prototype.error = function() {
    return this.el_.error
};
vjs.Html5.prototype.seeking = function() {
    return this.el_.seeking
};
vjs.Html5.prototype.seekable = function() {
    return this.el_.seekable
};
vjs.Html5.prototype.ended = function() {
    return this.el_.ended
};
vjs.Html5.prototype.defaultMuted = function() {
    return this.el_.defaultMuted
};
vjs.Html5.prototype.playbackRate = function() {
    return this.el_.playbackRate
};
vjs.Html5.prototype.setPlaybackRate = function(val) {
    this.el_.playbackRate = val
};
vjs.Html5.prototype.networkState = function() {
    return this.el_.networkState
};
vjs.Html5.prototype.readyState = function() {
    return this.el_.readyState
};
vjs.Html5.prototype.textTracks = function() {
    if (!this['featuresNativeTextTracks']) return vjs.MediaTechController.prototype.textTracks.call(this);
    return this.el_.textTracks
};
vjs.Html5.prototype.addTextTrack = function(kind, label, language) {
    if (!this['featuresNativeTextTracks']) return vjs.MediaTechController.prototype.addTextTrack.call(this, kind, label, language);
    return this.el_.addTextTrack(kind, label, language)
};
vjs.Html5.prototype.addRemoteTextTrack = function(options) {
    if (!this['featuresNativeTextTracks']) return vjs.MediaTechController.prototype.addRemoteTextTrack.call(this, options);
    var track = document.createElement('track');
    options = options || {};
    if (options.kind) track.kind = options.kind;
    if (options.label) track.label = options.label;
    if (options.language || options.srclang) track.srclang = options.language || options.srclang;
    if (options['default']) track['default'] = options['default'];
    if (options.id) track.id = options.id;
    if (options.src) track.src = options.src;
    this.el().appendChild(track);
    this.remoteTextTracks().addTrack_(track.track);
    return track
};
vjs.Html5.prototype.removeRemoteTextTrack = function(track) {
    if (!this['featuresNativeTextTracks']) return vjs.MediaTechController.prototype.removeRemoteTextTrack.call(this, track);
    var tracks, i;
    this.remoteTextTracks().removeTrack_(track);
    tracks = this.el()['querySelectorAll']('track');
    for (i = 0; i < tracks.length; i++)
        if (tracks[i] === track || tracks[i]['track'] === track) {
            tracks[i]['parentNode']['removeChild'](tracks[i]);
            break
        }
};
vjs.Html5.isSupported = function() {
    try {
        vjs.TEST_VID['volume'] = 0.5
    } catch (e) {
        return false
    };
    return !!vjs.TEST_VID.canPlayType
};
vjs.MediaTechController.withSourceHandlers(vjs.Html5);
(function() {
    var origSetSource = vjs.Html5.prototype.setSource,
        origDisposeSourceHandler = vjs.Html5.prototype.disposeSourceHandler;
    vjs.Html5.prototype.setSource = function(source) {
        var retVal = origSetSource.call(this, source);
        this.source_ = source.src;
        return retVal
    };
    vjs.Html5.prototype.disposeSourceHandler = function() {
        this.source_ = undefined;
        return origDisposeSourceHandler.call(this)
    }
})();
vjs.Html5['nativeSourceHandler'] = {};
vjs.Html5['nativeSourceHandler']['canHandleSource'] = function(source) {
    var match, ext

    function canPlayType(type) {
        try {
            return vjs.TEST_VID.canPlayType(type)
        } catch (e) {
            return ''
        }
    };
    if (source.type) {
        return canPlayType(source.type)
    } else if (source.src) {
        match = source.src.match(/\.([^.\/\?]+)(\?[^\/]+)?$/i);
        ext = match && match[1];
        return canPlayType('video/' + ext)
    };
    return ''
};
vjs.Html5['nativeSourceHandler']['handleSource'] = function(source, tech) {
    tech.setSrc(source.src)
};
vjs.Html5['nativeSourceHandler']['dispose'] = function() {};
vjs.Html5['registerSourceHandler'](vjs.Html5['nativeSourceHandler']);
vjs.Html5.canControlVolume = function() {
    var volume = vjs.TEST_VID.volume;
    vjs.TEST_VID.volume = (volume / 2) + 0.1;
    return volume !== vjs.TEST_VID.volume
};
vjs.Html5.canControlPlaybackRate = function() {
    var playbackRate = vjs.TEST_VID.playbackRate;
    vjs.TEST_VID.playbackRate = (playbackRate / 2) + 0.1;
    return playbackRate !== vjs.TEST_VID.playbackRate
};
vjs.Html5.supportsNativeTextTracks = function() {
    var supportsTextTracks;
    supportsTextTracks = !!vjs.TEST_VID.textTracks;
    if (supportsTextTracks && vjs.TEST_VID.textTracks.length > 0) supportsTextTracks = typeof vjs.TEST_VID.textTracks[0]['mode'] !== 'number';
    if (supportsTextTracks && vjs.IS_FIREFOX) supportsTextTracks = false;
    return supportsTextTracks
};
vjs.Html5.prototype['featuresVolumeControl'] = vjs.Html5.canControlVolume();
vjs.Html5.prototype['featuresPlaybackRate'] = vjs.Html5.canControlPlaybackRate();
vjs.Html5.prototype['movingMediaElementInDOM'] = !vjs.IS_IOS;
vjs.Html5.prototype['featuresFullscreenResize'] = true;
vjs.Html5.prototype['featuresProgressEvents'] = true;
vjs.Html5.prototype['featuresNativeTextTracks'] = vjs.Html5.supportsNativeTextTracks();
(function() {
    var canPlayType, mpegurlRE = /^application\/(?:x-|vnd\.apple\.)mpegurl/i,
        mp4RE = /^video\/mp4/i;
    vjs.Html5.patchCanPlayType = function() {
        if (vjs.ANDROID_VERSION >= 4.0) {
            if (!canPlayType) canPlayType = vjs.TEST_VID.constructor.prototype.canPlayType;
            vjs.TEST_VID.constructor.prototype.canPlayType = function(type) {
                if (type && mpegurlRE.test(type)) return 'maybe';
                return canPlayType.call(this, type)
            }
        };
        if (vjs.IS_OLD_ANDROID) {
            if (!canPlayType) canPlayType = vjs.TEST_VID.constructor.prototype.canPlayType;
            vjs.TEST_VID.constructor.prototype.canPlayType = function(type) {
                if (type && mp4RE.test(type)) return 'maybe';
                return canPlayType.call(this, type)
            }
        }
    };
    vjs.Html5.unpatchCanPlayType = function() {
        var r = vjs.TEST_VID.constructor.prototype.canPlayType;
        vjs.TEST_VID.constructor.prototype.canPlayType = canPlayType;
        canPlayType = null;
        return r
    };
    vjs.Html5.patchCanPlayType()
})();
vjs.Html5.Events = 'loadstart,suspend,abort,error,emptied,stalled,loadedmetadata,loadeddata,canplay,canplaythrough,playing,waiting,seeking,seeked,ended,durationchange,timeupdate,progress,play,pause,ratechange,volumechange'.split(',');
vjs.Html5.disposeMediaElement = function(el) {
    if (!el) return;
    el.player = null;
    if (el.parentNode) el.parentNode.removeChild(el);
    while (el.hasChildNodes()) el.removeChild(el.firstChild);
    el.removeAttribute('src');
    if (typeof el.load === 'function')(function() {
        try {
            el.load()
        } catch (e) {}
    })()
};
vjs.Flash = vjs.MediaTechController.extend({
    init: function(player, options, ready) {
        vjs.MediaTechController.call(this, player, options, ready);
        var source = options.source,
            objId = player.id() + '_flash_api',
            playerOptions = player.options_,
            flashVars = vjs.obj.merge({
                readyFunction: 'videojs.Flash.onReady',
                eventProxyFunction: 'videojs.Flash.onEvent',
                errorEventProxyFunction: 'videojs.Flash.onError',
                autoplay: playerOptions.autoplay,
                preload: playerOptions.preload,
                loop: playerOptions.loop,
                muted: playerOptions.muted
            }, options.flashVars),
            params = vjs.obj.merge({
                wmode: 'opaque',
                bgcolor: '#000000'
            }, options.params),
            attributes = vjs.obj.merge({
                id: objId,
                name: objId,
                'class': 'vjs-tech'
            }, options.attributes);
        if (source) this.ready(function() {
            this.setSource(source)
        });
        vjs.insertFirst(this.el_, options.parentEl);
        if (options.startTime) this.ready(function() {
            this.load();
            this.play();
            this['currentTime'](options.startTime)
        });
        if (vjs.IS_FIREFOX) this.ready(function() {
            this.on('mousemove', function() {
                this.player().trigger({
                    type: 'mousemove',
                    bubbles: false
                })
            })
        });
        player.on('stageclick', player.reportUserActivity);
        this.el_ = vjs.Flash.embed(options.swf, this.el_, flashVars, params, attributes)
    }
});
vjs.Flash.prototype.dispose = function() {
    vjs.MediaTechController.prototype.dispose.call(this)
};
vjs.Flash.prototype.play = function() {
    if (this.ended()) this['setCurrentTime'](0);
    this.el_.vjs_play()
};
vjs.Flash.prototype.pause = function() {
    this.el_.vjs_pause()
};
vjs.Flash.prototype.src = function(src) {
    if (src === undefined) return this['currentSrc']();
    return this.setSrc(src)
};
vjs.Flash.prototype.setSrc = function(src) {
    src = vjs.getAbsoluteURL(src);
    this.el_.vjs_src(src);
    if (this.player_.autoplay()) {
        var tech = this;
        this.setTimeout(function() {
            tech.play()
        }, 0)
    }
};
vjs.Flash.prototype['setCurrentTime'] = function(time) {
    this.lastSeekTarget_ = time;
    this.el_.vjs_setProperty('currentTime', time);
    vjs.MediaTechController.prototype.setCurrentTime.call(this)
};
vjs.Flash.prototype['currentTime'] = function(time) {
    if (this.seeking()) return this.lastSeekTarget_ || 0;
    return this.el_.vjs_getProperty('currentTime')
};
vjs.Flash.prototype['currentSrc'] = function() {
    if (this.currentSource_) {
        return this.currentSource_.src
    } else return this.el_.vjs_getProperty('currentSrc')
};
vjs.Flash.prototype.load = function() {
    this.el_.vjs_load()
};
vjs.Flash.prototype.poster = function() {
    this.el_.vjs_getProperty('poster')
};
vjs.Flash.prototype['setPoster'] = function() {};
vjs.Flash.prototype.seekable = function() {
    var duration = this.duration();
    if (duration === 0) return vjs.createTimeRange();
    return vjs.createTimeRange(0, this.duration())
};
vjs.Flash.prototype.buffered = function() {
    if (!this.el_.vjs_getProperty) return vjs.createTimeRange();
    return vjs.createTimeRange(0, this.el_.vjs_getProperty('buffered'))
};
vjs.Flash.prototype.duration = function() {
    if (!this.el_.vjs_getProperty) return 0;
    return this.el_.vjs_getProperty('duration')
};
vjs.Flash.prototype.supportsFullScreen = function() {
    return false
};
vjs.Flash.prototype.enterFullScreen = function() {
    return false
};
(function() {
    var api = vjs.Flash.prototype,
        readWrite = 'rtmpConnection,rtmpStream,preload,defaultPlaybackRate,playbackRate,autoplay,loop,mediaGroup,controller,controls,volume,muted,defaultMuted'.split(','),
        readOnly = 'error,networkState,readyState,seeking,initialTime,startOffsetTime,paused,played,ended,videoTracks,audioTracks,videoWidth,videoHeight'.split(','),
        i

    function createSetter(attr) {
        var attrUpper = attr.charAt(0).toUpperCase() + attr.slice(1);
        api['set' + attrUpper] = function(val) {
            return this.el_.vjs_setProperty(attr, val)
        }
    }

    function createGetter(attr) {
        api[attr] = function() {
            return this.el_.vjs_getProperty(attr)
        }
    };
    for (i = 0; i < readWrite.length; i++) {
        createGetter(readWrite[i]);
        createSetter(readWrite[i])
    };
    for (i = 0; i < readOnly.length; i++) createGetter(readOnly[i])
})();
vjs.Flash.isSupported = function() {
    return vjs.Flash.version()[0] >= 10
};
vjs.MediaTechController.withSourceHandlers(vjs.Flash);
vjs.Flash['nativeSourceHandler'] = {};
vjs.Flash['nativeSourceHandler']['canHandleSource'] = function(source) {
    var type;
    if (!source.type) return '';
    type = source.type.replace(/;.*/, '').toLowerCase();
    if (type in vjs.Flash.formats) return 'maybe';
    return ''
};
vjs.Flash['nativeSourceHandler']['handleSource'] = function(source, tech) {
    tech.setSrc(source.src)
};
vjs.Flash['nativeSourceHandler']['dispose'] = function() {};
vjs.Flash['registerSourceHandler'](vjs.Flash['nativeSourceHandler']);
vjs.Flash.formats = {
    'video/flv': 'FLV',
    'video/x-flv': 'FLV',
    'video/mp4': 'MP4',
    'video/m4v': 'MP4'
};
vjs.Flash['onReady'] = function(currSwf) {
    var el, player;
    el = vjs.el(currSwf);
    player = el && el.parentNode && el.parentNode['player'];
    if (player) {
        el.player = player;
        vjs.Flash['checkReady'](player.tech)
    }
};
vjs.Flash['checkReady'] = function(tech) {
    if (!tech.el()) return;
    if (tech.el().vjs_getProperty) {
        tech.triggerReady()
    } else this.setTimeout(function() {
        vjs.Flash['checkReady'](tech)
    }, 50)
};
vjs.Flash['onEvent'] = function(swfID, eventName) {
    var player = vjs.el(swfID)['player'];
    player.trigger(eventName)
};
vjs.Flash['onError'] = function(swfID, err) {
    var player = vjs.el(swfID)['player'],
        msg = 'FLASH: ' + err;
    if (err == 'srcnotfound') {
        player.error({
            code: 4,
            message: msg
        })
    } else player.error(msg)
};
vjs.Flash.version = function() {
    var version = '0,0,0';
    try {
        version = new window.ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1]
    } catch (e) {
        try {
            if (navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) version = (navigator.plugins['Shockwave Flash 2.0'] || navigator.plugins['Shockwave Flash']).description.replace(/\D+/g, ',').match(/^,?(.+),?$/)[1]
        } catch (err) {}
    };
    return version.split(',')
};
vjs.Flash.embed = function(swf, placeHolder, flashVars, params, attributes) {
    var code = vjs.Flash.getEmbedCode(swf, flashVars, params, attributes),
        obj = vjs.createEl('div', {
            innerHTML: code
        }).childNodes[0],
        par = placeHolder.parentNode;
    placeHolder.parentNode.replaceChild(obj, placeHolder);
    obj[vjs.expando] = placeHolder[vjs.expando];
    var newObj = par.childNodes[0];
    setTimeout(function() {
        newObj.style.display = 'block'
    }, 1e3);
    return obj
};
vjs.Flash.getEmbedCode = function(swf, flashVars, params, attributes) {
    var objTag = '<object type="application/x-shockwave-flash" ',
        flashVarsString = '',
        paramsString = '',
        attrsString = '';
    if (flashVars) vjs.obj.each(flashVars, function(key, val) {
        flashVarsString += (key + '=' + val + '&amp;')
    });
    params = vjs.obj.merge({
        movie: swf,
        flashvars: flashVarsString,
        allowScriptAccess: 'always',
        allowNetworking: 'all'
    }, params);
    vjs.obj.each(params, function(key, val) {
        paramsString += '<param name="' + key + '" value="' + val + '" />'
    });
    attributes = vjs.obj.merge({
        data: swf,
        width: '100%',
        height: '100%'
    }, attributes);
    vjs.obj.each(attributes, function(key, val) {
        attrsString += (key + '="' + val + '" ')
    });
    return objTag + attrsString + '>' + paramsString + '</object>'
};
vjs.Flash.streamingFormats = {
    'rtmp/mp4': 'MP4',
    'rtmp/flv': 'FLV'
};
vjs.Flash.streamFromParts = function(connection, stream) {
    return connection + '&' + stream
};
vjs.Flash.streamToParts = function(src) {
    var parts = {
        connection: '',
        stream: ''
    };
    if (!src) return parts;
    var connEnd = src.indexOf('&'),
        streamBegin;
    if (connEnd !== -1) {
        streamBegin = connEnd + 1
    } else {
        connEnd = streamBegin = src.lastIndexOf('/') + 1;
        if (connEnd === 0) connEnd = streamBegin = src.length
    };
    parts.connection = src.substring(0, connEnd);
    parts.stream = src.substring(streamBegin, src.length);
    return parts
};
vjs.Flash.isStreamingType = function(srcType) {
    return srcType in vjs.Flash.streamingFormats
};
vjs.Flash.RTMP_RE = /^rtmp[set]?:\/\//i;
vjs.Flash.isStreamingSrc = function(src) {
    return vjs.Flash.RTMP_RE.test(src)
};
vjs.Flash.rtmpSourceHandler = {};
vjs.Flash.rtmpSourceHandler['canHandleSource'] = function(source) {
    if (vjs.Flash.isStreamingType(source.type) || vjs.Flash.isStreamingSrc(source.src)) return 'maybe';
    return ''
};
vjs.Flash.rtmpSourceHandler['handleSource'] = function(source, tech) {
    var srcParts = vjs.Flash.streamToParts(source.src);
    tech.setRtmpConnection(srcParts.connection);
    tech.setRtmpStream(srcParts.stream)
};
vjs.Flash['registerSourceHandler'](vjs.Flash.rtmpSourceHandler);
vjs.MediaLoader = vjs.Component.extend({
    init: function(player, options, ready) {
        vjs.Component.call(this, player, options, ready);
        if (!player.options_['sources'] || player.options_['sources'].length === 0) {
            for (var i = 0, j = player.options_['techOrder']; i < j.length; i++) {
                var techName = vjs.capitalize(j[i]),
                    tech = window.videojs[techName];
                if (tech && tech.isSupported()) {
                    player.loadTech(techName);
                    break
                }
            }
        } else player.src(player.options_['sources'])
    }
});
vjs.TextTrackMode = {
    disabled: 'disabled',
    hidden: 'hidden',
    showing: 'showing'
};
vjs.TextTrackKind = {
    subtitles: 'subtitles',
    captions: 'captions',
    descriptions: 'descriptions',
    chapters: 'chapters',
    metadata: 'metadata'
};
(function() {
    vjs.TextTrack = function(options) {
        var tt, id, mode, kind, label, language, cues, activeCues, timeupdateHandler, changed, prop;
        options = options || {};
        if (!options.player) throw new Error('A player was not provided.');
        tt = this;
        if (vjs.IS_IE8) {
            tt = document.createElement('custom');
            for (prop in vjs.TextTrack.prototype) tt[prop] = vjs.TextTrack.prototype[prop]
        };
        tt.player_ = options.player;
        mode = vjs.TextTrackMode[options.mode] || 'disabled';
        kind = vjs.TextTrackKind[options.kind] || 'subtitles';
        label = options.label || '';
        language = options.language || options.srclang || '';
        id = options.id || 'vjs_text_track_' + vjs.guid++;
        if (kind === 'metadata' || kind === 'chapters') mode = 'hidden';
        tt.cues_ = [];
        tt.activeCues_ = [];
        cues = new vjs.TextTrackCueList(tt.cues_);
        activeCues = new vjs.TextTrackCueList(tt.activeCues_);
        changed = false;
        timeupdateHandler = vjs.bind(tt, function() {
            this['activeCues'];
            if (changed) {
                this['trigger']('cuechange');
                changed = false
            }
        });
        if (mode !== 'disabled') tt.player_.on('timeupdate', timeupdateHandler);
        Object.defineProperty(tt, 'kind', {
            get: function() {
                return kind
            },
            set: Function.prototype
        });
        Object.defineProperty(tt, 'label', {
            get: function() {
                return label
            },
            set: Function.prototype
        });
        Object.defineProperty(tt, 'language', {
            get: function() {
                return language
            },
            set: Function.prototype
        });
        Object.defineProperty(tt, 'id', {
            get: function() {
                return id
            },
            set: Function.prototype
        });
        Object.defineProperty(tt, 'mode', {
            get: function() {
                return mode
            },
            set: function(newMode) {
                if (!vjs.TextTrackMode[newMode]) return;
                mode = newMode;
                if (mode === 'showing') this.player_.on('timeupdate', timeupdateHandler);
                this.trigger('modechange')
            }
        });
        Object.defineProperty(tt, 'cues', {
            get: function() {
                if (!this.loaded_) return null;
                return cues
            },
            set: Function.prototype
        });
        Object.defineProperty(tt, 'activeCues', {
            get: function() {
                var i, l, active, ct, cue;
                if (!this.loaded_) return null;
                if (this['cues'].length === 0) return activeCues;
                ct = this.player_.currentTime();
                i = 0;
                l = this['cues'].length;
                active = [];
                for (; i < l; i++) {
                    cue = this['cues'][i];
                    if (cue.startTime <= ct && cue.endTime >= ct) {
                        active.push(cue)
                    } else if (cue.startTime === cue.endTime && cue.startTime <= ct && cue.startTime + 0.5 >= ct) active.push(cue)
                };
                changed = false;
                if (active.length !== this.activeCues_.length) {
                    changed = true
                } else
                    for (i = 0; i < active.length; i++)
                        if (indexOf.call(this.activeCues_, active[i]) === -1) changed = true;
                this.activeCues_ = active;
                activeCues.setCues_(this.activeCues_);
                return activeCues
            },
            set: Function.prototype
        });
        if (options.src) {
            loadTrack(options.src, tt)
        } else tt.loaded_ = true;
        if (vjs.IS_IE8) return tt
    };
    vjs.TextTrack.prototype = vjs.obj.create(vjs.EventEmitter.prototype);
    vjs.TextTrack.prototype.constructor = vjs.TextTrack;
    vjs.TextTrack.prototype.allowedEvents_ = {
        cuechange: 'cuechange'
    };
    vjs.TextTrack.prototype.addCue = function(cue) {
        var tracks = this.player_.textTracks(),
            i = 0;
        if (tracks)
            for (; i < tracks.length; i++)
                if (tracks[i] !== this) tracks[i].removeCue(cue);
        this.cues_.push(cue);
        this['cues'].setCues_(this.cues_)
    };
    vjs.TextTrack.prototype.removeCue = function(removeCue) {
        var i = 0,
            l = this.cues_.length,
            cue, removed = false;
        for (; i < l; i++) {
            cue = this.cues_[i];
            if (cue === removeCue) {
                this.cues_.splice(i, 1);
                removed = true
            }
        };
        if (removed) this.cues.setCues_(this.cues_)
    };
    var loadTrack, parseCues, indexOf;
    loadTrack = function(src, track) {
        vjs.xhr(src, vjs.bind(this, function(err, response, responseBody) {
            if (err) return vjs.log.error(err);
            track.loaded_ = true;
            parseCues(responseBody, track)
        }))
    };
    parseCues = function(srcContent, track) {
        if (typeof window.WebVTT !== 'function') return window.setTimeout(function() {
            parseCues(srcContent, track)
        }, 25);
        var parser = new window.WebVTT['Parser'](window, window.vttjs, window.WebVTT['StringDecoder']());
        parser.oncue = function(cue) {
            track.addCue(cue)
        };
        parser.onparsingerror = function(error) {
            vjs.log.error(error)
        };
        parser.parse(srcContent);
        parser.flush()
    };
    indexOf = function(searchElement, fromIndex) {
        var k;
        if (this == null) throw new TypeError('"this" is null or not defined');
        var O = Object(this),
            len = O.length >>> 0;
        if (len === 0) return -1;
        var n = +fromIndex || 0;
        if (Math.abs(n) === Infinity) n = 0;
        if (n >= len) return -1;
        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
        while (k < len) {
            if (k in O && O[k] === searchElement) return k;
            k++
        };
        return -1
    }
})();
vjs.TextTrackList = function(tracks) {
    var list = this,
        prop, i = 0;
    if (vjs.IS_IE8) {
        list = document.createElement('custom');
        for (prop in vjs.TextTrackList.prototype) list[prop] = vjs.TextTrackList.prototype[prop]
    };
    tracks = tracks || [];
    list.tracks_ = [];
    Object.defineProperty(list, 'length', {
        get: function() {
            return this.tracks_.length
        }
    });
    for (; i < tracks.length; i++) list.addTrack_(tracks[i]);
    if (vjs.IS_IE8) return list
};
vjs.TextTrackList.prototype = vjs.obj.create(vjs.EventEmitter.prototype);
vjs.TextTrackList.prototype.constructor = vjs.TextTrackList;
vjs.TextTrackList.prototype.allowedEvents_ = {
    change: 'change',
    addtrack: 'addtrack',
    removetrack: 'removetrack'
};
(function() {
    var event;
    for (event in vjs.TextTrackList.prototype.allowedEvents_) vjs.TextTrackList.prototype['on' + event] = null
})();
vjs.TextTrackList.prototype.addTrack_ = function(track) {
    var index = this.tracks_.length;
    if (!('' + index in this)) Object.defineProperty(this, index, {
        get: function() {
            return this.tracks_[index]
        }
    });
    track.addEventListener('modechange', vjs.bind(this, function() {
        this.trigger('change')
    }));
    this.tracks_.push(track);
    this.trigger({
        type: 'addtrack',
        track: track
    })
};
vjs.TextTrackList.prototype.removeTrack_ = function(rtrack) {
    var i = 0,
        l = this.length,
        result = null,
        track;
    for (; i < l; i++) {
        track = this[i];
        if (track === rtrack) {
            this.tracks_.splice(i, 1);
            break
        }
    };
    this.trigger({
        type: 'removetrack',
        track: rtrack
    })
};
vjs.TextTrackList.prototype.getTrackById = function(id) {
    var i = 0,
        l = this.length,
        result = null,
        track;
    for (; i < l; i++) {
        track = this[i];
        if (track.id === id) {
            result = track;
            break
        }
    };
    return result
};
vjs.TextTrackCueList = function(cues) {
    var list = this,
        prop;
    if (vjs.IS_IE8) {
        list = document.createElement('custom');
        for (prop in vjs.TextTrackCueList.prototype) list[prop] = vjs.TextTrackCueList.prototype[prop]
    };
    vjs.TextTrackCueList.prototype.setCues_.call(list, cues);
    Object.defineProperty(list, 'length', {
        get: function() {
            return this.length_
        }
    });
    if (vjs.IS_IE8) return list
};
vjs.TextTrackCueList.prototype.setCues_ = function(cues) {
    var oldLength = this.length || 0,
        i = 0,
        l = cues.length,
        defineProp;
    this.cues_ = cues;
    this.length_ = cues.length;
    defineProp = function(i) {
        if (!('' + i in this)) Object.defineProperty(this, '' + i, {
            get: function() {
                return this.cues_[i]
            }
        })
    };
    if (oldLength < l) {
        i = oldLength;
        for (; i < l; i++) defineProp.call(this, i)
    }
};
vjs.TextTrackCueList.prototype.getCueById = function(id) {
    var i = 0,
        l = this.length,
        result = null,
        cue;
    for (; i < l; i++) {
        cue = this[i];
        if (cue.id === id) {
            result = cue;
            break
        }
    };
    return result
};
(function() {
    'use strict';
    vjs.TextTrackDisplay = vjs.Component.extend({
        init: function(player, options, ready) {
            vjs.Component.call(this, player, options, ready);
            player.on('loadstart', vjs.bind(this, this.toggleDisplay));
            player.ready(vjs.bind(this, function() {
                if (player.tech && player.tech['featuresNativeTextTracks']) {
                    this.hide();
                    return
                };
                var i, tracks, track;
                player.on('fullscreenchange', vjs.bind(this, this.updateDisplay));
                tracks = player.options_['tracks'] || [];
                for (i = 0; i < tracks.length; i++) {
                    track = tracks[i];
                    this.player_.addRemoteTextTrack(track)
                }
            }))
        }
    });
    vjs.TextTrackDisplay.prototype.toggleDisplay = function() {
        if (this.player_.tech && this.player_.tech['featuresNativeTextTracks']) {
            this.hide()
        } else this.show()
    };
    vjs.TextTrackDisplay.prototype.createEl = function() {
        return vjs.Component.prototype.createEl.call(this, 'div', {
            className: 'vjs-text-track-display'
        })
    };
    vjs.TextTrackDisplay.prototype.clearDisplay = function() {
        if (typeof window.WebVTT === 'function') window.WebVTT['processCues'](window, [], this.el_)
    };
    var constructColor = function(color, opacity) {
            return 'rgba(' + parseInt(color[1] + color[1], 16) + ',' + parseInt(color[2] + color[2], 16) + ',' + parseInt(color[3] + color[3], 16) + ',' + opacity + ')'
        },
        darkGray = '#222',
        lightGray = '#ccc',
        fontMap = {
            monospace: 'monospace',
            sansSerif: 'sans-serif',
            serif: 'serif',
            monospaceSansSerif: '"Andale Mono", "Lucida Console", monospace',
            monospaceSerif: '"Courier New", monospace',
            proportionalSansSerif: 'sans-serif',
            proportionalSerif: 'serif',
            casual: '"Comic Sans MS", Impact, fantasy',
            script: '"Monotype Corsiva", cursive',
            smallcaps: '"Andale Mono", "Lucida Console", monospace, sans-serif'
        },
        tryUpdateStyle = function(el, style, rule) {
            try {
                el.style[style] = rule
            } catch (e) {}
        };
    vjs.TextTrackDisplay.prototype.updateDisplay = function() {
        var tracks = this.player_.textTracks(),
            i = 0,
            track;
        this.clearDisplay();
        if (!tracks) return;
        for (; i < tracks.length; i++) {
            track = tracks[i];
            if (track.mode === 'showing') this.updateForTrack(track)
        }
    };
    vjs.TextTrackDisplay.prototype.updateForTrack = function(track) {
        if (typeof window.WebVTT !== 'function' || !track.activeCues) return;
        var i = 0,
            property, cueDiv, overrides = this.player_['textTrackSettings'].getValues(),
            fontSize, cues = [];
        for (; i < track.activeCues.length; i++) cues.push(track.activeCues[i]);
        window.WebVTT['processCues'](window, track.activeCues, this.el_);
        i = cues.length;
        while (i--) {
            cueDiv = cues[i].displayState;
            if (overrides.color) cueDiv.firstChild.style.color = overrides.color;
            if (overrides.textOpacity) tryUpdateStyle(cueDiv.firstChild, 'color', constructColor(overrides.color || '#fff', overrides.textOpacity));
            if (overrides.backgroundColor) cueDiv.firstChild.style.backgroundColor = overrides.backgroundColor;
            if (overrides.backgroundOpacity) tryUpdateStyle(cueDiv.firstChild, 'backgroundColor', constructColor(overrides.backgroundColor || '#000', overrides.backgroundOpacity));
            if (overrides.windowColor)
                if (overrides.windowOpacity) {
                    tryUpdateStyle(cueDiv, 'backgroundColor', constructColor(overrides.windowColor, overrides.windowOpacity))
                } else cueDiv.style.backgroundColor = overrides.windowColor;
            if (overrides.edgeStyle)
                if (overrides.edgeStyle === 'dropshadow') {
                    cueDiv.firstChild.style.textShadow = '2px 2px 3px ' + darkGray + ', 2px 2px 4px ' + darkGray + ', 2px 2px 5px ' + darkGray
                } else if (overrides.edgeStyle === 'raised') {
                cueDiv.firstChild.style.textShadow = '1px 1px ' + darkGray + ', 2px 2px ' + darkGray + ', 3px 3px ' + darkGray
            } else if (overrides.edgeStyle === 'depressed') {
                cueDiv.firstChild.style.textShadow = '1px 1px ' + lightGray + ', 0 1px ' + lightGray + ', -1px -1px ' + darkGray + ', 0 -1px ' + darkGray
            } else if (overrides.edgeStyle === 'uniform') cueDiv.firstChild.style.textShadow = '0 0 4px ' + darkGray + ', 0 0 4px ' + darkGray + ', 0 0 4px ' + darkGray + ', 0 0 4px ' + darkGray;
            if (overrides.fontPercent && overrides.fontPercent !== 1) {
                fontSize = window.parseFloat(cueDiv.style.fontSize);
                cueDiv.style.fontSize = (fontSize * overrides.fontPercent) + 'px';
                cueDiv.style.height = 'auto';
                cueDiv.style.top = 'auto';
                cueDiv.style.bottom = '2px'
            };
            if (overrides.fontFamily && overrides.fontFamily !== 'default')
                if (overrides.fontFamily === 'small-caps') {
                    cueDiv.firstChild.style.fontVariant = 'small-caps'
                } else cueDiv.firstChild.style.fontFamily = fontMap[overrides.fontFamily]
        }
    };
    vjs.TextTrackMenuItem = vjs.MenuItem.extend({
        init: function(player, options) {
            var track = this.track = options.track,
                tracks = player.textTracks(),
                changeHandler, event;
            if (tracks) {
                changeHandler = vjs.bind(this, function() {
                    var selected = this.track['mode'] === 'showing',
                        track, i, l;
                    if (this instanceof vjs.OffTextTrackMenuItem) {
                        selected = true;
                        i = 0, l = tracks.length;
                        for (; i < l; i++) {
                            track = tracks[i];
                            if (track.kind === this.track['kind'] && track.mode === 'showing') {
                                selected = false;
                                break
                            }
                        }
                    };
                    this.selected(selected)
                });
                tracks.addEventListener('change', changeHandler);
                player.on('dispose', function() {
                    tracks.removeEventListener('change', changeHandler)
                })
            };
            options.label = track.label || track.language || 'Unknown';
            options.selected = track['default'] || track.mode === 'showing';
            vjs.MenuItem.call(this, player, options);
            if (tracks && tracks.onchange === undefined) this.on(['tap', 'click'], function() {
                if (typeof window.Event !== 'object') try {
                    event = new window.Event('change')
                } catch (err) {};
                if (!event) {
                    event = document.createEvent('Event');
                    event.initEvent('change', true, true)
                };
                tracks.dispatchEvent(event)
            })
        }
    });
    vjs.TextTrackMenuItem.prototype.onClick = function() {
        var kind = this.track['kind'],
            tracks = this.player_.textTracks(),
            mode, track, i = 0;
        vjs.MenuItem.prototype.onClick.call(this);
        if (!tracks) return;
        for (; i < tracks.length; i++) {
            track = tracks[i];
            if (track.kind !== kind) continue;
            if (track === this.track) {
                track.mode = 'showing'
            } else track.mode = 'disabled'
        }
    };
    vjs.OffTextTrackMenuItem = vjs.TextTrackMenuItem.extend({
        init: function(player, options) {
            options.track = {
                kind: options.kind,
                player: player,
                label: options.kind + ' off',
                'default': false,
                mode: 'disabled'
            };
            vjs.TextTrackMenuItem.call(this, player, options);
            this.selected(true)
        }
    });
    vjs.CaptionSettingsMenuItem = vjs.TextTrackMenuItem.extend({
        init: function(player, options) {
            options.track = {
                kind: options.kind,
                player: player,
                label: options.kind + ' settings',
                'default': false,
                mode: 'disabled'
            };
            vjs.TextTrackMenuItem.call(this, player, options);
            this.addClass('vjs-texttrack-settings')
        }
    });
    vjs.CaptionSettingsMenuItem.prototype.onClick = function() {
        this.player().getChild('textTrackSettings').show()
    };
    vjs.TextTrackButton = vjs.MenuButton.extend({
        init: function(player, options) {
            var tracks, updateHandler;
            vjs.MenuButton.call(this, player, options);
            tracks = this.player_.textTracks();
            if (this.items.length <= 1) this.hide();
            if (!tracks) return;
            updateHandler = vjs.bind(this, this.update);
            tracks.addEventListener('removetrack', updateHandler);
            tracks.addEventListener('addtrack', updateHandler);
            this.player_.on('dispose', function() {
                tracks.removeEventListener('removetrack', updateHandler);
                tracks.removeEventListener('addtrack', updateHandler)
            })
        }
    });
    vjs.TextTrackButton.prototype.createItems = function() {
        var items = [],
            track, tracks;
        if (this instanceof vjs.CaptionsButton && !(this.player().tech && this.player().tech['featuresNativeTextTracks'])) items.push(new vjs.CaptionSettingsMenuItem(this.player_, {
            kind: this.kind_
        }));
        items.push(new vjs.OffTextTrackMenuItem(this.player_, {
            kind: this.kind_
        }));
        tracks = this.player_.textTracks();
        if (!tracks) return items;
        for (var i = 0; i < tracks.length; i++) {
            track = tracks[i];
            if (track.kind === this.kind_) items.push(new vjs.TextTrackMenuItem(this.player_, {
                track: track
            }))
        };
        return items
    };
    vjs.CaptionsButton = vjs.TextTrackButton.extend({
        init: function(player, options, ready) {
            vjs.TextTrackButton.call(this, player, options, ready);
            this.el_.setAttribute('aria-label', 'Captions Menu')
        }
    });
    vjs.CaptionsButton.prototype.kind_ = 'captions';
    vjs.CaptionsButton.prototype.buttonText = 'Captions';
    vjs.CaptionsButton.prototype.className = 'vjs-captions-button';
    vjs.CaptionsButton.prototype.update = function() {
        var threshold = 2;
        vjs.TextTrackButton.prototype.update.call(this);
        if (this.player().tech && this.player().tech['featuresNativeTextTracks']) threshold = 1;
        if (this.items && this.items.length > threshold) {
            this.show()
        } else this.hide()
    };
    vjs.SubtitlesButton = vjs.TextTrackButton.extend({
        init: function(player, options, ready) {
            vjs.TextTrackButton.call(this, player, options, ready);
            this.el_.setAttribute('aria-label', 'Subtitles Menu')
        }
    });
    vjs.SubtitlesButton.prototype.kind_ = 'subtitles';
    vjs.SubtitlesButton.prototype.buttonText = 'Subtitles';
    vjs.SubtitlesButton.prototype.className = 'vjs-subtitles-button';
    vjs.ChaptersButton = vjs.TextTrackButton.extend({
        init: function(player, options, ready) {
            vjs.TextTrackButton.call(this, player, options, ready);
            this.el_.setAttribute('aria-label', 'Chapters Menu')
        }
    });
    vjs.ChaptersButton.prototype.kind_ = 'chapters';
    vjs.ChaptersButton.prototype.buttonText = 'Chapters';
    vjs.ChaptersButton.prototype.className = 'vjs-chapters-button';
    vjs.ChaptersButton.prototype.createItems = function() {
        var items = [],
            track, tracks;
        tracks = this.player_.textTracks();
        if (!tracks) return items;
        for (var i = 0; i < tracks.length; i++) {
            track = tracks[i];
            if (track.kind === this.kind_) items.push(new vjs.TextTrackMenuItem(this.player_, {
                track: track
            }))
        };
        return items
    };
    vjs.ChaptersButton.prototype.createMenu = function() {
        var tracks = this.player_.textTracks() || [],
            i = 0,
            l = tracks.length,
            track, chaptersTrack, items = this.items = [];
        for (; i < l; i++) {
            track = tracks[i];
            if (track.kind == this.kind_)
                if (!track.cues) {
                    track.mode = 'hidden';
                    window.setTimeout(vjs.bind(this, function() {
                        this.createMenu()
                    }), 100)
                } else {
                    chaptersTrack = track;
                    break
                }
        };
        var menu = this.menu;
        if (menu === undefined) {
            menu = new vjs.Menu(this.player_);
            menu.contentEl().appendChild(vjs.createEl('li', {
                className: 'vjs-menu-title',
                innerHTML: vjs.capitalize(this.kind_),
                tabindex: -1
            }))
        };
        if (chaptersTrack) {
            var cues = chaptersTrack.cues,
                cue, mi;
            i = 0;
            l = cues.length;
            for (; i < l; i++) {
                cue = cues[i];
                mi = new vjs.ChaptersTrackMenuItem(this.player_, {
                    track: chaptersTrack,
                    cue: cue
                });
                items.push(mi);
                menu.addChild(mi)
            };
            this.addChild(menu)
        };
        if (this.items.length > 0) this.show();
        return menu
    };
    vjs.ChaptersTrackMenuItem = vjs.MenuItem.extend({
        init: function(player, options) {
            var track = this.track = options.track,
                cue = this.cue = options.cue,
                currentTime = player.currentTime();
            options.label = cue.text;
            options.selected = (cue.startTime <= currentTime && currentTime < cue.endTime);
            vjs.MenuItem.call(this, player, options);
            track.addEventListener('cuechange', vjs.bind(this, this.update))
        }
    });
    vjs.ChaptersTrackMenuItem.prototype.onClick = function() {
        vjs.MenuItem.prototype.onClick.call(this);
        this.player_.currentTime(this.cue.startTime);
        this.update(this.cue.startTime)
    };
    vjs.ChaptersTrackMenuItem.prototype.update = function() {
        var cue = this.cue,
            currentTime = this.player_.currentTime();
        this.selected(cue.startTime <= currentTime && currentTime < cue.endTime)
    }
})();
(function() {
    'use strict';
    vjs.TextTrackSettings = vjs.Component.extend({
        init: function(player, options) {
            vjs.Component.call(this, player, options);
            this.hide();
            vjs.on(this.el().querySelector('.vjs-done-button'), 'click', vjs.bind(this, function() {
                this.saveSettings();
                this.hide()
            }));
            vjs.on(this.el().querySelector('.vjs-default-button'), 'click', vjs.bind(this, function() {
                this.el().querySelector('.vjs-fg-color > select').selectedIndex = 0;
                this.el().querySelector('.vjs-bg-color > select').selectedIndex = 0;
                this.el().querySelector('.window-color > select').selectedIndex = 0;
                this.el().querySelector('.vjs-text-opacity > select').selectedIndex = 0;
                this.el().querySelector('.vjs-bg-opacity > select').selectedIndex = 0;
                this.el().querySelector('.vjs-window-opacity > select').selectedIndex = 0;
                this.el().querySelector('.vjs-edge-style select').selectedIndex = 0;
                this.el().querySelector('.vjs-font-family select').selectedIndex = 0;
                this.el().querySelector('.vjs-font-percent select').selectedIndex = 2;
                this.updateDisplay()
            }));
            vjs.on(this.el().querySelector('.vjs-fg-color > select'), 'change', vjs.bind(this, this.updateDisplay));
            vjs.on(this.el().querySelector('.vjs-bg-color > select'), 'change', vjs.bind(this, this.updateDisplay));
            vjs.on(this.el().querySelector('.window-color > select'), 'change', vjs.bind(this, this.updateDisplay));
            vjs.on(this.el().querySelector('.vjs-text-opacity > select'), 'change', vjs.bind(this, this.updateDisplay));
            vjs.on(this.el().querySelector('.vjs-bg-opacity > select'), 'change', vjs.bind(this, this.updateDisplay));
            vjs.on(this.el().querySelector('.vjs-window-opacity > select'), 'change', vjs.bind(this, this.updateDisplay));
            vjs.on(this.el().querySelector('.vjs-font-percent select'), 'change', vjs.bind(this, this.updateDisplay));
            vjs.on(this.el().querySelector('.vjs-edge-style select'), 'change', vjs.bind(this, this.updateDisplay));
            vjs.on(this.el().querySelector('.vjs-font-family select'), 'change', vjs.bind(this, this.updateDisplay));
            if (player.options()['persistTextTrackSettings']) this.restoreSettings()
        }
    });
    vjs.TextTrackSettings.prototype.createEl = function() {
        return vjs.Component.prototype.createEl.call(this, 'div', {
            className: 'vjs-caption-settings vjs-modal-overlay',
            innerHTML: captionOptionsMenuTemplate()
        })
    };
    vjs.TextTrackSettings.prototype.getValues = function() {
        var el, bgOpacity, textOpacity, windowOpacity, textEdge, fontFamily, fgColor, bgColor, windowColor, result, name, fontPercent;
        el = this.el();
        textEdge = getSelectedOptionValue(el.querySelector('.vjs-edge-style select'));
        fontFamily = getSelectedOptionValue(el.querySelector('.vjs-font-family select'));
        fgColor = getSelectedOptionValue(el.querySelector('.vjs-fg-color > select'));
        textOpacity = getSelectedOptionValue(el.querySelector('.vjs-text-opacity > select'));
        bgColor = getSelectedOptionValue(el.querySelector('.vjs-bg-color > select'));
        bgOpacity = getSelectedOptionValue(el.querySelector('.vjs-bg-opacity > select'));
        windowColor = getSelectedOptionValue(el.querySelector('.window-color > select'));
        windowOpacity = getSelectedOptionValue(el.querySelector('.vjs-window-opacity > select'));
        fontPercent = window.parseFloat(getSelectedOptionValue(el.querySelector('.vjs-font-percent > select')));
        result = {
            backgroundOpacity: bgOpacity,
            textOpacity: textOpacity,
            windowOpacity: windowOpacity,
            edgeStyle: textEdge,
            fontFamily: fontFamily,
            color: fgColor,
            backgroundColor: bgColor,
            windowColor: windowColor,
            fontPercent: fontPercent
        };
        for (name in result)
            if (result[name] === '' || result[name] === 'none' || (name === 'fontPercent' && result[name] === 1.00)) delete result[name];
        return result
    };
    vjs.TextTrackSettings.prototype.setValues = function(values) {
        var el = this.el(),
            fontPercent;
        setSelectedOption(el.querySelector('.vjs-edge-style select'), values.edgeStyle);
        setSelectedOption(el.querySelector('.vjs-font-family select'), values.fontFamily);
        setSelectedOption(el.querySelector('.vjs-fg-color > select'), values.color);
        setSelectedOption(el.querySelector('.vjs-text-opacity > select'), values.textOpacity);
        setSelectedOption(el.querySelector('.vjs-bg-color > select'), values.backgroundColor);
        setSelectedOption(el.querySelector('.vjs-bg-opacity > select'), values.backgroundOpacity);
        setSelectedOption(el.querySelector('.window-color > select'), values.windowColor);
        setSelectedOption(el.querySelector('.vjs-window-opacity > select'), values.windowOpacity);
        fontPercent = values.fontPercent;
        if (fontPercent) fontPercent = fontPercent.toFixed(2);
        setSelectedOption(el.querySelector('.vjs-font-percent > select'), fontPercent)
    };
    vjs.TextTrackSettings.prototype.restoreSettings = function() {
        var values;
        try {
            values = JSON.parse(window.localStorage.getItem('vjs-text-track-settings'))
        } catch (e) {};
        if (values) this.setValues(values)
    };
    vjs.TextTrackSettings.prototype.saveSettings = function() {
        var values;
        if (!this.player_.options()['persistTextTrackSettings']) return;
        values = this.getValues();
        try {
            if (!vjs.isEmpty(values)) {
                window.localStorage.setItem('vjs-text-track-settings', JSON.stringify(values))
            } else window.localStorage.removeItem('vjs-text-track-settings')
        } catch (e) {}
    };
    vjs.TextTrackSettings.prototype.updateDisplay = function() {
        var ttDisplay = this.player_.getChild('textTrackDisplay');
        if (ttDisplay) ttDisplay.updateDisplay()
    }

    function getSelectedOptionValue(target) {
        var selectedOption;
        if (target.selectedOptions) {
            selectedOption = target.selectedOptions[0]
        } else if (target.options) selectedOption = target.options[target.options.selectedIndex];
        return selectedOption.value
    }

    function setSelectedOption(target, value) {
        var i, option;
        if (!value) return;
        for (i = 0; i < target.options.length; i++) {
            option = target.options[i];
            if (option.value === value) break
        };
        target.selectedIndex = i
    }

    function captionOptionsMenuTemplate() {
        return '<div class="vjs-tracksettings"><div class="vjs-tracksettings-colors"><div class="vjs-fg-color vjs-tracksetting"><label class="vjs-label">Foreground</label><select><option value="">---</option><option value="#FFF">White</option><option value="#000">Black</option><option value="#F00">Red</option><option value="#0F0">Green</option><option value="#00F">Blue</option><option value="#FF0">Yellow</option><option value="#F0F">Magenta</option><option value="#0FF">Cyan</option></select><span class="vjs-text-opacity vjs-opacity"><select><option value="">---</option><option value="1">Opaque</option><option value="0.5">Semi-Opaque</option></select></span></div><div class="vjs-bg-color vjs-tracksetting"><label class="vjs-label">Background</label><select><option value="">---</option><option value="#FFF">White</option><option value="#000">Black</option><option value="#F00">Red</option><option value="#0F0">Green</option><option value="#00F">Blue</option><option value="#FF0">Yellow</option><option value="#F0F">Magenta</option><option value="#0FF">Cyan</option></select><span class="vjs-bg-opacity vjs-opacity"><select><option value="">---</option><option value="1">Opaque</option><option value="0.5">Semi-Transparent</option><option value="0">Transparent</option></select></span></div><div class="window-color vjs-tracksetting"><label class="vjs-label">Window</label><select><option value="">---</option><option value="#FFF">White</option><option value="#000">Black</option><option value="#F00">Red</option><option value="#0F0">Green</option><option value="#00F">Blue</option><option value="#FF0">Yellow</option><option value="#F0F">Magenta</option><option value="#0FF">Cyan</option></select><span class="vjs-window-opacity vjs-opacity"><select><option value="">---</option><option value="1">Opaque</option><option value="0.5">Semi-Transparent</option><option value="0">Transparent</option></select></span></div></div><div class="vjs-tracksettings-font"><div class="vjs-font-percent vjs-tracksetting"><label class="vjs-label">Font Size</label><select><option value="0.50">50%</option><option value="0.75">75%</option><option value="1.00" selected>100%</option><option value="1.25">125%</option><option value="1.50">150%</option><option value="1.75">175%</option><option value="2.00">200%</option><option value="3.00">300%</option><option value="4.00">400%</option></select></div><div class="vjs-edge-style vjs-tracksetting"><label class="vjs-label">Text Edge Style</label><select><option value="none">None</option><option value="raised">Raised</option><option value="depressed">Depressed</option><option value="uniform">Uniform</option><option value="dropshadow">Dropshadow</option></select></div><div class="vjs-font-family vjs-tracksetting"><label class="vjs-label">Font Family</label><select><option value="">Default</option><option value="monospaceSerif">Monospace Serif</option><option value="proportionalSerif">Proportional Serif</option><option value="monospaceSansSerif">Monospace Sans-Serif</option><option value="proportionalSansSerif">Proportional Sans-Serif</option><option value="casual">Casual</option><option value="script">Script</option><option value="small-caps">Small Caps</option></select></div></div></div><div class="vjs-tracksettings-controls"><button class="vjs-default-button">Defaults</button><button class="vjs-done-button">Done</button></div>'
    }
})();
vjs.JSON;
if (typeof window.JSON !== 'undefined' && typeof window.JSON.parse === 'function') {
    vjs.JSON = window.JSON
} else {
    vjs.JSON = {};
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    vjs.JSON.parse = function(text, reviver) {
        var j

        function walk(holder, key) {
            var k, v, value = holder[key];
            if (value && typeof value === 'object')
                for (k in value)
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = walk(value, k);
                        if (v !== undefined) {
                            value[k] = v
                        } else delete value[k]
                    };
            return reviver.call(holder, key, value)
        };
        text = String(text);
        cx.lastIndex = 0;
        if (cx.test(text)) text = text.replace(cx, function(a) {
            return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4)
        });
        if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
            j = eval('(' + text + ')');
            return typeof reviver === 'function' ? walk({
                '': j
            }, '') : j
        };
        throw new SyntaxError('JSON.parse(): invalid or malformed JSON data')
    }
};
vjs.autoSetup = function() {
    var options, mediaEl, player, i, e, vids = document.getElementsByTagName('video'),
        audios = document.getElementsByTagName('audio'),
        mediaEls = [];
    if (vids && vids.length > 0)
        for (i = 0, e = vids.length; i < e; i++) mediaEls.push(vids[i]);
    if (audios && audios.length > 0)
        for (i = 0, e = audios.length; i < e; i++) mediaEls.push(audios[i]);
    if (mediaEls && mediaEls.length > 0) {
        for (i = 0, e = mediaEls.length; i < e; i++) {
            mediaEl = mediaEls[i];
            if (mediaEl && mediaEl.getAttribute) {
                if (mediaEl.player === undefined) {
                    options = mediaEl.getAttribute('data-setup');
                    if (options !== null) player = videojs(mediaEl)
                }
            } else {
                vjs.autoSetupTimeout(1);
                break
            }
        }
    } else if (!vjs.windowLoaded) vjs.autoSetupTimeout(1)
};
vjs.autoSetupTimeout = function(wait) {
    setTimeout(vjs.autoSetup, wait)
};
if (document.readyState === 'complete') {
    vjs.windowLoaded = true
} else vjs.one(window, 'load', function() {
    vjs.windowLoaded = true
});
vjs.autoSetupTimeout(1);
vjs.plugin = function(name, init) {
    vjs.Player.prototype[name] = init
};
(function(root) {
    var vttjs = root.vttjs = {},
        cueShim = vttjs.VTTCue,
        regionShim = vttjs.VTTRegion,
        oldVTTCue = root.VTTCue,
        oldVTTRegion = root.VTTRegion;
    vttjs.shim = function() {
        vttjs.VTTCue = cueShim;
        vttjs.VTTRegion = regionShim
    };
    vttjs.restore = function() {
        vttjs.VTTCue = oldVTTCue;
        vttjs.VTTRegion = oldVTTRegion
    }
}(this));
(function(root, vttjs) {
    var autoKeyword = "auto",
        directionSetting = {
            "": true,
            lr: true,
            rl: true
        },
        alignSetting = {
            start: true,
            middle: true,
            end: true,
            left: true,
            right: true
        }

    function findDirectionSetting(value) {
        if (typeof value !== "string") return false;
        var dir = directionSetting[value.toLowerCase()];
        return dir ? value.toLowerCase() : false
    }

    function findAlignSetting(value) {
        if (typeof value !== "string") return false;
        var align = alignSetting[value.toLowerCase()];
        return align ? value.toLowerCase() : false
    }

    function extend(obj) {
        var i = 1;
        for (; i < arguments.length; i++) {
            var cobj = arguments[i];
            for (var p in cobj) obj[p] = cobj[p]
        };
        return obj
    }

    function VTTCue(startTime, endTime, text) {
        var cue = this,
            isIE8 = /MSIE\s8\.0/.test(navigator.userAgent),
            baseObj = {};
        if (isIE8) {
            cue = document.createElement('custom')
        } else baseObj.enumerable = true;
        cue.hasBeenReset = false;
        var _id = "",
            _pauseOnExit = false,
            _startTime = startTime,
            _endTime = endTime,
            _text = text,
            _region = null,
            _vertical = "",
            _snapToLines = true,
            _line = "auto",
            _lineAlign = "start",
            _position = 50,
            _positionAlign = "middle",
            _size = 50,
            _align = "middle";
        Object.defineProperty(cue, "id", extend({}, baseObj, {
            get: function() {
                return _id
            },
            set: function(value) {
                _id = "" + value
            }
        }));
        Object.defineProperty(cue, "pauseOnExit", extend({}, baseObj, {
            get: function() {
                return _pauseOnExit
            },
            set: function(value) {
                _pauseOnExit = !!value
            }
        }));
        Object.defineProperty(cue, "startTime", extend({}, baseObj, {
            get: function() {
                return _startTime
            },
            set: function(value) {
                if (typeof value !== "number") throw new TypeError("Start time must be set to a number.");
                _startTime = value;
                this.hasBeenReset = true
            }
        }));
        Object.defineProperty(cue, "endTime", extend({}, baseObj, {
            get: function() {
                return _endTime
            },
            set: function(value) {
                if (typeof value !== "number") throw new TypeError("End time must be set to a number.");
                _endTime = value;
                this.hasBeenReset = true
            }
        }));
        Object.defineProperty(cue, "text", extend({}, baseObj, {
            get: function() {
                return _text
            },
            set: function(value) {
                _text = "" + value;
                this.hasBeenReset = true
            }
        }));
        Object.defineProperty(cue, "region", extend({}, baseObj, {
            get: function() {
                return _region
            },
            set: function(value) {
                _region = value;
                this.hasBeenReset = true
            }
        }));
        Object.defineProperty(cue, "vertical", extend({}, baseObj, {
            get: function() {
                return _vertical
            },
            set: function(value) {
                var setting = findDirectionSetting(value);
                if (setting === false) throw new SyntaxError("An invalid or illegal string was specified.");
                _vertical = setting;
                this.hasBeenReset = true
            }
        }));
        Object.defineProperty(cue, "snapToLines", extend({}, baseObj, {
            get: function() {
                return _snapToLines
            },
            set: function(value) {
                _snapToLines = !!value;
                this.hasBeenReset = true
            }
        }));
        Object.defineProperty(cue, "line", extend({}, baseObj, {
            get: function() {
                return _line
            },
            set: function(value) {
                if (typeof value !== "number" && value !== autoKeyword) throw new SyntaxError("An invalid number or illegal string was specified.");
                _line = value;
                this.hasBeenReset = true
            }
        }));
        Object.defineProperty(cue, "lineAlign", extend({}, baseObj, {
            get: function() {
                return _lineAlign
            },
            set: function(value) {
                var setting = findAlignSetting(value);
                if (!setting) throw new SyntaxError("An invalid or illegal string was specified.");
                _lineAlign = setting;
                this.hasBeenReset = true
            }
        }));
        Object.defineProperty(cue, "position", extend({}, baseObj, {
            get: function() {
                return _position
            },
            set: function(value) {
                if (value < 0 || value > 100) throw new Error("Position must be between 0 and 100.");
                _position = value;
                this.hasBeenReset = true
            }
        }));
        Object.defineProperty(cue, "positionAlign", extend({}, baseObj, {
            get: function() {
                return _positionAlign
            },
            set: function(value) {
                var setting = findAlignSetting(value);
                if (!setting) throw new SyntaxError("An invalid or illegal string was specified.");
                _positionAlign = setting;
                this.hasBeenReset = true
            }
        }));
        Object.defineProperty(cue, "size", extend({}, baseObj, {
            get: function() {
                return _size
            },
            set: function(value) {
                if (value < 0 || value > 100) throw new Error("Size must be between 0 and 100.");
                _size = value;
                this.hasBeenReset = true
            }
        }));
        Object.defineProperty(cue, "align", extend({}, baseObj, {
            get: function() {
                return _align
            },
            set: function(value) {
                var setting = findAlignSetting(value);
                if (!setting) throw new SyntaxError("An invalid or illegal string was specified.");
                _align = setting;
                this.hasBeenReset = true
            }
        }));
        cue.displayState = undefined;
        if (isIE8) return cue
    };
    VTTCue.prototype.getCueAsHTML = function() {
        return WebVTT.convertCueToDOMTree(window, this.text)
    };
    root.VTTCue = root.VTTCue || VTTCue;
    vttjs.VTTCue = VTTCue
}(this, (this.vttjs || {})));
(function(root, vttjs) {
    var scrollSetting = {
        "": true,
        up: true
    }

    function findScrollSetting(value) {
        if (typeof value !== "string") return false;
        var scroll = scrollSetting[value.toLowerCase()];
        return scroll ? value.toLowerCase() : false
    }

    function isValidPercentValue(value) {
        return typeof value === "number" && (value >= 0 && value <= 100)
    }

    function VTTRegion() {
        var _width = 100,
            _lines = 3,
            _regionAnchorX = 0,
            _regionAnchorY = 100,
            _viewportAnchorX = 0,
            _viewportAnchorY = 100,
            _scroll = "";
        Object.defineProperties(this, {
            width: {
                enumerable: true,
                get: function() {
                    return _width
                },
                set: function(value) {
                    if (!isValidPercentValue(value)) throw new Error("Width must be between 0 and 100.");
                    _width = value
                }
            },
            lines: {
                enumerable: true,
                get: function() {
                    return _lines
                },
                set: function(value) {
                    if (typeof value !== "number") throw new TypeError("Lines must be set to a number.");
                    _lines = value
                }
            },
            regionAnchorY: {
                enumerable: true,
                get: function() {
                    return _regionAnchorY
                },
                set: function(value) {
                    if (!isValidPercentValue(value)) throw new Error("RegionAnchorX must be between 0 and 100.");
                    _regionAnchorY = value
                }
            },
            regionAnchorX: {
                enumerable: true,
                get: function() {
                    return _regionAnchorX
                },
                set: function(value) {
                    if (!isValidPercentValue(value)) throw new Error("RegionAnchorY must be between 0 and 100.");
                    _regionAnchorX = value
                }
            },
            viewportAnchorY: {
                enumerable: true,
                get: function() {
                    return _viewportAnchorY
                },
                set: function(value) {
                    if (!isValidPercentValue(value)) throw new Error("ViewportAnchorY must be between 0 and 100.");
                    _viewportAnchorY = value
                }
            },
            viewportAnchorX: {
                enumerable: true,
                get: function() {
                    return _viewportAnchorX
                },
                set: function(value) {
                    if (!isValidPercentValue(value)) throw new Error("ViewportAnchorX must be between 0 and 100.");
                    _viewportAnchorX = value
                }
            },
            scroll: {
                enumerable: true,
                get: function() {
                    return _scroll
                },
                set: function(value) {
                    var setting = findScrollSetting(value);
                    if (setting === false) throw new SyntaxError("An invalid or illegal string was specified.");
                    _scroll = setting
                }
            }
        })
    };
    root.VTTRegion = root.VTTRegion || VTTRegion;
    vttjs.VTTRegion = VTTRegion
}(this, (this.vttjs || {})));
(function(global) {
    var _objCreate = Object.create || (function() {
        function F() {};
        return function(o) {
            if (arguments.length !== 1) throw new Error('Object.create shim only accepts one parameter.');
            F.prototype = o;
            return new F()
        }
    })()

    function ParsingError(errorData, message) {
        this.name = "ParsingError";
        this.code = errorData.code;
        this.message = message || errorData.message
    };
    ParsingError.prototype = _objCreate(Error.prototype);
    ParsingError.prototype.constructor = ParsingError;
    ParsingError.Errors = {
        BadSignature: {
            code: 0,
            message: "Malformed WebVTT signature."
        },
        BadTimeStamp: {
            code: 1,
            message: "Malformed time stamp."
        }
    }

    function parseTimeStamp(input) {
        function computeSeconds(h, m, s, f) {
            return (h | 0) * 3600 + (m | 0) * 60 + (s | 0) + (f | 0) / 1e3
        };
        var m = input.match(/^(\d+):(\d{2})(:\d{2})?\.(\d{3})/);
        if (!m) return null;
        if (m[3]) {
            return computeSeconds(m[1], m[2], m[3].replace(":", ""), m[4])
        } else if (m[1] > 59) {
            return computeSeconds(m[1], m[2], 0, m[4])
        } else return computeSeconds(0, m[1], m[2], m[4])
    }

    function Settings() {
        this.values = _objCreate(null)
    };
    Settings.prototype = {
        set: function(k, v) {
            if (!this.get(k) && v !== "") this.values[k] = v
        },
        get: function(k, dflt, defaultKey) {
            if (defaultKey) return this.has(k) ? this.values[k] : dflt[defaultKey];
            return this.has(k) ? this.values[k] : dflt
        },
        has: function(k) {
            return k in this.values
        },
        alt: function(k, v, a) {
            for (var n = 0; n < a.length; ++n)
                if (v === a[n]) {
                    this.set(k, v);
                    break
                }
        },
        integer: function(k, v) {
            if (/^-?\d+$/.test(v)) this.set(k, parseInt(v, 10))
        },
        percent: function(k, v) {
            var m;
            if ((m = v.match(/^([\d]{1,3})(\.[\d]*)?%$/))) {
                v = parseFloat(v);
                if (v >= 0 && v <= 100) {
                    this.set(k, v);
                    return true
                }
            };
            return false
        }
    }

    function parseOptions(input, callback, keyValueDelim, groupDelim) {
        var groups = groupDelim ? input.split(groupDelim) : [input];
        for (var i in groups) {
            if (typeof groups[i] !== "string") continue;
            var kv = groups[i].split(keyValueDelim);
            if (kv.length !== 2) continue;
            var k = kv[0],
                v = kv[1];
            callback(k, v)
        }
    }

    function parseCue(input, cue, regionList) {
        var oInput = input

        function consumeTimeStamp() {
            var ts = parseTimeStamp(input);
            if (ts === null) throw new ParsingError(ParsingError.Errors.BadTimeStamp, "Malformed timestamp: " + oInput);
            input = input.replace(/^[^\sa-zA-Z-]+/, "");
            return ts
        }

        function consumeCueSettings(input, cue) {
            var settings = new Settings();
            parseOptions(input, function(k, v) {
                switch (k) {
                    case "region":
                        for (var i = regionList.length - 1; i >= 0; i--)
                            if (regionList[i].id === v) {
                                settings.set(k, regionList[i].region);
                                break
                            };
                        break;
                    case "vertical":
                        settings.alt(k, v, ["rl", "lr"]);
                        break;
                    case "line":
                        var vals = v.split(","),
                            vals0 = vals[0];
                        settings.integer(k, vals0);
                        settings.percent(k, vals0) ? settings.set("snapToLines", false) : null;
                        settings.alt(k, vals0, ["auto"]);
                        if (vals.length === 2) settings.alt("lineAlign", vals[1], ["start", "middle", "end"]);
                        break;
                    case "position":
                        vals = v.split(",");
                        settings.percent(k, vals[0]);
                        if (vals.length === 2) settings.alt("positionAlign", vals[1], ["start", "middle", "end"]);
                        break;
                    case "size":
                        settings.percent(k, v);
                        break;
                    case "align":
                        settings.alt(k, v, ["start", "middle", "end", "left", "right"]);
                        break
                }
            }, /:/, /\s/);
            cue.region = settings.get("region", null);
            cue.vertical = settings.get("vertical", "");
            cue.line = settings.get("line", "auto");
            cue.lineAlign = settings.get("lineAlign", "start");
            cue.snapToLines = settings.get("snapToLines", true);
            cue.size = settings.get("size", 100);
            cue.align = settings.get("align", "middle");
            cue.position = settings.get("position", {
                start: 0,
                left: 0,
                middle: 50,
                end: 100,
                right: 100
            }, cue.align);
            cue.positionAlign = settings.get("positionAlign", {
                start: "start",
                left: "start",
                middle: "middle",
                end: "end",
                right: "end"
            }, cue.align)
        }

        function skipWhitespace() {
            input = input.replace(/^\s+/, "")
        };
        skipWhitespace();
        cue.startTime = consumeTimeStamp();
        skipWhitespace();
        if (input.substr(0, 3) !== "-->") throw new ParsingError(ParsingError.Errors.BadTimeStamp, "Malformed time stamp (time stamps must be separated by '-->'): " + oInput);
        input = input.substr(3);
        skipWhitespace();
        cue.endTime = consumeTimeStamp();
        skipWhitespace();
        consumeCueSettings(input, cue)
    };
    var ESCAPE = {
            "&amp;": "&",
            "&lt;": "<",
            "&gt;": ">",
            "&lrm;": "\u200e",
            "&rlm;": "\u200f",
            "&nbsp;": "\u00a0"
        },
        TAG_NAME = {
            c: "span",
            i: "i",
            b: "b",
            u: "u",
            ruby: "ruby",
            rt: "rt",
            v: "span",
            lang: "span"
        },
        TAG_ANNOTATION = {
            v: "title",
            lang: "lang"
        },
        NEEDS_PARENT = {
            rt: "ruby"
        }

    function parseContent(window, input) {
        function nextToken() {
            if (!input) return null

            function consume(result) {
                input = input.substr(result.length);
                return result
            };
            var m = input.match(/^([^<]*)(<[^>]+>?)?/);
            return consume(m[1] ? m[1] : m[2])
        }

        function unescape1(e) {
            return ESCAPE[e]
        }

        function unescape(s) {
            while ((m = s.match(/&(amp|lt|gt|lrm|rlm|nbsp);/))) s = s.replace(m[0], unescape1);
            return s
        }

        function shouldAdd(current, element) {
            return !NEEDS_PARENT[element.localName] || NEEDS_PARENT[element.localName] === current.localName
        }

        function createElement(type, annotation) {
            var tagName = TAG_NAME[type];
            if (!tagName) return null;
            var element = window.document.createElement(tagName);
            element.localName = tagName;
            var name = TAG_ANNOTATION[type];
            if (name && annotation) element[name] = annotation.trim();
            return element
        };
        var rootDiv = window.document.createElement("div"),
            current = rootDiv,
            t, tagStack = [];
        while ((t = nextToken()) !== null) {
            if (t[0] === '<') {
                if (t[1] === "/") {
                    if (tagStack.length && tagStack[tagStack.length - 1] === t.substr(2).replace(">", "")) {
                        tagStack.pop();
                        current = current.parentNode
                    };
                    continue
                };
                var ts = parseTimeStamp(t.substr(1, t.length - 2)),
                    node;
                if (ts) {
                    node = window.document.createProcessingInstruction("timestamp", ts);
                    current.appendChild(node);
                    continue
                };
                var m = t.match(/^<([^.\s/0-9>]+)(\.[^\s\\>]+)?([^>\\]+)?(\\?)>?$/);
                if (!m) continue;
                node = createElement(m[1], m[3]);
                if (!node) continue;
                if (!shouldAdd(current, node)) continue;
                if (m[2]) node.className = m[2].substr(1).replace('.', ' ');
                tagStack.push(m[1]);
                current.appendChild(node);
                current = node;
                continue
            };
            current.appendChild(window.document.createTextNode(unescape(t)))
        };
        return rootDiv
    };
    var strongRTLChars = [0x05BE, 0x05C0, 0x05C3, 0x05C6, 0x05D0, 0x05D1, 0x05D2, 0x05D3, 0x05D4, 0x05D5, 0x05D6, 0x05D7, 0x05D8, 0x05D9, 0x05DA, 0x05DB, 0x05DC, 0x05DD, 0x05DE, 0x05DF, 0x05E0, 0x05E1, 0x05E2, 0x05E3, 0x05E4, 0x05E5, 0x05E6, 0x05E7, 0x05E8, 0x05E9, 0x05EA, 0x05F0, 0x05F1, 0x05F2, 0x05F3, 0x05F4, 0x0608, 0x060B, 0x060D, 0x061B, 0x061E, 0x061F, 0x0620, 0x0621, 0x0622, 0x0623, 0x0624, 0x0625, 0x0626, 0x0627, 0x0628, 0x0629, 0x062A, 0x062B, 0x062C, 0x062D, 0x062E, 0x062F, 0x0630, 0x0631, 0x0632, 0x0633, 0x0634, 0x0635, 0x0636, 0x0637, 0x0638, 0x0639, 0x063A, 0x063B, 0x063C, 0x063D, 0x063E, 0x063F, 0x0640, 0x0641, 0x0642, 0x0643, 0x0644, 0x0645, 0x0646, 0x0647, 0x0648, 0x0649, 0x064A, 0x066D, 0x066E, 0x066F, 0x0671, 0x0672, 0x0673, 0x0674, 0x0675, 0x0676, 0x0677, 0x0678, 0x0679, 0x067A, 0x067B, 0x067C, 0x067D, 0x067E, 0x067F, 0x0680, 0x0681, 0x0682, 0x0683, 0x0684, 0x0685, 0x0686, 0x0687, 0x0688, 0x0689, 0x068A, 0x068B, 0x068C, 0x068D, 0x068E, 0x068F, 0x0690, 0x0691, 0x0692, 0x0693, 0x0694, 0x0695, 0x0696, 0x0697, 0x0698, 0x0699, 0x069A, 0x069B, 0x069C, 0x069D, 0x069E, 0x069F, 0x06A0, 0x06A1, 0x06A2, 0x06A3, 0x06A4, 0x06A5, 0x06A6, 0x06A7, 0x06A8, 0x06A9, 0x06AA, 0x06AB, 0x06AC, 0x06AD, 0x06AE, 0x06AF, 0x06B0, 0x06B1, 0x06B2, 0x06B3, 0x06B4, 0x06B5, 0x06B6, 0x06B7, 0x06B8, 0x06B9, 0x06BA, 0x06BB, 0x06BC, 0x06BD, 0x06BE, 0x06BF, 0x06C0, 0x06C1, 0x06C2, 0x06C3, 0x06C4, 0x06C5, 0x06C6, 0x06C7, 0x06C8, 0x06C9, 0x06CA, 0x06CB, 0x06CC, 0x06CD, 0x06CE, 0x06CF, 0x06D0, 0x06D1, 0x06D2, 0x06D3, 0x06D4, 0x06D5, 0x06E5, 0x06E6, 0x06EE, 0x06EF, 0x06FA, 0x06FB, 0x06FC, 0x06FD, 0x06FE, 0x06FF, 0x0700, 0x0701, 0x0702, 0x0703, 0x0704, 0x0705, 0x0706, 0x0707, 0x0708, 0x0709, 0x070A, 0x070B, 0x070C, 0x070D, 0x070F, 0x0710, 0x0712, 0x0713, 0x0714, 0x0715, 0x0716, 0x0717, 0x0718, 0x0719, 0x071A, 0x071B, 0x071C, 0x071D, 0x071E, 0x071F, 0x0720, 0x0721, 0x0722, 0x0723, 0x0724, 0x0725, 0x0726, 0x0727, 0x0728, 0x0729, 0x072A, 0x072B, 0x072C, 0x072D, 0x072E, 0x072F, 0x074D, 0x074E, 0x074F, 0x0750, 0x0751, 0x0752, 0x0753, 0x0754, 0x0755, 0x0756, 0x0757, 0x0758, 0x0759, 0x075A, 0x075B, 0x075C, 0x075D, 0x075E, 0x075F, 0x0760, 0x0761, 0x0762, 0x0763, 0x0764, 0x0765, 0x0766, 0x0767, 0x0768, 0x0769, 0x076A, 0x076B, 0x076C, 0x076D, 0x076E, 0x076F, 0x0770, 0x0771, 0x0772, 0x0773, 0x0774, 0x0775, 0x0776, 0x0777, 0x0778, 0x0779, 0x077A, 0x077B, 0x077C, 0x077D, 0x077E, 0x077F, 0x0780, 0x0781, 0x0782, 0x0783, 0x0784, 0x0785, 0x0786, 0x0787, 0x0788, 0x0789, 0x078A, 0x078B, 0x078C, 0x078D, 0x078E, 0x078F, 0x0790, 0x0791, 0x0792, 0x0793, 0x0794, 0x0795, 0x0796, 0x0797, 0x0798, 0x0799, 0x079A, 0x079B, 0x079C, 0x079D, 0x079E, 0x079F, 0x07A0, 0x07A1, 0x07A2, 0x07A3, 0x07A4, 0x07A5, 0x07B1, 0x07C0, 0x07C1, 0x07C2, 0x07C3, 0x07C4, 0x07C5, 0x07C6, 0x07C7, 0x07C8, 0x07C9, 0x07CA, 0x07CB, 0x07CC, 0x07CD, 0x07CE, 0x07CF, 0x07D0, 0x07D1, 0x07D2, 0x07D3, 0x07D4, 0x07D5, 0x07D6, 0x07D7, 0x07D8, 0x07D9, 0x07DA, 0x07DB, 0x07DC, 0x07DD, 0x07DE, 0x07DF, 0x07E0, 0x07E1, 0x07E2, 0x07E3, 0x07E4, 0x07E5, 0x07E6, 0x07E7, 0x07E8, 0x07E9, 0x07EA, 0x07F4, 0x07F5, 0x07FA, 0x0800, 0x0801, 0x0802, 0x0803, 0x0804, 0x0805, 0x0806, 0x0807, 0x0808, 0x0809, 0x080A, 0x080B, 0x080C, 0x080D, 0x080E, 0x080F, 0x0810, 0x0811, 0x0812, 0x0813, 0x0814, 0x0815, 0x081A, 0x0824, 0x0828, 0x0830, 0x0831, 0x0832, 0x0833, 0x0834, 0x0835, 0x0836, 0x0837, 0x0838, 0x0839, 0x083A, 0x083B, 0x083C, 0x083D, 0x083E, 0x0840, 0x0841, 0x0842, 0x0843, 0x0844, 0x0845, 0x0846, 0x0847, 0x0848, 0x0849, 0x084A, 0x084B, 0x084C, 0x084D, 0x084E, 0x084F, 0x0850, 0x0851, 0x0852, 0x0853, 0x0854, 0x0855, 0x0856, 0x0857, 0x0858, 0x085E, 0x08A0, 0x08A2, 0x08A3, 0x08A4, 0x08A5, 0x08A6, 0x08A7, 0x08A8, 0x08A9, 0x08AA, 0x08AB, 0x08AC, 0x200F, 0xFB1D, 0xFB1F, 0xFB20, 0xFB21, 0xFB22, 0xFB23, 0xFB24, 0xFB25, 0xFB26, 0xFB27, 0xFB28, 0xFB2A, 0xFB2B, 0xFB2C, 0xFB2D, 0xFB2E, 0xFB2F, 0xFB30, 0xFB31, 0xFB32, 0xFB33, 0xFB34, 0xFB35, 0xFB36, 0xFB38, 0xFB39, 0xFB3A, 0xFB3B, 0xFB3C, 0xFB3E, 0xFB40, 0xFB41, 0xFB43, 0xFB44, 0xFB46, 0xFB47, 0xFB48, 0xFB49, 0xFB4A, 0xFB4B, 0xFB4C, 0xFB4D, 0xFB4E, 0xFB4F, 0xFB50, 0xFB51, 0xFB52, 0xFB53, 0xFB54, 0xFB55, 0xFB56, 0xFB57, 0xFB58, 0xFB59, 0xFB5A, 0xFB5B, 0xFB5C, 0xFB5D, 0xFB5E, 0xFB5F, 0xFB60, 0xFB61, 0xFB62, 0xFB63, 0xFB64, 0xFB65, 0xFB66, 0xFB67, 0xFB68, 0xFB69, 0xFB6A, 0xFB6B, 0xFB6C, 0xFB6D, 0xFB6E, 0xFB6F, 0xFB70, 0xFB71, 0xFB72, 0xFB73, 0xFB74, 0xFB75, 0xFB76, 0xFB77, 0xFB78, 0xFB79, 0xFB7A, 0xFB7B, 0xFB7C, 0xFB7D, 0xFB7E, 0xFB7F, 0xFB80, 0xFB81, 0xFB82, 0xFB83, 0xFB84, 0xFB85, 0xFB86, 0xFB87, 0xFB88, 0xFB89, 0xFB8A, 0xFB8B, 0xFB8C, 0xFB8D, 0xFB8E, 0xFB8F, 0xFB90, 0xFB91, 0xFB92, 0xFB93, 0xFB94, 0xFB95, 0xFB96, 0xFB97, 0xFB98, 0xFB99, 0xFB9A, 0xFB9B, 0xFB9C, 0xFB9D, 0xFB9E, 0xFB9F, 0xFBA0, 0xFBA1, 0xFBA2, 0xFBA3, 0xFBA4, 0xFBA5, 0xFBA6, 0xFBA7, 0xFBA8, 0xFBA9, 0xFBAA, 0xFBAB, 0xFBAC, 0xFBAD, 0xFBAE, 0xFBAF, 0xFBB0, 0xFBB1, 0xFBB2, 0xFBB3, 0xFBB4, 0xFBB5, 0xFBB6, 0xFBB7, 0xFBB8, 0xFBB9, 0xFBBA, 0xFBBB, 0xFBBC, 0xFBBD, 0xFBBE, 0xFBBF, 0xFBC0, 0xFBC1, 0xFBD3, 0xFBD4, 0xFBD5, 0xFBD6, 0xFBD7, 0xFBD8, 0xFBD9, 0xFBDA, 0xFBDB, 0xFBDC, 0xFBDD, 0xFBDE, 0xFBDF, 0xFBE0, 0xFBE1, 0xFBE2, 0xFBE3, 0xFBE4, 0xFBE5, 0xFBE6, 0xFBE7, 0xFBE8, 0xFBE9, 0xFBEA, 0xFBEB, 0xFBEC, 0xFBED, 0xFBEE, 0xFBEF, 0xFBF0, 0xFBF1, 0xFBF2, 0xFBF3, 0xFBF4, 0xFBF5, 0xFBF6, 0xFBF7, 0xFBF8, 0xFBF9, 0xFBFA, 0xFBFB, 0xFBFC, 0xFBFD, 0xFBFE, 0xFBFF, 0xFC00, 0xFC01, 0xFC02, 0xFC03, 0xFC04, 0xFC05, 0xFC06, 0xFC07, 0xFC08, 0xFC09, 0xFC0A, 0xFC0B, 0xFC0C, 0xFC0D, 0xFC0E, 0xFC0F, 0xFC10, 0xFC11, 0xFC12, 0xFC13, 0xFC14, 0xFC15, 0xFC16, 0xFC17, 0xFC18, 0xFC19, 0xFC1A, 0xFC1B, 0xFC1C, 0xFC1D, 0xFC1E, 0xFC1F, 0xFC20, 0xFC21, 0xFC22, 0xFC23, 0xFC24, 0xFC25, 0xFC26, 0xFC27, 0xFC28, 0xFC29, 0xFC2A, 0xFC2B, 0xFC2C, 0xFC2D, 0xFC2E, 0xFC2F, 0xFC30, 0xFC31, 0xFC32, 0xFC33, 0xFC34, 0xFC35, 0xFC36, 0xFC37, 0xFC38, 0xFC39, 0xFC3A, 0xFC3B, 0xFC3C, 0xFC3D, 0xFC3E, 0xFC3F, 0xFC40, 0xFC41, 0xFC42, 0xFC43, 0xFC44, 0xFC45, 0xFC46, 0xFC47, 0xFC48, 0xFC49, 0xFC4A, 0xFC4B, 0xFC4C, 0xFC4D, 0xFC4E, 0xFC4F, 0xFC50, 0xFC51, 0xFC52, 0xFC53, 0xFC54, 0xFC55, 0xFC56, 0xFC57, 0xFC58, 0xFC59, 0xFC5A, 0xFC5B, 0xFC5C, 0xFC5D, 0xFC5E, 0xFC5F, 0xFC60, 0xFC61, 0xFC62, 0xFC63, 0xFC64, 0xFC65, 0xFC66, 0xFC67, 0xFC68, 0xFC69, 0xFC6A, 0xFC6B, 0xFC6C, 0xFC6D, 0xFC6E, 0xFC6F, 0xFC70, 0xFC71, 0xFC72, 0xFC73, 0xFC74, 0xFC75, 0xFC76, 0xFC77, 0xFC78, 0xFC79, 0xFC7A, 0xFC7B, 0xFC7C, 0xFC7D, 0xFC7E, 0xFC7F, 0xFC80, 0xFC81, 0xFC82, 0xFC83, 0xFC84, 0xFC85, 0xFC86, 0xFC87, 0xFC88, 0xFC89, 0xFC8A, 0xFC8B, 0xFC8C, 0xFC8D, 0xFC8E, 0xFC8F, 0xFC90, 0xFC91, 0xFC92, 0xFC93, 0xFC94, 0xFC95, 0xFC96, 0xFC97, 0xFC98, 0xFC99, 0xFC9A, 0xFC9B, 0xFC9C, 0xFC9D, 0xFC9E, 0xFC9F, 0xFCA0, 0xFCA1, 0xFCA2, 0xFCA3, 0xFCA4, 0xFCA5, 0xFCA6, 0xFCA7, 0xFCA8, 0xFCA9, 0xFCAA, 0xFCAB, 0xFCAC, 0xFCAD, 0xFCAE, 0xFCAF, 0xFCB0, 0xFCB1, 0xFCB2, 0xFCB3, 0xFCB4, 0xFCB5, 0xFCB6, 0xFCB7, 0xFCB8, 0xFCB9, 0xFCBA, 0xFCBB, 0xFCBC, 0xFCBD, 0xFCBE, 0xFCBF, 0xFCC0, 0xFCC1, 0xFCC2, 0xFCC3, 0xFCC4, 0xFCC5, 0xFCC6, 0xFCC7, 0xFCC8, 0xFCC9, 0xFCCA, 0xFCCB, 0xFCCC, 0xFCCD, 0xFCCE, 0xFCCF, 0xFCD0, 0xFCD1, 0xFCD2, 0xFCD3, 0xFCD4, 0xFCD5, 0xFCD6, 0xFCD7, 0xFCD8, 0xFCD9, 0xFCDA, 0xFCDB, 0xFCDC, 0xFCDD, 0xFCDE, 0xFCDF, 0xFCE0, 0xFCE1, 0xFCE2, 0xFCE3, 0xFCE4, 0xFCE5, 0xFCE6, 0xFCE7, 0xFCE8, 0xFCE9, 0xFCEA, 0xFCEB, 0xFCEC, 0xFCED, 0xFCEE, 0xFCEF, 0xFCF0, 0xFCF1, 0xFCF2, 0xFCF3, 0xFCF4, 0xFCF5, 0xFCF6, 0xFCF7, 0xFCF8, 0xFCF9, 0xFCFA, 0xFCFB, 0xFCFC, 0xFCFD, 0xFCFE, 0xFCFF, 0xFD00, 0xFD01, 0xFD02, 0xFD03, 0xFD04, 0xFD05, 0xFD06, 0xFD07, 0xFD08, 0xFD09, 0xFD0A, 0xFD0B, 0xFD0C, 0xFD0D, 0xFD0E, 0xFD0F, 0xFD10, 0xFD11, 0xFD12, 0xFD13, 0xFD14, 0xFD15, 0xFD16, 0xFD17, 0xFD18, 0xFD19, 0xFD1A, 0xFD1B, 0xFD1C, 0xFD1D, 0xFD1E, 0xFD1F, 0xFD20, 0xFD21, 0xFD22, 0xFD23, 0xFD24, 0xFD25, 0xFD26, 0xFD27, 0xFD28, 0xFD29, 0xFD2A, 0xFD2B, 0xFD2C, 0xFD2D, 0xFD2E, 0xFD2F, 0xFD30, 0xFD31, 0xFD32, 0xFD33, 0xFD34, 0xFD35, 0xFD36, 0xFD37, 0xFD38, 0xFD39, 0xFD3A, 0xFD3B, 0xFD3C, 0xFD3D, 0xFD50, 0xFD51, 0xFD52, 0xFD53, 0xFD54, 0xFD55, 0xFD56, 0xFD57, 0xFD58, 0xFD59, 0xFD5A, 0xFD5B, 0xFD5C, 0xFD5D, 0xFD5E, 0xFD5F, 0xFD60, 0xFD61, 0xFD62, 0xFD63, 0xFD64, 0xFD65, 0xFD66, 0xFD67, 0xFD68, 0xFD69, 0xFD6A, 0xFD6B, 0xFD6C, 0xFD6D, 0xFD6E, 0xFD6F, 0xFD70, 0xFD71, 0xFD72, 0xFD73, 0xFD74, 0xFD75, 0xFD76, 0xFD77, 0xFD78, 0xFD79, 0xFD7A, 0xFD7B, 0xFD7C, 0xFD7D, 0xFD7E, 0xFD7F, 0xFD80, 0xFD81, 0xFD82, 0xFD83, 0xFD84, 0xFD85, 0xFD86, 0xFD87, 0xFD88, 0xFD89, 0xFD8A, 0xFD8B, 0xFD8C, 0xFD8D, 0xFD8E, 0xFD8F, 0xFD92, 0xFD93, 0xFD94, 0xFD95, 0xFD96, 0xFD97, 0xFD98, 0xFD99, 0xFD9A, 0xFD9B, 0xFD9C, 0xFD9D, 0xFD9E, 0xFD9F, 0xFDA0, 0xFDA1, 0xFDA2, 0xFDA3, 0xFDA4, 0xFDA5, 0xFDA6, 0xFDA7, 0xFDA8, 0xFDA9, 0xFDAA, 0xFDAB, 0xFDAC, 0xFDAD, 0xFDAE, 0xFDAF, 0xFDB0, 0xFDB1, 0xFDB2, 0xFDB3, 0xFDB4, 0xFDB5, 0xFDB6, 0xFDB7, 0xFDB8, 0xFDB9, 0xFDBA, 0xFDBB, 0xFDBC, 0xFDBD, 0xFDBE, 0xFDBF, 0xFDC0, 0xFDC1, 0xFDC2, 0xFDC3, 0xFDC4, 0xFDC5, 0xFDC6, 0xFDC7, 0xFDF0, 0xFDF1, 0xFDF2, 0xFDF3, 0xFDF4, 0xFDF5, 0xFDF6, 0xFDF7, 0xFDF8, 0xFDF9, 0xFDFA, 0xFDFB, 0xFDFC, 0xFE70, 0xFE71, 0xFE72, 0xFE73, 0xFE74, 0xFE76, 0xFE77, 0xFE78, 0xFE79, 0xFE7A, 0xFE7B, 0xFE7C, 0xFE7D, 0xFE7E, 0xFE7F, 0xFE80, 0xFE81, 0xFE82, 0xFE83, 0xFE84, 0xFE85, 0xFE86, 0xFE87, 0xFE88, 0xFE89, 0xFE8A, 0xFE8B, 0xFE8C, 0xFE8D, 0xFE8E, 0xFE8F, 0xFE90, 0xFE91, 0xFE92, 0xFE93, 0xFE94, 0xFE95, 0xFE96, 0xFE97, 0xFE98, 0xFE99, 0xFE9A, 0xFE9B, 0xFE9C, 0xFE9D, 0xFE9E, 0xFE9F, 0xFEA0, 0xFEA1, 0xFEA2, 0xFEA3, 0xFEA4, 0xFEA5, 0xFEA6, 0xFEA7, 0xFEA8, 0xFEA9, 0xFEAA, 0xFEAB, 0xFEAC, 0xFEAD, 0xFEAE, 0xFEAF, 0xFEB0, 0xFEB1, 0xFEB2, 0xFEB3, 0xFEB4, 0xFEB5, 0xFEB6, 0xFEB7, 0xFEB8, 0xFEB9, 0xFEBA, 0xFEBB, 0xFEBC, 0xFEBD, 0xFEBE, 0xFEBF, 0xFEC0, 0xFEC1, 0xFEC2, 0xFEC3, 0xFEC4, 0xFEC5, 0xFEC6, 0xFEC7, 0xFEC8, 0xFEC9, 0xFECA, 0xFECB, 0xFECC, 0xFECD, 0xFECE, 0xFECF, 0xFED0, 0xFED1, 0xFED2, 0xFED3, 0xFED4, 0xFED5, 0xFED6, 0xFED7, 0xFED8, 0xFED9, 0xFEDA, 0xFEDB, 0xFEDC, 0xFEDD, 0xFEDE, 0xFEDF, 0xFEE0, 0xFEE1, 0xFEE2, 0xFEE3, 0xFEE4, 0xFEE5, 0xFEE6, 0xFEE7, 0xFEE8, 0xFEE9, 0xFEEA, 0xFEEB, 0xFEEC, 0xFEED, 0xFEEE, 0xFEEF, 0xFEF0, 0xFEF1, 0xFEF2, 0xFEF3, 0xFEF4, 0xFEF5, 0xFEF6, 0xFEF7, 0xFEF8, 0xFEF9, 0xFEFA, 0xFEFB, 0xFEFC, 0x10800, 0x10801, 0x10802, 0x10803, 0x10804, 0x10805, 0x10808, 0x1080A, 0x1080B, 0x1080C, 0x1080D, 0x1080E, 0x1080F, 0x10810, 0x10811, 0x10812, 0x10813, 0x10814, 0x10815, 0x10816, 0x10817, 0x10818, 0x10819, 0x1081A, 0x1081B, 0x1081C, 0x1081D, 0x1081E, 0x1081F, 0x10820, 0x10821, 0x10822, 0x10823, 0x10824, 0x10825, 0x10826, 0x10827, 0x10828, 0x10829, 0x1082A, 0x1082B, 0x1082C, 0x1082D, 0x1082E, 0x1082F, 0x10830, 0x10831, 0x10832, 0x10833, 0x10834, 0x10835, 0x10837, 0x10838, 0x1083C, 0x1083F, 0x10840, 0x10841, 0x10842, 0x10843, 0x10844, 0x10845, 0x10846, 0x10847, 0x10848, 0x10849, 0x1084A, 0x1084B, 0x1084C, 0x1084D, 0x1084E, 0x1084F, 0x10850, 0x10851, 0x10852, 0x10853, 0x10854, 0x10855, 0x10857, 0x10858, 0x10859, 0x1085A, 0x1085B, 0x1085C, 0x1085D, 0x1085E, 0x1085F, 0x10900, 0x10901, 0x10902, 0x10903, 0x10904, 0x10905, 0x10906, 0x10907, 0x10908, 0x10909, 0x1090A, 0x1090B, 0x1090C, 0x1090D, 0x1090E, 0x1090F, 0x10910, 0x10911, 0x10912, 0x10913, 0x10914, 0x10915, 0x10916, 0x10917, 0x10918, 0x10919, 0x1091A, 0x1091B, 0x10920, 0x10921, 0x10922, 0x10923, 0x10924, 0x10925, 0x10926, 0x10927, 0x10928, 0x10929, 0x1092A, 0x1092B, 0x1092C, 0x1092D, 0x1092E, 0x1092F, 0x10930, 0x10931, 0x10932, 0x10933, 0x10934, 0x10935, 0x10936, 0x10937, 0x10938, 0x10939, 0x1093F, 0x10980, 0x10981, 0x10982, 0x10983, 0x10984, 0x10985, 0x10986, 0x10987, 0x10988, 0x10989, 0x1098A, 0x1098B, 0x1098C, 0x1098D, 0x1098E, 0x1098F, 0x10990, 0x10991, 0x10992, 0x10993, 0x10994, 0x10995, 0x10996, 0x10997, 0x10998, 0x10999, 0x1099A, 0x1099B, 0x1099C, 0x1099D, 0x1099E, 0x1099F, 0x109A0, 0x109A1, 0x109A2, 0x109A3, 0x109A4, 0x109A5, 0x109A6, 0x109A7, 0x109A8, 0x109A9, 0x109AA, 0x109AB, 0x109AC, 0x109AD, 0x109AE, 0x109AF, 0x109B0, 0x109B1, 0x109B2, 0x109B3, 0x109B4, 0x109B5, 0x109B6, 0x109B7, 0x109BE, 0x109BF, 0x10A00, 0x10A10, 0x10A11, 0x10A12, 0x10A13, 0x10A15, 0x10A16, 0x10A17, 0x10A19, 0x10A1A, 0x10A1B, 0x10A1C, 0x10A1D, 0x10A1E, 0x10A1F, 0x10A20, 0x10A21, 0x10A22, 0x10A23, 0x10A24, 0x10A25, 0x10A26, 0x10A27, 0x10A28, 0x10A29, 0x10A2A, 0x10A2B, 0x10A2C, 0x10A2D, 0x10A2E, 0x10A2F, 0x10A30, 0x10A31, 0x10A32, 0x10A33, 0x10A40, 0x10A41, 0x10A42, 0x10A43, 0x10A44, 0x10A45, 0x10A46, 0x10A47, 0x10A50, 0x10A51, 0x10A52, 0x10A53, 0x10A54, 0x10A55, 0x10A56, 0x10A57, 0x10A58, 0x10A60, 0x10A61, 0x10A62, 0x10A63, 0x10A64, 0x10A65, 0x10A66, 0x10A67, 0x10A68, 0x10A69, 0x10A6A, 0x10A6B, 0x10A6C, 0x10A6D, 0x10A6E, 0x10A6F, 0x10A70, 0x10A71, 0x10A72, 0x10A73, 0x10A74, 0x10A75, 0x10A76, 0x10A77, 0x10A78, 0x10A79, 0x10A7A, 0x10A7B, 0x10A7C, 0x10A7D, 0x10A7E, 0x10A7F, 0x10B00, 0x10B01, 0x10B02, 0x10B03, 0x10B04, 0x10B05, 0x10B06, 0x10B07, 0x10B08, 0x10B09, 0x10B0A, 0x10B0B, 0x10B0C, 0x10B0D, 0x10B0E, 0x10B0F, 0x10B10, 0x10B11, 0x10B12, 0x10B13, 0x10B14, 0x10B15, 0x10B16, 0x10B17, 0x10B18, 0x10B19, 0x10B1A, 0x10B1B, 0x10B1C, 0x10B1D, 0x10B1E, 0x10B1F, 0x10B20, 0x10B21, 0x10B22, 0x10B23, 0x10B24, 0x10B25, 0x10B26, 0x10B27, 0x10B28, 0x10B29, 0x10B2A, 0x10B2B, 0x10B2C, 0x10B2D, 0x10B2E, 0x10B2F, 0x10B30, 0x10B31, 0x10B32, 0x10B33, 0x10B34, 0x10B35, 0x10B40, 0x10B41, 0x10B42, 0x10B43, 0x10B44, 0x10B45, 0x10B46, 0x10B47, 0x10B48, 0x10B49, 0x10B4A, 0x10B4B, 0x10B4C, 0x10B4D, 0x10B4E, 0x10B4F, 0x10B50, 0x10B51, 0x10B52, 0x10B53, 0x10B54, 0x10B55, 0x10B58, 0x10B59, 0x10B5A, 0x10B5B, 0x10B5C, 0x10B5D, 0x10B5E, 0x10B5F, 0x10B60, 0x10B61, 0x10B62, 0x10B63, 0x10B64, 0x10B65, 0x10B66, 0x10B67, 0x10B68, 0x10B69, 0x10B6A, 0x10B6B, 0x10B6C, 0x10B6D, 0x10B6E, 0x10B6F, 0x10B70, 0x10B71, 0x10B72, 0x10B78, 0x10B79, 0x10B7A, 0x10B7B, 0x10B7C, 0x10B7D, 0x10B7E, 0x10B7F, 0x10C00, 0x10C01, 0x10C02, 0x10C03, 0x10C04, 0x10C05, 0x10C06, 0x10C07, 0x10C08, 0x10C09, 0x10C0A, 0x10C0B, 0x10C0C, 0x10C0D, 0x10C0E, 0x10C0F, 0x10C10, 0x10C11, 0x10C12, 0x10C13, 0x10C14, 0x10C15, 0x10C16, 0x10C17, 0x10C18, 0x10C19, 0x10C1A, 0x10C1B, 0x10C1C, 0x10C1D, 0x10C1E, 0x10C1F, 0x10C20, 0x10C21, 0x10C22, 0x10C23, 0x10C24, 0x10C25, 0x10C26, 0x10C27, 0x10C28, 0x10C29, 0x10C2A, 0x10C2B, 0x10C2C, 0x10C2D, 0x10C2E, 0x10C2F, 0x10C30, 0x10C31, 0x10C32, 0x10C33, 0x10C34, 0x10C35, 0x10C36, 0x10C37, 0x10C38, 0x10C39, 0x10C3A, 0x10C3B, 0x10C3C, 0x10C3D, 0x10C3E, 0x10C3F, 0x10C40, 0x10C41, 0x10C42, 0x10C43, 0x10C44, 0x10C45, 0x10C46, 0x10C47, 0x10C48, 0x1EE00, 0x1EE01, 0x1EE02, 0x1EE03, 0x1EE05, 0x1EE06, 0x1EE07, 0x1EE08, 0x1EE09, 0x1EE0A, 0x1EE0B, 0x1EE0C, 0x1EE0D, 0x1EE0E, 0x1EE0F, 0x1EE10, 0x1EE11, 0x1EE12, 0x1EE13, 0x1EE14, 0x1EE15, 0x1EE16, 0x1EE17, 0x1EE18, 0x1EE19, 0x1EE1A, 0x1EE1B, 0x1EE1C, 0x1EE1D, 0x1EE1E, 0x1EE1F, 0x1EE21, 0x1EE22, 0x1EE24, 0x1EE27, 0x1EE29, 0x1EE2A, 0x1EE2B, 0x1EE2C, 0x1EE2D, 0x1EE2E, 0x1EE2F, 0x1EE30, 0x1EE31, 0x1EE32, 0x1EE34, 0x1EE35, 0x1EE36, 0x1EE37, 0x1EE39, 0x1EE3B, 0x1EE42, 0x1EE47, 0x1EE49, 0x1EE4B, 0x1EE4D, 0x1EE4E, 0x1EE4F, 0x1EE51, 0x1EE52, 0x1EE54, 0x1EE57, 0x1EE59, 0x1EE5B, 0x1EE5D, 0x1EE5F, 0x1EE61, 0x1EE62, 0x1EE64, 0x1EE67, 0x1EE68, 0x1EE69, 0x1EE6A, 0x1EE6C, 0x1EE6D, 0x1EE6E, 0x1EE6F, 0x1EE70, 0x1EE71, 0x1EE72, 0x1EE74, 0x1EE75, 0x1EE76, 0x1EE77, 0x1EE79, 0x1EE7A, 0x1EE7B, 0x1EE7C, 0x1EE7E, 0x1EE80, 0x1EE81, 0x1EE82, 0x1EE83, 0x1EE84, 0x1EE85, 0x1EE86, 0x1EE87, 0x1EE88, 0x1EE89, 0x1EE8B, 0x1EE8C, 0x1EE8D, 0x1EE8E, 0x1EE8F, 0x1EE90, 0x1EE91, 0x1EE92, 0x1EE93, 0x1EE94, 0x1EE95, 0x1EE96, 0x1EE97, 0x1EE98, 0x1EE99, 0x1EE9A, 0x1EE9B, 0x1EEA1, 0x1EEA2, 0x1EEA3, 0x1EEA5, 0x1EEA6, 0x1EEA7, 0x1EEA8, 0x1EEA9, 0x1EEAB, 0x1EEAC, 0x1EEAD, 0x1EEAE, 0x1EEAF, 0x1EEB0, 0x1EEB1, 0x1EEB2, 0x1EEB3, 0x1EEB4, 0x1EEB5, 0x1EEB6, 0x1EEB7, 0x1EEB8, 0x1EEB9, 0x1EEBA, 0x1EEBB, 0x10FFFD]

    function determineBidi(cueDiv) {
        var nodeStack = [],
            text = "",
            charCode;
        if (!cueDiv || !cueDiv.childNodes) return "ltr"

        function pushNodes(nodeStack, node) {
            for (var i = node.childNodes.length - 1; i >= 0; i--) nodeStack.push(node.childNodes[i])
        }

        function nextTextNode(nodeStack) {
            if (!nodeStack || !nodeStack.length) return null;
            var node = nodeStack.pop(),
                text = node.textContent || node.innerText;
            if (text) {
                var m = text.match(/^.*(\n|\r)/);
                if (m) {
                    nodeStack.length = 0;
                    return m[0]
                };
                return text
            };
            if (node.tagName === "ruby") return nextTextNode(nodeStack);
            if (node.childNodes) {
                pushNodes(nodeStack, node);
                return nextTextNode(nodeStack)
            }
        };
        pushNodes(nodeStack, cueDiv);
        while ((text = nextTextNode(nodeStack)))
            for (var i = 0; i < text.length; i++) {
                charCode = text.charCodeAt(i);
                for (var j = 0; j < strongRTLChars.length; j++)
                    if (strongRTLChars[j] === charCode) return "rtl"
            };
        return "ltr"
    }

    function computeLinePos(cue) {
        if (typeof cue.line === "number" && (cue.snapToLines || (cue.line >= 0 && cue.line <= 100))) return cue.line;
        if (!cue.track || !cue.track.textTrackList || !cue.track.textTrackList.mediaElement) return -1;
        var track = cue.track,
            trackList = track.textTrackList,
            count = 0;
        for (var i = 0; i < trackList.length && trackList[i] !== track; i++)
            if (trackList[i].mode === "showing") count++;
        return ++count * -1
    }

    function StyleBox() {};
    StyleBox.prototype.applyStyles = function(styles, div) {
        div = div || this.div;
        for (var prop in styles)
            if (styles.hasOwnProperty(prop)) div.style[prop] = styles[prop]
    };
    StyleBox.prototype.formatStyle = function(val, unit) {
        return val === 0 ? 0 : val + unit
    }

    function CueStyleBox(window, cue, styleOptions) {
        var isIE8 = /MSIE\s8\.0/.test(navigator.userAgent),
            color = "rgba(255, 255, 255, 1)",
            backgroundColor = "rgba(0, 0, 0, 0.8)";
        if (isIE8) {
            color = "rgb(255, 255, 255)";
            backgroundColor = "rgb(0, 0, 0)"
        };
        StyleBox.call(this);
        this.cue = cue;
        this.cueDiv = parseContent(window, cue.text);
        var styles = {
            color: color,
            backgroundColor: backgroundColor,
            position: "relative",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            display: "inline"
        };
        if (!isIE8) {
            styles.writingMode = cue.vertical === "" ? "horizontal-tb" : cue.vertical === "lr" ? "vertical-lr" : "vertical-rl";
            styles.unicodeBidi = "plaintext"
        };
        this.applyStyles(styles, this.cueDiv);
        this.div = window.document.createElement("div");
        styles = {
            textAlign: cue.align === "middle" ? "center" : cue.align,
            font: styleOptions.font,
            whiteSpace: "pre-line",
            position: "absolute"
        };
        if (!isIE8) {
            styles.direction = determineBidi(this.cueDiv);
            styles.writingMode = cue.vertical === "" ? "horizontal-tb" : cue.vertical === "lr" ? "vertical-lr" : "vertical-rl".stylesunicodeBidi = "plaintext"
        };
        this.applyStyles(styles);
        this.div.appendChild(this.cueDiv);
        var textPos = 0;
        switch (cue.positionAlign) {
            case "start":
                textPos = cue.position;
                break;
            case "middle":
                textPos = cue.position - (cue.size / 2);
                break;
            case "end":
                textPos = cue.position - cue.size;
                break
        };
        if (cue.vertical === "") {
            this.applyStyles({
                left: this.formatStyle(textPos, "%"),
                width: this.formatStyle(cue.size, "%")
            })
        } else this.applyStyles({
            top: this.formatStyle(textPos, "%"),
            height: this.formatStyle(cue.size, "%")
        });
        this.move = function(box) {
            this.applyStyles({
                top: this.formatStyle(box.top, "px"),
                bottom: this.formatStyle(box.bottom, "px"),
                left: this.formatStyle(box.left, "px"),
                right: this.formatStyle(box.right, "px"),
                height: this.formatStyle(box.height, "px"),
                width: this.formatStyle(box.width, "px")
            })
        }
    };
    CueStyleBox.prototype = _objCreate(StyleBox.prototype);
    CueStyleBox.prototype.constructor = CueStyleBox

    function BoxPosition(obj) {
        var isIE8 = /MSIE\s8\.0/.test(navigator.userAgent),
            lh, height, width, top;
        if (obj.div) {
            height = obj.div.offsetHeight;
            width = obj.div.offsetWidth;
            top = obj.div.offsetTop;
            var rects = (rects = obj.div.childNodes) && (rects = rects[0]) && rects.getClientRects && rects.getClientRects();
            obj = obj.div.getBoundingClientRect();
            lh = rects ? Math.max((rects[0] && rects[0].height) || 0, obj.height / rects.length) : 0
        };
        this.left = obj.left;
        this.right = obj.right;
        this.top = obj.top || top;
        this.height = obj.height || height;
        this.bottom = obj.bottom || (top + (obj.height || height));
        this.width = obj.width || width;
        this.lineHeight = lh !== undefined ? lh : obj.lineHeight;
        if (isIE8 && !this.lineHeight) this.lineHeight = 13
    };
    BoxPosition.prototype.move = function(axis, toMove) {
        toMove = toMove !== undefined ? toMove : this.lineHeight;
        switch (axis) {
            case "+x":
                this.left += toMove;
                this.right += toMove;
                break;
            case "-x":
                this.left -= toMove;
                this.right -= toMove;
                break;
            case "+y":
                this.top += toMove;
                this.bottom += toMove;
                break;
            case "-y":
                this.top -= toMove;
                this.bottom -= toMove;
                break
        }
    };
    BoxPosition.prototype.overlaps = function(b2) {
        return this.left < b2.right && this.right > b2.left && this.top < b2.bottom && this.bottom > b2.top
    };
    BoxPosition.prototype.overlapsAny = function(boxes) {
        for (var i = 0; i < boxes.length; i++)
            if (this.overlaps(boxes[i])) return true;
        return false
    };
    BoxPosition.prototype.within = function(container) {
        return this.top >= container.top && this.bottom <= container.bottom && this.left >= container.left && this.right <= container.right
    };
    BoxPosition.prototype.overlapsOppositeAxis = function(container, axis) {
        switch (axis) {
            case "+x":
                return this.left < container.left;
            case "-x":
                return this.right > container.right;
            case "+y":
                return this.top < container.top;
            case "-y":
                return this.bottom > container.bottom
        }
    };
    BoxPosition.prototype.intersectPercentage = function(b2) {
        var x = Math.max(0, Math.min(this.right, b2.right) - Math.max(this.left, b2.left)),
            y = Math.max(0, Math.min(this.bottom, b2.bottom) - Math.max(this.top, b2.top)),
            intersectArea = x * y;
        return intersectArea / (this.height * this.width)
    };
    BoxPosition.prototype.toCSSCompatValues = function(reference) {
        return {
            top: this.top - reference.top,
            bottom: reference.bottom - this.bottom,
            left: this.left - reference.left,
            right: reference.right - this.right,
            height: this.height,
            width: this.width
        }
    };
    BoxPosition.getSimpleBoxPosition = function(obj) {
        var height = obj.div ? obj.div.offsetHeight : obj.tagName ? obj.offsetHeight : 0,
            width = obj.div ? obj.div.offsetWidth : obj.tagName ? obj.offsetWidth : 0,
            top = obj.div ? obj.div.offsetTop : obj.tagName ? obj.offsetTop : 0;
        obj = obj.div ? obj.div.getBoundingClientRect() : obj.tagName ? obj.getBoundingClientRect() : obj;
        var ret = {
            left: obj.left,
            right: obj.right,
            top: obj.top || top,
            height: obj.height || height,
            bottom: obj.bottom || (top + (obj.height || height)),
            width: obj.width || width
        };
        return ret
    }

    function moveBoxToLinePosition(window, styleBox, containerBox, boxPositions) {
        function findBestPosition(b, axis) {
            var bestPosition, specifiedPosition = new BoxPosition(b),
                percentage = 1;
            for (var i = 0; i < axis.length; i++) {
                while (b.overlapsOppositeAxis(containerBox, axis[i]) || (b.within(containerBox) && b.overlapsAny(boxPositions))) b.move(axis[i]);
                if (b.within(containerBox)) return b;
                var p = b.intersectPercentage(containerBox);
                if (percentage > p) {
                    bestPosition = new BoxPosition(b);
                    percentage = p
                };
                b = new BoxPosition(specifiedPosition)
            };
            return bestPosition || specifiedPosition
        };
        var boxPosition = new BoxPosition(styleBox),
            cue = styleBox.cue,
            linePos = computeLinePos(cue),
            axis = [];
        if (cue.snapToLines) {
            var size;
            switch (cue.vertical) {
                case "":
                    axis = ["+y", "-y"];
                    size = "height";
                    break;
                case "rl":
                    axis = ["+x", "-x"];
                    size = "width";
                    break;
                case "lr":
                    axis = ["-x", "+x"];
                    size = "width";
                    break
            };
            var step = boxPosition.lineHeight,
                position = step * Math.round(linePos),
                maxPosition = containerBox[size] + step,
                initialAxis = axis[0];
            if (Math.abs(position) > maxPosition) {
                position = position < 0 ? -1 : 1;
                position *= Math.ceil(maxPosition / step) * step
            };
            if (linePos < 0) {
                position += cue.vertical === "" ? containerBox.height : containerBox.width;
                axis = axis.reverse()
            };
            boxPosition.move(initialAxis, position)
        } else {
            var calculatedPercentage = (boxPosition.lineHeight / containerBox.height) * 100;
            switch (cue.lineAlign) {
                case "middle":
                    linePos -= (calculatedPercentage / 2);
                    break;
                case "end":
                    linePos -= calculatedPercentage;
                    break
            };
            switch (cue.vertical) {
                case "":
                    styleBox.applyStyles({
                        top: styleBox.formatStyle(linePos, "%")
                    });
                    break;
                case "rl":
                    styleBox.applyStyles({
                        left: styleBox.formatStyle(linePos, "%")
                    });
                    break;
                case "lr":
                    styleBox.applyStyles({
                        right: styleBox.formatStyle(linePos, "%")
                    });
                    break
            };
            axis = ["+y", "-x", "+x", "-y"];
            boxPosition = new BoxPosition(styleBox)
        };
        var bestPosition = findBestPosition(boxPosition, axis);
        styleBox.move(bestPosition.toCSSCompatValues(containerBox))
    }

    function WebVTT() {};
    WebVTT.StringDecoder = function() {
        return {
            decode: function(data) {
                if (!data) return "";
                if (typeof data !== "string") throw new Error("Error - expected string data.");
                return decodeURIComponent(encodeURIComponent(data))
            }
        }
    };
    WebVTT.convertCueToDOMTree = function(window, cuetext) {
        if (!window || !cuetext) return null;
        return parseContent(window, cuetext)
    };
    var FONT_SIZE_PERCENT = 0.05,
        FONT_STYLE = "sans-serif",
        CUE_BACKGROUND_PADDING = "1.5%";
    WebVTT.processCues = function(window, cues, overlay) {
        if (!window || !cues || !overlay) return null;
        while (overlay.firstChild) overlay.removeChild(overlay.firstChild);
        var paddedOverlay = window.document.createElement("div");
        paddedOverlay.style.position = "absolute";
        paddedOverlay.style.left = "0";
        paddedOverlay.style.right = "0";
        paddedOverlay.style.top = "0";
        paddedOverlay.style.bottom = "0";
        paddedOverlay.style.margin = CUE_BACKGROUND_PADDING;
        overlay.appendChild(paddedOverlay)

        function shouldCompute(cues) {
            for (var i = 0; i < cues.length; i++)
                if (cues[i].hasBeenReset || !cues[i].displayState) return true;
            return false
        };
        if (!shouldCompute(cues)) {
            for (var i = 0; i < cues.length; i++) paddedOverlay.appendChild(cues[i].displayState);
            return
        };
        var boxPositions = [],
            containerBox = BoxPosition.getSimpleBoxPosition(paddedOverlay),
            fontSize = Math.round(containerBox.height * FONT_SIZE_PERCENT * 100) / 100,
            styleOptions = {
                font: fontSize + "px " + FONT_STYLE
            };
        (function() {
            var styleBox, cue;
            for (var i = 0; i < cues.length; i++) {
                cue = cues[i];
                styleBox = new CueStyleBox(window, cue, styleOptions);
                paddedOverlay.appendChild(styleBox.div);
                moveBoxToLinePosition(window, styleBox, containerBox, boxPositions);
                cue.displayState = styleBox.div;
                boxPositions.push(BoxPosition.getSimpleBoxPosition(styleBox))
            }
        })()
    };
    WebVTT.Parser = function(window, vttjs, decoder) {
        if (!decoder) {
            decoder = vttjs;
            vttjs = {}
        };
        if (!vttjs) vttjs = {};
        this.window = window;
        this.vttjs = vttjs;
        this.state = "INITIAL";
        this.buffer = "";
        this.decoder = decoder || new TextDecoder("utf8");
        this.regionList = []
    };
    WebVTT.Parser.prototype = {
        reportOrThrowError: function(e) {
            if (e instanceof ParsingError) {
                this.onparsingerror && this.onparsingerror(e)
            } else throw e
        },
        parse: function(data) {
            var self = this;
            if (data) self.buffer += self.decoder.decode(data, {
                stream: true
            })

            function collectNextLine() {
                var buffer = self.buffer,
                    pos = 0;
                while (pos < buffer.length && buffer[pos] !== '\r' && buffer[pos] !== '\n') ++pos;
                var line = buffer.substr(0, pos);
                if (buffer[pos] === '\r') ++pos;
                if (buffer[pos] === '\n') ++pos;
                self.buffer = buffer.substr(pos);
                return line
            }

            function parseRegion(input) {
                var settings = new Settings();
                parseOptions(input, function(k, v) {
                    switch (k) {
                        case "id":
                            settings.set(k, v);
                            break;
                        case "width":
                            settings.percent(k, v);
                            break;
                        case "lines":
                            settings.integer(k, v);
                            break;
                        case "regionanchor":
                        case "viewportanchor":
                            var xy = v.split(',');
                            if (xy.length !== 2) break;
                            var anchor = new Settings();
                            anchor.percent("x", xy[0]);
                            anchor.percent("y", xy[1]);
                            if (!anchor.has("x") || !anchor.has("y")) break;
                            settings.set(k + "X", anchor.get("x"));
                            settings.set(k + "Y", anchor.get("y"));
                            break;
                        case "scroll":
                            settings.alt(k, v, ["up"]);
                            break
                    }
                }, /=/, /\s/);
                if (settings.has("id")) {
                    var region = new(self.vttjs.VTTRegion || self.window.VTTRegion)();
                    region.width = settings.get("width", 100);
                    region.lines = settings.get("lines", 3);
                    region.regionAnchorX = settings.get("regionanchorX", 0);
                    region.regionAnchorY = settings.get("regionanchorY", 100);
                    region.viewportAnchorX = settings.get("viewportanchorX", 0);
                    region.viewportAnchorY = settings.get("viewportanchorY", 100);
                    region.scroll = settings.get("scroll", "");
                    self.onregion && self.onregion(region);
                    self.regionList.push({
                        id: settings.get("id"),
                        region: region
                    })
                }
            }

            function parseHeader(input) {
                parseOptions(input, function(k, v) {
                    switch (k) {
                        case "Region":
                            parseRegion(v);
                            break
                    }
                }, /:/)
            };
            try {
                var line;
                if (self.state === "INITIAL") {
                    if (!/\r\n|\n/.test(self.buffer)) return this;
                    line = collectNextLine();
                    var m = line.match(/^WEBVTT([ \t].*)?$/);
                    if (!m || !m[0]) throw new ParsingError(ParsingError.Errors.BadSignature);
                    self.state = "HEADER"
                };
                var alreadyCollectedLine = false;
                while (self.buffer) {
                    if (!/\r\n|\n/.test(self.buffer)) return this;
                    if (!alreadyCollectedLine) {
                        line = collectNextLine()
                    } else alreadyCollectedLine = false;
                    switch (self.state) {
                        case "HEADER":
                            if (/:/.test(line)) {
                                parseHeader(line)
                            } else if (!line) self.state = "ID";
                            continue;
                        case "NOTE":
                            if (!line) self.state = "ID";
                            continue;
                        case "ID":
                            if (/^NOTE($|[ \t])/.test(line)) {
                                self.state = "NOTE";
                                break
                            };
                            if (!line) continue;
                            self.cue = new(self.vttjs.VTTCue || self.window.VTTCue)(0, 0, "");
                            self.state = "CUE";
                            if (line.indexOf("-->") === -1) {
                                self.cue.id = line;
                                continue
                            };
                        case "CUE":
                            try {
                                parseCue(line, self.cue, self.regionList)
                            } catch (e) {
                                self.reportOrThrowError(e);
                                self.cue = null;
                                self.state = "BADCUE";
                                continue
                            };
                            self.state = "CUETEXT";
                            continue;
                        case "CUETEXT":
                            var hasSubstring = line.indexOf("-->") !== -1;
                            if (!line || hasSubstring && (alreadyCollectedLine = true)) {
                                self.oncue && self.oncue(self.cue);
                                self.cue = null;
                                self.state = "ID";
                                continue
                            };
                            if (self.cue.text) self.cue.text += "\n";
                            self.cue.text += line;
                            continue;
                        case "BADCUE":
                            if (!line) self.state = "ID";
                            continue
                    }
                }
            } catch (e) {
                self.reportOrThrowError(e);
                if (self.state === "CUETEXT" && self.cue && self.oncue) self.oncue(self.cue);
                self.cue = null;
                self.state = self.state === "INITIAL" ? "BADWEBVTT" : "BADCUE"
            };
            return this
        },
        flush: function() {
            var self = this;
            try {
                self.buffer += self.decoder.decode();
                if (self.cue || self.state === "HEADER") {
                    self.buffer += "\n\n";
                    self.parse()
                };
                if (self.state === "INITIAL") throw new ParsingError(ParsingError.Errors.BadSignature)
            } catch (e) {
                self.reportOrThrowError(e)
            };
            self.onflush && self.onflush();
            return this
        }
    };
    global.WebVTT = WebVTT
}(this, (this.vttjs || {})));;
/* Source and licensing information for the above line(s) can be found at http://www.gaia.com/sites/all/libraries/video-js/video.dev.js. */
/* Source and licensing information for the line(s) below can be found at http://www.gaia.com/sites/all/themes/gaiatv/js/videojs-replay.js. */
(function() {
    'use strict';
    videojs.replayButton = videojs.Button.extend({
        init: function(player, options) {
            if (typeof options != 'undefined' && typeof(options.seconds) != 'undefined') this.buttonText = 'Replay last ' + options.seconds + ' seconds';
            videojs.Button.call(this, player, options)
        }
    });
    videojs.replayButton.prototype.options_ = {
        seconds: 10
    };
    videojs.replayButton.prototype.buttonText = 'Replay last 10 seconds';
    videojs.replayButton.prototype.buildCSSClass = function() {
        return 'vjs-replay-button ' + videojs.Button.prototype.buildCSSClass.call(this)
    };
    videojs.replayButton.prototype.onClick = function(e) {
        e.stopImmediatePropagation();
        var rewindPos = this.player_.currentTime() > this.options_.seconds ? this.player_.currentTime() - this.options_.seconds : 0;
        this.player_.currentTime(rewindPos)
    };
    var pluginFn = function(options) {
        var replayComponent = new videojs.replayButton(this, options),
            replayButton;
        replayButton = this.controlBar.addChild(replayComponent)
    };
    videojs.plugin('replay', pluginFn)
})();;
/* Source and licensing information for the above line(s) can be found at http://www.gaia.com/sites/all/themes/gaiatv/js/videojs-replay.js. */
/*!
 * VERSION: 1.18.0
 * DATE: 2015-09-05
 * UPDATES AND DOCS AT: http://greensock.com
 *
 * @license Copyright (c) 2008-2015, GreenSock. All rights reserved.
 * This work is subject to the terms at http://greensock.com/standard-license or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
var _gsScope = "undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window;
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function() {
        "use strict";
        _gsScope._gsDefine("plugins.CSSPlugin", ["plugins.TweenPlugin", "TweenLite"], function(t, e) {
            var i, r, s, n, a = function() {
                    t.call(this, "css"), this._overwriteProps.length = 0, this.setRatio = a.prototype.setRatio
                },
                o = _gsScope._gsDefine.globals,
                l = {},
                h = a.prototype = new t("css");
            h.constructor = a, a.version = "1.18.0", a.API = 2, a.defaultTransformPerspective = 0, a.defaultSkewType = "compensated", a.defaultSmoothOrigin = !0, h = "px", a.suffixMap = {
                top: h,
                right: h,
                bottom: h,
                left: h,
                width: h,
                height: h,
                fontSize: h,
                padding: h,
                margin: h,
                perspective: h,
                lineHeight: ""
            };
            var u, f, c, _, p, d, m = /(?:\d|\-\d|\.\d|\-\.\d)+/g,
                g = /(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g,
                v = /(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi,
                y = /(?![+-]?\d*\.?\d+|[+-]|e[+-]\d+)[^0-9]/g,
                x = /(?:\d|\-|\+|=|#|\.)*/g,
                T = /opacity *= *([^)]*)/i,
                w = /opacity:([^;]*)/i,
                b = /alpha\(opacity *=.+?\)/i,
                P = /^(rgb|hsl)/,
                S = /([A-Z])/g,
                O = /-([a-z])/gi,
                C = /(^(?:url\(\"|url\())|(?:(\"\))$|\)$)/gi,
                k = function(t, e) {
                    return e.toUpperCase()
                },
                R = /(?:Left|Right|Width)/i,
                A = /(M11|M12|M21|M22)=[\d\-\.e]+/gi,
                M = /progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,
                D = /,(?=[^\)]*(?:\(|$))/gi,
                L = Math.PI / 180,
                N = 180 / Math.PI,
                F = {},
                X = document,
                z = function(t) {
                    return X.createElementNS ? X.createElementNS("http://www.w3.org/1999/xhtml", t) : X.createElement(t)
                },
                B = z("div"),
                I = z("img"),
                E = a._internals = {
                    _specialProps: l
                },
                Y = navigator.userAgent,
                W = function() {
                    var t = Y.indexOf("Android"),
                        e = z("a");
                    return c = -1 !== Y.indexOf("Safari") && -1 === Y.indexOf("Chrome") && (-1 === t || Number(Y.substr(t + 8, 1)) > 3), p = c && 6 > Number(Y.substr(Y.indexOf("Version/") + 8, 1)), _ = -1 !== Y.indexOf("Firefox"), (/MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(Y) || /Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/.exec(Y)) && (d = parseFloat(RegExp.$1)), e ? (e.style.cssText = "top:1px;opacity:.55;", /^0.55/.test(e.style.opacity)) : !1
                }(),
                V = function(t) {
                    return T.test("string" == typeof t ? t : (t.currentStyle ? t.currentStyle.filter : t.style.filter) || "") ? parseFloat(RegExp.$1) / 100 : 1
                },
                j = function(t) {
                    window.console && console.log(t)
                },
                G = "",
                U = "",
                q = function(t, e) {
                    e = e || B;
                    var i, r, s = e.style;
                    if (void 0 !== s[t]) return t;
                    for (t = t.charAt(0).toUpperCase() + t.substr(1), i = ["O", "Moz", "ms", "Ms", "Webkit"], r = 5; --r > -1 && void 0 === s[i[r] + t];);
                    return r >= 0 ? (U = 3 === r ? "ms" : i[r], G = "-" + U.toLowerCase() + "-", U + t) : null
                },
                H = X.defaultView ? X.defaultView.getComputedStyle : function() {},
                Q = a.getStyle = function(t, e, i, r, s) {
                    var n;
                    return W || "opacity" !== e ? (!r && t.style[e] ? n = t.style[e] : (i = i || H(t)) ? n = i[e] || i.getPropertyValue(e) || i.getPropertyValue(e.replace(S, "-$1").toLowerCase()) : t.currentStyle && (n = t.currentStyle[e]), null == s || n && "none" !== n && "auto" !== n && "auto auto" !== n ? n : s) : V(t)
                },
                Z = E.convertToPixels = function(t, i, r, s, n) {
                    if ("px" === s || !s) return r;
                    if ("auto" === s || !r) return 0;
                    var o, l, h, u = R.test(i),
                        f = t,
                        c = B.style,
                        _ = 0 > r;
                    if (_ && (r = -r), "%" === s && -1 !== i.indexOf("border")) o = r / 100 * (u ? t.clientWidth : t.clientHeight);
                    else {
                        if (c.cssText = "border:0 solid red;position:" + Q(t, "position") + ";line-height:0;", "%" !== s && f.appendChild && "v" !== s.charAt(0) && "rem" !== s) c[u ? "borderLeftWidth" : "borderTopWidth"] = r + s;
                        else {
                            if (f = t.parentNode || X.body, l = f._gsCache, h = e.ticker.frame, l && u && l.time === h) return l.width * r / 100;
                            c[u ? "width" : "height"] = r + s
                        }
                        f.appendChild(B), o = parseFloat(B[u ? "offsetWidth" : "offsetHeight"]), f.removeChild(B), u && "%" === s && a.cacheWidths !== !1 && (l = f._gsCache = f._gsCache || {}, l.time = h, l.width = 100 * (o / r)), 0 !== o || n || (o = Z(t, i, r, s, !0))
                    }
                    return _ ? -o : o
                },
                $ = E.calculateOffset = function(t, e, i) {
                    if ("absolute" !== Q(t, "position", i)) return 0;
                    var r = "left" === e ? "Left" : "Top",
                        s = Q(t, "margin" + r, i);
                    return t["offset" + r] - (Z(t, e, parseFloat(s), s.replace(x, "")) || 0)
                },
                K = function(t, e) {
                    var i, r, s, n = {};
                    if (e = e || H(t, null))
                        if (i = e.length)
                            for (; --i > -1;) s = e[i], (-1 === s.indexOf("-transform") || Se === s) && (n[s.replace(O, k)] = e.getPropertyValue(s));
                        else
                            for (i in e)(-1 === i.indexOf("Transform") || Pe === i) && (n[i] = e[i]);
                    else if (e = t.currentStyle || t.style)
                        for (i in e) "string" == typeof i && void 0 === n[i] && (n[i.replace(O, k)] = e[i]);
                    return W || (n.opacity = V(t)), r = ze(t, e, !1), n.rotation = r.rotation, n.skewX = r.skewX, n.scaleX = r.scaleX, n.scaleY = r.scaleY, n.x = r.x, n.y = r.y, Ce && (n.z = r.z, n.rotationX = r.rotationX, n.rotationY = r.rotationY, n.scaleZ = r.scaleZ), n.filters && delete n.filters, n
                },
                J = function(t, e, i, r, s) {
                    var n, a, o, l = {},
                        h = t.style;
                    for (a in i) "cssText" !== a && "length" !== a && isNaN(a) && (e[a] !== (n = i[a]) || s && s[a]) && -1 === a.indexOf("Origin") && ("number" == typeof n || "string" == typeof n) && (l[a] = "auto" !== n || "left" !== a && "top" !== a ? "" !== n && "auto" !== n && "none" !== n || "string" != typeof e[a] || "" === e[a].replace(y, "") ? n : 0 : $(t, a), void 0 !== h[a] && (o = new pe(h, a, h[a], o)));
                    if (r)
                        for (a in r) "className" !== a && (l[a] = r[a]);
                    return {
                        difs: l,
                        firstMPT: o
                    }
                },
                te = {
                    width: ["Left", "Right"],
                    height: ["Top", "Bottom"]
                },
                ee = ["marginLeft", "marginRight", "marginTop", "marginBottom"],
                ie = function(t, e, i) {
                    var r = parseFloat("width" === e ? t.offsetWidth : t.offsetHeight),
                        s = te[e],
                        n = s.length;
                    for (i = i || H(t, null); --n > -1;) r -= parseFloat(Q(t, "padding" + s[n], i, !0)) || 0, r -= parseFloat(Q(t, "border" + s[n] + "Width", i, !0)) || 0;
                    return r
                },
                re = function(t, e) {
                    if ("contain" === t || "auto" === t || "auto auto" === t) return t + " ";
                    (null == t || "" === t) && (t = "0 0");
                    var i = t.split(" "),
                        r = -1 !== t.indexOf("left") ? "0%" : -1 !== t.indexOf("right") ? "100%" : i[0],
                        s = -1 !== t.indexOf("top") ? "0%" : -1 !== t.indexOf("bottom") ? "100%" : i[1];
                    return null == s ? s = "center" === r ? "50%" : "0" : "center" === s && (s = "50%"), ("center" === r || isNaN(parseFloat(r)) && -1 === (r + "").indexOf("=")) && (r = "50%"), t = r + " " + s + (i.length > 2 ? " " + i[2] : ""), e && (e.oxp = -1 !== r.indexOf("%"), e.oyp = -1 !== s.indexOf("%"), e.oxr = "=" === r.charAt(1), e.oyr = "=" === s.charAt(1), e.ox = parseFloat(r.replace(y, "")), e.oy = parseFloat(s.replace(y, "")), e.v = t), e || t
                },
                se = function(t, e) {
                    return "string" == typeof t && "=" === t.charAt(1) ? parseInt(t.charAt(0) + "1", 10) * parseFloat(t.substr(2)) : parseFloat(t) - parseFloat(e)
                },
                ne = function(t, e) {
                    return null == t ? e : "string" == typeof t && "=" === t.charAt(1) ? parseInt(t.charAt(0) + "1", 10) * parseFloat(t.substr(2)) + e : parseFloat(t)
                },
                ae = function(t, e, i, r) {
                    var s, n, a, o, l, h = 1e-6;
                    return null == t ? o = e : "number" == typeof t ? o = t : (s = 360, n = t.split("_"), l = "=" === t.charAt(1), a = (l ? parseInt(t.charAt(0) + "1", 10) * parseFloat(n[0].substr(2)) : parseFloat(n[0])) * (-1 === t.indexOf("rad") ? 1 : N) - (l ? 0 : e), n.length && (r && (r[i] = e + a), -1 !== t.indexOf("short") && (a %= s, a !== a % (s / 2) && (a = 0 > a ? a + s : a - s)), -1 !== t.indexOf("_cw") && 0 > a ? a = (a + 9999999999 * s) % s - (0 | a / s) * s : -1 !== t.indexOf("ccw") && a > 0 && (a = (a - 9999999999 * s) % s - (0 | a / s) * s)), o = e + a), h > o && o > -h && (o = 0), o
                },
                oe = {
                    aqua: [0, 255, 255],
                    lime: [0, 255, 0],
                    silver: [192, 192, 192],
                    black: [0, 0, 0],
                    maroon: [128, 0, 0],
                    teal: [0, 128, 128],
                    blue: [0, 0, 255],
                    navy: [0, 0, 128],
                    white: [255, 255, 255],
                    fuchsia: [255, 0, 255],
                    olive: [128, 128, 0],
                    yellow: [255, 255, 0],
                    orange: [255, 165, 0],
                    gray: [128, 128, 128],
                    purple: [128, 0, 128],
                    green: [0, 128, 0],
                    red: [255, 0, 0],
                    pink: [255, 192, 203],
                    cyan: [0, 255, 255],
                    transparent: [255, 255, 255, 0]
                },
                le = function(t, e, i) {
                    return t = 0 > t ? t + 1 : t > 1 ? t - 1 : t, 0 | 255 * (1 > 6 * t ? e + 6 * (i - e) * t : .5 > t ? i : 2 > 3 * t ? e + 6 * (i - e) * (2 / 3 - t) : e) + .5
                },
                he = a.parseColor = function(t, e) {
                    var i, r, s, n, a, o, l, h, u, f, c;
                    if (t)
                        if ("number" == typeof t) i = [t >> 16, 255 & t >> 8, 255 & t];
                        else {
                            if ("," === t.charAt(t.length - 1) && (t = t.substr(0, t.length - 1)), oe[t]) i = oe[t];
                            else if ("#" === t.charAt(0)) 4 === t.length && (r = t.charAt(1), s = t.charAt(2), n = t.charAt(3), t = "#" + r + r + s + s + n + n), t = parseInt(t.substr(1), 16), i = [t >> 16, 255 & t >> 8, 255 & t];
                            else if ("hsl" === t.substr(0, 3))
                                if (i = c = t.match(m), e) {
                                    if (-1 !== t.indexOf("=")) return t.match(g)
                                } else a = Number(i[0]) % 360 / 360, o = Number(i[1]) / 100, l = Number(i[2]) / 100, s = .5 >= l ? l * (o + 1) : l + o - l * o, r = 2 * l - s, i.length > 3 && (i[3] = Number(t[3])), i[0] = le(a + 1 / 3, r, s), i[1] = le(a, r, s), i[2] = le(a - 1 / 3, r, s);
                            else i = t.match(m) || oe.transparent;
                            i[0] = Number(i[0]), i[1] = Number(i[1]), i[2] = Number(i[2]), i.length > 3 && (i[3] = Number(i[3]))
                        } else i = oe.black;
                    return e && !c && (r = i[0] / 255, s = i[1] / 255, n = i[2] / 255, h = Math.max(r, s, n), u = Math.min(r, s, n), l = (h + u) / 2, h === u ? a = o = 0 : (f = h - u, o = l > .5 ? f / (2 - h - u) : f / (h + u), a = h === r ? (s - n) / f + (n > s ? 6 : 0) : h === s ? (n - r) / f + 2 : (r - s) / f + 4, a *= 60), i[0] = 0 | a + .5, i[1] = 0 | 100 * o + .5, i[2] = 0 | 100 * l + .5), i
                },
                ue = function(t, e) {
                    var i, r, s, n = t.match(fe) || [],
                        a = 0,
                        o = n.length ? "" : t;
                    for (i = 0; n.length > i; i++) r = n[i], s = t.substr(a, t.indexOf(r, a) - a), a += s.length + r.length, r = he(r, e), 3 === r.length && r.push(1), o += s + (e ? "hsla(" + r[0] + "," + r[1] + "%," + r[2] + "%," + r[3] : "rgba(" + r.join(",")) + ")";
                    return o
                },
                fe = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#.+?\\b";
            for (h in oe) fe += "|" + h + "\\b";
            fe = RegExp(fe + ")", "gi"), a.colorStringFilter = function(t) {
                var e, i = t[0] + t[1];
                fe.lastIndex = 0, fe.test(i) && (e = -1 !== i.indexOf("hsl(") || -1 !== i.indexOf("hsla("), t[0] = ue(t[0], e), t[1] = ue(t[1], e))
            }, e.defaultStringFilter || (e.defaultStringFilter = a.colorStringFilter);
            var ce = function(t, e, i, r) {
                    if (null == t) return function(t) {
                        return t
                    };
                    var s, n = e ? (t.match(fe) || [""])[0] : "",
                        a = t.split(n).join("").match(v) || [],
                        o = t.substr(0, t.indexOf(a[0])),
                        l = ")" === t.charAt(t.length - 1) ? ")" : "",
                        h = -1 !== t.indexOf(" ") ? " " : ",",
                        u = a.length,
                        f = u > 0 ? a[0].replace(m, "") : "";
                    return u ? s = e ? function(t) {
                        var e, c, _, p;
                        if ("number" == typeof t) t += f;
                        else if (r && D.test(t)) {
                            for (p = t.replace(D, "|").split("|"), _ = 0; p.length > _; _++) p[_] = s(p[_]);
                            return p.join(",")
                        }
                        if (e = (t.match(fe) || [n])[0], c = t.split(e).join("").match(v) || [], _ = c.length, u > _--)
                            for (; u > ++_;) c[_] = i ? c[0 | (_ - 1) / 2] : a[_];
                        return o + c.join(h) + h + e + l + (-1 !== t.indexOf("inset") ? " inset" : "")
                    } : function(t) {
                        var e, n, c;
                        if ("number" == typeof t) t += f;
                        else if (r && D.test(t)) {
                            for (n = t.replace(D, "|").split("|"), c = 0; n.length > c; c++) n[c] = s(n[c]);
                            return n.join(",")
                        }
                        if (e = t.match(v) || [], c = e.length, u > c--)
                            for (; u > ++c;) e[c] = i ? e[0 | (c - 1) / 2] : a[c];
                        return o + e.join(h) + l
                    } : function(t) {
                        return t
                    }
                },
                _e = function(t) {
                    return t = t.split(","),
                        function(e, i, r, s, n, a, o) {
                            var l, h = (i + "").split(" ");
                            for (o = {}, l = 0; 4 > l; l++) o[t[l]] = h[l] = h[l] || h[(l - 1) / 2 >> 0];
                            return s.parse(e, o, n, a)
                        }
                },
                pe = (E._setPluginRatio = function(t) {
                    this.plugin.setRatio(t);
                    for (var e, i, r, s, n = this.data, a = n.proxy, o = n.firstMPT, l = 1e-6; o;) e = a[o.v], o.r ? e = Math.round(e) : l > e && e > -l && (e = 0), o.t[o.p] = e, o = o._next;
                    if (n.autoRotate && (n.autoRotate.rotation = a.rotation), 1 === t)
                        for (o = n.firstMPT; o;) {
                            if (i = o.t, i.type) {
                                if (1 === i.type) {
                                    for (s = i.xs0 + i.s + i.xs1, r = 1; i.l > r; r++) s += i["xn" + r] + i["xs" + (r + 1)];
                                    i.e = s
                                }
                            } else i.e = i.s + i.xs0;
                            o = o._next
                        }
                }, function(t, e, i, r, s) {
                    this.t = t, this.p = e, this.v = i, this.r = s, r && (r._prev = this, this._next = r)
                }),
                de = (E._parseToProxy = function(t, e, i, r, s, n) {
                    var a, o, l, h, u, f = r,
                        c = {},
                        _ = {},
                        p = i._transform,
                        d = F;
                    for (i._transform = null, F = e, r = u = i.parse(t, e, r, s), F = d, n && (i._transform = p, f && (f._prev = null, f._prev && (f._prev._next = null))); r && r !== f;) {
                        if (1 >= r.type && (o = r.p, _[o] = r.s + r.c, c[o] = r.s, n || (h = new pe(r, "s", o, h, r.r), r.c = 0), 1 === r.type))
                            for (a = r.l; --a > 0;) l = "xn" + a, o = r.p + "_" + l, _[o] = r.data[l], c[o] = r[l], n || (h = new pe(r, l, o, h, r.rxp[l]));
                        r = r._next
                    }
                    return {
                        proxy: c,
                        end: _,
                        firstMPT: h,
                        pt: u
                    }
                }, E.CSSPropTween = function(t, e, r, s, a, o, l, h, u, f, c) {
                    this.t = t, this.p = e, this.s = r, this.c = s, this.n = l || e, t instanceof de || n.push(this.n), this.r = h, this.type = o || 0, u && (this.pr = u, i = !0), this.b = void 0 === f ? r : f, this.e = void 0 === c ? r + s : c, a && (this._next = a, a._prev = this)
                }),
                me = function(t, e, i, r, s, n) {
                    var a = new de(t, e, i, r - i, s, -1, n);
                    return a.b = i, a.e = a.xs0 = r, a
                },
                ge = a.parseComplex = function(t, e, i, r, s, n, a, o, l, h) {
                    i = i || n || "", a = new de(t, e, 0, 0, a, h ? 2 : 1, null, !1, o, i, r), r += "";
                    var f, c, _, p, d, v, y, x, T, w, b, P, S, O = i.split(", ").join(",").split(" "),
                        C = r.split(", ").join(",").split(" "),
                        k = O.length,
                        R = u !== !1;
                    for ((-1 !== r.indexOf(",") || -1 !== i.indexOf(",")) && (O = O.join(" ").replace(D, ", ").split(" "), C = C.join(" ").replace(D, ", ").split(" "), k = O.length), k !== C.length && (O = (n || "").split(" "), k = O.length), a.plugin = l, a.setRatio = h, fe.lastIndex = 0, f = 0; k > f; f++)
                        if (p = O[f], d = C[f], x = parseFloat(p), x || 0 === x) a.appendXtra("", x, se(d, x), d.replace(g, ""), R && -1 !== d.indexOf("px"), !0);
                        else if (s && fe.test(p)) P = "," === d.charAt(d.length - 1) ? ")," : ")", S = -1 !== d.indexOf("hsl") && W, p = he(p, S), d = he(d, S), T = p.length + d.length > 6, T && !W && 0 === d[3] ? (a["xs" + a.l] += a.l ? " transparent" : "transparent", a.e = a.e.split(C[f]).join("transparent")) : (W || (T = !1), S ? a.appendXtra(T ? "hsla(" : "hsl(", p[0], se(d[0], p[0]), ",", !1, !0).appendXtra("", p[1], se(d[1], p[1]), "%,", !1).appendXtra("", p[2], se(d[2], p[2]), T ? "%," : "%" + P, !1) : a.appendXtra(T ? "rgba(" : "rgb(", p[0], d[0] - p[0], ",", !0, !0).appendXtra("", p[1], d[1] - p[1], ",", !0).appendXtra("", p[2], d[2] - p[2], T ? "," : P, !0), T && (p = 4 > p.length ? 1 : p[3], a.appendXtra("", p, (4 > d.length ? 1 : d[3]) - p, P, !1))), fe.lastIndex = 0;
                    else if (v = p.match(m)) {
                        if (y = d.match(g), !y || y.length !== v.length) return a;
                        for (_ = 0, c = 0; v.length > c; c++) b = v[c], w = p.indexOf(b, _), a.appendXtra(p.substr(_, w - _), Number(b), se(y[c], b), "", R && "px" === p.substr(w + b.length, 2), 0 === c), _ = w + b.length;
                        a["xs" + a.l] += p.substr(_)
                    } else a["xs" + a.l] += a.l ? " " + p : p;
                    if (-1 !== r.indexOf("=") && a.data) {
                        for (P = a.xs0 + a.data.s, f = 1; a.l > f; f++) P += a["xs" + f] + a.data["xn" + f];
                        a.e = P + a["xs" + f]
                    }
                    return a.l || (a.type = -1, a.xs0 = a.e), a.xfirst || a
                },
                ve = 9;
            for (h = de.prototype, h.l = h.pr = 0; --ve > 0;) h["xn" + ve] = 0, h["xs" + ve] = "";
            h.xs0 = "", h._next = h._prev = h.xfirst = h.data = h.plugin = h.setRatio = h.rxp = null, h.appendXtra = function(t, e, i, r, s, n) {
                var a = this,
                    o = a.l;
                return a["xs" + o] += n && o ? " " + t : t || "", i || 0 === o || a.plugin ? (a.l++, a.type = a.setRatio ? 2 : 1, a["xs" + a.l] = r || "", o > 0 ? (a.data["xn" + o] = e + i, a.rxp["xn" + o] = s, a["xn" + o] = e, a.plugin || (a.xfirst = new de(a, "xn" + o, e, i, a.xfirst || a, 0, a.n, s, a.pr), a.xfirst.xs0 = 0), a) : (a.data = {
                    s: e + i
                }, a.rxp = {}, a.s = e, a.c = i, a.r = s, a)) : (a["xs" + o] += e + (r || ""), a)
            };
            var ye = function(t, e) {
                    e = e || {}, this.p = e.prefix ? q(t) || t : t, l[t] = l[this.p] = this, this.format = e.formatter || ce(e.defaultValue, e.color, e.collapsible, e.multi), e.parser && (this.parse = e.parser), this.clrs = e.color, this.multi = e.multi, this.keyword = e.keyword, this.dflt = e.defaultValue, this.pr = e.priority || 0
                },
                xe = E._registerComplexSpecialProp = function(t, e, i) {
                    "object" != typeof e && (e = {
                        parser: i
                    });
                    var r, s, n = t.split(","),
                        a = e.defaultValue;
                    for (i = i || [a], r = 0; n.length > r; r++) e.prefix = 0 === r && e.prefix, e.defaultValue = i[r] || a, s = new ye(n[r], e)
                },
                Te = function(t) {
                    if (!l[t]) {
                        var e = t.charAt(0).toUpperCase() + t.substr(1) + "Plugin";
                        xe(t, {
                            parser: function(t, i, r, s, n, a, h) {
                                var u = o.com.greensock.plugins[e];
                                return u ? (u._cssRegister(), l[r].parse(t, i, r, s, n, a, h)) : (j("Error: " + e + " js file not loaded."), n)
                            }
                        })
                    }
                };
            h = ye.prototype, h.parseComplex = function(t, e, i, r, s, n) {
                var a, o, l, h, u, f, c = this.keyword;
                if (this.multi && (D.test(i) || D.test(e) ? (o = e.replace(D, "|").split("|"), l = i.replace(D, "|").split("|")) : c && (o = [e], l = [i])), l) {
                    for (h = l.length > o.length ? l.length : o.length, a = 0; h > a; a++) e = o[a] = o[a] || this.dflt, i = l[a] = l[a] || this.dflt, c && (u = e.indexOf(c), f = i.indexOf(c), u !== f && (-1 === f ? o[a] = o[a].split(c).join("") : -1 === u && (o[a] += " " + c)));
                    e = o.join(", "), i = l.join(", ")
                }
                return ge(t, this.p, e, i, this.clrs, this.dflt, r, this.pr, s, n)
            }, h.parse = function(t, e, i, r, n, a) {
                return this.parseComplex(t.style, this.format(Q(t, this.p, s, !1, this.dflt)), this.format(e), n, a)
            }, a.registerSpecialProp = function(t, e, i) {
                xe(t, {
                    parser: function(t, r, s, n, a, o) {
                        var l = new de(t, s, 0, 0, a, 2, s, !1, i);
                        return l.plugin = o, l.setRatio = e(t, r, n._tween, s), l
                    },
                    priority: i
                })
            }, a.useSVGTransformAttr = c || _;
            var we, be = "scaleX,scaleY,scaleZ,x,y,z,skewX,skewY,rotation,rotationX,rotationY,perspective,xPercent,yPercent".split(","),
                Pe = q("transform"),
                Se = G + "transform",
                Oe = q("transformOrigin"),
                Ce = null !== q("perspective"),
                ke = E.Transform = function() {
                    this.perspective = parseFloat(a.defaultTransformPerspective) || 0, this.force3D = a.defaultForce3D !== !1 && Ce ? a.defaultForce3D || "auto" : !1
                },
                Re = window.SVGElement,
                Ae = function(t, e, i) {
                    var r, s = X.createElementNS("http://www.w3.org/2000/svg", t),
                        n = /([a-z])([A-Z])/g;
                    for (r in i) s.setAttributeNS(null, r.replace(n, "$1-$2").toLowerCase(), i[r]);
                    return e.appendChild(s), s
                },
                Me = X.documentElement,
                De = function() {
                    var t, e, i, r = d || /Android/i.test(Y) && !window.chrome;
                    return X.createElementNS && !r && (t = Ae("svg", Me), e = Ae("rect", t, {
                        width: 100,
                        height: 50,
                        x: 100
                    }), i = e.getBoundingClientRect().width, e.style[Oe] = "50% 50%", e.style[Pe] = "scaleX(0.5)", r = i === e.getBoundingClientRect().width && !(_ && Ce), Me.removeChild(t)), r
                }(),
                Le = function(t, e, i, r, s) {
                    var n, o, l, h, u, f, c, _, p, d, m, g, v, y, x = t._gsTransform,
                        T = Xe(t, !0);
                    x && (v = x.xOrigin, y = x.yOrigin), (!r || 2 > (n = r.split(" ")).length) && (c = t.getBBox(), e = re(e).split(" "), n = [(-1 !== e[0].indexOf("%") ? parseFloat(e[0]) / 100 * c.width : parseFloat(e[0])) + c.x, (-1 !== e[1].indexOf("%") ? parseFloat(e[1]) / 100 * c.height : parseFloat(e[1])) + c.y]), i.xOrigin = h = parseFloat(n[0]), i.yOrigin = u = parseFloat(n[1]), r && T !== Fe && (f = T[0], c = T[1], _ = T[2], p = T[3], d = T[4], m = T[5], g = f * p - c * _, o = h * (p / g) + u * (-_ / g) + (_ * m - p * d) / g, l = h * (-c / g) + u * (f / g) - (f * m - c * d) / g, h = i.xOrigin = n[0] = o, u = i.yOrigin = n[1] = l), x && (s || s !== !1 && a.defaultSmoothOrigin !== !1 ? (o = h - v, l = u - y, x.xOffset += o * T[0] + l * T[2] - o, x.yOffset += o * T[1] + l * T[3] - l) : x.xOffset = x.yOffset = 0), t.setAttribute("data-svg-origin", n.join(" "))
                },
                Ne = function(t) {
                    return !!(Re && "function" == typeof t.getBBox && t.getCTM && (!t.parentNode || t.parentNode.getBBox && t.parentNode.getCTM))
                },
                Fe = [1, 0, 0, 1, 0, 0],
                Xe = function(t, e) {
                    var i, r, s, n, a, o = t._gsTransform || new ke,
                        l = 1e5;
                    if (Pe ? r = Q(t, Se, null, !0) : t.currentStyle && (r = t.currentStyle.filter.match(A), r = r && 4 === r.length ? [r[0].substr(4), Number(r[2].substr(4)), Number(r[1].substr(4)), r[3].substr(4), o.x || 0, o.y || 0].join(",") : ""), i = !r || "none" === r || "matrix(1, 0, 0, 1, 0, 0)" === r, (o.svg || t.getBBox && Ne(t)) && (i && -1 !== (t.style[Pe] + "").indexOf("matrix") && (r = t.style[Pe], i = 0), s = t.getAttribute("transform"), i && s && (-1 !== s.indexOf("matrix") ? (r = s, i = 0) : -1 !== s.indexOf("translate") && (r = "matrix(1,0,0,1," + s.match(/(?:\-|\b)[\d\-\.e]+\b/gi).join(",") + ")", i = 0))), i) return Fe;
                    for (s = (r || "").match(/(?:\-|\b)[\d\-\.e]+\b/gi) || [], ve = s.length; --ve > -1;) n = Number(s[ve]), s[ve] = (a = n - (n |= 0)) ? (0 | a * l + (0 > a ? -.5 : .5)) / l + n : n;
                    return e && s.length > 6 ? [s[0], s[1], s[4], s[5], s[12], s[13]] : s
                },
                ze = E.getTransform = function(t, i, r, n) {
                    if (t._gsTransform && r && !n) return t._gsTransform;
                    var o, l, h, u, f, c, _ = r ? t._gsTransform || new ke : new ke,
                        p = 0 > _.scaleX,
                        d = 2e-5,
                        m = 1e5,
                        g = Ce ? parseFloat(Q(t, Oe, i, !1, "0 0 0").split(" ")[2]) || _.zOrigin || 0 : 0,
                        v = parseFloat(a.defaultTransformPerspective) || 0;
                    if (_.svg = !(!t.getBBox || !Ne(t)), _.svg && (Le(t, Q(t, Oe, s, !1, "50% 50%") + "", _, t.getAttribute("data-svg-origin")), we = a.useSVGTransformAttr || De), o = Xe(t), o !== Fe) {
                        if (16 === o.length) {
                            var y, x, T, w, b, P = o[0],
                                S = o[1],
                                O = o[2],
                                C = o[3],
                                k = o[4],
                                R = o[5],
                                A = o[6],
                                M = o[7],
                                D = o[8],
                                L = o[9],
                                F = o[10],
                                X = o[12],
                                z = o[13],
                                B = o[14],
                                I = o[11],
                                E = Math.atan2(A, F);
                            _.zOrigin && (B = -_.zOrigin, X = D * B - o[12], z = L * B - o[13], B = F * B + _.zOrigin - o[14]), _.rotationX = E * N, E && (w = Math.cos(-E), b = Math.sin(-E), y = k * w + D * b, x = R * w + L * b, T = A * w + F * b, D = k * -b + D * w, L = R * -b + L * w, F = A * -b + F * w, I = M * -b + I * w, k = y, R = x, A = T), E = Math.atan2(D, F), _.rotationY = E * N, E && (w = Math.cos(-E), b = Math.sin(-E), y = P * w - D * b, x = S * w - L * b, T = O * w - F * b, L = S * b + L * w, F = O * b + F * w, I = C * b + I * w, P = y, S = x, O = T), E = Math.atan2(S, P), _.rotation = E * N, E && (w = Math.cos(-E), b = Math.sin(-E), P = P * w + k * b, x = S * w + R * b, R = S * -b + R * w, A = O * -b + A * w, S = x), _.rotationX && Math.abs(_.rotationX) + Math.abs(_.rotation) > 359.9 && (_.rotationX = _.rotation = 0, _.rotationY += 180), _.scaleX = (0 | Math.sqrt(P * P + S * S) * m + .5) / m, _.scaleY = (0 | Math.sqrt(R * R + L * L) * m + .5) / m, _.scaleZ = (0 | Math.sqrt(A * A + F * F) * m + .5) / m, _.skewX = 0, _.perspective = I ? 1 / (0 > I ? -I : I) : 0, _.x = X, _.y = z, _.z = B, _.svg && (_.x -= _.xOrigin - (_.xOrigin * P - _.yOrigin * k), _.y -= _.yOrigin - (_.yOrigin * S - _.xOrigin * R))
                        } else if (!(Ce && !n && o.length && _.x === o[4] && _.y === o[5] && (_.rotationX || _.rotationY) || void 0 !== _.x && "none" === Q(t, "display", i))) {
                            var Y = o.length >= 6,
                                W = Y ? o[0] : 1,
                                V = o[1] || 0,
                                j = o[2] || 0,
                                G = Y ? o[3] : 1;
                            _.x = o[4] || 0, _.y = o[5] || 0, h = Math.sqrt(W * W + V * V), u = Math.sqrt(G * G + j * j), f = W || V ? Math.atan2(V, W) * N : _.rotation || 0, c = j || G ? Math.atan2(j, G) * N + f : _.skewX || 0, Math.abs(c) > 90 && 270 > Math.abs(c) && (p ? (h *= -1, c += 0 >= f ? 180 : -180, f += 0 >= f ? 180 : -180) : (u *= -1, c += 0 >= c ? 180 : -180)), _.scaleX = h, _.scaleY = u, _.rotation = f, _.skewX = c, Ce && (_.rotationX = _.rotationY = _.z = 0, _.perspective = v, _.scaleZ = 1), _.svg && (_.x -= _.xOrigin - (_.xOrigin * W + _.yOrigin * j), _.y -= _.yOrigin - (_.xOrigin * V + _.yOrigin * G))
                        }
                        _.zOrigin = g;
                        for (l in _) d > _[l] && _[l] > -d && (_[l] = 0)
                    }
                    return r && (t._gsTransform = _, _.svg && (we && t.style[Pe] ? e.delayedCall(.001, function() {
                        Ye(t.style, Pe)
                    }) : !we && t.getAttribute("transform") && e.delayedCall(.001, function() {
                        t.removeAttribute("transform")
                    }))), _
                },
                Be = function(t) {
                    var e, i, r = this.data,
                        s = -r.rotation * L,
                        n = s + r.skewX * L,
                        a = 1e5,
                        o = (0 | Math.cos(s) * r.scaleX * a) / a,
                        l = (0 | Math.sin(s) * r.scaleX * a) / a,
                        h = (0 | Math.sin(n) * -r.scaleY * a) / a,
                        u = (0 | Math.cos(n) * r.scaleY * a) / a,
                        f = this.t.style,
                        c = this.t.currentStyle;
                    if (c) {
                        i = l, l = -h, h = -i, e = c.filter, f.filter = "";
                        var _, p, m = this.t.offsetWidth,
                            g = this.t.offsetHeight,
                            v = "absolute" !== c.position,
                            y = "progid:DXImageTransform.Microsoft.Matrix(M11=" + o + ", M12=" + l + ", M21=" + h + ", M22=" + u,
                            w = r.x + m * r.xPercent / 100,
                            b = r.y + g * r.yPercent / 100;
                        if (null != r.ox && (_ = (r.oxp ? .01 * m * r.ox : r.ox) - m / 2, p = (r.oyp ? .01 * g * r.oy : r.oy) - g / 2, w += _ - (_ * o + p * l), b += p - (_ * h + p * u)), v ? (_ = m / 2, p = g / 2, y += ", Dx=" + (_ - (_ * o + p * l) + w) + ", Dy=" + (p - (_ * h + p * u) + b) + ")") : y += ", sizingMethod='auto expand')", f.filter = -1 !== e.indexOf("DXImageTransform.Microsoft.Matrix(") ? e.replace(M, y) : y + " " + e, (0 === t || 1 === t) && 1 === o && 0 === l && 0 === h && 1 === u && (v && -1 === y.indexOf("Dx=0, Dy=0") || T.test(e) && 100 !== parseFloat(RegExp.$1) || -1 === e.indexOf("gradient(" && e.indexOf("Alpha")) && f.removeAttribute("filter")), !v) {
                            var P, S, O, C = 8 > d ? 1 : -1;
                            for (_ = r.ieOffsetX || 0, p = r.ieOffsetY || 0, r.ieOffsetX = Math.round((m - ((0 > o ? -o : o) * m + (0 > l ? -l : l) * g)) / 2 + w), r.ieOffsetY = Math.round((g - ((0 > u ? -u : u) * g + (0 > h ? -h : h) * m)) / 2 + b), ve = 0; 4 > ve; ve++) S = ee[ve], P = c[S], i = -1 !== P.indexOf("px") ? parseFloat(P) : Z(this.t, S, parseFloat(P), P.replace(x, "")) || 0, O = i !== r[S] ? 2 > ve ? -r.ieOffsetX : -r.ieOffsetY : 2 > ve ? _ - r.ieOffsetX : p - r.ieOffsetY, f[S] = (r[S] = Math.round(i - O * (0 === ve || 2 === ve ? 1 : C))) + "px"
                        }
                    }
                },
                Ie = E.set3DTransformRatio = E.setTransformRatio = function(t) {
                    var e, i, r, s, n, a, o, l, h, u, f, c, p, d, m, g, v, y, x, T, w, b, P, S = this.data,
                        O = this.t.style,
                        C = S.rotation,
                        k = S.rotationX,
                        R = S.rotationY,
                        A = S.scaleX,
                        M = S.scaleY,
                        D = S.scaleZ,
                        N = S.x,
                        F = S.y,
                        X = S.z,
                        z = S.svg,
                        B = S.perspective,
                        I = S.force3D;
                    if (!(((1 !== t && 0 !== t || "auto" !== I || this.tween._totalTime !== this.tween._totalDuration && this.tween._totalTime) && I || X || B || R || k) && (!we || !z) && Ce)) return C || S.skewX || z ? (C *= L, b = S.skewX * L, P = 1e5, e = Math.cos(C) * A, s = Math.sin(C) * A, i = Math.sin(C - b) * -M, n = Math.cos(C - b) * M, b && "simple" === S.skewType && (v = Math.tan(b), v = Math.sqrt(1 + v * v), i *= v, n *= v, S.skewY && (e *= v, s *= v)), z && (N += S.xOrigin - (S.xOrigin * e + S.yOrigin * i) + S.xOffset, F += S.yOrigin - (S.xOrigin * s + S.yOrigin * n) + S.yOffset, we && (S.xPercent || S.yPercent) && (d = this.t.getBBox(), N += .01 * S.xPercent * d.width, F += .01 * S.yPercent * d.height), d = 1e-6, d > N && N > -d && (N = 0), d > F && F > -d && (F = 0)), x = (0 | e * P) / P + "," + (0 | s * P) / P + "," + (0 | i * P) / P + "," + (0 | n * P) / P + "," + N + "," + F + ")", z && we ? this.t.setAttribute("transform", "matrix(" + x) : O[Pe] = (S.xPercent || S.yPercent ? "translate(" + S.xPercent + "%," + S.yPercent + "%) matrix(" : "matrix(") + x) : O[Pe] = (S.xPercent || S.yPercent ? "translate(" + S.xPercent + "%," + S.yPercent + "%) matrix(" : "matrix(") + A + ",0,0," + M + "," + N + "," + F + ")", void 0;
                    if (_ && (d = 1e-4, d > A && A > -d && (A = D = 2e-5), d > M && M > -d && (M = D = 2e-5), !B || S.z || S.rotationX || S.rotationY || (B = 0)), C || S.skewX) C *= L, m = e = Math.cos(C), g = s = Math.sin(C), S.skewX && (C -= S.skewX * L, m = Math.cos(C), g = Math.sin(C), "simple" === S.skewType && (v = Math.tan(S.skewX * L), v = Math.sqrt(1 + v * v), m *= v, g *= v, S.skewY && (e *= v, s *= v))), i = -g, n = m;
                    else {
                        if (!(R || k || 1 !== D || B || z)) return O[Pe] = (S.xPercent || S.yPercent ? "translate(" + S.xPercent + "%," + S.yPercent + "%) translate3d(" : "translate3d(") + N + "px," + F + "px," + X + "px)" + (1 !== A || 1 !== M ? " scale(" + A + "," + M + ")" : ""), void 0;
                        e = n = 1, i = s = 0
                    }
                    h = 1, r = a = o = l = u = f = 0, c = B ? -1 / B : 0, p = S.zOrigin, d = 1e-6, T = ",", w = "0", C = R * L, C && (m = Math.cos(C), g = Math.sin(C), o = -g, u = c * -g, r = e * g, a = s * g, h = m, c *= m, e *= m, s *= m), C = k * L, C && (m = Math.cos(C), g = Math.sin(C), v = i * m + r * g, y = n * m + a * g, l = h * g, f = c * g, r = i * -g + r * m, a = n * -g + a * m, h *= m, c *= m, i = v, n = y), 1 !== D && (r *= D, a *= D, h *= D, c *= D), 1 !== M && (i *= M, n *= M, l *= M, f *= M), 1 !== A && (e *= A, s *= A, o *= A, u *= A), (p || z) && (p && (N += r * -p, F += a * -p, X += h * -p + p), z && (N += S.xOrigin - (S.xOrigin * e + S.yOrigin * i) + S.xOffset, F += S.yOrigin - (S.xOrigin * s + S.yOrigin * n) + S.yOffset), d > N && N > -d && (N = w), d > F && F > -d && (F = w), d > X && X > -d && (X = 0)), x = S.xPercent || S.yPercent ? "translate(" + S.xPercent + "%," + S.yPercent + "%) matrix3d(" : "matrix3d(", x += (d > e && e > -d ? w : e) + T + (d > s && s > -d ? w : s) + T + (d > o && o > -d ? w : o), x += T + (d > u && u > -d ? w : u) + T + (d > i && i > -d ? w : i) + T + (d > n && n > -d ? w : n), k || R ? (x += T + (d > l && l > -d ? w : l) + T + (d > f && f > -d ? w : f) + T + (d > r && r > -d ? w : r), x += T + (d > a && a > -d ? w : a) + T + (d > h && h > -d ? w : h) + T + (d > c && c > -d ? w : c) + T) : x += ",0,0,0,0,1,0,", x += N + T + F + T + X + T + (B ? 1 + -X / B : 1) + ")", O[Pe] = x
                };
            h = ke.prototype, h.x = h.y = h.z = h.skewX = h.skewY = h.rotation = h.rotationX = h.rotationY = h.zOrigin = h.xPercent = h.yPercent = h.xOffset = h.yOffset = 0, h.scaleX = h.scaleY = h.scaleZ = 1, xe("transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,svgOrigin,transformPerspective,directionalRotation,parseTransform,force3D,skewType,xPercent,yPercent,smoothOrigin", {
                parser: function(t, e, i, r, n, o, l) {
                    if (r._lastParsedTransform === l) return n;
                    r._lastParsedTransform = l;
                    var h, u, f, c, _, p, d, m, g, v, y = t._gsTransform,
                        x = t.style,
                        T = 1e-6,
                        w = be.length,
                        b = l,
                        P = {},
                        S = "transformOrigin";
                    if (l.display ? (c = Q(t, "display"), x.display = "block", h = ze(t, s, !0, l.parseTransform), x.display = c) : h = ze(t, s, !0, l.parseTransform), r._transform = h, "string" == typeof b.transform && Pe) c = B.style, c[Pe] = b.transform, c.display = "block", c.position = "absolute", X.body.appendChild(B), u = ze(B, null, !1), X.body.removeChild(B), u.perspective || (u.perspective = h.perspective), null != b.xPercent && (u.xPercent = ne(b.xPercent, h.xPercent)), null != b.yPercent && (u.yPercent = ne(b.yPercent, h.yPercent));
                    else if ("object" == typeof b) {
                        if (u = {
                                scaleX: ne(null != b.scaleX ? b.scaleX : b.scale, h.scaleX),
                                scaleY: ne(null != b.scaleY ? b.scaleY : b.scale, h.scaleY),
                                scaleZ: ne(b.scaleZ, h.scaleZ),
                                x: ne(b.x, h.x),
                                y: ne(b.y, h.y),
                                z: ne(b.z, h.z),
                                xPercent: ne(b.xPercent, h.xPercent),
                                yPercent: ne(b.yPercent, h.yPercent),
                                perspective: ne(b.transformPerspective, h.perspective)
                            }, m = b.directionalRotation, null != m)
                            if ("object" == typeof m)
                                for (c in m) b[c] = m[c];
                            else b.rotation = m;
                            "string" == typeof b.x && -1 !== b.x.indexOf("%") && (u.x = 0, u.xPercent = ne(b.x, h.xPercent)), "string" == typeof b.y && -1 !== b.y.indexOf("%") && (u.y = 0, u.yPercent = ne(b.y, h.yPercent)), u.rotation = ae("rotation" in b ? b.rotation : "shortRotation" in b ? b.shortRotation + "_short" : "rotationZ" in b ? b.rotationZ : h.rotation, h.rotation, "rotation", P), Ce && (u.rotationX = ae("rotationX" in b ? b.rotationX : "shortRotationX" in b ? b.shortRotationX + "_short" : h.rotationX || 0, h.rotationX, "rotationX", P), u.rotationY = ae("rotationY" in b ? b.rotationY : "shortRotationY" in b ? b.shortRotationY + "_short" : h.rotationY || 0, h.rotationY, "rotationY", P)), u.skewX = null == b.skewX ? h.skewX : ae(b.skewX, h.skewX), u.skewY = null == b.skewY ? h.skewY : ae(b.skewY, h.skewY), (f = u.skewY - h.skewY) && (u.skewX += f, u.rotation += f)
                    }
                    for (Ce && null != b.force3D && (h.force3D = b.force3D, d = !0), h.skewType = b.skewType || h.skewType || a.defaultSkewType, p = h.force3D || h.z || h.rotationX || h.rotationY || u.z || u.rotationX || u.rotationY || u.perspective, p || null == b.scale || (u.scaleZ = 1); --w > -1;) i = be[w], _ = u[i] - h[i], (_ > T || -T > _ || null != b[i] || null != F[i]) && (d = !0, n = new de(h, i, h[i], _, n), i in P && (n.e = P[i]), n.xs0 = 0, n.plugin = o, r._overwriteProps.push(n.n));
                    return _ = b.transformOrigin, h.svg && (_ || b.svgOrigin) && (g = h.xOffset, v = h.yOffset, Le(t, re(_), u, b.svgOrigin, b.smoothOrigin), n = me(h, "xOrigin", (y ? h : u).xOrigin, u.xOrigin, n, S), n = me(h, "yOrigin", (y ? h : u).yOrigin, u.yOrigin, n, S), (g !== h.xOffset || v !== h.yOffset) && (n = me(h, "xOffset", y ? g : h.xOffset, h.xOffset, n, S), n = me(h, "yOffset", y ? v : h.yOffset, h.yOffset, n, S)), _ = we ? null : "0px 0px"), (_ || Ce && p && h.zOrigin) && (Pe ? (d = !0, i = Oe, _ = (_ || Q(t, i, s, !1, "50% 50%")) + "", n = new de(x, i, 0, 0, n, -1, S), n.b = x[i], n.plugin = o, Ce ? (c = h.zOrigin, _ = _.split(" "), h.zOrigin = (_.length > 2 && (0 === c || "0px" !== _[2]) ? parseFloat(_[2]) : c) || 0, n.xs0 = n.e = _[0] + " " + (_[1] || "50%") + " 0px", n = new de(h, "zOrigin", 0, 0, n, -1, n.n), n.b = c, n.xs0 = n.e = h.zOrigin) : n.xs0 = n.e = _) : re(_ + "", h)), d && (r._transformType = h.svg && we || !p && 3 !== this._transformType ? 2 : 3), n
                },
                prefix: !0
            }), xe("boxShadow", {
                defaultValue: "0px 0px 0px 0px #999",
                prefix: !0,
                color: !0,
                multi: !0,
                keyword: "inset"
            }), xe("borderRadius", {
                defaultValue: "0px",
                parser: function(t, e, i, n, a) {
                    e = this.format(e);
                    var o, l, h, u, f, c, _, p, d, m, g, v, y, x, T, w, b = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"],
                        P = t.style;
                    for (d = parseFloat(t.offsetWidth), m = parseFloat(t.offsetHeight), o = e.split(" "), l = 0; b.length > l; l++) this.p.indexOf("border") && (b[l] = q(b[l])), f = u = Q(t, b[l], s, !1, "0px"), -1 !== f.indexOf(" ") && (u = f.split(" "), f = u[0], u = u[1]), c = h = o[l], _ = parseFloat(f), v = f.substr((_ + "").length), y = "=" === c.charAt(1), y ? (p = parseInt(c.charAt(0) + "1", 10), c = c.substr(2), p *= parseFloat(c), g = c.substr((p + "").length - (0 > p ? 1 : 0)) || "") : (p = parseFloat(c), g = c.substr((p + "").length)), "" === g && (g = r[i] || v), g !== v && (x = Z(t, "borderLeft", _, v), T = Z(t, "borderTop", _, v), "%" === g ? (f = 100 * (x / d) + "%", u = 100 * (T / m) + "%") : "em" === g ? (w = Z(t, "borderLeft", 1, "em"), f = x / w + "em", u = T / w + "em") : (f = x + "px", u = T + "px"), y && (c = parseFloat(f) + p + g, h = parseFloat(u) + p + g)), a = ge(P, b[l], f + " " + u, c + " " + h, !1, "0px", a);
                    return a
                },
                prefix: !0,
                formatter: ce("0px 0px 0px 0px", !1, !0)
            }), xe("backgroundPosition", {
                defaultValue: "0 0",
                parser: function(t, e, i, r, n, a) {
                    var o, l, h, u, f, c, _ = "background-position",
                        p = s || H(t, null),
                        m = this.format((p ? d ? p.getPropertyValue(_ + "-x") + " " + p.getPropertyValue(_ + "-y") : p.getPropertyValue(_) : t.currentStyle.backgroundPositionX + " " + t.currentStyle.backgroundPositionY) || "0 0"),
                        g = this.format(e);
                    if (-1 !== m.indexOf("%") != (-1 !== g.indexOf("%")) && (c = Q(t, "backgroundImage").replace(C, ""), c && "none" !== c)) {
                        for (o = m.split(" "), l = g.split(" "), I.setAttribute("src", c), h = 2; --h > -1;) m = o[h], u = -1 !== m.indexOf("%"), u !== (-1 !== l[h].indexOf("%")) && (f = 0 === h ? t.offsetWidth - I.width : t.offsetHeight - I.height, o[h] = u ? parseFloat(m) / 100 * f + "px" : 100 * (parseFloat(m) / f) + "%");
                        m = o.join(" ")
                    }
                    return this.parseComplex(t.style, m, g, n, a)
                },
                formatter: re
            }), xe("backgroundSize", {
                defaultValue: "0 0",
                formatter: re
            }), xe("perspective", {
                defaultValue: "0px",
                prefix: !0
            }), xe("perspectiveOrigin", {
                defaultValue: "50% 50%",
                prefix: !0
            }), xe("transformStyle", {
                prefix: !0
            }), xe("backfaceVisibility", {
                prefix: !0
            }), xe("userSelect", {
                prefix: !0
            }), xe("margin", {
                parser: _e("marginTop,marginRight,marginBottom,marginLeft")
            }), xe("padding", {
                parser: _e("paddingTop,paddingRight,paddingBottom,paddingLeft")
            }), xe("clip", {
                defaultValue: "rect(0px,0px,0px,0px)",
                parser: function(t, e, i, r, n, a) {
                    var o, l, h;
                    return 9 > d ? (l = t.currentStyle, h = 8 > d ? " " : ",", o = "rect(" + l.clipTop + h + l.clipRight + h + l.clipBottom + h + l.clipLeft + ")", e = this.format(e).split(",").join(h)) : (o = this.format(Q(t, this.p, s, !1, this.dflt)), e = this.format(e)), this.parseComplex(t.style, o, e, n, a)
                }
            }), xe("textShadow", {
                defaultValue: "0px 0px 0px #999",
                color: !0,
                multi: !0
            }), xe("autoRound,strictUnits", {
                parser: function(t, e, i, r, s) {
                    return s
                }
            }), xe("border", {
                defaultValue: "0px solid #000",
                parser: function(t, e, i, r, n, a) {
                    return this.parseComplex(t.style, this.format(Q(t, "borderTopWidth", s, !1, "0px") + " " + Q(t, "borderTopStyle", s, !1, "solid") + " " + Q(t, "borderTopColor", s, !1, "#000")), this.format(e), n, a)
                },
                color: !0,
                formatter: function(t) {
                    var e = t.split(" ");
                    return e[0] + " " + (e[1] || "solid") + " " + (t.match(fe) || ["#000"])[0]
                }
            }), xe("borderWidth", {
                parser: _e("borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth")
            }), xe("float,cssFloat,styleFloat", {
                parser: function(t, e, i, r, s) {
                    var n = t.style,
                        a = "cssFloat" in n ? "cssFloat" : "styleFloat";
                    return new de(n, a, 0, 0, s, -1, i, !1, 0, n[a], e)
                }
            });
            var Ee = function(t) {
                var e, i = this.t,
                    r = i.filter || Q(this.data, "filter") || "",
                    s = 0 | this.s + this.c * t;
                100 === s && (-1 === r.indexOf("atrix(") && -1 === r.indexOf("radient(") && -1 === r.indexOf("oader(") ? (i.removeAttribute("filter"), e = !Q(this.data, "filter")) : (i.filter = r.replace(b, ""), e = !0)), e || (this.xn1 && (i.filter = r = r || "alpha(opacity=" + s + ")"), -1 === r.indexOf("pacity") ? 0 === s && this.xn1 || (i.filter = r + " alpha(opacity=" + s + ")") : i.filter = r.replace(T, "opacity=" + s))
            };
            xe("opacity,alpha,autoAlpha", {
                defaultValue: "1",
                parser: function(t, e, i, r, n, a) {
                    var o = parseFloat(Q(t, "opacity", s, !1, "1")),
                        l = t.style,
                        h = "autoAlpha" === i;
                    return "string" == typeof e && "=" === e.charAt(1) && (e = ("-" === e.charAt(0) ? -1 : 1) * parseFloat(e.substr(2)) + o), h && 1 === o && "hidden" === Q(t, "visibility", s) && 0 !== e && (o = 0), W ? n = new de(l, "opacity", o, e - o, n) : (n = new de(l, "opacity", 100 * o, 100 * (e - o), n), n.xn1 = h ? 1 : 0, l.zoom = 1, n.type = 2, n.b = "alpha(opacity=" + n.s + ")", n.e = "alpha(opacity=" + (n.s + n.c) + ")", n.data = t, n.plugin = a, n.setRatio = Ee), h && (n = new de(l, "visibility", 0, 0, n, -1, null, !1, 0, 0 !== o ? "inherit" : "hidden", 0 === e ? "hidden" : "inherit"), n.xs0 = "inherit", r._overwriteProps.push(n.n), r._overwriteProps.push(i)), n
                }
            });
            var Ye = function(t, e) {
                    e && (t.removeProperty ? (("ms" === e.substr(0, 2) || "webkit" === e.substr(0, 6)) && (e = "-" + e), t.removeProperty(e.replace(S, "-$1").toLowerCase())) : t.removeAttribute(e))
                },
                We = function(t) {
                    if (this.t._gsClassPT = this, 1 === t || 0 === t) {
                        this.t.setAttribute("class", 0 === t ? this.b : this.e);
                        for (var e = this.data, i = this.t.style; e;) e.v ? i[e.p] = e.v : Ye(i, e.p), e = e._next;
                        1 === t && this.t._gsClassPT === this && (this.t._gsClassPT = null)
                    } else this.t.getAttribute("class") !== this.e && this.t.setAttribute("class", this.e)
                };
            xe("className", {
                parser: function(t, e, r, n, a, o, l) {
                    var h, u, f, c, _, p = t.getAttribute("class") || "",
                        d = t.style.cssText;
                    if (a = n._classNamePT = new de(t, r, 0, 0, a, 2), a.setRatio = We, a.pr = -11, i = !0, a.b = p, u = K(t, s), f = t._gsClassPT) {
                        for (c = {}, _ = f.data; _;) c[_.p] = 1, _ = _._next;
                        f.setRatio(1)
                    }
                    return t._gsClassPT = a, a.e = "=" !== e.charAt(1) ? e : p.replace(RegExp("\\s*\\b" + e.substr(2) + "\\b"), "") + ("+" === e.charAt(0) ? " " + e.substr(2) : ""), t.setAttribute("class", a.e), h = J(t, u, K(t), l, c), t.setAttribute("class", p), a.data = h.firstMPT, t.style.cssText = d, a = a.xfirst = n.parse(t, h.difs, a, o)
                }
            });
            var Ve = function(t) {
                if ((1 === t || 0 === t) && this.data._totalTime === this.data._totalDuration && "isFromStart" !== this.data.data) {
                    var e, i, r, s, n, a = this.t.style,
                        o = l.transform.parse;
                    if ("all" === this.e) a.cssText = "", s = !0;
                    else
                        for (e = this.e.split(" ").join("").split(","), r = e.length; --r > -1;) i = e[r], l[i] && (l[i].parse === o ? s = !0 : i = "transformOrigin" === i ? Oe : l[i].p), Ye(a, i);
                    s && (Ye(a, Pe), n = this.t._gsTransform, n && (n.svg && this.t.removeAttribute("data-svg-origin"), delete this.t._gsTransform))
                }
            };
            for (xe("clearProps", {
                    parser: function(t, e, r, s, n) {
                        return n = new de(t, r, 0, 0, n, 2), n.setRatio = Ve, n.e = e, n.pr = -10, n.data = s._tween, i = !0, n
                    }
                }), h = "bezier,throwProps,physicsProps,physics2D".split(","), ve = h.length; ve--;) Te(h[ve]);
            h = a.prototype, h._firstPT = h._lastParsedTransform = h._transform = null, h._onInitTween = function(t, e, o) {
                if (!t.nodeType) return !1;
                this._target = t, this._tween = o, this._vars = e, u = e.autoRound, i = !1, r = e.suffixMap || a.suffixMap, s = H(t, ""), n = this._overwriteProps;
                var h, _, d, m, g, v, y, x, T, b = t.style;
                if (f && "" === b.zIndex && (h = Q(t, "zIndex", s), ("auto" === h || "" === h) && this._addLazySet(b, "zIndex", 0)), "string" == typeof e && (m = b.cssText, h = K(t, s), b.cssText = m + ";" + e, h = J(t, h, K(t)).difs, !W && w.test(e) && (h.opacity = parseFloat(RegExp.$1)), e = h, b.cssText = m), this._firstPT = _ = e.className ? l.className.parse(t, e.className, "className", this, null, null, e) : this.parse(t, e, null), this._transformType) {
                    for (T = 3 === this._transformType, Pe ? c && (f = !0, "" === b.zIndex && (y = Q(t, "zIndex", s), ("auto" === y || "" === y) && this._addLazySet(b, "zIndex", 0)), p && this._addLazySet(b, "WebkitBackfaceVisibility", this._vars.WebkitBackfaceVisibility || (T ? "visible" : "hidden"))) : b.zoom = 1, d = _; d && d._next;) d = d._next;
                    x = new de(t, "transform", 0, 0, null, 2), this._linkCSSP(x, null, d), x.setRatio = Pe ? Ie : Be, x.data = this._transform || ze(t, s, !0), x.tween = o, x.pr = -1, n.pop()
                }
                if (i) {
                    for (; _;) {
                        for (v = _._next, d = m; d && d.pr > _.pr;) d = d._next;
                        (_._prev = d ? d._prev : g) ? _._prev._next = _: m = _, (_._next = d) ? d._prev = _ : g = _, _ = v
                    }
                    this._firstPT = m
                }
                return !0
            }, h.parse = function(t, e, i, n) {
                var a, o, h, f, c, _, p, d, m, g, v = t.style;
                for (a in e) _ = e[a], o = l[a], o ? i = o.parse(t, _, a, this, i, n, e) : (c = Q(t, a, s) + "", m = "string" == typeof _, "color" === a || "fill" === a || "stroke" === a || -1 !== a.indexOf("Color") || m && P.test(_) ? (m || (_ = he(_), _ = (_.length > 3 ? "rgba(" : "rgb(") + _.join(",") + ")"), i = ge(v, a, c, _, !0, "transparent", i, 0, n)) : !m || -1 === _.indexOf(" ") && -1 === _.indexOf(",") ? (h = parseFloat(c), p = h || 0 === h ? c.substr((h + "").length) : "", ("" === c || "auto" === c) && ("width" === a || "height" === a ? (h = ie(t, a, s), p = "px") : "left" === a || "top" === a ? (h = $(t, a, s), p = "px") : (h = "opacity" !== a ? 0 : 1, p = "")), g = m && "=" === _.charAt(1), g ? (f = parseInt(_.charAt(0) + "1", 10), _ = _.substr(2), f *= parseFloat(_), d = _.replace(x, "")) : (f = parseFloat(_), d = m ? _.replace(x, "") : ""), "" === d && (d = a in r ? r[a] : p), _ = f || 0 === f ? (g ? f + h : f) + d : e[a], p !== d && "" !== d && (f || 0 === f) && h && (h = Z(t, a, h, p), "%" === d ? (h /= Z(t, a, 100, "%") / 100, e.strictUnits !== !0 && (c = h + "%")) : "em" === d || "rem" === d ? h /= Z(t, a, 1, d) : "px" !== d && (f = Z(t, a, f, d), d = "px"), g && (f || 0 === f) && (_ = f + h + d)), g && (f += h), !h && 0 !== h || !f && 0 !== f ? void 0 !== v[a] && (_ || "NaN" != _ + "" && null != _) ? (i = new de(v, a, f || h || 0, 0, i, -1, a, !1, 0, c, _), i.xs0 = "none" !== _ || "display" !== a && -1 === a.indexOf("Style") ? _ : c) : j("invalid " + a + " tween value: " + e[a]) : (i = new de(v, a, h, f - h, i, 0, a, u !== !1 && ("px" === d || "zIndex" === a), 0, c, _), i.xs0 = d)) : i = ge(v, a, c, _, !0, null, i, 0, n)), n && i && !i.plugin && (i.plugin = n);
                return i
            }, h.setRatio = function(t) {
                var e, i, r, s = this._firstPT,
                    n = 1e-6;
                if (1 !== t || this._tween._time !== this._tween._duration && 0 !== this._tween._time)
                    if (t || this._tween._time !== this._tween._duration && 0 !== this._tween._time || this._tween._rawPrevTime === -1e-6)
                        for (; s;) {
                            if (e = s.c * t + s.s, s.r ? e = Math.round(e) : n > e && e > -n && (e = 0), s.type)
                                if (1 === s.type)
                                    if (r = s.l, 2 === r) s.t[s.p] = s.xs0 + e + s.xs1 + s.xn1 + s.xs2;
                                    else if (3 === r) s.t[s.p] = s.xs0 + e + s.xs1 + s.xn1 + s.xs2 + s.xn2 + s.xs3;
                            else if (4 === r) s.t[s.p] = s.xs0 + e + s.xs1 + s.xn1 + s.xs2 + s.xn2 + s.xs3 + s.xn3 + s.xs4;
                            else if (5 === r) s.t[s.p] = s.xs0 + e + s.xs1 + s.xn1 + s.xs2 + s.xn2 + s.xs3 + s.xn3 + s.xs4 + s.xn4 + s.xs5;
                            else {
                                for (i = s.xs0 + e + s.xs1, r = 1; s.l > r; r++) i += s["xn" + r] + s["xs" + (r + 1)];
                                s.t[s.p] = i
                            } else -1 === s.type ? s.t[s.p] = s.xs0 : s.setRatio && s.setRatio(t);
                            else s.t[s.p] = e + s.xs0;
                            s = s._next
                        } else
                            for (; s;) 2 !== s.type ? s.t[s.p] = s.b : s.setRatio(t), s = s._next;
                    else
                        for (; s;) {
                            if (2 !== s.type)
                                if (s.r && -1 !== s.type)
                                    if (e = Math.round(s.s + s.c), s.type) {
                                        if (1 === s.type) {
                                            for (r = s.l, i = s.xs0 + e + s.xs1, r = 1; s.l > r; r++) i += s["xn" + r] + s["xs" + (r + 1)];
                                            s.t[s.p] = i
                                        }
                                    } else s.t[s.p] = e + s.xs0;
                            else s.t[s.p] = s.e;
                            else s.setRatio(t);
                            s = s._next
                        }
            }, h._enableTransforms = function(t) {
                this._transform = this._transform || ze(this._target, s, !0), this._transformType = this._transform.svg && we || !t && 3 !== this._transformType ? 2 : 3
            };
            var je = function() {
                this.t[this.p] = this.e, this.data._linkCSSP(this, this._next, null, !0)
            };
            h._addLazySet = function(t, e, i) {
                var r = this._firstPT = new de(t, e, 0, 0, this._firstPT, 2);
                r.e = i, r.setRatio = je, r.data = this
            }, h._linkCSSP = function(t, e, i, r) {
                return t && (e && (e._prev = t), t._next && (t._next._prev = t._prev), t._prev ? t._prev._next = t._next : this._firstPT === t && (this._firstPT = t._next, r = !0), i ? i._next = t : r || null !== this._firstPT || (this._firstPT = t), t._next = e, t._prev = i), t
            }, h._kill = function(e) {
                var i, r, s, n = e;
                if (e.autoAlpha || e.alpha) {
                    n = {};
                    for (r in e) n[r] = e[r];
                    n.opacity = 1, n.autoAlpha && (n.visibility = 1)
                }
                return e.className && (i = this._classNamePT) && (s = i.xfirst, s && s._prev ? this._linkCSSP(s._prev, i._next, s._prev._prev) : s === this._firstPT && (this._firstPT = i._next), i._next && this._linkCSSP(i._next, i._next._next, s._prev), this._classNamePT = null), t.prototype._kill.call(this, n)
            };
            var Ge = function(t, e, i) {
                var r, s, n, a;
                if (t.slice)
                    for (s = t.length; --s > -1;) Ge(t[s], e, i);
                else
                    for (r = t.childNodes, s = r.length; --s > -1;) n = r[s], a = n.type, n.style && (e.push(K(n)), i && i.push(n)), 1 !== a && 9 !== a && 11 !== a || !n.childNodes.length || Ge(n, e, i)
            };
            return a.cascadeTo = function(t, i, r) {
                var s, n, a, o, l = e.to(t, i, r),
                    h = [l],
                    u = [],
                    f = [],
                    c = [],
                    _ = e._internals.reservedProps;
                for (t = l._targets || l.target, Ge(t, u, c), l.render(i, !0, !0), Ge(t, f), l.render(0, !0, !0), l._enabled(!0), s = c.length; --s > -1;)
                    if (n = J(c[s], u[s], f[s]), n.firstMPT) {
                        n = n.difs;
                        for (a in r) _[a] && (n[a] = r[a]);
                        o = {};
                        for (a in n) o[a] = u[s][a];
                        h.push(e.fromTo(c[s], i, o, n))
                    }
                return h
            }, t.activate([a]), a
        }, !0)
    }), _gsScope._gsDefine && _gsScope._gsQueue.pop()(),
    function(t) {
        "use strict";
        var e = function() {
            return (_gsScope.GreenSockGlobals || _gsScope)[t]
        };
        "function" == typeof define && define.amd ? define(["TweenLite"], e) : "undefined" != typeof module && module.exports && (require("../TweenLite.js"), module.exports = e())
    }("CSSPlugin");;
/*!
 * VERSION: 1.18.0
 * DATE: 2015-09-03
 * UPDATES AND DOCS AT: http://greensock.com
 *
 * @license Copyright (c) 2008-2015, GreenSock. All rights reserved.
 * This work is subject to the terms at http://greensock.com/standard-license or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
(function(t, e) {
    "use strict";
    var i = t.GreenSockGlobals = t.GreenSockGlobals || t;
    if (!i.TweenLite) {
        var s, r, n, a, o, l = function(t) {
                var e, s = t.split("."),
                    r = i;
                for (e = 0; s.length > e; e++) r[s[e]] = r = r[s[e]] || {};
                return r
            },
            h = l("com.greensock"),
            _ = 1e-10,
            u = function(t) {
                var e, i = [],
                    s = t.length;
                for (e = 0; e !== s; i.push(t[e++]));
                return i
            },
            f = function() {},
            c = function() {
                var t = Object.prototype.toString,
                    e = t.call([]);
                return function(i) {
                    return null != i && (i instanceof Array || "object" == typeof i && !!i.push && t.call(i) === e)
                }
            }(),
            m = {},
            p = function(s, r, n, a) {
                this.sc = m[s] ? m[s].sc : [], m[s] = this, this.gsClass = null, this.func = n;
                var o = [];
                this.check = function(h) {
                    for (var _, u, f, c, d, v = r.length, g = v; --v > -1;)(_ = m[r[v]] || new p(r[v], [])).gsClass ? (o[v] = _.gsClass, g--) : h && _.sc.push(this);
                    if (0 === g && n)
                        for (u = ("com.greensock." + s).split("."), f = u.pop(), c = l(u.join("."))[f] = this.gsClass = n.apply(n, o), a && (i[f] = c, d = "undefined" != typeof module && module.exports, !d && "function" == typeof define && define.amd ? define((t.GreenSockAMDPath ? t.GreenSockAMDPath + "/" : "") + s.split(".").pop(), [], function() {
                                return c
                            }) : s === e && d && (module.exports = c)), v = 0; this.sc.length > v; v++) this.sc[v].check()
                }, this.check(!0)
            },
            d = t._gsDefine = function(t, e, i, s) {
                return new p(t, e, i, s)
            },
            v = h._class = function(t, e, i) {
                return e = e || function() {}, d(t, [], function() {
                    return e
                }, i), e
            };
        d.globals = i;
        var g = [0, 0, 1, 1],
            T = [],
            y = v("easing.Ease", function(t, e, i, s) {
                this._func = t, this._type = i || 0, this._power = s || 0, this._params = e ? g.concat(e) : g
            }, !0),
            w = y.map = {},
            P = y.register = function(t, e, i, s) {
                for (var r, n, a, o, l = e.split(","), _ = l.length, u = (i || "easeIn,easeOut,easeInOut").split(","); --_ > -1;)
                    for (n = l[_], r = s ? v("easing." + n, null, !0) : h.easing[n] || {}, a = u.length; --a > -1;) o = u[a], w[n + "." + o] = w[o + n] = r[o] = t.getRatio ? t : t[o] || new t
            };
        for (n = y.prototype, n._calcEnd = !1, n.getRatio = function(t) {
                if (this._func) return this._params[0] = t, this._func.apply(null, this._params);
                var e = this._type,
                    i = this._power,
                    s = 1 === e ? 1 - t : 2 === e ? t : .5 > t ? 2 * t : 2 * (1 - t);
                return 1 === i ? s *= s : 2 === i ? s *= s * s : 3 === i ? s *= s * s * s : 4 === i && (s *= s * s * s * s), 1 === e ? 1 - s : 2 === e ? s : .5 > t ? s / 2 : 1 - s / 2
            }, s = ["Linear", "Quad", "Cubic", "Quart", "Quint,Strong"], r = s.length; --r > -1;) n = s[r] + ",Power" + r, P(new y(null, null, 1, r), n, "easeOut", !0), P(new y(null, null, 2, r), n, "easeIn" + (0 === r ? ",easeNone" : "")), P(new y(null, null, 3, r), n, "easeInOut");
        w.linear = h.easing.Linear.easeIn, w.swing = h.easing.Quad.easeInOut;
        var b = v("events.EventDispatcher", function(t) {
            this._listeners = {}, this._eventTarget = t || this
        });
        n = b.prototype, n.addEventListener = function(t, e, i, s, r) {
            r = r || 0;
            var n, l, h = this._listeners[t],
                _ = 0;
            for (null == h && (this._listeners[t] = h = []), l = h.length; --l > -1;) n = h[l], n.c === e && n.s === i ? h.splice(l, 1) : 0 === _ && r > n.pr && (_ = l + 1);
            h.splice(_, 0, {
                c: e,
                s: i,
                up: s,
                pr: r
            }), this !== a || o || a.wake()
        }, n.removeEventListener = function(t, e) {
            var i, s = this._listeners[t];
            if (s)
                for (i = s.length; --i > -1;)
                    if (s[i].c === e) return s.splice(i, 1), void 0
        }, n.dispatchEvent = function(t) {
            var e, i, s, r = this._listeners[t];
            if (r)
                for (e = r.length, i = this._eventTarget; --e > -1;) s = r[e], s && (s.up ? s.c.call(s.s || i, {
                    type: t,
                    target: i
                }) : s.c.call(s.s || i))
        };
        var k = t.requestAnimationFrame,
            A = t.cancelAnimationFrame,
            S = Date.now || function() {
                return (new Date).getTime()
            },
            x = S();
        for (s = ["ms", "moz", "webkit", "o"], r = s.length; --r > -1 && !k;) k = t[s[r] + "RequestAnimationFrame"], A = t[s[r] + "CancelAnimationFrame"] || t[s[r] + "CancelRequestAnimationFrame"];
        v("Ticker", function(t, e) {
            var i, s, r, n, l, h = this,
                u = S(),
                c = e !== !1 && k,
                m = 500,
                p = 33,
                d = "tick",
                v = function(t) {
                    var e, a, o = S() - x;
                    o > m && (u += o - p), x += o, h.time = (x - u) / 1e3, e = h.time - l, (!i || e > 0 || t === !0) && (h.frame++, l += e + (e >= n ? .004 : n - e), a = !0), t !== !0 && (r = s(v)), a && h.dispatchEvent(d)
                };
            b.call(h), h.time = h.frame = 0, h.tick = function() {
                v(!0)
            }, h.lagSmoothing = function(t, e) {
                m = t || 1 / _, p = Math.min(e, m, 0)
            }, h.sleep = function() {
                null != r && (c && A ? A(r) : clearTimeout(r), s = f, r = null, h === a && (o = !1))
            }, h.wake = function() {
                null !== r ? h.sleep() : h.frame > 10 && (x = S() - m + 5), s = 0 === i ? f : c && k ? k : function(t) {
                    return setTimeout(t, 0 | 1e3 * (l - h.time) + 1)
                }, h === a && (o = !0), v(2)
            }, h.fps = function(t) {
                return arguments.length ? (i = t, n = 1 / (i || 60), l = this.time + n, h.wake(), void 0) : i
            }, h.useRAF = function(t) {
                return arguments.length ? (h.sleep(), c = t, h.fps(i), void 0) : c
            }, h.fps(t), setTimeout(function() {
                c && 5 > h.frame && h.useRAF(!1)
            }, 1500)
        }), n = h.Ticker.prototype = new h.events.EventDispatcher, n.constructor = h.Ticker;
        var R = v("core.Animation", function(t, e) {
            if (this.vars = e = e || {}, this._duration = this._totalDuration = t || 0, this._delay = Number(e.delay) || 0, this._timeScale = 1, this._active = e.immediateRender === !0, this.data = e.data, this._reversed = e.reversed === !0, H) {
                o || a.wake();
                var i = this.vars.useFrames ? K : H;
                i.add(this, i._time), this.vars.paused && this.paused(!0)
            }
        });
        a = R.ticker = new h.Ticker, n = R.prototype, n._dirty = n._gc = n._initted = n._paused = !1, n._totalTime = n._time = 0, n._rawPrevTime = -1, n._next = n._last = n._onUpdate = n._timeline = n.timeline = null, n._paused = !1;
        var C = function() {
            o && S() - x > 2e3 && a.wake(), setTimeout(C, 2e3)
        };
        C(), n.play = function(t, e) {
            return null != t && this.seek(t, e), this.reversed(!1).paused(!1)
        }, n.pause = function(t, e) {
            return null != t && this.seek(t, e), this.paused(!0)
        }, n.resume = function(t, e) {
            return null != t && this.seek(t, e), this.paused(!1)
        }, n.seek = function(t, e) {
            return this.totalTime(Number(t), e !== !1)
        }, n.restart = function(t, e) {
            return this.reversed(!1).paused(!1).totalTime(t ? -this._delay : 0, e !== !1, !0)
        }, n.reverse = function(t, e) {
            return null != t && this.seek(t || this.totalDuration(), e), this.reversed(!0).paused(!1)
        }, n.render = function() {}, n.invalidate = function() {
            return this._time = this._totalTime = 0, this._initted = this._gc = !1, this._rawPrevTime = -1, (this._gc || !this.timeline) && this._enabled(!0), this
        }, n.isActive = function() {
            var t, e = this._timeline,
                i = this._startTime;
            return !e || !this._gc && !this._paused && e.isActive() && (t = e.rawTime()) >= i && i + this.totalDuration() / this._timeScale > t
        }, n._enabled = function(t, e) {
            return o || a.wake(), this._gc = !t, this._active = this.isActive(), e !== !0 && (t && !this.timeline ? this._timeline.add(this, this._startTime - this._delay) : !t && this.timeline && this._timeline._remove(this, !0)), !1
        }, n._kill = function() {
            return this._enabled(!1, !1)
        }, n.kill = function(t, e) {
            return this._kill(t, e), this
        }, n._uncache = function(t) {
            for (var e = t ? this : this.timeline; e;) e._dirty = !0, e = e.timeline;
            return this
        }, n._swapSelfInParams = function(t) {
            for (var e = t.length, i = t.concat(); --e > -1;) "{self}" === t[e] && (i[e] = this);
            return i
        }, n._callback = function(t) {
            var e = this.vars;
            e[t].apply(e[t + "Scope"] || e.callbackScope || this, e[t + "Params"] || T)
        }, n.eventCallback = function(t, e, i, s) {
            if ("on" === (t || "").substr(0, 2)) {
                var r = this.vars;
                if (1 === arguments.length) return r[t];
                null == e ? delete r[t] : (r[t] = e, r[t + "Params"] = c(i) && -1 !== i.join("").indexOf("{self}") ? this._swapSelfInParams(i) : i, r[t + "Scope"] = s), "onUpdate" === t && (this._onUpdate = e)
            }
            return this
        }, n.delay = function(t) {
            return arguments.length ? (this._timeline.smoothChildTiming && this.startTime(this._startTime + t - this._delay), this._delay = t, this) : this._delay
        }, n.duration = function(t) {
            return arguments.length ? (this._duration = this._totalDuration = t, this._uncache(!0), this._timeline.smoothChildTiming && this._time > 0 && this._time < this._duration && 0 !== t && this.totalTime(this._totalTime * (t / this._duration), !0), this) : (this._dirty = !1, this._duration)
        }, n.totalDuration = function(t) {
            return this._dirty = !1, arguments.length ? this.duration(t) : this._totalDuration
        }, n.time = function(t, e) {
            return arguments.length ? (this._dirty && this.totalDuration(), this.totalTime(t > this._duration ? this._duration : t, e)) : this._time
        }, n.totalTime = function(t, e, i) {
            if (o || a.wake(), !arguments.length) return this._totalTime;
            if (this._timeline) {
                if (0 > t && !i && (t += this.totalDuration()), this._timeline.smoothChildTiming) {
                    this._dirty && this.totalDuration();
                    var s = this._totalDuration,
                        r = this._timeline;
                    if (t > s && !i && (t = s), this._startTime = (this._paused ? this._pauseTime : r._time) - (this._reversed ? s - t : t) / this._timeScale, r._dirty || this._uncache(!1), r._timeline)
                        for (; r._timeline;) r._timeline._time !== (r._startTime + r._totalTime) / r._timeScale && r.totalTime(r._totalTime, !0), r = r._timeline
                }
                this._gc && this._enabled(!0, !1), (this._totalTime !== t || 0 === this._duration) && (z.length && V(), this.render(t, e, !1), z.length && V())
            }
            return this
        }, n.progress = n.totalProgress = function(t, e) {
            var i = this.duration();
            return arguments.length ? this.totalTime(i * t, e) : i ? this._time / i : this.ratio
        }, n.startTime = function(t) {
            return arguments.length ? (t !== this._startTime && (this._startTime = t, this.timeline && this.timeline._sortChildren && this.timeline.add(this, t - this._delay)), this) : this._startTime
        }, n.endTime = function(t) {
            return this._startTime + (0 != t ? this.totalDuration() : this.duration()) / this._timeScale
        }, n.timeScale = function(t) {
            if (!arguments.length) return this._timeScale;
            if (t = t || _, this._timeline && this._timeline.smoothChildTiming) {
                var e = this._pauseTime,
                    i = e || 0 === e ? e : this._timeline.totalTime();
                this._startTime = i - (i - this._startTime) * this._timeScale / t
            }
            return this._timeScale = t, this._uncache(!1)
        }, n.reversed = function(t) {
            return arguments.length ? (t != this._reversed && (this._reversed = t, this.totalTime(this._timeline && !this._timeline.smoothChildTiming ? this.totalDuration() - this._totalTime : this._totalTime, !0)), this) : this._reversed
        }, n.paused = function(t) {
            if (!arguments.length) return this._paused;
            var e, i, s = this._timeline;
            return t != this._paused && s && (o || t || a.wake(), e = s.rawTime(), i = e - this._pauseTime, !t && s.smoothChildTiming && (this._startTime += i, this._uncache(!1)), this._pauseTime = t ? e : null, this._paused = t, this._active = this.isActive(), !t && 0 !== i && this._initted && this.duration() && (e = s.smoothChildTiming ? this._totalTime : (e - this._startTime) / this._timeScale, this.render(e, e === this._totalTime, !0))), this._gc && !t && this._enabled(!0, !1), this
        };
        var D = v("core.SimpleTimeline", function(t) {
            R.call(this, 0, t), this.autoRemoveChildren = this.smoothChildTiming = !0
        });
        n = D.prototype = new R, n.constructor = D, n.kill()._gc = !1, n._first = n._last = n._recent = null, n._sortChildren = !1, n.add = n.insert = function(t, e) {
            var i, s;
            if (t._startTime = Number(e || 0) + t._delay, t._paused && this !== t._timeline && (t._pauseTime = t._startTime + (this.rawTime() - t._startTime) / t._timeScale), t.timeline && t.timeline._remove(t, !0), t.timeline = t._timeline = this, t._gc && t._enabled(!0, !0), i = this._last, this._sortChildren)
                for (s = t._startTime; i && i._startTime > s;) i = i._prev;
            return i ? (t._next = i._next, i._next = t) : (t._next = this._first, this._first = t), t._next ? t._next._prev = t : this._last = t, t._prev = i, this._recent = t, this._timeline && this._uncache(!0), this
        }, n._remove = function(t, e) {
            return t.timeline === this && (e || t._enabled(!1, !0), t._prev ? t._prev._next = t._next : this._first === t && (this._first = t._next), t._next ? t._next._prev = t._prev : this._last === t && (this._last = t._prev), t._next = t._prev = t.timeline = null, t === this._recent && (this._recent = this._last), this._timeline && this._uncache(!0)), this
        }, n.render = function(t, e, i) {
            var s, r = this._first;
            for (this._totalTime = this._time = this._rawPrevTime = t; r;) s = r._next, (r._active || t >= r._startTime && !r._paused) && (r._reversed ? r.render((r._dirty ? r.totalDuration() : r._totalDuration) - (t - r._startTime) * r._timeScale, e, i) : r.render((t - r._startTime) * r._timeScale, e, i)), r = s
        }, n.rawTime = function() {
            return o || a.wake(), this._totalTime
        };
        var I = v("TweenLite", function(e, i, s) {
                if (R.call(this, i, s), this.render = I.prototype.render, null == e) throw "Cannot tween a null target.";
                this.target = e = "string" != typeof e ? e : I.selector(e) || e;
                var r, n, a, o = e.jquery || e.length && e !== t && e[0] && (e[0] === t || e[0].nodeType && e[0].style && !e.nodeType),
                    l = this.vars.overwrite;
                if (this._overwrite = l = null == l ? $[I.defaultOverwrite] : "number" == typeof l ? l >> 0 : $[l], (o || e instanceof Array || e.push && c(e)) && "number" != typeof e[0])
                    for (this._targets = a = u(e), this._propLookup = [], this._siblings = [], r = 0; a.length > r; r++) n = a[r], n ? "string" != typeof n ? n.length && n !== t && n[0] && (n[0] === t || n[0].nodeType && n[0].style && !n.nodeType) ? (a.splice(r--, 1), this._targets = a = a.concat(u(n))) : (this._siblings[r] = W(n, this, !1), 1 === l && this._siblings[r].length > 1 && Y(n, this, null, 1, this._siblings[r])) : (n = a[r--] = I.selector(n), "string" == typeof n && a.splice(r + 1, 1)) : a.splice(r--, 1);
                else this._propLookup = {}, this._siblings = W(e, this, !1), 1 === l && this._siblings.length > 1 && Y(e, this, null, 1, this._siblings);
                (this.vars.immediateRender || 0 === i && 0 === this._delay && this.vars.immediateRender !== !1) && (this._time = -_, this.render(-this._delay))
            }, !0),
            E = function(e) {
                return e && e.length && e !== t && e[0] && (e[0] === t || e[0].nodeType && e[0].style && !e.nodeType)
            },
            O = function(t, e) {
                var i, s = {};
                for (i in t) M[i] || i in e && "transform" !== i && "x" !== i && "y" !== i && "width" !== i && "height" !== i && "className" !== i && "border" !== i || !(!Q[i] || Q[i] && Q[i]._autoCSS) || (s[i] = t[i], delete t[i]);
                t.css = s
            };
        n = I.prototype = new R, n.constructor = I, n.kill()._gc = !1, n.ratio = 0, n._firstPT = n._targets = n._overwrittenProps = n._startAt = null, n._notifyPluginsOfEnabled = n._lazy = !1, I.version = "1.18.0", I.defaultEase = n._ease = new y(null, null, 1, 1), I.defaultOverwrite = "auto", I.ticker = a, I.autoSleep = 120, I.lagSmoothing = function(t, e) {
            a.lagSmoothing(t, e)
        }, I.selector = t.$ || t.jQuery || function(e) {
            var i = t.$ || t.jQuery;
            return i ? (I.selector = i, i(e)) : "undefined" == typeof document ? e : document.querySelectorAll ? document.querySelectorAll(e) : document.getElementById("#" === e.charAt(0) ? e.substr(1) : e)
        };
        var z = [],
            F = {},
            L = /(?:(-|-=|\+=)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi,
            N = function(t) {
                for (var e, i = this._firstPT, s = 1e-6; i;) e = i.blob ? t ? this.join("") : this.start : i.c * t + i.s, i.r ? e = Math.round(e) : s > e && e > -s && (e = 0), i.f ? i.fp ? i.t[i.p](i.fp, e) : i.t[i.p](e) : i.t[i.p] = e, i = i._next
            },
            U = function(t, e, i, s) {
                var r, n, a, o, l, h, _, u = [t, e],
                    f = 0,
                    c = "",
                    m = 0;
                for (u.start = t, i && (i(u), t = u[0], e = u[1]), u.length = 0, r = t.match(L) || [], n = e.match(L) || [], s && (s._next = null, s.blob = 1, u._firstPT = s), l = n.length, o = 0; l > o; o++) _ = n[o], h = e.substr(f, e.indexOf(_, f) - f), c += h || !o ? h : ",", f += h.length, m ? m = (m + 1) % 5 : "rgba(" === h.substr(-5) && (m = 1), _ === r[o] || o >= r.length ? c += _ : (c && (u.push(c), c = ""), a = parseFloat(r[o]), u.push(a), u._firstPT = {
                    _next: u._firstPT,
                    t: u,
                    p: u.length - 1,
                    s: a,
                    c: ("=" === _.charAt(1) ? parseInt(_.charAt(0) + "1", 10) * parseFloat(_.substr(2)) : parseFloat(_) - a) || 0,
                    f: 0,
                    r: m && 4 > m
                }), f += _.length;
                return c += e.substr(f), c && u.push(c), u.setRatio = N, u
            },
            j = function(t, e, i, s, r, n, a, o) {
                var l, h, _ = "get" === i ? t[e] : i,
                    u = typeof t[e],
                    f = "string" == typeof s && "=" === s.charAt(1),
                    c = {
                        t: t,
                        p: e,
                        s: _,
                        f: "function" === u,
                        pg: 0,
                        n: r || e,
                        r: n,
                        pr: 0,
                        c: f ? parseInt(s.charAt(0) + "1", 10) * parseFloat(s.substr(2)) : parseFloat(s) - _ || 0
                    };
                return "number" !== u && ("function" === u && "get" === i && (h = e.indexOf("set") || "function" != typeof t["get" + e.substr(3)] ? e : "get" + e.substr(3), c.s = _ = a ? t[h](a) : t[h]()), "string" == typeof _ && (a || isNaN(_)) ? (c.fp = a, l = U(_, s, o || I.defaultStringFilter, c), c = {
                    t: l,
                    p: "setRatio",
                    s: 0,
                    c: 1,
                    f: 2,
                    pg: 0,
                    n: r || e,
                    pr: 0
                }) : f || (c.c = parseFloat(s) - parseFloat(_) || 0)), c.c ? ((c._next = this._firstPT) && (c._next._prev = c), this._firstPT = c, c) : void 0
            },
            G = I._internals = {
                isArray: c,
                isSelector: E,
                lazyTweens: z,
                blobDif: U
            },
            Q = I._plugins = {},
            q = G.tweenLookup = {},
            B = 0,
            M = G.reservedProps = {
                ease: 1,
                delay: 1,
                overwrite: 1,
                onComplete: 1,
                onCompleteParams: 1,
                onCompleteScope: 1,
                useFrames: 1,
                runBackwards: 1,
                startAt: 1,
                onUpdate: 1,
                onUpdateParams: 1,
                onUpdateScope: 1,
                onStart: 1,
                onStartParams: 1,
                onStartScope: 1,
                onReverseComplete: 1,
                onReverseCompleteParams: 1,
                onReverseCompleteScope: 1,
                onRepeat: 1,
                onRepeatParams: 1,
                onRepeatScope: 1,
                easeParams: 1,
                yoyo: 1,
                immediateRender: 1,
                repeat: 1,
                repeatDelay: 1,
                data: 1,
                paused: 1,
                reversed: 1,
                autoCSS: 1,
                lazy: 1,
                onOverwrite: 1,
                callbackScope: 1,
                stringFilter: 1
            },
            $ = {
                none: 0,
                all: 1,
                auto: 2,
                concurrent: 3,
                allOnStart: 4,
                preexisting: 5,
                "true": 1,
                "false": 0
            },
            K = R._rootFramesTimeline = new D,
            H = R._rootTimeline = new D,
            J = 30,
            V = G.lazyRender = function() {
                var t, e = z.length;
                for (F = {}; --e > -1;) t = z[e], t && t._lazy !== !1 && (t.render(t._lazy[0], t._lazy[1], !0), t._lazy = !1);
                z.length = 0
            };
        H._startTime = a.time, K._startTime = a.frame, H._active = K._active = !0, setTimeout(V, 1), R._updateRoot = I.render = function() {
            var t, e, i;
            if (z.length && V(), H.render((a.time - H._startTime) * H._timeScale, !1, !1), K.render((a.frame - K._startTime) * K._timeScale, !1, !1), z.length && V(), a.frame >= J) {
                J = a.frame + (parseInt(I.autoSleep, 10) || 120);
                for (i in q) {
                    for (e = q[i].tweens, t = e.length; --t > -1;) e[t]._gc && e.splice(t, 1);
                    0 === e.length && delete q[i]
                }
                if (i = H._first, (!i || i._paused) && I.autoSleep && !K._first && 1 === a._listeners.tick.length) {
                    for (; i && i._paused;) i = i._next;
                    i || a.sleep()
                }
            }
        }, a.addEventListener("tick", R._updateRoot);
        var W = function(t, e, i) {
                var s, r, n = t._gsTweenID;
                if (q[n || (t._gsTweenID = n = "t" + B++)] || (q[n] = {
                        target: t,
                        tweens: []
                    }), e && (s = q[n].tweens, s[r = s.length] = e, i))
                    for (; --r > -1;) s[r] === e && s.splice(r, 1);
                return q[n].tweens
            },
            X = function(t, e, i, s) {
                var r, n, a = t.vars.onOverwrite;
                return a && (r = a(t, e, i, s)), a = I.onOverwrite, a && (n = a(t, e, i, s)), r !== !1 && n !== !1
            },
            Y = function(t, e, i, s, r) {
                var n, a, o, l;
                if (1 === s || s >= 4) {
                    for (l = r.length, n = 0; l > n; n++)
                        if ((o = r[n]) !== e) o._gc || o._kill(null, t, e) && (a = !0);
                        else if (5 === s) break;
                    return a
                }
                var h, u = e._startTime + _,
                    f = [],
                    c = 0,
                    m = 0 === e._duration;
                for (n = r.length; --n > -1;)(o = r[n]) === e || o._gc || o._paused || (o._timeline !== e._timeline ? (h = h || Z(e, 0, m), 0 === Z(o, h, m) && (f[c++] = o)) : u >= o._startTime && o._startTime + o.totalDuration() / o._timeScale > u && ((m || !o._initted) && 2e-10 >= u - o._startTime || (f[c++] = o)));
                for (n = c; --n > -1;)
                    if (o = f[n], 2 === s && o._kill(i, t, e) && (a = !0), 2 !== s || !o._firstPT && o._initted) {
                        if (2 !== s && !X(o, e)) continue;
                        o._enabled(!1, !1) && (a = !0)
                    }
                return a
            },
            Z = function(t, e, i) {
                for (var s = t._timeline, r = s._timeScale, n = t._startTime; s._timeline;) {
                    if (n += s._startTime, r *= s._timeScale, s._paused) return -100;
                    s = s._timeline
                }
                return n /= r, n > e ? n - e : i && n === e || !t._initted && 2 * _ > n - e ? _ : (n += t.totalDuration() / t._timeScale / r) > e + _ ? 0 : n - e - _
            };
        n._init = function() {
            var t, e, i, s, r, n = this.vars,
                a = this._overwrittenProps,
                o = this._duration,
                l = !!n.immediateRender,
                h = n.ease;
            if (n.startAt) {
                this._startAt && (this._startAt.render(-1, !0), this._startAt.kill()), r = {};
                for (s in n.startAt) r[s] = n.startAt[s];
                if (r.overwrite = !1, r.immediateRender = !0, r.lazy = l && n.lazy !== !1, r.startAt = r.delay = null, this._startAt = I.to(this.target, 0, r), l)
                    if (this._time > 0) this._startAt = null;
                    else if (0 !== o) return
            } else if (n.runBackwards && 0 !== o)
                if (this._startAt) this._startAt.render(-1, !0), this._startAt.kill(), this._startAt = null;
                else {
                    0 !== this._time && (l = !1), i = {};
                    for (s in n) M[s] && "autoCSS" !== s || (i[s] = n[s]);
                    if (i.overwrite = 0, i.data = "isFromStart", i.lazy = l && n.lazy !== !1, i.immediateRender = l, this._startAt = I.to(this.target, 0, i), l) {
                        if (0 === this._time) return
                    } else this._startAt._init(), this._startAt._enabled(!1), this.vars.immediateRender && (this._startAt = null)
                }
            if (this._ease = h = h ? h instanceof y ? h : "function" == typeof h ? new y(h, n.easeParams) : w[h] || I.defaultEase : I.defaultEase, n.easeParams instanceof Array && h.config && (this._ease = h.config.apply(h, n.easeParams)), this._easeType = this._ease._type, this._easePower = this._ease._power, this._firstPT = null, this._targets)
                for (t = this._targets.length; --t > -1;) this._initProps(this._targets[t], this._propLookup[t] = {}, this._siblings[t], a ? a[t] : null) && (e = !0);
            else e = this._initProps(this.target, this._propLookup, this._siblings, a);
            if (e && I._onPluginEvent("_onInitAllProps", this), a && (this._firstPT || "function" != typeof this.target && this._enabled(!1, !1)), n.runBackwards)
                for (i = this._firstPT; i;) i.s += i.c, i.c = -i.c, i = i._next;
            this._onUpdate = n.onUpdate, this._initted = !0
        }, n._initProps = function(e, i, s, r) {
            var n, a, o, l, h, _;
            if (null == e) return !1;
            F[e._gsTweenID] && V(), this.vars.css || e.style && e !== t && e.nodeType && Q.css && this.vars.autoCSS !== !1 && O(this.vars, e);
            for (n in this.vars)
                if (_ = this.vars[n], M[n]) _ && (_ instanceof Array || _.push && c(_)) && -1 !== _.join("").indexOf("{self}") && (this.vars[n] = _ = this._swapSelfInParams(_, this));
                else if (Q[n] && (l = new Q[n])._onInitTween(e, this.vars[n], this)) {
                for (this._firstPT = h = {
                        _next: this._firstPT,
                        t: l,
                        p: "setRatio",
                        s: 0,
                        c: 1,
                        f: 1,
                        n: n,
                        pg: 1,
                        pr: l._priority
                    }, a = l._overwriteProps.length; --a > -1;) i[l._overwriteProps[a]] = this._firstPT;
                (l._priority || l._onInitAllProps) && (o = !0), (l._onDisable || l._onEnable) && (this._notifyPluginsOfEnabled = !0), h._next && (h._next._prev = h)
            } else i[n] = j.call(this, e, n, "get", _, n, 0, null, this.vars.stringFilter);
            return r && this._kill(r, e) ? this._initProps(e, i, s, r) : this._overwrite > 1 && this._firstPT && s.length > 1 && Y(e, this, i, this._overwrite, s) ? (this._kill(i, e), this._initProps(e, i, s, r)) : (this._firstPT && (this.vars.lazy !== !1 && this._duration || this.vars.lazy && !this._duration) && (F[e._gsTweenID] = !0), o)
        }, n.render = function(t, e, i) {
            var s, r, n, a, o = this._time,
                l = this._duration,
                h = this._rawPrevTime;
            if (t >= l) this._totalTime = this._time = l, this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1, this._reversed || (s = !0, r = "onComplete", i = i || this._timeline.autoRemoveChildren), 0 === l && (this._initted || !this.vars.lazy || i) && (this._startTime === this._timeline._duration && (t = 0), (0 === t || 0 > h || h === _ && "isPause" !== this.data) && h !== t && (i = !0, h > _ && (r = "onReverseComplete")), this._rawPrevTime = a = !e || t || h === t ? t : _);
            else if (1e-7 > t) this._totalTime = this._time = 0, this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0, (0 !== o || 0 === l && h > 0) && (r = "onReverseComplete", s = this._reversed), 0 > t && (this._active = !1, 0 === l && (this._initted || !this.vars.lazy || i) && (h >= 0 && (h !== _ || "isPause" !== this.data) && (i = !0), this._rawPrevTime = a = !e || t || h === t ? t : _)), this._initted || (i = !0);
            else if (this._totalTime = this._time = t, this._easeType) {
                var u = t / l,
                    f = this._easeType,
                    c = this._easePower;
                (1 === f || 3 === f && u >= .5) && (u = 1 - u), 3 === f && (u *= 2), 1 === c ? u *= u : 2 === c ? u *= u * u : 3 === c ? u *= u * u * u : 4 === c && (u *= u * u * u * u), this.ratio = 1 === f ? 1 - u : 2 === f ? u : .5 > t / l ? u / 2 : 1 - u / 2
            } else this.ratio = this._ease.getRatio(t / l);
            if (this._time !== o || i) {
                if (!this._initted) {
                    if (this._init(), !this._initted || this._gc) return;
                    if (!i && this._firstPT && (this.vars.lazy !== !1 && this._duration || this.vars.lazy && !this._duration)) return this._time = this._totalTime = o, this._rawPrevTime = h, z.push(this), this._lazy = [t, e], void 0;
                    this._time && !s ? this.ratio = this._ease.getRatio(this._time / l) : s && this._ease._calcEnd && (this.ratio = this._ease.getRatio(0 === this._time ? 0 : 1))
                }
                for (this._lazy !== !1 && (this._lazy = !1), this._active || !this._paused && this._time !== o && t >= 0 && (this._active = !0), 0 === o && (this._startAt && (t >= 0 ? this._startAt.render(t, e, i) : r || (r = "_dummyGS")), this.vars.onStart && (0 !== this._time || 0 === l) && (e || this._callback("onStart"))), n = this._firstPT; n;) n.f ? n.t[n.p](n.c * this.ratio + n.s) : n.t[n.p] = n.c * this.ratio + n.s, n = n._next;
                this._onUpdate && (0 > t && this._startAt && t !== -1e-4 && this._startAt.render(t, e, i), e || (this._time !== o || s) && this._callback("onUpdate")), r && (!this._gc || i) && (0 > t && this._startAt && !this._onUpdate && t !== -1e-4 && this._startAt.render(t, e, i), s && (this._timeline.autoRemoveChildren && this._enabled(!1, !1), this._active = !1), !e && this.vars[r] && this._callback(r), 0 === l && this._rawPrevTime === _ && a !== _ && (this._rawPrevTime = 0))
            }
        }, n._kill = function(t, e, i) {
            if ("all" === t && (t = null), null == t && (null == e || e === this.target)) return this._lazy = !1, this._enabled(!1, !1);
            e = "string" != typeof e ? e || this._targets || this.target : I.selector(e) || e;
            var s, r, n, a, o, l, h, _, u, f = i && this._time && i._startTime === this._startTime && this._timeline === i._timeline;
            if ((c(e) || E(e)) && "number" != typeof e[0])
                for (s = e.length; --s > -1;) this._kill(t, e[s], i) && (l = !0);
            else {
                if (this._targets) {
                    for (s = this._targets.length; --s > -1;)
                        if (e === this._targets[s]) {
                            o = this._propLookup[s] || {}, this._overwrittenProps = this._overwrittenProps || [], r = this._overwrittenProps[s] = t ? this._overwrittenProps[s] || {} : "all";
                            break
                        }
                } else {
                    if (e !== this.target) return !1;
                    o = this._propLookup, r = this._overwrittenProps = t ? this._overwrittenProps || {} : "all"
                }
                if (o) {
                    if (h = t || o, _ = t !== r && "all" !== r && t !== o && ("object" != typeof t || !t._tempKill), i && (I.onOverwrite || this.vars.onOverwrite)) {
                        for (n in h) o[n] && (u || (u = []), u.push(n));
                        if ((u || !t) && !X(this, i, e, u)) return !1
                    }
                    for (n in h)(a = o[n]) && (f && (a.f ? a.t[a.p](a.s) : a.t[a.p] = a.s, l = !0), a.pg && a.t._kill(h) && (l = !0), a.pg && 0 !== a.t._overwriteProps.length || (a._prev ? a._prev._next = a._next : a === this._firstPT && (this._firstPT = a._next), a._next && (a._next._prev = a._prev), a._next = a._prev = null), delete o[n]), _ && (r[n] = 1);
                    !this._firstPT && this._initted && this._enabled(!1, !1)
                }
            }
            return l
        }, n.invalidate = function() {
            return this._notifyPluginsOfEnabled && I._onPluginEvent("_onDisable", this), this._firstPT = this._overwrittenProps = this._startAt = this._onUpdate = null, this._notifyPluginsOfEnabled = this._active = this._lazy = !1, this._propLookup = this._targets ? {} : [], R.prototype.invalidate.call(this), this.vars.immediateRender && (this._time = -_, this.render(-this._delay)), this
        }, n._enabled = function(t, e) {
            if (o || a.wake(), t && this._gc) {
                var i, s = this._targets;
                if (s)
                    for (i = s.length; --i > -1;) this._siblings[i] = W(s[i], this, !0);
                else this._siblings = W(this.target, this, !0)
            }
            return R.prototype._enabled.call(this, t, e), this._notifyPluginsOfEnabled && this._firstPT ? I._onPluginEvent(t ? "_onEnable" : "_onDisable", this) : !1
        }, I.to = function(t, e, i) {
            return new I(t, e, i)
        }, I.from = function(t, e, i) {
            return i.runBackwards = !0, i.immediateRender = 0 != i.immediateRender, new I(t, e, i)
        }, I.fromTo = function(t, e, i, s) {
            return s.startAt = i, s.immediateRender = 0 != s.immediateRender && 0 != i.immediateRender, new I(t, e, s)
        }, I.delayedCall = function(t, e, i, s, r) {
            return new I(e, 0, {
                delay: t,
                onComplete: e,
                onCompleteParams: i,
                callbackScope: s,
                onReverseComplete: e,
                onReverseCompleteParams: i,
                immediateRender: !1,
                lazy: !1,
                useFrames: r,
                overwrite: 0
            })
        }, I.set = function(t, e) {
            return new I(t, 0, e)
        }, I.getTweensOf = function(t, e) {
            if (null == t) return [];
            t = "string" != typeof t ? t : I.selector(t) || t;
            var i, s, r, n;
            if ((c(t) || E(t)) && "number" != typeof t[0]) {
                for (i = t.length, s = []; --i > -1;) s = s.concat(I.getTweensOf(t[i], e));
                for (i = s.length; --i > -1;)
                    for (n = s[i], r = i; --r > -1;) n === s[r] && s.splice(i, 1)
            } else
                for (s = W(t).concat(), i = s.length; --i > -1;)(s[i]._gc || e && !s[i].isActive()) && s.splice(i, 1);
            return s
        }, I.killTweensOf = I.killDelayedCallsTo = function(t, e, i) {
            "object" == typeof e && (i = e, e = !1);
            for (var s = I.getTweensOf(t, e), r = s.length; --r > -1;) s[r]._kill(i, t)
        };
        var te = v("plugins.TweenPlugin", function(t, e) {
            this._overwriteProps = (t || "").split(","), this._propName = this._overwriteProps[0], this._priority = e || 0, this._super = te.prototype
        }, !0);
        if (n = te.prototype, te.version = "1.18.0", te.API = 2, n._firstPT = null, n._addTween = j, n.setRatio = N, n._kill = function(t) {
                var e, i = this._overwriteProps,
                    s = this._firstPT;
                if (null != t[this._propName]) this._overwriteProps = [];
                else
                    for (e = i.length; --e > -1;) null != t[i[e]] && i.splice(e, 1);
                for (; s;) null != t[s.n] && (s._next && (s._next._prev = s._prev), s._prev ? (s._prev._next = s._next, s._prev = null) : this._firstPT === s && (this._firstPT = s._next)), s = s._next;
                return !1
            }, n._roundProps = function(t, e) {
                for (var i = this._firstPT; i;)(t[this._propName] || null != i.n && t[i.n.split(this._propName + "_").join("")]) && (i.r = e), i = i._next
            }, I._onPluginEvent = function(t, e) {
                var i, s, r, n, a, o = e._firstPT;
                if ("_onInitAllProps" === t) {
                    for (; o;) {
                        for (a = o._next, s = r; s && s.pr > o.pr;) s = s._next;
                        (o._prev = s ? s._prev : n) ? o._prev._next = o: r = o, (o._next = s) ? s._prev = o : n = o, o = a
                    }
                    o = e._firstPT = r
                }
                for (; o;) o.pg && "function" == typeof o.t[t] && o.t[t]() && (i = !0), o = o._next;
                return i
            }, te.activate = function(t) {
                for (var e = t.length; --e > -1;) t[e].API === te.API && (Q[(new t[e])._propName] = t[e]);
                return !0
            }, d.plugin = function(t) {
                if (!(t && t.propName && t.init && t.API)) throw "illegal plugin definition.";
                var e, i = t.propName,
                    s = t.priority || 0,
                    r = t.overwriteProps,
                    n = {
                        init: "_onInitTween",
                        set: "setRatio",
                        kill: "_kill",
                        round: "_roundProps",
                        initAll: "_onInitAllProps"
                    },
                    a = v("plugins." + i.charAt(0).toUpperCase() + i.substr(1) + "Plugin", function() {
                        te.call(this, i, s), this._overwriteProps = r || []
                    }, t.global === !0),
                    o = a.prototype = new te(i);
                o.constructor = a, a.API = t.API;
                for (e in n) "function" == typeof t[e] && (o[n[e]] = t[e]);
                return a.version = t.version, te.activate([a]), a
            }, s = t._gsQueue) {
            for (r = 0; s.length > r; r++) s[r]();
            for (n in m) m[n].func || t.console.log("GSAP encountered missing dependency: com.greensock." + n)
        }
        o = !1
    }
})("undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window, "TweenLite");;
/* Source and licensing information for the line(s) below can be found at http://www.gaia.com/sites/all/themes/gaiatv/js/progressTips/seekTime.js. */
function getTime(sec_num) {
    var hours = Math.floor(sec_num / 3600),
        minutes = Math.floor((sec_num - (hours * 3600)) / 60),
        seconds = Math.floor(sec_num - (hours * 3600) - (minutes * 60));
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    var time = hours + ':' + minutes + ':' + seconds;
    return time
};
(function() {
    videojs.plugin('seekTime', function(options) {
        var init;
        init = function() {
            var player;
            player = this;
            $(".vjs-progress-control").append($("      <div id='vjs-tip-hover'>    <div id='vjs-tip-inner-hover'></div>      </div>    "));
            $(".vjs-progress-control").bind("mousemove", function(event) {
                var barHeight, minutes, seconds, seekBar, timeInSeconds;
                seekBar = player.controlBar.progressControl.seekBar;
                var mousePosition = (event.pageX - $(seekBar.el()).offset().left) / seekBar.width(),
                    leftLimit = '-' + 0.00005 * seekBar.width(),
                    rightLimit = 0.945 * seekBar.width();
                timeInSeconds = mousePosition * player.duration();
                if (timeInSeconds === player.duration()) timeInSeconds = timeInSeconds - 0.1;
                var time = getTime(timeInSeconds);
                $('#vjs-tip-inner-hover').html(time);
                barHeight = $('.vjs-control-bar').height();
                if (mousePosition <= 0.015 && player.isFullscreen() == false) {
                    $("#vjs-tip-hover").css("left", '-12' + "px").css("visibility", "visible")
                } else if (mousePosition >= 0.975 && player.isFullscreen() == false) {
                    $("#vjs-tip-hover").css("left", rightLimit + "px").css("visibility", "visible")
                } else $("#vjs-tip-hover").css("left", "" + (event.pageX - $(this).offset().left - 30) + "px").css("visibility", "visible");
                return
            });
            $(".vjs-progress-control, .vjs-play-control").bind("mouseout", function() {
                $("#vjs-tip-hover").css("visibility", "hidden")
            })
        };
        this.on("loadedmetadata", init)
    })
})();;
/* Source and licensing information for the above line(s) can be found at http://www.gaia.com/sites/all/themes/gaiatv/js/progressTips/seekTime.js. */
/* Source and licensing information for the line(s) below can be found at http://www.gaia.com/sites/all/modules/gaiamtv_site/gaiamtv_omniture/gaiamtv_omniture.js. */
Drupal.behaviors.gaiatvRecsDefaultContent = function(context) {
    var baseUrl = document.location.protocol + '//' + document.location.host + Drupal.settings.basePath,
        ttMETA = window.ttMETA,
        getCuratedRecs = function() {
            $.ajax({
                type: 'GET',
                url: baseUrl + 'api/recommended/' + window.Drupal.settings.gtvOmniture.currentNid + '?r=' + Math.floor(Math.random() * 46),
                dataType: 'json',
                success: function(data) {
                    $('.pane-recommendations').html(data.markup)
                },
                error: function(xmlhttp) {
                    console.log(xmlhttp)
                }
            });
            return
        };
    if (window.Drupal.settings.gtvOmniture !== undefined && window.Drupal.settings.gtvOmniture.useCuratedRec == 1) {
        getCuratedRecs()
    } else if (typeof(window.Drupal.settings.gtvOmniture) != 'undefined' && window.Drupal.settings.gtvOmniture.currentNid !== null) $('.pane-recommendations:not(.is-processed)', context).addClass('is-processed').each(function() {
        for (var i = 1; i > -1; i--)
            if (ttMETA && ttMETA[i] && ttMETA[i].mbox === 'Video_Display_Recs' && ttMETA[i].experience.length > 0) {
                return false
            } else getCuratedRecs()
    })
};
/* Source and licensing information for the above line(s) can be found at http://www.gaia.com/sites/all/modules/gaiamtv_site/gaiamtv_omniture/gaiamtv_omniture.js. */
/* Source and licensing information for the line(s) below can be found at http://www.gaia.com/sites/all/modules/gaiamtv_site/gaiamtv_onboard/gaiamtv_onboard.js. */
GaiatvLoadAngular = function(config) {
    var scripts = ['ui-bootstrap-tpls.js', 'angular-animate.js', 'angular-ui-router.js', 'angular-resource.js', 'angular-spinner.js', 'spin.js'],
        styles = ['bootstrap.css'];
    scripts = scripts.concat(config.app_scripts);
    styles = styles.concat(config.app_styles);
    if (window.location.hash.length > 1) window.location.hash = '';
    var loadScripts = $(function(d) {
        var angular_url = Drupal.settings.basePath + 'sites/all/modules/gaiamtv_site/gaiamtv_onboard/app/scripts/angular.js';
        $.ajax({
            url: angular_url,
            async: false,
            dataType: 'script',
            cache: false,
            success: function(data, textStatus, jqxhr) {
                var len = scripts.length;
                for (i = 0; i < len; i++) $.ajax({
                    url: config.scripts_path + scripts[i],
                    async: false,
                    dataType: 'script',
                    cache: true,
                    success: function(data, textStatus, jqxhr) {
                        if (i === len - 1 && !window.Drupal.settings.gtvOnboard.closed2) createElements()
                    }
                })
            }
        })
    }(document))

    function createElements() {
        var element = document.createElement('div');
        element.setAttribute('id', config.container.id);
        element.setAttribute('ng-controller', config.container.controller);
        element.setAttribute('ng-element-ready', '');
        var len = styles.length;
        for (var i = 0; i < len; i++) $.ajax({
            url: config.styles_path + styles[i],
            async: false,
            dataType: 'text',
            cache: true,
            success: function(data, textStatus, jqxhr) {
                window.Drupal.settings.gtvOnboard.scriptsLoaded = 1;
                var style = document.createElement('style');
                style.appendChild(document.createTextNode(data));
                element.appendChild(style);
                if (i === len - 1) {
                    document.getElementsByTagName('body')[0].appendChild(element);
                    $(document).trigger(config.container.id)
                }
            }
        })
    }
};
GaiatvUserOnboardInit = function(context) {
    if (window.Drupal.settings.gtvOnboard === undefined) window.Drupal.settings.gtvOnboard = {};
    var config = {
            container: {
                id: 'GaiatvUserOnboard',
                controller: 'ModalController'
            },
            scripts_path: Drupal.settings.basePath + 'sites/all/modules/gaiamtv_site/gaiamtv_onboard/app/scripts/',
            styles_path: Drupal.settings.basePath + 'sites/all/modules/gaiamtv_site/gaiamtv_onboard/app/styles/',
            app_scripts: ['app.js'],
            app_styles: ['app.css']
        },
        loadStyles = (function(d) {
            $(d).bind(config.container.id, function(e) {
                angular.element(d).ready(function() {
                    angular.bootstrap(d, [config.container.id])
                });
                $(d).bind('angularReady', function() {
                    window.setTimeout(function() {
                        angular.element(d.getElementById(config.container.id)).scope().open()
                    }, 100)
                })
            })
        }(document));
    GaiatvLoadAngular(config)
};
Drupal.behaviors.gaiatvCheckOnboardStatus = function(context) {
    var baseUrl = document.location.protocol + '//' + document.location.host + Drupal.settings.basePath;
    if (window.Drupal.settings.gtvOnboard !== undefined && window.Drupal.settings.gtvOnboard.statusChecked === undefined) {
        window.Drupal.settings.gtvOnboard.statusChecked = 1;
        if (window.Drupal.settings.gtvOnboard.closed2 !== null) {
            return
        } else GaiatvUserOnboardInit()
    }
};
/* Source and licensing information for the above line(s) can be found at http://www.gaia.com/sites/all/modules/gaiamtv_site/gaiamtv_onboard/gaiamtv_onboard.js. */
/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 2.8.2r1
*/
if (typeof YAHOO == "undefined" || !YAHOO) {
    var YAHOO = {};
}
YAHOO.namespace = function() {
    var A = arguments,
        E = null,
        C, B, D;
    for (C = 0; C < A.length; C = C + 1) {
        D = ("" + A[C]).split(".");
        E = YAHOO;
        for (B = (D[0] == "YAHOO") ? 1 : 0; B < D.length; B = B + 1) {
            E[D[B]] = E[D[B]] || {};
            E = E[D[B]];
        }
    }
    return E;
};
YAHOO.log = function(D, A, C) {
    var B = YAHOO.widget.Logger;
    if (B && B.log) {
        return B.log(D, A, C);
    } else {
        return false;
    }
};
YAHOO.register = function(A, E, D) {
    var I = YAHOO.env.modules,
        B, H, G, F, C;
    if (!I[A]) {
        I[A] = {
            versions: [],
            builds: []
        };
    }
    B = I[A];
    H = D.version;
    G = D.build;
    F = YAHOO.env.listeners;
    B.name = A;
    B.version = H;
    B.build = G;
    B.versions.push(H);
    B.builds.push(G);
    B.mainClass = E;
    for (C = 0; C < F.length; C = C + 1) {
        F[C](B);
    }
    if (E) {
        E.VERSION = H;
        E.BUILD = G;
    } else {
        YAHOO.log("mainClass is undefined for module " + A, "warn");
    }
};
YAHOO.env = YAHOO.env || {
    modules: [],
    listeners: []
};
YAHOO.env.getVersion = function(A) {
    return YAHOO.env.modules[A] || null;
};
YAHOO.env.ua = function() {
    var D = function(H) {
            var I = 0;
            return parseFloat(H.replace(/\./g, function() {
                return (I++ == 1) ? "" : ".";
            }));
        },
        G = navigator,
        F = {
            ie: 0,
            opera: 0,
            gecko: 0,
            webkit: 0,
            mobile: null,
            air: 0,
            caja: G.cajaVersion,
            secure: false,
            os: null
        },
        C = navigator && navigator.userAgent,
        E = window && window.location,
        B = E && E.href,
        A;
    F.secure = B && (B.toLowerCase().indexOf("https") === 0);
    if (C) {
        if ((/windows|win32/i).test(C)) {
            F.os = "windows";
        } else {
            if ((/macintosh/i).test(C)) {
                F.os = "macintosh";
            }
        }
        if ((/KHTML/).test(C)) {
            F.webkit = 1;
        }
        A = C.match(/AppleWebKit\/([^\s]*)/);
        if (A && A[1]) {
            F.webkit = D(A[1]);
            if (/ Mobile\//.test(C)) {
                F.mobile = "Apple";
            } else {
                A = C.match(/NokiaN[^\/]*/);
                if (A) {
                    F.mobile = A[0];
                }
            }
            A = C.match(/AdobeAIR\/([^\s]*)/);
            if (A) {
                F.air = A[0];
            }
        }
        if (!F.webkit) {
            A = C.match(/Opera[\s\/]([^\s]*)/);
            if (A && A[1]) {
                F.opera = D(A[1]);
                A = C.match(/Opera Mini[^;]*/);
                if (A) {
                    F.mobile = A[0];
                }
            } else {
                A = C.match(/MSIE\s([^;]*)/);
                if (A && A[1]) {
                    F.ie = D(A[1]);
                } else {
                    A = C.match(/Gecko\/([^\s]*)/);
                    if (A) {
                        F.gecko = 1;
                        A = C.match(/rv:([^\s\)]*)/);
                        if (A && A[1]) {
                            F.gecko = D(A[1]);
                        }
                    }
                }
            }
        }
    }
    return F;
}();
(function() {
    YAHOO.namespace("util", "widget", "example");
    if ("undefined" !== typeof YAHOO_config) {
        var B = YAHOO_config.listener,
            A = YAHOO.env.listeners,
            D = true,
            C;
        if (B) {
            for (C = 0; C < A.length; C++) {
                if (A[C] == B) {
                    D = false;
                    break;
                }
            }
            if (D) {
                A.push(B);
            }
        }
    }
})();
YAHOO.lang = YAHOO.lang || {};
(function() {
    var B = YAHOO.lang,
        A = Object.prototype,
        H = "[object Array]",
        C = "[object Function]",
        G = "[object Object]",
        E = [],
        F = ["toString", "valueOf"],
        D = {
            isArray: function(I) {
                return A.toString.apply(I) === H;
            },
            isBoolean: function(I) {
                return typeof I === "boolean";
            },
            isFunction: function(I) {
                return (typeof I === "function") || A.toString.apply(I) === C;
            },
            isNull: function(I) {
                return I === null;
            },
            isNumber: function(I) {
                return typeof I === "number" && isFinite(I);
            },
            isObject: function(I) {
                return (I && (typeof I === "object" || B.isFunction(I))) || false;
            },
            isString: function(I) {
                return typeof I === "string";
            },
            isUndefined: function(I) {
                return typeof I === "undefined";
            },
            _IEEnumFix: (YAHOO.env.ua.ie) ? function(K, J) {
                var I, M, L;
                for (I = 0; I < F.length; I = I + 1) {
                    M = F[I];
                    L = J[M];
                    if (B.isFunction(L) && L != A[M]) {
                        K[M] = L;
                    }
                }
            } : function() {},
            extend: function(L, M, K) {
                if (!M || !L) {
                    throw new Error("extend failed, please check that " + "all dependencies are included.");
                }
                var J = function() {},
                    I;
                J.prototype = M.prototype;
                L.prototype = new J();
                L.prototype.constructor = L;
                L.superclass = M.prototype;
                if (M.prototype.constructor == A.constructor) {
                    M.prototype.constructor = M;
                }
                if (K) {
                    for (I in K) {
                        if (B.hasOwnProperty(K, I)) {
                            L.prototype[I] = K[I];
                        }
                    }
                    B._IEEnumFix(L.prototype, K);
                }
            },
            augmentObject: function(M, L) {
                if (!L || !M) {
                    throw new Error("Absorb failed, verify dependencies.");
                }
                var I = arguments,
                    K, N, J = I[2];
                if (J && J !== true) {
                    for (K = 2; K < I.length; K = K + 1) {
                        M[I[K]] = L[I[K]];
                    }
                } else {
                    for (N in L) {
                        if (J || !(N in M)) {
                            M[N] = L[N];
                        }
                    }
                    B._IEEnumFix(M, L);
                }
            },
            augmentProto: function(L, K) {
                if (!K || !L) {
                    throw new Error("Augment failed, verify dependencies.");
                }
                var I = [L.prototype, K.prototype],
                    J;
                for (J = 2; J < arguments.length; J = J + 1) {
                    I.push(arguments[J]);
                }
                B.augmentObject.apply(this, I);
            },
            dump: function(I, N) {
                var K, M, P = [],
                    Q = "{...}",
                    J = "f(){...}",
                    O = ", ",
                    L = " => ";
                if (!B.isObject(I)) {
                    return I + "";
                } else {
                    if (I instanceof Date || ("nodeType" in I && "tagName" in I)) {
                        return I;
                    } else {
                        if (B.isFunction(I)) {
                            return J;
                        }
                    }
                }
                N = (B.isNumber(N)) ? N : 3;
                if (B.isArray(I)) {
                    P.push("[");
                    for (K = 0, M = I.length; K < M; K = K + 1) {
                        if (B.isObject(I[K])) {
                            P.push((N > 0) ? B.dump(I[K], N - 1) : Q);
                        } else {
                            P.push(I[K]);
                        }
                        P.push(O);
                    }
                    if (P.length > 1) {
                        P.pop();
                    }
                    P.push("]");
                } else {
                    P.push("{");
                    for (K in I) {
                        if (B.hasOwnProperty(I, K)) {
                            P.push(K + L);
                            if (B.isObject(I[K])) {
                                P.push((N > 0) ? B.dump(I[K], N - 1) : Q);
                            } else {
                                P.push(I[K]);
                            }
                            P.push(O);
                        }
                    }
                    if (P.length > 1) {
                        P.pop();
                    }
                    P.push("}");
                }
                return P.join("");
            },
            substitute: function(Y, J, R) {
                var N, M, L, U, V, X, T = [],
                    K, O = "dump",
                    S = " ",
                    I = "{",
                    W = "}",
                    Q, P;
                for (;;) {
                    N = Y.lastIndexOf(I);
                    if (N < 0) {
                        break;
                    }
                    M = Y.indexOf(W, N);
                    if (N + 1 >= M) {
                        break;
                    }
                    K = Y.substring(N + 1, M);
                    U = K;
                    X = null;
                    L = U.indexOf(S);
                    if (L > -1) {
                        X = U.substring(L + 1);
                        U = U.substring(0, L);
                    }
                    V = J[U];
                    if (R) {
                        V = R(U, V, X);
                    }
                    if (B.isObject(V)) {
                        if (B.isArray(V)) {
                            V = B.dump(V, parseInt(X, 10));
                        } else {
                            X = X || "";
                            Q = X.indexOf(O);
                            if (Q > -1) {
                                X = X.substring(4);
                            }
                            P = V.toString();
                            if (P === G || Q > -1) {
                                V = B.dump(V, parseInt(X, 10));
                            } else {
                                V = P;
                            }
                        }
                    } else {
                        if (!B.isString(V) && !B.isNumber(V)) {
                            V = "~-" + T.length + "-~";
                            T[T.length] = K;
                        }
                    }
                    Y = Y.substring(0, N) + V + Y.substring(M + 1);
                }
                for (N = T.length - 1; N >= 0; N = N - 1) {
                    Y = Y.replace(new RegExp("~-" + N + "-~"), "{" + T[N] + "}", "g");
                }
                return Y;
            },
            trim: function(I) {
                try {
                    return I.replace(/^\s+|\s+$/g, "");
                } catch (J) {
                    return I;
                }
            },
            merge: function() {
                var L = {},
                    J = arguments,
                    I = J.length,
                    K;
                for (K = 0; K < I; K = K + 1) {
                    B.augmentObject(L, J[K], true);
                }
                return L;
            },
            later: function(P, J, Q, L, M) {
                P = P || 0;
                J = J || {};
                var K = Q,
                    O = L,
                    N, I;
                if (B.isString(Q)) {
                    K = J[Q];
                }
                if (!K) {
                    throw new TypeError("method undefined");
                }
                if (O && !B.isArray(O)) {
                    O = [L];
                }
                N = function() {
                    K.apply(J, O || E);
                };
                I = (M) ? setInterval(N, P) : setTimeout(N, P);
                return {
                    interval: M,
                    cancel: function() {
                        if (this.interval) {
                            clearInterval(I);
                        } else {
                            clearTimeout(I);
                        }
                    }
                };
            },
            isValue: function(I) {
                return (B.isObject(I) || B.isString(I) || B.isNumber(I) || B.isBoolean(I));
            }
        };
    B.hasOwnProperty = (A.hasOwnProperty) ? function(I, J) {
        return I && I.hasOwnProperty(J);
    } : function(I, J) {
        return !B.isUndefined(I[J]) && I.constructor.prototype[J] !== I[J];
    };
    D.augmentObject(B, D, true);
    YAHOO.util.Lang = B;
    B.augment = B.augmentProto;
    YAHOO.augment = B.augmentProto;
    YAHOO.extend = B.extend;
})();
YAHOO.register("yahoo", YAHOO, {
    version: "2.8.2r1",
    build: "7"
});
YAHOO.util.Get = function() {
    var M = {},
        L = 0,
        R = 0,
        E = false,
        N = YAHOO.env.ua,
        S = YAHOO.lang;
    var J = function(W, T, X) {
        var U = X || window,
            Y = U.document,
            Z = Y.createElement(W);
        for (var V in T) {
            if (T[V] && YAHOO.lang.hasOwnProperty(T, V)) {
                Z.setAttribute(V, T[V]);
            }
        }
        return Z;
    };
    var I = function(U, V, T) {
        var W = {
            id: "yui__dyn_" + (R++),
            type: "text/css",
            rel: "stylesheet",
            href: U
        };
        if (T) {
            S.augmentObject(W, T);
        }
        return J("link", W, V);
    };
    var P = function(U, V, T) {
        var W = {
            id: "yui__dyn_" + (R++),
            type: "text/javascript",
            src: U
        };
        if (T) {
            S.augmentObject(W, T);
        }
        return J("script", W, V);
    };
    var A = function(T, U) {
        return {
            tId: T.tId,
            win: T.win,
            data: T.data,
            nodes: T.nodes,
            msg: U,
            purge: function() {
                D(this.tId);
            }
        };
    };
    var B = function(T, W) {
        var U = M[W],
            V = (S.isString(T)) ? U.win.document.getElementById(T) : T;
        if (!V) {
            Q(W, "target node not found: " + T);
        }
        return V;
    };
    var Q = function(W, V) {
        var T = M[W];
        if (T.onFailure) {
            var U = T.scope || T.win;
            T.onFailure.call(U, A(T, V));
        }
    };
    var C = function(W) {
        var T = M[W];
        T.finished = true;
        if (T.aborted) {
            var V = "transaction " + W + " was aborted";
            Q(W, V);
            return;
        }
        if (T.onSuccess) {
            var U = T.scope || T.win;
            T.onSuccess.call(U, A(T));
        }
    };
    var O = function(V) {
        var T = M[V];
        if (T.onTimeout) {
            var U = T.scope || T;
            T.onTimeout.call(U, A(T));
        }
    };
    var G = function(V, Z) {
        var U = M[V];
        if (U.timer) {
            U.timer.cancel();
        }
        if (U.aborted) {
            var X = "transaction " + V + " was aborted";
            Q(V, X);
            return;
        }
        if (Z) {
            U.url.shift();
            if (U.varName) {
                U.varName.shift();
            }
        } else {
            U.url = (S.isString(U.url)) ? [U.url] : U.url;
            if (U.varName) {
                U.varName = (S.isString(U.varName)) ? [U.varName] : U.varName;
            }
        }
        var c = U.win,
            b = c.document,
            a = b.getElementsByTagName("head")[0],
            W;
        if (U.url.length === 0) {
            if (U.type === "script" && N.webkit && N.webkit < 420 && !U.finalpass && !U.varName) {
                var Y = P(null, U.win, U.attributes);
                Y.innerHTML = 'YAHOO.util.Get._finalize("' + V + '");';
                U.nodes.push(Y);
                a.appendChild(Y);
            } else {
                C(V);
            }
            return;
        }
        var T = U.url[0];
        if (!T) {
            U.url.shift();
            return G(V);
        }
        if (U.timeout) {
            U.timer = S.later(U.timeout, U, O, V);
        }
        if (U.type === "script") {
            W = P(T, c, U.attributes);
        } else {
            W = I(T, c, U.attributes);
        }
        F(U.type, W, V, T, c, U.url.length);
        U.nodes.push(W);
        if (U.insertBefore) {
            var e = B(U.insertBefore, V);
            if (e) {
                e.parentNode.insertBefore(W, e);
            }
        } else {
            a.appendChild(W);
        }
        if ((N.webkit || N.gecko) && U.type === "css") {
            G(V, T);
        }
    };
    var K = function() {
        if (E) {
            return;
        }
        E = true;
        for (var T in M) {
            var U = M[T];
            if (U.autopurge && U.finished) {
                D(U.tId);
                delete M[T];
            }
        }
        E = false;
    };
    var D = function(Z) {
        if (M[Z]) {
            var T = M[Z],
                U = T.nodes,
                X = U.length,
                c = T.win.document,
                a = c.getElementsByTagName("head")[0],
                V, Y, W, b;
            if (T.insertBefore) {
                V = B(T.insertBefore, Z);
                if (V) {
                    a = V.parentNode;
                }
            }
            for (Y = 0; Y < X; Y = Y + 1) {
                W = U[Y];
                if (W.clearAttributes) {
                    W.clearAttributes();
                } else {
                    for (b in W) {
                        delete W[b];
                    }
                }
                a.removeChild(W);
            }
            T.nodes = [];
        }
    };
    var H = function(U, T, V) {
        var X = "q" + (L++);
        V = V || {};
        if (L % YAHOO.util.Get.PURGE_THRESH === 0) {
            K();
        }
        M[X] = S.merge(V, {
            tId: X,
            type: U,
            url: T,
            finished: false,
            aborted: false,
            nodes: []
        });
        var W = M[X];
        W.win = W.win || window;
        W.scope = W.scope || W.win;
        W.autopurge = ("autopurge" in W) ? W.autopurge : (U === "script") ? true : false;
        if (V.charset) {
            W.attributes = W.attributes || {};
            W.attributes.charset = V.charset;
        }
        S.later(0, W, G, X);
        return {
            tId: X
        };
    };
    var F = function(c, X, W, U, Y, Z, b) {
        var a = b || G;
        if (N.ie) {
            X.onreadystatechange = function() {
                var d = this.readyState;
                if ("loaded" === d || "complete" === d) {
                    X.onreadystatechange = null;
                    a(W, U);
                }
            };
        } else {
            if (N.webkit) {
                if (c === "script") {
                    if (N.webkit >= 420) {
                        X.addEventListener("load", function() {
                            a(W, U);
                        });
                    } else {
                        var T = M[W];
                        if (T.varName) {
                            var V = YAHOO.util.Get.POLL_FREQ;
                            T.maxattempts = YAHOO.util.Get.TIMEOUT / V;
                            T.attempts = 0;
                            T._cache = T.varName[0].split(".");
                            T.timer = S.later(V, T, function(j) {
                                var f = this._cache,
                                    e = f.length,
                                    d = this.win,
                                    g;
                                for (g = 0; g < e; g = g + 1) {
                                    d = d[f[g]];
                                    if (!d) {
                                        this.attempts++;
                                        if (this.attempts++ > this.maxattempts) {
                                            var h = "Over retry limit, giving up";
                                            T.timer.cancel();
                                            Q(W, h);
                                        } else {}
                                        return;
                                    }
                                }
                                T.timer.cancel();
                                a(W, U);
                            }, null, true);
                        } else {
                            S.later(YAHOO.util.Get.POLL_FREQ, null, a, [W, U]);
                        }
                    }
                }
            } else {
                X.onload = function() {
                    a(W, U);
                };
            }
        }
    };
    return {
        POLL_FREQ: 10,
        PURGE_THRESH: 20,
        TIMEOUT: 2000,
        _finalize: function(T) {
            S.later(0, null, C, T);
        },
        abort: function(U) {
            var V = (S.isString(U)) ? U : U.tId;
            var T = M[V];
            if (T) {
                T.aborted = true;
            }
        },
        script: function(T, U) {
            return H("script", T, U);
        },
        css: function(T, U) {
            return H("css", T, U);
        }
    };
}();
YAHOO.register("get", YAHOO.util.Get, {
    version: "2.8.2r1",
    build: "7"
});
(function() {
    var Y = YAHOO,
        util = Y.util,
        lang = Y.lang,
        env = Y.env,
        PROV = "_provides",
        SUPER = "_supersedes",
        REQ = "expanded",
        AFTER = "_after";
    var YUI = {
        dupsAllowed: {
            "yahoo": true,
            "get": true
        },
        info: {
            "root": "2.8.2r1/build/",
            "base": "http://yui.yahooapis.com/2.8.2r1/build/",
            "comboBase": "http://yui.yahooapis.com/combo?",
            "skin": {
                "defaultSkin": "sam",
                "base": "assets/skins/",
                "path": "skin.css",
                "after": ["reset", "fonts", "grids", "base"],
                "rollup": 3
            },
            dupsAllowed: ["yahoo", "get"],
            "moduleInfo": {
                "animation": {
                    "type": "js",
                    "path": "animation/animation-min.js",
                    "requires": ["dom", "event"]
                },
                "autocomplete": {
                    "type": "js",
                    "path": "autocomplete/autocomplete-min.js",
                    "requires": ["dom", "event", "datasource"],
                    "optional": ["connection", "animation"],
                    "skinnable": true
                },
                "base": {
                    "type": "css",
                    "path": "base/base-min.css",
                    "after": ["reset", "fonts", "grids"]
                },
                "button": {
                    "type": "js",
                    "path": "button/button-min.js",
                    "requires": ["element"],
                    "optional": ["menu"],
                    "skinnable": true
                },
                "calendar": {
                    "type": "js",
                    "path": "calendar/calendar-min.js",
                    "requires": ["event", "dom"],
                    supersedes: ["datemeth"],
                    "skinnable": true
                },
                "carousel": {
                    "type": "js",
                    "path": "carousel/carousel-min.js",
                    "requires": ["element"],
                    "optional": ["animation"],
                    "skinnable": true
                },
                "charts": {
                    "type": "js",
                    "path": "charts/charts-min.js",
                    "requires": ["element", "json", "datasource", "swf"]
                },
                "colorpicker": {
                    "type": "js",
                    "path": "colorpicker/colorpicker-min.js",
                    "requires": ["slider", "element"],
                    "optional": ["animation"],
                    "skinnable": true
                },
                "connection": {
                    "type": "js",
                    "path": "connection/connection-min.js",
                    "requires": ["event"],
                    "supersedes": ["connectioncore"]
                },
                "connectioncore": {
                    "type": "js",
                    "path": "connection/connection_core-min.js",
                    "requires": ["event"],
                    "pkg": "connection"
                },
                "container": {
                    "type": "js",
                    "path": "container/container-min.js",
                    "requires": ["dom", "event"],
                    "optional": ["dragdrop", "animation", "connection"],
                    "supersedes": ["containercore"],
                    "skinnable": true
                },
                "containercore": {
                    "type": "js",
                    "path": "container/container_core-min.js",
                    "requires": ["dom", "event"],
                    "pkg": "container"
                },
                "cookie": {
                    "type": "js",
                    "path": "cookie/cookie-min.js",
                    "requires": ["yahoo"]
                },
                "datasource": {
                    "type": "js",
                    "path": "datasource/datasource-min.js",
                    "requires": ["event"],
                    "optional": ["connection"]
                },
                "datatable": {
                    "type": "js",
                    "path": "datatable/datatable-min.js",
                    "requires": ["element", "datasource"],
                    "optional": ["calendar", "dragdrop", "paginator"],
                    "skinnable": true
                },
                datemath: {
                    "type": "js",
                    "path": "datemath/datemath-min.js",
                    "requires": ["yahoo"]
                },
                "dom": {
                    "type": "js",
                    "path": "dom/dom-min.js",
                    "requires": ["yahoo"]
                },
                "dragdrop": {
                    "type": "js",
                    "path": "dragdrop/dragdrop-min.js",
                    "requires": ["dom", "event"]
                },
                "editor": {
                    "type": "js",
                    "path": "editor/editor-min.js",
                    "requires": ["menu", "element", "button"],
                    "optional": ["animation", "dragdrop"],
                    "supersedes": ["simpleeditor"],
                    "skinnable": true
                },
                "element": {
                    "type": "js",
                    "path": "element/element-min.js",
                    "requires": ["dom", "event"],
                    "optional": ["event-mouseenter", "event-delegate"]
                },
                "element-delegate": {
                    "type": "js",
                    "path": "element-delegate/element-delegate-min.js",
                    "requires": ["element"]
                },
                "event": {
                    "type": "js",
                    "path": "event/event-min.js",
                    "requires": ["yahoo"]
                },
                "event-simulate": {
                    "type": "js",
                    "path": "event-simulate/event-simulate-min.js",
                    "requires": ["event"]
                },
                "event-delegate": {
                    "type": "js",
                    "path": "event-delegate/event-delegate-min.js",
                    "requires": ["event"],
                    "optional": ["selector"]
                },
                "event-mouseenter": {
                    "type": "js",
                    "path": "event-mouseenter/event-mouseenter-min.js",
                    "requires": ["dom", "event"]
                },
                "fonts": {
                    "type": "css",
                    "path": "fonts/fonts-min.css"
                },
                "get": {
                    "type": "js",
                    "path": "get/get-min.js",
                    "requires": ["yahoo"]
                },
                "grids": {
                    "type": "css",
                    "path": "grids/grids-min.css",
                    "requires": ["fonts"],
                    "optional": ["reset"]
                },
                "history": {
                    "type": "js",
                    "path": "history/history-min.js",
                    "requires": ["event"]
                },
                "imagecropper": {
                    "type": "js",
                    "path": "imagecropper/imagecropper-min.js",
                    "requires": ["dragdrop", "element", "resize"],
                    "skinnable": true
                },
                "imageloader": {
                    "type": "js",
                    "path": "imageloader/imageloader-min.js",
                    "requires": ["event", "dom"]
                },
                "json": {
                    "type": "js",
                    "path": "json/json-min.js",
                    "requires": ["yahoo"]
                },
                "layout": {
                    "type": "js",
                    "path": "layout/layout-min.js",
                    "requires": ["element"],
                    "optional": ["animation", "dragdrop", "resize", "selector"],
                    "skinnable": true
                },
                "logger": {
                    "type": "js",
                    "path": "logger/logger-min.js",
                    "requires": ["event", "dom"],
                    "optional": ["dragdrop"],
                    "skinnable": true
                },
                "menu": {
                    "type": "js",
                    "path": "menu/menu-min.js",
                    "requires": ["containercore"],
                    "skinnable": true
                },
                "paginator": {
                    "type": "js",
                    "path": "paginator/paginator-min.js",
                    "requires": ["element"],
                    "skinnable": true
                },
                "profiler": {
                    "type": "js",
                    "path": "profiler/profiler-min.js",
                    "requires": ["yahoo"]
                },
                "profilerviewer": {
                    "type": "js",
                    "path": "profilerviewer/profilerviewer-min.js",
                    "requires": ["profiler", "yuiloader", "element"],
                    "skinnable": true
                },
                "progressbar": {
                    "type": "js",
                    "path": "progressbar/progressbar-min.js",
                    "requires": ["element"],
                    "optional": ["animation"],
                    "skinnable": true
                },
                "reset": {
                    "type": "css",
                    "path": "reset/reset-min.css"
                },
                "reset-fonts-grids": {
                    "type": "css",
                    "path": "reset-fonts-grids/reset-fonts-grids.css",
                    "supersedes": ["reset", "fonts", "grids", "reset-fonts"],
                    "rollup": 4
                },
                "reset-fonts": {
                    "type": "css",
                    "path": "reset-fonts/reset-fonts.css",
                    "supersedes": ["reset", "fonts"],
                    "rollup": 2
                },
                "resize": {
                    "type": "js",
                    "path": "resize/resize-min.js",
                    "requires": ["dragdrop", "element"],
                    "optional": ["animation"],
                    "skinnable": true
                },
                "selector": {
                    "type": "js",
                    "path": "selector/selector-min.js",
                    "requires": ["yahoo", "dom"]
                },
                "simpleeditor": {
                    "type": "js",
                    "path": "editor/simpleeditor-min.js",
                    "requires": ["element"],
                    "optional": ["containercore", "menu", "button", "animation", "dragdrop"],
                    "skinnable": true,
                    "pkg": "editor"
                },
                "slider": {
                    "type": "js",
                    "path": "slider/slider-min.js",
                    "requires": ["dragdrop"],
                    "optional": ["animation"],
                    "skinnable": true
                },
                "storage": {
                    "type": "js",
                    "path": "storage/storage-min.js",
                    "requires": ["yahoo", "event", "cookie"],
                    "optional": ["swfstore"]
                },
                "stylesheet": {
                    "type": "js",
                    "path": "stylesheet/stylesheet-min.js",
                    "requires": ["yahoo"]
                },
                "swf": {
                    "type": "js",
                    "path": "swf/swf-min.js",
                    "requires": ["element"],
                    "supersedes": ["swfdetect"]
                },
                "swfdetect": {
                    "type": "js",
                    "path": "swfdetect/swfdetect-min.js",
                    "requires": ["yahoo"]
                },
                "swfstore": {
                    "type": "js",
                    "path": "swfstore/swfstore-min.js",
                    "requires": ["element", "cookie", "swf"]
                },
                "tabview": {
                    "type": "js",
                    "path": "tabview/tabview-min.js",
                    "requires": ["element"],
                    "optional": ["connection"],
                    "skinnable": true
                },
                "treeview": {
                    "type": "js",
                    "path": "treeview/treeview-min.js",
                    "requires": ["event", "dom"],
                    "optional": ["json", "animation", "calendar"],
                    "skinnable": true
                },
                "uploader": {
                    "type": "js",
                    "path": "uploader/uploader-min.js",
                    "requires": ["element"]
                },
                "utilities": {
                    "type": "js",
                    "path": "utilities/utilities.js",
                    "supersedes": ["yahoo", "event", "dragdrop", "animation", "dom", "connection", "element", "yahoo-dom-event", "get", "yuiloader", "yuiloader-dom-event"],
                    "rollup": 8
                },
                "yahoo": {
                    "type": "js",
                    "path": "yahoo/yahoo-min.js"
                },
                "yahoo-dom-event": {
                    "type": "js",
                    "path": "yahoo-dom-event/yahoo-dom-event.js",
                    "supersedes": ["yahoo", "event", "dom"],
                    "rollup": 3
                },
                "yuiloader": {
                    "type": "js",
                    "path": "yuiloader/yuiloader-min.js",
                    "supersedes": ["yahoo", "get"]
                },
                "yuiloader-dom-event": {
                    "type": "js",
                    "path": "yuiloader-dom-event/yuiloader-dom-event.js",
                    "supersedes": ["yahoo", "dom", "event", "get", "yuiloader", "yahoo-dom-event"],
                    "rollup": 5
                },
                "yuitest": {
                    "type": "js",
                    "path": "yuitest/yuitest-min.js",
                    "requires": ["logger"],
                    "optional": ["event-simulate"],
                    "skinnable": true
                }
            }
        },
        ObjectUtil: {
            appendArray: function(o, a) {
                if (a) {
                    for (var i = 0; i < a.length; i = i + 1) {
                        o[a[i]] = true;
                    }
                }
            },
            keys: function(o, ordered) {
                var a = [],
                    i;
                for (i in o) {
                    if (lang.hasOwnProperty(o, i)) {
                        a.push(i);
                    }
                }
                return a;
            }
        },
        ArrayUtil: {
            appendArray: function(a1, a2) {
                Array.prototype.push.apply(a1, a2);
            },
            indexOf: function(a, val) {
                for (var i = 0; i < a.length; i = i + 1) {
                    if (a[i] === val) {
                        return i;
                    }
                }
                return -1;
            },
            toObject: function(a) {
                var o = {};
                for (var i = 0; i < a.length; i = i + 1) {
                    o[a[i]] = true;
                }
                return o;
            },
            uniq: function(a) {
                return YUI.ObjectUtil.keys(YUI.ArrayUtil.toObject(a));
            }
        }
    };
    YAHOO.util.YUILoader = function(o) {
        this._internalCallback = null;
        this._useYahooListener = false;
        this.onSuccess = null;
        this.onFailure = Y.log;
        this.onProgress = null;
        this.onTimeout = null;
        this.scope = this;
        this.data = null;
        this.insertBefore = null;
        this.charset = null;
        this.varName = null;
        this.base = YUI.info.base;
        this.comboBase = YUI.info.comboBase;
        this.combine = false;
        this.root = YUI.info.root;
        this.timeout = 0;
        this.ignore = null;
        this.force = null;
        this.allowRollup = true;
        this.filter = null;
        this.required = {};
        this.moduleInfo = lang.merge(YUI.info.moduleInfo);
        this.rollups = null;
        this.loadOptional = false;
        this.sorted = [];
        this.loaded = {};
        this.dirty = true;
        this.inserted = {};
        var self = this;
        env.listeners.push(function(m) {
            if (self._useYahooListener) {
                self.loadNext(m.name);
            }
        });
        this.skin = lang.merge(YUI.info.skin);
        this._config(o);
    };
    Y.util.YUILoader.prototype = {
        FILTERS: {
            RAW: {
                "searchExp": "-min\\.js",
                "replaceStr": ".js"
            },
            DEBUG: {
                "searchExp": "-min\\.js",
                "replaceStr": "-debug.js"
            }
        },
        SKIN_PREFIX: "skin-",
        _config: function(o) {
            if (o) {
                for (var i in o) {
                    if (lang.hasOwnProperty(o, i)) {
                        if (i == "require") {
                            this.require(o[i]);
                        } else {
                            this[i] = o[i];
                        }
                    }
                }
            }
            var f = this.filter;
            if (lang.isString(f)) {
                f = f.toUpperCase();
                if (f === "DEBUG") {
                    this.require("logger");
                }
                if (!Y.widget.LogWriter) {
                    Y.widget.LogWriter = function() {
                        return Y;
                    };
                }
                this.filter = this.FILTERS[f];
            }
        },
        addModule: function(o) {
            if (!o || !o.name || !o.type || (!o.path && !o.fullpath)) {
                return false;
            }
            o.ext = ("ext" in o) ? o.ext : true;
            o.requires = o.requires || [];
            this.moduleInfo[o.name] = o;
            this.dirty = true;
            return true;
        },
        require: function(what) {
            var a = (typeof what === "string") ? arguments : what;
            this.dirty = true;
            YUI.ObjectUtil.appendArray(this.required, a);
        },
        _addSkin: function(skin, mod) {
            var name = this.formatSkin(skin),
                info = this.moduleInfo,
                sinf = this.skin,
                ext = info[mod] && info[mod].ext;
            if (!info[name]) {
                this.addModule({
                    "name": name,
                    "type": "css",
                    "path": sinf.base + skin + "/" + sinf.path,
                    "after": sinf.after,
                    "rollup": sinf.rollup,
                    "ext": ext
                });
            }
            if (mod) {
                name = this.formatSkin(skin, mod);
                if (!info[name]) {
                    var mdef = info[mod],
                        pkg = mdef.pkg || mod;
                    this.addModule({
                        "name": name,
                        "type": "css",
                        "after": sinf.after,
                        "path": pkg + "/" + sinf.base + skin + "/" + mod + ".css",
                        "ext": ext
                    });
                }
            }
            return name;
        },
        getRequires: function(mod) {
            if (!mod) {
                return [];
            }
            if (!this.dirty && mod.expanded) {
                return mod.expanded;
            }
            mod.requires = mod.requires || [];
            var i, d = [],
                r = mod.requires,
                o = mod.optional,
                info = this.moduleInfo,
                m;
            for (i = 0; i < r.length; i = i + 1) {
                d.push(r[i]);
                m = info[r[i]];
                YUI.ArrayUtil.appendArray(d, this.getRequires(m));
            }
            if (o && this.loadOptional) {
                for (i = 0; i < o.length; i = i + 1) {
                    d.push(o[i]);
                    YUI.ArrayUtil.appendArray(d, this.getRequires(info[o[i]]));
                }
            }
            mod.expanded = YUI.ArrayUtil.uniq(d);
            return mod.expanded;
        },
        getProvides: function(name, notMe) {
            var addMe = !(notMe),
                ckey = (addMe) ? PROV : SUPER,
                m = this.moduleInfo[name],
                o = {};
            if (!m) {
                return o;
            }
            if (m[ckey]) {
                return m[ckey];
            }
            var s = m.supersedes,
                done = {},
                me = this;
            var add = function(mm) {
                if (!done[mm]) {
                    done[mm] = true;
                    lang.augmentObject(o, me.getProvides(mm));
                }
            };
            if (s) {
                for (var i = 0; i < s.length; i = i + 1) {
                    add(s[i]);
                }
            }
            m[SUPER] = o;
            m[PROV] = lang.merge(o);
            m[PROV][name] = true;
            return m[ckey];
        },
        calculate: function(o) {
            if (o || this.dirty) {
                this._config(o);
                this._setup();
                this._explode();
                if (this.allowRollup) {
                    this._rollup();
                }
                this._reduce();
                this._sort();
                this.dirty = false;
            }
        },
        _setup: function() {
            var info = this.moduleInfo,
                name, i, j;
            for (name in info) {
                if (lang.hasOwnProperty(info, name)) {
                    var m = info[name];
                    if (m && m.skinnable) {
                        var o = this.skin.overrides,
                            smod;
                        if (o && o[name]) {
                            for (i = 0; i < o[name].length; i = i + 1) {
                                smod = this._addSkin(o[name][i], name);
                            }
                        } else {
                            smod = this._addSkin(this.skin.defaultSkin, name);
                        }
                        m.requires.push(smod);
                    }
                }
            }
            var l = lang.merge(this.inserted);
            if (!this._sandbox) {
                l = lang.merge(l, env.modules);
            }
            if (this.ignore) {
                YUI.ObjectUtil.appendArray(l, this.ignore);
            }
            if (this.force) {
                for (i = 0; i < this.force.length; i = i + 1) {
                    if (this.force[i] in l) {
                        delete l[this.force[i]];
                    }
                }
            }
            for (j in l) {
                if (lang.hasOwnProperty(l, j)) {
                    lang.augmentObject(l, this.getProvides(j));
                }
            }
            this.loaded = l;
        },
        _explode: function() {
            var r = this.required,
                i, mod;
            for (i in r) {
                if (lang.hasOwnProperty(r, i)) {
                    mod = this.moduleInfo[i];
                    if (mod) {
                        var req = this.getRequires(mod);
                        if (req) {
                            YUI.ObjectUtil.appendArray(r, req);
                        }
                    }
                }
            }
        },
        _skin: function() {},
        formatSkin: function(skin, mod) {
            var s = this.SKIN_PREFIX + skin;
            if (mod) {
                s = s + "-" + mod;
            }
            return s;
        },
        parseSkin: function(mod) {
            if (mod.indexOf(this.SKIN_PREFIX) === 0) {
                var a = mod.split("-");
                return {
                    skin: a[1],
                    module: a[2]
                };
            }
            return null;
        },
        _rollup: function() {
            var i, j, m, s, rollups = {},
                r = this.required,
                roll, info = this.moduleInfo;
            if (this.dirty || !this.rollups) {
                for (i in info) {
                    if (lang.hasOwnProperty(info, i)) {
                        m = info[i];
                        if (m && m.rollup) {
                            rollups[i] = m;
                        }
                    }
                }
                this.rollups = rollups;
            }
            for (;;) {
                var rolled = false;
                for (i in rollups) {
                    if (!r[i] && !this.loaded[i]) {
                        m = info[i];
                        s = m.supersedes;
                        roll = false;
                        if (!m.rollup) {
                            continue;
                        }
                        var skin = (m.ext) ? false : this.parseSkin(i),
                            c = 0;
                        if (skin) {
                            for (j in r) {
                                if (lang.hasOwnProperty(r, j)) {
                                    if (i !== j && this.parseSkin(j)) {
                                        c++;
                                        roll = (c >= m.rollup);
                                        if (roll) {
                                            break;
                                        }
                                    }
                                }
                            }
                        } else {
                            for (j = 0; j < s.length; j = j + 1) {
                                if (this.loaded[s[j]] && (!YUI.dupsAllowed[s[j]])) {
                                    roll = false;
                                    break;
                                } else {
                                    if (r[s[j]]) {
                                        c++;
                                        roll = (c >= m.rollup);
                                        if (roll) {
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        if (roll) {
                            r[i] = true;
                            rolled = true;
                            this.getRequires(m);
                        }
                    }
                }
                if (!rolled) {
                    break;
                }
            }
        },
        _reduce: function() {
            var i, j, s, m, r = this.required;
            for (i in r) {
                if (i in this.loaded) {
                    delete r[i];
                } else {
                    var skinDef = this.parseSkin(i);
                    if (skinDef) {
                        if (!skinDef.module) {
                            var skin_pre = this.SKIN_PREFIX + skinDef.skin;
                            for (j in r) {
                                if (lang.hasOwnProperty(r, j)) {
                                    m = this.moduleInfo[j];
                                    var ext = m && m.ext;
                                    if (!ext && j !== i && j.indexOf(skin_pre) > -1) {
                                        delete r[j];
                                    }
                                }
                            }
                        }
                    } else {
                        m = this.moduleInfo[i];
                        s = m && m.supersedes;
                        if (s) {
                            for (j = 0; j < s.length; j = j + 1) {
                                if (s[j] in r) {
                                    delete r[s[j]];
                                }
                            }
                        }
                    }
                }
            }
        },
        _onFailure: function(msg) {
            YAHOO.log("Failure", "info", "loader");
            var f = this.onFailure;
            if (f) {
                f.call(this.scope, {
                    msg: "failure: " + msg,
                    data: this.data,
                    success: false
                });
            }
        },
        _onTimeout: function() {
            YAHOO.log("Timeout", "info", "loader");
            var f = this.onTimeout;
            if (f) {
                f.call(this.scope, {
                    msg: "timeout",
                    data: this.data,
                    success: false
                });
            }
        },
        _sort: function() {
            var s = [],
                info = this.moduleInfo,
                loaded = this.loaded,
                checkOptional = !this.loadOptional,
                me = this;
            var requires = function(aa, bb) {
                var mm = info[aa];
                if (loaded[bb] || !mm) {
                    return false;
                }
                var ii, rr = mm.expanded,
                    after = mm.after,
                    other = info[bb],
                    optional = mm.optional;
                if (rr && YUI.ArrayUtil.indexOf(rr, bb) > -1) {
                    return true;
                }
                if (after && YUI.ArrayUtil.indexOf(after, bb) > -1) {
                    return true;
                }
                if (checkOptional && optional && YUI.ArrayUtil.indexOf(optional, bb) > -1) {
                    return true;
                }
                var ss = info[bb] && info[bb].supersedes;
                if (ss) {
                    for (ii = 0; ii < ss.length; ii = ii + 1) {
                        if (requires(aa, ss[ii])) {
                            return true;
                        }
                    }
                }
                if (mm.ext && mm.type == "css" && !other.ext && other.type == "css") {
                    return true;
                }
                return false;
            };
            for (var i in this.required) {
                if (lang.hasOwnProperty(this.required, i)) {
                    s.push(i);
                }
            }
            var p = 0;
            for (;;) {
                var l = s.length,
                    a, b, j, k, moved = false;
                for (j = p; j < l; j = j + 1) {
                    a = s[j];
                    for (k = j + 1; k < l; k = k + 1) {
                        if (requires(a, s[k])) {
                            b = s.splice(k, 1);
                            s.splice(j, 0, b[0]);
                            moved = true;
                            break;
                        }
                    }
                    if (moved) {
                        break;
                    } else {
                        p = p + 1;
                    }
                }
                if (!moved) {
                    break;
                }
            }
            this.sorted = s;
        },
        toString: function() {
            var o = {
                type: "YUILoader",
                base: this.base,
                filter: this.filter,
                required: this.required,
                loaded: this.loaded,
                inserted: this.inserted
            };
            lang.dump(o, 1);
        },
        _combine: function() {
            this._combining = [];
            var self = this,
                s = this.sorted,
                len = s.length,
                js = this.comboBase,
                css = this.comboBase,
                target, startLen = js.length,
                i, m, type = this.loadType;
            YAHOO.log("type " + type);
            for (i = 0; i < len; i = i + 1) {
                m = this.moduleInfo[s[i]];
                if (m && !m.ext && (!type || type === m.type)) {
                    target = this.root + m.path;
                    target += "&";
                    if (m.type == "js") {
                        js += target;
                    } else {
                        css += target;
                    }
                    this._combining.push(s[i]);
                }
            }
            if (this._combining.length) {
                YAHOO.log("Attempting to combine: " + this._combining, "info", "loader");
                var callback = function(o) {
                        var c = this._combining,
                            len = c.length,
                            i, m;
                        for (i = 0; i < len; i = i + 1) {
                            this.inserted[c[i]] = true;
                        }
                        this.loadNext(o.data);
                    },
                    loadScript = function() {
                        if (js.length > startLen) {
                            YAHOO.util.Get.script(self._filter(js), {
                                data: self._loading,
                                onSuccess: callback,
                                onFailure: self._onFailure,
                                onTimeout: self._onTimeout,
                                insertBefore: self.insertBefore,
                                charset: self.charset,
                                timeout: self.timeout,
                                scope: self
                            });
                        }
                    };
                if (css.length > startLen) {
                    YAHOO.util.Get.css(this._filter(css), {
                        data: this._loading,
                        onSuccess: loadScript,
                        onFailure: this._onFailure,
                        onTimeout: this._onTimeout,
                        insertBefore: this.insertBefore,
                        charset: this.charset,
                        timeout: this.timeout,
                        scope: self
                    });
                } else {
                    loadScript();
                }
                return;
            } else {
                this.loadNext(this._loading);
            }
        },
        insert: function(o, type) {
            this.calculate(o);
            this._loading = true;
            this.loadType = type;
            if (this.combine) {
                return this._combine();
            }
            if (!type) {
                var self = this;
                this._internalCallback = function() {
                    self._internalCallback = null;
                    self.insert(null, "js");
                };
                this.insert(null, "css");
                return;
            }
            this.loadNext();
        },
        sandbox: function(o, type) {
            this._config(o);
            if (!this.onSuccess) {
                throw new Error("You must supply an onSuccess handler for your sandbox");
            }
            this._sandbox = true;
            var self = this;
            if (!type || type !== "js") {
                this._internalCallback = function() {
                    self._internalCallback = null;
                    self.sandbox(null, "js");
                };
                this.insert(null, "css");
                return;
            }
            if (!util.Connect) {
                var ld = new YAHOO.util.YUILoader();
                ld.insert({
                    base: this.base,
                    filter: this.filter,
                    require: "connection",
                    insertBefore: this.insertBefore,
                    charset: this.charset,
                    onSuccess: function() {
                        this.sandbox(null, "js");
                    },
                    scope: this
                }, "js");
                return;
            }
            this._scriptText = [];
            this._loadCount = 0;
            this._stopCount = this.sorted.length;
            this._xhr = [];
            this.calculate();
            var s = this.sorted,
                l = s.length,
                i, m, url;
            for (i = 0; i < l; i = i + 1) {
                m = this.moduleInfo[s[i]];
                if (!m) {
                    this._onFailure("undefined module " + m);
                    for (var j = 0; j < this._xhr.length; j = j + 1) {
                        this._xhr[j].abort();
                    }
                    return;
                }
                if (m.type !== "js") {
                    this._loadCount++;
                    continue;
                }
                url = m.fullpath;
                url = (url) ? this._filter(url) : this._url(m.path);
                var xhrData = {
                    success: function(o) {
                        var idx = o.argument[0],
                            name = o.argument[2];
                        this._scriptText[idx] = o.responseText;
                        if (this.onProgress) {
                            this.onProgress.call(this.scope, {
                                name: name,
                                scriptText: o.responseText,
                                xhrResponse: o,
                                data: this.data
                            });
                        }
                        this._loadCount++;
                        if (this._loadCount >= this._stopCount) {
                            var v = this.varName || "YAHOO";
                            var t = "(function() {\n";
                            var b = "\nreturn " + v + ";\n})();";
                            var ref = eval(t + this._scriptText.join("\n") + b);
                            this._pushEvents(ref);
                            if (ref) {
                                this.onSuccess.call(this.scope, {
                                    reference: ref,
                                    data: this.data
                                });
                            } else {
                                this._onFailure.call(this.varName + " reference failure");
                            }
                        }
                    },
                    failure: function(o) {
                        this.onFailure.call(this.scope, {
                            msg: "XHR failure",
                            xhrResponse: o,
                            data: this.data
                        });
                    },
                    scope: this,
                    argument: [i, url, s[i]]
                };
                this._xhr.push(util.Connect.asyncRequest("GET", url, xhrData));
            }
        },
        loadNext: function(mname) {
            if (!this._loading) {
                return;
            }
            if (mname) {
                if (mname !== this._loading) {
                    return;
                }
                this.inserted[mname] = true;
                if (this.onProgress) {
                    this.onProgress.call(this.scope, {
                        name: mname,
                        data: this.data
                    });
                }
            }
            var s = this.sorted,
                len = s.length,
                i, m;
            for (i = 0; i < len; i = i + 1) {
                if (s[i] in this.inserted) {
                    continue;
                }
                if (s[i] === this._loading) {
                    return;
                }
                m = this.moduleInfo[s[i]];
                if (!m) {
                    this.onFailure.call(this.scope, {
                        msg: "undefined module " + m,
                        data: this.data
                    });
                    return;
                }
                if (!this.loadType || this.loadType === m.type) {
                    this._loading = s[i];
                    var fn = (m.type === "css") ? util.Get.css : util.Get.script,
                        url = m.fullpath,
                        self = this,
                        c = function(o) {
                            self.loadNext(o.data);
                        };
                    url = (url) ? this._filter(url) : this._url(m.path);
                    if (env.ua.webkit && env.ua.webkit < 420 && m.type === "js" && !m.varName) {
                        c = null;
                        this._useYahooListener = true;
                    }
                    fn(url, {
                        data: s[i],
                        onSuccess: c,
                        onFailure: this._onFailure,
                        onTimeout: this._onTimeout,
                        insertBefore: this.insertBefore,
                        charset: this.charset,
                        timeout: this.timeout,
                        varName: m.varName,
                        scope: self
                    });
                    return;
                }
            }
            this._loading = null;
            if (this._internalCallback) {
                var f = this._internalCallback;
                this._internalCallback = null;
                f.call(this);
            } else {
                if (this.onSuccess) {
                    this._pushEvents();
                    this.onSuccess.call(this.scope, {
                        data: this.data
                    });
                }
            }
        },
        _pushEvents: function(ref) {
            var r = ref || YAHOO;
            if (r.util && r.util.Event) {
                r.util.Event._load();
            }
        },
        _filter: function(str) {
            var f = this.filter;
            return (f) ? str.replace(new RegExp(f.searchExp, "g"), f.replaceStr) : str;
        },
        _url: function(path) {
            return this._filter((this.base || "") + path);
        }
    };
})();
YAHOO.register("yuiloader", YAHOO.util.YUILoader, {
    version: "2.8.2r1",
    build: "7"
});
(function() {
    YAHOO.env._id_counter = YAHOO.env._id_counter || 0;
    var E = YAHOO.util,
        L = YAHOO.lang,
        m = YAHOO.env.ua,
        A = YAHOO.lang.trim,
        d = {},
        h = {},
        N = /^t(?:able|d|h)$/i,
        X = /color$/i,
        K = window.document,
        W = K.documentElement,
        e = "ownerDocument",
        n = "defaultView",
        v = "documentElement",
        t = "compatMode",
        b = "offsetLeft",
        P = "offsetTop",
        u = "offsetParent",
        Z = "parentNode",
        l = "nodeType",
        C = "tagName",
        O = "scrollLeft",
        i = "scrollTop",
        Q = "getBoundingClientRect",
        w = "getComputedStyle",
        a = "currentStyle",
        M = "CSS1Compat",
        c = "BackCompat",
        g = "class",
        F = "className",
        J = "",
        B = " ",
        s = "(?:^|\\s)",
        k = "(?= |$)",
        U = "g",
        p = "position",
        f = "fixed",
        V = "relative",
        j = "left",
        o = "top",
        r = "medium",
        q = "borderLeftWidth",
        R = "borderTopWidth",
        D = m.opera,
        I = m.webkit,
        H = m.gecko,
        T = m.ie;
    E.Dom = {
        CUSTOM_ATTRIBUTES: (!W.hasAttribute) ? {
            "for": "htmlFor",
            "class": F
        } : {
            "htmlFor": "for",
            "className": g
        },
        DOT_ATTRIBUTES: {},
        get: function(z) {
            var AB, x, AA, y, Y, G;
            if (z) {
                if (z[l] || z.item) {
                    return z;
                }
                if (typeof z === "string") {
                    AB = z;
                    z = K.getElementById(z);
                    G = (z) ? z.attributes : null;
                    if (z && G && G.id && G.id.value === AB) {
                        return z;
                    } else {
                        if (z && K.all) {
                            z = null;
                            x = K.all[AB];
                            for (y = 0, Y = x.length; y < Y; ++y) {
                                if (x[y].id === AB) {
                                    return x[y];
                                }
                            }
                        }
                    }
                    return z;
                }
                if (YAHOO.util.Element && z instanceof YAHOO.util.Element) {
                    z = z.get("element");
                }
                if ("length" in z) {
                    AA = [];
                    for (y = 0, Y = z.length; y < Y; ++y) {
                        AA[AA.length] = E.Dom.get(z[y]);
                    }
                    return AA;
                }
                return z;
            }
            return null;
        },
        getComputedStyle: function(G, Y) {
            if (window[w]) {
                return G[e][n][w](G, null)[Y];
            } else {
                if (G[a]) {
                    return E.Dom.IE_ComputedStyle.get(G, Y);
                }
            }
        },
        getStyle: function(G, Y) {
            return E.Dom.batch(G, E.Dom._getStyle, Y);
        },
        _getStyle: function() {
            if (window[w]) {
                return function(G, y) {
                    y = (y === "float") ? y = "cssFloat" : E.Dom._toCamel(y);
                    var x = G.style[y],
                        Y;
                    if (!x) {
                        Y = G[e][n][w](G, null);
                        if (Y) {
                            x = Y[y];
                        }
                    }
                    return x;
                };
            } else {
                if (W[a]) {
                    return function(G, y) {
                        var x;
                        switch (y) {
                            case "opacity":
                                x = 100;
                                try {
                                    x = G.filters["DXImageTransform.Microsoft.Alpha"].opacity;
                                } catch (z) {
                                    try {
                                        x = G.filters("alpha").opacity;
                                    } catch (Y) {}
                                }
                                return x / 100;
                            case "float":
                                y = "styleFloat";
                            default:
                                y = E.Dom._toCamel(y);
                                x = G[a] ? G[a][y] : null;
                                return (G.style[y] || x);
                        }
                    };
                }
            }
        }(),
        setStyle: function(G, Y, x) {
            E.Dom.batch(G, E.Dom._setStyle, {
                prop: Y,
                val: x
            });
        },
        _setStyle: function() {
            if (T) {
                return function(Y, G) {
                    var x = E.Dom._toCamel(G.prop),
                        y = G.val;
                    if (Y) {
                        switch (x) {
                            case "opacity":
                                if (L.isString(Y.style.filter)) {
                                    Y.style.filter = "alpha(opacity=" + y * 100 + ")";
                                    if (!Y[a] || !Y[a].hasLayout) {
                                        Y.style.zoom = 1;
                                    }
                                }
                                break;
                            case "float":
                                x = "styleFloat";
                            default:
                                Y.style[x] = y;
                        }
                    } else {}
                };
            } else {
                return function(Y, G) {
                    var x = E.Dom._toCamel(G.prop),
                        y = G.val;
                    if (Y) {
                        if (x == "float") {
                            x = "cssFloat";
                        }
                        Y.style[x] = y;
                    } else {}
                };
            }
        }(),
        getXY: function(G) {
            return E.Dom.batch(G, E.Dom._getXY);
        },
        _canPosition: function(G) {
            return (E.Dom._getStyle(G, "display") !== "none" && E.Dom._inDoc(G));
        },
        _getXY: function() {
            if (K[v][Q]) {
                return function(y) {
                    var z, Y, AA, AF, AE, AD, AC, G, x, AB = Math.floor,
                        AG = false;
                    if (E.Dom._canPosition(y)) {
                        AA = y[Q]();
                        AF = y[e];
                        z = E.Dom.getDocumentScrollLeft(AF);
                        Y = E.Dom.getDocumentScrollTop(AF);
                        AG = [AB(AA[j]), AB(AA[o])];
                        if (T && m.ie < 8) {
                            AE = 2;
                            AD = 2;
                            AC = AF[t];
                            if (m.ie === 6) {
                                if (AC !== c) {
                                    AE = 0;
                                    AD = 0;
                                }
                            }
                            if ((AC === c)) {
                                G = S(AF[v], q);
                                x = S(AF[v], R);
                                if (G !== r) {
                                    AE = parseInt(G, 10);
                                }
                                if (x !== r) {
                                    AD = parseInt(x, 10);
                                }
                            }
                            AG[0] -= AE;
                            AG[1] -= AD;
                        }
                        if ((Y || z)) {
                            AG[0] += z;
                            AG[1] += Y;
                        }
                        AG[0] = AB(AG[0]);
                        AG[1] = AB(AG[1]);
                    } else {}
                    return AG;
                };
            } else {
                return function(y) {
                    var x, Y, AA, AB, AC, z = false,
                        G = y;
                    if (E.Dom._canPosition(y)) {
                        z = [y[b], y[P]];
                        x = E.Dom.getDocumentScrollLeft(y[e]);
                        Y = E.Dom.getDocumentScrollTop(y[e]);
                        AC = ((H || m.webkit > 519) ? true : false);
                        while ((G = G[u])) {
                            z[0] += G[b];
                            z[1] += G[P];
                            if (AC) {
                                z = E.Dom._calcBorders(G, z);
                            }
                        }
                        if (E.Dom._getStyle(y, p) !== f) {
                            G = y;
                            while ((G = G[Z]) && G[C]) {
                                AA = G[i];
                                AB = G[O];
                                if (H && (E.Dom._getStyle(G, "overflow") !== "visible")) {
                                    z = E.Dom._calcBorders(G, z);
                                }
                                if (AA || AB) {
                                    z[0] -= AB;
                                    z[1] -= AA;
                                }
                            }
                            z[0] += x;
                            z[1] += Y;
                        } else {
                            if (D) {
                                z[0] -= x;
                                z[1] -= Y;
                            } else {
                                if (I || H) {
                                    z[0] += x;
                                    z[1] += Y;
                                }
                            }
                        }
                        z[0] = Math.floor(z[0]);
                        z[1] = Math.floor(z[1]);
                    } else {}
                    return z;
                };
            }
        }(),
        getX: function(G) {
            var Y = function(x) {
                return E.Dom.getXY(x)[0];
            };
            return E.Dom.batch(G, Y, E.Dom, true);
        },
        getY: function(G) {
            var Y = function(x) {
                return E.Dom.getXY(x)[1];
            };
            return E.Dom.batch(G, Y, E.Dom, true);
        },
        setXY: function(G, x, Y) {
            E.Dom.batch(G, E.Dom._setXY, {
                pos: x,
                noRetry: Y
            });
        },
        _setXY: function(G, z) {
            var AA = E.Dom._getStyle(G, p),
                y = E.Dom.setStyle,
                AD = z.pos,
                Y = z.noRetry,
                AB = [parseInt(E.Dom.getComputedStyle(G, j), 10), parseInt(E.Dom.getComputedStyle(G, o), 10)],
                AC, x;
            if (AA == "static") {
                AA = V;
                y(G, p, AA);
            }
            AC = E.Dom._getXY(G);
            if (!AD || AC === false) {
                return false;
            }
            if (isNaN(AB[0])) {
                AB[0] = (AA == V) ? 0 : G[b];
            }
            if (isNaN(AB[1])) {
                AB[1] = (AA == V) ? 0 : G[P];
            }
            if (AD[0] !== null) {
                y(G, j, AD[0] - AC[0] + AB[0] + "px");
            }
            if (AD[1] !== null) {
                y(G, o, AD[1] - AC[1] + AB[1] + "px");
            }
            if (!Y) {
                x = E.Dom._getXY(G);
                if ((AD[0] !== null && x[0] != AD[0]) || (AD[1] !== null && x[1] != AD[1])) {
                    E.Dom._setXY(G, {
                        pos: AD,
                        noRetry: true
                    });
                }
            }
        },
        setX: function(Y, G) {
            E.Dom.setXY(Y, [G, null]);
        },
        setY: function(G, Y) {
            E.Dom.setXY(G, [null, Y]);
        },
        getRegion: function(G) {
            var Y = function(x) {
                var y = false;
                if (E.Dom._canPosition(x)) {
                    y = E.Region.getRegion(x);
                } else {}
                return y;
            };
            return E.Dom.batch(G, Y, E.Dom, true);
        },
        getClientWidth: function() {
            return E.Dom.getViewportWidth();
        },
        getClientHeight: function() {
            return E.Dom.getViewportHeight();
        },
        getElementsByClassName: function(AB, AF, AC, AE, x, AD) {
            AF = AF || "*";
            AC = (AC) ? E.Dom.get(AC) : null || K;
            if (!AC) {
                return [];
            }
            var Y = [],
                G = AC.getElementsByTagName(AF),
                z = E.Dom.hasClass;
            for (var y = 0, AA = G.length; y < AA; ++y) {
                if (z(G[y], AB)) {
                    Y[Y.length] = G[y];
                }
            }
            if (AE) {
                E.Dom.batch(Y, AE, x, AD);
            }
            return Y;
        },
        hasClass: function(Y, G) {
            return E.Dom.batch(Y, E.Dom._hasClass, G);
        },
        _hasClass: function(x, Y) {
            var G = false,
                y;
            if (x && Y) {
                y = E.Dom._getAttribute(x, F) || J;
                if (Y.exec) {
                    G = Y.test(y);
                } else {
                    G = Y && (B + y + B).indexOf(B + Y + B) > -1;
                }
            } else {}
            return G;
        },
        addClass: function(Y, G) {
            return E.Dom.batch(Y, E.Dom._addClass, G);
        },
        _addClass: function(x, Y) {
            var G = false,
                y;
            if (x && Y) {
                y = E.Dom._getAttribute(x, F) || J;
                if (!E.Dom._hasClass(x, Y)) {
                    E.Dom.setAttribute(x, F, A(y + B + Y));
                    G = true;
                }
            } else {}
            return G;
        },
        removeClass: function(Y, G) {
            return E.Dom.batch(Y, E.Dom._removeClass, G);
        },
        _removeClass: function(y, x) {
            var Y = false,
                AA, z, G;
            if (y && x) {
                AA = E.Dom._getAttribute(y, F) || J;
                E.Dom.setAttribute(y, F, AA.replace(E.Dom._getClassRegex(x), J));
                z = E.Dom._getAttribute(y, F);
                if (AA !== z) {
                    E.Dom.setAttribute(y, F, A(z));
                    Y = true;
                    if (E.Dom._getAttribute(y, F) === "") {
                        G = (y.hasAttribute && y.hasAttribute(g)) ? g : F;
                        y.removeAttribute(G);
                    }
                }
            } else {}
            return Y;
        },
        replaceClass: function(x, Y, G) {
            return E.Dom.batch(x, E.Dom._replaceClass, {
                from: Y,
                to: G
            });
        },
        _replaceClass: function(y, x) {
            var Y, AB, AA, G = false,
                z;
            if (y && x) {
                AB = x.from;
                AA = x.to;
                if (!AA) {
                    G = false;
                } else {
                    if (!AB) {
                        G = E.Dom._addClass(y, x.to);
                    } else {
                        if (AB !== AA) {
                            z = E.Dom._getAttribute(y, F) || J;
                            Y = (B + z.replace(E.Dom._getClassRegex(AB), B + AA)).split(E.Dom._getClassRegex(AA));
                            Y.splice(1, 0, B + AA);
                            E.Dom.setAttribute(y, F, A(Y.join(J)));
                            G = true;
                        }
                    }
                }
            } else {}
            return G;
        },
        generateId: function(G, x) {
            x = x || "yui-gen";
            var Y = function(y) {
                if (y && y.id) {
                    return y.id;
                }
                var z = x + YAHOO.env._id_counter++;
                if (y) {
                    if (y[e] && y[e].getElementById(z)) {
                        return E.Dom.generateId(y, z + x);
                    }
                    y.id = z;
                }
                return z;
            };
            return E.Dom.batch(G, Y, E.Dom, true) || Y.apply(E.Dom, arguments);
        },
        isAncestor: function(Y, x) {
            Y = E.Dom.get(Y);
            x = E.Dom.get(x);
            var G = false;
            if ((Y && x) && (Y[l] && x[l])) {
                if (Y.contains && Y !== x) {
                    G = Y.contains(x);
                } else {
                    if (Y.compareDocumentPosition) {
                        G = !!(Y.compareDocumentPosition(x) & 16);
                    }
                }
            } else {}
            return G;
        },
        inDocument: function(G, Y) {
            return E.Dom._inDoc(E.Dom.get(G), Y);
        },
        _inDoc: function(Y, x) {
            var G = false;
            if (Y && Y[C]) {
                x = x || Y[e];
                G = E.Dom.isAncestor(x[v], Y);
            } else {}
            return G;
        },
        getElementsBy: function(Y, AF, AB, AD, y, AC, AE) {
            AF = AF || "*";
            AB = (AB) ? E.Dom.get(AB) : null || K;
            if (!AB) {
                return [];
            }
            var x = [],
                G = AB.getElementsByTagName(AF);
            for (var z = 0, AA = G.length; z < AA; ++z) {
                if (Y(G[z])) {
                    if (AE) {
                        x = G[z];
                        break;
                    } else {
                        x[x.length] = G[z];
                    }
                }
            }
            if (AD) {
                E.Dom.batch(x, AD, y, AC);
            }
            return x;
        },
        getElementBy: function(x, G, Y) {
            return E.Dom.getElementsBy(x, G, Y, null, null, null, true);
        },
        batch: function(x, AB, AA, z) {
            var y = [],
                Y = (z) ? AA : window;
            x = (x && (x[C] || x.item)) ? x : E.Dom.get(x);
            if (x && AB) {
                if (x[C] || x.length === undefined) {
                    return AB.call(Y, x, AA);
                }
                for (var G = 0; G < x.length; ++G) {
                    y[y.length] = AB.call(Y, x[G], AA);
                }
            } else {
                return false;
            }
            return y;
        },
        getDocumentHeight: function() {
            var Y = (K[t] != M || I) ? K.body.scrollHeight : W.scrollHeight,
                G = Math.max(Y, E.Dom.getViewportHeight());
            return G;
        },
        getDocumentWidth: function() {
            var Y = (K[t] != M || I) ? K.body.scrollWidth : W.scrollWidth,
                G = Math.max(Y, E.Dom.getViewportWidth());
            return G;
        },
        getViewportHeight: function() {
            var G = self.innerHeight,
                Y = K[t];
            if ((Y || T) && !D) {
                G = (Y == M) ? W.clientHeight : K.body.clientHeight;
            }
            return G;
        },
        getViewportWidth: function() {
            var G = self.innerWidth,
                Y = K[t];
            if (Y || T) {
                G = (Y == M) ? W.clientWidth : K.body.clientWidth;
            }
            return G;
        },
        getAncestorBy: function(G, Y) {
            while ((G = G[Z])) {
                if (E.Dom._testElement(G, Y)) {
                    return G;
                }
            }
            return null;
        },
        getAncestorByClassName: function(Y, G) {
            Y = E.Dom.get(Y);
            if (!Y) {
                return null;
            }
            var x = function(y) {
                return E.Dom.hasClass(y, G);
            };
            return E.Dom.getAncestorBy(Y, x);
        },
        getAncestorByTagName: function(Y, G) {
            Y = E.Dom.get(Y);
            if (!Y) {
                return null;
            }
            var x = function(y) {
                return y[C] && y[C].toUpperCase() == G.toUpperCase();
            };
            return E.Dom.getAncestorBy(Y, x);
        },
        getPreviousSiblingBy: function(G, Y) {
            while (G) {
                G = G.previousSibling;
                if (E.Dom._testElement(G, Y)) {
                    return G;
                }
            }
            return null;
        },
        getPreviousSibling: function(G) {
            G = E.Dom.get(G);
            if (!G) {
                return null;
            }
            return E.Dom.getPreviousSiblingBy(G);
        },
        getNextSiblingBy: function(G, Y) {
            while (G) {
                G = G.nextSibling;
                if (E.Dom._testElement(G, Y)) {
                    return G;
                }
            }
            return null;
        },
        getNextSibling: function(G) {
            G = E.Dom.get(G);
            if (!G) {
                return null;
            }
            return E.Dom.getNextSiblingBy(G);
        },
        getFirstChildBy: function(G, x) {
            var Y = (E.Dom._testElement(G.firstChild, x)) ? G.firstChild : null;
            return Y || E.Dom.getNextSiblingBy(G.firstChild, x);
        },
        getFirstChild: function(G, Y) {
            G = E.Dom.get(G);
            if (!G) {
                return null;
            }
            return E.Dom.getFirstChildBy(G);
        },
        getLastChildBy: function(G, x) {
            if (!G) {
                return null;
            }
            var Y = (E.Dom._testElement(G.lastChild, x)) ? G.lastChild : null;
            return Y || E.Dom.getPreviousSiblingBy(G.lastChild, x);
        },
        getLastChild: function(G) {
            G = E.Dom.get(G);
            return E.Dom.getLastChildBy(G);
        },
        getChildrenBy: function(Y, y) {
            var x = E.Dom.getFirstChildBy(Y, y),
                G = x ? [x] : [];
            E.Dom.getNextSiblingBy(x, function(z) {
                if (!y || y(z)) {
                    G[G.length] = z;
                }
                return false;
            });
            return G;
        },
        getChildren: function(G) {
            G = E.Dom.get(G);
            if (!G) {}
            return E.Dom.getChildrenBy(G);
        },
        getDocumentScrollLeft: function(G) {
            G = G || K;
            return Math.max(G[v].scrollLeft, G.body.scrollLeft);
        },
        getDocumentScrollTop: function(G) {
            G = G || K;
            return Math.max(G[v].scrollTop, G.body.scrollTop);
        },
        insertBefore: function(Y, G) {
            Y = E.Dom.get(Y);
            G = E.Dom.get(G);
            if (!Y || !G || !G[Z]) {
                return null;
            }
            return G[Z].insertBefore(Y, G);
        },
        insertAfter: function(Y, G) {
            Y = E.Dom.get(Y);
            G = E.Dom.get(G);
            if (!Y || !G || !G[Z]) {
                return null;
            }
            if (G.nextSibling) {
                return G[Z].insertBefore(Y, G.nextSibling);
            } else {
                return G[Z].appendChild(Y);
            }
        },
        getClientRegion: function() {
            var x = E.Dom.getDocumentScrollTop(),
                Y = E.Dom.getDocumentScrollLeft(),
                y = E.Dom.getViewportWidth() + Y,
                G = E.Dom.getViewportHeight() + x;
            return new E.Region(x, y, G, Y);
        },
        setAttribute: function(Y, G, x) {
            E.Dom.batch(Y, E.Dom._setAttribute, {
                attr: G,
                val: x
            });
        },
        _setAttribute: function(x, Y) {
            var G = E.Dom._toCamel(Y.attr),
                y = Y.val;
            if (x && x.setAttribute) {
                if (E.Dom.DOT_ATTRIBUTES[G]) {
                    x[G] = y;
                } else {
                    G = E.Dom.CUSTOM_ATTRIBUTES[G] || G;
                    x.setAttribute(G, y);
                }
            } else {}
        },
        getAttribute: function(Y, G) {
            return E.Dom.batch(Y, E.Dom._getAttribute, G);
        },
        _getAttribute: function(Y, G) {
            var x;
            G = E.Dom.CUSTOM_ATTRIBUTES[G] || G;
            if (Y && Y.getAttribute) {
                x = Y.getAttribute(G, 2);
            } else {}
            return x;
        },
        _toCamel: function(Y) {
            var x = d;

            function G(y, z) {
                return z.toUpperCase();
            }
            return x[Y] || (x[Y] = Y.indexOf("-") === -1 ? Y : Y.replace(/-([a-z])/gi, G));
        },
        _getClassRegex: function(Y) {
            var G;
            if (Y !== undefined) {
                if (Y.exec) {
                    G = Y;
                } else {
                    G = h[Y];
                    if (!G) {
                        Y = Y.replace(E.Dom._patterns.CLASS_RE_TOKENS, "\\$1");
                        G = h[Y] = new RegExp(s + Y + k, U);
                    }
                }
            }
            return G;
        },
        _patterns: {
            ROOT_TAG: /^body|html$/i,
            CLASS_RE_TOKENS: /([\.\(\)\^\$\*\+\?\|\[\]\{\}\\])/g
        },
        _testElement: function(G, Y) {
            return G && G[l] == 1 && (!Y || Y(G));
        },
        _calcBorders: function(x, y) {
            var Y = parseInt(E.Dom[w](x, R), 10) || 0,
                G = parseInt(E.Dom[w](x, q), 10) || 0;
            if (H) {
                if (N.test(x[C])) {
                    Y = 0;
                    G = 0;
                }
            }
            y[0] += G;
            y[1] += Y;
            return y;
        }
    };
    var S = E.Dom[w];
    if (m.opera) {
        E.Dom[w] = function(Y, G) {
            var x = S(Y, G);
            if (X.test(G)) {
                x = E.Dom.Color.toRGB(x);
            }
            return x;
        };
    }
    if (m.webkit) {
        E.Dom[w] = function(Y, G) {
            var x = S(Y, G);
            if (x === "rgba(0, 0, 0, 0)") {
                x = "transparent";
            }
            return x;
        };
    }
    if (m.ie && m.ie >= 8 && K.documentElement.hasAttribute) {
        E.Dom.DOT_ATTRIBUTES.type = true;
    }
})();
YAHOO.util.Region = function(C, D, A, B) {
    this.top = C;
    this.y = C;
    this[1] = C;
    this.right = D;
    this.bottom = A;
    this.left = B;
    this.x = B;
    this[0] = B;
    this.width = this.right - this.left;
    this.height = this.bottom - this.top;
};
YAHOO.util.Region.prototype.contains = function(A) {
    return (A.left >= this.left && A.right <= this.right && A.top >= this.top && A.bottom <= this.bottom);
};
YAHOO.util.Region.prototype.getArea = function() {
    return ((this.bottom - this.top) * (this.right - this.left));
};
YAHOO.util.Region.prototype.intersect = function(E) {
    var C = Math.max(this.top, E.top),
        D = Math.min(this.right, E.right),
        A = Math.min(this.bottom, E.bottom),
        B = Math.max(this.left, E.left);
    if (A >= C && D >= B) {
        return new YAHOO.util.Region(C, D, A, B);
    } else {
        return null;
    }
};
YAHOO.util.Region.prototype.union = function(E) {
    var C = Math.min(this.top, E.top),
        D = Math.max(this.right, E.right),
        A = Math.max(this.bottom, E.bottom),
        B = Math.min(this.left, E.left);
    return new YAHOO.util.Region(C, D, A, B);
};
YAHOO.util.Region.prototype.toString = function() {
    return ("Region {" + "top: " + this.top + ", right: " + this.right + ", bottom: " + this.bottom + ", left: " + this.left + ", height: " + this.height + ", width: " + this.width + "}");
};
YAHOO.util.Region.getRegion = function(D) {
    var F = YAHOO.util.Dom.getXY(D),
        C = F[1],
        E = F[0] + D.offsetWidth,
        A = F[1] + D.offsetHeight,
        B = F[0];
    return new YAHOO.util.Region(C, E, A, B);
};
YAHOO.util.Point = function(A, B) {
    if (YAHOO.lang.isArray(A)) {
        B = A[1];
        A = A[0];
    }
    YAHOO.util.Point.superclass.constructor.call(this, B, A, B, A);
};
YAHOO.extend(YAHOO.util.Point, YAHOO.util.Region);
(function() {
    var B = YAHOO.util,
        A = "clientTop",
        F = "clientLeft",
        J = "parentNode",
        K = "right",
        W = "hasLayout",
        I = "px",
        U = "opacity",
        L = "auto",
        D = "borderLeftWidth",
        G = "borderTopWidth",
        P = "borderRightWidth",
        V = "borderBottomWidth",
        S = "visible",
        Q = "transparent",
        N = "height",
        E = "width",
        H = "style",
        T = "currentStyle",
        R = /^width|height$/,
        O = /^(\d[.\d]*)+(em|ex|px|gd|rem|vw|vh|vm|ch|mm|cm|in|pt|pc|deg|rad|ms|s|hz|khz|%){1}?/i,
        M = {
            get: function(X, Z) {
                var Y = "",
                    a = X[T][Z];
                if (Z === U) {
                    Y = B.Dom.getStyle(X, U);
                } else {
                    if (!a || (a.indexOf && a.indexOf(I) > -1)) {
                        Y = a;
                    } else {
                        if (B.Dom.IE_COMPUTED[Z]) {
                            Y = B.Dom.IE_COMPUTED[Z](X, Z);
                        } else {
                            if (O.test(a)) {
                                Y = B.Dom.IE.ComputedStyle.getPixel(X, Z);
                            } else {
                                Y = a;
                            }
                        }
                    }
                }
                return Y;
            },
            getOffset: function(Z, e) {
                var b = Z[T][e],
                    X = e.charAt(0).toUpperCase() + e.substr(1),
                    c = "offset" + X,
                    Y = "pixel" + X,
                    a = "",
                    d;
                if (b == L) {
                    d = Z[c];
                    if (d === undefined) {
                        a = 0;
                    }
                    a = d;
                    if (R.test(e)) {
                        Z[H][e] = d;
                        if (Z[c] > d) {
                            a = d - (Z[c] - d);
                        }
                        Z[H][e] = L;
                    }
                } else {
                    if (!Z[H][Y] && !Z[H][e]) {
                        Z[H][e] = b;
                    }
                    a = Z[H][Y];
                }
                return a + I;
            },
            getBorderWidth: function(X, Z) {
                var Y = null;
                if (!X[T][W]) {
                    X[H].zoom = 1;
                }
                switch (Z) {
                    case G:
                        Y = X[A];
                        break;
                    case V:
                        Y = X.offsetHeight - X.clientHeight - X[A];
                        break;
                    case D:
                        Y = X[F];
                        break;
                    case P:
                        Y = X.offsetWidth - X.clientWidth - X[F];
                        break;
                }
                return Y + I;
            },
            getPixel: function(Y, X) {
                var a = null,
                    b = Y[T][K],
                    Z = Y[T][X];
                Y[H][K] = Z;
                a = Y[H].pixelRight;
                Y[H][K] = b;
                return a + I;
            },
            getMargin: function(Y, X) {
                var Z;
                if (Y[T][X] == L) {
                    Z = 0 + I;
                } else {
                    Z = B.Dom.IE.ComputedStyle.getPixel(Y, X);
                }
                return Z;
            },
            getVisibility: function(Y, X) {
                var Z;
                while ((Z = Y[T]) && Z[X] == "inherit") {
                    Y = Y[J];
                }
                return (Z) ? Z[X] : S;
            },
            getColor: function(Y, X) {
                return B.Dom.Color.toRGB(Y[T][X]) || Q;
            },
            getBorderColor: function(Y, X) {
                var Z = Y[T],
                    a = Z[X] || Z.color;
                return B.Dom.Color.toRGB(B.Dom.Color.toHex(a));
            }
        },
        C = {};
    C.top = C.right = C.bottom = C.left = C[E] = C[N] = M.getOffset;
    C.color = M.getColor;
    C[G] = C[P] = C[V] = C[D] = M.getBorderWidth;
    C.marginTop = C.marginRight = C.marginBottom = C.marginLeft = M.getMargin;
    C.visibility = M.getVisibility;
    C.borderColor = C.borderTopColor = C.borderRightColor = C.borderBottomColor = C.borderLeftColor = M.getBorderColor;
    B.Dom.IE_COMPUTED = C;
    B.Dom.IE_ComputedStyle = M;
})();
(function() {
    var C = "toString",
        A = parseInt,
        B = RegExp,
        D = YAHOO.util;
    D.Dom.Color = {
        KEYWORDS: {
            black: "000",
            silver: "c0c0c0",
            gray: "808080",
            white: "fff",
            maroon: "800000",
            red: "f00",
            purple: "800080",
            fuchsia: "f0f",
            green: "008000",
            lime: "0f0",
            olive: "808000",
            yellow: "ff0",
            navy: "000080",
            blue: "00f",
            teal: "008080",
            aqua: "0ff"
        },
        re_RGB: /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,
        re_hex: /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,
        re_hex3: /([0-9A-F])/gi,
        toRGB: function(E) {
            if (!D.Dom.Color.re_RGB.test(E)) {
                E = D.Dom.Color.toHex(E);
            }
            if (D.Dom.Color.re_hex.exec(E)) {
                E = "rgb(" + [A(B.$1, 16), A(B.$2, 16), A(B.$3, 16)].join(", ") + ")";
            }
            return E;
        },
        toHex: function(H) {
            H = D.Dom.Color.KEYWORDS[H] || H;
            if (D.Dom.Color.re_RGB.exec(H)) {
                var G = (B.$1.length === 1) ? "0" + B.$1 : Number(B.$1),
                    F = (B.$2.length === 1) ? "0" + B.$2 : Number(B.$2),
                    E = (B.$3.length === 1) ? "0" + B.$3 : Number(B.$3);
                H = [G[C](16), F[C](16), E[C](16)].join("");
            }
            if (H.length < 6) {
                H = H.replace(D.Dom.Color.re_hex3, "$1$1");
            }
            if (H !== "transparent" && H.indexOf("#") < 0) {
                H = "#" + H;
            }
            return H.toLowerCase();
        }
    };
}());
YAHOO.register("dom", YAHOO.util.Dom, {
    version: "2.8.2r1",
    build: "7"
});
YAHOO.util.CustomEvent = function(D, C, B, A, E) {
    this.type = D;
    this.scope = C || window;
    this.silent = B;
    this.fireOnce = E;
    this.fired = false;
    this.firedWith = null;
    this.signature = A || YAHOO.util.CustomEvent.LIST;
    this.subscribers = [];
    if (!this.silent) {}
    var F = "_YUICEOnSubscribe";
    if (D !== F) {
        this.subscribeEvent = new YAHOO.util.CustomEvent(F, this, true);
    }
    this.lastError = null;
};
YAHOO.util.CustomEvent.LIST = 0;
YAHOO.util.CustomEvent.FLAT = 1;
YAHOO.util.CustomEvent.prototype = {
    subscribe: function(B, C, D) {
        if (!B) {
            throw new Error("Invalid callback for subscriber to '" + this.type + "'");
        }
        if (this.subscribeEvent) {
            this.subscribeEvent.fire(B, C, D);
        }
        var A = new YAHOO.util.Subscriber(B, C, D);
        if (this.fireOnce && this.fired) {
            this.notify(A, this.firedWith);
        } else {
            this.subscribers.push(A);
        }
    },
    unsubscribe: function(D, F) {
        if (!D) {
            return this.unsubscribeAll();
        }
        var E = false;
        for (var B = 0, A = this.subscribers.length; B < A; ++B) {
            var C = this.subscribers[B];
            if (C && C.contains(D, F)) {
                this._delete(B);
                E = true;
            }
        }
        return E;
    },
    fire: function() {
        this.lastError = null;
        var H = [],
            A = this.subscribers.length;
        var D = [].slice.call(arguments, 0),
            C = true,
            F, B = false;
        if (this.fireOnce) {
            if (this.fired) {
                return true;
            } else {
                this.firedWith = D;
            }
        }
        this.fired = true;
        if (!A && this.silent) {
            return true;
        }
        if (!this.silent) {}
        var E = this.subscribers.slice();
        for (F = 0; F < A; ++F) {
            var G = E[F];
            if (!G) {
                B = true;
            } else {
                C = this.notify(G, D);
                if (false === C) {
                    if (!this.silent) {}
                    break;
                }
            }
        }
        return (C !== false);
    },
    notify: function(F, C) {
        var B, H = null,
            E = F.getScope(this.scope),
            A = YAHOO.util.Event.throwErrors;
        if (!this.silent) {}
        if (this.signature == YAHOO.util.CustomEvent.FLAT) {
            if (C.length > 0) {
                H = C[0];
            }
            try {
                B = F.fn.call(E, H, F.obj);
            } catch (G) {
                this.lastError = G;
                if (A) {
                    throw G;
                }
            }
        } else {
            try {
                B = F.fn.call(E, this.type, C, F.obj);
            } catch (D) {
                this.lastError = D;
                if (A) {
                    throw D;
                }
            }
        }
        return B;
    },
    unsubscribeAll: function() {
        var A = this.subscribers.length,
            B;
        for (B = A - 1; B > -1; B--) {
            this._delete(B);
        }
        this.subscribers = [];
        return A;
    },
    _delete: function(A) {
        var B = this.subscribers[A];
        if (B) {
            delete B.fn;
            delete B.obj;
        }
        this.subscribers.splice(A, 1);
    },
    toString: function() {
        return "CustomEvent: " + "'" + this.type + "', " + "context: " + this.scope;
    }
};
YAHOO.util.Subscriber = function(A, B, C) {
    this.fn = A;
    this.obj = YAHOO.lang.isUndefined(B) ? null : B;
    this.overrideContext = C;
};
YAHOO.util.Subscriber.prototype.getScope = function(A) {
    if (this.overrideContext) {
        if (this.overrideContext === true) {
            return this.obj;
        } else {
            return this.overrideContext;
        }
    }
    return A;
};
YAHOO.util.Subscriber.prototype.contains = function(A, B) {
    if (B) {
        return (this.fn == A && this.obj == B);
    } else {
        return (this.fn == A);
    }
};
YAHOO.util.Subscriber.prototype.toString = function() {
    return "Subscriber { obj: " + this.obj + ", overrideContext: " + (this.overrideContext || "no") + " }";
};
if (!YAHOO.util.Event) {
    YAHOO.util.Event = function() {
        var G = false,
            H = [],
            J = [],
            A = 0,
            E = [],
            B = 0,
            C = {
                63232: 38,
                63233: 40,
                63234: 37,
                63235: 39,
                63276: 33,
                63277: 34,
                25: 9
            },
            D = YAHOO.env.ua.ie,
            F = "focusin",
            I = "focusout";
        return {
            POLL_RETRYS: 500,
            POLL_INTERVAL: 40,
            EL: 0,
            TYPE: 1,
            FN: 2,
            WFN: 3,
            UNLOAD_OBJ: 3,
            ADJ_SCOPE: 4,
            OBJ: 5,
            OVERRIDE: 6,
            CAPTURE: 7,
            lastError: null,
            isSafari: YAHOO.env.ua.webkit,
            webkit: YAHOO.env.ua.webkit,
            isIE: D,
            _interval: null,
            _dri: null,
            _specialTypes: {
                focusin: (D ? "focusin" : "focus"),
                focusout: (D ? "focusout" : "blur")
            },
            DOMReady: false,
            throwErrors: false,
            startInterval: function() {
                if (!this._interval) {
                    this._interval = YAHOO.lang.later(this.POLL_INTERVAL, this, this._tryPreloadAttach, null, true);
                }
            },
            onAvailable: function(Q, M, O, P, N) {
                var K = (YAHOO.lang.isString(Q)) ? [Q] : Q;
                for (var L = 0; L < K.length; L = L + 1) {
                    E.push({
                        id: K[L],
                        fn: M,
                        obj: O,
                        overrideContext: P,
                        checkReady: N
                    });
                }
                A = this.POLL_RETRYS;
                this.startInterval();
            },
            onContentReady: function(N, K, L, M) {
                this.onAvailable(N, K, L, M, true);
            },
            onDOMReady: function() {
                this.DOMReadyEvent.subscribe.apply(this.DOMReadyEvent, arguments);
            },
            _addListener: function(M, K, V, P, T, Y) {
                if (!V || !V.call) {
                    return false;
                }
                if (this._isValidCollection(M)) {
                    var W = true;
                    for (var Q = 0, S = M.length; Q < S; ++Q) {
                        W = this.on(M[Q], K, V, P, T) && W;
                    }
                    return W;
                } else {
                    if (YAHOO.lang.isString(M)) {
                        var O = this.getEl(M);
                        if (O) {
                            M = O;
                        } else {
                            this.onAvailable(M, function() {
                                YAHOO.util.Event._addListener(M, K, V, P, T, Y);
                            });
                            return true;
                        }
                    }
                }
                if (!M) {
                    return false;
                }
                if ("unload" == K && P !== this) {
                    J[J.length] = [M, K, V, P, T];
                    return true;
                }
                var L = M;
                if (T) {
                    if (T === true) {
                        L = P;
                    } else {
                        L = T;
                    }
                }
                var N = function(Z) {
                    return V.call(L, YAHOO.util.Event.getEvent(Z, M), P);
                };
                var X = [M, K, V, N, L, P, T, Y];
                var R = H.length;
                H[R] = X;
                try {
                    this._simpleAdd(M, K, N, Y);
                } catch (U) {
                    this.lastError = U;
                    this.removeListener(M, K, V);
                    return false;
                }
                return true;
            },
            _getType: function(K) {
                return this._specialTypes[K] || K;
            },
            addListener: function(M, P, L, N, O) {
                var K = ((P == F || P == I) && !YAHOO.env.ua.ie) ? true : false;
                return this._addListener(M, this._getType(P), L, N, O, K);
            },
            addFocusListener: function(L, K, M, N) {
                return this.on(L, F, K, M, N);
            },
            removeFocusListener: function(L, K) {
                return this.removeListener(L, F, K);
            },
            addBlurListener: function(L, K, M, N) {
                return this.on(L, I, K, M, N);
            },
            removeBlurListener: function(L, K) {
                return this.removeListener(L, I, K);
            },
            removeListener: function(L, K, R) {
                var M, P, U;
                K = this._getType(K);
                if (typeof L == "string") {
                    L = this.getEl(L);
                } else {
                    if (this._isValidCollection(L)) {
                        var S = true;
                        for (M = L.length - 1; M > -1; M--) {
                            S = (this.removeListener(L[M], K, R) && S);
                        }
                        return S;
                    }
                }
                if (!R || !R.call) {
                    return this.purgeElement(L, false, K);
                }
                if ("unload" == K) {
                    for (M = J.length - 1; M > -1; M--) {
                        U = J[M];
                        if (U && U[0] == L && U[1] == K && U[2] == R) {
                            J.splice(M, 1);
                            return true;
                        }
                    }
                    return false;
                }
                var N = null;
                var O = arguments[3];
                if ("undefined" === typeof O) {
                    O = this._getCacheIndex(H, L, K, R);
                }
                if (O >= 0) {
                    N = H[O];
                }
                if (!L || !N) {
                    return false;
                }
                var T = N[this.CAPTURE] === true ? true : false;
                try {
                    this._simpleRemove(L, K, N[this.WFN], T);
                } catch (Q) {
                    this.lastError = Q;
                    return false;
                }
                delete H[O][this.WFN];
                delete H[O][this.FN];
                H.splice(O, 1);
                return true;
            },
            getTarget: function(M, L) {
                var K = M.target || M.srcElement;
                return this.resolveTextNode(K);
            },
            resolveTextNode: function(L) {
                try {
                    if (L && 3 == L.nodeType) {
                        return L.parentNode;
                    }
                } catch (K) {}
                return L;
            },
            getPageX: function(L) {
                var K = L.pageX;
                if (!K && 0 !== K) {
                    K = L.clientX || 0;
                    if (this.isIE) {
                        K += this._getScrollLeft();
                    }
                }
                return K;
            },
            getPageY: function(K) {
                var L = K.pageY;
                if (!L && 0 !== L) {
                    L = K.clientY || 0;
                    if (this.isIE) {
                        L += this._getScrollTop();
                    }
                }
                return L;
            },
            getXY: function(K) {
                return [this.getPageX(K), this.getPageY(K)];
            },
            getRelatedTarget: function(L) {
                var K = L.relatedTarget;
                if (!K) {
                    if (L.type == "mouseout") {
                        K = L.toElement;
                    } else {
                        if (L.type == "mouseover") {
                            K = L.fromElement;
                        }
                    }
                }
                return this.resolveTextNode(K);
            },
            getTime: function(M) {
                if (!M.time) {
                    var L = new Date().getTime();
                    try {
                        M.time = L;
                    } catch (K) {
                        this.lastError = K;
                        return L;
                    }
                }
                return M.time;
            },
            stopEvent: function(K) {
                this.stopPropagation(K);
                this.preventDefault(K);
            },
            stopPropagation: function(K) {
                if (K.stopPropagation) {
                    K.stopPropagation();
                } else {
                    K.cancelBubble = true;
                }
            },
            preventDefault: function(K) {
                if (K.preventDefault) {
                    K.preventDefault();
                } else {
                    K.returnValue = false;
                }
            },
            getEvent: function(M, K) {
                var L = M || window.event;
                if (!L) {
                    var N = this.getEvent.caller;
                    while (N) {
                        L = N.arguments[0];
                        if (L && Event == L.constructor) {
                            break;
                        }
                        N = N.caller;
                    }
                }
                return L;
            },
            getCharCode: function(L) {
                var K = L.keyCode || L.charCode || 0;
                if (YAHOO.env.ua.webkit && (K in C)) {
                    K = C[K];
                }
                return K;
            },
            _getCacheIndex: function(M, P, Q, O) {
                for (var N = 0, L = M.length; N < L; N = N + 1) {
                    var K = M[N];
                    if (K && K[this.FN] == O && K[this.EL] == P && K[this.TYPE] == Q) {
                        return N;
                    }
                }
                return -1;
            },
            generateId: function(K) {
                var L = K.id;
                if (!L) {
                    L = "yuievtautoid-" + B;
                    ++B;
                    K.id = L;
                }
                return L;
            },
            _isValidCollection: function(L) {
                try {
                    return (L && typeof L !== "string" && L.length && !L.tagName && !L.alert && typeof L[0] !== "undefined");
                } catch (K) {
                    return false;
                }
            },
            elCache: {},
            getEl: function(K) {
                return (typeof K === "string") ? document.getElementById(K) : K;
            },
            clearCache: function() {},
            DOMReadyEvent: new YAHOO.util.CustomEvent("DOMReady", YAHOO, 0, 0, 1),
            _load: function(L) {
                if (!G) {
                    G = true;
                    var K = YAHOO.util.Event;
                    K._ready();
                    K._tryPreloadAttach();
                }
            },
            _ready: function(L) {
                var K = YAHOO.util.Event;
                if (!K.DOMReady) {
                    K.DOMReady = true;
                    K.DOMReadyEvent.fire();
                    K._simpleRemove(document, "DOMContentLoaded", K._ready);
                }
            },
            _tryPreloadAttach: function() {
                if (E.length === 0) {
                    A = 0;
                    if (this._interval) {
                        this._interval.cancel();
                        this._interval = null;
                    }
                    return;
                }
                if (this.locked) {
                    return;
                }
                if (this.isIE) {
                    if (!this.DOMReady) {
                        this.startInterval();
                        return;
                    }
                }
                this.locked = true;
                var Q = !G;
                if (!Q) {
                    Q = (A > 0 && E.length > 0);
                }
                var P = [];
                var R = function(T, U) {
                    var S = T;
                    if (U.overrideContext) {
                        if (U.overrideContext === true) {
                            S = U.obj;
                        } else {
                            S = U.overrideContext;
                        }
                    }
                    U.fn.call(S, U.obj);
                };
                var L, K, O, N, M = [];
                for (L = 0, K = E.length; L < K; L = L + 1) {
                    O = E[L];
                    if (O) {
                        N = this.getEl(O.id);
                        if (N) {
                            if (O.checkReady) {
                                if (G || N.nextSibling || !Q) {
                                    M.push(O);
                                    E[L] = null;
                                }
                            } else {
                                R(N, O);
                                E[L] = null;
                            }
                        } else {
                            P.push(O);
                        }
                    }
                }
                for (L = 0, K = M.length; L < K; L = L + 1) {
                    O = M[L];
                    R(this.getEl(O.id), O);
                }
                A--;
                if (Q) {
                    for (L = E.length - 1; L > -1; L--) {
                        O = E[L];
                        if (!O || !O.id) {
                            E.splice(L, 1);
                        }
                    }
                    this.startInterval();
                } else {
                    if (this._interval) {
                        this._interval.cancel();
                        this._interval = null;
                    }
                }
                this.locked = false;
            },
            purgeElement: function(O, P, R) {
                var M = (YAHOO.lang.isString(O)) ? this.getEl(O) : O;
                var Q = this.getListeners(M, R),
                    N, K;
                if (Q) {
                    for (N = Q.length - 1; N > -1; N--) {
                        var L = Q[N];
                        this.removeListener(M, L.type, L.fn);
                    }
                }
                if (P && M && M.childNodes) {
                    for (N = 0, K = M.childNodes.length; N < K; ++N) {
                        this.purgeElement(M.childNodes[N], P, R);
                    }
                }
            },
            getListeners: function(M, K) {
                var P = [],
                    L;
                if (!K) {
                    L = [H, J];
                } else {
                    if (K === "unload") {
                        L = [J];
                    } else {
                        K = this._getType(K);
                        L = [H];
                    }
                }
                var R = (YAHOO.lang.isString(M)) ? this.getEl(M) : M;
                for (var O = 0; O < L.length; O = O + 1) {
                    var T = L[O];
                    if (T) {
                        for (var Q = 0, S = T.length; Q < S; ++Q) {
                            var N = T[Q];
                            if (N && N[this.EL] === R && (!K || K === N[this.TYPE])) {
                                P.push({
                                    type: N[this.TYPE],
                                    fn: N[this.FN],
                                    obj: N[this.OBJ],
                                    adjust: N[this.OVERRIDE],
                                    scope: N[this.ADJ_SCOPE],
                                    index: Q
                                });
                            }
                        }
                    }
                }
                return (P.length) ? P : null;
            },
            _unload: function(R) {
                var L = YAHOO.util.Event,
                    O, N, M, Q, P, S = J.slice(),
                    K;
                for (O = 0, Q = J.length; O < Q; ++O) {
                    M = S[O];
                    if (M) {
                        K = window;
                        if (M[L.ADJ_SCOPE]) {
                            if (M[L.ADJ_SCOPE] === true) {
                                K = M[L.UNLOAD_OBJ];
                            } else {
                                K = M[L.ADJ_SCOPE];
                            }
                        }
                        M[L.FN].call(K, L.getEvent(R, M[L.EL]), M[L.UNLOAD_OBJ]);
                        S[O] = null;
                    }
                }
                M = null;
                K = null;
                J = null;
                if (H) {
                    for (N = H.length - 1; N > -1; N--) {
                        M = H[N];
                        if (M) {
                            L.removeListener(M[L.EL], M[L.TYPE], M[L.FN], N);
                        }
                    }
                    M = null;
                }
                L._simpleRemove(window, "unload", L._unload);
            },
            _getScrollLeft: function() {
                return this._getScroll()[1];
            },
            _getScrollTop: function() {
                return this._getScroll()[0];
            },
            _getScroll: function() {
                var K = document.documentElement,
                    L = document.body;
                if (K && (K.scrollTop || K.scrollLeft)) {
                    return [K.scrollTop, K.scrollLeft];
                } else {
                    if (L) {
                        return [L.scrollTop, L.scrollLeft];
                    } else {
                        return [0, 0];
                    }
                }
            },
            regCE: function() {},
            _simpleAdd: function() {
                if (window.addEventListener) {
                    return function(M, N, L, K) {
                        M.addEventListener(N, L, (K));
                    };
                } else {
                    if (window.attachEvent) {
                        return function(M, N, L, K) {
                            M.attachEvent("on" + N, L);
                        };
                    } else {
                        return function() {};
                    }
                }
            }(),
            _simpleRemove: function() {
                if (window.removeEventListener) {
                    return function(M, N, L, K) {
                        M.removeEventListener(N, L, (K));
                    };
                } else {
                    if (window.detachEvent) {
                        return function(L, M, K) {
                            L.detachEvent("on" + M, K);
                        };
                    } else {
                        return function() {};
                    }
                }
            }()
        };
    }();
    (function() {
        var EU = YAHOO.util.Event;
        EU.on = EU.addListener;
        EU.onFocus = EU.addFocusListener;
        EU.onBlur = EU.addBlurListener;
        /* DOMReady: based on work by: Dean Edwards/John Resig/Matthias Miller/Diego Perini */
        if (EU.isIE) {
            if (self !== self.top) {
                document.onreadystatechange = function() {
                    if (document.readyState == "complete") {
                        document.onreadystatechange = null;
                        EU._ready();
                    }
                };
            } else {
                YAHOO.util.Event.onDOMReady(YAHOO.util.Event._tryPreloadAttach, YAHOO.util.Event, true);
                var n = document.createElement("p");
                EU._dri = setInterval(function() {
                    try {
                        n.doScroll("left");
                        clearInterval(EU._dri);
                        EU._dri = null;
                        EU._ready();
                        n = null;
                    } catch (ex) {}
                }, EU.POLL_INTERVAL);
            }
        } else {
            if (EU.webkit && EU.webkit < 525) {
                EU._dri = setInterval(function() {
                    var rs = document.readyState;
                    if ("loaded" == rs || "complete" == rs) {
                        clearInterval(EU._dri);
                        EU._dri = null;
                        EU._ready();
                    }
                }, EU.POLL_INTERVAL);
            } else {
                EU._simpleAdd(document, "DOMContentLoaded", EU._ready);
            }
        }
        EU._simpleAdd(window, "load", EU._load);
        EU._simpleAdd(window, "unload", EU._unload);
        EU._tryPreloadAttach();
    })();
}
YAHOO.util.EventProvider = function() {};
YAHOO.util.EventProvider.prototype = {
    __yui_events: null,
    __yui_subscribers: null,
    subscribe: function(A, C, F, E) {
        this.__yui_events = this.__yui_events || {};
        var D = this.__yui_events[A];
        if (D) {
            D.subscribe(C, F, E);
        } else {
            this.__yui_subscribers = this.__yui_subscribers || {};
            var B = this.__yui_subscribers;
            if (!B[A]) {
                B[A] = [];
            }
            B[A].push({
                fn: C,
                obj: F,
                overrideContext: E
            });
        }
    },
    unsubscribe: function(C, E, G) {
        this.__yui_events = this.__yui_events || {};
        var A = this.__yui_events;
        if (C) {
            var F = A[C];
            if (F) {
                return F.unsubscribe(E, G);
            }
        } else {
            var B = true;
            for (var D in A) {
                if (YAHOO.lang.hasOwnProperty(A, D)) {
                    B = B && A[D].unsubscribe(E, G);
                }
            }
            return B;
        }
        return false;
    },
    unsubscribeAll: function(A) {
        return this.unsubscribe(A);
    },
    createEvent: function(B, G) {
        this.__yui_events = this.__yui_events || {};
        var E = G || {},
            D = this.__yui_events,
            F;
        if (D[B]) {} else {
            F = new YAHOO.util.CustomEvent(B, E.scope || this, E.silent, YAHOO.util.CustomEvent.FLAT, E.fireOnce);
            D[B] = F;
            if (E.onSubscribeCallback) {
                F.subscribeEvent.subscribe(E.onSubscribeCallback);
            }
            this.__yui_subscribers = this.__yui_subscribers || {};
            var A = this.__yui_subscribers[B];
            if (A) {
                for (var C = 0; C < A.length; ++C) {
                    F.subscribe(A[C].fn, A[C].obj, A[C].overrideContext);
                }
            }
        }
        return D[B];
    },
    fireEvent: function(B) {
        this.__yui_events = this.__yui_events || {};
        var D = this.__yui_events[B];
        if (!D) {
            return null;
        }
        var A = [];
        for (var C = 1; C < arguments.length; ++C) {
            A.push(arguments[C]);
        }
        return D.fire.apply(D, A);
    },
    hasEvent: function(A) {
        if (this.__yui_events) {
            if (this.__yui_events[A]) {
                return true;
            }
        }
        return false;
    }
};
(function() {
    var A = YAHOO.util.Event,
        C = YAHOO.lang;
    YAHOO.util.KeyListener = function(D, I, E, F) {
        if (!D) {} else {
            if (!I) {} else {
                if (!E) {}
            }
        }
        if (!F) {
            F = YAHOO.util.KeyListener.KEYDOWN;
        }
        var G = new YAHOO.util.CustomEvent("keyPressed");
        this.enabledEvent = new YAHOO.util.CustomEvent("enabled");
        this.disabledEvent = new YAHOO.util.CustomEvent("disabled");
        if (C.isString(D)) {
            D = document.getElementById(D);
        }
        if (C.isFunction(E)) {
            G.subscribe(E);
        } else {
            G.subscribe(E.fn, E.scope, E.correctScope);
        }

        function H(O, N) {
            if (!I.shift) {
                I.shift = false;
            }
            if (!I.alt) {
                I.alt = false;
            }
            if (!I.ctrl) {
                I.ctrl = false;
            }
            if (O.shiftKey == I.shift && O.altKey == I.alt && O.ctrlKey == I.ctrl) {
                var J, M = I.keys,
                    L;
                if (YAHOO.lang.isArray(M)) {
                    for (var K = 0; K < M.length; K++) {
                        J = M[K];
                        L = A.getCharCode(O);
                        if (J == L) {
                            G.fire(L, O);
                            break;
                        }
                    }
                } else {
                    L = A.getCharCode(O);
                    if (M == L) {
                        G.fire(L, O);
                    }
                }
            }
        }
        this.enable = function() {
            if (!this.enabled) {
                A.on(D, F, H);
                this.enabledEvent.fire(I);
            }
            this.enabled = true;
        };
        this.disable = function() {
            if (this.enabled) {
                A.removeListener(D, F, H);
                this.disabledEvent.fire(I);
            }
            this.enabled = false;
        };
        this.toString = function() {
            return "KeyListener [" + I.keys + "] " + D.tagName + (D.id ? "[" + D.id + "]" : "");
        };
    };
    var B = YAHOO.util.KeyListener;
    B.KEYDOWN = "keydown";
    B.KEYUP = "keyup";
    B.KEY = {
        ALT: 18,
        BACK_SPACE: 8,
        CAPS_LOCK: 20,
        CONTROL: 17,
        DELETE: 46,
        DOWN: 40,
        END: 35,
        ENTER: 13,
        ESCAPE: 27,
        HOME: 36,
        LEFT: 37,
        META: 224,
        NUM_LOCK: 144,
        PAGE_DOWN: 34,
        PAGE_UP: 33,
        PAUSE: 19,
        PRINTSCREEN: 44,
        RIGHT: 39,
        SCROLL_LOCK: 145,
        SHIFT: 16,
        SPACE: 32,
        TAB: 9,
        UP: 38
    };
})();
YAHOO.register("event", YAHOO.util.Event, {
    version: "2.8.2r1",
    build: "7"
});
YAHOO.util.Connect = {
    _msxml_progid: ["Microsoft.XMLHTTP", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP"],
    _http_headers: {},
    _has_http_headers: false,
    _use_default_post_header: true,
    _default_post_header: "application/x-www-form-urlencoded; charset=UTF-8",
    _default_form_header: "application/x-www-form-urlencoded",
    _use_default_xhr_header: true,
    _default_xhr_header: "XMLHttpRequest",
    _has_default_headers: true,
    _default_headers: {},
    _poll: {},
    _timeOut: {},
    _polling_interval: 50,
    _transaction_id: 0,
    startEvent: new YAHOO.util.CustomEvent("start"),
    completeEvent: new YAHOO.util.CustomEvent("complete"),
    successEvent: new YAHOO.util.CustomEvent("success"),
    failureEvent: new YAHOO.util.CustomEvent("failure"),
    abortEvent: new YAHOO.util.CustomEvent("abort"),
    _customEvents: {
        onStart: ["startEvent", "start"],
        onComplete: ["completeEvent", "complete"],
        onSuccess: ["successEvent", "success"],
        onFailure: ["failureEvent", "failure"],
        onUpload: ["uploadEvent", "upload"],
        onAbort: ["abortEvent", "abort"]
    },
    setProgId: function(A) {
        this._msxml_progid.unshift(A);
    },
    setDefaultPostHeader: function(A) {
        if (typeof A == "string") {
            this._default_post_header = A;
        } else {
            if (typeof A == "boolean") {
                this._use_default_post_header = A;
            }
        }
    },
    setDefaultXhrHeader: function(A) {
        if (typeof A == "string") {
            this._default_xhr_header = A;
        } else {
            this._use_default_xhr_header = A;
        }
    },
    setPollingInterval: function(A) {
        if (typeof A == "number" && isFinite(A)) {
            this._polling_interval = A;
        }
    },
    createXhrObject: function(F) {
        var D, A, B;
        try {
            A = new XMLHttpRequest();
            D = {
                conn: A,
                tId: F,
                xhr: true
            };
        } catch (C) {
            for (B = 0; B < this._msxml_progid.length; ++B) {
                try {
                    A = new ActiveXObject(this._msxml_progid[B]);
                    D = {
                        conn: A,
                        tId: F,
                        xhr: true
                    };
                    break;
                } catch (E) {}
            }
        } finally {
            return D;
        }
    },
    getConnectionObject: function(A) {
        var C, D = this._transaction_id;
        try {
            if (!A) {
                C = this.createXhrObject(D);
            } else {
                C = {
                    tId: D
                };
                if (A === "xdr") {
                    C.conn = this._transport;
                    C.xdr = true;
                } else {
                    if (A === "upload") {
                        C.upload = true;
                    }
                }
            }
            if (C) {
                this._transaction_id++;
            }
        } catch (B) {}
        return C;
    },
    asyncRequest: function(G, D, F, A) {
        var E, C, B = (F && F.argument) ? F.argument : null;
        if (this._isFileUpload) {
            C = "upload";
        } else {
            if (F.xdr) {
                C = "xdr";
            }
        }
        E = this.getConnectionObject(C);
        if (!E) {
            return null;
        } else {
            if (F && F.customevents) {
                this.initCustomEvents(E, F);
            }
            if (this._isFormSubmit) {
                if (this._isFileUpload) {
                    this.uploadFile(E, F, D, A);
                    return E;
                }
                if (G.toUpperCase() == "GET") {
                    if (this._sFormData.length !== 0) {
                        D += ((D.indexOf("?") == -1) ? "?" : "&") + this._sFormData;
                    }
                } else {
                    if (G.toUpperCase() == "POST") {
                        A = A ? this._sFormData + "&" + A : this._sFormData;
                    }
                }
            }
            if (G.toUpperCase() == "GET" && (F && F.cache === false)) {
                D += ((D.indexOf("?") == -1) ? "?" : "&") + "rnd=" + new Date().valueOf().toString();
            }
            if (this._use_default_xhr_header) {
                if (!this._default_headers["X-Requested-With"]) {
                    this.initHeader("X-Requested-With", this._default_xhr_header, true);
                }
            }
            if ((G.toUpperCase() === "POST" && this._use_default_post_header) && this._isFormSubmit === false) {
                this.initHeader("Content-Type", this._default_post_header);
            }
            if (E.xdr) {
                this.xdr(E, G, D, F, A);
                return E;
            }
            E.conn.open(G, D, true);
            if (this._has_default_headers || this._has_http_headers) {
                this.setHeader(E);
            }
            this.handleReadyState(E, F);
            E.conn.send(A || "");
            if (this._isFormSubmit === true) {
                this.resetFormState();
            }
            this.startEvent.fire(E, B);
            if (E.startEvent) {
                E.startEvent.fire(E, B);
            }
            return E;
        }
    },
    initCustomEvents: function(A, C) {
        var B;
        for (B in C.customevents) {
            if (this._customEvents[B][0]) {
                A[this._customEvents[B][0]] = new YAHOO.util.CustomEvent(this._customEvents[B][1], (C.scope) ? C.scope : null);
                A[this._customEvents[B][0]].subscribe(C.customevents[B]);
            }
        }
    },
    handleReadyState: function(C, D) {
        var B = this,
            A = (D && D.argument) ? D.argument : null;
        if (D && D.timeout) {
            this._timeOut[C.tId] = window.setTimeout(function() {
                B.abort(C, D, true);
            }, D.timeout);
        }
        this._poll[C.tId] = window.setInterval(function() {
            if (C.conn && C.conn.readyState === 4) {
                window.clearInterval(B._poll[C.tId]);
                delete B._poll[C.tId];
                if (D && D.timeout) {
                    window.clearTimeout(B._timeOut[C.tId]);
                    delete B._timeOut[C.tId];
                }
                B.completeEvent.fire(C, A);
                if (C.completeEvent) {
                    C.completeEvent.fire(C, A);
                }
                B.handleTransactionResponse(C, D);
            }
        }, this._polling_interval);
    },
    handleTransactionResponse: function(B, I, D) {
        var E, A, G = (I && I.argument) ? I.argument : null,
            C = (B.r && B.r.statusText === "xdr:success") ? true : false,
            H = (B.r && B.r.statusText === "xdr:failure") ? true : false,
            J = D;
        try {
            if ((B.conn.status !== undefined && B.conn.status !== 0) || C) {
                E = B.conn.status;
            } else {
                if (H && !J) {
                    E = 0;
                } else {
                    E = 13030;
                }
            }
        } catch (F) {
            E = 13030;
        }
        if ((E >= 200 && E < 300) || E === 1223 || C) {
            A = B.xdr ? B.r : this.createResponseObject(B, G);
            if (I && I.success) {
                if (!I.scope) {
                    I.success(A);
                } else {
                    I.success.apply(I.scope, [A]);
                }
            }
            this.successEvent.fire(A);
            if (B.successEvent) {
                B.successEvent.fire(A);
            }
        } else {
            switch (E) {
                case 12002:
                case 12029:
                case 12030:
                case 12031:
                case 12152:
                case 13030:
                    A = this.createExceptionObject(B.tId, G, (D ? D : false));
                    if (I && I.failure) {
                        if (!I.scope) {
                            I.failure(A);
                        } else {
                            I.failure.apply(I.scope, [A]);
                        }
                    }
                    break;
                default:
                    A = (B.xdr) ? B.response : this.createResponseObject(B, G);
                    if (I && I.failure) {
                        if (!I.scope) {
                            I.failure(A);
                        } else {
                            I.failure.apply(I.scope, [A]);
                        }
                    }
            }
            this.failureEvent.fire(A);
            if (B.failureEvent) {
                B.failureEvent.fire(A);
            }
        }
        this.releaseObject(B);
        A = null;
    },
    createResponseObject: function(A, G) {
        var D = {},
            I = {},
            E, C, F, B;
        try {
            C = A.conn.getAllResponseHeaders();
            F = C.split("\n");
            for (E = 0; E < F.length; E++) {
                B = F[E].indexOf(":");
                if (B != -1) {
                    I[F[E].substring(0, B)] = YAHOO.lang.trim(F[E].substring(B + 2));
                }
            }
        } catch (H) {}
        D.tId = A.tId;
        D.status = (A.conn.status == 1223) ? 204 : A.conn.status;
        D.statusText = (A.conn.status == 1223) ? "No Content" : A.conn.statusText;
        D.getResponseHeader = I;
        D.getAllResponseHeaders = C;
        D.responseText = A.conn.responseText;
        D.responseXML = A.conn.responseXML;
        if (G) {
            D.argument = G;
        }
        return D;
    },
    createExceptionObject: function(H, D, A) {
        var F = 0,
            G = "communication failure",
            C = -1,
            B = "transaction aborted",
            E = {};
        E.tId = H;
        if (A) {
            E.status = C;
            E.statusText = B;
        } else {
            E.status = F;
            E.statusText = G;
        }
        if (D) {
            E.argument = D;
        }
        return E;
    },
    initHeader: function(A, D, C) {
        var B = (C) ? this._default_headers : this._http_headers;
        B[A] = D;
        if (C) {
            this._has_default_headers = true;
        } else {
            this._has_http_headers = true;
        }
    },
    setHeader: function(A) {
        var B;
        if (this._has_default_headers) {
            for (B in this._default_headers) {
                if (YAHOO.lang.hasOwnProperty(this._default_headers, B)) {
                    A.conn.setRequestHeader(B, this._default_headers[B]);
                }
            }
        }
        if (this._has_http_headers) {
            for (B in this._http_headers) {
                if (YAHOO.lang.hasOwnProperty(this._http_headers, B)) {
                    A.conn.setRequestHeader(B, this._http_headers[B]);
                }
            }
            this._http_headers = {};
            this._has_http_headers = false;
        }
    },
    resetDefaultHeaders: function() {
        this._default_headers = {};
        this._has_default_headers = false;
    },
    abort: function(E, G, A) {
        var D, B = (G && G.argument) ? G.argument : null;
        E = E || {};
        if (E.conn) {
            if (E.xhr) {
                if (this.isCallInProgress(E)) {
                    E.conn.abort();
                    window.clearInterval(this._poll[E.tId]);
                    delete this._poll[E.tId];
                    if (A) {
                        window.clearTimeout(this._timeOut[E.tId]);
                        delete this._timeOut[E.tId];
                    }
                    D = true;
                }
            } else {
                if (E.xdr) {
                    E.conn.abort(E.tId);
                    D = true;
                }
            }
        } else {
            if (E.upload) {
                var C = "yuiIO" + E.tId;
                var F = document.getElementById(C);
                if (F) {
                    YAHOO.util.Event.removeListener(F, "load");
                    document.body.removeChild(F);
                    if (A) {
                        window.clearTimeout(this._timeOut[E.tId]);
                        delete this._timeOut[E.tId];
                    }
                    D = true;
                }
            } else {
                D = false;
            }
        }
        if (D === true) {
            this.abortEvent.fire(E, B);
            if (E.abortEvent) {
                E.abortEvent.fire(E, B);
            }
            this.handleTransactionResponse(E, G, true);
        }
        return D;
    },
    isCallInProgress: function(A) {
        A = A || {};
        if (A.xhr && A.conn) {
            return A.conn.readyState !== 4 && A.conn.readyState !== 0;
        } else {
            if (A.xdr && A.conn) {
                return A.conn.isCallInProgress(A.tId);
            } else {
                if (A.upload === true) {
                    return document.getElementById("yuiIO" + A.tId) ? true : false;
                } else {
                    return false;
                }
            }
        }
    },
    releaseObject: function(A) {
        if (A && A.conn) {
            A.conn = null;
            A = null;
        }
    }
};
(function() {
    var G = YAHOO.util.Connect,
        H = {};

    function D(I) {
        var J = '<object id="YUIConnectionSwf" type="application/x-shockwave-flash" data="' + I + '" width="0" height="0">' + '<param name="movie" value="' + I + '">' + '<param name="allowScriptAccess" value="always">' + "</object>",
            K = document.createElement("div");
        document.body.appendChild(K);
        K.innerHTML = J;
    }

    function B(L, I, J, M, K) {
        H[parseInt(L.tId)] = {
            "o": L,
            "c": M
        };
        if (K) {
            M.method = I;
            M.data = K;
        }
        L.conn.send(J, M, L.tId);
    }

    function E(I) {
        D(I);
        G._transport = document.getElementById("YUIConnectionSwf");
    }

    function C() {
        G.xdrReadyEvent.fire();
    }

    function A(J, I) {
        if (J) {
            G.startEvent.fire(J, I.argument);
            if (J.startEvent) {
                J.startEvent.fire(J, I.argument);
            }
        }
    }

    function F(J) {
        var K = H[J.tId].o,
            I = H[J.tId].c;
        if (J.statusText === "xdr:start") {
            A(K, I);
            return;
        }
        J.responseText = decodeURI(J.responseText);
        K.r = J;
        if (I.argument) {
            K.r.argument = I.argument;
        }
        this.handleTransactionResponse(K, I, J.statusText === "xdr:abort" ? true : false);
        delete H[J.tId];
    }
    G.xdr = B;
    G.swf = D;
    G.transport = E;
    G.xdrReadyEvent = new YAHOO.util.CustomEvent("xdrReady");
    G.xdrReady = C;
    G.handleXdrResponse = F;
})();
(function() {
    var D = YAHOO.util.Connect,
        F = YAHOO.util.Event;
    D._isFormSubmit = false;
    D._isFileUpload = false;
    D._formNode = null;
    D._sFormData = null;
    D._submitElementValue = null;
    D.uploadEvent = new YAHOO.util.CustomEvent("upload"), D._hasSubmitListener = function() {
        if (F) {
            F.addListener(document, "click", function(J) {
                var I = F.getTarget(J),
                    H = I.nodeName.toLowerCase();
                if ((H === "input" || H === "button") && (I.type && I.type.toLowerCase() == "submit")) {
                    D._submitElementValue = encodeURIComponent(I.name) + "=" + encodeURIComponent(I.value);
                }
            });
            return true;
        }
        return false;
    }();

    function G(T, O, J) {
        var S, I, R, P, W, Q = false,
            M = [],
            V = 0,
            L, N, K, U, H;
        this.resetFormState();
        if (typeof T == "string") {
            S = (document.getElementById(T) || document.forms[T]);
        } else {
            if (typeof T == "object") {
                S = T;
            } else {
                return;
            }
        }
        if (O) {
            this.createFrame(J ? J : null);
            this._isFormSubmit = true;
            this._isFileUpload = true;
            this._formNode = S;
            return;
        }
        for (L = 0, N = S.elements.length; L < N; ++L) {
            I = S.elements[L];
            W = I.disabled;
            R = I.name;
            if (!W && R) {
                R = encodeURIComponent(R) + "=";
                P = encodeURIComponent(I.value);
                switch (I.type) {
                    case "select-one":
                        if (I.selectedIndex > -1) {
                            H = I.options[I.selectedIndex];
                            M[V++] = R + encodeURIComponent((H.attributes.value && H.attributes.value.specified) ? H.value : H.text);
                        }
                        break;
                    case "select-multiple":
                        if (I.selectedIndex > -1) {
                            for (K = I.selectedIndex, U = I.options.length; K < U; ++K) {
                                H = I.options[K];
                                if (H.selected) {
                                    M[V++] = R + encodeURIComponent((H.attributes.value && H.attributes.value.specified) ? H.value : H.text);
                                }
                            }
                        }
                        break;
                    case "radio":
                    case "checkbox":
                        if (I.checked) {
                            M[V++] = R + P;
                        }
                        break;
                    case "file":
                    case undefined:
                    case "reset":
                    case "button":
                        break;
                    case "submit":
                        if (Q === false) {
                            if (this._hasSubmitListener && this._submitElementValue) {
                                M[V++] = this._submitElementValue;
                            }
                            Q = true;
                        }
                        break;
                    default:
                        M[V++] = R + P;
                }
            }
        }
        this._isFormSubmit = true;
        this._sFormData = M.join("&");
        this.initHeader("Content-Type", this._default_form_header);
        return this._sFormData;
    }

    function C() {
        this._isFormSubmit = false;
        this._isFileUpload = false;
        this._formNode = null;
        this._sFormData = "";
    }

    function B(H) {
        var I = "yuiIO" + this._transaction_id,
            J;
        if (YAHOO.env.ua.ie) {
            J = document.createElement('<iframe id="' + I + '" name="' + I + '" />');
            if (typeof H == "boolean") {
                J.src = "javascript:false";
            }
        } else {
            J = document.createElement("iframe");
            J.id = I;
            J.name = I;
        }
        J.style.position = "absolute";
        J.style.top = "-1000px";
        J.style.left = "-1000px";
        document.body.appendChild(J);
    }

    function E(H) {
        var K = [],
            I = H.split("&"),
            J, L;
        for (J = 0; J < I.length; J++) {
            L = I[J].indexOf("=");
            if (L != -1) {
                K[J] = document.createElement("input");
                K[J].type = "hidden";
                K[J].name = decodeURIComponent(I[J].substring(0, L));
                K[J].value = decodeURIComponent(I[J].substring(L + 1));
                this._formNode.appendChild(K[J]);
            }
        }
        return K;
    }

    function A(K, V, L, J) {
        var Q = "yuiIO" + K.tId,
            R = "multipart/form-data",
            T = document.getElementById(Q),
            M = (document.documentMode && document.documentMode === 8) ? true : false,
            W = this,
            S = (V && V.argument) ? V.argument : null,
            U, P, I, O, H, N;
        H = {
            action: this._formNode.getAttribute("action"),
            method: this._formNode.getAttribute("method"),
            target: this._formNode.getAttribute("target")
        };
        this._formNode.setAttribute("action", L);
        this._formNode.setAttribute("method", "POST");
        this._formNode.setAttribute("target", Q);
        if (YAHOO.env.ua.ie && !M) {
            this._formNode.setAttribute("encoding", R);
        } else {
            this._formNode.setAttribute("enctype", R);
        }
        if (J) {
            U = this.appendPostData(J);
        }
        this._formNode.submit();
        this.startEvent.fire(K, S);
        if (K.startEvent) {
            K.startEvent.fire(K, S);
        }
        if (V && V.timeout) {
            this._timeOut[K.tId] = window.setTimeout(function() {
                W.abort(K, V, true);
            }, V.timeout);
        }
        if (U && U.length > 0) {
            for (P = 0; P < U.length; P++) {
                this._formNode.removeChild(U[P]);
            }
        }
        for (I in H) {
            if (YAHOO.lang.hasOwnProperty(H, I)) {
                if (H[I]) {
                    this._formNode.setAttribute(I, H[I]);
                } else {
                    this._formNode.removeAttribute(I);
                }
            }
        }
        this.resetFormState();
        N = function() {
            if (V && V.timeout) {
                window.clearTimeout(W._timeOut[K.tId]);
                delete W._timeOut[K.tId];
            }
            W.completeEvent.fire(K, S);
            if (K.completeEvent) {
                K.completeEvent.fire(K, S);
            }
            O = {
                tId: K.tId,
                argument: V.argument
            };
            try {
                O.responseText = T.contentWindow.document.body ? T.contentWindow.document.body.innerHTML : T.contentWindow.document.documentElement.textContent;
                O.responseXML = T.contentWindow.document.XMLDocument ? T.contentWindow.document.XMLDocument : T.contentWindow.document;
            } catch (X) {}
            if (V && V.upload) {
                if (!V.scope) {
                    V.upload(O);
                } else {
                    V.upload.apply(V.scope, [O]);
                }
            }
            W.uploadEvent.fire(O);
            if (K.uploadEvent) {
                K.uploadEvent.fire(O);
            }
            F.removeListener(T, "load", N);
            setTimeout(function() {
                document.body.removeChild(T);
                W.releaseObject(K);
            }, 100);
        };
        F.addListener(T, "load", N);
    }
    D.setForm = G;
    D.resetFormState = C;
    D.createFrame = B;
    D.appendPostData = E;
    D.uploadFile = A;
})();
YAHOO.register("connection", YAHOO.util.Connect, {
    version: "2.8.2r1",
    build: "7"
});
(function() {
    var B = YAHOO.util;
    var A = function(D, C, E, F) {
        if (!D) {}
        this.init(D, C, E, F);
    };
    A.NAME = "Anim";
    A.prototype = {
        toString: function() {
            var C = this.getEl() || {};
            var D = C.id || C.tagName;
            return (this.constructor.NAME + ": " + D);
        },
        patterns: {
            noNegatives: /width|height|opacity|padding/i,
            offsetAttribute: /^((width|height)|(top|left))$/,
            defaultUnit: /width|height|top$|bottom$|left$|right$/i,
            offsetUnit: /\d+(em|%|en|ex|pt|in|cm|mm|pc)$/i
        },
        doMethod: function(C, E, D) {
            return this.method(this.currentFrame, E, D - E, this.totalFrames);
        },
        setAttribute: function(C, F, E) {
            var D = this.getEl();
            if (this.patterns.noNegatives.test(C)) {
                F = (F > 0) ? F : 0;
            }
            if (C in D && !("style" in D && C in D.style)) {
                D[C] = F;
            } else {
                B.Dom.setStyle(D, C, F + E);
            }
        },
        getAttribute: function(C) {
            var E = this.getEl();
            var G = B.Dom.getStyle(E, C);
            if (G !== "auto" && !this.patterns.offsetUnit.test(G)) {
                return parseFloat(G);
            }
            var D = this.patterns.offsetAttribute.exec(C) || [];
            var H = !!(D[3]);
            var F = !!(D[2]);
            if ("style" in E) {
                if (F || (B.Dom.getStyle(E, "position") == "absolute" && H)) {
                    G = E["offset" + D[0].charAt(0).toUpperCase() + D[0].substr(1)];
                } else {
                    G = 0;
                }
            } else {
                if (C in E) {
                    G = E[C];
                }
            }
            return G;
        },
        getDefaultUnit: function(C) {
            if (this.patterns.defaultUnit.test(C)) {
                return "px";
            }
            return "";
        },
        setRuntimeAttribute: function(D) {
            var I;
            var E;
            var F = this.attributes;
            this.runtimeAttributes[D] = {};
            var H = function(J) {
                return (typeof J !== "undefined");
            };
            if (!H(F[D]["to"]) && !H(F[D]["by"])) {
                return false;
            }
            I = (H(F[D]["from"])) ? F[D]["from"] : this.getAttribute(D);
            if (H(F[D]["to"])) {
                E = F[D]["to"];
            } else {
                if (H(F[D]["by"])) {
                    if (I.constructor == Array) {
                        E = [];
                        for (var G = 0, C = I.length; G < C; ++G) {
                            E[G] = I[G] + F[D]["by"][G] * 1;
                        }
                    } else {
                        E = I + F[D]["by"] * 1;
                    }
                }
            }
            this.runtimeAttributes[D].start = I;
            this.runtimeAttributes[D].end = E;
            this.runtimeAttributes[D].unit = (H(F[D].unit)) ? F[D]["unit"] : this.getDefaultUnit(D);
            return true;
        },
        init: function(E, J, I, C) {
            var D = false;
            var F = null;
            var H = 0;
            E = B.Dom.get(E);
            this.attributes = J || {};
            this.duration = !YAHOO.lang.isUndefined(I) ? I : 1;
            this.method = C || B.Easing.easeNone;
            this.useSeconds = true;
            this.currentFrame = 0;
            this.totalFrames = B.AnimMgr.fps;
            this.setEl = function(M) {
                E = B.Dom.get(M);
            };
            this.getEl = function() {
                return E;
            };
            this.isAnimated = function() {
                return D;
            };
            this.getStartTime = function() {
                return F;
            };
            this.runtimeAttributes = {};
            this.animate = function() {
                if (this.isAnimated()) {
                    return false;
                }
                this.currentFrame = 0;
                this.totalFrames = (this.useSeconds) ? Math.ceil(B.AnimMgr.fps * this.duration) : this.duration;
                if (this.duration === 0 && this.useSeconds) {
                    this.totalFrames = 1;
                }
                B.AnimMgr.registerElement(this);
                return true;
            };
            this.stop = function(M) {
                if (!this.isAnimated()) {
                    return false;
                }
                if (M) {
                    this.currentFrame = this.totalFrames;
                    this._onTween.fire();
                }
                B.AnimMgr.stop(this);
            };
            var L = function() {
                this.onStart.fire();
                this.runtimeAttributes = {};
                for (var M in this.attributes) {
                    this.setRuntimeAttribute(M);
                }
                D = true;
                H = 0;
                F = new Date();
            };
            var K = function() {
                var O = {
                    duration: new Date() - this.getStartTime(),
                    currentFrame: this.currentFrame
                };
                O.toString = function() {
                    return ("duration: " + O.duration + ", currentFrame: " + O.currentFrame);
                };
                this.onTween.fire(O);
                var N = this.runtimeAttributes;
                for (var M in N) {
                    this.setAttribute(M, this.doMethod(M, N[M].start, N[M].end), N[M].unit);
                }
                H += 1;
            };
            var G = function() {
                var M = (new Date() - F) / 1000;
                var N = {
                    duration: M,
                    frames: H,
                    fps: H / M
                };
                N.toString = function() {
                    return ("duration: " + N.duration + ", frames: " + N.frames + ", fps: " + N.fps);
                };
                D = false;
                H = 0;
                this.onComplete.fire(N);
            };
            this._onStart = new B.CustomEvent("_start", this, true);
            this.onStart = new B.CustomEvent("start", this);
            this.onTween = new B.CustomEvent("tween", this);
            this._onTween = new B.CustomEvent("_tween", this, true);
            this.onComplete = new B.CustomEvent("complete", this);
            this._onComplete = new B.CustomEvent("_complete", this, true);
            this._onStart.subscribe(L);
            this._onTween.subscribe(K);
            this._onComplete.subscribe(G);
        }
    };
    B.Anim = A;
})();
YAHOO.util.AnimMgr = new function() {
    var C = null;
    var B = [];
    var A = 0;
    this.fps = 1000;
    this.delay = 1;
    this.registerElement = function(F) {
        B[B.length] = F;
        A += 1;
        F._onStart.fire();
        this.start();
    };
    this.unRegister = function(G, F) {
        F = F || E(G);
        if (!G.isAnimated() || F === -1) {
            return false;
        }
        G._onComplete.fire();
        B.splice(F, 1);
        A -= 1;
        if (A <= 0) {
            this.stop();
        }
        return true;
    };
    this.start = function() {
        if (C === null) {
            C = setInterval(this.run, this.delay);
        }
    };
    this.stop = function(H) {
        if (!H) {
            clearInterval(C);
            for (var G = 0, F = B.length; G < F; ++G) {
                this.unRegister(B[0], 0);
            }
            B = [];
            C = null;
            A = 0;
        } else {
            this.unRegister(H);
        }
    };
    this.run = function() {
        for (var H = 0, F = B.length; H < F; ++H) {
            var G = B[H];
            if (!G || !G.isAnimated()) {
                continue;
            }
            if (G.currentFrame < G.totalFrames || G.totalFrames === null) {
                G.currentFrame += 1;
                if (G.useSeconds) {
                    D(G);
                }
                G._onTween.fire();
            } else {
                YAHOO.util.AnimMgr.stop(G, H);
            }
        }
    };
    var E = function(H) {
        for (var G = 0, F = B.length; G < F; ++G) {
            if (B[G] === H) {
                return G;
            }
        }
        return -1;
    };
    var D = function(G) {
        var J = G.totalFrames;
        var I = G.currentFrame;
        var H = (G.currentFrame * G.duration * 1000 / G.totalFrames);
        var F = (new Date() - G.getStartTime());
        var K = 0;
        if (F < G.duration * 1000) {
            K = Math.round((F / H - 1) * G.currentFrame);
        } else {
            K = J - (I + 1);
        }
        if (K > 0 && isFinite(K)) {
            if (G.currentFrame + K >= J) {
                K = J - (I + 1);
            }
            G.currentFrame += K;
        }
    };
    this._queue = B;
    this._getIndex = E;
};
YAHOO.util.Bezier = new function() {
    this.getPosition = function(E, D) {
        var F = E.length;
        var C = [];
        for (var B = 0; B < F; ++B) {
            C[B] = [E[B][0], E[B][1]];
        }
        for (var A = 1; A < F; ++A) {
            for (B = 0; B < F - A; ++B) {
                C[B][0] = (1 - D) * C[B][0] + D * C[parseInt(B + 1, 10)][0];
                C[B][1] = (1 - D) * C[B][1] + D * C[parseInt(B + 1, 10)][1];
            }
        }
        return [C[0][0], C[0][1]];
    };
};
(function() {
    var A = function(F, E, G, H) {
        A.superclass.constructor.call(this, F, E, G, H);
    };
    A.NAME = "ColorAnim";
    A.DEFAULT_BGCOLOR = "#fff";
    var C = YAHOO.util;
    YAHOO.extend(A, C.Anim);
    var D = A.superclass;
    var B = A.prototype;
    B.patterns.color = /color$/i;
    B.patterns.rgb = /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i;
    B.patterns.hex = /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i;
    B.patterns.hex3 = /^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i;
    B.patterns.transparent = /^transparent|rgba\(0, 0, 0, 0\)$/;
    B.parseColor = function(E) {
        if (E.length == 3) {
            return E;
        }
        var F = this.patterns.hex.exec(E);
        if (F && F.length == 4) {
            return [parseInt(F[1], 16), parseInt(F[2], 16), parseInt(F[3], 16)];
        }
        F = this.patterns.rgb.exec(E);
        if (F && F.length == 4) {
            return [parseInt(F[1], 10), parseInt(F[2], 10), parseInt(F[3], 10)];
        }
        F = this.patterns.hex3.exec(E);
        if (F && F.length == 4) {
            return [parseInt(F[1] + F[1], 16), parseInt(F[2] + F[2], 16), parseInt(F[3] + F[3], 16)];
        }
        return null;
    };
    B.getAttribute = function(E) {
        var G = this.getEl();
        if (this.patterns.color.test(E)) {
            var I = YAHOO.util.Dom.getStyle(G, E);
            var H = this;
            if (this.patterns.transparent.test(I)) {
                var F = YAHOO.util.Dom.getAncestorBy(G, function(J) {
                    return !H.patterns.transparent.test(I);
                });
                if (F) {
                    I = C.Dom.getStyle(F, E);
                } else {
                    I = A.DEFAULT_BGCOLOR;
                }
            }
        } else {
            I = D.getAttribute.call(this, E);
        }
        return I;
    };
    B.doMethod = function(F, J, G) {
        var I;
        if (this.patterns.color.test(F)) {
            I = [];
            for (var H = 0, E = J.length; H < E; ++H) {
                I[H] = D.doMethod.call(this, F, J[H], G[H]);
            }
            I = "rgb(" + Math.floor(I[0]) + "," + Math.floor(I[1]) + "," + Math.floor(I[2]) + ")";
        } else {
            I = D.doMethod.call(this, F, J, G);
        }
        return I;
    };
    B.setRuntimeAttribute = function(F) {
        D.setRuntimeAttribute.call(this, F);
        if (this.patterns.color.test(F)) {
            var H = this.attributes;
            var J = this.parseColor(this.runtimeAttributes[F].start);
            var G = this.parseColor(this.runtimeAttributes[F].end);
            if (typeof H[F]["to"] === "undefined" && typeof H[F]["by"] !== "undefined") {
                G = this.parseColor(H[F].by);
                for (var I = 0, E = J.length; I < E; ++I) {
                    G[I] = J[I] + G[I];
                }
            }
            this.runtimeAttributes[F].start = J;
            this.runtimeAttributes[F].end = G;
        }
    };
    C.ColorAnim = A;
})();
/*
TERMS OF USE - EASING EQUATIONS
Open source under the BSD License.
Copyright 2001 Robert Penner All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * Neither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
YAHOO.util.Easing = {
    easeNone: function(B, A, D, C) {
        return D * B / C + A;
    },
    easeIn: function(B, A, D, C) {
        return D * (B /= C) * B + A;
    },
    easeOut: function(B, A, D, C) {
        return -D * (B /= C) * (B - 2) + A;
    },
    easeBoth: function(B, A, D, C) {
        if ((B /= C / 2) < 1) {
            return D / 2 * B * B + A;
        }
        return -D / 2 * ((--B) * (B - 2) - 1) + A;
    },
    easeInStrong: function(B, A, D, C) {
        return D * (B /= C) * B * B * B + A;
    },
    easeOutStrong: function(B, A, D, C) {
        return -D * ((B = B / C - 1) * B * B * B - 1) + A;
    },
    easeBothStrong: function(B, A, D, C) {
        if ((B /= C / 2) < 1) {
            return D / 2 * B * B * B * B + A;
        }
        return -D / 2 * ((B -= 2) * B * B * B - 2) + A;
    },
    elasticIn: function(C, A, G, F, B, E) {
        if (C == 0) {
            return A;
        }
        if ((C /= F) == 1) {
            return A + G;
        }
        if (!E) {
            E = F * 0.3;
        }
        if (!B || B < Math.abs(G)) {
            B = G;
            var D = E / 4;
        } else {
            var D = E / (2 * Math.PI) * Math.asin(G / B);
        }
        return -(B * Math.pow(2, 10 * (C -= 1)) * Math.sin((C * F - D) * (2 * Math.PI) / E)) + A;
    },
    elasticOut: function(C, A, G, F, B, E) {
        if (C == 0) {
            return A;
        }
        if ((C /= F) == 1) {
            return A + G;
        }
        if (!E) {
            E = F * 0.3;
        }
        if (!B || B < Math.abs(G)) {
            B = G;
            var D = E / 4;
        } else {
            var D = E / (2 * Math.PI) * Math.asin(G / B);
        }
        return B * Math.pow(2, -10 * C) * Math.sin((C * F - D) * (2 * Math.PI) / E) + G + A;
    },
    elasticBoth: function(C, A, G, F, B, E) {
        if (C == 0) {
            return A;
        }
        if ((C /= F / 2) == 2) {
            return A + G;
        }
        if (!E) {
            E = F * (0.3 * 1.5);
        }
        if (!B || B < Math.abs(G)) {
            B = G;
            var D = E / 4;
        } else {
            var D = E / (2 * Math.PI) * Math.asin(G / B);
        }
        if (C < 1) {
            return -0.5 * (B * Math.pow(2, 10 * (C -= 1)) * Math.sin((C * F - D) * (2 * Math.PI) / E)) + A;
        }
        return B * Math.pow(2, -10 * (C -= 1)) * Math.sin((C * F - D) * (2 * Math.PI) / E) * 0.5 + G + A;
    },
    backIn: function(B, A, E, D, C) {
        if (typeof C == "undefined") {
            C = 1.70158;
        }
        return E * (B /= D) * B * ((C + 1) * B - C) + A;
    },
    backOut: function(B, A, E, D, C) {
        if (typeof C == "undefined") {
            C = 1.70158;
        }
        return E * ((B = B / D - 1) * B * ((C + 1) * B + C) + 1) + A;
    },
    backBoth: function(B, A, E, D, C) {
        if (typeof C == "undefined") {
            C = 1.70158;
        }
        if ((B /= D / 2) < 1) {
            return E / 2 * (B * B * (((C *= (1.525)) + 1) * B - C)) + A;
        }
        return E / 2 * ((B -= 2) * B * (((C *= (1.525)) + 1) * B + C) + 2) + A;
    },
    bounceIn: function(B, A, D, C) {
        return D - YAHOO.util.Easing.bounceOut(C - B, 0, D, C) + A;
    },
    bounceOut: function(B, A, D, C) {
        if ((B /= C) < (1 / 2.75)) {
            return D * (7.5625 * B * B) + A;
        } else {
            if (B < (2 / 2.75)) {
                return D * (7.5625 * (B -= (1.5 / 2.75)) * B + 0.75) + A;
            } else {
                if (B < (2.5 / 2.75)) {
                    return D * (7.5625 * (B -= (2.25 / 2.75)) * B + 0.9375) + A;
                }
            }
        }
        return D * (7.5625 * (B -= (2.625 / 2.75)) * B + 0.984375) + A;
    },
    bounceBoth: function(B, A, D, C) {
        if (B < C / 2) {
            return YAHOO.util.Easing.bounceIn(B * 2, 0, D, C) * 0.5 + A;
        }
        return YAHOO.util.Easing.bounceOut(B * 2 - C, 0, D, C) * 0.5 + D * 0.5 + A;
    }
};
(function() {
    var A = function(H, G, I, J) {
        if (H) {
            A.superclass.constructor.call(this, H, G, I, J);
        }
    };
    A.NAME = "Motion";
    var E = YAHOO.util;
    YAHOO.extend(A, E.ColorAnim);
    var F = A.superclass;
    var C = A.prototype;
    C.patterns.points = /^points$/i;
    C.setAttribute = function(G, I, H) {
        if (this.patterns.points.test(G)) {
            H = H || "px";
            F.setAttribute.call(this, "left", I[0], H);
            F.setAttribute.call(this, "top", I[1], H);
        } else {
            F.setAttribute.call(this, G, I, H);
        }
    };
    C.getAttribute = function(G) {
        if (this.patterns.points.test(G)) {
            var H = [F.getAttribute.call(this, "left"), F.getAttribute.call(this, "top")];
        } else {
            H = F.getAttribute.call(this, G);
        }
        return H;
    };
    C.doMethod = function(G, K, H) {
        var J = null;
        if (this.patterns.points.test(G)) {
            var I = this.method(this.currentFrame, 0, 100, this.totalFrames) / 100;
            J = E.Bezier.getPosition(this.runtimeAttributes[G], I);
        } else {
            J = F.doMethod.call(this, G, K, H);
        }
        return J;
    };
    C.setRuntimeAttribute = function(P) {
        if (this.patterns.points.test(P)) {
            var H = this.getEl();
            var J = this.attributes;
            var G;
            var L = J["points"]["control"] || [];
            var I;
            var M, O;
            if (L.length > 0 && !(L[0] instanceof Array)) {
                L = [L];
            } else {
                var K = [];
                for (M = 0, O = L.length; M < O; ++M) {
                    K[M] = L[M];
                }
                L = K;
            }
            if (E.Dom.getStyle(H, "position") == "static") {
                E.Dom.setStyle(H, "position", "relative");
            }
            if (D(J["points"]["from"])) {
                E.Dom.setXY(H, J["points"]["from"]);
            } else {
                E.Dom.setXY(H, E.Dom.getXY(H));
            }
            G = this.getAttribute("points");
            if (D(J["points"]["to"])) {
                I = B.call(this, J["points"]["to"], G);
                var N = E.Dom.getXY(this.getEl());
                for (M = 0, O = L.length; M < O; ++M) {
                    L[M] = B.call(this, L[M], G);
                }
            } else {
                if (D(J["points"]["by"])) {
                    I = [G[0] + J["points"]["by"][0], G[1] + J["points"]["by"][1]];
                    for (M = 0, O = L.length; M < O; ++M) {
                        L[M] = [G[0] + L[M][0], G[1] + L[M][1]];
                    }
                }
            }
            this.runtimeAttributes[P] = [G];
            if (L.length > 0) {
                this.runtimeAttributes[P] = this.runtimeAttributes[P].concat(L);
            }
            this.runtimeAttributes[P][this.runtimeAttributes[P].length] = I;
        } else {
            F.setRuntimeAttribute.call(this, P);
        }
    };
    var B = function(G, I) {
        var H = E.Dom.getXY(this.getEl());
        G = [G[0] - H[0] + I[0], G[1] - H[1] + I[1]];
        return G;
    };
    var D = function(G) {
        return (typeof G !== "undefined");
    };
    E.Motion = A;
})();
(function() {
    var D = function(F, E, G, H) {
        if (F) {
            D.superclass.constructor.call(this, F, E, G, H);
        }
    };
    D.NAME = "Scroll";
    var B = YAHOO.util;
    YAHOO.extend(D, B.ColorAnim);
    var C = D.superclass;
    var A = D.prototype;
    A.doMethod = function(E, H, F) {
        var G = null;
        if (E == "scroll") {
            G = [this.method(this.currentFrame, H[0], F[0] - H[0], this.totalFrames), this.method(this.currentFrame, H[1], F[1] - H[1], this.totalFrames)];
        } else {
            G = C.doMethod.call(this, E, H, F);
        }
        return G;
    };
    A.getAttribute = function(E) {
        var G = null;
        var F = this.getEl();
        if (E == "scroll") {
            G = [F.scrollLeft, F.scrollTop];
        } else {
            G = C.getAttribute.call(this, E);
        }
        return G;
    };
    A.setAttribute = function(E, H, G) {
        var F = this.getEl();
        if (E == "scroll") {
            F.scrollLeft = H[0];
            F.scrollTop = H[1];
        } else {
            C.setAttribute.call(this, E, H, G);
        }
    };
    B.Scroll = D;
})();
YAHOO.register("animation", YAHOO.util.Anim, {
    version: "2.8.2r1",
    build: "7"
});
if (!YAHOO.util.DragDropMgr) {
    YAHOO.util.DragDropMgr = function() {
        var A = YAHOO.util.Event,
            B = YAHOO.util.Dom;
        return {
            useShim: false,
            _shimActive: false,
            _shimState: false,
            _debugShim: false,
            _createShim: function() {
                var C = document.createElement("div");
                C.id = "yui-ddm-shim";
                if (document.body.firstChild) {
                    document.body.insertBefore(C, document.body.firstChild);
                } else {
                    document.body.appendChild(C);
                }
                C.style.display = "none";
                C.style.backgroundColor = "red";
                C.style.position = "absolute";
                C.style.zIndex = "99999";
                B.setStyle(C, "opacity", "0");
                this._shim = C;
                A.on(C, "mouseup", this.handleMouseUp, this, true);
                A.on(C, "mousemove", this.handleMouseMove, this, true);
                A.on(window, "scroll", this._sizeShim, this, true);
            },
            _sizeShim: function() {
                if (this._shimActive) {
                    var C = this._shim;
                    C.style.height = B.getDocumentHeight() + "px";
                    C.style.width = B.getDocumentWidth() + "px";
                    C.style.top = "0";
                    C.style.left = "0";
                }
            },
            _activateShim: function() {
                if (this.useShim) {
                    if (!this._shim) {
                        this._createShim();
                    }
                    this._shimActive = true;
                    var C = this._shim,
                        D = "0";
                    if (this._debugShim) {
                        D = ".5";
                    }
                    B.setStyle(C, "opacity", D);
                    this._sizeShim();
                    C.style.display = "block";
                }
            },
            _deactivateShim: function() {
                this._shim.style.display = "none";
                this._shimActive = false;
            },
            _shim: null,
            ids: {},
            handleIds: {},
            dragCurrent: null,
            dragOvers: {},
            deltaX: 0,
            deltaY: 0,
            preventDefault: true,
            stopPropagation: true,
            initialized: false,
            locked: false,
            interactionInfo: null,
            init: function() {
                this.initialized = true;
            },
            POINT: 0,
            INTERSECT: 1,
            STRICT_INTERSECT: 2,
            mode: 0,
            _execOnAll: function(E, D) {
                for (var F in this.ids) {
                    for (var C in this.ids[F]) {
                        var G = this.ids[F][C];
                        if (!this.isTypeOfDD(G)) {
                            continue;
                        }
                        G[E].apply(G, D);
                    }
                }
            },
            _onLoad: function() {
                this.init();
                A.on(document, "mouseup", this.handleMouseUp, this, true);
                A.on(document, "mousemove", this.handleMouseMove, this, true);
                A.on(window, "unload", this._onUnload, this, true);
                A.on(window, "resize", this._onResize, this, true);
            },
            _onResize: function(C) {
                this._execOnAll("resetConstraints", []);
            },
            lock: function() {
                this.locked = true;
            },
            unlock: function() {
                this.locked = false;
            },
            isLocked: function() {
                return this.locked;
            },
            locationCache: {},
            useCache: true,
            clickPixelThresh: 3,
            clickTimeThresh: 1000,
            dragThreshMet: false,
            clickTimeout: null,
            startX: 0,
            startY: 0,
            fromTimeout: false,
            regDragDrop: function(D, C) {
                if (!this.initialized) {
                    this.init();
                }
                if (!this.ids[C]) {
                    this.ids[C] = {};
                }
                this.ids[C][D.id] = D;
            },
            removeDDFromGroup: function(E, C) {
                if (!this.ids[C]) {
                    this.ids[C] = {};
                }
                var D = this.ids[C];
                if (D && D[E.id]) {
                    delete D[E.id];
                }
            },
            _remove: function(E) {
                for (var D in E.groups) {
                    if (D) {
                        var C = this.ids[D];
                        if (C && C[E.id]) {
                            delete C[E.id];
                        }
                    }
                }
                delete this.handleIds[E.id];
            },
            regHandle: function(D, C) {
                if (!this.handleIds[D]) {
                    this.handleIds[D] = {};
                }
                this.handleIds[D][C] = C;
            },
            isDragDrop: function(C) {
                return (this.getDDById(C)) ? true : false;
            },
            getRelated: function(H, D) {
                var G = [];
                for (var F in H.groups) {
                    for (var E in this.ids[F]) {
                        var C = this.ids[F][E];
                        if (!this.isTypeOfDD(C)) {
                            continue;
                        }
                        if (!D || C.isTarget) {
                            G[G.length] = C;
                        }
                    }
                }
                return G;
            },
            isLegalTarget: function(G, F) {
                var D = this.getRelated(G, true);
                for (var E = 0, C = D.length; E < C; ++E) {
                    if (D[E].id == F.id) {
                        return true;
                    }
                }
                return false;
            },
            isTypeOfDD: function(C) {
                return (C && C.__ygDragDrop);
            },
            isHandle: function(D, C) {
                return (this.handleIds[D] && this.handleIds[D][C]);
            },
            getDDById: function(D) {
                for (var C in this.ids) {
                    if (this.ids[C][D]) {
                        return this.ids[C][D];
                    }
                }
                return null;
            },
            handleMouseDown: function(E, D) {
                this.currentTarget = YAHOO.util.Event.getTarget(E);
                this.dragCurrent = D;
                var C = D.getEl();
                this.startX = YAHOO.util.Event.getPageX(E);
                this.startY = YAHOO.util.Event.getPageY(E);
                this.deltaX = this.startX - C.offsetLeft;
                this.deltaY = this.startY - C.offsetTop;
                this.dragThreshMet = false;
                this.clickTimeout = setTimeout(function() {
                    var F = YAHOO.util.DDM;
                    F.startDrag(F.startX, F.startY);
                    F.fromTimeout = true;
                }, this.clickTimeThresh);
            },
            startDrag: function(C, E) {
                if (this.dragCurrent && this.dragCurrent.useShim) {
                    this._shimState = this.useShim;
                    this.useShim = true;
                }
                this._activateShim();
                clearTimeout(this.clickTimeout);
                var D = this.dragCurrent;
                if (D && D.events.b4StartDrag) {
                    D.b4StartDrag(C, E);
                    D.fireEvent("b4StartDragEvent", {
                        x: C,
                        y: E
                    });
                }
                if (D && D.events.startDrag) {
                    D.startDrag(C, E);
                    D.fireEvent("startDragEvent", {
                        x: C,
                        y: E
                    });
                }
                this.dragThreshMet = true;
            },
            handleMouseUp: function(C) {
                if (this.dragCurrent) {
                    clearTimeout(this.clickTimeout);
                    if (this.dragThreshMet) {
                        if (this.fromTimeout) {
                            this.fromTimeout = false;
                            this.handleMouseMove(C);
                        }
                        this.fromTimeout = false;
                        this.fireEvents(C, true);
                    } else {}
                    this.stopDrag(C);
                    this.stopEvent(C);
                }
            },
            stopEvent: function(C) {
                if (this.stopPropagation) {
                    YAHOO.util.Event.stopPropagation(C);
                }
                if (this.preventDefault) {
                    YAHOO.util.Event.preventDefault(C);
                }
            },
            stopDrag: function(E, D) {
                var C = this.dragCurrent;
                if (C && !D) {
                    if (this.dragThreshMet) {
                        if (C.events.b4EndDrag) {
                            C.b4EndDrag(E);
                            C.fireEvent("b4EndDragEvent", {
                                e: E
                            });
                        }
                        if (C.events.endDrag) {
                            C.endDrag(E);
                            C.fireEvent("endDragEvent", {
                                e: E
                            });
                        }
                    }
                    if (C.events.mouseUp) {
                        C.onMouseUp(E);
                        C.fireEvent("mouseUpEvent", {
                            e: E
                        });
                    }
                }
                if (this._shimActive) {
                    this._deactivateShim();
                    if (this.dragCurrent && this.dragCurrent.useShim) {
                        this.useShim = this._shimState;
                        this._shimState = false;
                    }
                }
                this.dragCurrent = null;
                this.dragOvers = {};
            },
            handleMouseMove: function(F) {
                var C = this.dragCurrent;
                if (C) {
                    if (YAHOO.util.Event.isIE && !F.button) {
                        this.stopEvent(F);
                        return this.handleMouseUp(F);
                    } else {
                        if (F.clientX < 0 || F.clientY < 0) {}
                    }
                    if (!this.dragThreshMet) {
                        var E = Math.abs(this.startX - YAHOO.util.Event.getPageX(F));
                        var D = Math.abs(this.startY - YAHOO.util.Event.getPageY(F));
                        if (E > this.clickPixelThresh || D > this.clickPixelThresh) {
                            this.startDrag(this.startX, this.startY);
                        }
                    }
                    if (this.dragThreshMet) {
                        if (C && C.events.b4Drag) {
                            C.b4Drag(F);
                            C.fireEvent("b4DragEvent", {
                                e: F
                            });
                        }
                        if (C && C.events.drag) {
                            C.onDrag(F);
                            C.fireEvent("dragEvent", {
                                e: F
                            });
                        }
                        if (C) {
                            this.fireEvents(F, false);
                        }
                    }
                    this.stopEvent(F);
                }
            },
            fireEvents: function(V, L) {
                var a = this.dragCurrent;
                if (!a || a.isLocked() || a.dragOnly) {
                    return;
                }
                var N = YAHOO.util.Event.getPageX(V),
                    M = YAHOO.util.Event.getPageY(V),
                    P = new YAHOO.util.Point(N, M),
                    K = a.getTargetCoord(P.x, P.y),
                    F = a.getDragEl(),
                    E = ["out", "over", "drop", "enter"],
                    U = new YAHOO.util.Region(K.y, K.x + F.offsetWidth, K.y + F.offsetHeight, K.x),
                    I = [],
                    D = {},
                    Q = [],
                    c = {
                        outEvts: [],
                        overEvts: [],
                        dropEvts: [],
                        enterEvts: []
                    };
                for (var S in this.dragOvers) {
                    var d = this.dragOvers[S];
                    if (!this.isTypeOfDD(d)) {
                        continue;
                    }
                    if (!this.isOverTarget(P, d, this.mode, U)) {
                        c.outEvts.push(d);
                    }
                    I[S] = true;
                    delete this.dragOvers[S];
                }
                for (var R in a.groups) {
                    if ("string" != typeof R) {
                        continue;
                    }
                    for (S in this.ids[R]) {
                        var G = this.ids[R][S];
                        if (!this.isTypeOfDD(G)) {
                            continue;
                        }
                        if (G.isTarget && !G.isLocked() && G != a) {
                            if (this.isOverTarget(P, G, this.mode, U)) {
                                D[R] = true;
                                if (L) {
                                    c.dropEvts.push(G);
                                } else {
                                    if (!I[G.id]) {
                                        c.enterEvts.push(G);
                                    } else {
                                        c.overEvts.push(G);
                                    }
                                    this.dragOvers[G.id] = G;
                                }
                            }
                        }
                    }
                }
                this.interactionInfo = {
                    out: c.outEvts,
                    enter: c.enterEvts,
                    over: c.overEvts,
                    drop: c.dropEvts,
                    point: P,
                    draggedRegion: U,
                    sourceRegion: this.locationCache[a.id],
                    validDrop: L
                };
                for (var C in D) {
                    Q.push(C);
                }
                if (L && !c.dropEvts.length) {
                    this.interactionInfo.validDrop = false;
                    if (a.events.invalidDrop) {
                        a.onInvalidDrop(V);
                        a.fireEvent("invalidDropEvent", {
                            e: V
                        });
                    }
                }
                for (S = 0; S < E.length; S++) {
                    var Y = null;
                    if (c[E[S] + "Evts"]) {
                        Y = c[E[S] + "Evts"];
                    }
                    if (Y && Y.length) {
                        var H = E[S].charAt(0).toUpperCase() + E[S].substr(1),
                            X = "onDrag" + H,
                            J = "b4Drag" + H,
                            O = "drag" + H + "Event",
                            W = "drag" + H;
                        if (this.mode) {
                            if (a.events[J]) {
                                a[J](V, Y, Q);
                                a.fireEvent(J + "Event", {
                                    event: V,
                                    info: Y,
                                    group: Q
                                });
                            }
                            if (a.events[W]) {
                                a[X](V, Y, Q);
                                a.fireEvent(O, {
                                    event: V,
                                    info: Y,
                                    group: Q
                                });
                            }
                        } else {
                            for (var Z = 0, T = Y.length; Z < T; ++Z) {
                                if (a.events[J]) {
                                    a[J](V, Y[Z].id, Q[0]);
                                    a.fireEvent(J + "Event", {
                                        event: V,
                                        info: Y[Z].id,
                                        group: Q[0]
                                    });
                                }
                                if (a.events[W]) {
                                    a[X](V, Y[Z].id, Q[0]);
                                    a.fireEvent(O, {
                                        event: V,
                                        info: Y[Z].id,
                                        group: Q[0]
                                    });
                                }
                            }
                        }
                    }
                }
            },
            getBestMatch: function(E) {
                var G = null;
                var D = E.length;
                if (D == 1) {
                    G = E[0];
                } else {
                    for (var F = 0; F < D; ++F) {
                        var C = E[F];
                        if (this.mode == this.INTERSECT && C.cursorIsOver) {
                            G = C;
                            break;
                        } else {
                            if (!G || !G.overlap || (C.overlap && G.overlap.getArea() < C.overlap.getArea())) {
                                G = C;
                            }
                        }
                    }
                }
                return G;
            },
            refreshCache: function(D) {
                var F = D || this.ids;
                for (var C in F) {
                    if ("string" != typeof C) {
                        continue;
                    }
                    for (var E in this.ids[C]) {
                        var G = this.ids[C][E];
                        if (this.isTypeOfDD(G)) {
                            var H = this.getLocation(G);
                            if (H) {
                                this.locationCache[G.id] = H;
                            } else {
                                delete this.locationCache[G.id];
                            }
                        }
                    }
                }
            },
            verifyEl: function(D) {
                try {
                    if (D) {
                        var C = D.offsetParent;
                        if (C) {
                            return true;
                        }
                    }
                } catch (E) {}
                return false;
            },
            getLocation: function(H) {
                if (!this.isTypeOfDD(H)) {
                    return null;
                }
                var F = H.getEl(),
                    K, E, D, M, L, N, C, J, G;
                try {
                    K = YAHOO.util.Dom.getXY(F);
                } catch (I) {}
                if (!K) {
                    return null;
                }
                E = K[0];
                D = E + F.offsetWidth;
                M = K[1];
                L = M + F.offsetHeight;
                N = M - H.padding[0];
                C = D + H.padding[1];
                J = L + H.padding[2];
                G = E - H.padding[3];
                return new YAHOO.util.Region(N, C, J, G);
            },
            isOverTarget: function(K, C, E, F) {
                var G = this.locationCache[C.id];
                if (!G || !this.useCache) {
                    G = this.getLocation(C);
                    this.locationCache[C.id] = G;
                }
                if (!G) {
                    return false;
                }
                C.cursorIsOver = G.contains(K);
                var J = this.dragCurrent;
                if (!J || (!E && !J.constrainX && !J.constrainY)) {
                    return C.cursorIsOver;
                }
                C.overlap = null;
                if (!F) {
                    var H = J.getTargetCoord(K.x, K.y);
                    var D = J.getDragEl();
                    F = new YAHOO.util.Region(H.y, H.x + D.offsetWidth, H.y + D.offsetHeight, H.x);
                }
                var I = F.intersect(G);
                if (I) {
                    C.overlap = I;
                    return (E) ? true : C.cursorIsOver;
                } else {
                    return false;
                }
            },
            _onUnload: function(D, C) {
                this.unregAll();
            },
            unregAll: function() {
                if (this.dragCurrent) {
                    this.stopDrag();
                    this.dragCurrent = null;
                }
                this._execOnAll("unreg", []);
                this.ids = {};
            },
            elementCache: {},
            getElWrapper: function(D) {
                var C = this.elementCache[D];
                if (!C || !C.el) {
                    C = this.elementCache[D] = new this.ElementWrapper(YAHOO.util.Dom.get(D));
                }
                return C;
            },
            getElement: function(C) {
                return YAHOO.util.Dom.get(C);
            },
            getCss: function(D) {
                var C = YAHOO.util.Dom.get(D);
                return (C) ? C.style : null;
            },
            ElementWrapper: function(C) {
                this.el = C || null;
                this.id = this.el && C.id;
                this.css = this.el && C.style;
            },
            getPosX: function(C) {
                return YAHOO.util.Dom.getX(C);
            },
            getPosY: function(C) {
                return YAHOO.util.Dom.getY(C);
            },
            swapNode: function(E, C) {
                if (E.swapNode) {
                    E.swapNode(C);
                } else {
                    var F = C.parentNode;
                    var D = C.nextSibling;
                    if (D == E) {
                        F.insertBefore(E, C);
                    } else {
                        if (C == E.nextSibling) {
                            F.insertBefore(C, E);
                        } else {
                            E.parentNode.replaceChild(C, E);
                            F.insertBefore(E, D);
                        }
                    }
                }
            },
            getScroll: function() {
                var E, C, F = document.documentElement,
                    D = document.body;
                if (F && (F.scrollTop || F.scrollLeft)) {
                    E = F.scrollTop;
                    C = F.scrollLeft;
                } else {
                    if (D) {
                        E = D.scrollTop;
                        C = D.scrollLeft;
                    } else {}
                }
                return {
                    top: E,
                    left: C
                };
            },
            getStyle: function(D, C) {
                return YAHOO.util.Dom.getStyle(D, C);
            },
            getScrollTop: function() {
                return this.getScroll().top;
            },
            getScrollLeft: function() {
                return this.getScroll().left;
            },
            moveToEl: function(C, E) {
                var D = YAHOO.util.Dom.getXY(E);
                YAHOO.util.Dom.setXY(C, D);
            },
            getClientHeight: function() {
                return YAHOO.util.Dom.getViewportHeight();
            },
            getClientWidth: function() {
                return YAHOO.util.Dom.getViewportWidth();
            },
            numericSort: function(D, C) {
                return (D - C);
            },
            _timeoutCount: 0,
            _addListeners: function() {
                var C = YAHOO.util.DDM;
                if (YAHOO.util.Event && document) {
                    C._onLoad();
                } else {
                    if (C._timeoutCount > 2000) {} else {
                        setTimeout(C._addListeners, 10);
                        if (document && document.body) {
                            C._timeoutCount += 1;
                        }
                    }
                }
            },
            handleWasClicked: function(C, E) {
                if (this.isHandle(E, C.id)) {
                    return true;
                } else {
                    var D = C.parentNode;
                    while (D) {
                        if (this.isHandle(E, D.id)) {
                            return true;
                        } else {
                            D = D.parentNode;
                        }
                    }
                }
                return false;
            }
        };
    }();
    YAHOO.util.DDM = YAHOO.util.DragDropMgr;
    YAHOO.util.DDM._addListeners();
}(function() {
    var A = YAHOO.util.Event;
    var B = YAHOO.util.Dom;
    YAHOO.util.DragDrop = function(E, C, D) {
        if (E) {
            this.init(E, C, D);
        }
    };
    YAHOO.util.DragDrop.prototype = {
        events: null,
        on: function() {
            this.subscribe.apply(this, arguments);
        },
        id: null,
        config: null,
        dragElId: null,
        handleElId: null,
        invalidHandleTypes: null,
        invalidHandleIds: null,
        invalidHandleClasses: null,
        startPageX: 0,
        startPageY: 0,
        groups: null,
        locked: false,
        lock: function() {
            this.locked = true;
        },
        unlock: function() {
            this.locked = false;
        },
        isTarget: true,
        padding: null,
        dragOnly: false,
        useShim: false,
        _domRef: null,
        __ygDragDrop: true,
        constrainX: false,
        constrainY: false,
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
        deltaX: 0,
        deltaY: 0,
        maintainOffset: false,
        xTicks: null,
        yTicks: null,
        primaryButtonOnly: true,
        available: false,
        hasOuterHandles: false,
        cursorIsOver: false,
        overlap: null,
        b4StartDrag: function(C, D) {},
        startDrag: function(C, D) {},
        b4Drag: function(C) {},
        onDrag: function(C) {},
        onDragEnter: function(C, D) {},
        b4DragOver: function(C) {},
        onDragOver: function(C, D) {},
        b4DragOut: function(C) {},
        onDragOut: function(C, D) {},
        b4DragDrop: function(C) {},
        onDragDrop: function(C, D) {},
        onInvalidDrop: function(C) {},
        b4EndDrag: function(C) {},
        endDrag: function(C) {},
        b4MouseDown: function(C) {},
        onMouseDown: function(C) {},
        onMouseUp: function(C) {},
        onAvailable: function() {},
        getEl: function() {
            if (!this._domRef) {
                this._domRef = B.get(this.id);
            }
            return this._domRef;
        },
        getDragEl: function() {
            return B.get(this.dragElId);
        },
        init: function(F, C, D) {
            this.initTarget(F, C, D);
            A.on(this._domRef || this.id, "mousedown", this.handleMouseDown, this, true);
            for (var E in this.events) {
                this.createEvent(E + "Event");
            }
        },
        initTarget: function(E, C, D) {
            this.config = D || {};
            this.events = {};
            this.DDM = YAHOO.util.DDM;
            this.groups = {};
            if (typeof E !== "string") {
                this._domRef = E;
                E = B.generateId(E);
            }
            this.id = E;
            this.addToGroup((C) ? C : "default");
            this.handleElId = E;
            A.onAvailable(E, this.handleOnAvailable, this, true);
            this.setDragElId(E);
            this.invalidHandleTypes = {
                A: "A"
            };
            this.invalidHandleIds = {};
            this.invalidHandleClasses = [];
            this.applyConfig();
        },
        applyConfig: function() {
            this.events = {
                mouseDown: true,
                b4MouseDown: true,
                mouseUp: true,
                b4StartDrag: true,
                startDrag: true,
                b4EndDrag: true,
                endDrag: true,
                drag: true,
                b4Drag: true,
                invalidDrop: true,
                b4DragOut: true,
                dragOut: true,
                dragEnter: true,
                b4DragOver: true,
                dragOver: true,
                b4DragDrop: true,
                dragDrop: true
            };
            if (this.config.events) {
                for (var C in this.config.events) {
                    if (this.config.events[C] === false) {
                        this.events[C] = false;
                    }
                }
            }
            this.padding = this.config.padding || [0, 0, 0, 0];
            this.isTarget = (this.config.isTarget !== false);
            this.maintainOffset = (this.config.maintainOffset);
            this.primaryButtonOnly = (this.config.primaryButtonOnly !== false);
            this.dragOnly = ((this.config.dragOnly === true) ? true : false);
            this.useShim = ((this.config.useShim === true) ? true : false);
        },
        handleOnAvailable: function() {
            this.available = true;
            this.resetConstraints();
            this.onAvailable();
        },
        setPadding: function(E, C, F, D) {
            if (!C && 0 !== C) {
                this.padding = [E, E, E, E];
            } else {
                if (!F && 0 !== F) {
                    this.padding = [E, C, E, C];
                } else {
                    this.padding = [E, C, F, D];
                }
            }
        },
        setInitPosition: function(F, E) {
            var G = this.getEl();
            if (!this.DDM.verifyEl(G)) {
                if (G && G.style && (G.style.display == "none")) {} else {}
                return;
            }
            var D = F || 0;
            var C = E || 0;
            var H = B.getXY(G);
            this.initPageX = H[0] - D;
            this.initPageY = H[1] - C;
            this.lastPageX = H[0];
            this.lastPageY = H[1];
            this.setStartPosition(H);
        },
        setStartPosition: function(D) {
            var C = D || B.getXY(this.getEl());
            this.deltaSetXY = null;
            this.startPageX = C[0];
            this.startPageY = C[1];
        },
        addToGroup: function(C) {
            this.groups[C] = true;
            this.DDM.regDragDrop(this, C);
        },
        removeFromGroup: function(C) {
            if (this.groups[C]) {
                delete this.groups[C];
            }
            this.DDM.removeDDFromGroup(this, C);
        },
        setDragElId: function(C) {
            this.dragElId = C;
        },
        setHandleElId: function(C) {
            if (typeof C !== "string") {
                C = B.generateId(C);
            }
            this.handleElId = C;
            this.DDM.regHandle(this.id, C);
        },
        setOuterHandleElId: function(C) {
            if (typeof C !== "string") {
                C = B.generateId(C);
            }
            A.on(C, "mousedown", this.handleMouseDown, this, true);
            this.setHandleElId(C);
            this.hasOuterHandles = true;
        },
        unreg: function() {
            A.removeListener(this.id, "mousedown", this.handleMouseDown);
            this._domRef = null;
            this.DDM._remove(this);
        },
        isLocked: function() {
            return (this.DDM.isLocked() || this.locked);
        },
        handleMouseDown: function(J, I) {
            var D = J.which || J.button;
            if (this.primaryButtonOnly && D > 1) {
                return;
            }
            if (this.isLocked()) {
                return;
            }
            var C = this.b4MouseDown(J),
                F = true;
            if (this.events.b4MouseDown) {
                F = this.fireEvent("b4MouseDownEvent", J);
            }
            var E = this.onMouseDown(J),
                H = true;
            if (this.events.mouseDown) {
                H = this.fireEvent("mouseDownEvent", J);
            }
            if ((C === false) || (E === false) || (F === false) || (H === false)) {
                return;
            }
            this.DDM.refreshCache(this.groups);
            var G = new YAHOO.util.Point(A.getPageX(J), A.getPageY(J));
            if (!this.hasOuterHandles && !this.DDM.isOverTarget(G, this)) {} else {
                if (this.clickValidator(J)) {
                    this.setStartPosition();
                    this.DDM.handleMouseDown(J, this);
                    this.DDM.stopEvent(J);
                } else {}
            }
        },
        clickValidator: function(D) {
            var C = YAHOO.util.Event.getTarget(D);
            return (this.isValidHandleChild(C) && (this.id == this.handleElId || this.DDM.handleWasClicked(C, this.id)));
        },
        getTargetCoord: function(E, D) {
            var C = E - this.deltaX;
            var F = D - this.deltaY;
            if (this.constrainX) {
                if (C < this.minX) {
                    C = this.minX;
                }
                if (C > this.maxX) {
                    C = this.maxX;
                }
            }
            if (this.constrainY) {
                if (F < this.minY) {
                    F = this.minY;
                }
                if (F > this.maxY) {
                    F = this.maxY;
                }
            }
            C = this.getTick(C, this.xTicks);
            F = this.getTick(F, this.yTicks);
            return {
                x: C,
                y: F
            };
        },
        addInvalidHandleType: function(C) {
            var D = C.toUpperCase();
            this.invalidHandleTypes[D] = D;
        },
        addInvalidHandleId: function(C) {
            if (typeof C !== "string") {
                C = B.generateId(C);
            }
            this.invalidHandleIds[C] = C;
        },
        addInvalidHandleClass: function(C) {
            this.invalidHandleClasses.push(C);
        },
        removeInvalidHandleType: function(C) {
            var D = C.toUpperCase();
            delete this.invalidHandleTypes[D];
        },
        removeInvalidHandleId: function(C) {
            if (typeof C !== "string") {
                C = B.generateId(C);
            }
            delete this.invalidHandleIds[C];
        },
        removeInvalidHandleClass: function(D) {
            for (var E = 0, C = this.invalidHandleClasses.length; E < C; ++E) {
                if (this.invalidHandleClasses[E] == D) {
                    delete this.invalidHandleClasses[E];
                }
            }
        },
        isValidHandleChild: function(F) {
            var E = true;
            var H;
            try {
                H = F.nodeName.toUpperCase();
            } catch (G) {
                H = F.nodeName;
            }
            E = E && !this.invalidHandleTypes[H];
            E = E && !this.invalidHandleIds[F.id];
            for (var D = 0, C = this.invalidHandleClasses.length; E && D < C; ++D) {
                E = !B.hasClass(F, this.invalidHandleClasses[D]);
            }
            return E;
        },
        setXTicks: function(F, C) {
            this.xTicks = [];
            this.xTickSize = C;
            var E = {};
            for (var D = this.initPageX; D >= this.minX; D = D - C) {
                if (!E[D]) {
                    this.xTicks[this.xTicks.length] = D;
                    E[D] = true;
                }
            }
            for (D = this.initPageX; D <= this.maxX; D = D + C) {
                if (!E[D]) {
                    this.xTicks[this.xTicks.length] = D;
                    E[D] = true;
                }
            }
            this.xTicks.sort(this.DDM.numericSort);
        },
        setYTicks: function(F, C) {
            this.yTicks = [];
            this.yTickSize = C;
            var E = {};
            for (var D = this.initPageY; D >= this.minY; D = D - C) {
                if (!E[D]) {
                    this.yTicks[this.yTicks.length] = D;
                    E[D] = true;
                }
            }
            for (D = this.initPageY; D <= this.maxY; D = D + C) {
                if (!E[D]) {
                    this.yTicks[this.yTicks.length] = D;
                    E[D] = true;
                }
            }
            this.yTicks.sort(this.DDM.numericSort);
        },
        setXConstraint: function(E, D, C) {
            this.leftConstraint = parseInt(E, 10);
            this.rightConstraint = parseInt(D, 10);
            this.minX = this.initPageX - this.leftConstraint;
            this.maxX = this.initPageX + this.rightConstraint;
            if (C) {
                this.setXTicks(this.initPageX, C);
            }
            this.constrainX = true;
        },
        clearConstraints: function() {
            this.constrainX = false;
            this.constrainY = false;
            this.clearTicks();
        },
        clearTicks: function() {
            this.xTicks = null;
            this.yTicks = null;
            this.xTickSize = 0;
            this.yTickSize = 0;
        },
        setYConstraint: function(C, E, D) {
            this.topConstraint = parseInt(C, 10);
            this.bottomConstraint = parseInt(E, 10);
            this.minY = this.initPageY - this.topConstraint;
            this.maxY = this.initPageY + this.bottomConstraint;
            if (D) {
                this.setYTicks(this.initPageY, D);
            }
            this.constrainY = true;
        },
        resetConstraints: function() {
            if (this.initPageX || this.initPageX === 0) {
                var D = (this.maintainOffset) ? this.lastPageX - this.initPageX : 0;
                var C = (this.maintainOffset) ? this.lastPageY - this.initPageY : 0;
                this.setInitPosition(D, C);
            } else {
                this.setInitPosition();
            }
            if (this.constrainX) {
                this.setXConstraint(this.leftConstraint, this.rightConstraint, this.xTickSize);
            }
            if (this.constrainY) {
                this.setYConstraint(this.topConstraint, this.bottomConstraint, this.yTickSize);
            }
        },
        getTick: function(I, F) {
            if (!F) {
                return I;
            } else {
                if (F[0] >= I) {
                    return F[0];
                } else {
                    for (var D = 0, C = F.length; D < C; ++D) {
                        var E = D + 1;
                        if (F[E] && F[E] >= I) {
                            var H = I - F[D];
                            var G = F[E] - I;
                            return (G > H) ? F[D] : F[E];
                        }
                    }
                    return F[F.length - 1];
                }
            }
        },
        toString: function() {
            return ("DragDrop " + this.id);
        }
    };
    YAHOO.augment(YAHOO.util.DragDrop, YAHOO.util.EventProvider);
})();
YAHOO.util.DD = function(C, A, B) {
    if (C) {
        this.init(C, A, B);
    }
};
YAHOO.extend(YAHOO.util.DD, YAHOO.util.DragDrop, {
    scroll: true,
    autoOffset: function(C, B) {
        var A = C - this.startPageX;
        var D = B - this.startPageY;
        this.setDelta(A, D);
    },
    setDelta: function(B, A) {
        this.deltaX = B;
        this.deltaY = A;
    },
    setDragElPos: function(C, B) {
        var A = this.getDragEl();
        this.alignElWithMouse(A, C, B);
    },
    alignElWithMouse: function(C, G, F) {
        var E = this.getTargetCoord(G, F);
        if (!this.deltaSetXY) {
            var H = [E.x, E.y];
            YAHOO.util.Dom.setXY(C, H);
            var D = parseInt(YAHOO.util.Dom.getStyle(C, "left"), 10);
            var B = parseInt(YAHOO.util.Dom.getStyle(C, "top"), 10);
            this.deltaSetXY = [D - E.x, B - E.y];
        } else {
            YAHOO.util.Dom.setStyle(C, "left", (E.x + this.deltaSetXY[0]) + "px");
            YAHOO.util.Dom.setStyle(C, "top", (E.y + this.deltaSetXY[1]) + "px");
        }
        this.cachePosition(E.x, E.y);
        var A = this;
        setTimeout(function() {
            A.autoScroll.call(A, E.x, E.y, C.offsetHeight, C.offsetWidth);
        }, 0);
    },
    cachePosition: function(B, A) {
        if (B) {
            this.lastPageX = B;
            this.lastPageY = A;
        } else {
            var C = YAHOO.util.Dom.getXY(this.getEl());
            this.lastPageX = C[0];
            this.lastPageY = C[1];
        }
    },
    autoScroll: function(J, I, E, K) {
        if (this.scroll) {
            var L = this.DDM.getClientHeight();
            var B = this.DDM.getClientWidth();
            var N = this.DDM.getScrollTop();
            var D = this.DDM.getScrollLeft();
            var H = E + I;
            var M = K + J;
            var G = (L + N - I - this.deltaY);
            var F = (B + D - J - this.deltaX);
            var C = 40;
            var A = (document.all) ? 80 : 30;
            if (H > L && G < C) {
                window.scrollTo(D, N + A);
            }
            if (I < N && N > 0 && I - N < C) {
                window.scrollTo(D, N - A);
            }
            if (M > B && F < C) {
                window.scrollTo(D + A, N);
            }
            if (J < D && D > 0 && J - D < C) {
                window.scrollTo(D - A, N);
            }
        }
    },
    applyConfig: function() {
        YAHOO.util.DD.superclass.applyConfig.call(this);
        this.scroll = (this.config.scroll !== false);
    },
    b4MouseDown: function(A) {
        this.setStartPosition();
        this.autoOffset(YAHOO.util.Event.getPageX(A), YAHOO.util.Event.getPageY(A));
    },
    b4Drag: function(A) {
        this.setDragElPos(YAHOO.util.Event.getPageX(A), YAHOO.util.Event.getPageY(A));
    },
    toString: function() {
        return ("DD " + this.id);
    }
});
YAHOO.util.DDProxy = function(C, A, B) {
    if (C) {
        this.init(C, A, B);
        this.initFrame();
    }
};
YAHOO.util.DDProxy.dragElId = "ygddfdiv";
YAHOO.extend(YAHOO.util.DDProxy, YAHOO.util.DD, {
    resizeFrame: true,
    centerFrame: false,
    createFrame: function() {
        var B = this,
            A = document.body;
        if (!A || !A.firstChild) {
            setTimeout(function() {
                B.createFrame();
            }, 50);
            return;
        }
        var F = this.getDragEl(),
            E = YAHOO.util.Dom;
        if (!F) {
            F = document.createElement("div");
            F.id = this.dragElId;
            var D = F.style;
            D.position = "absolute";
            D.visibility = "hidden";
            D.cursor = "move";
            D.border = "2px solid #aaa";
            D.zIndex = 999;
            D.height = "25px";
            D.width = "25px";
            var C = document.createElement("div");
            E.setStyle(C, "height", "100%");
            E.setStyle(C, "width", "100%");
            E.setStyle(C, "background-color", "#ccc");
            E.setStyle(C, "opacity", "0");
            F.appendChild(C);
            A.insertBefore(F, A.firstChild);
        }
    },
    initFrame: function() {
        this.createFrame();
    },
    applyConfig: function() {
        YAHOO.util.DDProxy.superclass.applyConfig.call(this);
        this.resizeFrame = (this.config.resizeFrame !== false);
        this.centerFrame = (this.config.centerFrame);
        this.setDragElId(this.config.dragElId || YAHOO.util.DDProxy.dragElId);
    },
    showFrame: function(E, D) {
        var C = this.getEl();
        var A = this.getDragEl();
        var B = A.style;
        this._resizeProxy();
        if (this.centerFrame) {
            this.setDelta(Math.round(parseInt(B.width, 10) / 2), Math.round(parseInt(B.height, 10) / 2));
        }
        this.setDragElPos(E, D);
        YAHOO.util.Dom.setStyle(A, "visibility", "visible");
    },
    _resizeProxy: function() {
        if (this.resizeFrame) {
            var H = YAHOO.util.Dom;
            var B = this.getEl();
            var C = this.getDragEl();
            var G = parseInt(H.getStyle(C, "borderTopWidth"), 10);
            var I = parseInt(H.getStyle(C, "borderRightWidth"), 10);
            var F = parseInt(H.getStyle(C, "borderBottomWidth"), 10);
            var D = parseInt(H.getStyle(C, "borderLeftWidth"), 10);
            if (isNaN(G)) {
                G = 0;
            }
            if (isNaN(I)) {
                I = 0;
            }
            if (isNaN(F)) {
                F = 0;
            }
            if (isNaN(D)) {
                D = 0;
            }
            var E = Math.max(0, B.offsetWidth - I - D);
            var A = Math.max(0, B.offsetHeight - G - F);
            H.setStyle(C, "width", E + "px");
            H.setStyle(C, "height", A + "px");
        }
    },
    b4MouseDown: function(B) {
        this.setStartPosition();
        var A = YAHOO.util.Event.getPageX(B);
        var C = YAHOO.util.Event.getPageY(B);
        this.autoOffset(A, C);
    },
    b4StartDrag: function(A, B) {
        this.showFrame(A, B);
    },
    b4EndDrag: function(A) {
        YAHOO.util.Dom.setStyle(this.getDragEl(), "visibility", "hidden");
    },
    endDrag: function(D) {
        var C = YAHOO.util.Dom;
        var B = this.getEl();
        var A = this.getDragEl();
        C.setStyle(A, "visibility", "");
        C.setStyle(B, "visibility", "hidden");
        YAHOO.util.DDM.moveToEl(B, A);
        C.setStyle(A, "visibility", "hidden");
        C.setStyle(B, "visibility", "");
    },
    toString: function() {
        return ("DDProxy " + this.id);
    }
});
YAHOO.util.DDTarget = function(C, A, B) {
    if (C) {
        this.initTarget(C, A, B);
    }
};
YAHOO.extend(YAHOO.util.DDTarget, YAHOO.util.DragDrop, {
    toString: function() {
        return ("DDTarget " + this.id);
    }
});
YAHOO.register("dragdrop", YAHOO.util.DragDropMgr, {
    version: "2.8.2r1",
    build: "7"
});
YAHOO.util.Attribute = function(B, A) {
    if (A) {
        this.owner = A;
        this.configure(B, true);
    }
};
YAHOO.util.Attribute.prototype = {
    name: undefined,
    value: null,
    owner: null,
    readOnly: false,
    writeOnce: false,
    _initialConfig: null,
    _written: false,
    method: null,
    setter: null,
    getter: null,
    validator: null,
    getValue: function() {
        var A = this.value;
        if (this.getter) {
            A = this.getter.call(this.owner, this.name, A);
        }
        return A;
    },
    setValue: function(F, B) {
        var E, A = this.owner,
            C = this.name;
        var D = {
            type: C,
            prevValue: this.getValue(),
            newValue: F
        };
        if (this.readOnly || (this.writeOnce && this._written)) {
            return false;
        }
        if (this.validator && !this.validator.call(A, F)) {
            return false;
        }
        if (!B) {
            E = A.fireBeforeChangeEvent(D);
            if (E === false) {
                return false;
            }
        }
        if (this.setter) {
            F = this.setter.call(A, F, this.name);
            if (F === undefined) {}
        }
        if (this.method) {
            this.method.call(A, F, this.name);
        }
        this.value = F;
        this._written = true;
        D.type = C;
        if (!B) {
            this.owner.fireChangeEvent(D);
        }
        return true;
    },
    configure: function(B, C) {
        B = B || {};
        if (C) {
            this._written = false;
        }
        this._initialConfig = this._initialConfig || {};
        for (var A in B) {
            if (B.hasOwnProperty(A)) {
                this[A] = B[A];
                if (C) {
                    this._initialConfig[A] = B[A];
                }
            }
        }
    },
    resetValue: function() {
        return this.setValue(this._initialConfig.value);
    },
    resetConfig: function() {
        this.configure(this._initialConfig, true);
    },
    refresh: function(A) {
        this.setValue(this.value, A);
    }
};
(function() {
    var A = YAHOO.util.Lang;
    YAHOO.util.AttributeProvider = function() {};
    YAHOO.util.AttributeProvider.prototype = {
        _configs: null,
        get: function(C) {
            this._configs = this._configs || {};
            var B = this._configs[C];
            if (!B || !this._configs.hasOwnProperty(C)) {
                return null;
            }
            return B.getValue();
        },
        set: function(D, E, B) {
            this._configs = this._configs || {};
            var C = this._configs[D];
            if (!C) {
                return false;
            }
            return C.setValue(E, B);
        },
        getAttributeKeys: function() {
            this._configs = this._configs;
            var C = [],
                B;
            for (B in this._configs) {
                if (A.hasOwnProperty(this._configs, B) && !A.isUndefined(this._configs[B])) {
                    C[C.length] = B;
                }
            }
            return C;
        },
        setAttributes: function(D, B) {
            for (var C in D) {
                if (A.hasOwnProperty(D, C)) {
                    this.set(C, D[C], B);
                }
            }
        },
        resetValue: function(C, B) {
            this._configs = this._configs || {};
            if (this._configs[C]) {
                this.set(C, this._configs[C]._initialConfig.value, B);
                return true;
            }
            return false;
        },
        refresh: function(E, C) {
            this._configs = this._configs || {};
            var F = this._configs;
            E = ((A.isString(E)) ? [E] : E) || this.getAttributeKeys();
            for (var D = 0, B = E.length; D < B; ++D) {
                if (F.hasOwnProperty(E[D])) {
                    this._configs[E[D]].refresh(C);
                }
            }
        },
        register: function(B, C) {
            this.setAttributeConfig(B, C);
        },
        getAttributeConfig: function(C) {
            this._configs = this._configs || {};
            var B = this._configs[C] || {};
            var D = {};
            for (C in B) {
                if (A.hasOwnProperty(B, C)) {
                    D[C] = B[C];
                }
            }
            return D;
        },
        setAttributeConfig: function(B, C, D) {
            this._configs = this._configs || {};
            C = C || {};
            if (!this._configs[B]) {
                C.name = B;
                this._configs[B] = this.createAttribute(C);
            } else {
                this._configs[B].configure(C, D);
            }
        },
        configureAttribute: function(B, C, D) {
            this.setAttributeConfig(B, C, D);
        },
        resetAttributeConfig: function(B) {
            this._configs = this._configs || {};
            this._configs[B].resetConfig();
        },
        subscribe: function(B, C) {
            this._events = this._events || {};
            if (!(B in this._events)) {
                this._events[B] = this.createEvent(B);
            }
            YAHOO.util.EventProvider.prototype.subscribe.apply(this, arguments);
        },
        on: function() {
            this.subscribe.apply(this, arguments);
        },
        addListener: function() {
            this.subscribe.apply(this, arguments);
        },
        fireBeforeChangeEvent: function(C) {
            var B = "before";
            B += C.type.charAt(0).toUpperCase() + C.type.substr(1) + "Change";
            C.type = B;
            return this.fireEvent(C.type, C);
        },
        fireChangeEvent: function(B) {
            B.type += "Change";
            return this.fireEvent(B.type, B);
        },
        createAttribute: function(B) {
            return new YAHOO.util.Attribute(B, this);
        }
    };
    YAHOO.augment(YAHOO.util.AttributeProvider, YAHOO.util.EventProvider);
})();
(function() {
    var B = YAHOO.util.Dom,
        D = YAHOO.util.AttributeProvider,
        C = {
            mouseenter: true,
            mouseleave: true
        };
    var A = function(E, F) {
        this.init.apply(this, arguments);
    };
    A.DOM_EVENTS = {
        "click": true,
        "dblclick": true,
        "keydown": true,
        "keypress": true,
        "keyup": true,
        "mousedown": true,
        "mousemove": true,
        "mouseout": true,
        "mouseover": true,
        "mouseup": true,
        "mouseenter": true,
        "mouseleave": true,
        "focus": true,
        "blur": true,
        "submit": true,
        "change": true
    };
    A.prototype = {
        DOM_EVENTS: null,
        DEFAULT_HTML_SETTER: function(G, E) {
            var F = this.get("element");
            if (F) {
                F[E] = G;
            }
            return G;
        },
        DEFAULT_HTML_GETTER: function(E) {
            var F = this.get("element"),
                G;
            if (F) {
                G = F[E];
            }
            return G;
        },
        appendChild: function(E) {
            E = E.get ? E.get("element") : E;
            return this.get("element").appendChild(E);
        },
        getElementsByTagName: function(E) {
            return this.get("element").getElementsByTagName(E);
        },
        hasChildNodes: function() {
            return this.get("element").hasChildNodes();
        },
        insertBefore: function(E, F) {
            E = E.get ? E.get("element") : E;
            F = (F && F.get) ? F.get("element") : F;
            return this.get("element").insertBefore(E, F);
        },
        removeChild: function(E) {
            E = E.get ? E.get("element") : E;
            return this.get("element").removeChild(E);
        },
        replaceChild: function(E, F) {
            E = E.get ? E.get("element") : E;
            F = F.get ? F.get("element") : F;
            return this.get("element").replaceChild(E, F);
        },
        initAttributes: function(E) {},
        addListener: function(J, I, K, H) {
            H = H || this;
            var E = YAHOO.util.Event,
                G = this.get("element") || this.get("id"),
                F = this;
            if (C[J] && !E._createMouseDelegate) {
                return false;
            }
            if (!this._events[J]) {
                if (G && this.DOM_EVENTS[J]) {
                    E.on(G, J, function(M, L) {
                        if (M.srcElement && !M.target) {
                            M.target = M.srcElement;
                        }
                        if ((M.toElement && !M.relatedTarget) || (M.fromElement && !M.relatedTarget)) {
                            M.relatedTarget = E.getRelatedTarget(M);
                        }
                        if (!M.currentTarget) {
                            M.currentTarget = G;
                        }
                        F.fireEvent(J, M, L);
                    }, K, H);
                }
                this.createEvent(J, {
                    scope: this
                });
            }
            return YAHOO.util.EventProvider.prototype.subscribe.apply(this, arguments);
        },
        on: function() {
            return this.addListener.apply(this, arguments);
        },
        subscribe: function() {
            return this.addListener.apply(this, arguments);
        },
        removeListener: function(F, E) {
            return this.unsubscribe.apply(this, arguments);
        },
        addClass: function(E) {
            B.addClass(this.get("element"), E);
        },
        getElementsByClassName: function(F, E) {
            return B.getElementsByClassName(F, E, this.get("element"));
        },
        hasClass: function(E) {
            return B.hasClass(this.get("element"), E);
        },
        removeClass: function(E) {
            return B.removeClass(this.get("element"), E);
        },
        replaceClass: function(F, E) {
            return B.replaceClass(this.get("element"), F, E);
        },
        setStyle: function(F, E) {
            return B.setStyle(this.get("element"), F, E);
        },
        getStyle: function(E) {
            return B.getStyle(this.get("element"), E);
        },
        fireQueue: function() {
            var F = this._queue;
            for (var G = 0, E = F.length; G < E; ++G) {
                this[F[G][0]].apply(this, F[G][1]);
            }
        },
        appendTo: function(F, G) {
            F = (F.get) ? F.get("element") : B.get(F);
            this.fireEvent("beforeAppendTo", {
                type: "beforeAppendTo",
                target: F
            });
            G = (G && G.get) ? G.get("element") : B.get(G);
            var E = this.get("element");
            if (!E) {
                return false;
            }
            if (!F) {
                return false;
            }
            if (E.parent != F) {
                if (G) {
                    F.insertBefore(E, G);
                } else {
                    F.appendChild(E);
                }
            }
            this.fireEvent("appendTo", {
                type: "appendTo",
                target: F
            });
            return E;
        },
        get: function(E) {
            var G = this._configs || {},
                F = G.element;
            if (F && !G[E] && !YAHOO.lang.isUndefined(F.value[E])) {
                this._setHTMLAttrConfig(E);
            }
            return D.prototype.get.call(this, E);
        },
        setAttributes: function(K, H) {
            var F = {},
                I = this._configOrder;
            for (var J = 0, E = I.length; J < E; ++J) {
                if (K[I[J]] !== undefined) {
                    F[I[J]] = true;
                    this.set(I[J], K[I[J]], H);
                }
            }
            for (var G in K) {
                if (K.hasOwnProperty(G) && !F[G]) {
                    this.set(G, K[G], H);
                }
            }
        },
        set: function(F, H, E) {
            var G = this.get("element");
            if (!G) {
                this._queue[this._queue.length] = ["set", arguments];
                if (this._configs[F]) {
                    this._configs[F].value = H;
                }
                return;
            }
            if (!this._configs[F] && !YAHOO.lang.isUndefined(G[F])) {
                this._setHTMLAttrConfig(F);
            }
            return D.prototype.set.apply(this, arguments);
        },
        setAttributeConfig: function(E, F, G) {
            this._configOrder.push(E);
            D.prototype.setAttributeConfig.apply(this, arguments);
        },
        createEvent: function(F, E) {
            this._events[F] = true;
            return D.prototype.createEvent.apply(this, arguments);
        },
        init: function(F, E) {
            this._initElement(F, E);
        },
        destroy: function() {
            var E = this.get("element");
            YAHOO.util.Event.purgeElement(E, true);
            this.unsubscribeAll();
            if (E && E.parentNode) {
                E.parentNode.removeChild(E);
            }
            this._queue = [];
            this._events = {};
            this._configs = {};
            this._configOrder = [];
        },
        _initElement: function(G, F) {
            this._queue = this._queue || [];
            this._events = this._events || {};
            this._configs = this._configs || {};
            this._configOrder = [];
            F = F || {};
            F.element = F.element || G || null;
            var I = false;
            var E = A.DOM_EVENTS;
            this.DOM_EVENTS = this.DOM_EVENTS || {};
            for (var H in E) {
                if (E.hasOwnProperty(H)) {
                    this.DOM_EVENTS[H] = E[H];
                }
            }
            if (typeof F.element === "string") {
                this._setHTMLAttrConfig("id", {
                    value: F.element
                });
            }
            if (B.get(F.element)) {
                I = true;
                this._initHTMLElement(F);
                this._initContent(F);
            }
            YAHOO.util.Event.onAvailable(F.element, function() {
                if (!I) {
                    this._initHTMLElement(F);
                }
                this.fireEvent("available", {
                    type: "available",
                    target: B.get(F.element)
                });
            }, this, true);
            YAHOO.util.Event.onContentReady(F.element, function() {
                if (!I) {
                    this._initContent(F);
                }
                this.fireEvent("contentReady", {
                    type: "contentReady",
                    target: B.get(F.element)
                });
            }, this, true);
        },
        _initHTMLElement: function(E) {
            this.setAttributeConfig("element", {
                value: B.get(E.element),
                readOnly: true
            });
        },
        _initContent: function(E) {
            this.initAttributes(E);
            this.setAttributes(E, true);
            this.fireQueue();
        },
        _setHTMLAttrConfig: function(E, G) {
            var F = this.get("element");
            G = G || {};
            G.name = E;
            G.setter = G.setter || this.DEFAULT_HTML_SETTER;
            G.getter = G.getter || this.DEFAULT_HTML_GETTER;
            G.value = G.value || F[E];
            this._configs[E] = new YAHOO.util.Attribute(G, this);
        }
    };
    YAHOO.augment(A, D);
    YAHOO.util.Element = A;
})();
YAHOO.register("element", YAHOO.util.Element, {
    version: "2.8.2r1",
    build: "7"
});
YAHOO.register("utilities", YAHOO, {
    version: "2.8.2r1",
    build: "7"
});;
/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 2.8.2r1
*/
(function() {
    var lang = YAHOO.lang,
        util = YAHOO.util,
        Ev = util.Event;
    util.DataSourceBase = function(oLiveData, oConfigs) {
        if (oLiveData === null || oLiveData === undefined) {
            return;
        }
        this.liveData = oLiveData;
        this._oQueue = {
            interval: null,
            conn: null,
            requests: []
        };
        this.responseSchema = {};
        if (oConfigs && (oConfigs.constructor == Object)) {
            for (var sConfig in oConfigs) {
                if (sConfig) {
                    this[sConfig] = oConfigs[sConfig];
                }
            }
        }
        var maxCacheEntries = this.maxCacheEntries;
        if (!lang.isNumber(maxCacheEntries) || (maxCacheEntries < 0)) {
            maxCacheEntries = 0;
        }
        this._aIntervals = [];
        this.createEvent("cacheRequestEvent");
        this.createEvent("cacheResponseEvent");
        this.createEvent("requestEvent");
        this.createEvent("responseEvent");
        this.createEvent("responseParseEvent");
        this.createEvent("responseCacheEvent");
        this.createEvent("dataErrorEvent");
        this.createEvent("cacheFlushEvent");
        var DS = util.DataSourceBase;
        this._sName = "DataSource instance" + DS._nIndex;
        DS._nIndex++;
    };
    var DS = util.DataSourceBase;
    lang.augmentObject(DS, {
        TYPE_UNKNOWN: -1,
        TYPE_JSARRAY: 0,
        TYPE_JSFUNCTION: 1,
        TYPE_XHR: 2,
        TYPE_JSON: 3,
        TYPE_XML: 4,
        TYPE_TEXT: 5,
        TYPE_HTMLTABLE: 6,
        TYPE_SCRIPTNODE: 7,
        TYPE_LOCAL: 8,
        ERROR_DATAINVALID: "Invalid data",
        ERROR_DATANULL: "Null data",
        _nIndex: 0,
        _nTransactionId: 0,
        _getLocationValue: function(field, context) {
            var locator = field.locator || field.key || field,
                xmldoc = context.ownerDocument || context,
                result, res, value = null;
            try {
                if (!lang.isUndefined(xmldoc.evaluate)) {
                    result = xmldoc.evaluate(locator, context, xmldoc.createNSResolver(!context.ownerDocument ? context.documentElement : context.ownerDocument.documentElement), 0, null);
                    while (res = result.iterateNext()) {
                        value = res.textContent;
                    }
                } else {
                    xmldoc.setProperty("SelectionLanguage", "XPath");
                    result = context.selectNodes(locator)[0];
                    value = result.value || result.text || null;
                }
                return value;
            } catch (e) {}
        },
        issueCallback: function(callback, params, error, scope) {
            if (lang.isFunction(callback)) {
                callback.apply(scope, params);
            } else {
                if (lang.isObject(callback)) {
                    scope = callback.scope || scope || window;
                    var callbackFunc = callback.success;
                    if (error) {
                        callbackFunc = callback.failure;
                    }
                    if (callbackFunc) {
                        callbackFunc.apply(scope, params.concat([callback.argument]));
                    }
                }
            }
        },
        parseString: function(oData) {
            if (!lang.isValue(oData)) {
                return null;
            }
            var string = oData + "";
            if (lang.isString(string)) {
                return string;
            } else {
                return null;
            }
        },
        parseNumber: function(oData) {
            if (!lang.isValue(oData) || (oData === "")) {
                return null;
            }
            var number = oData * 1;
            if (lang.isNumber(number)) {
                return number;
            } else {
                return null;
            }
        },
        convertNumber: function(oData) {
            return DS.parseNumber(oData);
        },
        parseDate: function(oData) {
            var date = null;
            if (!(oData instanceof Date)) {
                date = new Date(oData);
            } else {
                return oData;
            }
            if (date instanceof Date) {
                return date;
            } else {
                return null;
            }
        },
        convertDate: function(oData) {
            return DS.parseDate(oData);
        }
    });
    DS.Parser = {
        string: DS.parseString,
        number: DS.parseNumber,
        date: DS.parseDate
    };
    DS.prototype = {
        _sName: null,
        _aCache: null,
        _oQueue: null,
        _aIntervals: null,
        maxCacheEntries: 0,
        liveData: null,
        dataType: DS.TYPE_UNKNOWN,
        responseType: DS.TYPE_UNKNOWN,
        responseSchema: null,
        useXPath: false,
        toString: function() {
            return this._sName;
        },
        getCachedResponse: function(oRequest, oCallback, oCaller) {
            var aCache = this._aCache;
            if (this.maxCacheEntries > 0) {
                if (!aCache) {
                    this._aCache = [];
                } else {
                    var nCacheLength = aCache.length;
                    if (nCacheLength > 0) {
                        var oResponse = null;
                        this.fireEvent("cacheRequestEvent", {
                            request: oRequest,
                            callback: oCallback,
                            caller: oCaller
                        });
                        for (var i = nCacheLength - 1; i >= 0; i--) {
                            var oCacheElem = aCache[i];
                            if (this.isCacheHit(oRequest, oCacheElem.request)) {
                                oResponse = oCacheElem.response;
                                this.fireEvent("cacheResponseEvent", {
                                    request: oRequest,
                                    response: oResponse,
                                    callback: oCallback,
                                    caller: oCaller
                                });
                                if (i < nCacheLength - 1) {
                                    aCache.splice(i, 1);
                                    this.addToCache(oRequest, oResponse);
                                }
                                oResponse.cached = true;
                                break;
                            }
                        }
                        return oResponse;
                    }
                }
            } else {
                if (aCache) {
                    this._aCache = null;
                }
            }
            return null;
        },
        isCacheHit: function(oRequest, oCachedRequest) {
            return (oRequest === oCachedRequest);
        },
        addToCache: function(oRequest, oResponse) {
            var aCache = this._aCache;
            if (!aCache) {
                return;
            }
            while (aCache.length >= this.maxCacheEntries) {
                aCache.shift();
            }
            var oCacheElem = {
                request: oRequest,
                response: oResponse
            };
            aCache[aCache.length] = oCacheElem;
            this.fireEvent("responseCacheEvent", {
                request: oRequest,
                response: oResponse
            });
        },
        flushCache: function() {
            if (this._aCache) {
                this._aCache = [];
                this.fireEvent("cacheFlushEvent");
            }
        },
        setInterval: function(nMsec, oRequest, oCallback, oCaller) {
            if (lang.isNumber(nMsec) && (nMsec >= 0)) {
                var oSelf = this;
                var nId = setInterval(function() {
                    oSelf.makeConnection(oRequest, oCallback, oCaller);
                }, nMsec);
                this._aIntervals.push(nId);
                return nId;
            } else {}
        },
        clearInterval: function(nId) {
            var tracker = this._aIntervals || [];
            for (var i = tracker.length - 1; i > -1; i--) {
                if (tracker[i] === nId) {
                    tracker.splice(i, 1);
                    clearInterval(nId);
                }
            }
        },
        clearAllIntervals: function() {
            var tracker = this._aIntervals || [];
            for (var i = tracker.length - 1; i > -1; i--) {
                clearInterval(tracker[i]);
            }
            tracker = [];
        },
        sendRequest: function(oRequest, oCallback, oCaller) {
            var oCachedResponse = this.getCachedResponse(oRequest, oCallback, oCaller);
            if (oCachedResponse) {
                DS.issueCallback(oCallback, [oRequest, oCachedResponse], false, oCaller);
                return null;
            }
            return this.makeConnection(oRequest, oCallback, oCaller);
        },
        makeConnection: function(oRequest, oCallback, oCaller) {
            var tId = DS._nTransactionId++;
            this.fireEvent("requestEvent", {
                tId: tId,
                request: oRequest,
                callback: oCallback,
                caller: oCaller
            });
            var oRawResponse = this.liveData;
            this.handleResponse(oRequest, oRawResponse, oCallback, oCaller, tId);
            return tId;
        },
        handleResponse: function(oRequest, oRawResponse, oCallback, oCaller, tId) {
            this.fireEvent("responseEvent", {
                tId: tId,
                request: oRequest,
                response: oRawResponse,
                callback: oCallback,
                caller: oCaller
            });
            var xhr = (this.dataType == DS.TYPE_XHR) ? true : false;
            var oParsedResponse = null;
            var oFullResponse = oRawResponse;
            if (this.responseType === DS.TYPE_UNKNOWN) {
                var ctype = (oRawResponse && oRawResponse.getResponseHeader) ? oRawResponse.getResponseHeader["Content-Type"] : null;
                if (ctype) {
                    if (ctype.indexOf("text/xml") > -1) {
                        this.responseType = DS.TYPE_XML;
                    } else {
                        if (ctype.indexOf("application/json") > -1) {
                            this.responseType = DS.TYPE_JSON;
                        } else {
                            if (ctype.indexOf("text/plain") > -1) {
                                this.responseType = DS.TYPE_TEXT;
                            }
                        }
                    }
                } else {
                    if (YAHOO.lang.isArray(oRawResponse)) {
                        this.responseType = DS.TYPE_JSARRAY;
                    } else {
                        if (oRawResponse && oRawResponse.nodeType && (oRawResponse.nodeType === 9 || oRawResponse.nodeType === 1 || oRawResponse.nodeType === 11)) {
                            this.responseType = DS.TYPE_XML;
                        } else {
                            if (oRawResponse && oRawResponse.nodeName && (oRawResponse.nodeName.toLowerCase() == "table")) {
                                this.responseType = DS.TYPE_HTMLTABLE;
                            } else {
                                if (YAHOO.lang.isObject(oRawResponse)) {
                                    this.responseType = DS.TYPE_JSON;
                                } else {
                                    if (YAHOO.lang.isString(oRawResponse)) {
                                        this.responseType = DS.TYPE_TEXT;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            switch (this.responseType) {
                case DS.TYPE_JSARRAY:
                    if (xhr && oRawResponse && oRawResponse.responseText) {
                        oFullResponse = oRawResponse.responseText;
                    }
                    try {
                        if (lang.isString(oFullResponse)) {
                            var parseArgs = [oFullResponse].concat(this.parseJSONArgs);
                            if (lang.JSON) {
                                oFullResponse = lang.JSON.parse.apply(lang.JSON, parseArgs);
                            } else {
                                if (window.JSON && JSON.parse) {
                                    oFullResponse = JSON.parse.apply(JSON, parseArgs);
                                } else {
                                    if (oFullResponse.parseJSON) {
                                        oFullResponse = oFullResponse.parseJSON.apply(oFullResponse, parseArgs.slice(1));
                                    } else {
                                        while (oFullResponse.length > 0 && (oFullResponse.charAt(0) != "{") && (oFullResponse.charAt(0) != "[")) {
                                            oFullResponse = oFullResponse.substring(1, oFullResponse.length);
                                        }
                                        if (oFullResponse.length > 0) {
                                            var arrayEnd = Math.max(oFullResponse.lastIndexOf("]"), oFullResponse.lastIndexOf("}"));
                                            oFullResponse = oFullResponse.substring(0, arrayEnd + 1);
                                            oFullResponse = eval("(" + oFullResponse + ")");
                                        }
                                    }
                                }
                            }
                        }
                    } catch (e1) {}
                    oFullResponse = this.doBeforeParseData(oRequest, oFullResponse, oCallback);
                    oParsedResponse = this.parseArrayData(oRequest, oFullResponse);
                    break;
                case DS.TYPE_JSON:
                    if (xhr && oRawResponse && oRawResponse.responseText) {
                        oFullResponse = oRawResponse.responseText;
                    }
                    try {
                        if (lang.isString(oFullResponse)) {
                            var parseArgs = [oFullResponse].concat(this.parseJSONArgs);
                            if (lang.JSON) {
                                oFullResponse = lang.JSON.parse.apply(lang.JSON, parseArgs);
                            } else {
                                if (window.JSON && JSON.parse) {
                                    oFullResponse = JSON.parse.apply(JSON, parseArgs);
                                } else {
                                    if (oFullResponse.parseJSON) {
                                        oFullResponse = oFullResponse.parseJSON.apply(oFullResponse, parseArgs.slice(1));
                                    } else {
                                        while (oFullResponse.length > 0 && (oFullResponse.charAt(0) != "{") && (oFullResponse.charAt(0) != "[")) {
                                            oFullResponse = oFullResponse.substring(1, oFullResponse.length);
                                        }
                                        if (oFullResponse.length > 0) {
                                            var objEnd = Math.max(oFullResponse.lastIndexOf("]"), oFullResponse.lastIndexOf("}"));
                                            oFullResponse = oFullResponse.substring(0, objEnd + 1);
                                            oFullResponse = eval("(" + oFullResponse + ")");
                                        }
                                    }
                                }
                            }
                        }
                    } catch (e) {}
                    oFullResponse = this.doBeforeParseData(oRequest, oFullResponse, oCallback);
                    oParsedResponse = this.parseJSONData(oRequest, oFullResponse);
                    break;
                case DS.TYPE_HTMLTABLE:
                    if (xhr && oRawResponse.responseText) {
                        var el = document.createElement("div");
                        el.innerHTML = oRawResponse.responseText;
                        oFullResponse = el.getElementsByTagName("table")[0];
                    }
                    oFullResponse = this.doBeforeParseData(oRequest, oFullResponse, oCallback);
                    oParsedResponse = this.parseHTMLTableData(oRequest, oFullResponse);
                    break;
                case DS.TYPE_XML:
                    if (xhr && oRawResponse.responseXML) {
                        oFullResponse = oRawResponse.responseXML;
                    }
                    oFullResponse = this.doBeforeParseData(oRequest, oFullResponse, oCallback);
                    oParsedResponse = this.parseXMLData(oRequest, oFullResponse);
                    break;
                case DS.TYPE_TEXT:
                    if (xhr && lang.isString(oRawResponse.responseText)) {
                        oFullResponse = oRawResponse.responseText;
                    }
                    oFullResponse = this.doBeforeParseData(oRequest, oFullResponse, oCallback);
                    oParsedResponse = this.parseTextData(oRequest, oFullResponse);
                    break;
                default:
                    oFullResponse = this.doBeforeParseData(oRequest, oFullResponse, oCallback);
                    oParsedResponse = this.parseData(oRequest, oFullResponse);
                    break;
            }
            oParsedResponse = oParsedResponse || {};
            if (!oParsedResponse.results) {
                oParsedResponse.results = [];
            }
            if (!oParsedResponse.meta) {
                oParsedResponse.meta = {};
            }
            if (!oParsedResponse.error) {
                oParsedResponse = this.doBeforeCallback(oRequest, oFullResponse, oParsedResponse, oCallback);
                this.fireEvent("responseParseEvent", {
                    request: oRequest,
                    response: oParsedResponse,
                    callback: oCallback,
                    caller: oCaller
                });
                this.addToCache(oRequest, oParsedResponse);
            } else {
                oParsedResponse.error = true;
                this.fireEvent("dataErrorEvent", {
                    request: oRequest,
                    response: oRawResponse,
                    callback: oCallback,
                    caller: oCaller,
                    message: DS.ERROR_DATANULL
                });
            }
            oParsedResponse.tId = tId;
            DS.issueCallback(oCallback, [oRequest, oParsedResponse], oParsedResponse.error, oCaller);
        },
        doBeforeParseData: function(oRequest, oFullResponse, oCallback) {
            return oFullResponse;
        },
        doBeforeCallback: function(oRequest, oFullResponse, oParsedResponse, oCallback) {
            return oParsedResponse;
        },
        parseData: function(oRequest, oFullResponse) {
            if (lang.isValue(oFullResponse)) {
                var oParsedResponse = {
                    results: oFullResponse,
                    meta: {}
                };
                return oParsedResponse;
            }
            return null;
        },
        parseArrayData: function(oRequest, oFullResponse) {
            if (lang.isArray(oFullResponse)) {
                var results = [],
                    i, j, rec, field, data;
                if (lang.isArray(this.responseSchema.fields)) {
                    var fields = this.responseSchema.fields;
                    for (i = fields.length - 1; i >= 0; --i) {
                        if (typeof fields[i] !== "object") {
                            fields[i] = {
                                key: fields[i]
                            };
                        }
                    }
                    var parsers = {},
                        p;
                    for (i = fields.length - 1; i >= 0; --i) {
                        p = (typeof fields[i].parser === "function" ? fields[i].parser : DS.Parser[fields[i].parser + ""]) || fields[i].converter;
                        if (p) {
                            parsers[fields[i].key] = p;
                        }
                    }
                    var arrType = lang.isArray(oFullResponse[0]);
                    for (i = oFullResponse.length - 1; i > -1; i--) {
                        var oResult = {};
                        rec = oFullResponse[i];
                        if (typeof rec === "object") {
                            for (j = fields.length - 1; j > -1; j--) {
                                field = fields[j];
                                data = arrType ? rec[j] : rec[field.key];
                                if (parsers[field.key]) {
                                    data = parsers[field.key].call(this, data);
                                }
                                if (data === undefined) {
                                    data = null;
                                }
                                oResult[field.key] = data;
                            }
                        } else {
                            if (lang.isString(rec)) {
                                for (j = fields.length - 1; j > -1; j--) {
                                    field = fields[j];
                                    data = rec;
                                    if (parsers[field.key]) {
                                        data = parsers[field.key].call(this, data);
                                    }
                                    if (data === undefined) {
                                        data = null;
                                    }
                                    oResult[field.key] = data;
                                }
                            }
                        }
                        results[i] = oResult;
                    }
                } else {
                    results = oFullResponse;
                }
                var oParsedResponse = {
                    results: results
                };
                return oParsedResponse;
            }
            return null;
        },
        parseTextData: function(oRequest, oFullResponse) {
            if (lang.isString(oFullResponse)) {
                if (lang.isString(this.responseSchema.recordDelim) && lang.isString(this.responseSchema.fieldDelim)) {
                    var oParsedResponse = {
                        results: []
                    };
                    var recDelim = this.responseSchema.recordDelim;
                    var fieldDelim = this.responseSchema.fieldDelim;
                    if (oFullResponse.length > 0) {
                        var newLength = oFullResponse.length - recDelim.length;
                        if (oFullResponse.substr(newLength) == recDelim) {
                            oFullResponse = oFullResponse.substr(0, newLength);
                        }
                        if (oFullResponse.length > 0) {
                            var recordsarray = oFullResponse.split(recDelim);
                            for (var i = 0, len = recordsarray.length, recIdx = 0; i < len; ++i) {
                                var bError = false,
                                    sRecord = recordsarray[i];
                                if (lang.isString(sRecord) && (sRecord.length > 0)) {
                                    var fielddataarray = recordsarray[i].split(fieldDelim);
                                    var oResult = {};
                                    if (lang.isArray(this.responseSchema.fields)) {
                                        var fields = this.responseSchema.fields;
                                        for (var j = fields.length - 1; j > -1; j--) {
                                            try {
                                                var data = fielddataarray[j];
                                                if (lang.isString(data)) {
                                                    if (data.charAt(0) == '"') {
                                                        data = data.substr(1);
                                                    }
                                                    if (data.charAt(data.length - 1) == '"') {
                                                        data = data.substr(0, data.length - 1);
                                                    }
                                                    var field = fields[j];
                                                    var key = (lang.isValue(field.key)) ? field.key : field;
                                                    if (!field.parser && field.converter) {
                                                        field.parser = field.converter;
                                                    }
                                                    var parser = (typeof field.parser === "function") ? field.parser : DS.Parser[field.parser + ""];
                                                    if (parser) {
                                                        data = parser.call(this, data);
                                                    }
                                                    if (data === undefined) {
                                                        data = null;
                                                    }
                                                    oResult[key] = data;
                                                } else {
                                                    bError = true;
                                                }
                                            } catch (e) {
                                                bError = true;
                                            }
                                        }
                                    } else {
                                        oResult = fielddataarray;
                                    }
                                    if (!bError) {
                                        oParsedResponse.results[recIdx++] = oResult;
                                    }
                                }
                            }
                        }
                    }
                    return oParsedResponse;
                }
            }
            return null;
        },
        parseXMLResult: function(result) {
            var oResult = {},
                schema = this.responseSchema;
            try {
                for (var m = schema.fields.length - 1; m >= 0; m--) {
                    var field = schema.fields[m];
                    var key = (lang.isValue(field.key)) ? field.key : field;
                    var data = null;
                    if (this.useXPath) {
                        data = YAHOO.util.DataSource._getLocationValue(field, result);
                    } else {
                        var xmlAttr = result.attributes.getNamedItem(key);
                        if (xmlAttr) {
                            data = xmlAttr.value;
                        } else {
                            var xmlNode = result.getElementsByTagName(key);
                            if (xmlNode && xmlNode.item(0)) {
                                var item = xmlNode.item(0);
                                data = (item) ? ((item.text) ? item.text : (item.textContent) ? item.textContent : null) : null;
                                if (!data) {
                                    var datapieces = [];
                                    for (var j = 0, len = item.childNodes.length; j < len; j++) {
                                        if (item.childNodes[j].nodeValue) {
                                            datapieces[datapieces.length] = item.childNodes[j].nodeValue;
                                        }
                                    }
                                    if (datapieces.length > 0) {
                                        data = datapieces.join("");
                                    }
                                }
                            }
                        }
                    }
                    if (data === null) {
                        data = "";
                    }
                    if (!field.parser && field.converter) {
                        field.parser = field.converter;
                    }
                    var parser = (typeof field.parser === "function") ? field.parser : DS.Parser[field.parser + ""];
                    if (parser) {
                        data = parser.call(this, data);
                    }
                    if (data === undefined) {
                        data = null;
                    }
                    oResult[key] = data;
                }
            } catch (e) {}
            return oResult;
        },
        parseXMLData: function(oRequest, oFullResponse) {
            var bError = false,
                schema = this.responseSchema,
                oParsedResponse = {
                    meta: {}
                },
                xmlList = null,
                metaNode = schema.metaNode,
                metaLocators = schema.metaFields || {},
                i, k, loc, v;
            try {
                if (this.useXPath) {
                    for (k in metaLocators) {
                        oParsedResponse.meta[k] = YAHOO.util.DataSource._getLocationValue(metaLocators[k], oFullResponse);
                    }
                } else {
                    metaNode = metaNode ? oFullResponse.getElementsByTagName(metaNode)[0] : oFullResponse;
                    if (metaNode) {
                        for (k in metaLocators) {
                            if (lang.hasOwnProperty(metaLocators, k)) {
                                loc = metaLocators[k];
                                v = metaNode.getElementsByTagName(loc)[0];
                                if (v) {
                                    v = v.firstChild.nodeValue;
                                } else {
                                    v = metaNode.attributes.getNamedItem(loc);
                                    if (v) {
                                        v = v.value;
                                    }
                                }
                                if (lang.isValue(v)) {
                                    oParsedResponse.meta[k] = v;
                                }
                            }
                        }
                    }
                }
                xmlList = (schema.resultNode) ? oFullResponse.getElementsByTagName(schema.resultNode) : null;
            } catch (e) {}
            if (!xmlList || !lang.isArray(schema.fields)) {
                bError = true;
            } else {
                oParsedResponse.results = [];
                for (i = xmlList.length - 1; i >= 0; --i) {
                    var oResult = this.parseXMLResult(xmlList.item(i));
                    oParsedResponse.results[i] = oResult;
                }
            }
            if (bError) {
                oParsedResponse.error = true;
            } else {}
            return oParsedResponse;
        },
        parseJSONData: function(oRequest, oFullResponse) {
            var oParsedResponse = {
                results: [],
                meta: {}
            };
            if (lang.isObject(oFullResponse) && this.responseSchema.resultsList) {
                var schema = this.responseSchema,
                    fields = schema.fields,
                    resultsList = oFullResponse,
                    results = [],
                    metaFields = schema.metaFields || {},
                    fieldParsers = [],
                    fieldPaths = [],
                    simpleFields = [],
                    bError = false,
                    i, len, j, v, key, parser, path;
                var buildPath = function(needle) {
                    var path = null,
                        keys = [],
                        i = 0;
                    if (needle) {
                        needle = needle.replace(/\[(['"])(.*?)\1\]/g, function(x, $1, $2) {
                            keys[i] = $2;
                            return ".@" + (i++);
                        }).replace(/\[(\d+)\]/g, function(x, $1) {
                            keys[i] = parseInt($1, 10) | 0;
                            return ".@" + (i++);
                        }).replace(/^\./, "");
                        if (!/[^\w\.\$@]/.test(needle)) {
                            path = needle.split(".");
                            for (i = path.length - 1; i >= 0; --i) {
                                if (path[i].charAt(0) === "@") {
                                    path[i] = keys[parseInt(path[i].substr(1), 10)];
                                }
                            }
                        } else {}
                    }
                    return path;
                };
                var walkPath = function(path, origin) {
                    var v = origin,
                        i = 0,
                        len = path.length;
                    for (; i < len && v; ++i) {
                        v = v[path[i]];
                    }
                    return v;
                };
                path = buildPath(schema.resultsList);
                if (path) {
                    resultsList = walkPath(path, oFullResponse);
                    if (resultsList === undefined) {
                        bError = true;
                    }
                } else {
                    bError = true;
                }
                if (!resultsList) {
                    resultsList = [];
                }
                if (!lang.isArray(resultsList)) {
                    resultsList = [resultsList];
                }
                if (!bError) {
                    if (schema.fields) {
                        var field;
                        for (i = 0, len = fields.length; i < len; i++) {
                            field = fields[i];
                            key = field.key || field;
                            parser = ((typeof field.parser === "function") ? field.parser : DS.Parser[field.parser + ""]) || field.converter;
                            path = buildPath(key);
                            if (parser) {
                                fieldParsers[fieldParsers.length] = {
                                    key: key,
                                    parser: parser
                                };
                            }
                            if (path) {
                                if (path.length > 1) {
                                    fieldPaths[fieldPaths.length] = {
                                        key: key,
                                        path: path
                                    };
                                } else {
                                    simpleFields[simpleFields.length] = {
                                        key: key,
                                        path: path[0]
                                    };
                                }
                            } else {}
                        }
                        for (i = resultsList.length - 1; i >= 0; --i) {
                            var r = resultsList[i],
                                rec = {};
                            if (r) {
                                for (j = simpleFields.length - 1; j >= 0; --j) {
                                    rec[simpleFields[j].key] = (r[simpleFields[j].path] !== undefined) ? r[simpleFields[j].path] : r[j];
                                }
                                for (j = fieldPaths.length - 1; j >= 0; --j) {
                                    rec[fieldPaths[j].key] = walkPath(fieldPaths[j].path, r);
                                }
                                for (j = fieldParsers.length - 1; j >= 0; --j) {
                                    var p = fieldParsers[j].key;
                                    rec[p] = fieldParsers[j].parser(rec[p]);
                                    if (rec[p] === undefined) {
                                        rec[p] = null;
                                    }
                                }
                            }
                            results[i] = rec;
                        }
                    } else {
                        results = resultsList;
                    }
                    for (key in metaFields) {
                        if (lang.hasOwnProperty(metaFields, key)) {
                            path = buildPath(metaFields[key]);
                            if (path) {
                                v = walkPath(path, oFullResponse);
                                oParsedResponse.meta[key] = v;
                            }
                        }
                    }
                } else {
                    oParsedResponse.error = true;
                }
                oParsedResponse.results = results;
            } else {
                oParsedResponse.error = true;
            }
            return oParsedResponse;
        },
        parseHTMLTableData: function(oRequest, oFullResponse) {
            var bError = false;
            var elTable = oFullResponse;
            var fields = this.responseSchema.fields;
            var oParsedResponse = {
                results: []
            };
            if (lang.isArray(fields)) {
                for (var i = 0; i < elTable.tBodies.length; i++) {
                    var elTbody = elTable.tBodies[i];
                    for (var j = elTbody.rows.length - 1; j > -1; j--) {
                        var elRow = elTbody.rows[j];
                        var oResult = {};
                        for (var k = fields.length - 1; k > -1; k--) {
                            var field = fields[k];
                            var key = (lang.isValue(field.key)) ? field.key : field;
                            var data = elRow.cells[k].innerHTML;
                            if (!field.parser && field.converter) {
                                field.parser = field.converter;
                            }
                            var parser = (typeof field.parser === "function") ? field.parser : DS.Parser[field.parser + ""];
                            if (parser) {
                                data = parser.call(this, data);
                            }
                            if (data === undefined) {
                                data = null;
                            }
                            oResult[key] = data;
                        }
                        oParsedResponse.results[j] = oResult;
                    }
                }
            } else {
                bError = true;
            }
            if (bError) {
                oParsedResponse.error = true;
            } else {}
            return oParsedResponse;
        }
    };
    lang.augmentProto(DS, util.EventProvider);
    util.LocalDataSource = function(oLiveData, oConfigs) {
        this.dataType = DS.TYPE_LOCAL;
        if (oLiveData) {
            if (YAHOO.lang.isArray(oLiveData)) {
                this.responseType = DS.TYPE_JSARRAY;
            } else {
                if (oLiveData.nodeType && oLiveData.nodeType == 9) {
                    this.responseType = DS.TYPE_XML;
                } else {
                    if (oLiveData.nodeName && (oLiveData.nodeName.toLowerCase() == "table")) {
                        this.responseType = DS.TYPE_HTMLTABLE;
                        oLiveData = oLiveData.cloneNode(true);
                    } else {
                        if (YAHOO.lang.isString(oLiveData)) {
                            this.responseType = DS.TYPE_TEXT;
                        } else {
                            if (YAHOO.lang.isObject(oLiveData)) {
                                this.responseType = DS.TYPE_JSON;
                            }
                        }
                    }
                }
            }
        } else {
            oLiveData = [];
            this.responseType = DS.TYPE_JSARRAY;
        }
        util.LocalDataSource.superclass.constructor.call(this, oLiveData, oConfigs);
    };
    lang.extend(util.LocalDataSource, DS);
    lang.augmentObject(util.LocalDataSource, DS);
    util.FunctionDataSource = function(oLiveData, oConfigs) {
        this.dataType = DS.TYPE_JSFUNCTION;
        oLiveData = oLiveData || function() {};
        util.FunctionDataSource.superclass.constructor.call(this, oLiveData, oConfigs);
    };
    lang.extend(util.FunctionDataSource, DS, {
        scope: null,
        makeConnection: function(oRequest, oCallback, oCaller) {
            var tId = DS._nTransactionId++;
            this.fireEvent("requestEvent", {
                tId: tId,
                request: oRequest,
                callback: oCallback,
                caller: oCaller
            });
            var oRawResponse = (this.scope) ? this.liveData.call(this.scope, oRequest, this) : this.liveData(oRequest);
            if (this.responseType === DS.TYPE_UNKNOWN) {
                if (YAHOO.lang.isArray(oRawResponse)) {
                    this.responseType = DS.TYPE_JSARRAY;
                } else {
                    if (oRawResponse && oRawResponse.nodeType && oRawResponse.nodeType == 9) {
                        this.responseType = DS.TYPE_XML;
                    } else {
                        if (oRawResponse && oRawResponse.nodeName && (oRawResponse.nodeName.toLowerCase() == "table")) {
                            this.responseType = DS.TYPE_HTMLTABLE;
                        } else {
                            if (YAHOO.lang.isObject(oRawResponse)) {
                                this.responseType = DS.TYPE_JSON;
                            } else {
                                if (YAHOO.lang.isString(oRawResponse)) {
                                    this.responseType = DS.TYPE_TEXT;
                                }
                            }
                        }
                    }
                }
            }
            this.handleResponse(oRequest, oRawResponse, oCallback, oCaller, tId);
            return tId;
        }
    });
    lang.augmentObject(util.FunctionDataSource, DS);
    util.ScriptNodeDataSource = function(oLiveData, oConfigs) {
        this.dataType = DS.TYPE_SCRIPTNODE;
        oLiveData = oLiveData || "";
        util.ScriptNodeDataSource.superclass.constructor.call(this, oLiveData, oConfigs);
    };
    lang.extend(util.ScriptNodeDataSource, DS, {
        getUtility: util.Get,
        asyncMode: "allowAll",
        scriptCallbackParam: "callback",
        generateRequestCallback: function(id) {
            return "&" + this.scriptCallbackParam + "=YAHOO.util.ScriptNodeDataSource.callbacks[" + id + "]";
        },
        doBeforeGetScriptNode: function(sUri) {
            return sUri;
        },
        makeConnection: function(oRequest, oCallback, oCaller) {
            var tId = DS._nTransactionId++;
            this.fireEvent("requestEvent", {
                tId: tId,
                request: oRequest,
                callback: oCallback,
                caller: oCaller
            });
            if (util.ScriptNodeDataSource._nPending === 0) {
                util.ScriptNodeDataSource.callbacks = [];
                util.ScriptNodeDataSource._nId = 0;
            }
            var id = util.ScriptNodeDataSource._nId;
            util.ScriptNodeDataSource._nId++;
            var oSelf = this;
            util.ScriptNodeDataSource.callbacks[id] = function(oRawResponse) {
                if ((oSelf.asyncMode !== "ignoreStaleResponses") || (id === util.ScriptNodeDataSource.callbacks.length - 1)) {
                    if (oSelf.responseType === DS.TYPE_UNKNOWN) {
                        if (YAHOO.lang.isArray(oRawResponse)) {
                            oSelf.responseType = DS.TYPE_JSARRAY;
                        } else {
                            if (oRawResponse.nodeType && oRawResponse.nodeType == 9) {
                                oSelf.responseType = DS.TYPE_XML;
                            } else {
                                if (oRawResponse.nodeName && (oRawResponse.nodeName.toLowerCase() == "table")) {
                                    oSelf.responseType = DS.TYPE_HTMLTABLE;
                                } else {
                                    if (YAHOO.lang.isObject(oRawResponse)) {
                                        oSelf.responseType = DS.TYPE_JSON;
                                    } else {
                                        if (YAHOO.lang.isString(oRawResponse)) {
                                            oSelf.responseType = DS.TYPE_TEXT;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    oSelf.handleResponse(oRequest, oRawResponse, oCallback, oCaller, tId);
                } else {}
                delete util.ScriptNodeDataSource.callbacks[id];
            };
            util.ScriptNodeDataSource._nPending++;
            var sUri = this.liveData + oRequest + this.generateRequestCallback(id);
            sUri = this.doBeforeGetScriptNode(sUri);
            this.getUtility.script(sUri, {
                autopurge: true,
                onsuccess: util.ScriptNodeDataSource._bumpPendingDown,
                onfail: util.ScriptNodeDataSource._bumpPendingDown
            });
            return tId;
        }
    });
    lang.augmentObject(util.ScriptNodeDataSource, DS);
    lang.augmentObject(util.ScriptNodeDataSource, {
        _nId: 0,
        _nPending: 0,
        callbacks: []
    });
    util.XHRDataSource = function(oLiveData, oConfigs) {
        this.dataType = DS.TYPE_XHR;
        this.connMgr = this.connMgr || util.Connect;
        oLiveData = oLiveData || "";
        util.XHRDataSource.superclass.constructor.call(this, oLiveData, oConfigs);
    };
    lang.extend(util.XHRDataSource, DS, {
        connMgr: null,
        connXhrMode: "allowAll",
        connMethodPost: false,
        connTimeout: 0,
        makeConnection: function(oRequest, oCallback, oCaller) {
            var oRawResponse = null;
            var tId = DS._nTransactionId++;
            this.fireEvent("requestEvent", {
                tId: tId,
                request: oRequest,
                callback: oCallback,
                caller: oCaller
            });
            var oSelf = this;
            var oConnMgr = this.connMgr;
            var oQueue = this._oQueue;
            var _xhrSuccess = function(oResponse) {
                if (oResponse && (this.connXhrMode == "ignoreStaleResponses") && (oResponse.tId != oQueue.conn.tId)) {
                    return null;
                } else {
                    if (!oResponse) {
                        this.fireEvent("dataErrorEvent", {
                            request: oRequest,
                            response: null,
                            callback: oCallback,
                            caller: oCaller,
                            message: DS.ERROR_DATANULL
                        });
                        DS.issueCallback(oCallback, [oRequest, {
                            error: true
                        }], true, oCaller);
                        return null;
                    } else {
                        if (this.responseType === DS.TYPE_UNKNOWN) {
                            var ctype = (oResponse.getResponseHeader) ? oResponse.getResponseHeader["Content-Type"] : null;
                            if (ctype) {
                                if (ctype.indexOf("text/xml") > -1) {
                                    this.responseType = DS.TYPE_XML;
                                } else {
                                    if (ctype.indexOf("application/json") > -1) {
                                        this.responseType = DS.TYPE_JSON;
                                    } else {
                                        if (ctype.indexOf("text/plain") > -1) {
                                            this.responseType = DS.TYPE_TEXT;
                                        }
                                    }
                                }
                            }
                        }
                        this.handleResponse(oRequest, oResponse, oCallback, oCaller, tId);
                    }
                }
            };
            var _xhrFailure = function(oResponse) {
                this.fireEvent("dataErrorEvent", {
                    request: oRequest,
                    response: oResponse,
                    callback: oCallback,
                    caller: oCaller,
                    message: DS.ERROR_DATAINVALID
                });
                if (lang.isString(this.liveData) && lang.isString(oRequest) && (this.liveData.lastIndexOf("?") !== this.liveData.length - 1) && (oRequest.indexOf("?") !== 0)) {}
                oResponse = oResponse || {};
                oResponse.error = true;
                DS.issueCallback(oCallback, [oRequest, oResponse], true, oCaller);
                return null;
            };
            var _xhrCallback = {
                success: _xhrSuccess,
                failure: _xhrFailure,
                scope: this
            };
            if (lang.isNumber(this.connTimeout)) {
                _xhrCallback.timeout = this.connTimeout;
            }
            if (this.connXhrMode == "cancelStaleRequests") {
                if (oQueue.conn) {
                    if (oConnMgr.abort) {
                        oConnMgr.abort(oQueue.conn);
                        oQueue.conn = null;
                    } else {}
                }
            }
            if (oConnMgr && oConnMgr.asyncRequest) {
                var sLiveData = this.liveData;
                var isPost = this.connMethodPost;
                var sMethod = (isPost) ? "POST" : "GET";
                var sUri = (isPost || !lang.isValue(oRequest)) ? sLiveData : sLiveData + oRequest;
                var sRequest = (isPost) ? oRequest : null;
                if (this.connXhrMode != "queueRequests") {
                    oQueue.conn = oConnMgr.asyncRequest(sMethod, sUri, _xhrCallback, sRequest);
                } else {
                    if (oQueue.conn) {
                        var allRequests = oQueue.requests;
                        allRequests.push({
                            request: oRequest,
                            callback: _xhrCallback
                        });
                        if (!oQueue.interval) {
                            oQueue.interval = setInterval(function() {
                                if (oConnMgr.isCallInProgress(oQueue.conn)) {
                                    return;
                                } else {
                                    if (allRequests.length > 0) {
                                        sUri = (isPost || !lang.isValue(allRequests[0].request)) ? sLiveData : sLiveData + allRequests[0].request;
                                        sRequest = (isPost) ? allRequests[0].request : null;
                                        oQueue.conn = oConnMgr.asyncRequest(sMethod, sUri, allRequests[0].callback, sRequest);
                                        allRequests.shift();
                                    } else {
                                        clearInterval(oQueue.interval);
                                        oQueue.interval = null;
                                    }
                                }
                            }, 50);
                        }
                    } else {
                        oQueue.conn = oConnMgr.asyncRequest(sMethod, sUri, _xhrCallback, sRequest);
                    }
                }
            } else {
                DS.issueCallback(oCallback, [oRequest, {
                    error: true
                }], true, oCaller);
            }
            return tId;
        }
    });
    lang.augmentObject(util.XHRDataSource, DS);
    util.DataSource = function(oLiveData, oConfigs) {
        oConfigs = oConfigs || {};
        var dataType = oConfigs.dataType;
        if (dataType) {
            if (dataType == DS.TYPE_LOCAL) {
                lang.augmentObject(util.DataSource, util.LocalDataSource);
                return new util.LocalDataSource(oLiveData, oConfigs);
            } else {
                if (dataType == DS.TYPE_XHR) {
                    lang.augmentObject(util.DataSource, util.XHRDataSource);
                    return new util.XHRDataSource(oLiveData, oConfigs);
                } else {
                    if (dataType == DS.TYPE_SCRIPTNODE) {
                        lang.augmentObject(util.DataSource, util.ScriptNodeDataSource);
                        return new util.ScriptNodeDataSource(oLiveData, oConfigs);
                    } else {
                        if (dataType == DS.TYPE_JSFUNCTION) {
                            lang.augmentObject(util.DataSource, util.FunctionDataSource);
                            return new util.FunctionDataSource(oLiveData, oConfigs);
                        }
                    }
                }
            }
        }
        if (YAHOO.lang.isString(oLiveData)) {
            lang.augmentObject(util.DataSource, util.XHRDataSource);
            return new util.XHRDataSource(oLiveData, oConfigs);
        } else {
            if (YAHOO.lang.isFunction(oLiveData)) {
                lang.augmentObject(util.DataSource, util.FunctionDataSource);
                return new util.FunctionDataSource(oLiveData, oConfigs);
            } else {
                lang.augmentObject(util.DataSource, util.LocalDataSource);
                return new util.LocalDataSource(oLiveData, oConfigs);
            }
        }
    };
    lang.augmentObject(util.DataSource, DS);
})();
YAHOO.util.Number = {
    format: function(B, E) {
        if (!isFinite(+B)) {
            return "";
        }
        B = !isFinite(+B) ? 0 : +B;
        E = YAHOO.lang.merge(YAHOO.util.Number.format.defaults, (E || {}));
        var C = B < 0,
            F = Math.abs(B),
            A = E.decimalPlaces,
            I = E.thousandsSeparator,
            H, G, D;
        if (A < 0) {
            H = F - (F % 1) + "";
            D = H.length + A;
            if (D > 0) {
                H = Number("." + H).toFixed(D).slice(2) + new Array(H.length - D + 1).join("0");
            } else {
                H = "0";
            }
        } else {
            H = F < 1 && F >= 0.5 && !A ? "1" : F.toFixed(A);
        }
        if (F > 1000) {
            G = H.split(/\D/);
            D = G[0].length % 3 || 3;
            G[0] = G[0].slice(0, D) + G[0].slice(D).replace(/(\d{3})/g, I + "$1");
            H = G.join(E.decimalSeparator);
        }
        H = E.prefix + H + E.suffix;
        return C ? E.negativeFormat.replace(/#/, H) : H;
    }
};
YAHOO.util.Number.format.defaults = {
    decimalSeparator: ".",
    decimalPlaces: null,
    thousandsSeparator: "",
    prefix: "",
    suffix: "",
    negativeFormat: "-#"
};
(function() {
    var A = function(C, E, D) {
        if (typeof D === "undefined") {
            D = 10;
        }
        for (; parseInt(C, 10) < D && D > 1; D /= 10) {
            C = E.toString() + C;
        }
        return C.toString();
    };
    var B = {
        formats: {
            a: function(D, C) {
                return C.a[D.getDay()];
            },
            A: function(D, C) {
                return C.A[D.getDay()];
            },
            b: function(D, C) {
                return C.b[D.getMonth()];
            },
            B: function(D, C) {
                return C.B[D.getMonth()];
            },
            C: function(C) {
                return A(parseInt(C.getFullYear() / 100, 10), 0);
            },
            d: ["getDate", "0"],
            e: ["getDate", " "],
            g: function(C) {
                return A(parseInt(B.formats.G(C) % 100, 10), 0);
            },
            G: function(E) {
                var F = E.getFullYear();
                var D = parseInt(B.formats.V(E), 10);
                var C = parseInt(B.formats.W(E), 10);
                if (C > D) {
                    F++;
                } else {
                    if (C === 0 && D >= 52) {
                        F--;
                    }
                }
                return F;
            },
            H: ["getHours", "0"],
            I: function(D) {
                var C = D.getHours() % 12;
                return A(C === 0 ? 12 : C, 0);
            },
            j: function(G) {
                var F = new Date("" + G.getFullYear() + "/1/1 GMT");
                var D = new Date("" + G.getFullYear() + "/" + (G.getMonth() + 1) + "/" + G.getDate() + " GMT");
                var C = D - F;
                var E = parseInt(C / 60000 / 60 / 24, 10) + 1;
                return A(E, 0, 100);
            },
            k: ["getHours", " "],
            l: function(D) {
                var C = D.getHours() % 12;
                return A(C === 0 ? 12 : C, " ");
            },
            m: function(C) {
                return A(C.getMonth() + 1, 0);
            },
            M: ["getMinutes", "0"],
            p: function(D, C) {
                return C.p[D.getHours() >= 12 ? 1 : 0];
            },
            P: function(D, C) {
                return C.P[D.getHours() >= 12 ? 1 : 0];
            },
            s: function(D, C) {
                return parseInt(D.getTime() / 1000, 10);
            },
            S: ["getSeconds", "0"],
            u: function(C) {
                var D = C.getDay();
                return D === 0 ? 7 : D;
            },
            U: function(F) {
                var C = parseInt(B.formats.j(F), 10);
                var E = 6 - F.getDay();
                var D = parseInt((C + E) / 7, 10);
                return A(D, 0);
            },
            V: function(F) {
                var E = parseInt(B.formats.W(F), 10);
                var C = (new Date("" + F.getFullYear() + "/1/1")).getDay();
                var D = E + (C > 4 || C <= 1 ? 0 : 1);
                if (D === 53 && (new Date("" + F.getFullYear() + "/12/31")).getDay() < 4) {
                    D = 1;
                } else {
                    if (D === 0) {
                        D = B.formats.V(new Date("" + (F.getFullYear() - 1) + "/12/31"));
                    }
                }
                return A(D, 0);
            },
            w: "getDay",
            W: function(F) {
                var C = parseInt(B.formats.j(F), 10);
                var E = 7 - B.formats.u(F);
                var D = parseInt((C + E) / 7, 10);
                return A(D, 0, 10);
            },
            y: function(C) {
                return A(C.getFullYear() % 100, 0);
            },
            Y: "getFullYear",
            z: function(E) {
                var D = E.getTimezoneOffset();
                var C = A(parseInt(Math.abs(D / 60), 10), 0);
                var F = A(Math.abs(D % 60), 0);
                return (D > 0 ? "-" : "+") + C + F;
            },
            Z: function(C) {
                var D = C.toString().replace(/^.*:\d\d( GMT[+-]\d+)? \(?([A-Za-z ]+)\)?\d*$/, "$2").replace(/[a-z ]/g, "");
                if (D.length > 4) {
                    D = B.formats.z(C);
                }
                return D;
            },
            "%": function(C) {
                return "%";
            }
        },
        aggregates: {
            c: "locale",
            D: "%m/%d/%y",
            F: "%Y-%m-%d",
            h: "%b",
            n: "\n",
            r: "locale",
            R: "%H:%M",
            t: "\t",
            T: "%H:%M:%S",
            x: "locale",
            X: "locale"
        },
        format: function(G, F, D) {
            F = F || {};
            if (!(G instanceof Date)) {
                return YAHOO.lang.isValue(G) ? G : "";
            }
            var H = F.format || "%m/%d/%Y";
            if (H === "YYYY/MM/DD") {
                H = "%Y/%m/%d";
            } else {
                if (H === "DD/MM/YYYY") {
                    H = "%d/%m/%Y";
                } else {
                    if (H === "MM/DD/YYYY") {
                        H = "%m/%d/%Y";
                    }
                }
            }
            D = D || "en";
            if (!(D in YAHOO.util.DateLocale)) {
                if (D.replace(/-[a-zA-Z]+$/, "") in YAHOO.util.DateLocale) {
                    D = D.replace(/-[a-zA-Z]+$/, "");
                } else {
                    D = "en";
                }
            }
            var J = YAHOO.util.DateLocale[D];
            var C = function(L, K) {
                var M = B.aggregates[K];
                return (M === "locale" ? J[K] : M);
            };
            var E = function(L, K) {
                var M = B.formats[K];
                if (typeof M === "string") {
                    return G[M]();
                } else {
                    if (typeof M === "function") {
                        return M.call(G, G, J);
                    } else {
                        if (typeof M === "object" && typeof M[0] === "string") {
                            return A(G[M[0]](), M[1]);
                        } else {
                            return K;
                        }
                    }
                }
            };
            while (H.match(/%[cDFhnrRtTxX]/)) {
                H = H.replace(/%([cDFhnrRtTxX])/g, C);
            }
            var I = H.replace(/%([aAbBCdegGHIjklmMpPsSuUVwWyYzZ%])/g, E);
            C = E = undefined;
            return I;
        }
    };
    YAHOO.namespace("YAHOO.util");
    YAHOO.util.Date = B;
    YAHOO.util.DateLocale = {
        a: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        A: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        b: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        B: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        c: "%a %d %b %Y %T %Z",
        p: ["AM", "PM"],
        P: ["am", "pm"],
        r: "%I:%M:%S %p",
        x: "%d/%m/%y",
        X: "%T"
    };
    YAHOO.util.DateLocale["en"] = YAHOO.lang.merge(YAHOO.util.DateLocale, {});
    YAHOO.util.DateLocale["en-US"] = YAHOO.lang.merge(YAHOO.util.DateLocale["en"], {
        c: "%a %d %b %Y %I:%M:%S %p %Z",
        x: "%m/%d/%Y",
        X: "%I:%M:%S %p"
    });
    YAHOO.util.DateLocale["en-GB"] = YAHOO.lang.merge(YAHOO.util.DateLocale["en"], {
        r: "%l:%M:%S %P %Z"
    });
    YAHOO.util.DateLocale["en-AU"] = YAHOO.lang.merge(YAHOO.util.DateLocale["en"]);
})();
YAHOO.register("datasource", YAHOO.util.DataSource, {
    version: "2.8.2r1",
    build: "7"
});;
/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 2.8.2r1
*/
YAHOO.widget.DS_JSArray = YAHOO.util.LocalDataSource;
YAHOO.widget.DS_JSFunction = YAHOO.util.FunctionDataSource;
YAHOO.widget.DS_XHR = function(B, A, D) {
    var C = new YAHOO.util.XHRDataSource(B, D);
    C._aDeprecatedSchema = A;
    return C;
};
YAHOO.widget.DS_ScriptNode = function(B, A, D) {
    var C = new YAHOO.util.ScriptNodeDataSource(B, D);
    C._aDeprecatedSchema = A;
    return C;
};
YAHOO.widget.DS_XHR.TYPE_JSON = YAHOO.util.DataSourceBase.TYPE_JSON;
YAHOO.widget.DS_XHR.TYPE_XML = YAHOO.util.DataSourceBase.TYPE_XML;
YAHOO.widget.DS_XHR.TYPE_FLAT = YAHOO.util.DataSourceBase.TYPE_TEXT;
YAHOO.widget.AutoComplete = function(G, B, J, C) {
    if (G && B && J) {
        if (J && YAHOO.lang.isFunction(J.sendRequest)) {
            this.dataSource = J;
        } else {
            return;
        }
        this.key = 0;
        var D = J.responseSchema;
        if (J._aDeprecatedSchema) {
            var K = J._aDeprecatedSchema;
            if (YAHOO.lang.isArray(K)) {
                if ((J.responseType === YAHOO.util.DataSourceBase.TYPE_JSON) || (J.responseType === YAHOO.util.DataSourceBase.TYPE_UNKNOWN)) {
                    D.resultsList = K[0];
                    this.key = K[1];
                    D.fields = (K.length < 3) ? null : K.slice(1);
                } else {
                    if (J.responseType === YAHOO.util.DataSourceBase.TYPE_XML) {
                        D.resultNode = K[0];
                        this.key = K[1];
                        D.fields = K.slice(1);
                    } else {
                        if (J.responseType === YAHOO.util.DataSourceBase.TYPE_TEXT) {
                            D.recordDelim = K[0];
                            D.fieldDelim = K[1];
                        }
                    }
                }
                J.responseSchema = D;
            }
        }
        if (YAHOO.util.Dom.inDocument(G)) {
            if (YAHOO.lang.isString(G)) {
                this._sName = "instance" + YAHOO.widget.AutoComplete._nIndex + " " + G;
                this._elTextbox = document.getElementById(G);
            } else {
                this._sName = (G.id) ? "instance" + YAHOO.widget.AutoComplete._nIndex + " " + G.id : "instance" + YAHOO.widget.AutoComplete._nIndex;
                this._elTextbox = G;
            }
            YAHOO.util.Dom.addClass(this._elTextbox, "yui-ac-input");
        } else {
            return;
        }
        if (YAHOO.util.Dom.inDocument(B)) {
            if (YAHOO.lang.isString(B)) {
                this._elContainer = document.getElementById(B);
            } else {
                this._elContainer = B;
            }
            if (this._elContainer.style.display == "none") {}
            var E = this._elContainer.parentNode;
            var A = E.tagName.toLowerCase();
            if (A == "div") {
                YAHOO.util.Dom.addClass(E, "yui-ac");
            } else {}
        } else {
            return;
        }
        if (this.dataSource.dataType === YAHOO.util.DataSourceBase.TYPE_LOCAL) {
            this.applyLocalFilter = true;
        }
        if (C && (C.constructor == Object)) {
            for (var I in C) {
                if (I) {
                    this[I] = C[I];
                }
            }
        }
        this._initContainerEl();
        this._initProps();
        this._initListEl();
        this._initContainerHelperEls();
        var H = this;
        var F = this._elTextbox;
        YAHOO.util.Event.addListener(F, "keyup", H._onTextboxKeyUp, H);
        YAHOO.util.Event.addListener(F, "keydown", H._onTextboxKeyDown, H);
        YAHOO.util.Event.addListener(F, "focus", H._onTextboxFocus, H);
        YAHOO.util.Event.addListener(F, "blur", H._onTextboxBlur, H);
        YAHOO.util.Event.addListener(B, "mouseover", H._onContainerMouseover, H);
        YAHOO.util.Event.addListener(B, "mouseout", H._onContainerMouseout, H);
        YAHOO.util.Event.addListener(B, "click", H._onContainerClick, H);
        YAHOO.util.Event.addListener(B, "scroll", H._onContainerScroll, H);
        YAHOO.util.Event.addListener(B, "resize", H._onContainerResize, H);
        YAHOO.util.Event.addListener(F, "keypress", H._onTextboxKeyPress, H);
        YAHOO.util.Event.addListener(window, "unload", H._onWindowUnload, H);
        this.textboxFocusEvent = new YAHOO.util.CustomEvent("textboxFocus", this);
        this.textboxKeyEvent = new YAHOO.util.CustomEvent("textboxKey", this);
        this.dataRequestEvent = new YAHOO.util.CustomEvent("dataRequest", this);
        this.dataReturnEvent = new YAHOO.util.CustomEvent("dataReturn", this);
        this.dataErrorEvent = new YAHOO.util.CustomEvent("dataError", this);
        this.containerPopulateEvent = new YAHOO.util.CustomEvent("containerPopulate", this);
        this.containerExpandEvent = new YAHOO.util.CustomEvent("containerExpand", this);
        this.typeAheadEvent = new YAHOO.util.CustomEvent("typeAhead", this);
        this.itemMouseOverEvent = new YAHOO.util.CustomEvent("itemMouseOver", this);
        this.itemMouseOutEvent = new YAHOO.util.CustomEvent("itemMouseOut", this);
        this.itemArrowToEvent = new YAHOO.util.CustomEvent("itemArrowTo", this);
        this.itemArrowFromEvent = new YAHOO.util.CustomEvent("itemArrowFrom", this);
        this.itemSelectEvent = new YAHOO.util.CustomEvent("itemSelect", this);
        this.unmatchedItemSelectEvent = new YAHOO.util.CustomEvent("unmatchedItemSelect", this);
        this.selectionEnforceEvent = new YAHOO.util.CustomEvent("selectionEnforce", this);
        this.containerCollapseEvent = new YAHOO.util.CustomEvent("containerCollapse", this);
        this.textboxBlurEvent = new YAHOO.util.CustomEvent("textboxBlur", this);
        this.textboxChangeEvent = new YAHOO.util.CustomEvent("textboxChange", this);
        F.setAttribute("autocomplete", "off");
        YAHOO.widget.AutoComplete._nIndex++;
    } else {}
};
YAHOO.widget.AutoComplete.prototype.dataSource = null;
YAHOO.widget.AutoComplete.prototype.applyLocalFilter = null;
YAHOO.widget.AutoComplete.prototype.queryMatchCase = false;
YAHOO.widget.AutoComplete.prototype.queryMatchContains = false;
YAHOO.widget.AutoComplete.prototype.queryMatchSubset = false;
YAHOO.widget.AutoComplete.prototype.minQueryLength = 1;
YAHOO.widget.AutoComplete.prototype.maxResultsDisplayed = 10;
YAHOO.widget.AutoComplete.prototype.queryDelay = 0.2;
YAHOO.widget.AutoComplete.prototype.typeAheadDelay = 0.5;
YAHOO.widget.AutoComplete.prototype.queryInterval = 500;
YAHOO.widget.AutoComplete.prototype.highlightClassName = "yui-ac-highlight";
YAHOO.widget.AutoComplete.prototype.prehighlightClassName = null;
YAHOO.widget.AutoComplete.prototype.delimChar = null;
YAHOO.widget.AutoComplete.prototype.autoHighlight = true;
YAHOO.widget.AutoComplete.prototype.typeAhead = false;
YAHOO.widget.AutoComplete.prototype.animHoriz = false;
YAHOO.widget.AutoComplete.prototype.animVert = true;
YAHOO.widget.AutoComplete.prototype.animSpeed = 0.3;
YAHOO.widget.AutoComplete.prototype.forceSelection = false;
YAHOO.widget.AutoComplete.prototype.allowBrowserAutocomplete = true;
YAHOO.widget.AutoComplete.prototype.alwaysShowContainer = false;
YAHOO.widget.AutoComplete.prototype.useIFrame = false;
YAHOO.widget.AutoComplete.prototype.useShadow = false;
YAHOO.widget.AutoComplete.prototype.suppressInputUpdate = false;
YAHOO.widget.AutoComplete.prototype.resultTypeList = true;
YAHOO.widget.AutoComplete.prototype.queryQuestionMark = true;
YAHOO.widget.AutoComplete.prototype.autoSnapContainer = true;
YAHOO.widget.AutoComplete.prototype.toString = function() {
    return "AutoComplete " + this._sName;
};
YAHOO.widget.AutoComplete.prototype.getInputEl = function() {
    return this._elTextbox;
};
YAHOO.widget.AutoComplete.prototype.getContainerEl = function() {
    return this._elContainer;
};
YAHOO.widget.AutoComplete.prototype.isFocused = function() {
    return this._bFocused;
};
YAHOO.widget.AutoComplete.prototype.isContainerOpen = function() {
    return this._bContainerOpen;
};
YAHOO.widget.AutoComplete.prototype.getListEl = function() {
    return this._elList;
};
YAHOO.widget.AutoComplete.prototype.getListItemMatch = function(A) {
    if (A._sResultMatch) {
        return A._sResultMatch;
    } else {
        return null;
    }
};
YAHOO.widget.AutoComplete.prototype.getListItemData = function(A) {
    if (A._oResultData) {
        return A._oResultData;
    } else {
        return null;
    }
};
YAHOO.widget.AutoComplete.prototype.getListItemIndex = function(A) {
    if (YAHOO.lang.isNumber(A._nItemIndex)) {
        return A._nItemIndex;
    } else {
        return null;
    }
};
YAHOO.widget.AutoComplete.prototype.setHeader = function(B) {
    if (this._elHeader) {
        var A = this._elHeader;
        if (B) {
            A.innerHTML = B;
            A.style.display = "";
        } else {
            A.innerHTML = "";
            A.style.display = "none";
        }
    }
};
YAHOO.widget.AutoComplete.prototype.setFooter = function(B) {
    if (this._elFooter) {
        var A = this._elFooter;
        if (B) {
            A.innerHTML = B;
            A.style.display = "";
        } else {
            A.innerHTML = "";
            A.style.display = "none";
        }
    }
};
YAHOO.widget.AutoComplete.prototype.setBody = function(A) {
    if (this._elBody) {
        var B = this._elBody;
        YAHOO.util.Event.purgeElement(B, true);
        if (A) {
            B.innerHTML = A;
            B.style.display = "";
        } else {
            B.innerHTML = "";
            B.style.display = "none";
        }
        this._elList = null;
    }
};
YAHOO.widget.AutoComplete.prototype.generateRequest = function(B) {
    var A = this.dataSource.dataType;
    if (A === YAHOO.util.DataSourceBase.TYPE_XHR) {
        if (!this.dataSource.connMethodPost) {
            B = (this.queryQuestionMark ? "?" : "") + (this.dataSource.scriptQueryParam || "query") + "=" + B + (this.dataSource.scriptQueryAppend ? ("&" + this.dataSource.scriptQueryAppend) : "");
        } else {
            B = (this.dataSource.scriptQueryParam || "query") + "=" + B + (this.dataSource.scriptQueryAppend ? ("&" + this.dataSource.scriptQueryAppend) : "");
        }
    } else {
        if (A === YAHOO.util.DataSourceBase.TYPE_SCRIPTNODE) {
            B = "&" + (this.dataSource.scriptQueryParam || "query") + "=" + B + (this.dataSource.scriptQueryAppend ? ("&" + this.dataSource.scriptQueryAppend) : "");
        }
    }
    return B;
};
YAHOO.widget.AutoComplete.prototype.sendQuery = function(B) {
    this._bFocused = true;
    var A = (this.delimChar) ? this._elTextbox.value + B : B;
    this._sendQuery(A);
};
YAHOO.widget.AutoComplete.prototype.snapContainer = function() {
    var A = this._elTextbox,
        B = YAHOO.util.Dom.getXY(A);
    B[1] += YAHOO.util.Dom.get(A).offsetHeight + 2;
    YAHOO.util.Dom.setXY(this._elContainer, B);
};
YAHOO.widget.AutoComplete.prototype.expandContainer = function() {
    this._toggleContainer(true);
};
YAHOO.widget.AutoComplete.prototype.collapseContainer = function() {
    this._toggleContainer(false);
};
YAHOO.widget.AutoComplete.prototype.clearList = function() {
    var B = this._elList.childNodes,
        A = B.length - 1;
    for (; A > -1; A--) {
        B[A].style.display = "none";
    }
};
YAHOO.widget.AutoComplete.prototype.getSubsetMatches = function(E) {
    var D, C, A;
    for (var B = E.length; B >= this.minQueryLength; B--) {
        A = this.generateRequest(E.substr(0, B));
        this.dataRequestEvent.fire(this, D, A);
        C = this.dataSource.getCachedResponse(A);
        if (C) {
            return this.filterResults.apply(this.dataSource, [E, C, C, {
                scope: this
            }]);
        }
    }
    return null;
};
YAHOO.widget.AutoComplete.prototype.preparseRawResponse = function(C, B, A) {
    var D = ((this.responseStripAfter !== "") && (B.indexOf)) ? B.indexOf(this.responseStripAfter) : -1;
    if (D != -1) {
        B = B.substring(0, D);
    }
    return B;
};
YAHOO.widget.AutoComplete.prototype.filterResults = function(K, M, Q, L) {
    if (L && L.argument && L.argument.query) {
        K = L.argument.query;
    }
    if (K && K !== "") {
        Q = YAHOO.widget.AutoComplete._cloneObject(Q);
        var I = L.scope,
            P = this,
            C = Q.results,
            N = [],
            B = I.maxResultsDisplayed,
            J = (P.queryMatchCase || I.queryMatchCase),
            A = (P.queryMatchContains || I.queryMatchContains);
        for (var D = 0, H = C.length; D < H; D++) {
            var F = C[D];
            var E = null;
            if (YAHOO.lang.isString(F)) {
                E = F;
            } else {
                if (YAHOO.lang.isArray(F)) {
                    E = F[0];
                } else {
                    if (this.responseSchema.fields) {
                        var O = this.responseSchema.fields[0].key || this.responseSchema.fields[0];
                        E = F[O];
                    } else {
                        if (this.key) {
                            E = F[this.key];
                        }
                    }
                }
            }
            if (YAHOO.lang.isString(E)) {
                var G = (J) ? E.indexOf(decodeURIComponent(K)) : E.toLowerCase().indexOf(decodeURIComponent(K).toLowerCase());
                if ((!A && (G === 0)) || (A && (G > -1))) {
                    N.push(F);
                }
            }
            if (H > B && N.length === B) {
                break;
            }
        }
        Q.results = N;
    } else {}
    return Q;
};
YAHOO.widget.AutoComplete.prototype.handleResponse = function(C, A, B) {
    if ((this instanceof YAHOO.widget.AutoComplete) && this._sName) {
        this._populateList(C, A, B);
    }
};
YAHOO.widget.AutoComplete.prototype.doBeforeLoadData = function(C, A, B) {
    return true;
};
YAHOO.widget.AutoComplete.prototype.formatResult = function(B, D, A) {
    var C = (A) ? A : "";
    return C;
};
YAHOO.widget.AutoComplete.prototype.doBeforeExpandContainer = function(D, A, C, B) {
    return true;
};
YAHOO.widget.AutoComplete.prototype.destroy = function() {
    var B = this.toString();
    var A = this._elTextbox;
    var D = this._elContainer;
    this.textboxFocusEvent.unsubscribeAll();
    this.textboxKeyEvent.unsubscribeAll();
    this.dataRequestEvent.unsubscribeAll();
    this.dataReturnEvent.unsubscribeAll();
    this.dataErrorEvent.unsubscribeAll();
    this.containerPopulateEvent.unsubscribeAll();
    this.containerExpandEvent.unsubscribeAll();
    this.typeAheadEvent.unsubscribeAll();
    this.itemMouseOverEvent.unsubscribeAll();
    this.itemMouseOutEvent.unsubscribeAll();
    this.itemArrowToEvent.unsubscribeAll();
    this.itemArrowFromEvent.unsubscribeAll();
    this.itemSelectEvent.unsubscribeAll();
    this.unmatchedItemSelectEvent.unsubscribeAll();
    this.selectionEnforceEvent.unsubscribeAll();
    this.containerCollapseEvent.unsubscribeAll();
    this.textboxBlurEvent.unsubscribeAll();
    this.textboxChangeEvent.unsubscribeAll();
    YAHOO.util.Event.purgeElement(A, true);
    YAHOO.util.Event.purgeElement(D, true);
    D.innerHTML = "";
    for (var C in this) {
        if (YAHOO.lang.hasOwnProperty(this, C)) {
            this[C] = null;
        }
    }
};
YAHOO.widget.AutoComplete.prototype.textboxFocusEvent = null;
YAHOO.widget.AutoComplete.prototype.textboxKeyEvent = null;
YAHOO.widget.AutoComplete.prototype.dataRequestEvent = null;
YAHOO.widget.AutoComplete.prototype.dataReturnEvent = null;
YAHOO.widget.AutoComplete.prototype.dataErrorEvent = null;
YAHOO.widget.AutoComplete.prototype.containerPopulateEvent = null;
YAHOO.widget.AutoComplete.prototype.containerExpandEvent = null;
YAHOO.widget.AutoComplete.prototype.typeAheadEvent = null;
YAHOO.widget.AutoComplete.prototype.itemMouseOverEvent = null;
YAHOO.widget.AutoComplete.prototype.itemMouseOutEvent = null;
YAHOO.widget.AutoComplete.prototype.itemArrowToEvent = null;
YAHOO.widget.AutoComplete.prototype.itemArrowFromEvent = null;
YAHOO.widget.AutoComplete.prototype.itemSelectEvent = null;
YAHOO.widget.AutoComplete.prototype.unmatchedItemSelectEvent = null;
YAHOO.widget.AutoComplete.prototype.selectionEnforceEvent = null;
YAHOO.widget.AutoComplete.prototype.containerCollapseEvent = null;
YAHOO.widget.AutoComplete.prototype.textboxBlurEvent = null;
YAHOO.widget.AutoComplete.prototype.textboxChangeEvent = null;
YAHOO.widget.AutoComplete._nIndex = 0;
YAHOO.widget.AutoComplete.prototype._sName = null;
YAHOO.widget.AutoComplete.prototype._elTextbox = null;
YAHOO.widget.AutoComplete.prototype._elContainer = null;
YAHOO.widget.AutoComplete.prototype._elContent = null;
YAHOO.widget.AutoComplete.prototype._elHeader = null;
YAHOO.widget.AutoComplete.prototype._elBody = null;
YAHOO.widget.AutoComplete.prototype._elFooter = null;
YAHOO.widget.AutoComplete.prototype._elShadow = null;
YAHOO.widget.AutoComplete.prototype._elIFrame = null;
YAHOO.widget.AutoComplete.prototype._bFocused = false;
YAHOO.widget.AutoComplete.prototype._oAnim = null;
YAHOO.widget.AutoComplete.prototype._bContainerOpen = false;
YAHOO.widget.AutoComplete.prototype._bOverContainer = false;
YAHOO.widget.AutoComplete.prototype._elList = null;
YAHOO.widget.AutoComplete.prototype._nDisplayedItems = 0;
YAHOO.widget.AutoComplete.prototype._sCurQuery = null;
YAHOO.widget.AutoComplete.prototype._sPastSelections = "";
YAHOO.widget.AutoComplete.prototype._sInitInputValue = null;
YAHOO.widget.AutoComplete.prototype._elCurListItem = null;
YAHOO.widget.AutoComplete.prototype._elCurPrehighlightItem = null;
YAHOO.widget.AutoComplete.prototype._bItemSelected = false;
YAHOO.widget.AutoComplete.prototype._nKeyCode = null;
YAHOO.widget.AutoComplete.prototype._nDelayID = -1;
YAHOO.widget.AutoComplete.prototype._nTypeAheadDelayID = -1;
YAHOO.widget.AutoComplete.prototype._iFrameSrc = "javascript:false;";
YAHOO.widget.AutoComplete.prototype._queryInterval = null;
YAHOO.widget.AutoComplete.prototype._sLastTextboxValue = null;
YAHOO.widget.AutoComplete.prototype._initProps = function() {
    var B = this.minQueryLength;
    if (!YAHOO.lang.isNumber(B)) {
        this.minQueryLength = 1;
    }
    var E = this.maxResultsDisplayed;
    if (!YAHOO.lang.isNumber(E) || (E < 1)) {
        this.maxResultsDisplayed = 10;
    }
    var F = this.queryDelay;
    if (!YAHOO.lang.isNumber(F) || (F < 0)) {
        this.queryDelay = 0.2;
    }
    var C = this.typeAheadDelay;
    if (!YAHOO.lang.isNumber(C) || (C < 0)) {
        this.typeAheadDelay = 0.2;
    }
    var A = this.delimChar;
    if (YAHOO.lang.isString(A) && (A.length > 0)) {
        this.delimChar = [A];
    } else {
        if (!YAHOO.lang.isArray(A)) {
            this.delimChar = null;
        }
    }
    var D = this.animSpeed;
    if ((this.animHoriz || this.animVert) && YAHOO.util.Anim) {
        if (!YAHOO.lang.isNumber(D) || (D < 0)) {
            this.animSpeed = 0.3;
        }
        if (!this._oAnim) {
            this._oAnim = new YAHOO.util.Anim(this._elContent, {}, this.animSpeed);
        } else {
            this._oAnim.duration = this.animSpeed;
        }
    }
    if (this.forceSelection && A) {}
};
YAHOO.widget.AutoComplete.prototype._initContainerHelperEls = function() {
    if (this.useShadow && !this._elShadow) {
        var A = document.createElement("div");
        A.className = "yui-ac-shadow";
        A.style.width = 0;
        A.style.height = 0;
        this._elShadow = this._elContainer.appendChild(A);
    }
    if (this.useIFrame && !this._elIFrame) {
        var B = document.createElement("iframe");
        B.src = this._iFrameSrc;
        B.frameBorder = 0;
        B.scrolling = "no";
        B.style.position = "absolute";
        B.style.width = 0;
        B.style.height = 0;
        B.style.padding = 0;
        B.tabIndex = -1;
        B.role = "presentation";
        B.title = "Presentational iframe shim";
        this._elIFrame = this._elContainer.appendChild(B);
    }
};
YAHOO.widget.AutoComplete.prototype._initContainerEl = function() {
    YAHOO.util.Dom.addClass(this._elContainer, "yui-ac-container");
    if (!this._elContent) {
        var C = document.createElement("div");
        C.className = "yui-ac-content";
        C.style.display = "none";
        this._elContent = this._elContainer.appendChild(C);
        var B = document.createElement("div");
        B.className = "yui-ac-hd";
        B.style.display = "none";
        this._elHeader = this._elContent.appendChild(B);
        var D = document.createElement("div");
        D.className = "yui-ac-bd";
        this._elBody = this._elContent.appendChild(D);
        var A = document.createElement("div");
        A.className = "yui-ac-ft";
        A.style.display = "none";
        this._elFooter = this._elContent.appendChild(A);
    } else {}
};
YAHOO.widget.AutoComplete.prototype._initListEl = function() {
    var C = this.maxResultsDisplayed,
        A = this._elList || document.createElement("ul"),
        B;
    while (A.childNodes.length < C) {
        B = document.createElement("li");
        B.style.display = "none";
        B._nItemIndex = A.childNodes.length;
        A.appendChild(B);
    }
    if (!this._elList) {
        var D = this._elBody;
        YAHOO.util.Event.purgeElement(D, true);
        D.innerHTML = "";
        this._elList = D.appendChild(A);
    }
    this._elBody.style.display = "";
};
YAHOO.widget.AutoComplete.prototype._focus = function() {
    var A = this;
    setTimeout(function() {
        try {
            A._elTextbox.focus();
        } catch (B) {}
    }, 0);
};
YAHOO.widget.AutoComplete.prototype._enableIntervalDetection = function() {
    var A = this;
    if (!A._queryInterval && A.queryInterval) {
        A._queryInterval = setInterval(function() {
            A._onInterval();
        }, A.queryInterval);
    }
};
YAHOO.widget.AutoComplete.prototype.enableIntervalDetection = YAHOO.widget.AutoComplete.prototype._enableIntervalDetection;
YAHOO.widget.AutoComplete.prototype._onInterval = function() {
    var A = this._elTextbox.value;
    var B = this._sLastTextboxValue;
    if (A != B) {
        this._sLastTextboxValue = A;
        this._sendQuery(A);
    }
};
YAHOO.widget.AutoComplete.prototype._clearInterval = function() {
    if (this._queryInterval) {
        clearInterval(this._queryInterval);
        this._queryInterval = null;
    }
};
YAHOO.widget.AutoComplete.prototype._isIgnoreKey = function(A) {
    if ((A == 9) || (A == 13) || (A == 16) || (A == 17) || (A >= 18 && A <= 20) || (A == 27) || (A >= 33 && A <= 35) || (A >= 36 && A <= 40) || (A >= 44 && A <= 45) || (A == 229)) {
        return true;
    }
    return false;
};
YAHOO.widget.AutoComplete.prototype._sendQuery = function(D) {
    if (this.minQueryLength < 0) {
        this._toggleContainer(false);
        return;
    }
    if (this.delimChar) {
        var A = this._extractQuery(D);
        D = A.query;
        this._sPastSelections = A.previous;
    }
    if ((D && (D.length < this.minQueryLength)) || (!D && this.minQueryLength > 0)) {
        if (this._nDelayID != -1) {
            clearTimeout(this._nDelayID);
        }
        this._toggleContainer(false);
        return;
    }
    D = encodeURIComponent(D);
    this._nDelayID = -1;
    if (this.dataSource.queryMatchSubset || this.queryMatchSubset) {
        var C = this.getSubsetMatches(D);
        if (C) {
            this.handleResponse(D, C, {
                query: D
            });
            return;
        }
    }
    if (this.dataSource.responseStripAfter) {
        this.dataSource.doBeforeParseData = this.preparseRawResponse;
    }
    if (this.applyLocalFilter) {
        this.dataSource.doBeforeCallback = this.filterResults;
    }
    var B = this.generateRequest(D);
    this.dataRequestEvent.fire(this, D, B);
    this.dataSource.sendRequest(B, {
        success: this.handleResponse,
        failure: this.handleResponse,
        scope: this,
        argument: {
            query: D
        }
    });
};
YAHOO.widget.AutoComplete.prototype._populateListItem = function(B, A, C) {
    B.innerHTML = this.formatResult(A, C, B._sResultMatch);
};
YAHOO.widget.AutoComplete.prototype._populateList = function(K, F, C) {
    if (this._nTypeAheadDelayID != -1) {
        clearTimeout(this._nTypeAheadDelayID);
    }
    K = (C && C.query) ? C.query : K;
    var H = this.doBeforeLoadData(K, F, C);
    if (H && !F.error) {
        this.dataReturnEvent.fire(this, K, F.results);
        if (this._bFocused) {
            var M = decodeURIComponent(K);
            this._sCurQuery = M;
            this._bItemSelected = false;
            var R = F.results,
                A = Math.min(R.length, this.maxResultsDisplayed),
                J = (this.dataSource.responseSchema.fields) ? (this.dataSource.responseSchema.fields[0].key || this.dataSource.responseSchema.fields[0]) : 0;
            if (A > 0) {
                if (!this._elList || (this._elList.childNodes.length < A)) {
                    this._initListEl();
                }
                this._initContainerHelperEls();
                var I = this._elList.childNodes;
                for (var Q = A - 1; Q >= 0; Q--) {
                    var P = I[Q],
                        E = R[Q];
                    if (this.resultTypeList) {
                        var B = [];
                        B[0] = (YAHOO.lang.isString(E)) ? E : E[J] || E[this.key];
                        var L = this.dataSource.responseSchema.fields;
                        if (YAHOO.lang.isArray(L) && (L.length > 1)) {
                            for (var N = 1, S = L.length; N < S; N++) {
                                B[B.length] = E[L[N].key || L[N]];
                            }
                        } else {
                            if (YAHOO.lang.isArray(E)) {
                                B = E;
                            } else {
                                if (YAHOO.lang.isString(E)) {
                                    B = [E];
                                } else {
                                    B[1] = E;
                                }
                            }
                        }
                        E = B;
                    }
                    P._sResultMatch = (YAHOO.lang.isString(E)) ? E : (YAHOO.lang.isArray(E)) ? E[0] : (E[J] || "");
                    P._oResultData = E;
                    this._populateListItem(P, E, M);
                    P.style.display = "";
                }
                if (A < I.length) {
                    var G;
                    for (var O = I.length - 1; O >= A; O--) {
                        G = I[O];
                        G.style.display = "none";
                    }
                }
                this._nDisplayedItems = A;
                this.containerPopulateEvent.fire(this, K, R);
                if (this.autoHighlight) {
                    var D = this._elList.firstChild;
                    this._toggleHighlight(D, "to");
                    this.itemArrowToEvent.fire(this, D);
                    this._typeAhead(D, K);
                } else {
                    this._toggleHighlight(this._elCurListItem, "from");
                }
                H = this._doBeforeExpandContainer(this._elTextbox, this._elContainer, K, R);
                this._toggleContainer(H);
            } else {
                this._toggleContainer(false);
            }
            return;
        }
    } else {
        this.dataErrorEvent.fire(this, K, F);
    }
};
YAHOO.widget.AutoComplete.prototype._doBeforeExpandContainer = function(D, A, C, B) {
    if (this.autoSnapContainer) {
        this.snapContainer();
    }
    return this.doBeforeExpandContainer(D, A, C, B);
};
YAHOO.widget.AutoComplete.prototype._clearSelection = function() {
    var A = (this.delimChar) ? this._extractQuery(this._elTextbox.value) : {
        previous: "",
        query: this._elTextbox.value
    };
    this._elTextbox.value = A.previous;
    this.selectionEnforceEvent.fire(this, A.query);
};
YAHOO.widget.AutoComplete.prototype._textMatchesOption = function() {
    var A = null;
    for (var B = 0; B < this._nDisplayedItems; B++) {
        var C = this._elList.childNodes[B];
        var D = ("" + C._sResultMatch).toLowerCase();
        if (D == this._sCurQuery.toLowerCase()) {
            A = C;
            break;
        }
    }
    return (A);
};
YAHOO.widget.AutoComplete.prototype._typeAhead = function(B, D) {
    if (!this.typeAhead || (this._nKeyCode == 8)) {
        return;
    }
    var A = this,
        C = this._elTextbox;
    if (C.setSelectionRange || C.createTextRange) {
        this._nTypeAheadDelayID = setTimeout(function() {
            var F = C.value.length;
            A._updateValue(B);
            var G = C.value.length;
            A._selectText(C, F, G);
            var E = C.value.substr(F, G);
            A.typeAheadEvent.fire(A, D, E);
        }, (this.typeAheadDelay * 1000));
    }
};
YAHOO.widget.AutoComplete.prototype._selectText = function(D, A, B) {
    if (D.setSelectionRange) {
        D.setSelectionRange(A, B);
    } else {
        if (D.createTextRange) {
            var C = D.createTextRange();
            C.moveStart("character", A);
            C.moveEnd("character", B - D.value.length);
            C.select();
        } else {
            D.select();
        }
    }
};
YAHOO.widget.AutoComplete.prototype._extractQuery = function(H) {
    var C = this.delimChar,
        F = -1,
        G, E, B = C.length - 1,
        D;
    for (; B >= 0; B--) {
        G = H.lastIndexOf(C[B]);
        if (G > F) {
            F = G;
        }
    }
    if (C[B] == " ") {
        for (var A = C.length - 1; A >= 0; A--) {
            if (H[F - 1] == C[A]) {
                F--;
                break;
            }
        }
    }
    if (F > -1) {
        E = F + 1;
        while (H.charAt(E) == " ") {
            E += 1;
        }
        D = H.substring(0, E);
        H = H.substr(E);
    } else {
        D = "";
    }
    return {
        previous: D,
        query: H
    };
};
YAHOO.widget.AutoComplete.prototype._toggleContainerHelpers = function(D) {
    var E = this._elContent.offsetWidth + "px";
    var B = this._elContent.offsetHeight + "px";
    if (this.useIFrame && this._elIFrame) {
        var C = this._elIFrame;
        if (D) {
            C.style.width = E;
            C.style.height = B;
            C.style.padding = "";
        } else {
            C.style.width = 0;
            C.style.height = 0;
            C.style.padding = 0;
        }
    }
    if (this.useShadow && this._elShadow) {
        var A = this._elShadow;
        if (D) {
            A.style.width = E;
            A.style.height = B;
        } else {
            A.style.width = 0;
            A.style.height = 0;
        }
    }
};
YAHOO.widget.AutoComplete.prototype._toggleContainer = function(I) {
    var D = this._elContainer;
    if (this.alwaysShowContainer && this._bContainerOpen) {
        return;
    }
    if (!I) {
        this._toggleHighlight(this._elCurListItem, "from");
        this._nDisplayedItems = 0;
        this._sCurQuery = null;
        if (this._elContent.style.display == "none") {
            return;
        }
    }
    var A = this._oAnim;
    if (A && A.getEl() && (this.animHoriz || this.animVert)) {
        if (A.isAnimated()) {
            A.stop(true);
        }
        var G = this._elContent.cloneNode(true);
        D.appendChild(G);
        G.style.top = "-9000px";
        G.style.width = "";
        G.style.height = "";
        G.style.display = "";
        var F = G.offsetWidth;
        var C = G.offsetHeight;
        var B = (this.animHoriz) ? 0 : F;
        var E = (this.animVert) ? 0 : C;
        A.attributes = (I) ? {
            width: {
                to: F
            },
            height: {
                to: C
            }
        } : {
            width: {
                to: B
            },
            height: {
                to: E
            }
        };
        if (I && !this._bContainerOpen) {
            this._elContent.style.width = B + "px";
            this._elContent.style.height = E + "px";
        } else {
            this._elContent.style.width = F + "px";
            this._elContent.style.height = C + "px";
        }
        D.removeChild(G);
        G = null;
        var H = this;
        var J = function() {
            A.onComplete.unsubscribeAll();
            if (I) {
                H._toggleContainerHelpers(true);
                H._bContainerOpen = I;
                H.containerExpandEvent.fire(H);
            } else {
                H._elContent.style.display = "none";
                H._bContainerOpen = I;
                H.containerCollapseEvent.fire(H);
            }
        };
        this._toggleContainerHelpers(false);
        this._elContent.style.display = "";
        A.onComplete.subscribe(J);
        A.animate();
    } else {
        if (I) {
            this._elContent.style.display = "";
            this._toggleContainerHelpers(true);
            this._bContainerOpen = I;
            this.containerExpandEvent.fire(this);
        } else {
            this._toggleContainerHelpers(false);
            this._elContent.style.display = "none";
            this._bContainerOpen = I;
            this.containerCollapseEvent.fire(this);
        }
    }
};
YAHOO.widget.AutoComplete.prototype._toggleHighlight = function(A, C) {
    if (A) {
        var B = this.highlightClassName;
        if (this._elCurListItem) {
            YAHOO.util.Dom.removeClass(this._elCurListItem, B);
            this._elCurListItem = null;
        }
        if ((C == "to") && B) {
            YAHOO.util.Dom.addClass(A, B);
            this._elCurListItem = A;
        }
    }
};
YAHOO.widget.AutoComplete.prototype._togglePrehighlight = function(B, C) {
    var A = this.prehighlightClassName;
    if (this._elCurPrehighlightItem) {
        YAHOO.util.Dom.removeClass(this._elCurPrehighlightItem, A);
    }
    if (B == this._elCurListItem) {
        return;
    }
    if ((C == "mouseover") && A) {
        YAHOO.util.Dom.addClass(B, A);
        this._elCurPrehighlightItem = B;
    } else {
        YAHOO.util.Dom.removeClass(B, A);
    }
};
YAHOO.widget.AutoComplete.prototype._updateValue = function(C) {
    if (!this.suppressInputUpdate) {
        var F = this._elTextbox;
        var E = (this.delimChar) ? (this.delimChar[0] || this.delimChar) : null;
        var B = C._sResultMatch;
        var D = "";
        if (E) {
            D = this._sPastSelections;
            D += B + E;
            if (E != " ") {
                D += " ";
            }
        } else {
            D = B;
        }
        F.value = D;
        if (F.type == "textarea") {
            F.scrollTop = F.scrollHeight;
        }
        var A = F.value.length;
        this._selectText(F, A, A);
        this._elCurListItem = C;
    }
};
YAHOO.widget.AutoComplete.prototype._selectItem = function(A) {
    this._bItemSelected = true;
    this._updateValue(A);
    this._sPastSelections = this._elTextbox.value;
    this._clearInterval();
    this.itemSelectEvent.fire(this, A, A._oResultData);
    this._toggleContainer(false);
};
YAHOO.widget.AutoComplete.prototype._jumpSelection = function() {
    if (this._elCurListItem) {
        this._selectItem(this._elCurListItem);
    } else {
        this._toggleContainer(false);
    }
};
YAHOO.widget.AutoComplete.prototype._moveSelection = function(G) {
    if (this._bContainerOpen) {
        var H = this._elCurListItem,
            D = -1;
        if (H) {
            D = H._nItemIndex;
        }
        var E = (G == 40) ? (D + 1) : (D - 1);
        if (E < -2 || E >= this._nDisplayedItems) {
            return;
        }
        if (H) {
            this._toggleHighlight(H, "from");
            this.itemArrowFromEvent.fire(this, H);
        }
        if (E == -1) {
            if (this.delimChar) {
                this._elTextbox.value = this._sPastSelections + this._sCurQuery;
            } else {
                this._elTextbox.value = this._sCurQuery;
            }
            return;
        }
        if (E == -2) {
            this._toggleContainer(false);
            return;
        }
        var F = this._elList.childNodes[E],
            B = this._elContent,
            C = YAHOO.util.Dom.getStyle(B, "overflow"),
            I = YAHOO.util.Dom.getStyle(B, "overflowY"),
            A = ((C == "auto") || (C == "scroll") || (I == "auto") || (I == "scroll"));
        if (A && (E > -1) && (E < this._nDisplayedItems)) {
            if (G == 40) {
                if ((F.offsetTop + F.offsetHeight) > (B.scrollTop + B.offsetHeight)) {
                    B.scrollTop = (F.offsetTop + F.offsetHeight) - B.offsetHeight;
                } else {
                    if ((F.offsetTop + F.offsetHeight) < B.scrollTop) {
                        B.scrollTop = F.offsetTop;
                    }
                }
            } else {
                if (F.offsetTop < B.scrollTop) {
                    this._elContent.scrollTop = F.offsetTop;
                } else {
                    if (F.offsetTop > (B.scrollTop + B.offsetHeight)) {
                        this._elContent.scrollTop = (F.offsetTop + F.offsetHeight) - B.offsetHeight;
                    }
                }
            }
        }
        this._toggleHighlight(F, "to");
        this.itemArrowToEvent.fire(this, F);
        if (this.typeAhead) {
            this._updateValue(F);
        }
    }
};
YAHOO.widget.AutoComplete.prototype._onContainerMouseover = function(A, C) {
    var D = YAHOO.util.Event.getTarget(A);
    var B = D.nodeName.toLowerCase();
    while (D && (B != "table")) {
        switch (B) {
            case "body":
                return;
            case "li":
                if (C.prehighlightClassName) {
                    C._togglePrehighlight(D, "mouseover");
                } else {
                    C._toggleHighlight(D, "to");
                }
                C.itemMouseOverEvent.fire(C, D);
                break;
            case "div":
                if (YAHOO.util.Dom.hasClass(D, "yui-ac-container")) {
                    C._bOverContainer = true;
                    return;
                }
                break;
            default:
                break;
        }
        D = D.parentNode;
        if (D) {
            B = D.nodeName.toLowerCase();
        }
    }
};
YAHOO.widget.AutoComplete.prototype._onContainerMouseout = function(A, C) {
    var D = YAHOO.util.Event.getTarget(A);
    var B = D.nodeName.toLowerCase();
    while (D && (B != "table")) {
        switch (B) {
            case "body":
                return;
            case "li":
                if (C.prehighlightClassName) {
                    C._togglePrehighlight(D, "mouseout");
                } else {
                    C._toggleHighlight(D, "from");
                }
                C.itemMouseOutEvent.fire(C, D);
                break;
            case "ul":
                C._toggleHighlight(C._elCurListItem, "to");
                break;
            case "div":
                if (YAHOO.util.Dom.hasClass(D, "yui-ac-container")) {
                    C._bOverContainer = false;
                    return;
                }
                break;
            default:
                break;
        }
        D = D.parentNode;
        if (D) {
            B = D.nodeName.toLowerCase();
        }
    }
};
YAHOO.widget.AutoComplete.prototype._onContainerClick = function(A, C) {
    var D = YAHOO.util.Event.getTarget(A);
    var B = D.nodeName.toLowerCase();
    while (D && (B != "table")) {
        switch (B) {
            case "body":
                return;
            case "li":
                C._toggleHighlight(D, "to");
                C._selectItem(D);
                return;
            default:
                break;
        }
        D = D.parentNode;
        if (D) {
            B = D.nodeName.toLowerCase();
        }
    }
};
YAHOO.widget.AutoComplete.prototype._onContainerScroll = function(A, B) {
    B._focus();
};
YAHOO.widget.AutoComplete.prototype._onContainerResize = function(A, B) {
    B._toggleContainerHelpers(B._bContainerOpen);
};
YAHOO.widget.AutoComplete.prototype._onTextboxKeyDown = function(A, B) {
    var C = A.keyCode;
    if (B._nTypeAheadDelayID != -1) {
        clearTimeout(B._nTypeAheadDelayID);
    }
    switch (C) {
        case 9:
            if (!YAHOO.env.ua.opera && (navigator.userAgent.toLowerCase().indexOf("mac") == -1) || (YAHOO.env.ua.webkit > 420)) {
                if (B._elCurListItem) {
                    if (B.delimChar && (B._nKeyCode != C)) {
                        if (B._bContainerOpen) {
                            YAHOO.util.Event.stopEvent(A);
                        }
                    }
                    B._selectItem(B._elCurListItem);
                } else {
                    B._toggleContainer(false);
                }
            }
            break;
        case 13:
            if (!YAHOO.env.ua.opera && (navigator.userAgent.toLowerCase().indexOf("mac") == -1) || (YAHOO.env.ua.webkit > 420)) {
                if (B._elCurListItem) {
                    if (B._nKeyCode != C) {
                        if (B._bContainerOpen) {
                            YAHOO.util.Event.stopEvent(A);
                        }
                    }
                    B._selectItem(B._elCurListItem);
                } else {
                    B._toggleContainer(false);
                }
            }
            break;
        case 27:
            B._toggleContainer(false);
            return;
        case 39:
            B._jumpSelection();
            break;
        case 38:
            if (B._bContainerOpen) {
                YAHOO.util.Event.stopEvent(A);
                B._moveSelection(C);
            }
            break;
        case 40:
            if (B._bContainerOpen) {
                YAHOO.util.Event.stopEvent(A);
                B._moveSelection(C);
            }
            break;
        default:
            B._bItemSelected = false;
            B._toggleHighlight(B._elCurListItem, "from");
            B.textboxKeyEvent.fire(B, C);
            break;
    }
    if (C === 18) {
        B._enableIntervalDetection();
    }
    B._nKeyCode = C;
};
YAHOO.widget.AutoComplete.prototype._onTextboxKeyPress = function(A, B) {
    var C = A.keyCode;
    if (YAHOO.env.ua.opera || (navigator.userAgent.toLowerCase().indexOf("mac") != -1) && (YAHOO.env.ua.webkit < 420)) {
        switch (C) {
            case 9:
                if (B._bContainerOpen) {
                    if (B.delimChar) {
                        YAHOO.util.Event.stopEvent(A);
                    }
                    if (B._elCurListItem) {
                        B._selectItem(B._elCurListItem);
                    } else {
                        B._toggleContainer(false);
                    }
                }
                break;
            case 13:
                if (B._bContainerOpen) {
                    YAHOO.util.Event.stopEvent(A);
                    if (B._elCurListItem) {
                        B._selectItem(B._elCurListItem);
                    } else {
                        B._toggleContainer(false);
                    }
                }
                break;
            default:
                break;
        }
    } else {
        if (C == 229) {
            B._enableIntervalDetection();
        }
    }
};
YAHOO.widget.AutoComplete.prototype._onTextboxKeyUp = function(A, C) {
    var B = this.value;
    C._initProps();
    var D = A.keyCode;
    if (C._isIgnoreKey(D)) {
        return;
    }
    if (C._nDelayID != -1) {
        clearTimeout(C._nDelayID);
    }
    C._nDelayID = setTimeout(function() {
        C._sendQuery(B);
    }, (C.queryDelay * 1000));
};
YAHOO.widget.AutoComplete.prototype._onTextboxFocus = function(A, B) {
    if (!B._bFocused) {
        B._elTextbox.setAttribute("autocomplete", "off");
        B._bFocused = true;
        B._sInitInputValue = B._elTextbox.value;
        B.textboxFocusEvent.fire(B);
    }
};
YAHOO.widget.AutoComplete.prototype._onTextboxBlur = function(A, C) {
    if (!C._bOverContainer || (C._nKeyCode == 9)) {
        if (!C._bItemSelected) {
            var B = C._textMatchesOption();
            if (!C._bContainerOpen || (C._bContainerOpen && (B === null))) {
                if (C.forceSelection) {
                    C._clearSelection();
                } else {
                    C.unmatchedItemSelectEvent.fire(C, C._sCurQuery);
                }
            } else {
                if (C.forceSelection) {
                    C._selectItem(B);
                }
            }
        }
        C._clearInterval();
        C._bFocused = false;
        if (C._sInitInputValue !== C._elTextbox.value) {
            C.textboxChangeEvent.fire(C);
        }
        C.textboxBlurEvent.fire(C);
        C._toggleContainer(false);
    } else {
        C._focus();
    }
};
YAHOO.widget.AutoComplete.prototype._onWindowUnload = function(A, B) {
    if (B && B._elTextbox && B.allowBrowserAutocomplete) {
        B._elTextbox.setAttribute("autocomplete", "on");
    }
};
YAHOO.widget.AutoComplete.prototype.doBeforeSendQuery = function(A) {
    return this.generateRequest(A);
};
YAHOO.widget.AutoComplete.prototype.getListItems = function() {
    var C = [],
        B = this._elList.childNodes;
    for (var A = B.length - 1; A >= 0; A--) {
        C[A] = B[A];
    }
    return C;
};
YAHOO.widget.AutoComplete._cloneObject = function(D) {
    if (!YAHOO.lang.isValue(D)) {
        return D;
    }
    var F = {};
    if (YAHOO.lang.isFunction(D)) {
        F = D;
    } else {
        if (YAHOO.lang.isArray(D)) {
            var E = [];
            for (var C = 0, B = D.length; C < B; C++) {
                E[C] = YAHOO.widget.AutoComplete._cloneObject(D[C]);
            }
            F = E;
        } else {
            if (YAHOO.lang.isObject(D)) {
                for (var A in D) {
                    if (YAHOO.lang.hasOwnProperty(D, A)) {
                        if (YAHOO.lang.isValue(D[A]) && YAHOO.lang.isObject(D[A]) || YAHOO.lang.isArray(D[A])) {
                            F[A] = YAHOO.widget.AutoComplete._cloneObject(D[A]);
                        } else {
                            F[A] = D[A];
                        }
                    }
                }
            } else {
                F = D;
            }
        }
    }
    return F;
};
YAHOO.register("autocomplete", YAHOO.widget.AutoComplete, {
    version: "2.8.2r1",
    build: "7"
});;
/* Source and licensing information for the line(s) below can be found at http://www.gaia.com/sites/all/modules/gaiamtv_site/gaiamtv_sp/gaiamtv_sp.js. */
Drupal.behaviors.gaiatvSearchPromoteAutocomplete = function(context) {
    var baseUrl = document.location.protocol + '//' + document.location.host + Drupal.settings.basePath,
        search_fields = {
            0: 'search-block',
            1: 'search-form'
        },
        acDS = [],
        acObj = [],
        acSH = [],
        form, field;
    String.prototype.ucWords = function() {
        return this.replace(/\w+/g, function(a) {
            return a.charAt(0).toUpperCase() + a.slice(1).toLowerCase()
        })
    };
    for (var i = 0; i < 2; i++) {
        form = document.forms[i];
        if (form) {
            field = search_fields[i];
            $('#gaiamtv-sp-' + field + ':not(.is-processed)', context).addClass('is-processed').each(function() {
                var g_staged = (document.getElementById("sp_staged") ? document.getElementById("sp_staged").value : 0),
                    protocol = (document.location.protocol == "https:" ? "https:" : "http:"),
                    postfix = (g_staged ? "-stage/" : "/");
                acDS[i] = new YAHOO.util.ScriptNodeDataSource((protocol + "//content.atomz.com/autocomplete/sp10/05/0a/4b" + postfix));
                acDS[i].asyncMode = "ignoreStaleResponses";
                acDS[i].maxCacheEntries = 1e3;
                acDS[i].responseSchema = {
                    resultsList: "ResultSet.Result",
                    fields: ["phrase"]
                };
                acObj[i] = new YAHOO.widget.AutoComplete(field, "autocomplete-" + i, acDS[i]);
                acObj[i].queryDelay = 0.2;
                acObj[i].useShadow = false;
                acObj[i].autoHighlight = false;
                acObj[i].minQueryLength = 1;
                acObj[i].maxResultsDisplayed = 10;
                acObj[i].animVert = false;
                acObj[i].queryQuestionMark = true;
                acObj[i].resultTypeList = false;
                acObj[i].allowBrowserAutocomplete = false;
                acObj[i].field = field;
                acObj[i].form = form;
                acObj[i].formatResult = function(oResultData, sQuery, sResultMatch, field) {
                    if (this.field == "search-form") {
                        return sResultMatch.ucWords() ? sResultMatch.ucWords() : ""
                    } else if (sResultMatch.length > 30) {
                        return ((sResultMatch.ucWords().substring(0, 28)) + "...") ? ((sResultMatch.ucWords().substring(0, 28)) + "...") : ""
                    } else return sResultMatch.ucWords() ? sResultMatch.ucWords() : ""
                };
                acObj[i].generateRequest = function(q) {
                    return "?query=" + q + "&max_results=10&beginning=1"
                };
                acSH[i] = function(type, args) {
                    form = args[0].form;
                    $('input.yui-ac-input', form).attr('value', function() {
                        return args[2].phrase.ucWords()
                    });
                    form.submit()
                };
                acObj[i].itemSelectEvent.subscribe(acSH[i], this)
            })
        }
    }
};
/* Source and licensing information for the above line(s) can be found at http://www.gaia.com/sites/all/modules/gaiamtv_site/gaiamtv_sp/gaiamtv_sp.js. */
