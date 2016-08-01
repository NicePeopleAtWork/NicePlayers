/*!
 * jQuery JavaScript Library v1.4.2
 * http://jquery.com/
 *
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2010, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Sat Feb 13 22:33:48 2010 -0500
 * Javier Fernández. - Added modification to force refresh of maple navigator when the classes of DOM element is changed.
 * 
 */
(function (e, t) {
    function S() {
        if (n.isReady) {
            return
        }
        try {
            s.documentElement.doScroll("left")
        } catch (e) {
            setTimeout(S, 1);
            return
        }
        n.ready()
    }

    function x(e, t) {
        if (t.src) {
            n.ajax({
                url: t.src,
                async: false,
                dataType: "script"
            })
        } else {
            n.globalEval(t.text || t.textContent || t.innerHTML || "")
        } if (t.parentNode) {
            t.parentNode.removeChild(t)
        }
    }

    function T(e, r, i, s, o, u) {
        var a = e.length;
        if (typeof r === "object") {
            for (var f in r) {
                T(e, f, r[f], s, o, i)
            }
            return e
        }
        if (i !== t) {
            s = !u && s && n.isFunction(i);
            for (var l = 0; l < a; l++) {
                o(e[l], r, s ? i.call(e[l], l, o(e[l], r)) : i, u)
            }
            return e
        }
        return a ? o(e[0], r) : t
    }

    function N() {
        return (new Date).getTime()
    }

    function q() {
        return false
    }

    function R() {
        return true
    }

    function J(e, t, r) {
        r[0].type = e;
        return n.event.handle.apply(t, r)
    }

    function Q(e) {
        var t, r = [],
            i = [],
            s = arguments,
            o, u, a, f, l, c, h, p, d = n.data(this, "events");
        if (e.liveFired === this || !d || !d.live || e.button && e.type === "click") {
            return
        }
        e.liveFired = this;
        var v = d.live.slice(0);
        for (l = 0; l < v.length; l++) {
            a = v[l];
            if (a.origType.replace(j, "") === e.type) {
                i.push(a.selector)
            } else {
                v.splice(l--, 1)
            }
        }
        u = n(e.target).closest(i, e.currentTarget);
        for (c = 0, h = u.length; c < h; c++) {
            for (l = 0; l < v.length; l++) {
                a = v[l];
                if (u[c].selector === a.selector) {
                    f = u[c].elem;
                    o = null;
                    if (a.preType === "mouseenter" || a.preType === "mouseleave") {
                        o = n(e.relatedTarget).closest(a.selector)[0]
                    }
                    if (!o || o !== f) {
                        r.push({
                            elem: f,
                            handleObj: a
                        })
                    }
                }
            }
        }
        for (c = 0, h = r.length; c < h; c++) {
            u = r[c];
            e.currentTarget = u.elem;
            e.data = u.handleObj.data;
            e.handleObj = u.handleObj;
            if (u.handleObj.origHandler.apply(u.elem, s) === false) {
                t = false;
                break
            }
        }
        return t
    }

    function G(e, t) {
        return "live." + (e && e !== "*" ? e + "." : "") + t.replace(/\./g, "`").replace(/ /g, "&")
    }

    function nt(e) {
        return !e || !e.parentNode || e.parentNode.nodeType === 11
    }

    function dt(e, t) {
        var r = 0;
        t.each(function () {
            if (this.nodeName !== (e[r] && e[r].nodeName)) {
                return
            }
            var t = n.data(e[r++]),
                i = n.data(this, t),
                s = t && t.events;
            if (s) {
                delete i.handle;
                i.events = {};
                for (var o in s) {
                    for (var u in s[o]) {
                        n.event.add(this, o, s[o][u], s[o][u].data)
                    }
                }
            }
        })
    }

    function vt(e, t, r) {
        var i, o, u, a = t && t[0] ? t[0].ownerDocument || t[0] : s;
        if (e.length === 1 && typeof e[0] === "string" && e[0].length < 512 && a === s && !lt.test(e[0]) && (n.support.checkClone || !ct.test(e[0]))) {
            o = true;
            u = n.fragments[e[0]];
            if (u) {
                if (u !== 1) {
                    i = u
                }
            }
        }
        if (!i) {
            i = a.createDocumentFragment();
            n.clean(e, a, i, r)
        }
        if (o) {
            n.fragments[e[0]] = u ? i : 1
        }
        return {
            fragment: i,
            cacheable: o
        }
    }

    function Xt(e, t) {
        var r = {};
        n.each(Wt.concat.apply([], Wt.slice(0, t)), function () {
            r[this] = e
        });
        return r
    }

    function Vt(e) {
        return "scrollTo" in e && e.document ? e : e.nodeType === 9 ? e.defaultView || e.parentWindow : false
    }
    var n = function (e, t) {
            return new n.fn.init(e, t)
        },
        r = e.jQuery,
        i = e.$,
        s = e.document,
        o, u = /^[^<]*(<[\w\W]+>)[^>]*$|^#([\w-]+)$/,
        a = /^.[^:#\[\.,]*$/,
        f = /\S/,
        l = /^(\s|\u00A0)+|(\s|\u00A0)+$/g,
        c = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
        h = navigator.userAgent,
        p, d = false,
        v = [],
        m, g = Object.prototype.toString,
        y = Object.prototype.hasOwnProperty,
        b = Array.prototype.push,
        w = Array.prototype.slice,
        E = Array.prototype.indexOf;
    n.fn = n.prototype = {
        init: function (e, r) {
            var i, a, f, l;
            if (!e) {
                return this
            }
            if (e.nodeType) {
                this.context = this[0] = e;
                this.length = 1;
                return this
            }
            if (e === "body" && !r) {
                this.context = s;
                this[0] = s.body;
                this.selector = "body";
                this.length = 1;
                return this
            }
            if (typeof e === "string") {
                i = u.exec(e);
                if (i && (i[1] || !r)) {
                    if (i[1]) {
                        l = r ? r.ownerDocument || r : s;
                        f = c.exec(e);
                        if (f) {
                            if (n.isPlainObject(r)) {
                                e = [s.createElement(f[1])];
                                n.fn.attr.call(e, r, true)
                            } else {
                                e = [l.createElement(f[1])]
                            }
                        } else {
                            f = vt([i[1]], [l]);
                            e = (f.cacheable ? f.fragment.cloneNode(true) : f.fragment).childNodes
                        }
                        return n.merge(this, e)
                    } else {
                        a = s.getElementById(i[2]);
                        if (a) {
                            if (a.id !== i[2]) {
                                return o.find(e)
                            }
                            this.length = 1;
                            this[0] = a
                        }
                        this.context = s;
                        this.selector = e;
                        return this
                    }
                } else if (!r && /^\w+$/.test(e)) {
                    this.selector = e;
                    this.context = s;
                    e = s.getElementsByTagName(e);
                    return n.merge(this, e)
                } else if (!r || r.jquery) {
                    return (r || o).find(e)
                } else {
                    return n(r).find(e)
                }
            } else if (n.isFunction(e)) {
                return o.ready(e)
            }
            if (e.selector !== t) {
                this.selector = e.selector;
                this.context = e.context
            }
            return n.makeArray(e, this)
        },
        selector: "",
        jquery: "1.4.2",
        length: 0,
        size: function () {
            return this.length
        },
        toArray: function () {
            return w.call(this, 0)
        },
        get: function (e) {
            return e == null ? this.toArray() : e < 0 ? this.slice(e)[0] : this[e]
        },
        pushStack: function (e, t, r) {
            var i = n();
            if (n.isArray(e)) {
                b.apply(i, e)
            } else {
                n.merge(i, e)
            }
            i.prevObject = this;
            i.context = this.context;
            if (t === "find") {
                i.selector = this.selector + (this.selector ? " " : "") + r
            } else if (t) {
                i.selector = this.selector + "." + t + "(" + r + ")"
            }
            return i
        },
        each: function (e, t) {
            return n.each(this, e, t)
        },
        ready: function (e) {
            n.bindReady();
            if (n.isReady) {
                e.call(s, n)
            } else if (v) {
                v.push(e)
            }
            return this
        },
        eq: function (e) {
            return e === -1 ? this.slice(e) : this.slice(e, +e + 1)
        },
        first: function () {
            return this.eq(0)
        },
        last: function () {
            return this.eq(-1)
        },
        slice: function () {
            return this.pushStack(w.apply(this, arguments), "slice", w.call(arguments).join(","))
        },
        map: function (e) {
            return this.pushStack(n.map(this, function (t, n) {
                return e.call(t, n, t)
            }))
        },
        end: function () {
            return this.prevObject || n(null)
        },
        push: b,
        sort: [].sort,
        splice: [].splice
    };
    n.fn.init.prototype = n.fn;
    n.extend = n.fn.extend = function () {
        var e = arguments[0] || {},
            r = 1,
            i = arguments.length,
            s = false,
            o, u, a, f;
        if (typeof e === "boolean") {
            s = e;
            e = arguments[1] || {};
            r = 2
        }
        if (typeof e !== "object" && !n.isFunction(e)) {
            e = {}
        }
        if (i === r) {
            e = this;
            --r
        }
        for (; r < i; r++) {
            if ((o = arguments[r]) != null) {
                for (u in o) {
                    a = e[u];
                    f = o[u];
                    if (e === f) {
                        continue
                    }
                    if (s && f && (n.isPlainObject(f) || n.isArray(f))) {
                        var l = a && (n.isPlainObject(a) || n.isArray(a)) ? a : n.isArray(f) ? [] : {};
                        e[u] = n.extend(s, l, f)
                    } else if (f !== t) {
                        e[u] = f
                    }
                }
            }
        }
        return e
    };
    n.extend({
        noConflict: function (t) {
            e.$ = i;
            if (t) {
                e.jQuery = r
            }
            return n
        },
        isReady: false,
        ready: function () {
            if (!n.isReady) {
                if (!s.body) {
                    return setTimeout(n.ready, 13)
                }
                n.isReady = true;
                if (v) {
                    var e, t = 0;
                    while (e = v[t++]) {
                        e.call(s, n)
                    }
                    v = null
                }
                if (n.fn.triggerHandler) {
                    n(s).triggerHandler("ready")
                }
            }
        },
        bindReady: function () {
            if (d) {
                return
            }
            d = true;
            if (s.readyState === "complete") {
                return n.ready()
            }
            if (s.addEventListener) {
                s.addEventListener("DOMContentLoaded", m, false);
                e.addEventListener("load", n.ready, false)
            } else if (s.attachEvent) {
                s.attachEvent("onreadystatechange", m);
                e.attachEvent("onload", n.ready);
                var t = false;
                try {
                    t = e.frameElement == null
                } catch (r) {}
                if (s.documentElement.doScroll && t) {
                    S()
                }
            }
        },
        isFunction: function (e) {
            return g.call(e) === "[object Function]"
        },
        isArray: function (e) {
            return g.call(e) === "[object Array]"
        },
        isPlainObject: function (e) {
            if (!e || g.call(e) !== "[object Object]" || e.nodeType || e.setInterval) {
                return false
            }
            if (e.constructor && !y.call(e, "constructor") && !y.call(e.constructor.prototype, "isPrototypeOf")) {
                return false
            }
            var n;
            for (n in e) {}
            return n === t || y.call(e, n)
        },
        isEmptyObject: function (e) {
            for (var t in e) {
                return false
            }
            return true
        },
        error: function (e) {
            throw e
        },
        parseJSON: function (t) {
            if (typeof t !== "string" || !t) {
                return null
            }
            t = n.trim(t);
            if (/^[\],:{}\s]*$/.test(t.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
                return e.JSON && e.JSON.parse ? e.JSON.parse(t) : (new Function("return " + t))()
            } else {
                n.error("Invalid JSON: " + t)
            }
        },
        noop: function () {},
        globalEval: function (e) {
            if (e && f.test(e)) {
                var t = s.getElementsByTagName("head")[0] || s.documentElement,
                    r = s.createElement("script");
                r.type = "text/javascript";
                if (n.support.scriptEval) {
                    r.appendChild(s.createTextNode(e))
                } else {
                    r.text = e
                }
                t.insertBefore(r, t.firstChild);
                t.removeChild(r)
            }
        },
        nodeName: function (e, t) {
            return e.nodeName && e.nodeName.toUpperCase() === t.toUpperCase()
        },
        each: function (e, r, i) {
            var s, o = 0,
                u = e.length,
                a = u === t || n.isFunction(e);
            if (i) {
                if (a) {
                    for (s in e) {
                        if (r.apply(e[s], i) === false) {
                            break
                        }
                    }
                } else {
                    for (; o < u;) {
                        if (r.apply(e[o++], i) === false) {
                            break
                        }
                    }
                }
            } else {
                if (a) {
                    for (s in e) {
                        if (r.call(e[s], s, e[s]) === false) {
                            break
                        }
                    }
                } else {
                    for (var f = e[0]; o < u && r.call(f, o, f) !== false; f = e[++o]) {}
                }
            }
            return e
        },
        trim: function (e) {
            return (e || "").replace(l, "")
        },
        makeArray: function (e, t) {
            var r = t || [];
            if (e != null) {
                if (e.length == null || typeof e === "string" || n.isFunction(e) || typeof e !== "function" && e.setInterval) {
                    b.call(r, e)
                } else {
                    n.merge(r, e)
                }
            }
            return r
        },
        inArray: function (e, t) {
            if (t.indexOf) {
                return t.indexOf(e)
            }
            for (var n = 0, r = t.length; n < r; n++) {
                if (t[n] === e) {
                    return n
                }
            }
            return -1
        },
        merge: function (e, n) {
            var r = e.length,
                i = 0;
            if (typeof n.length === "number") {
                for (var s = n.length; i < s; i++) {
                    e[r++] = n[i]
                }
            } else {
                while (n[i] !== t) {
                    e[r++] = n[i++]
                }
            }
            e.length = r;
            return e
        },
        grep: function (e, t, n) {
            var r = [];
            for (var i = 0, s = e.length; i < s; i++) {
                if (!n !== !t(e[i], i)) {
                    r.push(e[i])
                }
            }
            return r
        },
        map: function (e, t, n) {
            var r = [],
                i;
            for (var s = 0, o = e.length; s < o; s++) {
                i = t(e[s], s, n);
                if (i != null) {
                    r[r.length] = i
                }
            }
            return r.concat.apply([], r)
        },
        guid: 1,
        proxy: function (e, r, i) {
            if (arguments.length === 2) {
                if (typeof r === "string") {
                    i = e;
                    e = i[r];
                    r = t
                } else if (r && !n.isFunction(r)) {
                    i = r;
                    r = t
                }
            }
            if (!r && e) {
                r = function () {
                    return e.apply(i || this, arguments)
                }
            }
            if (e) {
                r.guid = e.guid = e.guid || r.guid || n.guid++
            }
            return r
        },
        uaMatch: function (e) {
            e = e.toLowerCase();
            var t = /(webkit)[ \/]([\w.]+)/.exec(e) || /(opera)(?:.*version)?[ \/]([\w.]+)/.exec(e) || /(msie) ([\w.]+)/.exec(e) || !/compatible/.test(e) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(e) || [];
            return {
                browser: t[1] || "",
                version: t[2] || "0"
            }
        },
        browser: {}
    });
    p = n.uaMatch(h);
    if (p.browser) {
        n.browser[p.browser] = true;
        n.browser.version = p.version
    }
    if (n.browser.webkit) {
        n.browser.safari = true
    }
    if (E) {
        n.inArray = function (e, t) {
            return E.call(t, e)
        }
    }
    o = n(s);
    if (s.addEventListener) {
        m = function () {
            s.removeEventListener("DOMContentLoaded", m, false);
            n.ready()
        }
    } else if (s.attachEvent) {
        m = function () {
            if (s.readyState === "complete") {
                s.detachEvent("onreadystatechange", m);
                n.ready()
            }
        }
    }(function () {
        n.support = {};
        var t = s.documentElement,
            r = s.createElement("script"),
            i = s.createElement("div"),
            o = "script" + N();
        i.style.display = "none";
        i.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
        var u = i.getElementsByTagName("*"),
            a = i.getElementsByTagName("a")[0];
        if (!u || !u.length || !a) {
            return
        }
        n.support = {
            leadingWhitespace: i.firstChild.nodeType === 3,
            tbody: !i.getElementsByTagName("tbody").length,
            htmlSerialize: !!i.getElementsByTagName("link").length,
            style: /red/.test(a.getAttribute("style")),
            hrefNormalized: a.getAttribute("href") === "/a",
            opacity: /^0.55$/.test(a.style.opacity),
            cssFloat: !!a.style.cssFloat,
            checkOn: i.getElementsByTagName("input")[0].value === "on",
            optSelected: s.createElement("select").appendChild(s.createElement("option")).selected,
            parentNode: i.removeChild(i.appendChild(s.createElement("div"))).parentNode === null,
            deleteExpando: true,
            checkClone: false,
            scriptEval: false,
            noCloneEvent: true,
            boxModel: null
        };
        r.type = "text/javascript";
        try {
            r.appendChild(s.createTextNode("window." + o + "=1;"))
        } catch (f) {}
        t.insertBefore(r, t.firstChild);
        if (e[o]) {
            n.support.scriptEval = true;
            delete e[o]
        }
        try {
            delete r.test
        } catch (f) {
            n.support.deleteExpando = false
        }
        t.removeChild(r);
        if (i.attachEvent && i.fireEvent) {
            i.attachEvent("onclick", function h() {
                n.support.noCloneEvent = false;
                i.detachEvent("onclick", h)
            });
            i.cloneNode(true).fireEvent("onclick")
        }
        i = s.createElement("div");
        i.innerHTML = "<input type='radio' name='radiotest' checked='checked'/>";
        var l = s.createDocumentFragment();
        l.appendChild(i.firstChild);
        n.support.checkClone = l.cloneNode(true).cloneNode(true).lastChild.checked;
        n(function () {
            var e = s.createElement("div");
            e.style.width = e.style.paddingLeft = "1px";
            s.body.appendChild(e);
            n.boxModel = n.support.boxModel = e.offsetWidth === 2;
            s.body.removeChild(e).style.display = "none";
            e = null
        });
        var c = function (e) {
            var t = s.createElement("div");
            e = "on" + e;
            var n = e in t;
            if (!n) {
                t.setAttribute(e, "return;");
                n = typeof t[e] === "function"
            }
            t = null;
            return n
        };
        n.support.submitBubbles = c("submit");
        n.support.changeBubbles = c("change");
        t = r = i = u = a = null
    })();
    n.props = {
        "for": "htmlFor",
        "class": "className",
        readonly: "readOnly",
        maxlength: "maxLength",
        cellspacing: "cellSpacing",
        rowspan: "rowSpan",
        colspan: "colSpan",
        tabindex: "tabIndex",
        usemap: "useMap",
        frameborder: "frameBorder"
    };
    var C = "jQuery" + N(),
        k = 0,
        L = {};
    n.extend({
        cache: {},
        expando: C,
        noData: {
            embed: true,
            object: true,
            applet: true
        },
        data: function (r, i, s) {
            if (r.nodeName && n.noData[r.nodeName.toLowerCase()]) {
                return
            }
            r = r == e ? L : r;
            var o = r[C],
                u = n.cache,
                a;
            if (!o && typeof i === "string" && s === t) {
                return null
            }
            if (!o) {
                o = ++k
            }
            if (typeof i === "object") {
                r[C] = o;
                a = u[o] = n.extend(true, {}, i)
            } else if (!u[o]) {
                r[C] = o;
                u[o] = {}
            }
            a = u[o];
            if (s !== t) {
                a[i] = s
            }
            return typeof i === "string" ? a[i] : a
        },
        removeData: function (t, r) {
            if (t.nodeName && n.noData[t.nodeName.toLowerCase()]) {
                return
            }
            t = t == e ? L : t;
            var i = t[C],
                s = n.cache,
                o = s[i];
            if (r) {
                if (o) {
                    delete o[r];
                    if (n.isEmptyObject(o)) {
                        n.removeData(t)
                    }
                }
            } else {
                if (n.support.deleteExpando) {
                    delete t[n.expando]
                } else if (t.removeAttribute) {
                    t.removeAttribute(n.expando)
                }
                delete s[i]
            }
        }
    });
    n.fn.extend({
        data: function (e, r) {
            if (typeof e === "undefined" && this.length) {
                return n.data(this[0])
            } else if (typeof e === "object") {
                return this.each(function () {
                    n.data(this, e)
                })
            }
            var i = e.split(".");
            i[1] = i[1] ? "." + i[1] : "";
            if (r === t) {
                var s = this.triggerHandler("getData" + i[1] + "!", [i[0]]);
                if (s === t && this.length) {
                    s = n.data(this[0], e)
                }
                return s === t && i[1] ? this.data(i[0]) : s
            } else {
                return this.trigger("setData" + i[1] + "!", [i[0], r]).each(function () {
                    n.data(this, e, r)
                })
            }
        },
        removeData: function (e) {
            return this.each(function () {
                n.removeData(this, e)
            })
        }
    });
    n.extend({
        queue: function (e, t, r) {
            if (!e) {
                return
            }
            t = (t || "fx") + "queue";
            var i = n.data(e, t);
            if (!r) {
                return i || []
            }
            if (!i || n.isArray(r)) {
                i = n.data(e, t, n.makeArray(r))
            } else {
                i.push(r)
            }
            return i
        },
        dequeue: function (e, t) {
            t = t || "fx";
            var r = n.queue(e, t),
                i = r.shift();
            if (i === "inprogress") {
                i = r.shift()
            }
            if (i) {
                if (t === "fx") {
                    r.unshift("inprogress")
                }
                i.call(e, function () {
                    n.dequeue(e, t)
                })
            }
        }
    });
    n.fn.extend({
        queue: function (e, r) {
            if (typeof e !== "string") {
                r = e;
                e = "fx"
            }
            if (r === t) {
                return n.queue(this[0], e)
            }
            return this.each(function (t, i) {
                var s = n.queue(this, e, r);
                if (e === "fx" && s[0] !== "inprogress") {
                    n.dequeue(this, e)
                }
            })
        },
        dequeue: function (e) {
            return this.each(function () {
                n.dequeue(this, e)
            })
        },
        delay: function (e, t) {
            e = n.fx ? n.fx.speeds[e] || e : e;
            t = t || "fx";
            return this.queue(t, function () {
                var r = this;
                setTimeout(function () {
                    n.dequeue(r, t)
                }, e)
            })
        },
        clearQueue: function (e) {
            return this.queue(e || "fx", [])
        }
    });
    var A = /[\n\t]/g,
        O = /\s+/,
        M = /\r/g,
        _ = /href|src|style/,
        D = /(button|input)/i,
        P = /(button|input|object|select|textarea)/i,
        H = /^(a|area)$/i,
        B = /radio|checkbox/;
    n.fn.extend({
        attr: function (e, t) {
            return T(this, e, t, true, n.attr)
        },
        removeAttr: function (e, t) {
            return this.each(function () {
                n.attr(this, e, "");
                if (this.nodeType === 1) {
                    this.removeAttribute(e)
                }
            })
        },
        addClass: function (e) {
            if (TVA.device == 'samsung' && TVA.year == '2011')
            {
            	var elemDiv = document.createElement('div');
				document.body.appendChild(elemDiv);
   				elemDiv.parentNode.removeChild(elemDiv);  	
            }
            if (n.isFunction(e)) {
                return this.each(function (t) {
                    var r = n(this);
                    r.addClass(e.call(this, t, r.attr("class")))
                })
            }
            if (e && typeof e === "string") {
                var t = (e || "").split(O);
                for (var r = 0, i = this.length; r < i; r++) {
                    var s = this[r];
                    if (s.nodeType === 1) {
                        if (!s.className) {
                            s.className = e
                        } else {
                            var o = " " + s.className + " ",
                                u = s.className;
                            for (var a = 0, f = t.length; a < f; a++) {
                                if (o.indexOf(" " + t[a] + " ") < 0) {
                                    u += " " + t[a]
                                }
                            }
                            s.className = n.trim(u)
                        }
                    }
                }
            }
            return this
        },
        removeClass: function (e) {
            //n("<div id='maple'/>").appendTo("body").remove();
            if (n.isFunction(e)) {
                return this.each(function (t) {
                    var r = n(this);
                    r.removeClass(e.call(this, t, r.attr("class")))
                })
            }
            if (e && typeof e === "string" || e === t) {
                var r = (e || "").split(O);
                for (var i = 0, s = this.length; i < s; i++) {
                    var o = this[i];
                    if (o.nodeType === 1 && o.className) {
                        if (e) {
                            var u = (" " + o.className + " ").replace(A, " ");
                            for (var a = 0, f = r.length; a < f; a++) {
                                u = u.replace(" " + r[a] + " ", " ")
                            }
                            o.className = n.trim(u)
                        } else {
                            o.className = ""
                        }
                    }
                }
            }
            return this
        },
        toggleClass: function (e, t) {
           // n("<div id='maple'/>").appendTo("body").remove();
            var r = typeof e,
                i = typeof t === "boolean";
            if (n.isFunction(e)) {
                return this.each(function (r) {
                    var i = n(this);
                    i.toggleClass(e.call(this, r, i.attr("class"), t), t)
                })
            }
            return this.each(function () {
                if (r === "string") {
                    var s, o = 0,
                        u = n(this),
                        a = t,
                        f = e.split(O);
                    while (s = f[o++]) {
                        a = i ? a : !u.hasClass(s);
                        u[a ? "addClass" : "removeClass"](s)
                    }
                } else if (r === "undefined" || r === "boolean") {
                    if (this.className) {
                        n.data(this, "__className__", this.className)
                    }
                    this.className = this.className || e === false ? "" : n.data(this, "__className__") || ""
                }
            })
        },
        hasClass: function (e) {
            var t = " " + e + " ";
            for (var n = 0, r = this.length; n < r; n++) {
                if ((" " + this[n].className + " ").replace(A, " ").indexOf(t) > -1) {
                    return true
                }
            }
            return false
        },
        val: function (e) {
            if (e === t) {
                var r = this[0];
                if (r) {
                    if (n.nodeName(r, "option")) {
                        return (r.attributes.value || {}).specified ? r.value : r.text
                    }
                    if (n.nodeName(r, "select")) {
                        var i = r.selectedIndex,
                            s = [],
                            o = r.options,
                            u = r.type === "select-one";
                        if (i < 0) {
                            return null
                        }
                        for (var a = u ? i : 0, f = u ? i + 1 : o.length; a < f; a++) {
                            var l = o[a];
                            if (l.selected) {
                                e = n(l).val();
                                if (u) {
                                    return e
                                }
                                s.push(e)
                            }
                        }
                        return s
                    }
                    if (B.test(r.type) && !n.support.checkOn) {
                        return r.getAttribute("value") === null ? "on" : r.value
                    }
                    return (r.value || "").replace(M, "")
                }
                return t
            }
            var c = n.isFunction(e);
            return this.each(function (t) {
                var r = n(this),
                    i = e;
                if (this.nodeType !== 1) {
                    return
                }
                if (c) {
                    i = e.call(this, t, r.val())
                }
                if (typeof i === "number") {
                    i += ""
                }
                if (n.isArray(i) && B.test(this.type)) {
                    this.checked = n.inArray(r.val(), i) >= 0
                } else if (n.nodeName(this, "select")) {
                    var s = n.makeArray(i);
                    n("option", this).each(function () {
                        this.selected = n.inArray(n(this).val(), s) >= 0
                    });
                    if (!s.length) {
                        this.selectedIndex = -1
                    }
                } else {
                    this.value = i
                }
            })
        }
    });
    n.extend({
        attrFn: {
            val: true,
            css: true,
            html: true,
            text: true,
            data: true,
            width: true,
            height: true,
            offset: true
        },
        attr: function (e, r, i, s) {
            if (!e || e.nodeType === 3 || e.nodeType === 8) {
                return t
            }
            if (s && r in n.attrFn) {
                return n(e)[r](i)
            }
            var o = e.nodeType !== 1 || !n.isXMLDoc(e),
                u = i !== t;
            r = o && n.props[r] || r;
            if (e.nodeType === 1) {
                var a = _.test(r);
                if (r === "selected" && !n.support.optSelected) {
                    var f = e.parentNode;
                    if (f) {
                        f.selectedIndex;
                        if (f.parentNode) {
                            f.parentNode.selectedIndex
                        }
                    }
                }
                if (r in e && o && !a) {
                    if (u) {
                        if (r === "type" && D.test(e.nodeName) && e.parentNode) {
                            n.error("type property can't be changed")
                        }
                        e[r] = i
                    }
                    if (n.nodeName(e, "form") && e.getAttributeNode(r)) {
                        return e.getAttributeNode(r).nodeValue
                    }
                    if (r === "tabIndex") {
                        var l = e.getAttributeNode("tabIndex");
                        return l && l.specified ? l.value : P.test(e.nodeName) || H.test(e.nodeName) && e.href ? 0 : t
                    }
                    return e[r]
                }
                if (!n.support.style && o && r === "style") {
                    if (u) {
                        e.style.cssText = "" + i
                    }
                    return e.style.cssText
                }
                if (u) {
                    e.setAttribute(r, "" + i)
                }
                var c = !n.support.hrefNormalized && o && a ? e.getAttribute(r, 2) : e.getAttribute(r);
                return c === null ? t : c
            }
            return n.style(e, r, i)
        }
    });
    var j = /\.(.*)$/,
        F = function (e) {
            return e.replace(/[^\w\s\.\|`]/g, function (e) {
                return "\\" + e
            })
        };
    n.event = {
        add: function (r, i, s, o) {
            if (r.nodeType === 3 || r.nodeType === 8) {
                return
            }
            if (r.setInterval && r !== e && !r.frameElement) {
                r = e
            }
            var u, a;
            if (s.handler) {
                u = s;
                s = u.handler
            }
            if (!s.guid) {
                s.guid = n.guid++
            }
            var f = n.data(r);
            if (!f) {
                return
            }
            var l = f.events = f.events || {},
                c = f.handle,
                c;
            if (!c) {
                f.handle = c = function () {
                    return typeof n !== "undefined" && !n.event.triggered ? n.event.handle.apply(c.elem, arguments) : t
                }
            }
            c.elem = r;
            i = i.split(" ");
            var h, p = 0,
                d;
            while (h = i[p++]) {
                a = u ? n.extend({}, u) : {
                    handler: s,
                    data: o
                };
                if (h.indexOf(".") > -1) {
                    d = h.split(".");
                    h = d.shift();
                    a.namespace = d.slice(0).sort().join(".")
                } else {
                    d = [];
                    a.namespace = ""
                }
                a.type = h;
                a.guid = s.guid;
                var v = l[h],
                    m = n.event.special[h] || {};
                if (!v) {
                    v = l[h] = [];
                    if (!m.setup || m.setup.call(r, o, d, c) === false) {
                        if (r.addEventListener) {
                            r.addEventListener(h, c, false)
                        } else if (r.attachEvent) {
                            r.attachEvent("on" + h, c)
                        }
                    }
                }
                if (m.add) {
                    m.add.call(r, a);
                    if (!a.handler.guid) {
                        a.handler.guid = s.guid
                    }
                }
                v.push(a);
                n.event.global[h] = true
            }
            r = null
        },
        global: {},
        remove: function (e, t, r, i) {
            if (e.nodeType === 3 || e.nodeType === 8) {
                return
            }
            var s, o, u, a = 0,
                f, l, c, h, p, d, v, m = n.data(e),
                g = m && m.events;
            if (!m || !g) {
                return
            }
            if (t && t.type) {
                r = t.handler;
                t = t.type
            }
            if (!t || typeof t === "string" && t.charAt(0) === ".") {
                t = t || "";
                for (o in g) {
                    n.event.remove(e, o + t)
                }
                return
            }
            t = t.split(" ");
            while (o = t[a++]) {
                v = o;
                d = null;
                f = o.indexOf(".") < 0;
                l = [];
                if (!f) {
                    l = o.split(".");
                    o = l.shift();
                    c = new RegExp("(^|\\.)" + n.map(l.slice(0).sort(), F).join("\\.(?:.*\\.)?") + "(\\.|$)")
                }
                p = g[o];
                if (!p) {
                    continue
                }
                if (!r) {
                    for (var y = 0; y < p.length; y++) {
                        d = p[y];
                        if (f || c.test(d.namespace)) {
                            n.event.remove(e, v, d.handler, y);
                            p.splice(y--, 1)
                        }
                    }
                    continue
                }
                h = n.event.special[o] || {};
                for (var y = i || 0; y < p.length; y++) {
                    d = p[y];
                    if (r.guid === d.guid) {
                        if (f || c.test(d.namespace)) {
                            if (i == null) {
                                p.splice(y--, 1)
                            }
                            if (h.remove) {
                                h.remove.call(e, d)
                            }
                        }
                        if (i != null) {
                            break
                        }
                    }
                }
                if (p.length === 0 || i != null && p.length === 1) {
                    if (!h.teardown || h.teardown.call(e, l) === false) {
                        I(e, o, m.handle)
                    }
                    s = null;
                    delete g[o]
                }
            }
            if (n.isEmptyObject(g)) {
                var b = m.handle;
                if (b) {
                    b.elem = null
                }
                delete m.events;
                delete m.handle;
                if (n.isEmptyObject(m)) {
                    n.removeData(e)
                }
            }
        },
        trigger: function (e, r, i) {
            var s = e.type || e,
                o = arguments[3];
            if (!o) {
                e = typeof e === "object" ? e[C] ? e : n.extend(n.Event(s), e) : n.Event(s);
                if (s.indexOf("!") >= 0) {
                    e.type = s = s.slice(0, -1);
                    e.exclusive = true
                }
                if (!i) {
                    e.stopPropagation();
                    if (n.event.global[s]) {
                        n.each(n.cache, function () {
                            if (this.events && this.events[s]) {
                                n.event.trigger(e, r, this.handle.elem)
                            }
                        })
                    }
                }
                if (!i || i.nodeType === 3 || i.nodeType === 8) {
                    return t
                }
                e.result = t;
                e.target = i;
                r = n.makeArray(r);
                r.unshift(e)
            }
            e.currentTarget = i;
            var u = n.data(i, "handle");
            if (u) {
                u.apply(i, r)
            }
            var a = i.parentNode || i.ownerDocument;
            try {
                if (!(i && i.nodeName && n.noData[i.nodeName.toLowerCase()])) {
                    if (i["on" + s] && i["on" + s].apply(i, r) === false) {
                        e.result = false
                    }
                }
            } catch (f) {}
            if (!e.isPropagationStopped() && a) {
                n.event.trigger(e, r, a, true)
            } else if (!e.isDefaultPrevented()) {
                var l = e.target,
                    c, h = n.nodeName(l, "a") && s === "click",
                    p = n.event.special[s] || {};
                if ((!p._default || p._default.call(i, e) === false) && !h && !(l && l.nodeName && n.noData[l.nodeName.toLowerCase()])) {
                    try {
                        if (l[s]) {
                            c = l["on" + s];
                            if (c) {
                                l["on" + s] = null
                            }
                            n.event.triggered = true;
                            l[s]()
                        }
                    } catch (f) {}
                    if (c) {
                        l["on" + s] = c
                    }
                    n.event.triggered = false
                }
            }
        },
        handle: function (r) {
            var i, s, o, u, a;
            r = arguments[0] = n.event.fix(r || e.event);
            r.currentTarget = this;
            i = r.type.indexOf(".") < 0 && !r.exclusive;
            if (!i) {
                o = r.type.split(".");
                r.type = o.shift();
                u = new RegExp("(^|\\.)" + o.slice(0).sort().join("\\.(?:.*\\.)?") + "(\\.|$)")
            }
            var a = n.data(this, "events"),
                s = a[r.type];
            if (a && s) {
                s = s.slice(0);
                for (var f = 0, l = s.length; f < l; f++) {
                    var c = s[f];
                    if (i || u.test(c.namespace)) {
                        r.handler = c.handler;
                        r.data = c.data;
                        r.handleObj = c;
                        var h = c.handler.apply(this, arguments);
                        if (h !== t) {
                            r.result = h;
                            if (h === false) {
                                r.preventDefault();
                                r.stopPropagation()
                            }
                        }
                        if (r.isImmediatePropagationStopped()) {
                            break
                        }
                    }
                }
            }
            return r.result
        },
        props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),
        fix: function (e) {
            if (e[C]) {
                return e
            }
            var r = e;
            e = n.Event(r);
            for (var i = this.props.length, o; i;) {
                o = this.props[--i];
                e[o] = r[o]
            }
            if (!e.target) {
                e.target = e.srcElement || s
            }
            if (e.target.nodeType === 3) {
                e.target = e.target.parentNode
            }
            if (!e.relatedTarget && e.fromElement) {
                e.relatedTarget = e.fromElement === e.target ? e.toElement : e.fromElement
            }
            if (e.pageX == null && e.clientX != null) {
                var u = s.documentElement,
                    a = s.body;
                e.pageX = e.clientX + (u && u.scrollLeft || a && a.scrollLeft || 0) - (u && u.clientLeft || a && a.clientLeft || 0);
                e.pageY = e.clientY + (u && u.scrollTop || a && a.scrollTop || 0) - (u && u.clientTop || a && a.clientTop || 0)
            }
            if (!e.which && (e.charCode || e.charCode === 0 ? e.charCode : e.keyCode)) {
                e.which = e.charCode || e.keyCode
            }
            if (!e.metaKey && e.ctrlKey) {
                e.metaKey = e.ctrlKey
            }
            if (!e.which && e.button !== t) {
                e.which = e.button & 1 ? 1 : e.button & 2 ? 3 : e.button & 4 ? 2 : 0
            }
            return e
        },
        guid: 1e8,
        proxy: n.proxy,
        special: {
            ready: {
                setup: n.bindReady,
                teardown: n.noop
            },
            live: {
                add: function (e) {
                    n.event.add(this, e.origType, n.extend({}, e, {
                        handler: Q
                    }))
                },
                remove: function (e) {
                    var t = true,
                        r = e.origType.replace(j, "");
                    n.each(n.data(this, "events").live || [], function () {
                        if (r === this.origType.replace(j, "")) {
                            t = false;
                            return false
                        }
                    });
                    if (t) {
                        n.event.remove(this, e.origType, Q)
                    }
                }
            },
            beforeunload: {
                setup: function (e, t, n) {
                    if (this.setInterval) {
                        this.onbeforeunload = n
                    }
                    return false
                },
                teardown: function (e, t) {
                    if (this.onbeforeunload === t) {
                        this.onbeforeunload = null
                    }
                }
            }
        }
    };
    var I = s.removeEventListener ? function (e, t, n) {
        e.removeEventListener(t, n, false)
    } : function (e, t, n) {
        e.detachEvent("on" + t, n)
    };
    n.Event = function (e) {
        if (!this.preventDefault) {
            return new n.Event(e)
        }
        if (e && e.type) {
            this.originalEvent = e;
            this.type = e.type
        } else {
            this.type = e
        }
        this.timeStamp = N();
        this[C] = true
    };
    n.Event.prototype = {
        preventDefault: function () {
            this.isDefaultPrevented = R;
            var e = this.originalEvent;
            if (!e) {
                return
            }
            if (e.preventDefault) {
                e.preventDefault()
            }
            e.returnValue = false
        },
        stopPropagation: function () {
            this.isPropagationStopped = R;
            var e = this.originalEvent;
            if (!e) {
                return
            }
            if (e.stopPropagation) {
                e.stopPropagation()
            }
            e.cancelBubble = true
        },
        stopImmediatePropagation: function () {
            this.isImmediatePropagationStopped = R;
            this.stopPropagation()
        },
        isDefaultPrevented: q,
        isPropagationStopped: q,
        isImmediatePropagationStopped: q
    };
    var U = function (e) {
            var t = e.relatedTarget;
            try {
                while (t && t !== this) {
                    t = t.parentNode
                }
                if (t !== this) {
                    e.type = e.data;
                    n.event.handle.apply(this, arguments)
                }
            } catch (r) {}
        },
        z = function (e) {
            e.type = e.data;
            n.event.handle.apply(this, arguments)
        };
    n.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function (e, t) {
        n.event.special[e] = {
            setup: function (r) {
                n.event.add(this, t, r && r.selector ? z : U, e)
            },
            teardown: function (e) {
                n.event.remove(this, t, e && e.selector ? z : U)
            }
        }
    });
    if (!n.support.submitBubbles) {
        n.event.special.submit = {
            setup: function (e, t) {
                if (this.nodeName.toLowerCase() !== "form") {
                    n.event.add(this, "click.specialSubmit", function (e) {
                        var t = e.target,
                            r = t.type;
                        if ((r === "submit" || r === "image") && n(t).closest("form").length) {
                            return J("submit", this, arguments)
                        }
                    });
                    n.event.add(this, "keypress.specialSubmit", function (e) {
                        var t = e.target,
                            r = t.type;
                        if ((r === "text" || r === "password") && n(t).closest("form").length && e.keyCode === 13) {
                            return J("submit", this, arguments)
                        }
                    })
                } else {
                    return false
                }
            },
            teardown: function (e) {
                n.event.remove(this, ".specialSubmit")
            }
        }
    }
    if (!n.support.changeBubbles) {
        var W = /textarea|input|select/i,
            X, V = function (e) {
                var t = e.type,
                    r = e.value;
                if (t === "radio" || t === "checkbox") {
                    r = e.checked
                } else if (t === "select-multiple") {
                    r = e.selectedIndex > -1 ? n.map(e.options, function (e) {
                        return e.selected
                    }).join("-") : ""
                } else if (e.nodeName.toLowerCase() === "select") {
                    r = e.selectedIndex
                }
                return r
            },
            $ = function (r) {
                var i = r.target,
                    s, o;
                if (!W.test(i.nodeName) || i.readOnly) {
                    return
                }
                s = n.data(i, "_change_data");
                o = V(i);
                if (r.type !== "focusout" || i.type !== "radio") {
                    n.data(i, "_change_data", o)
                }
                if (s === t || o === s) {
                    return
                }
                if (s != null || o) {
                    r.type = "change";
                    return n.event.trigger(r, arguments[1], i)
                }
            };
        n.event.special.change = {
            filters: {
                focusout: $,
                click: function (e) {
                    var t = e.target,
                        n = t.type;
                    if (n === "radio" || n === "checkbox" || t.nodeName.toLowerCase() === "select") {
                        return $.call(this, e)
                    }
                },
                keydown: function (e) {
                    var t = e.target,
                        n = t.type;
                    if (e.keyCode === 13 && t.nodeName.toLowerCase() !== "textarea" || e.keyCode === 32 && (n === "checkbox" || n === "radio") || n === "select-multiple") {
                        return $.call(this, e)
                    }
                },
                beforeactivate: function (e) {
                    var t = e.target;
                    n.data(t, "_change_data", V(t))
                }
            },
            setup: function (e, t) {
                if (this.type === "file") {
                    return false
                }
                for (var r in X) {
                    n.event.add(this, r + ".specialChange", X[r])
                }
                return W.test(this.nodeName)
            },
            teardown: function (e) {
                n.event.remove(this, ".specialChange");
                return W.test(this.nodeName)
            }
        };
        X = n.event.special.change.filters
    }
    if (s.addEventListener) {
        n.each({
            focus: "focusin",
            blur: "focusout"
        }, function (e, t) {
            function r(e) {
                e = n.event.fix(e);
                e.type = t;
                return n.event.handle.call(this, e)
            }
            n.event.special[t] = {
                setup: function () {
                    this.addEventListener(e, r, true)
                },
                teardown: function () {
                    this.removeEventListener(e, r, true)
                }
            }
        })
    }
    n.each(["bind", "one"], function (e, r) {
        n.fn[r] = function (e, i, s) {
            if (typeof e === "object") {
                for (var o in e) {
                    this[r](o, i, e[o], s)
                }
                return this
            }
            if (n.isFunction(i)) {
                s = i;
                i = t
            }
            var u = r === "one" ? n.proxy(s, function (e) {
                n(this).unbind(e, u);
                return s.apply(this, arguments)
            }) : s;
            if (e === "unload" && r !== "one") {
                this.one(e, i, s)
            } else {
                for (var a = 0, f = this.length; a < f; a++) {
                    n.event.add(this[a], e, u, i)
                }
            }
            return this
        }
    });
    n.fn.extend({
        unbind: function (e, t) {
            if (typeof e === "object" && !e.preventDefault) {
                for (var r in e) {
                    this.unbind(r, e[r])
                }
            } else {
                for (var i = 0, s = this.length; i < s; i++) {
                    n.event.remove(this[i], e, t)
                }
            }
            return this
        },
        delegate: function (e, t, n, r) {
            return this.live(t, n, r, e)
        },
        undelegate: function (e, t, n) {
            if (arguments.length === 0) {
                return this.unbind("live")
            } else {
                return this.die(t, null, n, e)
            }
        },
        trigger: function (e, t) {
            return this.each(function () {
                n.event.trigger(e, t, this)
            })
        },
        triggerHandler: function (e, t) {
            if (this[0]) {
                var r = n.Event(e);
                r.preventDefault();
                r.stopPropagation();
                n.event.trigger(r, t, this[0]);
                return r.result
            }
        },
        toggle: function (e) {
            var t = arguments,
                r = 1;
            while (r < t.length) {
                n.proxy(e, t[r++])
            }
            return this.click(n.proxy(e, function (i) {
                var s = (n.data(this, "lastToggle" + e.guid) || 0) % r;
                n.data(this, "lastToggle" + e.guid, s + 1);
                i.preventDefault();
                return t[s].apply(this, arguments) || false
            }))
        },
        hover: function (e, t) {
            return this.mouseenter(e).mouseleave(t || e)
        }
    });
    var K = {
        focus: "focusin",
        blur: "focusout",
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    };
    n.each(["live", "die"], function (e, r) {
        n.fn[r] = function (e, i, s, o) {
            var u, a = 0,
                f, l, c, h = o || this.selector,
                p = o ? this : n(this.context);
            if (n.isFunction(i)) {
                s = i;
                i = t
            }
            e = (e || "").split(" ");
            while ((u = e[a++]) != null) {
                f = j.exec(u);
                l = "";
                if (f) {
                    l = f[0];
                    u = u.replace(j, "")
                }
                if (u === "hover") {
                    e.push("mouseenter" + l, "mouseleave" + l);
                    continue
                }
                c = u;
                if (u === "focus" || u === "blur") {
                    e.push(K[u] + l);
                    u = u + l
                } else {
                    u = (K[u] || u) + l
                } if (r === "live") {
                    p.each(function () {
                        n.event.add(this, G(u, h), {
                            data: i,
                            selector: h,
                            handler: s,
                            origType: u,
                            origHandler: s,
                            preType: c
                        })
                    })
                } else {
                    p.unbind(G(u, h), s)
                }
            }
            return this
        }
    });
    n.each(("blur focus focusin focusout load resize scroll unload click dblclick " + "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " + "change select submit keydown keypress keyup error").split(" "), function (e, t) {
        n.fn[t] = function (e) {
            return e ? this.bind(t, e) : this.trigger(t)
        };
        if (n.attrFn) {
            n.attrFn[t] = true
        }
    });
    if (e.attachEvent && !e.addEventListener) {
        e.attachEvent("onunload", function () {
            for (var e in n.cache) {
                if (n.cache[e].handle) {
                    try {
                        n.event.remove(n.cache[e].handle.elem)
                    } catch (t) {}
                }
            }
        })
    }(function () {
        function m(e) {
            var t = "",
                n;
            for (var r = 0; e[r]; r++) {
                n = e[r];
                if (n.nodeType === 3 || n.nodeType === 4) {
                    t += n.nodeValue
                } else if (n.nodeType !== 8) {
                    t += m(n.childNodes)
                }
            }
            return t
        }

        function g(e, t, n, r, i, s) {
            for (var o = 0, u = r.length; o < u; o++) {
                var a = r[o];
                if (a) {
                    a = a[e];
                    var f = false;
                    while (a) {
                        if (a.sizcache === n) {
                            f = r[a.sizset];
                            break
                        }
                        if (a.nodeType === 1 && !s) {
                            a.sizcache = n;
                            a.sizset = o
                        }
                        if (a.nodeName.toLowerCase() === t) {
                            f = a;
                            break
                        }
                        a = a[e]
                    }
                    r[o] = f
                }
            }
        }

        function y(e, t, n, r, i, s) {
            for (var o = 0, u = r.length; o < u; o++) {
                var a = r[o];
                if (a) {
                    a = a[e];
                    var l = false;
                    while (a) {
                        if (a.sizcache === n) {
                            l = r[a.sizset];
                            break
                        }
                        if (a.nodeType === 1) {
                            if (!s) {
                                a.sizcache = n;
                                a.sizset = o
                            }
                            if (typeof t !== "string") {
                                if (a === t) {
                                    l = true;
                                    break
                                }
                            } else if (f.filter(t, [a]).length > 0) {
                                l = a;
                                break
                            }
                        }
                        a = a[e]
                    }
                    r[o] = l
                }
            }
        }
        var r = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
            i = 0,
            o = Object.prototype.toString,
            u = false,
            a = true;
        [0, 0].sort(function () {
            a = false;
            return 0
        });
        var f = function (e, t, n, i) {
            n = n || [];
            var u = t = t || s;
            if (t.nodeType !== 1 && t.nodeType !== 9) {
                return []
            }
            if (!e || typeof e !== "string") {
                return n
            }
            var a = [],
                h, d, v, m, g = true,
                y = w(t),
                S = e;
            while ((r.exec(""), h = r.exec(S)) !== null) {
                S = h[3];
                a.push(h[1]);
                if (h[2]) {
                    m = h[3];
                    break
                }
            }
            if (a.length > 1 && c.exec(e)) {
                if (a.length === 2 && l.relative[a[0]]) {
                    d = E(a[0] + a[1], t)
                } else {
                    d = l.relative[a[0]] ? [t] : f(a.shift(), t);
                    while (a.length) {
                        e = a.shift();
                        if (l.relative[e]) {
                            e += a.shift()
                        }
                        d = E(e, d)
                    }
                }
            } else {
                if (!i && a.length > 1 && t.nodeType === 9 && !y && l.match.ID.test(a[0]) && !l.match.ID.test(a[a.length - 1])) {
                    var x = f.find(a.shift(), t, y);
                    t = x.expr ? f.filter(x.expr, x.set)[0] : x.set[0]
                }
                if (t) {
                    var x = i ? {
                        expr: a.pop(),
                        set: p(i)
                    } : f.find(a.pop(), a.length === 1 && (a[0] === "~" || a[0] === "+") && t.parentNode ? t.parentNode : t, y);
                    d = x.expr ? f.filter(x.expr, x.set) : x.set;
                    if (a.length > 0) {
                        v = p(d)
                    } else {
                        g = false
                    }
                    while (a.length) {
                        var T = a.pop(),
                            N = T;
                        if (!l.relative[T]) {
                            T = ""
                        } else {
                            N = a.pop()
                        } if (N == null) {
                            N = t
                        }
                        l.relative[T](v, N, y)
                    }
                } else {
                    v = a = []
                }
            } if (!v) {
                v = d
            }
            if (!v) {
                f.error(T || e)
            }
            if (o.call(v) === "[object Array]") {
                if (!g) {
                    n.push.apply(n, v)
                } else if (t && t.nodeType === 1) {
                    for (var C = 0; v[C] != null; C++) {
                        if (v[C] && (v[C] === true || v[C].nodeType === 1 && b(t, v[C]))) {
                            n.push(d[C])
                        }
                    }
                } else {
                    for (var C = 0; v[C] != null; C++) {
                        if (v[C] && v[C].nodeType === 1) {
                            n.push(d[C])
                        }
                    }
                }
            } else {
                p(v, n)
            } if (m) {
                f(m, u, n, i);
                f.uniqueSort(n)
            }
            return n
        };
        f.uniqueSort = function (e) {
            if (v) {
                u = a;
                e.sort(v);
                if (u) {
                    for (var t = 1; t < e.length; t++) {
                        if (e[t] === e[t - 1]) {
                            e.splice(t--, 1)
                        }
                    }
                }
            }
            return e
        };
        f.matches = function (e, t) {
            return f(e, null, null, t)
        };
        f.find = function (e, t, n) {
            var r, i;
            if (!e) {
                return []
            }
            for (var s = 0, o = l.order.length; s < o; s++) {
                var u = l.order[s],
                    i;
                if (i = l.leftMatch[u].exec(e)) {
                    var a = i[1];
                    i.splice(1, 1);
                    if (a.substr(a.length - 1) !== "\\") {
                        i[1] = (i[1] || "").replace(/\\/g, "");
                        r = l.find[u](i, t, n);
                        if (r != null) {
                            e = e.replace(l.match[u], "");
                            break
                        }
                    }
                }
            }
            if (!r) {
                r = t.getElementsByTagName("*")
            }
            return {
                set: r,
                expr: e
            }
        };
        f.filter = function (e, n, r, i) {
            var s = e,
                o = [],
                u = n,
                a, c, h = n && n[0] && w(n[0]);
            while (e && n.length) {
                for (var p in l.filter) {
                    if ((a = l.leftMatch[p].exec(e)) != null && a[2]) {
                        var d = l.filter[p],
                            v, m, g = a[1];
                        c = false;
                        a.splice(1, 1);
                        if (g.substr(g.length - 1) === "\\") {
                            continue
                        }
                        if (u === o) {
                            o = []
                        }
                        if (l.preFilter[p]) {
                            a = l.preFilter[p](a, u, r, o, i, h);
                            if (!a) {
                                c = v = true
                            } else if (a === true) {
                                continue
                            }
                        }
                        if (a) {
                            for (var y = 0;
                                (m = u[y]) != null; y++) {
                                if (m) {
                                    v = d(m, a, y, u);
                                    var b = i ^ !!v;
                                    if (r && v != null) {
                                        if (b) {
                                            c = true
                                        } else {
                                            u[y] = false
                                        }
                                    } else if (b) {
                                        o.push(m);
                                        c = true
                                    }
                                }
                            }
                        }
                        if (v !== t) {
                            if (!r) {
                                u = o
                            }
                            e = e.replace(l.match[p], "");
                            if (!c) {
                                return []
                            }
                            break
                        }
                    }
                }
                if (e === s) {
                    if (c == null) {
                        f.error(e)
                    } else {
                        break
                    }
                }
                s = e
            }
            return u
        };
        f.error = function (e) {
            throw "Syntax error, unrecognized expression: " + e
        };
        var l = f.selectors = {
            order: ["ID", "NAME", "TAG"],
            match: {
                ID: /#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
                CLASS: /\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
                NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF-]|\\.)+)['"]*\]/,
                ATTR: /\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
                TAG: /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,
                CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
                POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
                PSEUDO: /:((?:[\w\u00c0-\uFFFF-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
            },
            leftMatch: {},
            attrMap: {
                "class": "className",
                "for": "htmlFor"
            },
            attrHandle: {
                href: function (e) {
                    return e.getAttribute("href")
                }
            },
            relative: {
                "+": function (e, t) {
                    var n = typeof t === "string",
                        r = n && !/\W/.test(t),
                        i = n && !r;
                    if (r) {
                        t = t.toLowerCase()
                    }
                    for (var s = 0, o = e.length, u; s < o; s++) {
                        if (u = e[s]) {
                            while ((u = u.previousSibling) && u.nodeType !== 1) {}
                            e[s] = i || u && u.nodeName.toLowerCase() === t ? u || false : u === t
                        }
                    }
                    if (i) {
                        f.filter(t, e, true)
                    }
                },
                ">": function (e, t) {
                    var n = typeof t === "string";
                    if (n && !/\W/.test(t)) {
                        t = t.toLowerCase();
                        for (var r = 0, i = e.length; r < i; r++) {
                            var s = e[r];
                            if (s) {
                                var o = s.parentNode;
                                e[r] = o.nodeName.toLowerCase() === t ? o : false
                            }
                        }
                    } else {
                        for (var r = 0, i = e.length; r < i; r++) {
                            var s = e[r];
                            if (s) {
                                e[r] = n ? s.parentNode : s.parentNode === t
                            }
                        }
                        if (n) {
                            f.filter(t, e, true)
                        }
                    }
                },
                "": function (e, t, n) {
                    var r = i++,
                        s = y;
                    if (typeof t === "string" && !/\W/.test(t)) {
                        var o = t = t.toLowerCase();
                        s = g
                    }
                    s("parentNode", t, r, e, o, n)
                },
                "~": function (e, t, n) {
                    var r = i++,
                        s = y;
                    if (typeof t === "string" && !/\W/.test(t)) {
                        var o = t = t.toLowerCase();
                        s = g
                    }
                    s("previousSibling", t, r, e, o, n)
                }
            },
            find: {
                ID: function (e, t, n) {
                    if (typeof t.getElementById !== "undefined" && !n) {
                        var r = t.getElementById(e[1]);
                        return r ? [r] : []
                    }
                },
                NAME: function (e, t) {
                    if (typeof t.getElementsByName !== "undefined") {
                        var n = [],
                            r = t.getElementsByName(e[1]);
                        for (var i = 0, s = r.length; i < s; i++) {
                            if (r[i].getAttribute("name") === e[1]) {
                                n.push(r[i])
                            }
                        }
                        return n.length === 0 ? null : n
                    }
                },
                TAG: function (e, t) {
                    return t.getElementsByTagName(e[1])
                }
            },
            preFilter: {
                CLASS: function (e, t, n, r, i, s) {
                    e = " " + e[1].replace(/\\/g, "") + " ";
                    if (s) {
                        return e
                    }
                    for (var o = 0, u;
                        (u = t[o]) != null; o++) {
                        if (u) {
                            if (i ^ (u.className && (" " + u.className + " ").replace(/[\t\n]/g, " ").indexOf(e) >= 0)) {
                                if (!n) {
                                    r.push(u)
                                }
                            } else if (n) {
                                t[o] = false
                            }
                        }
                    }
                    return false
                },
                ID: function (e) {
                    return e[1].replace(/\\/g, "")
                },
                TAG: function (e, t) {
                    return e[1].toLowerCase()
                },
                CHILD: function (e) {
                    if (e[1] === "nth") {
                        var t = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(e[2] === "even" && "2n" || e[2] === "odd" && "2n+1" || !/\D/.test(e[2]) && "0n+" + e[2] || e[2]);
                        e[2] = t[1] + (t[2] || 1) - 0;
                        e[3] = t[3] - 0
                    }
                    e[0] = i++;
                    return e
                },
                ATTR: function (e, t, n, r, i, s) {
                    var o = e[1].replace(/\\/g, "");
                    if (!s && l.attrMap[o]) {
                        e[1] = l.attrMap[o]
                    }
                    if (e[2] === "~=") {
                        e[4] = " " + e[4] + " "
                    }
                    return e
                },
                PSEUDO: function (e, t, n, i, s) {
                    if (e[1] === "not") {
                        if ((r.exec(e[3]) || "").length > 1 || /^\w/.test(e[3])) {
                            e[3] = f(e[3], null, null, t)
                        } else {
                            var o = f.filter(e[3], t, n, true ^ s);
                            if (!n) {
                                i.push.apply(i, o)
                            }
                            return false
                        }
                    } else if (l.match.POS.test(e[0]) || l.match.CHILD.test(e[0])) {
                        return true
                    }
                    return e
                },
                POS: function (e) {
                    e.unshift(true);
                    return e
                }
            },
            filters: {
                enabled: function (e) {
                    return e.disabled === false && e.type !== "hidden"
                },
                disabled: function (e) {
                    return e.disabled === true
                },
                checked: function (e) {
                    return e.checked === true
                },
                selected: function (e) {
                    e.parentNode.selectedIndex;
                    return e.selected === true
                },
                parent: function (e) {
                    return !!e.firstChild
                },
                empty: function (e) {
                    return !e.firstChild
                },
                has: function (e, t, n) {
                    return !!f(n[3], e).length
                },
                header: function (e) {
                    return /h\d/i.test(e.nodeName)
                },
                text: function (e) {
                    return "text" === e.type
                },
                radio: function (e) {
                    return "radio" === e.type
                },
                checkbox: function (e) {
                    return "checkbox" === e.type
                },
                file: function (e) {
                    return "file" === e.type
                },
                password: function (e) {
                    return "password" === e.type
                },
                submit: function (e) {
                    return "submit" === e.type
                },
                image: function (e) {
                    return "image" === e.type
                },
                reset: function (e) {
                    return "reset" === e.type
                },
                button: function (e) {
                    return "button" === e.type || e.nodeName.toLowerCase() === "button"
                },
                input: function (e) {
                    return /input|select|textarea|button/i.test(e.nodeName)
                }
            },
            setFilters: {
                first: function (e, t) {
                    return t === 0
                },
                last: function (e, t, n, r) {
                    return t === r.length - 1
                },
                even: function (e, t) {
                    return t % 2 === 0
                },
                odd: function (e, t) {
                    return t % 2 === 1
                },
                lt: function (e, t, n) {
                    return t < n[3] - 0
                },
                gt: function (e, t, n) {
                    return t > n[3] - 0
                },
                nth: function (e, t, n) {
                    return n[3] - 0 === t
                },
                eq: function (e, t, n) {
                    return n[3] - 0 === t
                }
            },
            filter: {
                PSEUDO: function (e, t, n, r) {
                    var i = t[1],
                        s = l.filters[i];
                    if (s) {
                        return s(e, n, t, r)
                    } else if (i === "contains") {
                        return (e.textContent || e.innerText || m([e]) || "").indexOf(t[3]) >= 0
                    } else if (i === "not") {
                        var o = t[3];
                        for (var n = 0, u = o.length; n < u; n++) {
                            if (o[n] === e) {
                                return false
                            }
                        }
                        return true
                    } else {
                        f.error("Syntax error, unrecognized expression: " + i)
                    }
                },
                CHILD: function (e, t) {
                    var n = t[1],
                        r = e;
                    switch (n) {
                    case "only":
                    case "first":
                        while (r = r.previousSibling) {
                            if (r.nodeType === 1) {
                                return false
                            }
                        }
                        if (n === "first") {
                            return true
                        }
                        r = e;
                    case "last":
                        while (r = r.nextSibling) {
                            if (r.nodeType === 1) {
                                return false
                            }
                        }
                        return true;
                    case "nth":
                        var i = t[2],
                            s = t[3];
                        if (i === 1 && s === 0) {
                            return true
                        }
                        var o = t[0],
                            u = e.parentNode;
                        if (u && (u.sizcache !== o || !e.nodeIndex)) {
                            var a = 0;
                            for (r = u.firstChild; r; r = r.nextSibling) {
                                if (r.nodeType === 1) {
                                    r.nodeIndex = ++a
                                }
                            }
                            u.sizcache = o
                        }
                        var f = e.nodeIndex - s;
                        if (i === 0) {
                            return f === 0
                        } else {
                            return f % i === 0 && f / i >= 0
                        }
                    }
                },
                ID: function (e, t) {
                    return e.nodeType === 1 && e.getAttribute("id") === t
                },
                TAG: function (e, t) {
                    return t === "*" && e.nodeType === 1 || e.nodeName.toLowerCase() === t
                },
                CLASS: function (e, t) {
                    return (" " + (e.className || e.getAttribute("class")) + " ").indexOf(t) > -1
                },
                ATTR: function (e, t) {
                    var n = t[1],
                        r = l.attrHandle[n] ? l.attrHandle[n](e) : e[n] != null ? e[n] : e.getAttribute(n),
                        i = r + "",
                        s = t[2],
                        o = t[4];
                    return r == null ? s === "!=" : s === "=" ? i === o : s === "*=" ? i.indexOf(o) >= 0 : s === "~=" ? (" " + i + " ").indexOf(o) >= 0 : !o ? i && r !== false : s === "!=" ? i !== o : s === "^=" ? i.indexOf(o) === 0 : s === "$=" ? i.substr(i.length - o.length) === o : s === "|=" ? i === o || i.substr(0, o.length + 1) === o + "-" : false
                },
                POS: function (e, t, n, r) {
                    var i = t[2],
                        s = l.setFilters[i];
                    if (s) {
                        return s(e, n, t, r)
                    }
                }
            }
        };
        var c = l.match.POS;
        for (var h in l.match) {
            l.match[h] = new RegExp(l.match[h].source + /(?![^\[]*\])(?![^\(]*\))/.source);
            l.leftMatch[h] = new RegExp(/(^(?:.|\r|\n)*?)/.source + l.match[h].source.replace(/\\(\d+)/g, function (e, t) {
                return "\\" + (t - 0 + 1)
            }))
        }
        var p = function (e, t) {
            e = Array.prototype.slice.call(e, 0);
            if (t) {
                t.push.apply(t, e);
                return t
            }
            return e
        };
        try {
            Array.prototype.slice.call(s.documentElement.childNodes, 0)[0].nodeType
        } catch (d) {
            p = function (e, t) {
                var n = t || [];
                if (o.call(e) === "[object Array]") {
                    Array.prototype.push.apply(n, e)
                } else {
                    if (typeof e.length === "number") {
                        for (var r = 0, i = e.length; r < i; r++) {
                            n.push(e[r])
                        }
                    } else {
                        for (var r = 0; e[r]; r++) {
                            n.push(e[r])
                        }
                    }
                }
                return n
            }
        }
        var v;
        if (s.documentElement.compareDocumentPosition) {
            v = function (e, t) {
                if (!e.compareDocumentPosition || !t.compareDocumentPosition) {
                    if (e == t) {
                        u = true
                    }
                    return e.compareDocumentPosition ? -1 : 1
                }
                var n = e.compareDocumentPosition(t) & 4 ? -1 : e === t ? 0 : 1;
                if (n === 0) {
                    u = true
                }
                return n
            }
        } else if ("sourceIndex" in s.documentElement) {
            v = function (e, t) {
                if (!e.sourceIndex || !t.sourceIndex) {
                    if (e == t) {
                        u = true
                    }
                    return e.sourceIndex ? -1 : 1
                }
                var n = e.sourceIndex - t.sourceIndex;
                if (n === 0) {
                    u = true
                }
                return n
            }
        } else if (s.createRange) {
            v = function (e, t) {
                if (!e.ownerDocument || !t.ownerDocument) {
                    if (e == t) {
                        u = true
                    }
                    return e.ownerDocument ? -1 : 1
                }
                var n = e.ownerDocument.createRange(),
                    r = t.ownerDocument.createRange();
                n.setStart(e, 0);
                n.setEnd(e, 0);
                r.setStart(t, 0);
                r.setEnd(t, 0);
                var i = n.compareBoundaryPoints(Range.START_TO_END, r);
                if (i === 0) {
                    u = true
                }
                return i
            }
        }(function () {
            var e = s.createElement("div"),
                n = "script" + (new Date).getTime();
            e.innerHTML = "<a name='" + n + "'/>";
            var r = s.documentElement;
            r.insertBefore(e, r.firstChild);
            if (s.getElementById(n)) {
                l.find.ID = function (e, n, r) {
                    if (typeof n.getElementById !== "undefined" && !r) {
                        var i = n.getElementById(e[1]);
                        return i ? i.id === e[1] || typeof i.getAttributeNode !== "undefined" && i.getAttributeNode("id").nodeValue === e[1] ? [i] : t : []
                    }
                };
                l.filter.ID = function (e, t) {
                    var n = typeof e.getAttributeNode !== "undefined" && e.getAttributeNode("id");
                    return e.nodeType === 1 && n && n.nodeValue === t
                }
            }
            r.removeChild(e);
            r = e = null
        })();
        (function () {
            var e = s.createElement("div");
            e.appendChild(s.createComment(""));
            if (e.getElementsByTagName("*").length > 0) {
                l.find.TAG = function (e, t) {
                    var n = t.getElementsByTagName(e[1]);
                    if (e[1] === "*") {
                        var r = [];
                        for (var i = 0; n[i]; i++) {
                            if (n[i].nodeType === 1) {
                                r.push(n[i])
                            }
                        }
                        n = r
                    }
                    return n
                }
            }
            e.innerHTML = "<a href='#'></a>";
            if (e.firstChild && typeof e.firstChild.getAttribute !== "undefined" && e.firstChild.getAttribute("href") !== "#") {
                l.attrHandle.href = function (e) {
                    return e.getAttribute("href", 2)
                }
            }
            e = null
        })();
        if (s.querySelectorAll) {
            (function () {
                var e = f,
                    t = s.createElement("div");
                t.innerHTML = "<p class='TEST'></p>";
                if (t.querySelectorAll && t.querySelectorAll(".TEST").length === 0) {
                    return
                }
                f = function (t, n, r, i) {
                    n = n || s;
                    if (!i && n.nodeType === 9 && !w(n)) {
                        try {
                            return p(n.querySelectorAll(t), r)
                        } catch (o) {}
                    }
                    return e(t, n, r, i)
                };
                for (var n in e) {
                    f[n] = e[n]
                }
                t = null
            })()
        }(function () {
            var e = s.createElement("div");
            e.innerHTML = "<div class='test e'></div><div class='test'></div>";
            if (!e.getElementsByClassName || e.getElementsByClassName("e").length === 0) {
                return
            }
            e.lastChild.className = "e";
            if (e.getElementsByClassName("e").length === 1) {
                return
            }
            l.order.splice(1, 0, "CLASS");
            l.find.CLASS = function (e, t, n) {
                if (typeof t.getElementsByClassName !== "undefined" && !n) {
                    return t.getElementsByClassName(e[1])
                }
            };
            e = null
        })();
        var b = s.compareDocumentPosition ? function (e, t) {
            return !!(e.compareDocumentPosition(t) & 16)
        } : function (e, t) {
            return e !== t && (e.contains ? e.contains(t) : true)
        };
        var w = function (e) {
            var t = (e ? e.ownerDocument || e : 0).documentElement;
            return t ? t.nodeName !== "HTML" : false
        };
        var E = function (e, t) {
            var n = [],
                r = "",
                i, s = t.nodeType ? [t] : t;
            while (i = l.match.PSEUDO.exec(e)) {
                r += i[0];
                e = e.replace(l.match.PSEUDO, "")
            }
            e = l.relative[e] ? e + "*" : e;
            for (var o = 0, u = s.length; o < u; o++) {
                f(e, s[o], n)
            }
            return f.filter(r, n)
        };
        n.find = f;
        n.expr = f.selectors;
        n.expr[":"] = n.expr.filters;
        n.unique = f.uniqueSort;
        n.text = m;
        n.isXMLDoc = w;
        n.contains = b;
        return;
        e.Sizzle = f
    })();
    var Y = /Until$/,
        Z = /^(?:parents|prevUntil|prevAll)/,
        et = /,/,
        w = Array.prototype.slice;
    var tt = function (e, t, r) {
        if (n.isFunction(t)) {
            return n.grep(e, function (e, n) {
                return !!t.call(e, n, e) === r
            })
        } else if (t.nodeType) {
            return n.grep(e, function (e, n) {
                return e === t === r
            })
        } else if (typeof t === "string") {
            var i = n.grep(e, function (e) {
                return e.nodeType === 1
            });
            if (a.test(t)) {
                return n.filter(t, i, !r)
            } else {
                t = n.filter(t, i)
            }
        }
        return n.grep(e, function (e, i) {
            return n.inArray(e, t) >= 0 === r
        })
    };
    n.fn.extend({
        find: function (e) {
            var t = this.pushStack("", "find", e),
                r = 0;
            for (var i = 0, s = this.length; i < s; i++) {
                r = t.length;
                n.find(e, this[i], t);
                if (i > 0) {
                    for (var o = r; o < t.length; o++) {
                        for (var u = 0; u < r; u++) {
                            if (t[u] === t[o]) {
                                t.splice(o--, 1);
                                break
                            }
                        }
                    }
                }
            }
            return t
        },
        has: function (e) {
            var t = n(e);
            return this.filter(function () {
                for (var e = 0, r = t.length; e < r; e++) {
                    if (n.contains(this, t[e])) {
                        return true
                    }
                }
            })
        },
        not: function (e) {
            return this.pushStack(tt(this, e, false), "not", e)
        },
        filter: function (e) {
            return this.pushStack(tt(this, e, true), "filter", e)
        },
        is: function (e) {
            return !!e && n.filter(e, this).length > 0
        },
        closest: function (e, t) {
            if (n.isArray(e)) {
                var r = [],
                    i = this[0],
                    s, o = {},
                    u;
                if (i && e.length) {
                    for (var a = 0, f = e.length; a < f; a++) {
                        u = e[a];
                        if (!o[u]) {
                            o[u] = n.expr.match.POS.test(u) ? n(u, t || this.context) : u
                        }
                    }
                    while (i && i.ownerDocument && i !== t) {
                        for (u in o) {
                            s = o[u];
                            if (s.jquery ? s.index(i) > -1 : n(i).is(s)) {
                                r.push({
                                    selector: u,
                                    elem: i
                                });
                                delete o[u]
                            }
                        }
                        i = i.parentNode
                    }
                }
                return r
            }
            var l = n.expr.match.POS.test(e) ? n(e, t || this.context) : null;
            return this.map(function (r, i) {
                while (i && i.ownerDocument && i !== t) {
                    if (l ? l.index(i) > -1 : n(i).is(e)) {
                        return i
                    }
                    i = i.parentNode
                }
                return null
            })
        },
        index: function (e) {
            if (!e || typeof e === "string") {
                return n.inArray(this[0], e ? n(e) : this.parent().children())
            }
            return n.inArray(e.jquery ? e[0] : e, this)
        },
        add: function (e, t) {
            var r = typeof e === "string" ? n(e, t || this.context) : n.makeArray(e),
                i = n.merge(this.get(), r);
            return this.pushStack(nt(r[0]) || nt(i[0]) ? i : n.unique(i))
        },
        andSelf: function () {
            return this.add(this.prevObject)
        }
    });
    n.each({
        parent: function (e) {
            var t = e.parentNode;
            return t && t.nodeType !== 11 ? t : null
        },
        parents: function (e) {
            return n.dir(e, "parentNode")
        },
        parentsUntil: function (e, t, r) {
            return n.dir(e, "parentNode", r)
        },
        next: function (e) {
            return n.nth(e, 2, "nextSibling")
        },
        prev: function (e) {
            return n.nth(e, 2, "previousSibling")
        },
        nextAll: function (e) {
            return n.dir(e, "nextSibling")
        },
        prevAll: function (e) {
            return n.dir(e, "previousSibling")
        },
        nextUntil: function (e, t, r) {
            return n.dir(e, "nextSibling", r)
        },
        prevUntil: function (e, t, r) {
            return n.dir(e, "previousSibling", r)
        },
        siblings: function (e) {
            return n.sibling(e.parentNode.firstChild, e)
        },
        children: function (e) {
            return n.sibling(e.firstChild)
        },
        contents: function (e) {
            return n.nodeName(e, "iframe") ? e.contentDocument || e.contentWindow.document : n.makeArray(e.childNodes)
        }
    }, function (e, t) {
        n.fn[e] = function (r, i) {
            var s = n.map(this, t, r);
            if (!Y.test(e)) {
                i = r
            }
            if (i && typeof i === "string") {
                s = n.filter(i, s)
            }
            s = this.length > 1 ? n.unique(s) : s;
            if ((this.length > 1 || et.test(i)) && Z.test(e)) {
                s = s.reverse()
            }
            return this.pushStack(s, e, w.call(arguments).join(","))
        }
    });
    n.extend({
        filter: function (e, t, r) {
            if (r) {
                e = ":not(" + e + ")"
            }
            return n.find.matches(e, t)
        },
        dir: function (e, r, i) {
            var s = [],
                o = e[r];
            while (o && o.nodeType !== 9 && (i === t || o.nodeType !== 1 || !n(o).is(i))) {
                if (o.nodeType === 1) {
                    s.push(o)
                }
                o = o[r]
            }
            return s
        },
        nth: function (e, t, n, r) {
            t = t || 1;
            var i = 0;
            for (; e; e = e[n]) {
                if (e.nodeType === 1 && ++i === t) {
                    break
                }
            }
            return e
        },
        sibling: function (e, t) {
            var n = [];
            for (; e; e = e.nextSibling) {
                if (e.nodeType === 1 && e !== t) {
                    n.push(e)
                }
            }
            return n
        }
    });
    var rt = / jQuery\d+="(?:\d+|null)"/g,
        it = /^\s+/,
        st = /(<([\w:]+)[^>]*?)\/>/g,
        ot = /^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i,
        ut = /<([\w:]+)/,
        at = /<tbody/i,
        ft = /<|&#?\w+;/,
        lt = /<script|<object|<embed|<option|<style/i,
        ct = /checked\s*(?:[^=]|=\s*.checked.)/i,
        ht = function (e, t, n) {
            return ot.test(n) ? e : t + "></" + n + ">"
        },
        pt = {
            option: [1, "<select multiple='multiple'>", "</select>"],
            legend: [1, "<fieldset>", "</fieldset>"],
            thead: [1, "<table>", "</table>"],
            tr: [2, "<table><tbody>", "</tbody></table>"],
            td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
            col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
            area: [1, "<map>", "</map>"],
            _default: [0, "", ""]
        };
    pt.optgroup = pt.option;
    pt.tbody = pt.tfoot = pt.colgroup = pt.caption = pt.thead;
    pt.th = pt.td;
    if (!n.support.htmlSerialize) {
        pt._default = [1, "div<div>", "</div>"]
    }
    n.fn.extend({
        text: function (e) {
            if (n.isFunction(e)) {
                return this.each(function (t) {
                    var r = n(this);
                    r.text(e.call(this, t, r.text()))
                })
            }
            if (typeof e !== "object" && e !== t) {
                return this.empty().append((this[0] && this[0].ownerDocument || s).createTextNode(e))
            }
            return n.text(this)
        },
        wrapAll: function (e) {
            if (n.isFunction(e)) {
                return this.each(function (t) {
                    n(this).wrapAll(e.call(this, t))
                })
            }
            if (this[0]) {
                var t = n(e, this[0].ownerDocument).eq(0).clone(true);
                if (this[0].parentNode) {
                    t.insertBefore(this[0])
                }
                t.map(function () {
                    var e = this;
                    while (e.firstChild && e.firstChild.nodeType === 1) {
                        e = e.firstChild
                    }
                    return e
                }).append(this)
            }
            return this
        },
        wrapInner: function (e) {
            if (n.isFunction(e)) {
                return this.each(function (t) {
                    n(this).wrapInner(e.call(this, t))
                })
            }
            return this.each(function () {
                var t = n(this),
                    r = t.contents();
                if (r.length) {
                    r.wrapAll(e)
                } else {
                    t.append(e)
                }
            })
        },
        wrap: function (e) {
            return this.each(function () {
                n(this).wrapAll(e)
            })
        },
        unwrap: function () {
            return this.parent().each(function () {
                if (!n.nodeName(this, "body")) {
                    n(this).replaceWith(this.childNodes)
                }
            }).end()
        },
        append: function () {
            return this.domManip(arguments, true, function (e) {
                if (this.nodeType === 1) {
                    this.appendChild(e)
                }
            })
        },
        prepend: function () {
            return this.domManip(arguments, true, function (e) {
                if (this.nodeType === 1) {
                    this.insertBefore(e, this.firstChild)
                }
            })
        },
        before: function () {
            if (this[0] && this[0].parentNode) {
                return this.domManip(arguments, false, function (e) {
                    this.parentNode.insertBefore(e, this)
                })
            } else if (arguments.length) {
                var e = n(arguments[0]);
                e.push.apply(e, this.toArray());
                return this.pushStack(e, "before", arguments)
            }
        },
        after: function () {
            if (this[0] && this[0].parentNode) {
                return this.domManip(arguments, false, function (e) {
                    this.parentNode.insertBefore(e, this.nextSibling)
                })
            } else if (arguments.length) {
                var e = this.pushStack(this, "after", arguments);
                e.push.apply(e, n(arguments[0]).toArray());
                return e
            }
        },
        remove: function (e, t) {
            for (var r = 0, i;
                (i = this[r]) != null; r++) {
                if (!e || n.filter(e, [i]).length) {
                    if (!t && i.nodeType === 1) {
                        n.cleanData(i.getElementsByTagName("*"));
                        n.cleanData([i])
                    }
                    if (i.parentNode) {
                        i.parentNode.removeChild(i)
                    }
                }
            }
            return this
        },
        empty: function () {
            for (var e = 0, t;
                (t = this[e]) != null; e++) {
                if (t.nodeType === 1) {
                    n.cleanData(t.getElementsByTagName("*"))
                }
                while (t.firstChild) {
                    t.removeChild(t.firstChild)
                }
            }
            return this
        },
        clone: function (e) {
            var t = this.map(function () {
                if (!n.support.noCloneEvent && !n.isXMLDoc(this)) {
                    var e = this.outerHTML,
                        t = this.ownerDocument;
                    if (!e) {
                        var r = t.createElement("div");
                        r.appendChild(this.cloneNode(true));
                        e = r.innerHTML
                    }
                    return n.clean([e.replace(rt, "").replace(/=([^="'>\s]+\/)>/g, '="$1">').replace(it, "")], t)[0]
                } else {
                    return this.cloneNode(true)
                }
            });
            if (e === true) {
                dt(this, t);
                dt(this.find("*"), t.find("*"))
            }
            return t
        },
        html: function (e) {
            if (e === t) {
                return this[0] && this[0].nodeType === 1 ? this[0].innerHTML.replace(rt, "") : null
            } else if (typeof e === "string" && !lt.test(e) && (n.support.leadingWhitespace || !it.test(e)) && !pt[(ut.exec(e) || ["", ""])[1].toLowerCase()]) {
                e = e.replace(st, ht);
                try {
                    for (var r = 0, i = this.length; r < i; r++) {
                        if (this[r].nodeType === 1) {
                            n.cleanData(this[r].getElementsByTagName("*"));
                            this[r].innerHTML = e
                        }
                    }
                } catch (s) {
                    this.empty().append(e)
                }
            } else if (n.isFunction(e)) {
                this.each(function (t) {
                    var r = n(this),
                        i = r.html();
                    r.empty().append(function () {
                        return e.call(this, t, i)
                    })
                })
            } else {
                this.empty().append(e)
            }
            return this
        },
        replaceWith: function (e) {
            if (this[0] && this[0].parentNode) {
                if (n.isFunction(e)) {
                    return this.each(function (t) {
                        var r = n(this),
                            i = r.html();
                        r.replaceWith(e.call(this, t, i))
                    })
                }
                if (typeof e !== "string") {
                    e = n(e).detach()
                }
                return this.each(function () {
                    var t = this.nextSibling,
                        r = this.parentNode;
                    n(this).remove();
                    if (t) {
                        n(t).before(e)
                    } else {
                        n(r).append(e)
                    }
                })
            } else {
                return this.pushStack(n(n.isFunction(e) ? e() : e), "replaceWith", e)
            }
        },
        detach: function (e) {
            return this.remove(e, true)
        },
        domManip: function (e, r, i) {
            function p(e, t) {
                return n.nodeName(e, "table") ? e.getElementsByTagName("tbody")[0] || e.appendChild(e.ownerDocument.createElement("tbody")) : e
            }
            var s, o, u = e[0],
                a = [],
                f, l;
            if (!n.support.checkClone && arguments.length === 3 && typeof u === "string" && ct.test(u)) {
                return this.each(function () {
                    n(this).domManip(e, r, i, true)
                })
            }
            if (n.isFunction(u)) {
                return this.each(function (s) {
                    var o = n(this);
                    e[0] = u.call(this, s, r ? o.html() : t);
                    o.domManip(e, r, i)
                })
            }
            if (this[0]) {
                l = u && u.parentNode;
                if (n.support.parentNode && l && l.nodeType === 11 && l.childNodes.length === this.length) {
                    s = {
                        fragment: l
                    }
                } else {
                    s = vt(e, this, a)
                }
                f = s.fragment;
                if (f.childNodes.length === 1) {
                    o = f = f.firstChild
                } else {
                    o = f.firstChild
                } if (o) {
                    r = r && n.nodeName(o, "tr");
                    for (var c = 0, h = this.length; c < h; c++) {
                        i.call(r ? p(this[c], o) : this[c], c > 0 || s.cacheable || this.length > 1 ? f.cloneNode(true) : f)
                    }
                }
                if (a.length) {
                    n.each(a, x)
                }
            }
            return this
        }
    });
    n.fragments = {};
    n.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function (e, t) {
        n.fn[e] = function (r) {
            var i = [],
                s = n(r),
                o = this.length === 1 && this[0].parentNode;
            if (o && o.nodeType === 11 && o.childNodes.length === 1 && s.length === 1) {
                s[t](this[0]);
                return this
            } else {
                for (var u = 0, a = s.length; u < a; u++) {
                    var f = (u > 0 ? this.clone(true) : this).get();
                    n.fn[t].apply(n(s[u]), f);
                    i = i.concat(f)
                }
                return this.pushStack(i, e, s.selector)
            }
        }
    });
    n.extend({
        clean: function (e, t, r, i) {
            t = t || s;
            if (typeof t.createElement === "undefined") {
                t = t.ownerDocument || t[0] && t[0].ownerDocument || s
            }
            var o = [];
            for (var u = 0, a;
                (a = e[u]) != null; u++) {
                if (typeof a === "number") {
                    a += ""
                }
                if (!a) {
                    continue
                }
                if (typeof a === "string" && !ft.test(a)) {
                    a = t.createTextNode(a)
                } else if (typeof a === "string") {
                    a = a.replace(st, ht);
                    var f = (ut.exec(a) || ["", ""])[1].toLowerCase(),
                        l = pt[f] || pt._default,
                        c = l[0],
                        h = t.createElement("div");
                    if (TVA.device == 'philips') h.innerHTML = l[1] + a.replace(/>([^<][^>]+?)</g,function (a,b) 
                    { 
                    	return a.replace(/&(?![A-Za-z]+;|#[0-9]+;)/ig,'&amp;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
                    }) + l[2];
                    else h.innerHTML = l[1] + a + l[2];
                    while (c--) {
                        h = h.lastChild
                    }
                    if (!n.support.tbody) {
                        var p = at.test(a),
                            d = f === "table" && !p ? h.firstChild && h.firstChild.childNodes : l[1] === "<table>" && !p ? h.childNodes : [];
                        for (var v = d.length - 1; v >= 0; --v) {
                            if (n.nodeName(d[v], "tbody") && !d[v].childNodes.length) {
                                d[v].parentNode.removeChild(d[v])
                            }
                        }
                    }
                    if (!n.support.leadingWhitespace && it.test(a)) {
                        h.insertBefore(t.createTextNode(it.exec(a)[0]), h.firstChild)
                    }
                    a = h.childNodes
                }
                if (a.nodeType) {
                    o.push(a)
                } else {
                    o = n.merge(o, a)
                }
            }
            if (r) {
                for (var u = 0; o[u]; u++) {
                    if (i && n.nodeName(o[u], "script") && (!o[u].type || o[u].type.toLowerCase() === "text/javascript")) {
                        i.push(o[u].parentNode ? o[u].parentNode.removeChild(o[u]) : o[u])
                    } else {
                        if (o[u].nodeType === 1) {
                            o.splice.apply(o, [u + 1, 0].concat(n.makeArray(o[u].getElementsByTagName("script"))))
                        }
                        r.appendChild(o[u])
                    }
                }
            }
            return o
        },
        cleanData: function (e) {
            var t, r, i = n.cache,
                s = n.event.special,
                o = n.support.deleteExpando;
            for (var u = 0, a;
                (a = e[u]) != null; u++) {
                r = a[n.expando];
                if (r) {
                    t = i[r];
                    if (t.events) {
                        for (var f in t.events) {
                            if (s[f]) {
                                n.event.remove(a, f)
                            } else {
                                I(a, f, t.handle)
                            }
                        }
                    }
                    if (o) {
                        delete a[n.expando]
                    } else if (a.removeAttribute) {
                        a.removeAttribute(n.expando)
                    }
                    delete i[r]
                }
            }
        }
    });
    var mt = /z-?index|font-?weight|opacity|zoom|line-?height/i,
        gt = /alpha\([^)]*\)/,
        yt = /opacity=([^)]*)/,
        bt = /float/i,
        wt = /-([a-z])/ig,
        Et = /([A-Z])/g,
        St = /^-?\d+(?:px)?$/i,
        xt = /^-?\d/,
        Tt = {
            position: "absolute",
            visibility: "hidden",
            display: "block"
        },
        Nt = ["Left", "Right"],
        Ct = ["Top", "Bottom"],
        kt = s.defaultView && s.defaultView.getComputedStyle,
        Lt = n.support.cssFloat ? "cssFloat" : "styleFloat",
        At = function (e, t) {
            return t.toUpperCase()
        };
    n.fn.css = function (e, r) {
        return T(this, e, r, true, function (e, r, i) {
            if (i === t) {
                return n.curCSS(e, r)
            }
            if (typeof i === "number" && !mt.test(r)) {
                i += "px"
            }
            n.style(e, r, i)
        })
    };
    n.extend({
        style: function (e, r, i) {
            if (!e || e.nodeType === 3 || e.nodeType === 8) {
                return t
            }
            if ((r === "width" || r === "height") && parseFloat(i) < 0) {
                i = t
            }
            var s = e.style || e,
                o = i !== t;
            if (!n.support.opacity && r === "opacity") {
                if (o) {
                    s.zoom = 1;
                    var u = parseInt(i, 10) + "" === "NaN" ? "" : "alpha(opacity=" + i * 100 + ")";
                    var a = s.filter || n.curCSS(e, "filter") || "";
                    s.filter = gt.test(a) ? a.replace(gt, u) : u
                }
                return s.filter && s.filter.indexOf("opacity=") >= 0 ? parseFloat(yt.exec(s.filter)[1]) / 100 + "" : ""
            }
            if (bt.test(r)) {
                r = Lt
            }
            r = r.replace(wt, At);
            if (o) {
                s[r] = i
            }
            return s[r]
        },
        css: function (e, t, r, i) {
            if (t === "width" || t === "height") {
                var s, o = Tt,
                    u = t === "width" ? Nt : Ct;

                function a() {
                    s = t === "width" ? e.offsetWidth : e.offsetHeight;
                    if (i === "border") {
                        return
                    }
                    n.each(u, function () {
                        if (!i) {
                            s -= parseFloat(n.curCSS(e, "padding" + this, true)) || 0
                        }
                        if (i === "margin") {
                            s += parseFloat(n.curCSS(e, "margin" + this, true)) || 0
                        } else {
                            s -= parseFloat(n.curCSS(e, "border" + this + "Width", true)) || 0
                        }
                    })
                }
                if (e.offsetWidth !== 0) {
                    a()
                } else {
                    n.swap(e, o, a)
                }
                return Math.max(0, Math.round(s))
            }
            return n.curCSS(e, t, r)
        },
        curCSS: function (e, t, r) {
            var i, s = e.style,
                o;
            if (!n.support.opacity && t === "opacity" && e.currentStyle) {
                i = yt.test(e.currentStyle.filter || "") ? parseFloat(RegExp.$1) / 100 + "" : "";
                return i === "" ? "1" : i
            }
            if (bt.test(t)) {
                t = Lt
            }
            if (!r && s && s[t]) {
                i = s[t]
            } else if (kt) {
                if (bt.test(t)) {
                    t = "float"
                }
                t = t.replace(Et, "-$1").toLowerCase();
                var u = e.ownerDocument.defaultView;
                if (!u) {
                    return null
                }
                var a = u.getComputedStyle(e, null);
                if (a) {
                    i = a.getPropertyValue(t)
                }
                if (t === "opacity" && i === "") {
                    i = "1"
                }
            } else if (e.currentStyle) {
                var f = t.replace(wt, At);
                i = e.currentStyle[t] || e.currentStyle[f];
                if (!St.test(i) && xt.test(i)) {
                    var l = s.left,
                        c = e.runtimeStyle.left;
                    e.runtimeStyle.left = e.currentStyle.left;
                    s.left = f === "fontSize" ? "1em" : i || 0;
                    i = s.pixelLeft + "px";
                    s.left = l;
                    e.runtimeStyle.left = c
                }
            }
            return i
        },
        swap: function (e, t, n) {
            var r = {};
            for (var i in t) {
                r[i] = e.style[i];
                e.style[i] = t[i]
            }
            n.call(e);
            for (var i in t) {
                e.style[i] = r[i]
            }
        }
    });
    if (n.expr && n.expr.filters) {
        n.expr.filters.hidden = function (e) {
            var t = e.offsetWidth,
                r = e.offsetHeight,
                i = e.nodeName.toLowerCase() === "tr";
            return t === 0 && r === 0 && !i ? true : t > 0 && r > 0 && !i ? false : n.curCSS(e, "display") === "none"
        };
        n.expr.filters.visible = function (e) {
            return !n.expr.filters.hidden(e)
        }
    }
    var Ot = N(),
        Mt = /<script(.|\s)*?\/script>/gi,
        _t = /select|textarea/i,
        Dt = /color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week/i,
        Pt = /=\?(&|$)/,
        Ht = /\?/,
        Bt = /(\?|&)_=.*?(&|$)/,
        jt = /^(\w+:)?\/\/([^\/?#]+)/,
        Ft = /%20/g,
        It = n.fn.load;
    n.fn.extend({
        load: function (e, t, r) {
            if (typeof e !== "string") {
                return It.call(this, e)
            } else if (!this.length) {
                return this
            }
            var i = e.indexOf(" ");
            if (i >= 0) {
                var s = e.slice(i, e.length);
                e = e.slice(0, i)
            }
            var o = "GET";
            if (t) {
                if (n.isFunction(t)) {
                    r = t;
                    t = null
                } else if (typeof t === "object") {
                    t = n.param(t, n.ajaxSettings.traditional);
                    o = "POST"
                }
            }
            var u = this;
            n.ajax({
                url: e,
                type: o,
                dataType: "html",
                data: t,
                complete: function (e, t) {
                    if (t === "success" || t === "notmodified") {
                        u.html(s ? n("<div />").append(e.responseText.replace(Mt, "")).find(s) : e.responseText)
                    }
                    if (r) {
                        u.each(r, [e.responseText, t, e])
                    }
                }
            });
            return this
        },
        serialize: function () {
            return n.param(this.serializeArray())
        },
        serializeArray: function () {
            return this.map(function () {
                return this.elements ? n.makeArray(this.elements) : this
            }).filter(function () {
                return this.name && !this.disabled && (this.checked || _t.test(this.nodeName) || Dt.test(this.type))
            }).map(function (e, t) {
                var r = n(this).val();
                return r == null ? null : n.isArray(r) ? n.map(r, function (e, n) {
                    return {
                        name: t.name,
                        value: e
                    }
                }) : {
                    name: t.name,
                    value: r
                }
            }).get()
        }
    });
    n.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function (e, t) {
        n.fn[t] = function (e) {
            return this.bind(t, e)
        }
    });
    n.extend({
        get: function (e, t, r, i) {
            if (n.isFunction(t)) {
                i = i || r;
                r = t;
                t = null
            }
            return n.ajax({
                type: "GET",
                url: e,
                data: t,
                success: r,
                dataType: i
            })
        },
        getScript: function (e, t) {
            return n.get(e, null, t, "script")
        },
        getJSON: function (e, t, r) {
            return n.get(e, t, r, "json")
        },
        post: function (e, t, r, i) {
            if (n.isFunction(t)) {
                i = i || r;
                r = t;
                t = {}
            }
            return n.ajax({
                type: "POST",
                url: e,
                data: t,
                success: r,
                dataType: i
            })
        },
        ajaxSetup: function (e) {
            n.extend(n.ajaxSettings, e)
        },
        ajaxSettings: {
            url: location.href,
            global: true,
            type: "GET",
            contentType: "application/x-www-form-urlencoded",
            processData: true,
            async: true,
            xhr: e.XMLHttpRequest && (e.location.protocol !== "file:" || !e.ActiveXObject) ? function () {
                return new e.XMLHttpRequest
            } : function () {
                try {
                    return new e.ActiveXObject("Microsoft.XMLHTTP")
                } catch (t) {}
            },
            accepts: {
                xml: "application/xml, text/xml",
                html: "text/html",
                script: "text/javascript, application/javascript",
                json: "application/json, text/javascript",
                text: "text/plain",
                _default: "*/*"
            }
        },
        lastModified: {},
        etag: {},
        ajax: function (r) {
            function x() {
                if (i.success) {
                    i.success.call(f, a, u, b)
                }
                if (i.global) {
                    C("ajaxSuccess", [b, i])
                }
            }

            function T() {
                if (i.complete) {
                    i.complete.call(f, b, u)
                }
                if (i.global) {
                    C("ajaxComplete", [b, i])
                }
                if (i.global && !--n.active) {
                    n.event.trigger("ajaxStop")
                }
            }

            function C(e, t) {
                (i.context ? n(i.context) : n.event).trigger(e, t)
            }
            var i = n.extend(true, {}, n.ajaxSettings, r);
            var o, u, a, f = r && r.context || i,
                l = i.type.toUpperCase();
            if (i.data && i.processData && typeof i.data !== "string") {
                i.data = n.param(i.data, i.traditional)
            }
            if (i.dataType === "jsonp") {
                if (l === "GET") {
                    if (!Pt.test(i.url)) {
                        i.url += (Ht.test(i.url) ? "&" : "?") + (i.jsonp || "callback") + "=?"
                    }
                } else if (!i.data || !Pt.test(i.data)) {
                    i.data = (i.data ? i.data + "&" : "") + (i.jsonp || "callback") + "=?"
                }
                i.dataType = "json"
            }
            if (i.dataType === "json" && (i.data && Pt.test(i.data) || Pt.test(i.url))) {
                o = i.jsonpCallback || "jsonp" + Ot++;
                if (i.data) {
                    i.data = (i.data + "").replace(Pt, "=" + o + "$1")
                }
                i.url = i.url.replace(Pt, "=" + o + "$1");
                i.dataType = "script";
                e[o] = e[o] || function (n) {
                    a = n;
                    x();
                    T();
                    e[o] = t;
                    try {
                        delete e[o]
                    } catch (r) {}
                    if (v) {
                        v.removeChild(m)
                    }
                }
            }
            if (i.dataType === "script" && i.cache === null) {
                i.cache = false
            }
            if (i.cache === false && l === "GET") {
                var c = N();
                var h = i.url.replace(Bt, "$1_=" + c + "$2");
                i.url = h + (h === i.url ? (Ht.test(i.url) ? "&" : "?") + "_=" + c : "")
            }
            if (i.data && l === "GET") {
                i.url += (Ht.test(i.url) ? "&" : "?") + i.data
            }
            if (i.global && !(n.active++)) {
                n.event.trigger("ajaxStart")
            }
            var p = jt.exec(i.url),
                d = p && (p[1] && p[1] !== location.protocol || p[2] !== location.host);
            if (i.dataType === "script" && l === "GET" && d) {
                var v = s.getElementsByTagName("head")[0] || s.documentElement;
                var m = s.createElement("script");
                m.src = i.url;
                if (i.scriptCharset) {
                    m.charset = i.scriptCharset
                }
                if (!o) {
                    var g = false;
                    m.onload = m.onreadystatechange = function () {
                        if (!g && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                            g = true;
                            x();
                            T();
                            m.onload = m.onreadystatechange = null;
                            if (v && m.parentNode) {
                                v.removeChild(m)
                            }
                        }
                    }
                }
                v.insertBefore(m, v.firstChild);
                return t
            }
            var y = false;
            var b = i.xhr();
            if (!b) {
                return
            }
            if (i.username) {
                b.open(l, i.url, i.async, i.username, i.password)
            } else {
                b.open(l, i.url, i.async)
            }
            try {
                if (i.data || r && r.contentType) {
                    b.setRequestHeader("Content-Type", i.contentType)
                }
                if (i.ifModified) {
                    if (n.lastModified[i.url]) {
                        b.setRequestHeader("If-Modified-Since", n.lastModified[i.url])
                    }
                    if (n.etag[i.url]) {
                        b.setRequestHeader("If-None-Match", n.etag[i.url])
                    }
                }
                if (!d) {
                    b.setRequestHeader("X-Requested-With", "XMLHttpRequest")
                }
                b.setRequestHeader("Accept", i.dataType && i.accepts[i.dataType] ? i.accepts[i.dataType] + ", */*" : i.accepts._default)
            } catch (w) {}
            if (i.beforeSend && i.beforeSend.call(f, b, i) === false) {
                if (i.global && !--n.active) {
                    n.event.trigger("ajaxStop")
                }
                b.abort();
                return false
            }
            if (i.global) {
                C("ajaxSend", [b, i])
            }
            var E = b.onreadystatechange = function (e) {
                if (!b || b.readyState === 0 || e === "abort") {
                    if (!y) {
                        T()
                    }
                    y = true;
                    if (b) {
                        b.onreadystatechange = n.noop
                    }
                } else if (!y && b && (b.readyState === 4 || e === "timeout")) {
                    y = true;
                    b.onreadystatechange = n.noop;
                    u = e === "timeout" ? "timeout" : !n.httpSuccess(b) ? "error" : i.ifModified && n.httpNotModified(b, i.url) ? "notmodified" : "success";
                    var t;
                    if (u === "success") {
                        try {
                            a = n.httpData(b, i.dataType, i)
                        } catch (r) {
                            u = "parsererror";
                            t = r
                        }
                    }
                    if (u === "success" || u === "notmodified") {
                        if (!o) {
                            x()
                        }
                    } else {
                        n.handleError(i, b, u, t)
                    }
                    T();
                    if (e === "timeout") {
                        b.abort()
                    }
                    if (i.async) {
                        b = null
                    }
                }
            };
            try {
                var S = b.abort;
                b.abort = function () {
                    if (b) {
                        S.call(b)
                    }
                    E("abort")
                }
            } catch (w) {}
            if (i.async && i.timeout > 0) {
                setTimeout(function () {
                    if (b && !y) {
                        E("timeout")
                    }
                }, i.timeout)
            }
            try {
                b.send(l === "POST" || l === "PUT" || l === "DELETE" ? i.data : null)
            } catch (w) {
                n.handleError(i, b, null, w);
                T()
            }
            if (!i.async) {
                E()
            }
            return b
        },
        handleError: function (e, t, r, i) {
            if (e.error) {
                e.error.call(e.context || e, t, r, i)
            }
            if (e.global) {
                (e.context ? n(e.context) : n.event).trigger("ajaxError", [t, e, i])
            }
        },
        active: 0,
        httpSuccess: function (e) {
            try {
                return !e.status && location.protocol === "file:" || e.status >= 200 && e.status < 300 || e.status === 304 || e.status === 1223 || e.status === 0
            } catch (t) {}
            return false
        },
        httpNotModified: function (e, t) {
            var r = e.getResponseHeader("Last-Modified"),
                i = e.getResponseHeader("Etag");
            if (r) {
                n.lastModified[t] = r
            }
            if (i) {
                n.etag[t] = i
            }
            return e.status === 304 || e.status === 0
        },
        httpData: function (e, t, r) {
            var i = e.getResponseHeader("content-type") || "",
                s = t === "xml" || !t && i.indexOf("xml") >= 0,
                o = s ? e.responseXML : e.responseText;
            if (s && o.documentElement.nodeName === "parsererror") {
                n.error("parsererror")
            }
            if (r && r.dataFilter) {
                o = r.dataFilter(o, t)
            }
            if (typeof o === "string") {
                if (t === "json" || !t && i.indexOf("json") >= 0) {
                    o = n.parseJSON(o)
                } else if (t === "script" || !t && i.indexOf("javascript") >= 0) {
                    n.globalEval(o)
                }
            }
            return o
        },
        param: function (e, r) {
            function o(e, t) {
                if (n.isArray(t)) {
                    n.each(t, function (t, i) {
                        if (r || /\[\]$/.test(e)) {
                            u(e, i)
                        } else {
                            o(e + "[" + (typeof i === "object" || n.isArray(i) ? t : "") + "]", i)
                        }
                    })
                } else if (!r && t != null && typeof t === "object") {
                    n.each(t, function (t, n) {
                        o(e + "[" + t + "]", n)
                    })
                } else {
                    u(e, t)
                }
            }

            function u(e, t) {
                t = n.isFunction(t) ? t() : t;
                i[i.length] = encodeURIComponent(e) + "=" + encodeURIComponent(t)
            }
            var i = [];
            if (r === t) {
                r = n.ajaxSettings.traditional
            }
            if (n.isArray(e) || e.jquery) {
                n.each(e, function () {
                    u(this.name, this.value)
                })
            } else {
                for (var s in e) {
                    o(s, e[s])
                }
            }
            return i.join("&").replace(Ft, "+")
        }
    });
    var qt = {},
        Rt = /toggle|show|hide/,
        Ut = /^([+-]=)?([\d+-.]+)(.*)$/,
        zt, Wt = [
            ["height", "marginTop", "marginBottom", "paddingTop", "paddingBottom"],
            ["width", "marginLeft", "marginRight", "paddingLeft", "paddingRight"],
            ["opacity"]
        ];
    n.fn.extend({
        show: function (e, t) {
            //n("<div id='maple'/>").appendTo("body").remove();
            if (e || e === 0) {
                return this.animate(Xt("show", 3), e, t)
            } else {
                for (var r = 0, i = this.length; r < i; r++) {
                    var s = n.data(this[r], "olddisplay");
                    this[r].style.display = s || "";
                    if (n.css(this[r], "display") === "none") {
                        var o = this[r].nodeName,
                            u;
                        if (qt[o]) {
                            u = qt[o]
                        } else {
                            var a = n("<" + o + " />").appendTo("body");
                            u = a.css("display");
                            if (u === "none") {
                                u = "block"
                            }
                            a.remove();
                            qt[o] = u
                        }
                        n.data(this[r], "olddisplay", u)
                    }
                }
                for (var f = 0, l = this.length; f < l; f++) {
                    this[f].style.display = n.data(this[f], "olddisplay") || ""
                }
                return this
            }
        },
        hide: function (e, t) {
            //n("<div id='maple'/>").appendTo("body").remove();
            if (e || e === 0) {
                return this.animate(Xt("hide", 3), e, t)
            } else {
                for (var r = 0, i = this.length; r < i; r++) {
                    var s = n.data(this[r], "olddisplay");
                    if (!s && s !== "none") {
                        n.data(this[r], "olddisplay", n.css(this[r], "display"))
                    }
                }
                for (var o = 0, u = this.length; o < u; o++) {
                    this[o].style.display = "none"
                }
                return this
            }
        },
        _toggle: n.fn.toggle,
        toggle: function (e, t) {
            var r = typeof e === "boolean";
            if (n.isFunction(e) && n.isFunction(t)) {
                this._toggle.apply(this, arguments)
            } else if (e == null || r) {
                this.each(function () {
                    var t = r ? e : n(this).is(":hidden");
                    n(this)[t ? "show" : "hide"]()
                })
            } else {
                this.animate(Xt("toggle", 3), e, t)
            }
            return this
        },
        fadeTo: function (e, t, n) {
            return this.filter(":hidden").css("opacity", 0).show().end().animate({
                opacity: t
            }, e, n)
        },
        animate: function (e, t, r, i) {
            var s = n.speed(t, r, i);
            if (n.isEmptyObject(e)) {
                return this.each(s.complete)
            }
            return this[s.queue === false ? "each" : "queue"](function () {
                var t = n.extend({}, s),
                    r, i = this.nodeType === 1 && n(this).is(":hidden"),
                    o = this;
                for (r in e) {
                    var u = r.replace(wt, At);
                    if (r !== u) {
                        e[u] = e[r];
                        delete e[r];
                        r = u
                    }
                    if (e[r] === "hide" && i || e[r] === "show" && !i) {
                        return t.complete.call(this)
                    }
                    if ((r === "height" || r === "width") && this.style) {
                        t.display = n.css(this, "display");
                        t.overflow = this.style.overflow
                    }
                    if (n.isArray(e[r])) {
                        (t.specialEasing = t.specialEasing || {})[r] = e[r][1];
                        e[r] = e[r][0]
                    }
                }
                if (t.overflow != null) {
                    this.style.overflow = "hidden"
                }
                t.curAnim = n.extend({}, e);
                n.each(e, function (r, s) {
                    var u = new n.fx(o, t, r);
                    if (Rt.test(s)) {
                        u[s === "toggle" ? i ? "show" : "hide" : s](e)
                    } else {
                        var a = Ut.exec(s),
                            f = u.cur(true) || 0;
                        if (a) {
                            var l = parseFloat(a[2]),
                                c = a[3] || "px";
                            if (c !== "px") {
                                o.style[r] = (l || 1) + c;
                                f = (l || 1) / u.cur(true) * f;
                                o.style[r] = f + c
                            }
                            if (a[1]) {
                                l = (a[1] === "-=" ? -1 : 1) * l + f
                            }
                            u.custom(f, l, c)
                        } else {
                            u.custom(f, s, "")
                        }
                    }
                });
                return true
            })
        },
        stop: function (e, t) {
            var r = n.timers;
            if (e) {
                this.queue([])
            }
            this.each(function () {
                for (var e = r.length - 1; e >= 0; e--) {
                    if (r[e].elem === this) {
                        if (t) {
                            r[e](true)
                        }
                        r.splice(e, 1)
                    }
                }
            });
            if (!t) {
                this.dequeue()
            }
            return this
        }
    });
    n.each({
        slideDown: Xt("show", 1),
        slideUp: Xt("hide", 1),
        slideToggle: Xt("toggle", 1),
        fadeIn: {
            opacity: "show"
        },
        fadeOut: {
            opacity: "hide"
        }
    }, function (e, t) {
        n.fn[e] = function (e, n) {
            return this.animate(t, e, n)
        }
    });
    n.extend({
        speed: function (e, t, r) {
            var i = e && typeof e === "object" ? e : {
                complete: r || !r && t || n.isFunction(e) && e,
                duration: e,
                easing: r && t || t && !n.isFunction(t) && t
            };
            i.duration = n.fx.off ? 0 : typeof i.duration === "number" ? i.duration : n.fx.speeds[i.duration] || n.fx.speeds._default;
            i.old = i.complete;
            i.complete = function () {
                if (i.queue !== false) {
                    n(this).dequeue()
                }
                if (n.isFunction(i.old)) {
                    i.old.call(this)
                }
            };
            return i
        },
        easing: {
            linear: function (e, t, n, r) {
                return n + r * e
            },
            swing: function (e, t, n, r) {
                return (-Math.cos(e * Math.PI) / 2 + .5) * r + n
            }
        },
        timers: [],
        fx: function (e, t, n) {
            this.options = t;
            this.elem = e;
            this.prop = n;
            if (!t.orig) {
                t.orig = {}
            }
        }
    });
    n.fx.prototype = {
        update: function () {
            if (this.options.step) {
                this.options.step.call(this.elem, this.now, this)
            }(n.fx.step[this.prop] || n.fx.step._default)(this);
            if ((this.prop === "height" || this.prop === "width") && this.elem.style) {
                this.elem.style.display = "block"
            }
        },
        cur: function (e) {
            if (this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null)) {
                return this.elem[this.prop]
            }
            var t = parseFloat(n.css(this.elem, this.prop, e));
            return t && t > -1e4 ? t : parseFloat(n.curCSS(this.elem, this.prop)) || 0
        },
        custom: function (e, t, r) {
            function s(e) {
                return i.step(e)
            }
            this.startTime = N();
            this.start = e;
            this.end = t;
            this.unit = r || this.unit || "px";
            this.now = this.start;
            this.pos = this.state = 0;
            var i = this;
            s.elem = this.elem;
            if (s() && n.timers.push(s) && !zt) {
                zt = setInterval(n.fx.tick, 13)
            }
        },
        show: function () {
            //n("<div id='maple'/>").appendTo("body").remove();
            this.options.orig[this.prop] = n.style(this.elem, this.prop);
            this.options.show = true;
            this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());
            n(this.elem).show()
        },
        hide: function () {
            //n("<div id='maple'/>").appendTo("body").remove();
            this.options.orig[this.prop] = n.style(this.elem, this.prop);
            this.options.hide = true;
            this.custom(this.cur(), 0)
        },
        step: function (e) {
            var t = N(),
                r = true;
            if (e || t >= this.options.duration + this.startTime) {
                this.now = this.end;
                this.pos = this.state = 1;
                this.update();
                this.options.curAnim[this.prop] = true;
                for (var i in this.options.curAnim) {
                    if (this.options.curAnim[i] !== true) {
                        r = false
                    }
                }
                if (r) {
                    if (this.options.display != null) {
                        this.elem.style.overflow = this.options.overflow;
                        var s = n.data(this.elem, "olddisplay");
                        this.elem.style.display = s ? s : this.options.display;
                        if (n.css(this.elem, "display") === "none") {
                            this.elem.style.display = "block"
                        }
                    }
                    if (this.options.hide) {
                        n(this.elem).hide()
                    }
                    if (this.options.hide || this.options.show) {
                        for (var o in this.options.curAnim) {
                            n.style(this.elem, o, this.options.orig[o])
                        }
                    }
                    this.options.complete.call(this.elem)
                }
                return false
            } else {
                var u = t - this.startTime;
                this.state = u / this.options.duration;
                var a = this.options.specialEasing && this.options.specialEasing[this.prop];
                var f = this.options.easing || (n.easing.swing ? "swing" : "linear");
                this.pos = n.easing[a || f](this.state, u, 0, 1, this.options.duration);
                this.now = this.start + (this.end - this.start) * this.pos;
                this.update()
            }
            return true
        }
    };
    n.extend(n.fx, {
        tick: function () {
            var e = n.timers;
            for (var t = 0; t < e.length; t++) {
                if (!e[t]()) {
                    e.splice(t--, 1)
                }
            }
            if (!e.length) {
                n.fx.stop()
            }
        },
        stop: function () {
            clearInterval(zt);
            zt = null
        },
        speeds: {
            slow: 600,
            fast: 200,
            _default: 400
        },
        step: {
            opacity: function (e) {
                n.style(e.elem, "opacity", e.now)
            },
            _default: function (e) {
                if (e.elem.style && e.elem.style[e.prop] != null) {
                    e.elem.style[e.prop] = (e.prop === "width" || e.prop === "height" ? Math.max(0, e.now) : e.now) + e.unit
                } else {
                    e.elem[e.prop] = e.now
                }
            }
        }
    });
    if (n.expr && n.expr.filters) {
        n.expr.filters.animated = function (e) {
            return n.grep(n.timers, function (t) {
                return e === t.elem
            }).length
        }
    }
    if ("getBoundingClientRect" in s.documentElement) {
        n.fn.offset = function (e) {
            var t = this[0];
            if (e) {
                return this.each(function (t) {
                    n.offset.setOffset(this, e, t)
                })
            }
            if (!t || !t.ownerDocument) {
                return null
            }
            if (t === t.ownerDocument.body) {
                return n.offset.bodyOffset(t)
            }
            var r = t.getBoundingClientRect(),
                i = t.ownerDocument,
                s = i.body,
                o = i.documentElement,
                u = o.clientTop || s.clientTop || 0,
                a = o.clientLeft || s.clientLeft || 0,
                f = r.top + (self.pageYOffset || n.support.boxModel && o.scrollTop || s.scrollTop) - u,
                l = r.left + (self.pageXOffset || n.support.boxModel && o.scrollLeft || s.scrollLeft) - a;
            return {
                top: f,
                left: l
            }
        }
    } else {
        n.fn.offset = function (e) {
            var t = this[0];
            if (e) {
                return this.each(function (t) {
                    n.offset.setOffset(this, e, t)
                })
            }
            if (!t || !t.ownerDocument) {
                return null
            }
            if (t === t.ownerDocument.body) {
                return n.offset.bodyOffset(t)
            }
            n.offset.initialize();
            var r = t.offsetParent,
                i = t,
                s = t.ownerDocument,
                o, u = s.documentElement,
                a = s.body,
                f = s.defaultView,
                l = f ? f.getComputedStyle(t, null) : t.currentStyle,
                c = t.offsetTop,
                h = t.offsetLeft;
            while ((t = t.parentNode) && t !== a && t !== u) {
                if (n.offset.supportsFixedPosition && l.position === "fixed") {
                    break
                }
                o = f ? f.getComputedStyle(t, null) : t.currentStyle;
                c -= t.scrollTop;
                h -= t.scrollLeft;
                if (t === r) {
                    c += t.offsetTop;
                    h += t.offsetLeft;
                    if (n.offset.doesNotAddBorder && !(n.offset.doesAddBorderForTableAndCells && /^t(able|d|h)$/i.test(t.nodeName))) {
                        c += parseFloat(o.borderTopWidth) || 0;
                        h += parseFloat(o.borderLeftWidth) || 0
                    }
                    i = r, r = t.offsetParent
                }
                if (n.offset.subtractsBorderForOverflowNotVisible && o.overflow !== "visible") {
                    c += parseFloat(o.borderTopWidth) || 0;
                    h += parseFloat(o.borderLeftWidth) || 0
                }
                l = o
            }
            if (l.position === "relative" || l.position === "static") {
                c += a.offsetTop;
                h += a.offsetLeft
            }
            if (n.offset.supportsFixedPosition && l.position === "fixed") {
                c += Math.max(u.scrollTop, a.scrollTop);
                h += Math.max(u.scrollLeft, a.scrollLeft)
            }
            return {
                top: c,
                left: h
            }
        }
    }
    n.offset = {
        initialize: function () {
            var e = s.body,
                t = s.createElement("div"),
                r, i, o, u, a = parseFloat(n.curCSS(e, "marginTop", true)) || 0,
                f = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";
            n.extend(t.style, {
                position: "absolute",
                top: 0,
                left: 0,
                margin: 0,
                border: 0,
                width: "1px",
                height: "1px",
                visibility: "hidden"
            });
            t.innerHTML = f;
            e.insertBefore(t, e.firstChild);
            r = t.firstChild;
            i = r.firstChild;
            u = r.nextSibling.firstChild.firstChild;
            this.doesNotAddBorder = i.offsetTop !== 5;
            this.doesAddBorderForTableAndCells = u.offsetTop === 5;
            i.style.position = "fixed", i.style.top = "20px";
            this.supportsFixedPosition = i.offsetTop === 20 || i.offsetTop === 15;
            i.style.position = i.style.top = "";
            r.style.overflow = "hidden", r.style.position = "relative";
            this.subtractsBorderForOverflowNotVisible = i.offsetTop === -5;
            this.doesNotIncludeMarginInBodyOffset = e.offsetTop !== a;
            e.removeChild(t);
            e = t = r = i = o = u = null;
            n.offset.initialize = n.noop
        },
        bodyOffset: function (e) {
            var t = e.offsetTop,
                r = e.offsetLeft;
            n.offset.initialize();
            if (n.offset.doesNotIncludeMarginInBodyOffset) {
                t += parseFloat(n.curCSS(e, "marginTop", true)) || 0;
                r += parseFloat(n.curCSS(e, "marginLeft", true)) || 0
            }
            return {
                top: t,
                left: r
            }
        },
        setOffset: function (e, t, r) {
            if (/static/.test(n.curCSS(e, "position"))) {
                e.style.position = "relative"
            }
            var i = n(e),
                s = i.offset(),
                o = parseInt(n.curCSS(e, "top", true), 10) || 0,
                u = parseInt(n.curCSS(e, "left", true), 10) || 0;
            if (n.isFunction(t)) {
                t = t.call(e, r, s)
            }
            var a = {
                top: t.top - s.top + o,
                left: t.left - s.left + u
            };
            if ("using" in t) {
                t.using.call(e, a)
            } else {
                i.css(a)
            }
        }
    };
    n.fn.extend({
        position: function () {
            if (!this[0]) {
                return null
            }
            var e = this[0],
                t = this.offsetParent(),
                r = this.offset(),
                i = /^body|html$/i.test(t[0].nodeName) ? {
                    top: 0,
                    left: 0
                } : t.offset();
            r.top -= parseFloat(n.curCSS(e, "marginTop", true)) || 0;
            r.left -= parseFloat(n.curCSS(e, "marginLeft", true)) || 0;
            i.top += parseFloat(n.curCSS(t[0], "borderTopWidth", true)) || 0;
            i.left += parseFloat(n.curCSS(t[0], "borderLeftWidth", true)) || 0;
            return {
                top: r.top - i.top,
                left: r.left - i.left
            }
        },
        offsetParent: function () {
            return this.map(function () {
                var e = this.offsetParent || s.body;
                while (e && !/^body|html$/i.test(e.nodeName) && n.css(e, "position") === "static") {
                    e = e.offsetParent
                }
                return e
            })
        }
    });
    n.each(["Left", "Top"], function (e, r) {
        var i = "scroll" + r;
        n.fn[i] = function (r) {
            var s = this[0],
                o;
            if (!s) {
                return null
            }
            if (r !== t) {
                return this.each(function () {
                    o = Vt(this);
                    if (o) {
                        o.scrollTo(!e ? r : n(o).scrollLeft(), e ? r : n(o).scrollTop())
                    } else {
                        this[i] = r
                    }
                })
            } else {
                o = Vt(s);
                return o ? "pageXOffset" in o ? o[e ? "pageYOffset" : "pageXOffset"] : n.support.boxModel && o.document.documentElement[i] || o.document.body[i] : s[i]
            }
        }
    });
    n.each(["Height", "Width"], function (e, r) {
        var i = r.toLowerCase();
        n.fn["inner" + r] = function () {
            return this[0] ? n.css(this[0], i, false, "padding") : null
        };
        n.fn["outer" + r] = function (e) {
            return this[0] ? n.css(this[0], i, false, e ? "margin" : "border") : null
        };
        n.fn[i] = function (e) {
            var s = this[0];
            if (!s) {
                return e == null ? null : this
            }
            if (n.isFunction(e)) {
                return this.each(function (t) {
                    var r = n(this);
                    r[i](e.call(this, t, r[i]()))
                })
            }
            return "scrollTo" in s && s.document ? s.document.compatMode === "CSS1Compat" && s.document.documentElement["client" + r] || s.document.body["client" + r] : s.nodeType === 9 ? Math.max(s.documentElement["client" + r], s.body["scroll" + r], s.documentElement["scroll" + r], s.body["offset" + r], s.documentElement["offset" + r]) : e === t ? n.css(s, i) : this.css(i, typeof e === "string" ? e : e + "px")
        }
    });
    e.jQuery = e.$ = n
})(window)